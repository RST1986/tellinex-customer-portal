const VALID_STATES = new Set(['unknown', 'healthy', 'degraded', 'outage'])
const MAX_FUTURE_CLOCK_SKEW_MS = 60 * 1000

function parseTime(value) {
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : null
}

function isFreshApprovedSignal(signal, nowMs) {
  if (!signal?.source || signal.authoritative !== true || signal.customerScoped !== true) return false
  if (!VALID_STATES.has(signal.state)) return false

  const observedAtMs = parseTime(signal.observedAt)
  const validUntilMs = parseTime(signal.validUntil)
  if (observedAtMs == null || validUntilMs == null) return false
  if (observedAtMs > nowMs + MAX_FUTURE_CLOCK_SKEW_MS) return false
  if (validUntilMs <= nowMs || validUntilMs <= observedAtMs) return false
  return true
}

function unknown(reason, evidence = []) {
  return {
    state: 'unknown',
    reason,
    evidenceSources: evidence.map(signal => signal.source),
    startedAt: null,
    estimatedResolutionAt: null,
  }
}

export function deriveCustomerNetworkHealth({
  bindingValid,
  signals = [],
  requiredSources = [],
  nowMs = Date.now(),
} = {}) {
  if (bindingValid !== true) return unknown('authoritative_binding_missing')

  const approved = signals.filter(signal => isFreshApprovedSignal(signal, nowMs))
  if (!approved.length) return unknown('fresh_operational_evidence_missing')

  const bySource = new Map(approved.map(signal => [signal.source, signal]))
  const missingRequired = requiredSources.filter(source => !bySource.has(source))
  if (missingRequired.length) {
    return unknown('required_source_missing', approved)
  }

  const requiredEvidence = requiredSources.length
    ? requiredSources.map(source => bySource.get(source))
    : approved

  if (requiredEvidence.some(signal => signal.state === 'unknown')) {
    return unknown('required_source_unknown', requiredEvidence)
  }

  const outage = approved.find(signal => signal.state === 'outage')
  if (outage) {
    return {
      state: 'outage',
      reason: outage.reason || 'authoritative_outage_evidence',
      evidenceSources: approved.map(signal => signal.source),
      startedAt: outage.startedAt ?? outage.observedAt ?? null,
      estimatedResolutionAt: outage.estimatedResolutionAt ?? null,
    }
  }

  const degraded = approved.find(signal => signal.state === 'degraded')
  if (degraded) {
    return {
      state: 'degraded',
      reason: degraded.reason || 'authoritative_degraded_evidence',
      evidenceSources: approved.map(signal => signal.source),
      startedAt: degraded.startedAt ?? degraded.observedAt ?? null,
      estimatedResolutionAt: degraded.estimatedResolutionAt ?? null,
    }
  }

  if (requiredEvidence.length && requiredEvidence.every(signal => signal.state === 'healthy')) {
    return {
      state: 'healthy',
      reason: 'positive_required_sources_healthy',
      evidenceSources: approved.map(signal => signal.source),
      startedAt: null,
      estimatedResolutionAt: null,
    }
  }

  return unknown('positive_health_evidence_insufficient', approved)
}

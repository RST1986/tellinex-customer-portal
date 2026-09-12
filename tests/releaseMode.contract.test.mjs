import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateReleaseMode } from '../scripts/check-release-mode.mjs'

test('ordinary build fails closed when MyTellinex Next is not explicit', () => {
  assert.deepEqual(evaluateReleaseMode({}), {
    ok: false,
    mode: 'blocked',
    reason: 'VITE_MYTELLINEX_NEXT must be explicitly true for an ordinary build',
  })
})

test('ordinary build rejects an explicit false Next flag', () => {
  const result = evaluateReleaseMode({ VITE_MYTELLINEX_NEXT: 'false' })
  assert.equal(result.ok, false)
  assert.equal(result.mode, 'blocked')
})

test('Next build is release-eligible when explicitly enabled', () => {
  const result = evaluateReleaseMode({ VITE_MYTELLINEX_NEXT: 'true' })
  assert.equal(result.ok, true)
  assert.equal(result.mode, 'next')
})

test('legacy build requires an explicit controlled-test override', () => {
  const result = evaluateReleaseMode({
    VITE_MYTELLINEX_NEXT: 'false',
    MYTELLINEX_ALLOW_LEGACY_BUILD: 'true',
  })
  assert.equal(result.ok, true)
  assert.equal(result.mode, 'legacy-test-only')
})

test('legacy override is exact and does not accept truthy variants', () => {
  for (const value of ['1', 'yes', 'TRUE', 'True']) {
    const result = evaluateReleaseMode({
      VITE_MYTELLINEX_NEXT: 'false',
      MYTELLINEX_ALLOW_LEGACY_BUILD: value,
    })
    assert.equal(result.ok, false, `override ${value} must remain denied`)
  }
})

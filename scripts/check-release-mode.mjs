import { pathToFileURL } from 'node:url'

export function evaluateReleaseMode(env = process.env) {
  const nextEnabled = env.VITE_MYTELLINEX_NEXT === 'true'
  const controlledLegacyBuild = env.MYTELLINEX_ALLOW_LEGACY_BUILD === 'true'

  if (nextEnabled) {
    return { ok: true, mode: 'next', reason: 'VITE_MYTELLINEX_NEXT=true' }
  }

  if (controlledLegacyBuild) {
    return {
      ok: true,
      mode: 'legacy-test-only',
      reason: 'MYTELLINEX_ALLOW_LEGACY_BUILD=true',
    }
  }

  return {
    ok: false,
    mode: 'blocked',
    reason: 'VITE_MYTELLINEX_NEXT must be explicitly true for an ordinary build',
  }
}

export function enforceReleaseMode(env = process.env) {
  const result = evaluateReleaseMode(env)
  if (!result.ok) {
    console.error('MYTELLINEX_RELEASE_GATE=FAIL')
    console.error(result.reason)
    console.error(
      'Legacy builds are allowed only in controlled test lanes with MYTELLINEX_ALLOW_LEGACY_BUILD=true.',
    )
    process.exitCode = 1
    return result
  }

  console.log('MYTELLINEX_RELEASE_GATE=PASS')
  console.log(`MYTELLINEX_RELEASE_MODE=${result.mode}`)
  return result
}

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) enforceReleaseMode()

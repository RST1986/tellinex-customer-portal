import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

const script = new URL('../scripts/check-production-release-config.mjs', import.meta.url)

function run(env) {
  return spawnSync(process.execPath, [script.pathname], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  })
}

test('production release gate passes only when MyTellinex Next is explicitly enabled', () => {
  const result = run({
    TELLINEX_RELEASE_INTENT: 'production',
    VITE_MYTELLINEX_NEXT: 'true',
  })

  assert.equal(result.status, 0)
  assert.match(result.stdout, /MYTELLINEX_PRODUCTION_RELEASE_MODE_GATE=PASS/)
})

test('production release gate fails closed when MyTellinex Next is false', () => {
  const result = run({
    TELLINEX_RELEASE_INTENT: 'production',
    VITE_MYTELLINEX_NEXT: 'false',
  })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /Production release denied/)
})

test('production release gate rejects an ambiguous release intent', () => {
  const result = run({
    TELLINEX_RELEASE_INTENT: 'preview',
    VITE_MYTELLINEX_NEXT: 'true',
  })

  assert.equal(result.status, 2)
  assert.match(result.stderr, /TELLINEX_RELEASE_INTENT must be production/)
})

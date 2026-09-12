import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

const FORBIDDEN_TRACKED_PATHS = [
  'node_modules',
  'node_modules/**',
  'dist',
  'dist/**',
]

test('generated dependencies and build output are not tracked by Git', () => {
  const result = spawnSync(
    'git',
    ['ls-files', '-z', '--', ...FORBIDDEN_TRACKED_PATHS],
    { cwd: new URL('..', import.meta.url), encoding: 'utf8' },
  )

  assert.equal(
    result.status,
    0,
    `git ls-files failed: ${result.stderr || `exit ${result.status}`}`,
  )

  const tracked = result.stdout.split('\0').filter(Boolean)
  assert.deepEqual(
    tracked,
    [],
    `generated paths must not be committed:\n${tracked.join('\n')}`,
  )
})

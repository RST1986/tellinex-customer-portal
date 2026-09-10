import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const manifestPath = path.join(root, 'src/next/registry/ADOPTION.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const errors = []

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8')
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex')
}

if (manifest.authority !== 'TXS / Quiet Instrument') errors.push('Unexpected UI authority')
if (manifest.direct21stImportsAllowed !== false) errors.push('Direct 21st.dev imports must remain disabled')
if (manifest.productionDefaultChanged !== false) errors.push('Production default must remain unchanged')
if (manifest.featureFlag !== 'VITE_MYTELLINEX_NEXT=true') errors.push('Unexpected MyTellinex Next feature flag')

for (const component of manifest.components ?? []) {
  if (!component.localPath || !component.sourceBlob) {
    errors.push(`${component.name || 'unknown'}: missing localPath/sourceBlob`)
    continue
  }

  const filePath = path.join(root, component.localPath)
  if (!fs.existsSync(filePath)) {
    errors.push(`${component.name}: local registry file missing: ${component.localPath}`)
    continue
  }

  const actualBlob = gitBlobSha(fs.readFileSync(filePath))
  if (actualBlob !== component.sourceBlob) {
    errors.push(`${component.name}: registry drift detected; expected ${component.sourceBlob}, got ${actualBlob}`)
  }

  if (component.state !== 'CONSUMED') {
    errors.push(`${component.name}: adoption state must be CONSUMED`)
  }

  for (const consumer of component.consumers ?? []) {
    if (!fs.existsSync(path.join(root, consumer))) {
      errors.push(`${component.name}: declared consumer missing: ${consumer}`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`MyTellinex registry adoption valid: ${(manifest.components ?? []).length} component(s) match approved source blobs.`)

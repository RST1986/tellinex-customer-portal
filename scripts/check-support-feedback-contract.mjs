import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.join(process.cwd(), 'src/next/CustomerTabs.jsx'), 'utf8')
const errors = []

for (const token of [
  "const [notice, setNotice] = useState(null)",
  "tone: 'success'",
  "tone: 'danger'",
  "title: 'Support request created.'",
  "title: 'Support request could not be created.'",
  "No support request was confirmed.",
  '<TlxAlertBanner tone={notice.tone} title={notice.title}',
]) {
  if (!source.includes(token)) errors.push(`Support feedback contract missing: ${token}`)
}

if (source.includes("setNotice('Support request created.')")) {
  errors.push('Support success feedback must not regress to an untyped string')
}

if (source.includes("setNotice('Support request could not be created.")) {
  errors.push('Support failure feedback must not regress to an untyped string')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('MyTellinex support feedback contract valid: success and failure remain explicitly typed.')

const releaseIntent = process.env.TELLINEX_RELEASE_INTENT
const nextFlag = process.env.VITE_MYTELLINEX_NEXT

if (releaseIntent !== 'production') {
  console.error('TELLINEX_RELEASE_INTENT must be production when running the production release gate')
  process.exit(2)
}

if (nextFlag !== 'true') {
  console.error('Production release denied: VITE_MYTELLINEX_NEXT must be explicitly true')
  process.exit(1)
}

console.log('MYTELLINEX_PRODUCTION_RELEASE_MODE_GATE=PASS')

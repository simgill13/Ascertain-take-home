// Fails when the JavaScript a first visit must download exceeds the budget.
// Run after `vite build`: node scripts/check-bundle-budget.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const ASSETS_DIRECTORY = new URL('../dist/assets/', import.meta.url).pathname
const INITIAL_BUDGET_GZIP_BYTES = 150 * 1024
const ROUTE_CHUNK_BUDGET_GZIP_BYTES = 60 * 1024
// Chunks loaded before the dashboard renders: the entry and the shell it imports statically.
const INITIAL_CHUNK_PREFIXES = [
  'index-',
  'use-breadcrumbs-',
  'button-',
  'status-styles-',
  'dashboard-page-',
]
// The landing page is deliberately heavier (motion); it is never loaded by dashboard routes.
const EXEMPT_PREFIXES = ['landing-page-']

const gzipSize = (filePath) => gzipSync(readFileSync(filePath)).length
const kilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

const scriptFiles = readdirSync(ASSETS_DIRECTORY)
  .filter((fileName) => fileName.endsWith('.js'))
  .map((fileName) => ({ fileName, gzipBytes: gzipSize(join(ASSETS_DIRECTORY, fileName)) }))
  .sort((left, right) => right.gzipBytes - left.gzipBytes)

const initialChunks = scriptFiles.filter(({ fileName }) =>
  INITIAL_CHUNK_PREFIXES.some((prefix) => fileName.startsWith(prefix)),
)
const initialBytes = initialChunks.reduce((total, chunk) => total + chunk.gzipBytes, 0)

const failures = []
if (initialBytes > INITIAL_BUDGET_GZIP_BYTES) {
  failures.push(
    `initial JS ${kilobytes(initialBytes)} exceeds ${kilobytes(INITIAL_BUDGET_GZIP_BYTES)}`,
  )
}
for (const chunk of scriptFiles) {
  const isInitial = INITIAL_CHUNK_PREFIXES.some((prefix) => chunk.fileName.startsWith(prefix))
  const isExempt = EXEMPT_PREFIXES.some((prefix) => chunk.fileName.startsWith(prefix))
  if (!isInitial && !isExempt && chunk.gzipBytes > ROUTE_CHUNK_BUDGET_GZIP_BYTES) {
    failures.push(
      `${chunk.fileName} ${kilobytes(chunk.gzipBytes)} exceeds ${kilobytes(ROUTE_CHUNK_BUDGET_GZIP_BYTES)}`,
    )
  }
}

console.log('gzip sizes:')
for (const chunk of scriptFiles)
  console.log(`  ${kilobytes(chunk.gzipBytes).padStart(9)}  ${chunk.fileName}`)
console.log(
  `initial JS: ${kilobytes(initialBytes)} (budget ${kilobytes(INITIAL_BUDGET_GZIP_BYTES)})`,
)

if (failures.length > 0) {
  console.error(`bundle budget exceeded:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log('bundle budget ok')
statSync(ASSETS_DIRECTORY)

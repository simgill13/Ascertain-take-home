import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const SOURCE_ROOT = join(__dirname, '..', '..')
const LANDING_FOLDER = join(SOURCE_ROOT, 'features', 'landing')
// Static imports read `from '@/features/landing/...'`; the router's lazy `import('...')` has no `from`.
const STATIC_LANDING_IMPORT = /from\s+['"]@\/features\/landing/
const MOTION_IMPORT = /from\s+['"]motion\/react['"]/

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry)
    if (statSync(fullPath).isDirectory()) return listSourceFiles(fullPath)
    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : []
  })
}

describe('landing chunk isolation', () => {
  it('no dashboard code statically imports the landing feature', () => {
    const offenders = listSourceFiles(SOURCE_ROOT)
      .filter((file) => !file.startsWith(LANDING_FOLDER))
      .filter((file) => STATIC_LANDING_IMPORT.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SOURCE_ROOT, file))

    expect(offenders).toEqual([])
  })

  it('motion code lives only in the landing feature', () => {
    const offenders = listSourceFiles(SOURCE_ROOT)
      .filter((file) => !file.startsWith(LANDING_FOLDER))
      .filter((file) => MOTION_IMPORT.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SOURCE_ROOT, file))

    expect(offenders).toEqual([])
  })
})

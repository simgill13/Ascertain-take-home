import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.nodes.length} node(s) - ${violation.help}`,
  )
  expect(summary, summary.join('\n')).toEqual([])
}

async function openPatientChart(page: Page, fullName: string) {
  await page.goto(`/patients?search=${encodeURIComponent(fullName.split(' ')[1] ?? fullName)}`)
  await page.getByRole('link', { name: fullName }).click()
  await expect(page.getByRole('region', { name: 'Clinical' })).toBeVisible()
}

test.describe('accessibility', () => {
  test('statuses overview has no WCAG violations', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('list', { name: 'Practice totals' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Active \d+$/ })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('overview drawer has no WCAG violations', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Maria Alvarez/ }).click()
    await expect(page.getByRole('dialog', { name: 'Maria Alvarez' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('patient list has no WCAG violations', async ({ page }) => {
    await page.goto('/patients')
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('each patient detail tab has no WCAG violations', async ({ page }) => {
    await openPatientChart(page, 'Maria Alvarez')
    await expectNoAxeViolations(page)

    const sections = page.getByRole('navigation', { name: 'Patient sections' })
    await sections.getByRole('link', { name: 'Notes' }).click()
    await expect(page.getByRole('list', { name: 'Clinical notes' })).toBeVisible()
    await expectNoAxeViolations(page)

    await sections.getByRole('link', { name: 'Summary' }).click()
    await expect(page.locator('#summary')).toContainText('Maria Alvarez')
    await expectNoAxeViolations(page)
  })

  test('new patient form has no WCAG violations, including error state', async ({ page }) => {
    await page.goto('/patients/new')
    await page.getByRole('button', { name: 'Create patient' }).click()
    await expect(page.getByText('First name is required.')).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('no route overflows horizontally at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    const routes = ['/', '/patients', '/patients/new', '/welcome', '/missing-route']
    for (const route of routes) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth, `${route} overflows`).toBeLessThanOrEqual(320)
    }

    await openPatientChart(page, 'Maria Alvarez')
    const detailScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(detailScrollWidth, '/patients/:id overflows').toBeLessThanOrEqual(320)
  })

  test('list stays usable at a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('/patients')
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()

    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('dark theme keeps contrast', async ({ page }) => {
    await page.goto('/patients')
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expectNoAxeViolations(page)
  })
})

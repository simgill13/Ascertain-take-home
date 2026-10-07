import { expect, type APIRequestContext, type Page } from '@playwright/test'

const E2E_LAST_NAME_PREFIX = 'E2E'
const BACKEND_URL = process.env.E2E_BACKEND_URL ?? 'http://localhost:8000'

export const uniqueLastName = () => `${E2E_LAST_NAME_PREFIX}${Date.now().toString(36)}`

/** Remove patients a failed or interrupted run may have left behind. */
export async function deleteLeftoverTestPatients(request: APIRequestContext) {
  const response = await request.get(
    `${BACKEND_URL}/patients?search=${E2E_LAST_NAME_PREFIX}&page_size=100`,
  )
  if (!response.ok()) return
  const { items } = (await response.json()) as { items: Array<{ id: string; last_name: string }> }
  const leftovers = items.filter((patient) => patient.last_name.startsWith(E2E_LAST_NAME_PREFIX))
  await Promise.all(
    leftovers.map((patient) => request.delete(`${BACKEND_URL}/patients/${patient.id}`)),
  )
}

export async function fillPatientForm(page: Page, lastName: string) {
  await page.getByLabel('First name').fill('Playwright')
  await page.getByLabel('Last name').fill(lastName)
  await page.getByLabel('Date of birth').fill('1988-04-12')
  await page.getByLabel('Phone').fill('(503) 555-0123')
  await page.getByLabel('Email', { exact: false }).fill(`${lastName.toLowerCase()}@example.com`)
  await page.getByLabel('Street address').fill('42 Test Avenue')
  await page.getByLabel('City').fill('Portland')
  await page.getByLabel('State').fill('OR')
  await page.getByLabel('Postal code').fill('97201')
  await page.getByLabel('Allergies').fill('Latex')
  await page.getByLabel('Allergies').press('Enter')
  await page.getByLabel('Conditions').fill('Asthma')
  await page.getByLabel('Conditions').press('Enter')
}

export async function createPatientThroughUi(page: Page, lastName: string) {
  await page.goto('/patients/new')
  await fillPatientForm(page, lastName)
  await page.getByRole('button', { name: 'Create patient' }).click()
  await expect(page).toHaveURL(/\/patients\/[0-9a-f-]{36}$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(lastName)
}

export async function deletePatientThroughUi(page: Page) {
  await page.getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete patient' }).click()
  await page.getByRole('button', { name: 'Delete patient' }).click()
  await expect(page).toHaveURL(/\/patients$/)
}

import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const backendURL = process.env.E2E_BACKEND_URL ?? 'http://localhost:8000'
const backendDatabaseURL =
  process.env.E2E_DATABASE_URL ?? 'postgresql+asyncpg://postgres@localhost:5433/healthcare'

// When E2E_BASE_URL points at an already running stack (for example docker compose),
// Playwright does not start anything itself.
const startServers = !process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  reporter: isCI
    ? [['blob'], ['github'], ['json', { outputFile: 'test-results/report.json' }]]
    : [['list']],
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: startServers
    ? [
        {
          command: 'uv run uvicorn app.main:app --port 8000',
          cwd: '../backend',
          url: `${backendURL}/health`,
          reuseExistingServer: !isCI,
          timeout: 60_000,
          env: { DATABASE_URL: backendDatabaseURL, SEED_ON_STARTUP: 'true' },
        },
        {
          command: 'npm run dev',
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: 60_000,
          env: { VITE_API_PROXY_TARGET: backendURL },
        },
      ]
    : undefined,
})

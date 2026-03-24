import { test, expect } from './fixtures';

const MOCK_STATS = {
  totalLoginsWeek: 16,
  totalIncidentsWeek: 2,
  totalVolonteers: 5,
  loginHistory: [
    { label: "15/03", value: 12 },
    { label: "16/03", value: 4 },
  ],
  loginsByRole: {
    ADMIN: 10,
    ATHLETE: 4,
    VOLONTEER: 2,
  },
  topViewedSections: {
    "Calendrier Épreuves": 150,
    "Résultats Natation": 85,
    "Plan du Site": 20,
  },
  averageSessionByRole: {
    ADMIN: 25.5,
    ATHLETE: 5.2,
    VOLONTEER: 45.0,
  },
  incidentResolutionRate: 100.0,
  hourlyTraffic: [
    { label: "08h", value: 5 },
    { label: "14h", value: 25 },
  ],
};

const MOCK_SUMMARY = "USAGE : La fréquentation est correcte (16 connexions).\nSÉCURITÉ : Aucun incident majeur.\nRESSOURCES : 5 volontaires actifs.";

function setupMocks(page) {
  return Promise.all([
    page.route('**/api/admin/stats**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) })
    ),
    page.route('**/api/admin/report-summary', (route) =>
      route.fulfill({ status: 200, contentType: 'text/plain', body: MOCK_SUMMARY })
    ),
    page.route('**/api/admin/stats/consultations', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { section: "Calendrier Épreuves", visitCount: 150 },
          { section: "Résultats Natation", visitCount: 85 },
          { section: "Plan du Site", visitCount: 20 },
        ]),
      })
    ),
    page.route('**/api/admin/stats/consultations-by-role**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { section: "Espace_Athlete", visitCount: 120 },
          { section: "Calendrier", visitCount: 75 },
        ]),
      })
    ),
    page.route('**/api/admin/report-download', (route) => {
      if (route.request().method() !== 'POST') {
        route.continue();
        return;
      }
      const minimalPdf = '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF';
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from(minimalPdf),
      });
    }),
  ]);
}

const mainContent = (page) => page.locator('main');

test.describe('Admin Dashboard', () => {

  test('should display the dashboard page with title', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(mainContent(page).getByText('Dashboard & Reporting')).toBeVisible({ timeout: 10000 });
  });

  test('should display all 4 KPI cards', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(mainContent(page).getByText('Connexions (7 jours)')).toBeVisible({ timeout: 10000 });
    await expect(mainContent(page).getByText('16', { exact: true })).toBeVisible();

    await expect(mainContent(page).getByText('Incidents (7 jours)')).toBeVisible();
    await expect(mainContent(page).getByText('2', { exact: true })).toBeVisible();

    await expect(mainContent(page).getByText('Volontaires inscrits')).toBeVisible();
    await expect(mainContent(page).getByText('5', { exact: true })).toBeVisible();

    await expect(mainContent(page).getByText('Résolution incidents')).toBeVisible();
    await expect(mainContent(page).getByText('100%', { exact: true }).first()).toBeVisible();
  });

  test('should display the security indicator', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(mainContent(page).getByText('Niveau de sécurité')).toBeVisible({ timeout: 10000 });
    await expect(mainContent(page).getByText('Situation normale')).toBeVisible();
  });

  test('should display all chart sections', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(mainContent(page).getByText('Répartition des Acteurs')).toBeVisible({ timeout: 10000 });
    await expect(mainContent(page).getByText('Pics d\'affluence (trafic horaire)')).toBeVisible();
    await expect(mainContent(page).getByText('Fréquentation — Connexions par jour')).toBeVisible();
    await expect(mainContent(page).getByText('Durée moyenne de session par rôle (min)')).toBeVisible();
    await expect(mainContent(page).getByText('Sections les plus consultées')).toBeVisible();
  });

  test('should display the report summary', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(mainContent(page).getByText('Aperçu du rapport')).toBeVisible({ timeout: 10000 });
    await expect(mainContent(page).getByText('USAGE', { exact: false })).toBeVisible();
  });

  test('should switch period to 30 days and reload stats', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(mainContent(page).getByText('Dashboard & Reporting')).toBeVisible({ timeout: 10000 });

    const statsRequest = page.waitForRequest((req) => req.url().includes('/api/admin/stats') && req.url().includes('days=30'));
    await mainContent(page).locator('button:has-text("30 jours")').click();
    await statsRequest;
  });

  test('should refresh data when clicking Rafraîchir', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(mainContent(page).getByText('Dashboard & Reporting')).toBeVisible({ timeout: 10000 });

    const statsRequest = page.waitForRequest((req) => req.url().includes('/api/admin/stats'));
    await mainContent(page).locator('button:has-text("Rafraîchir")').click();
    await statsRequest;
  });

  test('should have the PDF export button', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    const pdfButton = mainContent(page).locator('button:has-text("Exporter PDF")');
    await expect(pdfButton).toBeVisible({ timeout: 10000 });
    await expect(pdfButton).toBeEnabled();
  });

  test('should show error state when API fails', async ({ authenticatedPage: page }) => {
    await page.route('**/api/admin/stats**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/api/admin/report-summary', (route) =>
      route.fulfill({ status: 500, contentType: 'text/plain', body: '' })
    );

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=/Impossible de charger/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show vigilance level when incidents are between 3 and 5', async ({ authenticatedPage: page }) => {
    const modifiedStats = { ...MOCK_STATS, totalIncidentsWeek: 4 };
    await page.route('**/api/admin/stats**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(modifiedStats) })
    );
    await page.route('**/api/admin/report-summary', (route) =>
      route.fulfill({ status: 200, contentType: 'text/plain', body: MOCK_SUMMARY })
    );
    await page.route('**/api/admin/stats/consultations', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.route('**/api/admin/stats/consultations-by-role**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Vigilance accrue')).toBeVisible({ timeout: 10000 });
  });

  test('should show alert level when incidents exceed 5', async ({ authenticatedPage: page }) => {
    const modifiedStats = { ...MOCK_STATS, totalIncidentsWeek: 8 };
    await page.route('**/api/admin/stats**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(modifiedStats) })
    );
    await page.route('**/api/admin/report-summary', (route) =>
      route.fulfill({ status: 200, contentType: 'text/plain', body: MOCK_SUMMARY })
    );
    await page.route('**/api/admin/stats/consultations', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.route('**/api/admin/stats/consultations-by-role**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Alerte comité de direction')).toBeVisible({ timeout: 10000 });
  });

  test('should display 7 jours toggle as selected by default', async ({ authenticatedPage: page }) => {
    await setupMocks(page);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    const btn7 = mainContent(page).locator('button:has-text("7 jours")');
    await expect(btn7).toBeVisible({ timeout: 10000 });
    await expect(btn7).toHaveClass(/Mui-selected/);
  });

});

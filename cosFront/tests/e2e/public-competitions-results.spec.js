import { test, expect } from '@playwright/test';


async function mockEmptyCompetitionsWithResults(page) {
  await page.route('**/api/public/competitions/with-results', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });
}

async function openHomeFooterLink(page, linkName) {
  await page.goto('/', { waitUntil: 'load' });
  await page.getByRole('link', { name: linkName }).click();
}

/**
 * En HashRouter (preview / prod), un goto direct peut ne pas monter la route ; le footer de l’accueil utilise des liens React.
 */
async function gotoCompetitions(page) {
  await mockEmptyCompetitionsWithResults(page);
  await page.goto('/competitions', { waitUntil: 'load' });
  const heading = page.getByRole('heading', {
    level: 1,
    name: 'Toutes les compétitions avec résultats',
  });
  try {
    await heading.waitFor({ state: 'visible', timeout: 6000 });
  } catch {
    await openHomeFooterLink(page, 'Toutes les compétitions');
    await heading.waitFor({ state: 'visible', timeout: 25000 });
  }
}

async function gotoResultats(page) {
  await mockEmptyCompetitionsWithResults(page);
  await page.goto('/resultats', { waitUntil: 'load' });
  const title = page.getByText('Résultats & Classements publics');
  try {
    await title.waitFor({ state: 'visible', timeout: 6000 });
  } catch {
    await openHomeFooterLink(page, 'Résultats publics');
    await title.waitFor({ state: 'visible', timeout: 25000 });
  }
}

test.describe('Page publique Compétitions', () => {
  test('affiche le titre, les compteurs à zéro et l’état vide', async ({ page }) => {
    await gotoCompetitions(page);

    await expect(page.getByText('CiblOrgaSport').first()).toBeVisible();
    await expect(
      page.getByText('Consultez les informations clés des compétitions et accédez rapidement aux classements publiés.')
    ).toBeVisible();
    await expect(page.getByText('Compétitions', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('0').first()).toBeVisible();
    await expect(
      page.getByText('Aucune compétition avec résultats publics pour l’instant.')
    ).toBeVisible();
  });

  test('le lien Accueil ramène à la page d’accueil', async ({ page }) => {
    await gotoCompetitions(page);
    await page.getByRole('link', { name: 'Accueil' }).click();
    await expect(
      page.locator('h1').filter({ hasText: /Plateforme digitale des événements sportifs/ })
    ).toBeVisible({ timeout: 25000 });
  });
});

test.describe('Page publique Résultats', () => {
  test('affiche le bloc principal et le message sans compétition', async ({ page }) => {
    await gotoResultats(page);

    await expect(page.getByText('CiblOrgaSport').first()).toBeVisible();
    await expect(page.getByText('Résultats & Classements publics')).toBeVisible();
    await expect(
      page.getByText('Explorez les classements officiels des dernières compétitions')
    ).toBeVisible();
    await expect(
      page.getByText('Aucune compétition avec classement public détectée pour le moment.')
    ).toBeVisible();
  });

  test('le bouton Compétitions ouvre la liste des compétitions', async ({ page }) => {
    await gotoResultats(page);
    await page.getByRole('button', { name: 'Compétitions' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Toutes les compétitions avec résultats' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('le bouton Accueil ramène au hero', async ({ page }) => {
    await gotoResultats(page);
    await page.getByRole('button', { name: 'Accueil' }).click();
    await expect(
      page.locator('h1').filter({ hasText: /Plateforme digitale des événements sportifs/ })
    ).toBeVisible({ timeout: 25000 });
  });
});

import { test, expect } from '@playwright/test';

/**
 * Liens du footer sur l’accueil + boutons Connexion / Inscription de la PublicNavbar
 * (pages /resultats et /competitions). API publique mockée pour chargement rapide.
 */

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

async function gotoHomeWithHero(page) {
  await page.goto('/', { waitUntil: 'load' });
  const heroH1 = page.locator('h1').filter({ hasText: /Plateforme digitale des événements sportifs/ });
  try {
    await heroH1.waitFor({ state: 'visible', timeout: 12000 });
  } catch {
    await page.evaluate(() => {
      window.location.hash = '#/';
    });
    await heroH1.waitFor({ state: 'visible', timeout: 25000 });
  }
}

async function gotoResultats(page) {
  await mockEmptyCompetitionsWithResults(page);
  await page.goto('/resultats', { waitUntil: 'load' });
  const title = page.getByText('Résultats & Classements publics');
  try {
    await title.waitFor({ state: 'visible', timeout: 6000 });
  } catch {
    await gotoHomeWithHero(page);
    await page.getByRole('link', { name: 'Résultats publics' }).click();
    await title.waitFor({ state: 'visible', timeout: 25000 });
  }
}

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
    await gotoHomeWithHero(page);
    await page.getByRole('link', { name: 'Toutes les compétitions' }).click();
    await heading.waitFor({ state: 'visible', timeout: 25000 });
  }
}

test.describe('Footer de la page d’accueil', () => {
  test('lien « Résultats publics » ouvre les classements', async ({ page }) => {
    await mockEmptyCompetitionsWithResults(page);
    await gotoHomeWithHero(page);
    await page.getByRole('link', { name: 'Résultats publics' }).click();
    await expect(page.getByText('Résultats & Classements publics')).toBeVisible({ timeout: 25000 });
    await expect(
      page.getByText('Aucune compétition avec classement public détectée pour le moment.')
    ).toBeVisible();
  });

  test('lien « Toutes les compétitions » ouvre la liste', async ({ page }) => {
    await mockEmptyCompetitionsWithResults(page);
    await gotoHomeWithHero(page);
    await page.getByRole('link', { name: 'Toutes les compétitions' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Toutes les compétitions avec résultats' })
    ).toBeVisible({ timeout: 25000 });
  });
});

test.describe('Barre navigation pages publiques', () => {
  test('depuis Résultats : Connexion ouvre le formulaire', async ({ page }) => {
    await gotoResultats(page);
    await page.getByRole('button', { name: 'Connexion' }).click();
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('depuis Compétitions : Inscription ouvre le formulaire spectateur', async ({ page }) => {
    await gotoCompetitions(page);
    await page.getByRole('button', { name: /^Inscription$/ }).click();
    await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('h2').filter({ hasText: /^Inscription$/ })).toBeVisible();
  });
});

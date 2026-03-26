import { test, expect } from '@playwright/test';



async function mockAdminSignIn(page) {
  await page.route('**/api/auth/signin', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'e2e-admin-token',
        userId: 1,
        role: 'ADMIN',
      }),
    });
  });
}

async function gotoLogin(page) {
  await page.goto('/login', { waitUntil: 'load' });
  try {
    await page.locator('#login-email').waitFor({ state: 'visible', timeout: 6000 });
    return;
  } catch {
    await page.goto('/', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Connexion' }).first().click();
    await page.locator('#login-email').waitFor({ state: 'visible', timeout: 25000 });
  }
}

async function loginAsAdmin(page) {
  await mockAdminSignIn(page);
  await gotoLogin(page);
  await page.locator('#login-email').fill('admin@e2e.local');
  await page.locator('#login-password').fill('e2e');
  await page.locator('button[type="submit"]').click();
  await page.getByText('Tableau de bord').waitFor({ state: 'visible', timeout: 25000 });
}

test.describe('Hub administrateur', () => {
  test('affiche le titre et des cartes métier (sous-titres uniques)', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText('Tableau de bord')).toBeVisible();
    await expect(page.getByText('Indicateurs, graphiques et export PDF')).toBeVisible();
    await expect(page.getByText('Contrôler les accès et maintenir la sécurité')).toBeVisible();
    await expect(page.getByText('Déclarer et suivre les incidents')).toBeVisible();
  });

  test('accède à la gestion des utilisateurs avec la liste mockée', async ({ page }) => {
    await page.route('**/api/admin/users', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await loginAsAdmin(page);

    await page.getByText('Contrôler les accès et maintenir la sécurité').click();
    await expect(page.getByRole('button', { name: /Créer un commissaire/i })).toBeVisible({
      timeout: 20000,
    });
  });
});

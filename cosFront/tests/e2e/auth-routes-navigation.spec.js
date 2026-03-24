import { test, expect } from '@playwright/test';



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

async function gotoForgotPassword(page) {
  await page.goto('/forgot-password', { waitUntil: 'load' });
  try {
    await page.locator('#forgot-email').waitFor({ state: 'visible', timeout: 6000 });
    return;
  } catch {
    await gotoLogin(page);
    await page.getByRole('link', { name: /Mot de passe oublié/i }).click();
    await page.locator('#forgot-email').waitFor({ state: 'visible', timeout: 25000 });
  }
}

async function gotoSignupFromLogin(page) {
  await gotoLogin(page);
  await page.getByRole('link', { name: /^Inscription$/ }).click();
  await page.locator('input[name="firstName"]').waitFor({ state: 'visible', timeout: 25000 });
}

test.describe('Liens depuis la connexion', () => {
  test('« Mot de passe oublié ? » ouvre la récupération', async ({ page }) => {
    await gotoLogin(page);
    await page.getByRole('link', { name: /Mot de passe oublié/i }).click();
    await expect(page.locator('#forgot-email')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mot de passe oublié', exact: true })).toBeVisible();
  });

  test('« Inscription » ouvre le formulaire spectateur', async ({ page }) => {
    await gotoSignupFromLogin(page);
    await expect(page.locator('h2').filter({ hasText: /^Inscription$/ })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});

test.describe('Liens retour depuis mot de passe oublié', () => {
  test('« Retour à la connexion » ramène au login', async ({ page }) => {
    await gotoForgotPassword(page);
    await page.getByRole('link', { name: /Retour à la connexion/i }).click();
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#login-email')).toBeVisible();
  });
});

test.describe('Liens depuis l’inscription', () => {
  test('« Se connecter » ramène au login', async ({ page }) => {
    await gotoSignupFromLogin(page);
    await page.getByRole('link', { name: 'Se connecter' }).click();
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#login-password')).toBeVisible();
  });
});

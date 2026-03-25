import { test, expect } from '@playwright/test';


async function gotoSignupForm(page) {
  await page.goto('/signup', { waitUntil: 'load' });
  const firstName = page.locator('input[name="firstName"]');
  try {
    await firstName.waitFor({ state: 'visible', timeout: 5000 });
    return;
  } catch {
    /* fallback HashRouter ou chargement très lent */
  }
  await page.goto('/', { waitUntil: 'load' });
  await page.getByRole('button', { name: /^Inscription$/ }).first().click();
  await firstName.waitFor({ state: 'visible', timeout: 25000 });
}

async function gotoLoginForFallback(page) {
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

/** Accueil : charger le bundle puis le hero ; avec HashRouter, forcer le hash si besoin. */
async function gotoHomeHero(page) {
  await page.goto('/', { waitUntil: 'load' });
  const heroH1 = page.locator('h1').filter({ hasText: /Plateforme digitale des événements sportifs/ });
  try {
    await heroH1.waitFor({ state: 'visible', timeout: 12000 });
    return;
  } catch {
    await page.evaluate(() => {
      window.location.hash = '#/';
    });
    await heroH1.waitFor({ state: 'visible', timeout: 25000 });
  }
}

/**
 * Reset password : avec HashRouter, l’URL doit être #/reset-password?token=…
 */
async function gotoResetPasswordPage(page, { token } = {}) {
  const qs = token != null && token !== '' ? `?token=${encodeURIComponent(token)}` : '';
  await page.goto(`/reset-password${qs}`, { waitUntil: 'load' });
  const pwdInput = page.locator('input[name="newPassword"]');
  const tokenMsg = page.getByText(/Token manquant/i).first();
  const wantForm = qs !== '';
  try {
    if (wantForm) {
      await pwdInput.waitFor({ state: 'visible', timeout: 6000 });
    } else {
      await tokenMsg.waitFor({ state: 'visible', timeout: 6000 });
    }
    return;
  } catch {
    await gotoHomeHero(page);
    await page.evaluate((search) => {
      window.location.hash = `#/reset-password${search}`;
    }, qs);
    if (wantForm) {
      await pwdInput.waitFor({ state: 'visible', timeout: 25000 });
    } else {
      await tokenMsg.waitFor({ state: 'visible', timeout: 25000 });
    }
  }
}

/** Même problème que /signup avec HashRouter : goto direct souvent inefficace. */
async function gotoForgotPasswordForm(page) {
  await page.goto('/forgot-password', { waitUntil: 'load' });
  try {
    await page.locator('#forgot-email').waitFor({ state: 'visible', timeout: 6000 });
    return;
  } catch {
    await gotoLoginForFallback(page);
    await page.getByRole('link', { name: /Mot de passe oublié/i }).click();
    await page.locator('#forgot-email').waitFor({ state: 'visible', timeout: 25000 });
  }
}

test.describe('Accueil', () => {
  test('affiche le titre principal du hero', async ({ page }) => {
    await gotoHomeHero(page);
    await expect(
      page.locator('h1').filter({ hasText: /Plateforme digitale des événements sportifs/ })
    ).toBeVisible();
  });

  test('lien Connexion mène à la page de login', async ({ page }) => {
    await gotoHomeHero(page);
    await page.getByRole('link', { name: 'Connexion' }).first().click();
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Connexion', () => {
  test('affiche le formulaire', async ({ page }) => {
    await gotoLoginForFallback(page);
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe('Inscription spectateur', () => {
  test('affiche le formulaire', async ({ page }) => {
    await gotoSignupForm(page);
    await expect(page.locator('h2').filter({ hasText: /^Inscription$/ })).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('valide les mots de passe côté client (sans API)', async ({ page }) => {
    await gotoSignupForm(page);
    await page.locator('input[name="firstName"]').fill('Jean');
    await page.locator('input[name="lastName"]').fill('Dupont');
    await page.locator('input[name="email"]').fill('jean.dupont@example.com');

    await page.locator('input[name="password"]').fill('secret123');
    await page.locator('input[name="confirmPassword"]').fill('autre456');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText('Les mots de passe ne correspondent pas.')).toBeVisible();

    await page.locator('input[name="password"]').fill('12345');
    await page.locator('input[name="confirmPassword"]').fill('12345');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText(/au moins 6 caractères/i)).toBeVisible();
  });
});

test.describe('Mot de passe oublié', () => {
  test('affiche le formulaire', async ({ page }) => {
    await gotoForgotPasswordForm(page);
    await expect(page.getByRole('link', { name: /Retour à la connexion/i })).toBeVisible();
  });

  test('affiche le message de succès quand l’API répond OK (mock)', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await gotoForgotPasswordForm(page);
    await page.locator('#forgot-email').fill('quelquun@example.com');
    await page.getByRole('button', { name: /Envoyer un email de réinitialisation/i }).click();
    await expect(
      page.getByText(/Si un compte existe avec cet email, vous recevrez un lien/i)
    ).toBeVisible();
  });
});

test.describe('Réinitialisation mot de passe', () => {
  test('sans token : message d’erreur', async ({ page }) => {
    await gotoResetPasswordPage(page);
    await expect(page.getByText(/Token manquant/i).first()).toBeVisible();
  });

  test('avec token : formulaire visible', async ({ page }) => {
    await gotoResetPasswordPage(page, { token: 'fake-token-e2e' });
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /Retour à la connexion/i })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test.beforeEach(async ({ page }) => {
    // Chaque test commence sur la page de reset password
  });

  test('should display reset password form when token is provided', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');
    
    // Vérifier que le formulaire est affiché (utiliser h2 qui est plus spécifique)
    await expect(page.locator('h2')).toContainText(/mot de passe/i);
    
    // Vérifier les champs du formulaire
    await expect(page.locator('input[name="newPassword"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    
    // Vérifier le bouton de soumission
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error when token is missing', async ({ page }) => {
    await page.goto('/reset-password');
    
    // Attendre que le message d'erreur apparaisse (utiliser .first() pour éviter strict mode violation)
    await expect(page.locator('text=/token/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');
    
    // Remplir le formulaire avec des mots de passe différents
    await page.fill('input[name="newPassword"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Different123!');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Vérifier le message d'erreur
    await expect(page.locator('text=/correspondent pas/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show error when password is too short', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');
    
    // Remplir avec un mot de passe trop court
    await page.fill('input[name="newPassword"]', '12345');
    await page.fill('input[name="confirmPassword"]', '12345');
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier le message d'erreur
    await expect(page.locator('text=/6 caractères/i')).toBeVisible({ timeout: 5000 });
  });

  test('should have link to return to login', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');
    
    // Chercher le lien de retour
    const loginLink = page.locator('a:has-text("connexion"), a:has-text("Connexion")');
    await expect(loginLink).toBeVisible();
    
    // Vérifier que le lien pointe vers /login
    await expect(loginLink).toHaveAttribute('href', /\/login/);
  });

  test('should display loading state when submitting', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');
    
    // Remplir le formulaire avec des données valides
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
    
    // Intercepter la requête API pour la bloquer et simuler un délai
    await page.route('**/api/auth/forgot-password/complete', route => {
      // Ne pas répondre immédiatement pour voir l'état de chargement
      setTimeout(() => route.fulfill({ status: 200, body: 'Success' }), 2000);
    });
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier que le bouton affiche un état de chargement
    await expect(page.locator('button[type="submit"]:has-text("Enregistrement"), button[type="submit"]:has-text("Réinitialisation")')).toBeVisible();
  });
});

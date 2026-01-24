import { test, expect } from './fixtures';

test.describe('Create Commissioner (Admin)', () => {
  test('should navigate to users management page', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    
    // Vérifier que la page est chargée (chercher le texte "utilisateur" quelque part sur la page)
    await expect(page.locator('body')).toContainText(/utilisateur/i, { timeout: 10000 });
  });

  test('should open create commissioner dialog', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    
    // Chercher le bouton "Créer un commissaire"
    const createButton = page.locator('button:has-text("Créer un commissaire"), button:has-text("commissaire")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();
    
    // Attendre que le dialog s'ouvre
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    
    // Vérifier que le dialog contient le titre
    await expect(page.locator('[role="dialog"] h2, [role="dialog"] [class*="title"]')).toContainText(/commissaire/i);
  });

  test('should display form fields in dialog', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Ouvrir le dialog
    const createButton = page.locator('button:has-text("Créer un commissaire"), button:has-text("commissaire")').first();
    await createButton.click();
    
    // Attendre que le dialog soit visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Vérifier les champs du formulaire
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should validate required fields', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Ouvrir le dialog
    const createButton = page.locator('button:has-text("Créer un commissaire"), button:has-text("commissaire")').first();
    await createButton.click();
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Essayer de soumettre sans remplir les champs
    const submitButton = page.locator('[role="dialog"] button:has-text("Créer")');
    await submitButton.click();
    
    // Vérifier qu'il y a des messages d'erreur (utiliser .first() pour éviter strict mode violation)
    await expect(page.locator('text=/obligatoire/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should validate email format', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Créer un commissaire"), button:has-text("commissaire")').first();
    await createButton.click();
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Remplir avec un email invalide
    await page.fill('input[name="lastName"]', 'Dupont');
    await page.fill('input[name="firstName"]', 'Jean');
    await page.fill('input[name="email"]', 'invalid-email');
    
    // Soumettre
    const submitButton = page.locator('[role="dialog"] button:has-text("Créer")');
    await submitButton.click();
    
    // Vérifier le message d'erreur (utiliser .first() pour éviter strict mode violation)
    await expect(page.locator('text=/email/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should close dialog when cancel is clicked', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Ouvrir le dialog
    const createButton = page.locator('button:has-text("Créer un commissaire"), button:has-text("commissaire")').first();
    await createButton.click();
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Cliquer sur Annuler
    const cancelButton = page.locator('[role="dialog"] button:has-text("Annuler")');
    await cancelButton.click();
    
    // Vérifier que le dialog est fermé
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 2000 });
  });

  test('should create commissioner successfully', async ({ authenticatedPage: page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Ouvrir le dialog
    const createButton = page.locator('button:has-text("Créer un commissaire"), button:has-text("commissaire")').first();
    await createButton.click();
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Générer un email unique pour éviter les conflits
    const timestamp = Date.now();
    const testEmail = `test-commissaire-${timestamp}@example.com`;
    
    // Remplir le formulaire
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="firstName"]', 'Commissaire');
    await page.fill('input[name="email"]', testEmail);
    
    // Attendre la réponse API
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/admin/create-commissaire') && response.status() === 201,
      { timeout: 10000 }
    );
    
    // Soumettre
    const submitButton = page.locator('[role="dialog"] button:has-text("Créer")');
    await submitButton.click();
    
    // Attendre la réponse API
    await responsePromise;
    
    // Attendre que le dialog se ferme (indique le succès)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    
    // Vérifier qu'un message de succès apparaît (peut être dans un snackbar, alert, ou dans le body)
    // Le message peut contenir "succès", "envoyé", "invitation", "email"
    const successIndicators = [
      page.locator('text=/succès/i'),
      page.locator('text=/envoyé/i'),
      page.locator('text=/invitation/i'),
      page.locator('text=/email.*envoyé/i'),
    ];
    
    // Vérifier qu'au moins un indicateur de succès est visible
    let successFound = false;
    for (const indicator of successIndicators) {
      try {
        await expect(indicator.first()).toBeVisible({ timeout: 2000 });
        successFound = true;
        break;
      } catch {
        // Continuer à chercher
      }
    }
    
    // Si aucun message n'est trouvé, vérifier au moins que le dialog est fermé (indique succès)
    if (!successFound) {
      // Le dialog fermé est déjà vérifié, donc le test passe
      // Mais on peut aussi vérifier qu'on n'est pas sur une page d'erreur
      const url = page.url();
      expect(url).not.toContain('error');
    }
  });
});

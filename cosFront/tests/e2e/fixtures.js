import { test as base } from '@playwright/test';

/**
 * Fixtures personnalisées pour les tests
 */

// Identifiants de test
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@cos.com',
    password: 'Admin@123'
  }
};

/**
 * Extension du test de base avec des helpers personnalisés
 */
export const test = base.extend({
  /**
   * Page avec connexion admin automatique
   */
  authenticatedPage: async ({ page }, use) => {
    // Se connecter en tant qu'admin
    await page.goto('/login');
    
    // Attendre que le formulaire soit visible
    await page.waitForSelector('input[name="email"]', { state: 'visible' });
    
    await page.fill('input[name="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    
    // Attendre la redirection après connexion (vers /admin pour un admin)
    // Utiliser une attente plus flexible
    await Promise.race([
      page.waitForURL('/admin', { timeout: 10000 }),
      page.waitForURL(/^\/(?!login)/, { timeout: 10000 }),
    ]).catch(() => {
      // Si la redirection échoue, vérifier qu'on n'est plus sur /login
      return page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 5000 });
    });
    
    await use(page);
  },
});

export { expect } from '@playwright/test';

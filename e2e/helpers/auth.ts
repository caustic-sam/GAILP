/**
 * Authentication Test Helpers
 *
 * Utilities for testing authentication flows
 */

import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'reader';
  name?: string;
}

/**
 * Mock admin user for testing
 */
export const ADMIN_USER: TestUser = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'test-password-123',
  role: 'admin',
  name: 'Test Admin',
};

/**
 * Mock reader user for testing
 */
export const READER_USER: TestUser = {
  email: process.env.TEST_READER_EMAIL || 'reader@test.com',
  password: process.env.TEST_READER_PASSWORD || 'test-password-123',
  role: 'reader',
  name: 'Test Reader',
};

/**
 * Login via GitHub OAuth (for E2E tests)
 * Note: This requires actual OAuth or mocked OAuth flow
 */
export async function loginWithGitHub(page: Page, user: TestUser) {
  await page.goto('/login');

  // Click GitHub OAuth button
  await page.click('button:has-text("Sign in with GitHub")');

  // Wait for redirect to GitHub (or mock OAuth)
  // In real tests, you'd need to handle OAuth flow or use test credentials
  // For now, we'll check if we reach the OAuth initiation
  await expect(page).toHaveURL(/github\.com|auth\/callback/);
}

/**
 * Login by directly setting session cookies
 * This bypasses OAuth for faster test execution
 */
export async function loginWithSession(page: Page, user: TestUser) {
  // This would require a test endpoint that creates sessions
  // or direct cookie manipulation with valid Supabase tokens

  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: 'mock-access-token',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'sb-refresh-token',
      value: 'mock-refresh-token',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  await page.goto('/');
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for presence of user menu or logout button
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
  return await logoutButton.isVisible().catch(() => false);
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Look for user menu dropdown
  const userMenu = page.locator('[data-testid="user-menu"], button:has([alt*="avatar"])');

  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.click('button:has-text("Logout"), button:has-text("Sign out")');
    await page.waitForURL('/');
  }
}

/**
 * Assert user has admin access
 */
export async function assertIsAdmin(page: Page) {
  await page.goto('/admin');

  // Should not redirect to login
  await expect(page).not.toHaveURL('/login');

  // Should see admin dashboard
  await expect(page.locator('h1, h2').filter({ hasText: /admin|dashboard/i })).toBeVisible();
}

/**
 * Assert user does NOT have admin access
 */
export async function assertIsNotAdmin(page: Page) {
  await page.goto('/admin');

  // Should redirect to login or home
  await expect(page).toHaveURL(/\/login|^\/$/, { timeout: 5000 });
}

/**
 * Wait for authentication state to load
 */
export async function waitForAuthState(page: Page, timeout = 5000) {
  // Wait for auth context to finish loading
  // This looks for the loading state to disappear
  await page.waitForLoadState('networkidle', { timeout });
}

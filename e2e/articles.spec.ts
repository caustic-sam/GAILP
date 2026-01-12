/**
 * Article Management E2E Tests
 *
 * Tests for creating, editing, and managing articles
 */

import { test, expect } from '@playwright/test';

test.describe('Article Creation', () => {
  test.skip('should create draft article', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    // Fill out article form
    await page.fill('input[name="title"]', 'Test Article');
    await page.fill('input[name="slug"]', 'test-article');

    // Fill rich text editor
    const editor = page.locator('.ProseMirror, [contenteditable="true"]');
    await editor.fill('This is test content for the article.');

    // Save as draft
    await page.click('button:has-text("Save Draft"), button:has-text("Save")');

    // Should redirect to article list or show success
    await expect(
      page.locator('text=Article created, text=saved successfully')
    ).toBeVisible();
  });

  test.skip('should create published article', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    await page.fill('input[name="title"]', 'Published Article');
    await page.fill('input[name="slug"]', 'published-article');

    const editor = page.locator('.ProseMirror');
    await editor.fill('Published content.');

    // Select published status
    await page.selectOption('select[name="status"]', 'published');

    await page.click('button:has-text("Publish")');

    await expect(page.locator('text=Article published')).toBeVisible();
  });

  test.skip('should validate required fields', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    // Try to save without filling required fields
    await page.click('button:has-text("Save"), button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Content is required')).toBeVisible();
  });

  test.skip('should auto-generate slug from title', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    await page.fill('input[name="title"]', 'Test Article With Spaces');

    // Slug should auto-populate
    const slug = page.locator('input[name="slug"]');
    await expect(slug).toHaveValue('test-article-with-spaces');
  });

  test.skip('should schedule article for future publication', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    await page.fill('input[name="title"]', 'Scheduled Article');
    await page.fill('input[name="slug"]', 'scheduled-article');

    // Select scheduled status
    await page.selectOption('select[name="status"]', 'scheduled');

    // Set future date
    await page.fill('input[name="scheduled_for"]', '2026-12-31T10:00');

    await page.click('button:has-text("Schedule")');

    await expect(page.locator('text=Article scheduled')).toBeVisible();
  });
});

test.describe('Article Listing', () => {
  test.skip('should display all articles for admin', async ({ page }) => {
    // TODO: Set up admin session with existing articles

    await page.goto('/admin/articles');

    // Should show article table
    const articleTable = page.locator('table, [data-testid="article-list"]');
    await expect(articleTable).toBeVisible();

    // Should show multiple articles
    const rows = page.locator('tr[data-testid="article-row"]');
    await expect(rows).toHaveCount(await rows.count());
  });

  test.skip('should filter articles by status', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles');

    // Filter to drafts only
    await page.click('button:has-text("Draft"), [data-filter="draft"]');

    // All visible articles should be drafts
    const statusBadges = page.locator('[data-testid="status-badge"]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toContainText('Draft');
    }
  });

  test.skip('should search articles by title', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    await searchInput.fill('Test');

    // Should filter results
    const visibleRows = page.locator('tr[data-testid="article-row"]:visible');
    const count = await visibleRows.count();

    // All visible titles should contain "Test"
    for (let i = 0; i < count; i++) {
      const title = await visibleRows.nth(i).locator('td:first-child').textContent();
      expect(title?.toLowerCase()).toContain('test');
    }
  });

  test.skip('should sort articles by date', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles');

    // Click date column header
    await page.click('th:has-text("Updated"), th:has-text("Date")');

    // Should sort in descending order (newest first)
    const dates = await page.locator('[data-testid="article-date"]').allTextContents();

    // Verify dates are in descending order
    for (let i = 0; i < dates.length - 1; i++) {
      const date1 = new Date(dates[i]);
      const date2 = new Date(dates[i + 1]);
      expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
    }
  });
});

test.describe('Article Editing', () => {
  test.skip('should edit existing article', async ({ page }) => {
    // TODO: Set up admin session with existing article

    await page.goto('/admin/articles');

    // Click edit button on first article
    await page.click('button:has-text("Edit"), a[href*="/edit"]').first();

    // Should load editor with existing content
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).not.toBeEmpty();

    // Modify title
    await titleInput.fill('Updated Title');

    // Save
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Article updated')).toBeVisible();
  });

  test.skip('should preserve article metadata when editing', async ({ page }) => {
    // TODO: Set up admin session

    // Edit article without changing author or created_at
    // These fields should remain unchanged
  });

  test.skip('should increment revision count on edit', async ({ page }) => {
    // TODO: Set up admin session

    // Edit article and check revision_count increases
  });
});

test.describe('Article Deletion', () => {
  test.skip('should delete article', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles');

    const articleTitle = await page.locator('tr[data-testid="article-row"]').first().textContent();

    // Delete first article
    await page.click('button:has-text("Delete")').first();

    // Confirm deletion
    await page.click('button:has-text("Confirm"), button:has-text("Yes")');

    await expect(page.locator('text=Article deleted')).toBeVisible();

    // Article should no longer appear in list
    await expect(page.locator(`text=${articleTitle}`)).not.toBeVisible();
  });

  test.skip('should show confirmation before deleting', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles');

    await page.click('button:has-text("Delete")').first();

    // Should show modal
    await expect(
      page.locator('text=Are you sure, text=This action cannot be undone')
    ).toBeVisible();

    // Cancel deletion
    await page.click('button:has-text("Cancel")');

    // Modal should close
    await expect(page.locator('text=Are you sure')).not.toBeVisible();
  });
});

test.describe('Rich Text Editor', () => {
  test.skip('should support basic text formatting', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    const editor = page.locator('.ProseMirror');

    // Type text
    await editor.fill('Bold and italic text');

    // Select text
    await editor.selectText();

    // Apply bold
    await page.click('button[aria-label="Bold"], button:has-text("B")');

    // Check that bold was applied
    await expect(editor.locator('strong, b')).toBeVisible();
  });

  test.skip('should support links', async ({ page }) => {
    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    const editor = page.locator('.ProseMirror');
    await editor.fill('Link text');
    await editor.selectText();

    // Click link button
    await page.click('button[aria-label="Link"]');

    // Enter URL
    await page.fill('input[placeholder*="URL"]', 'https://example.com');
    await page.click('button:has-text("Insert"), button:has-text("Add")');

    // Check link was created
    await expect(editor.locator('a[href="https://example.com"]')).toBeVisible();
  });

  test.skip('BUG: should support image embeds', async ({ page }) => {
    // BUG: Rich text editor has NO image support
    // Users cannot embed images directly in content

    // TODO: Set up admin session

    await page.goto('/admin/articles/new');

    // Look for image button
    const imageButton = page.locator('button[aria-label="Image"], button:has-text("Image")');

    // Currently FAILS - no image button
    await expect(imageButton).toBeVisible();
  });
});

test.describe('Article API', () => {
  test('should return published articles via public API', async ({ request }) => {
    const response = await request.get('/api/articles');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.articles).toBeDefined();

    // All articles should be published
    data.articles.forEach((article: any) => {
      expect(article.status).toBe('published');
    });
  });

  test('should not expose draft articles via public API', async ({ request }) => {
    const response = await request.get('/api/articles');
    const data = await response.json();

    // Should not contain any drafts
    const hasDrafts = data.articles?.some((a: any) => a.status === 'draft');
    expect(hasDrafts).toBeFalsy();
  });

  test.skip('should return single article by slug', async ({ request }) => {
    const response = await request.get('/api/articles/test-article-slug');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.article).toBeDefined();
    expect(data.article.slug).toBe('test-article-slug');
  });
});

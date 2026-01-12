/**
 * Media Library E2E Tests
 *
 * Tests for file upload, management, deletion, and access control
 *
 * KNOWN BUGS TESTED:
 * - No file ownership tracking (any user can delete any file)
 * - Insecure filename generation with Math.random()
 * - No file type/size validation before upload
 * - Hardcoded file listing limits
 * - Cache-busting creates new URLs on every page load
 */

import { test, expect } from '@playwright/test';
import {
  uploadFile,
  deleteFile,
  createTestImage,
  createTestPDF,
  createLargeFile,
  createTestVideo,
  assertFileExists,
  assertFileNotExists,
  searchFiles,
  filterByType,
} from './helpers/media';

test.describe('Media Library Access', () => {
  test('should require authentication to access media library', async ({ page }) => {
    await page.goto('/admin/media');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test.skip('should allow authenticated users to access media library', async ({ page }) => {
    // TODO: Set up authenticated session

    await page.goto('/admin/media');

    // Should show media library interface
    await expect(page.locator('h1, h2').filter({ hasText: /media|vault/i })).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('should display empty state when no files uploaded', async ({ page }) => {
    // TODO: Set up authenticated session with empty media library
    test.skip();

    await page.goto('/admin/media');

    await expect(
      page.locator('text=No files uploaded, text=Upload your first file')
    ).toBeVisible();
  });
});

test.describe('File Upload', () => {
  test.skip('should upload image file successfully', async ({ page }) => {
    // TODO: Set up authenticated session

    const testImage = createTestImage('test-upload.png');
    await uploadFile(page, testImage);

    // File should appear in grid
    await assertFileExists(page, testImage.name);
  });

  test.skip('should upload PDF file successfully', async ({ page }) => {
    // TODO: Set up authenticated session

    const testPDF = createTestPDF('test-document.pdf');
    await uploadFile(page, testPDF);

    await assertFileExists(page, testPDF.name);
  });

  test.skip('should upload video file successfully', async ({ page }) => {
    // TODO: Set up authenticated session

    const testVideo = createTestVideo('test-video.mp4');
    await uploadFile(page, testVideo);

    await assertFileExists(page, testVideo.name);
  });

  test.skip('BUG: should validate file size before upload (50MB limit)', async ({ page }) => {
    // BUG: No client-side validation for file size
    // Users can attempt to upload files >50MB and only get error from server

    // TODO: Set up authenticated session

    const largeFile = createLargeFile(51, 'large-file.bin'); // 51MB

    await page.goto('/admin/media');

    // Attempt upload
    const fileInput = page.locator('input[type="file"]');
    const tempPath = '/tmp/large-test-file.bin';
    await require('fs/promises').writeFile(tempPath, largeFile.content);
    await fileInput.setInputFiles(tempPath);

    // Should show error message BEFORE attempting upload
    await expect(page.locator('text=File too large, text=exceeds 50MB')).toBeVisible({
      timeout: 3000,
    });

    // Clean up
    await require('fs/promises').unlink(tempPath).catch(() => {});
  });

  test.skip('BUG: should validate file type before upload', async ({ page }) => {
    // BUG: No client-side MIME type validation
    // Users can upload any file type

    // TODO: Set up authenticated session

    await page.goto('/admin/media');

    // Create invalid file type
    const invalidFile = Buffer.from('#!/bin/bash\nrm -rf /');
    const tempPath = '/tmp/malicious-script.sh';
    await require('fs/promises').writeFile(tempPath, invalidFile);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempPath);

    // Should show error for disallowed file type
    await expect(page.locator('text=File type not allowed, text=Unsupported')).toBeVisible();

    // Clean up
    await require('fs/promises').unlink(tempPath).catch(() => {});
  });

  test.skip('should show upload progress during file upload', async ({ page }) => {
    // TODO: Set up authenticated session

    const testImage = createTestImage('progress-test.png');

    await page.goto('/admin/media');
    // Start upload but check for progress indicator
    // Currently only shows generic "Uploading..." state
  });

  test.skip('should handle multiple file uploads', async ({ page }) => {
    // TODO: Set up authenticated session

    const file1 = createTestImage('multi-1.png');
    const file2 = createTestImage('multi-2.png');
    const file3 = createTestImage('multi-3.png');

    // Upload all at once
    // Current implementation processes sequentially
  });
});

test.describe('File Management', () => {
  test.skip('should display uploaded files in grid', async ({ page }) => {
    // TODO: Set up authenticated session with existing files

    await page.goto('/admin/media');

    // Should show file grid
    const fileGrid = page.locator('[data-testid="file-grid"], .media-grid');
    await expect(fileGrid).toBeVisible();

    // Files should have thumbnails
    await expect(page.locator('img[alt*="preview"], .thumbnail')).toHaveCount(
      await page.locator('[data-testid="file-row"]').count()
    );
  });

  test.skip('should display file metadata (size, type, date)', async ({ page }) => {
    // TODO: Set up authenticated session

    const testImage = createTestImage('metadata-test.png');
    await uploadFile(page, testImage);

    // Click file to view details
    await page.click(`text=${testImage.name}`);

    // Should show metadata modal
    await expect(page.locator('text=File size:')).toBeVisible();
    await expect(page.locator('text=Type:')).toBeVisible();
    await expect(page.locator('text=Uploaded:')).toBeVisible();
  });

  test.skip('should search files by name', async ({ page }) => {
    // TODO: Set up authenticated session with multiple files

    await searchFiles(page, 'test-image');

    // Should filter results
    const visibleFiles = page.locator('[data-testid="file-row"]:visible');
    await expect(visibleFiles).toHaveCount(1);
  });

  test.skip('should filter files by type', async ({ page }) => {
    // TODO: Set up authenticated session with mixed file types

    await filterByType(page, 'images');

    // Should only show images
    const visibleFiles = page.locator('[data-testid="file-row"]:visible');
    const count = await visibleFiles.count();

    // All visible files should be images
    for (let i = 0; i < count; i++) {
      const fileType = await visibleFiles.nth(i).locator('.file-type').textContent();
      expect(fileType?.toLowerCase()).toContain('image');
    }
  });

  test.skip('BUG: should handle more than 100 files (pagination)', async ({ page }) => {
    // BUG: Hardcoded 100 file limit in media vault
    // Files beyond 100 are not shown

    // TODO: Set up authenticated session with 150+ files

    await page.goto('/admin/media');

    // Should show pagination controls
    await expect(page.locator('[data-testid="pagination"], .pagination')).toBeVisible();

    // Should be able to navigate to page 2
    await page.click('button:has-text("Next"), [aria-label*="next page"]');

    // Should show files 101-150
  });
});

test.describe('File Deletion', () => {
  test.skip('should delete file successfully', async ({ page }) => {
    // TODO: Set up authenticated session

    const testImage = createTestImage('delete-test.png');
    await uploadFile(page, testImage);

    // Delete the file
    await deleteFile(page, testImage.name);

    // File should be removed
    await assertFileNotExists(page, testImage.name);
  });

  test.skip('should show confirmation before deleting', async ({ page }) => {
    // TODO: Set up authenticated session

    await page.goto('/admin/media');

    const deleteButton = page.locator('button:has-text("Delete")').first();
    await deleteButton.click();

    // Should show confirmation dialog
    await expect(page.locator('text=Are you sure, text=delete')).toBeVisible();
  });

  test.skip('BUG: should only allow file owner to delete (SECURITY)', async ({ page, context }) => {
    // CRITICAL BUG: Any authenticated user can delete any file
    // No ownership tracking or enforcement

    // TODO: Set up two user sessions
    // User A uploads file
    // User B should NOT be able to delete User A's file

    // Currently FAILS - any user can delete any file
  });

  test.skip('should handle deletion of non-existent file gracefully', async ({ page }) => {
    // TODO: Set up authenticated session

    await page.goto('/admin/media');

    // Manually trigger delete API call for non-existent file
    const response = await page.request.delete('/api/media/non-existent-file.png');

    // Should return 404 and not crash
    expect(response.status()).toBe(404);
  });
});

test.describe('File URLs and Access', () => {
  test.skip('should generate public URLs for uploaded files', async ({ page }) => {
    // TODO: Set up authenticated session

    const testImage = createTestImage('url-test.png');
    await uploadFile(page, testImage);

    // Click file to view details
    await page.click(`text=${testImage.name}`);

    // Should show public URL
    const urlElement = page.locator('input[readonly][value*="http"], code:has-text("http")');
    await expect(urlElement).toBeVisible();

    // URL should be accessible
    const url = await urlElement.inputValue().catch(() => urlElement.textContent());
    if (url) {
      const response = await page.request.get(url);
      expect(response.status()).toBe(200);
    }
  });

  test.skip('BUG: should not create new URLs on every page load (cache-busting)', async ({
    page,
  }) => {
    // BUG: Cache-busting adds ?t=${Date.now()} on every render
    // This creates "new" URLs that aren't actually new

    // TODO: Set up authenticated session

    await page.goto('/admin/media');

    // Get URL for a file
    const img1 = page.locator('img[src*="supabase"]').first();
    const url1 = await img1.getAttribute('src');

    // Reload page
    await page.reload();

    // Get URL again
    const img2 = page.locator('img[src*="supabase"]').first();
    const url2 = await img2.getAttribute('src');

    // URLs should be the same (without cache-bust parameter)
    const cleanUrl1 = url1?.split('?')[0];
    const cleanUrl2 = url2?.split('?')[0];

    expect(cleanUrl1).toBe(cleanUrl2);
    // Currently FAILS - t parameter changes every time
  });

  test('should allow public access to uploaded media files', async ({ page }) => {
    // Media files should be publicly accessible (bucket is public)

    // Try to access a known media file URL without authentication
    const testUrl = 'http://localhost:3000/api/media/test.png';

    await page.goto(testUrl);

    // Should not redirect to login
    await expect(page).not.toHaveURL('/login');
  });
});

test.describe('Featured Image Upload (Articles)', () => {
  test.skip('should upload featured image when creating article', async ({ page }) => {
    // TODO: Set up authenticated admin session

    await page.goto('/admin/articles/new');

    // Find featured image upload
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await expect(fileInput).toBeVisible();

    const testImage = createTestImage('featured.png');
    const tempPath = '/tmp/featured-test.png';
    await require('fs/promises').writeFile(tempPath, testImage.content);

    await fileInput.setInputFiles(tempPath);

    // Should show preview
    await expect(page.locator('img[src*="featured"]')).toBeVisible({ timeout: 10000 });

    // Clean up
    await require('fs/promises').unlink(tempPath).catch(() => {});
  });

  test.skip('BUG: should use secure filename generation', async ({ page }) => {
    // BUG: Uses Math.random() for filename generation
    // Not cryptographically secure - could lead to collisions or predictability

    // TODO: Set up authenticated admin session

    await page.goto('/admin/articles/new');

    // Upload image and check generated filename
    // Should use crypto.randomBytes() or similar
    // Current implementation: `${Math.random().toString(36).substring(2)}-${Date.now()}`
  });

  test.skip('should handle featured image deletion gracefully', async ({ page }) => {
    // BUG: If admin deletes media file, article shows broken featured image

    // TODO: Create article with featured image
    // Delete the media file
    // View article - should show placeholder or fallback
  });
});

test.describe('Media Library Performance', () => {
  test.skip('BUG: should not load full-resolution images in thumbnail grid', async ({ page }) => {
    // BUG: Thumbnails load full-resolution images
    // Should use optimized thumbnails for performance

    // TODO: Set up authenticated session with large images

    await page.goto('/admin/media');

    // Check image sizes being loaded
    const responses = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('storage')),
      page.reload(),
    ]);

    // Thumbnails should be < 100KB
    // Full images could be several MB
  });

  test.skip('should load file list efficiently (avoid N+1 queries)', async ({ page }) => {
    // TODO: Set up authenticated session with many files

    await page.goto('/admin/media');

    // Should make single API call to list files
    // Not one call per file
  });
});

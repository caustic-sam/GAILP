/**
 * Media Library Test Helpers
 *
 * Utilities for testing media upload, management, and deletion
 */

import { Page, expect } from '@playwright/test';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

export interface TestFile {
  name: string;
  content: Buffer;
  mimeType: string;
  size: number;
}

/**
 * Create a test image file
 */
export function createTestImage(name = 'test-image.png'): TestFile {
  // Create a minimal PNG (1x1 transparent pixel)
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  return {
    name,
    content: pngData,
    mimeType: 'image/png',
    size: pngData.length,
  };
}

/**
 * Create a test PDF file
 */
export function createTestPDF(name = 'test-document.pdf'): TestFile {
  // Minimal valid PDF
  const pdfData = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n110\n%%EOF'
  );

  return {
    name,
    content: pdfData,
    mimeType: 'application/pdf',
    size: pdfData.length,
  };
}

/**
 * Create a large test file (for testing size limits)
 */
export function createLargeFile(sizeInMB: number, name = 'large-file.bin'): TestFile {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const content = Buffer.alloc(sizeInBytes, 0);

  return {
    name,
    content,
    mimeType: 'application/octet-stream',
    size: sizeInBytes,
  };
}

/**
 * Create a test video file (minimal MP4)
 */
export function createTestVideo(name = 'test-video.mp4'): TestFile {
  // Minimal valid MP4 (not a real video, but valid container)
  const mp4Data = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
    0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    0x6d, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08, 0x66, 0x72, 0x65, 0x65,
  ]);

  return {
    name,
    content: mp4Data,
    mimeType: 'video/mp4',
    size: mp4Data.length,
  };
}

/**
 * Upload a file to the media library
 */
export async function uploadFile(page: Page, file: TestFile) {
  // Navigate to media library
  await page.goto('/admin/media');

  // Create temporary file
  const tempPath = join('/tmp', file.name);
  await writeFile(tempPath, file.content);

  try {
    // Locate file input
    const fileInput = page.locator('input[type="file"]');

    // Upload file
    await fileInput.setInputFiles(tempPath);

    // Wait for upload to complete
    await expect(page.locator(`text=${file.name}`)).toBeVisible({ timeout: 15000 });

    return true;
  } finally {
    // Clean up temp file
    await unlink(tempPath).catch(() => {});
  }
}

/**
 * Delete a file from the media library
 */
export async function deleteFile(page: Page, fileName: string) {
  await page.goto('/admin/media');

  // Find file row
  const fileRow = page.locator(`[data-testid="file-row"]:has-text("${fileName}")`).first();

  // Click delete button
  const deleteButton = fileRow.locator('button:has-text("Delete"), button[aria-label*="Delete"]');
  await deleteButton.click();

  // Confirm deletion if modal appears
  const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
  if (await confirmButton.isVisible({ timeout: 1000 })) {
    await confirmButton.click();
  }

  // Wait for file to disappear
  await expect(page.locator(`text=${fileName}`).first()).not.toBeVisible({ timeout: 10000 });
}

/**
 * Get list of uploaded files
 */
export async function getUploadedFiles(page: Page): Promise<string[]> {
  await page.goto('/admin/media');

  // Wait for file grid to load
  await page.waitForSelector('[data-testid="file-grid"], .media-grid', { timeout: 10000 }).catch(() => {});

  // Extract file names
  const fileNames = await page.locator('[data-testid="file-name"], .file-name').allTextContents();

  return fileNames;
}

/**
 * Assert file exists in media library
 */
export async function assertFileExists(page: Page, fileName: string) {
  await page.goto('/admin/media');

  const fileElement = page.locator(`text=${fileName}`).first();
  await expect(fileElement).toBeVisible({ timeout: 10000 });
}

/**
 * Assert file does NOT exist in media library
 */
export async function assertFileNotExists(page: Page, fileName: string) {
  await page.goto('/admin/media');

  const fileElement = page.locator(`text=${fileName}`).first();
  await expect(fileElement).not.toBeVisible({ timeout: 5000 });
}

/**
 * Search for files in media library
 */
export async function searchFiles(page: Page, query: string) {
  await page.goto('/admin/media');

  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
  await searchInput.fill(query);

  // Wait for search results to update
  await page.waitForTimeout(500);
}

/**
 * Filter files by type
 */
export async function filterByType(page: Page, type: 'images' | 'videos' | 'documents' | 'all') {
  await page.goto('/admin/media');

  const filterButton = page.locator(`button:has-text("${type}"), [data-filter="${type}"]`);
  await filterButton.click();

  // Wait for filter to apply
  await page.waitForTimeout(500);
}

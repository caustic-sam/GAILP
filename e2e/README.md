# E2E Testing with Playwright

This directory contains end-to-end tests for the GAILP application using Playwright.

## 📁 Test Structure

```
e2e/
├── auth.spec.ts       # Authentication and OAuth tests
├── media.spec.ts      # Media library tests
├── articles.spec.ts   # Article management tests
├── rbac.spec.ts       # Role-based access control tests
├── helpers/
│   ├── auth.ts        # Authentication helper functions
│   └── media.ts       # Media file utilities
└── README.md          # This file
```

## 🚀 Quick Start

### Installation

Playwright is already installed. To install browser binaries:

```bash
npx playwright install
```

### Running Tests

```bash
# Run all tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e/auth.spec.ts

# Run with UI mode (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see the browser)
pnpm test:e2e:headed

# Debug a specific test
pnpm test:e2e:debug
```

### Recording New Tests

Playwright can **record your actions** and generate test code automatically!

```bash
# Start recording
pnpm test:e2e:codegen

# Or specify starting URL
pnpm test:e2e:codegen http://localhost:3000/admin
```

This opens a browser where Playwright records:
- Clicks
- Form fills
- Navigation
- Assertions

The code is generated in real-time!

## 📝 Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL`)
- **Browsers**: Chromium, Firefox, WebKit (Safari)
- **Mobile**: Pixel 5, iPhone 12
- **Screenshots**: Taken on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on first retry

## ⚙️ Environment Variables

Create `.env.local` for test-specific config:

```bash
# Test user credentials
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=test-password-123
TEST_READER_EMAIL=reader@test.com
TEST_READER_PASSWORD=test-password-123

# Playwright config
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

## 🧪 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');

    // Interact with page
    await page.click('button[type="submit"]');

    // Assert result
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Using Helpers

```typescript
import { loginWithGitHub, logout } from './helpers/auth';
import { uploadFile, createTestImage } from './helpers/media';

test('upload file after login', async ({ page }) => {
  // Login
  await loginWithGitHub(page, ADMIN_USER);

  // Upload file
  const testImage = createTestImage('my-image.png');
  await uploadFile(page, testImage);

  // Verify upload
  await expect(page.locator('text=my-image.png')).toBeVisible();
});
```

## 🐛 Known Issues & Skipped Tests

Many tests are marked with `test.skip()` because they require:
1. **OAuth setup** - GitHub OAuth credentials or mock
2. **Database seeding** - Test data in Supabase
3. **Session management** - Helper to create authenticated sessions

### Setting Up Test Authentication

To enable authenticated tests, you need to:

**Option 1: Create Test Endpoint**
```typescript
// app/api/test/create-session/route.ts
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { email, role } = await request.json();

  // Create session for test user
  // Return session tokens
}
```

**Option 2: Use Supabase Test Client**
```typescript
// e2e/helpers/auth.ts
export async function createTestSession(email: string, role: string) {
  // Use Supabase admin client to create user and session
  // Return session cookies
}
```

**Option 3: Mock OAuth**
```typescript
// Use Playwright to intercept OAuth requests
await page.route('**/api/auth/oauth', route => {
  route.fulfill({
    status: 302,
    headers: {
      'Location': '/auth/callback?code=mock-code'
    }
  });
});
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
pnpm test:e2e:report
```

This opens an interactive report showing:
- Test results
- Screenshots of failures
- Video recordings
- Trace files (for debugging)

## 🔍 Debugging Tests

### Playwright Inspector

```bash
pnpm test:e2e:debug
```

Features:
- Step through tests
- Inspect page state
- Edit locators
- Generate code

### VS Code Extension

Install "Playwright Test for VSCode" extension for:
- Run tests from editor
- Set breakpoints
- View traces
- Record tests

## 🎯 Test Coverage

Current test coverage includes:

### Authentication (`auth.spec.ts`)
- ✅ Login page display
- ✅ OAuth flow initiation
- ✅ Session management
- ✅ Logout functionality
- ⚠️ Security: Open redirect vulnerability
- ⚠️ Security: Missing CSRF protection
- ⚠️ Security: Unauthenticated API access

### Media Library (`media.spec.ts`)
- ✅ File upload (images, PDFs, videos)
- ✅ File deletion
- ✅ Search and filtering
- ⚠️ Bug: No file size validation
- ⚠️ Bug: No file type validation
- ⚠️ Bug: Any user can delete any file
- ⚠️ Bug: Hardcoded listing limits

### Articles (`articles.spec.ts`)
- ✅ Create draft and published articles
- ✅ Edit existing articles
- ✅ Delete articles
- ✅ Rich text editor
- ✅ Public API endpoints
- ⚠️ Bug: No image support in editor

### RBAC (`rbac.spec.ts`)
- ✅ Admin permissions
- ✅ Reader restrictions
- ✅ Unauthenticated redirects
- ⚠️ Bug: Missing API authentication
- ⚠️ Bug: Inconsistent role checks

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Locators Guide](https://playwright.dev/docs/locators)

## 🤝 Contributing

When adding new tests:

1. **Follow naming convention**: `feature.spec.ts`
2. **Use descriptive test names**: "should display error when email is invalid"
3. **Add test.skip() for incomplete tests** with TODO comments
4. **Document known bugs** in test comments
5. **Use helpers** for common operations
6. **Keep tests independent** - don't rely on test execution order

## ❓ FAQ

**Q: Why are so many tests skipped?**
A: They require authenticated sessions which need OAuth or test helpers to be set up.

**Q: Can I run tests against production?**
A: No! Tests may create/delete data. Only run against local dev or test environments.

**Q: How do I run a single test?**
A: `pnpm test:e2e -g "test name"` or use the UI mode and filter.

**Q: Tests are failing - what do I do?**
A: Check the HTML report for screenshots and traces. Use debug mode to step through.

**Q: How do I update the test selectors?**
A: Use codegen to record the action again, or use Playwright Inspector to find the right locator.

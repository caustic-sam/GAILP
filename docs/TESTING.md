# Testing Guide - World Papers

## Overview

Comprehensive test suite for the FreshRSS integration with 3-tier fallback system.

## Test Structure

```
__tests__/
├── fixtures/
│   └── freshrss.fixtures.ts     # Mock data for tests
├── lib/
│   └── freshrss.test.ts          # Unit tests for FreshRSS client
└── api/
    └── feeds.test.ts             # Integration tests for API endpoint
```

## Running Tests

### All Tests
```bash
pnpm test
```

### FreshRSS Tests Only
```bash
pnpm test:freshrss
```

### Watch Mode
```bash
pnpm test:watch
```

### With Coverage
```bash
pnpm test:coverage
```

### CI Mode
```bash
pnpm test:ci
```

### Full Validation
```bash
pnpm validate  # Runs typecheck + lint + tests
```

## Test Coverage

### Unit Tests (`__tests__/lib/freshrss.test.ts`)

#### Authentication Tests
- ✅ Successfully authenticate with valid credentials
- ✅ Fail authentication with invalid credentials
- ✅ Handle network errors during authentication
- ✅ Handle malformed authentication response

#### getItems Tests
- ✅ Fetch items successfully
- ✅ Exclude read items when requested
- ✅ Filter by newerThan timestamp
- ✅ Return empty array on API error
- ✅ Handle network errors gracefully
- ✅ Re-authenticate if auth token is missing

#### getUnreadCount Tests
- ✅ Fetch unread count successfully
- ✅ Return 0 if no unread items
- ✅ Handle errors and return 0

#### getSubscriptions Tests
- ✅ Fetch subscriptions successfully
- ✅ Return empty array on error

#### markAsRead Tests
- ✅ Mark item as read successfully
- ✅ Return false on error

#### toggleStar Tests
- ✅ Star item successfully
- ✅ Unstar item successfully
- ✅ Return false on error

#### transformItem Tests
- ✅ Transform FreshRSS item to World Papers format
- ✅ Handle missing optional fields
- ✅ Correctly convert Unix timestamp to Date

#### getFreshRSSClient Tests
- ✅ Return null if environment variables not configured
- ✅ Return client instance with valid configuration
- ✅ Return singleton instance

### Integration Tests (`__tests__/api/feeds.test.ts`)

#### Tier 1: Google Reader API
- ✅ Fetch feeds from FreshRSS Google Reader API successfully
- ✅ Filter by category
- ✅ Categorize items correctly
- ✅ Respect count parameter
- ✅ Use default count of 20 if not specified

#### Tier 2: RSS Fallback
- ✅ Fall back to RSS feed when Google Reader API fails
- ✅ Use FRESHRSS_RSS_URL environment variable
- ✅ Categorize RSS items correctly

#### Tier 3: Mock Data Fallback
- ✅ Fall back to mock data when both API and RSS fail
- ✅ Use mock data when FreshRSS is not configured
- ✅ Filter mock data by category
- ✅ Respect count parameter with mock data

#### Response Format
- ✅ Return correctly formatted feed items
- ✅ Include source and count in response
- ✅ Have correct Content-Type header

#### Error Handling
- ✅ Handle invalid count parameter gracefully
- ✅ Handle invalid category parameter

#### Performance
- ✅ Complete request within reasonable time

## Test Fixtures

All mock data is centralized in [__tests__/fixtures/freshrss.fixtures.ts](__tests__/fixtures/freshrss.fixtures.ts):

- `mockAuthResponse` - Authentication responses (success/error)
- `mockFreshRSSItems` - Sample feed items with various categories
- `mockStreamContentsResponse` - Google Reader API stream response
- `mockUnreadCountResponse` - Unread count API response
- `mockSubscriptionsResponse` - Subscriptions list API response
- `mockRSSFeed` - Sample RSS XML feed
- `mockEditTagSuccessResponse` - Tag edit success response

## CI/CD Integration

### GitHub Actions

Two workflows are configured:

#### 1. Test Workflow ([.github/workflows/test.yml](.github/workflows/test.yml))

Runs on:
- Push to `main`, `integration/*`, `feature/*` branches
- Pull requests to `main`

Jobs:
- **test**: Runs on Node 18.x and 20.x matrix
  - Type checking
  - Linting
  - Unit and integration tests
  - Build verification
  - Code coverage upload to Codecov

- **freshrss-tests**: Specific FreshRSS integration tests

- **validate**: Full validation suite
  - Comments PR with test results

#### 2. Vercel Deployment Workflow ([.github/workflows/vercel.yml](.github/workflows/vercel.yml))

Runs on push to `main`:

Jobs:
- **pre-deploy-tests**: Full validation before deployment
  - All tests must pass
  - FreshRSS integration tests with coverage

- **deploy-production**: Deploy to Vercel
  - Pull Vercel environment
  - Build with production FreshRSS credentials
  - Deploy to production
  - Post-deployment smoke tests
  - Comment on commit with deployment URL

### Required Secrets

Configure in GitHub repository settings:

```bash
# Vercel
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID        # Vercel organization ID
VERCEL_PROJECT_ID    # Vercel project ID

# FreshRSS Production
FRESHRSS_API_URL     # Production FreshRSS Google Reader API URL
FRESHRSS_API_USERNAME # FreshRSS username
FRESHRSS_API_PASSWORD # FreshRSS API password
FRESHRSS_RSS_URL     # FreshRSS RSS feed URL with token

# Optional
CODECOV_TOKEN        # Codecov upload token (for coverage reports)
```

## Test Environment Variables

Tests use mock credentials by default:

```bash
FRESHRSS_API_URL=http://test.freshrss.local/api/greader.php
FRESHRSS_API_USERNAME=testuser
FRESHRSS_API_PASSWORD=testpass
FRESHRSS_RSS_URL=http://test.freshrss.local/feed
NODE_ENV=test
```

## Writing New Tests

### Unit Test Template

```typescript
describe('MyFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const mockData = { /* ... */ };

    // Act
    const result = await myFunction(mockData);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Integration Test Template

```typescript
describe('GET /api/my-endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return data', async () => {
    const request = new Request('http://localhost:3000/api/my-endpoint');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('expected');
  });
});
```

## Troubleshooting

### Tests Failing Locally

1. **Clear Jest cache:**
   ```bash
   pnpm test --clearCache
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules .next
   pnpm install
   ```

3. **Check environment variables:**
   ```bash
   # Tests should work without .env.local
   # Mock data is used by default
   ```

### CI Failures

1. **Check Node version** - Tests run on Node 18.x and 20.x
2. **Review GitHub Actions logs** for specific errors
3. **Verify secrets are configured** in repository settings

### Coverage Issues

Generate local coverage report:
```bash
pnpm test:coverage
open coverage/lcov-report/index.html
```

## Best Practices

1. **Keep tests fast** - Mock external dependencies
2. **Test behavior, not implementation** - Focus on outcomes
3. **Use descriptive test names** - Clear intent
4. **Arrange-Act-Assert** pattern for clarity
5. **One assertion per test** when possible
6. **Clean up after tests** - Use `beforeEach` and `afterEach`

## Future Enhancements

- [ ] End-to-end tests with Playwright
- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Mutation testing
- [ ] Contract testing for FreshRSS API

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [FreshRSS API Docs](https://freshrss.github.io/FreshRSS/en/developers/06_GoogleReader_API.html)

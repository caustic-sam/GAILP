# Jira Epic & Stories: OAuth Migration

**Project:** GAILP
**Sprint:** Current
**Created:** 2025-11-06
**Branch:** `feature/oauth-migration`

---

## 🎯 EPIC: OAuth Authentication Migration

**Key:** `GAILP-15`
**Type:** Epic
**Priority:** Highest
**Status:** To Do → In Progress

### Description

Migrate from insecure OTP (magic link) authentication to OAuth-based authentication using GitHub and Apple Sign In. Implement WordPress-style role-based access control with differentiated navigation for admins and publishers.

### Business Value

- **Security:** OAuth is more secure than email magic links
- **UX:** Faster sign-in with social accounts (no email waiting)
- **Publisher Workflow:** WordPress-style content management with clear role separation
- **Scalability:** Foundation for future CMS features

### Goals

1. Replace OTP with OAuth (GitHub + Apple)
2. Implement 4-tier role system (admin, publisher, contributor, reader)
3. Create role-specific navigation (admin vs publisher sidebar)
4. Delete all OTP/magic link code

### Acceptance Criteria

- [ ] Users can sign in with GitHub
- [ ] Users can sign in with Apple
- [ ] No OTP code remains in codebase
- [ ] Admin sees full admin sidebar
- [ ] Publisher sees publishing-focused sidebar
- [ ] Contributor has content access only
- [ ] Reader has view-only access
- [ ] All tests pass
- [ ] Documentation updated

### Epic Link
Related to: Authentication System v0.1.0

---

## 📋 STORY 1: Configure OAuth Providers

**Key:** `GAILP-16`
**Parent:** `GAILP-15`
**Type:** Story
**Priority:** Highest
**Story Points:** 2

### User Story

> **As a user**, I want to sign in with GitHub or Apple
> **So that** I can access the platform quickly without waiting for email magic links

### Acceptance Criteria

- [ ] GitHub OAuth app created in GitHub Settings
- [ ] Apple Sign In configured in Apple Developer
- [ ] Both providers enabled in Supabase Dashboard
- [ ] Redirect URLs configured for local + production
- [ ] Environment variables documented
- [ ] Test accounts work for both providers

### Tasks

- [ ] **GAILP-16.1:** Create GitHub OAuth app (Client ID + Secret)
- [ ] **GAILP-16.2:** Configure Apple Sign In (Service ID + Key)
- [ ] **GAILP-16.3:** Add providers to Supabase Auth settings
- [ ] **GAILP-16.4:** Configure redirect URLs (localhost:3000, production)
- [ ] **GAILP-16.5:** Update `.env.example` with OAuth settings
- [ ] **GAILP-16.6:** Test OAuth flow for both providers

### Technical Notes

**GitHub OAuth:**
- Create at: https://github.com/settings/developers
- Callback URL: `http://localhost:3000/auth/callback`
- Callback URL (prod): `https://your-domain.vercel.app/auth/callback`

**Apple Sign In:**
- Configure at: https://developer.apple.com/account/resources/identifiers/list
- Service ID required
- Private key required
- Return URL must use HTTPS (use ngrok for local testing)

**Supabase Dashboard:**
- Navigate to: Authentication → Providers
- Enable: GitHub, Apple
- Add Client IDs and Secrets
- Configure redirect URLs

### Definition of Done

- Both OAuth providers work in Supabase
- Test user can sign in with GitHub
- Test user can sign in with Apple
- Credentials securely stored (not committed)

---

## 📋 STORY 2: Remove OTP Authentication

**Key:** `GAILP-17`
**Parent:** `GAILP-15`
**Type:** Story
**Priority:** High
**Story Points:** 3

### User Story

> **As a developer**, I want to remove all OTP/magic link code
> **So that** the codebase is cleaner and we don't maintain insecure auth methods

### Acceptance Criteria

- [ ] No OTP-related code in `contexts/AuthContext.tsx`
- [ ] Login page only shows OAuth buttons (GitHub, Apple)
- [ ] `signIn(email)` method removed
- [ ] Email templates disabled in Supabase
- [ ] No magic link references in docs
- [ ] Build succeeds with no errors

### Tasks

- [ ] **GAILP-17.1:** Remove `signInWithOtp` from AuthContext
- [ ] **GAILP-17.2:** Update login page UI (remove email input)
- [ ] **GAILP-17.3:** Remove email template configurations
- [ ] **GAILP-17.4:** Clean up unused OTP-related files
- [ ] **GAILP-17.5:** Update AUTH-SETUP.md documentation
- [ ] **GAILP-17.6:** Search codebase for "magic link" references

### Files to Modify

```
contexts/AuthContext.tsx      # Remove signInWithOtp
app/login/page.tsx             # Already OAuth-only ✅
lib/auth/types.ts              # Remove OTP types
docs/reviewed/AUTH-SETUP.md    # Update docs
```

### Definition of Done

- No OTP code in codebase (grep confirms)
- Login page is OAuth-only
- Build passes TypeScript checks
- Documentation reflects OAuth-only approach

---

## 📋 STORY 3: Implement WordPress-Style Role System

**Key:** `GAILP-18`
**Parent:** `GAILP-15`
**Type:** Story
**Priority:** High
**Story Points:** 5

### User Story

> **As a platform administrator**, I want a WordPress-style role hierarchy
> **So that** I can manage content creators and readers with appropriate permissions

### Acceptance Criteria

- [ ] 4 roles defined: admin, publisher, contributor, reader
- [ ] Database schema updated with new roles
- [ ] RLS policies enforced for each role
- [ ] Admin has full access to all areas
- [ ] Publisher can access publishing studio + media
- [ ] Contributor can create/edit content (no publish)
- [ ] Reader has view-only access
- [ ] Role assignment on user creation

### Role Definitions (WordPress-inspired)

#### Admin (Super Admin)
- **Capabilities:**
  - Full system access
  - User management
  - System settings
  - All publishing features
  - Security configuration
- **Navigation:** Full admin sidebar

#### Publisher (WordPress "Editor" equivalent)
- **Capabilities:**
  - Publish/unpublish articles
  - Edit all articles (own + others)
  - Access media library
  - Access publishing studio
  - Cannot manage users or system settings
- **Navigation:** Publisher sidebar (articles, media, publishing tools)

#### Contributor (WordPress "Contributor")
- **Capabilities:**
  - Create/edit own articles
  - Submit for review
  - Cannot publish
  - Limited media access
- **Navigation:** Basic content sidebar

#### Reader (WordPress "Subscriber")
- **Capabilities:**
  - View published content
  - No editing rights
- **Navigation:** No admin sidebar

### Tasks

- [ ] **GAILP-18.1:** Update `lib/auth/types.ts` with new roles
- [ ] **GAILP-18.2:** Create migration `003_wordpress_roles.sql`
- [ ] **GAILP-18.3:** Update RLS policies for new roles
- [ ] **GAILP-18.4:** Update auto-assignment logic (malsicario = admin)
- [ ] **GAILP-18.5:** Create role hierarchy constants
- [ ] **GAILP-18.6:** Add role check helpers (`canPublish()`, `canManageUsers()`)

### Database Migration

```sql
-- Update role enum to include publisher
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'publisher';

-- Update profiles table
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check,
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'publisher', 'contributor', 'reader'));

-- Update auto-assignment trigger
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'malsicario@malsicario.com' THEN
    NEW.role := 'admin';
  ELSE
    NEW.role := 'reader';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Definition of Done

- All 4 roles work in database
- RLS enforces role permissions
- Admin can assign roles to users
- Each role has appropriate access

---

## 📋 STORY 4: Create Role-Specific Navigation

**Key:** `GAILP-19`
**Parent:** `GAILP-15`
**Type:** Story
**Priority:** Medium
**Story Points:** 5

### User Story

> **As a publisher**, I want to see a publishing-focused sidebar
> **So that** I can quickly access articles, media, and publishing tools without admin clutter

### Acceptance Criteria

- [ ] Admin sees full admin sidebar (all system areas)
- [ ] Publisher sees publishing sidebar (articles, media, studio)
- [ ] Contributor sees contributor sidebar (own articles, drafts)
- [ ] Reader sees no sidebar
- [ ] Sidebar shows/hides based on server-side role check
- [ ] Mobile responsive behavior maintained

### Admin Sidebar (Super Admin Only)

```
🏠 Dashboard
📄 Articles (all)
🎨 Media Library
👥 Users
⚙️  Settings
🔒 Security
📊 Analytics
🧪 Testing Tools
```

### Publisher Sidebar (Content Management)

```
📄 Articles
  └ All Articles
  └ Add New
  └ Categories
  └ Tags
🎨 Media Library
  └ All Media
  └ Upload New
📰 Publishing Studio
  └ Publish Queue
  └ Scheduled Posts
  └ Drafts
📊 Content Analytics
```

### Contributor Sidebar (Limited)

```
📝 My Articles
  └ Drafts
  └ Pending Review
  └ Published
📄 New Article
📚 Resources
```

### Tasks

- [ ] **GAILP-19.1:** Create `components/admin/AdminSidebar.tsx`
- [ ] **GAILP-19.2:** Create `components/publisher/PublisherSidebar.tsx`
- [ ] **GAILP-19.3:** Create `components/contributor/ContributorSidebar.tsx`
- [ ] **GAILP-19.4:** Update `components/RightSidebar.tsx` with role routing
- [ ] **GAILP-19.5:** Add server-side role check in layout
- [ ] **GAILP-19.6:** Style sidebars to match GAILP palette

### Component Structure

```tsx
// components/RightSidebar.tsx
export async function RightSidebar() {
  const user = await getCurrentUser();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminSidebar />;
    case 'publisher':
      return <PublisherSidebar />;
    case 'contributor':
      return <ContributorSidebar />;
    default:
      return null; // readers see nothing
  }
}
```

### Definition of Done

- Admin sidebar shows all system areas
- Publisher sidebar shows publishing tools
- Contributor sidebar shows limited content access
- Reader sees no sidebar
- Navigation is intuitive and WordPress-like

---

## 📋 STORY 5: Implement OAuth Sign-In Flow

**Key:** `GAILP-20`
**Parent:** `GAILP-15`
**Type:** Story
**Priority:** Highest
**Story Points:** 3

### User Story

> **As a new user**, I want to sign in with one click
> **So that** I can access the platform immediately

### Acceptance Criteria

- [ ] Login page shows GitHub and Apple buttons
- [ ] Clicking button redirects to provider OAuth
- [ ] After auth, user redirects to /admin
- [ ] Session persists across refreshes
- [ ] Error states handled gracefully
- [ ] Loading states shown during redirect
- [ ] First-time users auto-assigned 'reader' role

### Tasks

- [ ] **GAILP-20.1:** Update login page with OAuth buttons
- [ ] **GAILP-20.2:** Style OAuth buttons (GitHub black, Apple white)
- [ ] **GAILP-20.3:** Implement callback handler
- [ ] **GAILP-20.4:** Add error handling for failed auth
- [ ] **GAILP-20.5:** Add loading spinner during OAuth redirect
- [ ] **GAILP-20.6:** Test first-time vs returning user flows

### OAuth Flow Diagram

```
1. User clicks "Sign in with GitHub"
2. Redirect to /api/auth/oauth?provider=github
3. Server redirects to GitHub OAuth
4. User approves (GitHub UI)
5. GitHub redirects to /auth/callback?code=xxx
6. Server exchanges code for session
7. User profile created/updated
8. Redirect to /admin (or original destination)
```

### Definition of Done

- Both OAuth providers work end-to-end
- Session persists properly
- Error states show user-friendly messages
- First-time users get default 'reader' role

---

## 📊 Sprint Summary

### Total Story Points: 18
- Story 1 (Config): 2 points
- Story 2 (Remove OTP): 3 points
- Story 3 (Roles): 5 points
- Story 4 (Navigation): 5 points
- Story 5 (OAuth Flow): 3 points

### Estimated Timeline: 1 Sprint (2 weeks)
- Week 1: Stories 1, 2, 5 (OAuth working)
- Week 2: Stories 3, 4 (Roles + Navigation)

### Dependencies
- Story 1 must complete before Story 5
- Story 3 must complete before Story 4

### Risk Mitigation
- **Apple Sign In complexity:** May need ngrok for local testing
- **Role migration:** Backup database before running migrations
- **Breaking changes:** Keep feature flag for rollback

---

## 🎯 How to Use These Jira Tickets

### Copy to Jira

1. **Create Epic** (`GAILP-15`):
   - Go to Jira → Create Issue
   - Type: Epic
   - Copy Epic section above

2. **Create Stories** (`GAILP-16` through `GAILP-20`):
   - For each story, create a new issue
   - Type: Story
   - Link to Epic: `GAILP-15`
   - Copy acceptance criteria and tasks

3. **Create Tasks** (within each story):
   - Each task becomes a subtask in Jira
   - Example: `GAILP-16.1`, `GAILP-16.2`, etc.

### Workflow Transitions

```
TO DO → IN PROGRESS → IN REVIEW → DONE
```

**Move to IN PROGRESS when:**
- You start coding the feature

**Move to IN REVIEW when:**
- You create a PR for the story

**Move to DONE when:**
- PR is merged to main
- Acceptance criteria verified

---

## 📝 Branch Strategy

```
main (protected)
  └── feature/oauth-migration (current)
       └── Story PRs (optional sub-branches)
```

**Workflow:**
1. Work on `feature/oauth-migration`
2. Commit after each task
3. When epic complete → PR to main
4. Squash merge to keep history clean

---

**Created by:** Claude + John (Team GAILP)
**Epic Owner:** @malsicario
**Sprint:** Current
**Target Completion:** 2 weeks

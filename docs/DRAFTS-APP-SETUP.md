# Drafts App Integration - Quick Posts

This guide explains how to set up the Drafts app on your iPhone to post quick thoughts directly to your GAILP site.

---

## 📱 What is Drafts?

Drafts is a powerful note-taking app for iOS/Mac that can send text to external APIs via custom actions. Perfect for quickly capturing thoughts and posting them to your site.

**Download:** [Drafts on App Store](https://apps.apple.com/us/app/drafts/id1236254471)

---

## 🔧 Setup Instructions

### Step 1: Get Your Secret Token

1. Open your `.env.local` file
2. Find or add the `QUICK_POST_SECRET` variable:

```bash
QUICK_POST_SECRET=your-secret-token-here
```

**Generate a secure token:**
```bash
# On Mac/Linux, run this command:
openssl rand -hex 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Copy your token for the next step

---

### Step 2: Create Drafts Action

1. Open the **Drafts app** on your iPhone
2. Tap the **Actions** button (bottom toolbar)
3. Tap **+** (top right) to create a new action
4. Configure the action:

**Action Name:** Post to GAILP

**Steps:**
- Tap **+ Add Step**
- Choose **Script**
- Paste the script below

---

### Step 3: Add the Script

```javascript
// Quick Post to GAILP
// ==================

// Configuration
const WEBHOOK_URL = "https://yourdomain.com/api/webhooks/quick-post";
const SECRET_TOKEN = "YOUR_SECRET_TOKEN_HERE"; // Replace with your actual token

// Get draft content
const content = draft.content;

// Validate content
if (!content || content.trim().length === 0) {
  app.displayErrorMessage("Cannot post empty content");
  context.fail();
}

// Create HTTP request
const http = HTTP.create();

const response = http.request({
  "url": WEBHOOK_URL,
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "x-quick-post-token": SECRET_TOKEN
  },
  "data": {
    "content": content
  }
});

// Handle response
if (response.success && response.statusCode === 201) {
  const result = JSON.parse(response.responseText);
  app.displaySuccessMessage("Posted to GAILP!");
  console.log("Post ID: " + result.post.id);
  console.log("Hashtags: " + result.post.hashtags.join(", "));

  // Optional: Archive the draft after successful post
  // draft.isArchived = true;

} else if (response.statusCode === 401) {
  app.displayErrorMessage("Authentication failed - check your token");
  console.log("Error: Invalid token");
  context.fail();

} else {
  app.displayErrorMessage("Failed to post: " + response.statusCode);
  console.log("Status: " + response.statusCode);
  console.log("Response: " + response.responseText);
  context.fail();
}
```

**Important:** Replace these values in the script:
- `YOUR_DOMAIN.COM` → Your actual domain (e.g., `gailp.ai`)
- `YOUR_SECRET_TOKEN_HERE` → Your `QUICK_POST_SECRET` from Step 1

---

### Step 4: Configure Action Settings

1. **Icon:** Choose an icon (e.g., cloud, send, or message icon)
2. **Color:** Pick a color (blue or green recommended)
3. **After Success:** Choose "Do Nothing" or "Archive" (if you want drafts auto-archived)
4. Tap **Done** to save

---

## 🚀 How to Use

1. Open **Drafts** app
2. Type your quick thought (up to 280 characters recommended)
3. Use `#hashtags` to tag your post
4. Swipe left on the draft or tap the Actions button
5. Select **Post to GAILP**
6. See success message!

**Example Post:**
```
Just discovered a great new AI policy framework from Singapore!
Excited to dive deeper into their approach. #AIPolicy #Singapore
```

---

## ✅ Verification

### Test the API Endpoint

You can test that your webhook is working using curl:

```bash
curl -X POST https://yourdomain.com/api/webhooks/quick-post \
  -H "Content-Type: application/json" \
  -H "x-quick-post-token: YOUR_SECRET_TOKEN" \
  -d '{
    "content": "Test post from curl! #test"
  }'
```

Expected response:
```json
{
  "success": true,
  "post": {
    "id": "...",
    "content": "Test post from curl! #test",
    "hashtags": ["test"],
    "status": "draft",
    "created_at": "..."
  },
  "message": "Quick post created successfully! Review and publish in admin dashboard."
}
```

### Check the Admin Dashboard

1. Go to `/admin/quick-posts`
2. You should see your test post in **Draft** status
3. Click **Publish** to make it live
4. View it publicly at `/quick-posts`

---

## 🔍 Troubleshooting

### "Authentication failed" error

**Problem:** Invalid or missing token

**Solution:**
1. Double-check your `QUICK_POST_SECRET` in `.env.local`
2. Ensure you copied the exact token into the Drafts script
3. Restart your development server after changing `.env.local`

### "Failed to post: 500" error

**Problem:** Server error

**Solution:**
1. Check your database is running
2. Run the migration: `010_quick_posts.sql`
3. Check server logs for detailed error

### Posts not appearing

**Problem:** Posts created as drafts, not auto-published

**Solution:** This is expected! Posts require manual review:
1. Go to `/admin/quick-posts`
2. Find your post in Draft status
3. Click **Publish** to make it live

---

## 🎨 Customization Ideas

### Auto-Publish Trusted Sources

Modify the API endpoint to auto-publish posts from Drafts app:

```typescript
// In app/api/webhooks/quick-post/route.ts
status: 'published', // Change from 'draft'
published_at: new Date().toISOString(), // Add publish timestamp
```

### Add Media Support

The API already supports `media_url`. To include images:

```javascript
// In your Drafts script
"data": {
  "content": content,
  "media_url": "https://example.com/image.jpg" // Add image URL
}
```

### Character Limit Warning

Add a pre-check in your Drafts script:

```javascript
if (content.length > 280) {
  if (!confirm("Post is longer than 280 characters. Continue?")) {
    context.cancel();
  }
}
```

---

## 📚 Related Documentation

- [Quick Posts API Reference](../app/api/webhooks/quick-post/route.ts)
- [Admin UI](../app/admin/quick-posts/page.tsx)
- [Public Display](../app/quick-posts/page.tsx)
- [Database Schema](../supabase/migrations/010_quick_posts.sql)

---

## 💡 Tips

1. **Keep it short:** Aim for <280 characters for best readability
2. **Use hashtags:** They auto-extract and display beautifully
3. **Review before publishing:** Posts default to draft status for quality control
4. **Archive processed drafts:** Enable "Archive" after success in action settings
5. **Use keyboard shortcuts:** Set up Drafts keyboard shortcut for ultra-fast posting

---

**Happy micro-blogging!** 📱✨

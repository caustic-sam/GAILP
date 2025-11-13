# Confluence Documentation Sync

Automatically sync documentation files to Atlassian Confluence.

## Setup

### 1. Set Environment Variables

```bash
export ATLASSIAN_USER="your-email@example.com"
export ATLASSIAN_TOKEN="your-atlassian-api-token"
```

To get an API token:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "GAILP Doc Sync")
4. Copy the token (you won't see it again!)

### 2. Update Space Key

Edit `scripts/sync_confluence.py` and set your Confluence space key:

```python
SPACE_KEY = "GAILP"  # Change to your space
```

### 3. Manual Sync

Run the sync script manually:

```bash
python3 scripts/sync_confluence.py
```

### 4. Automatic Sync (Optional)

Set up a git post-commit hook to sync automatically:

```bash
# Copy the hook
cp scripts/hooks/post-commit .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

Or add to your `.git/hooks/post-commit`:

```bash
#!/bin/bash
# Auto-sync docs to Confluence after commit
if [ -f "scripts/sync_confluence.py" ]; then
  python3 scripts/sync_confluence.py
fi
```

## Synced Files

The following files are automatically synced:

- `AGENT-BRIEFING.md` → "GAILP - Agent Briefing"
- `CURRENT-WORK.md` → "GAILP - Current Work"
- `REMAINING-UI-TASKS.md` → "GAILP - Remaining UI Tasks"
- `README.md` → "GAILP - Project README"
- `MINOR-RELEASE-PLAN.md` → "GAILP - Minor Release Plan"

## Adding New Files

Edit `scripts/sync_confluence.py` and add to `DOCS_TO_SYNC`:

```python
DOCS_TO_SYNC = [
    # ... existing docs ...
    {
        "file": "NEW-DOC.md",
        "title": "GAILP - New Document",
        "parent": None  # Or parent page ID
    }
]
```

## Troubleshooting

### "No Atlassian token configured"

Set the `ATLASSIAN_TOKEN` environment variable.

### "Creation failed: 403"

Your API token may not have permission to create pages in the space. Check:
- Token is valid and not expired
- Your user has write access to the Confluence space
- Space key is correct

### "Space not found"

Update the `SPACE_KEY` variable to match your Confluence space.

## Markdown Conversion Notes

The current converter handles basic Markdown:
- Headers (`#`, `##`, `###`)
- Lists (`-`)
- Code blocks (` ``` `)

For advanced formatting, consider using:
- [mistletoe](https://github.com/miyuchina/mistletoe) with Confluence renderer
- [markdown2confluence](https://github.com/chunliu/markdown2confluence)
- [atlassian-python-api](https://github.com/atlassian-api/atlassian-python-api)

## Security

⚠️ **Never commit your API token to git!**

- Use environment variables only
- Add to `.env.local` (already in `.gitignore`)
- For CI/CD, use secret management (GitHub Secrets, etc.)

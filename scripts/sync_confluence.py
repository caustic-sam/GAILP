#!/usr/bin/env python3
"""
Sync documentation files to Atlassian Confluence
Requires: ATLASSIAN_USER, ATLASSIAN_TOKEN environment variables
"""

import os
import sys
import requests
import json
from pathlib import Path
from requests.auth import HTTPBasicAuth

ATLASSIAN_URL = "https://cortexaillc.atlassian.net"
ATLASSIAN_USER = os.getenv("ATLASSIAN_USER", "malsicario@malsicario.com")
ATLASSIAN_TOKEN = os.getenv("ATLASSIAN_TOKEN", "")
SPACE_KEY = "GAILP"  # Update to your actual Confluence space

# Files to sync
DOCS_TO_SYNC = [
    {
        "file": "AGENT-BRIEFING.md",
        "title": "GAILP - Agent Briefing",
        "parent": None
    },
    {
        "file": "CURRENT-WORK.md",
        "title": "GAILP - Current Work",
        "parent": None
    },
    {
        "file": "REMAINING-UI-TASKS.md",
        "title": "GAILP - Remaining UI Tasks",
        "parent": None
    },
    {
        "file": "README.md",
        "title": "GAILP - Project README",
        "parent": None
    },
    {
        "file": "MINOR-RELEASE-PLAN.md",
        "title": "GAILP - Minor Release Plan",
        "parent": None
    }
]


def convert_markdown_to_confluence(md_content: str) -> str:
    """
    Convert Markdown to Confluence storage format.
    This is a simplified version - for production use a proper converter.
    """
    # Basic conversions
    content = md_content

    # Convert headers
    content = content.replace('### ', '<h3>').replace('\n', '</h3>\n', 1)
    content = content.replace('## ', '<h2>').replace('\n', '</h2>\n', 1)
    content = content.replace('# ', '<h1>').replace('\n', '</h1>\n', 1)

    # Convert code blocks
    content = content.replace('```', '<code>')

    # Convert lists (simplified)
    lines = content.split('\n')
    converted = []
    in_list = False

    for line in lines:
        if line.strip().startswith('- '):
            if not in_list:
                converted.append('<ul>')
                in_list = True
            converted.append(f'<li>{line.strip()[2:]}</li>')
        else:
            if in_list:
                converted.append('</ul>')
                in_list = False
            converted.append(line)

    if in_list:
        converted.append('</ul>')

    return '\n'.join(converted)


def get_page_id(title: str) -> str:
    """Check if a page with the given title exists in the space."""
    if not ATLASSIAN_TOKEN:
        return None

    auth = HTTPBasicAuth(ATLASSIAN_USER, ATLASSIAN_TOKEN)
    headers = {"Accept": "application/json"}

    url = f"{ATLASSIAN_URL}/wiki/rest/api/content"
    params = {
        "spaceKey": SPACE_KEY,
        "title": title,
        "type": "page"
    }

    try:
        response = requests.get(url, headers=headers, auth=auth, params=params)
        if response.status_code == 200:
            data = response.json()
            if data.get('results'):
                return data['results'][0]['id']
    except Exception as e:
        print(f"  ⚠️  Error checking page: {e}")

    return None


def create_or_update_page(file_path: str, title: str, parent_id: str = None):
    """Create or update a Confluence page with content from a markdown file."""
    print(f"\n📄 Processing: {title}")

    # Check if file exists
    if not Path(file_path).exists():
        print(f"  ⚠️  File not found: {file_path}")
        return

    # Check for credentials
    if not ATLASSIAN_TOKEN:
        print(f"  ⚠️  No Atlassian token configured - skipping sync")
        print(f"  💡 Set ATLASSIAN_TOKEN environment variable to enable sync")
        return

    # Read markdown file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except Exception as e:
        print(f"  ❌ Error reading file: {e}")
        return

    # Convert to Confluence format
    confluence_content = convert_markdown_to_confluence(md_content)

    # Check if page exists
    page_id = get_page_id(title)

    auth = HTTPBasicAuth(ATLASSIAN_USER, ATLASSIAN_TOKEN)
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    if page_id:
        # Update existing page
        print(f"  → Updating existing page (ID: {page_id})...")

        # Get current version
        get_url = f"{ATLASSIAN_URL}/wiki/rest/api/content/{page_id}"
        try:
            version_response = requests.get(get_url, headers=headers, auth=auth)
            if version_response.status_code == 200:
                current_version = version_response.json()['version']['number']

                # Update page
                update_url = f"{ATLASSIAN_URL}/wiki/rest/api/content/{page_id}"
                payload = {
                    "version": {"number": current_version + 1},
                    "title": title,
                    "type": "page",
                    "body": {
                        "storage": {
                            "value": confluence_content,
                            "representation": "storage"
                        }
                    }
                }

                update_response = requests.put(update_url, headers=headers, auth=auth, json=payload)
                if update_response.status_code == 200:
                    print(f"  ✅ Successfully updated!")
                else:
                    print(f"  ❌ Update failed: {update_response.status_code}")
                    print(f"     {update_response.text[:200]}")
        except Exception as e:
            print(f"  ❌ Error updating page: {e}")
    else:
        # Create new page
        print(f"  → Creating new page...")

        create_url = f"{ATLASSIAN_URL}/wiki/rest/api/content"
        payload = {
            "type": "page",
            "title": title,
            "space": {"key": SPACE_KEY},
            "body": {
                "storage": {
                    "value": confluence_content,
                    "representation": "storage"
                }
            }
        }

        if parent_id:
            payload["ancestors"] = [{"id": parent_id}]

        try:
            create_response = requests.post(create_url, headers=headers, auth=auth, json=payload)
            if create_response.status_code == 200:
                print(f"  ✅ Successfully created!")
            else:
                print(f"  ❌ Creation failed: {create_response.status_code}")
                print(f"     {create_response.text[:200]}")
        except Exception as e:
            print(f"  ❌ Error creating page: {e}")


def main():
    """Main sync function."""
    print("🚀 Starting Confluence documentation sync...")
    print(f"   Space: {SPACE_KEY}")
    print(f"   URL: {ATLASSIAN_URL}")

    if not ATLASSIAN_TOKEN:
        print("\n⚠️  WARNING: ATLASSIAN_TOKEN not set!")
        print("   Documentation will NOT be synced to Confluence.")
        print("   To enable sync, set the ATLASSIAN_TOKEN environment variable.")
        print("\n   Example:")
        print("   export ATLASSIAN_TOKEN='your-token-here'")
        print("   python3 scripts/sync_confluence.py")
        return

    print("\n" + "="*50)

    for doc in DOCS_TO_SYNC:
        create_or_update_page(
            file_path=doc["file"],
            title=doc["title"],
            parent_id=doc.get("parent")
        )

    print("\n" + "="*50)
    print("✅ Confluence sync complete!")
    print("\n💡 Next steps:")
    print("   - Review pages in Confluence")
    print("   - Set up git hooks for automatic sync")
    print("   - Configure parent/child page relationships")


if __name__ == "__main__":
    main()

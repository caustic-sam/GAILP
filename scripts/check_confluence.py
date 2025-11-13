#!/usr/bin/env python3
"""Check for pages in Confluence space"""

import os
import requests
from requests.auth import HTTPBasicAuth

ATLASSIAN_URL = "https://cortexaillc.atlassian.net"
ATLASSIAN_USER = os.getenv("ATLASSIAN_USER", "malsicario@malsicario.com")
ATLASSIAN_TOKEN = os.getenv("ATLASSIAN_TOKEN", "")
SPACE_KEY = "GAILP"

auth = HTTPBasicAuth(ATLASSIAN_USER, ATLASSIAN_TOKEN)
headers = {"Accept": "application/json"}

# Get all pages in space
url = f"{ATLASSIAN_URL}/wiki/rest/api/content"
params = {
    "spaceKey": SPACE_KEY,
    "type": "page",
    "limit": 50,
    "expand": "version,body.storage"
}

response = requests.get(url, headers=headers, auth=auth, params=params)

if response.status_code == 200:
    data = response.json()
    pages = data.get('results', [])

    print(f"\n📚 Found {len(pages)} pages in {SPACE_KEY} space:\n")

    for page in pages:
        title = page['title']
        page_id = page['id']
        updated = page['version']['when']

        print(f"  • {title}")
        print(f"    ID: {page_id}")
        print(f"    Updated: {updated}")

        # Check if it's a QA notes page
        if 'QA' in title or 'qa' in title.lower() or 'test' in title.lower():
            print(f"    ⭐ This looks like QA notes!")
            # Get the content
            content = page.get('body', {}).get('storage', {}).get('value', '')
            if content:
                print(f"    Preview: {content[:200]}...")
        print()
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)

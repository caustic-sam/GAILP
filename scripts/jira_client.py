#!/usr/bin/env python3
import requests
import json
import os
from requests.auth import HTTPBasicAuth

ATLASSIAN_URL = "https://cortexaillc.atlassian.net"
ATLASSIAN_USER = os.getenv("ATLASSIAN_USER", "malsicario@malsicario.com")
ATLASSIAN_TOKEN = os.getenv("ATLASSIAN_TOKEN", "")

auth = HTTPBasicAuth(ATLASSIAN_USER, ATLASSIAN_TOKEN)
headers = {"Accept": "application/json"}

# Search for all issues in KAN project
print("Searching for issues in KAN project...")
jql = "project=KAN"
url = f"{ATLASSIAN_URL}/rest/api/3/search/jql"
params = {"jql": jql, "maxResults": 50}

response = requests.get(url, headers=headers, auth=auth, params=params)

if response.status_code == 200:
    data = response.json()
    total = data.get('total', 0)
    print(f"\nTotal issues: {total}\n")

    issues = data.get('issues', [])
    if issues:
        for issue in issues:
            key = issue['key']
            summary = issue['fields']['summary']
            status = issue['fields']['status']['name']
            print(f"{key}: {summary} [{status}]")
    else:
        print("No issues found in KAN project")
else:
    print(f"Error: {response.status_code}")
    print(response.text)

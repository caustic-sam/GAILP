# Atlassian MCP Server Setup Guide

This guide will help you set up the Atlassian Model Context Protocol (MCP) server to integrate Jira and Confluence with Claude Desktop.

## Overview

The Atlassian MCP server enables Claude to interact directly with your Atlassian Jira and Confluence instances, allowing you to:
- Query Jira issues and projects
- Search and retrieve Confluence pages
- Perform actions on both platforms through natural language

## Prerequisites

- Claude Desktop installed
- Access to an Atlassian Cloud instance (Jira/Confluence)
- Atlassian API token
- Node.js and npm installed

## Step 1: Generate Atlassian API Token

1. Log in to your Atlassian account at https://id.atlassian.com
2. Navigate to **Security** → **API tokens**
3. Click **Create API token**
4. Give it a descriptive name (e.g., "Claude MCP Server")
5. Copy the generated token (you won't be able to see it again)

## Step 2: Gather Your Credentials

You'll need three pieces of information:

1. **Instance URL**: Your Atlassian instance URL (e.g., `https://yourcompany.atlassian.net`)
2. **Username**: Your Atlassian email address
3. **API Token**: The token you generated in Step 1

## Step 3: Configure Claude Desktop

### Locate the Configuration File

The Claude Desktop configuration file is located at:

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Edit the Configuration

Open `claude_desktop_config.json` in your text editor and add the Atlassian MCP server configuration:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": [
        "-y",
        "atlassian-mcp"
      ],
      "env": {
        "ATLASSIAN_INSTANCE_URL": "https://yourcompany.atlassian.net",
        "ATLASSIAN_USERNAME": "your-email@example.com",
        "ATLASSIAN_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

**Important:** Replace the placeholder values with your actual credentials:
- `https://yourcompany.atlassian.net` → Your Atlassian instance URL
- `your-email@example.com` → Your Atlassian email address
- `your-api-token-here` → Your API token from Step 1

### Multiple MCP Servers

If you already have other MCP servers configured, simply add the `atlassian` entry to the existing `mcpServers` object:

```json
{
  "mcpServers": {
    "existing-server": {
      ...
    },
    "atlassian": {
      "command": "npx",
      "args": [
        "-y",
        "atlassian-mcp"
      ],
      "env": {
        "ATLASSIAN_INSTANCE_URL": "https://yourcompany.atlassian.net",
        "ATLASSIAN_USERNAME": "your-email@example.com",
        "ATLASSIAN_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

After saving your configuration:

1. Quit Claude Desktop completely
2. Restart Claude Desktop
3. The Atlassian MCP server will automatically start on launch

## Step 5: Verify the Connection

You can verify the connection is working by testing the APIs directly:

### Test Jira API:
```bash
curl -u "your-email@example.com:your-api-token" \
  "https://yourcompany.atlassian.net/rest/api/3/myself"
```

### Test Confluence API:
```bash
curl -u "your-email@example.com:your-api-token" \
  "https://yourcompany.atlassian.net/wiki/rest/api/space"
```

Both commands should return JSON responses without errors.

## Troubleshooting

### Common Issues

#### 1. Package Not Found Error

**Error:** `@modelcontextprotocol/server-atlassian` not found

**Solution:** Ensure you're using the correct package name `atlassian-mcp` in your configuration, not `@modelcontextprotocol/server-atlassian`.

#### 2. Authentication Errors

**Error:** 401 Unauthorized

**Solutions:**
- Verify your API token is correct and hasn't expired
- Ensure your username is the full email address
- Check that your Atlassian account has access to the instance

#### 3. MCP Server Not Starting

**Solutions:**
- Verify Node.js and npm are installed: `node --version` and `npm --version`
- Check the configuration file for JSON syntax errors
- Review Claude Desktop logs for error messages

#### 4. Cannot Access Specific Jira/Confluence Resources

**Solutions:**
- Verify your account has appropriate permissions
- Check that the resources exist and are accessible
- Ensure you're using the correct instance URL

## Alternative Atlassian MCP Packages

While this guide uses `atlassian-mcp`, there are other community packages available:

- **`@phuc-nt/mcp-atlassian-server`** - Feature-rich with 48+ capabilities
- **`@aashari/mcp-server-atlassian-jira`** - Jira-specific server
- **`@aashari/mcp-server-atlassian-confluence`** - Confluence-specific server
- **`@ecubelabs/atlassian-mcp`** - Alternative general-purpose server

To use a different package, simply replace `atlassian-mcp` in the `args` array with your preferred package name.

## Security Best Practices

1. **Protect Your API Token**: Never commit configuration files with API tokens to version control
2. **Use Environment Variables**: Consider using environment variables for sensitive data
3. **Token Rotation**: Regularly rotate your API tokens
4. **Least Privilege**: Use an account with minimum required permissions
5. **Audit Access**: Regularly review API token usage in Atlassian settings

## Usage Examples

Once configured, you can interact with Atlassian through Claude:

- "Show me my open Jira tickets"
- "Search Confluence for documentation about authentication"
- "Create a new Jira issue for bug tracking"
- "What are the recent updates in the Design space on Confluence?"

## Resources

- [Atlassian MCP npm package](https://www.npmjs.com/package/atlassian-mcp)
- [Atlassian API Documentation](https://developer.atlassian.com/cloud/)
- [Model Context Protocol Specification](https://github.com/modelcontextprotocol)
- [Claude Desktop Documentation](https://docs.claude.com/)

## Support

For issues specific to:
- **MCP Server Package**: Visit the [atlassian-mcp GitHub repository](https://github.com/parthav46/atlassian-mcp)
- **Claude Desktop**: Contact Anthropic support
- **Atlassian APIs**: Check [Atlassian Developer Community](https://community.developer.atlassian.com/)

---

**Last Updated:** 2025-11-02
**Tested With:** atlassian-mcp v0.1.5, Claude Desktop (macOS)

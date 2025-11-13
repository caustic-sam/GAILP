# JQL Queries Reference

**Project:** GAILP
**Last Updated:** November 2, 2025

Quick reference for common Jira Query Language (JQL) searches.

---

## 🎯 Personal Queries

### My Current Work
```jql
project = GAILP AND assignee = currentUser() AND status = "In Progress"
```

### My Open Issues
```jql
project = GAILP AND assignee = currentUser() AND status != Done ORDER BY priority DESC
```

### My Recently Updated
```jql
project = GAILP AND assignee = currentUser() AND updated >= -7d ORDER BY updated DESC
```

### Assigned to Me This Sprint
```jql
project = GAILP AND assignee = currentUser() AND sprint in openSprints()
```

### My Completed This Week
```jql
project = GAILP AND assignee = currentUser() AND resolved >= -7d ORDER BY resolved DESC
```

---

## 👥 Team Queries

### Current Sprint
```jql
project = GAILP AND sprint in openSprints() ORDER BY rank
```

### All Open Issues
```jql
project = GAILP AND status != Done ORDER BY priority DESC, created DESC
```

### In Review
```jql
project = GAILP AND status = "Review" ORDER BY updated ASC
```

### Blocked Issues
```jql
project = GAILP AND (labels = blocked OR status = Blocked) AND resolution = Unresolved
```

### Unassigned Work
```jql
project = GAILP AND assignee is EMPTY AND status = "To Do" ORDER BY priority DESC
```

---

## 🐛 Bug Tracking

### Open Bugs
```jql
project = GAILP AND type = Bug AND status != Done ORDER BY priority DESC
```

### Critical/High Bugs
```jql
project = GAILP AND type = Bug AND priority in (Highest, High) AND status != Done
```

### Bugs in Production
```jql
project = GAILP AND type = Bug AND labels = production AND status != Done
```

### Recently Fixed Bugs
```jql
project = GAILP AND type = Bug AND resolved >= -7d ORDER BY resolved DESC
```

### Old Open Bugs (30+ days)
```jql
project = GAILP AND type = Bug AND status != Done AND created <= -30d ORDER BY created ASC
```

---

## 🚀 Feature Tracking

### Active Epics
```jql
project = GAILP AND type = Epic AND status != Done ORDER BY priority DESC
```

### Stories Ready for Development
```jql
project = GAILP AND type = Story AND status = "To Do" ORDER BY priority DESC
```

### Stories in Epic
```jql
"Epic Link" = GAILP-XXX ORDER BY rank
```

### Completed Features This Month
```jql
project = GAILP AND type in (Epic, Story) AND resolved >= startOfMonth() ORDER BY resolved DESC
```

---

## 🏷️ Label-Based Queries

### Frontend Work
```jql
project = GAILP AND labels = frontend AND status != Done ORDER BY priority DESC
```

### Backend Work
```jql
project = GAILP AND labels = backend AND status != Done ORDER BY priority DESC
```

### Database Changes
```jql
project = GAILP AND labels = database ORDER BY status ASC
```

### Security Issues
```jql
project = GAILP AND labels = security AND status != Done ORDER BY priority DESC
```

### Quick Wins
```jql
project = GAILP AND labels = quick-win AND status = "To Do" ORDER BY priority DESC
```

### Tech Debt
```jql
project = GAILP AND labels = tech-debt ORDER BY priority DESC
```

### Performance Issues
```jql
project = GAILP AND labels = performance ORDER BY priority DESC
```

### Web3 Features
```jql
project = GAILP AND labels = web3 ORDER BY status ASC
```

---

## 📅 Time-Based Queries

### Created This Week
```jql
project = GAILP AND created >= -7d ORDER BY created DESC
```

### Updated Today
```jql
project = GAILP AND updated >= startOfDay() ORDER BY updated DESC
```

### Due This Week
```jql
project = GAILP AND due <= endOfWeek() AND status != Done ORDER BY due ASC
```

### Overdue
```jql
project = GAILP AND due < now() AND status != Done ORDER BY due ASC
```

### Completed This Sprint
```jql
project = GAILP AND sprint in closedSprints() AND sprint = "Sprint X" AND status = Done
```

---

## 🎨 Priority & Complexity

### High Priority, Not Started
```jql
project = GAILP AND priority = High AND status = "To Do" ORDER BY created ASC
```

### Critical Issues
```jql
project = GAILP AND priority = Highest AND status != Done ORDER BY created ASC
```

### Low Complexity, High Value
```jql
project = GAILP AND "Technical Complexity" = Low AND "Business Value" in (High, Critical) AND status = "To Do"
```

### High Complexity Tasks
```jql
project = GAILP AND "Technical Complexity" in (High, Expert) ORDER BY priority DESC
```

---

## 📊 Reporting Queries

### Velocity This Sprint
```jql
project = GAILP AND sprint in openSprints() AND status = Done
```

### Burndown (Remaining Work)
```jql
project = GAILP AND sprint in openSprints() AND status != Done
```

### Issues by Status
```jql
project = GAILP AND status = "In Progress"
```

### Issues by Assignee
```jql
project = GAILP AND assignee = "user@example.com" AND status != Done
```

### Epic Progress
```jql
"Epic Link" = GAILP-XXX AND status = Done
```

---

## 🔍 Advanced Queries

### Recently Changed Priority
```jql
project = GAILP AND priority changed DURING (-7d, now()) ORDER BY updated DESC
```

### Issues Without Labels
```jql
project = GAILP AND labels is EMPTY AND status != Done
```

### Issues Without Story Points
```jql
project = GAILP AND type in (Story, Task) AND "Story Points" is EMPTY AND status != Done
```

### Watched by Me
```jql
project = GAILP AND watcher = currentUser() ORDER BY updated DESC
```

### Created by Me
```jql
project = GAILP AND creator = currentUser() ORDER BY created DESC
```

### Breaking Changes
```jql
project = GAILP AND labels = breaking-change ORDER BY status ASC
```

### Issues with Attachments
```jql
project = GAILP AND attachments is not EMPTY ORDER BY updated DESC
```

### Issues with Comments Today
```jql
project = GAILP AND comment ~ currentUser() AND updated >= startOfDay()
```

---

## 🚨 Health Checks

### Stale Issues (60+ days no update)
```jql
project = GAILP AND status != Done AND updated <= -60d ORDER BY updated ASC
```

### Issues Without Description
```jql
project = GAILP AND description is EMPTY AND status != Done
```

### Issues Without Epic
```jql
project = GAILP AND type = Story AND "Epic Link" is EMPTY
```

### Orphaned Sub-tasks
```jql
project = GAILP AND type = Sub-task AND parent is EMPTY
```

---

## 💡 Pro Tips for JQL

### Combine Conditions
```jql
project = GAILP
  AND type = Bug
  AND priority = High
  AND status != Done
  AND assignee is EMPTY
ORDER BY created ASC
```

### Use Parentheses for Complex Logic
```jql
project = GAILP AND (priority = High OR labels = quick-win) AND status = "To Do"
```

### Date Ranges
```jql
created >= 2025-11-01 AND created <= 2025-11-30
```

### Relative Dates
- `now()` - Current time
- `startOfDay()` - Beginning of today
- `endOfDay()` - End of today
- `startOfWeek()` - Beginning of this week
- `endOfWeek()` - End of this week
- `startOfMonth()` - Beginning of this month
- `-7d` - 7 days ago
- `+7d` - 7 days from now

### Text Search
```jql
summary ~ "image upload" OR description ~ "image upload"
```

### IN operator for multiple values
```jql
status IN ("To Do", "In Progress")
priority IN (High, Highest)
```

### IS/IS NOT for null values
```jql
assignee IS EMPTY
labels IS NOT EMPTY
```

---

## 📌 Saving Filters

### Create Saved Filter

1. Run your JQL query
2. Click **Save as** button
3. Name your filter (e.g., "My High Priority Work")
4. Choose visibility (Private or Shared)
5. Click **Submit**

### Share Filter with Team

1. Open saved filter
2. Click **Details**
3. Change **Shared with** to team/project
4. Save changes

### Star Favorite Filters

Click the ⭐ next to filter name for quick access

---

## 🔗 Quick Access

Save these URLs with your saved filters:

```
# Base URL
https://cortexaillc.atlassian.net/issues/?jql=

# Example: My open issues
https://cortexaillc.atlassian.net/issues/?jql=project%20%3D%20GAILP%20AND%20assignee%20%3D%20currentUser()%20AND%20status%20!%3D%20Done
```

---

## 📚 References

- [Official JQL Documentation](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- [JQL Functions](https://support.atlassian.com/jira-software-cloud/docs/jql-functions/)
- [JQL Fields Reference](https://support.atlassian.com/jira-software-cloud/docs/jql-fields/)

---

**Tip:** Press `?` in Jira to see keyboard shortcuts, including quick search!

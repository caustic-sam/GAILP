# Policy Pulse Feature

## Overview

Policy Pulse is a dedicated page for tracking and visualizing global digital policy headlines, categorized by topic and jurisdiction. It provides a clustered, visually appealing layout and integrates live updates from FreshRSS feeds.

## Key Features

- Categorized Clusters: Headlines grouped into six main policy categories.
- Live Feed Integration: Headlines are fetched from FreshRSS, filtered to show only items from the last 10 days.
- Minimum Headlines: Each category box displays at least 3 headlines, with a "More coming soon" message if fewer are available.
- Modern UI: Category boxes feature a blue-based color palette, soft backgrounds, outlines, and gentle shadows for clarity and accessibility.
- National Flags: Emoji flags are shown for headlines with a nationality other than US, inferred from feed name or title.
- Jurisdiction Links: Four image/links for US, UK, EU, and AU legislation are displayed at the top, styled to span the page width. (Currently placeholders; agent prompt provided for sourcing official images/links.)
- Persistent Navigation: Top and vertical nav bars and a footer are consistent and persistent, matching the rest of the site.

## Implementation Details

- File: `app/policy-pulse/page.tsx`
- Components Used: `Header`, `RightSidebar`
- Styling: Tailwind CSS utility classes, blue palette from front page
- Feed Source: FreshRSS API client (`lib/freshrss.ts`)
- Flag Logic: Simple keyword matching for jurisdiction in headline/feed name
- Image Links: `/images/flags/{us,uk,eu,au}.png` (replace with official images/links as needed)

## Agent Prompt for Sourcing Official Images/Links

> Find high-quality, official images (flags, emblems, or government symbols) and authoritative URLs for legislative tracking or government policy portals for the following jurisdictions:
>
> - United States (US)
> - United Kingdom (UK)
> - European Union (EU)
> - Australia (AU)
>
> For each jurisdiction, provide:
>
> 1. A direct link to an official image suitable for web display (SVG or PNG preferred, transparent background if possible).
> 2. The official government or legislative tracking portal URL for current legislation and policy updates.
>
> Return results in a Markdown table with columns: Jurisdiction, Image URL, Portal URL, and a brief description of each portal.

## Status

- All planned enhancements for Policy Pulse are complete and documented.
- Ready for review and further iteration as needed.
# Policy Pulse Feature Documentation

## Overview

Policy Pulse is a dedicated page for tracking and visualizing global digital policy headlines, categorized by topic and jurisdiction. It provides a clustered, visually appealing layout and integrates live updates from FreshRSS feeds.

## Key Features

- **Categorized Clusters:** Headlines grouped into six main policy categories.
- **Live Feed Integration:** Headlines are fetched from FreshRSS, filtered to show only items from the last 10 days.
- **Minimum Headlines:** Each category box displays at least 3 headlines, with a "More coming soon" message if fewer are available.
- **Modern UI:** Category boxes feature a blue-based color palette, soft backgrounds, outlines, and gentle shadows for clarity and accessibility.
- **National Flags:** Emoji flags are shown for headlines with a nationality other than US, inferred from feed name or title.
- **Jurisdiction Links:** Four image/links for US, UK, EU, and AU legislation are displayed at the top, styled to span the page width. (Currently placeholders; agent prompt provided for sourcing official images/links.)
- **Persistent Navigation:** Top and vertical nav bars and a footer are consistent and persistent, matching the rest of the site.

## Implementation Details

- **File:** `app/policy-pulse/page.tsx`
- **Components Used:** `Header`, `RightSidebar`
- **Styling:** Tailwind CSS utility classes, blue palette from front page
- **Feed Source:** FreshRSS API client (`lib/freshrss.ts`)
- **Flag Logic:** Simple keyword matching for jurisdiction in headline/feed name
- **Image Links:** `/images/flags/{us,uk,eu,au}.png` (replace with official images/links as needed)

## Agent Prompt for Sourcing Official Images/Links

> Find high-quality, official images (flags, emblems, or government symbols) and authoritative URLs for legislative tracking or government policy portals for the following jurisdictions:
>
> - United States (US)
> - United Kingdom (UK)
> - European Union (EU)
> - Australia (AU)
>
> For each jurisdiction, provide:
>
> 1. A direct link to an official image suitable for web display (SVG or PNG preferred, transparent background if possible).
> 2. The official government or legislative tracking portal URL for current legislation and policy updates.
>
> Return results in a Markdown table with columns: Jurisdiction, Image URL, Portal URL, and a brief description of each portal.

## Status

- All planned enhancements for Policy Pulse are complete and documented.
- Ready for review and further iteration as needed.

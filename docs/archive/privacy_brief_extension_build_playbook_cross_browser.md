# Privacy Brief — Cross‑Browser Extension Build Playbook

> **Purpose** A step‑by‑step, over‑commented playbook to build **Privacy Brief**, a WebExtensions-based add‑on (Safari, Chrome, Edge, Firefox) that finds a site’s privacy policy, summarizes it, and surfaces red‑flag warnings (e.g., “precise location”, “sale/share”, “indefinite retention”, “children”). This doc is meant to copy/paste into **Jira/Confluence**.

---

## 0) Scope & Goals

**In scope (MVP)**

- Auto‑discover, fetch, and parse privacy policies from the current site.
- Extractive summary (template) + flagged risks with **inline quotes** + **jump links**.
- Toolbar badge (green/amber/red), popup summary, options page.
- Optional GPC/DNT signaling (per‑site toggle).
- Local caching; **no cloud calls by default**.

**Out of scope (MVP)**

- Auto‑submit DSRs/opt‑outs (we link + prefill only).
- Full NLP model hosting in the extension (available as **opt‑in** via local Ollama).
- Multi‑doc crawl beyond a single policy page.

**Success criteria**

-
  > 90% policy discovery on Alexa Top 1k test set (heuristic links + well‑known paths).
- Average analysis time < 2s on desktop.
- Zero unintended network calls beyond the policy URL when cloud features disabled.

---

## 1) Architecture at a Glance

```
┌────────────────────────────────────────────────────────────────┐
│                    Browser (WebExtensions MV3)                 │
│                                                                │
│  [User Tab] ─ content script ──▶ discover policy links         │
│                  │                                             │
│                  ▼                                             │
│          background service worker  ─ fetch policy HTML        │
│                  │                     │                       │
│                  │                     ▼                       │
│                  │             parser/cleaner → text + outline │
│                  │                     │                       │
│                  ▼                     ▼                       │
│              heuristics & scoring  ← summarizer (extractive)   │
│                  │                     │                       │
│                  └── cache (storage.local) ──▶ popup/options   │
│                                                                │
│   Optional: DNR / webRequest → add Sec-GPC:1 and DNT:1         │
└────────────────────────────────────────────────────────────────┘
```

**Key modules**

- `content/` — page scanning for candidate links; DOM anchors for quotes.
- `background/` — orchestration, network fetch, caching, rules.
- `lib/parser` — HTML → readable text + heading anchors.
- `lib/summarizer` — TextRank/RAKE based extractive template.
- `lib/heuristics` — rules → flags + score.
- `ui/popup` — compact view; `ui/options` — settings.

---

## 2) Tech Stack & Tooling

- **TypeScript** + **Vite** bundling.
- **webextension‑polyfill** for cross‑browser API.
- **MV3** (Chrome/Edge/Firefox), converted to **Safari Web Extension** via Xcode.
- Tests: **Vitest** (unit), **Playwright** (E2E) with policy fixtures.
- CI: GitHub Actions (lint → build → test → zip per browser).

---

## 3) Repo Layout (copy/paste)

```
privacy-brief/
├─ src/
│  ├─ background/
│  │  └─ index.ts
│  ├─ content/
│  │  └─ index.ts
│  ├─ lib/
│  │  ├─ parser.ts
│  │  ├─ summarizer.ts
│  │  └─ heuristics.ts
│  ├─ ui/
│  │  ├─ popup/
│  │  │  ├─ index.html
│  │  │  └─ index.ts
│  │  └─ options/
│  │     ├─ index.html
│  │     └─ index.ts
│  └─ types/
│     └─ summary.ts
├─ assets/icons/{16,48,128}.png
├─ rules/gpc.json              # static DNR rules (Chrome/Edge)
├─ manifest.json               # MV3
├─ vite.config.ts
├─ package.json
└─ README.md
```

---

## 4) Getting Started (Dev Env)

**Prereqs**

- Node 20+
- pnpm (or npm/yarn)
- Xcode (for Safari conversion)

**Bootstrap**

```bash
pnpm create vite privacy-brief --template vanilla-ts
cd privacy-brief
pnpm add webextension-polyfill@^0.10.0
pnpm add -D @types/chrome vite-plugin-web-extension typescript vitest playwright @playwright/test esbuild
```

Add **Vite plugin** to emit WebExtension bundles (e.g., `vite-plugin-web-extension`). Configure entrypoints for background, content, popup, options.

---

## 5) Manifest (MV3) — minimal, safe defaults

```json
{
  "manifest_version": 3,
  "name": "Privacy Brief",
  "version": "0.1.0",
  "description": "Summarize privacy policies and flag risks with inline evidence.",
  "action": { "default_popup": "ui/popup/index.html" },
  "icons": {"16":"assets/icons/16.png","48":"assets/icons/48.png","128":"assets/icons/128.png"},
  "permissions": ["storage", "scripting", "declarativeNetRequest"],
  "host_permissions": ["*://*/*"],
  "background": { "service_worker": "background/index.js", "type": "module" },
  "content_scripts": [{
    "matches": ["*://*/*"],
    "js": ["content/index.js"],
    "run_at": "document_end"
  }],
  "declarative_net_request": {
    "rule_resources": [{"id":"gpc","enabled":true,"path":"rules/gpc.json"}]
  }
}
```

> **Note**: Chrome/Edge support static DNR rules for header modification; Firefox MV3 support is evolving—see §8 for fallbacks. Safari uses the converted WebExtension and supports webRequest with entitlements.

---

## 6) GPC/DNT Signaling (per‑browser)

**What we want**

- Send `` and `` on requests when the user enables the toggle.
- Also expose `navigator.globalPrivacyControl = true` for page scripts (via a small injected script).

**6.1 Chrome/Edge (static DNR)** — `rules/gpc.json`

```json
[
  {
    "id": 1,
    "priority": 1,
    "action": {
      "type": "modifyHeaders",
      "requestHeaders": [
        {"header": "Sec-GPC", "operation": "set", "value": "1"},
        {"header": "DNT", "operation": "set", "value": "1"}
      ]
    },
    "condition": {"resourceTypes": ["main_frame","sub_frame","xmlhttprequest"]}
  }
]
```

> Toggle on/off by enabling/disabling this ruleset programmatically (`declarativeNetRequest.updateEnabledRulesets`).

**6.2 Firefox (fallback)**

- Use `webRequest.onBeforeSendHeaders` with `blocking` and `extraHeaders` to append headers.
- Add to manifest (Firefox only build): `permissions: ["webRequest", "webRequestBlocking"]`.

**6.3 Safari**

- After conversion, enable the **WebExtension** target capability for webRequest; use the same Firefox path.

**6.4 JS‑level GPC signal** (all browsers)

```ts
// content/inject-gpc.ts (executed as an injected page script)
(() => {
  try {
    Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { value: true, configurable: true });
  } catch {}
})();
```

---

## 7) Content Script — find policy links (over‑commented)

```ts
// src/content/index.ts
// PURPOSE: Scan the current page for "Privacy" policy links and report back
// to the background worker. Keep it lightweight; no network here.

function getAnchor(el: Element): string | undefined {
  // BEST EFFORT: build a fragment to jump back to the section for quotes
  const id = (el as HTMLElement).id;
  if (id) return `#${id}`;
  return undefined;
}

function findPrivacyCandidates(): { href: string; anchor?: string }[] {
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
  const candidates = anchors.filter(a => {
    const t = (a.textContent || '').toLowerCase();
    const h = a.href.toLowerCase();
    return /privacy|legal\/?privacy|privacy-policy/.test(t) || /privacy/.test(h);
  });
  return candidates.map(a => ({ href: a.href, anchor: getAnchor(a) }));
}

// Send to background when the DOM is ready
queueMicrotask(() => {
  const links = findPrivacyCandidates();
  // use browser.* for cross‑browser polyfill
  // @ts-ignore
  browser.runtime.sendMessage({ type: 'CANDIDATE_LINKS', links });
});
```

---

## 8) Background Worker — fetch → parse → summarize → score

```ts
// src/background/index.ts
// PURPOSE: Orchestrate analysis. This is where we fetch the policy HTML
// (more reliable for CORS/CSP), sanitize it, summarize, and score.

import { parsePolicyHtml } from '../lib/parser';
import { summarizeExtractive } from '../lib/summarizer';
import { evaluateHeuristics } from '../lib/heuristics';

// Minimal in‑memory LRU (keep it small) then mirror to storage.local
const cache = new Map<string, any>();

// Receive candidate links
browser.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg?.type !== 'CANDIDATE_LINKS') return;
  const tabUrl = sender?.tab?.url || '';
  const domain = new URL(tabUrl).hostname;

  // 1) Pick best candidate or probe well‑known paths
  const candidates: string[] = [
    ...new Set([
      ...(msg.links || []).map((l: any) => l.href),
      `https://${domain}/privacy`,
      `https://${domain}/privacy-policy`,
      `https://${domain}/legal/privacy`
    ])
  ];

  // 2) Short‑circuit cache
  if (cache.has(domain)) {
    browser.action.setBadgeText({ text: badgeFor(cache.get(domain).score), tabId: sender.tab!.id! });
    return;
  }

  // 3) Try candidates in order
  let lastError: any = null;
  for (const url of candidates) {
    try {
      const resp = await fetch(url, { credentials: 'omit', cache: 'no-cache' });
      if (!resp.ok || !resp.headers.get('content-type')?.includes('text/html')) continue;
      const html = await resp.text();

      // 4) Parse → text + outline/anchors
      const policy = parsePolicyHtml(url, html);

      // 5) Summarize (extractive template)
      const summary = summarizeExtractive(policy);

      // 6) Heuristics → flags + score
      const result = evaluateHeuristics(summary);

      // 7) Cache + badge
      cache.set(domain, result);
      browser.storage.local.set({ [domain]: result });
      browser.action.setBadgeText({ text: badgeFor(result.score), tabId: sender.tab!.id! });
      return;
    } catch (e) { lastError = e; }
  }

  console.warn('Policy not found', domain, lastError);
  browser.action.setBadgeText({ text: '–', tabId: sender.tab!.id! });
});

function badgeFor(score: number): string {
  // 0‑100 → G/A/R mapping handled in popup coloring
  if (Number.isNaN(score)) return '–';
  return String(Math.max(0, Math.min(99, Math.round(score))));
}
```

---

## 9) Parser & Summarizer (template‑driven)

```ts
// src/lib/parser.ts
// GOAL: Make the policy readable: strip nav/ads, keep H1‑H4, preserve anchors.
export function parsePolicyHtml(url: string, html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Remove known clutter
  doc.querySelectorAll('nav, header, footer, script, style, noscript').forEach(n => n.remove());
  // Extract main content (heuristic: largest <main> or article/section)
  const main
```

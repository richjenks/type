# AGENTS.md

## Purpose
- This file is for AI coding agents only.
- Optimize for safe, minimal, behavior-preserving changes.
- Prefer direct edits over planning chatter.

## Repo Model
- App type: static, no-build web app.
- Runtime file `index.html`: single editor UI shell.
- Runtime file `app.js`: editor behavior, autosave, title sync, Tab handling, service worker registration/update.
- Runtime file `cache.js`: service worker install/activate/fetch/message lifecycle and offline cache behavior.
- Runtime file `style.css`: full-screen editor layout and theme variables.
- Runtime file `manifest.webmanifest`: PWA metadata.

## Invariants
- Keep storage key `type` for persisted text.
- Keep graceful degradation: storage failures must not break editing.
- Keep graceful degradation: service worker failures must not block online usage.
- Keep title rule: first trimmed line -> `document.title`, fallback `Type`.
- Keep Tab rule: `Tab` inserts `\t` at the current selection.
- Keep service worker fetch policy: handle only same-origin `GET` requests.
- Keep service worker fetch policy: use network-first for cacheable requests.
- Keep service worker fetch policy: use cache fallback when network fails.

## Change Rules
- Use vanilla HTML/CSS/JS; do not introduce build tooling unless explicitly requested.
- Use tabs, never spaces, when indenting code.
- Preserve accessibility baseline in `index.html` (`lang`, viewport meta, textarea `aria-label`).
- Service worker caches same-origin `GET` requests at runtime; keep request filtering deliberate if changing cache scope.
- If service worker behavior changes materially, bump `CACHE_NAME`.

## Accepted Tradeoffs
- The broad runtime cache scope in `cache.js` is intentional for implementation simplicity.
- The `fetch(request, { cache: 'no-cache' })` strategy is intentional to prioritize freshness and predictable updates.
- These are known, accepted tradeoffs. Do not raise them as risks or propose changes unless the user explicitly asks to revisit caching strategy.
- Service worker activation handshake uses magic numeric opcode `1` (`postMessage(1)` -> `event.data === 1`) by design to avoid duplicated string/constant definitions across files.
- Treat opcode `1` as reserved for "skip waiting"; do not refactor this unless explicitly requested.

## Execution Rules
- Make smallest correct change that satisfies the request.
- Do not refactor unrelated areas.
- Do not alter product copy/content in textarea seed text unless requested.
- Do not add new dependencies or infrastructure unless requested.

## Validation Scope
- AI-agent validation is limited to static analysis and code inspection.
- Manual browser testing is required and out of scope for AI execution in this repo.
- Do not claim runtime/browser validation was performed unless explicitly run and observed.

## Definition Of Done
- Requested change is implemented.
- Invariants in this file remain true.
- Any service-worker cache policy updates remain consistent with runtime-caching strategy.
- No unrelated files are modified.
- Final report states what was changed and what was not validated (manual-only checks).

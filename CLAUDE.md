# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A static, zero-dependency, no-build web tool that validates Google Ad Manager (GAM 360) video/audio ad tags for the Brightcove Support team. Plain HTML + CSS + vanilla JS, served as-is. Live at `solutions.brightcove.com/jvanemmerik/ad_tag/`.

## Architecture (keep these boundaries)

- **`parameters.js`** — the data. A single `adTagParameters` object: every GAM parameter keyed by its query-string name, with `definition`, `explanation`, and a structured `requirement`. This is the source of truth for descriptions and requirements. Editing content almost always means editing only this file.
- **`adtag.js`** — pure logic, **no DOM access**. Parsing, placeholder detection, `detectContext`, `requirementSeverity`, `expectedKeysFor`. Exposed as the `AdTag` global in the browser and via `module.exports` under Node (UMD-style wrapper). Everything here must stay unit-testable.
- **`scripts.js`** — DOM glue only. Reads inputs, renders summary/legend/table, manages share URLs and `localStorage`. Calls into `AdTag.*`; contains no parsing/requirement logic of its own.
- **`test/adtag.test.js`** — dependency-free Node tests for `adtag.js`. Run with `node test/adtag.test.js`.

Script load order in `index.html` matters: `parameters.js` → `adtag.js` → `scripts.js`. Classic `<script>` tags share the global lexical scope, so `adTagParameters` (a top-level `const`) is visible to `adtag.js` — but note a top-level `const` is **not** a property of `window`, so never read `window.adTagParameters`.

## The requirement model (the important part)

Do not reintroduce a blanket "mandatory" boolean — that was the original bug (false red flags). Whether a parameter is required depends on the **serving mode**:

- `detectContext(url)` returns `servingMode: 'csai' | 'ssai'` (plus `adType`, `networkCode`, `platform`). SSAI is detected via a `serverside.doubleclick.net` / `dai.google.com` host or the presence of `ssss`; Live vs VOD via the path.
- Each parameter's `requirement.level` is one of `required | programmatic | recommended | conditional | optional`, optionally scoped by `appliesTo: ['csai'|'ssai']`.
- `requirementSeverity(key, servingMode)` resolves that to how a **missing** value is surfaced. Only `required` → red. `programmatic`/`recommended` → amber. `conditional` → never blocks.
- `expectedKeysFor(servingMode)` decides which absent parameters are force-listed: only `required` and `programmatic`, to keep the table focused.

When adding/adjusting requirements, cite Google's exact wording in `requirement.note` and keep it consistent with https://support.google.com/admanager/answer/10678356.

## Conventions & gotchas

- The description field is spelled **`explanation`** (the original `tooltips.js` used the misspelling `explination` — do not resurrect it).
- `parseAdTag` splits each pair on the **first** `=` only, so values containing `=` (base64 `ppsj`, encoded `cust_params`) survive. Don't switch to a naive `split('=')`.
- Never call `decodeURIComponent` on a value that may contain a bare `%` or a `%%MACRO%%` without a try/catch — it throws. Use `AdTag.safeDecode`. `populateFromURL` must not double-decode (`URLSearchParams.get` already decodes once).
- A single `{{macro}}` or `{macro}` token is a **valid** SSAI macro, not a placeholder. `[value]`, `{}`, `%%MACRO%%` are placeholders.
- All user/tag-derived text rendered into the table is HTML-escaped (`escapeHTML`) — keep it that way.

## Workflow

- After any change to `adtag.js` or `parameters.js`, run `node test/adtag.test.js`.
- To verify rendering, serve locally (`python3 -m http.server`) and open `index.html`, or load a share URL (`?adTag1=<encoded tag>`).
- No linter/formatter is configured; match the existing style (4-space indent, `const` arrow functions).
- Deployment is a static file upload to the solutions server via `deploy.sh` (SFTP — the account is SFTP-only, so rsync-over-SSH fails with "Read-only file system"). There is no CI. Commit/push only when asked.

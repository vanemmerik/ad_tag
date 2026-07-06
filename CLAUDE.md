# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A static, zero-dependency, no-build web tool that validates Google Ad Manager (GAM 360) video/audio ad tags for the Brightcove Support team. Plain HTML + CSS + vanilla JS, served as-is. Live at `solutions.brightcove.com/jvanemmerik/ad_tag/`.

## Architecture (keep these boundaries)

- **`parameters.js`** — the data. A single `adTagParameters` object: every GAM parameter keyed by its query-string name. This is the source of truth for descriptions and requirements. Editing content almost always means editing only this file. See "The tooltip catalogue schema" below.
- **`adtag.js`** — pure logic, **no DOM access**. Parsing, macro/placeholder detection, `detectContext`, `validateEndpoint`, `requirementSeverity`, `expectedKeysFor`. Exposed as the `AdTag` global in the browser and via `module.exports` under Node (UMD-style wrapper). Everything here must stay unit-testable.
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

## The tooltip catalogue schema

Each `parameters.js` entry uses **structured fields**, not prose — the renderer (`getTooltipContent`/`renderStructured` in `scripts.js`) styles them consistently, so there is no per-entry HTML/markup to hand-format:

- `name` — display name. `valueType` — `"constant"` | `"variable"` (optional chip).
- `summary` — one or two plain sentences. Inline `` `backtick` `` marks code; no other markup.
- `values` — optional list of `[value, meaning]` pairs for enumerated values.
- `example` — a `"code"` string, an array of them, or `[code, label]` pairs.
- `notes` — optional extra paragraph (e.g. MRC guidance). `docsAnchor` — optional `#anchor` for the Google reference link.
- `requirement` — the validation metadata (see below). `deprecated: true` for retired params.

The renderer still supports the old prose `explanation`/`definition` shape as a fallback (`isStructured()` picks the path), but all current entries are structured — prefer structured for anything new. Do **not** reintroduce the `explination`/`explanation` prose format.

## Alignment pass (keeping the catalogue current)

The tool can't fetch Google's docs live (CORS, no API), so freshness is a periodic manual check run **by a Claude session** (the maintainer's chosen workflow). When asked to "run the ad_tag alignment check":

1. `WebFetch` https://support.google.com/admanager/answer/10678356?hl=en and extract every parameter + its exact "Requirement" wording.
2. Diff against `adTagParameters` in `parameters.js`: find params on the page but missing from the catalogue (add), params in the catalogue no longer on the page (flag as possibly deprecated — don't auto-delete), and `requirement.note`/level wording that has drifted.
3. Report the diff to the user and propose a patch (new/updated structured entries). Keep curated `summary` prose; only sync the structured/requirement facts unless asked to rewrite descriptions.
4. After editing, run `node test/adtag.test.js` and spot-render a tag.

Read Google intelligently rather than scraping fixed selectors — that's the whole reason this is a Claude-driven pass and not a brittle script.

## Conventions & gotchas

- Content lives in **structured fields** (see schema above). The original `tooltips.js` used a misspelled `explination` prose key — do not resurrect it.
- `parseAdTag` splits each pair on the **first** `=` only, so values containing `=` (base64 `ppsj`, encoded `cust_params`) survive. Don't switch to a naive `split('=')`.
- `validateEndpoint` checks the host + path against the known GAM endpoints (`CSAI_HOSTS`/`SSAI_HOSTS` in `adtag.js`) — `isValidAdTag` only sniffs the query string, so both are needed. If Google adds a legitimate host/path, extend those constants (and add a test).
- Never call `decodeURIComponent` on a value that may contain a bare `%` or a `%%MACRO%%` without a try/catch — it throws. Use `AdTag.safeDecode`. `populateFromURL` must not double-decode (`URLSearchParams.get` already decodes once).
- Macro brace validation is **context-aware** (`hasMalformedMacro(value, servingMode)`): SSAI requires double braces `{{macro}}` (single/unbalanced → `invalid_macro`, red); CSAI accepts single-brace player macros `{random}` and flags only unbalanced braces. `[value]`, `{}`, `%%MACRO%%` are unfilled placeholders (amber).
- All user/tag-derived text rendered into the table is HTML-escaped (`escapeHTML`) — keep it that way.

## Workflow

- After any change to `adtag.js` or `parameters.js`, run `node test/adtag.test.js`.
- To verify rendering, serve locally (`python3 -m http.server`) and open `index.html`, or load a share URL (`?adTag1=<encoded tag>`).
- No linter/formatter is configured; match the existing style (4-space indent, `const` arrow functions).
- Deployment is a static file upload to the solutions server via `deploy.sh` (SFTP — the account is SFTP-only, so rsync-over-SSH fails with "Read-only file system"). There is no CI. Commit/push only when asked.

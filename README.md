# GAM Ad Tag Validation Tool

A zero-dependency, static web tool for inspecting and comparing **Google Ad Manager (GAM 360)** video and audio ad tags. Built for the Brightcove Support team to quickly sanity-check a tag, spot missing or malformed parameters, and diff two tags side by side.

**Live:** https://solutions.brightcove.com/jvanemmerik/ad_tag/

---

## What it does

Paste an ad tag URL and the tool will:

- **Give a verdict first** - a pass/fail bar with error / warning / OK counts, plus context chips (ad type, serving mode, network code, endpoint and ad-unit status).
- **Detect the serving context** - client-side (CSAI) vs server-side (SSAI: VOD or Live) - from the host and parameters, plus the GAM **network code** and a web/app platform hint.
- **List the issues** - only the problems, most-severe first, each with a jump link to its component.
- **Show the tag anatomy** - the raw URL split into colour-coded, clickable `key=value` segments so you can map a messy tag to the breakdown.
- **Break every parameter into its components**, grouped by the role it plays, and evaluate each against the detected context. A parameter is only flagged **red** when it is genuinely *required for the detected serving mode* (e.g. `ad_rule`, `url` and `unviewed_position_start` are **not** universally required; `ssss` **is** required for SSAI).
- **Decode and decompose values** - decoded by default with a raw toggle; `cust_params` exploded into a key/value sub-table, `ppsj` base64-decoded to JSON, and comma/pipe lists shown as chips.
- **Flag value problems** - empty values, unresolved placeholders (`[value]`, `%%CMS_ID%%`, `{}`), malformed macros, duplicate parameters, and whitespace that would break the request.
- **Explain each parameter** via ⓘ tooltips sourced from Google's official [Ad tag parameters reference](https://support.google.com/admanager/answer/10678356), including the exact requirement wording and a deep link.
- **Share** an inspection as a URL, and optionally **retain** the last tag in `localStorage`.

### Status key

| Marker | Meaning |
| --- | --- |
| ✗ Red | Required for this serving context, or invalid - missing, empty, or malformed |
| ▲ Amber | Required for programmatic / recommended / conditional - review, or a value problem |
| ✓ Green | Present and valid |

Requirement levels shown in tooltips:

- **Required** - needed for basic ad serving in the detected context.
- **Required for programmatic** - needed for programmatic monetization.
- **Recommended** - Google recommends it.
- **Conditional** - required only under a stated condition (e.g. `ad_rule` only when using VMAP ad rules).

---

## Usage

1. Open `index.html` (or the live URL).
2. Paste an ad tag into **Ad tag** and click **Inspect Ad Tag**.
3. Read the verdict, then the **Issues** list; click a component to jump to it.
4. In the **Components** breakdown, use **Show raw values** to flip decoded values back to raw, or **Issues only** to hide compliant rows.
5. **Share tag** copies a URL that reopens the tool pre-filled. **Retain tag** keeps your input between visits.

---

## Project structure

| File | Responsibility |
| --- | --- |
| `index.html` | Markup: input, retain toggle, actions, and the `#results` container. |
| `styles.css` | All styling: verdict bar, chips, issues, anatomy strip, component breakdown, and tooltips. |
| `parameters.js` | The **parameter catalogue** - every GAM parameter with its structured description and `requirement` metadata. This is the file you edit to update descriptions or requirements. |
| `adtag.js` | **Pure logic** (no DOM): parsing, macro/placeholder detection, context/endpoint/ad-unit validation, requirement evaluation. Unit-testable in Node. |
| `scripts.js` | **DOM glue**: reads the input, renders the verdict / issues / anatomy / grouped component breakdown (with decoding + compound decomposition), manages share links and saved state. |
| `test/adtag.test.js` | Dependency-free unit tests for `adtag.js`. |

There is **no build step** - the files are served as-is.

---

## Development

### Run the tests

```bash
node test/adtag.test.js
```

### Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

### Adding or updating a parameter

Edit `parameters.js`. Entries use **structured fields** - the renderer styles them consistently, so there's no HTML/markup to hand-format, just fill in the blanks:

```js
"vpos": {
    "name": "Video Position",
    "valueType": "constant",                 // "constant" | "variable" (optional)
    "summary": "Indicates a pre-, mid- or post-roll. Inline `code` via backticks.",
    "values": [                              // optional: enumerated [value, meaning] pairs
        ["preroll", "Pre-roll"],
        ["midroll", "Mid-roll"],
        ["postroll", "Post-roll"]
    ],
    "example": "vpos=preroll",               // string, array, or [code, label] pairs
    "notes": "Optional extra guidance.",     // optional
    "docsAnchor": "vpos",                    // optional #anchor for the Google link
    "requirement": {
        "level": "recommended",              // required | programmatic | recommended | conditional
        "appliesTo": ["csai"],               // optional: ["csai"] and/or ["ssai"]; omit = both
        "note": "Recommended for programmatic monetization.",  // exact Google wording
        "condition": "using video ad rules"  // only for level: "conditional"
    }
}
```

Only `name` and `summary` are required; everything else is optional. Omit `requirement` entirely for purely optional parameters; add `"deprecated": true` for retired ones.

Only `required` and `programmatic` parameters are auto-shown when missing (so the table stays focused); `recommended` parameters are styled when present but not force-listed.

### Keeping the catalogue aligned with Google

The tool can't fetch Google's docs live (CORS / no API), so refresh it periodically by asking a Claude Code session to **"run the ad_tag alignment check"** - it diffs the live Google reference against `parameters.js` and proposes updates. The procedure is documented in `CLAUDE.md`.

---

## Deployment

Static files are deployed to `solutions.brightcove.com/jvanemmerik/ad_tag/` (`/mnt/data/html/jvanemmerik/ad_tag`). Requires the Brightcove VPN.

The server account is **SFTP-only**, so rsync-over-SSH does not work (it needs a remote shell and fails with "Read-only file system"). Use `deploy.sh`, which uploads the web files over SFTP:

```bash
./deploy.sh          # dry run - lists the files it will upload
./deploy.sh --live   # upload via sftp (prompts for your password)
```

It uploads `index.html`, `styles.css`, `scripts.js`, `parameters.js`, `adtag.js` and removes the stale `tooltips.js`. Add your SSH key to the server account's `~/.ssh/authorized_keys` for a promptless deploy. Alternatively, upload the same files via SFTP with FileZilla.

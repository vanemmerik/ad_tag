# GAM Ad Tag Validation Tool

A zero-dependency, static web tool for inspecting and comparing **Google Ad Manager (GAM 360)** video and audio ad tags. Built for the Brightcove Support team to quickly sanity-check a tag, spot missing or malformed parameters, and diff two tags side by side.

**Live:** https://solutions.brightcove.com/jvanemmerik/ad_tag/

---

## What it does

Paste an ad tag URL and the tool will:

- **Detect the serving context** — client-side (CSAI) vs server-side (SSAI: VOD or Live) — from the host and parameters, plus the GAM **network code** and a web/app platform hint.
- **Evaluate every parameter against that context.** A parameter is only flagged **red** when it is genuinely *required for the detected serving mode*. This is the key difference from a naive "mandatory list": e.g. `ad_rule`, `url` and `unviewed_position_start` are **not** universally required, and `ssss` **is** required for SSAI.
- **Flag value problems** — empty values, unresolved macros/placeholders (`[value]`, `%%CMS_ID%%`, `{}`), duplicate parameters, and whitespace that would break the request.
- **Explain each parameter** via tooltips sourced from Google's official [Ad tag parameters reference](https://support.google.com/admanager/answer/10678356), including the exact requirement wording.
- **Compare two tags** side by side, highlighting where values match or differ.
- **Share** a filled-in inspection/comparison as a URL, and optionally **retain** the last tags in `localStorage`.

### Colour key

| Colour | Meaning |
| --- | --- |
| 🔴 Red | Required for this serving context — missing or empty |
| 🟡 Amber | Required for programmatic / recommended / conditional — review, or a value problem (empty, placeholder, duplicate) |
| 🟢 Green | Present and valid |
| 🔵 Blue | Value differs between the two compared tags |

Requirement levels shown in tooltips:

- **Required** — needed for basic ad serving in the detected context.
- **Required for programmatic** — needed for programmatic monetization.
- **Recommended** — Google recommends it.
- **Conditional** — required only under a stated condition (e.g. `ad_rule` only when using VMAP ad rules).

---

## Usage

1. Open `index.html` (or the live URL).
2. Paste an ad tag into **Ad Tag 1** and click **Inspect Ad Tag**.
3. To compare, toggle **Compare two ad tags**, paste a second tag, and click **Compare Ad Tags**.
4. **Share tag** copies a URL that reopens the tool pre-filled.
5. **Retain tags** keeps your input between visits.

---

## Project structure

| File | Responsibility |
| --- | --- |
| `index.html` | Markup: inputs, toggles, summary + legend containers, results table. |
| `styles.css` | All styling, including the colour key and requirement tags. |
| `parameters.js` | The **parameter catalogue** — every GAM parameter with its definition, description, and structured `requirement` metadata. This is the file you edit to update descriptions or requirements. |
| `adtag.js` | **Pure logic** (no DOM): parsing, placeholder detection, context detection, requirement evaluation. Unit-testable in Node. |
| `scripts.js` | **DOM glue**: reads inputs, renders the summary/legend/table, manages share links and saved state. |
| `test/adtag.test.js` | Dependency-free unit tests for `adtag.js`. |

There is **no build step** — the files are served as-is.

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

Edit `parameters.js`. Each entry looks like:

```js
"iu": {
    "definition": "Ad Unit",
    "explanation": "The ad unit parameter ... ```iu=/6062/videodemo```",
    "requirement": {
        "level": "required",          // required | programmatic | recommended | conditional | optional
        "appliesTo": ["csai"],        // optional: ["csai"] and/or ["ssai"]; omit = both
        "note": "Required to implement ad serving in ...",  // exact Google wording
        "condition": "using video ad rules"                 // only for level: "conditional"
    }
}
```

Formatting in `explanation`: ```` ```code``` ```` renders as inline code, `*bold*` renders bold, and newlines become line breaks. Omit `requirement` entirely for purely optional parameters.

Only `required` and `programmatic` parameters are auto-shown when missing (so the table stays focused); `recommended` parameters are styled when present but not force-listed.

---

## Deployment

Static files are deployed to `solutions.brightcove.com/jvanemmerik/ad_tag/` (`/mnt/data/html/jvanemmerik/ad_tag`). Requires the Brightcove VPN.

The server account is **SFTP-only**, so rsync-over-SSH does not work (it needs a remote shell and fails with "Read-only file system"). Use `deploy.sh`, which uploads the web files over SFTP:

```bash
./deploy.sh          # dry run — lists the files it will upload
./deploy.sh --live   # upload via sftp (prompts for your password)
```

It uploads `index.html`, `styles.css`, `scripts.js`, `parameters.js`, `adtag.js` and removes the stale `tooltips.js`. Add your SSH key to the server account's `~/.ssh/authorized_keys` for a promptless deploy. Alternatively, upload the same files via SFTP with FileZilla.

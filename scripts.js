/*
 * DOM glue for the GAM Ad Tag Validation Tool.
 * All parsing / requirement logic lives in adtag.js (AdTag.*); this file only
 * reads inputs, renders the table, summary and legend, and manages state.
 */
const alertBanner = document.querySelector('#alertBanner');

document.addEventListener('DOMContentLoaded', () => {
    populateFromURL();
    loadState();
    document.getElementById('retainToggle').addEventListener('change', saveState);
});

/* --- small helpers ------------------------------------------------------- */

const flashBanner = (message, tone) => {
    alertBanner.innerText = message;
    alertBanner.classList.remove('amber');
    if (tone === 'info') alertBanner.classList.add('amber');
    alertBanner.classList.add('show');
    clearTimeout(flashBanner._t);
    flashBanner._t = setTimeout(() => alertBanner.classList.remove('show'), 4000);
};

const hasTooltip = (key) => Object.prototype.hasOwnProperty.call(AdTag.parameters, key);

// Base URL for the "Google reference" deep link in each tooltip.
const DOCS_URL = 'https://support.google.com/admanager/answer/10678356?hl=en';

// Inline formatter for structured plain-text fields: escape, then allow only
// `backtick code` — no other markup to author.
const inlineFmt = (text) => escapeHTML(String(text)).replace(/`([^`]+?)`/g, '<code>$1</code>');

// Requirement badge + note, shared by both renderers.
const requirementBadge = (data) => {
    if (data.deprecated) return '<span class="req-tag req-deprecated">Deprecated</span>';
    if (!data.requirement) return '';
    const level = data.requirement.level;
    const label = {
        required: 'Required',
        programmatic: 'Required for programmatic',
        recommended: 'Recommended',
        conditional: 'Conditional',
        optional: 'Optional'
    }[level] || level;
    let out = `<span class="req-tag req-${level}">${label}</span>`;
    if (data.requirement.note) out += `<em class="tt-note">${inlineFmt(data.requirement.note)}</em>`;
    return out;
};

// A structured entry uses discrete fields; a legacy entry has a prose
// `explanation`. The renderer supports both so the catalogue can migrate
// incrementally.
const isStructured = (data) =>
    data.summary || data.values || data.example || data.notes;

const renderStructured = (data) => {
    let html = '';
    if (data.summary) html += `<p class="tt-summary">${inlineFmt(data.summary)}</p>`;

    if (Array.isArray(data.values) && data.values.length) {
        html += '<div class="tt-values">';
        data.values.forEach(([val, meaning]) => {
            html += `<div class="tt-val"><code>${escapeHTML(val)}</code>${meaning ? ' — ' + inlineFmt(meaning) : ''}</div>`;
        });
        html += '</div>';
    }

    if (data.example) {
        const examples = Array.isArray(data.example) ? data.example : [data.example];
        html += '<div class="tt-example"><span class="tt-label">Example</span>';
        examples.forEach((ex) => {
            // an example may be "code" or ["code", "label"]
            if (Array.isArray(ex)) {
                html += `<div class="tt-val"><code>${escapeHTML(ex[0])}</code>${ex[1] ? ' — ' + inlineFmt(ex[1]) : ''}</div>`;
            } else {
                html += `<code>${escapeHTML(ex)}</code>`;
            }
        });
        html += '</div>';
    }

    if (data.notes) html += `<p class="tt-notes">${inlineFmt(data.notes)}</p>`;

    const url = data.docsAnchor ? `${DOCS_URL}#${data.docsAnchor}` : DOCS_URL;
    html += `<a class="tt-docs" href="${url}" target="_blank" rel="noopener">Google reference ↗</a>`;
    return html;
};

const renderLegacy = (data) => {
    let body = escapeHTML(data.explanation || '');
    body = body.replace(/\n/g, '<br>');
    body = body.replace(/```([^`]*?)```/g, '<code>$1</code>');
    body = body.replace(/\*([^*]+?)\*/g, '<strong>$1</strong>');
    return body;
};

const getTooltipContent = (key) => {
    const data = AdTag.parameters[key];
    if (!data) return '';
    const name = data.name || data.definition || key;
    const type = data.valueType ? `<span class="tt-type">${escapeHTML(data.valueType)}</span>` : '';
    const badge = requirementBadge(data);
    const body = isStructured(data) ? renderStructured(data) : renderLegacy(data);
    return `<strong class="definition">${escapeHTML(name)}${type}</strong>${badge}${body}`;
};

const paramCellHTML = (key) => {
    const label = document.createTextNode(key);
    const span = document.createElement('span');
    span.appendChild(label);
    if (hasTooltip(key)) {
        const icon = document.createElement('span');
        icon.classList.add('tooltip');
        icon.innerHTML = `<small><strong>&#9432;</strong></small> <span class="tooltiptext">${getTooltipContent(key)}</span>`;
        span.appendChild(icon);
    }
    return span;
};

/* --- context summary + legend ------------------------------------------- */

const renderSummary = (ctx1, ctx2, twoTags) => {
    const el = document.getElementById('summary');
    if (!el) return;
    // Render a valid/invalid status row (Endpoint, Ad unit) with an optional
    // reason block and, when valid, a trailing detail (e.g. the iu value).
    const statusRow = (label, res, validDetail) => {
        if (res.valid) {
            return `<div><span class="summary-key">${label}</span> <span class="ep-ok">Valid</span>${validDetail || ''}</div>`;
        }
        const expected = res.expected ? `<br><em>${escapeHTML(res.expected)}</em>` : '';
        return `<div><span class="summary-key">${label}</span> <span class="ep-bad">Invalid</span></div>` +
            `<div class="ep-reason">${escapeHTML(res.reason || '')}${expected}</div>`;
    };

    const card = (ctx, n) => {
        const ep = ctx.endpoint || { valid: true };
        const au = ctx.adUnit || { valid: true };
        const iuDetail = (au.valid && au.iu) ? ` <span class="summary-iu">${escapeHTML(au.iu)}</span>` : '';
        return `
        <div class="summary-card${(ep.valid && au.valid) ? '' : ' summary-card-bad'}">
            <div class="summary-title">${twoTags ? 'Ad Tag ' + n : 'Detected context'}</div>
            ${statusRow('Endpoint', ep)}
            ${statusRow('Ad unit (iu)', au, iuDetail)}
            <div><span class="summary-key">Type</span> ${escapeHTML(ctx.adType)}</div>
            <div><span class="summary-key">Serving</span> ${ctx.servingMode === 'ssai' ? 'Server-side (SSAI)' : 'Client-side (CSAI)'}</div>
            <div><span class="summary-key">Network code</span> ${ctx.networkCode ? escapeHTML(ctx.networkCode) : '—'}</div>
            <div><span class="summary-key">Platform hint</span> ${escapeHTML(ctx.platform)}</div>
        </div>`;
    };
    el.innerHTML = card(ctx1, 1) + (twoTags && ctx2 ? card(ctx2, 2) : '');
    el.classList.add('show');
};

const renderLegend = () => {
    const el = document.getElementById('legend');
    if (!el || el.dataset.rendered) return;
    el.innerHTML = `
        <span class="legend-item"><span class="swatch sw-required"></span>Required / invalid — missing, empty or malformed macro</span>
        <span class="legend-item"><span class="swatch sw-recommended"></span>Recommended / conditional — review</span>
        <span class="legend-item"><span class="swatch sw-ok"></span>Present &amp; valid</span>
        <span class="legend-item"><span class="swatch sw-diff"></span>Differs between tags</span>`;
    el.dataset.rendered = '1';
    el.classList.add('show');
};

/* --- value rendering ----------------------------------------------------- */

// value is the object produced by AdTag.parseAdTag for a key, or undefined.
// siblings is the parsed param map for the same tag (for cross-param checks).
const describeValue = (key, value, servingMode, siblings) => {
    const severity = AdTag.requirementSeverity(key, servingMode);

    if (value === undefined) {
        // Content targeting requires cmsid + vid together.
        if (key === 'cmsid' && siblings && siblings.vid) {
            return { cls: 'no-value', html: `Missing — <code class="parameter">cmsid</code> is required alongside <code class="parameter">vid</code> for content targeting` };
        }
        if (key === 'vid' && siblings && siblings.cmsid) {
            return { cls: 'no-value', html: `Missing — <code class="parameter">vid</code> is required alongside <code class="parameter">cmsid</code> for content targeting` };
        }
        if (severity === 'required') {
            return { cls: 'no-parameter', html: `Required — <code class="parameter">${key}</code> parameter missing` };
        }
        if (severity === 'programmatic') {
            return { cls: 'no-value', html: `Required for programmatic — <code class="parameter">${key}</code> not present` };
        }
        if (severity === 'recommended') {
            return { cls: 'no-value', html: `Recommended — <code class="parameter">${key}</code> not present` };
        }
        return { cls: '', html: 'Parameter missing' };
    }

    if (Array.isArray(value)) {
        const vals = value.map((v) => v.raw !== undefined ? AdTag.safeDecode(v.raw) : '(no value)');
        return { cls: 'no-value', html: `Duplicate parameter (${value.length}×): ${escapeHTML(vals.join(', '))}` };
    }

    if (value.state === 'empty') {
        const cls = severity === 'required' ? 'no-parameter' : 'no-value';
        const lead = severity === 'required' ? 'Required — no' : 'No';
        return { cls, html: `${lead} <code class="parameter">${key}</code> value provided` };
    }

    if (value.state === 'invalid_macro') {
        const hint = servingMode === 'ssai'
            ? 'SSAI macros need double braces <code class="parameter">{{macro}}</code>'
            : 'unbalanced braces';
        return { cls: 'invalid', html: `Invalid macro syntax (${hint}): <code class="parameter">${escapeHTML(value.raw)}</code>` };
    }

    if (value.state === 'placeholder') {
        return { cls: 'no-value', html: `Unresolved placeholder: <code class="parameter">${escapeHTML(value.raw)}</code>` };
    }

    // state === 'ok'
    const decoded = escapeHTML(AdTag.safeDecode(value.raw));
    const satisfied = ['required', 'programmatic', 'recommended'].includes(severity);
    return { cls: satisfied ? 'ok' : '', html: decoded };
};

const escapeHTML = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Decide the ordered key list: tag order first, then any missing expected. */
const orderedKeys = (params1, params2, servingMode) => {
    const present = [];
    const seen = new Set();
    const add = (k) => { if (!seen.has(k)) { seen.add(k); present.push(k); } };
    Object.keys(params1).forEach(add);
    Object.keys(params2).forEach(add);

    // conditional pairing: if one of cmsid/vid is present, show its partner too
    if (seen.has('cmsid') || seen.has('vid')) { add('cmsid'); add('vid'); }

    const missing = AdTag.expectedKeysFor(servingMode)
        .filter((k) => !seen.has(k))
        .sort((a, b) => {
            const rank = (k) => AdTag.requirementSeverity(k, servingMode) === 'required' ? 0 : 1;
            return rank(a) - rank(b);
        });

    return present.concat(missing);
};

/* --- main action --------------------------------------------------------- */

const compareAdTags = () => {
    const adTag1 = document.getElementById('adTag1').value.trim();
    const adTag2 = document.getElementById('adTag2').value.trim();
    const twoTags = document.getElementById('tagToggle').checked;

    if (!adTag1 || (twoTags && !adTag2)) {
        flashBanner('Please enter a valid GAM ad tag');
        return;
    }
    if (!AdTag.isValidAdTag(adTag1) || (twoTags && !AdTag.isValidAdTag(adTag2))) {
        flashBanner('That does not look like a GAM ad tag (missing iu / gdfp_req / output=vast)');
        return;
    }
    if (AdTag.containsWhiteSpace(adTag1) || (twoTags && AdTag.containsWhiteSpace(adTag2))) {
        flashBanner('Ad tag contains whitespace — it will break when requested');
        return;
    }
    alertBanner.classList.remove('show');

    // Duplicates are surfaced as a non-blocking warning; we still render them.
    const dupes1 = AdTag.duplicateParameters(adTag1);
    const dupes2 = twoTags ? AdTag.duplicateParameters(adTag2) : [];
    if (dupes1.length || dupes2.length) {
        const parts = [];
        if (dupes1.length) parts.push(`Tag 1: ${dupes1.join(', ')}`);
        if (dupes2.length) parts.push(`Tag 2: ${dupes2.join(', ')}`);
        flashBanner(`Duplicate parameters found — ${parts.join(' · ')}`, 'info');
    }

    const ctx1 = AdTag.detectContext(adTag1);
    const ctx2 = twoTags ? AdTag.detectContext(adTag2) : null;
    // In compare mode use tag 1's serving mode to decide the row set.
    const servingMode = ctx1.servingMode;
    const mode2 = ctx2 ? ctx2.servingMode : servingMode;

    // Parse each tag with its own serving mode so macro syntax (single-brace
    // CSAI vs double-brace SSAI) is validated correctly per tag.
    const params1 = AdTag.parseAdTag(adTag1, servingMode);
    const params2 = twoTags ? AdTag.parseAdTag(adTag2, mode2) : {};

    // Flag critical problems (wrong endpoint, missing/malformed iu ad unit).
    // Non-blocking: the summary shows persistent red status and params still
    // render, but a banner surfaces the first critical issue.
    const critical = [];
    const collect = (ctx, label) => {
        if (!ctx) return;
        if (!ctx.endpoint.valid) critical.push(`${label}invalid endpoint — ${ctx.endpoint.reason}`);
        if (!ctx.adUnit.valid) critical.push(`${label}${ctx.adUnit.reason}`);
    };
    collect(ctx1, twoTags ? 'Tag 1: ' : '');
    collect(ctx2, 'Tag 2: ');
    if (critical.length) flashBanner(critical[0]);

    renderSummary(ctx1, ctx2, twoTags);
    renderLegend();

    const tbody = document.getElementById('comparisonTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    document.querySelector('#adTag1Header').innerText = twoTags ? 'Ad Tag 1' : (ctx1.adType + ' tag');

    orderedKeys(params1, params2, servingMode).forEach((key) => {
        const row = tbody.insertRow();
        row.insertCell(0).appendChild(paramCellHTML(key));

        const d1 = describeValue(key, params1[key], servingMode, params1);
        const cell1 = row.insertCell(1);
        cell1.innerHTML = d1.html;
        if (d1.cls) cell1.classList.add(d1.cls);

        if (twoTags) {
            const d2 = describeValue(key, params2[key], mode2, params2);
            const cell2 = row.insertCell(2);
            cell2.innerHTML = d2.html;
            if (d2.cls) cell2.classList.add(d2.cls);

            // Highlight genuine value differences between two present values.
            const v1 = params1[key], v2 = params2[key];
            const bothOk = v1 && v2 && !Array.isArray(v1) && !Array.isArray(v2) &&
                v1.state === 'ok' && v2.state === 'ok';
            if (bothOk) {
                if (v1.raw === v2.raw) {
                    cell1.classList.add('same'); cell2.classList.add('same');
                } else {
                    cell1.classList.add('diff'); cell2.classList.add('diff');
                }
            }
        }
    });

    saveState();
};

/* --- toggles / state ----------------------------------------------------- */

const toggleTagInputs = () => {
    const toggle = document.getElementById('tagToggle').checked;
    const adTag2Container = document.getElementById('adTag2Container');
    const adTag2Header = document.getElementById('adTag2Header');
    const toggleLabel = document.getElementById('toggleLabel');
    const table = document.getElementById('comparisonTable');
    const actionButton = document.getElementById('actionButton');

    if (toggle) {
        adTag2Container.classList.remove('hidden');
        adTag2Header.classList.remove('hidden');
        toggleLabel.innerText = 'Inspect single ad tag';
        table.classList.remove('one-tag');
        table.classList.add('two-tags');
        actionButton.innerText = 'Compare Ad Tags';
    } else {
        adTag2Container.classList.add('hidden');
        adTag2Header.classList.add('hidden');
        toggleLabel.innerText = 'Compare two ad tags';
        table.classList.remove('two-tags');
        table.classList.add('one-tag');
        actionButton.innerText = 'Inspect Ad Tag';
        document.querySelectorAll('#comparisonTable tbody tr').forEach((r) => {
            if (r.cells.length === 3) r.deleteCell(2);
        });
    }
};

const saveState = () => {
    if (!document.getElementById('retainToggle').checked) return;
    localStorage.setItem('adTag1', document.getElementById('adTag1').value);
    localStorage.setItem('adTag2', document.getElementById('adTag2').value);
    localStorage.setItem('tagToggle', document.getElementById('tagToggle').checked);
    localStorage.setItem('retainToggle', true);
};

const loadState = () => {
    if (localStorage.getItem('retainToggle') !== 'true') return;
    document.getElementById('retainToggle').checked = true;
    document.getElementById('adTag1').value = localStorage.getItem('adTag1') || '';
    document.getElementById('adTag2').value = localStorage.getItem('adTag2') || '';
    document.getElementById('tagToggle').checked = localStorage.getItem('tagToggle') === 'true';
    toggleTagInputs();
    if (document.getElementById('adTag1').value) compareAdTags();
};

const clearURLQueryParams = () => {
    const clean = window.location.protocol + '//' + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, clean);
};

const clearState = () => {
    ['adTag1', 'adTag2', 'tagToggle', 'retainToggle'].forEach((k) => localStorage.removeItem(k));
    document.getElementById('adTag1').value = '';
    document.getElementById('adTag2').value = '';
    document.getElementById('tagToggle').checked = false;
    document.getElementById('retainToggle').checked = false;
    document.querySelector('#adTag1Header').innerText = 'Ad Tag 1';
    alertBanner.classList.remove('show');
    clearURLQueryParams();
    toggleTagInputs();
    document.getElementById('comparisonTable').getElementsByTagName('tbody')[0].innerHTML = '';
    const summary = document.getElementById('summary');
    if (summary) { summary.innerHTML = ''; summary.classList.remove('show'); }
};

const populateFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    // URLSearchParams already decodes once; do NOT decodeURIComponent again —
    // a second pass throws on tags containing macros like %%CMS_ID%%.
    const adTag1 = params.get('adTag1');
    const adTag2 = params.get('adTag2');
    if (adTag1) document.getElementById('adTag1').value = adTag1;
    if (adTag2) {
        document.getElementById('adTag2').value = adTag2;
        document.getElementById('tagToggle').checked = true;
        toggleTagInputs();
    }
    if (adTag1 || adTag2) compareAdTags();
};

const copyShareLink = () => {
    const adTag1 = encodeURIComponent(document.getElementById('adTag1').value);
    const adTag2 = encodeURIComponent(document.getElementById('adTag2').value);
    const url = `${window.location.origin}${window.location.pathname}?adTag1=${adTag1}&adTag2=${adTag2}`;
    navigator.clipboard.writeText(url);
    flashBanner('Link copied to clipboard', 'info');
};

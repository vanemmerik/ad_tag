/*
 * DOM glue for the GAM Ad Tag Validation Tool (single-tag inspector).
 * All parsing / requirement logic lives in adtag.js (AdTag.*); this file reads
 * the input, renders the verdict + anatomy + component breakdown, and manages
 * share links and saved state.
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

const escapeHTML = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Inline formatter for structured plain-text fields: escape, then allow only
// `backtick code`.
const inlineFmt = (text) => escapeHTML(String(text)).replace(/`([^`]+?)`/g, '<code>$1</code>');

const hasTooltip = (key) => Object.prototype.hasOwnProperty.call(AdTag.parameters, key);

/* --- tooltip content (structured, with legacy fallback) ------------------ */

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

const isStructured = (data) => data.summary || data.values || data.example || data.notes;

const renderStructured = (data) => {
    let html = '';
    if (data.summary) html += `<p class="tt-summary">${inlineFmt(data.summary)}</p>`;
    if (Array.isArray(data.values) && data.values.length) {
        html += '<div class="tt-values">';
        data.values.forEach(([val, meaning]) => {
            html += `<div class="tt-val"><code>${escapeHTML(val)}</code>${meaning ? ' - ' + inlineFmt(meaning) : ''}</div>`;
        });
        html += '</div>';
    }
    if (data.example) {
        const examples = Array.isArray(data.example) ? data.example : [data.example];
        html += '<div class="tt-example"><span class="tt-label">Example</span>';
        examples.forEach((ex) => {
            if (Array.isArray(ex)) {
                html += `<div class="tt-val"><code>${escapeHTML(ex[0])}</code>${ex[1] ? ' - ' + inlineFmt(ex[1]) : ''}</div>`;
            } else {
                html += `<code>${escapeHTML(ex)}</code>`;
            }
        });
        html += '</div>';
    }
    if (data.notes) html += `<p class="tt-notes">${inlineFmt(data.notes)}</p>`;
    const url = data.docsAnchor ? `${DOCS_URL}#${data.docsAnchor}` : DOCS_URL;
    html += `<a class="tt-docs" href="${url}" target="_blank" rel="noopener">Google reference &#8599;</a>`;
    return html;
};

const renderLegacy = (data) => {
    let body = escapeHTML(data.explanation || '');
    body = body.replace(/\n/g, '<br>');
    body = body.replace(/```([^`]*?)```/g, '<code>$1</code>');
    body = body.replace(/\*([^*]+?)\*/g, '<strong>$1</strong>');
    return body;
};

const DOCS_URL = 'https://support.google.com/admanager/answer/10678356?hl=en';

const getTooltipContent = (key) => {
    const data = AdTag.parameters[key];
    if (!data) return '';
    const name = data.name || data.definition || key;
    const type = data.valueType ? `<span class="tt-type">${escapeHTML(data.valueType)}</span>` : '';
    const badge = requirementBadge(data);
    const body = isStructured(data) ? renderStructured(data) : renderLegacy(data);
    return `<strong class="definition">${escapeHTML(name)}${type}</strong>${badge}${body}`;
};

// Parameter cell: key + hover tooltip + role name beneath.
const paramCell = (key) => {
    const role = (AdTag.parameters[key] || {}).name || '';
    const tip = hasTooltip(key)
        ? `<span class="tooltip"><small><strong>&#9432;</strong></small><span class="tooltiptext">${getTooltipContent(key)}</span></span>`
        : '';
    return `<span class="pkey">${escapeHTML(key)}${tip}</span><span class="prole">${escapeHTML(role)}</span>`;
};

/* --- catalogue grouping (role each parameter plays) ---------------------- */

const GROUPS = [
    ['Core serving', ['iu', 'gdfp_req', 'env', 'output', 'sz', 'correlator', 'description_url', 'url', 'unviewed_position_start', 'plcmt', 'vpmute', 'vpa']],
    ['Server-side (SSAI)', ['ssss', 'givn', 'paln', 'ipe']],
    ['Ad rules, pods & duration', ['ad_rule', 'ad_type', 'vad_type', 'afvsz', 'min_ad_duration', 'max_ad_duration', 'sdmax', 'pmnd', 'pmxd', 'pmad', 'pmxfwt', 'pod', 'ppos', 'lip', 'mridx', 'ptpl', 'ptpln', 'nofb', 'vpi']],
    ['Content targeting', ['cmsid', 'vid', 'vid_d', 'allcues', 'cust_params', 'excl_cat', 'iabexcl', 'ciu_szs']],
    ['Device / CTV / app', ['msid', 'an', 'rdid', 'idtype', 'is_lat', 'sid', 'pvid', 'pvid_s', 'dth', 'devt', 'ott_placement', 'venuetype', 'ct_ch', 'ct_ne', 'ct_se', 'ct_ti']],
    ['Measurement', ['aconp', 'vconp', 'vpos', 'omid_p', 'sdk_apis', 'wta', 'hl']],
    ['Privacy & consent', ['npa', 'rdp', 'ppt', 'ltd', 'tfcd', 'tfat', 'gdpr', 'gdpr_consent', 'addtl_consent', 'us_privacy', 'ipd', 'ppid', 'ppsj', 'ssj']],
    ['Price floors / creative / testing', ['pp', 'pubf', 'pvtf', 'trt', 'adtest']]
];
const GROUP_OF = {};
GROUPS.forEach(([name, keys]) => keys.forEach((k) => { GROUP_OF[k] = name; }));
const LIST_PARAMS = { sz: '|,', afvsz: ',', ciu_szs: '|,', iabexcl: ',', sdk_apis: ',', allcues: ',' };

/* --- per-render state (used by classify/decompose) ---------------------- */
let mode, params;

// How a component should be surfaced: {level:'error'|'warn'|'ok'|'skip', msg}
const classify = (key, v) => {
    const sev = AdTag.requirementSeverity(key, mode);
    if (v === undefined) {
        if (key === 'cmsid' && params.vid) return { level: 'warn', msg: 'Required alongside vid for content targeting' };
        if (key === 'vid' && params.cmsid) return { level: 'warn', msg: 'Required alongside cmsid for content targeting' };
        if (sev === 'required') return { level: 'error', msg: 'Required - parameter missing' };
        if (sev === 'programmatic') return { level: 'warn', msg: 'Required for programmatic - not present' };
        if (sev === 'recommended') return { level: 'warn', msg: 'Recommended - not present' };
        return { level: 'skip' };
    }
    if (Array.isArray(v)) return { level: 'warn', msg: 'Duplicate parameter' };
    if (v.state === 'invalid_macro') return { level: 'error', msg: 'Invalid macro syntax (needs {{macro}})' };
    if (v.state === 'empty') return sev === 'required' ? { level: 'error', msg: 'Required - no value' } : { level: 'warn', msg: 'No value provided' };
    if (v.state === 'placeholder') return { level: 'warn', msg: 'Unresolved placeholder' };
    return { level: 'ok' };
};

// Break compound values (cust_params, ppsj, comma/pipe lists) into readable parts.
const decompose = (key, v) => {
    if (v === undefined || Array.isArray(v) || v.state === 'empty') return '';
    const raw = v.raw;
    if (key === 'cust_params') {
        const decoded = AdTag.safeDecode(raw);
        const rows = decoded.split('&').map((pair) => {
            const i = pair.indexOf('=');
            const k = i === -1 ? pair : pair.slice(0, i);
            const val = i === -1 ? '' : pair.slice(i + 1);
            return `<div class="sub-row"><span class="sk">${escapeHTML(k)}</span><span>${escapeHTML(val)}</span></div>`;
        }).join('');
        return `<div class="sub">${rows}</div>`;
    }
    if (key === 'ppsj') {
        try { return `<pre class="json">${escapeHTML(JSON.stringify(JSON.parse(atob(raw)), null, 2))}</pre>`; }
        catch (e) { return ''; }
    }
    if (LIST_PARAMS[key]) {
        const parts = raw.split(new RegExp('[' + LIST_PARAMS[key].replace(/[|]/g, '\\|') + ']'));
        if (parts.length > 1) return `<div class="taglist">${parts.map((p) => `<span class="tagchip">${escapeHTML(p)}</span>`).join('')}</div>`;
    }
    return '';
};

const macroNote = (v) => {
    if (!v || Array.isArray(v) || !v.raw) return '';
    if (v.state === 'invalid_macro') return '<span class="macro-bad">&#10007; invalid macro</span>';
    if (/\{\{[^{}]+\}\}/.test(v.raw)) return '<span class="macro-ok">&#10003; macro</span>';
    return '';
};

/* --- main action --------------------------------------------------------- */

const clearResults = () => { document.getElementById('results').innerHTML = ''; };

const reviewTag = () => {
    const tag = document.getElementById('adTag1').value.trim();

    if (!tag) { flashBanner('Please enter a GAM ad tag'); clearResults(); return; }
    if (!AdTag.isValidAdTag(tag)) {
        flashBanner('That does not look like a GAM ad tag (missing iu / gdfp_req / output=vast)');
        clearResults();
        return;
    }
    if (AdTag.containsWhiteSpace(tag)) {
        flashBanner('Ad tag contains whitespace - it will break when requested');
        return;
    }
    alertBanner.classList.remove('show');

    const dupes = AdTag.duplicateParameters(tag);
    if (dupes.length) flashBanner(`Duplicate parameters found: ${dupes.join(', ')}`, 'info');

    const ctx = AdTag.detectContext(tag);
    mode = ctx.servingMode;
    params = AdTag.parseAdTag(tag, mode);

    // Ordered key set: present first, then expected-missing.
    const keys = [];
    const seen = new Set();
    const add = (k) => { if (!seen.has(k)) { seen.add(k); keys.push(k); } };
    Object.keys(params).forEach(add);
    if (seen.has('cmsid') || seen.has('vid')) { add('cmsid'); add('vid'); }
    AdTag.expectedKeysFor(mode).forEach(add);

    // Verdict + issues (endpoint & ad unit count as errors).
    let errors = 0, warns = 0, oks = 0;
    const issues = [];
    if (!ctx.endpoint.valid) { errors++; issues.push({ level: 'error', key: 'endpoint', msg: ctx.endpoint.reason }); }
    if (!ctx.adUnit.valid) { errors++; issues.push({ level: 'error', key: 'iu', msg: ctx.adUnit.reason }); }
    keys.forEach((k) => {
        const c = classify(k, params[k]);
        if (c.level === 'error') { errors++; issues.push({ level: 'error', key: k, msg: c.msg }); }
        else if (c.level === 'warn') { warns++; issues.push({ level: 'warn', key: k, msg: c.msg }); }
        else if (c.level === 'ok') oks++;
    });
    issues.sort((a, b) => (a.level === 'error' ? 0 : 1) - (b.level === 'error' ? 0 : 1));
    const bad = errors > 0;

    // Anatomy strip.
    const anaSegs = [`<span class="seg host">${escapeHTML(tag.split('?')[0].replace(/^https?:\/\//, ''))}</span>`];
    Object.keys(params).forEach((k) => {
        const c = classify(k, params[k]);
        const cls = c.level === 'error' ? 'err' : c.level === 'warn' ? 'warn' : 'ok';
        const v = params[k];
        const shown = Array.isArray(v) ? '(dup)' : v.state === 'empty' ? '' : AdTag.safeDecode(v.raw || '');
        const clip = shown.length > 22 ? shown.slice(0, 22) + '…' : shown;
        anaSegs.push(`<span class="seg ${cls}" onclick="document.getElementById('row-${k}').scrollIntoView({behavior:'smooth',block:'center'})"><span class="k">${escapeHTML(k)}</span>=${escapeHTML(clip)}</span>`);
    });

    // Component breakdown, grouped by role. The trailing 'Other' group catches
    // any catalogue key not listed in GROUPS, so new params can't silently vanish.
    let bd = '';
    GROUPS.concat([['Other', []]]).forEach(([name]) => {
        const rows = keys.filter((k) => (GROUP_OF[k] || 'Other') === name);
        if (!rows.length) return;
        let allOk = true, inner = '';
        rows.forEach((k) => {
            const v = params[k];
            const c = classify(k, v);
            if (c.level === 'skip') return;
            if (c.level !== 'ok') allOk = false;
            const icon = c.level === 'error' ? '✗' : c.level === 'warn' ? '▲' : '✓';
            let valHtml;
            if (v === undefined || v.state === 'empty') {
                valHtml = `<span class="${c.level === 'error' ? 'missing' : 'warnmsg'}">${escapeHTML(c.msg)}</span>`;
            } else if (Array.isArray(v)) {
                valHtml = `<span class="warnmsg">Duplicate (${v.length}×)</span>`;
            } else if (v.state === 'invalid_macro') {
                valHtml = `<span class="missing">${escapeHTML(v.raw)}</span> <span class="macro-bad">&#10007; invalid macro</span>`;
            } else {
                valHtml = `<span class="decval">${escapeHTML(AdTag.safeDecode(v.raw))}</span><span class="rawval">${escapeHTML(v.raw)}</span>${macroNote(v)}${decompose(k, v)}`;
            }
            inner += `<div class="row ${c.level}" id="row-${k}">
                <div class="status ${c.level}">${icon}</div>
                <div>${paramCell(k)}</div>
                <div class="pval">${valHtml}</div></div>`;
        });
        if (inner) bd += `<div class="group ${allOk ? 'allok' : ''}"><div class="group-title">${escapeHTML(name)}</div>${inner}</div>`;
    });

    document.getElementById('results').innerHTML =
        `<div class="review-grid"><aside class="review-side">
         <div class="verdict ${bad ? 'bad' : 'good'}">
           <span class="verdict-icon">${bad ? '✗' : '✓'}</span>
           <span class="verdict-text">${bad ? 'Invalid tag' : 'Valid tag'}</span>
           <span class="verdict-counts"><b>${errors}</b> error${errors !== 1 ? 's' : ''} · <b>${warns}</b> ${warns === 1 ? 'advisory' : 'advisories'} · <b>${oks}</b> OK</span>
         </div>
         <div class="chips">
           <span class="chip"><b>${escapeHTML(ctx.adType)}</b></span>
           <span class="chip">${ctx.servingMode === 'ssai' ? 'server-side' : 'client-side'}</span>
           <span class="chip">network <b>${escapeHTML(ctx.networkCode || '-')}</b></span>
           <span class="chip">${escapeHTML(ctx.platform)}</span>
           <span class="chip ${ctx.endpoint.valid ? 'ok' : 'bad'}">endpoint ${ctx.endpoint.valid ? '✓' : '✗'}</span>
           <span class="chip ${ctx.adUnit.valid ? 'ok' : 'bad'}">ad unit ${ctx.adUnit.valid ? '✓' : '✗'}</span>
         </div>
         <div class="card"><div class="card-head">Issues</div>
           ${issues.length ? issues.map((i) => {
              const jump = keys.includes(i.key)
                ? `<a class="jump" data-target="row-${escapeHTML(i.key)}">jump to component &rarr;</a>`
                : '';
              return `<div class="issue"><span class="badge ${i.level === 'error' ? 'err' : 'warn'}">${i.level === 'error' ? 'Error' : 'Advisory'}</span>
               <code>${escapeHTML(i.key)}</code><span class="imsg">${escapeHTML(i.msg)}</span>${jump}</div>`;
              }).join('')
              : '<div class="empty-msg">No issues found.</div>'}
         </div>
         <div class="card"><div class="card-head">Tag anatomy <span class="spacer"></span><span style="font-weight:400;font-size:12px;color:#5f6368">click a segment to jump to it</span></div>
           <div class="anatomy">${anaSegs.join('')}</div></div>
         </aside>
         <main class="review-main">
         <div class="card"><div class="card-head">Components <span class="spacer"></span>
             <button class="toolbtn" id="btnRaw">Show raw values</button>
             <button class="toolbtn" id="btnIssues">Issues only</button></div>
           ${bd}</div>
         </main></div>`;

    document.querySelectorAll('.jump').forEach((a) => a.addEventListener('click', () => {
        const el = document.getElementById(a.dataset.target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));

    document.getElementById('btnRaw').addEventListener('click', (e) => {
        document.body.classList.toggle('show-raw');
        e.target.classList.toggle('active');
        e.target.textContent = document.body.classList.contains('show-raw') ? 'Show decoded values' : 'Show raw values';
    });
    document.getElementById('btnIssues').addEventListener('click', (e) => {
        document.body.classList.toggle('issues-only');
        e.target.classList.toggle('active');
    });

    saveState();
};

/* --- state / share ------------------------------------------------------- */

const saveState = () => {
    if (!document.getElementById('retainToggle').checked) return;
    localStorage.setItem('adTag1', document.getElementById('adTag1').value);
    localStorage.setItem('retainToggle', true);
};

const loadState = () => {
    if (localStorage.getItem('retainToggle') !== 'true') return;
    document.getElementById('retainToggle').checked = true;
    document.getElementById('adTag1').value = localStorage.getItem('adTag1') || '';
    if (document.getElementById('adTag1').value) reviewTag();
};

const clearURLQueryParams = () => {
    const clean = window.location.protocol + '//' + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, clean);
};

const clearState = () => {
    ['adTag1', 'retainToggle'].forEach((k) => localStorage.removeItem(k));
    document.getElementById('adTag1').value = '';
    document.getElementById('retainToggle').checked = false;
    document.body.classList.remove('show-raw', 'issues-only');
    alertBanner.classList.remove('show');
    clearURLQueryParams();
    clearResults();
};

const populateFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    // URLSearchParams already decodes once; do NOT decode again (throws on
    // tags containing macros like %%CMS_ID%%).
    const adTag1 = params.get('adTag1');
    if (adTag1) {
        document.getElementById('adTag1').value = adTag1;
        reviewTag();
    }
};

const copyShareLink = () => {
    const adTag1 = encodeURIComponent(document.getElementById('adTag1').value);
    const url = `${window.location.origin}${window.location.pathname}?adTag1=${adTag1}`;
    navigator.clipboard.writeText(url);
    flashBanner('Link copied to clipboard', 'info');
};

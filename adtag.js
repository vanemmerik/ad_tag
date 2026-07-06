/*
 * Pure ad-tag logic - no DOM access. Everything here is unit-testable in Node
 * (see test/adtag.test.js). scripts.js consumes these functions to render.
 *
 * The catalogue (adTagParameters) is a browser global when loaded via <script>;
 * under Node we require it from parameters.js.
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        const { adTagParameters } = require('./parameters.js');
        module.exports = factory(adTagParameters);
    } else {
        // Classic <script> tags share the global lexical scope, so the
        // `adTagParameters` const from parameters.js is visible here.
        // (A top-level const is NOT a property of window, so don't read
        // root.adTagParameters.)
        root.AdTag = factory(adTagParameters);
    }
})(typeof self !== 'undefined' ? self : this, function (adTagParameters) {

    /* Split a full ad tag URL into its raw query string, or '' if none. */
    const queryStringOf = (url) => {
        const q = String(url).indexOf('?');
        return q === -1 ? '' : url.slice(q + 1);
    };

    /*
     * Safe decode: URLSearchParams-style values are already %-decoded by the
     * time we display them, but tag values are frequently malformed
     * (lone '%', double-encoding). Never let a bad value throw.
     */
    const safeDecode = (value) => {
        if (typeof value !== 'string') return value;
        try {
            return decodeURIComponent(value.replace(/\+/g, ' '));
        } catch (e) {
            return value;
        }
    };

    /*
     * Detect a malformed curly-brace macro. The valid syntax differs by
     * serving mode:
     *
     *   SSAI (server-side): DOUBLE braces, e.g. "{{url.givn}}",
     *        "{{system.xfp.correlator}}". A single brace ("{url.givn}") or an
     *        unbalanced pair ("{{system.xfp.correlator}") will not be
     *        substituted by the stitching service and is invalid. Strategy:
     *        strip every well-formed {{...}} macro, then any leftover brace is
     *        malformed. This also catches bad macros inside a compound value
     *        such as cust_params.
     *
     *   CSAI (client-side / Brightcove player): SINGLE braces, e.g.
     *        "{random}", "{mediainfo.id}", "{player.id}". Single braces are
     *        valid here, so we only flag genuinely unbalanced braces (a
     *        double-brace macro is tolerated rather than flagged).
     *
     * servingMode defaults to the lenient CSAI rule when unknown.
     */
    const hasMalformedMacro = (value, servingMode) => {
        if (typeof value !== 'string' || value === '') return false;

        if (servingMode === 'ssai') {
            const stripped = value.replace(/\{\{[^{}]*\}\}/g, '');
            return /[{}]/.test(stripped);
        }

        // CSAI / unknown: single braces are legitimate - flag only imbalance.
        let depth = 0;
        for (const ch of value) {
            if (ch === '{') depth++;
            else if (ch === '}') { depth--; if (depth < 0) return true; }
        }
        return depth !== 0;
    };

    /*
     * Detect an unresolved placeholder that was never filled in, e.g.
     * "[value]", empty "{}"/"{{}}", or a literal "%%CMS_ID%%" macro.
     * Malformed curly-brace macros are handled separately by
     * hasMalformedMacro; a correctly-formed "{{macro}}" is NOT a placeholder.
     */
    const isPlaceholder = (value) => {
        if (typeof value !== 'string' || value === '') return false;
        return (
            /\[[^\]]*\]/.test(value) ||   // [value] style
            /\{\}/.test(value) ||          // empty {}
            /\{\{\s*\}\}/.test(value) ||   // empty {{}}
            /%%[^%]*%%/.test(value)        // unresolved %%MACRO%%
        );
    };

    /*
     * Parse a tag into { key: value } (or { key: [v1, v2] } for repeats).
     * Splits each pair only on the FIRST '=' so base64 / encoded values that
     * themselves contain '=' (ppsj, cust_params) survive intact.
     */
    const parseAdTag = (url, servingMode) => {
        const qs = queryStringOf(url);
        if (!qs) return {};

        const params = {};
        qs.split('&').forEach((pair) => {
            if (pair === '') return; // stray '&&' - ignore rather than inventing a key
            const eq = pair.indexOf('=');
            const key = eq === -1 ? pair : pair.slice(0, eq);
            if (key === '') return;
            const raw = eq === -1 ? '' : pair.slice(eq + 1);

            let value;
            if (raw === '') {
                value = { state: 'empty' };
            } else if (hasMalformedMacro(raw, servingMode)) {
                value = { state: 'invalid_macro', raw };
            } else if (isPlaceholder(raw)) {
                value = { state: 'placeholder', raw };
            } else {
                value = { state: 'ok', raw };
            }

            if (params[key] === undefined) {
                params[key] = value;
            } else {
                // repeated key -> keep as an array to surface the duplicate
                if (!Array.isArray(params[key])) params[key] = [params[key]];
                params[key].push(value);
            }
        });
        return params;
    };

    /* Keys that appear more than once in the raw query string. */
    const duplicateParameters = (url) => {
        const qs = queryStringOf(url);
        if (!qs) return [];
        const counts = {};
        const dupes = [];
        qs.split('&').forEach((pair) => {
            if (pair === '') return;
            const eq = pair.indexOf('=');
            const key = eq === -1 ? pair : pair.slice(0, eq);
            if (key === '') return;
            counts[key] = (counts[key] || 0) + 1;
            if (counts[key] === 2) dupes.push(key);
        });
        return dupes;
    };

    const containsWhiteSpace = (tag) => /\s/.test(tag);

    /*
     * A tag is recognisably a GAM request if it carries the schema indicator,
     * an ad unit, or explicitly requests VAST output.
     */
    const isValidAdTag = (url) => {
        const p = new URLSearchParams(queryStringOf(url));
        return p.has('iu') || p.has('gdfp_req') || (p.get('output') || '').includes('vast');
    };

    /* Extract { host, path } from a full or partial URL (lowercased host). */
    const hostPathOf = (url) => {
        try {
            const u = new URL(url);
            return { host: u.hostname.toLowerCase(), path: u.pathname };
        } catch (e) {
            const m = String(url).match(/^[a-z]+:\/\/([^/?#]+)([^?#]*)/i);
            return m ? { host: m[1].toLowerCase(), path: m[2] || '' } : { host: '', path: '' };
        }
    };

    // The only valid GAM ad request endpoints.
    const CSAI_HOSTS = ['securepubads.g.doubleclick.net', 'pubads.g.doubleclick.net'];
    const SSAI_HOSTS = ['serverside.doubleclick.net', 'dai.google.com'];
    const EXPECTED_ENDPOINT =
        'Expected securepubads.g.doubleclick.net/gampad/ads (client-side) or serverside.doubleclick.net (server-side / SSAI).';

    /*
     * Validate the request endpoint (host + path). isValidAdTag only checks the
     * query string, so a typo'd host (server. vs serverside., pubads. missing
     * .g.) or wrong path (/ads vs /gampad/ads) would otherwise pass unnoticed.
     * Returns { valid, host, path, reason, expected }.
     */
    const validateEndpoint = (url) => {
        const { host, path } = hostPathOf(url);
        const fail = (reason) => ({ valid: false, host, path, reason, expected: EXPECTED_ENDPOINT });

        if (!host) return fail('Could not read a host from the tag - is it a full URL?');

        const isCSAIHost = CSAI_HOSTS.includes(host);
        const isSSAIHost = SSAI_HOSTS.includes(host);
        if (!isCSAIHost && !isSSAIHost) {
            return fail(`Unrecognised ad server host: ${host}`);
        }

        // Client-side gampad requests must use the /gampad/ path.
        if (isCSAIHost && !/^\/gampad\//.test(path)) {
            return fail(`Unexpected path for a client-side request: ${path || '(none)'} - expected /gampad/ads`);
        }
        // Server-side hosts serve via /gampad/ or pod-serving paths.
        if (isSSAIHost && !(/^\/gampad\//.test(path) || /\/(pods|ondemand|dai|linear|live)(\/|$)/i.test(path))) {
            return fail(`Unexpected path for a server-side request: ${path || '(none)'}`);
        }

        return { valid: true, host, path };
    };

    /*
     * Validate the iu (ad unit) parameter - the single most critical field.
     * Without a present, non-empty, well-formed ad unit the request fails.
     * Expected form: /network_code/.../ad_unit where the FIRST path segment is
     * the numeric GAM network code and at least one ad unit segment follows.
     * Returns { valid, iu, networkCode, reason }.
     */
    const validateAdUnit = (url) => {
        const params = parseAdTag(url);
        let v = params.iu;
        if (Array.isArray(v)) v = v[0]; // duplicate iu is flagged separately

        if (v === undefined) {
            return { valid: false, reason: 'The iu (ad unit) parameter is missing - the request will fail.' };
        }
        if (v.state === 'empty' || !v.raw) {
            return { valid: false, reason: 'The iu (ad unit) parameter has no value - the request will fail.' };
        }

        const raw = v.raw;
        const segments = raw.split('/').filter(Boolean);
        if (!raw.startsWith('/') || segments.length < 2) {
            return {
                valid: false,
                iu: raw,
                reason: 'The iu value is malformed - expected /network_code/.../ad_unit.'
            };
        }
        if (!/^\d+$/.test(segments[0])) {
            return {
                valid: false,
                iu: raw,
                reason: 'The iu is missing the network code - the first path segment must be your numeric GAM network code (e.g. /23320021099/...).'
            };
        }
        return { valid: true, iu: raw, networkCode: segments[0] };
    };

    /*
     * Determine the serving context from the host + path. This drives which
     * requirements actually apply (CSAI vs SSAI is the key fork).
     * Returns { servingMode: 'csai'|'ssai', adType, networkCode, platform }.
     */
    const detectContext = (url) => {
        const { host, path } = hostPathOf(url);
        const endpoint = validateEndpoint(url);

        const params = parseAdTag(url);
        const adUnit = validateAdUnit(url);
        const networkCode = adUnit.networkCode || null;

        const isSSAI = /serverside\.doubleclick\.net/i.test(host) ||
            /(^|\.)dai\.google\.com$/i.test(host) ||
            'ssss' in params;
        const isLive = /\/live\//i.test(path) || /\/linear\//i.test(path);

        let servingMode;
        let adType;
        if (isSSAI) {
            servingMode = 'ssai';
            adType = isLive ? 'Live SSAI' : 'VOD SSAI';
        } else if (/(secure)?pubads\.g\.doubleclick\.net/i.test(host)) {
            servingMode = 'csai';
            adType = 'CSAI';
        } else {
            // Unknown host - assume client-side so core CSAI checks still apply.
            servingMode = 'csai';
            adType = 'Unknown (assuming CSAI)';
        }

        // App vs web hint (informational only - does not change red flags).
        const platform = ('msid' in params || 'an' in params || 'rdid' in params)
            ? 'App / CTV' : 'Web';

        return { servingMode, adType, networkCode, platform, isLive, endpoint, adUnit };
    };

    /*
     * Given a parameter key and the detected serving mode, decide how a MISSING
     * value should be surfaced. Returns one of:
     *   'required'    -> hard error (red)
     *   'recommended' -> soft warning (amber): programmatic / recommended
     *   'conditional' -> informational (amber note), never blocks
     *   'none'        -> do not flag when absent
     */
    const requirementSeverity = (key, servingMode) => {
        const req = adTagParameters[key] && adTagParameters[key].requirement;
        if (!req) return 'none';
        if (req.appliesTo && !req.appliesTo.includes(servingMode)) return 'none';
        switch (req.level) {
            case 'required': return 'required';
            case 'programmatic': return 'programmatic';
            case 'recommended': return 'recommended';
            case 'conditional': return 'conditional';
            default: return 'none';
        }
    };

    /*
     * Keys to force-show for a serving mode even when absent, so genuinely
     * missing parameters surface. Limited to hard-required and
     * programmatic-required so the table stays focused - plain "recommended"
     * params are only styled when actually present (see requirementSeverity).
     */
    const expectedKeysFor = (servingMode) =>
        Object.keys(adTagParameters).filter((key) => {
            const s = requirementSeverity(key, servingMode);
            return s === 'required' || s === 'programmatic';
        });

    return {
        queryStringOf,
        safeDecode,
        isPlaceholder,
        hasMalformedMacro,
        parseAdTag,
        duplicateParameters,
        containsWhiteSpace,
        isValidAdTag,
        validateEndpoint,
        validateAdUnit,
        detectContext,
        requirementSeverity,
        expectedKeysFor,
        parameters: adTagParameters
    };
});

/* Minimal dependency-free test harness. Run: node test/adtag.test.js */
const assert = require('assert');
const AdTag = require('../adtag.js');

let pass = 0;
const test = (name, fn) => {
    try { fn(); pass++; console.log('  ok  - ' + name); }
    catch (e) { console.error('  FAIL- ' + name + '\n        ' + e.message); process.exitCode = 1; }
};

const CSAI = 'https://securepubads.g.doubleclick.net/gampad/ads?iu=/6062/videodemo&env=vp&gdfp_req=1&output=vast&sz=640x480';
const SSAI_VOD = 'https://serverside.doubleclick.net/pods/live?iu=/1234/vod&ssss=brightcove&output=vast&gdfp_req=1&env=vp';
const SSAI_LIVE = 'https://serverside.doubleclick.net/pods/live/foo?iu=/1234/live&ssss=brightcove&output=vast&env=vp&gdfp_req=1';

// --- parseAdTag ----------------------------------------------------------
test('parseAdTag keeps "=" inside a value (base64 ppsj)', () => {
    const p = AdTag.parseAdTag('https://x/ads?ppsj=eyJhIjoiYiJ9==&iu=/1/x');
    assert.strictEqual(p.ppsj.raw, 'eyJhIjoiYiJ9==');
    assert.strictEqual(p.ppsj.state, 'ok');
});

test('parseAdTag flags empty values', () => {
    const p = AdTag.parseAdTag('https://x/ads?iu=&output=vast');
    assert.strictEqual(p.iu.state, 'empty');
    assert.strictEqual(p.output.state, 'ok');
});

test('parseAdTag captures repeated keys as an array', () => {
    const p = AdTag.parseAdTag('https://x/ads?vpos=preroll&vpos=midroll');
    assert.ok(Array.isArray(p.vpos));
    assert.strictEqual(p.vpos.length, 2);
});

test('parseAdTag ignores stray && without inventing a key', () => {
    const p = AdTag.parseAdTag('https://x/ads?iu=/1/x&&output=vast');
    assert.deepStrictEqual(Object.keys(p).sort(), ['iu', 'output']);
});

// --- placeholder detection ----------------------------------------------
test('isPlaceholder catches unresolved macros', () => {
    assert.strictEqual(AdTag.isPlaceholder('[value]'), true);
    assert.strictEqual(AdTag.isPlaceholder('{}'), true);
    assert.strictEqual(AdTag.isPlaceholder('%%CMS_ID%%'), true);
    assert.strictEqual(AdTag.isPlaceholder('{{}}'), true);
});

test('isPlaceholder allows valid values / macros', () => {
    assert.strictEqual(AdTag.isPlaceholder('{{url.givn}}'), false);
    assert.strictEqual(AdTag.isPlaceholder('640x480'), false);
    assert.strictEqual(AdTag.isPlaceholder(''), false);
});

// --- macro brace validation (context-aware) ------------------------------
test('SSAI: double-brace macros valid, single/unbalanced invalid', () => {
    assert.strictEqual(AdTag.hasMalformedMacro('{{url.givn}}', 'ssai'), false);
    assert.strictEqual(AdTag.hasMalformedMacro('a={{x}}&b={{y}}', 'ssai'), false);
    assert.strictEqual(AdTag.hasMalformedMacro('{url.givn}', 'ssai'), true);            // single brace
    assert.strictEqual(AdTag.hasMalformedMacro('{{system.xfp.correlator}', 'ssai'), true); // missing brace
    assert.strictEqual(AdTag.hasMalformedMacro('{metadata.custom_fields.genre}}', 'ssai'), true);
});

test('CSAI: single-brace macros valid, only imbalance invalid', () => {
    assert.strictEqual(AdTag.hasMalformedMacro('{random}', 'csai'), false);
    assert.strictEqual(AdTag.hasMalformedMacro('{mediainfo.id}', 'csai'), false);
    assert.strictEqual(AdTag.hasMalformedMacro('{{system.xfp.correlator}}', 'csai'), false); // tolerated
    assert.strictEqual(AdTag.hasMalformedMacro('{random', 'csai'), true);   // unbalanced
    assert.strictEqual(AdTag.hasMalformedMacro('{{x}', 'csai'), true);      // unbalanced
});

test('SSAI: bad macro inside a compound cust_params value', () => {
    const custParams = 'env=testcsai&content_id={{metadata.video_id}}&content_genre={metadata.custom_fields.genre}}';
    assert.strictEqual(AdTag.hasMalformedMacro(custParams, 'ssai'), true);
});

test('parseAdTag applies serving-mode-specific macro rules', () => {
    const ssai = AdTag.parseAdTag('https://x/ads?givn={url.givn}&vid={{metadata.video_id}}&correlator={{sys}', 'ssai');
    assert.strictEqual(ssai.givn.state, 'invalid_macro');
    assert.strictEqual(ssai.vid.state, 'ok');
    assert.strictEqual(ssai.correlator.state, 'invalid_macro');

    const csai = AdTag.parseAdTag('https://x/ads?correlator={random}&foo={bad', 'csai');
    assert.strictEqual(csai.correlator.state, 'ok');       // single brace fine for CSAI
    assert.strictEqual(csai.foo.state, 'invalid_macro');   // unbalanced still caught
});

// --- duplicates ----------------------------------------------------------
test('duplicateParameters finds repeats once', () => {
    assert.deepStrictEqual(AdTag.duplicateParameters('https://x/ads?a=1&a=2&b=3'), ['a']);
    assert.deepStrictEqual(AdTag.duplicateParameters(CSAI), []);
});

// --- validity ------------------------------------------------------------
test('isValidAdTag accepts real tags, rejects junk', () => {
    assert.strictEqual(AdTag.isValidAdTag(CSAI), true);
    assert.strictEqual(AdTag.isValidAdTag('https://example.com/page?foo=bar'), false);
});

// --- endpoint validation (host + path) -----------------------------------
test('validateEndpoint accepts the real GAM endpoints', () => {
    assert.strictEqual(AdTag.validateEndpoint(CSAI).valid, true);
    assert.strictEqual(AdTag.validateEndpoint('https://pubads.g.doubleclick.net/gampad/ads?iu=/1/x').valid, true);
    assert.strictEqual(AdTag.validateEndpoint('https://serverside.doubleclick.net/gampad/ads?iu=/1/x&ssss=bc').valid, true);
    assert.strictEqual(AdTag.validateEndpoint('https://serverside.doubleclick.net/pods/live?iu=/1/x').valid, true);
});

test('validateEndpoint rejects typo hosts (the reported bug)', () => {
    const a = AdTag.validateEndpoint('https://server.doubleclick.net/gampad/ads?iu=/1/x&ssss=bc');
    assert.strictEqual(a.valid, false);
    assert.match(a.reason, /host/i);

    const b = AdTag.validateEndpoint('https://pubads.doubleclick.net/ads?iu=/1/x'); // missing .g.
    assert.strictEqual(b.valid, false);
});

test('validateEndpoint rejects a wrong path on a valid host', () => {
    const r = AdTag.validateEndpoint('https://securepubads.g.doubleclick.net/ads?iu=/1/x');
    assert.strictEqual(r.valid, false);
    assert.match(r.reason, /path/i);
});

// --- ad unit (iu) validation ---------------------------------------------
test('validateAdUnit accepts a well-formed iu', () => {
    const r = AdTag.validateAdUnit(CSAI);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.networkCode, '6062');
});

test('validateAdUnit rejects a missing iu', () => {
    const r = AdTag.validateAdUnit('https://securepubads.g.doubleclick.net/gampad/ads?gdfp_req=1&output=vast');
    assert.strictEqual(r.valid, false);
    assert.match(r.reason, /missing/i);
});

test('validateAdUnit rejects an empty iu value', () => {
    const r = AdTag.validateAdUnit('https://securepubads.g.doubleclick.net/gampad/ads?iu=&output=vast');
    assert.strictEqual(r.valid, false);
    assert.match(r.reason, /no value/i);
});

test('validateAdUnit rejects a malformed iu (no ad unit segment)', () => {
    const r = AdTag.validateAdUnit('https://securepubads.g.doubleclick.net/gampad/ads?iu=/6062&output=vast');
    assert.strictEqual(r.valid, false);
    assert.match(r.reason, /malformed|network_code/i);
});

// --- context detection ---------------------------------------------------
test('detectContext identifies CSAI + network code', () => {
    const c = AdTag.detectContext(CSAI);
    assert.strictEqual(c.servingMode, 'csai');
    assert.strictEqual(c.adType, 'CSAI');
    assert.strictEqual(c.networkCode, '6062');
});

test('detectContext identifies VOD vs Live SSAI', () => {
    assert.strictEqual(AdTag.detectContext(SSAI_VOD).adType, 'VOD SSAI');
    assert.strictEqual(AdTag.detectContext(SSAI_LIVE).adType, 'Live SSAI');
    assert.strictEqual(AdTag.detectContext(SSAI_VOD).servingMode, 'ssai');
});

// --- context-aware requirements (the core fix) ---------------------------
test('ad_rule is conditional, NOT a blanket required flag', () => {
    assert.strictEqual(AdTag.requirementSeverity('ad_rule', 'csai'), 'conditional');
});

test('url / unviewed_position_start no longer hard-required', () => {
    assert.strictEqual(AdTag.requirementSeverity('url', 'csai'), 'programmatic');
    assert.strictEqual(AdTag.requirementSeverity('unviewed_position_start', 'csai'), 'conditional');
});

test('ssss is required for SSAI but not surfaced for CSAI', () => {
    assert.strictEqual(AdTag.requirementSeverity('ssss', 'ssai'), 'required');
    assert.strictEqual(AdTag.requirementSeverity('ssss', 'csai'), 'none');
});

test('core serving params are required in both modes', () => {
    ['iu', 'env', 'gdfp_req', 'output', 'sz'].forEach((k) => {
        assert.strictEqual(AdTag.requirementSeverity(k, 'csai'), 'required', k + ' csai');
        assert.strictEqual(AdTag.requirementSeverity(k, 'ssai'), 'required', k + ' ssai');
    });
});

test('expectedKeysFor(ssai) includes ssss, excludes csai-only vpa', () => {
    const keys = AdTag.expectedKeysFor('ssai');
    assert.ok(keys.includes('ssss'));
    assert.ok(!keys.includes('vpa'));
});

// --- safeDecode ----------------------------------------------------------
test('safeDecode never throws on malformed input', () => {
    assert.strictEqual(AdTag.safeDecode('100%off'), '100%off');
    assert.strictEqual(AdTag.safeDecode('a%20b'), 'a b');
});

console.log(`\n${pass} passed`);

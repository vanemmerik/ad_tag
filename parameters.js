/*
 * GAM Ad Tag parameter catalogue.
 *
 * Each entry describes a Google Ad Manager (GAM 360) video/audio ad tag
 * request parameter. Descriptions are based on Google's official reference:
 * https://support.google.com/admanager/answer/10678356
 *
 * ENTRY SCHEMA (structured fields - the renderer styles them consistently, so
 * there is no per-entry markup to hand-format):
 *
 *   name        display name of the parameter.
 *   valueType   "constant" | "variable" (optional) - shown as a small chip.
 *   summary     one or two plain sentences. Inline `backtick` marks code.
 *   values      optional list of [value, meaning] pairs for enumerated values.
 *   example     a "code" string, an array of them, or [code, label] pairs.
 *   notes       optional extra guidance paragraph (inline `backtick` allowed).
 *   docsAnchor  optional #anchor appended to the Google reference link.
 *   deprecated  true for parameters GAM no longer uses.
 *
 *   requirement drives the context-aware validation in adtag.js:
 *     level     "required"     - needed for basic ad serving        -> red if missing
 *               "programmatic" - needed for programmatic monetization -> amber if missing
 *               "recommended"  - Google recommends it                 -> amber if missing
 *               "conditional"  - required only under a stated condition -> amber note, never red
 *               (omit `requirement` entirely for purely optional params)
 *     appliesTo array of serving modes the requirement applies to:
 *               "csai" (client-side) and/or "ssai" (server-side). Omit = both.
 *     note      the exact requirement wording from Google's docs.
 *     condition human-readable trigger for "conditional" params.
 *
 * To refresh against Google's docs, see the "Alignment pass" section in CLAUDE.md.
 */
const adTagParameters = {
    // ----------------------------------------------------------------------
    // Core parameters required for basic ad serving
    // ----------------------------------------------------------------------
    "iu": {
        "name": "Ad Unit",
        "valueType": "variable",
        "summary": "The current ad unit, in the format `/network_code/.../ad_unit`. The first path segment is your GAM network code.",
        "example": "iu=/6062/videodemo",
        "docsAnchor": "iu",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "gdfp_req": {
        "name": "Schema Indicator",
        "valueType": "constant",
        "summary": "Indicates that the request uses the Ad Manager schema.",
        "example": "gdfp_req=1",
        "docsAnchor": "gdfp_req",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "env": {
        "name": "Environment",
        "valueType": "constant",
        "summary": "Indicates an in-stream request, or that the request comes specifically from a video player.",
        "values": [["instream", "Video and audio ads"], ["vp", "Video ads only"]],
        "example": "env=vp",
        "docsAnchor": "env",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "output": {
        "name": "Output",
        "valueType": "constant",
        "summary": "The output format of the ad. With the IMA SDK this is automatically set to `xml_vast4` (the SDK is backwards compatible with all VAST versions).",
        "values": [
            ["vast", "Network default VAST"],
            ["xml_vast4", "VAST 4"],
            ["vmap", "Network default VMAP"],
            ["xml_vmap1", "VMAP 1"],
            ["xml_vmap1_vast4", "VMAP 1 returning VAST 4"]
        ],
        "example": "output=vast",
        "docsAnchor": "output",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "sz": {
        "name": "Size",
        "valueType": "variable",
        "summary": "The size of the master video ad slot. Separate multiple sizes with a pipe (`|`). Do not include `v` after the size. Optional if only requesting `ad_type=audio`.",
        "example": ["sz=400x300", ["sz=400x300|640x480", "multi-size"]],
        "docsAnchor": "sz",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, and digital out-of-home, including server-side (SSAI) requests."
        }
    },
    "correlator": {
        "name": "Correlator",
        "valueType": "variable",
        "summary": "Shared by multiple requests from the same page view; used for competitive exclusions, including in cookieless environments. Set automatically by the IMA SDK and by server-side stitching, so it is authored manually only for direct/non-SDK VAST. If not using an SDK, use a truly random positive integer not reused across page views.",
        "example": "correlator=4345645667",
        "docsAnchor": "correlator",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home. Automatically populated by the IMA SDK and by server-side stitching; author it manually for direct/non-SDK VAST requests."
        }
    },
    "description_url": {
        "name": "Description URL",
        "valueType": "variable",
        "summary": "Describes the video playing on the page. URL-encoded for web and CTV/OTT; non-encoded for mobile in-app. Not set automatically by the IMA SDK.",
        "example": [
            ["description_url=https%3A%2F%2Fwww.sample.com%2Fgolf.html", "URL-encoded (web/CTV)"],
            ["description_url=https://www.sample.com/golf.html", "non-encoded (mobile in-app)"]
        ],
        "docsAnchor": "description_url",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai"],
            "note": "Required to implement ad serving in web and mobile apps; required if using Ad Exchange or AdSense for dynamic allocation; recommended for programmatic monetization."
        }
    },
    "url": {
        "name": "URL",
        "valueType": "variable",
        "summary": "The full URL from which the request is sent; helps buyers identify context. Set automatically by the IMA SDK on web. In apps, set it to a URL that best represents the inventory. Encode the value.",
        "example": [
            "url=https%3A%2F%2Fwww.videoad.com%2Fgolf.html",
            ["url=https%3A%2F%2F.adsenseformobileapps.com", "apps without a variable URL"]
        ],
        "docsAnchor": "url",
        "requirement": {
            "level": "programmatic",
            "note": "Only required for programmatic monetization; recommended generally. Set automatically by the IMA SDK on web."
        }
    },
    "unviewed_position_start": {
        "name": "Delayed Impressions",
        "valueType": "constant",
        "summary": "Enables delayed impression counting for video (impressions counted on render rather than on request).",
        "example": "unviewed_position_start=1",
        "docsAnchor": "unviewed_position_start",
        "requirement": {
            "level": "conditional",
            "condition": "there is a delayed impression opportunity",
            "note": "Required when there is a delayed impression opportunity. Not required on every tag."
        }
    },
    "plcmt": {
        "name": "Placement",
        "valueType": "constant",
        "summary": "Declares whether in-stream inventory is in-stream or accompanying, per the IAB specifications. For non-in-stream requests this is set for buyers automatically based on the declared inventory format.",
        "values": [["1", "In-stream request"], ["2", "Accompanying content request"]],
        "example": "plcmt=1",
        "docsAnchor": "plcmt",
        "requirement": {
            "level": "programmatic",
            "note": "Required for programmatic monetization in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "vpmute": {
        "name": "Video Play Mute",
        "valueType": "constant",
        "summary": "Indicates whether ad playback starts while the player is muted.",
        "values": [["1", "Muted"], ["0", "Unmuted"]],
        "example": "vpmute=0",
        "notes": "Recommended per MRC Video Measurement Guidelines.",
        "docsAnchor": "vpmute",
        "requirement": {
            "level": "programmatic",
            "note": "Required for programmatic monetization in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "vpa": {
        "name": "Video Play Automatic",
        "valueType": "constant",
        "summary": "Indicates whether video content starts via autoplay or a click. Leave unset if unknown.",
        "values": [["auto", "Plays automatically"], ["click", "Waits for a user action"]],
        "example": "vpa=auto",
        "notes": "Recommended per MRC Video Measurement Guidelines.",
        "docsAnchor": "vpa",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai"],
            "note": "Required for programmatic monetization in web, mobile apps, connected TV, and audio."
        }
    },

    // ----------------------------------------------------------------------
    // Server-side (SSAI / DAI) parameters
    // ----------------------------------------------------------------------
    "ssss": {
        "name": "Server-side Stitching Source",
        "valueType": "constant",
        "summary": "A recognised, Google-supplied value for your stitching vendor. Together with a `serverside.doubleclick.net` host it identifies the request as server-side (SSAI). Google provides this value to vendors with server-to-server integrations.",
        "example": "ssss=brightcove",
        "docsAnchor": "ssss",
        "requirement": {
            "level": "required",
            "appliesTo": ["ssai"],
            "note": "Required for server-side (SSAI) implementations to identify the stitching vendor."
        }
    },
    "givn": {
        "name": "Video Nonce (PAL)",
        "valueType": "variable",
        "summary": "The nonce generated by the Google Programmatic Access Library (PAL) SDK. Identifies a unique video session and helps manage ads across ad breaks. Replaces the legacy `paln` parameter. Used with SSAI/PAL; IMA CSAI manages the nonce internally.",
        "example": [["givn={{url.givn}}", "VOD SSAI"], ["givn={{givn}}", "Live SSAI"]],
        "docsAnchor": "givn",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["ssai"],
            "note": "Recommended for programmatic monetization. Especially important for live SSAI."
        }
    },
    "paln": {
        "name": "PAL Nonce (legacy)",
        "valueType": "variable",
        "summary": "The legacy Programmatic Access Library nonce. New integrations should use `givn` instead.",
        "example": "paln=<nonce>",
        "docsAnchor": "paln",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["ssai"],
            "note": "Recommended for programmatic monetization - migrate to givn."
        }
    },
    "ipe": {
        "name": "Impression Pinging Entity",
        "valueType": "constant",
        "summary": "Indicates that impression pings and conversions originate from the server, not the client.",
        "values": [["ssb", "Server-side beaconing (SSB)"]],
        "example": "ipe=ssb",
        "docsAnchor": "ipe"
    },
    "ss_req": {
        "name": "SSAI Request",
        "summary": "Deprecated. GAM now identifies a request as server-side using the combination of the `serverside.doubleclick.net` host and the `ssss=` parameter.",
        "deprecated": true
    },

    // ----------------------------------------------------------------------
    // Video ad rules, pods and duration
    // ----------------------------------------------------------------------
    "ad_rule": {
        "name": "Ad Rule",
        "valueType": "constant",
        "summary": "Indicates whether to return a single VAST creative or an ad rules (VMAP) response. The default depends on a network setting, which you can override per tag.",
        "values": [["0", "Request a VAST creative"], ["1", "Request ad rules (VMAP)"]],
        "example": ["ad_rule=0", "ad_rule=1"],
        "docsAnchor": "ad_rule",
        "requirement": {
            "level": "conditional",
            "condition": "using video ad rules (VMAP)",
            "note": "Required to correctly use video ad rules. Not required for single VAST requests."
        }
    },
    "ad_type": {
        "name": "Ad Type",
        "valueType": "constant",
        "summary": "Indicates the ad types to return. When set to `audio` or `audio_video`, `vpmute` must be set to 0.",
        "values": [
            ["audio", "Audio only"],
            ["video", "Skippable and non-skippable video"],
            ["audio_video", "Audio and video compete; one serves"],
            ["skippablevideo", "Skippable video only"],
            ["standardvideo", "Non-skippable video only"]
        ],
        "example": "ad_type=audio",
        "docsAnchor": "ad_type",
        "requirement": {
            "level": "conditional",
            "condition": "serving audio ads into audio-only content",
            "note": "Required to serve audio ads when the app has audio content only."
        }
    },
    "vad_type": {
        "name": "Video Ad Type",
        "valueType": "constant",
        "summary": "Indicates whether a linear or non-linear ad should be returned.",
        "values": [["linear", "Linear ad"], ["nonlinear", "Non-linear ad"]],
        "example": "vad_type=linear",
        "docsAnchor": "vad_type"
    },
    "afvsz": {
        "name": "Non-linear Ad Sizes",
        "valueType": "variable",
        "summary": "Comma-separated list of non-linear ad sizes for the slot. Supported: 200x200, 250x250, 300x250, 336x280, 450x50, 468x60, 480x90, 728x90. With the IMA SDK this is overwritten with all supported sizes that fit the slot; leave empty when none are supported.",
        "example": "afvsz=200x200,250x250,300x250",
        "docsAnchor": "afvsz",
        "requirement": {
            "level": "conditional",
            "condition": "serving non-linear video ads without the IMA SDK",
            "note": "Required to serve non-linear video ads when not using the IMA SDK."
        }
    },
    "min_ad_duration": {
        "name": "Minimum Ad Duration",
        "valueType": "variable",
        "summary": "With `max_ad_duration`, specifies the duration range (in milliseconds) an ad must match. Limits individual ad duration for single-ad and optimized pod requests.",
        "example": "min_ad_duration=15000&max_ad_duration=30000",
        "docsAnchor": "min_ad_duration"
    },
    "max_ad_duration": {
        "name": "Maximum Ad Duration",
        "valueType": "variable",
        "summary": "With `min_ad_duration`, specifies the duration range (in milliseconds) an ad must match. Limits individual ad duration for single-ad and optimized pod requests.",
        "example": "min_ad_duration=15000&max_ad_duration=30000",
        "docsAnchor": "max_ad_duration"
    },
    "sdmax": {
        "name": "Skippable Max Ad Duration",
        "valueType": "variable",
        "summary": "Upper bound (milliseconds) for the duration of skippable creatives. Use alone, or with `max_ad_duration` to set different maximums for skippable and non-skippable ads.",
        "example": "max_ad_duration=15000&sdmax=45000",
        "docsAnchor": "sdmax"
    },
    "pmnd": {
        "name": "Pod Minimum Duration",
        "valueType": "variable",
        "summary": "With `pmxd`, the duration range (milliseconds) a pod must match. Specific to optimized pods (advanced video package). Do not use for VMAP (`ad_rule=1`).",
        "example": "pmnd=0&pmxd=60000",
        "docsAnchor": "pmnd"
    },
    "pmxd": {
        "name": "Pod Maximum Duration",
        "valueType": "variable",
        "summary": "With `pmnd`, the duration range (milliseconds) a pod must match. Specific to optimized pods (advanced video package). Do not use for VMAP (`ad_rule=1`).",
        "example": "pmnd=0&pmxd=60000",
        "docsAnchor": "pmxd"
    },
    "pmad": {
        "name": "Pod Maximum Ads",
        "valueType": "variable",
        "summary": "Maximum number of ads in a pod. Specific to optimized pods (advanced video package). Do not use for VMAP (`ad_rule=1`).",
        "example": "pmad=4",
        "docsAnchor": "pmad"
    },
    "pmxfwt": {
        "name": "Pod Max Forced Watch Time",
        "valueType": "variable",
        "summary": "Limits the total non-skippable (forced watch) duration (milliseconds) within an optimized pod.",
        "example": "pmxfwt=30000",
        "docsAnchor": "pmxfwt"
    },
    "pod": {
        "name": "Pod Number",
        "valueType": "variable",
        "summary": "The ordinal number of the pod in a video (pod 1, pod 2, etc.).",
        "example": "pod=3",
        "docsAnchor": "pod",
        "requirement": {
            "level": "conditional",
            "condition": "using competitive exclusions or frequency capping across pods",
            "note": "Required for competitive exclusions and frequency capping to work correctly."
        }
    },
    "ppos": {
        "name": "Position in Pod",
        "valueType": "variable",
        "summary": "The position within a pod (position 1, position 2, etc.). Standard pods only, and necessary for companion autofill.",
        "example": "ppos=2",
        "docsAnchor": "ppos",
        "requirement": {
            "level": "conditional",
            "condition": "using standard pods with position targeting",
            "note": "Required for standard pods with position targeting, competitive exclusions, and frequency capping."
        }
    },
    "lip": {
        "name": "Last Position in Pod",
        "valueType": "constant",
        "summary": "Indicates a request from the last position in a pod. Standard pods only.",
        "values": [["true", "Last position in the pod"]],
        "example": "lip=true",
        "docsAnchor": "lip"
    },
    "mridx": {
        "name": "Mid-roll Number",
        "valueType": "variable",
        "summary": "The ordinal number of the mid-roll (mid-roll 1, mid-roll 2, etc.).",
        "example": "mridx=2",
        "docsAnchor": "mridx",
        "requirement": {
            "level": "conditional",
            "condition": "targeting, reporting on, or forecasting a specific mid-roll",
            "note": "Required to target, report on, and forecast on a specific mid-roll."
        }
    },
    "ptpl": {
        "name": "Ad Break Template ID",
        "valueType": "variable",
        "summary": "The ad break template to apply to an optimized pod request. Templates configure which ad spots are included in a break and their order. Only one of `ptpl` (ID) or `ptpln` (name) is required.",
        "example": "ptpl=<template_id>",
        "docsAnchor": "ptpl"
    },
    "ptpln": {
        "name": "Ad Break Template Name",
        "valueType": "variable",
        "summary": "The ad break template to apply to an optimized pod request. Templates configure which ad spots are included in a break and their order. Only one of `ptpl` (ID) or `ptpln` (name) is required.",
        "example": "ptpln=<template_name>",
        "docsAnchor": "ptpln"
    },
    "nofb": {
        "name": "No Fallback",
        "valueType": "constant",
        "summary": "Indicates the ad request should not return a playlist of video fallback ads.",
        "values": [["1", "Fallback disabled"]],
        "example": "nofb=1",
        "docsAnchor": "nofb"
    },
    "vpi": {
        "name": "Video Playlist Inline",
        "valueType": "constant",
        "summary": "Indicates whether to serve inline VMAP (return VAST inside VMAP). Can reduce latency and guarantee frequency caps and competitive exclusions across a stream.",
        "values": [["1", "Return VAST inline"], ["0", "Return redirects"]],
        "example": "vpi=1",
        "docsAnchor": "vpi"
    },

    // ----------------------------------------------------------------------
    // Content targeting
    // ----------------------------------------------------------------------
    "cmsid": {
        "name": "Content Source ID",
        "valueType": "variable",
        "summary": "With `vid`, targets ads to specific video content. `cmsid` is the content source ID (Ad Manager › Video › Content sources). For Dynamic Ad Insertion VOD, use the `%%CMS_ID%%` macro.",
        "example": [["cmsid=[value]&vid=[value]", "static"], ["cmsid=%%CMS_ID%%&vid=%%VIDEO_ID%%", "DAI VOD macros"]],
        "docsAnchor": "cmsid",
        "requirement": {
            "level": "conditional",
            "condition": "targeting ads to specific video content",
            "note": "Required to use video content targeting (must be paired with vid)."
        }
    },
    "vid": {
        "name": "Video ID",
        "valueType": "variable",
        "summary": "With `cmsid`, targets ads to specific video content. `vid` identifies a particular video (Ad Manager › Video › Content). For Dynamic Ad Insertion VOD, use the `%%VIDEO_ID%%` macro.",
        "example": [["cmsid=[value]&vid=[value]", "static"], ["cmsid=%%CMS_ID%%&vid=%%VIDEO_ID%%", "DAI VOD macros"]],
        "docsAnchor": "vid",
        "requirement": {
            "level": "conditional",
            "condition": "targeting ads to specific video content",
            "note": "Required to use video content targeting (must be paired with cmsid)."
        }
    },
    "vid_d": {
        "name": "Video Duration",
        "valueType": "variable",
        "summary": "The duration of the content, in seconds. Used with `allcues` to serve mid-roll ads without content ingestion (ad rules are also required for mid-rolls).",
        "example": ["vid_d=3600", "vid_d=3600 (a 1-hour video)"],
        "docsAnchor": "vid_d",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "allcues": {
        "name": "All Cue Points",
        "valueType": "variable",
        "summary": "Comma-separated list of cue points, in milliseconds; Ad Manager returns an ad break for each. Used with `vid_d` to serve mid-rolls without content ingestion. If time-based cues are set in your ad rule, those win and `allcues` is ignored.",
        "example": "allcues=10000,20000",
        "docsAnchor": "allcues"
    },
    "cust_params": {
        "name": "Custom Parameters",
        "valueType": "variable",
        "summary": "URL-encoded key-value pairs for custom targeting (demographics, page position, specific pages, etc.). On the tag, key-values are joined with `%3D` and pairs with `%26`.",
        "example": [["cust_params=section=sports&page=2", "decoded"], ["cust_params=section%3Dsports%26page%3D2", "encoded"]],
        "docsAnchor": "cust_params"
    },
    "excl_cat": {
        "name": "Exclusion Category",
        "valueType": "variable",
        "summary": "Blocks line items carrying the given exclusion label from an ad request. Works with `cust_params`.",
        "example": "cust_params=excl_cat%3Dairline_excl_label",
        "docsAnchor": "excl_cat"
    },
    "iabexcl": {
        "name": "IAB Exclusion",
        "valueType": "variable",
        "summary": "Comma-separated list of IAB content categories to exclude.",
        "example": "iabexcl=3,14,527",
        "notes": "e.g. excludes Commercial Trucks, Off-Road Vehicles and Rugby.",
        "docsAnchor": "iabexcl"
    },
    "ciu_szs": {
        "name": "Companion Sizes",
        "valueType": "variable",
        "summary": "Comma-separated list of companion sizes. Pipe-separated (`|`) values indicate a multi-size slot.",
        "example": ["ciu_szs=728x90,300x250", ["ciu_szs=728x90,300x200|300x250", "multi-size slot"]],
        "docsAnchor": "ciu_szs"
    },

    // ----------------------------------------------------------------------
    // Connected TV / device / app identity
    // ----------------------------------------------------------------------
    "msid": {
        "name": "App ID",
        "valueType": "variable",
        "summary": "With `an`, applied to requests from mobile app and connected TV devices; most programmatic video ads require them. The IMA SDK sets both automatically; set manually in non-SDK environments. On iOS/tvOS the SDK cannot access the app ID, so `msid` is omitted and the bundle is sent via `an`.",
        "example": "msid=com.package.publisher&an=sample%20app",
        "docsAnchor": "msid",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["csai", "ssai"],
            "note": "Recommended for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "an": {
        "name": "App Name",
        "valueType": "variable",
        "summary": "With `msid`, applied to requests from mobile app and connected TV devices. The app name should be human-readable. On iOS/tvOS where the SDK cannot access the app ID, the bundle is sent via `an`.",
        "example": "msid=com.package.publisher&an=sample%20app",
        "docsAnchor": "an",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["csai", "ssai"],
            "note": "Recommended for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "rdid": {
        "name": "Resettable Device ID",
        "valueType": "variable",
        "summary": "Resettable device identifier for user targeting from built-in apps and CTV (Google AdID, Apple IDFA, Amazon AFAI, Roku RIDA, Xbox MSAI). On server-side (SSB) streams, pass `rdid`, `idtype` and `is_lat` explicitly. Nearly all programmatic video ads require these.",
        "example": "rdid=<device_id>&idtype=idfa&is_lat=0",
        "docsAnchor": "rdid",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai", "ssai"],
            "note": "Required for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "idtype": {
        "name": "Device ID Type",
        "valueType": "variable",
        "summary": "Identifies the platform ID scheme accompanying `rdid` (case sensitive).",
        "values": [
            ["adid", "Android"], ["afai", "Amazon"], ["idfa", "Apple (iOS)"],
            ["lgudid", "LG"], ["msai", "Xbox"], ["rida", "Roku"],
            ["tifa", "Samsung"], ["tvos", "Apple TV (tvOS)"], ["vaid", "VIDAA OS"], ["vida", "Vizio"]
        ],
        "example": "idtype=idfa",
        "docsAnchor": "idtype",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai", "ssai"],
            "note": "Required for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home (with rdid and is_lat)."
        }
    },
    "is_lat": {
        "name": "Limit Ad Tracking",
        "valueType": "variable",
        "summary": "Signals the user's expressed privacy preference on platform controls. Accompanies `rdid` and `idtype`.",
        "values": [["0", "Limit Ad Tracking disabled"], ["1", "Limit Ad Tracking enabled"]],
        "example": "is_lat=0",
        "docsAnchor": "is_lat",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai", "ssai"],
            "note": "Required for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home (with rdid and idtype)."
        }
    },
    "sid": {
        "name": "Session ID",
        "valueType": "variable",
        "summary": "Privacy-preserving identifier used for frequency capping only. Supported for in-stream video from connected TVs and mobile apps; not currently for web. Must be in UUID format per the IAB IFA guidelines. Opt out with `sid=0`.",
        "example": "sid=123e4567-e89b-12d3-a456-426614174000",
        "docsAnchor": "sid",
        "requirement": {
            "level": "recommended",
            "note": "Required for digital out-of-home; recommended for mobile apps, connected TV, and audio."
        }
    },
    "pvid": {
        "name": "App Set ID",
        "valueType": "variable",
        "summary": "The Android app set ID, needed for monetization when users opt out of personalization on Android. Its scope is set via `pvid_s`. The IMA/PAL SDK passes this automatically; non-SDK implementations call the App Set SDK.",
        "example": "pvid=[AppSetID]&pvid_s=scope_app",
        "docsAnchor": "pvid",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["csai", "ssai"],
            "note": "Recommended for programmatic monetization in apps."
        }
    },
    "pvid_s": {
        "name": "App Set ID Scope",
        "valueType": "constant",
        "summary": "The scope of the app set ID.",
        "values": [["scope_app", "App scope"], ["scope_developer", "Developer scope"]],
        "example": "pvid=[AppSetID]&pvid_s=scope_app",
        "docsAnchor": "pvid_s"
    },
    "dth": {
        "name": "Device Type Hint",
        "valueType": "constant",
        "summary": "Helps reduce device misclassification, specifically on connected TV and set-top box environments. Recommended for PAL and PAI (non-SDK) implementations; not needed for IMA SDK or DAI SDK.",
        "values": [["5", "Connected TV"], ["7", "Set-top box"]],
        "example": "dth=5",
        "docsAnchor": "dth",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "devt": {
        "name": "Device Type",
        "valueType": "constant",
        "summary": "Declares the device type of the request. Used for set-top box programmatic monetization.",
        "example": "devt=stb",
        "docsAnchor": "devt",
        "requirement": {
            "level": "conditional",
            "condition": "set-top box inventory",
            "note": "Required for set-top box programmatic monetization."
        }
    },
    "ott_placement": {
        "name": "OTT Placement",
        "valueType": "constant",
        "summary": "Declares a non-standard OTT placement.",
        "example": "ott_placement=1",
        "docsAnchor": "ott_placement",
        "requirement": {
            "level": "conditional",
            "condition": "non-standard OTT placements",
            "note": "Only required for programmatic monetization on non-standard OTT placements."
        }
    },
    "venuetype": {
        "name": "Venue Type",
        "valueType": "variable",
        "summary": "Declares the venue type for digital out-of-home inventory, per the IAB/OpenOOH venue taxonomy.",
        "example": "venuetype=airborne",
        "docsAnchor": "venuetype",
        "requirement": {
            "level": "conditional",
            "condition": "digital out-of-home inventory",
            "note": "Required for programmatic monetization in digital out-of-home."
        }
    },
    "ct_ch": {
        "name": "Content Channel",
        "valueType": "variable",
        "summary": "The channel of connected TV content, used to improve programmatic monetization.",
        "docsAnchor": "ct_ch",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },
    "ct_ne": {
        "name": "Content Network",
        "valueType": "variable",
        "summary": "The network of connected TV content, used to improve programmatic monetization.",
        "docsAnchor": "ct_ne",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },
    "ct_se": {
        "name": "Content Series",
        "valueType": "variable",
        "summary": "The series of connected TV content, used to improve programmatic monetization.",
        "docsAnchor": "ct_se",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },
    "ct_ti": {
        "name": "Content Title",
        "valueType": "variable",
        "summary": "The title of connected TV content, used to improve programmatic monetization.",
        "docsAnchor": "ct_ti",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },

    // ----------------------------------------------------------------------
    // Continuous play / measurement
    // ----------------------------------------------------------------------
    "aconp": {
        "name": "Audio Continuous Play",
        "valueType": "constant",
        "summary": "Indicates whether the player intends to continuously play audio content. Leave unset if unknown.",
        "values": [["2", "Continuous play ON"], ["1", "Continuous play OFF"]],
        "example": "aconp=2",
        "notes": "Recommended per MRC Audio Measurement Guidelines.",
        "docsAnchor": "aconp",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "vconp": {
        "name": "Video Continuous Play",
        "valueType": "constant",
        "summary": "Indicates whether the player intends to continuously play video content, similar to a TV broadcast. Leave unset if unknown.",
        "values": [["2", "Continuous play ON"], ["1", "Continuous play OFF"]],
        "example": "vconp=2",
        "notes": "Recommended per MRC Video Measurement Guidelines.",
        "docsAnchor": "vconp",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "vpos": {
        "name": "Video Position",
        "valueType": "constant",
        "summary": "Indicates whether the ad request is from a pre-roll, mid-roll or post-roll.",
        "values": [["preroll", "Pre-roll"], ["midroll", "Mid-roll"], ["postroll", "Post-roll"]],
        "example": "vpos=preroll",
        "docsAnchor": "vpos",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "omid_p": {
        "name": "OMID Partner Name",
        "valueType": "variable",
        "summary": "The partner integrating Open Measurement (OM SDK) and its version - for Active View measurement via OM SDK. Not needed with the IMA SDK (set automatically). With PAL, use the omidPartnerName / omidPartnerVersion APIs; without PAL or IMA, set `omid_p` and `sdk_apis`.",
        "example": "omid_p=examplepartner/1.0.0.0&sdk_apis=7",
        "docsAnchor": "omid_p",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "sdk_apis": {
        "name": "SDK API Framework",
        "valueType": "variable",
        "summary": "Comma-separated list of API frameworks the player supports. Used with PAL; overridden if set while using the IMA SDK.",
        "example": "sdk_apis=2,7,9",
        "docsAnchor": "sdk_apis",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "wta": {
        "name": "Why This Ad",
        "valueType": "constant",
        "summary": "Indicates the player's support for rendering ad badging (AdChoices). Defaults to 1 when omitted. Supported automatically by the IMA SDK; otherwise players must implement VAST Icon / IconClickFallbackImage support. Send 0 only if you will not render the icon - EEA `wta=0` requests aren't eligible for reservation creatives with Google badging.",
        "values": [["1", "Player renders AdChoices (or omit)"], ["0", "Player will not render AdChoices"]],
        "example": "wta=1",
        "docsAnchor": "wta",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization; required for Ad Exchange and for EEA web/app traffic."
        }
    },
    "hl": {
        "name": "Language",
        "valueType": "constant",
        "summary": "Requests ads in a given language and drives language selection in dynamic allocation. Any ISO 639-1 (two-letter) or ISO 639-2 (three-letter) code. Defaults to any language targeted by language if omitted.",
        "example": "hl=it",
        "docsAnchor": "hl",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },

    // ----------------------------------------------------------------------
    // Privacy & consent
    // ----------------------------------------------------------------------
    "npa": {
        "name": "Non-Personalized Ads",
        "valueType": "constant",
        "summary": "Treats the request as non-personalized. Set `npa=1` (or include `npa` with no value). Missing or `npa=0` defaults to personalized.",
        "values": [["1", "Non-personalized"], ["0", "Personalized (default)"]],
        "example": "npa=1",
        "docsAnchor": "npa",
        "requirement": {
            "level": "conditional",
            "condition": "the user disables personalization",
            "note": "Only required if the user disables personalization."
        }
    },
    "rdp": {
        "name": "Restrict Data Processing",
        "valueType": "constant",
        "summary": "Restricts data processing. Set `rdp=1` (or include `rdp` with no value). Missing or `rdp=0` will not restrict unless the network-level Restrict Data Processing setting is enabled.",
        "values": [["1", "Restrict data processing"], ["0", "Do not restrict (default)"]],
        "example": "rdp=1",
        "docsAnchor": "rdp"
    },
    "ppt": {
        "name": "Publisher Privacy Treatment",
        "valueType": "constant",
        "summary": "Indicates whether to turn off ads personalization for the request.",
        "values": [["1", "Turn off ads personalization"]],
        "example": "ppt=1",
        "docsAnchor": "ppt"
    },
    "ltd": {
        "name": "Limited Ads",
        "valueType": "constant",
        "summary": "Indicates whether to serve ads in a limited way in the absence of consent for cookies or other local identifiers.",
        "values": [["1", "Serve limited ads"]],
        "example": "ltd=1",
        "docsAnchor": "ltd"
    },
    "tfcd": {
        "name": "Tag For Child-Directed",
        "valueType": "constant",
        "summary": "Tags the ad request for child-directed treatment.",
        "values": [["1", "Child-directed treatment"]],
        "example": "tfcd=1",
        "docsAnchor": "tfcd"
    },
    "gdpr": {
        "name": "GDPR",
        "valueType": "constant",
        "summary": "For publishers integrating with IAB TCF v2.0. If GDPR applies, also provide a TC string via `gdpr_consent`. Direct VAST requests accept but don't automatically read the value.",
        "values": [["1", "GDPR applies"], ["0", "GDPR does not apply"]],
        "example": "gdpr=1",
        "docsAnchor": "gdpr"
    },
    "gdpr_consent": {
        "name": "GDPR Consent",
        "valueType": "variable",
        "summary": "An IAB TCF v2.0 TC string, for publishers integrating with IAB TCF v2.0. Direct VAST requests accept but don't automatically read it.",
        "example": "gdpr_consent=<TC_string>",
        "docsAnchor": "gdpr_consent"
    },
    "addtl_consent": {
        "name": "Additional Consent",
        "valueType": "variable",
        "summary": "For IAB TCF v2.0 publishers using a vendor not yet on the IAB Europe Global Vendor List but on Google's Ad Tech Providers (ATP) list.",
        "example": "addtl_consent=1~1.35.41.101",
        "docsAnchor": "addtl_consent"
    },
    "us_privacy": {
        "name": "US Privacy (CCPA)",
        "valueType": "variable",
        "summary": "Carries the IAB US Privacy (CCPA) string.",
        "example": "us_privacy=1YNN",
        "docsAnchor": "us_privacy"
    },
    "ipd": {
        "name": "Inventory Partner Domain",
        "valueType": "variable",
        "summary": "Set to the `inventorypartnerdomain` declarations in the publisher's app-ads.txt (or ads.txt). Designates an inventory sharing partner's domain for ads.txt/app-ads.txt validation.",
        "example": "ipd=partner.example",
        "docsAnchor": "ipd",
        "requirement": {
            "level": "conditional",
            "condition": "monetizing inventory you do not own (inventory sharing)",
            "note": "Required for publishers monetizing inventory they do not own."
        }
    },
    "ppid": {
        "name": "Publisher Provided Identifier",
        "valueType": "variable",
        "summary": "Publisher provided identifier used for frequency capping, audience segmentation and targeting, sequential ad rotation, and other audience-based delivery controls across devices.",
        "example": "ppid=12JD92JD8078S8J29SDOAKC0EF230337",
        "docsAnchor": "ppid",
        "requirement": {
            "level": "conditional",
            "condition": "using a consistent, platform-agnostic identifier",
            "note": "Required to use a consistent, platform-agnostic identifier."
        }
    },
    "ppsj": {
        "name": "Publisher Provided Signals (JSON)",
        "valueType": "variable",
        "summary": "A base64-encoded JSON object of audience and contextual data the publisher provides to improve programmatic monetization.",
        "example": "ppsj=<base64-encoded JSON>",
        "notes": 'Decoded JSON example: `{"PublisherProvidedTaxonomySignals":[{"taxonomy":"IAB_AUDIENCE_1_1","values":["6","284"]}]}`',
        "docsAnchor": "ppsj"
    },

    // ----------------------------------------------------------------------
    // Price floors, creative profile, testing
    // ----------------------------------------------------------------------
    "pp": {
        "name": "Creative Profile",
        "valueType": "variable",
        "summary": "Controls which creatives are eligible to serve, based on a configured video/audio creative profile.",
        "example": "pp=creative_profile",
        "docsAnchor": "pp",
        "requirement": {
            "level": "conditional",
            "condition": "restricting media files with a creative profile",
            "note": "Required to restrict media files for hosted creatives with creative profiles."
        }
    },
    "pubf": {
        "name": "Public Price Floor",
        "valueType": "constant",
        "summary": "Equivalent of `google_ad_public_floor`; adds a public price floor to Ad Exchange tags.",
        "example": "pubf=123",
        "docsAnchor": "pubf"
    },
    "pvtf": {
        "name": "Private Price Floor",
        "valueType": "variable",
        "summary": "Equivalent of `google_ad_private_floor`; adds a private price floor to Ad Exchange tags.",
        "example": "pvtf=123",
        "docsAnchor": "pvtf"
    },
    "trt": {
        "name": "Traffic Type",
        "valueType": "constant",
        "summary": "Requests either purchased or organic traffic. The IMA SDK sets no default; when missing, the server defaults to 0 (undefined traffic).",
        "values": [["1", "Purchased traffic"], ["2", "Organic traffic"]],
        "example": "trt=1",
        "docsAnchor": "trt"
    },
    "adtest": {
        "name": "Ad Test",
        "valueType": "constant",
        "summary": "Requests test ads without impacting reporting or revenue. Never use in production.",
        "values": [["on", "Enable test mode"]],
        "example": "adtest=on",
        "docsAnchor": "adtest"
    }
};

// Make the catalogue available to Node for the test harness while remaining a
// plain browser global when loaded via <script>.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { adTagParameters };
}

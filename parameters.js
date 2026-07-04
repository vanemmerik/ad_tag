/*
 * GAM Ad Tag parameter catalogue.
 *
 * Each entry describes a Google Ad Manager (GAM 360) video/audio ad tag
 * request parameter. Descriptions are based on Google's official reference:
 * https://support.google.com/admanager/answer/10678356
 *
 * The `requirement` object drives the context-aware validation in adtag.js.
 * Instead of a blanket "mandatory" flag (which produced false red flags,
 * because a parameter's necessity depends on how the tag is served), each
 * parameter declares:
 *
 *   level     "required"     - needed for basic ad serving        -> red if missing
 *             "programmatic" - needed for programmatic monetization -> amber if missing
 *             "recommended"  - Google recommends it                 -> amber if missing
 *             "conditional"  - required only under a stated condition -> amber note, never red
 *             "optional"     - situational / feature-specific        -> never flagged
 *             (omit `requirement` entirely for purely optional params)
 *
 *   appliesTo array of serving modes this requirement applies to:
 *             "csai" (client-side, IMA SDK / direct VAST) and/or
 *             "ssai" (server-side, DAI / pod serving).
 *             Omit to mean "applies to both".
 *
 *   note      the exact requirement wording from Google's docs, shown in the
 *             tooltip so Support can cite the source of truth.
 *
 *   condition human-readable trigger for "conditional" params.
 *
 * `deprecated: true` marks parameters GAM no longer uses.
 */
const adTagParameters = {
    // ----------------------------------------------------------------------
    // Core parameters required for basic ad serving
    // ----------------------------------------------------------------------
    "iu": {
        "definition": "Ad Unit",
        "explanation": "The ad unit parameter accepts a variable value which should be set to the current ad unit, in the format ```/network_code/.../ad_unit```.\n\nThe first path segment is your GAM network code.\n\nUsage example:\n```iu=/6062/videodemo```",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "gdfp_req": {
        "definition": "Schema Indicator",
        "explanation": "The Ad Manager schema indicator parameter accepts a constant value which indicates that the request uses the Ad Manager schema.\n\nUsage example:\n```gdfp_req=1```",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "env": {
        "definition": "Environment",
        "explanation": "The environment parameter accepts a constant value that indicates an in-stream request, or that the request is specifically from a video player.\n\nPossible values are ```instream``` (video and audio ads) or ```vp``` (video ads only).\n\nUsage example:\n\nVideo and/or audio:\n```env=instream```\n\nVideo only:\n```env=vp```",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "output": {
        "definition": "Output",
        "explanation": "The ad output format parameter accepts a constant value set to the output format of the ad.\n\nUse ```output=vast``` for your network's default VAST version. If your player uses the IMA SDK, this is automatically set to ```output=xml_vast4``` (the SDK is backwards compatible with all VAST versions).\n\nUse ```output=vmap``` to return the default VMAP version. To return VAST inside VMAP, use ```xml_vmap1_vast3``` or ```xml_vmap1_vast4```.\n\nUsage examples:\n\nDefault VAST: ```output=vast```\nVAST 4: ```output=xml_vast4```\nDefault VMAP: ```output=vmap```\nVMAP 1: ```output=xml_vmap1```\nVMAP 1 returning VAST 4: ```output=xml_vmap1_vast4```",
        "requirement": {
            "level": "required",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "sz": {
        "definition": "Size",
        "explanation": "The size parameter accepts a variable value set to the size of the master video ad slot. Separate multiple sizes with a pipe (```|```) character. Do not include ```v``` after the size.\n\nUsage example:\n```sz=400x300```\n\nMulti-size:\n```sz=400x300|640x480```\n\nThis parameter is optional if only requesting ```ad_type=audio```.",
        "requirement": {
            "level": "required",
            "appliesTo": ["csai"],
            "note": "Required to implement ad serving in web, mobile apps, connected TV, and digital out-of-home. In server-side (SSAI) pod serving the slot size is often supplied out-of-band."
        }
    },
    "correlator": {
        "definition": "Correlator",
        "explanation": "The correlator parameter accepts a variable value shared by multiple requests from the same page view. It is used to implement competitive exclusions, including in cookieless environments.\n\nIf the IMA SDK is used, the correlator is set automatically and any value you set is overwritten. In server-side serving the correlator is generated by the stitching service.\n\nIf you are not using an SDK, set this to a truly random positive integer that is not reused across page views.\n\nUsage example:\n```correlator=4345645667```",
        "requirement": {
            "level": "recommended",
            "note": "Required to implement ad serving in web, mobile apps, connected TV, audio, and digital out-of-home — but automatically populated by the IMA SDK and by server-side stitching, so it is only authored manually for direct/non-SDK VAST requests."
        }
    },
    "description_url": {
        "definition": "Description URL",
        "explanation": "The description URL parameter accepts a variable value describing the video playing on the page.\n\nThe value must be URL-encoded for web page video players and CTV/OTT devices, and non-encoded for mobile in-app video players. It is not set automatically by the IMA SDK — it must be set manually.\n\nUsage examples:\n\nURL-encoded:\n```description_url=https%3A%2F%2Fwww.sample.com%2Fgolf.html```\n\nNon-encoded (mobile in-app):\n```description_url=https://www.sample.com/golf.html```",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai"],
            "note": "Required to implement ad serving in web and mobile apps; recommended for programmatic monetization."
        }
    },
    "url": {
        "definition": "URL",
        "explanation": "The URL parameter accepts a variable value set to the full URL from which the request is sent. It helps buyers identify the context of the request and should be populated dynamically.\n\nOn web, this is the page displaying the video player; the IMA SDK sets it automatically. In an app, set it to a URL that best represents the inventory being monetized. The value should be encoded.\n\nUsage example:\n```url=https%3A%2F%2Fwww.videoad.com%2Fgolf.html```\n\nFor apps where a variable URL is not possible:\n```url=https%3A%2F%2F.adsenseformobileapps.com```",
        "requirement": {
            "level": "programmatic",
            "note": "Only required for programmatic monetization; recommended generally. Set automatically by the IMA SDK on web."
        }
    },
    "unviewed_position_start": {
        "definition": "Delayed Impressions",
        "explanation": "The delayed impressions parameter accepts a constant value indicating delayed impression counting for video (impressions counted on render rather than on request).\n\nUsage example:\n```unviewed_position_start=1```",
        "requirement": {
            "level": "conditional",
            "condition": "there is a delayed impression opportunity",
            "note": "Required when there is a delayed impression opportunity. Not required on every tag."
        }
    },
    "plcmt": {
        "definition": "Placement",
        "explanation": "The placement parameter accepts a constant value indicating whether the in-stream inventory is declared as *in-stream* or *accompanying* per the IAB specifications.\n\nFor non-in-stream requests this is populated for buyers automatically based on the declared inventory format, overriding any declaration here.\n\nUsage examples:\n\nIn-stream request: ```plcmt=1```\nAccompanying content request: ```plcmt=2```",
        "requirement": {
            "level": "programmatic",
            "note": "Required for programmatic monetization in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "vpmute": {
        "definition": "Video Play Mute",
        "explanation": "*Recommended per MRC Video Measurement Guidelines*\n\nThe muted video parameter accepts a constant value indicating whether ad playback starts while the player is muted.\n\nUsage examples:\n\nMuted: ```vpmute=1```\nUnmuted: ```vpmute=0```",
        "requirement": {
            "level": "programmatic",
            "note": "Required for programmatic monetization in web, mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "vpa": {
        "definition": "Video Play Automatic",
        "explanation": "*Recommended per MRC Video Measurement Guidelines*\n\nThe video play automatic parameter accepts a constant value indicating whether video content starts through autoplay or a click.\n\nPossible values are ```click``` (waits for a user action) or ```auto``` (plays automatically). Leave unset if unknown.\n\nUsage examples:\n\nAutoplay: ```vpa=auto```\nClick to play: ```vpa=click```",
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
        "definition": "Server-side Stitching Source",
        "explanation": "The server-side stitching source parameter accepts a constant value set to a recognised, Google-supplied value for your video stitching technology vendor. Together with a ```serverside.doubleclick.net``` host it identifies the request as server-side (SSAI).\n\nVendors with server-to-server integrations are given this value by Google.\n\nUsage example:\n```ssss=brightcove```",
        "requirement": {
            "level": "required",
            "appliesTo": ["ssai"],
            "note": "Required for server-side (SSAI) implementations to identify the stitching vendor."
        }
    },
    "givn": {
        "definition": "Video Nonce (PAL)",
        "explanation": "The ```givn``` parameter carries the nonce generated by the Google Programmatic Access Library (PAL) SDK. It identifies a unique video session and helps manage ads across multiple ad breaks within the same session. It replaces the legacy ```paln``` parameter.\n\nUsage examples:\n\nVOD SSAI: ```givn={{url.givn}}```\nLive SSAI: ```givn={{givn}}```\n\n*Used with SSAI/PAL; does not apply to IMA CSAI, which manages the nonce internally.*",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["ssai"],
            "note": "Recommended for programmatic monetization. Especially important for live SSAI."
        }
    },
    "paln": {
        "definition": "PAL Nonce (legacy)",
        "explanation": "The legacy Programmatic Access Library nonce parameter. New integrations should use ```givn``` instead.\n\nUsage example:\n```paln=<nonce>```",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["ssai"],
            "note": "Recommended for programmatic monetization — migrate to givn."
        }
    },
    "ipe": {
        "definition": "Impression Pinging Entity",
        "explanation": "The impression pinging entity parameter accepts a constant value indicating that impression pings and conversions originate from the server, not the client.\n\nUsage example:\n\nServer-side beaconing (SSB): ```ipe=ssb```"
    },
    "ss_req": {
        "definition": "SSAI Request",
        "explanation": "Deprecated. GAM now identifies a request as server-side using the combination of the ```serverside.doubleclick.net``` host and the ```ssss=``` parameter.",
        "deprecated": true
    },

    // ----------------------------------------------------------------------
    // Video ad rules, pods and duration
    // ----------------------------------------------------------------------
    "ad_rule": {
        "definition": "Ad Rule",
        "explanation": "The ad rule parameter accepts a constant value indicating whether to return a VAST creative or an ad rules (VMAP) response. The default depends on an Ad Manager network setting, which you can override per tag.\n\nUsage examples:\n\nRequest a VAST creative: ```ad_rule=0```\nRequest ad rules (VMAP): ```ad_rule=1```",
        "requirement": {
            "level": "conditional",
            "condition": "using video ad rules (VMAP)",
            "note": "Required to correctly use video ad rules. Not required for single VAST requests."
        }
    },
    "ad_type": {
        "definition": "Ad Type",
        "explanation": "The ad type parameter accepts a constant value indicating the ad types to return. When set to ```audio``` or ```audio_video```, the ```vpmute``` parameter must be set to 0.\n\nUsage examples:\n\nAudio only: ```ad_type=audio```\nVideo (skippable + non-skippable): ```ad_type=video```\nAudio and video (both compete, one serves): ```ad_type=audio_video```\nSkippable video only: ```ad_type=skippablevideo```\nNon-skippable video only: ```ad_type=standardvideo```",
        "requirement": {
            "level": "conditional",
            "condition": "serving audio ads into audio-only content",
            "note": "Required to serve audio ads when the app has audio content only."
        }
    },
    "vad_type": {
        "definition": "Video Ad Type",
        "explanation": "The video ad type parameter accepts a constant value indicating whether a linear or non-linear ad should be returned.\n\nUsage examples:\n\nLinear ad: ```vad_type=linear```\nNon-linear ad: ```vad_type=nonlinear```"
    },
    "afvsz": {
        "definition": "Non-linear Ad Sizes",
        "explanation": "The non-linear ad sizes parameter accepts a comma-separated list of non-linear ad sizes that can display in the video ad slot. Supported sizes: 200x200, 250x250, 300x250, 336x280, 450x50, 468x60, 480x90, 728x90.\n\nWhen using the IMA SDK this field is overwritten with all supported sizes that fit the non-linear slot dimensions. Leave empty when no non-linear sizes are supported.\n\nUsage example:\n```afvsz=200x200,250x250,300x250```",
        "requirement": {
            "level": "conditional",
            "condition": "serving non-linear video ads without the IMA SDK",
            "note": "Required to serve non-linear video ads when not using the IMA SDK."
        }
    },
    "min_ad_duration": {
        "definition": "Minimum Ad Duration",
        "explanation": "The ad duration parameters, taken together, specify the duration range (in milliseconds) an ad must match. Use them to limit individual ad duration for single-ad and optimized pod requests.\n\nUsage example:\n```min_ad_duration=15000&max_ad_duration=30000```"
    },
    "max_ad_duration": {
        "definition": "Maximum Ad Duration",
        "explanation": "The ad duration parameters, taken together, specify the duration range (in milliseconds) an ad must match. Use them to limit individual ad duration for single-ad and optimized pod requests.\n\nUsage example:\n```min_ad_duration=15000&max_ad_duration=30000```"
    },
    "sdmax": {
        "definition": "Skippable Max Ad Duration",
        "explanation": "The skippable max ad duration parameter accepts a variable value (milliseconds) setting the upper bound for the duration of skippable video/audio creatives for the request.\n\nUse it independently for skippable ads, or alongside ```max_ad_duration``` to set different maximums for skippable and non-skippable ads.\n\nUsage example:\n```max_ad_duration=15000&sdmax=45000```"
    },
    "pmnd": {
        "definition": "Pod Minimum Duration",
        "explanation": "The pod duration parameters, taken together, specify the duration range (in milliseconds) a pod must match. Specific to optimized pods (advanced video package). Do not use for VMAP (```ad_rule=1```).\n\nUsage example:\n```pmnd=0&pmxd=60000```"
    },
    "pmxd": {
        "definition": "Pod Maximum Duration",
        "explanation": "The pod duration parameters, taken together, specify the duration range (in milliseconds) a pod must match. Specific to optimized pods (advanced video package). Do not use for VMAP (```ad_rule=1```).\n\nUsage example:\n```pmnd=0&pmxd=60000```"
    },
    "pmad": {
        "definition": "Pod Maximum Ads",
        "explanation": "The pod ad maximum parameter accepts a variable value indicating the maximum number of ads in a pod. Specific to optimized pods (advanced video package). Do not use for VMAP (```ad_rule=1```).\n\nUsage example:\n```pmad=4```"
    },
    "pmxfwt": {
        "definition": "Pod Max Forced Watch Time",
        "explanation": "The pod max forced watch time parameter accepts a variable value (milliseconds) limiting the total non-skippable (forced watch) duration within an optimized pod.\n\nUsage example:\n```pmxfwt=30000```"
    },
    "pod": {
        "definition": "Pod Number",
        "explanation": "The pod number parameter accepts a variable value representing the ordinal number of the pod in a video (pod 1, pod 2, etc.).\n\nUsage example:\n```pod=3```",
        "requirement": {
            "level": "conditional",
            "condition": "using competitive exclusions or frequency capping across pods",
            "note": "Required for competitive exclusions and frequency capping to work correctly."
        }
    },
    "ppos": {
        "definition": "Position in Pod",
        "explanation": "The position in pod parameter accepts a variable value representing the position within a pod (position 1, position 2, etc.). For standard pods only, and necessary for companion autofill.\n\nUsage example:\n```ppos=2```",
        "requirement": {
            "level": "conditional",
            "condition": "using standard pods with position targeting",
            "note": "Required for standard pods with position targeting, competitive exclusions, and frequency capping."
        }
    },
    "lip": {
        "definition": "Last Position in Pod",
        "explanation": "The last position in pod parameter accepts a constant value indicating a request from the last position in a pod. For standard pods only.\n\nUsage example:\n```lip=true```"
    },
    "mridx": {
        "definition": "Mid-roll Number",
        "explanation": "The mid-roll number parameter accepts a variable value indicating the ordinal number of the mid-roll (mid-roll 1, mid-roll 2, etc.).\n\nUsage example:\n```mridx=2```"
    },
    "ptpl": {
        "definition": "Ad Break Template ID",
        "explanation": "The ad break template ID and name indicate which ad break template applies to an optimized pod request. Templates configure which ad spots are included in a break and their order. Only one of ID or name is required.\n\nUsage example:\n```ptpl=<template_id>```"
    },
    "ptpln": {
        "definition": "Ad Break Template Name",
        "explanation": "The ad break template ID and name indicate which ad break template applies to an optimized pod request. Templates configure which ad spots are included in a break and their order. Only one of ID or name is required.\n\nUsage example:\n```ptpln=<template_name>```"
    },
    "nofb": {
        "definition": "No Fallback",
        "explanation": "The fallback disabled parameter accepts a constant value indicating the ad request should not return a playlist of video fallback ads.\n\nUsage example:\n```nofb=1```"
    },
    "vpi": {
        "definition": "Video Playlist Inline",
        "explanation": "The video playlist inline parameter accepts a constant value indicating whether to serve inline VMAP (return VAST inside VMAP). Can reduce latency and guarantee frequency caps and competitive exclusions across a stream.\n\nUsage examples:\n\nReturn VAST inline: ```vpi=1```\nReturn redirects: ```vpi=0```"
    },

    // ----------------------------------------------------------------------
    // Content targeting
    // ----------------------------------------------------------------------
    "cmsid": {
        "definition": "Content Source ID",
        "explanation": "The content source ID and video ID target ads to specific video content. Both are required together on the master video tag.\n\nThe ```cmsid``` is a unique number for each content source (Ad Manager › Video › Content sources). The ```vid``` identifies a particular video (Ad Manager › Video › Content).\n\nUsage example:\n```cmsid=[value]&vid=[value]```\n\nFor Dynamic Ad Insertion with VOD, use macros:\n```cmsid=%%CMS_ID%%&vid=%%VIDEO_ID%%```",
        "requirement": {
            "level": "conditional",
            "condition": "targeting ads to specific video content",
            "note": "Required to use video content targeting (must be paired with vid)."
        }
    },
    "vid": {
        "definition": "Video ID",
        "explanation": "The content source ID and video ID target ads to specific video content. Both are required together on the master video tag.\n\nThe ```cmsid``` is a unique number for each content source (Ad Manager › Video › Content sources). The ```vid``` identifies a particular video (Ad Manager › Video › Content).\n\nUsage example:\n```cmsid=[value]&vid=[value]```\n\nFor Dynamic Ad Insertion with VOD, use macros:\n```cmsid=%%CMS_ID%%&vid=%%VIDEO_ID%%```",
        "requirement": {
            "level": "conditional",
            "condition": "targeting ads to specific video content",
            "note": "Required to use video content targeting (must be paired with cmsid)."
        }
    },
    "vid_d": {
        "definition": "Video Duration",
        "explanation": "The video duration parameter accepts a variable value specifying the duration of the content, in seconds.\n\nThe ```vid_d``` and ```allcues``` parameters serve mid-roll ads without content ingestion (ad rules are also required for mid-rolls).\n\nUsage example:\n```vid_d=3600``` (a 1-hour video)",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "allcues": {
        "definition": "All Cue Points",
        "explanation": "The all cues parameter accepts a comma-separated list of cue points, in milliseconds. Ad Manager returns an ad break for each value.\n\nUsed with ```vid_d``` to serve mid-roll ads without content ingestion (ad rules also required). If time-based cues are set in your ad rule, those are used and ```allcues``` is ignored.\n\nUsage example:\n```allcues=10000,20000```"
    },
    "cust_params": {
        "definition": "Custom Parameters",
        "explanation": "The custom parameters parameter accepts URL-encoded key-value pairs for custom targeting (demographics, page position, specific pages, etc.).\n\nUsage example (decoded):\n```cust_params=section=sports&page=2```\n\nEncoded on the tag, key-values are joined with ```%3D``` and pairs with ```%26```."
    },
    "excl_cat": {
        "definition": "Exclusion Category",
        "explanation": "The exclusion category parameter blocks line items containing the given exclusion label from an ad request. Works with ```cust_params```.\n\nUsage example:\n```cust_params=excl_cat%3Dairline_excl_label```"
    },
    "iabexcl": {
        "definition": "IAB Exclusion",
        "explanation": "The IAB exclusion parameter accepts a comma-separated list of IAB content categories to exclude.\n\nUsage example:\n```iabexcl=3,14,527```\n\nExcludes \"Commercial Trucks\", \"Off-Road Vehicles\" and \"Rugby\"."
    },
    "ciu_szs": {
        "definition": "Companion Sizes",
        "explanation": "The companion sizes parameter accepts a comma-separated list of companion sizes. Pipe-separated (```|```) values indicate a multi-size slot.\n\nUsage examples:\n```ciu_szs=728x90,300x250```\nMulti-size slot: ```ciu_szs=728x90,300x200|300x250```"
    },

    // ----------------------------------------------------------------------
    // Connected TV / device / app identity
    // ----------------------------------------------------------------------
    "msid": {
        "definition": "App ID",
        "explanation": "The app ID and app name parameters apply to requests from mobile app and connected TV devices; most programmatic video ads require them.\n\nThe IMA SDK populates both automatically, but they must be set manually in non-SDK environments (direct VAST, PAL, PAI). On iOS/tvOS the SDK cannot access the app ID, so ```msid``` is omitted and the bundle is sent via ```an```.\n\nUsage example:\n```msid=com.package.publisher&an=sample%20app```",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["csai", "ssai"],
            "note": "Recommended for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "an": {
        "definition": "App Name",
        "explanation": "The app ID and app name parameters apply to requests from mobile app and connected TV devices; most programmatic video ads require them.\n\nThe app name should be a human-readable name. On iOS/tvOS where the SDK cannot access the app ID, the bundle is sent via ```an```.\n\nUsage example:\n```msid=com.package.publisher&an=sample%20app```",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["csai", "ssai"],
            "note": "Recommended for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "rdid": {
        "definition": "Resettable Device ID",
        "explanation": "The resettable device identifier accepts a variable value used for user targeting from built-in apps and CTV devices. Examples: Google AdID, Apple IDFA, Amazon AFAI, Roku RIDA, Xbox MSAI.\n\nOn server-side (SSB) streams you must pass ```rdid```, ```idtype``` and ```is_lat``` explicitly, as you would on a client-side request. Nearly all programmatic video ads require these values.\n\nUsage example:\n```rdid=<device_id>&idtype=idfa&is_lat=0```",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai", "ssai"],
            "note": "Required for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home."
        }
    },
    "idtype": {
        "definition": "Device ID Type",
        "explanation": "The device ID type parameter accompanies ```rdid``` and identifies the platform's ID scheme (case sensitive):\n\n```adid``` Android\n```afai``` Amazon\n```idfa``` Apple (iOS)\n```lgudid``` LG\n```msai``` Xbox\n```rida``` Roku\n```tifa``` Samsung\n```tvos``` Apple TV (tvOS)\n```vaid``` VIDAA OS\n```vida``` Vizio",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai", "ssai"],
            "note": "Required for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home (with rdid and is_lat)."
        }
    },
    "is_lat": {
        "definition": "Limit Ad Tracking",
        "explanation": "The limit ad tracking parameter signals the user's expressed privacy preference on platform controls. It accompanies ```rdid``` and ```idtype```.\n\nPossible values:\n```is_lat=0``` Limit Ad Tracking disabled\n```is_lat=1``` Limit Ad Tracking enabled",
        "requirement": {
            "level": "programmatic",
            "appliesTo": ["csai", "ssai"],
            "note": "Required for programmatic monetization in mobile apps, connected TV, audio, and digital out-of-home (with rdid and idtype)."
        }
    },
    "sid": {
        "definition": "Session ID",
        "explanation": "The session ID parameter accepts a variable value — a privacy-preserving identifier used for frequency capping only. Supported for in-stream video from connected TVs and mobile apps; not currently supported for web. Must be in UUID format per the IAB IFA guidelines. Opt out with ```sid=0```.\n\nUsage example:\n```sid=123e4567-e89b-12d3-a456-426614174000```",
        "requirement": {
            "level": "recommended",
            "note": "Required for digital out-of-home; recommended for mobile apps, connected TV, and audio."
        }
    },
    "pvid": {
        "definition": "App Set ID",
        "explanation": "The app set ID is needed for monetization when users opt out of personalization on Android. ```pvid``` is the Android app set ID and ```pvid_s``` is its scope (```scope_app``` or ```scope_developer```).\n\nThe IMA/PAL SDK passes this automatically; non-SDK implementations must call the App Set SDK and pass it manually.\n\nUsage example:\n```pvid=[AppSetID]&pvid_s=scope_app```",
        "requirement": {
            "level": "recommended",
            "appliesTo": ["csai", "ssai"],
            "note": "Recommended for programmatic monetization in apps."
        }
    },
    "pvid_s": {
        "definition": "App Set ID Scope",
        "explanation": "The app set ID scope parameter accepts a constant value representing the scope of the app set ID: ```scope_app``` or ```scope_developer```.\n\nUsage example:\n```pvid=[AppSetID]&pvid_s=scope_app```"
    },
    "dth": {
        "definition": "Device Type Hint",
        "explanation": "The device type hint parameter accepts a constant value that helps reduce device misclassification, specifically on connected TV and set-top box environments.\n\nUsage examples:\n\nConnected TV: ```dth=5```\nSet-top box: ```dth=7```\n\nRecommended for PAL and PAI (non-SDK) implementations. Not needed for IMA SDK or DAI SDK.",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization on connected TV."
        }
    },
    "devt": {
        "definition": "Device Type",
        "explanation": "The device type parameter accepts a constant value declaring the device type of the request. Used for set-top box programmatic monetization.\n\nUsage example:\n```devt=stb```",
        "requirement": {
            "level": "conditional",
            "condition": "set-top box inventory",
            "note": "Required for set-top box programmatic monetization."
        }
    },
    "ott_placement": {
        "definition": "OTT Placement",
        "explanation": "The OTT placement parameter accepts a constant value declaring a non-standard OTT placement.\n\nUsage example:\n```ott_placement=1```",
        "requirement": {
            "level": "conditional",
            "condition": "non-standard OTT placements",
            "note": "Only required for programmatic monetization on non-standard OTT placements."
        }
    },
    "venuetype": {
        "definition": "Venue Type",
        "explanation": "The venue type parameter accepts a variable value declaring the venue type for digital out-of-home inventory, per the IAB/OpenOOH venue taxonomy.\n\nUsage example:\n```venuetype=airborne```",
        "requirement": {
            "level": "conditional",
            "condition": "digital out-of-home inventory",
            "note": "Required for programmatic monetization in digital out-of-home."
        }
    },
    "ct_ch": {
        "definition": "Content Channel",
        "explanation": "The content channel parameter accepts a variable value describing the channel of connected TV content, used to improve programmatic monetization.",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },
    "ct_ne": {
        "definition": "Content Network",
        "explanation": "The content network parameter accepts a variable value describing the network of connected TV content, used to improve programmatic monetization.",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },
    "ct_se": {
        "definition": "Content Series",
        "explanation": "The content series parameter accepts a variable value describing the series of connected TV content, used to improve programmatic monetization.",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },
    "ct_ti": {
        "definition": "Content Title",
        "explanation": "The content title parameter accepts a variable value describing the title of connected TV content, used to improve programmatic monetization.",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization in connected TV."
        }
    },

    // ----------------------------------------------------------------------
    // Continuous play / measurement
    // ----------------------------------------------------------------------
    "aconp": {
        "definition": "Audio Continuous Play",
        "explanation": "*Recommended per MRC Audio Measurement Guidelines*\n\nThe audio continuous play parameter accepts a constant value indicating whether the player intends to continuously play audio content. Leave unset if unknown.\n\nUsage examples:\n\nContinuous play ON: ```aconp=2```\nContinuous play OFF: ```aconp=1```",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "vconp": {
        "definition": "Video Continuous Play",
        "explanation": "*Recommended per MRC Video Measurement Guidelines*\n\nThe video continuous play parameter accepts a constant value indicating whether the player intends to continuously play video content, similar to a TV broadcast. Leave unset if unknown.\n\nUsage examples:\n\nContinuous play ON: ```vconp=2```\nContinuous play OFF: ```vconp=1```",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "vpos": {
        "definition": "Video Position",
        "explanation": "The video position parameter accepts a constant value indicating whether the ad request is from a pre-roll, mid-roll or post-roll.\n\nUsage examples:\n\nPre-roll: ```vpos=preroll```\nMid-roll: ```vpos=midroll```\nPost-roll: ```vpos=postroll```",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "omid_p": {
        "definition": "OMID Partner Name",
        "explanation": "The OMID partner name parameter accepts a variable value indicating the partner integrating Open Measurement (OM SDK) and its version. Applicable to publishers wanting Active View measurement via OM SDK — not needed with the IMA SDK (set automatically).\n\nWith PAL, use the ```omidPartnerName``` / ```omidPartnerVersion``` APIs instead. Without PAL or IMA, set ```omid_p``` and ```sdk_apis```.\n\nUsage example:\n```omid_p=examplepartner/1.0.0.0&sdk_apis=7```",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },
    "sdk_apis": {
        "definition": "SDK API Framework",
        "explanation": "The SDK API framework parameter accepts a comma-separated list of constant integers indicating all API frameworks the player supports. Used with PAL; if set while using the IMA SDK, the values are overridden.\n\nUsage example:\n```sdk_apis=2,7,9```"
    },
    "wta": {
        "definition": "Why This Ad",
        "explanation": "The \"Why this ad?\" parameter accepts a constant value indicating the player's support for rendering ad badging. Defaults to ```wta=1``` when omitted. Supported automatically by the IMA SDK; without it, players must implement VAST Icon and IconClickFallbackImage support.\n\nSend ```wta=0``` if you will NOT render the AdChoices icon. For EEA traffic, ```wta=0``` requests are not eligible for reservation creatives where Google badging is enabled.\n\nUsage examples:\n\nSupported: ```wta=1``` (or omit)\nUnsupported: ```wta=0```",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization; required for Ad Exchange and for EEA web/app traffic."
        }
    },
    "hl": {
        "definition": "Language",
        "explanation": "The language parameter accepts a constant value used to request ads in that language and for language selection in dynamic allocation. Any ISO 639-1 (two-letter) or ISO 639-2 (three-letter) code is valid. If omitted, defaults to any language with ad targeting by language.\n\nUsage example:\n```hl=it```",
        "requirement": {
            "level": "recommended",
            "note": "Recommended for programmatic monetization."
        }
    },

    // ----------------------------------------------------------------------
    // Privacy & consent
    // ----------------------------------------------------------------------
    "npa": {
        "definition": "Non-Personalized Ads",
        "explanation": "The non-personalized ads parameter accepts a constant value indicating the request should be treated as non-personalized. Set ```npa=1``` (or include ```npa``` with no value) to tag the request as non-personalized. Missing or ```npa=0``` defaults to personalized.\n\nUsage example:\n```npa=1```",
        "requirement": {
            "level": "conditional",
            "condition": "the user disables personalization",
            "note": "Only required if the user disables personalization."
        }
    },
    "rdp": {
        "definition": "Restrict Data Processing",
        "explanation": "The restrict data processing parameter accepts a constant value indicating the request should restrict data processing. Set ```rdp=1``` (or include ```rdp``` with no value). Missing or ```rdp=0``` will not restrict, unless the network-level Restrict Data Processing setting is enabled.\n\nUsage example:\n```rdp=1```"
    },
    "ppt": {
        "definition": "Publisher Privacy Treatment",
        "explanation": "The Publisher Privacy Treatment parameter accepts a constant value indicating whether to turn off ads personalization for the request.\n\nUsage example:\n\nTurn off ads personalization: ```ppt=1```"
    },
    "ltd": {
        "definition": "Limited Ads",
        "explanation": "The limited ads parameter accepts a constant value indicating whether to serve ads in a limited way in the absence of consent for cookies or other local identifiers.\n\nUsage example:\n```ltd=1```"
    },
    "tfcd": {
        "definition": "Tag For Child-Directed",
        "explanation": "The child-directed parameter accepts a constant value tagging the ad request for child-directed treatment.\n\nUsage example:\n```tfcd=1```"
    },
    "gdpr": {
        "definition": "GDPR",
        "explanation": "The GDPR parameter accepts a constant value for publishers integrating with IAB TCF v2.0. Direct VAST requests don't read the values automatically but accept them when added.\n\nOnly ```0``` and ```1``` are valid: 0 means GDPR does not apply, 1 means it applies. If GDPR applies, you must also provide a valid TC string via ```gdpr_consent```.\n\nUsage examples:\n\nGDPR applies: ```gdpr=1```\nGDPR does not apply: ```gdpr=0```"
    },
    "gdpr_consent": {
        "definition": "GDPR Consent",
        "explanation": "The GDPR consent parameter accepts a variable value (an IAB TCF v2.0 TC string) for publishers integrating with IAB TCF v2.0. Direct VAST requests don't read it automatically but accept it when added.\n\nUsage example:\n```gdpr_consent=<TC_string>```"
    },
    "addtl_consent": {
        "definition": "Additional Consent",
        "explanation": "The additional consent parameter accepts a variable value for publishers integrating with IAB TCF v2.0 who use a vendor not yet on the IAB Europe Global Vendor List but on Google's Ad Tech Providers (ATP) list.\n\nUsage example:\n```addtl_consent=1~1.35.41.101```"
    },
    "us_privacy": {
        "definition": "US Privacy (CCPA)",
        "explanation": "The US privacy parameter accepts a variable value carrying the IAB US Privacy (CCPA) string.\n\nUsage example:\n```us_privacy=1YNN```"
    },
    "ipd": {
        "definition": "Inventory Partner Domain",
        "explanation": "The inventory partner domain parameter accepts a variable value set to the ```inventorypartnerdomain``` declarations in the publisher's app-ads.txt (or ads.txt). It helps designate an inventory sharing partner's domain for ads.txt/app-ads.txt validation, important in inventory sharing use cases.\n\nUsage example:\n```ipd=partner.example```",
        "requirement": {
            "level": "conditional",
            "condition": "monetizing inventory you do not own (inventory sharing)",
            "note": "Required for publishers monetizing inventory they do not own."
        }
    },
    "ppid": {
        "definition": "Publisher Provided Identifier",
        "explanation": "The publisher provided identifier (PPID) parameter accepts a variable value used for frequency capping, audience segmentation and targeting, sequential ad rotation, and other audience-based delivery controls across devices.\n\nUsage example:\n```ppid=12JD92JD8078S8J29SDOAKC0EF230337```"
    },
    "ppsj": {
        "definition": "Publisher Provided Signals (JSON)",
        "explanation": "The publisher provided signals JSON parameter accepts a base64-encoded JSON object containing audience and contextual data provided by the publisher to improve programmatic monetization.\n\nDecoded JSON example:\n```{\"PublisherProvidedTaxonomySignals\":[{\"taxonomy\":\"IAB_AUDIENCE_1_1\",\"values\":[\"6\",\"284\"]}]}```\n\nThe value on the tag is the base64 encoding of that JSON."
    },

    // ----------------------------------------------------------------------
    // Price floors, creative profile, testing
    // ----------------------------------------------------------------------
    "pp": {
        "definition": "Creative Profile",
        "explanation": "The creative profile parameter accepts a variable value controlling which creatives are eligible to serve, based on a configured video/audio creative profile.\n\nUsage example:\n```pp=creative_profile```",
        "requirement": {
            "level": "conditional",
            "condition": "restricting media files with a creative profile",
            "note": "Required to restrict media files for hosted creatives with creative profiles."
        }
    },
    "pubf": {
        "definition": "Public Price Floor",
        "explanation": "The ```pubf``` parameter is the equivalent of ```google_ad_public_floor``` and is used to add a public price floor to Ad Exchange tags.\n\nUsage example:\n```pubf=123```"
    },
    "pvtf": {
        "definition": "Private Price Floor",
        "explanation": "The ```pvtf``` parameter is the equivalent of ```google_ad_private_floor``` and is used to add a private price floor to Ad Exchange tags.\n\nUsage example:\n```pvtf=123```"
    },
    "trt": {
        "definition": "Traffic Type",
        "explanation": "The traffic type parameter accepts a constant value requesting either purchased or organic traffic. The IMA SDK does not set a default; when missing, the server defaults to 0 (undefined traffic).\n\nUsage examples:\n\nPurchased traffic: ```trt=1```\nOrganic traffic: ```trt=2```"
    },
    "adtest": {
        "definition": "Ad Test",
        "explanation": "The ad test parameter accepts a constant value that requests test ads without impacting reporting or revenue. Never use ```adtest=on``` in production.\n\nUsage example:\n```adtest=on```"
    }
};

// Make the catalogue available to Node for the test harness while remaining a
// plain browser global when loaded via <script>.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { adTagParameters };
}

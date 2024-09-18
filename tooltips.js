const parameterTooltips = {
        "givn": {
           "definition": "PAL SDK nonce",
           "explination": "The ```givn``` parameter in the Google PAL SDK refers to the Google Identifier for Video Navigation. This parameter is used to identify a unique video session, which helps in tracking and managing ads across multiple ad breaks within the same video session.\n\nUsage example:\n```givn={{url.givn}}``` - VOD SSAI\n\n```givn={{givn}}``` - Live SSAI\n\n*For SSAI only does not apply to CSAI*"
        },
        "aconp": {
           "definition": "Audio Continuous Play",
           "explination": "*Recommended per MRC Audio Measurement Guidelines*\n\nThe audio continuous play parameter accepts a constant value that indicates \nwhether the player intends to continuously play audio content.\n\nThis parameter should be left unset if it's not known.\nUsage example\n\nContinuous play ON:\naconp=2\n\nContinuous play OFF:\naconp=1"
        },
        "ad_rule": {
           "definition": "Ad Rule",
           "explination": "The ad rule parameter accepts a constant value that indicates whether to \nreturn a VAST creative or an ad rules response.\n\nThe default setting for ad rules depends on an Ad Manager network setting. \nYou can override the setting for specific ad tags using the examples below.\nUsage example\n\nRequest for VAST creative:\n```ad_rule=0```\n\nRequest for ad rules (VMAP):\n```ad_rule=1```\nRequirement:\n\n*Required for video ad rules*"
        },
        "ad_type": {
           "definition": "Ad Type",
           "explination": "The ad type parameters accept a constant value that indicates the ad types \nthat should be returned for the request.\n\nThis parameter is only required for audio ads.\nWhen ad_type is set to audio or audio_video, the vpmute parameter must be \nset to 0.\nUsage examples\n\nAllows only audio ads:\nad_type=audio\n\nAllows both skippable and non-skippable video ads:\nad_type=video\n\nAllows both audio and video ads:\nad_type=audio_video\n(This value allows both formats to compete, but only one serves.)\nThe audio_video ad type is intended to be used only for serving video \ncreatives into audio content that supports video ad playback *or* audio \ncreatives into in-stream video players for content that can be \"listenable\" \nin nature. For example, sports streams, videocasts, news, etc. \n\nRead more about audio in video content.\n\nAllows only skippable video ads:\nad_type=skippablevideo\n\nAllows only non-skippable video ads:\nad_type=standardvideo\nRequirement\n\nRequired for audio ads"
        },
        "addtl_consent": {
           "definition": "Additional Consent",
           "explination": "The Additional Consent parameter accepts variable values and is used by \npublishers who wish to integrate with the IAB TCF v2.0 and use a vendor \nthat is not yet registered with the IAB Europe Global Vendor List but are \non Google's Ad Tech Providers (ATP) list. Direct VAST requests don't \nautomatically read the values, but they're accepted when added to ad tags.\n\nYou can read more about the values passed to this parameter in the Additional \nConsent Mode technical specification.\nUsage example\n\naddtl_consent=1~1.35.41.101"
        },
        "afvsz": {
           "definition": "Non-linear Ad Sizes",
           "explination": "The non-linear ad sizes parameter accepts constant values which should be a \ncomma-separated list of non-linear ad sizes that can be displayed in the \nvideo ad slot.\n\nThese sizes must be any of the those supported:\n\n   - 200x200\n   - 250x250\n   - 300x250\n   - 336x280\n   - 450x50\n   - 468x60\n   - 480x90\n   - 729x90\n\nWhen using the IMA SDK, this field will be overwritten and populated with \nall supported sizes that fall within the nonLinearAdSlotWidth and \nnonLinearAdSlotHeight.\n\nThis parameter can be left out or empty when no non-linear sizes are \nsupported.\nUsage example\n\nAll sizes are supported:\nafvsz=200x200,250x250,300x250,336x280,\n450x50,468x60,480x90,728x90\n\nMax width is 250:\nafvsz=200x200,250x250\n\nMax height is 60:\nafvsz=450x50,468x60\n\nMax width is 100:\n//empty; no values supported\n\n \nRequirement\n\nRequired for non-linear video ads when not using the IMA SDK"
        },
        "allcues": {
           "definition": "All Cue Points",
           "explination": "This parameter accepts variable values which are a comma-separated list of \ncue points, in milliseconds. For each value, Ad Manager returns an ad break.\n\nThe vid_d and allcues parameters are used to serve mid-roll ads without \ncontent ingestion. Ad rules are also required to return mid-rolls.\n\nIf time-based cues are used in your ad rules (for example, \n\"Every N seconds\" or \"At fixed times\"), then those set in the ad rule are \nused, and the cues passed into allcues are ignored. Mid-rolls still require \nduration, so vid_d must still be passed.\nUsage example\n\nCue points at 10 and 20 seconds:\nallcues=10000,20000"
        },
        "ciu_szs": {
           "definition": "Companion Sizes",
           "explination": "The companion sizes parameter accepts variable values which are a comma-separated list of companion sizes.\n\nPipe-separated (|) values indicate a multi-size ad slot.\n\nUsage example:\n```ciu_szs=728x90,300x250```\n\nSizes with a multi-size slot:\n```ciu_szs=728x90,300x200|300x250```"
        },
        "cmsid": {
           "definition": "Content Source ID",
           "explination": "The content source ID and video ID parameters accept variable values. \n\nIn order to target ads to video content, your master video tag needs to \ninclude both of these parameters.\n\nThe cmsid is a unique number for each content source. To locate this in Ad Manager, click Video Content sources and then the name of the source.\n\nThe vid is a string or number identifying a particular video. This ID is assigned by the CMS that hosts your content. To locate this in Ad Manager, click Video Content and then the specific video content.\n\nUsage example:\n```cmsid=[value]&vid=[value]```\n\nIf you are building a tag for Dynamic Ad Insertion with video on demand, you should use the macros that will dynamically insert the correct content source and video ID.\nFor example: ```cmsid=%%CMS_ID%%&vid=%%VIDEO_ID%%```\n\nRequirement:\n*Required for video content targeting*"
        },
        "vid": {
           "definition": "Video ID",
           "explination": "The content source ID and video ID parameters accept variable values. \n\nIn order to target ads to video content, your master video tag needs to \ninclude both of these parameters.\n\nThe cmsid is a unique number for each content source. To locate this in Ad Manager, click Video Content sources and then the name of the source.\n\nThe vid is a string or number identifying a particular video. This ID is assigned by the CMS that hosts your content. To locate this in Ad Manager, click Video Content and then the specific video content.\n\nUsage example:\n```cmsid=[value]&vid=[value]```\n\nIf you are building a tag for Dynamic Ad Insertion with video on demand, you should use the macros that will dynamically insert the correct content source and video ID.\nFor example: ```cmsid=%%CMS_ID%%&vid=%%VIDEO_ID%%```\n\nRequirement:\n*Required for video content targeting*"
        },
        "correlator": {
           "definition": "Correlator",
           "explination": "The correlator parameter accepts a variable value that is shared by \nmultiple requests coming from the same page view. It's used to implement \ncompetitive exclusions, including those in cookieless environments.\n\nIf the IMA SDK is used, the correlator value is set automatically. If your player attempts to set this value, the SDK overwrites it with its own value.\n\nIf the IMA SDK is not used, ensure that you set this value to a truly \nrandom, positive, integer value that is not being reused by multiple page views.\n\nUsage example:\n```correlator=4345645667```\n\nRequirement:\n\n*Required for web and app*\n\nRecommended for Programmatic monetization"
        },
        "cust_params": {
           "definition": "Custom Key-Value Parameters",
           "explination": "The custom parameters parameter accepts variable values which are key-value \npairs that allow you to set specific targeting, such as demographics, \ncertain positions on a page, or a particular page or pages.\nUsage example\n\nSee examples of how to add key‑value pairs."
        },
        "description_url": {
           "definition": "Description URL",
           "explination": "The description URL parameter accepts a variable value that should describe \nthe video playing on the page. Outline the page with 1-3 paragraphs \ndescribing the content. For example, stitch together the description_url \npage content dynamically from predefined blocks. Learn more about providing \na distinct description URL.\n\nThe description_url value must be URL-encoded for web page video players \nand CTV/OTT devices and non-encoded for mobile in-app video players.\n\nThis parameter is not set automatically by the IMA SDK. It needs to be set \nmanually.\nUsage example\n\nURL-encoded:\n```description_url=\nhttps%3A%2F%2Fwww.sample.com%2Fgolf.html```\n\nNon-encoded:\n```description_url=\nhttps://www.sample.com/golf.html```\nRequirement:\n\n*Required for web, app, and Ad Exchange*\n\n*Recommended for Programmatic monetization*"
        },
        "dth": {
           "definition": "Device Type Hint",
           "explination": "The device type hint parameter accepts a constant value that helps reduce \ndevice misclassification, specifically on connected TV and set top box \nenvironments.\n\nDevice misclassification may result from unintended errors from the \npublisher or connected TV OEM. This parameter would be used in conjunction \nwith other signals for Google to automatically flag instances where \nconnected TV inventory may be reclassified.\nUsage example:\n\nRequest from a connected TV:\ndth=5\n\nRequest from a set top box environment:\ndth=7\nRequirement\n\nRecommended for Programmatic monetization on connected TV.\n\nThis parameter is recommended for PAL and PAI (non-SDK) implementations. It \nis not needed for IMA SDK or DAI SDK."
        },
        "env": {
           "definition": "Environment",
           "explination": "The environment parameter accepts a constant value that indicates an \nin-stream request, or that the request is specifically from a video player.\n\nPossible values are instream, which can be used for video and audio ads, or \nvp which can only be used for video ads.\n\nUsage example:\n\nVideo and/or audio:\n```env=instream```\n\nVideo only:\n```env=vp```\n\nRequirement:\n*Required for web and app*"
        },
        "excl_cat": {
           "definition": "Exclusion Category",
           "explination": "The exclusion category parameter accepts variable values and is used to \nblock any line items containing the exclusion label in question from being \neligible for a given ad request. This parameter works with cust_params.\nUsage example\n\n&cust_params=excl_cat%3Dairline_excl_label%7C"
        },
        "gdfp_req": {
           "definition": "Ad Manager Schema Indicator",
           "explination": "The Ad Manager schema indictor parameter accepts a constant value which indicates that the user is on the Ad Manager schema.\n\nUsage example:\n```gdfp_req=1```\n\nRequirement:\n*Required for web and app*"
        },
        "gdpr": {
           "definition": "GDPR",
           "explination": "The GDPR parameter accepts constant values and is used by publishers who wish to integrate with the IAB TCF v2.0. Direct VAST requests don't automatically read the values, but they're accepted when added to ad tags.\n\nOnly ```0``` and ```1``` are valid values for this parameter, where 0 means GDPR does not apply and 1 means GDPR applies. If GDPR applies, you must also provide a valid TC string using the ```gdpr_consent``` parameter.\n\nYou can read more about the values passed to this parameter in the general guidance for implementing the framework, or in the TC string section of the IAB TCF v2.0 specification.Usage example\n\nGDPR applies:\n```gdpr=1```\n\nGDPR does not apply:\n```gdpr=0```"
        },
        "gdpr_consent": {
           "definition": "GDPR Consent",
           "explination": "The GDPR Consent parameter accepts variable values and is used by publishers who wish to integrate with the IAB TCF v2.0. Direct VAST \nrequests don't automatically read the values, but they're accepted when \nadded to ad tags.\n\nYou can read more about the values passed to this parameter in the general \nguidance for implementing the framework, or in the TC string section of the IAB TCF v2.0 specification.\n\nUsage example:\n```gdpr_consent=GDPR_CONSENT_123```"
        },
        "hl": {
           "definition": "Language",
           "explination": "The language parameter accepts a constant value which is used to request ads in that language, and for language of ad selection and video ad rendering in dynamic allocation to Ad Exchange or AdSense Video.\n\nThe parameter value can be any ISO 639-1 (two-letter) or ISO 639-2 (three-letter) code. See a list of valid codes.\n\nIf omitted, the value defaults to any language with ad targeting by language in Ad Exchange.\n\nUsage example:\n``hl=it``\n\nRequirement:\n\n*Recommended for Programmatic monetization*"
        },
        "iabexcl": {
           "definition": "IAB Exclusion URL",
           "explination": "The URL parameter iabexcl accepts a comma separated list of categories. Usage example:\n```iabexcl=3,14,527`` Excludes \"Commercial Trucks,\" \"Off-Road Vehicles,\" and \n\"Rugby.\"\n\nLearn more about IAB Content Taxonomy."
        },
        "ipd": {
           "definition": "Inventory Partner Domain",
           "explination": "The inventory partner domain parameter accepts variable values which should be set to the inventorypartnerdomain declarations in the publisher's app-ads.txt (or ads.txt) file. \n\nThe inventory partner domain parameter is an IAB specification that helps publishers designate a domain of an inventory sharing partner for purposes of ads.txt/app-ads.txt validation.\n\nIPD declaration is especially important in inventory sharing use cases where the ad inventory in which a request originates from may be owned by another partner (the inventory sharing partner).\n\nLearn more about ads.txt/app-ads.txt and inventory sharing partners."
        },
        "ipe": {
           "definition": "Impression pinging entity",
           "explination": "The impression pinging entity parameter accepts a constant value which is used to indicate impression pings and conversions that originate from the \nserver, not the client.\n\nUsage example:\n\nServer-side beaconing (SSB): ```ipe=ssb```"
        },
        "iu": {
           "definition": "Ad Unit",
           "explination": "The ad unit parameter accepts a variable value which should be set to the current ad unit, in the format: ```/network_code/.../ad_unit```\n\nUsage example:\n```iu=/6062/videodemo```\n\nRequirement:\n*Required for web and app*"
        },
        "lip": {
           "definition": "Last Position in Pod",
           "explination": "The last position in pod parameter accepts a constant value to indicate a request from the last position in a pod.\n\nThis parameter is for standard pods only.\n\nUsage example: ```lip=true```"
        },
        "ltd": {
           "definition": "Limited Ads",
           "explination": "The limited ads parameter accepts a constant value which indicates whether to serve ads in a limited way in the absence of consent for the use of cookies or other local identifiers.\n\nUsage example: ```ltd=1```"
        },
        "min_ad_duration": {
           "definition": "Ad Minimum Duration",
           "explination": "The ad duration parameters accept variable values that, taken together, specify the duration range an ad must match in milliseconds.\n\nUse this parameter to limit individual ad duration for single ad and optimized pod requests.\n\nUsage example\n```min_ad_duration=15000&max_ad_duration=30000```"
        },
        "max_ad_duration": {
           "definition": "Ad Maximum Duration",
           "explination": "The ad duration parameters accept variable values that, taken together, specify the duration range an ad must match in milliseconds.\n\nUse this parameter to limit individual ad duration for single ad and optimized pod requests.\n\nUsage example:\n```min_ad_duration=15000&max_ad_duration=30000```"
        },
        "mridx": {
           "definition": "Mid-Roll Number",
           "explination": "The mid-roll number parameter accepts a variable value which indicates the ordinal number of the mid-roll (for example, mid-roll 1, mid-roll 2, etc.).\n\nUsage example: ```mridx=2```"
        },
        "msid": {
           "definition": "App ID",
           "explination": "The app ID and app name parameters accept variable values which should be \napplied to requests sent from mobile app and connected TV devices, as most \nprogrammatic video ads require them.\n\nThe IMA SDK will automatically populate both parameters, but they must be \nmanually specified in non-SDK environments, including direct VAST calls, or \nwhen using Programmatic Access Library (PAL) or Publisher Authenticated \nInventory (PAI).\n\nWhile the app name should be a human-readable name, on iOS and tvOS, it's \nnot possible for the SDK to access the app ID. In these cases, the msid \nparameter is not sent, and the SDK sends the app bundle via the an \nparameter.\nUsage example\n\n```msid=com.package.publisher&an=sample%20app```\n\nApp IDs are named and formatted differently across different app stores. \nSee the IAB guidelines for app identification, or examples of common unique \nidentifiers.\n\nFor platforms where an app store does not exist, the IAB recommends \npublishers use the following format for store IDs: \n```com.publisher.deviceplatform```\nRequirement\n\n*Both parameters are required for app*\n\nRecommended for Programmatic monetization"
        },
        "an": {
           "definition": "App Name",
           "explination": "The app ID and app name parameters accept variable values which should be \napplied to requests sent from mobile app and connected TV devices, as most \nprogrammatic video ads require them.\n\nThe IMA SDK will automatically populate both parameters, but they must be \nmanually specified in non-SDK environments, including direct VAST calls, or \nwhen using Programmatic Access Library (PAL) or Publisher Authenticated \nInventory (PAI).\n\nWhile the app name should be a human-readable name, on iOS and tvOS, it's \nnot possible for the SDK to access the app ID. In these cases, the msid \nparameter is not sent, and the SDK sends the app bundle via the an \nparameter.\nUsage example\n\n```msid=com.package.publisher&an=sample%20app```\n\nApp IDs are named and formatted differently across different app stores. \nSee the IAB guidelines for app identification, or examples of common unique \nidentifiers.\n\nFor platforms where an app store does not exist, the IAB recommends \npublishers use the following format for store IDs: \n```com.publisher.deviceplatform```\n*Requirement\n\nBoth parameters are required for app*\n\nRecommended for Programmatic monetization"
        },
        "nofb": {
           "definition": "Fallback Disabled",
           "explination": "The fallback disabled parameter accepts a constant value to indicate that the ad request should not return a playlist of video fallback ads.\n\nUsage example:\n\nFallback disabled: ```nofb=1```"
        },
        "npa": {
           "definition": "Non Personalized Ad",
           "explination": "The non-personalized ads parameter accepts a constant value to indicate that the ad request should be treated as non-personalized.\n\nYou must either specifically set npa=1 or include simply npa (without a set \nvalue) to tag the request as non-personalized. Ad requests either missing \nthis parameter, or set to ```npa=0```, default to personalized ads.\n\nUsage example:\n\nNon-personalized ads:\n```npa=1```"
        },
        "omid_p": {
           "definition": "OMID Partner Name",
           "explination": "The OMID partner name parameter accepts a variable value which indicates \nthe name of the partner integrating OMID measurement, and the partner \nversion.\n\nThis parameter is only applicable to publishers wanting Active View \nmeasurement when using the Open Measurement SDK (OM SDK). This should not \nbe used when using the IMA SDK as it is set automatically.\n\nTo indicate OMID support when using Programmatic Access Library (PAL), you \nneed to use the omidPartnerName and omidPartnerVersion APIs to set the \npartner name and version. When you're not using either PAL or IMA, you must \nset the omid_p and sdk_apis parameters (the supported APIs, which could \nalso include other comma separated APIs).\nUsage example\n\nWhen using PAL:\nrequest.omidPartnerName = 'examplepartnername'\nrequest.omidPartnerVersion = '1.0.0.0'\n\nWhen not using PAL:\nomid_p=examplepartnername/1.0.0.0&sdk_apis=7"
        },
        "output": {
           "definition": "Ad Output Format",
           "explination": "The ad output format parameter accepts a constant value which should be set \nto the output format of ad.\n\nUse ```output=vast``` for the default VAST version set for your network.\nFor specific ad tags or parts of your site, you can request specific VAST or \nVMAP versions.\n\nFor VAST, if your video player uses the IMA SDK, the output parameter for a \nvideo ad request will always be set to ```output=xml_vast4```.\n\nThis poses no reliability risk as the SDK is backwards compatible with all VAST versions \nthat any third-party ad server may serve.\n\nUse ```output=vmap``` to return the default VMAP version you have activated for \nyour network (for example, VMAP 1). If you return VAST inside of VMAP, you \ncan use ```xml_vmap1_vast3``` or ```xml_vmap1_vast4``` to specify the VAST version to return.\nUsage example\n\nYour network's default VAST setting: ```output=vast```\n\nVAST 4:\n```output=xml_vast4```\n\nYour network's default VMAP setting:\n```output=vmap```\n\nVMAP 1:\n```output=xml_vmap1```\n\nVMAP 1, returning VAST 4:\n```output=xml_vmap1_vast4```\n\nRequirement:\n*Required for web and app*"
        },
        "plcmt": {
           "definition": "Placement",
           "explination": "The placement parameter accepts a constant value which is used to indicate \nwhether or not the in-stream inventory is declared as *in-stream* or \n*accompanying* per the guidance in the IAB specifications.\n\nFor non-in-stream requests, this field is populated for buyers \nautomatically based on the declared inventory format, and will override any \nin-stream or accompanying content declaration.\nUsage example\n\nIn-stream request:\n```plcmt=1```\n\nAccompanying content request:\n```plcmt=2```\nRequirement\n\n*Required for web and Programmatic monetization*"
        },
        "pmad": {
           "definition": "Pod Maximum Ads",
           "explination": "The pod ad maximum parameter accepts a variable value which indicates the \nmaximum number of ads in a pod.\n\nThis parameter is specific to optimized pods, which are available to \npublishers with an advanced video package. It should not be used for VMAP \n(when ad_rule=1).\nUsage example\n\n```pmad=4```"
        },
        "pmnd": {
           "definition": "Pod Min Duration",
           "explination": "The pod duration parameters accept variable values which, taken together, \nspecify the duration range that a pod must match, in milliseconds.\n\nThese parameters are used to request multiple ads. They're specific to \noptimized pods, which are available to publishers with an advanced video \npackage. They should not be used for VMAP (when ad_rule=1).\n\nUsage example:\n```pmnd=0&pmxd=60000```"
        },
        "pmxd": {
           "definition": "Pod Max Duration",
           "explination": "The pod duration parameters accept variable values which, taken together, \nspecify the duration range that a pod must match, in milliseconds.\n\nThese parameters are used to request multiple ads. They're specific to \noptimized pods, which are available to publishers with an advanced video \npackage. They should not be used for VMAP (when ad_rule=1).\n\nUsage example:\n\```pmnd=0&pmxd=60000```"
        },
        "pod": {
           "definition": "Pod Number",
           "explination": "The pod number parameter accepts a variable value which represents the \nordinal number of the pod in a video (for example, pod 1, pod 2, etc.).\n\nUsage example: ```pod=3```\n\nRequirement:\n\n*Required for competitive exclusions, frequency capping, and related features to work correctly.*"
        },
        "pp": {
           "definition": "Creative Profile",
           "explination": "The creative profile parameter accepts a variable value which controls the \ncreatives eligible to serve based on the configuration set up in a video \nand audio creative profile.\nUsage example\n\n```pp=creative_profile```\nRequirement\n\n*Recommended for Programmatic monetization*"
        },
        "ppt": {
           "definition": "Publisher Privacy Treatment",
           "explination": "The Publisher Privacy Treatment parameter accepts a constant value which is \nused to indicate whether to turn off ads personalization for the ad request.\n\nLearn more about Publisher Privacy Treatment.\nUsage example\n\nTurn off ads personalization:\n```ppt=1```"
        },
        "ppid": {
           "definition": "Publisher Provided Identifier",
           "explination": "The Publisher provided identifier (PPID) parameter accepts a variable value \nof the identifier is used in frequency capping, audience segmentation and \ntargeting, sequential ad rotation, and other audience-based ad delivery \ncontrols across devices.\nUsage example\n\n```ppid=12JD92JD8078S8J29SDOAKC0EF230337```"
        },
        "ppos": {
           "definition": "Position in Pod",
           "explination": "The position in pod parameter accepts a variable value which represents \nthe position within a pod (for example, position 1, position 2, etc.).\n\nThis parameter is for standard pods only and is necessary for companion \nautofill.\nUsage example\n\n```ppos=2```\nRequirement\n\n*Required for competitive exclusions, frequency capping, and related \nfeatures to work correctly.*"
        },
        "ppsj": {
           "definition": "Publisher Provided Signals JSON",
           "explination": "The publisher provided signals JSON parameter accepts a base64-encoded JSON \nobject containing audience and contextual data provided by the publisher to \nimprove programmatic monetization.\n\nLearn more about publisher provided signals and supported taxonomies.\n\nSee details of valid JSON key-value pairs in the \nHTML5 IMA SDK sample.\nUsage example\n```\nJSON object:\n{\n  \"PublisherProvidedTaxonomySignals\": [{\n     \"taxonomy\": \"IAB_AUDIENCE_1_1\",\n     \"values\": [\"6\", \"284\"]\n  }]\n}\n```\nBase64 encoded value:\n```eyJQdWJsaXNoZXJQcm92aWRlZFRheG9ub215U2lnbmFscyI6W3s\nidGF4b25vbXkiOiJJQUJfQVVESUVOQ0VfMV8xIiwidmFsdWVzIj\npbIjEiLCIyODQiXX1dfQ```"
        },
        "ptpl": {
           "definition": "Ad Break Template ID",
           "explination": "The ad break template ID and name accept variable values and indicate which \nad break template should apply to the optimized pod request. Ad break \ntemplates allow you to configure which ad spots or custom ad spots, should \nbe included in an ad break, and in which order they should serve.\n\nOnly one of the 2 parameters (name or ID) are required to request an ad \nbreak template.\nUsage example More details on setting up and requesting ad break templates \ncan be found here."
        },
        "ptpln": {
           "definition": "Ad Break Template Name",
           "explination": "The ad break template ID and name accept variable values and indicate which \nad break template should apply to the optimized pod request. Ad break \ntemplates allow you to configure which ad spots or custom ad spots, should \nbe included in an ad break, and in which order they should serve.\n\nOnly one of the 2 parameters (name or ID) are required to request an ad \nbreak template.\nUsage example More details on setting up and requesting ad break templates \ncan be found here."
        },
        "pubf": {
           "definition": "Public Price Floors in AdX Tags",
           "explination": "pubf is the equivalent of google_ad_public_floor, and pvtf is the \nequivalent of google_ad_private_floor. These are used to add price floors \nto Ad Exchange tags.\nUsage example\n\n```pubf=123```"
        },
        "pvtf": {
           "definition": "Private Price Floors in AdX Tags",
           "explination": "pubf is the equivalent of google_ad_public_floor, and pvtf is the \nequivalent of google_ad_private_floor. These are used to add price floors \nto Ad Exchange tags.\nUsage example\n\n```pvtf=123```"
        },
        "pvid": {
           "definition": "App Set ID",
           "explination": "The app set ID values are needed for monetization when users opt out of \npersonalization on Android devices.\n\nThe pvid parameter accepts a variable value which is set to the Android app \nset ID, and the pvid_s parameter accepts a constant value that represents \nthe scope of the app set ID (either scope_app or scope_developer).\n\nWhile the IMA/PAL SDK automatically passes this field, publishers with \nnon-SDK implementations must call the app set SDK and pass these parameters \nmanually on ad request.\n\nSee the Android documentation on how to retrieve the app set ID.\nUsage example\n\n```pvid=[AppSetID_value]```\n```pvid_s=scope_app```\n\nRequirement: Required for app\n\n*Recommended for Programmatic monetization*"
        },
        "pvid_s": {
           "definition": "App Set Scope",
           "explination": "The app set ID values are needed for monetization when users opt out of \npersonalization on Android devices.\n\nThe pvid parameter accepts a variable value which is set to the Android app \nset ID, and the pvid_s parameter accepts a constant value that represents \nthe scope of the app set ID (either scope_app or scope_developer).\n\nWhile the IMA/PAL SDK automatically passes this field, publishers with \nnon-SDK implementations must call the app set SDK and pass these parameters \nmanually on ad request.\n\nSee the Android documentation on how to retrieve the app set ID.\nUsage example\n\n```pvid=[AppSetID_value]```\n```pvid_s=scope_app```\n\nRequirement: Required for app\n\n*Recommended for Programmatic monetization*"
        },
        "rdid": {
           "definition": "Resettable Device Identifier",
           "explination": "The resettable device identifiers accept variable values.\n\nWith built-in applications (not on web or mobile web), the SDK passes \nresettable device identifiers for user targeting into your stream requests \nwith the parameters for rdid, idtype, and is_lat. On SSB streams, you must \npass these as explicit parameters, just as you would on a client-side ad \nrequest. Learn more about device identifiers.\n\nNearly all programmatic video ads require the presence of these values.\n\t\nA resettable device identifier that can be updated by the user at any time.\n\nFor example, a Google AdID, an Apple IDFA, an Amazon AFAI, a Roku RIDA, or an Xbox MSAI.\n\nRequired for app\n\nRecommended for Programmatic monetization"
        },
        "idtype": {
           "definition": "Resettable Device Identifier",
           "explination": "Type: string\n\nPossible values:\n\nPass the following for each device where this is supported (values are case sensitive):\n\n```adid: Android```\n```afai: Amazon```\n```idfa: Apple phones (iOS)```\n```lgudid: LG```\n```msai: Xbox```\n```rida: Roku```\n```tifa: Samsung```\n```tvOS: AppleTV (tvOS)```\n```vaid: VIDAA OS```\n```vida: Vizio```"
        },
        "is_lat": {
           "definition": "Resettable Device Identifier",
           "explination": "A signal to indicate users’ expressed privacy preferences on platform controls according to that platform’s policies.\nIt is a requirement of Google and Google Marketing Platform policies to ensure that user choices are accurately adhered to when data is passed on ad requests.\n\nType: boolean\n\nPossible values:\n\nPass one of the following values from the platform:\n\n```0```: Platform indicates Limit Ad Tracking is disabled\n```1```: Platform indicates Limit Ad Tracking is enabled"
        },
        "rdp": {
           "definition": "Restrict Data Processing",
           "explination": "The restrict data processing parameter accepts a constant value to indicate \nthat the ad request should restrict data processing.\n\nYou must either specifically set rdp=1 or include simply rdp (without a set \nvalue) to restrict data processing. Ad requests either missing this \nparameter, or set to rdp=0, will not restrict, unless the Restrict Data \nProcessing network setting is enabled.\nUsage example\n\n```rdp=1```"
        },
        "scor": {
           "definition": "Stream Correlator",
           "explination": "The stream correlator parameter accepts a variable value which should be an \ninteger generated for each video stream. The number should be the same \nwithin a stream and unique within a page view. It's used for competitive \nexclusions, frequency capping, and related features if a user is watching \nmultiple videos on the same page.\nUsage example\n\n```scor=17```\nRequirement\n\nRequired for competitive exclusions, frequency capping, and related \nfeatures to work correctly."
        },
        "sdk_apis": {
           "definition": "SDK API Framework",
           "explination": "The SDK API framework parameter accepts a comma-separated list of constant \ninteger values which indicate all of the API frameworks that the player \nsupports.\n\nSee a list of possible API Framework values.\n\nThis parameter is used by publishers that use the Programmatic Access \nLibrary (PAL). If you attempt to set values to this parameter while using \nthe IMA SDK, the values will be overridden with the values supported by the \nIMA SDK.\nUsage example\n\n```sdk_apis=2,7,9```"
        },
        "sdmax": {
           "definition": "Skippable Max Ad Duration",
           "explination": "The sdmax (skippable max ad duration) ad request parameter accepts a \nvariable value that allows publishers to specify their desired max ad \nduration for the skippable ads.\n\nIt takes a duration in milliseconds that represents the upper bound that \nshould be allowed for the duration of skippable video/audio creatives for \nthat particular ad request.\n\nUse sdmax independently for skippable ads, or in combination with the \nexisting max_ad_duration parameter to provide different max durations for \nskippable and non-skippable ads.\nUsage example\n\nUsing the following settings:\n\n```max_ad_duration = 15000``` (15 seconds)\n```sdmax = 45000``` (45 seconds)\n\nFor the following creatives:\n\n   - *Creative A*: non-skippable; 30s\n   - *Creative B*: skippable; 30s\n\nResults in:\n\n   - *Creative A* will be filtered because it's non-skippable and its \n   duration exceeds the (non-skippable) max.\n   - *Creative B* will not be filtered because, while its duration exceeds \n   max_ad_duration, it's skippable, and its duration does not exceed the \n   skippable max."
        },
        "sid": {
           "definition": "Session ID",
           "explination": "The session ID parameter accepts a variable value which is a \nprivacy-preserving advertising identifier that is used for frequency \ncapping purposes only.\n\nSession ID is supported for in-stream video requests from connected TVs and \non in-stream video inventory from mobile app devices. It is not currently \nsupported for web.\n\nPer the IAB's IFA guidelines, this parameter must be populated in UUID \nformat. Learn more about resettable device identifiers for user targeting.\n\nYou can opt out of passing the session ID by setting ```sid=0```.\nUsage example\n\n```123e4567-e89b-12d3-a456-426614174000```\nRequirement\n\n*Recommended for Programmatic monetization*"
        },
        "ssss": {
           "definition": "Server-side Stitching Source",
           "explination": "The server-side stitching source parameter accepts a constant value which \nshould be set to a recognized, Google-supplied value for your video \nstitching technology vendor.\n\nVideo stitching technology vendors using server-to-server integrations with \nGoogle are given this value from Google and are able to provide it to you. \nYou can reach out to your Google account manager with any questions about \nthe value to set to this parameter.\nUsage example\n\n```ssss=brightcove```\nRequirement\n\n*Required for server-side implementations*"
        },
        "sz": {
           "definition": "Size",
           "explination": "The size parameter accepts a variable value which should be set to the size of master video ad slot.\n\nMultiple sizes should be separated by the pipe (|) character.\n\nDo not include ```\"v\"``` after the size.\n\nUsage example:\n```sz=400x300```\n\nRequirement:\n*Required for web and app*\n\nThis parameter is optional if only requesting ```ad_type=audio```."
        },
        "tfcd": {
           "definition": "Tag for child-directed",
           "explination": "The child-directed parameter accepts a constant value which tags the ad \nrequest for child-directed treatment.\nUsage example\n\n```tfcd=1```"
        },
        "trt": {
           "definition": "Traffic Type",
           "explination": "The traffic type parameter accepts a constant value that functions to \nrequest either purchased or organic traffic.\n\nThe IMA SDK does not populate a default value if the traffic type parameter \nis missing from a request. In these instances, the server supplies a \ndefault value of 0 (undefined traffic).\nUsage example\n\nRequest for purchased traffic:\n```trt=1```\n\nRequest for organic traffic:\n```trt=2```"
        },
        "unviewed_position_start": {
           "definition": "Delayed Impressions",
           "explination": "The delayed impressions parameter accepts a constant value to \nindicate delayed impressions for video.\n\nUsage example:\n```unviewed_position_start=1```\n\nRequirement:\n*Required for web and app*"
        },
        "url": {
           "definition": "URL",
           "explination": "The URL parameter accepts a variable value which should be set to the full \nURL from which the request is sent. This value is needed to help buyers \nidentify and understand the context of where this request is coming from. \nTo the extent possible, this value should be dynamically populated on the \nad request. \n\nOn a web page, this is the URL of the page that displays the video player. \nIf you use the IMA SDK, the URL value is set automatically. If your player \nsets this value, the IMA SDK will respect the value being set.\n\nIn an app (mobile or CTV), this value should be set to a URL that most \naccurately represents the video or audio inventory being monetized. For \ninstance, if the user is watching a video within a mobile app that is also \navailable on a desktop equivalent URL.*\n\nThe value of this parameter should be encoded.*\nUsage example\n\n```url=https%3A%2F%2Fwww.videoad.com%2Fgolf.html```\n\nFor apps, if it is not possible to set this parameter to a variable URL \nvalue, it's recommended that it be set with the following pattern:\n```url=https%3A%2F%2F.adsenseformobileapps.com```\nRequirement\n\n*Required for web and app*\n\n*Recommended for Programmatic monetization*"
        },
        "vad_type": {
           "definition": "Video Ad Type",
           "explination": "The video ad type parameter accept a constant value which indicates whether \na linear or non-linear ad should be returned.\nUsage example\n\nReturn a linear ad:\n```vad_type=linear```\n\nReturn a non-linear ad:\n```vad_type=nonlinear```"
        },
        "vid_d": {
           "definition": "Video Duration",
           "explination": "This parameter accepts a variable value which specifies the duration of the \ncontent, in seconds. \n\nThe vid_d and allcues parameters are used to serve mid-roll ads without \ncontent ingestion. Ad rules are also required to return mid-rolls.\nUsage example\n\nVideo content duration of 90000 seconds (25 hours):\n```vid_d=90000```"
        },
        "vconp": {
           "definition": "Video Continuous Play",
           "explination": "*Recommended per MRC Video Measurement Guidelines*\n\nThe continuous video parameter accepts a constant value which indicates \nwhether the player intends to continuously play video content, similar to a \nTV broadcast.\n\nThis parameter should be left unset if it is unknown.\nUsage example\n\nContinuous play ON:\n```vconp=2```\n\nContinuous play OFF:\n```vconp=1```"
        },
        "vpa": {
           "definition": "Video Play Automatic",
           "explination": "*Recommended per MRC Video Measurement Guidelines*\n\nThe video play automatic parameter accepts a constant value which indicates \nwhether video content in an ad starts through autoplay or click.\n\nPossible values are click if the page waits for a user action or auto if \nthe video plays automatically.\n\nThis parameter should be left unset if it is unknown.\nUsage example\n\nAutoplay:\n```vpa=auto```\n\nClick to play:\n```vpa=click```\nRequirement\n\n*Recommended for Programmatic monetization*"
        },
        "vpi": {
           "definition": "Video playlist inred",
           "explination": "The video playlist inred parameter accepts a constant value which indicates \nwhether to serve inline VMAP (return VAST inside of VMAP).\n\nThis parameter can be used to reduce latency, and guarantee frequency caps \nand competitive exclusions across a video stream.\nUsage example\n\nReturn VAST:\n```vpi=1```\n\nReturn redirects:\n```vpi=0```"
        },
        "vpmute": {
           "definition": "Video Play Mute",
           "explination": "*Recommended per MRC Video Measurement Guidelines*\n\nThe muted video parameter accepts a constant value which indicates whether \nthe ad playback starts while the video player is muted.\nUsage example\n\nMuted:\n```vpmute=1```\n\nUnmuted:\n```vpmute=0```\nRequirement\n\n*Required for web and Programmatic monetization*"
        },
        "vpos": {
           "definition": "Video Position",
           "explination": "The video position parameter accepts a constant value which indicates \nwhether the ad request is being sent from pre-roll, mid-roll or post-roll.\nUsage example\n\nPre-roll:\n```vpos=preroll```\n\nMid-roll:\n```vpos=midroll```\n\nPost-roll:\n```vpos=postroll```\n\nRequirement\n\n*Recommended for Programmatic monetization*"
        },
        "wta": {
           "definition": "Why This Ad",
           "explination": "The \"Why this ad?\" parameter accepts a constant value which indicates the \nvideo player's support for rendering ad badging. When no &wta parameter is \nsent, this defaults to ```&wta=1```.\n\nThe ad badging functionality is supported automatically when using the IMA SDK.\nWhen the IMA SDK is not used, video players must implement VAST Icon and IconClickFallbackImage support, as documented in the IAB VAST standard.\n\nPublishers are required to send ```&wta=0``` if the publisher will not render the \nAdChoices icon, as provided in the VAST response. An ad request with &wta=1 \nor no &wta parameter is understood to indicate that the publisher will \nrender the provided AdChoices information.\n\nAudio ad requests may send ```wta=1``` if the AdChoices icon, as provided in the VAST response, will be rendered on companions or otherwise provided to the user.\n\nFor traffic from the EEA, requests with ```&wta=0``` will not be eligible for reservation creatives where Google badging is enabled.\n\nAds must comply with applicable regulatory requirements for ads served in \nthe European Economic Area (EEA). This includes a mechanism for users to \nreport illegal content. Publishers must notify Google of any illegal \ncontent reports using the appropriate form.\n\nUsage example:\n\nSupported: ```wta=1``` or no wta parameter\nUnsupported: ```wta=0```\n\nRequirement:\n*Required for Ad Exchange*\n*Required for web and app EEA traffic*\nRecommended for Programmatic monetization"
        },
        "ss_req": {
         "definition": "SSAI Request",
         "explination": "This is deprecated and GAM now uses the combination of ```serverside.doubleclick.net``` and the ```ssss=``` parameter to define the ad as SSAI."
      }
};
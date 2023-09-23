/*

  SmartClient Ajax RIA system
  Version v13.0p_2023-09-15/LGPL Deployment (2023-09-15)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/
//--------------------------------------------------------------------------------------------------
// XMLHttp support
//--------------------------------------------------------------------------------------------------
isc.defineStandaloneClass("SA_XMLHttp", {

// Copied from the Comm package.  If you update anything here, make sure to change Comm.js as
// well, if applicable.
// registered as onreadystatechange callback on xmlHttpRequest object
_readyStateChangeCallback : function () {
    var xmlHttpRequest = arguments.callee.xmlHttpRequest;

    if (!xmlHttpRequest) return;

    if (xmlHttpRequest.readyState != 4) return;

    arguments.callee.xmlHttpRequest = null;

    var callback = arguments.callee.callback;

    // call user-specified callback - note that arguments are fixed
    if (callback) isc.SA_XMLHttp._fireCallback(callback, xmlHttpRequest);
},

_fireCallback : function (callback, xmlHttpRequest) {
    // allow user to pass in some args - if he does so, we'll append our xmlHttpRequest to
    // those.
    var callbackArgs = [xmlHttpRequest];
    if (callback.args) callback.args = callback.args.concat(callbackArgs);
    else callback.args = callbackArgs;
    this.fireSimpleCallback(callback);
},

// perform an HTTP GET on the provided URL and call the provided callback function if one is
// provided.  
//
get : function (URL, callback) {
    var xmlHttpRequest = this.createXMLHttpRequest();

    // this is only possible in IE < 7 where ActiveX is disabled or IE >= 7 where both ActiveX
    // and the native XMLHttpRequest are disabled.  We can do body.appendChild("script") to fix
    // this, but we can't get an onload with that mechanism.
    //
    // for now just warning an returning so as not JSError
    if (!xmlHttpRequest) {
        this.logWarn("XMLHttpRequest not available - can't fetch url: "+URL);
        return;
    }

    xmlHttpRequest.open("GET", URL, true);
    if (isc.Browser.isIE) {
        var readyCallback = this._readyStateChangeCallback;
        readyCallback.callback = callback;
        readyCallback.xmlHttpRequest = xmlHttpRequest;

        xmlHttpRequest.onreadystatechange = readyCallback;
    } else {
        xmlHttpRequest.onreadystatechange = function() {
            if (xmlHttpRequest.readyState != 4) return;
            isc.SA_XMLHttp._fireCallback(callback, xmlHttpRequest);
        }    
    }

    //this.logDebug("Sending XMLHttp to: " + URL);
    xmlHttpRequest.send(null);
    return xmlHttpRequest;
},

xmlHttpConstructors : ["MSXML2.XMLHTTP", "Microsoft.XMLHTTP", "MSXML.XMLHTTP", "MSXML3.XMLHTTP"],
// ==========================================================================================
// IMPORTANT: If you update this function, also update its copy in Comm.js
// ==========================================================================================
createXMLHttpRequest : function () {
    
    if (isc.Browser.isIE && !isc.Browser.isIE10) {

        var xmlHttpRequest;

        // We prefer the  ActiveX version of XMLHttpRequest if it's available because IE7's
        // native implementation has some quirks - for example it doesn't allow requests to
        // file:// URLs no matter what overrides you set in IE's options panel.  Also there
        // are scattered reports of the native implementation being less performant.
        if (isc.preferNativeXMLHttpRequest) {
            xmlHttpRequest = this.getNativeRequest();
            if (!xmlHttpRequest) xmlHttpRequest = this.getActiveXRequest();
        } else {
            xmlHttpRequest = this.getActiveXRequest();        
            if (!xmlHttpRequest) xmlHttpRequest = this.getNativeRequest();
        }
   
        if (!xmlHttpRequest) this.logWarn("Couldn't create XMLHttpRequest");
        return xmlHttpRequest;
    } else {
        // Moz, Safari, IE10+
        return new XMLHttpRequest();
    }
},

getNativeRequest : function () {
   var xmlHttpRequest;
    if (isc.Browser.version >= 7) {
        this.logDebug("Using native XMLHttpRequest");
        xmlHttpRequest = new XMLHttpRequest();
    }
    return xmlHttpRequest;
},

getActiveXRequest : function () {
    var xmlHttpRequest;

    if (!this._xmlHttpConstructor) {
        for (var i = 0; i < this.xmlHttpConstructors.length; i++) {
            try {
                var cons = this.xmlHttpConstructors[i];
                xmlHttpRequest = new ActiveXObject(cons);
                // cache selected constructor
                if (xmlHttpRequest) {
                    this._xmlHttpConstructor = cons;
                    break;
                }
            } catch (e) { }
        }
    } else {
        xmlHttpRequest = new ActiveXObject(this._xmlHttpConstructor);    
    }

    if (xmlHttpRequest) this.logDebug("Using ActiveX XMLHttpRequest via constructor: " + this._xmlHttpConstructor);
    return xmlHttpRequest;
}

});

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
if (isc.Browser.isOpenFin) {

//> @class OpenFin
// Contains +externalLink{https://developers.openfin.co/of-docs/docs,OpenFin}-specific code to
// implement +link{MultiWindow} for OpenFin via special calls to the OpenFin Application API.
// <p>
// <b>Note:</b> this is currently an experimental feature and not supported except by special
// arrangement
// @treeLocation Client Reference/Foundation
// @visibility external
//<
isc.defineClass("OpenFin", "SCMultiWin").addClassMethods({

    init : function () {
        if (this.invokeSuper(isc.OpenFin, "init") == false) return false;
        if (this != isc.OpenFin) return;

        // do initial scan now for other windows
        this.scanForOtherWindows();

        // setup rescan when other windows are added or removed
        var theApp = fin.Application.getCurrentSync();
        theApp.addListener("window-end-load", this.scanForOtherWindows);
        theApp.addListener("window-closed",   this.scanForOtherWindows);
    },

    stop : function () {
        this.invokeSuper(isc.OpenFin, "stop");
        if (this != isc.OpenFin) return;

        // disable rescan when other windows are added or removed
        var theApp = fin.Application.getCurrentSync();
        theApp.removeListener("window-end-load", this.scanForOtherWindows);
        theApp.removeListener("window-closed",   this.scanForOtherWindows);
    },

    createRemoteWindow : function (a, b, c) {
        return isc.OpenFinWindow.create(a, b, c);
    },

    _open : function (url, name, callback, windowSettings, classSettings) {
        var createSettings = isc.addProperties({}, windowSettings, {
            url: url,
            name: name
        });
        
        var alwaysOnTop = !!createSettings.alwaysOnTop,
            activateOnOpen = createSettings.activateOnOpen != false;
        if (activateOnOpen) createSettings.alwaysOnTop = true;

        
        fin.Window.create(createSettings).then(function (finWin) {
            var webWin = finWin.getWebWindow();

            // focus new window and clear alwaysOnTop if we set it
            if (activateOnOpen) {
                finWin.updateOptions({alwaysOnTop: alwaysOnTop});
                finWin.focus();
            }            

            if (webWin.isc && webWin.isc.SCMultiWin) {
                var childMultiWin = webWin.isc.SCMultiWin;
                childMultiWin.addClassProperties(classSettings);
                var remoteWindow = childMultiWin.getLocalWindow();
                isc.MultiWindow.fireCallback(callback, "remoteWindow,result",
                                             [remoteWindow, true]);
            } else {
                webWin._isc_createWindowCallback = callback;
                if (classSettings) {
                    webWin.isc_multiWindowSettings = classSettings;
                }
            }
        });
    },

    eventListenerID: 1,
    eventListenerRegistry: [],

    getMappedEventType : function (eventType) {
        switch (eventType) {
        case "load":
            return "window-end-load";
        case "unload":
            return ["window-reloaded", "window-closing"];
        case "move":
        case "resize":
            return "window-bounds-changed";
        case "close":
            return "window-closed";
        case "focus":
        case "activate":
            return "window-focused";
        case "blur":
        case "deactivate":
            return "window-blurred";
        default:
            return eventType;
        }
    },

    getMappedListener : function (eventType, listener) {
        var _this = this;
        switch (eventType) {
        case "move":
        case "resize":
            return function (event) {
                if (eventType == "move" && event.changeType != 1 ||
                    eventType == "resize" && event.changeType != 0)
                {
                    var remoteWindow = _this.find(event.name);
                    _this.fireCallback(listener, "remoteWindow,eventType,event",
                                       [remoteWindow, eventType, event]);
                }
            };
            break;
        default:
            return function (event) {
                var remoteWindow = _this.find(event.name);
                if (eventType == "load") {
                    if (event.isMain != isc.MultiWindow.isMainWindow()) return;
                }
                _this.fireCallback(listener, "remoteWindow,eventType,event",
                                   [remoteWindow, eventType, event]);
            };
        }
    },

    setEvent : function (eventType, listener) {
        var _this = this,
            theApp = fin.Application.getCurrentSync(),
            mappedType = this.getMappedEventType(eventType),
            mappedListener = this.getMappedListener(eventType, listener)
        ;
        var eventListenerID = this.eventListenerID;
        if (!isc.isAn.Array(mappedType)) mappedType = [mappedType];

        for (var i = mappedType.length - 1; i >= 0; i--) {
            var regData = {
                eventType: mappedType[i],
                listener: mappedListener
            };
            this.eventListenerRegistry[this.eventListenerID++] = regData;
            if (i > 0) regData.nextID = this.eventListenerID;
            theApp.addListener(mappedType[i], mappedListener);
        }
        return eventListenerID;
    },

    clearEvent : function (eventType, eventID) {
        var registry = this.eventListenerRegistry,
            theApp = fin.Application.getCurrentSync(),
            mappedType = this.getMappedEventType(eventType);
        if (!isc.isAn.Array(mappedType)) mappedType = [mappedType];

        if (!eventID) {
            for (var i = 0; i < registry.length; i++) {
                var regData = registry[i];
                if (regData && mappedType.contains(regData.eventType)) {
                    theApp.removeListener(regData.eventType, regData.listener);
                    delete registry[i];
                }
            }
            return;
        }
        var regData = registry[eventID];
        if (!regData) {
            this.logWarn("clearEvent(): eventID " + eventID + " doesn't appear valid");

        } else if (!mappedType.contains(regData.eventType)) {
            this.logWarn("clearEvent(): eventType " + eventType +
                         " is not consistent with eventID " + eventID);
        } else {
            while (regData) {
                theApp.removeListener(regData.eventType, regData.listener);
                delete registry[eventID];
                eventID = regData.nextID;
                regData = registry[eventID];
            }
        }
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Detect all other OpenFin windows where SC/SGWT is loaded

    otherWindowScans: 0,

    scanForOtherWindows : function (event) {
        // called with event; skip events on own window
        if (event && event.name == window.name) return;

        // catch calls made after disabling MW
        if (!isc.Browser.isMultiWindow) return;

        var _this = isc.OpenFin,
            scanId = ++_this.otherWindowScans
        ;

        var otherWindows = isc.SCMultiWin.otherWindows = [],
            windowMap = isc.SCMultiWin.windowMap = {},
            theApp = fin.Application.getCurrentSync(),
            appWin
        ;

        
        theApp.getWindow().then(function (theWin) {
            appWin = theWin;
            //_this.baseWindow = appWin.getWebWindow();
            return theApp.getChildWindows();

        }).then(function (finWins) {
            if (scanId != _this.otherWindowScans) {
                _this.logInfo("Abandoning scan attempt " + scanId + " as " + 
                    _this.otherWindowScans + " is now the current scan number");
                return;
            }

            // catch calls made after disabling MW
            if (!isc.Browser.isMultiWindow) return;

            finWins.unshift(appWin);

            for (var i = 0; i < finWins.length; i++) {
                var finWin = finWins[i],
                    otherWin = finWin.getWebWindow();
                if (!otherWin) continue;

                var otherISC = otherWin.isc;
                if (!otherISC || !otherISC.OpenFin) continue;

                var remoteWin = otherISC.SCMultiWin.getLocalWindow();

                

                if (otherWin != window) otherWindows.add(remoteWin);
                windowMap[remoteWin.getName()] = remoteWin;
            }
            if (_this.logIsInfoEnabled()) {
                var ids = otherWindows.map(function(remoteWin) {
                    return remoteWin.getWindow().name;
                });
                _this.loginfo("Other OpenFin ISC windows: " + ids);
            }

            _this._otherWindowsChanged();
        });
    }

});

//> @class OpenFinWindow
// Provides a SmartClient wrapper around an
// +externalLink{https://developers.openfin.co/of-docs/docs,OpenFin} window.
// <p>
// <b>Note:</b> this is currently an experimental feature and not supported except by special
// arrangement
// @see OpenFin
// @inheritsFrom RemoteWindow
// @treeLocation Client Reference/Foundation
// @visibility external
//<
isc.defineClass("OpenFinWindow", "RemoteWindow").addMethods({

    init : function () {
        this.Super("init", arguments);

        this.finWindow = fin.Window.getCurrentSync();
    },

    getContainerWindow : function () {
        return this.finWindow;
    },

    close : function (force, callback) {
        this._handlePromiseCallback("close", callback, force);
    },

    move : function (x, y, callback) {
        this._handlePromiseCallback("moveTo", callback, x, y);
    },

    resize : function (width, height, callback) {
        this._handlePromiseCallback("resizeTo", callback, width, height);
    },

    focus : function (callback) {
        this._handlePromiseCallback("focus", callback);
    },

    blur : function (callback) {
        this._handlePromiseCallback("blur", callback);
    },

    maximize : function (callback, errorCallback) {
        this._handlePromiseCallbacks("maximize", callback, errorCallback,
            "unable to maximize window '${windowName}': ${errorMessage}");
    },

    minimize : function (callback, errorCallback) {
        this._handlePromiseCallbacks("minimize", callback, errorCallback,
            "unable to minimize window '${windowName}': ${errorMessage}");
    },

    restore : function (callback, errorCallback) {
        this._handlePromiseCallbacks("restore", callback, errorCallback,
            "unable to restore window '${windowName}': ${errorMessage}");
    },

    hide : function (callback, errorCallback) {
        this._handlePromiseCallbacks("hide", callback, errorCallback,
            "unable to hide window '${windowName}': ${errorMessage}");
    },

    show : function (force, callback, errorCallback) {
        this._handlePromiseCallbacks("show", callback, errorCallback,
            "unable to show window '${windowName}': ${errorMessage}", force);
    },

    bringToFront : function (callback, errorCallback) {
        this._handlePromiseCallbacks("bringToFront", callback, errorCallback,
            "unable to bring window '${windowName}' to front: ${errorMessage}");
    },

    isShowing : function (callback) {
        this._handlePromiseCallbackWithValue("isShowing", callback, "result");
    },

    getInfo : function (callback) {
        this._handlePromiseCallbackWithValue("getInfo", callback, "result");
    }

});

isc.MultiWindow = isc.OpenFin;

}

isc.MultiWindow._loaded();

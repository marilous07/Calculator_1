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
//> @class MultiWindow
// Provides tracking of other SmartClient browser windows opened by the original window,
// as +link{RemoteWindow,RemoteWindows}.
// <p>
// Includes APIs for:<ul>
// <li>Registering event listeners for events on other windows
// <li>Opening a new window and finding a window by name
// <li>Moving, activating, or deactiving a window by name
// <li>Sharing DataSources and their caches between SmartClient windows
// <li>Sharing +link{group:messaging} channels between SmartClient windows</ul>
// <p>
// Within the +externalLink{https://developers.openfin.co/of-docs/docs,OpenFin} environment,
// the underlying implementation is actually via the +link{OpenFin} class.
// <p>
// Reloading of child windows is in general supported (but see
// +link{MultiWIndow.autoCopyDataSources}), while reloading the
// +link{MultiWindow.isMainWindow,main window} currently is not.
// <p>
// <b>Note:</b> this is currently an experimental feature and not supported except by special
// arrangement.
// @treeLocation Client Reference/Foundation
// @visibility external
//<
isc.defineClass("SCMultiWin").addClassMethods({

    init : function () {
        if (isc.SCMultiWin.stopped) return false;
        if (isc.SCMultiWin.activeClass) return;
        isc.SCMultiWin.activeClass = this;

        this.invokeSuper(isc.SCMultiWin, "init");

        var baseWindow;
        for (baseWindow = window; baseWindow.opener; baseWindow = baseWindow.opener);
        isc.SCMultiWin.baseWindow = baseWindow;

        var _this = this;
        if (this == isc.SCMultiWin) {
            var windowsChanged = function (remoteWindow, eventType, event) {
                if (event.name == window.name) return;
                
                _this._otherWindowsChanged(eventType == "load" ? [remoteWindow] : []);
            };
            this._otherWindowsLoadedEventID   = this.setEvent("load",   windowsChanged);
            this._otherWindowsUnloadedEventID = this.setEvent("unload", windowsChanged);
        }

        this._unloadPageEventID = isc.Page.setEvent("unload", function () {
            var othersLoadedID = this._otherWindowsLoadedEventID;
            if (othersLoadedID) this._clearEvent("load", othersLoadedID);
            var othersUnloadedID = this._otherWindowsUnloadedEventID;
            if (othersUnloadedID) this._clearEvent("unload", othersUnloadedID);

            isc.SCMultiWin.messagingUnsubscribeAll();
            isc.SCMultiWin.unregisterRemoteWindow();
        });

        isc.SCMultiWin.localWindow = this.createRemoteWindow();

        var dataContext = this.getOpenWindowDataContext();
        if (dataContext) this.installDataContext(dataContext);
    },

    stop : function () {
        
        var activeClass = isc.SCMultiWin.activeClass;
        if (activeClass == null || activeClass == isc.SCMultiWin) return false;

        isc.Page.clearEvent("unload", this._unloadPageEventID);

        this._clearPendingWindowsChangedCallback();
        var localWindow = isc.SCMultiWin.localWindow;
        isc.SCMultiWin.localWindow = null;        
        localWindow.destroy();
    },

    _loaded : function () {
        try {
            var shouldInit = isc.Browser.isOpenFin;

            var opener = window.opener;
            if (opener && opener.isc) {
                var parentIsMulti = opener.isc.Browser.isMultiWindow;
                if (parentIsMulti != null) shouldInit = parentIsMulti;
            }

            isc.Browser.isMultiWindow = shouldInit;
            if (shouldInit) isc.MultiWindow.init();

        } catch (e) {
            var message = "MultiWindow preload logic failed to complete: " + e;
            if (shouldInit) this.logWarn(message);
            else            this.logInfo(message);
        }
    },

    registerClassProperties : function (newSettings) {
        if (!window.sessionStorage) {
            this.logWarn("storeConfiguration(): unable to persist config: " +
                         isc.echo(newSettings));
            return;
        }
        // grab the old settings; this object may or may not be present
        var oldSettings,
            storedProps = sessionStorage.getItem("isc_multiWindowSettings");
        if (storedProps) oldSettings = JSON.parse(storedProps);
        // if new settings exist, combine them on top of the old settings
        if (newSettings) {
            newSettings = isc.addProperties({}, oldSettings, newSettings);
            sessionStorage.setItem("isc_multiWindowSettings",
                                   JSON.stringify(newSettings));
        } else {
            newSettings = oldSettings;
        }
        // now initialize MultiWindow from new settings
        isc.SCMultiWin.addClassProperties(newSettings);
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Management and tracking of other RemoteWindows

    createRemoteWindow : function (a, b, c) {
        return isc.RemoteWindow.create(a, b, c);
    },

    getBaseMultiWindow : function (excludeOpenFin) {
        if (excludeOpenFin && isc.OpenFin) return;
        var baseWindow = this.baseWindow;
        if (baseWindow && baseWindow.isc) {
            return baseWindow.isc.SCMultiWin;
        }
    },

    //> @classMethod MultiWindow.getLocalWindow()
    // Returns the +link{RemoteWindow} instance for the current window (where the method was
    // called).
    // @return (RemoteWindow) instance wrapping the current window
    // @visibility external
    //<
    getLocalWindow : function () {
        return this.localWindow;
    },

    //> @classMethod MultiWindow.getParentWindow()
    // Returns the parent +link{RemoteWindow} instance that opened this window.
    // @return (RemoteWindow) instance wrapping the parent window or null
    // @visibility external
    //<
    getParentWindow : function () {
        var parent = window.opener;
        if (parent) return parent.isc.SCMultiWin.getLocalWindow();
    },

    //> @classMethod MultiWindow.isMainWindow()
    // Returns whether this +link{RemoteWindow} wraps the main application window.
    // @return (boolean) whether this instance wraps the main application window
    // @visibility external
    //<
    isMainWindow : function () {
        return !this.getParentWindow();
    },

    //> @classMethod MultiWindow.getOtherWindows()
    // Returns a list of +link{RemoteWindow} for the other currently known windows (excluding
    // the +link{getLocalWindow(),local window}).  This would typically only be used to
    // initialize logic dependent on other windows.  You'd want to <smartclient>observe
    // +link{otherWindowsChanged()}</smartclient><smartgwt>add a handler for the
    // {@link package com.smartgwt.client.browser.window.events.OtherWindowsChangedEvent}.
    // </smartgwt> to ensure you keep things updated as windows are opened or closed.
    // @return (Array of RemoteWindow) current set of other RemoteWindows.
    // @visibility external
    //<
    getOtherWindows : function () {
        if (this.otherWindows) return this.otherWindows;

        var otherWindows = [],
            baseMultiWindow = isc.SCMultiWin.getBaseMultiWindow();
        if (baseMultiWindow) {
            var windowMap = baseMultiWindow.windowMap;
            if (windowMap) for (var windowName in windowMap) {
                if (windowName != window.name) otherWindows.add(windowMap[windowName]);
            }
        }
        return otherWindows;
    },


    // register this RemoteWindow in the base window (OpenFin not present)
    registerRemoteWindow : function (remoteWindow) {
        var baseMultiWindow = isc.SCMultiWin.getBaseMultiWindow(true);
        if (baseMultiWindow) {
            if (!baseMultiWindow.windowMap) baseMultiWindow.windowMap = {};
            var windowMap = baseMultiWindow.windowMap;

            var registry = baseMultiWindow.eventListenerRegistry;
            if (registry) {
                for (var windowName in registry) {
                    var winReg = registry[windowName];
                    if (!winReg) continue;

                    for (var i = 0; i < winReg.length; i++) {
                        var regData = winReg[i];
                        if (!regData) continue;

                        window.addEventListener(regData.eventType, regData.listener);
                    }
                }
            }

            baseMultiWindow.windowMap[window.name] = remoteWindow;

            this._otherWindowsChanged();
        }
    },

    // unregister this RemoteWindow in the base window (OpenFin not present)
    unregisterRemoteWindow : function () {
        var baseMultiWindow = isc.SCMultiWin.getBaseMultiWindow(true);
        if (baseMultiWindow) {
            delete baseMultiWindow.windowMap[window.name];

            var registry = baseMultiWindow.eventListenerRegistry;
            if (registry) {
                var winReg = registry[window.name];
                if (winReg) {

                    for (var i = 0; i < winReg.length; i++) {
                        var regData = winReg[i];
                        if (!regData) continue;

                        window.removeEventListener(regData.eventType, regData.listener);
                    }

                    delete registry[window.name];
                }

            }
        }
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Support for Application Events (reporting for all windows in the application)

    getMappedEventType : function (eventType) {
        switch (eventType) {
        case "activate":
            eventType = "focus";
            break;
        case "deactivate":
            eventType = "blur";
            break;
        }
        return eventType;
    },

    //> @method Callbacks.MultiWindowEventCallback
    // Callback scheduled by +link{MultiWindow.setEvent()}.  The +link{RemoteWindow} may be
    // null if the associated browser window is unloading or closing.
    // <p>
    // Note that the event is simply an
    // +externalLink{https://developer.openfin.co/docs/javascript/stable/tutorial-Application.EventEmitter.html,OpenFin application event}
    // when OpenFin is present, but may not be fully populated in fallback mode without OpenFin.
    // @param remoteWindow (RemoteWindow) window affected by event, or null if not found
    // @param eventType (MultiWindowEvent) event type as passed to +link{MultiWindow.setEvent()}
    // @param event (Object) event data
    // see MultiWindow.setEvent()
    // see MultiWindow.clearEvent()
    // @visibility external
    //<

    //> @type MultiWindowEvent
    // Various events triggered by any window in the current application.
    // <p>
    // Aside from the standard event types listed, other types may be supported depending upon
    // whether OpenFin is in use:<ul>
    // <li>With OpenFin, +externalLink{https://developer.openfin.co/docs/javascript/stable/tutorial-Application.EventEmitter.html,application event types}
    // are allowed.
    // <li>Without OpenFin, +externalLink{https://www.w3schools.com/jsref/dom_obj_event.asp,HTML Dom Events}
    // supported by +externalLink{https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener,window.addEventListener()}
    // are allowed.</ul>
    //
    // @value "load" fires when a window finishes loading
    // @value "unload" fires when a window is about to be reloaded or closed
    // @value "move" fires when a window is moved
    // @value "resize" fires when a window is resized
    // @value "close" fires when a window is closed
    // @value "focus" fires when a window gets focus
    // @value "blur" fires when a window loses focus
    // @value "activate" (synonym for "focus")
    // @value "deactivate" (synonym for "blur")
    // @visibility external
    //<

    //> @classMethod MultiWindow.setEvent()
    // Registers a window event listener to be called whenever the event type occurs for any
    // window in the application.
    // @param eventType (MultiWindowEvent) event type to register
    // @param listener (MultiWindowEventCallback) function to be called when event fires
    // @return         (number) ID number of this event, may be used to remove the event
    // @see clearEvent()
    // @visibility external
    //<
    setEvent : function (eventType, listener) {
        var baseMultiWindow = this.getBaseMultiWindow();
        if (!baseMultiWindow.eventListenerRegistry) {
            baseMultiWindow.eventListenerRegistry = [];
            baseMultiWindow.eventListenerID = 1;
        }
        var registry = baseMultiWindow.eventListenerRegistry;
        if (!registry[window.name]) registry[window.name] = [];

        var _this = this,
            mappedType = this.getMappedEventType(eventType),
            wrappedListener = function (event) {
                var windowName = event.currentTarget.name,
                    remoteWindow = _this.find(windowName);
                _this.fireCallback(listener, "remoteWindow,eventType,event",
                    [remoteWindow, eventType, {name: windowName, type: mappedType}]);
            }
        ;
        var winReg = registry[window.name],
            eventID = baseMultiWindow.eventListenerID++;
        winReg[eventID] = {eventType: mappedType, listener: wrappedListener};

        var windowMap = baseMultiWindow.windowMap;
        for (var windowName in windowMap) {
            var remoteWindow = windowMap[windowName];
            remoteWindow.getWindow().addEventListener(mappedType, wrappedListener);
        }

        return eventID;
    },

    //> @classMethod MultiWindow.clearEvent()
    // Unregisters a previously registered window event listener.  The event type and ID
    // returned by the original +link{setEvent()} call should be passed.
    // @param eventType (MultiWindowEvent) event type to register
    // @param [ID]      (number)           ID of the event to clear.  If not specified, all
    //                                     events of eventType will be cleared.
    // @see setEvent()
    // @visibility external
    //<
    clearEvent : function (eventType, eventID) {
        var baseMultiWindow = this.getBaseMultiWindow(),
            registry = baseMultiWindow.eventListenerRegistry;
        if (!registry) return;

        var winReg = registry[window.name];
        if (!winReg) return;

        var windowMap = baseMultiWindow.windowMap,
            mappedType = this.getMappedEventType(eventType);

        if (!eventID) {
            for (var i = 0; i < winReg.length; i++) {
                var regData = winReg[i];
                if (regData && mappedType == eventType) {
                    this._removeRegData(winReg, windowMap, i);
                }
            }
            return;
        }
        var regData = winReg[eventID];
        if (!regData) {
            this.logWarn("clearEvent(): eventID " + eventID + " doesn't appear valid");

        } else if (mappedType != eventType) {
            this.logWarn("clearEvent(): eventType " + eventType +
                         " is not consistent with eventID " + eventID);
        } else {
            this._removeRegData(winReg, windowMap, eventID);
        }
    },

    _removeRegData : function (winReg, windowMap, eventID) {
        var regData = winReg[eventID];
        for (var windowName in windowMap) {
            var remoteWindow = windowMap[windowName];
            remoteWindow.getWindow().removeEventListener(regData.eventType, regData.listener);
        }
        delete winReg[eventID];
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Synchronization and notification of changes from other RemoteWindows

    _otherWindowsChanged : function (changedWindows) {
        var _this = this, windowsChanged = function () {
            _this.copyInRegisteredDataSources(changedWindows);
            var otherWindows = _this.getOtherWindows(),
                target = isc.Browser.isSGWT ? _this.localWindow : _this;
            target.otherWindowsChanged(otherWindows);
            // clear data for windows that no longer exist
            // if (_this.isMainWindow()) {
            //     _this._filterOpenWindowsData(otherWindows);
            // }
        };
        this._clearPendingWindowsChangedCallback();

        if (!isc.Page.isLoaded()) {
            this._otherWindowsChangedEventID = isc.Page.setEvent("load", windowsChanged,
                                                                 isc.Page.FIRE_ONCE);
        // triggered by other windows, so run callback inline
        } else if (changedWindows) {
            this.fireCallback(windowsChanged, null, null, this);

        } else {
            this._otherWindowsChangedTimerID = isc.Timer.setTimeout(windowsChanged, 0);
        }
    },

    _clearPendingWindowsChangedCallback : function () {
        var eventID = this._otherWindowsChangedEventID;
        if (eventID) isc.Page.clearEvent("load", eventID);

        var timerID = this._otherWindowsChangedTimerID;
        if (timerID) isc.Timer.clear("load", timerID);
    },

    //> @classMethod MultiWindow.otherWindowsChanged()
    // Notification fired when the set of other +link{RemoteWindow,RemoteWindows} changes or
    // requires re-synchronization due a call to +link{RemoteWindow.create(),create()},
    // +link{RemoteWindow.close(),close()}, or a page reload in a different RemoteWindow.
    // <p>
    // This method has no default implementation.
    // @param otherWindows (Array of RemoteWindow) current set of other RemoteWindows.
    // @visibility smartclient
    //<
    otherWindowsChanged : function (otherWindows) {
    },

    applyFunctionToOtherRemoteWindows : function (func, otherWindows) {
        var windows = otherWindows || this.getOtherWindows();
        for (var i = 0; i < windows.length; i++) {
            var otherWin = windows[i].getWindow();
            if (otherWin && otherWin.isc) func.call(this, otherWin);
        }
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Logic to share DataSources by reference between windows

    //> @classAttr MultiWindow.autoCopyDataSources (Boolean : varies : IRW)
    // Should +link{DataSource,DataSources} from other OpenFin windows with SmartClient loaded
    // be copied by reference into this window?  Such DataSources will be copied:<ul>
    // <li>when a page in another window is loaded (potentially several DataSources at once)
    // <li>at the moment DataSources are created in a page loaded in another window (just that
    // DataSource)</ul>
    // <p>
    // This property will default to true if OpenFin is present; otherwise, false.
    // <p>
    // Note that reloading a page that created DataSources copied by reference into other
    // windows (via this property) is not supported.
    // @visibility external
    //<
    autoCopyDataSources: true,

    //> @classAttr MultiWindow.autoSyncCaches (Boolean : true : IRW)
    // Should DataSource cache updates from other OpenFin windows with SmartClient loaded be
    // reflected into this window?  This will be triggered when +link{DataSource.dataChanged()}
    // gets called in other windows, with the record getting passed via XML serialization.
    //<
    //autoSyncCaches: true,

    registerDataSource : function (dataSource) {
        isc.DS.registerDataSource(dataSource);
    },

    compareDataSources : function (newDS, otherWin) {
        var dsName = newDS.getID(),
            oldDS = otherWin.isc.DS.get(dsName)
        ;

        // nothing to do if same instance
        if (oldDS == newDS) return true;

        // otherwise, if DS exists in the other window, compare it
        if (oldDS) {
            if (isc.Canvas.compareValues(oldDS.fields, newDS.fields)) {
                this.logInfo("Refreshing DS " + dsName + " in window " + otherWin.name);
            } else {
                this.logWarn("DS " + dsName + " in window " + otherWin.name + " replaced");
            }
        }
    },

    copyOutRegisteredDataSource : function (ds) {
        // if this looks like an internal framework DS or schema, skip it
        if (ds._internal || ds.componentSchema || ds.builtinSchema ||
            ds._autoAssignedID || ds.ID && ds.ID.startsWith("isc_"))
        {
            return;
        }

        var _this = this;
        this.applyFunctionToOtherRemoteWindows(function (otherWin) {
            var otherISC = otherWin.isc;
            if (!otherISC.MultiWindow.autoCopyDataSources) return;

            var otherDS = otherISC.DS;
            if (otherDS && !_this.compareDataSources(ds, otherWin)) {
                otherISC.SCMultiWin.registerDataSource(ds);
            }
        });
    },

    copyInRegisteredDataSources : function (changedWindows) {
        if (!this.autoCopyDataSources) return;

        var _this = this;
        this.applyFunctionToOtherRemoteWindows(function (otherWin) {
            var otherDS = otherWin.isc.DS;
            if (!otherDS) return;

            // list excludes internal framework DataSources and schema from other window
            var dsList = otherDS.getRegisteredDataSourceObjects(true, true, true, true);
            for (var i = 0; i < dsList.length; i++) {
                var ds = dsList[i];
                if (!_this.compareDataSources(ds, window)) _this.registerDataSource(ds);
            }
        }, changedWindows);
    },


    ////////////////////////////////////////////////////////////////////////////////
    // DataContext support - serialize/deserialize cross-window for clean data

    //> @classMethod MultiWindow.getDataContext()
    // Returns the +link{DataContext} provided by the +link{open()} call that opened this
    // window, or a newly created (on demand) +link{DataContext} if this is the main
    // application window, or no DataContext was provided.
    // @return (DataContext) +link{DataContext} for this window
    // @visibility external
    //<
    getDataContext : function () {
        if (!this.dataContext) this.dataContext = {};
        return this.dataContext;
    },

    //> @classAttr MultiWindow.dataContextEncoderProperties (JSONEncoder Properties : see below : IRW)
    // Config controlling how precisely to serialize the provided +link{DataContext}.
    // <p>
    // No pretty printing is needed, and internal properties are skipped to ignore "scribbling."
    //<
    dataContextEncoderProperties: {
        prettyPrint:false,
        strictQuoting:false,
        skipInternalProperties:true,
        dateFormat:"logicalDateConstructor"
    },

    //> @classAttr MultiWindow.dataContextDropExtraFields (boolean : false : IRW)
    // Should record fields not declared in the +link{DataSource} be removed during
    // serialization of the +link{DataContext}?
    //<

    _shouldSerializeDataContextValue : function (key, value) {
        return !key.startsWith(isc._underscore) && isc.isAn.Object(value);
    },

    getStrictRecordData : function (ds, records) {
        var result;
        if (isc.isAn.Array(records)) {
            result = [];
            for (var i = 0; i < records.length; i++) {
                result.add(this.getStrictRecordData(ds, records[i]));
            }
        } else {
            result = {};
            for (var prop in records) {
                if (ds.getField(prop)) result[prop] = records[prop];
            }
        }
        return result;
    },

    serializeDataContext : function (dataContext) {
        var result = {},
            encoderProps = this.dataContextEncoderProperties,
            dropExtraFields = this.dataContextDropExtraFields;
        for (var dsID in dataContext) {
            var ds = isc.DS.get(dsID),
                value = dataContext[dsID];
            if (this._shouldSerializeDataContextValue(dsID, value)) {
                if (ds && dropExtraFields) {
                    value = this.getStrictRecordData(ds, value);
                }
                result[dsID] = isc.JSON.encode(value, encoderProps);
            } else {
                result[dsID] = value;
            }
        }
        return result;
    },

    deserializeDataContext : function (dataContext) {
        var result = {};
        for (var dsID in dataContext) {
            var value = dataContext[dsID];
            if (!dsID.startsWith(isc._underscore) && isc.isA.String(value)) {
                result[dsID] = isc.JSON.decode(value);
            } else {
                result[dsID] = value;
            }
        }
        return result;
    },

    getOpenWindowDataContext : function () {
        if (this.isMainWindow()) return;

        var baseMultiWindow = this.getBaseMultiWindow();
        if (!baseMultiWindow) return;

        var openWindowsContext = baseMultiWindow.openWindowsContext;
        if (!openWindowsContext) return;

        var openWindowContext = openWindowsContext[window.name];
        if (openWindowContext) return openWindowContext.dataContext;
    },

    installDataContext : function (dataContext) {
        // first, serialize the dataContext in the origin (parent) window
        var parentMultiWin = this.getParentWindow().getWindow().isc.SCMultiWin;
        dataContext = parentMultiWin.serializeDataContext(dataContext);
        // now, deserialize the dataContext in the current window
        this.dataContext = this.deserializeDataContext(dataContext);
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Sharing channels for Realtime Messaging across windows

    //> @classAttr MultiWindow.shareMessageChannels (Boolean : varies : IRW)
    // Should this window share +link{group:messaging,Realtime Messaging} channels with other
    // windows?
    // <p>
    // This property will default to true if OpenFin is present; otherwise, false.
    // @visibility external
    //<
    shareMessageChannels: true,

    canShareMessageChannels : function () {
        if (!this.shareMessageChannels) return false;

        var baseMultiWindow = this.getBaseMultiWindow();
        if (!baseMultiWindow) return false;

        var baseRemoteWindow = baseMultiWindow.getLocalWindow();
        return !!baseRemoteWindow.getWindow().isc.Messaging;
    },

    messagingSubscribe : function (channel, callback, subscriptionCallback, selector, data) {
        var baseMultiWindow = this.getBaseMultiWindow(),
            baseRemoteWindow = baseMultiWindow.getLocalWindow()
        ;
        var messaging = isc.Messaging;
        if (messaging._channels[channel] && isc.SCMultiWin != baseMultiWindow) {
            messaging.unsubscribe(channel);
        }

        var channelTable = baseMultiWindow.messageChannelTable;
        if (!channelTable) {
            channelTable = baseMultiWindow.messageChannelTable = {};
        }

        var _this = this,
            channelEntry = channelTable[channel];
        if (!channelEntry) {
            channelEntry = channelTable[channel] = {
                callbacks: {},
                wrapper: function (data, channel) {
                    var channelCallbacks = channelEntry.callbacks;
                    for (var windowName in channelCallbacks) {
                        _this.fireCallback(channelCallbacks[windowName], "data,channel",
                                           [data, channel], this, true);
                    }
                }
            };
        }
        var localWindow = this.getLocalWindow(),
            windowName = localWindow.getName();
        channelEntry.callbacks[windowName] = callback;

        var wrapper = channelEntry.wrapper,
            baseMessaging = baseRemoteWindow.getWindow().isc.Messaging;
        baseMessaging._subscribe(channel, wrapper, subscriptionCallback, selector, data);
    },

    messagingUnsubscribe : function (channel) {
        var baseMultiWindow = this.getBaseMultiWindow(),
            baseRemoteWindow = baseMultiWindow.getLocalWindow()
        ;
        var messaging = isc.Messaging;
        if (messaging._channels[channel] && isc.SCMultiWin != baseMultiWindow) {
            messaging.unsubscribe(channel);
            return;
        }

        var channelTable = baseMultiWindow.messageChannelTable;
        if (!channelTable) return;

        var channelEntry = channelTable[channel];
        if (!channelEntry) return;

        var localWindow = this.getLocalWindow(),
            windowName = localWindow.getName()
        ;
        delete channelEntry.callbacks[windowName];
        if (isc.isAn.emptyObject(channelEntry.callbacks)) {
            delete channelTable[channel];
            baseRemoteWindow.getWindow().isc.Messaging._unsubscribe(channel);
        }
    },

    messagingUnsubscribeAll : function () {
        var baseMultiWindow = this.getBaseMultiWindow(),
            baseRemoteWindow = baseMultiWindow.getLocalWindow()
        ;

        var channelTable = baseMultiWindow.messageChannelTable;
        if (!channelTable) return;

        var localWindow = this.getLocalWindow(),
            windowName = localWindow.getName()
        ;

        for (var channel in channelTable) {
            var channelEntry = channelTable[channel];

            delete channelEntry.callbacks[windowName];
            if (isc.isAn.emptyObject(channelEntry.callbacks)) {
                delete channelTable[channel];
                baseRemoteWindow.getWindow().isc.Messaging._unsubscribe(channel);
            }
        }
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Support for operations on RemoteWindows (creating, moving, activating, etc.)

    //> @method Callbacks.RemoteWindowCallback
    // Callback reporting a change to a +link{RemoteWindow}, such as it moving.
    // @param remoteWindow (RemoteWindow) window affected
    // @visibility external
    //<

    //> @method Callbacks.RemoteWindowErrorCallback
    // Callback reporting a failure in a +link{RemoteWindow} operation.
    // @param remoteWindow (RemoteWindow) window affected
    // @param errorMessage (String) error message
    // @visibility external
    //<

    //> @method Callbacks.RemoteWindowBooleanCallback
    // Callback reporting the result of a boolean +link{RemoteWindow} operation.
    // @param remoteWindow (RemoteWindow) window affected
    // @param result (Boolean) result
    // @visibility external
    //<

    //> @method Callbacks.RemoteWindowMapCallback
    // Callback reporting the result of a +link{RemoteWindow} operation yielding a map.
    // @param remoteWindow (RemoteWindow) window affected
    // @param result (Map) result
    // @visibility external
    //<

    //> @object MultiWindowSettings
    // Allows specifying settings to apply to the +link{MultiWindow} of a child window.
    // @treeLocation Client Reference/Foundation
    // @visibility external
    //<

    //> @attr MultiWindowSettings.autoCopyDataSources (Boolean : varies : IR)
    // @include MultiWindow.autoCopyDataSources
    //<

    //> @attr MultiWindowSettings.shareMessageChannels (Boolean : varies : IR)
    // @include MultiWindow.shareMessageChannels
    //<

    //> @object BrowserWindowSettings
    // Allows specifying additional browser window settings when calling the underlying
    // JavaScript or OpenFin call to create the child window in +link{MultiWindow.open()}.
    // @treeLocation Client Reference/Foundation
    // @visibility external
    //<

    //> @attr BrowserWindowSettings.defaultWidth (int : null : IR)
    // Initial width to assign to a new child window created by +link{MultiWindow.open()}.
    // @visibility external
    //<

    //> @attr BrowserWindowSettings.defaultHeight (int : null : IR)
    // Initial height to assign to a new child window created by +link{MultiWindow.open()}.
    // @visibility external
    //<

    //> @attr BrowserWindowSettings.tab (Boolean : null : IR)
    // Should the window be opened in a tab or a new browser window in fallback mode without
    // OpenFin?  Unless set explicitly false, fallback mode will open tabs for the new window.
    // @visibility external
    //<

    //> @attr BrowserWindowSettings.activateOnOpen (boolean : true : IR)
    // Should a new window be activated when opened to ensure it's on top?
    // @visibility external
    //<

    //> @attr BrowserWindowSettings.alwaysOnTop (boolean : false : IR)
    // Persistent setting to position the window at the top of the window stack.
    // @visibility external
    //<

    //> @classMethod MultiWindow.open()
    // Opens a new window with the specified URL, name, and +link{DataContext}.
    // <p>
    // Note that if the provided window name already exists, that window will just be
    // +link{activate(),activated}, and though the callback will be run, the supplied url,
    // dataContext, windowSettings, and classSettings will be ignored.
    // <smartgwt><p>
    // Support for passing POJOs (Java Object references) to the child window in the
    // +link{DataContext} via APIs such as
    // {@link com.smartgwt.client.widgets.DataContext#setSharedJavaObject
    // DataContext.setSharedJavaObject()} is "super experimental" (beyond the feature itself,
    // which is experimental).
    // </smartgwt>
    //
    // @param url (URL) url to open in the window or null to reuse the current url
    // @param name (String) unique window name to open as a new window
    // @param [dataContext] (DataContext) dataContext to apply to window
    // @param [callback] (RemoteWindowBooleanCallback) callback run after +link{RemoteWindow}
    //                                       created or activated (parameter true if created)
    // @param [windowSettings] (BrowserWindowSettings) settings applied to child browser window
    // @param [classSettings] (MultiWindowSettings) settings for child +link{MultiWindow} class
    // @visibility external
    //<
    open : function (url, name, dataContext, callback, windowSettings, classSettings) {
        // handle case where the named window already exists; just activate it
        var remoteWindow = this.find(name);
        if (remoteWindow) {
            this.logInfo("Window '" + name + "' already exists.  Activating.");

            remoteWindow.activate(function (remoteWindow) {
                if (callback) this.fireCallback(callback, "remoteWindow,result",
                                                [remoteWindow, false]);
            });
            return;
        }

        // named window not found, so register supplied dataContext and then create window
        var baseMultiWindow = this.getBaseMultiWindow();
        if (baseMultiWindow) {
            var openWindowsContext = baseMultiWindow.openWindowsContext;
            if (!openWindowsContext) {
                openWindowsContext = baseMultiWindow.openWindowsContext = {};
            }
            openWindowsContext[name] = {dataContext: dataContext};
        }
        this._open(url || window.location.href, name, callback, windowSettings, classSettings);
    },

    _open : function (url, name, callback, windowSettings, classSettings) {
        var features = [];
        if (windowSettings && windowSettings.tab == false) {
            features.add("location=0");
        }

        var childWindow = window.open(url, name, features.join());
        childWindow._isc_createWindowCallback = callback;
        if (classSettings) {
            childWindow.isc_multiWindowSettings = classSettings;
        }
    },

    // _filterOpenWindowsData : function (otherWindows) {
    //     if (!this.openWindowsContext) return;
    //     var oldOpenContext = this.openWindowsContext,
    //         newOpenContext = this.openWindowsContext = {};
    //     for (var i = 0; i < otherWindows.length; i++) {
    //         var windowName = otherWindows[i].getName();
    //         if (oldOpenContext[windowName]) {
    //             newOpenContext[windowName] = oldOpenContext[windowName];
    //         }
    //     }
    // },

    //> @classMethod MultiWindow.find()
    // Returns window with the specified name, if it exists in the application.  Note that,
    // without OpenFin, only windows created with +link{open()} (and the base window) can
    // be found with this method.
    // @param name (String) unique window name
    // @return (RemoteWindow) requested window
    // @visibility external
    //<
    find : function (name) {
        var baseMultiWindow = isc.SCMultiWin.getBaseMultiWindow();
        var windowMap = baseMultiWindow ? baseMultiWindow.windowMap : this.windowMap;
        if (windowMap) return windowMap[name];
    },

    _findWindowAndCallMethod : function (windowName, operation, a, b, c) {
        var remoteWindow = this.find(windowName);
        if (remoteWindow) remoteWindow[operation](a, b, c);
        else {
            this.logWarn("No RemoteWindow named '" + windowName + "' found");
        }
    },

    //> @classMethod MultiWindow.close()
    // Closes the existing window with the specified name,
    // @param name (String) unique window name
    // @param [force] (boolean) whether to force it closed
    // @param [callback] (RemoteWindowCallback) callback run after +link{RemoteWindow} closed
    // @visibility external
    //<
    close : function (name, force, callback) {
        this._findWindowAndCallMethod(name, "close", force, callback);
    },

    //> @classMethod MultiWindow.move()
    // Moves the existing window with the specified name,
    // @param name (String) unique window name
    // @param x (number) desired x-offset of left edge
    // @param y (number) desired y-offset of top edge
    // @param [callback] (RemoteWindowCallback) callback run after +link{RemoteWindow} moved
    // @visibility external
    //<
    move : function (name, x, y, callback) {
        this._findWindowAndCallMethod(name, "move", x, y, callback);
    },

    //> @classMethod MultiWindow.resize()
    // Resizes e existing window with the specified name,
    // @param name (String) unique window name
    // @param width (number) desired new width
    // @param height (number) desired new height
    // @param [callback] (RemoteWindowCallback) callback run after +link{RemoteWindow} moved
    // @visibility external
    //<
    resize : function (name, width, height, callback) {
        this._findWindowAndCallMethod(name, "resize", width, height, callback);
    },

    //> @classMethod MultiWindow.activate()
    // Activates (focuses) the existing window with the specified name,
    // @param name (String) unique window name
    // @param [callback] (RemoteWindowCallback) callback run after +link{RemoteWindow}
    //                                          activated
    // @visibility external
    //<
    activate : function (name, callback) {
        this._findWindowAndCallMethod(name, "activate", callback);
    },

    //> @classMethod MultiWindow.deactivate()
    // Deactivates (blurs) the existing window with the specified name,
    // @param name (String) unique window name
    // @param [callback] (RemoteWindowCallback) callback run after +link{RemoteWindow}
    //                                          deactivated
    // @visibility external
    //<
    deactivate : function (name, callback) {
        this._findWindowAndCallMethod(name, "deactivate", callback);
    },

    //> @classMethod MultiWindow.maximize()
    // Maximizes the existing window with the specified name,
    // @param name (String) unique window name
    // @param      [callback] (RemoteWindowCallback) callback run after +link{remoteWindow}
    //                                               maximized
    // @visibility external
    //<
    maximize : function (name, callback) {
        this._findWindowAndCallMethod(name, "maximize", callback);
    },

    //> @classMethod MultiWindow.minimize()
    // Minimizes the existing window with the specified name,
    // @param name (String) unique window name
    // @param      [callback] (RemoteWindowCallback) callback run after +link{remoteWindow}
    //                                               minimized
    // @visibility external
    //<
    minimize : function (name, callback) {
        this._findWindowAndCallMethod(name, "minimize", callback);
    },

    //> @classMethod MultiWindow.restore()
    // Restores the existing window with the specified name,
    // @param name (String) unique window name
    // @param      [callback] (RemoteWindowCallback) callback run after +link{remoteWindow}
    //                                               restored
    // @visibility external
    //<
    restore : function (name, callback) {
        this._findWindowAndCallMethod(name, "restore", callback);
    },

    //> @classMethod MultiWindow.hide()
    // Hides the existing window with the specified name,
    // @param name (String) unique window name
    // @param      [callback] (RemoteWindowCallback) callback run after +link{remoteWindow}
    //                                               hidden
    // @visibility external
    //<
    hide : function (name, callback) {
        this._findWindowAndCallMethod(name, "hide", callback);
    },

    //> @classMethod MultiWindow.show()
    // Shows the existing window with the specified name,
    // @param name (String) unique window name
    // @param      [callback] (RemoteWindowCallback) callback run after +link{remoteWindow}
    //                                               shown
    // @visibility external
    //<
    show : function (name, callback) {
        this._findWindowAndCallMethod(name, "show", callback);
    },

    //> @classMethod MultiWindow.bringToFront()
    // Brings the existing window with the specified name to the top of the window stack.
    // @param name (String) unique window name
    // @param      [callback] (RemoteWindowCallback) callback run after +link{remoteWindow}
    //                                               is brought to the front
    // @visibility external
    //<
    bringToFront : function (name, callback) {
        this._findWindowAndCallMethod(name, "bringToFront", callback);
    },

    //> @classMethod MultiWindow.isShowing()
    // Checks whether a window with the specified name is showing.  Callback returns null if
    // the window cannot be found; otherwise returns true or false according as it's showing.
    // @param name (String) unique window name
    // @param      callback (RemoteWindowBooleanCallback) callback to receive output
    // @visibility external
    //<
    isShowing : function (name, callback) {
        var remoteWindow = this.find(name);
        if (remoteWindow) remoteWindow.isShowing(callback);
        else {
            this.fireCallback(callback, "remoteWindow,result", [this, null]);
        }
    }

});


//> @class RemoteWindow
// Provides APIs that manipulate a SmartClient browser window.
// Within the +externalLink{https://developers.openfin.co/of-docs/docs,OpenFin} environment,
// the underlying implementation is actually via the +link{OpenFinWindow} class.
// <p>
// <b>Note:</b> this is currently an experimental feature and not supported except by special
// arrangement
// @see MultiWindow
// @treeLocation Client Reference/Foundation
// @visibility external
//<
isc.defineClass("RemoteWindow").addMethods({

    init : function () {
        this.webWindow = window;

        isc.SCMultiWin.registerRemoteWindow(this);

        var callback = window._isc_createWindowCallback;
        if (callback) {
            var _this = this;
            isc.Timer.setTimeout(function () {
                isc.MultiWindow.fireCallback(callback, "remoteWindow,result", [_this, true]);
            }, 0);
            delete window._isc_createWindowCallback;
        }
    },

    //> @method RemoteWindow.getName()
    // Returns the name of this RemoteWindow.
    // @return (String) window name
    // @visibility external
    //<
    getName : function () {
        return this.webWindow.name;
    },

    //> @method RemoteWindow.getParent()
    // Returns the parent +link{RemoteWindow} instance that opened this RemoteWindow.
    // @return (RemoteWindow) instance wrapping the parent window or null
    // @visibility external
    //<
    getParent : function () {
        return isc.SCMultiWin.getParentWindow();
    },

    //> @method RemoteWindow.getWindow()
    // Returns the browser <code>window</code> object associated with this RemoteWindow.
    // @return (Object) browser window
    // @visibility external
    //<
    getWindow : function () {
        return this.webWindow;
    },

    //> @method RemoteWindow.getContainerWindow()
    // Returns the container window, if present, wrapping the browser window for this
    // RemoteWindow.  If OpenFin is present, this will return the associated OpenFin
    // +externalLink{https://cdn.openfin.co/docs/javascript/stable/Window.html,Window}.
    // @return (Object) OpenFin window
    // @visibility external
    //<
    getContainerWindow : function () {
        this.logWarn("browser window '" + this.getName() + "' has no container window");
        return null;
    },

    //> @method RemoteWindow.getPageWidth()
    // Get the width of the visible portion of the window, not including browser chrome or the
    // scrollbar area.
    // @return (number) width of the page
    // @visibility sgwt
    //<
    getPageWidth : function () {
        return isc.Page.getWidth();
    },

    //> @method RemoteWindow.getPageHeight()
    // Get the height of the visible portion of the window, not including browser chrome or the
    // scrollbar area.
    // @return (number) height of the page
    // @visibility sgwt
    //<
    getPageHeight : function () {
        return isc.Page.getHeight();
    },

    //> @method RemoteWindow.getBrowserWidth()
    // Get the width of the entire browser window, including browser chrome.
    // @return (number) width of the browser
    // @visibility sgwt
    //<
    getBrowserWidth : function () {
        return window.outerWidth;
    },

    //> @method RemoteWindow.getBrowserHeight()
    // Get the height of the entire browser window, including browser chrome.
    // @return (number) height of the browser
    // @visibility sgwt
    //<
    getBrowserHeight : function () {
        return window.outerHeight;
    },


    ////////////////////////////////////////////////////////////////////////////////
    // Abstraction of RemoteWindow inline and callback/errorCallback code patterns

    _handleInlineCallback : function (operation, callback, a, b, c) {
        var thisWindow = this.getWindow();

        switch(operation) {
        case "focus":
        case "blur":
            var parent = this.getParent();
            if (parent) {
                parent._handleProtectedChildOperation(thisWindow, operation, a, b, c);
                break;
            }
        default:
            thisWindow[operation](a, b, c);
        }

        if (callback) this.fireCallback(callback, "remoteWindow", [this]);
    },

    _handleInlineErrorCallback : function (errorCallback, errorLog, errorMessage) {
        if (errorCallback) {
            this.fireCallback(errorCallback, "remoteWindow,errorMessage",
                              [this, errorMessage]);
        }
        this.logWarn(errorLog.evalDynamicString(this, {windowName: this.getName(),
                                                       errorMessage: errorMessage}));
    },

    _handleProtectedChildOperation : function (childWindow, operation, a, b, c) {
        childWindow[operation](a, b, c);
    },


    _handlePromiseCallback : function (operation, callback, a, b, c) {
        var remoteWindow = this;
        this.getContainerWindow()[operation](a, b, c).then(function () {
            if (callback) remoteWindow.fireCallback(callback, "remoteWindow", [remoteWindow]);
        });
    },

    _handlePromiseCallbackWithValue : function (operation, callback, paramName, a, b, c) {
        
        var remoteWindow = this;
        this.getContainerWindow()[operation](a, b, c).then(function (returnValue) {
            remoteWindow.fireCallback(callback, ["remoteWindow", paramName].join(),
                                      [remoteWindow, returnValue]);
        });
    },

    _handlePromiseCallbacks : function (operation, callback, errorCallback, errorLog, a, b, c)
    {
        var _this = this;
        this.getContainerWindow()[operation](a, b, c).then(function () {
            if (callback) _this.fireCallback(callback, "remoteWindow", [_this]);
        }).catch(function (errorMessage) {
            if (errorCallback) {
                _this.fireCallback(errorCallback, "remoteWindow,errorMessage",
                                   [_this, errorMessage]);
            }
            _this.logWarn(errorLog.evalDynamicString(_this, {windowName: _this.getName(),
                                                             errorMessage: errorMessage}));
        });
    },


    //> @method RemoteWindow.close()
    // Closes this RemoteWindow.
    // @param [force] (boolean) whether to force it closed
    // @param [callback] (RemoteWindowCallback) callback run after it's closed
    // @visibility external
    //<
    close : function (force, callback) {
        this._handleInlineCallback("close", callback, force);
    },

    //> @method RemoteWindow.move()
    // Moves this RemoteWindow.
    // @param x (number) desired x-offset of left edge
    // @param y (number) desired y-offset of top edge
    // @param [callback] (RemoteWindowCallback) callback run after it's moved
    // @visibility external
    //<
    move : function (x, y, callback) {
        this._handleInlineCallback("moveTo", callback, x, y);
    },

    //> @method RemoteWindow.resize()
    // Resizes this RemoteWindow.
    // @param width (number) desired new width
    // @param height (number) desired new height
    // @param [callback] (RemoteWindowCallback) callback run after it's resized
    // @visibility external
    //<
    resize : function (width, height, callback) {
        this._handleInlineCallback("resizeTo", callback, width, height);
    },

    //> @method RemoteWindow.focus()
    // Focuses (activates) this RemoteWindow.
    // @param [callback] (RemoteWindowCallback) callback run after it's activated
    // @visibility external
    //<
    focus : function (callback) {
        this._handleInlineCallback("focus", callback);
    },

    //> @method RemoteWindow.activate()
    // @include RemoteWindow.focus()
    //<
    activate : function (callback) {
        this.focus(callback);
    },

    //> @method RemoteWindow.blur()
    // Blurs (deactivates) this RemoteWindow.
    // @param [callback] (RemoteWindowCallback) callback run after it's deactivated
    // @visibility external
    //<
    blur : function (callback) {
        this._handleInlineCallback("blur", callback);
    },

    //> @method RemoteWindow.deactivate()
    // @include RemoteWindow.blur()
    //<
    deactivate : function (callback) {
        this.blur(callback);
    },

    //> @method RemoteWindow.maximize()
    // Maximizes this RemoteWindow.
    // @param      [callback] (RemoteWindowCallback)      callback run after maximization
    // @param [errorCallback] (RemoteWindowErrorCallback) callback run if maximizing fails
    // @visibility external
    //<
    maximize : function (callback, errorCallback) {
        var _this = this, errorWrapper = function (errorMessage) {
            var errorLog = "unable to maximize window '${windowName}': ${errorMessage}";
            if (errorCallback) {
                _this.fireCallback(errorCallback, "remoteWindow,errorMessage",
                                   [_this, errorMessage]);
            }
            _this.logWarn(errorLog.evalDynamicString(_this, {windowName: _this.getName(),
                                                             errorMessage: errorMessage}));
        };

        var documentElement = document.documentElement;
        if (!documentElement.requestFullscreen) {
            errorWrapper("browser doesn't support maximizing");
            return;
        }
        documentElement.requestFullscreen().then(function () {
            if (callback) _this.fireCallback(callback, "remoteWindow", [_this]);
        }). catch (function (err) {
            errorWrapper(err.message);
        });
    },

    //> @method RemoteWindow.minimize()
    // Minimizes this RemoteWindow.
    // @param      [callback] (RemoteWindowCallback)      callback run after minimization
    // @param [errorCallback] (RemoteWindowErrorCallback) callback run if minimizing fails
    // @visibility external
    //<
    minimize : function (callback, errorCallback) {
        this._handleInlineErrorCallback(errorCallback,
            "unable to minimize window '${windowName}': ${errorMessage}",
                                        "minimizing unsupported");
    },

    //> @method RemoteWindow.restore()
    // Restores this RemoteWindow from being maximized or minimized.
    // @param      [callback] (RemoteWindowCallback)      callback run after restoration
    // @param [errorCallback] (RemoteWindowErrorCallback) callback run if restoring fails
    // @visibility external
    //<
    restore : function (callback, errorCallback) {
        var _this = this, errorWrapper = function (errorMessage) {
            var errorLog = "unable to restore window '${windowName}': ${errorMessage}";
            if (errorCallback) {
                _this.fireCallback(errorCallback, "remoteWindow,errorMessage",
                                   [_this, errorMessage]);
            }
            _this.logWarn(errorLog.evalDynamicString(_this, {windowName: _this.getName(),
                                                             errorMessage: errorMessage}));
        };

        var exitFullscreen = document.exitFullscreen;
        if (!exitFullscreen) {
            errorWrapper("browser doesn't support restoring");
            return;
        }
        exitFullscreen.bind(document)().then(function () {
            if (callback) _this.fireCallback(callback, "remoteWindow", [_this]);
        }). catch (function (err) {
            errorWrapper(err.message);
        });
    },

    //> @method RemoteWindow.hide()
    // Hides this RemoteWindow.
    // @param      [callback] (RemoteWindowCallback) callback run after hiding the window
    // @param [errorCallback] (RemoteWindowErrorCallback) callback run if hiding fails
    // @visibility external
    //<
    hide : function (callback, errorCallback) {
        this._handleInlineErrorCallback(errorCallback,
            "unable to hide window '${windowName}': ${errorMessage}", "hiding unsupported");
    },

    //> @method RemoteWindow.show()
    // Shows this RemoteWindow.
    // @param      [callback] (RemoteWindowCallback) callback run after showing the window
    // @param [errorCallback] (RemoteWindowErrorCallback) callback run if showing fails
    // @visibility external
    //<
    show : function (force, callback, errorCallback) {
        this._handleInlineErrorCallback(errorCallback,
            "unable to show window '${windowName}': ${errorMessage}", "showing unsupported");
    },

    //> @method RemoteWindow.bringToFront()
    // Brings this RemoteWindow to the front in window stacking order.
    // @param      [callback] (RemoteWindowCallback) callback run after raising window
    // @param [errorCallback] (RemoteWindowErrorCallback) callback run if raising fails
    // @visibility external
    //<
    bringToFront : function (callback, errorCallback) {
        var actionWindow, errorMessage = "bringing window to front is unsupported";

        if (isc.Browser.isSafari) {
            var baseMultiWindow = isc.SCMultiWin.getBaseMultiWindow();
            if (baseMultiWindow) {
                actionWindow = baseMultiWindow == this ? this.getOtherWindows().first() :
                               baseMultiWindow.getLocalWindow();
            } else errorMessage = "only one window";
        }

        if (actionWindow) {
            actionWindow.getWindow().open("", window.name);
            if (callback) this.fireCallback(callback, "remoteWindow", [this]);
        } else {
            this._handleInlineErrorCallback(errorCallback,
                "unable to bring window '${windowName}' to front: ${errorMessage}",
                                            errorMessage);
        }
    },

    //> @method RemoteWindow.isShowing()
    // Checks whether this RemoteWindow is showing.
    // @param callback (RemoteWindowBooleanCallback) callback to receive output
    // @visibility external
    //<
    isShowing : function (callback) {
        this.fireCallback(callback, "remoteWindow,result", [this, true]);
    },

    //> @method RemoteWindow.getInfo()
    // Checks whether this RemoteWindow is showing.
    // @param callback (RemoteWindowMapCallback) callback to receive output
    // @visibility external
    //<
    getInfo : function (callback) {
        this.fireCallback(callback, "remoteWindow,result", [this, true]);
    },

    //> @method Remotewindow.otherWindowsChanged()
    // @include MultiWindow.otherWindowsChanged()
    // @visibility sgwt
    //<
    otherWindowsChanged : function (otherWindows) {
    }

});

isc.SCMultiWin.registerClassProperties(window.isc_multiWindowSettings);


isc.MultiWindow = isc.SCMultiWin;

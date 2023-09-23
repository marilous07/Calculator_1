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
isc.defineClass("DebugTarget", "MessagingDMIServer").addProperties({

allowUnrestrictedCallTarget: true,

discoverableOnChannel: "isc_DebugTarget",

socketDefaults: {    
    doNotTrackRPC: true,
    isRemoteDebug: true   
},
discoverySocketDefaults: {
    doNotTrackRPC: true,
    isRemoteDebug: true   
},

getGUID : function (callback) {
    if (!this.GUID) {
        // special handling - whenever the page is reloaded, the DebugTarget obtains a new
        // GUID.  This is bad for us because we'll end up showing duplicate entires in our
        // list of available remotes.
        // 
        // To deal with this, we store the generated GUID in a cookie for this page specifically
        // and reuse it.  This also allows us to re-use the comm channel the master is already
        // using to talk to us.
        //
        // Also: per URL so that navigating to a different remoteDebug-enabled page does not
        // cause us to auto-rebind with the same GUID there and effectively have multiple logs
        // going to the same log window.
        var GUID = isc.LogViewer.getGlobalLogCookieValue("isc_pageGUID");
        var URL = isc.LogViewer.getGlobalLogCookieValue("isc_pageURL");
        if (!GUID || URL != location.href) {
            var _this = this;
            this.Super("getGUID", [function (GUID) {
                _this.GUID = GUID;
                isc.LogViewer.setGlobalLogCookieValue("isc_pageURL", location.href);
                isc.LogViewer.setGlobalLogCookieValue("isc_pageGUID", _this.GUID);
                _this.fireCallback(callback, "GUID", [_this.GUID]);
            }], arguments);
            return;
        } else {
            this.GUID = GUID;
        }
    }

    this.fireCallback(callback, "GUID", [this.GUID]);
},

sendTargetAvailableNotify : function () {
    this.socket.send("isc_DebugMaster", {
        methodName: "targetAvailable", 
        args: [this.getServerProperties()]
    });
},

getServerProperties : function () {
    var formFactor = "Desktop";
    if (isc.Browser.isTablet) formFactor = "Tablet";
    else if (isc.Browser.isHandset) formFactor = "Handset";

    return isc.addProperties(this.Super("getServerProperties", arguments), {
        // supply this additional context to distinguish the available servers from each other
        userAgent: navigator.userAgent, 
        documentTitle: document.title,
        URL: location.href,
        formFactor: formFactor,
        browserVersion: isc.Browser.version,
        browserMinorVersion: isc.Browser.minorVersion
    });
},

pushRPCUpdate : function (transaction) {
    if (!isc.debugMaster) return;

    var transactionRecord = isc.RPCManager.convertToTransactionRecord(transaction);

    isc.debugMaster.call("isc.RPCTracker.updateTransactionRecord", [transactionRecord]);
    transaction.pushedToDebugMaster = true;
},

getTransactionRecord : function (transactionNum, callback) {
    if (!isc.debugMaster) {
        if (callback) callback();
        return;
    }

    isc.debugMaster.call("isc.RPCTracker.getTransactionRecord", [transactionNum], callback);
},


// Moved to RPCManager, August 2023
getShallowData : function (object) {
    return isc.RPCManager.getShallowData(object);
},

_$count : "count",
//_staticFormUpdates: 0,
updateStats : function (stat) {
    if (!isc.debugMaster) return;

    // don't update stats during timeExpression() runs
    if (isc._timingRun) return;

    //this._staticFormUpdates++;

    var canvas = isc.Canvas;
    var value, values;
    if (stat == null) {
        // push all stats (initial debug enable)
        var targetIsc = isc,
            canvas = targetIsc.Canvas,
            stats = canvas._stats,
            lastTarget = targetIsc.EH.lastTarget,
            
            focusTarget = targetIsc.EH.getFocusCanvas()
        ;

        // Note: copied from developerConsole targetsDisplay.grabValues - at this point we can
        // probably just move that code here...
        values = {
            draws : stats.draws,
            clears : stats.clears,
            redraws : stats.redraws,
            destroys : stats.destroys,
            count : canvas._canvasList.length - canvas._iscInternalCount,
            currentCanvas : lastTarget != null ? lastTarget.getID() : "",
            currentFocusCanvas : focusTarget != null ? focusTarget.getID() : ""
           
        }   
    } else if (stat == this._$count) {
        value = canvas._canvasList.length - canvas._iscInternalCount;

    } else if (stat) {
        value = canvas._stats[stat];
    }        

    if (values) {
        isc.debugMaster.call("countsDisplay.setValues", [values]);
    } else {
        // push single stat
        isc.debugMaster.call("countsDisplay.setValue", [stat, value]);
    }
},

displayEventTarget : function () {
    if (!isc.debugMaster) return;

    var targetID = isc.EH.lastTarget && isc.EH.lastTarget.getID ? isc.EH.lastTarget.getID() : "";
    if (targetID == this._currentTarget) return;
    this._currentTarget = targetID;

    isc.debugMaster.call("targetsDisplayEventHandler.setValue", ["currentCanvas", targetID]);

    var nativeTarget = isc.EH.lastEvent.nativeTarget;
    var nativeID = (nativeTarget? (nativeTarget.id || nativeTarget.ID || nativeTarget.tagName) : 'none')        

    isc.debugMaster.call("targetsDisplayEventHandler.setValue", ["nativeTarget", nativeID]);
},
displayFocusTarget : function () {
    if (!isc.debugMaster) return;

    var target = isc.EH.getFocusCanvas(),
        targetID = target ? target.getID() : "";
    if (targetID == this._currentFocusTarget) return;
    this._currentFocusTarget = targetID;

    isc.debugMaster.call("targetsDisplayEventHandler.setValue", ["currentFocusCanvas", targetID]);
},
displayMouseDownTarget : function () {
    if (!isc.debugMaster) return;

    var target = isc.EH.mouseDownEvent.target,
        targetID = target ? target.getID() : "";

    isc.debugMaster.call("targetsDisplayEventHandler.setValue", ["lastMouseDown", targetID]);
    if (isc.AutoTest != null && isc.Log.showLocatorOnMouseDown) {
        var autoTestLocator = isc.AutoTest.getLocatorForDeveloperConsole();
        isc.debugMaster.call("targetsDisplayEventHandler.setValue", ["autoTestLocator", autoTestLocator || "none"]);
    }
},





// Debug establish APIs
// ============================================================================================
showFocus : function () {
    isc.DebugFocus.showFocus();
},
clearFocus : function () {
    isc.DebugFocus.clearFocus();
},

debugDisable : function (callback) {
    if (isc.debugMaster) {
        isc.debugMaster.disconnect();
        
        this.ignore(isc.Log, "addToMasterLog");
        this.ignore(isc.EventHandler, "getEventTargetCanvas");
        this.ignore(isc.EventHandler, "_focusInCanvas");
        this.ignore(isc.EventHandler, "doHandleMouseDown");

        isc.debugMaster = null;
    }
    if (callback) callback();
},

debugEnable : function (masterServerConfig, callback) {
    // disconnect from any current master          
    var _this = this;
    this.debugDisable();
    var debugMaster = isc.MessagingDMIClient.create({
        socketProperties: {
            doNotTrackRPC: true,
            isRemoteDebug: true               
        }
    });        
    
    if (masterServerConfig == null) {
        // direct binding - reach into the log window and grab the debugMaster instance directly
        masterServerConfig = isc.Log.logViewer._logWindow.debugMaster;
    }

    debugMaster.connect(masterServerConfig, function () {
        // We want to send all messages cached so far to the new master, but this is a
        // little tricky because as soon as isc.RemoteDebug.debugMaster is set, any logs
        // will be automatically sent to that debugMaster which means there's a potential
        // out of order problem wherein isc.Log remotely streams some messages to the new
        // master before our cache dump arrives there.
        //
            
        // First call back so the DeveloperConsole can set flags that it is working remote
        if (callback) _this.fireCallback(callback, "props", [_this.getProps()]);
            
        // we are about to send the log cache - clear the log first
        debugMaster.call("clearLog");

        // then send the current log cache to the server
        // XXX break these up into smaller chunks to avoid exceeding max post size?
        debugMaster.call("addToLog", [isc.Log.getMessages()]);

        // now set the global flag that will copy messages to the remote master - do this
        // after the addToLog call above so there's no chance of log messages arriving out
        // of order
        isc.debugMaster = debugMaster;

        // push current stats to the targetsDisplay
        _this.updateStats();

        if (isc.RPCManager) isc.RPCManager.pushBufferedTransactionsToDebugMaster();
        // push latest xmlResponses
        if (isc.xml && isc.xml.xmlResponses) {
            debugMaster.call("window.updateCommWatcher", [isc.xml.xmlResponses]);
        }
            
        // careful: clear observations in debugDisable() above!
        _this.observe(isc.Log, "addToMasterLog", "isc.Log.logViewer.addToLog(message)");
        _this.observe(isc.EventHandler, "getEventTargetCanvas", "observer.displayEventTarget()");
        _this.observe(isc.EventHandler, "_focusInCanvas", "observer.displayFocusTarget()");
        _this.observe(isc.EventHandler, "doHandleMouseDown", "observer.displayMouseDownTarget()");
    });
},

// various pieces of the Developer Console need to check for flags on the page that has the
// debugTarget.  Rather than make individual calls for every single property, we return some
// commonly used or those that are convenient to access in a one shot property block that gets
// applied directly to the debugTarget object on in the DeveloperConsole.
getProps : function () {
    // these are applied directly to the debugTarget object on remote for easy access
    var globalLogCookie = this.getGlobalLogCookie();
    if (!globalLogCookie) globalLogCookie = {};

    var props = {
        isc_version: isc.version,
        isc_Browser_isIE: isc.Browser.isIE,
        isc_Browser_isMoz: isc.Browser.isMoz,
        isc_Browser_isSGWT: isc.Browser.isSGWT,
        isc_RPCManager: isc.RPCManager != null,
        isc_AutoTest: isc.AutoTest != null,
        isc_Log_showLocatorOnMouseDown: isc.Log.showLocatorOnMouseDown,
        isc_xml: isc.xml != null,
        globalLogCookie: globalLogCookie,

        // for nativeMozStackButton
        _includeOriginalMozStack: window._includeOriginalMozStack,

        // for remoteControlLogs button
        _remoteControlEnabled: isc.Log.logViewer._remoteControlEnabled
    };
    return props;
},

// Results Tab APIs
// ============================================================================================
evalJSWithDevConsoleVars : function (expression, evalVars, delayed) {
    // note: the call to logViewer.evaluate() will generate a log message with the result that
    // will be pushed to the debugMaster
    
    // resolve watchedId to a 'watched' widget instance for DeveloperConsole doEval() support
    // of the watch tab
    // make sure "watched" always has a Canvas value, which is nice so evals don't crash
    var watched = isc.Canvas._canvasList[0];
    watched = window[evalVars.watchedId];


    // patch on evalVars that cannot be passed from the DevConsole - such as functions etc.
    isc.addProperties(evalVars, {
        watched: watched,

        time : function (object, method) {
            isc.Log.timeMethod(object, method);
        },
        trace : function (object, method) {
            isc.Log.traceMethod(object, method);
        },
        traceCall : function (object, method) {
            // trace method calls, but with a call trace, not a stack trace
            isc.Log.traceMethod(object, method, true);
        },
        timeExpression : function (expression, setupCode, iterations) { 
            isc.Log.timeExpression(expression, setupCode, iterations); 
        },
        log : function (message, category) { 
            return isc.Log.logWarn.call(isc.Log, message, category); 
        },
        echo : function (obj) { return isc.Log.echo(obj); },
        echoAll : function (obj) { return isc.Log.echoAll(obj); },
        echoFull : function (obj) { return isc.Log.echoFull(obj); }        
    });



    
    if (delayed) {
        isc.Log.logViewer.delayCall("evaluate", [expression, evalVars], 3000);
    } else {
        isc.Log.logViewer.evaluate(expression, evalVars);
    }
},


// Evaluate XML section
//--------------------------

browserEvalXML : function (xmlData) {
    if (isc.DS.get("Canvas") == null) {
        isc.Log.logWarn("Browser eval XML: couldn't find schema for Canvas, please load it using"
                       +" the <isomorphic:loadSystemSchema/> jsp tag");
    }
    isc.XMLTools.toComponents(xmlData);
},


browserXMLToJS : function (xmlData) {
    if (isc.DS.get("Canvas") == null) {
        isc.Log.logWarn("Browser eval XML: couldn't find schema for Canvas, please load it using"
                       +" the <isomorphic:loadSystemSchema/> jsp tag");
    }
    var jsObj = isc.XMLTools.toComponents(xmlData, {propertiesOnly: true});
    isc.Log.logInfo("Browser xmlToJS: \n\n" + isc.echoFull(jsObj));
},

literalTextAsCanvasContents : function (literalText) {
    isc.Canvas.create({
        ID:"literalHTMLCanvas",
        autoDraw:true,
        contents:literalText,
        backgroundColor:"gray"
    })
    window.literalHTMLCanvas.bringToFront();
},

getVersionCanvasContents : function (callback) {
    // use non-breaking-spaces everywhere, except right before "License" so it breaks there
    // if forced to wrap
    var str = "SmartClient&nbsp;Version:&nbsp;<b>${isc.version}</b>&nbsp;";
    // customer SDKs won't have these vars which come from the 'license' db table, so don't
    // add them to the string.
    if (["Eval", "PNC", "IDev"].contains(isc.licenseType)) {
        if (isc.licenseType == "Eval") {
            str += "(expires&nbsp;${isc.expirationDate})";
        } else {
            str += "(built&nbsp;${isc.buildDate})";
        }

        str += " Licensed&nbsp;to:&nbsp;${isc.licenseCompany}&nbsp;(#${isc.licenseSerialNumber})";
    } else {
        str += "(built&nbsp;${isc.buildDate})";
    }
    callback(str.evalDynamicString(this));
},

toggleRuler : function () {
    if (window.isc_dev_ruler) {
        window.isc_dev_ruler.destroy();
        return;
    }
    isc.Canvas.create({
        ID:"isc_dev_ruler",
        // 5px offset makes it more obvious in case entire page background is grid.gif            
        left:isc.Page.getScrollLeft() + 5, 
        top:isc.Page.getScrollTop() + 5, 
        overflow:"hidden",
        canDragResize:true,
        dragAppearance: "target",
        canDragReposition:true,
        backgroundImage:"[SKIN]/grid.gif",
        // grid is no longer available in some skins (including the default)
        backgroundColor:"powderBlue",
        opacity:75,
        moved : function () { this.markForRedraw(); },
        getInnerHTML : function () {
             var size = this.getWidth() + "w x " + this.getHeight() + "h<br>at: "+this.getPageLeft()+","+this.getPageTop();
             return "<span title='" + size + "'>" + size + "</span>";
        },
        // Draw even if everything else is auto-draw false
        autoDraw:true
    });
    window.isc_dev_ruler.bringToFront();
},




// get a set of records describing all the Canvii in the page
getCanvasList : function (showGenerated, showUndrawn, showHidden, callback) {
    var canvasList = isc.Canvas._canvasList,
        canvasData = [],
        nodeIndex = {};

    //isc.Log.logWarn("generating canvas list: " + showGenerated);

    
    var sizeTemplate = [ , "w x ", , "h"];
    var positionTemplate = [ , ", "];
    for (var i = 0; i < canvasList.length; i++) {
        var canvas = canvasList[i];

        if (isc.Page._eT == canvas) continue;
        else if (isc.Log._hiliteCanvas == canvas) continue;
        else if (!showHidden && !canvas.isVisible()) continue;
        else if (!showUndrawn && !canvas.isDrawn()) continue;
        else if (canvas._generated && !showGenerated) continue;

        var canvasItem = {
            id: canvas.getID(),
            theClass: canvas.Class,
            drawn: canvas.isDrawn(),
            visible: canvas.isVisible(),
            zIndex: canvas.getZIndex(),
            pageLeft: canvas.getPageLeft(),
            pageTop: canvas.getPageTop(),
            overflow: canvas.overflow,
            // NOTE: because generated components may or may not be shown, we can't determine
            // parent status until we've found a child or peer that will be shown. 
            hasChildren : nodeIndex[canvas.getID()]
        };
        sizeTemplate[0] = canvas.getWidth();
        sizeTemplate[2] = canvas.getHeight();
        canvasItem.size = sizeTemplate.join(isc.emptyString);

        sizeTemplate[0] = canvas.getVisibleWidth();
        sizeTemplate[2] = canvas.getVisibleHeight();
        canvasItem.drawnSize = sizeTemplate.join(isc.emptyString);

        // frequent crasher
        try {
            positionTemplate[0] = canvasItem.pageLeft;
            positionTemplate[2] = canvasItem.pageTop;
            canvasItem.position = positionTemplate.join(isc.emptyString);
            // trees do not yet support multi-column sort, so combine left/top into a single
            // int value where left takes precedence
            canvasItem.positionSortField = canvasItem.pageLeft*100000+canvasItem.pageTop;
        } catch (e) {
            canvasItem.position = "Error: " + e;
        }
        var treeParent = canvas;
        while (treeParent && (treeParent.masterElement || treeParent.parentElement)) {
            // create a synthetic parent pointer that shows peers as children of their master
            
            treeParent = (treeParent.masterElement || treeParent.parentElement);
            // if we are skipping generated components, skip past generated masters and parents
            // to find the next non-generated master, so we don't orphan non-generated children
            if (showGenerated || !treeParent._generated) break;
        }
        if (treeParent != canvas) {
            // mark our the item for our parent, or if no item exists for our parent yet, leave
            // a marker for it
            var parentItem = nodeIndex[treeParent.getID()];
            if (parentItem) parentItem.hasChildren = true;
            else nodeIndex[treeParent.getID()] = true;

            canvasItem.treeParentId = treeParent.ID;
        }
        nodeIndex[canvas.ID] = canvasItem;
        canvasData.add(canvasItem);
    }
    

    //isc.Log.logWarn("treeParents: " + canvasData.getProperty("treeParentId"));

    callback(canvasData);
},

measureGC : function () {
    isc.debugMaster.call("addToLog", ["GC Time: " + isc.Log.getGCTime().toFixed(2) + "ms"]);
},


// -------------------------------------------------------
// Updating log categories' logging priorities on the fly:

// synthetic log categories of broad interest
// ******************* NOTE: this order is the order the categories appear in the drop-down
// menu.  So put likely to be used stuff first, and try to preserve logical grouping
DEFAULT_CATEGORIES: [
    // sizing / clipping / layout
    // ---------------------------------------------------------------------------------------
    {name:"layout", description:"Logs from Layout and Stack about members and layout policy."},
    {name:"sizing", description:"Reporting drawn sizes"},
    {name:"scrolling", description:"Detecting the need for scrolling and custom scrollbars"},
    {name:"animation", description:"Animation logs"},
    // form-specific layout
    

    // comm and databinding
    // ---------------------------------------------------------------------------------------
    {name:"RPCManager", description:"RPC and DataSource requests and responses"},
    {name:"RPCManagerResponse", description:"Enable logging of full length RPC responses (can be slow)"},
    // XML-related
    {name:"xmlComm", description:"Inbound and outbound XML messages"},
    {name:"xmlSelect", description:"XPath expressions and their results"},
    {name:"xmlBinding", description:"DataSource and WebService XML request/response handling"},
    {name:"xmlToJS", description:"XML to JavaScript translation in databinding"},
    
    {name:"ResultSet", description:"Load on demand and cache update management for ListGrids"},
    {name:"ResultTree", description:"Load on demand for TreeGrids"},
    {name:"FileLoader", description:"Background download and caching of files"},
    {name:"fetchTrace", description:"Shows a stack trace for all fetches initiated through a ResultSet"},

    // events
    // ---------------------------------------------------------------------------------------
    {name:"dragDrop", description:"Drag and drop related logs"},
    {name:"EventHandler", description:"Mouse and keyboard events, bubbling, cancellation"},
    {name:"visualState", description:"Visual state transitions for buttons, bars, and other stateful widgets"},
    

    // other
    // ---------------------------------------------------------------------------------------
    {name:"RpcTabTiming", description:"Show detailed timing data for RPC/DSRequests in the RPC tab"},
    {name:"gridEdit", description:"Inline editing in grids"},
    {name:"fontLoading", description:"Force loading of declared CSS custom fonts"},

    {name:"Page", description:"Page-wide events"},
    {name:"loadTime", description:"ISC load / parse time"},

    // Rules engine and derivatives
    {name:"rulesEngine", description:"Processing of generic rules"},
    {name:"whenRules", description:"*When rules creation and processing (i.e. visibleWhen, requiredWhen, etc.)"},
    {name:"dynamicCriteria", description:"Dynamic Criteria evaluations"},
    {name:"dynamicProperties", description:"Dynamic Property creation and rules processing"},
    {name:"ruleContext", description:"Population of ruleContext"},

    {name:"dataContext", description:"Binding a DBC to a DataContext (i.e. Screen Inputs)"},

    // crude application metrics
    {name:"redraws", description:"Logging of redraw()s and reasons for them"},
    {name:"redrawTrace", description:"Logs a stack trace for every redraw when both 'redraws' "
                                    + "and 'redrawTrace' are set to debug priority" },
    {name:"clears", description:"Logs all clear()s"},
    {name:"destroys", description:"Logs all destroy()s"},
    {name:"draws", description:"All component draws"},
    {name:"resize", description:"Resizes of drawn components"},
    

    // Selenium
    {name:"testReplay", description:"Details of why Selenium commands are failing during playback"},

    // key widgets
    {name:"DynamicForm"},
    {name:"ListGrid"},
    {name:"TreeGrid"},
    {name:"CubeGrid"},
    {name:"Hover"},

    // from here down are categories that exist for very narrow debugging purposes    

    

    // notifications for deprecated attributes [typically logged at the info level]
    {name:"deprecated", description:"Notify when deprecated attributes are used"}

],                        


getDefaultLogCategories : function () {
    return this.DEFAULT_CATEGORIES.getProperty("name");
},

// Function to get the current log priority categories from the logPriority map
// Will always include 'DEFAULT_CATEGORIES' map as well as anything that has been set in the
// window.
getLogCategories : function (objectId, callback) {
    // categories we always want to show
    var categories = this.getDefaultLogCategories();

    // getLogPriorities returns a category -> priority map for all categories that have an
    // explicitly set priority
    var fullMap = isc.Log.getLogPriorities(objectId);
    
    // combine the two into a list 
    for (var categoryName in fullMap) {
        if (categories.contains(categoryName)) continue;
        categories[categories.length] = categoryName;
    }

    // support being called remotely and locally
    if (callback) isc.Class.fireCallback(callback, "categories", [categories]);
    return categories;
},


// grab the logCategories and turn them into a set of records suitable for ListGrid display
getLogCategoryData : function (objectId, callback) {
    var overrides = (objectId ? isc.Log.getLogPriorities(objectId, true) : null),
        categories = this.getLogCategories(objectId),
        log = isc.Log
    ;
    var categoryData = [],
        defaultPriority;
        
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        if (objectId) {
            if (category == isc.Log._allCategories) continue;
            else if (category == isc.Log._default) {
                defaultPriority = window[objectId].getDefaultLogPriority();
                continue;
            }
        }
        
        var explicitPriority = log.getPriority(category, objectId);
        
        var defaultCategoryIndex = this.DEFAULT_CATEGORIES.findIndex("name", category);
        var description;
        if (defaultCategoryIndex != -1) description = this.DEFAULT_CATEGORIES[defaultCategoryIndex].description;

        categoryData.add({
            category:category,
            description: description,
            priority:explicitPriority || log.defaultPriority,
            custom:overrides && overrides[category]!=null
        });
    }
    categoryData.add({
        category:"[default]",
        priority:(defaultPriority || log.defaultPriority),
        custom:(defaultPriority ? true : false)
        
    });
    this.fireCallback(callback, "categoryData", [categoryData]);
},



generateLogMenuItems : function (componentId, numberOfCategories, callback) {
    var categories = this.getLogCategories(),
        componentMenuItems = [],
        menuItems = []
    ;

    // Don't show more menu items than will fit comfortably        
    var maxItemsLeft = Math.min(categories.length, numberOfCategories);
    for (var i = 0; i < maxItemsLeft; i++) {
        var category = categories[i];

        var currentPriority = isc.Log.getPriority(category, componentId);
        if (currentPriority == null) currentPriority = isc.Log.getDefaultPriority();

        menuItems.add({title:category,
                       selectedLevel: currentPriority,
                       category:category,
                       addPrioritiesSubmenu: true,
                       enableIf:"menu.allCategoriesOverride() == null"})
    }

    menuItems.add({isSeparator:true});
    menuItems.add({title:"[default]", category:"_default",  addPrioritiesSubmenu: true,
                        selectedLevel: isc.Log.getDefaultPriority(componentId),
                        enableIf:"menu.allCategoriesOverride() == null"})
    
    menuItems.add({title:"More...", click: "menu.setCustomLogPriorities()"});
    
    componentMenuItems = menuItems.duplicate(); 
    
    menuItems = componentId != null ? componentMenuItems : menuItems;
    for (var i = 0; i < menuItems.length; i++) {
        var menuItem = menuItems[i],
            category = menuItem.category;

        if (category) {
            // hilite categories with a setting higher than WARN
            //log.logWarn("category: " + category + ", priority: " + priority);
            var priority = isc.Log.getPriority(category, componentId),
                cssText = (priority > isc.Log.WARN ? "color:blue;" : null)
            ;
            if (cssText != menuItem.cssText) {
                menuItem.cssText = cssText;
            }
        }
    }
    this.fireCallback(callback, "menuItems", [menuItems]);
},


// read global log cookie, adding some default stored state
getGlobalLogCookie : function (callback) {
    var globalLogCookie = isc.LogViewer.getGlobalLogCookie();
    if (globalLogCookie == null) globalLogCookie = {};    

    // log priorities also must be stored in the global log cookie because these are consulted
    // for log threshold during framework init
    globalLogCookie.priorityDefaults = isc.Log.getLogPriorities();
    globalLogCookie.defaultPriority = isc.Log.defaultPriority;
    

    if (callback) this.fireCallback(callback, "globalLogCookie", [globalLogCookie]);
    return globalLogCookie;
},

// note: not listed in visibleMethods by default
set : function (lValue, value, callback) {
    //!OBFUSCATEOK
    var lValue = isc.Class.globalEvalWithCapture(lValue+"="+value);
    if (callback) this.fireCallback(callback, "lValue", [eval(lValue)]);
},
// note: not listed in visibleMethods by default
get : function (propertyName, callback) {
    //!OBFUSCATEOK
    this.fireCallback(callback, "value", [eval(propertyName)]);
}



});





isc.defineClass("DebugFocus").addClassProperties({

// If we do not hear a heartbeat from the developer console for this long, hide the focus
///
// this is set to be 1750ms longer than the heartbeat from the developer console to account for
// possible network latency.  Amazingly, 500ms was not enough on android (Nexus 7,
// specifically) - possibly because of native clock quantization?
//
// It's ok for this delay to be pretty long because we do explicitly cancel the focus effect
// when the focus moves on to a different remote, but there may be uncaught cases where the
// clearFocus() call never arrives (e.g. DevConsole reloaded, network disconnected etc), so it
// is good to auto-cancel due to lack of heartbeat.
hideTimeout: 2000,

opacityMax: 75,
opacityMin: 50,
oscillationFrequency: 2000,

showFocus : function () {
    if (this._focusCanvas && this._focusCanvas.isVisible()) {
        // keep alive
        this.clearHideTimer();
        this.setHideTimer();
        return;
    }

    // create and cache the canvas we're going to use to show the focus
    if (!this._focusCanvas) {
        this._focusCanvas = isc.Canvas.create({
            width: "100%",
            height: "100%",
            overflow: "hidden",
            backgroundColor: "#4169E1",
            
            hideUsingDisplayNone: true
        });
    }
    var fc = this._focusCanvas;

    // reset opacity 
    fc.setOpacity(this.opacityMin);

    // draw offscreen
    fc.show();

    // make sure it's in front of everything else
    fc.bringToFront();

    this.setHideTimer();
    this.startFadeInAnimation();
},
clearFocus : function () {
    this.clearHideTimer();
    this.hideFocus();
},

startFadeOutAnimation : function () {
    this._focusCanvas.cancelAnimation(this.fadeAnimationID);
    this.fadeAnimationID = this._focusCanvas.animateFade(this.opacityMin,
        "isc.DebugFocus.startFadeInAnimation()", this.oscillationFrequency/2, "smoothStart");
},

startFadeInAnimation : function () {
    this._focusCanvas.cancelAnimation(this.fadeAnimationID);
    this.fadeAnimationID = this._focusCanvas.animateFade(this.opacityMax, 
        "isc.DebugFocus.startFadeOutAnimation()", this.oscillationFrequency/2, "smoothStart");
},

hideFocus : function () {
    if (this._focusCanvas != null) {
        this._focusCanvas.cancelAnimation(this.fadeAnimationID);
        this._focusCanvas.hide();
    }
},

clearHideTimer : function () {
    if (this._hideTimer != null) {
        isc.Timer.clearTimeout(this._hideTimer);
        delete this._hideTimer;
    }
},

setHideTimer : function () {
    this._hideTimer = isc.Timer.setTimeout("isc.DebugFocus.hideFocus()", this.hideTimeout);
}

});


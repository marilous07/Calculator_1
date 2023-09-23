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
//>	@class	ScreenLoader
//
// The ScreenLoader component can be used to load
// +link{group:componentXML,ComponentXML Screens} into a running application.
// <P>
// A ScreenLoader is a VLayout, and can be provided anywhere a Canvas can be used: as a Tab
// pane, and Layout member, etc.  When a ScreenLoader draws, it shows a
// +link{screenLoader.loadingMessage,loading message} if
// +link{screenLoader.showLoadingMessage,enabled}, performs an RPC to the
// +link{RPCManager.screenLoaderURL,screenLoaderURL} to load the screen, if necessary, and
// finally embeds the +link{screenLoader.screenName,screen} within the layout.
// <P>
// The last top-level UI component (Canvas subclass) defined by the screen is set as the
// layout contents.
// Top-level in this case means that the UI component is not contained in another UI component
// as a member or child.
// <p>
// The ScreenLoader relies on the XMLHttpRequest object which can be disabled by end-users in some
// supported browsers.  See +link{group:platformDependencies} for more information.
// 
// @inheritsFrom VLayout
// @treeLocation Client Reference/Foundation
// @visibility external
//<


isc.ClassFactory.defineClass("ScreenLoader", isc.VLayout);

isc.ScreenLoader.addClassMethods({
    errorScreenNotFound: "No such screen",
    errorScreenLoadFailed: "Screen loading failed",

    loadScreen : function (screenName, callback, settings) {
        if (isc.RPC.isScreenCached(screenName)) {
            this.fireCallback(callback);
        } else {
            isc.RPC.cacheScreens(screenName,  function (jsonData, rpcResponse) {
                
                // if (rpcResponse.status != isc.RPCResponse.STATUS_SUCCESS) {
                //     return this.showError(this.errorScreenLoadFailed);
                // }

                // If the screen is not found we receive an empty array of json data and a
                // successful response
                if (isc.isAn.Array(jsonData) && jsonData.length == 0 && rpcResponse.status == isc.RPCResponse.STATUS_SUCCESS) {
                    return this.fireCallback(callback, "error", [this.errorScreenNotFound]);
                }

                this.fireCallback(callback);
            }, null, settings);
        }
    },

    createScreen : function (screenName) {
        var settings = { suppressAutoDraw: true };
        return isc.RPC.createScreen(screenName, settings)
    }
});

isc.ScreenLoader.addProperties({

//> @attr screenLoader.screenName (String : null : IR)
// Name of screen to be loaded.
// @visibility external
//<

//> @object DataContextBinding
//
// Identical to a +link{object:DataContext} but in addition to fixed values,
// +link{canvas.getRuleContext,ruleContext} values can be specified by prefixing the
// <code>ruleContext</code> path with <code>$ruleScope.</code> as shown below:
// <smartclient>
// <P>
// For example, in JavaScript:
// <pre>
//   {
//      "Customer": { customerNumber: "$ruleScope.customerGrid.values.customerNumber" }
//   }
// </pre>
// </smartclient>
// <smartgwt>
// <P>
// For example, in SmartGWT:
// <pre>
//   Record customerRecord = new Record();
//   customerRecord.setAttribute("customerNumber", "$ruleScope.customerGrid.values.customerNumber");
//
//   DataContext dataContext = new DataContext();
//   dataContext.addMapping("Customer", customerRecord);
// </pre>
// </smartgwt>
// <p>
// When used within a Workflow +link{SetScreenDataTask} or +link{AddScreenTask}, any
// applicable +link{group:taskInputExpression} can be used as a value.
// <p>
// To use a literal value that starts with one of the expressions described above, prefix
// the leading dollar sign ($) with a backslash (\) (ex. "\$ruleScope.goes.here") to prevent
// the value from being resolved as an expression.
//
// @treeLocation Client Reference/Foundation/Canvas
// @visibility external
//<

//> @attr screenLoader.dataContextBinding (DataContextBinding : null : IWR)
// A +link{DataContextBinding} to be applied to the loaded screen via
// +link{canvas.setDataContext()}.
//
// @setter setDataContextBinding
// @group dataContext
// @visibility external 
//<

//> @attr screenLoader.screenLoaderURL (URL : null : IR) 
// Specifies the URL where ScreenLoaderServlet is installed. If not set,
// +link{RPCManager.screenLoaderURL} is used.
//
// @visibility external
//<

//> @attr screenLoader.showLoadingMessage  (Boolean : false : IR)
// Should a +link{loadingMessage,loading message} be displayed while screen is loading?
//
// @visibility external
//<

//> @attr screenLoader.loadingMessage  (HTMLString : "Loading Screen...&nbsp;${loadingImage}" : IR)
// Message to show while the screen is loading if +link{showLoadingMessage,enabled}.
// Use <code>"&#36;{loadingImage}"</code> to include +link{Canvas.loadingImageSrc,a loading image}.
//
// @visibility external
//<
loadingMessage:"Loading Screen...&nbsp;${loadingImage}",

loadingLabelDefaults: {
    _constructor: isc.Label,
    height: 30,
    align: "center"
},

errorBorder: "1px solid red",
errorText: "Screen '${screenName}' could not be loaded",
errorTextColor: "red",

errorScreenNotFound: "No such screen",
errorScreenLoadFailed: "Screen loading failed",
errorScreenCrashed: "Screen crashed on creation",

errorLabelDefaults: {
    _constructor: isc.Label,
    height: 30,
    align: "center"
},

align: "center",

// so that we get allocated space in Layouts, instead of autoFitting
overflow:"hidden"
});

isc.ScreenLoader.addMethods({

initWidget : function () {
    this.Super(this._$initWidget, arguments);

    // show the loading message
    if (this.showLoadingMessage) this.showLoading();
},

destroy : function () {
    if (this.screen && this.isObserving(this.screen, "dataContextChanged")) {
        this.ignore(this.screen, "dataContextChanged");
    }
    this.Super("destroy", arguments);
},

//> @method screenLoader.setDataContextBinding()
// Set the dataContextBinding property.
// @param binding (DataContext) the new DataContext binding
// @group dataContext
// @visibility external
//<
setDataContextBinding : function (binding) {
    this.dataContextBinding = binding;
    this.applyDataContextBinding();
},

draw : function () {
    if (!this.readyToDraw()) return this;
    this.Super("draw", arguments);

    var screenName = this.screenName;
    if (!screenName) {
        this.logWarn("No screenName is provided to load");
        return this;
    }

    this.loadScreen();

    return this;
},

loadScreen : function () {
    if (this._loaded || this._loading) return;
    this._loading = true;

    var settings = (this.screenLoaderURL ? { actionURL: this.screenLoaderURL } : null),
        _this = this
    ;
    isc.ScreenLoader.loadScreen(this.screenName, function (error) {
        if (error) {
            _this.showError(error);
        } else {
            
            _this.delayCall("showScreen");
        }
        delete _this._loading;
        _this._loaded = true;
    }, settings);
},

showScreen : function () {
    var canvas;
    try {
        canvas = isc.ScreenLoader.createScreen(this.screenName);
    } catch (ex) {
        this.showError(this.errorScreenCrashed);
        return;
    }
    this.screen = canvas;
    this.observe(canvas, "dataContextChanged", "observer.screenDataContextChanged()");

    if (canvas) {
        this.applyDataContextBinding();
        this.setMembers([canvas]);
    }
},

showError : function (message) {
    // Make sure there are no members showing
    this.setMembers([]);

    // Set the border and show the error message
    this.setBorder(this.errorBorder);
    var errorText = "<span style='color: " + this.errorTextColor + "'>" +
                    this.errorText.evalDynamicString(this, { screenName: this.screenName }) +
                    "<p>" +
                    message +
                    "</span>";
    this.addAutoChild("errorLabel", { contents: errorText });
},

showLoading : function () {
    this.addAutoChild("loadingLabel", { contents: this.getLoadingMessage() });
},

getLoadingMessage : function () {
    return this.loadingMessage == null ? "&nbsp;" : this.loadingMessage.evalDynamicString(this, {
        loadingImage: this.imgHTML(isc.Canvas.loadingImageSrc, 
                                   isc.Canvas.loadingImageSize, 
                                   isc.Canvas.loadingImageSize)
        });
},

applyDataContextBinding : function () {
    var binding = this.dataContextBinding;
    if (this.screen && binding) {
        binding = this.resolveDataContextBinding(binding);
        this.screen.setDataContext(binding);
    }
},

resolveDataContextBinding : function (binding) {
    var dataContext,
        ruleContext = this.getRuleContext() || {}
    ;
    if (binding) {
        // binding is just a dataContext with possible dynamic values
        dataContext = isc.clone(binding);
        for (var dsName in dataContext) {
            var values = dataContext[dsName];
            for (var key in values) {
                var value = values[key];
                if (isc.isA.String(value)) {
                    if (value.startsWith("\\$")) {
                        values[key] = value.substring(1);
                    } else if (value.startsWith("$ruleScope.") || value.startsWith("$scope.")) {
                        var path = value.replace("$ruleScope.", "").replace("$scope.", ""),
                            component = this.getRuleScopeComponent()
                        ;
                        values[key] = isc.Canvas._getFieldValue(path, null, ruleContext, component);
                    }
                }
            }
        }
    }
    return dataContext;
},

screenDataContextChanged : function () {
    if (this.dataContextChanged) this.fireCallback(this.dataContextChanged);
}

});

isc.ScreenLoader.registerStringMethods({
    //> @method ScreenLoader.dataContextChanged()
    // Notification method fired when +link{dataContext} is bound on the embedded screen.
    // This can occur on the initial draw or by an explicit call to +link{setDataContext}
    // either via this ScreenLoader or from other components including the screen itself.
    // 
    // @group dataContext
    // @visibility external
    //<
    dataContextChanged:""
});

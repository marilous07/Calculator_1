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
//> @object PrintProperties
// Settings for generating printable HTML for components.
//
// @treeLocation Client Reference/System
// @group printing
// @visibility external
//<

//> @attr printProperties.omitControls (Array of String : null : IR)
// An array of Strings indicating the classNames of controls that should be omitted from
// printing.  By default, <code>omitControls</code> includes all button-based controls, menus
// and similar interactive controls that are typically useless in printed output.
// <P>
// All subclasses of the specified classes are also omitted.
// <P>
// See also +link{includeControls}.
//
// @group printing
// @visibility external
//<

//> @attr printProperties.includeControls (Array of String : null : IR)
// An array of Strings indicating the classNames of controls that should be specifically
// included when printing, even if a superclass is listed in +link{omitControls}.
//
// @group printing
// @visibility external
//<

//> @attr printProperties.printForExport (Boolean : null : IR)
// If true, generates HTML for export.
// <P>
// Some components, specifically +link{DrawPane} and +link{FacetChart} on IE8 and earlier, need to generate
// different HTML for export versus in-browser print preview. When using +link{RPCManager.exportContent()}
// the printForExport property is set to true automatically. If not using RPCManager.exportContent(),
// but the generated HTML will be sent for export, the <code>PrintProperties</code> passed to
// +link{Canvas.getPrintHTML()} must have printForExport:true.
//
// @group printing
// @visibility external
//<

//> @class PrintCanvas
// PrintCanvas is a subclass of canvas which renders printable content HTML and 
// provides APIs for printing this content as a separate document.
// @inheritsFrom Canvas
// @treeLocation Client Reference/System
// @visibility external
// @group printing
//<
isc.defineClass("PrintCanvas", "Canvas").addProperties({

redrawOnResize: false,
overflow: "hidden",

initWidget : function () {
    this.Super("initWidget", arguments);    
},


useExplicitHeight:isc.Browser.isSafari || 
                (isc.Browser.isFirefox && isc.Browser.isStrict && isc.Browser.geckoVersion >= 20100101),

resized : function () {
    if (this.useExplicitHeight) {
        var handle = this.getIFrameHandle();
        if (handle) {
            handle.style.width = this.getInnerWidth() + "px";
            handle.style.height = this.getInnerHeight() + "px";
        }
    }
},

getInnerHTML : function () {
    
    delete this.iframeLoaded;

    var width = "100%", height = "100%";
    if (this.useExplicitHeight) {
        width = this.getInnerWidth();
        height = this.getInnerHeight();
    }
    return "<iframe height='" + height + "' width='" + width + "' scrolling='auto' id='"
        + this.getIFrameID()+"'"+" frameborder='0'" +" src=\"" +this.getPrintFrameURL(this.title)+"\"></iframe>";
},

getIFrameID : function () {
    return this.getID()+"_frame";
},  

//> @attr printCanvas.printFrameURL (String : "[HELPERS]printFrame.html" : IRA)
// Location of the special printFrame html file provided as part of the SmartClient libraries.
// This file must be present at the specified location for the printCanvas printing APIs.
// @visibility external
//<
printFrameURL:"[HELPERS]printFrame.html",

//> @attr printCanvas.externalStylesheet (String : null : IRWA)
// Setting this property will cause the specified stylesheet to be loaded in this print
// canvas's frame.
// The stylesheet should be specified as a URL to load.
// @visibility external
//<
// no default setting

getPrintFrameURL : function (title) {
    var url = this.printFrameURL;
    // use "&" rather than "?" if there are already params in the printFrameURL
    url += (url.contains("?") ? "&" : "?");
    url += "id="+this.getID() + "&title=" + (escape(title) || "");

    // isc._printWithDensity can be set globally and applies every time - _printWithDensityThisTime
    // will apply density to just this call to getPrintFrameURL(), and is then cleared
    if (isc._printWithDensity || isc._printWithDensityThisTime) {
        url += "&applyDensity=1";
        delete isc._printWithDensityThisTime;
    }
    return isc.Page.getURL(url);
},

getIFrameHandle : function () {
    return document.getElementById(this.getIFrameID());
},

getIFrameWindow : function () {
    return this.getIFrameHandle().contentWindow;
},

iframeLoad : function () {
    this.iframeLoaded = true;
    
    // If we're RTL update the print IFRAME to be RTL as well.
    
    if (this.isRTL()) {
        this.logInfo("Print preview - applying 'rtl' direction to print frame.", "printing");
        var body = this.getIFrameWindow().document.body;
        if (body == null) {
            this.logWarn("Print preview - unable to get 'body' tag for print frame. " +
                         "Right-to-left text direction cannot be guaranteed in this print preview.",
                         "printing");
            
        } else {
            body.style.direction = "rtl";
        }
    }
    
    
    if (isc.Browser.isIE) {
        var body = this.getIFrameWindow().document.body;
        if (body) body.style.overflow = "auto";
    }

    // Update our HTML if setHTML() has been called.
    // This can occur
    // - if setHTML() was called before the iframe was available
    // - on a redraw() or clear()/draw() cycle after a successful setHTML()
    if (this._pendingHTMLContext != null) {
        var context = this._pendingHTMLContext;
        this.setHTML(context.HTML, context.callback);
    }
},

//> @method Callbacks.PrintCanvasCallback
// Callback executed when a +link{printCanvas.setHTML(),supplied html} is rendered into
// a printCanvas.
//
//@param printPreview (PrintCanvas) The canvas being printed.
//
//@visibility external
//<

//> @method printCanvas.setHTML()
// Update the HTML content displayed in this print canvas. If the printCanvas is not yet
// drawn the HTML will be displayed when the canvas is drawn.
// <P>
// Note that if the printCanvas is +link{canvas.redraw(),redrawn}, or 
// +link{canvas.clear(),cleared} and then +link{canvas.draw(),drawn} again, the HTML will
// be redisplayed inside the print canvas, and the specified callback will be fired again.
//
// @param HTML (String) HTML to show in this print canvas
// @param callback (PrintCanvasCallback) callback function to fire when the HTML is displayed. The
//  callback will be passed a pointer to this print canvas as the first parameter with the
//  name <code>printPreview</code>. If this canvas is not drawn when this method is called,
//  the callback will not be fired until the canvas is drawn and the HTML rendered out into
//  the page.
// @visibility external
//<
setHTML : function (HTML, callback) {
    // Remember the HTML and callback passed in.
    this._pendingHTMLContext = {
        HTML:HTML,
        callback:callback
    };
    // If we're undrawn, bail - we'll update the HTML and fire the callback
    if (!this.isDrawn() || !this.iframeLoaded) {
        return;
    }
    
    // If we are drawn, update the HTML and fire the callback now
    // note that we hang onto the HTML/callback so we can re-set and re-fire on
    // PrintCanvas.redraw() or clear()/draw()

    if (this.externalStylesheet) {
        var stylesheetHTML = '<link rel="stylesheet" type="text/css" href="' +
                    isc.Page.getURL(this.externalStylesheet) + '" />\n';
        HTML = stylesheetHTML + HTML;
    }

    var frame = this.getIFrameWindow();
    frame.assignHTML(HTML);
    if (isc.Browser.isIE && isc.Browser.hasVML && HTML.contains("class=rvml")) {
        frame.document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
    }
    this.fireCallback(callback, ["printPreview","callback"], [this, callback]);
},

//> @method printCanvas.setTitle()
// Specify the title for the printCanvas. This is the title that will appear on the printed 
// document
// @param title (String) Title to show
// @visibility internal
//<

setTitle : function (title) {
    this.title = title;
    // if the iframe hasn't been loaded we can bail - when we load it we'll include the
    // title in the HTML passed in.
    if (!this.isDrawn() && !this.iframeLoaded) return;
    
    // In IE window.title is essentially read-only - we really need to rewrite the entire HTML of
    // the frame to update it
    if (this.isDrawn()) this.redraw();
},

// Note there's no call to 'draw()' in here so if called before draw this would have no
// effect
printHTML : function (HTML, title ,debugOnly) {
    var self = this;
    this.setTitle(title);
    this.setHTML(HTML, 
    
                    function () {
                    self.print();
                });
},


//> @method printCanvas.print()
// Show the native print dialog and allow the user to print the current HTML for
// this printCanvas. Note that the PrintCanvas must be drawn to be printed.
// @visibility external
//<
print : function () {
    if (!this.isDrawn()) {
        this.logWarn("print(): Attempt to print an undrawn PrintCanvas. Ignoring.");
        return;
    }

    if (!this.iframeLoaded) {
        this.delayCall("print", [], 100);
        return;
    }

    // doPrint() is a function defined in the printFrame.html helper page.
    this.getIFrameWindow().doPrint();
    
    
},

// Handler to fire when printing is complete - only fires in IE
printComplete : function () {
  //this.logWarn("print complete!~");
}

});

isc.Canvas.addClassMethods({
    //> @classMethod Canvas.printComponents()
    // Generate printable HTML for the designated components and trigger the native print
    // dialog, without never showing the printable HTML to the user.
    //
    // @param components (Array of Canvas) components to get the print HTML for. May also include
    //        raw HTML strings which will be folded into the generated print output
    // @param [printProperties] (PrintProperties) object for customizing the print HTML output
    //
    // @group printing
    // @visibility external
    //<
    printComponents : function (components, printProperties, title, debugOnly) {
        isc.Canvas.getPrintHTML(
            components, printProperties, 
            {target:this, methodName:"_printComponentHTML", title:title, debugOnly:debugOnly}
        );
    },
    _printComponentHTML : function (printHTML, callback) {        
        var title = callback.title,
            debugOnly  = callback.debugOnly;
            
        if (!this._printCanvas) this._printCanvas = isc.PrintCanvas.create({
            // sizing to 100/100 should cause the layout to match as closely as possible...
            width:"100%", height:"100%", autoDraw:false
            ,backgroundColor:"white"
        });
        this._printCanvas.moveTo(null, -isc.Page.getHeight());
        if (!this._printCanvas.isDrawn()) this._printCanvas.draw();
        this._printCanvas.printHTML(printHTML, title, debugOnly);
    },
    
    //> @classMethod Canvas.getPrintPreview()
    // Creates a printCanvas containing the full printHTML for a series of components, passing
    // it as an argument to the callback (if supplied) when it fires. Note that the generated
    // preview canvas will be drawn automatically by this method. Developers may also
    // explicitly create a PrintCanvas instance and populate it with HTML derived from the
    // +link{Canvas.getPrintHTML()} for finer grained control over when the print canvas is
    // drawn.
    // @param components (Array of Canvas) components to get the print HTML for. May also include
    //    raw HTML strings which will be folded into the generated print output
    // @param [printProperties] (PrintProperties) PrintProperties object for customizing the print HTML output
    // @param [previewProperties] (Canvas Properties) properties to apply to the generated printPreview Canvas.
    // @param [callback] (PrintCanvasCallback) callback to fire when the print preview canvas has been populated
    //    with the printable HTML. The generated canvas will be passed to the callback as a single 
    //    <code>printPreview</code> parameter.
    // @param [separator] (String) optional string of HTML to render between each component
    // @group printing
    // @visibility external
    //< 
    
    getPrintPreview : function (components, printProperties, previewProperties, callback, separator) {
        // always auto-draw - this is required so the thing gets populated with print HTML
        // and actually gets shown.
        if (previewProperties == null) previewProperties = {};
        previewProperties.autoDraw = true;
        
        // 2 steps here - both are asynchronous:
        // - generate print html from components
        // - apply HTML to the print canvas (asynchronous if iframe wasn't yet loaded)
        isc.Canvas.getPrintHTML(components, printProperties, 
                                {target:this, methodName:"_createPrintPreview", 
                                    origCallback:callback, previewProperties:previewProperties},
                                    separator);
        
    },
    _createPrintPreview : function (HTML, callback) {
        var PC = isc.PrintCanvas.create(callback.previewProperties);
        PC.setHTML(HTML, {target:this, methodName:"_printPreviewGenerated",
                                        origCallback:callback.origCallback});
    },
    _printPreviewGenerated : function (printPreview, callback) {
        if (callback.origCallback) {
            this.fireCallback(callback.origCallback, ["printPreview"], [printPreview]);
        }
    },

    //> @classMethod Canvas.showPrintPreview()
    // Generate and show a +link{class:PrintWindow} containing a +link{class:PrintCanvas}
    // showing a printable view of the components passed in.
    //
    // @param components (Array of Canvas) components to get the print HTML for. May also include
    //  raw HTML strings which will be folded into the generated print output
    // @param [printProperties] (PrintProperties) PrintProperties object for customizing the 
    //    print HTML output
    // @param [printWindowProperties] (PrintWindow Properties) Properties to apply to the 
    //    generated print window.
    // @param [callback] (Callback) callback to fire when the print preview canvas has 
    //    been populated with the printable HTML. This callback takes 2 parameters:
    //    <code>printPreview</code> - a pointer to the generated print canvas shown in the
    //    body of the print window.
    //    <code>printWindow</code> - a pointer to the generated print window and 
    // @param [separator] (String) Optional HTML separator to render between each component's printable
    //                      HTML
    //
    // @group printing
    // @visibility external
    //<
    showPrintPreview : function (components, printProperties, previewProperties, callback,
                                  separator) 
    {
        if (!isc.PrintWindow) {
            isc.definePrintWindow();
        }
        if (!isc.PrintWindow) return;
        
        // Make the PrintWindow an autoChild
        if (previewProperties == null) previewProperties = {};
        previewProperties.autoDraw = false;
        if (previewProperties.width == null) previewProperties.width = "100%";
        if (previewProperties.height == null) previewProperties.height = "100%";
        if (previewProperties.left == null) previewProperties.left = 0;
        if (previewProperties.top == null) previewProperties.top = 0;

        if (!this._previewWindow) {
            this._previewWindow = isc.PrintWindow.create(previewProperties);
        } else {
            this._previewWindow.setProperties(previewProperties);
        }
        this._previewWindow.showPrintPreview(components, printProperties, callback, separator);
    }
    
});

isc.Canvas.addMethods({
    //> @method canvas.print()
    // Generate and show a +link{class:PrintWindow} containing a +link{class:PrintCanvas}
    // showing a printable view of this component.
    //
    // @param [printProperties] (PrintProperties) PrintProperties object for customizing the 
    //    print HTML output
    // @param [printWindowProperties] (PrintWindow Properties) Properties to apply to the 
    //    generated print window.
    // @param [callback] (Callback) callback to fire when the print preview canvas has 
    //    been populated with the printable HTML. This callback takes 2 parameters:
    //    <code>printPreview</code> - a pointer to the generated print canvas shown in the
    //    body of the print window.
    //    <code>printWindow</code> - a pointer to the generated print window and 
    //
    // @group printing
    // @see Canvas.showPrintPreview
    // @visibility external
    //<
    print : function (printProperties, printWindowProperties, callback) {
        isc.Canvas.showPrintPreview(this, printProperties, printWindowProperties, callback);
    }
});

// separate the definition of the PrintWindow class into a separate function.
// We fire this at the end of Window.js, after the Window class has been defined (but before page
// load so we know the class is available when load_skin.js gets loaded).
isc.definePrintWindow = function () {

if (!isc.Window) {
    isc.logWarn("Attempting to create PrintWindow class with no defined Window class. " + 
                "Ensure the required 'Containers' module is laoded");
    return;
}

//> @class PrintWindow
// Subclass of +link{class:Window} used for displaying a printable view. Includes a "Print" button
// header control to trigger printing of content.
//
// @inheritsFrom Window
// @treeLocation Client Reference/System
// @group printing
// @visibility external
//<
isc.defineClass("PrintWindow", "Window");
isc.PrintWindow.addProperties({
    isModal: true,
    headerControls: ["headerIcon", "headerLabel", "printButton", "closeButton"],
    printButtonDefaults: {
        _constructor: "IButton",
        height: 20,
        layoutAlign: "center",
        click: "this.creator.printClicked()"
    },

    showMinimizeButton: false,
    showShadow:false,

    //> @attr printWindow.title (String : "Print Preview" : IRW)
    // Title for the print window
    // @visibility external
    //<
    title: "Print Preview",

    //> @attr printWindow.printButtonTitle (String : "Print" : IRW)
    // Title for the print button
    // @visibility external
    //<
    printButtonTitle: "Print",

    //> @method printWindow.setPrintButtonTitle ()
    // Setter for title for the print button
    // @param printButtonTitle (String) new title for the print button
    // @visibility external
    //<
    setPrintButtonTitle : function (printButtonTitle) {
        this.printButtonTitle = printButtonTitle;
        if (this.printButton != null) this.printButton.setTitle(printButtonTitle);
    },

    //> @attr printWindow.externalStylesheet (String : null : IRWA)
    // Setting this property will cause the specified stylesheet to be loaded in this
    // window's printable HTML frame.
    // <P>
    // The stylesheet should be specified as a URL to load.
    // @visibility external
    //<

    initWidget : function () {
        
        if (isc.Browser.isAndroid) {
            var headerControls = this.headerControls;
            if (headerControls != null) {
                headerControls = this.headerControls = headerControls.duplicate();
                headerControls.remove("printButton");
            }
        }
        this.Super("initWidget", arguments);
    },

    printButton_autoMaker : function (dynamicProperties) {
        dynamicProperties = isc.addProperties({}, dynamicProperties, {
            title: this.printButtonTitle
        });
        return this.createAutoChild("printButton", dynamicProperties);
    },

    showPrintPreview : function (components, printProperties, callback, separator) {
        if (!isc.isAn.Array(components)) components = [components];
        isc.Canvas.getPrintHTML(components, printProperties, 
                                {target:this, methodName:"_applyPreviewHTML", 
                                    origCallback:callback}, separator);
    },
    _applyPreviewHTML : function (HTML, callback) {
        if (!this.previewPane) {
            this.previewPane = this.createPreviewPane();
            this.previewPane.addProperties({title:this.title});
            this.addItem(this.previewPane);
        } else {
            this.previewPane.setTitle(this.title);
        }
        
        this.previewPane.externalStylesheet = this.externalStylesheet;
        
        // we have to draw the preview pane to set it's HTML
        this.setVisibility("hidden");
        if (!this.isDrawn()) this.draw();
        this.previewPane.setHTML(HTML, {target:this, methodName:"_printPreviewGenerated",
                                         origCallback:callback.origCallback});
    },
    _printPreviewGenerated : function (printPreview, callback) {
        if (!this.isVisible()) this.show();
        this.bringToFront();
        if (callback.origCallback) {
            this.fireCallback(callback.origCallback, 
                ["printPreview", "printWindow"], [printPreview, this]);
        }
    },
    
    printClicked : function () {
        var pc = this.getPrintCanvas();
        if (!pc) return;
        pc.print();
    },
    
    createPreviewPane : function (callback) {
        var previewPane = isc.PrintCanvas.create({
            width: "100%",
            height: "100%"
        });
        return previewPane;
    },
    
    getPrintCanvas : function () {
        return this.previewPane;
    },
    // clear on closeClick
    
    closeClick : function () {
        this.Super("closeClick", arguments);
        this.clear();
    }
});

}

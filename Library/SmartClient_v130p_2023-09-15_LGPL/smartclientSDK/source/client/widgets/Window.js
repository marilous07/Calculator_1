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
//> @class Window
//
// A general purpose Window class for implementing dialogs, portlets, alerts, prompts, wizards
// and desktop-like windowing interfaces.
// <P>
// Windows can contain arbitrary SmartClient components, configured via the +link{window.items}
// property.  Windows may be +link{window.isModal,modal} or non-modal.
// <P>
// Windows provide a series of highly configurable and skinnable +link{AutoChild,autoChildren}
// including a header, various header controls, footer, and corner resizer.
// <P>
// The more specialized +link{Dialog} subclass of Window has additional functionality targetted
// at simple prompts and confirmations, such as buttons with default actions, and single-method
// +link{staticMethod:isc.warn(),shortcuts} for common application dialogs.
//
// @inheritsFrom Layout
// @treeLocation Client Reference/Layout
// @visibility external
//<

isc.ClassFactory.defineClass("Window", "Layout");

isc.Window.addClassProperties({
	//> @type ContentLayoutPolicy
    // Policy controlling how the window will manage content within its body.
    //
    // @value  isc.Window.NONE 
    // Window does not try to size members at all on either axis.  Window body defaults to
    // a Canvas if not autosizing.  Otherwise a Layout is used with policies on both axes set
    // to +link{LayoutPolicy} "none".
    //
    // @value isc.Window.VERTICAL
    // Window body defaults to VLayout behavior.  (Body is actually just a Layout with 
    // +link{Layout.vertical}: true.)
    //
    // @value isc.Window.HORIZONTAL
    // Window body defaults to HLayout behavior.  (Body is actually just a Layout with 
    // +link{Layout.vertical}: false.)
    //
    // @visibility external
    //<

    //> @classAttr Window.NONE (Constant : "none" : [R])
    // A declared value of the enum type  
    // +link{type:ContentLayoutPolicy,ContentLayoutPolicy}.
    // @visibility external
    // @constant
    //<
    //NONE: "none", // NOTE: constant declared by Canvas

    //> @classAttr Window.VERTICAL (Constant : "vertical" : [R])
    // A declared value of the enum type  
    // +link{type:ContentLayoutPolicy,ContentLayoutPolicy}.
    // @visibility external
    // @constant
    //<
    //VERTICAL: "vertical", // NOTE: constant declared by Canvas

    //> @classAttr Window.HORIZONTAL (Constant : "horizontal" : [R])
    // A declared value of the enum type  
    // +link{type:ContentLayoutPolicy,ContentLayoutPolicy}.
    // @visibility external
    // @constant
    //<
    //HORIZONTAL: "horizontal" // NOTE: constant declared by Canvas
});

//> @groupDef body
// Things related to the body subobject of Window
// @visibility internal
//<

//> @groupDef header
// Things related to the header subobject of Window
// @visibility internal
//<

//> @groupDef headerLabel
// Things related to the headerLabel subobject of Window
// @visibility internal
//<

//> @groupDef footer
// Things related to the footer subobject of Window
// @visibility internal
//<

//> @groupDef windowItems
// Things related to the items contained in the Window body
// @title Window Items
// @visibility internal
//<

//> @groupDef windowHeader
// Things related to the header subobject of Window
// @title Window Header
// @visibility external
//<


// add standard instance properties
isc.Window.addProperties({
    

    // Skinning
    // ---------------------------------------------------------------------------------------

    //>	@attr	window.styleName	(String : "windowBackground" : IRW)
	//			Default style for the Window background
	//		@group	appearance, header
	//<	
	styleName:"windowBackground",		
	printStyleName:"normal",

    //>	@attr	window.skinImgDir		(SCImgURL : "images/Window/" : IRWA)
	//		Where do 'skin' images (those provided with the class) live?
	//		This is local to the Page.skinDir
	//		@group	appearance, images
	//<	
	skinImgDir:"images/Window/",		

    //>	@attr	window.backgroundColor	(String : "#DDDDDD" : IRW)
	//			background color, picked up in Header, Footer, etc.
	//		@group	appearance, header
	//<	
	backgroundColor:"#DDDDDD",			

     
    getPointerColor : function () {
        return this.body.getPointerColor();
    },

    layoutMargin:2,                          
    membersMargin:2,                          

    // set orientation to vertical by default
    orientation: "vertical",
    
    // Dragging
    // ---------------------------------------------------------------------------------------
	
    
	dragStartDistance:1,

	//> @attr window.canDragReposition (Boolean : true : IRW)
	// If true, this Window may be moved around by the user by dragging on the Window header.  
    // Note that if the header is not showing, the Window can't be drag-repositioned regardless
    // of this setting.
    // @see window.showHeader
	// @group dragging
    // @visibility external
	//<
	canDragReposition:true,

    setCanDragReposition : function (canDragReposition, dragTarget) {
        if (!this.headerLabelParent) return;
        this.canDragReposition = false;

        var dragRepo = canDragReposition == null ? true : canDragReposition;
        // if the Window is moveable, make the header draggable
        this.headerLabelParent.dragTarget = dragTarget || this;
        this.headerLabelParent.canDragReposition = dragRepo;
        // HACK: for a Window, canDragReposition means you can reposition using the header.  We
        // have to turn it off for the widget as a whole or any widget that lets drag events
        // bubble will cause strange effects.
        this.canDragReposition = false;
    },
    
    getCanDragReposition : function () {
        if (this.headerLabelParent) return this.headerLabelParent.canDragReposition;
        return this.canDragReposition;
    },

    //>	@attr	window.keepInParentRect		(Boolean | Array of Integer : true : IRWA)
    // @include canvas.keepInParentRect
    //
    // @see window.canDragReposition
    // @group dragdrop
    // @visibility external
    //<
    // Default keepInParentRect to true. This avoids users accidentally dragging a window
    // offscreen and being unable to then reach the header controls to drag it back on screen.
    // If the window is modal this is doubly bad as the user may be stuck with a blocked
    // application
    keepInParentRect : true,
        
	dragAppearance : isc.EventHandler.OUTLINE,
 
    // Drag Resizing   
    // ---------------------------------------------------------------------------------------

	//>	@attr	window.canDragResize	(Boolean : false : IRW)
	// Can the window be drag-resized? If true the window may be drag resized from its edges,
    // and if showing, via the resizer icon in the footer.
    // @see window.showResizer
    // @group dragging, resizing
    // @visibility external
    //<
    
	canDragResize:false,

    //> @attr window.resizeFrom (Array of EdgeName : ["R","B","BR"] : IRWA)
    // When drag resizing is enabled via +link{canDragResize}, restricts resizes to only certain
    // edges or corners.
    // <P>
    // This property on +link{Window} overrides the default defined by +link{canvas.resizeFrom}.
    // @group dragdrop
    // @visibility external
	//<
    
	resizeFrom:["R","B","BR"],			
										
    // Internal
    // ---------------------------------------------------------------------------------------
	
    
    //> @attr Window.useBackMask (Boolean : varies : IRA)
    // By default Windows show a +link{canvas.useBackMask,backMask} in Internet Explorer
    // versions predating Internet Explorer 9. This is a workaround for a native browser
    // issue whereby certain DOM elements such as <code>IFRAME</code>s (whether rendered
    // within SmartClient components via features such as +link{htmlFlow.contentsURL,contentsURL} or 
    // explicitly written into the HTML of the page) will not be properly occluded
    // by DOM elements which overlap them but have a higher z-index.
    // <P>
    // A side-effect of this is that the +link{canvas.opacity,opacity} can not be modified
    // for the entire window. Developers may disable the backmask in order to support
    // opacity in IE versions less than 9 by setting this property to false, however you
    // should be aware that in doing this there is a potential for the "burn through"
    // problem described above.
    // @visibility external
    //<
    useBackMask: isc.Browser.isIE && isc.Browser.minorVersion >= 5.5 && isc.Browser.version < 9,

    // Document opacity just so we can refer back to useBackMask
    //> @attr Window.opacity (Integer : null : IRWA)
    // Renders the widget to be partly transparent. A widget's opacity property may
    // be set to any number between 0 (transparent) to 100 (opaque).
	// Null means don't specify opacity directly, 100 is fully opaque.
	// Note that heavy use of opacity may have a performance impact on some older
	// browsers.
	// <P>
	// In older versions of Internet Explorer (Pre IE9 / HTML5), opacity is achieved
	// through proprietary filters. If 
	// +link{canvas.neverUseFilters,filters have been disabled} within this application
	// developers must set +link{canvas.useOpacityFilter} to true for specific components
	// on which opacity support is required.
	// <P>
	// Also note that opacity is incompatible 
	// with +link{canvas.useBackMask,backMasks}, and that this property is enabled
	// by default for Window instances.
    // @visibility external
    //<

    // Modality
    // ---------------------------------------------------------------------------------------

    //>	@attr	window.isModal		(Boolean : false : [IRW])
    // If true, when shown this Window will intercept and block events to all other existing
    // components on the page.
    // <P>
    // Use +link{showModalMask} to darken all other elements on the screen when a modal dialog
    // is showing.
    // <P>
    // Chained modal windows - that is, modal windows that launch other modal windows - are
    // allowed.  You can accomplish this by simply creating a second modal Window while a modal
    // Window is showing.
    // <P>
    // Note only top-level Windows (Windows without parents) can be modal.
    // 
    // @group modal
    // @visibility external
    // @example modality
    //<
	isModal : false,

    //> @attr window.modalMask (AutoChild Canvas : null : R)
    // A ScreenSpan instance used to darken the rest of a page when a modal window is
    // active. To use, set +link{window.showModalMask} to true, add a CSS style 
    // "modalMask" to the active skin (generally with background-color set), 
    // and adjust +link{window.modalMaskOpacity}.
    // @group modal, appearance
    // @visibility external
    //<

    //> @attr window.showModalMask (boolean : null : IR)
    // If true, displays a translucent mask over the rest of the page when a modal window
    // is displayed. 
    // @group modal, appearance
    // @see window.modalMask
    // @visibility external
    //<

    //> @attr window.modalMaskOpacity (number : 50 : IR)
    // Controls the opacity of the modal mask displayed behind modal windows.
    // @group modal, appearance
    // @see window.modalMask
    // @visibility external
    //<
    modalMaskOpacity: 50,

    //> @attr window.modalMaskStyle (String : "modalMask" : IR)
    // Specifies the CSS style for the modal mask.
    // @group modal, appearance
    // @see window.modalMask
    // @visibility external
    //<
    modalMaskStyle: "modalMask",
    
    modalMaskConstructor: "ScreenSpan",

    //> @attr window.autoCenter (Boolean : false : [IRW])
    // If true, this Window widget will automatically be centered on the page when shown.
    // If false, it will show up in the last position it was placed (either programmatically,
    // or by user interaction).
    // <P>
    // <b>Note:</b> If an auto-centering Window is either programmatically moved or dragged 
    // by an end user, auto-centering behavior is automatically turned off. To manually center 
    // a Window, you can use +link{centerInPage()}.  Auto-centering will also be disabled if
    // you pass an explicit +link{left} or +link{top} value at +link{create(),create time}.
    // @group  appearance, location
    // @visibility external
    //<
    //autoCenter : false,

    //> @method window.setAutoCenter()
    // Setter for the +link{autoCenter} attribute.
    // @param autoCenter (boolean) new value for autoCenter
    // @visibility external
    //<
    setAutoCenter : function (autoCenter) {
        // wipe instance properties if they're not valid or autoCenter is true
        if (autoCenter || this.left == null || this.top == null) {
            delete this.left; delete this.top;
        }
        //>EditMode
        // wipe editNode properties if they're not valid or autoCenter is true
        if (this.editContext && this.editingOn && this.editNode) {
            var left = this.editNode.left, top = this.editNode.top;
            if (autoCenter || !top && top !== 0 || !left && left !== 0) {
                this.editContext.removeNodeProperties(this.editNode, ["left", "top"]);
            }
        }
        //<EditMode
        this.autoCenter = autoCenter;
        // if window is currently visible, center it if needed
        if (autoCenter && this.isVisible()) this.centerInPage();
    },

    // Dismissal
    // ---------------------------------------------------------------------------------------

    //>	@attr	window.dismissOnOutsideClick		(Boolean : false : [IRW])
    //      If true, a click outside the bounds of the Window will have the same effect as
    //      pressing its cancel button.<br>
    //      <b>Note:</b> Applies only to modal windows.
    //  @visibility external
    //  @group  modal
    //  @see isModal
    //<
	dismissOnOutsideClick:false,
    
    //> @attr   window.dismissOnEscape  (Boolean : null : [IRW])
    // Should this window be dismissed (same effect as pressing the "Cancel" button) when the 
    // user presses the "Escape" key?<br>
    // Windows with this setting will dismiss on Escape keypresses in any of the following
    // cases:
    // <ul>
    // <li>The window or one of its descendants has focus (and does not cancel the Escape 
    //     keypress)</li>
    // <li>The window is +link{window.isModal,modal}, and not itself masked. This ensures
    //     that focus is not on some unrelated element on the page.</li>
    // </ul>
    // <P>
    // If unset default behavior depends on whether a close / cancel button is visible for
    // this item.
    // @visibility external
    // @see window.shouldDismissOnEscape()
    //<
    //dismissOnEscape:null,
	
	// Body
	// ----------------------------------------------------------------------------------------

    //> @attr window.body (AutoChild Canvas : null : R)
    // Body of the Window, where +link{items,contained components} or +link{src,loaded content}
    // is shown.
    // <p>
    // The following +link{group:autoChildUsage,passthroughs} apply:
    // <ul>
    // <li>+link{attr:bodyStyle,bodyStyle} for the +link{Canvas.styleName}</li>
    // <li>+link{attr:printBodyStyle,printBodyStyle} for the <code>styleName</code> to use when
    //     printing</li>
    // <li>+link{attr:bodyColor,bodyColor} / +link{attr:hiliteBodyColor,hiliteBodyColor} for
    //     the +link{Canvas.backgroundColor}</li>
    // </ul>
    // @visibility external
    //<

    //>	@attr	window.showBody		(Boolean : true : IRWA)
    //      If true, draw the body contents when this Window is drawn.
    //  @visibility external
    //  @group  windowMembers, appearance, body
    //<
	showBody:true,

    //>	@attr	window.bodyStyle	(CSSStyleName : "windowBody" : [IRW])
    //      Style of the Window body.
    //  @visibility external
    //  @group  appearance, body
    //<
    bodyStyle:"windowBody",

    //> @attr window.printBodyStyle (CSSStyleName : "printHeader" : [IR])
    // Style for the Window body in printed output.
    //  @visibility external
    //<
    
    printBodyStyle:"printHeader",

    //> @attr window.bodyColor (CSSColor : "#FFFFFF" : IRW)
    //      Color of the Window body. Overrides the background color specified in the style.
    //  @visibility external
    //  @group  appearance, body
    //  @see    flash()
    //<
    bodyColor:"#FFFFFF",

    //> @attr window.hiliteBodyColor (CSSColor : "#EEEEEE" : IRW)
    //      Highlight color for the Window body (shown when the body is flashed).
    //  @visibility external
    //  @group  appearance, body
    //  @see    flash()
    //<
    hiliteBodyColor:"#EEEEEE",

    //>	@attr	window.items		(Array of Canvas | Canvas | String : null : [IR])
    //      The contents of the Window body. Can be specified three different ways:
    //      <ul><li>an Array of Canvases that will become the children of the Window's body when it
    //      is initialized; the canvases in this array should be created, but not drawn (autodraw:
    //      false).
    //      <li>a single canvas that will become a child of the Window body.
    //      <li>a string that will be set as the body's contents.</ul>
    //  @see body
    //  @visibility external
    //  @group  appearance, body
    //<

    //>	@attr window.src (String : null : [IRW])
    // A URL to load as content for the Window's body.  If specified, this
    // attribute will take precedence over the items attribute.
    // <P>
    // Note that setting window.src is essentially a shortcut for setting +link{window.items}
    // to a single HTMLflow with a specified +link{htmlFlow.contentsURL,contentsURL}.
    //
    // @see window.contentsType
    // @group  appearance, body
    // @visibility external
    //<
    
    //> @attr window.contentsType (String : "page" : IR)
    // If this window has +link{window.src} specified, this property can be used to indicate
    // whether the source is a standalone HTML page or an HTML fragment.
    // <P>
    // This is similar to the +link{htmlFlow.contentsType} property - be sure to read the
    // HTMLFlow documentation to understand circumstances where contentsType:"page" is
    // <b>unsafe and not recommended</b>.
    //
    // @see window.src
    // @visibility external
    // @group appearance, body
    //<
    
    contentsType:"page",
        

	//>	@attr	window.bodyConstructor (String : null : IRWA)
    // The name of the widget class (as a string) to use for the body. If unset the appropriate
    // constructor type will be determined as follows:<br>
    // - if +link{window.items} is defined as an array of widgets, and +link{window.contentLayout} 
    //   is not set to <code>"none"</code>, bodyConstructor defaults to a +link{class:VLayout}<br>
    // - if +link{window.src} is set, bodyConstructor defaults to an +link{class:HTMLFlow}<br>
    // - otherwise bodyConstructor will default to a simple +link{class:Canvas}<br>
    // Note that if this property is overridden for some window, the specified constructor 
    // should be a subclass of one of these defaults to ensure the window renders out as 
    // expected.
    //
	// @group	appearance, body
    // @visibility external
	//<
    

	//>	@attr	window.bodyDefaults		(Object : ... : IRWA)
	// Default properties for the body of the Window<br>
	// You can change the class-level bodyDefaults for all Windows by changing this item
	// or set  instance.body to be another object of properties to override for your instance only
	// @group	appearance, body
    // @visibility external
	//<
	bodyDefaults:{
        layoutMargin:0,
        printStyleName:"printHeader"
	},

	// Layout
	// ----------------------------------------------------------------------------------------------

	//>	@attr	window.contentLayout (ContentLayoutPolicy : "vertical" : [IRWA])
	// The layout policy that should be used for widgets within the Window body.
    // <P>
    // See +link{ContentLayoutPolicy} and +link{bodyConstructor} for details.
    //
    //  @visibility external
	//	@group	appearance
	//<
    contentLayout: isc.Window.VERTICAL,

    //>	@attr	window.autoSize (Boolean : false : [IRW])
	//			If true, the window is resized automatically to accommodate the contents
	//			of the body, if they would otherwise require scrolling.
    //      @visibility external
	//		@group	appearance
    //      @example windowAutosize
	//<
	autoSize:false,	
	
	
	// Header and Header Components
	// ----------------------------------------------------------------------------------------------

    //> @attr window.header (AutoChild HLayout : null : R)
    // Header for the Window, based on an HLayout. The header contains the title and some standard
    // controls for the window, which may be configured via +link{window.headerControls}.
    // <p>
    // The following +link{group:autoChildUsage,passthroughs} apply:
    // <ul>
    // <li>+link{attr:headerStyle,headerStyle} for +link{Canvas.styleName}</li>
    // <li>+link{attr:printHeaderStyle,printHeaderStyle} for the <code>styleName</code> to use
    //     when printing.</li>
    // </ul>
    // @visibility external
    //<

    //>	@attr	window.showHeader		(Boolean : true : IR)
    // If true, show a +link{window.header} for this Window. 
    // <P>
    // Note that in certain Smartclient skins +link{window.showHeaderBackground} may be set to
    // <code>false</code> and the header's appearance implemented as part of the
    // window's +link{canvas.showEdges,edge media}. In this case suppressing the header can be achieved
    // by overriding the edge media as well as setting this property to false. For example, to
    // create a headerless window with a similar appearance to a +link{Menu} in the
    // <code><i>TreeFrog</i></code> skin, the following attributes could be used:
    // <pre>
    //      showHeader:false,
    //      edgeImage:"[SKIN]/Menu/m.png",
    //      edgeSize:10, edgeTop:17, edgeBottom:17,
    //      edgeCenterBackgroundColor:"#F7F7F7"
    // </pre>
    //
    //      @visibility external
    //		@group  windowMembers, appearance, header
    //<
	showHeader:true,
    
    headerConstructor:"HLayout",

    //> @attr window.headerBackground (AutoChild Img : null : R)
    // Img background component for the header, for gradient or image-based display
    // @visibility external
    //<
    
    //>@attr    window.showHeaderBackground (Boolean : varies : IRA)
    // Should the window header show a background image? Default value is true for all browsers
    // except for Internet Explorer.<br>
    // If set to true the image source is derived from +link{window.headerSrc} and 
    // +link{window.hiliteHeaderSrc}, otherwise the background will be styled according to 
    // +link{window.headerStyle} / +link{window.hiliteHeaderStyle}.
    // @group appearance, header
    // @visibility external
    //<
    // By default, we assume CSS will be used in recent IE, and media otherwise, since the
    // typical presentation is a gradient.
    showHeaderBackground :
        !(isc.Browser.isIE && !isc.Browser.isStrict && isc.Browser.minorVersion >= 5.5),

	headerBackgroundConstructor: "Img",

    headerBackgroundDefaults : {
        width:"100%",
        height:"100%",
        // background is a non-member child of the header, which is a Layout
        addAsChild:true, 
        // applicable to StretchImgs only
        vertical:false,
        capSize:10,
        shouldPrint:false
    },

    //>	@attr	window.headerStyle	(CSSStyleName : "WindowHeader" : [IRWA])
    //          Style for the Window header.
    //      @visibility external
    //      @group	appearance, header
    //<
    headerStyle:"windowHeader",

    //> @attr window.printHeaderStyle (CSSStyleName : "printHeader" : [IR])
    // CSS Style for header in printed output
    // @visibility external
    //<
    printHeaderStyle:"printHeader",
    
    //>	@attr	window.headerSrc (SCImgURL : "[SKIN]Window/headerGradient.gif" | null : [IRWA])
    // If +link{window.showHeaderBackground} is <code>true</code>, this property provides
    // the URL of the background image for the header.
    // @group  appearance, header
    // @visibility external
    //<
    headerSrc:(!(isc.Browser.isIE && !isc.Browser.isStrict && isc.Browser.minorVersion >= 5.5) ? 
                        "[SKIN]Window/headerGradient.gif" : null),  		

	headerDefaults:{

        // Note - other defaults applied in Window.makeHeader()
        height:18,
        layoutMargin:1,
        membersMargin:2,
		overflow:isc.Canvas.HIDDEN,
		// Turn off printFillWidth for the header - we don't want to render the
		// print header in a 100% sized table as this causes the icon's cell to have
		// a bunch more space than it needs and so you get a big gap between icon and
		// title
        printFillWidth:false,

        init : function () {
            this.Super("init", arguments);

            // When a window is edited in editMode, the header does not have an editNode
            // but needs to be placed into editMode so the editProxy can hook events.
            if (this.creator.editingOn && this.creator.editContext.isReify) {
                this.setEditMode(true, this.creator.editContext);
            }
        },

        // When a drop is targeting the header in editMode, what color should the 
        // dropLine be? This should be something not matching the header background
        // for commmon skins. 
        dropLineThickness:2,
        dropLineProperties: {
            border: "1px solid #40c040",
            backgroundColor: "#40c040"
        },
        
        builtinHeaderControls: ["minimizeButton", "maximizeButton", "closeButton"],
        handleClick : function (event) {
            // Tapping the minimize, maximize, and close buttons can be very difficult on touch
            // devices, so if one of these builtin controls is close enough to a click on the
            // header, then forward the click to the builtin control.
            
            if (this.ns.EH._handlingTouchEventSequence() && !isc.Browser.isChrome) {
                var offsetX = this.getOffsetX(),
                    offsetY = this.getOffsetY(),
                    builtinHeaderControls = this.builtinHeaderControls,
                    nearestBuiltinControl,
                    nearestBuiltinControlDistance,
                    nearestBuiltinControlOffsets;
                for (var i = 0, len = builtinHeaderControls.length; i < len; ++i) {
                    var builtinHeaderControl = builtinHeaderControls[i];
                    if (!isc.isA.Canvas(builtinHeaderControl)) builtinHeaderControl = this.creator[builtinHeaderControl];
                    if (builtinHeaderControl == null ||
                        !isc.isA.Canvas(builtinHeaderControl) ||
                        !builtinHeaderControl.isDrawn() ||
                        !builtinHeaderControl.isVisible())
                    {
                        continue;
                    }

                    var offsets = builtinHeaderControl.getOffsets(),
                        distance = isc.Math._hypot(offsets.left - offsetX,
                                                   offsets.top - offsetY);
                    if (nearestBuiltinControl == null || distance < nearestBuiltinControlDistance) {
                        nearestBuiltinControl = builtinHeaderControl;
                        nearestBuiltinControlDistance = distance;
                        nearestBuiltinControlOffsets = offsets;
                    }
                }

                if (nearestBuiltinControl != null && Math.abs(nearestBuiltinControlOffsets.left - offsetX) < 15) {
                    if (nearestBuiltinControl.click != null) return nearestBuiltinControl.click(event);
                }
            }
        }
	},
	
    //> @attr window.headerControls (Array of String : (see below) : IR)
    // Array of members to show in the Window header.  
    // <P>
    // The default value of <code>headerControls</code> is an Array of Strings listing the
    // standard header controls in their default order:
    // <pre>
    //    headerControls : ["headerIcon", "headerLabel", 
    //                      "minimizeButton", "maximizeButton", "closeButton"]
    // </pre>
    // You can override <code>headerControls</code> to change the order of standard controls in
    // the header.  You can also omit standard controls this way, although it more efficient to
    // use the related "show" property if available (eg +link{showMinimizeButton}).  
    // <P>
    // By embedding a Canvas directly in this list you can add arbitrary additional controls to
    // the header, for example, an additional button (eg return to dock) or a DynamicForm with
    // various kinds of input controls.  
    // <P>
    // Note that having added controls to headerControls, you can still call APIs directly on
    // those controls to change their appearance, and you can also show() and hide() them if
    // they should not be shown in some circumstances.
    // <P>
    // Tip: custom controls need to set layoutAlign:"center" to appear vertically centered.
    // <P>
    // <B>Component XML:</B>
    // <P>
    // To define <code>headerControls</code> in Component XML a special set of components
    // are used as markers. The standard header controls can be explicitly specified as: 
    // <pre>
    //  &lt;headerControls&gt;
    //      &lt;WindowHeaderIcon/&gt;
    //      &lt;WindowHeaderLabel/&gt;
    //      &lt;WindowMinimizeButton/&gt;
    //      &lt;WindowMaximizeButton/&gt;
    //      &lt;WindowCloseButton/&gt;
    //  &lt;/headerControls&gt;
    // </pre>
    //
    // @visibility external
    // @group windowHeader
    // @example windowHeaderControls
    //<
    headerControls : ["headerIcon", "headerLabel", 
                      "minimizeButton", "maximizeButton", "closeButton"],

    // Flashing
    // ---------------------------------------------------------------------------------------
    //>	@attr	window.hiliteHeaderStyle	(CSSStyleName : "WindowHeader" : [IRWA])
    // Highlight style for the Window header. Displayed when a window 
    // is +link{window.flash(), flashed}
    //      @group	appearance, header
    //      @visibility external
    //<
    hiliteHeaderStyle:"windowHeaderHilite",  

    //>	@attr	window.hiliteHeaderSrc (SCImgURL : "[SKIN]Window/headerGradient_hilite.gif" | null : [IRWA])
    // If +link{Window.showHeaderBackground} is true, this governs the URL of the image to 
    // use in the header's highlighted state when the window is +link{window.flash(), flashed}
    // @group  appearance, header
    // @visibility external
    //<
    hiliteHeaderSrc:(!(isc.Browser.isIE && isc.Browser.minorVersion >= 5.5) ? 
                        "[SKIN]Window/headerGradient_hilite.gif" : null),  


	// HeaderLabel settings
	// --------------------------------------------------------------------------------------------

    //> @attr window.headerLabel (AutoChild Label : null : R)
    // Label that shows Window title in header.
    // <p>
    // The following +link{group:autoChildUsage,passthrough} applies:
    // +link{attr:title,title} for +link{Label.contents}.
    // @visibility external
    //<

    //> @attr window.showTitle (Boolean : true : [IRW])
    // Show a title (typically just text) on the header for this window.
    // @group windowHeader, appearance, headerLabel
    // @visibility external
    //<
	showTitle:true,

    // When showTitle is false, should the contents of the header be set to the title?
    
    //showTitleAsHeaderContents:false,

    //> @attr window.title (HTMLString : "Untitled Window" : [IRW])
    // Title for this Window, shown if +link{showTitle} is true in the +link{attr:header,header}
    // (if drawn).
    // @group appearance, headerLabel, i18nMessages
    // @visibility external
    //<
	title:"Untitled Window",

    //>	@attr	window.headerLabelConstructor	(Class : Label : IRWA)
	//			The headerLabel for a Window, if shown, will be an instance of this class.
	//		@group	appearance, headerLabel
	//<
	headerLabelConstructor:"Label",		

    headerLabelParentDefaults: {
        _constructor: "Canvas",
        overflow: "hidden",
        
        getContents : function () {
            // when printing, return "&nbsp;" instead of a big spacer
            return this.isPrinting ? isc.nbsp : isc.Canvas.blankImgHTML(1000, 100);
        }
    },

	//> @attr window.headerLabelDefaults (Object : see below : IRWA)
    //
    // This is an object literal property block specifying various properties of the header
    // label that displays the +link{Window.title}.  Overrideable defaults are as follows:
    // <ul>
    // <li>styleName- defaults to <code>"windowHeaderText"</code> and specifies the css style
    // that is used  to render the +link{Window.title} text.
    // </ul>
    // You can override the the above properties by calling +link{Class.changeDefaults()}.
    // 
	// @group appearance, headerLabel
    // @visibility external
    //<
    //
	// Default properties for the headerLabel of the Window you can change the class-level
    // headerLabelDefaults for all Windows by changing this item or set  instance.headerLabel to be
    // another object of properties to override for your instance only
	headerLabelDefaults:{
		wrap:false,
        align:isc.Canvas.LEFT,
    	styleName:"windowHeaderText",
        inherentWidth:true,
        layoutAlign: isc.Page.isRTL() ? isc.Canvas.RIGHT : isc.Canvas.LEFT
	},	
	
	// Header icon
	// --------------------------------------------------------------------------------------------
    
    //> @attr window.headerIcon (AutoChild Img : null : R)
    // Header icon shown at left end of header by default.
    // @visibility external
    //<

    //>	@attr	window.showHeaderIcon		(Boolean : true : [IRW])
    //          If true, we show an icon on the left in the header.
    //      @visibility external
    //      @group  windowHeader, appearance, header
    //<
	showHeaderIcon:true,
    
    //>	@attr	window.headerIconConstructor	(Class : Img : IRWA)
	//			The headerIcon for a Window, if shown, 
	//			will be an instance of this class.
	//		@group	appearance, header
	//<
	headerIconConstructor:"Img",

	//>	@attr	window.headerIconDefaults		(Object : ... : IRWA)
    //
    // This is an object literal property block specifying the various properties of the
    // headerIcon - the icon that appears at the top left of the window and is by default the
    // Isomorphic logo.  Overrideable defaults are as follows:
    // <ul>
    // <li>width - default to <code>16</code> and specifies the width of the headerIcon.
    // <li>height - default to <code>14</code> and specifies the height of the headerIcon.
    // <li>src - defaults to <code>"[SKIN]/Window/minimize.gif"</code> and specifies the image
    // for the headerIcon.
    // </ul>
    // You can override the the above properties by calling +link{Class.changeDefaults()}.
    //
    //	@group	appearance, header
    //  @visibility external
    //<	
	headerIconDefaults:{						
		width:16,						
		height:16,						
        layoutAlign:"center",
		src:"[SKIN]/Window/headerIcon.gif"		
	},									

    // Header buttons
	// --------------------------------------------------------------------------------------------
    
	//>	@attr	window.canFocusInHeaderButtons (Boolean : false : [IRWA])
	//
    //  If true, the user can give the header buttons focus (see +link{window.minimizeButton}, 
    //  +link{window.maximizeButton}, +link{window.restoreButton} and +link{window.closeButton}).
    //
    //  @visibility external
    //  @group	focus, header
    //< 
    // Note: this property is applied to the header buttons when they are initialized.
    canFocusInHeaderButtons:false,
       
	// Close button
	// --------------------------------------------------------------------------------------------
    
    //> @attr window.closeButton (AutoChild ImgButton : null : R)
    // Button show in the header that will close this Window by calling +link{closeClick()}.
    // @visibility external
    //<

    //>	@attr	window.showCloseButton		(Boolean : true : [IRW])
    // If true, show a close button in the header, which will dismiss this window by 
    // calling +link{closeClick()}.
    // @group  windowHeader, appearance, header
    // @visibility external
    //<
	showCloseButton:true,
    
	closeButtonConstructor:"ImgButton",	

    
	closeButtonDefaults:{	
		width:16,					
		height:14,						
        layoutAlign:"center",
		src:"[SKIN]/Window/close.gif",			
		click: function () {return this.creator._closeButtonClick()}
	},
										
	// MinimizeButton (same button as for restoring)
	// --------------------------------------------------------------------------------------------

    //> @attr window.minimizeButton (AutoChild ImgButton : null : R)
    // ImgButton shown in the header that will minimize this Window by calling +link{minimize()}.
    // @visibility external
    //<

    //>	@attr	window.showMinimizeButton		(Boolean : true : [IRW])
    // If true, show a minimize button in the header--clicking it minimizes the Window.
    //      @visibility external
    //      @group  windowHeader, appearance, header
    //<
	showMinimizeButton:true,
    
	minimizeButtonConstructor:"ImgButton",	

    minimizeButtonDefaults:{
		width:16,				
		height:14,
        layoutAlign:"center",
		src:"[SKIN]/Window/minimize.gif",	
		click:function () {
            // If onMinimizeClick exists, allow it to cancel default behavior
            
            if (!this.creator.onMinimizeClick || (this.creator.onMinimizeClick() != false)) {   
                this.creator.minimize();
            }
            return false 
        }
	},
    
    //> @attr   window.minimized    (Boolean : false : [IRW])
    // Is this window minimized. If true at init time, the window will be drawn minimized.
    // To set this property at runtime use +link{Window.minimize()} or +link{Window.restore()}.
    // @visibility external
    // @group  appearance, header
    //<
    minimized:false,

    //> @attr   window.defaultMinimizeHeight    (number : 16 : [IRWA])
    // If +link{window.minimizeHeight} is unset, by the window will shrink to the height of the
    // header when minimized.
    // <BR>
    // If there is no header, the <code>defaultMinimizeHeight</code> will be used instead.
    // @visibility external
    // @group  appearance, header
    //<
    defaultMinimizeHeight:16,	
    
    //> @attr window.minimizeHeight (number : null : [IRWA])
    // Height for the window when minimized.
    // If unset the window will shrink to the height of the header, if present, otherwise
    // +link{window.defaultMinimizeHeight,this.defaultMinimizeHeight}
    // @visibility external
    // @group appearance, minimize
    //<
    
    //>Animation
    //> @attr   window.animateMinimize    (boolean: null : [IRWA])
    // Should this window minimize, maximize, and restore as an animation, or as a 
    // simple 1-step transition?
    // @visibility animation
    // @group  appearance, header, animation
    // @example windowMinimize
    //<
    //animateMinimize:false,
    
    //> @attr   window.minimizeTime     (number : null : [IRWA])
    // If this window is minimizeable, and animateMinimize is true, what should the duration of 
    // the minimize / maximize be (in ms)? If unset defaults to <code>canvas.animationTime</code>.
    // @visibility animation
    // @group  appearance, header, animation
    // @example windowMinimize
    //<
    //minimizeTime : null,

    //> @attr window.minimizeAcceleration (AnimationAcceleration : null : IRWA)
    // Default acceleration function for performing an animated minimize / maximize.  If unset, 
    // <code>this.animateAcceleration</code> will be used by default instead
    // @visibility animation
    // @group appearance, header, animation
    //<
    //<Animation

	// RestoreButton - properties to make the minimize button a restore button.
	// --------------------------------------------------------------------------------------------

    //> @attr window.restoreButton (AutoChild ImgButton : null : R)
    // ImgButton that restores the Window via +link{restore()}.
    // @visibility external
    //<

    // Note: we currently actually apply these to the minimizeButton to change it on the fly,
    // we should probably just create both and hide/show
	restoreButtonDefaults:{
		width:16,						
		height:14,						
		src:"[SKIN]/Window/restore.gif",		
        layoutAlign:"center",
		click:function () { 
            if (!this.creator.onRestoreClick || (this.creator.onRestoreClick() != false)) {
                this.creator.restore();
            }
            return false
        }
	},		
             
	// MaximizeButton
	// --------------------------------------------------------------------------------------------
    
    //> @attr   window.maximized (Boolean : false : [IRW])
    // Is this window maximized. If true at init time, the window will be drawn maximized.
    // To set this property at runtime use +link{window.maximize()} or +link{window.restore()}.
    // @visibility external
    // @group  appearance, header
    //<
    minimized:false,    

    //> @attr window.maximizeButton (AutoChild ImgButton : null : R)
    // Button that will make this Window fill the browser via +link{maximize()}.
    // @visibility external
    //<

    //>	@attr	window.showMaximizeButton		(Boolean : false : [IRW])
    // If true, show a maximize button in the header - clicking it maximizes the Window
    //      @visibility external
    //      @group  windowHeader, appearance, header
    //<
    showMaximizeButton:false,
    
	maximizeButtonConstructor:"ImgButton",

	maximizeButtonDefaults:{				
		width:16,				
		height:14,						
		src:"[SKIN]/Window/maximize.gif",		
        layoutAlign:"center",
        click:function () { 
            if (!this.creator.onMaximizeClick || (this.creator.onMaximizeClick() != false)) {
                this.creator.maximize();
            }
            return false
        }
	},	


	// Footer and Footer Components
	// ------------------------------------------------------------------------------------------

    //> @attr window.footer (AutoChild HLayout : null : R)
    // Optional footer for the window, providing space for controls such as the resizer and 
    // status bar.
    // @visibility external
    //<

    //>	@attr	window.showFooter		(Boolean : true : [IRW])
    // If true, show a footer for this Window, including resizer, statusBar, etc.
    // This setting is commonly overridden for skinning purposes.
    //      @visibility external
    //      @group  windowMembers, appearance, footer
    // @example windowFooter
    //<
	showFooter:true,
    
	footerConstructor:"HLayout",		

    //>	@attr	window.footerHeight		(number : 18 : IR)
    //
    // The height of the footer, in pixels.
    //
    // @group  appearance, footer
    // @visibility external
    //<
	footerHeight:18,

	footerDefaults:{

        // Note - other defaults applied in Window.makeFooter()

        init : function () {
            this.Super("init", arguments);

            // When a window is edited in editMode, the footer does not have an editNode
            // but needs to be placed into editMode so the editProxy can hook events.
            if (this.creator.editingOn && this.creator.editContext.isReify) {
                this.setEditMode(true, this.creator.editContext);
            }
        },

        // When a drop is targeting the footer in editMode, what color should the 
        // dropLine be? This should be something not matching the header background
        // for commmon skins. 
        dropLineThickness:2,
        dropLineProperties: {
            border: "1px solid #40c040",
            backgroundColor: "#40c040"
        }
    },

    //> @attr window.footerControls (Array of String : (see below) : IR)
    // Array of members to show in the Window footer.  
    // <P>
    // The default value of <code>footerControls</code> is an Array of Strings listing the
    // standard footer controls in their default order:
    // <pre>
    //    footerControls : ["spacer", "resizer"]
    // </pre>
    // As with +link{Window.headerControls}, you can override <code>footerControls</code>
    // to change the order of standard controls in the footer. <code>"spacer"</code> is a special
    // value which will create a +link{LayoutSpacer} in the footer bar. <code>"resizer"</code>
    // will show the +link{window.resizer} in the footer.
    // <P>
    // By embedding a Canvas directly in this list you can add arbitrary additional controls to
    // the footer.  
    // <P>
    // Note that the +link{window.statusBar} is not part of the set of footer controls - it is a
    // separate canvas rendered behind all footer controls. If you include some custom status bar
    // directly in the footerControls you may want to set +link{window.showFooter} to false.
    // <P>
    // Tip: custom controls need to set layoutAlign:"center" to appear vertically centered.
    // <P>
    // <B>Component XML:</B>
    // <P>
    // To define <code>footerControls</code> in Component XML a special set of components
    // are used as markers. The standard footer controls can be explicitly specified as: 
    // <pre>
    //  &lt;footerControls&gt;
    //      &lt;WindowFooterSpacer/&gt;
    //      &lt;WindowResizer/&gt;
    //  &lt;/footerControls&gt;
    // </pre>
    //
    // @visibility external
    //<
    footerControls:["spacer", "resizer"],	
    
	// StatusBar settings
	// ----------------------------------------------------------------------------------------

    //> @attr window.statusBar (AutoChild Canvas : null : R)
    // Simple Canvas-based status bar, shown in the footer.  +link{setStatus()} can be used to
    // show text here.
    // @visibility external
    //<
    
    //>	@attr	window.showStatusBar		(Boolean : true : [IRW])
    // If true, show a statusBar for this Window, including resizer.
    // Note that the status bar will only be displayed if the footer
    // is showing for the window (+link{window.showFooter}).
    //      @visibility external
    //      @group  windowMembers, appearance, footer
    //<
	showStatusBar:true,
    
	statusBarConstructor:"Canvas",		

	statusBarDefaults:{					
		overflow:isc.Canvas.HIDDEN,
		styleName:"windowStatusBar",
        addAsChild:true,
        width:"100%",
		wrap:false,
		leftPadding:5
	},
	

	// Resizer
	// --------------------------------------------------------------------------------------------
    
    //> @attr window.resizer (AutoChild ImgButton : null : R)
    // ImgButton-based resizer, shown in the footer.
    // @visibility external
    //<

    //>	@attr	window.showResizer		(Boolean : true : [IRW])
    // If true, show a button in the lower right corner that allows users to resize the Window.
    // Note that the resizer will only be displayed if the footer is showing for the window
    // (+link{window.showFooter}) and +link{window.canDragResize} is true.
    // @group  windowMembers, appearance, dragging
    // @visibility external
    //<
	showResizer:true,
    
	resizerConstructor:"Img",

	resizerDefaults:{
        canDragResize:true,
		getEventEdge:function(){
		    if (this.creator.resizeFrom.contains("BR")) {
    		    return "BR";
    		} else if (this.creator.resizeFrom.contains("B")) {
    		    return "B";
    		} else if (this.creator.resizeFrom.contains("R")) {
    		    return "R";
    		}
		},
		// Make sure resizer shows at bottom-right of status bar no matter the height
		layoutAlign: "bottom",
		src:"[SKIN]/Window/resizer.gif",
		width:16,
		height:16
	},
	
	// Toolbar
	// ----------------------------------------------------------------------------------------------

    // NOTE: only documented on Dialog

    showToolbar:false,

    toolbarConstructor:"Toolbar",

	toolbarDefaults:{
		height:40,
        layoutMargin:10,
		membersMargin:5,
        overflow:"visible"
	},

    // Edges
    // ---------------------------------------------------------------------------------------
    // show custom edges as a child Canvas, top and bottom only by default.
    customEdges:["T", "B"],

    // alternate mode where we create the edgedCanvas as a child and use layoutMargins to place
    // members.  No known advantages.
    //edgesAsChild:true,

    // ---------------------------------------------------------------------------------------

	// set overflow to hidden; nothing should ever overflow the Window.  We need to be overflow
    // "hidden" even if the body clips, since the Window can be minimized.
    overflow:"hidden",

    //> @attr window.placement (PanelPlacement : null : IR)
    // Where should the window be placed on the screen? Valid settings include
    // <code>"fillScreen"</code>, <code>"fillPanel"</code>, <code>"halfScreen"</code>
    // and <code>"none"</code>
    // <P>
    // If not explicitly specified, default is to use +link{PanelPlacement} "fillScreen" 
    // if +link{Browser.isHandset}, and "none" for non-handset devices.
    // <P>
    // If <code>window.placement</code> is something other than <code>"none"</code>,
    // sizing and positioning settings (either explicit left, top, width, height settings or
    // the +link{autoCenter} and +link{autoSize} features) will have no effect.
    //
    // @visibility external
    //<

    //> @attr window.showEdges (Boolean : null : IR)
    // <code>showEdges</code> dynamically defaults to false when the +link{placement} setting
    // indicates the Window will be filling a portion of the screen or a panel.
    // @visibility external
    //<

    //> @attr window.showShadow (Boolean : null : IR)
    // Whether to show a drop shadow for this Canvas. 
    // <P>
    // Developers should be aware that the drop shadow
    // is drawn outside the specified width and height of the widget meaning a widget with shadows 
    // takes up a little more space than it otherwise would. A full screen canvas with showShadow set 
    // to true as this would be likely to cause browser scrollbars to appear - developers can handle
    // this by either setting this property to false on full-screen widgets, or by setting
    // overflow to "hidden" on the &lt;body&gt; element  browser-level scrolling is never intended to occur.
    // <P>
    // <code>showShadow</code> dynamically defaults to false when the +link{placement} setting
    // indicates the Window will be filling a portion of the screen or a panel.
    //
    // @visibility external
    //<

    //> @attr window.fillSpaceStyleName (CSSStyleName : "windowBackgroundFill" : IR)
    // Alternative style for the window used whenever +link{placement} settings indicate the
    // menu will be filling a portion of the screen or a panel.  Generally this alternative
    // style should not have rounded or excessively large edges.
    // @visibility external
    //<
    fillSpaceStyleName: "windowBackgroundFill"
});	// END	Window.addProperties()



//!>Deferred

isc.Window.addMethods({

    
    init : function (a, b, c) {
        // if left/top have been provided as valid instance properties, set autoCenter: false
        if (this.autoCenter && this.left != null && this.top != null &&
            (this.hasOwnProperty("left") || this.hasOwnProperty("top")))
        {
            this.autoCenter = false;
        }
        // if three or fewer arguments provided, use high-speed call to super
        return arguments.length > 3 ?  this.Super("init", arguments) :
            this.invokeSuper(isc.Window, "init", a, b, c);
    },

//>	@method	Window.initWidget()	(A)
//			Initialize this window. 
//<
initWidget : function () {

    if (this.minimized && this.maximized) {
        this.logWarn("Window initialized with maximized and minimized both set to true. " +
                     "This is unsupported. The Window will be rendered minimized.");
        this.maximized = false;
    }

    // If this.minimized is true, call this.minimize() to set up minimized height, etc.
    if (this.minimized) {
        // clear out the property to avoid any confusion (currently we don't have a no-op check
        // in there but we may introduce one at some point)
        this.minimized = null;
        this.minimize();
    } else if (this.maximized) {
        this.maximized = null;
        this.maximize();
    }

    /*
    // edges as child mode.  Currently, no known advantages.
    if (this.showEdges) {
        var edge = this._createEdges(),
            edgesAsChild = this.edgesAsChild;

        // if edgesAsChild is true, we have no automatically created native margins, so we need
        // to use the Layout margin settings to cause our members (eg the header) not to
        // overlap the edges we are configured to show.
        if (edgesAsChild) {
            this.layoutLeftMargin = edge._leftMargin;
            this.layoutRightMargin = edge._rightMargin;
            this.layoutTopMargin = edge._topMargin;
            this.layoutBottomMargin = edge._bottomMargin;
        }
    }
    */

    if (this.autoSize) {
        this.overflow = "visible";
        this.neverExpandWidth = true;
        this.neverExpandHeight = true;
    }

    // Duplicate header/footer controls arrays because they can be manipulated individually
    // in editMode
    this.headerControls = this.headerControls.duplicate();
    this.footerControls = this.footerControls.duplicate();

	this.Super(this._$initWidget);

    // if we're not drawn, clear any specified items that are currently drawn
    // (Note: we could use 'addItems' to achieve this too)
    if (!this._isInitialized && this.items != null) {
        for (var i = 0; i < this.items.length; i++) {
            if (isc.isA.Canvas(this.items[i]) && this.items[i].isDrawn()) this.items[i].clear();
        }
    }        
    
    if (!this.placement && isc.Browser.isHandset) {
        this.placement = "fillScreen";
    }  

    if (this.placement == "fillScreen" || this.placement == "halfScreen" || 
            this.placement == "fillPanel")
    {
        this.setStyleName(this.fillSpaceStyleName);
        this.setShowShadow(false);
        this.showEdges = false;
        if (this.autoSize) {
            this._restoreAutoSize = true;
            this.setAutoSize(false);
        }
        this.moveTo(0,0);
        if (this.placement == "halfScreen") {
            this.resizeTo("50%", "100%");
        } else {
            this.resizeTo("100%", "100%");
        }
        this._showComponents();
    }
},

createChildren : function () {

	this.makeHeader();
    
	// make the body of the Window, and set up the items in the Window as children of the body
	this.makeBody();

    // Set this.minBreadthMember to the body - this is a Layout feature where a member can
    // be used to drive the breadth available to other members.
    // In other words, if the body overflows the avalable space horizontally due to
    // autoSize:true, which sets bodyOverflow to "visible", we size the header and footer etc
    // to match it.
    this.minBreadthMember = this.body;

    this.makeToolbar();
    
	this.makeFooter();

    this._isInitialized = true;
},

makeToolbar : function () {
    this.addAutoChild("toolbar", {
			buttons:this.toolbarButtons,
            // hide initially if we're minimized
            visibility : this.minimized ? isc.Canvas.HIDDEN : isc.Canvas.INHERIT
    });
},

setShowToolbar : function (showToolbar) {
    if (showToolbar == this.showToolbar) return;
    this.showToolbar = showToolbar;
    if (!this._isInitialized) return;
    if (showToolbar) {
        if (!this.toolbar) this.makeToolbar();
        else if (!this.toolbar.isDrawn()) this.toolbar.draw();
    } else {
        if (this.toolbar && this.toolbar.isDrawn()) this.toolbar.clear();
    }

},

//>	@method	Window.draw()	(A)
//		@group	drawing
//			Override draw to create the various sub-components and arrange their zOrder appropriately
//
//		@return	(boolean)	true if drawn successfully; false if not drawn for some reason
//<
draw : function (a,b,c,d) {
    if (isc._traceMarkers) arguments.__this = this;

	if (!this.readyToDraw()) return this;

    // create children (unless we've been clear()d and are being drawn for a second time)
    if (!this._isInitialized) this.createChildren();

	// call the superclass draw to actually draw the components, including the body
	return this.invokeSuper(isc.Window, "draw", a,b,c,d);
},


// Because we lazily add our items as children on draw, if we've never been drawn we will have
// to explicitly destroy members of our items array.
destroy : function () {
    if (!this._isInitialized) {
        var items = this.items;
        if (!isc.isAn.Array(items)) items = [items];
        for (var i = 0; i < items.length; i++) {
            if (isc.isA.Canvas(items[i])) items[i].destroy();
        }
    }
    
    this.items = null;
    this.destroyModalMask();
    
    return this.Super("destroy", arguments);
},

// Bring Windows to front on mouseUp.

mouseUp : function () {
    if (this.shouldBringToFront()) this.bringToFront(true);
    this.Super("mouseUp", arguments);
},

//> @attr window.bringToFrontOnMouseUp (boolean : true : IRW)
// Should this window automatically be shown at the top of the page's z-order and
// be brought to front via +link{canvas.bringToFront()} whenever the user clicks it?
// <P>
// If +link{isModal} is true for this window, this setting will have no effect - we
// always bring the window to the front on initial display and on mouseDown.
// By default we also do this for non-modal windows (which matches user expectation for
// most standard interfaces - think of switching between OS-level application windows), but 
// this may be disabled for cases where it is not appropriate by setting this attribute to
// <code>false</code>
// @visibility external
//<
// As an aside an actual drag-reposition will still bring the window to the front even if this
// flag is set to false - handled by EventHandler for all Canvii.
bringToFrontOnMouseUp:true,
shouldBringToFront : function () {
    return (this.bringToFrontOnMouseUp || this.isModal) && !isc.Canvas._isInFront(this);
},

// Header Methods
// -----------------------------------------------------------------------------------------------
// These are methods that construct the header. Window.setHeader() is the main method. 
// It calls the make() methods of its constituent components to set them up and lay
// them out.
//

// declare relationships of children of header
autoChildParentMap : {
    resizer : "footer",
    statusBar : "footer",
    headerBackground : "header",
    headerIcon : "header",
    headerLabel : "header",
    minimizeButton : "header",
    maximizeButton : "header",
    closeButton : "header",
    toolbar : "body"
},

//>	@method	window.setHeader()
//		@group	appearance
//			initialize the header and its components.
//			if placement parameters are given, then lay out the header.
//
//		@param left		(number) left position of header
//		@param top		(number) right position of header
//		@param width	(number) width of header
//		@param height	(number) height of header
//<
makeHeader : function () {
	// the header is first created, then its children.
    var headerProps = {
        width: "100%",
        styleName: this.headerStyle,
        printStyleName: this.printHeaderStyle
    };

    var header = this.addAutoChild("header", headerProps, null, null, 0);

    if (header == null) return; // not showing a header

	// create children once the header has been created
    this._headerDynamicDefaults = headerProps;

    var headerBackground = this.addAutoChild("headerBackground", {
        // src will be picked up only by an Img/StretchImg
        src:this.headerSrc,
        canDragReposition: true,
        dragTarget: this
    });
    if (headerBackground) headerBackground.sendToBack();

    if (!this.showTitle && this.showTitleAsHeaderContents) {
        header.setContents(this.title);
    }

    this.createHeaderControls();
},

createHeaderControls : function () {
    // if the window is in minimized state before we draw, swap in the restore button
    // autoChild defaults so we get the restore button to draw instead.
    if (this.minimized) {
        this._minimizeButtonDefaults = this.minimizeButtonDefaults;
        this._minimizeButtonProperties = this.minimizeButtonProperties;
        this.minimizeButtonDefaults = this.restoreButtonDefaults;
        this.minimizeButtonProperties = this.restoreButtonProperties;

    // Ditto with the maximize button
    } else if (this.maximized) {
        this._maximizeButtonDefaults = this.maximizeButtonDefaults;
        this._maximizeButtonProperties = this.maximizeButtonProperties;
        this.maximizeButtonDefaults = this.restoreButtonDefaults;
        this.maximizeButtonProperties = this.restoreButtonProperties;
    }
    
    // instantiate the header buttons in left-> right order so the tab order is appropriate
    // when we allow tabbing through them.
    for (var i = 0; i < this.headerControls.length; i++) {
        var child = this.headerControls[i];
        if (child._markerName && !child.editNode) {
            // Marker not used in EditMode - replace it with a string marker
            this.headerControls[i] = child._markerName;
            if (!this.editingOn) child.destroy();
            child = this.headerControls[i];
        }
        this.addControlAutoChild(child, this.header);
    }

    if (this.minimized) {
        this.minimizeButtonDefaults = this._minimizeButtonDefaults;
        this.minimizeButtonProperties = this._minimizeButtonProperties;
        this._minimizeButtonDefaults = this._minimizeButtonProperites = null;
    } else if (this.maximized) {
        this.maximizeButtonDefaults = this._maximizeButtonDefaults;
        this.maximizeButtonProperties = this._maximizeButtonProperties;
        this._maximizeButtonDefaults = this._maximizeButtonProperites = null;
    }        
},

setHeaderProperties : function (newHeaderProperties) {
    this.headerProperties = newHeaderProperties;
    if (this.header != null) {
        newHeaderProperties = isc.addProperties({}, newHeaderProperties);
        
        for (var propName in this._headerDynamicDefaults) {
            delete newHeaderProperties[propName];
        }
        this.header.setProperties(newHeaderProperties);
    }
},

removeHeader : function () {
    // Remove existing header controls
    for (var i = 0 ; i < this.headerControls.length; i++) {
        this.destroyOrRemoveControl(this.headerControls[i], this.header);
    }
    if (this.headerLabelParent) {
        this.destroyOrRemoveControl("headerLabelParent", this.header);
    }
    if (this._headerLabelLayout) {
        this.destroyOrRemoveControl("headerLabelLayout", this.header);
        this._headerLabelLayout.destroy();
        this._headerLabelLayout = null;
    }
    this.destroyOrRemoveControl("header", this);
},

//> @method window.setHeaderStyle()
// Setter for +link{attr:headerStyle,headerStyle}.
// @param newHeaderStyle (CSSStyleName) new +link{Canvas.styleName,styleName} for the +link{attr:header,header}.
// @visibility external
//<
setHeaderStyle : function (newHeaderStyle) {
    this.headerStyle = newHeaderStyle;
    if (this.header != null) this.header.setStyleName(newHeaderStyle);
},

setHeaderControls : function (headerControls) {
    if (this.headerControls == headerControls) return;
  
    var oldHeaderControls = this.headerControls;
    
    this.headerControls = headerControls;
    
    if (this.header == null) return;

    // Remove existing header controls
    for (var i = 0 ; i < oldHeaderControls.length; i++) {
        this.destroyOrRemoveControl(oldHeaderControls[i], this.header);
    }
    if (this.headerLabelParent) {
        this.destroyOrRemoveControl("headerLabelParent", this.header);
    }
    if (this._headerLabelLayout) {
        this.destroyOrRemoveControl("headerLabelLayout", this.header);
        this._headerLabelLayout.destroy();
        this._headerLabelLayout = null;
    }

    // Create replacement header controls
    this.createHeaderControls();
},

addHeaderControl : function (control, index) {
    // On first call to addHeaderControl clear the header
    if (isc._loadingNodeTree && !this._addingHeaderControls) {
        this._addingHeaderControls = true;
        this.setHeaderControls([]);
    }

    if (this.header) {
        if (control._markerName && !control.editNode) {
            // Marker not used in EditMode - replace it with a string marker
            var markerControl = control;
            control = control._markerName;
            if (!this.editingOn) markerControl.destroy();
        }

        var position = index;
        // In editMode when a header control is provided it is indexed within the editTree
        // components rather than the header layout. Allow the editProxy to map the index
        // to the proper position within the layout.
        if (position != null && this.editingOn && this.editProxy) {
            position = this.editProxy.mapIndexToDropPosition(this.headerControls, index);
        }

        
        this._nextHeaderControlPosition = position;
        this.addControlAutoChild(control, this.header, position);
        delete this._nextHeaderControlPosition;
    }
    // Maintain the headerControls array matching the actual members
    if (index == null) this.headerControls.add(control._markerName || control);
    else this.headerControls.addAt(control._markerName || control, index);

    // Keep up with fact that headerControls are not default anymore
    this._headerControlsChanged = true;
},

removeHeaderControl : function (control) {
    control = control._markerName || control;
    if (this.header) {
        var controls = this.headerControls;
        if (!isc.isAn.Array(controls)) controls = [controls];
        for (var i = 0; i < controls.length; i++) {
            var headerControl = controls[i];
            if (control == headerControl) {
                this.destroyOrRemoveControl(control, this.header);
                this.headerControls.remove(control);
                break;
            }
        }
        if (control == "headerLabel") {
            if (this.headerLabelParent) {
                this.destroyOrRemoveControl("headerLabelParent", this.header);
                this.headerLabelLayout = null;
            }
            if (this._headerLabelLayout) {
                this.destroyOrRemoveControl("headerLabelLayout", this.header);
                this._headerLabelLayout.destroy();
                this._headerLabelLayout = null;
            }
        }
    }

    // Keep up with fact that headerControls are not default anymore
    this._headerControlsChanged = true;
},

haveHeaderControlsChanged : function () {
    return this._headerControlsChanged;
},

addControlAutoChild : function (child, parent, index, properties) {
    if (isc.isA.Canvas(child) && !child._markerName) {
        parent = parent || this;
        this._addAutoChildToParent(child, parent, index);
        return;
    }
    // string name, or block of properties specifying an autoChild
    this.addAutoChild(child._markerName || child, properties, null, parent, index);
},

destroyOrRemoveControl : function (control, parent) {
    var ID = (isc.isA.String(control) ? control : control.ID),
        control = (isc.isA.String(control) ? this[control] : control)
    ;

    // Remove control from parent
    if (parent.getMember(control)) {
        parent.removeMember(control);
    }

    // For autoChildren destroy them
    if (this._createdAutoChildren[ID]) {
        delete this[ID];
        if (control) control.destroy();
        delete this._createdAutoChildren[ID];
    }
},

// The way auto-children work is that if show[childName] is false, they aren't created as
// part of addAutoChild()
// This means that simply setting the show[headerControl] attributes after initial call to 
// makeHeader will fail to ever create / show these controls.
// Therefore have a method to explicitly create and show the header controls at runtime
setShowHeaderControl : function (controlName, show, showControlAttrName) {
    var headerControls = this.headerControls;
    if (!headerControls.contains(controlName)) {
        this.logWarn("request to show/hide header control with name:" + controlName + 
                     ". No such control is present in this.headerControls - ignoring.");
        return;
    }
    if (!showControlAttrName)
        showControlAttrName = "show" + 
                              controlName.substring(0,1).toUpperCase() + controlName.substring(1);
                              
    if (this[showControlAttrName] == show) return;
    this[showControlAttrName] = show;
    
    // If we've never created our header - don't worry - our headerControls will be updated
    // if/when we do create the header
    if (this.header == null) return;
    
    if (this[controlName]) {
        if (show) this[controlName].show();
        else this[controlName].hide();
    } else if (show) {
        var slot = 0;
        for (var i = 0; i < headerControls.length; i++) {
            if (headerControls[i] == controlName) break;
            if (this[headerControls[i]]) slot++;
        }
        this.addAutoChild(controlName, null, null, this.header, slot);
        this[controlName].show();
    }    
},

//> @method Window.setShowCloseButton()
// Dynamically update +link{window.showCloseButton} to show / hide the closeButton
// @see window.headerControls
// @see window.showCloseButton
// @visibility external
// @group windowHeader
//<
setShowCloseButton : function (show) {
    this.setShowHeaderControl("closeButton", show, "showCloseButton");
},

//> @method Window.setShowMinimizeButton()
// Dynamically update +link{window.showMinimizeButton} to show / hide the minimizeButton
// @see window.headerControls
// @see window.showMinimizeButton
// @visibility external
//<
setShowMinimizeButton : function (show) {
    this.setShowHeaderControl("minimizeButton", show, "showMinimizeButton");
},


//> @method Window.setShowMaximizeButton()
// Dynamically update +link{window.showMaximizeButton} to show / hide the maximizeButton
// @see window.headerControls
// @see window.showMaximizeButton
// @visibility external
//<
setShowMaximizeButton : function (show) {
    this.setShowHeaderControl("maximizeButton", show, "showMaximizeButton");
},

//> @method Window.setShowHeaderIcon()
// Dynamically update +link{window.showHeaderIcon} to show / hide the headerIcon
// @see window.headerControls
// @see window.showHeaderIcon
// @visibility external
//<
setShowHeaderIcon : function (show) {
    this.setShowHeaderControl("headerIcon", show, "showHeaderIcon");
},


// Use dynamicDefaults to suppress focus on header buttons if appropriate

_headerButtonComponents:{
    "maximizeButton":true,
    "minimizeButton":true,
    "restoreButton":true,
    "closeButton":true
},
getDynamicDefaults : function (childName) {
    if (this._headerButtonComponents[childName]) {
        return { canFocus : this.canFocusInHeaderButtons };
    }
},

// custom autoChild maker function for the headerLabel, because it is currently wrapped inside
// a Canvas used for clipping
headerLabelLayoutDefaults: {
    overflow: "hidden",
    width: "100%",
    height: "100%",

    // Override getCurrentCursor so we show the drag reposition cursor
    // rather than the default pointer.
    getCurrentCursor : function () {
        if (this.parentElement) 
            return this.parentElement.getCurrentCursor();
        return this.Super("getCurrentCursor", arguments);
    },

    _maybeFixHeaderLabelOverflow : function () {
        var creator = this.creator;
        creator._maybeMeasureHeaderLabel();
        if (creator._measuredHeaderLabelWidth != null) {
            var headerLabel = creator.headerLabel;
            // If the title is longer than the available space, set the headerLabel's overflow
            // to "hidden" so that the title will be clipped by an ellipsis.
            if (this.getInnerContentWidth() < creator._measuredHeaderLabelWidth) {
                // Specify a reason of "overflow" so that Layout.childResized() does not set
                // the headerLabel's _userWidth to "100%".
                if (headerLabel._origUserWidth == null) {
                    headerLabel._origUserWidth = headerLabel._userWidth || 1;
                }
                headerLabel.resizeTo("100%", null, null, null, "overflow");
                headerLabel.setOverflow(isc.Canvas.HIDDEN);

            // Otherwise, switch back to the _userWidth or auto-fitting the width.
            } else {
                var userWidth = headerLabel._origUserWidth;
                if (userWidth == null) userWidth = headerLabel._userWidth;
                headerLabel.resizeTo(userWidth || 1,
                                     null, null, null, "overflow");
                headerLabel.setOverflow(isc.Canvas.VISIBLE);
            }
        }
    },

    onDraw : function () {
        this._maybeFixHeaderLabelOverflow();
    },

    resized : function () {
        this._maybeFixHeaderLabelOverflow();
    },

    visibilityChanged : function (isVisible) {
        this._maybeFixHeaderLabelOverflow();
    }
},
headerLabel_autoMaker : function () {
	// if we're not showing a headerLabel,
	if (!this.showTitle) {
		// clear the headerLabel property
        if (this.headerLabel) {
            this.headerLabel.destroy();
		    this.headerLabel = null;
        }
        if (this.headerLabelParent) {
            this.headerLabelParent.destroy();
            this.headerLabelParent = null;
        }
		// and get outta dodge
		return;
	}

    
    var headerLabelParent = this.headerLabelParent = this.createAutoChild("headerLabelParent");

    this.setCanDragReposition(this.canDragReposition);

    var headerLabelProps = this._headerLabelDynamicDefaults = {
        height: "100%",
        contents: this.title,
        dragTarget: this,
        // Override getCurrentCursor so we show the drag reposition cursor rather than the default pointer.
        getCurrentCursor : function () {
            var parentElement = this.parentElement;
            if (parentElement != null) {
                return parentElement.getCurrentCursor.apply(parentElement, arguments);
            }
            return this.getClass()._instancePrototype.getCurrentCursor.apply(this, arguments);
        }
    };
    var headerLabel = this.headerLabel = this.createAutoChild("headerLabel", headerLabelProps);

    // Add the headerLabel to an HStack layout to allow the label to have
    // a layoutAlign "right" in RTL mode (set in headerLabelDefaults).
    var rtlFix = this._headerLabelLayout = this.createAutoChild("headerLabelLayout", {
        members: [headerLabel]
    }, isc.HStack);

    
    var headerLabelMeasurerProps = this._headerLabelMeasurerDynamicDefaults = {
        top: -9999,
        width: 1,
        canFocus: false,
        overflow: isc.Canvas.VISIBLE,
        visibility: isc.Canvas.INHERIT,
        contents: !isc.screenReader ? this.title : isc._emptyString,
        align: isc.Canvas.LEFT,
        ariaRole: "presentation",
        ariaState: {
            hidden: true
        }
    };
    var headerLabelMeasurer = this._headerLabelMeasurer = this.createAutoChild("headerLabel", headerLabelMeasurerProps);
    rtlFix.addChild(headerLabelMeasurer);

    this.headerLabelParent.addChild(rtlFix);
    this.header.addMember(headerLabelParent, this._nextHeaderControlPosition);

    
},
_maybeMeasureHeaderLabel : function () {
    var headerLabelMeasurer = this._headerLabelMeasurer;
    if (headerLabelMeasurer != null &&
        this._measuredHeaderLabelWidth == null &&
        headerLabelMeasurer.isDrawn() &&
        headerLabelMeasurer.isVisible())
    {
        
        if (isc.screenReader) {
            headerLabelMeasurer.setContents(this.title);
            headerLabelMeasurer.redrawIfDirty();
        }
        this._measuredHeaderLabelWidth = headerLabelMeasurer.getVisibleWidth(true);
        if (isc.screenReader) {
            headerLabelMeasurer.setContents(isc._emptyString);
            headerLabelMeasurer.redrawIfDirty();
        }
    }
},

setHeaderLabelProperties : function (newHeaderLabelProperties) {
    this.headerLabelProperties = newHeaderLabelProperties;
    if (this.headerLabel != null) {
        var props;

        props = isc.addProperties({}, newHeaderLabelProperties);
        
        for (var propName in this._headerLabelDynamicDefaults) {
            delete props[propName];
        }
        this.headerLabel.setProperties(props);

        // Also update the _headerLabelMeasurer
        props = isc.addProperties({}, newHeaderLabelProperties);
        
        for (var propName in this._headerLabelMeasurerDynamicDefaults) {
            delete props[propName];
        }
        this._headerLabelMeasurer.setProperties(props);

        // .. and re-measure the header label
        this._measuredHeaderLabelWidth = null;
        
        if (!isc.screenReader) {
            this._headerLabelMeasurer.setContents(this.title);
            this._headerLabelMeasurer.redrawIfDirty();
        } else {
            this._headerLabelMeasurer.setContents(isc._emptyString);
        }
        this._headerLabelLayout._maybeFixHeaderLabelOverflow();
    }
},

//> @method window.setTitle()
// Sets the +link{attr:title,title} that appears in the window +link{attr:header,header}.
// The header will be redrawn if necessary.
// @group appearance, headerLabel, i18nMessages
// @param newTitle (HTMLString) new title.
// @visibility external
//<
setTitle : function (newTitle) {
	if (newTitle) this.title = newTitle;
	if (!this.header) return;
    // if a header label exists, set the title on that, otherwise set it on the header
    if (this.headerLabel != null) {
        this._measuredHeaderLabelWidth = null;
        
        if (!isc.screenReader) {
            this._headerLabelMeasurer.setContents(this.title);
            this._headerLabelMeasurer.redrawIfDirty();
        }
        this._headerLabelLayout._maybeFixHeaderLabelOverflow();
        this.headerLabel.setContents(this.title);
    } else if (this.showTitleAsHeaderContents) {
        this.header.setContents(this.title);
    }
},

//> @method window.setShowTitle()
// Updates whether the +link{attr:title,title} is shown in the +link{attr:header,header}.
// No impact unless the header is being shown.  The header will be redrawn if necessary.
// @group windowHeader, appearance, headerLabel
// @param newShowTitle (Boolean) new showTitle
// @visibility external
//<    
setShowTitle : function (newShowTitle) {
    if (this.showTitle == newShowTitle) return;
    this.showTitle = newShowTitle;
    if (this.header && this._isInitialized) this.headerLabel_autoMaker();
},

// Toolbar Methods
// -----------------------------------------------------------------------------------------------
// These are methods that construct the toolbar.
//

//>	@method	dialog.setButtons()
// Set the buttons for the toolbar displayed in this dialog.
// Synonym for +link{dialog.setToolbarButtons()}
// @param	newButtons	(Array of Button | Array of Button Properties: null) buttons for the toolbar
// @visibility external
//<

setButtons : function (newButtons) {
    return this.setToolbarButtons(newButtons);
},

// Exposed at the Dialog level, where we also expose the toolbarButtons attribute
//>	@method	dialog.setToolbarButtons()
// Set the +link{dialog.toolbarButtons} for this dialog.
// Synonym for +link{dialog.setButtons()}.
// @param	newButtons	(Array of Button | Array of Button Properties: null) buttons for the toolbar
// @visibility external
//<
setToolbarButtons : function (newButtons) {
	this.toolbarButtons = newButtons;
	if (!this._isInitialized) return;
    if (newButtons) {
        if (!this.toolbar) this.setShowToolbar(true);
        this.toolbar.setButtons(newButtons);
    } else {
        this.toolbar.setButtons(newButtons);
        if (this.showToolbar) this.setShowToolbar(false);
    }
},


// Footer Methods
// -----------------------------------------------------------------------------------------------
// These are methods that construct the footer. Window.setFooter() is the main method. 
// It calls the make() methods of its constituent components to set them up and lay
// them out.
//

//>	@method	window.setFooter()
//		@group	appearance
//			initialize the footer and its components.
//			if placement parameters are given, then lay out the footer.
//
//		@param left		(number) left position of footer
//		@param top		(number) right position of footer
//		@param width	(number) width of footer
//		@param height	(number) height of footer
//<
makeFooter : function () {
	// if not showing a footer, bail
	if (!this.showFooter) return;
    this.addAutoChild("footer", {height:this.footerHeight});
    
    if (!this.footer) return;
    for (var i = 0; i < this.footerControls.length; i++) {
        var control = this.footerControls[i], 
            properties = {},
            markerName = (isc.isA.String(control) || control._markerName ? (control._markerName || control) : null)
        ;
        if (control._markerName && !control.editNode) {
            // Marker not used in EditMode - replace it with a string marker
            this.footerControls[i] = control._markerName;
            if (!this.editingOn) control.destroy();
            control = this.footerControls[i];
        }
        
        if (markerName == "spacer") {
            control = isc.LayoutSpacer.create();
            markerName = null;
        }
        if (markerName == "resizer") {
            if (!this.canDragResize) continue;
            properties.dragTarget = this;
        }
        properties.visibility = this.minimized ? isc.Canvas.HIDDEN : isc.Canvas.INHERIT;

        this.addControlAutoChild(control, this.footer, null, properties);

        if (markerName) {
            this.addAutoChild(markerName, properties, null, this.footer);
        } else {
            if (isc.isA.Canvas(control)) control.setProperties(properties);
            else isc.addProperties(control, properties);
            
            this.footer.addMember(control);
        }
    }
    

    // status bar fills entire width (not a member: extends under resizer)
    // Note that this means the resizer may obscure the borders of the statusBar. This is
    // currently handled by the resizer media
	this.addAutoChild("statusBar", {
        height: this.footer.getHeight(),
        visibility : this.minimized ? isc.Canvas.HIDDEN : isc.Canvas.INHERIT
    });
    
    if (this.status != null) this.setStatus(this.status);
    if (this.statusBar) this.statusBar.sendToBack();
    
},

removeFooter : function () {
    for (var i = 0; i < this.footerControls.length; i++) {
        var control = this.footerControls[i], 
            markerName = (isc.isA.String(control) || control._markerName ? (control._markerName || control) : null)
        ;

        if (markerName == "spacer") {
            control = isc.LayoutSpacer.create();
            markerName = null;
        }
        this.destroyOrRemoveControl(markerName || control, this.footer);
    }
    this.destroyOrRemoveControl("footer", this);
},

addFooterControl : function (control, index) {
    // On first call to addFooterControl clear the footer
    if (isc._loadingNodeTree && !this._addingFooterControls) {
        if (this.footer) {
            // Remove existing footer controls
            var oldFooterControls = this.footerControls; //this.footer.getMembers();
            for (var i = oldFooterControls.length -1; i >= 0; i--) {
                this.destroyOrRemoveControl(oldFooterControls[i], this.footer);
            }
        }
        this.footerControls = [];
        this._addingFooterControls = true;
    }

    if (this.footer) {
        if (control._markerName && !control.editNode) {
            // Marker not used in EditMode - replace it with a string marker
            var markerControl = control;
            control = control._markerName;
            if (!this.editingOn) markerControl.destroy();
        }

        var properties = {},
            markerName = (isc.isA.String(control) || control._markerName ? control._markerName || control : null)
        ;

        if (markerName == "spacer") {
            control = isc.LayoutSpacer.create({ _markerName: "spacer" });
            markerName = null;
        }
        if (markerName == "resizer") {
            if (!this.canDragResize) return;
            properties.dragTarget = this;
        }
        properties.visibility = this.minimized ? isc.Canvas.HIDDEN : isc.Canvas.INHERIT;

        var position = index;
        // In editMode when a footer control is provided it is indexed within the editTree
        // components rather than the header layout. Allow the editProxy to map the index
        // to the proper position within the layout.
        if (position != null && this.editingOn && this.editProxy) {
            position = this.editProxy.mapIndexToDropPosition(this.headerControls, index);
        }

        if (markerName) {
            var child = this.addAutoChild(markerName, properties, null, this.footer);
            // Adding an auto-child always places the child at the end of the
            // members. When a desired index is passed the child needs to be
            // removed and placed at the correct location.
            if (position != null && position < this.footer.getMembersLength()-1) {
                this.footer.removeMember(child);
                this.footer.addMember(child, position);
            }
        } else {
            if (isc.isA.Canvas(control)) control.setProperties(properties);
            else isc.addProperties(control, properties);

            this.footer.addMember(control, position);
        }
    }
    // Maintain the footerControls array matching the actual members
    if (index == null) this.footerControls.add(control._markerName || control);
    else this.footerControls.addAt(control._markerName || control, index);

    // Keep up with fact that footerControls are not default anymore
    this._footerControlsChanged = true;
},

removeFooterControl : function (control) {
    control = control._markerName || control;
    if (this.footer) {
        var controls = this.footerControls;
        if (!isc.isAn.Array(controls)) controls = [controls];
        for (var i = 0; i < controls.length; i++) {
            var footerControl = controls[i];
            if (control == footerControl) {
                this.destroyOrRemoveControl(control, this.footer);
                this.footerControls.remove(control);
                break;
            }
        }
    }

    // Keep up with fact that footerControls are not default anymore
    this._footerControlsChanged = true;
},


haveFooterControlsChanged : function () {
    return this._footerControlsChanged;
},

//> @attr Window.status (String : null : IRW)
// Text to show in the status bar of the window (if one is visible)
// @group appearance
// @visibility external
//<

//>	@method	Window.setStatus()  ([])
//			Sets the text in the status bar of the window, redrawing if necessary.
//		@param statusString (String) new text for the status bar
//		@group	appearance
//      @visibility external
//<
setStatus : function (statusString) {
    this.status = statusString;
	if (this.statusBar == null) return;
    if (statusString == null) statusString = "";
	var leftPadding = (this.statusBar.leftPadding ? isc.Canvas.spacerHTML(this.statusBar.leftPadding,1) : "");
    this.statusBar.setContents(leftPadding + statusString);
    
},


//>	@method	Window.setSrc() ([])
// Sets the URL of the contents to display in the body of the window, redrawing if
// necessary.
//      @visibility external
//		@group	appearance, body
//		@param url (String) URL of new contents to be displayed in the window body
//<
setSrc : function (url) {
	this.src = url;
	if (this.body) this.body.setContentsURL(url);
},



// Misc Make Methods
// -----------------------------------------------------------------------------------------------
// make methods for the body
//


//>	@method	Window.makeBody()	(A)
//		@group	appearance, body
//		 make the body of the Window
//<
makeBody : function() {
	// if not showing the body, bail
	if (!this.showBody) return;
    
    // Body contents can be assigned using the following methods:
	// - The src property can be set to a URL. this will be assigned to the body
	//	 canvas' contentsURL property.
	// - The items property can be set to a string. this will be assigned to the
	//	 contents property of the body canvas.
	// - The items property can be set to an existing canvas or an array of canvases.
	//	 These will be assigned as the body canvas' children.
	var children, contents, contentsURL;
	if (this.src) {
		contentsURL = this.src;	
	} else {
		// determine whether to display the window contents as contents or children of the body
        // canvas
        var items = this.items;
        
        if (isc.isA.Array(items)) {
            // contents are Canvii - duplicate the Array to keep body.children as a distinct
            // array from this.items.
            children = items.duplicate();
        } else if (isc.isA.Canvas(items)) {
            // contents is a single Canvas
            children = items;
        } else {
            // contents is HTML content
            contents = items;
        }
        
        // For the AutoTest module, mark each item as a locationChild of the window
        // (This could also be achieved via a call to addItems or similar
        if (!isc.isAn.Array(items)) items = [items];
        for (var i = 0; i < items.length; i++) {
            
            if (isc.isAn.Object(items[i])) {
                items[i].locatorParent = this;
                isc.Canvas.setCanvasPanelContainer(items[i], this);
            }
        }
	}
    
    // if the bodyConstructor hasn't been set, use the appropriate constructor based on
    // the kind of content we have: 
    // - contentsURL: use an HTMLFlow
    // - contents (as a string): use a Canvas
    // - children 
    //      - if autoSizing, or explicit contentLayout, use a Layout
    //      - otherwise use a Canvas
    if (!this.bodyConstructor) {
        if (contentsURL) {
            // body will be a normal Canvas (containing an IFrame if contentsURL specified)   
            this.bodyConstructor = "HTMLFlow";
        } else if (contents) {
            this.bodyConstructor = "Canvas";
            
        } else {
            // if the Window dictates body size, and contentLayout hasn't been set to none, use
            // a Layout
            if (this.contentLayout != "none") this.bodyConstructor = "Layout";


            // if contentLayout is set to none, use a Canvas
            else this.bodyConstructor = "Canvas";
        }
    }
    

    // NOTE: create items instead of allowing it to happen as the body initializes its children
    // array, so that any autoChildren are created in the context of the Window itself, not the
    // body
    this.createCanvii(children);

    
    if (isc.Browser.isMoz && contentsURL != null) {
        if (!this.body) this.body = {};
        this.body.useClipDiv = false;
    }

	// create the body canvas
    var bodyProps = ("body", {
            contents : contents || "&nbsp;",
            
            
            _generated: false,
            defaultHeight : this.autoSize ? 50 : 100,

			contentsURL : contentsURL,
            contentsType : this.contentsType,
            
            hideUsingDisplayNone: (isc.Browser.isMoz && contentsURL ? true : false),

			styleName : this.bodyStyle,
			printStyleName : this.printBodyStyle,
			backgroundColor : this.bodyColor,
            // hide initially if we're minimized
            visibility : this.minimized ? isc.Canvas.HIDDEN : isc.Canvas.INHERIT,
            
            // for when the body is a Layout/Stack
            vertical : (this.contentLayout == isc.Canvas.VERTICAL),

            // when Window size dictates body size, scroll as needed.  Otherwise, expand to body
            // contents
            overflow:this.autoSize ? "visible" : "auto",

            getBreadthPolicy : function () {
                
                if (this.minBreadthMember == null) {
                    var policy = this.creator.getBodyBreadthPolicy();
                    if (policy != null) return policy;
                }
                return this.Super("getBreadthPolicy", arguments);
            },
            getLengthPolicy : function () {
                var policy = this.creator.getBodyLengthPolicy();
                if (policy != null) return policy;
                return this.Super("getLengthPolicy", arguments);
            }

    });

    // should the window.items become members or children of the body?
    var bodyClass = isc.ClassFactory.getClass(this.bodyConstructor);
    if (bodyClass && bodyClass.isA("Layout")) {
        bodyProps.members = children;
    } else {
        bodyProps.children = children;
    }

    var body = this.addAutoChild("body", bodyProps);
    if (body != null) {
        this._bodyDynamicDefaults = bodyProps;
    }
    
},

// If autoSize is enabled set body breadth policy (hPolicy) to "none"
// This means we'll respect the items' widths and size to them
// horizontally, even if they're applied as canvas.defaultWidth rather than canvas.width
getBodyBreadthPolicy : function () {
    if (this.autoSize) {
        return "none";
    }
    // no explicit return value will cause the standard 'getBreadthPolicy()' logic to run
    // for the body.
},

getBodyLengthPolicy : function () {
    if (this.autoSize) {
        return "none";
    }
},

setBodyProperties : function (newBodyProperties) {
    this.bodyProperties = newBodyProperties;
    if (this.body != null) {
        newBodyProperties = isc.addProperties({}, newBodyProperties);
        
        for (var propName in this._bodyDynamicDefaults) {
            delete newBodyProperties[propName];
        }
        this.body.setProperties(newBodyProperties);
    }
},

//> @method window.setBodyStyle()
// Setter for +link{attr:bodyStyle,bodyStyle}.
// @param newBodyStyle (CSSStyleName) new +link{Canvas.styleName,styleName} for the +link{attr:body,body}.
// @visibility external
//<
setBodyStyle : function (newBodyStyle) {
    this.bodyStyle = newBodyStyle;
    if (this.body != null) this.body.setStyleName(newBodyStyle);
},

//> @method window.setBodyColor()
// Setter for +link{attr:bodyColor,bodyColor}.
// @param newBodyColor (CSSColor) new +link{Canvas.backgroundColor,backgroundColor} for the
// +link{attr:body,body}.
// @visibility external
//<
setBodyColor : function (newBodyColor) {
    this.bodyColor = newBodyColor;
    if (this.body != null && !this._isFlashing) this.body.setBackgroundColor(newBodyColor);
},

//> @method window.setHiliteBodyColor()
// Setter for +link{attr:hiliteBodyColor,hiliteBodyColor}.
// @param newHiliteBodyColor (CSSColor) new <code>hiliteBodyColor</code>.
// @visibility external
//<
setHiliteBodyColor : function (newHiliteBodyColor) {
    this.hiliteBodyColor = newHiliteBodyColor;
},

hasInherentHeight : function () { return this.autoSize; },
hasInherentWidth : function () { return this.autoSize; },

//>	@method	Window.addItem()	([A])
// Adds a widget to the body area of the window.
//      @visibility external
//		@group	windowItems
//      @param  item    (Canvas)    the widget to be added
//      @return (Array) array of widgets added
//<
addItem : function (item, position) {
    return this.addItems([item], position);
},

//>	@method	Window.removeItem() ([A])
// Removes a widget from the body area of the window. 
//      @visibility external
//		@group	windowItems
//      @param  item    (Canvas)    the widget to be removed
//      @return (Array) the array of widgets removed
//<
removeItem : function (item) {
    return this.removeItems([item]);
},

//>	@method	Window.addItems([A])	
//			Adds an array of widgets to the window.
//      @visibility external
//		@group	windowItems
//      @param  items    (Array of Canvas)    an array of widgets to be added
//      @return (Array)  array of widgets added
//<
addItems : function (items, position) {
    if (!isc.isAn.Array(items)) items = [items];
    
    if (!this.items) this.items = [];

    for (var i =0; i < items.length; i++) {
    
        // handle calling code that passes null or undefined
        if (!items[i]) continue;

        // Skip any items we already have
        if (this.items.contains(items[i])) continue;
        
        // add each item to this.items
        if (position != null) this.items.addAt(items[i], position+i);
        else this.items.add(items[i]);
        
        // Explicitly flag this widget as the locatorParent of the widget - used by the
        // AutoTest module
        items[i].locatorParent = this;
        
        items[i].setPanelContainer(this);

        // if the body hasn't been created yet, ensure any drawn items are clear()'d, and return
        if (!this._isInitialized) {
            if (isc.isA.Canvas(items[i]) && items[i].isDrawn()) items[i].clear();
            
        // If the body has been drawn - add the items to it as members/children
        } else {
            // Depending on the contentLayout property the body may be a layout or a straight
            // canvas.  Use addMember if it's there, otherwise just addChild.
            if (this.body.addMember) {
                this.body.addMember(items[i], position != null ? position+i : null);
            } else {
                this.body.addChild(items[i]);
            }
        }
        
    }

    return items;    

},

//>	@method	Window.removeItems([A])	
//			Removes an array of widgets from the window.
//      @visibility external
//		@group	windowItems
//      @param  items   (Array of Canvas) an array of widgets to be removed
//      @return (Array) the array of widgets removed
//<
removeItems : function (items) {

    if (!isc.isAn.Array(items)) items = [items];
    for (var i = 0; i < items.length; i++) {
        delete items[i].locatorParent;
    }
    
    if (this._isInitialized) {    
        if (this.body.removeMembers) this.body.removeMembers(items);
        else {
            for (var i=0; i<items.length; i++) {
                if (items[i].parentElement == this.body) items[i].deparent();
            }
        }
    }
    // Remove from this.items
    this.items.removeList(items);        
    return items;

},

// we're explicitly marked as the "locatorParent" of items - use the 'locatorChildDestroyed' method
// to clean up the items array on items' destroy() calls
locatorChildDestroyed : function (canvas) {
    if (this.items && this.items.contains(canvas)) {
        this.items.remove(canvas);
    } else {
        // Default implementation will clean up any entry in the namedAutoChildren array
        // and any reference to the child tracked by that array
        this.Super("locatorChildDestroyed", arguments);
    }
},


replaceItem : function (oldItem, newItem) {
    if (oldItem == newItem) return oldItem;
    if (newItem == null) return this.removeItem(oldItem);
    if (oldItem == null) return this.addItem(newItem);
    
    for (var i =0; i < this.items.length; i++) {
        if (this.items[i] == oldItem) {

            this.items[i] = newItem;
            
            // if the body hasn't been created yet, ensure any drawn items are clear()'d, and return
            if (!this._isInitialized) {
                if (isc.isA.Canvas(newItem) && newItem.isDrawn()) newItem.clear();
            // If the body has been drawn - add the items to it as members/children
            } else {
                // Depending on the contentLayout property the body may be a layout or a straight
                // canvas.  Use addMember if it's there, otherwise just addChild.

                if (this.body.addMember) {
                    var oldPos = this.body.getMemberNumber(oldItem);
                    this.body.removeMember(oldItem);
                    this.body.addMember(newItem, oldPos);
                } else {
                    this.body.removeChild(oldItem);
                    this.body.addChild(newItem);
                }
            }


            break;
        }
    }
},

//> @method window.addMember() [A]
// Same as +link{layout.addMember()}.  Note that in order to add items to +link{window.body},
// you use +link{window.addItem()} rather than <code>addMember</code>.  Adding a member to 
// a Window adds the member as a sibling to the header, body and other built-in Window
// subcomponents.
// @include layout.addMember()
// @visibility external
//<

//> @method window.addMembers() [A]
// Same as +link{layout.addMembers()}.  Note that in order to add items to +link{window.body},
// you use +link{window.addItem()} rather than <code>addMembers</code>.  Adding a member to 
// a Window adds the member as a sibling to the header, body and other built-in Window
// subcomponents.
// @include layout.addMembers()
// @visibility external
//<

//> @method window.revealChild()
// Reveals the child Canvas passed in by showing it if it is currently hidden.  Note, in the 
// case of Window, "child Canvas" means widgets in the Window's "items" collection as well as 
// real children (the children of a Window - ie, the elements of its "children" array - are 
// its component parts like header and body)
//
// @param child (GlobalId | Canvas)   the child Canvas to reveal, or its global ID
// @visibility external
//<
revealChild : function (child) {
    if (isc.isA.String(child)) child = window[child];
    if (child) {
        if (this.children && this.children.contains(child) && !child.isVisible()) {
            child.show();
        } else {
            // The children of a Window are its component parts - header, body, etc.  The
            // "real" children of a window, as far as the user is concerned, is held in "items"
            if (this.items && this.items.contains(child) && !child.isVisible()) {
                child.show();
            }
        }
    }
},



// Resizing / Layout
// ---------------------------------------------------------------------------------------

// override to handle autoSize:true: make the Window match the body's size
layoutChildren : function (a,b,c,d) {
    if (this.body == null) return;

    if (this._disableAutoSize) {
        this._disableAutoSize = null;
        this.disableAutoSize();
    }

    this.invokeSuper(isc.Window, "layoutChildren", a,b,c,d);
    
    
    var edge = this.edgesAsChild ? this._edgedCanvas : null;
    if (edge) edge.setHeight(this.getVisibleHeight(true));
},


disableAutoSize : function () {
    this.setAutoSize(false);
},

//> @method window.setAutoSize()
// Setter for +link{window.autoSize}
// @param autoSize (boolean) true if the window should auto-size to its content
// @visibility external
//<
setAutoSize : function (autoSize) {
	this.autoSize = autoSize;

    if (autoSize) {
        // If we're embedded in a layout, don't have the layout expand us beyond our
        // specified size by default
        this.neverExpandHeight = true;
        this.neverExpandWidth = true;
        
        // set body overflow and our overflow to visible. We already have the
        // minBreadthMember set to this.body so other members (header/footer) will
        // size to match it horizontally
        if (this.body) {
            this.body.setOverflow("visible");
        }
        this.setOverflow("visible");        
    } else {
        this.neverExpandHeight = false;
        this.neverExpandWidth = false;
        if (this.body) {
            this.body.setOverflow("auto");
        }
        this.setOverflow("hidden");

        
        if (this.header != null) delete this.header._userWidth;
    }
},

// if we are dragResized, disable autoSizing
dragResizeStart : function () {
	if (this.Super("dragResizeStart", arguments) == false) return;
    // set a flag to disable autoSizing the next time we do layout.    
    // NOTE: technically, we should only do this on a successful drag, and for the special case
    // of dragAppearance target, be able to disable autoSizing but re-enable it on drag
    // cancellation.
    if (this.autoSize && isc.EH.dragTarget == this) {
        this.autoSize = false;
        this._disableAutoSize = true;
    }
},

// ---------------------------------------------------------------------------------------

//>	@method	Window.returnValue()
//		@group	data
// 			return a value to the callback function
//				and hide the Window
//
//		@param	value	(Any)	return value for the Window
//<
returnValue : function (value) {
	if (this.isVisible()) this.hide();
	if (this.callback) {
        //this.fireCallback(this.callback, "value", [value]);
        // the above call needs to be delayed to prevent a bug where subsequent dialogs shown
        // from the callback aren't shown when the cancel button is pressed.
        this.delayCall("fireCallback", [this.callback, "value", [value]], 50);
    }
	return value;
},


// event handling
// -------------------------------------------------------------------------------------------------
//

//>	@method	Window.show()
// Show the Window.
// <P>
// When a modal window is shown, it will begin blocking input to any components on the screen other
// than the modal window.
//		@group	appearance
//<
show : function (a,b,c,d) {
    if (isc._traceMarkers) arguments.__this = this;

    if (this.isModal) {

        // 2 kinds of modality:
        // - modalTarget: mask everything within the modal target, link visibility to modalTarget
        // - no modal target: show global clickMask and bring us above it.        
        if (this.modalTarget) {
            if (!isc.isA.Canvas(this.modalTarget) || this.modalTarget.contains(this)) {
                this.logWarn("Invalid modalTarget:" + this.modalTarget + 
                             ". Should be a canvas, and not an ancestor of this Window.");
                delete this.modalTarget;
                this.isModal = false;
            } else {            
                
                this.modalTarget.showComponentMask(
                    null,
                    this.showModalMask ? 
                        {styleName: this.modalMaskStyle, opacity: this.modalMaskOpacity } : 
                        null
                );
                this.observeModalTarget();
            }

        // Explicitly catch the case of a developer specifying isModal on a non top-level window
        // this will be clearer than a log message about clickMasks.
        } else if (this.topElement != null) {
            
            //>EditMode
            if (!this.editProxy && !this.editingOn) {
                this.logWarn("Window specified with 'isModal' set to true, but this window has a " +
                    "parentElement. Only top level Windows can be shown modally.");
               this.isModal = false;
            }
            //<EditMode
        } else {
            this.showClickMask(
                    {
                        target: this,
                        methodName: (this.dismissOnOutsideClick ? "handleCloseClick"
                                                                : "flash")
                    },
                    false,
                    // Don't mask ourselves
                    
                    [this]);
            if (this.showModalMask) this.makeModalMask();
        }
    }

    // If we're modal, set up the "dismissOnEscape" behavior to catch Escape keypresses
    // outside this Window
    if (this.shouldDismissOnEscape() && this.isModal) {
        this._setDismissOnEscapeEvent();
    }

    // If we're going to be auto-centered, draw offscreen before centering
    
    if (this.autoCenter && !this.parentElement) {
        
        this._centering = true;
        
        
        this.moveTo(0, -1000);
        this._centering = false;
    }

    if (this.placement == "fillScreen" || this.placement == "halfScreen") {
        this.moveTo(0, 0);
    }

	this.invokeSuper(isc.Window, "show", a,b,c,d);

	if (this.autoCenter) {
    	// if we're supposed to autoCenter, center in the page
        this.centerInPage();

        // set up an event to keep autoCentering on page resize
        if (!this.parentElement) {
            isc.Page.setEvent(this._$resize, this, null, "parentResized");
        }
    }
    
    if (this.shouldBringToFront()) {
        this.bringToFront(true);
    } else {
        // If we didn't explicitly bring to front, ensure that the initial position of
        // our special peers (most notably our modal-mask) is correct
        this._adjustSpecialPeers(this.zIndex);
    }
    
    if (this._shouldAutoFocus()) {
        this.focusAtEnd(true);
    }
    
},

// internal attribute to determine whether Window.show() will attempt to focus on the first
// focusable entry in the Window.
// It seems like it's always appropriate to do that, but base it on a flag just in case - checked
// in _shouldAutoFocus()
//autoFocus: null,

_shouldAutoFocus : function () {
    // if autoFocus is set, return it
    if (this.autoFocus != null) return this.autoFocus;
	return false;
},

makeModalMask : function () {
    if (!this.showModalMask) return;

    if (!this.modalMask) this.modalMask = this.createAutoChild( "modalMask", 
        { styleName: this.modalMaskStyle, opacity: this.modalMaskOpacity } );
    this.modalMask.show();
},

hideModalMask : function () {
    if (this.modalMask) this.modalMask.hide();
},

destroyModalMask : function () {
    if (this.modalMask) {
        this.modalMask.destroy();
        this.modalMask = null;
    } 
},

// Modal target behavior
// ----------------------------

// if we have a modal target, hide and show / draw and clear with it
observeModalTarget : function () {
    if (this._modalTargetVisibilityChange) return;
    this.observe(this.modalTarget, "show",
                            "observer.modalTargetVisibilityChanged(observed)");
    this.observe(this.modalTarget, "hide",
                            "observer.modalTargetVisibilityChanged(observed)");
    this.observe(this.modalTarget, "clear",
                            "observer.modalTargetVisibilityChanged(observed)");
    this.observe(this.modalTarget, "draw",
                            "observer.modalTargetVisibilityChanged(observed)");
    this.observe(this.modalTarget, "parentVisibilityChanged",
                            "observer.modalTargetVisibilityChanged(observed)");
},

ignoreModalTarget : function () {
    if (this._modalTargetVisibilityChange) return;
    this.ignore(this.modalTarget, "show");
    this.ignore(this.modalTarget, "hide");
    this.ignore(this.modalTarget, "draw");
    this.ignore(this.modalTarget, "clear");
    this.ignore(this.modalTarget, "parentVisibilityChanged");
},

modalTargetVisibilityChanged : function (modalTarget) {
    // set special flag b/c we don't want the hide()/show() calls resulting from our call here
    // to to unregister the observations.
    this._modalTargetVisibilityChange = true;
    if (modalTarget.isVisible() && modalTarget.isDrawn()) this.show();
    else this.hide();
    delete this._modalTargetVisibilityChange;
},

//> @method window.shouldDismissOnEscape()
// Should this window be dismissed (same effect as pressing the "Cancel" button) when the 
// user presses the "Escape" key?<br>
// Default behavior: if +link{window.dismissOnEscape} is set, just return it. Otherwise return
// true if this window is showing a "close" control in the header 
// (see +link{window.headerControls}).
// @return  (Boolean) true if the window should be dismissed when the user hits escape
// @visibility external
//<
shouldDismissOnEscape : function () {
    if (this.dismissOnEscape != null) return this.dismissOnEscape;
    // If we're showing a close button in our header, return true
    return this.showHeader && this.headerControls && 
            this.showCloseButton && this.headerControls.contains("closeButton");
    
},

// Implement dismissOnEscape via the bubbled keyPress event.
// This means that if we don't contain focus, or if "Escape" has meaning to a child (EG LG Editing/
// modal windows) we won't get the event and kill the window.
handleKeyPress : function () {
    var keyName = isc.EH.getKey();
    if (keyName == "Escape" && this.shouldDismissOnEscape()) {
        this.handleEscape();
        return false;
    }
    return this.Super("handleKeyPress", arguments);
},

// handleEscape() - fired when the user hits escape if 'dismissOnEscape' is true.
// Fires closeClick() to dismiss the window. Can potentially be overridden for other
// behavior.
handleEscape : function () {
    // If we're under a clickMask, don't dismiss.
    // This handles the case where we're showing 2 windows, the top one of which is modal
    // In this case we want the user to have to interact with the top window before
    // dismissing the window underneath it.
    if (this.isMasked()) return;
    this.handleCloseClick();
},

// For modal windows with dismissOnEscape:true, we want to intercept Escape keypresses at
// the page level


_setDismissOnEscapeEvent : function () {
    if (this._escapeRegistered) return;
    isc.Page.registerKey("Escape", "target.handlePageLevelEscape()", this);
    this._escapeRegistered = true;
},
_clearDismissOnEscapeEvent : function () {
    if (this._escapeRegistered) {
        isc.Page.unregisterKey("Escape", this);
        this._escapeRegistered = false;
    }
},

// Page level notification of escape keypress 
handlePageLevelEscape : function () {
    // If we have focus, handleEscape is called directly from the bubbled keypress handler
    if (this.containsFocus()) return;
    // If something else is masking us, bail
    if (this.isMasked()) return;
    // Sanity check: we only want to do this for modal windows
    if (!this.isModal) return;

    this.handleEscape();
},


resized : function (a,b,c,d) {
    this.invokeSuper(isc.Window, "resized", a,b,c,d);
    if (this.autoCenter) this.centerInPage();
},

//>	@method	Window.hide()
//			Hide the Window.  Hides the clickMask for modal Windows.
//		@group	appearance
//<
hide : function (delayed, b, c, d) {
    
    if (!delayed && isc.Browser.isKatalon) {
        this.delayCall("hide", [true, b, c, d], 0);
        return;
    }

    //>Animation
    if (this._animatingMinimize) isc.Animation.finishAnimation(this._animatingMinimize);
    //<Animation
    
    this.invokeSuper(isc.Window, "hide", delayed, b, c, d);
	if (this.isDrawn() && this.isModal) {
        if (this.modalTarget) {
            this.modalTarget.hideComponentMask();
            this.ignoreModalTarget();
        } else {
            this.hideClickMask();
            this.hideModalMask();
            this._clearDismissOnEscapeEvent();
        }
    }
},


//> @method Window.clear()
//  When clearing a modal window, also clear the clickMask
// @group appearance
//<
clear : function (delayed, b, c, d) {
    
    if (!delayed && isc.Browser.isKatalon) {
        this.delayCall("clear", [true, b, c, d], 0);
        return;
    }

    //>Animation
    if (this._animatingMinimize) isc.Animation.finishAnimation(this._animatingMinimize);
    //<Animation

    this.invokeSuper(isc.Window, "clear", delayed, b, c, d);
    if (!this.clearingWithModalTarget && this.isVisible() && this.isModal) {
        if (this.modalTarget) {
            this.ignoreModalTarget();
            this.modalTarget.hideComponentMask();
        } else {
            this.hideClickMask();
            this.hideModalMask();
            this._clearDismissOnEscapeEvent();
        }
    }
},

// AutoCenter
// ---------------------------------------------------------------------------------------

// if our parent (or the Page) resizes, autoCenter if configured to do so
parentResized : function () {
    this.Super("parentResized", arguments);
    // auto center, only if we're still set to
    if (this.autoCenter) this.centerInPage();
},

// stop centering if we are moved other than by the autoCentering code itself
handleMoved : function () {
    this.Super("handleMoved", arguments);
    if (this.isDrawn() &&
        !this._centering &&
        // In RTL mode, handleMoved() may be called from adjust overflow. We don't want to switch
        // off auto-centering in that case.
        !this._inAdjustOverflow)
    {
        this.autoCenter = false;
    }
},

//>	@method	Window.centerInPage()   ([A])
// Centers the Window in the page. This is called automatically in window.show() if
// Window.autoCenter is true.
// Note - if the Window is a child of another widget, we center in the parent widget
// rather than centering in the page.
//      @visibility external
//		@group	appearance
//      @see    autoCenter
//<
centerInPage : function () {
    var width  = this.getVisibleWidth(),
        height = this.getVisibleHeight(),
        parent = this.parentElement ? this.parentElement : isc.Page
    ;

    
    var parentWidth = parent.getWidth(),
        left = Math.max(0, parent.getScrollLeft()),
        ratioX = this._centerXRatio;
    if (ratioX != null) {
        left += Math.min(Math.max(0, parentWidth * ratioX - width / 2),
                                     parentWidth          - width);
    } else {
        left += (parentWidth - width) / 2;
    }

    var parentHeight = parent.getHeight(),
        top = Math.max(0, parent.getScrollTop()),
        ratioY = this._centerYRatio;
    if (ratioY != null) {
        top += Math.min(Math.max(0, parentHeight * ratioY - height / 2),
                                    parentHeight          - height);
    } else {
        top += (parentHeight - height) / 2;
    }

    // Don't try to apply decimal positions, don't position top of window off-screen
    left = Math.round(left);
    top = Math.max(Math.round(top),0);

    this._centering = true;
	this.moveTo(left, top);
    this._centering = null;
},

clearCenterOffset : function () {
    delete this._centerXRatio;
    delete this._centerYRatio;
},

// Miscellaneous methods
// -------------------------------------------------------------------------------------------------
//

//>	@method	Window.flash()	([A])
//          Makes the window header flash if it's visible; if there's no header, or the header
//          is hidden, makes the window body flash instead.
//          <p>
//			This method is executed when users click outside the bounds of a modal window
//			so they'll notice that they have to do something with the window.
//      @visibility external
//		@group	modal
//<

flash : function (step) {
    var showHeader = this.showHeader;
    
    if (step == null) {
        // kick off a new flashing cycle

        // Set a 'isFlashing' flag, so we don't attempt to start a new flashing cycle in the
        // middle of a running one.
        if (this._isFlashing) return false; // return false to cancel the click
        this._isFlashing = true;

        step = 0;

        // store off the starting styleNames/backgroundColors/Img sources.  NOTE: 
        if (showHeader) {
			this._headerStyle = this.header.getStateName();
            if (this.headerBackground) {
                this._headerBGStyle = this.headerBackground.getStateName();
    			this._headerBGSrc = this.headerBackground.src;
            }
        } else {
			this._bodyColor = this.body.backgroundColor;
        }
    }
    if (showHeader) {
        // apply the original or flash styles / sources in alternation
		var newStyle = (step % 2 == 0 ? this.hiliteHeaderStyle : this._headerStyle),
		    newSrc = (step % 2 == 0 ? this.hiliteHeaderSrc : this._headerBGSrc),
			newBGStyle = (step % 2 == 0 ? this.hiliteHeaderStyle : this._headerBGStyle);

		this.header.setStyleName(newStyle)
        var background = this.headerBackground;
		if (background) {
            this.headerBackground.setStyleName(newBGStyle)
            if (background.setSrc) background.setSrc(newSrc);
        }
    } else {
        // if there's no header, flash the body
		var newColor = (step % 2 == 0 ? this.hiliteBodyColor : this._bodyColor);
		this.body.setBackgroundColor(newColor);          
    }
    
    step++;
 
	if (step < 4) this.delayCall("flash", [step], 100);
    else this._isFlashing = false;   // clear the isFlashing flag

    return false; // return false to cancel the click
},


//>	@method	Window.minimize()
// Minimize the window. Fired when the user clicks the minimize button if 
// +link{window.showMinimizeButton, this.showMinimizeButton} is true.<br>
// Default implementation shrinks the window to just the height of the header bar, hiding the
// body. If +link{window.animateMinimize, animateMinimize} is true, the resize will be animated.
// A restore button will be displayed in place of the minimize button when the window is 
// minimized.
// @visibility external
//<
minimize : function () {
    // This will hide everything except the header, and size the window to match the header's
    // height.

    //>Animation
    if (this._animatingMinimize) isc.Animation.finishAnimation(this._animatingMinimize);
    //<Animation
    // Put this AFTER the finish animation call so the interrupted animation will have had
    // time to set this.minimized
    if (this.minimized) return;
    
    // remember the height (and specified height) that we were before we were minimized
    // (If currently maximized, assume the 'restore' size has already been stored)
    if (!this.maximized) {
        this._restoreHeight = this.getHeight();
        this._restoreVisibleHeight = this.getVisibleHeight();
        // see comments in 'restore' for explanation of '_userHeight' / '_restoreUserHeight'.
        this._restoreUserHeight = this._userHeight;


        // If we're currently at "restored" size, ensure we explicitly set to this width
        // while minimized.
        // This is required for autoSize:true windows where our visible width is
        // driven by our body's rendered size. On minimize we clear out the 
        // 'minBreadthMember' flag meaning if we don't explicitly size to our current
        // rendered width, our visible width will suddenly shrink to our current
        // specified width.
        this._restoreWidth = this.getWidth();
        this._restoreVisibleWidth = this.getVisibleWidth();
        this._restoreUserWidth = this._userWidth;
    

        // disable drag resize while minimized
        // (No need to do this if we're maximized - already disabled)
        this._canResizeAfterRestore = this.canDragResize;
        this.canDragResize = false;

    // If we're maximized, re-set the maximize button properties 
    // (currently it'll be acting as a restore button)
    } else {
        if (this.maximizeButton) {
            this.maximizeButton.addProperties(this.maximizeButtonDefaults);
            
            this.maximizeButton.redraw();
        }
    }
    
    var minimizeHeight;
    if (this.minimizeHeight) {
        minimizeHeight = this.minimizeHeight;
    // the minimize height defaults to the header height (plus margins) if present
    } else if (this.showHeader) {  
        var headerHeight;
        // header may not be created yet if we are initializing minimized
        if (this.header) {
            headerHeight = this.header.getHeight();
        } else {
            var defaults = this.headerDefaults;
            headerHeight = defaults.height || defaults.defaultHeight;
        }
        minimizeHeight = headerHeight + (this.layoutMargin*2) + this.getVMarginBorderPad();
    } else {
        minimizeHeight = this.defaultMinimizeHeight;
    }
    
    // enable clipping if not enabled, since otherwise if the body or another component is
    // taller than our minimized size, it will show
    if (this.overflow == isc.Canvas.VISIBLE) {
        this.setHeight(this.getVisibleHeight());
    }        

    this._restoreOverflow = this.overflow;
    this.setOverflow("hidden");
    
    // switch minimize button to a restore button before any animation occurs,
    // but disable it until the minimize is complete
    var minButton = this.minimizeButton;
    if (minButton) {
        minButton.addProperties(this.restoreButtonDefaults);
        minButton.markForRedraw();
    }

    //>Animation
    this._minimizeHeight = minimizeHeight;
    if (this.animateMinimize && this.isDrawn() && this.isVisible()) {
        if (minButton) {
            minButton.disable();
            minButton.redraw();
        }
        
        // Remember the sizing / overflow of the body for when we're done minimizing
        this._storeContentRestoreStats();
        // Note: we use the same flag for minimize and restore animation IDs since the same
        // actions (show/hide/resize/minimize/restore) all kill the animation
        this._animatingMinimize = 
            isc.Animation.registerAnimation(this.animateMinimizeStep, 
                                            (this.minimizeTime||this.animateTime), 
                                            this.minimizeAcceleration || this.animateAcceleration,
                                            this);        
    } else {
    //<Animation
        this.completeMinimize(minimizeHeight);
    //>Animation
    }//<Animation
},

// Helper method to store / reset the sizing (etc) of the body for animated minimize and restore
_storeContentRestoreStats : function () {
    if (this.body) {
        this._bodyRestoreScrollTop = this.body.getScrollTop();
        this._bodyRestoreOverflow = this.body.overflow;
        this._bodyRestoreHeight = this.body.getHeight();
        this._bodyRestoreWidth = this.body.getWidth();
        this._bodyRestoreUserHeight = this.body._userHeight;
        this._bodyRestoreUserWidth = this.body._userWidth;
        
        if (this._bodyRestoreOverflow == isc.Canvas.VISIBLE) {
            this.body.resizeTo(this.body.getVisibleWidth(), this.body.getVisibleHeight());
        }
        this.body.setOverflow(isc.Canvas.HIDDEN);
    }
    
    // Footer is overflow visible by default - also make it hidden so we can scroll it
    // and the status / resizer will pop out of view
    // (No need to store the specified size of the footer - this is picked up from the
    // footerHeight property);
    if (this.footer) {
        this._footerRestoreOverflow = this.footer.overflow;
        if (this._footerRestoreOverflow == isc.Canvas.VISIBLE) {
            this.footer.setHeight(this.footer.getVisibleHeight());
        }
        this.footer.setOverflow(isc.Canvas.HIDDEN);
    }
        
},

_resetContentRestoreStats : function () {
    if (this.body) {
        this.body.scrollTo(null, this._bodyRestoreScrollTop, "restore");
        this.body.resizeTo(this._bodyRestoreWidth, this._bodyRestoreHeight);
        // Resetting _userHeight means that the body doesn't have an explicitly specified height
        // so ensures the layout manages its height as it should.
        this.body.updateUserSize(this._bodyRestoreUserWidth, this._$width);
        this.body.updateUserSize(this._bodyRestoreUserHeight, this._$height);
        this.body.setOverflow(this._bodyRestoreOverflow);
    }
    if (this.footer) {
        this.footer.scrollTo(null, 0, "restore");
        this.footer.setHeight(this.footerHeight);            
        this.footer.setOverflow(this._footerRestoreOverflow);
    }

    delete this._bodyRestoreScrollTop;
    delete this._bodyRestoreHeight;
    delete this._bodyRestoreUserHeight;
    delete this._bodyRestoreWidth;
    delete this._bodyRestoreUserWidth;
    delete this._bodyRestoreOverflow;
    delete this._footerRestoreOverflow;
},

// Used for minimize, restore and maximize animations.
animateMinimizeStep : function (ratio, ID, earlyFinish, restore, maximize) {

    var minimizing = (!restore && !maximize);
    
    // If we're currently maximized, recalculate the maximizeHeight / width once at the 
    // beginning of the animation. This is required to catch the case where the stored height
    // represents the size of a different parent / a parent that has changed sizes etc
    if (this.maximized && !this._recalculatedMaxSize) {
        this._maximizeHeight = (this.parentElement ? this.parentElement.getInnerHeight() 
                                                   : isc.Page.getHeight());
        this._maximizeWidth = (this.parentElement ? this.parentElement.getInnerWidth() 
                                                    : isc.Page.getWidth());
        this._recalculatedMaxSize = true;
    }

    
    var initialHeight = this.minimized ? this._minimizeHeight 
                                       : this.maximized ? this._maximizeHeight 
                                                        : this._restoreVisibleHeight,
                                                        
        finalHeight = restore ? this._restoreVisibleHeight 
                              : maximize ? this._maximizeHeight : this._minimizeHeight,
                                
        initialWidth = this.maximized ? this._maximizeWidth : this._restoreVisibleWidth,
        finalWidth  = maximize ? this._maximizeWidth : this._restoreVisibleWidth;
         
    var targetHeight = Math.round(initialHeight + (ratio * (finalHeight - initialHeight))),
        targetWidth = (finalWidth == initialWidth ? finalWidth 
                        : Math.round(initialWidth + (ratio * (finalWidth - initialWidth))));
                        
    var targetInnerHeight = targetHeight - this.getVMarginBorder() - (2*this.layoutMargin) - 
                            (this.showHeader? this.header.getHeight() + this.membersMargin : 0),
                            
        body = (this.showBody ? this.body : null), 
        footer = (this.showFooter ? this.footer : null),
        footerSize = 0, 
        bodySize = 0,
        footerMax = (footer ? this.footerHeight : 0),
        membersMargin = this.membersMargin || 0;
    // At any point during animation (either direction), if there's just, or less than enough 
    // room for the footer, it will be showing and nothing else...
    // If there's enough room for the footer the body will start to show too.
    // So calculate sizes first, then resize / show/hide the necessary widgets
    // NOTE: the toolbar is a child of the body so we don't need to calculate its size
    // and separately show/hide here
    if (footer != null) {
        if (targetInnerHeight <= footerMax) { 
            footerSize = targetInnerHeight
        } else {
            footerSize = footerMax;
        }
    }

    var footerMaxSpace = footer ? footerMax + membersMargin : 0;
    if (body != null && (targetInnerHeight > footerMaxSpace)) {
        bodySize = targetInnerHeight - footerMaxSpace;
    }
    
    //this.logWarn("animation step - size of window:"+ targetHeight +
    //             ", size of body,footer:"+ [bodySize, footerSize]);

    // Actually resize the parts, and if they're clipped, scroll them so they appear to get
    // slid up out of sight.
    if (footer) {
        if (footerSize > 0) {
            if (footer.getHeight() != footerSize) {
                var scrollBottom = footer.getScrollTop() + footer.getViewportHeight();
                footer.resizeTo(null, footerSize);
                footer.scrollTo(null, scrollBottom - footer.getViewportHeight(), "animateMinimize");
            }
            if (!footer.isVisible()) footer.show();

        } else if (footer.isVisible()) {
            footer.hide();
        }
    }
    
    if (body) {
        if (bodySize > 0) {
            if (body.getHeight() != bodySize) {
                var scrollBottom = body.getScrollTop() + body.getViewportHeight();
                body.resizeTo(null, bodySize);
                body.scrollTo(null, scrollBottom - body.getViewportHeight(), "animateMinimize");
            }
            if (!body.isVisible()) body.show();
        } else if (body.isVisible()) {
            body.hide();
        }    
    }
    
    // Move logic - required for maximizing (where we always move the window to zero/zero so it can
    // take up all available space in the page or parent)
    if (maximize || this.maximized) {
        var initialLeft = (maximize ? this._restoreLeft : 0),
            initialTop = (maximize ? this._restoreTop : 0),
            finalLeft = (maximize ? 0 : this._restoreLeft),
            finalTop = (maximize ? 0 : this._restoreTop);
            
        this.moveTo(
            Math.round(initialLeft + (ratio * (finalLeft - initialLeft))),
            Math.round(initialTop + (ratio * (finalTop - initialTop))),
            true
        );
    }
    
    // Call resizeBy directly so we can pass in a special extra param to let it know we're
    // doing an animateMinimize (so don't loop back to 'finish' this animation)
    this.resizeBy(targetWidth - this.getWidth(), targetHeight - this.getHeight(),
                  null, null, this._$animatingMinimize);
    
    if (ratio == 1) {
        
        delete this._recalculatedMaxSize;
        
        // clean up the strange overflow / sizing properties we had to set during the animation
        this._resetContentRestoreStats();
        
        // Animation is complete - no need to track the ID
        delete this._animatingMinimize

        if (restore) this.completeRestore(true);
        else if (maximize) this.completeMaximize(true);
        else this.completeMinimize(this._minimizeHeight, true);
    }
},

animateRestoreStep : function (ratio, ID, earlyFinish) {
    this.animateMinimizeStep(ratio, ID, earlyFinish, true);
},

animateMaximizeStep : function (ratio, ID, earlyFinish) {
    this.animateMinimizeStep(ratio, ID, earlyFinish, null, true);
},

//>Animation
// Override 'isAnimating()' to return true if we're doing an animated minimize/maximize
// Return true for type 'minimize' or type 'rect', since we are changing our size.

isAnimating : function (types, a,b,c,d) {
    if (this.invokeSuper(isc.Window, "isAnimating", types, a,b,c,d)) return true;
    if (types && !isc.isAn.Array(types)) types = [types];
    if (this._animatingMinimize && 
        ((types == null) || (types.contains("minimize")) || (types.contains("rect")))) return true;

    return false;
},
//<Animation

// method fired when minimizing is complete
// Split into a separate function to support animated resize
completeMinimize : function (minimizeHeight, animated) {
    this.minimized = true;
    this.maximized = false;

    if (this.body && this.minBreadthMember == this.body) delete this.minBreadthMember;
    
    // Hide everything except the header
    // (If this was an animated minimize they may already be hidden)
    // Note: toolbar is a child of the body
    // Resizer / status bar etc are children of the footer
    if (this.body && this.body.isVisible()) this.body.hide();
    if (this.footer && this.footer.isVisible()) this.footer.hide();

    

    // make sure the minimize height is respected as a user-specified height for when a Window
    // is being managed by a Layout.  If a Window in a Layout draws normally and then is
    // minimized, the Layout will automatically pick up the minimize size as a user-specified
    // size, but this wouldn't happen if the Window is *initialized minimized*, so we set
    // _userHeight explicitly.
    this.updateUserSize(minimizeHeight, this._$height);

    // If this._restoreWidth is set, we were previously maximized - ensure we shrink to the
    // appropriate width
    if (this._restoreWidth != null) {
        if (!animated) this.setWidth(this._restoreVisibleWidth);
        this.updateUserSize(this._restoreWidth, this._$width);
    }
    
    if (!animated) {
        this.setHeight(minimizeHeight);
        if (this._restoreLeft != null) this.setLeft(this._restoreLeft);
        if (this._restoreTop != null) this.setTop(this._restoreTop);
    }
    if (this._restoreShowShadow != null) this.setShowShadow(this._restoreShowShadow);
    
    if (this._canMoveAfterRestore != null && this.headerLabel) 
        this.headerLabel.parentElement.canDragReposition = this._canMoveAfterRestore;

    delete this._canMoveAfterRestore;
    // position and shadow are the same for minimized and restored windows
    // clear these out now - they will be re-set if required as part of maximize()
    delete this._restoreTop;
    delete this._restoreLeft;
    delete this._restoreShowShadow;
    delete this._restoreWidth;
    if (this.minimizeButton) this.minimizeButton.enable();
},

//>	@method	Window.restore()
// Restores the window to its specified height and width after a call to +link{window.minimize()} or 
// +link{window.maximize()}. Called from a click on the restore button shown in place of the 
// minimize or maximize button when the window is minimized or maximized.<br>
// Resizing will occur as an animation if +link{window.animateMinimize} is true.
// @visibility external
//<
restore : function () {
    if (this.body && this.minBreadthMember != this.body) this.minBreadthMember = this.body;

    //>Animation
    // Calling restore() during a minimize (or maximize/restore) animation must kill it right
    // away
    if (this._animatingMinimize) {
        isc.Animation.finishAnimation(this._animatingMinimize);
    }
    //<Animation
    // If we're already 'restored', return
    // Put this AFTER the finish animation call so the interrupted animation will have had
    // time to set this.minimized / this.maximized
    if (!this.minimized && !this.maximized) return;
    
    if (!this._restoreVisibleHeight) this._restoreVisibleHeight = this.getVisibleHeight();
    
    // switch minimize button back to a minimize button before any animation occurs,
    // but disable it until the restore is complete
    var restoreButton = (this.minimized ? this.minimizeButton : this.maximizeButton);
    if (restoreButton) {
        restoreButton.addProperties(this.minimized ? this.minimizeButtonDefaults 
                                                   : this.maximizeButtonDefaults);
        restoreButton.markForRedraw();                                                   
    }
    
    //>Animation
    if (this.animateMinimize && this.isDrawn() && this.isVisible()) {
        if (restoreButton) {
            restoreButton.disable();
            restoreButton.redraw();
        }
        // Note: before either animated minimize or restore we remember the 'restore' size
        // of the components (the normal drawn size) and at the end of the animation reset them
        // This is cleaner than remembering them before minimize, then resetting them after
        // restore as it should work for the case where a window is drawn initially minimized
        // then restored, etc.
        // This method stores the size / specified size / overflow etc of the footer and body
        this._storeContentRestoreStats();
        
        // Note: we use the same flag for minimize and restore animation IDs since the same
        // actions (show/hide/resize/minimize/restore) all kill the animation
        this._animatingMinimize = 
            isc.Animation.registerAnimation(this.animateRestoreStep, 
                                        (this.minimizeTime || this.animateTime), 
                                        this.minimizeAcceleration || this.animateAcceleration,
                                        this);
    } else {
    //<Animation
        this.completeRestore();
    //>Animation
    } //<Animation
},


// Finishes a restore - if this is an animated restore this will be fired as the callback when
// the resize to the specified size completes.
completeRestore : function (animated) {

    
    if (this._restoreOverflow != null) this.setOverflow(this._restoreOverflow);
    if (this._restoreHeight != null) this.setHeight(this._restoreHeight);
    if (this._restoreWidth != null) this.setWidth(this._restoreWidth);

    if (!animated) {
        if (this._restoreLeft != null) this.setLeft(this._restoreLeft);
        if (this._restoreTop != null) this.setTop(this._restoreTop);
    }
    if (this._userWidth != null) this.updateUserSize(this._restoreUserWidth, this._$width);
    if (this._userHeight != null) this.updateUserSize(this._restoreUserHeight, this._$height);
    if (this._restoreShowShadow != null) this.setShowShadow(this._restoreShowShadow);    

    // restore resizability
    if (this._canResizeAfterRestore != null) this.canDragResize = this._canResizeAfterRestore;
    if (this._canMoveAfterRestore != null && this.headerLabel) 
        this.headerLabel.parentElement.canDragReposition = this._canMoveAfterRestore;
    
    var restoreButton = this.minimized ? this.minimizeButton : this.maximizeButton;

    this.minimized = false;
    this.maximized = false;
    
    // show components
    // If this was an animated restore, or a restore (shrink) from maximized they may already 
    // be showing
    this._showComponents();

    // If we were autoSized, reset to autoSize:true (automatically gets set to false when
    // maximized).    
    if (this._restoreAutoSize) {
        // reflow before calling 'setAutoSize' - this gives the body width a chance to adjust
        // to match the available space in the window
        this.reflowNow();
        this.setAutoSize(true);
    }
    
    delete this._restoreHeight;
    delete this._restoreUserHeight;
    delete this._restoreVisibleHeight;
    delete this._canResizeAfterRestore;
    delete this._canMoveAfterRestore;
    delete this._restoreOverflow;
    delete this._restoreWidth;
    delete this._restoreUserWidth;
    delete this._restoreShowShadow;
    delete this._restoreLeft;
    delete this._restoreTop;
    delete this._restoreAutoSize;
    
    if (restoreButton) restoreButton.enable();
},

// Helper for showing the various parts of the window
_showComponents : function () {
    // show non-header components
    // Note we if we're not drawn we can call 'show()' and 'hide()' on our children to set their
    // visibility property - so when they get drawn they'll be in the right state.
    // (show() / hide() will not effect their visibility on the screen if we are hidden or
    // undrawn)
    if (this.body && !this.body.isVisible()) this.body.show();
    if (this.footer && !this.footer.isVisible()) this.footer.show();
},

//>	@method	Window.maximize()
// Maximize the window. Fired when the user clicks the maximize button if 
// +link{window.showMaximizeButton, this.showMaximizeButton} is true.<br>
// Default implementation moves the window to <code>0, 0</code> and resizes the window to 
// <code>"100%"</code> on both axes, so it will fill the browser window (or the parent
// of the Window instance, if appropriate).<br>
// If +link{window.animateMinimize, animateMinimize} is true, the maximize will be animated.
// A restore button will be displayed in place of the maximize button when the window is 
// maximized.
// 
// @visibility external
//<
maximize : function () { 

    if (this.body && this.minBreadthMember != this.body) this.minBreadthMember = this.body;

    //>Animation
    if (this._animatingMinimize) isc.Animation.finishAnimation(this._animatingMinimize);
    //<Animation
    // Put this AFTER the finish animation call so the interrupted animation will have had
    // time to set this.minimized
    if (this.maximized) return;
    
    // If we're already minimized restore size will have been stored already.
    if (!this.minimized) {
        this._restoreHeight = this.getHeight();
        this._restoreVisibleHeight = this.getVisibleHeight();        
        this._restoreUserHeight = this._userHeight;

        this._canResizeAfterRestore = this.canDragResize;
        this.canDragResize = false;

    } else {
        // If we're minimized, re-set the minimize button to actually minimize the window
        // (currently it'll be acting as a restore button)
        if (this.minimizeButton) {
            this.minimizeButton.addProperties(this.minimizeButtonDefaults);
            this.minimizeButton.redraw();
        }
    }

    // Remember the position so we can move to 0/0    
    this._restoreLeft = this.getLeft();
    this._restoreTop = this.getTop();
    
    this._restoreWidth = this.getWidth();
    this._restoreVisibleWidth = this.getVisibleWidth();
    this._restoreUserWidth = this._userWidth;
    
    // we also disable drag-repositioning of maximized windows.
    if (this.headerLabel) {
        this._canMoveAfterRestore = this.headerLabel.parentElement.canDragReposition;
        this.headerLabel.parentElement.canDragReposition = false;
    }

    // the shadow takes up space - we'll hide it when maximized so we don't have unnecessary
    // scrollbars etc.
    this._restoreShowShadow = this.showShadow;
    this.setShowShadow(false);
    
    // If this is an auto-size window, disable autoSizing while maximized, but re-set when
    // restored
    if (this.autoSize) {
        this._restoreAutoSize = true;
        this.setAutoSize(false);
    }

    // switch maximize button to a restore button
    // but disable it until the maximize is complete
    var maxButton = this.maximizeButton;
    if (maxButton) {
        maxButton.addProperties(this.restoreButtonDefaults);
        maxButton.markForRedraw();
    }
    
    //>Animation
    if (this.animateMinimize && this.isDrawn() && this.isVisible()) {
        if (maxButton) {
            maxButton.disable();
            maxButton.redraw();
        }
        // maximize height and width are 100% / 100%.
        // We'll animate to the explicit size this resolves to (then set to 100% to support
        // parent resizing, etc)
        this._maximizeHeight = (this.parentElement ? this.parentElement.getInnerHeight() 
                                                   : isc.Page.getHeight());
        this._maximizeWidth = (this.parentElement ? this.parentElement.getInnerWidth() 
                                                    : isc.Page.getWidth());
        
        // Note: before either animated minimize or restore we remember the 'restore' size
        // of the components (the normal drawn size) and at the end of the animation reset them
        // This is cleaner than remembering them before minimize, then resetting them after
        // restore as it should work for the case where a window is drawn initially minimized
        // then restored, etc.
        // This method stores the size / specified size / overflow etc of the footer and body
        this._storeContentRestoreStats();
        
        // Note: we use the same flag for minimize and restore animation IDs since the same
        // actions (show/hide/resize/minimize/restore) all kill the animation
        this._animatingMinimize = 
            isc.Animation.registerAnimation(this.animateMaximizeStep, 
                                        (this.minimizeTime || this.animateTime), 
                                        this.minimizeAcceleration || this.animateAcceleration,
                                        this);
    } else {
    //<Animation
        this.completeMaximize();
    //>Animation
    } //<Animation
},


completeMaximize : function (animated) {   
    
    if (!animated) this.moveTo(0,0);
    // always resize to the percentage value so we resize with our parent.
    this.resizeTo("100%", "100%");
    
    // show components - required if this was minimized
    // If not previously minimized, or if this was an animated maximize they may already be 
    // showing
    this._showComponents();
    
    this.minimized = false;
    this.maximized = true;
    
    if (this.maximizeButton) this.maximizeButton.enable();
},

_$animatingMinimize: "animatingMinimize",

//>Animation
// We must override methods that would cut a minimize / maximize animation short
// This includes:
// - minimize() [above]
// - restore() [above]
// - hide() [later in this file]
// - clear() [later in this file]
// - resizeBy() and resizeTo()

resizeTo : function (width, height, animatingRect, suppressHandleUpdate, reason) {
    if (reason != this._$animatingMinimize && this._animatingMinimize) {
        isc.Animation.finishAnimation(this._animatingMinimize);
    }
    return this.invokeSuper(isc.Window, "resizeTo", width, height, animatingRect,
                            suppressHandleUpdate, reason);
},
resizeBy : function (deltaX, deltaY, animatingRect, suppressHandleUpdate, reason) {
    if (reason != this._$animatingMinimize && this._animatingMinimize) {
        isc.Animation.finishAnimation(this._animatingMinimize);
    }
    return this.invokeSuper(isc.Window, "resizeBy", deltaX, deltaY, animatingRect,
                            suppressHandleUpdate, reason);
},
//<Animation


// Click Handlers for buttons
// ---------------------------------------------------------------------------------------


_closeButtonClick : function () { return this.handleCloseClick() },

handleCloseClick : function () {
    if (this.onCloseClick && this.onCloseClick() == false) return;
    return this.closeClick();
},

//>	@method	Window.closeClick() ([])
// Handles a click on the close button of this window. The default implementation
// calls +link{window.close(),close()} and returns false to prevent bubbling of the click event.
// <P>
// <smartclient>Override this method if you want
// other actions to be taken.</smartclient>
// <smartgwt>Developers may use <code>addCloseClickHandler()</code> to provide custom
// handling when the user clicks this button.</smartgwt>
// Custom implementations may call <code>close()</code> to trigger the default behavior.
// @return (Boolean) Return false to cancel bubbling the click event
// @group	buttons
// @visibility external
//<
closeClick : function () {
    this.close();
    // cancel the mouseClick
    return false;
},

//> @method window.close()
// Close this window. 
// This method is fired by the default +link{closeClick()} implementation.
// Default implementation will hide the window.
// @visibility external
//<
close : function () {
	this.returnValue(null);
    // NOTE: if this Window is going to be reused, it's best to hide() it, otherwise it would be
    // best to destroy() it.
	this.hide();
},

propertyChanged : function (propName, value) {
    this.invokeSuper(isc.Window, "propertyChanged", propName, value);
    if (propName == "showHeader") {
        if (!value && this.header) {
            this.removeHeader();
        } else {
            this.makeHeader();
        }
    }
    if (propName == "showFooter") {
        if (!value && this.footer) {
            this.removeFooter();
        } else {
            this.makeFooter();
        }
    }
}

});	// END  Window.addMethods();

isc.Window.registerStringMethods({
    //> @method window.onMaximizeClick()
    // Notification method fired when the user clicks the 'maximize' button.
    // @return (boolean) return false to cancel the default maximize behavior
    // @visibility sgwt
    //<
    
    onMaximizeClick:"",
    //> @method window.onMinimizeClick()
    // Notification method fired when the user clicks the 'minimize' button.
    // @return (boolean) return false to cancel the default minimize behavior
    // @visibility sgwt
    //<
    
    onMinimizeClick:"",
    //> @method window.onRestoreClick()
    // Notification method fired when the user clicks the 'restore' button.
    // @return (boolean) return false to cancel the default restore behavior
    // @visibility sgwt
    //<
    
    onRestoreClick:"",
    
    //> @method window.onCloseClick()
    // Notification method fired when the user attempts to close the window via a click on the
    // 'close' button, click outside the window if +link{window.dismissOnOutsideClick} is true,
    // or on escape keypress if +link{window.dismissOnEscape} is true.
    // @return (Boolean) return false to cancel the default behavior 
    //    (firing +link{window.closeClick()})
    // @visibility sgwt
    //<
    
    onCloseClick:""
})

// If we set up the 'definePrintWindow()' method, call it now to set up the PrintWindow class
if (isc.definePrintWindow) isc.definePrintWindow();

//!<Deferred

isc.Window.registerDupProperties("items");



//> @class WindowHeaderIcon
// Marker class used in SmartGWT and +link{group:componentXML,Component XML} to indicate
// within the +link{Window.headerControls} that the header icon should be rendered.
// An instance of this class is never drawn.
// @treeLocation Client Reference/Layout/Window
//
// @visibility internal
//<
isc.ClassFactory.defineClass("WindowHeaderIcon", "Img");

isc.WindowHeaderIcon.addClassMethods({
    _markerTarget:"header"
});

isc.WindowHeaderIcon.addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true,
    _markerName:"headerIcon",
    // Don't write Component XML as separate entity
    _generated: true,
    // Don't write anything but constructor in Component XML
    updateEditNode : function (editContext, editNode) {
        editContext.removeNodeProperties(editNode, ["autoDraw", "ID", "autoID", "title"]);
    }
});

//> @class WindowHeaderLabel
// Marker class used in SmartGWT and +link{group:componentXML,Component XML} to indicate
// within the +link{Window.headerControls} that the header label should be rendered.
// An instance of this class is never drawn.
// @treeLocation Client Reference/Layout/Window
//
// @visibility internal
//<
isc.ClassFactory.defineClass("WindowHeaderLabel", "Label");

isc.WindowHeaderLabel.addClassMethods({
    _markerTarget:"header"
});

isc.WindowHeaderLabel.addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true,
    _markerName:"headerLabel",
    _generated:true,
    updateEditNode : function (editContext, editNode) {
        editContext.removeNodeProperties(editNode, ["autoDraw", "ID", "autoID", "title"]);
    }
});

//> @class WindowMinimizeButton
// Marker class used in SmartGWT and +link{group:componentXML,Component XML} to indicate
// within the +link{Window.headerControls} that the header minimize button should be rendered.
// An instance of this class is never drawn.
// @treeLocation Client Reference/Layout/Window
//
// @visibility internal
//<
isc.ClassFactory.defineClass("WindowMinimizeButton", "ImgButton");

isc.WindowMinimizeButton.addClassMethods({
    _markerTarget:"header"
});

isc.WindowMinimizeButton.addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true,
    _markerName:"minimizeButton",
    _generated:true,
    updateEditNode : function (editContext, editNode) {
        editContext.removeNodeProperties(editNode, ["autoDraw", "ID", "autoID", "title"]);
    }
});

//> @class WindowMaximizeButton
// Marker class used in SmartGWT and +link{group:componentXML,Component XML} to indicate
// within the +link{Window.headerControls} that the header maximize button should be rendered.
// An instance of this class is never drawn.
// @treeLocation Client Reference/Layout/Window
//
// @visibility internal
//<
isc.ClassFactory.defineClass("WindowMaximizeButton", "ImgButton");

isc.WindowMaximizeButton.addClassMethods({
    _markerTarget:"header"
});

isc.WindowMaximizeButton.addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true,
    _markerName:"maximizeButton",
    _generated:true,
    updateEditNode : function (editContext, editNode) {
        editContext.removeNodeProperties(editNode, ["autoDraw", "ID", "autoID", "title"]);
    }
});

//> @class WindowCloseButton
// Marker class used in SmartGWT and +link{group:componentXML,Component XML} to indicate
// within the +link{Window.headerControls} that the header close button should be rendered.
// An instance of this class is never drawn.
// @treeLocation Client Reference/Layout/Window
//
// @visibility internal
//<
isc.ClassFactory.defineClass("WindowCloseButton", "ImgButton");

isc.WindowCloseButton.addClassMethods({
    _markerTarget:"header"
});

isc.WindowCloseButton.addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true,
    _markerName:"closeButton",
    _generated:true,
    updateEditNode : function (editContext, editNode) {
        editContext.removeNodeProperties(editNode, ["autoDraw", "ID", "autoID", "title"]);
    }
});

//> @class WindowFooterSpacer
// Marker class used in SmartGWT and +link{group:componentXML,Component XML} to indicate
// within the +link{Window.footerControls} that the footer spacer should be rendered.
// An instance of this class is never drawn.
// @treeLocation Client Reference/Layout/Window
//
// @visibility internal
//<
isc.ClassFactory.defineClass("WindowFooterSpacer", "LayoutSpacer");

isc.WindowFooterSpacer.addClassMethods({
    _markerTarget:"footer"
});

isc.WindowFooterSpacer.addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true,
    _markerName:"spacer",
    _generated:true,
    updateEditNode : function (editContext, editNode) {
        editContext.removeNodeProperties(editNode, ["autoDraw", "ID", "autoID", "title"]);
    }
});

//> @class WindowResizer
// Marker class used in SmartGWT and +link{group:componentXML,Component XML} to indicate
// within the +link{Window.footerControls} that the footer resizer should be rendered.
// An instance of this class is never drawn.
// @treeLocation Client Reference/Layout/Window
//
// @visibility internal
//<
isc.ClassFactory.defineClass("WindowResizer", "ImgButton");

isc.WindowResizer.addClassMethods({
    _markerTarget:"footer"
});

isc.WindowResizer.addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true,
    _markerName:"resizer",
    _generated:true,
    updateEditNode : function (editContext, editNode) {
        editContext.removeNodeProperties(editNode, ["autoDraw", "ID", "autoID", "title"]);
    }
});

//> @class InlineWindow
// This class is a synonym for Window that can be used to make intent clearer.
// It is used by some development tools for that purpose.
// @inheritsFrom Window
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.ClassFactory.defineClass("InlineWindow", "Window").addProperties({
    canMinimize:true
});

//> @class ModalWindow
// A simple subclass of Window whose default configuration is appropriate for
// a standalone, modal window. This includes appropriate default settings for 
// +link{Window.isModal} and +link{Window.autoCenter}, and sizing information, as well
// as having the window be initially +link{ModalWindow.visibility,hidden}
// <P>
// This class is used by some development tools to simplify the creation of a modal window.
//
// @inheritsFrom Window
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.ClassFactory.defineClass("ModalWindow", "Window").addProperties({
    //> @attr ModalWindow.autoCenter (boolean : true : IRW)
    // @include Window.autoCenter
    // @visibility external
    //<
    autoCenter:true,
    
    //> @attr ModalWindow.isModal (boolean : true : IRW)
    // @include Window.isModal
    // @visibility external
    //<
    isModal:true,
    
    //> @attr ModalWindow.visibility (Visibility : "hidden" : IRW)
    // @include Canvas.visibility
    // @visibility external
    //<
    visibility:"hidden",
    
    //> @attr ModalWindow.width (Number | String : "75%" : IRW)
    // @include Canvas.width
    // @visibility external
    //<
    width:"75%",
    
    //> @attr ModalWindow.maxWidth (Number : 900 : IRW)
    // @include Canvas.maxWidth
    // @visibility external
    //<
    maxWidth:900,
    
    //> @attr ModalWindow.height (Number | String : "65%" : IRW)
    // @include Canvas.height
    // @visibility external
    //<
    height:"65%",
    
    //> @attr ModalWindow.maxHeight (Number : 750 : IRW)
    // @include Canvas.maxHeight
    // @visibility external
    //<
    maxHeight:750
    
});

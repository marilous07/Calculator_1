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
//>	@class	Button
//
// The Button widget class implements interactive, style-based button widgets.
//
// @inheritsFrom StatefulCanvas
// @treeLocation Client Reference/Control
// @visibility external
//<

//> @groupDef buttonIcon
// Control over optional icons shown in Buttons, Labels and other contexts
// @title Button Icon
// @visibility external
//<

isc.ClassFactory.defineClass("Button", "StatefulCanvas");

isc.defer("if (isc.Button._instancePrototype.showFocused == null) isc.Button.addProperties({ showFocused: !isc.Browser.isTouch });");

isc.Button.addProperties({


    // Various properties documented on StatefulCanvas that affect all buttons
    // NOTE: This block is included in Button, ImgButton, and StrechlImgButton.
    //       If you make changes here, make sure you duplicate it to the other
    //       classes.
    // 
    // End of this block is marked with: END StatefulCanvas @include block
    // ========================================================================

    // Title
    //------
    //> @attr button.title (HTMLString : "Untitled Button" : IRW)
    // @include statefulCanvas.title
    // @visibility external
    // @group basics
    // @group i18nMessages
    // @example buttonStates
    //<
	title:"Untitled Button",

    //> @attr button.clipTitle (Boolean : true : IR)
    // If this.overflow is "hidden" and the title for this button is too large for the available
    // space, should the title be clipped by an ellipsis?
    // <p>
    // This feature is supported only in browsers that support the CSS UI text-overflow
    // property (IE6+, Firefox 7+, Safari, Chrome, Opera 9+).
    //<
    clipTitle: true,

    //> @attr button.hiliteAccessKey    (boolean : null : IRW)
    // @include statefulCanvas.hiliteAccessKey
    // @visibility external
    //<    

    //>	@method	button.getTitle()	(A)
    // @include statefulCanvas.getTitle
    // @visibility external
    //<
    //>	@method	button.setTitle()
    // @include statefulCanvas.setTitle
    // @visibility external
    //<

    //> @attr button.showClippedTitleOnHover (Boolean : false : IRW)
    // If true and the title is clipped, then a hover containing the full title of this button
    // is enabled.
    // @group hovers
    // @visibility external
    //<
    showClippedTitleOnHover:false,

    _canHover:true,

    // don't set className on the widget's handle, because we apply styling to another element
    suppressClassName:true,

    // Icon
    //------

    // set useEventParts to true so we can handle an icon click separately from a
    // normal button click if we want
    useEventParts:true,

    //> @attr button.icon
    // @include statefulCanvas.icon
    // @visibility external
    // @example buttonIcons
    //<
    //> @attr button.iconSize
    // @include statefulCanvas.iconSize
    // @visibility external
    //<
    //> @attr button.iconWidth
    // @include statefulCanvas.iconWidth
    // @visibility external
    //<
    //> @attr button.iconHeight
    // @include statefulCanvas.iconHeight
    // @visibility external
    //<
    //> @attr button.iconStyle
    // @include StatefulCanvas.iconStyle
    // @visibility external
    //<
    //> @attr button.iconOrientation
    // @include statefulCanvas.iconOrientation
    // @visibility external
    // @example buttonIcons
    //<
    //> @attr button.iconAlign
    // @include statefulCanvas.iconAlign
    // @visibility external
    //<
    //> @attr button.iconSpacing
    // @include statefulCanvas.iconSpacing
    // @visibility external
    //<
    //> @attr button.showDisabledIcon
    // @include statefulCanvas.showDisabledIcon
    // @visibility external
    //<
    //> @attr button.showRollOverIcon
    // @include statefulCanvas.showRollOverIcon
    // @visibility external
    //<
    //> @attr button.iconCursor
    // @include StatefulCanvas.iconCursor
    // @visibility external
    //<
    //> @attr button.disabledIconCursor
    // @include StatefulCanvas.disabledIconCursor
    // @visibility external
    //<

    //> @attr button.showFocusedIcon
    // @include statefulCanvas.showFocusedIcon
    // @visibility external
    //<
    //> @attr button.showDownIcon
    // @include statefulCanvas.showDownIcon
    // @visibility external
    // @example buttonIcons
    //<
    //> @attr button.showSelectedIcon
    // @include statefulCanvas.showSelectedIcon
    // @visibility external
    //<
    //> @method button.setIconOrientation()
    // @include statefulCanvas.setIconOrientation
    // @visibility external
    //<
    //> @method button.setIcon()
    // @include statefulCanvas.setIcon
    // @visibility external
    //<

    // AutoFit
    //--------
    //> @attr button.autoFit
    // @include statefulCanvas.autoFit
    // @group sizing
    // @visibility external
    // @example buttonAutoFit
    //<    
    //> @method button.setAutoFit()
    // @include statefulCanvas.setAutoFit
    // @visibility external
    //<
    setAutoFit : function () {

        var drawn = this.isDrawn(),
            pushBorderToDiv = this.shouldPushTableBorderStyleToDiv();

        this.Super("setAutoFit", arguments);
        // Remember the requested autoFit (used by adaptWidthBy)
        this._specifiedAutoFit = !!this.autoFit;


        if (drawn) {
            var newPushBorderToDiv = this.shouldPushTableBorderStyleToDiv();
            if (pushBorderToDiv != newPushBorderToDiv) {
                this._pushTableBorderToDivChanged(newPushBorderToDiv);
            }
        }
    },

    _pushTableBorderToDivChanged : function (pushBorderToDiv) {
        // If we're undrawn, prepareToDraw() handles updating the various flags
        if (!this.isDrawn()) return;

        var border = pushBorderToDiv ? this._buttonBorder : this.border;
        // this will handle updating the appropriate property (_buttonBorder or border)
        if (border != null) this.setBorder(border); 

        

        var bgColor = pushBorderToDiv ? this._buttonBGColor : this.backgroundColor;
        this.setBackgroundColor(bgColor);
    },
    

    //> @attr button.width
    // @include statefulCanvas.width
    // @group sizing
    // @visibility external
    //<    

    //> @attr button.height
    // @include statefulCanvas.height
    // @group sizing
    // @visibility external
    //<    
    
    // only autoFit horizontally by default
    autoFitDirection:"horizontal",

    // baseStyle
    //----------
    
    // Include styleName docs just to make it obvious this property will not have an impact
    // on Buttons
    //> @attr button.styleName (CSSStyleName : "normal" : IRW)
    // @include statefulCanvas.styleName
    // @visibility external
    //<

    //> @attr button.baseStyle (CSSStyleName : "button" : IRW)
    // @include statefulCanvas.baseStyle
    // @see iconOnlyBaseStyle
    // @visibility external
    //<    
	baseStyle:"button",

    //> @attr button.iconOnlyBaseStyle (CSSStyleName : null : [IRW])
    // if defined, <code>iconOnlyBaseStyle</code> is used as the base CSS style className,
    // instead of +link{baseStyle}, if +link{canAdaptWidth} is set and the 
    // +link{button.adaptWidthShowIconOnly,title is not being shown}.
    // @see canvas.canAdaptWidth 
    // @see tabSet.simpleTabIconOnlyBaseStyle
    // @visibility external
    //<

    // If +link{useSimpleTabs} is true, <code>simpleTabBaseStyle</code> will be the base style
    // used to determine the css style to apply to the tabs.<P>
    // This property will be suffixed with the side on which the tab-bar will appear, followed
    // by with the tab's state (selected, over, etc), resolving to a className like 
    // "tabButtonTopOver".
    // @see Button.baseStyle
    // @see simpleTabIconOnlyBaseStyle
    // @visibility external
    //<    

    //> @method button.setBaseStyle()
    // @include statefulCanvas.setBaseStyle
    // @visibility external
    //<

    // selection
    //----------
    //> @attr button.selected
    // @include statefulCanvas.selected
    // @visibility external
    //<   
    //> @method button.select()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method button.deselect()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method button.isSelected()
    // @include statefulCanvas.isSelected
    // @visibility external
    //<
    //> @method button.setSelected()
    // @include statefulCanvas.select
    // @visibility external
    //<

    // radioGroup
    //-----------
    //> @attr button.radioGroup
    // @include statefulCanvas.radioGroup
    // @visibility external
    // @example buttonRadioToggle
    //<     
    //> @method button.addToRadioGroup()
    // @include statefulCanvas.addToRadioGroup
    // @visibility external
    //<
    //> @method button.removeFromRadioGroup()
    // @include statefulCanvas.removeFromRadioGroup
    // @visibility external
    //<
    //> @attr button.actionType
    // @include statefulCanvas.actionType
    // @visibility external
    // @example buttonRadioToggle
    //<     
    //> @method button.setActionType()
    // @include statefulCanvas.setActionType
    // @visibility external
    //<
    //> @method button.getActionType()
    // @include statefulCanvas.getActionType
    // @visibility external
    //<

    // state
    //------
    //> @attr button.state
    // @include statefulCanvas.state
    // @visibility external
    //<  
    //> @method button.setState()
    // @include statefulCanvas.setState
    // @visibility external
    //<
    //> @method button.setDisabled()
    // @include statefulCanvas.setDisabled
    // @visibility external
    //<
    //> @method button.getState()
    // @include statefulCanvas.getState
    // @visibility external
    //<
    //> @attr button.showDisabled
    // @include statefulCanvas.showDisabled
    // @visibility external
    // @example buttonStates
    //<  
    //> @attr button.showDown
    // @include statefulCanvas.showDown
    // @visibility external
    // @example buttonStates
    //<  
    //> @attr button.showFocused
    // @include statefulCanvas.showFocused
    // @visibility external
    //<  
	showDown:true,
    
    showFocused:null, // !isc.Browser.isTouch
    //> @attr button.showRollOver
    // @include statefulCanvas.showRollOver
    // @visibility external
    // @example buttonStates
    //<  
	showRollOver:true,

    
    mozOutlineOffset: "0px",

    // alignment
    //----------
    //> @attr button.align
    // @include statefulCanvas.align
    // @visibility external
    //<          
    //> @attr button.valign
    // @include statefulCanvas.valign
    // @visibility external
    //<      


    // Button.action
    //> @method button.action()
    // @include statefulCanvas.action
    // @visibility external
    //<
    
    // ================= END StatefulCanvas @include block =============== //

    
    //>	@attr	button.wrap		(Boolean : false : [IRW])
    // A boolean indicating whether the button's title should word-wrap, if necessary.
    // @group basics
    //      @visibility external
    //<
	wrap:false,

    // NOTE: by setting "height" rather than "defaultHeight", we make this into an explicit
    // setting which will be respected by a Layout
	height:20,					        
    width:100,

    //> @attr button.canAdaptWidth (Boolean : false : IR)
    // This flag enables +link{canvas.canAdaptWidth,adaptive width} for the button.
    // <P>
    // If enabled the button will support rendering in a 'collapsed' view if there isn't enough
    // space in a layout to render it at normal size. There are a couple of ways this can be achieved.
    // <ul>
    // <li>If +link{button.adaptWidthShowIconOnly} is true and this button shows an icon, the title
    //     will be hidden if there isn't enough space to render it, allowing it to shrink to either
    //     the rendered icon width, or any specified +link{canvas.minWidth,minWidth}, whichever is larger.</li>
    // <li>Otherwise, if the button has a specified +link{canvas.minWidth,minWidth}, and 
    //     +link{button.autoFit} is true, autoFit will be temporarily disabled, if there isn't enough
    //     room, allowing the title to be clipped</li>
    // </ul>
    // In either case the title will show on hover unless an explicit hover has been
    // specified such as by overriding +link{titleHoverHTML()}.
    //
    // @see canvas.canAdaptWidth
    // @example buttonAdaptiveWidth
    // @visibility external
    //<

    //> @attr button.overflow (Overflow : Canvas.HIDDEN : IRWA)
    // Clip the contents of the button if necessary.
    // @see canvas.overflow
    // @visibility external
    //<
    overflow:isc.Canvas.HIDDEN,
    
    //>	@attr	button.redrawOnDisable		(boolean : true : IRWA)
	// true == redraw the button when it's enabled/disabled
	//<
	redrawOnDisable:false,				

    //>	@attr	button.redrawOnStateChange		(boolean : true : IRWA)
	// true == redraw the button when it's state changes
	//		@group	state
	//<										
	redrawOnStateChange:false,			

	//>	@attr	button.cursor		(Cursor : isc.Canvas.HAND : IRW)
	// Hand cursor since these items are clickable
	//<
	cursor:isc.Canvas.HAND,

	// Style of the button is set via baseStyle, etc. above
    // NOTE: the button applies its CSS style to a contained cell, not the Canvas itself.
    className:null,						

    // If true, add a space to left or right-aligned titles so that they are not flush with
    // the edge of the widget.
    // NOTE: FIXME: this should really be done via CSS padding, hence not external doc'd
    //padTitle:false,

    //> @attr statefulCanvas.titleStyle        (CSSStyleName : "normal" : [IR])
    // For buttons with icons only, optional style to be applied to title text only.  This
    // style should contain text-related properties only (such as font size); border, padding
    // and background color should be specified in the style used as the "baseStyle".
    //
    // This property applied only to icon buttons rendered with a subtable, and currently only
    // works if redrawOnStateChange is true.  Internal for now.
    //<
    
    //titleStyle:"buttonTitle",

    canFocus:true
});

// add instance methods
isc.Button.addMethods({

_aboutToDraw : function () {

    this.Super("_aboutToDraw", arguments);

    

    var pushBorderToDiv = this.shouldPushTableBorderStyleToDiv();
    if (this.border != null && !pushBorderToDiv) {
        this._buttonBorder = this.border;
        this._clearBorder();
    }
    if (this.padding != null) {
        this._buttonPadding = this.padding;
        this.padding = null;
    }
    // If the style's border will be applied to the handle (div) rather than the table,
    // we'll also apply the bg-color to the border, and suppress any bg-color on the
    // handle. This ensures the inner curve of any border-radius isn't clipped by the
    // bg-color applied to the table cell [which doesn't have the same corner radii]
    if (pushBorderToDiv) {
        this._buttonBGColor = "transparent";
    } else {
        // Otherwise we apply the background color to the table cell along with other styling,
        // not to the div
        if (this.backgroundColor != null) {
            this._buttonBGColor = this.backgroundColor;
            this.backgroundColor = null;
        }
    }
    
    
    this.forceHandleOverflowHidden = pushBorderToDiv;
},

// setHandleRect() handles resizing the widget handle.
// After adjusting size, it falls through to _assignRectToHandle (with sizes adjusted for
// custom scrollbars, etc).
// If we're writing out an explicitly sized inner table override this method to also
// resize the inner table's handle.
_assignRectToHandle : function (left,top,width,height,styleHandle) {
    // Resize the handle
    this.invokeSuper(isc.Button, "_assignRectToHandle", left,top,width,height,styleHandle);

    
    if (this.redrawOnResize && !this.isPrinting && this._explicitlySizeTable()) return;
    var tableElem = this._getTableElement();
    if (tableElem != null) {
        // If provided a width, and this button's markup requires a width attribute to be set
        // on the <table>, then update the attribute.
        if (width != null && isc.isA.Number(width) &&
            (this.overflow !== isc.Canvas.VISIBLE ||
             (!this._explicitlySizeTable() && this.redrawOnResize != false)))
        {
            var tableWidth = width;
            if (this.isBorderBox) tableWidth -= this.getHBorderPad();
            this._assignSize(tableElem, this._$width, tableWidth);
        }

        if (height != null && isc.isA.Number(height)) {
            var tableHeight = height;
            if (this.isBorderBox) tableHeight -= this.getVBorderPad();
            this._assignSize(tableElem, this._$height, tableHeight);
        }
    }
},


shouldRedrawOnResize : (isc.Browser.isIPhone ?
    function (deltaX, deltaY) {
        return (this !== this.ns.EH.dragTarget);
    }
: // !isc.Browser.isIPhone
    isc.Button.getSuperClass()._instancePrototype.shouldRedrawOnResize
),

getCanHover : function (a, b, c) {
    return this._canHover || this.invokeSuper(isc.Button, "getCanHover", a, b, c);
},

shouldClipTitle : function () {
    return this.getOverflow() == isc.Canvas.HIDDEN && !!this.clipTitle;
},

_$titleClipper:"titleClipper",
_getTitleClipperID : function () {
    return this._getDOMID(this._$titleClipper);
},

//> @method button.titleClipped() (A)
// Is the title of this button clipped?
// @return (boolean) whether the title is clipped.
// @visibility external
//<
titleClipped : function (startAfterNode) {
    var titleClipperHandle = this.getDocument().getElementById(this._getTitleClipperID());
    if (titleClipperHandle == null) return false;
    
    
    if (this.getScrollHeight() > this.getViewportHeight()) {
        return true;
    }

    
    if (isc.Browser.isChrome ||
        (isc.Browser.isMoz && isc.Browser.version >= 7))
    {
        var range = this.getDocument().createRange();
        range.selectNodeContents(titleClipperHandle);

        
        if (startAfterNode && titleClipperHandle.contains(startAfterNode)) {
            range.setStartAfter(startAfterNode);
        }

        var contentsBCR = range.getBoundingClientRect();
        var bcr = titleClipperHandle.getBoundingClientRect();
        
        
        
        var clipped = Math.round(Math.abs(bcr.width-contentsBCR.width)) >= 1;
        return clipped;
    } else {
        return (isc.Element.getClientWidth(titleClipperHandle) < titleClipperHandle.scrollWidth);
    }
},

defaultTitleHoverHTML : function () {
    return this.getTitleHTML();
},

// helper used by handleHover() in canAdaptWidth: true case
hiddenTitleHoverHTML : function () {
    var title = this.getTitle(true);
    return this.formatTitle(this, title);
},

//> @method button.titleHoverHTML()
// Returns the HTML that is displayed by the default +link{Button.titleHover(),titleHover}
// handler. Return null or an empty string to cancel the hover.
// <smartgwt><p>Use <code>setTitleHoverFormatter()</code> to provide a custom
// implementation.</smartgwt>
// @param defaultHTML (HTMLString) the HTML that would have been displayed by default
// @return (HTMLString) HTML to be displayed in the hover. If null or an empty string, then the hover
// is canceled.
// @visibility external
//<
titleHoverHTML : function (defaultHTML) {
    return defaultHTML;
},

handleHover : function (a, b, c) {
    // If there is a prompt, prefer the standard hover handling.
    if (this.canHover == null && this.prompt) return this.invokeSuper(isc.Button, "handleHover", a, b, c);

    if (!this._adaptedToSmallerSize && (!this.showClippedTitleOnHover || !this.titleClipped())) {
        if (this.canHover) return this.invokeSuper(isc.Button, "handleHover", a, b, c);
        else return;
    }

    if (this.titleHover && this.titleHover() == false) return;

    // always return the title HTML here, even if it's hidden due to button width adaptation
    
    var defaultHTML = this._hideTitle ? this.hiddenTitleHoverHTML() : 
                                       this.defaultTitleHoverHTML();

    var HTML = this.titleHoverHTML(defaultHTML);
    if (HTML != null && !isc.isAn.emptyString(HTML)) {
        var hoverProperties = this._getHoverProperties();
        isc.Hover.show(HTML, hoverProperties, null, this);
    }
},

_getLogicalIconOrientation : function () {
    var isRTL = this.isRTL(),
        opposite = ((!isRTL && this.iconOrientation == isc.Canvas.RIGHT) ||
                    (isRTL && ((this.ignoreRTL && this.iconOrientation == isc.Canvas.LEFT) ||
                               (!this.ignoreRTL && this.iconOrientation == isc.Canvas.RIGHT))));
    return (isRTL || opposite) && !(isRTL && opposite) ? isc.Canvas.RIGHT : isc.Canvas.LEFT;
},

_explicitlySizeTable : function (iconAtEdge, clipTitle) {
    if (iconAtEdge == null) iconAtEdge = this._iconAtEdge();
    if (clipTitle == null) clipTitle = this.shouldClipTitle();

    return !(
        // This expression is negated, so this is the case where we want to write
        // a table with size natively set to "100%" in both directions.
        iconAtEdge || !clipTitle ||
         (isc.Browser.isIE && ((!isc.Browser.isStrict && isc.Browser.version < 10) ||
                              isc.Browser.version <= 7))
    );
},
_usesSubtable : function (ignoreIsPrinting) {
    var iconAtEdge = this._iconAtEdge(),
        clipTitle = this.shouldClipTitle(),
        isTitleClipper = !iconAtEdge && clipTitle;
    return (((!ignoreIsPrinting && this.isPrinting) || !this._explicitlySizeTable(iconAtEdge, clipTitle)) &&
            this.icon && !isTitleClipper && !this.noIconSubtable);
},
_getTextAlign : function (isRTL) {
    
    var align = this.align;
    if (align == null) {
        return isc.Canvas.CENTER;
    } else if (!isRTL || this.ignoreRTL) {
        return align;
    } else {
        
        return isc.StatefulCanvas._mirroredAlign[align];
    }
},
//> @method button.getInnerHTML() (A)
// Return the HTML for this button
// @return (HTMLString) HTML output for the button
// @group drawing
//<
getInnerHTML : function () {
    var iconAtEdge = this._iconAtEdge(),
        clipTitle = this.shouldClipTitle(),
        isRTL = this.isRTL();
    if (this.isPrinting || !this._explicitlySizeTable(iconAtEdge, clipTitle)) {
        

        var button = isc.Button;
        if (!button._buttonHTML) {
            
            button._100Size = " width='100%' height='100%";
            button._100Width = " width='100%";
            button._widthEquals = "width='";
            button._heightEquals = "' height='";            
            button._hiddenOverflow = "' style='table-layout:fixed;overflow:hidden;";

            var cellStartHTML = button._cellStartHTML = [];
            button._gt = ">";
            button._nowrapTrue = " nowrap='true'";
            button._classEquals = " class='";
            button._colWidthEquals = "<col width='";
            button._pxEndCol = "px'/>";
            button._emptyCol = "<col/>";
            cellStartHTML[0] = "'><colgroup>";
            // [1] _emptyCol or _colWidthEquals
            // [2] null or afterPadding or _colWidthEquals
            // [3] null or afterPadding or _pxEndCol
            // [4] null or _pxEndCol or _emptyCol
            cellStartHTML[5] = "</colgroup><tbody><tr><td";
            // [6] null or _nowrapTrue
            // [7] _classEquals

            button._cellStartWrap = "'><tbody><tr><td class='";
            button._cellStartNoWrap = "'><tbody><tr><td nowrap='true' class='";

            var buttonHTML = button._buttonHTML = [];
            // NOTE: for DOM platforms, padding should be achieved by CSS padding and spacing
            // by CSS margins
            buttonHTML[0] = "<table role='presentation' cellspacing='0' cellpadding='0' ";
            
            // [1] 100% width and height, or width=
            // [2] null or this.getWidth()
            // [3] null or height=
            // [4] null or this.getHeight();
            
            // [5] overflow setting
            // [6] cell start (wrap/nowrap variants)
            // [7] CSS class

            // [8] optional cssText

            buttonHTML[9] = "' align='";
            // [10] align
            // [11] valign
            button._valignMiddle = "' valign='middle";
            button._valignTop = "' valign='top";
            button._valignBottom = "' valign='bottom";

            // [12-13] titleClipper ID
            button._id = "' id='";

            // [14-16] tabIndex and focus
            
            button._tabIndexStart = "' " + (isc.Browser.isChrome ? "" : "tabindex='-1'") 
                                    + " onfocus='";
            button._callFocus = "._cellFocus()'>";
            button._closeQuoteRightAngle = "'>";

            // IE 
            // [17] title

            // Moz
            // [17] Moz start DIV
            // [18] title
            // [19] Moz end DIV

            // end table (see _endTemplate)
        }

        var buttonHTML = button._buttonHTML;
        // if we're printing the button, make it fit its parent element
        // If we're not redrawing on resize, use 100% sizing - will reflow on resize of parent
        // element
        if (this.isPrinting || this.redrawOnResize == false) {
            // if we're not going to redraw on resize, write HTML that reflows automatically.  Not
            // yet possible in every browser.

            buttonHTML[1] = (this.isPrinting ? button._100Width : button._100Size);
            buttonHTML[2] = null; buttonHTML[3] = null; buttonHTML[4] = null;
        } else {
            buttonHTML[1] = button._widthEquals;

            var willDrawClipDiv = this._shouldWriteClipDiv()
            buttonHTML[2] = this.getInnerWidth();
            buttonHTML[3] = button._heightEquals;
            buttonHTML[4] = this.getInnerHeight();
    
        }


        if (this.overflow == isc.Canvas.VISIBLE) {
            buttonHTML[5] = null;
        } else {
            buttonHTML[5] = button._hiddenOverflow;
        }

        // Inside the cell:

        
        var afterPadding;
        if (isc.Browser.isIE && !isc.Browser.isStrict && isc.Browser.version < 10 &&
            this._isStatefulCanvasLabel &&
            (afterPadding = this._getAfterPadding == null ? null : this._getAfterPadding()) > 0)
        {
            var cellStartHTML = button._cellStartHTML;
            cellStartHTML[1] = button._emptyCol;
            cellStartHTML[2] = button._colWidthEquals;
            cellStartHTML[3] = afterPadding;
            cellStartHTML[4] = button._pxEndCol;

            cellStartHTML[6] = (this.wrap ? null : button._nowrapTrue);
            cellStartHTML[7] = button._classEquals;

            buttonHTML[6] = cellStartHTML.join(isc.emptyString);
        } else {
            buttonHTML[6] = (this.wrap ? button._cellStartWrap : button._cellStartNoWrap);
        }

        buttonHTML[7] = this.isPrinting ? this.getPrintStyleName() : this.getStateName();

        var isTitleClipper = !iconAtEdge && clipTitle;

        
        var writeStyle = 
            isTitleClipper || this.cssText || 
            this._buttonBorder != null || this._buttonPadding != null ||
            this._buttonBGColor || this.margin != null || this._writeZeroVPadding() || 
            this.shouldPushTableBorderStyleToDiv() || this.shouldPushTableShadowStyleToDiv() ||
            (this._getAfterPadding != null) || (this._getTopPadding != null);
        
        if (writeStyle) buttonHTML[8] = this._getCellStyleHTML(null, isTitleClipper);
        else buttonHTML[8] = null;

        // If the iconOrientation and iconAlign are set such that the icon is pinned to the
        // edge of the table rather than showing up next to the title, ensure we center the
        // inner table - alignment of the title will be written directly into its cell.
        buttonHTML[10] = iconAtEdge ? isc.Canvas.CENTER : this._getTextAlign(isRTL);

        buttonHTML[11] = (this.valign == isc.Canvas.TOP ? button._valignTop : 
                            (this.valign == isc.Canvas.BOTTOM ? button._valignBottom
                                                              : button._valignMiddle) );

        if (isTitleClipper) {
            buttonHTML[12] = button._id;
            buttonHTML[13] = this._getTitleClipperID();            
        } else {
            buttonHTML[13] = buttonHTML[12] = null;
        }

        
        if (this._canFocus() && this._useNativeTabIndex) {
            buttonHTML[14] = button._tabIndexStart;
            buttonHTML[15] = this.getID();
            buttonHTML[16] = button._callFocus;
        } else {
            buttonHTML[14] = button._closeQuoteRightAngle;
            buttonHTML[15] = buttonHTML[16] = null;
        }
        this.fillInCell(buttonHTML, 17, isTitleClipper);
        return buttonHTML.join(isc.emptyString);
    } else {
        
        var sb = isc.SB.create(),
            valign = (this.valign == isc.Canvas.TOP || this.valign == isc.Canvas.BOTTOM
                      ? this.valign
                      : "middle");
        var textAlign = this._getTextAlign(isRTL);
        sb.append("<table role='presentation' cellspacing='0' cellpadding='0'",
                  (this.tableStyle ? " class='" + this.tableStyle + "'" : null),
                  (this.overflow !== isc.Canvas.VISIBLE
                         ? " width='" + this.getInnerWidth() + "' style='table-layout:fixed'" : null),
                  " height='", this.getInnerHeight(), "'><tbody><tr><td class='",
                  this.getStateName(), 
                  "' style='", this._getCellStyleHTML([]), "text-align:", textAlign,
                  ";vertical-align:", valign, (!this.wrap ? ";white-space:nowrap" : ""), "'>");
        var titleClipperID = this._getTitleClipperID(),
            iconSpacing = this.getIconSpacing(),
            iconWidth = (this.iconWidth || this.iconSize),
            extraWidth = iconSpacing + iconWidth,
            opposite = ((!isRTL && this.iconOrientation == isc.Canvas.RIGHT) ||
                        (isRTL && ((this.ignoreRTL && this.iconOrientation == isc.Canvas.LEFT) ||
                                   (!this.ignoreRTL && this.iconOrientation == isc.Canvas.RIGHT)))),
            b = (isRTL || opposite) && !(isRTL && opposite);
        var beforePadding = 0,
            afterPadding = 0,
            iconHTML = null;
        if (this.icon != null && !this._ignoreIcon) {
            beforePadding = extraWidth;
            

            iconHTML = this._generateIconImgHTML({
                align: "absmiddle",
                extraCSSText: (b ? "margin-left:" : "margin-right:") +
                              iconSpacing + "px;vertical-align:middle",
                eventStuff: this._$defaultImgEventStuff
            });
        }
        sb.append((!opposite ? iconHTML : null),
                  "<div id='", 
                  titleClipperID,
                  
                  this.canSelectText ? null : "' unselectable='on",
                  "' style='display:inline-block;",
                  (this.icon && !this._ignoreIcon ? (b ? "margin-right:" : "margin-left:") + (-extraWidth) + "px;" : null),
                  isc.Element._boxSizingCSSName, ":border-box;max-width:100%;",
                  (beforePadding ? ((b ? "padding-right:" : "padding-left:") + beforePadding + "px;") : null),
                  (afterPadding ? ((b ? "padding-left:" : "padding-right:") + afterPadding + "px;") : null),
                  "vertical-align:middle;overflow:hidden;",
                  isc.Browser._textOverflowPropertyName, ":ellipsis'>",

                                    
                  isc.Browser.isSafari ? "<div></div>" : "",

                  this.getTitleHTML(), "</div>",
                  (opposite ? iconHTML : null));

        sb.append("</td></tr></tbody></table>");
        return sb.release(false);
    }
},
  
// _getSizeTestHTML()
// Helper method to get an HTML structure which mimics the innerHTML of this button
// but will size naturally to fit the title/icon

_sizeTestHTMLTemplate:[
    '<table cellspacing="0" cellpadding="0"><tbody><tr><td ',   // [0] open table/cell tag
    null,                                                       // [1] 'nowrap="true" ' [or null]
    'class="',                                                  // [2] class start
    null,                                                       // [3] class name
    '" style="',                                                // [4] style start (for padding)
    null,                                                       // [5] possibly padding left/right
    '">',                                                       // [6] close cell tag
    null,                                                       // [7] title + icon
    "</td></tr></tbody></table>"                                // [7] end tag
],

_getSizeTestHTML : function (title, wrap) {
    var template = this._sizeTestHTMLTemplate;
    var isRTL = this.isRTL();
    
    // padding on the left / as a whole...
    var beforePadding = this._buttonPadding;
    var afterPadding = this._getAfterPadding ? this._getAfterPadding() : beforePadding;
    if (beforePadding != null || afterPadding != null) {
        if (beforePadding != null) {
            template[5] = (isRTL ? "padding-right:" : "padding-left:") + beforePadding + "px;"
        } else {
            template[5] = null;
        }
        if (afterPadding != null) {
            var afterPaddingString = (isRTL ? "padding-left:" : "padding-right:")
                                         + afterPadding + "px;";
            if (template[5] == null) {
                template[5] = afterPaddingString;
            } else {
                template[5] += afterPaddingString;
            }
        }
        
    } else {
        template[5] = null;
    }
    
    if (wrap == null) wrap = this.wrap;

    template[1] = wrap ? null : 'nowrap="true" ';
    template[3] = (this.titleStyle
                      ? this.getTitleStateName()
                      : this.getStateName(title)
                    );

    var icon = this.icon;
    if (icon != null) {
        // Stolen from getInnerHTML - determine icon orientation / spacing:
        var iconSpacing = this.getIconSpacing(title),
            iconWidth = (this.iconWidth || this.iconSize),
            extraWidth = iconSpacing + iconWidth,
            opposite = ((!isRTL && this.iconOrientation == isc.Canvas.RIGHT) ||
                        (isRTL && ((this.ignoreRTL && this.iconOrientation == isc.Canvas.LEFT) ||
                                   (!this.ignoreRTL && this.iconOrientation == isc.Canvas.RIGHT)))),
            b = (isRTL || opposite) && !(isRTL && opposite);
        
        var iconHTML = this._generateIconImgHTML({
                align: "absmiddle",
                extraCSSText: (b ? "margin-left:" : "margin-right:") +
                              iconSpacing + "px;vertical-align:middle",
                eventStuff: this._$defaultImgEventStuff
            });        
        if (opposite) {
            template[7] = title == null ? iconHTML : title + iconHTML;
        } else {
            template[7] = title == null ? iconHTML : iconHTML + title;
        }
    } else {
        template[7] = title;
    }
    return template.join("");
},    

_getTableElement : function () {
    var handle = this.getHandle();
    return handle && handle.firstChild;
},

_getCellElement : function () {
    var tableElem = this._getTableElement();
    if (tableElem == null) return null;

    
    return tableElem.rows[0].childNodes[0];
},

redraw : function (a,b,c,d) {
    var borderOnDiv = this.shouldPushTableBorderStyleToDiv();
    // If we were pushing the table border to div and no longer are
    // (or vice versa), drop the cached border size so getHBorderSize et al don't
    // return stale values.
    
    if (this._currentBorderOnDiv !== borderOnDiv) {    
        this._cachedBorderSize = null;
        this._currentBorderOnDiv  = borderOnDiv;
    }
    return this.invokeSuper(isc.Button, "redraw", a, b, c, d);
},

// force a redraw on setOverflow()
// This is required since we write out clipping HTML for our title table if our overflow
// is hidden (otherwise we don't), so we need to regenerate this.
setOverflow : function () {
    var wasDirty = this.isDirty(),
        oldOverflow = this.overflow;
    this.Super("setOverflow", arguments);
    
    if (!wasDirty && (oldOverflow != this.overflow ||
                      (this.shouldPushTableShadowStyleToDiv())))
    {
        this.redraw();
    }
},

__adjustOverflow : function (reason) {
    this.Super("__adjustOverflow", arguments);

    
    if (isc.Browser.isSafari && !isc.Browser.isChrome && !isc.Browser.isEdge && 
        this.icon != null &&
        !(this.isPrinting || !this._explicitlySizeTable()))
    {
        var isRTL = this.isRTL(),
            opposite = ((!isRTL && this.iconOrientation == isc.Canvas.RIGHT) ||
                        (isRTL && ((this.ignoreRTL && this.iconOrientation == isc.Canvas.LEFT) ||
                                   (!this.ignoreRTL && this.iconOrientation == isc.Canvas.RIGHT))));

        if (!opposite) {
            var textAlign = this._getTextAlign(isRTL),
                titleClipperHandle = this.getDocument().getElementById(this._getTitleClipperID());
            if (!titleClipperHandle) return;

            var titleClipperStyle = titleClipperHandle.style,
                iconSpacing = this.getIconSpacing(),
                iconWidth = (this.iconWidth || this.iconSize),
                extraWidth = iconSpacing + iconWidth;

            var beforePadding = extraWidth,
                afterPadding = 0;
            // Reset the title clipper's left and right padding to "normal" before checking whether
            // the title is clipped.
            titleClipperStyle[isRTL ? "paddingRight" : "paddingLeft"] = beforePadding + "px";
            titleClipperStyle[isRTL ? "paddingLeft" : "paddingRight"] = "";
            if (this.titleClipped()) {
                
                if (textAlign === isc.Canvas.CENTER) {
                    beforePadding = ((beforePadding + iconSpacing) / 2) << 0;
                    afterPadding = (iconSpacing / 2) << 0;
                } else if ((!isRTL && textAlign === isc.Canvas.RIGHT) ||
                           (isRTL && textAlign === isc.Canvas.LEFT))
                {
                    beforePadding -= (beforePadding / 2) << 0;
                    afterPadding = iconWidth;
                }
                titleClipperStyle[isRTL ? "paddingRight" : "paddingLeft"] = beforePadding + "px";
                titleClipperStyle[isRTL ? "paddingLeft" : "paddingRight"] = afterPadding + "px";
            }
        }
    }
},

// override getPrintTagStart to avoid writing out the printClassName on the outer div
getPrintTagStart : function (absPos) {
    var props = this.currentPrintProperties,
        topLevel = props.topLevelCanvas == this, 
        inline = !absPos && !topLevel && props.inline;

    return [((this.wrap == false) ? "<div style='white-space:nowrap' " : inline ? "<span " : "<div "),
            // could add borders etc here
            this.getPrintTagStartAttributes(absPos),
            ">"].join(isc.emptyString);
},


_$pxSemi:"px;", _$semi:";",
_$borderColon:"border:",
_$zeroVPad:"padding-top:0px;padding-bottom:0px;",
_$paddingColon:"padding:",
_$paddingRightColon:"padding-right:",
_$paddingLeftColon:"padding-left:",
_$bgColorColon:"background-color:",
_$zeroMargin:"margin:0px;",
_$filterNone:"filter:none;",
_$textOverflowEllipsis:isc.Browser._textOverflowPropertyName + ":ellipsis;overflow:hidden;",
_$cellStyleTemplate:[
    "' style='", // [0]
    ,           // [1] explicit css text applied to the button

    ,           // [2] null or "border:" (button border)
    ,           // [3] null or this._buttonBorder (button border)
    ,           // [4] null or ";" (button border)

    ,           // [5] null or "padding:" (button padding)
    ,           // [6] null or this._buttonPadding (button padding)
    ,           // [7] null or ";"  (button padding)

    ,           // [8] null or backgroundColor (button bg color)
    ,           // [9] null or this._buttonBGColor (button bg color)
    ,           // [10] null or ";" (button bg color)

    ,           // [11] null or "margin:0px" (avoid margin doubling)
    ,           // [12] null or "filter:none" (avoid IE8 filter issues)

    ,           // [13] null or "text-overflow:ellipsis;overflow:hidden;"

    ,           // [14] null or "padding-right:"/"padding-left:" (after padding)
    ,           // [15] null or this._getAfterPadding() (after padding)
    null       // [16] null or "px;" (after padding)
               // [17] null or "box-shadow:none;"
               // [18] null or "background-image:none;"

    // No need to close the quote - the button HTML template handles this.
],


_getCellStyleHTML : function (template, isTitleClipper) {
    template = template || this._$cellStyleTemplate;
    template[1] = (this.cssText ? this.cssText : null);

    var pushBorderToDiv = this.shouldPushTableBorderStyleToDiv(),
        border = pushBorderToDiv ? "none;border-radius:inherit" : this._buttonBorder;
    if (border != null) {
        template[2] = this._$borderColon;
        template[3] = border;
        template[4] = this._$semi;
    } else {
        template[2] = null;
        template[3] = null;
        template[4] = null;
    }
    
    var padding = this._buttonPadding;
    if (padding != null) {
        template[5] = this._$paddingColon;
        template[6] = padding;
        template[7] = this._$pxSemi;
    } else {
        template[5] = null;
        template[6] = null;
        template[7] = null;
    }

    
    var vPadding = this._getTopPadding ? 
            "padding-top:" + this._getTopPadding() + "px;padding-bottom:0px;" :
            (this._writeZeroVPadding() ? this._$zeroVPad : null);
    if (vPadding) {
        if (template[7]) template[7] += vPadding;
        else             template[7]  = vPadding;
    }
    
    if (this._buttonBGColor != null) {
        template[8] = this._$bgColorColon;
        template[9] = this._buttonBGColor;
        template[10] = this._$semi;
    } else {
        template[8] = null;
        template[9] = null;
        template[10] = null;
    }
    
    if (this.margin != null) template[11] = this._$zeroMargin;
    else template[11] = null;

    if (isc.Browser.useCSSFilters) template[12] = null;
    else template[12] = this._$filterNone;

    if (isTitleClipper) template[13] = this._$textOverflowEllipsis;
    else template[13] = null;

    var afterPadding;
    if ((!isc.Browser.isIE || isc.Browser.isStrict || isc.Browser.version >= 10 ||
         !this._isStatefulCanvasLabel) &&
        (afterPadding = (this._getAfterPadding == null ? null : this._getAfterPadding())) > 0)
    {
        template[14] = (this.isRTL() ? this._$paddingLeftColon : this._$paddingRightColon);
        template[15] = afterPadding;
        template[16] = this._$pxSemi;
    } else {
        template[16] = template[15] = template[14] = null;
    }

    
    if (isc.Browser.isChrome && isc.Browser.version == 61 && 
        this.shouldPushTableShadowStyleToDiv()) 
    {
        // if pushing the shadow styles to the outer div, clear the table styles here
        // - in _applyShadowStyle(), assign inset shadows to the table and others to the div
        template[17] = "box-shadow:none;";
    } else template[17] = null;

    // If a background image was specified it'll be rendered on our clip-handle - suppress
    // any background-image from the className applied to the table cell
    
    if (this.backgroundImage != null) {
        template[18] = "background-image:none;";
    } else {
        template[18] = null;
    }
    
    return template.join(isc.emptyString);
},


_writeZeroVPadding : function () {
    return this.overflow == isc.Canvas.HIDDEN && !this.rotateTitle &&
           // don't remove padding during animations or text may reflow
           !this.isAnimating() && 
            (isc.Browser.isMoz || isc.Browser.isSafari || isc.Browser.isIE);
},     

 
setBorder : function (border) {
    var pushStyle = this.shouldPushTableBorderStyleToDiv(),
        handleBorder = this.border,
        buttonBorder = this._buttonBorder,
        newHandleBorder = pushStyle ? border : null,
        newButtonBorder = pushStyle ? null : border;
    
    if (buttonBorder != newButtonBorder) {
        this._buttonBorder = newButtonBorder;
        this.markForRedraw("Button border changed");
    }
    if (handleBorder != newHandleBorder) {
        this.Super("setBorder", [newHandleBorder], arguments);
    }
},

setPadding : function (padding) {
    this._buttonPadding = padding;
    this.markForRedraw();
},


setBackgroundColor : function (color) {

    var pushToDiv = this.shouldPushTableBorderStyleToDiv(),
        buttonBGColor = this._buttonBGColor,
        handleBGColor = this.backgroundColor,
        newButtonBGColor = pushToDiv ? "transparent" : color,
        newHandleBGColor = pushToDiv ? color : null;
    if (buttonBGColor != newButtonBGColor) {
        this._buttonBGColor = newButtonBGColor;
        var cellElem = this._getCellElement();
        if (cellElem != null) cellElem.style.backgroundColor = (newButtonBGColor == null ? "" : newButtonBGColor);
    }
    if (handleBGColor != newHandleBGColor) {
        // updates both the handle and the backgroundColor property    
        return this.Super("setBackgroundColor", [newHandleBGColor], arguments);
    }
    
},

// If we're pushing the border style to the div, also push the background color.
// This is required for the case where we have a border-radius to ensure the color
// correctly fills the curved inner edges of the border
_getHandleBackgroundColor : function () {
    if (this.backgroundColor == null && this.shouldPushTableBorderStyleToDiv()) {
        return isc.Button._getStateBackgroundColor(this.isPrinting ? this.getPrintStyleName() 
                                                : this.getStateName());
    }
    return this.Super("_getHandleBackgroundColor", arguments);
},
_getHandleOpacity : function () {
    if (this.opacity == null && this.shouldPushTableBorderStyleToDiv()) {
        return isc.Button._getStateOpacity(this.isPrinting ? this.getPrintStyleName() 
                                                : this.getStateName());
    }
    return this.Super("_getHandleOpacity", arguments);
},

_$endTable :"</td></tr></tbody></table>",
_endTemplate : function (template, slot) {
    template[slot] = this._$endTable;
    template.length = slot+1;
    return template;
},

_$innerTableStart : "<table role='presentation' cellspacing='0' cellpadding='0'><tbody><tr><td ",
_$fillInnerTableStart : "<table role='presentation' width='100%' cellspacing='0' cellpadding='0'><tbody><tr><td ",
_$fillInnerFixedTableStart : "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='table-layout:fixed'><tbody><tr><td ",


_$leftIconCellStyleStart : "font-size:" + 
                            (isc.Browser.isFirefox && isc.Browser.isStrict ? 0 : 1) + 
                            "px;padding-right:",
_$rightIconCellStyleStart : "font-size:" + 
                            (isc.Browser.isFirefox && isc.Browser.isStrict ? 0 : 1) + 
                            "px;padding-left:",
_$pxClose : "px'>",
_$newInnerCell : "</td><td ", 

_$classEquals : "class='",

_$closeInnerTag : "'>",
_$closeInnerTagNoWrap : "' nowrap='true'>",    
 
_$innerTableEnd : "</td></tr></tbody></table>",

// used to check alignment for the icon
_$right:"right",

// Helper - is the icon pinned to the left / right edge, rather than floated next to the title?
_iconAtEdge : function () {
    return this.icon != null && this.iconAlign != null && 
                (this.iconAlign == this.iconOrientation) && 
                (this.iconAlign != this.align);
},

getIconSpacing : function (otherTitle) {
    
    var undef;
    if (this.icon == null || this._ignoreIcon || 
        (otherTitle === undef ? this.getTitle() : otherTitle) == null) return 0;
    return this.iconSpacing;
},

fillInCell : function (template, slot, cellIsTitleClipper) {
    var isRTL = this.isRTL();

    var title = this.getTitleHTML();

    if (!this.icon) {
        
        if (isc.Browser.isMoz) {
            var minHeight = this.reliableMinHeight;
            template[slot] = (minHeight ? "<div>" : null);
            template[slot+1] = title;
            template[slot+2] = (minHeight ? "</div>" : null);
            this._endTemplate(template, slot+3)
        } else {
            template[slot] = title;
            this._endTemplate(template, slot+1)
        }
        return;
    }

    var iconLeft = (!isRTL && this.iconOrientation != isc.Canvas.RIGHT) ||
                    (isRTL && ((this.ignoreRTL && this.iconOrientation != isc.Canvas.LEFT) ||
                               (!this.ignoreRTL && this.iconOrientation != isc.Canvas.RIGHT))),
        iconImg = this._generateIconImgHTML();

    

    // draw icon and text with spacing w/o a table.
    if (cellIsTitleClipper || this.noIconSubtable) {
        
        var spacer = isc.Canvas.spacerHTML(this.getIconSpacing(),1);
        template[slot] = (iconLeft ? isc.SB.concat(iconImg, spacer, title)
                                   : isc.SB.concat(title, spacer, iconImg));
        this._endTemplate(template, slot+1)
        return;
    }

    

    // Should we have the icon show up at the edge of the button, rather than being
    // adjacent to the title text?
    

    var iconAtEdge = this._iconAtEdge(),
        iconCellSpace;
    if (iconAtEdge) {
        iconCellSpace = (this.iconWidth ? this.iconWidth : this.iconSize) +
            
            (isc.Browser.isBorderBox ? this.getIconSpacing() : 0)
    }

    var clipTitle = this.shouldClipTitle();

    // if the icon is showing at one edge (and the text is separated from it), draw the
    // table 100% wide
    template[slot] = (iconAtEdge
                      ? (clipTitle
                         ? this._$fillInnerFixedTableStart
                         : this._$fillInnerTableStart)
                      : this._$innerTableStart);

    var styleName = this.isPrinting ? this.getPrintStyleName() :
                    (this.titleStyle
                      ? this.getTitleStateName()
                      : this.getStateName()
                    );
    // this._$tableNoStyleDoubling : defined in Canvas.js
    var tableNoStyleDoubling = this._$tableNoStyleDoubling;
    if (!isc.Browser.useCSSFilters) tableNoStyleDoubling += this._$filterNone;
    var align = this._getTextAlign(isRTL);

    if (iconLeft) {
        // icon cell
        template[++slot] = this._$classEquals;
        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;

        template[++slot] = !isRTL ? this._$leftIconCellStyleStart :
                                    this._$rightIconCellStyleStart;

        template[++slot] = this.getIconSpacing();
        if (iconAtEdge) {
            template[++slot] = "px;width:";
            template[++slot] = iconCellSpace;
        }
        template[++slot] = this._$pxClose;
        template[++slot] = iconImg;
        // title cell
        template[++slot] = this._$newInnerCell;
        template[++slot] = this._$classEquals;

        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;
        
        if (clipTitle) template[++slot] = this._$textOverflowEllipsis;

        template[++slot] = "' align='";
        template[++slot] = align;
        
        if (clipTitle) {
            template[++slot] = isc.Button._id;
            template[++slot] = this._getTitleClipperID();
        }
        template[++slot] = (this.wrap ? this._$closeInnerTag : this._$closeInnerTagNoWrap)
        template[++slot] = title;

    } else {
        // title cell:
        template[++slot] = this._$classEquals;
        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;
        if (clipTitle) template[++slot] = this._$textOverflowEllipsis;

        template[++slot] = "' align='";
        template[++slot] = align;

        if (clipTitle) {
            template[++slot] = isc.Button._id;
            template[++slot] = this._getTitleClipperID();
        }
        template[++slot] = (this.wrap ? this._$closeInnerTag : this._$closeInnerTagNoWrap)
        template[++slot] = title;

        // icon cell
        template[++slot] = this._$newInnerCell;

        template[++slot] = this._$classEquals;
        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;

        template[++slot] = !isRTL ? this._$rightIconCellStyleStart :
                                    this._$leftIconCellStyleStart;
        template[++slot] = this.getIconSpacing();
        if (iconAtEdge) {
            template[++slot] = "px;width:";
            template[++slot] = iconCellSpace;
        }
        template[++slot] = this._$pxClose;
        template[++slot] = iconImg;

    }
    template[++slot] = this._$innerTableEnd; 
    this._endTemplate(template, slot+1)
},





_imgParams : {
    align: "absmiddle" // just prevents default "texttop" from kicking in
},
_$icon:"icon",
_$defaultImgExtraCSSText: "vertical-align:middle",
_$defaultImgEventStuff: " eventpart='icon'",
_generateIconImgHTML : function (imgParams) {
    
    if (this.isFontIconConfig(this.icon)) {
        // fontIcons use a span, not an actual img
        return this.getFontIconHTML(this.icon);
    }

    // NOTE: we reuse a single global imgParams structure, so we must set every field we ever
    // use every time.
    if (imgParams == null) {
        imgParams = this._imgParams;
        imgParams.extraCSSText = this._$defaultImgExtraCSSText;
        imgParams.eventStuff = this._$defaultImgEventStuff;
        imgParams.extraStuff = null;
    }
    if (this.iconStyle != null) {
        var classText = " class='" + this.iconStyle + this._getIconStyleSuffix() + this._$singleQuote;
        if (imgParams.extraStuff == null) imgParams.extraStuff = classText;
        else imgParams.extraStuff += classText;
    }

    imgParams.name = this._$icon;
    imgParams.width = this.iconWidth || this.iconSize;
    imgParams.height = this.iconHeight || this.iconSize;
    imgParams.src = this._getIconURL();

    if (this.iconCursor != null) {
        var cursor = this._getIconCursor();
        var cursorCSSText = "cursor:" + cursor;
        if (imgParams.extraCSSText == null) {
            imgParams.extraCSSText = cursorCSSText;
        } else {
            imgParams.extraCSSText += ";" + cursorCSSText;
        }
    }

	return this.imgHTML(imgParams);
},

_getIconURL : function () {
    var icon = this.Super("_getIconURL", arguments);    
    return this._getStatefulIconURL(icon);
},

_getStatefulIconURL : function (icon) {
    // Special exception: If the icon is isc.Canvas._blankImgURL, then simply return the _blankImgURL.
    if (icon === isc.Canvas._blankImgURL || icon == isc.Canvas._$blank) return icon;
    
    var state = this.state,
        selected = this.selected,
        customState = this.getCustomState(),
        sc = isc.StatefulCanvas;

    // ignore states we don't care about
    
    if (state == sc.STATE_DISABLED && (!this.showDisabled || !this.showDisabledIcon)) state = null;
    else if (state == sc.STATE_DOWN && (!this.showDown || !this.showDownIcon)) state = null;
    else if (state == sc.STATE_OVER && (!this.showRollOver || !this.showRollOverIcon)) state = null;
    if (!this.showIconState) {
        state = null;
        customState = null;

    
    } else if (this.showIconCustomState == false) {
        customState = null;
    }

    if (selected && !this.showSelectedIcon) selected = false;
    var focused = this.showFocusedIcon ? this.getFocusedState() : null;

    if (focused && this.showFocusedAsOver) {
        // Don't clobber any other state [Selected or Down, say]
        if (this.showRollOverIcon && 
            (!state || state == isc.StatefulCanvas.STATE_UP)) 
        {
            state = isc.StatefulCanvas.STATE_OVER;
        }
        focused = false;
    }

    return isc.Img.urlForState(icon, selected, focused, state, (this.showRTLIcon && this.isRTL() ? "rtl" : null), customState);
},

// Get the suffix to append to the iconStyle.
// This is similar to StatefulCanvas.getStateSuffix(), but instead of being configured by
// show showRollOver, showDown, showDisabled, etc., this is configured by showRollOverIcon,
// showDownIcon, showDisabledIcon, etc.
_$RTL: "RTL",
_getIconStyleSuffix : function () {
    var state = this.state,
        selected = this.selected ? isc.StatefulCanvas.SELECTED : null,
        customState = this.getCustomState(),
        sc = isc.StatefulCanvas;

    // Ignore states we don't care about
    if (state == sc.STATE_DISABLED && !this.showDisabledIcon) state = isc.emptyString;
    else if (state == sc.STATE_DOWN && !this.showDownIcon) state = isc.emptyString;
    else if (state == sc.STATE_OVER && !this.showRollOverIcon) state = isc.emptyString;

    if (!this.showIconState) {
        state = isc.emptyString;
        customState = null;

    
    } else if (this.showIconCustomState == false) {
        customState = null;
    }

    if (selected != null && !this.showSelectedIcon) selected = null;
    // Note that getFocusedState() will return false if showFocusedAsOver is true, which is
    // appropriate.
    var focused = this.showFocusedIcon ? (this.getFocusedState() ? isc.StatefulCanvas.FOCUSED : null) : null;
    if (focused && this.showFocusedAsOver) {
        focused = false;
        if (this.showRollOverIcon && (!state || state == sc.STATE_UP)) state = sc.STATE_OVER;
    }
    var suffix = this._getStateSuffix(state, selected, focused, customState);
    if (this.showRTLIcon && this.isRTL()) suffix += this._$RTL;
    return suffix;
},

getTitleHTML : function (ignoreHide, b, c, d) {
    // This will call getTitle() so return contents if appropriate, and will hilite accessKeys
    var title = this.invokeSuper(isc.Button, "getTitleHTML", ignoreHide, b, c, d);

    // support adaptive-width buttons hiding title HTML
    if (!ignoreHide && this._hideTitle) return null;

    // FIXME: title padding should be accomplished with CSS
    if (!this.padTitle || this.align == isc.Canvas.CENTER) return title;

    if      (this.align == isc.Canvas.RIGHT) return title + isc.nbsp;
    else if (this.align == isc.Canvas.LEFT)  return isc.nbsp + title;
},


//> @method Button.setWrap()
// Set whether the title of this button should be allowed to wrap if too long for the button's
// specified width.
//
// @param newWrap (boolean) whether to wrap the title
// @visibility external
//<
setWrap : function (newWrap) {
    if (this.wrap != newWrap) {
        // NOTE: wrap can almost certainly be changed on the fly w/o redraw, at least on modern
        // browsers
        this.wrap = newWrap;
        this.markForRedraw("wrapChanged");
    }
},

// get the cell holding the title text.  DOM only.
getTitleCell : function () {
    if (!this.getHandle()) return null;
    var table = this.getHandle().firstChild,
        row = table && table.rows != null ? table.rows[0] : null,
        cell = row && row.cells != null ? row.cells[0] : null;
    return cell;
},

// get the minimum height of this button which would not clip the title text as it is currently
// wrapped.  Only available after drawing.  For Moz, must set "reliableMinHeight" for
// this to be reliable.
getButtonMinHeight : function () {
    

    var titleCell = this.getTitleCell();
    // In IE, and probably other DOM browsers, the cell's scrollHeight is reliable
    if (!isc.Browser.isMoz) {
        return titleCell.scrollHeight + isc.Element._getVBorderSize(this.getStateName());
    }

    
    return titleCell.firstChild.offsetHeight + 
        isc.Element._getVBorderSize(this.getStateName());
},

// get the width this button would need to be in order to show all text without wrapping
// XXX move deeper, to Canvas?
getPreferredWidth : function () {

    

    var oldWrap = this.wrap,
        oldOverflow = this.overflow,
        oldWidth = this.width;

    // set overflow visible with no minimum width in order to get the minimum width that won't
    // wrap or clip the title text
    // XXX because wrapping is controlled by a <NOBR> tag in the generated HTML, we can't detect
    // preferred width without a redraw, even if we could resize without a redraw
    this.setWrap(false);
    this.overflow = isc.Canvas.VISIBLE;
    this.setWidth(1);
    this.redrawIfDirty("getPreferredWidth");

    var width = this.getScrollWidth();

    // reset text wrapping and overflow setting
    this.setWrap(oldWrap);
    this.overflow = oldOverflow;
    // NOTE: if this button needs to redraw on resize, this will queue up a redraw, but if you
    // are trying to set the button to it's preferred size you will avoid a redraw if you set
    // the new size right away.
    this.setWidth(oldWidth); 

    return width;
},

// measure button width by writing the "width test" HTML into a test canvas

_measureWidth : function (title) {
    // create common test canvas shared by isc.Button
    var buttonWidthTester = isc.Button._buttonWidthTester;
    if (buttonWidthTester == null || buttonWidthTester.destroyed) {
        buttonWidthTester = isc.Button._buttonWidthTester = isc.Canvas.create({
            autoDraw: false,
            top: -1000,
            width: 1,
            overflow: "hidden",
            ariaState: {
                hidden: true
            }
        });
    }
    // get "width test" HTML for supplied title, and if it matches cache, use cached width
    var testHTML = this._getSizeTestHTML(title);
    if (title != null) {
        if (this._showTitleHTML && this._showTitleHTML == testHTML) return this._showTitleWidth;
    } else {
        if (this._hideTitleHTML && this._hideTitleHTML == testHTML) return this._hideTitleWidth;
    }

    // changed HTML - install it in test canvas and (re)draw it
    buttonWidthTester.setContents(testHTML);
    if (!buttonWidthTester.isDrawn()) buttonWidthTester.draw();
    else buttonWidthTester.redrawIfDirty("measuring button width");

    // cache and report test canvas width
    if (title != null) {
        this._showTitleHTML = testHTML;
        return this._showTitleWidth = buttonWidthTester.getScrollWidth();
    } else {
        this._hideTitleHTML = testHTML;
        return this._hideTitleWidth = buttonWidthTester.getScrollWidth();
    }        
},



//> @attr Button.adaptWidthShowIconOnly (boolean : true : IRW)
// If +link{button.canAdaptWidth} is true, and this button has a specified +link{button.icon}, should
// the title be hidden, allowing the button to shrink down to just show the icon when there isn't
// enough horizontal space in a layout to show the default sized button?
// @see button.canAdaptWidth
// @see button.iconOnlyBaseStyle
// @visibility external
//<
adaptWidthShowIconOnly:true,
adaptWidthShouldHideTitle : function () {
    return this.adaptWidthShowIconOnly && this.icon != null;
},

// implements canAdaptWidth: true behavior for button
// We support shrinking in two ways:
// - if adaptWidthShowIconOnly is true, (and there is an icon), hide the title and fit to the icon width
//   [or minWidth if specified and > icon width]
// - otherwise if minWidth is specified and we're currently autoFitWidth:true, allow the content
//   to clip down to minWidth


adaptWidthBy : function (pixelDifference, unadaptedWidth, firstOffer, overflowed) {


    var mayHideTitle = this.adaptWidthShouldHideTitle(),
        mayToggleAutoFit = (this.minWidth != null) && (this._specifiedAutoFit || this.autoFit);
    // We can't meaningfully "adapt width" unless
    // - we are toggling title visibility
    // - we are toggling autoFit settings
    if (!mayHideTitle && !mayToggleAutoFit) {
        return 0;
    }
    
    
    var canOverflow = mayToggleAutoFit || 
                    (this.overflow != isc.Canvas.HIDDEN && this.overflow != isc.Canvas.CLIP_H);

    // consider whether to show or hide the button's title, based on the pixel offer
    
    var adaptToSmallerSize = this._adaptedToSmallerSize;
    if ((pixelDifference > 0 && adaptToSmallerSize) ||
         (pixelDifference < 0 && !adaptToSmallerSize))
    {
        // desired state is opposite title visibility / clipping
        adaptToSmallerSize = !adaptToSmallerSize;
    } else {
        // keep current title visibility/clipping, but possibly still adapt
        if (overflowed || !firstOffer) return 0;
    }

    // calculate the desired width (in the new state)
    
    var desiredWidth;
    if (!adaptToSmallerSize && !canOverflow && isc.isA.Number(this._userWidth)) {
        desiredWidth = this._userWidth;
    } else {
        if (adaptToSmallerSize) {
            desiredWidth = this.minWidth || 1;
            if (mayHideTitle) desiredWidth = Math.max(desiredWidth, this._measureWidth(null));
        } else {
            desiredWidth = this._measureWidth(this.getTitleHTML(true));
        }
    }
    // we want to render smaller than normal
    if (adaptToSmallerSize) {
        
        if (desiredWidth < unadaptedWidth) {
            this._adaptedToSmallerSize = true;
            
            this._hideTitle = mayHideTitle;
            if (mayToggleAutoFit) {
                this.setAutoFit(false);
                // Remember that the user requested autoFit:true for next time this method runs
                this._specifiedAutoFit = true;
            }
                    
            this.markForRedraw();

            return desiredWidth - unadaptedWidth;
        }

    // we want to show the title
    } else { 
        
        var availableWidth = unadaptedWidth + pixelDifference;
        if (desiredWidth <= availableWidth) {
            this._adaptedToSmallerSize = false;

            this._hideTitle = false;
            if (mayToggleAutoFit) {
                this.setAutoFit(true);
            }
            this.markForRedraw();
            return desiredWidth - unadaptedWidth;
        }
    }

    // reject the offer - maintain currently adapted width
    return 0;
},

getTitle : function (ignoreHide) {
    if (!ignoreHide && this._hideTitle) return null;
    if (this.useContents) return this.getContents();
    return this.title;
},

getStateName : function (title) {
    var undef,
        modifier = this.getStateSuffix(),
        hideTitle = title !== undef ? !title : this._hideTitle,
        baseStyle = hideTitle && this.iconOnlyBaseStyle || this.baseStyle;
    return modifier ? baseStyle + modifier : baseStyle;
},

//>	@method	button.stateChanged()	(A)
//		@group	appearance
//			overrides the StatefulCanvas implementation to update the contents TD className
//<
stateChanged : function () {
    
    var src, isSprite;
    if (this.icon) {
        src = this._getIconURL();
        isSprite = this._iconIsSprite();
    }

    
    if (this._shouldRedrawOnStateChange() || !this.isDrawn() ||
        this.icon && !this._canSetImage(this._$icon, src, isSprite))
    {
        // pass the param to force superclass method to redraw
        return this.invokeSuper(isc.Button, "stateChanged", true);

    } else {
        var stateName = this.isPrinting ? this.getPrintStyleName() : this.getStateName();

        // if the border properties are on the DIV, apply them to the element's handle now
        if (this.shouldPushTableBorderStyleToDiv()) {
            this._applyBorderStyle(stateName);
            // Also apply the bg-color to the div. This is required to ensure 
            // the background butts up agains the inner edge of any curved borders properly
            var styleHandle = this.getStyleHandle();
            if (styleHandle != null) {
                var newColor = this._getHandleBackgroundColor();
                styleHandle.backgroundColor = newColor;
                // push opacity after background-color
                var newOpacity = this._getHandleOpacity();
                styleHandle.opacity = newOpacity;
            }
        }
        if (this.shouldPushTableShadowStyleToDiv()) {
            this._applyShadowStyle(stateName);
        }

        
        if (!this.suppressClassName) this.setClassName(stateName);
        else this.setTableClassName(stateName);
        
        // if _igoreIcon is set, ignore the icon - RibbonButton, see check in StatefulCanvas
        if (this.icon && !this._ignoreIcon && !this.isFontIconConfig(this.icon)) {
            // NOTE: the icon may or may not actually change to reflect states or selected-ness,
            // but either state or selected-ness or both may have just changed, and we may be
            // transitioning from a state we do show to a state we don't, so no-oping is
            // tricky; we don't both for now.
            this.setImage(this._$icon, src, null, isSprite);

            if (this.iconStyle != null) {
                this.getImage(this._$icon).className = 
                    this.iconStyle + this._getIconStyleSuffix();
            }
        }

        // If we have a titleStyle and we are using a subtable, then update the styles of the
        // subtable's cells.
        var TD;
        if (this.titleStyle && (TD = this.getTitleCell()) != null) {
            var firstChild = TD.firstChild;
            if (firstChild != null && firstChild.tagName == this._$TABLE) {
                var titleStyleName = this.isPrinting ? this.getPrintStyleName() : this.getTitleStateName();

                
                var cells = firstChild.rows[0].childNodes;
                for (var i = 0; i < cells.length; i++) {
                    cells[i].className = titleStyleName;
                }
            }
        }
    }
},

// Set the css className of the table cell
_$TABLE: "TABLE",
setTableClassName : function (newClass){
    // If we're pushing the border style to the div, we can't assume the
    // border thickness for the widget won't change with the new style name
    if (this.shouldPushTableBorderStyleToDiv()) {
        this._cachedBorderSize = null;
    }

    var TD = this.getTitleCell();
    if (!TD) return;
    if (TD.className != newClass) TD.className = newClass;

    
    if (this._usesSubtable(true) && !this.titleStyle) {
        // if we're using a subtable, update the style on the title cell too (it won't
        // cascade).
        
        var firstChild = TD.firstChild;
        if (firstChild != null && firstChild.tagName == this._$TABLE) {
            
            var cells = firstChild.rows[0].children;
            if (cells != null) {
                for (var i = 0; i < cells.length; i++) {
                    if (cells[i] && cells[i].className != newClass) cells[i].className = newClass;
                }
            }
        }
    }

    
    if (this.overflow == isc.Canvas.VISIBLE) {
        
        this._resetHandleOnAdjustOverflow = true;
        this.adjustOverflow("table style changed");
    }
},


getScrollWidth : function (recalculate,a,b,c) {
    var reportedScrollWidth = this.invokeSuper(isc.Button, "getScrollWidth", recalculate,a,b,c);
    if (!recalculate || !this.isDrawn()) return reportedScrollWidth;
    if (isc.Browser.isIE9 && this._usesSubtable(true)) {
        var titleClipperHandle = this.getDocument().getElementById(this._getTitleClipperID());
        if (titleClipperHandle != null) {
            var scrollWidth;
            if (isc.Browser.isMoz) {
                
                var range = this.getDocument().createRange();
                range.selectNodeContents(titleClipperHandle);
                var contentsBCR = range.getBoundingClientRect();
                scrollWidth = contentsBCR.width;
            } else {
                
                scrollWidth = titleClipperHandle.scrollWidth;
            }

            if (this.icon != null) {
                var iconSpacing = this.getIconSpacing(),
                    iconWidth = (this.iconWidth || this.iconSize),
                    extraWidth = iconSpacing + iconWidth;
                scrollWidth += extraWidth;
            }

            scrollWidth += isc.Element._getHBorderPad(this.getStateName());

            return Math.ceil(scrollWidth);
        }

    } else if ((isc.Browser.isMoz && isc.Browser.isMac && isc.Browser.version >= 4) ||
               isc.Browser.isIE9)
    {
        var tableElem = this._getTableElement();
        var position = tableElem.style.position;
        var range = tableElem.ownerDocument.createRange();
        range.selectNode(tableElem);
        var contentsBCR = range.getBoundingClientRect();
        
        var bcrScrollWidth;
        
        if (isc.Browser.isIE9 && !isc.Browser.isIE10) {
            bcrScrollWidth = (contentsBCR.width + 1) << 0;
        } else {
            bcrScrollWidth = Math.ceil(contentsBCR.width);
        }
        
        if (bcrScrollWidth > reportedScrollWidth) {
             this._scrollWidth = bcrScrollWidth;
             return bcrScrollWidth;
        }
    }
    
    return reportedScrollWidth;

},

setIcon : function (icon) {
    var hadIcon = this.icon != null;
    this.icon = icon;

    // Make sure that we're drawn before trying to set the image src or redraw().
    if (this.isDrawn()) {
        var src = this._getIconURL(),
            isSprite = this._iconIsSprite()
        ;
        if (hadIcon && (icon != null) && this._canSetImage(this._$icon, src, isSprite)) {
            this.setImage(this._$icon, src, null, isSprite);
        } else {
            this.redraw();
        }
    }
},

setIconStyle : function (iconStyle) {
    this.iconStyle = iconStyle;

    var hadIcon = this.icon != null;
    if (this.isDrawn() && hadIcon) {
        var image = this.getImage(this._$icon);
        if (image != null) {
            image.className = (iconStyle == null ? isc.emptyString
                                                 : iconStyle + this._getIconStyleSuffix());
        }
    }
},

_cellFocus : function () {
    isc.EH._setThread("cFCS");
    this.focus();
    isc.EH._clearThread();
},

// override _updateCanFocus() to redraw the button.  If the focusability of the button is changed
// and we're making use of native HTML focus / tabIndex behavior, we'll need to regenerate the 
// inner HTML.
_updateCanFocus : function () {
    this.Super("_updateCanFocus", arguments);
    if (this._useNativeTabIndex) this.markForRedraw();
},

_getShadowCSSHTML : function (stateName) {
    // explicit 'showShadow' overrides settings on the css class
    var cssText;
    if (this.showShadow && this.shouldUseCSSShadow()) {
        cssText = this._getShadowCSSText(true);
        if (cssText == null) cssText = "";
    } else {
        var cssText = isc.StatefulCanvas._getShadowCSSHTML(stateName);
        if (cssText != isc.emptyString) cssText = ";" + cssText;
    }
    return cssText;
},


// return the border HTML used by getTagStart
_getBorderHTML : function () {

    if (this.shouldPushTableBorderStyleToDiv()) {
        var stateName = this.isPrinting ? this.getPrintStyleName() : this.getStateName();

        var borderHTML = this.border != null ? ";BORDER:" + this.border : "";
        borderHTML += isc.StatefulCanvas._getBorderCSSHTML(this.border != null, stateName);
        // Also apply box-shadow CSS text. Not technically part of the border but
        // this also needs to be shifted from the Table element to the 
        // widget handle
        if (this.shouldPushTableShadowStyleToDiv()) {
            borderHTML += this._getShadowCSSHTML(stateName);
        }
        return borderHTML;
    }

    var borderHTML = this.Super("_getBorderHTML", arguments);
    if (this.shouldPushTableShadowStyleToDiv()) {
        var stateName = this.isPrinting ? this.getPrintStyleName() : this.getStateName(),
            shadowCSS = this._getShadowCSSHTML(stateName);
        if (shadowCSS != isc.emptyString) {
            borderHTML = borderHTML == null ? shadowCSS : borderHTML + shadowCSS;
        }
    }

    return borderHTML;
},

_applyBorderStyle : function (className) {
    var styleHandle = this.getClipHandle().style,
        properties = isc.StatefulCanvas._buildBorderStyle(this.border != null, className);

    // if this.border is set, we don't want the CSS style to clobber it - the first param in 
    // the call to _buildBorderStyle() above will cause it to return only border-radius styles 
    // - in that case, don't clear the border setting on the styleHandle.
    if (!this.border) styleHandle.border = isc.emptyString;
    styleHandle.borderRadius = isc.emptyString;
    isc.addProperties(styleHandle, properties);
},

_applyShadowStyle : function (className) {

    var styleHandle = this.getClipHandle().style;
    if (this.showShadow && this.shouldUseCSSShadow()) {
        styleHandle.boxShadow = this._getShadowCSSText();
        return;
    }
    
    // get the outset shadows
    var properties = isc.StatefulCanvas._buildShadowStyle(className);

    // reset all shadow styling on the outer div
    styleHandle.boxShadow = isc.emptyString;
    // apply just the outset shadows to the outer div
    isc.addProperties(styleHandle, properties);
    
    // in Chrome, we want to apply inset shadows to the table element, to avoid missizing
    // - in other browsers, assign them to the cell, so inset shadows show
    var elem = (isc.Browser.isChrome) ? this._getTableElement() : this._getCellElement();
    
    if (elem != null) {
        var style = elem.style; 
        // get the inset shadows
        properties = isc.StatefulCanvas._buildShadowStyle(className, null, true);

        // reset all shadow styling on the inner table
        style.boxShadow = isc.emptyString;
        // apply just the inset shadows to the inner table
        isc.addProperties(style, properties);
    }
},

// CSS class that actually governs what borders appear on the handle.
// This is overridden in Button.js where we apply the baseStyle + modifier to the
// handle directly.
_getBorderClassName : function () {
    if (this.shouldPushTableBorderStyleToDiv()) {
        return this.getStateName();
    }
    return this.Super("_getBorderClassName", arguments);
},

//>	@method	button.setAlign()
// Sets the (horizontal) alignment of this buttons content.
//  @group positioning
//  @visibility external
//<
// defined in StatefulCanvas

//>	@method	button.setVAlign()
// Sets the vertical alignment of this buttons content.
//  @group positioning
//  @visibility external
//<
// defined in StatefulCanvas

// In IE a click on a TD element can cause native focus to go to that element, which
// means if you click on a button you can end up at the wrong spot in the page's tab order
// Use handleFocusIn (bubbled up from the TD element) to catch this and reset focus
// to the widget handle.

handleFocusIn : function (element, event) {
    
    if (isc.Browser.isIE && this._canFocus() && isc.EH.leftButtonDown()) {
        var nodeName = element && element.nodeName;
        if (nodeName == "TD") {
            this.logWarn(
                "Button: Intercepting native focus from mouseDown on table cell and resetting to handle.", 
                "nativeFocus");
            this.focus();
            return;
        }
    }
    // This will fire the standard focus notification
    return this.Super("handleFocusIn", arguments);
    
}
    
});	// END	isc.Button.addMethods()



isc.Button.addClassProperties({
    _stateBGColorCache:{},
    _getStateBackgroundColor : function (className) {
        var nullMarker = "**null**";
        if (this._stateBGColorCache[className] == null) {
            var computedStyle = isc.Element._deriveStyleProperties(className, ["backgroundColor"]);
            this._stateBGColorCache[className] = computedStyle.backgroundColor == null ? 
                                                nullMarker : computedStyle.backgroundColor;
        }
        return this._stateBGColorCache[className] == nullMarker ? null : 
                this._stateBGColorCache[className];
    },
    _stateOpacityCache:{},
    _getStateOpacity : function (className) {
        var nullMarker = "**null**";
        if (this._stateOpacityCache[className] == null) {
            var computedStyle = isc.Element._deriveStyleProperties(className, ["opacity"]);
            this._stateOpacityCache[className] = computedStyle.opacity == null ? 
                                                nullMarker : computedStyle.opacity;
        }
        return this._stateOpacityCache[className] == nullMarker ? null : 
                this._stateOpacityCache[className];
    }
});

isc.Button.registerStringMethods({
    getTitle:null
});


// AutoFitButton
// --------------------------------------------------------------------------------------------
// Button that automatically sizes to the title text.

//> @class AutoFitButton
//
// A button that automatically sizes to the length of its title.  Implemented via the 
// +link{StatefulCanvas.autoFit} property.
//
// @deprecated As of Isomorphic SmartClient version 5.5, autoFit behavior can be achieved using
// the Button class instead by setting the property +link{Button.autoFit} to true.
//
// @see Button
// @inheritsFrom Button
// @treeLocation Client Reference/Control/Button
// @visibility external
//<

isc.ClassFactory.defineClass("AutoFitButton", "Button");

isc.AutoFitButton.addProperties({
    autoFit:true
});




isc.Button.registerStringMethods({
    //>@method Button.iconClick()
    // If this button is showing an +link{Button.icon, icon}, a separate click handler for the
    // icon may be defined as <code>this.iconClick</code>.
    // Returning false will suppress the standard button click handling code.
    // @return (boolean) false to suppress the standard button click event
    // @group buttonIcon    
    // @visibility external
    //<
    // don't expose the parameters - they're not really useful to the developer
    iconClick:"element,ID,event",

    //> @method button.titleHover()
    // Optional stringMethod to fire when the user hovers over this button and the title is
    // clipped. If +link{Button.showClippedTitleOnHover} is true, the default behavior is to
    // show a hover canvas containing the HTML returned by +link{Button.titleHoverHTML()}.
    // Return false to suppress this default behavior.
    // @return (boolean) false to suppress the standard hover
    // @see Button.titleClipped()
    // @group hovers
    // @visibility external
    //<
    titleHover:""
});


// Make "IButton" a synonym of Button by default.

//>	@class	IButton
//
// The IButton widget class is a class that implements the same APIs as the 
// +link{class:Button} class.  Depending on the current skin, <code>IButton</code>s may be
// on the +link{StretchImgButton} component, which renders via images, or may be based on the
// +link{Button} component, which renders via CSS styles.
//
// @inheritsFrom Button
// @treeLocation Client Reference/Control
// @visibility external
//<

isc.addGlobal("IButton", isc.Button);


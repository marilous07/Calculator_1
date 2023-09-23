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
//>	@class	Label
// Labels display a small amount of +link{label.align,alignable} +link{label.contents,text}
// with optional +link{label.icon,icon} and +link{label.autoFit,autoFit}.
// <P>
// For a general-purpose container for HTML content, use +link{HTMLFlow} or +link{HTMLPane}
// instead.
//
//  @inheritsFrom Button
//  @treeLocation Client Reference/Foundation
//  @visibility external
//  @example label
//<

isc.defineClass("Label", "Button").addMethods({
    //>	@attr label.contents		(HTMLString : "&nbsp;" : [IRW])
    // @include canvas.contents
    //< 

    //> @attr label.dynamicContents (Boolean : false : IRWA)
    //	@include canvas.dynamicContents
    //<

    //>	@attr	label.align		(Alignment : isc.Canvas.LEFT : [IRW])
    //          Horizontal alignment of label text. See Alignment type for details.
    //      @visibility external
    //      @group	positioning
    //<
    align:isc.Canvas.LEFT,

    //>	@attr	label.valign		(VerticalAlignment : isc.Canvas.CENTER : [IRW])
    //          Vertical alignment of label text. See VerticalAlignment type for details.
    //      @visibility external
    //      @group	positioning
    //<
    // defaulted in StatefulCanvas
    
    //>	@attr	label.wrap		(Boolean : true : [IRW])
    // If false, the label text will not be wrapped to the next line.
    // @visibility external
    // @group sizing
    //<
	wrap:true,
    
    //> @attr label.autoFit    (boolean : null : [IRW])
    // @include StatefulCanvas.autoFit
    // @visibility external
    //<

    //> @attr label.width
    // @include statefulCanvas.width
    // @group sizing
    // @visibility external
    //<    

    //> @attr label.height
    // @include statefulCanvas.height
    // @group sizing
    // @visibility external
    //<    
    
    // showTitle must be false 
    // If this property gets set to true on the Label class we'd be likely to have infinite
    // recursion of labels being created for labels.
    showTitle:false,

    // Icon handling    
    // ---------------------------------------------------------------------------------------

    //> @attr label.icon
    // @include statefulCanvas.icon
    // @visibility external
    //<
    //> @attr label.iconSize
    // @include statefulCanvas.iconSize
    // @visibility external
    //<
    //> @attr label.iconWidth
    // @include statefulCanvas.iconWidth
    // @visibility external
    //<
    //> @attr label.iconHeight
    // @include statefulCanvas.iconHeight
    // @visibility external
    //<
    //> @attr label.iconOrientation
    // @include statefulCanvas.iconOrientation
    // @visibility external
    //<
    //> @attr label.iconAlign
    // @include statefulCanvas.iconAlign
    // @visibility external
    //<
    //> @attr label.iconSpacing
    // @include statefulCanvas.iconSpacing
    // @visibility external
    //<
    //> @attr label.showDisabledIcon
    // @include statefulCanvas.showDisabledIcon
    // @visibility external
    //<
    //> @attr label.showRollOverIcon
    // @include statefulCanvas.showRollOverIcon
    // @visibility external
    //<
    //> @attr label.showFocusedIcon
    // @include statefulCanvas.showFocusedIcon
    // @visibility external
    //<
    //> @attr label.showDownIcon
    // @include statefulCanvas.showDownIcon
    // @visibility external
    //<
    //> @attr label.showSelectedIcon
    // @include statefulCanvas.showSelectedIcon
    // @visibility external
    //<
    //> @method label.setIconOrientation()
    // @include statefulCanvas.setIconOrientation
    // @visibility external
    //<
    //> @method label.setIcon()
    // @include statefulCanvas.setIcon
    // @visibility external
    //<

	// -------------------------------------------------------------------------
    

    // reversions of Button's changes relative to Canvas
    height:null,
    width:null,
    overflow:"visible",
    canFocus:false,
        
    
    
    //> @attr label.styleName (CSSStyleName : "normal" : IRW)
    // Set the CSS class for this widget.  For a Label, this is equivalent to
    // setting +link{button.baseStyle}.
    //
    // @visibility external
    //<
    styleName:"normal",
    // NOTE: the Button class configures styleName as null, and sets baseStyle to "button",
    // which we reverse.
    baseStyle:null,

    //> @method label.setStyleName()
    // Dynamically change the CSS class for this widget.  For a Label, this is equivalent to
    // +link{StatefulCanvas.setBaseStyle(), setBaseStyle()}.
    //
    // @param newStyle (CSSStyleName) new CSS style name
    // @visibility external
    //<
    setStyleName : function (newStyle) {
        this.setBaseStyle(newStyle);
    },

    // reversions of StatefulCanvas
    cursor:"default",
    // suppress state changes
    showRollOver:false, showFocus:false, showDown:false, showDisabled:false,

    // hack to have Button rendering code use getContents() instead of this.title
    useContents:true
});
//>	@method	label.setContents()
// @include canvas.setContents()
//<
    

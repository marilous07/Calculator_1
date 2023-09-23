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
//>	@class	HeaderItem
// FormItem for showing a header within a DynamicForm.
// <p>
// Set the <code>defaultValue</code> of this item to the HTML you want to embed in the form.
// @inheritsFrom FormItem
// @visibility external
//<
isc.ClassFactory.defineClass("HeaderItem", "FormItem");
isc.HeaderItem.addProperties({
    // avoid attempting to save this item's value in the form's values array
    shouldSaveValue:false,

    //>	@attr	headerItem.defaultValue (String : "Header" : IRW)
	// Header text
	//		@group	appearance
    // @visibility external
	//<
    defaultValue:"Header",

    //>	@attr	headerItem.height		(number : 20 : IRW)
	// Default height of this item
	//		@group	appearance
	//<
	height:20,							

    //>	@attr	headerItem.showTitle		(Boolean : false : IRW)
	// Don't show a separate title cell for headers
	//		@group	appearance
    // @visibility external
	//<	
	showTitle:false,

    //>	@attr	headerItem.textBoxStyle (FormItemBaseStyle : "headerItem" : IRW)
	//			Base CSS class for this item
	// @group   appearance
    // @visibility external
	//<
	textBoxStyle:"headerItem",		
	
	//> @attr headerItem.canSelectText (boolean : true : IRW)
	// Should the user be able to select the text in this item?
	// @visibility external
	//<
    canSelectText:true,	

    //>	@attr	headerItem.colSpan		(int | String : "*" : IRW)
	//			by default, headers span all remaining columns
	//		@group	appearance
    // @visibility external
	//<	
	colSpan:"*",						

    //>	@attr	headerItem.startRow		(Boolean : true : IRW)
	//			these items are in a row by themselves by default
	//		@group	appearance
    // @visibility external
	//<
	startRow:true,
	
    //>	@attr	headerItem.endRow			(Boolean : true : IRW)
	//			these items are in a row by themselves by default
	//		@group	appearance
    // @visibility external
	//<
	endRow:true,

    //> @attr headerItem.align
    // Alignment of this <code>HeaderItem</code> in its cell.
    // <p>
    // Note: Because a <code>HeaderItem</code> fills its cell by default, if the
    // +link{HeaderItem.applyAlignToText,applyAlignToText} setting is changed to false, then the
    // +link{FormItem.textAlign,textAlign} setting (rather than the <code>align</code> setting)
    // of this <code>HeaderItem</code> should be used to control the alignment of the header text.
    // @include FormItem.align
    //<

    //> @attr headerItem.applyAlignToText (boolean : true : IRA)
    // If the +link{FormItem.textAlign,textAlign} is unset, should the +link{HeaderItem.align,align}
    // setting, if set, be used for this <code>HeaderItem</code>'s <code>textAlign</code>?
    // @include FormItem.applyAlignToText
    //<
    applyAlignToText:true,

    // Override emptyDisplayValue to write out "&nbsp;" so styling will work properly
    emptyDisplayValue:"&nbsp;"
    
});


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
//>	@class RichTextEditor
// RichTextEditing component.  Provides a rich-text editing area along with UI for executing
// rich-text commands on selected content.
// <p>
// The HTML generated from this component may vary by browser, and, as with any HTML 
// value created on the client, we recommend values be sanitized on the server before 
// storing and displaying to other users.
//
// @inheritsFrom VLayout
// @treeLocation Client Reference/Foundation
// @visibility external
// @example RichTextEditor
//<

isc.ClassFactory.defineClass("RichTextEditor", "VLayout");


isc.RichTextEditor.addProperties({

    // Edit Area config
    
    editAreaConstructor: "RichTextCanvas",

    //> @attr richTextEditor.editArea (AutoChild Canvas : null : R)
    // The edit canvas created automatically for this RichTextEditor.
    // @visibility external
    //<
    
    //> @attr richTextEditor.editAreaBackgroundColor (String : "white" : IR)
    // Background color for the +link{richTextEditor.editArea, edit canvas}.
    // @visibility external
    //<
    editAreaBackgroundColor: "white",

    //> @attr richTextEditor.editAreaClassName (String : null : IR)
    // Edit Area can have a custom class applied.
    //<
    editAreaClassName: "normal",
    
    //> @attr richTextEditor.useDesignMode (Boolean : false : IRA)
    // Should this editor use a separate IFRAME with special cross-browser support for editing 
    // HTML content?  In SmartClient versions 13.0 and later, this feature is switched off on
    // account of better modern browser support for contentEditable containers.
    // @visibility external
    //<
    useDesignMode: false,

    //> @attr richTextEditor.styleWithCSS (Boolean : null : IRA)
    // When true, applies style attributes in markup instead of presentation elements.
    // @visibility external
    //<
    //styleWithCSS: null,

    //> @attr richTextEditor.value (String : "" : IRW)
    // Initial value for the edit area.    Use <code>getValue()</code> and 
    // <code>setValue()</code> to update at runtime.
    // @visibility external
    //<
    value: "",
    
    // General toolbar config

    //> @attr richTextEditor.toolArea (AutoChild Layout : null : R)
    // Layout used to contain all of the +link{richTextEditor.toolbar, toolbar} AutoChildren 
    // that contain the +link{controlGroups}.
    // @visibility external
    //<
    toolAreaDefaults: {
        _constructor: "VLayout",
        width: "100%",
        overflow: isc.Canvas.VISIBLE
    },

    //> @attr richTextEditor.toolbar (MultiAutoChild Layout : null : R)
    // Layout used to contain each of the +link{controlGroups}.
    // @visibility external
    //<
    toolbarConstructor: "HLayout",
    toolbarDefaults: {
        defaultLayoutAlign: isc.Canvas.CENTER,

        // explicitly suppress printing the toolbar by default
        shouldPrint: false,

        // Make the toolbar overflow:"visible" - if it exceeds the availableSpace we'll allow
        // the editor itself to decide whether it should be clipped
        overflow: isc.Canvas.VISIBLE
    },

    toolbarHeight: 24, // should be less but figure this out later!
    
    //> @attr RichTextEditor.toolbarBackgroundColor  (String : "#CCCCCC" : [IR])
    //  The background color for the toolbar.
    // @visibility external
    //<
    toolbarBackgroundColor: "#CCCCCC",

    toolbarSeparatorSrc: "[SKIN]/RichTextEditor/separator.png",


    // Default width for control buttons
    controlButtonWidth: 20,

    //> @attr richTextEditor.defaultControlConstructor (SCClassName : "IconButton" : IRA)
    // By default our 'controls' will be of this specified class. Override for specific 
    // controls by either implementing a '[controlName]_autoMaker' function which returns the
    // control, or by specifying '[controlName]Constructor' as a pointer to an appropriate 
    // SmartClient class.
    //<
    defaultControlConstructor: "IconButton",

    //> @type StandardControlGroup
    // @value "fontControls" +link{RichTextEditor.fontControls,Font controls}
    // @value "formatControls" +link{RichTextEditor.formatControls,Text formatting controls}
    // @value "styleControls" +link{RichTextEditor.styleControls,Text styling controls}
    // @value "colorControls" +link{RichTextEditor.colorControls,Color controls}
    // @value "bulletControls" +link{RichTextEditor.bulletControls,HTML list controls}
    // @visibility external
    //<
    // @value "editControls" - omitted, not functional across all browsers

    //> @attr richTextEditor.controlGroups (Array : ["fontControls", "formatControls", "styleControls", "colorControls"] : IRA)
    // An array of control groups specifying which groups of controls should be included in the
    // editor tool area. The values of this array may be the name of a control group such as
    // one of the +link{StandardControlGroup}s, a +link{Canvas}, or the special string "break"
    // which causes the subsequent control groups to continue onto a new line.
    // <smartclient>
    // <p>
    // For each control group name, this[controlGroupName] should be defined as an array of 
    // +link{type:ControlName}s or Canvas instances. This allows the controls of a control
    // group to be customized.
    // </smartclient>
    //
    // @visibility external
    // @example RichTextEditor
    //<
    controlGroups: [
        "fontControls", "formatControls", "styleControls", "colorControls"
        // ,"editControls"  // Don't show the edit controls by default as they're disabled
                            // on Moz and Safari.
    ],

	//>	@type ControlName
    // Names for the standard controls built into the RichTextEditor.  You can use these
    // <code>ControlNames</code> in APIs like +link{richTextEditor.styleControls} to control
    // the order in which controls appear, to omit default controls or to show controls that
    // are not shown by default.
    // <p>
    // Every <code>ControlName</code> is also the name of an +link{AutoChild}, so all the
    // built-in controls can be skinned or otherwise customized via the
    // +link{group:autoChildUsage,AutoChild system}. <smartgwt>Note that the AutoChild
    // name in each case is the camelCaps version of the <code>ControlName</code> value.  For
    // example, use "boldSelection" as the name of the AutoChild for the bold button, not
    // "BOLDSELECTION".</smartgwt>
    //
    // @value "boldSelection"  A button to make the current selection bold.
    // @value "italicSelection"  A button to make the current selection italic.
    // @value "underlineSelection" A button to make the current selection underlined.
    // @value "fontSelector" A select item allowing the user to change the font of the current
    // text selection.
    // @value "fontSizeSelector" A select item allowing the user to change the font size of the
    // current text selection.
    // @value "alignLeft" A button to left-align the selected text.
    // @value "alignRight" A button to right-align the selected text.
    // @value "alignCenter" A button to center the selected text.
    // @value "justify" A button to justify the selected line of text.
    // @value "color" A color-picker allowing the user to set the text color.
    // @value "backgroundColor" A color picker allowing the user to set the text background
    // color.
    // @value "indent" Within text, indents the paragraph. Within a list, increases the list
    // level.
    // @value "outdent" Within text, outdents the paragraph. Within a list, decreases the list
    // level.
    // @value "orderedList" Turns the current selection into an ordered list (HTML &lt;ol&gt;)
    // or converts an unordered list to an ordered list.
    // @value "unorderedList" Turns the current selection into an unordered list (HTML &lt;ul&gt;)
    // or converts an ordered list to an unordered list.
    // @value "listProperties" Shows the +link{RichTextEditor.listPropertiesDialog,listPropertiesDialog}
    // to allow configuring the options of the currently selected HTML list.
    // @visibility external
    //<
    // In addition to the standard ControlNames, custom controls can be added.
    // To add a custom control simply add a new control name (string) to a controlGroup.
    // By default the control will show up as a button with width specified by 
    // <code>richTextCanvas.controlButtonWidth</code>.<br>
    // Properties for each control will be picked up from <code>this.[ControlName]Defaults</code> 
    // and <code>this.[ControlName]Properties</code>.<br>
    // If no click handler is specified in these property blocks, click will call 
    // <code>fireAction()</code> on this editor, passing in the ControlName as an action to fire.<br>
    //    
    //  Note - for custom click-handling purposes, default control buttons are created with
    //  a 'creator' property which points back to the richTextEditor that created them.<br>
    //  For completely custom controls to be included in the toolbar, define a method named
    //  [ControlName]_autoMaker on the RichTextEditor instance. This method should return a
    //  widget instance, which will then be added to the toolbar in the appropriate position.

    // Style Control Config --------------------------------------    

    //> @attr richTextEditor.styleControls (Array of ControlName : ["boldSelection", "italicSelection", "underlineSelection"] : IRA)
    // Default text styling control group. Consists of an array of +link{type:ControlName}s
    // and/or +link{Canvas} instances. To display this group of controls for some RichTextEditor,
    // include <code>"styleControls"</code> in the +link{RichTextEditor.controlGroups} array.
    // @visibility external
    //<
    styleControls: [
        "boldSelection", "italicSelection", "underlineSelection"
    ],

    //> @attr richTextEditor.fontSelectorItem (AutoChild SelectItem : null : IR)
    // The +link{type:AutoChild} +link{class:SelectItem} used for choosing the font to apply
    // to the current selection.
    // @visibility external
    //<

    //> @attr richTextEditor.fontSizeSelectorItem (AutoChild SelectItem : null : IR)
    // The +link{type:AutoChild} +link{class:SelectItem} used for choosing the font-size to 
    // apply to the current selection.
    // @visibility external
    //<
    
    //> @attr richTextEditor.fontSelectorPrompt (String : "Set Font..." : IRW)
    // The prompt for the built-in +link{richTextEditor.fontSelectorItem, font selector}.
    // @group i18nMessages
    // @visibility external
    //<
    fontSelectorPrompt: "Set Font...",
    //> @attr richTextEditor.fontSizeSelectorPrompt (String : "Set Font Size..." : IRW)
    // The prompt for the built-in +link{richTextEditor.fontSizeSelectorItem, font-size selector}.
    // @group i18nMessages
    // @visibility external
    //<
    fontSizeSelectorPrompt: "Set Font Size...",
    
    //> @attr richTextEditor.linkUrlTitle (String : "Hyperlink URL:" : IRW)
    // The prompt displayed when editing a hyperlink.
    // @group i18nMessages
    // @visibility internal
    //<
    linkUrlTitle: "Hyperlink URL:",

    // Properties to apply to the style controls.
    // These are picked up based on their name.
    //  NOTE: on a per-instance basis we also pick up this.boldSelectionProperties, etc.

    //> @attr richTextEditor.boldSelectionPrompt (String : "Make selection bold" : IRW)
    // The prompt for the built-in +link{type:ControlName, boldSelection} control.
    // @group i18nMessages
    // @visibility external
    //<
    boldSelectionPrompt: "Make selection bold",
    boldSelectionDefaults: { title: "<b>B</b>", showIcon: false },
    //> @attr richTextEditor.italicSelectionPrompt (String : "Make selection italic" : IRW)
    // The prompt for the built-in +link{type:ControlName, italicSelection} control.
    // @group i18nMessages
    // @visibility external
    //<
    italicSelectionPrompt: "Make selection italic",
    italicSelectionDefaults: { title: "<i>I</i>", showIcon: false },
    //> @attr richTextEditor.underlineSelectionPrompt (String : "Make selection underlined" : IRW)
    // The prompt for the built-in +link{type:ControlName, underlineSelection} control.
    // @group i18nMessages
    // @visibility external
    //<
    underlineSelectionPrompt: "Make selection underlined",
    underlineSelectionDefaults: { title: "<u>U</u>", showIcon: false },
    //> @attr richTextEditor.strikethroughSelectionPrompt (String : "Strike through selection" : IRW)
    // The prompt for the built-in +link{type:ControlName, strikethroughSelection} control.
    // @group i18nMessages
    // @visibility external
    //<
    strikethroughSelectionPrompt: "Strike through selection",
    strikethroughSelectionDefaults: { title: "<del>S</del>" },

    // Font Control Config --------------------------------------

    //> @attr richTextEditor.fontControls (Array of ControlName : ["fontSelector", "fontSizeSelector"] : IRA)
    // Default font control group. Consists of an array of +link{type:ControlName}s and/or
    // +link{Canvas} instances. To display this group of controls for some RichTextEditor,
    // include <code>"fontControls"</code> in the +link{RichTextEditor.controlGroups} array.
    // @visibility external
    //<
    
    fontControls: [
        "fontSelector", "fontSizeSelector"
    ],

    // TODO: May 2015 - expose the various selectors and buttons as autoChildren
    
    // Specify the constructor function for the two dynamic form type items
    
    fontSelectorConstructor: isc.DynamicForm,
    fontSizeSelectorConstructor: isc.DynamicForm,
    
    //> @attr richTextEditor.fontNames (Object : {} : [IRA])
    // ValueMap of css fontName properties to font name titles to display in the font selector 
    // if <code>"fontSelector"</code> is included in +link{RichTextEditor.controlGroups} 
    // for this editor.
    // Default value for this attribute:<br>
    // <code> {
    // &nbsp;&nbsp;"arial,helvetica,sans-serif": "Arial",
    // &nbsp;&nbsp;'courier new,courier,monospace': "Courier New",
	// &nbsp;&nbsp;'georgia,times new roman,times,serif': "Georgia",
	// &nbsp;&nbsp;'tahoma,arial,helvetica,sans-serif': "Tahoma",
	// &nbsp;&nbsp;'times new roman,times,serif': "Times New Roman",
    // &nbsp;&nbsp;'verdana,arial,helvetica,sans-serif': "Verdana",
    // &nbsp;&nbsp;"impact": "Impact"}</code>
    // @visibility external
    //<
    //  The default <code>createFontSelector()</code> method will apply this valueMap to the
    //  select item created as the <code>fontSelector</code> control.
    //<
    fontNames: {
		"arial,helvetica,sans-serif": "Arial",
		'courier new,courier,monospace': "Courier New",
		'georgia,times new roman,times,serif': "Georgia",
		'tahoma,arial,helvetica,sans-serif': "Tahoma",
		'times new roman,times,serif': "Times New Roman",
		'verdana,arial,helvetica,sans-serif': "Verdana",
		"impact": "Impact"
	},
    
    //> @attr richTextEditor.fontSizes (Object : {} : [IRA])
    // ValueMap of css font size property values to font size titles to display in the font size
    // selector if <code>"fontSizeSelector"</code> is included in 
    // +link{RichTextEditor.controlGroups}.
    // Default value for this attribute:<br>
    // <code>{
    // &nbsp;&nbsp;"1": "1 (8 pt)",
    // &nbsp;&nbsp;"2": "2 (10 pt)",
    // &nbsp;&nbsp;"3": "3 (12 pt)",
    // &nbsp;&nbsp;"4": "4 (14 pt)",
    // &nbsp;&nbsp;"5": "5 (18 pt)",
    // &nbsp;&nbsp;"6": "6 (24 pt)",
    // &nbsp;&nbsp;"7": "7 (36 pt)"}</code>
    // @visibility external
    //<
    //  The default <code>createFontSizeSelector()</code> method will apply this valueMap to the
    //  select item created as the <code>fontSizeSelector</code> control.
    fontSizes: {
		"1": "1 (8 pt)",
		"2": "2 (10 pt)",
		"3": "3 (12 pt)",
		"4": "4 (14 pt)",
		"5": "5 (18 pt)",
		"6": "6 (24 pt)",
		"7": "7 (36 pt)"
    },
    
    // Edit Control Config --------------------------------------
    // (Note: edit controls are hidden by default, as cut, copy, paste are disabled for 
    //  security reasons in Moz by default, and paste appears to never be supported in Safari).

    //> @attr richTextEditor.editControls (Array of ControlName : [...] : [IRA])
    // Edit control group. Consists of an array of +link{type:ControlName}s.
    //<
    // Leave this @visibility internal until for now.
    editControls: [
        "copySelection", "cutSelection", "pasteSelection"
    ],

    // Defaults for the cut/copy/paste buttons
    //> @attr richTextEditor.copySelectionPrompt (String : "Copy Selection" : IRW)
    // The prompt for the built-in +link{type:ControlName, copySelection} control.
    // @group i18nMessages
    // @visibility external
    //<
    copySelectionPrompt: "Copy Selection",
    copySelectionDefaults: { icon: "[SKIN]/RichTextEditor/copy.png" },
    //> @attr richTextEditor.cutSelectionPrompt (String : "Cut Selection" : IRW)
    // The prompt for the built-in +link{type:ControlName, cutSelection} control.
    // @group i18nMessages
    // @visibility external
    //<
    cutSelectionPrompt: "Cut Selection",
    cutSelectionDefaults: { icon: "[SKIN]/RichTextEditor/cut.png" },
    //> @attr richTextEditor.pasteSelectionPrompt (String : "Paste" : IRW)
    // The prompt for the built-in +link{type:ControlName, pasteSelection} control.
    // @group i18nMessages
    // @visibility external
    //<
    pasteSelectionPrompt: "Paste",
    pasteSelectionDefaults: { icon: "[SKIN]/RichTextEditor/paste.png" },


    // Format Control Config --------------------------------------

    //> @attr richTextEditor.formatControls (Array of ControlName : ["alignLeft", "alignRight", "alignCenter", "justify"] : IRA)
    // Default text formatting control group. Consists of an array of +link{type:ControlName}s
    // and/or +link{Canvas} instances. To display this group of controls for some RichTextEditor,
    // include <code>"formatControls"</code> in the +link{RichTextEditor.controlGroups} array.
    // @visibility external
    //<
    formatControls: [
        "alignLeft", "alignRight", "alignCenter", "justify"
    ],

    // Note: click is overridden on the various "justify..." controls as they are going to
    // call 'justifySelection(...)' passing in a parameter to specify the desired justification.
    
    //> @attr richTextEditor.alignLeftPrompt (String : "Left align selection" : IRW)
    // The prompt for the built-in +link{type:ControlName, alignLeft} control.
    // @group i18nMessages
    // @visibility external
    //<
    alignLeftPrompt: "Left align selection",
    alignLeftDefaults: { 
        actionType: "radio",
        radioGroup: "radioFormat",
        showButtonTitle: false,
        icon: "[SKIN]/RichTextEditor/text_align_left.png",
        click : function () { this.creator.fireAction('justifySelection', 'left'); }
    },
    //> @attr richTextEditor.alignCenterPrompt (String : "Center selection" : IRW)
    // The prompt for the built-in +link{type:ControlName, alignCenter} control.
    // @group i18nMessages
    // @visibility external
    //<
    alignCenterPrompt: "Center selection",
    alignCenterDefaults: { 
        actionType: "radio",
        radioGroup: "radioFormat",
        showButtonTitle: false,
        icon: "[SKIN]/RichTextEditor/text_align_center.png",
        click : function () { this.creator.fireAction('justifySelection', 'center'); }
    },
    //> @attr richTextEditor.alignRightPrompt (String : "Right align selection" : IRW)
    // The prompt for the built-in +link{type:ControlName, alignRight} control.
    // @group i18nMessages
    // @visibility external
    //<
    alignRightPrompt: "Right align selection",
    alignRightDefaults: { 
        actionType: "radio",
        radioGroup: "radioFormat",
        showButtonTitle: false,
        icon: "[SKIN]/RichTextEditor/text_align_right.png",
        click : function () { this.creator.fireAction('justifySelection', 'right'); }
    },
    //> @attr richTextEditor.justifyPrompt (String : "Full justify selection" : IRW)
    // The prompt for the built-in +link{type:ControlName, justify} control.
    // @group i18nMessages
    // @visibility external
    //<
    justifyPrompt: "Full justify selection",
    justifyDefaults: { 
        actionType: "radio",
        radioGroup: "radioFormat",
        showButtonTitle: false,
        icon: "[SKIN]/RichTextEditor/text_align_justified.png",
        click : function () { this.creator.fireAction('justifySelection', 'full'); }
    },

    // Color Control Config --------------------------------------

    //> @attr richTextEditor.colorControls (Array of ControlName : ["color", "backgroundColor"] : IRA)
    // Control group for modifying text color / background color. 
    // Consists of an array of +link{type:ControlName}s and/or +link{Canvas} instances.
    // To display this group of controls for some RichTextEditor,
    // include <code>"formatControls"</code> in the +link{RichTextEditor.controlGroups} array.
    // @visibility external
    //<
    colorControls: [
        "color", "backgroundColor"
    ],

    // color / background color defaults override click handling to prompt the user for a
    // color and apply it to the selection.
    
    //> @attr richTextEditor.colorPrompt (String : "Set selection text color" : IRW)
    // The prompt for the built-in +link{type:ControlName, color} control.
    // @group i18nMessages
    // @visibility external
    //<
    colorPrompt: "Set selection text color",
    colorDefaults: {
        showButtonTitle: false,
        icon: "[SKIN]/RichTextEditor/text_color.gif", 
        click : "this.creator.chooseTextColor()"
    },

    //> @attr richTextEditor.backgroundColorPrompt (String : "Set selection background color" : IRW)
    // The prompt for the built-in +link{type:ControlName, backgroundColor} control.
    // @group i18nMessages
    // @visibility external
    //<
    backgroundColorPrompt: "Set selection background color",
    backgroundColorDefaults: {
        showButtonTitle: false,
        icon: "[SKIN]/RichTextEditor/background_color.gif", 
        click : "this.creator.chooseBackgroundColor()" 
    },


    insertControls: [
        "link"
    ],
    
    //> @attr richTextEditor.linkPrompt (String : "Edit Hyperlink" : IRW)
    // The prompt for the built-in +link{type:ControlName, hyperlink} control.
    // @group i18nMessages
    // @visibility internal
    //<
    linkPrompt: "Edit Hyperlink",
    linkDefaults: {
        showButtonTitle: false,
        icon: "[SKIN]/RichTextEditor/link_new.png",
        click : "this.creator.createLink()"
    },


    // Lists Config -----------------------------------------------
    //> @attr RichTextEditor.bulletControls (Array of ControlName : ["indent", "outdent", "orderedList", "unorderedList", "listProperties"] : IRA)
    // Default HTML list control group. Consists of an array of +link{type:ControlName}s and/or
    // +link{Canvas} instances. To display this group of controls for some RichTextEditor,
    // include <code>"bulletControls"</code> in the +link{RichTextEditor.controlGroups} array.
    // @visibility external
    //<
    bulletControls: [
        "indent", "outdent", "orderedList", "unorderedList", "listProperties"
    ],

    //> @attr richTextEditor.indentPrompt (String : "Increase Indent" : IRW)
    // The prompt for the built-in +link{type:ControlName, indent} control.
    // @group i18nMessages
    // @visibility external
    //<
    indentPrompt: "Increase Indent",
    indentDefaults: {
        showButtonTitle: false,
        showDownIcon: false,
        icon: "[SKIN]/RichTextEditor/indent.png",
        click : "this.creator.indentSelection()"
    },

    //> @attr richTextEditor.outdentPrompt (String : "Decrease Indent" : IRW)
    // The prompt for the built-in +link{type:ControlName, outdent} control.
    // @group i18nMessages
    // @visibility external
    //<
    outdentPrompt: "Decrease Indent",
    outdentDefaults: {
        showButtonTitle: false,
        showDownIcon: false,
        icon: "[SKIN]/RichTextEditor/outdent.png",
        click : "this.creator.outdentSelection()"
    },

    //> @attr richTextEditor.orderedListPrompt (String : "Convert to a numbered list" : IRW)
    // The prompt for the built-in +link{type:ControlName, orderedList} control.
    // @group i18nMessages
    // @visibility external
    //<
    orderedListPrompt: "Convert to a numbered list",
    orderedListDefaults: {
        showButtonTitle: false,
        showDownIcon: false,
        icon: "[SKIN]/RichTextEditor/text_list_numbers.png",
        click : "this.creator.convertToOrderedList()"
    },

    //> @attr richTextEditor.unorderedListPrompt (String : "Convert to a bullet list" : IRW)
    // The prompt for the built-in +link{type:ControlName, unorderedList} control.
    // @group i18nMessages
    // @visibility external
    //<
    unorderedListPrompt: "Convert to a bullet list",
    unorderedListDefaults: {
        showButtonTitle: false,
        showDownIcon: false,
        icon: "[SKIN]/RichTextEditor/text_list_bullets.png",
        click : "this.creator.convertToUnorderedList()"
    },

    //> @attr richTextEditor.listPropertiesPrompt (String : "Configure the list" : IRW)
    // The prompt for the built-in +link{type:ControlName, listProperties} control.
    // @group i18nMessages
    // @visibility external
    //<
    listPropertiesPrompt: "Configure the list",
    listPropertiesDefaults: {
        showButtonTitle: false,
        showDownIcon: false,
        icon: "[SKIN]/RichTextEditor/text_list_edit.png",
        click : "this.creator.editListProperties()"
    },


    // For tabbing / focusing purposes, this editor should pass straight through to the
    // editArea
    canFocus: true,
    _useFocusProxy: false,
    _useNativeTabIndex: false,

    //> @attr RichTextEditor.moveFocusOnTab (boolean : true : IRW)
    // @include RichTextCanvas.moveFocusOnTab
    // @setter setMoveFocusOnTab()
    // @visibility external
    //<
    moveFocusOnTab: true

});


isc.RichTextEditor.addClassProperties({
    // Whenever the edit area changes we want to be notified too.
    // Avoid recreating the notification function (fired in the scope of the edit area)
    _canvasContentsChanged : function (oldValue, newValue) {
        this.creator._valueChanged(oldValue, newValue);
    }
});

//!>Deferred
isc.RichTextEditor.addProperties({

    
	dragStartDistance: 1,


    // On init, create our toolbar / RichTextCanvas contents area.
    initWidget : function () {
        this.Super("initWidget", arguments);
        this.createChildren();
    },
        
    //> @method richTextEditor.doWarn()
    // Display a warning if Rich Text Editing is not fully supported in this browser.
    // Default behavior logs a warning to the developer console - Override this if a user-visible
    // warning is required 
    // @visibility external
    //<
    doWarn : function () {
        isc.logWarn("Warning: Not all Rich Text Editing features are supported in this browser.");
    },

    createChildren : function () {
        // call on a delay to avoid this warning dialog being trapped by the FE as a managed
        // component that gets destroyed when the example is unloaded.  Leads to a crash as we
        // try to reuse the destroyed object.
        if (!this.richEditorSupported()) this.delayCall("doWarn");
    
        if (!this.autoChildDefaults) this.autoChildDefaults = {};
    
        // Set up the default width / click handler for control buttons
        
        this.autoChildDefaults.width = this.controlButtonWidth;
        this.autoChildDefaults.click = 
            function () {
                if (this.isControl && isc.isA.StatefulCanvas(this)) this.creator.fireAction(this.controlName)
            }
        if (this.toolbarHeight > 0) this._createToolArea();

        var props = isc.addProperties({ backgroundColor:this.editAreaBackgroundColor },
            // pass these two settings to the editArea
            { useDesignMode: this.useDesignMode, styleWithCSS: this.styleWithCSS },
            this.editAreaProperties, 
            {  
                top:this.toolbarHeight, className:this.editAreaClassName,
                left:0, width:"100%", height:"*",
                contents:this.value,
                moveFocusOnTab:this.moveFocusOnTab,

                changed : isc.RichTextEditor._canvasContentsChanged,

                getBrowserSpellCheck : function () {
                    return this.parentElement.getBrowserSpellCheck()
                },
                handleClick : function () {
                    // if the canvas doesn't cancel bubbling, fire on the editor
                    var result = this.Super("handleClick", arguments);
                    if (result != false) result = this.parentElement.handleClick(arguments);
                    return result;
                },
                handleDoubleClick : function () {
                    // if the canvas doesn't cancel bubbling, fire on the editor
                    var result = this.Super("handleDoubleClick", arguments);
                    if (result != false) result = this.creator.handleDoubleClick(arguments);
                    return result;
                }
            }
        );
        this.addAutoChild("editArea", props);
    },

    //> @method richTextEditor.editAreaFocusChanged()
    // Notification method fired when the edit area receives or loses keyboard focus
    //<
    // Used in richTextItem
    editAreaFocusChanged : function () {
    },

    
    ignoreKeys : ["Arrow_Up", "Arrow_Down", "Arrow_Left", "Arrow_Right", "Ctrl", "Alt", "Tab",
        "Space", "Home", "End", "Enter"
    ],

    handleKeyPress : function (event, eventInfo) {
        var key = isc.EH.getKey();
        
        if (this.ignoreKeys.contains(key)) {
            if (this.keyPress) this.keyPress(event, eventInfo);
            return isc.EH.STOP_BUBBLING;
        }

        var returnVal = this.Super("handleKeyPress", arguments);        
        return returnVal;
    },

    //> @method richTextEditor.richEditorSupported()
    // Does this browser support the full RichTextEditor feature set.
    // Returns false for browsers in which some features are not natively supported
    // (Safari before version 3.1 and Opera before version 9.50).
    // @return (Boolean) false if this browser doesn't fully support RichTextEditing
    // @visibility external 
    //<
    
    richEditorSupported : function () {
        return !((isc.Browser.isSafari && isc.Browser.minorVersion < 3.1) ||
                 (isc.Browser.isOpera && isc.Browser.minorVersion < 9.5));
    },

    // browserSpellCheck is a boolean property to enable / disable native browser checking of
    // spelling, where supported.
    // This currently only has an effect in Moz
    // By default return this.browserSpellCheck if specified. Overridden for RichTextItems.
    getBrowserSpellCheck : function () {
        return this.browserSpellCheck;
    },

    draw : function () {
        this.Super("draw", arguments);
        // if editArea is visible, resize it to fit the toolArea (which drives parent RTE width)
        
        if (this.editArea && this.toolArea) {
            this.editArea.setWidth(this.toolArea.getVisibleWidth());
        }
    },

    // Toolbar   
    
    _$break: "break",
    _createToolArea : function () {
        var toolArea = this.addAutoChild("toolArea", {
            backgroundColor: this.toolbarBackgroundColor
        });
        if (toolArea == null) return; // showToolArea == false

        // Picks up HLayout constructor from this.toolbarConstructor
        var currentToolbar = this._createToolbar();

        // this.controlGroups is an array of groups to show.
        // each group is an array of controls to create (within the group).
        var controlGroups = this.controlGroups;

        for (var i = 0, r = 1, c = 0; i < controlGroups.length; ++i) {
            var controlGroup = controlGroups[i];
            if (controlGroup == this._$break) {
                currentToolbar = this._createToolbar();
                ++r;
                c = 0;
                continue;
            }

            if (!isc.isA.Canvas(controlGroup)) {
                var controlGroupName = controlGroup,
                    controlNames = this[controlGroupName];
                if (!controlNames) {
                    this.logWarn("Unable to find controlGroup '" + controlGroupName + 
                                 "'. This group should be specified as an array of " +
                                 "control names, but is not present.");
                    continue;
                }

                // Add separators between the groups - only add if internal attribute 
                // showGroupSeparators isn't false (Tahoe sets it to false)
                if (c > 0 && this.showGroupSeparators != false) currentToolbar.addMember(this._createToolbarSeparator());

                for (var j = 0; j < controlNames.length; ++j) {
                    var control = controlNames[j];

                    if (!isc.isA.Canvas(control)) {
                        var controlName = control;
                        // use 'addAutoChild' to create the controls and add them to the toolbar as 
                        // children.
                        
                        this.addAutoChild(controlName,
                            // These properties used by the default click handler for controls
                            {
                                canFocus: true, isControl: true, controlName: controlName,
                                prompt: this[controlName + "Prompt"]
                            },
                            this.defaultControlConstructor,
                            currentToolbar
                        );
                    } else {
                        control.setCanFocus(true);
                        control.isControl = true;
                        currentToolbar.addMember(control);
                    }
                }
            } else {
                // Add separators between the groups.
                if (c > 0) currentToolbar.addMember(this._createToolbarSeparator());

                currentToolbar.addMember(controlGroup);
            }

            ++c;
        }

        // hide toolArea if there are no controls and showToolArea has not been set
        if (controlGroups.length == 0 && this.showToolArea != true) toolArea.hide();

        toolArea.setHeight(r * this.toolbarHeight);
        toolArea.setMembers(this.toolbars);
        return toolArea;
    },

    _createToolbar : function () {
        var toolbar = this.createAutoChild("toolbar", {
            height: this.toolbarHeight,
            backgroundColor: this.toolbarBackgroundColor
        });
        if (this.toolbars == null) {
            this.toolbars = [ toolbar ];
            // For backward compatibility, set `this.toolbar' to the first toolbar.
            this.toolbar = toolbar;
        } else this.toolbars.add(toolbar);
        return toolbar;
    },

    // Separator bar to write between control groups    
    _createToolbarSeparator : function () {
        if (!this._separatorProps) {
            this._separatorProps = {
                autoDraw: false,
                width: 12,
                height: "100%",
                src: this.toolbarSeparatorSrc
            };
        }
        return isc.Img.create(this._separatorProps);
    },

    // For tabbing / focussing purposes, this editor should pass straight through to the
    // editArea
    setFocus : function (newFocus) {
        var editArea = this.editArea;
        if (!editArea) return;
        return editArea.setFocus(newFocus);
    },

    //> @method richTextEditor.setMoveFocusOnTab()
    // Setter for +link{moveFocusOnTab}.
    // @param moveFocusOnTab (boolean) new value for moveFocusOnTab
    // @visibility external
    //<
    setMoveFocusOnTab : function (moveFocusOnTab) {
        this.moveFocusOnTab = moveFocusOnTab;
        if (this.editArea) this.editArea.moveFocusOnTab = moveFocusOnTab;
    },

    // For the font / font-size selector, we want to show a "choose font" type prompt rather 
    // than an empty selector.
     
    _makeFontMap : function(prompt, options) {
        // Add the empty 'select a font size' message and return
        var map = { _prompt: prompt };
        
        return isc.addProperties(map, options);
    },
    
    _makeFontNamesMap : function () {
        return this._makeFontMap(this.fontSelectorPrompt, this.fontNames);
    },
    _makeFontSizesMap : function () {
        return this._makeFontMap(this.fontSizeSelectorPrompt, this.fontSizes);    
    },

    // Special constructor functions for font / font-size selector controls
    
    fontSelector_autoMaker : function (properties) {
        
        isc.addProperties(properties, 
            {   
                numCols: 1, cellPadding: 1,
                items: [
                    isc.addProperties({
                        type: "select", name: "fontname", showTitle: false, 

                        pickListProperties: {
                            cellHeight: 16,
                            // Override 'getCellValue' to preview the font.
                            getCellValue : function (record, recordNum, fieldNum) {
                                var val = this.Super("getCellValue", arguments),
                                    fontName = record ? record.fontname : null;
                                if (fontName && fontName != "_prompt") {
                                    val = "<SPAN style='font-family:" + fontName + ";'>" + val + "</SPAN>";
                                }
                                return val;
                            }
                        },
                     
                        defaultValue: "_prompt",
                        valueMap: this._makeFontNamesMap(),
                        
                        pickValue : function(value) {
                            this.Super("pickValue", arguments);                     
                            if (value != "_prompt") {
                                this.form.creator.fireAction('setSelectionFont', value);
                            }
                        }
                    }, this.fontSelectorItemProperties)
                ]
            }
        );
        
        return this.createAutoChild("fontSelector", properties);
    },    
    
    
    fontSizeSelector_autoMaker : function (properties) {
        isc.addProperties(properties, 
            {
                numCols: 1, cellPadding: 1,
                items:[
                    isc.addProperties({
                        type: "select", name: "fontsize", showTitle: false, 
                        defaultValue: "_prompt",                     
                        valueMap: this._makeFontSizesMap(),
                        // See comments in fontSizeSelector_autoMaker for why we override
                        // pickValue rather than implementing a change handler.
                        pickValue : function(value) {
                            this.Super("pickValue", arguments);
                            if (value != "_prompt") {
                                this.form.creator.fireAction('setSelectionFontSize', value);
                            }
                        }                        
                    }, this.fontSizeSelectorItemProperties)
                ]
            }
        );
        
        return this.createAutoChild("fontSizeSelector", properties);
    },    
    

    // convenience method to call a method on the richTextCanvas used as the editArea.  Does
    // nothing if there is no method named "action"
    fireAction : function (action, param) {
        var editArea = this.editArea;
        if (!editArea || !action || !editArea[action] || !isc.isA.Function(editArea[action])) 
            return;
            
        this.editArea[action](param);
    },
    
    // Special handlers for picking colors:
    // Use a colorChooser widget (for both setting text and background colors)
    // ColorChooser has been superseded by ColorPicker
    chooseColor : function (selectingTextColor) {
        this.colorChooser = isc.ColorPicker.getSharedColorPicker({
            creator: this,
            showHeaderIcon: true,
            headerIconProperties: { src: selectingTextColor ? this.color.icon : this.backgroundColor.icon, iconSize: 20 },
            ID: this.getID() + "_colorChooser",
            // Avoid showing the auto / transparent button for picking a null color
            
            showNullValue: false,
            colorSelected : function (color) {
                this.creator.uncheckColorButton();
                this.creator._colorSelected(color);
            },
            
            
            closeClick : function () {
                this.Super("closeClick", arguments);
                this.pickerCancelled();
            },
            
            pickerCancelled : function () {
                this.creator.uncheckColorButton();
                this.creator.editArea.focus();
            }
        })    
        
        this._selectingTextColor = selectingTextColor;
        this.colorChooser.show();
    },
    
    uncheckColorButton : function () {
        if (this._selectingTextColor) this.color.setSelected(false);
        else this.backgroundColor.setSelected(false);
    },
    
    _colorSelected : function (color) {
        var action = this._selectingTextColor ? "setSelectionColor" 
                                              : "setSelectionBackgroundColor";
        delete this._selectingTextColor;
        this.fireAction(action, color);
    },
    
    chooseTextColor : function () {
        this.chooseColor(true);
    },

    chooseBackgroundColor : function () {
        this.chooseColor(false);
    },
    
    // Creating links
    createLink : function () {
        var editor = this;
        isc.askForValue(this.linkUrlTitle, function (value) {
            if (value == null) return;
            editor.fireAction("createLink", value);
        }, { defaultValue: "http://", width: 320 });
    },

    // Lists

    indentSelection : function () {
        this.fireAction("indentSelection");
    },

    outdentSelection : function () {
        this.fireAction("outdentSelection");
    },

    convertToOrderedList : function () {
        this.fireAction("convertSelectionToOrderedList");
    },

    convertToUnorderedList : function () {
        this.fireAction("convertSelectionToUnorderedList");
    },

    //> @attr richTextEditor.listPropertiesDialog (AutoChild ListPropertiesDialog : null : R)
    // Dialog shown when the +link{type:ControlName,"listProperties" control} is pressed.
    // Provides options for the user to control formatting of lists.
    // @visibility external
    //<
    listPropertiesDialogDefaults: {
        _constructor: "ListPropertiesDialog",
        autoParent: "none",
        autoCenter: true,
        isModal: true,
        showModalMask: true,

        applyClick : function (listProperties) {
            this.creator.applyListProperties(listProperties);
            this.hide();
        },

        cancelClick : function () {
            this.hide();
        }
    },

    applyListProperties : function (listProperties) {
        this.fireAction("applyListProperties", listProperties);
    },

    //> @attr richTextEditor.listPropertiesWarningText (String : "Place the cursor within a list to configure it" : IRW)
    // The warning message displayed in a dialog when a user tries to configure a list without
    // first putting the cursor in an appropriate place.
    // @group i18nMessages
    // @visibility external
    //<
    listPropertiesWarningText: "Place the cursor within a list to configure it",
    editListProperties : function () {
        if (!this.editArea) return;

        var listProperties = this.editArea.getListProperties();
        if (listProperties == null) {
            isc.warn(this.listPropertiesWarningText);
            return;
        }

        var listPropertiesDialog = this.addAutoChild("listPropertiesDialog");
        // Update the dialog's listPropertiesPane with the currently selected list's configuration.
        listPropertiesDialog.listPropertiesPane.setListProperties(listProperties);
        listPropertiesDialog.show();
    },

    // Retrieving / updating content:
    
    _valueChanged : function (oldValue, newValue) {
        if (this.valueChanged) this.valueChanged(oldValue, newValue);
    },

    //> @method richTextEditor.valueChanged()
    // StringMethod fired when the user edits the editor's value. Will not be fired in 
    // response to an explicit <code>setValue</code> call.
    // @param oldValue Value before the edit
    // @param newValue Value now
    //<
    
    //> @method richTextEditor.getValue()
    // Retrieves the current value of the edit area.
    // @visibility external
    //<
    getValue : function () {
        if (this.editArea) this.value = this.editArea.getContents();
        return this.value;
    },
    
    //> @method richTextEditor.setValue()
    // Updates the current value of the edit area.
    // @visibility external
    //<
    setValue : function (newValue) {
        this.value = newValue;
        if (this.editArea) this.editArea.setContents(this.value);
    }
    
});
//!<Deferred


isc.RichTextEditor.registerStringMethods({
    valueChanged : "oldValue,newValue"
});

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
// Class will not work without DynamicForm
if (isc.DynamicForm) {

//> @class PropertySheet
//
// Editor with a minimalist appearance, tuned for editing large numbers of properties in a
// constrained space.
//
// @inheritsFrom DynamicForm
// @treeLocation Client Reference/Forms
//
// @visibility external
//<
isc.defineClass("PropertySheet", "DynamicForm").addProperties({

    autoChildItems:true,
    
    // Don't show 'spelling errors' - this is used to edit the properties of form items, etc
    browserSpellCheck:false,

    // for all FormItems
    autoChildDefaults : {
	    cellStyle:"propSheetValue",
    	titleStyle:"propSheetTitle",
        showHint:false,
        keyPress : function (item, form, keyName, characterValue) {
            if (!item.getHasInternalNavigation()) {
                // if the item doesn't have builtin arrow-key behavior, navigate to another
                // item when up/down are pressed
                if (keyName == "Arrow_Up") {
                    item.focusAfterItem(false);
                } else if (keyName == "Arrow_Down") {
                    item.focusAfterItem(true);
                }
            }
        }
    },

    // borders don't look particular good around GroupItems
    GroupItemDefaults : {
	    cellStyle:null
    },

    ExpressionItemDefaults : {
        width:"*",
    	height:20,
        showActionIcon:true
    },
    ActionMenuItemDefaults : {
        width:"*",
        height:20
    },

    SelectItemDefaults : {
    	height:20,
        border: "none",
        shadow: "none",
        width:"*"
    },

    OverflowItemDefaults : {
    	height:20,
        border: "none",
        shadow: "none",
        width:"*"
    },

    CriteriaItemDefaults : {
    	height:20,
        border: "none",
        shadow: "none",
        width:"*"
    },

    ValueMapItemDefaults : {
    	height:20,
        width:"*"
    },

    ExpressionEditorItemDefaults : {
    	height:20,
        width:"*"
    },

    FormulaEditorItemDefaults : {
    	height:20,
        width:"*"
    },

    SummaryEditorItemDefaults : {
    	height:20,
        width:"*"
    },

    MenuChooserItemDefaults : {
    	height:20,
        width:"*"
    },

    MeasureItemDefaults : {
    	height:20,
        width:"*"
    },

    ImageChooserItemDefaults : {
    	height:20,
        width:"*"
    },

    LayoutAlignItemDefaults : {
    	height:20,
        width:"*"
    },

    DateItemDefaults : {
        width:"*"
    },

    TextItemDefaults : {
    	width:"*",
        height:20
    },

    DynamicPropertyEditorItemDefaults : {
    	width:"*",
        height:20
    },

    CheckboxDynamicPropertyItemDefaults : {
    	width:"*",
        height:20
    },

    StaticTextItemDefaults : {
    	width:"*",
        height:20,
    	textBoxStyle:"propSheetField"
    },

    MeasureItemDefaults : {
    	width:"*",
        height:20
    },

    
    ColorItemDefaults : {
    	width:"*",
	    height:20,
        pickerIconHeight:16, pickerIconWidth:16,
        pickerIconSrc:"[SKIN]/DynamicForm/PropSheet_ColorPicker_icon.png"
    },

    HeaderItemDefaults : {
	    cellStyle:"propSheetHeading"
    },

    TextAreaItemProperties : {width:"*"},

    // place labels on left
    CheckboxItemDefaults : {
        showTitle:true, 
        showLabel:false,
        getTitleHTML : function () { // NOTE: copy of FormItem.getTitle()
            if (this[this.form.titleField] != null) return this[this.form.titleField];
            return this[this.form.fieldIdProperty];
        }
    },
    
    // Apply a different cellStyle to sectionItems - we don't want the 1px border around them
    SectionItemDefaults : {
        cellStyle:"propSheetSectionHeaderCell"
    },

    titleAlign:"left",
	titleWidth:120,
    colWidths: [120, "*"],
	//cellSpacing:0,
    cellPadding:0,
    
	// backgroundColor:"white",
	// requiredTitlePrefix:"<span style='color:green'>",
	// requiredTitleSuffix:"</span>",
	requiredTitleSuffix:"</b>",
	titleSuffix:"",
    clipItemTitles:true

});

}

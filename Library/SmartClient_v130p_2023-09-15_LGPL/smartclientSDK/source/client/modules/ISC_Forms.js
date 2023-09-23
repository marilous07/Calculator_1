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
//
// This script will load all of the Isomorhic SmartClient Application Framework libraries for you
//
// The idea is that in your app file you can just load the script "Isomorphic_SmartClient.js" which
// in a production situation would be all of the scripts jammed together into a single file.
//
// However, it's easier to work on the scripts as individual files, this file will load all of the
// scripts individually for you (with a speed penalty).
//		
var libs = 
	[
        "debug/version",  // check for module version mismatches

		"widgets/TableResizePolicy",	// code to resize a set of elements in two dimensions
		"widgets/ButtonTable",			// table of cheapie buttons (very low resource use) -- in Nav, they look like links
		"widgets/DateGrid",			    // grid-based calendar-portion for DateChooser
		"widgets/DateChooser",			// a date picker

        "widgets/Slider",             	// graphical slider widget (uses isc.Img and isc.StretchImg)
        "widgets/RangeSlider",		    // range slider

        "tools/skinning/AdvancedColors",// include isc.tinycolor, so ColorItem can use it

        "widgets/ScrollingMenu",        // specialized listViewer with menu type event-handling 
                                        // behaviour, but scrollable and ready for data-binding
        		
		"widgets/form/DynamicForm",		// dynamically redrawable form
		"widgets/form/FormItem",		// abstract sub-item of a form
		"widgets/form/FormItemFactory",	// singleton object that creates FormItems from object literals
		"widgets/form/Validators",		// validators for form fields
		"widgets/form/ContainerItem",	// abstract form item that can contain other formItems
		
		"widgets/form/CanvasItem",		// FormItem that contains a Canvas

		"widgets/form/TextItem",		// single-line text field
        "widgets/form/IntegerItem",     // single-line text field to display an integer value
        "widgets/form/FloatItem",       // single-line text field to display a floating point value
        "widgets/form/DoubleItem",      // single-line text field to display a double value
		"widgets/form/BlurbItem",		// static text display
		"widgets/form/ButtonItem",		// button form item

        "widgets/form/PickListMenu",    // PickListMenu and PickTreeMenu classes
        "widgets/form/PickList",        // Pick-List for use in select
		"widgets/form/NativeSelectItem",// select item rendered using native select element
		"widgets/form/SelectItem",		// select item -- drop-down list
        
		"widgets/form/CycleItem",	// item for moving through a valueMap via single clicks
		"widgets/form/CheckboxItem",	// checkbox item
        "widgets/form/NativeCheckboxItem", // checkbox item rendered using native checkbox element

		"widgets/form/HeaderItem",		// section header
		"widgets/form/SectionItem",		// section header for group that shows/hides group
		"widgets/form/HiddenItem",		// hidden field
		"widgets/form/StaticTextItem",	// static text (label)
		"widgets/form/LinkItem",	    // HTML link
		"widgets/form/PasswordItem",	// password-entry field (masked characters)        
		"widgets/form/RadioGroupItem",	// set of radio buttons acting as a group
		"widgets/form/RadioItem",		// single radio button
		"widgets/form/ResetItem",		// reset button

		"widgets/form/DateItem",		// multi-part Date editor
        "widgets/form/DateTimeItem",    // modified subclass of DateItem for editing datetimes
		"widgets/form/SpacerItem",		// spacer
		"widgets/form/RowSpacerItem",	// separator
		"widgets/form/SubmitItem",		// submit button
		"widgets/form/CancelItem",      // cancel button
		"widgets/form/TextAreaItem",	// multi-line text field
        
        "widgets/form/AutoFitTextAreaItem",    // Text area item which expands to fit its content
        
		"widgets/form/TimeItem",		// edit a isc.Time value
		"widgets/form/ToolbarItem",		// collection of form buttons
		"widgets/form/UploadItem",		// file-upload widget

		"widgets/form/ComboBoxItem",	// combobox (text field + button + filtered listViewer)
		"widgets/form/MultiComboBoxItem",  // multiple selection combobox (combobox + buttons)

        "widgets/form/MultiPickerItem", // Multiple selection filterable pickList
        "widgets/form/SetFilterItem",   // "InSet" / "NotInSet" filter item based on MultiPickerItem

        "widgets/form/FileItem",        // fileitem based on canvasItem that creates a new form with
                                        // uploadItem                                        
        // INFA		
		"widgets/form/RelationItem",	// canvasItem-based relation item
        
        "widgets/form/MultiFileItem",	// relationItem-based multi-upload widget

        "widgets/form/DialogUploadItem",
        "widgets/form/SOAPUploadItem",
        // INFA

        "widgets/form/SpinnerItem",      // Form item for Number type data - includes icons to
                                         // increase / decrease the values.
        "widgets/form/SliderItem",      // Form item that containing a slider to manage values

        "widgets/form/ColorItem",      // Form item used to modify colors

		"widgets/form/ValueMapItem",    // Form item used to modify valueMaps, tools only

        "widgets/form/PickTreeItem",    // This form item shows a tree-menu so you can pick from a hierachy of choices

		"widgets/form/PopUpTextAreaItem",	// Shows a floating textArea.  Can be used in ListGrid editing.

        //"widgets/Editor",				// deprecated old-style inline editing: Editor
                                        // Interface and a couple of implementations

		"widgets/form/SearchForm",       // simple subclass of dynamicForm to be used in filters and 
                                        // search forms in applications

        //>ValuesManager
        "widgets/form/ValuesManager",   // values manager for values from multiple member forms
        //<ValuesManager

    	
        "widgets/ColorPicker",          // Helper for picking colors - supersedes the old ColorChooser

        "widgets/form/NestedEditorItem",     // Item for auto-editing a single complex sub-object
        "widgets/form/NestedListEditorItem", // Item for auto-editing a list of complex sub-objects

        "widgets/form/ViewFileItem", // Item for showing the download/view UI for binary/imageFile fields

                
		
		"widgets/Panel",

		"application/SavedSearches",
		"widgets/form/SavedSearchItem",
		"widgets/form/SavedSearchForm",
		"widgets/SavedSearchEditor",
        
        "widgets/form/DataPathItem",     // Item for managing a dataPath
        "widgets/form/MeasureItem",      // single-line text field to display/edit measure value
                                         // like width/height. For use only by VB
        "widgets/form/LayoutAlignItem",  // context-aware layoutAlign selection. For use only by VB.
        "widgets/form/EditorTypeItem",   // context-aware editorType selection. For use only by VB.

        "widgets/form/RelativeDateItem",    // Item for managing relative dates
        "widgets/form/DateRangeItem",       // Item for managing a pair of Date or RelativeDateItems
                                            //  also includes isc.DateRangeDialog
		"widgets/EntityEditor",             // widget for auto-editing an entire Entity structure from the DB 
		//"widgets/form/ReportChooserItem", // Item that allows stored formatting to be applied 
                                            // to LGs - also shells a widget for creating/editing
                                            // the format information
        "widgets/form/PresetCriteriaItem",  // Item for managing a preset-criteria with
                                            //  readable titles

        // Image selection
        "widgets/ImagePicker",              // Helper for picking images
        "widgets/form/ImageChooserItem",    // Form item used to select images
        "widgets/form/StatefulImageChooserItem", // Form item used to select stateful images
        
        "widgets/form/OverflowItem",     //Simple FormItem used to select widget overflow
        "widgets/form/MenuChooserItem"   // Simple picker for project Menu instances
	];

//<STOP PARSING 

// The following code only executes if the script is being dynamically loaded.

// the following statement allows a page that is not in the standard location to take advantage of
// dynamically loaded scripts by explicitly setting the window.isomorphiDir variable itself.
if (! window.isomorphicDir) window.isomorphicDir = "../isomorphic/";

// dynamic loading
(function () {
    function loadLib(lib, hash) {
        if (hash == null) hash = "";
        document.write("<"+"script src='" + window.isomorphicDir + "client/" + lib + ".js" + hash + "' type='text/javascript' charset='UTF-8'><"+"/script>");
    }

    loadLib("language/startDefiningFramework", "#module=Forms");
    for (var i = 0, l = libs.length; i < l; ++i) {
        if (!libs[i]) continue;
        if (window.UNSUPPORTED_BROWSER_DETECTED == true) break;
        loadLib(libs[i]);
    }
    loadLib("language/stopDefiningFramework", "#module=Forms");
})();
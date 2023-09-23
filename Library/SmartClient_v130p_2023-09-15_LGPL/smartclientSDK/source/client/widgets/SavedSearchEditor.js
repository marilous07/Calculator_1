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


//> @class SavedSearchEditor
// User Interface component allowing a user to add a new saved search or edit an existing search.  Automatically used by
// +link{SavedSearchItem} and +link{listGrid.canSaveSearches}; cannot be used directly and is documented only
// for skinning and internationalization purposes.
// @inheritsFrom VLayout
// @treeLocation Client Reference/Data Binding/SavedSearches
// @visibility external
//<

isc.defineClass("SavedSearchEditor", "VLayout").addProperties({

width: "100%", height: "100%",
layoutMargin: 10,
membersMargin: 10,

    //> @type SearchEditorMode
    // Affects the appearance and behavior of the builtin +link{class:SavedSearchEditor}.
    //
    // @value "normal" the editor shows a +link{filterBuilder} for editing criteria
    // @value "grid" the editor shows only a field for naming (or renaming) a search, since the 
    //               grid has built-in interfaces for editing criteria
    //
    // @group editing
    // @visibility external
    //<

//> @attr savedSearchEditor.mode (SearchEditorMode : "normal" : IR)
// In "normal" the search editor shows a +link{filterBuilder} for editing criteria.  In "grid" mode there is
// only a field for naming (or renaming) a search, since the grid has built-in interfaces for editing
// criteria.
// @visibility external
//<
// - note: this may seem overkill but other modes are planned in the future
mode: "normal",

//> @attr savedSearchEditor.isAdmin (boolean : null : IR)
// Whether the editor is in admin mode, in which case the +link{sharedSearchCheckbox} appears to allow
// admins to define shared searches, and the +link{defaultSearchCheckbox} appears to enable an admin to
// designate a search as the (shared) default.
// <p>
// If +link{SavedSearches.adminRole} is defined and +link{Authentication.hasRole()} indicates the current
// user has the <code>adminRole</code>, <code>isAdmin</code> is true by default, otherwise false.
// @visibility external
//<

//> @attr savedSearchEditor.sharedSearchCheckbox (AutoChild CheckboxItem : null : IR)
// Checkbox shown when +link{isAdmin} is true, allowing an admin to designate a search as an admin search
// that all users will see.  Titled with +link{sharedSearchTitle}.
// @visibility external
//<
sharedSearchCheckboxDefaults : {
    editorType: "CheckboxItem",
    shouldSaveValue: false,
    name:"_sharedSearch",
    // Only show the 'shared default' checkbox for searches marked as default
    changed : function (form, item, value) {
        var defaultCB = form.getItem("_defaultSharedSearch");
        if (!defaultCB) return;

        if (value) defaultCB.show();
        else {
            defaultCB.clearValue();
            defaultCB.hide();
        }
    }
},

//> @attr savedSearchEditor.sharedSearchTitle (String : "Shared search (all users will see it)" : IR)
// Title for the +link{sharedSearchCheckbox}.
// @group i18nMessages
// @visibility external
//<
sharedSearchTitle: "Shared search (all users will see it)",

//> @attr savedSearchEditor.defaultSearchCheckbox (AutoChild CheckboxItem : null : IR)
// Checkbox shown when +link{isAdmin} is true and the current search is marked as a shared
// search (via the +link{sharedSearchCheckbox}), allowing an admin to designate a search 
// as the default search for users that have not chosen some other search as their default.
// <P>
// If checked, the +link{SavedSearches.setDefaultAdminSearchOperation} will be invoked 
// after the search being edited has been saved. This will typically be invoked as a
// +link{RPCManager.startQueue(),queued request} in the same transaction that adds or
// updates the search being edited.
// <P>
// See the <b>Saving default searches</b> section of the +link{class:savedSearches,SavedSearches overview}
// for more information on marking searches as a default.
// <P>
// Only ever appears if there is a +link{SavedSearches.adminDefaultField} in the +link{SavedSearches.defaultDataSource}.
// <p>
// Titled with +link{defaultSearchTitle}.
// @visibility external
//<
defaultSearchCheckboxDefaults : {
    editorType: "CheckboxItem",
    shouldSaveValue: false,
    name:"_defaultSharedSearch"
},

//> @attr savedSearchEditor.defaultSearchTitle (String : "Mark as default" : IR)
// Title for the +link{sharedSearchCheckbox}.
// @group i18nMessages
// @visibility external
//<
// - implementation note: make the two checkboxes and search name field all a one-line form, but use
//   "linearOnMobile" to spread out for mobile
defaultSearchTitle: "Mark as default",

//> @attr savedSearchEditor.promptLabel (AutoChild Label : null : IR)
// Label at the top of the interface, used to show instruction text, which is either +link{addSearchText} or
// +link{editSearchText} depending on whether the user is editing a pre-existing search.
// <p>
// For +link{mode,grid mode}, when adding a new search, the instructions text is +link{gridAddSearchText} instead.
// @visibility external
//<
promptLabelDefaults: {
    _constructor: "Label",
    height: 1,
    autoDraw: false
},

showReifyUI : function () {
    //>EditMode
    var targetComponent = this.targetComponent;
    if (this.mode == "grid" && targetComponent && targetComponent.editingOn && targetComponent.editContext.isReify) {
        return true
    }
    //<EditMode
    return false;
},

isAdminSearch : function (record) {
    var component = this,
        ds = isc.ss.getSavedSearchDataSource(component);

    // there's no such thing as an admin search if we're saving to a LocalDataSource
    if (!ds || ds._generated) return false;

    var adminRecordCriteria = isc.ss._getAdminRecordCriteria(component);
    return ds.recordMatchesFilter(record, adminRecordCriteria);
},

getPromptLabelContents : function (label) {
    //>EditMode
    if (this.showReifyUI()) {
        var grid = this.targetComponent;
        var screenId = grid && grid.getScreenId();
        if (screenId != null) {
            return this.reifyGridAddSearchText;               
        }
    }
    //<EditMode
    return (this.mode == "grid" ? this.gridAddSearchText : 
                this.operation == "add" ? this.addSearchText : this.editSearchText);
},

//> @attr savedSearchEditor.addSearchText (String : "Enter a name for your search, then enter criteria below." : IR)
// @group i18nMessages
// @visibility external
//<
addSearchText: "Enter a name for your search, then enter criteria below.",


//> @attr savedSearchEditor.gridAddSearchText (String : "Enter a name for your search.  The current configuration of the grid will be saved." : IR)
// @group i18nMessages
// @visibility external
//<
gridAddSearchText: "Enter a name for your search.  The current configuration of the grid will be saved.",

// Search text visible in Reify - this differs from the normal interface in that every search to be saved will
// be an admin search
reifyGridAddSearchText: "Save the current grid view as a default search, visible to all users.<P>Enter a name for the search.",

//> @attr savedSearchEditor.editSearchText (String : "Enter a new name for your search, and edit criteria below." : IR)
// @group i18nMessages
// @visibility external
//<
editSearchText: "Enter a new name for your search, and edit criteria below.",

//> @attr savedSearchEditor.searchNameItem (AutoChild TextItem : null : IR)
// TextItem where the user enters the name for the saved search.
// @visibility external
//<
// - implementation: should have a required validator so it can't be set to null
searchNameItemDefaults : {
    editorType: "TextItem",
    showTitle: false,
    validators: [
        {type: "required"}
    ]
},

//> @attr savedSearchEditor.filterBuilder (AutoChild FilterBuilder : null : IR)
// FilterBuilder used to enter criteria.
// <p>
// By default, +link{filterBuilder.topOperatorAppearance} is set to "radio" (considered the simpler mode)
// and +link{filterBuilder.showModeSwitcher} is set true.
// <p>
// If existing criteria cannot be displayed in simple ("radio") mode, advanced mode is automatically chosen.
// @visibility external
//<
filterBuilderDefaults : {
    autoParent: "none",
    _constructor: "FilterBuilder",
    overflow: "visible",
    height: "*",
    topOperatorAppearance: "radio",
    showModeSwitcher: true
},

//> @attr savedSearchEditor.saveButton (AutoChild IButton : null : IR)
// Button used to save changes.
// @visibility external
//<


//> @attr savedSearchEditor.cancelButton (AutoChild IButton : null : IR)
// Button used to cancel changes.
// @visibility external
//<
cancelButtonDefaults: {
    _constructor: "IButton",
    title: "Cancel",
    //autoFit: true,
    layoutAlign: "center",
    click: function () {
        this.creator.cancelButtonClicked();
    }
},
cancelButtonClicked : function () {

},
formDefaults: {
    _constructor: "DynamicForm",
    height: 1,
    width: "*",
    // for some reason checkboxes won't properly vAlign without titleOrientation: "top"
    titleOrientation: "top",
    autoDraw: false,
    autoFocus: true,
    linearOnMobile: true
}   




});



// --- trivial Window wrapper

//> @class EditSearchWindow
// Window that simply contains a +link{SavedSearchEditor} as the +link{AutoChild} <code>savedSearchEditor</code>.
// <p>
// Automatically used by +link{SavedSearchItem} and +link{listGrid.canSaveSearches}; cannot be used directly
// and is documented only for skinning and internationalization purposes.
//
// @inheritsFrom Window
// @treeLocation Client Reference/Data Binding/SavedSearches
// @visibility external
//<
isc.defineClass("EditSearchWindow", "Window").addProperties({

isModal: true,
width: "65%",
minWidth: 800,
maxWidth: 1150,
canDragResize: true,
canDragReposition: true,
vertical: true,
autoCenter: true,
autoSize: true,
showMinimizeButton: false,

//> @attr editSearchWindow.title (String : "Edit Search" : IR)
// @group i18nMessages
// @visibility external
//<
title: "Edit Search",

//> @attr editSearchWindow.savedSearchEditor (AutoChild SavedSearchEditor : null : IR)
// Has no effect unless +link{listGrid.showBackgroundComponents} is <code>true</code>.
// <P>
// +link{SavedSearchEditor} embedded in the EditSearchWindow.
// @visibility external
//<
savedSearchEditorDefaults: {
    _constructor: "SavedSearchEditor",
    autoDraw: false
},



editComplete : function (record) {

},

close : function () {
    this.destroy();
}

});
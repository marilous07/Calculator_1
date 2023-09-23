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


//> @class SavedSearchForm 
// Simple +link{DynamicForm} wrapper for a +link{SavedSearchItem}.
// <P>
// This provides a standalone UI for creating, editing and applying saved searches for
// a +link{SavedSearchItem.targetComponent,target} using the +link{SavedSearches} system.
// <P>
// Note that a +link{SavedSearchItem} may also be used directly by embedding it into any DynamicForm.
//
// @inheritsFrom DynamicForm
// @treeLocation Client Reference/Data Binding/SavedSearches
// @visibility external
//<
isc.defineClass("SavedSearchForm", "DynamicForm").addProperties({

    //> @attr savedSearchForm.numCols (number : 1 : IRW)
    // SavedSearchForms show a single column by default
    // @visibility external
    //<
    numCols:1,

    //> @attr savedSearchForm.height (number : 1 : IRW)
    // SavedSearchForms are sized to fit their single item by default
    // @visibility external
    //<
    height:1,

    //> @attr savedSearchForm.overflow (Overflow : Canvas.VISIBLE : IRW)
    // SavedSearchForms are sized to fit their single item by default
    // @visibility external
    //<
    overflow:"visible",

    //> @attr savedSearchForm.savedSearchItem (SavedSearchItem AutoChild : null : IR)
    // Automatically generated +link{SavedSearchItem} for this form.
    // <P>
    // This may be customized using the +link{group:autoChildUsage,autoChild subsystem}.
    // @visibility external
    //<

    savedSearchItemConstructor:"SavedSearchItem",
    savedSearchItemDefaults:{
        width:"*",
        searchChanged : function (data, searchData) {
            // have item.searchChanged fall through to the form-level notification
            if (this.form.searchChanged != null) return this.form.searchChanged(data, searchData);
            return true;
        }
    },

    initWidget : function () {

        var itemConfig = {editorType:this.savedSearchItemConstructor};
        var undef;
        for (var i = 0; i < this.ssiPassThroughs.length; i++) {
            var prop = this.ssiPassThroughs[i];
            if (this[prop] !== undef) itemConfig[prop] = this[prop];
        }
        isc.addProperties(
            itemConfig,
            this.savedSearchItemDefaults, this.savedSearchItemProperties,
            {name:"savedSearchItem"}
        );
        this.setItems([itemConfig]);

        return this.Super("initWidget", arguments);

    },

    getSavedSearchItem : function () {
        return this.getItem("savedSearchItem");
    },
    
    //> @method savedSearchForm.setTargetComponent
    // Changes the +link{targetComponent} to the passed in newTargetComponent.
    // @param newTargetComponent (DataBoundComponent) the newTargetComponent
    // @visibility external
    //<
    setTargetComponent : function (newTargetComponent) {
        this.getSavedSearchItem().setTargetComponent(newTargetComponent);
    },
    
    // Array of properties which if set on the form at init time will be passed through to the SSI

    ssiPassThroughs:[

//> @attr savedSearchForm.canAddSearch (Boolean : null : IR)
// If set this property will override +link{SavedSearchItem.canAddSearch} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"canAddSearch",

//> @attr savedSearchForm.addSearchValue (String : null : IR)
// If set this property will override +link{SavedSearchItem.addSearchValue} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"addSearchValue",

//> @attr savedSearchForm.addSearchIcon (SCImgURL : null : IR)
// If set this property will override +link{SavedSearchItem.addSearchIcon} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"addSearchIcon",

//> @attr savedSearchForm.targetEditsCriteria (Boolean : null : IR)
// If set this property will override +link{SavedSearchItem.targetEditsCriteria} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"targetEditsCriteria",
    
//> @attr savedSearchForm.canModifyProperty (Boolean : null : IR)
// If set this property will override +link{SavedSearchItem.canModifyProperty} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"canModifyProperty",


//> @attr savedSearchForm.editSearchHoverText (String : null : IR)
// If set this property will override +link{SavedSearchItem.editSearchHoverText} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"editSearchHoverText",

//> @attr savedSearchForm.removeSearchHoverText (String : null : IR)
// If set this property will override +link{SavedSearchItem.removeSearchHoverText} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"removeSearchHoverText",

//> @attr savedSearchForm.copySearchHoverText (String : null : IR)
// If set this property will override +link{SavedSearchItem.copySearchHoverText} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"copySearchHoverText",

//> @attr savedSearchForm.markAsDefaultHoverText (String : null : IR)
// If set this property will override +link{SavedSearchItem.markAsDefaultHoverText} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"markAsDefaultHoverText",

//> @attr savedSearchForm.canEditSearch (Boolean : null : IR)
// If set this property will override +link{SavedSearchItem.canEditSearch} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"canEditSearch",

//> @attr savedSearchForm.canRemoveSearch (Boolean : null : IR)
// If set this property will override +link{SavedSearchItem.canRemoveSearch} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"canRemoveSearch",

//> @attr savedSearchForm.canCopySearch (String : null : IR)
// If set this property will override +link{SavedSearchItem.canCopySearch} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"canCopySearch",


//> @attr savedSearchForm.targetComponent (Canvas : null : IR)
// If set this property will override +link{SavedSearchItem.targetComponent} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"targetComponent",

//> @attr savedSearchForm.targetDataSource (DataSource : null : IR)
// If set this property will override +link{SavedSearchItem.targetDataSource} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"targetDataSource",

//> @attr savedSearchForm.confirmRemoval (boolean : null : IR)
// If set this property will override +link{SavedSearchItem.confirmRemoval} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"confirmRemoval",

//> @attr savedSearchForm.confirmRemovalMessage (HTMLString : null : IR)
// If set this property will override +link{SavedSearchItem.confirmRemovalMessage} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"confirmRemovalMessage",

//> @attr savedSearchForm.adminRole (String : null : IR)
// If set this property will override +link{SavedSearchItem.adminRole} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"adminRole",

//> @attr savedSearchForm.newRecordValues (Record : null : IR)
// If set this property will override +link{SavedSearchItem.adminRole} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"newRecordValues",


//> @attr savedSearchForm.saveLastSearch (boolean : null : IR)
// If set this property will override +link{SavedSearchItem.saveLastSearch} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"saveLastSearch",

//> @attr savedSearchForm.saveDefaultSearch (boolean : null : IR)
// If set this property will override +link{SavedSearchItem.saveDefaultSearch} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"saveDefaultSearch",

//> @attr savedSearchForm.storedState (SavedSearchStoredState : null : IR)
// If set this property will override +link{SavedSearchItem.storedState} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"storedState",

//> @attr savedSearchForm.offlineStorageKey (String : null : IR)
// If set this property will override +link{SavedSearchItem.offlineStorageKey} on the 
// automatically generated +link{savedSearchItem}.
// @visibility external
//<
"offlineStorageKey",

//> @attr savedSearchForm.title (String : null : IR)
// If set this property will override +link{SavedSearchItem.title} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"title",


//> @attr savedSearchForm.hint (String : null : IR)
// If set this property will override +link{SavedSearchItem.hint} on the 
// automatically generated +link{savedSearchItem}.
// @group i18nMessages
// @visibility external
//<
"hint"
    ] // end of ssiPassthroughs
});

//> @method savedSearchForm.searchChanged()
// Event fired whenever a user changes the currently selected saved search, modifies a saved
// search or adds a new saved search.
// <p>
// If a +link{targetComponent} has been specified, <code>searchChanged</code> automatically
// applies the new search to the <code>targetComponent</code> unless the event is cancelled
// <smartclient>by returning false</smartclient>.
//
// @param newCriteria (Criteria) new criteria
// @param searchData (String) search data
// @return (boolean) whether to automatically apply the search to the +link{targetComponent}
// @visibility external
//<
isc.SavedSearchForm.registerStringMethods({
    searchChanged : "newCriteria,searchData"
});
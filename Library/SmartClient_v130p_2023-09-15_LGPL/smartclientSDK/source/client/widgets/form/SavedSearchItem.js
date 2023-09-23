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
//> @class SavedSearchItem (SSI for short)
// Provides a UI for creating, editing and applying saved searches for a +link{SavedSearchItem.targetComponent,target}
// using the +link{SavedSearches} system.
// <p>
// Normally, a <code>SavedSearchItem</code> is just provided a +link{SavedSearchItem.targetComponent,targetComponent}, and all other
// configuration comes from the central +link{SavedSearches} class by default.  The
// <code>targetComponent</code> must be a +link{DataBoundComponent} with a
// +link{DataBoundComponent.dataSource,DataSource configured}.
// <p>
// Searches are applied to the target by calling +link{dataBoundComponent.fetchData()}, or, for ListGrids,
// by calling +link{listGrid.setViewState()}.  If +link{savedSearchItem.saveLastSearch} is set, the name of
// the last search is automatically stored in browser <code>localStorage</code>, and will be applied to the
// <code>targetComponent</code> as soon as saved searches are loaded.
// <p>
// By default, <code>SavedSearchItem</code> acquires the
// +link{SavedSearches.defaultDataSource,default DataSource for storing searches} and uses it as
// +link{selectItem.optionDataSource}.  The displayed value is the user's name for the search (from
// +link{SavedSearches.searchNameField}) followed by a user-readable summary of the stored
// search, derived from +link{DataSource.getAdvancedCriteriaDescription()}, with a hover to show long values
// that may be clipped.
// <p>
// If +link{SavedSearchItem.canAddSearch,adding searches is allowed}, the <code>SavedSearchItem</code> either shows a
// +link{FormItemIcon} (+link{savedSearchItem.addSearchIcon}) or a pickList entry for adding searches
// (+link{savedSearchItem.addSearchValue}).  Either interface opens an +link{EditSearchWindow}.
// <p>
// The +link{pickList} is automatically configured to show the search name plus the search description (via
// +link{SavedSearchitem.pickListFields,pickListFields}), plus additional columns for icons for 
// +link{SavedSearchItem.editSearchField,editing},
// +link{SavedSearchItem.removeSearchField,removal}, +link{SavedSearchItem.copySearchField,copying existing searches},
// and +link{SavedSearchItem.markAsDefaultField,choosing a default search}.
// <p>
// Admin-configured searches are displayed after user-created searches, after a
// +link{SavedSearchItem.adminSeparatorRecord,separator}.
// <p>
// +link{savedSearchItem.searchChanged} fires when the user selects a new saved search, saves
// changes to an existing saved search, or saves a new search.  Note that +link{SavedSearchItem.valueField} is set to
// +link{SavedSearches.componentIdField} and +link{SavedSearchItem.displayField} to +link{SavedSearches.searchNameField}.
// <p>
// Saving new searches also causes +link{savedSearchItem.targetDataSource} to be required.  You
// can set +link{savedSearchItem.newRecordValues} to a set of fixed values that should be saved
// whenever the user saves a new search; this can be used to save searches related to the current
// user's userId, for example.
// <p>
// The special interface that allows an admin to save shared searches appears if the user has the
// +link{SavedSearchItem.adminRole} as determined by +link{Authentication.hasRole()}.
// <p>
// <h3>Saving full "viewState" for grids</h3>
// <p>
// If the +link{SavedSearchItem.targetComponent,targetComponent} is a +link{ListGrid} or +link{TreeGrid}, 
// the default behavior is to store the
// complete +link{listGrid.viewState} rather that just search criteria.  If you want to store just criteria,
// set +link{SavedSearchItem.storedState} to "criteria".
// <p>
// <b>Note:</b> this feature requires
// +externalLink{https://www.smartclient.com/product/,SmartClient Pro} or better.
//
// @inheritsFrom SelectItem
// @treeLocation Client Reference/Data Binding/SavedSearches
//
// @visibility external
//<




// SavedSearchesList set up in SavedSearches.js
// These are methods that are applied to ListGrid and SavedSearchItem to handle
// manipulating lists of saved searches for display
isc.defineClass("SavedSearchItem", "SelectItem", "SavedSearchesList").addProperties({

//> @attr savedSearchItem.canAddSearch (boolean : false : IR)
// This flag controls whether adding new searches is allowed.
// @visibility external
//<
canAddSearch: false,

//> @attr savedSearchItem.addSearchValue (String : null : IR)
// Setting this property moves the +link{canAddSearch} functionality from an icon next to the form item (+link{addSearchIcon}) to the dropdown.
// When set, the SavedSearchItem will look for this value in +link{specialValues} and use it as the trigger action for +link{canAddSearch}.  
// @visibility external
//<
addSearchValue: null,

//> @attr savedSearchItem.addSearchIcon (SCImgURL : "[SKINIMG]actions/add.png" : IR)
// Icon to be used to show the +link{EditSearchWindow}.
// @visibility external
//<
addSearchIcon: "[SKINIMG]actions/add.png",


// Editing
//-------------------------------------------------------------------------------------------------------------
    
//> @attr savedSearchItem.canModifyProperty (String : null : IR)
// Optional name of a boolean field in the records returned by the <code>optionDataSource</code>,
// where setting the field to <code>false</code> means the Record cannot be edited or removed by
// the current user.
// @visibility external
//<
canModifyProperty: null,
 
//> @attr savedSearchItem.pickListFields (Array of ListGridField : [...] : RA)
// The SavedSearchItem pickListFields are automatically generated and contain fields for
// the search name plus the search description, plus additional columns for icons for editing, 
// removal, copying existing searches, and choosing a default search. 
// @visibility external
//<

//> @attr savedSearchItem.editSearchField (AutoChild ListGridField : null : IR)
// ListGridField shown in the pickList to allow users to edit existing searches.  The field is type "icon"
// and displays the skin's standard "edit" icon.
// <p>
// Does not appear if the +link{targetEditsCriteria,target is a grid}, since the simplest way of editing a
// search is just to select it, use the grid's built-in criteria editing to change it, and save as new.
// <P>
// Specific records can be marked as unable to be edited via +link{canModifyProperty}.
// @visibility external
//<
// - implementation:
//   - should use the standard skin edit icon (pencil)
//   - should be absent from rows that the user can't edit
editSearchIcon : "[SKINIMG]/actions/edit.png",
editSearchIconSize : 16,
//> @attr savedSearchItem.editSearchHoverText (String : "Edit search" : IR)
// Hover text that appeares over the +{editSearchField}
// @group i18nMessages
// @visibility external
//<
editSearchHoverText: "Edit search",


//> @attr savedSearchItem.canEditSearch (boolean : null : IR)
// Whether existing searches can be edited.
// <p>
// If no explicit value is set, it will be defaulted to <code>false</code> if the
// +link{targetEditsCriteria,target is a grid}. Searches can be edited by simply selecting
// them, using the grid's standard UI to edit the search, and then saving that as the original
// search.
// @visibility external
//<
canEditSearch: null, 

//> @attr savedSearchItem.canRemoveSearch (boolean : true : IR)
// Whether existing searches can be removed.
// @visibility external
//<
canRemoveSearch: true,
 
//> @attr savedSearchItem.canCopySearch (boolean : null : IR)
// Whether existing searches can be copied.
// <p>
// If no explicit value is set, it will be defaulted to <code>false</code> if the
// +link{targetEditsCriteria,target is a grid}. Searches can be copied by simply selecting
// them, using the grid's standard UI to edit the search, and then saving that as a new search.
// @visibility external
//<
canCopySearch: null,
 


//> @attr savedSearchItem.targetComponent (DataBoundComponent : null : IR)
// Component that saved searches should apply to.  When set, whenever +link{searchChanged} fires,
// the search is automatically applied to the <code>targetComponent</code> unless the
// <code>searchChanged</code> event is cancelled.
// @visibility external
//<
targetComponent: null,

//> @method savedSearchItem.setTargetComponent
// Changes the +link{targetComponent} to the passed in newTargetComponent.
// @param newTargetComponent (DataBoundComponent) the newTargetComponent
// @visibility external
//<
setTargetComponent : function (newTargetComponent) {
    
},
// must set in order for pickList to re-init with data on setTargetComponent - otherwise won't fetch on redraw
autoFetchDataOnRedrawn: true,


_initTargetComponent : function (targetComponent, logFailureToResolve) {


    // this is where we track various state flags for a particular targetComponent
    // doing this as on obj and tracking by targetComponent instance to ensure there is no desync due to arbitrary
    // timing of pickList.dataArrived, user calling setTargetComponent multiple times, etc. 
    // Ultimately, we need to act as early as possible in suppressing autoFetchData on the component given to us and
    // to restore last/default state only once our pickList.data has arrived *and matches the actual current targetComponent*
    if (!this._targetComponentState) this._targetComponentState = {};

    // canonicalize to instance - we can't do anything until we have this
    if (isc.isA.String(targetComponent)) {
        var targetComponentID = targetComponent;
        targetComponent = isc.Canvas.getById(targetComponentID);
        if (!targetComponent) {
            if (logFailureToResolve) this.logWarn("Unable to resolve targetComponent: "+targetComponentID);
            return;
        }
        // no-op if the same exact component is passed in, as can happen on a forced redraw
        if (this.targetComponent == targetComponent) return;
        this.targetComponent = targetComponent;
    }

    

    // Check to see if we already are tracking a targetComponent
    var previousTargetComponent = this._targetComponentState.targetComponent;
    if (previousTargetComponent) {
        // idempotency - return if our currrent state matches the component that was passed in
        if (previousTargetComponent == targetComponent) return;

        this.logDebug("targetComponentChanged");

        isc.SavedSearches.suspendDefaultComponentFetch();

        // we were previously tracking a different targetComponent - see if we have intervened in its autoFetchData behavior and restore if so
        if (previousTargetComponent._autoFetchDataDeferred) {
            // reinstate
            this.logDebug("removing autoFetchData deferral on previous targetComponent: "+previousTargetComponent.getID());
            isc.ss.restoreDefaultComponentFetch(previousTargetComponent, null, this.storedState, this.saveLastSearch);
        }

        // any other previousTargetComponent state alterations should be restored here
        this.savedSearchDS = this._targetComponentState.savedSearchDS;
        this.targetEditsCriteria = this._targetComponentState.targetEditsCriteria;

        // we have dealt with previousTargetComponent and no longer care about tracking it - reset our state obj
        this._targetComponentState = {};
    }

    if (this.pickList) {
        this.logDebug("destroying existing pickList");
        // rebuild, as a lot of properties depend on the nature of the targetComponent
        // also, if there is an outstsanding fetch request for the existing pickList, it is now invalid and we must ignore it
        // or we will be applying last/default search from previousTargetComponent to the new targetComponent
        this.pickList.destroy();
        delete this.pickList;
    }
    // if the new targetComponent is null, there is nothing more to do now that we have dealt with the previousTargetComponent
    if (targetComponent == null) return;

    this._targetComponentState.savedSearchDS = this.savedSearchDS;
    // canonicalize to instance for convenience
    if (this.savedSearchDS != null) {
        this.savedSearchDS = isc.DS.get(this.savedSearchDS);
    }
    if (!this.savedSearchDS)  {
        // If we have an explicit offlineStorageKey we have to use 
        // our own local dataSource
        if (this.offlineStorageKey != null) {
            this.savedSearchDS = isc.ss.getLocalDataSource(this.offlineStorageKey);
        } else {
            this.savedSearchDS = isc.ss.getSavedSearchDataSource(this.targetComponent);
        }
    }

    this._targetComponentState.targetEditsCriteria = this.targetEditsCriteria;

    // autodetect, if not explicitly set
    if (this.targetEditsCriteria === null) {
        this.targetEditsCriteria = this.getTargetEditsCriteria();
    }

    // unless explicitly specified, disable edit+copy if targetEditsCriteria
    if (this.canEditSearch == null) {
        this.canEditSearch = !this.targetEditsCriteria;
    }
    if (this.canCopySearch == null) {
        this.canCopySearch = !this.targetEditsCriteria;
    }


    // start tacking new targetComponent
    this.logDebug("tracking new targetComponent: "+targetComponent.getLocalId());
    this.targetComponent = this._targetComponentState.targetComponent = targetComponent;

    // Setup projectId/screenId properties for picklist filtering criteria
    this.projectId = this.form.getProjectId();
    this.screenId = this.form.getScreenId();
    
    // if it's not a DBC, we don't need to intervene in any way
    if (!isc.isA.DataBoundComponent(this.targetComponent)) return;

    // suspend autoFetchDatan while we fetch saved search data for the component.
    isc.ss.suspendDefaultComponentFetch(targetComponent);
},

//> @attr savedSearchItem.targetDataSource (DataSource : null : IR)
// DataSource that the saved searches are performed against.
// <p>
// Normally auto-derived from +link{targetComponent,targetComponent.dataSource}, but can be specified
// manually if no <code>targetComponent</code> is provided.  In this case, +link{searchChanged} would be
// implement to apply criteria in a custom way.
// @visibility external
//<
targetDataSource: null,



//> @attr savedSearchItem.adminRole (String : null : IRW)
// Role to check for (via +link{Authentication.hasRole()} to determine whether admin interfaces are shown.
// If not explicitly set, at initialization time this will be defaulted to +link{SavedSearches.adminRole}.
// @visibility external
//<

//> @attr savedSearchItem.newRecordValues (Record : null : IRW)
// Additional, fixed Record values that should be used every time a new search is saved.  
// <P>
// This can be used to create user-specific saved searches by adding the userId as part of the
// saved Record's value.
// <P>
// Since this property is settable on the fly, you could also add an external interface that would
// allow a user to save system-wide searches that are not associated with their userId.  For
// example, system-wide searches might have userId set to blank or to a special marker value, and
// the +link{selectItem.optionCriteria} could be set so that the <code>SavedSearchItem</code>
// shows system-wide as well as user-specific saved searches.
// @visibility external
//<
newRecordValues: null,


// Last Searches
//-------------------------------------------------------------------------------------------------------------
//> @attr savedSearchItem.saveLastSearch (boolean : false : IR)
// If set, the name of the last search is automatically stored in browser <code>localStorage</code>, 
// and will be applied to the <code>targetComponent</code> as soon as saved searches are loaded.
// @visibility external
//<
saveLastSearch: false,

//> @attr savedSearchItem.savedSearchId (String : null : IRA)
// Optional explicit identifier for saved searches. See +link{savedSearchItem.saveDefaultSearch} for details.
// @visibility external
//<

getSavedSearchId : function () {
    return isc.SavedSearches.getSavedSearchId(this.targetComponent || this);
},
_getLocatorForLocalStorage : function () {
    // use targetComponent locator if set, otherwise the ssi locator
    var tc = this.targetComponent || this;
    return tc.getSavedSearchId();
},

// Default Searches
//-------------------------------------------------------------------------------------------------------------
   
//> @attr savedSearchItem.saveDefaultSearch (boolean : true : IR)
// Works identically to +link{listGrid.saveDefaultSearch}.  The default is stored in browser
// <code>localStorage</code> using the +link{dataBoundComponent.savedSearchId} of the +link{targetComponent},
// or the +link{AutoTest.getMinimalLocator()} if no savedSearchId was specified.<br>
// If no targetComponent is specified, the savedSearchId or minimal locator of the <code>SavedSearchItem</code> itself will be used.
// <p>
// Note that if the targetComponent is +link{listGrid.autoFetchData}, and saveDefaultSearch is true, the SavedSearchItem
// automatically registers with the target component to prevent an automatic fetch with default criteria,
// and then, after looking up the default search, will perform either the default search or perform a
// standard autoFetch if no default search is found.
// @visibility external
//<
//   - implementation note: extremely key to do it this way partly because we flip in autoFetchData:true in
//     Reify for grids, tileGrids, etc
saveDefaultSearch: true,
   
//> @type SavedSearchStoredState
// How should a window be closed?
//
// @value "criteria"   only criteria will be stored, even for components that are capable of storing additional viewState.
//
// @visibility external
//<

//> @attr savedSearchItem.storedState (SavedSearchStoredState : null : IR)
// Set to "criteria" if you want only criteria to be stored for ListGrids and TreeGrids instead of the full viewState of the component.
// @see SavedSearchItem
// @visibility external
//<
storedState: null,

// Storage options in preferred order:
// - Explicit SSI.offlineStorageKey - use a LocalDS with that key, ignoring any defaults on SavedSearches
// - Explicit SavedSearches.defaultDataSource - use that
// - Lastly Auto generated SavedSearches local DS with SavedSearches.offlineStorageKey


//> @attr savedSearchItem.savedSearchDS (String : null : IR)
// Optional override of +link{SavedSearches.defaultDataSource} for this SavedSearchItem.
// @visibility external
//<
savedSearchDS:null,


//> @attr savedSearchItem.offlineStorageKey (String : null : IR)
// Optional key used for local storage of saved searches by this component.
// <P>
// If unset, the default +link{SavedSearches.offlineStorageKey} will be used for local storage instead.
// <P>
// Has no effect if +link{savedSearchDS} is set.
// 
// @visibility external
//<
offlineStorageKey: null,

// Appearance
//-------------------------------------------------------------------------------------------------------------
   

colSpan: 1,
showTitle: false,

//> @attr savedSearchItem.title (String : "Searches" : IR)
// Title of this FormItem.  Mote that the title is hidden by default for SavedSearchItem.
// @group i18nMessages
// @visibility external
//<
title: "Searches",


//> @attr savedSearchItem.hint (String : "Saved searches..." : IR)
// Text shown inside the field that serves as an indicator of what this field is for.
// @group i18nMessages
// @visibility external
//<
hint: "Saved searches...", // i18nMessage
showHintInField:true,
pickListMaxWidth: 500,

// allows RS to be modifiable so we can inject the separator record

filterLocally: true,



init : function () {

    
    {
        
        this.delayCall("logWarn", ["SavedSearchItem requires SmartClient Pro or better. " +
            "See https://www.smartclient.com/product/ to find the edition right for you."], 0);
    }

    return this.Super("init", arguments);
}



});

//> @method savedSearchItem.searchChanged()
// Event fired whenever a user changes the currently selected saved search, modifies a saved
// search or adds a new saved search.
// <p>
// If a +link{targetComponent} has been specified, <code>searchChanged</code> automatically
// applies the new search to the <code>targetComponent</code> unless the event is cancelled
// <smartclient>by returning false</smartclient>.
//
// @param newCriteria (Criteria) new criteria
// @param searchData (Record) savedSearch record 
// @return (boolean) whether to automatically apply the search to the +link{targetComponent}
// @visibility external
//<
// - implementation:
//   - not the same as the normal changed() event, which would only detect changes to the
//     valueField, not changed to criteria via editing
//   - should wrap in standard event registration pattern for SGWT - should be a *cancellable*
//     event (see targetComponent)
//  'registerStringMethods()' - add all the instance properties that can be defined as strings
//  to evaluate (or as methods) to a central registry, together with their arguments as comma
//  separated strings.
//
isc.SavedSearchItem.registerStringMethods({
    searchChanged : "newCriteria,searchData"
});




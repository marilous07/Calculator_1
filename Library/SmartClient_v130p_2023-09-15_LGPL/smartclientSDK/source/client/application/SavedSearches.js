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
//> @class SavedSearches
// Data components such as +link{ListGrid} or +link{TileGrid} may allow users to set up their own 
// search criteria within an application, either via an external +link{SearchForm}, or through built 
// in UI such as the +link{listGrid.filterEditor}.
// <P>
// The "Saved Search" subsystem allows users to save out their criteria (and in some cases
// user-configured view state) so when the application is reloaded they can 
// easily restore a search or view from a previous session.
// <P>
// <i><b>Note:</b> The SavedSearches feature requires
// +externalLink{https://www.smartclient.com/product/,SmartClient Pro} or better.</i>
// <P>
// User interface components for storing and retreiving saved searches are available via
// the built in ListGrid features +link{listGrid.canSaveSearches} and
// +link{ListGrid.savedSearchStoredState}, as well as the explicit
// the +link{class:SavedSearchForm} and +link{class:SavedSearchItem} classes.
// <P>
// <h4>The SavedSearches class</h4>
// <code>SavedSearches</code> is a "singleton" class that provides
// central handling of storing and loading saved search data.
// <p>
// You acquire the <code>SavedSearches</code> singleton via +link{classMethod:SavedSearches.get()} and you
// can configure defaults via +link{Class.addProperties()} or +link{Class.changeDefaults()}.
// <p>
// Saved searches are stored +link{JSONEncoder,serialized as JSON} in +link{DataSource} Records.<br>
// By default saved searches are stored in HTML5 browser <code>localStorage</code> via automatically
// generated custom DataSources. In this mode the searches are only retained for a specific user 
// on a particular machine, and searches cannot be shared with other users - but this approach
// is sufficient for many applications, works out of the box, does not require any storage and
// has no impact on scalability.
// <P>
// For more capable saved search storage and retrieval, an explicit saved search dataSource
// backed by permanent storage such as an SQL database table may be specified.<br>
// Typically this is done by setting up the +link{SavedSearches.defaultDataSource}.
// This will store searches for all users and for every component and the same dataSource
// may even be used for multiple applications.<br>
// For finer grained control, individual saved search dataSources may also be specified 
// +link{listGrid.savedSearchDS,per component}.
// <p>
// See +link{SavedSearches.getSavedSearchDataSource()} for how to retrieve the dataSource for
// a component.
// <p>
// A SavedSearch dataSource has the following fields, some of which are optional, all of
// which can be renamed as needed. (Click the links to see the purpose of each field):
// <ul>
// <li> +link{SavedSearches.primaryKeyField,"pk"} (primary key field, typically of type "sequence")
// <li> +link{SavedSearches.dataField,"data"}
// <li> +link{SavedSearches.searchNameField,"searchName"}
// <li> +link{SavedSearches.componentIdField,"componentId"}
// <li> +link{SavedSearches.projectIdField,"projectId"}
// <li> +link{SavedSearches.screenIdField,"screenId"}
// <li> +link{SavedSearches.applicationIdField,"applicationId"}
// <li> +link{SavedSearches.userIdField,"userId"}
// <li> +link{SavedSearches.adminField,"admin"} See "Admin-Configured Shared Searches" below.
// <li> +link{SavedSearches.defaultField,"isDefault"}, See "Default Searches" below.
// <li> +link{SavedSearches.adminDefaultField,"isSharedDefault"}, See "Default Searches" below.
// </ul>
// <p>
// In your SDK, look for <code>sc_SavedSearches.ds.xml</code> for a sample SQL-based implementation of
// saved-search (entirely declarative).  Note that +link{dataSource.cacheAllData} is set to true - this
// causes all searches applicable to a given user to be loaded in advance, the first time any component
// requests saved searches.  For most applications, this is the right approach, and is much better than
// performing server requests each time a new component is shown that <i>might</i> have saved searches.
// <p>
// Note that the SavedSearches system can be used to store any kind of component setting; in particular,
// +link{ListGrid.canSaveSearches,ListGrids} used <code>SavedSearches</code> to store complete
// +link{listGrid.getViewState,viewState}, which includes field order & visibility, sorting and group
// state in addition to search criteria.
// <p>
// <h4>Admin-Configured Shared Searches</h4>
// <p>
// <i>Shared searches</i> (also referred to as <i>"Admin Searches"</i>) are special
// searches that appear for <b>all</b> users, as pre-configured default saved searches.
// While any user can create and edit their own personal saved searches, admin searches 
// can only be created or edited by users with the +link{SavedSearches.adminRole} (see below).
// <P>
// Admin searches are not available when no dataSource was configured to store the savedSearch data.
// In this case a user's searches are stored to their machine rather than in a central database, 
// and the concept of sharing admin-created searches does not apply.
// <P>
// Admin searches are identified by either 
// having the +link{SavedSearches.userIdField,userIdField} null, or by the separate boolean 
// +link{SavedSearches.adminField,adminField} set to true.
// <p>
// UI components such as +link{SavedSearchItem} will offer a UI for adding, 
// editing and removing admin searches if the user has the +link{SavedSearches.adminRole},
// as determined by +link{Authentication.hasRole()}.
// <P>
// In addition to this, for security reasons
// the server should also enforce role-based authentication for creating and editing admin searches.<br>
// Note: the sample <code>sc_SavedSearches.ds.xml</code> dataSource has no "admin" field to
// identify shared or "admin" searches. Instead records in this dataSource with 
// "userId" set to null are considered to be shared searches.<br>
// The <code>ownerIdField</code>, <code>ownerIdNullAccess</code> and
// <code>ownerIdNullRole</code> attributes enforce the appropriate restrictions for editing
// admin searches -- these settings allow all users to view records with <code>userId:null</code>
// but only users with the "admin" role may create or edit them.
// <p>
// <h4>Default Searches</h4>
// <P>
// Default searches are searches which will be automatically applied to a component on draw.
// The SavedSearch subsystem supports two notions of "default" searches. A user may select
// their personal default search, in which case the next time they load the page this search will be 
// applied to the component automatically. Or an administrator may mark a shared admin search 
// as the default for all users. In this case anyone who loads the application will see this search applied.
// <P>
// If a user has a stored personal default search preference, this always takes precedence over any
// admin-default search.
// <P>
// Like any admin-searches, admin-default searches only apply when a dataSource was configured to
// store the savedSearch data.
// <P>
// <h3>Saving default searches</h3>
// If +link{savedSearches.saveDefaultSearchToServer} is false (the default), the user-default search 
// preference will be stored in browser <code>localStorage</code>.<br>
// This is done because the user may choose an Admin Search as
// their default search, and since Admin Search records are shared between all users, we can't mark the
// Admin Search record in the database as the default for a specific user (at least not without more complex storage).<br>
// The drawback is that a user switching browsers or device will not have their default search preserved.
// <P>
// If you want to persist default searches chosen by the user to permanent storage on the server, you can 
// set +link{savedSearches.saveDefaultSearchToServer} to true. In this case the SavedSearch dataSource
// must include a boolean +link{savedSearches.defaultField}. Typically this will need to be populated via custom server logic
// when fetching records to indicate that the record in question is the chosen default for the current user.
// When <code>saveDefaultSearchToServer</code> is true, the client will issue a custom update operation 
// when the user wants to modify their default search - see +link{savedSearches.setDefaultUserSearchOperation}.
// <P>
// Admin default searches are stored on the server regardless of whether +link{savedSearches.saveDefaultSearchToServer} is true.
// The dataSource should include a boolean +link{savedSearches.adminDefaultField} to indicate that an admin search record is
// the shared-default search.<br>
// If an admin user updates a record to be the new shared default search, the client will issue a different
// custom update operation - see +link{savedSearches.setDefaultAdminSearchOperation}.<br>
// Note that we'd recommend marking this operation as <code>requiresRole="admin"</code> on the server, as
// in the sample <code>sc_SharedSearches.ds.xml</code> dataSource configuration.
//
// <h4>Identifying components associated with Saved Searches</h4>
// <p>
// Stored SavedSearch records will have the <code>componentId</code> field set to the identifier 
// returned by +link{SavedSearches.getSavedSearchId()} for a component.<br>
// By default this method returns a +link{AutoTest.getMinimalLocator(),minimal locator}.  This means
// that if you assign a unique ID to a component that saves searches, and don't change that ID, stored 
// saved searches will always be associated with the component.
// <P>
// If you don't have a unique ID on the component, the minimal locator is not guaranteed to be consistent
// across changes to your page layout. While Minimal Locators have a good chance of being unaffected
// even if you refactor your UI, but there are cases where they may change and previously
// stored searches would no longer be associated with the component.
// See the +link{AutoTest.getMinimalLocator()} docs for details.
// <P>
// Alternatively you can bypass minimal locator system altogether and define an explicit
// +link{dataBoundComponent.savedSearchId}. This allows you to define a stable identifier for storing saved 
// searches without setting a component +link{Canvas.ID,ID}.
// <P>
// Note that a component savedSearch ID string is not guaranteed to be immutable over a widget's lifespan.<br>
// Autotest minimal locators can change in various cases such as changing page structure or binding the
// component to a new DataSource.<br>
// Additionally developers may explicitly change the +link{dataBoundComponent.savedSearchId} at runtime.
// <P>
// In either case, if the saved search ID changes, the component will be associated with a new set of 
// saved searches.<br>
// There are cases where this is desirable. For example if a compnent is bound to one dataSource, and
// then gets bound to a new dataSource where previously stored searches would no longer be applicable,
// developers may explicitly change the savedSearchId for the component.
// 
// <h4>Security Concerns</h4>
// <p>
// If you provide your own +link{SavedSearches.defaultDataSource,DataSource for storing searches}, you should
// enforce the following restrictions on the server:
// <ul>
// <li> Limiting fetch operations such that the logged-in user can only see their own searches (searches
//      where the current userId matches the +link{savedSearches.userIdField,userIdField}), and 
//      shared or "admin" searches (searches where the +link{savedSearches.adminField,adminField}
//      is <code>true</code>, or if there is no admin field, searches where the <code>userIdField</code> value
//      is null).</li>
// <li> Ensuring that logged in users without the +link{savedSearches.adminRole,adminRole} can only  
//      add, edit and remove records where the +link{savedSearches.userIdField,userIdField} matches
//      their userId.</li>
// <li> For logged in users with the +link{savedSearches.adminRole,adminRole}, also allowing users to
//      add, update and remove admin searches. What this means in concrete terms depends on whether
//      the dataSource includes an +link{savedSearches.adminField,adminField}.<br>
//      If an adminField exists, admin users are exempt from userId restrictions when editing or
//      removing records where this field value is set to true. When adding a new record it is still
//      recommended the admin user's own userId should be stored in the <code>userIdField</code>.<br>
//      If no adminField exists, admin searches are identified by having the <code>userIdField</code>
//      set to <code>null</code>. In this case admin users should be able to add, remove and edit 
//      records where the <code>userIdField</code> matches their own userId, or is null.</li>
// </ul>
// <p>
// <code>searchName</code> field escaping: by default, any character is allowed in the
// <code>searchName</code> field, and <code>searchName</code> are +link{dataSourceField.escapeHTML,escaped}
// when displayed by built-in UI components.  If you provide your own UI for saved searches, you should
// escape the <code>searchName</code> field before displaying.  Otherwise, users could render your
// application partly non-functional by using special characters or inline script, or a malicious admin
// could inject code into other user's browsers.  If you prefer to just limit the <code>searchName</code>
// field to non-special characters, you can just add a +link{dataSourceField.validators,dataSourceField validator} 
// to do this, and the
// built-in UIs for saved search will handle the validation error as expected (block the save or edit and
// tell the user what's wrong).
// <p>
// If you fail to implement all of the above, then it will be possible for users to save searches for other
// users or as admin searches, and those saved searches could have malicious code that is then injected into
// other user's browsers.
// <p>
// As noted above - the SavedSearches feature requires
// +externalLink{https://www.smartclient.com/product/,SmartClient Pro} or better.
//
// @treeLocation Client Reference/Data Binding
// @visibility external
//<



isc.defineClass("SavedSearches").addClassProperties({

//> @classMethod SavedSearches.get()
// Singleton accessor method.
// @return (SavedSearches) an instance of SavedSearches
// @visibility external
//<
get : function () {
    
    {
        this.logWarn("Using the SavedSearches class requires SmartClient Pro or better. " +
                     "See https://www.smartclient.com/product/ to find the edition right for you.");
    }

    return this.singleton;
},

// internal helpers
_decodeData : function (data) {
    if (isc.isA.String(data)) data = isc.JSON.decode(data);
    return data;
},
_dataIsViewState : function (data) {
    data = this._decodeData(data);
    if (data && data._constructor == "AdvancedCriteria") return false;
    return true;
},
_getCriteriaFromData : function (data) {
    data = this._decodeData(data);
    if (data == null) return null;
    if (this._dataIsViewState(data)) return data.userCriteria;
    return data;
},


// Central Cache used by getLocalDataSource()
_localDSCache:{}
});

isc.SavedSearches.addProperties({

//> @attr savedSearches.saveDefaultSearchToServer (boolean : false : IR)
// Should a user's default search preferences be stored to the server?
// <P>
// Default user searches are normally saved in browser <code>localStorage</code> - see the "Default Searches"
// section of the +link{SavedSearches} doc and also the docs for +link{listGrid.saveDefaultSearch}.
// <p>
// If you want to store the default search on the server instead, you can add an
// +link{operationBinding} of type "update" called +link{setDefaultUserSearchOperation,"setDefaultUserSearch"} to your
// +link{SavedSearches.defaultDataSource}.  This will be called with the PK value of the record to be made
// the default search, plus a boolean true value for the +link{SavedSearches.defaultField}.  The
// expectation is that the search identified by the PK is marked as default and any other searches
// previously marked as default are unmarked.
// <p>
// Since Admin Search records are shared among all users, the expectation is that the underlying storage
// actually stores default markers separately from admin searches, and the +link{defaultDataSource} is
// acting as a +link{group:dsFacade,facade DataSource}.
// <p>
// Updating a user's default search in the dataSource data should not modify any admin-default search.
//
// @visibility external
//<
saveDefaultSearchToServer: false,

//> @attr SavedSearches.defaultDataSource (DataSource | String : null : RW)
// Default DataSource used for persistence of saved searches. This may be overridden for individual components via
// +link{listGrid.savedSearchDS,component.savedSearchDS}.
// <P>
// If no default dataSource is explicitly provided, the system will automatically generated a custom DataSource
// for each component that stores saved searches in HTML5 <code>localStorage</code>. See +link{getLocalDataSource()}.
// <P>
// This means the searches are only retained for that specific user on that
// particular machine, and searches cannot be shared with other users.  However, this approach does mean
// that you don't have to provide storage for saved searches and saving searches has no impact on
// scalability.
// 
// @visibility external
//<
defaultDataSource: null,

// Was a field defined on the explicitly specified dataSource
// provided to a component as savedSearchDS, or on the SavedSearches defaultDataSource
// Some behaviors are governed by whether fields are present - for example
// if an admin field is present it's used to identify shared searches, otherwise
// we look at whether a userId was present
// Note this method will never return true for the auto-generated local DataSource
savedSearchDataSourceHasField : function (component, fieldName) {
    
},

//> @method SavedSearches.getDefaultDataSource()
// Retrieves the DataSource used for persistence of saved searches.  
// <P>
// If a +link{defaultDataSource} was explicitly specified, it will be returned, otherwise
// this method returns null.
// <P>
// To retrieve the dataSource used to store savedSearches for a specific component see 
// +link{getSavedSearchDataSource()}
//
// @return (DataSource) DataSource used to persist saved searches to the server
// @visibility external
//<
getDefaultDataSource : function () {
    if (this.defaultDataSource != null) return isc.DataSource.get(this.defaultDataSource);
    
},

//> @method SavedSearches.getSavedSearchDataSource()
// Retrieves the DataSource used for persistence of saved searches for some component.
// <P>
// If +link{listGrid.savedSearchDS,component.savedSearchDS} is specified this will be returned.<br>
// Otherwise if an explicit +link{SavedSearches.defaultDataSource,default dataSource} was specified, it will be used.<br>
// <P>
// If no explicit dataSource was provided either at the component level or as a default for all 
// SavedSearches, this method will return the result of +link{getLocalDataSource()}.
//
// @param component (DataBoundComponent) component to retrieve the SavedSearch dataSource for
// @return (DataSource) the DataSource used to store saved searches for the target component
// @visibility external
//<
// In addition to component.savedSearchDS, we support SavedSearchItem.savedSearchDS.
// This only makes sense for a SavedSearchItem with no targetComponent
getSavedSearchDataSource : function (component) {
    var ds = (component.savedSearchDS != null && isc.DataSource.get(component.savedSearchDS)) ||
             this.getDefaultDataSource();
    if (ds != null) return ds;

    // If no explicit DS was set up, we create a LocalDataSource for each set of savedSearches
    
    
    if (component._savedSearchLocalDS == null) component._savedSearchLocalDS = this.getLocalDataSource(component);
    return component._savedSearchLocalDS;
},

//> @attr SavedSearches.offlineStorageKey (String : "isc_savedSearch_" : IR)
// If no explicit +link{defaultDataSource} was provided, a custom HTML5 <code>local storage</code>
// backed dataSource will be automatically created per component to store saved 
// searches (see +link{getLocalDataSource()}).
// <P>
// This property denotes a base storage key for these dataSources.<br>
// The +link{getSavedSearchId(),calculated savedSearch identifier}
// for the component will be appended to this value to create the key to use when storing
// serialized searches in local storage.
//
// @visibility external
//<
offlineStorageKey: "isc_savedSearch_",

//> @method SavedSearches.getSavedSearchId()
// Returns the identifier used to uniquely identify saved searches for some component.
// <P>
// This is the value that will be set on the +link{componentIdField} when storing
// saved searches to a DataSource.<br>
// If there is no explicly specified dataSource for storing saved searches, it will
// also be used to configure the offline storage key for data stored by the
// automatically generated +link{getLocalDataSource(),local storage backed dataSource} 
// for the component.
// <P>
// The returned value is calculated as follows:
// <ul><li>If +link{dataBoundComponent.savedSearchId} is set, this method will return
//         the +link{savedSearchIdPrefix} + <code>component.savedSearchId</code>.</li>
//     <li>Otherwise a +link{isc.AutoTest.getMinimalLocator(),minimal locator} will be returned.<br>
//         Note that for components with an explicitly specified +link{Canvas.ID,ID}, this
//         will just be the widget ID.</li></ul>
//
// Note: The returned ID string is not guaranteed to be immutable over a widget's lifespan.
// <P>
// If no explicit component <code>savedSearchId</code> was set, the system will rely on the 
// AutoTest minimal locator which can change in various cases
// (a component may be reparented, or bound to a new DataSource, etc).<br>
// Since this property is used to identify the savedSearch records associated with this component,
// when it changes a different set of saved searches will be available to the user.
// <P>
// If you want to control this explicitly, you can do so by setting an explicit
// +link{dataBoundComponent.savedSearchId,savedSearchId}. Changing
// the <code>savedSearchId</code> at runtime also allows you to deliberately
// associate a component with a new set of SavedSearches depending on application state.
// One common case where this might be desirable is if a component is bound to a dataSource
// and you want to bind to a new DataSource where the savedSearch criteria would not be applicable.
//
// @param component (Canvas) component to retrieve the identifier for
// @return (String) component saved search ID
// @visibility external
//<
// We want to document how the value is calculated so a dev can potentially store 
// savedSearches for widgets that have not been created yet.
getSavedSearchId : function (component) {
    // Handle being passed a stored component identifier from a DS record
    if (isc.isA.String(component)) return component;

    // SSID: prefix will ensure we don't associate a stored saved search 
    // with a component whos widget ID matches the SSID of some other component
    if (component.savedSearchId != null) return this.savedSearchIDPrefix + component.savedSearchId;
    return isc.AutoTest.getMinimalLocator(component);
},

//> @attr SavedSearches.savedSearchIDPrefix (String : "SSID:" : IRA)
// Prefix applied to a specified +link{dataBoundComponent.savedSearchId} by
// +link{SavedSearches.getSavedSearchId()}. This is required to handle the case where a component's
// savedSearchId matches the ID of some other component.
// @visibility external
//<
savedSearchIDPrefix:"SSID:",

// savedSearchIdUpdated(): Notification function invoked when a component's savedSearchId changes.
// This may be due to 
// - an explicit call to "setSavedSearchId()" 
// - an autotest minimal locator changing when a datasource is updated
// No default implementation - this is an observable method that can be used to refresh UI
// when set of saved searches changes at runtime
 
savedSearchIdUpdated : function (component, componentId) {

},

targetDataSourceChanged : function (component) {
    if (component && component.savedSearchId == null && !component.hasStableMinimalID()) {
        isc.ss.savedSearchIdUpdated(component, this.getSavedSearchId(component));
    }
},


//> @method SavedSearches.getLocalDataSource()
// This method returns an automatically generated custom DataSource to store saved searches for
// a component in HTML5 localStorage. Note that this dataSource will only be used to store
// savedSearches if there is no +link{SavedSearches.defaultDataSource,shared default dataSource} specified,
// and if +link{listGrid.savedSearchDS} is not set for the component.
// <P>
// The offline storage key for the data will be generated by combining the +link{SavedSearches.offlineStorageKey}
// with the component identifier retrieved from +link{getSavedSearchId()}.
// <P>
// <b>Note:</b> The dataSources returned by this method will suppress logging their requests to the
// +link{group:devConsoleRPCTab,Developer Console RPC tag} by default. This is done so developers
// can more easily see dataSource requests and responses that were explicitly initiated by application
// code, to simplify debugging. However, if a developer has explicitly created a SavedSearch dataSource
// either as the +link{SavedSearches.defaultDataSource,global default} or at the 
// +link{listGrid.savedSearchDS,component level}, requests to access and update SavedSearch data 
// will be logged as with any other dataSource.
//
// @param componentId (Canvas | String) Component to retrieve the dataSource for, or
//   saved search component identifier as returned by +link{getSavedSearchId()}
// @return (DataSource) dataSource for SavedSearches backed by HTML5 local storage.
// @visibility external
//<
logLocalDSRequests:false,
getLocalDataSource : function (componentID) {
    if (isc.isA.Canvas(componentID)) componentID = this.getSavedSearchId(componentID);
    if (componentID == null) {
        this.logWarn("getLocalDataSource() invoked with no componentID");
        return null;
    }
    return this._getLocalDataSource({
        transformRequest : function (dsRequest) {
            if (dsRequest.doNotTrackRPC == null) dsRequest.doNotTrackRPC = !isc.ss.logLocalDSRequests;
            return dsRequest;
        },
        _generated:true,
        _componentID:componentID,
        storageMode: "allRecords",
        storageKey:this.offlineStorageKey + componentID
    });
},

_getLocalDataSource : function (props) {
    
},

//> @attr SavedSearches.dataField (String : "data" : RW)
// Type: "string".  Name dataSource field used for storing the saved search itself with at least 8k of storage (it's possible for searches to get yet larger, but rare).  
// @visibility external
//<
dataField: "data",

//> @attr SavedSearches.primaryKeyField (String : "pk" : RW)
// Type: "string".  Name dataSource field used as the primary key.
// <P>
// This is expected to be populated automatically when new search records are added to the
// data set, so will typically be of +link{type:FieldType,type:sequence}.
// @visibility external
//<
primaryKeyField: "pk",

//> @attr SavedSearches.searchNameField (String : "searchName" : RW)
// Type: "string".  Name dataSource field used for storing names of saved searches.
// @visibility external
//<
searchNameField: "searchName",

//> @attr SavedSearches.componentIdField (String : "componentId" : RW)
// Type: "string".  Stores a unique ID for the component the saved search is associated with. 
//  This does not have to be the +link{canvas.ID} and is usually a
// +link{type:AutoTestLocator}
// @visibility external
//<
componentIdField: "componentId",

//> @attr SavedSearches.projectIdField (String : "projectId" : RW)
// Type: "string".  Required because component IDs are not unique if components are loaded as 
// +link{RPCManager.loadScreen(),screens}, especially +link{group:reifyForDevelopers,Reify Screens}.
// @visibility external
//<
projectIdField: "projectId",

//> @attr SavedSearches.screenIdField (String : "screenId" : RW)
// Type: "string".  Required because component IDs are not unique if components are loaded as 
// +link{RPCManager.loadScreen(),screens}, especially +link{group:reifyForDevelopers,Reify Screens}.
// @visibility external
//<
screenIdField: "screenId",

//> @attr SavedSearches.applicationIdField (String : "applicationId" : RW)
// Type: "string" <i>(optional)</i>. This field
// exists to allow a single DataSource to be used across multiple applications without colliding on
// <code>componentId</code>.  Set +link{SavedSearches.applicationId} to cause all search lookups to use
// <code>applicationId</code> as criteria, and all newly saved searches to store that <code>applicationId</code>
// @visibility external
//<
applicationIdField: "applicationId",

//> @attr SavedSearches.userIdField (String : "userId" : RW)
// Type: "string" <i>(optional)</i>. This stores the
// <code>userId</code> of the user saving the search, populated from
// +link{Authentication.getCurrentUserId(),the current userId}.  This field is only optional in
// the sense that you could instead build a DataSource that returns user-specific saved
// searches through some other mechanism (for example, by inserting a userId value and forcing
// userId criteria on the server side).
// @visibility external
//<
userIdField: "userId",

//> @attr SavedSearches.adminField (String : "admin" : RW)
// <i>(optional)</i>, type "boolean". Designates this search as an admin search, visible to all users
// @visibility external
//<
adminField: "admin",

//> @attr SavedSearches.defaultField (String : "isDefault" : RW)
// <i>optional</i>, type "boolean".  Designates this search
// as the default search for this user.
// <P>
// This field is only required if +link{saveDefaultSearchToServer} is true.<br>
// See the "Default Searches" section of the 
// +link{SavedSearches,SavedSearches overview} for more information.
//
// @visibility external
//<
defaultField: "isDefault",

//> @attr SavedSearches.adminDefaultField (String : "isSharedDefault" : RW)
// Type "boolean". Designates an admin search as the shared default search for all users.
// <P>
// The user's <i>chosen</i> default search is normally stored separately; the <code>adminDefaultField</code>
// exists as a way to mark a search as the default for a user that hasn't chosen one yet.
// <P>
// See the "Default Searches" section of the 
// +link{SavedSearches,SavedSearches overview} for more information.
// 
// @visibility external
//<
adminDefaultField: "isSharedDefault",

//> @attr SavedSearches.applicationId (String : null : RW)
// The applicationId that will be saved to +link{SavedSearches.applicationIdField,"applicationIdField"}
// to disambiguate from other applications that use the same dataSource.
// <P>
// If no applicationId was specified, +link{getApplicationId()} will return the current 
// +externalLink{https://www.w3schools.com/jsref/prop_loc_pathname.asp,window.location.pathname} by
// default. This behavior can be turned off by setting
// +link{allowNullApplicationId,allowNullApplicationId:true}.
// <P>
// The <code>applicationId</code> allows the same dataSource to be used to store savedSearches
// for different applications. It also ensures that if +link{defaultDataSource,explicit dataSource} 
// was specified, and searches are being stored to +link{getLocalDataSource(),browser local storage},
// saved searches will be associated with the current application even if another application
// running under the same domain/port has a component with the same +link{getSavedSearchId(),componentId}.
//
// @visibility external
//<
applicationId: null, 

//> @attr SavedSearches.allowNullApplicationId (boolean : false : IRWA)
// If +link{savedSearches.applicationId} is not explicitly specified, it will be defaulted to
// the current 
// +externalLink{https://www.w3schools.com/jsref/prop_loc_pathname.asp,window.location.pathname}.
// <P>
// Set this flag to true to disable this behavior and allow SavedSearches to be stored with no
// explicit applicationId.
//
// @visibility external
//<
allowNullApplicationId:false, 

//> @method savedSearches.getApplicationId()
// Retrieves the value to saves as the link{SavedSearches.applicationIdField,"applicationIdField"} value
// for saved searches within this application.
// <P>
// Returns +link{applicationId,this.applicationId} if specified, otherwise the current 
// +externalLink{https://www.w3schools.com/jsref/prop_loc_pathname.asp,window.location.pathname}
// will be returned by default.<br>
// Set +link{allowNullApplicationId} to suppress this behavior of defaulting to the location.pathname.
//
// @return (String) applicationId to be stored for saved searches.
// @visibility external
//<
getApplicationId : function () {
    if (this.applicationId != null || this.allowNullApplicationId) return this.applicationId;
    return window.location.pathname;
},

//> @attr SavedSearches.adminRole (String : "admin" : RW)
// The name of the adminRole (used via +link{Authentication.hasRole()) to check to see if the current user has admin privileges.
// @visibility external
//<
adminRole: "admin",

//> @attr SavedSearches.setDefaultUserSearchOperation (String : "setDefaultUserSearch" : IRA)
// +link{operationBinding.operationId,operationId} for the custom update operation to invoke when updating
// the default user search if +link{saveDefaultSearchToServer} is true.
// <P>
// The update data for this operation will be the saved search record to mark as the user default
// with the +link{defaultField} set to indicate whether the saved search is being set or cleared.
//
// @visibility external
//<
setDefaultUserSearchOperation:"setDefaultUserSearch",

//> @method SavedSearches.setDefaultUserSearch()
// Update the user's default search.
// <P>
// This will invoke the +link{SavedSearches.setDefaultUserSearchOperation} if +link{saveDefaultSearchToServer} is true,
// otherwise it will persist the default into offline storage
//
// @param component (DataBoundComponent) component being updated
// @param isDefault (boolean) whether the default is being set to true or false
// @param searchRecord (Record) record containing details of the search to be updated
// @param callback (Callback) callback to invoke when the search has been updated. Takes no arguments.
// @visibility external
//<

setDefaultUserSearch : function (component, isDefault, record, callback) {
    if (this.saveDefaultSearchToServer) {   
        var ds = this.getSavedSearchDataSource(component);
        var updateRecord = isc.addProperties({}, record);
        updateRecord[this.defaultField] = isDefault;
    
        ds.updateData(
            updateRecord, 
            function (dsResponse, data, dsRequest) {
                var cc = dsRequest.clientContext;
                if (cc.callback != null) {
                    cc.target.fireCallback(cc.callback);
                }
            }, 
            {
                operationId: this.setDefaultUserSearchOperation,
                clientContext:{
                    target:this,
                    callback:callback
                }
            }
        );
    } else {  
        if (!isDefault) {
            this._removeDefaultSearchNameFromLocalStorage(component);
        } else {
            var searchName = record[this.searchNameField];
            this._saveDefaultSearchNameToLocalStorage(component, searchName);
        }
        this.fireCallback(callback);

    }
},

// Helpers to store default / last search for some component to local storage
lastSearchStorageKey: "sc_lastSearch:",
_saveLastSearchNameToLocalStorage : function (component, searchName) {
    isc.Offline.put(this.lastSearchStorageKey+this.getSavedSearchId(component), searchName);
},
_loadLastSearchNameFromLocalStorage : function (component) {
    return isc.Offline.get(this.lastSearchStorageKey+this.getSavedSearchId(component));
},

defaultSearchStorageKey: "sc_defaultSearch:",
_saveDefaultSearchNameToLocalStorage : function (component, searchName) {
    isc.Offline.put(this.defaultSearchStorageKey+this.getSavedSearchId(component), searchName);
},
_loadDefaultSearchNameFromLocalStorage : function (component) {
    return isc.Offline.get(this.defaultSearchStorageKey+this.getSavedSearchId(component));
},
_removeDefaultSearchNameFromLocalStorage : function (component) {
    isc.Offline.remove(this.defaultSearchStorageKey+this.getSavedSearchId(component));
},

//> @attr SavedSearches.setDefaultAdminSearchOperation (String : "setDefaultAdminSearch" : IRW)
// +link{operationBinding.operationId,operationId} for the custom update operation to invoke when updating
// the default admin search.
// <P>
// The update data for this operation will be the saved search record to mark as the shared default
// with the +link{adminDefaultField} set to indicate whether the saved search is being set or cleared.
// <P>
// When marking a search as the new shared default, the dataSource implementation for this custom 
// update operation must clear the adminDefaultField value on any previous shared default search.
// The server should also use the <code>dsResponse.relatedUpdates</code> feature to notify the client 
// that the previous default was unset.
//
// @visibility external
//<
setDefaultAdminSearchOperation:"setDefaultAdminSearch",

//> @method SavedSearches.setDefaultAdminSearch()
// Update the admin default search for some component
// <P>
// This will invoke the +link{SavedSearches.setDefaultAdminSearchOperation} to update the admin search
// record on the server.
//
// @param component (DataBoundComponent) component being updated
// @param isDefault (boolean) whether the default is being set to true or false
// @param searchRecord (Record) record containing details of the search to be updated
// @param callback (Callback) callback to invoke when the search has been updated. Takes no arguments.
// @visibility external
//<
// Note: Logic to set default admin search isn't guaranteed to run through this method
// In SavedSearchEditor we issue a custom update operation directly to the DS rather than invoking
// this method 
// [This is required to let us add/update a search and mark it as the shared default in a single
// queued transaction]
setDefaultAdminSearch : function (component, isDefault, record, callback) {
    var ds = this.getSavedSearchDataSource(component);
    var updateRecord = isc.addProperties({}, record);
    updateRecord[this.adminDefaultField] = isDefault;
    ds.updateData(
        updateRecord,
        function (dsResponse, data, dsRequest) {
            var cc = dsRequest.clientContext;
            if (cc.callback != null) {
                cc.target.fireCallback(cc.callback);
            }
        }, 
        {
            operationId: this.setDefaultAdminSearchOperation,
            clientContext:{
                target:this,
                callback:callback
            }
        }
    );
},

// ----------------
// Utility methods for dealing with saved-search data directly

// Given a List of Saved Search records (ResultSet or Array), find the
// default search for this user - either the stored default user search or the admin default search
findDefaultSearch : function (component, data) {
    var defaultSearchRecord;
    if (this.saveDefaultSearchToServer) {
        // will be marked in data
        var currentUser = isc.Authentication.getCurrentUserId();
        if (currentUser == null) {
            this.logWarn("saveDefaultSearchToServer is set, but currentUser not available on page: " +
                        "unable to find default search for current user - will fall back to default admin search, if any");
        } else {
            var matchCriteria = {};
            matchCriteria[this.userIdField] = currentUser;
            matchCriteria[this.defaultField] = true;
            var rows = data.findAllMatches(matchCriteria);
            if (rows && rows.length) {
                if (rows.length > 1) {
                    this.logWarn("found multiple server-stored defaults for user: " + currentUser +
                        " - please check your setDefault operation on the server.  Using first.");
                }
                defaultSearchRecord = rows[0];
            }
        }
    } else {
        // load from localStorage
        var defaultSearchName = this._loadDefaultSearchNameFromLocalStorage(component);
        if (defaultSearchName) {

            //this.logDebug("found defaultSearchName in local storage: "+defaultSearchName);
            defaultSearchRecord = data.find(this.searchNameField, defaultSearchName);
            //this.logDebug(isc.echoFull(defaultSearchRecord));
        }
    }

    // If we didn't find a user-default, check for an admin default
    if (!defaultSearchRecord) {
        var matchCriteria = {};
        
        if (this.savedSearchDataSourceHasField(component, this.adminField)) {
            matchCriteria[this.adminDefaultField] = true;
            matchCriteria[this.adminField] = true;
        } else {
            matchCriteria = {
                _constructor: "AdvancedCriteria",
                operator: "and",
                criteria: [
                    {fieldName: this.adminDefaultField, operator: "equals", value: true},
                    {fieldName: this.userIdField, operator: "isNull"}
                ]
            }
        }

        var rows = data.findAllMatches(matchCriteria);
        if (rows && rows.length && !defaultSearchRecord) {
            if (rows.length > 1) {
                this.logWarn("found multiple server-stored admin defaults.  Using first.");
            }
            defaultSearchRecord = rows[0];
        }
    }
    return defaultSearchRecord;
},

// cache of saved searches indexed by component identifier

_savedSearchCache:{},

// Fires the callback with the array of saved search records for the specified componentID
// Callback may fire asynchronously.
_pendingFetchCBs:{},
getSavedSearchData : function (component, callback) {
    var _this = this;
    var componentID = this.getSavedSearchId(component);
    if (this._savedSearchCache[componentID] != null) {
        this._fireSavedSearchDataCallback(_this._savedSearchCache[componentID], callback);

    // If we haven't got cached data we'll have to fetch data from the DS.
    } else {
        var ssDS = this.getSavedSearchDataSource(component),
            criteria = this._getSavedSearchCriteria(component);


        // If possible we'll fetch synchronously but this isn't possible for a
        // server-backed DS.
        // Track pending callbacks by componentID so we can fire them together when
        // the fetch completes instead of kicking off additional fetches.
        if (this._pendingFetchCBs[componentID] != null) {
            this._pendingFetchCBs[componentID].add(callback);
        } else {

            this._pendingFetchCBs[componentID] = [callback];

            ssDS.fetchDataSynchronous(
                criteria,
                function (dsResponse, data, dsRequest) {
                    // Build a ResultSet so this data stays in synch with the DataSource for future callers
                    var resultSet = _this._savedSearchCache[componentID] = isc.ResultSet.create(
                        {
                            // Apply the criteria to ensure we don't pick up data from other components
                            criteria:criteria,
                            dataSource:ssDS,
                            initialData:data                
                        }
                    );
                    var callbacks = _this._pendingFetchCBs[componentID];
                    delete _this._pendingFetchCBs[componentID];

                    for (var i = 0; i < callbacks.length; i++) {
                        _this._fireSavedSearchDataCallback(resultSet, callbacks[i]);
                    }
                },
                { warnOnAsync:false }
            );
        }
    }
},

// Helper to fire a getSavedSearchData() callback
_fireSavedSearchDataCallback : function (resultSet, callback) {
    var data;
    if (resultSet == null || !resultSet.allMatchingRowsCached()) {
        //>DEBUG
        // This internal method should never fire before we have a full cache, but if it does happen
        // log a warning and fail gracefully by returning an empty array
        this.logWarn("Saved Search Callback fired before data has loaded - data may not be accurate");
        //<DEBUG
        data = [];
    } else {
        data = resultSet.getRange(0, resultSet.getLength());
    }
    this.fireCallback(callback, "data,callback", [data, callback]);
},


_getAdminRecordCriteria : function (component, isSubCriteria) {
    var adminRecordCriteria = this.savedSearchDataSourceHasField(component, this.adminField) ?
        {
            fieldName: this.adminField, operator: "equals", value: true
        }:{
            fieldName: this.userIdField, operator: "isNull"
        };
    if (!isSubCriteria) adminRecordCriteria._constructor = "AdvancedCriteria";
    return adminRecordCriteria;
},
_getSavedSearchCriteria : function (component) {
    var idCriteria = {
        _constructor: "AdvancedCriteria",
        operator: "and",
        criteria: []
    };

    var componentId = component.getSavedSearchId();  
    idCriteria.criteria.add({
        fieldName: this.componentIdField,
        operator: "equals",
        value: componentId
    });

    // constrain on projectId
    var projectId = component.getProjectId();
    if (projectId) idCriteria.criteria.add({
        fieldName: this.projectIdField,
        operator: "equals",
        value: projectId
    });

    // constrain on screenId
    var screenId = component.getScreenId();
    if (screenId) idCriteria.criteria.add({
        fieldName: this.screenIdField,
        operator: "equals",
        value: screenId
    });
    var applicationId = this.getApplicationId();
    if (applicationId) idCriteria.criteria.add({
        fieldName: this.applicationIdField,
        operator: "equals",
        value: applicationId
    });


    var userCriteria = {
        _constructor: "AdvancedCriteria",
        operator: "or",
        criteria: []
    };
    // matching current user
    // Note that if ownerIdField is set on the server this will be enforced on the back end too
    var ssDS = this.getSavedSearchDataSource(component);
    var userId = isc.Authentication.getCurrentUserId();
    if (userId == null && !isc.isA.LocalDataSource(ssDS)) {
        this.logWarn("isc.Authentication.getCurrentUserId() is null, but savedSearchDS appears to persist to server - likely will be rejected by authorization checks on server.");
    }

    if (userId) userCriteria.criteria.add({
        fieldName: this.userIdField,
        operator: "equals",
        value: userId
    });

    // all admin searches - either null userId or optional adminField set to true
    userCriteria.criteria.add(this._getAdminRecordCriteria(component, true));

    var criteria = {
        _constructor: "AdvancedCriteria",
        operator: "and",
        criteria: [
            idCriteria,
            userCriteria
        ]
    };
    
    return criteria;
},

// --------------------------------------------------------------
// Logic to actually apply default searches to a target component

// Apply a search record to a component
// [Either fetchData() or setViewState()]
applySearch : function (component, searchRecord, storedStateType, saveAsLastSearch) {

    var serializedData = searchRecord[this.dataField];

    
    var grid = isc.isA.ListGrid(component) ? component : null;
    var data = isc.SavedSearches._decodeData(serializedData),
        criteria = isc.SavedSearches._getCriteriaFromData(data);


    if (grid) {
        var dataIsViewState = isc.SavedSearches._dataIsViewState(data);
        // The storedState enum is currently a boolean that only applies to grids
        // to differentiate between storing/restoring criteria vs full state
        if (dataIsViewState && storedStateType != "criteria") {
            // serializedData is a view-state string already
            grid.setViewState(serializedData);
        } else {
            // data is criteria, or it's viewState but we only want to restore criteria

            // copied from LG.setViewState()
            if (criteria == "[No Criteria]") {
                grid.clearFilterValues();
                grid.handleFilterEditorSubmit({});
            } else {
                grid.setUserCriteriaState(criteria);
            }
        }
    } else {
        // component could have been a grid and may have stored view state - convert to a non-grid {} 
        if (criteria == "[No Criteria]") criteria = {};
        component.fetchData(criteria);
    }

    var searchName = searchRecord[this.searchNameField];
    if (saveAsLastSearch) this._saveLastSearchNameToLocalStorage(component, searchName);
},


// Helper methods to defer the component initialFetch while we figure out (asynchronously) whether there's
// a default saved search, and to either apply that initialFetch or apply a default search when that
// process is complete

suspendDefaultComponentFetch : function (component) {
    // returns true if the fetch was deferred successfully
    return component.deferInitialFetch();
},
restoreDefaultComponentFetch : function (component, recordToRestore, storedStateType, saveLastSearch) {
    // if doInitialFetch already fired, warn about timing and inefficiency
    // this should not happen if the saved searches were picked up from the
    // component itself via (EG) listGrid.canSaveSearches functionality.
    
    if (component._initialFetchFired) {
        if (!isc.SavedSearches._warnedOnExtraFetch) {
            this.logWarn("SavedSearches has loaded saved fetches for component: " + component.getID() 
                + ". This component has already fired it's initial fetch." 
                + " Any restored last or default criteria will be applied as a follow-on to this fetch."
                + " If you are using a SavedSearchItem, this can occur when the item is passed the targetComponent after"
                + " targetComponent.draw(). Consider providing the targetComponent to"
                + " this SavedSearchItem earlier in your code flow for efficiency and"
                + " avoid an unnecessary extra fetch.");
            isc.SavedSearches._warnedOnExtraFetch = true;
        }
    }

    if (component._autoFetchDataDeferred) {
        component.undeferInitialFetch(recordToRestore == null);
    }
    
    if (recordToRestore) { 
        this.applySearch(component, recordToRestore, storedStateType, saveLastSearch);
    }
},

// Components may need to be notified when the search dataSource data changes so they can
// update their UI to reflect the current set of searches.


_changeCallbacks:{},
_changeCallbackCount:0,
registerSavedSearchChangeCallback : function (component, callback) {

    var ds = this.getSavedSearchDataSource(component),
        ID = this.getSavedSearchId(component);
    if (!ds) return;

    if (!this.isObserving(ds, "dataChanged")) {
        this.observe(ds, "dataChanged", "observer.dataSourceDataChanged(observed, dsResponse, dsRequest);");
    }
    var ID = "_" + this._changeCallbackCount++;
    if (this._changeCallbacks[ds.getID()] == null) {
        this._changeCallbacks[ds.getID()] = {ID:callback};
    } else {
        this._changeCallbacks[ds.getID()][ID] = callback;
    }
},
unRegisterSavedSearchChangeCallback : function (component, callbackID) {
    var ds = this.getSavedSearchDataSource(component);
    if (this._changeCallbacks[ds.getID()] == null) return;

    delete this._changeCallbacks[ds.getID()][callbackID];
    if (isc.isAn.emptyObject(this._changeCallbacks[ds.getID()])) {
        this.ignore(ds, "dataChanged");
        delete this._changeCallbacks[ds.getID()];
    }
},

dataSourceDataChanged : function (dataSource, dsResponse, dsRequest) {
    var callbacks = this._changeCallbacks[dataSource.getID()];
    if (callbacks != null) {
        for (var ID in callbacks) {
            this.fireCallback(callbacks[ID], "dsResponse,dsRequest", [dsResponse, dsRequest]);
        }
    }
}


});

// The ListGrid savedSearch menu and SavedSearchItems share some logic for building UI 
// to work with SavedSearches - implement these here.
// These methods/properties will be applied to SavedSearchItem and the SavedSearchMenu class used
// in the ListGrid

isc.ClassFactory.defineInterface("SavedSearchesList");
isc.SavedSearchesList.addInterfaceMethods({


    // processData: Given a fetch for saved search data:
    // - finds the calculated 'default' search
    // - adds separator rows and sorts the admin search records to the top.
    // - returns the single search record we want to actually apply (either the "last" search or the default)
    processData : function (data) {
        if (data == null) return null;

        var ss = isc.ss,
            searchNameField = ss.searchNameField,
            component = this.targetComponent || this;   

        // find the search to restore to targetComponent
        var restoreSearchRecord;

        // first, look for last search
        if (this.saveLastSearch) {
            var lastSearchName = ss._loadLastSearchNameFromLocalStorage(component);
            if (lastSearchName) {
                this.logDebug("found lastSearchName in local storage: "+lastSearchName);
                restoreSearchRecord = data.find(searchNameField, lastSearchName);
            }
        }

        var defaultSearchRecord = ss.findDefaultSearch(component,data);
        // Mark the default search as the default via the special metadata flag so we can
        // show a checkmark next to it
        for (var i = 0; i < data.getLength(); i++) {
            var record = data.get(i);
            record._calculatedDefaultSearch = (record == defaultSearchRecord);
        }

        if (restoreSearchRecord == null && this.saveDefaultSearch) {
            restoreSearchRecord = defaultSearchRecord
        }
        
        // if we have admin records, add the separator record and position it via sort
        
        var adminRecordCriteria = ss._getAdminRecordCriteria(component);
        var adminRows = data.findAllMatches(adminRecordCriteria);
        if (adminRows && adminRows.length) {

            adminRows.setProperty("_isAdminSearch", true);        

            // don't inject separator record if all we have is admin rows
            if (adminRows.length != data.getLength()) {
                // we have admin records
                // sort so we can inject admin separator record as we are looking for admin defaults
                var adminSeparatorRecord = this.getAdminSeparatorRecordDef({
                        __isSearchAdminSeparator: true // use our own flag in case user provides a non-default record - needed to stabilize sort
                    });

                
                data.add(adminSeparatorRecord);

                var sortSpecifiers = [
                ];
                // This will put all explicitly marked admin searches up top
                if (ss.savedSearchDataSourceHasField(component, ss.adminField)) {
                    sortSpecifiers.add({direction: "descending", property: ss.adminField,
                        // treat nulls as explicit false
                        normalizer:function (item, property, context) {
                            if (!item || item[property] == null) return false;
                            return item[property];
                        }
                    });
                }
                // This will 
                // - sort all explicit admin searches by user ID
                // - put any 'null' user ID above any non null userID for searches not explicitly marked as admin
                //   [this puts the implied admin searches next to the explicit admin searches]
                sortSpecifiers.add({direction: "ascending", property: ss.userIdField});
                
                // Both "implied admin searches" and the separator have userId null.
                // This search shifts the separator to the end of that group, so to a user the
                // records marked as admin true appear next to the implied admin searches [no user id]
                // then the separator, then the non-admin user searches at the end [userID will match the logged in user]
                sortSpecifiers.add({direction: "ascending", property: "__isSearchAdminSeparator"});
                data.setSort(sortSpecifiers);
            }
        }

        return restoreSearchRecord;
    },

    isDefaultSearch : function (record) {
        // We determine the default search as part of processData()
        return record._calculatedDefaultSearch == true;
    },    

    //> @attr savedSearchItem.adminSeparatorRecord (AutoChild ListGridRecord : {isSeparator:true} : IR)
    // Properties for the separator record between locally saved and admin searches.
    // @visibility external
    //<
    adminSeparatorRecordDefaults: {
        isSeparator: true
    },

    // adminSeparatorRecordDefaults/Props is documented on ListGrid and SSI 
    getAdminSeparatorRecordDef : function (props) {
        return isc.addProperties({},this.adminSeparatorRecordDefaults, this.adminSeaparatorRecordProperties, props);
    },

    //> @attr savedSearchItem.removeSearchField (AutoChild ListGridField : null : IR)
    // ListGridField shown in the pickList to allow users to remove existing searches.  The field is type "icon"
    // and displays the skin's standard "remove" icon.
    // <p>
    // An optional confirmation dialog is shown if +link{confirmRemoval} is set.
    // <p>
    // By default, if a record is an admin search (because it has no value for +link{SavedSearches.userIdField} or because
    // +link{SavedSearches.adminField} is true on the record), only an admin will be able to delete it.
    // <P>
    // Alternatively, if you are not using the <code>SavedSearchItem</code>'s admin features, specific records
    // can be marked as unable to be removed via +link{canModifyProperty}.
    // @visibility external
    //<
    // - implementation:
    //   - should use the standard skin "remove" icon
    //   - should be absent from rows that the user can't remove
    //   - note this and the other ListGridFields autoChildren aren't true AutoChildren - they can't be
    //     implemented by a call to addAutoChild / createAutoChild, instead, the show flags and
    //     support for removeFieldDefaults and removeFieldProperties have to be manually implemented
    removeSearchIcon : "[SKIN]/actions/remove.png",
    removeSearchIconSize : 16,
    //> @attr savedSearchItem.removeSearchHoverText (String : "Remove search" : IR)
    // Hover text that appeares over the +{removeSearchField}
    // @group i18nMessages
    // @visibility external
    //<
    removeSearchHoverText: "Remove search",

    //> @attr savedSearchItem.copySearchField (AutoChild ListGridField : null : IR)
    // ListGridField shown in the pickList to allow users to copy existing searches.  The field is type "icon"
    // and displays the skin's standard "copy" icon.
    // @visibility external
    //<
    copySearchIcon : "[SKIN]/RichTextEditor/copy.png",
    copySearchIconSize : 16,
    //> @attr savedSearchItem.copySearchHoverText (String : "Copy search" : IR)
    // Hover text that appeares over the +{copySearchField}
    // @group i18nMessages
    // @visibility external
    //<
    copySearchHoverText: "Copy search",

    //> @attr savedSearchItem.markAsDefaultField (AutoChild ListGridField : null : IR)
    // ListGridField shown in the pickList to allow users to designate which field is the default search.  The
    // field is type "icon" and displays the skin's standard "checkbox" media.
    // @visibility external
    //<
    // - this field appears to the left of the search name
    // - use standard ListGrid-level checkbox media - getInstanceProperty() for
    //   listGrid.boolean(True|False)Image
    // - hover on field should say "Set as default search".  This needs to be an i18nMessage
    //   SavedSearches.setAsDefaultText, and should also be used from LG headerContextMenu for SavedSearches
    markAsDefaultSearchIcon : null,
    markAsDefaultSearchIconSize : 16,

    //> @attr savedSearchItem.markAsDefaultHoverText (String : "Set as default search" : IR)
    // Hover text that appeares over the +{markAsDefaultField}
    // @group i18nMessages
    // @visibility external
    //<
    markAsDefaultHoverText: "Set as default search",

    //> @attr savedSearchItem.markAsAdminDefaultField (AutoChild ListGridField : null : IR)
    // ListGridField shown in the pickList to allow admin users to designate which field is the admin-default search.  
    // The field is type "icon" and displays the skin's standard "checkbox" media. 
    // @visibility external
    //<

    //> @attr savedSearchItem.markAsAdminDefaultHoverText (String :  "Set as default search for all users<br><br><i>[May be overridden by users' own preferences.]</i>" : IR)
    // Hover text that appeares over the +{markAsAdminDefaultField}
    // @group i18nMessages
    // @visibility external
    //<
    markAsAdminDefaultHoverText : "Set as default search for all users<br><br><i>[May be overridden by users' own preferences.]</i>",

    //> @attr savedSearchItem.defaultSearchNameSuffix (HTMLString : " <i>[default]</i>" : IR)
    // HTML string to append to the search title in the search name field if this is the 
    // default search.
    // @visibility external
    // @group i18nMessages
    //<
    defaultSearchNameSuffix:" <i>[default]</i>",



    // copied from from LG's removeFieldDeafults for use in our special fields - possibly factor up?
    _actionFieldDefaults : {
        width:24,
        showDefaultContextMenu:false,
        selectCellTextOnClick:false,
        canEdit:false,
        canHide:false,
        canSort:false,
        canGroupBy:false,
        canFilter:false,
        showTitle:false,
        canExport: false,
        autoFitWidth: true,
        canDragResize: false,
        canAutoFitWidth: false,
        ignoreKeyboardClicks:true,
        showGridSummary: false,
        showGroupSummary: false,
        summaryValue: "&nbsp;",
        // disable this from ever being assigned as the treeField
        treeField:false,

        // flag that means this is a special builtin field, not for formulas/export/etc
        featureField: true
    },

    // Column for 'default' field checkbox.
    // On click invokes the API to set the selected search as the user's personal default
    getSetDefaultFieldDef : function (props) {    
        var _this = this;
        return isc.addProperties({
            name: "_defaultSearch",
            type: "boolean",
            canToggle: false,
            showHover: true,
            hoverHTML : function (record, value, rowNum, colNum) {
                if (record._isAddNew) return isc.nbsp;
                if (record[this.name] !== true) {
                    return _this.markAsDefaultHoverText;
                }
                return null;
            },
            getCellValue : function (viewer, record, recordNum, field, fieldNum, value) {
                // set up as part of processData()
                return record._calculatedDefaultSearch == true;
            },
            recordClick : function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
                // this prevents the ListGrid's "Save View..." menu item being marked as the default search
                // in the menu.
                if (record.omitSetDefaultIcon) {   
                    return null;
                }
    
                // use getCellValue rather that direct record lookup because user default can come from local storage
                // or server field, so the record value for defaultField is not determinative
                var currentValue = this.getCellValue(viewer, record, recordNum, fieldNum);
                var targetComponent = _this.targetComponent || _this; 
                isc.ss.setDefaultUserSearch(
                    targetComponent, !currentValue, record, 
                    function () {
                        _this.defaultSearchChanged();
                    }
                );
                return false;
            }
        }, this._actionFieldDefaults, this.markAsDefaultSearchFieldDefaults, this.markAsDefaultSearchFieldProperties, props);
    },
    // Notification when the user search changes
    // We can't rely on a DS notification as the user search may be stored separately from the DS.
    // Overridden in SSI and SavedSearchMenu
    defaultSearchChanged : function () {

    },

    // Helper to indicate an admin-search record
    isAdminSearch : function (record) {
        var component = this.targetComponent || this,
            ds = isc.ss.getSavedSearchDataSource(component),
            adminRecordCriteria = isc.ss._getAdminRecordCriteria(component);
        return ds.recordMatchesFilter(record, adminRecordCriteria);
    },

    isAdminUser : function () {
        var role = this.adminRole || isc.ss.adminRole;
        return isc.Auth && isc.Auth.hasRole(role);
    },

    _hasAdminDefaultField : function () {
        return isc.ss.savedSearchDataSourceHasField((this.targetComponent || this), isc.ss.adminDefaultField);
    },


    // Column for 'admin-default' field checkbox.
    // On click invokes the API to set the selected search as the an admin default
    // Should only be visible to admin users.
    
    getSetAdminDefaultFieldDef : function (props) {
        var _this = this;
        return isc.addProperties({
            name: "_defaultAdminSearch",
            type: "boolean",
            canToggle: false,
            showHover: true,
            hoverHTML : function (record, value, rowNum, colNum) {
                if (record._isAddNew) return isc.nbsp;
                if (!_this.isAdminSearch(record)) return isc.nbsp;

                if (record[this.name] !== true) {
                    return _this.markAsAdminDefaultHoverText;
                }
                return null;
            },

            // getValueIcon override defined in listGrid.js avoids showing the checkbox for non-admin search records
            getCellValue : function (viewer, record, recordNum, field, fieldNum, value) {
                if (!_this.isAdminSearch(record)) return "&nbsp;";
                return record[isc.ss.adminDefaultField]== true;
                
            },
            recordClick : function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
                // this prevents the ListGrid's "Save View..." menu item being marked as the default search
                // in the menu.
                if (record.omitSetDefaultIcon) {   
                    return null;
                }
                if (!_this.isAdminSearch(record)) return null;

    
                // use getCellValue rather that direct record lookup because user default can come from local storage
                // or server field, so the record value for defaultField is not determinative
                var currentValue = this.getCellValue(viewer, record, recordNum, fieldNum);
                var targetComponent = _this.targetComponent || _this; 
                isc.ss.setDefaultAdminSearch(
                    targetComponent, !currentValue, record, 
                    function () {
                        _this.defaultAdminSearchChanged();
                    }
                );
                return false;
            }
        }, this._actionFieldDefaults, this.markAsAdminDefaultSearchFieldDefaults, this.markAsAdminDefaultSearchFieldProperties, props);
    },
    
    defaultAdminSearchChanged : function () {

    },

    getSearchNameFieldDef : function (props) {
        var _this = this;
        return isc.addProperties({
            formatCellValue:function (value, record, rowNum, colNum, grid) {
                if (_this.isDefaultSearch(record)) {
                    value += _this.defaultSearchNameSuffix;
                }
                return value;
            },
            escapeHTML:false,
            name: isc.ss.searchNameField,
            width: 100,
            autoFitWidth: true
        }, props);
    },

    //> @attr savedSearchItem.confirmRemoval (boolean : true : IR)
    // Whether a confirmation message should be shown when a user removes a saved search.  The
    // message shown is the +link{confirmRemovalMessage}.
    // @visibility external
    //<
    confirmRemoval: true,

    //> @attr savedSearchItem.confirmRemovalMessage (HTMLString : "Remove saved search '${title}'?" : IR)
    // Message shown when +link{confirmRemoval,removal confirmation} is enabled and user attempts to
    // remove a saved search.  The variable "${title}" is available providing the display name of the
    // saved search.
    // @group i18nMessages
    // @visibility external
    //<
    confirmRemovalMessage: "Remove saved search '${title}'?",

    
    getRemoveFieldDef : function (props) {
        var _this = this;
        return isc.addProperties({
            name: "_removeSearchField",
            type:"icon",
            iconSize:this.removeSearchIconSize, // Makes autoFit more efficient
            showHover: true,
            hoverHTML : function (record, value, rowNum, colNum) {
                if (record._isAddNew) return isc.nbsp;
                return _this.removeSearchHoverText;
            },
            formatCellValue : function (value, record, rowNum, colNum, grid) { 
                if (_this.canModifyProperty && record[_this.canModifyProperty] === false) return isc.nbsp;
                if (record._isAddNew) return isc.nbsp;
                if (record._isAdminSearch && !_this.isAdminUser()) return isc.nbsp;
                var iconHTML = isc.Canvas.imgHTML({
                    src: _this.removeSearchIcon,
                    width: _this.removeSearchIconSize,
                    height: _this.removeSearchIconSize,
                    extraCSSText: "cursor:" + isc.Canvas.POINTER_OR_HAND
                });
                return iconHTML;
            },
            recordClick : function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
                if (record._isAddNew) return false;
                if (_this.canModifyProperty && record[_this.canModifyProperty] === false) return false;
                var searchTitle = record[isc.ss.searchNameField],
                    message = _this.confirmRemovalMessage.evalDynamicString(this, {title:searchTitle});
                isc.ask(
                    message,
                    function (yes) {
                        if (yes) viewer.removeRecordClick(recordNum, fieldNum);
                    }, {
                        buttons: [isc.Dialog.NO, isc.Dialog.YES],
                        autoFocusButton: 1
                    }
                );
                return false;
            }
        }, this._actionFieldDefaults, this.removeSearchFieldDefaults, this.removeSearchFieldProperties, props);
    },

    // Search Editor Window
    //-------------------------------------------------------------------------------------------------------------
    
    //> @attr savedSearchItem.editSearchWindow (AutoChild EditSearchWindow : null : IR)
    // Modal pop-up window shown when the user adds or edits a search, instance of
    // of +link{EditSearchWindow}.
    // @visibility external
    //<
    // - implementation:
    //   - don't try to create a singleton, just have every SSI create its own EditSearchWindow instance, so we
    //     don't have to figure out how to completely reset the window for use by another SSI
    //   - destroy the window when destroyed
    editSearchWindow: null,
    editSearchWindowDefaults: {
        _constructor: "EditSearchWindow"
    },

    showEditSearchWindow : function (props) {
        var _this = this,
            newRecordValues = this.getNewRecordValues()
        ;
        if (this.projectId || this.screenId) {
            newRecordValues = isc.addProperties({}, newRecordValues, {
                projectId: this.projectId,
                screenId: this.screenId
            });
        }
    
        
        var esw = this.createAutoChild("editSearchWindow", isc.addProperties({}, {
            // this set of props are passed as content to the EditSearchWindow and then onto its SavedSearchEditor
            passThroughProps: isc.addProperties({
                originComponent: this,
                mode: this.getTargetEditsCriteria() ? "grid" : "normal",
                operation: "add",
                targetComponent: this.targetComponent,
                targetDataSource: this.targetDataSource,
                savedSearchDS : this.savedSearchDS,
                newRecordValues: newRecordValues,
                isAdmin: this.isAdmin,
                storedState: this.storedState
            }, props),
            editComplete : function (record) {
                _this.editComplete(record);
            }
        }))
        esw.show();
    },
    
    // override point
    getNewRecordValues : function () {
        return this.newRecordValues;
    },

    editComplete : function (record) {
        if (record) {
            var searchName = record[isc.ss.searchNameField];
            
            //>EditMode
            var showNotification = (this.editingOn && this.editContext && this.editContext.isReify);
            if (showNotification) {
                var actions = [{
                    title: "undo", separator: "&nbsp;",
                    target: this,
                    methodName: "removeSavedSearch",
                    argNames: ["record"],
                    args: [record]
                }];
    
                isc.Notify.addMessage("Created " + searchName + " as an Admin search " +
                    "(appears for all users of you application).",
                    actions, null, { duration: 5000 });
            }
            //<EditMode
        }
    },

    removeSavedSearch : function (record) {
        var searchName = record[isc.ss.searchNameField];

        this.savedSearchDS.removeData(record);

        // For click feedback, dismiss the "created" message and indicate the undo
        isc.Notify.dismissMessage("message");
        isc.Notify.addMessage("Removed Admin search " + searchName, null, null, { maxStackSize: 1 });
    },

    //> @attr savedSearchItem.targetEditsCriteria (boolean : null : IR)
    // Whether the +link{targetComponent} has built-in criteria editing or does not.  True by default if the
    // target is a +link{ListGrid} or +link{TreeGrid} (but not +link{CubeGrid}).
    // <p>
    // When the target has built-in criteria editing, the <code>SavedSearchItem</code> does not try to provide a
    // +link{FilterBuilder}-based criteria editing interface, so the +link{SavedSearchEditor} is simplified to
    // just allow naming of searches.
    // @visibility external
    //<
    targetEditsCriteria: null,


    getTargetEditsCriteria : function () {
        if (this.targetEditsCriteria != null) return this.targetEditsCriteria;
        // autodetect, if not explicitly set
        if (this.targetComponent) {
            return isc.isA.ListGrid(this.targetComponent) || isc.isA.TreeGrid(this.targetComponent)
                || (isc.CubeGrid && isc.isA.CubeGrid(this.targetComponent))
        }
        return null;
    }


});

// Convenient alias for SavedSearches
isc.ss = isc.SavedSearches.get();

// Special 'SavedSearchMenu' used in ListGrid - picks up some common APIs used for Search-list UI
// Requires the isc.Menu class - may not be present if the Grids module was not loaded but
// the Forms module was

if (isc.Menu != null) {
    isc.defineClass("SavedSearchMenu", "Menu", "SavedSearchesList");

    isc.SavedSearchMenu.addProperties({
        initWidget : function () {

            var savedSearchFields = [];
            //>EditMode
            var grid = this.creator;
            if (!(grid && grid.editingOn && grid.editContext && grid.editContext.isReify)) {
            //<EditMode
                savedSearchFields.add(this.getSetDefaultFieldDef());
            //>EditMode
            }
            //<EditMode
            if (this.isAdminUser() && this._hasAdminDefaultField()) {
                savedSearchFields.add(this.getSetAdminDefaultFieldDef());
            }    
            savedSearchFields.add(this.getSearchNameFieldDef());
            savedSearchFields.add(this.getRemoveFieldDef());

            this.fields = savedSearchFields;
            return this.Super("initWidget", arguments);
        }
    });
}

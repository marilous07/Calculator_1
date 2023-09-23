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
//> @type Criteria
// Criteria for selecting only a matching set of records from a DataSource.  Criteria can
// be applied on the client and server.  Unless configured otherwise, criteria will generally
// be applied client-side by +link{ResultSet}s via +link{ResultSet.applyFilter()}.  
// <P>
// Client- and server-side systems built into SmartClient understand two criteria formats by
// default: simple key-value pairs (Criteria) or the +link{AdvancedCriteria} format.  
// <P>
// <smartclient>
// Simple key-value Criteria are represented via a JavaScript Object where each property
// specifies the name and required value for a field.  Multiple legal values for a field can be
// provided as an Array.  For example:
// <pre>
// var criteria = {
//    field1 : "value1",
//    field2 : ["value2", "value3"]
// }
// </pre>
// Would select all records where field1 has value "value1" and where field2 has <i>either</i>
// "value2" or "value3".
// </smartclient>
// <P>
// Use +link{DataSource.combineCriteria()} to combine two Criteria objects (including Criteria and
// AdvancedCriteria) or +link{DataSource.convertCriteria()} to convert simple Criteria to the
// AdvancedCriteria format.
// <P>
// <smartclient>
// When writing custom client and server-side filtering logic, criteria must be a JavaScript
// Object but the properties of that Object can contain whatever data you want.  
// </smartclient>
// When sent to the SmartClient server, the Java representation of the criteria is described
// +link{rpcRequest.data,here}.  When sent to other servers, the
// +link{type:DSProtocol,operationBinding.dataProtocol} affects the format.
//
// @treeLocation Client Reference/Data Binding
// @see CriteriaPolicy
// @visibility external
//<

//>	@class ResultSet    
// ResultSets are an implementation of the +link{List} interface that automatically fetches 
// DataSource records when items are requested from the List.  ResultSets provide robust,
// customizable, high-performance cache management for ListGrids and other built-in SmartClient
// components, and can be used as cache managers by custom components.
// <P>
// ResultSets manage data paging, that is, loading records in batches as the user navigates
// the data set.  A ResultSet will switch to using client-side sorting and filtering when
// possible to improve responsiveness and reduce server load.  ResultSets also participate in
// automatic cache synchronization, observing operations on DataSources and automatically
// updating their caches.
// <P>
// <b>Creation</b>
// <P>
// A ResultSet can be passed to any component that expects a List, and the List APIs can be
// called directly on the ResultSet as long as the caller is able to deal with asynchronous
// loading; see +link{method:ResultSet.getRange()}.
// <P>
// Generally ResultSets do not need to be created directly, but are created by DataBound
// components as an automatic consequence of calling 
// +link{group:dataBoundComponentMethods,DataBound Component Methods}.  
// For example, the +link{listGrid.fetchData()} causes +link{listGrid.data} to become an
// automatically created <code>ResultSet</code> object.  Automatically created ResultSets
// can be customized via properties on ListGrids such as +link{listGrid.dataPageSize} and
// +link{listGrid.dataProperties}.  All ResultSets for a given DataSource may also be 
// customized via setting +link{dataSource.resultSetClass} to the name of a ResultSet 
// +link{staticMethod:isc.defineClass(),subclass} in which 
// +link{classMethod:class.addProperties,defaults have been changed}.
// <P>
// A ResultSet defaults to using data paging, setting +link{dsRequest.startRow} and
// +link{dsRequest.endRow} in issued dsRequests.  Server code may always return more rows than
// the ResultSet requests and the ResultSet will correctly integrate those rows based on
// +link{dsResponse.startRow}/+link{dsResponse.endRow,endRow}.  
// Hence the server can always avoid paging mode by simply returning all matching rows.
// <P>
// A ResultSet can be created directly with just the ID of a +link{DataSource}:
// <smartclient>
// <pre>
//     isc.ResultSet.create({
//         dataSource : "<i>dataSourceID</i>"
//     })
// </pre>
// </smartclient>
// <smartgwt>
// <pre>
//      ResultSet resultSet = new ResultSet();
//      resultSet.setDataSource(dataSourceID);
// </pre>
// </smartgwt>
// <P>
// Directly created ResultSets are typically used by custom components, or as a means of
// managing datasets that will be used by several components.
// <P>
// When created directly rather than via a dataBoundComponent, a newly created ResultSet will
// not issue it's first "fetch" +link{DSRequest} until data is accessed (for example, via
// +link{resultSet.get,get()}).  
// <P>
// <b>Paging and total dataset length</b>
// <P>
// When using data paging, the server communicates the total number of records that match the
// current search criteria by setting +link{dsResponse.totalRows}.  The ResultSet will then
// return this number from +link{resultSet.getLength,getLength()}, and ListGrids and other
// components will show a scrollbar that allows the user to jump to the end of the dataset
// directly.
// <P>
// However, the ResultSet does not require that the server calculate the true length of the
// dataset, which can be costly for an extremely large, searchable dataset.  Instead, the
// server <i>may</i> advertise a <code>totalRows</code> value that is one page larger
// than the last row loaded.  This results in a UI sometimes called "progressive loading",
// where the user may load more rows by scrolling past the end of the currently loaded rows,
// but is not allowed to skip to the end of the dataset.
// <P>
// The SmartClient server offers built in support for progressive loading at the 
// +link{dataSource.progressiveLoading,dataSource},
// +link{operationBinding.progressiveLoading,operationBinding} and
// +link{dsRequest.progressiveLoading,request} level for SQL-backed dataSources.
// Setting +link{resultSet.progressiveLoading} or +link{dataBoundComponent.progressiveLoading} to
// true will also enable this feature where available.
// <P>
// Where available, progressive loading will also be enabled automatically
// for very large data sets if a
// +link{dataSource.progressiveLoadingThreshold} is specified.
// <P>
// Note that the SmartClient server is not a requirement for progressive loading -
// any DataSource implementation can enable progressive loading by simply populating 
// the +link{dsResponse.totalRows} property with an appropriate value. 
// We recommend the +link{DSResponse.progressiveLoading} attribute be set to true
// as well - this allows client side logic to treat the reported totalRows 
// value specially if necessary.
// <P>
// No client-side settings are required to enable this mode - it is entirely server-driven.
// However, it is usually coupled with +link{listGrid.canSort,disabling sorting}, since
// server-side sorting would also force the server to traverse the entire dataset.
// <P>
// <b>Client-side Sorting and Filtering</b>
// <P>
// If a ResultSet obtains a full cache for the current set of filter criteria, it will 
// automatically switch to client-side sorting, and will also use client-side filtering 
// if the filter criteria are later changed but appear to be <i>more restrictive</i> than the
// criteria in use when the ResultSet obtained a full cache.
// <P>
// The +link{resultSet.useClientSorting,useClientSorting} and 
// +link{resultSet.useClientFiltering,useClientFiltering} flags can be used to disable
// client-side sorting and filtering respectively if these behaviors don't match server-based
// sorting and filtering.  However, because client-side sorting and filtering radically improve
// responsiveness and reduce server load, it is better to customize the ResultSet so that it
// can match server-side sorting and filtering behaviors.
// <P>
// Sorting behavior is primarily customized via the "sort normalizer" passed to
// +link{resultSet.sortByProperty}, either via direct calls on a standalone ResultSet, or via
// +link{listGridField.sortNormalizer} for a ListGrid-managed ResultSet.
// <P>
// By default, client-side filtering interprets the +link{type:Criteria,criteria} passed to
// +link{resultSet.setCriteria,setCriteria()} as a set of field values that records must match
// (similarly to the built-in SQL/Hibernate connectors built into the SmartClient Server).
// Custom client-side filtering logic can be implemented by overriding
// +link{resultSet.applyFilter,applyFilter()}.  Overriding
// +link{resultSet.compareCriteria,compareCriteria()} allows you to control when the ResultSet
// uses client-side vs server-side filtering, and the ResultSet has two default 
// +link{resultSet.criteriaPolicy,criteria policies} built-in.
// <P>
// <b>Modifying ResultSets</b>
// <P>
// Records cannot be directly added or removed from a ResultSet via +link{List}
// APIs such as +link{List.removeAt(),removeAt()}, unless it always filters locally, since
// this would break the consistency of server and client row numbering needed for data paging,
// and also create some issues with automatic cache synchronization.  Set 
// +link{resultSet.modifiable,modifiable} to enable the +link{List} modification APIs on a
// +link{resultSet.fetchMode,fetchMode}:"local" ResultSet. Note that the special 
// +link{FilteredList} class sets this property to allow developers to modify its data.
// <P>
// Use +link{dataSource.addData()}/+link{DataSource.removeData(),removeData()} to add/remove
// rows from the +link{DataSource}, and the ResultSet will reflect the changes automatically.
// Alternatively, the +link{DataSource.updateCaches()} method may be called to only update
// local caches of the DataSource in question, without generating any server traffic.
// <P>
// To create a locally modifiable cache of Records from a DataSource, you
// can use +link{dataSource.fetchData()} to retrieve a List of Records which can
// be modified directly, or you can create a client-only +link{DataSource} from
// the retrieved data to share a modifiable cache between several
// DataBoundComponents.
// <P>
// <b>Updates and Automatic Cache Synchronization</b>
// <P>
// Once a ResultSet has retrieved data or has been initialized with data, the ResultSet will observe any
// successful "update", "add" or "remove" dsRequests against their DataSource, regardless of the
// component that initiated them.  A ResultSet with a full cache for the current filter criteria will
// integrate updates into the cache automatically.
// <P>
// Updated rows that no longer match the current filter criteria will be removed
// automatically.  To prevent this, you can set +link{resultSet.neverDropUpdatedRows}.
// Added rows will similarly be added to the cache only if they match current filter criteria.
// <P>
// Note that the client-side filtering described above is also used to determine whether 
// updated or added rows should be in the cache.  If any aspect of automated cache update is
// ever incorrect, +link{resultSet.dropCacheOnUpdate,dropCacheOnUpdate} can be set for the
// ResultSet or +link{dsResponse.invalidateCache} can be set for an individual dsResponse.
// <P>
// If automatic cache synchronization isn't working, troubleshoot the problem using the steps
// suggested +externalLink{http://forums.smartclient.com/showthread.php?t=8159#aGrid,in the FAQ}.
// <P>
// Regarding +link{OperationBinding.operationId, operationIds} and how they affect caching,
// take into account that cache sync is based on the fetch used - any add or update operation
// uses a fetch to retrieve updated data, and the operationId of that fetch can be set via
// +link{OperationBinding.cacheSyncOperation, cacheSyncOperation}.
// If the operationId of the cache is different from the operationId of the cache update data,
// it won't be used to update the cache, since the fields included and other aspects of the
// data are allowed to be different across different operationIds. This allows to maintain
// distinct caches on a per component basis, so when two components are using separate
// operationIds they are assumed to have distinct caches, because updates performed with
// one operationId will not affect the cache obtained via another operationId.
// Also, take into account that operationId must be unique per DataSource, across all
// operationTypes for that DataSource.
//
// <P>
// <b>Data Paging with partial cache</b>
// <P>
// When in paging mode with a partial cache, a ResultSet relies on server side sorting, setting 
// +link{dsRequest.sortBy} to the current sort field and direction.  In order for the cache to 
// remain coherent, row numbering must continue to agree between server and client as new
// fetches are issued, otherwise, duplicate rows or missing rows may occur.  
// <P>
// If concurrent modifications by other users are allowed, generally the server should set
// +link{dsResponse.invalidateCache} to clear the cache when concurrent modification is
// detected.
// <P>
// In paging mode with a partial cache, any successful "update" or "add" operation may cause
// client and server row numbering to become out of sync.  This happens because the update
// may affect the sort order, and client and server cannot be guaranteed to match for sets of
// records that have equivalent values for the sort field.
// <P>
// For this reason, after an "add" or "update" operation with a partial cache, the ResultSet
// will automatically mark cache for invalidation the next time a fetch operation is performed.
// Alternatively, if +link{resultSet.updatePartialCache} is set to false, the ResultSet will
// simply invalidate cache immediately in this circumstance.
//
// @see interface:DataBoundComponent
// @see group:dataBoundComponentMethods
// @see DataSource.resultSetClass to customize all ResultSets for a given DataSource
// @see resultSet.getRange() for information on handling asynchronous loading
//
// @implements List
// @treeLocation Client Reference/Data Binding
// @visibility external
//<


isc.ClassFactory.defineClass("ResultSet", null, ["List", "DataModel"]);

isc.ResultSet.addClassProperties({
    // Value returned from resultSet.getLength() if the length of the resultSet is not
    // yet known (because we're still fetching data from the server).  Note that the correct
    // way to check for this is resultSet.lengthIsKnown(), not checking for this constant,
    // which could fail.
    UNKNOWN_LENGTH : 1000,
    
    

    
    _simpleProperties: [
        "fetchAhead", "fetchMode", "resultSize", "fetchDelay", "dataSource",
        "criteriaPolicy", "useClientSorting", "useClientFiltering",
        "updateCacheFromRequest", "dropCacheOnUpdate", "dropCacheOnLengthChange",
        "disableCacheSync", "progressiveLoading", "shouldReorderAllRows",
        "neverDropUpdatedRows", "updatePartialCache", "transformUpdateResponses"]
});

isc.ResultSet.addClassMethods({

//> @classMethod resultSet.getLoadingMarker()
// Return the singleton marker object that is used as a placeholder for records that are being
// loaded from the server.
// @return (String) the loading marker
// @visibility external
//<
getLoadingMarker : function () {
    return Array.LOADING;
},

//> @classMethod resultSet._removeNullsAndLoadings()
// This method splices out the sections of the input array that are null, undefined, or are
// equal to the +link{resultSet.getLoadingMarker(),loading marker}.
// @param (Array of Any) the input array
// @visibility internal
//<
_removeNullsAndLoadings : function (arr) {
    var i = 0, n = 0, len = arr.length,
        loadingMarker = Array.LOADING;

    for (; i < len; ++i) {
        var a = arr[i];
        if (a == null || a === loadingMarker) {
            ++n;
        } else if (n > 0) {
            arr.splice(i - n, n);
            i -= n;
            len -= n;
            n = 0;
        }
    }
    if (n > 0) {
        arr.splice(i - n, n);
    }
    return arr;
},

_prepareSparseData : function (data) {
    var loadingMarker = Array.LOADING,
        onlyLoading = true;
    for (var i = data.length; i--; ) {
        if (data[i] == loadingMarker) {
            data[i] = null;
        } else {
            onlyLoading = false;
        }
    }
    return onlyLoading;
}

});

isc.ResultSet.addProperties({

    // Modification APis - only a fetchData:"local" RS can be modifiable
	// ----------------------------------------------------------------------------------------

    _canModify : function (warn) {
        return this.modifiable && this.fetchMode == "local" && this.getDataSource() &&
            this.shouldUseClientFiltering() && this.allRows != null && this.localData != null;
    },

    _warnModify : function (methodName) {
        isc.logWarn(methodName + "(): ResultSets are not modifiable unless filtering data " +
                    "locally due to fetchMode:'local' - not modified");
    },

    findIndexInCache : function (record, cacheData) {
        if (cacheData != null) {
            var ds = this.getDataSource(),
                pk = ds && ds.getPrimaryKeyFieldName();

            // Look up the record by primary key if possible.
            // This ensures that 
            // If we're bound to a DataSource with no specified primary key, do a simple
            // look-up by object identity.
            // This is valid for the case where a dev has explicitly specified the cache data
            // on the client (as in the FilteredList class)
            if (pk == null) {
                var index = cacheData.indexOf(record);
                return index;
            } else {
                var index = ds.findByKeys(record, cacheData);
                return index;
            }
        }
    },
    
    addAt : function(obj, pos) {
        if (!this._canModify()) return this._warnModify("addAt");

        if (obj == null) {
            this.logWarn("addAt(): you must spply a valid record");
            return;
        }
        // by default adds at start
        if (pos == null) pos = 0;

	    if (!isc.isA.Number(pos) || pos < 0) {
            this.logWarn("addAt(): Invalid position " + pos);
            return;
        }
        

        
        var ds = this.getDataSource(),
            cacheIndex = this.findIndexInCache(obj, this.allRows);
        if (cacheIndex >= 0) {
            this.logWarn("addAt(): cannot add " + isc.echo(obj) + " as the ResultSet already " +
                         "contains " +
                         (ds.getPrimaryKeyFieldName() != null ? 
                            "another record with the same primary key values" :
                            "this object."));
            return;
        }

        // find the record at pos in localData in allRows and add obj before it
        var localData = this.localData,
            allRows = this.allRows;
        if (allRows != localData) {
            var cacheIndex;
            if (pos == this.getLength()) {
                cacheIndex = allRows.length;
            } else {
                var posRecord = localData[pos];
                cacheIndex = this.findIndexInCache(posRecord, allRows);
            }
            
            allRows.addAt(obj, cacheIndex);
        }

        var criteria = this.allRowsCriteria,
            iCrit = this.getImplicitCriteria();
        if (iCrit) criteria = ds.combineCriteria(criteria, iCrit);

        // if the new obj passes the filter, add it to localData and notify of "add"
        var matchesFilter = this.applyFilter([obj], criteria, this.context).length > 0;
        if (matchesFilter) {
            localData.addAt(obj, pos);
            this.dataChanged("add", obj, pos);
        }
        
        // if we're sorted, we've got to resort localData
        if (this.canSortOnClient()) this._doSort();

        return obj;
    },

    set : function(pos, obj) {
        if (!this._canModify()) return this._warnModify("set");

        if (obj == null) {
            this.logWarn("set(): you must spply a valid record");
            return;
        }
            
	    if (!isc.isA.Number(pos) || pos < 0) {
            this.logWarn("set(): Invalid position " + pos);
            return;
        }
        

        // find the record at pos in localData in allRows and replace it with obj
        var ds = this.getDataSource(),
            localData = this.localData,
            oldRecord = localData[pos],
            allRows = this.allRows;
        if (allRows != localData) {
            var cacheIndex = this.findIndexInCache(oldRecord, allRows);
            
            allRows.set(cacheIndex, obj);
        }
        
        var criteria = this.allRowsCriteria,
            iCrit = this.getImplicitCriteria();
        if (iCrit) criteria = ds.combineCriteria(criteria, iCrit);

        // determine whether this is an "update" or "replace", and whether obj passes filter
        var operation = this.findIndexInCache(obj, localData) == pos ? "update" : "replace",
            matchesFilter = this.applyFilter([obj], criteria, this.context).length > 0;
        if (!matchesFilter && this.shouldNeverDropUpdatedRows() && operation == "update") {
            matchesFilter = true;
        }

        // if obj passes the filter, replace record at pos in localData; otherwise remove it
        if (matchesFilter) {
            localData.set(pos, obj);
        } else {
            localData.removeAt(pos);
        }

        // notify of "replace" or "update" operation, passing obj if it passes the filter
        this.dataChanged(operation, matchesFilter ? obj : null, pos);

        // if we're sorted, we've got to resort localData
        if (this.canSortOnClient()) this._doSort();

        return oldRecord;
    },

    removeAt : function (pos) {
        if (!this._canModify()) return this._warnModify("removeAt");

	    if (!isc.isA.Number(pos) || pos < 0) {
            this.logWarn("removeAt(): Invalid position " + pos);
            return;
        }
        

        var localData = this.localData,
            record = localData[pos];
        if (record == null) {
            this.logWarn("removeAt(): No valid record at position " + pos + " to remove");
            return;
        }
        
        // find the record at pos in localData in allRows and remove it
        var allRows = this.allRows;
        if (allRows != localData) {
            var cacheIndex = this.findIndexInCache(record, allRows);
            
            allRows.removeAt(cacheIndex);
        }

        // if pos is valid, remove record from localData and
        localData.removeAt(pos);

        // notify of "remove" operation
        this.dataChanged("remove", record, pos);

        return record;
    },
    
	//localData : null, // the cache of rows
	//totalRows : isc.ResultSet.UNKNOWN_LENGTH, // total number of rows in the filtered results
	cachedRows : 0, // numbers of rows we have cached

    // Fetching
	// ----------------------------------------------------------------------------------------

    // whether to fetch rows beyond those requested
	fetchAhead : true,

	//>	@type	FetchMode
    // Mode of fetching records from the server.
    // <P>
    // Generally, "paged" mode should be used unless the maximum number of records is
    // guaranteed to be small.
    //
    // @value "basic" All records that match the current filter are fetched.  Sorting is
    //                performed on the client.
    // @value "paged" Only requested ranges of records are fetched, with predictive fetch
    //                ahead.  Sorting is performed on the server.
    // @value "local" All records available from the DataSource are fetched.  Filtering by
    //                search criteria and sorting are both performed on the client.
    // @group fetching
	// @visibility external
    //<

    //> @attr resultSet.fetchMode (FetchMode : null : IRA)
    // Mode of fetching records from the server. If unset, will default to <code>"local"</code>
    // if +link{resultSet.allRows} is specified, otherwise <code>"paged"</code>.
    //
    // @see type:FetchMode
    // @group fetching
    // @visibility external
    //<
    //fetchMode : "paged",

    //> @attr resultSet.modifiable (boolean : false : IRW)
    // When true, allows the ResultSet to be modified by list APIs +link{list.addAt()},
    // +link{list.set()}, and +link{list.removeAt()}.  Only applies to 
    // +link{resultSet.fetchMode,fetchMode}:"local" ResultSets, since in all other cases, such
    // modifications would break the consistency of server and client row numbering needed for
    // data paging, and also create some issues with automatic cache synchronization.  See the
    // "Modifying ResultSets" subtopic in the +link{ResultSet,ResultSet Overview} for the
    // alternative approach of updating the +link{DataSource}.
    // <P>
    // One known case where modification can be useful is when an array has been passed to
    // +link{listGrid.setData()} for a ListGrid with +link{listGrid.filterLocalData}:true.  If
    // the data is filtered using the +link{listGrid.showFilterEditor,filterEditor}, then a new
    // local ResultSet will be created as +link{listGrid.data,data} to reflect the filtering.
    // @group cacheSync
    // @see dataSource.addData()
    // @see dataSource.removeData()
    // @see dataSource.updateCaches()
    // @visibility external
    //<

    //> @attr resultSet.initialData (Array of Record : null : IA)
    // Initial set of data for the ResultSet.
    // <P>
    // This data will be treated exactly as though it were the data returned from the
    // ResultSet's first server fetch.
    // <P>
    // By default, <code>initialData</code> will be considered a complete response
    // (all rows that match the +link{criteria} which the ResultSet was initialized with).
    // <P>
    // Set +link{initialLength} to treat <code>initialData</code> as a partial response,
    // equivalent to receiving a +link{DSResponse} with <code>startRow:0</code>,
    // <code>endRow:initialData.length</code> and <code>totalRows:initialLength</code>.
    // Normal data paging will then occur if data is requested for row indices not filled via 
    // <code>initialData</code>.
    // <P>
    // <code>initialData</code> may be provided as a "sparse" array, that is, slots may be left
    // null indicating rows that have not been loaded.  In this way you can create a ResultSet
    // that is missing rows at the beginning of the dataset, but has loaded rows toward the end,
    // so that you can create a component that is scrolled to a particular position of a dataset
    // without loading rows at the beginning.
    // <P>
    // To keep the logic simple and support partial <code>initialData</code>, the data is
    // assumed to be already sorted and filtered according to the +link{sortSpecifiers} and
    // +link{resultSet.criteria} supplied to the ResultSet, since otherwise, for partial
    // <code>initialData</code>, sorting or filtering would immediately cause the data to be
    // discarded.
    // <P>
    // If <code>initialData</code> is complete and needs to be sorted or filtered, then don't
    // pass the +link{sortSpecifiers} or +link{resultSet.criteria}, respectively, when creating
    // the ResultSet.  Instead, call +link{setCriteria()} or +link{setSort()}, respectively, on
    // the instance afterwards.
    // @see resultSet.fetchMode
    // @see useClientFiltering
    // @group fetching, cacheSync
    // @visibility external
    //<

    //> @attr resultSet.initialLength (Integer : null : IA)
    // Initial value of the data set length.
    // <P>
    // To create a ResultSet with it's cache partly filled, see +link{initialData}.
    //
    // @group fetching, cacheSync
    // @visibility external
    //<
    
    //> @attr resultSet.sortSpecifiers (Array of SortSpecifier : null : IA)
    // Initial sort specifiers for a ResultSet. Use +link{resultSet.setSort()} and 
    // +link{resultSet.getSort()} to sort the data after initialization rather than
    // attempting to read or modify this property directly.
    // <P>
    // Note: if +link{resultSet.initialData} was specified, the data is assumed to already
    // be sorted to match this sort configuration.
    // @group fetching, cacheSync
    // @visibility external
    //<

    //> @attr resultSet.allRows (Array of Record : null : IRA)
    // If the complete set of records for a resultSet is available when the resultSet is created,
    // it can be made available to the resultSet via this property at initialization time.
    // This data will then be considered cached meaning sorting and filtering can occur on
    // the client (no need for server fetch).
    // <p>
    // This cached data can be dropped via a call to +link{resultSet.invalidateCache()}.
    // <p>
    // See also +link{initialData} and +link{initialLength} as an alternative approach for
    // initializing a ResultSet with a partial cache, such that data paging will occur as
    // uncached rows are requested.
    // <P>
    // Note that developers wishing to synchronously access a filtered set of client side data
    // may wish to consider creating a +link{FilteredList}.
    // 
    // @group fetching, cacheSync
    // @visibility external
    //<

    //> @attr resultSet.resultSize (Integer : 75 : IRWA)
    // How many rows to retrieve at once.
    // <P>
    // Applicable only with <code>fetchMode: "paged"</code>.  When a paged ResultSet is asked
    // for rows that have not yet been loaded, it will fetch adjacent rows that are likely to
    // be required soon, in batches of this size.
    //
    // @group fetching
    // @visibility external
    //<
	resultSize : 75,

    //> @attr resultSet.fetchDelay (Integer : 0 : IRWA)
    // Delay in milliseconds before fetching rows.
    // <P>
    // When a get() or getRange() call asked for rows that haven't been loaded, the
    // ResultSet will wait before actually triggering the request.  If, during the delay, more
    // get() or getRange() calls are made for missing rows, the final fetch to the server will
    // reflect the most recently requested rows.
    // <P>
    // The intent of this delay is to avoid triggering many unnecessary fetches during
    // drag-scrolling and similar user interactions.
    //
    // @group fetching
    // @visibility external
    //<
	fetchDelay : 0,

    // DataModel
	// ---------------------------------------------------------------------------------------
    //> @attr resultSet.dataSource (DataSource : null : IR)
    //  What +link{class:DataSource} is this resultSet associated with?
    // @include dataBoundComponent.dataSource
    // @visibility external
    //<

    //> @attr resultSet.fetchOperation (String : null : IR)
    // The +link{dsRequest.operationId,operationId} this ResultSet should use when performing
    // fetch operations.
    // <P>
    // <b>Note:</b> if this property is not explicitly set and, for ResultSets automatically
    // created by a component, +link{dataBoundComponent.fetchOperation} is also unset, a
    // placeholder value of &lt;dataSourceId&gt;_&lt;operationType&gt; may be reported
    // (e.g. "supplyItem_fetch").
    // @visibility external
    //<

    //> @attr resultSet.context (DSRequest Properties : null : IRA)
    // Request properties for all operations performed by this ResultSet
    //<

    //> @attr resultSet.requestProperties (DSRequest Properties : null : IR)
    // Allows to set a DSRequest properties to this ResulSet.
    // @visibility external
    //<

    //> @type CriteriaPolicy
    // @value "dropOnChange"        Cache is dropped whenever criteria changes.
    // @value "dropOnShortening"    Cache is retained as long as the only changes to criteria
    //                              make the criteria more restrictive as determined by
    //                              +link{ResultSet.compareCriteria()}.
    // @visibility external
    //<
    
    //> @attr resultSet.implicitCriteria (Criteria : null : IRW)
    // Criteria that are never shown to or edited by the user and are cumulative with any 
    // criteria provided via +link{dataBoundComponent.initialCriteria}, +link{resultSet.setCriteria}
    // etc.
    // @visibility external
    //<

    //> @method resultSet.getImplicitCriteria()
    // Returns any implicitCriteria applied to +link{resultSet.implicitCriteria, this ResultSet} 
    // or its +link{dataBoundComponent.implicitCriteria, parent component}.
    // @return (Criteria | AdvancedCriteria) combined implicitCriteria
    // @visibility internal
    //<
    getImplicitCriteria : function () {
        if (!this.implicitCriteria && !this.dbcImplicitCriteria) return null;
        var crit = isc.DS.compressNestedCriteria(this.getDataSource().combineCriteria(
            isc.DS.copyCriteria(this.dbcImplicitCriteria), 
            isc.DS.copyCriteria(this.implicitCriteria)
        ));
        if (!crit) return null;
        var comp = isc.Canvas.getById(this.context.componentId);
        if (comp) crit = comp.resolveDynamicCriteria(crit, "implicitCriteria");
        return crit;
    },

    setDbcImplicitCriteria : function (dbcImplicitCriteria, callback) {
        this.lastImplicitCriteria = !this.dbcImplicitCriteria ? null :
                isc.DS.copyCriteria(this.dbcImplicitCriteria);
        // store the dbcImplicitCriteria
        this.dbcImplicitCriteria = dbcImplicitCriteria;

        // update the context
        if (this.context) {
            this.context.lastImplicitCriteria = isc.DS.copyCriteria(this.lastImplicitCriteria);
            this.context.dbcImplicitCriteria = isc.DS.copyCriteria(this.dbcImplicitCriteria);
            if (callback) this.context.afterFlowCallback = callback;
        }

        // call setCriteria(current criteria) to re-evaluate the combined implicit/explicit crit
        return this.setCriteria(this.criteria);
    },

    //> @attr resultSet.criteria (Criteria : null : IRW)
    // Filter criteria used whenever records are retrieved.
    // <P>
    // Use +link{setCriteria()} to change the criteria after initialization.
    // @visibility external
    //<
    
    //> @attr resultSet.criteriaPolicy (CriteriaPolicy : null : IRWA)
    // Decides under what conditions the cache should be dropped when the +link{criteria}
    // changes.
    // @see criteria
    // @see dataSource.criteriaPolicy
    // @visibility external
    //<

    // Local Operations
	// ----------------------------------------------------------------------------------------

    //> @attr resultSet.useClientSorting (boolean : true : IRWA)
    // Whether to sort data locally when all records matching the current criteria have been
    // cached.
    // <P>
    // This may need to be disabled if client-side sort order differs from server-side sort
    // order in a way that affects functionality or is surprising.
    // 
    // @visibility external
    //<
    useClientSorting: true,
    shouldUseClientSorting : function () {
        //>Offline
        if (!isc.RPCManager.onLine) return true;
        //<Offline
        return this.useClientSorting;
    },    

    //> @attr resultSet.useClientFiltering (boolean : true : IRWA)
    // Whether to filter data locally when we have a complete cache of all DataSource records 
    // for the current criteria, and the user further restricts the criteria (see 
    // +link{DataSource.compareCriteria}).
    // <P>
    // This may need to be disabled if client-side filtering differs from server-side filtering
    // in a way that affects functionality or is surprising.
    // <p>
    // Note that you can also prevent client-side filtering for certain fields, by setting them
    // to +link{DataSourceField.filterOn, filterOn: 'serverOnly'}.
    // <P>
    // This setting is distinct from <code>fetchMode:"local"</code>, which explicitly loads all
    // available DataSource records up front and always performs all filtering on the client.
    // <P>
    // See +link{resultSet.applyFilter()} for default filtering behavior.
    // <P>
    // <b>NOTE:</b> even with useClientFiltering false, client-side filtering will be used
    // during cache sync to determine if an updated or added row matches the current criteria.
    // To avoid relying on client-side filtering in this case, either:<br>
    // - avoid returning update data when the updated row doesn't match the current filter<br>
    // - set dropCacheOnUpdate<br>
    //
    // @visibility external
    //<
    useClientFiltering:true,
    shouldUseClientFiltering : function () {
        //>Offline
        if (!isc.RPCManager.onLine) return true;
        //<Offline
        return this.useClientFiltering;
    },

    // Caching
	// ----------------------------------------------------------------------------------------

    //> @attr resultSet.updateCacheFromRequest (boolean : true : IRA) 
    // When a successful Add, Update or Remove type operation fires on this ResultSet's 
    // dataSource, if +link{dsResponse.data} is unset, should we integrate the submitted
    // data values (from the request) into our data-set? This attribute will be passed to
    // +link{dataSource.getUpdatedData()} as the <code>useDataFromRequest</code> parameter.
    //
    // @group cacheSync
    // @visibility external
    //<
    updateCacheFromRequest:true,
    
    //> @attr resultSet.dropCacheOnUpdate (boolean : false : IRA)
    // Whether to discard all cached rows when a modification operation (add, update, remove)
    // occurs on the ResultSet's DataSource.
    // <P>
    // A ResultSet that has a complete cache for the current filter criteria can potentially
    // incorporate a newly created or updated row based on the data that the server returns
    // when a modification operation completes.  However this is not always possible for
    // ResultSets that show some types of joins, or when the server cannot easily return update
    // data.  In this case set <code>dropCacheOnUpdate</code> to cause the cache to be
    // discarded when an update occurs.
    // <P>
    // <code>dropCacheOnUpdate</code> can be set either directly on a ResultSet, or on a
    // DataSource in order to affect all ResultSets on that DataSource.
    //
    // @group cacheSync
    // @visibility external
    //<

    //> @attr resultSet.dropCacheOnLengthChange (boolean : true : IRA)
    // Whether to discard all cached rows when the server reports a change in the number of
    // total rows.
    // @group cacheSync
    // @visibility internal
    //<
    // Not yet implemented:
    // <P>
    // This works as a simple form of cache staleness detection if the server is not capable of
    // supporting the more sophisticated <code>cacheTimestamp</code> mechanism.
    //
    // @see attr dsResponse.cacheTimestamp
    
    //> @attr   resultSet.disableCacheSync (boolean : false : IRA)
    // By default when the data of this ResultSet's dataSource is modified, the ResultSet will
    // be updated to display these changes.
    // Set this flag to true to disable this behavior.
    // @group cacheSync
    // @visibility external
    //<
    // Note: This can be set to false after init, but if already false, setting to true would
    // lead to unpredictable results as we'd be attempting to integrate changes into a possibly
    // out of date cache
    
	
    //> @attr resultSet.progressiveLoading (boolean : null : IRW)
    // Sets +link{DataSource.progressiveLoading,progressive loading mode} for this ResultSet.
    // Any +link{DSRequest}s issued by this ResultSet will copy this setting onto the request,
    // overriding the OperationBinding- and DataSource-level settings.
    // <p>
    // This setting is applied automatically by +link{DataBoundComponent}s that have their 
    // own explicit setting for +link{DataBoundComponent.progressiveLoading,progressiveLoading}
    //
    // @see dataSource.progressiveLoading
    // @see operationBinding.progressiveLoading
    // @see dsRequest.progressiveLoading
    // @see dataBoundComponent.progressiveLoading
	// @group progressiveLoading
    // @visibility external
    //<
    
    //> @attr resultSet.rememberDynamicProgressiveLoading (boolean : true : IRW)
    // If +link{resultSet.progressiveLoading} is not explicitly set, but the resultset
    // recieves a response from the server where +link{dsResponse.progressiveLoading} is 
    // set to true, should subsequent requests for other rows in the same data set explicitly
    // request progressiveLoading via +link{dsRequest.progressiveLoading}, as long as
    // the criteria are unchanged and the cache is not explicitly invalidated?
    // <P>
    // This property is useful for the case where the server side 
    // +link{DataSource.progressiveLoadingThreshold} enabled progressive loading after
    // the row-count query determined that the requested data set was very large.
    // By explicitly +link{dsRequest.progressiveLoading,requesting progressive loading}
    // for subsequent fetches the server is able to avoid an unnecessary and potentially
    // expensive row-count query while returning other rows from the same data set.
    //
    // @group progresiveLoading
    // @visibility external
    //<
    rememberDynamicProgressiveLoading:true,
    // Helper to return desired dsRequest.progressiveLoading value
    _requestProgressiveLoading : function () {
        var progressiveLoading = this.progressiveLoading;
        if (progressiveLoading == null) {
            progressiveLoading = this._dynamicProgressiveLoading;
        }
        return progressiveLoading;
    },

    //> @attr resultSet.shouldReorderAllRows (boolean : true : IRW)
    // When true, apply ordering changes that occur in +link{resultSet.localData}
    // to the cache of records +link{resultSet.allRows}, so that events which
    // cause a refresh from the cache don't destroy an ordering applied to 
    // +link{resultSet.localData}.  Only has an impact if +link{resultSet.allRowsCached()}
    // returns true since that's when +link{result.allRows} is a meaningful cache.
    //<
    shouldReorderAllRows: true,

    //> @attr   resultSet.neverDropUpdatedRows (boolean : false : IRA)
    // By default when a row is returned by the server, the current +link{setCriteria,filter
    // criteria} are applied to it, and it may disappear from the cache.
    // <P>
    // Set this flag to true to disable this behavior.
    // @group cacheSync
    // @visibility external
    //<
    shouldNeverDropUpdatedRows : function () {
        //>Offline
        if (!isc.RPCManager.onLine) return true;
        //<Offline
        return this.neverDropUpdatedRows;
    },

    //> @attr   resultSet.updatePartialCache (boolean : true : IRA)
    // If set to true, updated and added rows will be integrated into the client-side cache
    // even if paging is enabled and cache is partial.  If <code>updatePartialCache</code> is
    // false, the cache will be invalidated and new data fetched.
    // <P>
    // If updatePartialCache is enabled and an "add" or "update" operation succeeds with a partial
    // cache:
    // <ul>
    // <li> updated rows will remain in their current position.  No attempt will be made to sort
    // them into a new position even if the sort field was updated.
    // <li> newly added rows will be added at either the end (first preference) or beginning of
    // the dataset if that part of the dataset is cached and was most recently requested.
    // If not, the new row is added at the end of the most recently requested contiguously
    // cached range.
    // </ul>
    // The cache will then be dropped the next time rows are fetched, to prevent problems with
    // inconsistent row numbering between the server and client, which could otherwise lead to
    // duplicate rows or rows being skipped entirely.
    //
    // @group cacheSync
    // @visibility external
    //<
    
    updatePartialCache:true,
    shouldUpdatePartialCache : function () {
        //>Offline
        if (!isc.RPCManager.onLine) return true;
        //<Offline
        return this.updatePartialCache;
    },

    //> @attr   resultSet.transformUpdateResponses (boolean : null : IRA)
    // If true (or null), passes the record(s) returned by an update, add or remove operation
    // through the +link{transformData(),transformData() method}, if one is defined.  If this 
    // property is set to false, transformData() is bypassed.
    // <P>
    // Generally, you will want to transform update responses.  This property is provided for 
    // reasons of backwards compatibility.
    // @group cacheSync
    // @visibility internal
    //<

    //> @attr   resultSet.alwaysRequestVisibleRows (boolean : false : IRA)
    // If true, records requested only for visible area.
    // @visibility external
    //<
    alwaysRequestVisibleRows: false
});

isc.ResultSet.addMethods({

init : function () {

	// get a global ID so we can be called in the global scope
	isc.ClassFactory.addGlobalID(this);
    //>!BackCompat 2004.7.30
    // custom operation for fetching passed in as just "operation"
    if (this.operation != null) this.fetchOperation = this.operation;
    //<!BackCompat

    // get the fetchOperation since several ResultSet-related settings are legal on it.
    
    var fetchOperation = this.getOperation("fetch");
    // if fetchOperation is an explicitly defined operation, operation.dataSource may be a list
    // of DataSources
    var dsNames = fetchOperation.dataSource;
    if (!isc.isAn.Array(dsNames)) dsNames = [dsNames];
    for (var i = 0; i < dsNames.length; i++) {
        var ds = isc.DS.get(dsNames[i]);
        // observe dataChanged for cache synch
        this.observe(ds, "dataChanged", "observer.dataSourceDataChanged(dsRequest,dsResponse)");

        // keep track of the datasources we've registered with so we can deregister on destroy()
        if (!this._registeredDS) this._registeredDS = [];
        this._registeredDS.add(ds);

        // support automatically deriving the DataSource from the operation (take the first
        // DataSource listed if more than one)
        if (!this.dataSource) this.dataSource = ds;
    }

    if (!this.getDataSource()) {
        this.logError("Invalid dataSource: " + this.echoLeaf(this.dataSource) + 
                      ", a ResultSet must be created with a valid DataSource");
    }

	// context.dataPageSize may be set if specified on a DataBoundComponent that created us
    this.context = isc.addProperties({}, this.context, this.requestProperties);
    var context = this.context;
    this.resultSize = context && context.dataPageSize > 0 ?
                                 context.dataPageSize : this.resultSize;

    if (this.allRows) {
        // complete dataset provided, use local filter and sort
        this.fetchMode = "local";
    } else {
        // respect component settings, defaulting to paged
        this.fetchMode = (context && context.dataFetchMode != null ?
                          context.dataFetchMode : this.fetchMode || "paged");
    }

    // whether to invalidate our cache when an update occurs on one of our datasources.
    // Default is update the current cache in place.
    if (this.dropCacheOnUpdate == null) {
        this.dropCacheOnUpdate = this._firstNonNull(fetchOperation.dropCacheOnUpdate,
                                                    this.getDataSource().dropCacheOnUpdate);
    }

	this.context = this.context || {};



    
    
    this._loadingRanges = [];

    // backcompat for old name for criteria: "filter"
    var newCriteria = this.criteria || this.filter || {};

    if (this._duplicatingResultSet) {
        
        this.criteria = newCriteria;
        this._emptyCriteria = (isc.getKeys(newCriteria).length == 0);
    } else {
        // Calling setCriteria() will set up this.criteria and call this.filterLocalData() if
        // we were seeded with 'allRows' (causing this.localData to get set up).
        this.criteria = null;
        this.setCriteria(newCriteria);
    }

    // support for seeding a ResultSet with data on init
    if (this.initialData) {
        isc.ResultSet._prepareSparseData(this.initialData);
        this.fillCacheData(this.initialData);
        this.setFullLength(this.initialLength || this.totalRows || this.initialData.length);
        // allow an initial sort direction to specified (in either format)
        if (this.sortSpecifiers) this.setSort(this.sortSpecifiers, true);
        if (this.sortBy) this.setSort(isc.DS.getSortSpecifiers(this.sortBy), true);
    } else if (this.isPaged()) {
        this._setLocalData([]);
    }


    //>Offline
    this.observe(isc, "goOffline", function () {
        this.goOffline();
    });
    this.observe(isc.RPCManager, "offlineTransactionPlaybackComplete", function () {
        this.offlinePlaybackComplete();
    });
    //<Offline
},

//>Offline
goOffline : function () {

},

offlinePlaybackComplete : function () {
    if (this.haveOfflineRecords) {
        this.invalidateCache();
        this.haveOfflineRecords = false;
    }
},
//<Offline

// de-register from related DataSources on destroy() to prevent leaks
destroy : function () {

    this.cancelRowCountFetch();

    //>Offline
    this.ignore(isc, "goOffline");
    this.ignore(isc.RPCManager, "offlineTransactionPlaybackComplete");
    //<Offline

    if (this._registeredDS != null) {
        for (var i = 0; i < this._registeredDS.length; i++) {
            var ds = this._registeredDS[i];
            if (ds) {
                // clear up observations
                this.ignore(ds, "dataChanged");
            }
        }
    }

    // clear our global ID (removes the window.ID pointer to us)
    isc.ClassFactory.dereferenceGlobalID(this);

    this.Super("destroy", arguments);
    this.destroyed = true;
},

// This method is used by GridRenderer.
getFirstUsedIndex : function () {
    if (!this.lengthIsKnown()) {
        // We're in the middle of loading data.
        return 0;
    } else {
        
        var localData = this.localData,
            loadingRanges = this._loadingRanges,
            numLoadingRanges = loadingRanges.length,
            k = this._getLoadingRangesIndex(0),
            isNotLoading = (k % 2 != 0),
            j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
        for (var i = 0, localDataLength = localData.length; i < localDataLength; ++i) {
            if (i == j) {
                isNotLoading = !isNotLoading;
                j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
            }
            if (localData[i] != null && isNotLoading) {
                return i;
            }
        }
        return 0;
    }
},

isPaged : function () { return this.fetchMode == "paged" },
isBasic : function () { return this.fetchMode == "basic" },
isLocal : function () { return this.fetchMode == "local" },

//> @method ResultSet.allMatchingRowsCached() [A]
// Do we have a complete client-side cache of records for the current filter criteria?
// <P>
// Returns <code>false</code> if this is a paged data set, and the entire set of records that
// match the current criteria has not been retrieved from the server. In other words, a
// return value of <code>false</code> means that this <code>ResultSet</code> has a partial cache.
//
// @return (boolean) whether all matching rows are cached
// @visibility external
//<

allMatchingRowsCached : function (skipLengthIsKnown) {
    
    return (this.allRows != null && (!this.allRowsCriteria || this._emptyAllRowsCriteria)) ||
            ((skipLengthIsKnown ? this.localData != null : this.lengthIsKnown()) &&
            (!this.isPaged() || 
             
             (this.allRows != null || (this.cachedRows == this.totalRows))));
},

//> @method ResultSet.allRowsCached() [A]
// Do we have a complete client-side cache of all records for this DataSource?
// <P>
// Becomes true only when the ResultSet obtains a complete cache after a fetch with empty
// criteria.
//
// @return (boolean) whether all rows are cached
//
// @visibility external
//<

allRowsCached : function (emptyCriteria) {
    if (emptyCriteria == null) emptyCriteria = this._emptyCriteria;
    return (
            // - in fetchMode:"local" (load all data up front), data has been successfully
            //   loaded
            
            (this.allRows != null && (!this.allRowsCriteria || this._emptyAllRowsCriteria)) 
            || 
            // - in other modes, we've detected emptyCriteria and full cache
            (this.allMatchingRowsCached() && emptyCriteria)
        );
},
isEmpty : function () {
    if (this.isPaged()) {
        // If there's a full cache for the current filter criteria, check the length of the data
        if (this.allMatchingRowsCached()) {
            return this.getLength() == 0;
        // For a paged dataSet, the cachedRows attribute indicates we have successfully 
        // fetched rows from the server (so this is non empty)
        } else if (this.cachedRows > 0) return false;
    }
    
    return !this.lengthIsKnown() || this.getLength() <= 0;
},
canSortOnClient : function () { 
    return this.shouldUseClientSorting() && (this.allMatchingRowsCached()||
					(isc.Offline && isc.Offline.isOffline())); 
},
canFilterOnClient : function () { return this.shouldUseClientFiltering() && this.allRowsCached() },

//> @method resultSet.getValueMap()
// Get a map of the form <code>{ item[idField] -&gt; item[displayField] }</code>, for all 
// items in the list.  If more than one item has the same <code>idProperty</code>, 
// the value for the later item in the list will clobber the value for the earlier item.
// <P>
// If this method is called when the +link{allMatchingRowsCached(),cache is incomplete}, it
// will trigger fetches, and will return a valueMap reflecting only the currently loaded rows.
//
// @param idField (String)  Property to use as ID (data value) in the valueMap
// @param displayField (String) Property to use as a display value in the valueMap
// @return (Object) valueMap object
// @see resultSet.allMatchingRowsCached()
// @visibility external
//<
// picked up as part of the list interface


// List API
// --------------------------------------------------------------------------------------------

//> @method resultSet.getLength()
// Return the total number of records that match the current filter criteria.
// <P>
// This length can only be known, even approximately, when the first results are retrieved from
// the server.  Before then, the ResultSet returns a large length in order to encourage viewers
// to ask for rows.  +link{lengthIsKnown(),ResultSet.lengthIsKnown()} can be called to
// determine whether an actual length is known.
// <P>
// Note that if +link{dataSource.progressiveLoading,progressive loading} is active, the length
// advertised by the server may not be an accurate total row count for the data set.
// +link{lengthIsProgressive(),ResultSet.lengthIsProgressive()}
// can be called to determine whether this is the case.
//
// @include List.getLength()
// @visibility external
//<

getLength : function () {

    var unknownLength = this.unknownLength || isc.ResultSet.UNKNOWN_LENGTH;
    if (!this.lengthIsKnown()) return unknownLength;
    // NOTE: when paged, if we obtain a full cache with empty criteria, we set allRows to the
    // full cache and go into local filtering mode (if enabled).  From then on, totalRows,
    // normally set based on server responses, is no longer up to date.
    return (this.isPaged() && !this.allRows ? this.totalRows
                                            : this.localData.length);
},

_getCachedLength : function () {
    if (this.lengthIsKnown()) {
        return this.getLength();
    } else if (this.localData != null) {
        return this.localData.length;
    } else {
        return 0;
    }
},


_getCachedRows : function () {
    return this.cachedRows;
},

//> @method resultSet.indexOf()
// Return the position in the list of the first instance of the specified object.
// <p>
// If pos is specified, starts looking after that position.
// <p>
// Returns -1 if not found.
// <p>
// <b>NOTE:</b> ResultSet.indexOf() only inspects the current cache of records, so it is only
// appropriate for temporary presentation purposes.  For example, it would not be appropriate
// to hold onto a record and attempt to use indexOf() to determine if it had been deleted.
//
// @include List.indexOf()
//<
indexOf : function (item, pos, endPos) {
    if (this.localData == null) return -1;

    // ignore LOADING rows
    if (Array.isLoading(item)) return -1;

    var index = this.localData.fastIndexOf(item, pos, endPos);
    
    if (index != -1) return index;

    // if not found, try lookup by primary key.  The caller has an object presumably previously
    // retrieved from this ResultSet, but because we drop cached rows in various circumstances,
    // the row may either have fallen out of cache (eg different sort order) or been replaced
    // by a new row with different object identity. 
    // NOTE: primarily this is called by Selection and selection-related code, because of it's
    // strategy of putting marker properties onto records.
	return this.getDataSource().findByKeys(item, this.localData, pos, endPos);
},


fastIndexOf : function (a, b, c, d) {
    return this.indexOf(a, b, c, d);
},

// implement slideList so that databound resultsets can be reordered.  
// Further enhancements include:
// - support unsort(): correctly manage the fact that our order temporarily doesn't reflect
//   current sort
// - support permanent stored orders: if our DS declares that some field represents a permanent
//   stored order, and we are currently sorted by that field, assume the user means to
//   permanently reorder the record, and save changed field numbers
slideList : function (selection, startIndex) { 
    if (!this.allMatchingRowsCached() && !this.shouldUpdatePartialCache()) {
        isc.logWarn('updatePartialCache is disabled: record position will not be shifted.');
        return;
    }
    var output = [], i;

    //if destination is negative, set to 0 
    if (startIndex < 0) startIndex = 0;

    // Find the index of the first loading row.
    var loadingRanges = this._loadingRanges,
        numLoadingRanges = loadingRanges.length,
        k = this._getLoadingRangesIndex(0),
        isLoading = (k % 2 == 0),
        j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);

    // take all the things from this table before destination that aren't in the list to be moved
    var localData = this.localData;
    for (i = 0; i < startIndex; ++i) {
        if (i == j) {
            isLoading = !isLoading;
            j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
        }
        var record = this.localData[i];

        // bail if we're sliding to/from a loading row
        if (record == null && isLoading) {
            isc.logWarn('Sliding from a row position that has not yet been loaded, ignoring');
            return;
        }
        if (!selection.contains(record)) {
            output.add(record);
        }
    }
    // now put in all the things to be moved
    for (i = 0; i < selection.length; ++i) {
        output.add(selection[i]);
    }
    // now put in all the things after destination that aren't in the list to be moved
    var localDataLength = localData.length;
    for (i = startIndex; i < localDataLength; ++i) {
        if (i == j) {
            isLoading = !isLoading;
            j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
        }
        var record = localData[i];

        if (record == null && isLoading) {
            isc.logWarn('Sliding into a row position that has not yet been loaded, ignoring');
            return;
        }
        if (!selection.contains(record)) {
            output.add(record);
        }
    }
    this._setLocalData(output);

    if (this.shouldUpdatePartialCache()) {
        this.invalidateRowOrder();    
    }

    // reorder allRows using localData if property is set
    if (this.shouldReorderAllRows) this.reorderAllRows();

    this.dataChanged();
},

// Rearranges allRows (complete cache of records loaded from the server) to match the ordering
// of the subset of rows that pass our current criteria (localData).  This allows ordering
// reflected in this.localData to persist across events that refresh localData from allRows.
reorderAllRows : function () {

    var i, localData = this.localData;

    if (!this.allRowsCached() || !this.lengthIsKnown()) return;

    

    // mark the records in this.localData for instant identification below
    for (i = 0; i < localData.length; i++) localData[i]._localDataIndex = i;

    // map the ordering from localData onto matching records in allRows
    var localDataIndex = 0,
        allRows = this.allRows,
        length = allRows.getLength();

    for (i = 0; i < length; i++) {
        var record = allRows.get(i);
        if (record._localDataIndex != null) {
            allRows.set(i, localData[localDataIndex++]);
            delete record._localDataIndex;
        }
    }
},

//> @method resultSet.get()
// Returns the record at the specified position.
// <P>
// All List access methods of the ResultSet have the semantics described in <code>getRange()</code>.
// @include list.get()
// @see getRange()
//<
get : function (pos) {
	if (!isc.isA.Number(pos) || pos < 0) {
		//>DEBUG
		this.logWarn("get: invalid index " + pos); 
		//<DEBUG
		return null;
	}

    // optimization: what getRange(pos, pos+1) would do, only we can do it faster: if the
    // requested row is non-null, it's either cached or loading, so return it
    if (this.localData != null) {
        var record = this.localData[pos];
        if (record != null) {
            return record;
        } else if (this._rowIsLoading(pos)) {
            return isc.ResultSet.getLoadingMarker();
        }
    }
    // if this request falls within the rows we are already planning to fetch, likewise return
    // the loading marker (we don't actually put the loading marker into this.localData until
    // the fetch request is sent to the server).
    
    if (this.fetchStartRow != null && pos >= this.fetchStartRow && pos <= this.fetchEndRow) {
        return Array.LOADING;
    }

	return this.getRange(pos, pos+1)[0];
},

//>	@method resultSet.getRange()
// Return the items between position start and end, non-inclusive at the end, possibly 
// containing markers for records that haven't loaded yet.
// <P>
// Calling getRange for records that have not yet loaded will trigger an asynchronous fetch.  The
// returned data will contain the +link{resultSet.getLoadingMarker(),loading marker} as a placeholder
// for records being fetched.  If any rows needed to be fetched, <code>dataArrived()</code> will
// fire when they arrive.
//
// @include list.getRange()
// @see classMethod:getLoadingMarker()
// @see dataArrived()
// @visibility external
//<
getRange : function (start, end, ignoreCache, fetchNow) {
    if (isc._traceMarkers) arguments.__this = this;
    
    // If end is null, assume its start+1 - just fetch the start row.
    if (start == null) {
        this.logWarn("getRange() called with no specified range - ignoring.");
        return;
    }
    if (end == null) end = start+1;
    
    if (this.isPaged()) {
        return this._getRangePaged(start, end, ignoreCache, fetchNow);
    }

	if (this.localData == null) {
        

        this._setLocalData([]);
        // fetch the entire data-set
        
        this.setRangeLoading(start, end);
        this._fetchAllRemoteData();
	}
    var range = this.localData.slice(start, end);

    // Add in loading markers where appropriate.
    var loadingMarker = isc.ResultSet.getLoadingMarker(),
        loadingRanges = this._loadingRanges,
        numLoadingRanges = loadingRanges.length,
        k = this._getLoadingRangesIndex(start),
        isLoading = (k % 2 == 0),
        j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
    for (var i = start; i < end; ++i) {
        if (i == j) {
            isLoading = !isLoading;
            j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
        }
        if (range[i] == null && isLoading) {
            range[i] = loadingMarker;
        }
    }
    return range;
},

// get the entire set of rows.  Will trigger loading of the entire dataset (minus fully cached
// ranges at the beginning/end)
getAllRows : function () {
    if (!this.lengthIsKnown()) return [];
    return this.getRange(0, this.getLength());
},

// get all rows that are loaded as single Array with no empty slots, even if the loaded rows are in
// several different ranges
getAllLoadedRows : function () {
    if (!this.lengthIsKnown()) return [];
    var rows = [];
    for (var i = 0; i < this.getLength(); i++) {
        if (this.rowIsLoaded(i)) rows.add(this.localData[i]);
    }
    return rows;
},

//> @method resultSet.getAllVisibleRows() [A]
// Returns all rows that match the current criteria.
// <P>
// This method will not trigger a fetch to load more records.  <code>getAllVisibleRows()</code>
// will return null if +link{lengthIsKnown()} is false.
// <P>
// Records are returned in a new List but the Records within it are the same
// instances that the ResultSet is holding onto.  Hence it's safe to add or remove records from
// the List without affecting the ResultSet but modifying the Records themselves is a direct
// modification of the client-side cache.
// @return (Array of Record) the records in the cache that match the current criteria,
// possibly null
// @visibility external
//<
getAllVisibleRows : function () {
    if (!this.lengthIsKnown()) {
        return null;
    } else {
        return isc.ResultSet._removeNullsAndLoadings(this.localData.duplicate());
    }
},

//> @method resultSet.usingFilteredData()
// Determine whether the ResultSet is showing a filtered, proper subset of the cached rows.
// This happens if +link{useClientFiltering,client filtering} is enabled.  Rows may have been
// loaded from the server when a more restrictive criteria is applied such that filtering could
// be performed on the client side.
// <P>
// This method returns false if data is not loaded yet.
// @return (boolean) true if the ResultSet is showing a filtered subset of the cached rows,
// false otherwise.
// @see resultSet.getAllCachedRows
// @visibility external
//<
usingFilteredData : function () {
    return (this.shouldUseClientFiltering() && 
            this.allMatchingRowsCached() && 
            this.localData && this.allRows && (this.localData.length < this.allRows.length));
},

//> @method resultSet.getAllCachedRows() [A]
// Returns a list of all rows that have been cached.  This is potentially a superset of all rows
// that are available via +link{getAllVisibleRows()} if the ResultSet is using client-side
// filtering to display a subset of loaded rows (see the +link{ResultSet,ResultSet overview}).
// <P>
// If +link{usingFilteredData()} returns false, this is the same list as would be returned by
// +link{getAllVisibleRows()}.
// <P>
// This method will not trigger a fetch to load more records.  getAllCachedRows() will return
// null if +link{lengthIsKnown()} is false.
// <P>
// Records are returned in a new List but the Records within it are the same
// instances that the ResultSet is holding onto.  Hence it's safe to add or remove records from
// the List without affecting the ResultSet but modifying the Records themselves is a direct
// modification of the client-side cache.
// @return (Array of Record) the records in the cache, possibly null
// @visibility external
//<
getAllCachedRows : function () {
    if (!this.lengthIsKnown()) {
        return null;
    } else if (!this.allRows) {
        return this.getAllVisibleRows();
    } else {
        var allRows = this.allRows.duplicate();
        
        return allRows;
    }
},

// called by grids, allows dynamic derivation of values.  Used in order to allow a ResultSet to
// use a set of XML elements as its dataset.
// "field" is the optional field descriptor used in the visual component.
dynamicDSFieldValues:false,
getFieldValue : function (record, fieldName, field, component, reason) {
    if (this.dynamicDSFieldValues) {
        return this.getDataSource().getFieldValue(record, fieldName, field);
    } else {
        return isc.Canvas._getFieldValue(fieldName, field, record, component, true, reason);
    }
},

//> @method resultSet.duplicate()
// Returns a clone of this ResultSet sharing the same DataSource, current criteria, sort
// direction and cache state.
// <p>
// Internal caches are copied such that methods such as +link{lengthIsKnown()},
// +link{allMatchingRowsCached()} and +link{allRowsCached()} return identical results for the
// new ResultSet.
// <p>
// Subsequent changes to criteria or sort direction on the original ResultSet with not affect
// the duplicate, and vice versa.  Outstanding fetches on the original ResultSet will likewise
// have no effect on the duplicate when they complete.  However, actual Record instances are
// shared between the original and copied ResultSet, so direct modification of Records will
// affect both ResultSets.
// <p>
// The new ResultSet will listen for DataSource changes and automatically update caches just
// as normal ResultSets do.
// <p>
// <b>NOTE:</b> if you are looking for a simple list of Records rather than a new, fully
// functional ResultSet, consider +link{getAllCachedRows()} or +link{getAllVisibleRows()}.  If
// you are looking to create a filterable, sortable subset of the current ResultSet, consider
// creating a new ResultSet and passing the results of <code>getAllCachedRows</code> or
// <code>getAllVisibleRows</code> as the initial value of ResultSet.allRows.
// @return	(ResultSet)		new ResultSet sharing the same DataSource, current criteria, sort
// direction and cache state.
// @visibility external
//<

duplicate : function () {
    // Copy this ResultSet's configuration.  There should be no need to copy over the
    // initialData and initialLength.
    var simpleProperties = isc.ResultSet._simpleProperties,
        config = {};
    for (var i = simpleProperties.length; i--; ) {
        var key = simpleProperties[i];
        config[key] = this[key];
    }
    if (isc.isAn.Array(this.sortSpecifiers)) {
        var ds = this.dataSource,
            sortSpecifiers = config.sortSpecifiers = new Array(this.sortSpecifiers.getLength());
        for (var i = sortSpecifiers.length; i--; ) {
            sortSpecifiers[i] = isc.DataSource.getSortBy(this.sortSpecifiers[i]);
        }
    }
    
    config.fetchOperation = this.getOperationId("fetch");
    config.context = isc.addProperties({}, this.context);

    // Copy this ResultSet's internal state and data caches.

    var localData = this.localData && this.localData.duplicate(),
        allRows = this.allRows && this.allRows.duplicate();

    config.localData       = localData;
    config.totalRows       = this.totalRows;
    config.cachedRows      = this.cachedRows;
    config._localDataValid = this._localDataValid;

    config.allRows = allRows;
    config.allRowsCriteria = isc.DataSource.copyCriteria(this.allRowsCriteria);
    config.criteria = isc.DataSource.copyCriteria(this.criteria);
    // copy implicitCriteria from the RS and the DBC
    if (this.implicitCriteria) {
        config.implicitCriteria = isc.DataSource.copyCriteria(this.implicitCriteria);
    }
    // if (this.dbcImplicitCriteria) {
    //     config.dbcImplicitCriteria = isc.DataSource.copyCriteria(this.dbcImplicitCriteria);
    // }

    config._duplicatingResultSet = true;
    
    var duplicate = this.getClass().newInstance(config);
    delete duplicate._duplicatingResultSet;
    return duplicate;
},


// Retrieving rows
// --------------------------------------------------------------------------------------------

_getLoadingRangesIndex : function (rowNum) {
    var loadingRanges = this._loadingRanges;
    

    var i = 0,
        j = loadingRanges.length - 1;
    while (i + 1 < j) {
        var k = Math.floor((i + j) / 2),
            v = loadingRanges[k];
        if (rowNum < v) {
            j = k;
        } else if (rowNum > v) {
            i = k;
        } else {
            return k;
        }
    }

    if (j == -1 || rowNum < loadingRanges[i]) {
        return i - 1;
    } else if (rowNum == loadingRanges[i] || rowNum < loadingRanges[j]) {
        return i;
    } else {
        return j;
    }
},

_rowIsLoading : function (rowNum) {
    
    return (this._getLoadingRangesIndex(rowNum) % 2 == 0);
},



_firstLoadingRow : function (startRow, endRow, value) {
    if (!(startRow < endRow)) {
        return -1;
    }
    var loadingRanges = this._loadingRanges,
        j = this._getLoadingRangesIndex(startRow);
    if (value == (j % 2 == 0)) {
        return startRow;
    } else if (j + 1 < loadingRanges.length && loadingRanges[j + 1] < endRow) {
        return loadingRanges[j + 1];
    } else {
        return -1;
    }
},
_lastLoadingRow : function (startRow, endRow, value) {
    if (!(startRow < endRow)) {
        return -1;
    }
    var loadingRanges = this._loadingRanges,
        j = this._getLoadingRangesIndex(endRow - 1);
    if (value == (j % 2 == 0)) {
        return endRow - 1;
    } else if (0 <= j && startRow <= loadingRanges[j] - 1) {
        return loadingRanges[j] - 1;
    } else {
        return -1;
    }
},

_setRangeLoading : function (startRow, endRow, value) {
    if (!(0 <= startRow && startRow < endRow)) {
        return;
    }
    
    var loadingRanges = this._loadingRanges,
        i = this._getLoadingRangesIndex(startRow),
        j = this._getLoadingRangesIndex(endRow - 1);
    

    // The terminology used here assumes that value is true.
    var startRowNotLoading = (value != (i % 2 == 0)),
        endRowNotLoading = (value != (j % 2 == 0)),
        mergeLeft = (startRowNotLoading && 0 <= i && startRow == loadingRanges[i]),
        mergeRight = (
            endRowNotLoading &&
            j + 1 < loadingRanges.length &&
            endRow == loadingRanges[j + 1]),
        addStartRow = (!mergeLeft && startRowNotLoading),
        addEndRow = (!mergeRight && endRowNotLoading),
        index = i + (mergeLeft ? 0 : 1),
        howMany = (j - i + (mergeLeft ? 1 : 0) + (mergeRight ? 1 : 0));
    if (addStartRow && addEndRow) {
        loadingRanges.splice(index, howMany, startRow, endRow);
    } else if (addStartRow) {
        loadingRanges.splice(index, howMany, startRow);
    } else if (addEndRow) {
        loadingRanges.splice(index, howMany, endRow);
    } else {
        loadingRanges.splice(index, howMany);
    }
    
},

//> @method resultSet.lengthIsKnown()
// Whether the ResultSet knows the length of its data set.
// <P>
// When the ResultSet fetches data from the DataSource in response to +link{getRange()} or
// similar methods, +link{dsResponse.totalRows} from the fetch
// lets the ResultSet know the full dataset size.
// <P>
// Prior to the completion of the first fetch, (or after +link{invalidateCache(),dropping cache})
// the ResultSet will not know how many records 
// are available. At this time <code>lengthIsKnown()</code> will return false, and
// a call to +link{resultSet.getLength()} will return an arbitrary, 
// large value.
// <P>
// Note: If +link{DataSource.progressiveLoading,progressive loading} is active the
// reported +link{dsResponse.totalRows} value may not accurately reflect the true dataset 
// size on the server. In this case <code>lengthIsKnown()</code>
// returns true, but the +link{getLength(),reported length} of the ResultSet may
// change as additional rows are retrieved from the server. The
// +link{resultSet.lengthIsProgressive()} method will indicate when the resultSet is in this
// state.
//
// @return (boolean) whether length is known
// @visibility external
//<

lengthIsKnown : function () {
    // for a paged RS, totalRows remains null until you call setFullLength()
    // for a local or basic RS we never know the total length until fetch() returns,
    // which is detected by looking at _localDataValid and allRows being non-null
    return this.localData != null && (this.isPaged() ? this.totalRows != null :
                                      this._localDataValid || this.allRows != null);
},

//> @method resultSet.lengthIsProgressive()
// Does the length of this ResultSet as returned by +link{ResultSet.getLength()} 
// reflect the +link{dsResponse.totalRows,totalRows} reported by a DataSource with
// +link{group:progressiveLoading} enabled?
// <P>
// If true, this row count may not be an accurate reflection of the true size
// of the data set.
// <P>
// This method relies on the +link{dsResponse.progressiveLoading} attribute having
// been set accurately by the server. Note that if the user has scrolled to the
// end of a progressively loaded data set, or +link{resultSet.setFullLength()}
// has been explicitly called, this method will no longer return true.
//
// @return (boolean) true if the length of this ResultSet was derived from
//   a +link{DSResponse.progressiveLoading,progressiveLoading:true} dsResponse.
// @group progressiveLoading
// @visibility external
//<
lengthIsProgressive : function () {
    return !!this._progressiveRowCount;
},

//> @method resultSet.fetchIsPending()
// Whether a fetch is in progress for the ResultSet.  This includes both fetches already
// sent to the server, and fetches that are merely scheduled for execution on pause.
// @return (boolean) whether a fetch is pending
//<
fetchIsPending : function () {
    return this._fetchingRequest != null ||
        this.pendingActionOnPause("fetchRemoteData") ||
        this.pendingActionOnPause("invalidateAllRowsCache");
},

//> @method resultSet.rowIsLoaded() [A]
// Whether the given row has been loaded.
// <p>
// Unlike get(), will not trigger a server fetch.  
//
// @param   rowNum  (number)   row to check
// @return (boolean) true if the given row has been loaded, false if it has not been
//                   loaded or is still in the process of being loaded
// @visibility external
//<
rowIsLoaded : function (rowNum) {
    return (this.localData != null && this.localData[rowNum] != null);
},

// internal fast-as-possible row check used in certain inner loops.  Skips check for 
// localData != null so caller must check that first via lengthIsKnown()
getCachedRow : function (rowNum) {
    var row = this.localData[rowNum];
    if (row != null) {
        return row;
    } else {
        return null;
    }
},

//> @method resultSet.rangeIsLoaded() [A]
// Whether the given range of rows has been loaded.
//
// Unlike getRange(), will not trigger a server fetch.  
//
// @param   startRow (number)   start position, inclusive
// @param   endRow   (number)   end position, exclusive
// @return (boolean) true if all rows in the given range have been loaded, false if any rows in
//                   the range have not been loaded or are still in the process of being loaded
// @visibility external
//<
rangeIsLoaded : function (startRow, endRow) {
    var localData = this.localData;
    if (localData == null) {
        return false;
    }
    for (var i = startRow; i < endRow; i++) {
        if (localData[i] == null) {
            return false;
        }
    }
    return true;
},

// get the index of the last cached row after rowNum, or null if rowNum itself is not cached.
// "reverse" parameter searches backwards
findLastCached : function (rowNum, reverse) {
    if (!this.rowIsLoaded(rowNum)) return null;

    var localData = this.localData;
    if (reverse) {
        var i = rowNum;
        while (i >= 0 && localData[i] != null) {
            --i;
        }
        return i + 1;
    } else {
        var length = this.getLength(),
            i = rowNum;
        while (i < length && localData[i] != null) {
            ++i;
        }
        return i - 1;
    }
},


//> @method resultSet.getCachedRange() [A]
// Returns the index of the first and last cached row around a given row, or null if the row
// itself is not cached.  The last cached row value is inclusive.
//
// @param   rowNum  (number)  row to check
// @return  (Array of int)    first and last cached row indices, or null 
// @visibility external
//<
getCachedRange : function (rowNum) {
    // default to the last requested range, or zero
    if (rowNum == null) rowNum = this.lastRangeStart;
    if (rowNum == null) rowNum = 0;
    // no cache around this row
    if (!this.rowIsLoaded(rowNum)) return null;
    var length = this.getLength();
    if (this.allMatchingRowsCached()) return [0, length-1];

    var startIndex = this.findLastCached(rowNum, true),
        endIndex = this.findLastCached(rowNum);

    return [startIndex, endIndex];
},

//>	@method	resultSet.setRangeLoading() 
// Initializes null data in the specified range to the
// +link{resultSet.getLoadingMarker(),loading marker}.
//		
//		@param	start	(number)	start position
//		@param	end		(number)	end position
// @visibility internal
//<
setRangeLoading : function (start, end) {
    if (this.localData == null) {
        this._setLocalData([]);
    }
    this._setRangeLoading(start, end, true);
},

// given an array, set all null values to the "loading" marker and fill out the array to the
// length specified.
fillRangeLoading : function (arr, length) {
    
    var loadingMarker = isc.ResultSet.getLoadingMarker();
    for (var i = 0; i < length; i++) {
        if (arr[i] == null) {
            arr[i] = loadingMarker;
        }
    }
    return arr;
},

//> @method resultSet.getCombinedCriteria()
// Returns a copy of all +link{resultSet.criteria, explicit} and 
// +link{resultSet.getImplicitCriteria, implicit} criteria currently applied to 
// this <code>ResultSet</code>. 
// @return (Criteria | AdvancedCriteria) combined criteria
// @visibility external
//<
getCombinedCriteria : function () {
    return isc.DS.compressNestedCriteria(
        this.getDataSource().combineCriteria(this.getImplicitCriteria(), 
            isc.DataSource.copyCriteria(this.criteria), null, this._textMatchStyle)
    );
},

getServerFilter : function () {
    // local mode: no server-side filtering
    if (this.isLocal()) return null;
    // dup the criteria so if it gets modified downstream EG by transformRequest we don't
    // reflect that here.
    return this.getCombinedCriteria();
},

// clear the fetch timer and explicitly pass start and end row to provide a clean entry point
// for the overrideable fetchRemoteData
_fetchRemoteData : function () {
    var startRow = this.fetchStartRow,
        endRow = this.fetchEndRow;

    // this indicates that a timer was set to do a fetch, but then an immediate fetch (no fetch
    // delay) occurred
    if (startRow == null || endRow == null) return;
    
    // now that we're definitely going to fetch the data, insert loading markers into the local
    // cache so that we don't issue fetch requests on any rows we're already fetching.
    this.setRangeLoading(startRow, endRow);
    this.fetchStartRow = null;
    this.fetchEndRow = null;

	//>DEBUG
	this.logInfo("fetching rows " + [startRow, endRow] + " from server"); //<DEBUG

    return this.fetchRemoteData(this.getServerFilter(), startRow, endRow);

},

_fetchAllRemoteData : function () {
    this.fetchRemoteData(this.getServerFilter());
},

//>	@method	resultSet.fetchRemoteData() [A]
// Retrieve a range of rows from the server.
// <P>
// Override to provide your own implementation of data retrieval.  Use fillCacheData() and
// setFullLength() to manipulate the cache once rows are retrieved.
// <P>
// Implementer is expected to return <b>all</b> requested rows.  fetchRemoteData() may ask for
// more rows than the current totalRows; if not enough rows are available, setFullLength()
// should be called to trim to the appropriate size.
//		
// @see setFullLength()
// @see fillCacheData()
//
//		@param serverCriteria (Criteria)	criteria to be applied by server
//		@param startRow	      (number)	    startRow position
//		@param endRow	      (number)	    endRow position
// @visibility customResultSet
//<
_requestIndex:0,
fetchRemoteData : function (serverCriteria, startRow, endRow) {
    if (isc.Offline.isOffline()) {
        // save a marker that we have offline records so we can invalidateCache() when
        // we go online, but continue the fetch anyway because there may be a suitable 
        // response in the Offline cache
        this.haveOfflineRecords = true;
    }

    this._requestIndex += 1;
    var component = isc.Canvas.getById(this.componentId);
    var promptStyle;
    if (component && component.getPromptStyle) promptStyle = component.getPromptStyle();
    
    var requestProperties = isc.addProperties({
        operationId : this.getOperationId("fetch"),
        startRow : startRow,
        endRow : endRow,
        sortBy : isc.shallowClone(this._serverSortBy),
        resultSet : this,
        componentId : this.componentId || "(created directly)",
        componentContext : this.componentContext,
        promptStyle: promptStyle
    }, this.context);
    
    var internalClientContext = { requestIndex: this._requestIndex };
    if (this.context && this.context.internalClientContext) {
        internalClientContext = isc.addProperties(
            {}, this.context.internalClientContext, internalClientContext);
    }
    requestProperties.internalClientContext = internalClientContext;

    var requestProgressiveLoading = this._requestProgressiveLoading()

    if (requestProgressiveLoading === true || requestProgressiveLoading === false) {
        requestProperties.progressiveLoading = requestProgressiveLoading
    }
    
    // Override willHandleError so we don't get wedged in a loading state
    requestProperties.internalClientContext._explicitWillHandleError = requestProperties.willHandleError;
    requestProperties.willHandleError = true;
    
    // if cache was partially updated before, invalidate the cache
    if (this.rowOrderInvalid()) {
        this.logInfo("invalidating rows on fetch due to 'add'/'update' operation " +
                     " with updatePartialCache");
        this.invalidateRows();
    }
 
    if (this.logIsDebugEnabled("fetchTrace")) {
        this.logDebug("ResultSet server fetch with server criteria: " +
                     this.echoFull(serverCriteria) + this.getStackTrace(), "fetchTrace");
    }

    if (this.cachingAllData) requestProperties.cachingAllData = true;

    // For local filtering, we fetch every row in the dataset once (and filter the results)
    // For basic filtering we re-fetch when criteria change.
    // In either case the total number of rows that match the filter criteria will be unknown
    // until the fetch returns.
    // This differs from paged ResultSets where we track total size via the totalRows
    // flag (and a fetch doesn't necessarily mean a complete dataset refresh).
    // Set a flag so lengthIsKnown() can detect when we're loading rows.
    
    this._fetchingRequest = this._requestIndex;

    
    this.getDataSource().fetchData(serverCriteria, 
                 {caller:this, methodName:"fetchRemoteDataReply"}, 
                 requestProperties);
},

fetchRemoteDataReply : function (dsResponse, data, request) {
    //!DONTOBFUSCATE
    // We observe this method in pickList.js

    // update the lastImplicitCriteria, so it can be checked from willFetchData()
    this.lastImplicitCriteria = this.getImplicitCriteria();

    
    var index = dsResponse.internalClientContext.requestIndex;
    if (!this._lastProcessedResponse) this._lastProcessedResponse = 0;
    if (index != (this._lastProcessedResponse+1) && !dsResponse.isCachedResponse) {
        this.logInfo("server returned out-of-sequence response for fetch remote data request " +
                " - delaying processing: last processed:"+ this._lastProcessedResponse + ", returned:"+ index);
        if (!this._outOfSequenceResponses) this._outOfSequenceResponses = [];
        this._outOfSequenceResponses.add({dsResponse:dsResponse, data:data, request:request});
        return;
    }

    if (this.cachingAllData == true) delete this.cachingAllData;

    var newData;
    // if the fetch failed, clear our 'loading' marker, and then send over to RPCManager
    // to do normal error handling
    //
    // Handle responses to requests that were outstanding when the cache was invalidated specially.
    // We don't want to insert this data into our cache.
    var hasError = dsResponse.status < 0,
        requestWasInvalidated = index <= this._invalidatedRequestIndex
    ;

    
    if (this._fetchingRequest == index) {
        if (!requestWasInvalidated) this._localDataValid = true;
        delete this._fetchingRequest;
    }

    
    var allRowsCriteria, isAllRowsCritEmpty,
        context = this._allMatchingRowsContext;
    if (context != null && (!requestWasInvalidated || context.request == index)) {

        if (this.logIsDebugEnabled("rsAllRows")) {
            this.logDebug("fetchRemoteDataReply(): handling response to request " +
                index + " with delayed local filtering context", "rsAllRows");
        }

        // cancel any scheduled all-rows cache invalidation 
        this.cancelActionOnPause("invalidateAllRowsCache");            
        this._allMatchingRowsContext = null;

        
        if (context.request == index) {

            if (this.logIsDebugEnabled("rsAllRows")) {
                this.logDebug("fetchRemoteDataReply(): received delayed response to request " +
                              index + " with all matching rows", "rsAllRows");
            }

            
            if (hasError) {
                var errorMessage = "fetchRemoteDataReply(): bad all-matching-rows response";
                if (!requestWasInvalidated) {
                    requestWasInvalidated = true;
                    errorMessage += "; invalidating cache";
                    this.invalidateCache();
                }
                this.logInfo(errorMessage, "rsAllRows");

            
            } else {
                if (requestWasInvalidated) {
                    if (this.logIsDebugEnabled("rsAllRows")) {
                        this.logDebug("fetchRemoteDataReply(): treating all-matching-rows " +
                            "request " + context.request + " as valid and invalidating " +
                            "all pending requests up to " + this._requestIndex, "rsAllRows");
                    }
                    requestWasInvalidated = false;
                    this._invalidatedRequestIndex = this._requestIndex;
                } else {
                    this.logDebug("fetchRemoteDataReply(): received response for valid " +
                                  "all-matching-rows request", "rsAllRows");
                }
                // set criteria for use by _handleNewData() and local filtering
                allRowsCriteria    =             context.criteria;
                isAllRowsCritEmpty = isc.getKeys(context.criteria).length == 0;
            }
        } else {
            if (this.logIsDebugEnabled("rsAllRows")) {
                this.logDebug("fetchRemoteDataReply(): got response to narrowed fetch " +
                              "request " + index + "; dropping all-matching-rows request " +
                              context.request, "rsAllRows");
            }
        }
    }

    if (requestWasInvalidated && !this._ignoreInvalidatedRequests && this.logIsInfoEnabled()) {
        this.logInfo(request,
                     "The ResultSet's cache was invalidated while the following request was outstanding: " +
                     isc.echoAll(request) +
                     ", request data:" + isc.echoAll(request.data));
    }
    if (hasError || requestWasInvalidated || dsResponse.offlineResponse) {
        newData = [];
    } else {
        newData = dsResponse.data;
    }

    var numResults = newData.length;

    
    this.document = dsResponse.document;

	//>DEBUG
	this.logInfo("Received " + numResults + " records from server");
	//<DEBUG

    // if the server did not specify startRow, assume startRow is what
    // was asked for
    if (dsResponse.startRow == null) dsResponse.startRow = request.startRow;

    // if the server did not specify an endRow, assume endRow is startRow + number of
    // records returned.
    if (dsResponse.endRow == null) dsResponse.endRow = dsResponse.startRow + numResults;

    // if the server did not specify totalRows, but the resulting endRow is less than what we
    // asked for, then we know the server has no more rows, clamp totalRows to endRow
    if (dsResponse.totalRows == null && dsResponse.endRow < request.endRow) {
        dsResponse.totalRows = dsResponse.endRow;
    }

    // if the cache was invalidated while the request was outstanding, change the response by
    // clearing out the results. This retains the meaningfulness of the response's status and
    // totalRows, etc., but makes sure that the client will not use data intended for insertion
    // into the cache that was invalidated.
    if (requestWasInvalidated) {
        // move up startRow because there is logic below to clamp totalRows to endRow.
        dsResponse.startRow = dsResponse.endRow;
        // note: isAn.Object() returns true for arrays.
        if (isc.isAn.Object(dsResponse.data)) dsResponse.data = [];
    }

    // opportunity to transform data from the server
    if (this.transformData) {
        var result = this.transformData(newData, dsResponse);
        // handle failure to return the untransformed data
        newData = result != null ? result : newData;
        if (newData.length != numResults) {
	        this.logInfo("Transform applied, " + newData.length + 
                         " records resulted, from " + dsResponse.startRow + 
                         " to " + dsResponse.endRow);
            // update endRow
            dsResponse.endRow = dsResponse.startRow + newData.length;
            // must adjust totalRows here if smaller than endRow - startRow, otherwise clamp
            // below will trim results
            if (dsResponse.totalRows != null && dsResponse.totalRows < dsResponse.endRow) {
                dsResponse.totalRows = dsResponse.endRow;
            }
        }
    }

    if (!isc.isA.List(newData)) {
        this.logWarn("Bad data returned, ignoring: " + this.echo(newData));
        return;
    }

    // If the server returned an endRow past the end of the list, warn and clamp 
    // dsResponse.endRow to the end of the list so dataArrived etc are passed the correct 
    // info on the last loaded row
    
    if (dsResponse.totalRows != null && dsResponse.totalRows < dsResponse.endRow) {
        this.logWarn("fetchData callback: dsResponse.endRow set to:" + dsResponse.endRow + 
                     ". dsResponse.totalRows set to:" + dsResponse.totalRows +
                     ". endRow cannot exceed total dataset size. " +
                     "Clamping endRow to the end of the dataset (" + dsResponse.totalRows + 
                     ").");
        dsResponse.endRow = dsResponse.totalRows;
    }

    // NOTE: transformData is allowed to modify results.startRow/endRow/totalRows
    var startRow = dsResponse.startRow,
        endRow = dsResponse.endRow;

    this._startDataArriving();
    // incorporate new data into the cache if not intended for a cache that was invalidated
    if (!requestWasInvalidated) {
        this._handleNewData(newData, dsResponse, isAllRowsCritEmpty);

        // apply any delayed local filtering now
        if (allRowsCriteria || isAllRowsCritEmpty) {
            
            this.logInfo("fetchRemoteDataReply(): performing delayed local filtering",
                         "rsAllRows");
            this._setAllRows(this.localData, allRowsCriteria);
            this.filterLocalData();
        }
    }
    // if the status returned < 0, suppress firing the dataArrived handler
    this._doneDataArriving(startRow, endRow, hasError);


    
    delete this.context.afterFlowCallback;

    this._lastProcessedResponse = index;
    if (this._outOfSequenceResponses && this._outOfSequenceResponses.length > 0) {
        for (var i = 0; i < this._outOfSequenceResponses.length; i++) {
            var reply = this._outOfSequenceResponses[i];
            if (reply == null) continue;

            var requestIndex = reply.dsResponse.internalClientContext.requestIndex;
            if (requestIndex == (this._lastProcessedResponse+1)) {
                this.logInfo("Delayed out of sequence data response being processed now " + 
                             requestIndex);
                this._outOfSequenceResponses[i] = null;
                this.fetchRemoteDataReply(reply.dsResponse, reply.data, reply.request);
                break;
            }
        }
    }

    // We overrode willHandleError for the request.
    // Fire standard error handling now unless the original request already suppressed
    // this.
    var willHandleError = request.internalClientContext._explicitWillHandleError;
    if (!willHandleError && hasError) {
        isc.RPCManager._handleError(dsResponse, request);
    }
},

_handleNewData : function (newData, result, emptyCriteria) {
    if (this.isLocal()) {
        // when we get the complete dataset from the server we hold onto it as "allRows" and
        // set this.localData to a locally filtered subset      
        // Don't pass this.criteria into setAllRows - we're caching the complete set of data
        // (which has empty criteria)
        
        this._loadingRanges = [];
        this._setAllRows(newData.duplicate());
        this.filterLocalData();
        return;
    } else if (!this.isPaged()) {
        this._startChangingData();
        
        this._loadingRanges = [];
        this._setLocalData(newData.duplicate());
        if (this.canSortOnClient()) {
        	// if client sorting is allowed, sort locally, so that the server does not have to
            // send sorted records and sorting doesn't have to match between client and server
        	this._doSort();
        }

        // If our criteria is empty, we have all rows cached - in this case store this.allRows
        // so we can perform a local filter on a call to 'setCriteria'.  NOTE: done within
        // fillCacheData for a paged ResultSet
        if (this.allRowsCached(emptyCriteria)) {
            this._setAllRows(this.localData, this.criteria);
        }
    	this._doneChangingData(result.operationType);
        return;
    }

    // paged mode
	var context = result.context;
    
    this._startChangingData();
    
    // force cache invalidation
	if (result.invalidateCache) {
        this._invalidateCache();
    } else if (this.dropCacheOnLengthChange && this.lengthIsKnown() && this.totalRows != result.totalRows) {
        // crude staleness detection: change in totalRows
        

		//>DEBUG
		this.logInfo("totalRows changed from " + this.totalRows + " to " +
					 result.totalRows + ", invalidating cache");
		//<DEBUG
		this._invalidateCache(); // NOTE: doesn't trigger observers yet
	}

    // initialize the cache if we've never loaded rows before
	if (this.localData == null) {
        this._setLocalData([]);
    }

	// trimming length discards any "LOADING" marker rows for rows that don't exist on the
    // server

    // If this response is marked as progressiveLoading:true, and this.progressiveLoading is
    // not set to true, PL may have been dynamically enabled by the server side
    // progressiveLoadingThreshold.
    // Remember this: This allows us to explicitly request progressiveLoading responses
    // for future requests for the same criteria, so we don't need the expensive
    // rowCountQuery on the server again, which could hit the progressiveLoading threshold
    var progressiveLoading = result.progressiveLoading;
    if (this.rememberDynamicProgressiveLoading && progressiveLoading && (this.progressiveLoading == null)) {
        this._dynamicProgressiveLoading = true;
    }

    // If this response is marked as progressiveLoading:true, and we don't have 
    // a full data set returned, we may have a more accurate row count.
    var progressiveRowCount = (result.totalRows > result.endRow) && progressiveLoading;
    var totalRows = result.totalRows;

    

    // If the server response contains an estimated row count, hold onto it
    if (result.estimatedTotalRows != null) {
        var rowCount = this._parseEstimatedTotalRows(result.estimatedTotalRows);
        if (rowCount != null) {
            this.setRowCount(rowCount[0], rowCount[1]);
        }
    }


    this.setFullLength(totalRows, progressiveRowCount);

    // autoFetchRowCount: If we got a progressiveLoading fetch 
    // response back and we don't know our true row count, kick off 
    // a rowCount fetch now
    if (this.autoFetchRowCount && progressiveLoading) {
        var rowCountStatus = this.getRowCountStatus();
        if (rowCountStatus != "exact" &&
            rowCountStatus != "loading")
        {
            this.fetchRowCount();
        }
    }

    // add the rows to our cache
    this.fillCacheData(newData, result.startRow);

    // handle server batch size set too small: clear loading markers for the rest of the
    // requested range so that new requests will be fired.
    
    var localData = this.localData;
    var requestedStart, requestedEnd;
    if (result.context) {
        requestedStart = result.context.startRow;
        requestedEnd = result.context.endRow;
    }
    var foundRequestRange = true;
    if (requestedStart == null || requestedEnd == null) {
        foundRequestRange = false;
        requestedStart = result.startRow;
        requestedEnd = this.totalRows;
    }
    

    
    var loadingRanges = this._loadingRanges,
        i0 = requestedStart + newData.length,
        i = requestedEnd;
    if (loadingRanges.length > 0) {
        // Get the start of the next range of records that are loading.
        var k = 2 * Math.ceil(this._getLoadingRangesIndex(i0) / 2);
        // If the first loading marker occurs before `requestedEnd` then set `i` to the index
        // of the loading marker.
        i = Math.min(i, loadingRanges[k]);
    }
    if (i > i0) {
        this.logInfo("Fetch request returned range "
             + [result.startRow,(result.startRow + newData.length)]
             + (foundRequestRange ?
                " differs from requested range "
                 + [requestedStart, requestedEnd] + ". " :
                " but we have subsequent 'loading' markers. ")
             + "Assuming client/server batch size mismatch and clearing loading "
             + "markers greater than " + (result.startRow + newData.length));

        this._setRangeLoading(i0, i, false);
    }

	//>DEBUG
	this.logInfo("cached " + newData.getLength() + " rows, from " + 
				 result.startRow + " to " + result.endRow +
				 " (" + this.totalRows + " total rows, " + this.cachedRows + " cached)");
	//<DEBUG

    if (this.allMatchingRowsCached()) {
        if (this.allRowsCached()) {
    	    this.logInfo("Cache for entire DataSource complete");
        } else {
    	    this.logInfo("Cache for current criteria complete");
        }
        // sort, because if we just completed a dataset where we had a partial cache before,
        // then the data was previously in a sort order specified by the server
        if (this.canSortOnClient()) this._doSort();
    }

	// call dataChanged in case anyone is observing it
	this._doneChangingData(result.operationType);
},

setContext : function (context) {
    this.context = context;
},

//> @method resultSet.findByKey()
// Attempt to find the record in the resultSet that has a primary key value that matches the 
// passed in parameter value. Only the locally cached data will be searched. 
// Checks only loaded rows and will not trigger a fetch. Returns null if there is no match, 
// data is not loaded, or there is no +link{resultSet.dataSource, dataSource}.
// <p>
// Note, if you pass a simple value to this method, it will be matched against the first 
// primaryKey field.  For DataSources with a composite primary key (multiple primaryKey fields),
// pass
// <smartclient>a criteria object containing just your primaryKeys, like this: 
// <code>{ firstPkField: "value", secondPkField: 25 }</code>.</smartclient>
// <smartgwt>a Criteria instance containing just primaryKey entries.</smartgwt>
//
// @param keyValue (Object) primary key value to search for
// @return (Record) the record with a matching primary key field, or null if not found
// @visibility external
//<
findByKey : function (keyValue) {
     var ds = isc.DataSource.getDataSource(this.dataSource);
     // make sure a dataSource exists for this resultSet
     if (!ds) return;
     // make sure there is a primary key field and that data is loaded
     if (!ds.getPrimaryKeyField() || !this.lengthIsKnown()) return;
     
     var keyVals;
     // if keyValue is an object, just pass that to findByKeys
     if (isc.isAn.Object(keyValue)) {
         keyVals = keyValue;
     // otherwise make an object that findByKeys() will understand
     } else {
         keyVals = {};
         keyVals[ds.getPrimaryKeyFieldName()] = keyValue;
     }
     
     // call findByKeys on DataSource for localData
     var index = ds.findByKeys(keyVals, this.localData);
     if (index != null && index != -1) return this.localData[index];
     else return null;       
},

// Criteria
// --------------------------------------------------------------------------------------------

//> @method resultSet.setCriteria()
// Set the filter criteria to use when fetching rows.
// <P>
// Depending on the result of +link{compareCriteria()} and settings for
// +link{useClientFiltering} / +link{fetchMode}, setting criteria may cause a trip to the
// server to get a new set of rows, or may simply cause already-fetched rows to be re-filtered
// according to the new Criteria.  In either case, the dataset length available from
// +link{getLength()} may change and rows will appear at different indices.
// <P>
// The filter criteria can be changed while server fetches for data matching the old criteria
// are still outstanding.  If this is the case, the ResultSet will make sure that any records received
// matching the old criteria are not added to the cache for the new criteria.  Any callbacks
// for responses to the outstanding requests are fired as normal, and the responses'
// +link{DSResponse.totalRows,totalRows} counts are kept (as they are still potentially meaningful
// to components using the ResultSet), but the response data is cleared so that it won't be used
// inadvertently as data matching the new criteria.
// <P>
// Note: for simple Criteria, any field values in the criteria explicitly specified as null
// will be passed to the server.  By default the server then returns only records whose value
// is null for that field. This differs from certain higher level methods such as 
// +link{listGrid.fetchData()} which prune null criteria fields before performing a fetch
// operation.
//
// @param newCriteria (Criteria) the filter criteria
// @return (boolean) Returns false if the new criteria match the previous criteria, implying
//    the data is unchanged.
// @visibility external
//<
// An overview on the caching system:
// We have 2 kinds of cache
// - the cache of results that matches the current criteria: this.localData
// - the cache of every record we've been handed by the server: this.allRows
//   * When in local filtering mode, this.allRows is always the entire set of records in the
//     data-set, and all sorting and filtering is local (modifying this.localData)
//   * When in basic filtering mode, we also always populate both caches.
//     On the first fetch we fill both caches with the results returned from the server.
//     On subsequent changes to filter criteria, we will either do a client-only filter and 
//     modify the local cache, or perform a new server fetch and update both caches depending
//     on useClientFiltering and whether the new critia are more or less restrictive
//   * In paged mode, when we retrieve data from the server, if it is an incomplete data set, 
//     records will be slotted into the local cache. Once we have retrieved all matching records
//     for a set of criteria, these will be stored as this.allRows, and for subsequent fetches
//     we'll filter on the client and modify the local cache only if possible (similar to 
//     "basic" mode).
// Note: If the user changes textMatchStyle it can become more restrictive 
// (EG from substring to exact match). In this case we can avoid hitting the server, and 
// perform a local filter. Note that if this happens the allRows cache will contain more rows
// than it would for the same "allRowsCriteria" with the new text match style, but we always
// apply a local filter to this data so the developer / user should never see these extra rows.
setCriteria : function (newCriteria) {
    // use _willFetchData to determine whether we'll hit the server
    // calling the internal version of this method means we'll get back 'null' if the
    // criteria are unchanged, allowing us to skip the call to filterLocalData();
    if (newCriteria == null) newCriteria = {};
    var requiresFetch = this._willFetchData(newCriteria, null, 
                                            !this.reapplyUnchangedLocalFilter);
    if (requiresFetch == null) {
        
        // Catch the case where we were seeded with this.allRows on init but haven't yet
        // set up this.localData
        if (this.localData == null && this.allRows != null) this.filterLocalData();
        
        //>DEBUG
        this.logInfo("setCriteria: filter criteria unchanged");
        //<DEBUG
        return false;
    }

    // If the criteria have changed ensure we don't inappropriately request
    // progressiveLoading for new fetches.
    delete this._dynamicProgressiveLoading;

    // If we set up a "rowCount" separate from totalRows clear it now. It
    // only applies as long as criteria are unchanged
    // This will also abort any active rowCount fetch operation
    this.clearRowCount();
    
    // clone the criteria passed in - avoids potential issues where a criteria object is passed in
    // and then modified outside the RS
    // Avoid this with advanced criteria - our filter builder already clones the output
    if (!this.getDataSource().isAdvancedCriteria(newCriteria)) {
        // use clone to deep copy so we duplicate dates, arrays etc
        newCriteria = isc.clone(newCriteria);
    }
    var oldCriteria = this.criteria;
    this.criteria = newCriteria;
    
    // remember whether criteria are empty
    this._emptyCriteria = (isc.getKeys(newCriteria).length == 0);

    this._textMatchStyle = (this.context && this.context.textMatchStyle) ? 
                                this.context.textMatchStyle : null;

    // don't immediately do local filtering if the needed matching rows are still being fetched
    if (this._shouldDelayFilterLocalData()) {
        //>DEBUG
        this.logInfo("setCriteria: filter criteria changed with outstanding " +
                     "all-rows fetch; delaying filtering of local data", "rsAllRows");
        //<DEBUG
        
        if (!this.isLocal()) this._scheduleDelayedCacheInvalidation(oldCriteria);

    } else if (requiresFetch) {
        //>DEBUG
        this.logInfo("setCriteria: filter criteria changed, invalidating cache");
        //<DEBUG
        this.invalidateCache();

    } else {
        //>DEBUG
        this.logInfo("setCriteria: filter criteria changed, performing local filtering");
        //<DEBUG

        // If we're going to do a local filter and we don't yet have this.allRows set up,
        // populate it now
        
        if (this.allRows == null) {
            
            this._setAllRows(this.localData, oldCriteria);
        }
        this.filterLocalData();
    }
    // this indicates the filter criteria changed
    return true;
},

//> @attr resultSet.allMatchingRowsFetchTimeout (int : 200 : IRA)
// Configures how long to wait for a pending all-matching-rows fetch after a narrower
// criteria has been set via +link{setCriteria()} before sending a separate fetch for the
// narrower criteria.  If the original fetch response arrives before the response for the
// new criteria, it will be used.  Otherwise, if the new response arrives first, the original
// will be dropped.
// <P>
// If this property is null, the ResultSet will consider any pending request as invalid if the
// criteria is narrowed and and immediately send a new request.
// <P>
// Note that this property only applies to ResultSets with +link{attr:fetchMode}: "basic".
//<
allMatchingRowsFetchTimeout: isc.Browser.useHighPerformanceGridTimings ? 200 : 500,

//> @method ResultSet.setAllRows() [A]
// Update the +link{resultSet.allRows} client-side cache of data at runtime.
// <P>
// This method is useful for cases where a full, unfiltered set of data is present
// on the client and developers wish to filter that data-set locally without going through
// a fetch operation against a DataSource.
// <P>
// Developers using this pattern may also wish to consider the +link{FilteredList} class.
// 
// @param allRows (Array of Records) New set of unfiltered cache data
// @visibility external
//<
setAllRows : function (allRows) {
    this._setAllRows(allRows);
    this.filterLocalData();
},
    
// Setter for the 'allRows' attribute. This is a (complete) cache of records that
// match the criteria passed in and is the most unrestrictive set of data we've recieved
// from the server.
// Once set we'll use local filtering if shouldUseClientFiltering() returns true and
// criteria are more restrictive than this cache
_setAllRows : function (data, criteria) {
    this.allRows = data;
    // if implicitCriteria is in effect, include it in allRowsCriteria
    var iCrit = this.getImplicitCriteria();
    if (iCrit && !isc.isAn.emptyObject(iCrit)) {
        criteria = isc.DS.compressNestedCriteria(this.getDataSource().combineCriteria(criteria, iCrit));
    }
    this.allRowsCriteria = criteria || {};
    this._emptyAllRowsCriteria = (isc.getKeys(this.allRowsCriteria).length == 0);
},

//>!BackCompat 2004.7.23
setFilter : function (newCriteria) { return this.setCriteria(newCriteria) },
//<!BackCompat


//> @method resultSet.getCriteria()
// Get the current criteria for this ResultSet.
// @return (Criteria) current criteria
// @visibility external
//<
getCriteria : function () { return this.criteria },

//> @method resultSet.compareCriteria()
// Default behavior is to call +link{dataSource.compareCriteria()} to determine whether new
// criteria is guaranteed more restrictive, equivalent to the old criteria, or not guaranteed
// more restrictive, returning 1, 0 or -1 respectively.  See
// +link{dataSource.compareCriteria()} for a full explanation of the default behavior.
// <P>
// Override this method or +link{dataSource.compareCriteria()} to implement your own client-side
// filtering behavior.
//
// @param   newCriteria     (Criteria)  new filter criteria
// @param   oldCriteria     (Criteria)  old filter criteria
// @param   [requestProperties]     (DSRequest Properties)  dataSource request properties
// @param   [policy]        (String)    overrides +link{criteriaPolicy}
// @return  (Number)    0 if the filters are equivalent, 1 if newFilter is guaranteed more
//                      restrictive, and -1 if newFilter is not guaranteed more restrictive
// @see criteriaPolicy
// @visibility external
//<
compareCriteria : function (newCriteria, oldCriteria, requestProperties, policy) {
    return this.getDataSource().compareCriteria(
                newCriteria, oldCriteria, 
                requestProperties ? requestProperties : this.context, 
                policy ? policy : this.criteriaPolicy);
},

//> @method resultSet.compareSort()
// Compares two sort specifier arrays. In order for them to be equal they need to either be null,
// have no sort specifiers (zero length) or have the same length and the same specifiers in the same
// order. Each specifier in the arrays are compared based on +{link:SortSpecifier.property} and
// +{link:SortSpecifier.direction}
//
// @param   newSort     (Array of SortSpecifier)  new array of sort specifiers
// @param   oldSort     (Array of SortSpecifier)  old array of sort specifiers
// @return  (Boolean)    True if the sort specifier arrays have the same specifiers in the same order.
// @visibility internal
//<
compareSort : function (newSort, oldSort) {
    if (!newSort && !oldSort) {
        return true;
    }

    if (!isc.isAn.Array(newSort) || !isc.isAn.Array(oldSort)) {
        return false;
    }

    if (newSort.length !== oldSort.length) {
        return false;
    }

    if (newSort.length === 0 && oldSort.length === 0) {
        return true;
    }

    // At this point we know both sort specifiers have the same amount of sort items and they
    // are not empty. Lets compare them, order is also important.
    for (var i = 0; i < newSort.length; i++) {
        if (newSort[i].property !== oldSort[i].property || newSort[i].direction !== oldSort[i].direction) {
            return false;
        }
    }

    return true;
},

compareTextMatchStyle : function (newStyle, oldStyle) {
    return this.getDataSource().compareTextMatchStyle(newStyle, oldStyle);
},

//> @method resultSet.willFetchData()
// Will changing the criteria for this resultSet require fetching new data from the server, 
// or can the new criteria be satisfied from data already cached on the client?<br>
// Second <code>textMatchStyle</code> parameter determines whether a change of text-match style
// will require a server fetch - for example if filter is being changed between
// an exact match (from e.g: +link{ListGrid.fetchData()}) and a substring match 
// (from e.g: +link{ListGrid.filterData()}).<br>
// This method can be used to determine whether +link{ListGrid.fetchData()} or 
// +link{ListGrid.filterData()} would cause a server side fetch when passed a certain set of 
// criteria.
// <p>
// Note that to predict correctly the decision that will be made by filter/fetch, you'll need to
// pass the same +link{textMatchStyle} that will be used by the future filter/fetch.  Fetching
// manually (e.g. +link{listGrid.fetchData()}) will by default use "exact" while filtering
// (e.g. +link{listGrid.filterData()}) will by default use "substring".  If the component
// is configured for autofetch (i.e. +link{listGrid.autoFetchData}: true), that will
// use +link{listGrid.autoFetchTextMatchStyle}, which defaults to "substring".  If nothing/null
// is passed for the style, this method assumes you want the style from the last filter/fetch.
// <p>
// To determine what +link{textMatchStyle} is being used, check the RPC Tab of the
// +link{group:debugging,SmartClient Developer Console} and check the relevant +link{DSRequest}. 
//
// @param newCriteria (Criteria) new criteria to test.
// @param [textMatchStyle] (TextMatchStyle) New text match style. If not passed, assumes 
//      textMatchStyle will not be modified.
// @return (boolean) true if server fetch would be required to satisfy new criteria.
// @visibility external
//<

willFetchData : function (newCriteria, textMatchStyle) {
    return (this._willFetchData(newCriteria, textMatchStyle) == true);
},

// Internal version of willFetchData() which actually determines whether we'll fetch
// The only difference is that if the criteria are unchanged it will return explicit null
// rather than true/false. Called directly by setCriteria() where we care about whether
// new criteria would actually require a local filter, as well as whether we should drop
// cache
_willFetchData : function (newCriteria, textMatchStyle, strictCriteriaCompare) {
    
    delete this._allMatchingRowsPending;
        
    // if we have *no* local data we know we have to hit the server
    // regardless of the new criteria (we've never fetched and weren't seeded with this.allRows)
    if (this.localData == null && this.allRows == null) {
        return true;
    }

    // Determine if the criteria are unchanged / more or less restrictive
    if (newCriteria == null) newCriteria = {};
    var oldCriteria = isc.shallowClone(this.criteria || {}),
        oldTextMatchStyle = this._textMatchStyle,
        ds = this.getDataSource()
    ;

    if (textMatchStyle == null) {
        textMatchStyle = (this.context && this.context.textMatchStyle) ? 
                                this.context.textMatchStyle : null;
    }

    if (this.lastImplicitCriteria) {
        // combine oldCriteria with the lastImplicitCriteria - needed when 
        // DBC.setImplicitCriteria() / RS.setDbcImplicitCriteria() is passed null 
        oldCriteria = isc.DS.compressNestedCriteria(
            ds.combineCriteria(oldCriteria, this.lastImplicitCriteria, null, oldTextMatchStyle)
        );
    }

    var iCrit = this.getImplicitCriteria();
    if (iCrit) {
        // combine newCriteria with the current dbcImplicitCriteria
        newCriteria = isc.DS.compressNestedCriteria(
            ds.combineCriteria(newCriteria, iCrit, null, textMatchStyle)
        );
    }

    // are we currently viewing a subset of a larger cache of data?
    var isFilteringLocally = this.allRows && this.shouldUseClientFiltering()
                             && (oldCriteria != this.allRowsCriteria);
    
    // if old criteria is empty and will be used below, ignore its text match style
    var result = isc.isAn.emptyObject(oldCriteria) && !isFilteringLocally ? 0 : 
        this.compareTextMatchStyle(textMatchStyle, oldTextMatchStyle);
   
    // if we have switched into local filtering mode after obtaining a full cache (indicated by
    // allRows being set), check whether the new criteria are more or less restrictive
    // than the criteria in use when we obtained a full cache.  This determines whether we can
    // continue to do local filtering.
    var cacheDataCriteria = isFilteringLocally ? this.allRowsCriteria : oldCriteria;
    // if allRowsCriteria is unset, convert to an empty object so we can compare
    // against the criteria passed in.
    
    if (cacheDataCriteria == null) cacheDataCriteria = {};

    // If text match style is less restrictive and both criteria are simple, no need to check
    // whether the criteria are more restrictive, unless there is dbcImplicitCriteria now, or
    // there was previously
    var isNewCriteriaAdvanced       = ds.isAdvancedCriteria(newCriteria),
        isCacheDataCriteriaAdvanced = ds.isAdvancedCriteria(cacheDataCriteria)
    ;
    if (result >= 0 || isNewCriteriaAdvanced || isCacheDataCriteriaAdvanced ||
        this.dbcImplicitCriteria || this.lastImplicitCriteria)
    {
        // If one of the criteria objects is an AdvancedCriteria, convert the other one to
        // enable comparison
        if (isNewCriteriaAdvanced && !isCacheDataCriteriaAdvanced) {
            cacheDataCriteria = isc.DataSource.convertCriteria(cacheDataCriteria,
                                                               oldTextMatchStyle, ds);
        } else if (!isNewCriteriaAdvanced && isCacheDataCriteriaAdvanced) {
            newCriteria = isc.DataSource.convertCriteria(newCriteria, textMatchStyle, ds);
        }
        var fetchContext = isc.addProperties({},this.context);
        if (textMatchStyle != null) fetchContext.textMatchStyle = textMatchStyle;
        var criteriaResult = this.compareCriteria(newCriteria, cacheDataCriteria, fetchContext);

        
        if (isFilteringLocally && criteriaResult >= 0) {
            // If we're already viewing a subset of a larger cache we tested against that larger
            // cache, compare the current criteria against the criteria passed in as well to see
            // if the criteria are actually unchanged as far as the visible data is concerned.
            var isOldCriteriaAdvanced = ds.isAdvancedCriteria(oldCriteria);
            if (isNewCriteriaAdvanced && !isOldCriteriaAdvanced) {
                oldCriteria = isc.DS.convertCriteria(oldCriteria, oldTextMatchStyle, ds);
            } else if (!isNewCriteriaAdvanced && isOldCriteriaAdvanced) {
                newCriteria = isc.DS.convertCriteria(newCriteria, textMatchStyle, ds);
                isNewCriteriaAdvanced = true;                
            }
            // newCriteria is narrower/equal to "all rows" criteria - compare to oldCriteria
            if (this.compareCriteria(newCriteria, oldCriteria) == 0) {
                // if new/old criteria are equal, return null by setting result to "equals"
                if (criteriaResult == 1 && strictCriteriaCompare) criteriaResult = 0;
            } else {
                // if new/old criteria differ, force result to "not equals" (narrower)
                if (criteriaResult == 0) criteriaResult = 1;
            }
        }

        
        if (isNewCriteriaAdvanced || isCacheDataCriteriaAdvanced ||
            result >= 0 && criteriaResult != 0)
        {
            result = criteriaResult;
        }
    }
    
    if (result == 0) {
        // criteria match
        return null;

    } else {
        // If the criteria have changed at all, we know we'll have to hit the server if 
        // we don't have a complete cache based on our current criteria.
        if (!this.allMatchingRowsCached(true)) {
            return true;
        }
        
        // If this is a local resultSet we will always filter locally once we've got any results
        // (and we just verified we have a complete cache for at least our current criteria)
        if (this.isLocal()) {
        
        // criteria (including textMatchStyle) less restrictive than whatever we have cached,
        // And we know this isn't a local resultset
        // Have to fetch.
        } else if (result == -1) {
            // if the textMatchStyle is less restrictive, return false if there was no criteria
            // beforehand, or true otherwise
            var emptyCrit = !oldCriteria || isc.isAn.emptyObject(oldCriteria);
            // this.logWarn("textMatchStyle result == " + result + ", returning " +
            //              (emptyCrit ? "false, no crit beforehand" : "true"), "criteria");
            if (!emptyCrit) return true;

        // criteria more restrictive (and we have a complete cache for current criteria)
        // unless useClientFiltering is disabled we can filter locally
        } else if (result == 1) {
            // shouldUseClientFiltering is false - have to fetch
            if (!this.shouldUseClientFiltering()) return true;
        }

        
        if (!this.allMatchingRowsCached()) {
            
            this._allMatchingRowsPending = true;
            if (!this.isLocal()) return true;
        }

        return false;
    }
},

// if there's an outstanding all-matching-rows fetch, don't immediately filter local data
_shouldDelayFilterLocalData : function () {
    // no delay if _willFetchData() didn't set flag
    if (!this._allMatchingRowsPending) return false;

    
    if (!this.isBasic()) return this.isLocal();

    
    
    if (this._fetchingRequest == null && this._allMatchingRowsContext == null) return false;

    
    return this.allMatchingRowsFetchTimeout != null;
},

_scheduleDelayedCacheInvalidation : function (criteria) {
    // if there's not already a context for the original fetch, create one now
    if (this._allMatchingRowsContext == null) {
        var request = this._fetchingRequest;
        if (this.logIsDebugEnabled("rsAllRows")) {
            this.logDebug("scheduleDelayedCacheInvalidation(): setting context for " +
                "delayed filtering of local data, request " + request, "rsAllRows");
        }
        this._allMatchingRowsContext = {request: request, criteria: criteria};
    }
    // schedule the cache invalidation after a delay
    var timeout = this.allMatchingRowsFetchTimeout;
    if (this.logIsDebugEnabled("rsAllRows")) {
        this.logDebug("scheduleDelayedCacheInvalidation(): scheduling cache invalidation " +
                      "after a pause of " + timeout + "ms; observing DBCs will fetch data",
                      "rsAllRows");
    }
    this.fireOnPause("invalidateAllRowsCache", "_invalidateAllRowsCache", timeout);
},

_invalidateAllRowsCache : function () {
    var context = this._allMatchingRowsContext;
    // invalidating cache will cause observing DBCs to trigger a refetch with narrowed criteria
    this.logInfo("invalidateAllRowsCache(): executing delayed cache invalidation",
                 "rsAllRows");
    this.invalidateCache();
    // reinstall all-matching-rows fetch context so that handling remains in place
    this._allMatchingRowsContext = context;
},

//> @attr resultSet.reapplyUnchangedLocalFilter (boolean : null : IRWA)
// To avoid needless work, the ResultSet by default doesn't refilter the data when methods such
// as +link{listGrid.fetchData()} or +link{listGrid.filterData()} are called with unchanged
// criteria.  However, this property can be set true for backward compatibility to force
// refiltering if we're +link{filterLocalData(),filtering locally} and the criteria haven't
// changed. but are narrower than the criteria used to fetch the current cache.
// <P>
// Going forward, we may deprecate this property, so you should move to approach that
// doesn't require such notification in the case of unchanged criteria.
//
// @see willFetchData()
// @visibility external    
//<

// Sorting
// --------------------------------------------------------------------------------------------

//> @method resultSet.sortByProperty()
// Sort this ResultSet by a property of each record.
// <P>
// Sorting is performed on the client for a ResultSet that has a full cache for the current
// filter criteria.  Otherwise, sorting is performed by the server, and changing the sort order
// will invalidate the cache.
// <P>
// <b>NOTE:</b> normalizers are not supported by ResultSets in "paged" mode, although valueMaps
// in the DataSource are respected by the SQLDataSource.
//
// @include List.sortByProperty()
// @visibility external
//<
sortByProperty : function (property, sortDirection, normalizer, context) {
    // If we were passed a null normalizer - use the field type as normalizer instead.
    // (May still be null, in which case array sorting will try to derive from actual elements)
    if (normalizer == null) {
        var field = this.getDataSource().getField(property);    
        if (field) normalizer = field.type;
    }
    
    // If we're already sorted as appropriate, no-op.    
    
    if (this._sortProperty == property && this._sortDirection == sortDirection && 
        this._normalizer == normalizer) return;

    var field;
    // If the sort property has a displayField defined and either no optionDataSource or the 
    // same opDS as this data model's DS, sort by the displayField
    if (context) {
        field = context.getField(property);
        if (field && field.displayField && field.sortByDisplayField != false) {
            var opDs;
            if (field.optionDataSource) {
                opDs = isc.DataSource.getDataSource(field.optionDataSource);
            }
            if (!opDs || opDs == isc.DataSource.getDataSource(this.dataSource)) {
                property = field.displayField;
            }
        }
    }

    // remember sort and direction
    this._sortProperty = property;
    this._sortDirection = sortDirection;
    this._normalizer = normalizer;
    this._sortContext = context;

    // set sortBy for any subsequent fetches.
    // - if client sorting has been disabled, the server must sort for us
    // - if we are using paging, the server must sort for us, since server and client sort may
    //   not agree
    //   - XXX we could conditionally turn this off in situations where the cache is going to
    //     be completed when the next set of rows arrives, assuming the cache doesn't get
    //     invalidated
    if (this.isPaged() || !this.shouldUseClientSorting()) {
        this._serverSortBy = (this._sortDirection ? "" : "-") + this._sortProperty;
    }

    // we can sort locally if we have the entire result set *for the current filter* cached
    if (this.canSortOnClient()) {

        this._sortLocalDataByProperties([property], [sortDirection], [normalizer], [context]);
        // make sure we keep allRows in sync with localData when sorting, otherwise there
        // can be a case where a call to filterLocalData() will de-synchronize allRows and 
        // localData. Subsequent filters will then be filtering from incorrectly sorted data.
        if (this.allRows && (this.localData !== this.allRows)) {
            this.allRows.sortByProperties([property], [sortDirection], [normalizer], [context]);
        }
       
        // If this is from a cache update, and we're sorting, avoid passing the updated
        // record info to dataChanged()
        delete this._lastUpdateOperation;
        delete this._lastUpdateDataArray;
        delete this._lastUpdateData;
        delete this._lastOrigRecord;
        delete this._lastUpdateRow;
        delete this._isArrayUpdate;

        if (!this._isChangingData()) this.dataChanged();
        return;
    } 

    this.invalidateCache();
},


//>	@method		resultSet.unsort()	(A)
// Clear any +link{resultSet.setSort(),sort specifiers} applied to this ResultSet, while
// maintaining the current order of records. This feature is not supported for all
// lists. This method returns true if supported.
// <P>
// If a +link{resultSet.dataFetchMode,paged resultSet} has a partial cache, the order
// of records in the local data must always match the order of records as 
// provided by the +link{dataSource} - otherwise the wrong set of records will be 
// returned as new pages of data are fetched 
// (in response to a user scrolling a ListGrid, for example).
// <P>
// It's therefore not possible to unsort a paged resultSet with a partial cache and
// maintain the current order of any loaded records. If this method is called on 
// a resultSet in this state, it will always no-op and return false.
// <P>
// If you need to force a partially loaded ResultSet to discard it's current sort,
// and explicit call to +link{setSort,setSort(null)} may be used. This will drop the
// current sort specifiers and +link{invalidateCache()}.
//
//		@group	sorting
//		@return	(boolean)	true == list supports unsorting, false == not supported.
// @visibility external
//<
// Note: ResultSets with a partial cache can support "unsorting" if the row order is
// marked as invalid. See the undocumented 'keepLocalData' parameter for setSort()
unsort : function () {

    if (!this.allMatchingRowsCached()) return false;

    // inline a call to setSort([])
    this._sortSpecifiers = [];
    this._serverSortBy = [];

    // stop maintaining the sort order
    this._sortProperty = null; 

    // unsort the cache Array or it will continue to apply the last sort order to rows added
    // without a specific index
    if (this.localData) this.localData.unsort();
	return true;
},

// for internal callers - sort by current sort property
_doSort : function (keepLocalData) {

    // if we don't have data yet, wait to be asked for data.
    if (this.localData == null) return;

    // keepLocalData param - if we can't sort on the client, invalidate our row
    // order and bail. This means that calls to get(...) for loaded rows will
    // continue to return data from the current cache but as soon as unloaded
    // rows are requested we'll drop cache.
    if (keepLocalData) {
        if (!this.canSortOnClient()) {
            this.invalidateRowOrder();
            return;
        }
    }

    var specifiers = this._sortSpecifiers || [];

    // arrange arrays for passing into sortByProperties
    var properties = [],
        directions = [],
        normalizers = [],
        contexts = [];

    for (var i = 0; i < specifiers.length; i++) {
        var item = specifiers[i];
        properties[i] = item.sortByProperty ? item.sortByProperty : item.property;
        directions[i] = Array.shouldSortAscending(item.direction);
        normalizers[i] = item.normalizer;
        contexts[i] = item.context;
    }

    // we can sort locally if we have the entire result set *for the current filter* cached
    if (this.canSortOnClient()) {

        // if we have data, and a sort order, sort it.  Otherwise wait until we have data
        // and/or a sort order.
    	if (specifiers && specifiers.length>0) {
            // XXX NOTE: function-based normalizers are not supported by server sort (and can't
            // be).  valueMap-based normalizers are, but currently are not submitted, so only
            // valueMaps defined on server DataSources work.

            //>DEBUG
            this.logInfo("doSort: sorting on properties [" + properties.join(",") + "] : " +
                    "directions ["+ directions.join(",") + "]" +
                     " : full cache allows local sort");
            //<DEBUG

            this._sortLocalDataByProperties(properties, directions, normalizers, contexts);

            // This method may be called from a cache update in which case
            // we don't need to call dataChanged
            if (!this._isChangingData()) {
                this.dataChanged();
            }
        }
        return;
    }

    
    if (this._deferCacheInvalidation) {
        return false;
    }

    //>DEBUG
    this.logInfo("doSort: sorting on properties [" + properties.join(",") + "] : " +
            "directions ["+ directions.join(",") + "]" +
             " : invalidating cache");
    //<DEBUG

    // paged mode: if sort column/direction changed, clear cache
    
    this.invalidateCache();

    // cache invalidated
    return true;
},

// multi-property sorting

//> @method resultSet.getSort()
// Return the current sort-specification for this ResultSet as an Array of +link{SortSpecifier}s.
// 
// @return  (Array of SortSpecifier) the list of +link{SortSpecifier}s currently applied to 
//  this ResultSet
// @visibility external
//<
getSort : function () {
    return this._sortSpecifiers;
},

getDefaultNormalizer : function (fieldName) {
    var ds = this.getDataSource(),
        field = ds ? ds.getField(fieldName) : null;
    if (field) return field.type;
},        

//> @method resultSet.setSort()
// Sort this ResultSet by the passed list of +link{SortSpecifier}s. 
// <P>
// If the ResultSet is already sorted and this method is called with an identical list of
// specifiers, this method will no-op.  To cause data to be resorted with the same set of
// specifiers, use +link{resultSet.resort, resort()}.
// <P>
// To clear an existing sort, pass in explicit null or empty array.
//
// @visibility external
//<


setSort : function (sortSpecifiers, init, keepLocalData) {
    var serverSorts = [],
        sameSorts = [],
        field
    ;
    if (sortSpecifiers == null) sortSpecifiers = [];

    for (var i = 0; i < sortSpecifiers.length; i++) {
        var item = sortSpecifiers[i];
        // If we were passed a null normalizer - use the field type as normalizer instead.
        // (May still be null, in which case array sorting will try to derive from actual elements)
        if (item.normalizer == null) {
            item.normalizer = this.getDefaultNormalizer(item.sortByProperty ? item.sortByProperty : item.property);
        }

        // If the sort property has a displayField defined and either no optionDataSource or the 
        // same opDS as this data model's DS, sort by the displayField
        //
        // note: sanity check for isA.String() in just in case this property was serialized
        // from sortSpecifiers
        if (item.context  && !isc.isA.String(item.context)) {
            var undef,
                dsField = this.getDataSource().getField(item.property),
                field = item.context.getField(item.property) || dsField;

            
            var displayField = field && field.displayField;
            if (displayField === undef) displayField = dsField && dsField.displayField;
            var sortByDisplayField = field && field.sortByDisplayField;
            if (sortByDisplayField === undef) sortByDisplayField = dsField && dsField.sortByDisplayField;
            
            if (displayField && (sortByDisplayField != false)) {
                var opDs = (field && field.optionDataSource) ||
                            (dsField && dsField.optionDataSource);
                if (opDs) {
                    opDs = isc.DataSource.getDataSource(opDs);
                }

                if (!opDs || opDs == isc.DataSource.getDataSource(this.dataSource)) {
                //if (!field.optionDataSource || opDs == isc.DataSource.getDataSource(this.dataSource)) {
                    this.logInfo("Field:" + field.name + " has displayField:" + displayField +
                        " (with optionDataSource:" + opDs + "). " +
                        "Sorting by displayField. Set field.sortByDisplayField to false to disable this.",
                        "sorting");
                    // store the original fieldName as the owningProperty - used when editing
                    // this sortSpecifier later, in a MultiSort[Panel/Dialog]
                    item.owningField = item.property;
                    
                    if (!item.sortByField && !field.sortByField) {
                        item.property = displayField;
                    } else if (!item.sortByProperty) {
                        // only clobber the sortByProperty if it's currently unset 
                        item.sortByProperty = displayField;
                    }
                }
            }
        }

        // if called from resultSet.resort(), don't check for the same specifiers, just rerun
        if (!this._resorting) {
            // If the sort-specs appear the same, remember the same items
            if (this._sortSpecifiers && this._sortSpecifiers.length > 0) {
                var matchProps = {
                    property : item.property,
                    direction : item.direction
                };
                
                if (item.normalizer != null &&
                    item.normalizer != this.getDefaultNormalizer(item.property) &&
                    !item.normalizer._derivedFromValueMap) 
                {
                    matchProps.normalizer = item.normalizer;
                }
                var itemIndex = this._sortSpecifiers.findIndex(matchProps);
                if (itemIndex == i) {
                    sameSorts.add(item);
                }
            }
        }
    }

    // If we're already sorted as appropriate, no-op.
    if ((this._sortSpecifiers ? this._sortSpecifiers.length : 0) == sortSpecifiers.length &&
        sortSpecifiers.length == sameSorts.length) 
    {
        return;
    }
    
    // store both the sortSpecifiers for client sorting and the server sort strings
    this._sortSpecifiers = isc.shallowClone(sortSpecifiers);

    // We need to also set server sort
    // - if client sorting has been disabled, the server must sort for us
    // - if we are using paging, the server must sort for us, since server and client sort may
    //   not agree
    
    // Use the standard DS.getSortBy() method to convert from sort specifiers into server sort strings
    this._serverSortBy = isc.shallowClone(isc.DS.getSortBy(sortSpecifiers));

    if (!init) return this._doSort(keepLocalData);
},

//> @method resultSet.resort()
// Forcibly resort this ResultSet by the current list of +link{SortSpecifier}s.
// @visibility external
//<
resort : function () {
    this._resorting = true;
    this.setSort(isc.shallowClone(this._sortSpecifiers));
    delete this._resorting;
},

// Handling Updates
// --------------------------------------------------------------------------------------------

// We have various cases where local data manipulation needs to fire dataChanged() to notify
// components that they need to refresh rows, etc.
// We use _startChangingData() / _doneChangingData() [Array / List APIs] to handle threads where
// these manipulations as a result of new data arriving from the server, etc, to avoid firing
// dataChanged multiple times for a single change.

// dataArrived() is a ResultSet specific notification API for new data being introduced into the 
// cache (typically from a server fetch)
// the _startDataArriving() / _doneWithDataArriving() methods are analagous to
// _startChaningData() / _doneChaningData() for the dataArrived notification
_startDataArriving : function () {
    var undef;
	if (this._dataArriveFlag === undef) this._dataArriveFlag = 0;
	this._dataArriveFlag++;
},

_doneDataArriving : function (startRow,endRow, suppressHandler) {
    if (--this._dataArriveFlag == 0) {
        if (!suppressHandler && this.dataArrived) this.dataArrived(startRow, endRow);
    }
},

_isDataArriving : function () {
    return (this._dataArriveFlag != null && this._dataArriveFlag > 0); 
},



// externally called by DataSource when an update operation succeeds on our datasource
dataSourceDataChanged : function (dsRequest, dsResponse) {
    // Respect the flag to never synch cache
    if (this.disableCacheSync) return;
    
    //>DEBUG
    if (this.logIsDebugEnabled()) this.logDebug("dataSource data changed firing");
    //<DEBUG
    
    // If the server failed to return the updated records, and updateCacheFromRequest is true,
    // integrate the submitted values into the cache if the operation was succesful.
    var updateData = this.getDataSource().getUpdatedData(dsRequest, dsResponse, 
                                                   this.updateCacheFromRequest, true);
                                                   
    // Give transformData an opportunity
    if (this.transformData && this.transformUpdateResponses !== false) {
        var transformedData = this.transformData(updateData, dsResponse);
        updateData = transformedData == null ? updateData : transformedData;
    }
    
    this.handleUpdate(dsRequest.operationType, updateData, dsResponse.invalidateCache, dsRequest);
},

handleUpdate : function (operationType, updateData, forceCacheInvalidation, dsRequest) {
    if (isc._traceMarkers) arguments.__this = this;
    
    var message = (this.allMatchingRowsCached() ? ", allMatchingRowsCached true"
                            : (", cached rows: " + this.cachedRows + 
                               ", total rows: " + this.totalRows));

    // invalidate the cache if explicitly told to..
    if (this.dropCacheOnUpdate || forceCacheInvalidation || 
        // or if we're unable to safely update the cache in place: 
        // - "add" or "update" operation
        (operationType != "remove" && 
         // - cache is partial
         !this.allMatchingRowsCached() &&
         // - not configured to update a partial cache
         !this.shouldUpdatePartialCache()))
    {
        

        // observers such as a ListGrid will notice this cache invalidation and trigger a fetch
        // for replacement data, as necessary
        this.invalidateCache();
        return;
    }

    this.logInfo("updating cache in place after operationType: " + operationType + message);
    // suppress dataChanged until complete
    this._startChangingData();

    // _doneChangingData() will fire 'dataChanged' on this ResultSet.
    // We have (undocumented) parameters indicating what the change type was / which records were
    // effected etc, which allows components to react intelligently to changes in some cases
    // _lastUpdateData and _lastUpdateOperation are used to track this.
    // Note - typically a DataSource operation will affect only a single record - but for 
    // simplicity and efficiency we support devs passing multiple records to dataSource.updateCaches()
    // - in this case we'll get a standard DS operation type but multiple records will be affected.
    // In this case rather than tracking each modified record/rowNum we pass in the operationType only
    // and assume code that overrides or observes dataChanged will handle this.
    
    
    this._lastUpdateOperation = operationType;
    if (isc.isAn.Array(updateData)) {
        if (updateData.length == 1) {
            this._lastUpdateData = updateData[0];
        } else if (updateData.length > 0) {
            this._lastUpdateDataArray = updateData;
        }
    } else if (updateData != null) {
        this._lastUpdateData = updateData;
    }
	// otherwise, update our cache in place.  Note our cache is filtered, so we may just
    // discard the update if the new row doesn't pass the filter
	this.updateCache(operationType, updateData, dsRequest);
	this._doneChangingData();
	
	// clear the _lastUpdate... flags so we don't erroneously assume future calls to 
	// doneChangingData() came from an update operation
	this._lastUpdateOperation = this._lastUpdateData = null;
},

// notifyOnUnchangedCache: If a dataSource operation updates this resultSet's underlying data set but
// doesn't effect the cache (EG a record is updated which doesn't match filter criteria), should
// dataChanged be fired.
notifyOnUnchangedCache:false,

// Override doneChangingData to pass updated row info to dataChanged if a single record was
// modified

_doneChangingData : function (operation, filterChanged, dataFromCache) {
    
    // If we're dealing with a single row update we can test for the case where the filtered cache
    // wasn't updated at all (and we don't need to fire dataChanged)
    // Note that _lastUpdateData will only be set if a single row was present in the updateData
    
    
    // Specific cases:
    // for delete operations we set the _lastUpdateRow to the original position of the removed
    // record in the cache (if present)
    // if we didn't have the record in the cache (had a partial cache) but it matched filter 
    // criteria (the length was affected) this._lastUpdateData was cleared so we won't hit this
    // check - fire dataChanged with no params.
    //
    // for add operations we set the _lastUpdateRow flag if we're adding the record to the cache
    // if it's not present.  (but _lastUpdateData is present implying a single record was 
    // returned) we can assert that it didn't match criteria so didn't affect the cache
    //
    // for update operations, if the cache was affected we always set the _lastUpdateRow flag
    // (_lastOrigRecord will only be present if the row was present in the cache before the
    // update)
    //
    // so _lastUpdateData being set, and no _lastUpdateRow implies the update didn't affect our
    // cache
    var unmodifiedCache;
    if (!this.notifyOnUnchangedCache && this._lastUpdateData && this._lastUpdateRow == null) {
        unmodifiedCache = true;
    }
    var record, row;
    if (!unmodifiedCache && (this._lastUpdateData || this._isArrayUpdate)) {
        operation = this._lastUpdateOperation;
        // Note if 'isArrayUpdate' is true, record / row will be null.
        // Downstream code should expect this.
        record = this._lastOrigRecord;
        row = this._lastUpdateRow;   
//           this.logWarn("update - operation:" + operation + 
//                        (this._isArrayUpdate ? " - array update." :
//                            ", rowNum:"+ row + ", orig record:" + this.echo(record) +
//                            ", updated record:"+ this.echo(this.get(row))
//                        )
//                       );
    }

    // decrement the _dataChangeFlag even if the cache isn't modified so we can track when
    // to actually fire dataChanged
	if (--this._dataChangeFlag == 0 && !unmodifiedCache) {
        this.dataChanged(operation, record, row, this._lastUpdateData, filterChanged, dataFromCache);
        // clear all 'single row update' type flags unconditionally once we fire dataChanged
        delete this._lastUpdateOperation;
        delete this._lastUpdateDataArray;
        delete this._lastOrigRecord;
        delete this._lastUpdateRow;
        delete this._lastUpdateRecord;
        delete this._lastUpdateData;
        delete this._isArrayUpdate;
        
    }
},

// NOTE: when we are updating a full cache for the current filter, this depends on local
// filtering being equivalent to server filtering, otherwise:
// - if the server filter is more constrained (common), the client may retain rows that should
//   disappear (temporary and mostly harmless)
//   - to avoid: set dropCacheOnUpdate OR just ensure server does not return rows that should
//     not appear to user
// - if the server filter is more permissive (rare), the client may drop rows that should appear
//   (alarming: user sees the row he just updated vanish)
//   - to avoid: set dropCacheOnUpdate
// 
// 2 caches to consider:
// this.localData represents the current data-set that passes our filter criteria
// this.allRows (if set) represents the entire set of data we've been passed by the server.
// In local filtering mode, or if we've performed a fetch with empty criteria this will be
// the entire data set for the dataSource - otherwise will be the results matching the least
// restrictive filter that has been peformed.
// - See setCriteria() for more on this
//
// Therefore every time we need to integrate modified data into the resultSet 
// (removing, adding or updating rows), we need to ensure that if this.allRows is present we
// manipulate that cache, and we also manipulate this.localData.
// We achieve this by:
// - if this.allRows is present, modify that cache of rows, and call filterLocalData() to 
//   re-generate this.localData based on the new set of data in that method. 
//   ** It might be more efficient to explicitly manipulate both arrays rather than regenerating
//      this.localData
// - if this.allRows is not present, modify this.localData directly to integrate the new data 
//   in.
updateCache : function (operationType, updateData, dsRequest) {
    if (updateData == null) return;
    operationType = isc.DS._getStandardOperationType(operationType);

    // override operationType to replace for realtimeUpdate datasources because the
    // realtimeUpdate may beat the original response to us depending on various factors.  We
    // don't bother to try to de-dup because it's complicated just replace into the cache.
    // This could be mean that some logic runs more than once, but any such logic really should
    // be idempotent, so it should only be an efficiency issue.
    if (this.dataSource.realtimeUpdates && operationType == "add") operationType = "replace";
    
	if (!isc.isAn.Array(updateData)) updateData = [updateData];

	//>DEBUG
    if (this.logIsInfoEnabled()) {
        var compStr = (dsRequest.componentId ? " submitted by '" + dsRequest.componentId + "'" :
                        " (no componentID) ");
        this.logInfo("Updating cache: operationType '" + operationType + "'" + compStr + "," + 
                     updateData.length + " rows update data" +
                     (this.logIsDebugEnabled() ? 
                      ":\n" + this.echoAll(updateData) : ""));
    } //<DEBUG

	switch (operationType) {
	case "remove":
        this.removeCacheData(updateData, dsRequest);
		break;
	case "add":
        this.addCacheData(updateData, dsRequest);
		break;
	case "replace":
	case "update":
        this.updateCacheData(updateData, dsRequest);
		break;
	}

    // if we did an "add" or "update" against a partial cache, row numbering may be invalid
    // relative to server-sider order.  Set a one-time flag that causes cache to be invalidated
    // the next time fetchRemoteData is called.
    if (this.shouldUpdatePartialCache() && operationType != "remove" && 
        !this.allMatchingRowsCached()) 
    {
        this.invalidateRowOrder();
    }
    
    var removed = ((operationType == "remove") ||
                    (operationType == "update" && this._lastUpdateRecord == null));
    
    // if the "allRows" cache is present it will have been updated by the above logic, and 
    // this.localData is stale.  We need to re-derive the set of rows that pass the 
    // filter if necessary.  Don't filter if we are configured to neverDropUpdatedRows.
    
    if (this.allRows && !this.shouldNeverDropUpdatedRows()) {
        this.filterLocalData();
    }
    // If we did a local filter, recalculate which row in the cache was affected.
    // Note _lastUpdateRecord comes from the case where a record is newly added to the cache
    var lastUpdateRecord = this._lastUpdateRecord || this._lastOrigRecord;
    if (!removed && lastUpdateRecord != null) {
        var index = this.indexOf(lastUpdateRecord);
        // This implies that the new record was present in the
        // super cache (allrows) but not in the filtered cache (doesn't meet criteria),
        // so there's no visible change.
        if (index == -1) {
            delete this._lastUpdateRow;
            delete this._lastUpdateRecord;
            delete this._lastOrigRecord;
        } else {
            this._lastUpdateRow = index;
        } 
    }
}, 

updateCacheData : function (updateData, dsRequest) {
	if (!isc.isAn.Array(updateData)) updateData = [updateData];

    // NOTE: if allRows is present we are performing a local filter to display a subset of
    // this set of rows.
    // (This may be the entire dataSet for the dataSource - in which case we're in local mode,
    // or just the matching rows for our less restrictive `allRowsCriteria`.)
    var filteringOnClient = this.allRows != null,
        updateFullLength = (!filteringOnClient && this.isPaged() && this.totalRows != null),
        cache = (filteringOnClient ? this.allRows : this.localData),
        updatedRows = 0, removedRows = 0, addedRows = 0,
        notifyAdd = (cache == this.localData && this._dataAdd != null),
        notifyAdded = (cache == this.localData && this._dataAdded != null),
        notifyRemove = (cache == this.localData && this._dataRemove != null),
        notifyRemoved = (cache == this.localData && this._dataRemoved != null),
        notifySplice = (cache == this.localData && this._dataSplice != null),
        notifySpliced = (cache == this.localData && this._dataSpliced != null);

    var criteria = (filteringOnClient ? this.allRowsCriteria : this.criteria),
        // Don't drop the updated row if neverDropUpdatedRows
        dontDrop = this.shouldNeverDropUpdatedRows(),
        dataSource = this.getDataSource(),
        keyColumns = dataSource.getPrimaryKeyFields()
    ;

    var iCrit = this.getImplicitCriteria(),
        ds = this.getDataSource()
    ;
    if (iCrit) criteria = ds.combineCriteria(criteria, iCrit);

    for (var i = 0, updateDataLength = updateData.length; i < updateDataLength; ++i) {

        var updateRow = updateData[i],
	        keyValues = isc.applyMask(updateRow, keyColumns);

        // Find the index of the old row.
        var index = dataSource.findByKeys(keyValues, cache);

        // See if the new row matches the filter criteria.
        var matchesFilter = (this.applyFilter([updateRow], criteria, this.context).length > 0);

        
        if (index == -1) {

            // If we didn't find the record in our cache, check for the case where the server
            // returned a changed (bad) primary key value for an update of an existing record.
            // In this case warn, and clear out the original version of the record.
            var submittedRecord = dsRequest.data;
            if (isc.isAn.Array(submittedRecord)) submittedRecord = submittedRecord[0];
            // dsRequest.data can validly be null if DataSource.updateCaches() has been called
            // to propagate cache updates where there was no dsRequest sent by this browser.
            if (submittedRecord) {
                // pare down to PKs and find in our data-set
                submittedRecord = isc.applyMask(submittedRecord, keyColumns);
                var oldRecordIndex = this.getDataSource().findByKeys(submittedRecord, cache); 
                if (oldRecordIndex != -1) {
                    this.logWarn("Update operation - submitted record with primary key value[s]:" + 
                                this.echo(submittedRecord) + " returned with modified primary key:" + 
                                this.echo(keyValues) + ". This may indicate bad server logic. " + "Updating cache to reflect new primary key.");

                    // remove the old record from our dataSet. If it matches filter, we'll re-add below
                    removedRows++;
                    var oldRecord = cache.get(oldRecordIndex);
                    if (notifyRemove) {
                        this._dataRemove(oldRecord, 1, oldRecordIndex);
                    }
                    cache.removeAt(oldRecordIndex);
                    if (updateFullLength) {
                        --this.totalRows;
                    }
                    --this.cachedRows;
                    if (notifyRemoved) {
                        this._dataRemoved(oldRecord, 1, oldRecordIndex);
                    }

                    // this is a weird case - don't attempt to fire row-specific dataChanged
                    delete this._lastUpdateData;
                }
            }

            
            if (matchesFilter && cache != null) {
                // We got an updated row that matches our filter criteria but is not in the
                // cache.  This could indicate either:
                // - an "update" operation submitted by a separate grid, form or manual call
                //   to dataSource.updateData(), changing an existing row so that it now
                //   matches our criteria, or
                // - an "update" operation was submitted based on a record we have cached, but
                //   there's a server bug where the server returned the wrong PK, so we
                //   couldn't locate the row.  In this second case we've already removed the
                //   original record, so it's appropriate to re-add the "new" record to the
                //   cache.
                this.logInfo("updated row returned by server doesn't match any cached row, " +
                             " adding as new row.  Primary key values: " + this.echo(keyValues) +
                             ", complete row: " + this.echo(updateRow));
                addedRows++;

                var updateRowIndex = -1;
                if (notifyAdd) {
                    if (cache.sortUnique) {
                        updateRowIndex = cache.lastIndexOf(updateRow);
                    }
                    if (updateRowIndex == -1) {
                        cache.add(updateRow);
                        updateRowIndex = cache.lastIndexOf(updateRow);
                        cache.remove(updateRow);
                    }
                    this._dataAdd(updateRow, 1, updateRowIndex);
                }
                cache.add(updateRow);
                if (updateFullLength) {
                    ++this.totalRows;
                }
                ++this.cachedRows;
                if (notifyAdded) {
                    if (!notifyAdd) {
                        updateRowIndex = cache.lastIndexOf(updateRow);
                    }
                    this._dataAdded(updateRow, 1, updateRowIndex);
                }

                // In this case we are adding a row to the cache.
                // If it's being added to the filtered cache figure out the new rowNum here.
                if (updateDataLength == 1) {
                    // Actually store a pointer to the new row.  If we just added the record
                    // to the allRows cache this can be used to calculate the position within
                    // the local cache when the calling method does a local filter.
                    this._lastUpdateRecord = updateRow;
                    this._lastUpdateRow = cache.length - 1;
                } else {
                    this._isArrayUpdate = true;
                }
            } else {
                // This update applies to a row that is not in our cache *and* doesn't match
                // our criteria---just ignore.
            }
        } else {
            // Found the original row (matching primary keys) in our cache.

            if (updateDataLength == 1) {
                var origRecord = cache.get(index);
                // catch the case where the orig record is present in the allRows cache but doesn't
                // match filter criteria for local data
                if (filteringOnClient) {
                    if (this.applyFilter([origRecord], this.criteria, this.context).length == 0 &&
                        this.applyFilter( updateData,  this.criteria, this.context).length == 0)
                    {
                        origRecord = null;
                    }
                }
                // if the original record was in the (filtered) cache, we'll pass it to
                // dataChanged as a parameter
                this._lastOrigRecord = origRecord;
                // also hang onto the position now. If the record is updated it won't change without
                // a sort, and if it's removed we won't be able to pick it up later
                if (origRecord) {
                    this._lastUpdateRow = this.indexOf(origRecord);
                }
            } else {
                this._isArrayUpdate = true;
            }

            if (matchesFilter || dontDrop) {
                // update the row in place if any of the following is true:
                // - the updated row passes the current filter
                // - we are configured to never drop updated rows
                // - we're actually updating the complete client-side cache, not just the list
                //   of rows that match the filter
                // Note that we use set() instead of just always removing and adding every time
                // because it maintains the record's index when there's no current sort order
                updatedRows++;
                
                // applyUpdatesToExistingRecord - this flag causes us to copy properties
                // onto the record currently in our cache rather than replacing it
                
                var oldRow = cache.get(index);

                if (this.applyUpdatesToExistingRecord) {
                    isc.addProperties(oldRow, updateRow);
                    
                    var ds = this.getDataSource();
                    var fieldNames = ds.getFieldNames(); 
                    for (var j = 0; j < fieldNames.length; j++) {
                        var name = fieldNames[j];
                        if (!updateRow.hasOwnProperty(name)) delete oldRow[name];
                    }
                } else {

                    if (notifySplice) {
                        this._dataSplice(oldRow, 1, index, updateRow, 1);
                    }
        		    cache.set(index, updateRow);
    


                    if (notifySpliced) {
                        this._dataSpliced(oldRow, 1, index, updateRow, 1);
                    }
                }
            } else {
                // otherwise, row has been changed so that it does not match filter, 
                // remove the old row
                //>DEBUG
                if (this.logIsDebugEnabled()) {
                    this.logDebug("row dropped:\n" + this.echo(updateRow) +
                                 "\ndidn't match filter: " + this.echoFull(criteria));
                }
                //<DEBUG

                removedRows++;
                var oldRow = cache.get(index);
                if (notifyRemove) {
                    this._dataRemove(oldRow, 1, index);
                }
                cache.removeAt(index);
                if (updateFullLength) {
                    --this.totalRows;
                }
                --this.cachedRows;
                if (notifyRemoved) {
                    this._dataRemoved(oldRow, 1, index);
                }
            }
        }
    }

    if (this.logIsDebugEnabled()) {
        this.logDebug("updated cache: "
             + addedRows + " row(s) added, "
             + updatedRows + " row(s) updated, "
             + removedRows + " row(s) removed.");            
    }   

    // reapply current sort to localData if appropriate
    
    if (!filteringOnClient &&
        (!this.shouldUpdatePartialCache() || this.allMatchingRowsCached()) &&
        this.canSortOnClient())
    {
        this._doSort();
    }
},

removeCacheData : function (updateData) {
	if (!isc.isAn.Array(updateData)) updateData = [updateData];
    // if we're currently filtering on the client, manipulate this.allRows, and
    // we'll re-derive this.localData later. Otherwise interact directly with this.localData 
    var filteringOnClient = this.allRows != null,
        cache = filteringOnClient ? this.allRows : this.localData,
        removedRows = 0;

    // For paged data-sets (without a complete cache), this.totalRows is used to determine
    // how many rows exist. Update full length so that we don't advertise rows that don't exist
    // Not required for local/basic rs where we look at localData.length directly
    var updateFullLength = (cache == this.localData && this.isPaged() && this.totalRows != null);

    // Remove any rows that were present in the cache.
    if (cache != null) {
        var ds = this.getDataSource(),
            notifyRemove = (cache == this.localData && this._dataRemove != null),
            notifyRemoved = (cache == this.localData && this._dataRemoved != null);
        var criteria = ds.combineCriteria(this.getImplicitCriteria(), this.criteria);
        for (var i = 0, updateDataLength = updateData.length; i < updateDataLength; ++i) {
            var index = ds.findByKeys(updateData[i], cache);
            if (index != -1) {
                var origRecord = cache[index];
                if (updateDataLength == 1) {
                    // Only pass the removed row to dataChanged if it was present in the
                    // local (filtered) cache.

                    if (!filteringOnClient ||
                        ds.recordMatchesFilter(origRecord, criteria, this.context))
                    {
                        this._lastOrigRecord = origRecord;
                        // If we're not looking at the allRows cache the filtered index may not
                        // equal the position in the cache so use indexOf().
                        this._lastUpdateRow = this.indexOf(this._lastOrigRecord);
                    }
                } else {
                    this._isArrayUpdate = true;
                }

                if (notifyRemove) {
                    this._dataRemove(origRecord, 1, index);
                }
                cache.removeAt(index);
                if (updateFullLength) {
                    --this.totalRows;
                }
                --this.cachedRows;
                if (notifyRemoved) {
                    this._dataRemoved(origRecord, 1, index);
                }
                removedRows++;
            } else {
                // Removal of a record not in our cache.  Can happen if grid.removeData() is
                // called on a grid with different filter criteria.

                // We have a complete cache for our criteria.  Nothing to do.
                if (this.allMatchingRowsCached()) continue;

                // If we have a partial cache, use client-side filtering to determine whether
                // this removal has reduced the number of records that match our criteria
                // (which should affect this.totalRows)
                if (ds.applyFilter([updateData[i]], criteria, this.context).length > 0) {
                    if (this.logIsDebugEnabled()) {
                        this.logDebug("removed record matches filter criteria: " +
                                      this.echo(updateData[i]));
                    }
                    // Clear the _updateData so we don't attempt to pass params to the
                    // dataChanged method in this case.
                    // Note that we will still need to fire dataChanged since the length has
                    // changed.
                    if (this._lastOrigRecord == null) delete this._lastUpdateData;
                    removedRows++;
                } else {
                    // Row doesn't match our criteria.  Ignore it.
                    if (this.logIsDebugEnabled()) {
                        this.logIsDebugEnabled(
                            "cache sync ignoring 'remove' operation, removed " +
                            " row doesn't match filter criteria: " + this.echo(updateData[i]));
                    }
                }
            }
        }
    }
},

// add rows that pass filtering, then sort the cache if we're in client-side sort mode
addCacheData : function (newRows) {
    var undef;
    if (newRows == null) return;
	if (!isc.isAn.Array(newRows)) newRows = [newRows];

    // if we have the entire dataset cached (allRows != null), add the new rows to the cache of
    // the entire dataset regardless.  Subsequent client-side filtering will eliminate them if
    // they don't match the filter criteria.
    // Also do not attempt to filter if client-side filtering is disabled.
    var validRows;
	if (this.allRows == null || !this.shouldUseClientFiltering()) {
        // pass getCombinedCriteria(), which includes RS and DBC implicitCriteria
        validRows = this.applyFilter(newRows, this.getCombinedCriteria(), this.context);
    } else {
        validRows = newRows;
        if (this.allRowsCriteria) {
            // call this.applyFilter() rather than ds.applyFilter()
            validRows = this.applyFilter(validRows, this.allRowsCriteria, this.context);
        }
    }
    var numValidRows = validRows.length,
        addingSingleRow = false;
    if (numValidRows != newRows.length) {
        this.logInfo("Adding rows to cache, " + numValidRows + " of " + newRows.length +
                     " rows match filter criteria");
    } else if (numValidRows == 1) {
        // flag that we're adding a single row to the cache (so should pass the 
        // rowNum to dataChanged)
        addingSingleRow = true;
    }
    var cache = this.allRows || this.localData;
    if (!cache) return;

    var notifyAdd = (cache == this.localData && this._dataAdd != null),
        notifyAdded = (cache == this.localData && this._dataAdded != null);

    // Whether to update full length so that the new rows show up.
    var updateFullLength = (this.isPaged() && !this.allRows && this.totalRows != null);

    var flag = (!this.allMatchingRowsCached() && this.shouldUpdatePartialCache()),
        range = flag && this.getCachedRange();

    if (range) {
        // Design:
        // - if we are at the end of the dataset add the new row there.  This works nicely
        //   for inline edit of new rows in a paged dataset, which is always at the end of
        //   the dataset.
        // - otherwise, if there is any cache at beginning of the dataset (rowIsLoaded(0)),
        //   add there.  This works nicely for eg a form adding data to a paged dataset where
        //   the user has not scrolled
        // - finally, add at the end of the last requested contiguous cached range.  This
        //   works well for link-based paging and other alternative paging interfaces
        var index;
        if (range[1] == this.getLength()-1 || !this.rowIsLoaded(0)) {
            index = range[1] + 1;
        } else {
            index = 0;
        }

        if (notifyAdd && numValidRows > 0) {
            this._dataAdd(validRows, validRows.length, index);
        }
        cache.addListAt(validRows, index);
        if (updateFullLength) {
            this.totalRows += numValidRows;
        }
        this.cachedRows += numValidRows;
        if (notifyAdded && numValidRows > 0) {
            this._dataAdded(validRows, validRows.length, index);
        }
        // if we re-sort this will be dropped
        // if we perform a local filter this will be updated
        if (addingSingleRow) this._lastUpdateRow = index;
        else if (numValidRows > 0) this._isArrayUpdate = true;
    } else {
        // add at the end - they will be sorted into place
        var index;
        if (notifyAdd || notifyAdded) {
            var sortUnique = cache.sortUnique;
            for (var i = 0, len = numValidRows; i < len; ++i) {
                
                var newRecord = validRows[i],
                    newRecordIndex = -1;
                if (notifyAdd) {
                    if (sortUnique) {
                        newRecordIndex = cache.lastIndexOf(newRecord);
                    }
                    if (newRecordIndex == -1) {
                        
                        cache.add(newRecord, undef, true);
                        newRecordIndex = cache.lastIndexOf(newRecord);
                        cache.remove(newRecord);
                    }
                    this._dataAdd(newRecord, 1, newRecordIndex);
                }
                cache.add(newRecord, undef, true);
                if (updateFullLength) {
                    ++this.totalRows;
                }
                ++this.cachedRows;
                if (notifyAdded) {
                    if (!notifyAdd) {
                        newRecordIndex = cache.lastIndexOf(newRecord);
                    }
                    this._dataAdded(newRecord, 1, newRecordIndex);
                }
                if (addingSingleRow) {
                    if (newRecordIndex == -1) {
                        newRecordIndex = cache.lastIndexOf(newRecord);
                    }
                    index = newRecordIndex;
                }
            }
        } else {
            cache.addList(validRows);
            if (updateFullLength) {
                this.totalRows += numValidRows;
            }
            this.cachedRows += numValidRows;
            
            if (addingSingleRow) index = cache.lastIndexOf(validRows[0]);
        }
        if (addingSingleRow) {
            this._lastUpdateRow = index;
        } else if (numValidRows > 0) {
            this._isArrayUpdate = true;
        }
    }
    // store a pointer to the record as well as the row. This can be used to calculate the
    // index within the local cache if we just added the record to the allRows cache.
    if (this._lastUpdateRow != null) {
        this._lastUpdateRecord = cache[this._lastUpdateRow];
    }

    // if we can sort locally, do so now
    if (this.canSortOnClient()) this._doSort();
},



insertCacheData : function (insertData, position, skipAllRows) {
	if (!isc.isAn.Array(insertData)) insertData = [insertData];
    
    if (this.allRows && this.allRows != this.localData && !skipAllRows) {
        this.allRows.addListAt(insertData, position);
    }

    // Whether to update full length (so that we don't advertise rows that don't exist).
    var updateFullLength = (this.isPaged() && this.totalRows != null);

    var cache = this.localData;
    if (this._dataAdd != null) {
        this._dataAdd(insertData, insertData.length, position);
    }
    // insert the rows into the cache
    cache.addListAt(insertData, position);
    if (updateFullLength) {
        this.totalRows += insertData.length;
    }
    for (var i = insertData.length; i--; ) {
        if (insertData[i] != null && !Array.isLoading(insertData[i])) {
            ++this.cachedRows;
        }
    }
    if (this._dataAdded != null) {
        this._dataAdded(insertData, insertData.length, position);
    }
},


addSpecialValueRecords : function (valueFieldName, displayFieldName, records) {

    var allRows = this.allRows,
        localData = this.localData,
        localCache = this.isLocal() ? allRows : localData,
        recordAdded = false
    ;

    
    if (localCache) {
        var position = 0
        ;
        for (var i = 0; i < records.length; i++) {
            var value = records[i][valueFieldName],
                matchedIndex = localCache.findIndex(valueFieldName, value),
                addRecord = true
            ;
            if (matchedIndex >= 0) {
                do {
                    var matchedRecord = localCache.get(matchedIndex);
                    if (matchedRecord["_isSpecialValue"]) {
                        if (matchedIndex == position) {
                            // specialValue already exists in the correct location.
                            // make sure displayValue is up-to-date.
                            if (displayFieldName) {
                                matchedRecord[displayFieldName] = records[i][displayFieldName]; 
                            }
                            position++;
                            addRecord = false;
                        } else {
                            // specialValue found but in the wrong place (sorted?).
                            // remove it and allow it to be inserted again in the correct spot.
                            localCache.removeAt(matchedIndex);
                        }
                    }
                    matchedIndex = localCache.findNextIndex(matchedIndex+1, valueFieldName, value);
                } while (matchedIndex >= 0);
            }
            if (addRecord) {
                var skipAllRows = !allRows || allRows == localData || allRows.find(valueFieldName, value);

                records[i]["_isSpecialValue"] = true;
                this.insertCacheData(records[i], position++, skipAllRows);
                recordAdded = true;
            }
        }
    }

    return recordAdded;
},

// Notifications After Handling Updates
// --------------------------------------------------------------------------------------------


_setLocalData : function (newData) {
    var localData = this.localData,
        localDataIsEmpty = (localData == null || localData.isEmpty()),
        localDataLength = (localDataIsEmpty ? 0 : localData.length),
        prevLength = (this.lengthIsKnown() ? this.getLength() : localDataLength),
        newDataIsEmpty = (newData == null || newData.isEmpty()),
        newDataLength = (newDataIsEmpty ? 0 : newData.length),
        prevLengthIsKnown = this.lengthIsKnown();

    // Calculate what the new length of the cache will be.
    this.localData = newData;
    var newLength = (this.lengthIsKnown() ? this.getLength() : newDataLength);
    this.localData = localData;
    
    var prevNullLength = prevLength - localDataLength,
        newNullLength = newLength - newDataLength;

    
    var notify = !(localDataLength + newDataLength == 0 && prevNullLength == newNullLength),
        add = notify && prevLength == 0,
        remove = notify && !add && newDataLength == 0 && prevNullLength >= newNullLength,
        splice = notify && !add && !remove;

    // Fire the pre-change notification.
    var removedRecords, removedLength, addedRecords, addedLength;
    if (add && (this._dataAdd != null || this._dataAdded != null)) {
        if (newDataLength == 0) {
            addedRecords = null;
        } else if (newNullLength == 0) {
            addedRecords = newData;
        } else {
            addedRecords = newData.duplicate();
            addedRecords.length = newLength;
            for (var i = newDataLength; i < newLength; ++i) {
                addedRecords[i] = null;
            }
        }

        if (this._dataAdd != null) {
            this._dataAdd(addedRecords, newLength - prevLength, 0);
        }
    } else if (remove && (this._dataRemove != null || this._dataRemoved != null)) {
        removedLength = localDataLength + prevNullLength - newNullLength;
        if (localDataLength == 0) {
            removedRecords = null;
        } else {
            removedRecords = localData;
            for (var i = localDataLength; i < removedLength; ++i) {
                removedRecords[i] = null;
            }
        }

        if (this._dataRemove != null) {
            this._dataRemove(removedRecords, removedLength, 0);
        }
    } else if (splice && (this._dataSplice != null || this._dataSpliced != null)) {
        removedLength = localDataLength + Math.max(0, prevNullLength - newNullLength);
        if (localDataLength == 0) {
            removedRecords = null;
        } else if (prevNullLength == 0) {
            removedRecords = localData;
        } else {
            removedRecords = localData.duplicate();
            removedRecords.length = removedLength;
            for (var i = localDataLength; i < removedLength; ++i) {
                removedRecords[i] = null;
            }
        }

        addedLength = newDataLength + Math.max(0, newNullLength - prevNullLength);
        if (newDataLength == 0) {
            addedRecords = null;
        } else if (newNullLength == 0) {
            addedRecords = newData;
        } else {
            addedRecords = newData.duplicate();
            addedRecords.length = addedLength;
            for (var i = newDataLength; i < addedLength; ++i) {
                addedRecords[i] = null;
            }
        }

        if (this._dataSplice != null) {
            this._dataSplice(removedRecords, removedLength, 0, addedRecords, addedLength);
        }
    }

    // Actually change the data.
	this.localData = newData;

    // Fire the post-change notifications.
    if (add && this._dataAdded != null) {
        this._dataAdded(addedRecords, newLength - prevLength, 0);
    } else if (remove && this._dataRemoved != null) {
        this._dataRemoved(removedRecords, removedLength, 0);
    } else if (splice && this._dataSpliced != null) {
        this._dataSpliced(removedRecords, removedLength, 0, addedRecords, addedLength);
    }
    this._checkLengthIsKnown(prevLengthIsKnown);
},

_checkLengthIsKnown : function (prevLengthIsKnown) {
    if (this._dataLengthIsKnownChanged != null) {
        var newLengthIsKnown = this.lengthIsKnown();
        if (prevLengthIsKnown != newLengthIsKnown) {
            this._dataLengthIsKnownChanged(prevLengthIsKnown, newLengthIsKnown);
        }
    }
},


_sortLocalDataByProperties : function (properties, directions, normalizers, contexts) {
    

    
    var comparators;
    if (isc.Browser.isFirefox && isc.isA.ResultTree(this._tree) && this._tree.isPaged()) {
        var openNormalizer = this._tree._openNormalizer,
            ascendingComparator = this._tree._openAscendingComparator,
            descendingComparator = this._tree._openDescendingComparator;

        for (var i = normalizers.length; i--; ) {
            if (normalizers[i] === openNormalizer) {
                if (comparators == null) {
                    comparators = new Array(normalizers.length);
                }
                comparators[i] = (directions[i] ? ascendingComparator : descendingComparator);
            }
        }
    }

    
    var notifyMoved = (this._dataMoved != null),
        sortIndex = this.localData.sortByProperties(
            properties, directions, normalizers, contexts, comparators, notifyMoved, false);

    // Since the localData was just sorted and entries were possibly rearranged, reorder allRows
    // using localData if shouldReorderAllRows is set.
    if (this.shouldReorderAllRows && this.allRows != null) this.reorderAllRows();

    if (notifyMoved) {
        

        if (sortIndex != null) {
            

            var localData = this.localData;
            
            for (var i = 0, len = localData.length; i < len; ) {
                var k = sortIndex[i];
                
                if (i < k) {
                    var j = i + 1,
                        l = k;
                    while (j < len && sortIndex[j] == 1 + l) {
                        ++j;
                        ++l;
                    }
                    
                    var n = j - i,
                        records = (n > 1 ? localData.getRange(i, j) : localData[i]);
                    this._dataMoved(records, n, k, i);

                    
                    var leftShift = i - k,
                        rightShift = n;
                    for (var m = i + n; m < len; ++m) {
                        var p = sortIndex[m];
                        if (i <= p && p < k) {
                            sortIndex[m] += n;
                        }
                    }

                    i += n;
                } else {
                    ++i;
                }
            }
            
        }
    }
},


// Paged Mode
// --------------------------------------------------------------------------------------------

// search backward until the first null row is found, and return the row just after it
findFirstCachedRow : function (pos) {
    for (var i = pos; i >= 0; i--) {
        if (this.localData[i] == null) return i+1;
    }
    return 0;
},

// search forward until the first null row is found, and return the row just before it
findLastCachedRow : function (pos) {
    for (var i = pos; i < this.totalRows; i++) {
        if (this.localData[i] == null) return i-1;
    }
    return this.totalRows-1;
},

// It turns out that getRangePaged() can be reentrant.  The call stack is as follows (in an
// LG): fetchRemoteData() -> shows prompt w/clickMask -> clickMask makes a synthetic mouseOut
// call on the GridRenderer of the LG -> GR mouseOut calls this.getCellRecord() which is
// plumbed through to the LG - and that method calls data.get() which leads back to here.
//
// In the reentrant case, we don't want to make a redundant call to the server (which could
// lead to an endless code loop via the reentry case).  So we handle reentry here by simply
// returning the requested rows as a slice of local cache filled with loading markers - exactly
// what getRangePaged() would have returned.
//      
_getRangePaged : function (start, end, ignoreCache, fetchNow) {
    if (this._getRangePagedReentrant) {
        // honor ignoreCache
        var cache = (this.ignoreCache ? [] : this.localData) || [];
        return this.fillRangeLoading(cache.slice(start, end), end-start);
    }    
    this._getRangePagedReentrant = true;
    var result = this.getRangePaged(start, end, ignoreCache, fetchNow);
    delete this._getRangePagedReentrant;
    return result;
},

// NOTE: caller can ask for as many rows as he wants, and we will fetch them all.  It is up to
// the caller to only ask for the rows that are actually really needed
getRangePaged : function (start, end, ignoreCache, fetchNow) {
	if (start < 0 || end < 0) {
		//>DEBUG
		this.logWarn("getRange(" + start + ", " + end + 
					 "): negative indices not supported, clamping start to 0");
		//<DEBUG
		if (start < 0) start = 0;
	}
	if (end <= start) { 
		//>DEBUG
		this.logDebug("getRange(" + start + ", " + end + "): returning empty list");
		//<DEBUG
		return [];
	}

    // if the length is known, ignore or clamp requests for rows beyond the end of the
    // dataset.  Otherwise carelessly issued requests beyond the end of the dataset would cause
    // useless fetches.  Note this implies that if you know that the cache is incomplete
    // because new rows have been inserted, you need to call invalidateCache() to get them.
    var lengthIsKnown = this.lengthIsKnown();
    if (!ignoreCache && lengthIsKnown) {
        var length = this.getLength();
        if (start > length-1 && start != 0) {
            // start is beyond last valid index
		    //>DEBUG
    		this.logWarn("getRange(" + start + ", " + end + 
                         "): start beyond end of rows, returning empty list");
	    	//<DEBUG
            return [];
        } else if (end > length) {
            // end (which is non-inclusive) is beyond last valid index
            end = length;
        }
    }

    if (this.localData == null) {
        this._setLocalData([]);
    }

    // if the "ignoreCache" flag is set, ignore the cache temporarily.  If a caller is aware that
	// that the cache may soon be invalidated, they can use "ignoreCache" to trigger fetches.
	if (ignoreCache) {
		this.realCache = this.localData;
        this._setLocalData([]);
	}

    var localData = this.localData;

	// store the last getRange(), so on cache invalidation we have an idea of the most recently
    // used rows
	this.lastRangeStart = start;
	this.lastRangeEnd = end;

    
    if (this.parallelFetchesRequireLengthKnown !== false && !lengthIsKnown) {
        var currentIndex = this._fetchingRequest,
            invalidIndex = this._invalidatedRequestIndex
        ;
        if (invalidIndex == null ? currentIndex != null : currentIndex > invalidIndex) {
            if (this.logIsInfoEnabled("fetchTrace")) {
    		    this.logInfo("getRange(" + start + ", " + end + "): parallel fetches are " + 
                             "not allowed before the ResultSet length is known - not fetching");
            }
            return this.fillRangeLoading(localData.slice(start, end), end - start);            
        }
    }

    // determine range we don't have (i.e. remember the first and last missing row within the range)
    var firstNonLoadingRow = this._firstLoadingRow(start, end, false),
        missingRows = false,
        firstMissingRow, lastMissingRow;

    if (firstNonLoadingRow == -1) {
        // All of the records in the range from `start` to `end` are already loading.
        missingRows = false;
    } else {
        // Skip the leading and trailing ranges of loading records.
        var startPrime = firstNonLoadingRow,
            endPrime = 1 + this._lastLoadingRow(start, end, false);
        

        for (var i = startPrime; i < endPrime; ++i) {
            if (localData[i] == null) {
                firstMissingRow = i;
                break;
            }
        }
        missingRows = (firstMissingRow != null);
        if (missingRows) {
            for (var i = endPrime - 1; i >= firstMissingRow; --i) {
                if (localData[i] == null) {
                    lastMissingRow = i;
                    break;
                }
            }
        }
    }
    

	// we're done if we have all rows locally
	if (!missingRows) {
		//>DEBUG
		this.logDebug("getRange(" + start + ", " + end + ") satisfied from cache");
		//<DEBUG        
        return this.fillRangeLoading(localData.slice(start, end), end - start);
	}

	// we were missing rows; fetch the rows from the server

	var startRow, endRow;
    if (this.fetchAhead) {
        var fetchAheadRange = this._addFetchAhead(start, end, firstMissingRow, lastMissingRow, 
                                                  ignoreCache);
        startRow = fetchAheadRange[0];
        endRow = fetchAheadRange[1];
    } else { // requested only
		// take the requested range literally, only avoiding refetching of cached rows 
		startRow = firstMissingRow;
		endRow = lastMissingRow+1;
	}

    if (this.alwaysRequestVisibleRows) {
        startRow = start;
        endRow = end;
    }

    // store current start/endRow
    this.fetchStartRow = startRow;
    this.fetchEndRow = endRow;
    
    // Depending on whether fetchDelay is set, getRange() may or may not immediately
    // initiate a fetch.  The data returned to the caller always includes LOADING markers for
    // rows that aren't loaded.  When a fetch is actually initiated, we also write LOADING
    // markers into our cache to prevent duplicate fetches for the same rows.
    //
    // If we do not immediately execute a fetch, we don't immediately write LOADING markers
    // into our cache because subsequent getRange() calls may shift the range of rows that will
    // ultimately be requested, and given concurrent outstanding requests, it wouldn't be clear
    // when to clean up the LOADING markers.
    var returnData;
    if (fetchNow || this.fetchDelay == 0) {
        // fetch rows immediately
        this._fetchRemoteData();
        returnData = this.fillRangeLoading(localData.slice(start, end), end - start);
    } else {
	    // set a timer to fetch rows.  When this fetch ultimately fires it will be based on the
        // most recently calculated fetch range (fetchStartRow/fetchEndRow)
		

        this.fireOnPause("fetchRemoteData", "_fetchRemoteData", this.fetchDelay);
        // return a slice of the cache, with loading markers added for missing rows
        returnData = this.fillRangeLoading(localData.slice(start, end), end - start);
    }

    // restore the real cache
    if (ignoreCache) {
        this._setLocalData(this.realCache);
        this.realCache = null;
    }
    return returnData;
},

// extend the requested range of rows into one full "resultSize" batch
_addFetchAhead : function (requestedStart, requestedEnd, firstMissingRow, lastMissingRow,
                           ignoreCache) 
{
    var localData = ignoreCache ? [] : this.localData,
        length = ignoreCache ? Number.MAX_VALUE : this.getLength(),
        // round out the missing range to one full resultSize
        missingCacheSize = lastMissingRow - firstMissingRow + 1,
        extension = Math.floor((this.resultSize - missingCacheSize)/2),
        cacheCheckStart = Math.max(0, firstMissingRow - extension),
        cacheCheckEnd = Math.min(length, lastMissingRow + extension);

    var loadingRanges = this._loadingRanges,
        numLoadingRanges = loadingRanges.length,
        k = this._getLoadingRangesIndex(cacheCheckStart),
        isLoading = (k % 2 == 0),
        j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);

    // and look for the first and last missing row within the extended range
    for (var i = cacheCheckStart; i <= firstMissingRow; i++) {
        if (i == j) {
            isLoading = !isLoading;
            j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
        }
        if (localData[i] == null || isLoading) {
            break;
        }
    }
    firstMissingRow = i;

    k = this._getLoadingRangesIndex(cacheCheckEnd);
    isLoading = (k % 2 == 0);
    j = (k > 0 ? loadingRanges[--k] : -1);
    for (var i = cacheCheckEnd; i >= lastMissingRow; i--) {
        if (i == j) {
            isLoading = !isLoading;
            j = (k > 0 ? loadingRanges[--k] : -1);
        }
        if (localData[i] == null || isLoading) {
            break;
        }
    }
    lastMissingRow = i;

    //>DEBUG
    this.logDebug("getRange(" + [requestedStart,requestedEnd] +
                 "), cache check: " + [cacheCheckStart, cacheCheckEnd] + 
                 " firstMissingRow: " + firstMissingRow + 
                 " lastMissingRow: " + lastMissingRow); //<DEBUG

    // NOTE throughout:
    // - we don't want to clamp endRow to totalRows because more rows could be
    //   have been added at the server.
    // - make sure we still fetch everything in the requested ranged (when resultSize is
    //   smaller than requested range)
    var startRow, endRow;
    if (firstMissingRow == 0 || 
        (firstMissingRow > cacheCheckStart && lastMissingRow == cacheCheckEnd)) 
    {
        // we have cache at the beginning of the requested range, but none at the end, so
        // we appear to be scrolling forward: fetch a slice stretching forward from the
        // first missing row
		//>DEBUG
		this.logDebug("getRange: guessing forward scrolling");
		//<DEBUG
        startRow = firstMissingRow;
        endRow = startRow + this.resultSize;

        if (endRow < requestedEnd) endRow = requestedEnd;
    } else if (firstMissingRow == cacheCheckStart && lastMissingRow < cacheCheckEnd) {
        // we have cache at the end of the requested range, but none at the beginning, so
        // we appear to be scrolling backward: fetch a slice stretching backward from the
        // last missing row
        //>DEBUG
        this.logDebug("getRange: guessing backward scrolling");
        //<DEBUG
        endRow = lastMissingRow+1; 
        startRow = endRow - this.resultSize;
        if (startRow < 0) startRow = 0;

        if (startRow > requestedStart) startRow = requestedStart;
    } else { 
        // we have no cache in the requested range.  Fetch a slice centered on the middle
        // of the requested range.
        //>DEBUG
        this.logDebug("getRange: no scrolling direction detected");
        //<DEBUG
        startRow = cacheCheckStart;
        endRow = cacheCheckEnd + 1;

        if (startRow > requestedStart) startRow = requestedStart;
        if (endRow < requestedEnd) endRow = requestedEnd;
    }

    // our range to fetch may now stretch outside of the examined part of the cache.
    // Examine the fetchAhead area now to avoid fetching some already cached rows.  This is
    // key, because over-fetching is likely to happen when totalRows is about 2-5x resultSize,
    // or in general when a user is thumb-dragging in a region about 2-5x resultSize. 
    k = this._getLoadingRangesIndex(startRow);
    isLoading = (k % 2 == 0);
    j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
    for (var i = startRow; i < cacheCheckStart; i++) {
        if (i == j) {
            isLoading = !isLoading;
            j = (k + 1 < numLoadingRanges ? loadingRanges[++k] : -1);
        }
        if (localData[i] == null || isLoading) break;
    }
    //if (startRow != i) this.logWarn("trimming startRow from: " + startRow + " to " + i);
    startRow = i;

    k = this._getLoadingRangesIndex(endRow - 1);
    isLoading = (k % 2 == 0);
    j = (k > 0 ? loadingRanges[--k] : -1);
    for (var i = endRow-1; i > cacheCheckEnd; i--) {
        if (i == j) {
            isLoading = !isLoading;
            j = (k > 0 ? loadingRanges[--k] : -1);
        }
        if (localData[i] == null || isLoading) break;
    }
    //if (endRow != i+1) this.logWarn("trimming endRow from: " + endRow + " to " + (i+1));
    endRow = i+1;

	//>DEBUG
	this.logInfo("getRange(" + requestedStart + ", " + requestedEnd + ") will fetch from " + 
				 startRow + " to " + endRow);
	//<DEBUG

    return [startRow, endRow];
},


// Local Mode
// --------------------------------------------------------------------------------------------

//> @method resultSet.filterLocalData() [A]
// Derive the current filtered set of data from the cache of all matching rows.
// <P>
// This method is automatically called by +link{setCriteria()} when criteria have actually
// changed, as well as in various other situations.  You could only need to call this method
// directly if:
// <ul>
// <li> you know that client-side filtering is enabled (+link{useClientFiltering}:true) and
// active +link{allMatchingRowsCached()}.
// <li> you have directly, programmatically modified data within the ResultSet such that it no
// longer matches the filter criteria
// <li> you want your modified records to disappear from the list of visible records (that is,
// those accessible via +link{get()})
// </ul>
// 
// @visibility external
//<

filterLocalData : function () {


    // Sanity check we actually *can* filterLocalData - if not, bail.
    // If this.useClientFiltering is false, we arguably should have this method just no-op.
    // However we don't want to get into a bad state where this.allRows has been specified, but
    // this.localData is unset [meaning this.get(index) and other basic functionality is unavailable]
    if (!this.allRowsCached() && !this.allMatchingRowsCached()) {
        this.logWarn("filterLocalData(): local filtering is not available for this ResultSet - " +
                      "client-side data cache is not complete for the current set of criteria.");
        return;
    }
    
    

    // This method may be called from a ds-data change / cache update - in this case
    // we don't need to call dataChanged() here - it'll get called by the
    // calling code.
    var fireDataChanged = !this._isChangingData();
    if (fireDataChanged) this._startChangingData();


    // If we have any 'special values' in our allRows array, yank them out before filtering and
    // then reapply them
    var allRows = [],
        hasSpecialVals = false,
        specialVals = [],
        cache = this.allRows || this.localData;
    if (cache != null) {
        for (var i = 0; i < cache.length; i++) {
            // Is special val, save it
            if (cache[i]._isSpecialValue) {
                hasSpecialVals = true;
                specialVals.add(cache[i]);
            
            } else if (!hasSpecialVals) {
                allRows = cache;
                break;
            // copy all records which aren't "special values" to a new array.
            // We'll filter that to get basic local data, then add the special values to the top of it.
            } else {
                allRows[allRows.length] = cache[i];
            }
        }        
    }

    var criteria = this.getCombinedCriteria();

    var localData = this.applyFilter(
        allRows, criteria, isc.addProperties({
            dataSource: this
        }, this.context));
    if (hasSpecialVals) {
        localData.addListAt(specialVals, 0);
    }
    // If allRows is currently unpopulated, but we have 'allMatchingRowsCached' it should be safe
    // to copy the current local cache across to this.allRows and populate the allRowsCriteria
    // This indicates that we are filtering locally to any downstream code
    // Note: If this method runs again, the 'allRows' cache will be used and filtered against,
    // wiping the local data and replacing it with a newly filtered set.
    
    if (this.allRows == null) {
        
        this._setAllRows(localData, criteria);
    }
    this._setLocalData(localData);

    //>DEBUG
    if (this.localData != null && this.allRows != null) {
        this.logInfo(
            "Local filter applied: " + this.localData.length + " of " + this.allRows.length +
            " records matched filter:" + this.echoFull(this.criteria), "localFilter");
    }
    //<DEBUG

    // this.localData has changed,  apply sort if we have all the rows
    if (this.allRows != null && this.shouldUseClientSorting()) this._doSort();

    // NOTE: no need to apply sort, as filtering preserves order.

    // fire the dataArrived notification.  Technically, no new data has come from the server,
    // however the dataset as viewed through all public methods (get, getRange, etc) has
    // completely changed.
    // dataFromCache param passed in to indicate new data / changed data satisfied from
    // client-side cache
    
    if (!this._isDataArriving() && this.dataArrived) {
        

        this.dataArrived(0, this.localData.length, true);
    }

	if (fireDataChanged) this._doneChangingData(null, true, true);
},

//> @method resultSet.applyFilter() [A]
// The ResultSet will call applyFilter() when it needs to determine whether rows match the
// current filter criteria.
// <P>
// Default behavior is to call +link{dataSource.applyFilter()} to determine which rows match
// that provided criteria.
// <P>
// Override this method or +link{dataSource.applyFilter()} to implement your own client-side
// filtering behavior.
//
// @param   data        (Array)     the list of rows
// @param   criteria    (Criteria)  the filter criteria
// @param   [requestProperties]     (DSRequest Properties)  dataSource request properties
// @return  (Array)     the list of matching rows
// @visibility external
//<
applyFilter : function (data, criteria, requestProperties) {
    return this.getDataSource().applyFilter(data, criteria, requestProperties);
},

// get a list of all values for a given property.  
// ValuesLists are generally used for "Select Other.." widgets where there's a field that is a
// pseudo-enum: it can have any value, but it IS an enumerated list of eg categories, and we would
// like to avoid having the same category entered twice with a slightly different name.  So we look
// for existing values among all records.
getValuesList : function (property) {
	//>DEBUG
	this.logInfo("asked for valuesList for property '" + property + "'");
	//<DEBUG

    if (this.isLocal()) {
    	if (!this.allRows) {
    		//>DEBUG
    		this.logWarn("asked for valuesList before data has been loaded");
    		//<DEBUG
    		return [];
    	}
    
	    var valuesList = this.allRows.getProperty(property);
    	if (!valuesList) return [];
    	// NOTE: this can contain exactly one null, which we presume is an interesting value.
        // If you don't want the null, call valuesList.remove(null);
    	return valuesList.getUniqueItems();
    }

    // return all unique values that happen to be cached
    var range = this.getCachedRange(),
        values = [];
    for (var i = range[0]; i <= range[1]; i++) {
        var row = this.get(i);
        if (!values.contains(row[property])) values[values.length] = row[property];
    }
    return values;
},

// Cache Management
// --------------------------------------------------------------------------------------------
// Externally callable only by very advanced callers.  Legitimate use cases include:
// - seeding a paged RS' cache with values loaded separately
// - manual cache invalidation for data dependencies not handled automaticallly
// - implementing your own comm layer

//> @method resultSet.fillCacheData() [A]
// Cache rows in this ResultSet's cache at specific positions.
// <P>
// This is used internally by ResultSet, but can also be used to seed a new ResultSet with
// already loaded data.
//
//		@param  newData      (Array of Object)   data to cache
//		@param	[startRow]   (Number)	         optional start index of where new rows should be
//                                               placed in the cache; default 0
// @visibility customResultSet
//<
fillCacheData : function (newData, startRow) {
    var notifyLength = (this._dataLengthIsKnownChanged != null),
        prevLengthIsKnown = notifyLength && this.lengthIsKnown();

    if (startRow == null) startRow = 0;

    this.logDebug("integrating " + newData.length + 
                  " rows into cache at position " + startRow);

    var localDataWasNull = (this.localData == null);
    if (localDataWasNull) {
        this._setLocalData([]);
    }
    var localLength = this.localData.length,
        totalLength = this._getCachedLength(),
        newDataLength = newData.length;

    
    this._setRangeLoading(startRow, startRow + newDataLength, false);

    if (newDataLength == 0) {
        
        startRow = 0;
    }
    var newTotalLength = Math.max(totalLength, startRow + newDataLength),

        
        headNullLength = Math.max(0, startRow - Math.min(localLength, totalLength)),
        tailNullLength = Math.max(0, newTotalLength - Math.max(localLength, startRow + newDataLength)),
        nullLength = headNullLength + tailNullLength,

        add = (newDataLength > 0 && localLength <= totalLength && localLength <= startRow),
        splice = (newDataLength > 0 && !add);

    

    if (nullLength > 0) {
        
        var tempLength = Math.min(localLength, totalLength) + nullLength,
            originalRecords = (
                splice &&
                (this._dataSplice != null || this._dataSpliced != null) &&
                this.localData.slice(totalLength, localLength));

        if (add && this._dataAdd != null) {
            this._dataAdd(null, nullLength, localLength);
        } else if (splice && this._dataSplice != null) {
            this._dataSplice(originalRecords, localLength - totalLength, totalLength, null, nullLength);
        }

        if (localDataWasNull || localLength < tempLength) {
            this.localData.length = tempLength;
        } else if (localLength != tempLength) {
            this.localData = this.localData.slice(0, totalLength);
            this.localData.length = tempLength;
        }

        if (add && this._dataAdded != null) {
            this._dataAdded(null, nullLength, localLength);
        } else if (splice && this._dataSplice != null) {
            this._dataSpliced(originalRecords, localLength - totalLength, totalLength, null, nullLength);
        }

        localDataWasNull = false;
        add = add || splice;
        splice = false;
        localLength = tempLength;
        totalLength += nullLength;
    }

    var removedStartRow = Math.min(startRow, totalLength),
        removedLength = Math.min(newDataLength, Math.max(0, localLength - removedStartRow)),
        originalRecords = (
            splice &&
            (this._dataSplice != null || this._dataSpliced != null) &&
            this.localData.slice(removedStartRow, removedStartRow + removedLength));
    if (add && this._dataAdd != null) {
        this._dataAdd(newData, newDataLength, startRow);
    } else if (splice && this._dataSplice != null) {
        this._dataSplice(originalRecords, removedLength, removedStartRow, newData, newDataLength);
    }

    
    if (localDataWasNull || localLength < totalLength) {
        this.localData.length = newTotalLength;
    } else if (localLength != totalLength) {
        this.localData = this.localData.slice(0, totalLength);
        this.localData.length = newTotalLength;
    }

    for (var i = 0; i < newDataLength; i++) {
        var rowIndex = startRow + i,
            existingRecord = this.localData[rowIndex],
            newRecord = newData[i];

        // Increment this.cachedRows if we cached another row (as opposed to overwriting an
        // existing cached row with fresh data).
        if (newRecord != null) {
            ++this.cachedRows;
        }
        if (existingRecord != null && !Array.isLoading(existingRecord)) {
            --this.cachedRows;
        }

        this.localData[rowIndex] = newRecord;
    }

    if (add && this._dataAdded != null) {
        this._dataAdded(newData, newDataLength, startRow);
    } else if (splice && this._dataSpliced != null) {
        this._dataSpliced(originalRecords, removedLength, removedStartRow, newData, newDataLength);
    }

    if (notifyLength) {
        var newLengthIsKnown = this.lengthIsKnown();
        if (prevLengthIsKnown != newLengthIsKnown) {
            this._dataLengthIsKnownChanged(prevLengthIsKnown, newLengthIsKnown);
        }
    }
    this._localDataValid = true;

    if (this.allRowsCached()) {
        this._setAllRows(this.localData, this.criteria);
    }
},

//> @method ResultSet.setFullLength() [A]
// Set the total number of rows available from the server that match the current filter 
// criteria for this ResultSet.
// <P>
// This is an advanced feature. One use case for this method would be
// for a ResultSet populated with +link{group:progressiveLoading,progressive loading} -
// if application code determines an accurate row count for the current filter criteria
// it may be applied directly to the ResultSet via this method.
//
// @param length (number) total rows available from the server
// @visibility external
//<
// NOTE: this is separate from setLength, because ResultSet.setLength() should cause deletion
// on the server of all rows past the length. 


setFullLength : function (length, progressiveLoading) {
    
    if (!isc.isA.Number(length)) return;

    this.logDebug("full length set to: " + length + ", progressiveLoading?:" + (!!progressiveLoading));

    var isPaged = this.isPaged(),
        localLength = (this.localData && this.localData.length) || 0,
        prevLengthIsKnown = this.lengthIsKnown(),
        totalLength = (prevLengthIsKnown ? Math.max(localLength, this.getLength()) : localLength);

    // If the reported totalRows were from a progressiveLoading DSResponse they are
    // unreliable [essentially dsRequest.endRow + ds.endGap]
    // Never allow these to override a definitive data length if we have one
    // Do allow them to override a previous estimated length, but only by adding more rows
    
    if (!progressiveLoading) {
        delete this._progressiveRowCount;
        // Always drop any rowCount/rowCountStatus if we have a definitive full length - in this
        // case we know our exact row count.
        this.clearRowCount();

    } else {

        if (!prevLengthIsKnown) {
            this._progressiveRowCount = true;
        }
    }
    if (progressiveLoading && prevLengthIsKnown && (!this._progressiveRowCount || length < totalLength)) {
        this.logInfo(
            "ResultSet.setFullLength(): Ignoring row count " + length +
            " reported by progressiveLoading fetch operation. " + 
            (this._progressiveRowCount ? "This is less than a previously reported progressive row count, implying that there are more rows available." 
                                       : "An accurate row count has already been applied to this ResultSet.")
        );
        return;
    }

    // Clear out any loading markers at indices greater than or equal to `length`.
    var loadingRanges = this._loadingRanges;
    if (loadingRanges.length > 0) {
        this._setRangeLoading(length, loadingRanges.last(), false);
    }

    


    
    if (length < totalLength) {
        var notify = (this._dataRemove != null || this._dataRemoved != null),
            removedRecords;
        if (notify && length < localLength) {
            removedRecords = this.localData.slice(length, localLength);
            for (var i = localLength; i < totalLength; ++i) {
                removedRecords[i] = null;
            }
        } else {
            removedRecords = null;
        }

        if (this._dataRemove != null) {
            this._dataRemove(removedRecords, totalLength - length, length);
        }
        
        if (isPaged) {
            this.totalRows = length;
        }
        if (this.localData) {
            this.localData = this.localData.slice(0, length);
        }
        if (this._dataRemoved != null) {
            this._dataRemoved(removedRecords, totalLength - length, length);
        }
    } else {
        var notify = length > totalLength;
        if (notify && this._dataAdd != null) {
            this._dataAdd(null, length - totalLength, totalLength);
        }
        
        if (isPaged) {
            this.totalRows = length;
        }
        if (this.localData) {
            this.localData.length = length;
        }
        if (notify && this._dataAdded != null) {
            this._dataAdded(null, length - totalLength, totalLength);
        }
    }
    if (this.cachedRows > length) {
        this.cachedRows = length;
    }

    if (this._dataLengthIsKnownChanged != null) {
        var newLengthIsKnown = this.lengthIsKnown();
        if (prevLengthIsKnown != newLengthIsKnown) {
            this._dataLengthIsKnownChanged(prevLengthIsKnown, newLengthIsKnown);
        }
    }
    if (this.localData != null) {
        this._localDataValid = true;
    }
},


// -----
// Row counts
// With progressiveLoading enabled, our the "totalRows" returned from dsResponses
// doesn't match the size of the data set.
// However a true row count can be retrieved via a separate row count fetch, or
// it may be available through the dsResponse.estimatedTotalRows attribute.

//> @attr resultSet.applyRowCountToLength (boolean : false : IRA)
// If +link{dataSource.progressiveLoading,progressiveLoading} is active for a ResultSet
// we may not know the true size of the data set being displayed.
// <P>
// However the exact length may be known thanks to +link{dsResponse.estimatedTotalRows} 
// containing an exact row count, or due to an explicit +link{fetchRowCount(),row count fetch}
// having been performed.
// <P>
// If we have an accurate, exact row count, should this be applied to our +link{getLength(),length}
// automatically? Doing so means that if this ResultSet is displayed in a +link{listGrid}, 
// the scrollable area will reflect the true size of the data set and the user may drag-scroll
// all the way to the end of this data set. Depending on how the server side data storage is
// implemented and the generated request, requesting row ranges starting at a very large 
// index can be expensive, so this is not always desirable. 
// <P>
// Note that developers may always explicitly tell a ResultSet the true size of its
// data set while progressive loading is active via +link{setFullLength()}
// @visibility rowCountDisplay
//<
applyRowCountToLength:false,

//> @type RowCountStatus
// Enumerated status indicating whether a ResultSet has an accurate +link{resultSet.getRowCount()}
// row count for the data set.
// <P>
// This is a feature associated with +link{dataSource.progressiveLoading,progressive loading of data}.
// When progressive loading is active, the +link{resultSet.length} may not indicate the true size
// of the data set. In this case a different total row count may be maintained by the ResultSet
// data object and retrieved via +link{resultSet.getRowCount()}. This status code indicates
// whether this row count is an exact value or not.
//
// @value "exact" The size of the data set is known and the current row count is accurate.
//    This always will be the case if +link{progressiveLoading} is not active. If 
//    progressiveLoading is active, we may have an accurate row count in the following
//    scenarios:
//    <ul>
//      <li>+link{listGrid.setFullLength()} was explicitly invoked to tell the resultSet
//          its total length.<br>
//          In this case
//          +link{resultSet.getLength()} will return the same value as 
//          +link{resultSet.getRowCount()}</li>
//      <li>The user has scrolled all the way to the true end of the progressively
//          loaded data set such that the length is now known.<br>
//          In this case
//          +link{resultSet.getLength()} will return the same value as 
//          +link{resultSet.getRowCount()}</li>
//      <li>A successful row count fetch was performed via 
//          +link{resultSet.fetchRowCount()}.<br>
//          In this case
//          +link{resultSet.getLength()} will return the same value as 
//          +link{resultSet.getRowCount()} if +link{resultSet.applyRowCountToLength} 
//          is true, otherwise the values may differ.</li>
//      <li>The dataSource fetch response to a request for rows within the 
//          resultSet included a +link{dsResponse.estimatedTotalRows} value
//          with an exact value<br>
//          In this case
//          +link{resultSet.getLength()} will return the same value as 
//          +link{resultSet.getRowCount()} if +link{resultSet.applyRowCountToLength} 
//          is true, otherwise the values may differ.</li>
//    </ul>
// @value "unknown" The current row count is unknown. This value indicates
//    +link{resultSet.lengthIsKnown()} returns false.
// @value "loading" This value indicates that the ResultSet is waiting for an active
//    +link{fetchRowCount(),row count fetch} to complete.
// @value "minimum" The current row count is a minimum - there are at least this many
//    records in the data set. Note that when +link{progressiveLoading} is active, this 
//    will be the status if no explicit +link{dsResponse.estimatedTotalRows} was
//    available, so +link{dsResonse.totalRows} is a minimum, or if 
//    +link{dsResponse.estimatedTotalRows} contained a value in the format 
//    <code><i>"[rowCount]+"</i></code>.
// @value "approximate" The current row count is an approximation. This will be the status
//    if +link{progressiveLoading} is active and a fetch request contained an
//    explicit +link{dsResponse.estimatedTotalRows} in the format 
//    <code><i>"~[rowCount]"</i></code>.
// @value "maximum" The current row count is a maximum - there are no more than this
//    many records in the data set. This will be the status
//    if +link{progressiveLoading} is active and a fetch request contained an
//    explicit +link{dsResponse.estimatedTotalRows} in the format 
//    <code><i>"-[rowCount]"</i></code>.
// @value "range" The data object knows the total number of records in the data set
//    lies within a particular range. In this case +link{listGrid.getTotalRowRange()} 
//    may be used to retrieve the upper and lower bound of this range, and 
//    +link{listGrid.getTotalRows()} will return the lower bound. This will be the status
//    if +link{progressiveLoading} is active and a fetch request contained an
//    explicit +link{dsResponse.estimatedTotalRows} in the format 
//    <code><i>"[minRowCount]-[maxRowCount]"</i></code>.
// @visibility rowCountDisplay
//<

//> @method resultSet.getRowCountStatus()
// This method indicates whether +link{resultSet.getRowCount()} reflects an accurate
// row-count for this data set. An accurate row count may not currently be available
// if +link{progressiveLoading} is active.
// <P>
// See +link{type:RowCountStatus} for further details.
//
// @return (RowCountStatus) Current row-count status for this grid
// @visibility rowCountDisplay
//<
getRowCountStatus : function () {

    
    if (!this.lengthIsKnown()) {
        if (this._rowCountStatus != null) return this._rowCountStatus;
        return "unknown";
    }
    if (!this.lengthIsProgressive()) return "exact";

    // If we have no recorded rowCount, we just have our length, which is (basically) a lower bound
    if (this._rowCountStatus == null) return "minimum";

    // Make use of our explciitly remembered rowCountStatus
    return this._rowCountStatus;
},

//> @method resultSet.getRowCount()
// This method retrieves the row-count for this data set. If progressive loading is active, 
// this may differ from +link{getLength()}. See +link{getRowCountStatus()} for more information.
//
// @return (integer) Current row-count for this grid
// @visibility rowCountDisplay
//<
getRowCount : function () {
    if (this._rowCount != null) return this._rowCount;
    return this.getLength();
},

//> @method resultSet.getRowCountRange()
// If +link{getRowCountStatus()} is "range" this method will return a two element array
// containing the lower and upper bound for the rowCount. In all other cases it will
// return a two element array where the first element is the result of +link{getRowCount()}
// and the second element is null
//
// @return (Array of integer) row count lower and upper bound
// @visibility rowCountDisplay
//<
getRowCountRange : function () {
    return [this.getRowCount(), this._rowCount_upperBound];
},

// setRowCount()
// This method sets the rowCount for the resultSet as separate from the data length
// Only applies when progressiveLoading is active
// This method is called automatically when dsResponse.estimatedTotalRows contains
// a meaningful value
setRowCount : function (rowCount, status) {
    if (status == "exact" && this.applyRowCountToLength) {
        this.setFullLength(rowCount);
        // No additional steps required here - setFullLength(<..>,false) always wipes out 
        // any rowCount/rowCount status - we will return this.getLength() / "exact"
        return;
    }

    // If we have an outstanding rowCount fetch, kill it.
    // We don't want to have it clobber an explicitly assigned rowCount
    this.cancelRowCountFetch();
        
    if (isc.isAn.Array(rowCount)) {
        if (status != "range") {
            this.logWarn("setRowCount passed an array:" + rowCount +
                " treating as a range even though requested status was:" + status);
            status = "range";
        }
        this._rowCount_upperBound = rowCount[1];
        rowCount = rowCount[0];
    }
    // Note: rowCount may validly be null if the status is being set to "loading"
    this._rowCount = rowCount;
    this._rowCountStatus = status;

},


//> @attr resultSet.rowCountOperation (String : null : IR)
// The +link{dsRequest.operationId,operationId} this ResultSet should use when performing
// a row-count fetch operation due to +link{resultSet.fetchRowCount()}.
// <P>
// See also +link{resultSet.rowCountContext}
// 
// @visibility rowCountDisplay
//<

//> @attr resultSet.rowCountContext (DSRequest Properties : null : IRA)
// Request properties for row-count fetch operations performed by +link{resultSet.fetchRowCount()}.
// <P>
// The row-count fetch operation will ultimately be constructed as follows:
// <ul><li>Default operation properties will be constructed by combining the
//         +link{resultSet.rowCountContext} with the +link{resultSetContext}, with rowCountContext properties
//         taking precedence</li>
//     <li>The operation will have type "fetch" and +link{dsRequest.startRow} and +link{dsRequest.endRow}
//         set to zero, and +link{dsRequest.progressiveLoading} will be explicitly set to false. 
//         The request will also have +link{dsRequest.showPrompt} set to +link{blockingRowCountFetch}
//         so user interactions can be blocked while the row count is actively being performed.</li>
//     <li>To override these defaults or specify additional properties, developers may use the 
//         <code>dsRequest</code> parameter of the +link{resultSet.fetchRowCount()} method.</li>
// </ul>
// 
// @visibility rowCountDisplay
//<

//> @attr resultSet.blockingRowCountFetch (boolean : true : IR)
// Will the +link{fetchRowCount(),row count fetch operation} block user interaction by having
// +link{dsRequest.showPrompt,showPrompt:true}?
// @visibility rowCountDisplay
//<
blockingRowCountFetch:true,

//> @method Callbacks.RowCountCallback
// Callback fired when ResultSet.fetchRowCount() completes
//
// @param resultSet (ResultSet) the +link{class:ResultSet} resultSet that issued the row-count fetch request.
// @param dsResponse (DSResponse) the +link{class:DSResponse} from the fetch request. May be null if the
//   row count fetch was invalidated before the server responded
// @param invalidated (boolean) boolean indicating whether the rowCountFetch request was invalidated.
//   This parameter will be true if, after the row count fetch request was issued, the criteria were
//   changed, the cache was invalidated or the rowCount status was explicitly set to another value
//   via +link{resultSet.setRowCount()}. Calling +link{resultSet.fetchRowCount()} before
//   a row count fetch has completed will also invalidate the previous row count fetch. In any of these
//   cases the row count will not be updated by this fetch operation.
//
// @visibility rowCountDisplay
//<

//> @attr resultSet.autoFetchRowCount (boolean : false : IRW)
// If this ResultSet does not know its length due to +link{dataSource.progressiveLoading},
// should a +link{resultSet.fetchRowCount(),row count fetch} automatically when
// data is loaded?
// <P>
// The fetch will be issued when the first page of data arrives from the server as 
// part of a progressive-loading response. If the cache is invalidated or the
// criteria change, a new row count fetch will be issued automatically when 
// new data arrives that does not have an accurate row count.
//
// @visibility rowCountDisplay
// @group rowCountDisplay
//<
autoFetchRowCount:false,

// Actually issue the rowCountFetch:
//> @method resultSet.fetchRowCount()
// For cases where the exact size of the data set is not known due to
// +link{dataSource.progressiveLoading,progressiveLoading}, this method may be used to issue an
// explicit fetch request to the data source, asking for an accurate row count for the 
// criteria currently applied to this ResultSet. The 
// row count will then be available via +link{getRowCount()}, and if +link{applyRowCountToLength}
// is true, the +link{getLength(),length} of the ResultSet will be updated to reflect the 
// reported value.
// <P>
// If the +link{resultSet.setCriteria(),criteria} for the ResultSet change while a row count fetch
// is in progress, the +link{getRowCount,rowCount} for the resultSet will not be updated. In this
// case the callback passed to this method will still fire, with the 
// +link{method:Callbacks.RowCountCallback,criteriaChanged} parameter set to <code>true</code>
// <P>
// Note the fetch request sent to the dataSource will have +link{dsRequest.progressiveLoading} 
// explicitly set to false and +link{dsRequest.startRow,startRow:0} and +link{dsRequest.endRow,endRow:0}.
// See +link{rowCountContext} for full details of the request that will be sent to the dataSource.
// <P>
// SmartClient server side dataSources will process such a request by calculating the row-count
// (for +link{dataSource.serverType,serverType:"sql", this means issuing a row-count 
// database query), skipping any logic to retrieve actual data, and return a response with 
// +link{dsResponse.progressiveLoading:false} and an accurate +link{dsResponse.totalRows}.
// <P>
// If this ResultSet is backed by a custom dataSource implementation, it is recommended
// that the dataSource either also returns a response with 
// +link{dsResponse.progressiveLoading,progressiveLoading:false} and an accurate 
// +link{dsResponse.totalRows}, or uses the +link{dsResponse.estimatedTotalRows}
// attribute to indicate an accurate row count for the data set.
// 
// @param [callback] (RowCountCallback) Callback to fire when the fetch request completes.
//  To retrieve details of the row-count that was retrieved from the server, use
//  the <code>getRowCount()</code> and <code>getRowCountStatus()</code> methods.
// @param [dsRequest] (DSRequest properties) Custom properties for the row count fetch request
//
// @visibility rowCountDisplay
//<
_rowCountFetchIndex:0,
_rowCountFetchCallbacks:{},
fetchRowCount : function (callback, dsRequest) {


    // Set row count status to loading
    // Do this before kicking off the fetch - setRowCount will cancel any active
    // rowCountFetch operation!
    this.setRowCount(null, "loading");

    var criteria = this.getServerFilter();
    
    this._rowCountFetchID = "_" + this._rowCountFetchIndex++;
    this._rowCountFetchCallbacks[this._rowCountFetchID] = callback;

    var request = isc.addProperties({},
                    this.context,
                    this.rowCountContext,
                    {
                        clientContext:{
                            // remember the criterion object we passed in so we can
                            // determine whether it has changed even if 
                            // downstream code modifies dsRequest.data
                            rowCountFetchCriteria:isc.clone(criteria),
                            _rowCountFetchID:this._rowCountFetchID
                        },
                        showPrompt:this.blockingRowCountFetch,
                        startRow:0, endRow:0, progressiveLoading:false,
                        operationId:(this.rowCountOperation|| this.fetchOperation)
                    },
                    dsRequest);

    
    request.operation = null;

    var wasQueuing = isc.RPCManager.startQueue();

    this.getDataSource().fetchData(
        criteria,
        {target:this, methodName:"fetchRowCountReply"},
        request
    );

    if (!wasQueuing) {
        this._rowCountFetchTransaction = isc.RPCManager.getQueueTransactionId();
        isc.RPCManager.sendQueue();
    }

},

fetchRowCountReply : function (dsResponse, data, dsRequest) {

    delete this._rowCountFetchTransaction;

    // Ignore the rowCountFetch reply if the rowCount has
    // been explicitly modified or cleared since it was issued - tracked
    // by the _rowCountFetchID
    
    var rowCountFetchID = dsRequest.clientContext._rowCountFetchID
    if (this._rowCountFetchID != rowCountFetchID) {
        return;
    }
    delete this._rowCountFetchID;

    var currentCriteria = this.getServerFilter();
    var criteriaChanged = false;

    // Also ignore the rowCountFetchReply if the criteria have changed
    
    var rowCountFetchCriteria = dsRequest.clientContext.rowCountFetchCriteria;
    if (this.getDataSource().compareCriteria(currentCriteria, rowCountFetchCriteria) != 0) {
        criteriaChanged = true;
    }
    if (!criteriaChanged) {
        var rowCount;
        if (!dsResponse.progressiveLoading) {
            rowCount = dsResponse.totalRows;
        } else {
            if (dsResponse.estimatedTotalRows != null) {
                var rowCountArr = this._parseEstimatedTotalRows(dsResponse.estimatedTotalRows);
                if (rowCountArr && rowCountArr[1] == "exact") {
                    rowCount = rowCountArr[0];
                }
            }
        }
        if (rowCount == null) {
            this.logWarn("ResultSet.fetchRowCount(): server response did not contain an exact row count - ignoring");
            this.clearRowCount(); // assume any old status, including 'loading' is now invalid
        } else {
            this.setRowCount(rowCount, "exact");
        }
    }

    var callback = this._rowCountFetchCallbacks[rowCountFetchID];
    delete this._rowCountFetchCallbacks[rowCountFetchID];
    if (callback != null) {
        // Pass 'criteriaChanged' into the callback as the invalidated parameter
        // if criteriaChanged is true, we haven't updated the row count
        this.fireCallback(callback, "resultSet,dsResponse,success", [this, dsResponse,criteriaChanged]);
    }
    
    if (!criteriaChanged) this.rowCountFetchComplete();
},

// Observable notification when a rowCountFetch successfully changes the
// row count 
rowCountFetchComplete : function () {

},


clearRowCount : function () {

    delete this._rowCount;
    delete this._rowCount_upperBound;
    delete this._rowCountStatus;

    // if we have an outstanding row count fetch always kill it
    // [This method is called from a change in criteria or invalidate cache]
    this.cancelRowCountFetch();
    
},

// This method is called automatically when the rowCount is explicitly set or
// a new rowCount fetch is kicked off
cancelRowCountFetch : function () {

    if (this._rowCountFetchTransaction) {
        
        isc.RPCManager.cancelQueue(this._rowCountFetchTransaction);
        delete this._rowCountFetchTransaction;
    }

    // Fire the callback now with the special parameter to indicate it was canceled
    // This gives app code a chance to (EG) clear a click mask etc
    var rowCountFetchID = this._rowCountFetchID;
    var callback = this._rowCountFetchCallbacks[rowCountFetchID];
    delete this._rowCountFetchCallbacks[rowCountFetchID];
    if (callback != null) {
        this.fireCallback(callback, "resultSet,dsResponse,success", [this, null, true]);
    }
    delete this._rowCountFetchID;
    
},

// Given a dsResponse.estimatedTotalRows like "500+" or "1000-2000", convert to
// a rowCount value and status
_parseEstimatedTotalRows : function (totalRows) {
    totalRows = totalRows.trim(); // remove any whitespace

    // Options:
    // "500"
    // "500+"
    // "-500"
    // "~500"
    // "450-500"
    var rowCount, rowCountMax, status;
    if (totalRows.endsWith("+")) {
        rowCount = parseInt(totalRows); // parseInt drops trailing non numeric chars
        status = "minimum";
    } else if (totalRows.startsWith("~")) {
        rowCount = parseInt(totalRows.substring(1,totalRows.length));
        status = "approximate"
    } else if (totalRows.contains("-")) {
        if (totalRows.indexOf("-") == 0) {
            rowCount = parseInt(totalRows.substring(1,totalRows.length));
            status = "maximum"
        } else {
            var splitRows = totalRows.split("-");
            rowCount = parseInt(splitRows[0]);
            rowCountMax = parseInt(splitRows[1]);
            status = "range";
        }
    }

    if (rowCount == null) {
        rowCount = parseInt(totalRows);
        // If we were passed a string that isn't an exact quoted number,
        // don't hang onto it. It's likely an unrecognized format like "500-" instead of
        // "-500"
        if (rowCount.toString() != totalRows) {
            rowCount = null;
        } else {
            status = "exact";
        }
    }

    if (!isc.isA.Number(rowCount)) {
        this.logWarn("Unable to parse dsResponse.estimatedTotalRows value:" + totalRows);
        return null;
    }
    // For a range, return 'rowCount' as a two element array
    if (isc.isA.Number(rowCountMax)) rowCount = [rowCount,rowCountMax];
    return [rowCount,status];
},


//> @method resultSet.invalidateCache() [A]
// Manually invalidate this ResultSet's cache.
// <P>
// Generally a ResultSet will observe and incorporate updates to the DataSource that provides its
// records, but when this is not possible, <code>invalidateCache()</code> allows manual cache
// invalidation.
// <P>
// <code>invalidateCache()</code> fires <code>dataChanged()</code>, which may cause components 
// using this ResultSet to request new data for display, triggering server fetches.
// @visibility external
//<
invalidateCache : function () {

    // cancel any fetch already scheduled
    this.cancelActionOnPause("fetchRemoteData");
    this.fetchStartRow = this.fetchEndRow = null;

    // cancel any all-rows cache invalidation scheduled
    this.cancelActionOnPause("invalidateAllRowsCache");
    this._allMatchingRowsContext = null;

    this._invalidatedRequestIndex = this._requestIndex;

    if (this.neverDropCache) {
        isc.logWarn("invalidateCache() called on ResultSet populated with local data (not from dataSource). Ignoring.");
        return;
    }

    // If we're updating the cache from a server operation, avoid passing the updated
    // record info to dataChanged()
    delete this._lastUpdateOperation;
    delete this._lastUpdateDataArray;
    delete this._lastUpdateRecord;
    delete this._lastUpdateData;
    delete this._lastOrigRecord;
    delete this._lastUpdateRow;
    delete this._isArrayUpdate;
    
    this._invalidateCache();
    // dataChanged() is required to force a refresh from the server
	if (!this._isChangingData()) this.dataChanged(null,null,null,null,true);
},

// NOTE: does not call dataChanged() automatically and should not be externally observed
_invalidateCache : function () {

    // Forget the dynamically derived "progressiveLoading" value for the data set, if we have one
    delete this._dynamicProgressiveLoading;

    this.invalidateRows();

    // start reporting unknown length
    delete this._localDataValid;
	this.totalRows = null; 

    
    this.clearRowCount();

	//>DEBUG
	this.logInfo("Invalidating cache");
	//<DEBUG
},

// invalidateCache vs invalidateRows:
// - invalidateCache means we have no idea what the total rows are, eg the search criteria have
//   changed.  In this case it's appropriate to advertise !lengthIsKnown() and observing
//   widgets may choose to show something indicating transition to a new dataset, such as a
//   "fetching new data" message
// - invalidateRows means the row order is changing or is stale, but we are looking at
//   basically the same dataset in a new order.  lengthIsKnown() is true, and observing widgets
//   may choose to retain aspects of the view such as scroll position
invalidateRows : function () {
    var localData = this.localData,
        localLength = (localData && localData.length) || 0,
        lengthIsKnown = this.lengthIsKnown(),
        totalLength = Math.max(localLength, (lengthIsKnown ? this.getLength() : localLength));

    this.localData = null;
    var newTotalLength = (this.lengthIsKnown() ? this.getLength() : 0);
    this.localData = localData;
    

    var remove = (totalLength > 0 && newTotalLength == 0),
        splice = (localLength > 0 && newTotalLength > 0),
        removedRecords;

    if (remove && (this._dataRemove != null || this._dataRemoved != null)) {
        if (localLength > 0) {
            removedRecords = localData;
            for (var i = localLength; i < totalLength; ++i) {
                localData[i] = null;
            }
        } else {
            removedRecords = null;
        }

        if (this._dataRemove != null) {
            this._dataRemove(removedRecords, totalLength, 0);
        }
    } else if (splice && this._dataSplice != null) {
        this._dataSplice(localData, localLength, 0, null, localLength);
    }
	this.localData = this.allRows = null;
    if (remove && this._dataRemoved != null) {
        this._dataRemoved(removedRecords, totalLength, 0);
    } else if (splice && this._dataSpliced != null) {
        this._dataSpliced(localData, localLength, 0, null, localLength);
    }

    
    if (this._dataLengthIsKnownChanged != null && lengthIsKnown) {
        this._dataLengthIsKnownChanged(true, false);
    }
    this.allRowsCriteria = null;
    delete this._emptyAllRowsCriteria;
    
	this.cachedRows = 0;
    // one time flag for invalidating rows on fetch can now be cleared
    this._invalidRowOrder = null; 

    // Clear out all ranges of loading records now that the cache is invalidated.
    this._loadingRanges = [];
},

// This method sets a flag indicating that our current cache of data
// doesn't match the server-side ordering of data from the dataSource. 
// As such, devs can interact with the current cache via apis such as 'get(...)'
// but as soon as an unloaded row is requested we'll drop the cache
// Used by 'updatePartialCache' logic on dataSourceDataChanged and by the
// 'keepLocalData' parameter of setSort()
invalidateRowOrder : function () {
    this._invalidRowOrder = true;
},

rowOrderInvalid : function () {
    return this._invalidRowOrder;
},

dataChanged : function () {
    
    if (this.onDataChanged) this.onDataChanged();
},

dataArrived : function () {
},

// Selection
// -----------------------------------------------------------------------------------------

getNewSelection : function (initParams) {
    var selectionClass = this.getDataSource().selectionClass;
    if (!selectionClass) return null; // null - use normal selection
    return isc.ClassFactory.getClass(selectionClass, true).create(initParams);
}

});

isc.ResultSet.registerStringMethods({
    //> @method ResultSet.transformData()
    // <code>transformData()</code> provides an opportunity to modify data that has been
    // returned from the server, before it has been integrated into the client-side cache.
    // <P>
    // If data is not immediately suited for client-side use when it is returned from the
    // ultimate data store, this method allows it to be transformed on the client so that such
    // transform operations do not impact server scalability.
    // <P>
    // It is legal for <code>transformData()</code> to modify not only the records, but also
    // their number (by modifying startRow and endRow on the +link{DSResponse} object).
    // <P>
    // See also +link{dataSource.transformResponse()} for an alternative entry point which
    // applies to all DSResponses for a DataSource.
    //
    // @param   newData            (Any)  data returned from the server
    // @param   dsResponse         (DSResponse) the DSResponse object returned by the
    //                             server
    // @return (Array of Objects) the modified data, ready to be cached
    // @visibility external
    //<
    transformData : "newData,dsResponse",

    //> @method ResultSet.dataArrived()
    // Notification fired when data has arrived from the server and has been successfully
    // integrated into the cache.
    // <P>
    // When <code>dataArrived()</code> fires, an immediate call to <code>getRange()</code> with
    // the <code>startRow</code> and <code>endRow</code> passed as arguments will return a List
    // with no +link{resultSet.getLoadingMarker(),loading markers}.
    // <P>
    // Note that <code>dataArrived()</code> won't fire in the case of the owning component
    // filtering with unchanged criteria (for example using +link{listGrid.fetchData()} or
    // +link{listGrid.filterData()}).  To support backward compatibility, the property
    // +link{reapplyUnchangedLocalFilter} can be set to force <code>dataArrived()</code> to
    // be called if the ResultSet is +link{filterLocalData(),filtering locally} and the criteria
    // haven't changed but are narrower than the criteria used to fetch the current cache.
    //
    // @param startRow  (int)   starting index of rows that have just loaded
    // @param endRow    (int)   ending index of rows that have just loaded, non-inclusive
    // @visibility external
    //<
    // 'dataFromCache' - passed when new data was satisfied from a client-side cache of data
    
    dataArrived : "startRow,endRow,dataFromCache",
    
    //> @method resultSet.dataChanged()
    // Fires when data in the ResultSet has been changed.
    // <P>
    // For a single-row update, that is, a single row that has been updated, added or removed,
    // parameters such as <code>rowNum</code> are available for UI widgets that want to
    // incrementally update the display (for example, show a remove animation for a record being
    // removed).
    // <P>
    // In the single-row update case, the rowNum will indicate:
    // <ul>
    // <li> for a remove, the index where the row was removed
    // <li> for an add, the index where the row has been added
    // <li> for an update, the index of the updated row
    // </ul>
    // Note several cases for "update":
    // <ul>
    // <li> an "update" on a record not in the cache may introduce a new record to the cache.  In
    // this case, <code>originalRecord</code> is null and <code>rowNum</code> is the position of
    // insertion.
    // <li> an "update" may remove a record from cache. In this case, the rowNum indicates its
    // former position and this can be detected by checking
    // resultSet.get(rowNum) != originalRecord
    // </ul>
    // Note that an "update" on a sorted dataset may cause changes at two indices.  In this case
    // <code>dataChanged()</code> fires without parameters.
    // <P>
    // <code>dataChanged()</code> also fires in a number of situations in which the entire
    // dataset is affected and in this case no parameters are available.  This includes new
    // filter criteria, new sort direction, cache invalidation, new data arrival and manual calls
    // to <code>dataChanged()</code> triggered by customized subclasses of ResultSet.
    // <P>
    // In this case observing code should assume the dataset has been partly or wholly reordered,
    // and may have no records in common with the dataset as it existed before
    // <code>dataChanged()</code> fired.
    // <P>
    // Note that <code>dataChanged()</code> won't fire in the case of the owning component
    // filtering with unchanged criteria (for example using +link{listGrid.fetchData()} or
    // +link{listGrid.filterData()}).  To support backward compatibility, the property
    // +link{reapplyUnchangedLocalFilter} can be set to force <code>dataChanged()</code> to
    // be called if the ResultSet is +link{filterLocalData(),filtering locally} and the criteria
    // haven't changed but are narrower than the criteria used to fetch the current cache.
    //
    // @param [operationType] (DSOperationType) type of operation that took place if a fetch or
    //                                          a single row update, otherwise, null
    // @param [originalRecord] (Record) record before update took place.  Null for operationType
    //                                  "add".
    // @param [rowNum] (Integer) row where the update took place
    // @param [updateData] (Record) +link{group:dataSourceOperations,cache update data} returned
    //                               by the server, or submitted values if no data was returned
    //                               and +link{updateCacheFromRequest} is set.
    // @visibility internal
    //<
    // 'filterChanged' boolean - passed when this method was called from invalidateCache
    // or from filterLocalData (applying a client side filter to a dataSet). In both cases
    // the visible data-set has changed due to a re-filter    
    // 'dataFromCache' - passed when new data was satisfied from a client-side cache of data
    
    
    dataChanged : "operationType,originalRecord,rowNum,updateData,filterChanged,dataFromCache",
    

    
    _dataAdd : "records,length,rowNum", // before add
    _dataAdded : "records,length,rowNum", // after add
    _dataRemove : "records,length,rowNum", // before remove
    _dataRemoved : "records,length,rowNum", // after remove
    _dataSplice : "originalRecords,originalLength,rowNum,updatedRecords,updatedLength", // before splice
    _dataSpliced : "originalRecords,originalLength,rowNum,updatedRecords,updatedLength", // after splice
    _dataMoved : "records,length,originalRowNum,updatedRowNum", // after move
    _dataLengthIsKnownChanged : "originalValue,updatedValue" // after a change in the value of lengthIsKnown()
});

// isc._dataModelToString and isc._dataModelLogMessage are defined in Log.js
isc.ResultSet.getPrototype().toString = isc._dataModelToString;
isc.ResultSet.getPrototype().logMessage = isc._dataModelLogMessage;

//>!BackCompat 2004.7.29  fetchModes as distinct classes
isc.ClassFactory.defineClass("LocalResultSet", isc.ResultSet);
isc.LocalResultSet.addProperties({
    fetchMode : "local"
});

// WRS sets fetchMode : "paged", already the default
isc.ClassFactory.defineClass("WindowedResultSet", isc.ResultSet);
//<!BackCompat


//>	@method resultSet.findAll()
// Like +link{list.findAll()}.  Checks only loaded rows and will not trigger a fetch.
// @include list.findAll
//<

//>	@method resultSet.find()
// Like +link{list.find()}.  Checks only loaded rows and will not trigger a fetch.
// @include list.find
//<

//>	@method resultSet.findIndex()
// Like +link{list.findIndex()}.  Checks only loaded rows and will not trigger a fetch.
// @include list.findIndex
//<

//>	@method resultSet.findNextIndex()
// Like +link{list.findNextIndex()}.  Checks only loaded rows and will not trigger a fetch.
// @include list.findNextIndex
//<

//>	@method resultSet.getProperty()
// Like +link{list.getProperty()}.  Checks only loaded rows and will not trigger a fetch.
// @include list.getProperty
//<

isc.ResultSet.addMethods(
    isc.ClassFactory.makePassthroughMethods(
        ["find", "findIndex", "findNextIndex", "findAllIndices", "findAll", "getProperty"],
        "localData",
        true, 
        "ResultSet.${methodName} called with no cached local data." +
        " Calling code can use ResultSet.lengthIsKnown() to determine whether the ResultSet" +
        " has loaded any data.",
        "dataSource"
    )
);


// Simple class to act as a synchronously-filterable list

//> @class FilteredList
// A subclass of +link{ResultSet} designed to provide a synchronously filterable List
// interface for an array of data.
// <P>
// Developers should set +link{filteredList.allRows} to the full set of data objects, and use
// +link{filteredList.criteria} to the apply criteria to the data set. Standard List APIs 
// such as +link{list.get()}, +link{list.getLength()}, +link{list.getRange()}, etc will then 
// allow access to a filtered subset of this data.
// <P>
// The +link{filteredList.dataSource} attribute may be used to specify the format of records
// to be stored within this list, but this is not required. If no DataSource is
// explicitly specified, filteredList will automatically generate
// its own DataSource with +link{dataSource.dropUnknownCriteria,dropUnknownCriteria} set to false.
// 
// @inheritsFrom ResultSet
// @treeLocation Client Reference/Data Binding
// @visibility external
//<
isc.defineClass("FilteredList", "ResultSet").addProperties({
    
    //> @attr filteredList.allRows (Array of Record : [] : IRA)
    //
    // Complete set of records for this filteredList. Sorting and filtering of this
    // list will occur synchronously on the client.
    // 
    // @visibility external
    //<
    // init overridden to set allRows to an empty array if not explicitly specified.

    init:function () {
        if (this.allRows == null) this.allRows = [];
        return this.Super("init", arguments);
    },

    //> @attr filteredList.dataSource (DataSource : null : IR)
    // Optional dataSource to specifying field names and types for records within this
    // List. Note that since a full data set should be provided to the list via
    // +link{filteredList.allRows}, this filteredList will not issue fetch requests against
    // this DataSource.
    // <P>
    // If no DataSource was explicitly specified, filteredList will automatically generate
    // its own DataSource with +link{dataSource.dropUnknownCriteria,dropUnknownCriteria} set to false.
    //
    // @visibility external
    //<
    getDataSource : function () {
        if (this.dataSource == null) {
            return isc.FilteredList.getFilterDS();
        }
        return this.dataSource;
    },

    // re-document setAllRows() since this is a prime use case for it
    //> @method filteredList.setAllRows() 
    // Updates +link{filteredList.allRows} at run time.
    //
    // @param allRows (Array of Records) New set of unfiltered cache data
    // @visibility external
    //<

    // No need to document the explicit fetchMode override
    fetchMode:"local",

    //> @attr filteredList.modifiable (boolean : true : IRW)
    // @include resultSet.modifiable
    // @visibility external
    //<
    modifiable:true,

    //> @method filteredList.invalidateCache() 
    // Invoking invalidateCache() will have no effect on a filteredList. To drop the
    // <i>allRows</i> cache of data, consider passing an empty array to 
    // +link{filteredList.setAllRows()}.
    // 
    // @visibility external
    //<
    neverDropCache:true,

    reapplyUnchangedLocalFilter: true
});

isc.FilteredList.addClassMethods({
    getFilterDS:function () {
        if (this._filterDS == null) {
            this._filterDS = isc.DataSource.create({
                // ensure that if somehow a true fetch is issued against this DS we don't attempt to go to server
                clientOnly:true, 
                dropUnknownCriteria:false
            });
        }
        return this._filterDS;
    }
});

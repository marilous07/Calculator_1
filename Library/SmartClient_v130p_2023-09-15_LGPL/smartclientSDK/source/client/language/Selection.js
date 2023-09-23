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
//>	@class	Selection
//
// Maintains a 'selected' subset of a List or Array of objects, such as records in a record
// set, or widgets in a selectable header.
// <p>
// Includes methods for selecting objects and checking which objects are selected, and also for
// selecting objects as a result of mouse events, including drag selection support.
// The selection object is used automatically to handle selection APIs on +link{class:ListGrid}
// and +link{class:TreeGrid} instances.
// <p>
// Note that selection and deselection are skipped for objects that aren't enabled, or that are
// marked as non-selectable.  For a +link{ListGrid}, the relevant properties are 
// +link{ListGrid.recordEnabledProperty} and +link{ListGrid.recordCanSelectProperty}.  The 
// recommended approach to affect disabled objects via the Selection APIs is to temporarily
// enable them beforehand.
//
// @visibility external
// @see ListGrid.selectionManager
// @see DataBoundComponent.selectRange()
// @see DataBoundComponent.selectRecord()
// @treeLocation Client Reference/System
//<


//
//	create the Selection class
//
isc.ClassFactory.defineClass("Selection");

// add default properties to the class
isc.Selection.addProperties({
    //> @attr selection.selectionProperty (String : null : [IRA])
    // Property to use to mark records as selected.
    // <P>
    // Defaults to an auto-generated property name that starts with an underscore.
    // @visibility serverSelection
    //<
    //selectionProperty:null,

    //>@attr selection.data (Array | List : null : [IRWA])
    //  The set of data for which selection is being managed.  If not specified at init time
    //  this can be set up via the <code>selection.setData()</code> method.
    // @visibility serverSelection
    //<
    
    //> @attr selection.enabledProperty (String : "enabled" : [IRA])
    // Property used to indicated records as being disabled (therefore unselectable).
    //<
    
    enabledProperty:"enabled",
    
    //> @attr selection.canSelectProperty (String : "canSelect" : [IRA])
    // If set to false on a item, selection of that item is not allowed.
    //<
    
    canSelectProperty:"canSelect",

    //> @attr selection.cascadeSelection (boolean : false : [IRA])
    // Should children be selected when parent is selected? And should parent be
    // selected when any child is selected?
    // <p>
    // Note: Unloaded children are not affected and no load-on-demand is triggered.
    //<
    cascadeSelection:false,

    // _dirty - manages whether we need to update the cache of selected records.
	_dirty:true

    
});

isc.Selection.addClassProperties({
	//>	@type	SelectionStyle
	//	Different styles of selection that a list, etc. might support
	//		@visibility external
	//		@group	selection
	//
    //	@value	isc.Selection.NONE		don't select at all
    //	@value	isc.Selection.SINGLE	select only one item at a time
	//	@value	isc.Selection.MULTIPLE	select one or more items
    //	@value	isc.Selection.SIMPLE	select one or more items as a toggle
	// 								  so you don't need to hold down control keys to select
    //                                  more than one object
	//<

    //> @classAttr Selection.NONE (Constant : "none" : [R])
    // A declared value of the enum type  
    // +link{type:SelectionStyle,SelectionStyle}.
	// @visibility external
    // @constant
    //<
    NONE: "none",

    //> @classAttr Selection.SINGLE (Constant : "single" : [R])
    // A declared value of the enum type  
    // +link{type:SelectionStyle,SelectionStyle}.
	// @visibility external
    // @constant
    //<
    SINGLE: "single",

    //> @classAttr Selection.MULTIPLE (Constant : "multiple" : [R])
    // A declared value of the enum type  
    // +link{type:SelectionStyle,SelectionStyle}.
	// @visibility external
    // @constant
    //<
    MULTIPLE: "multiple",

    //> @classAttr Selection.SIMPLE (Constant : "simple" : [R])
    // A declared value of the enum type  
    // +link{type:SelectionStyle,SelectionStyle}.
	// @visibility external
    // @constant
    //<
    SIMPLE: "simple",       

	// for generating unique IDs for each Selection 
	_selectionID : 0			
});


isc.Selection.addMethods({

//>	@method	selection.init()	(A)
//  Initialize this selection instance.<br>
//  Note: if the <code>data</code> property is not set at init time, it should be passed to
//  the selection using the <code>selection.setData</code> method
//		@group	selection
//		@param	[all arguments]	(Object)	objects with properties to override from default
// @visibility serverSelection
//<
init : function () {

    this._cache = [];

    // get unique ID and selection properties
    var initialSelectionProperty = this.selectionProperty;
    if (!initialSelectionProperty) this.selectionProperty = "_selection_" + isc.Selection._selectionID++;
    this.partialSelectionProperty = "_partial" + this.selectionProperty;

    // set the data object so we get notification for add and delete, etc.
    // NOTE: if the data object wasn't set, use a new array.
    this.setData(this.data ? this.data : []);

    // trackByKey is only supported if we have keyFields
    // trackUnloadedItems is only supported if trackByKey is true
    // log a warning and clear these flags if they can't be supported
    
    
    if (this.trackByKey && !this._shouldTrackByKey()) {
        this.logWarn("trackByKey was set to true for this Selection manager but no keyField was defined");
        this.trackByKey = false;
    }
    if (this.trackUnloadedItems && !this.trackByKey) {
        this.logWarn("selectionManager.trackUnloadedItems requires trackByKey:true - disabling trackUnloadedItems");
        this.trackUnloadedItems = false;
    }

    // if the selectionProperty was generated, then no records can be selected initially and
    // the full selection cache is not dirty.
    if (!initialSelectionProperty) this._dirty = false;
},

// override destroy to clean up pointers to this.data
destroy : function () {
    if (this.data) this.ignoreData(this.data);
    delete this.data;
    
    // selections aren't stored in global scope so no need to clear window[this.ID]
    this.Super("destroy", arguments);
},

//>	@method	selection.setData()
//			Initialize selection data.<br><br>
//			Call this method to associate the selection with a different data object.<br>
//          <i>Note: No need to call this if the contents of the selection's data is modified</i>
//		@group	selection
//		@param		newData	(Array)		new data to maintain selection in
// @visibility serverSelection
//<
setData : function (newData) {		

	// if we are currently pointing to data, stop observing it
	if (this.data != null) this.ignoreData(this.data);	

	// remember the new data
	this.data = newData;

	// observe the new data so we will update automatically when it changes
	if (this.data != null) this.observeData(this.data);

	// Note that any cache we have is out of date.
	this.markForRedraw();
},


//>	@method	selection.observeData()	(A)
//			Observe methods on the data so we change our state.
//			Called automatically by selection.setData().
//			Observes the data.dataChanged() method to invalidate the selection cache
//		@group	selection
//
//
//	@param	data	(Array)		new data to be observed
// @visibility internal
//<
observeData : function (data) {
    var isRS = isc.ResultSet && isc.isA.ResultSet(data);
    if (isRS) {
        this.observe(data, "dataChanged", function (operationType, originalRecord, rowNum, updateData, filterChanged, dataFromCache) {
            this.dataChanged(operationType, originalRecord, rowNum, updateData, filterChanged, dataFromCache);
        });
    } else {
        this.observe(data, "dataChanged", function () {
            this.dataChanged();
        });
    }
    
    if (data.dataArrived) {
        if (isRS) {
            this.observe(data, "dataArrived", function (startRow, endRow, dataFromCache) {
                this.dataArrived(startRow, endRow, dataFromCache);
            });
        } else {
            this.observe(data, "dataArrived", function () {
                this.dataChanged();
            });
        }
    }
},

//>	@method	selection.ignoreData()	(A)
//			Stop observing methods on data when it goes out of scope.
//			Called automatically by setData
//		@group	selection
//
//		@param	data	(Array)		old data to be ignored
// @visibility internal
//<
ignoreData : function (data) {
    if (!data) return;
    if (this.isObserving(data, "dataChanged")) this.ignore(data, "dataChanged");
    if (this.isObserving(data, "dataArrived")) this.ignore(data, "dataArrived");
},

//> @attr Selection.trackByKey (boolean : false : IRA)
// Should this SelectionManager track the +link{keyField,key-field values} of its selected
// items? Requires a +link{keyField} with unique values per item.
// <P>
// When enabled, instead of tracking selection state for items within the
// +link{selection.data,data list} by storing a +link{selectionProperty} value
// directly on the items, the SelectionManager will maintain a separate mapping
// of key values to selected state.
// <P>
// Note that trackByKey is required for tracking 
// +link{trackUnloadedItems,unloaded items}.
//<
trackByKey:false,

//> @attr selection.keyField (String | Array of String : null : IRA)
// If +link{trackByKey} is true, this property denotes which field will be used
// to track selected state for records. Records within this data set must have
// a unique value for this field.
// <P>
// May be specified as an array of strings for a multi-field key.
// <P>
// Note that if +link{data,this.data} is a ResultSet bound to a 
// dataSource with a primary key, the
// +link{dataSource.getPrimaryKeyFieldNames(),dataSource primaryKey} will
// be used if no explicit keyField was specified.
//<

// getter for the keyField[s]
getKeyFields : function () {
    if (this.keyField != null) {
        var fields = this.keyField;
        if (!isc.isAn.Array(fields)) {
            fields = [fields];
        }
            
        return fields;
    }
    var list = this.getItemList(),
        dataSource = list && list.getDataSource ? list.getDataSource() : null;
    if (dataSource != null) {
        return dataSource.getPrimaryKeyFieldNames();
    }
    return [];
},
_shouldTrackByKey : function () {
    return this.trackByKey && (this.getKeyFields().length > 0);
},

//> @attr Selection.trackUnloadedItems (boolean : false : IR)
// If +link{trackByKey} is true, should this SelectionManager maintain selected
// state information for items that are not currently present in the
// +link{selection.data,data list}. This is useful for the case where a user
// selects records within a 
// +link{ResultSet.dataFetchMode,partially loaded data set}, and then the
// records are lost from the client-side cache due to sorting, or changing of
// filter criteria.
//<
trackUnloadedItems:false,
_shouldTrackUnloadedItems : function () {
    return this.trackUnloadedItems && this._shouldTrackByKey();
},

// Maintain a list of key values for items with modified
// selection (selected, if defaultIsSelected is false, unselected otherwise).
// These may extend beyond our current data set.

cacheStateIndex:1,
_nullSelectionMarker:"**isc_null**",
_updateSelectionKeys : function (item, newState, unloadedItem, partial) {
    
    var keyFields = this.getKeyFields();

    var property = partial ? "_partialSelectionKeys" : "_selectionKeys";

    
    var defaultValue = partial ? false : this.defaultIsSelected;
    
    if (this[property] == null) this[property] = {};
    var targetObject = this[property];

    if (newState != defaultValue) {
        for (var i = 0; i < keyFields.length; i++) {
            var keyField = keyFields[i],
                value = item[keyField];
            if (!isc.isA.String(value) && !isc.isA.Number(value)) {
                if (this.isRoot(item)) {
                    value = this._rootSelectionMarker;
                } else if (value == null) {
                    value = this._nullSelectionMarker;
                } else {
                    this.logWarn("Unable to reliably track key-based selection for field:" + keyField + " on item:" + this.echo(item));
                    
                }
            }
            // Always refresh the target object value so we have an up to date cacheStateIndex
            if (i == (keyFields.length-1)) {
                targetObject[value] = [item, (unloadedItem ? null : this.cacheStateIndex)];
            } else if (targetObject[value] == null) {
                targetObject[value] = {};
            }
            targetObject = targetObject[value];
        }
    } else {
        var objectsPath = [];
        for (var i = 0; i < keyFields.length; i++) {
            var keyField = keyFields[i],
                value = item[keyField];
            
            if (value == null) value = this._nullSelectionMarker;

            if (targetObject[value] == null) break;

            if (i == keyFields.length-1) {
                delete targetObject[value];
                var walkback = i-1;
                while (walkback >= 0 && isc.isA.emptyObject(targetObject)) {
                    targetObject = objectsPath[walkback];
                    var targetKey = item[keyFields[walkback]]
                    delete targetObject[targetKey];
                    walkback--;
                }
            } else {
                objectsPath.add(targetObject);
                targetObject = targetObject[value];
            }
        }
    }
},

// Helper to clear selection keys entries for any unloaded items.
// this is run after cacheSelection and relies on the fact that the cacheStateIndex will
// be stale on any unloaded items.
_clearUnloadedSelectionKeys : function (partial) {

    var keyFields = this.getKeyFields();

    var property = partial ? "_partialSelectionKeys" : "_selectionKeys";

    if (this[property] == null) return;
    
    var targetObject = this[property];


    var keyEntries = this._findUnloadedSelectionKeys(targetObject, keyFields, 0);
    var defaultValue = partial ? false : this.defaultIsSelected;
    for (var i = 0; i < keyEntries.length; i++) {
        this._updateSelectionKeys(keyEntries[i][0], defaultValue, true, partial);
    }

},

// Format of key cache:
//   {  value1a:
//          {   value2a: [<record object>, "123"],
//              value2b: [<record object>, "123"],
//              ... },
//      value1b:
//          {   value2b:[<record object>, "122"],
//              ... },
//      ...
//   }
// Recursive method to find every item where the cacheStateIndex is stale or unset, indicating
// the record is unloaded in our data set.
_findUnloadedSelectionKeys : function (targetObject, keyFields, fieldNum) {
    if (fieldNum == keyFields.length-1) {
        var arr = [];
        for (var value in targetObject) {
            if (targetObject[value][1] != this.cacheStateIndex) {
                arr.add(targetObject[value[0]]);
            }
        }
        return arr;
    }
    var arr = [];
    for (var value in targetObject) {
        arr.addList(this._findUnloadedSelectionKeys(targetObject[value], keyFields, fieldNum+1));
    }
    return arr;
},

// Detection for root node in a tree - this may be treated specially for
// key-based selection
_rootSelectionMarker:"**ROOT**",
isRoot : function (item) {
    var data = this.data;
    return data && data.isRoot != null && data.isRoot(item);
},
// Helper for 'isSelected()' - determines whether some item is marked as having modified selection by key.
_selectionKeysContainsItem : function (item, updateCacheIndex, partial) {
    if (!this._selectionKeys) return false;
    if (partial && !this._partialSelectionKeys) return false;
    
    var keyFields = this.getKeyFields();
    
    var targetObj = partial ? this._partialSelectionKeys : this._selectionKeys;

    for (var i = 0; i < keyFields.length; i++) {
        var value = item[keyFields[i]];
        // Special case root - if no rootValue was specified on a tree,
        // our auto-gen'd root node may have no valueField value
        if (value == null) {
            if (this.isRoot(item)) {
                value = this._rootSelectionMarker;
            } else {
                value = this._nullSelectionMarker;
            }
        }
        
        if (targetObj[value] == null) return false;
        targetObj = targetObj[value];
    }

    // updateCacheIndex param is passed when we're rebuilding the cache
    // update the cacheStateIndex to indicate that the item is still in
    // our data set
    if (updateCacheIndex) {
        targetObj[0] = item;
        targetObj[1] = this.cacheStateIndex;
    }
    return true;
},


// Helpers to get/update selection keys directly:

//> @method selection.setSelectedByKey ()
// For +link{trackByKeys,trackByKeys:true} selection, this method allows you to update
// selection by key field values.
// @param keys (Record | Object | String | Number) Record, or key field value(s) of item to select.
// @param newState (boolean) New selection state for the target record
//<
// Expects an object of the format {keyField1:<val1>, keyField2:<val2>}
// For convenience if there's a single key field it will handle just being passed a value.

setSelectedByKey : function (keys, newState, isLoadedItem) {

    if (!this._shouldTrackByKey()) {
        this.logWarn("This Selection is not configured to maintain selection by key");
        return;
    }
    var keyFields = this.getKeyFields();
    if (!isc.isAn.Object(keys)) {
        if (keyFields.length == 1) {
            var value = keys;
            keys = {};
            keys[keyFields[0]] = value;
        } else {
            this.logWarn("setSelectedByKey - passed ambigous identifier:" + keys + " - this selection tracks multiple key fields");
        }
    }

    // We want to run through selection.setSelected() if we have an associated item
    // this ensures any components observing this selection will be redrawn
    
    var data = this.getItemList();
    var dummyDS = {
        getPrimaryKeyFields:function () {
            var pkFieldsObj = {};
            for (var i = 0; i< keyFields.length; i++) {
                pkFieldsObj[keyFields[i]] = {name:keyFields[i]};
            }
            return pkFieldsObj;
        }
    };

    
    var item;
    if (isLoadedItem == null) {
        var index = data.findByKeys(keys, dummyDS);
        if (index != -1) {
            item = data.get(index);
        }
    } else if (isLoadedItem) {
        item = keys;
    }

    if (item != null) {
        this.setSelected(item, newState);
    } else {
        this._updateSelectionKeys(keys, newState, true);
    }
},

// Helper to get the entire (modified) selection by keys, including unloaded items

getSelectionByKeys : function (includeUnloadedItems, excludePartialSelections) {

    if (!this._shouldTrackByKey()) {
        this.logWarn("This Selection is not configured to maintain selection by key");
        return;
    }
    if (this._dirty) this.cacheSelection();
    var results = [];
    this._getSelectionKeyValues(this._selectionKeys, results, this.getKeyFields(), [], includeUnloadedItems);
    
    var partialSelections = [];
    this._getSelectionKeyValues(this._partialSelectionKeys, partialSelections, this.getKeyFields(), [], includeUnloadedItems);
    
    
    if (this.defaultIsSelected) {
        if (!excludePartialSelections) {
            results.addList(partialSelections);
        }
    } else {
        if (excludePartialSelections) {
            results.removeList(partialSelections);
        }
    }
    return results;
},

// Recursive method to extract selected items from our nested cache of _selectionkeys
// - targetObject is the _selectionKeys object (or a sub-object of it)
// - results is the array that we'll populate with actual data when we get to our innermost field
// - path is an array of values retrieved so far to get to the target object
// - keyFields is the keyFields array for convenience
// - includeUnloadedItems flag allows us to include/exclude items that aren't in our data set but were marked as selected
_getSelectionKeyValues : function (targetObject, results, keyFields, path, includeUnloadedItems) {

    // If stale, unloaded items exist in our cache but this.trackUnloadedItems is false, 
    // ignore them.
    
    if (includeUnloadedItems && !this._shouldTrackUnloadedItems()) includeUnloadedItems = false;

    var values = isc.getKeys(targetObject);
    
    for (var i = 0; i < values.length; i++) {
        var innerPath = path.duplicate();
        innerPath.add(values[i]);
        if (innerPath.length < keyFields.length) {
            var innerTarget = targetObject[values[i]];
            this._getSelectionKeyValues(innerTarget, results, keyFields, innerPath, includeUnloadedItems);
        } else {
            if (!includeUnloadedItems && targetObject[values[i]][1] != this.cacheStateIndex) {
                //>DEBUG
                this.logDebug("Skipping stale record:" + this.echo(targetObject[values[i]][0]));
                //<DEBUG
                continue;
            }
            results.add(targetObject[values[i]][0]);
        }
    }
},


// dataChanged implementation performs a couple of tasks:
// - reselectOnUpdate attribute set by DBC. If set, reapply selection when
//   an updated record is folded back into the ResultSet cache
// - if the dataChange is due to a local filter revealing new records that were
//   in the ResultSet's local cache but hidden due to non-matching criteria,
//   wipe any "selected" property from them so we don't have odd stale-seeming
//   selections popping up on refilter.
// - wipe our complete selection cache to account for records that may have been
//   removed from this.data
dataArrived : function (startRow,endRow,dataFromCache) {
    if (!this.data) return;

    
    var updateOp,
        originalRecord,
        updateData,
        rowNum,
        filterChanged;
    if (this.data._isChangingData() && isc.isA.ResultSet(this.data)) {
        updateOp = this.data._lastUpdateOperation;
        updateData = this.data._lastUpdateData;
        originalRecord = this.data._lastOrigRecord;
        rowNum = this.data._lastUpdateRow;   

    }

    this.dataChanged(updateOp, originalRecord, rowNum, updateData, false, dataFromCache);
    // This method can fire from ResultSet dataChanged doing a filterLocalData()
    // In this case, suppress the next dataChanged() which fires at the end of the
    // resultSet 'dataChanged' method
    
    if (this.data._isChangingData()) {
        this._ignoreNextDataChanged = true;
    }
},

dataChanged : function (operationType,originalRecord,rowNum,updateData,filterChanged,dataFromCache) {
    if (this._ignoreNextDataChanged) {
        delete this._ignoreNextDataChanged;
        return;
    }

    if (this.reselectOnUpdate && operationType == "update" && originalRecord != null &&
                this.isSelected(originalRecord, rowNum)) 
    {
        
        var modifiedRecord = this.data.findByKey(originalRecord);
        if (modifiedRecord) this.performReselectOnUpdate(modifiedRecord, rowNum);

    // 'dataFromCache' param - only applies to resultSets:
    // Implies the change of data was satisfied from a client side cache of records
    // rather than fresh data coming from the server, and as such we (the selection) 
    // may have already seen these records and marked as selected.
    // If this is the case, the selected property should be considered stale and
    // cleared.
    // Use case: A record was selected in a resultSet, the criteria were changed
    // such that it was removed from the filtered data (but retained in 
    // the client-side "allRows" cache), then the criteria changed again such that
    // the record is re-introduced into the filtered data set
    // We have to treat as stale - otherwise it's easy to run into bugs such as
    // selectionType:"single" widgets ending up with multiple selected rows.
    } else if (dataFromCache) {

        if (this._dirty) this.cacheSelection();
        // return the cached selection list if possible
        var selection = this._cache,
            newCache = [],
            data = this.getItemList(),
            length = data.getLength();
        
        if (selection == null ||
            (isc.isA.ResultSet != null && isc.isA.ResultSet(data) && !data.lengthIsKnown())) {
        } else {
            for (var i = 0; i < length; i++) {
                // getCachedRow won't trigger fetches if working with a remote dataset
                var item = data.getCachedRow(i),
                    selected = item == null ? false :
                    
                        
                        this.isSelected(item, i);
                
                var inCache;
                if (selected != this.defaultIsSelected) {
                    inCache = selection.contains(item);
                    if (inCache || this._shouldTrackUnloadedItems()) {
                        newCache.add(item);
                    // If we're not tracking unloaded items, ensure we don't reselect an item that
                    // was formerly selected, lost from the data set then reacquired
                    
                    } else {           
                        
                        if (this.defaultIsSelected) {
                            this.select(item, i);
                         } else {
                            this.deselect(item, i);
                         }
                    }
                }
                // If the record is not marked as selected, nothing to do
            }
            
            
        }
    }	        
    this.markForRedraw();

    // Update the selected record in the rule context.  Note, if we have multi-selection, the 
    // "selected record" is considered to be the first of the selected set, so we should only
    // update the rule context if the changed record is also the first selected record.
    // IMPORTANT: only do this if there is a rule context to update, because calling 
    // getSelection() can be an expensive operation on large Trees
    var grid = this.target,
        ruleScopeComponent = (grid && grid.getRuleScopeComponent ? grid.getRuleScopeComponent() : null);
    if (ruleScopeComponent && modifiedRecord) {
        var updateContext = false;
        
        var ds = isc.DataSource.get(this.data.dataSource);
        if (this.multipleSelected()) {
            var sel = this.getSelection();
            if (ds != null) {
                var index = ds.findByKeys(originalRecord,sel);
                updateContext = index == 0;
            }
        } else {
            updateContext = true;
        }
        if (updateContext) {
            var id = grid.getLocalId(),
                hasStableID = grid.hasStableLocalID() || (grid.editNode != null);

            // Disconnect selected record from the ruleContext 
            modifiedRecord = isc.shallowClone(modifiedRecord);

            ruleScopeComponent.provideRuleContext(ds.getID(), modifiedRecord, grid, null, hasStableID);
            if (hasStableID) {
                ruleScopeComponent.provideRuleContext(id + ".selectedRecord", modifiedRecord, grid, null, false);
            }
        }
    }
},


performReselectOnUpdate : function (modifiedRecord) {
    this.select(modifiedRecord);
},

//>	@method	selection.markForRedraw()
//			Mark the selection as dirty, so it will be recalculated automatically			
//		@group	selection
// @visibility internal
//<
markForRedraw : function () {
	this._dirty = true;
    this._openCache = null;
},	

//>	@method	selection.isSelected()
// Return true if a particular item is selected
//
// @param item (Object) object to check	
// @return (boolean) true == object is selected, false == object is not selected
// @group selection
// @visibility external
//<
// @param [onlyOpen] (Boolean) if we only require searching among open nodes when the data
// is a Tree. For example, in drawing the body of a TreeGrid, we need to know whether an open
// node is selected, so we call isSelected() with onlyOpen = true. This is an optimization
// for large sorted trees.
isSelected : function (item, recordNum, onlyOpen) {
    // If the data is not a tree or cascade selection is enabled, then set onlyOpen to false.
    // onlyOpen makes sense for trees only, where it is an optimization hint to consider only
    // the open nodes.
    // Cascade selection is fundamentally incompatible with onlyOpen because if a partially
    // selected node is closed, we still want to know whether the closed children of the node
    // are selected so that they may be selected or deselected.
    if (onlyOpen && (this.cascadeSelection || !isc.isA.Tree(this.data))) {
        onlyOpen = false;
    }
    
    if (this._dirty && !(onlyOpen == true && this._openCache != null) && !this._cachingSelection) {
        this.cacheSelection(onlyOpen);
    }

    

	if (item == null) return false;

    // trackByKey - instead of checking the selected flag on the item, 
    // check the item's presence in our _selectionKeys list
    if (this._shouldTrackByKey()) { 
        // If we're currently rebuilding our cache, update the flag on the selectionKeys object 
        // so we know the item is present in the current data set.           
        var modified = this._selectionKeysContainsItem(item, this._cachingSelection);
        return (this.defaultIsSelected != modified);
    } else {
        
        var explicitSelection = this.getSelectedFlag(item, recordNum);
        return explicitSelection == null ? this.defaultIsSelected : explicitSelection;
    }
},

//> @method selection.isPartiallySelected()
// When using tree-oriented selection modes like +link{treeGrid.cascadeSelection}, returns true
// if the record is considered partially selected because only some of it's children are
// selected.
//
// @param  item	(Object)  object to check	
// @return (boolean)      true == object is partially selected
//                        false == object is not partially selected
// @group  selection
// @visibility external
//<

isPartiallySelected : function (item) {

    
    if (this._dirty && !this._cachingSelection) this.cacheSelection();
    if (item == null) return false;

    // trackByKey - instead of checking the selected flag on the item, 
    // check the item's presence in our _partialSelectionKeys list
    if (this._shouldTrackByKey()) { 
        // If we're currently rebuilding our cache, update the flag on the selectionKeys object 
        // so we know the item is present in the current data set.           
        var modified = this._selectionKeysContainsItem(item, this._cachingSelection, true);
        return modified;

    } else {

        
        return !!item[this.partialSelectionProperty];
    }
},


//>	@method	selection.anySelected()
// Whether at least one item is selected
//		@group	selection
//
//		@return		(boolean)	true == at least one item is selected
//								false == nothing at all is selected
// @visibility external
//<
// @param [includeUnloadedItems] (boolean) If +link{trackUnloadedItems,unloaded items are being tracked}
//   by this selection, and +link{defaultIsSelected} is false this parameter will return true for
//   unloaded items that are marked as selected.
//   Has no effect is defaultIsSelected is true - we don't track explicitly selected state beyond the data-st
//   in that case.

anySelected : function (includeUnloadedItems) {
    // Special case - if we're looking for unloaded items as well as loaded ones just return true
    // if we have anything in the special _selectionKeys object.
    if (!this.defaultIsSelected && includeUnloadedItems && this._shouldTrackByKey()) {
        return (this._selectionKeys != null && !isc.isA.emptyObject(this._selectionKeys));
    }

    var modifiedSelection = this._getModifiedSelection(false, true);
    if (this.defaultIsSelected) {
        // return true if we have any unmodified [non-deselected] rows
        return (this.getItemList().getLength() > modifiedSelection.length);
    } else {
        // return true if the selection is non-empty
        return modifiedSelection.length > 0;
    }
},

//>	@method	selection.getLength()
// Returns the number of selected records.
//
// @return (int) number of selected records
// @group selection
// @visibility external
//<
getLength : function () {
    var modifiedSelection = this._getModifiedSelection(false, true);
    if (this.defaultIsSelected) {
        return (modifiedSelection.length - this.getItemList().getLength());
    } else {
        return modifiedSelection.length;
    }
},

//>	@method	selection.multipleSelected()
//	Whether multiple items are selected
//		@group	selection
//
//		@return		(boolean)	true == more than one item is selected
//								false == no items are selected, or only one item is selected
// @visibility external
//<
multipleSelected : function () {
    return this.getLength() > 1;
},


//> @method selection.getSelection()
// Return an ordered array of all of the selected items
// @param [excludePartialSelections] (Boolean) When true, partially selected records will not be returned.
//                                   Otherwise, all fully and partially selected records are
//                                   returned.
// @return (Array) list of selected items
// @group selection
// @visibility external
//<
getSelection : function (excludePartialSelections, dontSort) {
    return this._getSelection(excludePartialSelections, dontSort, true);
},

_getSelection : function (excludePartialSelections, dontSort, isSelected) {
    
    if (isSelected != this.defaultIsSelected) {
        // duplicate the selection so subsequent manipulation of our cache doesn't confuse
        // callers.
        return this._getModifiedSelection(excludePartialSelections, dontSort).duplicate();
    } else {

        // If we're getting all the items in the "default" state we have to loop through
        // our data set and pick up anything that isn't explicitly modified.
        

        // If we don't have a complete data set, we're going to be returning an
        // 'incomplete' list of selected [or unselected] items, logically speaking.
        
        if (!this.hasCompleteData()) {
            var selectedState = (isSelected ? "selected" : "unselected");
            this.logInfo("Attempting to retrieve all " + selectedState +
                " items from incomplete data set where all items are " + selectedState + 
                " by default. Only items that have been loaded will be returned." +
                " See the method 'selection.hasCompleteData()' for more information.");
        }

        var data = this.getItemList(),
            length = data.getLength();
        
        var useGetCachedRow = false;
        if (isc.isA.ResultSet(data)) {
            if (this.accessResultSetCache) {
                data = data.localData || [];
            } else {
                useGetCachedRow = true;
            }
        }

        var selection = [];
        for (var i = 0; i < length; i++) {
            var item = useGetCachedRow ? data.getCachedRow(i) : data.get(i);
            if (item == null || item == Array.LOADING) continue;

            var selected = this.isSelected(item, i);
            if (!selected && !excludePartialSelections) {
                selected = this.isPartiallySelected(item, i);
            }
            if (selected == isSelected) {
                selection[selection.length] = item;
            }
        }
        return selection;
    }
},

// Inverse of getSelection() to retrieve unselected item list
getUnselectedItems : function (excludePartialSelections, dontSort) {
    return this._getSelection(excludePartialSelections, dontSort, false);
},


_getModifiedSelection : function (excludePartialSelections, dontSort) {
    // if the selection is dirty, cache it again
    if (this._dirty) {
        if (this._cachingSelection) this._cachingSelection = false;
        this.cacheSelection(false, dontSort);
    }

    // return the cached selection list if possible
    var selection = this._cache;
    // If partial selections are excluded, built a new list of full selections only.
    if (excludePartialSelections && selection != null && selection.length > 0) {
        var cache = this._cache;
        selection = [];

        // Cache includes both fully and partially selected nodes.
        for (var i = 0; i < cache.length; i++) {
            var item = cache[i];
            if (!this.isPartiallySelected(item)) {
                selection[selection.length] = item;
            }
        }               
    }

    

    return selection;
},


//>	@method	selection.getSelectedRecord()
//			Return the first item in the list that is selected.<br><br>
//
//			Note that this should only be used if you know that one only one item
//			 may be selected, or you really don't care about items after the first one.<br><br>
//
//			To get all selected objects, use <code>+link{method:selection.getSelection()}</code>
//		@group	selection
//
//		@return		(Object)	first selected record, or null if nothing selected
// @visibility external
//<
getSelectedRecord : function () {
    var modifiedSelection = this._getModifiedSelection() || [];
    if (this.defaultIsSelected) {
        if (modifiedSelection.length == this.data.getLength()) return null;
        // find the first record that isn't explicitly modified.
        var useGetCachedRow = this.data && isc.isA.ResultSet(this.data);
        for (var i = 0; i < this.data.getLength(); i++ ) {
            var record = useGetCachedRow ? this.data.getCachedRow(i) : this.data.get(i);
            if (this.isSelected(record)) return record;
        }
    } else {
        if (modifiedSelection.length > 0) return modifiedSelection[0];
    }
},


//>	@method	selection.cacheSelection()	(A)
// Cache the selected records since we operate on it so often.
// Sets an internal variable _cache to hold the selection.
// @group selection
// @visibility internal
//<

accessResultSetCache:true,
cacheSelection : function (onlyOpen, dontSort) {
    
    
    
    this.cacheStateIndex++;

    // Don't allow this method to fire recursively, or in response to 'setSelection'
    // if we're marked as dirty
    if (this._settingSelected || this._suppressCaching) {
        
        return;
    } else if (this._cachingSelection) {
        
        return;
    }
	// create a new array to hold the cached selection
    // When onlyOpen is true, we create an "openCache", which is a list of all selected open
    // nodes. As long as we're only interested in the open nodes, we can use the openCache
    // if available.
    var cache;
    if (onlyOpen) {
        cache = this._openCache = [];
        
    } else {
        
        cache = this._cache = [];
        this._openCache = null;
    }

    var data = this.getItemList(onlyOpen, dontSort);

    // This is critical path code - for maximum efficiency, if we're working with a
    // ResultSet, look directly at its localData array rather than going through the
    // getCachedRow() API
    // undocumented accessResultSetCache attribute allows us to turn this optimization
    // off for cases where it won't work (EG custom class which implements the List interface)
    var isRSCache = false;
    if (this.accessResultSetCache && isc.isA.ResultSet(data)) {
        isRSCache = true;
        data = data.localData || [];
    }
    var useGetCachedRow = !isc.isAn.Array(data),
        length = data.getLength();
 
    
    if (isc.isA.ResultSet != null && isc.isA.ResultSet(data) && !data.lengthIsKnown()) {
        this._dirty = false;
        return;
    }
    this._cachingSelection = true;
    this._cachingOnlyOpen = onlyOpen;

	// iterate over the records of the list, selecting those that have the selection property set
	// Critical path - avoid the "cascadeSelection" logic if it doesn't apply
	if (this.cascadeSelection) {
        var delayCache = false;
        for (var i = 0; i < length; i++) {

            // getCachedRow won't trigger fetches if working with a remote dataset
            var item = useGetCachedRow ? data.getCachedRow(i) : data[i];
            if (item != null && item !== Array.LOADING && 
                (this.isSelected(item, i, onlyOpen) != this.defaultIsSelected)) 
            {
                // If cascadeSelection is true and new data has arrived, it may be
                // selected. In this case we need to update the 'partial' selected state
                // of parents, and the selected state of descendents.
                // To handle this - call 'setSelected' with the flag to force a recalculation of
                // cascading selection, and then loop through all records a second time, updating
                // cache.
                
                if (!this.isPartiallySelected(item, i)) {
                    
                    var lastItem = this.lastSelectionItem,
                        lastState = this.lastSelectionState,
                        lastPrevState = this.lastSelectionPreviousState,
                        lastPartialState = this.lastSelectionPartialValue,
                        lastPrevPartialState = this.lastSelectionPreviousPartialValue;

                    
                    this.setSelected(item, !this.defaultIsSelected, i, null, true);

                    this.lastSelectionItem = lastItem;
                    this.lastSelectionState = lastState;
                    this.lastSelectionPreviousState = lastPrevState;
                    this.lastSelectionPartialValue = lastPartialState;
                    this.lastSelectionPreviousPartialValue = lastPrevPartialState;

                    delayCache = true;
                }
                if (!delayCache) {
                    cache[cache.length] = this.transformItemForCaching(item, i);
                }
            }
        }
        // cascading selection - we may have actually manipulated our selection to mark 
        // parents as partially selected / children as entirely selected - loop through all 
        // nodes again!
        if (delayCache) {
            if (onlyOpen) {
                cache = this._openCache = [];
                
            } else {
                cache = this._cache = [];
                this._openCache = null;
            }
            for (var i = 0; i < length; i++) {

                // getCachedRow won't trigger fetches if working with a remote dataset
                var item = useGetCachedRow ? data.getCachedRow(i) : data[i];
                if (item != null && item !== Array.LOADING &&
                        (this.isSelected(item, i, onlyOpen) != this.defaultIsSelected))
                {
                    cache[cache.length] = this.transformItemForCaching(item, i);
                }
            }
        }
    // no cascade selection
    } else {
        
        if (isRSCache) {
            for (var i = 0; i < length; i++) {
                var item = data[i];                                
                if (item != null && item !== Array.LOADING && 
                    (this.isSelected(item, i, onlyOpen) != this.defaultIsSelected)) 
                {
                    cache[cache.length] = this.transformItemForCaching(item, i);
                }
            }
        } else {
            for (var i = 0; i < length; i++) {
                var item = useGetCachedRow ? data.getCachedRow(i) : data[i];
                if (item != null && (this.isSelected(item, i, onlyOpen) != this.defaultIsSelected)) {
                    cache[cache.length] = this.transformItemForCaching(item, i);
                }
            }
        }
    }

    // When tracking selection by keys, we may have unloaded items in our selectionKeys object
    // at this stage.
    // Explicitly remove these from the keys tacking cache
    
    if (this.trackByKey && !this.trackUnloadedItems) {
        this._clearUnloadedSelectionKeys(true);
        this._clearUnloadedSelectionKeys(false);
        
    }

    this._cachingSelection = false;
    //this.logWarn("***** - selection re-cached - *******");

    // note that the selection is no longer dirty if we cached the entire selection
    // The _dirty flag is set if and only if the _cache (the list of all selected nodes whether
    // or not they are open) is current. Thus, if we just prepared an openCache, we shouldn't
    // unset the _dirty flag.
    if (!onlyOpen) this._dirty = false;
},


_cacheSelectionAsync : function (thisArg, timerEventProp, batchSize, callback, state) {
    
    if (state == null || state.afterGetItemList) {
        if (state == null) {
            // Don't allow this method to fire recursively, or in response to 'setSelection'
            // if we're marked as dirty
            if (this._cachingSelection || this._settingSelected || this._suppressCaching) {
                callback.call(thisArg);
                return;
            }

            var me = this;
            this._getItemListAsync(thisArg, timerEventProp, batchSize, function (data) {
                var state = { data: data, afterGetItemList: true };
                thisArg[timerEventProp] = me.delayCall(
                    "_cacheSelectionAsync", [thisArg, timerEventProp, batchSize, callback, state], 0);
            });
            return;
        }

        state.afterGetItemList = false;

        // create a new array to hold the cached selection
        state.cache = [];
        state.length = state.data.getLength();

        
        if (isc.isA.ResultSet != null && isc.isA.ResultSet(state.data) && !state.data.lengthIsKnown()) {
            this._dirty = false;
            this._cache = cache;
            this._openCache = null;
            callback.call(thisArg);
            return;
        }
        this._cachingSelection = true;
        this._cachingOnlyOpen = false;
        state.inFirstLoop = true;
        state.delayCache = false;
        state.i = 0;
    }
    var cache = state.cache,
        data = state.data,
        length = state.length,
        inFirstLoop = state.inFirstLoop,
        delayCache = state.delayCache,
        i = state.i,
        dirty = this._dirty;

    // Prevent isSelected() from calling cacheSelection().
    this._dirty = false;

    if (inFirstLoop) {
        // iterate over the records of the list, selecting those that have the selection property set
        var maxI = Math.min(length, i + batchSize);
        for (; i < maxI; i = state.i = i + 1) {

            // getCachedRow won't trigger fetches if working with a remote dataset
            var item = data.getCachedRow(i);
            if (item != null && (this.isSelected(item, i) != this.defaultIsSelected)) {
                // If cascadeSelection is true and new data has arrived, it may be
                // selected. In this case we need to update the 'partial' selected state
                // of parents, and the selected state of descendents.
                // To handle this - call 'setSelected' with the flag to force a recalculation of
                // cascading selection, and then loop through all records a second time, updating
                // cache.
                
                if (this.cascadeSelection && !this.isPartiallySelected(item)) {
                    this.setSelected(item, true, null, null, true);
                    delayCache = state.delayCache = true;
                }
                if (!delayCache) {
                    cache[cache.length] = item;
                }
            }
        }
        if (i != length) {
            this._dirty = dirty;
            if (dirty) this._openCache = null;
            this._cachingSelection = false;
            thisArg[timerEventProp] = this.delayCall(
                "_cacheSelectionAsync", [thisArg, timerEventProp, batchSize, callback, state], 0);
            return;
        }
        inFirstLoop = state.inFirstLoop = false;
    }
    if (!inFirstLoop && delayCache) {
        // cascading selection - we may have actually manipulated our selection to mark
        // parents as partially selected / children as entirely selected - loop through all
        // nodes again!

        cache = state.cache = [];
        i = state.i = 0;
        var maxI = Math.min(length, i + batchSize);
        for (; i < length; i = state.i = i + 1) {

            // getCachedRow won't trigger fetches if working with a remote dataset
            var item = data.getCachedRow(i);
            if (item != null && (this.isSelected(item, i) != this.defaultIsSelected)) {
                cache[cache.length] = item;
            }
        }
        if (i != length) {
            this._dirty = dirty;
            if (dirty) this._openCache = null;
            this._cachingSelection = false;
            thisArg[timerEventProp] = this.delayCall(
                "_cacheSelectionAsync", [thisArg, timerEventProp, batchSize, callback, state], 0);
            return;
        }
    }

    this._cachingSelection = false;
    //this.logWarn("***** - selection re-cached - *******");

    // note that the selection is no longer dirty
    this._dirty = false;

    this._cache = cache;
    this._openCache = null;
    callback.call(thisArg);
    return;
},

//> @attr selection.defaultIsSelected (boolean : false : IRWA)
// This flag enables a mode where every record in the target data set is 
// considered selected by default, unless explicitly marked as being unselected.
//<
// This is useful for cases where we want to track explicitly *unselected*
// data - used by the MultiPickerItem / InSetItem to generate notInSet criteria
// by unchecking records from a ListGrid.
// This also allows "selectAll" type behavior for paged data sets
// Note: Certain APIs (such as getSelection()) will only ever return records that are 
// currently in the data set of course.
defaultIsSelected:false,

//> @method selection.setDefaultIsSelected() [A]
// Setter to update +link{defaultIsSelected} at runtime.
// <P>
// This method will always clear any explicitly selected or deselected items
// as well as changing the default selection.
// <P>
// Note that +link{selectAll()} and +link{deselectAll()} may invoke this method if
// passed the <code>clearUnloadedItems</code> parameter.
//<
setDefaultIsSelected : function (defaultIsSelected) {
    if (this.defaultIsSelected == defaultIsSelected) return;
    this.defaultIsSelected = defaultIsSelected;
    this.markForRedraw(); // clear cache and mark as dirty
    
    // Ensure anything explicitly marked with the previous default flag is inverted.
    
    var modifiedSelection = this._getModifiedSelection();
    this.selectList(modifiedSelection, defaultIsSelected);
},

//> @method Selection.hasCompleteData()
// Does this selection have a complete set of data loaded? If this selection's
// +link{data} is a paged +link{ResultSet}, it may not have a complete cache
// of data available (see +link{resultSet.allMatchingRowsCached()}). In this
// case this method will return false.
// <P>
// There are a few implications to how selections behave with a partially 
// loaded data set.
// <P>
// If +link{defaultIsSelected} is true, the +link{getSelection()} method will
// return only the currently loaded items in the list, even though if 
// more items were retrieved from by the list they would also be part of the
// selected set. Similarly, if +link{defaultIsSelected} is false, 
// +link{getUnselectedRecords()} will return only the unselected records from
// the loaded set of data.
// <P>
// If +link{selectAll()} is invoked with defaultIsSelected:false
// (or +link{deselectAll()} with defaultIsSelected:true), only the loaded records
// will be marked as selected (or deselected) by default. This means if
// new records are loaded (for example by scrolling the grid), they will be
// marked as selected by default.
// <P>
// Developers may use the special <code>clearUnloadedItems</code> parameter
// to avoid this. This parameter will cause defaultIsSelected to be toggled
// so any newly revealed rows will appear selected or unselected as appropriate
//<

hasCompleteData : function () {
    var data = this.getItemList();
    if (data && isc.ResultSet && isc.isA.ResultSet(data) && !data.allMatchingRowsCached()) {
        return false;
    }
    return true;
},

//>	@method	selection.setSelected()	(A)
// Select or deselect a particular item.<br><br>
// All other selection routines go through this one, so by observing this routine you can
// monitor all selection changes.
//		@group	selection
//
//		@param	item		(Object)	object to select
//		@param	newState	(boolean)	turn selection on or off	
// 	
//		@return			(boolean)	true == selection actually changed, false == no change
// @visibility external
//<
// We need the cascadingDirection to avoid changing direction while recursing through tree.
_$up:"up",
_$down:"down",
setSelected : function (item, newState, recordNum, cascadingDirection, recalculate) {

	// bail if we don't have valid data
	if (this.data == null || this.data.destroyed) {
	    return false;
    }

    //>DEBUG
    isc.Selection._assert(!isc.isA.MultiLinkSelection(this) || this.data.isMultiLinkTree());
    //<DEBUG

    item = this.transformItem(item, recordNum);
    recordNum = this.transformRecordNum(recordNum);

    if (!this._canSelectItem(item)) return false;

 	var settingSelected = this._settingSelected;
 	this._settingSelected = true;

    var childProp = this.data.childrenProperty || "children",
        property = this.selectionProperty,
        partialProperty = this.partialSelectionProperty,
        isNode = false;
    
    var oldPartialValue = (isNode ? item.getAttribute(partialProperty) 
                                  : this.isPartiallySelected(item, recordNum));

	// default to selecting the item
	if (newState == null) newState = true;

    // Set partial property as needed.
    if (this.cascadeSelection && !this.useRemoteSelection) {
        // If this is a parent node and we are selecting/deselecting up the tree,
        // need to determine if the selection is full or partial.
        if (cascadingDirection == this._$up) {
            var partialValue = false,
                length = item[childProp] ? item[childProp].length : 0;
            
            for (var i = 0; i < length; i++) {
                var child = item[childProp].get(i),
                    isChildNode = false;
                
                var partialChild = (isChildNode ? child.getAttribute(partialProperty)
                                                : this.isPartiallySelected(child, recordNum+i));
                ;
                if (partialChild ||
                    (newState && !this.isSelected(child, recordNum+i)) ||
                    (!newState && this.isSelected(child, recordNum+i)))
                {
                    partialValue = true;
                    break;
                }
            }
            
            if (isNode) {        
                item.setAttribute(partialProperty, partialValue + "");
            } else {
                if (this._shouldTrackByKey()) {
                    this._updateSelectionKeys(item, partialValue, false, true);
                } else {
                    this.setPartiallySelectedFlag(item, recordNum, partialValue);
                }
            }

            // If deselecting but there is a partial selection, the node must still be selected.
            if (newState != partialValue) newState = true;
        
        // cascading direction != up
        } else if (item[childProp] && item[childProp].length > 0) {
            // Make sure a left over partial selection is cleared
            if (isNode) {
                item.removeAttribute(partialProperty);
            } else {
                if (this._shouldTrackByKey()) {
                    // We're always setting partial selected state to false, even if
                    // defaultIsSelected is false - partial state would indicate that
                    // we have a mix of selected/unselected children regardless of default
                    // selection state.
                    this._updateSelectionKeys(item, false, false, true);
                } else {
                    this.clearPartiallySelectedFlag(item, recordNum);
                }
            }
        }
    }

    // get the oldState of the item, for detecting changes
    var oldState = isNode ? item.getAttribute(property) : this.isSelected(item, recordNum);
    if (oldState == null) oldState = false;
	// set the state of the item
    if (isNode) {
        
    	item.setAttribute(property, (newState == true) + "");
        //this.logWarn("set attribute on: " + this.echoLeaf(item) + " to: " + newState + 
        //             ", now reads: " + item.getAttribute(property));
    } else {
        if (this._shouldTrackByKey()) {
            this._updateSelectionKeys(item, newState);
        } else {
            
            this.setSelectedFlag(item, recordNum, newState);
        }
    }

    
    
	
    // remember that this was the last item to be selected
    this.lastSelectionItem = item;
    this.lastSelectionState = newState;
    this.lastSelectionPreviousState = oldState;
    this.lastSelectionPartialValue = partialValue;
    this.lastSelectionPreviousPartialValue = oldPartialValue;

    // if no change to state of item, simply return false
    var newPartialValue = (isNode ? item.getAttribute(partialProperty) : this.isPartiallySelected(item,recordNum));
    var changed = true;
    if (newState == oldState && newPartialValue == oldPartialValue) {
        changed = false;
    }
    if (!recalculate && changed == false) {
        if (!settingSelected) this._settingSelected = false;
        return false;
    }
	
    

	// note that the selection is dirty so it can be recalculated
	this.markForRedraw();

    // Select/deselect parent and child records
    if (this.cascadeSelection &&
        !this.useRemoteSelection)
    {
        var lastItem = item,
            lastState = newState,
            lastPrevState = oldState,
            lastPartialState = partialValue,
            lastPrevPartialState = oldPartialValue;

        this.preserveAdditionalSetSelectionState();
            
        
        var cascadeSource = false;
        if (this.cascadeSyncOnly == null) {
            cascadeSource = true;
            this.cascadeSyncOnly = !changed;
        }


        // Select/deselect child records
        if (cascadingDirection != this._$up && !isNode &&
            item[childProp] && item[childProp].length > 0)
        {
            this.selectList(item[childProp], newState);
        }
        
        if (changed || cascadeSource) {
        // Select/deselect parent records
            if (cascadingDirection != this._$down && isc.isA.Tree(this.data)) {
                var parent = this.getParent(item);
                // note: we do this even if isSelected == newState -- we may need
                // to set a partial selected state to fully selected or vice-versa.
                if (parent) {
                    this.recurseSelectionUpward(parent, newState, recordNum, this._$up);
                }
            }
        }

        this.lastSelectionItem = lastItem;
        this.lastSelectionState = lastState;
        this.lastSelectionPreviousState = lastPrevState;
        this.lastSelectionPartialValue = lastPartialState;
        this.lastSelectionPreviousPartialValue = lastPrevPartialState;

        this.restoreAdditionalSetSelectionState();

        if (cascadeSource) {
            this.cascadeSyncOnly = null;
        }
    }
    if (!settingSelected) this._settingSelected = false;

    // Fire selectionChange on this.target if present
    
    if (changed && this.target && this.target.selectionChange) {
        this.target.selectionChange(item, newState);
    }
	// return true to indicate that there was a change in the selection state
	return true;
},



// These following methods factor out direct property accesses and selection-model-specific 
// calls, so that they can be cleanly overridden to provide different behavior in the 
// MultiLinkSelection subclass

transformItem : function(item, recordNum) {
    return item;
},

transformRecordNum : function(recordNum) {
    return recordNum;
},

transformItemForCaching : function(item, recordNum) {
    return item;
},

getRange : function(start, end) {
    return this.data.getRange(start, end);
},

getPartiallySelectedFlag : function(item, recordNum) {
    return item[this.partialSelectionProperty];
},
setPartiallySelectedFlag : function(item, recordNum, value) {
    item[this.partialSelectionProperty] = value;
},
clearPartiallySelectedFlag : function(item, recordNum) {
    delete item[this.partialSelectionProperty];
},

getSelectedFlag : function(item, recordNum) {
    return item[this.selectionProperty];
},
setSelectedFlag : function(item, recordNum, newState) {
    item[this.selectionProperty] = newState;
},
clearSelectedFlag : function(item, recordNum) {
    delete item[this.selectionProperty];
},

getParent : function(item, recordNum) {
    return this.data.getParent(item)
},

recurseSelectionUpward : function(parent, newState, recordNum, cascadeDirection) { 
    this.setSelected(parent, newState, recordNum, cascadeDirection);
},

preserveAdditionalSetSelectionState : function() {
},
restoreAdditionalSetSelectionState : function() {
},

getLastIndex : function(record, recordNum) {
    return this.data.fastIndexOf ? this.data.fastIndexOf(record) 
                                 : this.data.indexOf(record);
},

getBaseIndex : function() {
    return this.data.fastIndexOf ? this.data.fastIndexOf(this._shiftSelectBaseRecord) 
                                 : this.data.indexOf(this._shiftSelectBaseRecord);
},

// End refactoring

_canSelectItem : function (item) {
    // if the item is null, just return
	if (item == null) {
	    return false;
    }

	// if the item is not enabled, just return
	if (item[this.enabledProperty] == false) return false;
    // if the item cannot be selected, just return
    if (item[this.canSelectProperty] == false) return false;

    return true;
},    


//>	@method	selection.select()
//			Select a particular item
//		@group	selection
//
//		@param		item	(Object)	object to select	
//		@return				(boolean)	true == selection actually changed, false == no change
// @visibility external
//<
select : function (item) {
    return this.setSelected(item, true);
},

//>	@method	selection.deselect()
//			Deselect a particular item
//		@group	selection
//
//		@param		item	(Object)	object to select	
//		@return				(boolean)	true == selection actually changed, false == no change
// @visibility external
//<
deselect : function (item) {
    return this.setSelected(item, false);
},


//>	@method	selection.selectSingle()
// Select a single item and deselect everything else
//		@group	selection
//
//		@param		item	(Object)	object to select	
//		@return				(boolean)	true == selection actually changed, false == no change
// @visibility external
//<

selectSingle : function (item, clearUnloadedItems) {
    var itemWasSelected, othersWereSelected;
    

    if (this.isSelected(item) && this._getModifiedSelection().length == 1) {
        // row is already selected, and it's the only selected row - just ignore the call
        return false;
    }

    // NOTE: deselectAll all loaded, selected rows without triggering further server
    // notifications
    this._doingLocalUpdate = true;
    itemWasSelected = this.deselect(item);
    // If defaultIsSelected is true call deselectAll rather than trying to
    // build a list of everything that's not explicitly marked as selected
    
    // If the clearUnloadedItems flag was passed, also call deselectAll as this
    // already has logic to handle deselecting explicitly selected, unloaded items
    // if we're tracking selection for unloaded items.
    if (clearUnloadedItems || this.defaultIsSelected) {
        othersWereSelected = this.deselectAll(clearUnloadedItems);
    // otherwise do a more efficient deselectList() of our current selection
    } else {
        othersWereSelected = this.deselectList(this._getModifiedSelection());
    }
    this.select(item);
    this._doingLocalUpdate = false;
    // return true if the item became selected or others were cleared
    return !itemWasSelected || othersWereSelected;
},

//>	@method	selection.selectList()
// Select an array of items (subset of the entire list)
// @group selection
//
// @param list (Array of Object[]) array of objects to select	
// @return (boolean) true == selection actually changed, false == no change
// @visibility external
//<

selectList : function (list, newState, selectionChanged, caller, skipDataCheck) {
    

    if (newState == null) newState = true;
    if (!list) return false;
    // Ensure the current cache is up to date
    if (this._dirty) this.cacheSelection();

    var cache = this._cache;
    var length = list.getLength();

    // The deselectAll() API uses the selectionChanged parameter to avoid a potentially costly
    // sort. Because deselectAll() gets the full list of selected records (in some order, but
    // the order doesn't matter for deselectAll()), we know that the selectionChanged list is
    // identical to the list of selected records, which are to be deselected.
    if (selectionChanged == null) {
        selectionChanged = [];
        var data = this.getItemList();

        // This is critical path code - for maximum efficiency, if we're working with a
        // ResultSet, look directly at its localData array rather than going through the
        // getCachedRow() API
        // undocumented accessResultSetCache attribute allows us to turn this optimization
        // off for cases where it won't work (EG custom class which implements the List interface)
        var isRSCache = false,
            pkFields = null,
            ds = null
        ;

        if (caller != null) {
            ds = caller.getDataSource();
            pkFields = ds && ds.getPrimaryKeyFields();
            // if there are no PK fields in the DS, getPrimaryKeyFields() will return {}
        if (pkFields && isc.isA.emptyObject(pkFields)) pkFields = null;
        }

        if (this.accessResultSetCache && isc.isA.ResultSet(data)) {
            isRSCache = true;
            data = data.localData || [];
        }

        for (var i = 0; i < length; i++) {
            var item = list.get(i),
                selected = this.isSelected(item, i),
                index = null
            ;

            if (selected == newState) continue;

            if (isc.MultiLinkSelection && isc.isA.MultiLinkSelection(this)) {
                //>DEBUG
                this._assert(item.openListIndex != null);
                //<DEBUG
                index = data[item.openListIndex];
            } else if (pkFields) {
                // if there's a DS and it has PK fields, scan the data by passing those to 
                // findIndex(), which checks attribute-values on the objects in the array 
                var pks = ds && ds.filterPrimaryKeyFields(item);
                if (pks) {
                    index = data.findIndex(pks);
                    if (index >= 0) item = data[index];
                }
            } else {
                // use a reference equality check
                index = data.fastIndexOf(item);
            }
            // Skip anything which isn't actually in our data
            if ((index == null || index == -1) && !skipDataCheck) {
                
                continue;
            }

            // put together a list of all records that are changing to a new selection state
            if (this._canSelectItem(item)) selectionChanged[selectionChanged.length] = item;
        }
    } else {
        

        if (cache === selectionChanged) selectionChanged = selectionChanged.duplicate();
    }

    var anyChanged = false,
        length = selectionChanged.length;
    
    var orig_suppressCaching = this._suppressCaching;
    this._suppressCaching = true;

    // Set a flag indicating we're selecting a range of rows
        
    var orig_selectingList = this._selectingList;
    this._selectingList = length > 1 ? true : false;

    if (length > 0) this._openCache = null;

    for (var i = 0; i < length; i++) {
        var item = selectionChanged[i];
        // incrementally update the cache before calling 'setSelected'
        
        if (newState != this.defaultIsSelected) {
            // selecting new records: add newly selected records at the end of the cache
            
            cache[cache.length] = item;
        } else {
            // deselecting records: remove the item from the cache
            cache.remove(item);
        }
        
        anyChanged = this.setSelected(item, newState) || anyChanged;
    }

    this._suppressCaching = orig_suppressCaching;

    // We've been updating the cache as we go. Calling "cacheSelection" here will
    // re-cache. 
    // If cascadeSelection is false, this is unnecessary - simply mark as 
    // not dirty (note that setSelected calls above will have marked as dirty)
    // Otherwise explicitly call cacheSelection to ensure items not explicitly 
    // passed in, but selected by cascading selection, get picked up too
    

    if (this.cascadeSelection) {
        if (this._dirty) this.cacheSelection();
    } else {
        this._dirty = false;
    }

    this._selectingList = orig_selectingList;

    return anyChanged;
},

//>	@method	selection.deselectList()
//			Deselect an array of items (subset of the entire list)
//		@group	selection
//
//		@param		list	(Array of Object[])	array of objects to select	
//		@return				(boolean)	true == selection actually changed, false == no change
// @visibility external
//<
deselectList : function (list, caller, skipDataCheck) {
    return this.selectList(list, false, null, caller, skipDataCheck);
},


//>	@method	selection.selectAll()
// Select all records of the list.
// @param [visibleNodesOnly] (boolean) If this selection's data object is a tree, 
//   if <code>true</code> is passed for this parameter,
//   only visible nodes will be selected. Nodes embedded in a closed parent folder
//   (and thus hidden from the user) will not be selected.
// @return (boolean) Returns <code>true</code> if the selection actually changed, 
//   <code>false</code> if not.
// @visibility external
// @group	selection
//<


selectAll : function (visibleNodesOnly, selectUnloadedItems) {
    // data.getLength() will only include the visible items (open) for Tree data
    if (visibleNodesOnly) return this.selectRange(0, this.data.getLength());

    if (this.defaultIsSelected) {
    
        // When getting the selection, it does not matter the order in which the items are deselected
        // so pass true for the dontSort optimization hint.
        var selectionChanged = this._getModifiedSelection(false, true);
        var returnVal = this.selectList(selectionChanged, true, selectionChanged);

        // if we're dropping unloaded values we need to clear any remaining selectionKeys
        
        if (selectUnloadedItems && this._shouldTrackUnloadedItems()) {
            if (this.anySelected(true)) {
                returnVal = true;
                this._selectionKeys = {};               
            }
        }

        // Optimization: Because we now know that everything has been deselected, mark the selection as not dirty
        // and set the selection _cache to an empty array.
        this._dirty = false;
        this._cache = [];
        this._openCache = null;
        return returnVal;
    } else {
        var returnVal = this.selectList(this.getItemList());
        if (selectUnloadedItems) {
            if (this._shouldTrackByKey()) {
                this.setDefaultIsSelected(true);
            } else {
                this.logInfo("selectAll() selectUnloadedItems parameter requires trackByKey:true - ignoring");
            }
        }
        return returnVal;
    }

},

//>	@method	selection.deselectAll()
//			Deselect ALL records of the list
//		@group	selection
//
//		@return				(boolean)	true == selection actually changed, false == no change
// @visibility external
//<

deselectAll : function (clearUnloadedItems) {

    
    

    if (this.defaultIsSelected) {
        returnVal = this.selectList(this.getItemList(), false);
        if (clearUnloadedItems && this._shouldTrackByKey()) {
            this.setDefaultIsSelected(false);
        }

    } else {
        // When getting the selection, it does not matter the order in which the items are deselected
        // so pass true for the dontSort optimization hint.
        var selectionChanged = this._getModifiedSelection(false, true);
        var returnVal = this.selectList(selectionChanged, false, selectionChanged);

        if (clearUnloadedItems && this._shouldTrackUnloadedItems()) {
            if (this.anySelected(true)) {
                returnVal = true;
                this._selectionKeys = {};               
            }
        }

        // Optimization: Because we now know that everything has been deselected, mark the selection as not dirty
        // and set the selection _cache to an empty array.
        this._dirty = false;
        this._cache = [];
        this._openCache = null;
    }

    return returnVal;
},

//> @method selection.clearSelection()
// Clears the current selection. If the +link{defaultIsSelected} flag is true, this method
// will call +link{deselectAll()} otherwise +link{selectAll()}.
//<
// @param [clearUnloadedItems] (boolean) If tracking selection state for unloaded items, should
//   this also be cleared? May cause the value of +link{defaultIsSelected} to change.
clearSelection : function (clearUnloadedItems) {
    if (this.defaultIsSelected) {
        this.selectAll(null, clearUnloadedItems);
    } else {
        this.deselectAll(clearUnloadedItems);
    }
},


//>	@method	selection.selectItem()
// Select a particular item by its position in the list
//
//		@param	position	(number)	index of the item to be selected
//		@return				(boolean)	true == selection actually changed, false == no change
// @group selection
// @visibility external
//<
selectItem : function (position) {
	return this.selectRange(position, position+1);
},


//>	@method	selection.deselectItem()
// Deselect a particular item by its position in the list
//
//		@param	position	(number)	index of the item to be selected
//		@return				(boolean)	true == selection actually changed, false == no change
// @group selection
// @visibility external
//<
deselectItem : function (position) {
	return this.deselectRange(position, position+1);
},





//>	@method	selection.selectRange()
//			Select range of records from <code>start</code> to <code>end</code>, non-inclusive.
//		@group	selection
//
//		@param	start	    (number)	start index to select
//		@param	end		    (number)	end index (non-inclusive)
//      @param  [newState]  (boolean)   optional new selection state to set.  True means
//                                      selected, false means unselected.  Defaults to true.
//
//		@return				(boolean)	true == selection actually changed, false == no change
// @visibility external
//<
selectRange : function (start, end, newState) {
    if (newState == null) newState = true;

    // Use visible records for range selection
    var data = this.data;

    

    if (isc.isA.ResultSet != null && isc.isA.ResultSet(data) && 
        !data.rangeIsLoaded(start, end)) 
    {
        this.warnSelectionRangeNotLoaded();
        return false; // no change
    }

    return this.selectList(this.getRange(start, end), newState);
},

warnSelectionRangeNotLoaded : function () {
    this.logWarn("selectRange called - selection range not loaded. Showing " +
                "selectionRangeNotLoadedMessage to the user.");
    isc.warn(this.selectionRangeNotLoadedMessage);
},

//> @attr selection.selectionRangeNotLoadedMessage (String : "Some records in the range you selected are not loaded.  Scroll through the entire range before selecting it." : IRWA)
// Message to display to the user in a <code>warn</code> dialog if +link{selection.selectRange()} is
// called for a selection on a ResultSet, where the range of records to be selected has not been
// loaded.
// @group i18nMessages
// @visibility external
//<
selectionRangeNotLoadedMessage:"Some records in the range you selected are not loaded.  " +
    "Scroll through the entire range before selecting it.",

//>	@method	selection.deselectRange()
//			Deselect range of records from <code>start</code> to <code>end</code>, non-inclusive
//
//		@group	selection
//
//		@param	start	(number)	start index to select
//		@param	end		(number)	end index (non-inclusive)
//
//		@return				(boolean)	true == selection actually changed, false == no change
// @visibility external
//<
deselectRange : function (start, end) {
    return this.selectRange(start, end, false);
},

// DOCFIX: this methods shouldn't require the "target", a Canvas.  Need to fix that before we make
// them public.

//>	@method	selection.selectOnMouseDown()	(A)
// Update the selection as the result of a mouseDown event.
// Handles shift, control, etc. key selection as well.
// Call this from a mouseDown handler.
//
// @group selection, mouseEvents
//
// @param target (Canvas) target object
// @param position (number) position where mouse went down on
//
// @return (boolean) true == selection was changed, false == no change
//<
selectOnMouseDown : function (target, recordNum) {
    // modify selection according to the specified style (defaulting to multiple selection)
    var selectionType = target.selectionType || isc.Selection.MULTIPLE;

	// if the target's selectionType is NONE, just bail
	if (selectionType == isc.Selection.NONE)	return false;
	
    // remember mouseDown location in case we start drag selecting
    var lastRecordNumClicked = this.lastRow;
    this.startRow = this.lastRow = recordNum;

	//>DEBUG
	this.logDebug("selectOnMouseDown: recordNum: " + recordNum);
	//<DEBUG

    // Pull record based on the visible records
    var record = this.data.get(recordNum),
        recordSelected = this.isSelected(record, recordNum, true) && 
                                (this.deselectOnPartialCheckboxClick || 
                                 !this.isPartiallySelected(record, recordNum)),
        selection // only compute this when used because it can be expensive
    ;

    // prevent mouse-based selection of the LOADING record.  This doesn't make sense and create
    // client-side JS errors very easily.
    if (Array.isLoading(record)) return false;

	// clear flags for deselecting records on mouseUp
	// these are set in the simple and normal cases below (3 and 5)
	// see selectOnMouseUp() for details
	this.deselectRecordOnMouseUp = false;
	this.deselectOthersOnMouseUp = false;

    
    var lastRecordClicked = this._lastRecordClicked;
    this._lastRecordClicked = record;

    // In Windows ctrl-click works allows multiple independent row selection/deselection
    // In Mac the equivalent functionality occurs with the Apple key (meta key), since
    //  on that platform ctrl+click == right click
    
    var metaKeyDown = isc.Browser.isMac ? isc.EventHandler.metaKeyDown() 
                                        : isc.EventHandler.ctrlKeyDown(),
        shiftKeyDown = isc.EH.shiftKeyDown();

    // clear the shift-selection base record if we won't be doing shift-selection
	if (selectionType == isc.Selection.SINGLE || !shiftKeyDown) {
        this._shiftSelectBaseRecord = null;
    }

	// Case 1: SINGLE selection
	if (selectionType == isc.Selection.SINGLE) {
        // On ctrl+click allow deselection
        
        if (metaKeyDown && recordSelected) this.deselect(record, recordNum);
        else if (!recordSelected) this.selectSingle(record, recordNum);
        else return false;

		return true;

    // Case 2: Shift-selection (select contiguous range of records)
    
	} else if (shiftKeyDown) {
		// if nothing selected, simply select current record
		if (!this.anySelected() && this.shiftSelectFallbackMode != "top") {
            this._shiftSelectBaseRecord = record;            
			this.select(record, recordNum);

		// otherwise since something was selected
		} else {
            

            // if not already set, calculate base record around which shift-selection will occur
            if (!this._shiftSelectBaseRecord) {
                this._shiftSelectBaseRecordNum = lastRecordNumClicked;
                this._shiftSelectBaseRecord = lastRecordClicked = 
                    this._calculateShiftSelectBaseRecord(recordNum, lastRecordClicked);
            }

			var data = this.data;

            // our approach requires knowing the base index and the last index, so compute them
			var lastIndex = this.getLastIndex(lastRecordClicked, lastRecordNumClicked),
                baseIndex = this.getBaseIndex()
            ;

            // is current record above or below base, and what is step from last?
            var above = baseIndex >  recordNum,
                below = baseIndex <= recordNum,
                step  = recordNum - lastIndex
            ;

            // we clicked above the base record
            if (baseIndex > recordNum) {
                // select for upward movement, deselect for downward movement
                if (step < 0) { 
                    // if we've crossed over base record, clear selection on other side
                    if (lastIndex > baseIndex) {
                        this.deselectRange(baseIndex + 1, lastIndex + 1);
                        lastIndex = baseIndex;
                    }
                    this.selectRange(recordNum, lastIndex);
                }
                else if (step > 0) this.deselectRange(lastIndex, recordNum);

            // we clicked below the base record
            } else if (baseIndex <= recordNum) {
                // select for downward movement, deselect for upward movement
                if (step > 0) {
                    // if we've crossed over base record, clear selection on other side
                    if (lastIndex < baseIndex) {
                        this.deselectRange(lastIndex, baseIndex);
                        lastIndex = baseIndex;
                    }
                    this.selectRange(lastIndex, recordNum + 1);
                }
                else if (step < 0) this.deselectRange(recordNum + 1, lastIndex + 1);
            }
		}
		return true;

	// Case 3: SIMPLE selection (toggle selection of this record, but defer deselection until
    // mouseUp)
	} else if (selectionType == isc.Selection.SIMPLE) {

		if (!recordSelected) {
			this.select(record, recordNum);
			return true;
		} else {
			this.deselectRecordOnMouseUp = true;
			return false;
		}


	// Case 4: meta-key selection in a multiple selection range 
    // (simply toggle selection of this record) 
	} else if (metaKeyDown) {

        if (recordSelected) {
            this.deselect(record, recordNum);
        } else {
            this.select(record, recordNum);
        }
		return true;

	// Case 5: normal selection (no modifier keys) in a multiple selection range
	} else {

        if (!recordSelected) {
            // if you click outside of the selection, select the new record and deselect
            // everything else
			this.selectSingle(record, recordNum);
			return true;
        } else if (isc.EventHandler.rightButtonDown()) {
            // never deselect if you right click on the selection, unless you start drag
            // selecting
            this.deselectOnDragMove = true;
            return false;
        } else {
            // simpleDeselect mode: this mode is designed to make it easy to entirely get rid
            // of your selection, so you don't have to know about ctrl-clicking.  In a
            // nutshell, if you click on the existing selection, it will be entirely
            // deselected. 

            if (this.dragSelection) {
                if (this.simpleDeselect) {
                    // if you click on the selection, deselect the entire selection including
                    // the clicked-on cell.  Later, if a drag begins, select the clicked-on
                    // cell.
                    this.deselectAll();
                    this.selectOriginOnDragMove = true;
                    return true;
                }
                // for a drag selection, deselect others immediately; otherwise we'll be
                // dragging out a new selection within/overlapping with an existing selection,
                // which we only want to do on a ctrl-click.  This matches Excel.
                this.selectSingle(record, recordNum);
                return true;
            } else {
                if (this.simpleDeselect) {
                    // deselect everything on mouseUp, including the cell clicked on
                    this.deselectAllOnMouseUp = true;
                } else {
                    // if we click in a multiple selection, deselect everything but the
                    // clicked-on item, but don't do it until mouseUp in order to allow
                    // dragging the current selection.  This matches Windows Explorer.
                    this.deselectOthersOnMouseUp = this.anySelected();
                }
                return false;
            }
        }
	}

},

// helper to calculate the shift-selection base record if it hasn't yet been set

_calculateShiftSelectBaseRecord : function (recordNum, lastRecordClicked) {

    // if the last click was on a record that's still selected, we're done
    if (lastRecordClicked && this.isSelected(lastRecordClicked, recordNum)) {
        return lastRecordClicked;

    // otherwise, we'll have to calculate a good base record    
    } else {
        var foundSelected,
            data = this.data;

        // check above the click position for a selected record
        for (var i = recordNum - 1; i >= 0; i--) {
            var currentRecord = data.getCachedRow(i);
            if (!currentRecord || Array.isLoading(currentRecord)) { 
                // not loaded - bail out
                i++; break; 
            }
            if (this.isSelected(currentRecord, i)) {
                foundSelected = true;
                break;
            }
        }

        // if nothing was found, then check below the click position as well
        if (!foundSelected && this.shiftSelectFallbackMode != "top") {
            for (var j = recordNum + 1; j < data.getLength(); j++) {
                var currentRecord = data.getCachedRow(j);
                if (!currentRecord || Array.isLoading(currentRecord)) {
                    // not loaded - bail out
                    j--; break;
                }
                if (this.isSelected(currentRecord, j)) {
                    i = j;
                    break;
                }
            }
        }

        return data.getCachedRow(Math.max(0, i)) || lastRecordClicked;
    }
},

//>	@method	selection.selectOnDragMove()	(A)
//			During drag selection, update the selection as a result of a dragMove event
//
//		@group	selection, mouseEvents
//
//		@param	target	(Canvas)	target object
//		@param	position (number)	position where mouse went down on
//
//		@return			(boolean)	true == selection was changed, false == no change
//
//<
selectOnDragMove : function (target, currRow) {
    var startRow = this.startRow,
        lastRow = this.lastRow;

    // If the mouse has moved further away from the start position since the last dragMove, select
    // more cells.  If it's moved closer to the start position, deselect cells.
    if (currRow < 0) {
        //>DEBUG
        this.logWarn("selectOnDragMove: got negative coordinate: " + currRow);
        //<DEBUG
        return;
    }

    if (currRow == lastRow) return; // no change

    

    if (this.selectOriginOnDragMove) {
        this.select(this.data.getItem(startRow));
        this.selectOriginOnDragMove = false;
    } else if (this.deselectOnDragMove || this.deselectAllOnMouseUp || this.deselectOthersOnMouseUp) {
        // deselect on dragMove is for right-dragging.  The others flags are failsafes in case you
        // use drag selection without setting the flag.
        this.selectSingle(this.data.getItem(startRow));
        this.deselectAllOnMouseUp = this.deselectOthersOnMouseUp = this.deselectOnDragMove = false;
    }

    if ((currRow > startRow && startRow > lastRow) || 
        (lastRow > startRow && startRow > currRow)) 
    {
        //this.logWarn("dragged from one side of start to the other");
        // dragged from one side of start to the other
        this.deselectAll();
        // select from start to current inclusive
        if (startRow > currRow) {
            this.selectRange(currRow, startRow+1);
        } else {
            this.selectRange(startRow, currRow+1);
        }
    } else if (startRow >= lastRow && lastRow > currRow) {
        //this.logWarn("increasing selection on the left of start");
        // increasing selection on the left of start
        this.selectRange(currRow, lastRow);
    } else if (startRow >= currRow && currRow > lastRow) {
        //this.logWarn("decreasing selection on the left of start");
        // decreasing selection on the left of start
        this.deselectRange(lastRow, currRow);
    } else if (startRow <= currRow && currRow < lastRow) {
        //this.logWarn("decreasing selection on the right of start");
        // decreasing selection on the right of start
        this.deselectRange(currRow+1, lastRow+1);
    } else if (startRow <= lastRow && lastRow < currRow) {
        //this.logWarn("increasing selection on the right of start");
        // increasing selection on the right of start
        this.selectRange(lastRow, currRow+1);
    //>DEBUG
    } else {
        this.logWarn("dragMove case not handled: lastRow: " + lastRow + 
                     ", currRow: " + currRow + ", startRow " + startRow);
    //<DEBUG
    }
    
    this.lastRow = currRow;
},

//>	@method	selection.selectOnMouseUp()	(A)s
// Update the selection as the result of a mouseUp event.
// We currently use this to defer deselection for drag-and-drop of multiple records.
// Call this from a mouseUp handler.
//
// @param target (Canvas) target object
// @param recordNum (number) record number mouse went down on
//
// @return (boolean) true == selection was changed, false == no change
// @see ListGrid.mouseUp()
// @group selection, mouseEvents
//<
selectOnMouseUp : function (target, recordNum) {
	// if the target's selectionType is NONE, just bail
	if (target.selectionType == isc.Selection.NONE)	return false;

	//>DEBUG
	this.logDebug("selectOnMouseUp: recordNum: " + recordNum);
	//<DEBUG

	// JMD 020828:
	//		If multiselection is on and no modifier keys are down, we need to
	// deselect any rows other than the one that is clicked. BUT, we can't do this in
	// selectOnMouseDown() because the user might be clicking on a row in a multiple selection
	// to initiate a drag operation with all of the selected rows. So in selectOnMouseDown()
	// we set a deselectOthersOnMouseUp flag that we can check here and do the deselection
	// if necessary.
	//		Similarly, if SIMPLE selection is enabled we don't want to deselect the current
	// record if the user is initiating a drag. We set a deselectRecordOnMouseUp flag for in this case.
	//
    // We never deselect anything on rightMouseUp since you would right click to show a context menu
    // to operate on the current selection.
    var returnVal = false;
	if (this.deselectOthersOnMouseUp) {
	    returnVal = this.selectSingle(this.data.getItem(recordNum), recordNum);
        this.deselectOthersOnMouseUp = false;
	} else if (this.deselectRecordOnMouseUp) {
		returnVal = this.deselect(this.data.getItem(recordNum), recordNum);
        this.deselectRecordOnMouseUp = false;
    } else if (this.deselectAllOnMouseUp) {
        returnVal = this.deselectAll();
        this.deselectAllOnMouseUp = false;
	}
	return returnVal;
},

// @param [onlyOpen] (Boolean) are only opened nodes required?
// @param [dontSort] (Boolean) optimization hint for whether the normalizer needs to
// be applied.
getItemList : function (onlyOpen, dontSort) {
    var data = this.data;
    if (isc.isA.Tree(data)) return data.getNodeList(onlyOpen, dontSort);
    return (data != null ? data : []);
},


_getItemListAsync : function (thisArg, timerEventProp, batchSize, callback) {
    if (this.data && isc.isA.Tree(this.data) && isc.isA.Function(this.data._getNodeListAsync)) {
        this.data._getNodeListAsync(thisArg, timerEventProp, batchSize, callback);
    } else {
        callback.call(thisArg, this.getItemList());
    }
}
});	// END isc.Selection.addMethods()



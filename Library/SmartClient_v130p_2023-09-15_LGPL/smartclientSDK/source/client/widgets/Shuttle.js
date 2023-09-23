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
//> @class Shuttle
// Shuttle-style selection component allowing uses to select records by moving them from
// a set of source records to a set of target records
// @treeLocation Client Reference/Grids
// @inheritsFrom HLayout
// @visibility shuttle
//<
// This is an implementation of a Shuttle interface: https://download.oracle.com/tech/blaf/specs/shuttle.html
// Used for the "Shuttle" view of the MultiPickerItem

isc.defineClass("Shuttle", "HLayout");
isc.Shuttle.addProperties({

    //> @attr shuttle.dataSource (DataSource : null : IR)
    // DataSource for this shuttle's data set. Shuttles require a dataSource.
    // @visibility shuttle
    //<
    

    //> @attr shuttle.valueField (String : null : IR)
    // This field is expected to be unique for records within the shuttle's data set.
    // If not explicitly specified the +link{dataSource,dataSource.primaryKey} will
    // be used.
    // <P>
    // May be used to +link{setSelectedByValue,select records by value} and to
    // retrieve the current +link{getSelectedValues(),selected values}.
    //
    // @visibility shuttle
    //<
    

    //> @method shuttle.getValueFieldName()
    // Returns the +link{valueField} for this shuttle
    // @return (String) value field name
    // @visibility shuttle
    //< 
    getValueFieldName : function () {
        if (this.valueField == null && this.dataSource) {
            return this.getDataSource().getPrimaryKeyFieldName();
        }
        return this.valueField
    },

    //> @attr shuttle.fetchOperation (String : null : IR)
    // +link{DSRequest.operationId,OperationId} for fetching records from the
    // shuttle's +link{dataSource}.
    // @visibility shuttle
    //<

    //> @attr shuttle.sortField (String | Array of String | Integer : null : IR)
    // +link{ListGrid.sortField,Sort field} for this item's list of options. Will be applied
    // to +link{sourceGrid} and +link{targetGrid}. To specify initial sort for each grid separately,
    // these properties may be set per grid using the standard +link{autoChild,autoChild pattern}.
    //
    // @visibility shuttle
    //<

    //> @attr shuttle.sortDirection (SortDirection : null : IR)
    // +link{ListGrid.sortDirection,Sort direction} for this item's list of options. Will be applied
    // to +link{sourceGrid} and +link{targetGrid}. To specify initial sort for each grid separately,
    // these properties may be set per grid using the standard +link{autoChild,autoChild pattern}.
    //
    // @visibility shuttle
    //<

    //> @attr shuttle.initialSort (Array of SortSpecifier : null : IR)
    // +link{ListGrid.initialSort,Initial sort specifiers} for this item's list of options. Will be applied
    // to +link{sourceGrid} and +link{targetGrid}. To specify initial sort for each grid separately,
    // these properties may be set per grid using the standard +link{autoChild,autoChild pattern}.
    //
    // @visibility shuttle
    //<


    //> @attr shuttle.textMatchStyle (TextMatchStyle : "substring" : IR)
    // TextMatchStyle for retrieving records from this shuttle's dataSource.
    // @visibility shuttle
    //<

    //> @attr shuttle.filterContext  (DSRequest Properties : null : IR)
    // DSRequest configuration for retrieving records from this shuttle's dataSource.
    // @visibility shuttle
    //<

    //> @attr shuttle.implicitCriteria (Criteria : null : IRW)
    // Implicit criteria for retrieving records from this shuttle's dataSource.
    // <P>
    // These criteria may be combined with <code>"inSet"</code> or <code>"notInSet"</code>
    // sub criteria for the +link{valueField} in order to populate the set of unselected
    // records in the +link{sourceGrid}. They are +link{listGrid.implicitCriteria}
    // meaning that any user-entered +link{listGrid.showFilterEditor,filter criteria} will
    // be overlayed on top of these criteria.
    //
    // @visibility shuttle
    //<

    //> @method shuttle.setImplicitCriteria ()
    // Update the +link{implicitCriteria} for the shuttle.
    // @param (Criteria) new implicitCriteria
    // @visibility shuttle
    //<
    setImplicitCriteria : function (criteria) {
        this.implicitCriteria = criteria;
        this.updateGrids();
    },

    // Getter for the implicit criteria
    getImplicitCriteria : function () {
        return this.implicitCriteria;
    },
    

    //> @attr shuttle.sourceGrid (ListGrid AutoChild : null : IR)
    // List grid containing the (unselected) set of records. The user
    // may select items by dragging them from this grid to the +link{targetGrid}.
    //
    // @visibility shuttle
    //<
    sourceGridConstructor:"ListGrid",
    sourceGridDefaults:{

        isGroup:true,
        showFilterEditor:true,

        dragDataAction:"none",
        canDragRecordsOut:true,
        canAcceptDroppedRecords:true,
        canReorderRecords:false,
        recordDrop : function (dropRecords, targetRecord, index, sourceWidget) {
            if (sourceWidget == this.creator.targetGrid) {
                this.creator.deselectRecords(dropRecords, true);
            } else {
                return this.Super("recordDrop", arguments);
            }
        }
        
    },

    //> @attr shuttle.targetGrid (ListGrid AutoChild : null : IR)
    // List grid containing the selected set of records. The user
    // may unselect items by dragging them from this grid to the +link{sourceGrid}.
    //
    // @visibility shuttle
    //<
    
    targetGridConstructor:"ListGrid",
    targetGridDefaults:{

        isGroup:true,

        // We're not getting our data from the DS so don't show the filterEditor by default
        
        canShowFilterEditor:false,

        dragDataAction:"none",
        canDragRecordsOut:true,
        canAcceptDroppedRecords:true,
        canReorderRecords:false,
        recordDrop : function (dropRecords, targetRecord, index, sourceWidget) {
            if (sourceWidget == this.creator.sourceGrid) {
                this.creator.selectRecords(dropRecords, true);
            } else {
                return this.Super("recordDrop", arguments);
            }
        }
    },

    //> @attr shuttle.sourceGridTitle (String : "Unselected Values" : IR)
    // Title for the source grid, shown as a +link{Canvas.groupTitle}
    // @group i18nMessages
    // @visibility shuttle
    //<
    sourceGridTitle:"Unselected Values",

    //> @attr shuttle.targetGridTitle (String : "Selected Values" : IR)
    // Title for the target grid, shown as a +link{Canvas.groupTitle}
    // @group i18nMessages
    // @visibility shuttle
    //<
    targetGridTitle:"Selected Values",
    

    //> @method shuttle.selectRecords()
    // Programmatically select a set of records from this shuttle's dataSource.
    // The specified records will be added to any existing selection.
    //
    // @param records (Array of ListGridRecord) Records to select
    // @param [fireSelectionChanged] (boolean) Fire the +link{selectionUpdated()} notification?
    // @visibility shuttle
    //<
    
    selectRecords : function (records, fireSelectionChanged) {
        if (records == null) return;

        if (this.selectedRecords == null) {
            this.selectedRecords = [];
        }
        
        var valueField = this.getValueFieldName();
        for (var i = 0; i < records.length; i++) {
            var record = records[i],
                value = record[valueField];

            // If we have any outstanding fetch marked for a target
            // record's value, we can clean this up now
            
            this._clearFetchingValue(value);

            // Avoid duplicates - if we already have a record
            // in the target-data array with the same value, replace it
            var index = this.selectedRecords.findIndex(valueField, value);
            if (index == -1) index = this.selectedRecords.length;
            this.selectedRecords.set(index, record); // array.set will cause dataChanged to fire so the grid will refresh!

        }
        this.updateGrids();
        if (fireSelectionChanged) this.selectionUpdated();
    },

    //> @method shuttle.deselectRecords()
    // Programmatically deselect a set of records that are currently selected 
    // and displayed in the target grid.
    //
    // @param records (Array of ListGridRecord) Records to deselect
    // @param [fireSelectionChanged] (boolean) Fire the +link{selectionUpdated()} notification?
    // @visibility shuttle
    //<        
    deselectRecords : function (records, fireSelectionChanged) {
        if (records == null) return;

        if (this.selectedRecords == null) {
            this.selectedRecords = [];
        }
        this.selectedRecords.removeList(records);

        // If we have any outstanding fetch marked for a target
        // record's value, we can clean this up now - the 
        // value is no longer logically selected.
        var valueField = this.getValueFieldName();
        for (var i = 0; i < records.length; i++) {
            var value = records[valueField];
            this._clearFetchingValue(value);
        }

        this.updateGrids();
        if (fireSelectionChanged) this.selectionUpdated();
    },

    //> @method shuttle.clearSelection()
    // Deselect all currently selected records
    // @param [fireSelectionChanged] (boolean) Fire the +link{selectionUpdated()} notification?
    // @visibility shuttle
    //<
    clearSelection : function (fireSelectionChanged) {
        var targetGrid = this.targetGrid;
        var records = targetGrid.data.getRange(0, targetGrid.getTotalRows());
        this.deselectRecords(records, fireSelectionChanged);
        // Invalidate any outstanding values-fetches
        delete this._pendingFetchValues;
    },

    //> @method shuttle.selectionUpdated()
    // Notification method fired when records are selected or unselected
    // in this shuttle.
    // <P>
    // Use +link{getSelectedRecords()} or +link{getSelectedValues()} 
    // to retrieve the current selection.
    //
    // @visibility shuttle
    //<
    selectionUpdated : function () {

    },

    //> @method shuttle.setSelectedByValue()
    // Method to select or deselect record(s) where the +link{shuttle.valueField} matches
    // the values passed in.
    // <P>
    // If the source listGrid does not have a 
    // +link{resultSet.allMatchingRowsCached(),complete data set}
    // and does not contain an entry for any of the requested values, a separate
    // fetch request will be issued against our +link{dataSource} to pick up the 
    // records for the specified value(s). The +link{valuesFetchInProgress()} and 
    // +link{valuesFetchComplete()} methods provide information about this fetch.
    //
    // @param value (Array of String | Array of Number) Array of values to select
    // @param selected (Boolean) New selected state for the records
    //
    // @visibility shuttle
    //<
    
    setSelectedByValue : function (value, add) {
        if (value == null || value.length == 0) {
            return;
        }
        // We may issue 2 fetches here - one 'notInSet' to exclude things from the source grid
        // and one inSet to pick up unrecognized values for the target grid
        var wasQueuing = isc.RPCManager.startQueue()

        // Note: The records may not be present in the source or target grid data
        // due to filter criteria, a pending fetch or data paging
        var originalValue = value;
        value = value.duplicate();
        var valueField = this.getValueFieldName();
        // Adding to selection
        // - find the record(s) in our source grid and select them
        // - if we can't find them, we have to perform a fetch in order to show them
        //   in the target grid
        if (add) {

            if (this.targetGrid.data) {
                // remove any duplicates!
                for (var i = 0; i < value.length; i++) {
                    if (this.targetGrid.data.find(valueField, value[i])) {
                        value[i] = null;
                    }
                }
                value.removeEmpty();
            }
            // Already selected? We're done!
            if (value.length == 0) {
                if (!wasQueuing) isc.RPCManager.sendQueue();
                return;
            }
            
            var mustFetch = !this.sourceGrid.data || !this.sourceGrid.data.lengthIsKnown || 
                            !this.sourceGrid.data.lengthIsKnown(),
                records = [];

            if (!mustFetch) {
                var dataSet = this.sourceGrid.data;
                // If we have an 'allRows' cache, reach directly into it to avoid
                // extra fetches for a value that is currently filtered out of view!
                var cache = dataSet.allRows;// || dataSet.localData;
                if (cache != null) dataSet = cache;

                for (var i = 0; i < value.length; i++) {
                    var sourceRecord = dataSet.find(valueField, value[i]);
                    if (sourceRecord != null) {
                        records.add(isc.addProperties({},sourceRecord));
                        value[i] = null;
                    }
                }
                if (records.length != value.length) {
                    mustFetch = true;
                }
            }
            if (records.length > 0) {
                this.selectRecords(records);
            }
            // If there were some values for which we couldn't
            // find records, we need to fetch them to display
            // them in the "target grid"
            
            if (mustFetch) {

                for (var i = 0; i < value.length; i++) {
                    if (this.valuesFetchInProgress(value)) value[i] = null;
                }

                value.removeEmpty();
                if (value.length > 0) {

                    this._addToFetchingValues(value);

                    var dsRequest = {clientContext:{requestedValues:value}};
                    if (this.filterContext) isc.addProperties(dsRequest, this.filterContext);
                    if (this.fetchOperation != null) dsRequest.operationId = this.fetchOperation;
                    if (this.textMatchStyle != null) dsRequest.textMatchStyle = this.textMatchStyle;

                    var missingRecordCriteria = this.getDataSource().combineCriteria(
                                                    this.getImplicitCriteria(), 
                                                    {operator:"inSet", fieldName:valueField, value:value},
                                                    "and",
                                                    this.textMatchStyle
                                                );
                    this.getDataSource().fetchData(
                        missingRecordCriteria, 
                        {
                            target:this, methodName:"fetchMissingValuesForSelectionReply"
                        },
                        dsRequest
                    );
                }
            }

        // We're deselecting value(s). Remove from the
        // target grid and update criteria on the source grid.
        } else {
            var criteriaRecords = [];
            var data = this.targetGrid.data || [];

            for (var i = 0; i < value.length; i++) {
                // If we have an outstanding fetch for this value's record
                // ignore it
                this._clearFetchingValue(value);

                var record = data.find(valueField, value[i]);
                if (record != null) {
                    criteriaRecords.add(record);
                } else {
                    // We don't need a true record to update the source grid's criteria!
                    record = {};
                    record[valueField] = value[i];
                    criteriaRecords.add(record);
                }
            }

            
            this.deselectRecords(criteriaRecords);
        }   
        if (!wasQueuing) isc.RPCManager.sendQueue();
    },
    addMissingPlaceholders:true,
    missingPlaceholderAttribute:"_isMissingPlaceholder",

    // notification when we've fetched records thanks to 'setSelectedByValue()' with an
    // unknown value.
    fetchMissingValuesForSelectionReply : function (dsResponse, data, dsRequest) {
        var requestedValues = dsRequest.clientContext.requestedValues,
            hasActiveValue = false;
        var valueField = this.getValueFieldName();
        for (var i = 0; i < requestedValues.length; i++) {

            var record = data.find(valueField, requestedValues[i]);

            // If the value is still marked as 'in progress' [hasn't been deselected]
            // we will add the record to our target grid.
            if (this.valuesFetchInProgress(requestedValues[i])) {
                hasActiveValue = true;
                // If we didn't find a record for the value in the dataSource
                // we add a dummy record to the grid so the user has a visual
                // indication of selection, and getSelectedRecords() / getSelectedValues()
                // is impacted by the attempt to set the value.
                
                if (this.addMissingPlaceholders && record == null) {
                    record = {};
                    record[this.missingPlaceholderAttribute] = true;
                    record.valueField = requestedValues[i];
                    data.add(record);
                }

            // If the dev has cleared selection for the specified value we don't
            // want to add it to our target grid!
            } else {
                data.removeWhere(this.getValueFieldName(), requestedValues[i]);
            }
        }
        if (data.length > 0) {
            
            this.selectRecords(data);
        }

        // If
        // - we no longer have any outstanding fetches for value-records
        // - the dev has not called clearSelection / setSelectedByValue(val,false) for
        //   all the requested values
        // Fire the valuesFetchComplete callback
        // Note that we're doing this even if the fetch failed to find an associated
        // record.
        if (hasActiveValue && !this.valuesFetchInProgress()) {
            this.valuesFetchComplete();
        }
    },

    // Update the _pendingFetchValues array
    _addToFetchingValues : function (values) {
        if (this._pendingFetchValues == null) {
            this._pendingFetchValues = [];
        }
        this._pendingFetchValues.addList(values);
    },
    _clearFetchingValue : function (value) {
        if (!this._pendingFetchValues) return;
        this._pendingFetchValues.remove(value);
    },

    //> @method shuttle.valuesFetchInProgress()
    // Returns true if this shuttle is currently fetching record(s) associated
    // with values passed to +link{setSelectedByValue()}
    // <P>
    // If no explicit <code>value</code> parameter was passed, this method will
    // return true if this shuttle has any outstanding values fetches.
    // @param [value] (Any) if passed, this method will return true only if
    //   there is an outstanding fetch to retrieve the associated record for
    //   this specified value
    // @return (boolean) true if there is an outstanding values fetch
    // @visibility shuttle
    //<
    valuesFetchInProgress : function (value) {
        if (value == null) {
            return this._pendingFetchValues && this._pendingFetchValues.length > 0;
        } else {
            return this._pendingFetchValues && this._pendingFetchValues.indexOf(value) != -1;
        }
    },

    //> @method shuttle.valuesFetchComplete()
    // Notification method fired when a fetch to retrieve records for
    // an array of values passed to +link{setSelectedByValue()} is complete.
    // <P>
    // Note that if no associated record for the specified value was found
    // in the dataSource, this method will still fire.
    // 
    // @return (boolean) true if there is an outstanding values fetch
    // @visibility shuttle
    //<    
        
    valuesFetchComplete : function () {
    },


    //> @method shuttle.getSelectedRecords()
    // Returns the current set of selected records.
    // <P>
    // Note that if a user called +link{setSelectedByValue()} for a record
    // that was not loaded in the source list, we may not yet have a
    // selected record for that value. See +link{valuesFetchInProgress()}.
    // <P>
    // In this case no record will be returned by this method for that
    // record by default. The <code>includeLoadingPlaceholders</code> parameter
    // will cause this method to also return placholder record objects for
    // these unloaded records, which have two properties specified -
    // the +link{valueField} value 
    // +link{loadingPlaceholderAttribute,_isLoadingPlaceholder:true}.
    //
    // @param [includeLoadingPlaceholders] (boolean) should we include
    //   loading placeholder records for selected values whose records have not yet
    //   been loaded?
    // @return (Array of ListGridRecord) currently selected records
    // @visibility shuttle
    //<
    getSelectedRecords : function (includeLoadingPlaceholders) {
        var records = [];
        records.addList(this.selectedRecords);
        if (includeLoadingPlaceholders && this._pendingFetchValues) {
            var valueField = this.getValueFieldName();
            for (var i = 0; i < this._pendingFetchValues.length; i++) {
                var pendingRecord = {};
                pendingRecord[this.loadingPlaceholderAttribute] = true;
                pendingRecord[valueField] = this._pendingFetchValues[i];
                records.add(pendingRecord);
            }
        }
        return records;
    },

    //> @attr shuttle.loadingPlaceholderAttribute (String : "_isLoadingPlaceholder" : IRA)
    // This attribute will be set to true for any loading placeholder
    // records returned by +link{getSelectedRecords()}
    // @visibility shuttle
    //<
    loadingPlaceholderAttribute:"_isLoadingPlaceholder",

    //> @method shuttle.getSelectedValues()
    // Returns the +link{getValueFieldName(),valueField} value from the 
    // current set of selected records.
    // <P>
    // Note that if a user called +link{setSelectedByValue()} for a record
    // that was not loaded in the source list, we may not yet have a
    // selected record for that value. See +link{valuesFetchInProgress()}.
    // <P>
    // The <code>includeUnloadedValues</code> parameter
    // can be used to return values for these unloaded records.
    //
    // @param [includeUnloadedValues] (boolean) should we include
    //   values where the associated record has not yet been loaded?
    // @return (Array of String | Array of Number) currently selected records' valueField values.
    // @visibility shuttle
    //<
    getSelectedValues : function (includeUnloadedValues) {
        var selectedRecords = this.getSelectedRecords(includeUnloadedValues);
        return selectedRecords && selectedRecords.getProperty(this.getValueFieldName());
    },

    
    updateGrids : function () {
        
        
        
        var selection = this.selectedRecords || [];
        
        this.targetGrid.setData(selection);

        
        var implicitCriteria = this.getSourceGridImplicitCriteria();

        var mustFetch = !this.sourceGrid.dataObjectSupportsFilter(this.sourceGrid.data);
        this.sourceGrid.setImplicitCriteria(implicitCriteria);
        if (mustFetch) {
            var dsRequest = isc.addProperties({}, this.filterContext);
            this.sourceGrid.fetchData(
                this.sourceGrid.getCriteria(), 
                {target:this, methodName:"sourceGridFetchComplete"},
                dsRequest
            );
        }
    },

    // (Unused) notification fired after initial fetch
    sourceGridFetchComplete : function (dsResponse, data, dsRequest) {
    },

    // Combine this.implicitCriteria with the 'notInSet' criteria required to
    // hide selected values in the source grid.
    getSourceGridImplicitCriteria : function () {
        var implicitCriteria = this.getImplicitCriteria();

        var selection = this.selectedRecords || [];

        var dataSource = this.getDataSource();
        var valueField = this.getValueFieldName();
        if (valueField == null) {
            
            this.logWarn("Shuttle requires a valueField");
            return;
        }

        if (selection.length > 0) {
            var excludes = selection.getProperty(this.getValueFieldName());
            var excludeCriteria = {operator:"notInSet", fieldName:valueField, value:excludes};
            implicitCriteria = dataSource.combineCriteria(implicitCriteria, excludeCriteria, "and", "substring");
        }
        return implicitCriteria;
    },

    // Autochildren

    //> @attr Shuttle.controlBar (VLayout AutoChild : null :IR)
    // VLayout autoChild holding the +link{selectAllButton}, +link{selectButton},
    // +link{deselectButton} and +link{deselectAllButton}
    // @visibility shuttle
    //<
    controlBarConstructor:"VLayout",
    controlBarDefaults:{
        align:"center",
        defaultLayoutAlign:"center",
        width:50,
        membersMargin:10
    },

    //> @attr Shuttle.selectAllButton (ImgButton AutoChild : null :IR)
    // ImgButton for selecting the full set of data in the shuttle.
    // @visibility shuttle
    //<

    //> @attr Shuttle.selectAllButtonIcon (SCImgURL : "[SKINIMG]TransferIcons/right_all.png" : IR)
    // Icon for the +link{selectAllButton}
    // @visibility shuttle
    //<
    selectAllButtonIcon:"[SKINIMG]TransferIcons/right_all.png",

    //> @attr Shuttle.selectAllButtonWidth (Integer : 24 : IR)
    // Width for the +link{selectAllButton}
    // @visibility shuttle
    //<
    selectAllButtonWidth:24,
    
    //> @attr Shuttle.selectAllButtonHeight (Integer : 22 : IR)
    // Height for the +link{selectAllButton}
    // @visibility shuttle
    //<
    selectAllButtonHeight:22,

    //> @attr Shuttle.incompleteDataWarning (String : "Unable to select all - the data set does not have all matching records loaded from the dataSource." : IR)
    // Warning to display when the user attempts to +link{selectAllButton,select all}
    // records from a +link{resultSet.allMatchingRowsCached(),partially loaded} data set.
    //
    // @group i18nMessages
    // @visibility shuttle
    //<
    incompleteDataWarning:"Unable to select all - the data set does not have all matching records loaded from the dataSource.",
    
    selectAllButtonConstructor:"ImgButton",
    selectAllButtonDefaults:{
        showDown:false,
        click : function () {
            var sourceGrid = this.creator.sourceGrid;
            if (!sourceGrid.data.allMatchingRowsCached()) {
                isc.warn(this.creator.incompleteDataWarning);
                return;
            }
            var records = sourceGrid.data.getRange(0, sourceGrid.getTotalRows());
            this.creator.selectRecords(records, true);
        }
    },

    //> @attr shuttle.selectButton (ImgButton AutoChild : null : IR)
    // ImgButton for selecting a single record
    // @visibility shuttle
    //<
    selectButtonConstructor:"ImgButton",

    //> @attr Shuttle.selectButtonIcon (SCImgURL : "[SKINIMG]TransferIcons/right.png" : IR)
    // Icon for the +link{selectButton}
    // @visibility shuttle
    //<
    selectButtonIcon:"[SKINIMG]TransferIcons/right.png",

    //> @attr Shuttle.selectButtonWidth (Integer : 24 : IR)
    // Width for the +link{selectButton}
    // @visibility shuttle
    //<
    selectButtonWidth:24,
    
    //> @attr Shuttle.selectButtonHeight (Integer : 22 : IR)
    // Height for the +link{selectButton}
    // @visibility shuttle
    //<
    selectButtonHeight:22,    

    selectButtonDefaults:{
        showDown:false,
        click : function () {
            var records = this.creator.sourceGrid.getSelectedRecords();
            this.creator.selectRecords(records, true);
        }
    },

    //> @attr shuttle.deselectButton (ImgButton AutoChild : null : IR)
    // ImgButton for deselecting a single record
    // @visibility shuttle
    //<
    deselectButtonConstructor:"ImgButton",

    //> @attr Shuttle.deselectButtonIcon (SCImgURL : "[SKINIMG]TransferIcons/left.png" : IR)
    // Icon for the +link{deselectButton}
    // @visibility shuttle
    //<
    deselectButtonIcon:"[SKINIMG]TransferIcons/left.png",

    //> @attr Shuttle.deselectButtonWidth (Integer : 24 : IR)
    // Width for the +link{deselectButton}
    // @visibility shuttle
    //<
    deselectButtonWidth:24,
    
    //> @attr Shuttle.deselectButtonHeight (Integer : 22 : IR)
    // Height for the +link{deselectButton}
    // @visibility shuttle
    //<
    deselectButtonHeight:22,

    deselectButtonDefaults:{
        showDown:false,
        click : function () {
            var records = this.creator.targetGrid.getSelectedRecords();
            this.creator.deselectRecords(records, true);
        }
    },

    //> @attr Shuttle.deselectAllButton (ImgButton AutoChild : null :IR)
    // ImgButton for deselecting the full set of selected data in the shuttle.
    // @visibility shuttle
    //<

    //> @attr Shuttle.deselectAllButtonIcon (SCImgURL : "[SKINIMG]TransferIcons/left_all.png" : IR)
    // Icon for the +link{deselectAllButton}
    // @visibility shuttle
    //<
    deselectAllButtonIcon:"[SKINIMG]TransferIcons/left_all.png",

    //> @attr Shuttle.deselectAllButtonWidth (Integer : 24 : IR)
    // Width for the +link{deselectAllButton}
    // @visibility shuttle
    //<
    deselectAllButtonWidth:24,
    
    //> @attr Shuttle.deselectAllButtonHeight (Integer : 22 : IR)
    // Height for the +link{deselectAllButton}
    // @visibility shuttle
    //<
    deselectAllButtonHeight:22,   

    deselectAllButtonConstructor:"ImgButton",
    deselectAllButtonDefaults:{
        showDown:false,
        click : function () {
            this.creator.clearSelection(true);
        }
    },

    initWidget : function () {

        var dynamicSourceDefaults = {

            textMatchStyle:this.textMatchStyle,
            fetchOperation:this.fetchOperation,

            groupTitle:this.sourceGridTitle,
            fields:(this.fields ? isc.clone(this.fields) : null),
            dataSource:this.dataSource
            
        }
        var staticSourceDefaults = isc.addProperties({}, this.sourceGridDefaults, this.sourceGridProperties);

        if (this.sortField && staticSourceDefaults.sortField == null) {
            dynamicSourceDefaults.sortField = this.sortField;
        }
        if (this.sortDirection && staticSourceDefaults.sortDirection == null) {
            dynamicSourceDefaults.sortField = this.sortDirection;
        }
        if (this.initialSort && staticSourceDefaults.initialSort == null) {
            dynamicSourceDefaults.initialSort = this.initialSort;
        }
        this.sourceGrid = this.createAutoChild("sourceGrid", dynamicSourceDefaults);

        var dynamicTargetDefaults = {
            groupTitle:this.targetGridTitle,
            fields:(this.fields ? isc.clone(this.fields) : null),
            dataSource:this.dataSource
        };

        var staticTargetDefaults = isc.addProperties({}, this.targetGridDefaults, this.targetGridProperties);
        
        if (this.sortField && staticTargetDefaults.sortField == null) {
            dynamicTargetDefaults.sortField = this.sortField;
        }
        if (this.sortDirection && staticTargetDefaults.sortDirection == null) {
            dynamicTargetDefaults.sortField = this.sortDirection;
        }
        if (this.initialSort && staticTargetDefaults.initialSort == null) {
            dynamicTargetDefaults.initialSort = this.initialSort;
        }
        this.targetGrid = this.createAutoChild("targetGrid", dynamicTargetDefaults);

        this.selectAllButton = this.createAutoChild(
                                "selectAllButton",
                                {
                                    width:this.selectAllButtonWidth,
                                    height:this.selectAllButtonHeight,
                                    src:this.selectAllButtonIcon
                                
                                }
                               );
        this.selectButton = this.createAutoChild("selectButton",                                
                                {
                                    width:this.selectButtonWidth,
                                    height:this.selectButtonHeight,
                                    src:this.selectButtonIcon
                                }
                            );

        this.deselectButton = this.createAutoChild("deselectButton",
                                    {
                                        width:this.deselectButtonWidth,
                                        height:this.deselectButtonHeight,
                                        src:this.deselectButtonIcon
                                    }
                              );

        this.deselectAllButton = this.createAutoChild("deselectAllButton",
                                    {
                                        width:this.deselectAllButtonWidth,
                                        height:this.deselectAllButtonHeight,
                                        src:this.deselectAllButtonIcon
                                    }
                                );
        
        this.controlBar = this.createAutoChild("controlBar", {
            members:[
                this.selectAllButton,
                this.selectButton,
                this.deselectButton,
                this.deselectAllButton
            ]
        });
        
        this.setMembers([
            this.sourceGrid, this.controlBar, this.targetGrid
        ]);
        this.updateGrids();
        return this.Super("initWidget", arguments);
    }

});

isc.Shuttle.registerStringMethods({
    // Documented above
    selectionUpdated : ""
});
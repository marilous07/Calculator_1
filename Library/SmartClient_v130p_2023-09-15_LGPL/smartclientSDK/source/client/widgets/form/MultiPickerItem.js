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
// MultiPickerItem relies on ListGrid, Shuttle

if (isc.ListGrid != null && isc.Shuttle != null) {

    


    //>	@class	MultiPickerItem
    // FormItem for choosing multiple values from a filterable list of options.
    // <P>
    // Options may be derived from an explicit +link{MultiPickerItem.valueMap} or an 
    // +link{MultiPickerItem.optionDataSource}.
    // <P>
    // Unlike a +link{SelectItem.multiple,multiple:true SelectItem}, the list of
    // options in a MultiPickerItem may be filtered.
    // <P>
    // For options derived from a dataSource with multiple fields, MultiPicker 
    // items also provide an option to display an expanded view where users
    // can filter by field.
    //
    // @treeLocation Client Reference/Forms/Form Items
    //
    // @inheritsFrom StaticTextItem
    // visibility multiPickerItem
    //<
    
    isc.defineClass("MultiPickerItem", "StaticTextItem");
    isc.MultiPickerItem.addProperties({

        //> @type MultiPickerSelectionStyle
        // Governs whether a +link{MultiPickerItem} displayes selected and unselected
        // option in a drop down pickList, or uses a +link{Shuttle,shuttle interface}
        // @value "pickList" Options will be displayed in a +link{pickList}
        // @value "shuttle" Options will be displayed in a +link{shuttle}
        // @value "pickTree" Options will be displayed in a +link{pickTree}. Only suitable for
        //   heirarchical data.
        // visibility multiPickerItem
        //<

        //> @attr MultiPickerItem.selectionStyle (MultiPickerSelectionStyle : "pickList" : IRA)
        // Should the MultiPickerItem use a +link{Shuttle} style interface to indicate
        // the currently selected / unselected values?
        // visibility multiPickerItem
        //<
        selectionStyle:"pickList",

        wrap:false,
        clipStaticValue:true,
        canFocus:true,
        alwaysShowControlBox:true,
        showPickerIcon:true, 
        applyHeightToTextBox:true,

        
        updateTextBoxOnOver:false,
        width:220, height:22,
        textBoxStyle:"selectItemLiteText", controlStyle:"selectItemLiteControl",
        pickerIconSrc:"sprite:cssClass:comboBoxItemPicker;size:24,32;offset:6,12;",
        pickerIconWidth:16,
        pickerIconHeight:20,

        //> @attr MultiPickerItem.multiple (Boolean : true : IR)
        // MultiPickerItems always work with array values
        // visibility multiPickerItem
        //<
        multiple:true,

        //> @attr MultiPickerItem.deriveUniqueValues (Boolean : false : IRA)
        // If this MultiPickerItem is deriving its options from a dataSource,
        // should it ensure unique field values by +link{dsRequest.groupBy,grouping by} the
        // value field for this item? This is not necessary if the target dataSource value field
        // is already unique - for example if this is the primaryKey field for a dataSource.
        // <P>
        // Note that for MultiPickerItems with <code>deriveUniqueValues:true</code>, any
        // +link{expandedPickListFields} to be displayed in the +link{MultiPickerItem.canExpand,expanded view}
        // will not be able to display meaningful values unless a 
        // +link{DSRequest.summaryFunctions,summaryFunction} is supplied to produce
        // aggregated values from the grouped data. This may be achieved by specifying 
        // summaryFunctions directly on the +link{optionFilterContext}, or on the 
        // +link{dataSource.operationBindings,operationBinding} for the +link{optionOperationId,fetch operation}.
        //
        // visibility multiPickerItem
        //<
        // Doesn't apply to pickTrees where it's hard to sensibly remove duplicates that could show
        // up in different parent folders
        deriveUniqueValues:false,
        shouldDeriveUniqueValues : function () {

            return this.deriveUniqueValues && !this._usePickTree();
        },

        // Optimization: If shouldDeriveUniqueValues is true, records will have only one field value
        // (the value for our valueField).
        // In this case we can create record objects for our selected values without contacting the
        // server and display these in the selection list, and in the pickList if the optionCriteria
        // would otherwise exclude these values from display
        
        createValueRecords:true,
        canCreateValueRecords : function () {
            return this.shouldDeriveUniqueValues();
        },

        // Picktree specific attributes:

        // Quick helper to check selectionStyle == pickTree
        _usePickTree : function () {
            return this.selectionStyle == "pickTree";
        },

        //> @attr MultiPickerItem.includedSelectedParents (Boolean : false : IR)
        // For multiPickerItems with +link{selectionStyle,selectionStyle:"pickTree"},
        // and +link{canSelectFolders,canSelectFolders:true}, should selected
        // parent nodes be included in the item's value?
        // <P>
        // When +link{cascadeSelection,cascading selection} is enabled for a 
        // tree, the selected state of parent nodes always reflects the selected
        // state of their children, and it may not be necessary or desirable to
        // explictly record the parents' selected state in the item's value. 
        // <P>
        // Some specific use cases where this is the case might include:
        // <ul>
        // <li>Creating filter criteria for a target TreeGrid where 
        //     +link{treeGrid.keepParentsOnFilter} is true. In this case filter
        //     criteria would not need to include selected parent nodes for the
        //     children to be visible in the target tree.</li>
        // <li>Trees where leaves are of a different logical type than their
        //     parents. If a tree structure is being used to categorize data,
        //     +link{cascadeSelection,cascading selection} may be useful to allow
        //     the user to easily select all items within a category but application
        //     code may not want to include the categories as part of a 
        //     MultiPickerItem's value</li>
        // </ul>
        // <P>
        // This property only applies when +link{cascadeSelection} is true. If
        // cascadeSelection is false, all selected nodes will be present in the items
        // value regardless of their parent/child relationships.
        //
        // visibility multiPickerItem
        //<
        includeSelectedParents:false,
        shouldIncludeSelectedParents : function () {
            if (!this.canSelectFolders) return false;
            // If cascadeSelection is false, it would be very odd to allow the user
            // to pick nodes at arbitrary depths of nesting and then remove those that
            // don't have children, or happen to be in the same path as other selected nodes.
            if (!this.cascadeSelection) return true;

            return this.includeSelectedParents;
        },

        //> @attr MultiPickerItem.canSelectFolders (Boolean : true : IR)
        // For multiPickerItems with +link{selectionStyle,selectionStyle:"pickTree"},
        // should the user be able to select and deselect folders?
        // <P>
        // If false, selection checkboxes will only be visible by leaf nodes within
        // the pickTree data set.
        // <P>
        // Note that this flag may be set to true in conjunction with 
        // +link{includeSelectedParents,includeSelectedParents:false}. In this case
        // the user may check and uncheck parent nodes as a convenient way to 
        // select or unselect all their children due to
        // +link{cacadeSelection,cascading selection}, but the parent nodes themselves
        // won't be present in the item's value.
        // visibility multiPickerItem
        //<
        canSelectFolders:true,

        //> @attr MultiPickerItem.cascadeSelection (Boolean : true : IR)
        // For multiPickerItems with +link{selectionStyle,selectionStyle:"pickTree"},
        // and +link{canSelectFolders,canSelectFolders:true}, should 
        // +link{TreeGrid.cascadeSelection} be enabled on our pickTree?
        // visibility multiPickerItem
        //<
        cascadeSelection:true,
        shouldCascadeSelection : function () {
            return this.canSelectFolders && this.cascadeSelection;
        },

        // MultiPickerItem.toggleUseUnselectedValuesOnSelectAll
        // If the user hits "SelectAll" on an unfiltered list, with this enabled, we'll toggle 
        // "useUnselectedValues" to be true and set "defaultIsSelected" to true on the pickList,
        // so the user will be tracking an explicitly unselected set of options instead of 
        // an explicitly selected set of options.
        // This gives us a way to handle SelectAll when we have a partial data set, or just don't want
        // to track huge arrays of values.
        //
        // Without this, Select All / Clear are enabled/disabled on an unfiltered data set exactly
        // how they would be for a filtered data set with selectAllWhileFiltered:"whenLoaded"
        //
        // For this to be useful the dev needs to look at both this.getValue() and this.defaultIsSelected
        //
        // We use this in the SetFilterItem
        toggleUseUnselectedValuesOnSelectAll:false,

        //> @attr MultiPickerItem.selectAllWhileFiltered (FilteredSelectAllAction : "whenLoaded" : IRA)
        // If the user has filtered the set of options available in this item, how should the "Select All" and
        // "Clear All" buttons work?
        // visibility multiPickerItem
        //<
        selectAllWhileFiltered:"whenLoaded",

        //> @type FilteredSelectAllAction
        // Governs how the +link{MultiPickerItem} "Select All" and "Deselect All" buttons should
        // act when the user has filtered the set of visible options in the list.
        // @value "disable" The buttons auto-disable when the list of options is filtered.
        // @value "all" Ignore filtering: Always select or deselect the entire set of options
        //  including those not currently visible in the filtered list. This option is only
        //  available if the entire set of data has been loaded in the client.
        // @value "whenLoaded" 
        //   If the entire (filtered) list is loaded, both Select All and Clear are functional and will
        //   update the selection for all items in the filtered list. If a partial list is loaded, these
        //   buttons will be disabled.
        // visibility multiPickerItem
        //<
        

        //> @attr MultiPickerItem.useUnselectedValues (Boolean : false : IRA)
        // If true, this items value will represent the unselected values from the picker grid
        // rather than the selected values.
        // <P>
        // If +link{toggleUseUnselectedValuesOnSelectAll} is true, this property will automatically be 
        // toggled when the user clicks the +link{selectAllButton} and +link{deselectAllButton}.
        // @visibility internal
        //<
        // When set to true, we'll use selection.defaultIsSelected:true to track the unselected values
        // in the grid.
        // Used by the SetFilterItem
        useUnselectedValues:false,

        // default for whether to use selected or unselected: 
        // If the user clears the pick list selection, then re-shows, should we show
        // everything checked and be in useUnselectedValues mode or vice versa?
        defaultUseUnselectedValues:false,

        // setUseUnselectedValues() - toggles between our value representing what's selected
        // in the grid vs what's not selected in the grid
        // Also drops the current item value unless you explicitly request it be retained
        // in which case it's effectively reversed.
        
        setUseUnselectedValues : function (useUnselectedValues, retainSelection) {
            var pickList = this.getPickListComponent();

            if (!pickList) {
                if (!retainSelection) this.storeValue([]);
                return;
            }
            var selection = pickList.selectionManager;
            var anySelected;
            if (!retainSelection) {
                anySelected = (selection.getSelectionByKeys(true).length > 0);
                // clear any "modified" selection
                selection.clearSelection(true); 
            }
            selection.setDefaultIsSelected(useUnselectedValues);
            if (anySelected || (useUnselectedValues != this.useUnselectedValues)) {

                this.useUnselectedValues = useUnselectedValues;
                pickList.markForRedraw();
                pickList.updateItemValue();
                pickList.updateSelectionList();
            }
            if (this.selectionListLabel) this.selectionListLabel.markForRedraw();

        },

        //> @attr MultiPickerItem.sourceList (Array of Record | Tree | ResultSet : null : IRA)
        // If specified, this picker will derive its set of options from this list of records.
        // <P>
        // Note that if the <code>sourceList</code> list is a ResultSet that has not
        // got a complete +link{ResultSet.allMatchingRowsCached(),cache of data} for its
        // criteria, options will be derived by performing a fetch against the resultSet's
        // dataSource.
        // @visibility internal
        //<
        
        getSourceList : function () {
            if (this.sourceList != null) return this.sourceList;
            return this._getSourceListFromValueMap();
        },
        _getSourceListFromValueMap : function () {
            var valueMap = this.getValueMap();
            if (valueMap == null) return null;
            var sourceList = [];
            if (isc.isAn.Array(valueMap)) {
                for (var i = 0; i < valueMap.length; i++) {
                    sourceList[i] = {};
                    sourceList[i][this.getValueFieldName()] = valueMap[i];
                }
            } else {
                for (var value in valueMap) {
                    var record = {};
                    record[this.getValueFieldName()] = value;
                    // No need to populate displayField - the picker will already
                    // apply our valueMap to itself which will map to display values.
                    sourceList.add(record);
                }
            }
            return sourceList;
        },

        //> @attr MultiPickerItem.optionCriteria (Criteria : null : IRWA)
        // If this MultiPickerItem is deriving its options from a dataSource, this property allows
        // developers to specify criteria for the fetch.
        // visibility multiPickerItem
        //<
        

        //> @method MultiPickerItem.getOptionCriteria()
        // Return the derived +link{optionCriteria} for this item
        // @return (Criteria) criteria to apply to the pickList and expandedPickerGrid
        // visibility multiPickerItem
        //<
        getOptionCriteria : function () {

            if (this.optionCriteria != null) {
                return this.optionCriteria;
            }
            if (this.sourceList && this.sourceList.getCriteria) {
                return this.sourceList.getCriteria();
            }
        },

        //> @method MultiPickerItem.getExtraOptionCriteria()
        // This method allows extra criteria to be applied to the pickList in addition to
        // the +link{getOptionCriteria()}. Note that if the SelectedList is fetching
        // records to match the selected values from the server, it will use an inSet criteria
        // for the selected values, combined with the result of getOptionCriteria() but will
        // not consult getExtraOptionCriteria()
        // <P>
        // Overridden in SetFilterItem to handle the case where a filterTargetComponent has
        // user-criteria applied to other fields. This should restrict the set of options
        // available in the pickList
        // 
        // @return (Criteria) criteria to apply to the pickList and expandedPickerGrid
        // visibility internal
        //<
        
        getExtraOptionCriteria : function () {
            return null;
        },

        getOptionFetchOperation : function () {
            if (this.optionOperationId != null) {
                return this.optionOperationId;
            }
            // Pick up ResultSet.fetchOperation etc.
            var sourceList = this.getSourceList();
            if (sourceList && sourceList.getOperationId) {
                return sourceList.getOperationId("fetch");
            }

        },

        // Pick up arbitrary request properties from the source list, if we have one.
        getOptionFilterContext : function () {
            var  context = {};
            
            // Pick up ResultSet.context or requestProperties, if present.
            var sourceListContext = this.getSourceListFilterContext();
            if (sourceListContext != null) isc.addProperties(context, sourceListContext);
            
            if (this.optionFilterContext) {
                isc.addProperties(context, this.optionFilterContext);
            }
            if (this.textMatchStyle != null) context.textMatchStyle = this.textMatchStyle;
            context.operationType = "fetch";

            return context;

        },

        // Helper to get the requestProperties from our sourceList
        
        getSourceListFilterContext : function () {
            var sourceList = this.getSourceList();
            if (sourceList) {
                return sourceList.context || sourceList.requestProperties;
            }
        },


        //> @method multiPickerItem.getSelectionImplicitCriteria()
        // The selectionGrid shows records for the current item values - if
        // necessary these will be fetched from the target dataSource.
        // <P>
        // getSelectionImplicitCriteria() method returns implicit criteria for the fetch,
        // and will be combined with an inSet criteria to pick up the selected valueField
        // values.
        // <P>
        // By default this method will return the 
        // +link{getOptionCriteria(),optionCriteria}, but not any criteria returned by
        // +link{getExtraOptionCriteria()}.
        // <P>
        // This method is overridden by +link{SetFilterItem} to handle
        // the case where option criteria are derived from the current criteria
        // applied to a target listGrid. In this case the
        // grid's implicitCriteria will be returned by this method (but not the
        // user-editable criteria).
        // @visibility internal
        //<
        
        getSelectionImplicitCriteria : function () {
            return this.getOptionCriteria();
        },

        //> @attr MultiPickerItem.textMatchStyle (TextMatchStyle : "substring" :IR)
        // textMatchStyle to apply to +link{getOptionCriteria(),option criteria} for this
        // item
        // visibility multiPickerItem
        //<
        textMatchStyle:"substring",


        //> @attr MultiPickerItem.optionDataSource (DataSource : null : IR)
        // @include FormItem.optionDataSource
        // visibility multiPickerItem
        //<

        //> @attr MultiPickerItem.optionOperationId (String : null : IR)
        // @include FormItem.optionOperationId
        // visibility multiPickerItem
        //<

        //> @attr MultiPickerItem.optionFilterContext (DSRequest Properties : null : IR)
        // @include FormItem.optionFilterContext
        // visibility multiPickerItem
        //<

        // Override getOptionDataSource - if we have a source list we'll pull our
        // options from it
        getOptionDataSource : function () {
            if (this.optionDataSource != null) return isc.DataSource.get(this.optionDataSource);
            var sourceList = this.getSourceList();
            if (sourceList != null && sourceList.dataSource != null) return isc.DataSource.get(sourceList.dataSource);
            // Pick up DS from foreignKey
            var defaultDS = this.Super("getOptionDataSource", arguments);
            return defaultDS;
        },
        // Pass standard dsRequest config through to the optionDS as necessary
        
        optionDSRequestPassthroughs:[
            // startRow/endRow handled dynamically
            // criteria handled dynamically
            // operationId handled dynamically
            "sortBy",
            "keepParentsOnFilter",
            "parentNode"
        ],

        //> @attr MultiPickerItem.valueField (String : null : IR)
        // @include FormItem.valueField
        //<

        //> @attr MultiPickerItem.displayField (String : null : IR)
        // @include FormItem.displayField
        //<
        
        //> @method MultiPickerItem.getValueFieldName()
        // @include FormItem.getValueFieldName()
        //<

        //> @attr MultiPickerItem.sortField (String | Array of String | Integer : null : IR)
        // +link{ListGrid.sortField,Sort field} for this item's list of options. Will be applied
        // to the +link{MultiPickerItem.pickList}, +link{MultiPickerItem.pickTree} or 
        // +link{MultiPickerItem.shuttle} depending on the +link{MultiPickerItem.selectionStyle}
        // of this item.
        //
        // @visibility multiPickerItem
        //<

        //> @attr MultiPickerItem.sortDirection (SortDirection : null : IR)
        // +link{ListGrid.sortDirection,Sort direction} for this item's list of options. Will be applied
        // to the +link{MultiPickerItem.pickList}, +link{MultiPickerItem.pickTree} or 
        // +link{MultiPickerItem.shuttle} depending on the +link{MultiPickerItem.selectionStyle}
        // of this item.
        //
        // @visibility multiPickerItem
        //<

        //> @attr MultiPickerItem.initialSort (Array of SortSpecifier : null : IR)
        // +link{ListGrid.initialSort,Initial sort specifiers} for this item's list of options. Will be applied
        // to the +link{MultiPickerItem.pickList}, +link{MultiPickerItem.pickTree} or 
        // +link{MultiPickerItem.shuttle} depending on the +link{MultiPickerItem.selectionStyle}
        // of this item.
        //
        // @visibility multiPickerItem
        //<


        // getPickerDataSource: Returns a facade-type dataSource to provide options
        // to the picker grids. 
        // Will extract values from sourceList if possible, otherwise issue a
        // fetch [with a groupBy field if necessary] against the sourceList DS or
        // explicit optionDataSource
        getPickerDataSource : function () {

            if (this._pickerDataSource == null) {

                var pickerDataSourceID = this.getID() + "_pickerDataSource";

                var optionDataSource = this.getOptionDataSource(); // may be null!
                var fields = optionDataSource.getFields();
                var pdsFields = [];
                // We need to deal with hierarchical data.
                // Translate any foreignKeys that indicate a parent field in the sameDS
                for (var fieldName in fields) {
                    var odsField = fields[fieldName];

                    if (odsField.foreignKey != null) {
                        var foreignDS = isc.DataSource.getForeignDSName(odsField),
                            foreignField = isc.DataSource.getForeignFieldName(odsField);

                        if (foreignDS == optionDataSource.getID()) {
                            foreignDS = pickerDataSourceID;
                        
                            pdsFields.add({
                                name:fieldName,
                                foreignKey:foreignDS + "." + foreignField
                            });
                        }
                    }
                }

                this._pickerDataSource = isc.DataSource.create({
                    ID:pickerDataSourceID,
                    creator:this,
                    _generated:true,
                    

                    // This will pick up fields
                    
                    inheritsFrom:optionDataSource,
                    // For Tree type data, override parent relationship field to point back to this DS
                    // PDS fields will be empty for non-tree data (and will have no impact
                    // on the inherited DS fields).
                    fields:pdsFields,
                    dropUnknownCriteria:false,
                    sendExtraFields:true,
                    
                    clientOnly: true,

                    // This is a clientCustom type dataSource
                    dataProtocol: "clientCustom",

                    // Optimization: If we are issuing a groupBy request against
                    // our option dataSource to derive unique values, records
                    // will only have a field value for this.valueField.
                    // As such we can generate simple record objects for our 
                    // current selected values
                    // Useful because
                    // - we always want our selected values to be present in our
                    //   pickList so the user can toggle selection, even if
                    //   they wouldn't be present in whatever was returned from
                    //   getOptionCriteria()
                    // - we can often be able to populate the selectionList without 
                    //   hitting the dataSource
                    _canCreateValueRecords : function () {
                        if (this.creator.canCreateValueRecords()) {
                            return true;
                        }
                        return false;
                    },

                    // transformRequest - invoked for all operations against this dataSource
                    // This handles providing data to the pickList and the selectionList
                    // [or the Shuttle]
                    // This will handle deriving data from our sourceList if possible, otherwise issue
                    // a fetch with appropriate criteria against the target optionDataSource.
                    
                    transformRequest : function (dsRequest) {

                        // Is this a fetch to get values for the selectionList?
                                                
                        var isSelectionListFetch = dsRequest.operationId == "selectedItemsFetch";
                            
                        // optionDSRequest - this is the request object that will be sent to
                        // the option dataSource if we can't satisfy the request from cache
                        // If we can satisfy the request from cache, we'll also use this to
                        // apply sorting, grouping etc to cache data if appropriate.
                        var optionDS, optionCriteria;
                        var optionDSRequest = this.creator.getOptionFilterContext();

                        // Pick up sort, etc:
                        var passThroughs = this.creator.optionDSRequestPassthroughs;
                        for (var i = 0; i < passThroughs.length; i++) {
                            if (dsRequest[passThroughs[i]] != null && optionDSRequest[passThroughs[i]] == null) {
                                optionDSRequest[passThroughs[i]] = dsRequest[passThroughs[i]];
                            }
                        }
                        
                        // Do our records have just a single meaningful field value?
                        // If so we never need to hit the server to retrieve records for known values - we
                        // can build such records on the client as { valueFieldName: <value> }
                        var canCreateValueRecords = this._canCreateValueRecords();

                        // We need to ensure the selected item values are present in the data set so the user
                        // can unselect them.
                        var itemValues = this.creator.getValue();                                

                        if (itemValues == null) itemValues = [];
                        else if (!isc.isA.Array(itemValues)) itemValues = [itemValues];
                        

                        var missingValueRecords = [];
                        var identicalCriteria;
                        var mustAggregate;


                        // Optimization: The selectionList always shows only the current set of 
                        // selected values. If we can create value records on the client, we never need to
                        // hit any server
                        if (isSelectionListFetch && canCreateValueRecords) {
                            
                            sourceList = dsRequest.selectedRecords;
                            useSourceListData = true;

                            // set identicalCriteria:true - we don't need to filter this set of options according to
                            // any optionCriteria.
                            identicalCriteria = true; 

                        } else {

                            

                            // optionCriteria = base criteria for the optionDataSource
                            
                            optionCriteria = this.creator.getOptionCriteria();

                            optionDS = this.creator.getOptionDataSource();

                            mustAggregate = this.creator.shouldDeriveUniqueValues();

                            // If we're extracting unique values from data, use dsRequest.groupBy to have
                            // the server [or clientOnly DS logic] perform the aggregation.
                            
                            var valueField = this.creator.getValueFieldName();
                            if (mustAggregate) {
                                optionDSRequest.groupBy = valueField;
                            }

                            // If the sourceList data set has a complete cache, derive options from it
                            // rather than hitting the server.
                            
                            var validCacheCriteria;
                            var sourceListDataObject = this.creator.getSourceList();
                            var sourceList = sourceListDataObject;
                            var useSourceListData = false;

                            if (sourceList != null) {

                                if (!isSelectionListFetch) {
                                    validCacheCriteria = optionCriteria;
                                    var dynamicCriteria = this.creator.getExtraOptionCriteria();
                                    if (dynamicCriteria != null) {
                                        validCacheCriteria = optionDS.combineCriteria(validCacheCriteria, dynamicCriteria, "and", "substring");
                                    }
                                }
    
                                var listCriteria, listCriteriaComparison;
                                // If we're not databound we can use the sourceList data directly.
                                useSourceListData = optionDS == null && (isc.isA.Array(sourceList) || isc.isA.Tree(sourceList));
                                if (useSourceListData) {
                                    
                                    listCriteria = null;
                                    listCriteriaComparison = this.compareCriteria(validCacheCriteria, listCriteria, optionDSRequest);

                                } else {
                                       
                                    if (isc.ResultSet && isc.isA.ResultSet(sourceList) &&
                                        sourceList.allMatchingRowsCached() ) 
                                    {
                                        // If the sourceList has allRowsCached, we can always extract values from within that
                                        // cache
                                        if (sourceList.allRowsCached()) {
                                            useSourceListData = true;
                                            // the sourceList cache came from an unrestricted fetch
                                            listCriteria = null;
                                            // Normalize to a simple array we can filter
                                            sourceList = sourceList.allRows;
                                                                                
                                            listCriteriaComparison = this.compareCriteria(validCacheCriteria, listCriteria, optionDSRequest);

                                        } else {

                                            if (isSelectionListFetch) {

                                                listCriteriaComparison = 0;
                                                useSourceListData = true;

                                            } else  if (sourceList.allMatchingRowsCached()) {

                                                if (sourceList.allRows != null) {
                                                    listCriteria = sourceList.allRowsCriteria
                                                } else {
                                                    listCriteria = optionDS.combineCriteria(
                                                                        sourceList.getImplicitCriteria(), 
                                                                        sourceList.getCriteria());
                                                }

                                                // ResultSet textMatchStyle defaults to exact - take this into 
                                                // account when comparing criteria
                                                if (listCriteria && listCriteria._constructor != "AdvancedCriteria") {
                                                    var textMatchStyle = sourceList.context.textMatchStyle || "exact"
                                                    listCriteria = isc.DataSource.convertCriteria(listCriteria, textMatchStyle);
                                                }
    
                                                listCriteriaComparison =  this.compareCriteria(validCacheCriteria, listCriteria, optionDSRequest);
                                                
                                                useSourceListData = listCriteriaComparison >= 0;
                                                sourceList = sourceList.allRows || sourceList.localData;
                                            }

                                            // If we have any specified values, verify that the record(s) for them are present
                                            // in the data set. We need the user to be able to clear any selection they previously
                                            // applied even if the target grid has been filtered in a way that lost those unique values.
                                            if (useSourceListData) {
                                                for (var i = 0; i < itemValues.length; i ++) { 
                                                    if (sourceList.findIndex(valueField, itemValues[i]) == -1) {
                                                        
                                                        if (!canCreateValueRecords) {
                                                            // this.logWarn("value field value missing from source list- can't use source list data");
                                                            useSourceListData = false;
                                                            break;
                                                        } else {
                                                            missingValueRecords.add(itemValues[i]);
                                                        }
                                                    }
                                                }
                                            }

                                            // this.logWarn("Can use ResultSet cache data to populate multiPickerItem:" + useSourceListData);

                                        }

                                    // If the ResultTree is fully loaded (including all descendants) we can build our cache
                                    // from its full set of nodes
                                    
                                    } else if (isc.Tree && isc.isA.Tree(sourceList) && 
                                            sourceList.dataFetchMode != "paged" && 
                                            !sourceList.loadDataOnDemand &&
                                                sourceList.getLoadState(sourceList.getRoot()) == "loaded") 
                                    {

                                        if (isc.ResultTree && isc.isA.ResultTree(sourceList)) {

                                            // completeTree == resultTree is filtering locally
                                            // the completeTree itself should be a fully cached tree with
                                            // no criteria, so we can always extract values from it.
                                            if (sourceList.completeTree) {
                                                useSourceListData = true;
                                                // the sourceList cache came from an unrestricted fetch
                                                listCriteria = null;
                                                // Normalize to a simple array we can filter
                                                sourceList = sourceList.completeTree;
                                                                                    
                                                listCriteriaComparison = this.compareCriteria(validCacheCriteria, listCriteria, optionDSRequest);
    
                                            } else {

                                                
                                                listCriteria = optionDS.combineCriteria(
                                                                    sourceList.getImplicitCriteria(), 
                                                                    sourceList.criteria);

                                                // ResultSet textMatchStyle defaults to exact - take this into 
                                                // account when comparing criteria
                                                if (listCriteria && listCriteria._constructor != "AdvancedCriteria") {
                                                    var textMatchStyle = sourceList.context.textMatchStyle || "exact"
                                                    listCriteria = isc.DataSource.convertCriteria(listCriteria, textMatchStyle);
                                                }                                                

                                                if (isSelectionListFetch) {
                                                    
                                                    useSourceListData = true;
                                                    listCriteriaComparison = 0;

                                                } else {

                                                    listCriteriaComparison = this.compareCriteria(validCacheCriteria, listCriteria, optionDSRequest);
                                                    useSourceListData = (listCriteriaComparison >= 0);
                                                }
                                            }

                                            // If we have any specified values, verify that the record(s) for them are present
                                            // in the data set. We need the user to be able to clear any selection they previously
                                            // applied even if the target grid has been filtered in a way that lost those unique values.
                                            // Optimization #2: As with the ResultSet case - if canCreateValueRecords is true,
                                            // we can create these value records on the client so we can still avoid hitting the server
                                            // to retrieve them.
                                            if (useSourceListData && !canCreateValueRecords) {

                                                for (var i = 0; i < itemValues.length; i ++) {
                                                    if (sourceList.find(valueField, itemValues[i]) == null) {
                                                        if (!canCreateValueRecords) {
                                                            // this.logWarn("value field value missing from source list- can't use source list data");
                                                            useSourceListData = false;
                                                            break;
                                                        } else {
                                                            missingValueRecords.add(itemValues[i]);
                                                        }
                                                    }
                                                }
                                            }

                                            // this.logWarn("Can use ResultTree cache data to populate multiPickerItem:" + useSourceListData);

                                        // Simple Tree [not a ResultTree]
                                        
                                        } else {
                                            useSourceListData = true;
                                            listCriteria = null;
                                            listCriteriaComparison = this.compareCriteria(validCacheCriteria, listCriteria, optionDSRequest);
                                        }

                                        if (useSourceListData) {

                                            // normalize to an array we can filter

                                            var nodes = sourceList.getAllNodes(sourceList.getRoot());
                                            // Clean off existing tree metadata including children arrays
                                            
                                            nodes = sourceList.getCleanNodeData(nodes, false, false);
                                            
                                            sourceList = nodes;

                                        }
                                    }   // END of conditional to set useSourceListData for a ResultSet/Tree if possible
                                } // End else-case to determine if useSourceListData can be true [databound source list]
                            } // END if (sourceList != null)
                        }

                        if (useSourceListData) {

                            // At this stage we have a sourceList array we can extract records from
                            //  - we may need to filter them
                            //  - we may need to aggregate them
                            var processedRecords = sourceList;
                            if (!identicalCriteria) {
                                // Apply filter before aggregating records - otherwise we'll lose
                                // the values for fields that may be present in the option criteria.
                                processedRecords = this.applyFilter(processedRecords, validCacheCriteria, optionDSRequest);
                            }

                            // apply the "groupBy" field on the client if necessary
                            if (mustAggregate) {
                                processedRecords = this.applyClientSummaries(optionDSRequest, processedRecords);
                            }

                            // Optimization: If we don't have records in the cache for our current array of values,
                            // create them now (if we can). This avoids a server fetch
                            if (canCreateValueRecords) {
                                for (var i = 0; i < missingValueRecords.length; i ++) {
                                    var valueRecord = {};
                                    valueRecord[valueField] = itemValues[i];
                                    processedRecords.add(valueRecord);
                                }    

                                                                                         
                            //>DEBUG
                            } else if (missingValueRecords.length > 0) {
                                this.logWarn("Unable to find value field records in sourceList cache for:" + missingValueRecords);
                            //<DEBUG
                            }

                            // Our "processedRecords" are now the aggregated set of options that match
                            // the 'validCacheCriteria', and include records for every value we currently have selected.
                            //
                            // The dsRequest passed to this facade DS may have further criteria 
                            // - For the selectionList this will limit to only display the current selected values
                            // - For the pickList this will typically come from the MultiPickerItem's filter form.
                            //
                            // Use getClientOnlyFetchResponse() to process the cache and return the appropriate
                            // subset of records

                            // this.logWarn("** Fetch request serviced from local data cache. Criteria:" + isc.JSON.encode(dsRequest.data));

                            var responseArr = this.getClientOnlyFetchResponse(dsRequest, processedRecords);
                            var response = responseArr[0];
                            response.data = responseArr[1];
                            // Process response on a delay - if we do this synchronously we can confuse
                            // upstream code, including breaking autoOpening of loaded tree nodes in a
                            // picktree
                            this.delayCall("processResponse", [dsRequest.requestId, response]);
                            return;

                        // If we don't have cache data for the current optionCriteria, issue a fetch
                        // against our option DataSource directly. 
                        } else {

                            var fetchOperation = this.creator.getOptionFetchOperation();
                            if (fetchOperation != null) optionDSRequest.operationId = fetchOperation;
    
                            // this.logWarn("Must fetch against option dataSource");

                            // If we have to hit the server, retain details of the original fetch
                            optionDSRequest.clientContext = {
                                originalRequest:dsRequest
                            };

                            optionDSRequest.startRow = dsRequest.startRow;
                            optionDSRequest.endRow = dsRequest.endRow;

                            // Criteria for the optionDataSource:
                            // isSelectionListFetch:false (list of options to pick from)
                            //  a. result of getOptionCriteria() - for a SetFilterItem this will be the implicit criteria for
                            //                                     the target grid
                            //  b. any criteria passed to this fetch [dsRequest.criteria]. This is typically what a user
                            //     typed into the MultiPickerItem's filter form.
                            //  c. nested OR containing:
                            //      i inSet criteria for our current values - these must be present so a user can unselect them
                            //      i result of 'getExtraOptionCriteria() - for a setFilterItem this will be the user-criteria
                            //                                              for the target grid, with any fields applied by the
                            //                                              setFilterItem removed!
                            //
                            // isSelectionListFetch:true (fetch to show selected records in the selection listGrid)
                            //  a. result of getOptionCriteria() - for a SetFilterItem this will be the implicit criteria for
                            //                                     the target grid.
                            //  b. any criteria passed to this fetch [dsRequest.criteria].
                            //     this is always expected to be the inSet criteria to fetch records for the current selected values
                            
                            var targetDSCriteria = optionCriteria;

                            if (!isSelectionListFetch) {

                                var dynamicCriteria = this.creator.getExtraOptionCriteria();
                                if (dynamicCriteria != null) {
                                    if (itemValues.length > 0) {
                                        var valueCriteria = {operator:"inSet", fieldName:valueField, value:itemValues};
                                        dynamicCriteria = optionDS.combineCriteria(valueCriteria, dynamicCriteria, "or", "substring");
                                    }
                                    targetDSCriteria = optionDS.combineCriteria(targetDSCriteria, dynamicCriteria, "and", "substring");
                                }
                            }
                            if (dsRequest.data != null) {
                                targetDSCriteria = optionDS.combineCriteria(targetDSCriteria, dsRequest.data, "and", "substring");
                            }
                            // this.logWarn("** Fetch request against optionDataSource. Criteria:" + isc.JSON.encode(targetDSCriteria));

                            optionDS.fetchData(
                                targetDSCriteria,
                                {target:this, methodName:"remoteFetchComplete"},
                                optionDSRequest
                            );
                        }
                        return dsRequest.data;
                    },

                    remoteFetchComplete : function (dsResponse, data, dsRequest) {
                        
                        
                        

                        var originalRequest = dsRequest.clientContext.originalRequest;

                        this.processResponse(
                            originalRequest.requestId, 
                            // Final response
                            {   status:0, data:data, 
                                startRow:dsResponse.startRow, endRow:dsResponse.endRow, 
                                totalRows:dsResponse.totalRows
                            }
                        );
                    }
                });
            }
            return this._pickerDataSource;

        },

        //> @attr MultiPickerItem.useSelectedValuesPrefix (String : "None Except:" : IRW)
        // Prefix to apply when the user is selecting values from an otherwise unselected
        // set of options
        // @group i18nMessages
        // @visibility internal
        //<
        useSelectedValuesPrefix:"None Except:",
        //> @attr MultiPickerItem.useUnselectedValuesPrefix (String : "All Except:" : IRW)
        // Prefix to apply when the user is deselecting values from an otherwise selected
        // set of options
        // @group i18nMessages
        // @visibility internal
        //<
        useUnselectedValuesPrefix:"All Except:",        // Only shown if toggleUseUnselectedValuesOnSelectAll is true.
        // Exposed at the SetFilterItem level

        // Override _getDisplayValue to show an appropriate value in our text box
        _getDisplayValue : function (value, canUseCurrentValue) {
            var formattedValue = this.Super("_getDisplayValue", arguments);
            if (this.toggleUseUnselectedValuesOnSelectAll && value != null && isc.isA.Array(value) && value.length > 0) {
                return (this.useUnselectedValues ? this.useUnselectedValuesPrefix : 
                    this.useSelectedValuesPrefix) + " " + formattedValue;
            }
            return formattedValue;
        },

        // Show the picker on click or icon click
        pickerIconClick : function () {
            this.showFilterList();
            return false; // return false to kill bubbling
        },
        click : function () {
            this.showFilterList();
        },

        //> @attr MultiPickerItem.pickListWidth (Integer : 250 : IRW)
        // Default width for the +link{pickerLayout} when +link{selectionStyle} is <code>"pickList"</code>.
        // visibility multiPickerItem
        //<
        pickListWidth:250,
        
        //> @attr MultiPickerItem.expansionWidth (Integer : 500 : IRW)
        // Width for the +link{pickerLayout} in expanded mode when +link{canExpand} is true
        // visibility multiPickerItem
        //<
        expansionWidth:500,

        //> @attr MultiPickerItem.shuttleWidth (Integer : 500 : IRW)
        // Width for the +link{pickerLayout} when +link{selectionStyle} is <code>"shuttle"</code>.
        // visibility multiPickerItem
        //<
        shuttleWidth:500,
        
        getPickListWidth : function () {
            if (this.selectionStyle == "shuttle") return this.shuttleWidth;
            if (this.pickListWidth != null) return this.pickListWidth;
            return this.getWidth();
        },

        //> @attr MultiPickerItem.pickListHeight (Integer : 400 : IRW)
        // Default height for the +link{pickerLayout} when +link{selectionStyle} is <code>"pickList"</code>.
        // visibility multiPickerItem
        //<
        pickListHeight:400,

        //> @attr MultiPickerItem.expansionHeight (Integer : 500 : IRW)
        // Height for the +link{pickerLayout} in expanded mode when +link{canExpand} is true
        // visibility multiPickerItem
        //<
        expansionHeight:500,

        //> @attr MultiPickerItem.shuttleHeight (Integer : 400 : IRW)
        // Height for the +link{pickerLayout} when +link{selectionStyle} is <code>"shuttle"</code>.
        // visibility multiPickerItem
        //<
        shuttleHeight:400,

        getPickListHeight : function () {
            if (this.selectionStyle == "shuttle") return this.shuttleHeight;
            return this.pickListHeight;
        },

        // AutoChildren

        // toolbar

        //> @attr MultiPickerItem.selectAllButtonTitle (String : "Select All" : IR)
        // Title for the +link{selectAllButton}
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        selectAllButtonTitle:"Select All",

        //> @attr MultiPickerItem.selectAllWhileFiltered_disabledPrompt (String : "Select All disabled while filtered" : IRW)
        // Disabled prompt for the +link{selectAllButton} while filtered if +link{selectAllWhileFiltered} is
        // set to <code>"disable"</code>.
        //
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        selectAllWhileFiltered_disabledPrompt:"Select All disabled while filtered",

        //> @attr MultiPickerItem.selectAllWhileFiltered_partialCachePrompt (String : "Unable to Select All as the full set of options has not been fetched from the server." : IRW)
        // Disabled prompt for the +link{selectAllButton} while filtered if +link{selectAllWhileFiltered} is
        // set to <code>"whenLoaded"</code> and the +link{pickList} does not have a complete data set
        // loaded on the client.
        //
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        selectAllWhileFiltered_partialCachePrompt:"Unable to Select All as the full set of options has not been fetched from the server.",



        //> @attr MultiPickerItem.selectAllButton (ToolStripButton AutoChild : null : IR) 
        // Select All button +link{type:AutoChild}
        // visibility multiPickerItem
        //<
        selectAllButtonConstructor:"ToolStripButton",
        selectAllButtonDefaults : {
            getTitle : function () {
                return this.creator.selectAllButtonTitle;
            },
            click : function () {
                this.creator.selectAllClick();
            }
        },

        //> @attr MultiPickerItem.deselectAllButtonTitle (String : "Clear All" : IR)
        // Title for the +link{deselectAllButton}
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        deselectAllButtonTitle:"Clear All",

        //> @attr MultiPickerItem.deselectAllWhileFiltered_disabledPrompt (String : "Clear All disabled while filtered" : IRW)
        // Disabled prompt for the +link{deselectAllButton} while filtered if +link{selectAllWhileFiltered} is
        // set to <code>"disable"</code>.
        //
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        deselectAllWhileFiltered_disabledPrompt:"Clear All disabled while filtered",

        //> @attr MultiPickerItem.deselectAllWhileFiltered_partialCachePrompt (String : "Unable to Clear All as the full set of options has not been fetched from the server." : IRW)
        // Disabled prompt for the +link{deselectAllButton} while filtered if +link{selectAllWhileFiltered} is
        // set to <code>"whenLoaded"</code> and the +link{pickList} does not have a complete data set
        // loaded on the client.
        //
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        deselectAllWhileFiltered_partialCachePrompt:"Unable to Clear All as the full set of options has not been fetched from the server.",
        

        
        //> @attr MultiPickerItem.deselectAllButton (ToolStripButton AutoChild : null : IR) 
        // Clear All button +link{type:AutoChild}
        // visibility multiPickerItem
        //<
        deselectAllButtonConstructor:"ToolStripButton",
        deselectAllButtonDefaults : {
            getTitle : function () {
                return this.creator.deselectAllButtonTitle;
            },
            click : function () {
                this.creator.deselectAllClick();
            }
        },


        //> @attr MultiPickerItem.expandIconSrc (String : "[SKINIMG]/actions/expand_right.png" : IR)
        // +link{type:SCImgURL} for the +link{expansionIcon} while not in expanded mode
        // visibility multiPickerItem
        //<
        expandIconSrc:"[SKINIMG]/actions/expand_right.png",

        //> @attr MultiPickerItem.collapseIconSrc (String : "[SKINIMG]/actions/collapse_left.png" : IR)
        // +link{type:SCImgURL} for the +link{expansionIcon} while in expanded mode
        // visibility multiPickerItem
        //<
        // Internal until we have finalized media in the skins dir
        collapseIconSrc:"[SKINIMG]/actions/collapse_left.png",

        //> @attr MultiPickerItem.expansionIcon (ToolStripButton AutoChild : null : IR)
        // Automatically generated expand / collapse icon when +link{canExpand} is true
        // visibility multiPickerItem
        //<
        expansionIconConstructor:"ToolStripButton",
        expansionIconDefaults:{
            iconSize:11,
            prompt:"Click to expand",
            showRollOverIcon:false,
            showDownIcon:false,
            click : function () {
                this.creator.toggleExpansion();
            }
        },

        //> @attr MultiPickerItem.pickListFields (Array of ListGridField : null : IR)
        // Optional list of fields for the +link{multiPickerItem.pickList}.
        // @visibility internal
        //<
        
        
        getPickListFields : function () {
            var plf = this.Super("getPickListFields", arguments);
            return isc.clone(plf);
        },

        //> @attr MultiPickerItem.expandedPickListFields (Array of ListGridField : null : IR)
        // If +link{canExpand} is true, this is the list of fields to display in the 
        // +link{pickList} or +link{pickTree} when the picker is expanded
        // visibility multiPickerItem
        //<
        expandedPickListFields:null,


        //> @attr MultiPickerItem.pickerToolbar (HLayout AutoChild : null : IR)
        // Toolbar autoChild containing the +link{selectAllButton}, +link{deselectAllButton}
        // and +link{expansionIcon}.
        // <P>
        // Shown within the +link{pickerLayout} if +link{selectionStyle} is <code>"pickList"</code>
        // visibility multiPickerItem
        //<
        pickerToolbarConstructor:"HLayout",
        pickerToolbarDefaults:{
            membersMargin:3,
            height:25
        },

        
        //> @attr MultiPickerItem.filterHint (String :"Filter" : IR)
        // +link{TextItem.hint,Hint} for the +link{filterForm} text item.
        // <P>
        // This will be shown inside the field via +link{textItem.showHintInField}
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        filterHint:"Filter",

        //> @attr MultiPickerItem.filterIconSrc (String : "[SKINIMG]actions/view.png" : IR)
        // +link{FormItemIcon.src,src} for the +link{filterIcon}
        // visibility multiPickerItem
        //<
        filterIconSrc:"[SKINIMG]actions/view.png",

        //> @attr MultiPickerItem.filterIconWidth (Integer : 16 : IR)
        // +link{FormItemIcon.width,width} for the +link{filterIcon}
        // visibility multiPickerItem
        //<
        filterIconWidth:16,
        
        //> @attr MultiPickerItem.filterIconHeight (Integer : 16 : IR)
        // +link{FormItemIcon.height,height} for the +link{filterIcon}
        // visibility multiPickerItem
        //<
        filterIconHeight:16,
        
        //> @attr MultiPickerItem.filterIcon (FormItemIcon AutoChild : null : IR)
        // Automatically generated right-aligned inline filter indicator icon 
        // for the +link{filterForm} text box.
        // <P>
        // This icon may be customized using the standard AutoChild pattern as well
        // as via +link{filterIconSrc}, +link{filterIconWidth}, +link{filterIconHeight}
        // 
        // visibility multiPickerItem
        //<
        filterIconDefaults:{
            name: "view",
            hspace: 5,
            inline: true,
            inlineIconAlign:"right",
            baseStyle: "roundedTextItemIcon",
            tabIndex: -1
        },

        //> @attr MultiPickerItem.filterForm (DynamicForm Autochild : null : IR)
        // Dynamic form showing a single text item for filtering the +link{pickList}
        // while +link{selectionStyle} is "pickList" and the pickerLayout is 
        // not +link{canExpand,expanded}.
        // <P>
        // May be hidden by setting +link{showFilterForm} to false.
        // visibility multiPickerItem
        //<
        filterFormConstructor:"DynamicForm",
        
        //> @attr MultiPickerItem.showFilterForm (boolean : true : IR)
        // Should the +link{multiPickerItem.filterForm} be shown?
        // <P>
        // This only applies to selectionStyle "pickList".
        // visibility multiPickerItem
        //<
        showFilterForm:true,

        filterFormDefaults:{
            numCols:1,
            colWidths:"*",
            width:"100%",
            initWidget : function () {
                var filterIcon = isc.addProperties({}, this.creator.filterIconDefaults, this.creator.filterIconProperties);
                if (this.creator.filterIconSrc != null) filterIcon.src = this.creator.filterIconSrc;
                if (this.creator.filterIconWidth != null) filterIcon.width = this.creator.filterIconWidth;
                if (this.creator.filterIconHeight != null) filterIcon.height = this.creator.filterIconHeight;
                
                var items = [
                    {
                        name:"filter", showTitle:false,
                        editorType:"TextItem", 
                        hint:this.creator.filterHint, 
                        showHintInField:true,
                        width:"*",
                        icons:[filterIcon],
                        changed:function (form, item, value) {
                            
                            form.creator.filterPickList(value);
                        }
                    }
                ]
                this.setItems(items);
                return this.Super("initWidget", arguments);
            }
        },

        // Shuttle grid


        //> @attr MultiPickerItem.shuttle (Shuttle AutoChild : null : IR)
        // AutoChild +link{Shuttle} shown in the +link{pickerLayout} when
        // +link{selectionStyle} is set to <code>"shuttle"</code>.
        //
        // visibility multiPickerItem
        //<
        shuttleConstructor:"Shuttle",
        shuttleDefaults : {

            width:"100%",
            height:"*",

            // When the user changes selection, update the item value
            selectionUpdated : function () {
                this.updateItemValue();
            },

            updateItemValue : function () {
                this.creator.pickerSelectionUpdated();
            }        
        },

        // default picker grid

        //> @attr MultiPickerItem.pickList (ListGrid AutoChild : null : IR)
        // The MultiPickerItem <code>pickList</code> is a filterable ListGrid +link{type:AutoChild}
        // for viewing and selecting the list of available options when +link{selectionStyle}
        // is <code>"pickList"</code>.
        // <P>
        // It is rendered inside the +link{pickerLayout} along with the optional +link{selectionList}
        // visibility multiPickerItem
        //<
        // NOTE: This is an autoChild called "pickList" but unlike SelectItem / ComboBoxItem
        // this item is not based around the PickList interface
        
        pickListConstructor:"ListGrid",

        // Standard defaults shared by pickList and pickTree
        
        pickListCommonDefaults : {

            // Override filter.
            // The criteria for the pickList options is assembled by the facade dataSource
            // (see transformRequest).
            // If the pickList ResultSet has any rows in its localData array, but the option
            // criteria have changed we need to explicitly drop that RS cache so we
            // hit the logic in transformRequest and rebuild the set of options
            _filter : function (filterType, criteria, callback, requestProperties) {
                
                var optionCriteria = this.creator.getOptionCriteria();
                var optionDataSource = this.creator.getOptionDataSource();
                var validCacheCriteria;
                
                validCacheCriteria = optionCriteria;
                var dynamicCriteria = this.creator.getExtraOptionCriteria();
                if (dynamicCriteria != null) {
                    validCacheCriteria = optionDataSource.combineCriteria(validCacheCriteria, dynamicCriteria, "and", "substring");
                }

                var value = this.creator.getValue() || [];
                    
                if (this.data && this.data.invalidateCache) {
                    // If our value has changed we need to ensure all the new values are in the
                    // cached data set, even if the other optionCriteria are unchanged
                    if (!value.equals(this._currentValues_forOptionCriteria) ||
                        optionDataSource.compareCriteria(validCacheCriteria, this._currentOptionCriteria) != 0) 
                    {
                        this.data.invalidateCache();
                    }
                }

                this._currentOptionCriteria = validCacheCriteria;
                this._currentValues_forOptionCriteria = value;

                return this.Super("_filter", arguments);
            },


            canShowFilterEditor:false,
            filterOnKeypress:true,
            showHeader:false,

            // Fit to the data
            // autoFitData:"vertical",
            width:"100%",
            height:"*",
            autoFitMaxHeight:300,

            // This method is invoked to have the grid update its selection to match a value
            // being added or removed from the formItem value array
            
            setSelectedByValue : function (value, add) {
                if (value == null) return;
                    
                // If we're "adding" a value, we're making a new modification to
                // our selection, so 'newState' will be !defaultIsSelected
                var newState = this.selectionManager.defaultIsSelected != add;
                if (!isc.isA.Array(value)) value = [value];            
                for (var i = 0; i < value.length; i++) {
                    
                    this.selectionManager.setSelectedByKey(value[i], newState);
                }
                // Note that this may be invoked before our data has arrived
                this.updateSelectionList();
            },

            // Retrieve an array of our explicitly selected (or unselected) values based
            // our explicitly selected (or unselected) records
            getSelectedRecords : function () {
                var selection = this.selectionManager.getSelectionByKeys(true, true);
                // If includeSelectedParents is false, we want to omit the ancestor
                // chain of any selected nodes
                
                if (isc.isA.Tree(this.data)) {
                    var trackAncestors = this.creator.shouldIncludeSelectedParents();
                    if (!trackAncestors) {
                        for (var i = selection.length; i >= 0; i--) {
                            if (this.data.hasChildren(selection[i])) {
                                selection.removeAt(i);
                            }
                        }
                    }
                }

                return selection;
                
            },
            getSelectedValues : function () {

                var selection = this.getSelectedRecords();
                var result = [];

                for (var i = 0; i < selection.length; i++) {
                    result.add(selection[i][this.targetField]);
                }
                return result;
            },
            
            dataArrived : function () {
                this.updateSelectionList();
                this.creator.updateSelectAllButtons();
                return this.Super("dataArrived", arguments);
            },
            updateSelectionList : function () {

                if (this.creator.showSelectionList) {
                    var modifiedRecords = this.getSelectedRecords();
                    if (modifiedRecords.length > 0) {
                        if (this.creator.selectionListLabel) this.creator.selectionListLabel.show();
                        var criterionArr = [];
                        for (var i = 0; i < modifiedRecords.length; i++) {
                            criterionArr.add(modifiedRecords[i][this.creator.getValueFieldName()]);
                        }
                        var selectedRecordsCriteria = {
                            operator:"inSet",
                            value:criterionArr,
                            fieldName:this.creator.getValueFieldName()
                        }
                        this.creator.selectionList.fetchData(selectedRecordsCriteria, null, {selectedRecords:modifiedRecords});
                        this.creator.selectionList.show();
                    } else {

                        if (this.creator.selectionListLabel) this.creator.selectionListLabel.hide();
                        this.creator.selectionList.hide();
                    }
                }
            },
            // When the user changes selection, update the item value
            selectionUpdated : function () {
                
                this.updateItemValue();
                this.updateSelectionList();
            },

            updateItemValue : function () {
                this.creator.pickerSelectionUpdated();
            }        
        },

        // Support pickListDefaults / pickList properties via standard autoChild pattern
        pickListDefaults : {
        },

        //> @attr MultiPickerItem.pickTree (TreeGrid AutoChild : null : IR)
        // The MultiPickerItem <code>pickTree</code> is a TreeGrid +link{type:AutoChild}
        // for viewing and selecting a tree of available options when +link{selectionStyle}
        // is <code>"pickTree"</code>.
        // <P>
        // It is rendered inside the +link{pickerLayout} along with the optional +link{selectionList}
        // visibility multiPickerItem
        //<
        pickTreeConstructor:"TreeGrid",
        pickTreeDefaults : {
            autoOpenTree:"all",
            loadDataOnDemand:false,

            
            // dataFetchMode:"local",
            keepParentsOnFilter:true
        },

        getPickListComponent : function () {
            return this._usePickTree() ? this.pickTree : this.pickList;
        },
        

        // Layout containing the pickList et al

        //> @attr MultiPickerItem.pickerLayout (VLayout AutoChild : null : IR)
        // Main dropdown picker layout containing the +link{pickList} or +link{shuttle}.
        // visibility multiPickerItem
        //<
        pickerLayoutConstructor:"VLayout",
        pickerLayoutDefaults:{
            layoutMargin:5,
            overflow:"hidden",
            styleName:"multiPickerLayout",
            hide : function () {
                this.Super("hide", arguments);
                this.creator.pickerHidden();
            }
        },

        // Grid of selected (or unselected) records below the picker grid

        //> @attr MultiPickerItem.showSelectionLabel (Boolean : true : IR)
        // Should we show a +link{selectionListLabel} for the 
        // +link{selectedSelectionListTitle} above the +link{selectionList}.
        // <P>
        // Will never be shown if +link{showSelectionList} is false
        // or if selectionStyle is not "pickList".
        // visibility multiPickerItem
        //<
        showSelectionListLabel:true,

        //> @attr MultiPickerItem.selectionListLabel (Label AutoChild : null : IR)
        // AutoChild to show the +link{selectedSelectionListTitle}
        // visibility multiPickerItem
        //<
        selectionListLabelConstructor:"Label",
        selectionListLabelDefaults:{
            height:25,
            valign:"bottom",
            padding:3,
            dynamicContents:true,
            contents:"${this.creator.getSelectionListTitle()}"
        },

        //> @attr MultiPickerItem.unselectedSelectionListTitle (String : "Excluded Items" : IR)
        // Title for the +link{selectionList} if +link{useUnselectedValues} is true
        // @group i18nMessages
        // @visibility internal
        //<
        // Expose this at the SetFilterItem level where useUnselectedValues is exposed/enabled
        unselectedSelectionListTitle:"Excluded Items",

        //> @attr MultiPickerItem.selectedSelectionListTitle (String : "Inclued Items" : IR)
        // Default title for the +link{selectionList}.
        // @group i18nMessages
        // visibility multiPickerItem
        //<
        // Will toggle to unselectedSelectionListTitle if useUnselectedValues is true
        selectedSelectionListTitle:"Included Items",
        getSelectionListTitle : function () {
            return this.useUnselectedValues ? this.unselectedSelectionListTitle : this.selectedSelectionListTitle;
        },

        //> @attr MultiPickerItem.showSelectionList (Boolean : true : IR)
        // Should a +link{selectionList,list of selected items} be displayed below
        // the +link{pickList} if +link{selectionStyle} is <code>"pickList"</code>?
        // visibility multiPickerItem
        //<
        showSelectionList:true,

        //> @attr MultiPickerItem.selectionList (ListGrid AutoChild : null : IR)
        // Automatically generated ListGrid displaying the current selection
        // for +link{selectionStyle,selectionStyle:"pickList"}.
        // <P>
        // Has +link{listGrid.canRemoveRecords,canRemoveRecords} enabled as an
        // alternative UI for deselecting records to unchecking the item in the
        // +link{pickList}.
        // visibility multiPickerItem
        //<
        selectionListConstructor:"ListGrid",
        selectionListDefaults : {
            
            showHeader:false,
            autoFitData:"vertical",
            height:1,
            autoFitMaxHeight:150,
            selectionType:"none",
            canRemoveRecords:true,
            removeRecordClick:function (rowNum) {
                var sourceRecord = this.getRecord(rowNum),
                    value = sourceRecord[this.targetField];

                var pickList = this.creator.getPickListComponent();
                
                pickList.setSelectedByValue(value, false);
                pickList.updateItemValue();
            }
        },

        // filterPickList() method to filter the pickList based on the value in 
        // the filterForm
        
        
        filterPickList : function (value) {
            var pickList = this.getPickListComponent();
            if (!pickList) return;

            var criteria;
            if (value != null) {
                var filterField = this.getDisplayFieldName() || this.getValueFieldName();
                criteria = {};
                criteria[filterField] = value;
                
            }
            pickList.filterData(criteria);
            this.updateSelectAllButtons();
        },

        // Updates Select All / Clear as the user filters the pickList or 
        // data is loaded from the server.
        updateSelectAllButtons : function () {

            var pickList = this.getPickListComponent();
            if (!pickList) return; // unused for shuttle view

            var criteria = pickList.getCriteria(),
                emptyCriteria = criteria == null || isc.isA.emptyObject(criteria),
                isFiltered = !emptyCriteria;

            // Always disable if we're filtered and the flag is set to disable while filtered
            if (this.selectAllWhileFiltered == "disable" && isFiltered) {

                this.selectAllButton.setPrompt(this.selectAllWhileFiltered_disabledPrompt);
                this.selectAllButton.setDisabled(true);
                this.deselectAllButton.setPrompt(this.deselectAllWhileFiltered_disabledPrompt);
                this.deselectAllButton.setDisabled(true);

            } else {

                // If selectAllWhileFiltered is "all" we'll act upon the entire
                // data set (including unfiltered rows), even if we're filtered
                if (this.selectAllWhileFiltered == "all") {
                    emptyCriteria = true;
                }

                // If we're acting on entire data set toggleUseUnselected... is true
                // we can always SelectAll / Clear All
                if (emptyCriteria && this.toggleUseUnselectedValuesOnSelectAll) {

                    this.selectAllButton.setPrompt(null);
                    this.deselectAllButton.setPrompt(null);
                
                    this.selectAllButton.setDisabled(false);
                    this.deselectAllButton.setDisabled(false);

                // If we're acting on a filtered list of data, or we can't
                // toggle useUnselectedValues, we can only explicitly select (or unselect)
                // all loaded records
                } else {
                    
                    // (If we're showing a picktree the data object won't be a ResultSet)
                    var hasFullData = !isc.isA.ResultSet(pickList.data) ||
                                        (emptyCriteria ? pickList.data.allRowsCached() 
                                                       : pickList.data.allMatchingRowsCached());

                    

                    this.selectAllButton.setDisabled(!hasFullData);
                    this.selectAllButton.setPrompt(!hasFullData ? this.selectAllWhileFiltered_partialCachePrompt : null);
                    this.deselectAllButton.setDisabled(!hasFullData);
                    this.deselectAllButton.setPrompt(!hasFullData ? this.deselectAllWhileFiltered_partialCachePrompt : null);
                
                }
            }
        },

        // optional expanded picker grid

        //> @attr MultiPickerItem.canExpand (Boolean : true : IR)
        // Should we show an +link{multiPickerItem.expansionIcon} expand button allowing the user
        // to show an expanded view of the +link{multiPickerItem.pickList} with multiple fields.
        // <P>
        // <code>canExpand</code> only applies to MultiPickerItems with selectionStyle
        // set to "pickList" or "pickTree" and an explicitly specified set 
        // of +link{multiPickerItem.expandedPickListFields}
        // to display within the expanded view.
        //
        // visibility multiPickerItem
        //<
        canExpand:true,
        shouldShowExpansionIcon : function () {
            return this.canExpand && this.expandedPickListFields != null;
        },

        // Wireframe used for animated expand/collapse only
        wireFrameDefaults:{
            styleName:"resizeWireFrame"
        },

        // Current expanded state - not exposed
        expanded:false,
        toggleExpansion : function () {
            var pickList = this.getPickListComponent();
            if (!pickList) return;

            var wasExpanded = this.expanded;
            this.expanded = !wasExpanded;

            this.expansionIcon.setIcon(this.expanded ? this.collapseIconSrc : this.expandIconSrc);
            if (!this.pickerLayout.isDrawn() || !this.pickerLayout.isVisible()) {
                this.completeToggleExpansion();
                return;
            }

            var pickerLeft = this.getPageLeft(),
                pickerWidth = this.getPickListWidth();
            var rightOverflow = (pickerLeft + pickerWidth) - isc.Page.getWidth();
            if (rightOverflow > 0) {
                pickerLeft -= rightOverflow
            }

            var targetRect = [
                pickerLeft,
                this.getPageTop() + this.getHeight(),
                pickerWidth,
                this.getPickListHeight() 
            ];
            if (!this.pickerLayout.isBelow) {
                targetRect[1] -= (this.getHeight() + targetRect[3])
            }
                    
            if (this.expanded) {
                var currentLeft = targetRect[0];
                var currentTop = targetRect[1];
                var pageWidth = isc.Page.getWidth(),
                    pageHeight = isc.Page.getHeight();

                if (pageWidth < (this.expansionWidth + currentLeft)) {
                    targetRect[0] = pageWidth - this.expansionWidth;
                }
                targetRect[2] = this.expansionWidth;

                if (!this.pickerLayout.isBelow) {
                    targetRect[1] -= (this.expansionHeight - targetRect[3]);
                    if (targetRect[1] < 0) targetRect[1] = 0;
                }
                targetRect[3] = this.expansionHeight;

                if (pageHeight < (targetRect[3] + targetRect[1])) {
                    targetRect[1] = pageHeight - this.expansionHeight;
                }
            }
            
            if (this.wireFrame == null) {
                this.wireFrame = this.createAutoChild("wireFrame");
            }
            this.wireFrame.setRect(this.pickerLayout.getPageRect());
            this.wireFrame.bringToFront();
            this.wireFrame.show();
            this.wireFrame.animateRect(
                targetRect[0], targetRect[1], targetRect[2], targetRect[3],
                {target:this, methodName:"expansionResizeComplete"}                
            );
        },
        expansionResizeComplete : function () {
            
            this.wireFrame.hide();
            this.pickerLayout.setPageRect(this.wireFrame.getPageRect());
            this.completeToggleExpansion();
        },
        completeToggleExpansion : function () {

            if (this.showFilterForm) this.filterForm.setVisibility(this.expanded ? "hidden" : "inherit");

            var resetFilter = false; displayFilter;
            var pickList = this.getPickListComponent();

            if (!this.expanded && pickList.showFilterEditor) {
                resetFilter = true; // can be more sophisticated than this
                var displayFilter = pickList.filterEditor.getEditForm().getValue(this.getDisplayFieldName());
            }
            pickList.setShowHeader(this.expanded);
            if (this.showFilterForm) pickList.setShowFilterEditor(this.expanded);

            pickList.setFields(this.expanded ? this.expandedPickListFields : this.getPickListFields());

            if (resetFilter) {
                if (this.filterForm) this.filterForm.setValue("filter", displayFilter);
                this.filterPickList(displayFilter);
            }

            // reconsider autoFitMaxHeight?

        },

        // showFilterList() method to show our picker UI
        showFilterList : function () {

            if (this.pickerLayout == null) {

                this.pickerLayout = this.createAutoChild("pickerLayout");
                // could set minBreadthMember:this.pickList if we want to size to the grid
                
                var valueField = this.getValueFieldName();
                if (this.selectionStyle != "shuttle") {
                    // pickList or pickTree
                    this.selectAllButton = this.createAutoChild("selectAllButton");
                    this.deselectAllButton = this.createAutoChild("deselectAllButton");
                    var toolbarMembers = [
                        this.selectAllButton,
                        this.deselectAllButton
                    ]

                    if (this.shouldShowExpansionIcon()) {
                        this.expansionIcon = this.createAutoChild("expansionIcon", {icon:this.expandIconSrc});
                        toolbarMembers.addList([
                            isc.LayoutSpacer.create({width:"*"}),
                            this.expansionIcon
                        ]);
                    }
                    
                    this.pickerToolbar = this.createAutoChild("pickerToolbar", {
                        members:toolbarMembers
                    })

                    // Multi-Field filter form
                    if (this.showFilterForm) this.filterForm = this.createAutoChild("filterForm");
                    
                    // picker grid for selecting values
                    var pickList;
                    if (this._usePickTree()) {
                        var _this = this;
                        var dynamicDefaults = isc.addProperties(
                            {}, 
                            // Standard properties for pickList or pickTree.
                            this.pickListCommonDefaults, 
                            {

                                // Customizations to selection to support toggling defaultIsSelected and
                                // tracking selection outside the current data set by key values
                                selectionAppearance:"checkbox",
                                showSelectedStyle:false,

                                showPartialSelection:true,
                                cascadeSelection:this.shouldCascadeSelection(),
                                canSelectRecord : function(record) {
                                    if (!_this.canSelectFolders && this.data.isFolder(record)) return false;
                                    return this.Super("canSelectRecord", arguments);
                                },

                                showDisabledSelectionCheckbox:false,
                                leaveSelectionCheckboxGap:false,

                                
                                selectionManagerProperties:{
                                    defaultIsSelected:this.useUnselectedValues,
                                    trackByKey:true,
                                    trackUnloadedItems:true,
                                    
                                    keyField:this.getValueFieldName()

                                },
                                
                                targetField:valueField,
                                dataSource:this.getPickerDataSource(),
                                fields:this.getPickListFields()
                            }
                        );
                        if (this.initialSort != null) dynamicDefaults.initialSort = this.initialSort;
                        if (this.sortField != null) dynamicDefaults.sortField = this.sortField;
                        if (this.sortDirection != null) dynamicDefaults.sortDirection = this.sortDirection;
                            
                        pickList = this.pickTree = this.createAutoChild("pickTree", dynamicDefaults);

                        
                        this.showFilterForm = false;

                    } else {

                        // selectionStyle should be pickList

                        var dynamicDefaults = isc.addProperties(
                            {}, 
                            // Standard properties for pickList or pickTree.
                            this.pickListCommonDefaults, 
                            {

                                // Customizations to selection to support toggling defaultIsSelected and
                                // tracking selection outside the current data set by key values
                                selectionAppearance:"checkbox",
                                selectionManagerProperties:{
                                    defaultIsSelected:this.useUnselectedValues,
                                    trackByKey:true,
                                    trackUnloadedItems:true,
                                    
                                    keyField:this.getValueFieldName()

                                },
                                
                                targetField:valueField,
                                dataSource:this.getPickerDataSource(),
                                fields:this.getPickListFields()
                            }
                        );
                        if (this.initialSort != null) dynamicDefaults.initialSort = this.initialSort;
                        if (this.sortField != null) dynamicDefaults.sortField = this.sortField;
                        if (this.sortDirection != null) dynamicDefaults.sortDirection = this.sortDirection;

                        pickList = this.pickList = this.createAutoChild("pickList", dynamicDefaults);

                    }

                    var pickerLayoutMembers = [
                        this.pickerToolbar
                    ];
                    if (this.showFilterForm) {
                        pickerLayoutMembers.add(this.filterForm);
                    }
                    pickerLayoutMembers.add(pickList);
                    this.pickerLayout.setMembers(pickerLayoutMembers);

                    if (this.showSelectionList) {

                        if (this.showSelectionListLabel) {
                            this.selectionListLabel = this.createAutoChild("selectionListLabel");
                            this.pickerLayout.addMember(this.selectionListLabel);
                        }
                        var selectionListDefaults = {
                            dataSource:this.getPickerDataSource(),
                            fetchOperation:"selectedItemsFetch",
                            fields:this.getPickListFields(),
                            targetField:valueField
                        };
                        // If we're sorting our pickList, sort our selection list too!
                        if (this.initialSort != null) selectionListDefaults.initialSort = this.initialSort;
                        if (this.sortField != null) selectionListDefaults.sortField = this.sortField;
                        if (this.sortDirection != null) selectionListDefaults.sortDirection = this.sortDirection;

                        this.selectionList = this.createAutoChild("selectionList", selectionListDefaults);
                        this.pickerLayout.addMember(this.selectionList);
                    }

                } else {

           
                    this.shuttle = this.createAutoChild("shuttle", {
                        // Pass sort through to the shuttle.
                        initialSort:this.initialSort,
                        sortField:this.sortField,
                        sortDirection:this.sortDirection,
 
                        sourceGridProperties:{
                            // As with our pickList: Override filter - if our option 
                            // criteria have changed we have to invalidate
                            // cache as we'll get different "server data" back
                            
                            setImplicitCriteria : function (criteria, callback, initialFetch) {
                                var hasFetched = this.dataObjectSupportsFilter(this.data);
                                var ds = this.getDataSource();
                                if (ds && (initialFetch || hasFetched)) {
                                    var combinedCriteria = ds.combineCriteria(this.getCriteria(), criteria);
                                    this.checkForOptionCriteriaChange(combinedCriteria);
                                }
                                return this.Super("setImplicitCriteria", arguments);
                            },
                            _filter : function (filterType, criteria, callback, requestProperties) {
                                this.checkForOptionCriteriaChange(criteria);
                                return this.Super("_filter", arguments);
                            },

                            checkForOptionCriteriaChange : function (criteria) {
                                if (!this.data || !this.data.invalidateCache) return;

                                var shuttle = this.creator;
                                var mpi = shuttle.creator;
                                var optionCriteria = mpi.getOptionCriteria();
                                var optionDataSource =  mpi.getOptionDataSource();
                                if (optionDataSource && !this.willFetchData(criteria)) {
                                    if (optionDataSource.compareCriteria(optionCriteria, this._currentOptionCriteria) != 0) {
                                        this.data.invalidateCache();
                                    }
                                }
                                this._currentOptionCriteria = optionCriteria;
                            }
                        },
                        targetField:valueField,
                        dataSource:this.getPickerDataSource(),
                        fields:this.getPickListFields()
                    });
                    this.pickerLayout.addMember(this.shuttle);
                }
            }

            this._refreshFilterList(true);

            // We'll set the selection below [setSelectedByValue()] as the
            // form item's value may have updated since the picker was last shown
            var pickList = this.getPickListComponent();

            // Size and position the picker layout
            var itemHeight = this.getHeight(),
                pickerTop = this.getPageTop() + itemHeight,
                pickerHeight = this.getPickListHeight();
            var isBelow = true;
            if (pickerTop + pickerHeight > isc.Page.getHeight() && (pickerTop - (pickerHeight+itemHeight) > 0)) {
                pickerTop -= (pickerHeight + itemHeight);
                isBelow= false;
            }
            this.pickerLayout.isBelow = isBelow;

            var pickerLeft = this.getPageLeft(),
                pickerWidth = this.getPickListWidth();
            var rightOverflow = (pickerLeft + pickerWidth) - isc.Page.getWidth();
            if (rightOverflow > 0) {
                pickerLeft -= rightOverflow
            }

            this.pickerLayout.setRect(pickerLeft, pickerTop, pickerWidth, pickerHeight);
            var _picker = this.pickerLayout;
            this.pickerLayout.show();

            // ClickMask - dismiss the pickerLayout on outside click
            if (!this.pickerLayout.clickMaskUp()) {
                this.pickerLayout.showClickMask(
                    function () {
                        _picker.hide();
                    },
                    
                    "softCancel"
                );
            }
            this.pickerLayout.bringToFront();

        },
        _refreshFilterList : function (refetchData) {
            this._refreshingFilterList = true;
            var pickList = this.getPickListComponent();
            if (pickList) {
                pickList.selection.clearSelection(true);

                if (refetchData) {
                    if (this.filterForm) this.filterForm.clearValues();
                    pickList.fetchData();
                }
                // call setSelectedByValue after calling fetchData() this created the
                // ResultSet for the picker grid
                // This will cause the picker to select the appropriate values
                // Because we're tracking selection by key we can do this before the data has been loaded.
                var value = this.getValue();
                if (value != null) {
                    pickList.setSelectedByValue(value, true);
                } else {
                    // ensure the selection list is hidden if we just cleared the selection here
                    pickList.updateSelectionList();
                }
                pickList.markForRedraw();

            } else if (this.shuttle) {
                this.shuttle.clearSelection();
                this.shuttle.setSelectedByValue(this.getValue(), true);
            }
            delete this._refreshingFilterList;
        },

        // If we don't have a value, reset our "useUnselectedValues" flag to the default so next
        // time the picker is shown it appears fully selected or fully unselected as the user expects
        pickerHidden : function () {
            if (this.expanded) this.toggleExpansion();
            if (this.toggleUseUnselectedValuesOnSelectAll && this.defaultUseUnselectedValues != null &&  
                (this.getValue() == null || this.getValue().length == 0) )
            {
                this.setUseUnselectedValues(this.defaultUseUnselectedValues);
            }
            this.focusInItem();
        },

        // Select All / Deselect All click
        // Toggle the default from include to exclude (or vice versa) and clear our vals
        selectAllClick : function () {

            var pickList = this.getPickListComponent();
            if (!pickList) return; // unused in shuttle view

            var toggleUseUnselectedValues = this.toggleUseUnselectedValuesOnSelectAll;
            if (toggleUseUnselectedValues) {
                var criteria = pickList.getCriteria();
                if (criteria != null && !isc.isA.emptyObject(criteria)) {
                    if (this.selectAllWhileFiltered != "all") {
                        toggleUseUnselectedValues = false;
                    }
                }
            }
            if (toggleUseUnselectedValues) {
                // This handles clearing the current selection and toggling the default
                // if necessary
                this.setUseUnselectedValues(true);

            } else {

                // Only SelectAll if we have a full data set.
                
                var pickList = this.getPickListComponent();
                var data = pickList.data;
                var isRS = isc.ResultSet && isc.isA.ResultSet(data);
                if (data && (!isRS || data.allMatchingRowsCached())) {
                    if (isc.Tree && isc.isA.Tree(data) && !this.canSelectFolders) {
                        var nodes = data.getDescendantLeaves(data.getRoot());
                        pickList.selection.selectList(nodes);
                    } else {
                        pickList.selection.selectAll();
                    }
                    pickList.updateItemValue();
                    pickList.updateSelectionList();

                } else {
                    isc.warn("Some records have not been loaded - unable to select all");
                }
            }
        },

        deselectAllClick : function () {

            var pickList = this.getPickListComponent();
            if (!pickList) return; // unused in shuttle view

            var toggleUseUnselectedValues = this.toggleUseUnselectedValuesOnSelectAll;
            if (toggleUseUnselectedValues) {
                var criteria = pickList.getCriteria();
                if (criteria != null && !isc.isA.emptyObject(criteria)) {
                    if (this.selectAllWhileFiltered != "all") {
                        toggleUseUnselectedValues = false;
                    }
                }
            }
            if (toggleUseUnselectedValues) {
                this.setUseUnselectedValues(false);
            } else {
                var data = pickList.data;
                if (isc.Tree && isc.isA.Tree(data) && !this.canSelectFolders) {
                    var nodes = data.getDescendantLeaves(data.getRoot());
                    pickList.selection.deselectList(nodes);
                } else {
                    pickList.selection.deselectAll();
                }
                pickList.updateItemValue();
                pickList.updateSelectionList();
            }
        },

        pickerSelectionUpdated : function () {
            if (this._refreshingFilterList) return; // don't react to selection changes while we're updating the PL to match our value!
            var grid = this.selectionStyle == "shuttle" ? this.shuttle : this.getPickListComponent();
            this.storeValue(grid.getSelectedValues(), true);
        },

        // On programmatic setValue() ensure our pickList refreshes if its visible
        setValue : function () {
            this.Super("setValue", arguments);

            // update the UI
            if (this.pickerLayout && this.pickerLayout.isVisible()) {
                // this.logWarn("Refreshing filter list from setValue() call");
                this._refreshFilterList();
                var pickList = this.getPickListComponent();
                if (pickList) {
                    pickList.updateSelectionList();
                }
            }
        }



    });


} else {
    
    

    // If grids and shuttles aren't loaded we can't do anything helpful. Define the class as
    // a subclass of STI so we don't get an outright crash when we define SetFilterItem, or if a dev has
    // an MPI in their code.
    isc.Log.logWarn("Source for standard MultiPickerItem class included in this module, but required " +
        "related class (ListGrid) is not loaded. This can occur if the Forms module is " +
        "loaded without the Grids module. MultiPickerItem class, and classes inheriting from this such as SetFilterItem " +
        "will be defined as a simple subclass of StaticTextItem.", "moduleDependencies");

    isc.ClassFactory.defineClass("MultiPickerItem", "StaticTextItem");

}


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
//> @class SetFilterItem
// Specialized +link{MultiPickerItem} for generating +link{type:OperatorId,inSet and notInSet}
// filter criteria from a set of possible values.
// <P>
// In addition to supporting an explicit +link{MultiPickerItem.valueMap,valueMap} or 
// +link{MultiPickerItem.optionDataSource,optionDataSource}, the SetFilterItem may be used 
// directly with either a +link{SetFilterItem.sourceList,list of records} or a 
// +link{SetFilterItem.filterTargetComponent,target databound component}.
// <P>
// If the target list has a complete set of data, the SetFilterItem can derive its options from
// this data without the need for an extra dataSource fetch. If the options are derived
// from a databound list and the set of data is incomplete (due 
// to +link{resultSet.fetchMode,data paging}), the SetFilterItem will derive its
// default optionDataSource, criteria, and fetch operation from the list.
// <P>
// Note that +link{SetFilterItem.deriveUniqueValues} defaults to <code>true</code> for setFilterItems,
// and this setting is supported even if options are being derived from a source list
// without any actual fetch operation.
// <P>
// When a SetFilterItem is used as a +link{listGridField.filterEditorType,ListGrid filterEditor},
// the filterTargetComponent will automatically be set to the grid being filtered.
// 
// @treeLocation Client Reference/Forms/Form Items
//
// @inheritsFrom MultiPickerItem
// visibility multiPickerItem
//<
isc.defineClass("SetFilterItem", "MultiPickerItem");

isc.SetFilterItem.addProperties({

    //> @attr SetFilterItem.selectionStyle (MultiPickerSelectionStyle : "pickList" : IR)
    // selectionStyle:"shuttle" is not supported for SetFilterItem
    // visibility multiPickerItem
    //<
    
    selectionStyle:"pickList",

    //> @attr SetFilterItem.toggleUseUnselectedValuesOnSelectAll (Boolean : true : IRA)
    // Should this item toggle between tracking selected options and using them to
    // generate "inSet" criteria and unselected options and using them to generate
    // "notInSet" criteria when the user clicks the +link{multiPickerItem.selectAllButton} and
    // +link{multiPickerItem.deselectAllButton} on an unfiltered list of options.
    // <P>
    // See +link{useUnselectedValues} for more detail
    // visibility multiPickerItem
    //<
    toggleUseUnselectedValuesOnSelectAll:true,

    //> @attr SetFilterItem.useUnselectedValues (Boolean : true : IRW)
    // The SetFilterItem has the capability to treat its set of options as 
    // selected by default, and explicitly track the options a user has unselected, or
    // treat them as unselected by default and explicitly track the user-selected objects.
    // This attribute denotes whether the item is currently tracking explicitly 
    // selected or unselected values.
    // <P>
    // While tracking selected values, this item will generate 
    // +link{selectedOperator,inSet} criteria. While tracking unselected values, it
    // will generate +link{unselectedOperator,notInSet} criteria.
    // <P>
    // If +link{toggleUseUnselectedValuesOnSelectAll} is true, if the current set of options
    // is unfiltered, the +link{multiPickerItem.selectAllButton} and +link{multiPickerItem.deselectAllButton} will
    // clear any current value and toggle useUnselectedValues - effectively switching
    // between tracking inclusive (inSet) values and exclusive (notInSet) values.
    //
    // visibility multiPickerItem
    //<
    useUnselectedValues:true,

    //> @attr SetFilterItem.defaultUseUnselectedValues (Boolean : true : IRA)
    // Should this item track unselected or selected values by default?
    // <P>
    // If +link{toggleUseUnselectedValuesOnSelectAll}, for setFilterItems with no
    // current criteria (I.E. no explicitly selected or 
    // unselected values), this property will be evaluated when the pickList is 
    // shown and +link{useUnselectedValues} will be set to match this value.
    // This causes the options in the pickList to always show up checked (or
    // unchecked) by default, matching user expectations of what an "empty" filter
    // represents.
    // <P>
    // May be set to null, in which case useUnselectedValues will not be modified
    // when the pickList is shown for an empty SetFilterItem
    // visibility multiPickerItem
    //<
    defaultUseUnselectedValues:true,

    //> @attr SetFilterItem.selectedOperator (OperatorId : "inSet" : IRA)
    // Operator for the criteria generated by this item when +link{useUnselectedValues} is 
    // false.
    // visibility multiPickerItem
    //<
    selectedOperator:"inSet",
    
    //> @attr SetFilterItem.unselectedOperator (OperatorId : "notInSet" : IRA)
    // Operator for the criteria generated by this item when +link{useUnselectedValues} is 
    // true.
    // visibility multiPickerItem
    //<
    unselectedOperator:"notInSet",

    //> @attr SetFilterItem.deriveUniqueValues (Boolean : true : IRA)
    // @include MultiPickerItem.deriveUniqueValues
    // visibility multiPickerItem
    //<
    deriveUniqueValues:true,

    //> @attr SetFilterItem.canExpand (Boolean : false : IR)
    // @include MultiPickerItem.canExpand
    // visibility multiPickerItem
    //<

    //> @attr SetFilterItem.expandedPickListFields (Array of ListGridField : null : IR)
    // @include MultiPickerItem.expandedPickListFields
    // visibility multiPickerItem
    //<

    //> @attr SetFilterItem.sourceList (Array of Record | Tree | ResultSet : null : IRA)
    // If specified, this picker will derive its set of options from this list of records.
    // <P>
    // Note that if the <code>sourceList</code> list is a ResultSet that has not
    // got a complete +link{ResultSet.allMatchingRowsCached(),cache of data} for its
    // criteria, options will be derived by performing a fetch against the resultSet's
    // dataSource.
    // visibility multiPickerItem
    //<
    

    //> @attr SetFilterItem.filterTargetComponent (DataBoundComponent : null : IR)
    // Target component for which this SetFilterItem is generating criteria.
    // By default the +link{sourceList} will be the +link{listGrid.data,data object}
    // for the target component, and the option dataSource, option criteria, option
    // fetch operation and so on will be derived from the target component's configuration.
    // <P>
    // For a setFilterItem embedded in a +link{listGrid.showFilterEditor,filter editor},
    // this will be the target listGrid.
    //
    // visibility multiPickerItem
    //<

    getSourceList : function () {
        if (this.sourceList != null) return this.sourceList;
        if (this.filterTargetComponent != null) {
            return this.filterTargetComponent.data;
        }
        return this.Super("getSourceList", arguments);
    },
    
    showFilterList : function () {
        var sendQueue = false;
        if (isc.isA.ListGrid(this.filterTargetComponent) && 
            this.filterTargetComponent.filterEditor != null) 
        {
            if (this.filterTargetComponent.filterEditor.pendingActionOnPause("performFilter")) {
                // this.logWarn("Performing immediate filter on target component:" + this.filterTargetComponent);
                sendQueue = !isc.RPCManager.startQueue();
                this.filterTargetComponent.filterEditor.performFilter(null, null, null, true);
            }
        }
        this.Super("showFilterList", arguments);
        if (sendQueue) isc.RPCManager.sendQueue();
    },

    // setFilterItem may be used with an explicit filterTargetComponent 
    // In this mode, the set of options displayed are derived from the target component as follows:
    // - pick up implicitCriteria from the filterTargetComponent if we have one
    // - remove any criteria applied *by this item* to the filterTargetComponent's criteria
    //   so our value doesn't impact the available options for further filtering.
    //   [Note - this may be disabled via the undocumented clearComponentTargetFieldCriteria flag]
    // - ensure any explicitly selected values are present in the pickList options
    //
    // The selectionList, if visible, will show the list of selected values.
    // If this needs to be fetched from the server [because deriveUniqueValues is false and
    // we're showing multiple fields], the criteria to retrieve these items will be
    // - implicitCriteria from the filterTargetComponent (required to ensure we're not doing
    //   an unrestrictied fetch against the target DS)
    // - an inSet criteria for the currently selected values.
    // Override getOptionCriteria and getExtraOptionCriteria to handle this.
    clearComponentTargetFieldCriteria:true,
    shouldGetCriteriaFromFilterTarget : function () {
        return this.optionCriteria == null && this.filterTargetComponent != null
    },
    // Base criteria applied to both the pickList and the selectionList
    getOptionCriteria : function () {

        if (this.shouldGetCriteriaFromFilterTarget()) {
            return this.filterTargetComponent.getImplicitCriteria(true);

        } else if (this.optionCriteria != null) {
            return this.optionCriteria;
        }

        return this.Super("getOptionCriteria", arguments);
    },
    // Additional criteria to restrict options displayed in the pickList
    getExtraOptionCriteria : function () {
        
        if (!this.shouldGetCriteriaFromFilterTarget()) return this.Super("getExtraOptionCriteria");

        var dataSource = this.getOptionDataSource();


        

        // copyCriteria does a recursive clone so it's safe to manipulate this object without
        // impacting the grid.
        var criteria = isc.DataSource.copyCriteria(this.filterTargetComponent.getCriteria());

        // Assertion: if we have ever contributed to the component's criteria, we expect to see
        // an AC with top-level "and", plus a single entry for the target field that is either inSet or 
        // notInSet
        // Yank this out to get the criteria, without whatever we contributed!
        
        if (this.clearComponentTargetFieldCriteria && 
            criteria && criteria._constructor == "AdvancedCriteria" && 
            criteria.operator == "and" && criteria.criteria) 
        {
            var subcriteria = criteria.criteria;
            for (var i = 0; i < subcriteria.length; i++) {
                if (this.canEditCriterion(subcriteria[i])) {
                    subcriteria.removeAt(i);
                    break;
                }
            }
        }
        // Pick up any filterWindow target criteria
        var textMatchStyle = this.filterTargetComponent.autoFetchTextMatchStyle   
        if (this.filterTargetComponent.getFilterWindowCriteria) {
            var filterWindowCriteria = this.filterTargetComponent.getFilterWindowCriteria();
            if (filterWindowCriteria != null) {
                criteria = dataSource.combineCriteria(implicitCriteria, criteria, null, textMatchStyle);
            }
        }
    
        //this.logWarn("Calculated extra optionCriteria for filterTargetComponent:" + isc.JSON.encode(optionCriteria));
        return criteria;

    },

    // Override getSourceListFilterContext to look directly at our target component's 
    // dataProperties.requestProperties if it has not yet created its ResultSet data object.
    getSourceListFilterContext : function () {
        
        var dataObject = this.getSourceList(),
            component = this.filterTargetComponent;
        
        if (component != null && 
            (dataObject == null || (dataObject.context == null && dataObject.requestProperties == null))) 
        {
            var dataProps = component.dataProperties;
            if (dataProps != null && dataProps.requestProperties != null) {
                return dataProps.requestProperties;
            }
        }
        return this.Super("getSourceListFilterContext", arguments);

    },

    getDisplayFieldName : function () {
        // If we defaulted the valueFieldName to optionDS.primaryKey,
        // ensure we also modify the displayField to display the
        // values for the field to which the filterEditor is applied!
        if (this.filterByPrimaryKey && this.valueField == null && this.displayField == null) 
        {
            return this.name;
        }
        return this.Super("getDisplayFieldName", arguments);        
    },


    getValueFieldName : function () {
        if (this.valueField != null) return this.valueField;

        // If filterByPrimaryKey is true, default to using the ds primary key
        // to identify records in our pickList selection, and as the criteria
        // fieldName
        
        if (this._usePickTree() && this.filterByPrimaryKey) {
            var ds = this.getOptionDataSource(),
                pk = ds && ds.getPrimaryKeyFieldName();
            
            if (pk != null) return pk;
        }


        
        if (this.filterTargetComponent != null) {
            return this.name;
        }
        return this.Super("getValueFieldName", arguments);
    },

    
    init : function (defaults, a, b, c) {

        if (this.isInGrid()) {
            var grid = this.getListGrid();
            var isFilterEditor = (isc.isA.RecordEditor(grid) && grid.sourceWidget && grid.sourceWidget.filterEditor == grid);
            if (isFilterEditor) {
                this.filterTargetComponent = grid.sourceWidget;
                if (isc.isA.TreeGrid(this.filterTargetComponent)) {
                    var field = this.filterTargetComponent.getField(this.name);
                    if (field != null && field.treeField) {
                        // Default to always filtering tree-fields by primary key rather than
                        // the specified field name.
                        // This ensures that the visible records in the target grid will be 
                        // the specific selected items from the pick tree, rather than there
                        // being ambiguity in the case of duplicate values
                        this.filterByPrimaryKey = true;
                        // If selectionStyle was explicitly specified, don't override it but
                        // if not, set up pickTree defaults
                        var explicitProps = isc.addProperties({},defaults,a,b,c);
                        if (explicitProps.selectionStyle == null) {
                            this.selectionStyle = "pickTree";
                        }
                    }
                }
            }
        }
        this.operator = this.useUnselectedValues ? this.unselectedOperator : this.selectedOperator;
        return this.Super("init", arguments);
    },

    // Override canEditCriterion to ensure we get inSet / notInSet criteria passed to us
    canEditCriterion : function (criterion) {
        return (criterion.fieldName == this.getCriteriaFieldName() && 
                (criterion.operator == this.selectedOperator || criterion.operator == this.unselectedOperator)
               );
    },
    // Override setCriterion to ensure we update our value, our operator and our UI
    setCriterion : function (criterion) {


        // No-op if criteria are unchanged
        var currentCriterion = this.getCriterion();
        var criterionChanged = true;
        if (currentCriterion == null) {
            if (criterion == null) criterionChanged = false;
        } else if (criterion != null) {
            var currentVal = currentCriterion.value || [];
            if (currentCriterion.operator == criterion.operator && 
                currentVal.equals(criterion.value)) 
            {
                criterionChanged = false;
            }
        }
        this._settingCriterion = true;
        if (criterionChanged) {

            var operator = criterion && criterion.operator;
            if (operator != this.selectedOperator && operator != this.unselectedOperator) {
                operator = this.defaultUseUnselectedValues ? this.unselectedOperator : this.selectedOperator;
            }
            // Second parameter tells the pickList to keep it's current selection [it's meaning will just be inverted]
            
            this.setUseUnselectedValues(operator == this.unselectedOperator, true);
        }
        
        var value = criterion && criterion.value;
        this.setValue(value);
        delete this._settingCriterion;

    },

    pickerSelectionUpdated : function () {
        // setCriterion changes useUnselectedValues which triggers a selection changed notification
        // don't run our changed handler!
        if (this._settingCriterion) return;
        return this.Super('pickerSelectionUpdated', arguments);
    },



    // Override getCriteriaFieldName to default to filtering by primaryKey if requested
     
    getCriteriaFieldName : function () {
        if (this.filterByPrimaryKey && this.criteriaField == null) {
            return this.getValueFieldName();
        }
        return this.Super("getCriteriaFieldName", arguments);
    },

    //> @attr SetFilterItem.includePathInInSetCriteria (Boolean : null : IR)
    // When generating an +link{type:OperatorId,inSet} filter criteria, should the full path
    // to any selected nodes be included in the criteria value?
    // <P>
    // If true, when the user selects a node within the pickTree,
    // +link{formItem.getCriterion(),getCriterion()} will include all ancestors of the
    // selected node in any <code>"inSet"</code> criterion value it generates. This means
    // that if the criteria are applied to a target TreeGrid with 
    // +link{treeGrid.keepParentsOnFilter,keepParentsOnFilter:false}, the node (with all its 
    // ancestors) should be present in the TreeGrid's data set.
    // <P>
    // If not explicitly specified, this attribute value defaults to <code>true</code> if this
    // item has a specified +link{filterTargetComponent} where 
    // +link{TreeGrid.keepParentsOnFilter,keepParentsOnFilter} is set to <code>false</code>.
    // Otherwise the attribute value defaults to <code>false</code>.
    //
    // @visibility internal
    //<
    
    includePathInInSetCriteria:false,
    shouldIncludePathInInSetCriteria : function () {
        if (this.includePathInInSetCriteria != null) return this.includePathInInSetCriteria;
        if (this.filterTargetComponent != null && !this.filterTargetComponent.keepParentsOnFilter) return true;
        return false;
    },

    // If a user picks explicit empty string only [ "" ], don't ignore this
    allowEmptyStringInArrayCriterion:true,

    // Override getCriteriaValue to support returning partially selected
    // values form our pickTree if so configured
    // This allows filter criteria to be applied to trees with keepParentsOnFilter:false
    getCriteriaValue : function () {

        // Pick up ancestor paths for pickTrees if necessary
        // Only applies to inSet operators where we need to explicitly include a node an all its 
        // ancestors on a keepParentsOnFilter:false target tree.
        // For notInSet operators we definitely don't want to exclude parents of excluded children!
        if (this._usePickTree() && this.operator == "inSet" && this.shouldIncludePathInInSetCriteria()) {
            var values = [];
            var pickTree = this.pickTree;
            if (pickTree != null) {
                var targetField = this.pickTree.targetField;
                var selection = this.pickTree.selectionManager.getSelectionByKeys(true, false);
                for (var i = 0; i < selection.length; i++) {
                    var value = selection[i][targetField];
                    if (value == null || values.contains(value)) continue; // May be null for autogen'd root node. 
                    values.add(value);

                    // If cascadeSelection is true, getSelectionByKeys() with excludePartialSelections:false
                    // will have picked up all the paths
                    // If not, we need to add the paths here.
                    if (!this.cascadeSelection) {
                        var ancestors = this.pickTree.data.getParents();
                        for (var ii = 0; ii < ancestors.length; ii++) {
                            var value = ancestors[i][targetField];
                            if (value == null || values.contains(value)) continue;
                            values.add(value);
                        }
                    }
                    
                }

                return values;
            }
        }
        return this.Super("getCriteriaValue", arguments);
    },

    //> @method SetFilterItem.setUseUnselectedValues()
    // Clear any current value for this item and dynamically update +link{useUnselectedValues}.
    // @param useUnselectedValues (boolean) new value for useUnselectedValues
    // visibility multiPickerItem
    //<
    setUseUnselectedValues : function (useUnselectedValues) {
        this.operator = useUnselectedValues ? this.unselectedOperator : this.selectedOperator;
        this.Super("setUseUnselectedValues", arguments);
    }

});

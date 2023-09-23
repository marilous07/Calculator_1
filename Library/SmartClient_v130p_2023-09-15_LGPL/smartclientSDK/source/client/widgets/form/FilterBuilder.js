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
// FilterBuilder requires DynamicForm but is loaded in a separate module. 
// Ensure DF is present before attempting to initialize
if (isc.DynamicForm) {



// This class is used by the clause forms that make up a filter-builder.
// Extend SearchForm rather than DynamicForm - this ensures we show editableItems if
// canFilter is true.
isc.defineClass("DynamicFilterForm", "SearchForm");
isc.DynamicFilterForm.addProperties({

    useMultiSelectForValueMaps:false,
    
    _$Enter:"Enter",
    handleKeyPress : function (event, eventInfo) {
        // We need to suppress normal DynamicForm saveOnEnter behavior; we also need to let
        // the FilterBuilder that will eventually see this event know whether or not the field
        // triggering it was a TextItem
        var item = this.getFocusSubItem();
        if (isc.isA.TextItem(item)) eventInfo.firedOnTextItem = true;
        
        // But we need normal key handling for everything except Enter!
        if (event.keyName != this._$Enter) {
            return this.Super("handleKeyPress", [event, eventInfo]);
        }
    },
    itemChanged : function (item, newValue, oldValue) {
        if (this.creator.itemChanged) this.creator.itemChanged();
    },
    
    getDefaultOptionDataSource : function (field) {
        if (this.creator && this.creator.getDefaultOptionDataSource) {
            return this.creator.getDefaultOptionDataSource(field);
        }
        return this.Super("getDefaultOptionDataSource", arguments);
    },
    
    validate : function (a, b, c, d, e, f) {
        var failed = (this.Super("validate", arguments) == false);

        // Validate any visible, CanvasItems with embedded forms.
        // This specifically applies to ValidatorEditor use for valuesForm.
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.isVisible() && isc.isA.CanvasItem(item) && isc.isA.DynamicForm(item.canvas)) {
                failed = (item.canvas.validate(a, b, c, d, e, f) !== true) || failed;
            }
        }
        return !failed;
    }
});



//> @class FilterClause
// A horizontal, Layout-based widget that allows a user to input a single criterion based on 
// one field and one operator.
// <P>
// Note that FilterClauses must be used in conjunction with a +link{class:filterBuilder}. By default
// the FilterBuilder will auto-generate its clauses based on specified criteria, but for advanced
// usage a FilterClause may be instantiated directly and passed to a filterBuilder via 
// +link{filterBuilder.addClause()}.
// 
// @inheritsFrom Layout
// @treeLocation Client Reference/Forms
// @visibility external
//<

isc.defineClass("FilterClause", "Layout").addProperties({
// props from HLayout
orientation:"horizontal",
defaultWidth: 20,
height: 20,

//> @attr filterClause.criterion (Criteria : null : IRW)
// Initial criterion for this FilterClause.
// <P>
// When initialized with a criterion, the clause will be automatically set up for editing
// the supplied criterion.
// <P>
// Note that an empty or partial criterion is allowed, for example, it may specify
// +link{criterion.fieldName} only and will generate an expression with the operator not chosen.
// @visibility external
//<

//> @attr filterClause.showFieldTitles (Boolean : true : IR)
// If true (the default), show field titles in the drop-down box used to select a field for querying.
// If false, show actual field names instead.
// @visibility external
//< 
showFieldTitles: true,

//> @attr filterClause.validateOnChange (Boolean : true : IR)
// If true (the default), validates the entered value when it changes, to make sure it is a 
// a valid value of its type (valid string, number, and so on).  No other validation is 
// carried out.  If you switch this property off, it is still possible to validate the 
// <code>FilterClause</code> by calling +link{filterClause.validate()} from your own code.
// @visibility external
//< 
validateOnChange: true,

// Clause creation
// ---------------------------------------------------------------------------------------

// Note that fieldPicker, operatorPicker and valueItem defaults and properties
// may be overridden at the filterBuilder level
fieldPickerWidth: "*",
operatorPickerWidth: 150,
valueItemWidth: 150,

fieldPickerDefaults: { 
    //editorType: "SelectItem", 
    name: "fieldName", 
    showTitle: false, 
    textMatchStyle: "startsWith",
    changed : function () { this.form.creator.fieldNameChanged(this.form); }
},

//> @attr filterClause.fieldPicker (AutoChild PickList : null : IR)
// @include filterBuilder.fieldPicker
//
// @visibility external
//<


//> @attr filterClause.fieldPickerTitle (String : "Field Name" : IR)
// The title for the +link{fieldPicker, field-picker} select-item.
// @group i18nMessages
// @visibility external
//<
fieldPickerTitle: "Field Name",


//> @attr filterClause.fieldPickerProperties (FormItem Properties : null : IR)
// Properties to combine with the +link{fieldPicker} autoChild FormItem.
//
// @visibility external
//<

//> @attr filterClause.operatorPicker (AutoChild SelectItem : null : IR)
// AutoChild for the +link{FormItem} that allows a user to select the operator
// when creating filter clauses. Each clause will create an operatorPicker automatically.
// To customize this item, use +link{operatorPickerProperties}
//
// @visibility external
//<


//> @attr filterClause.operatorPickerProperties (FormItem Properties : null : IR)
// Properties to combine with the +link{operatorPicker} autoChild FormItem.
//
// @visibility external
//<
operatorPickerDefaults : {
    // list of operators
    name:"operator", 
    editorType: "SelectItem", 
    showTitle:false, 
    // don't allow addUnknownValues - it's a fixed list applicable to the selected field
    addUnknownValues:false, 
    defaultToFirstOption:true,
    changed : function () { this.form.creator.operatorChanged(this.form); }
},

//> @attr filterClause.operatorPickerTitle (String : "Operator" : IR)
// The title for the operator-picker select-item.
// @group i18nMessages
// @visibility external
//<
operatorPickerTitle: "Operator",


//> @attr filterClause.valueItemTitle (String : "Value" : IR)
// The title for the value-item.
// @group i18nMessages
// @visibility external
//<
valueItemTitle: "Value",

//> @attr filterClause.valueSetHint (String : "Comma-separated values" : IR)
// A hint to show in the value-item when using an operator that takes an array of values.
// @group i18nMessages
// @visibility external
//<
valueSetHint:"Comma-separated values",

//> @attr filterClause.valueItemTextHint (String : "Enter a value" : IR)
// A hint to show in the value-item when using an operator that takes user-entered values.
// @group i18nMessages
// @visibility external
//<
valueItemTextHint:"Enter a value",

//> @attr filterClause.valueItemListHint (String : "Select a value" : IR)
// A hint to show in the value-item when using an operator that allows users to select values
// from a list.
// @group i18nMessages
// @visibility external
//<
valueItemListHint:"Select a value",

//> @attr filterClause.valueItemFieldHint (String : "Select a field" : IR)
// A hint to show in the value-item when using an operator that allows users to select 
// field-names from a list.
// @group i18nMessages
// @visibility external
//<
valueItemFieldHint:"Select a field",

//> @attr filterClause.clause (AutoChild SearchForm : null : IR)
// AutoChild containing the UI for the filter-properties in this FilterClause.
// @visibility external
//<
clauseConstructor: isc.DynamicFilterForm,

//> @attr filterClause.showRemoveButton (Boolean : true : IR)
// If set, show a button for this clause allowing it to be removed.
// @visibility external
//<
showRemoveButton:true,

//> @attr filterClause.removeButtonPrompt (String : "Remove" : IR)
// The hover prompt text for the remove button.
//
// @group i18nMessages 
// @visibility external
//<
removeButtonPrompt: "Remove",

// set this flag to prevent non-filterable fields from being excluded - such exclusion makes
// sense in a FilterBuilder, but we don't want it when we're using a FilterClause widget simply 
// as a UI - for instance, from the HiliteEditor.
excludeNonFilterableFields: true,

//> @attr filterClause.removeButton (AutoChild ImgButton : null : IR)
// The clause removal ImgButton that appears before this clause if
// +link{showRemoveButton} is set.
// @visibility external
//<
removeButtonDefaults : {
    _constructor:isc.ImgButton,
    width:18, height:18, layoutAlign:"center",
    src:"[SKIN]/actions/remove.png",
    showRollOver:false, showDown:false,
    click: function () { this.creator.remove(); },
    getHoverHTML : function () {
        var fb = this.creator.creator;
        // show a different message if this is the last clause and allowEmpty is false
        if (!fb.allowEmpty && fb.clauses && fb.clauses.length == 1) return fb.lastClausePrompt;
        return this.prompt;
    }
},

// Spacer shown before dynamicValueButton
dynamicValueButtonSpacerDefaults: {
    _constructor:isc.LayoutSpacer,
    width: 5
},

//> @attr filterClause.dynamicValueButton (AutoChild ImgButton : null : IR)
// The ImgButton that appears after each clause if +link{filterBuilder.allowRuleScopeValues} is set.
// @visibility rules
//<
dynamicValueButtonDefaults : {
    _constructor:isc.ImgButton,
    width:18, height:18, layoutAlign:"center",
    src:"[SKIN]/actions/dynamic.png",
    showRollOver:false, showDown:false,
    showDisabled:false,
    // this -> Button
    // this.creator -> FilterClause
    click: function () { this.creator.dynamicValueButtonClick(); }
},

flattenItems: true
    
});

isc.FilterClause.addMethods({

initWidget : function () {
    this.Super("initWidget", arguments);
    this.setupClause();
},

destroy : function () {
    if (this.fieldPicker && this.fieldPicker && this.fieldPicker.optionDataSource && this.fieldPicker.optionDataSource._isMultiDSFieldDS) {
        this.fieldPicker.optionDataSource.destroy();
    }
    this.Super("destroy", arguments);
},

//> @method filterClause.getFilterBuilder()
// Returns the +link{class:filterBuilder,filterBuilder} containing this clause, or null if
// this filterClause is not embedded in a filterBuilder.
// @visibility external
//<
getFilterBuilder : function () {
    // filterBuilder attribute is set by filterBuilder.addClause()
    return this.filterBuilder;
},

getTopLevelFilterBuilder : function () {
    var filterBuilder = this.filterBuilder;
    while (filterBuilder.filterBuilder != null) {
        filterBuilder = filterBuilder.filterBuilder;
    }
    return filterBuilder;
},

// getPrimaryDS() - this returns the dataSource used to drive field operators etc.
getPrimaryDS : function (fieldName) {
    if (this.dataSources) {
        
        if (fieldName == null) {
            return isc.DataSource.get(this.dataSources[0]);
        }
        
        if (isc.isAn.Object(fieldName)) {
            if (fieldName._origField != null) {
                fieldName = fieldName._origField;
            }
            for (var i = 0; i < this.dataSources.length; i++) {
                var fields = isc.getValues(this.dataSources[i].getFields());
                if (fields.contains(fieldName)) return this.dataSources[i];
            }
            // it's an object but wasn't an actual field within a DS, grab the name
            
            fieldName = fieldName.name;
        }

        if (fieldName.contains(".")) {
            return isc.DataSource.getDataSourceForField(fieldName, this.dataSources);
        }
    }
    if (this.dataSource) return this.getDataSource();
    else if (this.fieldDataSource) return this.fieldDataSource;
},

getDefaultOptionDataSource : function (field) {
    return this.getPrimaryDS(field);
},

getField : function (fieldName) {
    
    if (fieldName == null) return null;
    
    if (isc.isAn.Object(fieldName)) return fieldName;
    var field;
    if (this.dataSources) {
        field = isc.DataSource.getFieldFromDataSources(fieldName, this.dataSources);
    } else if (this.dataSource) {
        field = this.getDataSource().getField(fieldName);
        if (field == null) {
            field = this.getDataSource().getFieldForDataPath(fieldName);
        }
        // return field via the criteria component, defined by Workflow tasks
        if (field == null) {
            var critComp = this.getTopLevelFilterBuilder().criteriaComponent;
            if (critComp) field = critComp.getFieldByName(fieldName);
        }
    } else {
        if (this.clause) {
            field = this.fieldData ? this.fieldData[fieldName] : null;
            if (!field) field = this.clause.getField("fieldName").getSelectedRecord();
            if (!field) field = this.field;
            else this.field = field;
        }
    }
    if (!field && this.createRuleCriteria) {
        var targetRuleScope = this.getTopLevelFilterBuilder()._targetRuleScope,
            dbcList = targetRuleScope.getRuleScopeDataBoundComponents(),
            segments = fieldName.split("."),
            dbcName = (segments.length > 0 ? segments[0] : null),
            dbcFieldName = (segments.length > 1 ? segments[segments.length-1] : null)
        ;
        if (dbcName && dbcFieldName) {
            for (var i = 0; i < dbcList.length; i++) {
                var id = dbcList[i].getID();
                if (id == dbcName) {
                    field = dbcList[i].getField(dbcFieldName);
                    break;
                }
            }
        }
    }
    return field;
},

addComponentFieldNames : function (component, fieldNames) {
     var completeFields = component.completeFields;
     if (!completeFields) return fieldNames;
 
     var fieldMap = {};
     for (var i = 0; i < fieldNames.length; i++) fieldMap[fieldNames[i]] = true;
 
     fieldNames = fieldNames.duplicate();
     for (var i = 0; i < completeFields.length; i++) {
         var fieldName = completeFields[i].name;
         if (!fieldMap[fieldName]) fieldNames.add(fieldName);
     }
 
     return fieldNames;
 },
    
getFieldNames : function () {
    if (this.allowedFields) return this.allowedFields;
    if (this.dataSources) {
        return isc.DataSource.getCombinedDataSourceFields(this.dataSources);
    }
    if (this.dataSource) {
        var fieldList = this.getDataSource().getFieldNames(!this.showHiddenFields),
            filterBuilder = this.getFilterBuilder() && this.getTopLevelFilterBuilder(),
            critComp = filterBuilder && filterBuilder.criteriaComponent;
        // add non-DS fields from the databound comopnent at the end of the field list
        return critComp ? this.addComponentFieldNames(critComp, fieldList) : fieldList;
    }
},

getFieldOperatorMap : function (field, includeHidden, valueType, omitValueType) {
    // call the local getFieldOperators() method, which may be overridden, and pass the 
    // resulting list into ds.getFieldOperatorMap() as new undoc'd final param "operators"
    var operators = this._getFieldOperators(field),
        ds = this.getPrimaryDS(field),
        // add clause.extraOperators to the field - this is an array of operators used by this
        // clause when it was created by a call to setCriteria() - these operators are always 
        // made available, even if set to hidden:true - see logic in DS.getFieldOperatorMap()
        f = isc.addProperties({}, field, { extraOperators: this.extraOperators }),
        map = ds.getFieldOperatorMap(f, includeHidden, valueType, omitValueType, operators)
    ;
    return map;
},

getSearchOperator : function (operatorName, field) {
    return this.getPrimaryDS(field).getSearchOperator(operatorName);
},

combineFieldData : function (field, targetField) {
    var ds = this.getPrimaryDS(targetField),
        dsField = this.getField(targetField);
    if (dsField) 
        return ds.combineFieldData(field, targetField);
    else return field;
},

// setupClause initializes autoChildren etc.
setupClause : function () {
    this._clauseInitialized = true;
    if (this.dataSource && !isc.isA.DataSource(this.dataSource))
        this.dataSource = isc.DataSource.get(this.dataSource);
    if (this.fieldDataSource && !isc.isA.DataSource(this.fieldDataSource))
        this.fieldDataSource = isc.DataSource.get(this.fieldDataSource);

    this.fieldPickerDefaults.title = this.fieldPickerTitle;
    this.operatorPickerDefaults.title = this.operatorPickerTitle;
    
    var fieldMap = {};

    if (this.showClause != false) {
        if (this.topOperatorAppearance == "inline") {
            if (this.topOperator == "and") {
                var map = {and: this.creator.inlineAndTitle, not: this.creator.inlineAndNotTitle};
            } else {
                var map = {or: this.creator.inlineOrTitle, not: this.creator.inlineAndNotTitle};
            }
            var operatorIndex = 0;
            this.topOperatorFormProperties = {layoutAlign: "top"};
            if (this.creator.showSelectionCheckbox) {
                isc.addProperties(this.topOperatorFormProperties, {
                    numCols: 2,
                    width: 120,
                    colWidths: ["20%", "80%"]
                });
                
                this.topOperatorFormProperties.items = [
                    // Should be extracted into a configurable auto-child type block
                    {
                    name: "select",
                    type: "checkbox",
                    showTitle: false,
                    showLabel: false,
                    defaultValue: false,
                    showIf: function() { return this.form.creator.showSelectionCheckbox }
                    },
                    isc.addProperties(
                        {width:this.topOperatorItemWidth}, 
                        this.topOperatorItemDefaults, this.topOperatorItemProperties
                    )
                ];
                operatorIndex = 1;
            } else {
                this.topOperatorFormProperties.items = [
                    isc.addProperties(
                        {width:this.topOperatorItemWidth}, 
                        this.topOperatorItemDefaults, this.topOperatorItemProperties
                    )
                ];
            }
            this.addAutoChild("topOperatorForm");
            this.topOperatorForm.items[operatorIndex].valueMap = map;
            this.topOperatorForm.items[operatorIndex].defaultValue = this.negated ? 
                                                                     "not" : this.topOperator;
            this.updateInlineTopOperator();
        }
        // set up the items - field and operator pickers
        var items = [];
        items.add(isc.addProperties({}, this.fieldPickerDefaults, 
            { width: this.fieldPickerWidth,
              sortField: (this.sortFields ? "fieldName" : null) }, 
            this.fieldPickerProperties,
            {name:"fieldName"}
        ));
        // only show the operator item if the field is not missing - if the field IS missing,
        // extend the text shown as the field-title to show an readable explanation instead
        items.add(isc.addProperties({}, this.operatorPickerDefaults, 
            { width: this.operatorPickerWidth, showIf: this.missingField ? "false" : "true" }, 
            this.operatorPickerProperties,
            { name:"operator" }
        ));
        var criterion = this.criterion,
            fieldNames = this.getFieldNames(),
            selectedFieldName
        ;

        if (this.fieldName && (this.dataSource || this.dataSources)) {
            // fieldName provided - change the type of the first DF field and set it's value -
            // this behavior is only supported when this.dataSource is present 
            var specificFieldName = this.fieldName;
            var field = this.getField(specificFieldName),
                fieldTitle
            ;
            isc.addProperties(items[0], { type: "staticText", clipValue: true, wrap: false });

            if (this.missingField) {
                fieldTitle = isc.DataSource.getCriterionDescription(this.criterion, this.dataSource || this.dataSources);
            } else if (!field || (this.excludeNonFilterableFields && field.canFilter == false)) {
                specificFieldName = fieldNames[0];
            } else if (this.showFieldTitles) {
                fieldTitle = field.summaryTitle || field.title || specificFieldName;
            }
            items[0].defaultValue = specificFieldName;
            if (fieldTitle != null) {
                var valueMap = {};
                valueMap[specificFieldName] = fieldTitle;
                items[0].valueMap = valueMap;
            }            
            selectedFieldName = specificFieldName;
        } else {
            if (this.fieldDataSource) {
                var plFields;
                if (this.fieldPickerProperties) {
                    // if fieldPickerProperties.pickListFields is set, use it
                    plFields = this.fieldPickerProperties.pickListFields;
                }
                // if plFields is still unset, use this.pickListFields
                if (!plFields) plFields = this.pickListFields;

                // change the fieldPicker to be a ComboBoxItem, setup the fieldDataSource as 
                // it's optionDataSource and provide type-ahead auto-completion
                isc.addProperties(items[0], {
                    type: "ComboBoxItem",
                    completeOnTab: true,
                    addUnknownValues:false, 
                    optionDataSource: this.fieldDataSource,
                    valueField: "name",
                    displayField: this.showFieldTitles ? "title" : "name",
                    
                    pickListFields: plFields,
                    // criteria can only be applied to filterable fields
                    optionCriteria: { _constructor: "AdvancedCriteria", operator: "and",
                        criteria: [
                            { fieldName: "canFilter", operator: "notEqual", value: false }
                        ]
                    },
                    pickListProperties: { reusePickList : function () { return false;} } 
                });
                if (this.field) {
                    items[0].defaultValue = items[0].defaultValue || this.field.name;
                }
            } else if (this.dataSources != null && this.createRuleCriteria) {
                var _this = this,
                    pathField = (this.multiDSFieldFormat == isc.FilterBuilder.SEPARATED ? "title" : "name"),
                    displayField = (this.showFieldTitles ? "title" : "name"),
                    targetRuleScope = this.getTopLevelFilterBuilder()._targetRuleScope,
                    targetComponent = this.getTopLevelFilterBuilder().targetComponent,
                    ds = isc.Canvas.getMultiDSFieldDataSource(targetRuleScope, this._ruleScopeDataSources, targetComponent, this.getTopLevelFilterBuilder().excludedRuleScope, this.multiDSFieldFormat)
                ;
                // assign ruleScope field DS to fieldPicker item 
                isc.addProperties(items[0], {
                    width: 200,
                    optionDataSource: ds,
                    valueField: "name",
                    displayField: pathField, 
                    pickListMaxWidth: 600,
                    pickListFields: [
                        { name: "name", type: "text", hidden: (pathField != "name") },
                        { name: "title", type: "text", hidden: (pathField != "title") }
                    ],
                    pickListProperties: {
                        showHeader: false, 
                        autoFitFieldWidths: true,
                        reusePickList : function () { return false; },
                        formatCellValue : function (value, record, rowNum, colNum) {
                            return (record.enabled == false || _this.multiDSFieldFormat == isc.FilterBuilder.QUALIFIED ? value : "&nbsp;&nbsp;" + value);
                        },
                        getCellStyle : function (record, rowNum, colNum) {
                            if (record.enabled == false) return "filterBuilderTitleCell";
                            return this.Super("getCellStyle", arguments);
                        }
                    }
                });
            } else if (fieldNames) {
                // build and assign a valueMap to the fieldPicker item
                var multiDS = (this.dataSources != null),
                    multiDSFieldFormat = this.multiDSFieldFormat
                ;

                var lastDS = "";
                for (var i = 0; i < fieldNames.length; i++) {
                    var fieldName = fieldNames[i],
                        field = this.getField(fieldName);
                    if (!field) continue;
                    if (this.excludeNonFilterableFields && field.canFilter == false) continue;
                    if (multiDS) {
                        if (multiDSFieldFormat == "separated") {
                            var ds = fieldName.split(".")[0];
                            if (ds != lastDS) {
                                
                            }
                            fieldMap[fieldName] = "&nbsp;&nbsp;" + (field.summaryTitle || field.title || isc.DS.getAutoTitle(fieldName));
                        } else {
                            fieldMap[fieldName] = fieldName;
                        }
                    } else if (this.showFieldTitles) {
                        fieldMap[fieldName] = field.summaryTitle || field.title || fieldName;
                    } else {
                        fieldMap[fieldName] = fieldName;
                    }
                }
                items[0].valueMap = fieldMap;

                items[0].defaultValue = items[0].defaultValue || this.defaultFieldName || 
                    isc.firstKey(fieldMap);
            }
        }

        this.fieldPicker = items[0];
        var fieldItem = items[0],
            operatorItem = items[1];

        if (!this.fieldName) {
            if (criterion && criterion.fieldName) {
                if (this.fieldDataSource) {
                    fieldItem.defaultValue = criterion.fieldName;
                } else {
                    if (fieldNames && fieldNames.contains(criterion.fieldName)) {
                        fieldItem.defaultValue = criterion.fieldName;
                    } else if (fieldNames && fieldNames.contains(isc.Canvas._makeRuleScopeMetaFieldName(criterion.fieldName))) {
                        fieldItem.defaultValue = isc.Canvas._makeRuleScopeMetaFieldName(criterion.fieldName);
                    } else {
                        isc.logWarn("Criterion specified field " + criterion.fieldName + ", which is not" +
                                    " in the record. Using the first record field (" + 
                                    (fieldMap ? isc.firstKey(fieldMap) : fieldNames[0]) + 
                                    ") instead");
                        fieldItem.defaultValue = fieldMap ? isc.firstKey(fieldMap) : fieldNames[0];
                    }
                }
            }

            selectedFieldName = fieldItem.defaultValue;
        }
        // remember the selections for fieldName, operator and value fielditems - this is now applied
        // to the clauseForm below as default values
        var clauseValues = {};
        if (selectedFieldName) {
            var field = this.field || this.getField(selectedFieldName);
            
            if (!this.missingField && field) {
                clauseValues.fieldName = selectedFieldName;
                var ds = this.getPrimaryDS();
                // if the ds has operators specified for the field-type (ds.setTypeOperators()
                // has been called), we want to allow all the operators specified, including
                // those that are normally hidden, like isNull et al
                var includeHidden = ds && ds._typeOperators && ds._typeOperators[field.type] != null;
                var valueMap = field ? this.getFieldOperatorMap(field, includeHidden, "criteria", true) : null;

                operatorItem.valueMap = valueMap;
                if (valueMap) {
                    if (criterion && criterion.operator) {
                        operatorItem.defaultValue = criterion.operator;
                    } else {
                        if (ds) {
                            // use defaultOperator from the data-type of the field or simpleType
                            operatorItem.defaultValue = ds.getFieldDefaultOperator(field.name);
                        } else {
                            // use defaultOperator from the simpleType
                            operatorItem.defaultValue = isc.SimpleType.getDefaultOperator(field.type);
                        }
                    }
                    clauseValues.operator = operatorItem.defaultValue;
                }

                this._lastFieldName = selectedFieldName;

                var operator = this.getSearchOperator(operatorItem.defaultValue, field);
                var mapLength = isc.getKeys(valueMap).length;

                if (mapLength > 0 && (!operator || !valueMap[operator.ID])) {
                    isc.logWarn("Criterion specified unknown operator " + 
                            (criterion ? criterion.operator : "[null criterion]") + 
                            ". Using the first valid operator (" + isc.firstKey(valueMap) + ") instead");
                    operatorItem.defaultValue = isc.firstKey(valueMap);
                    operator = this.getSearchOperator(operatorItem.defaultValue, field);
                
                }
                var valueItems = this.buildValueItemList(field, operator, selectedFieldName);
            
                
                if (criterion) {
                    if (criterion.value != null && valueItems.containsProperty("name", "value")) {
                        valueItems.find("name", "value").defaultValue = criterion.value;
                        clauseValues.value = criterion.value;
                    }
                    if (criterion.start != null && valueItems.containsProperty("name", "start")) {
                        valueItems.find("name", "start").defaultValue = criterion.start;
                        clauseValues.start = criterion.start;
                    }
                    if (criterion.end != null && valueItems.containsProperty("name", "end")) {
                        valueItems.find("name", "end").defaultValue = criterion.end;
                        clauseValues.end = criterion.end;
                    }
                    if (criterion.valuePath != null) {
                        var valuePathItem = valueItems.find("name", "valuePath");
                        if (valuePathItem) {
                            // Determine top-level filterBuilder
                            var filterBuilder = this.getTopLevelFilterBuilder();

                            // Show valuePath if a valid ruleScope is provided
                            var ruleScopeCanvas = filterBuilder._targetRuleScope;
                            if (ruleScopeCanvas && ruleScopeCanvas.ruleScope) {
                                // Normalize path value to use dot notation. The picker will always use
                                // the same and to allow selection of an existing value it should be
                                // in the same format.
                                valuePathItem.defaultValue = criterion.valuePath.replace(/\//, ".");
                                valuePathItem.visible = true;
                                valueItems.find("name", "value").visible = false;
                            } else {
                                isc.logWarn("Criterion specified field " + criterion.fieldName +
                                        " with valuePath " + criterion.valuePath + 
                                        " but no targetRuleScope was provided - ignoring valuePath.");
                                criterion.valuePath = criterion.value = null;
                            }
                        }
                    }
                }
                if (valueItems) items.addList(valueItems);
            }
        } else {
            operatorItem.disabled = true;
        }

        if (this.showRemoveButton) {
            this.addAutoChild("removeButton", { prompt: this.removeButtonPrompt });
        }
        this.addMember(this.removeButton);

        
        this.addAutoChild("clause", {
            sortFields: this.sortFields,
            flattenItems: this.flattenItems,
            _suppressColWidthWarnings: true,
            items: items,
            // default values for the items
            values: clauseValues,
            height: 10,
            width: 100, // allow width to expand with content
            numCols: 5,
            colWidths: [100, this.operatorPickerWidth, "*", 25, "*"]
        });

        this.addMember(this.clause);

        if (this.allowRuleScopeValues) {
            var valueMap = fieldItem.valueMap,
                fieldTitle = (valueMap ? valueMap[selectedFieldName] : null) || selectedFieldName
            ;
            this.addAutoChild("dynamicValueButtonSpacer");
            this.addAutoChild("dynamicValueButton", { prompt: this.dynamicValueButtonPrompt, fieldName: selectedFieldName, fieldTitle: fieldTitle });
            if (!items.find("name", "valuePath")) {
                this.dynamicValueButton.hide();
            }
        }
        this.addMember(this.dynamicValueButton);

        this.fieldPicker = this.clause.getItem("fieldName");

        this.operatorPicker = this.clause.getItem("operator");
    }

    this.addMember(this.topOperatorForm, 0);
},

updateInlineTopOperator : function () {
    if (this.topOperatorAppearance != "inline") return;
    var operatorIndex = this.creator.showSelectionCheckbox ? 1 : 0;
    if (this.creator.isFirstClause(this)) {
        // Hide the operator
        this.topOperatorForm.items[operatorIndex].hide();
    } else {
        this.topOperatorForm.items[operatorIndex].show();
    }
},

// getEditorType for some field / operator. Call the same-named method on the FilterBuilder by default
// otherwise back-off to looking at the clause (a SearchForm subclass)'s implementation.

getEditorType : function (field, operatorID) {
    if (isc.isA.FilterBuilder(this.filterBuilder)) {
        return this.filterBuilder.getEditorType(field, operatorID);
    } else {
        return isc.FilterBuilder.getDefaultEditorType(field, this.getPrimaryDS(), operatorID);
    }
},

// create the form items that constitute the clause, based on the DataSource field involved and
// the chosen operator.
// Note: In the case where we are linked to multiple dataSources fieldName can differ from
// field.name (due to the dataSource ID prefix)
buildValueItemList : function (field, operator, fieldName) {
    // Sanity check only - we don't expect the operator to be unset but if it is log a warning
    if (operator == null) this.logWarn("buildValueItemList passed null operator");
        
    
    var editorType = this.getEditorType(field, operator && operator.ID);
    
    var valueType = operator ? operator.valueType : "text",
        fieldType,
        baseFieldType,
        items = [],
        props
    ;
    
    
    if (field == null) {
        fieldType = "text";
    } else {
        if (fieldName == null) fieldName = field.name;
        fieldType = field.type;
    }

    baseFieldType = isc.SimpleType.getType(fieldType) || isc.SimpleType.getType("text");

    var isDateField = isc.SimpleType.inheritsFrom(fieldType, "date") ||
            isc.SimpleType.inheritsFrom(fieldType, "datetime");

    // We're going to work with *atomic* values - so if this is a SimpleType with a custom
    // storage paradigm that uses getAtomicValue() / setAtomicValue(), find its parent type
    // (The atomic type)
    while (baseFieldType.getAtomicValue != null) {
        var parentType = baseFieldType.inheritsFrom || "text";
        baseFieldType = isc.SimpleType.getType(parentType);
    }

    // We're not interested in the type object, just the name of the type
    baseFieldType = baseFieldType.name;
    
    // store this in case field.editorProperties overrides it
    var valueItemWidth = this.valueItemWidth;
    
    
    
    if (field) {
        var dupField = {_origField:field};
        isc.addProperties(dupField, field);
        dupField.canEdit = field.canFilter;
        field = dupField;
        if (field.userFormula || field.userSummary) {
            field.canFilter = true;
            field.canEdit = true;
        }
        if (field.editorProperties && field.editorProperties.width != null) {
            valueItemWidth = field.editorProperties.width;
        }
    }

    editorType = this.getEditorType(field, operator.ID);

    // The previous call will return "staticText" for fields with canFilter:false, but that 
    // isn't what we want if excludeNonFilterableFields is false - it leads to the field being
    // included in the clause with no way to set a value for it
    if (editorType == "staticText" && !this.excludeNonFilterableFields) editorType = "text";
    
    var hintText = operator.hintText || this.getValueItemHintText(valueType, baseFieldType);

    // a value of the same type as the field
    if (valueType == "fieldType" || valueType == "custom" || valueType == "valueSet")  {
        var dataType = baseFieldType;
        
        var valueFieldProps = this.getValueFieldProperties(fieldType, fieldName, operator.ID, "value");
        if (valueFieldProps && valueFieldProps.editorType) {
            // if getValueFieldProperties() specifies an editorType, respect it
            editorType = valueFieldProps.editorType;
        }
        
        var fieldDef = isc.addProperties(
            {
                type: dataType,
                // valueType - calling code can use this to determine whether the value type has
                // changed
                valueType:valueType,
                
                name: field ? field.name : null,
                showTitle: false,
                title : this.valueItemTitle,
                width: valueItemWidth, 
                hint: hintText,
                showHintInField: (hintText != null),
                changed : function () { 
                    this.form.creator.valueChanged(this, this.form); 
                }
            }, 
            valueFieldProps
        );

        if (editorType) fieldDef.editorType = editorType;

        if (valueType == "valueSet") {
            fieldDef.multiple = true;
            fieldDef.parseEditorValue = function (value,form,item) {
                if (value == null) return value;
                var separator = item.multipleValueSeparator.trim();
                var re = new RegExp("[\\s]*[" + separator + "][\\s]*", "g");
                return value.split(re);
            };
            fieldDef.formatEditorValue = function (value, record, form, item) {
                if (value == null) return "";
                if (isc.isAn.Array(value)) {
                    return value.join(item.multipleValueSeparator);
                }
                return value;
            }
        } 
        // Pick up DataSource presentation hints
        
        if (field != null && valueType != "custom") {
            fieldDef = this.combineFieldData(fieldDef, field);
        }
        
        fieldDef.name = "value";
        fieldDef.dataPath = null;

        if (fieldType == "enum") {
            fieldDef = isc.addProperties(fieldDef, {
                valueMap: field.valueMap
            });
        }
        
        if (baseFieldType == "boolean") {
            fieldDef = isc.addProperties(fieldDef, {
                showLabel: false,
                defaultValue: true,
                align: this.isRTL() ? "right" : "left"
            });
        }

        
        if (field && field.editorProperties) {
            var editorProps = field.editorProperties;
            for (var property in editorProps) {
               var value = editorProps[property];
               if (isc.isAn.Array(value) || isc.isA.Date(value)) {
                   value = value.duplicate();
               } else if (isc.isAn.Object(value)) {
                   value = isc.shallowClone(value);
               }
               fieldDef[property]= value;
            }
        }

        if (field.displayField != null || field.optionDataSource != null) {
            if (field.foreignKey) {
                // there's a foreignKey on the DSField - use that to assume values for ODS and 
                // valueField, which are not available on DSField
                var key = field.foreignKey,
                    dotOffset = key.indexOf(".")
                ;
                if (!field.optionDataSource) fieldDef.optionDataSource = key.substring(0,dotOffset);
                if (!field.valueField) fieldDef.valueField = key.substring(dotOffset+1);
            } else {
                // there's no foreignKey on the DSField - just set the valueField to the passed
                // field's name
                if (!field.valueField) fieldDef.valueField = field.name;
            }
        }
        items.add(fieldDef);

        
        items.add({
            name: "valuePath",
            type: "staticText",
            showTitle: false,
            visible: false,
            valuePrefix: "<nobr>" + this.dynamicValuePrefix + " ",
            valueSuffix: "</nobr>",
            formatValue : function (value, record, form, item) {
                // If value starts with targetComponent local value prefix (i.e ID.values)
                // remove the prefix for simple display
                if (form.creator && form.creator.creator && form.creator.creator.targetComponent) {
                    var localValuePrefix = form.creator.creator.targetComponent.ID + ".values.";
                    if (value != null && value.startsWith(localValuePrefix)) value = value.replace(localValuePrefix, "");
                }
                return (value != null ? this.valuePrefix + value + this.valueSuffix : null);
            }
        });

    } else if (valueType == "fieldName") {
        // another field in the same DataSource
        // Note: This is a field picker, but its also the "value" field.
        // we therefore apply both valueFieldProperties and fieldPickerProperties to it, with
        // fieldPickerProperties winning if both are specified.
        
        
        props = isc.addProperties({}, this.fieldPickerDefaults, {
            showTitle: false,
            
            addUnknownValues: false,
            editorType: this.fieldDataSource ? "ComboBoxItem" : "SelectItem",
            valueType:valueType,
            width: valueItemWidth, 
            textMatchStyle: this.fieldPicker.textMatchStyle,
            changed : function () { 
                this.form.creator.valueChanged(this, this.form); 
            }
        }); 
        if (this.sortFields) props.sortField = "value";       
        if (this.fieldDataSource) {
            // using a fieldDataSource - apply this as the optionDataSource
            props = isc.addProperties(props, {
                completeOnTab: true,
                optionDataSource: this.fieldDataSource,
                valueField: "name",
                displayField: this.showFieldTitles ? "title" : "name",
                pickListProperties: { reusePickList : function () { return false; } }
            });
        } else if (this.dataSources != null && this.createRuleCriteria) {
            var _this = this,
                pathField = (this.multiDSFieldFormat == isc.FilterBuilder.SEPARATED ? "title" : "name"),
                displayField = (this.showFieldTitles ? "title" : "name"),
                targetRuleScope = this.getTopLevelFilterBuilder()._targetRuleScope,
                targetComponent = this.getTopLevelFilterBuilder().targetComponent,
                ds = isc.Canvas.getMultiDSFieldDataSource(targetRuleScope, this._ruleScopeDataSources, targetComponent, this.getTopLevelFilterBuilder().excludedRuleScope, this.multiDSFieldFormat)
            ;
            // assign ruleScope field DS to fieldPicker item 
            props = isc.addProperties(props, {
                optionDataSource: ds,
                valueField: "name",
                displayField: pathField, 
                pickListFields: [
                    { name: "name", type: "text", hidden: (pathField != "name") },
                    { name: "title", type: "text", hidden: (pathField != "title") }
                ],
                pickListProperties: {
                    autoFitData: "horizontal",
                    reusePickList : function () { return false; },
                    formatCellValue : function (value, record, rowNum, colNum) {
                        return (record.enabled == false || _this.multiDSFieldFormat == isc.FilterBuilder.QUALIFIED ? value : "&nbsp;&nbsp;" + value);
                    },
                    getCellStyle : function (record, rowNum, colNum) {
                        if (record.enabled == false) return "filterBuilderTitleCell";
                        return this.Super("getCellStyle", arguments);
                    }
                }
            });
        } else {
            var altFieldNames = this.getFieldNames();
            altFieldNames.remove(fieldName);
            var fieldMap = {};
            for (var i = 0; i < altFieldNames.length; i++) {
                var nextFieldName = altFieldNames[i];
                if (this.showFieldTitles) {
                    var nextField  = this.getField(nextFieldName);
                    fieldMap[nextFieldName] = nextField.summaryTitle || nextField.title || 
                                              nextFieldName;
                } else {
                    fieldMap[nextFieldName] = nextFieldName;
                }
            }
            props = isc.addProperties(props, { valueMap: fieldMap });
        }
        items.add(
            isc.addProperties(props, 
                this.getValueFieldProperties(fieldType, fieldName, operator.ID, "name"),
                this.fieldPickerProperties,
                // In SGWT the wrapper code picks up the 'name' attr on the field picker
                // override this here.
                {name: "value"})
        );

    } else if (valueType == "valueRange") {
        // two values of the same type as the field

        props = this.combineFieldData(
            isc.addProperties({ 
                type: baseFieldType, editorType:editorType, showTitle: false, width: valueItemWidth,
                changed : function () { 
                    this.form.creator.valueChanged(this, this.form); 
                }
            }), field);

        if (hintText) {
            props.showHintInField = true;
            props.hint = hintText;
        }

        items.addList([
            isc.addProperties({}, props,
                { name: "start" },
                this.getValueFieldProperties(fieldType, fieldName, operator.ID, "start"),
                !isDateField ? {} : { rangePosition: "start" }
            ),
            isc.addProperties(
                { type: "staticText", name: "rangeSeparator", showTitle: false,
                    width: null, wrap: false, clipValue: false, clipStaticValue: false, 
                    shouldSaveValue:false,
                    defaultValue: this.filterBuilder ? this.filterBuilder.rangeSeparator : null,
                    changed : function () { 
                        this.form.creator.valueChanged(this, this.form); 
                    }
                },
                this.getRangeSeparatorProperties(fieldType, fieldName, operator.ID)
            ),
            isc.addProperties({}, props,
                { name: "end" },
                this.getValueFieldProperties(fieldType, fieldName, operator.ID, "end"),
                !isDateField ? {} : { rangePosition: "end" }
            )
        ]);
    }

    // set criteriaField and operator on the valueFields
    for (var i=0; i<items.length; i++) {
        if (!items[i].criteriaField) items[i].criteriaField = fieldName;
        if (!items[i].operator) items[i].operator = operator.ID;
    }

    if (this.validateOnChange) {
        for (var i = 0; i < items.length; i++) {
            isc.addProperties(items[i], {
                blur : function(form, item) {
                    if (!form.creator.itemsInError) form.creator.itemsInError = [];
                    if (!form.validate(null, null, true)) {
                        item.focusInItem();
                        if (!form.creator.itemsInError.contains(item)) {
                            form.creator.itemsInError.add(item);
                        }
                    } else {
                        if (form.creator.itemsInError.contains(item)) {
                            form.creator.itemsInError.remove(item);
                        }
                    }
                }
            });
        }
    }

    for (var i=0; i<items.length; i++) {
        if (items[i].showIf != null) delete items[i].showIf;
        if (items[i].type == "text" && isc.Browser.isTouch && operator.ID != "equals" &&
                operator.ID != "notEqual" && operator.ID != "iEquals" && operator.ID != "iNotEqual")
        {
            items[i].browserAutoCorrect = false;
        }
    }
    
    return items;
},

// get the hint text to show in the fields generated by buildValueItemList()
getValueItemHintText : function (valueType, dataType) {
    // showing a list of fieldNames - return the valueItemFieldHint
	if (valueType == "fieldName") return this.valueItemFieldHint;
    // showing a multi-value textAreaItem - return the valueSetHint
    if (valueType == "valueSet") return this.valueSetHint;
    // field-type, custom and value-range all get the default "Enter a value" text, unless
    // the field is boolean or date
    if (valueType == "fieldType" || valueType == "custom" || valueType == "valueRange")  {
        if (!isc.SimpleType.inheritsFrom(dataType, "boolean") &&
            !isc.SimpleType.inheritsFrom(dataType, "date") &&
            !isc.SimpleType.inheritsFrom(dataType, "datetime")
           ) 
        {
            return this.valueItemTextHint;
        }
    }
    // no hint
    return null;
},

//> @type ValueItemType
// Enum used within the +link{FilterBuilder} class to indicate the role of a particular 
// value-field form item within a filter clause.
//
// @value "value" This is the single form item that will populate the generated 
//  +link{criterion.value} for this clause. This applies for operators with
//  +link{operator.valueType} of <code>"fieldType"</code> or <code>"custom"</code>.
// @value "name" This is the single form item that will populate the generated 
//  +link{criterion.value} for +link{operator.valueType} of <code>"fieldName"</code>.
// @value "start" Indicates this item will generate the lower-bound value (or "start") when generating
//  criteria with +link{operator.valueType} <code>"valueRange"</code>.
// @value "end" Indicates this item will generate the higher-bound value (or "end") when generating
//  criteria with +link{operator.valueType} <code>"valueRange"</code>.
//
// @visibility external
//< 

//> @method filterClause.getValueFieldProperties()
// 
// Override to return properties for the FormItem(s) used for the "value" field displayed in this
// filterClause.
// <P>
// Default implementation simply calls +link{filterBuilder.getValueFieldProperties()} on the
// filterBuilder in which this clause is displayed.
// <P>
// Note that the +link{operator.valueType} impacts when this method is called. For operators with
// valueType <code>"fieldType"</code> or <code>"custom"</code>, a single value field is displayed.
// For operators with valueType <code>"valueRange"</code> two value-field items are displayed
// (one for the start and one for the end position). The <code>valueItemType</code> parameter may
// be used to determine which form item is being generated.
// 
// @param type (FieldType) type of the DataSource field for this filter row
// @param fieldName (String) name of the DataSource field for this filter row
// @param operatorId (OperatorId) +link{OperatorId} for the chosen operator
// @param itemType (ValueItemType) What valueItem is being generated.
//
// @return (FormItem Properties) properties for the value field
// @visibility external
//<
getValueFieldProperties : function (type, fieldName, operatorId, itemType) {
    
    if (this.filterBuilder) {
        return this.filterBuilder.getValueFieldProperties(type,fieldName,operatorId,itemType);
    }
},


getRangeSeparatorProperties : function (type, fieldName, operatorId) {
    if (this.filterBuilder) return this.filterBuilder.getRangeSeparatorProperties(type,fieldName, operatorId);
},

//> @method filterClause.remove()
// Remove this clause by destroy()ing it.
// 
// @visibility external
//<
remove : function () {
    this.markForDestroy();
},

getValues : function () {
    var clause = this.clause;

    return clause.getValues();
},

// ignoreDataPath option can be useful for display (used in the hilite-editor, for example)
getFieldName : function (ignoreDataPath) {
    var pickerValue = this.getFieldNameFromPicker(this.fieldPicker, ignoreDataPath);
    if (pickerValue) return pickerValue;
    return this.fieldName;
},

getFieldNameFromPicker : function (fieldPicker, ignoreDataPath) {
    if (fieldPicker) {
        var hasOptionDataSource = fieldPicker.optionDataSource != null;
        // if no optionDataSource it's a plain mapping of fieldName to titles so just use
        // getValue
        if (!hasOptionDataSource) return fieldPicker.getValue();
        // Otherwise each record in the optionDataSource represents a field - 
        // try to grab the selected record and extract dataPath (if specified) or name
        var fieldRecord = fieldPicker.getSelectedRecord();
        if (fieldRecord) return ignoreDataPath ? fieldRecord.name : 
                                    (fieldRecord.dataPath || fieldRecord.name);
        // No record - may just be due to the ODS data not having yet loaded - in this case
        // if we have a value it will have been explicitly set by the developer rather than
        // picked, so just use it (no need to worry about dataPath vs fieldName)
        var fieldValue = fieldPicker.getValue();
        if (fieldValue) return fieldValue;
    }
    return null;
},

getFieldTitle : function () {
    var pickerValue = this.getFieldTitleFromPicker(this.fieldPicker);
    if (pickerValue) return pickerValue;
    return this.fieldTitle;
},

getFieldTitleFromPicker : function (fieldPicker) {
    if (fieldPicker) {
        var hasOptionDataSource = fieldPicker.optionDataSource != null;
        // if no optionDataSource it's a plain mapping of fieldName to titles so just use
        // getValue
        if (!hasOptionDataSource) return fieldPicker.getDisplayValue();
        // Otherwise each record in the optionDataSource represents a field - 
        // try to grab the selected record and extract dataPath (if specified) or name
        var fieldRecord = fieldPicker.getSelectedRecord();
        if (fieldRecord) return fieldRecord.title || fieldRecord.name;
        // No record - may just be due to the ODS data not having yet loaded - in this case
        // if we have a value it will have been explicitly set by the developer rather than
        // picked, so just use it (no need to worry about dataPath vs fieldName)
        var fieldValue = fieldPicker.getDisplayValue();
        if (fieldValue) return fieldValue;
    }
    return null;
},

//> @method filterClause.getCriterion()
// Return the criterion specified by this FilterClause.
// 
// @return (Criteria) The single criterion for this FilterClause
// @visibility external
//<
getCriterion : function (includeEmptyValues) {
    if (!this.clause) return null;
    
    var fieldName = this.getFieldName(),
        operator = this.operatorPicker ? this.operatorPicker.getValue() : null;
        
    if (!fieldName) return null;

    if (isc.isA.String(operator)) operator = this.getSearchOperator(operator, fieldName);
    
    if (operator == null) {
        return;
    }
    
    // getClauseValues - extracts the value / start & end attributes from the clause-form
    var criterion = this.getClauseValues(fieldName, operator, includeEmptyValues);
    if (criterion && !includeEmptyValues && criterion.valuePath == null) {
        // Ignore criteria where no value has been set, unless it is an operator (eg, isNull)
        // that does not require a value, or requires a start/end rather than a value, or
        // if the criterion is itself an AdvancedCriteria.
        // This behavior can be controlled by a parameter - to allow for the case where
        // you actually want to check for someField != null.
        if (!operator || (operator.valueType != "none" && 
            operator.valueType != "valueRange" && 
            (!isc.DS.isAdvancedCriteria(criterion) ||
                (criterion.value == null || 
                (isc.isA.String(criterion.value) && criterion.value == "")))))
        {
            return null;
        }
        
        if (operator.valueType == "valueRange" && !criterion.start && !criterion.end) {
            // also ignore criteria if it's a range operator but both start and end are unset
            return null;
        }
    }

    return criterion;
},

// getClauseValues() returns the values of the clause form
// - Contains fields for operator, fieldName, and either value or start/end by default
// - if operator.getCriterion is defined, use that rather than just returning values from the form.
// Note: we use filterClause in the RuleEditor where we're editing Rules (Validators).
// Because of this we make the various attribute names etc customizable -- for example
// a "contains" validator has a single value field but the attribute on the validator is
// validator.substring, not validator.value. It also uses 'getAttributesFromEditor' rather than
// getCriterion to handle custom UI.

customGetValuesFunction:"getCriterion",
valueAttribute:"value",
rangeStartAttribute:"start",
rangeEndAttribute:"end",
operatorAttribute:"operator",

getClauseValues : function (fieldName, operator, includeEmptyValues) {
    
    var clause = this.clause,
        values = {},
        valueField = clause.getField("value"),
        valuePathField = clause.getField("valuePath"),
        startField = clause.getField("start"),
        endField = clause.getField("end"),
        
        valueAttribute = operator.valueAttribute || this.valueAttribute,
        rangeStartAttribute = operator.rangeStartAttribute || this.rangeStartAttribute,
        rangeEndAttribute = operator.rangeEndAttribute || this.rangeEndAttribute
    ;

    values[this.operatorAttribute] = clause.getValue("operator");

    
    if (fieldName != null) values.fieldName = fieldName;
    
    if (values && valuePathField && valuePathField.isVisible(true)) {
        values["valuePath"] = valuePathField.getValue();
    } else {
        // If operator.getCriterion() [or validator.getAttributesFromEditor() for example] is 
        // defined, call it.
        if (operator[this.customGetValuesFunction] && 
            isc.isA.Function(operator[this.customGetValuesFunction])) 
        {
            if (valueField) {
                // normal operator with a value
                values = operator[this.customGetValuesFunction](fieldName, valueField, includeEmptyValues);
                
                if (values && operator && operator.condition) {
                    if (operator.ID && operator.ID != values[this.operatorAttribute]) {
                        
                        values[this.operatorAttribute] = operator.ID;
                    }
                }
            } else if (startField && endField) {
                // range operator with start and end values
                var startCriterion = operator[this.customGetValuesFunction](fieldName, startField),
                    endCriterion = operator[this.customGetValuesFunction](fieldName, endField);
                values.fieldName = startCriterion.fieldName;
                values[this.operatorAttribute] = startCriterion.operator;
                values[rangeStartAttribute] = startCriterion.value;
                values[rangeEndAttribute] = endCriterion.value;
            }
        } else {
            // other circumstances (like isNull and notNull, which have no values)
            if (valueField) values[valueAttribute] = valueField.getValue();
            if (startField) values[rangeStartAttribute] = startField.getValue();
            if (endField) values[rangeEndAttribute] = endField.getValue();
        }
    }

    // flag dates as logicalDates unless the field type inherits from datetime
    var field = this.getField(fieldName);
    if (values && isc.isA.Date(values[this.valueAttribute]) && 
        (!field || !isc.SimpleType.inheritsFrom(field.type, "datetime"))) 
    {
        values[valueAttribute].logicalDate = true;
    }
    return values;
},

// setClauseValues() - update the clause form items to reflect the object passed in

setCustomValuseFunction:"setCriterion",
setClauseValues : function (fieldName, operator, values) {
    if (this.clause == null) return;

    var clause = this.clause,
        valueField = clause.getField("value"),
        startField = clause.getField("start"),
        endField = clause.getField("end"),
        
        valueAttribute = operator.valueAttribute || this.valueAttribute,
        rangeStartAttribute = operator.rangeStartAttribute || this.rangeStartAttribute,
        rangeEndAttribute = operator.rangeEndAttribute || this.rangeEndAttribute;
    
    
    
    // Call the custom setter to update custom components if necessary.
    if (operator[this.customSetValuesFunction] && 
        isc.isA.Function(operator[this.customSetValuesFunction])) 
    {
        if (valueField) {
            operator[this.customSetValuesFunction](fieldName, valueField, values);
        } else {
            
            operator[this.customSetValuesFunction](fieldName, startField, values);
            operator[this.customSetValuesFunction](fieldName, endField, values);
        }
    // no custom setter - just update the value field or range start/end
    } else {
        if (valueField) valueField.setValue(values[valueAttribute]);
        if (startField) startField.setValue(values[rangeStartAttribute]);
        if (endField) endField.setValue(values[rangeEndAttribute]);
    }
},

setDefaultFocus : function () {
    if (!this.clause) return;
    if (isc.isA.Function(this.clause.focusInItem)) this.clause.focusInItem("fieldName");
},

//> @method filterClause.validate
// Validate this clause.
// @return (Boolean) true if if the clause is valid, false otherwise
// @visibility external
//<
validate : function () {
    return this.clause ? this.clause.validate(null, null, true) : true;
},

itemChanged : function () {
    if (this.creator && isc.isA.Function(this.creator.itemChanged)) this.creator.itemChanged();
},

valueChanged : function (valueField, form) {
},

fieldNameChanged : function () {
    var enableItem = this.clause.getValue("fieldName") != null &&
                        this.clause.getValue("fieldName") != "";
    this.clause.getItem("operator").disabled = !enableItem;
    this.updateFields();
},

removeValueFields : function (typeChanged) {
    if (!this.clause) return;
    this.removeValueField("value", typeChanged);
    this.removeValueField("valuePath", typeChanged);
    this.removeValueField("rangeSeparator", typeChanged);
    this.removeValueField("start", typeChanged);
    this.removeValueField("end", typeChanged);
},

removeValueField : function (fieldName, typeChanged) {
    var form = this.clause,
        field = form.getItem(fieldName)
    ;
    if (field) {
        var value = field.getValue()

        // if value is a Date and value._fromRelativeDate is set to something, its from
        // a RelativeDateItem, and we want to restore that value when the fields are 
        // re-added, rather than the absolute date
        if (value && value._fromRelativeDate) value = value._fromRelativeDate;

        form.removeItem(field);
        if (!typeChanged) form.setValue(fieldName, value);
    }
},

operatorChanged : function () {
    if (!this.clause) return;

    var form = this.clause,
        fieldName = this.fieldName || form.getValue("fieldName")
    ;

    if (fieldName == null) return;

    var field = this.getField(fieldName);
    var operator = this.getSearchOperator(form.getValue("operator"), field);
    
    this.updateValueItems(field,operator,fieldName);
},

// Note: In the case where we are linked to multiple dataSources fieldName can differ from
// field.name (due to the dataSource ID prefix)
updateValueItems : function (field,operator,fieldName) {

    var form = this.clause;
    var oldValueItem = form.getItem("value");
    var oldValueType = oldValueItem ? oldValueItem.valueType : null;
    var oldValue = oldValueItem ? oldValueItem.getValue() : null;

    oldValueItem = null;
    this.removeValueFields();
    if (fieldName) form.removeExtraAdvancedCriteriaFields([fieldName]);

    var items = this.buildValueItemList(field, operator, fieldName)

    form.addItems(items);
    var valueItem = form.getItem("value");
    var valuePathItem = form.getItem("valuePath");
    var newValueType = valueItem ? valueItem.valueType : null;
    
    // keep the value if there's a new valueItem and retainValuesAcrossFields is set (default)
    var keepValue = valueItem != null && newValueType != null && this.retainValuesAcrossFields;

    if (keepValue) {
        if (valueItem.optionDataSource ||
            // operator valueType changed (eg, was a "valueRange" and is now a "valueSet")
            (newValueType != oldValueType && 
                // if it was a fieldType and is now a valueSet, retain the value - single value 
                // into an array of one item is fine, no need to clear the value
                (oldValueType != "fieldType" && newValueType != "valueSet")) || 
            (valueItem.getValueMap() && valueItem._valueInValueMap && 
                     !valueItem._valueInValueMap(oldValue))
            ) 
        {
            keepValue = false;
        }
    }

    if (!keepValue) {
            //isc.logWarn("clearing value =-= types from " + oldValueType + " to " + newValueType);
        if (valueItem) valueItem.clearValue();
        if (valuePathItem) valuePathItem.clearValue();
    }

    if (this.dynamicValueButton) {
        if (valuePathItem) {
            this.dynamicValueButton.show();
        } else {
            this.dynamicValueButton.hide();
        }
    }
},

updateOperatorDefault : function (field) {
    var item = this.clause.getItem("operator");
    if (item) {
        var ds = this.getPrimaryDS(field);
        if (ds) {
            // pass the param field object here - if passed the name, 
            // ds.getFieldDefaultOperator() will call ds.getField() which will fail if
            // ds is a fieldDataSource where fields are defined in ds-records
            item.defaultValue = ds.getFieldDefaultOperator(field);
            var ops = this._getFieldOperators(field);
            if (ops && ops.length > 0) {
                if (!ops.contains(item.defaultValue)) item.defaultValue = ops[0];
                if (!ops.contains(item.getValue())) item.clearValue();
            }
        } else {
            item.defaultValue = isc.SimpleType.getDefaultOperator(field.type);
        }
    }
},

// updateFields() Fired when the user changes the fieldName field of this clause.
// Opportunity to determine the newly selected field type and update the operator valueMap and
// appropriate valueFields.
updateFields : function () {
    if (!this.clause) return;

    var form = this.clause,
        oldFieldName = this._lastFieldName,
        fieldName = this.fieldName || form.getValue("fieldName")
    ;
    if (fieldName == null) return;
    if (fieldName == oldFieldName) return;

    var field = this.getField(fieldName),
        oldField = this.getField(oldFieldName);

    if (!field) return;

    this.updateOperatorDefault(field);
    
    // note this setValueMap() call means if an operator was already chosen, it will be
    // preserved unless no longer valid for the new field
    form.getItem("operator").setValueMap(
        this.getFieldOperatorMap(field, false, "criteria", true)
    );
    
    var operator = form.getValue("operator");

    if (operator == null || form.getValue("operator") != operator) {
        // if the operator was lost from the valueMap, the value will have been cleared
        // Reset to the first option
        
        if (form.getValue("operator") == null) {
            var opItem = form.getField("operator");
            var val = opItem.defaultValue;
            // if opItem.defaultValue isn't in the operator-pickList, defaultToFirstOption
            if (val && !opItem.getValueMap()[val]) val = opItem.getFirstOptionValue();
            opItem.setValue(val);
        }
        operator = form.getValue("operator");
    }

    // Now we've got the operator type we want, normalize it to a config object
    operator = this.getSearchOperator(operator, field);

    var typeChanged;
    if (form.getItem("value")) {
        var currentType = form.getItem("value").type,
            newType = field.type || "text";

        var isEnumNewField = newType == "intEnum" ||
                            newType == "enum" ||
                            isc.SimpleType.inheritsFrom(newType, "enum") ||
                            isc.SimpleType.inheritsFrom(newType, "intEnum");

        typeChanged = isEnumNewField || currentType != newType;
    }

    // otherwise rebuild the value fields
    this.removeValueFields(typeChanged);
    if (oldFieldName) this.clause.removeExtraAdvancedCriteriaFields([oldFieldName]);
    form.addItems(this.buildValueItemList(field, operator, fieldName));
    if (this.dynamicValueButton) {
        if (form.getItem("valuePath")) {
            this.dynamicValueButton.show();
        } else {
            this.dynamicValueButton.hide();
        }
    }

    // Clear out the currently entered value if 
    //    1) the valueField data type has changed
    //    2) the new valueField has a valueMap and the current value doesn't appear in it
    //    3) either the old or new field has a valueMap or optionDataSource
    //    4) this.retainValuesAcrossFields is false
    var valueItem = form.getItem("value");
    if (!typeChanged) {
        var shouldClear = (
            (field.valueMap || field.optionDataSource) ||
            (oldField && (oldField.valueMap || oldField.optionDataSource)) || 
            !this.retainValuesAcrossFields
        );

        if (valueItem && shouldClear) valueItem.clearValue();
    }
    
    // validate the fields to update the error-icon
    if (valueItem) valueItem.validate();
    // For now always clear out range fields - also re-validate them
    if (form.getItem("start")) {
        form.setValue("start", null);
        form.getItem("start").validate();
    }
    if (form.getItem("end")) {
        form.setValue("end", null);
        form.getItem("end").validate();
    }

    // Show valuePath instead of value if set
    if (form.getValue("valuePath") != null) {
        form.getItem("value").hide();
        form.getItem("valuePath").show();
    }

    
    this._lastFieldName = fieldName;
},

// Wrapper for getFieldOperators. Internal calls pass field but
// filterClause.getFieldOperators, which is public and overridable,
// takes a fieldName. Extract the fieldName and pass both.
_getFieldOperators : function (field) {
    var fieldName = field && field.name;
    return this.getFieldOperators(fieldName, field);
},

//> @method filterClause.getFieldOperators()
// Get the list of +link{OperatorId, operatorIds} that are valid for this field.  By default, 
// calls through to the same method on +link{filterBuilder.getFieldOperators, filterBuilder},
// which defaults to all operators returned by +link{dataSource.getFieldOperators()}.
// <P>
// Called whenever the fieldName is changed.
// 
// @param fieldName (String) the name of the field for which to return the set of available 
//           operators
// @return (Array of OperatorId) valid operators for this field
// @visibility external
//<
getFieldOperators : function (fieldName, field) {
    var filterBuilder = this.getFilterBuilder();
    if (!filterBuilder) return null;

    field = field || this.getField(fieldName);
    return filterBuilder.getFieldOperators(fieldName, field);
},

// called when the user changes the topOperator via a form - inline only.  We only implement
// it so we can use the same form config for builder-level and clause-level topOperators
topOperatorChanged : function (newOp) {
},



dynamicValueButtonClick : function () {
    var fieldTitle = this.getFieldTitle(),
        windowTitle = this.dynamicValueWindowTitle.evalDynamicString(this, { fieldTitle: fieldTitle }),
        valuePath = this.clause.getValue("valuePath")
    ;
    if (!this.dynamicValueWindow) {
        var fieldName = this.getFieldName(),
            pathField = (this.multiDSFieldFormat == isc.FilterBuilder.SEPARATED ? "title" : "name"),
            valueSelected = function(value) {
                this.creator.setClauseValuePath(value);
            }
        ;
        this.createDynamicValueWindow(windowTitle, fieldName, pathField, valuePath, valueSelected);
    } else {
        this.dynamicValueWindow.setTitle(windowTitle);
        this.dynamicValueWindow.setSelectedValue(valuePath);
    }

    this.dynamicValueWindow.show();
},

setClauseFieldName : function (fieldName) {
    var form = this.clause,
        oldFieldName = form.getValue("fieldName")
    ;
    if (oldFieldName != fieldName) {
        form.setValue("fieldName", fieldName);
        this.fieldNameChanged();
    }
},

setClauseValuePath : function (valuePath) {
    var form = this.clause;
    if (valuePath != null) {
        form.setValue("valuePath", valuePath);
        form.getItem("value").defaultValue = null;
        form.getItem("value").clearValue();
    } else {
        form.getItem("valuePath").defaultValue = null;
        form.getItem("valuePath").clearValue();
    }
    if (valuePath) {
        form.getItem("valuePath").show();
        form.getItem("value").hide();
    } else {
        form.getItem("valuePath").hide();
        form.getItem("value").show();
    }
    // fire filterChanged
    if (isc.isA.Function(this.filterBuilder.filterChanged)) {
        this.filterBuilder.filterChanged();
    }
},

dynamicValueWindowConstructor: "DynamicValuePicker",
dynamicValueWindowDefaults: {
    okButtonClick : function (value) {
        var record = this.ruleScopeGrid.getSelectedRecord();
        if (record && this.valueSelected) {
            this.valueSelected(record.criteriaPath || record.name);
        }
        this.closeClick();
    }
},

createDynamicValueWindow : function (title, fieldName, pathField, valuePath, valueSelected) {
    this.dynamicValueWindow = this.createAutoChild("dynamicValueWindow", {
        title: title,

        ruleScopeDataSources: this._ruleScopeDataSources,
        targetRuleScope: this.getTopLevelFilterBuilder()._targetRuleScope,
        targetComponent: this.getTopLevelFilterBuilder().targetComponent,
        multiDSFieldFormat: this.multiDSFieldFormat,
        selectedValue: valuePath,
        valueSelected: valueSelected
    });
}

});



isc.FilterClause.registerStringMethods({
    remove : ""
});


//> @class FilterBuilder
// A form that allows the user to input advanced search criteria, including operators on
// field values such as "less than", and sub-clauses using "AND" and "OR" operators.
// <P>
// A FilterBuilder produces an +link{AdvancedCriteria} object, which the +link{DataSource}
// subsystem can use to filter datasets, including the ability to perform such filtering within
// the browser for datasets that are completely loaded.
// <P>
// The operators available for each field can be customized at the DataSource level via
// +link{DataSourceField.validOperators}, +link{DataSource.setTypeOperators()} and related
// APIs.
//
// @inheritsFrom Layout
// @treeLocation Client Reference/Forms
// @visibility external
//<
isc.defineClass("FilterBuilder", "Layout");

isc.FilterBuilder.addClassProperties({
//> @attr filterBuilder.missingFieldPrompt (String: "[missing field definition]" : IR)
// The message to display next to fieldNames that do not exist in the available dataSource.
// @group i18nMessages
// @visibility external
//<
missingFieldPrompt: "[missing field definition]",


//> @type MultiDSFieldFormat
// @value isc.FilterBuilder.SEPARATED each DataSource's fields are listed by their titles,
//                                    indented underneath heading lines that show 
//                                    +link{DataSource.pluralTitle} + " Fields"
// @value isc.FilterBuilder.QUALIFIED each DataSources field is listed without separators,
//                                    qualified with the DataSource ID, like
//                                    <code>dataSourceId</code>.<code>fieldName</code>
//<

//> @classAttr FilterBuilder.SEPARATED (Constant : "separated" : [R])
// A declared value of the enum type  
// +link{type:MultiDSFieldFormat,MultiDSFieldFormat}.
// @constant
//<
SEPARATED:"separated",

//> @classAttr FilterBuilder.QUALIFIED (Constant : "qualified" : [R])
// A declared value of the enum type  
// +link{type:MultiDSFieldFormat,MultiDSFieldFormat}.
// @constant
//<
QUALIFIED:"qualified"

});

isc.FilterBuilder.addClassMethods({


//> @classMethod filterBuilder.getFilterDescription()
// @include DataSource.getAdvancedCriteriaDescription
// @visibility external
//<

getFilterDescription : function (criteria, dataSource) {
    return isc.DataSource.getAdvancedCriteriaDescription(criteria, dataSource);
}

});

isc.FilterBuilder.addProperties({


// Layout: be a minimum height stack by default
// ---------------------------------------------------------------------------------------
vertical:false,
vPolicy:"none",
height:1,
defaultWidth:400,

//> @attr filterBuilder.fieldDataSource (DataSource : null : IR)
// If specified, the FilterBuilder will dynamically fetch DataSourceField definitions from 
// this DataSource rather than using +link{filterBuilder.dataSource}.  The +link{fieldPicker} 
// will default to being a +link{ComboBoxItem} rather than a +link{SelectItem} so that the user 
// will have type-ahead auto-completion.
// <P>
// The records returned from the <code>fieldDataSource</code> must have properties 
// corresponding to a +link{DataSourceField} definition, at a minimum, 
// +link{DataSourceField.name,"name"} and +link{DataSourceField.type,"type"}.  Any property 
// legal on a DataSourceField is legal on the returned records, including 
// +link{DataSourceField.valueMap,valueMap}.
// <P>
// Even when a <code>fieldDataSource</code> is specified, +link{filterBuilder.dataSource} may
// still be specified in order to control the list of 
// +link{DataSource.setTypeOperators,valid operators} for each field.
//
// @visibility external
//<

//> @attr filterBuilder.sortFields (Boolean : true : IR)
// Should the +link{fieldPicker} items be sorted alphabetically in the drop down list.
// @visibility external
//<
sortFields:true,

//> @attr filterBuilder.fieldPicker (MultiAutoChild PickList : null : IR)
// AutoChild for the +link{FormItem} that allows a user to pick a DataSource field when 
// creating filter clauses.
// <P>
// This will be a +link{SelectItem} by default, or a +link{ComboBoxItem} if
// +link{filterBuilder.fieldDataSource} has been specified.
//
// @visibility external
//<

fieldPickerDefaults: { 
    //editorType: "SelectItem", 
    name: "fieldName", 
    textMatchStyle: "startsWith",
    showTitle: false,
    hint: "Choose a field",
    showHintInField: true,
    changed : function () { this.form.creator.fieldNameChanged(this.form); }
},

//> @attr filterBuilder.fieldPickerTitle (String : "Field Name" : IR)
// The title for the +link{filterBuilder.fieldPicker, field-picker} select-item.
// @group i18nMessages
// @visibility external
//<
fieldPickerTitle: "Field Name",

//> @attr filterBuilder.fieldPickerProperties (FormItem Properties : null : IR)
// Properties to combine with the +link{fieldPicker} autoChild FormItem.
//
// @visibility external
//<

//> @attr filterBuilder.operatorPicker (MultiAutoChild SelectItem : null : IR)
// AutoChild for the +link{FormItem} that allows a user to select the operator
// when creating filter clauses. Each clause will create an operatorPicker automatically.
// To customize this item, use +link{operatorPickerProperties}
//
// @visibility external
//<

//> @attr filterBuilder.operatorPickerProperties (FormItem Properties : null : IR)
// Properties to combine with the +link{operatorPicker} autoChild FormItem.
//
// @visibility external
//<
operatorPickerDefaults : {
    // list of operators
    name:"operator", 
    editorType: "SelectItem", 
    showTitle:false, 
    // don't allow addUnknownValues - it's a fixed list applicable to the selected field
    addUnknownValues:false, 
    defaultToFirstOption:true,
    changed : function () { this.form.creator.operatorChanged(this.form); }
},

//> @attr filterBuilder.operatorPickerTitle (String : "Operator" : IR)
// The title for the operator-picker select-item.
// @group i18nMessages
// @visibility external
//<
operatorPickerTitle: "Operator",

//> @attr filterBuilder.fieldPickerWidth (Integer | String : "*" : IR)
// Width for the field picker formItem displayed in clauses within this FilterBuilder.
// @visibility external
//<
fieldPickerWidth: "*",

//> @attr filterBuilder.operatorPickerWidth (Integer | String : 150 : IR)
// Width for the operator picker formItem displayed in clauses within this FilterBuilder.
// @visibility external
//<
operatorPickerWidth: 150,

//> @attr filterBuilder.valueItemWidth (Integer | String : 150 : IR)
// Width for the value-chooser formItem displayed in clauses within this FilterBuilder.
// Note that depending on the selected operator type, this item may not be displayed, or
// may have different characteristics. See +link{getValueFieldProperties()} for information
// on customizing the value item.
// 
// @visibility external
//<
valueItemWidth: 150,


// Rule scope
//---------------------------------------------------------------------------------------

//> @attr filterBuilder.targetRuleScope (Canvas | String : null : IR)
// Component used to look up the +link{canvas.ruleScope,ruleScope} for use with
// +link{allowRuleScopeValues} and +link{createRuleCriteria}.
// <p>
// Specifying a <code>targetRuleScope</code> automatically enables <code>allowRuleScopeValues</code>
// unless that property has been explicitly set to <code>false</code>.
// @visibility reify
//<

//> @attr filterBuilder.allowRuleScopeValues (boolean : null : IR)
// Enables an interface for the end user to set +link{criterion.valuePath} based on the 
// +link{canvas.ruleScope,ruleScope} provided by +link{targetRuleScope}.  
// <p>
// This mode produces +link{group:dynamicCriteria,Dynamic Criteria} that can be used with
// properties that support dynamic criteria, such as +link{formItem.optionCriteria}.  See also
// +link{createRuleCriteria} for producing criteria that are evaluated against the
// <code>ruleScope</code> itself rather than against normal DataSource records, for use with
// properties like +link{formItem.visibleWhen}.
// <p>
// If criteria provided contain +link{criterion.valuePath} settings but
// no ruleScope is provided, a warning will be logged and the <code>criterion</code> will be
// treated as if it had a null value, with the <code>valuePath</code> setting ignored.
// @visibility reify
//<

//> @attr filterBuilder.excludedRuleScope (Array of String : null : IR)
// A list of paths that should be excluded from +link{targetRuleScope} dynamic value selection
// when +link{createRuleCriteria} is enabled. A common use is to exclude the current
// field which would be invalid.
// @visibility reify
//<

//> @attr filterBuilder.createRuleCriteria (boolean : null : IR)
// Enables a mode for editing +link{group:ruleCriteria}, that is, criteria designed to be
// evaluated against the +link{canvas.ruleScope} as opposed to against normal DataSource
// records.  The produced criteria are intended for settings like
// +link{formItem.readOnlyWhen}.
// <p>
// Specify the ruleScope to use via +link{targetRuleScope}.  Available fields
// from the <code>ruleScope</code> appear in the +link{fieldPicker}.  +link{dataSource} is
// no longer required in this mode.
// <p>
// This mode is generally complimentary with +link{allowRuleScopeValues}.
// @visibility reify
//<

//> @attr filterBuilder.multiDSFieldFormat (MultiDSFieldFormat : "separated" : IR)
// Controls how field names appear in the field picker when
// +link{filterBuilder.dataSources,multiple DataSources} are configured.
//<
multiDSFieldFormat: isc.FilterBuilder.SEPARATED,

//> @attr filterBuilder.dynamicValuePrefix (String : "Dynamic:" : IR)
// The prefix to be displayed before a valuePath value in the clause.
// @group i18nMessages
// @visibility reify
//<
dynamicValuePrefix: "Dynamic:",

//> @attr filterBuilder.dynamicValueButtonPrompt (String : "Select dynamic value" : IR)
// The hover prompt text for the dynamic value button.
// @group i18nMessages
// @visibility reify
//<
dynamicValueButtonPrompt: "Select dynamic value",

//> @attr filterBuilder.dynamicValueWindowTitle (HTMLString : "Choose dynamic value for field ${fieldTitle}" : IR)
// The title for the window that opens when a dynamic value is selected.
// <P>
// This is a dynamic string - text within <code>&#36;{...}</code> are dynamic variables and will 
// be evaluated as JS code when the message is displayed.
// <P>
// Only one dynamic variable, fieldTitle, is available. 
// @group i18nMessages
// @visibility reify
//<
dynamicValueWindowTitle: "Choose dynamic value for field ${fieldTitle}",

//> @attr filterBuilder.dynamicValueClearValueText (String : "&lt;Use static value instead&gt;" : IR)
// The message to display in picker for entry reverting selection to manual entry.
// @group i18nMessages
// @visibility reify
//<
dynamicValueClearValueText: "&lt;Use static value instead&gt;",


// Schema and operators
// ---------------------------------------------------------------------------------------

//> @attr filterBuilder.dataSource (DataSource | ID : null : IRW)
// DataSource this filter should use for field definitions and available +link{Operator}s.
// @visibility external
//< 
setDataSource : function(ds) {
    var aDS = isc.DataSource.get(ds);
    if (!aDS || !this.dataSource || (isc.DataSource.get(this.dataSource).ID != aDS.ID)) {
        this.dataSource = aDS;
        if (this.clauses) this.clearCriteria();
        else this.rebuild();
    }
},

//> @attr filterBuilder.dataSources (Array of DataSource : null : IRW)
// List of DataSources this filter should use for field definitions
// and available +link{Operator}s. This property is mutually exclusive of
// +link{dataSource}.
// @visibility reify
//<


setDataSources : function (dsList) {
    this.dataSources = dsList;
    if (this.clauses) this.clearCriteria();
    else this.rebuild();
},

//> @attr filterBuilder.criteria (AdvancedCriteria : null : IRW)
// Initial criteria.
// <P>
// When initialized with criteria, appropriate clauses for editing the provided criteria will
// be automatically generated.
// <P>
// Note that empty or partial criteria are allowed, for example, criteria that specify
// +link{criterion.fieldName} only will generate an expression with the operator not chosen
// yet, and a +link{criterion} with a logical operator ("and" or "or") but not
// +link{criterion.criteria,subcriteria} defined will generate an empty subclause.
// @visibility external
//<

//> @attr filterBuilder.saveOnEnter (boolean : null : IR)
// If true, when the user hits the Enter key while focused in a text-item in this 
// FilterBuilder, we automatically invoke the user-supplied +link{filterBuilder.search()} method.
// @visibility external
//< 

//> @attr filterBuilder.showHiddenFields (Boolean : null : IR)
// By default only non-hidden fields are shown for selection. To include hidden fields for
// selection set this property to <code>true</code>.
//
// @visibility external
//< 

//> @attr filterBuilder.showFieldTitles (Boolean : true : IR)
// If true (the default), show field titles in the drop-down box used to select a field for querying.
// If false, show actual field names instead.
//
// @visibility external
//< 
showFieldTitles: true,

//> @attr filterBuilder.validateOnChange (Boolean : true : IR)
// If true (the default), validates each entered value when it changes, to make sure it is a 
// a valid value of its type (valid string, number, and so on).  No other validation is 
// carried out.  If you switch this property off, it is still possible to validate the 
// <code>FilterBuilder</code> by calling +link{filterBuilder.validate()} from your own code.
// @visibility external
//< 
validateOnChange: true,

//> @attr filterBuilder.allowedFields (Array of String : null : IR)
// List of explicit fields for user field selection. If not specified, the list of fields is
// derived from the +link{filterBuilder.dataSource,dataSource}.
// <P>
// Note: this property is not a security feature as it only controls the UI. To consistently
// limit searchability for certain fields use +link{DataSourceField.canFilter,canFilter}.
//
// @see showHiddenFields
// @visibility external
//< 

// Add/remove buttons
// ---------------------------------------------------------------------------------------
  
//> @attr filterBuilder.showRemoveButton (Boolean : true : IR)
// If set, a button will be shown for each clause allowing it to be removed.
// @visibility external
//<
showRemoveButton:true,

//> @attr filterBuilder.removeButtonPrompt (String : "Remove" : IR)
// The hover prompt text for the remove button.
//
// @group i18nMessages 
// @visibility external
//<
removeButtonPrompt: "Remove",

//> @attr filterBuilder.lastClausePrompt (String : "The last clause cannot be removed" : IRW)
// The hover prompt text for the remove button in the last remaining clause, when 
// +link{filterBuilder.allowEmpty, allowEmpty} is false. 
//
// @group i18nMessages 
// @visibility external
//<
lastClausePrompt: "The last clause cannot be removed",

//> @attr filterBuilder.removeButton (AutoChild ImgButton : null : IR)
// The removal ImgButton that appears before each clause if
// +link{showRemoveButton} is set.
// @visibility external
//<
removeButtonDefaults : {
    _constructor:isc.ImgButton,
    width:18, height:18, layoutAlign:"center",
    src:"[SKIN]/actions/remove.png",
    showRollOver:false, showDown:false,
    //prompt:"Remove",
    click: function () { this.creator.removeButtonClick(this.clause); }
},

//> @attr filterBuilder.showAddButton (Boolean : true : IR)
// If set, a button will be shown underneath all current clauses allowing a new clause to be
// added.
// @visibility external
//<
showAddButton:true,

//> @attr filterBuilder.addButtonPrompt (String : "Add" : IR)
// The hover prompt text for the add button.
//
// @group i18nMessages 
// @visibility external
//<
addButtonPrompt: "Add", 

//> @attr filterBuilder.addButton (AutoChild ImgButton : null : IR)
// An ImgButton that allows new clauses to be added if +link{showAddButton}
// is set.
// @visibility external
//<
addButtonDefaults : {
    _constructor:isc.ImgButton,
    autoParent:"buttonBar",
    layoutAlign: "center",
    width:18, height:18, 
    imageWidth: 10, imageHeight: 10,
    src:"[SKIN]/actions/add.png",
    showRollOver:false, showDown:false, 
    //prompt:"Add",
    click: function () { this.creator.addButtonClick(this.clause); }
},

buttonBarDefaults : {
    _constructor:isc.HStack,
    autoParent:"clauseStack",
    membersMargin:4, 
    defaultLayoutAlign:"center",
    height:1
},

addButtonClick : function () {
    this.addNewClause();
},

removeButtonClick : function (clause) {
    if (!clause) return;
    this.removeClause(clause);
},

//> @method filterBuilder.removeClause()
// Remove a clause this FilterBuilder is currently showing.
// @param clause (FilterClause) clause as retrieved from filterBuilder.clauses
// @visibility external
//<
removeClause : function (clause) {
    // remove the clause from the clauses array and destroy it
    this.clauses.remove(clause);
    if (this.clauseStack) this.clauseStack.hideMember(clause, function () { clause.destroy(); });
    // update the first removeButton
    this.updateFirstRemoveButton();
    if (this.clauses[0] && this.clauses[0].updateInlineTopOperator) this.clauses[0].updateInlineTopOperator();
    clause.filterBuilder = null;
    // fire filterChanged
    if (isc.isA.Function(this.filterChanged)) this.filterChanged();
},

//> @attr filterBuilder.allowEmpty (Boolean : false : IR)
// If set to false, the last clause cannot be removed.
// @visibility external
//<

//> @attr filterBuilder.showLastRemoveButton (Boolean : null : IR)
// If set to false and showing clause +link{showRemoveButton,remove buttons}
// and +link{allowEmpty,the last clause cannot be removed} the remove clause button
// will be hidden.
// @visibility external
//<

updateFirstRemoveButton : function () {
    var firstClause = this.clauses[0];

    if (!firstClause || !firstClause.removeButton) return;

    if (this.clauses.length == 1 && !this.allowEmpty) {
        firstClause.removeButton.disable();
    } else if (this.clauses.length > 1) {
        firstClause.removeButton.enable();
    }
},

isFirstClause : function (clause) {
    return this.clauses[0] == clause;
},
 
// Top-level Operator  
// ---------------------------------------------------------------------------------------

//> @type LogicalOperator
// Operators that can evaluate a set of criteria and produce a combined result.
//
// @value "and" true if all criteria are true
// @value "or" true if any criteria are true
// @value "not" true if all criteria are false
// @visibility external
//< 

//> @attr filterBuilder.retainValuesAcrossFields (Boolean : true : IRW)
// Dictates whether values entered by a user should be retained in the value fields when a 
// different field is selected.  Default value is true.
// <P>
// Note that, when switching between fields that have an optionDataSource or valueMap, this
// property is ignored and the values are never retained.
// @visibility external
//<
retainValuesAcrossFields: true,


//> @attr filterBuilder.topOperatorOptions (Array of OperatorId : ["and", "or", "not"] : IR)
// Logical operators to allow for +link{topOperatorAppearance}s of "radio" and "bracket".
// <P> Note that this list may be further limited according to the 
// +link{DataSource.getTypeOperatorMap, available operators} returned by the 
// +link{class:DataSource}. 
// 
// @visibility external
//<
topOperatorOptions: ["and", "or", "not"],

//> @attr filterBuilder.topOperator (LogicalOperator : "and" : IRW)
// Default logical operator for all top-level clauses in the FilterBuilder.
// <P>
// May be able to be changed by the user via the UI, according to +link{topOperatorAppearance}.
// @visibility external
//<
topOperator: "and",

//> @attr filterBuilder.radioOptions (Array of OperatorId : ["and", "or", "not"] : IR)
// Logical operators to allow if we have a +link{topOperatorAppearance} of "radio".
//
// @visibility external
// @deprecated in favor of +link{topOperatorOptions}.
//<
//radioOptions: ["and", "or", "not"],

//> @method filterBuilder.setTopOperator()
// Programmatically change the +link{topOperator} for this FilterBuilder.
// @param operator (LogicalOperator) new top-level operator
// @visibility external
//<
setTopOperator : function (newOp) {
    this.topOperator = newOp;
    var appearance = this.topOperatorAppearance;

    if (appearance == "bracket") {
        this.topOperatorForm.setValue("operator", newOp);
    } else if (appearance == "radio") {
        this.radioOperatorForm.setValue("operator", newOp);
    }
},

// called when the user changes the topOperator via a form
topOperatorChanged : function (newOp) {
    this.topOperator = newOp;
    if (isc.isA.Function(this.filterChanged)) this.filterChanged();

},

//> @type TopOperatorAppearance
// Interface to use for showing and editing the +link{filterBuilder.topOperator,top-level operator} 
// of a FilterBuilder.
//
// @value "radio" radio buttons appear at the top of the form
//
// @value "bracket" a SelectItem appears with a "bracket" spanning all top-level clauses,
// exactly the same appearance used for showing
// +link{filterBuilder.showSubClauseButton,subClauses}, if enabled.
//
// @value "inline" each line in the FilterBuilder is a top-level item, with a SelectItem shown
// on the left that allows the user to choose between the main operator in force (either "and"
// or "or", depending on the setting of topOperator) and "and not".
//
// @value "none" no interface is shown.  The top-level operator is expected to be shown to
// the user outside the FilterBuilder, and, if editable, +link{filterBuilder.setTopOperator()}
// should be called to update it
// @visibility external
//<

//> @attr filterBuilder.topOperatorAppearance (TopOperatorAppearance : "bracket" : IRW)
// How to display and edit the +link{topOperator,top-level operator} for this FilterBuilder.
// <P>
// See +link{type:TopOperatorAppearance} for a list of options.
// @visibility external
//<
topOperatorAppearance:"bracket", 

//> @method filterBuilder.setTopOperatorAppearance() 
// Modify +link{topOperatorAppearance} at runtime.
// <P>
// Note that when changing from "bracket" to "radio" mode the criteria
// will be flattened by calling +link{DataSource.flattenCriteria} which could
// result in a logical change to the criteria.
//
// @param appearance (TopOperatorAppearance) new topOperatorAppearance
// @group  formTitles
// @visibility external
// @example formLayoutTitles
//<
setTopOperatorAppearance : function (appearance) {
    if (this.topOperatorAppearance == appearance) return;
    // Keep current criteria for new form
    var criteria = this._getCriteria(true);

    if (this.topOperatorAppearance == "bracket" && appearance == "radio") {
        criteria = isc.DataSource.flattenCriteria(criteria);
    }
    this.topOperatorAppearance = appearance;

    this._recreateForm(criteria);
},

//> @attr filterBuilder.radioOperatorLayout (AutoChild HLayout : null : IR)
// HLayout of radioOperationForm and optional modeSwitcher.
// @visibility external
//<
radioOperatorLayoutDefaults : {
    autoParent:"clauseStack",
    _constructor:isc.HLayout,
    height:1,
    width:1,
    defaultLayoutAlign: "bottom"
},

//> @attr filterBuilder.radioOperatorForm (AutoChild DynamicForm : null : IR)
// With +link{topOperatorAppearance}:"radio", form that appears above the stack of clauses
// and allows picking the +link{LogicalOperator} for the overall FilterBuilder.
// <P>
// By default, consists of a simple RadioGroupItem.
// @visibility external
//<
radioOperatorFormDefaults : {
    autoParent:"radioOperatorLayout",
    height:1, numCols:1, colWidths:["*"], width:275,
    items : [
        { name:"operator", type:"radioGroup", 
          showTitle:false, title:"Overall Operator", wrapTitle: false, wrap: false,
          vertical:false,
          changed : function (form, item, value) {
              form.creator.topOperatorChanged(value);
          }
        }
    ]
},
radioOperatorFormConstructor: isc.DynamicForm,

//> @attr filterBuilder.modeSwitcher (AutoChild Label : null : IR)
// Label to change between simple and advanced mode. When clicked the filter mode
// is switched to the other mode. This label is only shown if
// +link{showModeSwitcher, showModeSwitcher} is true.
// <P>
// Shows either +link{modeSwitcherSimpleMessage,modeSwitcherSimpleMessage} or
// +link{modeSwitcherAdvancedMessage,modeSwitcherAdvancedMessage}
// depending on the current state of the filter.
// @visibility external
//<
modeSwitcherDefaults : {
    height:30,
    autoFit:true,
    wrap:false,
    cursor:"pointer",
    click : function () {
        this.creator.switchMode();
    }
},
modeSwitcherConstructor: isc.Label,

//> @attr filterBuilder.radioOperatorTitle (String : "Overall Operator" : IR)
// The title for the Operator RadioGroupItem displayed in the +link{radioOperatorForm}.
// @group i18nMessages
// @visibility external
//<
radioOperatorTitle: "Overall Operator",

//> @attr filterBuilder.showSelectionCheckbox (Boolean : false : IR)
// If true, causes a CheckboxItem to appear to the left of each clause in "inline" 
// +link{topOperatorAppearance,appearance}.  This checkbox allows the user to select 
// individual clauses so that, for example, clauses can be removed from the filterBuilder 
// by application code.  This property is ignored for appearances other than "inline".
// @visibility external
//<

//> @attr filterBuilder.topOperatorForm (AutoChild DynamicForm : null : IR)
// With +link{topOperatorAppearance} "bracket" and "inline", a form that appears to the left
// of the stack of clauses and allows picking the +link{LogicalOperator} for the overall 
// FilterBuilder (or for that specific FilterClause, in the case of "inline")
// <P>
// By default, consists of a CheckboxItem if +link{showSelectionCheckbox} is true, and a 
// simple SelectItem containing the available logical operators.
// <P>
// If this FilterBuilder shows nested sub-clauses, the same defaults will be applied to the
// top-operator item for each sub-clause.
//
// @visibility external
//<

topOperatorFormDefaults : {
    height:1, 
    width:80, numCols:1, colWidths:["*"],
    layoutAlign:"top",
    _constructor:isc.DynamicForm
},

//> @attr filterBuilder.topOperatorItem (AutoChild SelectItem : null : IR)
// Automatically generated SelectItem autoChild shown in the +link{topOperatorForm}.
// Developers may customize this item using the standard autoChild pattern (by
// modifying <code>topOperatorItemDefaults</code> and 
// <code>topOperatorItemProperties</code>).
// <P>
// If this FilterBuilder shows nested sub-clauses, the same defaults will be applied to the
// top-operator item for each sub-clause.
//
// @visibility external
//<
topOperatorItemDefaults:{ 
    name:"operator",
    editorType: "SelectItem",
    showTitle:false,
    changed : function (form, item, value) {
        form.creator.topOperatorChanged(value);
    }
},

//> @attr filterBuilder.topOperatorItemWidth (Number | String : "*" : IR)
// Width for the +link{topOperatorItem} autoChild.
// @visibility external
//<
topOperatorItemWidth:"*",

//> @attr filterBuilder.topOperatorTitle (String : "Clause Operator" : IR)
// The title for the left-aligned Operator selectItem in the +link{topOperatorForm}.
// @group i18nMessages
// @visibility external
//<
topOperatorTitle: "Clause Operator",

//> @attr filterBuilder.defaultSubClauseOperator (LogicalOperator : "or" : IR)
// Default operator for subclauses added via the +link{subClauseButton}.
// @visibility external
//<
defaultSubClauseOperator:"or",

//> @attr FilterBuilder.matchAllTitle (String : "Match All" : IR)
// Title for the "Match All" (and) operator 
// when using +link{topOperatorAppearance,topOperatorAppearance}:"radio".  
// @group i18nMessages
// @visibility external
//<
matchAllTitle: "Match All",

//> @attr FilterBuilder.matchNoneTitle (String : "Match None" : IR)
// Title for the "Match None" (not) operator
// when using +link{topOperatorAppearance,topOperatorAppearance}:"radio".
// @group i18nMessages
// @visibility external
//<
matchNoneTitle: "Match None",

//> @attr FilterBuilder.matchAnyTitle (String : "Match Any" : IR)
// Title for the "Match Any" (or) operator
// when using +link{topOperatorAppearance,topOperatorAppearance}:"radio".
// @group i18nMessages
// @visibility external
//<
matchAnyTitle: "Match Any",

//> @attr FilterBuilder.inlineAndTitle (String : "and" : IR)
// Title for the "And" operator (only applicable to the "inline" appearance)
// @group i18nMessages
// @visibility external
//<
inlineAndTitle: "and",

//> @attr FilterBuilder.inlineOrTitle (String : "or" : IR)
// Title for the "Or" operator (only applicable to the "inline" appearance)
// @group i18nMessages
// @visibility external
//<
inlineOrTitle: "or",

//> @attr FilterBuilder.inlineAndNotTitle (String : "and not" : IR)
// Title for the "And Not" operator (only applicable to the "inline" appearance)
// @group i18nMessages
// @visibility external
//<
inlineAndNotTitle: "and not",

//> @attr FilterBuilder.modeSwitcherAdvancedMessage (String : "Advanced.." : IR)
//Title for the "Advanced.." mode switcher label (only applicable to the "radio" appearance).
//@group i18nMessages
//@visibility external
//<
modeSwitcherAdvancedMessage: "Advanced..",

//> @attr FilterBuilder.modeSwitcherSimpleMessage (String : "Simple Mode.." : IR)
// Title for the "Simple Mode.." mode switcher label (only applicable to the "bracket" appearance).
// @group i18nMessages
// @visibility external
//<
modeSwitcherSimpleMessage: "Simple Mode..",

//> @attr FilterBuilder.modeSwitcherFlattenWarningMessage (String : "Criteria will be modified to fit in simpler editing interface" : IR)
// Message displayed when switching to "radio" mode if the criteria will be logically changed.
// @group i18nMessages
// @visibility external
//<
modeSwitcherFlattenWarningMessage: "Criteria will be modified to fit in simpler editing interface",

//> @attr filterBuilder.showModeSwitcher (boolean : null : IR)
// When enabled allows FilterBuilder in <code>topOperatorAppearance:"radio"</code> or 
// <code>topOperatorAppearance:"bracket"</code> mode to be switch to the other view by the user.
// "radio" mode is considered simple where "bracket" mode is advanced mode.
// <P>
// Note that when switching from "bracket" to "radio" mode any entered criteria will be
// flattened by calling +link{DataSource.flattenCriteria}. If the criteria cannot be
// flattened without losing symantics (see +link{DataSource.canFlattenCriteria}) the user is
// prompted to confirm.
// <P>
// If showModeSwitcher is set and topOperatorAppearance is unset:
// <ul>
// <li> when first drawn, the filterBuilder will choose which mode to use based on the
//      provided +link{filterBuilder.criteria} if any: advanced mode ("bracket") will be used if
//      AdvancedCriteria are provided which cannot be flattened without loss of data (see
//      +link{DataSource.canFlattenCriteria()}), otherwise simple mode ("radio") will be used. 
// <li> for any calls to +link{filterBuilder.setCriteria()} after draw, the FilterBuilder will
//      switch to advanced mode if the criteria cannot be shown in simple mode without losing
//      information, but will never automatically switch to simple mode, but an explicit call
//      +link{setTopOperatorAppearance,setTopOperatorAppearance("radio")} can be used to do so.
// </ul>
//
// @see modeSwitcherSimpleMessage
// @see modeSwitcherAdvancedMessage
// @see modeSwitcherFlattenWarningMessage
//
// @visibility external
//<

// Init
// ---------------------------------------------------------------------------------------

// getPrimaryDS() - this returns the dataSource used to drive field operators etc.

getPrimaryDS : function (fieldName) {
    if (this.dataSources) {
        if (fieldName == null) {
            return isc.DataSource.get(this.dataSources[0]);
        }
        if (isc.isAn.Object(fieldName)) {
            if (fieldName._origField != null) {
                fieldName = fieldName._origField;
            }
            for (var i = 0; i < this.dataSources.length; i++) {
                var fields = isc.getValues(this.dataSources[i].getFields());
                if (fields.contains(fieldName)) return this.dataSources[i];
            }
            fieldName = fieldName.name;
        }
        return isc.DataSource.getDataSourceForField(fieldName, this.dataSources);
    }
    if (this.dataSource) return this.getDataSource();
    else if (this.fieldDataSource) return this.fieldDataSource;
},

getTopOperatorMap : function (type) {
    var ds = this.getPrimaryDS(),
        map = type == "bracket" ? 
                ds ? ds.getTypeOperatorMap(null, true, "criteria") : null : null
    ;

    if (!map || isc.isAn.emptyObject(map)) {
        map =  {
            "and": this.matchAllTitle,
            "or": this.matchAnyTitle,
            "not": this.matchNoneTitle
        };
    }
    var topOp = this.topOperator,
        options = this.topOperatorOptions,
        result = {}
    ;

    if (!options.contains(topOp)) this.topOperator = options[0];
    
    if (map) {
        for (var i = 0; i<options.length; i++) {
            if (map[options[i]]) result[options[i]] = map[options[i]];
        }
    }

    return result;
},

initWidget : function () {
    this.Super("initWidget", arguments);

    if (this.targetRuleScope) {
        if (this.allowRuleScopeValues != false) this.allowRuleScopeValues = true;

        var canvas = this.targetRuleScope;
        this._targetRuleScope = (isc.isA.String(canvas) ? window[canvas] : this.targetRuleScope);
        
        if (!this._ruleScopeDataSources) {
            this._ruleScopeDataSources = isc.Canvas.getAllRuleScopeDataSources(this._targetRuleScope);
            this._destroyRuleScopeDataSources = true;
        }

        if (this.createRuleCriteria) {
            this.dataSource = null;
            this.dataSources = this._ruleScopeDataSources;
        }
    }

    this.rebuild();
},
destroy : function () {
    if (this._ruleScopeDataSources && this._destroyRuleScopeDataSources) {
        // Destroy auto-generated DataSources used for field picking.
        // These DataSources are identified because of the _tempScope
        // special property.
        for (var i = 0; i < this._ruleScopeDataSources.length; i++) {
            var ds = this._ruleScopeDataSources[i];
            if (ds._tempScope) {
                ds.destroy();
            }
        }
    }
    this.Super("destroy", arguments);
},
rebuild : function () {
    if (isc.isA.String(this.fieldDataSource)) 
        this.fieldDataSource = isc.DS.get(this.fieldDataSource);

    if (isc.isA.String(this.dataSource)) 
        this.dataSource = isc.DS.get(this.dataSource);

    if (!this.getPrimaryDS()) this.logInfo("No available DataSources.");
    
    if (this.fieldDataSource && this.criteria) this._initializingClauses = true;

    this.fieldPickerDefaults.title = this.fieldPickerTitle;

    
    if (this.radioOptions) this.topOperatorOptions = this.radioOptions.duplicate();
    delete this.radioOptions;

    // set strings for button defaults
    this.addButtonDefaults.prompt = this.addButtonPrompt;
    this.removeButtonDefaults.prompt = this.removeButtonPrompt;
    this.subClauseButtonDefaults.prompt = this.subClauseButtonPrompt;
    this.subClauseButtonDefaults.title = this.subClauseButtonTitle;

    this._createForm();
},
_recreateForm : function (criteria) {
    this.criteria = criteria;

    // Reset form so it can be completed recreated
    delete this.showSubClauseButton;
    this.topOperatorForm = this.bracket = this.clauseStack = null;
    this.radioOperatorForm = this.radioOperatorLayout = this.modeSwitcher = null;
    this.buttonBar = this.addButton = this.subClauseButton = null;

    for (var i = 0, clauses = this.clauses; i < clauses.length; i++) {
        clauses[i].destroy();
    }
    var members = this.getMembers().duplicate();
    for (var i = 0; i < members.length; i++) {
        this.removeMember(members[i]);
        members[i].destroy();
    }

    this._createForm();
},
_createForm : function () {
    var undef;
    if (this.showSubClauseButton == undef) {
        this.showSubClauseButton = (this.topOperatorAppearance != "radio" &&
                                    this.topOperatorAppearance != "inline");
    }
    
    this.clauses = [];

    var topOp = this.topOperatorAppearance;

    
    var ds = this.getPrimaryDS(),
        tempMap = this.getTopOperatorMap(topOp)
    ;

    if (this.showModeSwitcher) {
        var contents = "<span style='color:blue;text-decoration:underline;'>" +
            (topOp == "radio" ? this.modeSwitcherAdvancedMessage : this.modeSwitcherSimpleMessage) +
            "</span>";
        this.modeSwitcher = this.createAutoChild("modeSwitcher", { contents:contents });
    }

    if (topOp == "bracket") {
        if (this.showTopRemoveButton) {
            // When the FilterBuilder is being used as a subclause it needs a remove button.
            // Our parent FilterBuilder could tack one on, but only by introducing an extra
            // layer of nesting, so we manage it here.
            var removeButton = this.removeButton = this.createAutoChild("removeButton", {
                click : function () { 
                    this.creator.parentClause.removeButtonClick(this.creator);
                }
            });
            this.addMember(removeButton);
        }
        var opFormConfig = {
            items:[isc.addProperties(
                    {width:this.topOperatorItemWidth}, 
                     this.topOperatorItemDefaults, this.topOperatorItemProperties
                   )]
        };
        this.addAutoChild("topOperatorForm", opFormConfig);
        
        this.topOperatorForm.items[0].title = this.topOperatorTitle;
        this.topOperatorForm.items[0].valueMap = tempMap;
        this.topOperatorForm.items[0].defaultValue = this.topOperator;

        this.addAutoChild("bracket");
    } 
    this.addAutoChild("clauseStack");
    this.clauseStack.hide();
    if (topOp == "radio") {
        this.addAutoChild("radioOperatorLayout");
        this.addAutoChild("radioOperatorForm");
        var radioMap = tempMap;
        
        this.radioOperatorForm.items[0].title = this.radioOperatorTitle;
        this.radioOperatorForm.items[0].valueMap = radioMap; 
        this.radioOperatorForm.items[0].defaultValue = this.topOperator;
        if (this.showModeSwitcher) this.radioOperatorLayout.addMember(this.modeSwitcher);
    }
    this.addAutoChildren(["buttonBar", "addButton", "subClauseButton"]);
    if (this.showModeSwitcher && topOp == "bracket") {
        this.buttonBar.addMember(isc.LayoutSpacer.create({ width:20 }));
        this.buttonBar.addMember(this.modeSwitcher);
    }

    // support criteria being passed with null elements
    this.stripNullCriteria(this.criteria);
    this._setCriteria(this.criteria);
    
},


//> @attr filterBuilder.clauseStack (AutoChild VStack : null : IR)
// VStack of all clauses that are part of this FilterBuilder
// @visibility external
//<
clauseStackDefaults : {
    _constructor:isc.VStack,
    height:1,
    membersMargin:1, // otherwise brackets on subclauses are flush
    animateMembers: true,
    animateMemberTime: 150
},

// Switch between simple and advanced mode (radio and bracket)
switchMode : function () {
    if (this.topOperatorAppearance == "bracket") {
        var criteria = this._getCriteria(true);
        if (!isc.DataSource.canFlattenCriteria(criteria)) {
            var _this = this;
            isc.confirm(this.modeSwitcherFlattenWarningMessage, function(value) {
                if (value) _this.setTopOperatorAppearance("radio");
            });
            return;
        }
        this.setTopOperatorAppearance("radio");
    } else {
        this.setTopOperatorAppearance("bracket");
    }
},

// Clause creation
// ---------------------------------------------------------------------------------------

clauseConstructor: "FilterClause",


addNewClause : function (criterion, field, negated) {
    // extraOperators is a list of operators used by this criterion - tagged onto fields when 
    // passed to DS.getFieldOperatorMap(), which includes them in it's return value, even if 
    // they're marked as hidden.  Makes hidden operators available if they're used in 
    // AdvancedCriteria passed to FilterBuilder.setCriteria()
    var extraOperators;
    if (criterion) {
        extraOperators = [];
        isc.DS._getAdvancedCriteriaOperators(criterion, extraOperators);
    }

    var filterClause = this.createAutoChild("clause", 
      isc.addProperties({}, this.inheritedClauseProperties, 
      {
        visibility: "hidden",
        flattenItems: true,
        criterion: criterion,
        
        // Various ways we can define dataSources/field configs...
        dataSources: this.dataSources,
        dataSource: this.dataSource,
        fieldDataSource: this.fieldDataSource,
        _ruleScopeDataSources: this._ruleScopeDataSources,
        // copy sortFields onto the 'clause' so buildValueItemList can 
        // apply the appropriate defaults to the pickList
        sortFields:this.sortFields,

        allowedFields: this.allowedFields,

        validateOnChange: this.validateOnChange,
        showHiddenFields: this.showHiddenFields,
        showFieldTitles: this.showFieldTitles,
        showRemoveButton: this.showRemoveButton,
        removeButtonPrompt: this.removeButtonPrompt,
        retainValuesAcrossFields: this.retainValuesAcrossFields,
        // this fieldName passed in from LG's "Advanced Filtering" menuItem
        defaultFieldName: this.defaultFieldName,
        field: field,
        fieldData: this.fieldData,
        fieldPickerDefaults: this.fieldPickerDefaults,
        fieldPickerProperties: this.fieldPickerProperties,
        
        fieldPickerWidth: this.fieldPickerWidth,
        operatorPickerWidth: this.operatorPickerWidth,
        valueItemWidth: this.valueItemWidth,

        operatorPickerDefaults: this.operatorPickerDefaults,
        operatorPickerProperties: this.operatorPickerProperties,
        remove : function () {
            this.creator.removeClause(this);
        },
        fieldNameChanged : function () {
            this.Super("fieldNameChanged", arguments);
            this.creator.fieldNameChanged(this);
        },
        topOperatorAppearance: this.topOperatorAppearance,
        topOperator: this.topOperator,
        topOperatorOptions: this.topOperatorOptions,

        topOperatorFormDefaults: this.topOperatorFormDefaults,
        topOperatorFormProperties: this.topOperatorFormProperties,
        topOperatorItemDefaults: this.topOperatorItemDefaults,
        topOperatorItemProperties: this.topOperatorItemProperties,
        topOperatorItemWidth: this.topOperatorItemWidth,
        
        showSelectionCheckbox: this.showSelectionCheckbox,
        negated: negated,
        filterBuilder: this,
        width: "100%",
        
        multiDSFieldFormat: this.multiDSFieldFormat,
        
        dynamicValuePrefix: this.dynamicValuePrefix + " ",
        dynamicValueButtonPrompt: this.dynamicValueButtonPrompt,
        dynamicValueWindowTitle: this.dynamicValueWindowTitle,
        dynamicValueClearValueText: this.dynamicValueClearValueText,
        allowRuleScopeValues: this.allowRuleScopeValues,
        createRuleCriteria: this.createRuleCriteria,

        inheritedClauseProperties:this.inheritedClauseProperties,
        
        // operators used in the passed Criterion - always available in this clause, even if 
        // marked as hidden
        extraOperators: extraOperators
      })
    );
    
    var rtnVal = this._addClause(filterClause);
    filterClause.updateInlineTopOperator();
    return rtnVal;
},

//> @method filterBuilder.addClause()
// Add a new +link{FilterClause} to this FilterBuilder.
// <P>
// This API is intended for the rare use case of adding a highly customized FilterClause
// component that does not include the standard field/operator/value picking interface, instead
// providing a custom interface and returning a criterion via +link{filterClause.getCriterion()}.
// <P>
// If you just want to programmatically add a new FilterClause showing a specific Criterion use
// +link{addCriterion()}.
// <P>
// If you want to use the standard field/operator/value interface but provide a custom control
// for editing the value, see +link{DataSource.addSearchOperator} and +link{Operator.editorType}.
// 
// @param filterClause (FilterClause) A +link{FilterClause} instance
// @visibility external
//<
addClause : function (filterClause) {
    // add the passed filterClause
    if (!filterClause) return filterClause;

    var _this = this;
    

    filterClause.fieldDataSource = this.fieldDataSource;
    filterClause.remove = function () {
        _this.removeClause(this);
    };
    filterClause.fieldNameChanged = function () {
        this.Super("fieldNameChanged", arguments);
        _this.fieldNameChanged(this);
    };

    var rtnVal = this._addClause(filterClause);
    filterClause.updateInlineTopOperator();
    return rtnVal;
},

_addClause : function (filterClause) {
    filterClause.filterBuilder = this;

    // Refresh the clause's fields so it can
    // pick up context from the filterBuilder
    filterClause.updateFields();
    this.clauses.add(filterClause);

    var clauseStack = this.clauseStack,
        position = Math.max(0, clauseStack.getMemberNumber(this.buttonBar)),
        _this = this
    ;

    clauseStack.addMember(filterClause, position);
    clauseStack.showMember(filterClause, 
        function () { 
            if (!_this._settingCriteria) filterClause.setDefaultFocus(); 
        }
    );

    this.updateFirstRemoveButton();
    // fire filterChanged
    if (isc.isA.Function(this.filterChanged)) this.filterChanged();
    return filterClause;
},

//> @method filterBuilder.getChildFilters()
// Returns an array of child +link{class:FilterBuilder}s, representing the list of complex 
// clauses, or an empty array if there aren't any.
// 
// @return (Array of FilterBuilder) The list of complex clauses for this filterBuilder
// @visibility external
//<
getChildFilters : function () {
    var childFilters = [];

    for (var i = 0; i<this.clauses.length; i++) {
        var filter = this.clauses[i];
        if (isc.isA.FilterBuilder(filter)) childFilters.add(filter);
    }

    return childFilters;
},

// override setFocus() to set the default focus (fieldName picker) on the first clause
setFocus : function (focus) {
    if (focus && this.clauses && this.clauses[0]) this.clauses[0].setDefaultFocus();
    else this.Super("setFocus", arguments);
},

//> @method filterBuilder.getFilterDescription()
// Returns a human-readable string describing the clauses in this filterBuilder.
// 
// @return (String) Human-readable string describing the clauses in the passed criteria
// @visibility external
//<
getFilterDescription : function () {
    return isc.DataSource.getAdvancedCriteriaDescription(this._getCriteria(),
            // getAdvancedCriteriaDescription handles being passed an array of DS's and criteria with
            // a dataSource.fieldName type fieldName.
            (this.dataSources || this.dataSource));
},

//> @attr filterBuilder.rangeSeparator (String : "and" : IR)
// For operators that check that a value is within a range, text to show between the start and
// end input fields for specifying the limits of the range.
// @visibility external
// @group i18nMessages
//<
rangeSeparator: "and",

//> @method filterBuilder.validate
// Validate the clauses of this FilterBuilder.
// @return (Boolean) true if all clauses are valid, false otherwise
// @visibility external
//<
validate : function () {
    var valid = true;
    for (var i = 0; i < this.clauses.length; i++) {
        if (!this.clauses[i].validate(null, null, true)) valid = false;
    }
    return valid;
},


//> @method filterBuilder.getFieldOperators()
// Get the list of +link{OperatorId, operatorIds} that are valid for the passed field.  By 
// default, all operators returned by +link{dataSource.getFieldOperators()} are used.
// <P>
// Called automatically by the default implementation of the same method on each
// +link{filterClause.getFieldOperators, clause}, whenever its fieldName is changed.
// 
// @param fieldName (String) the name of the field for which to return the set of available operators
// @return (Array of OperatorId) valid operators for this field
// @visibility external
//<
getFieldOperators : function (fieldName, field) {
        
    field = field || fieldName;

    var ds = this.getPrimaryDS(field);
    return ds ? ds.getFieldOperators(field) : null;
},

//> @method filterBuilder.getValueFieldProperties()
// 
// Override to return properties for the FormItem(s) used for the "value" field displayed within
// clauses within this filterBuilder.
// <P>
// Note that the +link{operator.valueType} impacts when this method is called. For operators with
// valueType <code>"fieldType"</code> or <code>"custom"</code>, a single value field is displayed.
// For operators with valueType <code>"valueRange"</code> two value-field items are displayed
// (one for the start and one for the end position). The <code>valueItemType</code> parameter may
// be used to determine which form item is being generated.
// 
// @param type (FieldType) type of the DataSource field for this filter row
// @param fieldName (String) name of the DataSource field for this filter row
// @param operatorId (OperatorId) +link{OperatorId} for the chosen operator
// @param itemType (ValueItemType) What valueItem is being generated.
//
// @return (FormItem Properties) properties for the value field
// @visibility external
//<
getValueFieldProperties : function (type, fieldName, operatorId, itemType) {
    // This is recursive - this filterBuilder could be a subclause of a parent filterBuilder!
    if (this.filterBuilder) {
        return this.filterBuilder.getValueFieldProperties(type,fieldName,operatorId,itemType);
    }
},


getRangeSeparatorProperties : function (type, fieldName, operatorId) {
    return this.rangeSeparatorProperties;
},


// Subclauses
// ---------------------------------------------------------------------------------------

//> @attr filterBuilder.showSubClauseButton (Boolean : See Description : IR)
// Whether to show a button that allows the user to add subclauses.  Defaults to false if 
// the +link{topOperatorAppearance} is "radio" or "inline", true in all other cases.
// @visibility external
//<

//> @attr filterBuilder.subClauseButtonTitle (String : "+()" : IR)
// The title of the subClauseButton
//
// @group i18nMessages 
// @visibility external
//<
subClauseButtonTitle: "+()",

//> @attr filterBuilder.subClauseButtonPrompt (String : "Add Subclause" : IR)
// The hover prompt text for the subClauseButton.
//
// @group i18nMessages 
// @visibility external
//<
subClauseButtonPrompt: "Add Subclause",

//> @attr filterBuilder.subClauseButton (AutoChild IButton : null : IR)
// Button allowing the user to add subclauses grouped by a +link{type:LogicalOperator}.
// @visibility external
//<
subClauseButtonDefaults : {
    _constructor:"IButton",
    autoParent:"buttonBar",
    //title:"+()", // need an icon for this
    autoFit:true,
    //prompt:"Add Subclause",
    click : function () { this.creator.addSubClause(this.clause); }
},

//> @attr filterBuilder.bracket (MultiAutoChild Canvas : null : IR)
// Widget used as a "bracket" to hint to the user that a subclause groups several
// field-by-field filter criteria under one logical operator.
// <P>
// By default, a simple CSS-style Canvas with borders on three sides.  A vertical StretchImg
// could provide a more elaborate appearance.
// @visibility external
//<
bracketDefaults : {
    styleName:"bracketBorders", 
    width:10
},

childResized : function () {
    this.Super("childResized", arguments);
    if (this.clauseStack) {
        var height = this.clauseStack.getVisibleHeight();
        if (this.bracket) this.bracket.setHeight(height);
        if (this.topOperatorAppearance == "bracket") {
            // shift the topOperatorForm to be v-centered beside the bracket
            this.topOperatorForm.setTopPadding((height-this.topOperatorForm.getItem(0).getHeight())/2);
        }
    }
},
draw : function () {
    this.Super("draw", arguments);
    if (this.clauseStack) {
        var height = this.clauseStack.getVisibleHeight();
        if (this.bracket) this.bracket.setHeight(height);
        if (this.topOperatorAppearance == "bracket") {
            // shift the topOperatorForm to be v-centered beside the bracket
            this.topOperatorForm.setTopPadding((height-this.topOperatorForm.getItem(0).getHeight())/2);
        }
    }

    if (!this._initedTopOp && !this.parentClause && this.showModeSwitcher && this.topOperatorAppearance == "bracket") {
        var criteria = this._getCriteria(true);
        if (isc.DataSource.canFlattenCriteria(criteria)) this.setTopOperatorAppearance("radio");
        this._initedTopOp = true;
    }

},
resized : function () {
    if (this.clauseStack && this.bracket) this.bracket.setHeight(this.clauseStack.getVisibleHeight());
},

addSubClause : function (criterion) {
    var operator;
    if (criterion) {
        operator = criterion.operator;
    }
    var clause = this.createAutoChild("subClause", {
        dataSource:this.dataSource,
        dataSources:this.dataSources,
        showFieldTitles:this.showFieldTitles,
        showHiddenFields: this.showHiddenFields,
        allowedFields: this.allowedFields,
        filterBuilder:this,
        parentClause:this,
        retainValuesAcrossFields: this.retainValuesAcrossFields,
        topOperatorAppearance:"bracket",
        topOperator: operator || this.defaultSubClauseOperator || this.topOperator,
        topOperatorOptions: this.topOperatorOptions,
        clauseConstructor: this.clauseConstructor,
        
        topOperatorFormDefaults:this.topOperatorFormDefaults,
        topOperatorFormProperties:this.topOperatorFormProperties,
        topOperatorItemDefaults:this.topOperatorItemDefaults,
        topOperatorItemProperties:this.topOperatorItemProperties,
        topOperatorItemWidth: this.topOperatorItemWidth,
        
        fieldPickerDefaults: this.fieldPickerDefaults,
        fieldPickerProperties: this.fieldPickerProperties,

        subClauseButtonTitle: this.subClauseButtonTitle,
        subClauseButtonPrompt: this.subClauseButtonPrompt,
        
        fieldPickerWidth: this.fieldPickerWidth,
        operatorPickerWidth: this.operatorPickerWidth,
        valueItemWidth: this.valueItemWidth,

        operatorPickerProperties: this.operatorPickerProperties,
        operatorPickerDefaults: this.operatorPickerDefaults,
        
        fieldDataSource: this.fieldDataSource,
        fieldData: this.fieldData,
        // copy sortFields onto the 'clause' so buildValueItemList can 
        // apply the appropriate defaults to the pickList
        sortFields:this.sortFields,
        showRemoveButton: this.showRemoveButton,
        showAddButton: this.showAddButton,
        showSubClauseButton: this.showSubClauseButton,
        showTopRemoveButton: this.showSubClauseButton,
        visibility:"hidden",
        saveOnEnter: this.saveOnEnter,
        validateOnChange: this.validateOnChange,
        // We don't need (or want) to create empty children of new subclauses if we're 
        // building up the UI from a passed-in AdvancedCriteria
        dontCreateEmptyChild: criterion != null,

        _ruleScopeDataSources: this._ruleScopeDataSources,
        multiDSFieldFormat: this.multiDSFieldFormat,

        dynamicValuePrefix: this.dynamicValuePrefix + " ",
        dynamicValueButtonPrompt: this.dynamicValueButtonPrompt,
        dynamicValueWindowTitle: this.dynamicValueWindowTitle,
        dynamicValueClearValueText: this.dynamicValueClearValueText,
        allowRuleScopeValues: this.allowRuleScopeValues,
        createRuleCriteria: this.createRuleCriteria,

        // Forward all filterChanged() events to the top-most FilterBuilder.
        filterChanged : function () {
            var filterBuilder = this.filterBuilder;
            while (filterBuilder.filterBuilder != null) {
                filterBuilder = filterBuilder.filterBuilder;
            }
            // Fire filterChanged
            if (isc.isA.Function(filterBuilder.filterChanged)) {
                filterBuilder.filterChanged();
            }
        },
        // Forward all getFieldOperators() calls to the top-most FilterBuilder.
        getFieldOperators : function (fieldName, field) {
            var filterBuilder = this.filterBuilder;
            while (filterBuilder.filterBuilder != null) {
                filterBuilder = filterBuilder.filterBuilder;
            }
            // return the result of getFieldOperators on the top-most filterBuilder
            if (isc.isA.Function(filterBuilder.getFieldOperators)) {
                return filterBuilder.getFieldOperators(fieldName, field);
            }
        },
        // This object allows us to set top level properties which will be
        // applied to each nested FilterClause we create, recursively down subclauses.
        inheritedClauseProperties:this.inheritedClauseProperties
    }, this.Class);

    this.clauses.add(clause);

    this.clauseStack.addMember(clause, this.clauses.length-1);
    this.clauseStack.showMember(clause, function () { 
        clause.topOperatorForm.focusInItem("operator");
        clause.bracket.setHeight(clause.getVisibleHeight());
    });

    // update the firstRemoveButton on the containing clause
    this.updateFirstRemoveButton();

    return clause;
},


// Deriving AdvancedCriteria
// ---------------------------------------------------------------------------------------

//> @method filterBuilder.getCriteria()
// Get the criteria entered by the user.
// 
// @param [includeEmptyValues] (boolean) By default if a user has selected a field and operator
//   type, but has failed to enter a value for the field it will be skipped. This optional parameter
//   allows you to retrieve all criteria, including those with an empty <code>value</code> attribute.
// @return (AdvancedCriteria)
// @visibility external
//<

getCriteria : function (includeEmptyValues) {
    return this._getCriteria(includeEmptyValues);
},


_getCriteria : function (includeEmptyValues) {
    if (this._initializingClauses) {
        // if we were initialized with criteria and the clauses are still being created, just 
        // return the criteria we were initialized with
        return this.criteria;
    }
    
    if (this.topOperatorAppearance == "inline") {
        return this.getInlineCriteria(includeEmptyValues);
    }

    var criteria = {
        _constructor:"AdvancedCriteria",
        operator:this.topOperator,
        criteria:[]
    };

    for (var i = 0; i < this.clauses.length; i++) {
        var clause = this.clauses[i],
            criterion,
            skipCriterion = false;

        if (isc.isA.FilterBuilder(clause)) {
            criterion = clause._getCriteria(includeEmptyValues);
        } else {
            criterion = clause.getCriterion(includeEmptyValues);
            skipCriterion = (criterion == null);
        }
        if (!skipCriterion) {
            criteria.criteria.add(criterion);
        } 
    }

    // Return a copy - the original contains pointers to the live screen objects
    if (this.createRuleCriteria) {
        // Translate DS.name fieldNames to criteriaPath format for external use
        criteria = this._translateFieldNamesToCriteriaPaths(criteria);
    } else {
        criteria = isc.clone(criteria);
    }
    return criteria;
},

getInlineCriteria : function (includeEmptyValues) {
    var criteria = {
        _constructor:"AdvancedCriteria",
        operator:this.topOperator,
        criteria:[]
    };
    
    if (this.topOperator == "or") {
        // If we have any "and not"s, we need to bundle everything under a top-level
        // "and"
        var orAndNot;
        for (var i = 0; i < this.clauses.length; i++) {
            if (this.clauses[i].topOperatorForm.getValue("operator") == "not") {
                orAndNot = true;
                break;
            }
        }
        if (orAndNot) {
            criteria.operator = "and";
            var orCriteria = {
                operator: "or",
                criteria: []
            }
            criteria.criteria.add(orCriteria);
        }
    }
    
    for (var i = 0; i < this.clauses.length; i++) {
        var clause = this.clauses[i];
        var operator = clause.topOperatorForm.getValue("operator");
        if (operator == this.topOperator) {
            if (orAndNot) {
                orCriteria.criteria.add(clause.getCriterion(includeEmptyValues));
            } else {
                criteria.criteria.add(clause.getCriterion(includeEmptyValues));
            }
        } else {
            criteria.criteria.add({
                operator: "not",
                criteria: [ clause.getCriterion(includeEmptyValues) ]
            });
        }
    }
    return criteria;
},

// fired when this builder is ready for interactive use
filterReady : function () { },

//> @method filterBuilder.setCriteria()
// Set new criteria for editing.  
// <P>
// An interface for editing the provided criteria will be generated identically to what happens
// when initialized with +link{criteria}.
// <P>
// Any existing criteria entered by the user will be discarded.  
// 
// @param criteria (AdvancedCriteria) new criteria.  Pass null or {} to effectively reset the
//                                    filterBuilder to it's initial state when no criteria are
//                                    specified
// @visibility external
//<
setCriteria : function (criteria) {
    this._setCriteria(criteria);

    if (this.showModeSwitcher) {
        var appearance = this.topOperatorAppearance,
            canFlatten = isc.DataSource.canFlattenCriteria(criteria)
        ;
        if (appearance == "bracket" && canFlatten) {
            this.setTopOperatorAppearance("radio");
        } if (appearance != "bracket" && !canFlatten) {
            this.setTopOperatorAppearance("bracket");
        }
    }
},

_setCriteria : function (criteria) {

    this.clearCriteria(true);

    var animation = this.clauseStack ? this.clauseStack.animateMembers : null;
    if (this.clauseStack) this.clauseStack.animateMembers = false;

    this.stripNullCriteria(criteria);

    this._settingCriteria = true;
    
    if (!this._loadingFieldData && this.fieldDataSource && criteria) {
        // fetch the necessary field-entries so they can be passed into the filterClauses
        if (isc.isA.String(this.fieldDataSource)) {
            this.fieldDataSource = isc.DS.getDataSource(this.fieldDataSource);
        }
        
        var _this = this,
            fieldsInUse = this.fieldDataSource.getCriteriaFields(criteria),
            fieldCriteria = {}
        ;

        if (fieldsInUse && fieldsInUse.length > 0) {
            // construct an advanvcedCriteria to use when requesting used fields from the 
            // fields DS
            fieldCriteria = { _constructor: "AdvancedCriteria", operator: "or", criteria: [] };
            for (i=0; i<fieldsInUse.length; i++) {
                var fieldName = fieldsInUse[i],
                    cachedField = this.fieldData ? this.fieldData[fieldName] : null;

                if (!cachedField) {
                    fieldCriteria.criteria[fieldCriteria.criteria.length] = 
                        { fieldName: "name", operator: "equals", value: fieldName };
                }
            }

            if (fieldCriteria.criteria.length != 0) {
                this._loadingFieldData = true;
                this.fieldDataSource.fetchData(fieldCriteria, 
                    function (data) {
                        _this.fetchFieldsReply(data, criteria);
                    }
                );
                return;
            }
        }
    }

    if (!criteria) {
        if (!this.allowEmpty && !this.dontCreateEmptyChild) this.addNewClause();
        this.clauseStack.show();
        this.redraw();
        this.filterReady();
        return;
    }
    
    
    if (!isc.DataSource.isAdvancedCriteria(criteria, this.getPrimaryDS())) {
        // The textMatchStyle we pass here is kind of arbitrary...
        criteria = isc.DataSource.convertCriteria(criteria, "substring", this.getPrimaryDS());
    }

    if (this.topOperatorAppearance == "inline") {
        return this.setInlineCriteria(criteria, animation);
    }

    this.setTopOperator(criteria.operator);

    if (this.createRuleCriteria) {
        // Translate criteriaPath fieldNames into DS.name format for internal use
        criteria = this._translateCriteriaPathsToFieldNames(criteria);
    }
    
    if ((!criteria.criteria || criteria.criteria.length == 0) &&
        !this.topOperatorOptions.contains(criteria.operator)) 
    {
        // AdvancedCriteria can validly consist of just an operator like lessThan and a field,
        // but the FilterBuilder assumes a top-level logical operator and need conversion for
        // this case
        this.logWarn("Found top-level AdvancedCriteria with no sub-criteria. Converting " +
                     "to a top-level 'and' with a single sub-criterion");
        this.setTopOperator(this.topOperatorOptions.contains(this.topOperator) ? this.topOperator : "and");
        this.addNewClause(criteria);     
    } else {
        for (var i = 0; i < criteria.criteria.length; i++) {
            var criterion = criteria.criteria[i],
                field = this.fieldData ? this.fieldData[criterion.fieldName] : null;
            this.addCriterion(criterion, field);
        }
        // possible in the trivial case of a top-most operator of "add" and an empty set of
        // criteria
        if (this.clauses.length == 0 && !this.allowEmpty) this.addNewClause();
    }

    delete this._initializingClauses;
    this._loadingFieldData = false;
    this._settingCriteria = false;
    this.clauseStack.show();
    this.delayCall("redraw");

    if (this.clauseStack) this.clauseStack.animateMembers = animation;
    this.filterReady();

},


_fieldCriteriaPaths:null,
_criteriaPathFields:null,
_translateFieldNamesToCriteriaPaths : function (criteria) {
    this._populateCriteriaPathMaps();
    if (!isc.isA.emptyObject(this._fieldCriteriaPaths)) {
        criteria = isc.DataSource.copyCriteria(criteria);
        this._translateFieldNames(criteria, this._fieldCriteriaPaths, "ID", true);
    }
    return criteria;
},

_translateCriteriaPathsToFieldNames : function (criteria) {
    this._populateCriteriaPathMaps();
    if (!isc.isA.emptyObject(this._criteriaPathFields)) {
        criteria = isc.DataSource.copyCriteria(criteria);
        this._translateFieldNames(criteria, this._criteriaPathFields, "criteriaBasePath");
    }
    return criteria;
},

_translateFieldNames : function (criteria, map, globalizePrefixField, localize) {
    // Translate criteria "fieldName"
    var fieldName = this._mapCriteriaFieldName(criteria, map, globalizePrefixField, localize, "fieldName");

    // Translate criteria "value" for a "fieldName" operator valueType
    var primaryDS = this.getPrimaryDS(fieldName);
    if (primaryDS) {
        var operator = primaryDS.getSearchOperator(criteria.operator);
        if (operator && operator.valueType == "fieldName") {
            this._mapCriteriaFieldName(criteria, map, globalizePrefixField, localize, "value");
        }
    }

    // Translate inner criteria
    if (criteria.criteria) {
        for (var i = 0; i < criteria.criteria.length; i++) {
            this._translateFieldNames (criteria.criteria[i], map, globalizePrefixField, localize);
        }
    }
},

_mapCriteriaFieldName : function (criteria, map, globalizePrefixField, localize, property) {
    var fieldName = criteria[property];
    if (fieldName && !fieldName.contains(".")) {
        // If field has no DataSource or path prefix it is a local
        // reference which should be translated to a global path and then mapped.
        fieldName = this._globalizeFieldName(fieldName, globalizePrefixField);
    }
    if (fieldName && map[fieldName]) {
        criteria[property] = map[fieldName];
        // localize field is specified but never do so for meta fields
        if (localize && criteria[property].contains(".") && fieldName != isc.Canvas._makeRuleScopeMetaFieldName(fieldName)) {
            // only localize field if referencing current component
            var targetCriteriaBasePath = this.targetComponent.ID + ".values.";
            criteria[property] = criteria[property].replace(targetCriteriaBasePath, "");
        }
    }
    return fieldName;
},

_globalizeFieldName : function (fieldName, prefixField) {
    var dataSources = this._ruleScopeDataSources;
    if (dataSources) {
        var targetCriteriaBasePath = this.targetComponent.ID + ".values";
        for (var i = 0; i < dataSources.length; i++) {
            if (dataSources[i].criteriaBasePath == targetCriteriaBasePath) {
                fieldName = dataSources[i][prefixField] + "." + fieldName;
                break;
            }
        }
    }
    return fieldName;
},

_populateCriteriaPathMaps : function () {
    if (this._fieldCriteriaPaths) return;

    var dataSources = this._ruleScopeDataSources,
        toPaths = {},
        toNames = {}
    ;
    if (dataSources) {
        for (var i = 0; i < dataSources.length; i++) {
            var dataSource = dataSources[i],
                criteriaBasePath = dataSource.criteriaBasePath,
                fieldNames = dataSource.getFieldNames()
            ;
            for (var j = 0; j < fieldNames.length; j++) {
                var field = dataSource.getField(fieldNames[j]),
                    dsID = (dataSource._useTagName ? dataSource.tagName : null) || dataSource.getID(),
                    name = dsID + "." + field.name
                ;
                if (criteriaBasePath || field.criteriaPath) {
                    var path = field.criteriaPath || (criteriaBasePath + "." + field.name)
                    toPaths[name] = path;
                    toNames[path] = name;
                }
            }
        }
    }

    this._fieldCriteriaPaths = toPaths;
    this._criteriaPathFields = toNames;
},

setInlineCriteria : function (criteria, animation) {
    // Inline AdvancedCriteria are expected to have a certain structure, so we'll verify that
    // first and crash out if it is not as expected
    var ok = true,
        andMode = false,
        orMode = false;
    if (criteria.operator == "and") {
        for (var i = 0; i < criteria.criteria.length; i++) {
            var clause = criteria.criteria[i];
            if (!clause.criteria) {
                andMode = true;
            } else {
                if (clause.operator == "or") {
                    orMode = true;
                    for (var j = 0; j < clause.criteria.length; j++) {
                        var subClause = clause.criteria[j];
                        if (subClause.criteria) {
                            ok = false;
                            break;
                        }
                    }
                } else {
                    if (clause.operator == "not") {
                        if (clause.criteria.length != 1 || clause.criteria[0].criteria) {
                            ok = false;
                        }
                    } else {
                        ok = false;
                    }
                }
            }
        }
    } else {
        ok = false;
    }
    
    // We must be in one of andMode or orMode, but not both
    if (ok) ok = !(andMode && orMode);
    if (ok) ok = andMode || orMode;
    
    if (!ok) {
        isc.logWarn("Trying to load an AdvancedCriteria into an 'inline' FilterBuilder, but " +
                    "the criteria is too complex to be represented in 'inline' format");
        return;
    }
    
    this.setTopOperator(andMode ? "and" : "or");
    if (andMode) {
        for (var i = 0; i < criteria.criteria.length; i++) {
            var clause = criteria.criteria[i],
                field = this.fieldData ? this.fieldData[clause.fieldName] : null;
            if (!clause.criteria) {
                this.addCriterion(clause, field);
            } else {
                // It must be a not with a single subclause
                field = this.fieldData ? this.fieldData[clause.criteria[0].fieldName] : null;
                this.addNewClause(clause.criteria[0], field, true);
            }
        }
    } else {
        // orMode
        for (var i = 0; i < criteria.criteria.length; i++) {
            var clause = criteria.criteria[i],
                field = this.fieldData ? this.fieldData[clause.fieldName] : null;
            if (clause.operator == "or") {
                for (var j = 0; j < clause.criteria.length; j++) {
                    // We've already tested that no subClause of the "or" group is itself a 
                    // criteria group
                    var subClause = clause.criteria[j];
                    field = this.fieldData ? this.fieldData[subClause.fieldName] : null;
                    this.addCriterion(subClause, field);
                }
            } else {
                // It must be a not with a single subclause
                field = this.fieldData ? this.fieldData[clause.criteria[0].fieldName] : null;
                this.addNewClause(clause.criteria[0], field, true);
            }
        }
    }

    delete this._initializingClauses;
    this._loadingFieldData = false;
    this._settingCriteria = false;
    this.clauseStack.show();
    this.delayCall("redraw");

    if (this.clauseStack) this.clauseStack.animateMembers = animation;

    this.filterReady();
    
},

stripNullCriteria : function (criteria) {
    if (criteria && criteria.criteria && criteria.criteria.length>0) {
        for (var i = criteria.criteria.length-1; i>=0; i--) {
            if (criteria.criteria[i] == null) {
                criteria.criteria.removeAt(i);
            } else {
                if (criteria.criteria[i].criteria) this.stripNullCriteria(criteria.criteria[i]);
            }
        }
    }
},

fetchFieldsReply : function (data, criteria) {
    if (this.fieldData) {
        var newFields = isc.getValues(this.fieldData);
        newFields.addList(data.data);
        this.fieldData = newFields.makeIndex("name");
    } else this.fieldData = data.data.makeIndex("name");

    this._setCriteria(criteria);
},

//> @method filterBuilder.clearCriteria()
// Clear all current criteria.
// @visibility external
//<
clearCriteria : function (dontCheckEmpty) {
    
    var animation = this.clauseStack ? this.clauseStack.animateMembers : null;
    if (this.clauseStack) this.clauseStack.animateMembers = false;

    while (this.clauses.length > 0) {
        this.removeClause(this.clauses[0]);
    }

    if (!dontCheckEmpty && !this.allowEmpty) this.addNewClause();

    if (this.clauseStack) this.clauseStack.animateMembers = animation;
},

//> @method filterBuilder.addCriterion()
// Add a new criterion, including recursively adding sub-criteria for a criterion that
// contains other criteria.
// 
// @param criterion (Criterion) new criterion to be added
// @visibility external
//<
addCriterion : function (criterion, field) {

    if (criterion.criteria) {
        var clause = this.addSubClause(criterion);
        for (var idx = 0; idx < criterion.criteria.length; idx++) {
            field = this.fieldData ? this.fieldData[criterion.criteria[idx].fieldName] : null;
            clause.addCriterion(criterion.criteria[idx], field);
        }
    } else {
        this.addNewClause(criterion, field);
    }

},

_$Enter:"Enter",
handleKeyPress: function (event, eventInfo){

    // Special case for Enter keypress: If this.saveOnEnter is true, and the enter keypress
    // occurred in a text item, and this is a top-level FilterBuilder with a search() method
    // defined, call the search() method and stop bubbling
    if (event.keyName == this._$Enter) {
        if (this.saveOnEnter) {
            if (eventInfo.firedOnTextItem) {
                if (!this.creator && this.search) {
                    this.search(this._getCriteria());
                    return isc.EH.STOP_BUBBLING;
                }
            }
        }
    }
},

itemChanged : function () {
    if (this.creator && isc.isA.Function(this.creator.itemChanged)) {
        this.creator.itemChanged();
    } else {
        if (isc.isA.Function(this.filterChanged)) {
            this.filterChanged();
        }
    }
},

fieldNameChanged : function (filterClause) {
},

// switch this on to allow the emptyValue entry in valueMapped fields
allowEmptyValues: false,

//> @method FilterBuilder.getEditorType()
// Returns the type of editor to use for the field.
// <P>
// Default behavior is to use the +link{operator.editorType} for a custom operator, otherwise, 
// use +link{RelativeDateItem} for before/after/between operators on date fields, otherwise, 
// use the same editor as would be chosen by a +link{SearchForm}.
//
// @param field (DataSourceField) DataSourceField definition
// @param operatorId (OperatorId) +link{OperatorId} for the chosen operator
// @return (SCClassName) SmartClient class to use (must be subclass of FormItem)
// @visibility external
//<
getEditorType : function (field, operatorId) {
    var ds = this.getPrimaryDS(field);
    return isc.FilterBuilder.getDefaultEditorType(field, ds, operatorId);
},


//> @method FilterBuilder.getSelectedClauses()
// Returns the list of this FilterBuilder's FilterClauses that are currently selected.  A 
// clause is "selected" if the user has checked the checkbox next to it; therefore, this 
// method always returns an empty list unless the 
// +link{showSelectionCheckbox,showSelectionCheckbox} property is set.  This method is only 
// applicable where +link{topOperatorAppearance} is "inline" (because that is the only 
// appearance that supports <code>showSelectionCheckbox</code>)
//
// @return (Array of FilterClause) The list of selected clauses
// @visibility external
//<
getSelectedClauses : function () {
    var list = [];
    if (this.showSelectionCheckbox) {
        for (var i = 0; i < this.clauses.length; i++) {
            var c = this.clauses[i];
            if (c.topOperatorForm && c.topOperatorForm.getValue("select")) {
                list.add(c);
            }
        }
    }
    return list;
}


});

isc.FilterBuilder.addClassMethods({

// Static method to determine the editorType to show for the "value" item in a filterClause
// given a field/operator pair.
// For range type operators this is used for both the min and max item

getDefaultEditorType : function  (field, ds, operatorId) {
    var editorType;
            
    
    var dupField = {};
    isc.addProperties(dupField, field);
    dupField.canEdit = field.canFilter;
    field = dupField;

    var operator = ds.getSearchOperator(operatorId, field);
    // return the operator's editorType, if it has one
    if (operator.editorType) {
        editorType = operator.editorType;
        
    } else if (operator.getEditorType && isc.isA.Function(operator.getEditorType)) {
        editorType = operator.getEditorType();
        
    } else {
        var valueType = operator ? operator.valueType : "text";
        // another field in the same DataSource
        if (valueType == "fieldName") {
            // Return explicit null - there is logic at the Clause level to handle
            // using a ComboBoxItem if there is a fieldDataSource, otherwise a SelectItem.
            editorType = null;
            
        
        } else if (valueType == "valueSet") {
            editorType = "TextAreaItem";
            
        } else if (valueType == "custom" && operator && operator.editorType) {
            editorType = operator.editorType;            
        }

    
        if (field) {
            // create a SearchForm instance so we can use completely standard SearchForm
            // editor creation logic
            
            
            // special case most operators on dates because the default behavior of using whatever a
            // SearchForm would show would actually show a date range control
            // Handled via the searchForm "defaultDateEditorType" attribute.
            var defaultDateItem =
                (operatorId == "equals" || operatorId == "notEqual" || 
                operatorId == "lessThan" || operatorId == "greaterThan" || 
                // insensitive operators don't really apply to dates but this check is here in case
                // they are explicitly supplied by a developer
                operatorId == "iBetween" || operatorId == "iBetweenInclusive" ||
                operatorId == "between" || operatorId == "betweenInclusive" ||
                operatorId == "greaterOrEqual" || operatorId == "lessOrEqual")
                        ? "RelativeDateItem" : "DateRangeItem";

            if (!this.internalSearchForm) {

                this.internalSearchForm = isc.SearchForm.create({
                    visibility: "hidden",
                    autoDraw: false,
                    useAllDataSourceFields:false, dataSource: ds, fields:[field], 
                    defaultDateEditorType:defaultDateItem
                    //allowEmptyValues: this.allowEmptyValues 
                });
                
            } else {
                this.internalSearchForm.defaultDateEditorType = defaultDateItem;
                // Note: pass the field direclty to setDataSource() and not via a discrete
                // setFields() to improve performance
                this.internalSearchForm.setDataSource(ds, [field]);
            }
            editorType = this.internalSearchForm.getEditorType(field);
        } else {
            editorType = isc.FormItemFactory.getItemClassName({}, "text", null);
        }
    }

    return editorType;
}

});

isc.FilterBuilder.registerStringMethods({
    
    //> @method filterBuilder.search()
    // A StringMethod that is automatically invoked if +link{filterBuilder.saveOnEnter} is set 
    // and the user presses Enter whilst in a text-item in any clause or subclause.
    //
    // @param criteria (AdvancedCriteria) The criteria represented by the filterBuilder
    // @visibility external
    //< 

    search : "criteria",
    
    //> @method filterBuilder.filterChanged()
    // Handler fired when there is a change() event fired on any FormItem within the 
    // filterBuilder. 
    //
    // @visibility external
    //< 

    filterChanged : ""
});

    
} // End of if (isc.DynamicForm)

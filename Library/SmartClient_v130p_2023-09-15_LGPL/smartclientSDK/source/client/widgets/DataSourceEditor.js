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
// ----------------------------------------------------------------------------------------

// If ListGrid, or DynamicForm isn't loaded don't attempt to create this class - it's a requirement.
if (isc.ListGrid != null && isc.DynamicForm != null) {

// Utility class for picking foreignKey and includeFrom properties in the DataSourceEditor.
// Provide validDsNames on creation (or set them when showing the picker).
// Fires "changed(form, value)" when the combinedValue changes, returning it as dsName.fieldName
isc.ClassFactory.defineClass("DataSourceFieldPicker", "DynamicForm");

isc.DataSourceFieldPicker.addClassProperties({
    // The warning text where we can't guess foreign keys. 
    FOREIGN_KEY_WARNING: "Could not guess which foreignKey to use. " +
                          "Determine which of your fields is the foreign key, " +
                          "and make its foreignKey property point to a field in ",
                          
    getForeignKeyWarning : function(foreignDsName) {
        return isc.DataSourceFieldPicker.FOREIGN_KEY_WARNING + "'" + foreignDsName + "'.";
    }
});

isc.DataSourceFieldPicker.addProperties({
    // An array of valid DataSource names. The DataSources need not be loaded -- the picker
    // will lazily call isc.DS.load when necessary to get field names.
    // validDsNames: null,

    // An array of records representing all known DataSources, even if we don't know that they 
    // are valid yet. If chosen, they can be lazily validated via a callback.
    // If both validDsNames and allDSNames are provided, then we will offer both lists in the
    // drop down menu, with a separator in between.
    // allDsRecords: null,

    // The required base type of the field. Leave null if any field type is fine.
    // requiredBaseType: null,

    // Try to guess a foreign key with this datasource record. The record should contain
    // at least an ID and an array of field records
    // warnIfNoForeignKey: null,

    // The value of the dsName and fieldName, in the form dsName.fieldName
    // combinedValue: "",

    fields: [{
        name: "DataSource",
        type: "Select",

        // Restore default titleStyle, because the tool skin doesn't seem to
        // be applied consistently in the picker
        titleStyle: "formTitle",
        
        // Allow empty values so that the user can choose no DataSourceField
        allowEmptyValue: true,
       
        valueField: "ID",
        getClientPickListData : function() {
            return this.form.getDatasourcePickListData();
        },

        changed : function(form, item, value) {
            form.handleDsNameChanged(value);
        }
    },{
        name: "Field",
        type: "Select",
        
        // Restore default titleStyle, because the tool skin doesn't seem to
        // be applied consistently in the picker
        titleStyle: "formTitle",
        
        changed : function(form, item, value) {
            form.handleChanged();
        }
    }],

    getDatasourcePickListData : function () {
        // Setting validDsNames or allDsRecords will reset _datasourcePickListData, causing a
        // lazy recalculation here.
        if (!this._datasourcePickListData) {
            // Always allow an empty value!
            this._datasourcePickListData = [""];
            
            if (this.validDsNames && this.validDsNames.getLength() > 0) {
                this._datasourcePickListData.addList(this.validDsNames.map(function (dsName) {
                    return {ID: dsName};
                }));
            }

            if (this.allDsRecords && this.allDsRecords.getLength() > 0) {
                if (this._datasourcePickListData.getLength() > 0) {
                    this._datasourcePickListData.add({isSeparator: true});
                }

                // allDsRecords is already an array of records ...
                this._datasourcePickListData.addList(this.allDsRecords);
            }
        }

        return this._datasourcePickListData;
    },

    setValidDsNames : function(validDsNames) {
        this.validDsNames = validDsNames;
        this._datasourcePickListData = null;
    },

    setAllDsRecords : function(allDsRecords) {
        this.allDsRecords = allDsRecords;
        this._datasourcePickListData = null;
    },

    setWarnIfNoForeignKey : function(dsRecord) {
        this.warnIfNoForeignKey = dsRecord;
    },
    
    setCombinedValue : function(value) {
        var dsItem = this.getItem("DataSource");
        var fieldItem = this.getItem("Field");
        
        var parts = (value || "").split(".");
        dsItem.setValue(parts[0]);
        fieldItem.setValue(parts[1]);

        this.handleDsNameChanged(parts[0]);
    },

    getCombinedValue : function() {
        var value = this.getValue("DataSource");
        var fieldName = this.getValue("Field");
        if (fieldName) value = value + "." + fieldName;
        return value;
    },

    initWidget : function() {
        this.Super("initWidget", arguments);
        
        if (this.combinedValue) this.setCombinedValue(this.combinedValue);
    },

    _warnIfCannotGuessForeignKey : function (foreignDS) {
        var ourDsRec = this.warnIfNoForeignKey;
        
        if (!ourDsRec || !ourDsRec.fields) return;

        // If we have a field with a foreignKey defined that points to the foreignDS,
        // then we're fine.
        var foreignKeys = ourDsRec.fields.map(function (field) {
            return field.foreignKey ? field.foreignKey.split('.')[0] : null;
        });
        if (foreignKeys.contains(foreignDS.ID)) return;

        // We would also be fine if the foreignDS has a field with a foreignKey that
        // points back to us.
        foreignKeys = foreignDS.getFieldNames().map(function (fieldName) {
            var field = foreignDS.getField(fieldName);
            return field.foreignKey ? field.foreignKey.split('.')[0] : null;
        });
        if (foreignKeys.contains(ourDsRec.ID)) return;
    
        // We are also fine if there is a field in ourDsRec and foreignDsRec with
        // matching names
        var ourFieldNames = ourDsRec.fields.getProperty("name");
        var foreignFieldNames = foreignDS.getFieldNames();
        if (ourFieldNames.intersect(foreignFieldNames).getLength() > 0) return;
        
        // If we've gotten this far, then we can't guess the foreignKey. So, we'll
        // display a warning. Note that while we're using the standard error mechanism
        // for DyanmicForms, we don't actually prevent the update from occurring -- the
        // user can save this value if they like -- it's just a warning.
        this.addFieldErrors("DataSource", 
            isc.DataSourceFieldPicker.getForeignKeyWarning(this.getValue("DataSource")), 
            true);
    },

    // Callback when we load the live DS that corresponds to the dsName chosen
    // Can be called with null if loading the DS from the server has failed
    handleLiveDs : function(ds) {
        var fieldNames = [];
        var field = this.getField("Field");
        
        if (ds) {
            // Figure out the available field names
            fieldNames = ds.getFieldNames();
            if (this.requiredBaseType) {
                var self = this;
                fieldNames = fieldNames.findAll(function(field) {
                    var baseType = isc.SimpleType.getBaseType(ds.getField(field).type, ds);
                    return baseType == self.requiredBaseType;
                });
            }
            
            // If there is only one possible value, we may as well autodetect it
            if (fieldNames.getLength() == 1) {
                field.setValue(fieldNames[0]);
                this.handleChanged();
            }

            // If our current value isn't possible, then reset it
            if (!fieldNames.contains(field.getValue())) {
                field.setValue("");
                this.handleChanged();
            }

            // If we're checking for possible foreignKeys, then validate them
            if (this.warnIfNoForeignKey) this._warnIfCannotGuessForeignKey(ds);
        }

        field.setValueMap(fieldNames);
    },

    handleDsNameChanged : function(dsName) {
        // If value is empty, then may as well reset the field too
        if (!dsName) this.getField("Field").setValue("");
        
        // And fire the change event
        this.handleChanged();
       
        // Reset the value map for the fields. This will get filled in to
        // the available values when we get the live DS.
        this.getField("Field").setValueMap([]);
        
        // And reset any warnings about foreign keys -- that will also get
        // checked when we get the live DS.
        this.clearFieldErrors("DataSource", true);

        // Try to get the live DS that corresponds to the dsName chosen,
        // either synchronously or asynchronously
        if (dsName) {
            var ds = isc.DS.get(dsName);
            if (ds) {
                this.handleLiveDs(ds);
            } else {
                var self = this;
                isc.DS.load(dsName, function() {
                    ds = isc.DS.get(dsName);
                    if (!ds) self.logWarn("Loading dataSource from server was unsuccessful for " + dsName);
                    self.handleLiveDs(ds);
                }, false, true); 
            }
        }
    },

    handleChanged : function() {
        if (this.changed) this.changed(this, this.getCombinedValue());
    }
});

isc.DataSourceFieldPicker.registerStringMethods({
    // Fired when the combinedValue in the picker changes
    changed : "form, value"
});

//> @class DataSourceEditor
// Provides a UI for creating and editing +link{DataSource, DataSources).
// 
// @inheritsFrom VLayout
// @visibility devTools
//<
isc.ClassFactory.defineClass("DataSourceEditor", "VLayout");

isc.DataSourceEditor.addClassMethods({
    // Returns the clean initialization data for a DataSource (the live data
    // contains various derived state) by loading the definition from the <dsDataSource>
    fetchDataSourceDefaults : function (dsDataSource, dsID, callback) {
        if (!dsDataSource) {
            this.logWarn("Cannot determine DS defaults because dsDataSource is not provided");
            return null;
        }

        var convertLiveInstance = function () {
            // serialize instance to XML
            var ds = isc.DS.get(dsID);
            if (!ds) {
                callback(dsID, null);
                return;
            }
            var dsClass = ds.getClassName(),
                schema
            ;

            if (isc.DS.isRegistered(dsClass)) {
                schema = isc.DS.get(dsClass);
            } else {
                schema = isc.DS.get("DataSource");
                ds._constructor = dsClass;
            }
            var xml = schema.xmlSerialize(ds);

            // and get JS the same as would be returned by getFile()
            isc.DMI.callBuiltin({
                methodName: "xmlToJS",
                "arguments": xml,
                callback : function (rpcResponse, data, rpcRequest) {
                    var data = rpcResponse.data;
                    if (!data) {
                        callback(dsID, null);
                        return;
                    }
                    var defaults = isc.DataSourceEditor.extractDSDefaultsFromJS(data, dsDataSource);

                    // ID, defaults, readOnly
                    callback(dsID, defaults, true);
                }
            });    
        };

        dsDataSource.getFile({
            fileName: dsID,
            fileType: "ds",
            fileFormat: "xml"
        }, function (dsResponse, data, dsRequest) {
            // data argument is the XML response. We want the JS response
            if (dsResponse.data.length == 0 || !dsResponse.data[0].fileContentsJS) {
                convertLiveInstance();
                return;
            }
            data = dsResponse.data[0].fileContentsJS;

            var defaults = isc.DataSourceEditor.extractDSDefaultsFromJS(data, dsDataSource);

            callback(dsID, defaults);
        }, {
            // DataSources are always shared across users
            // and we want JavaScript in the response to avoid an extra xmlToJs call
            operationId: "allOwnersXmlToJs"
        });
    },

    extractDSDefaultsFromJS : function (jsData, dsDataSource) {
        // instantiate the DataSource in "captureDefaults" mode, where Class.create()
        // returns a editComponent instead
        isc.ClassFactory._setVBLoadingDataSources(true);
        isc.captureDefaults = true;
        //!OBFUSCATEOK
        var dsComponent = isc.eval(jsData);
        isc.captureDefaults = null;
        isc.capturedComponents = null;

        var defaults = dsComponent.defaults,
            dsID = defaults.ID || defaults.autoID
        ;

        // Re-create the actual DS for later reference. eval() above just extracts defaults
        // but also leaves window[ID] referencing the defaults instead of an actual DS.
        // The window[ID] value must be removed or the next eval will not insert the correct
        // DS into the global namespace.
        window[dsID] = null;

        isc.DS._creatingFileSourceDS = true;

        //!OBFUSCATEOK
        isc.eval(jsData);
        isc.ClassFactory._setVBLoadingDataSources(null);

        isc.DS._creatingFileSourceDS = null;

        var ds = isc.DS.get(dsID);
        if (dsDataSource) ds.sourceDataSourceID = dsDataSource.ID;

        // Pull DS class type and push into defaults._constructor so the correct
        // schema will be serialized when saved.
        defaults._constructor = ds.getClassName();

        // do some automatic defaulting otherwise done at DataSource.init()
        if (defaults.serverType == "sql") defaults.dataFormat = "iscServer";
        if (defaults.recordXPath != null && defaults.dataFormat == null) {
            defaults.dataFormat = "xml";
        }

        
        ds.cacheData = ds.recordsFromObjects(ds.cacheData);
        ds._convertedCacheData = true;

        if (ds.clientOnly) defaults.clientOnly = true;

        return defaults;
    },

    createNameFromTitle : function (title) {
        if (!title || title == "") return null;

        // Split title by disallowed characters
        var words = title.split(/[^a-zA-Z0-9_]/),
            parts = []
        ;
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            if (parts.length == 0) {
                // Initial word must start with a letter or underscore
                var m = word.match("^[0-9]*");
                if (m.length > 0) {
                    word = word.substring(m[0].length);
                }
                // and start with a lowercase letter
                word = word.substring(0,1).toLowerCase() + word.substring(1);
            } else {
                // Subsequence words start with uppercase
                word = word.substring(0,1).toUpperCase() + word.substring(1);
            }
            if (word && word != "") parts.add(word);
        }
        return parts.join('');
    }
});

isc.DataSourceEditor.addProperties({
// attributes 
overflow: "visible",

//> @attr dataSourceEditor.dataSource (DataSource | ID : null : IRW)
// DataSource being edited.
//
// @visibility devTools
//<

//> @attr dataSourceEditor.dsDataSource (DataSource | ID : null : IRW)
// DataSource to be used to load and save ds.xml files, via fileSource operations.
//
// @visibility devTools
//<

//> @attr dataSourceEditor.knownDataSources (Array : null : IRW)
// A list of all known DataSources, to be used when editing foreign keys.
// Each element of the array should be a record with at least ID and type properties.
//
// @visibility devTools
//<

//> @attr dataSourceEditor.enableRelationEditor (Boolean : null : IR)
// Should relation editor be available while editing the DataSource?
//
// @visibility devTools
//<

//> @attr dataSourceEditor.mainEditor (AutoChild ComponentEditor : null : IRW)
//
// @visibility devTools
//<
mainEditorDefaults: {
    _constructor: "ComponentEditor",
    autoDraw:false,
    autoFocus:true,
    numCols:8,
    overflow:"visible",
    dataSource:"DataSource",
    itemHoverStyle: "docHover",
    titleHoverHTML : function (item) {
        if (isc.jsdoc.hasData()) {
            // the dataSource is the class
            var html = isc.jsdoc.hoverHTML("DataSource", item.name);
            if (html) return html;
        }
        // no doc exists for this attribute - show a hover with just the attribute name in bold so
        // the user doesn't wait forever for the tooltip
        return "<nobr><code><b>"+item.name+"</b></code> (no doc available)</nobr>";
    }
},


mainEditorFields: [
    {name:"ID", title: "ID", required:true, validateOnExit: true, hoverWidth: 300,
        selectOnFocus: true,
        editorEnter : function (form, item, value) {
            this._origValue = value;
        },
        setValue : function (newValue) {
            this._origValue = newValue;
            return this.Super("setValue", arguments);
        },
        editorExit : function (form, item, value) {
            if (!form.creator.autoAddPK) return;

            var origValue = this._origValue;
            if (origValue != value) {
                var fields = form.creator.getFields();
                if (fields) {
                    var uniqueIdField = fields.find("name", "uniqueId");
                    if (uniqueIdField && uniqueIdField.primaryKey) {
                        var pkName = value + "Id";
                        if (!fields.find("name", pkName)) {
                            var editor = form.creator.fieldEditor,
                                grid = editor.grid,
                                totalRows = grid.getTotalRows()
                            ;
                            for (var rowNum = 0; rowNum < totalRows; rowNum++) {
                                var record = grid.getRecord(rowNum);
                                if (record && record.name == "uniqueId") {
                                    var colNum = grid.getFieldNum("name"),
                                        alreadyEditing = (grid.getEditRow() == rowNum)
                                    ;
                                    if (!alreadyEditing) grid.startEditing(rowNum, colNum);
                                    grid.setEditValue(rowNum, colNum, pkName);
                                    if (!alreadyEditing) grid.endEditing();
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        },
        validators: [
            { 
                type: "regexp",
                expression: "^(?!isc_).*$",
                errorMessage: "DataSource ID must not start with 'isc_'. That prefix is reserved for framework DataSources.'",
                stopIfFalse: true
            },
            { 
                type: "regexp",
                expression: "^[a-zA-Z_][a-zA-Z0-9_]*$",
                errorMessage: "DataSource ID must not contain spaces or punctuation other than underscore (_), and may not start with a number",
                stopIfFalse: true
            },
            {
                type:"custom",
                condition: function (item, validator, value, record, additionalContext) {
                    if (!value) return true;
                    if (!validator.idMap) {
                        // Create idMap to map from lowercase ID to actual ID so that
                        // entered name can be matched to an existing schema regardless
                        // of case.
                        var allDataSources = isc.DS.getRegisteredDataSourceObjects(),
                            idMap = {}
                        ;
                        for (var i = 0; i < allDataSources.length; i++) {
                            var ds = allDataSources[i];
                            if (ds && ds.componentSchema) {
                                var id = ds.ID;
                                idMap[id.toLowerCase()] = id;
                            }
                        }
                        validator.idMap = idMap;
                    }
                    // Also validate that the non-schema DS is not a SimpleType and not
                    // an internal application DS (i.e. a Reify-created DS is OK)
                    var id = validator.idMap[value.toLowerCase()] || value,
                        ds = isc.DS.get(id)
                    ;
                    return ((!ds || (!ds.componentSchema && ds.sourceDataSourceID)) &&
                            !isc.SimpleType.getType(value));
                },
                errorMessage: "DataSource ID matches a system type or DataSource. Please choose another ID."
            }
        ]},
    //{name:"dataFormat", defaultValue:"iscServer", redrawOnChange:true},

    {type:"section", defaultValue:"XPath Binding",
     showIf:"values.dataFormat != 'iscServer' && values.serverType != 'sql' && values.serverType != null && values._constructor != 'MockDataSource'",
     itemIds:["dataURL", "selectBy", "recordXPath", "recordName"]},
    {name:"dataURL", showIf:"values.dataFormat != 'iscServer' && values._constructor != 'MockDataSource'"},
    {name:"selectBy", title:"Select Records By", 
     shouldSaveValue:false,
     valueMap:{ tagName:"Tag Name", xpath:"XPath Expression" },
     defaultValue:"xpath",
     redrawOnChange:true,
     // can't use tagName in JSON
     showIf:"values.dataFormat == 'xml'"},
    // allowed in XML or JSON
    {name:"recordXPath", 
     showIf:"values.dataFormat != 'iscServer' && form.getItem('selectBy').getValue() == 'xpath' && values._constructor != 'MockDataSource'"},
    // allow in XML only
    {name:"recordName", 
     showIf:"values.dataFormat == 'xml' && values.selectBy == 'tagName'"},

    {type:"section", defaultValue:"SQL Binding", 
     showIf:"values.serverType == 'sql' || values.serverType == 'hibernate'",
     itemIds:["dbName", "schema", "tableName"]},
    {name:"dbName", showIf:"values.serverType == 'sql'", showHint: true, showHintInField: true, hint: "default"}, 
    {name:"schema", showIf:"values.serverType == 'sql'", showHint: true, showHintInField: true, hint: "default"}, 
    {name:"tableName", 
     showIf:"values.serverType == 'sql' || values.serverType == 'hibernate'",
     showHint: true, showHintInField: true, 
     hint: "same as ID"},

    {type:"section", defaultValue:"Record Titles", sectionExpanded:false,
        itemIds:[/*"title", "pluralTitle",*/ "titleField"]},
    
    //{name:"title", showHint: true, showHintInField: true, hint: "same as ID"},
    //{name:"pluralTitle", showHint: true, showHintInField: true, hint: "same as ID + 's'"},
    {name:"titleField", editorType:"SelectItem", allowEmptyValue: true, valueMap: []},

    {type:"section", defaultValue:"Advanced", sectionExpanded:false,
        showIf:"values.serverType != null",
        itemIds:["dropExtraFields", "autoDeriveSchema", "quoteTableName", "beanClassName"]},
    {name:"dropExtraFields", showIf:"values.clientOnly != true && values._constructor != 'MockDataSource' && values.serverType != 'sql'"},
    {name:"autoDeriveSchema", showIf:"values.clientOnly != true && values._constructor != 'MockDataSource'"},
    {name:"quoteTableName", showIf:"values.serverType == 'sql'"}, 
    {name:"beanClassName", 
     showIf:"values.serverType == 'sql' || values.serverType == 'hibernate'"}
],

fieldEditorDefaults: {
    _constructor: "ListEditor",
    autoDraw:false,
    inlineEdit:true,
    dataSource:"DataSourceField",
    saveLocally:true,
    minHeight:226,
    gridButtonsOrientation:"right",
    gridButtonsProperties: {
        height: "100%"
    },
    formProperties: { 
        numCols:4,
        initialGroups:10
    },
    formFields : [
        {name:"name", canEdit:false},
        {name:"type"},
        {name:"title"},
        {name:"primaryKey"},
        {name:"valueXPath", colSpan:2, 
            showIf:function () {
                var grid = this.form.creator,
                    mainEditor = grid ? grid.creator.mainEditor : null;
                return (mainEditor && mainEditor.getValues().dataFormat != 'iscServer');
                
            }
        },

        {type:"section", defaultValue:"Value Constraints",
         itemIds:["required", "length", "valueMap"] },
        {name:"valueMap", rowSpan:2},
        {name:"required"},
        {name:"length"},

        {type:"section", defaultValue:"Component Binding", 
         itemIds:["hidden", "detail", "canEdit"] },
        {name:"canEdit"},
        {name:"hidden"},
        {name:"detail"},

        {type:"section", defaultValue:"Relations", sectionExpanded:true,
         itemIds:["foreignKey", "rootValue", "includeFrom"] },
        {
            name: "foreignKey",
            type: "staticText",

            showPickerIcon: true,
            pickerConstructor: "DataSourceFieldPicker",
            pickerProperties: {
                width : 160,
                changed : function(form, value) {
                    form.creator.setValue(value);
                }
            },

            // Override showPicker to set up the valid DataSources based on whatever
            // edits we've done.
            showPicker : function() { 
                // Look up the creator chain for the DataSourceEditor
                var dsEditor = this;
                while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
                if (!dsEditor) {
                    this.logWarn("Could not find the DataSourceEditor");
                    return;
                }
                if (!dsEditor.knownDataSources) {
                    this.logWarn("DataSourceEditor.knownDataSources has not been set");
                    return;
                }

                // Actually show the picker and set the valid Datasources
                this.Super("showPicker", arguments);    
                
                var dsData = dsEditor.getDatasourceData();
                
                var validDS = dsEditor.knownDataSources.findAll({dsType: dsData.serverType});
                this.picker.setValidDsNames(validDS.getProperty("ID"));

                // Try to get the live DS we are editing, in case there are types defined on the DS
                var ds = isc.DS.get(dsData.ID);
                this.picker.requiredBaseType = isc.SimpleType.getBaseType(this.form.getValue("type"), ds);

                this.picker.setCombinedValue(this.getValue());
            },

            // Pickers aren't destroyed by default, so we'll do that here
            destroy : function() {
                if (this.picker) this.picker.destroy();
                this.Super("destroy", arguments);
            }
        },
        {name:"rootValue"},
        {
            name: "includeFrom", 
            type: "staticText", 

            showPickerIcon: true, 
            pickerConstructor: "DataSourceFieldPicker",
            pickerProperties: {
                changed : function(form, value) {
                    form.creator.setValue(value);
                }
            },

            // Override showPicker to set up the valid DataSources based on whatever
            // edits we've done.
            showPicker : function() { 
                // Look up the creator chain for the DataSourceEditor
                var dsEditor = this;
                while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
                if (!dsEditor) {
                    this.logWarn("Could not find the DataSourceEditor");
                    return;
                }

                var dsData = dsEditor.getDatasourceData();

                // The known valid datasources are the ones for which we have a foreignKey
                // defined, since includeFrom only works one level at a time. So, as a first
                // approximation, we can just collect the foreignKey's we've defined for this
                // dataSource. Note that we get them from the form, rather than the real
                // dataSource, so that we can immediately react to any changes.
                var editedFieldData = dsData.fields;                

                var fieldsWithForeignKeys = editedFieldData.findAll(function (field) {
                    return field.foreignKey;
                }) || [];
                var validDsNames = fieldsWithForeignKeys.map(function (field) {
                    return field.foreignKey.split(".")[0];
                }).getUniqueItems();

                // It is also possible that foreignKeys can be guessed for other datasources,
                // but we won't know until they are chosen and lazily loaded. So, we also
                // supply a list of datasources of the same type as ours
                var allDsRecords = null;
                if (dsEditor.knownDataSources) {
                    var ourType = dsData.serverType;
                    if (ourType) {
                        allDsRecords = dsEditor.knownDataSources.findAll({dsType: ourType});
                    } else {
                        allDsRecords = dsEditor.knownDataSources;
                    }
                }

                // Actually show the picker (possibly creating it)
                this.Super("showPicker", arguments);
    
                this.picker.setValidDsNames(validDsNames);
                if (allDsRecords) this.picker.setAllDsRecords(allDsRecords);
                            
                // In order to allow validation of lazily loaded datasources, we provide
                // our ID and field records
                this.picker.setWarnIfNoForeignKey(dsData);
                
                this.picker.setCombinedValue(this.getValue());
            },

            // Pickers aren't destroyed by default, so we'll do that here
            destroy : function() {
                if (this.picker) this.picker.destroy();
                this.Super("destroy", arguments);
            }
        }
    ],
    gridDefaults:{ 
        editEvent:"click",
        
        emptyMessage: "Loading DataSource definition... ${loadingImage}",

        listEndEditAction:"next",
        showNewRecordRow:true,
        newRecordRowMessage:"-- Click to add new field --",    
        canReorderRecords: true,

        autoParent:"gridLayout",
        selectionType:isc.Selection.SINGLE,
        recordClick:"this.creator.recordClick(record)",
        modalEditing:true,
        editorEnter:"this.creator.updateButtonStates()",
        cellChanged:"this.creator.updateButtonStates()",
        selectionChanged: "this.creator.updateButtonStates()",
        contextMenu : {
            data : [
                {title:"Remove", click: "target.creator.removeRecord()" }
            ]
        },
        // get rid of default LG borders
        styleName:"rightBorderOnly",
        validateByCell:true,
        leaveScrollbarGap:false,
        alternateRecordStyles:true,
        // show a delete column
        canRemoveRecords:true,
        canEdit: true,
        canEditCell : function (rowNum, colNum) {
            var record = this.getRecord(rowNum),
                field = this.getField(colNum),
                fieldName = field[this.fieldIdProperty],
                isNameOrTitle = (fieldName == "name" || fieldName == "title");
            // Cannot edit field that is a foreignKey directly
            if (record && record.foreignKey) return false;

            if (isc.isA.TreeGrid(this)) {
                if (record && record.isFolder &&
                    !(isNameOrTitle || fieldName == "required" || fieldName == "hidden"))
                {
                    return false;
                }
            }
            else {
                if (this.getDataSource().fieldIsComplexType(field) && !isNameOrTitle) 
                    return false;
            }
            // An includeFrom field only allows editing of the name and title
            if (!isNameOrTitle && record && record.includeFrom && fieldName != "hidden") {
                return false;
            }

            if (fieldName == "primaryKey" && !this.creator.creator.canChangePrimaryKey) {
                return false;
            }
            return this.Super('canEditCell', arguments);
        },
        getCellCSSText : function (record, rowNum, colNum) {
            var fieldName = this.getFieldName(colNum),
                css = this.Super("getCellCSSText", arguments)
            ;
            // Show empty title field in hint style - auto-derived or related field details
            if (fieldName == "title" && record && !record.title && !this.isSelected(record)) {
                // hint color from Tahoe and Obsidian so it works in both dark and light skins
                css = "color:#999999;";
            }
            return css;
        },
        getEditorProperties : function (editField, editedRecord, rowNum) {
            var properties = this.Super("getEditorProperties", arguments);
            if (editField.name == "name" &&
                editedRecord && editedRecord.includeFrom && !editedRecord.name)
            {
                var name = editField._nameFromValueOrIncludeFrom(null, editedRecord.includeFrom),
                    hint = "Using related field name: <i>" + name + "</i>"
                ;
                isc.addProperties(properties, {
                    showHintInField: true,
                    hint: hint
                });
            } else if (editField.name == "title") {
                if (editedRecord && !editedRecord.title) {
                    var title,
                        hint
                    ;
                    if (editedRecord.includeFrom) {
                        title = editField._titleFromValueOrIncludeFrom(null, editedRecord.includeFrom);
                        hint = "<i>" + title + "</i>";
                    } else {
                        title = isc.DataSource.getAutoTitle(editedRecord.name);
                        hint = "<i>" + title + "</i>";
                    }
                    isc.addProperties(properties, {
                        showHintInField: true,
                        hint: hint
                    });
                }
            } else {
                // Clear hint which may be present from a previous record edit
                isc.addProperties(properties, {
                    hint: null
                });
            }
            return properties;
        },
        editComplete : function (rowNum, colNum, newValues, oldValues, editCompletionEvent) {
            var undef;
            if ((oldValues && oldValues._newField) ||
                ((!oldValues || !oldValues.name) && newValues.name != undef))
            {
                var record = this.getRecord(rowNum);
                if (record) {
                    delete record._newField;
                    this.creator._fieldAdded(record);
                    // Just like LG.selectOnEdit
                    this.selectSingleRecord(rowNum);
                }
            } else {
                if (oldValues && oldValues.name != null &&
                    newValues.name != undef &&
                    oldValues.name != newValues.name)
                {
                    var record = this.getRecord(rowNum);
                    this.creator._fieldNameChanged(oldValues.name, newValues.name);
                }
                // For a field type change, clear validators
                if (oldValues && oldValues.type != null &&
                    newValues.type != undef &&
                    oldValues.type != newValues.type)
                {
                    var record = this.getRecord(rowNum);
                    this.creator._fieldTypeChanged(record);
                }
            }
        },
        editorEnter : function (record, value, rowNum, colNum) {
            if (record && record._newField && this.getEditedCell(rowNum, "type") == null) {
                // Default new fields to type "text".
                // This also sets the record to dirty so saving without making other
                // changes still fires the fieldAdded() event.
                this.setEditValue(rowNum, "type", "text");
            }
            if (record && record._newField && this.getEditedCell(rowNum, "name") == null) {
                // Default new fields to name "" which forces a manual entry and correct
                // validation.
                this.setEditValue(rowNum, "name", "");
            }
        },
        removeRecordClick : function (rowNum) {
            var grid = this,
                record = this.getRecord(rowNum)
            ;
            // if there's no record, nothing to do
            if (!record) return;

            // If PK is potentially an autoAdd, don't allow the PK to be removed
            if (this.creator.creator.autoAddPK && record.primaryKey) {
                isc.Hover.show("Primary key field cannot be removed");
                return;
            }
            
            if (record.foreignKey) {
                var relatedDS = isc.DS.getForeignDSName(record, grid.creator.dataSource),
                    message = "Removing this relationship will remove all existing links between " +
                    "'${currentDS}' records and '${relatedDS}' records if you save. " +
                    "This cannot be undone. Proceed?"
                ;
                message = message.evalDynamicString(grid, {
                    currentDS: grid.creator.dataSource.ID,
                    relatedDS: relatedDS
                });
                isc.ask(message, function (value) {
                    if (value) {
                        grid.completeRemoveRecord(rowNum, record);
                    }
                }, {
                    buttons: [isc.Dialog.NO, isc.Dialog.YES]
                });
            } else {
                grid.completeRemoveRecord(rowNum, record);
            }
        },
        completeRemoveRecord : function (rowNum, record) {
            // Mark record as being removed so it can be excluded from getFields() results
            record._removing = true;
            // use delayCall to actually remove the record in a separate thread.
            // required since we can't redraw immediately in response to a mouseDown
            this.delayCall("removeRecord", [rowNum, record]);

            this.creator._fieldDeleted(record);
        },
        // When tabbing into a new record, trigger adding a new record so that the edit
        // has the needed linkage to parent in tree
        rowEditorEnter : function (record, editValues, rowNum) {
            if (record || !this.creator.creator.canEditChildSchema) {
                return;
            }

            this.delayCall("_handleEditNewRecord");
            return false;
        },
        _handleEditNewRecord : function () {
            this.cancelEditing();
            this.creator.newRecord();
        },
        recordClick : function (viewer,record,recordNum,field,fieldNum,value,rawValue) {
            if (recordNum == this.getTotalRows()-1) {
                // Click on "add new record" row in grid
                viewer.creator.newRecord();
                return false;
            }
            return this.Super("recordClick", arguments);
        },
        recordDoubleClick : function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
            var dsEditor = viewer.creator.creator;
            if (record.foreignKey && dsEditor.enableRelationEditor) {
                dsEditor.editRelations(record.foreignKey);
                return false;
            }
        },

        _$linkTemplate:[
            "<a href='",
            ,   // 1: HREF
            "' target='",
            ,   // 3: name of target window
            // onclick handler enables us to prevent popping a window if (EG) we're masked.
            //                      5: ID
            "' onclick='if(window.",     ,") return ",
                    //  7:ID                               9:dsName,
                             ,"._linkToDataSourceClicked(\"",        ,"\");'>",
            ,   // 11: link text
            "</a>"
        ],

        createDSLink : function (dsName) {
            var ID = this.getID(),
                template = this._$linkTemplate
            ;
            template[1] = "javascript:void";
            template[3] = "javascript";
            template[5] = ID;
            template[7] = ID;
            template[9] = dsName;
            template[11] = dsName;

            return template.join(isc.emptyString);
        },

        // Format a field of format [[<dsName>].<dsName>.]<fieldName> so that the
        // <fieldName> DataSource is a link for quick navigation
        formatRelatedField : function (name) {
            var split = name.split(".");
            if (!split || split.length < 2) {
                return name;
            }

            var dsNames = split.slice(0, split.length-1),
                fieldName = split[split.length-1],
                self = this,
                nameParts = dsNames.map(function (dsName) {
                    return self.createDSLink(dsName);
                })
            ;
            nameParts.add(fieldName);

            return nameParts.join(".");
        },

        _linkToDataSourceClicked : function (dsName) {
            var dsEditor = this.creator.creator;
            // If already editing the DS, nothing else to do
            if (dsEditor.origDSName == dsName) {
                return false;
            }

            var haveDSChanges = !dsEditor.readOnly && dsEditor.hasChanges(),
                haveRelationsToSave = (dsEditor.relationEditor &&
                                        dsEditor.relationEditor.hasPendingChanges())
            ;

            if (haveDSChanges || haveRelationsToSave) {
                // Since there are changes perform a quick validation of the main editors
                // so that can be reported prior to prompting to save.
                if (haveDSChanges &&
                        (!dsEditor.mainEditor.validate() || !dsEditor.fieldEditor.validate()))
                {
                    isc.warn("Reported issue(s) must be fixed before navigating to related DataSource");
                    return;
                }

                var changedTarget = (haveDSChanges ? "DataSource " : "");
                if (haveRelationsToSave) {
                    if (changedTarget != "") {
                        changedTarget += "and ";
                    }
                    changedTarget += "relations ";
                }

                var message = "Changes for the " + changedTarget + " must be saved before " +
                                "navigating to the related DataSource.<p>" +
                                "Save changes now?";

                isc.ask(message, function (value) {
                    switch (value) {
                        case "proceed":
                            dsEditor.openDataSource(dsName);
                            break;
                        case true:  // save and proceed
                            dsEditor.saveAndOpenDataSource(dsName);
                            break;
                    }
                }, {
                    buttons: [
                        isc.Dialog.CANCEL,
                        isc.Dialog.OK,
                        isc.LayoutSpacer.create({width:50}),
                        {
                            title: "Don't Save", width: 1, 
                            overflow: "visible",
                            click : function () {
                                var dialog = this.topElement;
                                dialog.clear();
                                dialog.returnValue("proceed");
                            }
                        }
                    ]
                });
            } else {
                dsEditor.openDataSource(dsName);
            }

            // Called from an <a href .../> onclick so return false to cancel action
            return false;
        }
    },

    _fieldNameChanged : function (fromName, toName) {
        // Previous field name may have been used in validator.applyWhen values - update these
        var grid = this.grid,
            tree = grid.data,
            allFields = (isc.isA.Tree(tree) ? tree.getAllNodes() : tree)
        ;
        for (var i = 0; i < allFields.length; i++) {
            var field = allFields[i];
            if (field.validators && field.validators.length > 0) {
                for (var j = 0; j < field.validators.length; j++) {
                    this.updateValidatorFieldNames(field.validators[j], fromName, toName);
                }
            }
        }

        var renames = this.renames;
        if (!renames) {
            renames = this.renames = {};
        }
        var key = (fromName == null ? fromName : isc.getKeyForValue(fromName, renames));
        if (key == toName) delete renames[key];
        else renames[key] = toName;

        if (this.creator.editSampleData) {
            var fields = this.creator.getFields(),
                data = this.creator.renameSampleDataField(fromName, toName)
            ;

            // Re-create testDS with updated fields/data
            this.creator._rebindSampleDataGrid(fields, data);
        }

        // Update selections and possibly value of titleField. Must come after sampleData updated
        this.creator.updateTitleField(fromName, toName);

        this.fieldNameChanged(fromName, toName);
    },
    fieldNameChanged : function (fromName, toName) {
    },
    _fieldTypeChanged : function (field) {
        if (field.validators && field.validators.length > 0) {
            isc.confirm("Changing the field type may cause some validators to be invalid. Clear field validators?", function (value) {
                if (value) {
                    delete field.validators;
                }
            });
        }
        // allowed values list is invalid when the type changes
        delete field.valueMap;

        if (this.creator.editSampleData) {
            // Revert type-specific data from the sample grid back to text field
            // so it can be re-converted to the new field types.
            var fieldName = field.name,
                testDS = this.creator.testDS,
                data = this.creator.getSampleData()
            ;
            // Nothing to do if there is no data
            if (data && data.length > 0) {
                var origField = testDS.getField(fieldName),
                    guesser = isc.SchemaGuesser.create({ fields: [ origField ] }),
                    revertedData = guesser.revertValues(data)
                ;

                // Convert the raw values to correct types based on updated field
                guesser.fields = [ field ];
                guesser.extractFieldsFrom(revertedData);
                var convertedData = guesser.convertData(revertedData);

                // Copy converted data for changed field into sample data
                for (var i = 0; i < convertedData.length; i++) {
                    data[i][fieldName] = convertedData[i][fieldName];
                }
            }

            // Re-create testDS with updated fields/data
            var fields = this.creator.getFields();
            this.creator._rebindSampleDataGrid(fields, data);
        }

        // Update selections and possibly value of titleField. Must come after sampleData updated
        this.creator.updateTitleField();

        this.fieldTypeChanged(field);
    },
    fieldTypeChanged : function (field) {
    },
    _fieldAdded : function (field) {
        // Save added field name
        var fieldName = field.name,
            adds = this.adds
        ;
        if (!adds) {
            adds = this.adds = [];
        }
        if (!adds.contains(fieldName)) adds.add(fieldName);

        // Update Sample Data grid
        this.creator.rebindSampleData();

        // Update selections and possibly value of titleField. Must come after sampleData updated
        this.creator.updateTitleField();

        this.updateIncludeFieldButtonState();

        this.fieldAdded(field);
    },
    fieldAdded : function (field) {
    },
    _fieldDeleted : function (field) {
        // Save deleted field name
        var fieldName = field.name,
            deletes = this.deletes
        ;
        if (!deletes) {
            deletes = this.deletes = [];
        }
        if (!deletes.contains(fieldName)) deletes.add(fieldName);

        // Previous field name may have been used in validator.applyWhen values.
        // Let user know these issues remain.
        var grid = this.grid,
            tree = grid.data,
            allFields = (isc.isA.Tree(tree) ? tree.getAllNodes() : tree),
            referenced = false
        ;
        for (var i = 0; i < allFields.length; i++) {
            var f = allFields[i];
            if (f.validators && f.validators.length > 0) {
                for (var j = 0; j < f.validators.length; j++) {
                    referenced = this.validatorReferencesField(f.validators[j], fieldName) || referenced;
                }
            }
        }
        if (referenced) {
            isc.warn("Deletion of field " + fieldName + " affects one or more other fields " +
                "with validators that referenced this field. These affected criterion will be ignored.");
        }

        if (this.creator.editSampleData) {
            var fieldName = field.name,
                fields = this.creator.getFields(),
                data = this.creator.getSampleData()
            ;

            // Remove deleted field from sample data
            if (data) {
                data.forEach(function (record) {
                    if (record[fieldName] != null) {
                        record[fieldName] = null;
                    }
                });
            }

            // Re-create testDS with updated fields/data
            this.creator._rebindSampleDataGrid(fields, data);
        }

        // Update selections and possibly value of titleField. Must come after sampleData updated
        this.creator.updateTitleField();

        this.delayCall("updateButtonStates");
        this.updateIncludeFieldButtonState();

        this.fieldDeleted(field);

        // Previous field may have been a foreignKey reference that invalidates other
        // includeFrom fields - remove them too
        if (field.foreignKey) {
            var relatedDSName = isc.DS.getForeignDSName(field);
            if (relatedDSName) {
                var dsPrefix = relatedDSName + ".";
                for (var i = 0; i < allFields.length; i++) {
                    var field = allFields[i];
                    if (field.includeFrom && field.includeFrom.startsWith(dsPrefix)) {
                        var rowNum = grid.getRecordIndex(field);
                        // Mark record as being removed so it can be excluded from getFields() results
                        field._removing = true;
                        // use delayCall to actually remove the field in a separate thread.
                        // required since we can't redraw immediately in response to a mouseDown
                        grid.delayCall("removeRecord", [rowNum, field]);

                        this._fieldDeleted(field);
                    }
                }
            }
        }
    },
    fieldDeleted : function (field) {
    },

    updateButtonStates : function (currentRecord) {
        this.Super("updateButtonStates", arguments);
        var selectedRecord = this.grid.getSelectedRecord(),
            selectedRowNum = (selectedRecord ? this.grid.getRecordIndex(selectedRecord) : null),
            validSelection = (selectedRecord && !this.grid.rowHasErrors(selectedRowNum))
        ;
        if (validSelection) {
            if (this.creator.validatorsButton) this.creator.validatorsButton.enable();
            if (this.creator.securityButton) this.creator.securityButton.enable();
            var record = currentRecord || selectedRecord;
            if (this.creator.legalValuesButton) {
                if (record.type == "enum") this.creator.legalValuesButton.enable();
                else this.creator.legalValuesButton.disable();
            }
            if (this.creator.formattingButton) {
                var type = this.creator.getFieldType(record);
                if (type == "integer" || type == "float" || type == "date" || type == "datetime" 
                    || type == "time") 
                {
                    this.creator.formattingButton.enable();
                } else {
                    this.creator.formattingButton.disable();
                }
            }
        } else {
            if (this.creator.validatorsButton) this.creator.validatorsButton.disable();
            if (this.creator.securityButton) this.creator.securityButton.disable();
            if (this.creator.legalValuesButton) this.creator.legalValuesButton.disable();
            if (this.creator.formattingButton) this.creator.formattingButton.disable();
        }
    },

    updateIncludeFieldButtonState : function () {
        if (!this.creator.dsRelations) return;

        var dsId = this.creator.getDataSourceID(),
            relations = this.creator.dsRelations.getRelationsForDataSource(dsId)
        ;
        this.creator.includeFieldButton.setDisabled(!relations || relations.length == 0);
    },

    updateValidatorFieldNames : function (validator, fromName, toName) {
        var applyWhen = validator.applyWhen;
        if (!applyWhen || isc.isA.emptyObject(applyWhen)) return;
        this._replaceCriteriaFieldName(applyWhen, fromName, toName);
    },

    _replaceCriteriaFieldName : function (criteria, fromName, toName) {
        var operator = criteria.operator,
            changed = false
        ;
        if (operator == "and" || operator == "or") {
            var innerCriteria = criteria.criteria;
            for (var i = 0; i < innerCriteria.length; i++) {
                if (this._replaceCriteriaFieldName(innerCriteria[i], fromName, toName)) {
                    changed = true;
                }
            }
        } else {
            if (criteria.fieldName != null && criteria.fieldName == fromName) {
                criteria.fieldName = toName;
                changed = true;
            }
        }
        return changed;
    },

    validatorReferencesField : function (validator, fieldName) {
        var applyWhen = validator.applyWhen;
        if (!applyWhen || isc.isA.emptyObject(applyWhen)) return false;
        return this._criteriaHasMatchingFieldName(applyWhen, fieldName);
    },

    _criteriaHasMatchingFieldName : function (criteria, fieldName) {
        var operator = criteria.operator;
        if (operator == "and" || operator == "or") {
            var innerCriteria = criteria.criteria;
            for (var i = 0; i < innerCriteria.length; i++) {
                if (this._criteriaHasMatchingFieldName(innerCriteria[i], fieldName)) {
                    return true;
                }
            }
        } else {
            if (criteria.fieldName != null && criteria.fieldName == fieldName) {
                return true;
            }
        }
        return false;
    },

    newRecord : function (defaultValues) {
        if (this.creator.canEditChildSchema) {
            var grid = this.grid,
                tree = grid.data,
                selectedNode = this.getSelectedNode();
                
            if (!selectedNode) selectedNode = tree.root;
            var parentNode = tree.getParent(selectedNode)

            if (selectedNode) {
                if (!selectedNode.isFolder) selectedNode = parentNode;
                var id = this.getNextUnusedNodeId();
                if (defaultValues) {
                    var newNode = isc.addProperties({}, defaultValues, {
                        id: id,
                        parentId: selectedNode ? selectedNode.id : null
                    });
                    this.addNode(newNode, selectedNode);
                    this._fieldAdded(newNode);
                } else {
                    var newNode = isc.addProperties({ 
                            name: this.getNextUniqueFieldName(selectedNode, "field"),
                            id: id,
                            parentId: selectedNode ? selectedNode.id : null,
                            _newField: true
                        });
                    this.addNode(newNode, selectedNode);
                    var node = grid.findByKey(id);
                    if (node) {
                        var rowNum = grid.getRecordIndex(node);
                        if (rowNum >= 0) {
                            grid.startEditing(rowNum);
                        }
                    }
                }
            }
        } else this.Super("newRecord", arguments);
    },
    getSelectedNode : function () {
        return this.grid.getSelectedRecord();
    },
    addNode : function (newNode, parentNode) {
        var tree = this.grid.data,
            position
        ;
        // If a new node has an includeFrom value it must have been created by selecting
        // an include field. These fields should be added immediately after the corresponding
        // foreignKey but after any other includeFrom fields for the same DataSource.
        if (newNode.includeFrom) {
            var split = newNode.includeFrom.split(".");
            if (split && split.length >= 2) {
                // Find relation node
                var dsName = split[split.length-2],
                    nodes = tree.getAllNodes(),
                    relationPosition
                ;
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (node.foreignKey) {
                        split = node.foreignKey.split(".");
                        if (split && split.length >= 2) {
                            var foreignKeyDSName = split[split.length-2];
                            if (foreignKeyDSName == dsName) {
                                relationPosition = i;
                                break;
                            }
                        }
                    }
                }
                if (relationPosition != null && relationPosition < nodes.length-1) {
                    // Find next node position under relation after any other includeFrom
                    // fields against the same DataSource
                    for (var i = relationPosition+1; i < nodes.length; i++) {
                        var node = nodes[i];
                        if (!node.includeFrom) {
                            // no more includeFroms to check
                            position = i;
                            break;
                        }

                        split = node.includeFrom.split(".");
                        if (!split || split.length < 2) {
                            // includeFrom points to a field on this DS; put new node here
                            position = i;
                            break;
                        }
                        // Find relation node
                        var nodeDSName = split[split.length-2];
                        if (dsName != nodeDSName) {
                            // found another includeFrom but it's against another DataSource
                            position = i;
                            break;
                        }
                        // current node must be an includeFrom against the target DS; keep looking
                    }
                }
            }
        }
        tree.add(newNode, parentNode, position);
    },
    getNextUniqueFieldName : function (node, prefix) {
        // Only suppress assigning a field name to "field" prefix values so
        // that "child" fields will have an assigned name because those need
        // to be manually linked into the tree.
        if (prefix == "field" && this.autoAssignNewFieldName == false) return null;

        var childFields = node ? node.fields || [] : [],
	        inc=1;

        if (!prefix || prefix.length == 0) prefix = "field";
        if (childFields && childFields.length > 0) {
            for (var i = 0; i < childFields.length; i++) {
                var item = childFields.get(i), 
                    itemName = item.name;
                // An includeFrom field doesn't need an explicit name
                if (!itemName && item.includeFrom) {
                    itemName = item.includeFrom;
                    var dotIndex = itemName.lastIndexOf(".");
                    if (dotIndex >= 0) itemName = itemName.substring(dotIndex + 1);
                }
                if (itemName.substring(0, prefix.length) == prefix && itemName.length > prefix.length) {
                    var thisInc = parseInt(itemName.substring(prefix.length));
                    if (!isNaN(thisInc) && thisInc >= inc) 
                        inc = thisInc+1;
                }
            }
        }
        return prefix + inc;
    },
    getNextUnusedNodeId : function () {
        var tree = this.grid.data;
        for (var i = 1; i<10000; i++) {
            var item = tree.findById(i);
            if (!item) return i;
        }
        return 1;
    },

    baseFieldTypesValueMap: {
        "text": "text: a normal text value",
        "enum": "enum: a text field allowing only certain values",
        "integer": "integer: a whole number",
        "float": "float: a fractional or decimal number",
        "boolean": "boolean: only a true or false allowed",
        "date": "date: a specific date, with no time",
        "time": "time: a specific time, with no date",
        "datetime": "datetime: a specific time on a specific date",
        "sequence": "sequence: a number where every new record gets a new value automatically",
        "URL": "URL: a link to something on the web",
        "image": "image: a link to an image on the web",
        "color": "color: a color value",
        "phoneNumber": "phoneNumber: a phone number"
    },
    binaryFieldTypesValueMap: {
        "imageFile": "imageFile: an image stored in this DataSource",
        "binary": "binary: any binary file that is not an image"
    },

    getFieldTypeValueMap : function () {
        var valueMap,
            isMockDataSource = (isc.isA.MockDataSource(this.targetDataSource) ||
                (isc.isAn.Object(this.targetDataSource) && this.targetDataSource._constructor == "MockDataSource"))
        ;
        if (!isMockDataSource && !this.targetDataSource.clientOnly) {
            valueMap = this._binaryFieldTypesValueMap;
            if (!valueMap) {
                valueMap = this._binaryFieldTypesValueMap = isc.addProperties({}, this.baseFieldTypesValueMap, this.binaryFieldTypesValueMap);
            }
        } else {
            valueMap = this.baseFieldTypesValueMap;
            
            if (isMockDataSource) {
                valueMap = isc.clone(valueMap);
                delete valueMap.sequence;
            }
        }
        return valueMap;
    },
    // Default ListEditor doesn't validate the grid
    validate : function () { 
        return this.Super("validate", arguments) && !this.grid.hasErrors();
    }
},


fieldEditorFields:[
    {name:"title", treeField: true, width: "*",
        prompt: "The name of this field that users of your applications will see",
        // Where includeFrom has been used, the title defaults to includeFrom's title.
        // Show that instead of nothing. Same for a standard field with no explicit title.
        formatCellValue : function(value, record, rowNum, colNum, grid) {
            if (!record) record = {};
            var formattedValue = this._titleFromValueOrIncludeFrom(value, record.includeFrom);                                
            if (record.includeFrom && !record.title) {
                formattedValue = "<i>" + formattedValue + "</i>";
            } else if (!record.title) {
                var title = isc.DataSource.getAutoTitle(record.name);
                formattedValue = "<i>" + title + "</i>";
            }
            return formattedValue;
        },

        showHover: true,
        hoverWrap: false,
        hoverHTML : function (record, value, rowNum, colNum, grid) {
            var hover;
            if (record.includeFrom && !record.title) {
                hover = "Using title from related field";
            } else if (!record.title) {
                hover = "Title automatically derived from field name";
            }
            return hover;
        },

        // If the value is present, return it. Otherwise, return the last
        // part of the includeFrom -- which is what the name defaults to.
        _titleFromValueOrIncludeFrom : function(value, includeFrom) {

            if (value || !includeFrom) {
                return value;
            } else {
                if (includeFrom) {
                    var split = includeFrom.split(".");
                    if (split && split.length >= 2) {
                        var dsName = split[split.length-2],
                            dsField = split[split.length-1],
                            ds = isc.DS.get(dsName)
                        ;
                        if (ds) {
                            var field = ds.getField(dsField);
                            if (field && field.title) {
                                value = field.title;
                            }
                        }
                    }
                }
                return value;
            }
        },

        changed : function (form, item, value) {
            var grid = item.grid,
                rowNum = grid.getEditRow(),
                colNum = grid.getFieldNum("name"),
                nameValue = grid.getEditValue(rowNum, colNum),
                record = grid.getRecord(rowNum),
                overwriteName = (record && record._overwriteName)
            ;
            if (grid._updateFromTitle || overwriteName || !nameValue || nameValue == "") {
                var field = grid.getField("title");
                nameValue = isc.DataSourceEditor.createNameFromTitle(value);

                grid.setEditValue(rowNum, colNum, nameValue);
                grid._updateFromTitle = true;
                // _overwriteName flag only applies for starting the overwrite
                if (overwriteName) delete record._overwriteName;
            }
        },

        editorExit : function (editCompletionEvent, record, newValue, rowNum, colNum, grid) {
            delete grid._updateFromTitle;
        }
    },
    {name:"name", title: "Internal name", required: true, canHover: true,
        prompt: "Internal name for your field. " +
            "Users of your application will not see this name, but it will appear in " +
            "exported code and in some advanced areas of this design tool",
        // Where includeFrom has been used, the name defaults to includeFrom's name.
        // So as well show that instead of nothing. We'll put it in italics to indicate
        // that it is special.
        //
        // In fact, we may as well show the includeFrom value in all cases (where
        // present) -- this will help avoid confusion where the name has been edited.

        formatCellValue : function(value, record, rowNum, colNum, grid) {
            if (!record) record = {};
            var formattedValue = this._nameFromValueOrIncludeFrom(value, record.includeFrom);
            if (record.includeFrom) {
                var formattedName = grid.formatRelatedField(record.includeFrom),
                    formattedVia = (record.includeVia ? " via " + record.includeVia : ""),
                    formattedAggregation = (record.includeSummaryFunction ? " as " + record.includeSummaryFunction : "");
                formattedValue += " [Included from: <i>" + formattedName + formattedVia + formattedAggregation + "</i>]";
            }
            return formattedValue;
        },

        // If the value is present, return it. Otherwise, return the last
        // part of the includeFrom -- which is what the name defaults to.
        _nameFromValueOrIncludeFrom : function(value, includeFrom) {
            if (value || !includeFrom) {
                return value;
            } else {
                var dotIndex = includeFrom.lastIndexOf(".");
                if (dotIndex == -1) {
                    return value;
                } else {
                    return includeFrom.substring(dotIndex + 1);
                }
            }
        },

        // Note that name is *required* in the schema. This isn't literally true
        // anymore, since now name is optional when includesFrom is specified.
        // We could make it optional in the schema, but that may cause difficulties
        // elsewhere. So, for the moment, we're doing some massaging here.
        //
        // For editing, we'll display the last part of the includeFrom if the name
        // is blank -- that is what the default actually is, so it is a reasonable
        // starting point for editing.
        formatEditorValue : function(value, record, form, item) {
            if (!record) record = {};
            return this._nameFromValueOrIncludeFrom(value, record.includeFrom);
        },

        // If the user blanks the value, it would normally be an error (since
        // the name is required. So, let's simply supply the default in that
        // case -- that is, use the includeFrom's name. The alternative would
        // be to allow the blank, but that would mean changing the schema so that
        // name would not be required.
        parseEditorValue : function(value, record, rowNum, colNum, grid) {
            if (!record) record = {};
            return this._nameFromValueOrIncludeFrom(value, record.includeFrom);
        },

        showHover: true,
        hoverHTML : function (record, value, rowNum, colNum, grid) {
            var hover;
            if (record.includeFrom) {
                var split = record.includeFrom.split(".");
                if (split && split.length >= 2) {
                    var dsName = split[split.length-2],
                        fieldName = split[split.length-1]
                    ;
                    hover = "This field shows a value from the field <i>" + fieldName +
                        "</i> in the related DataSource <i>" + dsName + "</i>" +
                        "<p>To include a different field, just remove the included field " +
                        "and add a new one";
                }
            }
            return hover;
        },
        validators: [
            { 
                type: "regexp",
                expression: "^[a-zA-Z_][a-zA-Z0-9_]*$",
                errorMessage: "Field name must not contain spaces or punctuation other than underscore (_), and may not start with a number",
                stopIfFalse: true
            },
            {
                type:"custom",
                condition: function (item, validator, value, record, additionalContext) {
                    if (!value) return true;
                    var grid = additionalContext.component,
                        result = true;
                    ;
                    if (grid) {
                        var currentRow = additionalContext.rowNum,
                            totalRows = grid.getTotalRows()
                        ;
                        for (var i = 0; i < totalRows; i++) {
                            if (i == currentRow) continue;
                            var gridRecord = grid.getRecord(i);
                            if (gridRecord && value == gridRecord[item.name]) {
                                result = false;
                                break;
                            }
                        }
                    }
                    return result;
                },
                errorMessage: "Field name must be unique within the DataSource"
            }
        ]
    },
    {name:"type", width: 150, type: "ComboBoxItem", editorProperties: { completeOnTab: true },
        prompt: "Data type of this field",
        getEditorValueMap : function (values, field, grid) {
            return grid.creator.getFieldTypeValueMap();
        },
        formatCellValue : function(value, record, rowNum, colNum, grid) {
            if (!record) record = {};
            if (record.foreignKey) {
                var formattedName = grid.formatRelatedField(record.foreignKey);
                value = "relation (to " + formattedName + ")";
            } else if (record.includeFrom) {
                value = this._typeFromIncludeFrom(record.includeFrom);
            }
            return value;
        },

        _typeFromIncludeFrom : function(includeFrom) {
            var type,
                split = includeFrom.split(".")
            ;
            if (split && split.length >= 2) {
                var dsName = split[split.length-2],
                    dsField = split[split.length-1],
                    ds = isc.DS.get(dsName)
                ;
                if (ds) {
                    var field = ds.getField(dsField);
                    type = field && field.type;
                }
            }
            return type;
        },

        changed : function (form, item, value) {
            // Update the button states using the current edit-state record
            item.grid.creator.updateButtonStates(item.grid.getEditedRecord(item.grid.getEditRow()));
        }
    },
    {name:"required", title:"Req.", width:40, canToggle:true, canHover: true,
        prompt: "Required: whether users are required to provide a value for this field when saving data",
        hoverHTML : function (record, value, rowNum, colNum, grid) {
            var hover;
            if (record.includeFrom) hover = "Included fields are not editable";
            return hover;
        }
    },
    {name:"hidden", width:60, canToggle:true,
        prompt: "Whether this field is hidden from users"
    },
    {name:"length", width:70,
        prompt: "For text fields, what is the maximum length allowed"
    },
    {name:"primaryKey", title:"Is PK", width:70, canToggle:true,
        prompt: "The Primary Key (PK) uniquely identifies each DataSource record and " +
                "allows related data across DataSources to be displayed together.",
        showHover: true,
        hoverHTML : function (record, value, rowNum, colNum, grid) {
            return this.prompt;
        },

        recordClick : function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
            // Record recordNum for later use in change()
            
            viewer._lastRowNum = recordNum;
        },
        change : function (form, item, value, oldValue) {
            var grid = this.grid || this,
                dsEditor = grid.creator.creator,
                hasPkField = (grid.data.find("primaryKey", true) != null)
            ;

            // If no PK field is currently configured, let the normal assignment action
            // take place
            if (!hasPkField) return;

            // This shouldn't happen because canEditCell() disables editing the field
            // when not appropriate, however, just to make sure...
            if (!dsEditor.canChangePrimaryKey) return false;

            // Grab the row being unchecked
            
            var rowNum = (item ? item.rowNum : grid._lastRowNum);

            var checkChangedValue = function (rowNum, value) {
                if (value) {
                    // Setting primaryKey and maybe moving from another field
    
                    // Does this target field have valid data to be a PK? (i.e. unique and
                    // non-null values)
                    var sampleData = (dsEditor.editSampleData ? dsEditor.getSampleData() : null) || [],
                        targetField = grid.getRecord(rowNum),
                        targetFieldName = targetField.name,
                        targetFieldValues = sampleData.getProperty(targetFieldName),
                        targetFieldUniqueValues = targetFieldValues.getUniqueItems(),
                        valid = true
                    ;
                    if (targetFieldUniqueValues.length != targetFieldValues.length) {
                        // Non-unique values
                        valid = false;
                    }
    
                    if (valid) {
                        for (var i = 0; i < targetFieldValues.length; i++) {
                            if (targetFieldValues[i] == null) {
                                // null value
                                valid = false;
                            }
                        }
                    }
                    if (!valid) {
                        isc.confirm("To be used as a primary key, a field must have all " +
                                    "values unique and non-empty. Field <i>" +
                                    targetFieldName +
                                    "</i> does not - you can fix this in the Sample Data " +
                                    "tab",
                            function (response)
                        {
                            // OK means do nothing; cancel goes to sample data
                            if (response != true) {
                                dsEditor.mainTabSet.selectTab("sampleData");
                            }
                        }, {
                            buttons: [
                                { title: "Go to Sample Data", width:150, overflow: "visible",
                                    click: function () { this.topElement.cancelClick(); }
                                },
                                isc.Dialog.OK
                            ],
                            autoFocusButton: 0
                        });
    
                        // Cancel change to PK value
                        return false;
                    }
    
                    // Field is eligible for being a primary key
                    var options = {},
                        formValues = { action: "keepValues" }
                    ;
    
                    
    
                    if (sampleData.length > 0) {
                        if (targetField.type == "integer" || targetField.type == "sequence") {
                            
    
                            // Determine the next value in the "sequence"
                            var targetFieldValues = sampleData.getProperty(targetFieldName),
                                maxValue = Number.MIN_SAFE_INTEGER
                            ;
                            for (var i = 0; i < targetFieldValues.length; i++) {
                                var value = targetFieldValues[i];
                                if (value > maxValue) maxValue = value;
                            }
                            if (targetField.type == "sequence") {
                                options.keepAsSequence = "Keep existing sequence values with " +
                                    "next value: " + (maxValue+1);
                            } else {
                                options.keepAsSequence = "Keep existing values and make this field " +
                                    "a sequence with next value: " + (maxValue+1);
                            }
                            formValues.action = "keepAsSequence";
                        } else {
                            options.newSequence = "Discard old values and make this field a " +
                                "sequence starting with 0";
                        }
                    } else {
                        if (targetField.type == "sequence") {
                            options.newSequence = "Keep this field a sequence starting with 0";
                        } else {
                            options.newSequence = "Make this field a sequence starting with 0";
                        }
                        formValues.action = "newSequence";
                    }
                    options.keepValues = (sampleData.length > 0 ?
                        "Keep values and r" :
                        "R") + "equire user to enter a value when creating new records";
    
                    var changePrimaryKey = function (action) {
                        // action = "keepAsSequence" | "newSequence" | "keepValues"
    
                        // Clear previous primaryKey selection
                        var currentPkField = grid.data.find("primaryKey", true),
                            currentPkRowNum = grid.getRecordIndex(currentPkField)
                        ;
                        grid.startEditing(currentPkRowNum);
                        grid.setEditValue(currentPkRowNum, "primaryKey", false);

                        // Save off the original primaryKey fieldName so we know whether
                        // relations should be removed. They should if the PK has changed
                        // and there are relations to this DS.
                        if (!grid._originalPKFieldName) {
                            grid._originalPKFieldName = currentPkField.name;
                        }

                        // If setting primary key back to the original field, we don't need
                        // the original PK field name anymore - it hasn't changed.
                        if (targetField.name == grid._originalPKFieldName) {
                            delete grid._originalPKFieldName;
                        }

                        // Set new primaryKey selection and update data as needed
                        grid.startEditing(rowNum);
                        grid.setEditValue(rowNum, "primaryKey", true);

                        if (action == "keepAsSequence") {
                            // If the new PK field is already a sequence, don't force it hidden
                            if (targetField.type != "sequence") {
                                grid.setEditValue(rowNum, "type", "sequence");
                                grid.setEditValue(rowNum, "hidden", true);
                            }
                            grid.endEditing();
                        } else if (action == "newSequence") {
                            // If the new PK field is already a sequence, don't force it hidden
                            if (targetField.type != "sequence") {
                                grid.setEditValue(rowNum, "type", "sequence");
                                grid.setEditValue(rowNum, "hidden", true);
                            }
                            grid.endEditing();
    
                            if (sampleData.length > 0) {
                                var sampleDataGrid = dsEditor.dataGrid,
                                    rowCount = sampleDataGrid.getTotalRows()
                                ;
                                for (var i = 0; i < rowCount; i++) {
                                    sampleDataGrid.setEditValue(i, targetFieldName, rowNum);
                                }
                                sampleDataGrid.markForRedraw("created new sequence");
                            }
                        } else {
                            grid.setEditValue(rowNum, "required", true);
                            // Don't allow field value to be updated - only entered for new records
                            targetField.canUpdate = false;
                            grid.endEditing();
                        }
                    };
    
                    var dialog = isc.Dialog.create({
                        title: "Change primary key",
                        isModal: true,
                        autoSize: true,
                        autoCenter: true,
                        bodyDefaults: { padding: 10 },
                        saveData : function () {
                            var action = this.items[0].getValue("action");
                            changePrimaryKey(action);
                        }, 
                        items: [
                            isc.DynamicForm.create({
                                autoDraw: false,
                                autoFocus: true,
                                width: 450,
                                values: formValues,
                                items: [
                                    { name: "action", editorType: "RadioGroupItem",
                                        showTitle: false, width: "*", wrap: false,
                                        valueMap: options
                                    }
                                ]
                            }),
                            isc.LayoutSpacer.create({ autoDraw: false, height: 10 }),
                            isc.HLayout.create({
                                autoDraw: false,
                                height: 1,
                                membersMargin: 10,
                                width: 450,
                                align: "right",
                                members: [
                                    isc.IButton.create({
                                        autoShow: false,
                                        title: "Cancel",
                                        width: 75,
                                        click: function () { dialog.cancelClick(); }
                                    }),
                                    isc.IButton.create({
                                        autoShow: false,
                                        title: "OK",
                                        width: 75,
                                        click: function () { dialog.okClick(); }
                                    })
                                ]
                            })
                        ]
                    });
    
                    return false;
    
                } else {
                    // Removing primaryKey designation from a field.
    
                    var primaryKeyCount = grid.data.findAll("primaryKey", true).length;
    
                    // If there is only one primaryKey value there are conditions to removing
                    if (primaryKeyCount == 1) {
                        // If a primaryKey is required, see if there a new primaryKey field
                        // should be generated or if a previously generated one still exists
                        // to use
                        if (dsEditor.autoAddPK) {
                            // A PK should be automatically added or if a previous auto-added
                            // one can be found it can be used.
    
                            // Look for previous auto-added PK field. This will not handle
                            // the case where uniqueId is added but the renamed either by
                            // changing the DataSource ID or explicitly.
                            var field = grid.data.find("name", "uniqueId");
                            if (!field) field = grid.data.find("name", "internalId");
                            if (field && field.type == "sequence" && field.hidden == "true") {
                                var rowNum = grid.getRecordIndex(field);
                                grid.setEditValue(rowNum, "primaryKey", true);
                                return;
                            }
    
                            isc.confirm("All DataSources require a primary key. Do you want to add " +
                                        "an internal primary key field with automatically generated " +
                                        "values (the user will never see this field)?" +
                                        "<p>Note: to change to another existing field as primary " +
                                        "key, click the Primary Key checkbox for that field first.",
                                function (response)
                            {
                                if (response == true) {
                                    // Uncheck the primaryKey from the changing record
                                    grid.cancelEditing();
                                    var record = grid.getRecord(rowNum);
                                    record.primaryKey = false;
                                    grid.refreshRow(rowNum);
                                    grid.setEditValue(rowNum, "primaryKey", false);
    
                                    // Create a new PK field
                                    var fields = [];
                                    dsEditor.createUniqueIdField(fields);
                                    grid.creator.newRecord(fields[0]);

                                    // Save off the original primaryKey fieldName so we know whether
                                    // relations should be removed. They should if the PK has changed
                                    // and there are relations to this DS.
                                    if (!grid._originalPKFieldName) {
                                        grid._originalPKFieldName = record.name;
                                    }

                                    // If setting primary key back to the original field, we don't need
                                    // the original PK field name anymore - it hasn't changed.
                                    if (fields[0].name == grid._originalPKFieldName) {
                                        delete grid._originalPKFieldName;
                                    }
                                }
                            }, {
                                buttons: [
                                    isc.Dialog.CANCEL,
                                    { title: "Add Field", width:75, overflow: "visible",
                                      click: function () { this.topElement.okClick(); }
                                    }
                                ],
                                autoFocusButton: 1
                            });
                            // Don't allow the value change to take effect until the confirmation
                            // dialog has a positive response
                            return false;
    
                        } else if (dsEditor.requirePK) {
                            isc.say("All DataSources requires a Primary Key");
                            return false;
                        }
                    } else {
                        
                        return false;
                    }
                }
            };

            // If there is a relation pointing to this DS confirm the user is OK with
            // removing the relation before continuing. This is only applicable when
            // changing the original PK field.
            //
            // The relation(s) won't be removed until this DS is saved. Additionally,
            // if the PK is moved back to the original field no relations are removed.
            //
            var dsRelations = dsEditor.dsRelations;
            if (!grid._originalPKFieldName && dsRelations) {
                var dsId = dsEditor.getDataSourceID(),
                    relations = dsRelations.getRelationsForDataSource(dsId),
                    relatedDataSources = []
                ;
                if (isc.isAn.Array(relations)) {
                    var currentPkField = grid.data.find("primaryKey", true);
                    for (var i = 0; i < relations.length; i++) {
                        var relation = relations[i];
                        if (relation.relatedFieldName == currentPkField.name) {
                            relatedDataSources.add(relation.dsId);
                        }
                    }
                }
                if (relatedDataSources.length > 0) {
                    var names = (relatedDataSources.length > 2 ?
                        relatedDataSources.slice(0,-1).join(",") + " and " + relatedDataSources.slice(-1) :
                        (relatedDataSources.length > 1 ?
                            relatedDataSources.join(" and ") :
                            relatedDataSources[0])),
                        plural = (relatedDataSources.length > 1 ? "s" : ""),
                        has = (relatedDataSources.length > 1 ? "have" : "has a"),
                        depends = (relatedDataSources.length > 1 ? "depend" : "depends")
                    ;
                    isc.confirm("DataSource" + plural + " <i>" + names + "</i> " + has +
                        " relation" + plural + " that " + depends + " on this primary " +
                        "key of this DataSource." +
                        "<P>" +
                        "Are you sure you want to change the primary key? The " +
                        "relation will be removed.",
                        function (response)
                    {
                        // OK means remove relations; cancel ignores click
                        if (response) {
                            checkChangedValue(rowNum, value);
                        }
                    }, {
                        buttons: [
                            { title: "Remove Relation" + plural,
                                width:150, overflow: "visible",
                                click: function () { this.topElement.okClick(); }
                            },
                            isc.Dialog.CANCEL
                        ],
                        autoFocusButton: 1
                    });

                    // Cancel change to PK value
                    return false;
                }
            }

            checkChangedValue(rowNum, value);

            // Cancel change to PK value
            return false;
        }
    }
],

opBindingsEditorDefaults: {
    _constructor: "DynamicForm",
    autoDraw: false,
    minHeight: 120,
    width: "100%",
    padding: 5,
    wrapItemTitles: false,

    initWidget : function () {
        this.fields = [
            { type: "blurb", defaultValue: "Edit the roles required to access each DataSource operation" },
            { type: "RowSpacer" },
            this.createRolesField("fetchRequiresRole", "Roles required for <i>fetch</i> operation"),
            this.createRolesField("addRequiresRole", "Roles required for <i>add</i> operation"),
            this.createRolesField("updateRequiresRole", "Roles required for <i>update</i> operation"),
            this.createRolesField("removeRequiresRole", "Roles required for <i>remove</i> operation")
        ];

        this.Super('initWidget', arguments);
    },

    specialFieldValues: ["_any_","*super*","false"],

    createRolesField : function (fieldName, title) {
        var availableRoles = isc.Auth.getAvailableRoles();
        var valueMap = {
            "_any_": "Any user - no roles required"
        };
        if (availableRoles) {
            availableRoles.sort();
            for (var i = 0; i < availableRoles.length; i++) {
                var role = availableRoles[i];
                valueMap[role] = role;
            }
        }
        valueMap["*super*"] = "SuperUser only";
        valueMap["false"] = "None - no user may access";

        var specialFieldValues = this.specialFieldValues;
        var field = {
            name: fieldName,
            type: "select",
            title: title,
            multiple: true,
            multipleAppearance: "picklist",
            valueMap: valueMap,
            pickListProperties: {
                selectionChanged : function (record, state) {
                    if (state) {
                        var value = record[fieldName];
                        if (specialFieldValues.contains(value)) {
                            // Selecting a special value, clear all other selections, if any
                            var records = this.getSelection();
                            for (var i = 0; i < records.length; i++) {
                                var record = records[i];
                                if (record[fieldName] != value) {
                                    this.deselectRecord(record);
                                }
                            }
                        } else {
                            // Selecting a role, clear any special value selections, if any
                            var records = this.getSelection();
                            for (var i = 0; i < records.length; i++) {
                                var record = records[i];
                                if (specialFieldValues.contains(record[fieldName])) {
                                    this.deselectRecord(record);
                                }
                            }
                        }
                    }
                }
            }
        }
        return field;
    }

},

mockEditorDefaults: {
    _constructor: "DynamicForm",
    minWidth: 80,
    minHeight: 20,
    width: "100%",
    height: "100%",
    numCols: 2,
    fields: [
        {
            name:"ID", title: "DataSource name", wrapTitle: false, required:true,
            selectOnFocus: true,
            hoverWidth: 300,
            validateOnExit: true,
            validators: [
                { 
                    type: "regexp",
                    expression: "^(?!isc_).*$",
                    errorMessage: "DataSource ID must not start with 'isc_'. That prefix is reserved for framework DataSources.'",
                    stopIfFalse: true
                },
                { 
                    type: "regexp",
                    expression: "^[a-zA-Z_][a-zA-Z0-9_]*$",
                    errorMessage: "DataSource ID must not contain spaces or punctuation other than underscore (_), and may not start with a number",
                    stopIfFalse: true
                },
                {
                    type:"custom",
                    condition: function (item, validator, value, record, additionalContext) {
                        if (!value) return true;
                        if (!validator.idMap) {
                            // Create idMap to map from lowercase ID to actual ID so that
                            // entered name can be matched to an existing schema regardless
                            // of case.
                            var allDataSources = isc.DS.getRegisteredDataSourceObjects(),
                                idMap = {}
                            ;
                            for (var i = 0; i < allDataSources.length; i++) {
                                var ds = allDataSources[i];
                                if (ds && ds.componentSchema) {
                                    var id = ds.ID;
                                    idMap[id.toLowerCase()] = id;
                                }
                            }
                            validator.idMap = idMap;
                        }
                        // Also validate that the non-schema DS is not an internal
                        // application DS (i.e. a Reify-created DS is OK)
                        var id = validator.idMap[value.toLowerCase()] || value,
                            ds = isc.DS.get(id)
                        ;
                        return (!ds || (!ds.componentSchema && ds.sourceDataSourceID));
                    },
                    errorMessage: "DataSource name matches a system or application DataSource. Please choose another name."
                }
            ]
        },
        {
            name: "edit",
            type: "TextArea",
            colSpan: 2,
            allowNativeResize: true,
            width: "*", height: "*",
            showTitle: false
        }
    ]
},

newButtonDefaults:{
    _constructor:"IButton",
    autoParent:"gridButtons",
    title: "New Field",
    width: 150,
    click:"this.creator.newRecord()"
},

moreButtonDefaults:{
    _constructor:"IButton",
    autoParent:"gridButtons",
    width: 100,
    click:"this.creator.editMore()",
    disabled:true
},

buttonLayoutDefaults: {
    _constructor: "HLayout",
    height:42,
    layoutMargin:10,
    membersMargin:10,
    align: "right"
},

cancelButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Cancel",
    width: 100,
    autoParent: "buttonLayout",
    click: function() {
        this.creator.cancel();
    }
},

saveButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Save",
    width: 100,
    autoParent: "buttonLayout",
    click: function() {
        this.creator.save();
    }
},

addTestDataButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Add Test Data",
    autoFit: true,
    click: function(){
        var dsData = isc.addProperties({}, 
            this.creator.mainEditor ? this.creator.mainEditor.getValues() : this.creator.mainEditorValues
        )
        var dataImportDialog = isc.DataImportDialog.create({
            ID: "dataImportDialog",
            targetDataSource: dsData.ID
        });
        dataImportDialog.show();
    }
},

editWithFieldsButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Edit fields and data separately...",
    autoFit: true,
    click: function() {
        this.creator.switchToEditFieldsAndDataSeparately();
    }
},

legalValuesButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Allowed values list",
    width: 150,
    disabled: true,
    click: function() {
        var editor = this.creator.fieldEditor,
            grid = editor.grid,
            tree = grid.data,
            selectedNode = grid.getSelectedRecord() || tree.root,
            parentNode = (isc.isA.Tree(tree) ? tree.getParent(selectedNode) : null)
        ;

        if (selectedNode && !selectedNode.isFolder && parentNode == tree.root) {
            // Look up the creator chain for the DataSourceEditor
            var dsEditor = this;
            while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
            if (!dsEditor) {
                this.logWarn("Could not find the DataSourceEditor");
                return;
            }
            dsEditor.editFieldLegalValues(selectedNode);
        }
    },
    canHover: true,
    hoverStyle: "vbLargeHover",
    getHoverHTML : function () {
        return (this.isDisabled() ? "To create a field that only allows specific values, select field type 'enum'" : null);
    }
},

validatorsButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Validators...",
    width: 150,
    disabled: true,
    click: function() {
        var editor = this.creator.fieldEditor,
            grid = editor.grid,
            tree = grid.data,
            selectedNode = grid.getSelectedRecord() || tree.root,
            parentNode = (isc.isA.Tree(tree) ? tree.getParent(selectedNode) : null)
        ;

        if (selectedNode && !selectedNode.isFolder && parentNode == tree.root) {
            // Look up the creator chain for the DataSourceEditor
            var dsEditor = this;
            while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
            if (!dsEditor) {
                this.logWarn("Could not find the DataSourceEditor");
                return;
            }
            dsEditor.editFieldValidators(selectedNode);
        }
    }
},

securityButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Security...",
    width: 150,
    disabled: true,
    click: function() {
        var editor = this.creator.fieldEditor,
            grid = editor.grid,
            tree = grid.data,
            selectedNode = grid.getSelectedRecord() || tree.root,
            parentNode = (isc.isA.Tree(tree) ? tree.getParent(selectedNode) : null)
        ;

        if (selectedNode && !selectedNode.isFolder && parentNode == tree.root) {
            // Look up the creator chain for the DataSourceEditor
            var dsEditor = this;
            while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
            if (!dsEditor) {
                this.logWarn("Could not find the DataSourceEditor");
                return;
            }
            dsEditor.editFieldSecurity(selectedNode);
        }
    }
},

addChildButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Add Child Object",
    width: 100,
    click: function() {
        var editor = this.creator.fieldEditor,
            grid = editor.grid,
            tree = grid.data,
            selectedNode = grid.getSelectedRecord() || tree.root,
            parentNode = tree.getParent(selectedNode),
            newNode = {
                isFolder: true,
                children: [],
                multiple: true,
                childTagName: "item"
            }
        ;

        if (selectedNode) {
            if (!selectedNode.isFolder) selectedNode = parentNode;
            newNode.name = editor.getNextUniqueFieldName(selectedNode, "child"),
            newNode.id = editor.getNextUnusedNodeId(),
            newNode.parentId = selectedNode.id;
            // Let title field know that name can be overwritten
            newNode._overwriteName = true;
            tree.linkNodes([newNode], parentNode);
            tree.openFolder(newNode);
            // Auto-edit new child node
            var node = grid.findByKey(newNode.id);
            if (node) {
                var rowNum = grid.getRecordIndex(node);
                if (rowNum >= 0) {
                    grid.startEditing(rowNum);
                }
            }
        }

    }
},

relationsButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Relations...",
    prompt: "Relations are links between records of different DataSources such as a link " +
            "from an Order to the Customer that ordered it.<P>" +
            "Click the <i>Relations</i> button to view & edit relations.",
    hoverStyle: "vbLargeHover",
    width: 150,
    click: function() {
        // Look up the creator chain for the DataSourceEditor
        var dsEditor = this;
        while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
        if (!dsEditor) {
            this.logWarn("Could not find the DataSourceEditor");
            return;
        }
        dsEditor.editRelations();
    }
},

includeFieldButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Include field...",
    width: 150,
    prompt: "Add a field whose data comes from fields in a related DataSource",
    hoverWidth: 125,
    hoverStyle: "vbLargeHover",
    disabled: true,
    click: function() {
        // Look up the creator chain for the DataSourceEditor
        var dsEditor = this;
        while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
        if (!dsEditor) {
            this.logWarn("Could not find the DataSourceEditor");
            return;
        }
        dsEditor.editIncludeField();
    }
},

formattingButtonDefaults: {
    _constructor: "IButton",
    autoDraw: false,
    title: "Formatting...",
    disabled: true,
    width: 150,
    click: function() {
        // Look up the creator chain for the DataSourceEditor
        var editor = this.creator.fieldEditor,
            grid = editor.grid,
            tree = grid.data,
            selectedNode = grid.getSelectedRecord() || tree.root,
            parentNode = (isc.isA.Tree(tree) ? tree.getParent(selectedNode) : null)
        ;

        if (selectedNode && !selectedNode.isFolder && parentNode == tree.root) {
            var dsEditor = this;
            while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
            if (!dsEditor) {
                this.logWarn("Could not find the DataSourceEditor");
                return;
            }
            dsEditor.editFormatting(selectedNode);
        }
    }
},

reorderButtonLayoutDefaults: {
    _constructor: "HLayout",
    membersMargin: 4,
    layoutAlign: "center",
    height: 10
},

reorderUpButtonDefaults: {
    _constructor: "ImgButton",
    src: "[SKINIMG]TransferIcons/up.png",
    width: 22, height: 22,
    prompt: "Move field up",
    click: function() {
        // Look up the creator chain for the DataSourceEditor
        var editor = this.creator.fieldEditor,
            grid = editor.grid,
            tree = grid.data,
            selectedNode = grid.getSelectedRecord() || tree.root,
            parentNode = (isc.isA.Tree(tree) ? tree.getParent(selectedNode) : null)
        ;

        if (selectedNode && !selectedNode.isFolder && parentNode == tree.root) {
            var dsEditor = this;
            while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
            if (!dsEditor) {
                this.logWarn("Could not find the DataSourceEditor");
                return;
            }
            dsEditor.moveField(selectedNode, -1);
        }
    }
},

reorderDownButtonDefaults: {
    _constructor: "ImgButton",
    src: "[SKINIMG]TransferIcons/down.png",
    width: 22, height: 22,
    prompt: "Move field down",
    click: function() {
        // Look up the creator chain for the DataSourceEditor
        var editor = this.creator.fieldEditor,
            grid = editor.grid,
            tree = grid.data,
            selectedNode = grid.getSelectedRecord() || tree.root,
            parentNode = (isc.isA.Tree(tree) ? tree.getParent(selectedNode) : null)
        ;

        if (selectedNode && !selectedNode.isFolder && parentNode == tree.root) {
            var dsEditor = this;
            while (dsEditor && !isc.isA.DataSourceEditor(dsEditor)) dsEditor = dsEditor.creator;
            if (!dsEditor) {
                this.logWarn("Could not find the DataSourceEditor");
                return;
            }
            dsEditor.moveField(selectedNode, 1);
        }
    }
},

mainTabSetDefaults: {
    _constructor: "TabSet",
    overflow: "visible",
    width: "100%", height:"100%"
},

mainStackDefaults: {
    _constructor: "SectionStack",
    overflow: "visible",
    width: "100%", height:"100%",
    visibilityMode: "multiple"
},

instructionsSectionDefaults: {
    _constructor: "SectionStackSection",
    title: "Instructions",
    expanded:true, canCollapse:true
},

instructionsDefaults: {
    _constructor: "HTMLFlow", 
    autoFit:true,
    padding:10
},

mainSectionDefaults: {
    _constructor: "SectionStackSection",
    title:"DataSource Properties", 
    expanded:true, canCollapse:false, showHeader: false
},

fieldSectionDefaults: {
    _constructor: "SectionStackSection",
    title:"DataSource Fields &nbsp;<span style='color:#BBBBBB'>(click to edit or press New Field)</span>", 
    expanded:true, canCollapse: true
},

opBindingsSectionDefaults: {
    _constructor: "SectionStackSection",
    title:"DataSource Operations", 
    expanded:false
},

mockSectionDefaults: {
    _constructor: "SectionStackSection",
    title:"MockDataSource Data", 
    expanded:true, canCollapse:false, showHeader: false, hidden: true
},

deriveFieldsSectionDefaults: {
    _constructor: "SectionStackSection",
    title:"Derive Fields From SQL",
    expanded:false, canCollapse: true
},

// Sample Data tab
sampleDataPaneDefaults: {
    _constructor: isc.VLayout,
    autoDraw: false,
    width: "100%",
    height: "100%"
},

sampleDataLabelDefaults: {
    _constructor: isc.Label,
    autoDraw: false,
    width: "100%",
    height: 35,
    padding: 10,
    contents: "Type in sample data below"
},

sampleDataGridDefaults: {
    _constructor: isc.ListGrid,
    autoDraw: false,
    width: "100%",
    height: "100%",
    // A filter is not applicable because all data is pre-saved so it gets validated
    // showFilterEditor: true,
    canEdit: true,
    canRemoveRecords: true,
    editEvent: "click",
    listEndEditAction: "next",
    escapeKeyEditAction: "done",
    autoSaveEdits: false,
    warnOnUnmappedValueFieldChange: false,
    startEditing: function(rowNum, colNum, suppressFocus) {
        var record = this.getEditedRecord(rowNum);
        if (isc.getKeys(record) < 1) {
            this.setEditValue(rowNum, '_operation', 'add');
        } else if (!record._operation) {
            this.setEditValue(rowNum, '_operation', 'update');
        }
        this.Super('startEditing', arguments);
    },
    
    validateRow : function (rowNum, suppressRefresh) {
        var result = this.Super("validateRow", arguments),
            pkFieldValue = (this._pkFieldName ? this.getEditValue(rowNum, this._pkFieldName) : null)
        ;
        if (this._pkFieldName && pkFieldValue == null) {
            this.setEditValue(rowNum, this._pkFieldName, this._pkNextValue++);
        }

        return result;
    }
},

sampleDataButtonLayoutDefaults: {
    _constructor: isc.HLayout,
    autoDraw: false,
    width: "100%", height: 35,
    padding: 5,
    membersMargin: 10
},

sampleDataAddRecordButtonDefaults: {
    _constructor: isc.Button,
    autoDraw: false,
    title: "Add New Record",
    autoFit: true,
    click : function () {
        this.creator.dataGrid.startEditingNew();
    }
},

sampleDataDiscardDataButtonDefaults: {
    _constructor: isc.Button,
    autoDraw: false,
    wrap: false,
    autoFit: true,
    title: "Discard sample data changes",
    click : function () {
        this.creator.revertDataChanges();
    }
},

// Window "body"
bodyProperties:{
    overflow:"auto",
    layoutMargin:10
},

deriveFormDefaults: {
    _constructor: "DynamicForm"
},

previewGridDefaults: {
    _constructor: "ListGrid",
    showFilterEditor: true    
},

// properties

//> @attr dataSourceEditor.canAddChildSchema (Boolean : false : IRW)
// Can a child schema be added to a field?
//
// @visibility devTools
//<
canAddChildSchema: false,

//> @attr dataSourceEditor.canEditChildSchema (Boolean : false : IRW)
// Can a child schema be edited on a field?
//
// @visibility devTools
//<
canEditChildSchema: false,

//> @attr dataSourceEditor.canSelectPrimaryKey (Boolean : true : IRW)
// Can a field be selected as a primary key?
//
// @visibility devTools
//<
canSelectPrimaryKey: true,

//> @attr dataSourceEditor.showMoreButton (Boolean : true : IRW)
// Show "More" button for editing field details?
//
// @visibility devTools
//<

//> @attr dataSourceEditor.showLegalValuesButton (Boolean : null : IRW)
// Show "Allowed values list" button for editing field enum values?
//
// @visibility devTools
//<

//> @attr dataSourceEditor.editMockData (Boolean : null : IRW)
// When editing a MockDataSource only a text field is presented to enter
// the +link{MockDataSource.mockData} text unless explicit fields are
// defined. To force editing of fields instead of <code>mockData</code>
// set this property to <code>false</code>.
//
// @visibility devTools
//<

//> @attr dataSourceEditor.editSampleData (Boolean : null : IRW)
// Should a sample data tab be added to allow editing of cacheData
// for DataSource?
//
// @visibility devTools
//<

//> @attr dataSourceEditor.requirePK (Boolean : null : IRW)
// Is a PK field required (locally or on a parent)? Some DataSource types like
// SQL and Hibernate always require a PK no matter what this property is.
//
// @visibility devTools
//<

//> @attr dataSourceEditor.canChangePrimaryKey (Boolean : true : IRW)
// Can a primary key value be changed? This is different from +link{canSelectPrimaryKey} which
// controls whether the primary key property is shown or not.
//
// @visibility devTools
//<
canChangePrimaryKey: true,

//> @attr dataSourceEditor.autoAddPK (Boolean : null : IRW)
// Create a primary key field if there is no existing one defined. Additionally,
// this automatic field cannot be removed as a primary key nor can it be removed
// completely. An automatic primary key field is always called "uniqueId" initially but
// can be renamed. 
//
// @visibility devTools
//<

//> @attr dataSourceEditor.allowMultiplePK (Boolean : null : IRW)
// Can more than one PK field be defined?
//
// @visibility devTools
//<

//> @attr dataSourceEditor.makeUniqueTableName (Boolean : null : IRW)
// When saving the edited DataSource should the tableName be checked
// against the DB to confirm it is unique. If not unique a suffix
// will be added to guarantee uniqueness.
//
// @visibility devTools
//<

// methods
editNew : function (dataSource, callback, instructions) {
    this.addTestDataButton.hide();
    this.editWithFieldsButton.hide();

    if (this.editSampleData) {
        this._rebindSampleDataGrid();
        this.originalSampleData = null;
    }

    if (dataSource && dataSource.defaults) {
        this.paletteNode = dataSource;
        this.start(dataSource.defaults, callback, true, instructions);
    } else {
        this.start(dataSource, callback, true, instructions);
    }
},
    
editSaved : function (dataSource, callback, instructions) {
    if (!isc.isA.MockDataSource(dataSource)) {
        
        if (!this.builder.onSiteMode) this.addTestDataButton.show();
        else this.addTestDataButton.hide();
        this.editWithFieldsButton.hide();
    } else {
        this.addTestDataButton.hide();
        if (!this.editSampleData && !dataSource.hasExplicitFields()) {
            this.editWithFieldsButton.show();
        } else {
            this.editWithFieldsButton.hide();
        }
    }

    // When loading sample data it make take considerable time to process include from
    // fields and/or populate the grid. A prompt need to be shown to inform the user
    // what is happening. However, at this point it is normal for the DataSourceEditor to
    // not yet be shown. A showPrompt() call would immediately be hidden when the editor
    // is shown. Instead, to allow the DS Editor to show quickly a flag is set so the
    // binding can begin when the editor is shown.
    if (this.editSampleData) {
        if (dataSource.cacheData && (!this.isDrawn() || !this.isVisible())) {
            this._pendingRebindSampleData = true;
        } else {
            this._bindInitialSampleData(dataSource);
        }
    }
    this.start(dataSource, callback, false, instructions);
},

_bindInitialSampleData : function (dataSource) {
    var dataSource = dataSource || this._editingDataSource,
        fieldNames = dataSource.getFieldNames(),
        fields = []
    ;
    for (var i = 0; i < fieldNames.length; i++) {
        fields[i] = dataSource.getField(fieldNames[i]);
    }
    this.originalSampleDataOrigin = dataSource.ID;
    this.originalSampleData = dataSource.cacheData;
    // delayed so a showPrompt() has a chance to draw. Rebinding is CPU intensive and
    // does not allow a thread switch so nothing will happen in the UI until it completes.
    this.delayCall("_rebindSampleDataGrid", [fields, dataSource.cacheData, true]);
},

visibilityChanged : function (isVisible) {
    // When editing an existing DS with sample data we don't start processing it until
    // the DS Editor window is shown so the prompt remains visible.
    if (this._pendingRebindSampleData && isVisible) {
        this._bindInitialSampleData();
        delete this._pendingRebindSampleData;
    }
},

setKnownDataSources : function (dataSourceList) {
    this.knownDataSources = dataSourceList;

    // Don't call getDatasourceDefaults() too early or the field tree is not configured
    if (this.isDrawn()) {
        // Setup DSRelations object for the know DataSources
        var dsId = this.getDataSourceID(),
            dsList = [],
            relationEditor = this.relationEditor
        ;
        var self = this;
        dataSourceList.map(function (node) {
            if (!node) return;
            // Exclude currently editing DS from known list because it may not be up-to-date
            if (node.ID != dsId) {
                // Pull latest pending changes from RelationEditor if it has been used
                var ds = (relationEditor ? relationEditor.getPendingChange(node.ID) : null) || isc.DS.get(node.ID);
                dsList.add(ds);
            }
        });
        // Add DS being edited so that relations can be extracted.
        dsList.add(this.getDatasourceDefaults());

        if (!this.dsRelations) this.dsRelations = isc.DSRelations.create({ dataSources: dsList });
        else this.dsRelations.setDataSources(dsList);
    }
},

showRecord : function (record) {
    if (this.editSampleData) {
        // This method is called by Reify immediately after showing the editor to
        // show a specific sample data record, however, it is likely that the sample
        // data grid isn't yet ready because it is updated on delay. Wait for the
        // grid to be set with a DataSource which is done immediately before data
        // is assigned.
        var grid = this.dataGrid;
        if (!grid || !grid.getDataSource()) {
            this.delayCall("showRecord", arguments, 250);
            return;
        }

        // Find matching record by PK because the record is from another source
        var pkFieldName = grid.getDataSource().getPrimaryKeyFieldName(),
            pkValue = record[pkFieldName]
        ;
        this.mainTabSet.selectTab("sampleData");
        var editRows = grid.getAllEditRows();
        for (var i = 0; i < editRows.length; i++) {
            var rowNum = editRows[i],
                editRecord = grid.getEditedRecord(rowNum)
            ;
            if (editRecord[pkFieldName] == pkValue) {
                grid.scrollToRow(rowNum);
                grid.startEditing(rowNum);
                break;
            }
        }
    }
},

refreshDSRelations : function () {
    // By re-setting the known dataSources the dsRelations will be updated
    this.setKnownDataSources(this.knownDataSources);
},

start : function (dataSource, callback, isNew, instructions) {
    if (instructions) {
        this.mainStack.showSection(0);
        this.instructions.setContents(instructions);
    } else { 
        this.mainStack.hideSection(0);
    }
    if (this.canEditMockData(dataSource)) {
        this.mainStack.hideSection(1);
        this.mainStack.hideSection(2);
        this.mainStack.hideSection(3);
        this.mainStack.showSection(4);
        this.mockEditor.show();
        this._editingMockData = true;
    } else {
        this.mainStack.showSection(1);
        this.mainStack.showSection(2);
        this.mainStack.showSection(3);
        this.mainStack.hideSection(4);
        this.mockEditor.hide();
        this._editingMockData = false;
    }

    if (this.mainEditor) this.mainEditor.clearValues();
    if (this.fieldEditor) {
        // While waiting on fields to populate list show helpful message
        this.fieldEditor.grid.setEmptyMessage("Loading DataSource definition... ${loadingImage}");
        this.fieldEditor.setData(null);
    }
    if (this.opBindingsEditor) this.opBindingsEditor.setData(null);

    this._editingDataSource = dataSource;
    this._fieldRenames = null;
    
    // to be called when editing completes
    this.saveCallback = callback;

    //this.logWarn("editing " + (isNew ? "new " : "" ) + 
    //             "DataSource: " + this.echo(dataSource));
    this.origDSDefaults = null;

    if (!dataSource) {       
        // no initial dataSource properties at all, start editing from scratch 
        return this.show(); 
    }

    this.dsClass = dataSource.Class;
    this.origDSName = null;
    if (isNew) {
        // dataSource has never been saved
        if (isc.isA.DataSource(dataSource)) {
            // serializeableFields picks up the fields data - also pick up the
            // sfName if it's defined
            var sfName = dataSource.sfName;
            // currently used only for web service / SalesForce pathways, where we
            // dynamically retrieve a DataSource generated from XML schema.
            dataSource = dataSource.getSerializeableFields();
            if (sfName) dataSource.sfName = sfName;
            
            this.logWarn("editing new DataSource from live DS, data: " + 
                         this.echo(dataSource));
            this.origDSName = dataSource.ID;
            this._startEditing(dataSource);
        } else {
            var _this = this;
            this.getUniqueDataSourceID(function (dsName) {
                dataSource.ID = dsName;
                _this._startEditing(dataSource);
            });
        }
    } else {
        // we need the clean initialization data for this DataSource (the live data
        // contains various derived state)
        var self = this;

        var convertLiveInstance = function () {
            // serialize instance to XML
            var dsClass = dataSource.getClassName(),
                schema
            ;

            if (isc.DS.isRegistered(dsClass)) {
                schema = isc.DS.get(dsClass);
            } else {
                schema = isc.DS.get("DataSource");
                dataSource._constructor = dsClass;
            }
            var xml = schema.xmlSerialize(dataSource);

            // and get JS the same as would be returned by getFile()
            isc.DMI.callBuiltin({
                methodName: "xmlToJS",
                "arguments": xml,
                callback : function (rpcResponse, data, rpcRequest) {
                    var data = rpcResponse.data;
                    if (!data) {
                        isc.say("Unable to load DataSource definition for '" + dataSource.ID +
                                "' or convert from a live instance");
                        self.cancel();
                        return;
                    }
                    // A converted DataSource cannot be saved
                    self.readOnly = true;
                    self._loadSchemaReply(data);
                }
            });    
        };

        this.dsDataSource.getFile({
            fileName: dataSource.ID,
            fileType: "ds",
            fileFormat: "xml"
        }, function (dsResponse, data, dsRequest) {
            var data = dsResponse.data.length > 0 && dsResponse.data[0];
            if (!data) {
                convertLiveInstance();
                return;
            }
            self._loadSchemaReply(data.fileContentsJS);
        }, {
            // DataSources are always shared across users
            // and we want JavaScript in the response to avoid an extra xmlToJs call
            operationId: "allOwnersXmlToJs"
        });

        // Save original DS Name to know if it is changed so uniqueness can be checked
        this.origDSName = dataSource.ID;
    }
},

canEditMockData : function (dataSource) {
    return (isc.isA.MockDataSource(dataSource) &&
            this.editMockData != false &&
            !dataSource.hasExplicitFields());
},

switchToEditFieldsAndDataSeparatelyMessage: "By editing fields and data separately " + 
    "additional behaviors can be added to your DataSource, such as validators.<P>" +
    "Once you save in this mode your DataSource will always be edited in this way.<P>" +
    "You can always re-create your DataSource from sample data. You may want to take " +
    "a copy of your current sample data before you begin editing.",

switchToEditFieldsAndDataSeparately : function () {
    var _this = this;
    isc.warn(this.switchToEditFieldsAndDataSeparatelyMessage, function (response) {
        if (response) _this._switchToEditFieldsAndDataSeparately();
    }, {
        buttons: [isc.Dialog.CANCEL, isc.Dialog.OK],
        autoFocusButton: 1
    });
},

_switchToEditFieldsAndDataSeparately : function () {
    this.editSampleData = true;

    // When editing sample data put main editor into a tab and add another tab for data
    this.mainTabSet = this.createAutoChild("mainTabSet");

    // Sample Data tab contents
    var label = this.createAutoChild("sampleDataLabel");
    this.dataGrid = this.createAutoChild("sampleDataGrid");

    var addNewButton = this.createAutoChild("sampleDataAddRecordButton");
    var discardDataButton = this.createAutoChild("sampleDataDiscardDataButton");
    var buttonLayout = this.createAutoChild("sampleDataButtonLayout", {
        members: [ addNewButton, discardDataButton ]
    });

    this.dataPane = this.createAutoChild("sampleDataPane", {
        members: [ label, this.dataGrid, buttonLayout ] });

    // Create tabs
    this.mainTabSet.addTab({
        name: "fields",
        title: "DataSource Fields",
        pane: this.mainStack
    });
    this.mainTabSet.addTab({
        name: "sampleData",
        title: "Sample Data",
        pane: this.dataPane
    });

    this.addMember(this.mainTabSet, 0);

    // Update mainStack to show DS and field editors
    this.mainStack.showSection(1);
    this.mainStack.showSection(2);
    this.mainStack.showSection(3);
    this.mainStack.hideSection(4);
    this.mockEditor.hide();
    this._editingMockData = false;

    // DataSource instance has derived fields from the mockData. Pull those fields.
    var dataSource = this._editingDataSource,
        fieldNames = dataSource.getFieldNames(),
        fields = []
    ;
    for (var i = 0; i < fieldNames.length; i++) {
        var field = dataSource.getField(fieldNames[i]);
        field = fields[i] = isc.clone(field);
        // Validators that are present must be automatically generated ones and they
        // should not be exposed in the editor. In fact they will cause issues if the
        // field type is changed because they remain.
        delete field.validators;
        // If the field title is auto-derived, drop it so it will continue to 
        // be auto-derived if the name changes.
        if (field._titleAutoDerived) {
            delete field.title;
            delete field._titleAutoDerived;
        }
    }

    // MockDataSource automatically adds a primaryKey of internalId. Re-process the
    // data to detect a primaryKey field within the data fields. If found, remove the
    // internalId field. Otherwise internalId stays.
    var mockData = this._getMockDataRecords(dataSource.mockData, dataSource.mockDataFormat);
    if (mockData) {
        var guesser = isc.SchemaGuesser.create({ detectPrimaryKey: true });
        guesser.dataSourceName = dataSource.ID;
        guesser.detectPrimaryKey = true;

        var guessedFields = guesser.extractFieldsFrom(mockData) || [],
            primaryKeyField = guessedFields.find("primaryKey", true)
        ;
        if (primaryKeyField) {
            var targetField = fields.find("name", primaryKeyField.name);
            if (targetField) {
                // Remove current primary key field if it's not part of the guessed fields.
                // That means it was added automatically.
                var currentPrimaryKeyField = fields.find("primaryKey", true);
                if (!guessedFields.find("name", currentPrimaryKeyField.name)) {
                    fields.remove(currentPrimaryKeyField);
                }

                var hasPK = fields.getProperty("primaryKey").or();
                if (!hasPK) {
                    targetField.primaryKey = true;
                }
            }
        }
    }

    // Update DS defaults to shift MDS from mockData to fields and cacheData
    var defaults = this.mainEditor.getValues();
    defaults.fields = isc.clone(fields);
    defaults.cacheData = dataSource.cacheData;
    delete defaults.mockData;
    delete defaults.mockDataFormat;

    // Start editing again with updated defaults
    this._startEditing(defaults);

    // Bind the sample data editor
    this.originalSampleData = dataSource.cacheData;
    this._rebindSampleDataGrid(fields, dataSource.cacheData);

    // Don't need the button change editor anymore
    this.editWithFieldsButton.hide();
},

_getMockDataRecords : function (mockData, mockDataFormat) {
    if (mockData && isc.isA.String(mockData) && mockDataFormat != "mock") {
        // mockData provided as XML, CSV or JSON text. Convert data to
        // Array of Record.
        var parser = isc.FileParser.create({ hasHeaderLine: true });
        if (mockDataFormat == "xml") {
            // Process XML data into JSON.
            var xmlData = isc.xml.parseXML(mockData);
            if (!xmlData) {
                this.logWarn("XML data in mockData could not be parsed");
                return;
            }
            var elements = isc.xml.selectNodes(xmlData, "/"),
                jsElements = isc.xml.toJS(elements)
            ;
            if (jsElements.length == 1) {
                var encoder = isc.JSONEncoder.create({ dateFormat: "dateConstructor", prettyPrint: false });
                var json = encoder.encode(jsElements[0]);

                // XML data is now pre-processed into JSON
                mockData = parser.parseJsonData(json, " loading pre-processed XML data for MockDataSource " + this.ID); 
            }
        } else if (mockDataFormat == "csv") {
            mockData = parser.parseCsvData(mockData); 
        } else if (mockDataFormat == "json") {
            mockData = parser.parseJsonData(mockData, " loading data for MockDataSource " + this.ID); 
        } else {
            this.logWarn("Invalid mockDataFormat '" + mockDataFormat + "'");
            return;
        }
        return mockData;
    }
},

// override point to provide a unique datasource-id
getUniqueDataSourceID : function (callback) {
    callback("newDataSource");
},

_loadSchemaReply : function (data) {
    var defaults = isc.DataSourceEditor.extractDSDefaultsFromJS(data, this.dsDataSource);

    this._startEditing(defaults);
},
_startEditing : function (defaults) {
    if (this.mainEditor) this.mainEditor.setValues(defaults);
    else this.mainEditorValues = defaults;

    var fields = defaults.fields;
    if (!isc.isAn.Array(fields)) fields = isc.getValues(defaults.fields);

    if (this.fieldEditor) {
        if (this.autoAddPK && !this.hasPrimaryKeyField(fields)) {
            this.createUniqueIdField(fields);
        }
        // We now have data to populate the fields; reset the empty message
        this.fieldEditor.grid.setEmptyMessage("No fields to show.");
        if (this.canEditChildSchema) {
            this.setupIDs(fields, 1, null);

            var tree = isc.Tree.create({
                modelType: "parent",
                childrenProperty: "fields",
                titleProperty: "name",
                idField: "id",
	            nameProperty: "id",
                root: { id: 0, name: "root"},
                data: fields
            });
            tree.openAll();
            this.fieldEditor.setData(tree);
        } else {
            this.fieldEditor.setData(fields);
        }
        if (this.canSelectPrimaryKey) {
            this.fieldEditor.grid.showField("primaryKey");
        } else {
            this.fieldEditor.grid.hideField("primaryKey");
            this.fieldEditor.grid.getField("primaryKey").canHide = false;
        }
        this.fieldEditor.targetDataSource = defaults;
        this.fieldEditor.formLayout.hide();
        this.fieldEditor.gridLayout.show();
        this.fieldEditor.updateIncludeFieldButtonState();
    }
    if (this.opBindingsEditor) {
        if (defaults) {
            var bindings = defaults.operationBindings;
            if (bindings && bindings.length > 0) {
                // Extract code bindings and create data to edit
                var values = {};
                var opTypes = ["fetch","add","update","remove"];
                for (var i = 0; i < bindings.length; i++) {
                    var binding = bindings[i];
                    if (binding.operationType && opTypes.contains(binding.operationType) &&
                        !binding.operationId)
                    {
                        var roles = binding.requiresRole;
                        if (binding.requires == "false") {
                            roles = "false";
                        }
                        values[binding.operationType + "RequiresRole"] = roles;
                    }
                }
                this.opBindingsEditor.setValues(values);
            }
        }
    }
    if (this.mockEditor) {
        this.mockEditor.setValue("ID", defaults.ID);
        if (defaults.mockData) {
            var mockData = defaults.mockData;
            if (!defaults.mockDataFormat || defaults.mockDataFormat == "mock") {
                mockData = mockData.replace(/\\/g, "\\").replace(/^\[(.*)\]$/m, "{$1}");
            }
            this.mockEditor.setValue("edit", mockData);
        }
    }

    // Save initial DS configuration as represented in the editors. It can then be compared
    // later to determine if any changes have been made that need to be saved. See hasChanges()
    this.origDSDefaults = this.getDatasourceDefaults();
    // If the DS has sample data the origDSDefaults will not have corresponding cacheData yet.
    // We cannot just use the defaults.cacheData because it won't have been converted to the
    // same data types used by the sample editor. Additionally, we cannot wait until after the
    // _rebindSampleDataGrid() call because that triggers the grid update on another thread.
    // Rather, set a flag to have the rebinding update the origDSDefaults.cacheData upon
    // completion.
    if (defaults.cacheData) {
        this._updateOrigDSDefaultsCacheData = true;
    }

    // DS Relations cannot be set too early so trigger it now that the field editor
    // is initialized
    if (this.knownDataSources) {
        this.setKnownDataSources(this.knownDataSources);
        this.fieldEditor.updateIncludeFieldButtonState();
    }
    this.updateTitleField();
},

setupIDs : function (fields, nextId, parentId) {
    var index=nextId,
        item,
        subItem
    ;

    if (!index) index = 1;
    for (var i = 0; i < fields.length; i++) {
        var item = fields.get(i);
        item.parentId = parentId;
        item.id = index++;
        if (item.fields) {
            if (!isc.isAn.Array(item.fields)) item.fields = isc.getValues(item.fields);
            index = this.setupIDs(item.fields, index, item.id);
        }
    }
    return index;
},

getFields : function () {
    var fields;
    if (this.canEditChildSchema) {
        var tree = this.fieldEditor.grid.data;
        fields = tree.getCleanNodeData(tree.getRoot(), true).fields;
        fields = this.getExtraCleanNodeData(fields);
    } else { 
        fields = this.fieldEditor.getData();
    }
    // Remove any records that are pending a removal from the returned list
    var recordsToRemove = fields.findAll("_removing", true);
    if (recordsToRemove) fields.removeList(recordsToRemove);

    // Empty fields can be populated in the record causing the generated field in the DS
    // to have values like title="" which suppresses desired auto-title generation.
    if (fields != null) {
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            for (var key in field) {
                if (field[key] == null || field[key] === "") delete field[key];
            }
        }
    }
    return fields;
},

// return the field type from the record taking into account a possible includeFrom value
getFieldType : function (record) {
    var type = record.type;
    if (record.includeFrom) {
        var split = record.includeFrom.split(".");
        if (split && split.length >= 2) {
            var dsName = split[split.length-2],
                dsField = split[split.length-1],
                ds = isc.DS.get(dsName)
            ;
            if (ds) {
                var field = ds.getField(dsField);
                if (field) {
                    type = field.type;
                }
            }
        }
    }
    return isc.SimpleType.getBaseType(type);
},

// Apply operation binding changes to ds defaults
applyOpBindings : function (dsData) {
    var editorData = this.opBindingsEditor.getValues();

    var bindings = {};
    ["fetch","add","update","remove"].map(function (operationType) {
        var requiresRole = editorData[operationType + "RequiresRole"],
            binding = null
        ;
        // Process special values
        if (requiresRole == "false") {
            binding = { requires: "false" };
        } else if (requiresRole && requiresRole != "_any_") {
            // Convert array of selections to a comma-separated string
            if (isc.isAn.Array(requiresRole)) {
                requiresRole = requiresRole.join(",");
            }
            binding = { requiresRole: requiresRole };
        }
        if (binding) bindings[operationType] = binding;
    });

    if (!dsData.operationBindings) dsData.operationBindings = [];

    var oldBindings = dsData.operationBindings;
    ["fetch","add","update","remove"].map(function (operationType) {
        var oldBinding = oldBindings.find("operationType", operationType),
            newBinding = bindings[operationType]
        ;
        if (!oldBinding && !newBinding) return;

        if (oldBinding && !newBinding) {
            if (oldBinding.requires) delete oldBinding.requires;
            if (oldBinding.requiresRole) delete oldBinding.requiresRole;
            // If only the "operationType" property remains, drop the binding completely
            if (isc.getKeys(oldBinding).length == 1) dsData.operationBindings.remove(oldBinding);
        } else if (!oldBinding && newBinding) {
            newBinding.operationType = operationType;
            oldBindings.add(newBinding);
        } else {
            if (oldBinding.requires && !newBinding.requires) delete oldBinding.requires;
            else if (newBinding.requires) oldBinding.requires = newBinding.requires;
            if (oldBinding.requiresRole && !newBinding.requiresRole) delete oldBinding.requiresRole;
            else if (newBinding.requiresRole) oldBinding.requiresRole = newBinding.requiresRole;
            // If only the "operationType" property remains, drop the binding completely
            if (isc.getKeys(oldBinding).length == 1) dsData.operationBindings.remove(oldBinding);
        }
    });

    // Make sure that when there are no operation binding, nothing is serialized
    if (dsData.operationBindings.length == 0) delete dsData.operationBindings;
},

getDataSourceID : function () {
    var ID = (this.mainEditor ? this.mainEditor.getValue("ID") : null);
    if (this.dsClass == "MockDataSource" && this._editingMockData) {
        ID = this.mockEditor.getValue("ID");
    }
    return ID;
},

getDatasourceData : function () {
    // NOTE: dsClass is set when we begin editing
    var dsClass = this.dsClass || "DataSource",
        dsData = isc.addProperties({}, 
            this.mainEditor ? this.mainEditor.getValues() : this.mainEditorValues
        )
    ;

    dsData.fields = this.getFields();

    this.applyOpBindings(dsData);

    // When editing sample data pull current values and use as cacheData
    if (this.editSampleData) {
        var sampleData = this.getSampleData();
        dsData.cacheData = sampleData;
    } else if (dsClass == "MockDataSource" && this._editingMockData) {
        var ID = this.mockEditor.getValue("ID"),
            mockData = this.mockEditor.getValue("edit") || "",
            mockDataType = dsData.mockDataType || "grid",
            mockDataFormat = dsData.mockDataFormat || "mock"
        ;
        dsData.ID = ID;
        dsData.mockData = (mockDataFormat != "mock" || mockDataType == "tree" ? mockData.trim() : 
            mockData.trim().replace(/\\/g, "\\").replace("{", "[").replace("}", "]"));
        dsData.fromServer = true;
        // These properties are derived from the mockData on initialization
        delete dsData.cacheData;
        delete dsData.fields;
    }

    return dsData;
},

hasPrimaryKeyField : function (fields) {
    if (!fields) fields = this.getFields();

    // Determine if there is a defined field marked as PK or
    // DataSource inherits a PK field.
    var hasPK = fields.getProperty("primaryKey").or();
    if (!hasPK) {
        // This DataSource might inherit its primaryKey field...
        if (isc.isA.DataSource(this._editingDataSource)) {
            var allFields = this._editingDataSource.getFields();
            for (var key in allFields) {
                var fld = allFields[key];
                // Catch the case that the user has overridden its inherited PK
                // field and removed the primaryKey designation
                if (fld.primaryKey && !fields.find("name",key)) {
                    hasPK = true;
                    break;
                }
            }
        }
    }
    return hasPK;
},

getDatasourceDefaults : function () {
    var dsData = this.getDatasourceData();
    var fieldEditor = this.fieldEditor;
 
    // When field editor is visible (i.e. not a basic MockDataSource)
    // validate that there is a PK or add one
    if (fieldEditor.isVisible()) {
        // Determine if there is a defined field marked as PK or
        // DataSource inherits a PK field.
        var hasPK = this.hasPrimaryKeyField(dsData.fields);
        if (!hasPK && this.autoAddPK) {
            this.createUniqueIdField(dsData.fields);
        }
    }

    // Possibly hacky fix for a problem saving these values when they are null ...
    ["recordXPath", "dataURL", "dbName", "schema", "tableName", "quoteTableName",
        "beanClassName", "dropExtraFields", "autoDeriveSchema"].map(function (removeNull)
    {
        if (dsData[removeNull] == null) delete dsData[removeNull];
    });
        
    // And remove _constructor: DatabaseBrowser if present ... not sure where that comes from
    if (dsData._constructor == "DatabaseBrowser") delete dsData._constructor;

    return dsData;
},

updateTitleField : function (fromName, toName) {
    var titleField = this.mainEditor.getField("titleField");
    if (!titleField) return;

    var fieldsDS = this.getFieldsDS(this.getFields()),
        dsId = this.mainEditor.getValue("ID"),
        fieldsDSId = fieldsDS.ID
    ;
    // The fieldsDS is a temporary DS generated from the current edit fields so the ID
    // is not the same as the user-specified ID. Since determining the titleField will check
    // for fields prefixed with the ID we temporarily set the DS ID to the desired ID
    // while pulling the titleField value.
    fieldsDS.ID = dsId;

    var defaultTitleField = fieldsDS.getTitleField(),
        emptyDisplayValue = (defaultTitleField ? "default: <i>" + defaultTitleField + "</i>" : "[None]"),
        fieldNames = fieldsDS.getFieldNames(),
        valueMap = []
    ;
    fieldsDS.ID = fieldsDSId;

    for (var i = 0; i < fieldNames.length; i++) {
        var field = fieldsDS.getField(fieldNames[i]);
        if (!field.type || field.type == "text" || field.type == "enum") {
            valueMap.add(field.name);
        }
    }
    valueMap.sort();

    var value = titleField.getValue();
    if (value && !valueMap.contains(value)) {
        if (value == fromName) {
            // Selected titleField value points to renamed field. Update it.
            titleField.setValue(toName);
        } else {
            // Target field no longer exists. Remove reference.
            titleField.clearValue();
        }
    }
    titleField.emptyDisplayValue = emptyDisplayValue;
    titleField.setValueMap(valueMap);
},

getFieldsDS : function (fields) {
    // If showing sample data the testDS is assumed to already be up-to-date
    if (this.testDS) return this.testDS;

    // Create temporary "fieldsDS" for use by updateTitleField to get default titleField
    if (this._fieldsDS) this._fieldsDS.destroy();

    var dsProperties = isc.addProperties({}, this.dsProperties, {
        clientOnly: true
    });
    if (fields) {
        // Need a PK so editing can match up records without logging tons of warnings
        if (!fields.find("primaryKey", true)) {
            fields.addAt({ name: "internalId", type: "sequence", primaryKey: true, hidden: true }, 0);
        }
        dsProperties.fields = fields;
    }

    this._fieldsDS = isc.DataSource.create(dsProperties);

    return this._fieldsDS;
},

// Sample data editor support

getSampleData : function () {
    var rowCount = this.dataGrid.getTotalRows();
    if (rowCount == 0) return null;

    var grid = this.dataGrid,
        data = []
    ;
    for (var i = 0, row = 0; i < rowCount; i++) {
        var record = grid.getEditValues(i);
        if (!grid.recordMarkedAsRemoved(i)) {
            // Only save records that have some field values other than the PK
            if (!isc.isAn.emptyObject(record)) {
                if (!grid._pkFieldName || isc.getKeys(record).length > 1) {
                    data[row++] = record;
                }
            }
        } else {
            record._operation = 'remove';
            data[row++] = record;
        }
    }
    return data;
},

renameSampleDataField : function (fromName, toName) {
    var data = this.getSampleData();

    // Rename field in records
    if (data) {
        data.forEach(function (record) {
            if (record[fromName] != null) {
                record[toName] = record[fromName];
                delete record[fromName];
            }
        });
    }

    return data;
},

revertDataChanges : function () {
    this._setDataGridData(this.originalSampleData);
},

// Rebind Sample Data using existing fields and data
rebindSampleData : function () {
    if (this.editSampleData) {
        var fields = this.getFields(),
            data = this.getSampleData()
        ;
        // Re-create testDS with updated fields/data
        this._rebindSampleDataGrid(fields, data);
    }
},

_rebindSampleDataGrid : function (fields, records, initialData) {
    if (this.isDrawn() && this.isVisible()) {
        // A ${loadingImage} isn't helpful because the UI is frozen during the process
        isc.showPrompt((initialData ? "Loading" : "Updating") + " sample data...");
    }
    this.delayCall("__rebindSampleDataGrid", arguments);
},

__rebindSampleDataGrid : function (fields, records) {
    // Re-create testDS with updated fields/data
    if (this.testDS) this.testDS.destroy();

    var _this = this;
    var dsProperties = isc.addProperties({}, this.dsProperties, {
        clientOnly: true,
        // For FK fields that reference the same DS (tree) the DS doesn't actually have
        // data to filter for display in the picklist because the grid has all records in
        // edit mode. On fetch response, populate the data with the sample data in the
        // grid edit records.
        transformResponse : function (dsResponse, dsRequest, data) {
            if (dsResponse.operationType == "fetch") {
                var gridData = _this.getSampleData();
                dsResponse.startRow = dsRequest.startRow || 0;
                dsResponse.endRow = Math.min(gridData.length, dsRequest.endRow || 0);
                dsResponse.totalRows = dsResponse.endRow - dsResponse.startRow;
                dsResponse.data = gridData.slice(dsRequest.startRow, dsResponse.endRow);
            }
            return dsResponse;
        }
    });
    if (fields) {
        // Need a PK so editing can match up records without logging tons of warnings
        if (!fields.find("primaryKey", true)) {
            fields.addAt({ name: "internalId", type: "sequence", primaryKey: true, hidden: true }, 0);
        }
        dsProperties.fields = isc.clone(fields);
    }

    this.testDS = isc.DataSource.create(dsProperties);

    // Rebind grid
    this.dataGrid.setDataSource(this.testDS);

    // Apply current data
    this._setDataGridData(records);

    // On initial edit, update the origDSDefaults cacheData with the sample data
    if (this._updateOrigDSDefaultsCacheData) {
        delete this._updateOrigDSDefaultsCacheData;
        this.origDSDefaults.cacheData = this.getSampleData();
    }

    isc.clearPrompt();
},

_setDataGridData : function (records) {

    var grid = this.dataGrid;

    // if we can't resolve includeFrom field values during a fetch, we'll do it manually
    // using the provided records.  We'll pass the name of the original datasource ID
    // when we do so, in case its needed 
    if (records != null) {
        grid.dataSource.resolveClientOnlyIncludeFrom(records, this.originalSampleDataOrigin);
    }

    // If the DS has a PK - it does because an internal one is added if the user has not
    // defined an explicit one - and it is a sequence initialize state fields on the grid
    // so new sequence values can be assigned as needed. This would normally be handled
    // by the DS but since records are never saved to the DS that process does not occur.
    var pkField = grid.getDataSource().getPrimaryKeyField();
    if (pkField && pkField.type == "sequence") {
        grid._pkFieldName = pkField.name;
        grid._pkNextValue = 0;
    } else {
        delete grid._pkFieldName;
        delete grid._pkNextValue;
    }

    grid.discardAllEdits();
    if (records && records.length > 0) {
        // Determine the highest sequence PK value in the current data so new records can
        // be assigned values above that.
        var pkFieldName = grid._pkFieldName,
            pkFieldMaxValue = -1
        ;
        if (pkFieldName) {
            for (var i = 0; i < records.length; i++) {
                var record = records[i],
                    pkValue = record[pkFieldName]
                ;
                if (pkValue != null) {
                    
                    if (!isc.isA.String(pkValue) && pkValue > pkFieldMaxValue) {
                        pkFieldMaxValue = pkValue;
                    }
                }
            }
            grid._pkNextValue = pkFieldMaxValue+1;
        }
        // Place records into the grid as edit values so validation errors show
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            // Assign sequence PK value if missing
            if (pkFieldName && record[pkFieldName] == null) {
                record[pkFieldName] = grid._pkNextValue++;
            }
            grid.startEditingNew(record, true);
        }
        // Add one more record leaving the real records pending
        grid.startEditing(0);
    } else {
        grid.startEditingNew();
    }
},

legalValuesWindowDefaults: {
    _constructor: isc.Window,
    autoCenter: true,

    height: 250,
    width: 500,

    isModal: true,
    showModalMask: true,
    showHeaderIcon: false,
    showMinimizeButton: false,
    keepInParentRect: true,
    close : function () {
        this.Super("close", arguments);
        this.markForDestroy();
    }
},

legalValuesFormDefaults: {
    _constructor: isc.DynamicForm,
    addAsChild: true,
    width: "100%",
    height: "100%",
    numCols: 1,
    fields: [
        { name: "values", editorType: "ValueMapItem",
            showTitle: false, showMapTypeButton: false, showHeader: false,
            newOptionRowMessage: "Click to add allowed values to the list" }
    ],
    // Override to force validation on ValueMapItem so it can push pending changes to form values
    validate : function () {
        this.getItem("values").validate();
        return this.Super("validate", arguments);
    }
},

legalValuesToolbarDefaults: {
    _constructor: isc.HLayout,
    width: "100%",
    height: 30,
    padding: 10,
    align: "right",
    membersMargin: 4,
    members: [
        { _constructor: isc.Button,
            title: "Cancel",
            width: 75,
            click: function () {
                this.topElement.destroy();
            }
        },
        { _constructor: isc.Button,
            title: "Save",
            width: 75,
            click: function () {
                this.parentElement.saveLegalValues();
            }
        }
    ]
},

editFieldLegalValues : function (field) {

    var legalValuesWindowProperties = {
        title: "Define the allowed values for " + field.name
    }
    var window = this.createAutoChild("legalValuesWindow", legalValuesWindowProperties);

    var legalValuesFormProperties = {
        values: { values: field.valueMap }
    };
    this.legalValuesForm = this.createAutoChild("legalValuesForm", legalValuesFormProperties);

    var legalValuesToolbarProperties = {
        window : window,
        editor : this.legalValuesForm,
        saveLegalValues : function () {
            if (this.editor.validate()) {
                var valueMap = this.editor.getValue("values");
                field.valueMap = valueMap;
                this.window.markForDestroy();

                this.editor.creator.rebindSampleData();
            }
        }
    };
    this.legalValuesToolbar = this.createAutoChild("legalValuesToolbar", legalValuesToolbarProperties);

    window.addItem(this.legalValuesForm);
    window.addItem(this.legalValuesToolbar);
    window.show();
},

validatorsWindowDefaults: {
    _constructor: isc.Window,
    autoCenter: true,

    height: 550,
    width: 800,

    isModal: true,
    showModalMask: true,
    showHeaderIcon: false,
    showMinimizeButton: false,
    keepInParentRect: true,
    close : function () {
        this.Super("close", arguments);
        this.markForDestroy();
    },
    destroy : function () {
        if (this.dataSource) this.dataSource.destroy();
        this.Super("destroy", arguments);
    }
},

validatorsLayoutDefaults: {
    _constructor: isc.ValidatorsEditor,
    addAsChild: true,
    width: "100%",
    height: "100%"
},

validatorsToolbarDefaults: {
    _constructor: isc.HLayout,
    width: "100%",
    height: 30,
    padding: 10,
    align: "right",
    membersMargin: 10,
    members: [
        { _constructor: isc.IButton,
            title: "Cancel",
            width: 75,
            click: function () {
                this.topElement.destroy();
            }
        },
        { _constructor: isc.IButton,
            title: "Save",
            width: 75,
            click: function () {
                this.parentElement.saveValidators();
            }
        }
    ]
},

editFieldValidators : function (field) {
    // Create a temporary DataSource for use by validatorsEditor.
    // fields array is updated by the DS creation so deep clone
    // it to avoid affecting the edits.
    var dsData = this.getDatasourceData();
    delete dsData.ID;
    dsData.fields = isc.clone(dsData.fields);
    var ds = this.createLiveDSInstance(dsData);

    var validatorsWindowProperties = {
        title: "Validators for " + field.name,
        // Window is responsible for destroying temp DS when closed
        dataSource: ds
    }
    var window = this.createAutoChild("validatorsWindow", validatorsWindowProperties);

    var validatorsLayoutProperties = {
        fieldName: field.name,
        dataSource: ds,
        validators: field.validators
    };
    this.validatorsLayout = this.createAutoChild("validatorsLayout", validatorsLayoutProperties);

    var validatorsToolbarProperties = {
        window : window,
        editor : this.validatorsLayout,
        saveValidators : function () {
            if (this.editor.validate()) {
                // Get all non-typecast validators
                var validators = this.editor.getValidators(true);
                field.validators = validators;
                this.window.markForDestroy();

                this.editor.creator.rebindSampleData();
            }
        }
    };
    this.validatorsToolbar = this.createAutoChild("validatorsToolbar", validatorsToolbarProperties);

    window.addItem(this.validatorsLayout);
    window.addItem(this.validatorsToolbar);
    window.show();
},

securityWindowDefaults: {
    _constructor: isc.Window,

    isModal: true, showModalMask: true,
    showHeaderIcon: false,
    showMinimizeButton: false,
    keepInParentRect: true,
    autoCenter:true,
    autoSize:true,
    canDragResize:true
},

securityEditorDefaults: {
    _constructor: "VLayout",
    autoDraw: false,
    width: 400,
    membersMargin: 10,

    formDefaults: {
        _constructor: "DynamicForm",
        autoDraw: false,
        padding: 10,
        wrapItemTitles: false
    },

    buttonLayoutDefaults: {
        _constructor: "HLayout",
        autoDraw: false,
        width: "100%",
        height:42,
        layoutMargin:10,
        membersMargin:10,
        align: "right"
    },

    cancelButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        title: "Cancel",
        width: 75,
        autoParent: "buttonLayout",
        click: function() {
            this.creator.cancelClick();
        }
    },

    saveButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        title: "Save",
        width: 75,
        autoParent: "buttonLayout",
        click: function() {
            this.creator.saveClick();
        }
    },

    initWidget : function () {
        this.Super('initWidget', arguments);

        var fields = [
            { type: "blurb", defaultValue: "Configure the roles required to view or modify this field" },
            { type: "RowSpacer" },
            this.createRolesField("viewRequiresRole", "Roles required to <i>view</i> this field"),
            this.createRolesField("editRequiresRole", "Roles required to <i>edit</i> this field")
        ];

        this.addAutoChild("form", { fields: fields });
        this.addAutoChild("buttonLayout");
        this.buttonLayout.addMember(this.createAutoChild("cancelButton"));
        this.buttonLayout.addMember(this.createAutoChild("saveButton"));
    },

    specialFieldValues: ["_any_","*super*","false"],

    createRolesField : function (fieldName, title) {
        var availableRoles = isc.Auth.getAvailableRoles();
        var valueMap = {
            "_any_": "Any user - no roles required"
        };
        if (availableRoles) {
            availableRoles.sort();
            for (var i = 0; i < availableRoles.length; i++) {
                var role = availableRoles[i];
                valueMap[role] = role;
            }
        }
        valueMap["*super*"] = "SuperUser only";
        valueMap["false"] = "None - no user may access";

        var specialFieldValues = this.specialFieldValues;
        var field = {
            name: fieldName,
            type: "select",
            title: title,
            multiple: true,
            multipleAppearance: "picklist",
            valueMap: valueMap,
            pickListProperties: {
                selectionChanged : function (record, state) {
                    if (state) {
                        var value = record[fieldName];
                        if (specialFieldValues.contains(value)) {
                            // Selecting a special value, clear all other selections, if any
                            var records = this.getSelection();
                            for (var i = 0; i < records.length; i++) {
                                var record = records[i];
                                if (record[fieldName] != value) {
                                    this.deselectRecord(record);
                                }
                            }
                        } else {
                            // Selecting a role, clear any special value selections, if any
                            var records = this.getSelection();
                            for (var i = 0; i < records.length; i++) {
                                var record = records[i];
                                if (specialFieldValues.contains(record[fieldName])) {
                                    this.deselectRecord(record);
                                }
                            }
                        }
                    }
                }
            }
        }
        return field;
    },

    edit : function (field, callback) {
        if (!this.isDrawn()) {
            this.delayCall("edit", arguments);
            return;
        }

        // to be called when editing completes
        this.saveCallback = callback;

        // Convert comma-separated list of roles to a string array for editing
        if (field.viewRequiresRole) {
            field.viewRequiresRole = field.viewRequiresRole.split(",");
        }
        if (field.editRequiresRole) {
            field.editRequiresRole = field.editRequiresRole.split(",");
        }

        // Pull special, no user may access, value from alternate field.
        if (field.viewRequires == "false") {
            field.viewRequiresRole = "false";
            delete field.viewRequires;
        }
        if (field.editRequires == "false") {
            field.editRequiresRole = "false";
            delete field.editRequires;
        }

        // Show default case as if it was selected
        if (field.viewRequiresRole == null) field.viewRequiresRole = "_any_";
        if (field.editRequiresRole == null) field.editRequiresRole = "_any_";

        this.form.editRecord(field);
    },

    cancelClick : function () {
        // This editor is typically embedded in a Window that has a body layout.
        // Find the Window object, if any, and close it.
        var parents = this.getParentElements();
        if (parents && parents.length > 0) {
            var window = parents[parents.length-1];
            if (isc.isA.Window(window)) window.closeClick();
        }
    },

    saveClick : function () {
        if (!this.form.validate()) return;

        var field = this.form.getValues();

        // Process special values
        if (field.viewRequiresRole == "_any_") {
            delete field.viewRequiresRole;
        } else if (field.viewRequiresRole == "false") {
            field.viewRequires = "false";
            delete field.viewRequiresRole;
        }
        if (field.editRequiresRole == "_any_") {
            delete field.editRequiresRole;
        } else if (field.editRequiresRole == "false") {
            field.editRequires = "false";
            delete field.editRequiresRole;
        }

        // Convert array of selections to a comma-separated string
        if (isc.isAn.Array(field.viewRequiresRole)) {
            field.viewRequiresRole = field.viewRequiresRole.join(",");
        }
        if (isc.isAn.Array(field.editRequiresRole)) {
            field.editRequiresRole = field.editRequiresRole.join(",");
        }

        this.fireCallback(this.saveCallback, "field", [field]);
        this.saveCallback = null;
    }
},

editFieldSecurity : function (field) {
    if (!this.securityEditor) {
        var securityWindowProperties = {
            title: "Edit security settings for field " + field.name
        };
        this.securityWindow = this.createAutoChild("securityWindow", securityWindowProperties);
        this.securityEditor = this.createAutoChild("securityEditor");
        this.securityWindow.addItem(this.securityEditor);
    }

    var self = this;
    this.securityEditor.edit(field, function (editedField) {
        self.securityWindow.hide();
        // Update field in list by applying only the possibly changed properties being careful
        // to remove the property when it no longer has a value
        var fieldCopy = isc.shallowClone(field);
        if (editedField.viewRequires) field.viewRequires = editedField.viewRequires;
        else if (field.viewRequires) delete field.viewRequires;
        if (editedField.viewRequiresRole) field.viewRequiresRole = editedField.viewRequiresRole;
        else if (field.viewRequiresRole) delete field.viewRequiresRole;

        if (editedField.editRequires) field.editRequires = editedField.editRequires;
        else if (field.editRequires) delete field.editRequires;
        if (editedField.editRequiresRole) field.editRequiresRole = editedField.editRequiresRole;
        else if (field.editRequiresRole) delete field.editRequiresRole;

        // If security really changed, update the sample data grid
        if (fieldCopy.viewRequires != field.viewRequires ||
            fieldCopy.viewRequiresRole != field.viewRequiresRole ||
            fieldCopy.editRequires != field.editRequires ||
            fieldCopy.editRequiresRole != field.editRequiresRole)
        {
            self.rebindSampleData();
        }
    });

    this.securityWindow.show();
},

relationEditorDefaults: {
    _constructor: "RelationEditor",
    autoDraw: false
},

relationEditorWindowDefaults: {
    _constructor: isc.Window,
    autoDraw: false,

    isModal: true, showModalMask: true,
    showHeaderIcon: false,
    showMinimizeButton: false,
    keepInParentRect: true,
    autoCenter:true,
    width: 875,
    height: 760,
    bodyProperties: {
        layoutLeftMargin: 5,
        layoutRightMargin: 5,
        layoutBottomMargin: 5
    },
    canDragResize:true
},


editRelations : function (selectForeignKey) {
    isc.ClassFactory._setVBLoadingDataSources(null);

    isc.showPrompt("Loading all project datasources... ${loadingImage}");

    var _this = this;
    this.loadAllDataSources(function () {
        isc.clearPrompt();
        _this._editRelations(selectForeignKey);
    });
},

loadAllDataSources : function (callback) {
    var projectDataSources = this.knownDataSources,
        loadThese = []
    ;
    for (var i = 0; i < projectDataSources.length; i++) {
        if (!isc.DS.get(projectDataSources[i].ID)) loadThese.add(projectDataSources[i].ID);
    }
    if (loadThese.length > 0) {
        isc.DS.load(loadThese, callback);
    } else {
        this.fireCallback(callback);
    }
},

_editRelations : function (selectForeignKey) {
    var dsData = this.getDatasourceDefaults();
    dsData._constructor = this.dsClass || dsData._constructor || "DataSource";

    if (!this.relationEditor) {
        // provide an up-to-date list of known datasources, for setting foreignKeys.
        var dsList = [];
        this.knownDataSources.map(function (node) {
            if (!node) return;
            // Exclude currently editing DS from known list because it may not be up-to-date
            if (node.ID != dsData.ID) {
                var ds = isc.DS.get(node.ID);
                dsList.add(ds);
            }
        });

        var relationEditorWindowProperties = {
            title: "Relations for DataSource '" + dsData.ID + "'"
        }
        this.relationEditorWindow = this.createAutoChild("relationEditorWindow", relationEditorWindowProperties);
        this.relationEditor = this.createAutoChild("relationEditor", {
            dsEditor: this,
            dsDataSource: this.dsDataSource,
            ownerId: this.ownerId
        });
        this.relationEditorWindow.addItem(this.relationEditor);

        this.relationEditor.setKnownDataSources(dsList);

        if (this.readOnly) this.relationEditor.readOnly = true;
    } else {
        this.relationEditorWindow.setTitle("Relations for DataSource '" + dsData.ID + "'");
    }

    var self = this;
    this.relationEditor.edit(dsData, function (defaults) {
        self.relationEditorWindow.hide();

        // If this DS has changed, update the fields list
        if (defaults) {
            var fields = dsData.fields,
                fieldNames = self.getFieldNames(fields),
                newFields = defaults.fields,
                newFieldNames = self.getFieldNames(newFields)
            ;

            // Add new fields and update existing ones
            for (var i = 0; i < newFields.length; i++) {
                var newField = newFields[i];
                if (fieldNames.contains(newField._renameFrom || newField.name)) {
                    // existing field
                    var newName = newField._renameFrom || newField.name,
                        field = self.findField(fields, newName);
                    if (field &&
                        (field.type != newField.type ||
                            field.foreignKey != newField.foreignKey ||
                            field.joinType != newField.joinType ||
                            field.title != newField.title ||
                            field.displayField != newField.displayField ||
                            field.includeFrom != newField.includeFrom))
                    {
                        var record = self.fieldEditor.getData().find("name", newName),
                            rowNum = self.fieldEditor.grid.getRecordIndex(record)
                        ;
                        record.foreignKey = newField.foreignKey;
                        record.joinType = newField.joinType;
                        if (record.type != newField.type) {
                            record.type = newField.type;
                            // Validators might be invalid for the new type. If the user
                            // could edit the type of the field a prompt would be issued
                            // to confirm changing and removing validators, however, since
                            // this rename comes from a relation change we want to force
                            // it to happen.
                            delete record.validators;
                            // Allowed values list is also invalid when the type changes
                            delete record.valueMap;
                            self.fieldEditor._fieldTypeChanged(record);
                        }
                        record.title = newField.title;
                        record.displayField = newField.displayField;
                        record.includeFrom = newField.includeFrom;
                        self.fieldEditor.grid.refreshRow(rowNum);
                    }
                    if (field.name != newField.name) {
                        // Field was renamed
                        var record = self.fieldEditor.getData().find("name", field.name),
                            rowNum = self.fieldEditor.grid.getRecordIndex(record)
                        ;

                        record.name = newField.name;
                        self.fieldEditor.grid.refreshRow(rowNum);

                        // Trigger fieldName change mechanism normally done from editing
                        // the field name directly. This is needed to adjust any sample data
                        self.fieldEditor._fieldNameChanged(field.name, newField.name);

                        // Replace original field name in the newFieldNames list so it will
                        // not be removed as extraneous
                        newFieldNames.remove(newField.name);
                        newFieldNames.add(field.name);
                    }
                } else {
                    // new field
                    self.fieldEditor.newRecord(newField);
                }
            }
            // Remove exta remaining fields - these must have been deleted relations
            fieldNames.removeList(newFieldNames);
            if (fieldNames && fieldNames.length > 0) {
                for (var i = 0; i < fieldNames.length; i++) {
                    var fieldName = fieldNames[i],
                        field = self.findField(fields, fieldName)
                    ;
                    if (field) {
                        var record = null;
                        if (field.name) record = self.fieldEditor.getData().find("name", field.name);
                        else record = self.fieldEditor.getData().find("includeFrom", field.includeFrom);
                        if (record) {
                            self.fieldEditor.getData().remove(record);
                            self.fieldEditor.markForRedraw();
                        }
                    }
                }
            }
        }

        // Update DataSources in DS Relations
        self.refreshDSRelations();
        
        // Update includeField button state with latest relations
        self.fieldEditor.updateIncludeFieldButtonState();

        // Show notifications for any new relations at lower-left section of fields list
        var fieldsList = self.fieldEditor.grid,
            x = fieldsList.body.getPageLeft(),
            y = fieldsList.body.getPageTop() + (fieldsList.body.getVisibleHeight()*.66)
        ;
        self.relationEditor.showNewRelationNotifications(x, y, function (dsId) {
            // User clicked to view DS details. Save current DS (and relations) then
            // display selected DS again. DS Editor caller is responsible for doing this
            // so changes from this save that affect caller can be processed first.
            self.nextDataSource = dsId;
            // If current DS cannot be saved, don't attempt to show next DS when a save
            // is finally successful - it will be out of context then.
            if (!self.save()) {
                self.nextDataSource = null;
            }
        }, true);
    }, selectForeignKey);

    this.relationEditorWindow.show();
},

// Some helper methods to handle fields where the field name may be from field.name or
// implied by an includeFrom value
getFieldNames : function (fields) {
    var _this = this;
    return fields.map(function (field) {
        return _this.getFieldName(field);
    });
},

getFieldName : function (field) {
    if (field.name) return field.name;
    var includeFrom = field.includeFrom,
        parts = includeFrom && includeFrom.split(".")
    ;
    return parts && parts[parts.length-1];
},

findField : function (fields, fieldName) {
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i],
            name = this.getFieldName(field)
        ;
        if (name == fieldName) {
            return field;
        }
    }
},

includeFieldEditorDefaults: {
    _constructor: "VLayout",
    autoDraw: false,
    width: 600,

    formDefaults: {
        _constructor: "DynamicForm",
        autoDraw: false,
        height: 150,
        wrapItemTitles: false,
        numCols: 4,
        colWidths: [ 125, 25, 50, "*" ],
        fields: [
            { name: "relatedDataSource", type: "text", editorType: "SelectItem", title: "Related DataSource",
                colSpan: 3, width: 300, sortField: 0, required: true
            },
            { name: "relatedField", type: "text", editorType: "SelectItem", title: "Field",
                colSpan: 3, width: 300, required: true,
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "or",
                    criteria: [
                        { fieldName: "relatedDataSource", operator: "isNull" }
                    ]
                }
            },
            { name: "enableNameAs", type: "boolean", align: "right", width: 125,
                showTitle: false, labelAsTitle: true, startRow: true
            },
            { name: "includeField", type: "text", title: "Name as",  colSpan: 2,
                hint: "in DataSource dsID",
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "or",
                    criteria: [
                        { fieldName: "relatedField", operator: "isNull" },
                        { fieldName: "enableNameAs", operator: "notEqual", value: true }
                    ]
                },
                validators : [
                    { 
                        type: "regexp",
                        expression: "^[a-zA-Z_][a-zA-Z0-9_]*$",
                        errorMessage: "Field name must be a valid JavaScript identifier"
                    }
                ]
            },
            { name: "includeSummaryFunction", type: "text", title: "Summary Function", 
                colSpan: 3, width: 400,
                valueField: "value", displayField: "title",
                allowEmptyValue: true,
                cachePickListResults: false,
                getClientPickListData : function () {
                    var relatedDSItem = this.form.getField("relatedDataSource"),
                        ds = isc.DS.get(relatedDSItem.getValue()),
                        item = this.form.getField("relatedField"),
                        relatedField = item.getValue(),
                        field = ds.getField(relatedField),
                        type = field.type || "text"
                    ;
                    if (type == "text") {
                        return [
                            { value: "concat", title: "combine: all values of related records, as comma-separated text" },
                            { value: "first", title: "first: first value in related records" },
                            { value: "max", title: "last: last value in related records" }
                        ]
                    } else if (type == "date" || type == "dateTime" || type == "time") {
                        
                        return [
                            { value: "max", title: "max: latest date in field values of related records" },
                            { value: "min", title: "min: earliest date in field values of related records" }
                        ]
                    } else {
                        return [
                            { value: "sum", title: "sum: total of field values in related records" },
                            { value: "count", title: "count: just the number of related records" },
                            { value: "avg", title: "average: average of field values in related records" },
                            { value: "max", title: "max: highest value in related records" },
                            { value: "min", title: "min: lowest value in related records" },
                            { value: "concat", title: "combine: all values of related records, as comma-separated text" }
                        ]
                    }
                },
                showIf : function (item, value, form, values) {
                    var relatedDSItem = form.getField("relatedDataSource"),
                        displayValue = relatedDSItem.getDisplayValue(relatedDSItem.getValue())
                    ;
                    return (displayValue && displayValue.contains("(1-to-many)"));
                },
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "and",
                    criteria: [
                        { fieldName: "relatedField", operator: "isNull" }
                    ]
                }
            }
        ],
        editNewRecord : function (record) {
            this.updateRelatedFieldChoices(record);
            this.updateNameAsValue(record);
            this.updateNameAsHint(record);
            this.Super("editNewRecord", arguments);
        },
        itemChanged : function (item, newValue) {
            var record = this.getValues();
            if ("relatedDataSource" == item.name) {
                this.updateRelatedFieldChoices(record, true);
                this.updateNameAsValue(record);
                this.updateNameAsHint(record);
                this.clearSummaryFunctionValue();
                this.markForRedraw();   // Re-evaluate includeSummaryFunction showIf()
            } else if ("relatedField" == item.name) {
                this.updateNameAsValue(record);
                this.clearSummaryFunctionValue();
            }
        },
        updateRelatedFieldChoices : function (record, dsChanged) {
            if (!record) return;
            var dsId = record.relatedDataSource;
            if (!dsId) return;
            var ds = isc.DS.get(dsId);
            if (ds) {
                var fieldNames = ds.getFieldNames();
                this.getField("relatedField").setValueMap(fieldNames);
            }
            this.clearValue("relatedField");
            this.clearValue("enableNameAs");
            this.clearValue("includeField");
            delete record.relatedField;
            delete record.includeField;
        },
        updateNameAsValue : function (record) {
            if (!record) return;
            var relatedDSId = record.relatedDataSource,
                set = false
            ;
            if (relatedDSId) {
                // No need for a default NameAs value unless the relatedField conflicts
                // with a local field.
                var dsId = this.creator.dsId,
                    ds = this.creator.dataSource,
                    // ds = isc.DS.get(dsId),
                    relatedFieldValue = record.relatedField
                ;
                if (!relatedFieldValue) return;

                var localField;
                if (ds.getField) {
                    localField = ds.getField(relatedFieldValue);
                } else {
                    var fields = ds.fields;
                    localField = fields.find("name", relatedFieldValue);
                    if (!localField) {
                        // An includeFrom field doesn't need an explicit name
                        for (var i = 0; i < fields.length; i++) {
                            var item = fields.get(i), 
                                itemName = item.name;
                            if (!itemName && item.includeFrom) {
                                itemName = item.includeFrom;
                                var dotIndex = itemName.lastIndexOf(".");
                                if (dotIndex >= 0) itemName = itemName.substring(dotIndex + 1);
                                if (itemName == relatedFieldValue) {
                                    localField = item;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (localField) {
                    // Existing field using the same name. Introduce an alias based on the
                    // target DS and field name
                    var includeField = relatedDSId +
                        relatedFieldValue.substring(0, 1).toUpperCase() +
                        relatedFieldValue.substring(1);
                    this.setValue("includeField", includeField);
                    this.setValue("enableNameAs", true);
                    set = true;
                }
            }
            if (!set) {
                this.clearValue("includeField");
                this.clearValue("enableNameAs");
            }
        },
        updateNameAsHint : function (record) {
            if (!record) return;
            var relatedDSId = record.relatedDataSource,
                hint
            ;
            if (relatedDSId) {
                hint = (relatedDSId ? "in <i>" + this.creator.dsId + "</i>" : null);
            }
            this.getField("includeField").setHint(hint);
        },
        clearSummaryFunctionValue : function () {
            this.clearValue("includeSummaryFunction");
        }
    },

    buttonLayoutDefaults: {
        _constructor: "HLayout",
        autoDraw: false,
        width: "100%",
        height:42,
        layoutMargin:10,
        membersMargin:10,
        align: "right"
    },

    cancelButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        title: "Cancel",
        width: 75,
        autoParent: "buttonLayout",
        click: function() {
            this.creator.cancelClick();
        }
    },

    saveButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        title: "Save",
        width: 75,
        autoParent: "buttonLayout",
        click: function() {
            this.creator.saveClick();
        }
    },

    initWidget : function () {
        this.Super('initWidget', arguments);

        this.addAutoChildren(["form","buttonLayout"]);
        this.buttonLayout.addMember(this.createAutoChild("cancelButton"));
        this.buttonLayout.addMember(this.createAutoChild("saveButton"));
    },

    edit : function (ds, relations, callback, selectDataSource) {
        if (!this.isDrawn()) {
            this.delayCall("edit", arguments);
            return;
        }
        var relationTypeMap = {
            "1-M": "1-to-many",
            "M-1": "many-to-1",
            "Self": "tree self-relation"
        };

        // provide an up-to-date valueMap of related datasources for selection
        var dsId = ds.ID,
            valueMap = {}
        ;
        relations.map(function (r) {
            valueMap[r.dsId] = r.dsId + " (" + relationTypeMap[r.type] + ")";
        });
        this.form.getField("relatedDataSource").setValueMap(valueMap);
        if (!selectDataSource) {
            var choices = isc.getKeys(valueMap);
            if (choices && choices.length == 1) selectDataSource = choices[0];
        } 

        // Hang on to the dsId and relations so type can be looked up upon selection
        this.dataSource = ds;
        this.dsId = dsId;
        this.relations = relations;

        // to be called when editing completes
        this.saveCallback = callback;

        this.form.editNewRecord({ relatedDataSource: selectDataSource });
    },

    cancelClick : function () {
        // This editor is typically embedded in a Window that has a body layout.
        // Find the Window object, if any, and close it.
        var parents = this.getParentElements();
        if (parents && parents.length > 0) {
            var window = parents[parents.length-1];
            if (isc.isA.Window(window)) window.closeClick();
        }
    },

    saveClick : function () {
        if (!this.form.validate()) return;

        var values = this.form.getValues();

        // There could be multiple relation paths to reach the target related data source.
        // Although there is likely not much difference between the paths an effort is made
        // to find the shortest path using a relationship tree.
        var source = this.dataSource;
        var target = values.relatedDataSource;
        var shortest = source.getDefaultPathToRelation(target, this.relations);
        var relationPath = shortest.path.replace('/', '.');
        // Using the calculated relationPath and field name, create a new DS field for the
        // includeFrom
        var field = {
            name: values.includeField || values.relatedField,
            includeFrom: relationPath + "." + values.relatedField
        };
        if (values.includeSummaryFunction) {
            field.includeSummaryFunction = values.includeSummaryFunction;
        }
        this.fireCallback(this.saveCallback, "field", [field]);
        this.saveCallback = null;
    }
},

includeFieldEditorWindowDefaults: {
    _constructor: isc.Window,
    autoDraw: false,
    title: "Add included field",

    isModal: true, showModalMask: true,
    showHeaderIcon: false,
    showMinimizeButton: false,
    keepInParentRect: true,
    autoCenter:true,
    autoSize:true,
    canDragResize:true,
    closeClick : function () {
        if (this.dropDS) {
            this.dropDS.destroy();
        }
        this.close();
    }
},


editIncludeField : function (selectDataSource) {
    isc.ClassFactory._setVBLoadingDataSources(null);

    isc.showPrompt("Loading all project datasources... ${loadingImage}");

    var _this = this;
    this.loadAllDataSources(function () {
        isc.clearPrompt();
        _this._editIncludeField(selectDataSource);
    });
},

_editIncludeField : function (selectDataSource) {
    if (!this.includeFieldEditor) {
        this.includeFieldEditorWindow = this.createAutoChild("includeFieldEditorWindow");
        this.includeFieldEditor = this.createAutoChild("includeFieldEditor", {
            dsDataSource: this.dsDataSource,
            ownerId: this.ownerId
        });
        this.includeFieldEditorWindow.addItem(this.includeFieldEditor);
    }

    var dsId = this.mainEditor.getValue("ID"),
        relations = this.dsRelations.getAllRelationsForDataSource(dsId),
        relationTypeMap = isc.DSRelations.relationTypeDescriptionMap
    ;

    // provide an up-to-date valueMap of related datasources for selection
    var valueMap = {};
    relations.map(function (r) {
        valueMap[dsId] = r.dsId + " (" + relationTypeMap[r.type] + ")";
    });

    var ds = this.relationEditor && this.relationEditor.getPendingChange(dsId);
    if (ds) {
        // The <ds> from the relationEditor is just the defaults to create a new DataSource.
        // We need to create an instance so that calls can be made against it normally.
        // Create a temporary name which is unlikely to conflict with a real DS and
        // create an instance. Tag the includeFieldEditorWindow with the DS instance
        // as <dropDS> so on cancel or save it can be destroyed.
        var tempDSId = isc._underscore + ds.ID + isc._underscore;
        ds = this.createLiveDSInstance(isc.addProperties({}, ds, { ID: tempDSId }));
        this.includeFieldEditorWindow.dropDS = ds;
    } else {
        ds = isc.DS.get(dsId);
        delete this.includeFieldEditorWindow.dropDS;
    }

    var self = this;
    this.includeFieldEditor.edit(ds, relations, function (field) {
        self.includeFieldEditorWindow.hide();
        // Add new field to list
        self.fieldEditor.newRecord(field);

        if (self.includeFieldEditorWindow.dropDS) {
            self.includeFieldEditorWindow.dropDS.destroy();
        }
    }, selectDataSource);

    this.includeFieldEditorWindow.show();
},

formatEditorDefaults: {
    _constructor: "NumberFormatEditor",  // May change at invocation time
    autoDraw: false
},

formatWindowDefaults: {
    _constructor: isc.Window,
    autoDraw: false,

    isModal: true, showModalMask: true,
    showHeaderIcon: false,
    showMinimizeButton: false,
    keepInParentRect: true,
    autoCenter:true,
    autoSize:true,
    canDragResize:true
},

editFormatting : function (field) {
    var type = this.getFieldType(field),
        actualDataType = field.type == "datetime" ? field.type : type,
        isDate = type == "date" || type == "time",
        create;
    if (this.formatEditor == null) {
        create = true;
    } else if (isDate && isc.isA.NumberFormatEditor(this.formatEditor) ||
                !isDate && isc.isA.DatetimeFormatEditor(this.formatEditor)) 
    {
        this.formatEditor.destroy();
        create = true;
    } else if (isDate && actualDataType != this.formatEditor.getActualDataType()) {
        this.formatEditor.destroy();
        create = true;
    }
    if (create) {
        var formatEditorProps = {
            _constructor: type == "date" || type == "time" ? "DatetimeFormatEditor" : "NumberFormatEditor"
        }
        this.formatWindow = this.createAutoChild("formatWindow");
        this.formatEditor = this.createAutoChild("formatEditor", formatEditorProps);
        this.formatWindow.addItem(this.formatEditor);
    }

    this.formatWindow.setTitle("Edit formatting for " + field.name);

    var self = this;
    this.formatEditor.edit(field, actualDataType, function (editedField) {
        self.formatWindow.hide();
        // Update field in list by applying only the possibly changed properties being careful
        // to remove the property when it no longer has a value
        if (editedField.format) field.format = editedField.format;
        else if (field.format) delete field.format;
        self.rebindSampleData();
    }, function() {
        self.formatWindow.hide();
    });

    this.formatWindow.show();
},

// move a field up or down by <delta> rows
moveField : function (node, delta) {
    var grid = this.fieldEditor.grid,
        tree = grid.data,
        parentNode = tree.getParent(node),
        currentPosition = tree.findNodeIndex(node),
        totalNodes = tree.getChildren(parentNode).length,
        newPosition = Math.min(Math.max(0, currentPosition + delta), totalNodes)
    ;
    if (newPosition != currentPosition) {
        var nodeRow = grid.getRecordIndex(node),
            editRow = grid.getEditRow()
        ;
        if (editRow != null && editRow == nodeRow) {
            var message = "The field to be moved is has pending edits.<br>Save them now?";
            isc.warn(message, function (value) {
                if (value) {
                    grid.endEditing();
                    tree.move(node, parentNode, newPosition);
                }
            }, {
                buttons: [
                    isc.Dialog.CANCEL,
                    isc.Dialog.OK
                ]
            });
    
        } else {
            tree.move(node, parentNode, newPosition);
        }
    }
},

createLiveDSInstance : function (dsData) {
    
    var dsClass = this.dsClass || dsData._constructor || "DataSource",
        schema;
    if (isc.DS.isRegistered(dsClass)) {
        schema = isc.DS.get(dsClass);
    } else {
        schema = isc.DS.get("DataSource");
        dsData._constructor = dsClass;
    }

    // create a live instance
    var liveDS = isc.ClassFactory.getClass(dsClass).create(dsData);
    
    return liveDS;
},

cancel : function () {
    // This editor is typically embedded in a Window that has a body layout.
    // Find the Window object, if any, and close it.
    var parents = this.getParentElements();
    if (parents && parents.length > 0) {
        var window = parents[parents.length-1];
        if (isc.isA.Window(window)) window.closeClick();
    }
},

save : function () {
    var valid=true;
    if (this.showMainEditor != false) valid = this.mainEditor.validate();
    var fieldEditor = this.fieldEditor;
    if (!valid || !fieldEditor.validate()) {
        return false;
    }
    if (fieldEditor.isVisible()) {
        fieldEditor.saveRecord();
    }

    var dsData = this.getDatasourceData();
    // at this point, _editingDataSource can apparently be just an object, not a DS-instance
    var fields = {};
    if (this._editingDataSource) {
        fields = this._editingDataSource.getFields ?
                    this._editingDataSource.getFields() :
                    this._editingDataSource.fields;
    }

    // When field editor is visible (i.e. not a basic MockDataSource)
    // validate that there is a PK or add one
    if (fieldEditor.isVisible()) {
        // Determine if there is a defined field marked as PK or
        // DataSource inherits a PK field.
        var hasPK = this.hasPrimaryKeyField(dsData.fields);

        if (!hasPK) {
            if (this.autoAddPK) {
                this.createUniqueIdField(dsData.fields);
            } else if (this.requirePK) {
                isc.warn("DataSource must have a field marked as the primary key");
                return false;
            } else if (dsData.serverType == "sql" || dsData.serverType == "hibernate") {
                isc.warn("SQL / Hibernate DataSources must have a field marked as the primary key");
                return false;   
            }
        }
    }

    // Possibly hacky fix for a problem saving these values when they are null ...
    ["recordXPath", "dataURL", "dbName", "schema", "tableName", "quoteTableName", "beanClassName", "dropExtraFields", "autoDeriveSchema"].map(function (removeNull) {
        if (dsData[removeNull] == null) delete dsData[removeNull];
    });

    // definitely hacky fix to prevent includeFrom field data being saved
    if (!this.editSampleData && dsData.cacheData && isc.isA.DataSource(this._editingDataSource)) {
        for (var key in fields) {
            var field = fields[key];
            if (field.includeFrom) {
                dsData.cacheData.map(function(currentValue, index, arr) {
                    delete currentValue[field.name]
                })
            }
        }
    }

    // And remove _constructor: DatabaseBrowser if present ... not sure where that comes from
    if (dsData._constructor == "DatabaseBrowser") delete dsData._constructor;

    // Update cacheData based on security properties if we are editing SampleData
    
    if (this.editSampleData && isc.isA.DataSource(this._editingDataSource)) {
        if (dsData.cacheData) {
            // definitely hacky fix to prevent includeFrom field data being saved
            // we have to drop includeFrom field values again since the security below above
            // apply changes to the original DS cacheData
            var targetCacheData = this._editingDataSource.cacheData,
                includeFromFields
            ;
            for (var key in fields) {
                var field = fields[key];
                if (fields[key].includeFrom) {
                    if (includeFromFields == null) includeFromFields = [];
                    includeFromFields.add(key);
                }
            }
            // Apply security properties, no need to calculate includeFrom values
            var joinValuesProvided = this._editingDataSource.includeFromValuesProvided;
            this._editingDataSource.includeFromValuesProvided = true;
            for (var i=0; i < dsData.cacheData.length; i++) {
                var record = dsData.cacheData[i];
                var op = record._operation;
                switch (op) {
                    case "remove":
                        this._editingDataSource.getClientOnlyResponse({operationType: 'remove', data: record});
                        break;
                    case "update":
                        this._editingDataSource.getClientOnlyResponse({operationType: 'update', data: record});
                        break;
                    default:
                        // This handles explicit "adds" and any new record that has no _operation
                        this._editingDataSource.getClientOnlyResponse({operationType: 'add', data: record});
                        break;
                    }
                if (includeFromFields && targetCacheData[i]) {
                    for (var j = 0; j < includeFromFields.length; j++) {
                        delete targetCacheData[i][includeFromFields[j]];
                    }
                }
            }
            this._editingDataSource.includeFromValuesProvided = joinValuesProvided;
            dsData.cacheData = targetCacheData;
        }
    }

    var _this = this;
    var finishEditing = function () {
        if (_this.makeUniqueTableName && !_this.readOnly) {
            _this.verifyUniqueTableName(dsData);
        } else {
            _this.doneEditing(dsData);
        }
    };

    // If editing an existing DS and the ID hasn't changed, don't check for uniqueness
    if (this.origDSName != null && this.origDSName == dsData.ID) {
        finishEditing();
        return true;
    }

    // Confirm that the DS ID is unique
    var dsDataSource = (this.builder ? this.builder.dsDataSource : this.dsDataSource),
        dataSourceName = dsData.ID,
        fileSpec = {
            fileName: dataSourceName,
            fileType: "ds",
            fileFormat: "xml"
        }
    ;
    dsDataSource.hasFile(fileSpec, function (dsResponse, data, dsRequest) {
        if (!data) {
            // Filename wasn't found so it is unique
            finishEditing();
            return;
        }
        // Warn user that continuing will overwrite existing DS
        isc.warn("DataSource name '" + dataSourceName + "' is already in use. " +
                    "Overwrite the existing DataSource?",
        function (value) {
            if (value) finishEditing();
        }, {
            buttons: [
                isc.Dialog.CANCEL,
                { title: "Overwrite", width:75, overflow: "visible",
                    click: function () { this.topElement.okClick() }
                }
            ],
            autoFocusButton: 1
        })
    }, {
        // DataSources are always shared across users
        operationId: "allOwners"
    });

    return true;
},

verifyUniqueTableName : function (dsData, nextSuffix) {
    var tableName = (dsData.tableName || dsData.ID) + (nextSuffix != null ? "_" + nextSuffix : ""),
        _this = this
    ;

    isc.DMI.call({
        appID: "isc_builtin",
        className: "com.isomorphic.tools.AdminConsole",
        methodName: "tableExists",
        arguments: [ tableName, null ],
        callback : function (request, data) {
            if (data) {
                var suffix = nextSuffix || -1;
                _this.verifyUniqueTableName(dsData, suffix + 1);
            } else {
                if (nextSuffix != null) dsData.tableName = tableName;
                _this.doneEditing(dsData);
            }
        }
    });
},

createUniqueIdField : function (fields) {
    fields.addAt({ name: "uniqueId", type: "sequence", primaryKey: true, hidden: true }, 0);
},

getExtraCleanNodeData : function (nodeList, includeChildren) {
    if (nodeList == null) return null;

    var nodes = [], 
        wasSingular = false;
    if (!isc.isAn.Array(nodeList)) {
        nodeList = [nodeList];
        wasSingular = true;
    }

    for (var i = 0; i < nodeList.length; i++) {
        var treeNode = nodeList[i],
            node = {};
        // copy the properties of the tree node, dropping some further Tree/TreeGrid artifacts
		for (var propName in treeNode) {
            if (propName == "id" || propName == "parentId" || propName == "isFolder") continue;

            node[propName] = treeNode[propName];

            // Clean up the children as well (if there are any)
            if (propName == this.fieldEditor.grid.data.childrenProperty && isc.isAn.Array(node[propName])) {
                node[propName] = this.getExtraCleanNodeData(node[propName]);
            }
        }
        nodes.add(node);
    }
    if (wasSingular) return nodes[0];
    return nodes;
},

doneEditing : function (dsData) {
    if (this.readOnly) {
        var liveDS = isc.DS.get(dsData.ID);

        // fire the callback passed in when editing began
        this.fireCallback(this.saveCallback, "dataSource,nextDataSource", [liveDS, this.nextDataSource]);
        this.saveCallback = null;
        this.nextDataSource = null;
        return;
    }

    // If renaming DataSource, confirm the change
    var _this = this;
    if (this.origDSName != null && this.origDSName != dsData.ID) {
        var message = "Renaming a DataSource will <b>break</b> other screens and " +
                      "projects that use the same DataSource.<P>" +
                      "<b>This operation cannot be undone.</b><P>" +
                      "Rename anyway?";
        isc.warn(message, function (value) {
            if (value) {
                _this.saveChanges(dsData);
            }
        }, {
            buttons: [
                isc.Dialog.CANCEL,
                isc.Dialog.OK
            ]
        });
    } else {
        this.saveChanges(dsData);
    }
},

saveChanges : function (dsData) {
    // handle custom subclasses of DataSource for which there is no schema defined by
    // serializing based on the DataSource schema but adding the _constructor property to
    // get the correct class.
    // XXX problem: if you ask an instance to serialize itself, and there is no schema for
    // it's specific class, it uses the superClass schema but loses it's Constructor
    // XXX we to preserve the class, we need to end up with the "constructor" property set
    // in XML, but this has special semantics in JS
    var dsClass = this.dsClass || dsData._constructor || "DataSource",
        schema;
    if (isc.DS.isRegistered(dsClass)) {
        schema = isc.DS.get(dsClass);
    } else {
        schema = isc.DS.get("DataSource");
        dsData._constructor = dsClass;
    }

    // explicit class properties:
    // - in XML: "constructor" or xsi:type in instances, or "instanceConstructor" in schema
    // - for ClassFactory.newInstance(): _constructor

    // serialize to XML and save to server
    // - don't include any xsi:type attributes on field values.
    var xml = schema.xmlSerialize(dsData, { ignoreExplicitTypes: true });
    //this.logWarn("saving DS with XML: " + xml);
  
    var _this = this;

    // maintain a reference count as we're going to need this DS Editor for the callback
    if (this._pendingCallback == null) this._pendingCallback = 1;
    else                               this._pendingCallback++;

    this.dsDataSource.saveFile({
        fileName: dsData.ID,
        fileType: "ds",
        fileFormat: "xml"
    }, xml, function(resp, data) {
        if (resp.status < 0) {
            isc.warn(resp.data);
            return;
        }
        // Reload the DataSource we just changed
        if (_this._editingDataSource) {
            if (_this._editingDataSource.destroy) {
                _this._editingDataSource.destroy();
            }
            isc.DataSource.load(dsData.ID, function() {
                _this._postProcessSave(dsData);
            }, true, true);
        } else {
            _this._postProcessSave(dsData);
        }
    }, {
        // DataSources are always shared across users - check for existing file to
        // overwrite without regard to ownerId
        operationId: "allOwners"
    });
},

_postProcessSave : function (dsData) {
    var _this = this;

    var reloadDataSource = function (callback) {
        // Reload the DataSource we just changed
        if (_this._editingDataSource) {
            if (_this._editingDataSource.destroy) {
                _this._editingDataSource.destroy();
            }
            isc.DataSource.load(dsData.ID, callback, true, true);
        } else {
            callback();
        }
    };

    reloadDataSource(function () {
        _this._saveRelations(dsData, function (nextDataSource) {
            _this._deleteRenamedDataSource(dsData, function (renamedFileName) {
                // create a live instance of the new DataSource
                var liveDS = isc.DS.get(dsData.ID);
                if (!liveDS) {
                    var dsClass = _this.dsClass || dsData._constructor || "DataSource";
                    liveDS = isc.ClassFactory.getClass(dsClass).create(dsData, {
                        sourceDataSourceID: _this.dsDataSource.ID
                    });
                }

                var callback = _this.saveCallback;
        
                // fire the callback passed in when editing began
                _this.fireCallback(callback, "dataSource,nextDataSource", [liveDS,nextDataSource]);
        
                _this.saveCallback = null;
                _this.nextDataSource = null;
        
                
                var builder = _this.builder;
                if (!--_this._pendingCallback && builder && builder.dsEditor != _this) {
                    _this.markForDestroy();
                }
            })
        });
    });
},

_saveRelations : function (dsData, callback) {
    var _this = this,
        removeRelations = this.hasPrimaryKeyChanged(),
        nextDataSource = this.nextDataSource
    ;

    if (this.relationEditor) {
        this.relationEditor.save(false, function (dsList,dsName) {
            nextDataSource = dsName || nextDataSource;
            if (removeRelations) {
                _this.removeRelations(dsData.ID, function () {
                    callback(nextDataSource);
                })
            } else {
                callback(nextDataSource);
            }
        });
    } else {
        if (removeRelations) {
            _this.removeRelations(dsData.ID, function () {
                callback(nextDataSource);
            })
        } else {
            callback(nextDataSource);
        }
    }
},

_deleteRenamedDataSource : function (dsData, callback) {
    // If edit changed the name of the DataSource (i.e. renamed), delete the
    // old DataSource
    if (this.origDSName != null && this.origDSName != dsData.ID && this.origDSDefaults) {
        var defaults = this.origDSDefaults;

        var dsClass = this.dsClass || defaults._constructor || "DataSource",
            schema;
        if (isc.DS.isRegistered(dsClass)) {
            schema = isc.DS.get(dsClass);
        } else {
            schema = isc.DS.get("DataSource");
            defaults._constructor = dsClass;
        }

        // serialize to XML and save to server
        // - don't include any xsi:type attributes on field values.
        var xml = schema.xmlSerialize(defaults, { ignoreExplicitTypes: true });

        // Save original DS definition as a <dsID>_deleted record, marked as deleted.
        // How will DSEditor caller find out what the renamed file is called?
        var _this = this;
        this._getUniqueDeletedDataSourceID(defaults.ID + isc._underscore + "deleted", function (filename) {
            _this.dsDataSource.saveFile({
                fileName: filename,
                fileType: "ds",
                fileFormat: "xml",
                deleted: true
            }, xml, function(resp, data) {
                if (resp.status < 0) {
                    isc.warn(resp.data);
                    return;
                }
                // Remove the original DS file
                _this.dsDataSource.removeFile({
                    fileName: defaults.ID,
                    fileType: 'ds',
                    fileFormat: 'xml'
                }, function () {
                    callback(filename);
                });
            }, {
                // DataSources are always shared across users - check for existing file to
                // overwrite without regard to ownerId
                operationId: "allOwners"
            });
        });
    } else {
        callback();
    }
},

_getUniqueDeletedDataSourceID : function(baseFileName, callback) {
    // auto-generate an ID for new DataSource
    var fileSpec = {
            fileName: baseFileName,
            fileType: "ds",
            fileFormat: "xml",
            indexPrefix: "_"
        }
    ;
    this.dsDataSource.uniqueName(fileSpec, function (dsResponse, data, dsRequest) {
        if (data) {
            // Unique filename found
            callback(data.fileName);
            return;
        }
        // No unique filename found. This shouldn't happen but what is the recourse if it does?
        callback();
    }, {operationId: "uniqueNameNoAdd"});
},

clear : function () {
    if (this.mainEditor) this.mainEditor.clearValues();
    else this.mainEditorValues = null;
    this.fieldEditor.setData([]);
},

removeRelations : function (dsName, callback) {
    var dsRelations = this.dsRelations;
    dsRelations.reset();

    // Pull full list of relations for this DS and then filter to just
    // those relations that exist in other DataSources that point to this
    // DS. Those are the ones that will have to be removed.
    var relations = dsRelations.getRelationsForDataSource(dsName),
        relatedDataSources = []
    ;
    if (relatedDataSources.length > 0) {
        for (var i = 0; i < relations.length; i++) {
            var relation = relations[i];
            if (relation.type == "1-M") relatedDataSources.add(relation.dsId);
        }

        var count = relatedDataSources.length,
            _this = this
        ;
        for (var i = 0; i < relatedDataSources.length; i++) {
            var sourceDS = isc.DS.get(relatedDataSources[i]);
            dsRelations.removeRelationsToDataSource(sourceDS, dsName, function () {
                if (--count == 0) {
                    _this.fireCallback(callback);
                }
            });
        }
    } else {
        this.fireCallback(callback);
    }
},

hasChanges : function () {
    return !isc.Canvas.compareValues(this.origDSDefaults, this.getDatasourceDefaults());
},

hasPrimaryKeyChanged : function () {
    return (this.fieldEditor.grid._originalPKFieldName != null);
},

getFieldAdds : function () {
    if (this.fieldEditor.isVisible()) {
        return this.fieldEditor.adds;
    }
    if (!this._editingDataSource) {
        return null;
    }
    var oldFieldNames = this._editingDataSource.getFieldNames(),
        dsData = this.getDatasourceDefaults(),
        dsName = dsData.ID,
        ds = isc.DS.get(dsName),
        newFieldNames = ds.getFieldNames()
    ;
    // Look for new fields. Note that there is no way to know that a field was renamed
    // for a MockDataSource without explicit fields. We will get a delete and add.
    var adds = [];
    for (var i = 0; i < newFieldNames.length; i++) {
        var newFieldName = newFieldNames[i];
        if (!oldFieldNames.contains(newFieldName)) {
            adds.add(newFieldName);
        }
    }
    return adds;
},

getFieldRenames : function () {
    if (this.fieldEditor.isVisible()) {
        return this.fieldEditor.renames;
    }
    return null;
},

getFieldDeletes : function () {
    if (this.fieldEditor.isVisible()) {
        return this.fieldEditor.deletes;
    }
    if (!this._editingDataSource) {
        return null;
    }
    var oldFieldNames = this._editingDataSource.getFieldNames(),
        dsData = this.getDatasourceDefaults(),
        dsName = dsData.ID,
        ds = isc.DS.get(dsName),
        newFieldNames = ds.getFieldNames()
    ;
    // Look for removed fields. Note that there is no way to know that a field was renamed
    // for a MockDataSource without explicit fields. We will get a delete and add.
    var deletes = [];
    for (var i = 0; i < oldFieldNames.length; i++) {
        var oldFieldName = oldFieldNames[i];
        if (!newFieldNames.contains(oldFieldName)) {
            deletes.add(oldFieldName);
        }
    }
    return deletes;
},

saveAndOpenDataSource : function (dsName) {
    // Update nextDataSource to point to the clicked one so it takes effect after save
    var origNextDataSource = this.nextDataSource;
    this.nextDataSource = dsName;
    if (!this.save()) {
        // Entry was not valid
        this.nextDataSource = origNextDataSource;
        isc.warn("Reported issue(s) must be fixed before navigating to related DataSource");
    }
},

openDataSource : function (dsName) {
    var liveDS = isc.DS.get(this.origDSName);

    // fire the callback passed in when editing began
    this.fireCallback(this.saveCallback, "dataSource,nextDataSource", [liveDS, dsName]);
    this.saveCallback = null;
    this.nextDataSource = null;
},

initWidget : function () {
    this.Super('initWidget', arguments);

    if (this.editSampleData) {
        // When editing sample data put main editor into a tab and add another tab for data
        this.addAutoChild("mainTabSet");

        // DataSource Fields tab contents
        this.mainStack = this.createAutoChild("mainStack");
        this.instructions = this.createAutoChild("instructions");

        // Sample Data tab contents
        var label = this.createAutoChild("sampleDataLabel");
        this.dataGrid = this.createAutoChild("sampleDataGrid");

        var addNewButton = this.createAutoChild("sampleDataAddRecordButton");
        var discardDataButton = this.createAutoChild("sampleDataDiscardDataButton");
        var buttonLayout = this.createAutoChild("sampleDataButtonLayout", {
            members: [ addNewButton, discardDataButton ]
        });

        this.dataPane = this.createAutoChild("sampleDataPane", {
            members: [ label, this.dataGrid, buttonLayout ] });

        // Create tabs
        this.mainTabSet.addTab({
            name: "fields",
            title: "DataSource Fields",
            pane: this.mainStack
        });
        this.mainTabSet.addTab({
            name: "sampleData",
            title: "Sample Data",
            pane: this.dataPane,
            // When sample data tab is selected, make sure the row being edited
            // receives focus
            tabSelected : function (tabSet, tabNum, tabPane, ID, tab, name) {
                var grid = tabPane.getMember(1),
                    editRowNum = grid.getEditRow()
                ;
                if (editRowNum >= 0 && grid.getEditRow() != editRowNum) {
                    isc.Timer.setTimeout(function () {
                        grid.startEditing(editRowNum);
                    });
                }
            }
        });
    } else {
        // Normal editor mode
        this.addAutoChildren(["mainStack", "instructions"]);
    }
    this.addAutoChild("mainEditor", { fields: isc.clone(this.mainEditorFields) });
    this.addAutoChildren(["opBindingsEditor", "mockEditor", "buttonLayout"]);
    this.addTestDataButton = this.createAutoChild("addTestDataButton");
    this.editWithFieldsButton = this.createAutoChild("editWithFieldsButton");
    this.buttonLayout.addMember(this.addTestDataButton);
    this.buttonLayout.addMember(this.editWithFieldsButton);
    this.buttonLayout.addMember(isc.LayoutSpacer.create({ width: 20 }));
    this.buttonLayout.addMember(this.createAutoChild("cancelButton"));
    this.buttonLayout.addMember(this.createAutoChild("saveButton"));

    if (this.dsDataSource) this.dsDataSource = isc.DataSource.get(this.dsDataSource);
    
    if (this.canAddChildSchema) {
        this.canEditChildSchema = true;
        this.addAutoChild("addChildButton");
    }

    this.legalValuesButton = this.createAutoChild("legalValuesButton", { visibility: (this.showLegalValuesButton ? "inherit" : "hidden") });
    this.validatorsButton = this.createAutoChild("validatorsButton");
    this.securityButton = this.createAutoChild("securityButton");
    if (this.enableRelationEditor) this.relationsButton = this.createAutoChild("relationsButton");
    if (this.enableRelationEditor) this.includeFieldButton = this.createAutoChild("includeFieldButton");
    this.formattingButton = this.createAutoChild("formattingButton");
    this.reorderButtonLayout = this.createAutoChild("reorderButtonLayout");
    this.reorderUpButton = this.createAutoChild("reorderUpButton");
    this.reorderDownButton = this.createAutoChild("reorderDownButton");
    this.reorderButtonLayout.addMembers([this.reorderUpButton, this.reorderDownButton]);

    this.addAutoChild("fieldEditor", {
        fields: isc.clone(this.fieldEditorFields),
        // NOTE: provided dynamically because there's currently a forward dependency: DataSourceEditor is
        // defined in ISC_DataBinding but ComponentEditor is defined in ISC_Tools
        formConstructor:isc.TComponentEditor || isc.ComponentEditor,
		gridConstructor: this.canEditChildSchema ? isc.TreeGrid : isc.ListGrid,
        showMoreButton: this.showMoreButton,
        newButtonTitle: "New Field",
		newButtonDefaults: this.newButtonDefaults,
        newButtonProperties: this.newButtonProperties,
		moreButtonDefaults: this.moreButtonDefaults,
        moreButtonProperties: this.moreButtonProperties,
        autoAssignNewFieldName: false
    });
    this.moreButton = this.fieldEditor.moreButton;
    this.newButton = this.fieldEditor.newButton;

    this.fieldEditor.gridButtons.addMembers([this.legalValuesButton, this.validatorsButton, this.securityButton]);
    if (this.canAddChildSchema) this.fieldEditor.gridButtons.addMember(this.addChildButton);
    this.fieldEditor.gridButtons.addMembers([this.relationsButton, this.includeFieldButton, this.formattingButton,
            isc.LayoutSpacer.create(), this.reorderButtonLayout, isc.LayoutSpacer.create()]);

    var stack = this.mainStack;

    stack.addSections([isc.addProperties(this.instructionsSectionDefaults,
        this.instructionsSectionProperties,
        { items:[this.instructions] }
    )]);

	stack.addSections([isc.addProperties(this.mainSectionDefaults,
        this.mainSectionProperties,
        { items:[this.mainEditor] }
    )]);
    if (this.showMainEditor==false) stack.hideSection(1);

    stack.addSections([isc.addProperties(this.fieldSectionDefaults,
        this.fieldSectionProperties,
        { items:[this.fieldEditor] }
    )]);

    stack.addSections([isc.addProperties(this.opBindingsSectionDefaults,
        this.opBindingsSectionProperties,
        { items:[this.opBindingsEditor] }
    )]);

    stack.addSections([isc.addProperties(this.mockSectionDefaults,
        this.mockSectionProperties,
        { items:[this.mockEditor] }
    )]);

    var _this = this;
    this.deriveForm = this.createAutoChild("deriveForm", {
        fields: [
            {name: "sql", showTitle: false, formItemType: "AutoFitTextAreaItem",
             width: "*", height: 40, colSpan: "*",
             keyPress:function (item, form, keyName) {
                if (keyName == 'Enter' && isc.EH.ctrlKeyDown()) {
                   if (isc.Browser.isSafari) item.setValue(item.getElementValue());
                   _this.execSQL();
                   if (isc.Browser.isSafari) return false;
                }
            }},
            {type: "button", title: "Execute", startRow: true, click: this.getID()+".execSQL()"}
        ]
    });

    /*
    // disabled - would need to add some instructions and error handling before this can be shown
    stack.addSections([isc.addProperties(this.deriveFieldsSectionDefaults,
        this.deriveFieldsSectionProperties,
        { items:[this.deriveForm] }
    )]);

    //this.operationsGrid = this.createAutoChild("operationsGrid");
    //stack.addSection({ID: "operationsSection", title: "Operations", expanded: false, items: [this.operationsGrid]});

    this.previewGrid = this.createAutoChild("previewGrid");
    stack.addSection({ID: "previewSection", title: "Preview", expanded: false, items: [this.previewGrid]});
    */
},

destroy : function () {
    // Make sure sampleData testDS and temporary fields DS are destoyed
    if (this.testDS) this.testDS.destroy();
    if (this._fieldsDS) this._fieldsDS.destroy();
    this.Super("destroy", arguments);
},

execSQL : function () {
    var sql = this.deriveForm.getValue("sql");
    if (sql) {
        // strip whitespaces and trailing semicolons - these produce a syntax error when passed
        // to the JDBC tier
        sql = sql.trim().replace(/(.*);+/, "$1");
        var ds = isc.DataSource.get("DataSourceStore");
        ds.performCustomOperation("dsFromSQL", {dbName: this.mainEditor.getValue("dbName"), sql: sql}, this.getID()+".deriveDSLoaded(data)");
    }
},

deriveDSLoaded : function (data) {
    var ds = data.ds;
    this.dsLoaded(data.ds);
},

dsLoaded : function (dsConfig) {
    var ds = isc.DataSource.create(dsConfig);
    this.currentDS = ds;

    this.deriveFields(ds);
    this.previewGrid.setDataSource(ds);

    /* 
    var ob = ds.operationBindings;
    if (ob && ob.length > 0) {
        this.fetchOperationForm.setValues(ob[0]);
    }
    */
},

deriveFields : function (ds) {
    var fields = ds.getFieldNames();

    var newFields = [];
    for (var i = 0; i < fields.length; i++) {
        var fieldName = fields[i]
        var field = {};
        var dsField = ds.getField(fieldName);
        for (var key in dsField) {
            if (isc.isA.String(key) && key.startsWith("_")) continue;
            field[key] = dsField[key];
        }
        newFields.add(field);
    }

    var tree = isc.Tree.create({
        modelType: "parent",
        childrenProperty: "fields",
        titleProperty: "name",
        idField: "id",
	    nameProperty: "id",
        root: { id: 0, name: "root"},
        data: newFields
    });
    this.fieldEditor.setData(tree);
}


});

/**************************************************
Parsed Data DataSource Editor
***************************************************/

//> @class ParsedDataDSEditor
// Provides a UI for creating +link{DataSource, DataSources)
// whose data comes from parsing an input file. A tab is included
// to show the input data as parsed based on field edits.
//
// @inheritsFrom VLayout
// @visibility devTools
//<
isc.defineClass("ParsedDataDSEditor", "VLayout");


isc.ParsedDataDSEditor.addProperties({

    //> @attr parsedDataDSEditor.dsProperties (Object : null : IR)
    // The properties that define the DataSource to be created.
    //<

    //> @attr parsedDataDSEditor.fileType (String : null : IR)
    // Type of the input data: CSV, XML or JSON
    //
    // @visibility devTools
    //<

    // rawData
    // guessedRecords

    // i18n messages
    //---------------------------------------------------------------------------------------

    //> @attr parsedDataDSEditor.instructions (HTMLString : "Edit detected fields and observe results for imported data" : IR)
    // The instructions message shown to the top of the wizard.
    // 
    // @group i18nMessages
    //<
    instructions: "Edit detected fields and observe results for imported data",

    // internal components
    //---------------------------------------------------------------------------------------

    instructionsFlowDefaults: {
        _constructor: isc.HTMLFlow,
        autoDraw: false,
        width: "100%",
        height: 35,
        padding: 10
    },

    tabSetDefaults: {
        _constructor: isc.TabSet,
        autoDraw: false,
        width: "100%",
        height: "*",
        tabs: [
            { title: "Edit Fields" },
            { title: "View Data", pane: "autoChild:viewDataPane" }
        ]
    },

    buttonLayoutDefaults: {
        _constructor: isc.HLayout,
        autoDraw: false,
        width: "100%", height: 35,
        padding: 5,
        membersMargin: 10,
        align: "right"
    },

    createDataSourceButtonDefaults: {
        _constructor: isc.IButton,
        autoParent: "buttonLayout",
        autoDraw: false,
        title:"Save",
        click : function () {
            this.creator.save();
        }
    },

    importDataButtonDefaults: {
        _constructor: isc.IButton,
        autoParent: "buttonLayout",
        autoDraw: false,
        title:"Import from file...",
        // Disabled until upload feature is confirmed
        disabled: true,
        click : function () {
            this.creator.importDataClick();
        }
    },

    // DS Editor tab
    dsEditorPaneDefaults: {
        _constructor: isc.DataSourceEditor,
        autoDraw: false,
        width: "100%",
        height: "100%",
        canAddChildSchema: false,
        canEditChildSchema: false,
        buttonLayoutProperties: {
            // Wizard "finish" button is used to trigger save so
            // the button layout of the DS editor is not shown
            visibility: "hidden"
        },
        mainStackProperties: {
            _constructor: "TSectionStack"
        },
        mainEditorProperties: {
            _constructor: "TComponentEditor",
            formConstructor: isc.TComponentEditor
        },
        fieldLayoutProperties: {
            _constructor: "TLayout"
        },
        fieldEditorProperties: {
            fieldNameChanged : function (fromName, toName) {
                this.creator.creator.fieldNameChanged(fromName, toName);
            },
            fieldTypeChanged : function (field) {
                this.creator.creator.fieldTypeChanged(field);
            }
        }
    },

    // View Data tab
    viewDataPaneDefaults: {
        _constructor: isc.SectionStack,
        autoDraw: false,
        width: "100%",
        height: "100%",
        visibilityMode: "multiple",
        sections: [
            { name: "records", title: "Records", showHeader: false, expanded: true,
                items: [ "autoChild:dataViewer" ]
            },
            { name: "errors", title: "Warnings/Errors", //expanded: false, hidden: true,
                items: [ "autoChild:errorViewer" ]
            }
        ]
    },

    dataViewerDefaults: {
        _constructor: isc.ListGrid,
        autoDraw: false,
        width: "100%",
        height: "100%"
    },

    errorViewerDefaults: {
        _constructor: isc.ListGrid,
        autoDraw: false,
        width: "100%",
        autoFitData: "vertical",
        autoFitMaxRecords: 10,
        defaultFields: [
            { name: "fieldName", title: "Field", width: 200 },
            { name: "message", title: "Message", width: "*" }
        ]
    }

});

isc.ParsedDataDSEditor.addMethods({

    initWidget : function () {
        this.Super("initWidget", arguments);

        this.addAutoChild("instructionsFlow", { contents: this.instructions });
        this.addAutoChild("tabSet");
        this.addAutoChild("buttonLayout");

        this.addAutoChild("createDataSourceButton");

        this.editorPane = this.createAutoChild("dsEditorPane");
        this.tabSet.setTabPane(0, this.editorPane);

        this.dataPane = this.createAutoChild("viewDataPane");
        this.tabSet.setTabPane(1, this.dataPane);
    },
    
    editNew : function (dataSource, callback, instructions) {
        // Make a copy of dsProperties to avoid changing caller's version
        this.dsProperties = isc.addProperties({}, dataSource.defaults);
        delete this.dsProperties.ID;

        var guessedRecords = this.guessedRecords,
            guessedFields,
            parseDetails
        ;

        if (!guessedRecords) {
            this._createParserAndGuesser();

            var parsedFields = this.parsedFields,
                parsedData = this.parsedData
            ;

            var guesser = this.guesser;
            guesser.fields = parsedFields;
            guessedFields = guesser.extractFieldsFrom(parsedData);
            guessedRecords = guesser.convertData(parsedData);
            
            parseDetails = guesser.parseDetails;
        }

        this._rebindDataViewer(null, guessedRecords, parseDetails);

        this.editorPane.editNew(dataSource, callback, instructions);
    },
        
    editSaved : function (dataSource, callback, instructions) {
        
        //this.editorPane.editSaved(dataSource, callback, instructions);
    },
    
    save : function () {
        this.editorPane.save();
    },
    
    setKnownDataSources : function (dataSourceList) {
        this.editorPane.knownDataSources = dataSourceList;
    },

    _createParserAndGuesser : function () {
        if (!this.parser) {
            this.parser = isc.FileParser.create({ hasHeaderLine: true });
        }
        if (!this.parsedData || !this.parsedFields) {
            var parser = this.parser,
                fileType = this.fileType,
                rawData = this.rawData
            ;
    
            // Perform initial parse to get fields
            if (fileType == "JSON" || fileType == "XML") {
                // XML data is pre-processed into JSON before getting here
                this.parsedData = parser.parseJsonData(rawData); 
            } else if (fileType == "CSV") {
                this.parsedData = parser.parseCsvData(rawData);
            }
            this.parsedFields = parser.getFields();
        }
        if (!this.guesser) {
            var parsedFields = this.parser.getFields();
            this.guesser = isc.SchemaGuesser.create({ fields: parsedFields });
        }
    },

    fieldNameChanged : function (fromName, toName) {
        this._createParserAndGuesser();

        var parser = this.parser,
            fileType = this.fileType,
            rawData = this.rawData,
            fieldNames = parser.getFieldNames(),
            idx = fieldNames.indexOf(fromName)
        ;
        if (idx < 0) return;

        fieldNames[idx] = toName;
        this.parser.fieldNames = fieldNames;

        var parsedData = this.parsedData;
        if (fileType == "CSV") {
            // Re-parse original data with new field name
            parsedData = parser.parseCsvData(rawData);
        } else {
            // Rename the field in data
            parsedData.forEach(function (record) {
                if (record[fromName] != null) {
                    record[toName] = record[fromName];
                    delete record[fromName];
                }
            });
        }
        this.parsedData = parsedData;
        this.parsedFields = parser.getFields();

        // Guess fields and convert data
        var guesser = this.guesser;
        guesser.fields = this.parsedFields;
        var guessedFields = guesser.extractFieldsFrom(parsedData),
            guessedRecords = guesser.convertData(parsedData)
        ;

        // Re-create testDS with updated fields/data
        this._rebindDataViewer(guessedFields, guessedRecords, guesser.parseDetails);
    },

    fieldTypeChanged : function (field) {
        this._createParserAndGuesser();

        // Updated parsed fields to apply type
        var parsedFields = this.parsedFields,
            parsedData = this.parsedData
        ;

        var parsedField = parsedFields.find("name", field.name);
        if (parsedField) {
            parsedField.type = field.type;

            var guesser = this.guesser;
            guesser.fields = parsedFields;
            var guessedFields = guesser.extractFieldsFrom(parsedData),
                guessedRecords = guesser.convertData(parsedData)
            ;

            // Re-create testDS with updated fields/data
            this._rebindDataViewer(guessedFields, guessedRecords, guesser.parseDetails);
        }
    },

    _rebindDataViewer : function (guessedFields, guessedRecords, parseDetails) {
        // Re-create testDS with updated fields/data
        if (this.testDS) this.testDS.destroy();

        var dsProperties = isc.addProperties({}, this.dsProperties, {
            clientOnly: true,
            testData: guessedRecords
        });
        if (guessedFields) dsProperties.fields = guessedFields;

        this.testDS = isc.DataSource.create(dsProperties);

        // Rebind grid
        this.dataViewer.setDataSource(this.testDS);
        this.dataViewer.fetchData();

        if (parseDetails && parseDetails.length > 0) {
            var _this = this;
            this.dataPane.expandSection(1, function () {
                // Make sure the errorViewer has been created
                _this.errorViewer.setData(parseDetails);
            });
        } else if (guessedFields) {
            this.dataPane.collapseSection(1);
        }
    }
});

}

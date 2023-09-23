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


//> @class RelationEditor
// Provides a UI for creating and editing +link{DataSource, DataSources) relationships.
// 
// @inheritsFrom VLayout
// @visibility devTools
//<
isc.ClassFactory.defineClass("RelationEditor", "VLayout");

isc.RelationEditor.addClassProperties({
    helpText: "Relations are links between records of different DataSources, such as a link " +
              "from an Order to the Customer that ordered it.<P>" +
              "To create a relation, you add a special field to a DataSource, which stores a " +
              "unique identifier for records from another DataSource.<P>" +
              "For example, an Order record could have a field that stores the unique " +
              "customer number of the Customer that placed the order.<P>" +
              "When you create a relation field, Reify automatically uses a select or combo " +
              "box when editing the field, so your users can pick a record from the related " +
              "DataSource.<P>" +
              "When building a screen that uses related DataSources, you can also use the " +
              "<i>Fetch Related Data</i> action to populate a grid with records that are " +
              "related to another record.",
    shortHelpText: "Relations are links between records of different DataSources, such as a link " +
              "from an Order to the Customer that ordered it.<P>" +
              "To create a relation, you add a special field to a DataSource, which stores a " +
              "unique identifier for records from another DataSource.<P>" +
              "For example, an Order record could have a field that stores the unique " +
              "customer number of the Customer that placed the order.<P>" +
              "When you create a relation field, Reify automatically uses a select or combo " +
              "box when editing the field, so your users can pick a record from the related " +
              "DataSource."
});

isc.RelationEditor.addClassMethods({
    addGeneratedField : function (ds, fieldName) {
        var fields = isc.RelationEditor.generatedFields;
        if (!fields) {
            fields = isc.RelationEditor.generatedFields = {};
        }
        if (!fields[ds.ID]) {
            fields[ds.ID] = {};
        }
        fields[ds.ID][fieldName] = true;
    },

    removeGeneratedField : function (ds, fieldName) {
        var fields = isc.RelationEditor.generatedFields;
        if (fields && fields[ds.ID]) {
            delete fields[ds.ID][fieldName];
        }
    },

    isGeneratedField : function (ds, fieldName) {
        var fields = isc.RelationEditor.generatedFields;
        return (fields && fields[ds.ID] && fields[ds.ID][fieldName]);
    }
});

isc.RelationEditor.addProperties({
    // attributes 
    overflow: "visible",
    membersMargin: 10,

    // properties

    //> @attr relationEditor.dsDataSource (DataSource | ID : null : IRW)
    // DataSource to be used to load and save ds.xml files, via fileSource operations.
    //
    // @visibility devTools
    //<

    //> @attr relationEditor.knownDataSources (Array of DataSource : null : IRW)
    // List of DataSources from which to choose a related DataSource.
    // <p>
    // Note that an existing relation to a DataSource not included in this list cannot
    // be edited.
    //
    // @setter setKnownDataSources()
    // @visibility devTools
    //<

    // Mappings for relationsList description field and choices for type selection.
    // Type selection will always exclude "Self" option since the DS choice dictates self
    relationTypeDescriptions: {
        "1-M": "Each \"${currentDS}\" record may have multiple \"${relatedDS}\" records (1-to-many)",
        "M-1": "Each \"${relatedDS}\" record may have multiple \"${currentDS}\" records (many-to-1)",
        "Self": "Each \"${currentDS}\" record may have multiple other \"${relatedDS}\" records, in a tree"
    },

    // Component properties

    instructionsPanelDefaults: {
        _constructor: "InstructionsPanel",
        instructions: isc.RelationEditor.helpText,
        helpDialogId: "RelationEditorInstructions"
    },

    outerLayoutDefaults: {
        _constructor: "VLayout",
        autoDraw: false,
        isGroup: true,
        showGroupLabel: false,
        membersMargin: 10,
        layoutMargin: 10
    },

    //> @attr relationEditor.relationsList (AutoChild ListGrid : null : IR)
    //
    // @visibility devTools
    //<
    relationsListDefaults: {
        _constructor: "ListGrid",
        autoDraw:false,
        autoParent: "outerLayout",
        autoFocus:true,
        saveLocally:true,
        width: "100%",
        height: "*",
        showClippedValuesOnHover: true,
        defaultFields: [
            { name: "type", title: "Relation Type", width: 150,
                valueMap: {
                    "1-M": "1-to-many",
                    "M-1": "many-to-1",
                    "Self": "tree self-relation"
                }
            },
            { name: "dsId", title: "DataSource", width: 200,
                formatCellValue : function (value, record, rowNum, colNum, grid) {
                    if (!record || !value) return;
                    var relationEditor = grid.creator,
                        ds = isc.DS.get(value),
                        editingDS = (ds && ds.ID == relationEditor.dataSource.ID)
                    ;
                    value = (ds && !editingDS ? grid.createDSLink(value) : value);
                    return value + (ds ? "" : " (not present)");
                }
            },
            { name: "description", title: "Description", width: "*",
                formatCellValue : function (value, record, rowNum, colNum, grid) {
                    if (!record) return;
                    var type = record.type,
                        description = grid.creator.relationTypeDescriptions[type]
                    ;
                    description = description.evalDynamicString(grid, {
                        currentDS: grid.creator.dataSource.ID,
                        relatedDS: record.dsId
                    });
                    return description;
                }
            }
        ],

        selectionType:"single",
        selectionUpdated : function (record) {
            if (record) this.creator.editRelation(record);
        },

        canRemoveRecords:true,
        removeRecordClick : function (rowNum, colNum) {
            var grid = this,
                record = this.getRecord(rowNum)
            ;
            // if there's no record, nothing to do
            if (!record) return;

            if (!this.recordMarkedAsRemoved(rowNum) &&
                rowNum < this.originalRelationsCount &&
                !isc.RelationEditor.isGeneratedField(record.dsId))
            {
                var message = "Removing this relationship will remove all existing links between " +
                    "'${currentDS}' records and '${relatedDS}' records if you save. " +
                    "This cannot be undone. Proceed?";
                message = message.evalDynamicString(this, {
                    currentDS: this.creator.dataSource.ID,
                    relatedDS: record.dsId
                });
                isc.ask(message, function (value) {
                    if (value) grid.creator.removeRelation(record);
                }, {
                    buttons: [isc.Dialog.NO, isc.Dialog.YES]
                });
            } else {
                grid.creator.removeRelation(record);
            }
        },

        canHover:true,
        hoverWrap:false,

        hoverAutoFitWidth:false,
        hoverStyle: "vbLargeHover",
        cellHoverHTML : function (record, rowNum, colNum) {
            var field = this.getField(colNum);
            if (field.isRemoveField) {
                if (this.recordMarkedAsRemoved(rowNum)) {
                    return "Restore this relation";
                }
                return "Remove this relation";
            }
            if (!isc.DS.get(record.dsId)) {
                return "Related DataSource '" + record.dsId +
                    "' is not included in the project.<p>"+
                    "DataSources will be connected automatically if a DataSource '" + 
                    record.dsId + "' is added later.";
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

        _linkToDataSourceClicked : function (dsName) {
            var relationEditor = this.creator,
                _this = this
            ;
            if (!relationEditor.addRelationButton.isDisabled()) {
                isc.ask("Save without adding the relationship?", function(value) {
                    if (value) {
                        _this.navigateToDataSource(dsName);
                    }
                });
            } else {
                _this.navigateToDataSource(dsName);
            }

            // Called from an <a href .../> onclick so return false to cancel action
            return false;
        },

        navigateToDataSource : function (dsName) {
            var relationEditor = this.creator;

            if (relationEditor.hasPendingChanges()) {
                // We already know there are pending changes so move right on to the next step
                this._navigateToDataSource(dsName);
            } else {
                // To determine if there are changes that need to be saved we hook the saveClick
                // callbacks and let that process proceed as if the user clicked save. That just
                // saves up the pending changes to later be actually saved via save() called by
                // the creator (VB or DataSourceEditor). We can then check the pending changes
                // and put the original callbacks back in place.
                var origSaveCallback = relationEditor.saveCallback,
                    origCancelClick = relationEditor.cancelClick,
                    _this = this
                ;
                relationEditor.saveCallback = relationEditor.cancelClick = function () {
                    relationEditor.saveCallback = origSaveCallback;
                    relationEditor.cancelClick = origCancelClick;
                    _this._navigateToDataSource(dsName, true);
                };
                relationEditor._saveClick();
            }
        },

        _navigateToDataSource : function (dsName, clearPendingSaves) {
            var relationEditor = this.creator,
                dsEditor = relationEditor.dsEditor
            ;

            var saveAndOpenDataSource = function () {
                // Set nextDataSource so that when caller calls save() to save the changes
                // the nextDataSource is returned at that time
                relationEditor.nextDataSource = dsName;

                // Save relation changes into pendingSaves, close the window and return
                // control to the original caller
                relationEditor._saveClick();

                if (dsEditor) {
                    // The DS Editor doesn't do anything immediately when relation editor
                    // is closed so tell it to open the desired DataSource
                    dsEditor.saveAndOpenDataSource(dsName);
                }
            };

            var openDataSource = function () {
                // Set nextDataSource so that when caller calls save() to save the changes
                // the nextDataSource is returned at that time
                relationEditor.nextDataSource = dsName;
                // fire the callback passed in when editing began
                relationEditor.fireCallback(relationEditor.saveCallback, "defaults", [null]);
                if (dsEditor) {
                    // The DS Editor doesn't do anything immediately when relation editor
                    // is closed so tell it to open the desired DataSource
                    dsEditor.openDataSource(dsName);
                }
            };

            var haveDSChanges = dsEditor && !dsEditor.readOnly && dsEditor.hasChanges(),
                haveRelationsToSave = relationEditor.hasPendingChanges()
            ;

            if (clearPendingSaves) {
                delete relationEditor.pendingSaves;
                delete relationEditor._newRelations;
            }

            if (haveDSChanges || haveRelationsToSave) {
                // Since there are changes perform a quick validation of the main editors
                // so that can be reported prior to prompting to save.
                if (haveDSChanges &&
                        (!dsEditor.mainEditor.validate() || !dsEditor.fieldEditor.validate()))
                {
                    isc.warn("Reported issue(s) on DataSource changes must be fixed before navigating to related DataSource");
                    return;
                }

                var changedTarget = (haveDSChanges ? "DataSource " : "");
                if (haveRelationsToSave) {
                    if (changedTarget != "") {
                        changedTarget += "and ";
                    }
                    changedTarget += "relations ";
                }

                var message = "Changes for the " + changedTarget + "must be saved before " +
                                "navigating to the related DataSource.<p>" +
                                "Save changes now?";

                isc.ask(message, function (value) {
                    switch (value) {
                        case "proceed":
                            openDataSource();
                            break;
                        case true:  // save and proceed
                            saveAndOpenDataSource();
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
                openDataSource();
            }
        }
    },

    addNewButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        autoParent: "outerLayout",
        title: "Add New",
        width: 75,
        layoutAlign: "right",
        click: function() {
            this.creator.addRelation();
        }
    },

    //> @attr relationEditor.relationForm (AutoChild DynamicForm : null : IRW)
    //
    // @visibility devTools
    //<
    relationFormDefaults: {
        _constructor: "DynamicForm",
        autoDraw:false,
        autoParent: "outerLayout",
        height: 225,
        wrapItemTitles:false,
        numCols: 4,
        colWidths: [ 125, 25, 50, "*" ],
        fields: [
            { name: "dsId", type: "SelectItem", title: "Related DataSource", colSpan: 3,
                change : function (form, item, value, oldValue) {
                    var result = true;
                    if (value) {
                        var ds = (value == form.creator.dataSource.ID ? form.creator.dataSource : isc.DS.get(value));
                        if (ds && isc.isA.MockDataSource(ds) && !ds.hasExplicitFields()) {
                            var pendingChange = form.creator.getPendingChange(value);
                            if (!pendingChange || !pendingChange.fields) {
                                // Don't accept user value yet. If confirm change it will
                                // be put back.
                                result = false;

                                form.creator.confirmConvertSampleDataMockDataSource(ds,
                                    function (defaults) {
                                        // User-selected value is now confirmed valid
                                        item.changeToValue(value, true);
                                    }
                                );
                            }
                        }
                    }
                    return result;
                },
                mapValueToDisplay : function (value) {
                    return (value && !isc.DS.get(value) ? value + " (not present)" : value);
                },
                pickListProperties: {
                    formatCellValue : function (value, record, rowNum, colNum) {
                        // Format a value that doesn't match an existing DS and that isn't
                        // already pre-formatted (i.e. tree relation)
                        if (value && !isc.DS.get(value) && value.indexOf(" ") < 0) {
                            return value + " (not present)";
                        }
                        return value;
                    }
                }
            },
            { name: "type", type: "RadioGroup", title: "Relation Type", colSpan: 3,
                valueMap: {
                    "1-M": "1-to-many",
                    "M-1": "many-to-1"
                    // "1-1": "1-1"
                    
                },
                defaultValue: "1-M",
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "and",
                    criteria: [
                        { fieldName: "notPresentDS", operator: "equals", value: true }
                    ]
                }
            },
            { name: "treeMessageSpacer", type: "SpacerItem", visible: false },
            { name: "treeMessage", type: "staticText", showTitle: false, title: "&nbsp;", visible: false,  colSpan: 3 },

            
            { name: "required", type: "boolean", title: "Required?",
                //showTitle: false, 
                labelAsTitle: true, startRow: true,
                prompt: "If checked, records that have no related records are hidden.",
                hoverStyle: "vbLargeHover",
                change : function (form, item, value, oldValue) {
                    form.setValue("joinType", (value ? null : "outer"));
                },
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "and",
                    criteria: [
                        { fieldName: "notPresentDS", operator: "equals", value: true }
                    ]
                }
            },
            { name: "storedOnMessage", type: "staticText", showTitle: false, title: "&nbsp;", colSpan: 4,
                height: 20,
                hoverStyle: "vbLargeHover",
                hoverWidth: 400
            },
            { name: "fieldName", type: "text", title: "Stored as", required: true, colSpan: 3,
                editorType: "ComboBoxItem", addUnknownValues: true,
                hoverStyle: "vbLargeHover",
                hoverWidth: 400,
                titleHoverHTML : function () {
                    var pkDS = this.form.getSelectedDS(this.form.getValues()),
                        dsId = (pkDS ? pkDS.getID() : "related"),
                        message = "The field where the relation is stored.  This field will " +
                           "store the unique IDs of related Records from the <i>${dsId}</i> " + 
                           "DataSource."
                    ;
                    message = message.evalDynamicString(this, { dsId: dsId });
                    return message;
                },
                getTitleHTML : function () {
                    var title = this.Super("getTitleHTML", arguments);
                    return title + "&nbsp;" + this.form.helpImgHTML
                },
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "and",
                    criteria: [
                        { fieldName: "notPresentDS", operator: "equals", value: true }
                    ]
                },
                validateOnChange: true,
                validators: [
                    {
                        type:"custom",
                        condition: function (item, validator, value, record, additionalContext) {
                            if (!value || (record.origFieldName && record.origFieldName == value)) return true;

                            // Validate that if the field name is an existing field that it
                            // has the same type as the target PK and that the field name
                            // is not the PK of a Self relation (invalid relation).
                            var fkDS = item.form.getForeignKeyDS(record),
                                pkDS = item.form.getPrimaryKeyDS(record),
                                field = fkDS && fkDS.getField(value),
                                valid = true
                            ;
                            if (field && pkDS && fkDS.ID == pkDS.ID && field.primaryKey) {
                                validator.defaultErrorMessage 
                                    = "The Primary Key cannot relate to it itself in a tree relation";
                                valid = false;
                            }

                            if (field && pkDS && valid) {
                                var fieldType = field.type,
                                    pkField = pkDS.getPrimaryKeyField(),
                                    pkFieldType = pkField.type
                                ;
                                if ((fieldType == "sequence" ? "integer" : fieldType) !=
                                    (pkFieldType == "sequence" ? "integer" : pkFieldType))
                                {
                                    validator.defaultErrorMessage 
                                        = "Value matches an existing field in '" + fkDS.ID + "' which has a type " +
                                            "that differs from the target primary key in " + pkDS.ID +
                                            ". Please choose another field name.";
                                    valid = false;
                                }
                            }

                            return valid;
                        }
                    }
                ]
            },
            { name: "fieldTitle", type: "text", title: "Title as",  colSpan: 3,
                hoverStyle: "vbLargeHover",
                hoverWidth: 400,
                titleHoverHTML : function () {
                    return "Title for the field that stores the relation.  This is how the " +
                           "field will be labeled when viewed in a grid or form.<p>" +
                           "Usually, this is just the name of the related DataSource, for " +
                           "example, \"Employee\".  However, you can give it a more specific " +
                           "name to clarify what the relation means.  For example, an Order " +
                           "might store the Employee number of the salesman that made the " +
                           "sale.  It would be good to title that field \"Sales " +
                           "Representative\" rather than just \"Employee\", so that when " +
                           "you are viewing an Order, you know why it has a related Employee.";
                },
                getTitleHTML : function () {
                    var title = this.Super("getTitleHTML", arguments);
                    return title + "&nbsp;" + this.form.helpImgHTML
                },
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "or",
                    criteria: [
                        { fieldName: "dsId", operator: "isNull" },
                        { fieldName: "notPresentDS", operator: "equals", value: true }
                    ]
                }
            },
            { name: "enableDisplayAs", type: "boolean", align: "right", width: 125,
                showTitle: false, labelAsTitle: true, startRow: true,
                visibleWhen: {
                    _constructor: "AdvancedCriteria", operator: "and",
                    criteria: [ { fieldName: "type", operator: "notEqual", value: "Self" } ]
                },
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "and",
                    criteria: [
                        { fieldName: "notPresentDS", operator: "equals", value: true }
                    ]
                }
            },
            { name: "displayField", type: "text", editorType: "SelectItem", title: "Display as",  colSpan: 2,
                allowEmptyValue: true,
                hint: "from dsID",
                hoverStyle: "vbLargeHover",
                hoverWidth: 400,
                titleHoverHTML : function () {
                    var pkDS = this.form.getPrimaryKeyDS(this.form.getValues()),
                        pkDSId = (pkDS ? pkDS.getID() : "related"),
                        fkDS = this.form.getForeignKeyDS(this.form.getValues()),
                        fkDSId = (fkDS ? fkDS.getID() : "related"),
                        message = "When you view the relation field stored on the <i>${fkDSId}</i> " +
                           "DataSource, you can show a field from the <i>${pkDSId}</i> " +
                           "DataSource (instead of showing the unique ID of the related " +
                           "record, which is just a number).<P>" +
                           "For example, if you have a relation field \"customerNumber\" on " +
                           "Order that stores the Customer that placed the order, you would " +
                           "set \"Display as\" to the <i>customerName</i> field, so that " +
                           "when you view an order, the Customer name is shown.<P>" +
                           "This is done via creating an <i>included field</i>.  Included " +
                           "fields don't really store data, instead they just <i>include</i> " +
                           "data from a related DataSource, dynamically, whenever a user is " +
                           "viewing records from the primary DataSource.  You can also add " +
                           "included fields later for any relation."
                    ;
                    message = message.evalDynamicString(this, {
                        fkDSId: fkDSId,
                        pkDSId: pkDSId
                    });
                    return message;
                },
                getTitleHTML : function () {
                    var title = this.Super("getTitleHTML", arguments);
                    return title + "&nbsp;" + this.form.helpImgHTML
                },
                visibleWhen: {
                    _constructor: "AdvancedCriteria", operator: "and",
                    criteria: [ { fieldName: "type", operator: "notEqual", value: "Self" } ]
                },
                readOnlyWhen: {
                    _constructor: "AdvancedCriteria", operator: "or",
                    criteria: [
                        { fieldName: "dsId", operator: "isNull" },
                        { fieldName: "notPresentDS", operator: "equals", value: true },
                        { fieldName: "enableDisplayAs", operator: "notEqual", value: true }
                    ]
                }
            }
        ],
        initWidget : function () {
            var helpImgURL = this.getImgURL("[SKINIMG]actions/help.png");
            this.helpImgHTML = "<img src='" + helpImgURL + "' width='12' height='12' valign='center'/>";

            this.Super("initWidget", arguments);
        },
        editRecord : function (record) {
            this.creator.addRelationButton.disable();
            record.origFieldName = record.fieldName;
            if (!record.origIncludeField) {
                record.origIncludeField = record.includeField || record.displayField;
            }
            record.enableDisplayAs = (record.displayField != null);
            record.required = (record.joinType != "outer");
            this.updateDataSourceChoices(record);
            this.updateTypeChoices(record);
            this.updateFieldNameHint(record);
            this.updateFieldNameChoices(record);
            this.updateDisplayAsChoices(record);
            this.updateDisplayAsHint(record);
            this.Super("editRecord", arguments);
            this.updateTreeMessage(record);
            this.updateStoredOnMessage(record);
            this.setFieldDefaults();
        },
        editNewRecord : function (record) {
            this.creator.addRelationButton.disable();
            if (record) record.joinType = "outer";
            this.updateDataSourceChoices(record);
            this.updateTypeChoices(record);
            this.updateFieldNameHint(record);
            this.updateFieldNameChoices(record);
            this.updateDisplayAsChoices(record);
            this.updateDisplayAsHint(record);
            this.Super("editNewRecord", arguments);
            this.updateTreeMessage(record);
            this.updateStoredOnMessage(record);
            this.setFieldDefaults();
        },
        itemChanged : function (item, newValue) {
            var record = this.getValues();
            if ("dsId" == item.name) {
                var currentDSId = (this.creator.dataSource ? this.creator.dataSource.ID : null);
                if (isc.DS.get(newValue) || newValue == currentDSId) {
                    this.updateTypeChoices(record);
                    this.updateFieldNameHint(record);
                    this.updateFieldNameValue();
                    this.updateFieldNameChoices(record, true);
                    this.updateDisplayAsChoices(record, true);
                    this.updateDisplayAsHint(record);
                    this.updateFieldTitleValue();
                    this.updateTreeMessage(record);
                    this.updateStoredOnMessage(record);
                    this.setValue("notPresentDS", false);
                    this.setValue("relatedFieldName", null);
                } else {
                    this.setValue("notPresentDS", true);
                }
            } else if ("type" == item.name) {
                this.updateFieldNameHint(record);
                this.updateFieldNameValue();
                this.updateFieldNameChoices(record);
                this.updateDisplayAsChoices(record, true);  // Force update to current value
                this.updateDisplayAsHint(record);
                this.updateFieldTitleValue();
                this.updateTreeMessage(record);
                this.updateStoredOnMessage(record);
            } else if ("fieldName" == item.name) {
                this.updateFieldNameHint(record);
            } else if ("displayField" == item.name) {
                this.updateFieldTitleValue();
            }
            if (this.valuesAreValid(false)) {
                var isNew = (this.saveOperationType == "add");
                if (!isNew) {
                    this.creator.saveRelation(this.getValues(), isNew);
                } else {
                    this.creator.addRelationButton.enable();
                }
            } else {
                this.creator.addRelationButton.disable();
            }
        },
        setFieldDefaults : function () {
            var isNew = (this.saveOperationType == "add");
            if (isNew || this.getValue("displayField")) {
                this.setValue("enableDisplayAs", true);
            }
            var dsId = this.getValue("dsId");
            if (isNew) {
                var currentDSId = (this.creator.dataSource ? this.creator.dataSource.ID : null);
                if (dsId && dsId == currentDSId) {
                    this.setValue("type", "Self");
                } else { 
                    this.setValue("type", "1-M");
                }
                this.setValue("joinType", "outer");
            }
            if (!isNew && dsId && !isc.DS.get(dsId)) {
                this.setValue("notPresentDS", true);
            } else {
                this.setValue("notPresentDS", false);
            }
        },
        updateDataSourceChoices : function (record) {
            if (!this.creator.knownDataSources) return;
            var dataSourceIds = this.creator.knownDataSources.getProperty("ID"),
                currentDSId = (this.creator.dataSource ? this.creator.dataSource.ID : null),
                valueMap = {}
            ;
            // If the DS being edited is not part of the knownDataSources add it now
            // so that a tree relations can be defined.
            if (currentDSId && !dataSourceIds.contains(currentDSId)) {
                dataSourceIds.add(currentDSId);
            }

            // Sort case-insensitive
            dataSourceIds.sort(function (a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return (a < b ? -1 : a == b ? 0 : 1);
            });

            for (var i = 0; i < dataSourceIds.length; i++) {
                var id = dataSourceIds[i];
                valueMap[id] = (id == currentDSId ?
                                id + " (tree via self-relation)" :
                                (!isc.DS.get(id) ? id + " (not present)" : id));
            }
            this.getField("dsId").setValueMap(valueMap);
        },
        updateTypeChoices : function (record) {
            var dsId = (record ? record.dsId : null),
                currentDSId = (this.creator.dataSource ? this.creator.dataSource.ID : null),
                descriptions = this.creator.relationTypeDescriptions,
                typeField = this.getField("type"),
                valueMap = {}
            ;

            if (dsId && dsId == currentDSId) {
                // For the type RadioGroupItem to accept the "Self" value it must be in valueMap
                valueMap = { "Self": "Tree self-relation" };
                typeField.hide();
                typeField.setValueMap(valueMap);
                // Value has to be "Self" since that's the only choice
                typeField.setValue("Self");
            } else {
                for (var type in descriptions) {
                    if (type == "Self") continue;
                    var description = descriptions[type];
                    description = description.evalDynamicString(this, {
                        currentDS: currentDSId,
                        relatedDS: dsId || "&lt;related&gt;"
                    });
                    valueMap[type] = description;
                }
                typeField.setValueMap(valueMap);
                if (typeField.getValue() == "Self") {
                    // Switching from "Self" to whatever the defaultValue is for the group
                    typeField.setValue(null);
                }
                typeField.show();
            }
        },
        updateFieldNameHint : function (record) {
            var hint;
            if (record) {
                var fkDS = this.getForeignKeyDS(record),
                    value = record.fieldName,
                    existingField = fkDS && (fkDS.getField(value) != null)
                ;
                if (fkDS) {
                    hint = " on <i>" + fkDS.ID + "</i> "
                    if (!existingField && record.origFieldName && value != record.origFieldName) {
                        hint += "[rename field from <i>" + record.origFieldName + "</i>]";
                    } else {
                        hint += (existingField ? "[existing field] with title:" : "[new field]");
                    }
                }
            }
            this.getField("fieldName").setHint(hint);
        },
        updateFieldNameValue : function () {
            var relatedDSId = this.getValue("dsId"),
                currentDSId = (this.creator.dataSource ? this.creator.dataSource.ID : null),
                type = this.getValue("type"),
                ds = (type == "1-M" ? this.creator.dataSource : isc.DS.get(relatedDSId))
            ;
            if (ds) {
                // A title is likely singular so use it if defined
                var dsTitle = (ds.title || ds.ID).replace(/ /g, ""),
                    value = dsTitle.substring(0, 1).toLowerCase() + dsTitle.substring(1) + "Id"
                ;
                // A tree relation (self) uses a "parent" field
                if (relatedDSId && relatedDSId == currentDSId) {
                    value = "parent" + dsTitle.substring(0, 1).toUpperCase() + dsTitle.substring(1) + "Id";
                }
                this.setValue("fieldName", value);
            }
        },
        updateFieldNameChoices : function (record, dsChanged) {
            var type = record && record.type,
                relatedDSId = type && record.dsId
            ;
            if (!relatedDSId || !isc.DS.get(relatedDSId)) {
                this.getField("fieldName").setValueMap(null);
                return;
            }

            // Populate the comboBox with existing field names from DS where the FK will
            // be stored. Only show fields that have the same type as the PK of the related
            // DS and are not already foreign keys. For a tree relation (self) don't provide
            // the PK field as an option. The PK cannot reference itself - the relation is invalid.
            var fkDS = this.getForeignKeyDS(record),
                pkDS = this.getPrimaryKeyDS(record),
                dsFieldNames = fkDS.getFieldNames(),
                pkField = pkDS.getPrimaryKeyField(),
                pkFieldType = pkField.type,
                allowPK = (fkDS.ID != pkDS.ID),
                valueMap = []
            ;
            if (pkFieldType == "sequence") pkFieldType = "integer";

            for (var i = 0; i < dsFieldNames.length; i++) {
                var dsFieldName = dsFieldNames[i],
                    field = fkDS.getField(dsFieldName),
                    fieldType = (field.type == "sequence" ? "integer" : field.type)
                ;
                if (fieldType == pkFieldType && (allowPK || !field.primaryKey) && !field.foreignKey) {
                    valueMap.add(field.name);
                }
            }
            this.getField("fieldName").setValueMap(valueMap);
        },
        updateFieldTitleValue : function () {
            var enableAsValue = this.getValue("enableDisplayAs"),
                displayAsValue = (enableAsValue ? this.getValue("displayField") : null),
                relatedDSId = this.getValue("dsId"),
                title
            ;
            if (displayAsValue) {
                var type = this.getValue("type"),
                    targetDS = (type == "1-M" ? this.creator.dataSource : isc.DS.get(relatedDSId)),
                    field = targetDS.getField(displayAsValue)
                ;
                title = field && field.title;
                if (title && (title.toLowerCase() == "id" || title.toLowerCase() == "name")) {
                    title = null;
                }
                if (field && !title) {
                    title = isc.DS.getAutoTitle(displayAsValue);
                }
            } else {
                var relatedDS = isc.DS.get(relatedDSId);
                title = (relatedDS ? relatedDS.title || relatedDS.ID.replace(/\d+$/, "") : null);
            }

            this.setValue("fieldTitle", title);
        },
        updateDisplayAsChoices : function (record, dsChanged) {
            if (!record) return;
            var sourceDSId = (record.type == "M-1" ? record.dsId : this.creator.dataSource.ID),
                displayAsValue = record.displayField,
                displayAsField = this.getField("displayField"),
                clearValue = dsChanged,
                valueMap
            ;
            if (sourceDSId) {
                var currentDSId = (this.creator.dataSource ? this.creator.dataSource.ID : null),
                    sourceDS = (sourceDSId == currentDSId ? this.creator.dataSource : isc.DS.get(sourceDSId))
                ;
                if (sourceDS) {
                    valueMap = sourceDS.getFieldNames();

                    if (!displayAsValue || dsChanged) {
                        var defaultTitleField = sourceDS.getTitleField();
                        if (defaultTitleField) {
                            displayAsField.setValue(defaultTitleField);
                            clearValue = false;
                        }
                    }
                }
            }
            if (clearValue) displayAsField.clearValue();
            displayAsField.setValueMap(valueMap);
        },
        updateDisplayAsHint : function (record) {
            var hint;
            if (record && record.dsId) {
                hint = "from <i>" + 
                        (record.type == "M-1" ? record.dsId : this.creator.dataSource.ID) +
                        "</i>";
            }
            this.getField("displayField").setHint(hint);
        },
        updateTreeMessage : function (record) {
            var dsId = (record ? record.dsId : null),
                currentDSId = (this.creator.dataSource ? this.creator.dataSource.ID : null),
                treeMessageSpacerField = this.getField("treeMessageSpacer"),
                treeMessageField = this.getField("treeMessage")
            ;

            if (dsId && dsId == currentDSId) {
                treeMessageSpacerField.show();
                treeMessageField.show();
                treeMessageField.setValue("Each '" + currentDSId +
                    "' record may have multiple other '" + currentDSId + "' records, in a tree.");
            } else {
                treeMessageSpacerField.hide();
                treeMessageField.hide();
            }
        },
        updateStoredOnMessage : function (record) {
            var fkDS = this.getForeignKeyDS(record),
                storedOnMessageField = this.getField("storedOnMessage"),
                message,
                prompt
            ;
            if (fkDS) {
                message = "Relation data will be stored on the <i>" + fkDS.ID + "</i> DataSource";
                prompt = isc.RelationEditor.shortHelpText
            }
            storedOnMessageField.setValue(message);
            storedOnMessageField.setPrompt(prompt);
        },
        getSelectedDS : function (record) {
            if (!record) return null;
            return (record.dsId == this.creator.dataSource.ID ?
                        this.creator.dataSource :
                        isc.DS.get(record.dsId));
        },
        getForeignKeyDS : function (record) {
            if (!record) return null;
            return (record.type == "1-M" ? this.getSelectedDS(record) : this.creator.dataSource);
        },
        getPrimaryKeyDS : function (record) {
            if (!record) return null;
            return (record.type == "1-M" ? this.creator.dataSource : this.getSelectedDS(record));
        }
    },

    addRelationButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        autoParent: "outerLayout",
        title: "Add Relation",
        wrap: false,
        autoFit: true,
        layoutAlign: "right",
        click: function() {
            this.creator.saveNewRelation();
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

    bodyProperties:{
        overflow:"auto",
        layoutMargin:10
    },

    // methods

    initWidget : function () {
        this.Super('initWidget', arguments);

        // Add instruction section at top
        this.addAutoChild("instructionsPanel");

        this.addAutoChildren(["outerLayout","relationsList","addNewButton","relationForm","addRelationButton","buttonLayout"]);
        this.buttonLayout.addMember(this.createAutoChild("cancelButton"));
        this.buttonLayout.addMember(this.createAutoChild("saveButton"));

        if (this.knownDataSources) this.setKnownDataSources(this.knownDataSources);

        this.addRelation();
    },

    // api

    //> @method relationEditor.setKnownDataSources()
    // Setter for +link{knownDataSources}.
    // @param dataSourceList (Array of DataSource) known DataSources
    // @visibility devTools
    //<
    setKnownDataSources : function (dataSourceList) {
        this.knownDataSources = dataSourceList;
        delete this._rawRelations;
        this.relationForm.updateDataSourceChoices();
    },

    //> @method relationEditor.edit()
    // Start editing relations for a DataSource.
    // 
    // @param dataSource (Object | DataSource | ID) dataSource or defaults to edit relations
    // @param [callback] (Function) function to call after save
    // @visibility devTools
    //<
    edit : function (dataSource, callback, selectForeignKey) {
        if (!this.knownDataSources) {
            this.logWarn("'knownDataSources' not populated - ignoring relations edit")
            return;
        }

        this.dsDefaults = null;
        if (!isc.isA.DataSource(dataSource) && isc.isAn.Object(dataSource)) {
            // Passed in defaults
            var defaults = isc.clone(dataSource);

            var existingDSId = defaults.ID;

            // Create an actual instance of DS for reference. If the DS is readOnly
            // in the DS Editor we don't want to create an override class that may
            // break the current project.
            defaults.addGlobalId = false;
            delete defaults.ID;
            var dsClass = dataSource._constructor || "DataSource";
            dataSource = isc.ClassFactory.getClass(dsClass).create(defaults, {
                sourceDataSourceID: this.dsDataSource.ID
            });
            dataSource.ID = existingDSId;
            delete defaults.addGlobalId;
            defaults.ID = existingDSId;

            this.dsDefaults = defaults;
        }
        this.dataSource = isc.DS.get(dataSource);

        // to be called when editing completes
        this.saveCallback = callback;
        this.nextDataSource = null;

        this.relationsList.emptyMessage = "Inspecting relations for " + this.dataSource.ID;
        this.relationsList.setData([]);

        if (isc.isA.MockDataSource(this.dataSource) && !this.dataSource.hasExplicitFields()) {
            var pendingChange = this.getPendingChange(this.dataSource.ID);
            if (!pendingChange || !pendingChange.fields) {
                var _this = this;
                this.waitUntilDrawn(function (dataSource, callback, selectForeignKey) {
                    _this.confirmConvertSampleDataMockDataSource(dataSource, function (defaults) {
                        _this.edit(defaults, callback, selectForeignKey);
                    });
                }, [dataSource, callback, selectForeignKey]);
                return;
            }
        }

        if (!this.dsDefaults) {
            var self = this;
            this.getDataSourceDefaults(this.dataSource.ID, function (dsId, defaults, readOnly) {
                if (readOnly) self.readOnly = true;
                // Save defaults for editing
                self.dsDefaults = defaults;
                self.start(selectForeignKey);
            });
        } else {
            this.start(selectForeignKey);
        }
    },

    // Used by DataSourceEditor to determine if there are relations that must be saved
    hasPendingChanges : function () {
        var dsList = isc.getKeys(this.pendingSaves);
        // Remove editing DataSource from potential list
        var index = dsList.findIndex("ID", this.dataSource.ID);
        if (index >= 0) dsList.remove(index);
        return (dsList.length > 0);
    },

    // Used by DataSourceEditor to pull details on pending saves when refreshing its
    // copy of the DSRelations
    getPendingChange : function (dsId) {
        return (this.pendingSaves ? this.pendingSaves[dsId] : null);
    },

    newRelationMessage: "New ${type} relation added from ${sourceDSId} to ${targetDSId}.",
    newRelationActionTitle: "Click to view new fields on ${sourceDSId} DataSource",

    // Show added relations as notifications @ (x,y) if specified.
    // Callback will be made if the user clicks on message link passing the dsId as argument
    showNewRelationNotifications : function (x, y, actionCallback, excludeLocalRelations, width) {
        // Save callback for use by notificationActionClicked()
        this._notificationCallback = actionCallback;
        var newRelations = this._newRelations;
        if (!isc.isAn.emptyObject(newRelations)) {
            // Show a message for each new relation via the Notify system
            for (var dsId in newRelations) {
                var relation = newRelations[dsId],
                    type = relation.type,
                    sourceDSId = this.dataSource.ID,
                    targetDSId = relation.dsId
                ; 

                if ("M-1" == type || "Self" == type) {
                    // Don't show relations that are defined in this.dataSource
                    if (excludeLocalRelations) continue;
                    type = ("M-1" == type ? "Many-to-1" : type);
                } else if ("1-M" == type) {
                    type = "1-to-many";
                    sourceDSId = relation.dsId;
                    targetDSId = this.dataSource.ID;
                }

                var message = this.newRelationMessage.evalDynamicString(this, {
                    type: type,
                    sourceDSId: sourceDSId,
                    targetDSId: targetDSId
                });
                var actionTitle = this.newRelationActionTitle.evalDynamicString(this, {
                    type: type,
                    sourceDSId: sourceDSId,
                    targetDSId: targetDSId
                });
                var settings = {
                    duration: 7000,
                    canDismiss: true, 
                    messageIcon: "[SKIN]/Notify/checkmark.png",
                    autoFitWidth: (width == null),
                    autoFitMaxWidth: 550,
                    appearMethod: "fade",
                    disappearMethod: "fade",
                    x: x,
                    y: y
                };
                if (width != null) {
                    settings.labelProperties = { width: width };
                }

                isc.Notify.addMessage(
                    message,
                    [{
                        separator: "<BR>",
                        title: actionTitle,
                        target: this, methodName: "notificationActionClicked",
                        args: [sourceDSId]
                    }],
                    null,
                    settings
                );
            }
        }
    },

    // Call callback saved in showNewRelationNotifications() with selected target dsId
    notificationActionClicked : function (dsId) {
        if (this._notificationCallback) {
            this.fireCallback(this._notificationCallback, ["dsId"], [dsId]);
        }
    },

    //> @method relationEditor.save()
    // Save all pending changes to +link{dsDataSource}.
    // 
    // @param [includeEditedDataSource] (boolean) should edited DS changes be saved?
    // @param [callback] (Function) function to call after save
    // @visibility devTools
    //<
    save : function (includeEditedDataSource, callback) {
        if (!this.pendingSaves || isc.isAn.emptyObject(this.pendingSaves)) {
            this.fireCallback(callback, "dsList,nextDataSource", [null,this.nextDataSource]);
            return;
        }

        var _this = this,
            dsList = isc.getKeys(this.pendingSaves),
            saveCount = 0
        ;
        if (!includeEditedDataSource) {
            var index = dsList.findIndex("ID", this.dataSource.ID);
            if (index >= 0) dsList.remove(index);
        }

        var fireCallback = function () {
            if (--saveCount <= 0) {
                // Reload the saved DataSource instance
                isc.DataSource.load(dsId, function() {
                    _this.fireCallback(callback, "dsList,nextDataSource", [dsList,_this.nextDataSource]);
                    _this.nextDataSource = null;
                }, true, true);
            }
        };

        for (var dsId in this.pendingSaves) {
            // Exclude edited DS if desired
            if (!includeEditedDataSource && dsId == this.dataSource.ID) continue;

            var defaults = this.pendingSaves[dsId];

            // Handle field renames
            var fields = defaults.fields;
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (field._renameFrom) {
                    var fromName = field._renameFrom,
                        toName = field.name
                    ;
                    // Previous field name may have been used in validator.applyWhen values - update these
                    for (var j = 0; j < fields.length; j++) {
                        var f = fields[j];
                        if (f.validators && f.validators.length > 0) {
                            for (var k = 0; k < f.validators.length; k++) {
                                this.updateValidatorFieldNames(f.validators[k], fromName, toName);
                            }
                        }
                    }

                    // If there is sample data in the DS, rename the field in the records
                    if (defaults.cacheData) {
                        defaults.cacheData.forEach(function (record) {
                            if (record[fromName] != null) {
                                record[toName] = record[fromName];
                                delete record[fromName];
                            }
                        });
                    }
                }
            }

            // handle custom subclasses of DataSource for which there is no schema defined by
            // serializing based on the DataSource schema but adding the _constructor property to
            // get the correct class.
            // XXX problem: if you ask an instance to serialize itself, and there is no schema for
            // it's specific class, it uses the superClass schema but loses it's Constructor
            // XXX we to preserve the class, we need to end up with the "constructor" property set
            // in XML, but this has special semantics in JS
            var dsClass = defaults._constructor || "DataSource",
                schema;
            if (isc.DS.isRegistered(dsClass)) {
                schema = isc.DS.get(dsClass);
            } else {
                schema = isc.DS.get("DataSource");
                defaults._constructor = dsClass;
            }

            // serialize to XML and save to server
            var xml = schema.xmlSerialize(defaults);
            // this.logWarn("saving DS with XML: " + xml);

            saveCount++;

            this.dsDataSource.saveFile({
                fileName: defaults.ID,
                fileType: "ds",
                fileFormat: "xml"
            }, xml, function() {
                fireCallback();
            }, {
                // DataSources are always shared across users - check for existing file to
                // overwrite without regard to ownerId
                operationId: "allOwners"
            });
        }

        // If there was nothing to save, let caller know
        if (saveCount == 0) {
            fireCallback();
        }
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

    waitUntilDrawn : function (callback, params) {
        if (!this.isDrawn()) {
            this._untilDrawnDetails = {
                callback: callback,
                params: params
            };
            this.observe(this, "drawn", "observer._waitUntilDrawn();");
            return;
        }
        this.fireCallback(callback, null, params);
    },

    _waitUntilDrawn : function () {
        if (this.isObserving(this, "drawn")) this.ignore(this, "drawn");
        var callback = this._untilDrawnDetails.callback,
            params = this._untilDrawnDetails.params
        ;
        delete this._untilDrawnDetails;

        this.fireCallback(callback, null, params);
    },

    confirmConvertSampleDataMockDataSource : function (dataSource, callback) {
        var _this = this,
            dsId = dataSource.ID
        ;
        var message = "To create a relation with this DataSource, it must be converted " +
            "from sample data to editing fields and data separately.  Do this now?"

        isc.ask(message, function(response) {
            if (response) {
                _this.switchToEditFieldsAndDataSeparately(dataSource, function (defaults) {
                    if (!_this.pendingSaves) _this.pendingSaves = {};
                    _this.pendingSaves[dsId] = defaults;
                    callback(defaults);
                });
            } else {
                _this.cancelClick();
            }
        }, {
            buttons: [
                isc.Dialog.NO,
                isc.Dialog.YES
            ]
        });
        // Make sure dialog is above editor window
        isc.Dialog.Warn.delayCall("bringToFront");
    },

    start : function (selectForeignKey) {
        // this.dsDefaults and this.dataSource are both populated at this point
        this.relationForm.updateDataSourceChoices();

        // Create map of all relations between this.knownDataSources
        var dsList = this.knownDataSources;
        // If the DS being edited is not part of the knownDataSources add it now
        // so that relations can be extracted.
        if (dsList.find("ID", this.dataSource.ID) == null) {
            dsList = dsList.duplicate();
            dsList.add(this.dataSource);
        }
        this.dsRelations = isc.DSRelations.create({
            editor: this,
            dataSources: dsList,
            getRelationsForDataSource : function (name) {
                var relations = this.Super("getRelationsForDataSource", arguments),
                    dsDefaults = this.editor.dsDefaults
                ;
        
                for (var i = 0; i < relations.length; i++) {
                    var relation = relations[i],
                        type = relation.type,
                        displayField = relation.displayField,
                        includeField
                    ;
                    // Only post-process direct and indirect FK relations
                    if (type == "Self") continue;
        
                    // The FK displayField references the includeFrom field by name but
                    // that name is either the includeFrom field name or an explicit name
                    // on the field (Name as). For editing the displayField should be the
                    // actual field name on the related DS and includeField is the name
                    // of the included field, if renamed. 
                    if (displayField && name == dsDefaults.ID) {
                        var field = (type == "M-1" ?
                                        dsDefaults.fields.find("name", displayField) :
                                        isc.DS.get(relation.dsId).getField(displayField));
                        if (field && field.includeFrom) {
                            includeField = displayField;
                            var split = field.includeFrom.split(".");
                            if (split && split.length >= 2) {
                                displayField = split[split.length-1];
                            } else {
                                displayField = field.includeFrom;
                            }
                            if (displayField == includeField) includeField = null;
                        }
                        relation.displayField = displayField;
                        relation.includeField = includeField;
                    }
                }
                return relations;
            },
            getForeignKeyFields : function (ds) {
                var editor = this.editor,
                    dsId = ds.ID
                ;
                if (editor.pendingSaves && editor.pendingSaves[dsId]) {
                    ds = editor.pendingSaves[dsId];
                }
                return this.Super("getForeignKeyFields", arguments);
            }
        });
        

        // Get relations from the perspective of this.dataSource
        var relations = this.dsRelations.getRelationsForDataSource(this.dsDefaults.ID);

        // Save original relations to determine added records and correct data to remove
        this.originalRelations = isc.clone(relations);
        this.originalRelationsCount = relations.length;

        // These are the relations to edit
        this.relationsList.emptyMessage = "No relations defined for " + this.dataSource.ID;
        this.relationsList.setData(relations);

        if (selectForeignKey) {
            // Select relation for foreignKey
            var field = { foreignKey: selectForeignKey },
                relatedFieldName = isc.DS.getForeignFieldName(field),
                relatedDSName = isc.DS.getForeignDSName(field, this.dataSource)
            ;
            for (var i = 0; i < relations.length; i++) {
                var relation = relations[i];
                if (relation.dsId == relatedDSName && relation.relatedFieldName == relatedFieldName) {
                    this.relationsList.selectSingleRecord(relation);
                    break;
                }
            }
        } else {
            // Always start with editing a new relation in the lower form
            this.addRelation();
        }
    },

    // Does the target DS have a field <fieldName> already?
    // Determining this is a not as easy as checking getField() for non-null.
    // If a pending relation will be adding the field, that should report as existing.
    // Additionally, if there is a pending relation removal that will be removing the
    // field, it should be reported as not existing.
    dsHasExistingField : function (ds, fieldName, ignoreRelation) {
        var dsId = ds.ID;
        if (this.pendingSaves && this.pendingSaves[dsId]) {
            ds = this.pendingSaves[dsId];
        }

        var recordsAreEqual = function (record1, record2) {
            var fieldNames = (isc.isA.DataSource(ds) ? ds.getFieldNames() : ds.fields.getProperty("name"));
            for (var i = 0; i <  fieldNames.length; i++) {
                // No need for special compare method because all types are simple and no dates
                if (record1[ fieldNames[i] ] != record2[ fieldNames[i] ]) {
                    return false;
                }
            }
            return true;
        };

        var relationsList = this.relationsList,
            relations = relationsList.data,
            isRemovedField,
            localField
        ;
        for (var i = 0; i < relations.length; i++) {
            var relation = relations[i];
            if (relation.dsId != ds.ID &&
                relation.type == "M-1" &&
                ((relation.includeField != null && relation.includeField == fieldName) ||
                 (relation.includeField == null && relation.displayField == fieldName) ||
                 (relation.origIncludeField != null && relation.origIncludeField == fieldName)))
            {
                if (relationsList.recordMarkedAsRemoved(i)) {
                    isRemovedField = true;
                } else {
                    if (ignoreRelation && recordsAreEqual(relation, ignoreRelation)) {
                        // Found matching field in the relations but it happens to be
                        // the relation being validated so we will assume that the field
                        // is not in use elsewhere.
                        return;   
                    }
                    localField = true;
                }
            }
        }

        if (!localField) {
            var getField = function (ds, fieldName) {
                if (isc.isA.DataSource(ds)) return ds.getField(fieldName);
                return ds.fields.find("name", fieldName);
            }
            localField = !isRemovedField && (getField(ds, fieldName) != null);
        }

        return localField;
    },

    getDataSourceDefaults : function (dsID, callback) {
        // we need the clean initialization data for this DataSource (the live data
        // contains various derived state)
        if (this.dsDefaults && this.dsDefaults.ID == dsID) {
            callback(dsID, this.dsDefaults);
            return;
        }

        isc.DataSourceEditor.fetchDataSourceDefaults(this.dsDataSource, dsID, callback);
    },

    addRelation : function () {
        // Start editing a new relation. No record in list yet.
        this.relationsList.deselectAllRecords();
        this.relationForm.editNewRecord();
    },

    saveNewRelation : function () {
        if (!this.relationForm.valuesAreValid(false)) return;

        this.saveRelation(this.relationForm.getValues(), true);
    },

    removeRelation : function (record) {
        var rowNum = this.relationsList.getRecordIndex(record);
        if (this.relationsList.recordMarkedAsRemoved(rowNum)) {
            // Restoring a removed relation could cause a conflict with another relation
            // fieldName. 
            if (record.dsId != this.dataSource.ID && record.type == "M-1") {
                var includeField = record.includeField || record.displayField;
                if (this.dsHasExistingField(this.dataSource, includeField)) {
                    // Existing field using the same name. It must have been added in another
                    // pending relation. Update either this relation if it not an original
                    // relation or the other relation to prevent the conflict.
                    if (rowNum < this.originalRelationsCount) {
                        // This restored relation is an original relation. It should continue
                        // to use the includeField value so the newer, added relation should
                        // be updated to use an alias.
                        var relationsList = this.relationsList,
                            relations = relationsList.data
                        ;
                        for (var i = 0; i < relations.length; i++) {
                            var relation = relations[i];
                            if (!relationsList.recordMarkedAsRemoved(i) &&
                                relation.dsId != this.dataSource.ID &&
                                relation.type == "M-1" &&
                                ((relation.includeField != null && relation.includeField == includeField) ||
                                (relation.includeField == null && relation.displayField == includeField) ||
                                (relation.origIncludeField != null && relation.origIncludeField == includeField)))
                            {
                                record = relation;
                                break;
                            }
                        }
                    } else {
                        // This restored relation has been added during this session so its
                        // alias can be changed directly.
                    }

                    // Create a new alias and assign it
                    var newIncludeField = record.dsId +
                            record.displayField.substring(0, 1).toUpperCase() +
                            record.displayField.substring(1),
                        baseIncludeField = newIncludeField,
                        count = 2
                    ;
                    while (this.dsHasExistingField(this.dataSource, newIncludeField)) {
                        newIncludeField = baseIncludeField + count++;
                    }
                    record.includeField = newIncludeField;

                    // If the updated relation is currently selected, refresh the selection
                    // so the edit form has updated values
                    if (this.relationsList.isSelected(record)) {
                        this.relationsList.deselectRecord(record);
                        this.relationsList.selectSingleRecord(record);
                    }
                }
            }
            this.relationsList.unmarkRecordRemoved(rowNum);
        } else {
            this.relationsList.markRecordRemoved(rowNum);
            this.addRelation();
        }
    },

    editRelation : function (record) {
        this.relationForm.editRecord(record);
    },

    saveRelation : function (record, isNew) {
        if (isNew) {
            // In saveLocally:true mode addData() is synchronous
            this.relationsList.addData(isc.addProperties({}, record));
            // Start a new relation to clear form entry. No relation is selected.
            this.addRelation();
        } else {
            var gridRecord = this.relationsList.getSelectedRecord(),
                rowNum = this.relationsList.getRecordIndex(gridRecord)
            ;
            // Update record in place
            isc.addProperties(gridRecord, record);
            if (!record.enableDisplayAs) delete gridRecord.displayField;
            delete gridRecord.enableDisplayAs;
            if (!record.enableNameAs) delete gridRecord.includeField;
            delete gridRecord.enableNameAs;
            delete gridRecord.required;
            this.relationsList.refreshRow(rowNum);
        }
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

        // First, warn if you have defined a new relation but not yet clicked "Add Relation"
        var _this = this;
        if (!this.addRelationButton.isDisabled()) {
            isc.ask("Save without adding the relationship?", function(value) {
                if (value) {
                    _this._saveClick();
                }
            });
        } else {
            this._saveClick();
        }
    },

    _saveClick : function () {
        if (this.readOnly) {
            // Nothing to save - same as canceling
            this.cancelClick();
        }
    
        // Accumulate list of FK field changes grouped by DataSource so they
        // can be applied together
        var relations = this.relationsList.data,
            changesByDataSource = {}
        ;

        // Determine if there are multiple relations that target the same DataSource.
        // For example Tasks->User (reportedBy) and Tasks->User (assignedTo).
        // In those cases, the includeFrom field but use an includeVia property to identify
        // the correct relation.
        var targetDSCounts = {};
        for (var i = 0; i < relations.length; i++) {
            var relation = relations[i],
                deleted = this.relationsList.recordMarkedAsRemoved(i)
            ;
            if (!deleted && relation.type == "M-1") {
                var targetDSId = relation.dsId;
                targetDSCounts[targetDSId] = (targetDSCounts[targetDSId] || 0) + 1;
            }
        }
        var isMultiTargetDS = function (dsId) {
            return (targetDSCounts[dsId] != null && targetDSCounts[dsId] > 1);
        };

        for (var i = 0; i < relations.length; i++) {
            var relation = relations[i];
            // Don't ignore read-only relations because a relation that targets a
            // non-existing DataSource should still be allowed to be removed.

            var deleted = this.relationsList.recordMarkedAsRemoved(i),
                changed = false
            ;
            if (deleted) {
                // If the relation to be deleted was added during this edit session
                // there is nothing else to do
                if (i >= this.originalRelationsCount) continue;

                relation = this.originalRelations[i];
            } else if (i < this.originalRelationsCount) {
                var origRelation = this.originalRelations[i];
                changed = (!this.relationsMatch(origRelation, relation) ||
                            (relation.type == 'M-1' && isMultiTargetDS(relation.dsId)));
                if (changed) {
                    // Determine if the change is a foreignKey field rename. If so, we don't
                    // want to remove the FK field completely and add a new one, but rather
                    // have the caller rename the field so values remain.
                    if (origRelation.fieldName != relation.fieldName) {
                        var dsId = relation.dsId,
                            ds = (dsId == this.dataSource.ID ? this.dataSource : isc.DS.get(dsId))
                        ;
                        if (!ds.getField(relation.fieldName)) {
                            relation.renameFrom = origRelation.fieldName;
                        }
                    }

                    if (!relation.renameFrom) {
                        // Changed relation - register a change to remove the original relation
                        this.saveRelationChange(changesByDataSource, origRelation, true);
                    }
                }

                // If relation didn't change and no extra fields did either, go to next change
                if (!changed && this.relationExtrasMatch(origRelation, relation)) continue;
                changed = true;
            }

            this.saveRelationChange(changesByDataSource, relation, deleted, isMultiTargetDS(relation.dsId));

            // Save list of new relations for later notifications
            if (!changed && !deleted) {
                if (!this._newRelations) this._newRelations = {};
                this._newRelations[relation.dsId] = relation;
            }
        }

        if (!isc.isAn.emptyObject(changesByDataSource)) {
            var _this = this;
            for (var sourceDSId in changesByDataSource) {
                var changes = changesByDataSource[sourceDSId];

                this.updateForeignKeys(sourceDSId, changes, function (dsId, defaults) {
                    // Hold on to all changes to DS defaults to be saved later
                    if (!_this.pendingSaves) _this.pendingSaves = {};
                    if (defaults) _this.pendingSaves[dsId] = defaults;

                    delete changesByDataSource[dsId];
                    // When all changes have been applied fire the callback passed in when editing began
                    if (isc.isAn.emptyObject(changesByDataSource)) {
                        if (_this.saveCallback) {
                            _this.fireCallback(_this.saveCallback, "defaults",
                                [_this.pendingSaves[_this.dsDefaults.ID]]);
                            _this.saveCallback = null;
                        }
                    }
                });
            }
        } else if (this.pendingSaves && !isc.isAn.emptyObject(this.pendingSaves)) {
            // No PK/FK changes but there are outstanding changes to save (i.e. DS conversion)
            this.fireCallback(this.saveCallback, "defaults",
                [this.pendingSaves[this.dsDefaults.ID]]);
            this.saveCallback = null;
        } else {
            // Nothing to save - same as canceling
            this.cancelClick();
        }
    },

    relationsMatch : function (origRelation, relation) {
        var match = (origRelation.dsId == relation.dsId &&
            origRelation.type == relation.type &&
            origRelation.fieldName == relation.fieldName &&
            origRelation.joinType == relation.joinType);
        return match;
    },

    relationExtrasMatch : function (origRelation, relation) {
        var match = (origRelation.fieldTitle == relation.fieldTitle &&
            origRelation.displayField == relation.displayField &&
            origRelation.includeField == relation.includeField);
        return match;
    },

    saveRelationChange : function (changesByDataSource, relation, deleted, forceIncludeVia) {
        var type = relation.type,
            sourceDSId = ("1-M" == type ? relation.dsId : this.dataSource.ID),
            targetDSId = (type == "1-M" ? this.dataSource.ID : relation.dsId),
            sourceFieldTitle = relation.fieldTitle,
            includeField = relation.includeField,
            includeVia
        ;
        if (!deleted && relation.displayField) {
            var sourceDS = (sourceDSId == this.dataSource.ID ? this.dataSource : isc.DS.get(sourceDSId));

            // If include is by includeVia force an alias for the includeField and mark it as such
            if (forceIncludeVia) {
                includeField = relation.fieldName +
                    relation.displayField.substring(0, 1).toUpperCase() +
                    relation.displayField.substring(1);
                includeVia = relation.fieldName;
            } else {
                // Introduce an alias based on the title or target DS and field name
                includeField = (sourceFieldTitle ?
                                isc.DataSourceEditor.createNameFromTitle(sourceFieldTitle) :
                                targetDSId + relation.displayField.substring(0, 1).toUpperCase() +
                                    relation.displayField.substring(1));
            }

            // If the fieldname created from the sourceFieldTitle is in use, rather than
            // using the numeric suffix to make unique, create the name from the targetDSId
            // and make sure that is unique. Note also that the field could match that of
            // the relation itself.
            if (sourceFieldTitle &&
                (this.dsHasExistingField(sourceDS, includeField, relation) ||
                 sourceDSId == this.dataSource.ID && relation.fieldName == includeField))
            {
                includeField = targetDSId +
                                includeField.substring(0, 1).toUpperCase() +
                                includeField.substring(1);
            }

            var baseIncludeField = includeField,
                count = 2
            ;
            while (this.dsHasExistingField(sourceDS, includeField, relation)) {
                includeField = baseIncludeField + count++;
            }
        }

        if (!changesByDataSource[sourceDSId]) changesByDataSource[sourceDSId] = [];
        changesByDataSource[sourceDSId].add({
            sourceDSId: sourceDSId,
            sourceFieldName: relation.fieldName,
            sourceFieldTitle: relation.fieldTitle,
            targetDSId: targetDSId,
            targetFieldName: relation.relatedFieldName,
            displayField: relation.displayField,
            includeField: includeField,
            includeVia: includeVia,
            joinType: relation.joinType,
            deleted: deleted,
            renameFrom: relation.renameFrom
        });
    },

    updateForeignKeys : function (sourceDSId, changes, callback) {
        // we need the clean initialization data for this DataSource (the live data
        // contains various derived state)
        var self = this;
        var sourceChanges = changes;

        // If we've already updated the DS and saved in pendingSaves, update that DS
        if (this.pendingSaves && this.pendingSaves[sourceDSId]) {
            self._updateForeignKeys(this.pendingSaves[sourceDSId], sourceChanges, callback);
        } else {
            // Pull DS defaults and update them
            this.getDataSourceDefaults(sourceDSId, function (dsId, defaults) {
                self._updateForeignKeys(defaults, sourceChanges, callback);
            });
        }
    },

    _updateForeignKeys : function (defaults, changes, callback) {
        var sourceDSId = defaults.ID,
            sourceDS = (sourceDSId == this.dsDefaults.ID ? this.dataSource : isc.DS.get(sourceDSId))
        ;

        // Determine if there are multiple relations that target the same DataSource.
        // For example Tasks->User (reportedBy) and Tasks->User (assignedTo).
        // In those cases, the includeFrom field but use an includeVia property to identify
        // the correct relation.
        var targetDSCounts = {};
        for (var i = 0; i < changes.length; i++) {
            var change = changes[i],
                targetDSId = change.targetDSId
            ;
            if (!change.deleted && (change.includeField || change.displayField)) {
                targetDSCounts[targetDSId] = (targetDSCounts[targetDSId] || 0) + 1;
            }
        }
        var isMultiTargetDS = function (dsId) {
            return (targetDSCounts[dsId] != null && targetDSCounts[dsId] > 1);
        };

        for (var i = 0; i < changes.length; i++) {
            var change = changes[i],
                sourceFieldName = change.sourceFieldName,
                sourceFieldTitle = change.sourceFieldTitle,
                renameFrom = change.renameFrom,
                targetDSId = change.targetDSId,
                targetFieldName = change.targetFieldName,
                targetDS = (targetDSId == this.dsDefaults.ID ? this.dataSource : isc.DS.get(targetDSId)),
                joinType = change.joinType,
                changed = false
            ;
            var targetPK = targetDS && targetDS.getPrimaryKeyField(),
                targetPKName = targetDS && targetDS.getPrimaryKeyFieldName()
            ;
            if (!targetFieldName) targetFieldName = targetPKName;

            // foreignKey value - doesn't need <dataSourceId> for self-relation
            var fk = (sourceDSId != targetDSId ? targetDSId + "." : "") + targetFieldName;

            // See if sourceFieldName exists
            var sourceField = defaults.fields.find("name", renameFrom || sourceFieldName);
            if (!sourceField) {
                // Need to create the sourceField FK
                var type = targetPK.type;
                if (type == "sequence") type = "integer";
                var field = { name: sourceFieldName, type: type, foreignKey: fk };
                if (sourceFieldTitle) field.title = sourceFieldTitle;
                if (joinType) field.joinType = joinType;
                defaults.fields.add(field);
                sourceField = field;
                changed = true;
                // record the newly generated field
                isc.RelationEditor.addGeneratedField(sourceDS, sourceFieldName);
            } else {
                // sourceField exists. See if FK needs to be updated or removed
                if (change.deleted && sourceField.foreignKey == fk) {
                    // only delete field if it was added during this Reify "session".
                    // otherwise, drop the foreignKey property only.
                    if (isc.RelationEditor.isGeneratedField(sourceDS, sourceField.name)) {
                        defaults.fields.remove(sourceField);
                        isc.RelationEditor.removeGeneratedField(sourceDS, sourceField.name);
                    } else {
                        delete sourceField.foreignKey;
                        delete sourceField.joinType;
                    }
                    changed = true;
                } else if (!sourceField.foreignKey ||
                    sourceField.foreignKey != fk ||
                    sourceField.joinType != joinType)
                {
                    var type = targetPK.type;
                    if (type == "sequence") type = "integer";
                    sourceField.type = type;
                    sourceField.foreignKey = fk;
                    if (!joinType) delete sourceField.joinType;
                    else sourceField.joinType = joinType;
                    changed = true;
                }
                if (sourceField.title != sourceFieldTitle) {
                    sourceField.title = sourceFieldTitle;
                    changed = true;
                }
                if (sourceField.name != sourceFieldName) {
                    sourceField.name = sourceFieldName;
                    // Set flag on field so DS Editor can identify that this isn't a new
                    // field but rather it is to be renamed
                    sourceField._renameFrom = renameFrom;
                    changed = true;
                }
                if (sourceField.displayField != (change.includeField || change.displayField)) {
                    var oldDisplayFieldIndex = defaults.fields.findIndex("name", sourceField.displayField);
                    if (oldDisplayFieldIndex >= 0) {
                        defaults.fields.removeAt(oldDisplayFieldIndex);
                        changed = true;
                    }
                }
            }
            if (change.deleted) {
                // Remove any invalid includeFrom fields now that a relation is deleted
                var fields = defaults.fields;
                if (fields) {
                    var includeFromPrefix = targetDSId + ".",
                        removedIncludeFields = []
                    ;
                    for (var j = fields.length-1; j >= 0; j--) {
                        var field = fields[j];
                        if (field.includeFrom && field.includeFrom.startsWith(includeFromPrefix)) {
                            fields.removeAt(j);
                            removedIncludeFields.add(field.name || field.includeFrom.replace(includeFromPrefix, ""));
                            changed = true;
                        }
                    }
                    // Remove an displayField references to removed includeFrom fields
                    for (var j = 0; j < removedIncludeFields.length; j++) {
                        var includeFrom = removedIncludeFields[j],
                            referencedFields = fields.findAll("displayField", includeFrom)
                        ;
                        if (referencedFields && referencedFields.length > 0) {
                            referencedFields.map(function (field) {
                                delete field.displayField;
                            });
                        }
                    }
                }
            }
            // Create/update FK displayField and/or includeFrom fields
            if (!change.deleted && (change.includeField || change.displayField)) {
                var displayField = change.includeField || change.displayField,
                    includeFrom = targetDSId + "." + change.displayField
                ;
                if (change.displayField) {
                    if (sourceField.displayField != displayField) {
                        sourceField.displayField = displayField;
                        changed = true;
                    }
                } else if (sourceField.displayField) {
                    delete sourceField.displayField;
                    changed = true;
                }

                var includeFromField = defaults.fields.find("name", displayField);
                if (!includeFromField && !isMultiTargetDS(targetDSId)) {
                    // An includeFrom field may not have a "name" attribute so we
                    // need to look for includeFrom="<targetDSId>.<name>" as well.
                    includeFromField = defaults.fields.find("includeFrom", includeFrom);
                }
                if (includeFromField) {
                    // includeFrom field already exists. Leave it as-is or update the name.
                    if (change.includeField) {
                        if (includeFromField.name != change.includeField) {
                            includeFromField.name = change.includeField;
                            changed = true;
                        }
                    } else if (includeFromField.name) {
                        delete includeFromField.name;
                        changed = true;
                    }
                    if (includeFromField.includeFrom != includeFrom) {
                        includeFromField.includeFrom = includeFrom;
                        changed = true;
                    }
                } else {
                    // Create includeFrom field for the displayField. Since the includeFrom
                    // is used as displayField for the FK default it to hidden.
                    var field = { includeFrom: includeFrom, hidden: true };
                    if (change.includeField) {
                        field.name = change.includeField;
                    }
                    if (change.includeVia) {
                        field.includeVia = change.includeVia;
                    }
                    defaults.fields.add(field);
                    sourceField = field;
                    changed = true;
                }
            }
            
        }
        callback(sourceDS.ID, (changed ? defaults : null));
    },

    switchToEditFieldsAndDataSeparately : function (dataSource, callback) {
        var _this = this;
        this.getDataSourceDefaults(dataSource.ID, function (dsId, defaults) {
            // DataSource instance has derived fields from the mockData. Pull those fields.
            var fieldNames = dataSource.getFieldNames(),
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
            var mockData = _this._getMockDataRecords(dataSource.mockData, dataSource.mockDataFormat);
            if (mockData) {
                var guesser = isc.SchemaGuesser.create({ detectPrimaryKey: true });
                guesser.dataSourceName = dataSource.ID;
                guesser.detectPrimaryKey = true;

                var guessedFields = guesser.extractFieldsFrom(mockData),
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
            defaults.fields = fields;
            defaults.cacheData = dataSource.cacheData;
            delete defaults.mockData;
            delete defaults.mockDataFormat;

            callback(defaults);
        });
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
    }
});

//> @class SimpleTreeRelationEditor
// Provides a UI for editing a +link{DataSource, DataSources) tree relationship.
// 
// @inheritsFrom VLayout
// @visibility devTools
//<
isc.ClassFactory.defineClass("SimpleTreeRelationEditor", "VLayout");

isc.SimpleTreeRelationEditor.addProperties({
    // attributes 
    overflow: "visible",
    membersMargin: 10,
    layoutTopMargin: 5,
    layoutLeftMargin: 5,
    layoutRightMargin: 5,
    // Not setting bottom margin so buttons are placed to match other windows

    // properties

    //> @attr simpleTreeRelationEditor.dsDataSource (DataSource | ID : null : IRW)
    // DataSource to be used to load and save ds.xml files, via fileSource operations.
    //
    // @visibility devTools
    //<

    // Component properties

    //> @attr simpleTreeRelationEditor.relationForm (AutoChild DynamicForm : null : IRW)
    //
    // @visibility devTools
    //<
    relationFormDefaults: {
        _constructor: "DynamicForm",
        autoDraw:false,
        autoFocus:true,
        wrapItemTitles:false,
        colWidths: [ 250, "*" ],
        fields: [
           { name: "fieldName", type: "text", title: "Relation will be stored on<br>DataSource under field",
                wrapTitle: true, required: true, selectOnFocus: true,
                editorType: "ComboBoxItem", addUnknownValues: true,
                validators: [
                    {
                        type:"custom",
                        condition: function (item, validator, value, record, additionalContext) {
                            if (!value || (record.origFieldName && record.origFieldName == value)) return true;

                            // Validate that if the field name is an existing field that it
                            // has the same type as the target PK and that the field name
                            // is not the PK of a Self relation (invalid relation).
                            var ds = item.form.creator.dataSource,
                                field = ds.getField(value),
                                valid = true
                            ;
                            if (field && field.primaryKey) {
                                validator.defaultErrorMessage 
                                    = "The Primary Key cannot relate to it itself in a tree relation";
                                valid = false;
                            }

                            if (field && valid) {
                                var fieldType = field.type,
                                    pkField = ds.getPrimaryKeyField(),
                                    pkFieldType = pkField.type
                                ;
                                if ((fieldType == "sequence" ? "integer" : fieldType) !=
                                    (pkFieldType == "sequence" ? "integer" : pkFieldType))
                                {
                                    validator.defaultErrorMessage 
                                        = "Value matches an existing field that has a type " +
                                            "that differs from the target primary key in " + ds.ID +
                                            ". Please choose another field name.";
                                    valid = false;
                                }
                            }

                            return valid;
                        }
                    }
                ]
            }
        ],
        editNewRecord : function () {
            this.Super("editNewRecord", arguments);
            this.updateFieldNameTitle();
            this.updateFieldNameChoices();
            this.updateFieldNameValue();
        },
        fieldNameTitle: "Relation will be stored on<br>DataSource '${dsId}' under field",
        updateFieldNameTitle : function () {
            var dsId = this.creator.dataSource.ID,
                title = this.fieldNameTitle.evalDynamicString(this, { dsId: dsId })
            ;
            this.getField("fieldName").title = title;
            this.getField("fieldName").redraw();
        },
        updateFieldNameChoices : function () {
            // Populate the comboBox with existing field names from DS. Only show fields
            // that have the same type as the DS and are not already foreign keys. Don't
            // provide the PK field as an option. The PK cannot reference itself - 
            // the relation is invalid.
            var ds = this.creator.dataSource,
                dsFieldNames = ds.getFieldNames(),
                pkField = ds.getPrimaryKeyField(),
                pkFieldType = pkField.type,
                valueMap = []
            ;
            if (pkFieldType == "sequence") pkFieldType = "integer";

            for (var i = 0; i < dsFieldNames.length; i++) {
                var dsFieldName = dsFieldNames[i],
                    field = ds.getField(dsFieldName),
                    fieldType = (field.type == "sequence" ? "integer" : field.type)
                ;
                if (fieldType == pkFieldType && !field.primaryKey && !field.foreignKey) {
                    valueMap.add(field.name);
                }
            }
            this.getField("fieldName").setValueMap(valueMap);
        },
        updateFieldNameValue : function () {
            var ds = this.creator.dataSource;

            // A title is likely singular so use it if defined
            var dsTitle = (ds.title || ds.ID).replace(/ /g, ""),
                baseValue = "parent" + dsTitle.substring(0, 1).toUpperCase() + dsTitle.substring(1) + "Id",
                value = baseValue,
                count = 2
            ;
            // Make sure default field name is unique
            while (ds.getField(value) != null) {
                value = baseValue + count;
                count++;
            }
            this.setValue("fieldName", value);
        }
    },

    buttonLayoutDefaults: {
        _constructor: "HLayout",
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

    bodyProperties:{
        overflow:"auto",
        layoutMargin:10
    },

    // methods

    initWidget : function () {
        this.Super('initWidget', arguments);

        this.addAutoChildren(["relationForm","buttonLayout"]);
        this.buttonLayout.addMember(this.createAutoChild("cancelButton"));
        this.buttonLayout.addMember(this.createAutoChild("saveButton"));
    },

    // api

    //> @method simpleTreeRelationEditor.edit()
    // Start editing relation for a DataSource.
    // 
    // @param dataSource (Object | DataSource | ID) dataSource or defaults to edit relation
    // @param [callback] (Function) function to call after save
    // @visibility devTools
    //<
    edit : function (dataSource, callback) {
        this.dsDefaults = null;
        if (!isc.isA.DataSource(dataSource) && isc.isAn.Object(dataSource)) {
            // Passed in defaults
            var defaults = isc.clone(dataSource);

            var existingDSId = defaults.ID;

            // Create an actual instance of DS for reference. If the DS is readOnly
            // in the DS Editor we don't want to create an override class that may
            // break the current project.
            defaults.addGlobalId = false;
            delete defaults.ID;
            var dsClass = dataSource._constructor || "DataSource";
            dataSource = isc.ClassFactory.getClass(dsClass).create(defaults, {
                sourceDataSourceID: this.dsDataSource.ID
            });
            dataSource.ID = existingDSId;
            delete defaults.addGlobalId;
            defaults.ID = existingDSId;

            this.dsDefaults = defaults;
        }
        this.dataSource = isc.DS.get(dataSource);

        // to be called when editing completes
        this.saveCallback = callback;

        if (isc.isA.MockDataSource(this.dataSource) && !this.dataSource.hasExplicitFields()) {
            var pendingChange = this.getPendingChange(this.dataSource.ID);
            if (!pendingChange || !pendingChange.fields) {
                var _this = this;
                this.waitUntilDrawn(function (dataSource, callback) {
                    _this.confirmConvertSampleDataMockDataSource(dataSource, function (defaults) {
                        _this.edit(defaults, callback);
                    });
                }, [dataSource, callback]);
                return;
            }
        }

        if (!this.dsDefaults) {
            var self = this;
            this.getDataSourceDefaults(this.dataSource.ID, function (dsId, defaults, readOnly) {
                if (readOnly) self.readOnly = true;
                // Save defaults for editing
                self.dsDefaults = defaults;
                self.start();
            });
        } else {
            this.start();
        }
    },

    // Used by DataSourceEditor to pull details on pending saves when refreshing its
    // copy of the DSRelations
    getPendingChange : function (dsId) {
        return (this.pendingSaves ? this.pendingSaves[dsId] : null);
    },

    //> @method simpleTreeRelationEditor.save()
    // Save all pending changes to +link{dsDataSource}.
    // 
    // @param [callback] (Function) function to call after save
    // @visibility devTools
    //<
    save : function (callback) {
        if (!this.pendingSaves || isc.isAn.emptyObject(this.pendingSaves)) {
            this.fireCallback(callback, "dsList,nextDataSource", [null,this.nextDataSource]);
            return;
        }

        var _this = this,
            dsList = isc.getKeys(this.pendingSaves),
            saveCount = 0
        ;
        var fireCallback = function () {
            if (--saveCount <= 0) {
                // Reload the saved DataSource instance
                isc.DataSource.load(dsId, function() {
                    _this.fireCallback(callback, "dsList,nextDataSource", [dsList,_this.nextDataSource]);
                    _this.nextDataSource = null;
                }, true, true);
            }
        };

        for (var dsId in this.pendingSaves) {
            var defaults = this.pendingSaves[dsId];

            // handle custom subclasses of DataSource for which there is no schema defined by
            // serializing based on the DataSource schema but adding the _constructor property to
            // get the correct class.
            // XXX problem: if you ask an instance to serialize itself, and there is no schema for
            // it's specific class, it uses the superClass schema but loses it's Constructor
            // XXX we to preserve the class, we need to end up with the "constructor" property set
            // in XML, but this has special semantics in JS
            var dsClass = defaults._constructor || "DataSource",
                schema;
            if (isc.DS.isRegistered(dsClass)) {
                schema = isc.DS.get(dsClass);
            } else {
                schema = isc.DS.get("DataSource");
                defaults._constructor = dsClass;
            }

            // serialize to XML and save to server
            var xml = schema.xmlSerialize(defaults);
            // this.logWarn("saving DS with XML: " + xml);

            saveCount++;

            this.dsDataSource.saveFile({
                fileName: defaults.ID,
                fileType: "ds",
                fileFormat: "xml"
            }, xml, function() {
                fireCallback();
            }, {
                // DataSources are always shared across users - check for existing file to
                // overwrite without regard to ownerId
                operationId: "allOwners"
            });
        }

        // If there was nothing to save, let caller know
        if (saveCount == 0) {
            fireCallback();
        }
    },

    waitUntilDrawn : function (callback, params) {
        if (!this.isDrawn()) {
            this._untilDrawnDetails = {
                callback: callback,
                params: params
            };
            this.observe(this, "drawn", "observer._waitUntilDrawn();");
            return;
        }
        this.fireCallback(callback, null, params);
    },

    _waitUntilDrawn : function () {
        if (this.isObserving(this, "drawn")) this.ignore(this, "drawn");
        var callback = this._untilDrawnDetails.callback,
            params = this._untilDrawnDetails.params
        ;
        delete this._untilDrawnDetails;

        this.fireCallback(callback, null, params);
    },

    confirmConvertSampleDataMockDataSource : function (dataSource, callback) {
        var _this = this,
            dsId = dataSource.ID
        ;
        var message = "To create a relation with this DataSource, it must be converted " +
            "from sample data to editing fields and data separately.  Do this now?"

        isc.ask(message, function(response) {
            if (response) {
                _this.switchToEditFieldsAndDataSeparately(dataSource, function (defaults) {
                    if (!_this.pendingSaves) _this.pendingSaves = {};
                    _this.pendingSaves[dsId] = defaults;
                    callback(defaults);
                });
            } else {
                _this.cancelClick();
            }
        }, {
            buttons: [
                isc.Dialog.NO,
                isc.Dialog.YES
            ]
        });
        // Make sure dialog is above editor window
        isc.Dialog.Warn.delayCall("bringToFront");
    },

    start : function () {
        // this.dsDefaults and this.dataSource are both populated at this point

        // Always start with editing a new relation in the lower form
        this.relationForm.editNewRecord();
    },

    getDataSourceDefaults : function (dsID, callback) {
        // we need the clean initialization data for this DataSource (the live data
        // contains various derived state)
        if (this.dsDefaults && this.dsDefaults.ID == dsID) {
            callback(dsID, this.dsDefaults);
            return;
        }

        isc.DataSourceEditor.fetchDataSourceDefaults(this.dsDataSource, dsID, callback);
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
        if (!this.relationForm.validate()) return;

        var _this = this,
            relation = this.relationForm.getValues(),
            sourceDS = this.dataSource,
            targetDS = this.dataSource,
            targetPK = targetDS.getPrimaryKeyField(),
            targetPKName = targetDS.getPrimaryKeyFieldName(),
            targetFieldName = targetPKName,
            sourceDSId = sourceDS.ID,
            sourceFieldName = relation.fieldName,
            targetDSId = targetDS.ID
        ;

        // Pull DS defaults and update them
        this.getDataSourceDefaults(sourceDSId, function (dsId, defaults) {
            var fk = targetDSId + "." + targetFieldName;

            var type = targetPK.type;
            if (type == "sequence") type = "integer";
            var field = { name: sourceFieldName, type: type, foreignKey: fk, hidden: true };
            defaults.fields.add(field);

            if (!_this.pendingSaves) _this.pendingSaves = {};
            _this.pendingSaves[dsId] = defaults;

            // Fire the callback passed in when editing began
            if (_this.saveCallback) {
                _this.fireCallback(_this.saveCallback, "defaults",
                    [_this.pendingSaves[_this.dsDefaults.ID]]);
                _this.saveCallback = null;
            }
        });
    },

    switchToEditFieldsAndDataSeparately : function (dataSource, callback) {
        var _this = this;
        this.getDataSourceDefaults(dataSource.ID, function (dsId, defaults) {
            // DataSource instance has derived fields from the mockData. Pull those fields.
            var fieldNames = dataSource.getFieldNames(),
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
            var mockData = _this._getMockDataRecords(dataSource.mockData, dataSource.mockDataFormat);
            if (mockData) {
                var guesser = isc.SchemaGuesser.create({ detectPrimaryKey: true });
                guesser.dataSourceName = dataSource.ID;
                guesser.detectPrimaryKey = true;

                var guessedFields = guesser.extractFieldsFrom(mockData),
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
            defaults.fields = fields;
            defaults.cacheData = dataSource.cacheData;
            delete defaults.mockData;
            delete defaults.mockDataFormat;

            callback(defaults);
        });
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
    }
});

}

isc.ClassFactory.defineClass("DSRelations");

isc.DSRelations.addClassProperties({
    relationTypeDescriptionMap: {
        "1-M": "1-to-many",
        "M-1": "many-to-1",
        "Self": "tree self-relation"
    }
});

isc.DSRelations.addMethods({

    //> @attr dsRelations.dsDataSource (DataSource | ID : null : IRW)
    // DataSource to be used to load and save ds.xml files, via fileSource operations.
    //<

    //> @attr dsRelations.dataSources (Array of DataSource : null : IRW)
    // List of DataSources from which to determine relations.
    //<
    setDataSources : function (dsList) {
        this.dataSources = dsList;
        this.reset();
    },

    // Clear relations cache so it will be rebuilt on next request
    reset : function () {
        delete this._rawRelations;
    },

    getRelationsForDataSource : function (name) {
        this.buildRelations();

        // grab list of direct FKs and build a map of indirect FKs
        var rawRelations = this._rawRelations,
            directFKs = rawRelations[name],
            indirectFKs = {}
        ;
        for (var dsName in rawRelations) {
            if (dsName == name) continue;
            var fks = rawRelations[dsName];
            for (var i = 0; i < fks.length; i++) {
                var fk = fks[i];
                if (fk.relatedDS == name) {
                    if (!indirectFKs[dsName]) indirectFKs[dsName] = [];
                    indirectFKs[dsName].add(fk);
                }
            }
        }

        var relations = [];

        // For direct FKs, define specified relationships
        if (directFKs) {
            for (var i = 0; i < directFKs.length; i++) {
                var fk = directFKs[i],
                    type = (name == fk.relatedDS ? "Self" : "M-1"),
                    displayField = fk.displayField
                ;

                relations.add({
                    type: type,
                    fieldName: fk.fieldName,
                    fieldTitle: fk.fieldTitle,
                    dsId: fk.relatedDS,
                    relatedFieldName: fk.relatedFieldName,
                    displayField: displayField,
                    joinType: fk.joinType
                })
            }
        }

        // Define relationships for indirect FKs
        for (var dsName in indirectFKs) {
            var fks = indirectFKs[dsName];
            for (var i = 0; i < fks.length; i++) {
                var fk = fks[i];
                relations.add({
                    type: "1-M",
                    fieldName: fk.fieldName,
                    fieldTitle: fk.fieldTitle,
                    dsId: dsName,
                    relatedFieldName: fk.relatedFieldName,
                    displayField: fk.displayField,
                    joinType: fk.joinType
                })
            }
        }
        return relations;
    },

    getAllRelationsForDataSource : function (name) {
        this.buildRelations();

        var relations = this.getRelationsForDataSource(name);
        do {
            var newRelations = [];
            for (var i = 0; i < relations.length; i++) {
                var relation = relations[i],
                    subRelations = this.getRelationsForDataSource(relation.dsId)
                ;
                if (subRelations && subRelations.length > 0) {
                    // Make sure to exclude sub-relations that point back to a this DS or
                    // that have already been added.
                    for (var j = 0; j < subRelations.length; j++) {
                        var subRelation = subRelations[j];
                        if (subRelation.dsId != name &&
                            !relations.find("dsId", subRelation.dsId) &&
                            !newRelations.find("dsId", subRelation.dsId))
                        {
                            subRelation.parentDsId = relation.dsId;
                            newRelations.add(subRelation);
                        }
                    }
                }
                if (!relation.parentDsId) relation.parentDsId = name;
            }
            relations.addList(newRelations);
        } while (newRelations.length > 0);

        return relations;
    },

    getIncludeFromDependencyTree : function () {
        var dsList = this.dataSources,
            dependsOn = {}
        ;
        for (var i = 0; i < dsList.length; i++) {
            var ds = dsList[i],
                dsName = ds.ID,
                fieldNames = ds.getFieldNames()
            ;
            var dependencies = dependsOn[dsName] = [];
            for (var j = 0; j < fieldNames.length; j++) {
                var fieldName = fieldNames[j],
                    field = ds.getField(fieldName)
                ;
                if (field && field.includeFrom) {
                    var split = field.includeFrom.split(".");
                    if (split && split.length >= 2) {
                        dependencies.add(split[0]);
                    }
                }
            }
        }

        var nodes = [];
        for (var i = 0; i < dsList.length; i++) {
            var dsName = dsList[i].ID,
                dependencies = dependsOn[dsName]
            ;
            if (!dependencies || dependencies.length == 0) {
                nodes.add({ id: dsName });
                this._addDependenciesToNode(nodes, dsName, dependsOn);
            } else {
                var foundDS = false;
                for (var j = 0; j < dependencies.length; j++) {
                    if (isc.DS.get(dependencies[j])) {
                        foundDS = true;
                        break;
                    }
                }
                if (!foundDS) {
                    nodes.add({ id: dsName });
                    this._addDependenciesToNode(nodes, dsName, dependsOn);
                }
            }
        }

        return isc.Tree.create({
            data: nodes
        });
    },

    _addDependenciesToNode : function (nodes, parentId, dependsOn) {
        for (var key in dependsOn) {
            var list = dependsOn[key];
            if (list && list.contains(parentId) && !nodes.containsProperty("id", key)) {
                nodes.add({ id: key, parentId: parentId });
                this._addDependenciesToNode(nodes, key, dependsOn);
            }
        }
    },

    // Update includeFrom field references to <dsName>.<fieldRenames>.
    // callback(updatedDataSourceNames) is called after updates have been saved
    // and the affected DataSources have been recreated.
    updateIncludeFromReferences : function (dsName, fieldRenames, callback) {
        var dsList = this.dataSources,
            changes = {}
        ;
        for (var i = 0; i < dsList.length; i++) {
            var ds = dsList[i],
                fieldNames = ds.getFieldNames()
            ;
            for (var j = 0; j < fieldNames.length; j++) {
                var fieldName = fieldNames[j],
                    field = ds.getField(fieldName)
                ;
                if (field && field.includeFrom) {
                    for (var fromName in fieldRenames) {
                        if (dsName == ds.ID && field.includeFrom == fromName) {
                            if (changes[ds.ID] == null) changes[ds.ID] = {};
                            changes[ds.ID][fieldName] = fieldRenames[fromName];
                        } else if (field.includeFrom == dsName + "." + fromName) {
                            if (changes[ds.ID] == null) changes[ds.ID] = {};
                            changes[ds.ID][fieldName] = dsName + "." + fieldRenames[fromName];
                        }
                    }
                }
            }
        }
        if (changes && !isc.isAn.emptyObject(changes)) {
            var self = this,
                updatedDataSourceNames = isc.getKeys(changes),
                pendingChangeCount = updatedDataSourceNames.length
            ;
            for (var dsName in changes) {
                isc.DataSourceEditor.fetchDataSourceDefaults(this.dsDataSource, dsName, function (dsId, defaults) {
                    var fieldChanges = changes[dsId],
                        fields = defaults.fields
                    ;
                    for (var i = 0; i < fields.length; i++) {
                        var field = fields[i],
                            fieldName = field.name
                        ;
                        // if includeFrom is set, but name isn't pick up name from includeFrom property
                        if (!fieldName && field.includeFrom != null) {
                            var split = field.includeFrom.split(".");
                            if (split != null && split.length >= 2) {
                                fieldName = split.last();
                            }
                        }

                        if (!fieldName) continue;

                        if (fieldChanges[fieldName] != null && field.includeFrom) {
                            field.includeFrom = fieldChanges[fieldName];
                        }
                    }

                    // Save the update DS configuration
                    self.saveDataSource(defaults, function () {
                        // Create a new live instance with changes applied
                        var dsClass = defaults._constructor || "DataSource";
                        isc.ClassFactory.getClass(dsClass).create(defaults, {
                            sourceDataSourceID: self.dsDataSource.ID
                        });

                        if (--pendingChangeCount == 0) {
                            if (callback) callback(updatedDataSourceNames);
                        }
                    });
                });
            }
        } else {
            if (callback) callback(updatedDataSourceNames);
        }
    },

    removeRelationsToDataSource : function (sourceDS, targetDSId, callback) {
        var fkFields = this.getForeignKeyFields(sourceDS),
            isRelatedToTarget = false
        ;
        // Confirm that sourceDS has relations to targetDSId before loading defaults
        // which requires a server round-trip
        if (!isc.isAn.emptyObject(fkFields)) {
            for (var fieldName in fkFields) {
                var fkField = fkFields[fieldName],
                    foreignKey = fkField.foreignKey
                ;
                if (foreignKey.indexOf(".") >= 0) foreignKey = foreignKey.split(".")[0];
                if (foreignKey == targetDSId) {
                    isRelatedToTarget = true;
                    break;
                }
            }
        }
        if (!isRelatedToTarget) {
            callback();
            return;
        }

        // source is related to target
        var self = this;
        isc.DataSourceEditor.fetchDataSourceDefaults(this.dsDataSource, sourceDS.ID, function (dsId, defaults) {
            var fieldsToRemove = [];

            // Remove foreignKey and includeFrom field references to target
            var fields = defaults.fields;
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (field.foreignKey) {
                    var name = field.foreignKey;
                    if (name.indexOf(".") >= 0) name = name.split(".")[0];
                    if (name == targetDSId) fieldsToRemove.add(field);
                }
                if (field.includeFrom) {
                    var name = field.includeFrom,
                        split = name.split(".")
                    ;
                    if (split && split.length >= 2) {
                        name = split[split.length-2];
                    }
                    if (name == targetDSId) {
                        fieldsToRemove.add(field);
                    }
                }
            }
            // Shouldn't occur but if no field was removed we are done
            if (fieldsToRemove.length == 0) {
                callback();
                return;
            }

            fields.removeList(fieldsToRemove);
            self.saveDataSource(defaults, callback);
        });
    },

    buildRelations : function () {
        if (this._rawRelations) return;

        var dsList = this.dataSources || [],
            rawRelations = {}
        ;
        // build map of all known DataSources and FK relations
        var self = this;
        dsList.map(function (ds) {
            if (!ds) return;
            var fkFields = self.getForeignKeyFields(ds);
            if (!isc.isAn.emptyObject(fkFields)) {
                for (var fieldName in fkFields) {
                    var field = fkFields[fieldName],
                        fieldTitle = (field.title && field.title != isc.DS.getAutoTitle(fieldName) ? field.title : null),
                        relatedFieldName = isc.DS.getForeignFieldName(field),
                        relatedDS = isc.DS.getForeignDSName(field, ds)
                    ;
                    if (!rawRelations[ds.ID]) rawRelations[ds.ID] = [];
                    rawRelations[ds.ID].add({
                        fieldName: fieldName,
                        fieldTitle: fieldTitle,
                        foreignKey: field.foreignKey,
                        relatedDS: (relatedDS ? relatedDS : null),
                        relatedFieldName: relatedFieldName,
                        displayField: field.displayField,
                        joinType: field.joinType
                    });
                }
            }
        });

        this._rawRelations = rawRelations;
    },

    getForeignKeyFields : function (ds) {
        var fields = ds.fields,
            foreignKeyFields = {}
        ;
        for (var fieldName in fields) {
            var field = fields[fieldName];
            if (field.foreignKey) {
                foreignKeyFields[field.name] = field;
            }
        }
        return foreignKeyFields;
    },

    saveDataSource : function (defaults, callback) {
        // handle custom subclasses of DataSource for which there is no schema defined by
        // serializing based on the DataSource schema but adding the _constructor property to
        // get the correct class.
        // XXX problem: if you ask an instance to serialize itself, and there is no schema for
        // it's specific class, it uses the superClass schema but loses it's Constructor
        // XXX we to preserve the class, we need to end up with the "constructor" property set
        // in XML, but this has special semantics in JS
        var dsClass = defaults._constructor || "DataSource",
            schema;
        if (isc.DS.isRegistered(dsClass)) {
            schema = isc.DS.get(dsClass);
        } else {
            schema = isc.DS.get("DataSource");
            defaults._constructor = dsClass;
        }

        // serialize to XML and save to server
        var xml = schema.xmlSerialize(defaults);
        // this.logWarn("saving DS with XML: " + xml);

        this.dsDataSource.saveFile({
            fileName: defaults.ID,
            fileType: "ds",
            fileFormat: "xml"
        }, xml, function() {
            callback();
        }, {
            // DataSources are always shared across users - check for existing file to
            // overwrite without regard to ownerId
            operationId: "allOwners"
        });
    }

    
});

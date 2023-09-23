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

//////////////////////////////////////////////////////////////////////////////
// Class DSBindingEditorListGrid

isc.ClassFactory.defineClass("DSBindingEditorListGrid", "ListGrid");

isc.DSBindingEditorListGrid.addProperties({

transferRecords : function (dropRecords, targetRecord, index, sourceWidget, callback) {

    if (this.pickerRole == "current") {
        var crossDrop = this != sourceWidget;

        if (index == null) {
            index = this.getTotalRows();
        }

        for (var i = 0; i < dropRecords.length; i++) {
            var record = dropRecords[i];
            record.order = index + i;
        }

        var order = index + dropRecords.length;
        for (var rowNum = index; rowNum < this.getTotalRows(); rowNum++) {
            var record = this.getRecord(rowNum);
            if (crossDrop || !dropRecords.contains(record)) {
                record.order = order++;
            }
        }
    }

    return this.Super("transferRecords", arguments);
},

getContiguousSelection : function () {
    var selection = this.getSelectedRecords(),
        selectionLength = (selection == null ? 0 : selection.length);
    if (selectionLength == 0) return null;

    // we allow multiple selections only for contiguous records
    var firstIndex = this.getRecordSetBounds(selection, -1);

    var deselected = [];
    for (var i = 1; i < selectionLength; ++i) {
        var record = selection[i];
        if (deselected.length == 0 && this.getRecord(firstIndex + i) != record ||
           deselected.length > 0) deselected.add(record);
    }
    this.deselectRecords(deselected);

    return this.getSelectedRecords();
},

getRecordSetBounds : function (records, direction, offset) {
    if (offset == null) offset = 0;
    var nRows = this.getTotalRows();
    switch (direction) {
    case -1:
        var index = this.getRecordIndex(records.first());
        if (index >= 0) {
            return Math.max(index - offset, 0);
        }
        break;
    case 1:
        var index = this.getRecordIndex(records.last());
        if (index >= 0) {
            return Math.min(index + offset + 1, nRows);
        }
        break;
    }
    return null;
}

});


//////////////////////////////////////////////////////////////////////////////
// Class DSBindingEditorGridView

isc.ClassFactory.defineClass("DSBindingEditorGridView", "VLayout");

isc.DSBindingEditorGridView.addMethods({

persistFormDefaults: {
    _constructor: "DynamicForm",
    itemChanged : function (item, newValue) {
        this.grid.autoPersistViewState = (newValue ? ["field","sort"] : null);
        if (newValue) {
            // Do something that isn't visible that will trigger a viewState change
            // so the current state is persisted as-is
            this.grid.setHilites();
        } else {
            this.grid.clearSavedViewState();
        }
    }
},

persistFieldDefaults: {
    name: "persist",
    type: "boolean",
    title: "Auto-save preferences",
    showTitle: false,
    align: "center",
    colSpan: 2
},

initWidget : function () {
    this.Super(this._$initWidget, arguments);

    var sectionStack = isc.SectionStack.create({
        height: 5,
        overflow: "visible",
        sections: [{ title: this.title, 
                     canCollapse: false }]
    });
    this.addMember(sectionStack);

    if (this.showPersistState) {
        this.addAutoChild("persistForm", {
            fields: [ isc.addProperties({}, this.persistFieldDefaults ) ]
        })
    }
},

addMember : function (newMember) {
    // create a reference to autochild ListGrid when added
    if (isc.isA.ListGrid(newMember)) {
        this.grid = newMember;
        if (this.persistForm) {
            this.persistForm.grid = newMember;
            this.persistForm.setValues({ persist: (newMember.autoPersistViewState != null) });

            this.Super("addMember", [newMember, 1]);
            return;
        }
    }
    
    // call the superclass addMember
    this.Super("addMember", arguments);
},

setPersistState : function (state) {
    if (this.persistForm) {
        this.persistForm.setValue("persist", state);
    }
},

getPersistState : function () {
    return this.persistForm.getValue("persist");
}

});


//////////////////////////////////////////////////////////////////////////////
// Class DSBindingEditorShuttle

isc.ClassFactory.defineClass("DSBindingEditorShuttle", "HLayout");

isc.DSBindingEditorShuttle.addMethods({

// apply all pending changes to the DataBoundComponent

applyCurrentFields : function (parentNode) {

    var editContext = this.editor.editContext,
        dataBoundComponent = parentNode.liveObject,
        editProxy = dataBoundComponent.editProxy,
        dataSource = this.editor.dataSource || dataBoundComponent.getDataSource()
    ;

    // We want to apply minimal changes to the component to render selected fields in the
    // desired order and visibility. Any existing editNodes should be retained as-is but
    // positioned properly so custom changes like an overridden title are retained.

    var tree = editContext.getEditNodeTree(),
        children = tree.getChildren(parentNode),
        selectedFieldsGrid = this.currentView.grid,
        selectedFieldsCount = selectedFieldsGrid.getTotalRows(),
        selectedFields = []
    ;

    // Grab list of all fields to bind
    for (var i = 0; i < selectedFieldsCount; i++) {
        selectedFields.add(selectedFieldsGrid.getRecord(i));
    }

    // remove all fields that are not in the new field list
    
    var keepFields = [],
        removed;
    if (children && children.length > 0) {
        var dbcKeepFields = [],
            removeNodes = []
        ;
        for (var i = 0; i < children.length; i++) {
            var editNode = children[i];
            if (editNode.type != "DynamicProperty" && !isc.isA.DataSource(editNode.liveObject)) {
                if (!selectedFields.find("name", editNode.ID)) {
                    // Field is not in the fields to bind; remove it
                    removeNodes.add(editNode);
                } else {
                    // Field remains in binding list so copy it for reapplication
                    var keepField = isc.addProperties({}, editNode.defaults);
                    keepFields.add(keepField);

                    // Make copy of field properties to pass to dbc.setFields because these
                    // objects may be updated by the dbc with additional attributes that are
                    // not wanted when binding the new DS.
                    dbcKeepFields.add(isc.addProperties({}, keepField));
                }
            }
        }

        if (removeNodes.length > 0) {
            dataBoundComponent.setFields(dbcKeepFields);

            for (var i = 0; i < removeNodes.length; i++) {
                editContext.removeNode(removeNodes[i], true);
            }

            removed = true;
        }
    }

    // At this point, the DBC has only fields that are part of the target binding list.
    // Following the same optimization as for removals above, build list of actual field
    // objects and a list of corresponding editNodes in the binding list order.
    children = tree.getChildren(parentNode);

    var fields = [],
        changed
    ;
    var updateHidden = function (sourceField, object) {
        var changed = false;
        if (sourceField.hidden && !object.hidden) {
            object.hidden = true;
            changed = true;
        } else if (!sourceField.hidden && object.hidden) {
            if (sourceField.detail) {
                // explicitly save hidden=false to make the detail="true" field visible
                object.hidden = false;
            } else {
                delete object.hidden;
            }
            changed = true;
        }
        return changed;
    }

    for (var i = 0; i < selectedFields.length; i++) {
        var selectedField = selectedFields[i],
            keepField = keepFields.find("name", selectedField.name)
        ;
        if (keepField) {
            if (isc.isA.ListGrid(dataBoundComponent)) {
                // Update existing field and position it correctly in the editNodes
                changed = updateHidden(selectedField, keepField) || changed;
            }

            fields.add(keepField);

            var editNode = children.find("name", keepField.name);
            if (editNode) {
                changed = updateHidden(selectedField, editNode.defaults) || changed;
                var currentIndex = children.findIndex("name", keepField.name);
                if (currentIndex != i+1) {
                    editContext.reorderNode(parentNode, currentIndex, i+1);
                    changed = true;
                }
            }
        } else {
            // New field
            // duplicate the field on the DataSoure - we don't want to have the live component
            // sharing actual field objects with the DataSource
            var field = isc.addProperties({}, selectedField),
                defaults = {}
            ;

            fields.add(field);

            if (field.top != null || field.left != null) {
                defaults = { top: field.top, left: field.left };
            }
            if (isc.isA.ListGrid(dataBoundComponent)) {
                if (field.hidden) {
                    defaults.hidden = field.hidden;
                } else if (!field.hidden && field.detail) {
                    // explicitly save hidden=false to make the detail="true" field visible
                    defaults.hidden = false;
                }
            } else if (field.hidden) {
                // Don't force field hidden at FormItem level
                delete field.hidden;
            }

            // What constitutes a "field" varies by DBC type
            var fieldConfig = editProxy.makeFieldPaletteNode(editContext, field, dataSource, defaults);
            var editNode = editContext.makeEditNode(fieldConfig);

            // Use field index+1 as the position within the node to add this field.
            // Without the index the field is added at the end which can leave a node such
            // as a DynamicProperty between the DS node and the fields.
            editContext.addNode(editNode, parentNode, i+1, null, true);

            changed = true;
        }
    }

    // DBC field editNodes now represent the desired binding list as does the 'fields' array.
    // Bind the fields to the DBC to match the editNodes.
    if (changed) {
        if (editProxy.layoutNewFields) {
            editProxy.layoutNewFields(dataSource, fields);
        }
        dataBoundComponent.setDataSource(dataSource, fields);
    }

    
    if (removed || changed) {
        children = tree.getChildren(parentNode);
        for (var i = 0; i < keepFields.length; i++) {
            var keepField = keepFields[i],
                editNode = children.find("name", keepField.name);
            if (editNode) {
                var field = dataBoundComponent.getFieldByName(keepField.name);
                // Update existing editNode to point to new live field
                editNode.liveObject = field;
                // Enable editMode using existing editNode. This creates a new
                // EditProxy. The original field will destroy the old EditProxy.
                // Note that this does not apply to ListGridFields.
                if (field && field.setEditMode) {
                    field.setEditMode(true, editContext, editNode);
                }
            }
        }
    }
},

applyPersistState : function (parentNode) {
    if (this.currentView.showPersistState) {
        var editContext = this.editor.editContext,
            persistState = this.currentView.getPersistState()
        ;
        if (persistState) {
            editContext.setNodeProperties(parentNode, { autoPersistViewState: true });
        } else {
            // Set to null so DBC setting is immediately changed. removeNodeProperties()
            // doesn't affect the DBC but does remove the property so it isn't serialized
            // at all.
            editContext.setNodeProperties(parentNode, { autoPersistViewState: null });
            editContext.removeNodeProperties(parentNode, "autoPersistViewState");
        }
    }
},

save : function () {
    var editNode = this.editor.editNode,
        liveObject = editNode.liveObject
    ;
    this.applyPersistState(editNode);
    this.applyCurrentFields(editNode);

    // Component already has a DataSource but the desired data may not have yet been
    // fetched because of no fields defined. Perform a fetch now which will no-op
    // if there isn't anything to do.
    if (liveObject.autoFetchData) {
        liveObject.fetchData();
    }
    return true;
},

// build tracker - two grids and directional arrows

availableViewDefaults: {
    _constructor: "DSBindingEditorGridView"
},
currentViewDefaults: {
    _constructor: "DSBindingEditorGridView"
},

buttonStackDefaults: {
    align: "center",
    overflow: "visible",
    layoutAlign: "center"
},

initWidget : function () {

    // call the superclass initWidget
    this.Super(this._$initWidget, arguments);

    var editor = this.editor;

    // create the grid for the available fields

    this.availableView = this.createAutoChild("availableView", {
        shuttle: this,
        title: editor.availableFieldsTitle
    });

    // now use the button list to create current fields grid

    this.currentView = this.createAutoChild("currentView", {
        shuttle: this,
        title: editor.currentFieldsTitle,
        showPersistState: isc.isA.ListGrid(editor.dataBoundComponent)
    });

    this.initTransferArrows();

    this.addMembers([
        this.availableView, this.horizontalArrows, 
        this.currentView,   this.verticalArrows
    ]);
},

// add the arrow stacks to the shuttle, with appropriate handlers
initTransferArrows : function () {

    var current = this.currentView,
        available = this.availableView;
        
    this.horizontalArrows = isc.VLayout.create({ 
        width: 24,
        membersMargin: 5,
        members: [
            isc.ImgButton.create({
                height: 22,
                imageType: "center",
                showDown: false,
                align: "center",
                src: "[SKINIMG]TransferIcons/right_all.png",
                prompt: "Move all fields right",
                click : function () {
                    available.grid.selectAllRecords();
                    current.grid.transferSelectedFieldRecords(available.grid, true);
                }
            }), 
            isc.ImgButton.create({
                height: 22,
                imageType: "center",
                showDown: false,
                align: "center",
                src: "[SKINIMG]TransferIcons/right.png",
                prompt: "Move selected fields right",
                click : function () {
                    current.grid.transferSelectedFieldRecords(available.grid, true);
                }
            }), 
            isc.ImgButton.create({
                height: 22,
                imageType: "center",
                showDown:false,
                src: "[SKINIMG]TransferIcons/left.png",
                prompt: "Move selected fields left",
                click : function () {
                    var selectedRecords = current.grid.getSelectedRecords();
                    available.grid.creator.canRemoveFields(selectedRecords, function () {
                        available.grid.transferSelectedData(current.grid);
                    });
                }
            }), 
            isc.ImgButton.create({
                height: 22,
                imageType: "center",
                showDown:false,
                src: "[SKINIMG]TransferIcons/left_all.png",
                prompt: "Move all fields left",
                click : function () {
                    current.grid.selectAllRecords();

                    var selectedRecords = current.grid.getSelectedRecords();
                    available.grid.creator.canRemoveFields(selectedRecords, function () {
                        available.grid.transferSelectedData(current.grid);
                    });
                }
            })]
    }, this.buttonStackDefaults);

    var moveToBoundarySlot = function (direction) {
        var grid = current.grid,
            selection = grid.getSelection() || [],
            targetIndex = direction == -1 ? 0 : grid.getTotalRows();
        grid.transferRecords(selection, null, targetIndex, grid);
        grid.scrollToRow(targetIndex);
    };
    var moveByOneSlot = function (direction) {
        var grid = current.grid,
            selection = grid.getContiguousSelection();
        if (selection) {
            var targetIndex = grid.getRecordSetBounds(selection, direction, 1);
            grid.transferRecords(selection, null, targetIndex, grid);
            grid.scrollToRow(targetIndex - (direction + 1) / 2);
        }
    };

    if (this.editor.showFieldOrderButtons) {
        this.verticalArrows = isc.VLayout.create({ 
            width: 24,
            membersMargin: 5,
            disabled: true,
            members: [
                isc.ImgButton.create({
                    height: 22,
                    imageType: "center",
                    showDown:false,
                    src: "[SKINIMG]TransferIcons/up_first.png",
                    prompt: "Move selected field to top",
                    click : function () { moveToBoundarySlot(-1); }
                }), 
                isc.ImgButton.create({
                    height: 22,
                    imageType: "center",
                    showDown:false,
                    src: "[SKINIMG]TransferIcons/up.png",
                    prompt: "Move selected field up",
                    click : function () { moveByOneSlot(-1); }
                }),
                isc.ImgButton.create({
                    height: 22,
                    imageType: "center",
                    showDown:false,
                    src: "[SKINIMG]TransferIcons/down.png",
                    prompt: "Move selected field down",
                    click : function () { moveByOneSlot(1); }
                }),
                isc.ImgButton.create({
                    height: 22,
                    imageType: "center",
                    showDown:false,
                    src: "[SKINIMG]TransferIcons/down_last.png",
                    prompt: "Move selected field to bottom",
                    click : function () { moveToBoundarySlot(1); }
                })
            ]
        }, this.buttonStackDefaults);
    }
}

});

//////////////////////////////////////////////////////////////////////////////
// Class DSBindingEditor

//> @class DSBindingEditor
// Provides a UI for selecting field bindings for a +link{DataBoundComponent}
// within Reify.
// 
// @inheritsFrom VLayout
// @visibility devTools
//<

isc.ClassFactory.defineClass("DSBindingEditor", "VLayout");

isc.DSBindingEditor.addProperties({

layoutMargin: 10,
membersMargin: 10,

defaultWidth: 800,
defaultHeight: 425,
    
//> @attr dsBindingEditor.dataBoundComponent (Canvas : null : IR)
// The component whose fields should be edited.
// @visibility devTools
//<

//> @attr dsBindingEditor.editNode (EditNode : null : IR)
// The EditNode of the component provided in +link{dataBoundComponent}.
// @visibility devTools
//<

//> @attr dsBindingEditor.editContext (EditContext : null : IR)
// The EditContext of the editNode provided in +link{dataBoundComponent}.
// @visibility devTools
//<

//> @attr dsBindingEditor.showFieldOrderButtons (boolean : true : IR)
// When set to false, hides the right-most set of buttons, used for re-ordering fields in the
// Component Fields list.
// @visibility devTools
//<
showFieldOrderButtons: true,

//> @attr dsBindingEditor.availableFieldsTitle (String : "DataSource Fields" : [IR])
// @group i18nMessages
// @visibility devTools
//<    
availableFieldsTitle: "DataSource Fields",

//> @attr dsBindingEditor.currentFieldsTitle (String : "Component Fields" : [IR])
// @group i18nMessages
// @visibility devTools
//<    
currentFieldsTitle: "Component Fields",

//> @attr dsBindingEditor.availableTitleTitle (String : "Name" : IR)
// The title displayed for the title property of the available fields
// @group i18nMessages
// @visibility devTools
//<
availableTitleTitle: "Name",

//> @attr dsBindingEditor.currentTitleTitle (String : "Field Title" : IR)
// The title displayed for the title property of the current fields
// @group i18nMessages
// @visibility devTools
//<
currentTitleTitle: "Field Title",

instructionsPanelDefaults: {
    _constructor: "InstructionsPanel",
    paneHeight: 135,
    helpDialogId: "DSBindingEditorInstructions"
},

gridInstructions: "Choose which fields should appear by default in your grid. Use the " +
                  "<i>Initially Visible</i> (${hiddenIcon}) checkboxes to " +
                  "decide which fields are shown by default.<p>" +
                  "Users can then use the built-in grid header menus to show any other " +
                  "fields that appear in the right-side list.<p>" +
                  "If you check \"Auto-save preferences\", the grid will remember which " +
                  "fields were showing, and other details like column widths set by the user.",

dbcInstructions: "Your component can show all the fields from the DataSource, or just some.<p>" +
                 "For example, you may have a DataSource with a lot of fields, so that you " +
                 "need to split the fields across multiple tabs or sections or even steps " +
                 "of a wizard.<p>" +
                 "In this case, create a separate form for each tab, section or step, each " +
                 "showing just some of the fields from the DataSource.  Then, if you use a " +
                 "ValuesManager to link all the forms, you can perform Actions like " +
                 "<i>Save Data</i> or <i>Clear Values</i> on the ValuesManager, and it will " +
                 "work on all the forms at once.",

commonInstructions: "Hold down the <i>Shift</i> key when clicking to select a continous " +
                    "range of fields or the <i>${ctrlKey}</i> key to select multiple fields " +
                    "that aren't adjacent.",

//> @attr dsBindingEditor.saveAndExitButtonTitle (String : "Bind" : IR)
// The title shown on the Save and Exit button
// @group i18nMessages
// @visibility devTools
//<
saveAndExitButtonTitle: "Bind",

//> @attr dsBindingEditor.cancelButtonTitle (String : "Cancel" : IR)
// The title shown on the Cancel button
// @group i18nMessages
// @visibility devTools
//<
cancelButtonTitle: "Cancel",

//> @attr dsBindingEditor.removeItemTitle (String : "Remove" : IR)
// The title shown on the 'Current Fields' grid's context menu item, whose click handler
// puts the selected item back in the 'Available Fields' collection.
// @group i18nMessages
// @visibility devTools
//<
removeItemTitle: "Remove",

//> @attr dsBindingEditor.sortAvailableFields (boolean : true : IR)
// Should the available fields grid be sorted by default? Grid will be sorted by
// +link{dsBindingEditor.availableFieldsSortDirection}.
// @visibility dsBindingEditor
//<
sortAvailableFields:true,

//> @attr dsBindingEditor.availableFieldsSortDirection (SortDirection : "ascending" : IR)
// If +link{dsBindingEditor.sortAvailableFields} is <code>true</code>, this property will
// govern the sort-direction for the initial sort applied to the available fields grid.
// @visibility dsBindingEditor
//<
availableFieldsSortDirection:"ascending",

//> @attr dsBindingEditor.availableFieldsGrid (AutoChild ListGrid : null : IR)
// A +link{class:ListGrid, ListGrid} showing the list of available fields.
// @visibility devTools
//<
availableFieldsGridDefaults : {
    canGroupBy: false,
    pickerRole: "available",
    dataFetchMode: "basic",
    dragDataAction: "move",
    canFreezeFields: false,
    showFilterEditor: true,
  	filterOnKeypress: true,
    canDragRecordsOut: true,
    loadDataOnDemand: false,
    dragRecategorize: "never",
    autoFitWidthApproach: "both",
    useAllDataSourceFields: true,
    canAcceptDroppedRecords: true,
    recordEnabledProperty: "_enabled",
    autoFetchTextMatchStyle: "substring",
    recordDrop : function (dropRecords, targetRecord, index, sourceWidget) {
        var _this = this;
        this.creator.canRemoveFields(dropRecords, function () {
            _this.transferRecords(dropRecords, targetRecord,
                                 (this.canReorderRecords ? index : null), sourceWidget);
        });
        return false;
    },
    transferRecords : function (dropRecords, targetRecord, index, source, callback) {
        // Remove any records that have no type. These are non-DS fields and they should
        // just go away rather than be placed in available fields.
        for (var i = dropRecords.length-1; i >= 0; i--) {
            var record = dropRecords[i];
            if (record.type == null) {
                dropRecords.removeAt(i);
            }
        }
        // Transfer the remaining fields
        this.Super("transferRecords", [dropRecords, targetRecord, index, source, function () {
            var selection = this.getSelection();
            if (selection.length > 0) {
                source.removeSelectedData(null,null,function () {
                    if (callback) callback();
                });
            } else {
                if (callback) callback();
            }
        }]);
    }
},

//> @attr dsBindingEditor.currentFieldsGrid (AutoChild ListGrid : null : IR)
// A +link{class:ListGrid, ListGrid} showing the list of current fields.
// @visibility devTools
//<
currentFieldsGridDefaults : {
    canGroupBy: false,
    canSort: false,
    pickerRole: "current",
    dataFetchMode: "basic",
    dragDataAction: "move",
    canFreezeFields: false,
    showFilterEditor: false,
    canDragRecordsOut: true,
    loadDataOnDemand: false,
    dragRecategorize: "never",
    autoFitWidthApproach: "both",
    useAllDataSourceFields: true,
    canAcceptDroppedRecords: true,
    recordEnabledProperty: "_enabled",
    autoFetchTextMatchStyle: "substring",
    canReparentNodes: true,
    canReorderRecords: true,

    initWidget : function () {
        this.Super(this._$initWidget, arguments);

        // These images are explicitly reversed since the only boolean field we
        // support is a 'hidden' field displayed as 'initially visible' so that
        // when checked it means the value should be false.
        this.booleanFalseImage = isc.CheckboxItem ?
                isc.CheckboxItem.getInstanceProperty("checkedImage") : null;
        this.booleanTrueImage = isc.CheckboxItem ?
                isc.CheckboxItem.getInstanceProperty("uncheckedImage") : null;
        this.booleanImageWidth = isc.CheckboxItem ?
                isc.CheckboxItem.getInstanceProperty("valueIconWidth") : null;
        this.booleanImageHeight = isc.CheckboxItem ?
                isc.CheckboxItem.getInstanceProperty("valueIconHeight") : null;
    },

    transferSelectedFieldRecords : function (sourceGrid, scrollToRow) {
        var targetGrid = this;
        targetGrid.transferSelectedData(sourceGrid, null, !scrollToRow ? null :
            function (transferredRecords) {
                
                var targetRow = targetGrid.getRecordIndex(transferredRecords[0]);
                if (targetRow >= 0) targetGrid.scrollToRow(targetRow);
        });
    },

    selectionUpdated : function (record, recordList) {
        // When selection is made, enable the reorder buttons
        if (record) {
            this.creator.shuttle.verticalArrows.enable();
        } else {
            this.creator.shuttle.verticalArrows.disable();
        }
    }
},

removeSingleCustomizedFieldMessage: "This field has a customized binding.<br><br>Really remove it?",
removeMultipleCustomizedFieldsMessage: "The following fields have customized bindings: ${fieldList}.<br><br>Really remove them?",

// callback called to continue remove
canRemoveFields : function (records, callback) {
    var tree = this.editContext.getEditNodeTree(),
        children = tree.getChildren(this.editNode),
        customizedRecords = []
    ;
    
    for (var i = 0; i < records.length; i++) {
        var record = records[i],
            node = children.find("ID", record.name),
            liveObject = node && node.liveObject
        ;
        if (liveObject && (liveObject._isFieldObject == true ||
            isc.isA.FormItem(liveObject) ||
            node.type == "TileGridField"))
        {
            if (isc.EditProxy.fieldEdited(this.dataBoundComponent, node)) {
                customizedRecords.add(record);
            }
        }
    }
    // If no customized fields, just call callback()
    if (customizedRecords.length == 0) {
        callback();
        return;
    }

    // At least one field has customized bindings so show a confirmation dialog
    var message = (records.length == 1 ?
                    this.removeSingleCustomizedFieldMessage :
                    this.removeMultipleCustomizedFieldsMessage);

    // Get list of field names that were customized. We don't want just the field
    // name or title but rather the same value as displayed in the source grid (current).
    var titleFieldNum = this.currentFieldsGrid.getFieldNum("title"),
        fieldList = []
    ;
    for (var i = 0; i < customizedRecords.length; i++) {
        var record = customizedRecords[i],
            rowNum = this.currentFieldsGrid.getRowNum(record),
            title = this.currentFieldsGrid.getCellValue(record, rowNum, titleFieldNum)
        ;
        fieldList.add(title);
    }
    message = message.evalDynamicString(this, { fieldList: fieldList.join(", ") });

    isc.confirm(message, function (value) {
        if (value) {
            callback();
        }
    }, {
        buttons: [isc.Dialog.NO, isc.Dialog.YES],
        autoFocusButton: 1
    });
},

// create a DataSource for the available or current fields ListGrid

createDataSourceFromFields : function (fields, exclusions, available, skipDuplicate) {
    var includedFields = skipDuplicate ? fields : fields.duplicate();

    if (exclusions != null) {
        for(var output=[],i=0,l=includedFields.length;i<l;i++){
            if(!exclusions.containsProperty("name", includedFields[i].name)) {
                output.add(includedFields[i]);
            }
        }
        includedFields = output;
    }


    var orderField = {name: "order", type:"int", hidden:true},
        nameField = {name: "name",   title: "Name", primaryKey: true},
        titleField = {name: "title", title: "Title"},
        typeField = {name: "type", title: "Type", autoFitWidth: true},
        hiddenField = {name: "hidden", type:"boolean", hidden: true},
        detailField = {name: "detail", type:"boolean", hidden: true}
    ;
    var fields = [orderField, titleField, nameField, typeField, hiddenField, detailField];

    if (!available) {
        for (var i = 0; i < includedFields.length; i++) {
            includedFields[i].order = i;
        }
    }

    var dataSource = isc.DataSource.create({
        fields: fields,
        clientOnly: true,
        dataProtocol: "clientCustom",
        transformRequest : function (dsRequest) {
            var dsResponse = this.getClientOnlyResponse(dsRequest, null);
            this.processResponse(dsRequest.requestId, dsResponse);
            return dsRequest.data;
        }
    });

    dataSource.setCacheData(includedFields);
    return dataSource;
},

initWidget : function () {

    // call the superclass initWidget
    this.Super(this._$initWidget, arguments);
    
    // If no DataBoundComponent is supplied, create a disposable DBC based on the 
    // fields of supplied DataSource, and return DBC fields, etc. in a callback
    if (this.dataBoundComponent == null && this.dataSource != null) {
        var properties = isc.addProperties({}, this.creator.dsBindingEditorProperties, {
                autoDraw: false
            });
        var component = isc.ListGrid.create(properties);
        component.setFields(component.fields);
        this.dataBoundComponent = component;
    }
    if (this.dataSource == null && this.dataBoundComponent != null) {
        this.dataSource = this.dataBoundComponent.getDataSource();
    }

    // Add instruction section at top
    this.hiddenIconHtml = isc.Canvas.imgHTML("actions/preview.png", 16, 16);
    var instructions = (isc.isA.ListGrid(this.dataBoundComponent) ? this.gridInstructions :
                            this.dbcInstructions) +
                        "<p>" + this.commonInstructions;
    instructions = instructions.evalDynamicString(this, {
        ctrlKey: (isc.Browser.isMac ? "Cmd" : "Ctrl"),
        hiddenIcon: this.hiddenIconHtml
    });
    this.addAutoChild("instructionsPanel", { instructions: instructions });

    // create the shuttle widget for dragging/dropping fields

    var shuttle = isc.DSBindingEditorShuttle.create({
        editor: this,
        membersMargin: 10
    });
    this.shuttle = shuttle;
    this.addMember( shuttle );

    // create the ListGrid AutoChildren available/current Fields

    var completeFields = this.getDataSourceFields(),
        currentFields  = this.getComponentFields();

    var availableFieldsSort;
    if (this.sortAvailableFields) {
        availableFieldsSort = [{
            property:"title",
            direction:this.availableFieldsSortDirection
        }];
    }

    this.addAutoChild("availableFieldsGrid", {
        autoFetchData: true,
        initialSort:availableFieldsSort,
        dataSource: this.createDataSourceFromFields(completeFields, currentFields, true),
        fields: this.createGridFields(),
        rowDoubleClick : function (record, recordNum, fieldNum) {
            var current = shuttle.currentView.grid;
        	current.transferSelectedData(this);
        }
    }, isc.DSBindingEditorListGrid, shuttle.availableView);

    this.addAutoChild("currentFieldsGrid", {
        // Assign a static ID so the state can be persisted across uses
        ID: "DSBindingEditor_currentFieldsGrid",
        autoFetchData: true,
        initialSort: [{ property: "order" }],
        dataSource: this.createDataSourceFromFields(currentFields),
        fields: this.createGridFields(isc.isA.ListGrid(this.dataBoundComponent)),
        contextMenu : isc.Menu.create({
        	autoDraw: false,
        	data : [{
        		title : this.removeItemTitle, 
        		click : function () {
        			var current = shuttle.currentView.grid;
        			var available = shuttle.availableView.grid;
        			available.transferSelectedData(current);
        		}
        	}]
        })
    }, isc.DSBindingEditorListGrid, shuttle.currentView);

    shuttle.currentView.setPersistState(this.dataBoundComponent.autoPersistViewState);

    // create save/cancel buttons

    this.addAutoChild("buttonLayout");
    if (this.buttonLayout) {
        this.saveAndExitButton = this.createAutoChild("saveAndExitButton", {
            editor: this,
            title: this.saveAndExitButtonTitle
        });
        this.cancelChangesButton = this.createAutoChild("cancelChangesButton", {
            editor: this,
            title: this.cancelButtonTitle
        });
        this.buttonLayout.addMembers([this.cancelChangesButton, this.saveAndExitButton]);
        this.addMember(this.buttonLayout);
    }

},

getDataSourceFields : function () {
    var fields = [],
        dsFields = this.dataSource.getFields()
    ;
    for (var name in dsFields) {
        var dsField = dsFields[name],
            title = (dsField.title && !dsField._titleAutoDerived ? dsField.title : null),
            field = {
                name: dsField.name,
                type: dsField.type,
                hidden: dsField.hidden || dsField.detail,
                detail: dsField.detail,
                includeFrom: dsField.includeFrom,
                primaryKey: dsField.primaryKey,
                // displayField needed to discern the correct field type in a form
                displayField: dsField.displayField
            }
        ;
        if (title) field.title = title;
        fields.add(field);
    }
    var componentFields = (this.dataBoundComponent.getAllFields ?
                            this.dataBoundComponent.getAllFields() :
                            this.dataBoundComponent.getFields());
    for (var i = 0; i < componentFields.length; i++) {
        var componentField = componentFields[i];
        if (!this.dataSource.getField(componentField.name)) {
            var field = {
                    name: componentField.name,
                    type: componentField.type,
                    hidden: componentField.hidden
                }
            ;
            if (componentField.title) field.title = componentField.title;
            fields.add(field);
        }
    }
    return fields;
},

getComponentFields : function () {
    var editContext = this.editContext,
        tree = editContext.getEditNodeTree(),
        children = tree.getChildren(this.editNode),
        fields = []
    ;

    for (var j = 0; j < children.length; j++) {
        var childNode = children[j];
        if (childNode.type != "DynamicProperty" && !isc.isA.DataSource(childNode.liveObject)) {
            var dsField = this.dataSource.getField(childNode.ID),
                defaults = childNode.defaults || {},
                field = isc.addProperties({}, (dsField ? dsField : { name: childNode.ID }))
            ;
            if (field.title && field._titleAutoDerived) delete field.title;
            if (defaults.title) field.title = defaults.title;
            if (defaults.hidden) field.hidden = defaults.hidden;
            fields.add(field);
        }
    }
    return fields;
},

orderFieldDefaults: {
    name: "order", hidden: true
},

titleFieldDefaults: {
    name: "title",
    prompt: "The name of this field that users of your applications will see",

    // Formatting, handled in the methods below, was taken from the DataSourceEditor.
    // At some point this needs to be consolidated so it can be shared.

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
    }
},

nameFieldDefaults: {
    name: "name",
    prompt: "Internal name for your field. " +
        "Users of your application will not see this name, but it will appear in " +
        "exported code and in some advanced areas of this design tool",

    // Formatting, handled in the methods below, was taken from the DataSourceEditor.
    // At some point this needs to be consolidated so it can be shared.

    // Where includeFrom has been used, the name defaults to includeFrom's name.
    // So as well show that instead of nothing. We'll put it in italics to indicate
    // that it is special.
    //
    // In fact, we may as well show the includeFrom value in all cases (where
    // present) -- this will help avoid confusion where the name has been edited.

    formatCellValue : function(value, record, rowNum, colNum, grid) {
        if (!record) record = {};
        var formattedValue = this._nameFromValueOrIncludeFrom(value, record.includeFrom);
        if (record.primaryKey) {
            formattedValue = "<b>" + formattedValue + "</b>";
        }
        if (record.includeFrom) {
            formattedValue +=" [Included from: <i>" + record.includeFrom + "</i>]";
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

    showHover: true,
    hoverHTML : function (record, value, rowNum, colNum, grid) {
        var hover;
        if (record.primaryKey) {
            hover = "Primary Key: The Primary Key (PK) uniquely identifies each DataSource " +
                    "record and allows related data across DataSources to be displayed together.";
        } else if (record.includeFrom) {
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
    }
},

typeFieldDefaults: {
    name: "type", autoFitWidth: true,

    // Formatting, handled in the methods below, was taken from the DataSourceEditor.
    // At some point this needs to be consolidated so it can be shared.

    formatCellValue : function(value, record, rowNum, colNum, grid) {
        if (!record) record = {};
        return (value && record.primaryKey ? "<b>" + value + "</b>" : value);
    },

    showHover: true,
    hoverHTML : function (record, value, rowNum, colNum, grid) {
        var hover;
        if (record.primaryKey) {
            hover = "Primary Key: The Primary Key (PK) uniquely identifies each DataSource " +
                    "record and allows related data across DataSources to be displayed together.";
        }
        return hover;
    }
},

hiddenFieldDefaults: {
    name: "hidden", icon: "actions/preview.png", showTitle: false,
    prompt: "Initially visible",
    canEdit: true
},

createGridFields : function (showHiddenField) {
    var fields = [
        isc.addProperties({}, this.orderFieldDefaults),
        isc.addProperties({}, this.titleFieldDefaults),
        isc.addProperties({}, this.nameFieldDefaults),
        isc.addProperties({}, this.typeFieldDefaults)
    ];
    if (showHiddenField) {
        fields.add(isc.addProperties({}, this.hiddenFieldDefaults));
    }
    return fields;
},

//> @attr dsBindingEditor.buttonLayout (AutoChild HLayout : null : IR)
// A +link{class:HLayout, horizontal layout} used to show the 
// +link{dsBindingEditor.saveAndExitButton, Bind} and +link{dsBindingEditor.cancelChangesButton, Cancel} 
// buttons.
// @visibility devTools
//<
buttonLayoutConstructor: "HLayout",
buttonLayoutDefaults: {
        height: 5,
        align: "right",
        overflow: "visible",
        membersMargin: 10,
    defaultLayoutAlign: "center"
},

//> @attr dsBindingEditor.saveAndExitButton (AutoChild IButton : null : IR)
// An AutoChild +link{class:IButton, button} that saves the current field-set and exits the 
// Binding Editor.
// @visibility devTools
//<
saveAndExitButtonConstructor: "IButton",
saveAndExitButtonDefaults: {
    click: "this.editor.saveClick()"
},
//> @attr dsBindingEditor.cancelChangesButton (AutoChild IButton : null : IR)
// An AutoChild +link{class:IButton, button} that saves the current field-set and exits the 
// Binding Editor.
// @visibility devTools
//<
cancelChangesButtonConstructor: "IButton",
cancelChangesButtonDefaults: {
    click: "this.editor.closeClick()"
},

// save/cancel handling

saveClick : function () {
    // only notify the DBC of the field state change and close the
    // window if the save succeeded; otherwise validation failed
    if (this.shuttle.save()) {
        var component = this.dataBoundComponent;
        if (this.creator) this.creator.closeClick();
    }
},

closeClick : function () {}

});

//////////////////////////////////////////////////////////////////////////////
// Class DSBindingEditorWindow
//> @class DSBindingEditorWindow
// A dialog for picking fields to display from among the available fields.
// <p>
// This is typically useful in scenarios where there are many more fields than can reasonably
// fit on screen. The application can start off displaying a few of the fields by default (such
// as the most commonly-needed fields), and show a DSBindingEditorWindow to allow the user to
// customize which fields to display as well as the order in which to display them.
// @inheritsFrom Window
// @treeLocation Client Reference/Data Binding/DSBindingEditor
// @visibility devTools
//<

if (isc.Window != null) {
    
    isc.ClassFactory.defineClass("DSBindingEditorWindow", "Window");
    
    isc.DSBindingEditorWindow.addProperties({
        
    //> @attr dsBindingEditorWindow.title (String : "Customize binding for ${componentInfo} to ${dsId} DataSource" : [IR])
    // @group i18nMessages
    // @visibility devTools
    //<    
    title: "Customize binding for ${componentInfo} to ${dsId} DataSource",
    
    width: 800,
    height: 425,
    bodyProperties: {
        layoutLeftMargin: 5,
        layoutRightMargin: 5,
        layoutBottomMargin: 5
    },

    canDragResize: true,

    // autoCenter by default, rather than calling centerInPage() at draw time - means
    // devs can override the centering behavior
    autoCenter: true,
    
    isModal: true,

    //> @attr dsBindingEditorWindow.bindingEditor (AutoChild DSBindingEditor : null : IR)
    // A +link{class:DSBindingEditor, DSBindingEditor} for altering the working field-set in a 
    // +link{class:DataBoundComponent, Data-bound component}.
    // @visibility devTools
    //<
    dsBindingEditorConstructor: "DSBindingEditor",
    dsBindingEditorDefaults: {
        autoParent: "none"
    },
    
    initWidget : function () {
        // call the superclass initWidget
        this.Super(this._$initWidget, arguments);

        // Save title template for later updates
        this.defaultTitle = this.title;

        // Show title based on current state
        this._updateTitle();

        // Add initial editor
        this._refreshEditor();

        // Save editContext reference for later use
        var editNode = this.editNode,
            liveObject = editNode && editNode.liveObject,
            editContext = liveObject && liveObject.editContext
        ;

        this.editContext = editContext;
    },
    
    setEditNode : function (editNode, dataSource) {
        this.editNode = editNode;
        this.dataSource = dataSource;
        this._updateTitle();
        this._refreshEditor();
    },

    destroy : function () {
        this.ignore(this.dsBindingEditor, "closeClick");
        return this.Super("destroy", arguments);
    },

    _updateTitle : function () {
        if (this.editNode) {
            var editNode = this.editNode,
                liveObject = editNode.liveObject,
                dataSource = this.dataSource || liveObject.getDataSource(),
                componentInfo = liveObject.getActionTargetTitle 
                                ? liveObject.getActionTargetTitle()
                                : editNode.ID + " (" + editNode.type + ")"
            ;

            this.setTitle(this.defaultTitle.evalDynamicString(this, {
                componentInfo: componentInfo,
                dsId: dataSource.getID()
            }));
        }
    },

    _refreshEditor : function () {
        var editor = this.dsBindingEditor;
        if (editor) {
            if (this.isObserving(editor, "closeClick")) {
                this.ignore(editor, "closeClick");
            }
            this.removeItem(editor);
            editor.markForDestroy();
            this.dsBindingEditor = null;
        }

        var editNode = this.editNode;
        if (editNode) {
            var liveObject = editNode.liveObject,
                editContext = liveObject && liveObject.editContext,
                editorProperties = {
                    editContext: editContext,
                    editNode: editNode,
                    dataBoundComponent: liveObject,
                    dataSource: this.dataSource
                }
            ;

            this.addAutoChild("dsBindingEditor", editorProperties);
            this.addItem(this.dsBindingEditor);
        
            this.observe(this.dsBindingEditor, "closeClick", "observer.closeClick()");
        }
    }
    
    });
} else {
    isc.Log.logInfo("Source for standard DSBindingEditorWindow class included in this module, but required " +
        "related class (Window) is not loaded. This can occur if the Grid module is " +
        "loaded without the Containers module.", "moduleDependencies");

}

}

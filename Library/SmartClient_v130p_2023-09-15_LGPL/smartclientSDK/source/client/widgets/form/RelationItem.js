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
// Class will not work without the ListGrid
if (isc.ListGrid) {



//>	@class RelationItem
//
// Enables editing and saving of records related to the one being displayed in the "master" form
// (the form containing this item).
//
// @inheritsFrom CanvasItem
// @treeLocation Client Reference/Forms/Form Items
// @visibility experimental
//<
isc.ClassFactory.defineClass("RelationItem", "CanvasItem");
isc.RelationItem.addProperties({

    canvasConstructor: "ListGrid",
    canvasDefaults: {
        canEdit: true
    },

    pickerConstructor: "RelationPicker",
    showEditButton: true,
    editButtonDefaults: {
        click: "item.showPicker(item.showPickerModal(), icon)",
        prompt: "Edit new/selected item"
    },
    
    getValuesComponent : function () {
        var form = this.form,
            valuesManager = this.form ? this.form.valuesManager : null;
            
        // If we're in a VM, use that as the source for PK values etc.
        if (valuesManager != null) return valuesManager;
        return form;
    },

    showPickerModal : function () {
        var form = this.getValuesComponent();
        return form && !form.saveOperationIsAdd();
    },

    showRemoveButton: true,
    removeButtonDefaults: {
        src: "[SKIN]DynamicForm/Remove_icon.gif",
        click: "item.removeSelectedData()",
        prompt: "Remove selected item"
    },

    canEditWithNoMasterRecord: false
});

//!>Deferred
isc.RelationItem.addMethods({

init : function () {
    this.hasMasterRecord = false;

    this.Super("init", arguments);

    // if we're showing the various buttons, add them now
    if (this.showEditButton) this.editButton = this.addIcon(this.editButtonDefaults);
    if (this.showRemoveButton) this.removeButton = this.addIcon(this.removeButtonDefaults);
},

getPickerData : function () {
    // return the first selected record, if available;
    var selectedRecord = this.canvas.getSelectedRecord();
    if (selectedRecord) return selectedRecord;
    
    // new record
    var form = this.getValuesComponent();
    return this.getDataSource().getForeignKeysByRelation(form.getValues(), form.dataSource);
},

showPicker : function (modal, icon, pickerProperties, rect) {
    if (pickerProperties == null) pickerProperties = {};
    pickerProperties.dataSource = this.dataSource;
    
    this.Super("showPicker", [modal, icon, pickerProperties, rect], arguments);

    // propagate the masterRecord at show() time in case the use saves directly out of the picker.
    var foreignKeyValues = {};
    var form = this.getValuesComponent();
    if (!form.saveOperationIsAdd()) {
        foreignKeyValues = this.getDataSource().getForeignKeysByRelation(
                                    form.getValues(), form.dataSource);
    }
    this.picker.setForeignKeyValues(foreignKeyValues);
},

// XXX (why) do we need this?
getValue : function () {
    return;
},

removeSelectedData : function () {
    this.canvas.removeSelectedData();
},

// A setValue means that a new master record has been selected.
setValue : function () {     
    // use the primary key to issue a re-filter.  Must do this on a timeout because we're in the
    // middle of setValues() and will need to call getValues() on the DF.
    this.delayCall("filterRelation");
},

filterRelation : function () {
    var form = this.getValuesComponent();
    var values = form.getValues();
    var wasDisabled = this.isDisabled();

    if (form.saveOperationIsAdd()) {
        // the record doesn't have values for all primary key fields - we're adding a new record,
        // so set the data to an empty array because no relations exist yet for this record.
        this.canvas.setData([]);
        this.hasMasterRecord = false;
    } else {
        // we're editing an existing record (has primary keys), so filter the relations view by the
        // primaryKeys
        var ds = this.getDataSource();
        if (ds) {
            this.canvas.filterData(ds.getForeignKeysByRelation(values, form.dataSource));
            this.hasMasterRecord = true;
        }
    }
    if (wasDisabled != this.isDisabled()) {
        this.updateDisabled();
    }

    if (this.picker) {
        this.picker.clearData();
    }
},

isDisabled : function () {
    var dis = this.Super("isDisabled", arguments);
    if (dis) return true;
    if (this.canEditWithNoMasterRecord) return false;
    return !!this.hasMasterRecord;
},

_shouldAllowExpressions : function () {
    return false;
}

});
//!<Deferred

isc.defineClass("RelationPicker", "VLayout").addProperties({
    className: "dialogBackground"
});

//!>Deferred
isc.RelationPicker.addMethods({

creatorName:"picker", 
initWidget : function () {
    this.Super("initWidget", arguments);
    
    this.addAutoChild("editor", { dataSource: this.dataSource }, "DynamicForm");

    this.addAutoChild("toolbar", {
        membersMargin: 2
    }, "HLayout");
    this.addAutoChild("saveButton", {
        title: "Save", 
        click: "this.picker.editor.saveData(this.picker.getID()+'.hide()')"        
    }, "AutoFitButton", this.toolbar);
    this.addAutoChild("clearButton", {
        title: "Clear", 
        click: "this.picker.clearData();"
    }, "AutoFitButton", this.toolbar);
    this.addAutoChild("cancelButton", {
        title: "Cancel", 
        click: "this.picker.hide();this.picker.clearData()"
    }, "AutoFitButton", this.toolbar);

},

hide : function () {
    this.Super("hide", arguments);
    this.hideClickMask();
},

setData : function (data) { 
    this.editor.setData(data);
},

getData : function () {
    return this.editor.getValues();
},

clearData : function () {
    this.editor.clearValues();
    this.setData(this.foreignKeyValues);
},

dataChanged : function () {

},

setForeignKeyValues : function (values) {
    this.foreignKeyValues = values;
}

});
//!<Deferred

}

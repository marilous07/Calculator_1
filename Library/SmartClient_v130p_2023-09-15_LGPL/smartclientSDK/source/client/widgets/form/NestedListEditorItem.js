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
//> @class NestedListEditorItem
// Form item which renders a list of complex sub-objects in an embedded component.  By default,
// the embedded component is a +link{class:ListEditor}
// @treeLocation Client Reference/Forms/Form Items
// @inheritsFrom CanvasItem
// @visibility internal
//<
isc.ClassFactory.defineClass("NestedListEditorItem", "CanvasItem");
isc.NestedListEditorItem.addProperties({
    
    shouldSaveValue: true,
    
  	//> @attr	nestedListEditorItem.editor		(AutoChild ListEditor : null : [IRW])
    //
    // The editor that will be rendered inside this item.  Unless overridden, the editor will be
    // an instance of +link{class:ListEditor}. It will be created using the overrideable defaults
    // standard to the +link{group:autoChildren,AutoChild} subsystem - editorConstructor and 
    // editorProperties.
    //
    //  @visibility internal
	//<
    editorConstructor: "ListEditor",
    editorDefaults: {

        inlineEdit: false,
        height: 155,
        
        saveRecord : function () {
            if (!this.form.validate()) return false;
            var values = this.form.getValues();  

            this.showList(); 

            if (this.inlineEdit) {
                // User clicked "Save" in "More" mode
                this.grid.setEditValues(this.grid.getEditRow(), values);
            } else {
                if (this.form.saveOperationType == "add") { // new record
                    this.grid.addData(values);
                } else {
                    // Avoid updating via updateData, it requires primary keys
                    isc.addProperties(this.currentRecord, values);
                    this.grid.markForRedraw();
                }

                if (!this.inlineEdit) {
                    this.form.clearValues();
                }

                this.creator.updateValue(this.grid.data);
            }

            return true;
        }
    }

});

isc.NestedListEditorItem.addMethods({
    init : function () {
        this._createEditor();
        this.Super("init", arguments);
    },
    
    isEditable : function () {
        return true;
    },

    _createEditor : function() {
        
        var ds;
        var dynProps = {};

        if (this.form.dataSource) { // Should be, otherwise how have we ended up with a complex field?
            ds = isc.DataSource.getDataSource(this.form.dataSource);
            var field = ds.getField(this.name);
            if (field) {
                dynProps.dataSource = ds.getFieldDataSource(field);
            }
        }

        if (this.form && this.form.showComplexFieldsRecursively) {
            dynProps.formProperties = {
                showComplexFields: true,
                showComplexFieldsRecursively: true
            };
            dynProps.gridProperties = {
                showComplexFields: true,
                showComplexFieldsRecursively: true,
                canRemoveRecords: true,
                saveLocally: true,
                data: []
            };
        } else {
            dynProps.formProperties = {
                showComplexFields: false
            };
            dynProps.gridProperties = {
                showComplexFields: false,
                canRemoveRecords: true,
                saveLocally: true
            };
        }
        
        this.addAutoChild("editor", dynProps);
        this.canvas = this.editor;        
    },

    updateValue : function(data) {
        this.editor.setData(data);
        this._updateValue(data);
    },
    
    setValue : function(data) {
        this.editor.setData(data);
        this.Super("setValue", arguments);
    },
    
    _shouldAllowExpressions : function () {
        return false;
    }
    
    // Value comparison needs to be deep for this FormItem - the default one on DyanmicForm 
    // only looks one level deep (ie, it compares Arrays and Objects, but it checks for pointer
    // identity on each entry / property)
    // FIXME - Commenting this out for now because something about it is breaking the 
    // stripifier or module packager 
    /* compareValues(value1, value2) {
        if (value1 == value2) return true;
        if (isc.isA.Date(value1) && isc.isA.Date(value2)) {
            return (isc.DateUtil.compareDates(value1, value2) == 0);
        } else if (isc.isAn.Array(value1) && isc.isAn.Array(value2)) {
            if (value1.length != value2.length) return false;
            for (var i = 0; i < value1.length; i++) {
                if (!this.compareValues(value1[i], value2[i])) return false;
            }
            return true;
        } else if (isc.isAn.Object(value1) && isc.isAn.Object(value2)) {
            if (value1.getKeys().length != value2.getKeys().length) return false;
            for (var key in value1) {
                if (!this.compareValues(value1[key], value2[key])) return false;
            }
            return true;
        }
        return false;
    } */
});


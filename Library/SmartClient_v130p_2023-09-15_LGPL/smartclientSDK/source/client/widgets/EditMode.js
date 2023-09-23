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
isc.Canvas.addClassProperties({
    _editProxyPassThruProperties: [
        "editMaskProperties",
        "hoopSelectionMode",
        "hoopSelectorProperties",
        "selectedAppearance",
        "selectedBorder",
        "selectedLabelBackgroundColor",
        "selectedTintColor",
        "selectedTintOpacity"
    ],
    _getEditProxyPassThruProperties : function (editContext) {
        var properties = {};
        for (var i = 0; i < isc.Canvas._editProxyPassThruProperties.length; i++) {
            var propertyName = isc.Canvas._editProxyPassThruProperties[i];
            if (editContext[propertyName] != null) properties[propertyName] = editContext[propertyName];
        }
        return properties;
    }
});

isc.Canvas.addProperties({

    // Enabling EditMode
    // ---------------------------------------------------------------------------------------

    // A hook which subclasses can use if they need to know when they have been added to an editContext
    //addedToEditContext : function (editContext, editNode, parentNode, index) {
    //},

    //> @method Canvas.updateEditNode()
    // When using the +link{group:devTools,Dashboards &amp; Tools} framework and asking an
    // +link{EditContext} to +link{EditContext.serializeAllEditNodes,serialize EditNodes},
    // <code>updateEditNode</code> is called during the serialization process on each
    // +link{EditNode.liveObject,liveObject}.
    // <p>
    // You can implement <code>updateEditNode</code> on your <code>liveObject</code> and make 
    // updates to +link{EditNode.defaults} to save state "lazily" - just as serialization is
    // occurring - instead of updating <code>editNode.defaults</code> as the end user makes
    // changes.  This can be useful if constantly calculating changes to
    // <code>editNode.defaults</code> would slow down interactivity.
    // <p>
    // Note: best practice is to use +link{EditContext.setNodeProperties()} and 
    // +link{EditContext.removeNodeProperties()} to change properties, rather than directly
    // modifying +link{EditNode.defaults}.
    //
    // @param editContext (EditContext) the EditContext
    // @param editNode (EditNode) the EditNode
    // @visibility external
    //<
    //updateEditNode : function (editContext, editNode) {
    //},

    //> @attr canvas.autoMaskComponents  (Boolean : null : [IR])
    // When nodes are added to an EditContext, should they be masked by setting
    // +link{editProxy.useEditMask} <code>true</code> if not explicitly set?
    //
    // @deprecated As of SmartClient version 10.0, deprecated in favor of +link{EditProxy.autoMaskChildren}
    // @visibility external
    //<

    // A hook called from EditContext.addNode(), allowing the liveParent to wrap a newNode in
    // some additional structure. Return the parentNode that the newNode should be added to.
    // By default, just returns the parentNode supplied.
    
    wrapChildNode : function (editContext, newNode, parentNode, index) {
        // Add an event mask if so configured
        if (newNode.useEditMask == null && (this.autoMaskComponents || 
            (parentNode && parentNode.liveObject && parentNode.liveObject.editProxy && 
                parentNode.liveObject.editProxy.autoMaskChildren)))
        {
            newNode.useEditMask = true;
        }
        return parentNode;
    },

    //> @attr canvas.editProxy (AutoChild EditProxy : null : IR)
    // An +link{EditProxy} controls the behaviors of a component when it is placed into
    // +link{group:devTools,editing mode}.
    // <p>
    // The <code>editProxy</code> AutoChild is created when a component is first placed into
    // edit mode via +link{canvas.setEditMode()}.
    // <p>
    // <code>editProxy</code> properties can be supplied on a +link{paletteNode} or
    // +link{editNode} as +link{paletteNode.editProxyProperties,editProxyProperties}, but must
    // be provided before the component is first placed into edit mode.
    // <p>
    // Most editable components use a custom EditProxy. See the documentation for
    // each class' +link{canvas.editProxyConstructor,editProxyConstructor} to determine
    // the class.
    //
    // @visibility external
    // @see canvas.setEditMode
    //<
    
    //> @attr canvas.editProxyConstructor (SCClassName : "CanvasEditProxy" : IR)
    // Default class used to construct the +link{EditProxy} for this component
    // when the component is +link{canvas.setEditMode(),first placed into edit mode}.
    //
    // @visibility external
    //<
    editProxyConstructor:"CanvasEditProxy",

    //> @attr canvas.editNode (EditNode : null : R)
    // The component's +link{EditNode} for a component that has been created by a
    // +link{Palette} from a +link{paletteNode}.
    //
    // @visibility external
    //<

    //> @method Canvas.setEditMode()
    // Enable or disable edit mode for this component. Components in editMode must be
    // associated with an +link{EditNode} within an +link{EditContext}.
    // <P>
    // Components with editMode enabled support certain editing interactions which
    // vary depending on the componentType and settings on the 
    // +link{canvas.editProxy,editProxy}.
    // <p>
    // To disable edit mode just pass <code>editingOn</code> as false. The other parameters are
    // not needed.
    // <p>
    // To enable edit mode on this component all three parameters are required.  The
    // <code>editNode</code> is the edit node for this component as it exists within the
    // <code>editContext</code>.
    // <p>
    // An alternative method, +link{EditContext.enableEditing}, can be used when
    // only an editContext and editNode are available.
    // <p>
    // Placing a component into <code>editMode</code> causes the component's
    // +link{canvas.editProxy} to be created.
    //
    // @param editingOn (boolean) true to enable editMode; false to disable
    // @param [editContext] (EditContext) the EditContext
    // @param [editNode] (EditNode) the EditNode
    // @see EditTree
    // @see EditContext
    // @visibility external
    //<
    setEditMode : function (editingOn, editContext, editNode) {
        if (editingOn == null) editingOn = true;
        if (this.editingOn == editingOn) return;
        this.editingOn = editingOn;

        if (this.editingOn) {
            // If an EditTree (or similar) component is passed which contains
            // an EditContext rather than being one, grab the actual EditContext.
            if (editContext && !isc.isAn.EditContext(editContext) && editContext.getEditContext) {
                editContext = editContext.getEditContext();
            }
            this.editContext = editContext;
        }
        
        this.editNode = editNode;
        if (this.editingOn && !this.editProxy) {
            
            var defaults = isc.Canvas._getEditProxyPassThruProperties(this.editContext);
            if (this.editNode && this.editNode.editProxyProperties) isc.addProperties(defaults, this.editNode.editProxyProperties);

            this.editProxy = this.createAutoChild("editProxy", defaults);
        }

        // Allow edit proxy to perform custom operations on edit mode change
        if (this.editProxy) {
            this.editProxy.setEditMode(editingOn);
        }

        // Enable canSelectChildren unless editProxy.canSelectChildren is explicitly false
        
        if (this.editingOn &&
                editContext.canSelectEditNodes &&
                this.editProxy &&
                this.editProxy.canSelectChildren == null &&
                (!this.editNode || this.editNode.type != "Tab"))
        {
            this.editProxy.setCanSelectChildren(true);
        }

        if (this.editingOn && this.editProxy && this.editProxy.canSelectChildren && !editContext._selectionLiveObject) {
            // Hang on to the liveObject that manages the selection UI.
            // It is responsible for showing the outline or other selected state
            editContext._selectionLiveObject = this;
        }

        // In case anything visual has changed, or the widget has different drag-and-drop
        // behavior in edit mode (register/unregisterDroppableItem is called from redraw)
        this.markForRedraw();
    }

    // XXX - Need to do something about Menus in the drop hierarchy - they aren't Class-based
});




isc.Class.addMethods({
    getSchema : function () {
        // NOTE: this.schemaName allows multiple classes to share a single role within editing,
        // eg the various possible implementations of tabs, section headers, etc
        if (this.schemaName) return isc.DS.get(this.schemaName);
        
        // If we have an SGWT class name, then try to get that schema
        var sgwtClassName = this.getSGWTClassName();
        if (sgwtClassName) {
            var schema = isc.DS.get(sgwtClassName);
            if (schema) return schema;
        }

        // If not available, then get the SmartClient class schema
        return isc.DS.get(this.Class);
    },
    getSchemaField : function (fieldName) {
        return this.getSchema().getField(fieldName);
    },
    getObjectField : function (type, excludedFields) {
        // for purposes of component schema lookups, use only the leaf classname for Java
        // classes declared in SGWT
        if (!isc.SGWTFactory.getFactory(type) && type.contains(".")) type = type.split(/\./).pop();

        // cache lookups, but only on Canvases.  FIXME: we should really cache lookups only for
        // framework DataSources
        var cacheLookups = isc.isA.Canvas(this) && excludedFields == null;
        var objectFields;
        if (cacheLookups) {
            objectFields = this._objectFields;
            var undef;
            if (objectFields != null && objectFields[type] !== undef) {
                //this.logWarn("cache hit: " + type);
                return objectFields[type];
            }
        }

        var schema = this.getSchema();
        if (!schema) {
            this.logWarn("getObjectField: no schema exists for: " + this);
            return;
        }
        var fieldName = schema.getObjectField(type, false, excludedFields);

        if (cacheLookups) {
            if (objectFields == null) this._objectFields = objectFields = {};
            objectFields[type] = fieldName;
        }

        return fieldName;
    },
    addChildObject : function (newChildType, child, index, parentProperty) {
        return this._doVerbToChild("add", newChildType, child, index, parentProperty);
    },
    removeChildObject : function (childType, child, parentProperty) {
        return this._doVerbToChild("remove", childType, child, parentProperty);
    },

    _doVerbToChild : function (verb, childType, child, index, parentProperty) {
        var fieldName = parentProperty || this.getObjectField(childType);
        var field = this.getSchemaField(fieldName);

        // for fields that aren't set to multiple, call setProperties to add the object, which
        // will look up and use the setter if there is one 
        // (eg field "contextMenu", "setContextMenu")
        if (field && !field.multiple) {
            var value = (verb == "remove" ? null : child);
            // See if there is a setter on the editProxy for the field.
            // setProperties handles setters on the base object but not the
            // editProxy.
            if (this.editingOn && this.editProxy) {
                var setter = this._getSetter(fieldName);
                if (setter && this.editProxy[setter]) {
                    this.editProxy[setter](value);
                    if (isc.isA.DataSource(value) && this.autoFetchData) this.fetchData(this.initialCriteria);
//                    if (this.propertyChanged) this.propertyChanged(fieldName, value);
                    this.logInfo(verb + "ChildObject calling set property for fieldName '" + fieldName +
                            "'", "editing");
                    return true;
                }
            }
            var props = {};
            props[fieldName] = value;
            this.logInfo(verb + "ChildObject calling setProperties for fieldName '" + fieldName +
                         "'", "editing");
            this.setProperties(props);
            return true;
        }

        // Try to call field method on editProxy first if it exists.
        var targets = [ this.editProxy, this ];
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            if (target == null) continue;

            var methodName = this.getFieldMethod(target, childType, fieldName, verb);
            if (methodName != null && target[methodName]) {
                this.logInfo("calling " + methodName + "(" + this.echoLeaf(child) + 
                             (index != null ? "," + index + ")" : ")"),
                             "editing");
                target[methodName](child, index);
                return true;
            }
        }

        return false;
    },

    getChildObject : function (type, id, parentProperty, idProperty) {
        var fieldName = parentProperty || this.getObjectField(type), 
            field = this.getSchemaField(fieldName);

        if (field == null) {
            if (parentProperty) {
                this.logWarn("getChildObject: no such field '" + parentProperty + 
                             "' in schema: " + this.getSchema());
            } else {
                this.logWarn("getChildObject: schema for Class '" + this.Class + 
                             "' does not have a field accepting type: " + type);
            }
            return null;
        }

        // if the field is not array-valued, just use getPropertyValue, which will auto-discover
        // getters
        if (!field.multiple) return this.getPropertyValue(fieldName);

        // otherwise, look for a getter method and call it with the id
        var methodName;
        
        if (isc.isA.ListGrid(this) && fieldName == "fields") {
            methodName = "getSpecifiedField";
        }

        if (methodName == null) methodName = this.getFieldMethod(this, type, fieldName, "get");
        if (methodName && this[methodName]) {
            this.logInfo("getChildObject calling: " + methodName + "('"+id+"')", "editing");
            return this[methodName](id);
        } else {    
            // if there's no getter method, search the Array directly for something with
            // matching id
            this.logInfo("getChildObject calling getArrayItem('"+id+"',this." + fieldName + ")",
                         "editing");
            return isc.Class.getArrayItem(id, this[fieldName], idProperty);
        }
    },

    // get a method that can perform verb "verb" for an object of type "type" being added to a
    // field named "fieldName", eg, "add" (verb) a "Tab" (type) to field "tabs".
    // Uses naming conventions to auto-discover methods.  Subclasses may need to override for
    // non-discoverable methods, eg, canvas.addChild() is not discoverable from the field name
    // ("children") or type ("Canvas").
    getFieldMethod : function (target, type, fieldName, verb) {
        // NOTE: number of args checks: whether it's an add, remove or get, we're looking for
        // something takes arguments, and we don't want to be fooled by eg Class.getWindow()

        var funcName = verb+type;
        // look for add[type] method, e.g. addTab
        if (isc.isA.Function(target[funcName]) && 
            isc.Func.getArgs(target[funcName]).length > 0) 
        {
            return funcName;
        }

        // look for add[singular form of field name] method, e.g. addMember
        if (fieldName.endsWith("s")) {
            funcName = verb + this._withInitialCaps(fieldName.slice(0,-1));
            if (isc.isA.Function(target[funcName]) && 
                isc.Func.getArgs(target[funcName]).length > 0)
            {
                return funcName;
            }
        }
    },

    // Returns a copy of a string with the first character uppercased.
    _withInitialCaps : function (s) {
        // Uppercase the first letter, then add the rest.
        return s.substring(0,1).toLocaleUpperCase() + s.substring(1);
    },
    
    // EditMode OriginalValues
    // ---------------------------------------------------------------------------------------
    // When a component enters editMode it may change appearance or change interactive
    // behavior, for example, a Tab becomes closable via setting canClose.  However if the tab
    // is not intended to be closeable in the actual application, when we edit the tab we want
    // to show canClose as false and if the user changes the value, we want to track that they
    // have changed the value separately from its temporary setting due to editMode.
    //
    // get/setEditableProperties allows the component to provide specialized properties to a
    // component editor, and saveTo/restoreFromOriginalValues are helpers for a component to
    // track its true, savable state from its temporary editMode settings

    getEditableProperties : function (fieldNames) {
        var properties = {},
            undef;
        if (!this.editModeOriginalValues) this.editModeOriginalValues = {}; 
        if (!isc.isAn.Array(fieldNames)) fieldNames = [fieldNames];
        for (var i = 0; i < fieldNames.length; i++) {
            // Just in case we're passed fields rather than names
            var fieldName = isc.isAn.Object(fieldNames[i]) ? fieldNames[i].name : fieldNames[i];
            
            var value = null;
            if (this.editModeOriginalValues[fieldName] === undef) {
                this.logInfo("Field " + fieldName + " - value [" + this[fieldName] + "] is " + 
                        "coming from live values", "editModeOriginalValues");
                value = this[fieldName];
                // If this is an observation notification function, pick up the thing being observed,
                // not the notification function!
                
                if (isc.isA.Function(value) && value._isObservation) {
                    value = this[value._origMethodSlot];
                }

            } else {
                this.logInfo("Field " + fieldName + " - value [" + 
                        this.editModeOriginalValues[fieldName] + "] is coming from " + 
                        "original values", "editModeOriginalValues");
                value = this.editModeOriginalValues[fieldName];
            }
            properties[fieldName] = value;
        }
        
        return properties;
    },

    // Called to apply properties to an object when it is edited in an EditContext (eg Visual
    // Builder) via EditContext.setNodeProperties().  Note that this is overridden by
    // DrawItem to avoid warnings for attempts to set unsupported properties.
    setEditableProperties : function (properties, trapExceptions) {
        var idField = isc.DS.getAutoIdField(this),
            autoIdField = isc.DS.getToolAutoIdField(this),
            undef;
        if (!this.editModeOriginalValues) this.editModeOriginalValues = {};
        for (var key in properties) {
            if (this.editModeOriginalValues[key] === undef) {
                this.logInfo("Field " + key + " - value is going to live values", 
                        "editModeOriginalValues");
                // When setting the "autoID" field for an object, the corresponding "ID"
                // field should be updated instead. This matches the behavior during
                // object creation.
                var property = (idField && autoIdField && key == autoIdField ? idField : key);
                try {
                    this.setProperty(property, properties[key]);
                } catch (e) {
                    if (trapExceptions) {
                        this.logWarn("Failed to update component property '" + property + "' on " + this + ". Error: " + e, "componentExceptions");
                        // Let caller know that the setting failed
                        throw e;
                    }
                }
            } else {
                this.logInfo("Field " + key + " - value is going to original values", 
                        "editModeOriginalValues");
                this.editModeOriginalValues[key] = properties[key];
            }
        }
        this.editablePropertiesUpdated(properties);
    },

    // called when a child object that is not itself an SC class is having properties applied
    // to it in an EditContext.  Enables cases like a ListGrid handling changes to its
    // ListGridFields
    setChildEditableProperties : function (liveObject, properties, editNode, editContext) {
        this.setDescendantEditableProperties(liveObject, properties, editNode, editContext, 0);
    },

    // called when some descendent object that is not itself an SC class is having properties
    // applied to it in an EditContext.  Enables cases like a NavPanel handling changes to
    // one of its items, regardless of where it is in the item tree.
    // `level' is a number for the depth of the descendant, where 0 = direct child, 1 = grandchild, etc.
    setDescendantEditableProperties : function (liveObject, properties, editNode, editContext, level) {
        isc.addProperties(liveObject, properties);
    },

    saveToOriginalValues : function (fieldNames) {
        var undef;
        if (!this.editModeOriginalValues) this.editModeOriginalValues = {};
        for (var i = 0; i < fieldNames.length; i++) {
            // Just in case we're passed fields rather than names
            var fieldName = isc.isAn.Object(fieldNames[i]) ? fieldNames[i].name : fieldNames[i];
            if (this[fieldName] === undef) {
                // We'll have to store it as explicit null, otherwise the downstream code won't
                // realize we took a copy
                this.editModeOriginalValues[fieldName] = null;
            } else {
                if (this[fieldName] && this[fieldName]._isObservation) {
                    // Pick up the original method, not the notification function set up by
                    // observation.
                    // If we ever restore the method we want to be restoring the underlying functionality
                    // and not restoring a notification function which may no longer be valid.
                    var origMethodName = isc._obsPrefix + fieldName;
                    this.editModeOriginalValues[fieldName] = this[origMethodName];
                } else {
                    this.editModeOriginalValues[fieldName] = this[fieldName];
                }
            }
        }
    },
    
    restoreFromOriginalValues : function (fieldNames) {
        var undef;
        if (!this.editModeOriginalValues) this.editModeOriginalValues = {};
        var changes = {};
        for (var i = 0; i < fieldNames.length; i++) {
            // Just in case we're passed fields rather than names
            var fieldName = isc.isAn.Object(fieldNames[i]) ? fieldNames[i].name : fieldNames[i];
            if (this.editModeOriginalValues[fieldName] !== undef) {
                changes[fieldName] = this.editModeOriginalValues[fieldName];
                
                // Zap the editModeOriginalValues copy so that future queries will return 
                // the live value
                delete this.editModeOriginalValues[fieldName];
            } else {
            }
        }
        // Note use setProperties() rather than just hanging the attributes onto the live
        // widget blindly.
        // Required because:
        // - StringMethods need to be converted to live methods
        // - Observation will be left intact (setProperties/addProperties will correctly update
        //   the renamed underlying method rather than the notification method sitting in its slot)
        // - setProperties will fire propertyChanged which we use in some cases (For example
        //   to update "canDrag" when "canDragRecordsOut" is updated on a ListGrid)
        
        isc._suppressNonFunctionMessage = true;
        this.setProperties(changes);
        delete isc._suppressNonFunctionMessage;
    },
    
    getOriginalValue : function (fieldName) {
        var undef;
        if (this.editModeOriginalValues && this.editModeOriginalValues[fieldName] !== undef) {
            return this.editModeOriginalValues[fieldName];
        }
        // return undef
    },

    clearOriginalValues : function (fieldNames) {
        var undef;
        if (!this.editModeOriginalValues) return;
        for (var i = 0; i < fieldNames.length; i++) {
            // Just in case we're passed fields rather than names
            var fieldName = isc.isAn.Object(fieldNames[i]) ? fieldNames[i].name : fieldNames[i];
            if (this.editModeOriginalValues[fieldName] !== undef) {
                // Zap the editModeOriginalValues copy so that future queries will return 
                // the live value
                delete this.editModeOriginalValues[fieldName];
            }
        }
    },

    propertyHasBeenEdited : function (fieldName) {
        var undef;
        if (!this.editModeOriginalValues) return false;
        // Just in case we're passed a field rather than a field name
        if (isc.isAn.Object(fieldName)) fieldName = fieldName.name;
        if (this.editModeOriginalValues[fieldName] !== undef) {
            if (isc.isA.Function(this.editModeOriginalValues[fieldName])) return false;
            if (this.editModeOriginalValues[fieldName] != this[fieldName]) return true;
        }
        return false;
    },

    // Override if you have a class that needs to be notified when editor properties have 
    // potentially changed. This method is not called if the live object is not updated.
    editablePropertiesUpdated : function (properties) { }

});



isc.DataSource.addClassMethods({

    // Given a parent object and child type, use schema to find out what field children
    // of that type are kept under
    // ---------------------------------------------------------------------------------------
    getSchema : function (object) {
        if (isc.isA.Class(object)) return object.getSchema();
        return isc.DS.get(object.schemaName || object._constructor || object.Class);
    },
    getObjectField : function (object, type) {
        if (object == null) return null;
        if (isc.isA.Class(object)) return object.getObjectField(type);

        var schema = isc.DS.getSchema(object);
        if (schema) return schema.getObjectField(type);
    },
    getSchemaField : function (object, fieldName) {
        var schema = isc.DS.getSchema(object);
        if (schema) return schema.getField(fieldName);
    },

    // Add/remove an object to another object, automatically detecting the appropriate field,
    // and calling add/remove functions if they exist on the parent
    // ---------------------------------------------------------------------------------------
    addChildObject : function (parent, newChildType, child, index, parentProperty) {
        return this._doVerbToChild(parent, "add", newChildType, child, index, parentProperty);
    },
    removeChildObject : function (parent, childType, child, parentProperty) {
        return this._doVerbToChild(parent, "remove", childType, child, null, parentProperty);
    },
    _doVerbToChild : function (parent, verb, childType, child, index, parentProperty) {
        var fieldName = parentProperty || isc.DS.getObjectField(parent, childType);

        if (fieldName == null) {
            this.logWarn("No field for child of type " + childType);
            return false;
        }

        this.logInfo(verb + " object " + this.echoLeaf(child) + 
                     " in field: " + fieldName +
                     " of parentObject: " + this.echoLeaf(parent), "editing");
        var field = isc.DS.getSchemaField(parent, fieldName);

        // if it's a Class, call doVerbToChild on it, which will look for a method that
        // modifies the field
        if (isc.isA.Class(parent)) {
            // if that worked, we're done
            if (parent._doVerbToChild(verb, childType, child, index, parentProperty)) return true;
        }

        // either it's not a Class, or no appropriate method was found, we'll just directly
        // manipulate the properties

        if (field && !field.multiple) {
            // simple field: "add" is assignment, "remove" is deletion
            if (verb == "add") parent[fieldName] = child;
            else if (verb == "remove") {
                // NOTE: null check avoids creating null slots on no-op removals
                if (parent[fieldName] != null) delete parent[fieldName];
            } else {
                this.logWarn("unrecognized verb: " + verb);
                return false;
            }
            return true;
        }

        this.logInfo("using direct Array manipulation for field '" + fieldName + "'", "editing");

        // Array field: add or remove at index
        var fieldArray = parent[fieldName];
        if (verb == "add") {
            if (fieldArray != null && !isc.isAn.Array(fieldArray)) {
                this.logWarn("unexpected field value: " + this.echoLeaf(fieldArray) +
                             " in field '" + fieldName + 
                             "' when trying to add child: " + this.echoLeaf(child));
                return false;
            }
            if (fieldArray == null) parent[fieldName] = fieldArray = [];
            if (index != null) fieldArray.addAt(child, index);
            else fieldArray.add(child);
        } else if (verb == "remove") {
            if (!isc.isAn.Array(fieldArray)) return false;
            if (index != null) fieldArray.removeAt(child, index);
            else fieldArray.remove(child);
        } else {
            this.logWarn("unrecognized verb: " + verb);
            return false;
        }

        return true;
    },

    getChildObject : function (parent, type, id, parentProperty, idProperty) {
        if (isc.isA.Class(parent)) return parent.getChildObject(type, id, parentProperty, idProperty);

        var fieldName = isc.DS.getObjectField(parent, type), 
            field = isc.DS.getSchemaField(parent, fieldName);


        var value = parent[fieldName];
        //this.logWarn("getting type: " + type + " from field: " + fieldName +
        //             ", value is: " + this.echoLeaf(value));
        if (!field.multiple) return value;

        if (!isc.isAn.Array(value)) return null;
        return isc.Class.getArrayItem(id, value, idProperty);
    },

    // AutoId: field that can have some kind of automatically or manually assigned ID to
    // make the object referenceable in a builder environment
    // ToolAutoId: field that should have some kind of automatically assigned ID to
    // make the object referenceable in a builder environment. The presence of this field
    // signals VB that the value can be changed at any time.
    // ---------------------------------------------------------------------------------------
    getAutoIdField : function (object) {
        var schema = this.getNearestSchema(object);
        return schema ? schema.getAutoIdField() : "ID";
    },

    getToolAutoIdField : function (object) {
        var schema = this.getNearestSchema(object);
        return schema ? schema.getToolAutoIdField() : "autoID";
    },

    getUsedAutoIdField : function (object) {
        var idName = this.getAutoIdField(object),
            autoIdName = this.getToolAutoIdField(object)
        ;
        return (autoIdName && object[autoIdName] != null
                ? autoIdName
                : (idName && object[idName] != null ? idName : null));
    },

    getAutoId : function (object, paletteNode) {
        var idName = this.getAutoIdField(paletteNode || object),
            autoIdName = this.getToolAutoIdField(paletteNode || object)
        ;
        return (autoIdName ? object[autoIdName] : null) || (idName ? object[idName] : null);
    }
});

isc.DataSource.addMethods({
    getAutoIdField : function () {
        return this.getInheritedProperty("autoIdField") || "ID";
    },

    getToolAutoIdField : function () {
        var idField = this.getAutoIdField();
        return "auto" + idField.substring(0,1).toUpperCase() + idField.substring(1);
    },

    // In Reify, whether a component should be create()d before being added to it's parent.
    // ---------------------------------------------------------------------------------------
    shouldCreateStandalone : function () {
        if (this.createStandalone != null) return this.createStandalone;
        if (!this.superDS()) return true;
        return this.superDS().shouldCreateStandalone();
    }
});


// Edit Mode impl for Buttons, Labels and Imgs
// -------------------------------------------------------------------------------------------
isc.StatefulCanvas.addProperties({
    //> @attr statefulCanvas.editProxyConstructor (SCClassName : "StatefulCanvasEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor: "StatefulCanvasEditProxy"
});

isc.Img.addProperties({
    //> @attr img.editProxyConstructor (SCClassName : "ImgEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor: "ImgEditProxy"
});

isc.ToolStripSeparator.addProperties({
    //> @attr toolStripSeparator.editProxyConstructor (SCClassName : "ToolStripSeparatorEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor: "ToolStripSeparatorEditProxy"
});

isc.RibbonGroup.addProperties({
    //> @attr ribbonGroup.editProxyConstructor (SCClassName : "RibbonGroupEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor: "RibbonGroupEditProxy"
});

isc.RibbonButton.addProperties({
    //> @attr ribbonButton.editProxyConstructor (SCClassName : "RibbonButtonEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor: "RibbonButtonEditProxy"
});

isc.Label.addProperties({
    //> @attr label.editProxyConstructor (SCClassName : "LabelEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor: "LabelEditProxy"
});

isc.Progressbar.addProperties({
    //> @attr progressbar.editProxyConstructor (SCClassName : "ProgressbarProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor: "ProgressbarEditProxy"
});

if (isc.MenuButton) {
    isc.MenuButton.addProperties({
        //> @attr menuButton.editProxyConstructor (SCClassName : "MenuEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "MenuEditProxy"
    });
}

if (isc.MenuBar) {
    isc.MenuBar.addProperties({
        //> @attr menuBar.editProxyConstructor (SCClassName : "MenuEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "MenuEditProxy"
    });
}

if (isc.Menu) {
    isc.Menu.addProperties({
        //> @attr menu.editProxyConstructor (SCClassName : "MenuEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "MenuEditProxy"
    });
}

// Edit Mode impl for TabSet
// -------------------------------------------------------------------------------------------
if (isc.TabSet) {
    isc.TabSet.addProperties({
        //> @attr tabSet.editProxyConstructor (SCClassName : "TabSetEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"TabSetEditProxy",
        defaultPaneConstructor:"VLayout"   // Also supported is defaultPaneDefaults
    });

    isc.TabBar.addMethods({
        //> @attr tabBar.editProxyConstructor (SCClassName : "TabBarEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"TabBarEditProxy"
    });
}

// Edit Mode impl for Layout, SplitPane and Window
// -------------------------------------------------------------------------------------------
if (isc.Layout)  {
    isc.Layout.addProperties({
        //> @attr layout.editProxyConstructor (SCClassName : "LayoutEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"LayoutEditProxy"
    });
}

if (isc.LayoutResizeBar)  {
    isc.LayoutResizeBar.addProperties({
        //> @attr layoutResizeBar.editProxyConstructor (SCClassName : "LayoutResizeBarEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "LayoutResizeBarEditProxy"
    });
}
if (isc.LayoutResizeSnapbar)  {
    isc.LayoutResizeSnapbar.addProperties({
        //> @attr layoutResizeSnapbar.editProxyConstructor (SCClassName : "LayoutResizeBarEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility internal
        //<
        editProxyConstructor: "LayoutResizeBarEditProxy"
    });
}

if (isc.SplitPane) {
    isc.SplitPane.addProperties({
        //> @attr splitPane.editProxyConstructor (SCClassName : "SplitPaneEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"SplitPaneEditProxy"
    });
}

if (isc.Deck) {
    isc.Deck.addProperties({
        editProxyConstructor:"DeckEditProxy"
    });
}

if (isc.NavPanel) {
    isc.NavPanel.addProperties({
        editProxyConstructor:"NavPanelEditProxy",

        // Called after editNode is added to editContext and after the node
        // has been "opened" within the editTree. 
        addedToEditContext : function (editContext, newNode, parentNode, index) {
            // If not loading a screen, allow NavPanelEditProxy to display instructions
            // for NavGrid if no NavItems are present. There shouldn't be any at this point.
            if (!isc._loadingNodeTree && this.editContext.isReify) {
                newNode.liveObject.editProxy.loadComplete();
            }
        }
    });
}
if (isc.NavItem) {
    isc.NavItem.addProperties({
        editProxyConstructor:"NavItemEditProxy",

        // Note: this impl contains code duplicated from EditProxy.setEditMode 
        // because NavItem does not extend Canvas.  
        setEditMode : function(editingOn, editContext, editNode) {
            if (editingOn == null) editingOn = true;
            if (this.editingOn == editingOn) return;
            this.editingOn = editingOn;

            if (this.editingOn) {
                // If an EditTree (or similar) component is passed which contains
                // an EditContext rather than being one, grab the actual EditContext.
                if (editContext && !isc.isAn.EditContext(editContext) && editContext.getEditContext) {
                    editContext = editContext.getEditContext();
                }
                this.editContext = editContext;
            }

            this.editNode = editNode;
            if (this.editingOn && !this.editProxy) {
                
                var defaults = isc.Canvas._getEditProxyPassThruProperties(this.editContext);
                if (this.editNode && this.editNode.editProxyProperties) isc.addProperties(defaults, this.editNode.editProxyProperties);
                this.editProxy = this.createAutoChild("editProxy", defaults);
            }

            // Allow edit proxy to perform custom operations on edit mode change
            if (this.editProxy) this.editProxy.setEditMode(editingOn);
        }
    });
}

if (isc.Window) {
    isc.Window.addProperties({
        //> @attr window.editProxyConstructor (SCClassName : "WindowEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"WindowEditProxy",

        // Called after editNode is added to editContext and after the node
        // has been "opened" within the editTree. Individual window header/footer
        // components in the editTree are unlikely to be altered and are therefore
        // hidden by means of closing the window folder node initially.
        addedToEditContext : function (editContext, newNode, parentNode, index) {
            var data = this.editContext.getEditNodeTree();
            data.closeFolder(newNode);

            // If not loading a screen, allow WindowEditProxy to create default nodes
            // for the header/footer controls. This is the same action done after screen load.
            if (!isc._loadingNodeTree && this.editContext.isReify) {
                newNode.liveObject.editProxy.loadComplete();
            }
        }
    });
    // Both header and footer use the same editProxy but editProxy.isHeader is set
    // to allow proxy to know which it is servicing.
    isc.Window.changeDefaults("headerDefaults", {
        editProxyConstructor:"WindowHeaderEditProxy",
        editProxyProperties: { isHeader: true }
    });
    isc.Window.changeDefaults("footerDefaults", {
        editProxyConstructor:"WindowHeaderEditProxy"
    });
}

if (isc.ModalWindow) {
    isc.ModalWindow.addProperties({
        //> @attr modalWindow.editProxyConstructor (SCClassName : "WindowEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"WindowEditProxy"
    });
}

if (isc.InlineWindow) {
    isc.InlineWindow.addProperties({
        //> @attr inlineWindow.editProxyConstructor (SCClassName : "WindowEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"WindowEditProxy"
    });
}

if (isc.DetailViewer) {
    isc.DetailViewer.addProperties({
        //> @attr detailViewer.editProxyConstructor (SCClassName : "DetailViewerEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"DetailViewerEditProxy"
    });
}

if (isc.Header)  {
    isc.Header.addProperties({
        //> @attr header.editProxyConstructor (SCClassName : "HeaderEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"HeaderEditProxy"
    });
}

if (isc.Slider) {
    isc.Slider.addProperties({
        editablePropertiesUpdated : function (properties) {
            if (properties[this._$vertical] != null) {
                var editContext = this.editContext,
                    editNode = this.editNode
                ;
                if (editContext.isEditNodeSelected(editNode)) {
                    // Changing slider orientation. That means the _userHeight and _userWidth
                    // may have been saved when selected and, if so, they need to be updated 
                    // so that upon deselection the correct values are retained.
                    // The same applies if width/height are changed.
                    if (this.getOriginalValue("width") != null ||
                        this.getOriginalValue("height") != null)
                    {
                        this.saveToOriginalValues(["width", "height"]);
                    }
                    if (this.getOriginalValue("_userWidth") != null ||
                        this.getOriginalValue("_userHeight") != null)
                    {
                        this.saveToOriginalValues(["_userWidth", "_userHeight"]);
                    }
                }
            }
        }
    });
}

// Edit Mode impl for PortalLayout and friends
// -------------------------------------------------------------------------------------------
//
// Note that PortalLayout and friends have some special features with respect to EditMode.
//
// 1. Even in "live" mode (rather than just "edit" mode), you can drag nodes from a Palette to
//    a PortalLayout and it will do the right thing -- it will create the liveObject from the node,
//    and, if necessary, wrap it in a Portlet. Of course, you have to be in "edit" mode to edit
//    the contents of a Portlet.
//
// 2. The normal user interface of PortalLayout allows the user to adjust the number of columns,
//    move columns around, move Portlets around, etc. Even in "live" mode, the code will adjust
//    the editNodes so that they correspond to the user's actions. You can see this in 
//    Reify, for instance, by creating a PortalLayout with some Portlets in "edit" mode,
//    and then switching to "live" mode and moving the Portlets around -- the editNodes will follow.
//
// In order to make this work, there are some bits of code in Portal.js that take account of
// edit mode, but the larger pieces that can be broken out separately are here.

if (isc.Portlet) {
isc.Portlet.addClassMethods({
    shouldPersistCoordinates : function (editContext, editNode) {
        if (editContext.persistCoordinates == false) return false;

        var parentNode = editContext.getEditNodeTree().getParent(editNode);

        // Can't be persisting coordinates if parent doesn't exist
        if (!parentNode) return false;
        var liveParent = parentNode.liveObject;

        return (liveParent && !liveParent.editProxy || liveParent.editProxy.persistCoordinates != false);
    }
});

isc.Portlet.addProperties({
    //> @attr portlet.editProxyConstructor (SCClassName : "PortletEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor:"PortletEditProxy",

    updateEditNode : function (editContext, editNode) {
        if (isc.Portlet.shouldPersistCoordinates(editContext, editNode)) {
            // We only save if the user has specified a width
            var width = this._percent_width || this._userWidth;
            if (width) {
                editContext.setNodeProperties(editNode, {
                    width: width
                }, true);
            } else {
                editContext.removeNodeProperties(editNode, "width");
            }
        }
    }
});

isc.PortalRow.addProperties({
    editProxyConstructor: "PortalRowEditProxy",
    
    updateEditNode : function (editContext, editNode) {
        if (isc.Portlet.shouldPersistCoordinates(editContext, editNode)) {
            // We only save if the user has specified a height
            var height = this._percent_height || this._userHeight;
            if (height) {
                editContext.setNodeProperties(editNode, {
                    height: height
                }, true);
            } else {
                editContext.removeNodeProperties(editNode, "height");
            }
        }
    },

    wrapChildNode : function (editContext, newNode, parentNode, index) {
        var liveObject = newNode.liveObject;

        if (isc.isA.Portlet(liveObject)) {
            // If it's a portlet, then we're fine
            return parentNode;
        } else {
            // If it's something else, we'll wrap it in a Portlet
            var portletNode = editContext.makeEditNode({
                type: "Portlet",
                defaults: {
                    title: newNode.title,
                    destroyOnClose: true
                }
            });

            editContext.addNode(portletNode, parentNode, index);
            return portletNode;
        }
    },

    // Called from getDropComponent to deal with drops from palettes
    handleDroppedEditNode : function (dropComponent, dropPosition) {
        var editContext = this.editContext;
        var editNode = this.editNode;

        if (isc.isA.Palette(dropComponent)) {
            // Drag and drop from palette
            var data = dropComponent.transferDragData();
            data = isc.isAn.Array(data) ? data[0] : data;
            var component = (editContext ? editContext.makeEditNode(data) : dropComponent.makeEditNode(data));
        
            if (editContext && editNode) {
                // If we have an editContext and editNode, just use them. The wrapping
                // is handled by wrapChildNode in this case. We return false to cancel the drop,
                // since addNode will have taken care of it.
                editContext.addNode(component, editNode, dropPosition);
                return false;
            } else {
                // If we don't have an editContext and editNode. then we'll wrap the liveObject
                // in a Portlet if necessary.
                if (isc.isA.Portlet(component.liveObject)) {
                    // If it's a Portlet, we're good
                    dropComponent = component.liveObject;
                } else {
                    // If not, we'll wrap it in one
                    dropComponent = isc.Portlet.create({
                        autoDraw: false,
                        title: component.title,
                        items: [component.liveObject],
                        destroyOnClose: true
                    });
                }
            }
        }

        return dropComponent;
    }
});

isc.PortalColumnBody.addProperties({
    
    // Called from getDropComponent to deal with drops from palettes
    handleDroppedEditNode : function (dropComponent, dropPosition) {
        
        var editContext = this.creator.editContext;
        var editNode = this.creator.editNode;

        if (isc.isA.Palette(dropComponent)) {
            // Drag and drop from palette
            var data = dropComponent.transferDragData();
            data = isc.isAn.Array(data) ? data[0] : data;
            var component = (editContext ? editContext.makeEditNode(data) : dropComponent.makeEditNode(data));

            if (editContext && editNode) {
                // If we have an editContext and editNode, just use them. The wrapping
                // is handled by wrapChildNode in this case. We return false to cancel the drop,
                // since addNode will have taken care of it.
                editContext.addNode(component, editNode, dropPosition);
                return false;
            } else {
                // If we don't have an editContext and editNode, then wrap the liveObject
                // in a Portlet if necessary.
                if (isc.isA.Portlet(component.liveObject)) {
                    // If it's a Portlet, we're good
                    dropComponent = component.liveObject;
                } else {
                    // If not, we'll wrap it in one
                    dropComponent = isc.Portlet.create({
                        autoDraw: false,
                        title: component.title,
                        items: [component.liveObject],
                        destroyOnClose: true
                    });
                }
            }
        }
     
        if (dropComponent) {
            // We need to check whether the dropComponent is already the only portlet
            // in an existing row. If so, we can simplify by just dropping
            // the row -- that is what the user will have meant. 
            var currentRow = dropComponent.portalRow;
            if (currentRow && currentRow.parentElement == this && currentRow.getMembers().length == 1) {
                // Check whether we need to adjust the editNodes
                if (editContext && editNode && currentRow.editNode) {
                    var currentIndex = this.getMemberNumber(currentRow);

                    // Check if we're not really changing position
                    if (dropPosition == currentIndex || dropPosition == currentIndex + 1) return;
                    editContext.removeNode(currentRow.editNode);
                    
                    // Adjust dropPosition if we are dropping after the currentIndex
                    if (currentIndex < dropPosition) dropPosition -= 1;
                    editContext.addNode(currentRow.editNode, editNode, dropPosition); 
                   
                    // Cancel the drop, since we've handled it ...
                    return false;
                }
            } else {
                // If we're not moving a whole current row, then we add the new portlet, creating a new row
                if (editContext && editNode && dropComponent.editNode) {
                    editContext.addNode(dropComponent.editNode, editNode, dropPosition);

                    // Cancel the drop, since we've handled it ...
                    return false;
                }
            }
        }

        // We'll get here if we're not doing something special with the dropComponent's editNode ...
        // in that case, we can return it and getDropComponent can handle it. 
        return dropComponent;
    }
});

isc.PortalColumn.addProperties({
    editProxyConstructor:"PortalColumnEditProxy",

    wrapChildNode : function (editContext, newNode, parentNode, index) {
        var liveObject = newNode.liveObject;

        if (isc.isA.PortalRow(liveObject) || newNode.type == "PortalRow") {
            // If it's a PortalRow, then we're fine
            return parentNode;
        } else if (isc.isA.Portlet(liveObject)) {
            // If it's a portlet, then we'll wrap it in a row
            var rowNode = editContext.makeEditNode({
                type: this.rowConstructor,
                defaults: {}
            });
            editContext.addNode(rowNode, parentNode, index);
            return rowNode;
        } else {
            // If it's something else, we'll wrap it in a Portlet
            var portletNode = editContext.makeEditNode({
                type: "Portlet",
                defaults: {
                    title: newNode.title,
                    destroyOnClose: true
                }
            });
            // Note that when we add the Portlet node, we'll eventually
            // get back here to wrap it in a PortalRow, so we don't need
            // to take care of that explicitly (though we could).
            editContext.addNode(portletNode, parentNode, index);
            return portletNode;
        }
    },
    
    updateEditNode : function (editContext, editNode) {
        if (isc.Portlet.shouldPersistCoordinates(editContext, editNode)) {
            // We only save if the user has specified a width
            var width = this._percent_width || this._userWidth;
            if (width) {
                editContext.setNodeProperties(editNode, {
                    width: width
                }, true);
            } else {
                editContext.removeNodeProperties(editNode, "width");
            }
        }
    }
});

isc.PortalLayout.addProperties({
    editProxyConstructor: "PortalLayoutEditProxy",
    
    // We need to do some special things when we learn of our EditContext and EditNode
    addedToEditContext : function (editContext, editNode) {
        // We may need to add our PortalColumns to the EditContext, since they may have already been created.
        for (var i = 0; i < this.getNumColumns(); i++) {
            var column = this.getPortalColumn(i);
            
            if (!column.editContext) {
                // Create the editNode, supplying the liveObject
                var node = editContext.makeEditNode({
                    type: this.columnConstructor,
                    liveObject: column, 
                    defaults: {
                        ID: column.ID,
                        _constructor: this.columnConstructor
                    }
                });
                
                // Add it to the EditContext, without adding the liveObject to the parent, since it's
                // already there.
                editContext.addNode(node, editNode, i, null, true); 
            }
        }

        // And we should change our defaults to specify numColumns: 0, because otherwise we'll
        // initialize the default 2 columns when restored, which isn't what will be wanted
        editNode.defaults.numColumns = 0;
    },

    wrapChildNode : function (editContext, newNode, parentNode, index) {
        var liveObject = newNode.liveObject;

        // If adding a PortalColumn, we're good
        if (isc.isA.PortalColumn(liveObject)) {
            return parentNode;
        }

        // Otherwise a new node can only be added to a column.
        // Default to the first column.
        var column = this.getPortalColumn(0);
        if (!column) return null;

        parentNode = column.editNode;

        if (isc.isA.Portlet(liveObject)) {
            // If it's a portlet, then we're fine
            return parentNode;
        } else {
            // If it's something else, we'll wrap it in a Portlet
            var portletNode = editContext.makeEditNode({
                type: "Portlet",
                defaults: {
                    title: newNode.title,
                    destroyOnClose: true
                }
            });

            editContext.addNode(portletNode, parentNode, index);
            return portletNode;
        }
    }
});
}

// Edit Mode impl for DynamicForm
// -------------------------------------------------------------------------------------------
if (isc.DynamicForm) {
    
    isc.DynamicForm.addProperties({
        //> @attr dynamicForm.editProxyConstructor (SCClassName : "FormEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"FormEditProxy",

        setEditorType : function (item, editorType) {
            if (!item.editContext || item.type == editorType) return;

            var editContext = item.editContext,
                tree = editContext.getEditNodeTree(),
                editNode = item.editNode,
                parentNode = tree.getParent(editNode),
                index = tree.getChildren(parentNode).indexOf(editNode),
                newPaletteNode = editContext.makePaletteNode(editNode)
            ;

            // Overlay paletteNode with default paletteNode contents for the new editor type
            isc.addProperties(newPaletteNode, editContext.findPaletteNode("type", editorType) ||
                this.findPaletteNode("className", editorType));
            // re-create paletteNode to drop any extraneous properties from the default palette node
            newPaletteNode = editContext.makePaletteNode(newPaletteNode);

            // Change editNode type to match editorType. editorType is already part of
            // the defaults because of the change.
            newPaletteNode.type = editorType;

            var newEditNode = editContext.makeEditNode(newPaletteNode);

            // If there are child nodes remove them first and add them back later.
            var childNodes = tree.getChildren(editNode);
            if (childNodes) {
                childNodes = childNodes.duplicate();
                for (var i = 0; i < childNodes.length; i++) {
                    var liveChild = editContext.getLiveObject(childNodes[i]);
                    if (editContext.isComponentSelected(liveChild)) {
                        editContext.deselectComponents(liveChild, true);
                    }
                    editContext.removeNode(childNodes[i], true);
                }
            }
            var liveChild = editContext.getLiveObject(editNode);
            if (editContext.isComponentSelected(liveChild)) {
                editContext.deselectComponents(liveChild, true);
            }

            editContext.removeNode(editNode);
            var node = editContext.addNode(newEditNode, parentNode, index);

            if (childNodes) {
                for (var i = 0; i < childNodes.length; i++) {
                    editContext.addNode(childNodes[i], node);
                }
                // Delay selection to allow component to draw
                editContext.delayCall("selectSingleEditNode", [node]);
            }
        }
    });

// Edit Mode extras for FormItem and its children
// -------------------------------------------------------------------------------------------

    isc.FormItem.addMethods({
        //> @attr formItem.editProxyConstructor (SCClassName : "FormItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"FormItemEditProxy",

        // Note: this impl contains code duplicated from EditProxy.setEditMode 
        // because FormItem does not extend Canvas.  
        setEditMode : function(editingOn, editContext, editNode) {
            if (editingOn == null) editingOn = true;
            if (this.editingOn == editingOn) return;
            this.editingOn = editingOn;

            if (this.editingOn) {
                // If an EditTree (or similar) component is passed which contains
                // an EditContext rather than being one, grab the actual EditContext.
                if (editContext && !isc.isAn.EditContext(editContext) && editContext.getEditContext) {
                    editContext = editContext.getEditContext();
                }
                this.editContext = editContext;
            }

            this.editNode = editNode;
            if (this.editingOn && !this.editProxy) {
                
                var defaults = isc.Canvas._getEditProxyPassThruProperties(this.editContext);
                if (this.editNode && this.editNode.editProxyProperties) isc.addProperties(defaults, this.editNode.editProxyProperties);
                this.editProxy = this.createAutoChild("editProxy", defaults);
            }

            // Allow edit proxy to perform custom operations on edit mode change
            if (this.editProxy) this.editProxy.setEditMode(editingOn);
        },

        // FormItem proxy for DynamicForm.setEditorType
        setEditorType : function (editorType) {
            if (this.form) this.form.setEditorType(this, editorType);
        },

        updateEditNode : function (editContext, editNode) {
            var validators = editNode.defaults && editNode.defaults.validators;

            

            if (validators && (validators.find("_generated", true) ||
                validators.find("_basic", true) ||
                validators.find("_dsValidator", true)))
            {
                var filteredValidators = [];
                for (var i = 0; i < validators.length; i++) {
                    var validator = validators[i];
                    if (!validator._generated && !validator._basic && !validator._dsValidator) {
                        filteredValidators.add(isc.addProperties({}, validator));
                    }
                }
                if (filteredValidators.length > 0) {
                    editContext.setNodeProperties(editNode, {
                        validators: filteredValidators
                    }, true);
                } else {
                    editContext.removeNodeProperties(editNode, ["validators"]);
                }
            }
        },

        setEditableProperties : function (properties) {
            // valueProperty and facetFields cannot have the same values
            if (properties.validators) {
                

                // Get a filtered list of validators that should not be affected

                var validators = this.validators,
                    filteredValidators = []
                ;
                if (validators && (validators.find("_generated", true) ||
                    validators.find("_basic", true) ||
                    validators.find("_dsValidator", true)))
                {
                    var filteredValidators = [];
                    for (var i = 0; i < validators.length; i++) {
                        var validator = validators[i];
                        if (validator._generated || validator._basic || validator._dsValidator) {
                            filteredValidators.add(isc.addProperties({}, validator));
                        }
                    }
                }

                filteredValidators.addListAt(properties.validators, 0);
                properties.validators = filteredValidators;
            }
            this.Super("setEditableProperties", arguments);
        }
    });

    isc.FileItem.addProperties({
        //> @attr fileItem.editProxyConstructor (SCClassName : "FileItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"FileItemEditProxy"
    });

    isc.UploadItem.addProperties({
        //> @attr uploadItem.editProxyConstructor (SCClassName : "FileItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"FileItemEditProxy"
    });

    isc.TextItem.addProperties({
        //> @attr textItem.editProxyConstructor (SCClassName : "TextItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"TextItemEditProxy"
    });

    isc.TextAreaItem.addProperties({
        //> @attr textAreaItem.editProxyConstructor (SCClassName : "TextAreaItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"TextAreaItemEditProxy"
    });

    isc.StaticTextItem.addProperties({
        //> @attr staticTextItem.editProxyConstructor (SCClassName : "TextItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"TextItemEditProxy"
    });

    isc.BlurbItem.addProperties({
        //> @attr blurbItem.editProxyConstructor (SCClassName : "BlurbItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"BlurbItemEditProxy"
    });

    isc.ButtonItem.addProperties({
        //> @attr buttonItem.editProxyConstructor (SCClassName : "ButtonItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"ButtonItemEditProxy"
    });

    isc.SelectItem.addProperties({
        //> @attr selectItem.editProxyConstructor (SCClassName : "SelectItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"SelectItemEditProxy"
    });

    isc.ComboBoxItem.addProperties({
        //> @attr comboBoxItem.editProxyConstructor (SCClassName : "SelectItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"SelectItemEditProxy"
    });

    isc.RadioGroupItem.addProperties({
        //> @attr radioGroupItem.editProxyConstructor (SCClassName : "RadioGroupItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"RadioGroupItemEditProxy"
    });

    isc.CheckboxItem.addProperties({
        //> @attr checkboxItem.editProxyConstructor (SCClassName : "CheckboxItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"CheckboxItemEditProxy"
    });

    if (isc.DateItem) {
    isc.DateItem.addProperties({
        //> @attr dateItem.editProxyConstructor (SCClassName : "DateItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"DateItemEditProxy"
    });
    }

    if (isc.HeaderItem) {
        isc.HeaderItem.addProperties({
            //> @attr headerItem.editProxyConstructor (SCClassName : "TextItemEditProxy" : IR)
            // @include canvas.editProxyConstructor
            // @visibility external
            //<
            editProxyConstructor:"TextItemEditProxy"
        });
    }
}

// Edit Mode impl for SectionStack
// -------------------------------------------------------------------------------------------
isc.SectionStack.addMethods({
    //> @attr sectionStack.editProxyConstructor (SCClassName : "SectionStackEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor:"SectionStackEditProxy"
}); 
isc.SectionHeader.addMethods({
    //> @attr sectionHeader.editProxyConstructor (SCClassName : "SectionStackSectionEditProxy" : IR)
    // @include canvas.editProxyConstructor
    // @visibility external
    //<
    editProxyConstructor:"SectionStackSectionEditProxy"
}); 


// Edit Mode impl for ListGrid/TreeGrid/TileGrid
// -------------------------------------------------------------------------------------------
if (isc.ListGrid != null) {
    isc.ListGrid.addMethods({
        //> @attr listGrid.editProxyConstructor (SCClassName : "GridEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"GridEditProxy"
    });
}
if (isc.TileGrid != null) {
    isc.TileGrid.addMethods({
        //> @attr tileGrid.editProxyConstructor (SCClassName : "GridEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"TileGridEditProxy"
    });
}

// Edit Mode impl for DrawPane/DrawItem
//-------------------------------------------------------------------------------------------
// Drawing module is optional and may not yet be loaded
isc._installDrawingEditMode = function () {
    isc.DrawPane.addMethods({
        //> @attr drawPane.editProxyConstructor (SCClassName : "DrawPaneEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "DrawPaneEditProxy"
    });

    // Note: this impl contains code duplicated from EditProxy.setEditMode 
    // because DrawItem does not extend Canvas.  
    var drawItemSetEditMode = function (editingOn, editContext, editNode) {
        if (editingOn == null) editingOn = true;
        if (this.editingOn == editingOn) return;
        this.editingOn = editingOn;

        if (this.editingOn) {
            // If an EditTree (or similar) component is passed which contains
            // an EditContext rather than being one, grab the actual EditContext.
            if (editContext && !isc.isAn.EditContext(editContext) && editContext.getEditContext) {
                editContext = editContext.getEditContext();
            }
            this.editContext = editContext;
        }

        this.editNode = editNode;
        if (this.editingOn && !this.editProxy) {
            
            var defaults = isc.Canvas._getEditProxyPassThruProperties(this.editContext);
            if (this.editNode && this.editNode.editProxyProperties) isc.addProperties(defaults, this.editNode.editProxyProperties);

            this.editProxy = this.createAutoChild("editProxy", defaults);
        }

        // Allow edit proxy to perform custom operations on edit mode change
        if (this.editProxy) this.editProxy.setEditMode(editingOn);
    };
    // Override Class.setEditableProperties() to use DrawItem.setPropertyValue()
    // instead of `setProperty()`.
    var drawItemSetEditableProperties = function (properties) {
        var undef;
        if (!this.editModeOriginalValues) this.editModeOriginalValues = {};
        for (var key in properties) {
            if (this.editModeOriginalValues[key] === undef) {
                this.logInfo("Field " + key + " - value is going to live values",
                        "editModeOriginalValues");
                // This is the only line that changes:
                this.setPropertyValue(key, properties[key]);
            } else {
                this.logInfo("Field " + key + " - value is going to original values",
                        "editModeOriginalValues");
                this.editModeOriginalValues[key] = properties[key];
            }
        }
        this.editablePropertiesUpdated(properties);
    };

    isc.DrawItem.addMethods({
        //> @method DrawItem.updateEditNode()
        // @include Canvas.updateEditNode
        // @visibility internal
        //<

        //> @attr drawItem.editProxyConstructor (SCClassName : "DrawItemEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "DrawItemEditProxy",

        // Note: this impl contains code duplicated from EditProxy.setEditMode 
        // because DrawItem does not extend Canvas.
        setEditMode : drawItemSetEditMode,

        // Override Class.setEditableProperties() to use DrawItem.setPropertyValue()
        // instead of `setProperty()`.
        setEditableProperties : drawItemSetEditableProperties,

        // define base class method assumed by the subclasses
        updateEditNode : function (editContext, editNode) {
            
            editContext.setNodeProperties(editNode, {shapeData: this.getShapeData()});
            editContext.removeNodeProperties(editNode, ["rotation", "translate", "scale",
                                                        "xShearFactor", "yShearFactor"]);
        }
    });

    isc.DrawLabel.addMethods({
        //> @attr drawLabel.editProxyConstructor (SCClassName : "DrawLabelEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "DrawLabelEditProxy",
        setEditMode : drawItemSetEditMode,
        setEditableProperties : drawItemSetEditableProperties
    });

    isc.DrawLine.addProperties({
        updateEditNode : function (editContext, editNode) {
            this.Super("updateEditNode", arguments);
            editContext.setNodeProperties(editNode, {
                startPoint: this.startPoint,
                endPoint: this.endPoint
            }, true);
            // Bounding box is extraneous for a line
            editContext.removeNodeProperties(editNode, ["left", "top", "width", "height"]);
        }
    });

    isc.DrawLinePath.addProperties({
        updateEditNode : function (editContext, editNode) {
            this.Super("updateEditNode", arguments);
            editContext.setNodeProperties(editNode, {
                startPoint: this.startPoint,
                endPoint: this.endPoint
            }, true);
            // Bounding box is extraneous for a line path
            editContext.removeNodeProperties(editNode, ["left", "top", "width", "height"]);
        }
    });

    isc.DrawCurve.addProperties({
        updateEditNode : function (editContext, editNode) {
            this.Super("updateEditNode", arguments);
            editContext.setNodeProperties(editNode, {
                startPoint: this.startPoint,
                endPoint: this.endPoint,
                controlPoint1: this.controlPoint1,
                controlPoint2: this.controlPoint2
            }, true);
            // Bounding box is extraneous for a curve
            editContext.removeNodeProperties(editNode, ["left", "top", "width", "height"]);
        }
    });
    
    isc.DrawPath.addProperties({
        updateEditNode : function (editContext, editNode) {
            this.Super("updateEditNode", arguments);
            editContext.setNodeProperties(editNode, {
                points: this.points
            }, true);
            if (!isc.isA.DrawDiamond(this)) {
                // Bounding box is extraneous for a path
                editContext.removeNodeProperties(editNode, ["left", "top", "width", "height"]);
            }
        }
    });

    isc.DrawDiamond.addProperties({
        updateEditNode : function (editContext, editNode) {
            this.Super("updateEditNode", arguments);
            // A DrawDiamond is defined by the bounding box so points
            // is extraneous.
            editContext.removeNodeProperties(editNode, "points");
        }
    });
};

if (isc.DrawPane != null) {
    isc._installDrawingEditMode();
} else {
    // Register to receive notification when Drawing module (actually
    // any) is loaded. At that point the editMode additions can be
    // installed. This event is triggered by code automatically added
    // by FileAssembler at the end of each module.
    isc.Page.setEvent("moduleLoaded", function (target, eventInfo) {
        if (eventInfo.moduleName == "Drawing") {
            isc._installDrawingEditMode();
        }
    });
}

isc._installChartsEditMode = function () {
    isc.FacetChart.addProperties({
        //> @attr facetChart.editProxyConstructor (SCClassName : "FacetChartEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor: "FacetChartEditProxy",

        setEditableProperties : function (properties) {
            // valueProperty and facetFields cannot have the same values
            if (properties.valueProperty) {
                if (this.facetFields && this.facetFields.contains(properties.valueProperty)) {
                    isc.warn("Cannot set Value Property to a field in Facet Fields. Change rejected.")
                    delete this.editNode.defaults.valueProperty;
                    this.editContext.fireEditNodeUpdated(this.editNode, []);
                    return;
                }
            } else if (properties.facetFields && this.valueProperty) {
                var values = properties.facetFields;
                for (var i = 0; i < values.length; i++) {
                    if (values[i] == this.valueProperty) {
                        isc.warn("Cannot set Facet Fields with a field in Value Property. Change rejected.")
                        if (values.length > 1) {
                            this.editNode.defaults.facetFields.remove(values[i]);
                        } else {
                            delete this.editNode.defaults.facetFields;
                        }
                        this.editContext.fireEditNodeUpdated(this.editNode, []);
                        return;
                    }
                }
            }

            this.Super("setEditableProperties", arguments);
        }
    });
};

if (isc.FacetChart != null) {
    isc._installChartsEditMode();
} else {
    // Register to receive notification when Charts module (actually
    // any) is loaded. At that point the editMode additions can be
    // installed. This event is triggered by code automatically added
    // by FileAssembler at the end of each module.
    isc.Page.setEvent("moduleLoaded", function (target, eventInfo) {
        if (eventInfo.moduleName == "Charts") {
            isc._installChartsEditMode();
        }
    });
}

if (isc.ScreenLoader) {
    
    isc.ScreenLoader.addProperties({
        //> @attr screenLoader.editProxyConstructor (SCClassName : "ScreenLoaderEditProxy" : IR)
        // @include canvas.editProxyConstructor
        // @visibility external
        //<
        editProxyConstructor:"ScreenLoaderEditProxy",

        proxyLabelLayoutDefaults: {
            _constructor: isc.HLayout,
            height: 30,
            membersMargin: 3,
            align: "center"
        },

        proxyLabelTitleDefaults: {
            _constructor: isc.Label,
            autoParent:"proxyLabelLayout",
            height: 30,
            autoFit: true,
            wrap: false,
            contents: "Screen:"
        },

        proxyLabelTextDefaults: {
            _constructor: isc.Label,
            autoParent:"proxyLabelLayout",
            height: 30,
            autoFit: true,
            wrap: false,
            styleName: "link",
            cursor: "pointer",
            canHover: true,
            getHoverHTML : function () {
                return "Go to screen \"" + this.contents + "\"";
            },
            click: function () {
                this.creator.proxyLabelClicked();
            }
        },

        showProxyLabel : function (withLink) {
            this.setBorder("1px solid #0000EE");
            this.setMembers([]);
            this.addAutoChild("proxyLabelLayout");
            var title = this.addAutoChild("proxyLabelTitle");
            if (withLink) {
                var label = this.addAutoChild("proxyLabelText", { contents: this.screenName });
                label.setContents(this.screenName);
            } else {
                title.setContents(title.contents + " " + this.screenName);
            }
        },

        proxyLabelClicked : function () { }
    });
}

// Edit Mode impl for ServiceOperation and ValuesMap.  Both of these are non-visual classes
// that can nevertheless appear in a VB app - kind of like DataSources, but they're added to
// the project as a side effect of adding a web service binding.
// -------------------------------------------------------------------------------------------

isc.ServiceOperation.addMethods({
    editProxyConstructor:"EditProxy",

    getActionTargetTitle : function () {
        return "Operation: [" + this.operationName + "]";
    }
});

if (isc.ValuesManager != null) {
    isc.ValuesManager.addMethods({
        editProxyConstructor:"ValuesManagerEditProxy",

        // Note: this impl contains code duplicated from EditProxy.setEditMode 
        // because ValuesManager does not extend Canvas.  
        setEditMode : function(editingOn, editContext, editNode) {
            if (editingOn == null) editingOn = true;
            if (this.editingOn == editingOn) return;
            this.editingOn = editingOn;

            if (this.editingOn) {
                // If an EditTree (or similar) component is passed which contains
                // an EditContext rather than being one, grab the actual EditContext.
                if (editContext && !isc.isAn.EditContext(editContext) && editContext.getEditContext) {
                    editContext = editContext.getEditContext();
                }
                this.editContext = editContext;
            }

            this.editNode = editNode;
            if (this.editingOn && !this.editProxy) {
                
                var defaults = isc.Canvas._getEditProxyPassThruProperties(this.editContext);
                if (this.editNode && this.editNode.editProxyProperties) isc.addProperties(defaults, this.editNode.editProxyProperties);
                this.editProxy = this.createAutoChild("editProxy", defaults);
            }

            // Allow edit proxy to perform custom operations on edit mode change
            if (this.editProxy) this.editProxy.setEditMode(editingOn);
        }
    });
}


// EditNode
// ---------------------------------------------------------------------------------------

//> @object EditNode
// An object representing a component that is currently being edited within an
// +link{EditContext}.
// <P>
// An EditNode is essentially a copy of a +link{PaletteNode}, initially with the same properties
// as the PaletteNode from which it was generated.  However unlike a PaletteNode, an EditNode 
// always has a +link{editNode.liveObject,liveObject} - the object created from the 
// +link{paletteNode.defaults} or other properties defined on a paletteNode.
// <P>
// Like a Palette, an EditContext may use properties such as +link{paletteNode.icon} or 
// +link{paletteNode.title} to display EditNodes.
// <P>
// An EditContext generally offers some means of editing EditNodes and, as edits are made,
// updates +link{editNode.defaults} with the information required to re-create the component.
// 
// @inheritsFrom PaletteNode
// @treeLocation Client Reference/Tools
// @visibility external
//<

//> @attr editNode.defaults (Properties : null : IR)
// Properties required to recreate the current +link{editNode.liveObject}.
// @visibility external
//<

//> @attr editNode.editProxyProperties (EditProxy Properties : null : IR)
// Properties to be applied to the
// +link{editNode.liveObject,liveObject}.+link{canvas.editProxy,editProxy} when created.
// <p>
// Note that the <code>editProxy</code> is created the first time a component is placed into
// editMode, so any <code>editProxyProperties</code> must be set before then.
// @visibility external
//<

//> @attr editNode.type (SCClassName : null : IR)
// +link{SCClassName} of the <smartclient>+link{liveObject}</smartclient>
// <smartgwt>+link{canvasLiveObject}</smartgwt>, for example, "ListGrid".
// @visibility external
//<

//> @attr editNode.liveObject (Object : null : IR)
// Live version of the object created from the +link{editNode.defaults}.  For example, 
// if +link{editNode.type} is "ListGrid", <code>liveObject</code> would be a ListGrid.
// @visibility external
//<


//> @attr editNode.editDataSource (DataSource : null : IR)
// DataSource to use when editing the properties of this component.  Defaults to
// +link{editContext.dataSource}, or the DataSource named after the component's type.
//
// @visibility internal
//<

//> @attr editNode.useEditMask (Boolean: null : IR)
// Shortcut property to be applied to the
// +link{editNode.liveObject,liveObject}.+link{canvas.editProxy,editProxy} when created.
//
// @visibility external
//<

//> @attr editNode.canDuplicate (Boolean : null : IRW)
// See +link{paletteNode.canDuplicate}.
//
// @visibility external
//<

// EditContext
// --------------------------------------------------------------------------------------------

//> @class EditContext
// An EditContext provides an editing environment for a set of components.
// <P>
// An EditContext is typically populated by adding a series of +link{EditNode,EditNodes} created via a
// +link{Palette}, either via drag and drop creation, or when loading from a saved version,
// via +link{EditContext.addFromPaletteNode(),addFromPaletteNode()} or 
// +link{EditContext.addPaletteNodesFromXML(),addPaletteNodesFromXML()}.
// <P>
// An EditContext then provides interfaces for further editing of the components represented
// by EditNodes.
// <P>
// Developers may explicitly define an edit context and initialize it with a
// +link{EditContext.rootComponent} - the root of the user interface being created.
// The EditContext itself is not visible to the user, but the root component's 
// +link{editNode.liveObject,liveObject} may be.<br>
// As child editNodes are added to the rootComponent node or its descendants, liveObjects
// in the user will update to reflect these changes. The live objects for the
// edit nodes will be nested using the appropriate parent-child relationships, for 
// the types of node in question. For example Canvases will be added as
// +link{layout.members,members} of layouts and FormItems will be added as 
// +link{DynamicForm.fields,fields} of DynamicForms.
// <P>
// To enable drag and drop creation of widgets from a +link{Palette}, a developer can
// use +link{canvas.setEditMode()} to enable editing behaviors on the live object of the
// desired drop target (typically the root component).<br>
// To enable editNode creation via double-click on a +link{Palette}, developers can set
// the +link{Palette.defaultEditContext}.
// <P>
// Developers can also make use of +link{EditPane} or +link{EditTree} classes which provide
// a visual interface for managing an EditContext.
//
// @group devTools
// @treeLocation Client Reference/Tools
// @visibility external
//<
isc.ClassFactory.defineClass("EditContext", "Class");



//> @attr EditContext.editDataSource   (DataSource : null : IR)
// Default DataSource to use when editing any component in this context.  Defaults to the
// DataSource named after the component's type.  Can be overridden per-component via
// +link{editedItem.editDataSource}.
//
// @group devTools
//<

isc.EditContext.addClassProperties({
    //> @classAttr EditContext.editNodePasteOffset   (Integer : 5 : IRW)
    // The number of pixels to offset a pasted node from the node being copied
    // @group devTools
    // @visibility external
    //<
    editNodePasteOffset:5,
    // PaletteNode attributes that can be extracted from an EditNode
    _paletteNodeAttributes: ["canDuplicate","icon","idPrefix","idName","title","type","requiredProperties","recreateOnChange","alwaysUsePlaceholder","placeholderProperties","placeholderImage"],

    // The following paletteNode behavior properties are applied to the editNode in
    // makeEditNode() if not null.
    _paletteNodeBehaviors: [
        "addToChild",
        "alwaysAllowRootDrop",
        "autoAddChild",
        "canDragInPreview",
        "canReparent",
        "insertContainer",
        "modalVisibility"
    ]
});

isc.EditContext.addClassMethods({

    copyPaletteNodeAttributes : function (targetNode, sourceNode) {
        for (var i = 0; i < isc.EditContext._paletteNodeAttributes.length; i++) {
            var attr = isc.EditContext._paletteNodeAttributes[i];
            if (sourceNode[attr] != null) {
                targetNode[attr] = sourceNode[attr];
            }
        }
    },

    copyPaletteNodeBehaviors : function (targetNode, sourceNode) {
        for (var i = 0; i < isc.EditContext._paletteNodeBehaviors.length; i++) {
            var behavior = isc.EditContext._paletteNodeBehaviors[i];
            if (sourceNode[behavior] != null) {
                targetNode[behavior] = sourceNode[behavior];
            }
        }
    },

    // Title Editing (for various components: buttons, tabs, etc)
    // ---------------------------------------------------------------------------------------
    manageTitleEditor : function (targetComponent, left, width, top, height, initialValue, 
                                  titleField, completionCallback) 
    {
        if (!isc.isA.DynamicForm(this.titleEditor)) {
            // Craft the title edit field from built-in properties
            // and overrides provided by the editProxy
            var titleEditorConfig =  isc.addProperties(
                    { name: "title", type: "text", showTitle: false },
                        targetComponent.editProxy.titleEditorDefaults, 
                        targetComponent.editProxy.titleEditorProperties, {
                        keyPress : function (item, form, keyName) {
                            if (keyName == "Escape") {
                                form.discardUpdate = true;
                                form.hide();
                                if (completionCallback) completionCallback();
                                return;
                            }
                            if (keyName == "Enter") item.blurItem();
                        }, 
                        blur : function (form, item) {
                            if (this.shouldDisallowEditorExit()) {
                                return false;
                            }
        
                            // If we get a blur but we're still the activeElement, assume the
                            // user shifted focus out of the browser window.
                            // We don't want to dismiss the editor in this case
                            
                            if (this.getHandle().contains(document.activeElement)) {
                                return;
                            }
        
                            form.dismissEditor();
                        }
                    }
            );

            this.titleEditor = isc.DynamicForm.create({
                ID: "isc_titleEditor",
                autoDraw: false,
                margin: 0, padding: 0, cellPadding: 0,
                fields: [
                    titleEditorConfig
                ],
                saveOrDiscardValue : function () {
                    if (!this.discardUpdate) {
                        var widget = this.targetComponent,
                            ctx = widget.editContext;
                        if (ctx) {
                            var value = this.getValue("title"),
                                field = isc.EditContext.getTitleField(targetComponent, this.titleField),
                                properties = {}
                            ;
                            
                            if (field == "title" && properties[field] == null &&  
                                value == widget.name) 
                            {
                                return;
                            }
                            properties[field] = value;
                            ctx.setNodeProperties(widget.editNode, properties);
                            if (ctx.nodeClick) ctx.nodeClick(ctx, widget.editNode);
                            // Update selectedAppearance because label may have changed
                            ctx.refreshSelectedAppearance(widget);
                        }
                    }
                },
                dismissEditor : function () {
                    this.saveOrDiscardValue();
                    this.hide();

                    // When title editor is dismissed, place focus into the targetComponent
                    // if appropriate.
                    var widget = this.targetComponent;
                    if (widget._eventMask) {
                        widget._eventMask.focus();
                    } else if (isc.isA.Canvas(widget)) {
                        widget.focus();
                    } else if (isc.isA.FormItem(widget)) {
                        if (widget.form) widget.form.focus();
                        if (widget._canFocus && widget._canFocus()) widget.focusInItem();
                    }

                    if (!this.discardUpdate && completionCallback) completionCallback(this.getValue("title"));

                    // Raise event for editor closing
                    if (widget.editContext && widget.editContext.inlineEditorShowing) {
                        widget.editContext.fireCallback("inlineEditorShowing", "field,type", [null,"title"]);
                    }
                }
            });
        }
        
        var editor = this.titleEditor;
        editor.setProperties({targetComponent: targetComponent, titleField: titleField});
        editor.discardUpdate = false;
        
        // Set default value of editor from component title or defaultValue
        // if no title is shown
        var item = editor.getItem("title"),
            value;
        if (initialValue) {
            value = initialValue;
        } else {
            var field = this.getTitleField(targetComponent, titleField);
            value = targetComponent[field];
            if (value == null && field == "title") value = targetComponent.name;
        }
        item.setValue(value);

        this.positionTitleEditor(targetComponent, left, width, top, height);
        
        editor.show();
        // Configure click mask around editor so it can be closed when
        // clicking outside of it
        editor.showClickMask(
                {
                    target: editor,
                    methodName: "dismissEditor"
                },
                "soft",
                // Don't mask editor
                [editor]);
        item.focusInItem();
        if (!initialValue) item.delayCall("selectValue", [], 100);
        else item.delayCall("setSelectionRange", [initialValue.length, initialValue.length]);

        // Raise event for editor showing
        if (targetComponent.editContext && targetComponent.editContext.inlineEditorShowing) {
            targetComponent.editContext.fireCallback("inlineEditorShowing", "field,type", [item,"title"]);
        }
    },

    getTitleField : function (targetComponent, field) {
        if (field != null) return field;

        var titleField = "title";

        if ((isc.isA.Label(targetComponent) && !isc.isA.SectionHeader(targetComponent)) ||
            (isc.DrawPane && isc.isA.DrawLabel(targetComponent)))
        {
            titleField = "contents";
        } else if (!(isc.DrawPane && isc.isA.DrawItem(targetComponent)) && 
            !isc.isA.Button(targetComponent) && !isc.isA.ButtonItem(targetComponent) && 
            !targetComponent.showTitle)
        {
            titleField = "defaultValue";
        }
        return titleField;
    },

    positionTitleEditor : function (targetComponent, left, width, top, height) {
        if (top == null) top = targetComponent.getPageTop();
        if (height == null) height = targetComponent.getVisibleHeight();
        if (left == null) left = targetComponent.getPageLeft(); 
        if (width == null) width = targetComponent.getVisibleWidth();

        var editor = this.titleEditor;
        var item = editor.getItem("title");
        item.setHeight(height);
        item.setWidth(width);

        editor.setTop(top);
        editor.setLeft(left);
    },

    // Selection and Dragging of EditNodes
    // ---------------------------------------------------------------------------------------
    
    selectCanvasOrFormItem : function (object, hideLabel, skipFocus) {
    
        // Make sure we're not being asked to select a non-visual object like a DataSource 
        // or ServiceOperation.  We also support the idea of a visual proxy for a non-widget
        // object - for example, ListGridFields are represented visually by the corresponding
        // button in the ListGrid header.
        if (!isc.isA.Canvas(object) && !isc.isA.FormItem(object) && !isc.isA.ValuesManager(object) && !object._visualProxy) {
            return;
        }
        // Or a Menu (ie, a context menu which has no visibility until an appropriate object 
        // is right-clicked by the user)
        if (isc.isA.Menu(object)) {
            return;
        }

        var underlyingObject;
        if (object._visualProxy) {
            underlyingObject = object;
            object = object._visualProxy;
        }

        
        // If attempting to select the canvas of a canvasItem, highlight the canvasItem itself
        // if (isc.isA.Canvas(object) && object.canvasItem) {
        //     object = object.canvasItem;
        // }
        
        var editContext = underlyingObject ? underlyingObject.editContext : object.editContext;
        if (!editContext) return;

        // If proxy has disabled selection, ignore this request
        if (object.editProxy && object.editProxy.canSelect == false) {
            if (object.editingOn) object.editContext.deselectAllComponents();
            return;
        }

        var rootNode = editContext.getRootEditNode();

        // Selection of the root component is not supported
        if (rootNode.liveObject == object) return;
        if (!object.editNode) return;

        // When nested drops are disallowed, only components which are
        // direct children of the root component can be selected
        if (editContext.allowNestedDrops == false) {
            var tree = editContext.getEditNodeTree();
            var parentNode = tree.getParent(object.editNode);
            if (parentNode != rootNode) return;
        }

        // For conceptual objects that needed a visual proxy, now we've done the physical 
        // on-screen selection we need to flip the object back to the underlying one
        if (underlyingObject) object = underlyingObject;
        
        if (object.editingOn) {
            var ctx = object.editContext;

            // Grab the actual editNode to select. Previous instance value
            // could have been from a visualProxy.
            var node = object.editNode;
            if (node) {
                ctx.selectSingleComponent(object);
            } else {
                ctx.deselectAllComponents();
            }
        }
        
        // Give the newly-selected object the focus if possible, so that, eg, copy/paste 
        // shortcut keystrokes go to it.
        // Don't move focus if the titleEditor or inlineEditor is showing on the
        // newly-selected object or if the triggering event is a key press.
        if (!skipFocus &&
            (!isc.EH.lastEvent || isc.EH.lastEvent.eventType != "keyPress") &&
            (!this.titleEditor ||
                !this.titleEditor.isVisible() ||
                this.titleEditor.targetComponent != object) &&
            (!object.editProxy ||
                !object.editProxy.inlineEditForm ||
                !object.editProxy.inlineEditForm.isVisible()))
        {
            if (object._eventMask) {
                object._eventMask.focus();
            } else if (isc.isA.Canvas(object)) {
                object.focus();
            } else if (isc.isA.FormItem(object) && object.form) {
                if (!object.form.isFocused()) {
                    object.form.focus();
                }
                if (object._canFocus && object._canFocus()) {
                    object.focusInItem();
                }
            }
        }
    },
    
    // Only called from EditProxy and FormItemProxy
    hideAncestorDragDropLines : function (object) {
        while (object && object.parentElement) {
            if (object.parentElement.hideDragLine) object.parentElement.hideDragLine();
            if (object.parentElement.hideDropLine) object.parentElement.hideDropLine();
            object = object.parentElement;
            if (isc.isA.FormItem(object)) object = object.form;
        }
    },
    
    getSchemaInfo : function (editNode) {
        var schemaInfo = {},
            liveObject = editNode.liveObject;
            
        if (!liveObject) return schemaInfo;
            
        if (isc.isA.FormItem(liveObject)) {
            if (liveObject.form && liveObject.form.dataSource) {
                var form = liveObject.form;
                schemaInfo.dataSource = isc.DataSource.getDataSource(form.dataSource).ID;
                schemaInfo.serviceName = form.serviceName;
                schemaInfo.serviceNamespace = form.serviceNamespace;
            } else {
                schemaInfo.dataSource = liveObject.schemaDataSource;
                schemaInfo.serviceName = liveObject.serviceName;
                schemaInfo.serviceNamespace = liveObject.serviceNamespace;
            }
        } else if (isc.isA.Canvas(liveObject) && liveObject.dataSource) {
                schemaInfo.dataSource = isc.DataSource.getDataSource(liveObject.dataSource).ID;
                schemaInfo.serviceName = liveObject.serviceName;
                schemaInfo.serviceNamespace = liveObject.serviceNamespace;
        } else {
            // If it's not a FormItem or a Canvas, then we must presume it's a config object.
            // This can happen on drop of new components
            schemaInfo.dataSource = liveObject.schemaDataSource;
            schemaInfo.serviceName = liveObject.serviceName;
            schemaInfo.serviceNamespace = liveObject.serviceNamespace;
        }
        
        return schemaInfo;
    },

    clearSchemaProperties : function (node) {
        if (node && node.defaults && isc.isA.FormItem(node.liveObject)) {
            delete node.defaults.schemaDataSource;
            delete node.defaults.serviceName;
            delete node.defaults.serviceNamespace;
            var form = node.liveObject.form;
            if (form && form.inputSchemaDataSource &&
                isc.DataSource.get(form.inputSchemaDataSource).ID == node.defaults.inputSchemaDataSource &&
                form.inputServiceName == node.defaults.inputServiceName &&
                form.inputServiceNamespace == node.defaults.inputServiceNamespace)
            {
                delete node.defaults.inputSchemaDataSource;
                delete node.defaults.inputServiceName;
                delete node.defaults.inputServiceNamespace;
            }
        }
    },

    // XML and JSON source code generation
    // ---------------------------------------------------------------------------------------

    // serialize a set of component definitions to XML code, that is, essentially the
    // editNode.defaults portion ( { _constructor:"Something", prop1:value, ... } )
    serializeDefaults : function (defaults, indent, settings) {
        if (defaults == null) return null;
    
        if (!isc.isAn.Array(defaults)) defaults = [defaults];

        var output = isc.SB.create();

        isc.Comm.omitXMLNS = true;
        isc.Comm.omitXSI = true;
        for (var i = 0; i < defaults.length; i++) {
            var obj = defaults[i],
                tagName = obj._tagName,
                schema = isc.DS.getNearestSchema(obj),
                flags = { indent: indent }
            ;
            
            
            if (settings && settings.ignoreConstructor) flags.ignoreConstructor = true;

            // The tag name outputted by the XML serialization will be tagName, if set.
            // Otherwise it will be the tag name implied by the schema.
            // Note that this effectively reserves the attribute name "_tagName".

            output.append(schema.xmlSerialize(obj, flags, null, tagName), "\n\n");
        }
        isc.Comm.omitXSI = null;
        isc.Comm.omitXMLNS = null;

        return output.release(false);
    },

    serializeDefaultsAsJSON : function (defaults, settings) {
        if (defaults == null) return null;
    
        if (!isc.isAn.Array(defaults)) defaults = [defaults];

        // Wrap default blocks into paletteNodes removing properties that are not
        // part of the node's schema
        for (var i = 0; i < defaults.length; i++) {
            var obj = defaults[i],
                tagName = obj._tagName,
                schema = isc.DS.getNearestSchema(obj),
                type = tagName || (schema && schema.ID)
            ;

            if (obj._constructor && obj._constructor == type) {
                delete obj._constructor;
            }

            // Cleanup defaults
            for (var keys = isc.getKeys(obj), j = keys.length; j >= 0; j--) {
                var key = keys[j],
                    field = schema && schema.getField(key)
                ;
                if (!field) delete obj[key];
            }

            // Replace defaults with new paletteNode
            defaults[i] = {
                type: type,
                defaults: obj
            }
        }

        return isc.JSON.encode(defaults, settings);
    },

    convertActions : function (node, defaults, classObj) { 
        // Convert actions defined as a raw object to StringMethods so they can be
        // serialized correctly.
        
		
        
        for (var field in defaults) {
            var value = defaults[field];
            // if it's not an object or is already a StringMethod no need to convert to one
            // (It might also be a string that has not yet been converted to a StringMethod)
            // If the value is null, check later for field being a StringMethod
            if (value != null && ((!isc.isAn.Object(value) && !isc.isA.String(value)) || 
                                isc.isA.StringMethod(value))) 
            {
                continue;
            }
            
            // If it has a specified field-type, other than StringMethod - we don't need 
            // to convert
            // Note: type Action doesn't need conversion to a StringMethod as when we serialize
            // to XML, the ActionDataSource will do the right thing
            var fieldType;
            if (classObj && classObj.getField) fieldType = classObj.getField(field).type;
            if (fieldType && (fieldType != "StringMethod")) continue;
            
            var liveObject = node.liveObject,
                liveValue = liveObject && liveObject[field]
            ;
            
            if (liveValue && liveValue._isObservation) {
                liveValue = isc.Class._getOriginalMethod(field, liveObject);
            }
            var liveAction = liveValue && (liveValue.iscAction || liveValue._constructor == "Process");

            if (liveAction) {
                defaults[field] = isc.StringMethod.create({value:value});
            } else {
                // If the value is null and this is a StringMethod field, drop it completely
                if (value == null) {
                    var klass = isc.ClassFactory.getClass(node.type),
                        undef;
                    if (klass && klass._stringMethodRegistry && 
                                    klass._stringMethodRegistry[field] !== undef) 
                    {
                        delete defaults[field];
                    }
                }

                // If there is no liveObject (ie, it hasn't yet been created), check the Class to
                // see if this field corresponds to a registered StringMethod 
                if (!liveObject) {
                    var klass = isc.ClassFactory.getClass(node.type),
                        undef;
                    if (klass && klass._stringMethodRegistry && 
                                    klass._stringMethodRegistry[field] !== undef) 
                    {
                        defaults[field] = isc.StringMethod.create({value:klass._stringMethodRegistry[field]});
                    } else {
                        // If not, check the component schema to see if this field is a registered <method>
                        // (note, we only do this if everything else fails, in case of staleness in the 
                        // component schema files)
                        var ds = isc.DataSource.get(node.type);
                        if (ds) {
                            var sm = ds.getStringMethod(field, value);
                            if (sm) defaults[field] = sm;
                        }
                    }
                }
            }
            
            /*
            // We could add a sanity check that the value will convert to a function successfully
            // in case a function has been added since init or something.
            try {
                isc.Func.expressionToFunction("", defaults[field]);
            } catch (e) {
                convertToSM = false;
            }
            */
        }
        // no need to return anything we've modified the defaults object directly.
    },
    
    getNonNullProperties : function (properties) {
        var result = {};
        for (var prop in properties) {
            if (properties[prop] != null) result[prop] = properties[prop];
        }
        return result;
    },

    // helper to return a JavaScript identifier from text
    _getTextAsIdentifier : function (text, idsInUse) {
        // replace whitespace with underscores
        text = text.replace(/\s/g, "_");
        // bail if result is not an identifier
        if (!String.isValidID(text)) return;

        // otherwise, make sure we're not duplicating an identifier from idsInUse
        while (idsInUse.hasOwnProperty(text)) {
            if (text.match(/_([0-9])+$/)) {
                text = text.replace(/_(([0-9])+)$/, function (match, suffix) {
                    return "_" + (parseInt(suffix) + 1);
                });
            } else {
                text += "_1";
            }
        }

        return text;
    },
            
    // helper to check whether a boolean schema field property is set for any keys in the passed
    // properties object; we use the result to decide how to apply those propeties to a liveObject
    testNodeSchemaFieldProperty : function (editNode, schemaFieldPropertyName, 
                                            liveObjectProperties, checkForFalse)
    {
        if (editNode == null) return false;
        var schema = isc.DS.get(editNode.type);
        if (schema == null) return false;

        if (schemaFieldPropertyName == null || liveObjectProperties == null) {
            return false;
        }

        var target = !checkForFalse;

        for (var property in liveObjectProperties) {
            var field = schema.fields[property];
            if (!field) continue;

            var value = field[schemaFieldPropertyName];
            if (isc.isA.String(value)  && value.toLowerCase() == target.toString() ||
                isc.isA.Boolean(value) && value               == target) 
            {
                return true;
            }
        }

        return false;
    },

    _basicTypes : ["string", "number", "boolean", "object", "array"],

    // Create an action binding from source to target. Returns null if required parameters
    // cannot be bound.
    createActionBinding : function (sourceComponent, sourceMethod, targetComponent, 
                                    actionMethod, dontLog) 
    {
        var sourceMethodDoc = this._getInheritedMethod(sourceComponent.type, sourceMethod),
            sourceMethod = isc.isAn.XMLNode(sourceMethodDoc) ? isc.jsdoc.toJS(sourceMethodDoc) :
                                            sourceMethodDoc;
        if (!sourceMethod) sourceMethod = {};

        if (!dontLog && this.logIsDebugEnabled("actionBinding")) {
            this.logDebug("createActionBinding: " + sourceComponent.ID + "." + sourceMethod.name +
                            " > " + targetComponent.ID + "." + actionMethod.name, "actionBinding");
            this.logDebug("createActionBinding: " + sourceComponent.ID + "." + sourceMethod.name +
                        " > " + targetComponent.ID + "." + actionMethod.name + " --- " +
                        ", sourceMethod: " + this.echoFull(sourceMethod) +
                        ", action method: " + this.echoFull(actionMethod),
                        "actionBinding");
        }

        var binding = {
            target: targetComponent.ID,
            name: actionMethod.name
        };
        // If binding an action against a class (not an instance) mark the binding as such
        if (isc.isA.ClassObject(targetComponent.liveObject)) {
            binding.type = "static";
        }
        var sourceParams;

        if (actionMethod.params) {
            var mapping = [],
                foundMatchingParams = false;
            sourceParams = sourceMethod.params;
            
            // normalize params to an Array and create a copy
            if (!sourceParams) sourceParams = [];
            else if (!isc.isAn.Array(sourceParams)) sourceParams = [sourceParams];
            else sourceParams = sourceParams.duplicate();

            // add on a special pseudo-param for "this".  This allows eg rowClick ->
            // editSelected, since rowClick does not receive the grid as a parameter
            sourceParams.add({
                name : "this",
                type : sourceComponent.type,
                pseudo : true
            });

            // for each parameter of the action
            for (var i = 0; i < actionMethod.params.length; i++) {

                var actionParam = actionMethod.params[i];

                if (!dontLog) {
                    this.logInfo("considering actionMethod " + actionMethod.name + " param: " +
                                actionParam.name + " of type " + actionParam.type,
                                "actionBinding");
                }

                var actionParamIsOptional =
                        actionParam.optional != null && actionParam.optional.toString() != "false"
                ;
                // attempt to bind optional params only if type is not basic
                if (!actionParamIsOptional || actionParam.type != null &&
                    !this._basicTypes.contains(actionParam.type.toLowerCase()))
                {
                    var sourceParam = this._getMatchingSourceParam(actionParam, sourceParams);
                    if (sourceParam != null) {
                        // Use pseudo-param "this" only if parameter is not optional
                        // Solves problem for methods like editNewRecord([initialValues])
                        // where passing IButton as initial values for record makes no sense
                        if (!actionParamIsOptional || !sourceParam.pseudo) {
                            mapping[i] = sourceParam.name;
                            // mark the param as _used so we don't use it again
                            sourceParam._used = true;
                            foundMatchingParams = true;
                            continue;
                        }
                    // failed to fill in a required parameter
                    } else if (!actionParamIsOptional) {
                        if (!dontLog) {
                            this.logInfo("action binding failed, actionMethod param " + 
                                      actionParam.name + " of type " + actionParam.type +
                                     " couldn't be fulfilled",
                                     "actionBinding");
                        }
                        return null;
                    }
                }
                
                // note: ensure that a null slot exists (to convey argument order)
                mapping[i] = "null";
            }

            // Remove trailing "null" parameters
            for (var i = actionMethod.params.length - 1; i >= 0; i--) {
                if (mapping[i] != "null") break;
                mapping.removeAt(i);
            }

            if (foundMatchingParams) binding.mapping = mapping;
        }

        if (!dontLog && this.logIsInfoEnabled("actionBinding")) {
            this.logInfo("createActionBinding: " + sourceComponent.ID + "." + sourceMethod.name +
                         " > " + targetComponent.ID + "." + actionMethod.name + ": " +
                        this.echoFull(binding), "actionBinding");
        }
        // clear out the _used flag
        if (sourceParams) sourceParams.setProperty("_used", null);

        return binding;
    },
    
    _getMatchingSourceParam : function (actionParam, sourceParams) {
        var actionParamTypes = this._getActionTypes(actionParam.type);
        for (var j = 0; j < actionParamTypes.length; j++) {
            var actionParamType = actionParamTypes[j],
                actionParamDS = isc.DS.get(actionParamType)
            ;

            this.logInfo("selected type " + actionParamType + 
                        " has schema: " + actionParamDS, "actionBinding");

            for (var i = 0; i < sourceParams.length; i++) {
                var sourceParam = sourceParams[i];

                // don't use the same param twice
                if (sourceParam._used) continue;
                        
                this.logDebug("considering source param: " + sourceParam.name + 
                            " of type " + sourceParam.type,
                            "actionBinding");

                var sourceParamType = this._getActionTypes(sourceParam.type)[0];

                // for non-object types, bind by direct comparison of type name
                var sourceParamDS = isc.DS.get(sourceParamType);
                if (!sourceParamDS) {
                    if (actionParamType == sourceParamType) return sourceParam;
                    continue;
                }

                // for object types, need to use schema inheritance check here since there are
                // pseudo-objects like WSRequest that have no ISC class.
                // Also, don't bind a class instance against an Object parameter - all
                // class instances are considered as inheriting from Object but that's
                // not likely the desired action. For example, ButtonItem.click(form, formItem)
                // shouldn't match up "form" with form action editNewRecord([initialValues])
                // which accepts (Record | Object) to the "initialValues".
                if (sourceParamDS.inheritsSchema(actionParamDS) &&
                    (actionParamDS.ID != "Object" || !isc.isAn.Instance(sourceParamDS)))
                {
                    return sourceParam;
                }
            }
        }
    },

    _getActionTypes : function (type) {
        // Split possible types by "|" removing separating space as well
        var types = type.split(/[ \t]*[|]+[ \t]*/);

        // handle multiple-word type definition eg ("RPCRequest Properties") by returning the first
        // word, with first letter uppercased
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            // take first type if multiple
            type = type.split(/[ \t]+/)[0];
            // canonically uppercase
            type = type.substring(0,1).toUpperCase() + type.substring(1);
            types[i] = type;
        }
        return types;
    },

    _getInheritedMethod : function (type, methodName) {
        while (type) {
            var docItem = isc.jsdoc.getDocItem("method:" + type + "." + methodName);
            if (docItem != null) return docItem;
    
            // check if we have a definition in the datasource.methods array
            var ds = isc.DS.get(type);
            if (ds && ds.methods) {
                var method = ds.methods.find("name", methodName);
                if (method) return method;
            }        
    
            var clazz = isc.ClassFactory.getClass(type);
            if (clazz == null) return null;
            clazz = clazz.getSuperClass();
            if (clazz == null) return null;
            type = clazz.getClassName();
        }
    },

    // Given an action convert it to a target Workflow element of type <elementType>
    convertActionToProcessElement : function (action, elementType, sourceComponent) {
        var processElement;
        if (elementType && window[action.target]) {
            var targetComponent = window[action.target],
                targetMethodDoc = this._getInheritedMethod(targetComponent.getClassName(), action.name),
                targetMethod = isc.isAn.XMLNode(targetMethodDoc) ? isc.jsdoc.toJS(targetMethodDoc) : targetMethodDoc
            ;
            var clazz = isc.ClassFactory.getClass(elementType),
                properties
            ;
            if (clazz.createInitPropertiesFromAction) {
                properties = clazz.createInitPropertiesFromAction(action, targetMethod, sourceComponent);
            }

            processElement = clazz.create(properties);
        }
        return processElement;
    },

    // Given a custom action to a Workflow ScriptTask
    convertCustomActionToProcessElement : function (actionRawValue) {
        var processElement,
            description = "Custom action code";
        if (isc.isAn.Array(actionRawValue)) {
            // Once serialized/deserialize the event ends up as an array
            for (var i = 0; i < actionRawValue.length; ++i) {
                var v = actionRawValue[i];
                if (isc.isA.Function(v) && v.iscAction == null) {
                    processElement = isc.ScriptTask.create({
                        description: description,
                        execute: v
                    });
                }
            }
        } else if (isc.isAn.String(actionRawValue)) {
            var func = isc.Func.expressionToFunction("", actionRawValue);
            processElement = isc.ScriptTask.create({
                description: description,
                execute: func
            });
        }
        return processElement;
    }
});


isc.EditContext.addProperties({
    //> @attr editContext.rootComponent    (PaletteNode : null : IR)
    // Root of data to edit.  Must contain the "type" property, with the name of a
    // valid +link{DataSource,schema} or nothing will be able to be dropped on this
    // EditContext. A "liveObject" property representing the rootComponent is also
    // suggested. Otherwise, a live object will be created from the palette node.
    // <P>
    // Can be retrieved at any time. Use +link{getRootEditNode} to retrieve the
    // +link{EditNode} created from the rootComponent. 
    //
    // @group devTools
    // @visibility external
    //<

    //> @attr editContext.defaultPalette (Palette : null : IRW)
    // +link{Palette} to use when an +link{EditNode} is being created directly by this EditContext,
    // instead of being created due to a user interaction with a palette (eg dragging from
    // a +link{TreePalette}, or clicking on +link{MenuPalette}).
    // <P>
    // If no defaultPalette is provided, the EditContext uses an automatically created
    // +link{HiddenPalette}.
    //
    // @visibility external
    //<
    // defaultPalette: null,

    //> @method editContext.getDefaultPalette()
    // @include editContext.defaultPalette
    // @return (Palette) the default Palette
    // @visibility external
    //<
    getDefaultPalette : function () {
        if (this.defaultPalette) return this.defaultPalette;
        return (this.defaultPalette = isc.HiddenPalette.create());
    },

    //> @method editContext.setDefaultPalette()
    // @include editContext.defaultPalette
    // @param palette (Palette) the default Palette
    // @visibility external
    //<
    setDefaultPalette : function (palette) {
        this.defaultPalette = palette;
        
        // If the palette has no defaultEditContext, then set it
        if (palette && !palette.defaultEditContext) {
            palette.defaultEditContext = this;
        }
    },

    //> @attr editContext.extraPalettes (Array of Palette : null : IRW)
    // Additional +link{Palette,Palettes} to consult for metadata when
    // deserializing +link{EditNode,Edit Nodes}. Note that the
    // +link{defaultPalette,defaultPalette} is always consulted and need not be
    // provided again here.
    //
    // @visibility external
    //<
    // extraPalettes: null,
    
    //> @attr editContext.persistCoordinates (Boolean : true : IRW)
    // When enabled, changes to a +link{editNode.liveObject,liveObject}'s position
    // and size will be persisted to their +link{EditNode,EditNodes} by default.
    // This applies to both programmatic calls and user interaction (drag reposition
    // or drag resize).
    // <p>
    // This feature can be disabled by either setting this property or
    // +link{editProxy.persistCoordinates} to <code>false</code>. This
    // property affects all nodes within the EditContext whereas the latter
    // property affects children of a single node. 
    // <p>
    // In some use-cases, like Reify, coordinates should not be
    // persisted except when a component explicitly enables this feature.
    // By setting this property to <code>null</code> no component will
    // persist coordinates of children unless
    // <code>EditProxy.persistCoordinates</code> is explicitly set to
    // <code>true</code>.
    // 
    // @visibility external
    //<
    persistCoordinates: true,

    //> @attr editContext.allowDropThrough (Boolean : null : IRW)
    // Dropping a component near the edge of another component allows the component to be
    // dropped through an ancestor component. To suppress this action set
    // <code>allowDropThrough</code> to false.
    //
    // @visibility external
    //<

    //> @attr editContext.allowNestedDrops (Boolean : null : IR)
    // Controls whether components can be dropped into other components which support child
    // components. 
    // <p>
    // When enabled, during a drop interaction in which a +link{paletteNode} or +link{editNode}
    // is the drop data, the +link{group:componentSchema,Component Schema} of the current
    // candidate drop target is inspected to see whether that parent allows children of the
    // type being dropped.  If it does, the drop will result in a call to +link{addNode()} for
    // a paletteNode or for an existing +link{editNode} in the same tree.
    // <p>
    // Specific components can disable nested drops by explicitly setting +link{EditProxy.allowNestedDrops}
    // to false.
    // <p>
    // This mode is enabled by default unless explicitly disabled by setting this property to
    // false.
    //
    // @visibility external
    //<

    init : function () {
        this.Super("init", arguments);

        this.selectedComponents = [];

        this.editNodeTree = this.createEditNodeTree();
    },

    createEditNodeTree : function () {
        // NOTE: there really is no reasonable default for rootComponent, since its type
        // determines what can be dropped.  This default will create a tree that won't accept
        // any drops, but won't JS error.
        var rootComponent = isc.addProperties({}, this.rootComponent || { type: "Object" }),
            rootLiveObject = this.rootLiveObject || rootComponent
        ;
        if (!rootComponent) rootComponent = { type: "Object" };
        if (this.useCopyPasteShortcuts) {
            if (!rootComponent.editProxyProperties) rootComponent.editProxyProperties = {};
            rootComponent.editProxyProperties.useCopyPasteShortcuts = true;
        }

        //>!BackCompat 2013.12.30
        if (!rootComponent.type) {
            rootComponent.type = (isc.isA.Class(rootComponent) ? rootComponent.Class : rootComponent._constructor);
        }
        
        
        if (rootLiveObject && !rootComponent.liveObject) {
            if (isc.isA.Canvas(rootLiveObject)) {
                rootComponent.liveObject = rootLiveObject;
            }
        }
        //<!BackCompat 2013.12.30

        var rootNode = this.makeEditNode(rootComponent);
        
        return isc.Tree.create({
            idField:"ID",
            root : rootNode,
            // HACK: so that all nodes can be targetted for D&D
            isFolder : function () { return true; },
            // HACK: since isFolder() shows all nodes as folders isOpen() would open by
            // default on "leaf" nodes (ones without actual children) causing keyboard
            // navigation by left-arrow to fail on the first press because the folder is
            // open and needs closing. For nodes reporting as leaf nodes (ignoring
            // node.children) return as false (closed).
            isOpen : function (node) {
                if (node == null) node = this.root;
                var children = this.getChildren(node),
                    hasEmptyChildren = isc.isAn.emptyArray(children),
                    origChildren = node[this.childrenProperty];
                if (hasEmptyChildren) {
                    node[this.childrenProperty] = null;
                }
                var isFolder = this.Super("isFolder", arguments);
                if (hasEmptyChildren) {
                    node[this.childrenProperty] = origChildren;
                }
                return (isFolder ? this.Super("isOpen", arguments) : false);
            }
        });
    },

    // Only called from VB (live/edit mode switch)
    switchEditMode : function (editingOn) {
        var selectedComponents = this.getSelectedComponents(); 
        if (!selectedComponents || selectedComponents.length == 0) return;

        for (var i = 0; i < selectedComponents.length; i++) {
            var selectedComponent = selectedComponents[i];
            if (editingOn) {
                this.refreshSelectedAppearance(selectedComponent);
            } else if (selectedComponent.editProxy != null) {
                selectedComponent.editProxy.showSelectedAppearance(false);
            }
        }
    },

    // Finds a palette node in the defaultPalette or other palettes provided
    findPaletteNode : function (fieldName, value) {
        // Try the default palette first
        var paletteNode = this.getDefaultPalette().findPaletteNode(fieldName, value);
        if (paletteNode) return paletteNode;

        if (this.extraPalettes) {
            if (!isc.isAn.Array(this.extraPalettes)) this.extraPalettes = [this.extraPalettes];

            // If not found, try any other palettes provided
            for (var i = 0; i < this.extraPalettes.length; i++) {
                paletteNode = this.extraPalettes[i].findPaletteNode(fieldName, value);
                if (paletteNode) return paletteNode;
            }
        }

        // If not found anywhere, return null
        return null;
    },

    // Finds a palette node in the defaultPalette or other palettes provided.
    // Returns first matching node at the deepest level.
    findPaletteNodeAtDepth : function (fieldName, value) {
        var palettes = [this.getDefaultPalette()];
        if (this.extraPalettes) {
            if (!isc.isAn.Array(this.extraPalettes)) palettes.add(this.extraPalettes);
            else palettes.addList(this.extraPalettes);
        }
        var paletteNode = this._findPaletteNodeAtDepthInPalettes(palettes, fieldName, value);
        return paletteNode;
    },

    _findPaletteNodeAtDepthInPalettes : function (palettes, fieldName, value) {
        for (var i = 0; i < palettes.length; i++) {
            var palette = palettes[i].data,
                matches = {}
            ;
            // Some palettes are just an array of palette nodes. For those find the first match
            if (isc.isAn.Array(palette)) {
                node = palette.findIndex(fieldName, value);
                if (node) matches[0] = node;
            } else {
                var index = palette.findNodeIndex(fieldName, value);
                do {
                    if (index >= 0) {
                        var node = palette.getAllNodes()[index],
                            level = palette.getLevel(node)
                        ;
                        if (!matches[level]) matches[level] = node;
                    }
                    index = palette.findNextNodeIndex(index+1, fieldName, value);
                } while (index >= 0);
            }

            if (!isc.isAn.emptyObject(matches)) {
                var choice = isc.getKeys(matches).map(function(value) { return parseInt(value); }).max();
                return matches[choice];
            }
        }
    },

    getEditNodeIDDescription : function (node, suppressExtraDescription) {
        if (!node) return "";

        // Get extra node description from the node's EditProxy or from the parent
        var extraDescription = "";

        if (!suppressExtraDescription) {
            // Allow node EditProxy to give extra description to this node
            if (node.liveObject && node.liveObject.editProxy) {
                var editProxy = node.liveObject.editProxy;
                if (editProxy.getNodeDescription) {
                    var description = editProxy.getNodeDescription(node);
                    if (description && description.length > 0) {
                        extraDescription = " [" + description + "]";
                    }
                }
            }

            // Allow parent node EditProxy to give extra description to this node
            // like which pane of a SplitPane (i.e. Detail Pane).
            if (extraDescription.length == 0) {
                var data = this.getEditNodeTree(),
                    parent = data.getParent(node)
                ;
                if (parent && parent.liveObject && parent.liveObject.editProxy) {
                    var editProxy = parent.liveObject.editProxy;
                    if (editProxy.getChildNodeDescription) {
                        var description = editProxy.getChildNodeDescription(node);
                        if (description && description.length > 0) {
                            extraDescription = " " + description;
                        }
                    }
                }
            }
        }

        return String(node.ID || node.type).asHTML() + extraDescription;
    },

    getTitleForType : function (type) {
        
        var paletteNode = this.findPaletteNodeAtDepth("type", type),
            title = (paletteNode ? paletteNode.title || type : type)
        ;
        // Remove any explicit bold markup around title
        return title.replace(/<(\/)?b>/g, "");
    },

    //> @method editContext.addNode()
    // Add a new +link{EditNode} to the EditContext, under the specified parent. If the parentNode
    // is not provided it will be determined from +link{editContext.defaultParent}.
    // <P>
    // The EditContext will interrogate the parent and new nodes to determine what field 
    // within the parent allows a child of this type, and to find a method to add the newNode's 
    // liveObject to the parentNode's liveObject.  The new relationship will then be stored
    // in the tree of EditNodes.
    // <P>
    // For example, when a Tab is dropped on a TabSet, the field TabSet.tabs is discovered as
    // the correct target field via naming conventions, and the method TabSet.addTab() is likewise 
    // discovered as the correct method to add a Tab to a TabSet.
    //
    // @param newNode (EditNode) new node to be added
    // @param [parentNode] (EditNode) parent to add the new node under.
    // @param [index] (Integer) index within the parent's children array
    // @param [parentProperty] (String) the property of the liveParent to which the new node should
    //                                  be added, if not auto-discoverable from the schema
    // @param [skipParentComponentAdd] (Boolean) whether to skip adding the liveObject to the liveParent
    //                                           (default false)
    // @param [forceSingularFieldReplace] (Boolean) whether to replace existing single field node
    //                                              if newNode liveObject is the same (default false)
    // @return newNode (EditNode) node added
    // @visibility external
    //<
    addNode : function (newNode, parentNode, index, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification) {
        this.recordAction("addNode", arguments);

        var iscClass = isc.DataSource.getNearestSchemaClass(newNode.type);
        if (iscClass && (iscClass.isA(isc.DataSource) || newNode.deferCreation)) {
            // If we're adding a datasource that must be loaded, then defer the addNode
            // until the datasource is loaded.  Similarly respect the needs of any other
            // object requesting deferral by way of its deferCreation property.
            if (newNode.loadData && !newNode.isLoaded) {
    	        var self = this;
    	        var loadingNodeTree = isc._loadingNodeTree;
                newNode.loadData(newNode, function () {
                    
                    var isLoading = isc._loadingNodeTree;
                    if (!isLoading && loadingNodeTree) isc._loadingNodeTree = true;

                    if (newNode.deferCreation) {
                        newNode = self.makeEditNode(newNode);
                    }

                    self.addNode(newNode, parentNode, index, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification);
                    if (!isLoading && loadingNodeTree) delete isc._loadingNodeTree;
                });
                return;
            }
            // If server is unable to load the DS a simple placeholder DS is provided with
            // the unableToLoad property set. Mark the DS as client-only so fetches will
            // not fail a server query.
            if (newNode.liveObject && newNode.liveObject.unableToLoad && !newNode.liveObject.reportedUnableToLoad) {
                newNode.liveObject.setClientOnly(true);
                newNode.liveObject.reportedUnableToLoad = true;
                if (!this.loadingErrors) this.loadingErrors = [];
                this.loadingErrors.add("Unable to load DataSource " + newNode.ID);
            }
        }

        var data = this.getEditNodeTree();

        var defaultParentNode = this.getDefaultParent(newNode);
        if (parentNode == null) parentNode = defaultParentNode;

        var liveParent = this.getLiveObject(parentNode);
        this.logInfo("addNode will add newNode of type: " + newNode.type +
                     " to: " + this.echoLeaf(liveParent), "editing");

        if (liveParent.wrapChildNode) {
            parentNode = liveParent.wrapChildNode(this, newNode, parentNode, index);
            if (!parentNode) return;
            liveParent = this.getLiveObject(parentNode);
        }

        // find what field in the parent can accommodate a child of this type (prefer the 
        // passed-in name over a looked-up one, so the user can override in the case of 
        // multiple valid parent fields)
        var fieldName = parentProperty || isc.DS.getObjectField(liveParent, newNode.type);
        var field = isc.DS.getSchemaField(liveParent, fieldName);

        if (!field) {
            
            if (!iscClass || !iscClass.isA(isc.DataSource) || parentNode != defaultParentNode) {
                this.logWarn("can't addNode: can't find a field in parent: " + liveParent +
                             " for a new child of type: " + newNode.type + ", parent property:" + fieldName + 
                             ", newNode is: " +
                             this.echo(newNode));
            }
            return;
        }

        // for a singular field (eg listGrid.dataSource), remove the old node first.
        // however, for certain singular fields don't remove existing editNode or destroy the
        // existing component (ex. ValuesManager).
        if (!field.multiple && field.destroyOnReplace != "false") {
            
            var existingChild = isc.DS.getChildObject(liveParent, newNode.type, null, parentProperty);
            if (existingChild && !newNode.generatedType && (existingChild != newNode.liveObject || forceSingularFieldReplace)) {
                var existingChildNode = data.getChildren(parentNode).find("ID", isc.DS.getAutoId(existingChild));
                if (existingChildNode) {
                    this.logWarn("destroying existing child: " + this.echoLeaf(existingChild) +
                                 " in singular field: " + fieldName);
                    data.remove(existingChildNode);
                    if (isc.isA.Class(existingChild) && !isc.isA.DataSource(existingChild)) {
                        existingChild.destroy();
                    }
                }
            }
        }

        // NOTE: generated components and remove/add cycles: some widgets convert config
        // objects into live objects (eg formItem properties to live FormItem, tab -> ImgTab,
        // section -> SectionHeader, etc).  When we are doing an add/remove cycle for these
        // kinds of generated objects:
        // - rebuild based on defaults, rather than trying to re-add the liveObject, which will
        //   be a generated component that the parent will have destroyed
        // - preserve Canvas children of the generated component, such as tab.pane,
        //   section.items, which have not been added to the defaults.  We do this by using
        //   part of the serialization logic (serializeChildData)
        // - ensure removal of the tab, item, or section does not destroy these Canvas children
        //   (a special flag is passed to at least TabSets to avoid this)

        // Optimization for add/remove cycles: check for methods like "reorderMember" first.
        // Note this doesn't remove the complexity discussed above because a generated
        // component might be moved between two parents.
        var childObject,
            hadExistingLiveObject
        ;
        if (newNode.generatedType) {
            // copy to avoid property scribbling that is currently done by TabSets and
            // SectionStacks at least
            childObject = isc.addProperties({}, newNode.defaults);
            this.serializeChildData(childObject, data.getChildren(newNode));
            newNode.liveObject = childObject;
        } else {
            childObject = newNode.liveObject;
            hadExistingLiveObject = (childObject != null);
        }

        // Let the liveObject know about the editContext and editNode. We used
        // to do this for some objects in addedToEditContext, but that isn't
        // sufficient for liveObjects that are in fact config blocks (since they
        // don't have the callback).
        childObject.editContext = this;
        childObject.editNode = newNode;

        var children = data.getChildren(parentNode);
        
        // For nodes added to the top-level we want to sort non-visible components
        // (ex. ValuesManager, etc.) to the top and visible components to the bottom.
        if (index == null && !parentProperty && parentNode == this.getRootEditNode()) {
            var visibleChild = isc.isA.Canvas(childObject);
            if (visibleChild) {
                index = children.length;
            } else {
                for (var i = 0; i < children.length; i++) {
                    if (isc.isA.Canvas(children[i].liveObject)) {
                        index = i;
                        break;
                    }
                }
            }
        }

        var liveIndex = index;
        if (liveIndex != null && parentProperty) {
            // Nodes that have different parents (non-default) are intermingled in node
            // tree. For example Window.headerControls and footerControls are shown as
            // just children of the Window. When adding a new node to one of those at a
            // specific location - commonly through drag reposition in the tree - the index
            // is for the mixed children. However, for the child object addition we need
            // to adjust the index to be the position within the parentProperty.
            liveIndex = 0;
            for (var i = 0; i < Math.min(index, children.length); i++) {
                var childNode = children[i];
                if (childNode.defaults && childNode.defaults.parentProperty == parentProperty) {
                    liveIndex++;
                }
            }
        } else if (liveIndex != null) {
            // Adjust index if a DataSource is shown in the child nodes above where
            // the add occurred
            for (var i = 0; i < Math.min(index, children.length); i++) {
                if (isc.isA.DataSource(children[i].liveObject)) {
                    liveIndex--;
                    break;
                }
            }
        }

        if (!skipParentComponentAdd) {
            var result = isc.DS.addChildObject(liveParent, newNode.type, childObject, liveIndex, parentProperty);
            if (!result) {
                this.logWarn("addChildObject failed, returning");
                return;
            }
        }

        // fetch the liveObject back from the parent to handle its possible conversion from
        // just properties to a live instance.
        // NOTE: fetch object by ID, not index, since on a reorder when a node is dropped after
        // itself the index is one too high
        if (!newNode.liveObject || newNode.generatedType) {
            var foundLiveObject = isc.DS.getChildObject(liveParent, newNode.type,
                    isc.DS.getAutoId(newNode.defaults), parentProperty,
                    isc.DS.getUsedAutoIdField(newNode.defaults));
            if (foundLiveObject != null) newNode.liveObject = foundLiveObject;
        }

        this.logDebug("for new node: " + this.echoLeaf(newNode) + 
                      " liveObject is now: " + this.echoLeaf(newNode.liveObject),
                      "editing");

        if (newNode.liveObject == null) {
            this.logWarn("wasn't able to retrieve live object after adding node of type: " +
                         newNode.type + " to liveParent: " + liveParent + 
                         ", does liveParent have an appropriate getter() method?");
        }

        // Save parentProperty into defaults to be used to lookup liveObject
        // and serialize.
        if (parentProperty) newNode.defaults.parentProperty = parentProperty;

        // add the node representing the component to the project tree
        data.add(newNode, parentNode, index);
        // gets rid of the spurious opener icon that appears because all nodes are regarded as
        // folders and dropped node is unloaded, hence might have children
        data.openFolder(newNode);

        this.logInfo("added node " + this.echoLeaf(newNode) + 
                     " to EditTree at path: " + data.getPath(newNode) + 
                     " with live object: " + this.echoLeaf(newNode.liveObject), "editing");

        // Call hook in case the EditContext wants to do further processing ... useful to avoid
        // problem with calling Super with an interface method
        this._nodeAdded(newNode, parentNode, data.getRoot(), skipNodeAddedNotification);

        // Call hook in case the live object wants to know about being added
        if (newNode.liveObject.addedToEditContext) {
            newNode.liveObject.addedToEditContext(this, newNode, parentNode, index);
        }

        if (this.isNodeEditingOn(newNode) && newNode.liveObject.editProxy &&
                newNode.liveObject.editProxy.canSelectChildren && !this._selectionLiveObject)
        {
            // Hang on to the liveObject that manages the selection UI.
            // It is responsible for showing the outline or other selected state
            this._selectionLiveObject = newNode.liveObject;
        }

        // A paletteNode can reference a paletteNode as autoAddChild to have it automatically
        // added as a child with the new node. Don't do this if moving an existing component.
        if (!isc._loadingNodeTree && !hadExistingLiveObject && newNode.autoAddChild) {
            var paletteNodes = newNode.autoAddChild;
            if (!isc.isAn.Array(paletteNodes)) paletteNodes = [paletteNodes];
            for (var i = 0; i < paletteNodes.length; i++) {
                var paletteNode = paletteNodes[i];
                if (paletteNode.ref) {
                    // new child comes from a reference to another paletteNode
                    paletteNode = this.findPaletteNode("refID", paletteNode.ref);
                }
                var editNode = this.makeEditNode(paletteNode);
                this.addNode(editNode, newNode);
            }
        }
        return newNode;    
    },

    //>!BackCompat 2011.06.25
    addComponent : function (newNode, parentNode, index, parentProperty, skipParentComponentAdd) {
        return this.addNode(newNode, parentNode, index, parentProperty, skipParentComponentAdd);
    },
    //<!BackCompat

    //> @method editContext.getRootEditNode()
    // Returns the root +link{EditNode} of the EditContext typically created from +link{rootComponent}.
    //
    // @return (EditNode) the root EditNode
    // @visibility external
    //<
    getRootEditNode : function () {
        return (this.getEditNodeTree() ? this.getEditNodeTree().getRoot() : null);
    },

    //> @method editContext.reorderNode()
    // Moves an +link{EditNode} from one child index to another in the EditContext under the specified parent.
    // <P>
    // No changes are made to the live objects.
    //
    // @param parentNode (EditNode) parent to reorder child nodes
    // @param index (Integer) index within the parent's children array to be moved
    // @param moveToIndex (Integer) index within the parent's children array at which to place moved node
    // @visibility devTools
    //<
    reorderNode : function (parentNode, index, moveToIndex) {
        var data = this.getEditNodeTree();

        // Locate child node that has moved
        var childNode = data.getChildren(parentNode).get(index);

        // Remove the child node from the tree and insert it back at the new location
        data.remove(childNode);
        data.add(childNode, parentNode, moveToIndex);

        // We really don't need a nodeReordered handler but we do need to trigger something
        // to our editContext so it knows there was a change and can save if desired
        this.fireEditNodeUpdated(childNode, {});
    },

    //> @attr editContext.autoEditNewNodes (Boolean : null : IRW)
    // New nodes added to the editContext are automatically placed
    // into edit mode if the new node's parent is in edit mode. To
    // suppress this action set <code>autoEditNewNodes</code> to false.
    //
    // @visibility external
    //<
    // autoEditNewNodes: null,

    //> @method editContext.substitutedNode()
    // Notification fired when a different +link{PaletteNode} is substituted for one
    // being dropped into a container.
    //
    // @param origNode (PaletteNode) node that was originally dropped
    // @param newNode (PaletteNode) node that was substituted
    // @param parentNode (EditNode) parent node of the drop
    // @visibility external
    //<

    fireSubstitutedNode : function (origNode, newNode, parentNode) {
        if (this.substitutedNode) {
            this.substitutedNode(origNode, newNode, parentNode);
        }
    },

    //> @method editContext.convertedNode()
    // Notification fired when an +link{EditNode} is converted to a different type
    // when moved from one container to another.
    //
    // @param origNode (EditNode) node that was being moved
    // @param newNode (EditNode) node that was placed into new container
    // @param parentNode (EditNode) parent node of the drop
    // @visibility external
    //<

    fireConvertedNode : function (origNode, newNode, parentNode) {
        if (this.convertedNode) {
            this.convertedNode(origNode, newNode, parentNode);
        }
    },

    //> @method editContext.nodeAdded()
    // Notification fired when an +link{EditNode} has been added to the EditContext
    //
    // @param newNode (EditNode) node that was added
    // @param parentNode (EditNode) parent node of the node that was added
    // @param rootNode (EditNode) root node of the edit context
    // @visibility external
    //<
    // Empty function in case someone wants to observe.
    nodeAdded : function (newNode, parentNode, rootNode) {},

    _nodeAdded : function (newNode, parentNode, rootNode, skipNodeAddedNotification) {
        if (newNode.useEditMask != null) {
            this.setEditProxyProperties(newNode, { useEditMask: newNode.useEditMask });
        }

        // Allow class user to hook the process before any automatic
        // changes are made
        if (this.nodeAdded && !skipNodeAddedNotification) {
            this.nodeAdded(newNode, parentNode, rootNode);
        }

        // When parentNode is in editMode, set this new node into editMode
        
        if (this.autoEditNewNodes != false && 
                ((this.creator && this.creator.editingOn) || 
                        parentNode && this.isNodeEditingOn(parentNode)))
        {
            this.enableEditing(newNode);
        }
    },

    //> @method editContext.nodeRemoved()
    // Notification fired when an +link{EditNode} has been removed from the EditContext
    //
    // @param removedNode (EditNode) node that was removed
    // @param parentNode (EditNode) parent node of the node that was removed
    // @param rootNode (EditNode) root node of the edit context
    // @visibility external
    //<
    // Empty function in case someone wants to observe.
    nodeRemoved : function (removedNode, parentNode, rootNode) {},

    _nodeRemoved : function (removedNode, parentNode, rootNode, skipNodeRemovedNotification) {
        // Allow class user to hook the process before any automatic
        // changes are made
        if (this.nodeRemoved && !skipNodeRemovedNotification) {
            this.nodeRemoved(removedNode, parentNode, rootNode);
        }
    },

    //> @method editContext.nodeMoved()
    // Notification fired when an +link{EditNode} has been moved to a new position in the
    // component tree.
    //
    // @param oldNode (EditNode) node that was removed
    // @param oldParentNode (EditNode) parent node of the node that was removed
    // @param newNode (EditNode) node that was added
    // @param newParentNode (EditNode) parent node of the node that was added
    // @param rootNode (EditNode) root node of the edit context
    // @visibility external
    //<
    // Empty function in case someone wants to observe.
    nodeMoved : function (oldNode, oldParentNode, newNode, newParentNode, rootNode) {},

    fireNodeMoved : function (oldNode, oldParentNode, newNode, newParentNode) {
        var editTree = this.getEditNodeTree(),
            rootNode = editTree.getRoot()
        ;
        if (this.nodeMoved) {
            this.nodeMoved(oldNode, oldParentNode, newNode, newParentNode, rootNode);
        }

        // Let EditProxy know about the changes
        if (oldNode.liveObject && oldNode.liveObject.editProxy) {
            oldNode.liveObject.editProxy.nodeMoved(oldNode, oldParentNode, newNode, newParentNode, rootNode);
        }
        if (oldNode != newNode && newNode.liveObject && newNode.liveObject.editProxy) {
            newNode.liveObject.editProxy.nodeMoved(oldNode, oldParentNode, newNode, newParentNode, rootNode);
        }

        // If the moved node has children, they moved too
        var childNodes = editTree.getChildren(newNode);
        if (childNodes) {
            for (var i = 0; i < childNodes.length; i++) {
                var node = childNodes[i];
                this.fireNodeMoved(node, newNode, node, newNode);
            }
        }
    },

    //> @attr editContext.defaultParent (EditNode : null : IWR)
    // The default parent +link{EditNode} to be used when a new
    // EditNode is added to the EditContext without a specified parent. This
    // commonly occurs when a paletteNode is double-clicked in a palette.
    // <p>
    // If not specified, the root editNode (see +link{getRootEditNode}) is used.
    // <p>
    // Note: this property is automatically cleared if node is removed from the
    // editTree such as on calls to +link{destroyAll} or +link{removeNode}.
    //
    // @visibility external
    //<

    getDefaultParent : function (newNode, returnNullIfNoSuitableParent) {
        return (this.defaultParent ? this.defaultParent : this.getRootEditNode());
    },

    //> @method editContext.addFromPaletteNode()
    // Creates a new EditNode from a PaletteNode, using the
    // +link{defaultPalette}.  If you have an array of possibly inter-related
    // PaletteNodes, then you should use
    // +link{addFromPaletteNodes(),addFromPaletteNodes()} on the array instead,
    // in order to preserve the relationships.
    //
    // @param paletteNode (PaletteNode) the palette node to use to create the new node
    // @param [parentNode] (EditNode) optional the parent node if the new node should appear
    //                                under a specific parent
    // @return (EditNode) the EditNode created from the paletteNode
    // @see addFromPaletteNodes()
    // @visibility external
    //< 
    addFromPaletteNode : function (paletteNode, parentNode, targetIndex, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification) {
        
        var editNode = this.makeEditNode(paletteNode),
            type = editNode.type || editNode.className,
            //clazz = isc.ClassFactory.getClass(type)
            clazz = isc.DataSource.getNearestSchemaClass(type)
        ;
        if (clazz && clazz.isA("FormItem")) {
            // If the parent node of a FormItem is a DynamicForm, don't wrap the new node
            var parentType = (parentNode ? parentNode.type || parentNode.className : null),
                parentClazz = (parentNode ? isc.DataSource.getNearestSchemaClass(parentType) : null)
            ;
            if (!parentNode || (parentClazz && !parentClazz.isA("DynamicForm"))) { 
                // Wrap the FormItem in a DynamicForm
                var node = this.addWithWrapper(editNode, parentNode);
                // Return the wrapper node
                return this.getEditNodeTree().getParent(node);
            }
        }
        if (paletteNode.dropped) editNode.dropped = true;
        return this.addNode(editNode, parentNode, targetIndex, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification);
    },
    
    //> @method editContext.makeEditNode()
    // Creates and returns an EditNode using the +link{defaultPalette}.  Does not add the newly
    // created EditNode to an EditContext.
    // 
    // @param paletteNode (PaletteNode) the palette node to use to create the new node
    // @return (EditNode) the EditNode created from the paletteNode
    // @visibility external
    //<
    makeEditNode : function (paletteNode) {
        var origAutoDraw = (paletteNode.defaults ? paletteNode.defaults.autoDraw : null),
            palette = this.getDefaultPalette(),
            editNode = palette.makeEditNode(paletteNode),
            newAutoDraw = (editNode.defaults ? editNode.defaults.autoDraw : null)
        ;
        // If the new editNode is part of an initial context load and did not have a
        // default autoDraw value but is now assigned autoDraw:false remove the new
        // autoDraw default because this must be the main, top-level component.
        
        if (this._initialLoad && origAutoDraw == null && newAutoDraw == false) {
            delete editNode.defaults.autoDraw;
        }
        return editNode;
    },

    // alternative to just using node.liveObject
    // exists because forms used to rebuild *all* items when any single item is added, hence
    // making the liveObject stale for siblings of an added item
    getLiveObject : function (node) {
        var data = this.getEditNodeTree();
        var parentNode = data.getParent(node);

        // at root, just use the cached liveObject (a formItem can never be at root)
        if (parentNode == null) {
            return node.liveObject;
        }

        
        var liveParent = parentNode.liveObject,
            parentProperty = (node.defaults ? node.defaults.parentProperty : null),
            liveObject = isc.DS.getChildObject(liveParent, node.type, node.ID, parentProperty)
        ;

        if (liveObject) node.liveObject = liveObject;
        return node.liveObject;
    },

    // wizard handling
    requestLiveObject : function (newNode, callback, palette) {
        var _this = this;

        // handle deferred nodes (don't load or create their liveObject until they are actually
        // added).  NOTE: arguably the palette should handle this, and makeEditNode()
        // should be asynchronous in this case.
        if (newNode.loadData && !newNode.isLoaded) {
            newNode.loadData(newNode, function (loadedNode) {
                loadedNode = loadedNode || newNode
                loadedNode.isLoaded = true;
                // preserve the "dropped" flag
                loadedNode.dropped = newNode.dropped;
                _this.fireCallback(callback, "node", [loadedNode]);
            }, palette);
            return;
        }

        if (newNode.wizardConstructor) {
            this.logInfo("creating wizard with constructor: " + newNode.wizardConstructor);
            var wizard = isc.ClassFactory.newInstance(newNode.wizardConstructor,
                                                      newNode.wizardDefaults);
            // ask the wizard to go through whatever steps 
            wizard.getResults(newNode, function (results) {
                // accept either a paletteNode or editNode (detect via liveObject)
                if (!results.liveObject) {
                    results = palette.makeEditNode(results);
                }
                _this.fireCallback(callback, "node", [results]);
                // Done with this wizard - destroy it if needed
                if (wizard.markForDestroy) wizard.markForDestroy();
                else if (wizard.destroy) wizard.destroy();
            }, palette);
            return;
        }

        this.fireCallback(callback, "node", [newNode]);
    },

    // Helper methods
    // ---------------------------------------------------------------------------------------

    getParentNode : function (node) {
        var data = this.getEditNodeTree();
        return data.getParent(node);
    },

    //> @method editContext.getEditNodeTree()
    // Gets the tree of editNodes being edited by this editContext. Standard tree
    // traversal methods can then be used to locate desired editNodes for interaction.
    // <P>
    // <B>Note: the returned tree is read-only and must only be modified by calling
    // methods on EditContext like +link{editContext.addNode} or +link{editContext.setNodeProperties}.</B>
    //
    // @return (Tree) the tree of EditNodes
    // @visibility external
    //<
    getEditNodeTree : function () {
        return this.editNodeTree;
    },

    getEditNodeArray : function () {
        return this.getEditNodeTree().getAllNodes();
    },

    //>!BackCompat 2011.06.25 
    getEditComponents : function () {
        return this.getEditNodeArray();
    },
    //<!BackCompat

    //> @method editContext.getEditNodesByType()
    // Returns +link{EditNode,EditNodes} as an array that match the
    // specified type or types. By default the <code>types</code> are matched against the
    // +link{editNode.type} or the general type of the component. By setting <code>strict</code>
    // to <code>true</code> the match is made against the editNode type exactly.
    // <P>
    // For example, searching for "Canvas" nodes will return nodes for any component that
    // derives from Canvas unless <code>strict</code> is set. In the strict case, the search
    // will only return nodes for explict Canvas nodes.
    //
    // @param types (Array of String | String) type or types of nodes to find
    // @param [strict] (boolean) true to match the +link{EditNode.type} exactly
    // @return (Array of EditNode) the filtered list of EditNodes
    // @visibility external
    //<
    getEditNodesByType : function (types, strict) {
        types = (!isc.isAn.Array(types) ? [types] : types);

        var allNodes = this.getEditNodeArray(),
            nodes = []
        ;
        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i],
                liveObject = node.liveObject
            ;
            // if (!liveObject) continue;
            if (types.contains(node.type)) {
                nodes.push(node);
            } else if (!strict) {
                // var clazz = isc.DataSource.getNearestSchemaClass(node.type);
                // Try schema first, in case the type is not a className
                var classObject = isc.DS.getNearestSchemaClass(node.type);

                // If there is no schema, then see if the type is a className 
                if (classObject == null) {
                    classObject = isc.ClassFactory.getClass(node.type);
                }

                if (classObject) {
                    for (var j = 0; j < types.length; j++) {
                        var type = types[j];
                        if (classObject.isA(type)) {
                            nodes.push(node);
                            break;
                        }
                    }
                }
            }
        }
        return nodes;
    },

    //> @method editContext.editNodeHasDataSource()
    // Does the +link{EditNode,editNode} have a DataSource assigned?
    //
    // @param editNode (EditNode) editNode to check for a DataSource
    // @return (Boolean) true if the editNode has a DataSource assigned
    // @visibility external
    //<
    editNodeHasDataSource : function (editNode) {
        var editTree = this.getEditNodeTree(),
            children = editTree.getChildren(editNode)
        ;
        for (var i = 0; i < children.length; i++) {
            var liveObject = children[i].liveObject;
            if (liveObject && isc.isA.DataSource(liveObject)) {
                return true;
            }
        }
        return false;
    },

    //> @method editContext.editNodeHasFields()
    // Does the +link{EditNode,editNode} have at least one field assigned?
    // <P>
    // Note that if this method is called for a component editNode that could have child
    // components rather than fields, it will return <code>true</code> if there are any
    // child nodes other than a DataSource.
    //
    // @param editNode (EditNode) editNode to check for fields
    // @return (Boolean) true if the editNode has fields or child nodes other than a DataSource
    // @visibility external
    //<
    editNodeHasFields : function (editNode) {
        var editTree = this.getEditNodeTree(),
            children = editTree.getChildren(editNode)
        ;

        // true if there are children and the only child is not a DataSource
        return (children &&
            (children.length > 1 || (children == 1 && !this.editNodeHasDataSource(editNode))));
    },

    // ---------------------------------------------------------------------------------------

    // tests whether the targetNode can accept a newNode of type "dragType"
    canAddToTarget : function (targetNode, dragType, dragTarget, dragData, dropOnFolder) {
        var liveObject = targetNode.liveObject;

        if (!isc.isA.Class(liveObject)) {
            // Components like MenuItem
            return (isc.DS.getObjectField(targetNode, dragType) != null);
        }

        if (liveObject.editProxy) {
            return liveObject.editProxy.canAddNode(dragType, dragTarget, dragData, dropOnFolder);
        }

        // Components like a DataSource that have no editProxy
        return (liveObject.getObjectField(dragType) != null);
    },

    //> @method EditContext.removeAll()
    // Removes all +link{EditNode,EditNodes} from the EditContext, but does not destroy 
    // the +link{EditNode.liveObject,liveObjects}.
    // @visibility external
    //<
    removeAll : function () {
        var data = this.getEditNodeTree();
        var rootChildren = data.getChildren(data.getRoot()).duplicate();
        for (var i = 0; i < rootChildren.length; i++) {
            this.removeNode(rootChildren[i]);
        }

        // Action does not support undo and therefore nullifies any current undo entries
        this.resetUndoLog();
    },

    //> @method EditContext.destroyAll()
    // Removes all +link{EditNode,EditNodes} from the EditContext, and calls
    // +link{Canvas.destroy(),destroy()} on the
    // +link{EditNode.liveObject,liveObjects}.
    // @visibility external
    //<
    destroyAll : function () {
        // Make sure nothing is selected
        this.deselectAllComponents();
        var data = this.getEditNodeTree();
        var rootChildren = data.getChildren(data.getRoot()).duplicate();
        for (var i = 0; i < rootChildren.length; i++) {
            this.destroyNode(rootChildren[i]);
        }

        // defaultParent cannot be valid anymore
        this.defaultParent = null;

        // Action does not support undo and therefore nullifies any current undo entries
        this.resetUndoLog();
    },

    //> @method EditContext.removeNode()
    // Removes +link{EditNode,EditNode} from the EditContext. The editNode
    // liveObject is not destroyed.
    // @param editNode (EditNode) node to be removed
    // @visibility external
    //<
    removeNode : function (editNode, skipLiveRemoval, skipNodeRemovedNotification) {
        this.recordAction("removeNode", arguments);

        var data = this.getEditNodeTree();

        // remove the corresponding component from the object model
        var parentNode = data.getParent(editNode);
        // If the editNode is not in the tree, nothing more to do
        if (!parentNode) return;
        var liveChild = this.getLiveObject(editNode);
        var liveParent = parentNode == null ? null : this.getLiveObject(parentNode);

        // If editNode is part of editMode component selection
        // deselect it now
        if (this.isComponentSelected(liveChild)) this.deselectComponents(liveChild);

        // remove the node from the tree
        data.remove(editNode);

        // Clear defaultParent if node is removed
        if (editNode == this.defaultParent) this.defaultParent = null;

        if (!skipLiveRemoval) {
            if (liveParent && liveChild) {
                //this.logWarn("removing with defaults: " + this.echo(editNode.defaults));
                isc.DS.removeChildObject(liveParent, editNode.type, liveChild, (editNode.defaults ? editNode.defaults.parentProperty : null));
            }

            // After a ValuesManager is removed, be sure that defaults no longer reference the
            // VM. The component itself will have been cleared.
            if (isc.isA.ValuesManager(liveChild)) {
                var data = this.getEditNodeTree(),
                    nodes = data.getAllNodes()
                ;
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (node.defaults && node.defaults.valuesManager == editNode.ID) {
                        // Remove reference to VM so that component tree updates will see the
                        // immediate indication that VM is no longer assigned. Otherwise, the
                        // reference will not be removed until the VM is destroyed.
                        node.liveObject.valuesManager = null;
                        this.removeNodeProperties(node, "valuesManager");
                    }
                }
            }
        }

        // Call hook in case the EditContext wants to do further processing ... useful to avoid
        // problem with calling Super with an interface method
        this._nodeRemoved(editNode, parentNode, data.getRoot(), skipNodeRemovedNotification);
    },

    //>!BackCompat 2011.06.25
    removeComponent : function (editNode, skipLiveRemoval) { // old name
        return this.removeNode(editNode, skipLiveRemoval);
    },
    //<!BackCompat

    // destroy an editNode in the tree, including it's liveObject
    destroyNode : function (editNode) {
        this.recordAction("destroyNode", arguments);

        var liveObject = this.getLiveObject(editNode);
        this.removeNode(editNode);
        // if it is not a DataSource (singleton) and has a destroy function, call it.
        // Otherwise we assume garbage collection will work
        if (liveObject && liveObject.destroy && !isc.isA.DataSource(liveObject)) {
            liveObject.destroy();
        }
        editNode.liveObject = null;
    },
    
    //>!BackCompat 2011.06.25
    destroyComponent : function (editNode) { // old name
        return this.destroyNode(editNode);
    },
    //<!BackCompat

    // EditFields : optional lists of fields that can be edited in an EditContext
    // ---------------------------------------------------------------------------------------

    getEditDataSource : function (canvas) {
        return isc.DataSource.getDataSource(canvas.editDataSource || canvas.Class || 
                                            this.editDataSource);
    },

    // fields to edit:
    // - application-specific: two different editing applications may edit the same type of
    //   component (eg a ListViewer) exposing different sets of properties
    //   - the DataSource may not even represent the full set of properties, but regardless,
    //     can act as a default list of fields and reference properties for those fields
    // - on an application-specific basis, should be able to have a base set of fields, plus
    //   additions
    
    // get list of editable fields for a component.  May be a mix of string field names and
    // field objects
    _getEditFields : function (canvas) {
        // combine the baseEditFields and editFields properties
        var fields = [];
        fields.addList(canvas.baseEditFields);
        
        fields.addList(canvas.editFields);
 
        // HACK: set any explicitly specified fields to be visible, since many fields in the
        // current widget DataSources are set to visible=false to suppress them in editing
        // demos.  If a field is explicitly specified in editFields, we want it to be shown
        // unless they've set "visible" explicitly
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.visible == null) field.visible = true;
        }

        // if this is an empty list, take all the fields from the DataSource
        if (fields.length == 0) {
            fields = this.getEditDataSource(canvas).getFields();
            fields = isc.getValues(fields);
        }
        return fields;
    },
    
    // get the list of editable fields as an Array of Strings
    getEditFieldsList : function (canvas) {
        var fieldList = [],
            fields = this._getEditFields(canvas);
        // return just the name for any fields specified as objects
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (isc.isAn.Object(field)) {
                fieldList.add(field.name);
            } else {
                fieldList.add(field);
            }
        }
        return fieldList;
    },

    // get the edit fields, suitable for passing as "fields" to a dataBinding-aware component
    getEditFields : function (canvas) {
        var fields = this._getEditFields(canvas);
        // make any string fields into objects
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (isc.isA.String(field)) field = {name:field};
            // same hack as above to ensure visibility of explicitly specified fields, for
            // fields specified as just Strings
            if (field.visible == null) field.visible = true;
            fields[i] = field;
        }

        return fields;
    },

    // Serializing
    // --------------------------------------------------------------------------------------------
    // Take a tree of editNodes and produce a data structure that can be serialized to produce
    // actual XML or JSON source code

    
    
    //>!BackCompat 2013.09.27
    serializeComponents : function (serverless, includeRoot) {
        return this.serializeAllEditNodes({ serverless: serverless }, includeRoot);
    },
    //<!BackCompat

    //> @object SerializationSettings
    // Settings to control +link{EditContext} serialization.
    //
    // @group devTools
    // @treeLocation Client Reference/Tools
    // @visibility external
    //<

    //> @attr serializationSettings.serverless (Boolean : null : IR)
    // When true specify DataSources in full rather than assuming they can be
    // downloaded from the server.
    // @visibility external
    //<

    //> @attr serializationSettings.indent (Boolean : null : IR)
    // Overrides the default indention setting during serialization. XML defaults
    // to indented and JSON defaults to non-indented.
    // @visibility external
    //<

    //> @attr serializationSettings.outputComponentsIndividually (Boolean : true : IR)
    // Overrides the default component output setting during serialization. By default
    // Canvas and DrawItem components are serialized individually and referenced by their
    // containers.
    // @visibility external
    //<

    //> @attr serializationSettings.separateComponents (boolean : false : IR)
    // Return the component serialization and the non-component serialization as separate
    // properties of an object rather than a single string.  For now only used by Mockup Mode.
    //<
    
    //> @method editContext.serializeAllEditNodes()
    // Serialize the tree of +link{EditNode,EditNodes} to an XML representation
    // of +link{PaletteNode,PaletteNodes}. The result can be supplied to 
    // +link{addPaletteNodesFromXML(),addPaletteNodesFromXML()} to recreate
    // the EditNodes.
    //
    // @param [settings] (SerializationSettings) Additional serialization settings
    // @return (String) an XML representation of PaletteNodes which can be used to
    //                  recreate the tree of EditNodes.
    // @see addPaletteNodesFromXML
    // @visibility external
    //<
    serializeAllEditNodes : function (settings, includeRoot) {
        // we flatten the Tree of objects into a flat list of top-level items
        // to serialize.  Nesting (eg grid within Layout) is accomplished by
        // having the Layout refer to the grid's ID.
        var data = this.getEditNodeTree();
        var nodes = includeRoot ? [data.root] : data.getChildren(data.root).duplicate();
        var value = this.serializeEditNodes(nodes, settings);
        return value;
    },

    //> @method editContext.serializeAllEditNodesAsJSON()
    // Encode the tree of +link{EditNode,EditNodes} to a JSON representation
    // of +link{PaletteNode,PaletteNodes}. The result can be supplied to 
    // +link{addPaletteNodesFromJSON(),addPaletteNodesFromJSON()} to recreate
    // the EditNodes.
    //
    // @param [settings] (SerializationSettings) Additional serialization settings
    // @return (String) a JSON representation of PaletteNodes which can be used to
    //                  recreate the tree of EditNodes.
    // @see addPaletteNodesFromJSON
    // @visibility external
    //<
    serializeAllEditNodesAsJSON : function (settings, includeRoot) {
        // we flatten the Tree of objects into a flat list of top-level items
        // to serialize.  Nesting (eg grid within Layout) is accomplished by
        // having the Layout refer to the grid's ID.
        var data = this.getEditNodeTree();
        var nodes = includeRoot ? [data.root] : data.getChildren(data.root).duplicate();
        return this.serializeEditNodesAsJSON(nodes, settings);
    },

    //> @method editContext.serializeEditNodes()
    // Serialize the provided +link{EditNode,EditNodes} to an XML
    // representation of +link{PaletteNode,PaletteNodes}. Note that the
    // EditNodes must have been added to this EditContext. The result can be
    // supplied to +link{addPaletteNodesFromXML(),addPaletteNodesFromXML()} to
    // recreate the EditNodes.
    //
    // @param nodes (Array of EditNode) EditNodes to be serialized 
    // @param [settings] (SerializationSettings) Additional serialization settings
    // @return (String) an XML representtion of the provided EditNodes
    // @visibility external
    //<
    // NOTE: the "nodes" passed to this function need to be part of the Tree that's available
    // as this.getEditNodeTree().  TODO: generalized this so that it takes a Tree, optional nodes, and
    // various mode flags like serverless.
    serializeEditNodes : function (nodes, settings) {
        if (!nodes) return null;

        return this._serializeEditNodes(nodes, settings);
    },

    //> @method editContext.serializeEditNodesAsJSON()
    // Serialize the provided +link{EditNode,EditNodes} to a JSON
    // representation of +link{PaletteNode,PaletteNodes}. Note that the
    // EditNodes must have been added to this EditContext. The result can be
    // supplied to +link{addPaletteNodesFromJSON(),addPaletteNodesFromJSON()} to
    // recreate the EditNodes.
    //
    // @param nodes (Array of EditNode) EditNodes to be serialized 
    // @param [settings] (SerializationSettings) Additional serialization settings
    // @return (String) a JSON representtion of the provided EditNodes
    // @visibility external
    //<
    serializeEditNodesAsJSON : function (nodes, settings) {
        if (!nodes) return null;

        return this._serializeEditNodes(nodes, settings, "json");
    },

    _serializeEditNodes : function (nodes, settings, format) {        
        if (!isc.isAn.Array(nodes)) nodes = [nodes];

        // if serverless is set we will actually output DataSources in their entirety.
        // Otherwise, we'll just output a special tag that causes the DataSource to be loaded
        // as the server processes the XML format.
        this.serverless = (settings ? settings.serverless : null);

        // outputComponentsIndividually is documented to default to true.
        // That default is applied here.
        this.outputComponentsIndividually = 
            settings && settings.outputComponentsIndividually != null ?
                        settings.outputComponentsIndividually : true;

        this.suppressAutoDraw =
            settings && settings.suppressAutoDraw != null ?
                        settings.suppressAutoDraw : true;

        // Allow custom context to provide additional components to be added to the
        // serialized screen. Used by VB to force loading of all project DataSources.
        var additionalDefaultsBlocks;
        if ((!settings || !settings.suppressGetExtraComponents) &&
            nodes && nodes.length > 0 &&
            this.getExtraComponentsToSerialize)
        {
            additionalDefaultsBlocks = this.getExtraComponentsToSerialize();
        }

        var blocks = this.defaultsBlocks = [];
        if (additionalDefaultsBlocks) blocks.addList(additionalDefaultsBlocks);

        this.map("getSerializeableTree", nodes, null, true);

        // ValuesManager nodes have a reference to a DataSource but there is no
        // DataSource node in the tree for it. Assuming the DS is used elsewhere in the
        // screen or it's in the project list of DataSources, there will already be
        // a DS create or load included in the serialization. However, if the only reference
        // is within the VM node we need to make sure the correct DS is loaded.
        var valuesManagerNodes = nodes.findAll("type", "ValuesManager");
        if (valuesManagerNodes && valuesManagerNodes.length > 0) {
            for (var i = 0; i < valuesManagerNodes.length; i++) {
                // check for this same DataSource already being saved out
                var vmNode = valuesManagerNodes[i],
                    vmDefaults = vmNode.defaults,
                    vmDS = vmDefaults && vmDefaults.dataSource,
                    existingDS = blocks.find("ID", vmDS) ||
                                 blocks.find("loadID", vmDS)
                ;
                if (!existingDS || existingDS.$schemaId != "DataSource") {
                    // when serializing a DataSource, just output the loadID tag so that the
                    // server outputs the full definition during XML processing on JSP load
                    var dsDefaults = {
                        _constructor: "DataSource",
                        $schemaId: "DataSource",
                        loadID: vmDS,
                        loadParents: true       // Always load parent DataSources
                    };
                    blocks.add(dsDefaults);
                }
            }
        }

        this.suppressAutoDraw = null;
        this.outputComponentsIndividually = null;
        this.serverless = null;

        // separate the defaultBlocks into component/non-component lists, if needed
        if (settings && settings.separateComponents) {
            blocks = this._getSeparatedDefaultsBlocks();
        }

        // consolidate all DataSource loadID blocks into a single block
        blocks = this._consolidateDataSourceLoadBlocks(blocks);

        // When suppressing DataSources from serialization, just remove those blocks now
        if (settings && settings.suppressDataSources) {
            var blocksToRemove = [];
            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                if (block._constructor == "DataSource" && block.loadID) {
                    blocksToRemove.add(block);
                }
            }
            if (blocksToRemove.length > 0) {
                blocks.removeAll(blocksToRemove);
            }
        }

        return this.__serializeEditNodes(blocks, settings, format);
    },

    
    __serializeEditNodes : function (blocks, settings, format) {
        if (!isc.isAn.Array(blocks) && isc.isAn.Object(blocks)) {
            var serialization = {};
            for (var key in blocks) {
                if (!blocks.hasOwnProperty(key)) continue;
                serialization[key] = this.__serializeEditNodes(blocks[key], settings, format);
            }
            return serialization;
        }
        var indent = settings ? settings.indent : (format == "json" ? false : true),
            jsonEncodeSettings = { prettyPrint: indent }
        ;
        return format == "json"
                ? isc.EditContext.serializeDefaultsAsJSON(blocks, jsonEncodeSettings)
                : isc.EditContext.serializeDefaults(blocks, indent, settings);
    },

    // returns partition of defaultsBlocks into component/non-component parts
    _getSeparatedDefaultsBlocks : function () {
        var _this = this,
            nNonComponents = 0,
            blocks = this.defaultsBlocks
        ;
        blocks.setSort([{direction: "ascending", normalizer: function (block) {
            var iscClass = isc.ClassFactory.getClass(block._constructor);
            if (!iscClass) return false;
            
            return iscClass.isA("Canvas");
        }}]);
        for (var i = 0; i < blocks.length; i++) {
            var iscClass = isc.ClassFactory.getClass(blocks[i]._constructor);
            if (!iscClass || !iscClass.isA("Canvas")) nNonComponents++;
        };

        return {dataSources: blocks.slice(0, nNonComponents), 
                 components: blocks.slice(nNonComponents)};
    },

    // returns blocks such that all DataSource loadID blocks are consolidated into
    // a single block
    _consolidateDataSourceLoadBlocks : function (blocks) {
        var firstDataSourceLoadBlock,
            newBlocks = []
        ;
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (block._constructor == "DataSource" && block.loadID) {
                if (!firstDataSourceLoadBlock) {
                    firstDataSourceLoadBlock = block;
                    newBlocks.add(block);
                } else {
                    firstDataSourceLoadBlock.loadID += "," + block.loadID;
                }
            } else {
                newBlocks.add(block);
            }
        }
        return newBlocks;
    },

    // arrange the initialization data into a structure suitable for XML serialization.  This
    // will:
    // - grab just the defaults portion of each editNode (what we serialize)
    // - flatten hierarchies: all Canvas-derived components will be at top-level,
    //   members/children arrays will contain references to these children
    // - ensure DataSources are only listed once since multiple components may refer to the
    //   same DataSource
    getSerializeableTree : function (node, dontAddGlobally, topLevel) {
        // Give the liveObject a chance to update the editNode
        var liveObject = node.liveObject;
        if (liveObject && liveObject.updateEditNode && liveObject.editContext && liveObject.editNode) {
            liveObject.updateEditNode(liveObject.editContext, liveObject.editNode);
        }

        var type = node.type,
            // copy defaults for possible modification
            defaults = isc.addProperties({}, node.defaults)
        ;
        // if this node is a DataSource (or subclass of DataSource)
        var classObj = isc.ClassFactory.getClass(type);

        // Don't let the hasStableID() method in defaults play part in the serialization.
        if (defaults.hasStableID) delete defaults.hasStableID;

        // Remove autoDraw property is suppressing serialization of autoDraw
        if (this.suppressAutoDraw && defaults.autoDraw != null && defaults.autoDraw !== true) {
            delete defaults.autoDraw;
        }

        // parentProperty is set in defaults to indicate in which field the
        // node belongs. It doesn't need to be serialized.
        if (defaults.parentProperty) delete defaults.parentProperty;

        this.logInfo("node: " + this.echoLeaf(node) + " with type: " + type, "editing");

        if (classObj && classObj.isA("DataSource")) {
            var isMockDataSource = (liveObject && liveObject.getClassName() == "MockDataSource");
            // check for this same DataSource already being saved out
            if (this.defaultsBlocks) {
                var existingDS = this.defaultsBlocks.find("ID", defaults.ID) ||
                                 this.defaultsBlocks.find("loadID", defaults.ID);
                if (existingDS && existingDS.$schemaId == "DataSource") return;
            }

            // VB can force a MockDataSource to be saved separately from the project
            // by setting referenceInProject on the DS editNode. Additionally, if the
            // MDS has fromServer="true" it should be referenced rather than embedded.
            if (!this.serverless &&
                (!isMockDataSource || node.referenceInProject != false || (liveObject ? liveObject.fromServer : null)))
            {
                // when serializing a DataSource, just output the loadID tag so that the
                // server outputs the full definition during XML processing on JSP load
                defaults = {
                    _constructor: "DataSource",
                    $schemaId: "DataSource",
                    loadID: defaults.ID,
                    loadParents: true       // Always load parent DataSources
                };
            } else {
                // if running serverless, we can't rely on the server to fetch the definition
                // as part of XML processing during JSP load, so we have to write out a full
                // definition.  This works only for DataSources that don't require the server
                // to fetch and update data.
                // NOTE: since all DataSources in reify are always saved to the server, an
                // alternative approach would be to load the DataSource and capture its
                // defaults, as we do when we edit an existing DataSource.  However we would
                // still depend on getSerializeableFields() being correct, as we also use it to
                // obtain clean data when we begin editing a dynamically created DataSource
                // obtained from XML Schema (eg SFDataSource)

                var liveDS = node.liveObject;
                defaults = liveDS.getSerializeableFields();
                defaults._constructor = liveDS.Class;
                defaults.$schemaId = "DataSource";

                // Parent DataSources must also be written
                if (liveDS.hasSuperDS()) {
                    var ds = liveDS.superDS();
                    while (ds) {
                        var dsDefaults = ds.getSerializeableFields();
                        dsDefaults._constructor = ds.Class;
                        dsDefaults.$schemaId = "DataSource";
                        // DataSources are always serialized individually
                        if (this.defaultsBlocks) this.defaultsBlocks.add(dsDefaults);

                        ds = ds.superDS();
                    }
                }
            }
        }

        // A DrawItem can have a fillGradient property. It can either be a reference to a
        // gradient defined in the DrawPane (String) or a Gradient object. During serialization
        // a reference must be serialized as ref="xxx".
        if (classObj && classObj.isA("DrawItem") && defaults.fillGradient != null && isc.isA.String(defaults.fillGradient)) {
            defaults.fillGradient = "ref:" + defaults.fillGradient;
        }

        // Actions
        // By default these will be defined as simple objects in JS, but for saving in XML 
        // we need to enclose them in <Action>...</Action> tags
        // (ensures that any specified mappings are rendered out as an array)
        // Catch these cases and store as a StringMethod object rather than the raw action
        // object - this will serialize correctly.
        isc.EditContext.convertActions(node, defaults, classObj);
        
        var treeChildren = this.getEditNodeTree().getChildren(node);
        if (!treeChildren) {
            if (this.defaultsBlocks) this.defaultsBlocks.add(defaults); // add as a top-level node
            return;
        }

        this.serializeChildData(defaults, treeChildren);

        // if we're not supposed to be global, return out defaults
        if (dontAddGlobally) return defaults;
        // otherwise add this node's data globally (we list top-most parents last)
        if (this.defaultsBlocks) this.defaultsBlocks.add(defaults);
    },

    //>!BackCompat 2013.09.25
    addChildData : function (parentData, childNodes) {
        return this.serializeChildData(parentData, childNodes);
    },
    //<!BackCompat

    serializeChildData : function (parentData, childNodes) {
        var ds = isc.DS.getNearestSchema(parentData._constructor),
            parentEditProxy
        ;
        for (var i = 0; i < childNodes.length; i++) {
            var child = childNodes[i],
                childType = child.defaults._constructor,
                // copy defaults for possible modification
                childData = isc.addProperties({}, child.defaults),
                parentFieldName = childData.parentProperty || ds.getObjectField(childType),
                parentField = ds.getField(parentFieldName);

            // parentProperty is set in defaults to indicate in which field the
            // node belongs. It doesn't need to be serialized.
            if (childData.parentProperty) delete childData.parentProperty;

            if (!parentFieldName && parentData._constructor == "DynamicForm" && isc.isA.Canvas(child.liveObject)) {
                parentFieldName = "children";
                parentField = ds.getField(parentFieldName);
            }

            // Some components may not need to be serialized. Allow parentNode editProxy
            // to determine if a childNode should be serialized. This is used by Window
            // to suppress header/footer controls if they represent the default controls
            // that would be shown as of Jan 2020.
            if (!parentEditProxy) {
                var parentNode = this.getEditNodeTree().getParent(child);
                if (parentNode && parentNode.liveObject) {
                    parentEditProxy = parentNode.liveObject.editProxy;
                }
            }
            if (parentEditProxy && parentEditProxy.canSaveChildNode &&
                !parentEditProxy.canSaveChildNode(child, parentFieldName))
            {
                this.logInfo("serializing: child of type: " + childType + 
                             " for parent field: " + parentFieldName +
                             " *IGNORED*",
                             "editing");
                continue;
            }
            this.logInfo("serializing: child of type: " + childType + 
                         " goes in parent field: " + parentFieldName,
                         "editing");

            // All Canvii and DrawItems can be output individually and their parents reference
            // them by ID. Alternately these child components can be output inline. Components
            // marked with _generated:true, which includes TabSet tabs and SectionStack sections,
            // are never output individually.
            //
            // DataSources are always output individually and referenced by ID.
            var isIndividualComponent = (
                    (isc.isA.Canvas(child.liveObject) || (isc.DrawPane && isc.isA.DrawItem(child.liveObject))) && 
                    !child.liveObject._generated);

            if ((this.outputComponentsIndividually && isIndividualComponent) || isc.isA.DataSource(child.liveObject)) {
                if (isc.isA.DataSource(child.liveObject) &&
                        ((parentFieldName == "dataSource") || (parentFieldName == "optionDataSource")))
                {
                    // Don't add the "ref:" if the parentFieldName is "dataSource" or
                    // "optionDataSource", since the dataSource field always takes a String ID.
                    // (The "ref:" used to be stripped off later, so just don't add it).
                    childData = childData.ID;
                } else {
                    childData = "ref:" + childData[isc.DS.getUsedAutoIdField(childData)];
                }
                this.getSerializeableTree(child);
            } else {
                // otherwise, serialize this child without adding it globally
                childData = this.getSerializeableTree(child, true);
            }

            var existingValue = parentData[parentFieldName];
            if (parentField && parentField.multiple) {
                // force multiple fields to Arrays
                if (!existingValue) existingValue = parentData[parentFieldName] = [];
                existingValue.add(childData);
            } else {
                parentData[parentFieldName] = childData;
            }
        }
    },
   
    //>!BackCompat 2013.09.25
    serializeEditComponents : function () {
        return this.serializeLiveObjects();
    },
    //<!BackCompat

    // get serializable data as an Array of Objects for the editNodes in this context, via
    // getting properties from the liveObjects and stripping it down to editFields (fields that
    // are allowed to be edited in the context), or the DataSource fields if no editFields were
    // declared.
    
    serializeLiveObjects : function () {
        // get all the widgets being edited
        var widgets = this.getEditNodeArray(),
            output = [];

        if (!widgets) return [];

        for (var i = 0; i < widgets.length; i++) {
            var child = widgets[i].liveObject,
                // get all properties that don't have default value
                props = child.getUniqueProperties(),
                editFields = this.getEditFieldsList(child);

            // add in the Class, which will be needed to recreate the widget, but which could never
            // have non-default value
            props._constructor = child.Class;

            // limit the data to just the fields listed in the DataSource
            props = isc.applyMask(props, editFields);
            
            output.add(props);
        } 
        return output;
    },

    //>!BackCompat 2013.09.25
    loadNodeTreeFromXML : function (xmlString) {
        this.addPaletteNodesFromXML(xmlString);
    },
    //<!BackCompat 2013.09.25

    //> @method editContext.addPaletteNodesFromXML()
    // Recreate +link{EditNode,EditNodes} from an XML representation of 
    // +link{PaletteNode,PaletteNodes} (possibly created by calling
    // +link{serializeAllEditNodes()} or +link{serializeEditNodes()}.
    // <P>
    // By default, components that have +link{Canvas.ID,global IDs} will not
    // actually be allowed to take those global IDs - instead, only widgets that have one of the
    // global IDs passed as the <code>globals</code> parameter will actually receive their global
    // IDs.  To override this behavior, pass the special value +link{RPCManager.ALL_GLOBALS}
    // for the <code>globals</code> parameter.
    //
    // @param xmlString (String) XML string
    // @param [parentNode] (EditNode) parent node (defaults to the root)
    // @param [globals] (Array of String) widgets to allow to take their global IDs
    // @param [callback] (Function) Callback to fire after nodes have been added
    // @see serializeAllEditNodes()
    // @see serializeEditNodes()
    // @visibility external
    //<
    addPaletteNodesFromXML : function (xmlString, parentNode, globals, callback) {
        var self = this;

        //isc.logWarn(isc.echo(xmlString));
        
        isc.DMI.callBuiltin({
            methodName: "xmlToJS",
            arguments: [xmlString],
            callback: function (rpcResponse) {
                self.addPaletteNodesFromJS(rpcResponse.data, parentNode, globals, callback);
            }
        });
    },

    //> @method editContext.addPaletteNodesFromJSON()
    // Recreate +link{EditNode,EditNodes} from a JSON representation of 
    // +link{PaletteNode,PaletteNodes} (possibly created by calling
    // +link{serializeAllEditNodesAsJSON()} or +link{serializeEditNodesAsJSON()}.
    // <P>
    // By default, components that have +link{Canvas.ID,global IDs} will not
    // actually be allowed to take those global IDs - instead, only widgets that have one of the
    // global IDs passed as the <code>globals</code> parameter will actually receive their global
    // IDs.  To override this behavior, pass the special value +link{RPCManager.ALL_GLOBALS}
    // for the <code>globals</code> parameter.
    //
    // @param jsonString (String) JSON string representing an array of PaletteNodes
    // @param [parentNode] (EditNode) parent to add to (defaults to the root)
    // @param [globals] (Array of String) widgets to allow to take their global IDs
    // @param [callback] (Function) Callback to fire after nodes have been added
    // @see addFromPaletteNodes()
    // @see serializeAllEditNodesAsJSON()
    // @see serializeEditNodesAsJSON()
    // @visibility external
    //<
    addPaletteNodesFromJSON : function (jsonString, parentNode, globals, callback) {
        if (jsonString == null) return;
        if (!isc.isA.String(jsonString)) {
            if (isc.isAn.Object(jsonString) || isc.isAn.Array(jsonString)) {
                this.logWarn("Passed a non-string JSON value - if passing JavaScript objects use addPaletteNodesFromJS() instead");
            } else {
                this.logWarn("Passed a non-string JSON value - ignored");
            }
            return;
        }

        

        if (globals == null) globals = [];
        else if (!isc.isAn.Array(globals)) globals = [globals];

        isc.captureDefaults = true;

        var jsClassDefs;
        try {
            jsClassDefs = isc.JSON.decode(jsonString);
        } catch (e) {
            this.logWarn("JSON string could not be decoded");
        }
        if (!jsClassDefs) return;

        if (!isc.isAn.Array(jsClassDefs) && isc.isAn.Object(jsClassDefs)) {
            jsClassDefs = [jsClassDefs];
        }

        if (jsClassDefs && jsClassDefs.length > 0 &&
            !jsClassDefs[0].type && !jsClassDefs[0].defaults)
        {
            

            
            var keepAllGlobals = (globals.length == 1 && globals[0] == isc.RPC.ALL_GLOBALS);
            for (var i = 0; i < jsClassDefs.length; i++) {
                var def = jsClassDefs[i],
                    className = def._constructor
                ;
                this._replaceRefsLegacy(def, globals);
                if (className) {
                    delete def._constructor;
                    if (def.ID && !keepAllGlobals && !globals.contains(def.ID)) def.ID = "_" + def.ID;
                    var instance = isc.ClassFactory.newInstance(className, def);
                }
            }

            isc.captureDefaults = null;
            var capturedComponents = this.getCapturedComponents();

            // Remove IDs that represent globals that should not be kept
            if (capturedComponents) this._removeIDs(capturedComponents, globals);

            if (capturedComponents) this.addFromPaletteNodes(capturedComponents, parentNode);
            this.fireCallback(callback, ["paletteNodes"], [capturedComponents]);

            return;
        }

        isc.captureDefaults = null;

        // Expand any LoadID DataSource nodes into individual DataSource nodes
        for (var i = jsClassDefs.length-1; i >= 0; i--) {
            var def = jsClassDefs[i],
                type = def.type || def.className,
                componentClass = isc.ClassFactory.getClass(type)
            ;
            if (isc.isA.DataSource(componentClass)) {
                var defaults = def.defaults;
                if (defaults.loadID) {
                    var dataSources = defaults.loadID.split(","),
                        newNodes = []
                    ;
                    for (var j = 0; j < dataSources.length; j++) {
                        newNodes.add(this.makeDSPaletteNode(dataSources[j]));
                    }
                    if (newNodes.length > 0) {
                        // Replace LoadID node with expanded list
                        jsClassDefs.removeAt(i);
                        jsClassDefs.addListAt(newNodes, i);
                    }
                }
            }
        }

        // Extract "global" definitions from nodes for resolving references
        var globals = {};
        for (var i = 0; i < jsClassDefs.length; i++) {
            this._extractGlobals(jsClassDefs[i], globals);
        }
        // Replace values of type "ref:<ID>" with actual instance
        for (var i = 0; i < jsClassDefs.length; i++) {
            this._replaceRefs(jsClassDefs[i], globals);
        }

        // Remove global IDs that shouldn't be retained
        if (globals == null) globals = [];
        else if (!isc.isAn.Array(globals)) globals = [globals];
        this._removeIDs(jsClassDefs, globals);

        this.addFromPaletteNodes(jsClassDefs, parentNode);
        this.fireCallback(callback, ["paletteNodes"], [jsClassDefs]);
    },

    // Extract global object nodes so they can be used to satisfy references in the next pass
    _extractGlobals : function (def, globals) {
        for (var key in def) {
            var value = def[key];
            if (isc.isAn.Array(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (isc.isAn.Object(value[i])) {
                        this._extractGlobals(value[i], globals);
                    }
                }
            } else if (isc.isAn.Object(value)) {
                this._extractGlobals(value, globals);
            }
        }

        var type = def.type || def.className,
            schema = type && isc.DS.getNearestSchema(type),
            nodeID = schema && isc.DS.getAutoId(def.defaults || {})
        ;
        if (nodeID) {
            globals[nodeID] = def;
        }
    },

    // Replace values of type "ref:<ID>" with actual instance
    _replaceRefs : function (def, globals) {
        for (var key in def) {
            var value = def[key];
            if (isc.isAn.Array(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (isc.isA.String(value[i]) && value[i].startsWith("ref:")) {
                        var ref = value[i].replace("ref:", "");
                        value[i] = globals[ref];
                    } else if (isc.isAn.Object(value[i])) {
                        this._replaceRefs(value[i], globals);
                    }
                }
            } else if (isc.isAn.Object(value)) {
                this._replaceRefs(value, globals);
            }
        }
    },

    
    _replaceRefsLegacy : function (def, keepGlobals) {
        var keepAllGlobals = (keepGlobals.length == 1 && keepGlobals[0] == isc.RPC.ALL_GLOBALS);

        for (var key in def) {
            var value = def[key];
            if (isc.isAn.Array(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (isc.isA.String(value[i]) && value[i].startsWith("ref:")) {
                        var ref = value[i].replace("ref:", "");
                        if (!keepAllGlobals && !keepGlobals.contains(ref)) ref = "_" + ref;
                        value[i] = window[ref];
                    } else if (isc.isAn.Object(value[i])) {
                        this._replaceRefsLegacy(value[i], keepGlobals);
                    }
                }
            } else if (isc.isAn.Object(value)) {
                this._replaceRefsLegacy(value, keepGlobals);
            }
        }
    },
    
    // Remove ID attributes whose value is not listed in keepGlobals
    _removeIDs : function (def, keepGlobals) {
        var keepAllGlobals = (keepGlobals.length == 1 && keepGlobals[0] == isc.RPC.ALL_GLOBALS);

        if (def.ID && !keepAllGlobals && !keepGlobals.contains(def.ID)) delete def.ID;

        for (var key in def) {
            if (key == "defaults") continue;
            var value = def[key];
            if (isc.isAn.Array(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (isc.isAn.Object(value[i])) {
                        this._removeIDs(value[i], keepGlobals);
                    }
                }
            } else if (isc.isAn.Object(value)) {
                this._removeIDs(value, keepGlobals);
            }
        }
    },

    //> @method Callbacks.PaletteNodeCallback
    // Callback fired with the +link{PaletteNode,PaletteNodes} obtained asynchronously.
    // @param paletteNodes (Array of PaletteNode) an array of PaletteNodes
    // @visibility external
    //<

    //> @method editContext.getPaletteNodesFromXML()
    // Obtain +link{PaletteNode,PaletteNodes} from an XML representation,
    // but do not add them to the EditContext.
    //
    // @param xmlString (String) XML string
    // @param callback (PaletteNodeCallback) Callback used to return the PaletteNodes
    // @see Callbacks.PaletteNodeCallback()
    // @see serializeAllEditNodes()
    // @see serializeEditNodes()
    // @visibility external
    //<
    getPaletteNodesFromXML : function (xmlString, callback) {
        var self = this;

        //isc.logWarn(isc.echo(xmlString));
        
        isc.DMI.callBuiltin({
            methodName: "xmlToJS",
            arguments: [xmlString, true],
            callback: function (rpcResponse) {
                self.getPaletteNodesFromJS(rpcResponse.data, callback);
            }
        });
    },

    //>!BackCompat 2013.09.25
    loadNodeTreeFromJS : function (jsString) {
        return this.addPaletteNodesFromJS(jsString);
    },
    //<!BackCompat

    //> @method editContext.addPaletteNodesFromJS()
    // Add +link{PaletteNode,PaletteNodes} from a JavaScript source representation.
    // <P>
    // By default, components that have +link{Canvas.ID,global IDs} will not
    // actually be allowed to take those global IDs - instead, only widgets that have one of the
    // global IDs passed as the <code>globals</code> parameter will actually receive their global
    // IDs.  To override this behavior, pass the special value +link{RPCManager.ALL_GLOBALS}
    // for the <code>globals</code> parameter.
    //
    // @param jsCode (String) JavaScript code to eval.
    // @param [parentNode] (EditNode) parent node (defaults to the root)
    // @param [globals] (Array of String) widgets to allow to take their global IDs
    // @visibility external
    //<
    addPaletteNodesFromJS : function (jsCode, parentNode, globals, callback) {
        if (globals == null) globals = [];
        else if (!isc.isAn.Array(globals)) globals = [globals];

        var self = this;
        this.getPaletteNodesFromJS(jsCode, function (paletteNodes) {
            if (paletteNodes) self.addFromPaletteNodes(paletteNodes, parentNode);
            self.fireCallback(callback, ["paletteNodes"], [paletteNodes]);
        }, globals);
    },
    
    //> @method editContext.getPaletteNodesFromJS()
    // Obtain +link{PaletteNode,PaletteNodes} from a JavaScript source representation.
    // <P>
    // By default, components that have +link{Canvas.ID,global IDs} will not
    // actually be allowed to take those global IDs - instead, only widgets that have one of the
    // global IDs passed as the <code>globals</code> parameter will actually receive their global
    // IDs.  To override this behavior, pass the special value +link{RPCManager.ALL_GLOBALS}
    // for the <code>globals</code> parameter.
    //
    // @param jsCode (String) JavaScript code to eval.
    // @param callback (PaletteNodeCallback) Callback used to return the PaletteNodes
    // @param [globals] (Array of String) widgets to allow to take their global IDs
    // @see Callbacks.PaletteNodeCallback()
    // @visibility external
    //<
    getPaletteNodesFromJS : function (jsCode, callback, keepGlobals) {
        if (keepGlobals == null) keepGlobals = [];
        else if (!isc.isAn.Array(keepGlobals)) keepGlobals = [keepGlobals];

        var self = this;
        isc.captureDefaults = true;
        // Failsafe - make sure there are no residual components captured previously
        isc.capturedComponents = null;

        if (keepGlobals.length == 1 && keepGlobals[0] == isc.RPC.ALL_GLOBALS) {
            // suppress reportErrors
            isc.Class.globalEvalWithCapture(jsCode, function (globals, error) {
                // Note: this must happen first, before any other components are
                // created - otherwise we will trap them..
                isc.captureDefaults = null;
                var capturedComponents = self.getCapturedComponents(error);
                // Remove IDs that represent globals that should not be kept
                if (capturedComponents) self._removeIDs(capturedComponents, keepGlobals);

                self.fireCallback(callback, ["paletteNodes"], [capturedComponents]);
            }, null, false);
        } else {
            // suppress reportErrors
            isc.Class.globalEvalAndRestore(jsCode, keepGlobals, function (globals, error) {
                // Note: this must happen first, before any other components are
                // created - otherwise we will trap them..
                isc.captureDefaults = null;
                var capturedComponents = self.getCapturedComponents(error);
                // Remove IDs that represent globals that should not be kept
                if (capturedComponents) self._removeIDs(capturedComponents, keepGlobals);
                // Translate explicit constructor type names to equivalent schema names where possible
                if (capturedComponents) self._translateTypeToSchemaType(capturedComponents);

                self.fireCallback(callback, ["paletteNodes"], [capturedComponents]);
            }, null, false);
        }

        isc.captureDefaults = null;
    },

    getCapturedComponents : function (error) {
        if (error) {
            isc.warn(
                "The following error occurred during loading of your view<br><br>: " + error + 
                ".<br><br>  The portion of the view that loaded succesfully will be shown."
            );
        }                

        var captured = isc.capturedComponents;
        isc.capturedComponents = null;

        var capturedIDs = (captured ? captured.getProperty("defaults").getProperty("ID") : null);
        this.logInfo("capturedComponents are: " + capturedIDs, "loadProject");

        return captured;
    },

    _translateTypeToSchemaType : function (components) {
        for (var i = 0; i < components.length; i++) {
            var type = components[i].type,
                schema = isc.DS.getNearestSchema(type);
            
            // If we found a schema and its configured Constructor is the same as the explicit
            // type of the component, switch to using the schema name instead.  This is 
            // particularly appropriate with custom SmartGWT components, where the underlying 
            // Constructor will typically be something unpleasantly lengthy like 
            // "com.mycompany.client.widgets.SomeWidget"
            if (schema && schema.Constructor == type) components[i].type = schema.name;
        }
    },

    //>!BackCompat 2013.09.27
    addNodeTree : function (paletteNodes) {
        this.addFromPaletteNodes(paletteNodes);
    },
    //<!BackCompat

    //> @method EditContext.addFromPaletteNodes
    // Add the supplied +link{PaletteNode,PaletteNodes} to the parentNode, preserving internal
    // references from one supplied PaletteNode to another. This method should
    // be used with an array of possibly inter-related PaletteNodes (for
    // instance, those produced as a result of serialization via
    // +link{serializeAllEditNodes(),serializeAllEditNodes()}, rather than
    // calling +link{addFromPaletteNode(),addFromPaletteNode()} on each
    // individual PaletteNode.
    //
    // @param paletteNodes (Array of PaletteNode) array of PaletteNodes
    // @param [parentNode] (EditNode) parent to add to (defaults to the root)
    // @return (Array of EditNode) an array of the EditNodes added to the parentNode
    // @see addFromPaletteNode()
    // @visibility external
    //<
    addFromPaletteNodes : function (paletteNodes, parentNode, index, parentProperty, skipNodeAddedNotification, isLoadingTree) {
        //this.logWarn("paletteNodes: " + this.echoFull(paletteNodes), "loadProject");

        var data = this.getEditNodeTree();
        if (!parentNode) parentNode = data.getRoot();

        // If the editTree is empty then the initial components are being added so set a
        // flag that can be used to determine different code paths in the process. In particular
        // this flag allows existing nodes that have autoDraw:null to be left as-is during
        // the load. Otherwise autoDraw:false is assigned to new canvas items.
        var topLevelNodes = data.getChildren(data.getRoot());
        if (!topLevelNodes || topLevelNodes.length == 0) {
            this._initialLoad = true;
        }

        // When we evalWithCapture(), create() makes palette nodes instead of actual
        // instances.  This is a necessity so that initialization data can be captured cleanly.
        // 
        // These palette nodes are arranged in a tree just like live components would be (eg
        // layout.members contains palette nodes for children).
        //
        // We need to traverse this tree and make a series of calls to
        // Palette.makeEditNode() and EditContext.addNode() to actual create live
        // components and editNodes from this captured data.

        this.componentsToCreate = [];
        this.addComponentCalls = [];
        this.requiredDataSources = [];

        // traverse all captured components (components that called create()), finding all
        // subcomponents that need to be represented as separate tree nodes (eg Tabs, which do
        // not directly call create, but should appear in the editTree).
        for (var i = 0; i < paletteNodes.length; i++) {
            this.findChildPaletteNodes(null, paletteNodes[i], null, paletteNodes);
        }

        // second traversal: paletteNodes is a flattened list of all components that would call
        // create(), and in the previous traversal we marked any component that was found in
        // the subtree of any other component as hasParent:true.  Any remaining paletteNodes
        // with no hasParent:true marker must be children of root
        for (var i = 0; i < paletteNodes.length; i++) {
            if (!paletteNodes[i].hasParent) {
                this.findChildPaletteNodes(parentNode, paletteNodes[i], null, paletteNodes);
            }
        }

        // preserve init order for the best chance of allowing application logic to function

        var pNode, parentPNode;
        // captured components (those that directly called create) are first, in order of
        // create() calls (which is leaf nodes first)
        for (var i = 0; i < paletteNodes.length; i++) {
            pNode = paletteNodes[i];

            // captured components are not already matched up with the palette node from
            // the palette and therefore do not have any helpful editProxyProperties that
            // may be applied when first dropping the node. Look up the matching palette
            // node and apply those editProxyProperties to this node.
            var componentType = pNode.type || pNode.className,
                origType = componentType
            ;
            if (componentType == "Placeholder") {
                componentType = pNode.defaults &&
                                pNode.defaults.placeholderDefaults &&
                                pNode.defaults.placeholderDefaults.placeholderFor;
            }
            if (componentType) {
                var paletteNode = this.findPaletteNode("type", componentType) ||
                                  this.findPaletteNode("className", componentType);
                if (paletteNode) {
                    if (pNode.editProxyProperties || paletteNode.editProxyProperties) {
                        pNode.editProxyProperties = isc.addProperties({},
                                                        paletteNode.editProxyProperties,
                                                        pNode.editProxyProperties);
                    }
                    isc.EditContext.copyPaletteNodeAttributes(pNode, paletteNode);
                    isc.EditContext.copyPaletteNodeBehaviors(pNode, paletteNode);
                    if (origType == "Placeholder") {
                        pNode.type = origType;
                    }
                }
            }
            pNode.component = this.makeEditNode(pNode);
        }

        // create all other components in tree traversal order
        for (var i = 0; i < this.componentsToCreate.length; i++) {
            pNode = this.componentsToCreate[i];
            if (!pNode.component) {
                // captured components are not already matched up with the palette node from
                // the palette and therefore do not have any helpful editProxyProperties that
                // may be applied when first dropping the node. Look up the matching palette
                // node and apply those editProxyProperties to this node.
                var componentType = pNode.type || pNode.className,
                    origType = componentType
                ;
                if (componentType == "Placeholder") {
                    componentType = pNode.defaults &&
                    pNode.defaults.placeholderDefaults &&
                    pNode.defaults.placeholderDefaults.placeholderFor;
                }
                if (componentType) {
                    var paletteNode = this.findPaletteNode("type", componentType) ||
                                      this.findPaletteNode("className", componentType);
                    if (paletteNode) {
                        if (pNode.editProxyProperties || paletteNode.editProxyProperties) {
                            pNode.editProxyProperties = isc.addProperties({},
                                                            paletteNode.editProxyProperties,
                                                            pNode.editProxyProperties);
                        }
                        isc.EditContext.copyPaletteNodeAttributes(pNode, paletteNode);
                        isc.EditContext.copyPaletteNodeBehaviors(pNode, paletteNode);
                        if (origType == "Placeholder") {
                            pNode.type = origType;
                        }
                    }
                }
                pNode.component = this.makeEditNode(pNode);
            }
        }

        // lastly, link components into the project tree.  Because of the way we do our
        // traversal, these are not in an order that is ready for tree adds, that is, children
        // can appear before their parents because objects that directly call create() can
        // appear before the pseudo-objects (eg Sections) that they belong to (eg ListGrid can
        // appear before the Tab it should be added to).  However in order to eg, not reverse
        // Section Stack or FormItem order, we need to generally follow the order of traversal
        // that put together the addComponentCalls.
        // Approach: keep traversing the list trying to add children to parents until all nodes
        // have been added
        var oldLength = -1,
            calls = this.addComponentCalls,
            newCallOrder = []; // just for debugging
            
        // Set a flag to indicate to the special editProxy.setDataSource() override that we are 
        // loading a node tree from disk, and should fall back to the ordinary setDataSource()
        // method - otherwise, we'll end up with duplicates in the projectComponents tree
        // Also, disables markDirty while true.
        if (isLoadingTree != false) {
            isc._loadingNodeTree = true;
            // Clear errors for loading. VB pulls list with getLoadingErrors()
            delete this.loadingErrors;
        }

        var nodesAddedToParentNode = [];
            
        while (calls.length > 0 && oldLength != calls.length) {
            oldLength = calls.length;
            var callsToTry = calls.duplicate();
            for (var i = 0; i < callsToTry.length; i++) {
                var call = callsToTry[i],
                    parentPNode = call[1],
                    pNode = call[0],
                    parentLiveObject = parentPNode.liveObject
                ;
                parentProperty = call[2] || parentProperty;

                
                if (parentPNode.name == "/") {
                    var nodeAdded = this.addNode(pNode.component, parentNode, null, null, null, null, skipNodeAddedNotification);
                    nodesAddedToParentNode.add(nodeAdded);
                    calls.remove(call);
                    newCallOrder.add(call);
                } else if (data.getAllNodes().contains(parentPNode.component)) {
                    var childComponent = pNode.component;
                    if (data.getAllNodes().contains(childComponent)) {
                        // we've already added this child to the tree elsewhere.  This occurs
                        // for singletons like a DataSource which are shared between multiple
                        // components.  It's valid and intended in this case that the
                        // liveObject be shared, but we need a distinct Tree node, so make a
                        // copy
                        childComponent = isc.addProperties({}, childComponent);
                    }
                    var nodeAdded = this.addNode(childComponent, parentPNode.component, index, parentProperty, null, null, skipNodeAddedNotification);
                    if (parentPNode.component == parentNode) {
                        nodesAddedToParentNode.add(nodeAdded);
                    }
                    calls.remove(call);
                    newCallOrder.add(call);
                } else if (parentLiveObject && data.getAllNodes().contains(parentLiveObject.editNode)) {
                    var childComponent = pNode.component;
                    if (data.getAllNodes().contains(childComponent)) {
                        // we've already added this child to the tree elsewhere.  This occurs
                        // for singletons like a DataSource which are shared between multiple
                        // components.  It's valid and intended in this case that the
                        // liveObject be shared, but we need a distinct Tree node, so make a
                        // copy
                        childComponent = isc.addProperties({}, childComponent);
                    }
                    var nodeAdded = this.addNode(childComponent, parentLiveObject.editNode, index, parentProperty, null, null, skipNodeAddedNotification);
                    if (parentLiveObject.editNode == parentNode) {
                        nodesAddedToParentNode.add(nodeAdded);
                    }
                    calls.remove(call);
                    newCallOrder.add(call);
                }
                // index and parentProperty (argument) only apply to first component added
                index = null;
                parentProperty = null;
            }
        }
        
        if (isLoadingTree != false) delete isc._loadingNodeTree;

        if (this._initialLoad) delete this._initialLoad;

        // report the order of addComponent calls
        if (this.logIsDebugEnabled("loadProject")) {
            this.logDebug("addComponent() calls during project loading:", "loadProject");
            for (var i = 0; i < newCallOrder.length; i++) {
                var call = newCallOrder[i],
                    parentPNode = call[1],
                    pNode = call[0];
                this.logDebug(
                    "addComponent(" + this.echoLeaf(pNode) + "," + this.echoLeaf(parentPNode), 
                    "loadProject"
                );
            }
        }
        
        if (calls.length > 0) {
            this.logWarn(
                "the following components could not be added to the project tree: " + 
                isc.echoAll(calls.getProperty("0"))
            );
        }

        return nodesAddedToParentNode;
    },

    // Allow VB to pull list of loading errors reported in a call to addFromPaletteNodes()
    getLoadingErrors : function () {
        return this.loadingErrors;
    },

    // Allow VB to trigger "after-screen-load" node events (editProxy.loadComplete).
    // A screen is normally loaded by addFromPaletteNodes() but that method also
    // has other uses. To trigger "after-screen-load" node events the high-level user
    // (i.e. VB) must signal that the screen has loaded.
    screenLoadComplete : function () {
        var tree = this.getEditNodeTree(),
            nodes = tree.getAllNodes()
        ;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i],
                liveObject = node.liveObject,
                editProxy = liveObject.editProxy
            ;
            if (editProxy && editProxy.loadComplete) {
                editProxy.loadComplete();
            }
        }
    },

    // create a paletteNode that will load the named DataSource dynamically
    makeDSPaletteNode : function (dsName, dsType) {
        var node = {
            ID: dsName,

            // for controlling drag and drop
            // XXX would be good to get actual type in case a component
            // declares that it can only bind to a specific DataSource, however,
            // "getDefinedDataSources" RPC does not currently return this.
            type: "DataSource",

            // for display in DataSources palette
            dsType: dsType || "DataSource",
            
            // for display in project tree
            title: dsName,
            icon: "DataSource.png",
            iconSize: 16,

            defaults: { ID: dsName },

            // set up deferred loading
            loadData : function (node, callback) {
                var paletteNode = this;
                isc.ClassFactory._setVBLoadingDataSources(true);
                isc.DS.get(node.ID, function (dsID) {
                    isc.ClassFactory._setVBLoadingDataSources(null);
                    var ds = isc.DS.get(dsID);
                    if (!ds) {
                        // No DS found, don't fire loadData callback - node is just ignored
                        return;
                    }
                    node.liveObject = ds;
                    // minimal information for serializing the DataSource.  See
                    // getSerializeableTree()
                    node.defaults = {
                        _constructor: "DataSource", 
                        ID: ds.ID
                    };
                    node.isLoaded = true;
                    if (callback) isc.Class.fireCallback(callback, "", [node]);
                }, {loadParents: true});
            }
        };
        
        return node;
    },

    // recursively traverse a structure captured via evalWithCapture, modifying data so that it
    // is ready for addComponent().  
    // - detect anywhere that a component is being initialized with data that should be
    //   represented as a separate component in the EditTree (eg a Layout member or TabSet tab)
    // - remove the subcomponent from the initialization data and create a separate
    //   paletteNode for it.  The cases are:
    //   - palette nodes captured by evalWithCapture, from components that called create()
    //   - tabs, sectionItems and other pseudo-objects that we represent in the editTree,
    //     detected because they are in a field whose type appears in the palette
    //   - for code that *was not* generated by Reify, we may find eg a Layout member
    //     represented as an object with a _constructor property, as happens when you declare
    //     nested components in XML instead of breaking all components into independant
    //     top-level declarations.  Note these subcomponents will not be paletteNodes because
    //     create() was never called for them.  Instead, their format is similar to a TabSet
    //     tab or other pseudo-object
    // - generate and store the list of addComponent() calls needed to construct the tree.  We
    //   do these later in order to detect top-level components, and to maximally preserve
    //   initialization order.
    findChildPaletteNodes : function (parent, componentData, parentProperty, paletteNodes) {
        var componentType = componentData.type || componentData.className;

        var logEnabled = this.logIsInfoEnabled("loadProject"),
            logDebugEnabled = this.logIsDebugEnabled("loadProject");
    
        if (logEnabled) {
            this.logInfo(
                "inspecting defaults of component: " + this.echoLeaf(componentData) + " of type: " + componentType, 
                "loadProject"
            );
        }

        var defaults = componentData.defaults,
        	loader = this;

        // search for child components that should also be added to the project tree
        var childComponents = [],
            singleArray = [],
            componentDS = isc.DS.get(componentType),
            componentClass = isc.ClassFactory.getClass(componentType)
        ;

        // No need to scan a DataSource for child components
        
        if (isc.isA.DataSource(componentClass)) defaults = {};

        for (var propName in defaults) {
            var propValues = defaults[propName];

            if (!isc.isAn.Array(propValues)) {
                singleArray[0] = propValues;
                propValues = singleArray;
            } else if (logDebugEnabled) {
                this.logDebug(
                    "checking Array property: " + propName + ", value: " + this.echoLeaf(propValues) +
                    (fieldSchema ? " with schema: " + fieldSchema : ""), 
                    "loadProject"
                );
            }

            var field = componentDS ? componentDS.getField(propName) : null,
                fieldType = field ? field.type : null,
                fieldSchema = isc.DS.get(fieldType),
                foundChildren = false;

            for (var i = 0; i < propValues.length; i++) {
                var propValue = propValues[i];
                if (logDebugEnabled) {
                    this.logDebug(
                        "checking property: " + propName + ", value: " + this.echoLeaf(propValue), 
                        "loadProject"
                    );
                }

                if (propValue == null) {
                    this.logInfo("null property: " + propName + " on component: " + this.echoLeaf(componentData));
                    continue;
                }
                                    
                // found a component captured by evalWithCapture (called create())
                if (paletteNodes.contains(propValue)) {
                    if (logEnabled) {
                        this.logInfo(
                            "found capturedComponent: " + this.echoLeaf(propValue) + " under property: " + 
                            propName + " of component: " + this.echoLeaf(componentData),
                            "loadProject"
                        );
                    }
                    childComponents.add([propName, propValue]);
                    foundChildren = true;
                    continue;
                } 

                // detect pseudo-objects (eg tabs):
                // if the field is declared as complex type *and* items of this class can be
                // created from the palette (so clearly it is represented in the component tree).
                // Note that this means different editors may treat different objects as tree
                // nodes, for example, fields of a ListGrid.
                var childType = (propValue ? propValue._constructor : null) || fieldType,
                    childClass = isc.ClassFactory.getClass(childType);

                if (
                    fieldSchema && (
                        (childClass && childClass.isA(isc.Canvas)) ||
                        (childClass && childClass.isA(isc.DataSource)) ||
                        (childClass && childClass.isA(isc.FormItem)) ||
                        (this.findPaletteNode("type", childType)) ||
                        (this.findPaletteNode("className", childType))
                    )
                ) {
                    if (logEnabled) {
                        this.logInfo(
                            "found palettized component: " + this.echoLeaf(propValue) + 
                            " of type: " + childType + " under property: " + propName + 
                            " of component: " + this.echoLeaf(componentData),
                            "loadProject"
                        );
                    }

                    // A String in an Object slot should be the ID of a component that was
                    // already created.  NOTE: tab.pane can be a String that refers to a
                    // component that was created *after* the TabSet, however this code does
                    // handle that case since capturedComponents contains all components that
                    // called create()
                    if (isc.isA.String(propValue)) {
                        var refComponent = paletteNodes.find("ID", propValue);
                        if (refComponent == null) {
                            // detect fields of DataSource type with String values referring to
                            // DataSources that don't exist in the file.  This can happen with
                            // code not generated by Reify.  If these DataSources are
                            // known (they appear in the dataSourceList loaded from the
                            // server), create a paletteNode that will load them automagically.
                            if (isc.DataSource.isA(fieldType)) {
                                var knownDS = this.findPaletteNode("ID", propValue);
                                if (true) {
                                    refComponent = this.makeDSPaletteNode(propValue);
                                }
                            }
                            if (refComponent == null) continue;
                        }
                        childComponents.add([propName, refComponent]);
                    } else {
                        var childDefaults = propValue;
                        childComponents.add([propName, {
                            ID : childDefaults.ID,
                            name : childDefaults.name,
                            type : childType,
                            defaults : childDefaults
                        }]); 
                    }

                    foundChildren = true;
                }
            }

            if (foundChildren) delete defaults[propName];
        }
    
        // find the existing palette node for this class, if any, in order to pick up the icon
        // to use in the project tree
        var pNode = this.findPaletteNode("type", componentType) || this.findPaletteNode("className", componentType);

        if (pNode) {
            componentData.icon = componentData.icon || pNode.icon; 
            componentData.iconSize = componentData.iconSize || pNode.iconSize; 
            componentData.showDropIcon = componentData.showDropIcon || pNode.showDropIcon; 
        }
    
        // collect all the components that should be created and the calls to addComponent()
        // that need to happen
        this.componentsToCreate.add(componentData);
        if (parent != null) {
            componentData.hasParent = true;
            this.addComponentCalls.add([componentData, parent, parentProperty]);
        }

        // recurse to handle the children of this component
        if (childComponents.length > 0) {
            for (var i = 0; i < childComponents.length; i++) {
                this.findChildPaletteNodes(componentData, childComponents[i][1], childComponents[i][0], paletteNodes);
            }
        }
    },

    // ---------------------------------------------------------------------------------------

    //> @method editContext.isNodeEditingOn()
    // Returns true if <code>editNode</code> is in edit mode.
    //
    // @param editNode (EditNode) the EditNode
    // @return (boolean) true if node is in edit mode
    // @visibility external
    //<
    isNodeEditingOn : function (editNode) {
        if (!editNode) return null;
        var liveObject = this.getLiveObject(editNode);

        return (liveObject ? liveObject.editingOn : false);
    },

    //> @method editContext.enableEditing()
    // Enable edit mode for an +link{EditNode}. This is a shortcut for calling
    // +link{Canvas.setEditMode}.
    //
    // @param editNode (EditNode) the EditNode on which to enable editing
    // @see Canvas.setEditMode
    // @see isNodeEditingOn
    // @visibility external
    //<
    enableEditing : function (editNode) {
        if (this.isNodeEditingOn(editNode)) return;

        var liveObject = editNode.liveObject;
        if (liveObject.setEditMode) {
            liveObject.setEditMode(true, this, editNode);
        } else {
            // We're trying enable editing on something that isn't a Canvas or a FormItem.
            // Assume that it needs no special logic beyond setting the editNode, editContext
            // and editingOn flag
            liveObject.editContext = this;
            liveObject.editNode = editNode;
            liveObject.editingOn = true;
        }
    },

    // Applying Properties to EditNodes/EditProxy
    // ---------------------------------------------------------------------------------------

    //> @method editContext.getNodeProperty()
    // Returns the specified property from the editNode's serializable "defaults".
    // @param editNode (EditNode) the editNode to query
    // @param name (String) the property name to query
    // @see setNodeProperties
    // @visibility external
    //<
    getNodeProperty : function (editNode, name) {
        var defaults = editNode.defaults || {};
        return defaults[name];
    },

    //> @method editContext.setNodeProperties()
    // Update an editNode's serializable "defaults" with the supplied properties. If you
    // wish to remove a property from the defaults (rather than setting it to null), then
    // use +link{removeNodeProperties(),removeNodeProperties()} instead.
    // @param editNode (EditNode) the editNode to update
    // @param properties (Canvas Properties) the properties to apply
    // @param [skipLiveObjectUpdate] (Boolean) whether to skip updating the
    //                                         +link{EditNode.liveObject,liveObject},
    //                                         e.g. if you have already updated the liveObject
    // @see removeNodeProperties
    // @see getNodeProperty
    // @visibility external
    //<
    
    setNodeProperties : function (editNode, properties, skipLiveObjectUpdate) {
        this.recordAction("setNodeProperties", arguments);

        
 
        if (this.logIsDebugEnabled("editing")) {
            this.logDebug("with editNode: " + this.echoLeaf(editNode) + 
                          " applying properties: " + this.echo(properties), "editing");
        }
  
        if (!editNode.defaults) editNode.defaults = {};

        var schema = isc.DS.getSchema(editNode);

        // Determine if the new properties actually update the defaults.
        // If there is no change we skip the editNodeUpdated call later.
        //
        // Additionally, pull out a DataSource change. This can occure when
        // a field of type "DataSource" is selected via the component editor
        // (or programatically) rather than by adding/removing a DS editNode.
        // We don't want the change pushed into the component by the normal
        // set properties mechanism but rather want to use the same path used
        // by dropping a DS paletteNode onto the component (or removing it).
        // This way all normal behaviors like adding/replacing default fields
        // and changing the component name take place.
        //
        // Therefore, the DS change is delayed until this method completes
        // and is handled by an addNode or removeNode call.
        var defaults = editNode.defaults,
            changed = false,
            changingDataSource,
            dsName
        ;
        for (var key in properties) {
            var field = (schema ? schema.getField(key) : null) || {};
            if (properties[key] == null &&
                (field.type == "DataSource" || field.editorType == "ProjectDataSourcePicker"))
            {
                changingDataSource = true;
                dsName = properties[key];
                delete properties[key];
            } else if (properties[key] != defaults[key]) {
                if (field.type == "DataSource" || field.editorType == "ProjectDataSourcePicker") {
                    changingDataSource = true;
                    dsName = properties[key];
                    delete properties[key];
                } else {
                    changed = true;
                }
            }
        }

        // update the initialization / serializeable data
        isc.addProperties(editNode.defaults, properties);

        // If our liveObject is a Placeholder or the editNode has requiredProperties set
        // and defaults is missing

        // update the live object, unless we're skipping that
        var targetObject = editNode.liveObject,
            recreateOnChange = false
        ;
        if (targetObject) {
            var havePlaceholder = targetObject._isPlaceholder,
                missingProperties = isc.EditContext.getMissingRequiredProperties(editNode)
            ;
            if (havePlaceholder && !missingProperties &&
                editNode.alwaysUsePlaceholder != true && editNode.alwaysUsePlaceholder != "true")
            {
                // Currently using a placeholder but required properties are now satisfied.
                // The placeholder liveObject must be replaced with a new liveObject of
                // the target class.
                //
                // createLiveObject() will take care of adjusting the editNode to create the
                // actual component for us.
                recreateOnChange = true;
                editNode.type = editNode.defaults.placeholderDefaults.placeholderFor;
                delete editNode.defaults.placeholderDefaults;
            } else if (!havePlaceholder && missingProperties) {
                // The current component would fail to be recreated if updated with current
                // properties because one or more required properties are no longer provided.
                // Drop the liveObject and replace it with a placeholder.
                recreateOnChange = true;
            } else if (havePlaceholder && missingProperties) {
                // Currently using a placeholder and there are still required properties to
                // be satisfied. However, the properties may have changed. Update the defaults
                // with the change and force an update on the placeholder so the change is 
                // immediately reflected.
                editNode.defaults.placeholderDefaults.requiredProperties = missingProperties;
                targetObject.setRequiredProperties(missingProperties);
            }
        }

        if (targetObject && !skipLiveObjectUpdate) {
            var theTree = this.getEditNodeTree(),
                idField = isc.DS.getAutoIdField(editNode),
                autoIdField = isc.DS.getToolAutoIdField(editNode)
            ;

            // Have any properties changed that should trigger the component to be recreated?
            recreateOnChange = (recreateOnChange ||
                                editNode.recreateOnChange == true ||
                                editNode.recreateOnChange == "true");
            if (!recreateOnChange) {
                for (var key in properties) {
                    // If an 'auto' identification field (autoID or autoName) is changed
                    // check the actual 'id' field (ID or name) for recreate property
                    var fieldName = (autoIdField && key == autoIdField ? idField : key),
                        field = (schema ? schema.getField(fieldName) : null) || {}
                    ;
                    if (field && field.recreateOnChange) {
                        recreateOnChange = true;
                        break;
                    }
                }
            }

            if (recreateOnChange) {
                editNode = this._recreateComponent(editNode, properties);

                // collect the newly created live object
                targetObject = this.getLiveObject(editNode);

                // after remove/add cycle the editNode.ID is up-to-date as is the
                // tree structure. Ignore further changes to it.
                schema = null;
            }

            // update the component node with the new ID
            var nodeID = (schema ? isc.DS.getAutoId(editNode.defaults) : null);
            if (nodeID != null && editNode.ID != nodeID) {
                theTree.updateNodeIdInIndex(editNode.ID, nodeID);
                editNode.ID = nodeID;
            } else {
                nodeID = null;      // Indicate that ID didn't change
            }

            // update the live object
            try {
                this.applyPropertiesToComponent(editNode, properties);
            } catch (e) {
                // Failed to apply a property. Attempt to recreate the component using the
                // accumulated defaults. This may work where using the setter doesn't. If
                // the component cannot be created a placeholder will be used in place
                // indicating the issue.
                editNode = this._recreateComponent(editNode, properties);

                // collect the newly created live object
                targetObject = this.getLiveObject(editNode);
            }

            if (this.markForRedraw) this.markForRedraw();

            // Changing the ID on a component results in the DOM being cleared and the
            // component redrawn. If an edit mask is being shown it will be destroyed.
            // Scan through children of the changed node and re-show any edit masks.
            if (nodeID) this._resetMaskedNodes(editNode);

            // Call dataChanged() to notify observers that the editNode within the edit node tree
            // has changed.
            theTree.dataChanged();
        } // skipLiveObjectUpdate

        if (changed) this.fireEditNodeUpdated(editNode, properties);

        if (changingDataSource) {
            // Allow editProxy to handle the process if desired
            var editProxy = targetObject.editProxy;
            if (editProxy.changeDataSource) {
                editProxy.changeDataSource(dsName);
            } else {
                if (!dsName) {
                    // Removing a DS
                    var ds = isc.DS.get(targetObject[key]),
                        dsEditNode = theTree.getChildren(editNode).find("liveObject", ds)
                    ;
                    if (ds && dsEditNode) {
                        this.delayCall("removeNode", [dsEditNode, null, true]);
                    }
                } else {
                    // Adding or changing the DS
                    var dsPaletteNode = this.makeDSPaletteNode(dsName),
                        dsEditNode = this.makeEditNode(dsPaletteNode)
                    ;
                    // All normal actions for a dropped DS should apply
                    dsEditNode.dropped = true;
                    this.delayCall("addNode", [dsEditNode, editNode, 0 /*, null, true, null, true*/]);
                }
            }
        }
        return editNode;
    },

    _recreateComponent : function (editNode, properties) {
        var theTree = this.getEditNodeTree(),
            idField = isc.DS.getAutoIdField(editNode),
            autoIdField = isc.DS.getToolAutoIdField(editNode),
            parentNode = theTree.getParent(editNode),
            parentLiveObject = parentNode ? parentNode.liveObject : null,
            index = theTree.getChildren(parentNode).findIndex(editNode),
            liveObject = this.getLiveObject(editNode)
        ;

        this.logInfo("using remove/re-add cycle to modify liveObject: " +
                    isc.echoLeaf(liveObject) + " within parent node " +
                    isc.echoLeaf(parentNode));
        ;

        // If there are child nodes remove them first and add them back later.
        // An example is a FormItem with an optionDataSource child node.
        var childNodes = theTree.getChildren(editNode);
        if (childNodes) {
            childNodes = childNodes.duplicate();
            for (var i = 0; i < childNodes.length; i++) {
                var liveChild = this.getLiveObject(childNodes[i]);
                if (this.isComponentSelected(liveChild)) {
                    this.deselectComponents(liveChild, true);
                }
                this.removeNode(childNodes[i], true);
            }
            
            if (isc.isA.CanvasItem(liveObject)) {
                liveObject.autoDestroy = false;
            }
        }

        // Make sure component to be recreated is not selected
        if (this.isComponentSelected(liveObject)) {
            this.deselectComponents(liveObject, true);
        }

        // Remove the node from the edit tree and from the parent relation.
        // Note that the liveObject is not destroyed.
        this.removeNode(editNode, null, true);

        // For the remainder of the recreation work with a paletteNode.
        // A new editNode will also be created which will result in a new liveObject.
        var paletteNode = this.makePaletteNode(editNode);

        // Destroy the original liveObject if applicable. Otherwise we assume garbage
        // collection will take care of it
        if (liveObject.destroy) {
            
            liveObject.delayCall("destroy");
        }

        // update the node with the new identifier, if changed (editNode always uses "ID")
        if ((properties[idField] != null || properties[autoIdField] != null) &&
            paletteNode.type != "DynamicProperty")
        {
            paletteNode.ID = properties[idField] || properties[autoIdField];
            if (properties[idField]) {
                delete properties[autoIdField];
                if (paletteNode.defaults) {
                    delete paletteNode.defaults[autoIdField];
                }
            }
        }

        // Changing the type of a FormItem takes special action
        if (isc.isA.DynamicForm(parentLiveObject) && properties.type != null) {
            
            var itemClassName = isc.FormItemFactory.getItemClassName({
                    type: properties.type }, properties.type, parentLiveObject),
                itemClass = isc.FormItemFactory.getItemClass(itemClassName)
            ;
            if (itemClass) {
                paletteNode.type = paletteNode._constructor = itemClass.getClassName();
                if (paletteNode.defaults && paletteNode.defaults._constructor) {
                    paletteNode.defaults._constructor = paletteNode._constructor;
                }
                var icon = isc.Class.getClassIcon(paletteNode.type);
                if (!icon) {
                    icon = isc.Class.getClassIcon("FormItem");
                }
                if (icon) {
                    paletteNode.icon = icon;
                }
                delete paletteNode.title;
            }
            delete properties.type;
        }

        // Create a new editNode along with a new liveObject
        editNode = this.makeEditNode(paletteNode);

        // Add the updated editNode back into place
        var parentProperty = (editNode.defaults ? editNode.defaults.parentProperty : null);
        editNode = this.addNode(editNode, parentNode, index, parentProperty, null, null, true);

        // Add any childNodes back as well
        if (childNodes) {
            for (var i = 0; i < childNodes.length; i++) {
                this.addNode(childNodes[i], editNode, null, null, null, null, true);
            }
            // Selection goes back to recreated node rather than the last child
            this.selectSingleEditNode(editNode);
        }

        return editNode;
    },

    _resetMaskedNodes : function (parentNode) {
        var theTree = this.getEditNodeTree(),
            childNodes = theTree.getChildren(parentNode)
        ;
        if (!childNodes) return;
        for (var i = 0; i < childNodes.length; i++) {
            var childNode = childNodes[i];
            var liveObject = childNode.liveObject,
                editProxy = (liveObject && liveObject.editProxy ? liveObject.editProxy : null)
            ;
            if (editProxy && editProxy.useEditMask && parentNode.liveObject) {
                editProxy.showEditMask(parentNode.liveObject);
            }
            if (theTree.hasChildren(childNode)) {
                this._resetMaskedNodes(childNode);
            }
        }
    },

    applyPropertiesToComponent : function (editNode, properties) {
        // update the live object
        var targetObject = editNode.liveObject;
        if (targetObject.setEditableProperties) {
            // instance of an SC class (or something else that implements a
            // setEditableProperties API)
            // Trap and report exceptions back to caller only if a custom component
            var schema = isc.DS.get(editNode.type || editNode.className),
                trapExceptions = !schema.componentSchema
            ;
            targetObject.setEditableProperties(properties, trapExceptions);
            if (targetObject.markForRedraw) targetObject.markForRedraw();
            // NOTE: for FormItems, causes parent redraw
            else if (targetObject.redraw) targetObject.redraw();
        } else {
            // for objects that never become ISC classes (MenuItems, ListGrid fields), 
            // call an overridable method on the parent if it exists
            var theTree = this.getEditNodeTree(),
                parentNode = theTree.getParent(editNode),
                ancestorNode = parentNode
            ;
            if (parentNode != null) {
                var parentLiveObject = parentNode.liveObject;
                if (parentLiveObject != null && parentLiveObject.setChildEditableProperties)
                {
                    parentLiveObject.setChildEditableProperties(targetObject, properties,
                                                                editNode, this);
                } else {
                    var level = 1;
                    while ((ancestorNode = theTree.getParent(ancestorNode)) != null) {
                        var ancestorLiveObject = ancestorNode.liveObject;
                        if (ancestorLiveObject != null && 
                            ancestorLiveObject.setDescendantEditableProperties) 
                        {
                            ancestorLiveObject.setDescendantEditableProperties(targetObject,
                                                            properties, editNode, this, level);
                            break;
                        }
                        ++level;
                    }
                }
            }

            if (ancestorNode == null) {
                // fall back to just applying the properties
                isc.addProperties(targetObject, properties);
            }
        }

        if (this.markForRedraw) this.markForRedraw();
    },

    //> @method editContext.removeNodeProperties()
    // Removes the specified properties from an editNode's serializable "defaults".
    // Note that the +link{EditNode.liveObject,liveObject} is <u>not</u> updated by this method. 
    // To set a property to null (rather than removing it), use
    // +link{setNodeProperties(),setNodeProperties()} instead.
    // @param editNode (EditNode) the editNode to update
    // @param properties (Array of String) an array of property names to remove
    // @see setNodeProperties()
    // @visibility external
    //<
    removeNodeProperties : function (editNode, properties) {
        this.recordAction("removeNodeProperties", arguments);

        if (!editNode.defaults) return;
        if (!isc.isAn.Array(properties)) properties = [properties];
        var modifiedProperties = {};
        properties.map (function (property) {
            delete editNode.defaults[property];
            modifiedProperties[property] = true;
        });
        this.fireEditNodeUpdated(editNode, modifiedProperties);
    },

    //> @method editContext.setEditProxyProperties()
    // Update an editNode's +link{EditProxy} properties. If editProxy has not yet
    // been created, <code>editProxyProperties</code> is updated or created instead.
    //
    // @param editNode (EditNode) the editNode to update
    // @param properties (EditProxy Properties) the properties to apply
    // @visibility external
    //<
    
    setEditProxyProperties : function (editNode, properties) {
        var liveObject = editNode.liveObject || editNode;

        if (liveObject.editProxy) {
            isc.addProperties(liveObject.editProxy, properties);
        } else {
            isc.addProperties(editNode, {
                editProxyProperties: isc.addProperties({},
                    editNode.editProxyProperties,
                    properties
                )
            });
        }
    },

    // Copy and paste
    // ---------------------------------------------------------------------------------------

    //> @attr editContext.useCopyPasteShortcuts (Boolean : null : IR)
    // If set, auto-enables +link{editProxy.useCopyPasteShortcuts} on the +link{editProxy} for the
    // +link{getRootEditNode(),root editNode}.  This works whether there is currently a root editNode
    // or one is added later.
    //
    // @visibility external
    //<

    //> @method editContext.makePaletteNode()
    // Creates a +link{PaletteNode} from an +link{EditNode} in this context's
    // +link{getEditNodeTree(),editNodeTree}.
    // <p>
    // This essentially creates a new +link{paletteNode} with the +link{editNode.defaults} from the
    // passed <code>editNode</code>.  The returned <code>paletteNode</code> could then be used with
    // +link{editContext.addFromPaletteNode()} to effectively create a copy of the original editNode -
    // specifically a new editNode with a new +link{editNode.liveObject} created from the same
    // defaults.
    // <p>
    // However note that <code>makePaletteNode()</code> does not copy descendant nodes - use
    // +link{makePaletteNodeTree()} for that.
    // <p>
    // May return null if the passed editNode cannot validly by transformed into a paletteNode, for
    // example if +link{editNode.canDuplicate} was set false.
    //
    // @param editNode (EditNode) the editNode to use to make a paletteNode
    // @return (PaletteNode) paletteNode derived from the editNode or null
    //
    // @visibility external
    //<
    makePaletteNode : function (editNode) {
        if (!editNode || editNode.canDuplicate == false) return null;

        var type = editNode.type || editNode.className,
            defaults = isc.addProperties({}, editNode.defaults)
        ;
        delete defaults._constructor;
        delete defaults.ID;
        delete defaults.autoDraw;
        delete defaults.hasStableID;

        var paletteNode = isc.addProperties({},
                                this.findPaletteNode("type", type),
                                { defaults: defaults });
        if (editNode.editNodeProperties) {
            paletteNode.editNodeProperties = isc.addProperties({}, editNode.editNodeProperties);
        }
        if (editNode.editProxyProperties) {
            paletteNode.editProxyProperties = isc.addProperties({}, editNode.editProxyProperties);
        }

        // Hack for VB: VB hangs a property onto the editNode to identify which mode the
        // component editor was last in so it can be restored to that state when shown
        // again. The property is "<componentEditorID>BasicMode" so we grab any properties
        // that end in "BasicMode" and have them apply to an EditNode created from this
        // paletteNode.
        for (var key in editNode) {
            if (key.endsWith("BasicMode")) {
                if (!paletteNode.editNodeProperties) paletteNode.editNodeProperties = {};
                paletteNode.editNodeProperties[key] = editNode[key];
            }
        }

        for (var i = 0; i < isc.EditContext._paletteNodeAttributes.length; i++) {
            var attr = isc.EditContext._paletteNodeAttributes[i];
            if (editNode[attr]) paletteNode[attr] = editNode[attr];
        }
        for (var i = 0; i < isc.EditContext._paletteNodeBehaviors.length; i++) {
            var attr = isc.EditContext._paletteNodeBehaviors[i];
            if (editNode[attr]) paletteNode[attr] = editNode[attr];
        }

        return paletteNode;
    },

    //> @method editContext.makePaletteNodeTree()
    // Creates a +link{Tree} of +link{PaletteNode,PaletteNodes} from an +link{EditNode} in this
    // context's +link{getEditNodeTree(),editNodeTree}, by using +link{makePaletteNode()} on the
    // passed <code>EditNode</code> and its descendents within the
    // +link{EditContext.getEditNodeTree(),editNodeTree}.
    // <p>
    // The root node of the returned +link{Tree} will be a PaletteNode derived from the passed
    // <code>EditNode</code>.
    //
    // @param editNode (EditNode) root editNode to make Tree of PaletteNodes from
    // @return (Tree) a Tree of paletteNodes or null
    //
    // @visibility external
    //<
    makePaletteNodeTree : function (editNode, subTree, parentNode) {
        if (!editNode || editNode.canDuplicate == false) return null;

        var paletteNode = this.makePaletteNode(editNode);
        if (!subTree) {
            subTree = isc.Tree.create({
                root : paletteNode
            });
        } else {
            subTree.add(paletteNode, parentNode);
        }

        var theTree = this.getEditNodeTree(),
            childNodes = theTree.getChildren(editNode)
        ;
        if (childNodes && childNodes.length > 0) {
            for (var i = 0; i < childNodes.length; i++) {
                this.makePaletteNodeTree(childNodes[i], subTree, paletteNode);
            }
        }

        return subTree;
    },

    //> @method editContext.copyEditNodes()
    // Copies the passed editNode or editNodes to an internal "clipboard" space, for later application
    // via +link{pasteEditNodes()}.
    // @param editNode (EditNode | Array of EditNode)
    //
    // @visibility external
    //<
    copyEditNodes : function (editNode) {
        if (!editNode) return;
        if (!isc.isAn.Array(editNode)) editNode = [editNode];

        var trees = [];
        for (var i = 0; i < editNode.length; i++) {
            var tree = this.makePaletteNodeTree(editNode[i]);
            if (tree) trees.push(tree);
        }

        // If no trees/nodes were copied that means canDuplicate is false
        // on all editNodes. In that case, don't destroy current clipboard contents.
        if (trees.length > 0) {
            this.setEditClipboard(trees.length == 1 ? trees[0] : trees);
        }
    },

    setEditClipboard : function (clipboard) {
        this.clearEditClipboard();
        this._editClipboard = clipboard;
    },

    getEditClipboard : function () {
        return this._editClipboard;
    },

    clearEditClipboard : function () {
        if (this._editClipboard) {
            delete this._editClipboard;
        }
    },

    //> @method editContext.pasteEditNodes()
    // "Pastes" <code>editNodes</code> previously captured via +link{copyEditNodes()}.
    // <p>
    // New editNodes will be added as root-level nodes of the +link{getEditNodeTree(),editNodeTree}
    // unless a <code>targetEditNode</code> is passed.
    // @param [targetEditNode] (EditNode)
    //
    // @visibility external
    //<
    pasteEditNodes : function (targetEditNode) {
        var clipboard = this.getEditClipboard();
        if (!clipboard) return;

        var oldSelection = this.selectedComponents;
        this.selectedComponents = [];
        var editProxy = this._getSelectionEditProxy();

        if (!isc.isAn.Array(clipboard)) clipboard = [clipboard];
        for (var i = 0; i < clipboard.length; i++) {
            var tree = clipboard[i],
                treeNode = tree.getRoot();

            // Update the component position in the clipboard so that the
            // next paste will offset even further
            if (treeNode.defaults) {
                treeNode.defaults.left = (treeNode.defaults.left ? treeNode.defaults.left : 0) + 
                                                isc.EditContext.editNodePasteOffset;
                treeNode.defaults.top = (treeNode.defaults.top ? treeNode.defaults.top : 0) + 
                                                isc.EditContext.editNodePasteOffset;
            }
            
            var paletteNode = isc.Tree.getCleanNodeData(treeNode, false, false, false, tree),
                editNode = this.addFromPaletteNode(paletteNode, targetEditNode)
            ;
            if (editProxy) this.selectedComponents.add(editNode.liveObject);

            this._pasteChildNodes(editNode, tree, treeNode);
        }
        
        this.updateSelectionDisplay(this.selectedComponents, oldSelection);
        this.fireSelectedEditNodesUpdated();
    },

    _pasteChildNodes : function (targetEditNode, tree, parentNode) {
        var childNodes = tree.getChildren(parentNode);
        if (!childNodes || childNodes.length == 0) {
            return;
        }

        var editProxy = this._getSelectionEditProxy();

        for (var i = 0; i < childNodes.length; i++) {
            var paletteNode = isc.Tree.getCleanNodeData(childNodes[i], false, false, false, tree),
                editNode = this.addFromPaletteNode(paletteNode, targetEditNode)
            ;
            this._pasteChildNodes(editNode, tree, paletteNode);
        }
    },

    // ---------------------------------------------------------------------------------------

    // The "wrapperForm" is a DynamicForm that we auto-create as a container for a FormItem dropped 
    // directly onto a Canvas, Layout or whatever.  We're using autoChild-like semantics here so 
    // that you can provide your own settings for the generated form.  addWithWrapper() is also
    // used to wrap DrawItems in a DrawPane, and the third argument, wrapDrawPane, is a boolean
    // flag to distinguish the desired wrapper.
    wrapperFormDefaults: {
        _constructor: "DynamicForm"
    },
    wrapperDrawPaneDefaults: {
        _constructor: "DrawPane"
    },
    addWithWrapper : function (childNode, parentNode, index, parentProperty, wrapDrawPane, skipNodeAddedNotification) {
        var wrapForm = !wrapDrawPane,
            wrapperDefaults = (wrapDrawPane ? this.wrapperDrawPaneDefaults : this.wrapperFormDefaults),
            editContextDefaults = isc.Canvas._getEditProxyPassThruProperties(this),
            defaults = isc.addProperties({}, wrapperDefaults)
        ;
        if (childNode.editProxyProperties) isc.addProperties(editContextDefaults, childNode.editProxyProperties);

        var paletteNode = {
            type: wrapperDefaults._constructor,
            defaults : defaults,
            editProxyProperties: editContextDefaults,
            parentProperty: parentProperty
        };
        
        if (paletteNode.type == "DynamicForm") paletteNode.idName = "Form";

        // if this FormItem belongs to a DataSource, the wrapper form needs to use it too
        if (wrapForm && childNode.liveObject && childNode.liveObject.schemaDataSource) {
            var item = childNode.liveObject;
            defaults.doNotUseDefaultBinding = true;
            defaults.dataSource = item.schemaDataSource;
            defaults.serviceNamespace = item.serviceNamespace;
            defaults.serviceName = item.serviceName;
        }
        var wrapperNode = this.makeEditNode(paletteNode);

        // add the wrapper to the parent
        this.addNode(wrapperNode, parentNode, index, parentProperty, null, null, true);

        // add the child node to the wrapper
        var childNode = this.addNode(childNode, wrapperNode, null, null, null, null, skipNodeAddedNotification);

        // Set wrapper form height to just enough for the child node.
        // This prevents a layout container from assigning more space than necessary.
        if (wrapForm) {
            var cellPadding = wrapperNode.liveObject.cellPadding,
                childHeight = childNode.liveObject.getHeight()
            ;
            if (childHeight > 0) {
                this.setNodeProperties(wrapperNode, { height: (cellPadding*2)+childHeight});
            }
        }

        return childNode;
    },

    // Selection Outline/DragHandle
    // ---------------------------------------------------------------------------------------

    //> @attr editContext.editMaskProperties (Object : null : IR)
    // Properties to apply to all +link{editProxy.editMask}s created for components 
    // in edit mode. This mask can be modified when the node is selected by
    // +link{editContext.selectedBorder}, +link{editContext.selectedTintColor} and
    // +link{editContext.selectedTintOpacity} depending on the +link{editContext.selectedAppearance}
    // setting.
    //
    // @visibility external
    //<

    //> @method editContext.editMaskClicked()
    // Executed when the left mouse is clicked (pressed and then released) on any selectable
    // component with +link{editProxy.editMask} enabled.
    // implementation.
    //
    // @param editNode (EditNode) the editNode clicked
    // @param liveObject (Object) the object clicked
    // @visibility external
    //<

    
    //> @attr editContext.selectionType (SelectionStyle : "multiple" : [IRW])
    // Defines selection behavior when in edit mode. Only two styles are supported:
    // "single" and "multiple". Multiple enables hoop selection.
    //
    // @see type:SelectionStyle
    // @visibility external
    //<
    selectionType: "multiple",

    //> @attr editContext.canSelectEditNodes (Boolean : null : IR)
    // Should editNodes added to this EditContext be selectable? When <code>true</code>,
    // each +link{editProxy.canSelectChildren} property is enabled unless explicitly set to
    // <code>false</code>. This allows an individual component to override this setting.
    //
    // @visibility external
    //<

    //> @attr editContext.selectedAppearance (SelectedAppearance : null : IR)
    // Appearance that is applied to selected component.
    // <P>
    // This value is applied as a default to +link{editProxy.selectedAppearance}.
    // @visibility external
    // @see editContext.selectedBorder
    // @see editContext.selectedTintColor
    // @see editContext.selectedTintOpacity
    //<

    //> @type SelectedAppearance
    // Appearance when a component is in +link{canvas.setEditMode(),edit mode} and is
    // selected.  
    // <p>
    // Modes such as "tintMask" or "outlineMask" create an 
    // +link{editProxy.editMask,"edit mask"} that is layered over the selected component, and 
    // blocks all normal interaction with the component, so that behaviors like
    // +link{editProxy.supportsInlineEdit} can completely take the place of the component's
    // normal interactivity.
    // <p>
    // "outlineEdges" mode allows normal interaction with the component, which allows the end
    // user to do things like +link{listGrid.canFreezeFields,freeze ListGrid fields}, which
    // the +link{GridEditProxy} can implement as a 
    // +link{gridEditProxy.saveFieldFrozenState,persistent change to grid's configuration}.
    //
    // @value "tintMask" editMask on top of the component is updated with +link{editProxy.selectedTintColor}
    //                       and +link{editProxy.selectedTintOpacity}
    // @value "outlineMask" editMask on top of the component is updated with +link{editProxy.selectedBorder}
    // @value "outlineEdges" MultiAutoChild is created on top of the component.  This constructs a border around
    //                       the component using 4 separate <code>outlineEdge</code> components so that interactivity is not blocked.
    // @value "none" no change in appearance.  Override +link{editProxy.showSelectedAppearance()} to create a custom appearance.
    // @visibility external
    //<

    //> @attr editContext.selectedBorder (String : "1px dashed #44ff44" : IR)
    // Set the CSS border to be applied to the selection outline of the selected components.
    // This property is used when +link{editProxy.selectedAppearance} is <code>outlineMask</code>
    // or <code>outlineEdges</code>.
    // <P>
    // This value is applied as a default to +link{editProxy.selectedBorder}.
    //
    // @visibility external
    //<
    selectedBorder: "1px dashed #44ff44",

    //> @attr editContext.selectedLabelBackgroundColor (String : null : IR)
    // The background color for the selection outline label. The
    // default is defined on +link{SelectionOutline}.
    // <P>
    // This value is applied as a default to +link{editProxy.selectedLabelBackgroundColor}.
    // <P>
    // NOTE: A selected component label is only supported when +link{editProxy.selectedAppearance}
    // is "outlineEdges".
    //
    // @visibility external
    // @see editContext.showSelectedLabel
    //<

    //> @attr editContext.selectedTintColor (CSSColor : "#cccccc" : IR)
    // Mask color applied to +link{editProxy.editMask,editMask} of selected component when
    // +link{editProxy.selectedAppearance} is "tintMask".
    // <P>
    // This value is applied as a default to +link{editProxy.selectedTintColor}.
    // @visibility external
    //
    // @see editContext.selectedTintOpacity
    //<
    selectedTintColor: "#cccccc",

    //> @attr editContext.selectedTintOpacity (Number : 25 : IR)
    // Opacity applied to +link{editProxy.editMask,editMask} of selected component when
    // +link{editProxy.selectedAppearance} is "tintMask".
    // <P>
    // This value is applied as a default to +link{editProxy.selectedTintOpacity}.
    //
    // @visibility external
    // @see editContext.selectedTintColor
    //<
    selectedTintOpacity: 25,

    //> @attr editContext.showSelectedLabel (Boolean : null : IR)
    // Should the selection outline show a label for selected components? A component may
    // also be highlighted with the selection outline and label to indicate the target of
    // a drop. To suppress showing a label at any time set this property to <code>false</code>.
    // <P>
    // To suppress labels during selection but still show them when targeted for a drop,
    // see +link{editContext.showSelectedLabelOnSelect}.
    // <P>
    // NOTE: A selected component label is only supported when +link{editProxy.selectedAppearance}
    // is "outlineEdges".
    //
    // @visibility external
    //<

    //> @attr editContext.showSelectedLabelOnSelect (Boolean : null : IR)
    // Should the selection outline show a label when the component is selected? This property
    // is similar to +link{editContext.showSelectedLabel}. Whereas
    // +link{editContext.showSelectedLabel,showSelectedLabel} controls whether a label is shown at
    // any time, this property allows normal selection to suppress the label but still show a label
    // during the drop process on the target. Leave +link{editContext.showSelectedLabel,showSelectedLabel}
    // unset and set this property to <code>false</code>.
    // <P>
    // NOTE: A selected component label is only supported when +link{editProxy.selectedAppearance}
    // is "outlineEdges".
    //
    // @visibility external
    //<

    //> @attr editContext.canGroupSelect (Boolean : null : IR)
    // Should a group selection outline covering the outermost bounding boxes of all selected
    // components be shown in this container?
    // <P>
    // Treated as <code>true</code> if not set and hoop selection is enabled (see
    // +link{editProxy.canSelectChildren} and
    // +link{editContext.selectionType,selectionType}.
    // 
    // @visibility external
    //<

    //> @attr editContext.canDragGroup (Boolean : null : IR)
    // Should the group selection box shown when +link{editContext.canGroupSelect,canGroupSelect}
    // is true allow dragging the group as a whole?
    // <P>
    // Treated as <code>true</code> if not set and +link{editContext.canGroupSelect,canGroupSelect}
    // is true.
    //
    // @visibility external
    //<

    _getCanGroupSelect : function () {
        
        return (this.canGroupSelect == true || this.selectionType == "multiple");
    },
    _getCanDragGroup : function () {
        return (this.canDragGroup != false) && this._getCanGroupSelect();
    },

    //> @attr editContext.hideGroupBorderOnDrag (Boolean : null : IR)
    // Should the group selection box shown when +link{editContext.canGroupSelect,canGroupSelect}
    // is true be hidden during drag?
    // <P>
    // Treated as <code>true</code> if not explicitly set to false.
    //
    // @visibility external
    //<

    //> @method editContext.getSelectedLabelText()
    // Overridable method to provide a custom selection outline label. This method
    // is called when a label is to be shown with an outline.
    // <p>
    // The default implementation returns the same description shown in the edit tree.
    //
    // @param component (Object) the Canvas or FormItem component to label
    // @return (HTMLString) string to be displayed 
    // @visibility external
    //<
    getSelectedLabelText : function (component) {
        if (!component) return null;
        var editNode = component.editNode;
        if (!editNode) return component.toString();

        var idDesc = this.getEditNodeIDDescription(editNode),
            type = editNode.type || editNode.className,
            typeDesc = this.getTitleForType(type)
        ;
        return idDesc || component.toString();
    },

    //> @type HoopSelectionStyle
    // Hoop selection modes.
    // @value "encloses" Components completely enclosed by the hoop are selected
    // @value "intersects" Components enclosed or intersected by the hoop are selected
    // @visibility external
    //<

    //> @attr editContext.hoopSelectionMode    (HoopSelectionStyle: "encloses" : IR)
    // Defines the mode of inclusion for components encountered during hoop selection which
    // is enabled when +link{editContext.selectionType,selectionType} is <code>multiple</code>.
    // <code>encloses</code> mode causes selection of components that are completely
    // enclosed by the hoop. <code>intersects</code> mode selects components that come
    // into contact with the hoop.
    //
    // @see type:HoopSelectionStyle
    // @visibility external
    //<
    hoopSelectionMode: "encloses",

    //> @attr editContext.hoopSelectorProperties (Object : null : IR)
    // Properties to apply to +link{editProxy.hoopSelector}.
    //
    // @visibility external
    //<

    // Selection management
    // --------------------------------------------------------------------------------------------

    

    //> @method editContext.getSelectedEditNodes()
    // Returns all selected EditNodes as an Array.
    //
    // @return (Array of EditNode) the selected edit nodes
    // @visibility external
    //<
    getSelectedEditNodes : function () {
        var nodes = [];
        this.selectedComponents.map(function (item) {
            nodes.push(item.editNode);
        });
        return nodes;
    },

    //> @method editContext.getSelectedEditNode()
    // Returns selected EditNode or first selected EditNode if multiple
    // nodes are selected.
    //
    // @return (EditNode) the selected or first edit node
    // @visibility external
    //<
    getSelectedEditNode : function () {
        var nodes = this.getSelectedEditNodes();
        return (nodes && nodes.length > 0 ? nodes[0] : null);
    },

    //> @method editContext.isEditNodeSelected()
    // Returns true if the editNode is selected. 
    //
    // @return (boolean) true if editNode is selected; false otherwise
    // @visibility external
    //<
    isEditNodeSelected : function (editNode) {
        if (!this.selectedComponents || !editNode.liveObject) return false;
        return this.selectedComponents.contains(editNode.liveObject);
    },

    //> @method editContext.selectEditNode()
    // Select an EditNode.
    //
    // @param editNode (EditNode) editNode to select
    // @visibility external
    //<
    selectEditNode : function (editNode) {
        var liveObject = (editNode && editNode.liveObject ? editNode.liveObject : null);
        if (liveObject && !this.selectedComponents.contains(liveObject)) {
            this.selectedComponents.add(liveObject);
            this.updateSelectionDisplay([liveObject], null);
            this.fireSelectedEditNodesUpdated();
        }
    },

    //> @method editContext.selectSingleEditNode()
    // Select a single EditNode and deselect everything else.
    //
    // @param editNode (EditNode) editNode to select
    // @visibility external
    //<
    selectSingleEditNode : function (editNode) {
        var liveObject = (editNode && editNode.liveObject ? editNode.liveObject : null);
        if (!liveObject) return;

        // Ignore change to the same selection
        if (this.selectedComponents.length == 1 && this.selectedComponents.contains(liveObject)) {
            return;
        }

        var changed = false,
            oldSelection = this.selectedComponents
        ;
        if (oldSelection.contains(liveObject)) oldSelection.remove(liveObject);

        if (this.selectedComponents.length > 0) changed = true;

        this.selectedComponents = [];
        if (liveObject) {
            this.selectedComponents = [liveObject];
            changed = true;
        }
        if (changed) {
            this.updateSelectionDisplay([liveObject], oldSelection);
            this.fireSelectedEditNodesUpdated();
        }
    },

    //> @method editContext.selectAllEditNodes()
    // Select all EditNodes.
    //
    // @visibility external
    //<
    selectAllEditNodes : function () {
        this.selectedComponents = [];
        var editProxy = this._getSelectionEditProxy();
        if (editProxy) {
            this.selectedComponents = editProxy.getAllSelectableComponents();
            this.updateSelectionDisplay(this.selectedComponents, null);
        }
        this.fireSelectedEditNodesUpdated();
    },

    //> @method editContext.deselectEditNodes()
    // Deselect a list of EditNodes.
    //
    // @param editNodes (List of EditNode) editNodes to deselect
    // @visibility external
    //<
    deselectEditNodes : function (editNodes) {
        if (!isc.isAn.Array(editNodes)) editNodes = [editNodes];
        var components = [];
        this.editNodes.map(function (node) {
            if (node.liveObject) components.push(node.liveObject);
        });
        var updated = this.selectedComponents.removeList(components);
        this.updateSelectionDisplay(null, components);
        if (updated) {
            this.fireSelectedEditNodesUpdated();
        }
    },

    //> @method editContext.deselectAllEditNodes()
    // Deselect all EditNodes.
    //
    // @visibility external
    //<
    deselectAllEditNodes : function () {
        if (!this.selectedComponents || this.selectedComponents.length == 0) return;
        var oldSelection = this.selectedComponents;
        this.selectedComponents = [];
        this.updateSelectionDisplay(null, oldSelection);
        this.fireSelectedEditNodesUpdated();
    },

    hideSelection : function () {
        if (!this.selectedComponents || this.selectedComponents.length == 0) {
            return;
        }
        var selected = this.selectedComponents;
        for (var i = 0; i < selected.length; i++) {
            var proxy = selected[i].editProxy;
            if (proxy && proxy.showSelectedAppearance) {
                proxy.showSelectedAppearance(false);
            }
        }
    },

    // START INTERNAL SELECTION METHODS

    getSelectedComponents : function () {
        return this.selectedComponents.duplicate()
    },
    isComponentSelected : function (component) {
        if (!this.selectedComponents) return false;
        return this.selectedComponents.contains(component);
    },

    selectComponent : function (component) {
        if (!this.selectedComponents.contains(component)) {
            this.selectedComponents.add(component);
            this.updateSelectionDisplay([component], null);
            this.fireSelectedEditNodesUpdated();
        }
    },
    selectSingleComponent : function (component) {
        // Ignore change to the same selection
        if (this.selectedComponents.length == 1 && this.selectedComponents.contains(component)) {
            // Make sure selection is shown
            this.updateSelectionDisplay([component]);        
            return;
        }

        var changed = false,
            oldSelection = this.selectedComponents
        ;
        if (oldSelection.contains(component)) oldSelection.remove(component);

        if (this.selectedComponents.length > 0) changed = true;

        this.selectedComponents = [];
        if (component) {
            this.selectedComponents = [component];
            changed = true;
        }
        if (changed) {
            this.updateSelectionDisplay([component], oldSelection);
            this.fireSelectedEditNodesUpdated();
        }
    },
    selectAllComponents : function () {
        this.selectedComponents = [];
        var editProxy = this._getSelectionEditProxy();
        if (editProxy) {
            this.selectedComponents = editProxy.getAllSelectableComponents();
            this.updateSelectionDisplay(this.selectedComponents, null);
        }
        this.fireSelectedEditNodesUpdated();
    },
    deselectComponents : function (components, skipUpdate) {
        if (!isc.isAn.Array(components)) components = [components];
        var updated = this.selectedComponents.removeList(components);
        this.updateSelectionDisplay(null, components);
        if (updated && !skipUpdate) {
            this.fireSelectedEditNodesUpdated();
        }
    },
    deselectAllComponents : function () {
        if (!this.selectedComponents || this.selectedComponents.length == 0) return;
        var oldSelection = this.selectedComponents;
        this.selectedComponents = [];
        this.updateSelectionDisplay(null, oldSelection);
        this.fireSelectedEditNodesUpdated();
    },
    // END INTERNAL SELECTION METHODS

    // Should thumbs or drag handle be shown directly on a component?
    _shouldShowThumbsOrDragHandle : function () {
        return (this.selectedComponents && this.selectedComponents.length == 1);
    },

    refreshSelectedAppearance : function (component) {
        if (!component || !component.editProxy) return;
        if (this.isComponentSelected(component)) {
            var canDrag = this._canDragChildNode(component.editNode) &&
                          this._shouldShowThumbsOrDragHandle();
            component.editProxy.showSelectedAppearance(true, (this.showSelectedLabelOnSelect == false), canDrag);
        } else {
            component.editProxy.showSelectedAppearance(false);
        }
    },

    // Set/clear selection outlines. this.selectedComponents
    // must already be up-to-date before this call.
    updateSelectionDisplay : function (selected, cleared) {
        var showThumbsOrDragHandle = this._shouldShowThumbsOrDragHandle();

        // Update individual component selections
        if (cleared && cleared.length > 0) {
            for (var i = 0; i < cleared.length; i++) {
                var proxy = cleared[i].editProxy,
                    editNode = cleared[i].editNode
                ;

                // If unselecting modelVisibility:true component be sure it is hidden in preview
                if (editNode) this._updateModalVisibility(editNode, false);

                if (proxy && proxy.showSelectedAppearance) {
                    proxy.showSelectedAppearance(false);
                }
            }
        }
        if (selected && selected.length > 0) {
            for (var i = 0; i < selected.length; i++) {
                var proxy = selected[i].editProxy,
                    editNode = selected[i].editNode
                ;
                // If selecting modelVisibility:true component be sure it is visible in preview
                if (editNode) this._updateModalVisibility(editNode, true);

                if (proxy && proxy.showSelectedAppearance) {
                    // Don't show drag handle for component explicitly marked to not do so
                    if (editNode.canDragInPreview == false || editNode.canDragInPreview == "false") {
                        showThumbsOrDragHandle = false;
                    // Don't show drag handle if component cannot be reparented and the component
                    // is not in a container with absolute positioning
                    } else if (editNode.canReparent == false || editNode.canReparent == "false") {
                        showThumbsOrDragHandle = false;
                        if (this.persistCoordinates != false) {
                            var parentNode = this.getEditNodeTree().getParent(editNode);
                            if (parentNode) {
                                var liveParent = parentNode.liveObject;
                                if (liveParent && liveParent.editProxy) {
                                    if ((this.persistCoordinates == null && liveParent.editProxy.persistCoordinates) ||
                                            (this.persistCoordinates && liveParent.editProxy.persistCoordinates != false))
                                    {
                                        showThumbsOrDragHandle = true;
                                    }
                                }
                            }
                        }
                    }
                    showThumbsOrDragHandle = (showThumbsOrDragHandle &&
                                              this._canDragChildNode(editNode));
                    proxy.showSelectedAppearance(true, (this.showSelectedLabelOnSelect == false), showThumbsOrDragHandle);
                }
            }
        }

        // Special case of dropping a selected component leaving just one
        if (showThumbsOrDragHandle && (!selected || selected.length == 0)) {
            var selectedComponent = this.getSelectedComponents()[0];
            selectedComponent.editProxy.showSelectedAppearance(true, (this.showSelectedLabelOnSelect == false), showThumbsOrDragHandle);
        }

        this.showGroupSelectionBox();
    },

    // If selection/unselecting modelVisibility:true component (or child) be sure the
    // component is shown/hidden in preview
    _updateModalVisibility : function (editNode, select) {
        if (editNode.modalVisibility == true || editNode.modalVisibility == "true") {
            if (select) editNode.liveObject.show();
            else editNode.liveObject.hide();
            return;
        }
        var parentNode = this.getParentNode(editNode),
            rootNode = this.getRootEditNode()
        ;
        while (parentNode && parentNode != rootNode) {
            if (parentNode.modalVisibility == true || parentNode.modalVisibility == "true") {
                if (select) parentNode.liveObject.show();
                else parentNode.liveObject.hide();
                break;
            }
            parentNode = this.getParentNode(parentNode);
        }
    },

    _getSelectionEditProxy : function () {
        var selectionLiveObject = this._selectionLiveObject;
        if (!selectionLiveObject) return null;
        return (selectionLiveObject.editingOn ? selectionLiveObject.editProxy : null);
    },

    fireSelectedEditNodesUpdated : function () {
        var editProxy = this._getSelectionEditProxy();
        if ((editProxy && editProxy.selectedEditNodesUpdated) || this.selectedEditNodesUpdated) {
            var editNodeList = this.getSelectedEditNodes(),
                editNode = (editNodeList && editNodeList.length > 0 ? editNodeList[0] : null)
            ;

            if (editProxy && editProxy.selectedEditNodesUpdated) {
                editProxy.selectedEditNodesUpdated(editNode, editNodeList);
            }
            if (this.selectedEditNodesUpdated) {
                this.selectedEditNodesUpdated(editNode, editNodeList);
            }
        }
    },

    _canDragChildNode : function (childNode) {
        var //liveObject = childNode.liveObject,
            parentNode = this.getEditNodeTree().getParent(childNode),
            parentEditProxy = parentNode && parentNode.liveObject && parentNode.liveObject.editProxy
        ;
        return (parentEditProxy && parentEditProxy.canDragChildNode ? parentEditProxy.canDragChildNode(childNode) : true);
    },

    //> @method editContext.selectedEditNodesUpdated()
    // Called when editMode selection changes. Note this method fires exactly once for any given
    // change.
    // <P>
    // This event is fired once after selection/deselection has completed. The result is
    // one event per mouse-down event. For a drag selection there will be one event fired
    // when the range is completed.
    //
    // @param editNode (EditNode)               first selected node, if any
    // @param editNodeList (Array of EditNode)  List of nodes that are now selected
    // @visibility external
    //<    
    selectedEditNodesUpdated : function (editNode, editNodeList) {},

    saveCoordinates : function (liveObject) {
        if (!liveObject) return;
        if (isc.isA.SimpleTabButton(liveObject) ||
                (isc.DrawPane && isc.isA.DrawItem(liveObject)) || 
                (isc.DrawPane && isc.isA.DrawKnob(liveObject)) ||
                isc.isA.Portlet(liveObject) ||
                isc.isA.PortalColumn(liveObject) ||
                isc.isA.PortalRow(liveObject) ||
                liveObject._isHoopSelector ||
                liveObject._isGroupMask)
        {
            // Tabs never use coordinates
            // DrawItems and DrawKnobs always persist coordinates
            // PortalColumn, PortalRow and Portlet shouldn't save coordinates in this way ...
            // they will save *some* coordinates in updateEditNode()
            return;
        }
        this.showGroupSelectionBox();

        var component = this.getEditNodeArray().find("liveObject", liveObject);

        // can happen if we get a resized or moved notification while a component is being
        // added or removed
        if (!component) return; 

        // Determine whether component coordinates should be persisted.
        if (this.persistCoordinates == false) return;

        // Must not be disabled at parent editProxy.persistCoordinates level either
        var parentNode = this.getEditNodeTree().getParent(component);

        // Can't be persisting coordinates if parent doesn't exist
        if (!parentNode) return;
        var liveParent = parentNode.liveObject;

        if (liveParent && liveParent.editProxy) {
            if ((this.persistCoordinates == null && liveParent.editProxy.persistCoordinates) ||
                    (this.persistCoordinates && liveParent.editProxy.persistCoordinates != false))
            {
                //this.logWarn("saveCoordinates for: " + liveObject +
                //        ", editComponents are: " + this.echoAll(this.getEditNodeArray()));
                var userWidth = (liveObject._userWidth == "*" ? "*" : null),
                    userHeight = (liveObject._userHeight == "*" ? "*" : null)
                ;
                this.setNodeProperties(component, {
                    left: liveObject.getLeft(),
                    top: liveObject.getTop(),
                    // Use percentage width or "*" if supplied
                    width: liveObject._percent_width || userWidth || liveObject.getWidth(),
                    height: liveObject._percent_height || userHeight || liveObject.getHeight()
                }, true);
            } else if (liveObject.editProxy && liveObject.editProxy.persistCoordinates == true) {
                // This style is used for ModalWindows to save just the sizing
                var userWidth = (liveObject._userWidth == "*" ? "*" : null),
                    userHeight = (liveObject._userHeight == "*" ? "*" : null)
                ;
                this.setNodeProperties(component, {
                    // Use percentage width or "*" if supplied
                    width: liveObject._percent_width || userWidth || liveObject.getWidth(),
                    height: liveObject._percent_height || userHeight || liveObject.getHeight()
                }, true);
            }
        }
    },

    // Group selection management
    // --------------------------------------------------------------------------------------------

    showGroupSelectionBox : function () {
        if (this._getCanGroupSelect() && !this._movingGroup && !(isc.isA.DrawPane && isc.isA.DrawPane(this._selectionLiveObject))) {
            var groupMask = this.getGroupMask(this._selectionLiveObject);
            if (this.selectedComponents.length > 1) {
                // show group selection box
                groupMask.setSelection(this.getSelectedComponents());
                groupMask.show();
            } else {
                // hide group selection box
                if (groupMask) groupMask.hide();
            }
        }
    },

    getGroupMask : function (parent) {
        // create box if we've never created one
        if (!this.groupMask && parent) {
            var properties = {
                ID: parent.ID + "_groupMask",
                keepInParentRect: true,
                hideBorderOnDrag: (this.hideGroupBorderOnDrag != false),
                canDragReposition: this._getCanDragGroup()
            };
            this.groupMask = this.createAutoChild("groupMask", properties);
            parent.addChild(this.groupMask);
        }

        return this.groupMask;
    },

    //> @attr editContext.groupMask (AutoChild Canvas : null : IR)
    // A group selection box is created when +link{editContext.canGroupSelect,canGroupSelect} is
    // true and multiple components are selected. This group box is shown around all selected
    // components.
    // <P>
    // The most common customizations are to the border or background.
    //
    // @visibility internal
    //<

    groupMaskDefaults: {
        autoDraw:false,
        canFocus:true,

        // Prevent inclusion in coordinate saving
        _isGroupMask:true,

        border: "2px solid black",

        // start out hidden, only show if explicitly shown
        visibility:"hidden",
        overflow:"hidden",

        setSelection : function (selection) {
            this.selection = selection;

            var boundingBox = this.getComponentsBoundingBox(selection);
            this.setRect(boundingBox);
        },

        getComponentsBoundingBox : function (components) {
            var left = 0,
                right = 0,
                top = 0,
                bottom = 0
            ;
            if (components.length > 0) {
                left = components[0].left;
                right = left + components[0].width;
                top = components[0].top;
                bottom = top + components[0].height;
            }
            for (var i = 1; i < components.length; i++) {
                var component = components[i],
                    height = (component.getVisibleHeight ? component.getVisibleHeight() : component.height)
                ;
                if (component.left < left) left = component.left;
                if ((component.left + component.width) > right) right = component.left + component.width;
                if (component.top < top) top = component.top;
                if ((component.top + height) > bottom) bottom = component.top + height;
            }
            return [left,top,right - left,bottom - top];
        },

        show : function () {
            // Make sure groupMask shows above the selected components
            this.showOverSelection();

            return this.Super("show", arguments);
        },

        setRect : function (left, top, width, height, animating) {
            this._skipMove = true;
            this.Super("setRect", arguments);
            this._skipMove = false;
        },

        showOverSelection : function () {
            var selection = this.selection;
            if (selection != null) {
                for (var i = 0, len = selection.length; i < len; ++i) {
                    var selectionItem = selection[i];
                    if (isc.isA.Canvas(selectionItem)) {
                        this.moveAbove(selectionItem);
                    } else if (isc.isA.DrawItem && isc.isA.DrawItem(selectionItem) && selectionItem.drawPane != null) {
                        this.moveAbove(selectionItem.drawPane);
                    }
                }
            }
        },

        visibilityChanged : function (isVisible) {
            this.enableKeyMovement (isVisible);
        },

        enableKeyMovement : function (enable) {
            if (enable) {
                if (!this._keyPressEventID) {
                    this._keyPressEventID = isc.Page.setEvent("keyPress", this);
                }
            } else {
                if (this._keyPressEventID) {
                    isc.Page.clearEvent("keyPress", this._keyPressEventID);
                    delete this._keyPressEventID;
                }
            }
        },

        // Event Bubbling
        // ---------------------------------------------------------------------------------------

        // XXX FIXME: this is here to maintain z-order on dragReposition.  EH.handleDragStop()
        // brings the mask to the front when we stop dragging - which is not what we want, so we
        // suppress it here.
        bringToFront : function () { },
    
        dragRepositionStart : function() {
            if (this.hideBorderOnDrag) {
                // Hide border during drag
                this._origBorder = this.border;
                this.setBorder(null);
            }
        },

        dragRepositionStop : function() {
            if (this.hideBorderOnDrag) {
                // Re-display border after drag
                this.setBorder(this._origBorder);
            }
        },

        doubleClick: function () {
            return isc.EH.STOP_BUBBLING
        },

        pageKeyPress : function (target, eventInfo) {
            // If root pane (or child) does not have focus, ignore keyPress 
            var rootPane = this.creator.getRootEditNode().liveObject;
            if (!rootPane.containsFocus()) return;

            var key = isc.EH.getKeyEventCharacter();
            if (!isc.isA.AlphaNumericChar(key)) {
                var parent = this.parentElement,
                    shiftPressed = isc.EH.shiftKeyDown(),
                    vGap = (shiftPressed ? 1 : parent.snapVGap),
                    hGap = (shiftPressed ? 1 : parent.snapHGap),
                    delta = [0,0],
                    result = false
                ;

                
                parent._movingSelection = true;

                for (var i = 0; i < this.selection.length; i++) {
                    var target = this.selection[i];

                    // Ignore keyboard movement for percentage-placed components
                    if (this.isPercent(target.left) || this.isPercent(target.top)) continue;

                    // Ignore keyboard movement If component is positioned by snapTo with offset in percentage
                    if (target.snapTo && 
                            (this.isPercent(target.snapOffsetLeft) || this.isPercent(target.snapOffsetTop)))
                    {
                        continue;
                    }

                    switch (isc.EH.getKey()) {
                    case "Arrow_Up":
                        delta = [0, vGap * -1];
                        break;
                    case "Arrow_Down":
                        delta = [0, vGap];
                        break;
                    case "Arrow_Left":
                        delta = [hGap * -1, 0];
                        break;
                    case "Arrow_Right":
                        delta = [hGap, 0];
                        break;
                    default:
                        result = null;
                        break;
                    }

                    if (delta[0] != 0 || delta[1] != 0) {
                        if (target.snapTo) {
                            // Instead of repositioning component directly, just adjust the
                            // snapOffsets
                            target.setSnapOffsetLeft((target.snapOffsetLeft || 0) + delta[0]);
                            target.setSnapOffsetTop((target.snapOffsetTop || 0) + delta[1]);
                        } else {
                            target.moveBy(delta[0], delta[1]);
                        }
                    }
                }
                this.parentElement._movingSelection = false;
                return result;
            }
        },

        _$percent: "%",
        isPercent : function (value) {
            return (isc.isA.String(value) && isc.endsWith(value, this._$percent));
        },

        // Drag and drop move and resize
        // ---------------------------------------------------------------------------------------
        // D&D: some awkwardness
        // - if we set dragTarget to the masterElement, it will get the setDragTracker(), 
        //   dragRepositionMove() etc events, which it may have overridden, whereas we want just a
        //   basic reposition or resize, so we need to be the dragTarget
        // - to be in the right parental context, and to automatically respond to programmatic
        //   manipulation of the parent's size and position, we want to be a peer, but at the end of
        //   drag interactions we also need to move/resize the master, which would normally cause
        //   the master to move us, so we need to switch off automatic peer behaviors while we move
        //   the master

        // allow the mask to be moved around (only the thumbs allow resize)
        canDrag:true,
        canDragReposition:true,
        dragRepositionAppearance:"target",
    
        // don't allow setDragTracker to bubble in case some parent tries to set it inappropriately
        setDragTracker: function () { return isc.EH.STOP_BUBBLING },

        // when we're moved or resized, move/resize the master and update thumb positions
        moved : function (deltaX, deltaY) {
            if (this._skipMove) return;

            this.Super("moved", arguments);

            this.creator._movingGroup = true;

            
            this.parentElement._movingSelection = true;

            for (var i = 0; i < this.selection.length; i++) {
                this.selection[i].moveBy(deltaX,deltaY);
            }
            this.parentElement._movingSelection = false;
            this.creator._movingGroup = false;
            this.showOverSelection();
        }
    },

    //> @attr editContext.enableInlineEdit (Boolean : null : IR)
    // Whether inline editing should be enabled for any components that are added and are placed into
    // editMode.  Enabling this will turn on inline edit for any EditProxy where
    // +link{editProxy.supportsInlineEdit} is true.
    //
    // @visibility external
    //<

    fireEditNodeUpdated : function (editNode, modifiedProperties) {
        if (!this.editNodeUpdated) return;
        if (isc.isAn.Object(modifiedProperties)) modifiedProperties = isc.getKeys(modifiedProperties);

        // Inform editContext notification of changes
        this.editNodeUpdated(editNode, this, modifiedProperties);

        // Let EditProxy know about the changes
        if (editNode.liveObject && editNode.liveObject.editProxy) {
            editNode.liveObject.editProxy.editNodeUpdated(editNode, this, modifiedProperties);
        }
    },

    //> @method editContext.editNodeUpdated()
    // Fires whenever editNode.defaults are modified by setNodeProperties() and/or editProxy
    // features
    // @param editNode (EditNode) currently editing node
    // @param editContext (EditContext) current context
    // @param modifiedProperties (Array of String) properties that were modified
    // @visibility external
    //<

    
    visibilityMaskManagerDefaults: {
        _constructor: "VisibilityMaskManager"
    },

    getVisibilityMaskManager : function () {
        if (!this.visibilityMaskManager) {
            // Define container (canvas that owns all screen components) on manager
            var defaults = { container: this.rootLiveObject };
            this.visibilityMaskManager = this.createAutoChild("visibilityMaskManager", defaults);
        }
        return this.visibilityMaskManager;
    },

    // Undo / Redo
    // ---------------------------------------------------------------------------------------

    

    

    //> @attr editContext.keepUndoLog  (Boolean : null : IR)
    // Should an undo/redo log be maintained for editMode operations?
    // @visibility editModeUndoRedo
    //<

    //> @attr editContext.maxUndoLogEntries  (int : 10 : IR)
    // Maximum number of undo actions to be recorded. Oldest entry is dropped when exceeded.
    // @visibility editModeUndoRedo
    //<
    maxUndoLogEntries: 10,

    //> @method editContext.recordAction()
    // Add an action to undo log.
    // <P>
    // Special handling is in place to avoid recording actions while performing a
    // +link{undo} or +link{redo} operation.
    //
    // @param actionName (String) name of action (i.e. method) being recorded
    // @param args (Array) recorded method arguments
    // @return (Object) action as recorded. null if action cannot be recorded.
    //<
    recordAction : function (actionName, args) {
        if (!this.keepUndoLog || isc._loadingNodeTree) return;
        if (this.replaying) return;

        // Create the new action instance even if replaying an action so that the
        // undo/redo can be logged
        var action = this.createAction(actionName, args);
        if (!action) return;

        if (!this._undoLog) this._undoLog = [];

        // Enforce log limit
        while (this._undoLog.length >= this.maxUndoLogEntries) this._undoLog.shift();

        // save action onto undo stack. any redo actions are now invalid
        this._undoLog.push(action);
        this._redoLog = [];
        this.fireChanged();

        return action;
    },

    //> @method editContext.undo()
    // Undo the last recorded action. Moves action to redo stack.
    // @visibility editModeUndoRedo
    //<
    undo : function () {
        if (!this.keepUndoLog) {
            this.logWarn("Attempt to perform undo operation while undoLog is disabled");
            return;
        }
        if (!this._undoLog) {
            this.logInfo("UndoLog is empty", "editModeUndoLog");
            return;
        }

        var action = this._undoLog.pop();
        if (action) {
            this.replaying = true;
            if (this.reverseAction(action) != false) {
                this._redoLog.add(action);
            } else {
                // once an action is reached that cannot be undone the remaining
                // undo actions are invalid. The redo log is still valid.
                this._undoLog = [];
            }
            delete this.replaying;
            this.fireChanged();
        } else {
            this.logInfo("Nothing to undo", "editModeUndoLog");
        }
    },

    undoTo : function (timestamp) {
        if (!this.keepUndoLog) {
            this.logWarn("Attempt to perform undoTo operation while undoLog is disabled");
            return;
        }
        if (!this._undoLog) return;

        do {
            var lastAction = this._undoLog.last();
            if (lastAction) this.undo();
        } while (lastAction && lastAction.timestamp != timestamp);
    },

    //> @method editContext.redo()
    // Execute the first action on the redo stack. Moves action to undo stack.
    // @visibility editModeUndoRedo
    //<
    redo : function () {
        if (!this.keepUndoLog) {
            this.logWarn("Attempt to perform redo operation while undoLog is disabled");
            return;
        }
        if (!this._redoLog) {
            this.logInfo("RedoLog is empty", "editModeUndoLog");
            return;
        }

        var action = this._redoLog.pop();
        if (action) {
            this.replaying = true;
            if (this.performAction(action) != false) {
                this._undoLog.add(action);
            } else {
                // once an action is reached that cannot be redone the remaining
                // redo actions are invalid. The undo log is still valid.
                this._redoLog = [];
            }
            delete this.replaying;
            this.fireChanged();
        } else {
            this.logInfo("Nothing to redo", "editModeUndoLog");
        }
    },

    redoTo : function (timestamp) {
        if (!this.keepUndoLog) {
            this.logWarn("Attempt to perform redoTo operation while undoLog is disabled");
            return;
        }
        if (!this._redoLog) return;

        do {
            var lastAction = this._redoLog.last();
            if (lastAction) this.redo();
        } while (lastAction && lastAction.timestamp != timestamp);
    },

    //> @method editContext.resetUndoLog()
    // Resets the undo and redo logs removing all saved actions.
    // @visibility editModeUndoRedo
    //<
    resetUndoLog : function () {
        if ((this._undoLog && this._undoLog.length > 0) || (this._redoLog && this._redoLog.length > 0)) {
            this.logInfo("UndoLog reset", "editModeUndoLog");
        }
        this._undoLog = [];
        this._redoLog = [];
        if (this.keepUndoLog) this.fireChanged();
    },

    //> @method editContext.getUndoLogDescriptions()
    // Returns list of descriptions for undo log entries. By providing
    // <code>cutoffTimeStamp</code> only entries newer than the timestamp are returned.
    //
    // @param [cutoffTimestamp] (int) timestamp to limit results
    // @return (Array) list of undo entries
    // @visibility editModeUndoRedo
    //<
    getUndoLogDescriptions : function (cutoffTimestamp) {
        var undoLog = this._undoLog,
            descriptions = []
        ;
        if (undoLog) {
            for (var i = 0; i < undoLog.length; i++) {
                var action = undoLog[i];
                if (cutoffTimestamp && action.timestamp < cutoffTimestamp) continue;
                descriptions.add(action.description);
            }
        }
        return descriptions;
    },

    //> @method editContext.getCombinedUndoLogDescriptions()
    // Returns combined descriptions for undo log entries. By providing
    // <code>cutoffTimeStamp</code> only entries newer than the timestamp are returned.
    //
    // @param [cutoffTimestamp] (int) timestamp to limit results
    // @return (String) combined description of undo entries
    // @visibility editModeUndoRedo
    //<
    getCombinedUndoLogDescriptions : function (cutoffTimestamp) {
        var undoLog = this._undoLog,
            actions = []
        ;
        if (!undoLog) return null;

        // Build list of applicable action copies
        for (var i = 0; i < undoLog.length; i++) {
            var action = undoLog[i];
            if (cutoffTimestamp && action.timestamp < cutoffTimestamp) continue;
            actions.add(isc.shallowClone(action));
        }

        var lastAction,
            actionsToRemove = []
        ;
        for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            if (action == null) continue;
            if (lastAction &&
                action.actionName == "addNode" && 
                lastAction.actionName == "addNode" && lastAction.editNode.type == "Tab" &&
                lastAction.editNode == action.parentNode)
            {
                // Tab pane added to tab 
                // Ignore this auto-added pane so back-to-back tab adds can be consolidated
                actionsToRemove.add(action);
            } else if (lastAction &&
                action.actionName == "addNode" && 
                lastAction.actionName == "addNode" &&
                (lastAction.editNode.type == "Window" ||
                    lastAction.editNode.type == "ModalWindow" ||
                    lastAction.editNode.type == "InlineWindow") &&
                lastAction.editNode == action.parentNode &&
                (action.editNode.type == "WindowHeaderIcon" ||
                    action.editNode.type == "WindowHeaderLabel" ||
                    action.editNode.type == "WindowMinimizeButton" ||
                    action.editNode.type == "WindowMaximizeButton" ||
                    action.editNode.type == "WindowCloseButton" ||
                    action.editNode.type == "WindowFooterSpacer" ||
                    action.editNode.type == "WindowResizer"))
            {
                // Window components added along with the Window. Don't detail these in the
                // combinded undoLog descriptions.
                actionsToRemove.add(action);
                // process next action immediately without updating lastAction
                continue;
            }
            lastAction = action;
        }
        if (actionsToRemove.length > 0) actions.removeList(actionsToRemove);

        do {
            var modified = false,
                lastAction = null
            ;
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                if (action == null) continue;

                if (lastAction && lastAction.targetComponent == action.targetComponent &&
                    lastAction.actionName == "removeNode" && action.actionName == "addNode" &&
                    lastAction.parentNode == action.parentNode &&
                    lastAction.index != action.index)
                {
                    // back-to-back removeNode/addNode for the same component with different
                    // indexes: this is a reorder.
                    var editNode = lastAction.editNode,
                        idDesc = this.getEditNodeIDDescription(editNode),
                        parentNode = lastAction.parentNode,
                        parentIdDesc = this.getEditNodeIDDescription(parentNode)
                    ;
                    lastAction.description = "Reordered " + idDesc + " in " + parentIdDesc;

                    actions[i] = null;
                    modified = true;
                } else if (lastAction &&
                    action.actionName == "addNode" && isc.isA.DataSource(action.targetComponent) &&
                    lastAction.actionName == "addNode" && isc.isA.DataBoundComponent(lastAction.targetComponent))
                {
                    // Added DBC and assigned DS
                    var editNode = lastAction.editNode,
                        type = editNode.type || editNode.className,
                        typeDesc = this.getTitleForType(type),
                        idDesc = this.getEditNodeIDDescription(editNode),
                        parentNode = lastAction.parentNode,
                        parentType = (parentNode ? parentNode.type || parentNode.className : null),
                        parentTypeDesc = (parentNode ? this.getTitleForType(parentType) : null),
                        parentIdDesc = this.getEditNodeIDDescription(parentNode),
                        newEditNode = action.editNode,
                        newIdDesc = this.getEditNodeIDDescription(newEditNode)
                    ;
                    lastAction.description = "Dropped " + typeDesc + " '" + idDesc + "' into " +
                        parentTypeDesc + " '" + parentIdDesc + "' and bound to '" +
                        newIdDesc + "' DataSource";

                    actions[i] = null;
                    modified = true;
                } else if (lastAction &&
                    action.actionName == "addNode" && !isc.isA.Class(action.targetComponent) &&
                    lastAction.actionName == "addNode" && !isc.isA.Class(lastAction.targetComponent) &&
                    lastAction.parentNode == action.parentNode)
                {
                    // Adding multiple fields (not real classes)
                    // What about MenuItems?

                    // There could be more than two back-to-back field additions. Pick up all
                    // of them now.
                    var fieldAdds = [];
                    for (var j = i-1; j < actions.length; j++) {
                        var nextAction = actions[j];
                        if (nextAction != null) {
                            if (nextAction.actionName == "addNode" &&
                                !isc.isA.Class(nextAction.targetComponent) &&
                                lastAction.parentNode == nextAction.parentNode)
                            {
                                fieldAdds.add(nextAction);
                                if (nextAction != lastAction) actions[j] = null;
                            } else {
                                // no more sequential matches to check
                                break;
                            }
                        }
                    }

                    var editNode = lastAction.editNode,
                        type = editNode.type || editNode.className,
                        typeDesc = this.getTitleForType(type),
                        idDesc = this.getEditNodeIDDescription(editNode)
                    ;

                    var buffer = isc.SB.create();
                    buffer.append("Added ", typeDesc, "s ");
                    for (var j = 0; j < fieldAdds.length; j++) {
                        var add = fieldAdds[j];
                        if (buffer.getArray().length > 3) {
                            if (j == fieldAdds.length-1) buffer.append(" and ");
                            else buffer.append(", ");
                        }
                        var newEditNode = add.editNode,
                            newIdDesc = this.getEditNodeIDDescription(newEditNode)
                        ;
                        buffer.append(newIdDesc);
                    }
                    var parentNode = lastAction.parentNode,
                        parentType = (parentNode ? parentNode.type || parentNode.className : null),
                        parentTypeDesc = (parentNode ? this.getTitleForType(parentType) : null),
                        parentIdDesc = this.getEditNodeIDDescription(parentNode)
                    ;
                    buffer.append(" to ", parentTypeDesc, " '", parentIdDesc, "'");

                    lastAction.description = buffer.toString();
                    buffer.release();

                    modified = true;
                } else if (lastAction && lastAction.targetComponent == action.targetComponent &&
                    lastAction.actionName == "setNodeProperties" && action.actionName == "setNodeProperties")
                {
                    // Setting node properties on the same component

                    // There could be more than two back-to-back field changes. Pick up all
                    // of them now.
                    var propertyChanges = [];
                    for (var j = i-1; j < actions.length; j++) {
                        var nextAction = actions[j];
                        if (nextAction != null) {
                            if (nextAction.actionName == "setNodeProperties" &&
                                nextAction.targetComponent == lastAction.targetComponent)
                            {
                                propertyChanges.add(nextAction);
                                if (nextAction != lastAction) actions[j] = null;
                            } else {
                                // no more sequential matches to check
                                break;
                            }
                        }
                    }

                    var editNode = lastAction.editNode,
                        type = editNode.type || editNode.className,
                        typeDesc = this.getTitleForType(type),
                        idDesc = this.getEditNodeIDDescription(editNode),
                        parentNode = lastAction.parentNode,
                        parentType = (parentNode ? parentNode.type || parentNode.className : null),
                        parentTypeDesc = (parentNode ? this.getTitleForType(parentType) : null),
                        parentIdDesc = this.getEditNodeIDDescription(parentNode)
                    ;

                    // Each action could target multiple properties. Combine them so the full
                    // number is known for documenting
                    var properties = {};
                    for (var j = 0; j < propertyChanges.length; j++) {
                        var change = propertyChanges[j];
                        isc.addProperties(properties, change.properties);
                    }

                    var keys = isc.getKeys(properties),
                        buffer = isc.SB.create()
                    ;
                    buffer.append("Set ", (keys.length > 1 ? "properties" : "property"), " of ", typeDesc, " '", idDesc, "': ");

                    for (var j = 0; j < keys.length; j++) {
                        var key = keys[j],
                            value = properties[key]
                        ;
                        if (buffer.getArray().length > 7) {
                            if (j == keys.length-1) buffer.append(" and ");
                            else buffer.append(", ");
                        }
                        buffer.append(key, " to '", value, "'");
                    }

                    lastAction.description = buffer.toString();
                    buffer.release();

                    modified = true;
                }

                lastAction = action;
            }
        } while (modified);

        var buffer = isc.SB.create();
        for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            if (action) {
                if (buffer.getArray().length > 0) buffer.append("<br>");
                buffer.append(action.description);
            }
        }
        var description = buffer.toString();
        buffer.release();
        return description;
    },

    fireChanged : function () {
        if (this.undoLogChanged) this.fireCallback("undoLogChanged");
    },

    createAction : function (actionName, args) {
        var actionClass = this.getActionClass(actionName);
        if (!actionClass) {
            this.logInfo("Action " + actionName + " not supported in undo log");
            return;
        }

        var argsArray = [];
        for (var i = 0; i < args.length; i++) {
            argsArray[i] = args[i];
        }

        var action = actionClass.create({ editContext: this });
        var result = action.save(argsArray);
        if (result == false) action = null;

        return action;
    },

    performAction : function (action) {
        if (!action.execute || action.execute() == false) {
            this.logWarn("Action " + action.actionName + " cannot be redone");
            // Explicit false return triggers clearing redo log because additional
            // redo actions are no longer valid
            return false;
        }
    },

    reverseAction : function (action) {
        if (!action.undo || action.undo() == false) {
            this.logWarn("Action " + action.actionName + " cannot be undone");
            // Explicit false return triggers clearing undo log because previous
            // actions are no longer valid
            return false;
        }
    },

    getActionClass : function (actionName) {
        return isc.EditContext.actionClasses[actionName];
    }
});

isc.EditContext.registerStringMethods({
    //> @method editContext.inlineEditorShowing()
    // Notification method fired when an inline title or value editor is shown or closed
    // for a component in the designer pane.
    // @param field (FormItem) the field within the inline editor when showing.
    //                         null if the editor is closed.
    // @param type (String) the type of editor showing: "title" or "value"
    // @visibility external
    //<
    inlineEditorShowing : "field,type",

    //> @method editContext.undoLogChanged()
    // Notification method fired when undo log changes
    // @visibility editModeUndoRedo
    //<
    undoLogChanged : ""
});

isc.ClassFactory.defineClass("EditModeAction").addProperties({

    //> @attr editModeAction.timestamp  (int : null : IR)
    // Timestamp assigned when action is created.
    //<

    //> @attr editModeAction.editContext  (EditContext : null : IR)
    // EditContext holding this action.
    //<

    //> @attr editModeAction.description  (String : null : IR)
    // Text description of this action.
    //<

    //> @attr editModeAction.editNode  (EditNode : null : IR)
    // EditNode targeted by this action.
    //<

    //> @attr editModeAction.targetComponent  (Object : null : IR)
    // Target component for this action.
    //<

    init : function () {
        this.Super("init", arguments);
        this.timestamp = isc.timeStamp();
    }
});

isc.ClassFactory.defineClass("EditModeAddNodeAction", "EditModeAction").addProperties({
    actionName: "addNode",

    save : function (args) {
        this.arguments = args;

        // Extract arguments for easy reference
        this.editNode = args[0];
        this.parentNode = args[1];
        this.index = args[2];
        this.parentProperty = args[3];
        this.skipParentComponentAdd = args[4];
        this.forceSingularFieldReplace = args[5];
        this.skipNodeAddedNotification = args[6];

        this.targetComponent = this.editNode.liveObject;
        this.description = this.getDescription();

        this.logSave();
    },

    execute : function () {
        this.logExecute();
        this.editContext.fireCallback(this.actionName, null, this.arguments);
    },

    undo : function () {
        this.logUndo();
        this.editContext.removeNode(this.editNode, this.skipParentComponentAdd);
    },

    getDescription : function () {
        var editContext = this.editContext,
            rootNode = editContext.getRootEditNode(),
            editNode = this.editNode,
            type = editNode.type || editNode.className,
            typeDesc = editContext.getTitleForType(type),
            idDesc = editContext.getEditNodeIDDescription(editNode),
            parentNode = this.parentNode,
            parentType = (parentNode ? parentNode.type || parentNode.className : null),
            parentTypeDesc = (parentNode ? editContext.getTitleForType(parentType) : null),
            parentIdDesc = (parentNode ? editContext.getEditNodeIDDescription(parentNode) : null),
            description = "Added " + typeDesc + " '" + idDesc + "'" +
                (parentNode && parentNode != rootNode ? " to " + parentTypeDesc + " '" + parentIdDesc + "'" : " as global")
        ;
        return description;
    },

    logSave : function () {
        if (this.logIsInfoEnabled("editModeUndoLog")) {
            var actionDetail = this.getLogActionDetail();
            this.logInfo(this.actionName + " action recorded in undoLog: " + actionDetail, "editModeUndoLog");
        }
    },

    logExecute : function () {
        if (this.logIsInfoEnabled("editModeUndoLog")) {
            var actionDetail = this.getLogActionDetail();
            this.logInfo("Redoing " + this.actionName + ": " + actionDetail, "editModeUndoLog");
        }
    },

    logUndo : function () {
        if (this.logIsInfoEnabled("editModeUndoLog")) {
            var actionDetail = this.getLogActionDetail();
            this.logInfo("Undoing " + this.actionName + ": " + actionDetail, "editModeUndoLog");
        }
    },

    getLogActionDetail : function () {
        var editContext = this.editContext,
            rootNode = editContext.getRootEditNode(),
            editNode = this.editNode,
            type = editNode.type || editNode.className,
            typeDesc = editContext.getTitleForType(type),
            idDesc = editContext.getEditNodeIDDescription(editNode),
            parentNode = this.parentNode,
            parentType = (parentNode ? parentNode.type || parentNode.className : null),
            parentTypeDesc = (parentNode ? editContext.getTitleForType(parentType) : null),
            parentIdDesc = (parentNode ? editContext.getEditNodeIDDescription(parentNode) : null),
            index = this.index,
            description = typeDesc + " '" + idDesc + "' added" +
                (parentNode && parentNode != rootNode
                    ? " to " + parentTypeDesc + " '" + parentIdDesc + "'" + (index != null ? " @ " + index : "")
                    : " as global")
        ;
        return description;
    }
});

isc.ClassFactory.defineClass("EditModeRemoveNodeAction", "EditModeAction").addProperties({
    actionName: "removeNode",

    save : function (args) {
        this.arguments = args;

        // Extract arguments for easy reference
        this.editNode = args[0];
        this.skipLiveRemoval = args[1];

        var editNode = this.editNode;

        // destroyNode flags an editNode to skip recording the wrapped removeNode call.
        // If this is the wrapped action ignore it.
        if (editNode._skipRecordRemoveNode) {
            delete editNode._skipRecordRemoveNode;
            return false;
        }

        var editContext = this.editContext,
            editTree = editContext.getEditNodeTree()
        ;
        this.parentNode = editContext.getParentNode(editNode);
        this.index = editTree.getChildren(this.parentNode).findIndex(editNode);
        this.targetComponent = editNode.liveObject;
        this.description = this.getDescription();

        this.logSave();
    },

    execute : function () {
        this.logExecute();
       this.editContext.fireCallback(this.actionName, null, this.arguments);
    },

    undo : function () {
        this.logUndo();
        var parentProperty = (this.editNode.defaults ? this.editNode.defaults.parentProperty : null); 
        this.editContext.addNode(this.editNode, this.parentNode, this.index, parentProperty, this.skipLiveRemoval, null, true);
    },

    logSave : function () {
        var actionDetail = this.getLogActionDetail();
        this.logInfo(this.actionName + " action recorded in undoLog: " + actionDetail, "editModeUndoLog");
    },

    logExecute : function () {
        var actionDetail = this.getLogActionDetail();
        this.logInfo("Redoing " + this.actionName + ": " + actionDetail, "editModeUndoLog");
    },

    logUndo : function () {
        var actionDetail = this.getLogActionDetail();
        this.logInfo("Undoing " + this.actionName + ": " + actionDetail, "editModeUndoLog");
    },

    getDescription : function () {
        var editContext = this.editContext,
            rootNode = editContext.getRootEditNode(),
            editNode = this.editNode,
            type = editNode.type || editNode.className,
            typeDesc = editContext.getTitleForType(type),
            idDesc = editContext.getEditNodeIDDescription(editNode),
            parentNode = this.parentNode,
            parentType = (parentNode ? parentNode.type || parentNode.className : null),
            parentTypeDesc = (parentNode ? editContext.getTitleForType(parentType) : null),
            parentIdDesc = (parentNode ? editContext.getEditNodeIDDescription(parentNode) : null),
            description = "Removed " + typeDesc + " '" + idDesc + "'" +
                (parentNode && parentNode != rootNode ? " from " + parentTypeDesc + " '" + parentIdDesc + "'" : " as global")
        ;
        return description;
    },

    getLogActionDetail : function () {
        var editContext = this.editContext,
            rootNode = editContext.getRootEditNode(),
            editNode = this.editNode,
            type = editNode.type || editNode.className,
            typeDesc = editContext.getTitleForType(type),
            idDesc = editContext.getEditNodeIDDescription(editNode),
            parentNode = this.parentNode,
            parentType = (parentNode ? parentNode.type || parentNode.className : null),
            parentTypeDesc = (parentNode ? editContext.getTitleForType(parentType) : null),
            parentIdDesc = (parentNode ? editContext.getEditNodeIDDescription(parentNode) : null),
            description = typeDesc + " '" + idDesc + "' removed" +
                (parentNode && parentNode != rootNode ? " from " + parentTypeDesc + " '" + parentIdDesc + "'" : " as global")
        ;
        return description;
    }
});

isc.ClassFactory.defineClass("EditModeDestroyNodeAction", "EditModeRemoveNodeAction").addProperties({
    actionName: "destroyNode",

    save : function (args) {
        this.Super("save", arguments);

        this.paletteNode = this.editContext.makePaletteNode(this.editNode);

        // A removeNode call is immediately made in destroyNode. That action should not
        // be recorded since this action wraps it. Set a flag to ignore it.
        this.editNode._skipRecordRemoveNode = true;
    },

    execute : function () {
        this.logExecute();
        // Use the original arguments as a template for the call
        var args = isc.shallowClone(this.arguments);
        args[0] = this.editNode;
        this.editContext[this.actionName].apply(this.editContext, args);
    },

    undo : function () {
        this.logUndo();
        var editNode = this.editContext.makeEditNode(this.paletteNode),
            parentProperty = (editNode.defaults ? editNode.defaults.parentProperty : null)
        ; 
        // Save new editNode to be used for redo
        this.editNode = this.editContext.addNode(editNode, this.parentNode, this.index, parentProperty, null, null, true);
    }
});

isc.ClassFactory.defineClass("EditModeSetNodePropertiesAction", "EditModeAction").addProperties({
    actionName: "setNodeProperties",

    save : function (args) {
        this.arguments = args;

        // Extract arguments for easy reference
        this.editNode = args[0];
        this.properties = args[1];
        this.skipLiveObjectUpdate = args[2];

        var properties = this.properties,
            oldValues = {}
        ;
        if (properties) {
            var defaults = this.editNode.defaults,
                undef
            ;
            if (defaults) {
                for (var property in properties) {
                    if (properties[property] != undef) oldValues[property] = defaults[property];
                }
            }
        }
        this.oldValues = oldValues;

        this.targetComponent = this.editNode.liveObject;
        this.description = this.getDescription();

        this.logSave();
    },

    execute : function () {
        this.logExecute();
        this.editContext.fireCallback(this.actionName, null, this.arguments);
    },

    undo : function () {
        this.logUndo();

        // Scan through oldValues to split update into changes and removes -
        // Values have to be removed by calling removeNodeProperties.
        var editContext = this.editContext,
            oldValues = this.oldValues,
            updateProperties = {},
            removeProperties = {},
            undef
        ;
        for (var property in oldValues) {
            if (oldValues[property] == undef) removeProperties[property] = null;
            else updateProperties[property] = oldValues[property];
        }
        if (!isc.isA.emptyObject(updateProperties)) {
            // Use the original arguments as a template for the call
            var args = isc.shallowClone(this.arguments);
            args[1] = updateProperties;
            editContext[this.actionName].apply(editContext, args);
        }
        if (!isc.isA.emptyObject(removeProperties)) {
            editContext.removeNodeProperties(this.editNode, isc.getKeys(removeProperties));
            // removeNodeProperties does NOT update the component
            if (!this.skipLiveObjectUpdate) {
                // While setting the properties to null that didn't exist in oldValues
                // is not always correct the hope is that a null value will restore
                // the property back to the original default.
                editContext.applyPropertiesToComponent(this.editNode, removeProperties);
            }
        }
    },

    getDescription : function () {
        var editContext = this.editContext,
            editNode = this.editNode,
            type = editNode.type || editNode.className,
            typeDesc = editContext.getTitleForType(type),
            idDesc = editContext.getEditNodeIDDescription(editNode),
            properties = this.properties || {},
            keys = isc.getKeys(properties),
            description
        ;
        if (keys.length == 1) {
            description = "Property '" + keys[0] + "' changed for " + typeDesc + " '" + idDesc + "'";
        } else {
            var propertyNames = keys.slice(0, keys.length-1).join(", ") + " and " + keys[keys.length-1];
            description = "Properties '" + propertyNames + "' changed for " + typeDesc + " '" + idDesc + "'";
        }
        return description;
    },

    logSave : function () {
        this.logInfo(this.actionName + " action recorded in undoLog for " + 
            this.editNode.ID + "/" + this.editNode.type + ": " + this.echo(this.properties), "editModeUndoLog");
    },

    logExecute : function () {
        this.logInfo("Redoing " + this.actionName + " for " + 
            this.editNode.ID + "/" + this.editNode.type + ": " + this.echo(this.properties), "editModeUndoLog");
    },

    logUndo : function () {
        this.logInfo("Undoing " + this.actionName + " for " + 
            this.editNode.ID + "/" + this.editNode.type + ": " + this.echo(this.properties), "editModeUndoLog");
    }
});

isc.ClassFactory.defineClass("EditModeRemoveNodePropertiesAction", "EditModeAction").addProperties({
    actionName: "removeNodeProperties",

    save : function (args) {
        this.arguments = args;

        // Extract arguments for easy reference
        this.editNode = args[0];
        this.properties = args[1];

        var properties = this.properties,
            oldValues = {}
        ;
        if (properties) {
            if (!isc.isAn.Array(properties)) properties = [properties];

            var defaults = this.editNode.defaults,
                undef
            ;
            if (defaults) {
                properties.map (function (property) {
                    var value = defaults[property];
                    if (value != undef) oldValues[property] = value;
                });
            }
        }
        this.oldValues = oldValues;

        this.targetComponent = this.editNode.liveObject;
        this.description = this.getDescription();

        this.logSave();
    },

    execute : function () {
        this.logExecute();
        this.editContext.fireCallback(this.actionName, null, this.arguments);
    },

    undo : function () {
        this.logUndo();

        var oldValues = this.oldValues;
        if (!isc.isA.emptyObject(oldValues)) {
            this.editContext.setNodeProperties(this.editNode, oldValues);
        }
    },

    getDescription : function () {
        var editContext = this.editContext,
            editNode = this.editNode,
            type = editNode.type || editNode.className,
            typeDesc = editContext.getTitleForType(type),
            idDesc = editContext.getEditNodeIDDescription(editNode),
            properties = this.properties,
            description
        ;
        if (!isc.isAn.Array(properties)) properties = [properties];

        if (properties.length == 1) {
            description = "Property '" + properties[0] + "' removed from " + typeDesc + " '" + idDesc + "'";
        } else if (properties.length > 1) {
            var propertyNames = properties.slice(0, properties.length-1).join(", ") + " and " + properties[properties.length-1];
            description = "Properties '" + propertyNames + "' removed from " + typeDesc + " '" + idDesc + "'";
        }
        return description;
    },

    logSave : function () {
        this.logInfo(this.actionName + " action recorded in undoLog for " + 
            this.editNode.ID + "/" + this.editNode.type + ": " + this.echo(this.properties), "editModeUndoLog");
    },

    logExecute : function () {
        this.logInfo("Redoing " + this.actionName + " for " + 
            this.editNode.ID + "/" + this.editNode.type + ": " + this.echo(this.properties), "editModeUndoLog");
    },

    logUndo : function () {
        this.logInfo("Undoing " + this.actionName + " for " + 
            this.editNode.ID + "/" + this.editNode.type + ": " + this.echo(this.properties), "editModeUndoLog");
    }
});

isc.EditContext.addClassMethods({
    getMissingRequiredProperties : function (node) {
        // If paletteNode/editNode specifies a list of required properties that must exist
        // before the live component can be created, return a comma-separated list of any
        // properties that are missing
        var requiredProperties = node.requiredProperties,
            missingProperties
        ;
        if (!requiredProperties && node.defaults && node.defaults.placeholderDefaults) {
            requiredProperties = node.defaults.placeholderDefaults.requiredProperties;
        }
        if (requiredProperties) {
            requiredProperties = requiredProperties.split(",").map(function(prop) { return prop.trim(); });
            missingProperties = [];

            var defaults = node.defaults || {};
            for (var i = 0; i < requiredProperties.length; i++) {
                if (defaults[requiredProperties[i]] == null) {
                    missingProperties.add(requiredProperties[i]);
                }
            }
        }
        return (missingProperties && missingProperties.length > 0 ? missingProperties.join(",") : null);
    },

    // Mapping of action names to action classes. Used to record actions.
    actionClasses : {
        "addNode": isc.EditModeAddNodeAction,
        "removeNode": isc.EditModeRemoveNodeAction,
        "destroyNode": isc.EditModeDestroyNodeAction,
        "setNodeProperties": isc.EditModeSetNodePropertiesAction
    }
});

//> @groupDef devTools
// The Dashboards &amp; Tools framework enables you to build interfaces in which a set of UI
// components can be edited by end users, saved and later restored.
// <P>
// This includes interfaces such as:
// <ul> 
// <li> <b>Dashboards</b>: where a library of possible widgets can be created & configured,
//      arranged into freehand or portal-style layouts, then stored for future use and
//      shared with other users
// <li> <b>Diagramming &amp; Flowchart tools</b>: tools similar to Visio&trade; which allow users
//      to use shapes and connectors to create a flowchart or diagram representing a workflow,
//      equipment or locations being monitored, a storyboard, or any similar interactive &amp;
//      modifiable visualization. 
// <li> <b>Form Builders &amp; Development Tools</b>: tools which enable end users to create
//      new forms or new screens, define interactive behaviors and rules, and add the screens
//      to an application on the fly
// </ul>
// <P>
// <h3>Overview</h3>
// <p>
// Dashboards &amp; Tools provides a pattern for end user creation and configuration of UI
// components which enables the framework to store and re-create components exactly as the user
// configured them.
// <p>
// Unlike simple serialization, Dashboards &amp; Tools is designed to capture <i>only</i>
// UI state created directly by end user actions, and not transient or derived state
// (for more on this behavior and how it is different from serialization, see "Stored
// vs Derived State" below).
// <p>
// To achieve this, user-editable components are created via a special pattern (not just the
// usual 
// <smartclient><code>isc.SomeComponent.create()</code>),</smartclient>
// <smartgwt><code>new SomeComponent()</code>),</smartgwt>
// and changes to user-editable components that are meant to be saved are likewise applied via
// special APIs (not just direct calls to <code>someComponent.setSomething()</code>).
// <p>
// The main components and behaviors involved in Dashboards &amp; Tools are covered in brief
// below - each of these points is covered in more detail in further sections:
// <p>
// <ul>
// <li> User-editable components are created by +link{Palette,Palettes}.  <code>Palettes</code>
//      create components from +link{PaletteNode,PaletteNodes}, which are +link{Record,data records}
//      containing the component's class and default settings.  Some <code>Palettes</code>
//      provide an end user UI for creating components (eg drag a node from a Tree).
// <li> An editable component created by a <code>Palette</code> is represented by an
//      +link{EditNode}, which tracks the created component along with the data necessary
//      to save and re-create the component.
// <li> An +link{EditContext} manages a list or +link{Tree} of +link{EditNode,EditNodes}, and provides
//      APIs for serializing and restoring <code>EditNodes</code> to and from XML and JSON, and
//      updating the nodes as users make changes.
// <li> Many UI components have +link{canvas.setEditMode,"edit mode"} behaviors.  When "edit
//      mode" is enabled, when an end user interacts with the component, the component will
//      save changes to its +link{EditNode} or to child +link{EditNode,EditNodes} in the
//      +link{EditContext}.  For example, +link{PortalLayout} can track and persist changes to
//      the placement and size of portlets made by end users.  <code>EditMode</code> behaviors
//      are implemented by +link{EditProxy,EditProxies}, and different edit mode behaviors can
//      be turned on and off for different kinds of tools.
// </ul>
// A simple tool based on the Dashboards &amp; Tools framework would typically consist of:
// <p>
// <ul>
// <li> one or more <code>Palettes</code> showing components that the user can create
// <li> a main editing area where you can drag things from a +link{Palette} to create them.  The
//      editing area is just an ordinary UI component that has been placed into "edit mode"
//      and provided with an <code>EditContext</code>.  Depending on the type of tool, the main
//      editing area might be a +link{DrawPane} (for diagrams), a +link{DynamicForm} (for a
//      form builder) or various other widgets.
// <li> Buttons, Menus and pop-up dialogs that act on the currently selected widget.
//      Dashboards &amp; Tools has +link{editProxy.canSelectChildren,built-in UI} for
//      selecting one or more of the components being edited.
//      +link{EditContext.getSelectedEditNode()} provides the current edit node, and
//      +link{EditContext.setNodeProperties()} lets you manipulate its persisted state.
// <li> Buttons, Menus and pop-up dialogs providing the ability to load or save.  These would
//      use APIs on <code>EditContext</code> to 
//      +link{editContext.serializeEditNodes,obtain XML or JSON Strings} representing the
//      data to be saved, as well as to 
//      +link{editContext.addPaletteNodesFromXML,restore saved state} from such Strings.
//      DataSources can be used to store whatever is being edited: the serialized form is just
//      an XML or JSON String, so it can be stored as an ordinary +link{DataSourceField} value. 
// </ul>
// <p>
// <h3>Creating editable components: <code>Palettes</code></h3>
// <p>
// User-editable components are created by +link{Palette,Palettes}.  <code>Palettes</code>
// create components from +link{PaletteNode,PaletteNodes}, which are +link{Record,data records}
// containing the component's class and default settings.
// <p>
// Most types of <code>palettes</code> provide a UI for an end user to create components from
// <code>paletteNodes</code>.  For example, a +link{TreePalette} presents a hierarchical
// set of <code>paletteNodes</code> as a tree, and allows end users to drag nodes out in order
// to create components.  All <code>palettes</code> also support
// +link{palette.makeEditNode(),programmatic creation of components} from
// <code>paletteNodes</code>.
// <p>
// <code>paletteNodes</code> can be programmatically provided to a <code>Palette</code>, or, 
// <code>Palettes</code> that are derived from
// +link{DataBoundComponent,DataBoundComponents} can load <code>paletteNodes</code> from a
// +link{DataSource}.
// <p>
// When a component is created from a <code>paletteNode</code>, an +link{EditNode} is created
// that tracks the +link{editNode.liveObject,live component} and the state needed to re-create
// it, called the +link{editNode.defaults,defaults}.  
// <p>
// <h3>EditContexts &amp; EditProxies</h3>
// <p>
// An +link{EditContext} manages a +link{Tree} of +link{EditNode,EditNodes}, and provides APIs for
// serializing and restoring <code>EditNodes</code> and updating the tree of nodes.
// <p>
// When an <code>EditNode</code> is added to an EditContext, typically it is immediately placed
// into +link{Canvas.setEditMode,"Edit Mode"} (see +link{editContext.autoEditNewNodes} for how
// this can be controlled).  In Edit Mode, components introduce special behaviors, such as the
// ability to directly edit the titles of +link{Tab}s in a +link{TabSet} by double-clicking, or
// support for dragging new +link{FormItem}s into a +link{DynamicForm}.  Changes made while a
// component is in Edit Mode are saved to the component's +link{EditNode}, in
// +link{EditNode.defaults}. 
// <p>
// Each component that has <code>editMode</code> features has a corresponding +link{EditProxy}
// that implements those features.  A component's <code>EditProxy</code> is automatically
// created when a component +link{canvas.setEditMode,goes into edit mode}, and overrides the
// normal behavior of the component.  By configuring the <code>EditProxy</code> for a
// component, you configure what behaviors the component will have when in edit mode, and which
// specific actions on the component will cause changes to be saved to its <code>EditNode</code>.
// <p>
// For example, +link{CanvasEditProxy} has features for 
// +link{editProxy.persistCoordinates,saving coordinates as child widgets are dragged}, and
// +link{GridEditProxy} has features for persisting 
// +link{gridEditProxy.saveFieldVisibility,field visibility} when end users show and hide
// fields.
// <p> 
// You can configure which EditProxy behaviors are active via
// +link{paletteNode.editProxyProperties} and +link{editNode.editProxyProperties}, and via the
// +link{canvas.editProxy,editProxy AutoChild}.
// <p>
// <h3>EditContext &amp; Trees of EditNodes</h3>
// <p>
// The <code>EditContext</code> has the capability to manage a <code>Tree</code> of
// <code>EditNodes</code> in order to enable tools that create a hierarchy of SmartClient
// components.  When you use +link{editContext.addNode()} and add a new EditNode underneath
// another EditNode, the EditContext will automatically try to determine how the parent and
// child are related and actually call APIs on the widgets to establish a relationship, such as
// a Tab being added to a TabSet, or a FormItem being added to a DynamicForm.  The
// EditContext uses the same approach as is used for Reify Drag and Drop - see
// +link{group:reify,Reify overview} for details.
// <!-- Note that the system for discovering setter/adder methods used by the EditContext is
// not actually specific to visual widgets as implied above.  You could use an EditContext to
// manage a hierarchy of non-visual instances of SmartClient classes which directly subclass
// isc.Class, for example, you could have an interface for constructing a nested formula by
// dragging and dropping mathematical operators into a tree, where each operator is represented
// by a SmartClient Class and with a corresponding component schema.  The final formula might
// then be rendered in MathML or similar, completely separately from the SmartClient drawing
// system.  We won't try to document this yet, at least not without a sample; it's too advanced
// to explain with prose alone -->
// <p>
// Note that many if not most kinds of tools use only a flat list of EditNodes - for example,
// in a collage editor, photos may sometimes be stacked on top of each other, but a
// parent/child relationship in the sense of +link{canvas.children} is not established by doing
// so.  Likewise, although the +explorerExample{mockupEditor,Mockup Editor sample} allows end
// users to create mockups using SmartClient components, the components never truly become
// children of other components.  Instead, as is typical of most mockup tools, hierarchy is
// achieved visually by simply placing a component on top of another and within its bounding
// rectangle.  
// <p>
// Most types of tools use a flat list of <code>EditNodes</code> - generally speaking you will
// only use the hierarchy management features of <code>Editcontext</code> if you are creating a
// tool that actually allows end users to build functioning SmartClient screens, such as the
// +explorerExample{formBuilder,Form Builder example}.  For such applications, use 
// +link{editContext.allowNestedDrops} to enable drag and drop interactions that will allow end
// users to place components inside of other components.
// <p>
// <h3>Stored vs Derived state</h3>
// <p>
// The purpose of having an <code>EditNode</code> for each UI component is to maintain a
// distinction between the current state of the live UI component and the state that should
// be saved.  For example:
// <ul>
// <li> a component may have a current width of 510 pixels when viewed within a tool, but what
// should persist is the configured width of 40% of available space
// <li> a component may have editing behaviors enabled, such as the ability to double-click to
//      edit labels or titles, which should be enabled in the tool but not at runtime
// <li> a tool may allow end users to create a Window, and then drag components into the Window.
//      Every Window automatically creates subcomponents such as a header, but these should not be
//      persisted because they don't represent state created by the end user.  Only the components
//      the end user actually dragged into the Window should be persisted
// <li> an end user may try out the effect of a property change, then abandon it and revert to the
//      default value.  We don't want the temporary change saved, and we don't even want to save
//      the reversion to the default value - nothing about the saved state should be changed
// </ul>
// By being careful to save <i>only intentional changes made by the user</i>:
// <ul>
// <li> the saved state remains minimal in size, and re-creating components from the stored state
//      is more efficient
// <li> the saved state is much easier to edit since it contains only intentional settings, and not
//      generated or derived information
// <li> the stored state is more robust against changes over time and easier to re-use.  When we
//      avoiding spuriously saving default values that the user has not modified, we avoid
//      possible conflicts when a saved UI is deployed to a new version or in a different
//      environment with different defaults
// </ul>
// Specifically, only two things affect the state that will be stored for a given component:
// <ol>
// <li> Features enabled when a component is in EditMode, configured via the component's EditProxy
// <li> Direct calls to +link{EditContext.setNodeProperties()} by application code
// </ol>
// Any other kind of change to the widget is not automatically persisted.
// <P>
// <smartgwt>
// <h3>Deriving default settings for PaletteNodes</h3>
// PaletteNodes contain a set of default settings which define the initial properties for any
// live object created from that PaletteNode.  When you create a PaletteNode directly, you 
// configure these defaults by creating a properties object of the same type as the object 
// represented by the PaletteNode, and passing it to the PalleteNode's
// {@link com.smartgwt.client.tools.PaletteNode#setCanvasDefaults(com.smartgwt.client.widgets.Canvas) setCanvasDefaults()}
// method (PaletteNode also has equivalent <code>setFormItemDefaults()</code> and 
// <code>setDrawItemDefaults()</code> methods).
// <p>
// Sometimes, however, your code does not directly create the PaletteNode itself.  For
// example, when you provide {@link com.smartgwt.client.widgets.tile.TileRecord}s that will be
// used in a {@link com.smartgwt.client.tools.TilePalette}, you provide the PaletteNode 
// defaults on the TileRecords, but your code does not actually create the PaletteNodes.  In 
// this case, you create a properties object as described above, and then you call its 
// {@link com.smartgwt.client.widgets.Canvas#getPaletteDefaults() getPaletteDefaults()}
// method to obtain a Map of properties suitable for specifying PaletteNode defaults.  This 
// code, taken from the +explorerExample{collageEditor,Collage Editor sample}, demonstrates 
// the approach:<pre>
//     Img img = new Img();
//     img.setTitle(title);
//     img.setSrc("stockPhotos/" + photos.get(i));
//     TileRecord record = new TileRecord();
//     record.setAttribute("title", title);
//     record.setAttribute("type", "Img");
//     record.setAttribute("defaults", img.getPaletteDefaults());
// </pre></smartgwt>
// <h3>Module requirements</h3>
// <b>NOTE:</b> you must load the Tools +link{group:loadingOptionalModules,Optional Module} 
// for this framework.
// <P>
// Any tools that work with hierarchies of system components or derivations
// of them will also need the system schema which can be loaded by either of the
// following:
// <P>
// <i>JSP tag:</i> <pre>&lt;script&gt;&lt;isomorphic:loadSystemSchema /&gt;&lt;/script&gt;</pre>
// <P>
// <i>HTML tag:</i> <pre>&lt;SCRIPT SRC="../isomorphic/DataSourceLoader?dataSource=$systemSchema"&gt;&lt;/SCRIPT&gt;</pre>
//
// @title Dashboards & Tools Framework Overview
// @treeLocation Client Reference/Tools
// @visibility external
//<





//> @object PaletteNode
// An object representing a component which the user may create dynamically within an
// application.
// <P>
// A PaletteNode expresses visual properties for how the palette will display it (eg
// +link{paletteNode.title,title}, +link{paletteNode.icon,icon}) as well as instructions for
// creating the component the paletteNode represents (+link{paletteNode.type},
// +link{paletteNode.defaults}).
// <P>
// Various types of palettes (+link{ListPalette}, +link{TreePalette}, +link{MenuPalette},
// +link{TilePalette}) render a PaletteNode in different ways, and allow the user to trigger
// creation in different ways (eg drag and drop, or just click).  All share a common pattern
// for how components are created from palettes.
// <P>
// Note that in a TreePalette, a PaletteNode is essentially a +link{TreeNode} and can have
// properties expected for a TreeNode (eg,
// +link{TreeGrid.customIconDropProperty,showDropIcon}).  Likewise
// a PaletteNode in a MenuPalette can have the properties of a +link{MenuItem}, such as
// +link{MenuItem.enableIf}.
// 
// @treeLocation Client Reference/Tools
// @visibility external
//<



//> @attr paletteNode.icon (SCImgURL : null : IR)
// Icon for this paletteNode.
//
// @visibility external
//<

//> @attr paletteNode.title (String : null : IR)
// Textual title for this paletteNode.
//
// @visibility external
//<

//> @attr paletteNode.type (SCClassName : null : IR)
// +link{SCClassName} this paletteNode creates, for example, "ListGrid".
//
// @visibility external
//<


//> @attr paletteNode.idPrefix (String : null : IR)
// Prefix used to create unique component ID. If not specified, +link{paletteNode.type}
// is used.
//
// @deprecated As of SmartClient version 12.1, deprecated in favor of +link{paletteNode.idName}
// @visibility external
//<

//> @attr paletteNode.idName (String : null : IR)
// Name used to create unique component ID. If not specified, +link{paletteNode.type}
// is used.
// <p>
// Note: idName must follow all rules for a +link{type:Identifier}.
//
// @visibility external
//<

//> @attr paletteNode.defaults (Properties : null : IR)
// Defaults for the component to be created from this palette.  
// <p>
// For example, if +link{paletteNode.type} is "ListGrid", properties valid to pass to
// +link{Class.create,ListGrid.create()}.
// <p>
// Note that event handlers or method overrides cannot be configured as <code>defaults</code>,
// as they cannot be serialized or restored.  Instead, create a subclass that implements the
// desired behaviors, and use that subclass as +link{paletteNode.type}.  
// <smartgwt><p>See also +link{group:reflection} for special concerns when making a GWT subclass
// usable in +link{group:componentXML,Component XML} and 
// +link{group:devTools,Dashboards &amp; Tools} in general.</smartgwt>
//
// @visibility external
//<

//> @attr paletteNode.editProxyProperties (EditProxy Properties : null : IR)
// Properties to be applied to the 
// +link{paletteNode.liveObject,liveObject}.+link{canvas.editProxy,editProxy} when created.
//
// @visibility external
//<

//> @attr paletteNode.editNodeProperties (EditNode Properties : null : IR)
// Properties to be applied to the +link{editNode,editNode} when created.
//
// @visibility external
//<

//> @attr paletteNode.liveObject (Object : null : IR)
// For a paletteNode which should be a "singleton", that is, always provides the exact same
// object (==) rather than a dynamically created copy, provide the singleton object as
// <code>liveObject</code>.
// <P>
// Instead of dynamically creating an object from defaults, the <code>liveObject</code> will
// simply be assigned to +link{editNode.liveObject} for the created editNode.
//
// @visibility external
//<

//> @attr paletteNode.canDuplicate (Boolean : null : IR)
// If set to false, indicates that this node cannot be 
// +link{editProxy.useCopyPasteShortcuts,copy &amp; pasted}, including disallowing calls to
// +link{editContext.makePaletteNode()} for +link{editNode,EditNodes} created from this
// +link{paletteNode,PaletteNode}.
//
// @visibility external
//<

//> @attr paletteNode.recreateOnChange (Boolean : null : IR)
// If set to true, indicates instead of updating the changed property on the target
// live component a new live component is created with the current configured properties.
// <P>
// This property is typically set when a custom component is being used that doesn't support
// setters for any or most of its properties and a change can be reflected by recreating the
// component.
// <p>
// Individual properties of the target component can be marked similarly on the component's
// schema for more fine-grained control. See +link{DataSourceField.recreateOnChange}.
//
// @visibility external
//<

//> @attr paletteNode.requiredProperties (String : null : IR)
// Comma separated list of properties for this component that must be provided in
// +link{editNode.defaults} before the component will be created. Otherwise a
// +link{Placeholder} will be used until the required properties are satisfied.
//
// @visibility external
//<

//> @attr paletteNode.alwaysUsePlaceholder (Boolean : null : IR)
// If set to true, indicates that a +link{Placeholder} should always be shown in place of
// the actual component.
//
// @visibility external
//<

//> @attr paletteNode.placeholderImage (SCImgURL : null : IR)
// Image to display in lieu of the usual placeholder text.
//
// @visibility external
//<

//> @attr paletteNode.placeholderProperties (Label Properties : null : IR)
// Properties to be applied to the +link{paletteNode.liveObject,liveObject} when created as a
// +link{Placeholder}.
//
// @visibility external
//<

//> @attr paletteNode.wizardConstructor (PaletteWizard : null : IR)
// A paletteNode that requires user input before component creation can occur 
// may provide a <code>wizardConstructor</code> and +link{wizardDefaults} for the creation of
// a "wizard" component.
// <P>
// Immediately after creation, the wizard will then have the +link{paletteWizard.getResults()}
// method called on it, dynamically produced defaults.
//
// @visibility internal
//<

//> @attr paletteNode.wizardDefaults (PaletteWizard Properties : null : IR)
// Defaults for the wizard created to gather user input before a component is created from
// this PaletteNode.  See +link{wizardConstructor}.
//
// @visibility internal
//<



// PaletteWizard
// ---------------------------------------------------------------------------------------

//> @interface PaletteWizard
// Interface to be fulfilled by a "wizard" specified on a +link{PaletteNode} via
// +link{paletteNode.wizardConstructor}.
// @visibility internal
//<

//> @method paletteWizard.getResults()
// Single function invoked on paletteWizard.  Expects defaults to be asynchronously returned,
// after user input is complete, by calling the +link{Callback} provided as a parameter.
// 
// @param callback (Callback) callback to be fired once this wizard completes.  Expects a
//                            single argument: the defaults
// @param paletteNode (PaletteNode) the paletteNode that specified this wizard
// @param palette (Palette) palette where creation is taking place
//
// @visibility internal
//<

//> @interface Palette
// An interface that provides the ability to create components from a +link{PaletteNode}.  
//
// @treeLocation Client Reference/Tools
// @group devTools
// @visibility external
//<

isc.ClassFactory.defineInterface("Palette");

isc.Palette.addInterfaceProperties({
    //> @attr palette.defaultEditContext (EditContext | EditTree | EditPane : null : IRW)
    // Default EditContext that this palette should use.  Palettes generally create components via
    // drag and drop, but may also support creation via double-click or other UI idioms when a
    // defaultEditContext is set.
    // @visibility external
    //<

    //> @method palette.setDefaultEditContext()
    // Sets the default EditContext that this palette should use.  Palettes generally create components via
    // drag and drop, but may also support creation via double-click or other UI idioms when a
    // defaultEditContext is set.
    // @param defaultEditContext (EditContext | EditTree | EditPane) the default EditContext used by this Palette
    // @visibility external
    //<
    setDefaultEditContext : function (defaultEditContext) {
        // If an EditTree (or similar) component is passed which contains
        // an EditContext rather than being one, grab the actual EditContext.
        if (defaultEditContext && !isc.isAn.EditContext(defaultEditContext) && defaultEditContext.getEditContext) {
            defaultEditContext = defaultEditContext.getEditContext();
        }
        this.defaultEditContext = defaultEditContext;

        // If the defaultEditContext does not have a defaultPalette, then set it
        if (defaultEditContext && !defaultEditContext.defaultPalette) {
            defaultEditContext.defaultPalette = this;
        }
    },

    //> @method palette.makeEditNode()
    // Given a +link{PaletteNode}, make an +link{EditNode} from it by creating a 
    // +link{editNode.liveObject,liveObject} from the +link{paletteNode.defaults}
    // and copying presentation properties (eg +link{paletteNode.title,title}
    // to the editNode.
    // <P>
    // If <code>editNodeProperties</code> is specified as an object on
    // on the paletteNode, each property in this object will also be copied across to
    // the editNode.
    //
    // @param paletteNode (PaletteNode) paletteNode to create from
    // @return (EditNode) created EditNode
    //
    // @visibility external
    //<
    makeEditNode : function (paletteNode) {
        if (!paletteNode) paletteNode = this.getDragData();
        if (isc.isAn.Array(paletteNode)) paletteNode = paletteNode[0];

        var type = paletteNode.type || paletteNode.className;
        if (!isc.SGWTFactory.getFactory(type) && type.contains(".")) type = type.split(/\./).pop();

        var componentNode = {
            type : type,
            _constructor : type, // this is here just to match the defaults
            idName: paletteNode.idName,
            idPrefix: paletteNode.idPrefix,
            canDuplicate: paletteNode.canDuplicate,
            // for display in the target Tree
            title : paletteNode.title,
            icon : paletteNode.icon,
            iconSize : paletteNode.iconSize,
            showDropIcon : paletteNode.showDropIcon,
            useEditMask : paletteNode.useEditMask,
            autoGen : paletteNode.autoGen,
            editProxyProperties : paletteNode.editProxyProperties,
            requiredProperties: paletteNode.requiredProperties,
            recreateOnChange: paletteNode.recreateOnChange,
            alwaysUsePlaceholder: paletteNode.alwaysUsePlaceholder
        };
        if (paletteNode.dropped != null) componentNode.dropped = paletteNode.dropped;
        isc.EditContext.copyPaletteNodeBehaviors(componentNode, paletteNode);

        // support arbitrary properties on the generated edit node
        // This allows 'loadData' to get at properties that might not otherwise be copied
        // across to the editNode from the paletteNode
        if (isc.isAn.Object(paletteNode.editNodeProperties)) {
            for (var prop in paletteNode.editNodeProperties) {
                componentNode[prop] = paletteNode.editNodeProperties[prop];
            }
        }

        // allow a maker function on the source data (synchronous)
        if (paletteNode.makeComponent) {
            componentNode.liveObject = paletteNode.makeComponent(componentNode);
            return componentNode;
        }

        // NOTE: IDs
        // - singletons may have an ID on the palette node.  
        // - an ID may appear in defaults because palette-based construction is used to reload
        //   views, and in this case the palette node will be used once ever
        var defaults = paletteNode.defaults;
        componentNode.ID = paletteNode.ID || (defaults ? isc.DS.getAutoId(defaults, paletteNode) : null);
                
        var clobberDefaults = true;

        if (paletteNode.loadData && !paletteNode.isLoaded) {
            // deferred load node.  No creation happens for now; whoever receives this node is
            // expected to call the loadData function

            
            componentNode.deferCreation = paletteNode.deferCreation;
            
            componentNode.loadData = paletteNode.loadData;
        } else if (paletteNode.wizardConstructor) {
            // wizard-based deferred construction
            componentNode.wizardConstructor = paletteNode.wizardConstructor;
            componentNode.wizardDefaults = paletteNode.wizardDefaults;
        } else if (paletteNode.liveObject) {
            // singleton, or already created component.  This means that rather than a new
            // object being instantiated each time, the same "liveObject" should be reused,
            // because multiple components will be accessing a shared object.
            var liveObject = paletteNode.liveObject;
            // handle global IDs
            if (isc.isA.String(liveObject)) liveObject = window[liveObject];
            componentNode.liveObject = liveObject
        } else {
            // create a live object from defaults
            componentNode = this.createLiveObject(paletteNode, componentNode);
            clobberDefaults = false;
        }

        // also pass the defaults. Note that this was overwriting a more detailed set of defaults
        // derived by the createLiveObject method; hence the introduction  of the condition
        if (clobberDefaults) {
            componentNode.defaults = isc.addProperties({}, paletteNode.defaults);
            delete componentNode.defaults[isc.gwtRef];
            delete componentNode.defaults[isc.gwtModule];
            delete componentNode.defaults["xsi:type"];
        }

        // Make sure defaults have a constructor
        if (componentNode.defaults && !componentNode.defaults._constructor) {
            componentNode.defaults._constructor = type;
        }

        return componentNode;
    },
    
    //>!BackCompat 2013.09.20
    makeNewComponent : function (sourceData) {
       return this.makeEditNode(sourceData);
    },
    //<!BackCompat
    
    //> @attr palette.generateNames   (boolean : true : IR)
    // Whether created components should have their "ID" or "name" property automatically set
    // to a unique value based on the component's type, eg, "ListGrid0".
    //
    // @group devTools
    // @visibility external
    //<
    generateNames : true,

    typeCount : {},
    // get an id for the object we're creating, by type
    getNextAutoId : function (type, paletteNode) {
        if (type == null) {
            type = "Object";
        } else {
            // Use short IDs for objects created via SGWT reflection
            if (type.contains(".")) type = type.split(/\./).pop(); 
        }
        var autoId;
        this.typeCount[type] = this.typeCount[type] || 0;

        // If the node is unique based on the "name" field and is therefore stored in the
        // "fields" parent property, make sure it is unique among all "name" names in the
        // screen. Technically the name needs to be unique within the parent component but
        // at this point we don't know what the parent component is.
        var idField = isc.DS.getAutoIdField(paletteNode);
        if (idField == "name" && this.defaultEditContext) {
            var editNodes = this.defaultEditContext.getEditNodeArray(),
                fieldNodeIDs = editNodes && editNodes.map(function (node) {
                    return (node.defaults && node.defaults.parentProperty == "fields" ? node.ID : null);
                })
            ;
            if (fieldNodeIDs) {
                while (fieldNodeIDs.contains(autoId = type + this.typeCount[type]++)) {}
            } else {
                // This shouldn't happen but fall back on checking for global uniqueness
                while (window[(autoId = type + this.typeCount[type]++)] != null) {}
            }
        } else {
            while (window[(autoId = type + this.typeCount[type]++)] != null) {}
        }
        return autoId;
    },

    findPaletteNode : function (fieldName, value) {
        return null;
    },

    createLiveObject : function (paletteNode, editNode) {
        // put together an initialization data block
        var type = paletteNode.type || paletteNode.className;
        if (type.contains(".") && !isc.SGWTFactory.getFactory(type)) type = type.split(/\./).pop();

        var classObject = isc.ClassFactory.getClass(type),
            schema = isc.DS.getNearestSchema(type),
            defaults = {},
            // assume we should create standalone if there's no schema (won't happen anyway if
            // there's no class)
            createStandalone = (schema ? schema.shouldCreateStandalone() : true),
            paletteNodeDefaults = paletteNode.defaults || {};

        // If we have a schema, but no class object, then see whether the
        // schema tells us what kind of object to construct.
        var deriveConstructorFromSchema;
        if (schema && !classObject) {
            classObject = isc.DS.getNearestSchemaClass(schema);
            if (classObject) {
                type = classObject.getClassName();
                deriveConstructorFromSchema = true;
            }
        }

        // suppress drawing for widgets
        var finalDefaults = {};
        if (classObject && classObject.isA("Canvas")) {
            defaults._defaultedAutoDraw = (paletteNode.defaults &&
                (paletteNode.defaults.autoDraw == null || paletteNode.defaults.autoDraw !== false) ? true : false);
            defaults.autoDraw = false;
            finalDefaults.autoDraw = false;
        }

        // If a title was explicitly passed in the sourceData, use it
        if (paletteNodeDefaults.title) {
            defaults.title = paletteNodeDefaults.title;
        }

        if (this.generateNames && (schema.addGlobalId == null || schema.addGlobalId != false)) {
            // generate an id and if one wasn't specified
            var toolAutoIDField = isc.DS.getToolAutoIdField(type),
                usedAutoIDField = isc.DS.getUsedAutoIdField(paletteNodeDefaults)
            ;

            
            var ID = editNode.ID || isc.DS.getAutoId(paletteNodeDefaults),
                reassignIDs = (this.defaultEditContext ? this.defaultEditContext.reassignIDs : null)
            ;
            if (ID == null || reassignIDs) {
                if (reassignIDs) {
                    // Drop ID or name value from defaults and make sure not to assign it again
                    var autoIDField = schema.getAutoIdField();
                    delete paletteNodeDefaults[autoIDField];
                    usedAutoIDField = null;

                    // Pull palette node from palette for the type. Imported paletteNode
                    // will not have the idName and idPrefix properties because the importer
                    // doesn't have the palette during import.
                    var pNode = this.findPaletteNode("type", paletteNode.type);
                    if (pNode) {
                        paletteNode.idName = pNode.idName;
                        paletteNode.idPrefix = pNode.idPrefix;
                    }
                }
                ID = this.getNextAutoId(paletteNode.idName || paletteNode.idPrefix || paletteNode.type, paletteNode);
                defaults[toolAutoIDField] = ID;
            }
            // ensure a hasStableID() override is installed for an auto-generated ID
            
            if (!defaults.hasStableID && defaults[toolAutoIDField]) {
                defaults.hasStableID = function () {
                    var autoIdField = isc.DS.getToolAutoIdField(this.getClassName()),
                        autoID = (this.editNode && this.editNode.defaults ? this.editNode.defaults[autoIdField] : null)
                    ;
                    return autoID ? false : this.Super("hasStableID", arguments);
                }
            }
            editNode.ID = ID;

            // give the object an autoID/autoName in defaults
            
            if (paletteNodeDefaults.builderAutoID) {
                defaults[toolAutoIDField] = ID;
                var autoIDField = schema.getAutoIdField();
                delete defaults[autoIDField];
                delete paletteNodeDefaults[autoIDField];
                delete paletteNodeDefaults.builderAutoID;
            } else if (usedAutoIDField) {
                defaults[usedAutoIDField] = ID;
            }
    
            // don't supply a title for contexts where the ID or name will automatically be
            // used as a title (currently just formItems), otherwise, it will be necessary to
            // change both ID/name and title to get rid of the auto-gen'd id 
            // also do not automatically supply a title for DrawItems - this would lead to
            // unexpected creation of the titleLabel.
            if (
                schema && 
                schema.getField("title") && 
                !schema.inheritsSchema("ListGridField") &&
                !isc.isA.FormItem(classObject) &&
                !(isc.isA.DrawItem && isc.isA.DrawItem(classObject)) &&
                !(isc.isA.LayoutResizeBar && isc.isA.LayoutResizeBar(classObject)) &&
                !(isc.isA.LayoutResizeSnapbar && isc.isA.LayoutResizeSnapbar(classObject)) &&
                type != "MenuItem" &&
                !defaults.title
            ) {
                defaults.title = ID;
            }
        }

        defaults = editNode.defaults = isc.addProperties(
            defaults,
            this.componentDefaults,
            paletteNodeDefaults
        );
        delete defaults[isc.gwtRef];
        delete defaults[isc.gwtModule];
        // An xsi:type property in defaults should be dropped to avoid serializing because
        // it won't be valid without proper includes.
        delete defaults["xsi:type"];
        defaults._constructor = type;

        
        for (var prop in defaults) {
            var val = defaults[prop];
            if (
                isc.isAn.Array(val) &&
                (!classObject || classObject.getInstanceProperty(prop) !== val)
            ) {
                val = defaults[prop] = val.duplicate();

                // Check for arrays of arrays.
                for (var i = val.length; i--; ) {
                    if (isc.isAn.Array(val[i])) {
                        val[i] = val[i].duplicate();
                    }
                }
            }
        }

        // If paletteNode specifies a list of required properties that must exist before the
        // live component can be created, update editNode to create placeholder if properties
        // are not satisfied or switch a placeholder to the real component if satisfied.
        var alwaysUsePlaceholder = (paletteNode.alwaysUsePlaceholder == true ||
                                    paletteNode.alwaysUsePlaceholder == "true");
        if (paletteNode.requiredProperties || alwaysUsePlaceholder) {
            var missingProperties = isc.EditContext.getMissingRequiredProperties(paletteNode);
            if (missingProperties || alwaysUsePlaceholder) {
                var placeholderDefaults = defaults.placeholderDefaults || {};

                if (defaults._constructor != "Placeholder") {
                    placeholderDefaults.placeholderFor = defaults._constructor;
                }
                if (missingProperties) {
                    placeholderDefaults.requiredProperties = missingProperties;
                } else {
                    delete placeholderDefaults.requiredProperties;
                }
                if (paletteNode.placeholderProperties) {
                    isc.addProperties(placeholderDefaults, paletteNode.placeholderProperties);
                }
                if (paletteNode.placeholderImage) {
                    placeholderDefaults.image = paletteNode.placeholderImage;
                }

                defaults._constructor = "Placeholder";
                defaults.placeholderDefaults = placeholderDefaults;
            } else if (paletteNode.type == "Placeholder") {
                // Required properties are satisfied. Create the actual component.
                defaults._constructor = editNode._constructor = editNode.type = defaults.placeholderDefaults.placeholderFor;
                delete defaults.placeholderDefaults;
            }
        }

        // create the live object from the init data
        // NOTE: components generated from config by parents (tabs, sectionStack sections,
        // formItems).  These objects:
        // - are created as an ISC Class by adding to a parent, and not before
        //   - in makeEditNode, don't create if there is no class or if the schema sets
        //     createStandalone=false
        // - destroyed by removal from the parent, then re-created by a re-add
        //   - re-add handled by addComponent by checking for destruction
        // - serialized as sub-objects rather than independent components
        //   - handled by checking for _generated during serialization
        //   - should be a default consequence of not having a class or setting
        //     createStandalone=false
        // The various checks mentioned above are redundant and should be unified and make able
        // to be declared in component schema

        // if there's no class for the item, or schema.createStandalone has been set false,
        // don't auto-create the component - assume the future parent of the component will
        // create it from data.  The explicit flag (createStandalone:false) is needed for
        // FormItems.  In particular, canvasItems require item.containerWidget to be defined
        // during init.
        var liveObject;
        if (classObject && createStandalone) {
            if (type == "DataSource" && isc.DataSource.get(ID)) {
                liveObject = isc.DataSource.get(ID);
            } else {
                try {
                    liveObject = isc.ClassFactory.newInstance(defaults, finalDefaults);
                } catch (e) {
                    // If failed component is a custom component, log the error and replace
                    // it with a placeholder
                    var schema = isc.DS.get(type);
                    if (!schema.componentSchema) {
                        var paletteNode = this.findPaletteNode(type);
                        this.logWarn("Palette failed to create component, type: " + type +
                                    ", ID: " + ID +
                                    ", error: " + e +
                                    ", defaults: " + this.echo(defaults), "componentExceptions");
                        var placeholderDefaults = {
                            placeholderFor: type,
                            failedCreate: true,
                            errorMessage: e
                        };
                        if (paletteNode && paletteNode.placeholderDefaults) {
                            isc.addProperties(placeholderDefaults, paletteNode.placeholderDefaults);
                        }
                        liveObject = isc.Placeholder.create(defaults, finalDefaults, { placeholderDefaults: placeholderDefaults });
                        if (this.failedCreate) {
                            var message = "<b>" + type + "</b> could not be created:<br>" + e;
                            this.failedCreate(type, e, message);
                        }
                    }
                }
            }
        } else {
            // for the live object, just create a copy (NOTE: necessary because widgets
            // generally assume that it is okay to add properties to pseudo-objects provided as
            // init data)
            editNode.generatedType = true;
            liveObject = isc.shallowClone(defaults);
        }

        // store the new live object
        editNode.liveObject = liveObject;
        this.logInfo("palette created component, type: " + type +
                     ", ID: " + ID +
                     (this.logIsDebugEnabled("editing") ?
                         ", defaults: " + this.echo(defaults) : "") + 
                     ", liveObject: " + this.echoLeaf(liveObject), "editing");
        return editNode;
    }
});

//> @class HiddenPalette
// A Palette with no visible representation that handles programmatic creation of components.
//
// @implements Palette
// @group devTools
// @treeLocation Client Reference/Tools/Palette
// @visibility external
//<
isc.defineClass("HiddenPalette", "Class", "Palette");

isc.HiddenPalette.addMethods({
    //> @attr hiddenPalette.data (List of PaletteNode : null : IR)
    // A list of +link{PaletteNode,PaletteNodes} for component creation.
    // @visibility external
    //<

    findPaletteNode : function (fieldName, value) {
        return this.data ? this.data.find(fieldName, value) : null;
    }
});

// ---------------------------------------------------------------------------------------

//> @class TreePalette
// A TreeGrid that implements the Palette behavior, so it can be used as the source for 
// drag and drop instantiation of components when combined with an +link{EditContext} as 
// the drop target.
// <P>
// Each +link{TreeNode} within +link{treeGrid.data} can be a +link{PaletteNode}.
//
// @inheritsFrom TreeGrid
// @implements Palette
// @group devTools
// @treeLocation Client Reference/Tools/Palette
// @visibility external
//<

// Class will not work without TreeGrid
if (isc.TreeGrid) {

isc.defineClass("TreePalette", "TreeGrid", "Palette");

isc.TreePalette.addMethods({
    //> @attr treePalette.componentDefaults    (Object : null : IR)
    // Defaults to apply to all components originating from this palette.
    // @group devTools
    // @visibility external
    //<
    

    //> @attr treePalette.canShowFilterEditor (boolean : false : IRA)
    // Option to show filter editor is disabled for treePalettes
    // @visibility external
    //<
    canShowFilterEditor:false,
       
    //> @attr treePalette.canSaveSearches (boolean : false : IRA)
    // Option to save searches is disabled for treePalettes
    // @visibility external
    //<
    canSaveSearches:false,


    canDragRecordsOut:true,
    // add to defaultEditContext (if any) on double click 
    recordDoubleClick : function (viewer, record) {
        if (!record || record.canSelect == false || record.canSelect == "false") return;
        // If node has no type, no component can be created
        if (!record.type) return;

        var target = this.defaultEditContext;
        if (target) {
            if (isc.isA.String(target) && this.creator) target = this.creator[target];
            if (isc.isAn.EditContext(target)) {
                var paletteNode = record;
                var parentNode = target.getDefaultParent(paletteNode, true);
                if (parentNode == null) {
                    isc.warn("No default parent can accept a component of this type");
                } else {
                    paletteNode = this.data.getCleanNodeData(paletteNode, false, false, false);
                    // flag that this node was dropped by a user
                    paletteNode.dropped = true;
                    // Use EditProxy drop methods to finish adding new node so normal
                    // substitution procedures and inline edits work as expected.
                    var index = target.getEditNodeTree().getChildren(parentNode).length;
                    if (!isc.isA.DynamicForm(parentNode.liveObject) && parentNode.liveObject.editProxy) {
                        // Defer add into normal editProxy drag-and-drop handler so that common actions
                        // are applied.
                        parentNode.liveObject.editProxy.completeDrop(paletteNode, { index: index });
                    } else {
                        var editNode = this.makeEditNode(paletteNode);
                        editNode.dropped = true;
                        parentNode.liveObject.editProxy.completeItemDrop(editNode, index);
                    }
                }
            }
        }
    },

    findPaletteNode : function (fieldName, value) {
        // this.data could be filtered so check full cache data where possible
        var ds = this.getDataSource(),
            data = (ds ? ds.getCacheData() : null) || this.data,
            node = data ? data.find(fieldName, value) : null
        ;
        return (node ? this.data.getCleanNodeData([node], false, false, false)[0] : null);
    },

    // NOTE: we can't factor this up to the Palette interface because it wouldn't override the
    // built-in implementation of transferDragData.
    transferDragData : function (targetFolder) {
        return this.getDragData();
    },

    dragStart : function (a, b, c) {
        var result = this.invokeSuper(isc.TreePalette, "dragStart", a, b, c);
        
        if (result) isc.EH.setDragTracker(null, null, null, -2, -2);
        return result;
    }
});

}

// --------------------------------------------------------------------------------------------
//> @class ListPalette
// A ListGrid that implements the +link{Palette} behavior, so it can be used as the source for 
// drag and drop instantiation of components when combined with an +link{EditContext} as 
// the drop target.
// <P>
// Each +link{ListGridRecord} can be a +link{PaletteNode}.
//
// @inheritsFrom ListGrid
// @implements Palette
// @group devTools
// @treeLocation Client Reference/Tools/Palette
// @visibility external
//<

// Class will not work without ListGrid
if (isc.ListGrid) {

isc.defineClass("ListPalette", "ListGrid", "Palette");

isc.ListPalette.addMethods({
    canDragRecordsOut:true,
    defaultFields : [ { name:"title", title:"Title" } ],

    //> @attr listPalette.canShowFilterEditor (boolean : false : IRA)
    // Option to show filter editor is disabled for listPalettes
    // @visibility external
    //<
    canShowFilterEditor:false,
       
    //> @attr listPalette.canSaveSearches (boolean : false : IRA)
    // Option to save searches is disabled for listPalettes
    // @visibility external
    //<
    canSaveSearches:false,    

    // add to defaultEditContext (if any) on double click 
    recordDoubleClick : function () {
        // NOTE: dup'd in TreePalette
        var target = this.defaultEditContext;
        if (target) {
            if (isc.isA.String(target)) target = isc.Canvas.getById(target);
            if (isc.isAn.EditContext(target)) {
                target.addNode(this.makeEditNode(this.getDragData()));
            }
        }
    },
    
    findPaletteNode : function (fieldName, value) {
        return this.data ? this.data.find(fieldName, value) : null;
    },
    
    // NOTE: we can't factor this up to the Palette interface because it wouldn't override the
    // built-in implementation of transferDragData.
    transferDragData : function () {
        return this.getDragData();
    }
});

}

// --------------------------------------------------------------------------------------------
//> @class TilePalette
// A +link{TileGrid} that implements the +link{Palette} behavior, so it can be used as the source for 
// drag and drop instantiation of components when combined with an +link{EditContext} as 
// the drop target.
// <P>
// Each +link{TileGrid.tile} can be a +link{PaletteNode}.
//
// @inheritsFrom TileGrid
// @implements Palette
// @group devTools
// @treeLocation Client Reference/Tools/Palette
// @visibility external
//<

// Class will not work without TileGrid
if (isc.TileGrid) {

isc.defineClass("TilePalette", "TileGrid", "Palette");

isc.TilePalette.addMethods({
    canDragTilesOut: true,
    defaultFields: [
        {name: "title", title: "Title"}
    ],

    // add to defaultEditContext (if any) on double click 
    recordDoubleClick : function () {
        var target = this.defaultEditContext;
        if (target) {
            if (isc.isA.String(target)) target = isc.Canvas.getById(target);
            if (isc.isAn.EditContext(target)) {
                target.addNode(this.makeEditNode(this.getDragData()));
            }
        }
    },

    findPaletteNode : function (fieldName, value) {
        return this.data ? this.data.find(fieldName, value) : null;
    },
    
    // NOTE: we can't factor this up to the Palette interface because it wouldn't override the
    // built-in implementation of transferDragData.
    transferDragData : function () {
        return this.getDragData();
    }
});

}

// --------------------------------------------------------------------------------------------
//> @class MenuPalette
// A Menu that implements the +link{Palette} behavior, so it can be used as the source for 
// drag and drop instantiation of components when combined with an +link{EditContext} as 
// the drop target.
// <P>
// Each +link{MenuItem} can be a +link{PaletteNode}.
//
// @inheritsFrom Menu
// @implements Palette
// @group devTools
// @treeLocation Client Reference/Tools/Palette
// @visibility external
//<

// Class will not work without Menu
if (isc.Menu) {

isc.defineClass("MenuPalette", "Menu", "Palette");

isc.MenuPalette.addMethods({
    canDragRecordsOut: true,
    
    // needed because the selection is what's dragged, and menus do not normally track a
    // selection
    selectionType: "single",


    // add to defaultEditContext (if any) on click 
    itemClick : function (item) {
        var target = this.defaultEditContext;
        if (target) {
            if (isc.isA.String(target)) target = isc.Canvas.getById(target);
            if (isc.isAn.EditContext(target)) {
                target.addNode(this.makeEditNode(this.getDragData()));
            }
        }
    },
    
    findPaletteNode : function (fieldName, value) {
        return this.data ? this.data.find(fieldName, value) : null;
    },
    
    // NOTE: we can't factor this up to the Palette interface because it wouldn't override the
    // built-in implementation of transferDragData.
    transferDragData : function () {
        return this.getDragData();
    }
});

}




// ---------------------------------------------------------------------------------------

//> @class EditPane
// A container that allows drag and drop instantiation of visual components from a
// +link{Palette}, and direct manipulation of the position and size of those components.
// <P>
// Any drag onto an EditPane from a Palette will add an EditNode created from the dragged
// PaletteNode.
// <P>
// EditPane automatically creates an +link{EditContext} and provides several APIs and
// settings that are passthroughs to the underlying EditContext for convenience.
//
// @inheritsFrom Canvas
// @group devTools
// @treeLocation Client Reference/Tools/EditContext
// @visibility external
//<

// Schema definition for the EditPane class, in case we have not loaded the system schema.

if (!isc.DataSource.get("EditPane")) {
    isc.DataSource.create({
        ID: "EditPane",
        componentSchema:true,
        Contructor: "EditPane",
        addGlobalId:false,
        fields: [
            {name: "children", type: "Canvas", multiple: true}
        ]
    });
}


isc.ClassFactory.defineClass("EditPane", "Canvas");

isc.EditPane.addProperties({
    border: "1px solid black",

    canAcceptDrop:true,

    //> @attr editPane.editContext (AutoChild EditContext : null : IR)
    // An EditContext is automatically created to manage EditMode behavior. The public
    // EditContext APIs exposed by the EditPane are passed through to this object.
    // <p>
    // Additional <code>editContext</code> properties can be supplied as
    // +link{editPane.editContextProperties,editContextProperties}.
    //
    // @visibility external
    //<
    editContextConstructor: "EditContext",
    editContextDefaults: {
        // Enable Canvas-based component selection, positioning and resizing support
        canSelectEditNodes: true,
        nodeAdded : function (newNode, parentNode, rootNode) {
            var editPane = this.creator;

            // Flip it into edit mode depending on the setting on the VB instance
            
            if (editPane.creator && editPane.creator.editingOn) this.enableEditing(newNode);

            if (editPane.nodeAdded) editPane.nodeAdded(newNode, parentNode, rootNode);
        },
        getSelectedLabelText : function (component) {
            var editPane = this.creator;

            return (editPane.getSelectedLabelText 
                    ? editPane.getSelectedLabelText(component) 
                    : this.Super("getSelectedLabelText", arguments));
        }
    },

    //> @attr editPane.editContextProperties (EditContext Properties : null : IR)
    // Properties to be applied to the +link{editPane.editContext,editContext} when created.
    // @visibility external
    //<

    //> @attr editPane.editMode        (Boolean : true : [IRW])
    // Enables/disables edit mode. Edit mode allows component addition, positioning and
    // resizing which is the default.
    // <P>
    // Note that a +link{PortalLayout} provides edit mode-style editing by default so 
    // <code>editMode</code> should be disabled for that case.
    //
    // @visibility internal
    //<
    editMode: true,

    initWidget : function () {
        this.Super("initWidget", arguments);

        // We'll be the live object for the root node
        var rootComponent = {
            type: "EditPane",
            liveObject: this
        };
        if (this.useCopyPasteShortcuts) {
            if (!rootComponent.editProxyProperties) rootComponent.editProxyProperties = {};
            rootComponent.editProxyProperties.useCopyPasteShortcuts = true;
        }

        var properties = isc.EditContext.getNonNullProperties({
            rootComponent: rootComponent,
            defaultPalette: this.defaultPalette,
            extraPalettes: this.extraPalettes,
            autoEditNewNodes: this.autoEditNewNodes,
            persistCoordinates: this.persistCoordinates,
            allowNestedDrops: this.allowNestedDrops,
            showSelectedLabel: this.showSelectedLabel,
            selectedAppearance: this.selectedAppearance,
            selectedBorder: this.selectedBorder,
            selectedLabelBackgroundColor: this.selectedLabelBackgroundColor,
            selectedTintColor: this.selectTintColor,
            selectedTintOpacity: this.selectedTintOpacity,
            useCopyPasteShortcuts: this.useCopyPasteShortcuts
        });
        this.editContext = this.createAutoChild("editContext", properties);

        // A normal editContext implementation is a Tree which has a selection
        // model. We need this model on an EditPane as well. The selection model
        // also requires the "data" property so it's initialized to an empty array.
        this.data = [];
        this.createSelectionModel();

        // Put pane into edit mode
        if (this.editMode) this.setEditMode(true, this.editContext, this.editContext.getRootEditNode());
    },

    //> @method editPane.getEditContext
    // Returns the +link{EditContext} instance managed by the EditPane.
    // @return (EditContext) the EditContext instance
    // @visibility external
    //<
    getEditContext : function () {
        return this.editContext;
    },

    setEditMode : function (editingOn, editContext, editNode) {
        if (editingOn == null) editingOn = true;
        if (this.editingOn == editingOn) return;

        // EditPane is it's own editContext
        if (!editContext) editContext = this.getEditContext();

        this.Super("setEditMode", [editingOn, editContext, editNode], arguments);

        if (this.editingOn && this.editProxy && this.editProxy.canSelectChildren) {
            // Hang on to the liveObject that manages the selection UI.
            // It is responsible for showing the outline or other selected state
            editContext._selectionLiveObject = this;
        }

        // Set editMode on liveObjects being careful to pass editNode. Without
        // this value disabling and re-enabling editMode clears the editNode value
        // and editContext.getSelectedEditNodes() no longer returns the editNode(s). 
        var liveObjects = editContext.getEditNodeArray().getProperty("liveObject");
        liveObjects.map(function(liveObject) {
            liveObject.setEditMode(editingOn, editContext, liveObject.editNode);
        });

        // Set or hide default pane context menu only if not provided by creator
        if (editingOn) {
            if (this.contextMenu == null) {
                this.contextMenu = {
                    _defaultEditPaneMenu: true,
                    autoDraw:false,
                    data : [{title:"Clear", click: "target.destroyAll()"}]
                };
            }
        } else if (this.contextMenu && this.contextMenu._defaultEditPaneMenu) {
            this.contextMenu = null;
        }
    },

    switchEditMode : function (editingOn) {
        this.editContext.switchEditMode(editingOn);
    },

    // Component creation
    // ---------------------------------------------------------------------------------------

    // This is needed if the system schema has not been loaded
    getObjectField : function (type) {
        var fieldName = this.Super("getObjectField", arguments);
        if (fieldName) {
            return fieldName;
        }

        // Try schema first, in case the type is not a className
        var classObject = isc.DS.getNearestSchemaClass(type);

        // If there is no schema, then see if the type is a className 
        if (classObject == null) {
            classObject = isc.ClassFactory.getClass(type);
        }

        if (isc.isA.Canvas(classObject)) {
            return "children";
        } else {
            return null;
        }
    },

    // Component removal / destruction
    // ---------------------------------------------------------------------------------------

    // if a child is removed that is being edited, remove it from the list of edit components
    removeChild : function (child, name) {
        if (isc.EditProxy.getThumbTarget() === child) isc.EditProxy.hideResizeThumbs();

        this.Super("removeChild", arguments);
        var editContext = this.getEditContext(),
            node = editContext && editContext.getEditNodeArray().find("liveObject", child);
        if (node) {
            editContext.removeNode(node, true); // skip live removal, since that's been done
        }
    },

    // Serialization
    // ---------------------------------------------------------------------------------------

    //> @method editPane.getSaveData()
    // Returns an Array of +link{PaletteNode}s representing all current +link{EditNode}s in this
    // pane, suitable for saving and restoring via passing each paletteNode to +link{EditContext.addNode(),addNode()}.
    // @return (Array of PaletteNode) paletteNodes suitable for saving for subsequent restoration 
    //
    // @see EditContext.serializeAllEditNodes()
    // @see EditContext.serializeAllEditNodesAsJSON()
    // @visibility external
    //<
    getSaveData : function () {
        // get all the components being edited
        var data = this.getEditContext().getEditNodeTree(),
            editComponents = data.getChildren(data.getRoot()),
            allSaveData = [];
        for (var i = 0; i < editComponents.length; i++) {
            var component = editComponents[i],
                liveObject = component.liveObject;
            // save off just types and initialization data, not the live objects themselves
            var saveData = {
                type : component.type,
                defaults : component.defaults
            };
            // let the object customize it
            if (liveObject.getSaveData) saveData = liveObject.getSaveData(saveData);
            allSaveData.add(saveData);
        }
        return allSaveData;
    },

    // Pass-thru properties
    // --------------------------------------------------------------------------------------------
    
    //> @attr editPane.autoEditNewNodes (Boolean : null : IR)
    // @include editContext.autoEditNewNodes
    // @visibility external
    //<

    //> @attr editPane.rootComponent (PaletteNode : null : IR)
    // @include editContext.rootComponent
    // @visibility external
    //<

    //> @attr editPane.defaultPalette (Palette : null : IR)
    // @include editContext.defaultPalette
    // @visibility external
    //<

    //> @attr editPane.extraPalettes (Array of Palette : null : IR)
    // @include editContext.extraPalettes
    // @visibility external
    //<

    //> @attr editPane.persistCoordinates (Boolean : true : IR)
    // @include editContext.persistCoordinates
    // @visibility external
    //<

    //> @attr editPane.allowNestedDrops (Boolean : null : IR)
    // @include editContext.allowNestedDrops
    // @visibility external
    //<

    //> @attr editPane.showSelectedLabel (Boolean : null : IR)
    // @include editContext.showSelectedLabel
    // @visibility external
    //<

    //> @attr editPane.selectedBorder (String : null : IR)
    // @include editContext.selectedBorder
    // @visibility external
    //<

    //> @attr editPane.selectedLabelBackgroundColor (String : null : IR)
    // @include editContext.selectedLabelBackgroundColor
    // @visibility external
    //<

    //> @attr editPane.canGroupSelect (Boolean : null : IR)
    // @include editContext.canGroupSelect
    // @visibility external
    //<

    //> @attr editPane.canDragGroup (Boolean : null : IR)
    // @include editContext.canDragGroup
    // @visibility external
    //<

    //> @attr editPane.hideGroupBorderOnDrag (Boolean : null : IR)
    // @include editContext.hideGroupBorderOnDrag
    // @visibility external
    //<

    //> @attr editPane.groupMask (AutoChild Canvas : null : IR)
    // @include editContext.groupMask
    // @visibility internal
    //<

    //> @attr editPane.useCopyPasteShortcuts (Boolean : null : IR)
    // @include editContext.useCopyPasteShortcuts
    // @visibility external
    //<

    // Adding / Removing components in the tree pass-thru methods
    // --------------------------------------------------------------------------------------------

    //> @method editPane.getRootEditNode()
    // @include editContext.getRootEditNode
    // @visibility external
    //<
    getRootEditNode : function () {
        return this.editContext.getRootEditNode();
    },

    //> @method editPane.makeEditNode()
    // @include editContext.makeEditNode
    // @visibility external
    //<
    makeEditNode : function (paletteNode) {
        return this.editContext.makeEditNode(paletteNode);
    },

    //> @method editPane.getEditNodeTree()
    // @include editContext.getEditNodeTree
    // @visibility external
    //<
    getEditNodeTree : function () {
        return this.editContext.getEditNodeTree();
    },

    //> @method editPane.addNode()
    // @include editContext.addNode
    // @visibility external
    //<
    addNode : function (newNode, parentNode, index, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification) {
        return this.editContext.addNode(newNode, parentNode, index, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification);
    },

    //> @method editPane.addFromPaletteNode()
    // @include editContext.addFromPaletteNode
    // @visibility external
    //<
    addFromPaletteNode : function (paletteNode, parentNode, targetIndex, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification) {
        return this.editContext.addFromPaletteNode(paletteNode, parentNode, targetIndex, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification);
    },

    //> @method editPane.addFromPaletteNodes()
    // @include editContext.addFromPaletteNodes
    // @visibility external
    //<
    addFromPaletteNodes : function (paletteNodes, parentNode, index, parentProperty, skipNodeAddedNotification, isLoadingTree) {
        return this.editContext.addFromPaletteNodes(paletteNodes, parentNode, index, parentProperty, skipNodeAddedNotification, isLoadingTree);
    },

    //> @method editPane.removeNode()
    // @include editContext.removeNode
    // @visibility external
    //<
    removeNode : function (editNode, skipLiveRemoval, skipNodeRemovedNotification) {
        return this.editContext.removeNode(editNode, skipLiveRemoval, skipNodeRemovedNotification);
    },

    destroyNode : function (editNode) {
        return this.editContext.destroyNode(editNode);
    },

    //> @method editPane.reorderNode()
    // @include editContext.reorderNode
    // @visibility external
    //<
    reorderNode : function (parentNode, index, moveToIndex) {
        return this.editContext.reorderNode(parentNode, index, moveToIndex);
    },

    //> @method editPane.removeAll()
    // @include editContext.removeAll
    // @visibility external
    //<
    removeAll : function () {
        return this.editContext.removeAll();
    },
    
    //> @method editPane.destroyAll()
    // @include editContext.destroyAll
    // @visibility external
    //<
    destroyAll : function () {
        return this.editContext.destroyAll();
    },

    //> @method editPane.isNodeEditingOn()
    // @include editContext.isNodeEditingOn
    // @visibility external
    //<
    isNodeEditingOn : function (editNode) {
        return this.editContext.isNodeEditingOn(editNode);
    },

    //> @method editPane.enableEditing()
    // @include editContext.enableEditing
    // @visibility external
    //<
    enableEditing : function (editNode) {
        return this.editContext.enableEditing(editNode);
    },

    //> @method editPane.getNodeProperty()
    // @include editContext.getNodeProperty
    // @visibility external
    //<
    getNodeProperty : function (editNode, name) {
        return this.editContext.getNodeProperty(editNode, name);
    },

    //> @method editPane.setNodeProperties()
    // @include editContext.setNodeProperties
    // @visibility external
    //<
    setNodeProperties : function (editNode, properties, skipLiveObjectUpdate) {
        return this.editContext.setNodeProperties(editNode, properties, skipLiveObjectUpdate);
    },

    //> @method editPane.removeNodeProperties()
    // @include editContext.removeNodeProperties
    // @visibility external
    //<
    removeNodeProperties : function (editNode, properties) {
        return this.editContext.removeNodeProperties(editNode, properties);
    },

    //> @method editPane.getDefaultPalette()
    // @include editContext.getDefaultPalette
    // @visibility external
    //<
    getDefaultPalette : function () {
        return this.editContext.getDefaultPalette();
    },

    //> @method editPane.setDefaultPalette()
    // @include editContext.setDefaultPalette
    // @visibility external
    //<
    setDefaultPalette : function (palette) {
        return this.editContext.setDefaultPalette(palette);
    },

    // Copy and paste pass-thru methods
    // ---------------------------------------------------------------------------------------

    //> @method editPane.makePaletteNode()
    // @include editContext.makePaletteNode
    // @visibility external
    //<
    makePaletteNode : function (editNode) {
        return this.editContext.makePaletteNode(editNode);
    },

    //> @method editPane.makePaletteNodeTree()
    // @include editContext.makePaletteNodeTree
    // @visibility external
    //<
    makePaletteNodeTree : function (editNode) {
        return this.editContext.makePaletteNodeTree(editNode);
    },

    //> @method editPane.copyEditNodes()
    // @include editContext.copyEditNodes
    // @visibility external
    //<
    copyEditNodes : function (editNode) {
        this.editContext.copyEditNodes(editNode);
    },

    //> @method editPane.pasteEditNodes()
    // @include editContext.pasteEditNodes
    // @visibility external
    //<
    pasteEditNodes : function (targetEditNode) {
        this.editContext.pasteEditNodes(targetEditNode);
    },

    // Serialization pass-thru methods
    // --------------------------------------------------------------------------------------------

    //> @method editPane.addPaletteNodesFromXML()
    // @include editContext.addPaletteNodesFromXML
    // @visibility external
    //<
    addPaletteNodesFromXML : function (xmlString, parentNode, globals, callback) {
        return this.editContext.addPaletteNodesFromXML(xmlString, parentNode, globals, callback);
    },

    //> @method editPane.addPaletteNodesFromJSON()
    // @include editContext.addPaletteNodesFromJSON
    // @visibility external
    //<
    addPaletteNodesFromJSON : function (jsonString, parentNode, globals, callback) {
        return this.editContext.addPaletteNodesFromJSON(jsonString, parentNode, globals, callback);
    },

    //> @method editPane.getPaletteNodesFromXML()
    // @include editContext.getPaletteNodesFromXML
    // @visibility external
    //<
    getPaletteNodesFromXML : function (xmlString, callback) {
        return this.editContext.getPaletteNodesFromXML(xmlString, callback);
    },

    //> @method editPane.getPaletteNodesFromJS()
    // @include editContext.getPaletteNodesFromJS
    // @visibility external
    //<
    getPaletteNodesFromJS : function (jsCode, callback, keepGlobals) {
        return this.editContext.getPaletteNodesFromJS(jsCode, callback, keepGlobals);
    },

    //> @method editPane.addPaletteNodesFromJS()
    // @include editContext.addPaletteNodesFromJS
    // @visibility external
    //<
    addPaletteNodesFromJS : function (jsCode, parentNode, globals, callback) {
        return this.editContext.addPaletteNodesFromJS(jsCode, parentNode, globals, callback);
    },

    //> @method editPane.serializeAllEditNodes()
    // @include editContext.serializeAllEditNodes
    // @visibility external
    //<
    serializeAllEditNodes : function (settings) {
        return this.editContext.serializeAllEditNodes(settings);
    },
    
    //> @method editPane.serializeAllEditNodesAsJSON()
    // @include editContext.serializeAllEditNodesAsJSON
    // @visibility external
    //<
    serializeAllEditNodesAsJSON : function (settings, includeRoot) {
        return this.editContext.serializeAllEditNodesAsJSON(settings, includeRoot);
    },

    //> @method editPane.serializeEditNodes()
    // @include editContext.serializeEditNodes
    // @visibility external
    //<
    serializeEditNodes : function (nodes, settings) {
        return this.editContext.serializeEditNodes(nodes, settings);
    },

    //> @method editPane.serializeEditNodesAsJSON()
    // @include editContext.serializeEditNodesAsJSON
    // @visibility external
    //<
    serializeEditNodesAsJSON : function (nodes, settings) {
        return this.editContext.serializeEditNodesAsJSON(nodes, settings);
    },

    // Undo/redo pass-thru methods
    // --------------------------------------------------------------------------------------------

    //> @method editPane.undo()
    // @include editContext.undo
    // @visibility editModeUndoRedo
    //<
    undo : function () {
        return this.editContext.undo();
    },

    //> @method editPane.redo()
    // @include editContext.redo
    // @visibility editModeUndoRedo
    //<
    redo : function () {
        return this.editContext.redo();
    },

    //> @method editPane.resetUndoLog()
    // @include editContext.resetUndoLog
    // @visibility editModeUndoRedo
    //<
    resetUndoLog : function () {
        return this.editContext.resetUndoLog();
    }
});


//> @class EditTree
// A TreeGrid that allows drag and drop creation and manipulation of a tree of 
// objects described by DataSources.
// <P>
// Nodes can be added via drag and drop from a +link{Palette} or may be programmatically 
// added via +link{EditContext.addNode(),addNode()}.  Nodes may be dragged within the tree to reparent 
// them.
// <P>
// Eligibility to be dropped on any given node is determined by inspecting the
// DataSource of the parent node.  Drop is allowed only if the parent schema has
// a field which accepts the type of the dropped node.
// <P>
// On successful drop, the newly created component will be added to the parent node under the
// detected field.  Array fields, declared by setting
// <code>dataSourceField.multiple:true</code>, are supported.  
// <P>
// An EditTree is initialized by setting +link{EditTree.rootComponent} or
// +link{EditTree.editContext}.  EditTree.data (the Tree instance) should never be directly
// set or looked at.
// <P>
// EditTree automatically creates an +link{EditContext} and provides several APIs and
// settings that are passthroughs to the underlying EditContext for convenience.
//
// @inheritsFrom TreeGrid
// @treeLocation Client Reference/Tools/EditContext
// @group devTools
// @visibility external
//<



// Class will not work without TreeGrid
if (isc.TreeGrid) {

isc.ClassFactory.defineClass("EditTree", "TreeGrid");

isc.EditTree.addProperties({
    canDragRecordsOut: false,
	canAcceptDroppedRecords: true,
    canReorderRecords: true,

    
	selectionType:"single",

    // whether to automatically show parents of an added node (if applicable)
    autoShowParents:true
});

isc.EditTree.addMethods({
    initWidget : function () {
        this.fields = [{
            name: "ID",
            title: "ID",
            type: "identifier",
            width: "*",
            formatCellValue : function (value, record, rowNum, colNum, grid) {
                var editContext = grid.getEditContext();
                return editContext.getEditNodeIDDescription(record);
            },
            validators: [
                // A name/ID is required
                {   type: "required", stopIfFalse: true },

                // make sure a "name" change remains unique within the node's siblings
                // and an "ID" change is unique across all global components.
                {
                    type: "custom",
                    defaultErrorMessage: "Two fields in the same component cannot have the same name",
                    condition : function (item, validator, value, record, additionalContext) {
                        var idField = isc.DS.getAutoIdField(record),
                            grid = additionalContext.component,
                            rowNum = additionalContext.rowNum,
                            originalRecord = grid.getRecord(rowNum)
                        ;
                        if (idField == "name") {
                            // Validate uniqueness of "name" change among siblings
                            var tree = grid.data,
                                parentNode = tree.getParent(originalRecord)
                            ;
                            if (parentNode) {
                                var childNodes = tree.getChildren(parentNode);
                                for (var i = 0; i < childNodes.length; i++) {
                                    var childNode = childNodes[i],
                                        childIdField = isc.DS.getAutoIdField(childNode)
                                    ;
                                    if (childNode != originalRecord &&
                                        childIdField == "name" &&
                                        value == childNode[idField])
                                    {
                                        return false;
                                    }
                                }
                            }
                        } else {
                            // Validate uniqueness of "ID" change among global components
                            var editContext = grid.getEditContext(),
                                tree =  editContext.getEditNodeTree(),
                                existingNodes = tree.findAll("ID", value),
                                autoIdField = isc.DS.getToolAutoIdField(record)
                            ;
                            // existingNodes is all nodes with a "name", "autoName", "ID",
                            // or "autoID" matching the new value. For checking this new
                            // ID value we only need to concern ourselves with "ID" and
                            // "autoID" conflicts.
                            if (existingNodes) {
                                for (var i = 0; i < existingNodes.length; i++) {
                                    var editNode = existingNodes[i];
                                    if (editNode != originalRecord &&
                                        (editContext.getNodeProperty(editNode, idField) == value ||
                                            editContext.getNodeProperty(editNode, autoIdField) == value))
                                    {
                                        validator.errorMessage = "ID must be unique within the screen";
                                        return false;
                                    }
                                }
                            }
                        }
                        return true;
                    }
                }
            ]
        }, {
            name: "type",
            title: "Type",
            width: "*",
            canEdit: false,
            formatCellValue : function (value, record, rowNum, colNum, grid) {
                var editContext = grid.getEditContext(),
                    title = editContext.getTitleForType(value)
                ;
                return title;
            }
        }
        //,{name:"parentProperty", title:"Parent Property", dataPath:"/defaults/parentProperty", width:"*"}
        ];
        this.Super("initWidget", arguments);

        this.configureEditContext();

        // Observe changes to selection on tree so they can be pushed to EditContext
        this.observe(this, "nodeClick", "observer.selectedNodeUpdated(true)");

        this.setData(this.editContext.getEditNodeTree());
    },

    canEditCell : function (rowNum, colNum) {
        var record = this.getRecord(rowNum),
            fieldName = this.getFieldName(colNum)
        ;
        // For the ID column, if the record has no ID don't allow editing.
        // An example is a Window header or footer built-in control doesn't have an ID.
        if (fieldName == "ID" && record.ID == null) return false;

        // use default rules for all other fields
        return this.Super("canEditCell", arguments);
    },

    //> @attr editTree.canShowFilterEditor (boolean : false : IRA)
    // Option to show filter editor is disabled for editTree
    // @visibility external
    //<
    canShowFilterEditor:false,
       
    //> @attr editTree.canSaveSearches (boolean : false : IRA)
    // Option to save searches is disabled for editTree
    // @visibility external
    //<
    canSaveSearches:false,

    //> @attr editTree.editContext  (EditContext : null : IR)
    // The +link{EditContext} managed by this EditTree. If not set an instance
    // will be automatically created.
    // @visibility external
    //<
    editContextConstructor: "EditContext",

    //> @method editTree.getEditContext
    // Returns the +link{EditContext} instance managed by the EditTree.
    // @return (EditContext) the EditContext instance
    // @visibility external
    //<
    getEditContext : function () {
        return this.editContext;
    },

    // EditContext internal integration 
    // --------------------------------------------------------------------------------------------

    configureEditContext : function () {
        var editTree = this;

        // Create an EditContext if not provided
        if (!this.editContext) {
            if (!this.rootComponent && !this.rootLiveObject) {
                this.rootComponent = {
                    type: "Canvas"
                };
            }

            var properties = isc.EditContext.getNonNullProperties({
                rootComponent: this.rootComponent,
                rootLiveObject : this.rootLiveObject,
                defaultPalette: this.defaultPalette,
                extraPalettes: this.extraPalettes,
                autoEditNewNodes: this.autoEditNewNodes,
                persistCoordinates: this.persistCoordinates,
                allowNestedDrops: this.allowNestedDrops,
                showSelectedLabel: this.showSelectedLabel,
                selectedAppearance: this.selectedAppearance,
                selectedBorder: this.selectedBorder,
                selectedLabelBackgroundColor: this.selectedLabelBackgroundColor,
                selectedTintColor: this.selectTintColor,
                selectedTintOpacity: this.selectedTintOpacity,
                useCopyPasteShortcuts: this.useCopyPasteShortcuts
            });
            
            this.editContext = this.createAutoChild("editContext", isc.addProperties({}, this.editContextProperties, properties));
        }

        // Hook editContext event methods
        this.editContext.addProperties({
            getDefaultParent : function (newNode, returnNullIfNoSuitableParent) {
                return editTree.getDefaultParent(newNode, returnNullIfNoSuitableParent);
            },
            _origNodeAdded: this.editContext.nodeAdded,
            nodeAdded : function (newNode, parentNode, rootNode) {
                // Let EditContext handler have first run
                if (this._origNodeAdded) this._origNodeAdded(newNode, parentNode, rootNode);
                                
                editTree.selectSingleRecord(newNode);

                // Scroll new node into view if we are not loading a screen
                if (!isc._loadingNodeTree) {
                    
                    var rowNum = editTree.getRecordIndex(newNode)
                    if (editTree.isDrawn()) {
                        var visibleRows = editTree.getVisibleRows();
                        if (rowNum < visibleRows[0] || visibleRows[1] < rowNum) {
                            editTree.scrollRecordIntoView(rowNum);
                        }
                    }
                }
                if (editTree.autoShowParents) editTree.showParents(newNode);
                
                // Flip it into edit mode depending on the setting on the VB instance
                
                if (editTree.creator && editTree.creator.editingOn) this.enableEditing(newNode);

                if (editTree.nodeAdded) editTree.nodeAdded(newNode, parentNode, rootNode);
            },
            _origGetSelectedLabelText: this.editContext.getSelectedLabelText,
            getSelectedLabelText : function (component) {
                return (editTree.getSelectedLabelText
                        ? editTree.getSelectedLabelText(component) 
                        : (this._origGetSelectedLabelText ? this._origGetSelectedLabelText(component) : component.toString()));
            }
        });

        // Observe changes to selection from editContext so they can be
        // matched in the EditTree
        this.observe(this.editContext, "selectedEditNodesUpdated",
            "observer.selectedEditNodesUpdated()");
    },

    // Component selection on EditContext changed
    selectedEditNodesUpdated : function () {
        var selection = this.editContext.getSelectedEditNodes();
        if (selection.length > 0) {
            this.selectSingleRecord(selection[0]);
            if (!this._editTreeClick) {
                this.scrollToRow(this.getRecordIndex(selection[0]));
            }
        } else {
            this.deselectAllRecords();
        }
    },

    // This method is called when a node in this EditTree is selected. If the selected node is
    // a Canvas or FormItem node (or has a visual proxy), then select the object in the edit
    // context. Otherwise (non-SC class case), iterate up the tree to find the nearest ancestor
    // Canvas or FormItem node (or node having a visual proxy) and ensure that that ancestor node
    // is selected in the edit context, but restore the selection in the EditTree to the originally
    // selected node.
    //
    // For example, given this edit node tree:
    // - DataView0
    //   - NavPanel0
    //     - NavItem0
    //       - Label0
    //     - NavItem1
    //     - NavItem2
    // .. and supposing that Label0 is selected in the edit context, clicking on NavItem0 would
    // change the edit context's selection to NavPanel0, but NavItem0 would remain selected in
    // the tree to allow NavItem0's properties to be edited. Then, if Label0 was clicked, the
    // edit context's selection would be changed to Label0 (and Label0 would remain selected
    // in the tree).
    selectedNodeUpdated : function (editTreeClick) {
        var selectedNode = this.getSelectedRecord(),
            selectedObject = selectedNode && selectedNode.liveObject;

        for (var node = selectedNode; node != null; node = this.data.getParent(node)) {
            var object = node.liveObject;

            // Selecting a component in the Component Tree should make sure that the
            // component is visible upon selection where possible.
            
            if (isc.isA.Canvas(object) && !isc.isA.Menu(object) &&
                (!object.isDrawn() || !object.isVisible()) &&
                object.draw != isc.Canvas.NO_OP &&
                object.showRecursively)
            {
                object.showRecursively();
                if (object.isVisible() && !object.isDrawn()) {
                    // Give object a chance to draw before determining final selection
                    this.delayCall("selectedNodeUpdated", [editTreeClick]);
                    return;
                }
            }

            if (((isc.isA.Canvas(object) || isc.isA.FormItem(object)) &&
                 object.isDrawn() && object.isVisible()) ||
                (object != null && object._visualProxy != null))
            {
                if (editTreeClick) {
                    this._editTreeClick = true;
                }
                if (node === selectedNode) {
                    
                    isc.EditContext.selectCanvasOrFormItem(object, false, true);

                } else {
                    // Ensure that the nearest ancestor Canvas or FormItem object is selected
                    // in the context, but restore the node that was selected in this EditTree.
                    var selection = this.editContext.getSelectedEditNodes();
                    if (!selection.contains(node)) {
                        isc.EditContext.selectCanvasOrFormItem(object, false, true);

                        // If a DS is clicked don't re-select it
                        if (!isc.isA.DataSource(selectedObject) &&
                            !isc.isA.DynamicProperty(selectedObject))
                        {
                            this.selectSingleRecord(selectedNode);
                        }
                    } else if (isc.isA.DataSource(selectedObject) ||
                               isc.isA.DynamicProperty(selectedObject))
                    {
                        // Make sure a DS node is not selected
                        this.selectSingleRecord(node);
                    }
                }
                delete this._editTreeClick;

                break;
            }
            if (isc.isA.ValuesManager(object)) {
                isc.EditContext.selectCanvasOrFormItem(object, false, true);
                break;
            }
            // If component is non-UI but has explicitly set canSelect:true,
            // attempt to select it anyway. An example is a NavItem.
            if (object.editProxy && object.editProxy.canSelect == true) {
                var ctx = object.editContext;
                ctx.selectSingleComponent(object);
                break;
            }
        }
    },

    switchEditMode : function (editingOn) {
        this.editContext.switchEditMode(editingOn);
    },

    // Adding / Removing components in the tree
	// --------------------------------------------------------------------------------------------

    getEventDragData : function () {
        var dragData = this.ns.EH.dragTarget.getDragData();
        if (!dragData) return;

        if (isc.isAn.Array(dragData)) {
            if (dragData.length == 0) return;
            dragData = dragData[0];
        }
        return dragData;
    },

    dragStart : function () {
        var dragData = this.getEventDragData();
        if (!dragData) return;

        // Prevent dragging of component if it cannot be reparented.
        if (dragData.canReparent == false || dragData.canReparent == "false") {
            return false;
        }

        return this.Super("dragStart", arguments);
    },

    isValidDropFolder : function (dropTarget) {
        if (!this.Super("isValidDropFolder", arguments)) return false;
        var dragData = this.getEventDragData();
        if (!dragData) return false;
        var dragTarget = this.ns.EH.dragTarget;
        
        if (dropTarget == null) dropTarget = this.data.getRoot();
        var dragType = dragData.type || dragData.className;
        if (!dragType) return false;

        return this.editContext.canAddToTarget(dropTarget, dragType, dragTarget, dragData, true);
    },
    
    shouldShowDropIconForCell : function (node) {
        var dragData = this.getEventDragData();
        // For a component that is always dropped at the root level, don't show a drop line
        if (dragData && dragData.alwaysAllowRootDrop == true || dragData.alwaysAllowRootDrop == "true") {
            return false;
        }
        return this.Super("shouldShowDropIconForCell", arguments);
    },

    shouldShowDragLineForRecord : function(recordNum) {
        var dragData = this.getEventDragData();
        if (!dragData) return;

        // For a component that is always dropped at the root level, don't show a drop line
        if (dragData.alwaysAllowRootDrop == true || dragData.alwaysAllowRootDrop == "true") {
            return false;
        }

        return this.Super("shouldShowDragLineForRecord", arguments);
    },

    // Adjust drop index within a parentNode to remove DataSource node from applying
    adjustDropIndex : function (paletteNode, parentNode, index) {
        if (index == null) return index;

        var children = this.data.getChildren(parentNode),
            iscClass = isc.DataSource.getNearestSchemaClass(paletteNode.type)
        ;
        // When dropping a DS always drop at index=0
        if (iscClass && iscClass.isA(isc.DataSource)) {
            index = 0;
        } else {
            // Otherwise, if there is a DS above the drop, adjust index down
            for (var i = 0; i < Math.min(index, children.length); i++) {
                if (isc.isA.DataSource(children[i].liveObject)) {
                    index--;
                    break;
                }
            }
        }
        return index;
    },

    folderDrop : function (nodes, parentNode, index, sourceWidget) {
        if (sourceWidget != this && !sourceWidget.isA("Palette")) {
            // if the source isn't a Palette, do standard drop interaction
            return this.Super("folderDrop", arguments);
        }

        if (sourceWidget != this) {
            // Drop from palette
            var paletteNode = sourceWidget.transferDragData();
            if (!paletteNode) return;
            if (isc.isAn.Array(paletteNode)) paletteNode = paletteNode[0];

            // If node is dropped from a tree, clean it of internal properties
            if (sourceWidget.isA("TreePalette")) {
                paletteNode = sourceWidget.data.getCleanNodeData([paletteNode], false, false, false)[0];
            }

            // Palette node could be modified later if there are palettized components within.
            // Copy it now so that future drops are not affected.
            paletteNode = isc.clone(paletteNode);
            // flag that this node was dropped by a user
            paletteNode.dropped = true;

            this.logInfo("sourceWidget is a Palette, dropped node of type: " + paletteNode.type,
                         "editing");

            // If a DataSource node appears as a sibling earlier in the child list, remove it
            // from affecting the drop index
            index = this.adjustDropIndex(paletteNode, parentNode, index);

            // If parentNode doesn't have an editProxy that's not where we need to drop
            if (!parentNode.liveObject.editProxy) {
                parentNode = this.data.getParent(parentNode);
            }
            if (!isc.isA.DynamicForm(parentNode.liveObject) && parentNode.liveObject.editProxy) {
                // Defer add into normal editProxy drag-and-drop handler so that common actions
                // are applied.
                parentNode.liveObject.editProxy.completeDrop(paletteNode, { index: index });
            } else {
                
                var editNode = this.makeEditNode(paletteNode);
                editNode.dropped = true;
                parentNode.liveObject.editProxy.completeItemDrop(editNode, index);
            }
            return;
        }

        // Self-drop: Repositioning an existing editNode within the tree
        var newNode = (isc.isAn.Array(nodes) ? nodes[0] : nodes);

        // flag that this node was dropped by a user
        newNode.dropped = true;

        this.logInfo("sourceWidget is an existing editNode, dropped node of type: " + newNode.type,
                     "editing");

        var editTree = this;
        this.editContext.requestLiveObject(newNode, function (node) {
            if (node == null) return;
            // remove component from old location before re-adding
            var parentProperty = newNode.defaults.parentProperty;

            // If we're self-dropping to a slot further down in the same parent, this will
            // cause the index to become off by one
            var oldParent = editTree.data.getParent(newNode);
            if (parentNode == oldParent) {
                var oldIndex = editTree.data.getChildren(oldParent).indexOf(newNode);

                // If node has parentProperty specified the node could be intermingled
                // with other nodes having a different parentProperty. The oldIndex 
                if (oldIndex != null && oldIndex <= index) {
                    index--;
                }
            } else {
                // When dragging a component to a new parent don't retain the parentProperty
                parentProperty = null;
                if (node.defaults) delete node.defaults.parentProperty;
            }

            // When moving a node be sure it stays in the same open/close state after move.
            // By default, addNode() will open the node.
            var isOpen = editTree.data.isOpen(newNode);

            editTree.editContext.removeNode(newNode, null, true);

            // Allow new parent to adjust the drop index for a reposition. For example,
            // repositioning an item within a SectionStackSection should maintain that
            // any "controls" components stay as the first nodes of the children.
            var parentEditProxy = parentNode.liveObject && parentNode.liveObject.editProxy;
            if (parentEditProxy && parentEditProxy.adjustRepositionIndex) {
                index = parentEditProxy.adjustRepositionIndex(oldParent, newNode, index, parentProperty);
            }

            editTree.editContext.addNode(node, parentNode, index, parentProperty, null, null, true);
            if (!isOpen) editTree.closeFolder(node);

            editTree.editContext.fireNodeMoved(newNode, oldParent, node, parentNode);
        }, sourceWidget);
    },

    // for a node being added without a parent, find a plausible default node to add to.
    // In combination with palette.defaultEditContext, allows double-click (tree, list
    // palettes) as an alternative to drag and drop.
    getDefaultParent : function (newNode, returnNullIfNoSuitableParent) {
        if (this.editContext.defaultParent) return this.editContext.defaultParent;
        if (this.editContext.allowNestedDrops == false) {
            return this.data.getRoot()
        }

        // rules:
        // Start with the selected node. We select on drop / create, so this is typically
        // the last added node, but the user can select something else to take control of
        // where the double-click add goes
        // If this node accepts this type as a child, use that.
        // - handles most layout nesting, DataSource for last form, etc
        // Otherwise, go up hierarchy from this node
        // - handles a series of components that should not nest being placed adjacent instead,
        //   eg ListGrid then DynamicForm
        var type = newNode.type || newNode.className,
            node = this.getSelectedRecord();
        
        while (node && (!this.editContext.canAddToTarget(node, type, null, null, true) ||
                (node.liveObject.editProxy && node.liveObject.editProxy.allowNestedDrops == false)))
        {
            node = this.data.getParent(node);
        }
        
        var root = this.data.getRoot()
        if (returnNullIfNoSuitableParent) {
            if (!node && this.editContext.canAddToTarget(root, type, null, null, true)) return root;
            return node;
        }
        return node || root;
    },
    
    // give a newNode, ensure all of it's parents are visible
    showParents : function (newNode) {
        // While loading a screen, don't attempt to show parents because that will trigger
        // a tabSelected event when it shouldn't.
        if (isc._loadingNodeTree) return;

        // if something is dropped under a tab, ensure that tab gets selected
        var parents = this.data.getParents(newNode), 
            tabNodes = parents.findAll("type", "Tab");
        //this.logWarn("detected tab parents: " + tabNodes);
        if (tabNodes) {
            for (var i = 0; i < tabNodes.length; i++) {
                var tabNode = tabNodes[i],
                    tabSetNode = this.data.getParent(tabNode),
                    tab = this.editContext.getLiveObject(tabNode),
                    tabSet = this.editContext.getLiveObject(tabSetNode);
                tabSet.selectTab(tab);
            }
        }
    },

    // get clean component tree that can be serialized
    getCleanComponentData : function () {
        var tree = this.data;
        if (!tree) return;

        // get "clean node data" then remove liveObject from nodes
        var data = tree.getCleanNodeData(tree.root, true, true);
        if (data) tree.clearProperties(data, "liveObject", true);
        return data;
    },

    // Pass-thru properties
    // --------------------------------------------------------------------------------------------
    
    //> @attr editTree.autoEditNewNodes (Boolean : null : IR)
    // @include editContext.autoEditNewNodes
    // @visibility external
    //<

    //> @attr editTree.rootComponent (PaletteNode: null : IR)
    // @include editContext.rootComponent
    // @visibility external
    //<

    //> @attr editTree.defaultPalette (Palette : null : IR)
    // @include editContext.defaultPalette
    // @visibility external
    //<

    //> @attr editTree.extraPalettes (Array of Palette : null : IR)
    // @include editContext.extraPalettes
    // @visibility external
    //<

    //> @attr editTree.persistCoordinates (Boolean : true : IR)
    // @include editContext.persistCoordinates
    // @visibility external
    //<

    //> @attr editTree.allowNestedDrops (Boolean : null : IR)
    // @include editContext.allowNestedDrops
    // @visibility external
    //<

    //> @attr editTree.showSelectedLabel (Boolean : null : IR)
    // @include editContext.showSelectedLabel
    // @visibility external
    //<

    //> @attr editTree.selectedBorder (String : null : IR)
    // @include editContext.selectedBorder
    // @visibility external
    //<

    //> @attr editTree.selectedLabelBackgroundColor (String : null : IR)
    // @include editContext.selectedLabelBackgroundColor
    // @visibility external
    //<

    //> @attr editTree.canGroupSelect (Boolean : null : IR)
    // @include editContext.canGroupSelect
    // @visibility external
    //<

    //> @attr editTree.canDragGroup (Boolean : null : IR)
    // @include editContext.canDragGroup
    // @visibility external
    //<

    //> @attr editTree.hideGroupBorderOnDrag (Boolean : null : IR)
    // @include editContext.hideGroupBorderOnDrag
    // @visibility external
    //<

    //> @attr editTree.groupMask (AutoChild Canvas : null : IR)
    // @include editContext.groupMask
    // @visibility internal
    //<

    //> @attr editTree.useCopyPasteShortcuts (Boolean : null : IR)
    // @include editContext.useCopyPasteShortcuts
    // @visibility external
    //<

    // Adding / Removing components in the tree pass-thru methods
    // --------------------------------------------------------------------------------------------

    //> @method editTree.getRootEditNode()
    // @include editContext.getRootEditNode
    // @visibility external
    //<
    getRootEditNode : function () {
        return this.editContext.getRootEditNode();
    },

    //> @method editTree.makeEditNode
    // @include editContext.makeEditNode
    // @visibility external
    //<
    makeEditNode : function (paletteNode) {
        return this.editContext.makeEditNode(paletteNode);
    },

    //> @method editTree.getEditNodeTree()
    // @include editContext.getEditNodeTree
    // @visibility external
    //<
    getEditNodeTree : function () {
        return this.editContext.getEditNodeTree();
    },

    //> @method editTree.addNode()
    // @include editContext.addNode
    // @visibility external
    //<
    addNode : function (newNode, parentNode, index, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification) {
        return this.editContext.addNode(newNode, parentNode, index, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification);
    },

    //> @method editTree.addFromPaletteNode()
    // @include editContext.addFromPaletteNode
    // @visibility external
    //<
    addFromPaletteNode : function (paletteNode, parentNode, targetIndex, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification) {
        return this.editContext.addFromPaletteNode(paletteNode, parentNode, targetIndex, parentProperty, skipParentComponentAdd, forceSingularFieldReplace, skipNodeAddedNotification);
    },

    //> @method editTree.addFromPaletteNodes()
    // @include editContext.addFromPaletteNodes
    // @visibility external
    //<
    addFromPaletteNodes : function (paletteNodes, parentNode, index, parentProperty, skipNodeAddedNotification, isLoadingTree) {
        return this.editContext.addFromPaletteNodes(paletteNodes, parentNode, index, parentProperty, skipNodeAddedNotification, isLoadingTree);
    },

    //> @method editTree.removeNode()
    // @include editContext.removeNode
    // @visibility external
    //<
    removeNode : function (editNode, skipLiveRemoval, skipNodeRemovedNotification) {
        return this.editContext.removeNode(editNode, skipLiveRemoval, skipNodeRemovedNotification);
    },

    destroyNode : function (editNode) {
        return this.editContext.destroyNode(editNode);
    },

    //> @method editTree.reorderNode()
    // @include editContext.reorderNode
    // @visibility external
    //<
    reorderNode : function (parentNode, index, moveToIndex) {
        return this.editContext.reorderNode(parentNode, index, moveToIndex);
    },

    //> @method editTree.removeAll()
    // @include editContext.removeAll
    // @visibility external
    //<
    removeAll : function () {
        return this.editContext.removeAll();
    },
    
    //> @method editTree.destroyAll()
    // @include editContext.destroyAll
    // @visibility external
    //<
    destroyAll : function () {
        return this.editContext.destroyAll();
    },

    //> @method editTree.isNodeEditingOn()
    // @include editContext.isNodeEditingOn
    // @visibility external
    //<
    isNodeEditingOn : function (editNode) {
        return this.editContext.isNodeEditingOn(editNode);
    },

    //> @method editTree.enableEditing()
    // @include editContext.enableEditing
    // @visibility external
    //<
    enableEditing : function (editNode) {
        return this.editContext.enableEditing(editNode);
    },

    //> @method editTree.getNodeProperty()
    // @include editContext.getNodeProperty
    // @visibility external
    //<
    getNodeProperty : function (editNode, name) {
        return this.editContext.getNodeProperty(editNode, name);
    },

    //> @method editTree.setNodeProperties()
    // @include editContext.setNodeProperties
    // @visibility external
    //<
    setNodeProperties : function (editNode, properties, skipLiveObjectUpdate) {
        return this.editContext.setNodeProperties(editNode, properties, skipLiveObjectUpdate);
    },

    //> @method editTree.removeNodeProperties()
    // @include editContext.removeNodeProperties
    // @visibility external
    //<
    removeNodeProperties : function (editNode, properties) {
        return this.editContext.removeNodeProperties(editNode, properties);
    },

    //> @method editTree.getDefaultPalette()
    // @include editContext.getDefaultPalette
    // @visibility external
    //<
    getDefaultPalette : function () {
        return this.editContext.getDefaultPalette();
    },

    //> @method editTree.setDefaultPalette()
    // @include editContext.setDefaultPalette
    // @visibility external
    //<
    setDefaultPalette : function (palette) {
        return this.editContext.setDefaultPalette(palette);
    },

    // Copy and paste pass-thru methods
    // ---------------------------------------------------------------------------------------

    //> @method editTree.makePaletteNode()
    // @include editContext.makePaletteNode
    // @visibility external
    //<
    makePaletteNode : function (editNode) {
        return this.editContext.makePaletteNode(editNode);
    },

    //> @method editTree.makePaletteNodeTree()
    // @include editContext.makePaletteNodeTree
    // @visibility external
    //<
    makePaletteNodeTree : function (editNode) {
        return this.editContext.makePaletteNodeTree(editNode);
    },

    //> @method editTree.copyEditNodes()
    // @include editContext.copyEditNodes
    // @visibility external
    //<
    copyEditNodes : function (editNode) {
        this.editContext.copyEditNodes(editNode);
    },

    //> @method editTree.pasteEditNodes()
    // @include editContext.pasteEditNodes
    // @visibility external
    //<
    pasteEditNodes : function (targetEditNode) {
        this.editContext.pasteEditNodes(targetEditNode);
    },

    // Serialization pass-thru methods
    // --------------------------------------------------------------------------------------------

    //> @method editTree.addPaletteNodesFromXML()
    // @include editContext.addPaletteNodesFromXML
    // @visibility external
    //<
    addPaletteNodesFromXML : function (xmlString, parentNode, globals, callback) {
        return this.editContext.addPaletteNodesFromXML(xmlString, parentNode, globals, callback);
    },

    //> @method editTree.addPaletteNodesFromJSON()
    // @include editContext.addPaletteNodesFromJSON
    // @visibility external
    //<
    addPaletteNodesFromJSON : function (jsonString, parentNode, globals, callback) {
        return this.editContext.addPaletteNodesFromJSON(jsonString, parentNode, globals, callback);
    },

    //> @method editTree.getPaletteNodesFromXML()
    // @include editContext.getPaletteNodesFromXML
    // @visibility external
    //<
    getPaletteNodesFromXML : function (xmlString, callback) {
        return this.editContext.getPaletteNodesFromXML(xmlString, callback);
    },

    //> @method editTree.getPaletteNodesFromJS()
    // @include editContext.getPaletteNodesFromJS
    // @visibility external
    //<
    getPaletteNodesFromJS : function (jsCode, callback, keepGlobals) {
        return this.editContext.getPaletteNodesFromJS(jsCode, callback, keepGlobals);
    },

    //> @method editTree.addPaletteNodesFromJS()
    // @include editContext.addPaletteNodesFromJS
    // @visibility external
    //<
    addPaletteNodesFromJS : function (jsCode, parentNode, globals, callback) {
        return this.editContext.addPaletteNodesFromJS(jsCode, parentNode, globals, callback);
    },

    //> @method editTree.serializeAllEditNodes()
    // @include editContext.serializeAllEditNodes
    // @visibility external
    //<
    serializeAllEditNodes : function (settings) {
        return this.editContext.serializeAllEditNodes(settings);
    },
    
    //> @method editTree.serializeAllEditNodesAsJSON()
    // @include editContext.serializeAllEditNodesAsJSON
    // @visibility external
    //<
    serializeAllEditNodesAsJSON : function (settings, includeRoot) {
        return this.editContext.serializeAllEditNodesAsJSON(settings, includeRoot);
    },

    //> @method editTree.serializeEditNodes()
    // @include editContext.serializeEditNodes
    // @visibility external
    //<
    serializeEditNodes : function (nodes, settings) {
        return this.editContext.serializeEditNodes(nodes, settings);
    },

    //> @method editTree.serializeEditNodesAsJSON()
    // @include editContext.serializeEditNodesAsJSON
    // @visibility external
    //<
    serializeEditNodesAsJSON : function (nodes, settings) {
        return this.editContext.serializeEditNodesAsJSON(nodes, settings);
    },

    // Undo/redo pass-thru methods
    // --------------------------------------------------------------------------------------------

    //> @method editTree.undo()
    // @include editContext.undo
    // @visibility editModeUndoRedo
    //<
    undo : function () {
        return this.editContext.undo();
    },

    //> @method editTree.redo()
    // @include editContext.redo
    // @visibility editModeUndoRedo
    //<
    redo : function () {
        return this.editContext.redo();
    },

    //> @method editTree.resetUndoLog()
    // @include editContext.resetUndoLog
    // @visibility editModeUndoRedo
    //<
    resetUndoLog : function () {
        return this.editContext.resetUndoLog();
    }
});

// Placeholder
// --------------------------------------------------------------------------------------------

//> @class Placeholder
// A Placeholder is used in place of component while +link{group:devTools,editing} when an
// instance of the actual component cannot be created or when required properties are not yet
// provided that allow correct creation. See the <i>Designing Components for Editing &amp;
// Using Placeholder</i> section of +link{group:reify,Reify} for details.
// <p>
// Placeholder is a special class in that the properties that are directly assigned to the
// instance are not used by the placeholder. These are assumed to apply to the actual component
// for which the placeholder is replacing. Properties that control the placeholder itself are
// in +link{placeholder.placeholderDefaults,placeholderDefaults}.
// <p>
// On creation a Placeholder will automatically replace itself with the target component
// (+link{placeholderDefaults.placeholderFor}) when created from +link{RPCManager.createScreen}
// unless the project was loaded with +link{loadProjectSettings.allowPlaceholders} is
// <code>true</code>.
// <p>
// Note that <code>Placeholder</code> has a lowercase H because it is a single word in English.
//
// @inheritsFrom Label
// @group devTools
// @treeLocation Client Reference/Tools
// @visibility external
//<
isc.defineClass("Placeholder", "Label");

isc.Placeholder.addClassMethods({

    create : function (A,B,C,D,E,F,G,H,I,J,K,L,M) {
        // If capturing defaults from a screen definition, don't adjust how this placeholder
        // is created so the defaults are as-is
        if (!isc.captureDefaults) {
            // Basic properties are for the actual component. 'placeholderDefaults' are properties
            // for creation of the placeholder. When creating the placeholder, the actual
            // component properties need to be saved away for reference by the component editor.
            var componentDefaults = isc.addProperties({}, A, B, C, D, E),
                placeholderDefaults = componentDefaults.placeholderDefaults,
                autoID = componentDefaults.autoID,
                ID = componentDefaults.ID
            ;
            delete componentDefaults.placeholderDefaults;

            // If a Placeholder instance is being created outside of Reify but with screen
            // settings that don't specify to allow placeholders, create an instance of the
            // actual target component instead
            if (isc._loadingComponentXML &&
                    (!isc._createScreenSettings || isc._createScreenSettings.allowPlaceholders != true))
            {
                var className = placeholderDefaults.placeholderFor;
                if (className) {
                    try {
                        var newInstance = isc.ClassFactory.newInstance(className, componentDefaults);
                        if (newInstance) {
                            return newInstance;
                        }
                        placeholderDefaults.errorMessage = "Class not found";
                    } catch (e) {
                        placeholderDefaults.errorMessage = e;
                    }
                    placeholderDefaults.failedCreate = true;
                    isc.logWarn("Could not create instance of " + className + ". Placeholder will be used.");
                } else {
                    isc.logWarn("Placeholder is not configured with a className to create");
                }
            }

            // Don't scribble over caller's parameter object
            A = isc.addProperties({}, placeholderDefaults, { _componentDefaults: componentDefaults });

            if (autoID) A.autoID = autoID;
            if (ID) A.ID = ID;

            B = C = D = E = null;
        }

        // Create the normal placeholder instance
        return this.Super("create", [A,B,C,D,E,F,G,H,I,J,K,L,M]);
    }
});

isc.Placeholder.addClassMethods({
    // synonym for backwards compatibility
    // required so that isc.Placeholder.newInstance will call create method above.
    // without this synonym isc.Class.newInstance is called instead which skips our
    // class-specific create().
    newInstance : isc.Placeholder.create
});


isc.Placeholder.addProperties({
    _isPlaceholder: true,

    editProxyProperties: {
        // Placeholder doesn't support editMode inline editing
        supportsInlineEdit: false
    },

    //> @object PlaceholderDefaults
    // An object representing the configuration of the placeholder. When a placeholder is
    // created and not replaced by the target component, these are the properties that are
    // applied.
    // 
    // @group devTools
    // @treeLocation Client Reference/Tools/Placeholder
    // @visibility external
    //<

    //> @attr placeholderDefaults.placeholderFor (String : null : IR)
    // Name of the class that the placeholder replaces.
    // @visibility external
    //<

    //> @attr placeholderDefaults.requiredProperties (String : null : IR)
    // List of required properties on +link{placeholderFor} that are not yet provided.
    // @visibility external
    //<

    //> @attr placeholderDefaults.image (SCImgURL : null : IR)
    // Image to display in lieu of the usual placeholder text.
    // @visibility external
    //<

    //> @attr placeholder.placeholderDefaults (PlaceholderDefaults : null : IR)
    // Defaults applied to the placeholder instance when not replaced by the target component.
    // @visibility external
    //<

    padding: 10,
    align: "center",
    valign: "center",
    border: "1px solid red",

    init : function () {
        // Set the default contents and hover
        this.contents = this._getContents();
        this.prompt = this._getMessage();

        // Mark to use a custom schema in the ComponentEditor
        // There we want to edit properties of the original class, not a Placeholder
        this.useCustomSchema = this.placeholderFor;

        // Pull sizing details from the target class instance to be used in the placeholder
        if (this.placeholderFor) {
            var classObject = isc.ClassFactory.getClass(this.placeholderFor);
            if (classObject) {
                this.overflow = classObject.getInstanceProperty("overflow");
                this.defaultWidth = classObject.getInstanceProperty("defaultWidth");
                this.defaultHeight = classObject.getInstanceProperty("defaultHeight");
            }
            // Save for property reference
            this.classObject = classObject;
        }

        this.Super("init", arguments);
    },

    // Called to update the required properties such that the change is shown immediately
    setRequiredProperties : function (properties) {
        this.requiredProperties = properties;
        this.setContents(this._getContents());
        this.setPrompt(this._getMessage());
    },

    _getMessage : function () {
        var message;
        if (this.failedCreate) {
            message = "<b>" + this.placeholderFor + "</b> could not be created:<br>" + this.errorMessage;
        } else {
            message = "<b>Placeholder:</b> " + this.placeholderFor + "<br>" +
                      (this.requiredProperties ? "<b>Requires:</b> " + this.requiredProperties : "");
        }
        return message;
    },

    _getContents : function () {
        var message = this._getMessage(),
            image = this.image
        ;
        if (this.failedCreate) {
            // Don't show the placeholder image for a failure placeholder
            image = null;
        }
        return (image ? this.imgHTML(image) : message);
    },

    getComponentClassObject : function () {
        if (!this.classObject) {
            this.classObject = isc.ClassFactory.getClass(this.placeholderFor);
        }
        return this.classObject;
    },

    getEditableProperties : function (fieldNames) {
        var properties = {},
            undef,
            classObject
        ;
        if (!isc.isAn.Array(fieldNames)) fieldNames = [fieldNames];
        for (var i = 0; i < fieldNames.length; i++) {
            // Just in case we're passed fields rather than names
            var fieldName = isc.isAn.Object(fieldNames[i]) ? fieldNames[i].name : fieldNames[i],
                value = this._componentDefaults[fieldName]
            ;
            if (value == undef) {
                classObject = this.getComponentClassObject();
                if (classObject) {
                    value = classObject.getInstanceProperty(fieldName);
                }
            }
            // If this is an observation notification function, pick up the thing being observed,
            // not the notification function!
            if (isc.isA.Function(value) && value._isObservation) {
                value = this[value._origMethodSlot];
            }
            properties[fieldName] = value;
        }
        
        return properties;
    },

    // Called to apply properties to an object when it is edited in an EditContext via
    // EditContext.setNodeProperties(). 
    setEditableProperties : function (properties) {
        var idField = isc.DS.getAutoIdField(this),
            autoIdField = isc.DS.getToolAutoIdField(this)
        ;
        for (var key in properties) {
            // When setting the "autoID" field for an object, the corresponding "ID"
            // field should be updated instead. This matches the behavior during
            // object creation.
            if (idField && autoIdField && key == autoIdField) {
                this._componentDefaults[idField] = properties[key];
            } else {
                this._componentDefaults[key] = properties[key];
            }
        }
    }
});

} // end if (isc.TreeGrid)


// -----------------------------------------------------------------------------------------
// DynamicForm.rolloverControls

// INCOMPLETE IMPLEMENTATION - commented out for now
/*
isc.DynamicForm.addProperties({
    rolloverControlsLayoutDefaults: [],
    rolloverControls: []
    
});

isc.DynamicForm.addMethods({
    showRolloverControls : function (item) {
        var controls = this.getRolloverControls(item),
            layout = this.rolloverControlsLayout;
        layout.item = item;
        layout.setPageLeft();
        layout.moveTo(item.getPageLeft()+item.getPageWidth(), item.getPageTop());
    },
    hideRolloverControls : function (item) {
        this.rolloverControlsLayout.hide();
    },
    getRolloverControls : function (item) {
        if (!this.rolloverControlsLayout) {
            this.createRolloverControls(item);
        }

        return this.rolloverControls;
    },
    createRolloverControls : function (item) {
        this.addAutoChild("rolloverControlsLayout");
        this.createRolloverControls(item);
    }
});
*/

// This is a marker class for FormItem drag-and-drop in edit mode.  We use an instance of 
// this class (for efficiency, we just keep one cached against the EditContext class) so 
// that the DnD code knows we're really dragging a FormItem, which will be present on this 
// proxy canvas as property "formItem".
isc.ClassFactory.defineClass("FormItemProxyCanvas", "Canvas");

isc.FormItemProxyCanvas.addProperties({
    editProxyConstructor:"FormItemEditProxy",

    autoDraw: false,
    canDrop: true,
    setFormItem : function (formItem) {
        var oldFormItem = this.formItem;

        this.formItem = formItem;
        this.syncWithFormItemPosition();
        this.sendToBack();
        this.show();

        
        this._parentElement = formItem.form;

        if (formItem != oldFormItem) {
            if (oldFormItem && this.isObserving(oldFormItem, "visibilityChanged")) {
                this.ignore(oldFormItem, "visibilityChanged");
            }
            // Mirror visibility with underlying FormItem.
            // This allows the SelectionOutline to properly
            // hide/show itself to match.
            if (!this.isObserving(this.formItem, "visibilityChanged")) {
                this.observe(this.formItem, "visibilityChanged",
                    "observer.formItemVisibilityChanged()");
            }

            if (!this.editProxy) {
                this.editProxy = this.createAutoChild("editProxy");
                // Allow edit proxy to perform custom operations on edit mode change
                this.editProxy.setEditMode(true);
            }
        }
    },

    syncWithFormItemPosition : function () {
        if (!this.formItem || !this.formItem.form) return; // formItem not yet part of a form?
        this._syncing = true;
        this.setPageLeft(this.formItem.getPageLeft());
        this.setPageTop(this.formItem.getPageTop());
        // Make sure size isn't 0,0 so it will actually draw something
        this.setWidth(this.formItem.getVisibleWidth() || 10);
        this.setHeight(this.formItem.getVisibleHeight() || 10);
        this._syncing = false;
    },

    resizeTo : function (width, height) {
        // Prevent save while syncing from outline update
        var formItem = this.formItem;
        if (!this._syncing && formItem && formItem.editContext) {
            formItem.editContext.setNodeProperties(formItem.editNode, {
                width: width,
                height: height
            });
            formItem.redraw();
        }

        this.Super("resizeTo", arguments);
    },

    formItemVisibilityChanged : function () {
        if (this.formItem.isVisible()) this.show();
        else this.hide();
    },

    dragStart : function () {
        // If we are dragging the current selection and using the selection outline
        // (which include dragHandle) then reset the drag offset to [0,0],
        // top-left corner of the drag target
        if (this.formItem == isc.SelectionOutline.getSelectedObject()) {
            isc.EH.dragStartOffsetX = isc.EH.dragStartOffsetY = 0;
        }
        return true;
    }
});




//> @attr paletteNode.canvasDefaults (Canvas Properties : null : IR)
// @include paletteNode.defaults
// @visibility sgwt
//<
//> @attr paletteNode.formItemDefaults (FormItem Properties : null : IR)
// @include paletteNode.defaults
// @visibility sgwt
//<
//> @attr paletteNode.drawPaneDefaults (DrawPane Properties : null : IR)
// @include paletteNode.defaults
// @visibility sgwt
//<
//> @attr paletteNode.drawItemDefaults (DrawItem Properties : null : IR)
// @include paletteNode.defaults
// @visibility sgwt
//<
//> @attr paletteNode.canvasLiveObject (Canvas : null : IR)
// @include paletteNode.liveObject
// @visibility sgwt
//<
//> @attr paletteNode.formItemLiveObject (FormItem : null : IR)
// @include paletteNode.liveObject
// @visibility sgwt
//<
//> @attr paletteNode.drawPaneLiveObject (DrawPane : null : IR)
// @include paletteNode.liveObject
// @visibility sgwt
//<
//> @attr paletteNode.drawItemLiveObject (DrawItem : null : IR)
// @include paletteNode.liveObject
// @visibility sgwt
//<

//> @attr editNode.canvasDefaults (Canvas Properties : null : IR)
// @include editNode.defaults
// @visibility sgwt
//<
//> @attr editNode.formItemDefaults (FormItem Properties : null : IR)
// @include editNode.defaults
// @visibility sgwt
//<
//> @attr editNode.drawPaneDefaults (DrawPane Properties : null : IR)
// @include editNode.defaults
// @visibility sgwt
//<
//> @attr editNode.drawItemDefaults (DrawItem Properties : null : IR)
// @include editNode.defaults
// @visibility sgwt
//<
//> @attr editNode.canvasLiveObject (Canvas : null : IR)
// @include editNode.liveObject
// @visibility sgwt
//<
//> @attr editNode.formItemLiveObject (FormItem : null : IR)
// @include editNode.liveObject
// @visibility sgwt
//<
//> @attr editNode.drawItemLiveObject (DrawItem : null : IR)
// @include editNode.liveObject
// @visibility sgwt
//<
//> @attr editNode.drawPaneLiveObject (DrawPane : null : IR)
// @include editNode.liveObject
// @visibility sgwt
//<



if (!(isc.licenseType == "Enterprise" || isc.licenseType == "Eval" || isc.licenseType == "Dev" || //Dev==devenv
      isc.licenseType == "AllModules" || isc.licenseType.contains("licenseType")))
{
    
    [
        "EditContext", "Palette", "HiddenPalette", "TreePalette", "ListPalette", "TilePalette",
        "MenuPalette", "EditPane", "EditTree", "FormItemProxyCanvas"
    ].map(function (editModeClass) {
        isc[editModeClass]._vbOnly = true;
    });

    
    isc.EditContext.vbOnly = true;
}

//> @groupDef toolsDeployment
// SmartClient provides a number of tools:
// <ul> 
// <li> +link{group:adminConsole}
// <li> +link{group:dbConfigTool}
// <li> +link{group:reify}
// <li> +link{group:balsamiqImport}
// <li> +link{group:debugging, Developer Console}
// </ul>
// <P>
// To deploy the tools simply 
//
// <smartclient>copy the <code>tools</code> directory into your deployment.</smartclient>
// <smartgwt>inherit the <code>com.smartgwtee.tools.Tools</code> module.</smartgwt> 
//
// There are no additional settings to configure. 
// <P>
// <h4>Security</h4>
// <P>
// These tools are, by default, available to anyone and enable access to all "BuiltinRPCs"
// and the Filesystem DataSource so they should only be deployed into a trusted environment.
// Alternately, the tools can easily be restricted to administrators or end users
// by protecting the <code>tools</code> path with normal authentication and authorization
// mechanisms on the web server.  
// <P>
// More fine-grained access control can be installed by updating each tool's <code>xxxOperations.jsp</code>
// file (ex. tools/adminConsoleOperations.jsp). These files are
// responsible for enabling builtinRPC and FileSystem DataSource access. Individual
// BuiltinRPC methods can be restricted, for example, such that some users are allowed to load screens but
// not save any changes. See comments within each file for an example of restricting this access.
// See the server-side Javadocs for methods provided by <code>BuiltinRPC</code>.
// <P>
// Note that the tools provides a "live" interface to the provided DataSources. In
// other words, if a DataSource supports saving and a tool enables editing, real saves will be
// initiated. 
// <P>
// <h4>Developer Console</h4>
// Unlike the other tools, the Developer Console is always safe to
// deploy to production environments.   On its own, it only exposes the kind of information that 
// an end user is already able to get using browser tools such as Firebug.  By default then, it 
// is always available at 
// 
// <smartclient>[webroot]/isomorphic/system/helpers/Log.html.</smartclient>
// <smartgwt>[webroot]/[gwtModuleName]/sc/system/helpers/Log.html.</smartgwt>
// 
// <P>
// When loaded, the Developer Console will attempt to reach the page at tools/developerConsoleOperations.jsp 
// and, if available, will provide access to additional functionality that should normally be 
// restricted in production environments (ex. server logs).
// <P>
// For production deployment of the Developer Console with full functionailty available to admins, 
// just deploy the tools module with password protection as described above.  The method for finer-
// grained access control described above is also supported by developerConsoleOperations.jsp.
// 
// @title Tools Deployment
// @treeLocation Concepts/Deploying SmartClient
// @visibility external
//<

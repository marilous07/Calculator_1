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
//>	@class	ValuesManager
//
// The ValuesManager manages data from multiple member forms.
// <P>
// If a single logical form needs to be separated into multiple DynamicForm instances for
// Layout purposes (for example, spanning one logical form across multiple Tabs), a
// ValuesManager can be used to make the forms act as one logical form, supporting all
// value-related APIs otherwise called on DynamicForm directly.
// <P>
// A ValuesManager has no visual representation - it is strictly a logical entity, and the
// member forms provide the user interface.  You can initialize a ValuesManager with a set of
// member forms (by setting +link{ValuesManager.members} at init) or add and remove member
// forms dynamically.
// <P>
// Calling +link{ValuesManager.setValues()} on a ValuesManager will automatically route new
// field values to whichever member form is showing an editor for that field.  Likewise,
// calling +link{ValuesManager.validate()} will validate all member forms, and
// +link{ValuesManager.saveData()} will initiate a save operation which aggregates values from
// all member forms.
// <P>
// Like a DynamicForm, a ValuesManager can be databound by setting
// +link{valuesManager.dataSource}.  In this case all member forms must also be bound to the
// same DataSource.
// <P>
// In general, when working with a ValuesManager and its member forms, call APIs on the
// ValuesManager whenever you are dealing with values that span multiple forms, and only call
// APIs on member forms that are specific to that form or its fields.
// <P>
// Note that, just as a DynamicForm can track values that are not shown in any FormItem, a
// ValuesManager may track values for which there is no FormItem in any member form.  However,
// when using a ValuesManager these extra values are only allowed on the ValuesManager itself.
// Member forms will not track values for which they do not have FormItems.
//
// @treeLocation Client Reference/Forms
// @visibility external
// @example formSplitting
// @see group:memoryLeaks
//<
isc.ClassFactory.defineClass("ValuesManager");

isc.ValuesManager.addClassMethods({
    //> @classMethod valuesManager.getById()
    // Retrieve a ValuesManager by it's global +link{Canvas.ID,ID}.
    // @param ID (String) global ID of the ValuesManager
    // @return (ValuesManager) the ValuesManager, or null if not found
    // @visibility external
    //<
    getById : function (sId) {
        var vm = window[sId] || null;
        return vm ? (isc.isA.ValuesManager(vm) ? vm : null) : null;
    }
});

isc.ValuesManager.addProperties({

    //> @attr valuesManager.dataSource  (DataSource | GlobalId : null : [IRW])
    // Specifies a dataSource for this valuesManager.  This dataSource will then be used for
    // validation and client-server flow methods.  Can be specified as a dataSource object or
    // an identifier for the dataSource.<br>
    // Note that member forms should have the same dataSource applied to them to allow their
    // items to inherit properties from the DataSource fields.
    // @visibility external
    // @see valuesManager.setDataSource()
    // @see valuesManager.getDataSource()
    //<
    //dataSource: null,

    //> @attr valuesManager.addOperation
    // +link{DSRequest.operationId,operationId} to use when performing add operations.
    // @include DataBoundComponent.addOperation
    //<

    //> @attr valuesManager.updateOperation
    // +link{DSRequest.operationId,operationId} to use when performing update operations.
    // @include DataBoundComponent.updateOperation
    //<

    //> @attr valuesManager.removeOperation
    // +link{DSRequest.operationId,operationId} to use when performing remove operations.
    // @include DataBoundComponent.removeOperation
    //<

    //> @attr valuesManager.validateOperation
    // +link{DSRequest.operationId,operationId} to use when performing validate operations.
    // @include DataBoundComponent.validateOperation
    //<

    //> @attr valuesManager.fetchOperation
    // +link{DSRequest.operationId,operationId} to use when performing fetch operations.
    // @include DataBoundComponent.addOperation
    //<

    //> @attr valuesManager.members (Array of DynamicForm : null : [IRW])
    // The set of member components for this valuesManager.  These can be specified at init time
    // via the <code>members</code> property, or updated at runtime via <code>addMember()</code>
    // and <code>removeMember()</code>.<br>
    // Note: Alternatively a DataBoundComponent can be initialized as a member of a valuesManager
    // by setting the <code>valuesManager</code> property of the component to a pre-defined 
    // valuesManager instance, or by calling <code>setValuesManager</code> on the component.
    // @visibility external
    // @see valuesManager.addMember()
    // @see valuesManager.removeMember()
    // @see Canvas.setValuesManager()
    //<
    //members : null,    
    
    //>	@attr valuesManager.unknownErrorMessage	(String : null : [IRW])
    // The error message for a failed validator that does not specify its own errorMessage.
    // <P>
    // If unset this value will be derived from the default 
    // +link{dataBoundComponent.unknownErrorMessage} when the valuesManager is initialized.
    //<
	unknownErrorMessage : null
    
    //> @attr valuesManager.disableValidation   (boolean : null : [IRWA])
    // @include DynamicForm.disableValidation
    //<
    
    //> @attr valuesManager.autoSynchronize   (boolean : null : [IRWA])
    // If explicitly set to false, prevents the ValuesManager from automatically propagating
    // data value changes to its members.  You can manually synchronize member data values 
    // at any time with a call to +link{synchronizeMembers}.
    // @visibility external
    //<

});

//!>Deferred
isc.ValuesManager.addMethods({
    // Allow a V.M to be initialized with member form(s)
    init : function () {
        // get a global ID so we can be called in the global scope
        this.ns.ClassFactory.addGlobalID(this);
        
        if (this.unknownErrorMessage == null) {
            this.unknownErrorMessage = isc.Canvas.getPrototype().unknownErrorMessage;
        }
        
        if (this.dataSource) this.bindToDataSource(this.dataSource);

        // Initialize this.values [and ensure it's a new object, so it can't be manipulated
        // externally]
        if (this.values == null) this.values = {};
        isc.DynamicForm._duplicateValues(this, this.values, {});
        
        // Set up values based on members / init values.
        if (this.members != null) {
            
            var members = this.members;
            this.members = null;
            if (!isc.isAn.Array(members)) members = [members];
            for (var i = 0; i < members.length; i++) {
                this.addMember(members[i]);
            }
        }
        // remember the current values for resetting
        this.rememberValues();
    },
    
    // on destroy
    // - disconnect from member forms (Don't destroy - they may want to be re-used in a 
    //   different VM)
    // - clear global ID
    destroy : function () {
        var members = this.members;
        if (members) {
            // iterate backwards so the changing length of the members array doesn't mess up
            // our loop
            for (var i = members.length-1; i >= 0; i--) {
                this.removeMember(members[i]);
            }
        }
        // clear the global ID
        window[this.getID()] = null;
        this.Super("destroy", arguments);
    },
    
    // This is a VM-specific override of the method specified on EditorActionMethods.  It is 
    // necessary because forms only edit flat structures (even if dataPaths mean that the 
    // values in those flat structures are derived from arbitrary places in a complex nested
    // structure), whereas ValuesManagers have to cope with any kind of data structure
    _saveDataReply : function (request, response, data) {
        var members = this.getMembers();
        if (!this.suppressServerDataSync && response && response.status >= 0 && data != null) {
            if (isc.isAn.Array(data)) data = data[0];
            if (request.data) request.data = isc.shallowClone(request.data);
            // Determine if we have a nested data structure - this makes targetted updates
            // of item values (as opposed to a blunt call to 'setValues(...)' trickier.            
            var nestedDataStructure = false;
                
            if (members) {
                for (var i = 0; i < members.length; i++) {
                    var widgetDP = members[i].dataPath;
                    if (widgetDP != null && widgetDP != "/") {
                        nestedDataStructure = true;
                    } else if (isc.isA.DynamicForm(members[i])) {
                        var items = members[i].getItems(),
                            itemDPs = items.getProperty("dataPath");
                        for (var ii = 0; ii < itemDPs.length; ii++) {
                            if (itemDPs[ii] != null && itemDPs[ii] != "/") {
                                nestedDataStructure = true;
                                break;
                            }
                        }
                    }
                    if (nestedDataStructure) break;
                }
            }
            
            if (nestedDataStructure) {
               this.setValues(data);
               
            
            } else {

                // Note: if request.originalData is present, use this rather than request.data
                // This handles the case where request.data may have been reformatted / modified before
                // sending to the server
                // [For example see restDataSource / postMessage dataProtocol where request.data will
                //  be a serialized block of XML]
                // request.originalData matches the values as it was retrieved from the form when
                // the save was kicked off.
                // For iscServer operations use request.data
                // - this object will already be in the "standard" format, and we don't save off
                //   request.originalData in this code-path 
                var submittedValues =(request.originalData || request.data),
                    currentValues = this.getValues();
                
                var hasChanges = false,
                    rememberValues = true,
                    undef;

                // apply per-field changes from submitted to server-saved values to the values object.
                for (var fieldName in data) {
                    // If the value for this field is undefined in the submitted data, that probably
                    // means it was stripped by the sparseUpdates logic, so we can't compare it to 
                    // the current value.  However, we can compare it to the corresponding member of
                    // _oldValues - the fact that it was stripped by sparseUpdates means that it was
                    // unchanged, so if it is different now, it has changed since we sent the update
                    // to the server
                    var compareVal = submittedValues[fieldName] === undef ? 
                                        this._oldValues[fieldName] : submittedValues[fieldName];
                                    
                    var field = this.getField(fieldName);
                    // check whether the form item has changed since submission
                    if (this.fieldValuesAreEqual(field, currentValues[fieldName], compareVal)) {
                        // if not, check whether the server changed the submitted value to
                        // something else
                        if (!this.fieldValuesAreEqual(field, compareVal, data[fieldName])) {
                            currentValues[fieldName] = data[fieldName];
                            hasChanges = true;
                        }
                
                    } else {
                        // value in the form has changed since being submitted
                        rememberValues = false;
                    }
                }
                if (hasChanges) {
                    // apply changed field values from serverData directly to this.values
                    
                    this._saveValues(currentValues);
                }
                // Loop through all the items and update them to reflect the changed values.
                // note: we can't just use the attribute names from 'serverData' - dataPaths applied
                // to items mean we may be reaching into a nested object on the response.
                // We also use this loop to determine whether any changes have been made to items
                // since submission (for fields that weren't present in the submitted values object)
                var items = this.getItems();
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (isc.isAn.UploadItem(item)) continue;
                    var path = item.dataPath || item.name;
                    if (path == null) continue;
                    
                    var submittedVal = isc.DynamicForm._getFieldValue(path, item, submittedValues, this, true, "edit");
                
                    if (submittedVal === undef || 
                        this.fieldValuesAreEqual(item, submittedVal, item.getValue())) 
                    {
                        if (hasChanges) {
                            var serverVal = isc.DynamicForm._getFieldValue(path, item, data, this, true, "edit");
                        
                            if (!this.fieldValuesAreEqual(item, submittedVal, serverVal)) {
                                item.setValue(serverVal);
                            }
                        }
                    } else {
                        rememberValues = false;
                    }
                }
            
                // When the user modifies the values in the form before saving them
                // 'valuesHaveChanged' will return false.
                // Once the save actually completes, if the user hasn't further edited the values,
                // we're effectively editing the (unchanged) record again. At this point
                // re-remember values so valuesHaveChanged returns true.
                if (rememberValues)  {
                    this.rememberValues();
                }
            }
          
            // If this was an add operation, drop the currently specified saveOperationType now
            // if the response included primary key data for the newly added record we're now
            // updating an existing record. We already have logic to catch this case in
            // getSaveOperationType().
            if (this.saveOperationType == "add") delete this.saveOperationType;
            // Also drop the saveOperatonType on member forms. This ensures
            // isNewRecord etc return the expected values on the DynamicForm.
            
            var memberForms = (this.members ? this.members.duplicate() : []);
            for (var i = 0; i < memberForms.length; i++) {
                var form = memberForms[i];
                if (!isc.isA.DynamicForm(form)) continue;
                form.saveOperationType = null;
            }
        }
        
        this._callbackState = {
            request: request,
            response: response,
            serverData: data
        };
        
        // Reset the internal property used to handle calling 'formSaved' on each member 
        // in turn
        this._formSavedIndex = 0;

        // since this is a successful save, clear the pendingStyles - __saveDataReply is checked
        // in FormItem.updatePendingState() 
        this.__saveDataReply = true;
        for (var i = 0; i < members.length; i++) {
            if (members[i] && members[i].updatePendingStyles) members[i].updatePendingStyles();
        }
        delete this.__saveDataReply;

        this.formSavedComplete();
    },
    
    // given a member with dataArity:"multiple", 
    _updateMultipleMemberValue : function (index, field, value, member) {
        // Index is the index of a record within an array
        // Field is an optional field identifier within that record.
        // combineDataPaths() will combine these, ("5/someFieldName"), or
        // if no field was specified turn the index into a string ("5"), which
        // will be understood by downstream dataPath parsing logic
        
        var dataPathFragment = this._combineDataPaths(index,field);
        return this._updateValue(dataPathFragment, value, member, true);
    },
    
    // _updateValue and _clearValue() -- called by member components to notify us of
    // value changes
    // The first param is basically an attribute identifier, typically a fieldName
    // or dataPath fragment. For multiple dataArity components this may include
    // the (quoted) index of a record within an array
    _updateValue : function (identifier, value, member, isMultipleMember) {
        if (this._synchronizingMembers) return;
        
        // warn on value with no associated items in dynamicForms
        if (!isMultipleMember && isc.isA.DynamicForm(member) && member.getItem(identifier) == null) {
            this._itemlessValueWarning(member, identifier);
            return;
        }
        
        // if the component has a dataPath, prepend it to the fieldName/dataPath passed in so
        // we store values hierarchically (unless the field's dataPath is fully-qualified)
        var dataPath = member.getFullDataPath(),
            field; // field will be set up below for non-multiple members
        
        if (!isMultipleMember) {
            var field = member && member.getField ? member.getField(identifier) : null,
                fieldName = identifier;

            if (fieldName != null && isc.isAn.Object(fieldName)) {
                
                fieldName = fieldName.dataPath || fieldName.name;
            }
            // combine datapaths here
            if (fieldName) {
                // handle an item having an "absolute" dataPath
                if (dataPath == null || fieldName.startsWith(isc.Canvas._$slash)) {
                    dataPath = fieldName;
                } else {
                    dataPath = this._combineDataPaths(dataPath, fieldName);
                }
            }
            // If we didn't pick up a field from the item, grab it from our DS
            if (field == null) {
                var ds = this.getDataSource();
                if (ds) field = ds.getFieldForDataPath(dataPath);
            }

        } else { // We were passed a record index (dataArity:multiple component), not a field name
            if (!dataPath) {
                dataPath = identifier;
            } else if (!dataPath.endsWith(isc.Canvas._$slash)) {
                dataPath += isc.Canvas._$slash + identifier;
            } else {
                dataPath += identifier;
            }
        }
        
        isc.DynamicForm._saveFieldValue(dataPath, field, value, this.values, member, true, "vm_updateValue");
        var isDataPath = dataPath.contains(isc.Canvas._$slash);
        if (isDataPath && this.autoSynchronize !== false) {
            var elements = dataPath.split(isc.Canvas._$slash);
            if (parseInt(elements[elements.length-1]) == elements[elements.length-1]) {
                // The last element of the dataPath is an index, which implies that the updating
                // member is a selectionComponent.  Therefore, we refresh every member of the 
                // VM that has "member" as a selectionComponent
                this.synchronizeMembers(member);
            } else {
                var fields = this.getFieldsForDataPath(dataPath || fieldName);
                this._synchronizingMembers = true;
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i].form == member) continue;
                    
                    fields[i].saveValue(value);
                    fields[i]._showValue(value);

                }
                delete this._synchronizingMembers;
            }
        }
    },

    //> @method valuesManager.synchronizeMembers() 
    // Update all of this ValuesManager's members to reflect the current values held by the
    // ValuesManager.  It is not normally necessary to manually synchronize members, but you
    // will need to do so if you switch off +link{autoSynchronize,automatic synchronization}.
    // @see valuesManager.synchronizeMember()
    // @see valuesManager.synchronizeMembersOnDataPath()
    // @visibility external
    //<
    // Undocumented selComp param allows _updateValue to use this method for its own purposes 
    // (ie, refreshing just those members that have a particular selectionComponent)
    synchronizeMembers : function (selComp) {
        if (!this.members) return;
        // Suppress any ruleContext change events which causes to _needsRuleContextChanged
        // to be set if there are any ruleContext changes made.
        this._needsRuleContextChanged = false;
        for (var i = 0; i < this.members.length; i++) {
            if (!selComp || this.members[i].selectionComponent == selComp) {
                this.synchronizeMember(this.members[i], null, true);
            }
        }
        if (this._needsRuleContextChanged) {
            // Fire changed event on the first member. It doesn't matter which member
            // is used because they all share the same ruleScope.
            this.members[0].fireRuleContextChanged(this.members[0]);
        }
    },
    
    //> @method valuesManager.synchronizeMembersOnDataPath() 
    // Update just those of this ValuesManager's members that have the parameter 
    // +link{canvas.dataPath,dataPath}, to reflect the current values held by the
    // ValuesManager. Note, it is not normally necessary to manually synchronize members
    // @param dataPath (String)   dataPath to synchronize
    // @see valuesManager.synchronizeMember()
    // @see valuesManager.synchronizeMembers()
    // @visibility external
    //<
    synchronizeMembersOnDataPath : function (dataPath) {
        if (!this.members) return;
        // Suppress any ruleContext change events which causes to _needsRuleContextChanged
        // to be set if there are any ruleContext changes made.
        this._needsRuleContextChanged = false;
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].dataPath == dataPath) {
                this.synchronizeMember(this.members[i], null, true);
            }
        }
        if (this._needsRuleContextChanged) {
            // Fire changed event on the first member. It doesn't matter which member
            // is used because they all share the same ruleScope.
            this.members[0].fireRuleContextChanged(this.members[0]);
        }
    },
    
    //> @method valuesManager.synchronizeMember() 
    // Update the parameter ValuesManager member to reflect the current values held by the
    // ValuesManager. Note, it is not normally necessary to manually synchronize members
    // @param member (Canvas)   Member component to synchronize
    // @see valuesManager.synchronizeMembers()
    // @see valuesManager.synchronizeMembersOnDataPath()
    // @visibility external
    //<
    
    synchronizeMember : function (member, pickupValues, suppressRuleContextChangeEvent) {
        if (!member) return;
        if (!this.members || !this.members.contains(member)) {
            this.logWarn("synchronizeMember called with component ID " + member.ID + 
                         ".  This component is not a member of this valuesManager");
             return;
        }
        this._synchronizingMembers = true;
        this._setMemberValues(member, pickupValues, suppressRuleContextChangeEvent);
        delete this._synchronizingMembers;
        if (this.memberSynchronized && isc.isA.Function(this.memberSynchronized)) {
            this.memberSynchronized(member);
        }
    },
    
    //> @method valuesManager.memberSynchronized() 
    // Fires after a member component's values have been synchronized from the ValuesManager's
    // values, upon completion of the +link{synchronizeMember()} call.  
    // <smartclient>No default implementation.</smartclient>
    // @param member (Canvas)   Member component that has just completed synchronization
    // @see valuesManager.synchronizeMember()
    // @see valuesManager.synchronizeMembers()
    // @see valuesManager.synchronizeMembersOnDataPath()
    // @visibility external
    //<
    
    _combineDataPaths : function (baseDP, fieldDP) {
        if (isc.isAn.Object(fieldDP)) {
            fieldDP = fieldDP.dataPath || fieldDP.name;
        }
        return isc.DynamicForm._combineDataPaths(baseDP, fieldDP);
    },
    // fieldName may be an array of field IDs
    _itemlessValueWarning : function (member, fieldName) {
        this.logWarn("Member Form: " + member +
                 " has explicitly specified value for field[s] '" + fieldName + "', but has" +
                 " no item associated with this fieldName. Ignoring this value. " +
                 "Values may be set for fields with no associated form item directly " + 
                 "on the valuesManager via valuesManager.setValues(), but not on " +
                 "member forms. See ValuesManager documentation for more info.");
    },

    _clearValue : function (field, form) {
        
        
        var dataPath = form.getFullDataPath();
        if (dataPath) field = this._combineDataPaths(dataPath, field);
        return isc.DynamicForm._clearFieldValue(field, this.values);
    },
    
    // ----------------------------------------------------------------------------------------
    // Databound functionality
    // ----------------------------------------------------------------------------------------
    
    //> @method ValuesManager.bindToDataSource() ([A])
    //   Associate this ValuesManager with a DataSource.  Allows the developer to inherit 
    //   properties from the DataSource fields to be applied to these values, such as validators,
    //   and to call data flow methods using this ValuesManager's data.
    // @param (DataSource)  Datasource object, or identifier
    // @visibility internal
    //<
    // For the public version of this method use 'setDataSource'
    bindToDataSource : function (ds) {

        
        if (!isc.isA.DataSource(ds)) ds = isc.DataSource.getDataSource(ds);
        if (ds != null) this.dataSource = ds;

        if (ds != null && !this.isObserving(ds, "dataChanged")) {
            // internal observation of ds.dataChanged, which is used to provide cache
            // sync for DBCs with a DS but no RS
            this.observe(ds, "dataChanged", "observer.vmDataSourceDataChanged(observed,dsResponse,dsRequest)");
        }
    
    },
    vmDataSourceDataChanged : function (dataSource, dsResponse, dsRequest) {
        
        
        
        
        if (this.destroyed || this.destroying) return;
    
        var ds = this.getDataSource();
        if (ds.getID() != dataSource.getID()) {
            // ignore the internal observation of ds.dataChanged, now on a different DS
            if (this.isObserving(dataSource, "dataChanged")) {
                this.ignore(dataSource, "dataChanged");
            }
            return;
        }
        if (dsResponse.operationType == "update") {
            var values = this.getValues() || {};
            var pks = ds.getPrimaryKeyFieldNames() || [];
            // ignore if the DS has no pk-fields, or code below will match every time
            if (pks.length > 0) {
                var records = isc.isAn.Array(dsResponse.data) ? dsResponse.data : [dsResponse.data],
                    valuePKs = isc.applyMask(this.values, pks)
                ;
                for (var i=0; i<records.length; i++) {
                    var recordPKs = isc.applyMask(records[i], pks);
                    if (isc.objectsAreEqual(valuePKs, recordPKs)) {
                        this.logInfo("Data updated by cache-sync");
                        this.setValues(isc.addProperties({}, values, records[i]));
                        break;
                    }
                }
            }
        }
    
    },
  
    //>@method  valuesManager.setDataSource() (A)
    // Specifies a dataSource for this valuesManager.  This dataSource will then be used for
    // validation and client-server flow methods.
    // @visibility external
    // @param dataSource (DataSource | GlobalId)  Datasource object or identifier to bind to.
    //<
    setDataSource : function (dataSource, fields) {
        // we don't use 'fields'
        this.bindToDataSource(dataSource);
    },
    
    //>@method  valuesManager.getDataSource() (A)
    // Returns the dataSource for this valuesManager.  Will return null if this is not a 
    // data-bound valuesManager instance.
    // @visibility external
    // @return (DataSource)  Datasource object for this valuesManager.
    //<
    getDataSource : function () {
        if (isc.isA.String(this.dataSource)) {
            if (this.serviceNamespace || this.serviceName) {
                this.dataSource = this.lookupSchema();
            } else {
                var ds = isc.DS.get(this.dataSource);
                if (ds != null) return ds;
        
                // support "dataSource" being specified as the name of a global, and if so, assign
                // that to this.dataSource
                ds = this.getWindow()[this.dataSource];
                if (ds && isc.isA.DataSource(ds)) return (this.dataSource = ds);
            }
        }
        return this.dataSource;
    },
    
    lookupSchema : function () {
        // see if we have a WebService instance with this serviceName / serviceNamespace
        var service;
        if (this.serviceName) service = isc.WebService.getByName(this.serviceName, this.serviceNamespace);
        else service = isc.WebService.get(this.serviceNamespace);
    
        if ((this.serviceNamespace || this.serviceName) && service == null) {
            this.logWarn("Could not find WebService definition: " +
                         (this.serviceName ? "serviceName: " + this.serviceName : "") +
                         (this.serviceNamespace ? "   serviceNamespace: " + this.serviceNamespace : "")
                         + this.getStackTrace());
        }
        
        // If this.dataSource is not a String, we shouldn't have ended up here
        if (!isc.isA.String(this.dataSource)) {
            this.logWarn("this.dataSource was not a String in lookupSchema");
            return;
        }
        
        if (service) return service.getSchema(this.dataSource);
    },
    
    // support retrieving a pointer to a field object defined in a dataSource by fieldID / dataPath
    
    getDataSourceField : function (fieldID) {
        var ds = this.getDataSource();
        if (!ds || !fieldID) return null;
        
        fieldID = fieldID.trim("/");
        var dataSource = this.getDataSource(),
            segments = fieldID.split("/"),
            field;
        for (var i = 0; i < segments.length; i++) {
            if (isc.isAn.emptyString(segments[i])) continue;
            var fieldId = segments[i];
            field = dataSource.getField(fieldId);
            dataSource = field ? isc.DataSource.getDataSource(field.type) : dataSource;
        }
        return field;
    },
    
    
    //>@method valuesManager.getItems()
    // Retrieves all form items contained within this valuesManager's member forms
    // @return (Array of FormItem) form items present in this valuesManager
    //<
    getItems : function () {
        if (!this.members) return [];
        var items = [];
        for (var i = 0; i < this.members.length; i++) {
            var form = this.members[i];
            if (!form.getItems) continue;
            items.addList(form.getItems());
        }
        return items;
    },
    // getFields() synonym of getItems
    getFields : function () {
        return this.getItems();
    },
    
    // Getting pointers to actual items
    //>@method ValuesManager.getItem()
    // Retrieve a +link{FormItem} from this ValuesManager.
    // <P>
    // Takes a field +link{formItem.name,name} or +link{type:DataPath}, and searches through the
    // members of this valuesManager for an editor for that field. If found the appropriate
    // formItem will be returned. If the "retrieveAll" parameter is true, this method will return 
    // all FormItems that are bound to the supplied name or dataPath (a dataPath can be bound
    // to more than one FormItem, as long as those FormItems are on different forms); if 
    // "retrieveAll" is false or unset, and there is more than one binding for the dataPath, 
    // this method just returns the first one it finds.<p>
    // Note that if a dataPath is passed in, it should be the full data path for the item, 
    // including any canvas level +link{canvas.dataPath,dataPath} specified on the member 
    // form containing this form item.
    // <br>Note: Unlike the <code>DynamicForm</code> class, this method will not return an 
    // item by index
    // @param itemID (FieldName | DataPath) item fieldName or dataPath identifier
    // @param [retrieveAll] (boolean)       If true, return the list of all FormItems that
    //                                      are bound to this name or dataPath on a member 
    //                                      form of this ValuesManager
    // @return (FormItem) form item for editing/displaying the appropriate field, or null if 
    //  no formItem can be found for the field.
    // @visibility external
    //<
    getItem : function (name, retrieveAll) {
        return this._findMemberByField(name, true, retrieveAll);
    },
    
    getField : function (id) {
        return this.getItem(id);
    },
    
    getFieldsForDataPath : function (id) {
        return this.getItem(id, true);
    },
        
    //>@method  ValuesManager.getMembers()   
    //  Retrieves an array of pointers to all the members for this valuesManager.
    // @return (Array of DynamicForm)   array of member forms
    // @visibility external
    // @group members
    //<    
    getMembers : function () {
        return this.members;
    },
    
    //>@method  ValuesManager.getMember()
    //  Returns a pointer to a specific member.
    // @param   ID  (String)    ID of the member component to retrieve
    // @return (Canvas)   member (or null if unable to find a member with the 
    // specified ID).
    // @visibility external
    // @group members
    //<
    
    getMember : function (ID) {
        // Since the members are all DynamicForm instances, their IDs are global
        var member = window[ID];
        // sanity check
        if (this.members && this.members.contains(member)) return member;
        return null;
    },
    
    //>@method  ValuesManager.getMemberForField()
    // Given a fieldName or dataPath, this method will find the member responsible for
    // interacting with that field's value.
    // If no form is found, returns null.
    // @param fieldName (String) fieldName or dataPath to check
    // @return (Canvas) member responsible for displaying this field (may be null).
    // @group members
    // @visibility external
    //<
    getMemberForField : function (fieldName, retrieveAll) {
        return this._findMemberByField(fieldName, false, retrieveAll);
    },
    
    // helper for getItem() / getMemberForField()
    // Determines which member manages a fieldName or dataPath and returns the appropriate member
    // or item from within a member form
    // Handles cases where a dataPath is partially specified on an item and partially on 
    // a member form
    
    _findMemberByField : function (fieldName, getItem, retrieveAll) {
        
        if (!this.members || fieldName == null || isc.isAn.emptyString(fieldName)) return null;
        
        var trimmedFieldName = fieldName.trim(isc.Canvas._$slash);
        
        // determine whether the fieldName passed in was a dataPath once before
        // looping through members
        var dataPathSegments = trimmedFieldName.split(isc.Canvas._$slash);
        
        // retrieveAll parameter - implies we should return an array of components that match
        // the specified fieldName
        // We only really expect to see multiple components pointing at the same field if we have
        // a 'multiple:true' field with a dataArity:"multiple" component such as a listGrid and
        // a / some dataArity:"single" components such as forms for editing details of it.
        // Note that this is not true of FormItem-level bindings - it is legitimate for multiple
        // form fields to bind to the same "normal" (ie, non-multiple, non-DataSource-typed)
        // DS field as long as they are on different forms.  This allows, eg, binding a complex
        // structure to a set of DFs displayed in a tabSet, with some general information - 
        // customer name or order number, for example - displayed on every form
        var results = retrieveAll ? [] : null;
        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i],
                memberDataPath = member.getFullDataPath();
            
            // if a member has dataPath set to "/" work with the fieldName directly
            if (memberDataPath == isc.Canvas._$slash || isc.isAn.emptyString(memberDataPath)) {
                memberDataPath = null;
            } else if (memberDataPath != null) {
                memberDataPath = memberDataPath.trim(isc.Canvas._$slash);
            }
            
            if (dataPathSegments && dataPathSegments.length > 0 && memberDataPath != null) {
                
                var soFar = null;
                for (var ii = 0; ii < dataPathSegments.length; ii++) {
                    // we've split the dataPath into segments
                    // generate a string showing the partial dataPath up to this depth                    
                    soFar = !soFar ? dataPathSegments[ii] 
                                   : (soFar + isc.Canvas._$slash + dataPathSegments[ii]);
                    if (memberDataPath.endsWith(isc.Canvas._$slash)) {
                        memberDataPath = memberDataPath.substring(0,memberDataPath.length-1);
                    }
                    
                    // if we have a match, we still may need to check fields within the 
                    // member to ensure the fields match
                    // Example - a member may have dataPath "contacts"
                    // and an item in that member may have dataPath "address/email"
                    if (memberDataPath == soFar) {
                        // If the member has an explicit dataPath matching the
                        // dataPath passed in, just return it
                        
                        if (!getItem && (ii == dataPathSegments.length-1)) {
                            if (!retrieveAll) return member;
                            
                            results.add(member);
                            // break out of the inner loop and check the next member!
                            break;
                        }
                        if (member.getField) {
                            var remainingPath = dataPathSegments.slice(ii+1).join(isc.Canvas._$slash);
                            
                            // this'll catch the case where the item has a partial datapath
                            // or the last level of nesting is handled by fieldName
                            var item = member.getField(remainingPath);
                            if (item) {
                                if (getItem) {
                                    if (!isc.isA.FormItem(item)) item = null;
                                    if (retrieveAll) {
                                        if (item) results.add(item);
                                    } else {
                                        return item
                                    } 
                                } else {
                                    if (retrieveAll) results.add(member);
                                    else return member;
                                }
                            }
                        }
                    }
                }
            } else {
                // handle being passed (EG) "/someField" - this can happen if
                // a dataPath is specified on a component as explicit "/", or if a field has 
                // an absolute path
                // If the form had no expicit dataPath we can just use getItem() whether the
                // value passed in is a datapath or a fieldName
                if (this.members[i].getItem) {
                    var field = this.members[i].getField(fieldName);
                    if (!field) {
                        if (fieldName.startsWith(isc.Canvas._$slash)) {
                            field = this.members[i].getField(fieldName.substring(1));
                        }
                    }
                    if (field) {
                         if (getItem) {
                            if (!isc.isA.FormItem(field)) field = null;
                            if (retrieveAll) {
                                if (field) results.add(field);
                            } else {
                                return field;
                            }
                         } else {
                             if (retrieveAll) results.add(member);
                             else return member;
                         }
                    }
                }
            }
        }
        return retrieveAll ? results : null;
    },
    
    
    // How to handle fileItems?
    // Assume only one fileItem per member form - on saveData(), we'll grab the fileItemForm
    // from our member form and use it to submit all our values.
    
    getFileItemForm : function () {
        if (!this.members) return;
        var hasFileItemForm = false, fileItemForm;
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].getFileItemForm == null) continue;
            var form = this.members[i].getFileItemForm();
            if (form) {
                if (hasFileItemForm) {
                    this.logWarn("ValuesManager defined with more than one member form " +
                            " containing a FileItem. This is not supported - binary data may " +
                            "only be uploaded from one FileItem when saving ValuesManager data");                              
                } else {
                    fileItemForm = form;
                    hasFileItemForm = true;
                }
            }
        }
        return fileItemForm;
    },
    
    // Validation:
    
    //> @method valuesManager.validate()
    // Validate the current set of values for this values manager against validators defined
    // in the member forms. For databound valuesManagers, also perform validation against any
    // validators defined on datasource fields.
    // <P>
    // Note that if validation errors occur for a value that is not shown in any member forms,
    // those errors will cause a warning and +link{handleHiddenValidationErrors()} will be
    // called.  This can occur if:<br>
    // - A datasource field has no corresponding item in any member form<br>
    // - The item in question is hidden<br>
    // - The member form containing the item is hidden.
    // <P>
    // If this form has any fields which require server-side validation (see 
    // +link{Validator.serverCondition}) this will also be initialized. Such validation will
    // occur asynchronously.  Developers can use +link{ValuesManager.isPendingAsyncValidation()}
    // and +link{valuesManager.handleAsyncValidationReply()} to detect and respond to
    // asynchronous validation.
    // <P>
    // Note that for silent validation, +link{valuesAreValid()} (client-side) and 
    // +link{checkForValidationErrors()} (client and server-side) can be used instead.
    //
    // @return  (Boolean)   true if all validation passed
    // @visibility external
    // @example formSplitting
    // @see method:dynamicForm.validate
    //<
    
    validate : function (validateHiddenFields, ignoreDSFields, typeValidationsOnly,
                         checkValuesOnly, skipServerValidation, suppressShowErrors)
    {
        // Just bail if client-side validation is disabled.
        // Note that we'll still show the errors returned from a failed server save due to
        // 'setErrors' behavior
        if (this.disableValidation) return true;

        // skip validation if we're databound and our datasource has validation disabled
        if (this.dataSource && this.dataSource.useLocalValidators != null &&
            this.useLocalValidators == false) return true;
    
        var hadErrors = this.hasErrors();
    
        // clear hidden errors before starting any validation run
        this.clearHiddenErrors();
    
        // For databound valuesManagers, each member form will be responsible for validating
        // the fields it shows, and the valueManager will validate the rest.  Note that this 
        // works OK even for member forms that are attached to multiple: true fields, because
        // you cannot edit a value for one record and then switch records with the 
        // selectionComponent without losing your edits, unless you explicitly save (in other
        // words, the current values in a member form are the only ones that can have errors,
        // unless the data that came into the ValuesManager in the first place was in error)
        var returnVal = true,
            // fields are returned from ds in {fieldName:fieldObject} format
            dsFields = this.dataSource ? isc.addProperties({}, this.getDataSource().getFields()) 
                                       : null,
            validators = {},
            dataPaths = {},
            isDataPath = false;
            
        // Keep track of all possible dataPaths, so we know which ones have been validated by 
        // member components and which must be validated here
        this.buildDataPathsRecursively(dataPaths, "", this.getDataSource());

        // track forms doing async validation - this is our context
        if (!skipServerValidation) this._pendingAsyncMembers = [];
        else                delete this._pendingAsyncMembers;
        var pendingMembers = this._pendingAsyncMembers;

        // First go through all the member forms and perform validation.            
        if (this.members) {
            // Wrap field validation in a queue so that server validators are
            // sent as a single request.
            var wasAlreadyQueuing = isc.rpc ? isc.rpc.startQueue() : false;

            for (var i = 0; i < this.members.length; i++) {
                if (!isc.isA.DynamicForm(this.members[i])) continue;
                var form = this.members[i],
                    disableValidation = form.disableValidation,
                    items = this.members[i].getItems();     
                    
                if (!disableValidation) {
                    // we don't want any user-defined handleHiddenValidationErrors to fire on the 
                    // form - instead we'll fire this method at the valuesManager level only.
                    // Implement this by applying our own 'handleHiddenValidationErrors' method to
                    // the form that notifies us what the errors were.
                    if (form.handleHiddenValidationErrors != null) {
                        this.logInfo("form level 'handleHiddenValidationErrors' method suppressed " +
                                     "in favor of valuesManager level handler", "validation");
                        form._prevHHVE = form.handleHiddenValidationErrors;
                    }
                    form.handleHiddenValidationErrors = this._handleHiddenFormErrors;
                }
                
                for (var j = 0; j < items.length; j++) {
                    var fieldName = items[j].getFullDataPath() || items[j].getFieldName();
                    isDataPath = isDataPath || (fieldName && fieldName.contains(isc.Canvas._$slash));
                    // IF the form shares a dataSource with this VM instance, 
                    // remove the appropriate field from our copy of the dataSource fields - 
                    // we have already validated this value.
                    
                    if (dsFields && this.members[i].getDataSource() == this.getDataSource()) {
                        delete dsFields[fieldName];
                    }
                    if (dataPaths && fieldName) {
                        delete dataPaths[fieldName.trim(isc.Canvas._$slash)];
                    }
                }
                // Allow the form to perform its own validation.
                // Validate hidden fields (makes sense since we validate hidden forms!)
                // Pass the additional param to suppress validating DS fields for which there
                // are no items though, since we handle these at the VM level.
                // This will also display validation errors, or fire the method to handle
                // validation errors while hidden.
                var formSuccess = disableValidation ? true : 
                        // suppress showErrors here - we'll show them explicitly from 
                        // VM.showErrors
                        form.validate(true, true, typeValidationsOnly, checkValuesOnly, 
                                      skipServerValidation, true, pendingMembers);

                // if checkValuesOnly is set, formSuccess may be an error object
                if (checkValuesOnly) {
                    if (formSuccess != true) {
                        if (returnVal == true) returnVal = formSuccess;
                        else this._combineErrors(returnVal, formSuccess);
                    }
                    continue;
                }
                returnVal = (returnVal && formSuccess);                

                if (!disableValidation) {
                    if (form._preHHVE) form.handleHiddenValidationErrors = form._preHHVE;
                    else delete form.handleHiddenValidationErrors;
                }
                if (!formSuccess) {
                    // If the form itself is hidden, add its full set of errors to our hidden
                    // form validation errors object.
                    if (!(form.isDrawn() && form.isVisible())) {
                        this.addHiddenErrors(form.errors, form);

                    // Otherwise, add just the hidden errors.
                    } else {
                        this.addHiddenErrors(form.getHiddenErrors(), form);
                    }
                }
            }

            // Submit server validation requests queue
            if (!wasAlreadyQueuing && isc.rpc) isc.rpc.sendQueue();
        }


        // we now have to perform validation on the DS fields not present in any member form
        var values = this.getValues(),
            errors = {},
            work = isDataPath ? dataPaths : dsFields;
            
        for (var fieldName in work) {
        
            var fieldObject = work[fieldName],
                validators = fieldObject.validators,
                value = isc.DynamicForm._getFieldValue(fieldName, fieldObject, values, null, 
                                                       true, "validate");
            if (validators != null) {
                // iterate through the validators again, this time actually checking each one
                for (var i = 0; i < validators.length; i++) {
                    // validators is an array of validator objects, each of which has the form
                    //    {type:"validatorType", errorMessage:"message", optionalParam:"", ...}
                    var validator = validators[i];
                    if (!validator) continue;
                    // Unless we're looking at a 'required' or 'requiredIf' field,
                    // don't try to validate null values.
                    
                    if (value == null
                        && validator.type != 'required' && validator.type != "requiredIf")
                    {
                        continue;
                    }
                    // we have no item, so pass the field object to processValidator()
                    // This roughly matches what we do in ListGrid validation
                    if (!this.processValidator(fieldObject, validator, value, null, values)) {
                        if (errors[fieldName] == null) errors[fieldName] = [];
                        var errorMessage = validator.errorMessage || this.unknownErrorMessage;
                        errors[fieldName].add(errorMessage);
                    }
                }
            }
            
            // for consistency with forms - if we got a single error, store as a string, not
            // a single element array
            if (errors[fieldName] && errors[fieldName].length == 1) {
                errors[fieldName] = errors[fieldName][0];
            }
        }

        // if checkValuesOnly is set, return an error object like DF.validate()
        if (checkValuesOnly) {
            if (!isc.isAn.emptyObject(errors)) {
                if (returnVal == true) returnVal = errors;
                else this._combineErrors(returnVal, errors);
            }
            return returnVal;
        }

        // add hidden errors from fields that are not associated with any form.        
        this.addHiddenErrors(errors);

        var hasErrors = this.hasErrors();
        // if we had errors before, or we have errors now, show errors
        
        if (hadErrors || hasErrors) {
            this.showErrors(true);
        }

        if (isc.getKeys(errors).length > 0) returnVal = false;

        return returnVal;
    },

    // combine a new set of errors with an old one
    _combineErrors : function (oldErrors, newErrors) {
        for (var fieldName in newErrors) {
            var oldFieldErrs = oldErrors[fieldName],
                newFieldErrs = newErrors[fieldName]
            ;
            oldErrors[fieldName] = oldFieldErrs ? 
                this._addFieldErrors(oldFieldErrs, newFieldErrs) : newFieldErrs;
        }
    },
    
    //> @method ValuesManager.valuesAreValid()
    // Method to determine whether the current set of values for this values manager would pass
    // validation by the validators defined in the member forms.  This method operates
    // client-side, without contacting the server, running validators on the forms' values and
    // returning a value indicating whether validation was successful.
    // <P>
    // Note that, like +link{validate()}, this method will perform value validation even if:<ul>
    // <li>A datasource field has no corresponding item in any member form</li>
    // <li>The item in question is hidden</li>
    // <li>The member form containing the item is hidden</li></ul>
    // <P>
    // Unlike +link{ValuesManager.validate()} this method will not store the errors on the forms
    // or display them to the user.
    // @param [returnErrors] (boolean) If unset, this method returns a simple boolean value indicating
    // success or failure of validation. If this parameter is passed, this method will return
    // an object mapping each field name to the errors(s) encountered on validation failure, or null
    // if validation was successful.
    // @return (boolean | Map) Boolean value indicating validation success, or if 
    // <code>returnErrors</code> was specified, <smartclient>an object mapping</smartclient>
    // <smartgwt>a map of</smartgwt> field names to the associated errors, for those fields that
    // failed validation, or null if validation succeeded.
    // @visibility external
    // @group validation
    //<
    valuesAreValid : function (returnErrors) {
        var errors = this.validate(true, null, null, true, true);
        if (errors === true) {
            return returnErrors ? null   : true;
        } else {
            return returnErrors ? errors : false;
        }
    },

    //> @method ValuesManager.checkForValidationErrors
    // Performs silent validation of the value manager values, like +link{valuesAreValid()}.  In
    // contrast to +link{valuesAreValid()}, this method allows checking for server-side errors, and
    // finding out what the errors are.  
    // <P>
    // The callback must be passed unless server-side validation is being skipped, and If passed,
    // it always fires, errors or not, firing synchronously if server validation is skipped.
    //
    // @param callback (ValidationStatusCallback) callback to invoke after validation is complete
    // @param [skipServerValidation] (boolean) whether to skip doing server-side validation
    //
    // @return (Map) null if server-side validation is required, or no errors are present;
    // otherwise, <smartclient>an object mapping</smartclient><smartgwt>a Map of</smartgwt> field
    // names to the associated errors, for those fields that failed validation.
    //
    // @visibility external
    // @group validation
    //<
    checkForValidationErrors : function (callback, skipServerValidation) {
        
        var errors = this.validate(true, null, null, true, true);
        if (errors === true) errors = null;

        // return immediately if errors detected or skipping server-side validation
        var dataSource = this.getDataSource();
        if (errors || skipServerValidation || !dataSource) {
            if (callback != null) this.fireCallback(callback, "errorMap", [errors]);
            return errors;
        }

        if (!callback) {
            this.logWarn("checkForValidationErrors(): no callback has been provided, but not " +
                         "skipping server-side validation - this is invalid usage");
            return;
        }
        
        // validate the data on the server
        var values = this.getValues(),
        context = this.buildRequest(null, "validate");
        context.editor = this;

        var manager = this;
        dataSource.validateData(values, function (response, data) {
            var errors = response.status == isc.RPCResponse.STATUS_VALIDATION_ERROR && 
                response.errors ? response.errors : null;
            // translate server error format to editor component error format
            
            if (errors && !manager.reportRawServerErrors) {
                errors = isc.DynamicForm.getSimpleErrors(errors);
            }
            this.fireCallback(callback, "errorMap", [errors]);
        }, context);
    },

    buildDataPathsRecursively : function(dataPaths, parentDP, dataSource) {
        if (!isc.isA.DataSource(dataSource)) return;

        if (dataSource.__vmVisited) {
           this.logWarn("detected ds loop at: " + parentDP + ", refusing to recurse further");
           return;
        }
        dataSource.__vmVisited = true;

        var fields = dataSource.getFields();
        for (var key in fields) {
            dataPaths[parentDP + key] = fields[key];
            if (dataSource.fieldIsComplexType(key)) {
                var subDS = dataSource.getSchema(fields[key].type);
                this.buildDataPathsRecursively(dataPaths, parentDP + key + isc.Canvas._$slash, subDS);
            }
        }
        delete dataSource.__vmVisited;
    },
    
    //> @method valuesManager.getValidatedValues()
    // Call +link{valuesManager.validate()} to check for validation errors. If no errors are found,
    // return the current values for this valuesManager, otherwise return null.
    // @return (Object) current values or null if validation failed.
    // @group errors
    // @visibility external
    //< 
    getValidatedValues : function () {
        if (!this.validate()) return null;
        return this.getValues();
    },     
    
    // Handler for hidden form validation errors. This method is applied directly to the 
    // member form
    _handleHiddenFormErrors : function (errors) {
        var vm = this.valuesManager;
        vm.addHiddenErrors(errors, this);
        return false;   // suppress the standard warning
    },
    
    
    clearHiddenErrors : function () {
        delete this.hiddenErrors;
    },

    // addHiddenErrors()
    // For a valuesManager, hidden validation errors may come from:
    // - a field in the dataSource not associated with any member form item
    // - a hidden item in a member form
    // - a hidden or undrawn member form.
    
    addHiddenErrors : function (errors, form) {
        if (errors == null || isc.isAn.emptyObject(errors)) return;
        
        if (!this.hiddenErrors) this.hiddenErrors = {};
        if (form) {
            if (isc.isA.Canvas(form)) form = form.getID();
        } else form = this.getID();
        
        if (!this.hiddenErrors[form]) this.hiddenErrors[form] = {};
            
        for (var fieldName in errors) {
            this.hiddenErrors[form][fieldName] = 
                this._addFieldErrors(this.hiddenErrors[form][fieldName], errors[fieldName]);
        }
    },
    
    // Returns the current snapshot of hidden errors in a flat list
    getHiddenErrors : function (suppressSynch) {

        if (!suppressSynch) {
            this.synchHiddenErrors();
        }
        
        if (!this.hiddenErrors) return null;
        var flatErrors = {};
        for (var form in this.hiddenErrors) {
            this.assembleHiddenErrorsRecursively(flatErrors, this.hiddenErrors[form]);
        }
        return flatErrors;
    },
    
    assembleHiddenErrorsRecursively : function (flatErrors, formErrors, key, index) {
        if (key == null) key = "";
        var outKey = key;
        if (index != null) outKey += "[" + index + "]";
        if (isc.isA.List(formErrors)) {
            for (var i = 0; i < formErrors.length; i++) {
                if (formErrors[i] !== null) {
                    if (isc.isAn.Object(formErrors[i])) { 
                        this.assembleHiddenErrorsRecursively(flatErrors, formErrors[i], outKey, i);
                    } else {
                    if (flatErrors[outKey] == null) flatErrors[outKey] = [];
                        flatErrors[outKey][i] = formErrors[i];
                    }
                }
            }
        } else if (isc.isAn.Object(formErrors)) {
            for (var objKey in formErrors) {
                if (isc.isAn.Object(formErrors[objKey])) {
                    if (outKey == "") {
                        this.assembleHiddenErrorsRecursively(flatErrors, formErrors[objKey], objKey);
                    } else {
                        this.assembleHiddenErrorsRecursively(flatErrors, formErrors[objKey], 
                                                         outKey + isc.Canvas._$slash + objKey);
                    }
                } else {
                    if (outKey == "") {
                        flatErrors[objKey] = formErrors[objKey];
                    } else {
                        flatErrors[outKey + isc.Canvas._$slash + objKey] = formErrors[objKey];
                    }
                }
            }
        } else {
            flatErrors[outKey] = formErrors;
        }
        return flatErrors;
    },
    
    
    // synchHiddenErrors()
    // This is a method to ensure that our 'hiddenErrors' object returned by getHiddenErrors()
    // and passed to handleHiddenValidationErrors is in synch with the current set of 
    // visible forms / items.
    // Required in the case where 
    // - setErrors() was called, 
    // - form/item visibility was changed, 
    // - showErrors() called.
    
    synchHiddenErrors : function () {
        
        var hiddenErrors = this.hiddenErrors,
            vmID = this.getID();
                    
        // Logic for errors that occurred on fields with no associated member form item 
        // (when errors were stored)
        if (hiddenErrors && hiddenErrors[vmID]) {
            for (var field in hiddenErrors[vmID]) {
                var errors = hiddenErrors[vmID][field],
                    item = this.getItem(field),
                    memberForm = item ? item.form : null;
                    
                // If there is now an associated member form item, we need to add the
                // field error to the form, and update this.hiddenErrors
                if (item) {
                    memberForm.addFieldErrors(field, errors);
                    // clear out the hidden error under the valuesManager's ID - the error
                    // is now associated with a form.
                    delete hiddenErrors[vmID][field];
                }
            }
        }
        
        // Update hidden errors for each form.
        // Quickest to just re-generate hidden errors per form rather than trying to synch with 
        // existing stored hiddenErrors object.
        var vmErrors = hiddenErrors[vmID];
        hiddenErrors = this.hiddenErrors = {};
        if (vmErrors) hiddenErrors[vmID] = vmErrors;
        // Now iterate through every member's errors and add to hidden members arrays if 
        // necessary
        if (this.members) {
            for (var i = 0; i< this.members.length; i++) {
                if (!isc.isA.DynamicForm(this.members[i])) continue;
                var member = this.members[i],
                    memberID = member.getID(),
                    memberErrors = member.errors;
                if (!memberErrors || isc.isAn.emptyObject(memberErrors)) continue;
                
                // shortcut - if the form is hidden always store all its errors. This may
                // overwrite an already up to date this.hiddenErrors[formID] but is quicker
                // than iterating through the errors doing comparisons.
                if (!member.isVisible() || !member.isDrawn()) {
                    memberErrors = isc.addProperties({}, memberErrors);
                    hiddenErrors[memberID] = memberErrors;
                } else {
                    // catch items that have been hidden or removed
                    for (var field in memberErrors) {
                        var item = member.getItem(field);
                        if (!item) {
                            if (!hiddenErrors[vmID]) hiddenErrors[vmID] = {};
                            hiddenErrors[vmID][field] = memberErrors[field];
                            // just delete the field from the form's errors object
                            delete memberErrors[field];
                            
                        } else if (!item.visible) {
                            if (!hiddenErrors[memberID]) hiddenErrors[memberID] = {};
                            hiddenErrors[memberID][field] = memberErrors[field];
                        }
                    }
                }
            }
        }
        
    },
    
    //>	@method	valuesManager.processValidator()	(A)
    //			process a single validator for a field.
    //
    //		@param	[item]		(Object)	Form item displaying the value. May be null if no
    //                                      form item exists for the field.
    //		@param	validator	(Object)	validation object
    //		@param	value		(String)	value for this field.
    //      @param  [type]      (String)    validator type. if not passed this is derived from
    //                                      the <code>type</code> property on the validation parameter
    // @param record (Object) Field values for record being validated.
    //
    //		@return	(boolean)	true == passed validation, false == validation failed
    //		@group	validation
    //<
    processValidator : function (item, validator, value, type, record) {
        
        var additionalContext = null;
        if (this.getDataSource()) {
            additionalContext = {
                dataSource: this.getDataSource().getID()
            };
        }
        return isc.Validator.processValidator(item, validator, value, type, record, additionalContext);
    },

    // _handleHiddenValidationErrors()
    // Internal method to display validation errors when we can't show them in a form.
    // This is used to handle 
    // - errors coming from an undrawn or hidden member form
    // - errors coming from hidden items in a member form
    // - errors coming from a dataSource field for which we have no member form item.
    // Note these errors are all combined into a single object retrieved via this.getHiddenErrors()
    // if a developer needs to determine which form an error came from, they can use
    // getMemberForField()
    // Additional suppressSynch parameter - if we know the hidden errors are in synch with
    // the currently visible set of members / fields (IE this has been called directly from
    // setErrors() or validate()) we can skip the logic to ensure that this.hiddenErrors
    // is up to date.
    _handleHiddenValidationErrors : function (suppressSynch) {
        var errors = this.getHiddenErrors(suppressSynch);
        
        // bail if there were no errors on hidden fields
        if (errors == null || isc.getKeys(errors).length == 0) return;
        
        // If we have an implementation to handle the hidden validation errors, call it now.
        var returnVal;
        if (this.handleHiddenValidationErrors) {
            returnVal = this.handleHiddenValidationErrors(errors);
        }
        
        if (returnVal == false) return;
        
        // Log a warning unless this was suppressed by the handleHiddenValidationErrors method.
        var errorString = "Validation failed with the following errors:";
        var errorArray = isc.isAn.Array(errors) ? errors : [errors];
        for (var i = 0; i < errorArray.length; i++) {
            var theErrors = errorArray[i];
            for (var fieldName in theErrors) {
                var fieldErrors = errors[fieldName];
                if (!isc.isAn.Array(fieldErrors)) fieldErrors = [fieldErrors];
                if (fieldErrors.length == 0) continue;

                errorString += "\n" + fieldName + ":";
                for (var i = 0; i < fieldErrors.length; i++) {
                    errorString += (i == 0 ? "- " : "\n - ") + fieldErrors[i];
                }
            }
        }
        // A validation error for user entered data is normal and should not be logged as a warning.
        this.logInfo(errorString, "validation");
    },
    
    // Validation errors APIs
    
    //>	@method	valuesManager.setErrors() [A]
    // Sets validation errors for this valuesManager to the specified set of errors.
    // Errors should be of the format:<br>
    // <code>{field1:errors, field2:errors}</code><br>
    // where each <code>errors</code> object is either a single error message string or an
    // array of error messages.<br>
    // If <code>showErrors</code> is passed in, error messages will be displayed in the 
    // appropriate member form items. For fields with no visible form item, 
    // +link{valuesManager.handleHiddenValidationErrors()} will be fired instead.<br>
    // Note that if <code>showErrors</code> is false, errors may be shown at any time via
    // a call to +link{ValuesManager.showErrors()}.
    //
    // @param   errors  (Object) list of errors as an object with the field names as keys
    // @param   showErrors (boolean) If true display errors now.
    // @group errors
    // @visibility external
    //<
    setErrors : function (errors, showErrors) {
        this.clearHiddenErrors();
        if (isc.isA.List(errors)) errors = errors[0];
        //errors = isc.DynamicForm.formatValidationErrors(errors);
        
        var memberForms = (this.members ? this.members.duplicate() : []);

        for (var i = 0; i < memberForms.length; i++) {
            if (!isc.isA.DynamicForm(memberForms[i])) continue;
            var form = memberForms[i],
                hiddenForm = !form.isVisible() || !form.isDrawn(),
                items = form.getItems(),
                formErrors = {},
                hiddenFormErrors = {},
                selectionChain = form.getSelectionChain();
            for (var j = 0;j < items.getLength(); j++) {
                var item = items[j],
                    itemDataPath = item.getFullDataPath(),
                    itemName = item.getFieldName(),
                    itemErrors = this.getItemErrors(errors, itemDataPath, selectionChain);
                if (itemErrors != null) {
                    formErrors[itemName] = itemErrors;

                    if (hiddenForm || !item.visible) {
                        hiddenFormErrors[itemName] = itemErrors;
                    }
                    this.deleteItemErrors(errors, itemDataPath, selectionChain);
                }
            }
            // suppress redraw and suppress form-level hiddenValidationError handling
            form.setErrors(formErrors, false);

            // hang onto the hidden form errors so we can fire the hiddenValidationErrors
            // handler.
            // Note: track hidden errors by form - see comments near
            // addHiddenErrors() / _getHiddenErrors() for more on this
            if (!isc.isAn.emptyObject(hiddenFormErrors)) 
                this.addHiddenErrors(hiddenFormErrors, form);
        }
        
        this.addHiddenErrors(errors);
        // We know stored hidden errors object is up to date
        if (showErrors) this.showErrors(true);
    },
    
    getItemErrors : function (errors, itemNameOrDataPath, selectionChain) {
        var dataPath = itemNameOrDataPath.trim(isc.Canvas._$slash),
            isDataPath = dataPath.contains(isc.Canvas._$slash);
        if (isc.isAn.Array(errors)) errors = errors[0];
        if (!isDataPath) {
            var serverErrors = errors[itemNameOrDataPath];
        } else {
            var elements = dataPath.split(isc.Canvas._$slash),
                serverErrors = errors,
                nestedListCount = 0;
            for (var i = 0; i < elements.length; i++) {
                serverErrors = serverErrors[elements[i]];
                if (isc.isAn.Array(serverErrors)) {
                    if (selectionChain.length > nestedListCount) {
                        serverErrors = serverErrors[selectionChain[nestedListCount++]];
                    } else {
                        // We have a missing or incomplete selection chain, so we have no real
                        // way to decide which entry in this list is the right one to use.  All
                        // we can do is select the first...
                        serverErrors = serverErrors[0];
                    }
                }
                
                // The error structure is sparse - bail as soon as we encounter a missing path
                if (!serverErrors) break;
            }
        }
        if (serverErrors) {
            if (!isc.isAn.Array(serverErrors)) serverErrors = [serverErrors];
            var clientErrors = [];
            for (var i = 0; i < serverErrors.length; i++) {
                if (serverErrors[i].errorMessage) {
                    clientErrors.add(serverErrors[i].errorMessage);
                } else {
                    clientErrors.add(serverErrors[i]);
                }
            }
            return clientErrors.length > 1 ? clientErrors : clientErrors[0];
        }
    },
    
    deleteItemErrors : function (errors, itemNameOrDataPath, selectionChain) {
        var dataPath = itemNameOrDataPath.trim(isc.Canvas._$slash),
            isDataPath = dataPath.contains(isc.Canvas._$slash);
        if (isc.isAn.Array(errors)) errors = errors[0];
        if (!isDataPath) {
            delete errors[itemNameOrDataPath];
        } else {
            var elements = dataPath.split(isc.Canvas._$slash);
            var serverErrors = errors,
                traversedObjects = [],
                nestedListCount = 0;
            for (var i = 0; i < elements.length; i++) {
                traversedObjects.add(serverErrors);
                serverErrors = serverErrors[elements[i]];
                if (isc.isAn.Array(serverErrors)) {
                    if (selectionChain.length > nestedListCount) {
                        serverErrors = serverErrors[selectionChain[nestedListCount++]];
                    } else {
                        serverErrors = serverErrors[0];
                    }
                }
                if (!serverErrors) break;
            }
            
            if (serverErrors) serverErrors = undefined;
            
            // Clean up any empty container objects
            for (var i = traversedObjects.length - 1; i >= 0; i--) {
                if (isc.isAn.emptyObject(traversedObjects[i])) {
                    delete traversedObjects[i];
                }
            }
        }
    },
    
    // little helper to combine errors into arrays
    // Returns the errors object to use
    _addFieldErrors : function (oldErrors, newErrors) { 
        if (!oldErrors) return newErrors;
        if (!newErrors) return oldErrors;
        if (!isc.isAn.Array(oldErrors)) oldErrors = [oldErrors];
        if (isc.isA.String(newErrors)) oldErrors.add(newErrors);
        else oldErrors.addList(newErrors);

        return oldErrors;
    },

    //> @method valuesManager.addFieldErrors()
    // Adds validation errors to the existing set of errors for the field in question.
    // Errors passed in should be a string (for a single error message) or an array of strings.
    // Pass in the showErrors parameter to immediately display the errors to the user by 
    // redrawing the appropriate member form item (or if no visible item is found for the field
    // firing +link{valuesManager.handleHiddenValidationErrors()}.
    // @param fieldName (String) name of field to apply errors to
    // @param errors (String | Array of String) error messages for the field
    // @param showErrors (boolean) should the error(s) be immediately displayed to the user?
    // @group errors
    // @visibility external
    //<
    addFieldErrors : function (fieldName, errors, showErrors) {
        var hidden = true;
        var form = this.getMemberForField(fieldName);
        if (form != null && isc.isA.DynamicForm(form)) {
            form.addFieldErrors(fieldName, errors, false);
            var item = form.getItem();
            if (form.isVisible() && form.isDrawn() && item && item.visible) {
                hidden = false;
            }
        }
        
        if (hidden) {    
            if (!this.hiddenErrors) this.hiddenErrors = {};
            var formName = form ? form.getID() : this.getID();
            if (!this.hiddenErrors[formName]) this.hiddenErrors[formName] = {};

            this.hiddenErrors[formName][fieldName] = 
                this._addFieldErrors(this.hiddenErrors[formName][fieldName], errors);

        }
        
        if (showErrors) this.showFieldErrors(fieldName);
    },
    
    //> @method valuesManager.setFieldErrors()
    // Sets validation errors for some field in the valuesManager.<br>
    // Errors passed in should be a string (for a single error message) or an array of strings.
    // Pass in the showErrors parameter to immediately display the errors to the user by 
    // redrawing the appropriate member form item (or if no visible item is found for the field
    // firing +link{valuesManager.handleHiddenValidationErrors()}.
    // @param fieldName (String) name of field to apply errors to
    // @param errors (String | Array of String) error messages for the field
    // @param showErrors (boolean) should the error(s) be immediately displayed to the user?
    // @group errors
    // @visibility external
    //<    
    setFieldErrors : function (fieldName, errors, showErrors) {
        var hidden = true;
        var form = this.getMemberForField(fieldName);
        if (form != null && isc.isA.DynamicForm(form)) {
            form.setFieldErrors(fieldName, errors, false);
            var item = form.getItem();
            if (form.isVisible() && form.isDrawn() && item && item.visible) {
                hidden = false;
            }
        }
        
        if (hidden) {
            if (!this.hiddenErrors) this.hiddenErrors = {};
            this.hiddenErrors[fieldName] = errors;
        }
        
        if (showErrors) this.showFieldErrors(fieldName);    
    },
    
    //>	@method	valuesManager.clearErrors()
    //			Clears all errors from member forms.
    //      @param  showErrors (boolean)    If true, clear any visible error messages.
    //		@group	errors
    //      @visibility external
    //<
    clearErrors : function (showErrors) {
        this.setErrors({}, showErrors);
    },
    
    //> @method valuesManager.clearFieldErrors()
    // Clear all validation errors associated with some field in this form
    // @param fieldName (String) field for which errors should be cleared
    // @param show (boolean) if true, and the field is present in one of our member forms, 
    //                       redraw it to clear any currently visible validation errors
    // @group errors
    // @visibility external
    //<
    clearFieldErrors : function (fieldName, show) {
        var form = this.getMemberForField(fieldName);
        if (form && isc.isA.DynamicForm(form)) form.clearFieldErrors(fieldName, show);
        
        if (this.hiddenErrors) delete this.hiddenErrors[fieldName];
    },

    //> @method valuesManager.getErrors()
    // Returns the set of errors for this valuesManager.
    // Errors will be returned as an object of the format <br>
    // <code>{field1:errors, field2:errors}</code><br>
    // Where each errors object is either a single error message or an array of error message
    // strings.
    // @return (Object) Object containing mapping from field names to error strings. Returns null
    //                  if there are no errors for this valuesManager.
    // @group errors
    // @visibility external
    //<
    // Stored errors include those stored as "hiddenErrors", with no associated form (came from
    // a datasource field definition only, presumably), and errors from member forms
    getErrors : function () {
        // pick up stored hidden errors.
        // [don't bother to synch - we're not interested in whether they're truly hidden or not now]
        var errors = isc.addProperties({}, this.getHiddenErrors(true));
        // add errors from each member form                              
        
        if (this.members) {
            for (var i = 0; i < this.members.length; i++) {
                if (!isc.isA.DynamicForm(this.members[i])) continue;
                isc.addProperties(errors, this.members[i].getErrors());
            }
        }
        if (!isc.isA.emptyObject(errors)) return errors
        return null
    },
    
    //> @method valuesManager.getFieldErrors()
    // Returns any validation errors for some field in this valuesManager.
    // Errors will be returned as either a string (a single error message), or an array 
    // of strings. If no errors are present, will return null.
    // @param fieldName (String) fieldName to check for errors
    // @return (String | Array of String) error messages for the field passed in
    // @group errors
    // @visibility external
    //<
    getFieldErrors : function (fieldName) {
        var form = this.getMemberForField(fieldName)
        if (form && isc.isA.DynamicForm(form)) return form.getFieldErrors(fieldName);
        if (this.hiddenErrors && this.hiddenErrors[this.getID()]) 
            return this.hiddenErrors[this.getID()][fieldName];
    },
    
    //> @method valuesManager.hasErrors()
    // Are there any errors associated with any fields in this valuesManager?
    // @return (Boolean) returns true if there are any outstanding validation errors, false 
    //                  otherwise.
    // @group errors
    // @visibility external
    //<
    hasErrors : function () {
        if (this.hiddenErrors && !isc.isA.emptyObject(this.hiddenErrors)) {
            for (var form in this.hiddenErrors) {
                if (this.hiddenErrors[form] && !isc.isAn.emptyObject(this.hiddenErrors[form]))
                    return true;
            }
        }
        if (this.members == null) return false;
        for (var i = 0; i < this.members.length; i++) {
            if (isc.isA.DynamicForm(this.members[i]) && this.members[i].hasErrors()) return true;
        }
        return false;
    },
    
    //> @method valuesManager.hasFieldErrors()
    // Are there any errors associated with a field in this valuesManager?
    // @param fieldName (String) field to check for errors
    // @return (Boolean) returns true if there are any outstanding validation errors, false 
    //                  otherwise.
    // @group errors
    // @visibility external
    //<        
    hasFieldErrors : function (fieldName) {
        var form = this.getMemberForField(fieldName);
        if (form && isc.isA.DynamicForm(form) && form.hasFieldErrors(fieldName)) return true;
        var hiddenErrors = this.getHiddenErrors(true);
        if (hiddenErrors && hiddenErrors[fieldName] != null) return true;
        return false;
    },
    
    //> @method valuesManager.showErrors()
    // Method to explicitly show the latest set of validation errors present on this 
    // ValuesManager.<br>
    // Will redraw all member forms to display (or clear) currently visible errors, and
    // fire +link{valuesManager.handleHiddenValidationErrors()} to allow custom handling of
    // hidden errors.
    // @group errors
    // @visibility external
    //<
    // suppressHiddenErrorSynch parameter: indicates we know our stored hidden errors match the 
    // currently visible set of fields [so we just ran validate() or setErrors()].
    // passed through to _handleHiddenValidationErrors()
    showErrors : function (suppressHiddenErrorSynch) {
        if (this.members) {
            for (var i= 0; i < this.members.length; i++) {
                if (!isc.isA.DynamicForm(this.members[i])) continue;
                if (!this.members[i].isDrawn()) continue;
                this.members[i]._suppressAutoFocusOnErrors = true;
                this.members[i].showErrors();
            }
        }
        
        if (this.hiddenErrors != null) {
            this._handleHiddenValidationErrors(suppressHiddenErrorSynch);
        }
    },
    
    //> @method valuesManager.showFieldErrors()
    // Method to explicitly show the latest set of validation errors present on some field 
    // within this ValuesManager.<br>
    // If the field in question is present as a visible item in a member form, the form item
    // will be redrawn to display the error message(s).
    // Otherwise +link{valuesManager.handleHiddenValidationErrors()} will be fired to allow 
    // custom handling of hidden errors.
    // @group errors
    // @visibility external
    //<
    showFieldErrors : function (fieldName) {
        var form = this.getMemberForField(fieldName);
        if (form && isc.isA.DynamicForm(form) && form.isVisible() && form.isDrawn()) {
            var item = form.getItem(fieldName);
            if (item && item.visible) {
                item.redraw("Validation errors modified");
                return;
            }
        }
        
        // At this point we know we have a hidden error for the field - fire the 
        // handleHiddenValidationErrors method. Of course that actually 'shows' the
        // errors for all hidden fields, not just this one.
        this._handleHiddenValidationErrors();
    },

    //> @method valuesManager.handleAsyncValidationReply()
    // Notification fired when an asynchronous validation completes.
    // @param success (boolean) true if validation succeeded, false if it failed
    // @param errors (Object) Map of errors by fieldName. Will be null if validation succeeded.
    // @visibility external
    //<
    handleAsyncValidationReply : function (success, errors) {
//!DONTOBFUSCATE  (obfuscation breaks observation)
    },

    
    _handleFormAsyncValidationReply : function (member, success, errors, context) {
        var pendingMembers = this._pendingAsyncMembers;
        if (!pendingMembers || pendingMembers !== context) return;


        


        // if the member associated with this response is still on our list, handle the response
        if (pendingMembers.remove(member) && this.handleAsyncValidationReply != null) {
            this.logInfo("Asynchronous validation done - calling handleAsyncValidationReply()");
            this.handleAsyncValidationReply(success, errors);
        }
        // we're done - ignore other responses
        delete this._pendingAsyncMembers;
    },

    // add supplied member to pending list, if context is valid
    _addAsyncValidationMember : function (member, context) {
        var pendingMembers = this._pendingAsyncMembers;
        if (pendingMembers && pendingMembers == context) pendingMembers.add(member);
    },

    //> @method valuesManager.isPendingAsyncValidation()
    // Is this <code>ValuesManager</code> waiting for an asynchronous validation to complete?
    // This method will return true after +link{valuesManager.validate()} is called on a
    // component with server-side validators for some field(s), until the server responds.
    // <P>
    // Note that the notification method +link{valuesManager.handleAsyncValidationReply()} will
    // be fired when validation completes.
    // @return (Boolean) true if this widget has pending asynchronous validations in process
    // @visibility external
    //<
    isPendingAsyncValidation : function () {
        var pendingMembers = this._pendingAsyncMembers;
        return pendingMembers != null && pendingMembers.length > 0;
    },

    // ========================================================================================
    //  Values Management APIs
    // ========================================================================================
    
    //> @method valuesManager.getValues()   
    // Returns the current set of values for the values manager instance.  This includes the
    // values from any form managed by this manager, as well as any values explicitly applied
    // via +link{valuesManager.setValues()}.
    // <P>
    // Note that modifying the returned object is not a supported way of adding or modifying
    // values.  Instead use +link{setValue()} or +link{setValues()}.
    // @return (Object) a map of the values for this manager
    // @see dynamicForm.getValues()
    // @group formValues
    // @visibility external
    //<
    getValues : function () {

        // if one of our member forms has focus, ensure its focus-item's value has been saved
        // out [which will update this.values]
        if (this.members != null) {
            var fc = isc.EH.getFocusCanvas();
            if (this.members.contains(fc) && fc.updateFocusItemValue) fc.updateFocusItemValue();
        }
        // Never let this.values be externally accessible.
            
        return isc.addProperties({}, this.values);
    },
    
    //> @attr valuesManager.deepCloneOnEdit (Boolean : null : IRWA)
    // Before we start editing the values of this ValuesManager in one or more DataBoundComponents, 
    // should we perform a deep clone of the underlying values.  See 
    // +link{dataSource.deepCloneOnEdit} for details of what this means.
    // <p>
    // If this value is not explicitly set, it defaults to the value of +link{dataSource.deepCloneOnEdit}.
    // This value can be overridden per-field with +link{dataSourceField.deepCloneOnEdit}.
    // <p>
    // Like the other <code>deepCloneOnEdit</code> settings, this flag only has an effect if you are 
    // editing a values object that contains nested objects or arrays, using 
    // +link{Canvas.dataPath,dataPath}s.
    //
    // @see canvas.dataPath
    // @see formItem.dataPath
    // @see dataSourceField.deepCloneOnEdit
    // @see dataSource.deepCloneOnEdit
    // @visibility external
    //< 

    //> @attr valuesManager.deepCloneNonFieldValuesOnEdit (Boolean : null : IRWA)
    // When editing values in this ValuesManager in one or more DataBoundComponents, should we
    // perform a deep clone of values that are not associated with a field (ie, attributes on
    // the record that do not map to a component field either directly by name, or by
    // +link{formItem.dataPath}.  If this value is not explicitly set, it defaults to the value of 
    // +link{dataSource.deepCloneNonFieldValuesOnEdit} if there is a dataSource, or to the value 
    // of the static +link{classAttr:DataSource.deepCloneNonFieldValuesOnEdit} if there is no
    // dataSource.
    // <p>
    // Like the other <code>deepCloneOnEdit</code> settings, this flag only has an effect if you are 
    // editing a values object that contains nested objects or arrays.
    //
    // @see canvas.dataPath
    // @see formItem.dataPath
    // @see dataSourceField.deepCloneOnEdit
    // @see dataSource.deepCloneOnEdit
    // @visibility external
    //< 
    
    //> @method valuesManager.setValues()   
    // Replaces the current values of the ValuesManager and all member components with the 
    // values passed in.
    // <P>
    // Values should be provided as an Object containing the new values as properties, where
    // each propertyName is the name of a +link{items,form item} in one of the member forms,
    // and each property value is the value to apply to that form item via
    // +link{FormItem.setValue()}.
    // <P>
    // Values with no corresponding form item may also be passed, will be tracked by the
    // valuesManager and returned by subsequent calls to +link{getValues()}.
    // <P>
    // Any +link{FormItem} for which a value is not provided will revert to its
    // +link{formItem.defaultValue,defaultValue}.  To cause all FormItems to revert to default
    // values, pass null.
    // <P>
    // This method also calls +link{rememberValues()} so that a subsequent later call to
    // +link{resetValues()} will revert to the passed values.
    // 
    // @param   values  (Object)    new set of values for this values manager.
    // @group formValues
    // @visibility external
    //<    
    setValues : function (values) {
        if (isc.isAn.Array(values)) {
            var useFirst = isc.isA.Object(values[0]);
            this.logWarn("values specified as an array." + 
                        (useFirst ? " Treating the first item in the array as intended values."
                                  : " Ignoring specified values."));
            if (useFirst) values = values[0];
            else values = null;                                  
        }
        
        
        this._saveValues(values);
        if (this.members) {
            // Suppress any ruleContext change events which causes to _needsRuleContextChanged
            // to be set if there are any ruleContext changes made.
            this._needsRuleContextChanged = false;
            for (var i = 0; i < this.members.length; i++) {
                // setMemberValues will update the members' items to display the values passed in
                // Note that for DynamicForms, it also explicitly calls 'clearValue()' on items
                // for which we have no member - this re-evaluates default values
                this.synchronizeMember(this.members[i], null, true);
            }
            if (this._needsRuleContextChanged) {
                // Fire changed event on the first member. It doesn't matter which member
                // is used because they all share the same ruleScope.
                this.members[0].fireRuleContextChanged(this.members[0]);
            }
        }
        // remember values for resetting
        this.rememberValues();
        
    },
    
    _saveValues : function (values) {
    
        // Duplicate the values object so we can manipulate it and apply it directly to 
        // this.values and modify without interfering with external code.
        // _duplicateValues does a recursive duplication based on dataPaths
        var clonedVals = {};
        isc.DynamicForm._duplicateValues(this, values, clonedVals);
        values = clonedVals;
        this.values = values;
    },
    
    //> @method valuesManager.setData()
    // Set the data (values) on this valuesManager [synonym for <code>setValues()</code>].
    //<
    // setData() is used in dataBinding rather than setValues.
    setData : function (values) {
        return this.setValues(values);
    },

    //> @method valuesManager.clearValues()   
    // Clear out all the values managed by this values manager.
    // @visibility external
    // @group formValues
    //<
    clearValues : function () {
        this.setValues({});
    },

    //> @method valuesManager.getMemberValues()   
    // Returns the subset of this valuesManager's values associated with some member form.
    //  
    // @param   ID  (String)    ID of the member form for which we want to retrieve the values.
    // @return (Object) a map of the values for the appropriate member form.
    // @visibility external
    // @group formValues
    //<    
    getMemberValues : function (ID) {
        var member = this.getMember(ID);
        if (member != null) return member.getValues();
    },
    
    //> @method valuesManager.setMemberValues()
    // Set the values for some member form.
    // @param   ID  (String)    ID of the member form to update
    // @param   values  (Object)    new values for the form
    // @visibility external
    // @group formValues
    //<    
    setMemberValues : function (ID, values) {
        var member = this.getMember(ID);
        if (member != null) return member.setValues(values);
    },
    
    //> @method valuesManager.getValuesAsCriteria()
    // Retrieves the combined +link{dynamicForm.getValuesAsCriteria(),criteria values} 
    // for all member forms.
    // <P>
    // As with the DynamicForm getValuesAsCriteria, this method may return
    // +link{AdvancedCriteria} or simple +link{Criteria} depending on whether
    // the <code>advanced</code> parameter was passed, whether the +link{valuesManager.operator}
    // is set to <code>"or"</code> rather than <code>"and"</code>, and whether any member
    // forms return +link{AdvancedCriteria}.
    // <P>
    // Note that developers can also use +link{DataSource.combineCriteria()} to combine
    // sub-criteria from various sources, including member forms of a ValuesManager, into
    // a combined criteria object.
    //
    // @param advanced (boolean) if true, return an +link{AdvancedCriteria} object even if the
    //   form item values could be represented in a simple +link{Criterion} object.
    // @param [textMatchStyle] (TextMatchStyle) This parameter may be passed to indicate whether
    //   the criteria are to be applied to a substring match (filter) or exact match (fetch).
    //   When advanced criteria are returned this parameter will cause the appropriate
    //   <code>operator</code> to be generated for individual fields' criterion clauses.
    //
    // @group criteriaEditing
    // @return (Criteria | AdvancedCriteria) a +link{Criteria} object, or +link{AdvancedCriteria}
    //
    // @visibility external
    //<    
    getValuesAsCriteria : function (advanced, textMatchStyle) {
        var criteria;
        
        // CombineCriteria only takes 2 criteria at a time, so just iterate through our member forms
        for (var i = 0; i < this.members.length; i++) {
            if (i == 0) {
                criteria = this.members[i].getValuesAsCriteria(advanced, textMatchStyle);
            } else {
                criteria = isc.DataSource.combineCriteria(criteria, 
                                    this.members[i].getValuesAsCriteria(advanced, textMatchStyle),
                                    this.operator, textMatchStyle);
            }
        }
        // If 'setValues' was called and included values which don't correspond to any
        // member form items, if we have simple criteria we *can* fold in these additional values.
        // For AdvancedCriteria this isn't so easy - we'd have to track "extraAdvancedCriteria" as we
        // do in DynamicForms.
        // Don't attempt this for AdvancedCriteria.
        // For simple criteria, do this, but warn as it's slightly anomalous usage.
        if (criteria == null || criteria._constructor != "AdvancedCriteria") {
            if (criteria == null) criteria = {};
            // Mix in any values we have that didn't come from member forms
            var values = isc.addProperties({}, this.getValues()),
                undef,
                hasExtraValues = false;
            for (var field in values) {
                if (criteria[field] !== undef) delete values[field];
                else hasExtraValues = true;
            }
            if (hasExtraValues) {
                this.logWarn("getValuesAsCriteria() returning simple criteria." +
                             "Values object for this ValuesManager includes values for fields which " +
                             "are not associated with any member item:" + this.echo(values) + 
                             ". These values will be combined with the simple criteria retrieved from " +
                             "member forms, but developers should be aware that " +
                             "values not associated with any item are not supported for AdvancedCriteria.");
                // filterCriteriaForFormValues will clear out null values, and handle arrays with an
                // empty entry (Implies a null criterion)
                values = isc.DataSource.filterCriteriaForFormValues(values)
                if (criteria == null) criteria = values;
                else isc.addProperties(criteria, values);
            }

        }
        
        return criteria;
    },
    
    
    
    //>	@method	valuesManager.getValuesAsAdvancedCriteria()
    // Return an AdvancedCriteria object based on the current set of values within memberForms.
    // <p>
    // Similar to +link{valuesManager.getValuesAsCriteria()}, except the returned criteria object
    // is guaranteed to be an AdvancedCriteria object, even if none of the form's fields has a
    // specified +link{formItem.operator}
    //
    // @param [textMatchStyle] (TextMatchStyle) If specified the text match style will be used to
    //   generate the appropriate <code>operator</code> for per field criteria.
    // @group criteriaEditing
    // @return (AdvancedCriteria) a +link{AdvancedCriteria} based on the form's current values
    //
    // @visibility external
    //<
    getValuesAsAdvancedCriteria : function (textMatchStyle, returnNulls) {
        return this.getValuesAsCriteria(true, textMatchStyle, returnNulls);
    },

    
    //> @attr valuesManager.operator (OperatorId : "and" : IR)
    // What operator should be used to combine sub-criteria from member forms when
    // +link{getValuesAsCriteria()} is called?
    //
    // @visibility external
    //<
    operator: "and",

    //> @method valuesManager.rememberValues()
    // @include dynamicForm.rememberValues()
    //<
    // Values may change as a result of 
    // - adding a new member and picking up values for fields for which we previously had no 
    //   value
    // - the user modifying values in a field
    // - calls to 'setValue()' [not setValues as that will re-remember the values after setting]
    
    rememberValues : function (skipRememberMembers) {
        
    	var values = this.getValues();
		
		var oldVals = {},
            rememberedDefault = [];
            
        // Recursively duplicate values so further edits won't manipulate the remembered values
        // directly.
        isc.DynamicForm._duplicateValues(this, values, oldVals, rememberedDefault);
        
        // Remember the duplicated values object
        this._oldValues = oldVals;
        // rememberedDefault array will contain dataPaths for every item that had its value
        // set to the default in the 'values' object we passed in.
        // We need this information so 'resetValues' can set these items to null and
        // potentially re-evaluate a dynamicDefault rather than resetting to whatever the
        // value is at this moment.
        // [still store the current val for valuesHaveChanged() checks]
        this._rememberedDefault = rememberedDefault;

        
        if (!skipRememberMembers && this.members) {
            for (var i = 0; i < this.members.length; i++) {
                var form = this.members[i];
                if (isc.isA.DynamicForm(form) && form.valuesHaveChanged()) {
                    form.rememberValues();
                }
            }
        }

    	return this._oldValues;
    },
    
    //> @method valuesManager.getOldValues()
    // @include dynamicForm.getOldValues()
    //<
    getOldValues : function () {
        var oldValues = {};
        isc.addProperties(oldValues, this._oldValues);
        return oldValues;
    },
    
    
    //> @method valuesManager.getChangedValues()
    // @include dynamicForm.getChangedValues()
    // @see getOldValues()
    // @visibility external
    //<
    getChangedValues : function () {
        return this.valuesHaveChanged(true);
    },
    
    
    //> @method valuesManager.resetValues()
    // @include dynamicForm.resetValues()
    //<
    resetValues : function () {
        // pull the values from form._oldValues into ValuesManager.values
        var values = {};
        isc.DynamicForm._duplicateValues(this, this._oldValues, values);
        // clear any remembered defaults so they get re-eval'd
        for (var i = 0; i < this._rememberedDefaults; i++) {
            isc.DynamicForm._clearFieldValue(this._rememberedDefaults[i], values, this);
        }
        
        this.setValues(values);
        
    },
    
    //> @method valuesManager.valuesHaveChanged()
    // @include dynamicForm.valuesHaveChanged()
    //<
    valuesHaveChanged : function (returnChangedVals) {
        var values = this.getValues();
	    var oldValues = this._oldValues || {};

        return isc.DynamicForm.valuesHaveChanged(this,returnChangedVals,values,oldValues);
    },

    //> @method valuesManager.getValue()
    // Returns the value for some field.
    // @param   fieldName   (String)    Which value to be returned
    // @param   [component] (Canvas)    Optional, the component for which we are trying to
    //                                  retrieve a value.  This is used to identify which of
    //                                  the potential records to use when the ValuesManager
    //                                  is managing a complex structure involving nested Lists
    // @return  (Any)   current value of the appropriate field
    // @visibility external
    // @group formValues
    //<
    getValue : function (fieldName, component) {
        return isc.DynamicForm._getFieldValue(fieldName, this.getField(fieldName),
                                                this.values, component, true, "vm_getValue");
    },
    
    //> @method valuesManager.setValue()
    // Set the value for some field.
    // @param   fieldName   (String)    Which field to set the value for
    // @param   newValue    (Any)       New value for the field.
    // @visibility external
    // @group formValues
    //< 
    setValue : function (fieldName, newValue) {

        var valueSet = false,
            member,
            undef;
        if (this.members) {
            var items = this.getItem(fieldName, true);
            if (items && items.length > 0) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item && item.setValue) {

                        // Handle this being a field with an 'opaque' data type with a get/set atomic
                        // value method
                        // If this is the case, extract the atomic value and pass it to the item.
                        
                        var type = item.type ? isc.SimpleType.getType(item.type) : null,
                            itemValue = newValue,
                            isUndef = (newValue === undef);
                        if (!item.canEditOpaqueValues && !isUndef && 
                            type && type.getAtomicValue && type.updateAtomicValue) 
                        {
                            // store the new atomic type on our values object
                            
                            // getFullDataPath will prepend any member-widget level dataPath if necessary
                            // No field, so updateAtomicValue() will not be called, so no need for a reason
                            fieldName = item.getFullDataPath();
                            isc.DynamicForm._saveFieldValue(fieldName, null, newValue, this.values, null, true);
                            // extract the atomic value which we'll pass to item.setValue()
                            itemValue = type.getAtomicValue(newValue);
                        }

                        if (isUndef) item.clearValue();
                        else item.setValue(itemValue);
                        valueSet = true;
                    }
                }
            }
        }
        if (!valueSet) {
            if (newValue === undef) {
                isc.DynamicForm._clearFieldValue(fieldName, this.values);
            } else {
                
                // No field, so updateAtomicValue() will not be called, so no need for a reason
                isc.DynamicForm._saveFieldValue(fieldName, null, newValue, this.values, null, true);
            }
        }
        var members = this._findMemberByField(fieldName, false, true);
        if (members) {
            for (var i = 0; i < members.length; i++) {
                if (member && member.setData) {
                    var dataObjPath = fieldName;
                    if (fieldName.indexOf(isc.Canvas._$slash) != -1) {
                        dataObjPath = fieldName.substring(0, fieldName.lastIndexOf(isc.Canvas._$slash));
                        member.setData(isc.DynamicForm._getFieldValue(dataObjPath, null, 
                                                                      this.values, member, true));
                    }
                }
            }
        }
    },
    

    //> @method valuesManager.clearValue()
    // Clear the value for some field.
    // @param   fieldName   (String)    Which field to set the value for
    // @visibility external
    // @group formValues
    //< 
    clearValue : function (fieldName) {
        this.setValue(fieldName);
    },
    
    // ========================================================================================
    //  Member Management
    // ========================================================================================
    
    //> @method valuesManager.addMember()   
    //
    // Add a new member to this valuesManager.  Any +link{class:Canvas} can be a member of a
    // valuesManager, even components like +link{class:Layout} or +link{class:TabSet} that do
    // not actually have any values to manage.  When "valueless" components like these bind to
    // a ValuesManager, it is in order to provide their own child components with a shared
    // valuesManager so that complex data can be displayed and edited - see 
    // +link{DataPath} for more details.
    // <p>
    // For components like +link{class:DynamicForm} and +link{class:ListGrid}, which do have 
    // a set of values to manage, the component's values will subsequently be available through
    // this valuesManager.
    // <p>
    // Note on pre-existent values when the member component is a +link{class:DynamicForm}:<br>
    // If the valuesManager has a value specified for some field, for which the member form has
    // an item, this value will be applied to the member form.  This is true whether the item
    // has a value or not.<br>
    // However if the member form has a value for some field, and the ValuesManager does not
    // have a specified value for the same field, we allow the valuesManager to pick up the 
    // value from the member form.
    // <p>
    // <b>Caution:</b> If a DynamicForm without a +link{DataSource} is passed to this method,
    // +link{DataBoundComponent.setDataSource()} will be called on that form, recreating the
    // items from copies of the item configuration stored at the time the form was created.
    // This means that any properties or handlers added to the items after form creation
    // will be lost.  When in doubt, set the DataSource in the form as soon as possible.
    //
    // @param   member  (DynamicForm | String) component (or ID of component) to add to 
    //                                          this valuesManager as a member.
    // @visibility external
    // @group members
    // @see method:ValuesManager.addMembers
    //<    
    addMember : function (member, fromDataPath) {
        // If passed an ID, assume it's a pointer to the form.
        if (isc.isA.String(member)) member = window[member];
        
        if (!isc.isA.Canvas(member)) {
            this.logWarn("addMember() passed invalid object: " + this.echo(member) + 
                         " - this should be a Canvas instance");
            return;
        }

        // remove member from its existing valuesManager
        
        if (isc.isA.ValuesManager(member.valuesManager)) {
            member.valuesManager.removeMember(member);
        } else if (member.valuesManager != null) {
            member.valuesManager = null;
        }
        
        if (this.members == null) this.members = [];
        
        // If the member has an explicit, different dataSource specified, log a warning.
        // Different dataSources are a problem, as datasource field properties (including
        // specified validators) will not be reflected in the form.
        // Don't catch the case where the member dataSource is unset, it may be using
        // datapath to pick up the appropriate dataSource field attributes.
        var memberDS = member.getDataSource();
        if (memberDS != null && !fromDataPath && memberDS != this.getDataSource()) {
            this.logWarn("addMember(): mismatched DataSources; new member form " + member + 
                         " has dataSource: '" + memberDS.ID + 
                         "', valuesManager has DataSource " + 
                         (this.getDataSource() != null ? "'"+this.getDataSource().ID+"'" : "[NONE]"));
        }
        
        // If any member forms are multipart, warn the developer - this implies that
        // they need direct submission.        
        if (this.getDataSource() != null && member.isMultipart && 
            member.isMultipart() && member.isMultipart()) 
        {
            this.logWarn("addMember(): new member form " + member +
                " is flagged as using multipart encoding. Multipart forms require direct form " +
                "submission to transfer uploaded files to the server - any uploaded files from " +
                "this member form will be dropped when saving values from this ValuesManager to " +
                "the server."
            );
        }
        
        // catch the case where the member is a dataArity singular component but is editing
        // a multiple:true field - in this case we auto attach a selectionComponent if possible
        if (member.dataArity == "single" && member.autoTrackSelection) {
            // Don't clobber a user-specified selectionComponent
            if (member.selectionComponent == null || member._autoSelectionComponent) {
                var dataPath = member.getFullDataPath(),
                    field = dataPath ? this.getDataSourceField(dataPath) : null,
                    newValues = isc.DynamicForm._getFieldValue(dataPath, null, this.values, member, true),
                    multiple = isc.isAn.Array(newValues) || (field && field.multiple);
                if (multiple) {                
                    var selectionComponents = this.getMemberForField(dataPath, true);
                    if (selectionComponents && selectionComponents.length > 0) {
                        for (var i = 0; i < selectionComponents.length; i++) {
                            var selectionComponent = selectionComponents[i];
                            if (selectionComponent.dataArity == "multiple") {
                                member.setSelectionComponent(selectionComponent);
                                member._autoSelectionComponent = true;
                                break;
                            }
                        }
                    }
                }
            }
        // also catch the case where a singular item was already added for a multiple:true field
        // and the selection component is added after the fact
        } else {
            var dataPath = member.getFullDataPath(),
                singularComponents = this.getMemberForField(dataPath, true);
            if (singularComponents && singularComponents.length > 0) {
                for (var i = 0; i < singularComponents.length; i++) {
                    if (singularComponents[i].dataArity == "single" &&
                        singularComponents[i].autoTrackSelection &&
                        (singularComponents[i].selectionComponent == null ||
                         singularComponents[i]._autoSelectionComponent == true)) 
                    {
                        singularComponents[i].setSelectionComponent(member);
                        singularComponents[i]._autoSelectionComponent = true;
                    }
                }
            }
        }

        // We also need to bind to a selectionComponent for components of dataArity "multiple"
        // that are editing a field which is a descendant of a multiple: true field
        if (member.dataArity == "multiple" && member.autoTrackSelection) {
            var dataPath = member.getFullDataPath(),
                isDataPath = dataPath && dataPath.contains(isc.Canvas._$slash);

            if (isDataPath) {
                var elements = dataPath.split(isc.Canvas._$slash);
                // Skip the very last element - that's pointing at this member's dataPath, and
                // we're only interested in ancestors for this purpose
                dataPath = "/";
                for (var i = elements.length - 2; i >= 0; i--) {
                    for (var j = 0; j <= i; j++) {
                        dataPath += elements[j];
                        if (j != i) dataPath += "/";
                    }
                    var field = this.getDataSourceField(dataPath),
                        newValues = isc.DynamicForm._getFieldValue(dataPath, null, this.values, member, true),
                        multiple = isc.isAn.Array(newValues) || (field && field.multiple);
                    if (multiple) break;
                }
            }
            
            if (multiple) {
                var selectionComponents = this.getMemberForField(dataPath, true);
                if (selectionComponents && selectionComponents.length > 0) {
                    for (var i = 0; i < selectionComponents.length; i++) {
                        var selectionComponent = selectionComponents[i];
                        if (selectionComponent.dataArity == "multiple") {
                            member.setSelectionComponent(selectionComponent);
                            member._autoSelectionComponent = true;
                            break;
                        }
                    }
                }
            }
            // also catch the case where the selection component is added second
            var dataPath = member.getFullDataPath();
            if (dataPath && dataPath != "") {
                var members = this.members;
                for (var i = 0; i < members.length; i++) {
                    if (members[i] == member) continue;
                    if (members[i].dataArity == "single") continue;
                    var otherDataPath = members[i].getFullDataPath();
                    if (otherDataPath && otherDataPath != dataPath 
                                      && otherDataPath.startsWith(dataPath)) 
                   {
                        // Ensure that the target component is not already bound to a better 
                        // selectionComponent (ie, one between it and this component in the 
                        // hierarchy), or one explicitly specified by the user
                        if (members[i].selectionComponent != null) {
                            if (members[i]._autoSelectionComponent) {
                                var existingDataPath = members[i].selectionComponent.getFullDataPath();
                                if (dataPath.length > existingDataPath.length) {
                                    members[i].setSelectionComponent(member);
                                    members[i]._autoSelectionComponent = true;
                                }
                            }
                        }
                    }
                }
            }
        } 

        this.members.add(member);
        
        member.valuesManager = this;
        
        // If the member dataSource is null, bind it to the VM's dataSource; this step will be
        // done anyway by DBC.setDataPath(), but setDataSource is a destructive operation (it
        // wipes out the DBC's values to ensure that they cannot mismatch with the new 
        // DataSource), and with certain orders of operation, we can end up with components
        // having their data cleared
        if (member.dataSource == null && this.dataSource != null && member.getFields) {
            var fields = isc.isA.DynamicForm(member) ? member._itemsConfig : member.getAllFields();
            fields = fields || member.getAllFields();
            var dataPath = member.getFullDataPath();
            var dataSource = this.getDataSource();
            // If the member has a 'dataPath', bind to the nested dataSource to which it refers
            if (dataPath) {
                var dataSource = dataSource.getDataSourceForDataPath(dataPath, true);
            }

            member.setDataSource(dataSource, fields);
        }
        
        // Update the member data with values defined on this VM.
        //
        // Pass in the 'pickupValues' parameter - on initial add, we want to pick up any 
        // values present in the form for which we don't already have values
        // (and warn / replace where there are collisions)
        this.synchronizeMember(member, true);

        // set a flag so we know if this was auto-attached as part of setDataPath()
        // This allows us to respect explicitly specified valuesManager if the dataPath changes
        // later, but recalculate derived ones.
        member._valuesManagerFromDataPath = fromDataPath;
        
        // We have directly manipulated the values object, so we should re remember it.
        this.rememberValues(true);

        if (isc.isA.DynamicForm(member)) {
            // remember values on the new member being added
            if (member.valuesHaveChanged()) member.rememberValues();

            // set up observation for async validation on the member
            this.observe(member, "handleAsyncValidationReply",
                "observer._handleFormAsyncValidationReply(this,success,errors,context)");
        }
    },
    
    // _setMemberValues - updates the values of a member (form or other dataBoundComponent) based
    // on the valuesManager values.
    // if 'pickupMemberValues' is passed - for cases where the member has existing values 
    // (and the valuesManager doesn't) we pick up the field values from the member.
    // [if there are values specified on the vm and the member, the vm values will replace the
    //  members' values]
    // Called
    // - when a member is first added to this valuesManager
    // - from valuesManager.setValues()
    _setMemberValues : function (member, pickupMemberValues, suppressRuleContextChangeEvent) {
        // Ignore inert members. Use the presence of 'getFields' as a rapid check for
        // data-aware components.
        if (member.getFields == null) return;
        
        // if a field is multiple, the values are expected to be an array.
        // Look at the dataArity of the databound member component to determine
        // whether we should display this array of values in the member
        var memberDataPath = member.getFullDataPath(),
            field = this.getField(memberDataPath),
            newValues = isc.DynamicForm._getFieldValue(memberDataPath, null, this.values, member, true),
            multiple = isc.isAn.Array(newValues) || (field && field.multiple),
            selComponent = member.selectionComponent;
        
        if (multiple) {
            if (member.dataArity == "single") {
                // Something that edits singular values is being assigned a multiple value.
                // - if a selectionComponent is set this means that this singular component is
                //   coordinating with a dataArity:multiple selectionComponent.  Ignore the
                //   update since the singular component is already observing the multiple
                //   component.
                if (selComponent != null) {
                    
                    // NOTE: The value derived here is *not* used for DynamicForms; forms are
                    // populated item-by-item, using the _getFieldValue() API (whioch knows how
                    // to derive the correct record for a multiple:true field)
                    var record = member._selectionComponentRecordPKs,
                        foundRecord = false;
                    for (var i = 0; i < newValues.length; i++) {
                        if (newValues[i] == record) {
                            foundRecord = true;
                            break;
                        }
                    }
                    if (foundRecord) {
                        newValues = newValues[i];
                    } else {
                        newValues = null;
                        // This is a normal condition, encountered during initial values
                        // setting, so only log it at debug level
                        if (this.logIsDebugEnabled()) {
	                        this.logDebug("Unable to locate selectionComponent's selected record in " +
	                                    "_setMemberValues.  Record is: " + isc.Comm.serialize(record));
                        }
                    }
                } else {
                    
                    // - if no selectionComponent is present it's tricky to know what the right behavior is
                    //   but default to editing the first record in the array of values.
                    if (isc.isAn.Array(newValues)) newValues = newValues[0];
                }
            } 
            // else: multiple component editing multiple values, as expected
        } else {
            // singular value for a multiple component: upconvert to an Array
            if (newValues != null && member.dataArity == "multiple") newValues = [newValues]
        }
        
        // if the member is not a dynamicForm, we'll just use 'setData()' to apply the appropriate
        // values to the member
        // This will apply values for all fields that match the dataPath of the object
        // (or possibly our top level values object) - differs from logic for forms where
        // we selectively apply values only to fields present in the form
        
        if (!isc.isA.DynamicForm(member)) {
            if (!member.setData) return;
            
            var dataPath = member.getFullDataPath(),
                // if pickupMemberValues is unset we don't care what the old values were
                oldValues = pickupMemberValues ? member.getData() : null;

            if (newValues == null) {
                
                // No field, so updateAtomicValue() will not be called, so no need for a reason
                if (pickupMemberValues) {
                    isc.DynamicForm._saveFieldValue(dataPath, null, oldValues, this.values, member, true);
                }
            } else {
                // if oldValues is anything other than
                // null, {} or [], it "has meaning" - log a warning that we're clobbering it rather
                // than picking it up.
                if (pickupMemberValues && 
                    oldValues != null && !isc.isAn.emptyObject(oldValues) &&
                    !isc.isAn.emptyArray(oldValues))
                {
                    this.logInfo("ValuesManager member:" + member.getID() +
                        " has existing values:" + this.echo(oldValues) +
                        ", replacing with values from this valuesManager:" + this.echo(newValues)); 
                }
                member.setData(newValues);
            }
            
        } else {
        
            // for dynamicForms only apply values for which the form is actually displaying
            // items, since we can split the values for a record across multiple forms and we
            // don't want to be maintaining multiple values objects
            var items = member.getItems(),
                hasChanges = false,
                fieldChanges = { /* fieldName -> newFieldValue */ },
                undef;

            member._suppressRuleContextUpdates = true;

            for (var i = 0; i < items.getLength(); i++) {
                var item = items[i];
                
                
                
                var itemPath = item.getTrimmedDataPath() || item.getFieldName();
                
                // Item with no name - just ignore it.
                if (itemPath == null) continue;
                var memberDataPath = member.getFullDataPath(),
                    isAbsolute = itemPath.startsWith(isc.Canvas._$slash),
                    fullFieldPath = isAbsolute ? itemPath
                                        : this._combineDataPaths(memberDataPath, itemPath);

                // Figure out the value for the field
                
                var newFieldValue = isc.DynamicForm._getFieldValue(fullFieldPath, null,
                                                                   this.values, 
                                                                   member, true);

                // for cases where we're looking inside the form - check for the
                // form already having a specified value for the field so we can notify
                // the developer we're clobbering it.
                
                if (!isAbsolute) {
                    var currentFieldValue = isc.DynamicForm._getFieldValue(fullFieldPath, 
                                                           null,
                                                           member.values, 
                                                           member, true);

                    if (currentFieldValue !== undef) {
                         this.logInfo("Member form " + member +
                                " has specified value for field '" + fullFieldPath +  
                                "' which collides with an already specified value in this " +
                                "ValuesManager. Resetting the value on the member form.");
                    }
                }
                
                if (newFieldValue !== undef) {
                    
                    member.setValue(itemPath, newFieldValue);
                } else {
                    // explicitly calling 'clearValues()' will cause dynamic defaults to be
                    // re-evaluated
                    if (!pickupMemberValues) member.clearValue(itemPath);
                }
                fieldChanges[itemPath] = newFieldValue;
                
                // Pick the value back up from the item
                // This will re-evaluate defaults on items, and potentially perform other
                // modification such as type-casting, so store the item's value again here 
                if (item.shouldSaveValue != false) {
                    
                    
                    var updatedFieldVal = member.getValue(itemPath);
                    
                    if (updatedFieldVal === undef) {
                        isc.DynamicForm._clearFieldValue(fullFieldPath, this.values, member, true);
                    } else {
                        
                        // No field, so updateAtomicValue() will not be called, so no need for a reason
                        isc.DynamicForm._saveFieldValue(fullFieldPath, null,
                                                        updatedFieldVal,
                                                        this.values, member, true);
                    }

                    hasChanges = true;
                }
                
                
                if (item.formValuesChanged && isc.isA.Function(item.formValuesChanged)) 
                    item.formValuesChanged();

                if (hasChanges) {
                    // fire valuesChanged() on the form, if any values have actually changed
                    if (member.valuesChanged) member.valuesChanged();
                    // redraw the member - required to correctly update the HTML for 
                    // readOnlyDisplay: "static" TextItems
                    if (member.markForRedraw) member.markForRedraw();
                }
            }
            
            if (pickupMemberValues) {
                //>DEBUG
                this._findItemlessFormValues(member);
                //<DEBUG
            }

            delete member._suppressRuleContextUpdates;

            if (!isc.isAn.emptyObject(fieldChanges)) {
                for (var fieldName in fieldChanges) {
                    var field = member.getField(fieldName),
                        newFieldValue = fieldChanges[fieldName]
                    ;
                    if (field) {
                        member._updateRuleScopeValues(field, fieldName, newFieldValue, true);
                    }
                }
                if (suppressRuleContextChangeEvent) {
                    this._needsRuleContextChanged = true;
                } else {
                    member.fireRuleContextChanged(member);
                }
            }
        }
    },
    
    //>DEBUG
    // findItemlessFormValues
    // When we first add a DynamicForm to a ValuesManager it may have values for fields
    // with no associated items
    // This is a helper method to find any values from form.getValues() with no associated
    // items.
    // We don't currently add them to this.values - just log a warning and clear them on the form
    // to avoid future confusion
    _findItemlessFormValues : function (form, values, dataPath, itemlessValues, dontWarn) {
        if (values == null) values = form.getValues();
        if (itemlessValues == null) itemlessValues = [];
        for (var prop in values) {
            var fieldID = dataPath ? this._combineDataPaths(dataPath, prop) : prop;
            if (!form.getItem(fieldID)) {
                var value = values[prop];
                if (!isc.isAn.Object(value) || isc.isA.Date(value) || isc.isAn.Array(value)) {
                    itemlessValues.add(fieldID);
                    // clear the value from the form so we avoid future confusion
                    form.clearValue(fieldID);
                    
                    // if we wanted to pick up these values and store them we could do so here
                    /*
                    var fullDataPath = form.dataPath 
                                            ? this._combineDataPaths(form.dataPath, fieldID) 
                                            : fieldID,
                        currentValue = isc.DynamicForm._getFieldValue(prop, null, this.values),
                        undef;
                    if (currentValue === undef) {
                        isc.DynamicForm._saveFieldValue(fullDataPath, null value, this.values);
                    }
                    */
                } else {
                    
                    // this will recursively iterate into objects until it reaches a dataPath with
                    // an associated item, or an atomic value which we can store directly
                    this._findItemlessFormValues(form, value, dataPath, itemlessValues, true);
                }
            }
        }
        
        if (!dontWarn && itemlessValues.length > 0) {
            this._itemlessValueWarning(form, itemlessValues);
        }
    },
    //<DEBUG
    
    //> @method valuesManager.addMembers()   
    //  Add multiple new member forms to this valuesManager.
    // @param   members  (Array of DynamicForm) array of forms to add to this valuesManager as members.
    // @group members
    // @see method:ValuesManager.addMember
    // @visibility external
    //<        
    addMembers : function (members) {
        if (!isc.isAn.Array(members)) this.addMember(members);
        else {
            for (var i = 0; i< members.length; i++) {
                this.addMember(members[i]);
            }
        }
    },
    
    //> @method valuesManager.removeMember()   
    //  Remove a member form from this valuesManager, so its values are no longer managed
    //  by this instance.
    //  This does not clear the values associated with the form from the valuesManager - they
    //  will still be available via <code>valuesManager.getValues()</code>, but will not be
    //  updated as the form is manipulated.
    // @param   member  (DynamicForm | String)   
    //      form (or ID of form) to remove from this valuesManager
    // @group members
    // @see method:ValuesManager.removeMembers()
    // @visibility external
    //<    
    removeMember : function (member) {
        
        if (isc.isA.String(member)) {
            member = isc.Class.getArrayItem(member, this.members);
            if (member == null) return;
        } else if (this.members && !this.members.contains(member)) return;

        // clear observation for async validation on the member
        if (isc.isA.DynamicForm(member)) {
            this.ignore(member, "handleAsyncValidationReply");
            var pendingMembers = this._pendingAsyncMembers;
            if (pendingMembers) pendingMembers.removeEvery(member);
        }
        
        if (this.members) this.members.remove(member);
        member.valuesManager = null;
    },
    
    //> @method valuesManager.removeMembers()   
    // Remove multiple member forms from this valuesManager.
    // @param members (Array of DynamicForm) array of forms to remove
    // @group members
    // @see method:ValuesManager.removeMember()
    // @visibility external
    //<    
    removeMembers : function (members) {
        if (!isc.isAn.Array(members)) this.removeMember(members);
        else {
            for (var i = 0; i< members.length; i++) {
                this.removeMember(members[i]);
            }
        }    
    },


    // ----------------------------------------------------------------------------------------
    // Display
    // ----------------------------------------------------------------------------------------
    // valuesManagers don't usually display their values directly - but support
    // getPrintHTML() so we can build reports from them.
    getPrintHTML : function () {
        var values = this.getValues(),
            printHTML = isc.StringBuffer.create();

        printHTML.append("<TABLE border=1><TR><TD align='center' style='font-weight:bold;'>Field</TD>",
                         "<TD align='center' style='font-weight:bold;'>Value</TD>");
        for (var fieldName in values) {
            printHTML.append("<TR><TD>",fieldName,"</TD><TD>", values[fieldName], "</TD></TR>");
        }
        printHTML.append("</TABLE>");
        return printHTML.release(false);
    },
    
    // recursively find all DataBoundComponents anywhere under any component bound to this VM
    getAllDBCs : function (child) {

        var dbcs = [];
    
        if (child == null) {
            for (var i = 0; i < this.members.length; i++) {
                dbcs.addAll(this.getAllDBCs(this.members[i]));
            }
            // It doesn't seem likely that this process could have created duplicates (generally
            // speaking, children can only belong to one parent), but let's get rid of any 
            // just in case
            var unique = [];
            for (var i = 0; i < dbcs.length; i++) {
                if (!unique.contains(dbcs[i])) unique.add(dbcs[i]);
            }
            return unique;
        }
                
        if (isc.isA.DataBoundComponent(child)) dbcs.add(child);
        var children = child.children;
        if (!children) return dbcs;

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (isc.isA.DataBoundComponent(child)) dbcs.add(child);
            dbcs.addAll(this.getAllDBCs(child));
        }
        return dbcs;
    }
        
});



isc.ValuesManager.registerStringMethods ({

     //> @method valuesManager.handleHiddenValidationErrors (A)
    // Method to display validation error messages for a valuesManager when there is not
    // currently visible form item displaying the errors.
    // This will be called when validation fails for<br>
    // - a field in a hidden or undrawn member form<br>
    // - a hidden field in a visible member form<br>
    // - for databound ValuesManagers, a datasource field with specified validators, but not
    //   associated item in any member.<br>
    // Implement this to provide custom validation error handling for these fields.<br>
    // By default hidden validation errors will be logged as warnings in the developerConsole.
    // Return false from this method to suppress that behavior.
    // @param   errors (Object) The set of errors returned - this is an object of the form<br>
    //                      &nbsp;&nbsp;<code>{fieldName:errors}</code><br>
    //                      Where the 'errors' object is either a single string or an array
    //                      of strings containing the error messages for the field.
    // @return (boolean) false from this method to suppress that behavior
    // @visibility external
    //<
    handleHiddenValidationErrors:"errors",
    
    //>	@method valuesManager.submitValues()
    // Optional +link{group:stringMethods, StringMethod} to fire when +link{valuesManager.submit()} is called
    // on this valuesManager (or any form included in this valuesManager).
    // 
    // @param	values    (Object)        the valuesManager values
    // @param	valuesManager      (ValuesManager)   the valuesManager being submitted
    // @group submitting
    // @see method:valuesManager.submit()
    // @visibility external
	//<
    submitValues : "values,valuesManager",
    
    //> @method valuesManager.itemChanged()
    // Handler fired whenever a change to a FormItem fires itemChanged() on one of the 
    // member forms.  Fires after that event.
    //
    // @param item (FormItem)     the FormItem where the change event occurred
    // @param newValue (Any)      new value for the FormItem
    // @visibility external
    //<
    itemChanged : "item,newValue"
});

//!<Deferred

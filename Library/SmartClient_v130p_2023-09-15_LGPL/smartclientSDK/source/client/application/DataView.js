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
//>	@class DataView
// A DataView coordinates the asynchronous loading of WSDL WebService and XML Schema
// definitions in applications created by Reify.
// <p>
// For applications that do not use WSDL Web Services and were not created by Reify,
// DataView is equivalent to it's superclass +link{VLayout}.
//
// @inheritsFrom VLayout
// @treeLocation Client Reference/Data Binding
// @visibility external
//<



isc.defineClass("DataView", isc.VLayout).addProperties({
    autoLoadServices:true,
    autoBindDBCs:true,

    //> @attr dataView.minMemberLength (int : 18 : IRW)
    // @include layout.minMemberLength
    // @see Canvas.minWidth
    // @group layoutPolicy
    // @visibility external
    //<
    minMemberLength: 18

})



isc.Canvas.addProperties({

dataViewInit : function () {

    var operations = this.operations;

    if (operations == null) {
        // no external services to load, bind now
        this.bindToServices();
        return;
    }

    this.operations.setProperty("dataView", this);

    if (!this.autoLoadServices) return;

    // ensure WSDL is loaded for all service operations defined on this dataview (note, relying
    // on duplicate load prevention)
    var locations = operations.getProperty("location").getUniqueItems();

    this.logInfo("loading services: " + locations);

    this._totalWSDLs = locations.length;
    var _this = this;
    for (var i = 0; i < locations.length; i++) {
        isc.xml.loadWSDL(locations[i], function (service) { 
            _this._totalWSDLs--;
            _this.logInfo("service loaded: " + service + ", remaining: " + _this._totalWSDLs);
            if (_this._totalWSDLs == 0) {
                _this.dataViewLoaded();
                _this.bindToServices();
            }
        }, null, true); // autoload dependencies
    }
},

// allow additional VMs to be registered
addVM : function (vm) {
    this.addedVMs = this.addedVMs || [];
    this.addedVMs.add(vm);
},

// Maps all DBCs within this DataView to the ValuesManager with the corresponding 
// webService/operation/message, if there is one.
bindToServices : function () {

    if (!this.autoBindDBCs) return;


    var dbcs = this.getAllDBCs(this);

    if (!dbcs) return;

    var vms = this.getAllVMs();

    if (this.logIsDebugEnabled("DataView")) {
        this.logDebug("vms: " + 
                     this.echoAll(vms.getProperties(["dataSource", 
                                                     "serviceNamespace", "serviceName"])) + 
                     ", all dbcs: " + 
                     this.echoAll(dbcs.getProperties(["dataSource", 
                                                      "serviceNamespace", "serviceName"])),
                     "DataView");
    }

    // for each DBC, find the VM it needs to participate in
    for (var i = 0; i < dbcs.length; i++) {
        var dbc = dbcs[i];
        if (dbc.dataSource) {

            if (this.canEdit != null && dbc.canEdit == null) dbc.setCanEdit(this.canEdit);

            var vm = this.findVM(dbc, vms);
            if (vm) {
                
                if (this.logIsInfoEnabled("dataRegistration")) {
                    this.logWarn("dbc: " + dbc + " binding to dataSource: " + dbc.dataSource + 
                                 " and vm: " + vm + 
                                 ", with fields: " + this.echoAll(dbc.originalFields),
                                 "dataRegistration");
                }
                if (dbc.originalFields) dbc.setDataSource(dbc.dataSource, dbc.originalFields);
                vm.addMember(dbc);
            } else {
                this.logInfo("no VM for DBC: " + this.echoLeaf(dbc), "DataView");
            }   
        }
        // NOTE: items can individually register even if their form is not databound
        if (isc.isA.DynamicForm(dbc) && dbc.items) {
            dbc.items.callMethod("registerWithDataView", this);
        }
    }
},

getAllVMs : function () {
    // collect all the available VMs
    var vms = [];
    var operations = this.operations;
    if (operations) {
        vms.addAll(operations.getProperty("inputVM"));
        vms.addAll(operations.getProperty("outputVM"));
    }
    vms.addAll(this.addedVMs);
    vms.removeList([null]);
    return vms;
},

// find the ValuesManager this DBC should belong to (matching message)
findVM : function (dbc, vms) {
    if (!vms) vms = this.getAllVMs();
    // accept either a DataSource directly or a DBC
    var ds = (isc.isA.DataSource(dbc) ? dbc : dbc.getDataSource());
    for (var i = 0; i < vms.length; i++) {
        var vm = vms[i];
        if (ds == vm.getDataSource()) return vm;
    }
},

// recursively find all DataBoundComponents anywhere under this DataView
getAllDBCs : function (child) {
    var children = child.children;
        
    if (!children) return null;

    var dbcs = [];
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (isc.isA.DataBoundComponent(child)) dbcs.add(child);
        dbcs.addAll(this.getAllDBCs(child));
    }
    return dbcs;
},

// Registration pattern for inputDataPath
// ---------------------------------------------------------------------------------------
// Refactor: this is almost exactly like what the ValuesManager does on setValues().  It
// may make sense for a component to be allowed to get data from multiple ValuesManager while
// only contributing data to a single ValuesManager.

registerItem : function (item) {
    if (!item.inputDataPath) return;
    
    var service = isc.WebService.getByName(item.inputServiceName, item.inputServiceNamespace);
    if (!service) {
        this.logWarn("Member: " + item + " could not find webService with name '" +
                     item.inputServiceName + "', " + "namespace '" + item.inputServiceNamespace
                     + "'. Has it been loaded?");
        return;
    }
    
    var messageID = item.inputSchemaDataSource;

    // store items by message   
    var itemRegistry = this.itemRegistry = this.itemRegistry || {};
    var messageItems = itemRegistry[messageID] = itemRegistry[messageID] || [];
    messageItems.add(item);
},

populateListeners : function (vm) {
    var messageID = vm.getDataSource().getID();

    var itemRegistry = this.itemRegistry;

    if (this.logIsInfoEnabled("DataView")) {
        this.logInfo("message: " + messageID + 
                     ", registry: " + this.echo(itemRegistry) +
                     ", data: " + this.echo(vm.getValues()), "DataView");
    }

    if (!itemRegistry) return;

    var items = itemRegistry[messageID];
    if (!items) return;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = vm.getValue(item.inputDataPath);
        this.logWarn("component: " + item + 
                     " with inputDataPath: " + item.inputDataPath +
                     " got data: " + this.echo(value)); 
        if (isc.isA.FormItem(item)) {
            item.setValue(value);
        } else {
            // update a DataBoundComponent
            item.setData(value);
        }
    }
},

//> @method dataView.dataViewLoaded() (A)
//
// Executed when the dataView has loaded all dependencies (such as DataSources or WebServices).
// No default implementation.
//
// @visibility external
//<

dataViewLoaded : function () {
    // no-op in default impl
}


});

isc.DataView.registerStringMethods({
    dataViewLoaded: ""
});

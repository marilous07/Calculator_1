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
//> @class Reify
// An application available within +link{group:reifyOnSite,Reify OnSite} that allows developers
// to create and manage SmartClient screens and datasources.  Only <b>internal framework
// code</b> can create an instance of the Reify tool -  do not try it directly in your
// applications.  If you want to create visual tools similar to Reify, see
// +link{group:devTools,the Dashboards & Tools framework overview}.
// <p>
// Note that in the SmartClient SDK, this class present only to provide
// +link{group:reifyForDevelopers,Reify} utility class method APIs, and is not an instantiable
// widget.  For example, you can call +link{Reify.getMockDS()} to export a +link{DataSource} as
// XML-formatted values and metadata for importing into Reify to create a
// +link{MockDataSource}.
// @treeLocation Client Reference/Tools
// @inheritsFrom VLayout
// @group reify
// @visibility external
//<

isc.defineClass("Reify", "VLayout").addClassMethods({

    create : function (A,B,C,D,E,F,G,H,I,J,K,L,M) {
        this.logWarn("In the SmartClient SDK, the Reify class is only present to provide " +
                     "several useful APIs, such as getMockDS() to export a DataSource in a " +
                     "format Reify can import.  You can't instantiate the Reify class.");
    },

    //> @object MockDSExportSettings
    // Settings used to control the export or serialization of a +link{DataSource} by
    // +link{reify.getMockDS()}.
    // @treeLocation Client Reference/Tools/Reify
    // @visibility external
    //<

    _defaultMockDSExportSettings: {

    //> @type MockDSExportFormat
    // @value "reifyCSV" export as Reify-specific CSV
    // @value "xmlMockDS" serialize as XML
    // @value "jsMockDS" serialize as JavaScript
    // @visibility external
    //<

    //> @attr mockDSExportSettings.format (MockDSExportFormat : "xmlMockDS" : IR)
    // Determines the format emitted by +link{reify.getMockDS()}.
    // @visibility external
    //<
    format: "xmlMockDS",

    //> @attr mockDSExportSettings.includeFKs (boolean : true : IR)
    // Should +link{DataSourceField.foreignKey,foreign key} relationships be included in the
    // export or serialization of the +link{DataSource}?
    // @visibility external
    //<
    includeFKs: true,    

    //> @attr mockDSExportSettings.omitRelations (Array of String : null : IR)
    // If including +link{DataSourceField.foreignKey,foreign key} relationships, those
    // relationships to skip.  This can be used to avoid dangling references to 
    // +link{DataSource,DataSources} that are not being exported or serialized.
    // @see includeFKs
    // @visibility external
    //<

    //> @attr mockDSExportSettings.includeCustomSimpleTypes (boolean : false : IR)
    // Whether to include custom-defined +link{SimpleType,SimpleTypes}.
    // @visibility external
    //<        

    //> @attr mockDSExportSettings.includeImageFields (boolean : false : IR)
    // Should +link{FieldType,image fields} be included in the export or serialization of the
    // +link{DataSource}?  They are excluded by default since the stored paths are unlikely to
    // be correct when placed in any other environment, such as Reify.
    // @visibility external
    //<        

    // Should +link{DataSourceField.foreignKey,foreign key} relationships be included in the
    // export or serialization of the +link{DataSource}?
    // @visibility external
    //<

    //> @attr mockDSExportSettings.criteria (Criteria : null : IR)
    // The +link{type:Criteria,criteria} used to fetch the records returned as part of the
    // export or serialization.
    // @visibility external
    //<

    //> @attr mockDSExportSettings.numRows (int : 20 : IR)
    // The number of rows of data to include, if more meet the +link{attr:criteria}.
    // @visibility external
    //<
    numRows: 20,

    //> @attr mockDSExportSettings.numLevels (int : 3 : IR)
    // The number of levels of nodes to include, for DataSources that define a
    // +link{group:treeDataBinding,tree relationship} between fields by declaring a
    // +link{dataSourceField.foreignKey,foreignKey} on one field that refers to another from
    // that same DataSource.
    // @see rootCriteriaOnly
    // @visibility external
    //<
    numLevels: 3,
    
    //> @attr mockDSExportSettings.rootCriteriaOnly (boolean : false : IR)
    // For DataSources that define a +link{group:treeDataBinding,tree relationship} between
    // fields by declaring a +link{dataSourceField.foreignKey,foreignKey} on one field that
    // refers to another from that same DataSource, should +link{attr:criteria} be applied only
    // to the root node?  If false, the criteria will be applied to all nodes.
    // @see numLevels
    // @visibility external
    //<

    //> @attr mockDSExportSettings.requestProperties (Array of DSRequest Properties | DSRequest Properties : null : IR)
    // The properties that will be specified on the +link{DSRequest} when fetching records.
    // You can pass an array of different request properties matching the length of the
    // <code>dsNames</code> param of +link{reify.getMockDS()} or +link{reify.showMockDS()} if you want the
    // fetch for each +link{DataSource} made with different properties.
    // @visibility external
    //<


    //> @attr mockDSExportSettings.buildDependencies (Boolean : null : IR)
    // If set <code>false</code>, skips (re)building DataSource interdependency metadata when
    // +link{getMockDS()} is called.  This is potentially dangerous and thus only for internal
    // use by callers such as +link{DataSourceNavigator} where +link{loadAndSortDataSources()}
    // has just been called on the same (or a superset of) DataSource IDs.
    //<

    //> @type MockDSExportValidatorMode
    // @value "all"      export all explicit, client-side validators
    // @value "standard" export all explicit, client-side standard (non-custom) validators
    // @value "none"     export no validators
    // @visibility external
    //<

    //> @attr mockDSExportSettings.validatorMode (MockDSExportValidatorMode : "standard" : IR)
    // Controls which +link{Validator,validators}, if any, to include in the fields of the
    // exported +link{MockDataSource}.  Since MockDataSources are client-only, server-only
    // validators are not exported.  Auto-generated validators are also not exported, since
    // they will be recreated based on the type of the field during the import process.
    // @visibility external
    //<
    validatorMode: "standard"

    },

    //> @method Callbacks.MockDSExportCallback
    // Callback fired upon successful completion of +link{reify.getMockDS()} or
    // +link{reify.showMockDS()}:<ul>
    // <li>
    // Output for all +link{DataSource,DataSources} together is reported as the single string
    // parameter <code>allDSData</code>.  When using +link{mockDSExportSettings.format,format}:
    // "reifyCSV", output for separate DataSources is separated by a special marker.
    // <li>
    // Output with each +link{DataSource} as a separate string array element is also available
    // as the parameter <code>perDSData</code>, ordered to match the <code>dsNames</code>
    // parameter in +link{reify.getMockDS()} or +link{reify.showMockDS()}.</ul>
    // <P>
    // Note that in the case of +link{reify.showMockDS()}, the callback is fired after the
    // window is closed, not when it's populated.
    //
    // @param allDSData (String) concatenated output for all <code>DataSources</code>
    // @param perDSData (Array of String) same output but delivered as a per-DS array
    // @visibility external
    //<


    ///////////////////////////////////////////////////////////////////////////////////////////
    // DataSource Loading (using DMI channel to main window or SC Server if available)

    // load the DataSources in dsNames and compute interdependency metadata
    
    loadAndSortDataSources : function (dsNames, callback, settings, dsNavigator) {
        // settings isn't a class, so default it from _defaultMockDSExportSettings
        settings = isc.addProperties({}, this._defaultMockDSExportSettings, settings);

        // build a map from the DataSource IDs to the DataSources
        var dsMap = {}, missing = this._buildDSMap(dsNames, dsMap);

        // load/report unloaded DataSources
        if (missing.length) {

            // use getter function to retrieve DataSource; used by DataSourceNavigator
            if (dsNavigator) {
                this.logInfo("loading DataSources " + missing + " from DMI channel");

                var loadedCount = 0;
                for (var i = 0; i < missing.length; i++) {
                    dsNavigator.useDataSourceObject(missing[i], function () {
                        if (++loadedCount < missing.length) return;
                        isc.Reify._handleDSLoadReply(dsNames, dsMap, callback, settings);
                    });
                }
                return;

            // if the SC server is present, we can use it load any missing DataSources
            } else if (isc.hasOptionalModules("SCServer")) {
                this.logInfo("loading DataSources " + missing + " from server");
                return isc.DS.load(dsNames, function (dsNames) {
                    isc.Reify._handleDSLoadReply(dsNames, dsMap, callback, settings);
                });
            }

            this.logWarn("DataSources " + missing + " aren't loaded and can't be loaded " +
                         "because SmartClient Server is not present; skipping");
        }

        // now for each DS, fetch the records needed for export
        this._mockDSLoaded(dsNames, dsMap, callback, settings);
    },

    // create map of DS ID => DS for loaded DataSources, returning any missing IDs
    _buildDSMap : function (dsNames, dsMap) {
        var missing = [];
        for (var i = 0; i < dsNames.length; i++) {
            var dsName = dsNames[i],
                ds = isc.DS.get(dsName);
            if (ds) dsMap[dsName] = ds;
            else missing.add(dsName);
        }
        return missing;
    },

    // handle loading of any unloaded DataSources from the SC server or DMI channel
    _handleDSLoadReply : function (dsNames, dsMap, callback, settings) {
        var missing = this._buildDSMap(dsNames, dsMap);
        if (missing.length) {
            this.logWarn("DataSources " + missing + " could not be loaded; skipping");
        }
        this._mockDSLoaded(dsNames, dsMap, callback, settings);
    },

    // we've loaded all the DataSources we can from dsNames; now compute interdependencies
    _mockDSLoaded : function (dsNames, dsMap, callback, settings) {
        // sort the original DataSource names by their foreignKey dependencies
        var sortedNames = settings.buildDependencies == false ? dsNames :
            this._getRelationSortedDSNames(dsNames, dsMap, settings);

        // report in callback whether any DataSources couldn't be loaded
        var incomplete = isc.getKeys(dsMap).length < dsNames.length;
        this.fireCallback(callback, "sortedNames,dsMap,settings,incomplete",
                          [sortedNames, dsMap, settings, incomplete]);
    },


    ///////////////////////////////////////////////////////////////////////////////////////////
    // Build dependency metadata from foreignKey relationships; sort dependent DataSources last

    _getNextDSIndicesInSort : function (dsNames, dsMap, sortedNames) {
        var indices = [];
        // loop across dsNames looking for DS with no unsorted dependencies
        loopOverDSNames:
        for (var i = 0; i < dsNames.length; i++) {
            var dsName = dsNames[i],
                ds = dsMap[dsName];
            if (ds) {
                var context = ds._relationContext,
                    relations = context && context.dependsOnRelations;
                if (relations) {
                    for (var otherDS in relations) {
                        // if dependency hasn't been sorted, can't sort this DS
                        if (!sortedNames[otherDS]) {
                            continue loopOverDSNames;
                        }
                    }
                }
            }
            indices.add(i);
        }
        return indices;
    },

    // sort DataSource names by their dependencies, putting dependent DataSources last
    _getRelationSortedDSNames : function (dsNames, dsMap, settings) {
        this._cleanAllRelationDependencies(dsMap);

        var includeFKs = settings.includeFKs;
        if (!includeFKs) return dsNames;
        dsNames = dsNames.duplicate();

        // build foreign key DS relation dependencies
        for (var dsName in dsMap) {
            this._buildRelationDependencies(dsMap[dsName], dsMap, settings);
        }

        
        var orderedNames = [],
            sortedNames = {}
        ;
        while (dsNames.length) {
            // get the current indices of those DataSources with no unsorted dependencies
            var nextIndices = this._getNextDSIndicesInSort(dsNames, dsMap, sortedNames);
            
            // process the indices; remove affected dsNames and mark them as sorted
            while (nextIndices.length) {
                var dsName = dsNames[nextIndices.pop()];
                sortedNames[dsName] = true;
                dsNames.remove(dsName);

                // don't report DataSources we couldn't load
                if (dsMap[dsName]) orderedNames.add(dsName);
            }
        }

        return orderedNames;
    },

    _cleanAllRelationDependencies : function(dsMap) {
        for (var dsName in dsMap) delete dsMap[dsName]._relationContext;
    },

    _buildRelationDependencies : function (ds, dsMap, settings) {
        var includeFKs = settings.includeFKs;
        if (!includeFKs) return [];
        
        var relations = {},
            dsName = ds.getID(),
            fields = ds.getFields(),
            treeIdField, treeParentIdField,
            omitRelations = settings.omitRelations;
        for (var fieldName in fields) {
            var field = fields[fieldName],
                relation = field.foreignKey;
            // process each foreignKey relation that hasn't been excluded by settings
            if (relation && (!omitRelations || !omitRelations.contains(relation))) {
                var tokens = relation.match(/([A-Za-z_]+)(?:\.([A-Za-z_]+))?/);
                if (!tokens) continue;

                var dependsOnField = tokens[2] || tokens[1],
                    dependsOnDS = dsMap[tokens[1] || dsName];
                if (!dependsOnDS) continue;

                // tree relationship (relation to same DS)
                if (dependsOnDS == ds) {
                    
                    treeIdField = dependsOnField;
                    treeParentIdField = fieldName;
                    continue;
                }

                // build the map of foreign DataSource fields this one "depends on"
                
                if (!relations[dependsOnDS.ID]) relations[dependsOnDS.ID] = {};
                relations[dependsOnDS.ID][fieldName] = dependsOnField;

                // create a context for the "depends on" DataSource
                var dependsOnContext = dependsOnDS._relationContext;
                if (!dependsOnContext) dependsOnContext = dependsOnDS._relationContext = {};

                // add ourselves to list of DataSources dependent on "depends on" DS
                
                var dependentRelations = dependsOnContext.dependentRelations;
                if (!dependentRelations) {
                    dependentRelations = dependsOnContext.dependentRelations = [];
                }
                if (!dependentRelations.contains(dsName)) dependentRelations.add(dsName);
            }
        }

        // update the relation context for the DataSource
        var hasRelations = !isc.isAn.emptyObject(relations);
        if (treeIdField || treeParentIdField || hasRelations) {
            
            var context = ds._relationContext;
            if (!context) context = ds._relationContext = {};
            // while fetching, we'll track completion of dependencies of dependent DataSources
            if (hasRelations) {
                context.dependsOnRelations = relations;
                context.nCompleteRelations = 0;
            }
            // save the fields defining the tree relationship in the context
            if (treeIdField)       context.treeIdField       = treeIdField;
            if (treeParentIdField) context.treeParentIdField = treeParentIdField;
        }
    },

    
    ///////////////////////////////////////////////////////////////////////////////////////////
    // Public APIs to get or show a list of DataSources from their IDs

    //> @classMethod reify.getMockDS()
    // Exports or serializes the specified +link{DataSource,DataSources} using the provided
    // settings.
    // <P>
    // The "reifyCSV" +link{mockDSExportSettings.format,format} generates comma-separated
    // values to paste into the DataSource creation wizard in +link{group:reifyForDevelopers,
    // Reify}.  The use case for the other two formats is, if you have a SmartClient
    // application, and you plan to load +link{MockDataSource, MockDataSources} to enable
    // people to add screens to your application using Reify, you may want to test your
    // application with the MockDataSources to ensure they have the right data to allow your
    // application to function (for example, that records in one MockDataSource that are
    // related to another MockDataSource match up).  Similarly, you may want to test any custom
    // classes that you upload to Reify in a standalone file using +link{MockDataSource,
    // MockDataSources}.
    // <P>
    // You can customize the <code>settings</code>, such as
    // +link{mockDSExportSettings.numRows,numRows} (or
    // +link{mockDSExportSettings.numLevels,numLevels} for tree-DataSources) to keep the data
    // volume returned by the export low.  When related DataSources are present, all related
    // records will be included in the export, even if <code>numRows</code> is exceeded.  If
    // this is too much data, +link{mockDSExportSettings.criteria,criteria} can be used to
    // further restrict exported records.  Note that <code>settings</code> supports an array of
    // +link{mockDSExportSettings.requestProperties,requestProperties}, so that you can provide
    // unique configuration for each DataSource being exported, rather than only global
    // configuration.
    // <P>
    // Unless you need programmatic or expert control over the settings, you will likely find
    // it easier to use the "Reify Export" button in the +link{group:dataSourcesTab,DataSources tab}.
    // as when using that route, useful global and per-DataSources settings can be configured
    // in an intuitively-arranged popup dialog.
    //
    // @param dsNames (Array of String | String) +link{DataSource.ID,ID}s of the desired
    //                                           DataSources
    // @param callback (MockDSExportCallback) called with the complete export or serialization
    // @param settings (MockDSExportSettings) controls format and what records and metadata to
    //                                        include
    // @see group:reifyForDevelopers
    // @see showMockDS()
    // @visibility external
    //<
    getMockDS : function (dsNames, callback, settings, dsNavigator) {
        if (isc.isA.String(dsNames)) dsNames = [dsNames];

        // catch and reject calls with invalid arguments rather than dealing with them later
        var errorMessage = this._validateGetMockDSArgs(dsNames, callback, settings);
        if (errorMessage) return this.logWarn("getMockDS(): " + errorMessage);

        
        this.loadAndSortDataSources(dsNames, function (sortedNames, dsMap, settings) {
            // now for each DS, fetch the records needed for export
            isc.Reify._getMockDSData(dsNames, sortedNames, dsMap, callback, settings);

        }, settings, dsNavigator);
    },

    _validateGetMockDSArgs : function (dsNames, callback, settings) {
        // for anything to be done, a callback is required
        if (!callback) return "a callback must be provided";

        // we need at least one valid DataSource ID to export
        if (!isc.isAn.Array(dsNames)) {
            return "a DataSource ID or array of IDs must be provided";
        }

        // check for duplicate DS IDs and that each DS ID is a valid, non-empty string
        var nameMap = {};
        for (var i = 0; i < dsNames.length; i++) {
            var dsName = dsNames[i];
            if (!dsName) return "a non-empty ID must be provided for each DataSource";
            if (nameMap[dsName]) return "duplicate DS ID '" + dsName + "' present";
            nameMap[dsName] = dsName;
        }

        // the array of request properties (if provided as an array) must match the DS IDs
        var requestProperties = settings && settings.requestProperties;
        if (isc.isAn.Array(requestProperties) && requestProperties.length != dsNames.length) {
            return "if you supply an array of request properties, " + 
                   "the length must equal the number of DS IDs provided";
        }
    },

    exportDataWindowTitle: "Exported DataSources/Records",
    exportDataIncompleteMessage: "Some DataSources or DS Records couldn't be retrieved",

    
    tooMuchDataWarning:
        "${export} is too large for upload to Reify.com.  Continue anyway?<P>" +
        "Note: use criteria to limit the exported rows.",
    maxUploadFileSize: 300 * 1024,
    dsScalingFactor: 8,

    //> @classMethod reify.showMockDS()
    // Shows the result of running +link{getMockDS()} in a +link{ModalWindow,modal window} so
    // it can be copied and pasted as needed into +link{group:reifyForDevelopers,Reify} or
    // elsewhere.
    // <P>
    // Note that the callback is fired when the window is closed, not when it's populated.
    //
    // @param dsNames (Array of String | String) +link{DataSource.ID,ID}s of the desired
    //                                           DataSources
    // @param callback (MockDSExportCallback) called with the complete export or serialization
    // @param settings (MockDSExportSettings) controls format and what records and metadata to
    //                                        include
    // @visibility external
    //<
    showMockDS : function (dsNames, callback, settings, dsNavigator) {
        var reifyTools = this;
        this.getMockDS(dsNames, function (concatExport, arrayExport, incomplete) {
            if (isc.ContentViewerWindow) {
                var modalWindow = isc.ContentViewerWindow.create({
                    title: reifyTools.exportDataWindowTitle,
                    onHide : function () {
                        this.fireCallback(callback, "concatExport,arrayExport", 
                                          [concatExport, arrayExport]);                    
                    }
                });
                modalWindow.showContent(concatExport);
            } else {
                reifyTools.logWarn(
                    "Logging the MockDS XML since form support not loaded:\n" + concatExport);
            }
            if (incomplete) {
                var message = settings && settings.incompleteMessage || 
                              reifyTools.exportDataIncompleteMessage;
                isc.Notify.addMessage(message, null, null, {
                    messagePriority: isc.Notify.WARN
                });
            }
        }, settings, dsNavigator);
    },


    ///////////////////////////////////////////////////////////////////////////////////////////
    // Fetch the Mock DataSource records

    _getMockDSData : function (dsNames, sortedNames, dsMap, callback, settings) {
        // no DataSource could be loaded, so just bail out, firing callback
        if (isc.isAn.emptyObject(dsMap)) {
            this.fireCallback(callback, "concatExport,arrayExport,incomplete",
                              [null, [], true]);
            return;
        }

        if (isc.Log.logIsDebugEnabled()) {
            this.logDebug("Fetching record data for DataSources: " + dsNames);
        }

        
        if (isc.isAn.Array(settings.requestProperties)) {
            for (var i = 0; i < dsNames.length; i++) {
                var ds = dsMap[dsNames[i]];
                ds._origIndex = i;
            }
        }

        // accumulate data for requested DataSources
        var replyContext = {
            allDSData: {}, fetchCount: isc.getKeys(dsMap).length
        };

        var queued = isc.RPCManager.startQueue();

        
        for (var i = 0; i < sortedNames.length; i++) {
            var dsName = sortedNames[i];

            // skip unloaded DataSources
            var ds = dsMap[dsName];
            if (!ds) continue;

            
            var context = ds._relationContext;
            if (context && context.dependsOnRelations) break;

            // retrieve dsNames index to access requestProperties array
            var origIndex = ds._origIndex != null ? ds._origIndex : i;

            // fetch requested records; the response may trigger additional fetches
            this._fetchMockDSData(ds, dsNames, dsMap, replyContext, settings, callback,
                                  origIndex);
        }

        if (!queued) isc.RPCManager.sendQueue();
    },

    // fetch records for a Mock DS; broken out since the reponse may trigger another fetch
    _fetchMockDSData : function (ds, dsNames, dsMap, replyContext, settings, callback, index) {
        var requestProps = settings.requestProperties;

        // handle request properties being an array
        if (isc.isAn.Array(requestProps)) {
            if (index == null) index = ds._origIndex;
            
            requestProps = requestProps[index];
        }
        var allDSData = replyContext.allDSData;

        // build dynamic request properties for this fetch; "data" will be new criteria
        var props = this._getMockDSDataRequestProps(ds, allDSData, requestProps, settings);

        ds.fetchData(settings.criteria, function (response, data, request) {
            var dsName = request.dataSource,
                localDS = dsMap[dsName],
                oldData = allDSData[dsName],
                context = ds._relationContext || {},
                fetchCount = replyContext.fetchCount,
                isTree = !!context.treeIdField
            ;
            
            if (response.status) {
                isc.Reify.logWarn("unable to fetch records for " + dsName);

            } else if (data) {
                // store fetched records
                allDSData[dsName] = data;

                
                if (isTree) {
                    if (oldData) {
                        
                        data._parentRecords = oldData;
                    }
                    data._treeData = true;

                    if (isc.Reify._getTreeDataDepth(data) < context.numLevels) {
                        isc.Reify._fetchMockDSData(ds, dsNames, dsMap, replyContext, settings,
                                                   callback, index);
                        return;
                    }
                }
            }

            
            var dependents = context.dependentRelations || [];
            for (var i = 0; i < dependents.length; i++) {
                var dependentDS = dsMap[dependents[i]],
                    context = dependentDS._relationContext,
                    dependencies = context.dependsOnRelations;
                // bump "completed relations" count; if done, trigger fetch on that DS
                if (++context.nCompleteRelations == isc.getKeys(dependencies).length) {
                    isc.Reify._fetchMockDSData(dependentDS, dsNames, dsMap, replyContext,
                                               settings, callback);
                }
            }
                    
            // fire callback only after records for all DataSources have been retrieved
            
            if (!--replyContext.fetchCount) {
                isc.Reify._handleMockDSData(dsNames, dsMap, allDSData, callback, settings);
            }
        }, props);
    },

    // build request properties with the right criteria, incluing dependencies
    _getMockDSDataRequestProps : function (ds, allDSData, requestProps, settings) {
        var context = ds._relationContext || {},
            isTree  = !!context.treeIdField,
            relations = context.dependsOnRelations,
            props = {willHandleError: true}
        ;
        // create locally modifiable props copy
        isc.addProperties(props, requestProps);

        
        if (isTree) {
            context.numLevels = props.numLevels || settings.numLevels;
            delete props.endRow;
        } else if (!relations) {
            if (props.endRow == null) props.endRow = settings.numRows;
        }

        // pick up the criteria directly from the request props or settings
        var criteria = requestProps && requestProps.data || settings.criteria;
        
        // for a tree DS, augment the criteria to retrieve the next children
        
        if (isTree) {
            var parentIdField = ds.getField(context.treeParentIdField),
                rootValue = parentIdField.rootValue,
                records = allDSData[ds.ID],
                nodeCriteria = {};
            nodeCriteria[parentIdField.name] = 
                records ? records.getProperty(context.treeIdField) :
                (rootValue == null ? null : rootValue);

            // support rootCriteriaOnly by wiping out criteria other than parentID
            var rootOnly = settings.rootCriteriaOnly;
            if (requestProps && requestProps.rootCriteriaOnly != null) {
                rootOnly = requestProps.rootCriteriaOnly;
            }
            if (rootOnly && records) criteria = null;

            criteria = criteria ? isc.DS.combineCriteria(criteria, nodeCriteria) :
                                                                   nodeCriteria;
        }
        // for a DS with "depends on" relations, form criteria from those relations
        if (relations) {
            var fkCriteria = {};

            // support ignoreRelationCriteria by wiping out relation criteria
            var ignoreRelations = settings.ignoreRelationCriteria;
            if (requestProps && requestProps.ignoreRelationCriteria != null) {
                ignoreRelations = requestProps.ignoreRelationCriteria;
            }
            if (!ignoreRelations) for (var dsName in relations) {
                records = allDSData[dsName];

                // link data chain from tree here; otherwise done in _handleMockDSData()
                if (records && records._treeData) {
                    records = allDSData[dsName] = this._getLinkedTreeData(records);
                }

                
                if (!records || !records.length) {
                    props.endRow = 0;
                    break;
                }
                var dependencies = relations[dsName];
                for (var fieldName in dependencies) {
                    var dependsOnField = dependencies[fieldName];
                    fkCriteria[fieldName] = records.getProperty(dependsOnField);
                }
            }

            criteria = criteria ? isc.DS.combineCriteria(criteria, fkCriteria) :
                                                                   fkCriteria;
        }
        // if the criteria has been modified set it into the request
        if (criteria != settings.criteria) props.data = criteria;

        return props;
    },

    // helper methods dealing with tree DataSource records
    
    _getTreeDataDepth : function (data) {
        var depth;
        for (depth = 0; data; depth++) {
            data = data._parentRecords;
        }
        return depth;
    },
    _getLinkedTreeData : function (data) {
        var sets;
        for (sets = []; data; data = data._parentRecords) {
            sets.add(data);
        }
        sets.reverse();
        
        var allRows = [];
        for (var i = 0; i < sets.length; i++) {
            allRows.addList(sets[i]);
        }
        return allRows;
    },


    ///////////////////////////////////////////////////////////////////////////////////////////
    // Handle export/serialization of DataSource fields and records

    // export or serialize each DataSource requested and its associated data
    _handleMockDSData : function (dsNames, dsMap, allDSData, callback, settings,
                                  concatExport, arrayExport, dsStartIndex)
    {
        if (!arrayExport)   arrayExport = [];
        if (!concatExport) concatExport = "";
        if (!dsStartIndex) dsStartIndex = 0;

        for (var i = dsStartIndex; i < dsNames.length; i++) {
            var dsName = dsNames[i],
                ds = dsMap[dsName];
            if (!ds) {
                arrayExport.add(null);
                continue;
            }

            var dsExport = null,
                data = allDSData[dsName],
                leadLine = isc.emptyString
            ;
            // tree DS - flatten linked arrays of records into single array
            if (data && data._treeData) {
                data = allDSData[dsName] = this._getLinkedTreeData(data);
            }

            switch (settings.format) {
            case "jsMockDS":
            case "xmlMockDS":
                dsExport = this.serializeMockDS(ds, data, settings);
                break;
            case "reifyCSV":
            default:
                dsExport = this.getMockDSCSV(ds, data, settings);
                leadLine = "=== " + dsName + "\n";
            }

            // compute update to concatenation for this DS
            var nextConcatExport = concatExport;
            if (dsExport) {
                dsExport = dsExport.trim();
                if (concatExport) nextConcatExport += "\n\n";
                nextConcatExport += leadLine + dsExport;
            }

            // if the export is growing too large for upload, confirm before continuing export
            if (settings.warnOnTooMuchData && this._confirmDataOverflow(
                dsName, dsStartIndex, dsExport, nextConcatExport, function (value) {
                    if (value) {
                        arrayExport.add(dsExport), concatExport = nextConcatExport;
                    }
                    isc.Reify._handleMockDSData(dsNames, dsMap, allDSData, callback, settings,
                        concatExport, arrayExport, value ? i + 1 : dsNames.length);
                }))
            {
                return;
            }

            arrayExport.add(dsExport), concatExport = nextConcatExport;
        }

        // track whether DataSources or DS records couldn't be retrieved
        var incomplete = isc.getKeys(dsMap).length < dsNames.length ||
                         isc.getKeys(allDSData).length < dsNames.length;

        this.fireCallback(callback, "concatExport,arrayExport,incomplete",
                          [concatExport, arrayExport, incomplete]);
    },

    // confirm upload of exports that appear to exceed the maximum file size
    _confirmDataOverflow : function (dsName, dsStartIndex, dsExport, concatExport, callback) {
        var overflower;
        if (!dsStartIndex && concatExport.length > 
            this.maxUploadFileSize * this.dsScalingFactor)
        {
            overflower = "This multi-DS export";
        }
        if (dsExport && dsExport.length > this.maxUploadFileSize) {
            overflower = "Export of '" + dsName + "' DataSource";
        }
        if (overflower) {
            isc.confirm(this.tooMuchDataWarning.evalDynamicString(this, {export: overflower}),
                        callback);
            return true;
        }
    },

    // controls what field types get exported
    _getExportFieldNames : function (ds, settings) {
        var exportFieldNames = [],
            fields = ds.getFields();
        for (var fieldName in fields) {
            var field = fields[fieldName];
            switch (field.type) {
            case "image":
                if (!settings.includeImageFields) continue;
            case "binary":
            case "imageFile":
                continue;
            }
            exportFieldNames.add(fieldName);
        }
        return exportFieldNames;
    },

    // export DS in Reify-specific CSV format
    getMockDSCSV : function (ds, data, settings) {
        var fields = ds.getFields(),
            includeFKs = settings.includeFKs,
            omitRelations = settings.omitRelations,
            fieldNameList = this._getExportFieldNames(ds, settings)
        ;
        // first, export the DataSource fields
        var output = "";
        for (var i = 0; i < fieldNameList.length; i++) {
            if (output) output += ",";
            var field = fields[fieldNameList[i]];
            output += "\"" + field.name + "|" + field.title;
            if (field.primaryKey) output += "|PK";

            if (includeFKs) {
                var relation = field.foreignKey;
                if (relation && (!omitRelations || !omitRelations.contains(relation))) {
                    output += "|FK=" + relation;
                }
            }

            output += "\"";
        }
        output += "\n";

        // if records were fetched export them too
        if (data && data.length) {
            var records = ds.recordsAsText(data, {fieldList: fieldNameList});
            // map embedded double quote to Excel format
            output += records.replace(/\\\"/g, "\"\"") + "\n";
        }

        return output;
    },

    // schema for XML serialization of a MockDataSource
    _mockDSSchema: isc.DataSource.create({
        ID: "isc_MockDSSchema",
        tagName: "MockDataSource",
        fields: [{
            name: "ID", xmlAttribute: true
        }, {
            name: "fields", multiple: true, childTagName: "field",
            fields:  [{
                name: "name", type: "string", xmlAttribute: true
            }, {
                name: "title", type: "string", xmlAttribute: true
            }, {
                name: "type", type: "string", xmlAttribute: true
            }, {
                name: "primaryKey", type: "boolean", xmlAttribute: true
            }, {
                name: "foreignKey", type: "string", xmlAttribute: true
            }, {
                name: "rootValue", xmlAttribute: true
            }, {
                name: "required", type: "boolean", xmlAttribute: true
            }, {
                name: "length", type: "integer", xmlAttribute: true
            }, {
                name: "detail", type: "boolean", xmlAttribute: true
            }, {
                name: "hidden", type: "boolean", xmlAttribute: true
            }, {
                name: "joinType", type: "string", xmlAttribute: true
            }, {
                name: "displayField", type: "string", xmlAttribute: true
            }, {
                name: "foreignDisplayField", type: "string", xmlAttribute: true
            }, {
                name: "includeFrom", type: "string", xmlAttribute: true
            }, {
                name: "valueMap", multiple: true
            }, {
                name: "validators", multiple: true, childTagName: "validator",
                fields: [{name:"condition", type:"function"}]
            }]
      }, {
          name: "cacheData", multiple: true, childTagName: "Object",
          fields: [{name:"_dummyField"}]
        }]
    }),

    // return the DSField attributes preserved by export process
    
    _getMockDSFieldAttributes : function (settings) {
        switch (settings.format) {
        case "reifyCSV":
            return ["name", "title", "primaryKey"];
        default:
        case "xmlMockDS":
        case "jsMockDS":
            var schema = this._mockDSSchema,
                fieldSpec = schema.getField("fields");
            return fieldSpec.fields.getProperty("name");
        }
    },

    // serialize MockDataSource in either JavaScript or XML format
    serializeMockDS : function (ds, data, settings) {
        var mockFields = [],
            fields = ds.getFields(),
            fieldNameList = this._getExportFieldNames(ds, settings),
            props = {ID: ds.getID(), fields: mockFields}
        ;

        // create the fields for the new MockDataSource
        for (var i = 0; i < fieldNameList.length; i++) {
            var field = fields[fieldNameList[i]];
            mockFields.add(this._filterDSFieldForExport(field, settings));
        }

        // with minimal schema, must copy records to limit what's exported
        if (data) {
            var cacheData = props.cacheData = [];
            for (var i = 0; i < data.length; i++) {
                var record = {};
                for (var j = 0; j < fieldNameList.length; j++) {
                    var fieldName = fieldNameList[j];
                    if (fieldName in data[i]) {
                        record[fieldName] = data[i][fieldName];
                    }
                }
                cacheData.add(record);
            }
        }

        // fields have been generated; now serialize the MockDataSource
        switch (settings.format) {
        case "xmlMockDS":
            return this._mockDSSchema.xmlSerialize(props);
        case "jsMockDS":
            return "isc.MockDataSource.create(" + isc.Comm.serialize(props) + ")";
        }            
    },

    _shouldKeepRelation : function (relation, includeFKs, omitRelations) {
        // no relation or not including foreign keys
        if (!includeFKs || !relation) return false;

        return !omitRelations || !omitRelations.contains(relation);
    },

    // build up DSField with appropriate attributes for export, using settings
    _filterDSFieldForExport : function(field, settings) {
        var mockField = {};

        // copy across field properties to export; schema is used except for reifyCSV format
        var propsToCopy = this._getMockDSFieldAttributes(settings);
        for (var j = 0; j < propsToCopy.length; j++) {
            var key = propsToCopy[j];
            if (key in field) mockField[key] = field[key];
        }

        var format = settings.format,
            includeFKs = settings.includeFKs,
            includeFrom = settings.includeFrom,
            omitRelations = settings.omitRelations
        ;
        // add foreignKey if needed (or remove it if not appropriate if using schema)
        if (this._shouldKeepRelation(field.foreignKey, includeFKs, omitRelations)) {
            if (format == "reifyCSV") mockField.foreignKey = field.foreignKey;
        } else {
            delete mockField.foreignKey;
            delete mockField.foreignDisplayField;
            delete mockField.rootValue;
            delete mockField.joinType;
            // only remove the display field if rejecting foreignKey
            if ("foreignKey" in field) delete mockField.displayField;
        }

        // remove the type from export if it's not a built-in SimpleType
        if ("type" in mockField && !isc.SimpleType.getType(mockField.type)) {
            delete mockField.type;
        }

        // filter the exported validators according to the validatorMode;
        // always drop server-only validators since the export is an MDS
        var validatorMode = settings.validatorMode;
        if (validatorMode == "none") {
            delete mockField.validators;

        // drop custom client-side validators for validatorMode:"standard"
        } else if (mockField.validators) {
            mockField.validators = mockField.validators.filter(function (validator) {
                if (validator.serverOnly || validator.type == "serverCustom") {
                    return false;
                }
                if (validator._generated || validator.type == "required") {
                    return false;
                }
                if (validatorMode != "all" && validator.type == "custom") {
                    return false;
                }
                return true;
            });
            // if all validators have been dropped, drop the entire element
            if (!mockField.validators.length) delete mockField.validators;
        }

        // remove includeFrom if not appropriate (only applies to schema-driven formats)
        if (!this._shouldKeepRelation(field.includeFrom, includeFrom, omitRelations)) {
            delete mockField.includeFrom;
        }

        return mockField;
    }

});


if (isc.DynamicForm) {

// class to show multi-line text in a modal window with scrolling
isc.defineClass("ContentViewerWindow", "ModalWindow").addProperties({
    autoParent: "none",
    doneViewingText: "Done",
    contentWrap: isc.TextAreaItem.VIRTUAL,

    contentFormDefaults: {
        _constructor: "DynamicForm",
        numCols: 1, width: "100%", height: "100%",
        items: [{
            name: "data", editorType: "TextAreaItem",
            width: "100%", height: "100%",
            showTitle: false,  canEdit: false,
            init : function () {
                this.Super("init", arguments);
                this.wrap = this.form.creator.contentWrap;
            }
        }, {
            name: "button", editorType: "ButtonItem",
            width: 100, align: "right",
            getTitle : function () {
                return this.form.creator.doneViewingText;
            },
            click : function () {
                this.form.creator.hide();
            }
        }],
        showContent : function (content) {
            this.setValue("data", content);
            this.getItem("data").scrollToTop();
        }
    },

    showContent : function (content) {
        if (!this.contentForm) {
            this.contentForm = this.createAutoChild("contentForm");
            this.addItem(this.contentForm);
        }
        this.contentForm.showContent(content);
        if (content) this.show();
        else         this.hide();
    },

    hide : function () {
        this.invokeSuper(isc.ContextViewerWindow, "hide");
        if (this.onHide) this.delayCall("onHide", null, 0);
    }

});

}


isc.Reify.addClassMethods({

    //> @classAttr reify.serverURL (URL : isc.Reify.serverURL : IRW)
    // URL of Reify server to use when calling +link{reify.loadProject()}.  This URL is assumed
    // to only specify the server root, so +link{reify.projectLoaderPath} will be appended to
    // it when sending the actual request.  Can be overridden by
    // +link{loadProjectSettings.serverURL}.
    // <P>
    // Note that, unless this URL is on your local VPN, it is recommended to use
    // <code>https</code> to protect your login credentials.
    // @visibility external
    //<
    serverURL: "https://reify.com",

    //> @classMethod reify.setServerURL()
    // Setter for +link{serverURL}.
    // @param serverURL (URL)
    // @visibility external
    //<
    setServerURL : function (serverURL) {
        this.serverURL = serverURL;
    },

    //> @classAttr reify.projectLoaderPath (String : isc.Reify.projectLoaderPath : IRW)
    // Sets the path to reach the +link{group:servletDetails,ProjectLoaderServlet} relative to
    // the base +link{serverURL}.  Can be overridden by
    // +link{loadProjectSettings.projectLoaderPath}.
    // @visibility external
    //<
    projectLoaderPath: "isomorphic/projectLoader",

    //> @classMethod reify.setProjectLoaderPath()
    // Setter for +link{projectLoaderPath}.
    // @param path (String)
    // @visibility external
    //<
    setProjectLoaderPath : function (path) {
        this.projectLoaderPath = path;
    },

    //> @classAttr reify.userName (String : null : IRW)
    // Account name to use for authenticating with the Reify server when calling
    // +link{Reify.loadProject()}.  If proper credentials are not provided the project will not
    // be loaded.  Can be overridden by +link{loadProjectSettings.userName}.
    // <P>
    // Note that you can set your email address into this property instead of your user name,
    // and the server should still be able to authenticate you for project loading.
    // @see password
    // @visibility external
    //<

    //> @classMethod reify.setUserName()
    // Setter for +link{userName}.
    // @param userName (String)
    // @visibility external
    //<
    setUserName : function (userName) {
        this.userName = userName;
    },

    //> @classAttr reify.password (String : null : IRW)
    // Account password to use for authenticating with the Reify server when calling
    // +link{Reify.loadProject()}.  If proper credentials are not provided the project will not
    // be loaded.  Can be overridden by +link{loadProjectSettings.userName}.
    // @see userName
    // @visibility external
    //<

    //> @classMethod reify.setPassword()
    // Setter for +link{password}.
    // @param password (String)
    // @visibility external
    //<
    setPassword : function (password) {
        this.password = password;
    },

    //> @attr loadProjectSettings.serverURL (URL : varies : IR)
    // URL of Reify server to use when calling +link{reify.loadProject()} instead of
    // +link{reify.serverURL}.
    // <P>
    // Note that this setting only applies when using +link{Reify.loadProject())}.
    // @visibility external
    //<

    //> @attr loadProjectSettings.projectLoaderPath (String : varies : IR)
    // Path relative to the +link{serverURL,server root}, to target to use the project loader
    // servlet, instead of +link{reify.projectLoaderPath}.
    // <P>
    // Note that this setting only applies when using +link{Reify.loadProject())}.
    // @visibility external
    //<

    //> @attr loadProjectSettings.userName (String : varies : IR)
    // Overrides +link{reify.userName} setting the account name for +link{reify.loadProject()}.
    // <P>
    // Note that this setting only applies when using +link{Reify.loadProject())}.
    // @visibility external
    //<

    //> @attr loadProjectSettings.password (String : varies : IR)
    // Overrides +link{reify.password} setting the account password for
    // +link{reify.loadProject()}.
    // <P>
    // Note that this setting only applies when using +link{Reify.loadProject())}.
    // @visibility external
    //<

    //> @classAttr Reify.verifyDataSources (Boolean : null : IR)
    // Controls whether +link{loadProjectSettings.verifyDataSources, DataSource verification}
    // is enabled by default for all +link{RPCManager.loadProject, loadProject} operations.
    // @visibility external
    //<

    //> @classMethod Reify.loadProject()
    // Loads projects from the Reify server specified by +link{serverURL()} (or
    // +link{loadProjectSettings.serverURL}) using the 
    // +link{group:servletDetails,ProjectLoaderServlet}, reachable at the relative path
    // +link{projectLoaderPath} (or +link{loadProjectSettings.projectLoaderPath}) underneath
    // the server URL, and fires the given callback after the project has been cached.  When a
    // project is loaded, all of its DataSources and screens (except where explicitly
    // overridden by settings) are also cached in the project.
    // <P>
    // See +link{RPCManager.loadProject()} for further details.
    //
    // @param projectNames (String)              Comma-separated string containing the names of
    //                                           project(s) to load.
    // @param callback     (LoadProjectCallback) Callback for notification of completion of
    //                                           project(s) loaded and screens cached.
    // @param settings     (LoadProjectSettings) Settings applicable to the loadProject
    //                                           operation.
    // @visibility external
    //<
    loadProject : function (projectNames, callback, settings) {
        settings = isc.addProperties({}, settings);

        // calculate the projectLoaderURL that RPCManager.loadProject() will target
        var serverURL  = settings.serverURL         || this.serverURL,
            loaderPath = settings.projectLoaderPath || this.projectLoaderPath
        ;
        delete settings.serverURL; delete settings.projectLoaderPath;
        settings.projectLoaderURL = isc.RPCManager.safelyCombinePaths(serverURL, loaderPath);

        // now add the authentication credentials that are required to retrieve the project
        
        var userName =                          settings.userName || this.userName,
            password = "password" in settings ? settings.password : this.password;
        if (userName)                 settings.USERNAME = userName;
        if (isc.isA.String(password)) settings.PASSWORD = password;
        delete settings.userName; delete settings.password;

        if ("USERNAME" in settings && !("PASSWORD" in settings)) {
            this.logWarn("You've provided a userName for accessing " + settings.serverURL +
                         " but no password");
        }
        isc.RPCManager.loadProject(projectNames, callback, settings);
    }
});

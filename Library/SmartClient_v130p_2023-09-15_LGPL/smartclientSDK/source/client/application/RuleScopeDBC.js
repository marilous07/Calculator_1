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
     
    _dbcTypeDetails : {
        "DynamicForm":  { titleSuffix: "Form",        criteriaBasePathSuffix: "values"        , metaFields: ["focusField","hasChanges"] },
        "ListGrid":     { titleSuffix: "Grid",        criteriaBasePathSuffix: ["selectedRecord","values","summaryRecord"], metaFields: ["focusField","anySelected","multiSelected","numSelected","hasChanges","dataLoading","totalRows","lastRow","isGrouped"]},
        "TreeGrid":     { titleSuffix: "Tree",        criteriaBasePathSuffix: ["selectedRecord","values","summaryRecord"], metaFields: ["focusField","anySelected","multiSelected","numSelected","hasChanges","dataLoading"] },
        "TileGrid":     { titleSuffix: "Tile Grid",   criteriaBasePathSuffix: "selectedRecord" },
        "CubeGrid":     { titleSuffix: "Cube",        criteriaBasePathSuffix: "selectedRecord" },
        "ColumnTree":   { titleSuffix: "Column Tree", criteriaBasePathSuffix: "selectedRecord" },
        "DetailViewer": { titleSuffix: "Details",     criteriaBasePathSuffix: "values"         }
    },

    _dbcTypeMetaFieldTypes : {
        "focusField":   "text",
        "hasChanges":   "boolean",
        "isGrouped":    "boolean",
        "anySelected":  "boolean",
        "multiSelected":"boolean",
        "numSelected":  "integer",
        "totalRows":  "integer",
        "lastRow":  "integer",
        "dataLoading": "boolean"
    },

    _ruleScopeMetaFieldNamePrefix: isc._underscore + "meta_"   
});

// DataBoundComponent methods
isc.Canvas.addMethods({

makeDataSourcesFromFields : function (id) {
    if (id == null) id = this.getLocalId();

    var dataSources = [];

    for (var className in isc.Canvas._dbcTypeDetails) {
        if (this.isA(className)) {
            var titleSuffix = isc.Canvas._dbcTypeDetails[className].titleSuffix,
                suffixes = isc.Canvas._dbcTypeDetails[className].criteriaBasePathSuffix,
                metaFields = isc.Canvas._dbcTypeDetails[className].metaFields
            ;
            if (suffixes) {
                suffixes = (isc.isAn.Array(suffixes) ? suffixes : [suffixes]);
            } else {
                suffixes = [null];
            }

            for (var j = 0; j < suffixes.length; j++) {
                var criteriaBasePathSuffix = suffixes[j],
                    // only add meta fields for first suffix
                    addMetaFields = (j == 0)
                ;

                if (criteriaBasePathSuffix) {
                    criteriaBasePathSuffix = id + "." + criteriaBasePathSuffix;
                }
                var title = id + " " + titleSuffix,
                    dsID = id + "_" + "values"
                ;
                if (j > 0) {
                    title += " (" + isc.DS.getAutoTitle(suffixes[j]) + ")";
                }
                if (isc.DataSource.get(dsID)) {
                    // This really shouldn't occur unless the user explicitly assigns the
                    // same ID to two DBCs.
                    var count = 2,
                        testDsID;
                    do {
                        testDsID = dsID + count++;
                    } while (isc.DataSource.get(testDsID));
                    dsID = testDsID;
                }
                var properties = { addGlobalId: false, _tempScope: true, ID: dsID, clientOnly: true, criteriaBasePath: criteriaBasePathSuffix, title: title, pluralTitle: title };
            
                var fields = (this.getAllFields ? this.getAllFields() : this.getFields());
                if (fields) {
                    var dsFields = [];
                    for (var i = 0; i < fields.length; i++) {
                        var field = fields[i];
            
                        // defensive null check
                        if (!field) continue;
            
                        var fieldName = field[this.fieldIdProperty],
                            fieldTitle = field.title,
                            fieldType = (isc.isA.FormItem(field) ? field.getType() : field.type) || "text"
                        ;
                        // skip unnamed fields
                        if (!fieldName) continue;
            
                        if (fieldType == "select") fieldType = "text";
            
                        var props = { name: fieldName, title: fieldTitle, type: fieldType };
                        if (field.valueMap) props.valueMap = field.valueMap;
            
                        dsFields.push(props);
                    }
                    properties.fields = dsFields;
                }
            
                if (addMetaFields && metaFields) {
                    var dsFields = [];
                    for (var i = 0; i < metaFields.length; i++) {
                        var fieldName = metaFields[i],
                            fieldType = isc.Canvas._dbcTypeMetaFieldTypes[fieldName]
                        ;
                        if (fieldType) {
                            dsFields.push({ name: isc.Canvas._makeRuleScopeMetaFieldName(fieldName),
                                title: "[meta] " + fieldName,
                                type: fieldType,
                                criteriaPath: id + "." + fieldName
                            });
                        }
                    }
                    if (dsFields.length > 0) properties.fields.addList(dsFields);
                }
            
                dataSources.add(isc.DS.create(properties));
            }
        }
    }

    return dataSources;
}    
});

isc.Canvas.addClassMethods({

_makeRuleScopeMetaFieldName : function (fieldName) {
    if (fieldName == null) return null;
    if (!fieldName.contains(".")) return isc.Canvas._ruleScopeMetaFieldNamePrefix + fieldName;
    var lastDot = fieldName.lastIndexOf(".") + 1,
        leader = fieldName.substring(0,lastDot),
        trailer = fieldName.substring(lastDot)
    ;
    return leader + 
        (!trailer.startsWith(isc.Canvas._ruleScopeMetaFieldNamePrefix) ? isc.Canvas._ruleScopeMetaFieldNamePrefix : "") +
        trailer;
},

// Returns the preferred owner from two components for contributing to ruleContext.
// For any collision, an editable display (such as a form or editable grid) wins over a
// static display (such as a non-editable grid with a selection). Hidden components have
// lowest priority even if editable. For two editable components the first becomes
// the owner.
getRuleContextPreferredOwnerID : function (owner, dbc) {
    // If owner is not provided the DBC should be the new owner
    if (!owner) return dbc.getID();
    // Prefer visible component
    if (owner.isVisible && !owner.isVisible() &&
        dbc.isVisible && dbc.isVisible())
    {
        return dbc.getID();
    }
    // Prefer non-cleared component
    if (owner.getDrawnState && owner.getDrawnState() == isc.Canvas.UNDRAWN &&
        dbc.getDrawnState && dbc.getDrawnState() != isc.Canvas.UNDRAWN)
    {
        return dbc.getID();
    }

    // Prefer editable component
    // This is harder than it seems because there are multiple ways to
    // disable editing on a component and no single way to check it.
    var isEditable = function (component) {
        if (component.isDisabled && component.isDisabled()) return false;
        if (isc.isA.DynamicForm(component)) {
            // A form is editable unless canEdit:false
            return (component.canEdit != false); 
        } else if (isc.isA.ListGrid(component)) {
            // A grid is editable if canEdit:true
            return component.canEdit; 
        }
        return false;
    };
    if (!isEditable(owner) && isEditable(dbc)) {
        return dbc.getID();
    }
    // New dbc is not preferred from an editibility standpoint.
    // Prefer a DynamicForm over other components.
    if (!isc.isA.DynamicForm(owner) && isc.isA.DynamicForm(dbc)) {
        return dbc.getID();
    }

    return owner.getID();
},

// Get source for ruleContext contribution from component.
// "values" for a DynamicForm, "selectedRecord" from grid, etc.
getRuleScopeSourceFromComponent : function (component) {
    for (var className in isc.Canvas._dbcTypeDetails) {
        if (component.isA(className)) {
            var typeDetails = isc.Canvas._dbcTypeDetails[className],
                suffixes = typeDetails && typeDetails.criteriaBasePathSuffix
            ;
            if (suffixes) {
                suffixes = (isc.isAn.Array(suffixes) ? suffixes : [suffixes]);
            }
            var sourceTitle = suffixes && isc.DS.getAutoTitle(suffixes[0]);
            return (sourceTitle ? sourceTitle.toLowerCase() : suffixes[0]);
        }
    }
    return null;
},

// Returns a list of DataSources from the ruleScope component. Uses
// DS of DBC which is databound and auto-generates a DS for non-databound
// components. The DS or auto-gen'd DS for the targetRuleScope component
// is excluded.
//
// Call cleanupRuleScopeDataSources(list) when done with list


getRuleScopeDataSources : function (targetRuleScope, excludeNonStable, excludeAuth) {
    if (!targetRuleScope) return [];
    targetRuleScope = (isc.isA.String(targetRuleScope) ? window[targetRuleScope] : targetRuleScope);

    var dataSources = [],
        ruleContextDataSources = targetRuleScope._ruleContextDataSources || {},
        dsMap = {};
    for (var path in ruleContextDataSources) {
        if (path.indexOf(".") < 0) {
            var ds = ruleContextDataSources[path];
            if (ds != null && !ds._internal && !dsMap[ds.ID]) {
                dataSources.add(ds);
                dsMap[ds.ID] = true;
            }
        }
    }

    if (targetRuleScope.getRuleScopeDataBoundComponents) {
        var dbcList = targetRuleScope.getRuleScopeDataBoundComponents(excludeNonStable);
        for (var i = 0; i < dbcList.length; i++) {
            if (dbcList[i] == targetRuleScope) {
                continue;
            }
            var ds = dbcList[i].dataSource;
            if (ds && !dsMap[ds.ID]) {
                if (isc.isA.String(ds)) ds = isc.DS.get(ds);
                if (ds != null && !dataSources.contains(ds)) {
                    dataSources.add(ds);
                    dsMap[ds.ID] = true;
                }
            }
            if (dbcList[i] != targetRuleScope) {
                // Auto-generate
                dataSources.addList(dbcList[i].makeDataSourcesFromFields(dbcList[i].getLocalId()));
            }
        }
    }

    // Add Screen Inputs DataSources
    var screenInputs = targetRuleScope.getScreenInputDataSources();
    for (var key in screenInputs) {
        var ds = isc.DS.get(key);
        if (!ds) continue;
        var dsID = ds.getID(),
            newID = dsID + isc._underscore + "screenInput",
            title = "Screen Inputs: <i>" + dsID + "</i>",
            fieldNames = screenInputs[key],
            properties = {
                addGlobalId: false,
                _tempScope: true,
                ID: newID,
                clientOnly: true,
                criteriaBasePath: "dataContext." + dsID,
                title: title,
                pluralTitle: title,
                filterKeywords: ["Screen Inputs", dsID]
            },
            fields = []
        ;
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i],
                field = ds.getField(fieldName),
                newField = { name: fieldName, type: field.type, valueMap: field.valueMap }
            ;
            fields.add(newField);
        }
        if (fields.length > 0) {
            properties.fields = fields;
            dataSources.add(isc.DS.create(properties));
        }
    }

    // Add fixed DataSources
    if (!excludeAuth) dataSources.add(isc.Auth.getAuthSchema());
    dataSources.add(this.getRuleContextDeviceSchema());
    return dataSources;
},

// Same as getRuleScopeDataSource except targetRuleScope component DS
// is included in list.
//
// Call cleanupRuleScopeDataSources(list) when done with list
getAllRuleScopeDataSources : function (targetRuleScope, excludeNonStable, excludeAuth) {
    var currentForm = (isc.isA.String(targetRuleScope) ? window[targetRuleScope] : targetRuleScope),
        currentFormDS = (currentForm && currentForm.getDataSource ? currentForm.getDataSource() : null)
    ;
    if (!currentFormDS && isc.isA.DataBoundComponent(currentForm)) {
        var dataSources = currentForm.makeDataSourcesFromFields();
        currentFormDS = dataSources[0];
    }

    var dataSources = isc.Canvas.getRuleScopeDataSources(currentForm, excludeNonStable, excludeAuth);
    if (currentFormDS) {
        dataSources.addAt(currentFormDS, 0);
    }

    return dataSources;
},

cleanupRuleScopeDataSources : function (dataSources) {
    dataSources = dataSources || [];
    if (!isc.isAn.Array(dataSources)) dataSources = [dataSources];

    for (var i = 0; i < this.dataSources.length; i++) {
        var ds = this.dataSources[i];
        if (ds._tempScope) {
            ds.destroy();
        }
    }
},

// Returns map of ruleScope dataSources->ownerID. Applies same rules
// for choosing an owner from conflicting contributors as writing to
// ruleContext.
getRuleScopeDataSourceOwners : function (targetRuleScope, excludeNonStable) {
    if (!targetRuleScope) return {};
    targetRuleScope = (isc.isA.String(targetRuleScope) ? window[targetRuleScope] : targetRuleScope);
    if (!targetRuleScope.getRuleScopeDataBoundComponents) return {};
    var dataSources = [],
        dbcList = targetRuleScope.getRuleScopeDataBoundComponents(excludeNonStable),
        owners = {}
    ;
    for (var i = 0; i < dbcList.length; i++) {
        if (dbcList[i] != targetRuleScope && dbcList[i].dataSource) {
            var dbc = dbcList[i],
                dbcID = dbc.getID(),
                dsID = (isc.isA.String(dbc.dataSource) ? dbc.dataSource : dbc.dataSource.ID),
                owner = owners[dsID]
            ;
            if (owner) {
                // Have seen this DS before. Resolve conflict to identify which DBC is the owner
                if (isc.Canvas.getRuleContextPreferredOwnerID(owner, dbc) == dbcID) {
                    owners[dsID] = dbc;
                }
            } else {
                // Initial owner
                owners[dsID] = dbc;
            }
        }
    }
    return owners;
},

// Returns a single DataSource with other nested DataSources to
// describe the current state of the ruleScope/ruleContext.
getCurrentRuleScopeSchema : function (targetRuleScope, excludeNonStable, excludeAuth) {
    if (!targetRuleScope) return null;
    targetRuleScope = (isc.isA.String(targetRuleScope) ? window[targetRuleScope] : targetRuleScope);
    var dataSources = isc.Canvas.getAllRuleScopeDataSources(targetRuleScope, excludeNonStable, excludeAuth);

    var fields = [],
        tempDataSources = []
    ;
    for (var i = 0; i < dataSources.length; i++) {
        var ds = dataSources[i];
        if (ds._tempScope) tempDataSources.add(ds);

        if (ds.criteriaBasePath) {
            // Break criteriaBasePath into parts to create intermediate DataSources
            var parts = ds.criteriaBasePath.split("."),
                innerDSProperties = []
            ;

            for (var j = 0; j < parts.length-1; j++) {
                var dsID = isc.ClassFactory.getNextGlobalIDForClass("DataSource");
                if (innerDSProperties.length > 0) {
                    innerDSProperties[innerDSProperties.length-1].fields = [ { name: parts[j], type: dsID } ];
                }
                innerDSProperties.add({ addGlobalId: false, ID: dsID, clientOnly: true });
            }

            var firstDS = ds;
            if (innerDSProperties.length > 0) {
                innerDSProperties[innerDSProperties.length-1].fields = [ { name: parts[j], type: ds.ID } ];
            }

            for (var j = innerDSProperties.length-1; j >= 0; j--) {
                firstDS = isc.DS.create(innerDSProperties[j]);
                tempDataSources.add(firstDS);
            }

            fields.add({ name: parts[0], type: firstDS.ID });
        } else {
            fields.add({ name: ds.tagName || ds.ID, type: ds.ID });
        }
    }
    
    var schemaID = isc.ClassFactory.getNextGlobalIDForClass("DataSource");
    var schema = isc.DS.create({
        addGlobalId: false, 
        ID: schemaID,
        clientOnly: true,
        fields: fields,

        _tempDataSources: tempDataSources,
        
        destroy : function () {
            if (!this.destroyed) {
                if (this._tempDataSources) {
                    // Destroy auto-generated DataSources.
                    for (var i = 0; i < this._tempDataSources.length; i++) {
                        this._tempDataSources[i].destroy();
                    }
                    this._tempDataSources = null;
                }
                this.Super("destroy", arguments);
                this.destroyed = true;
            }
        }
    });

    targetRuleScope.registerRuleScopeSchema(schema);

    return schema;
},

getRuleContextDeviceSchema : function () {
    // Device schema is global so just cache it on the Canvas class
    if (isc.Canvas._deviceSchema == null && isc.DataSource) {
        isc.Canvas._deviceSchema = isc.DataSource.create({
            ID:"isc_device",
            tagName:"device",
            _internal: true,
            // Enable matching on tagName for DS.getDataSourceForField
            _useTagName:true,
            title:"Device Characteristics",
            filterKeywords: ["Device"],
            clientOnly: true,
            fields:[
                {name:"isPhone", type:"boolean"},
                {name:"isTablet", type:"boolean"},
                {name:"isDesktop", type:"boolean"},
                {name:"isLandscape", type:"boolean"}
            ]
        });
    }
    return isc.Canvas._deviceSchema;
},

// Returns a new DataSource with name and title fields representing
// the fields in the 'dataSources' DataSources. 'dataSources' is typically
// populated by DBC.getRuleScopeDataSources or DBC.getAllRuleScopeDataSources
// for the target ruleScope.
//
// Caller is responsible for destroying the DataSource after use.
//
// @param targetRuleScope (Canvas | String) ruleScope being targeted
// @param dataSources (Array of DataSource) see description above 
// @param [targetComponent] (Canvas)
// @param [excludedRuleScope] (Array of String) list of DataPaths to exclude
// @param [fieldFormat] (MultiDSFieldFormat) 
getMultiDSFieldDataSource : function (targetRuleScope, dataSources, targetComponent, excludedRuleScope, fieldFormat) {
    var options = {
        excludedRuleScope: excludedRuleScope,
        fieldFormat: fieldFormat,
        enableHeader: false,
        sourceDetailStyleName: "filterBuilderTitleCellDisabled"
    };
    var ds = this.getRuleScopeSelectionDataSource(targetRuleScope, dataSources, targetComponent, options);
    ds._isMultiDSFieldDS = true;

    return ds;
},

// Returns a new DataSource with name and title fields representing
// the fields in the 'dataSources' DataSources. 'dataSources' is typically
// populated by DBC.getRuleScopeDataSources or DBC.getAllRuleScopeDataSources
// for the target ruleScope. If not specified, DBC.getRuleScopeDataSources will be used.
//
// Caller is responsible for destroying the DataSource after use.
//
// @param targetRuleScope (Canvas | String) ruleScope being targeted
// @param [dataSources] (Array of DataSource) see description above 
// @param [targetComponent] (Canvas)
// @param [options]    (Object)    options object to control the DS building process
//                  in the format {excludedRuleScope: list of DataPaths to exclude
//                                 fieldFormat: "separated"/"qualified",
//                                 enableHeader: true/false,
//                                 sourceDetailStyleName: css style name or null}
getRuleScopeSelectionDataSource : function (targetRuleScope, dataSources, targetComponent, options) {
    if (!targetRuleScope) return null;
    targetRuleScope = (isc.isA.String(targetRuleScope) ? window[targetRuleScope] : targetRuleScope);

    var cleanupDataSources = false;
    if (!dataSources) {
        dataSources = this.getRuleScopeDataSources();
        cleanupDataSources = true;
    }

    // extract options
    var excludedRuleScope = options && options.excludedRuleScope,
        fieldFormat = options && options.fieldFormat,
        enableHeader = options && options.enableHeader,
        sourceDetailStyleName = options && options.sourceDetailStyleName,
        createHeader = (fieldFormat == "separated"),
        nodeId = 0
    ;

    var ruleContext = targetRuleScope.getRuleContext(),
        owners = isc.Canvas.getRuleScopeDataSourceOwners(targetRuleScope, true),
        targetComponentDSID = (targetComponent && targetComponent.getDataSource && targetComponent.getDataSource() ? targetComponent.getDataSource().ID : null),
        targetComponentData = [],
        suppressTargetComponentData = false,
        testData = [],
        lastDsID = ""
    ;

    for (var i = 0; i < dataSources.length; i++) {
        var dataSource = (isc.isA.String(dataSources[i]) ? isc.DataSource.get(dataSources[i]) : dataSources[i]);
        if (dataSource == null) {
            this.logWarn("getMultiDSFieldDataSource() - unable to locate dataSource:" + dataSources[i]);
            continue;
        }
        var dsID = dataSource.getID(),
            dsFields = dataSource.getFieldNames(),
            headerRecord = null,
            fieldData = []
        ;

        if (createHeader && lastDsID != dsID) {
            var owner = owners[dataSource.ID],
                source = (owner ? isc.Canvas.getRuleScopeSourceFromComponent(owner) : null),
                isCurrentComponent = (targetComponentDSID && targetComponentDSID == dsID)
            ;
            headerRecord = this._createRuleScopeSectionRecord(
                                        dataSource,
                                        owner,
                                        source,
                                        isCurrentComponent,
                                        enableHeader,
                                        sourceDetailStyleName);
            headerRecord.id = "" + nodeId++;

            // Suppress standard DS fields if current component is the provider. This
            // gives preferences to simple, local fields instead.
            if (owner == targetComponent && source) {
                suppressTargetComponentData = true;
            }

            lastDsID = dsID;
        }

        for (var j = 0; j < dsFields.length; j++) {
            var fieldName = (dataSource.tagName || dsID) + "." + dsFields[j],
                field = dataSource.getField(dsFields[j]),
                fieldTitle = (createHeader ? field.title || field.name : fieldName)
            ;
            if (!field) continue;

            var record = {
                id: "" + nodeId++,
                name: fieldName,
                title: fieldTitle,
                type: field.type
            };
            if (headerRecord) {
                record.parentId = headerRecord.id;
                record.isFolder = false;
            }

            if (dataSource.criteriaBasePath) {
                record.criteriaPath = field.criteriaPath || fieldName.replace(dsID, dataSource.criteriaBasePath);
                if (excludedRuleScope && excludedRuleScope.contains(record.criteriaPath)) {
                    continue;
                }
                // Localize criteriaPath for targetComponent fields
                // This will be applied to valuePath selections
                if (dsID == targetComponentDSID && !field.criteriaPath) {
                    var criteriaBasePath = field.criteriaBasePath || dataSource.criteriaBasePath;
                    record.criteriaPath = record.criteriaPath.replace(criteriaBasePath, "");
                    if (record.criteriaPath.startsWith(".")) {
                        record.criteriaPath = record.criteriaPath.substring(1)
                    }
                }
            } else if (excludedRuleScope && excludedRuleScope.contains(fieldName)) {
                continue;
            }

            if (ruleContext) {
                record.value = isc.DataSource.getPathValue(ruleContext, fieldName);
            }
            fieldData[fieldData.length] = record;
        }

        if (fieldData.length > 0) {
            if (headerRecord) {
                fieldData.addAt(headerRecord, 0);
            }

            var addToTestData = true;
            if (targetComponent) {
                if (dataSource.criteriaBasePath) {
                    var componentID = dataSource.criteriaBasePath.split(".")[0];
                    if (componentID == targetComponent.ID) {
                        testData.addListAt(fieldData, 0);
                        addToTestData = false;
                    }
                } else if (targetComponent.dataSource) {
                    // var ID = (isc.isA.String(targetComponent.dataSource) ?
                    //             targetComponent.dataSource :
                    //             targetComponent.dataSource.getID());
                    if (targetComponentDSID == dsID) {
                        targetComponentData.addList(fieldData);
                        addToTestData = false;
                    }
                }
            }
            if (addToTestData) {
                testData.addList(fieldData);
            }
        }
    }
    if (cleanupDataSources) {
        isc.Canvas.cleanupRuleScopeDataSources(dataSources);
    }

    // If targetComponent DS was found and a targetComponent 'values' wasn't add the
    // standard DS where the values would be
    if (!suppressTargetComponentData && targetComponentData.length > (createHeader ? 1 : 0)) {
        testData.addListAt(targetComponentData, 0);
    }

    var fields = [
        { name: "id", type: "text", hidden: true }, 
        { name: "name", type: "text" }, 
        { name: "title", type: "text" },
        { name: "type", type: "text", hidden: true },
        { name: "keywords", type: "text", multiple: true, hidden: true },
        { name: "expandInitially", type: "boolean", hidden: true },
        { name: "clearValue", type: "boolean", hidden: true }
    ];
    if (createHeader) {
        fields.addList([
            { name: "parentId", type: "text", hidden: true }
        ]);
    }
    var ds = isc.DS.create({
        clientOnly: true,
        resultTreeClass: isc.RuleScopeFilterResultTree || isc.ResultTree,
        fields: fields,
        testData: testData
    });
    return ds;
},

_createRuleScopeSectionRecord : function (dataSource, owner, source, isCurrentComponent, enabled, sourceDetailStyle) {
    var dsID = dataSource.getID(),
        dsTitle = dataSource.pluralTitle || dataSource.title || dsID,
        dsCriteriaBasePath = dataSource.criteriaBasePath,
        dsFilterKeywords = dataSource.filterKeywords,
        titlePrefix = (dsCriteriaBasePath ? "" : "<i>"),
        titleSuffix = (dsCriteriaBasePath ? "" : "</i>"),
        sourcePrefix = (sourceDetailStyle ? "<span class=\"" + sourceDetailStyle + "\">" : ""),
        sourceSuffix = (sourceDetailStyle ? "</span>" : ""),
        title = titlePrefix +
                (isCurrentComponent && dsCriteriaBasePath ? "Current Component" : dsTitle) +
                titleSuffix +
                " Fields",
        keywords = []
    ;
    if (dsFilterKeywords) {
        keywords.addList(dsFilterKeywords);
    } else if (!isCurrentComponent || !dsCriteriaBasePath) {
        keywords.add(dsTitle);
    }

    if (owner && source) {
        title += " " + sourcePrefix + "(" + source + " in <i>" + owner.getID() + "</i>)" + sourceSuffix;
        keywords.addList([source, owner.getID()]);

    // A DS for component fields has a criteriaBasePath and user and device DataSources
    // have a tagName
    } else if (!owner && !dsCriteriaBasePath && !dataSource.tagName) {
        title += " " + sourcePrefix + "(screen input)" + sourceSuffix;
    }

    var record = {
        name: dataSource.tagName || dsID,
        title: title,
        type: "text",
        enabled: enabled,
        keywords: keywords
    };

    // Flag record to be expanded initially if it's a regular DataSource
    // and not marked as internal
    if (dataSource.addGlobalId && !dataSource._internal) {
        record.expandInitially = true;
    }
    return record;
}

});

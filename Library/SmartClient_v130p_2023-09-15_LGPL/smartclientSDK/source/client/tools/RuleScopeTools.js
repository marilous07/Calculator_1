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
isc.defineClass("RuleScopeFilterResultTree", "ResultTree").addMethods({
    keepParentsOnFilter: true,

    filterLocalData : function (parentNode) {
        this.Super("filterLocalData", arguments);

        // Open all folders when filtered except those marked to not
        var criteria = this._localCriteria || this.criteria;
        if (this.haveCriteria(criteria)) {
            var tree = this;
            isc.Timer.setTimeout(function () {
                var children = tree.getChildren(tree.getRoot());
                for (var i = 0; i < children.length; i++) {
                    if (children[i]._expandNode == false) {
                        tree.closeFolder(children[i]);
                    } else {
                        tree.openFolder(children[i]);
                    }
                }
            });
        }
    },

    // Returns true if any children match criteria
    _filterChildren : function (criteria, filterMode, dataSource, parent, context) {
        
        var strict = (filterMode == isc.Tree.STRICT),
            keepParents = !strict;

        var parentNodeLocator;
        if (this.isANodeLocator(parent)) {
            parentNodeLocator = parent;
            parent = parent.node;
        }

        var children = parent[this.childrenProperty];
        if (children == null || children.isEmpty()) return false;

        var haveMatchingNodes = false;

        if (isc.isA.String(dataSource)) dataSource = isc.DS.get(dataSource);

        
        var isResultSet = isc.isA.ResultSet(children);
        strict = strict || isResultSet;

        var i = (isResultSet ? children._getCachedLength() : children.getLength());
        while (i--) {
            var node = children.getCachedRow(i);
            if (node != null) {
                var hasImmediateMatches = false,
                    nodeChildren = node[this.childrenProperty],
                    childNodeLocator;
                if (this.isMultiLinkTree() && parentNodeLocator) {
                    var childPath = this._constructChildPath(parentNodeLocator.path, node, 
                                        this.allowDuplicateChildren ? i : null);
                    childNodeLocator = this.createNodeLocator(node, parent, 
                                this.allowDuplicateChildren ? i : null, childPath);
                }

                
                var compareNode = node;
                if (this.isMultiLinkTree() && this.allowFilterOnLinkFields) {
                    var linkRecord = this.getLinkRecord(parent[this.idField], node[this.idField], i);
                    compareNode = isc.addProperties({}, linkRecord, node);
                    context.allowFilterOnLinkFields = true;
                    context.linkDataSource = this.linkDataSource;
                }

                // If node specifies 'keywords' search against them rather than search field
                var filterNodes = [compareNode],
                    searchField = null,
                    criteriaFields = null
                ;
                // Determine the search field. If there are multiple fields in the
                // criteria, find the first one that isn't hidden.
                criteriaFields = isc.DS.getCriteriaFields(criteria, dataSource);
                if (criteriaFields.length > 1 && dataSource) {
                    for (var j = 0; j < criteriaFields.length; j++) {
                        var criteriaFieldName = criteriaFields[j],
                            dsField = dataSource.getField(criteriaFieldName)
                        ;
                        if (dsField && !dsField.hidden) {
                            searchField = criteriaFieldName;
                            break;
                        }
                    }
                }

                if (compareNode.isFolder) {
                    // If the folder defined keywords for search, create nodes for filtering
                    // using those keywords in the search field instead of filtering against
                    // the folder node itself.
                    var keywords = compareNode.keywords;
                    if (keywords) {
                        filterNodes = keywords.map(function(keyword) {
                            var record = isc.addProperties({}, compareNode);
                            record[searchField] = keyword;
                            return record;
                        });
                    }
                }

                var matches = dataSource.applyFilter(filterNodes, criteria, context);

                if (matches != null && matches.length > 0) {
                    haveMatchingNodes = true;

                    var value = compareNode[searchField];
                    if (value != null) {
                        // Find the search value for the searchField
                        var searchValue = null;
                        if (dataSource ? dataSource.isAdvancedCriteria(criteria) : this.isAdvancedCriteria(criteria)) {
                            var flatCriteria = isc.DS.flattenCriteria(criteria),
                                criterions = flatCriteria.criteria
                            ;
                            for (var j = 0; j < criterions.length; j++) {
                                var criterion = criterions[j];
                                if (criterion.fieldName == searchField) {
                                    searchValue = criterion.value;
                                    break;
                                }
                            }
                        } else {
                            searchValue = criteria[searchField];
                        }

                        // Update the searchField with the searchValue highlighted
                        var newValue, searchRe;
                        if (value.match(/<.*>/)) {
                            // if it looks like html, make sure not to replace in tags
                            searchRe = new RegExp("(^|>)([^<]*?)("+searchValue+")", "ig");
                            newValue = value.replace(searchRe, "$1$2<span class='treeCellOver' style='padding: 0px;'>$3</span>");
                        } else {
                            searchRe = new RegExp("("+searchValue+")", "ig");
                            newValue = value.replace(searchRe, "<span class='treeCellOver' style='padding: 0px;'>$1</span>");
                        }
                        compareNode[searchField] = newValue;

                        if (compareNode.isFolder) {
                            // See if there are any immediate matches below this matched folder.
                            // If not, don't expand it by default.
                            if (keepParents) {
                                if (nodeChildren != null && !nodeChildren.isEmpty()) {
                                    // Don't remember non-matches because the parent has a match
                                    context.dontRemoveNonmatches = true;
                                    hasImmediateMatches = this._filterChildren(criteria, filterMode, dataSource, 
                                                            childNodeLocator || node, context);
                                    delete context.dontRemoveNonmatches;
                                }
                                if (!hasImmediateMatches) {
                                    compareNode._expandNode = false;
                                }
                            }
                        }
                    }

                } else {

                    if (keepParents) {
                        if (nodeChildren != null && !nodeChildren.isEmpty()) {
                            hasImmediateMatches = this._filterChildren(criteria, filterMode, dataSource, 
                                                    childNodeLocator || node, context);
                        }
                        haveMatchingNodes = haveMatchingNodes || hasImmediateMatches;
                    }

                    if ((!hasImmediateMatches || strict) && (!context || !context.dontRemoveNonmatches)) {
                        
                        this._remove(childNodeLocator || node, false, parent);
                    }
                }
            }
        }
        return haveMatchingNodes;
    }
});

// Picker used by WorkflowEditor and FilterBuilder
isc.defineClass("DynamicValuePicker", "Window");

isc.DynamicValuePicker.addProperties({
    autoSize:true, width:600,
    autoCenter:true, isModal:true, 
    bodyProperties : { layoutMargin:5, membersMargin:5 },

    //> @attr dynamicValuePicker.targetRuleScope (Canvas : null : IR)
    // The ruleScope component targeted by this picker.
    // @visibility internal
    //<

    //> @attr dynamicValuePicker.targetComponent (Canvas : null : IR)
    // The component targeted by this picker.
    // @visibility internal
    //<

    //> @attr dynamicValuePicker.excludedRuleScope (Array of String : null : IR)
    // A list of paths that should be excluded from +link{targetRuleScope} dynamic value
    // selection. A common use is to exclude the current field which would be invalid.
    // @visibility internal
    //<

    //> @attr dynamicValuePicker.ruleScopeDataSources (Array of DataSource : null : IR)
    // List of DataSources representing the data found in the current +link{targetRuleScope}.
    // @visibility internal
    //<

    //> @attr dynamicValuePicker.selectedValue (String : null : IR)
    // The initially selected value. The value selected by the user when
    // complete is returned by +link{okButtonClick}.
    // @visibility internal
    //<

    // i18n messages
    //---------------------------------------------------------------------------------------

    //> @attr dynamicValuePicker.clearValueText (String : "&lt;Use static value instead&gt;" : IR)
    // The message to display in picker for entry reverting selection to manual entry.
    // Only shown if a manually entered static value is present.
    // @group i18nMessages
    // @visibility internal
    //<
    clearValueText: "&lt;Use static value instead&gt;"
});

isc.DynamicValuePicker.addMethods({
 
    ruleScopeGridConstructor: isc.TreeGrid,
    ruleScopeGridDefaults: {
        height: 400,
        width: "100%",
        autoFetchData: true,
        dataFetchMode: "local",
        selectionType: "single",

        showFolderIcons: false,
        showNodeIcons: false,
    
        showFilterEditor: true,
        filterOnKeypress: true,
    
        initWidget : function () {
            var filterEditorProperties = {
                icons: [
                    {
                        src: "[SKINIMG]TreeGrid/opener_closed.png",
                        prompt: "Expand all",
                        inline:true,
                        inlineIconAlign: "right",
                        click : function (form) {
                            form.grid.sourceWidget.data.openAll();
                        }
                    },
                    {
                        src: "[SKINIMG]TreeGrid/opener_opened.png",
                        prompt: "Collapse all",
                        inline:true,
                        inlineIconAlign: "right",
                        click : function (form, item) {
                            form.grid.sourceWidget.data.closeAll();
                        }
                    }
                ]
            };
            this.fields = [
                { name: "name", type: "text", title: "Path", hidden: (this.pathField != "name"),
                    canFilter: true, filterEditorProperties: filterEditorProperties },
                { name: "title", type: "text", title: "Path", hidden: (this.pathField != "title"),
                    canFilter: true, filterEditorProperties: filterEditorProperties },
                { name: "value", type: "text", title: "Current value", hidden: true }
            ];

            this.Super("initWidget", arguments);
        },
        formatCellValue : function (value, record, rowNum, colNum) {
            if (value == null && colNum == 0) return this.clearValueText;
            return (record.enabled == false || this.creator.multiDSFieldFormat == "qualified" ?
                        value : "&nbsp;&nbsp;" + value);
        },
        getCellStyle : function (record, rowNum, colNum) {
            if (record.parentId == null && !record.clearValue) {
                return "ruleScopeSelectionTitleCell";
            }
            return this.Super("getCellStyle", arguments);
        },
        recordDoubleClick : function () {
            // Record is already selected. Just click OK to continue.
            this.creator.handleOkButtonClick();

        },
        dataArrived : function () {
            if (!this._expandedNodes) {
                this._expandedNodes = true;
                // Expand nodes that should be initially expanded (expandInitially=true)
                var tree = this.data,
                    nodes = tree.getFolders(tree.getRoot())
                ;
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (node.expandInitially) {
                        tree.openFolder(node);
                    }
                }
            }
        }
    },

    initWidget : function () {
        this.Super("initWidget", arguments);

        this.multiDSFieldFormat = "separated";

        var ds = isc.Canvas.getRuleScopeSelectionDataSource(
                this.targetRuleScope,
                this.ruleScopeDataSources,
                this.targetComponent,
                {
                    fieldFormat: this.multiDSFieldFormat,
                    excludedRuleScope: this.excludedRuleScope,
                    sourceDetailStyleName: "ruleScopeSelectionTitleCellSource"
                }
            )
        ;

        // Add clearValue record which will be filtered out if not applicable
        ds.testData.addAt({ name: null, isFolder: false, clearValue: true }, 0);

        var _this = this,
            ruleScopeGrid = this.createAutoChild("ruleScopeGrid", {
                dataSource: ds,
                pathField: "title",
                clearValueText: this.clearValueText,
                initialCriteria: this.getCriteria()
            }),
            okButton = isc.IButton.create({
                title: "OK", //this.okButtonText,
                click : function () {
                    _this.handleOkButtonClick();
                }
            }),
            cancelButton = isc.IButton.create({
                title: "Cancel", //this.cancelButtonText,
                click : function () {
                    _this.handleCloseClick();
                }
            })
        ;

        this.addItems([ ruleScopeGrid, isc.HLayout.create({ height: 1, layoutAlign: "right", membersMargin: 5, members: [ cancelButton, okButton ] }) ]);

        this.observe(ruleScopeGrid, "dataArrived", "observer._selectDynamicValuePath()");

        this.ruleScopeGrid = ruleScopeGrid;
        this.ruleScopeDS = ds;
    },

    setSelectedValue : function (value) {
        this.selectedValue = value;

        // refresh criteria which may or may not include clear value
        this.ruleScopeGrid.setCriteria(this.getCriteria());
    },

    getCriteria : function () {
        var criteria = null;
        if (this.selectedValue == null) {
            // Filter out the clearValue record
            criteria = {
                _constructor: "AdvancedCriteria", operator: "and",
                criteria: [
                    { fieldName: "clearValue", operator: "notEqual", value: true }
                ]
            };
        }
        return criteria;
    },

    handleOkButtonClick : function () {
        var record = this.ruleScopeGrid.getSelectedRecord();
        if (record && this.okButtonClick) {
            this.close();
            this.okButtonClick(record.criteriaPath || record.name);
        } else {
            this.closeClick();
        }
        delete this._selectedValue;
    },

    handleCloseClick : function () {
        this.Super("handleCloseClick", arguments);
        delete this._selectedValue;
    },

    //> @method dynamicValuePicker.okButtonClick()
    // Handles a click on the OK button of this picker.
    // @param value (String) the selected record path or fieldName
    // @visibility internal
    //<

    destroy : function () {
        if (this.ruleScopeDS) {
            this.ruleScopeDS.destroy();
        }
        this.Super("destroy", arguments);
    },

    _selectDynamicValuePath : function () {
        if (!this.selectedValue || this._selectedValue) return;

        var grid = this.ruleScopeGrid,
            data = this.ruleScopeGrid.data,
            path = this.selectedValue
        ;
        if (data) {
            var record = grid.data.find("name", path);
            if (!record) record = grid.data.find("criteriaPath", path);
            if (record) {
                // Select the record and mark so we don't do it again
                grid.selectSingleRecord(record);
                this._selectedValue = true;

                // And make sure the selected value is visible
                var rowNum = grid.getRecordIndex(record),
                    visibleRows = grid.getVisibleRows()
                ;
                if (rowNum < visibleRows[0] || visibleRows[1] < rowNum) {
                    grid.delayCall("scrollToRow", [rowNum]);
                }
            }
            this.selectedValuePath = null;
        }
    }
});

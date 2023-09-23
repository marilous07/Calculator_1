
var ds = isc.DataSource.get("countryDS");
isc.Authentication.setCurrentUser({userId:"showcaseSavedSampleViews"});

var builtinViewsMenu = isc.ListGrid.create({
    ID: "builtinViewsMenu",
    width: "100%", height: 200,
    autoFitData: "horizontal",
    autoFitFieldWidths: true,
    leaveScrollBarGap: true,
    canGroupBy: true,
    autoDraw: false,
    canFreezeFields: true,
    canAddFormulaFields: true,
    canAddSummaryFields: true,
    dataSource: ds,
    autoFetchData: true,
    showFilterEditor: true,
    allowFilterOperators: true,
    fields: [
        {name: "countryCode", title: "Flag", type: "image", width: 70, imageURLPrefix: "flags/16/", imageURLSuffix: ".png", canSort: false},
        {name: "countryName", title: "Country", width:100},
        {name: "capital", title: "Capital", width:100},
        {name: "population", title: "Population", width:150}, 
        {name: "area", title: "Area (km&sup2;)", width:200 } 
    ]
});

isc.ToolStripButton.create({
    ID: "formulaBuilder",    
    autoDraw: false,showDownIcon:false,
    icon: "icons/16/sc_insertformula.png",  
    title: "Formula Builder",
    autoFit: true,
    click : function () {
        builtinViewsMenu.addFormulaField();
    }   
});

isc.ToolStripButton.create({
    ID: "summaryBuilder",    
    autoDraw: false,showDownIcon:false,
    icon: "icons/16/application_side_tree.png",  
    title: "Summary Builder",
    autoFit: true,
    click : function () {
        builtinViewsMenu.addSummaryField();
    }
});

isc.ToolStrip.create({
    ID: "topStrip",
    width: "100%",
    addFill: true,
    align: "right",
    autoDraw: false,
    members: [formulaBuilder, summaryBuilder]
});

isc.VLayout.create({
    ID:"topContainer",
    autoDraw: false,
    width:750,height:240,
    layoutMargin: 15,
    members: [ topStrip, builtinViewsMenu ],
    groupTitle:"Saved Search - Grid Menus"
});

var toolbarViewsMenu = isc.ListGrid.create({
    ID: "toolbarViewsMenu",
    width: "100%", height: 200,
    autoFitData: "horizontal",
    autoFitFieldWidths: true,
    leaveScrollBarGap: true,
    canGroupBy: true,
    autoDraw: false,
    canFreezeFields: true,
    canAddFormulaFields: true,
    canAddSummaryFields: true,
    dataSource: ds,
    autoFetchData: true,
    showFilterEditor: true,
    allowFilterOperators: true,
    canSaveSearches: false,
    fields: [
        {name: "countryCode", title: "Flag", type: "image", width: 70, imageURLPrefix: "flags/16/", imageURLSuffix: ".png", canSort: false},
        {name: "countryName", title: "Country", width:100},
        {name: "capital", title: "Capital", width:100},
        {name: "population", title: "Population", width:150}, 
        {name: "area", title: "Area (km&sup2;)", width:200 } 
    ]
});

isc.DynamicForm.create({
    ID: "gridView",
    width: 300,
    numCols: 2,
    autoDraw: false,
    fields: [
        {name: "savedSeachItem", title: "Grid View", showTitle: true, type: "SavedSearchItem",  ID: "gridViewItem", 
        targetComponent: "toolbarViewsMenu", width: 220, canAddSearch: true
        }
    ]
});

isc.ToolStripButton.create({
    ID: "bottomFormulaBuilder",    
    autoDraw: false,showDownIcon:false,
    icon: "icons/16/sc_insertformula.png",  
    title: "Formula Builder",
    autoFit: true,
    click : function () {
        toolbarViewsMenu.addFormulaField();
    }   
});

isc.ToolStripButton.create({
    ID: "bottomSummaryBuilder",    
    autoDraw: false,showDownIcon:false,
    icon: "icons/16/application_side_tree.png",  
    title: "Summary Builder",
    autoFit: true,
    click : function () {
        toolbarViewsMenu.addSummaryField();
    }
});

isc.ToolStrip.create({
    ID: "bottomStrip",
    width: "100%",
    addFill: true,
    align: "right",
    autoDraw: false,
    members: [gridView, isc.ToolStripSeparator.create({}), bottomFormulaBuilder, bottomSummaryBuilder]
});

isc.VLayout.create({
    ID:"bottomContainer",
    autoDraw: false,
    width:750, height:240,
    layoutMargin: 15,
    members: [ bottomStrip, toolbarViewsMenu ],
    groupTitle:"Saved Search - External Toolbar"
});

isc.VLayout.create({
    ID: "testLayout",
    height: "100%", width:500,
    membersMargin:10,
    minBreadthMember: topContainer,
    members: [topContainer, bottomContainer]
});

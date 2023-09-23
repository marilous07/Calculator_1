var reifyCredentials = {
    userName:"reifySample",
    password:"tryReify",
    serverURL:"https://create.reify.com"
}

/* Shape Gallery sample */
function getShapeGalleryCode() {
    var mainPane = isc.DrawPane.create({
        autoDraw: false,
        showEdges: true,
        width: 720,
        height: 475
    });    
    var commonProps = {
        autoDraw: true,
        drawPane: mainPane,
        canDrag: true,
        titleRotationMode: "neverRotate"
    };    
    isc.DrawTriangle.create({
        points: [[100,50], [150,150], [50,150]],
        title: "Triangle"
    }, commonProps);
    isc.DrawCurve.create({
        startPoint: [200, 50],
        endPoint: [300, 150],
        controlPoint1: [250, 0],
        controlPoint2: [250, 200],
        lineCap: "round",
        title: "Curve"
    }, commonProps);
    isc.DrawLinePath.create({
        startPoint: [350, 50],
        endPoint: [450, 150],
        title: "LinePath"
    }, commonProps);
    isc.DrawPath.create({
        points: [[500, 50], [525,50], [550,75], [575,75],
                 [600,75], [600,125], [575,125], [550,125],
                 [525,150], [500,150]],
        title: "Path"
    }, commonProps);
    isc.DrawOval.create({
        left: 50,
        top: 300,
        width: 100,
        height: 100,
        title: "Oval"
    }, commonProps);
    isc.DrawRect.create({
        left: 200,
        top: 300,
        width: 150,
        height: 100,
        title: "Rectangle"
    }, commonProps);
    isc.DrawLine.create({
        startPoint: [400, 300],
        endPoint: [500,400],
        title: "Line"
    }, commonProps);
    isc.DrawSector.create({
        centerPoint: [550, 300],
        startAngle: 0,
        endAngle: 90,
        radius: 100,
        title: "Sector"
    }, commonProps);
    var hStack = isc.HStack.create({
        width: "100%",
        members: [mainPane]
    });
    return hStack;
}

/* Screen Reuse sample */
function getScreenReuseCode() {
    var vLayout = isc.VLayout.create({
        width:"100%",
        membersMargin:5,
        defaultLayoutAlign:"right",
        members:[
            isc.ListGrid.create({
                ID:"supplyGrid",
                autoFetchData:true,
                showFilterEditor:true,
                dataSource:"supplyItem",
                selectionType:"single",
                dataArrived:function (startRow, endRow) {
                    this.selectRecord(0);
                }
            }),
            isc.IButton.create({
                title:"Edit",
                width:100,
                click:function () {
                    isc.Reify.loadProject("Simple Form", function (project, projects, rpcResponse) {
                        var screen = project.createScreen(project.screens[0].ID),
                            saveForm = screen.getByLocalId("simpleForm"),
                            record = supplyGrid.getSelectedRecord();
                        
                        saveForm.editRecord(record);
                        var tab = {
                            name: record.itemID,
                            title: record.itemName,
                            canClose: true
                        };
                        tabSet.addTab(tab);
                        tab.pane = screen;
                        tabSet.selectTab(tab);
                    }, reifyCredentials );
                }
            })
        ]
    });
    var tabSet = isc.TabSet.create({
        width:900,
        height:450,
        tabs:[
            {
                ID:"supplyTab",
                canClose:false,
                title:"Supply Items",
                pane:vLayout
            }
        ]
    });
    return tabSet;
}

/* Placeholder sample */
var listGrid, chartPlaceholderLayout;
function updateChart (chartType, stacked) {
    if (chartType) listGrid.chartType = chartType;
    else if (listGrid.lastChart) listGrid.chartType = listGrid.lastChart.chartType;

    listGrid.lastChart = listGrid.chartData(
        "Product", 
        ["Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        listGrid.getSelectedRecords(), 
        { stacked:!!stacked }
    );
    chartPlaceholderLayout.replaceMember(chartPlaceholderLayout.getMember(1), listGrid.lastChart);
}

function getPlaceholderCode() {
    var container = isc.VLayout.create({
        membersMargin:10,
        width:"100%",
        height:"100%"
    });    
    isc.Reify.loadProject("Chart Placeholder", function (project, projects, rpcResponse) {
            var screen = project.createScreen(project.screens[0].ID),
                chartTypeMenu = screen.getByLocalId("chartTypeMenu"),
                stackedSelectionForm = screen.getByLocalId("StackedSelectionForm"),
                placeholderImg = screen.getByLocalId("placeholder");
    
            chartPlaceholderLayout = screen.getByLocalId("chartPlaceholderLayout");
            listGrid = screen.getByLocalId("sampleChartDataGrid");
            
            var facetChartForm = isc.DynamicForm.create({
                items: [
                    { name:"placeholderCB", type:"CheckboxItem", title:"Replace placeholder",
                        changed: function(form, item, value) {
                            if (value) {
                                updateChart("Area", stackedSelectionForm.getValue("Stacked"));
                            } else {
                                chartPlaceholderLayout.replaceMember(chartPlaceholderLayout.getMember(1), placeholderImg);
                            }
                        }
                    }
                ]
            });
    
            isc.observe(listGrid, "dataArrived", function (startRow, endRow) {
                listGrid.selectRecords([0,1,2]);
                isc.observe(listGrid, "selectionUpdated", function (record, recordList) {
                    if (facetChartForm.getValue("placeholderCB")) updateChart("Area", stackedSelectionForm.getValue("Stacked"));
                });
            });
    
            isc.observe(stackedSelectionForm.getField("Stacked"), "changed", function (form, item, value) {
                if (facetChartForm.getValue("placeholderCB")) updateChart(null,  value);
            });
                
            isc.observe(chartTypeMenu, "itemClick", function (item, colNum) {
                if (facetChartForm.getValue("placeholderCB")) updateChart(item.title, stackedSelectionForm.getValue("Stacked"));
            });
    
            container.addMember(facetChartForm);
            container.addMember(screen);
        }, reifyCredentials
    );
    return container;
}

/* Reify Projects */
function loadReifyProject(projectName) {
    var container = isc.Canvas.create({
        width:"100%", height:"100%"
    });
    isc.Reify.loadProject(projectName, function (project, projects, rpcResponse) {
            var screen = project.createScreen(project.screens[0].ID);
            container.addChild(screen);
        }, reifyCredentials
    );
    return container;
}

isc.NavPanel.create({
    width: "100%",
    height: "100%",
    navItems: [
        { name: "testLoader", title: "Test Loader", pane: loadReifyProject("Test Loader") },
        { name: "simpleForm", title: "Simple Form", pane: loadReifyProject("Simple Form")},
        { name: "simpleGrid", title: "Simple Grid", pane: loadReifyProject("Simple Grid")},
        { name: "supplyCatalog", title: "Supply Catalog", pane: loadReifyProject("Supply Catalog") },
        { name: "shapeGallery", title: "Shape Gallery", pane: getShapeGalleryCode() },
        { name: "screenReuse", title: "Screen Reuse", pane: getScreenReuseCode() },
        { name: "placeholders", title: "Placeholders", pane: getPlaceholderCode() }
    ]
})
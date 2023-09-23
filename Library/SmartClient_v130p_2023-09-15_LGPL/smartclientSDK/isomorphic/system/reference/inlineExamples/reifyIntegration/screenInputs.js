var project;

isc.VLayout.create({
    ID:"vLayout",
    width: "100%",
    members:[
        isc.ListGrid.create({
            ID:"orderGrid",
            disabled: true,
            autoFetchData:true,
            dataSource:"CM_Order",
            fields:[
                {   name:"customerNumber",  width:"*" },
                {   name:"orderNumber",  width:150 },
                {   name:"orderDate",  width:150 },
                {   name:"status", width:100 }
            ],
            selectionType:"single",
            recordClick:function(viewer, record, rowNum, field, fieldNum, value, rawValue) {
                var screenInput = project.createScreen(project.screens[0].ID, {
                    dataContext : { CM_Order : record },
                    suppressAutoDraw: true
                });
                var tab = {
                    name: record.orderNumber,
                    title:"Order: "+record.orderNumber+" by "+record.customerName,
                    canClose: true,
                    pane: screenInput
                };
                tabSet.addTab(tab);
                tabSet.selectTab(tab);
            }
        })
    ]
});

isc.TabSet.create({
    ID:"tabSet", 
    width: 900,
    height: 450,
    tabs:[
        {
            ID:"ordersTab",
            canClose:false,
            title:"Orders",
            pane:vLayout
        }
    ]
});

var projectSI = isc.Project.get("Screen Inputs");
if (!projectSI) {
    isc.Reify.loadProject("Screen Inputs", function (loadedProject, projects, rpcResponse) {
        project = loadedProject;
        orderGrid.enable();
        },  
        {
            userName:"reifySample",
            password:"tryReify",
            serverURL:"https://create.reify.com"
        }
    );
} else {
    project = projectSI;
    orderGrid.enable();
}

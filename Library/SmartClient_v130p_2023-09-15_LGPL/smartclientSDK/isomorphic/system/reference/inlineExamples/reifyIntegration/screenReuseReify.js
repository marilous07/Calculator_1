var project;

isc.VLayout.create({
    ID:"vLayout",
    width:"100%",
    membersMargin:5,
    defaultLayoutAlign:"right",
    members:[
        isc.ListGrid.create({
            ID:"supplyGrid",
            disabled: true,
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
                var screen = project.createScreen(project.screens[0].ID, { suppressAutoDraw: true }),
                        saveForm = screen.getByLocalId("simpleForm"),
                        record = supplyGrid.getSelectedRecord();
                    
                saveForm.editRecord(record);
                var tab = {
                    name: record.itemID,
                    title: record.itemName,
                    canClose: true,
                    pane: screen
                };
                tabSet.addTab(tab);
                tabSet.selectTab(tab);
            }
        })
    ]
});

isc.TabSet.create({
    ID:"tabSet", 
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

var projectSF = isc.Project.get("Simple Form");
if (!projectSF) {
    isc.Reify.loadProject("Simple Form", function (loadedProject, projects, rpcResponse) {
        project = loadedProject;
        supplyGrid.enable();
        },  
        {
            userName:"reifySample",
            password:"tryReify",
            serverURL:"https://create.reify.com"
        }
    );
} else {
    project = projectSF;
    supplyGrid.enable();
}

isc.defineClass("MyCustomListGrid", "ListGrid").addProperties({
    autoFetchData:true,
    dataSource:"supplyItem",
    canHover:true,
    showHover:true,
    showHoverComponents:true,

    initWidget : function () {
        this.Super("initWidget", arguments);
        this.setCanRemoveRecords(false);
        this.setFields([
                { name:"itemName", title:"Item", width:250 },
                { name:"description", width:"*" },
                { name:"category", width:250 },
                { name:"unitCost", width:100 },
                { name:"iconField", title:"View", width:100,
                    align:"center", type:"icon", iconSize:24, 
                    icon:"[SKIN]/actions/view.png",
                    canReorder:false
                }
            ]
        );
    },

    getCellHoverComponent : function (record, rowNum, colNum) {
        var fieldName = this.getFieldName(colNum);  
        if (fieldName == "iconField") {
            this.rowHoverComponent = isc.DetailViewer.create({
                dataSource:"supplyItem",
                width:250
            });
            this.rowHoverComponent.fetchData({itemID: record.itemID}, null, { showPrompt: false} );

            return this.rowHoverComponent;
        } else return null;
    }
})

isc.VLayout.create({
    ID:"container",
    membersMargin:10,
    width:"100%",
    height:"100%"
});

isc.Reify.loadProject("Simple Grid", function (project, projects, rpcResponse) {

        var editForm = isc.DynamicForm.create({
            autoDraw:false,
            dataSource:"supplyItem",
            useAllDataSourceFields:true
        });

        // original listGrid
        var initialScreen = project.createScreen("Simple Grid Screen", { suppressAutoDraw:true} ),
            initialListGrid = initialScreen.getByLocalId("simpleGrid");
            
        initialListGrid.setHeight(350);
        isc.observe(initialListGrid, "recordClick", function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
            editForm.editSelectedData(initialListGrid);
        });

        // substitute listGrid
        var newScreen = project.createScreen("Simple Grid Screen", { suppressAutoDraw:true, componentSubstitutions:{simpleGrid:"MyCustomListGrid"} } );

        var mainForm = isc.DynamicForm.create({
            items: [
                { name:"cbIteam", type:"CheckboxItem", title:"Substitute Grid Class",
                    changed: function(form, item, value) {
                        editForm.clearValues();
                        if (!value) {
                            var unmodifiedListGrid = initialScreen.getByLocalId("simpleGrid");
                            unmodifiedListGrid.setHeight(350);
                            isc.observe(unmodifiedListGrid, "recordClick", function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
                                editForm.editSelectedData(unmodifiedListGrid);
                            });                 
                            container.replaceMember(container.getMember(1), unmodifiedListGrid);
                        } else {
                            var customListGrid = newScreen.getByLocalId("simpleGrid");
                            customListGrid.setHeight(350);
                            isc.observe(customListGrid, "recordClick", function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
                                editForm.editSelectedData(customListGrid);
                            });                 
                            container.replaceMember(container.getMember(1), customListGrid);
                        }
                    }
                }
            ]
        });
        var saveButton = isc.Button.create({
            width:100,
            title: "Save",
            click: function () { editForm.saveData(); }
        })

        container.addMember(mainForm);
        container.addMember(initialListGrid);
        container.addMember(editForm);
        container.addMember(saveButton);
    },  
    {
        userName:"reifySample",
        password:"tryReify",
        serverURL:"https://create.reify.com"
    }
);

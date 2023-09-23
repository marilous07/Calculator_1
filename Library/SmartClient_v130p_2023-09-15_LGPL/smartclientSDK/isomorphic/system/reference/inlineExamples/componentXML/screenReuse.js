isc.VLayout.create({
    top:5,
    width:"100%",
    height:"90%",
    membersMargin:10,
    members : [
        isc.DynamicForm.create({
            values:{dataSource:"Select A DataSource"},
            items:[
                {
                    name:"dataSource", showTitle:false, editorType:"SelectItem",
                    valueMap:["countryDS", "supplyItem", "worldDS"]
                },
                {
                    title:"Create Screen", type:"ButtonItem",
                    width:120, 
                    click:function (form, item)  {
                        if (form.getValue("dataSource") != "Select A DataSource"){
                            switchTo(form.getValue("dataSource"))
                        }
                    }
                }
            ]
        }),

        isc.TabSet.create({
            width:"100%",
            height:"*",
            ID:"tabSet"
        })
    ]
});

function switchTo(datasource){

    // create our screen
    var screen = isc.RPCManager.createScreen("screenReuse");
        
    screen.getByLocalId('saveButton').addProperties({
        click: function () {
            this.form.saveData();
        },

        form:screen.getByLocalId('editForm')
    });

    screen.getByLocalId('listGrid').setDataSource(datasource);

    screen.getByLocalId('listGrid').addProperties({
        recordClick:function (viewer, record, rowNum, field, fieldNum, value, rawValue) {
            this.form.clearErrors();
            this.form.editRecord(record);
            this.saveButton.enable();
        },
        form:screen.getByLocalId('editForm'),
        saveButton:screen.getByLocalId('saveButton'),
    });


    screen.getByLocalId('editForm').setDataSource(datasource);

    var tab = {
        title:datasource, pane:screen
    }
    tabSet.addTab(tab);
    tabSet.selectTab(tab);

}

isc.RPCManager.cacheScreens("screenReuse", function(data, rpcResponse){
    switchTo("countryDS");
});

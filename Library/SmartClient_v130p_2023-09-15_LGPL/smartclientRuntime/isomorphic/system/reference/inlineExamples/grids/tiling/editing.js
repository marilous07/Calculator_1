isc.VStack.create({
    width:"100%",
    membersMargin:20,
    members:[

        isc.TileGrid.create({
            autoDraw:false,
            ID:"boundList",
            selectionType:"single",
            tileWidth:150,
            tileHeight:225,
            height:400,
            showAllRecords:true,
            dataSource:"animals",
            recordClick:"boundForm.editRecord(record); return true;",
            detailViewerProperties: {
                rowHeight: 22
            },
            fields: [
                {name:"picture", cellStyle: "animalImage"},
                {name:"commonName", cellStyle: "commonName"},
                {name:"lifeSpan", cellStyle: "animalText",
                 formatCellValue: "return 'Lifespan: ' + value;"},
                {   name:"status", 
                    getCellStyle: function (value, field, record, viewer) {
                        if      (value == "Endangered")     return "endangered";
                        else if (value == "Threatened")     return "threatened";
                        else if (value == "Not Endangered") return "notEndangered";
                        else                                return "animalText";
                    }
                }
                
            ]
                      
        }),

        isc.DynamicForm.create({
            autoDraw:false,
            ID:"boundForm",
            numCols:"6",
            dataSource:"animals",
            autoFocus:false,
            fields: [  
                {name:"commonName"},
                {name:"lifeSpan"},
                {name:"status"}
            ]
        }),

        isc.HLayout.create({
            autoDraw:false,
            membersMargin:10,
            height: 22,                               
            members:[
                isc.IButton.create({title:"Save", click:"boundForm.saveData();boundForm.clearValues();", autoFit:true})
                
            ]
        })
        
       
    ]
});

boundList.fetchData({}, "boundList.data.setSort([{property: 'lifeSpan', direction: 'ascending'}])");

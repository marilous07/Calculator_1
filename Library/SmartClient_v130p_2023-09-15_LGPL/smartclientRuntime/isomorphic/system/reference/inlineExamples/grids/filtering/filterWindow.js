isc.VLayout.create({
    membersMargin: 5,
    members: [
        isc.ListGrid.create({
            ID: "countryList",
            width:550, height:300, alternateRecordStyles:true,
            dataSource: worldDS,
            fields:[
                {name:"countryCode", width:60},
                {name:"countryName"},
                {name:"capital"},
                {name:"continent"},
                {name:"area"},
                {name:"population"}
            ],
            autoFetchData: true,
            showFilterEditor: true,
            allowFilterOperators: true,
            initialCriteria: { _constructor: "AdvancedCriteria", operator: "and",
                criteria: [
                    { fieldName: "countryName", operator: "iNotContains", value: "i" },
                    { fieldName: "capital", operator: "iNotStartsWith", value: "p" }
                ]
            }
        }),
        isc.IButton.create({
            title: "Show Filter Window",
            width: 150,
            click: function() {
                countryList.showFilterWindow();
            }
        }) 
    ]
})


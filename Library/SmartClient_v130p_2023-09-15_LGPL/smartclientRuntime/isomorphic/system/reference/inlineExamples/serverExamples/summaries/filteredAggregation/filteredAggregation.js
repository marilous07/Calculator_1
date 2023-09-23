isc.FilterBuilder.create({
    ID:"advancedFilter",
    dataSource:"filteredAggregation_orderItem",
    criteria: {
        _constructor: "AdvancedCriteria",
        operator: "and",
        criteria: [
            {fieldName: "unitCost", operator: "greaterThan", value: 25},
            {fieldName: "quantity", operator: "greaterThan", value: 10},
            {fieldName: "totalSales", operator: "greaterThan", value: 30}
        ]
    }
});


isc.ListGrid.create({
    ID: "orderItemSummaryList",
    width:800,
    height:400,
    alternateRecordStyles:true,
    autoFetchData: false,
    dataSource: filteredAggregation_orderItem,
    dataFetchMode: "basic",
    showAllRecords: true,
	fetchOperation: "summary",
    fields:[
        {name: "itemName", width: 400},
        {name: "SKU"},
        {name: "unitCost"},
        {name: "quantity", title: "Total qty"},
        {name: "totalSales", width: 100}
    ]
});

isc.IButton.create({
    ID:"filterButton",
    title:"Filter",
    click : function () {
        orderItemSummaryList.fetchData(advancedFilter.getCriteria());
    }
});

isc.VLayout.create({
    membersMargin: 20,
    members: [advancedFilter, filterButton, orderItemSummaryList]
});

filterButton.click();

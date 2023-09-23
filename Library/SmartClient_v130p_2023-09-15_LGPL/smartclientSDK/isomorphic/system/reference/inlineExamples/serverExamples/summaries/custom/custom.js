isc.ListGrid.create({
    ID:"orderItemList",
    dataSource:"aggregationCustom_orderItem",
    width:700,
    height:300,
    showFilterEditor:true,
    alternateRecordStyles:true,
    autoFetchData:false,
    canEdit:false,
    canRemoveRecords:false,
    sortField: 0,
    wrapCells: true,
    cellHeight: 40,
    headerSpans: [
        {
            fields: ["pk", "itemDescription"],
            title: "Aggregated items data"
        }
    ],
    headerHeight: 65,
    wrapHeaderTitles: true,
    fields: [
        { name: "orderCustomerName", width: 180, title: "Customer Name" },
        { name: "pk", width: 100, title: "Count", align: "center" },
        { name: "itemDescription", width: 420, title: "Items Description" }
    ]
});

orderItemList.fetchData({}, null, {
    operationId: "customAggregation",
    groupBy: "orderCustomerName",
    summaryFunctions: {
        pk: "count",
        itemDescription: "concatDistinct"
    }
});

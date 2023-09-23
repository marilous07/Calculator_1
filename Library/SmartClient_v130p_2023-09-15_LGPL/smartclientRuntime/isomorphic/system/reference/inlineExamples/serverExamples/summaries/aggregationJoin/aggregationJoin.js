isc.ListGrid.create({
    ID:"orderList",
    dataSource:"aggregationJoin_order",
    width:720,
    height:300,
    showFilterEditor:true,
    alternateRecordStyles:true,
    autoFetchData:true,
    canEdit:false,
    canRemoveRecords:false,
    wrapHeaderTitles: true,
    wrapCells: true,
    cellHeight: 40,
    headerSpans: [
        {
            fields: ["itemCount", "items"],
            title: "Items"
        }
    ],
    headerHeight: 65,
    fields: [
        { name: "trackingNumber", width: 90, title: "Number"},
        { name: "orderDate", width: 100, title: "Date" },
        { name: "customerName", width: 180, title: "Customer" },
        { name: "itemCount", width: 80, title: "Count" },
        { name: "items", width: "*", title: "Description" }
    ]
});
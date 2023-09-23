
isc.ListGrid.create({
    ID:"moneyTransferList",
    dataSource:moneyTransferFK,
    width:700,
    height:224,
    showFilterEditor:true,
    alternateRecordStyles:true,
    autoFetchData:true,
    dataPageSize: 50,
    canEdit:true,
    editEvent:"click",
    canRemoveRecords:true,
    fields: [
        { name: "name", width: 200 },
        { name: "paymentAmount", title: "Amount", width: 100},
        { name: "receiptInfo" },
        { name: "invoiceInfo" }
    ]
});


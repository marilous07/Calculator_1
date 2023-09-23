isc.DynamicForm.create({
    ID: "itemsForm",
    width:300,
    fields: [
        {
            name: "itemDescription",
            title: "Item",
            type:"select",
            autoFetchData: true,
            optionDataSource: "distinctValues_orderItem",
            optionFilterContext: {
                groupBy:"itemDescription"
            },
            defaultToFirstOption: false,
            changed: function (form, item, value) {
                orderItemList.fetchData({itemDescription: value}, null, {
                    groupBy: "orderCustomerName",
                    summaryFunctions: {
                        quantity: "sum",
                        unitPrice: "avg"
                    }
                });
            }
        }
    ]
});

isc.ListGrid.create({
    ID:"orderItemList",
    dataSource:"distinctValues_orderItem",
    width:400,
    height:300,
    showFilterEditor:true,
    alternateRecordStyles:true,
    autoFetchData:false,
    canEdit:false,
    canRemoveRecords:false,
    wrapHeaderTitles:true,
    headerHeight:45,
    sortField: 0,
    sortDirection: "ascending",
    fields: [
        { name: "orderCustomerName", width: "*", title: "Customer Name" },
        { name: "quantity", width: 100, title: "Total Quantity" },
        { name: "unitPrice", width: 100, title: "Avg Price", format: "#,##0.00" }
    ]
});

isc.VStack.create({
    width: "100%",
    membersMargin: 10,
    members: [itemsForm, orderItemList]
});
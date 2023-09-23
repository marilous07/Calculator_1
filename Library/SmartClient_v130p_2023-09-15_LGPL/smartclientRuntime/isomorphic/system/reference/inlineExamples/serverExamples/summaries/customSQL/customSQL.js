isc.DynamicForm.create({
    ID: "operationForm",
    width:550,
    fields: [
        { name: "operationId", title: "Filter", type:"select",
            defaultToFirstOption: true, width: "100%",
            valueMap: {
                "orderAmount" : "Exclude entire orders with total value greater than",
                "itemAmount" : "Exclude individual items within an order with value greater than"
            }
        }
    ]
});

isc.FilterBuilder.create({
    ID:"advancedFilter",
    dataSource:"aggregationCustomSQL_orderItem",
    criteria: { _constructor: "AdvancedCriteria",
        operator: "and", criteria: [
            {fieldName: "amount", operator: "greaterThan", value:30 },
            {fieldName: "quantity", operator: "greaterThan", value:3 }
        ]
    }
});

isc.IButton.create({
    ID:"filterButton",
    title:"Filter",
    click : function () {
        orderList.setData([]);
        orderList.fetchData(advancedFilter.getCriteria(), null, {operationId: operationForm.getValue("operationId")});
    }
});

isc.ListGrid.create({
    ID:"orderList",
    dataSource:"aggregationCustomSQL_orderItem",
    width:550,
    height:300,
    showFilterEditor:false,
    alternateRecordStyles:true,
    autoFetchData:false,
    canEdit:false,
    canRemoveRecords:false,
    fields: [
        { name: "orderCustomerName", title: "Customer name" },
        { name: "itemDescription" },
        { name: "amount" },
        { name: "quantity" }
    ]
});

isc.VStack.create({
    width: "100%",
    membersMargin: 10,
    members: [operationForm, advancedFilter, filterButton, orderList]
});

filterButton.click();
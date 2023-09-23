isc.DynamicForm.create({
    ID: "operationForm",
    width:300,
    fields: [
        { name: "operationId", title: "Aggregation", type:"select",
            defaultToFirstOption: true,
            valueMap: {
                "amountByItem" : "Amount by item",
                "amountByCustomer" : "Amount by customer",
                "minPriceByItem": "Minimum price by item",
                "maxPriceByItem": "Maximum price by item"
            },
            changed: function (form, item, value) {
                orderItemList.setData([]);
                if ("amountByItem" == value) {
                    orderItemList.fetchData({}, null, {
                        groupBy: "itemDescription",
                        summaryFunctions: {
                            pk: "count",
                            amount: "sum"
                        }
                    });
                } else if ("amountByCustomer" == value) {
                    orderItemList.fetchData({}, null, {
                        groupBy: "orderCustomerName",
                        summaryFunctions: {
                            pk: "count",
                            amount: "sum"
                        }
                    });
                } else if ("minPriceByItem" == value) {
                    orderItemList.fetchData({}, null, {
                        groupBy: "itemDescription",
                        summaryFunctions: {
                            pk: "count",
                            unitPrice: "min"
                        }
                    });
                } else {
                    orderItemList.fetchData({}, null, {
                        groupBy: "itemDescription",
                        summaryFunctions: {
                            pk: "count",
                            unitPrice: "max"
                        }
                    });
                }

                if (value.endsWith("ByItem")) {
                    orderItemList.hideField("orderCustomerName");
                    orderItemList.showField("itemDescription");
                } else {
                    orderItemList.showField("orderCustomerName");
                    orderItemList.hideField("itemDescription");
                }
                if (value.startsWith("amount")) {
                    orderItemList.hideField("unitPrice");
                    orderItemList.showField("amount");
                } else {
                    orderItemList.showField("unitPrice");
                    orderItemList.hideField("amount");
                }
            }
        }
    ]
});

isc.ListGrid.create({
    ID:"orderItemList",
    dataSource:"dynamicAggregation_orderItem",
    width:500,
    height:300,
    showFilterEditor:true,
    alternateRecordStyles:true,
    autoFetchData:false,
    canEdit:false,
    canRemoveRecords:false,
    fields: [
        { name: "orderCustomerName", hidden: "true", title: "Customer name" },
        { name: "itemDescription" },
        { name: "unitPrice", hidden: "true" },
        { name: "amount" },
        { name: "pk", title: "Count" }
    ]
});

orderItemList.fetchData({}, null, {
    groupBy: "itemDescription",
    summaryFunctions: {
        pk: "count",
        amount: "sum"
    }
});

isc.VStack.create({
    width: "100%",
    membersMargin: 10,
    members: [operationForm, orderItemList]
});
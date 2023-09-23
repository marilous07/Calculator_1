isc.DynamicForm.create({
    ID: "orderItemCriteriaForm",
    numCols: 2, width: 300,
    autoDraw: false,
    fields: [
        {name: "itemDescription", type: "text", title: "Item", defaultValue: "widget" },
        {name: "quantity", type: "integer", title: "Quantity", defaultValue: 4},
        {name: "amount", type: "float", title: "Amount", defaultValue: 10},
        {
            name: "filterButton",
            title: "Filter",
            type: "button",
            endRow: false, startRow: false,
            click: function() {
                var criteria = {
                    _constructor: "AdvancedCriteria",
                    operator: "and",
                    criteria: [
                        {fieldName: "itemDescription", operator: "contains", value: orderItemCriteriaForm.getValue("itemDescription")},
                        {fieldName: "quantity", operator: "greaterThan", value: orderItemCriteriaForm.getValue("quantity")},
                        {fieldName: "amount", operator: "greaterThan", value: orderItemCriteriaForm.getValue("amount")}
                    ]
                };
                orderList.setData([]);
                orderList.filterData(criteria);
            }
        }
    ]
});

isc.ListGrid.create({
    ID:"orderList",
    dataSource:"aggregationCustomSQL2_orderItem",
    width:300,
    height:200,
    showFilterEditor:false,
    alternateRecordStyles:true,
    autoFetchData:false,
    canEdit:false,
    canRemoveRecords:false,
    sortField: 0,
    fields: [
        { name: "orderCustomerName", width: 200, title: "Customer" },
        { name: "amount", title: "Amount" }
    ]
});

isc.VLayout.create({
    membersMargin: 20,
    members: [orderItemCriteriaForm, orderList]
});

orderItemCriteriaForm.getItem("filterButton").click();
isc.DataSource.create({
        ID: "clientOnly_order",
        fields:[
                {name:"orderID", hidden:true, primaryKey:true, foreignKey: "clientOnly_orderItem.orderID"},
                {name:"customerName", type:"text", title:"Customer Name"},
                {name:"orderDate", type:"date", title:"Order Date"},
                {name:"trackingNumber", type:"integer", title:"Tracking Number"},
                {name:"itemCount", type:"integer",
                        includeFrom:"clientOnly_orderItem.pk", includeSummaryFunction:"count" },
                {name:"items", type:"text", joinString:", ",
                        includeFrom:"clientOnly_orderItem.itemDescription", includeSummaryFunction:"concat"}
        ],
        clientOnly: true,
        testData: [
                {
                        "orderID": 1,
                        "orderDate": new Date(2009,2,9),
                        "trackingNumber": 9912315,
                        "customerName": "Isomorphic Software"
                },
                {
                        "orderID": 2,
                        "orderDate": new Date(2009,2,17),
                        "trackingNumber": 4110884,
                        "customerName": "Acme Widgets"
                },
                {
                        "orderID": 3,
                        "orderDate": new Date(2009,2,7),
                        "trackingNumber": 3113234,
                        "customerName": "Smith, Jones and Partners"
                },
                {
                        "orderID": 4,
                        "orderDate": new Date(2009,2,1),
                        "trackingNumber": 5112901,
                        "customerName": "ABC Mining"
                },
                {
                        "orderID": 5,
                        "orderDate": new Date(2009,2,3),
                        "trackingNumber": 8121042,
                        "customerName": "Isomorphic Software"
                },
                {
                        "orderID": 6,
                        "orderDate": new Date(2009,2,23),
                        "trackingNumber": 2231092,
                        "customerName": "Acme Widgets"
                },
                {
                        "orderID": 7,
                        "orderDate": new Date(2009,2,18),
                        "trackingNumber": 7112080,
                        "customerName": "ABC Mining"
                },
                {
                        "orderID": 8,
                        "orderDate": new Date(2009,2,14),
                        "trackingNumber": 4033512,
                        "customerName": "Isomorphic Software"
                },
                {
                        "orderID": 9,
                        "orderDate": new Date(2009,2,10),
                        "trackingNumber": 9631143,
                        "customerName": "ABC Mining"
                },
                {
                        "orderID": 10,
                        "orderDate": new Date(2009,2,22),
                        "trackingNumber": 1022231,
                        "customerName": "Isomorphic Software"
                },
                {
                        "orderID": 11,
                        "orderDate": new Date(2009,2,9),
                        "trackingNumber": 9912315,
                        "customerName": "Isomorphic Software"
                },
                {
                        "orderID": 12,
                        "orderDate": new Date(2009,2,17),
                        "trackingNumber": 4110884,
                        "customerName": "Acme Widgets"
                },
                {
                        "orderID": 13,
                        "orderDate": new Date(2009,2,7),
                        "trackingNumber": 3113234,
                        "customerName": "Smith, Jones and Partners"
                },
                {
                        "orderID": 14,
                        "orderDate": new Date(2009,2,1),
                        "trackingNumber": 5112901,
                        "customerName": "ABC Mining"
                },
                {
                        "orderID": 15,
                        "orderDate": new Date(2009,2,3),
                        "trackingNumber": 8121042,
                        "customerName": "Isomorphic Software"
                },
                {
                        "orderID": 16,
                        "orderDate": new Date(2009,2,23),
                        "trackingNumber": 2231092,
                        "customerName": "Acme Widgets"
                },
                {
                        "orderID": 17,
                        "orderDate": new Date(2009,2,18),
                        "trackingNumber": 7112080,
                        "customerName": "ABC Mining"
                },
                {
                        "orderID": 18,
                        "orderDate": new Date(2009,2,14),
                        "trackingNumber": 4033512,
                        "customerName": "Isomorphic Software"
                },
                {
                        "orderID": 19,
                        "orderDate": new Date(2009,2,10),
                        "trackingNumber": 9631143,
                        "customerName": "ABC Mining"
                },
                {
                        "orderID": 20,
                        "orderDate": new Date(2009,2,22),
                        "trackingNumber": 1022231,
                        "customerName": "Isomorphic Software"
                }
        ]
});

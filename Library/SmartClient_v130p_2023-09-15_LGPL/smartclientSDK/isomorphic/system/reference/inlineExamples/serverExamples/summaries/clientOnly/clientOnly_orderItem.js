isc.DataSource.create({
        ID: "clientOnly_orderItem",
        fields:[
                {name:"pk", type:"integer", hidden:true, primaryKey:true},
                {name:"orderID", type:"integer", hidden:true},
                {name:"itemDescription", type:"text", title:"Item"},
                {name:"quantity", type:"integer", title:"Quantity"},
                {name:"unitPrice", type:"float", title:"Unit Price"}
        ],
        clientOnly: true,
        testData: [
                {
                        "unitPrice": 3.95,
                        "quantity": 4,
                        "orderID": 1,
                        "pk": 1,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 3.95,
                        "quantity": 2,
                        "orderID": 2,
                        "pk": 2,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 12.95,
                        "quantity": 3,
                        "orderID": 2,
                        "pk": 3,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 24.95,
                        "quantity": 5,
                        "orderID": 3,
                        "pk": 4,
                        "itemDescription": "Magenta widget"
                },
                {
                        "unitPrice": 12.24,
                        "quantity": 2,
                        "orderID": 3,
                        "pk": 5,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 24.95,
                        "quantity": 5,
                        "orderID": 3,
                        "pk": 6,
                        "itemDescription": "Blue gadget"
                },
                {
                        "unitPrice": 8.22,
                        "quantity": 2,
                        "orderID": 3,
                        "pk": 7,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 3.48,
                        "quantity": 5,
                        "orderID": 3,
                        "pk": 8,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 8.22,
                        "quantity": 24,
                        "orderID": 4,
                        "pk": 9,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 24.95,
                        "quantity": 1,
                        "orderID": 5,
                        "pk": 10,
                        "itemDescription": "Blue gadget"
                },
                {
                        "unitPrice": 3.95,
                        "quantity": 6,
                        "orderID": 6,
                        "pk": 11,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 12.95,
                        "quantity": 1,
                        "orderID": 6,
                        "pk": 12,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 8.12,
                        "quantity": 12,
                        "orderID": 7,
                        "pk": 13,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 20.95,
                        "quantity": 2,
                        "orderID": 8,
                        "pk": 14,
                        "itemDescription": "Blue gadget"
                },
                {
                        "unitPrice": 3.95,
                        "quantity": 16,
                        "orderID": 9,
                        "pk": 15,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 14.99,
                        "quantity": 1,
                        "orderID": 9,
                        "pk": 16,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 8.12,
                        "quantity": 6,
                        "orderID": 9,
                        "pk": 17,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 21.95,
                        "quantity": 3,
                        "orderID": 10,
                        "pk": 18,
                        "itemDescription": "Blue gadget"
                },
                {
                        "unitPrice": 3.95,
                        "quantity": 4,
                        "orderID": 11,
                        "pk": 19,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 3.95,
                        "quantity": 2,
                        "orderID": 12,
                        "pk": 20,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 12.95,
                        "quantity": 3,
                        "orderID": 12,
                        "pk": 21,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 24.95,
                        "quantity": 5,
                        "orderID": 13,
                        "pk": 22,
                        "itemDescription": "Magenta widget"
                },
                {
                        "unitPrice": 12.24,
                        "quantity": 2,
                        "orderID": 13,
                        "pk": 23,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 24.95,
                        "quantity": 5,
                        "orderID": 13,
                        "pk": 24,
                        "itemDescription": "Blue gadget"
                },
                {
                        "unitPrice": 8.22,
                        "quantity": 2,
                        "orderID": 13,
                        "pk": 25,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 3.48,
                        "quantity": 5,
                        "orderID": 13,
                        "pk": 26,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 8.22,
                        "quantity": 24,
                        "orderID": 14,
                        "pk": 27,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 24.95,
                        "quantity": 1,
                        "orderID": 15,
                        "pk": 28,
                        "itemDescription": "Blue gadget"
                },
                {
                        "unitPrice": 3.95,
                        "quantity": 6,
                        "orderID": 16,
                        "pk": 29,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 12.95,
                        "quantity": 1,
                        "orderID": 16,
                        "pk": 30,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 8.12,
                        "quantity": 12,
                        "orderID": 17,
                        "pk": 31,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 20.95,
                        "quantity": 2,
                        "orderID": 18,
                        "pk": 32,
                        "itemDescription": "Blue gadget"
                },
                {
                        "unitPrice": 3.95,
                        "quantity": 16,
                        "orderID": 19,
                        "pk": 33,
                        "itemDescription": "Green widget"
                },
                {
                        "unitPrice": 14.99,
                        "quantity": 1,
                        "orderID": 19,
                        "pk": 34,
                        "itemDescription": "Orange component"
                },
                {
                        "unitPrice": 8.12,
                        "quantity": 6,
                        "orderID": 19,
                        "pk": 35,
                        "itemDescription": "Yellow item"
                },
                {
                        "unitPrice": 21.95,
                        "quantity": 3,
                        "orderID": 20,
                        "pk": 36,
                        "itemDescription": "Blue gadget"
                }
        ]
});

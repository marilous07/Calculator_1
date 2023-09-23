isc.VLayout.create({
    membersMargin: 10,
    members: [
        isc.SearchForm.create({
            width: "100%", numCols: 4,
            ID: "searchForm",
            fields: [
                { name: "search", title: "Item name", showHintInField: true, 
                    hint: "Search", wrapTitle: false, 
                    keyPress: function (item, form, keyName, characterValue) {
                        if (keyName == "Enter") {
                            itemList.filterData({ fieldName: "itemName", operator: "iContains", value: item.getEnteredValue() });    
                        }
                    }
                },
                {
                    title: "Search", editorType: "ButtonItem", startRow: false,
                    click: function() {
                        itemList.filterData({ fieldName: "itemName", operator: "iContains", value: searchForm.getField("search").getValue() });
                    }
                }
            ]
        }),
        isc.ListGrid.create({
            ID: "itemList",
            width: 800, height: 450,
            showHeader: false, 
            alternateRecordStyles: true,
            recordComponentPosition: "within",
            recordComponentPoolingMode: "recycle",
            showRecordComponents: true,
            autoSaveEdits: false,
            dataSource: supplyItem,
            autoFetchData: true,
            recordComponentHeight: 100,
            fields: [
                {name: "itemName",
                    formatCellValue : function () { return ""; }
                }
            ],
            createRecordComponent: function (record, colNum) {
                var form = isc.DynamicForm.create({
                    dataSource: supplyItem,
                    showPending: true,
                    canEdit: false,
                    numCols: 4,
                    colWidths: [100, "*", 100, "*"],
                    width: "100%",
                    autoDraw: false,
                    fields: [
                        { name: "itemName"},
                        { name: "unitCost", canEdit: true, 
                            changed: function (form, item, value) {
                                var selectedRecord = itemList.getSelectedRecord();
                                if (selectedRecord) {
                                    itemList.setEditValues(itemList.getRowNum(selectedRecord), {unitCost: value}); 
                                }
                            },
                            icons: [
                                { src: "[SKIN]/actions/save.png", prompt: "Save",
                                    click: function (form, item) {
                                        if (itemList.getSelectedRecord()) form.saveData();
                                    }
                                },
                                { src: "[SKIN]/pickers/refresh_picker.png", prompt: "Reorder", width: 18, height: 22,
                                    enableWhen: { fieldName: "inStock", operator:"equals", value:true }
                                },
                                { src: "[SKIN]/pickers/clear_picker.png", prompt: "Remove", width: 18, height: 22,
                                    click: function (form, item) {
                                        if (itemList.getSelectedRecord()) itemList.removeData(itemList.getSelectedRecord());
                                    }
                                },
                                { src: "[SKIN]/actions/plus.png", prompt: "Bulk Order",
                                    visibleWhen: { fieldName: "units", operator:"inSet", value:["Roll", "Ream", "Tube"] }
                                }
                            ]
                        },
                        { name: "description", width:"*", colSpan:"*", height: 60}
                    ],
                    click: function () {
                        itemList.selectSingleRecord(record);
                    }
                });
                form.setValues(record);
                return form;
            },
            updateRecordComponent: function (record, colNum, component, recordChanged) {
                component.setData(record);
                var editValues = itemList.getEditValues(record);
                if (editValues["unitCost"] != null) {
                    component.setValue("unitCost", editValues["unitCost"]);
                }
                component.markForRedraw();
                return component;
            }
        })
    ]
});

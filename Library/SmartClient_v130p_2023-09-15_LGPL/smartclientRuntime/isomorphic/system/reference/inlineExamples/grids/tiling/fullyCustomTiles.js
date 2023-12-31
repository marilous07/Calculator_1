isc.TileGrid.create({
    ID:"boundList",
    tileWidth:250,
    tileHeight:150,
    width: "100%",
    height:"100%",
    dataSource:"animals",
    autoFetchData:true,
    animateTileChange:true,
    tileConstructor: "DynamicForm",
    tileProperties: {
        overflow: "hidden",
        height: 150,
        width: 200
    },
    fields: [
        {name:"picture", rowSpan: 3, showTitle: false, canEdit: false, editorType: "StaticTextItem",
            imageURLPrefix:"../inlineExamples/tiles/images/",
            showValueIconOnly: true,
            valueIconHeight: 148,
            valueIconWidth: 120,
            getValueIcon : function (value) {
                return value;
            }
        },
        {name:"commonName", textBoxStyle: "commonName", showTitle: false, editorType: "StaticTextItem"},
        {name:"lifeSpan", formatCellValue: "return 'Lifespan: ' + value;", showTitle: false,
            editorType: "StaticTextItem", textBoxStyle: "animalText",
            formatValue : function (value, record, form, item) {
                return value + " years";
            }
        },
        {name:"status", showTitle: false, editorType: "StaticTextItem", 
            height: "*",
            formatValue : function (value, record, form, item) {
                var res = null;
                if      (value == "Endangered")     res = "endangered";
                else if (value == "Threatened")     res = "threatened";
                else if (value == "Not Endangered") res = "notEndangered";
                else                                res = "animalText";
                return "<span class=" + res + ">" + value + "</span>";
            }
        }
    ]
});


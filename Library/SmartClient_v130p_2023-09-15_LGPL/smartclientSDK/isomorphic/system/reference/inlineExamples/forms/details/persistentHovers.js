isc.DynamicForm.create({
    ID: "pickerForm",
    wrapItemTitles: false,
    numCols: 4,
    fields: [
        { name: "hoverPersist", title: "Hover Mode", 
            valueMap: [ "[Unset]", "none", "underMouse", "clickPin", "autoPin" ],
            defaultValue: "[Unset]",
            changed: "propertiesForm.setHoverPersist(value != '[Unset]' ? value : null);"
        },
        { name: "showFocusLabel", type: "boolean", title: "Show 'Press f2' Label", 
            defaultValue: true,
            changed: "propertiesForm.setHoverFocusKey(value ? 'f2' : null);"
        }
    ]
});

isc.DynamicForm.create({
    ID: "propertiesForm",
    cellStyle: "propSheetValue",
    titleStyle: "propSheetTitle",
    border: "1px solid black",
    padding: 5,
    top: 50,
    width: 320,
    // Pin hovers launched by this component on "f2" keypress
    hoverFocusKey:"f2",

    fields:[
        {editorType:"HeaderItem", value:"Attributes for Window component"},
        {editorType:"SectionItem", sectionExpanded:true, value:"Header",
            itemIds: ["showHeader", "title"]},
        {name:"showHeader", type:"boolean", labelAsTitle:true, defaultValue:true},
        {name:"title", type:"text", width:180},

        {editorType:"SectionItem", sectionExpanded:true, value:"Size / Position",
            itemIds: ["autoCenter", "autoSize"]},
        {name:"autoCenter", type:"boolean", labelAsTitle:true},
        {name:"autoSize", type:"boolean", labelAsTitle:true},

        {editorType:"SectionItem", sectionExpanded:true, value:"Modality",
            itemIds: ["isModal", "showModalMask"]},
        {name:"isModal", type:"boolean", labelAsTitle:true},
        {name:"showModalMask", type:"boolean", labelAsTitle:true}
    ],
    // On titleHover, show the documentation HTML
    titleHoverHTML : function (item) {
        return propertyDocs[item.name];
    },

    // hard-coded links in the documentation HTML will invoke this method to show
    // related documentation
    refLinkClick : function (attribute) {
    
        window.open("../isomorphic/system/reference/?id=" + attribute, "externalReference");
        var colonIndex = attribute.indexOf(":"),
            prettyAttribute = colonIndex == -1 ? attribute : 
                                    attribute.substring((colonIndex+1), attribute.length);

        isc.notify("Documentation for <i>" + prettyAttribute + "</i> opened in a separate window");
        
    }
});

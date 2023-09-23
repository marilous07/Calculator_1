isc.ListGrid.create({
    width: 750,
    height: 250,
    canResizeFields: true,
    showRecordComponents: true,    
    canRemoveRecords: true,  
    recordComponentPoolingMode: "recycle",
    data: countryData,

    fields: [
        { name: "countryCode", type: "image", title: "Flag", width: 60,
            imageURLPrefix: "flags/16/", imageURLSuffix: ".png" },
        { name: "countryName", title: "Country" },
        { name: "capital", title: "Capital" },
        { name: "continent", title: "Continent" }
    ],
	
    createRecordComponent: function (record, colNum) {  
            var editImg = isc.Label.create({
                contents: record["background"],
                wrap: true,
                height: this.getDrawnRowHeight()
            });
            return editImg			
    },
	
    updateRecordComponent: function (record, colNum, component, recordChanged) {
        if (recordChanged) { 	
            component.setContents(record["background"]);
            component.setHeight(this.getDrawnRowHeight());	
        }
        return component
    }
});
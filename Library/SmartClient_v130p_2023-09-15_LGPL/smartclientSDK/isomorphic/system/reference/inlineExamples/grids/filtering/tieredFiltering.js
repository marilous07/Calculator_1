isc.SearchForm.create({
    ID: "specializedForm",
    numCols: 4,
    width: 800,
    fields: [
        { name:"hemisphereField", type:"radioGroup", title:"Hemisphere", valueMap:["Any", "Northern", "Southern"], 
            vertical:false,
            getCriterion: function () {
                var optionHemisphere = this.getValue(),
                    criterion = {},                
                    southernCountries = ["Indonesia", "Argentina", "Bolivia", "Australia", "Brasil", "Chile", "Paraguay",
                                         "Ecuador","Mauritius", "Somalia", "Tanzania", "Zambia", 
                                         "Peru", "Uruguay", "Angola", "Botswana", "Burundi", "Madagascar", "South Africa",
                                         "Kenya", "Malawi", "Mozambique", "Namibia", "Nauru", "New Zeland", "Congo"];
                
                if (optionHemisphere && optionHemisphere != "Any") {
                    if (optionHemisphere == "Northern") {
                        criterion = { fieldName:"countryName", operator:"notInSet", value:southernCountries }
                    } else {
                        criterion = { fieldName:"countryName", operator:"inSet", value:southernCountries }
                    }
                }
                return criterion;
            }
        },
        { name:"populationField", type:"radioGroup", title:"Population", valueMap:["Any", "Dense", "Normal", "Sparse"], 
            vertical:false,
            getCriterion: function () {
                var optionPopulation = this.getValue(),
                    criterion = {};
                
                if (optionPopulation && optionPopulation != "Any") {
                    if (optionPopulation == "Dense") {
                        criterion = { fieldName:"population", operator:"lessThan", value:1000000 }
                    } else if (optionPopulation == "Normal") {
                        criterion = { fieldName:"population", operator:"between", start: 1000001, end:6500000 }
                    } else {
                        criterion = { fieldName:"population", operator:"greaterThan", value:6500001 }
                    }
                }
                return criterion;
            }
        }       
    ],
    itemChanged: function (item, newValue) {
        this.submit();
    },
    colWidths: [120, "*", 100],
    values: {
        hemisphereField:"Any",
        populationField:"Any"
    }
});

isc.ListGrid.create({
    ID: "countryList",
    width:800, height:224, alternateRecordStyles:true, 
    dataSource: worldDS, autoFetchData: true,
    canShowFilterEditor: true,
    searchForm: "specializedForm",
    allowFilterOperators: true,
    alwaysShowOperatorIcon: true,
    fields:[
        {name:"countryName"},
        {name:"continent"},
        {name:"population"},
        {name:"area"},
        {name:"gdp"},
        {name:"independence", width:100}
    ]
});

isc.VStack.create({
    width: "100%",
    membersMargin:10,
    members:[ specializedForm, countryList ]
})

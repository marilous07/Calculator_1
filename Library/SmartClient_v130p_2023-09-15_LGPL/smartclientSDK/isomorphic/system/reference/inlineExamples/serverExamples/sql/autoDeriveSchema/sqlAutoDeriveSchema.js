isc.ListGrid.create({
    width: 850, height: 400,
    autoFetchData: true,
    dataSource: "AutoDerivedCustomer",
    initialCriteria: {country: 'USA'},
    canEdit: true,
    canRemoveRecords: true,
    // override titles in a few cases, to include a space where needed
    fields: [
        {name: "CUSTOMERNUMBER", title: "Customer Number"},
        {name: "CUSTOMERNAME", title: "Customer Name"},
        {name: "CITY"},
        {name: "STATE"},
        {name: "POSTALCODE", title: "Postal Code"},
        {name: "salesRepEmployeeNumber"}
    ]
});
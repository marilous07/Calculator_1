
isc.DataSource.create({
    ID: "eventDS",
    fields:[
        {name:"eventId", primaryKey: true, type: "sequence"},
        {name:"name"},
        {name:"description"},
        {name:"startDate"},
        {name:"endDate"}
    ],
    clientOnly: true,
    testData: eventData
        
});     

isc.Calendar.create({
    ID: "eventCalendar", 
    dataSource: eventDS, 
    autoFetchData: true,
    showWeekends: false, 
    startDate: eventData.getDataStartDate(),

    // enable workday features
    showWorkday: true,
    // apply the workdayBaseStyle
    styleWorkday: true,
    // scroll to the start of the workday
    scrollToWorkday: true,
    // size the workday rows to fill the viewport, if the viewport is tall enough
    sizeToWorkday: true
    // this line will prevent scrolling beyond the workday hours
    //, limitToWorkday: true
});

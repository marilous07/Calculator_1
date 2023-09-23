isc.Calendar.create({
    ID: "eventCalendar", 
    startDate: eventData.getDataStartDate(),
    data: eventData,
    // this flag means events will only show hovers if their content is not fully visible already
    alwaysShowEventHovers: false
});

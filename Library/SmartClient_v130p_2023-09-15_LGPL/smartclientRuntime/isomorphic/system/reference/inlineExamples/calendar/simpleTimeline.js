var developers = [
    { name: "charlesMadigen", title: "Charles Madigen" },
    { name: "tamaraKane", title: "Tamara Kane" },
    { name: "darcyFeeney", title: "Darcy Feeney" },
    { name: "kaiKong", title: "Kai Kong" },
    { name: "shellyFewel", title: "Shelly Fewel" },
    { name: "garretMonroe", title: "Garret Monroe" }
];

var _calStart = isc.DateUtil.getStartOf(new Date(2020, 6, 4), "W");
var _calEnd = _calStart.duplicate();
_calEnd.setDate(_calEnd.getDate() + 21);

isc.Timeline.create({
    ID: "timeline", 
    height: 475,
    startDate: _calStart, 
    endDate: _calEnd,
    data: events,
    lanes: developers,
    headerLevels: [ { unit: "week" }, { unit: "day" } ],
    laneFields: [ { name: "title", title: "Developer", minWidth: 120, autoFitWidth: true } ],
    canEditLane: true,
    showEventDescriptions: false,
    columnsPerPage: 5
});

/*

  SmartClient Ajax RIA system
  Version v13.0p_2023-09-15/LGPL Deployment (2023-09-15)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/
//> @class CalendarView
// CalendarView is a base class, extended by the various views available in a 
// +link{class:Calendar, Calendar}.
//  
// @inheritsFrom ListGrid
// @treeLocation Client Reference/Calendar
// @visibility calendar
//<
isc.ClassFactory.defineClass("CalendarView", "ListGrid");

isc.CalendarView.addProperties({
    
    isCalendarView: true,
    
    showHeaderSpanContextMenu: false,
    
    autoDraw: false,
    
    verticalEvents: true,
    
    // Only TimelineView supports multiDayEvents
    allowMultiDayEvents: false,

    // this attribute should be false for all Calendar types except Timelines, which might
    // well need a timeItem
    showDateChooserTimeItem: false,

    // needed to avoid the grid scrolling to 0,0 when clicking body children (eventCanvases)
    hiliteRowOnFocus: false,

    hoverDelay: 0,
    showHover: true,
    canHover: true,
    hoverByCell: null,
    hoverAutoFitWidth: true,
    hoverAutoFitMaxWidth: 200,

    // prevent mouseUp/mouseDown from bubbling beyond the CalendarView
    mouseUp : function () {
        return isc.EH.STOP_BUBBLING;
    },
    mouseDown : function () {
        return isc.EH.STOP_BUBBLING;
    },

    
    canFreezeFields: false,
    
    // switch off alternateFieldStyles 
    alternateFieldStyles: false,
    alternateRecordStyles: false,

    // default dateEditingStyle (vertical views) is "time", no day-selection
    dateEditingStyle: "time",

    // Avoid ever attempting to participate in the saved searches subsystem.
    canSaveSearches:false,

    init : function () {
        this.calendar = this.creator;
        // initialize a bunch of objects used to manage events and canvases
        this.resetEventCaches(true);
        this.resetCanvasCaches(true);
        this.resetLaneCaches(true);
        return this.Super("init", arguments);
    },

    resetEventCaches : function (initialize) {
        // initialize or clear a bunch of objects used to manage events and canvases
        this._allEventMap = initialize ? {} : null;         // map of event.__key to event-record
        this._usedEventMap = initialize ? {} : null;        // event-records attached to canvases - __key to canvasID
        this._lastUsedEventMap = initialize ? {} : null;    // last canvas used by a given event - __key to canvasID
    },
    resetCanvasCaches : function (initialize) {
        // initialize or clear a bunch of objects used for managing canvases
        this._allCanvasMap = initialize ? {} : null;        // all event-canvases - canvasID to canvas
        this._pooledCanvasMap = initialize ? {} : null;     // available canvases (hidden, no event attached) - canvasID to canvas
        this._usedCanvasMap = initialize ? {} : null;       // canvases attached to events - canvasID to event.__key
        this._lastUsedCanvasMap = initialize ? {} : null;   // last event used by a given canvas - canvasID to event.__key
    },
    resetLaneCaches : function (initialize) {
        // initialize or clear a bunch of objects used for caching lane details
        this.laneMap = initialize ? {} : null;          // lane-name to lane-object
        this.laneIndexCache = initialize ? {} : null;   // index cache
        this.laneHeightCache = initialize ? {} : null;  // height cache
    },

    initWidget : function () {
        // initialize a cache to store some frequently used props that only change with a rebuild
        this._cache = {};
        // initialize the local _eventData array - returned from getEventData()
        this._eventData = [];
        this._snapGapList = [];
        
        var cal = this.calendar;
        this.firstDayOfWeek = cal.firstDayOfWeek;
        var showHover = this.showHover;
        if (showHover == null) showHover = cal.showViewHovers;
        this.setShowHover(showHover);
        this.Super("initWidget", arguments);

        // only installed on TimelineView for now
        if (this.installLocalHandlers) this.installLocalHandlers()
        
        // always run setChosenDate() to get things ready
        this.setChosenDate(this.chosenDate);
    },

    setEventData : function (events) {
        this._eventData = events;
    },

    getEventData : function () {
        // get the local array of events
        if (!this._eventData) this._eventData = [];
        return this._eventData;
    },

    addEventData : function (event) {
        var data = this.getEventData();
        if (!data.contains(event)) {
            data.add(event);
            // return true, event was added
            return true;
        }
        // return false, event was already present
        return false;
    },
    
    removeEventData : function (event) {
        // remove the event from the local array
        this.getEventData().remove(event);
    },

    

    viewMouseMove : function (a, b, c, d, e) {
    },

    viewDragMove : function (event) {
        this.logInfo("In viewDragMove");
        this.viewMouseMove();
    },
    
    getMouseData : function () {
        return this._mouseData;
    },

    // if this returns true, events are sized to content and stacked in a VLayout
    shouldShowColumnLayouts : function () {
        if (this.isMonthView()) return false;
        if (this.isTimelineView()) return false;
        return !!this.calendar.showColumnLayouts;
    },

    
    canTabToHeader: false,

    
    //includeRangeCriteria: null,
    //fetchMode: "view",
    rangeCriteriaMode: null,

    getVisibleStartDate : function () {
        return this.startDate;
    },
    getVisibleEndDate : function () {
        return this.endDate;
    },

    _usDateRegex:/^\d{4}.\d\d?.\d\d?$/,
    _jpDateRegex:/^\d\d?.\d\d.\d{4}?$/,
    rangeUnit: "D",
    setChosenDate : function (newDate) {
        var cal = this.calendar;
        // newDate should be a logicalDate, as passed internally from Calendar.setChosenDate(),
        // so should already be in the defaultDisplayTimezone - but run it through 
        // getLogicalDateOnly() anyway
        var chosenDate = newDate.logicalDate ? newDate.duplicate() : 
                isc.DateUtil.getLogicalDateOnly(newDate);

        var chosenWeek = chosenDate.getWeek();

        // get logical date and week
        this.logicalDate = chosenDate.duplicate();
        //isc.logWarn("logicalDate is " + this.logicalDate.toString());
        this.chosenDate = chosenDate;
        this.chosenWeek = chosenWeek;

        // always update the firstDayOfWeek from the parent caledar
        this.firstDayOfWeek = this.calendar.firstDayOfWeek;
        var fDOW = this.firstDayOfWeek;

        // set the range dates
        if (this.rangeUnit) {
            this.periodStartDate = this.startDate = isc.DateUtil.getStartOf(this.chosenDate, this.rangeUnit, false, fDOW);
            this.periodEndDate = this.endDate = isc.DateUtil.getEndOf(this.chosenDate, this.rangeUnit, false, fDOW);
            
            if (this.isWeekView()) {
                // in weekView, set a couple of special values for use purely in the dateLabel 
                // above the calendar
                this.labelStartDate = this.startDate.duplicate();
                this.labelEndDate = this.endDate.duplicate();

                if (cal.showWeekends == false) {
                    // in weekView, when showWeekends is false, modify the start/end dates so they
                    // match the first and last visible dates - the periodStart/End are still the 
                    // full week extents
                    if (isc.DateUtil.isWeekend(this.startDate)) {
                        this.labelStartDate = isc.DateUtil.getNextWeekday(this.startDate, cal.getWeekendDays());
                    }
                    if (isc.DateUtil.isWeekend(this.endDate)) {
                        this.labelEndDate = isc.DateUtil.getPreviousWeekday(this.endDate, cal.getWeekendDays());
                    }
                }
            }
            
            // get logical date and week
            this.logicalDate = isc.DateUtil.createLogicalDate(this.startDate);
        }

        this._refreshingEvents = false;

        if (this.isSelectedView()) {
            // if scrollToWorkday is set, set it up here
            if (this.verticalEvents && cal.showWorkday && cal.scrollToWorkday) {
                this._needsScrollToWorkdayStart = true;
            }
            this.updateRange();
            this._refreshEvents();
        } else {
            // if scrollToWorkday is set, set it up here
            if (this.verticalEvents && cal.showWorkday && cal.scrollToWorkday) {
                this._needsScrollToWorkdayStart = true;
            }
            this._needsUpdateRange = true;
            this._needsRefresh = true;
        }
    },

    getPeriodStartDate : function () {
        return this.periodStartDate;
    },
    getPeriodEndDate : function () {
        return this.periodEndDate;
    },    

    updateRange : function (newDate) {
        delete this._needsUpdateRange;
        if (this.isWeekView() || this.isDayView()) {
            this.updateFieldDates();
            this.updateRowDates();
            // if _needsScrollToWorkdayStart is set, do that here
            if (this._needsScrollToWorkdayStart) {
                delete this._needsScrollToWorkdayStart;
                this.delayCall("scrollToWorkdayStart");
            }
            this.markForRedraw();
        } else if (this.isMonthView()) {
        }
    },

    
    getFieldTitle : function (fieldId) {
        var cal = this.calendar,
            title = this.Super("getFieldTitle", arguments),
            field = this.getUnderlyingField(fieldId)
        ;
        if (field) {
            var date = field.date,
                // monthView doesn't have field.date, because a field represents multiple dates
                dayOfWeek = date ? date.getDay() : field._dayNum
            ;
            if (dayOfWeek != null) {
                if (cal.getDateHeaderTitle) {
                    title = cal.getDateHeaderTitle(date, dayOfWeek, title, this) || title;
                }
            }
        }
        return title;
    },
    
    getMinimumSnapGapTime : function (unit) {
        // get the min sensible snapGap time that can be represented in the current resolution
        // - if a specified or calculated eventSnapGap is smaller than this value, it will be 
        // defaulted to this value, to prevent rendering and sizing issues
        var props = this._cache,
            millis = props.minimumSnapGapMillis
        ;
        if (!millis) {
            var opts = [ 1, 5, 10, 15, 20, 30, 60, 120, 180, 240, 360, 480, 720, 1440];
            var mins = isc.DateUtil.convertPeriodUnit(props.millisPerPixel, "ms", "mn");
            for (var i=0; i<opts.length; i++) {
                if (mins <= opts[i]) {
                    mins = opts[i];
                    break;
                }
            }
            millis = isc.DateUtil.convertPeriodUnit(mins, "mn", "ms");
        }
        if (!unit) unit = "mn";
        return Math.floor(isc.DateUtil.convertPeriodUnit(millis, "ms", unit));
    },

    getTimePerCell : function (unit) {
       var cal = this.calendar,
            props = this._cache,
            millis = props.millisPerCell
        ;
        if (!millis) {
            millis = isc.DateUtil.convertPeriodUnit(cal.minutesPerRow, "mn", "ms");
        }
        if (!unit) unit = "mn";
        return Math.floor(isc.DateUtil.convertPeriodUnit(millis, "ms", unit));
    },
    getTimePerSnapGap : function (unit) {
         var cal = this.calendar,
            props = this._cache,
            millis = props.millisPerSnapGap
        ;
        if (!millis) {
            if (props.calendarEventSnapGap == null) {
                // eventSnapGap is null, use timePerCell (minutesPerRow)
                millis = this.getTimePerCell("ms");
            } else if (props.calendarEventSnapGap == 0) {
                // eventSnapGap is zero, use the smallest snaps that can be represented
                millis = this.getMinimumSnapGapTime("ms");
            } else {
                millis = isc.DateUtil.convertPeriodUnit(props.calendarEventSnapGap, "mn", "ms");
            }
            props.millisPerSnapGap = millis;
        }
        if (!unit) unit = "mn";
        return isc.DateUtil.convertPeriodUnit(millis, "ms", unit);
    },
    getTimePerPixel : function (unit) {
        var cal = this.calendar,
            props = this._cache
        ;
        
        var msPerPixel = Math.floor(this.getTimePerCell("ms") / this.cellHeight);
        if (!unit) unit = "mn";
        return isc.DateUtil.convertPeriodUnit(msPerPixel, "ms", unit);
    },

    getSnapGapPixels : function (rowNum, colNum) {
        var snapCount = this.getTimePerCell() / this.getTimePerSnapGap();
        return Math.round(this.cellHeight/snapCount);
    },

    getDateLabelText : function (startDate, endDate) {
        return null;
    },

    setShowHover : function (showHover) {
        if (this.showViewHovers == false) return;
        this.showHover = showHover;
        this.canHover = showHover;
    },
 
    shouldShowEventHovers : function () {
        if (this.showHover == false || this.calendar.showViewHovers == false) return false;
        if (this.showEventHovers != null) return this.showEventHovers;
        return this.calendar.showEventHovers;
    },
    shouldShowHeaderHovers : function () {
        if (this.showHover == false || this.calendar.showViewHovers == false) return false;
        if (this.showHeaderHovers != null) return this.showHeaderHovers;
        return this.calendar.showHeaderHovers;
    },
    shouldShowLaneFieldHovers : function () {
        if (this.showHover == false) return false;
        if (this.showLaneFieldHovers != null) return this.showLaneFieldHovers;
        return this.calendar.showLaneFieldHovers;
    },
    shouldShowCellHovers : function () {
        if (this.showHover == false) return false;
        if (this.showCellHovers != null) return this.showCellHovers;
        return this.calendar.showCellHovers;
    },
    shouldShowDragHovers : function () {
        if (this.showHover == false) return false;
        if (this.showDragHovers != null) return this.showDragHovers;
        return this.calendar.showDragHovers;
    },
    shouldShowZoneHovers : function () {
        if (this.shouldShowCellHovers()) return false;
        if (this.showZoneHovers != null) return this.showZoneHovers;
        return this.calendar.showZoneHovers;
    },


    // standard helpers, applicable to all views

    //> @attr calendarView.calendar (Calendar : null : R)
    // The +link{Calendar, calendar} this view is in.
    // @visibility external
    //<
    
    //> @attr calendarView.viewName (String : null : R)
    // The name of this view, used to identify it in the +link{calendarView.calendar, calendar}.
    // @visibility external
    //<

    //> @method calendarView.isSelectedView()
    // Returns true if this view is the currently selected view in the parent calendar.
    // @return (Boolean) true if the view is selected in the parent calendar, false otherwise
    // @visibility external
    //<
    isSelectedView : function () {
        return this.creator.getCurrentViewName() == this.viewName;
    },
    //> @method calendarView.isTimelineView()
    // Returns true if this is the +link{calendar.timelineView, timeline view}, false otherwise.
    // @return (boolean) true if this is a Timeline view
    // @visibility external
    //<
    isTimelineView : function () {
        return this.viewName == "timeline";
    },
    //> @method calendarView.isDayView()
    // Returns true if this is the +link{calendar.dayView, day view}, false otherwise.
    // @return (boolean) true if this is a Day view
    // @visibility external
    //<
    isDayView : function () {
        return this.viewName == "day";
    },
    //> @method calendarView.isWeekView()
    // Returns true if this is the +link{calendar.weekView, week view}, false otherwise.
    // @return (boolean) true if this is a Week view
    // @visibility external
    //<
    isWeekView : function () {
        return this.viewName == "week";
    },
    //> @method calendarView.isMonthView()
    // Returns true if this is the +link{calendar.monthView, month view}, false otherwise.
    // @return (boolean) true if this is a Month view
    // @visibility external
    //<
    isMonthView : function () {
        return this.viewName == "month";
    },

    updateLaneRollover : function (newRow) {
        if (!this.isTimelineView()) return;
        this.clearLastHilite();
        if (newRow == null) return;
        this.body.lastOverRow = newRow;
        this.body.updateRollOver(newRow);
    },
    
    //> @method calendarView.rebuild()
    // Rebuild this CalendarView, including re-fetching its data as necessary.  To avoid 
    // re-fetching the data, pass 'false' to this method, or call 
    // +link{calendarView.refreshEvents, refreshEvents()} instead.
    // @param [refreshData] (Boolean) If false, prevents data from bing refreshed.
    // @visibility external
    //<
    rebuild : function (refreshData) {
        if (refreshData == null) refreshData = true;
        if (this._rebuild) this._rebuild(refreshData);
        else if (this.rebuildFields) {
            // this is a day/weekView - rebuild the fields and call setChosenDate() to refresh 
            // events
            this.rebuildFields();
            this.setChosenDate(this.chosenDate);
        } else {
            // this is monthView - refresh the fields, to pick up showIf, and refresh the events
            if (this.isMonthView()) this.refreshFields();
            this.refreshEvents("rebuild");
        }
    },
    initCacheValues : function () {
        var cal = this.calendar;
        this._cache = {
            firstDayOfWeek: this.firstDayOfWeek,
            rangeStartDate: cal.getPeriodStartDate(this),
            rangeEndDate: cal.getPeriodEndDate(this),
            calendarEventSnapGap: cal.eventSnapGap
        };
        this._cache.rangeStartMillis = this._cache.rangeStartDate.getTime();
        this._cache.rangeEndMillis = this._cache.rangeEndDate.getTime();
        this.updateSnapProperties();
        return this._cache;
    },
    
    updateSnapProperties : function () {
        delete this._cache.millisPerCell;
        delete this._cache.millisPerSnapGap;
        delete this._cache.millisPerPixel;
        delete this._cache.snapGapPixels;
        this._cache.millisPerCell = this.getTimePerCell("ms");
        this._cache.millisPerPixel = this.getTimePerPixel("ms");
        this._cache.minimumSnapGapMillis = this.getMinimumSnapGapTime("ms");
        this._cache.millisPerSnapGap = this.getTimePerSnapGap("ms");
    },
    // temp attribute showLaneFields - allows lane fields to be hidden in timelines
    showLaneFields: null,

    
    
	//>	@attr calendarView.useEventCanvasPool (Boolean : true : IRW)
	// Should +link{EventCanvas, event canvas} instances be reused when visible events change?
    // @visibility external
	//<
    useEventCanvasPool: true,
    // incomplete poolingMode implementation, just so we can switch to a better default right 
    // away - "data" mode only pools the event canvases when dataChanged (and refreshEvents)
    // happens - the other mode of "viewport" pools windows as soon as they leave the viewport
    eventCanvasPoolingMode: "data",

    //> @attr calendarView.eventStyleName  (CSSStyleName : null : IRW)
    // If specified, overrides +link{calendar.eventStyleName} and dictates the CSS style to 
    // use for events rendered in this view.  Has no effect on events that already have a 
    // +link{calendarEvent.styleName, style specified}.
    //  
    // @group appearance
    // @visibility external
    //<

    // -------------------------
    // Lanes and Sublanes
    // --------------------------
    
    getLaneIndex : function (laneName) { return null; },
    getLane : function (lane) { return null; },
    getLaneFromPoint : function (x, y) { return null; },

    getSublane : function (laneName, sublaneName) { 
        if (!this.hasSublanes()) return null;
        var lane = this.getLane(laneName),
            sublane = lane && lane.sublanes ? 
                        isc.isAn.Object(sublaneName) ? sublaneName :
                        lane.sublanes.find(this.calendar.laneNameField, sublaneName) 
                      : null
        ;
        return sublane;
    },
    getSublaneFromPoint : function (x, y) { return null; },

    setLaneTitle : function (lane, title) {
        // get the live lane object, set it's title, and do an update in-place
        var l = this.getLane(lane);
        if (!l) return false;
        l.title = title;
        this.updateLanes(this.lanes);
        return true;
    },

    updateLanes : function (lanes) {
        // call setLanes without refreshing events - called as part of refreshEvents()
        this.setLanes(lanes, true);
        // refresh the body here so that getRowTop() and similar work as expected immediately
        // following calls to this method
        this.body.redraw();
    },

    // get the internal laneName -> lane-object map 
    getLaneMap : function () {
        return this.laneMap;
    },

    usesLanes : function () {
        return this.isTimelineView() || (this.isDayView() && this.calendar.showDayLanes);
    },
    hasLanes : function () {
        return this.usesLanes() && this.lanes && this.lanes.length > 0;
    },
    hasSublanes : function () {
        return this.calendar.useSublanes && this.usesLanes();
    },
    useLanePadding : function () {
        if (this.isTimelineView()) return true;
        if (this.usesLanes()) {
            // don't introduce horizontal padding between events in a vertical lane if the
            // calendar is set up to overlap the event canvases
            return this.calendar.eventOverlap ? false : true;
        }
        return false;
    },
    
    canScrollToEvent : function (event) {
        var rangeStart = this.startDate.getTime(),
            rangeEnd = this.endDate.getTime(),
            sDate = this.calendar.getEventStartDate(event),
            eDate = this.calendar.getEventEndDate(event)
        ;
        if ((sDate.getTime() >= rangeStart && sDate.getTime() <= rangeEnd) ||
            (eDate.getTime() >= rangeStart && eDate.getTime() <= rangeEnd)) 
        {
            return true;
        }
        return false;
    },
    scrollToEvent : function (event) {
        var cal = this.calendar,
            range = { start: this.startDate.getTime(), end: this.endDate.getTime() },
            sDate = cal.getEventStartDate(event),
            eDate = cal.getEventEndDate(event)
        ;
        if (this.canScrollToEvent(event)) {
            var x = null,
                y = null
            ;
            var canvas = this.getCurrentEventCanvas(event);
            if (canvas) {
                x = canvas.getLeft();
                y = canvas.getTop();
            } else {
                x = this.getDateLeftOffset(sDate);
                if (this.isTimelineView()) {
                    y = this.getRowTop(this.getLaneIndex(event[cal.laneNameField]));
                } else {
                    y = this.getDateTopOffset(sDate, event[cal.laneNameField]);
                }
            }
            // event is in the current scrollable range - scroll to it
            this.body.scrollTo(x, y);
        }
    },

    getCellCSSText : function (record, rowNum, colNum) {
        var result = this.calendar._getCellCSSText(this, record, rowNum, colNum);

        return result;
        //if (result) return result;
        //return this.Super("getCellCSSText", arguments);
    },

    getEventCanvasStyle : function (event) {
        if (this.usesLanes()) {
            var cal = this.calendar,
                lnField = cal.laneNameField,
                slnField = cal.sublaneNameField,
                styleField = cal.eventStyleNameField,
                lane = this.getLane(event[lnField]),
                sublane = lane && cal.useSublanes ? this.getSublane(lane[lnField], event[slnField]) : null
            ;
            // get the eventStyleName from the sublane, then the lane, then this view
            return (sublane && sublane.eventStyleName) || (lane && lane.eventStyleName)
                        || this.eventStyleName;
        }
        return this.eventStyleName
    },

    getDateFromPoint : function () {
        return this.getCellDate();
    },
        
// cell hovers
    cellHoverHTML : function (record, rowNum, colNum) {
        var html = this.calendar._getCellHoverHTML(this, record, rowNum, colNum);
        return html;
    },
    headerHoverHTML : function (fieldNum) {
        var field = this.getField(fieldNum);
        return this.calendar._getHeaderHoverHTML(this, this.fieldHeaderLevel, 
            field, field.date, field.endDate);
    },
    // all views
    getPrintHTML : function (printProperties, callback) {
        if (this.isMonthView()) return this.Super("getPrintHTML", arguments);
        if (callback) {
            this.delayCall("asyncGetPrintHTML", [printProperties, callback]);
            return null;
        } else {
            return this.asyncGetPrintHTML(printProperties, callback);
        }
    },
    
    // all views
    asyncGetPrintHTML : function (printProperties, callback) {

        this.__printing = true;
    
        // force a refresh of ALL events - this will create and draw canvases for any events 
        // that haven't yet been scrolled into view
        this.refreshVisibleEvents(true, "asyncGetPrintHTML");
 
        printProperties = isc.addProperties({}, printProperties);
        
        this.body.printChildrenAbsolutelyPositioned = true;

        var cal = this.calendar,
            isTimeline = this.isTimelineView(),
            isWeek = this.isWeekView(),
            isDay = this.isDayView(),
            isMonth = this.isMonthView()
        ;

        if (isMonth) return;
        
        var fields = this.getVisibleFields(this.completeFields),
            data = this.getData(),
            output = isc.StringBuffer.create(),
            totalWidth = 0,
            fieldWidths = []
        ;

        // if the (Timeline) view is grouped, use the _openListCache
        if (isc.isA.Tree(data)) data = data._openListCache;

        for (var i=0; i<fields.length; i++) {
            var field = fields[i];
            var button = this.getFieldHeaderButton(field.masterIndex);
            var result = button ? button.width || button.getVisibleWidth() : null;
            if (result == null) result = this.getFieldWidth(field);
            // round the field-width
            result = isTimeline ? Math.ceil(result) : Math.floor(result);
            fieldWidths.add(result);
        }

        totalWidth = fieldWidths.sum();
        
        var rowStart = "<TR",
            rowEnd = "</TR>",
            gt = ">",
            heightAttr = " HEIGHT=",
            valignAttr = " VALIGN="
        ;


        var bodyVOffset = 40;
        
        output.append("<div style='position:relative;'>");

        output.append("<TABLE cellpadding='0' cellspacing='0' WIDTH='", totalWidth, 
            "' style='",
            "border: 1px solid grey;'>"
        );

        output.append("<THEAD>");
        
        if (this.showHeader) {
            var headerHTML = this.getPrintHeaders(0, this.fields.length, fieldWidths);
            //headerHTML = "<span style='whitespace:nowrap;'>" + headerHTML + "</span>";
            this._headerPrintHeight = isc.Canvas.measureContent(headerHTML, "printHeader", true, true, { wrap: false});
            //isc.logWarn( "header print height: " + this._headerPrintHeight);
            // don't generate column-headers for dayView
            output.append(headerHTML);
        }

        output.append("</THEAD>");

        // absolutely position the body and events after the header
        bodyVOffset += this.getHeaderHeight();

        output.append("<TBODY>");

        for (var i=0; i<data.length; i++) {
            var rowHeight = Math.floor(this.getRowHeight(data[i], i));
            // deal with differing row-heights in zoomed pages
            if (i < data.length - 1) {
                rowHeight = this.getRowTop(i+1) - this.getRowTop(i);
            }
            output.append(rowStart, heightAttr, rowHeight, gt);
            for (var j=0; j<fields.length; j++) {
                var value = this.getCellValue(data[i], i, j);
                output.append("<TD class='", this.getCellStyle(data[i], i, j), "' ",
                    "style='width:", fieldWidths[j]-1,  "px; ",
                    "box-sizing: border-box; ",
                    //(isTimeline ? "max" : "min"), "-width:",  fieldWidths[j]-1 + "px;", 
                    "max-width:",  fieldWidths[j]-1 + "px;", 
                    "border-width: 0px 1px 1px 0px; ",
                    "height: ", rowHeight, "px;",
                    "border-bottom: 1px solid #ABABAB; border-right: 1px solid #ABABAB; ",
                    "border-top: none; border-left: none;",
                    this.getCellCSSText(data[i], i, j),
                    "'>"
                );
                output.append(this.getCellValue(data[i], i, j) || "&nbsp;");
                output.append("</TD>");
            }
            output.append(rowEnd);
        }

        output.append("</TBODY>");
        output.append("</TABLE>");
        
        var events = this.body.children;
        for (var i=0, len=events.length; i<len; i++) {
            var event = events[i],
                isValid = event.isEventCanvas || event.isZoneCanvas || event.isIndicatorCanvas;
            if (!isValid) {
                if (this.shouldShowColumnLayouts() && isc.isA.Layout(event)) {
                    // events are children of per-column VLayouts - script the layout's 
                    // outerHTML (includes placement)
                    output.append(event.getHandle().outerHTML);
                }
                continue;
            }
            // events are children of the grid-body
            if (!event.isDrawn() || !event.isVisible()) continue;
            if (event.isZoneCanvas) printProperties.i = 0;
            else if (event.isIndicatorCanvas) printProperties.i = len;
            else printProperties.i = i;
            var nextHTML = event.getPrintHTML(printProperties);
            output.append(nextHTML);
        }

        output.append("</div>");
        
        var result = output.release(false);

        if (callback) {
            this.fireCallback(callback, "HTML", [result]);
        }

        delete this.__printing;

        return result;
    },

    headerRowPrintHeight: 30,
    getPrintHeaders : function (startCol, endCol, fieldWidths) {
        
        var defaultAlign = (this.isRTL() ? isc.Canvas.LEFT : isc.Canvas.RIGHT),
            // consider printing headers with a headerButton style, which looks much better
            //printHeaderStyle = this.printHeaderStyle || this.headerBaseStyle,
            printHeaderStyle = this.headerBaseStyle,
            HTML
        ;

        var printHeight = this.headerRowPrintHeight;

        // We support arbitrarily nested, asymmetrical header-spans - these require
        // some slightly tricky logic so use a conditional to avoid this if not required.
        if (this.headerSpans) {

            // Step 1: We'll build an array of "logical columns" in this format:
            // [field1], [innerHeader1], [topHeader]
            // [field2], [innerHeader2], [topHeader]
            // [field3], [topHeader2]
            // Each array contains an entry for each row we'll write out (each header
            // span the field is embedded in, plus the field).
            // Note that the top row of HTML will be the last entry in each sub-array and
            // the bottom row will be the first entry (the field should appear below 
            // all its headers).
            // Also note we have repeats in here - we'll handle this by applying colSpans
            // to the generated HTML - and that the column arrays will be different lengths
            // due to different depth of nesting of header spans - we'll handle this by 
            // applying rowSpans.
            var logicalColumns = [],
                numRows = 1;
            
            for (var i = startCol; i < endCol; i++) {
                var field = this.getField(i);
                logicalColumns[i] = [field];
                
                var span = this.spanMap[field.name];
                
                // build a logical column from the fieldName up to the top span
                // (Note that we will have the same span in multiple cols, which is ok)
                while (span != null) {
                    logicalColumns[i].add(span);
                    span = span.parentSpan;
                }
                // Remember how deep the deepest nested column is - this is required to
                // allow us to apply numRows.
                numRows = Math.max(logicalColumns[i].length, numRows);
            }

            // Step 2: Iterate through the column arrays starting at the last entry
            // (outermost header)
            HTML = [];

            for (var i = numRows-1; i >= 0; i--) {
                HTML[HTML.length] = "<TR HEIGHT=" + printHeight + ">";
                
                var lastEntry = null,
                    colSpanSlot = null;
                for (var ii = startCol; ii < endCol; ii++) {
                    var rowSpan = 1, colSpan = 1;
                    // When we reach the first entry in the array we'll be looking at a field
                    var isField = (i == 0);

                    var entry = logicalColumns[ii][i];
                    
                    
                    if (entry == "spanned") {
                        continue;
                    }
                    var minDepth,
                        spanningColNum = ii,
                        spannedColOffsets = [];
                        
                    // set colSpan to zero. We'll increment in the loop below
                    colSpan = 0;
                    
                    while (spanningColNum < endCol) {
                        var entryToTest = null,
                            foundMismatch = false;
                        for (var offset = 0; (i-offset) >= 0; offset++) {
                            entryToTest = logicalColumns[spanningColNum][i-offset];

                            if (entryToTest != null) {
                                // If we originally hit a null entry, pick up the first
                                // non null entry so we have something to actually write out.
                                if (entry == null) {
                                    entry = entryToTest;
                                    minDepth = offset;
                                    if (i-offset == 0) {
                                        isField = true;
                                    }
                                }
                                if (entry == entryToTest) {
                                    spannedColOffsets[colSpan] = offset;
                                    minDepth = Math.min(offset, minDepth);
                                } else {
                                    foundMismatch = true;
                                }
                                break;                                
                            } 
                        }
                        if (foundMismatch) {
                            break;
                        }
                        spanningColNum ++;
                        
                        colSpan++;
                    }
                    
                    // set rowSpan for the cell based on how deep we had to
                    // go to find a real entry (shift from zero to 1-based)
                    if (minDepth != null) {
                        rowSpan = minDepth+1;
                    }
                    
                    
                       
                    // For each column this entry spans, add markers indicating that
                    // we're handling this via TD with rowSpan and colSpan set (and
                    // clear out duplicate entries).
                    for (var spannedCols = 0; spannedCols < spannedColOffsets.length; 
                        spannedCols++) 
                    {
                    
                        var logicalColArray = logicalColumns[spannedCols + ii],
                            offset = spannedColOffsets[spannedCols];
                            
                        for (var spannedRows = 0; spannedRows <= offset; spannedRows++) {
                            
                            if (spannedCols == 0 && spannedRows == 0) {
                                logicalColArray[i-spannedRows] = entry;
                            } else if (spannedRows <= minDepth) {
                                logicalColArray[i - spannedRows] = "spanned";
                            } else {
                                logicalColArray[i - spannedRows] = null;
                            }
                        }
                    }
                    
                    // We don't expect to ever end up with a null entry - not sure
                    // how this could happen but log a warning
                    if (entry == null) {
                        this.logWarn("Error in getPrintHeaders() - unable to generate " +
                            "print header HTML from this component's specified headerSpans");
                    }
                
                    var align = "center",
                        cellValue;
                    
                    if (isField) {
                        align = entry.align || defaultAlign;
                        cellValue = this.getHeaderButtonTitle(entry.masterIndex);
                    } else {
                        cellValue = entry.title;
                    }

                    var cellStart = HTML.length;
                    
                    HTML[HTML.length] = "<TD class='";
                    HTML[HTML.length] = printHeaderStyle;
                    HTML[HTML.length] = "' align='";
                    HTML[HTML.length] = "center";
                    HTML[HTML.length] = "' rowSpan='";
                    HTML[HTML.length] = rowSpan;
                    HTML[HTML.length] = "' colSpan='";
                    HTML[HTML.length] = colSpan;
                    HTML[HTML.length] = "' "; 
                    var thisWidth = fieldWidths[(isField ? entry.masterIndex : ii)];
                    HTML[HTML.length] = "style='margin: 0px; padding: 0px; " +
                        "width:" + thisWidth + "px; height:" + printHeight + "px; " +
                        "border-width: 0px 1px 1px 0px;' "
                    ;
                    HTML[HTML.length] = ">";
                    HTML[HTML.length] = cellValue;
                    HTML[HTML.length] = "</TD>";
                    
                }
                    
                HTML[HTML.length] = "</TR>";
            }
        //         this.logWarn("\n\nGenerated print header HTML (including spans):" + HTML.join(""));
            
        } else {
        
            HTML = ["<TR HEIGHT=" + printHeight + ">"];

            var cellStartHTML = ["<TD CLASS='", printHeaderStyle, "' HEIGHT=" + printHeight + " ALIGN="].join(""),
                frozenCount = this.frozenBody ? this.frozenBody.fields.length : 0
            ;

            // Just iterate through the fields once, then assemble the HTML and return it.
            if (this.frozenBody) {
                for (var colNum = 0; colNum < frozenCount; colNum++) {
                    var field = this.frozenBody.fields[colNum];
                    if (!field) continue;
                    var align = field.align || defaultAlign;
                    //var width = field.width || this.getFieldWidth(colNum);
                    var width = fieldWidths[colNum];
                    var title = this.getHeaderButtonTitle(field.masterIndex);
                    HTML.addList([cellStartHTML, align, " style='margin: 0px; padding: 0px; " +
                        "width:" + width + "px; height:" + printHeight + "px; " +
                        "border-width: 0px 1px 1px 0px;'>", title, "</TD>"]);
                }
            }

            // Just iterate through the fields once, then assemble the HTML and return it.
            for (var colNum = 0; colNum < (endCol-frozenCount); colNum++) {
                var field = this.body.fields[colNum];
                if (!field) continue;
                var align = field.align || defaultAlign;
                //var width = field.width || this.getFieldWidth(colNum);
                var width = fieldWidths[colNum + frozenCount];
                HTML.addList([cellStartHTML, align, " style='width:" + width + "px;'>",
                                    this.getHeaderButtonTitle(field.masterIndex), "</TD>"]);
            }
            
            // Output the standard header row
            HTML[HTML.length] = "</TR>";
        }
        return HTML.join(isc.emptyString);
    },

    //> @attr calendarView.eventDragCanvasStyleName (CSSStyleName : "eventDragCanvas" : IR)
    // CSS class applied to the +link{calendarView.eventDragCanvas, eventDragCanvas}.
    //
    // @visibility calendar
    //<
    eventDragCanvasStyleName: "eventDragCanvas",
    
    //> @attr calendarView.eventDragCanvas (AutoChild Canvas : null : IR)
    // +link{Canvas} displayed while dragging or resizing an event in this view and styled
    // according to +link{calendarView.eventDragCanvasStyleName, eventDragCanvasStyleName}.
    //
    // @visibility calendar
    //<
    eventDragCanvasDefaults: {
        _constructor: "Canvas",
        width:1, height: 1,
        snapToGrid: false,
        autoDraw: false,
        moveWithMouse: false,
        dragAppearance: "target",
        visibility: "hidden",
        hideUsingDisplayNone: true,
        keepInParentRect: true,
        hoverMoveWithMouse: true,
        showHover: true,
        hoverDelay: 0,
        hoverProps: {
            overflow: "visible", 
            hoverMoveWithMouse: this.hoverMoveWithMouse
        },
        getHoverHTML : function () {
            var canvas = this.eventCanvas,
                event = canvas.event,
                props = canvas._dragProps
            ;
            if (!props) return;
            
            var startDate = props._lastStartDate,
                endDate = props._lastEndDate,
                newEvent = this.view.calendar.createEventObject(event, startDate, endDate,
                    props._lastLane, props._lastSublane)
            ;
            return this.view.calendar._getDragHoverHTML(this.view, newEvent);
        },
        setView : function (view) {
            this.view = view;
        },
        getEventPadding : function () {
            var cal = this.eventCanvas.calendar;
            return cal.useDragPadding ? cal.getLanePadding(this.view) : 0;
        },
        show : function () {
            if (this._supressShow) return;
            //this.logWarn("in show() - stacktrace: \n" + isc.EH.getStackTrace());
            return this.Super("show", arguments);
        },
        fillOverlapSlots: true,
        positionToEventCanvas : function (show) {
            if (this._suppressShow || !this.eventCanvas) {
                this.hide();
                return isc.EH.STOP_BUBBLING;
            }

            var canvas = this.eventCanvas,
                cal = canvas.calendar,
                view = this.view,
                left = view.getEventLeft(canvas.event) + this.getEventPadding(),
                top = canvas.getTop(),
                width = (view._getEventBreadth ? view._getEventBreadth(canvas.event) : canvas.getVisibleWidth()),
                height = canvas.getVisibleHeight(),
                props = canvas._dragProps
            ;

            if (this.fillOverlapSlots) {
                // cause the drag rect to fill the column's width, or the row's height - if 
                // there are sublanes, have the rect fill the sublane height or width
                if (view.isTimelineView()) {
                    
                    var row = canvas._dragProps._startRow;
                    top = view.body.getRowTop(row);
                    if (canvas.isIndicatorCanvas) {
                        // for indicators, show the drag rect at actual height (over all lanes)
                        height = canvas.getVisibleHeight();
                        props._fixedTop = true;
                    } else if (!props._useSublanes) {
                        height = view.getLaneHeight(row);
                    } else {
                        top += props._lastSublane.top;
                        height = props._lastSublane.height;
                    }
                } else {
                    
                    var col = canvas._dragProps._startCol;
                    left = view.body.getColumnLeft(col);
                    if (props._useLanes) {
                        if (!props._useSublanes) {
                            width = view.getLaneWidth(col);
                        } else {
                            left += props._lastSublane.left;
                            width = props._lastSublane.width;
                        }
                    } else {
                        width = view.body.getColumnWidth(col);
                    }
                }
            }
            
            if (this._resizing) {
                if (view.isTimelineView()) {
                    top = view.body.getRowTop(canvas._dragProps._startRow);
                } else {
                    left = view.body.getColumnLeft(canvas._dragProps._startCol);
                }
            }
            
            if (left<0) left = 0;
            
            this.moveTo(left, top);
            this.resizeTo(width, height);
            
            if (show) {
                if (!this.isDrawn()) this.draw();
                this.show();
                this.bringToFront();
            }
            
            //if (view.shouldShowDragHovers()) isc.Hover.show(this.getHoverHTML(), this.hoverProps);
            if (view.shouldShowDragHovers()) this.handleHover();
        },
        moveToEvent : function () {
            // no-op here to avoid automatic snapping to the wrong place
        },
        dragRepositionStart : function () {
            
            if (!this.eventCanvas) return isc.EH.STOP_BUBBLING;

            var canvas = this.eventCanvas,
                event = canvas.event,
                cal = canvas.calendar,
                view = this.view,
                gr = view.body
            ;

            // canDragEvent() also calls canEditEvent(), which checks both event and calendar
            if (!cal.canDragEvent(event, view)) return false;

            this._repositioning = true;

            var eventRow = gr.getEventRow(),
                rowTop = gr.getRowTop(eventRow),
                rowHeight = gr.getRowHeight(view.getRecord(eventRow), eventRow),
                eventLeft = view.getEventLeft(event) + 1,
                eventCol = gr.getEventColumn(eventLeft),
                columnLeft = gr.getColumnLeft(eventCol),
                columnWidth = gr.getColumnWidth(eventCol),
                offsetX = gr.getOffsetX() - canvas.getLeft(),
                offsetY = gr.getOffsetY() - canvas.getTop()
            ;

            var isTimeline = view.isTimelineView();
            
            var dp = canvas._dragProps = {};

            dp._isVertical = !isTimeline;

            dp._startRow = eventRow;
            dp._startCol = eventCol;
            dp._rowHeight = rowHeight;
            dp._colWidth = columnWidth;

            dp._startWidth = isTimeline ? view._getEventBreadth(event) : dp._colWidth;
            dp._startHeight = isTimeline ? dp._rowHeight : canvas.getVisibleHeight();
            dp._currentRow = eventRow;
            dp._currentCol = eventCol;
            dp._startOffsetX = offsetX;
            // make the startOffsetY the snap-positionm, not just the mosue position
            dp._startOffsetY = view.getRowTop(view.getEventRow(offsetY));
            
            dp._rowCount = Math.round(dp._startHeight / dp._rowHeight);
            dp._maxRow = view.data.getLength() - dp._rowCount;
            dp._maxTop = view.getRowTop(dp._maxRow);
            dp._maxLeft = isTimeline ? gr.getScrollWidth() - dp._startWidth :
                    gr.getColumnLeft(gr.fields.length-1);
            dp._maxCol = isTimeline ? gr.getEventColumn(dp._maxLeft) :
                    gr.fields.length - 1;
            
            dp._lastStartDate = cal.getEventStartDate(event);
            dp._lastEndDate = cal.getEventEndDate(event);

            dp._lastValidStartDate = dp._lastStartDate.duplicate();
            dp._lastValidEndDate = dp._lastEndDate.duplicate();

            dp._startMouseDate = view.getDateFromPoint() || dp._lastStartDate.duplicate();
            dp._lastMouseDate = dp._startMouseDate.duplicate();

            dp._useLanes = view.usesLanes() && !canvas.isIndicatorCanvas && !canvas.isZoneCanvas;
            if (dp._useLanes) {
                var lane = view.getLane(event[cal.laneNameField]),
                    sublane = !lane || !lane.sublanes ? null :
                        lane.sublanes.find(cal.laneNameField, event[cal.sublaneNameField])
                ;
                dp._startLane = lane;
                dp._lastLane = lane;
                dp._useSublanes = cal.useSublanes && lane && lane.sublanes && lane.sublanes.length > 0;
                dp._startSublane = sublane;
                dp._lastSublane = sublane;
                dp._lockLane = !cal.canEditEventLane(event, view);
                dp._lockSublane = !cal.canEditEventSublane(event, view);
            }

            this.positionToEventCanvas(true);

            return isc.EH.STOP_BUBBLING;
        },
        dragRepositionMove : function () {
            
            if (!this.eventCanvas) return isc.EH.STOP_BUBBLING;
            
            var canvas = this.eventCanvas,
                props = canvas._dragProps,
                event = canvas.event,
                cal = canvas.calendar,
                view = this.view,
                eventSnapPixels = cal.getSnapGapPixels(view),
                isTL = view.isTimelineView(),
                gr = view.body,
                lanePadding = this.getEventPadding(),
                // IndicatorCanvas sets this value in positionToEventCanvas
                fixedTop = props._fixedTop != null ? props._fixedTop : -1,
                fixedLeft = -1,
                fixedWidth = -1,
                fixedHeight = -1
            ;

            // if the mouse has been dragged out of the body-rows, just bail - this prevents an 
            // issue where dragging an event off the bottom of a vertical calendar (past midnight) 
            // could shift it to 00:00 in the same day
            if (gr.getEventRow() < 0) return;

            // do the same horizontally
            if (gr.getEventColumn() < 0) return;

            var newMouseDate = view.getDateFromPoint();
            if (!newMouseDate) return;
            
            var newMouseLane = view.getLaneFromPoint();
            if (props._useLanes && !newMouseLane) return;
            
            if (props._lastMouseDate && props._lastMouseDate.getTime() == newMouseDate.getTime() 
                && props._lastLane && props._lastLane == newMouseLane) return;

            if (props._useLanes) {
                //if (isTL) {
                    // handle top/height snapping for lanes and sublanes in timelines
                    var mouseLane = newMouseLane,
                        mouseSublane = props._useSublanes ? view.getSublaneFromPoint() : null
                    ;
                    
                    if (!mouseLane || view.isGroupNode(mouseLane)) {
                        mouseLane = props._lastLane;
                        mouseSublane = props._lastSublane;
                    } else {
                        if (props._lockLane) {
                            mouseLane = props._startLane;
                            if (props._useSublanes && 
                                    (props._lockSublane || !mouseLane.sublanes.contains(mouseSublane)))
                            {
                                // sublane locked, or mouseSublane isn't in the mouseLane 
                                // (because we changed it above)
                                mouseSublane = props._startSublane;
                            }
                        } else {
                            if (props._useSublanes) {
                                if (props._lockSublane) {
                                    // sublane locked - if there's a matching sublane in the new 
                                    // lane, use that - otherwise, revert to last lane and sublane
                                    var localSublane = mouseLane.sublanes ? 
                                          mouseLane.sublanes.find(cal.laneNameField, props._startSublane.name)
                                          : null
                                    ;
                                    if (localSublane) {
                                        // there's an appropriate sublane in the mouseLane - use it
                                        mouseSublane = localSublane;
                                    } else {
                                        // no appropriate sublane - use the last lane/sublane
                                        mouseLane = props._lastLane;
                                        mouseSublane = props._lastSublane;
                                    }
                                } else {
                                    // sublane isn't locked, but the current lane may not HAVE 
                                    // any sublanes - revert to last lane and sublane if not
                                    if (mouseLane != props._lastLane) {
                                        if (!mouseLane.sublanes) {
                                            mouseLane = props._lastLane;
                                            mouseSublane = props._lastSublane;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (isTL) {
                        var laneRecordIndex = view.getRecordIndex(mouseLane);
                        fixedTop = view.getRowTop(laneRecordIndex);
                        if (mouseSublane) fixedTop += mouseSublane.top;
                        fixedHeight = (mouseSublane ? mouseSublane.height : mouseLane.height);

                        props._currentRow = laneRecordIndex;
                    } else {
                        var laneRecordIndex = view.getLaneIndex(mouseLane.name);
                        fixedLeft = view.body.getColumnLeft(laneRecordIndex);
                        fixedWidth = view.getLaneWidth(mouseLane.name);
                        if (mouseSublane) {
                            fixedLeft += mouseSublane.left;
                            fixedWidth = mouseSublane.width;
                        }

                        props._currentCol = laneRecordIndex;
                    }
                    
                //}
            }

            // top/height -related
            var overRow = gr.getEventRow(),
                eventRow = Math.min(props._maxRow, 
                    (overRow < 0 ? 0 : overRow)),
                rowTop = gr.getRowTop(eventRow),
                mouseY = gr.getOffsetY(),
                snapY = Math.floor((Math.floor((mouseY - rowTop) / eventSnapPixels)) * eventSnapPixels),
                // the snapTop needs to be calculated by the event's position relative to the
                // mouse, not just by the mouse-position itself - this fixes an issue where 
                // starting a drag from anywhere in an eventCanvas would position the top of 
                // the event to the mouse - now the event will move relative to where you started dragging
                startDateRow = gr.getEventRow(mouseY - props._startOffsetY),
                snapTop = isTL ? rowTop : Math.min(props._maxTop, gr.getRowTop(startDateRow)),
                oldHeight = this.getVisibleHeight(),
                newHeight = oldHeight
            ;

            
            var delta = newMouseDate.getTime() - props._lastMouseDate.getTime(),
                multiplier = delta < 0 ? -1 : delta == 0 ? 0 : 1,
                snapGapDelta = Math.floor(Math.abs(delta) / view.getTimePerSnapGap("ms"))
            ;
            
            var dropStart = cal.addSnapGapsToDate(props._lastStartDate, view, snapGapDelta * multiplier);
            var dropEnd = cal.addSnapGapsToDate(props._lastEndDate, view, snapGapDelta * multiplier);

            var drawStartDate = dropStart.duplicate();
            var drawEndDate = dropEnd.duplicate();
            
            if (isTL) {
                if (dropStart.getTime() < view.startDate.getTime()) {
                    // actual start date is before the start of the visible timeline - when 
                    // drawing the drag target, extend it to the far left of the view
                    drawStartDate = view.startDate.duplicate();
                }
                if (dropEnd.getTime() > view.endDate.getTime()) {
                    // actual end date is after the end date of the visible timeline - when 
                    // drawing the drag target, extend it to the far right of the view
                    drawEndDate = view.endDate.duplicate();
                }
            }

            // left/width -related
            var eventCol = Math.min(props._maxCol, gr.getEventColumn()),
                columnLeft = gr.getColumnLeft(eventCol),
                offsetX = (gr.getOffsetX() - props._startOffsetX),
                tempLeft = Math.max(0, offsetX - ((offsetX - columnLeft) % eventSnapPixels) + 1),
                date = view.getDateFromPoint(tempLeft, snapTop, null, true),
                eventLeft = Math.min(props._maxLeft, 
                    (isTL ? cal.getDateLeftOffset(date, view) :
                                columnLeft)),
                eventRight = eventLeft + (isTL ? (props._startWidth) 
                        : canvas.getVisibleWidth())
            ;

            if (!isTL) {
                if (eventRow != props._currentRow) {
                    // rowNum has changed
                    if (eventRow < 0) {
                        // don't let day/week events be dragged off the top of the view
                        eventRow = 0;
                        snapTop = 0;
                    } else {
                        var tempBottom = rowTop + props._startHeight;
                        
                        var bottomRow = gr.getEventRow(rowTop + props._startHeight - props._rowHeight);
                        if (bottomRow < 0) {
                        //if (tempBottom > view.getScrollHeight()) {
                            // don't let day/week events be dragged off the bottom of the view
                            eventRow = props._currentRow;
                            snapTop = gr.getRowTop(eventRow);
                        } else {
                            props._currentRow = eventRow;
                        }
                    }
                }
            }
            
            var sizeToLane = view.isTimelineView() ? (fixedTop >= 0 && fixedHeight >= 0) :
                    (props._useLanes ? (fixedLeft >= 0 && fixedWidth >= 0) : false)
            if (!sizeToLane) {
                props._currentRow = eventRow;
            }
            
            if (eventCol != props._currentCol) {
                if (view.isDayView() || view.isWeekView()) {
                    if (view.usesLanes() && !cal.canEditEventLane(event, view)) {
                        // lanes in dayView
                        eventCol = props._currentCol;
                        eventLeft = props._previousLeft;
                    } else {
                        // dayView without lanes
                        if (eventCol == -1) props._currentCol = 0;
                        else if (eventCol == -2) props._currentCol = props._currentCol;
                        else props._currentCol = eventCol;
                        eventLeft = gr.getColumnLeft(props._currentCol);
                    }
                } else {
                    props._currentCol = Math.max(1, eventCol);
                }
            }

            var tempTop = Math.max(0, (fixedTop >= 0 ? fixedTop : snapTop)),
                tempBottom = Math.min(view.body.getScrollHeight(), tempTop + props._startHeight)
            ;

            // make sure the temp position is within the grid-body            
            if (tempTop < 0) {
                tempTop = 0;
                tempBottom = props._startHeight;
            } else if (tempBottom >= view.body.getScrollHeight()) {
                tempBottom = view.body.getScrollHeight();
                tempTop = tempBottom - props._startHeight;
            }

            if (!view.isTimelineView()) {
                
                dropStart = view.getDateFromPoint(eventLeft+1, tempTop+1);
                
                dropEnd = view.getDateFromPoint(eventRight - 1, tempBottom);
	            drawStartDate = dropStart.duplicate();
	            drawEndDate = dropEnd.duplicate();
            }

            if (view.isDayView() || view.isWeekView()) {
                // for vertical views, check if the dropEnd date is different - this indicates
                // a drop at the very bottom of the calendar - use the end of the dropStart
                // day instead
                if (dropStart.getDate() != dropEnd.getDate()) {
                    //dropEnd = isc.DateUtil.getEndOf(dropStart, "d");
                }
            }

            
            
            var testEndDate = dropEnd.duplicate();
            testEndDate.setTime(dropEnd.getTime()-1);

            var allowDrop = true;
            
            // fire the cancellable notification method before actually moving the dragTarget
            var newEvent = cal.createEventObject(event, dropStart, testEndDate, 
                    mouseLane && mouseLane.name, 
                    mouseSublane && mouseSublane.name)
            ;
            // the default implementation of this method checks disabled dates
            allowDrop = cal.eventRepositionMove(event, newEvent, this);

            

            if (sizeToLane) {
                if (isTL) {
                    tempTop = fixedTop;
                    props._previousHeight = fixedHeight;
                    
                    // recalc eventLeft and width from the calculated drawStart/EndDate
                    eventLeft = view.getDateLeftOffset(drawStartDate);
                    // TODO: changed to RightOffset - revisit for an event which has just been created - shows 1 snap too wide, but dates are correct
                    eventRight = view.getDateRightOffset(drawEndDate);
                    props._startWidth = eventRight - eventLeft;
                    
                    this.resizeTo(props._startWidth, fixedHeight);
                } else {
                    eventLeft = fixedLeft;
                    props._previousWidth = fixedWidth;
                    this.resizeTo(fixedWidth, null);
                }
                props._lastSublane = mouseSublane;
                props._lastLane = mouseLane;
            } else{
                if (tempTop + newHeight > view.body.getScrollHeight()-1) {
                    newHeight = view.body.getScrollHeight() - 1 - tempTop;
                }
                props._previousHeight = newHeight;
                this.resizeTo(null, newHeight);
            }

            props._previousTop = tempTop;
            props._previousLeft = eventLeft;

            //isc.logWarn("last start/end dates:\n" + 
            //    props._lastStartDate + " / " + props._lastEndDate + "\n" +
            //    "new start/end dates:\n" + 
            //    dropStart + " / " + dropEnd + "\n"
            //);
            
            props._lastStartDate = dropStart.duplicate();
            props._lastEndDate = dropEnd.duplicate();
            
            // store the mouse date - this is used when dragRepositioning to calculate the new 
            // start and end dates in order to deal with events that extend beyond the 
            // accessible timeline
            props._lastMouseDate = newMouseDate.duplicate();
            
            if (allowDrop) {
                props._lastValidStartDate = dropStart.duplicate();
                props._lastValidEndDate = dropEnd.duplicate();
                this.setDragCursor("default");
            } else {
                this.setDragCursor("not-allowed");
            }

            this.moveTo(props._previousLeft, props._previousTop);
            
            if (view.shouldShowDragHovers()) isc.Hover.show(this.getHoverHTML(), this.hoverProps);
            
            return isc.EH.STOP_BUBBLING;
        },
        dragRepositionStop : function () {
            
            if (!this.eventCanvas) return isc.EH.STOP_BUBBLING;
            
            var canvas = this.eventCanvas,
                props = canvas._dragProps,
                cal = canvas.calendar,
                view = this.view,
                gr = view.body,
                event = canvas.event
            ;

            // hide the Hover and the manual dragTarget before calling the cancellable 
            // eventRepositionStop() event below
            if (view.shouldShowDragHovers()) isc.Hover.hide();
            this.hide();

            // cancel the drop if the cursor is "not-allowed" and there's no previous 
            // valid drop location
            var cancelDrop = (this.cursor == "not-allowed" && cal.eventUseLastValidDropDates != true);

            // reset the cursor in case we changed it during a drag
            this.setDragCursor("default");

            // bail if cancelDrop is true
            if (cancelDrop) return;

            var isIndicator = canvas.isIndicatorCanvas;

            var canEditLane = props._useLanes && cal.canEditEventLane(event, view),
                canEditSublane = props._useLanes && cal.canEditEventSublane(event, view),
                newLane,
                newSublane
            ;
            
            if (!isIndicator) {
                if (view.isTimelineView()) {
                    if (canEditLane || canEditSublane) {
                        if (canEditLane) newLane = props._lastLane.name;
                        if (canEditSublane && cal.useSublanes && props._lastSublane) {
                            newSublane = props._lastSublane.name;
                        }
                    }
                } else if (view.usesLanes()) {
                    if (canEditLane || canEditSublane) {
                        if (canEditLane) newLane = props._lastLane.name;
                        if (canEditSublane && cal.useSublanes && props._lastSublane) {
                            newSublane = props._lastSublane.name;
                        }
                    } else return false;
                }

                // the props object has _lastValidStartDate - which, for a drag-move, will be on 
                // a snapGap - and _lastValidEndDate, which represents the _lastValidStartDate 
                // plus the original length of the event, and might not be on a snapGap
                var actualEndDate = new Date(props._lastValidEndDate.getTime());
                var dates = [ props._lastValidStartDate.duplicate(), actualEndDate ];

                // minsDiff = difference in minutes between new start date and old start date
                var deltaMillis = dates[0].getTime() - cal.getEventStartDate(event).getTime(),
                    minsDiff = Math.floor(deltaMillis / (1000 * 60)),
                    otherFields = {}
                ;
                if (view.isTimelineView()) {
                    // adjust leading and trailing dates by minsDiff amount of minutes. 
                    if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                        dates.add(event[cal.leadingDateField].duplicate());
                        dates[2].setMinutes(dates[2].getMinutes() + minsDiff);
                        dates.add(event[cal.trailingDateField].duplicate());
                        dates[3].setMinutes(dates[3].getMinutes() + minsDiff);
                        otherFields[cal.leadingDateField] = dates[2];
                        otherFields[cal.trailingDateField] = dates[3];
                    }
                }
                
                if (newLane == null) newLane = event[cal.laneNameField];
            
                // step 2 adjust initial drop dates, via overridden method 
                if (cal.adjustEventTimes) {
                    var adjustedTimes = cal.adjustEventTimes(event, canvas, dates[0], dates[1], newLane);
                    if (adjustedTimes) {
                        dates[0] = adjustedTimes[0].duplicate();
                        dates[1] = adjustedTimes[1].duplicate();
                    }
                }

                // step 3 adjust modified drop dates so no overlapping occurs
                if (cal.allowEventOverlap == false) {
                    var repositionedDates = cal.checkForOverlap(view, canvas, event, dates[0], dates[1], newLane); 

                    //TODO: this code is still timeline specific
                    if (repositionedDates == true) {
                        // event overlaps in such a way that dropping anywhere near this location would
                        // be impossible
                        if (cal.timelineEventOverlap) {
                            cal.timelineEventOverlap(false, event, canvas, dates[0], dates[1], newLane);
                        }
                        return false;   
                    } else if (isc.isAn.Array(repositionedDates)){
                       dates[0] = repositionedDates[0].duplicate();
                       dates[1] = repositionedDates[1].duplicate();
                       if (cal.timelineEventOverlap) { 
                           cal.timelineEventOverlap(true, event, canvas, dates[0], dates[1], newLane);
                       }
                       
                    }
                    // otherwise don't do anything, as no overlap occurred
                }

                // don't update the end date on duration events
                if (cal.isZeroLengthEvent(event)) dates[1] = null;

                // if an overlap-resulting drop was disallowed, the dates may have changed - update
                // the stored drag props as necessary
                if (dates[0] != props._lastValidStartDate) props._lastValidStartDate = dates[0];
                if (dates[1] != props._lastValidEndDate) props._lastValidEndDate = dates[1];
            } else {
                props._lastValidEndDate = props._lastValidStartDate;
            }

            var tempEvent = isc.addProperties({}, event, otherFields);

            // build the new event as it would be after the drop
            var newEvent = cal.createEventObject(tempEvent, props._lastValidStartDate, props._lastValidEndDate, 
                    props._lastLane && props._lastLane.name, 
                    props._lastSublane && props._lastSublane.name);

            if (cal.getEventStartDate(tempEvent).getTime() == cal.getEventStartDate(newEvent).getTime()) {
                if (!view.usesLanes() || tempEvent[cal.laneNameField] == newEvent[cal.laneNameField]) {
                    // if the event was dropped exactly where it started, just ignore the drag
                    return;
                }
            }

            
            var continueUpdate = cal.eventRepositionStop(event, newEvent, otherFields, this);
            
            this._repositioning = false;

            if (continueUpdate != false) {
                if (!isIndicator) {
                    // fire the separate moved variants, which are deprecated 
                    if (view.isTimelineView()) {
                        // step 4 fire timelineEventMoved notification to allow drop cancellation
                        if (cal.timelineEventMoved(event, props._lastValidStartDate, props._lastValidEndDate, 
                                newLane) == false) return false;
                    } else {
                        // step 4 fire eventMoved notification to allow drop cancellation
                        if (cal.eventMoved(props._lastValidStartDate, event, newLane) == false) return false;
                    }
                
                    // finally update event
                    //isc.logWarn('updating event:' + [event[cal.startDateField], event[cal.endDateField]]);
                    cal.updateCalendarEvent(event, newEvent, otherFields);
                } else {
                    var indicator = cal.indicators.find(cal.nameField, event[cal.nameField]);
                    indicator[cal.startDateField] = props._lastValidStartDate;
                    // no need to refresh all events - if the indicator is dragged out of the 
                    // viewport, the grid will scroll and that already refreshes events - here, 
                    // just the indicators and zones need redrawing, which is much quicker - 
                    // order is important - see calendar.showIndicatorsInFront
                    canvas.calendarView.drawIndicators();
                    canvas.calendarView.drawZones();
                }
            }

            delete canvas._dragProps;
            
            //return false;
            return isc.EH.STOP_BUBBLING;
        },
        
        
        handleDragResizeStart : function () {
            var canvas = this.eventCanvas,
                event = canvas.event,
                cal = canvas.calendar,
                view = this.view,
                gr = view.body
            ;

            if (!cal.canResizeEvent(canvas.event, view)) return false;

            this._resizing = true;

            var eventRow = gr.getEventRow(),
                rowTop = gr.getRowTop(eventRow),
                rowHeight = gr.getRowHeight(view.getRecord(eventRow), eventRow),
                eventCol = gr.getEventColumn(),
                colLeft = gr.getColumnLeft(eventCol),
                colWidth = gr.getColumnWidth(eventCol),
                offsetX = gr.getOffsetX() - canvas.getLeft(), // - this.getEventPadding(),
                offsetY = gr.getOffsetY() - canvas.getTop(),
                eventWidth = canvas.getVisibleWidth(),
                usesLanes = view.usesLanes(),
                isTimeline = view.isTimelineView(),
                // leftDrag if its a timeline and offsetX is nearer left than right
                isLeftDrag = isTimeline && (offsetX < eventWidth / 2),
                lane = usesLanes ? view.getLaneFromPoint() : null,
                sublane = lane && cal.useSublanes ? cal.getSublaneFromPoint() : null
            ;

            var props;
            if (isTimeline) {
                props = {
                    _startRow: eventRow,
                    _startCol: eventCol,
                    _useLanes: view.usesLanes(),
                    _useSublanes: cal.useSublanes,
                    _previousLeft: view.getDateLeftOffset(cal.getEventStartDate(event)),
                    _previousRight: canvas.getLeft() + eventWidth,
                    _previousTop: rowTop + (sublane ? sublane.top : 0),
                    _previousHeight: sublane ? sublane.height : lane.height,
                    _previousWidth: canvas.getVisibleWidth(),
                    _leftDrag: isLeftDrag,
                    _rightDrag: !isLeftDrag,
                    _lastStartDate: cal.getEventStartDate(canvas.event),
                    _lastEndDate: cal.getEventEndDate(canvas.event),
                    _lastLane: lane,
                    _lastSublane: sublane
                };
            } else {
                // vertical views
                props = {
                    _startRow: eventRow,
                    _startCol: eventCol,
                    _useLanes: view.usesLanes(),
                    _useSublanes: cal.useSublanes,
                    _previousLeft: colLeft + (usesLanes && sublane ? sublane.left : 0),
                    _previousRight: canvas.getLeft() + eventWidth,
                    _previousTop: canvas.getTop(),
                    _previousHeight: canvas.getVisibleHeight(),
                    _previousWidth: (sublane ? sublane.width : 
                        (lane && view.getLaneWidth ? view.getLaneWidth(event[cal.laneNameField]) 
                        : colWidth)
                    ),
                    _bottomDrag: true,
                _lastStartDate: cal.getEventStartDate(canvas.event),
                _lastEndDate: cal.getEventEndDate(canvas.event),
                _lastLane: lane,
                _lastSublane: sublane
            };
            }

            if (props._previousTop == -1) {
                //TODO: fix this - event partly off the top of the viewport shows at top:0
                // this is to do with keepInParentRect, of course
                props._previousTop = 0;
                props._previousHeight -= gr.getScrollTop();
            }
            
            canvas._dragProps = props;
            this.positionToEventCanvas(true);
            
            props._invalidDrop = false;
            
            return isc.EH.STOP_BUBBLING;
        },

        dragResizeMove : function () {
            var canvas = this.eventCanvas,
                props = canvas._dragProps,
                event = canvas.event,
                cal = canvas.calendar,
                view = this.view,
                top = props._previousTop, 
                left = props._previousLeft, 
                height = props._previousHeight, 
                width = props._previousWidth,
                startDate = props._lastStartDate, 
                endDate = props._lastEndDate,
                utils = isc.DateUtil
            ;
            var mouseSnap = view.getSnapData(null, null, null, true, null, props._bottomDrag);
            var snapDate;
            if (props._bottomDrag) {
                snapDate = view.getDateFromPoint();
                // day/week view bottom drag - snapDate is new endDate, only height changes -
                // its more natural to use the snapDate AFTER (below) the mouse offset when 
                // bottom-dragging, so the drag rect includes the snapDate that's actually 
                // under the mouse
                endDate = cal.addSnapGapsToDate(snapDate, view, 1);
                var lStart = isc.DateUtil.getLogicalDateOnly(startDate);
                var lEnd = isc.DateUtil.getLogicalDateOnly(endDate);
                // start and end are in different logical days
                if (lStart.getDate() != lEnd.getDate()) {
                    // endDate is the end of the logical start-date (in the current locale)
                    endDate = isc.DateUtil.getEndOf(lStart, "D", false);
                }
                var bottom = view.getDateTopOffset(endDate);
                height = bottom - top;
            } else if (props._leftDrag) {
                // timeline left drag - snapDate is new startDate, only left and width change
                snapDate = mouseSnap && mouseSnap.startDate.duplicate(); 
                if (!snapDate) snapDate = view.startDate.duplicate();
                startDate = snapDate;
                var right = left + width;
                if (event[cal.durationField] != null) {
                    var millis = endDate.getTime() - startDate.getTime(),
                        timeUnit = event[cal.durationUnitField],
                        unitMillis = utils.getTimeUnitMilliseconds(timeUnit)
                    ;
                    if (millis % unitMillis != 0) {
                        var units = Math.round(utils.convertPeriodUnit(millis, "ms", timeUnit)),
                        startDate = utils.dateAdd(endDate, timeUnit, units * -1,
                            null, null, null, this.firstDayOfWeek);
                    }
                }
                var vStartSnap = view.getSnapData(null, null, startDate);
                var left = vStartSnap.startLeftOffset;
                width = (right - left);
            } else {
                // timeline right drag - endDate is the endDate of the snapGap under the mouse
                snapDate = mouseSnap && mouseSnap.endDate.duplicate();
                if (!snapDate) snapDate = view.endDate.duplicate();

                endDate = snapDate.duplicate();
                var visibleEnd = cal.getVisibleEndDate(view);
                if (endDate.getTime() > visibleEnd.getTime()) {
                    endDate.setTime(visibleEnd.getTime());
                }
                if (event[cal.durationField] != null) {
                    var millis = endDate.getTime() - startDate.getTime(),
                        timeUnit = event[cal.durationUnitField],
                        unitMillis = utils.getTimeUnitMilliseconds(timeUnit)
                    ;
                    if (millis % unitMillis != 0) {
                        var units = Math.round(utils.convertPeriodUnit(millis, "ms", timeUnit)),
                        endDate = utils.dateAdd(startDate, timeUnit, units,
                            null, null, null, this.firstDayOfWeek);
                    }
                }
                // size to the start of the startSnap and end of the endSnap
                var vStartSnap = view.getSnapData(null, null, startDate);
                var vEndSnap = view.getSnapData(null, null, endDate);
                // if the event starts before the timeline range, clamp left at zero
                var left = vStartSnap ? vStartSnap.startLeftOffset : 0,
                    right = vEndSnap.endLeftOffset
                ;
                width = right-left;
            }

            if (endDate.getTime() <= startDate.getTime() || width <= 0 || height <= 0) {
                // invalid endDate, earlier than start date - just disallow - should leave the
                // default minimum size (the eventSnapPixels)
                return isc.EH.STOP_BUBBLING;
            }
            

            // call eventResizeMove
            var newEvent = cal.createEventObject(event, startDate, endDate);
            var allowResize = cal.eventResizeMove(event, newEvent, view, props);

            
            props._lastStartDate = startDate;
            props._lastEndDate = endDate;
            props._previousTop = top;
            props._previousLeft = left;
            props._previousWidth = width;
            props._previousHeight = height;

            this.setRect(props._previousLeft, props._previousTop,
                props._previousWidth, props._previousHeight);

            if (allowResize != false) {
                props._invalidDrop = false;
                props._lastValidStartDate = startDate.duplicate();
                props._lastValidEndDate = endDate.duplicate();
                this.setDragCursor("default");
            } else {
                props._invalidDrop = true;
                this.setDragCursor("not-allowed");
            }

            if (view.shouldShowDragHovers()) isc.Hover.show(this.getHoverHTML(), this.hoverProps);

            return isc.EH.STOP_BUBBLING;
        },
        
        setDragCursor : function (newCursor) {
            var cursor = this.getCurrentCursor();
            if (cursor == newCursor) return;
            this.setCursor(newCursor);
            this.eventCanvas.setCursor(newCursor);
            this.view.setCursor(newCursor);
            if (this.view.body) this.view.body.setCursor(newCursor);
            if (this.view.frozenBody) this.view.frozenBody.setCursor(newCursor);
            if (isc.EH.lastEvent && isc.EH.lastEvent.target && isc.EH.lastEvent.target.setCursor) {
                isc.EH.lastEvent.target.setCursor(newCursor);
            }
        },

        // eventWindow_dragResizeStop
        dragResizeStop : function () {
            var canvas = this.eventCanvas,
                props = canvas._dragProps,
                cal = canvas.calendar,
                view = this.view,
                event = canvas.event,
                startDate = props._lastValidStartDate,
                endDate = props._lastValidEndDate
            ;
            if (props._invalidDrop && !cal.eventUseLastValidDropDates) {
                
                startDate = null;
                endDate = null;
            }
            
            //this.logWarn("LastValid start/end: " + startDate + " -- " + endDate);

            // reset the cursor in case we changed it during a drag
            this.setDragCursor("default");

            // hide the dragHover, if there was one, and the manual dragTarget 
            if (view.shouldShowDragHovers()) isc.Hover.hide();
            this.hide();

            if ((props._leftDrag && !startDate) || (props._rightDrag && !endDate)) {
                // if left-dragging and no valid startDate, or right-dragging and no 
                // valid endDate, bail 
                this._resizing = false;
                return isc.EH.STOP_BUBBLING;
            }
            
            // build the new event as it would be after the drop
            var newEvent = cal.createEventObject(event, startDate, endDate);
            if (event[cal.durationField] != null) {
                // the event is a duration - force the new length of the event to the nearest
                // durationUnit, so there aren't fractional durations
                var millis = endDate.getTime() - startDate.getTime();
                var roundedDuration = Math.round(
                        isc.DateUtil.convertPeriodUnit(millis, "ms", event[cal.durationUnitField])
                );
                // update the duration
                newEvent[cal.durationField] = roundedDuration;
                // recalc the end date, based on the new duration
                endDate = props._lastValidEndDate = cal.getEventEndDate(newEvent);
                newEvent[cal.endDateField] = endDate;
            }

            if (cal.getEventStartDate(event).getTime() == cal.getEventStartDate(newEvent).getTime()
                && cal.getEventEndDate(event).getTime() == cal.getEventEndDate(newEvent).getTime())
            {
                // if newEvent has the same dates as the current event, just ignore the drag
                return;
            }

            if (view.isTimelineView()) {
                // update leading and trailing dates after a drag-resize
                if (props._leftDrag && event[cal.leadingDateField]) {
                    var leadingDate = event[cal.leadingDateField].duplicate();
                    // get difference in minutes
                    var diff = isc.DateUtil.getPeriodLength(
                            event[cal.startDateField], newEvent[cal.startDateField], "mn");
                    leadingDate.setMinutes(leadingDate.getMinutes()+diff);
                    newEvent[cal.leadingDateField] = leadingDate;
                }
                if (!props._leftDrag && event[cal.trailingDateField]) {
                    var trailingDate = event[cal.trailingDateField].duplicate();
                    // get difference in minutes
                    var diff = isc.DateUtil.getPeriodLength(
                            event[cal.endDateField], newEvent[cal.endDateField], "mn");
                    trailingDate.setMinutes(trailingDate.getMinutes()+diff);
                    newEvent[cal.trailingDateField] = trailingDate;
                }
            }
            
            
            var continueUpdate = cal.eventResizeStop(event, newEvent, null, this);

            if (continueUpdate != false) {
                // Added undoc'd endDate param - is necessary for Timeline items because they can be 
                // stretched or shrunk from either end
                if (view.isTimelineView()) {
                    // step 4 fire timelineEventMoved notification to allow drop cancellation
                    if (cal.timelineEventResized(event, startDate, endDate) == false) return false;
                } else {
                    // step 4 fire eventMoved notification to allow drop cancellation
                    if (cal.eventResized(endDate, event) == false) return false;
                }

                //isc.logWarn('dragResizeStop:' + [startDate, endDate]);
                cal.updateCalendarEvent(event, newEvent);
            }

            this._resizing = false;
            //delete canvas._dragProps;
            return isc.EH.STOP_BUBBLING;
        }
    },

    scrolled : function () {
        if (this.shouldShowColumnLayouts()) return;
        if (this.renderEventsOnDemand && this.refreshVisibleEvents) {
            delete this._cache.viewportStartMillis;
            delete this._cache.viewportEndMillis;
            this.delayedRefreshVisibleEvents(null, "scrolled");
        }
    },

    resized : function (deltaX, deltaY, reason ) {
        // update the cellHeight to fill the current viewport height
        if (this.calendar.showWorkday  && !this.isMonthView()) {
            this.cacheWorkdayRowHeight();
            this.markForRedraw();
        }

        var result;

        //var result = this.Super('resized', arguments);
        
        if (this.renderEventsOnDemand) {
            if (!this._updatingRecordComponents && this.isDrawn()) {
                //for (var key in this._usedCanvasMap) {
                //    this._allCanvasMap[key].needsResize = true;
                //}
                if (this.shouldShowColumnLayouts()) {
                    this.updateColumnLayouts();
                } else {
                    //this.delayedRefreshVisibleEvents(null, "resized - " + reason);
                    this.refreshVisibleEvents(null, "resized - " + reason);
                }
                //this.logInfo("Calendar " + this.viewName + " view resized - reason is '" + 
                //    (reason || "no reason") + " -- w/h is " + this.body.getVisibleWidth() + "/" + 
                //    this.body.getVisibleHeight(), "calendar"
                //);
            }
        } else if (this.shouldShowColumnLayouts()) {
            this.updateColumnLayouts();
        }
        return result;
    },

    forceDataSort : function (data, ignoreDataChanged) {
        var cal = this.calendar,
            specifiers = []
        ;
        
        if (this.usesLanes()) {
            specifiers.add({ property: cal.laneNameField, direction: "ascending" });
        }

        if (cal.overlapSortSpecifiers) {
            specifiers.addList(cal.overlapSortSpecifiers);
        } else {
            specifiers.add({ property: cal.startDateField, direction: "ascending" });
        }

        if (ignoreDataChanged || !data) {
            if (!data) data = this.getEventData();
            //cal._ignoreDataChanged = true;
        }

        data.setSort(specifiers);
    },

    findEventsInRange : function (startDate, endDate, lane, data) {
        var cal = this.calendar,
            range = {},
            useLane = lane != null && this.usesLanes()
        ;
        range[cal.startDateField] = startDate;
        range[cal.endDateField] = endDate;
        if (useLane) range[cal.laneNameField] = lane;
        
        var events = this.findOverlappingEvents(range, range, [range], useLane, data, true);
        return events;
    },

    // realEvent is the actual event object, passed in so that we can exclude
    // it from the overlap tests. paramEvent is an object with date fields  - the third param
    // is an array of events to ignore 
    findOverlappingEvents : function (realEvent, paramEvent, excludeThese, useLanes, data, ignoreDataChanged) {
        var cal = this.calendar,
            dataPassed = data != null
        ;

        var events = dataPassed ? data : this.getEventData();
        
        if (!dataPassed) this.forceDataSort(events, ignoreDataChanged);
    
        var results = [],
            length = events.getLength(),
            paramStart = cal.getEventStartDate(paramEvent),
            paramEnd = cal.getEventEndDate(paramEvent)
        ;

        var rangeObj = {};
        
        var lane = useLanes ? realEvent[cal.laneNameField] : null,
            startIndex = 0;
        
        if (lane) startIndex = events.findIndex(cal.laneNameField, lane);
        if (startIndex < 0) return results;

        
        var isTimeline = this.isTimelineView();
        
        for (var i = startIndex; i < length; i++) {
            var event = events.get(i);
            if (!event) {
                isc.logWarn('findOverlappingEvents: potentially invalid index: ' + i);  
                break;
            }

            if (useLanes && event[cal.laneNameField] != lane) break;

            var excluded = false;
            if (excludeThese && excludeThese.length > 0) {
                for (var j=0; j<excludeThese.length; j++) {
                    if (cal.eventsAreSame(event, excludeThese[j])) {
                        excluded = true;
                        break;
                    }
            }
                if (excluded) continue;
            }

            if (isTimeline) {
                // if we're not showing lead-trail lines use start-endDate fields instead to 
                // determine overlap
                if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                    rangeObj[cal.leadingDateField] = paramEvent[cal.leadingDateField];
                    rangeObj[cal.trailingDateField] = paramEvent[cal.trailingDateField];

                    if (rangeObj[cal.trailingDateField] && this.endDate) {
                        if (rangeObj[cal.trailingDateField].getTime() > this.endDate.getTime()) {
                            rangeObj[cal.trailingDateField].setTime(this.endDate.getTime()-1)
                        }
                    }
                } else {
                    rangeObj[cal.startDateField] = paramStart;
                    rangeObj[cal.endDateField] = paramEnd;
                    if (rangeObj[cal.endDateField].getTime() > this.endDate.getTime()) {
                        rangeObj[cal.endDateField].setTime(this.endDate.getTime()-1)
                    }
                }
            } else {
                var dayStart = isc.DateUtil.getStartOf(paramEnd, "d", false).getTime(),
                    dayEnd = isc.DateUtil.getEndOf(paramStart, "d", false).getTime(),
                    eStartDate = cal.getEventStartDate(event),
                    eStart = eStartDate.getTime(),
                    eEndDate = cal.getEventEndDate(event),
                    eEnd = eEndDate.getTime()
                ;
                // if the event ends before or starts after the range, continue
                if (eStart > dayEnd || eEnd < dayStart) continue;
                // for the weekView, if an event starts before AND ends after the range, there's
                // no sensible column to draw it in - so ignore it for now...
                if (eStart < dayStart && eEnd > dayEnd) {
                    if (this.isWeekView()) continue;
                    eStart = dayStart;
                    
                }
                rangeObj[cal.startDateField] = paramStart;
                if (rangeObj[cal.startDateField].getTime() < dayStart) {
                    // the event starts on another day, and we don't support multi-day events -
                    // clamp the start of the range to the start of the day
                    rangeObj[cal.startDateField].setTime(dayStart)
                }
                rangeObj[cal.endDateField] = paramEnd;
                if (rangeObj[cal.endDateField].getTime() > dayEnd) {
                    // the event ends on another day, and we don't support multi-day events -
                    // clamp the end of the range to the end of the day
                    rangeObj[cal.endDateField].setTime(dayEnd)
                }
            }

            rangeObj[cal.laneNameField] = event[cal.laneNameField];

            if (this.eventsOverlap(rangeObj, event, useLanes)) { 
                //isc.logWarn('findOverlappingEvents:' + event.id); 
                results.add(event);
            }
        }
        
        return results;
    },

    eventsOverlap : function (rangeObject, event, sameLaneOnly) {
        var a = rangeObject, 
            aCache = a["_" + this.viewName] || {},
            b = event,
            bCache = b["_" + this.viewName] || {},
            cal = this.calendar,
            startField = cal.startDateField,
            endField = cal.endDateField
        ;
        
        if (sameLaneOnly && a[cal.laneNameField] != b[cal.laneNameField]) return false;
        
        if (this.isTimelineView()) {
            if (a[cal.leadingDateField] && b[cal.leadingDateField]) startField = cal.leadingDateField;
            if (a[cal.trailingDateField] && b[cal.trailingDateField]) endField = cal.trailingDateField;
        }

        // simple overlap detection logic: there can only be an overlap if 
        // neither region A end <= region B start nor region A start >= region b end.
        // No need to check other boundary conditions, this should satisfy all
        // cases: 1. A doesn't overlap B, A partially overlaps B, A is completely
        // contained by B, A completely contains B.
        // NOTE: using the equals operator makes the case where 
        // two dates are exactly equal be treated as not overlapping.
        var aStart =  a[startField], aEnd = a[endField] || cal.getEventEndDate(a);
        
        if (!aStart || !aEnd) return false;

        var aLeft = aStart.duplicate(), aRight = aEnd.duplicate(),
            bStart = b[startField], bEnd = b[endField] || cal.getEventEndDate(b),
            bLeft = bStart.duplicate(), bRight = bEnd.duplicate()
        ;
        
        if (this.isTimelineView()) {
            // if the event isn't accessible in the view, return false
            if (bStart.getTime() > this.endDate.getTime()) return false;
            if (bEnd.getTime() < this.startDate.getTime()) return false;
            
            // first test the dates themselves
            if (bLeft.getTime() < aRight.getTime() && bRight.getTime() > aLeft.getTime()) return true;
            
            
            if (bLeft.getTime() != aRight.getTime() && bRight.getTime() != aLeft.getTime()) {
                
                var minWidth = Math.round(cal.getSnapGapPixels(this));
                aLeft = aCache.snapStartLeftOffset || this.getDateLeftOffset(aStart);
                aRight = Math.max((aCache.snapEndLeftOffset || this.getDateRightOffset(aEnd)), 
                            aLeft);
                if (aRight-aLeft < minWidth) aRight = aLeft + minWidth;
                bLeft = bCache.snapStartLeftOffset || this.getDateLeftOffset(bStart);
                bRight = Math.max((bCache.snapEndLeftOffset || this.getDateRightOffset(bEnd)), 
                            bLeft);
                if (bRight-bLeft < minWidth) bRight = bLeft + minWidth;
            }
        }
        if (cal.equalDatesOverlap && cal.allowEventOverlap) {
            if ((aLeft < bLeft && aRight >= bRight && aLeft <= bRight) // overlaps to the left
                || (aLeft <= bRight && aRight > bRight) // overlaps to the right
                || (aLeft <= bLeft && aRight >= bRight) // overlaps entirely
                || (aLeft >= bLeft && aRight <= bRight) // is overlapped entirely
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            // b is event, a is range
            if (bLeft < aRight && bRight > aLeft) return true;
            return false;
            /*
            if ((aStart < bStart && aEnd > bStart && aEnd < bEnd) // overlaps to the left
                || (aStart < bEnd && aEnd > bEnd) // overlaps to the right
                || (aStart <= bStart && aEnd >= bEnd) // overlaps entirely
                || (aStart >= bStart && aEnd <= bEnd) // is overlapped entirely
            ) {
                return true;
            } else {
                return false;
            }
            */
        }
   
    },


    updateEventRange : function (event, range) {
        if (!isc.isAn.Object(range)) range = this.overlapRanges.ranges[range];
        
        var events = range.events;
        events.remove(event);
        this.updateOverlapRanges(events);
    },

    
    updateOverlapRanges : function (passedData) {
        var cal = this.calendar,
            rawData = passedData || this.getEventData(),
            ranges = this.overlapRanges || [],
            //ranges = [],
            dataLen = rawData.getLength(),
            isTimeline = this.isTimelineView(),
            // should we only detect overlaps by date if the events are in the same lane?
            useLanes = this.usesLanes(),
            // events on different days can currently only overlap if on the same date
            splitDates = !isTimeline,
            // the list of overlap ranges that were actually affected by the process, so the
            // ranges that need to be re-tagged
            touchedRanges = [],
            minDate = this.startDate,
            maxDate = this.endDate
        ;

        var data = (isc.isA.ResultSet(rawData) ? rawData.allRows : rawData);

        data.setProperty("tagged", false);
        data.setProperty("overlapProps", null);
        data.setProperty("slotNum", null);

        data.setSort([ 
            { property: cal.laneNameField, direction: "ascending" },
            { property: cal.startDateField, direction: "ascending" },
            { property: cal.endDateField, direction: "descending" }
        ]);

        for (var i=0; i<dataLen; i++) {
            var event = data.get(i);
            var eRange = { events: [event] };
            eRange[cal.startDateField] = cal.getEventStartDate(event);
            // clamp range-start
            if (eRange[cal.startDateField] < minDate) eRange[cal.startDateField] = minDate;

            eRange[cal.endDateField] = cal.getEventEndDate(event);
            // clamp range-end
            if (eRange[cal.endDateField] > maxDate) eRange[cal.endDateField] = isc.DateUtil.adjustDate(maxDate, "-1ms");
            eRange[cal.laneNameField] = eRange.lane = useLanes ? event[cal.laneNameField] : null;

            var addRange = true;

            for (var j=0; j<ranges.length; j++) {
                // event not for this range's lane
                if (eRange[cal.laneNameField] != ranges[j][cal.laneNameField]) continue;
                else {
                    // ends before or starts after the range
                    if (eRange[cal.endDateField].getDate() < ranges[j][cal.startDateField].getDate() || 
                        eRange[cal.startDateField].getDate() > ranges[j][cal.endDateField].getDate()) {
                        continue;
                    }
                }
                if (this.eventsOverlap(eRange, ranges[j], useLanes)) {
                    // merge the two ranges - the dates of the existing range are altered to 
                    // fully incorporate both ranges and events are copied over
                    this.mergeOverlapRanges(eRange, ranges[j]);
                        addRange = false;
                    }
                    if (!addRange) break;
                }
            if (addRange) {
                ranges.add(eRange);
                if (!touchedRanges.contains(eRange)) touchedRanges.add(eRange);
            }
        }

        for (i=0; i<ranges.length; i++) {
            var range = ranges[i];
            // set an overlapRangeId on the range - include the lane if set
            range.id = "range_" + i + "_" + this.viewName;
            if (range.lane) range.id += "_lane_" + range.lane;

            range.events.setProperty("overlapRangeId", range.id);

            // get the field for the range's logical date
            var field = this.getFieldFromDate(range[cal.startDateField], range[cal.laneNameField]);

            if (field) {
                // set the fieldName and colNum on each range - used in various methods like tagDayEvents(date)
                range.fieldName = field.name;
                range.colNum = field.masterIndex;
                if (field.endDate && field.endDate <= range.endDate) {
                    range.endDate = field.endDate.duplicate();
                }
            }
        }

        this.overlapRanges = ranges;

        return touchedRanges;
    },

    getTouchedOverlapRanges : function (startDate, endDate, lane) {
        if (!this.overlapRanges) this.overlapRanges = [];
        // return a list of all overlapRanges that touch the passed date range and lane
        // - existing ranges will never overlap each other, but multiple existing ranges 
        // might overlap the passed one (if, say, you drop a long event into a new day or 
        // lane that already has various separate overlapRanges)
        var addRange = true,
            cal = this.calendar,
            tR = this.overlapRanges,
            r = {},
            ranges = []
        ;
        
        r[cal.startDateField] = startDate;
        r[cal.endDateField] = endDate;
        r[cal.laneNameField] = lane;
        
        for (var k=0; k<tR.length; k++) {
            var range = tR[k];
            if (lane != null && range[cal.laneNameField] != lane) continue;
            var overlaps = this.eventsOverlap(r, range, true);
            if (overlaps) {
                ranges.add(range);
            }
        }
        return ranges;
    },
    
    mergeOverlapRanges : function (fromRanges, toRange) {
        // merge the passed fromRanges in the passed toRange - the toRange ends up spanning
        // the date extents and all events from each of the merged ranges
        if (!isc.isAn.Array(fromRanges)) fromRanges = [fromRanges];

        var cal = this.calendar, 
            b = toRange,
            start, end
        ;

        for (var i=0; i<fromRanges.length; i++) {
            var a = fromRanges[i];
            if (a[cal.leadingDateField] && b[cal.leadingDateField]) {
                start = cal.leadingDateField;
                end = cal.trailingDateField;
            } else {
                start = cal.startDateField;
                end = cal.endDateField;
            }
            // extend the toRange to fully incorporate the fromRange
            if (a[start] < b[start]) b[start] = a[start];
            if (a[end] > b[end]) b[end] = a[end];
            // increase toRange.totalSlots to fromRange.totalSlots, if thats greater
            if (a.totalSlots > b.totalSlots) b.totalSlots = a.totalSlots;
            // add the events in the fromRange to the toRange
            b.events.addList(a.events);
            b.events = b.events.getUniqueItems();
        }
    },
    getEventLaneIndex : function (event) {
        return this.getLaneIndex(event[this.calendar.laneNameField]);
    },
    getEventLane : function (event) {
        return this.getLane(event[this.calendar.laneNameField]);
    },
    hasOverlapRanges : function () { 
        // are there any overlap ranges?  should always be if there are any visible events in the range
        return this.overlapRanges != null && this.overlapRanges.length > 0;
    },
    getLaneOverlapRanges : function (laneName) {
        // return a list of the overlapRanges that exist for the passed lane
        if (!this.hasOverlapRanges()) return;
        var cal = this.calendar,
            ranges = [];
        this.overlapRanges.map(function (range) {
            if (range[cal.laneNameField] == laneName) ranges.add(range);
        });
        return ranges;
    },
    getDayOverlapRanges : function (date) {
        // return a list of the overlapRanges that exist for the passed date (column)
        if (!this.hasOverlapRanges()) return;
        var field = this.getFieldNameFromDate(date);
        if (field) return this.getColOverlapRanges(field);
    },
    getColOverlapRanges : function (colNum) {
        // return a list of the overlapRanges that exist for the passed column (lane or date)
        if (!this.hasOverlapRanges()) return;

        var ranges = [];
        if (isc.isAn.String(colNum)) {
            // colNum is a field-name
            ranges = this.overlapRanges.findAll("fieldName", colNum);
        } else {
            ranges = this.overlapRanges.findAll("colNum", colNum);
        }
        return ranges;
    },
    removeOverlapRanges : function (ranges) {
        // remove the passed list of overlapRanges in preparation for re-tagging
        if (!this.hasOverlapRanges() || !ranges) return;
        ranges.map(function (range) {
            // disassociate the events from the range
            range.events.setProperty("overlapRangeId", null);
        });
        this.overlapRanges.removeList(ranges);
    },
    getEventOverlapRange : function (event) {
        // get the single overlap range that this event appears in
        if (!this.hasOverlapRanges()) return;
        return this.overlapRanges.find("id", event.overlapRangeId);
    },
    getDateOverlapRange : function (date, lane) {
        // get the single overlap range, if any, that contains the passed date
        if (!this.hasOverlapRanges()) return;
        var cal = this.calendar,
            timeStamp = date.getTime()
        ;
        var ranges = this.overlapRanges.map(function (range) {
            if (timeStamp >= range[cal.startDateField].getTime() &&
                    timeStamp <= range[cal.endDateField].getTime() &&
                    (!lane || lane == range[cal.laneNameField]))
            {
                // this range starts before and ends after the passed date (and is in the 
                // correct lane, if one was passed in)
                return range;
            }
        });
        if (ranges) ranges.removeEmpty();
        return ranges && ranges.length && ranges[0] ? ranges[0] : null;
    },

    // recalculate the overlap ranges in a given lane (either vertical or horizontal) and 
    // re-render events appropriately
    retagLaneEvents : function (laneName) {
        if (!this.usesLanes()) return;

        var laneIndex = this.getLaneIndex(laneName);
        if (this.isTimelineView()) {
            this.retagRowEvents(laneIndex, true);
        } else {
            this.retagColumnEvents(laneIndex, true);
        }
    },

    // recalculate the overlap ranges in a given day (one vertical column, or multiple 
    // vertical lanes, if in dayView and showDayLanes is true
    retagDayEvents : function (date) {
        if (this.isTimelineView()) return;

        var field = this.getFieldFromDate(date);
        if (field) this.retagColumnEvents(field, false);
    },

    // recalculate the overlap ranges in a given column - might be a "day" or a vertical lane
    retagColumnEvents : function (colNum, isLane) {
        if (this.isTimelineView()) return;

        //this.logWarn("*** retagColumnEvents(" + colNum + ")");

        var field;
        if (isc.isA.Number(colNum)) {
            field = this.body.getField(colNum);
        } else {
            field = colNum;
            colNum = this.body.getFieldNum(field);
        }
        
        // 1) remove the ranges that appear in this column
        this.removeOverlapRanges(this.getColOverlapRanges(field.name));
        
        // 2) get a list of events that will be in this column
        var date = field.startDate;
        if (!date) return;
        var startDate = date,
            endDate = this.getCellEndDate(this.data.length-1, colNum)
        ;
        var events = this.findEventsInRange(startDate, endDate, (isLane ? field.name : null));

        // 3) re-tag and render those events
        this.renderEvents(events, isLane);
    },

    // recalculate the overlap ranges in a given row - only applicable to timelines
    retagRowEvents : function (rowNum) {
        if (!this.isTimelineView()) return;

        //this.logWarn("*** retagRowEvents(" + rowNum + ")");

        var cal = this.calendar,
            row;
        if (isc.isA.Number(rowNum)) {
            row = this.getRecord(rowNum);
        } else {
            row = rowNum;
            rowNum = this.isGrouped ? this.getGroupedRecordIndex() : this.getRecordIndex(row);
        }
        
        var laneName = row.name;
        
        // 1) remove the ranges that appear in this lane
        this.removeOverlapRanges(this.getLaneOverlapRanges(laneName));
        
        // 2) get a list of events that will be in this lane (only runs for timelines, rows are lanes)
        var startDate = this.startDate,
            endDate = this.endDate
        ;
        var events = this.findEventsInRange(startDate, endDate, laneName);

        // 3) re-tag and render those events
        this.renderEvents(events, true);
    },

    retagOverlapRange : function (startDate, endDate, lane) {
        // 1) get any existing ranges that touch the passed one, merge them together and
        // then use the extents of the resulting range to retag events
        var cal = this.calendar,
            touchedRanges = this.getTouchedOverlapRanges(startDate, endDate, lane),
            range = touchedRanges ? touchedRanges[0] : null,
            start = startDate.duplicate(),
            end = endDate.duplicate()
        ;

        if (range) {
            touchedRanges.removeAt(0);
            this.mergeOverlapRanges(touchedRanges, range);
            start = range[cal.startDateField];
            end = range[cal.endDateField];
            this.removeOverlapRanges(touchedRanges);
            this.removeOverlapRanges([range]);

            // 2) get the list of events that are in the (merged range's) date range and lane
            var events = this.findEventsInRange(start, end, lane, range.events);
        
            // 3) re-tag and render those events
            //this.renderEvents(range.events, (lane != null));
            this.renderEvents(events, (lane != null));
        } else {
            // 2) get the list of events that are in the (merged range's) date range and lane
            var events = this.findEventsInRange(start, end, lane, this.getEventData()); //cal.data);

            // 3) re-tag and render those events
            this.renderEvents(events, (lane != null));
        }
    },

    sortForRender : function (events) {
        
        var cal = this.calendar,
            specifiers = [];
        if (this.usesLanes()) {
            specifiers.add({ property: cal.laneNameField, direction: "ascending" });
        }
        if (cal.overlapSortSpecifiers) {
            specifiers.addList(cal.overlapSortSpecifiers);
        } else {
            if (!cal.showColumnLayouts) {
                // only sort by slotNum if overlapping is in use (not showing columnLayouts)
                specifiers.add({ property: "slotNum", direction: "ascending" });
            }
            specifiers.add({ property: cal.startDateField, direction: "ascending" });
        }
        events.setSort(specifiers);
    },
    renderEvents : function (events, isLane) {
        if (!events || events.length == 0) return;
        
        // tag the data - this causes sorting and building of overlapRanges for all of the 
        // passed events
        this.tagDataForOverlap(events, isLane);
        // sort the affected events to make zOrdering happen from left to right
        this.sortForRender(events);
        var cal = this.calendar,
            isTimeline = this.isTimelineView(),
            visibleLanes = isLane ? (isTimeline ? this.body.getVisibleRows() : this.body.getVisibleColumns()) : [],
            _this = this;
        for (var i=0; i<events.length; i++) {
            var event = events.get(i),
                props = event.overlapProps,
                laneIndex = isLane ? _this.getLaneIndex(event[cal.laneNameField]) : null
            ;
            if (!isLane || (laneIndex >= visibleLanes[0] && laneIndex <= visibleLanes[1])) {
                // size the eventCanvas for each passed event
                var canvas = this.getCurrentEventCanvas(event);
                if (canvas) {
                    if (canvas.setEvent) canvas.setEvent(event);
                    else canvas.event = event;
                    _this.sizeEventCanvas(canvas, false, "renderEvents");
                } else {
                    canvas = this.addEvent(event);
                }
            }
        };
    },

    //------------------------------------------------------    
    // range building and rendering stuff
    //------------------------------------------------------    

    sizeEventCanvas : function (canvas, forceRedraw, calledFrom) {
        if (!canvas || !canvas.event || Array.isLoading(canvas.event)) return;        

        if (this.shouldShowColumnLayouts()) {
            this.logInfo("sizeEventCanvas() called from " + calledFrom + " while " +
                "showColumnLayouts is true...");
            return;
        }

        var cal = this.calendar;
        if (cal == null) return;

        var event = canvas.event,
            isTimeline = this.isTimelineView(),
            isWeekView = this.isWeekView(),
            useLanes = this.usesLanes(),
            startDate = cal.getEventStartDate(event),
            endDate = cal.getEventEndDate(event)
        ;

        //this.logWarn("in sizeEventCanvas - " + isc.echoFull(canvas.getRect()));

        
        var hasRedrawFocus = canvas.hasFocus;
        // we have to reset the focus but WHERE DOES IT GET DRAWN???
        //if (forceRedraw) {
            //canvas.hide();
        //}

        var eTop, eLeft, eWidth, eHeight,
            laneIndex = useLanes ? this.getLaneIndex(event[cal.laneNameField]) : null,
            lane = useLanes ? this.getLane(event[cal.laneNameField]) : null,
            padding = cal.getLanePadding(this);
        ;

        if (isTimeline) {
            if (!lane) return;
            eHeight = this.getLaneHeight(lane);

            // calculate event width by the offsets of the start and end dates
            eWidth = Math.round(this._getEventBreadth(event));
            
            // minWidth is one snapGap, or zeroLengthEventWidth for zero-length duration events
            var minWidth = Math.round(cal.getSnapGapPixels(this));
            if (cal.isDurationEvent(event) && cal.getEventDuration(event) == 0) {
                minWidth = cal.zeroLengthEventSize + (padding * 2);
            }
            eWidth = Math.max(eWidth, minWidth);

            // calculate event left
            eLeft = this.getDateLeftOffset(startDate);
            
            eTop = this.getRowTop(laneIndex);

            if (padding > 0) {
                eTop += padding;
                eLeft += padding;
                eWidth -= (padding * 2);
                eHeight -= (padding * 2);
                // if the minWidth > sum of padding, reduce the minWidth
                if (minWidth > (padding * 2)) minWidth -= (padding * 2);
            }

            if (cal.eventsOverlapGridLines) {
                
                //if (eLeft > 0) {
                    eLeft -= 1;
                    eWidth += 1;
                //}
                    eTop -= 1;
                    eHeight += 1;
                }

            if (this.eventDragGap > 0) {
                eWidth = Math.max(this.eventDragGap, eWidth - this.eventDragGap);
            }
            
            eWidth = Math.max(eWidth, minWidth);
        } else {
            
            if (canvas._cacheValues) {
                delete canvas._cacheValues._innerHTML;
                delete canvas._cacheValues._headerHeight;
            }

            // create a new logical date, without converting anything
            var newStart = isc.DateUtil.createLogicalDate(
                    startDate.getFullYear(), startDate.getMonth(), startDate.getDate()
            );

            var colNum;
            if (this.isDayView()) {
                if (this.usesLanes()) colNum = laneIndex;
                else colNum = 0;
            } else {
                colNum = this.getColFromDate(newStart);
            }
            
            var colDate = this.getCellDate(0, colNum);
            eLeft = this.body.getColumnLeft(colNum);
            eWidth = this.body.getColumnWidth(colNum);
            
            var rowSize = this.body.getRowHeight(this.getRecord(1), 1),
                // if the event ends on the next day, render it as ending on the last hour of the 
                // current day
                spansDays = false,
                minsPerRow = this.getTimePerCell(),
                rowsPerHour = cal.getRowsPerHour(this),
                eHrs = null
            ;
            if (colDate && startDate.getTime() < colDate.getTime()) {
                newStart = colDate.duplicate();
                spansDays = true;
            }

            // detect different days with logical-dates
            var newEnd = isc.DateUtil.getLogicalDateOnly(endDate);
            var sameDay = isc.DateUtil.compareLogicalDates(newStart, newEnd) == 0;
            if (!sameDay) {
                newEnd = isc.DateUtil.getEndOf(newStart, "d", false);
                spansDays = true;
                eHrs = 24;
            }

            // use logicalTimes to cater for positioning with a custom display timezone
            var startTime = isc.DateUtil.getLogicalTimeOnly(startDate);
            var endTime = isc.DateUtil.getLogicalTimeOnly(endDate);

            if (eHrs == null) {
                // if endHours < startHours in the current displayTimezone, clamp to midnight
                // so we don't render off the bottom of vertical calendar-views
                if (endTime.getHours() < startTime.getHours()) eHrs = 24;
                // catch the case where the end of the event is on 12am, which happens when an
                // event is dragged or resized to the bottom of the screen
                else eHrs = endTime.getHours() == 0 && endTime.getMinutes() == 0 && sameDay ? 24 : endTime.getHours();
            }

            // use getRowTop() to get the top of the rows containing the start and end times
            eTop = this.getRowTop(startTime.getHours() * rowsPerHour);
            var eBottom = this.getRowTop(eHrs * rowsPerHour);

            eHeight = eBottom - eTop;

            eHeight -= 1;

            if (cal.showDayLanes) {
                if (padding > 0) {
                    eTop += padding;
                    eLeft += padding;
                    eWidth -= (padding * 2);
                    eHeight -= (padding * 2);
                }
            }

            var startMins = startTime.getMinutes();
            if (startMins > 0) {
                var startMinPixels = cal.getMinutePixels(startMins, rowSize, this);
                eHeight -= startMinPixels;
                eTop += startMinPixels;
            }

            if (endTime.getMinutes() > 0 && !spansDays) {
                eHeight += cal.getMinutePixels(endTime.getMinutes(), rowSize, this);
            }

            if (cal.eventsOverlapGridLines) {
                eLeft -= 1;
                eWidth += 1;
                eTop -= 1;
                eHeight += 1;
            }
            
            var scrollH = this.body.getScrollHeight();
            if (eTop+eHeight > scrollH) {
                eHeight = scrollH - eTop;
            }
            
        }

        var rectChanged = true;
        if (cal.useSublanes && lane && lane.sublanes) {
            this.sizeEventCanvasToSublane(canvas, lane, eLeft, eTop, eWidth, eHeight);
        } else {
            //if (doDebug) isc.logWarn('sizeEventCanvas:' + [daysFromStart, cal.startDate]);
            rectChanged = this.adjustDimensionsForOverlap(canvas, eLeft, eTop, eWidth, eHeight);
        }

        // update the canvas
        if (!canvas.isDrawn()) {
            canvas.draw();
        } else canvas.redraw();
        canvas.show();

        if (isTimeline && event != null) {
            // draw leading and trailing lines
            if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                if (canvas.leadingIcon) canvas.updateLeadingTrailingDates();
                // split this onto another thread so that ie doesn't pop the 
                // slow script warning. Applies to first draw only.
                else canvas.delayCall("updateLeadingTrailingDates");
            }
        }

        if (hasRedrawFocus && !canvas.hasFocus) {
            canvas.focus("restore calendar event focus after redraw");
        }
        
        delete canvas.needsResize;
    },

    /*
    getRowTop : function () {
        var result = this.Super("getRowTop", arguments);
        return result;
    },
    */
    
    adjustDimensionsForOverlap : function (canvas, left, top, width, height) {
        var cal = this.calendar,
            props = canvas.event.overlapProps
        ;
        if (!props) {
            //this.logWarn(canvas.event.name + " - no overlapProps");
            return;
       }
        var isTimeline = this.isTimelineView(),
            usePadding = this.useLanePadding(),
            padding = usePadding ? cal.getLanePadding(this) : 0,
            halfPadding = usePadding ? Math.floor(padding / 2) : 0,
            totalPadding = usePadding && props ? (props.totalSlots-1) * padding : 0
        ;

        if (props.slotNum == null) {
            props.slotNum = 1;
        }

        //isc.logWarn('adjustDimForOverlap:' + canvas.event.EVENT_ID + this.echoFull(props));
        //props = false;
        if (props && props.totalSlots > 0) {
            var slotSize;
            if (isTimeline) {
                
                slotSize = Math.floor((height-totalPadding) / props.totalSlots);
                height = slotSize;
                if (props.slotCount) {
                    height *= props.slotCount;
                    height += (props.slotCount-1) * padding;
                }
                if (props.totalSlots != 1) {
                    if (props.slotNum == props.totalSlots) height -= halfPadding;
                }
                top = top + Math.floor((slotSize * (props.slotNum - 1)));
                if (props.slotNum > 1) top += (padding * (props.slotNum-1));
                if (cal.eventOverlap && props._drawOverlap != false) {
                    if (props.slotNum > 1) {
                        top -= Math.floor(slotSize * (cal.eventOverlapPercent / 100));
                        height += Math.floor(slotSize * (cal.eventOverlapPercent / 100));
                    }
                }
            } else {
                slotSize = Math.floor((width-totalPadding) / props.totalSlots);
                width = slotSize;
                if (props.slotCount) {
                    width *= props.slotCount;
                    width += (props.slotCount-1) * padding;
                }
                if (props.totalSlots != 1) {
                    if (props.slotNum == props.totalSlots) width -= halfPadding;
                }
                left = left + Math.floor((slotSize * (props.slotNum - 1)));
                if (!cal.eventOverlap && props.slotNum > 1) left += (padding * (props.slotNum-1));
                if (cal.eventOverlap && props._drawOverlap != false) {
                    if (props.slotNum > 1) {
                        left -= Math.floor(slotSize * (cal.eventOverlapPercent / 100));
                        width += Math.floor(slotSize * (cal.eventOverlapPercent / 100));
                    }
                }
                // remove some width for the eventDragGap - do this after all the other 
                // manipulation to avoid percentage calculations returning different values
                var lastSlot = !props ? true :
                    (props.slotNum == props.totalSlots || 
                    (props.slotNum + props.slotCount) - 1 
                        == props.totalSlots)
                ;
                if (lastSlot) {
                    // leave an eventDragGap to the right of right-aligned events to allow 
                    // drag-creation of overlapping events
                    width -= cal.eventDragGap || 1;
                }
            }
        } else {
            if (isTimeline) {
            } else {
                // leave an eventDragGap to the right of right-aligned events to allow 
                // drag-creation of overlapping events
                width -= cal.eventDragGap || 1;
            }
        }
        // add a pixel of height to all overlapped events so that their borders are flush 
        if (cal.eventsOverlapGridLines) {
            if (isTimeline) {
                if (props && props.totalSlots > 1) height += 1
            } else {
                height += 1;
                if (props && props.slotNum > 0 && !cal.eventOverlap) {
                    width += 1;
                }
            }
        }

        var rect = canvas.getRect();
        if (rect[0] == left && rect[1] == top && rect[2] == width && rect[3] == height) {
            // if position and size haven't changed, bail before an unnecessary renderEvent(),
            // returning false to prevent an unnecessary markForRedraw()
            this.logDebug("Not resizing event '" + canvas.event.name + "'.");
            return false;
        }
        canvas.renderEvent(top, left, width, height);
        return true;
    },

    sizeEventCanvasToSublane : function (canvas, lane, left, top, width, height) {
        var cal = this.calendar,
            event = canvas.event,
            sublanes = lane.sublanes,
            sublaneIndex = sublanes.findIndex("name", event[this.calendar.sublaneNameField]),
            isTimeline = this.isTimelineView(),
            len = sublanes.length,
            padding = cal.getLanePadding(this),
            offset = 0
        ;

        // bail if no sublane (shouldn't happen)
        if (sublaneIndex < 0) return;
        
        for (var i=0; i<=sublaneIndex; i++) {
            if (i == sublaneIndex) {
                if (isTimeline) {
                    top += offset;
                    height = sublanes[i].height - padding;
                } else {
                    left += offset;
                    width = sublanes[i].width - padding;
                    if (left + width + 1 < this.body.getScrollWidth()) width += 1;
                    if (top + height + 1 < this.body.getScrollHeight()) height += 1;
                }
                break;
            }
            if (isTimeline) offset += sublanes[i].height;
            else offset += sublanes[i].width;
        }
        //canvas.padding = padding;
        if (sublaneIndex > 0 && padding > 0) {
            if (isTimeline) height -= Math.floor(padding / sublanes.length);
            else width -= Math.floor(padding / sublanes.length);
        }

        //if (cal.eventsOverlapGridLines) {
        //    if (overlapProps.totalSlots > 1) height += 1
        //}

        canvas.renderEvent(top, left, width, height);
    },

    getOverlapSlot : function (index, snapCount) {
        var slot = { slotNum: index, events: [], snapGaps: [] };
        for (var i=0; i<snapCount; i++) slot.snapGaps[i] = 0;
        return slot;
    },
    getSnapData : function (x, y, date, returnExtents, lane, isEndSnap) {
        var cal = this.calendar,
            snapMins = this.getTimePerSnapGap("mn"),
            snapPixels = this.getSnapGapPixels(0),
            snap = {}
        ;
        
        if (date == null) {
            // use the date at the passed co-ords (or the mouse)
            date = this.getDateFromPoint(x, y);
        }
        
        
        if (date != null) {
            var d = (isc.isA.Date(date) ? date.duplicate() : new Date(date)); 
            if (returnExtents) {
                // clamp the date if it's outside of the current range
                if (d.getTime() < this.startDate.getTime()) {
                    d = this.startDate.duplicate();
                } else if (d.getTime() > this.endDate.getTime()) {
                    d = this.endDate.duplicate();
                }
            }
            // start at the snap before (date + 1ms is between snaps) - but don't do this if
            // d == view.endDate, because that puts the date outside of the range by a ms, 
            // immediately after the code above deals with that situation
            if (!isEndSnap && d.getTime() < this.endDate.getTime()) d.setTime(d.getTime()+1);
            snap.startTopOffset = this.getDateTopOffset(d, lane);

            // end at the snap after (start + snapMins)
            var end = isc.DateUtil.dateAdd(d, "mn", snapMins);
            if (d.getDate() == end.getDate()) {
                snap.endTopOffset = this.getDateTopOffset(end, lane);
            } else {
                snap.endTopOffset = this.body.getScrollHeight();
            }
            // index is (startTopOffset / snapMins)
            snap.index = Math.floor(snap.startTopOffset / snapPixels);
            // startDate is getDateFromPoint(null, startTopOffset)
            snap[cal.startDateField] = this.getDateFromPoint(null, snap.startTopOffset);
            // startDate is getDateFromPoint(null, startTopOffset)
            snap[cal.endDateField] = this.getDateFromPoint(null, snap.endTopOffset);
        }
        
        return snap;
    },

    tagDataForOverlap : function (data, lane) {
        data = data || this.getEventData();
        if (data.getLength() == 0) return;
        var cal = this.calendar,    
            priorOverlaps = [], // moving window of overlapping events
            overlapMembers = 0, // number of events in the current overlap group 
            currentOverlapTot = 0, // max number of events that overlap each other in the current overlap group
            maxTotalOverlaps = 0, // max number of events that overlap each other in current lane
            isTimeline = this.isTimelineView()
        ;
        
        if (cal.eventAutoArrange == false) return;
        
        this.forceDataSort(data);

        var firstEvent = data.get(0), // the first event in the passed data
            currLane =  firstEvent[cal.laneNameField] // current lane we're dealing with
        ;

        var processedEvents = [];
        
        data.setProperty("overlapProps", null);
        data.setProperty("slotNum", null);

        var useLanes = this.usesLanes();

        var olRanges = this.updateOverlapRanges(data);

        var rangeSort = [];
        if (useLanes) {
            rangeSort.add({ property: cal.laneNameField, direction: "ascending" });
        }
        if (cal.overlapSortSpecifiers) {
            rangeSort.addList(cal.overlapSortSpecifiers);
        } else {
            
            rangeSort.add({ property: "eventLength", direction: "descending" });
            rangeSort.add({ property: cal.startDateField, direction: "ascending" });
            rangeSort.add({ property: cal.endDateField, direction: "ascending" });
        }

        var addLogs = false;

        if (addLogs) {
            this.logWarn("tagDataForOverlap: about to loop over " + olRanges.length + " overlap ranges");
        }
        
        var lastSnapIndex = this.getLastSnapIndex();

        for (var j = 0; j<olRanges.length; j++) {
            var range = olRanges[j];
            
            if (addLogs) {
                this.logWarn("range: " + isc.echoFull(range) + "");
            }
            
            var field = (range.fieldName ? this.getFieldByName(range.fieldName) : null);
            
            var rangeStartSnapObj = this.getSnapData(null, null, range[cal.startDateField], true, range[cal.laneNameField]),
                rangeStartSnap = rangeStartSnapObj ? rangeStartSnapObj.index : 0,
                rangeEndSnapObj = this.getSnapData(null, null, range[cal.endDateField], true, range[cal.laneNameField], true),
                rangeEndSnap = rangeEndSnapObj ? rangeEndSnapObj.index : this._snapGapList.length-1,
                // range start and end snaps are inclusive
                rangeSnapCount = (rangeEndSnap-rangeStartSnap) + 1,
                slotList = [],
                slotCount = 1
            ;
            
            // add an initial slot
            slotList[0] = this.getOverlapSlot(0, rangeSnapCount);

            var events = range.events;
            
            //events.setSort(rangeSort);
            
            for (var eventIndex=0; eventIndex<events.length; eventIndex++) {
                
                var event = events[eventIndex];
                
                event.overlapProps = {};
                
                var oProps = event.overlapProps;

                if (addLogs) {
                    this.logWarn("Processing event " + event.name);
                }
                // get the event's snapGapList - last param will return the first/last snaps
                // if the dates are out of range
                var eStart = cal.getEventStartDate(event),
                    eEnd = cal.getEventEndDate(event)
                ;

                var eStartDate = isc.DateUtil.getLogicalDateOnly(eStart);
                var eStartTime = isc.DateUtil.getLogicalTimeOnly(eStart);
                eStart = isc.DateUtil.combineLogicalDateAndTime(eStartDate, eStartTime);
                
                var eEndDate = isc.DateUtil.getLogicalDateOnly(eEnd);
                var eEndTime = isc.DateUtil.getLogicalTimeOnly(eEnd);
                eEnd = isc.DateUtil.combineLogicalDateAndTime(eEndDate, eEndTime);
                
                // take 1ms from the end time to deal with the common case of people specifying
                // a rounded end date, like 10pm, which is typically the start of the next snapGap
                eEnd = isc.DateUtil.adjustDate(eEnd, "-1ms");
                
                if (field && field.endDate && eEnd > field.endDate) {
                    // clamp the event's endDate to the column's endDate
                    eEnd = field.endDate.duplicate();
                }

                if (addLogs) {
                    this.logWarn("    startDate: " + eStart + "\n      endDate: " + eEnd);
                }

                // tweak the dates by 1ms, to prevent exact matches on a snap-boundary from
                // causing incorrect overlaps
                oProps.eventStartSnap = this.getSnapData(null, null, eStart.getTime()+1, true, event[cal.laneNameField]);
                oProps.eventEndSnap = this.getSnapData(null, null, eEnd.getTime()-1, true, event[cal.laneNameField]);

                // deal with hidden snaps - if eventStart/EndSnap aren't set, use last/nextValidSnap
                var eStartSnap = (oProps.eventStartSnap ? oProps.eventStartSnap.index : oProps.nextValidSnap.index) -rangeStartSnap;
                var eEndSnap = (oProps.eventEndSnap ? oProps.eventEndSnap.index : oProps.lastValidSnap.index) -rangeStartSnap;

                // increment the endSnap to ensure appropriate overlap-detection - the +1 is no longer applied
                // to the array.fill() calls later
                eEndSnap++;

                eEndSnap = Math.min(eEndSnap, lastSnapIndex);

                var found = false;
                var slot = null;

                for (var slotIndex=0; slotIndex<slotCount; slotIndex++) {
                    
                    var gaps = slotList[slotIndex].snapGaps.slice(eStartSnap, eEndSnap);
                    var used = gaps.sum() > 0;
                    if (addLogs) {
                        this.logWarn("    checking slots: " + eStartSnap + " to " + eEndSnap);
                        this.logWarn("    used is: " + used);
                        this.logWarn("    gaps are: " + isc.echoFull(gaps));
                    }
                    if (!used) {
                        found = true;
                        slotList[slotIndex].snapGaps.fill(1, eStartSnap, eEndSnap);
                        slotList[slotIndex].events.add(event);
                        event.overlapProps.slotNum = slotIndex;
                        if (addLogs) {
                            this.logWarn("event " + event.name + " now occupying slot " + slotIndex);
                        }
                        break;
                    }
                }
                if (!found) {
                    // add a new slot
                    slotList[slotCount] = this.getOverlapSlot(slotCount, rangeSnapCount);
                    slotList[slotCount].snapGaps.fill(1, eStartSnap, eEndSnap);
                    slotList[slotCount].events.add(event);
                    event.overlapProps.slotNum = slotCount
                    if (addLogs) {
                        this.logWarn("event " + event.name + " added to new slot index " + slotCount);
                    }
                    slotCount++;
                }
                            
            }

            for (var i=0; i<slotList.length; i++) {
                var slot = slotList[i];
                // for each event in this slot, check all later slots - if one has an event 
                // that overlaps this event directly, this event ends in the slot before - 
                // decides this event's slotCount
                for (var eIndex=0; eIndex < slot.events.length; eIndex++) {
                    var event = slot.events[eIndex];
                    var oProps = event.overlapProps;

                    // update the totalSlots
                    oProps.totalSlots = slotCount;
                            
                    // get the event snapGaps
                    var eStartSnap = (oProps.eventStartSnap ? oProps.eventStartSnap.index : rangeStartSnap) -rangeStartSnap;
                    var eEndSnap = (oProps.eventEndSnap ? oProps.eventEndSnap.index : rangeStartSnap) -rangeStartSnap;
                    
                    eEndSnap++;

                    var found = false;
                            
                    for (var innerIndex=i+1; innerIndex<slotList.length; innerIndex++) {
                        //var gaps = slotList[innerIndex].snapGaps.slice(eStartSnap, eEndSnap+1);
                        var gaps = slotList[innerIndex].snapGaps.slice(eStartSnap, eEndSnap);
                        var used = gaps.sum() > 0;
                        if (used) {
                            oProps.slotCount = innerIndex - oProps.slotNum;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        // should span all following slots
                        oProps.slotCount = slotCount - oProps.slotNum;
                    }
                    // we want slotNum to start from 1, for legacy downstream code
                    oProps.slotNum++;
                    event.slotNum = oProps.slotNum;
                }
            }
                
            range.slotList = slotList;

            if (addLogs) {
                this.logWarn("***** slotList *****\n" + isc.echoFull(slotList));
            }
        }
        
    },
    
    getLastSnapIndex : function () {
        var snap = this.getSnapData(null, null, isc.DateUtil.adjustDate(this.endDate, "-1ms"), true);
        if (snap) return snap.index;
    },
    
    //-------------------------rendering events on demand-----------------------------

    getVisibleDateRange : function (refreshAll) {

        var cal = this.calendar;
        
        if (refreshAll) {
            return [cal.getVisibleStartDate(this), cal.getVisibleEndDate(this)];
        
        //} else if (this._cache.viewportStartMillis) {
        //    return [ new Date(this._cache.viewportStartMillis), new Date(this._cache.viewportEndMillis) ]
        }
        
        if (!this.renderEventsOnDemand) {
                return [this.startDate.duplicate(), this.endDate.duplicate()];    
        }
        
        if (this.isTimelineView()) {
            // TODO: add this code to have the timeline use viewport range, rather than scrollable range
            //var cols = this.getVisibleColumnRange(),
            //    startDate = this.getCellDate(0, cols[0]),
            //    endDate = this.getCellEndDate(0, cols[1])
            //;
            //return [startDate, endDate];
        }
        
        var startX = this.body.getScrollLeft(),
            endX = startX + this.body.getVisibleWidth(),
            startCol = this.body.getEventColumn(startX + 1),
            endCol = this.body.getEventColumn(endX),
            startY = this.body.getScrollTop(),
            endY = startY + this.body.getVisibleHeight(),
            startRow = this.body.getEventRow(startY + 1),
            endRow = this.body.getEventRow(endY)
        ;
        
        if (endRow < 0 || isNaN(endRow)) endRow = this.data.getLength()-1;
        if (endCol < 0 || isNaN(endCol)) {
            if (this.isTimelineView()) {
                endCol = this._dateFieldCount;
            } else {
                endCol = this.body.fields.length - 1;
            }
        }
        
        endCol = Math.min(endCol, this.body.fields.length-1);
        endRow = Math.min(endRow, this.data.length-1);
        
        var startDate = this.getCellDate(startRow, startCol) || this.startDate,
            endDate = (this.getCellEndDate ? this.getCellEndDate(endRow, endCol) : 
                this.getCellDate(endRow, endCol)) || this.endDate
        ;
        
        this._cache.viewportStartMillis = startDate.getTime();
        this._cache.viewportEndMillis = endDate.getTime();
        
        return [ startDate, endDate ];

    },
    
    getVisibleRowRange : function () {
        if (!this.renderEventsOnDemand) {
            return [0, this.data.getLength()];    
        }
        return this.getVisibleRows();
    },

    getVisibleColumnRange : function () {
        if (!this.renderEventsOnDemand) {
            return [0, this.fields.getLength()];    
        }
        
        return this.body.getVisibleColumns();
    },

    delayedRefreshVisibleEvents : function (refreshAll, caller) {
        if (this.refreshVisibleEventsTimer) isc.Timer.clear(this.refreshVisibleEventsTimer);
        var _this = this;
        this.refreshVisibleEventsTimer = isc.Timer.setTimeout(function () {
            //isc.logWarn("delayedRefreshVisibleEvents('" + caller + "')");
            isc.Timer.clear(_this.refreshVisibleEventsTimer);
            delete _this.refreshVisibleEventsTimer;
            _this.refreshVisibleEvents(refreshAll, caller);
        }, 100);
    },

    // refreshEvents is only called when data changes, etc. 
    // refreshVisibleEvents is called whenever the view is scrolled and only draws visible events.
    // see scrolled()
    refreshVisibleEvents : function (refreshAll, caller) {
        //this.logWarn("refreshVisisbleEvents() called by '" + caller + "' - " +
        //    "isDrawn=" + this.isDrawn() + ", body.isDrawn=" + (this.body && this.body.isDrawn()));
        // bail unless both the view and its body are drawn
        if (!this.isDrawn() || !this.body || !this.body.isDrawn()) return;
        // bail if this is a lane-based view but there aren't any lanes (can't render anything)

        if (this._pendingGroupComplete || this._groupOnDraw) {
            // if this flag is set, grouping hasn't finished yet, and we'll run again when it does
            return;
        }

        //isc.logWarn("refreshVisibleEvents - called from " + caller);

        // get visible events (those in the viewport)
        var events = this.getVisibleEvents(refreshAll);

        // need to do this to ensure consistent zordering
        this.sortForRender(events);

        var eventsLen = events.getLength();

        var clearThese = this.useEventCanvasPool ? isc.addProperties({}, this._usedEventMap) : {},
            addThese = {}
        ;
        
        this.logDebug('refreshing visible events','calendar'); 

        // build a map of event.__key to event-object
        var eventMap = events.makeIndex("__key");
        
        // we don't need to resize/redraw *already drawn* canvases just because of a scroll
        var firedFromScroll = (caller == "scrolled");
        for (var key in eventMap) {
            //var event = events.get(i),
            var event = eventMap[key],
                alreadyVisible = this._usedEventMap[key] != null
            ;

            if (alreadyVisible) {
                // if an event is already in the _usedEventMap, remove it from the 
                // clearThese object
                delete clearThese[key];
                if (!firedFromScroll && (this.isGrouped || this.useEventCanvasPool)) {
                    // if the view is grouped or using the eventCanvasPool, reposition and
                    // redraw the canvas
                    var canvas = this.getCurrentEventCanvas(event);
                    //if (canvas && canvas.needsResize) this.sizeEventCanvas(canvas);
                    this.sizeEventCanvas(canvas, null, "refreshVisibleEvents");
                }
                continue;
            }

            addThese[event.__key] = event;
        }

        if (this.isGrouped || 
                (this.useEventCanvasPool && this.eventCanvasPoolingMode == "viewport"))
        {
            // we want to clear eventCanvases that are no longer in the viewport if we're using
            // viewport pooling mode, or if the grid is grouped (a group might have closed)
            for (var key in clearThese) {
                var canvas = this._allCanvasMap[clearThese[key]];
                if (canvas) this.clearEventCanvas(canvas);
            }
        }
        clearThese = null;

        if (isc.getKeys(addThese).length > 0) {
            for (var key in addThese) {
                var event = addThese[key];
                this.addEvent(event, false, true);
            }
        }
        addThese = null;

        // if there are columnLayouts, resize and resort them
        if (this.shouldShowColumnLayouts()) this.updateColumnLayouts();
        
        if (!this.__printing) {
            // redraw any zones and indicators in the background
            this.drawZones();
            this.drawIndicators();
        }

        // update the tab positions of all the visible eventCanvases
        if (this.calendar.canSelectEvents) this.setEventCanvasTabPositions();
        
        this._eventsRendered();
    },
    
    _eventsRendered : function () {
        var cal = this.calendar;
        if (this._scrollToEvent) {
            this.scrollToEvent(this._scrollToEvent);
            this._scrollToEvent = null;
        }
        if (cal.eventsRendered && isc.isA.Function(cal.eventsRendered)) {
            cal.eventsRendered();
        }
    },
    
    // update the tab-indexes of all eventCanvases
    setEventCanvasTabPositions : function () {
        if (!this.calendar.canSelectEvents) return;

        // sort the events as they'll be rendered
        var events = this.getEventData();
        this.forceDataSort(events);

        // loop over the events, get the associated canvas and set it's tabIndex
        for (var j=0; j<events.length; j++) {
            var canvas = this.getCurrentEventCanvas(events[j]);
            if (canvas && canvas.isEventCanvas && canvas.event) {
                // ensure the tabIndex is always horizontal and then vertical within each lane, 
                // and then vertical into the next visible lane (not next alphabetically)
                var tabIndex = 0;
                if (this.usesLanes()) {
                    tabIndex = this.getLaneIndex(canvas.event[this.calendar.laneNameField]) * 1000;
                }
                tabIndex += j;
                canvas.setRelativeTabPosition(tabIndex);
            }
        }
    },

    getVisibleEvents : function (refreshAll) {               
        var cal = this.calendar;
        if (!this.renderEventsOnDemand) return this.getEventData();

        var isTimeline = this.isTimelineView(),
            dateRange = this.getVisibleDateRange(refreshAll),
            useLanes = this.usesLanes(),
            laneRange = useLanes ?
                (isTimeline ? this.getVisibleRowRange() : this.getVisibleColumnRange()) : null
        ;
        
        var events = this.getEventData(),
            startMillis = dateRange[0].getTime(),
            endMillis = dateRange[1].getTime(),
            eventsLen = events.getLength(),
            results = [],
            isWeekView = this.isWeekView(),
            openList = this.isGrouped ? this.data.getOpenList() : null
        ;

        for (var i = 0; i < eventsLen; i++) {
            var event = events.get(i);
            
            if (!event) {
                isc.logWarn('getVisibleEvents: potentially invalid index: ' + i);  
                break;
            }

            if (isc.isA.String(event)) return [];

            // if shouldShowEvent() is implemented and returns false, skip the event
            if (cal.shouldShowEvent(event, this) == false) continue;
            if (useLanes && cal.shouldShowLane(this.getLane(event[cal.laneNameField]), this) == false) continue;
            
            var eventStart = cal.getEventLeadingDate(event) || cal.getEventStartDate(event);
            // bail if there's no startDate
            if (!eventStart) {
                if (event.loadingMarker) {
                    this.logWarn(this.viewName + ".getVisibleEvents() encountered a " +
                        "place-holder for a loading record, rather than a valid record. " +
                        "Can't continue:  " + isc.echoFull(this.getStackTrace()));
                    break;
                }
                this.logWarn(this.viewName + ".getVisibleEvents() - event has no start-date: " + isc.echoFull(event));
                continue;
            }
            
            var eventEnd = cal.getEventTrailingDate(event) || cal.getEventEndDate(event),
                eventEndMillis = eventEnd.getTime()
            ;

            // event ends before the range start
            if (eventEndMillis <= startMillis) continue;
            // event starts after the range end
            if (eventStart.getTime() >= endMillis) continue;

            if (isWeekView) {
                // if the event's end date is on a different day, assume the end of the start
                // day, so that the range-comparison below works properly
                var lStart = isc.DateUtil.getLogicalDateOnly(eventStart),
                    lEnd =  isc.DateUtil.getLogicalDateOnly(eventEnd)
                ;
                if (lStart.getDate() != lEnd.getDate()) {
                    eventEnd = isc.DateUtil.getEndOf(eventStart, "d", false);
                }
                // the range is from hour-start on the start date, to hour-end on the end date
                // but we don't want events that are vertically not in view, so discard events 
                // that end before the viewport start time or start after the viewport end-time
                //if (isc.DateUtil.getLogicalTimeOnly(eventEnd).getHours() < 
                //        isc.DateUtil.getLogicalTimeOnly(dateRange[0]).getHours()) continue;
                //if (isc.DateUtil.getLogicalTimeOnly(eventStart).getHours() < 
                //        isc.DateUtil.getLogicalTimeOnly(dateRange[1]).getHours()) continue;
            }
            
            // build a range object to compare against
            var rangeObj = {};

            if (useLanes) {
                if (this.isGrouped) {
                    // if grouped, check that the lane is in the openList
                    var index = openList.findIndex("name", event[cal.laneNameField]);
                    if (index < 0) continue;
                } else {
                    if (refreshAll != true) {
                        var laneIndex = this.getEventLaneIndex(event);
                        // optimization - if the lane isn't in the viewport, continue
                        if (laneIndex == null || laneIndex < laneRange[0] || laneIndex > laneRange[1]) 
                            continue;
                    }
                }

                rangeObj[cal.laneNameField] = event[cal.laneNameField];
            }

            if (isTimeline) {
                // if we're not showing lead-trail lines use start/endDate fields instead to 
                // determine overlap
                if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                    rangeObj[cal.leadingDateField] = dateRange[0];
                    rangeObj[cal.trailingDateField] = dateRange[1];
                } else {
                    rangeObj[cal.startDateField] = dateRange[0];
                    rangeObj[cal.endDateField] = dateRange[1];    
                }
            } else {
                rangeObj[cal.startDateField] = dateRange[0];
                rangeObj[cal.endDateField] = dateRange[1];
            }

            //sameLaneOnly = useLanes ? !cal.canEditEventLane(event, view) : false;
            //if (this.eventsOverlap(rangeObj, event, sameLaneOnly)) {
            if (this.eventsOverlap(rangeObj, event, useLanes)) {
                results.add(event);
            }
        }

        return results;
    },

    clearEventCanvas : function (eventCanvas, destroy) {
        // clears (and pools or destroys) the passed eventCanvas - also accepts an array of
        // eventCanvas instances
        if (eventCanvas) {
            if (!isc.isAn.Array(eventCanvas)) eventCanvas = [eventCanvas];
            var len = eventCanvas.length;
            while (--len >= 0) {
                var canvas = eventCanvas[len];
                if (canvas.hide) canvas.hide();
                // also clear the canvas so it can no longer affect the size of the body
                if (canvas.clear) canvas.clear();
                delete this._usedCanvasMap[canvas.ID];
                if (canvas.event) {
                    delete this._usedEventMap[canvas.event.__key];
                }
                if (this.useEventCanvasPool && !destroy) {
                    this.poolEventCanvas(canvas);
                } else {
                    canvas.event = null;
                    canvas.destroy();
                    canvas = null;
                }
            }
        }
    },

    clearEvents : function (start, destroy) {
        // hide all the canvases in the _eventCanvasPool
        //if (!this.body || !this.body.children) return;
        if (!start) start = 0;
        //isc.logWarn('clearing events');

        if (destroy == null) destroy = !this.useEventCanvasPool;

        for (var key in this._usedCanvasMap) {
            this.clearEventCanvas(this._allCanvasMap[key], destroy);
        }
    },

    areSame : function (first, second) {
        if (!first || !second) return false;
        var cal = this.calendar;
        if (cal.dataSource) {
            var pks = cal.getEventPKs(), areEqual = true;
            for (var i=0, len=pks.length; i<len; i++) {
                if (first[pks[i]] != second[pks[i]]) {
                    areEqual = false;
                    break;
                }
            }
            return areEqual;
        } else {
            return (first === second);    
        }
    },

    
    getEventCanvasConstructor : function (event) {
        return this.eventCanvasConstructor;
    },

    getCurrentEventCanvas : function (event) {
        var canvasID = this._usedEventMap[event.__key];
        return canvasID != null ? this._allCanvasMap[canvasID] : null;
    },
    
    poolEventCanvas : function (canvas) {
        if (this.body) {
            var eventKey;
            delete this._usedCanvasMap[canvas.ID];
            if (canvas.event) {
                eventKey = canvas.event.__key;
                delete this._usedEventMap[eventKey];
                this.logInfo("pooling canvas " + canvas.ID + " for event + " + eventKey, "calendar");
                //this.calendar.setEventCanvasID(this, canvas.event, null);
                canvas.event = null;
            }
            canvas.availableForUse = true;
            this._pooledCanvasMap[canvas.ID] = canvas;
            return true;
        } else return false;
    },
    getPooledEventCanvas : function (event) {
        if (!this.body) return;

        var canvasID = null;
        var canvas = null;
        
        var lastUsedCanvasID = this._lastUsedEventMap[event.__key];
        if (lastUsedCanvasID && this._pooledCanvasMap[lastUsedCanvasID]) {
            // get the canvas last used to render this event, if it's still pooled
            canvasID = lastUsedCanvasID;
            canvas = this._allCanvasMap[canvasID];
            this.logInfo("re-using canvas " + canvasID + " for event + " + event.__key, "calendar");
        } else {
            var pooledKeys = isc.getKeys(this._pooledCanvasMap);
            if (pooledKeys.length > 0) {
                canvas = this._pooledCanvasMap[pooledKeys[0]];
                canvasID = canvas.ID;
                this.logInfo("un-pooling canvas " + canvasID + " for event + " + event.__key, "calendar");
            }
        }

        if (!canvas) return;

        // update the various maps
        this._usedEventMap[event.__key] = canvasID;
        this._lastUsedEventMap[event.__key] = canvasID;
        this._usedCanvasMap[canvasID] = event.__key;
        this._lastUsedCanvasMap[canvasID] = event.__key;
        delete this._pooledCanvasMap[canvasID];

        canvas.availableForUse = false;
        //this.calendar.setEventCanvasID(this, event, canvasID);

        return canvas;
    },

    addEvent : function (event, retag, skipReflow) {
        // if this is a new event, store it's __key for faster access later
        if (!event.__key) this.calendar.getEventKey(event, this);

        // clear any cell selection that has been made
        this.clearSelection();

        this.addEventData(event);

        var cal = this.calendar,
            hideWindow = false
        ;

        // get a canvas for the event - either the current one...
        var canvas = this.getCurrentEventCanvas(event)
        // or a pooled one (which will return the one that last showed this event, if it's 
        // available, or another one from the pool otherwise)
        if (!canvas) canvas = this.getPooledEventCanvas(event);
        // or a new one if there's nothing available in the pool
        if (!canvas) canvas = cal._getEventCanvas(event, this);

        //if (canvas.isDrawn()) canvas.hide();
        if (canvas.isDrawn()) canvas.clear();
        
        // assign the dragTarget, if not stacking event in columns - different drag mechanism
        if (!this.shouldShowColumnLayouts()) {
            canvas.dragTarget = this.eventDragCanvas;
        } 
        canvas.setEvent(event);

        if (!this.shouldShowColumnLayouts() && canvas.parentElement != this.body) {
            // add canvases the body, if they're not being added to columnLayouts
            this.body.addChild(canvas, null, false);
        }

        canvas.needsResize = true;

        // add canvas->event and event->canvas map entries
        this._usedCanvasMap[canvas.ID] = event.__key;
        this._lastUsedCanvasMap[canvas.ID] = event.__key;
        this._usedEventMap[event.__key] = canvas.ID;
        this._lastUsedEventMap[event.__key] = canvas.ID;

        canvas._isWeek = this.isWeekView();

        if (this.isDayView() && this.usesLanes()) {
            // don't show the eventCanvas if it's lane isn't visible
            var laneName = event[cal.laneNameField];
            if (!this.getLane(laneName)) hideWindow = true;
        }

        if (!this.shouldShowColumnLayouts()) {
            if (!hideWindow && this.body && this.body.isDrawn()) {
                // if the "retag" param was passed, this is an event that hasn't been rendered 
                // before (it comes from processSaveResponse() after an "add" op) - rather than 
                // just resizing the window, get a list of overlapRanges that intersect the new
                // event, combine the event-list from each of them and add the new event,
                // remove the existing ranges and then retag the event-list
                if (retag) {
                    if (this.verticalEvents) {
                        this.retagDayEvents(cal.getEventStartDate(event));
                    } else {
                        this.retagOverlapRange(cal.getEventStartDate(event), 
                                cal.getEventEndDate(event), event[cal.laneNameField]);
                    }
                } else {
                    // add the eventCanvas to the body before rendering it, so that bringToFront() 
                    // behaves as expected
                    this.sizeEventCanvas(canvas, null, "addEvent");
                    canvas.bringToFront();
                }
            }
        } else {
            // when showColumnLayouts is true, we just add eventCanvases into this.getDayLayout(date)
            this.addEventCanvasToColumnLayout(canvas, skipReflow);
        }
    },

    getColumnLayout : function (date) {
        var col = this.getColFromDate(date);
        return this.columnLayouts[col];
    },
    addEventCanvasToColumnLayout : function (eventCanvas, skipReflow) {
        var col = this.getColFromDate(this.calendar.getEventStartDate(eventCanvas.event));
        var layout = this.columnLayouts[col];
        if (layout) {
            layout.addMember(eventCanvas);
            eventCanvas.clear();
            eventCanvas.setHeight(1);
            //eventCanvas.setWidth("100%");
            eventCanvas.setOverflow("visible");
            if (!eventCanvas.isDrawn()) eventCanvas.draw();
            else eventCanvas.redraw();
            eventCanvas.show();
            //eventCanvas.bringToFront();
            if (!skipReflow) layout.resort();
            return true;
        }
        return false;
    },

    removeEvent : function (event) {
        var canvas = this.getCurrentEventCanvas(event);
        if (canvas) {
            this.clearEventCanvas(canvas, !this.useEventCanvasPool);
            this.removeEventData(event);
            return true;
        } else {
            return false;
        }
    },

    clearZones : function () {
        var zones = (this._zoneCanvasList || []);
        zones.callMethod("clear");
        zones.callMethod("deparent");
        zones.callMethod("destroy");
        zones = null;
        this._zoneCanvasList = [];
    },
    drawZones : function () {
        if (this._zoneCanvasList) this.clearZones();
        if (!this.calendar.showZones) return;

        var cal = this.calendar,
            zones = cal.zones || [],
            canvasList = this._zoneCanvasList = []
        ;
        
        if (this.isGrouped) {
            this.logInfo("Zones are not currently supported in grouped Calendar views.");
            return;
        }
        if (!zones || zones.length <= 0) return;
        
        //zones.setSort([{property: cal.startDateField, direction: "ascending"}]);
        var rangeZones = [],
            dateRange = this.getVisibleDateRange(),
            startMillis = dateRange[0].getTime(),
            endMillis = dateRange[1].getTime()
        ;

        for (var i=0; i<zones.length; i++) {
            var zone = zones[i];
            if (zone[cal.startDateField].getTime() < endMillis &&
                zone[cal.endDateField].getTime() > startMillis) 
            {
                rangeZones.add(zone)
            }
            zone.styleName = cal.getZoneCanvasStyle(zone, this);
        }
        
        for (var i=0; i<rangeZones.length; i++) {
            var zone = rangeZones[i],
                canvas = cal.getZoneCanvas(zone, this),
                left = this.getDateLeftOffset(zone[cal.startDateField]),
                right = this.getDateLeftOffset(zone[cal.endDateField]),
                // use the sum of the lane-heights, even if that's less than the body height
                height = this.data.getProperty("height").sum()
            ;
            this.body.addChild(canvas, null, false)
            canvas.renderEvent(0, left, right-left, height, true);
            canvasList.add(canvas);
        }
    },
    
    clearIndicators : function () {
        var indicators = (this._indicatorCanvasList || []);
        indicators.callMethod("clear");
        indicators.callMethod("deparent");
        indicators.callMethod("destroy");
        indicators = null;
        this._indicatorCanvasList = [];
    },
    drawIndicators : function () {
        if (this._indicatorCanvasList) this.clearIndicators();
        if (!this.calendar.showIndicators) return;

        var cal = this.calendar,
            indicators = cal.indicators || [],
            canvasList = this._indicatorCanvasList = []
        ;
        
        if (this.isGrouped) {
            this.logInfo("Indicators are not currently supported in grouped Calendar views.");
            return;
        }
        if (!indicators || indicators.length <= 0) return;

        //indicators.setSort([{property: cal.startDateField, direction: "ascending"}]);
        var rangeIndicators = [],
            dateRange = this.getVisibleDateRange(),
            startMillis = dateRange[0].getTime(),
            endMillis = dateRange[1].getTime()
        ;

        for (var i=0; i<indicators.length; i++) {
            var indicator = indicators[i];
            // indicators are zero-length duration events - ensure that here
            delete indicator[cal.endDateField];
            indicator.duration = 0;
            indicator.durationUnit = "minute";
            var iMillis = cal.getEventStartDate(indicator).getTime();
            if (iMillis >= startMillis && iMillis < endMillis) {
                // indicator's startDate is in the visible range
                rangeIndicators.add(indicator);
            }
        };
        
        for (var i=0; i<rangeIndicators.length; i++) {
            var indicator = rangeIndicators[i],
                canvas = cal.getIndicatorCanvas(indicator, this),
                left = this.getDateLeftOffset(indicator[cal.startDateField]),
                // use the sum of the lane-heights, even if that's less than the body height
                height = this.data.getProperty("height").sum()
            ;
            this.body.addChild(canvas, null, false)

            canvas.renderEvent(0, left, cal.zeroLengthEventSize, height, !cal.showIndicatorsInFront);
            canvasList.add(canvas);
        }
    },

    _refreshEvents : function () {
        //this.logWarn("_refreshEvents");
        if (!this.isDrawn()) {
            // if the view isn't drawn yet, mark it for refresh on draw
            this._refreshEventsOnDraw = true;
            return;
        }
        if (this.calendar.shouldIncludeRangeCriteria(this)) {
            this._refreshData();
            return;
        }
        this.refreshEvents("_refreshEvents");
    },

    delayedRefreshEvents : function (caller) {
        if (this.refreshEventsTimer) isc.Timer.clear(this.refreshEventsTimer);
        var _this = this;
        this.refreshEventsTimer = isc.Timer.setTimeout(function () {
            isc.Timer.clear(_this.refreshEventsTimer);
            delete _this.refreshEventsTimer;
            _this.refreshEvents(caller);
        }, 100);
    },

    //> @method calendarView.refreshEvents()
    // Clear, recalculate and redraw the events for the current range, without causing a fetch.
    // @visibility external
    //<
    refreshEvents : function (caller) {
        //this.logWarn("refreshEvents() called by " + caller);
        //this.logWarn("refreshEvents() called by '" + caller + "' - " +
        //    "isDrawn=" + this.isDrawn() + ", body.isDrawn=" + (this.body && this.body.isDrawn()));
            
        if (this._refreshingEvents) return;

        var cal = this.calendar;
        // bail if the grid hasn't been drawn yet, or hasn't any data yet
        if (!this.body || !this.body.isDrawn() || !cal.hasData()) return;

        this._refreshEventsCalled = true;

        // flag to prevent setLanes() from calling back through this method
        this._refreshingEvents = true;

        // clear any zones and indicators (so they don't prevent the body from shrinking)
        this.clearZones();
        this.clearIndicators();

        // clear event canvases
        this.clearEvents(0, !this.useEventCanvasPool);

        // clear event records
        this.setEventData([]);

        // reset the lists of drawn events and canvases - they're either destroyed or pooled now
        this._usedEventMap = {};

        // update various dates and snap-properties
        if (!this.isTimelineView()) {
            this.initCacheValues();
        }        
        var startDate = cal.getVisibleStartDate(this) || this.startDate,
            startMillis = startDate.getTime(),
            endDate = cal.getVisibleEndDate(this) || this.endDate,
            endMillis = endDate.getTime()
        ;

        this.overlapRanges = [];

        
        var eventsLen = cal.data.getLength();
        var allEvents = cal.data.getRange(0, eventsLen);

        // make a map of all the lanes available on the calendar - events that have some other
        // lane will be ignored in the loop below
        var laneMap;
        if (this.usesLanes()) laneMap = cal.lanes ? cal.lanes.makeIndex("name") : null;
        var events = [];

        // reset _allEventMap
        this._allEventMap = {}

        while (--eventsLen >= 0) {
            var event = allEvents.get(eventsLen);
            if (!event) continue;
            if (!isc.isA.String(event)) {
                // if shouldShowEvent() is implemented and returns false, skip the event
                if (cal.shouldShowEvent(event, this) == false) continue;
                if (laneMap && event[cal.laneNameField] && !laneMap[event[cal.laneNameField]]) {
                    // if the view is lane-based but the event's lane doesn't exist, continue -
                    // otherwise, these events will get tagged for overlapping unnecessarily
                    //this.logWarn(this.viewName + ".refreshEvents() - event has no lane: " + isc.echoFull(event[cal.laneNameField]));
                    continue;
                }
                var eventStartDate = cal.getEventStartDate(event);
                //eventStartDate = isc.Calendar._getAsDisplayDate(eventStartDate);
                if (!eventStartDate) {
                    if (event.loadingMarker) {
                        this.logWarn(this.viewName + ".refreshEvents() encountered a " +
                            "place-holder for a loading record, rather than a valid record. " +
                            "Can't continue:  " + isc.echoFull(this.getStackTrace()));
                        break;
                    }
                    this.logWarn(this.viewName + ".refreshEvents() - event has no start-date: " + isc.echoFull(event));
                    continue;
                }
                
                var dates = cal.getEventDates(event),
                    eLead = dates[cal.leadingDateField],
                    eStart = dates[cal.startDateField],
                    eEnd = dates[cal.endDateField],
                    eTrail = dates[cal.trailingDateField]
                ;

                // if the event itself (not including any leading/trailing dates) covers any 
                // part of the scrollable range, it's available to render
                if ((eStart && eStart.getTime() >= startMillis && eStart.getTime() < endMillis) ||
                    (eEnd && eEnd.getTime() > startMillis && eEnd.getTime() <= endMillis) ||
                    // starts before and ends after the range not valid in vertical views - no multi-day events
                    (!this.verticalEvents && eStart.getTime() <= startMillis && eEnd.getTime() >= endMillis)
                   )
                {

                    // get the event's render-snaps
                    var startSnap = this.getSnapData(null, null, eStart),
                        endSnap = this.getSnapData(null, null, eEnd)
                    ;

                    // if the event starts and ends on hidden dates...
                    if (startSnap && startSnap.startHidden && endSnap && endSnap.endHidden) {
                        // only render it if there are valid (visible) snaps between them
                        if (startSnap.lastValidSnap == endSnap.lastValidSnap &&
                            startSnap.nextValidSnap == endSnap.nextValidSnap) 
                        {
                            // start/end snaps are in the same hidden block of snaps - no 
                            // sensible way to render this event - skip it
                            continue;
                        }
                    }

                    // store the length of the event, not including lead/trail dates, in ms
                    event.eventLength = (eEnd.getTime() - eStart.getTime());
                    if (event[cal.durationField] != null) {
                        event.isDuration = true;
                        event.isZeroDuration = event[cal.durationField] == 0;
                    }

                    // store the event's key and put it in the _allEventMap (all events)
                    if (!event.__key) {
                        event.__key = cal.getEventKey(event);
                    }
                    this._allEventMap[event.__key] = event;

                    //event[propsName] = props;
                    events.add(event);
                } else {
                    //this.logWarn("Evene '" + event.name + "' skipped - startDate: " + event.startDate + ", endDate: " + event.endDate);
                }
            }
        };

        if (this.usesLanes() && cal.lanes) {
            // update the lanes, according to the events just processed
            var lanes = [];
            var usedLaneNames = events.getProperty(cal.laneNameField).getUniqueItems();
            for (var i=0; i<cal.lanes.length; i++) {
                if (cal.hideUnusedLanes) {
                    // remove any lanes that have no *visible* events after processing 
                    // list of lanes used by current event-data
                    if (usedLaneNames.contains(cal.lanes[i].name)) {
                        lanes.add(cal.lanes[i]);
                    }
                } else lanes.add(cal.lanes[i]);
            }

            // updateLanes is true if the two arrays have different lengths or entries
            var updateLanes = lanes.length != this.lanes.length;
            for (var i=0; i<this.lanes.length; i++) {
                if (!lanes[i] || lanes[i].name != this.lanes[i].name) {
                    updateLanes = true;
                    break;
                }
            }
            if (updateLanes) this.updateLanes(lanes, true);
        }

        this.setEventData(events);
        this.tagDataForOverlap();
        
        // redraw the events
        this.refreshVisibleEvents(null, "refreshEvents");

        // scroll as necessary and clear the flag
        if (this._scrollRowAfterRefresh) {
            this.body.scrollTo(null, this._scrollRowAfterRefresh);
            delete this._scrollRowAfterRefresh;
        }

        // clear the internal refresh flags
        delete this._needsRefresh;
        delete this._refreshingEvents;
    },
    
    _refreshData : function () {
        var cal = this.calendar;
        //isc.logWarn("nextOrPrev:" + cal.data.willFetchData(cal.getNewCriteria()));
        if (cal.dataSource && isc.ResultSet && isc.isA.ResultSet(cal.data)) {
            cal._ignoreDataChanged = true;
            cal.invalidateCache();
            cal.fetchData(cal.getCriteria());
        } else {
            // force dataChanged hooks to fire so event positions are correctly updated
            cal.dataChanged();
        }
    },

    getFrozenLength : function () {
        if (this.frozenBody && this.frozenBody.fields) return this.frozenBody.fields.length;
        return 0;
    },
    
    getCellAlign : function (record, rowNum, colNum) {
        if (this.isMonthView()) return;
        var cal = this.calendar,
            field = this.fields[colNum],
            // support Lane.cellAlign - secondary default to field (laneField, headerLevel)
            recordAlign = record ? record.cellAlign : null,
            dateAlign = null
        ;
        if (field) {
            if (field.frozen) {
                // laneField or labelColumn - support field, lane, view
                return field.cellAlign || recordAlign || this.labelColumnAlign;
            }
            var frozenLength = this.getFrozenLength();
            if (cal.getDateCellAlign) {
                var date = this.getCellDate(rowNum, colNum-frozenLength);
                if (date) dateAlign = cal.getDateCellAlign(date, rowNum, colNum-frozenLength, this);
            }
            field = this.body.fields[colNum - frozenLength];
            if (dateAlign || field.cellAlign || recordAlign) {
                return dateAlign || field.cellAlign || recordAlign;
            }
        }
        return this.Super("getCellAlign", arguments);
    },

    _defaultCellVAlign: "center",
    getCellVAlign : function (record, rowNum, colNum) {
        if (this.isMonthView()) return;
        var cal = this.calendar,
            field = this.fields[colNum],
            // support Lane.cellVAlign - secondary default to field (laneField, headerLevel)
            recordVAlign = record ? record.cellVAlign : null,
            dateVAlign = null
        ;
        if (field) {
            if (field.frozen) {
                // laneField or labelColumn - support field, lane, view, default ("center")
                return field.cellVAlign || recordVAlign || 
                        this.labelColumnVAlign || this._defaultCellVAlign;
            }
            var frozenLength = this.getFrozenLength();
            if (cal.getDateCellVAlign) {
                var date = this.getCellDate(rowNum, colNum-frozenLength);
                if (date) dateVAlign = cal.getDateCellVAlign(date, rowNum, colNum-frozenLength, this);
            }
            field = this.body.fields[colNum - frozenLength];
            if (dateVAlign || recordVAlign || field.cellVAlign) {
                return dateVAlign || recordVAlign || field.cellVAlign;
            }
        }
        return recordVAlign || this._defaultCellVAlign;
    },
    
    getCellValue : function (record, rowNum, colNum) {
        if (!this.calendar.getDateHTML) return this.Super("getCellValue", arguments);
        if (this.isMonthView()) return this.Super("getCellValue", arguments);
        var cal = this.calendar,
            frozenLength = this.getFrozenLength()
        ;
        if (colNum-frozenLength >= 0) {
            var date = this.getCellDate(rowNum, colNum-frozenLength);
            if (date) {
                var dateHTML = cal.getDateHTML(date, rowNum, colNum-frozenLength, this);
                if (dateHTML) return dateHTML;
            }
        }
        return this.Super("getCellValue", arguments);
    },

    destroyEvents : function () {
        if (!this.body || !this.body.children) return;

        // clear zone and indicator canvases
        if (this.clearZones) this.clearZones();
        if (this.clearIndicators) this.clearIndicators();

        var len = this.body.children.length;
        while (--len >= 0) {
            var child = this.body.children[len];
            if (child && !child.destroyed) {
                child.clear();
                child.deparent();
                child.destroy();
            }
            child = null;
        }

        // clear event and canvas -related caches
        this.resetEventCaches();
    },

    destroy : function () {
        if (this.isObserving(this, "_updateFieldWidths")) {
            this.ignore(this, "_updateFieldWidths");
        }
        if (this.removeLocalHandlers) this.removeLocalHandlers();
        this.destroyEvents(true);
        if (this.clearZones) this.clearZones();
        if (this.clearIndicators) this.clearIndicators();
        this.calendar = null;
        this.overlapRanges = null;
        this._snapGapList = null;
        this._cache = null;

        // lane-related caches
        this.lanes = null;
        this.resetLaneCaches();
        // event-related caches
        this.resetEventCaches();
        // EventCanvas-related caches
        this.resetCanvasCaches();

        if (this.cellSelection) {
            if (this.cellSelection.destroy) this.cellSelection.destroy();
            this.cellSelection = null;
        }
        if (this.data) {
            if (this.data.destroy) this.data.destroy();
            this.data = null;
        }
        this.Super("destroy", arguments);
    },

    draw : function () {
        var isMonth = this.isMonthView();
        // see if this.cellHeight needs updating 
        if (this.calendar.showWorkday && !isMonth) this.cacheWorkdayRowHeight();
        var result = this.Super("draw", arguments);
        // run the cellHeight check again - it will no-op as necessary
        if (this.calendar.showWorkday && !isMonth) this.cacheWorkdayRowHeight();
        if (this._pendingScrollTo) {
            //isc.logWarn("_pendingScrollTo: " + this._pendingScrollTo);
            // scroll to the extents of the range
            this["scrollTo" + this._pendingScrollTo]();
            delete this._pendingScrollTo;
        }
    },

    //> @method CalendarView.scrollToStart()
    // Move the viewport of this CalendarView to the start of its scrollable range.
    // @visibility calendar
    //<
    scrollToStart : function () {
        if (!this.isDrawn()) {
            // store the requested scroll-type - scroll to it at the end of draw()
            this._pendingScrollTo = "Start";
            return;
        }
        if (this.verticalEvents) {
            this.body.scrollToTop();
        } else {
            this.body.scrollToLeft();
        }
    },
    
    //> @method CalendarView.scrollToEnd()
    // Move the viewport of this CalendarView to the end of its scrollable range.
    // @visibility calendar
    //<
    scrollToEnd : function () {
        if (!this.isDrawn()) {
            // store the requested scroll-type - scroll to it at the end of draw()
            this._pendingScrollTo = "End";
            return;
        }
        if (this.verticalEvents) {
            this.body.scrollToBottom();
        } else {
            this.body.scrollToRight();
        }
    },
    
    getNewEventDefaults : function (event) {
        // ensure the passed event has start and end dates on it
        var evt = event || {};
        var cal = this.calendar;
        var sDate = evt[cal.startDateField];
        if (!sDate) {
            // start from the mouse-date, or the current datetime (addEvent button-click)
            sDate = this.getDateFromPoint() || isc.DateUtil.createDatetime();
            if (sDate.getHours() > 22) sDate.setHours(22);
            evt[cal.startDateField] = sDate; 
        }
        if (!evt[cal.endDateField]) {
            var eDate = sDate.duplicate();
            eDate.setHours(sDate.getHours() + 1);
            evt[cal.endDateField] = eDate;
        }
        return evt;
    },

    getEditDialogPosition : function (event) {
        var cal = this.calendar,
            startDate = cal.getEventStartDate(event),
            colNum = this.getColFromDate(startDate, event[cal.laneNameField]),
            rowNum
        ;
        if (cal.showColumnLayouts) rowNum = this.body.getEventRow();
        else rowNum = this.body.getEventRow(this.getDateTopOffset(startDate));
        var rect = this.body.getCellPageRect(rowNum, colNum);
        return {
            left: Math.max(rect[0], this.body.getPageLeft()),
            top: Math.max(rect[1], this.body.getPageTop())
        };
    },

    // helper function for detecting when a weekend is clicked, and weekends are disabled
    cellDisabled : function (rowNum, colNum) {
        var body = this.getFieldBody(colNum);
        if (!body || body == this.frozenBody) return false;
        var col = this.getLocalFieldNum(colNum),
            date = this.getCellDate(rowNum, col)
        ;
        return this.calendar.shouldDisableDate(date, this);
    }

});

isc.CalendarView.changeDefaults("bodyDefaults", {
    canFocus:false,
    drawChildWithParent : function (child) {
        // we never want to auto-draw event-canvases with the parent - see code in
        // refreshEvents()/refreshVisibleEvents() for that
        if (child.isEventCanvas) return false;
        return this.Super("drawChildWithParent", arguments);
    }
});

isc.CalendarView.changeDefaults("frozenBodyDefaults", {
    canFocus:false
});

// DaySchedule
// --------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("DaySchedule", "CalendarView");

isc.DaySchedule.changeDefaults("bodyProperties", {
    //childrenSnapToGrid: true,
    
    //snapToCells: false,
    //suppressVSnapOffset: true
//  //  redrawOnResize:true
    snapToCells: false,
    suppressVSnapOffset: true,
    suppressHSnapOffset: true,
    childrenSnapToGrid: false,
    scrollTo : function (left, top) {
        var grid = this.creator;
        if (grid.calendar.showWorkday && grid.calendar.limitToWorkday) {
            // prevent scrolling beyond the workday start and end
            if (top < grid._workdayMinTop) top = grid._workdayMinTop;
            else if (top > grid._workdayMaxTop) top = grid._workdayMaxTop;
        }

        return this.Super("scrollTo", arguments);
    }
});

isc.DaySchedule.addProperties({
    //defaultWidth: 300,
    //defaultHeight: 300,
    autoDraw: false,
    canSort: false,
    canResizeFields: false,
    canReorderFields: false,
    showHeader: false,
    showHeaderContextMenu: false,
    showAllRecords: true,
    fixedRecordHeights: true,
    labelColumnWidth: 60,
    labelColumnAlign: "right",
    //labelColumnVAlign: "center",
    labelColumnPosition: "left",
    labelColumnBaseStyle: "labelColumn",
    
    // leave the scrollbar gap to prevent ongoing resizes
    //leaveScrollbarGap: true,
    
    // show cell-level rollover
    showRollOver: true,
    useCellRollOvers: true,

    // disable autoFitting content on header double clicking
    canAutoFitFields : false,
    
    canSelectCells: true,
    navigateOnTab:false,

    // return the string to show in the Calendar controlsBar
    dateLabelFormat: "dddd, MMM dd, YYYY",
    getDateLabelText : function (startDate, endDate) {
        if (this.isWeekView()) { 
            return"<b>" + isc.DateUtil.getFormattedDateRangeString(startDate, endDate) + "</b>";
        }
        return "<b>" + isc.DateUtil.format(startDate, this.dateLabelFormat) + "</b>";
    },

    initWidget : function () {
        var cal = this.calendar;

        if (this.isDayView() && this.usesLanes() && cal.alternateLaneStyles) {
            this.alternateFieldStyles = true;
            this.alternateFieldFrequency = cal.alternateFieldFrequency;
        }

        if (cal.labelColumnWidth && cal.labelColumnWidth != this.labelColumnWidth) {
            this.labelColumnWidth = cal.labelColumnWidth;
        }
        
        this.renderEventsOnDemand = cal.renderEventsOnDemand;
        this.eventDragGap = cal.eventDragGap;

        var fDOW = this.calendar.firstDayOfWeek;
        // set the range dates
        if (this.rangeUnit) {
            this.periodStartDate = this.startDate = isc.DateUtil.getStartOf(this.chosenDate, this.rangeUnit, false, fDOW);
            this.periodEndDate = this.endDate = isc.DateUtil.getEndOf(this.chosenDate, this.rangeUnit, false, fDOW);
        }

        if (!this.logicalDate) {
            // needed for the initial call to _getCellDates(), pre-draw
            this.logicalDate = isc.DateUtil.getLogicalDateOnly(this.chosenDate);
        }

        if (this.usesLanes()) {
            // initialize the local lanes array and a name->object map
            this.lanes = cal.lanes ? cal.lanes.duplicate() : [];
            this.laneMap = this.lanes.makeIndex("name");
        }

        // initialize this.fields (and this.data)
        this.rebuildFields();

        this.Super("initWidget", arguments);

        if (isc.isAn.Array(cal.data)) {
            this._refreshEventsOnDraw = true;
            this._ignoreDataChanged = true;
        }

        this.addAutoChild("eventDragCanvas", { styleName: this.eventDragCanvasStyleName });

    },

    getFirstDateColumn : function () {
        return this.frozenBody ? this.frozenBody.fields.length : 0;
    },
    
    reorderFields : function (start, end, moveDelta) {
        this.Super("reorderFields", arguments);
        this.refreshEvents("reorderFields");
    },
    
    _getLabelFieldProperties : function () {
        return {
                autoFitWidth: true,
                minWidth: this.labelColumnWidth,
                width: this.labelColumnWidth,
                name: "label",
                isLabelField: true,
                title: " ",
                cellAlign: "right",
                calendar: this.calendar,
                frozen: this.labelColumnPosition == "left",
                formatCellValue : function (value, record, rowNum, colNum, grid) {
                    var cal = grid.calendar;
                    var time = record.logicalTime;
                    var mins = (time.getHours()*60) + time.getMinutes();
                    if (mins % cal.rowTitleFrequency == 0) {
                        return isc.Time.toShortTime(time, grid.creator.timeFormatter, true);
                    } else {
                        return "";
                    }
                }
        };
    },
    rebuildFields : function () {
        this.initCacheValues();
        var cal = this.calendar,
            fields = [],
            labelColumnOnLeft = this.labelColumnPosition == "left"
        ;
        
        this.showLabelColumn = cal.showLabelColumn;

        // add the label column at the start, according to settings
        if (this.showLabelColumn && labelColumnOnLeft) {
            fields.add(this._getLabelFieldProperties());
        }

        var lanes = [];
        if (this.usesLanes()) {
            // if the view is using lanes but no lanes were provided, turn the feature off
            //lanes = this.lanes = this.lanes || (cal.lanes && cal.lanes.duplicate()) || [];
            lanes = this.lanes || [];
            if (lanes.length == 0) {
                isc.logWarn("Calendar.showDayLanes has been turned off because no lanes have " +
                    "been provided.");
                this.calendar.showDayLanes = false;
            }
        }
        if (lanes.length > 0) {
            var d = this.startDate.duplicate(),
                scaffolding = isc.DaySchedule._getEventScaffolding(this),
                nDate = isc.DateUtil.createLogicalDate(d.getFullYear(), d.getMonth(), d.getDate()),
                props = { align: "center", canReorder: cal.canReorderLanes, date: nDate, 
                    startDate: isc.DateUtil.getStartOf(isc.DateUtil.createDatetime(nDate), "D", false),
                    endDate: isc.DateUtil.getEndOf(isc.DateUtil.createDatetime(nDate), "D", false)
                }
            ;
            for (var i=0; i<lanes.length; i++) {
                var lane = lanes[i],
                    laneName = lane.name,
                    p = isc.addProperties({}, props, { name: laneName })
                ;
                p[cal.laneNameField] = laneName;
                if (lane.sublanes) {
                    // if there are sublanes, work out the left offsets and widths for them 
                    // now - if a sublane has a specified width, uses that value - otherwise,
                    // applies a width of (laneWidth / subLane count).
                    var laneWidth = this.getLaneWidth(lane),
                        len = lane.sublanes.length,
                        sublaneWidth = Math.floor(laneWidth / len),
                        offset = 0
                    ;
                    for (var j=0; j<len; j++) {
                        var sublane = lane.sublanes[j];
                        sublane[cal.laneNameField] = sublane.name;
                        sublane.left = offset;
                        if (sublane.width == null) sublane.width = sublaneWidth;
                        offset += sublane.width;
                    }
                    lane.width = lane.sublanes.getProperty("width").sum();
                }
                fields.add(isc.addProperties(p, lane));
            }
            scaffolding.setProperty(laneName, "");
            this.setShowHeader(true);
            if (cal.canReorderLanes) this.canReorderFields = cal.canReorderLanes;
            if (cal.minLaneWidth != null) this.minFieldWidth = cal.minLaneWidth;
            this.data = scaffolding;
        } else {
            var nDate = isc.DateUtil.getLogicalDateOnly(this.startDate);
            var weekendDays = cal.getWeekendDays();
            var dayNames = isc.DateUtil.getShortDayNames();
            var numDays = this.isWeekView() ? 7 : 1;
            if (this.shouldShowColumnLayouts() && !this.columnLayouts) {
                this.createColumnLayouts(numDays);
            }
            for (var i=0; i<numDays; i++) {
                var dateStr = nDate.toShortDate(this.dateFormatter, false);
                if (dateStr.match(this._usDateRegex) != null) dateStr = dateStr.substring(5);
                else if (dateStr.match(this._jpDateRegex)) dateStr = dateStr.substring(0,dateStr.length-5);

                var fieldName = "day" + (i+1);
                var field = {
                    name: fieldName, width: "*", autoFitWidth: false, align: "right",
                    // only potentially hide fields in WeekView, never in dayView which will 
                    // skip past weekend days anyway, if showWeekends is false, and it 
                    // might also have multiple fields if dayLanes are showing
                    showIf: "return !list.isWeekView() || list.calendar.showWeekends || !field.isWeekend;",
                    isWeekend: weekendDays.contains(nDate.getDay()),
                    title: dayNames[nDate.getDay()] + " " + dateStr, 
                    date: isc.DateUtil.getLogicalDateOnly(nDate),
                    startDate: isc.DateUtil.getStartOf(isc.DateUtil.createDatetime(nDate), "D", false),
                    endDate: isc.DateUtil.getEndOf(isc.DateUtil.createDatetime(nDate), "D", false),
                    _dayNum: nDate.getDay(),
                    _dateNum: nDate.getDate(),
                    _monthNum: nDate.getMonth(),
                    _yearNum: nDate.getFullYear()
                };
                if (this.shouldShowColumnLayouts()) {
                    field.eventLayoutID = this.columnLayouts[i].ID;
                }
                fields.add(field);
                nDate.setDate(nDate.getDate() + 1);
            }
            this.setShowHeader(this.isWeekView());
            this.data = isc.DaySchedule._getEventScaffolding(this);
        }
            
        // add the label column at the end, according to settings
        if (this.showLabelColumn && !labelColumnOnLeft) {
            fields.add(this._getLabelFieldProperties());
        }
        
                
        if (this.isDrawn()) this.setFields(fields);
        else this.fields = fields;
    },

    fieldStateChanged : function () {
        if (!this.shouldShowColumnLayouts()) return;
        this.updateColumnLayouts();
    },
    createColumnLayouts : function (numDays) {
        if (!this.shouldShowColumnLayouts()) return;
        this.columnLayouts = [];
        for (var i=0; i<numDays; i++) {
            this.columnLayouts.add(this.calendar.createColumnLayout(this));
        }
        this.columnLayoutMap = this.columnLayouts.makeIndex("ID");
    },
    destroyColumnLayouts : function () {
        if (!this.shouldShowColumnLayouts()) return;
        if (this.columnLayoutMap) delete this.columnLayoutMap;
        if (this.columnLayouts) {
            for (var i=0; i<this.columnLayouts.length; i++) {
                this.columnLayouts[i].markForDestroy();
                this.columnLayouts[i] = null;
            }
            this.columnLayouts = null
        }
    },
    updateColumnLayouts : function () {
        if (!this.shouldShowColumnLayouts()) return;
        if (!this.body || !this.body.isDrawn()) {
            this._updateColumnLayoutsOnDraw = true;
            return;
        }
        if (this.fields) {
            var widths = this.getFieldWidths();
            // resize each field's columnLayout - events are layout-members, so will auto-size
            for (var i=this.fields.length-1; i>=0; i--) {
                var f = this.fields[i];
                if (f.eventLayoutID) {
                    var eventLayout = this.columnLayoutMap[f.eventLayoutID];
                    eventLayout.fieldName = f.name;
                    if (!this.body.contains(eventLayout)) {
                        this.body.addChild(eventLayout);
                    }
                    var cLeft = this.getColumnLeft(f.masterIndex);
                    if (eventLayout.getLeft() != cLeft) 
                        eventLayout.setLeft(cLeft);
                    if (eventLayout.getWidth() != widths[i])
                        eventLayout.setWidth(widths[i]);
                    var bHeight = this.body.getScrollHeight();
                    if (eventLayout.getHeight() != bHeight)
                        eventLayout.setHeight(bHeight);
                    if (eventLayout.isDrawn()) eventLayout.redraw();
                    else eventLayout.draw();
                    // make sure sorting is up to date
                    eventLayout.resort();
                    eventLayout.show();
                    eventLayout.bringToFront();
                }
            }
        }
    },
    
    setFields : function () {
        var result = this.Super("setFields", arguments);
        if (this.shouldShowColumnLayouts()) this.updateColumnLayouts();
        return result;
    },
    
    updateFieldDates : function () {
        // update the titles and dates on the existing fields, to reflect the current 
        // startDate and endDate
        var dayNames = isc.DateUtil.getShortDayNames();
        var weekendDays = this.calendar.getWeekendDays();
        var numDays = this.isWeekView() ? 7 : 1;
        var nDate = this.logicalDate.duplicate()
        for (var i=0; i<numDays; i++) {
            var dateStr = nDate.toShortDate(this.dateFormatter, false);
            if (dateStr.match(this._usDateRegex) != null) dateStr = dateStr.substring(5);
            else if (dateStr.match(this._jpDateRegex)) dateStr = dateStr.substring(0,dateStr.length-5);
                    
            var fieldName = "day" + (i+1);
            var props = {
                title: dayNames[nDate.getDay()] + " " + dateStr, 
                date: nDate.duplicate(),
                startDate: isc.DateUtil.adjustDate(nDate, "-0D"),
                endDate: isc.DateUtil.adjustDate(nDate, "+0D"),
                _dayNum: nDate.getDay(),
                _dateNum: nDate.getDate(),
                _monthNum: nDate.getMonth(),
                _yearNum: nDate.getFullYear()
            };
            // apply the new date, date-parts and title to the existing fields
            this.setFieldProperties(fieldName, props);
            nDate.setDate(nDate.getDate() + 1);
        }
        if (this.shouldShowColumnLayouts()) this.updateColumnLayouts();
        if (this.header) this.header.markForRedraw();
    },
    updateRowDates : function () {
        var minsPerRow = this.getTimePerCell(),
            rowCount = (60 / minsPerRow) * 24,
            startDate = this.startDate,
            date = isc.DateUtil.getLogicalDateOnly(startDate)
        ;

        // update the cellDate cache
        isc.DaySchedule._getCellDates(this);

        // recreate the date at midnight in the display timezone
        date = isc.DateUtil.createDatetime(date.getFullYear(), date.getMonth(), date.getDate(),0,0,0,0);

        var logicalDate = this.logicalDate.duplicate(),
            logicalTime = isc.DateUtil.createLogicalTime(0, 0, 0)
        ;

        for (var i=0; i<rowCount; i++) {
            var time = isc.DateUtil.combineLogicalDateAndTime(logicalDate, logicalTime);
            var rec = this.data[i];
            rec.time = time.duplicate();
            rec.logicalDate = logicalDate.duplicate();
            rec.logicalTime = logicalTime.duplicate();
            logicalTime.setMinutes(logicalTime.getMinutes() + minsPerRow);
            //this.logWarn("ROW " + i + " UPDATE: " + isc.echoFull(rec));
        }
    },

    getDateFromPoint : function (x, y, round, useSnapGap) {
        var cal = this.calendar;

        //if (useSnapGap) {
            // when click/drag creating, we want to snap to the eventSnapGap
            //y -= y % cal.getSnapGapPixels();
        //}

        if (x == null && y == null) {
            // if no co-ords passed, assume mouse offsets into the body
            y = this.body.getOffsetY();
            
            x = this.body.getOffsetX();
        }

        if (y > this.body.getScrollHeight())
            return null;
            //y = this.body.getScrollHeight();
        
        var rowNum = this.body.getEventRow(y);
        if (rowNum == -1)  rowNum = 0;
        else if (rowNum == -2) rowNum = this.getTotalRows() - 1;

        var rowHeight = this.cellHeight,
            rowTop = this.body.getRowTop(rowNum),
            colNum = this.body.getEventColumn(x),
            badCol = (colNum < 0)
        ;

        if (colNum == -1) colNum = 0;
        else if (colNum == -2) colNum = this.body.fields.length-1;

        // get the date for the top of the cell
        var colDate = this.getCellDate(rowNum, colNum);
        
        // if getCellDate() returns null, bail
        if (!colDate) return null;
        
        var minsPerRow = this.getTimePerCell(),
            rowsPerHour = cal.getRowsPerHour(this),
            offsetY = y - rowTop,
            eventSnapPixels = cal.getSnapGapPixels(this),
            pixels = offsetY - (offsetY % eventSnapPixels),
            snapGapMins = Math.round(minsPerRow / (rowHeight / eventSnapPixels)),
            snapGaps = pixels / eventSnapPixels,
            minsToAdd = snapGapMins * snapGaps
        ;

        colDate.setMinutes(colDate.getMinutes() + minsToAdd);

        return colDate;
    },

    getCellDate : function (rowNum, colNum) {
        if (!this.body || !this.body.fields || !this._cellDates || !this.body.fields[colNum]) {
            return null;
        }

        // use the last row if invalid rowNum passed
        if (rowNum < 0) rowNum = this.data.getLength() - 1;

        // return the cell date from the array built by _getCellDates()
        var fieldName = this.isDayView() ? "day1" : this.body.fields[colNum][this.fieldIdProperty];
        if (!fieldName.startsWith("day")) return;
        var obj = this._cellDates[rowNum];

        // if obj[fieldName] isn't set, date cells weren't calculated yet - return null
        if (!obj || !obj[fieldName]) return null;
        
        var date = isc.DateUtil.combineLogicalDateAndTime(obj[fieldName + "_logicalDate"], obj.logicalTime);

        return date;
    },

    getCellEndDate : function (rowNum, colNum) {
        if (!this.body || !this.body.fields || !this._cellDates || !this.body.fields[colNum]) {
            return null;
        }

        // use the last row if invalid rowNum passed
        if (rowNum < 0) rowNum = this.data.getLength() - 1;

        // return the cell date from the array built by _getCellDates()
        var fieldName = this.isDayView() ? "day1" : this.body.fields[colNum][this.fieldIdProperty];
        if (!fieldName.startsWith("day")) return;
        var obj = this._cellDates[rowNum];

        if (!obj || !obj[fieldName]) return null;
        
        var date = isc.DateUtil.combineLogicalDateAndTime(obj[fieldName + "_logicalDate"], obj.logicalEndTime);

        return date;
    },

    getEventLeft : function (event) {
        var col = this.getColFromDate(this.calendar.getEventStartDate(event), event[this.calendar.laneNameField]);
        return this.body.getColumnLeft(col);
    },
    getEventRight : function (event) {
        var col = this.getColFromDate(this.calendar.getEventEndDate(event), event[this.calendar.laneNameField]);
        return this.body.getColumnLeft(col) + this.body.getColumnWidth(col);
    },
    
    // get the left offset of a date in this view - will either be zero (dayView) or the
    // getColumnLeft() of the day column containing the date
    getDateLeftOffset : function (date) {
        var col = this.getColFromDate(date);
        if (col != null) return this.body.getColumnLeft(col);
        return 0;
    },

    // get the top offset of a date in this view - will be the top of the row that contains 
    // the date, plus any snapGap heights within the row
    getDateTopOffset : function (date, lane) {
        var cal = this.calendar;
        // get the time in the display timezone
        var time = isc.DateUtil.getLogicalTimeOnly(date);
        var hours = time.getHours() 
        var snapCount = Math.round(time.getMinutes() / this.getTimePerSnapGap("mn"));
        var snapTop = this.getRowTop(time.getHours() * cal.getRowsPerHour());
        snapTop += (snapCount * this.getSnapGapPixels());

        return snapTop;
    },

    setLanes : function (lanes, skipRefreshEvents) {
        var cal = this.creator;
        // make sure there's a lane.name on each lane - see comment in the method
        cal.checkLaneNames(lanes);
        this.lanes = lanes;
        this.laneMap = this.lanes.makeIndex("name");
        this.rebuildFields();
        if (!skipRefreshEvents) this.refreshEvents("setLanes");
    },
    getLane : function (laneName) {
        return this.getLaneMap()[laneName];
    },
    getLaneIndex : function (lane) {
        if (!this.usesLanes()) return;
        var fields = this.body.fields,
            index = -1;
        if (isc.isAn.Object(lane)) index = fields.indexOf(lane)
        else if (isc.isA.String(lane)) {
            index = fields.findIndex("name", lane);
            if (index < 0) index = fields.findIndex(this.calendar.laneNameField, lane);
        }
        return index;
    },
    getLaneWidth : function (lane) {
        var width = null;
        if (isc.isA.String(lane)) lane = this.getLane(lane);
        if (lane) {
            if (lane.width) width = lane.width;
            else {
                var fieldName = this.calendar.laneNameField,
                    index = this.body.fields.findIndex(fieldName, lane[fieldName])
                ;
                width = index >= 0 ? this.body.getColumnWidth(index) : null;
            }
        }
        return width;
    },
    getLaneFromPoint : function (x, y) {
        if (!this.usesLanes()) return null;
        if (x == null) x = this.body.getOffsetX();
        
        var colNum = this.body.getEventColumn(x),
            lane = this.body.fields[colNum]
        ;

        return !this.isGroupNode(lane) ? lane : null;
    },
    getSublaneFromPoint : function (x, y) {
        if (!this.hasSublanes()) return null;
        if (x == null) x = this.body.getOffsetX();

        var colNum = this.body.getEventColumn(x),
            lane = this.body.fields[colNum],
            sublanes = lane ? lane.sublanes : null
        ;

        if (!sublanes) return null;

        var colLeft = this.body.getColumnLeft(colNum),
            laneOffset = x - colLeft,
            laneWidth = this.getLaneWidth(lane),
            len = sublanes.length,
            offset = 0
        ;
        for (var i=0; i<len; i++) {
            if (offset + sublanes[i].width > laneOffset) {
                return sublanes[i];
            }
            offset += sublanes[i].width;
        }

        return null;
    },
    
    draw : function (a, b, c, d) {
        this.invokeSuper(isc.DaySchedule, "draw", a, b, c, d);

        this.logDebug('draw', 'calendar');
        // call refreshEvents() whenever we're drawn
        // see comment above dataChanged for the logic behind this
        
        this.body.addChild(this.eventDragCanvas, null, false);
        this.eventDragCanvas.setView(this);

        if (this._updateColumnLayoutsOnDraw) {
            delete this._updateColumnLayoutsOnDraw;
            this.updateColumnLayouts();
        }

        if (this._refreshEventsOnDraw) {
            delete this._refreshEventsOnDraw;
            this.refreshEvents("draw");
        }

        // if scrollToWorkday is set, do that here
        if (this.calendar.scrollToWorkday) this.delayCall("scrollToWorkdayStart");

        if (this._fireViewChangedOnDraw) {
            delete this._fireViewChangedOnDraw;
            this.calendar.currentViewChanged(this.viewName);
        }

    },
    
    // To be used with calendar.scrollToWorkday 
    scrollToWorkdayStart : function () {
        this.calendar.scrollToTime(this.getWorkdayRange(false).start);
    },
    
    getWorkdayRange : function (dayRanges) {
        var fields = this.fields,
            result = { start: isc.Time.parseInput("23:59"), end: isc.Time.parseInput("00:01") },
            cal = this.calendar,
            date = cal.chosenDate,
            time
        ;

        if (this.isWeekView() && dayRanges != false) {
            // get the largest range across the week
            for (var i=0; i < fields.length; i++) {
                date = fields[i].date; //this.getDateFromCol(i);
                if (isc.isA.Date(date)) {
                    time = isc.Time.parseInput(cal.getWorkdayStart(date));
                    if (isc.DateUtil.compareDates(result.start, time) < 0) {
                        result.start = time;
                    }
                    time = isc.Time.parseInput(cal.getWorkdayEnd(date));
                    if (isc.DateUtil.compareDates(result.end, time) > 0) {
                        result.end = time;
                    }
                }
            }
        } else if (cal.showDayLanes && dayRanges != false) {
            // get the largest range across the lanes in the day
            for (var i=0; i < fields.length; i++) {
                var field = fields[i],
                    lane = field[cal.laneNameField]
                ;
                if (isc.isA.Date(date)) {
                    time = isc.Time.parseInput(cal.getWorkdayStart(date, lane));
                    if (isc.DateUtil.compareDates(result.start, time) < 0) {
                        result.start = time;
                    }
                    time = isc.Time.parseInput(cal.getWorkdayEnd(date, lane));
                    if (isc.DateUtil.compareDates(result.end, time) > 0) {
                        result.end = time;
                    }
                }
            }
        } else {
            result.start = isc.Time.parseInput(cal.getWorkdayStart(cal.chosenDate));
            result.end = isc.Time.parseInput(cal.getWorkdayEnd(cal.chosenDate));
        }
        return result;
    },

    getRowHeight : function (record, rowNum) {
        return this.cellHeight;
    },

    cacheWorkdayRowHeight : function () {
        // if the viewportHeight has changed, update this.cellHeight
        var viewportHeight = this.getViewportHeight() - (this.showHeader ? this.headerHeight : 0);
        if (this.calendar.showWorkday) {
            // need to resize rows so the workday fits in the viewport
            var cal = this.calendar,
                // rowCount to divide the space by is work-day hours * rowsPerHour
                range = cal.getWorkdayRange(),
                hours = range.end.getHours() - range.start.getHours(),
                rowCount = hours * cal.getRowsPerHour(this),
                // rowHeight is the viewportHeight divided by the rowCount
                rowHeight = Math.floor(viewportHeight / rowCount)
            ;
            if (this.calendar.sizeToWorkday) {
                this.cellHeight = Math.max(this.calendar.minRowHeight, rowHeight);
                if (this.body) this.body.cellHeight = Math.max(this.calendar.minRowHeight, rowHeight);
            }

            //this.logWarn(this.viewName + " - in cacheWorkdayRowHeight" +
            //    " -- viewportHeight: " + viewportHeight +
            //    " -- body: " + (this.body != null) + 
            //    " -- drawn: + " + this.isDrawn() + 
            //    " -- setting height " + this.cellHeight
            //);

            // when Calendar.limitToWorkday is true, we need to suppress scrolling beyond the 
            // workday rows - to this end, cache the first and last workday-rowNums, the min/max 
            // topOffsets for the workday, and the height of the workday at the calculated cellHeight
            this._workdayRowHeight = Math.max(this.calendar.minRowHeight, rowHeight);
            this._workdayFirstRow = range.start.getHours() * cal.getRowsPerHour(this);
            this._workdayLastRow = range.end.getHours() * cal.getRowsPerHour(this);
            this._workdayMinTop = this.cellHeight * this._workdayFirstRow;
            this._workdayMaxTop = this._workdayMinTop;
            this._workdayHeight = this.cellHeight * rowCount;
            if (this._workdayHeight > viewportHeight) {
                this._workdayMaxTop += (this._workdayHeight - viewportHeight);
            }

            //this.logWarn(this.viewName + " - in cacheWorkdayRowHeight" +
            //    " -- viewportHeight: " + viewportHeight +
            //    " -- cellHHeight: " + this.cellHeight +
            //    " -- workdayMinTop: " + this._workdayMinTop + 
            //    " -- workdayMaxTop: " + this._workdayMaxTop + 
            //    " -- workdayHeight: " + this._workdayHeight
            //);

            this._lastViewportHeight = viewportHeight;
        }
        return this.cellHeight;
    },
    
    getDayFromCol : function (colNum) {
        if (colNum < 0) return null;
        var dayNum = this.body.fields.get(colNum)._dayNum;
        return dayNum;
    },

    getDateFromCol : function (colNum) {
        if (colNum < 0) return null;
        var cellDate = this.getCellDate(0, colNum);
        return cellDate;
    },

    getColFromDate : function (date, lane) {
        var lDate = isc.DateUtil.getLogicalDateOnly(date);
        for (var i=0; i<this.body.fields.length; i++) {
            var fld = this.body.fields.get(i);
            if (!fld.date) continue;
            if (isc.DateUtil.compareLogicalDates(lDate, fld.date) == 0) {
                if (this.usesLanes() && lane) {
                    // showDayLanes has multiple columns with the same date, but different lane
                    // names -- only return true if date and lane name match
                    if (fld.lane == lane) return i;
                } else return i;
            }
        }
        return null;
    },
    
    // returne the fieldName for the field with the passed date - better than using colNum
    // which confuses where you can call a method from, in the presence of frozen fields 
    // - overrides on the body have different colNum than overrides on the grid, and some 
    // Calendar methods can be called from either place
    getFieldNameFromDate : function (date, lane) {
        var field = this.getFieldFromDate(date, lane);
        if (field) return field.name;
        return "";
    },

    // return the field with the passed date
    getFieldFromDate : function (date, lane) {
        var lDate = isc.DateUtil.getLogicalDateOnly(date);
        for (var i=0; i<this.body.fields.length; i++) {
            var fld = this.body.fields.get(i);
            if (!fld.date) continue;
            if (isc.DateUtil.compareLogicalDates(lDate, fld.date) == 0) {
                if (this.usesLanes() && lane) {
                    // showDayLanes has multiple columns with the same date, but different lane
                    // names -- only return the fieldName if date and lane name match
                    if (fld.lane == lane) return fld;
                } else return fld;
            }
        }
        return null;
    },

    isLabelCol : function (colNum) {
        var frozenLength = this.frozenFields ? this.frozenFields.length : 0;
        if (colNum < frozenLength) return true;
        var date = this.getCellDate(1, colNum-frozenLength);
        return date == null;
    },
    
    // day/weekView - helper function for detecting when a weekend is clicked, and weekends are disabled
    cellDisabled : function (rowNum, colNum) {
        var body = this.getFieldBody(colNum);
        if (!body || body == this.frozenBody) return false;
        var col = this.getLocalFieldNum(colNum),
            date = this.getCellDate(rowNum, col)
        ;
        if (this._dstCells) {
            var cells = this._dstCells;
            // disable any cells that we know cover DST crossover hours - these are
            // detected by _getCellDates(), which runs when the range changes
            for (var i=0; i<cells.length; i++) {
                if (cells[i].rowNum == rowNum && cells[i].colNum == col) {
                    return true;
                }
            }
        }
        return this.calendar.shouldDisableDate(date, this);
    },
    
    // helper function to refresh dayView cell styles for weekend disabling
    refreshStyle : function () {
        if (!this.body) return;
        if (this.isWeekView() || this.calendar.showDayLanes) {
            // need to refresh all cells to cater for weekView (for workday handling)
            this.markForRedraw();
            return;
        }
        for (var i = 0; i < this.data.length; i++) {
            this.body.refreshCellStyle(i, 1);    
        }
    },
    
    // use the chosen week start to figure out the base date, then add the headerFieldNum
    // to that to get the appropriate date. Use dateChooser.dateClick() to simplify code.
    headerClick : function (headerFieldNum, header) {
        var cal = this.calendar;

        if (this.isLabelCol(headerFieldNum)) return true;
        if (cal.showDayLanes && !this.isWeekView()) return true;

        var fld = this.getField(headerFieldNum);
        cal.selectTab(0);
        cal.setChosenDate(fld.date);
        return true;
    },

    cellMouseDown : function (record, rowNum, colNum) {       
        if (this.isLabelCol(colNum) || this.cellDisabled(rowNum, colNum)) return true; 
        
        var cal = this.calendar;
        
        // if backgroundMouseDown is implemented, run it and return if it returns false
        var startDate = this.getCellDate(this.body.getEventRow(), this.body.getEventColumn());
        if (cal.backgroundMouseDown && cal.backgroundMouseDown(startDate) == false) return;

        // don't set up selection tracking if canCreateEvents is disabled
        if (!cal.canCreateEvents) return true;
        // first clear any previous selection   
        this.clearSelection();
        this._selectionTracker = {};
        this._selectionTracker.colNum = colNum;
        this._selectionTracker.startRowNum = rowNum;
        this._selectionTracker.endRowNum = rowNum;
        this._mouseDown = true;
        this.refreshCellStyle(rowNum, colNum);
    },
    
    cellOver : function (record, rowNum, colNum) {
        // if Browser.isTouch, don't allow long events to be created by dragging
        if (this.calendar.canDragCreateEvents == false) return;
        if (this._mouseDown && this._selectionTracker) {
            var refreshRowNum;
            // selecting southbound
            if (this._selectionTracker.startRowNum < this._selectionTracker.endRowNum) {
                // should select this cell
                if (rowNum > this._selectionTracker.endRowNum) {
                    refreshRowNum = rowNum;             
                } else { // should deselect the previous end row number
                    refreshRowNum = this._selectionTracker.endRowNum;
                }
                // trigger cell style update from getCellStyle
                this._selectionTracker.endRowNum = rowNum;
            // selecting northbound
            } else {
                // should select this cell
                if (rowNum < this._selectionTracker.endRowNum) {
                    refreshRowNum = rowNum;    
                } else { // should deselect the previous end row number
                    refreshRowNum = this._selectionTracker.endRowNum;
                }
                this._selectionTracker.endRowNum = rowNum;
            }
            var refreshGap = 6,
                col = this._selectionTracker.colNum,
                rowCount = this.getTotalRows()
            ;
            for (var i = refreshRowNum - refreshGap; i < refreshRowNum + refreshGap; i++) {
                // don't assume 48 1/2 hour slots in a day - that's already not true, because
                // rowsPerHour/minutesPerRow might be set - also represents a step toward 
                // facilities to show any arbitrary period of time in a vertical calendar 
                // column, including more than 24 hours
                if (i >= 0 && i < rowCount) this.refreshCellStyle(i, col);        
            }                 
        }
    },
    
    cellMouseUp : function (record, rowNum, colNum) {
        if (!this._selectionTracker) return true;

        this._mouseDown = false;
        var sRow, eRow, diff;
        // cells selected upwards
        if (this._selectionTracker.startRowNum > this._selectionTracker.endRowNum) {
            sRow = this._selectionTracker.endRowNum;
            eRow = this._selectionTracker.startRowNum;
        // cells selected downwards
        } else {
            eRow = this._selectionTracker.endRowNum;
            sRow = this._selectionTracker.startRowNum;
        }
        diff = eRow - sRow + 1;

        var cal = this.calendar,
            startDate = cal.getCellDate(sRow, colNum, this),
            endDate = cal.getCellDate(sRow+diff, colNum, this)
        ;
        if (!endDate) {
            // if there's no end date (click in last row), assume the end of the day
            endDate = isc.DateUtil.getEndOf(startDate, "D", false, this.firstDayOfWeek);
        }

        // if backgroundClick is implemented, and there's no selection (a click, not just mouseUp), 
        // run it and bail if it returns false
        if (diff == 1 && cal.backgroundClick) {
            if (cal.backgroundClick(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }
        // if backgroundMouseUp is implemented, run it and bail if it returns false
        if (cal.backgroundMouseUp) {
            if (cal.backgroundMouseUp(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }

        var lane, sublane;
        if (cal.showDayLanes && cal.dayViewSelected()) {
            lane = this.getLaneFromPoint();
            sublane = lane ? this.getSublaneFromPoint() : null;

        }
        var newEvent = cal.createEventObject(null, 
                startDate, 
                endDate,
            lane && lane.name, sublane && sublane.name
        );
        cal.showEventDialog(newEvent, true);
        return isc.EH.STOP_BUBBLING;
    },

    clearSelection : function () {
        if (this._selectionTracker) {
            var sRow, eRow, colNum = this._selectionTracker.colNum;
            // establish order of cell refresh
            if (this._selectionTracker.startRowNum < this._selectionTracker.endRowNum) {
                sRow = this._selectionTracker.startRowNum;
                eRow = this._selectionTracker.endRowNum;
            } else {
                sRow = this._selectionTracker.endRowNum;
                eRow = this._selectionTracker.startRowNum;
            }
            // remove selection tracker so cells get reset to baseStyle
            this._selectionTracker = null;
            for (var i = sRow; i < eRow + 1; i++) {
                this.refreshCellStyle(i, colNum);
            }
        }
    },

    destroyEvents : function () {
        if (!this.body || !this.body.children) return;

        var len = this.body.children.length;
        while (--len >= 0) {
            var child = this.body.children[len];
            if (child && !child.destroyed) {
                child.clear();
                child.deparent();
                child.destroy();
            }
            child = null;
        }
        this._usedEventMap = null;
        this._usedCanvasMap = null;
        this._eventCanvasPool = null;
    },
    
    // day/weekView
    getBaseStyle : function (record, rowNum, colNum) {
        var cal = this.calendar,
            date = cal.getCellDate(rowNum, colNum, this),
            field = this.getField(colNum),
            // the lane is a field (column) in vertical views
            style = (field && field.styleName) || 
                (date && cal.getDateStyle ? cal.getDateStyle(date, rowNum, colNum, this) : null),
            isWeek = this.isWeekView()
        ;

        if (style) {
            // getDateStyle() returned a style - just return that
            return style;
        }

        if (this.isLabelCol(colNum)) return this.labelColumnBaseStyle;

        if (!cal.showWorkday || !cal.styleWorkday) return this.baseStyle;

        var body = this.getFieldBody(colNum),
            bodyCol = colNum
        ;
        if (body == this.body) bodyCol = this.getLocalFieldNum(colNum);

        var dayNum = isWeek ? this.getDayFromCol(bodyCol) : cal.chosenDate.getDay();

        // workdayStart/end need to be based on current date and not just parsed workdayStart.
        // this fixes an issue where parsed date could have the wrong day.
        var wStart = isWeek ? this.getDateFromCol(bodyCol) : cal.chosenDate.duplicate(),
            wEnd = wStart.duplicate(),
            currRowTime = date ? date.duplicate() : null,
            lane = this.usesLanes() ? this.body.getField(bodyCol)[cal.laneNameField] : null
        ;

        if (currRowTime) {
            var parsedStart = isc.Time.parseInput(cal.getWorkdayStart(currRowTime, lane)),
                parsedEnd = isc.Time.parseInput(cal.getWorkdayEnd(currRowTime, lane))
            ;

            // need to set hours and minutes of start and end to the same as workdayStart and
            // workdayEnd
            wStart.setHours(parsedStart.getHours(), parsedStart.getMinutes(), 0, 0);
            wEnd.setHours(parsedEnd.getHours(), parsedEnd.getMinutes(), 0, 0);

            var dayIsWorkday = cal.dateIsWorkday(currRowTime, lane);
            currRowTime = currRowTime.getTime();
            if (dayIsWorkday && wStart.getTime() <= currRowTime && currRowTime < wEnd.getTime()) {
                return cal.workdayBaseStyle;
            } else {
                return this.baseStyle;
            }
        } else {
            return this.baseStyle;
        }
    },
    getCellStyle : function (record, rowNum, colNum) {
        var cal = this.calendar,
            field = this.getField(colNum),
            isSelected = this.isSelected(record),
            gridDisabled = this.isDisabled(),
            cellDate = field.date ? 
                isc.DateUtil.combineLogicalDateAndTime(field.date, record.logicalTime) : null,
            cellDisabled = cellDate ? cal.shouldDisableDate(cellDate) : false
        ;

        var bStyle = this.getBaseStyle(record, rowNum, colNum);

        if (gridDisabled || (cellDisabled && !isSelected)) {
            bStyle += "Disabled";
        }

        if (this.isLabelCol(colNum)) {
            return bStyle;
        }

        if (this._selectionTracker && this._selectionTracker.colNum == colNum) {
            var sRow = this._selectionTracker.startRowNum,
                eRow = this._selectionTracker.endRowNum;
            // if rowNum is within start and end of selection, return selected style
            if (rowNum >= sRow && rowNum <= eRow || rowNum >= eRow && rowNum <= sRow) {
                if (bStyle == cal.workdayBaseStyle) bStyle += "Selected";
                else bStyle = cal.selectedCellStyle;
                return bStyle;
            }
        } 

        // odd rows in vertical views
        if (this.alternateRecordStyles && rowNum % 2 != 0) {
            // odd row in dayView, with alternateRecordStyles
            if (bStyle != cal.workdayBaseStyle) bStyle += "Dark";
        } else if (this.alternateFieldStyles && colNum % 2 != 0) {
            if (cal.dayViewSelected() && cal.showDayLanes) {
                // odd column in dayView with showDayLanes and alternateFieldStyles
                if (bStyle != cal.workdayBaseStyle) bStyle += "Dark";
            }
        }

        return bStyle;
    },

    getWorkdayRowRange : function () {
        var start = this._workdayMinTop / this.cellHeight,
            end = start + (this._workdayHeight / this.cellHeight)
        ;
        return { start: start, end: end };
    }

// end DaySchedule overrides

   
});

// WeekSchedule
// --------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("WeekSchedule", "DaySchedule");
isc.WeekSchedule.addProperties({
    rangeUnit: "W"
});

// MonthSchedule
// --------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("MonthSchedule", "CalendarView");

// Create a separate subclass for month schedule body

isc.ClassFactory.defineClass("MonthScheduleBody", "GridBody");

isc.MonthSchedule.changeDefaults("headerButtonProperties", {
    showRollOver: false, 
    showDown: false, 
    cursor: "default"  
});

isc.MonthSchedule.changeDefaults("bodyProperties", {
    redrawOnResize:true,
    // don't set overflow - means we show a vertical scrollbar if the cell heights would 
    // otherwise be less than calendar.minimumDayHeight
    //overflow: "visible",
    // this is necessary because monthView shows rows of two distinct heights (dayHeader/Body)
    fixedRowHeights: false
});

isc.MonthSchedule.addProperties({
    rangeUnit: "M",
    autoDraw: false,
    leaveScrollbarGap: false,

    showAllRecords: true,

    // show header but disable all header interactivity
    showHeader: true,
    showHeaderContextMenu: false,
    canSort: false,
    canResizeFields: false,
    canReorderFields: false,

    // disable header resizing by doubleclick
    canAutoFitFields:false,

    canHover: true,
    showHover: true,
    // show cell-level rollover
    showRollOver:true,
    useCellRollOvers:true,
    hoverByCell: true,

    showViewHovers: false,

    // default dateEditingStyle for monthView is "datetime", because you can't drag events
    // around to change days, in this view - should probably support that as well
    //dateEditingStyle: "datetime",

    // set up cell-level drag selection
    //canDrag:true,
    // dragAppearance:"none",
    //canDragSelect:true,
    canSelectCells:true,
    navigateOnTab:false,
    
    dayHeaderHeight: 20,
    // set alternateRecordStyle to false: for many skins, not having this set to
    // false leads to undefined styles being generated like 'calMonthOtherDayBodyDisabledDark'.
    // See GridRenderer.getCellStyleIndex() where it checks for this.alternateRowStyles.
    // We manually set row styles for the month view, so it should be safe to disable
    // alternate row styles.
    alternateRecordStyles: false,
    
    // return the string to show in the Calendar controlsBar
    getDateLabelText : function (startDate, endDate) {
        // ignore the params passed in - just show the month and year from the chosenDate
        return "<b>" + this.chosenDate.getShortMonthName() + " " + this.chosenDate.getFullYear() + "</b>";
    },

    initWidget : function () {
        var cal = this.calendar;
        this.fields = [
            {name: "day1", align: "center"},
            {name: "day2", align: "center"},
            {name: "day3", align: "center"},
            {name: "day4", align: "center"},
            {name: "day5", align: "center"},
            {name: "day6", align: "center"},
            {name: "day7", align: "center"}
        ];

        // set day titles
        this.firstDayOfWeek = cal.firstDayOfWeek;
        var dayNames = isc.DateUtil.getShortDayNames();
        var weekendDays = cal.getWeekendDays();
        for (var i = 0; i < 7; i++) {
            var dayNum = (i + this.firstDayOfWeek) % 7;
            this.fields[i].title = dayNames[dayNum];
            this.fields[i]._dayNum = dayNum;
            // store day index to easily get to the right day properties stored on the month
            // records from methods like formatCellValue
            this.fields[i]._dayIndex = i + 1;
            // hide weekends
            if (weekendDays.contains(dayNum)) {
                this.fields[i].showIf = "return list.creator.showWeekends!=false;";
            }

        }

        this.minimumDayHeight = cal.minimumDayHeight;
        
        // set the range dates
        if (this.rangeUnit) {
            this.periodStartDate = this.startDate = isc.DateUtil.getStartOf(this.chosenDate, 
                this.rangeUnit, false, this.firstDayOfWeek);
            this.periodEndDate = this.endDate = isc.DateUtil.getEndOf(this.chosenDate, 
                this.rangeUnit, false, this.firstDayOfWeek);
        }
        
        this.Super("initWidget", arguments);
        
        // delay refreshing events (which also rebuilds rows in monthView) until draw
        this._refreshEventsOnDraw = true;
    },
    
    canSelectCell : function (rowNum, colNum) {
        // disallow grid-selection of disabled dates
        return !this.calendar.shouldDisableDate(this.calendar.getCellDate(rowNum, colNum, this));
    },
    
    getCalendar : function () {
        return this.calendar;
    },
    
    getTimePerCell : function (unit) {
        // cells are always a day in monthView
        return isc.DateUtil.convertPeriodUnit(1, "d", "mn");
    },
    getTimePerSnapGap : function (unit) {
        // snaps are always a day in monthView
        return isc.DateUtil.convertPeriodUnit(1, "d", "mn");
    },
    
    getDayArray : function () {
        var dayArr = [], eventArr, endDate,
            cal = this.calendar,
            displayDate = isc.DateUtil.createLogicalDate(cal.year, cal.month, 1)
        ;
        
        // go back to the first day of the week
        while (displayDate.getDay() != this.firstDayOfWeek) {
            this.incrementDate(displayDate, -1);
        }

        // special case when hiding weekends, can have the first row be entirely from the previous
        // month. In this case, hide the first row by adding 7 days back to the displayDate
         if (!cal.showWeekends) {
            var wEnds = cal.getWeekendDays();
            var checkDate = displayDate.duplicate();
            var hideFirstRow = true;
            for (var i = 0; i <= 7 - wEnds.length; i++) {
                if (checkDate.getMonth() == cal.month) {
                    hideFirstRow = false;
                    break;
                }
                this.incrementDate(checkDate,1);
            }
            if (hideFirstRow) this.incrementDate(displayDate, 7);
           
        }
        
        // store the visible-startDate for the view as a datetime
        this.startDate = isc.DateUtil.adjustDate(displayDate, "-0D");
        
        // 40 days from start date seems like a nice round number for getting 
        // all the relevant events in a month, with extra days for adjacent months
        this.endDate = isc.DateUtil.adjustDate(displayDate, "+40D");

        // use the view's periodStart/EndDates, not logical dates, when getting events
        eventArr = cal._getEventsInRange(this.startDate, this.endDate, this);

        // sort events by date
        eventArr.sortByProperty("name", true, 
            function (item, propertyName, context) {
                return item[context.startDateField].getTime();
            }, cal
        );
        this._eventIndex = 0;
        for (var i=0; i<6; i++) { // the most we need to iterate is 6, sometimes less
            // add rows of data to designate days and day headers. Each row is either a header
            // or a day body.
            if (cal.showDayHeaders) dayArr.add(this.getHeaderRowObject(displayDate));
            dayArr.add(this.getEventRowObject(displayDate, eventArr));
            this.incrementDate(displayDate, 7);
            // if we hit the next month, don't keep adding rows, we're done.
            if (displayDate.getMonth() != cal.month) break;
        }

        // cache rowHeights on the records to avoid recalculating them repeatedly, and 
        // potentially at the wrong time, from getRowHeight()
        this.cacheRowHeights(dayArr);
        
        // cache the array of records
        this._dayArray = dayArr;

        return dayArr;
    },
    
    resized : function () {
        if (!this._dayArray) return;
        // update the rowHeights cached on the current data, so all space is used
        this.cacheRowHeights();
        this.markForRedraw();
    },
    
    cacheRowHeights : function (rows) {
        rows = rows || this._dayArray;
        var cal = this.calendar,
            dayHeaders = cal.showDayHeaders,
            dayHeaderHeight = dayHeaders ? this.dayHeaderHeight : 0,
            dayCount = dayHeaders ? rows.length / 2 : rows.length,
            bodyHeight = this.body.getVisibleHeight(),
            usedHeight = dayHeaders ? dayHeaderHeight * dayCount : 0,
            rowHeight = Math.floor(bodyHeight / rows.length)
        ;
        
        if (dayHeaders) {
            // sum the header and body cell heights
            rowHeight = Math.floor((bodyHeight - usedHeight) / dayCount);
            // enforce minimum total day height (header + body cell)
            var minHeight = this.minimumDayHeight - dayHeaderHeight;
            if (rowHeight < minHeight) rowHeight = minHeight; 
            usedHeight += (rowHeight * dayCount);
        } else {
            usedHeight = rowHeight * rows.length;
        }
        
        var extra = bodyHeight - usedHeight;

        for (var i=0; i<rows.length; i++) {
            if (rows[i].isHeaderRow) rows[i].rowHeight = dayHeaderHeight;
            else {
                rows[i].rowHeight = rowHeight;
                if (extra > 0 && i == rows.length - 1) {
                    // add the extra pixels to the last row to use available space
                    rows[i].rowHeight += extra;
                }
            }
        }
        //this.logWarn(isc.echoFull(rows.getProperty("rowHeight")));

    },
    
    getHeaderRowObject : function (theDate) {
        var obj = {};
        var nDate = theDate.duplicate();
        for (var i=0; i<7; i++) {
            obj["day" + (i + 1)] = nDate.getDate();
            // store the complete date
            obj["date" + (i + 1)] = nDate.duplicate();
            this.incrementDate(nDate, 1);
        }
        obj.isHeaderRow = true;
        return obj;
    },
    
    _$cellDateKey: "date", 
    getCellDate : function (rowNum, colNum) {
        if (rowNum == null && colNum == null) {
            rowNum = this.getEventRow();
            colNum = this.getEventColumn();
        }
        if (rowNum < 0 || colNum < 0) return null;
        var fieldIndex = this.body.fields.get(colNum)._dayIndex,
            record = this.getRecord(rowNum),
            key = [this._$cellDateKey, fieldIndex].join(""),
            cellDate = record[key]
        ;

        return cellDate;
    },
    
    getCellEndDate : function (rowNum, colNum) {
        // monthView - cellEndDate is the end of the cell's day
        var cellDate = this.getCellDate(rowNum, colNum);
        if (!cellDate) return null;
        return isc.DateUtil.getEndOf(cellDate, "d", false);
    },
    
    incrementDate : function (date, offset) {
        var curDate = date.getDate();
        date.setDate(curDate + offset);
        // In some timezones, DST can cause certain date/times to be invalid so if you attempt
        // to set a java date to (say) 00:00 on Oct 16, 2011, with native timezone set to 
        // Brasilia, Brazil, the actual date gets set to 23:00 on Oct 15th, leading to 
        // bad display.
        // Workaround this by tweaking the time to avoid such an issue
        
        if (date.getDate() == (curDate+offset) -1) {
            date.setHours(date.getHours() + 1);
            date.setDate(curDate + offset);
        }
        return date;
    },
    
    getEventRowObject : function (theDate, events) {
        var obj = {};
        var nDate = theDate.duplicate();
        for (var i=0; i<7; i++) {
            var evArr = [];
            while (this._eventIndex < events.length) {
                var evnt = events[this._eventIndex];
                if (evnt[this.calendar.startDateField].getMonth() != nDate.getMonth() 
                    || evnt[this.calendar.startDateField].getDate() != nDate.getDate()) {
                    break;    
                } else {
                    evArr.add(evnt);
                    this._eventIndex += 1;
                }
                
            }
            // store the day number here too
            obj["day" + (i + 1)] = nDate.getDate();
            // store the complete date
            obj["date" + (i + 1)] = nDate.duplicate();
            // store the events
            obj["event" + (i + 1)] = evArr;
            this.incrementDate(nDate, 1);
        }
        return obj;
    },
    
    // utility method used for retrieving events from a given row and column number.
    // used by calendar.monthViewEventCick
    getEvents : function (rowNum, colNum) {
        var body = this.getFieldBody(colNum);
        if (!body || body == this.frozenBody) return false;
        var col = this.getLocalFieldNum(colNum);
        var day = this.getDayFromCol(col);

        var dayIndex = this.fields.get(col)._dayIndex;
        var events = this.data[rowNum]["event" + dayIndex];
        return events;
    },
    
    getEventCell : function (event) {
        var data = this.data;
        for (var colNum = 0; colNum < this.fields.length; colNum++) {
            var dayIndex = this.fields[colNum]._dayIndex,
                eventTitle = "event" + dayIndex;
            for (var rowNum = 0; rowNum < data.length; rowNum++) {
                var events = data.get(rowNum)[eventTitle];
                if (events != null && events.contains(event)) {
                    return [rowNum,colNum];
                }
            }
        }
    },
    
    getDayFromCol : function (colNum) {
        var dayNum = this.body.fields.get(colNum)._dayNum;
        return dayNum;
        
    },
    
    getDateCells : function (date) {
        for (var i=0; i<this.data.length; i++) {
            var row = this.data[i];
            for (var key in row) {
                if (key.startsWith("date") && 
                    isc.DateUtil.compareLogicalDates(date, row[key]) == 0) 
                {
                    var cells = [];
					if (this.calendar.showDayHeaders) 
                        cells.add([i+1, new Number(key.substring(4,5))-1]);
                    cells.add([i, new Number(key.substring(4,5))-1])
                    return cells;
                }
            }
        }
        return null;
    },

    
    refreshEvents : function () {
        var cal = this.calendar;
        // bail if no data yet
        if (!cal.hasData()) return;
        this.logDebug('refreshEvents: month', 'calendar');
        
        // for monthView, always run setData() from refreshEvents(), because events are in the
        // cellHTML, which needs regenerating in case there are new events in the data
        this.year = cal.year;
        this.month = cal.month;
        var data = this.getDayArray();
        if (this.data) this.setData([]);
        this.setData(data);

        // now the data is present, tweak the stored endDate to match the visible one
        this.endDate = this.getCellEndDate(this.getData().length-1, this.body.fields.length-1);

        this.selectChosenDateCells();
        if (cal.eventsRendered && isc.isA.Function(cal.eventsRendered)) 
            cal.eventsRendered();
   },
    
    rowIsHeader : function (rowNum) {
        var cal = this.calendar;
        if (!cal.showDayHeaders || (cal.showDayHeaders && rowNum % 2 == 1)) return false;
        else return true;
    },
    
    formatCellValue : function (value, record, rowNum, colNum) {
        if (!record) return;
        var cal = this.calendar,
            fieldIndex = this.fields.get(colNum)._dayIndex,
            evtArr = record["event" + fieldIndex],
            currDate = record["date" + fieldIndex],
            isOtherDay = currDate.getMonth() != cal.month;
       
        if (this.rowIsHeader(rowNum)) {
            if (!cal.showOtherDays && isOtherDay) {
                return "";  
            } else {
                //isc.logWarn('here:' + [value, currDate.getDate(), rowNum, colNum]);
  
                return cal.getDayHeaderHTML(currDate, evtArr, cal, rowNum, colNum); 
            }
        } else {
            if (!cal.showOtherDays && isOtherDay) {
                return "";  
            } else {
                return cal.getDayBodyHTML(currDate, evtArr, cal, rowNum, colNum); 
            }
        }
    },
    
    cellHeight: 1,
    enforceVClipping: true,
    getRowHeight : function (record, rowNum) {
        // getDayArray() caches rowHeights on the data
        if (record && record.rowHeight != null) return record.rowHeight;
        return this.cellHeight;
    },
    
    getCellAlign : function (record, rowNum, colNum) {
        if (this.rowIsHeader(rowNum)) return "right";
        else return "left";
    },
    
    getCellVAlign : function (record, rowNum, colNum) {
        if (!this.rowIsHeader(rowNum)) return "top";
        else return "center";
    },

    cellHoverHTML : function (record, rowNum, colNum) {
        var fieldIndex = this.fields.get(colNum)._dayIndex;
        var currDate   = record["date" + fieldIndex];
        var evtArr     = record["event" + fieldIndex];

        if (!this.rowIsHeader(rowNum) && evtArr != null) {
            var cal = this.calendar;
            return cal.getMonthViewHoverHTML(currDate,evtArr);
        }
    },
    
    // monthView
    getBaseStyle : function (record, rowNum, colNum) {
        var cal = this.calendar, fieldIndex = this.fields.get(colNum)._dayIndex;
        var bStyle;
        if (this.rowIsHeader(rowNum)) { // header
            if ((rowNum == 0 && record["day" + fieldIndex] > 7)
                || (rowNum == this.data.length - 2 && record["day" + fieldIndex] < 7)) {
                if (!cal.showOtherDays) return cal.otherDayBlankStyle;
                else bStyle = cal.otherDayHeaderBaseStyle;
            } else bStyle = cal.dayHeaderBaseStyle;
        } else { // body
            var startRow = cal.showDayHeaders ? 1 : 0, endRow = this.data.length - 1;
            if ((rowNum == startRow && this.data[startRow]["day" + fieldIndex] > 7)
                || (rowNum == endRow && this.data[endRow]["day" + fieldIndex] < 7)) {
                if (!cal.showOtherDays) return cal.otherDayBlankStyle;
                else bStyle = cal.otherDayBodyBaseStyle;
            } else bStyle = cal.dayBodyBaseStyle;
        }      
        return bStyle;
    },
    getCellStyle : function (record, rowNum, colNum) {
        var cal = this.calendar,
            field = this.getField(colNum),
            gridDisabled = this.isDisabled(),
            cellDate = this.data[rowNum]["date" + field._dayIndex],
            cellDisabled = cellDate ? cal.shouldDisableDate(cellDate) : false
        ;

        var bStyle = this.getBaseStyle(record, rowNum, colNum);

        if (gridDisabled || cellDisabled) {
            bStyle += "Disabled";
        }

        return bStyle;
    },
    
    selectChosenDateCells : function () {
        var cal = this.calendar;
        if (cal.selectChosenDate) {
            this.getCellSelection().deselectAll();
            var displayDate = isc.Calendar._getAsDisplayDate(cal.chosenDate),
                cellRange = this.getDateCells(displayDate);
            this.getCellSelection().selectCellList(cellRange);
        }
    },

    // monthView cellClick
    // if a header is clicked, go to that day. Otherwise, open the event dialog for that day.    
    cellClick : function (record, rowNum, colNum) {
        var cal = this.calendar, 
            year, month, 
            fieldIndex = this.fields.get(colNum)._dayIndex,
            currDate = record["date" + fieldIndex],
            evtArr = record["event" + fieldIndex],
            isOtherDay = cal.month != currDate.getMonth(),
            doDefault = false
        ;
        
        // if showOtherDays is false and the clicked date is in another month, bail without
        // calling setChosenDate()
        if (!cal.showOtherDays && isOtherDay) return;

        var clickDate = isc.DateUtil.createLogicalDate(currDate.getFullYear(), 
                                 currDate.getMonth(), currDate.getDate())

        // clicked in a cell, so set the global selected chosenDate - this will update 
        // selection in this (month) view and mark day/week views for a refresh, as required
        cal.setChosenDate(clickDate);

        if (this.rowIsHeader(rowNum)) { // header clicked
            if (!(!cal.showOtherDays && isOtherDay)) {
                doDefault = cal.dayHeaderClick(clickDate, evtArr, cal, rowNum, colNum);        
            }
            if (doDefault) {
                // just change tabs - the calendar-level chosenDate has already been set
                cal.selectTab(0);
            }
        } else { // day body clicked
            // if the click was in the day-body of a different month, do nothing - view will
            // navigate to that month only
            if (isOtherDay) return;

            if (!this.cellDisabled(rowNum, colNum)) {
                doDefault = cal.dayBodyClick(clickDate, evtArr, cal, rowNum, colNum);
                if (doDefault && cal.canCreateEvents) {
                    var startDate = cal.getCellDate(rowNum, colNum, this),
                        //endDate = this.getCellEndDate(rowNum, colNum, this)
                        // use a 1-hour event-length for new events
                        endDate = isc.DateUtil.adjustDate(startDate, "+1h")
                    ;
                    var newEvent = cal.createEventObject(null, startDate, endDate);
                    cal.showEventDialog(newEvent, true);
                }
            }

        }
    },

    draw : function ( ) {
        this.Super("draw", arguments);
        
        if (this._refreshEventsOnDraw) {
            delete this._refreshEventsOnDraw;
            this.setChosenDate(this.calendar.chosenDate);
        }
        if (this._fireViewChangedOnDraw) {
            delete this._fireViewChangedOnDraw;
            this.calendar.currentViewChanged(this.viewName);
        }
    },
    
    // MonthView
    getEditDialogPosition : function (event) {
        var rect = this.body.getCellPageRect(this.getEventRow(), this.getEventColumn());
        return {
            left: Math.max(rect[0], this.body.getPageLeft()),
            top: Math.max(rect[1], this.body.getPageTop())
        };
    }

});

// TimelineView
//---------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("TimelineView", "CalendarView");

isc.TimelineView.changeDefaults("bodyProperties", {
    
    snapToCells: false,
    suppressVSnapOffset: true,
    suppressHSnapOffset: true,
    childrenSnapToGrid: false
});

isc.TimelineView.addProperties({
    canSort: false,
    canResizeFields: false,
    canAutoFitFields: false,
    canReorderFields: false,
    showHeaderContextMenu: false,
    showAllRecords: true,
    alternateRecordStyles: false,
    // rollover is dictated by Calendar.showLaneRollover
    showRollOver: false,
    useCellRollOvers: false,
    canSelectCells: false,
    selectionType: "multiple",

    laneNameField: "lane",
    columnWidth: 60,
    laneHeight: 60,
    
    //cellPadding: 0,
    //fixedRecordHeights: false,

    labelColumnWidth: 75,
    labelColumnBaseStyle: "labelColumn",
    labelColumnAlign: "left",

    eventPageSize: 30,
    trailIconSize: 16,
    leadIconSize: 16,
    scrollToToday: false,//5,
    
    lineImage: "[SKINIMG]Stretchbar/hsplit_over_stretch.gif",
    trailingEndPointImage: "[SKINIMG]Calendar/trailingDateGripper.png",
    leadingEndPointImage: "[SKINIMG]Calendar/leadingDateGripper.png",

    headerSpanHeight: 28,
    
    
    headerProperties: {
        inherentWidth: false
    },

    // timelines always use time editing
    dateEditingStyle: null,

    // clear this value so the dateChooser will show the timeItem according to the data value
    showDateChooserTimeItem: null,

    // events in timelines resize horizontally
    verticalEvents: false,

    // events can span multiple days visually in timelines
    allowMultiDayEvents: true,

    
    animateFolders: false,

     
    includeRangeCriteria: true,

    unitSnapGapsPerCell: { minute: 1, hour: 15, day: 60, week: 1440, month: 1440, year: 1440*30 },
    
    getTimePerCell : function (unit) {
        var cal = this.calendar,
            props = this._cache,
            millis = props.millisPerCell
        ;
        if (!millis) {
            millis = isc.DateUtil.convertPeriodUnit(1 * props.unitsPerColumn, props.granularity, "ms");
        }
        if (!unit) unit = "mn";
        return Math.floor(isc.DateUtil.convertPeriodUnit(millis, "ms", unit));
    },

    getTimePerSnapGap : function (unit) {
        var cal = this.calendar,
            props = this._cache,
            millis = props.millisPerSnapGap
        ;
        if (!millis) {
            if (props.calendarEventSnapGap == null) {
                // eventSnapGap is null - snaps are to cell-boundaries
                millis = this.getTimePerCell("ms");
            } else if (props.calendarEventSnapGap == 0) {
                // eventSnapGap is zero - calculate a snapGap - see doc on Calendar
                if (props.unitsPerColumn > 1) {
                    millis = isc.DateUtil.convertPeriodUnit(1, props.innerHeaderUnit || props.granularity, "ms");
                } else {
                    millis = isc.DateUtil.convertPeriodUnit(this.unitSnapGapsPerCell[props.granularity], "mn", "ms");
                    millis = Math.max(millis, props.minimumSnapGapMillis);
                }
            } else {
                millis = isc.DateUtil.convertPeriodUnit(props.calendarEventSnapGap, "mn", "ms");
                var minMillis = props.minimumSnapGapMillis;
                if (millis < minMillis) {
                    // the eventSnapGap on the calendar is too small to represent in the 
                    // available columnWidth - choose the lowest sensible snapGap
                    this.logWarn("Invalid eventSnapGap - " + ((millis / 1000) / 60) + 
                        " minutes - altered to the lowest sensible time that can be " +
                        "represented by the column-widths in the current view: " + 
                        ((minMillis / 1000) / 60) + " minutes."
                    );
                    millis = minMillis;
                }
            }
            props.calendarEventSnapGap = isc.DateUtil.convertPeriodUnit(millis, "ms", "mn");
        }
        if (!unit) unit = "mn";
        return isc.DateUtil.convertPeriodUnit(millis, "ms", unit);
    },

    getHeaderButtonWidth : function (colNum) {
        
        var result = this.columnWidth;
        
        var cal = this.calendar;
        if (cal.headerLevels) {
            // if there are headerLevels, use the _innerHeaderWidth calculated in calcFields()
            result = this._innerHeaderWidth;
        }
        
        return result;
    },
    
    getTimePerPixel : function (unit) {
        var cal = this.calendar,
            props = this._cache,
            millis = props.millisPerPixel
        ;
        if (!millis) {
            millis = this.getTimePerCell("ms") / this.getHeaderButtonWidth();
        }
        if (!unit) unit = "mn";
        return isc.DateUtil.convertPeriodUnit(millis, "ms", unit);
    },
    
    getSnapGapPixels : function (rowNum, colNum) {
        var snapCount = this.getTimePerCell() / this.getTimePerSnapGap();
        return this.getHeaderButtonWidth() / snapCount;
    },

    // first/last *visible* snaps - takes precedence over start/endDate
    getVisibleStartDate : function () {
        var firstSnap = this.getFirstVisibleSnap();
        if (firstSnap) return firstSnap.startDate;
        return this.startDate;
    },
    getVisibleEndDate : function () {
        var lastSnap = this.getLastVisibleSnap();
        if (lastSnap) return lastSnap.endDate;
        return this.endDate;
    },
    getFirstVisibleSnap : function () {
        // return the first *visible* snap - arbitrary date-columns can be hidden
        if (this._snapGapList) {
            return this._snapGapList[this._snapGapList.firstVisibleIndex];
        }
        return null;
    },
    getLastVisibleSnap : function () {
        // return the last *visible* snap - arbitrary date-columns can be hidden
        if (this._snapGapList) {
            return this._snapGapList[this._snapGapList.lastVisibleIndex];
        }
        return null;
    },

    setChosenDate : function (newDate) {
        // newDate is the actual date from the dateChooser (usually), so may or may not be
        // logical - we want view.chosenDate to be whatever gets passed, for round-tripping
        // back to the dateChooser - logical date is used for the date-label
        this.chosenDate = newDate.duplicate();
        this.logicalDate = isc.DateUtil.createLogicalDate(this.chosenDate);

        // pick up values from Calendar
        this.remapCalendarSettings();

        var key = isc.DateUtil.getTimeUnitKey(this.timelineGranularity);
        
        // startDate is the start of the granularity (day/week, eg) containing the chosenDate
        this.startDate = isc.DateUtil.getStartOf(this.chosenDate, key, false, this.firstDayOfWeek);

        // add (timelineColumnSpan-1 * unitsPerColumn) units of the timelineGranularity to 
        // the startDate
        this.endDate = isc.DateUtil.dateAdd(this.startDate, key, 
            ((this.calendar.timelineColumnSpan-1) * this.timelineUnitsPerColumn), 1, 
            // isLogicalDate, rangePosition, firstDayOfWeek
            null, null, this.firstDayOfWeek)

        // and then find the end of that granularity - eg, for a four week view, we figure out
        // the start of the first week, add 3 full weeks (so, the start of the fourth week), 
        // and then get the end of that week
        this.endDate = isc.DateUtil.getEndOf(this.endDate, key, null, this.firstDayOfWeek);

        this.setTimelineRange(this.startDate, this.endDate);
    },

    getDateLabelText : function (startDate, endDate) {
        if (!startDate || !endDate) {
            this.logInfo("missing dates in getDateLabelText()");
            return "";
        }
        var sDate = new Date(startDate.getTime() + 1),
            eDate = new Date(endDate.getTime() - 1)
        ;
        var sYear = sDate.getFullYear(),
            sMonth = sDate.getMonth(),
            sDay = sDate.getDate(),
            eYear = eDate.getFullYear(),
            eMonth = eDate.getMonth(),
            eDay = eDate.getDate(),
            s = ""
        ;
        
        if (sYear == eYear) {
            // same year
            if (sMonth == eMonth) {
                // same month
                if (sDay == eDay) {
                    // same day
                    s = sDate.getShortMonthName() + " " + sDay + ", " + sYear;
                } else {
                    // different day
                    s = sDate.getShortMonthName() + " " + sDay + " - " + eDay + ", " + eYear;
                }
            } else {
                // different month
                s = sDate.getShortMonthName() + " " + sDay + " - " + eDate.getShortMonthName() + " " + eDay + ", " + eYear;
            }
        } else {
            // different year
            s = sDate.getShortMonthName() + " " + sDay + ", " + sYear + " - " + eDate.getShortMonthName() + " " + eDay + ", " + eYear;
        }
        
        return "<b>" + s + "</b>";
    },

    
    groupNodeStyle: null,
    groupNodeBaseStyle: "groupNode",
    // timeline
    initWidget : function () {
        this.fields = [];

        // remember the initial headerHeight, to recalculate as headerLevels change
        this._headerHeight = this.headerHeight;

        this.remapCalendarSettings();

        var c = this.calendar;
       
        var granString = isc.DateUtil.getTimeUnitKey(this.timelineGranularity);

        if (c.startDate) {
            c.startDate = isc.DateUtil.getStartOf(c.startDate, granString, false, 
                this.firstDayOfWeek);
            this.startDate = c.startDate.duplicate();
        }
        if (c.endDate) {
			// round to the end of the granularity
            c.endDate = isc.DateUtil.getEndOf(c.endDate, granString, false, 
                this.firstDayOfWeek);
            this.endDate = c.endDate.duplicate();
        }
        
        if (!this.startDate) {
            this.startDate = c.startDate = isc.DateUtil.getAbsoluteDate("-0" + granString, c.chosenDate);
        }

        if (!this.endDate) {
            // no endDate - default to defaultTimelineColumnSpan columns of timelineGranularity
            this.endDate = c.endDate = isc.DateUtil.getAbsoluteDate("+" + 
                    c.defaultTimelineColumnSpan + granString, this.startDate);
        } else if (isc.DateUtil.compareDates(this.startDate, this.endDate) == -1) {
            // startDate is larger than endDate - log a warning and switch the dates
            var s = this.startDate;
            this.startDate = c.startDate = this.endDate.duplicate();
            this.endDate = c.endDate = s;
            this.logWarn("Timeline startDate is later than endDate - switching the values.");
        }

        

        this.Super("initWidget", arguments);


        // only refreshData at this time if the calendar is not autoFetchData: true
        this._refreshEventsOnDraw = true;

        this.addAutoChild("eventDragCanvas", { styleName: this.eventDragCanvasStyleName });
        //this.body.addChild(this.eventDragCanvas);
        
        

        // set up grouping based on the laneGroupBy settings on Calendar
        if (c.canGroupLanes == true) this._groupOnDraw = true;
    },

    remapCalendarSettings : function () {
        var c = this.calendar;

        this.firstDayOfWeek = c.firstDayOfWeek;
        if (c.renderEventsOnDemand != null) this.renderEventsOnDemand = c.renderEventsOnDemand;

        // lanes - name field on lanes
        if (c.laneNameField) this.laneNameField = c.laneNameField;
        // default width of laneFields (frozen)
        if (c.labelColumnWidth != null) this.labelColumnWidth = c.labelColumnWidth;
        // alternate row styling
        if (c.alternateLaneStyles != null) this.alternateRecordStyles = c.alternateLaneStyles;
        // lane rollovers
        if (c.showLaneRollOver != null) {
            this.showRollOver = c.showLaneRollOver;
            this.useCellRollOvers = false;
        }
        // lane drag-reorder
        if (c.canReorderLanes != null) this.canReorderRecords = c.canReorderLanes;

        // set up grouping based on the laneGroupBy settings on Calendar
        // this is now done in initWidget, so it doesn't get re-applied later
        //if (c.canGroupLanes == true) this._groupOnDraw = true;

        if (c.eventDragGap != null) this.eventDragGap = c.eventDragGap;

        this.cellHeight = this.laneHeight;

        if (c.headerLevels) {
            this.headerLevels = isc.shallowClone(c.headerLevels);
        }
        var innerHeader = this.headerLevels && this.headerLevels.length > 0 ?
                this.headerLevels[this.headerLevels.length-1] : null;
        
        if (innerHeader) {
            // if there's an inner headerLevel, use it's unit as the timelineGranularity
            // - do this now, before we calculate range dates below
            this.timelineGranularity = innerHeader.unit;
            c.timelineGranularity = innerHeader.unit;
        } else {
            this.timelineGranularity = c.timelineGranularity;
        }
        this.timelineUnitsPerColumn = c.timelineUnitsPerColumn;
    },

    // install/removeLocalHandlers are automatically called if they exist - timelines only for now
    installLocalHandlers : function () {
        if (this.calendar.showLaneRollOver) {
            // hook a few mouse events to pre-calculate a few values like mouse-date, and support
            // lane rollovers on both internal eventCanvas drags and externally initiated drags
            this.viewMouseMoveEventId = isc.Page.setEvent("mouseMove", this.getID() + ".viewMouseMove()");
            this.viewDragMoveEventId = isc.Page.setEvent("dragMove", this.getID() + ".viewDragMove()");
            this.viewDragRepositionMoveEventId = isc.Page.setEvent("dragRepositionMove", this.getID() + ".viewDragMove()");
            this._mouseEventsInstalled = true;
        }
    },
    removeLocalHandlers : function () {
        if (this._mouseEventsInstalled) {
            isc.Page.clearEvent("mouseMove", this.viewMouseMoveEventId);
            isc.Page.clearEvent("dragMove", this.viewDragMoveEventId);
            isc.Page.clearEvent("dragRepositionMove", this.viewDragRepositionMoveEventId);
            delete this._mouseEventsInstalled;
        }
    },
    
    initCacheValues : function () {
        var cal = this.calendar;
        this._cache = {
            alternateLaneStyles: this.alternateRecordStyles,
            firstDayOfWeek: this.firstDayOfWeek,
            granularity: this.timelineGranularity,
            unitsPerColumn: this.timelineUnitsPerColumn || 1,
            rangeStartDate: this.startDate,
            rangeEndDate: this.endDate,
            calendarEventSnapGap: cal.eventSnapGap
        };
        this._cache.rangeStartMillis = this._cache.rangeStartDate.getTime();
        this._cache.rangeEndMillis = this._cache.rangeEndDate.getTime();
        this.updateSnapProperties();
        return this._cache;
    },

    updateSnapProperties : function () {
        if (this.fieldHeaderLevel) this._cache.innerHeaderUnit = this.fieldHeaderLevel.unit;
        this.Super("updateSnapProperties", arguments);
    },

    dragSelectCanvasDefaults: {
        _constructor: "Canvas",
        styleName: "calendarCellSelected",
        opacity: 60,
        width: 1,
        height: 1,
        disabled: true,
        visibility: "hidden",
        autoDraw: false,
        resizeNow : function (props) {
            var view = this.creator,
                cal = view.calendar,
                p = isc.addProperties({}, this.props, props)
            ;

            var lane = p.lane ? view.getLane(p.lane) : null;
            var sublane = p.lane && p.sublane ? view.getSublane(p.sublane) : null;
            if (p.top == null) {
                p.top = view.getRowTop(view.getLaneIndex(p.lane));
                if (sublane) p.top += sublane.top;
            }
            if (p.height == null) {
                p.height = sublane ? sublane.height : view.getLaneHeight(p.lane);
            }
            var left = p.startSnap.startLeftOffset,
                right = p.endSnap.endLeftOffset,
                width = Math.abs(right - left)
            ;
            
            this.props = p;
            
            this.moveTo(left, p.top);
            this.resizeTo(width, p.height);
            if (!this.isDrawn()) this.draw();
            if (!this.isVisible()) {
                this.show();
            }
            if (view.shouldShowDragHovers()) isc.Hover.show(this.getHoverHTML());
        },
        hoverMoveWithMouse: true,
        showHover: true,
        hoverDelay: 0,
        hoverProps: {
            overflow: "visible", 
            hoverMoveWithMouse: this.hoverMoveWithMouse
        },
        getHoverHTML : function () {
            var view = this.creator,
                props = this.props,
                startDate = props.startSnap[view.calendar.startDateField],
                endDate = props.endSnap[view.calendar.endDateField]
            ;
            var newEvent = view.calendar.createEventObject({}, startDate, endDate,
                    props.lane, props.sublane);
            return view.calendar._getDragHoverHTML(view, newEvent);
        }
    },
    getDragSelectCanvas : function (props) {
        if (!this.body) return null;
        if (!this.dragSelectCanvas) {
            this.dragSelectCanvas = this.createAutoChild("dragSelectCanvas", { eventProxy: this.body });
            this.body.addChild(this.dragSelectCanvas);
        }
        return this.dragSelectCanvas;
    },
    cellMouseDown : function (record, rowNum, colNum) { 
        // if an event has leading/trailingDate icons in-drag, ignore mouseDown      
        if (isc.EH.dragTarget || isc.EH.lastTarget != this.body) return;
        if ((record && record._isGroup) || this.isLabelCol(colNum)) {
            return true; 
        }
        
        var cal = this.calendar;
        
        if (cal.canDragCreateEvents == false && this.canDragScroll) {
            // set up to drag-scroll the grid-body
            this._dragScrolling = true;
            this._dragBodyScrollLeft = this.body.getScrollLeft();
            this._dragMouseStartX = this._dragMouseLastX = this.getOffsetX();
            this._mouseDown = true;
            return false;
        }
        
        var mouseData = this.getMouseData() || { x: this.body.getOffsetX(), y: this.body.getOffsetY() },
            startSnap = this.getSnapData(mouseData.x, mouseData.y),
            startDate = startSnap && startSnap[cal.startDateField]
        ;

        // don't allow selection if the date is disabled (eg, a its weekend and weekends are 
        // disabled)
        if (cal.shouldDisableDate(startDate, this)) {
            return false;
        }

        // if backgroundMouseDown is implemented, run it and return if it returns false
        if (cal.backgroundMouseDown && cal.backgroundMouseDown(startDate) == false) return;

        // don't set up selection tracking if canCreateEvents is disabled
        if (!cal.canCreateEvents || cal.canDragCreateEvents == false) return true;
        // first clear any previous selection
        this.clearSelection();
        
        var canvas = this.getDragSelectCanvas(),
            endDate = startSnap[cal.endDateField],
            lane = this.getLaneFromPoint(),
            sublane = this.getSublaneFromPoint()
        ;
        
        var p = { top: null, height: null };
        p.lane = lane && lane.name;
        p.sublane = sublane && sublane.name;
        p.draggingLeftEdge = false;
        p.startSnap = startSnap;
        p.endSnap = startSnap;
        canvas.resizeNow(p);

        this._mouseDown = true;
        return false;
    },

    cellOver : function (record, rowNum, colNum) {
        colNum -=1;
        this._lastOverLaneIndex = rowNum;

        if (this._dragScrolling) {
            // drag-scroll the grid-body
            var scrollLeft = this.body.getScrollLeft(),
                newMouseX = this.getOffsetX(),
                delta = this._dragMouseLastX - newMouseX
            ;

            this._dragMouseLastX = newMouseX;
            
            var scrollToX = Math.max(0, this._dragBodyScrollLeft + delta);
            
            //isc.logWarn("_dragMouseStartX = " + this._dragMouseStartX + "\n" +
            //    "bodyScrollLeft = " + scrollLeft + "\n" +
            //    "newMouseX = " + newMouseX + "\n" +
            //    "delta = " + delta + "\n" +
            //    "scrollToX = " + scrollToX);

            //this.body.scrollTo(scrollToX);
            this.body.scrollBy(delta);
        } else if (this._mouseDown) {
            var canvas = this.getDragSelectCanvas(),
                props = canvas.props,
                mouseData = this.getMouseData() || { x: this.body.getOffsetX(), y: this.body.getOffsetY()},
                snapData = this.getSnapData(mouseData.x, mouseData.y)
            ;
            
            if (snapData) {
                if (snapData.index < props.startSnap.index) {
                    // mouse-snap is earlier than previous startSnap - left drag
                    if (props.draggingLeftEdge) props.startSnap = snapData;
                    else {
                        // swap the start and end snaps and mark as a left-edge drag
                        props.endSnap = props.startSnap;
                        props.startSnap = snapData;
                        props.draggingLeftEdge = true;
                    }
                } else if (snapData.index > props.endSnap.index) {
                    // mouse-snap is after endSnap - right drag
                    if (!props.draggingLeftEdge) props.endSnap = snapData;
                    else {
                        // swap the start and end snaps and mark as a right-edge drag
                        props.startSnap = props.endSnap;
                        props.endSnap = snapData;
                        props.draggingLeftEdge = false;
                    }
                } else {
                    if (props.draggingLeftEdge) props.startSnap = snapData;
                    else props.endSnap = snapData;
                }

                canvas.resizeNow(props);
            }
        }
        
        return this.Super("cellOver", arguments);
    },

    cellMouseUp : function (record, rowNum, colNum) {
        if (!this._mouseDown) return;
        
        this._mouseDown = false;
        
        if (this.shouldShowDragHovers()) isc.Hover.hide();


        if (this._dragScrolling) {
            // end drag-scrolling of the grid-body
            this._dragMouseStartX = null;
            this._dragBodyScrollLeft = null;
            this._dragScrolling = false;
            return isc.EH.STOP_BUBBLING;
        }

        var cal = this.calendar,
            canvas = this.getDragSelectCanvas(),
            props = canvas.props,
            startDate = props.startSnap[cal.startDateField],
            endDate = props.endSnap[cal.endDateField]
        ;

        // if backgroundClick is implemented, run it and return if it returns false
        if (cal.backgroundClick) {
            if (cal.backgroundClick(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }

        // if backgroundMouseUp is implemented, run it and bail if it returns false
        if (cal.backgroundMouseUp) {
            if (cal.backgroundMouseUp(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }

        // don't show an event editor if the date is disabled (eg, a its weekend and weekends are 
        // disabled) - take a millisecond off the end date in case it ends exactly at the start
        // of a disabled date - for example, at midnight on a friday night when weekends are 
        // disabled
        if (cal.shouldDisableDate(isc.DateUtil.dateAdd(endDate, "ms", -1), this)) {
            this.clearSelection();
            return false;
        }

        var newEvent = cal.createEventObject(null, startDate, endDate,
            props.lane, props.sublane
        );
        cal.showEventDialog(newEvent, true);
        return isc.EH.STOP_BUBBLING;
    },

    clearSelection : function () {
        var canvas = this.getDragSelectCanvas();
        if (canvas) canvas.hide();
    },

    getCellDate : function (rowNum, colNum) {
        if (!this.body) return null;
        var field = this.body.getField(colNum);
        if (!field || !field.date) return null;
        return field.date;
    },

    getCellEndDate : function (rowNum, colNum) {
        if (!this.body) return null;
        var field = this.body.getField(colNum);
        if (!field || !field.endDate) return null;
        return field.endDate;
    },
    
    recordDrop : function (dropRecords, targetRecord, index, sourceWidget) {
        this.Super("recordDrop", arguments);
        this._refreshData();
        this.markForRedraw();
    },
    
    getFirstDateColumn : function () {
        return this.frozenBody ? this.frozenBody.fields.length : 0;
    },

    
    updateOverlapRanges : function (passedData) {
        var cal = this.calendar,
            rawData = passedData || this.getEventData(),
            dataLen = rawData.getLength(),
            ranges = this.overlapRanges || [],
            // the list of overlap ranges that were actually affected by the process, so the
            // ranges that need to be re-tagged
            touchedRanges = [],
            minDate = this.startDate,
            maxDate = this.endDate
        ;

        var data = (isc.isA.ResultSet(rawData) ? rawData.allRows : rawData);

        data.setProperty("tagged", false);
        data.setProperty("overlapProps", null);
        data.setProperty("slotNum", null);

        data.setSort([ 
            { property: cal.laneNameField, direction: "ascending" },
            { property: cal.startDateField, direction: "ascending" },
            { property: cal.endDateField, direction: "descending" }
        ]);

        for (var i=0; i<dataLen; i++) {
            var event = data.get(i);
            var eRange = { events: [event] };
            eRange[cal.leadingDateField] = event[cal.leadingDateField];
            eRange[cal.startDateField] = cal.getEventStartDate(event);
            // clamp range-start
            if (eRange[cal.leadingDateField] > maxDate) eRange[cal.leadingDateField] = maxDate;
            if (eRange[cal.startDateField] < minDate) eRange[cal.startDateField] = minDate;

            eRange[cal.trailingDateField] = event[cal.trailingDateField];
            eRange[cal.endDateField] = cal.getEventEndDate(event);
            // clamp range-end
            if (eRange[cal.trailingDateField] > maxDate) eRange[cal.trailingDateField] = maxDate;
            if (eRange[cal.endDateField] > maxDate) eRange[cal.endDateField] = maxDate;
            eRange[cal.laneNameField] = eRange.lane = event[cal.laneNameField];

            var addRange = true;

            for (var j=0; j<ranges.length; j++) {
                if (eRange[cal.laneNameField] != ranges[j][cal.laneNameField]) continue;
                if (this.eventsOverlap(eRange, ranges[j], true)) {
                    // merge the two ranges - the dates of the existing range are altered to 
                    // fully incorporate both ranges and events are copied over
                    this.mergeOverlapRanges(eRange, ranges[j]);
                    addRange = false;
                }
                if (!addRange) break;
            }
            if (addRange) {
                ranges.add(eRange);
                if (!touchedRanges.contains(eRange)) touchedRanges.add(eRange);
            }
        }

        for (i=0; i<ranges.length; i++) {
            var range = ranges[i];
            // set an overlapRangeId on the range and it's events
            range.id = "range_" + i + "_lane_" + range.lane;
            range.events.setProperty("overlapRangeId", range.id);
        }

        this.overlapRanges = ranges;

        return touchedRanges;
    },

    getOverlapSlot : function (index, snapCount) {
        var slot = { slotNum: index, events: [], snapGaps: [] };
        for (var i=0; i<snapCount; i++) slot.snapGaps[i] = 0;
        return slot;
    },
    tagDataForOverlap : function (data, lane) { 
        data = data || this.getEventData();
        if (data.getLength() == 0) return;

        var addLogs = false;

        var cal = this.calendar;
        
        if (cal.eventAutoArrange == false) return;

        this.forceDataSort(data);

        var useLanes = this.usesLanes();

        var olRanges = this.updateOverlapRanges(data);

        var rangeSort = [];
        if (useLanes) {
            rangeSort.add({ property: cal.laneNameField, direction: "ascending" });
        }
        if (cal.overlapSortSpecifiers) {
            rangeSort.addList(cal.overlapSortSpecifiers);
        } else {
            
            rangeSort.add({ property: "eventLength", direction: "descending" });
            rangeSort.add({ property: cal.startDateField, direction: "ascending" });
            rangeSort.add({ property: cal.endDateField, direction: "ascending" });
        }


        if (addLogs) {
            this.logWarn("tagDataForOverlap: about to loop over " + olRanges.length + " overlap ranges");
        }
        
        for (var j = 0; j<olRanges.length; j++) {
            var range = olRanges[j];
            
            if (addLogs) {
                this.logWarn("range: " + isc.echoFull(range) + "");
            }

            var sDate = range[cal.leadingDateField] || range[cal.startDateField]
            var eDate = range[cal.trailingDateField] || range[cal.endDateField]
            var rangeStartSnapObj = this.getSnapData(null, null, sDate),
                rangeStartSnap = rangeStartSnapObj ? rangeStartSnapObj.index : 0,
                rangeEndSnapObj = this.getSnapData(null, null, eDate),
                rangeEndSnap = rangeEndSnapObj ? rangeEndSnapObj.index : this._snapGapList.length-1,
                // range start and end snaps are inclusive
                rangeSnapCount = (rangeEndSnap-rangeStartSnap) + 1,
                slotList = [],
                slotCount = 1
            ;

            // add an initial slot
            slotList[0] = this.getOverlapSlot(0, rangeSnapCount);

            var events = range.events;
            
            events.setSort(rangeSort);

            for (var eventIndex=0; eventIndex<events.length; eventIndex++) {

                var event = events[eventIndex];
                
                event.overlapProps = {};
                
                var oProps = event.overlapProps;

                // get the event's snapGapList - last param will return the first/last snaps
                // if the dates are out of range
                var eStart = event[cal.leadingDateField] || cal.getEventStartDate(event),
                    eEnd = event[cal.trailingDateField] || cal.getEventEndDate(event)
                ;
                // tweak the dates by 1ms, to prevent exact matches on a snap-boundary from
                // causing incorrect overlaps
                oProps.eventStartSnap = this.getSnapData(null, null, eStart.getTime()+1, true);
                oProps.eventEndSnap = this.getSnapData(null, null, eEnd.getTime()-1, true);

                // deal with hidden snaps - if eventStart/EndSnap aren't set, use last/nextValidSnap
                var eStartSnap = (oProps.eventStartSnap ? oProps.eventStartSnap.index : oProps.nextValidSnap.index) -rangeStartSnap;
                var eEndSnap = (oProps.eventEndSnap ? oProps.eventEndSnap.index : oProps.lastValidSnap.index) -rangeStartSnap;

                var found = false;
                var slot = null;

                for (var slotIndex=0; slotIndex<slotCount; slotIndex++) {
                    var gaps = slotList[slotIndex].snapGaps.slice(eStartSnap, eEndSnap+1);
                    var used = gaps.sum() > 0;
                    if (!used) {
                        found = true;
                        slotList[slotIndex].snapGaps.fill(1, eStartSnap, eEndSnap+1);
                        slotList[slotIndex].events.add(event);
                        event.overlapProps.slotNum = slotIndex
                        if (addLogs) {
                            this.logWarn("event " + event.name + " occupying slot " + slotIndex);
                        }
                        break;
                    }
                }
                if (!found) {
                    // add a new slot
                    slotList[slotCount] = this.getOverlapSlot(slotCount, rangeSnapCount);
                    slotList[slotCount].snapGaps.fill(1, eStartSnap, eEndSnap+1);
                    slotList[slotCount].events.add(event);
                    event.overlapProps.slotNum = slotCount
                    if (addLogs) {
                        this.logWarn("event " + event.name + " added to new slot index " + slotCount);
                    }
                    slotCount++;
                }

            }
            
            for (var i=0; i<slotList.length; i++) {
                var slot = slotList[i];
                // for each event in this slot, check all later slots - if one has an event 
                // that overlaps this event directly, this event ends in the slot before - 
                // decides this event's slotCount
                for (var eIndex=0; eIndex < slot.events.length; eIndex++) {
                    var event = slot.events[eIndex];
                    var oProps = event.overlapProps;
                    
                    // update the totalSlots
                    oProps.totalSlots = slotCount;

                    // get the event snapGaps
                    var eStartSnap = (oProps.eventStartSnap ? oProps.eventStartSnap.index : rangeStartSnap) -rangeStartSnap;
                    var eEndSnap = (oProps.eventEndSnap ? oProps.eventEndSnap.index : rangeStartSnap) -rangeStartSnap;
                    
                    var found = false;
                    
                    for (var innerIndex=i+1; innerIndex<slotList.length; innerIndex++) {
                        var gaps = slotList[innerIndex].snapGaps.slice(eStartSnap, eEndSnap+1);
                        var used = gaps.sum() > 0;
                        if (used) {
                            oProps.slotCount = innerIndex - oProps.slotNum;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        // should span all following slots
                        oProps.slotCount = slotCount - oProps.slotNum;
                    }
                    // we want slotNum to start from 1, for legacy downstream code
                    oProps.slotNum++;
                    event.slotNum = oProps.slotNum;
                }
            }
            
            range.slotList = slotList;

            if (addLogs) {
                this.logWarn("***** slotList *****\n" + isc.echoFull(slotList));
            }
        }
    },

    getSnapData : function (x, y, date, returnExtents) {
        var snaps = this._snapGapList,
            snapCount = snaps.length,
            findByDate = (date != null),
            millis = null
        ;
        
        if (findByDate) {
            if (isc.isA.Number(date)) millis = date;
            else if (date.getTime) millis = date.getTime();
        } else {
            if (x == null) x = this.body.getOffsetX();
        }
        
        if (millis != null) {
            // if the date is out of range, return the first or last snap
            if (millis < snaps[snaps.firstVisibleIndex].startMillis) {
                if (returnExtents) return snaps[snaps.firstVisibleIndex];
                return null;
            }
            if (millis > snaps[snaps.lastVisibleIndex].endMillis) {
                if (returnExtents) return snaps[snaps.lastVisibleIndex];
                return null;
            }
            
        }
        
        for (var i=0; i<snapCount; i++) {
            var snap = snaps[i];
            if (findByDate) {
                if (snap.startMillis <= millis && snap.endMillis >= millis) {
                    // always return the appropriate snap - hidden snaps link to the next/last good snaps
                    return snap;
                }
            } else {
                // if the start and end dates of the snap are hidden, it's a hidden field - ignore
                if (snap.startHidden && snap.endHidden) continue;
                if (x >= snap.startLeftOffset && x <= snap.endLeftOffset) return snap;
            }
        }
        
        return null;
    },
    
    buildSnapGapList : function (reason) {
        if (!this._cache) return;
        //isc.logWarn("buildSnapGapList - reason '" + reason + "'");
        if (!this.body) return;
        var cal = this.creator,
            fields = this.frozenBody ? this.body.fields : this.getFields(),
            snapPixels = cal.getSnapGapPixels(this),
            pixelTime = this.getTimePerPixel("ms"),
            snapTime = this.getTimePerSnapGap("ms"),
            snapMins = this.getTimePerSnapGap("mn"),
            rangeStartDate = this._cache.rangeStartDate,
            startTime = this._cache.rangeStartMillis,
            endTime = this._cache.rangeEndMillis,
            rangeEndDate = this._cache.rangeEndDate,
            loopDate = this._cache.rangeStartDate.duplicate(),
            currTime = startTime,
            i = 0,
            snapList = [],
            shouldBreak = false,
            lastStartCol = null,
            fieldSnapIndex = 0,
            // remember the first/last visible snaps - tag these onto the _snapGapList array
            firstVisibleIndex = null,
            lastVisibleIndex = null,
            nextTime
        ;
        while (currTime < endTime) {
            var newNextTime = currTime + snapTime;
            if (newNextTime == nextTime) {
                this.logWarn("snapGaps " + i + " and " + (i+1) + " have identical times");
            } else if (newNextTime >= endTime) {
                newNextTime = endTime;
                shouldBreak = true;
            }
            if (snapMins == 1440) {
                
                loopDate.setDate(loopDate.getDate() + 1);
                newNextTime = loopDate.getTime();
            } else {
                loopDate.setTime(newNextTime - 1);
            }

            nextTime = newNextTime;
            nextTime--;
            
            var snap = { index: i++, startMillis: currTime, endMillis: nextTime,
                    startDate: new Date(currTime),
                    endDate: new Date(nextTime)
                    //startDate: loopDate.duplicate()
            };
            
            snap.startField = this.getFieldContainingDate(currTime+1, true);
            if (snap.startField) {
                snap.startCol = fields.indexOf(snap.startField);
                // modify the start/end leftOffsets for the snap's startField, according to the current size
                snap.startField.startLeftOffset = this.body.getColumnLeft(snap.startCol);
                snap.startField.endLeftOffset = snap.startField.startLeftOffset + this._innerHeaderWidth;
            } else {
                snap.startHidden = true;
            }

            if (snap.startField) {
                // if the colNum just changed, zero out the pixel-offset counter
                if (snap.startCol == lastStartCol) {
                    fieldSnapIndex++;
                } else {
                    lastStartCol = snap.startCol;
                    fieldSnapIndex = 0;
                }
                snap.fieldSnapIndex = fieldSnapIndex;
            
                var startXOffset = cal.getMinutePixels(Math.floor((currTime - snap.startField.date.getTime()) / 1000 / 60), null, this);
                snap.startLeftOffset = snap.startField.startLeftOffset + startXOffset;
            }
            
            snap.endField = this.getFieldContainingDate(nextTime, true);
            if (!snap.endField) {
                
                snap.endField = this.getFieldContainingDate(nextTime, false);
            }
            if (snap.endField) {
                snap.endCol = fields.indexOf(snap.endField);
                // modify the start/end leftOffsets for the snap's startField, according to the current size
                snap.endField.startLeftOffset = this.body.getColumnLeft(snap.endCol);
                snap.endField.endLeftOffset = snap.endField.startLeftOffset + this._innerHeaderWidth;
            } else {
                snap.endHidden = true;
            }
            
            if (snap.endField) {
                var endXOffset = cal.getMinutePixels(Math.floor((snap.endField.endDate.getTime() - nextTime) / 1000 / 60), null, this);
                snap.endLeftOffset = snap.endField.endLeftOffset - endXOffset;
            }

            snap[cal.startDateField] = new Date(currTime);
            snap[cal.endDateField] = new Date(nextTime);

            snapList.add(snap);

            if (!snap.startHidden) {
                // cache the first and last visible snaps for getVisibleStart/EndDate()
                if (firstVisibleIndex == null) firstVisibleIndex = snap.index;
                if (lastVisibleIndex == null || snap.index > lastVisibleIndex) lastVisibleIndex = snap.index;
            }

            if (shouldBreak) break;
            currTime = nextTime + 1;
        }

        var lastSnap;
        var startHideIndex;
        var lastGoodSnapIndex;
        for (var i=0; i<snapList.length; i++) {
            var snap = snapList[i];
            if (snap.startHidden) {
                if (startHideIndex == null) startHideIndex = i;
            } else {
                if (startHideIndex != null) {
                    for (var j=startHideIndex; j<i; j++) {
                        snapList[j].nextValidSnap = snap;
                    }
                    startHideIndex = null;
                }
            }
            if (snap.endHidden) {
                snap.lastValidSnap = snapList[lastGoodSnapIndex];
            } else {
                lastGoodSnapIndex = i;
            }
            lastSnap = snap;
        }
        
        // shift the final snapGap so it ends at the end of the accessible body
        if (lastSnap.endField) lastSnap.endField.endLeftOffset = this.header.getWidth()-1;
        
        
        if (lastSnap.startField && lastSnap.endField) {
            if (lastSnap.startField.masterIndex == lastSnap.endField.masterIndex) 
                lastSnap.startField.endLeftOffset = lastSnap.endField.endLeftOffset;
        }

        if (firstVisibleIndex != null) snapList.firstVisibleIndex = firstVisibleIndex;
        if (lastVisibleIndex != null) snapList.lastVisibleIndex = lastVisibleIndex;

        this._snapGapList = snapList;
        
        //this.logWarn("buildSnapGapList:  " + reason + "\n\n" + isc.echoAll(snapList));
    },
    
    _rebuildFields : function () {

        this._needsSnapGapUpdate = true;
        
        var fields = this.calcFields();
        if (this.isDrawn()) {
            this.body.removeChild(this.eventDragCanvas);
            this.setFields(fields);
            this.body.addChild(this.eventDragCanvas, null, false);
        } else this.fields = fields;

         
        this.buildSnapGapList("_rebuildFields");

        
        if (this.isDrawn() && this.scrollToToday !== false) {
            var today = isc.DateUtil.getLogicalDateOnly(new Date());
            today.setDate(today.getDate() - this.scrollToToday);
            var colNum = this.getColFromDate(today, true);
            if (colNum != null) {
                this.bodies[1] && this.bodies[1].scrollTo(this.bodies[1].getColumnLeft(colNum), 0);
            }
        }
    },
    _rebuild : function (refreshData) {
        this.clearEvents();

        // availability of hovers may have changed
        this.setShowHover(this.calendar.showViewHovers);

        this._rebuildFields();
        
        if (!this._skipSetLanes) {
            var lanes = this.lanes || this.calendar.lanes || [];
            this.setLanes(lanes.duplicate(), true);
        }
        this._scrubDateRange();

        if (refreshData) {
            this._refreshData();
        } else {
            // TODO: this should really be doing a refreshVisibleEvents(), since refreshData is 
            // false - needs to be looked into as part of streamlining for large datasets
            this.refreshEvents("_rebuild");
            //this.refreshVisibleEvents();
        }
    },

    refreshEvents : function () {
         
        this.buildSnapGapList("refreshEvents");
        return this.Super("refreshEvents", arguments);
    },

    setLanes : function (lanes, skipRefreshEvents) {
        // clear the cached lane info
        this.resetLaneCaches(true);

        //this.logWarn("*** running setLanes) -- " + isc.echoFull(lanes));
        var cal = this.calendar,
            laneNameField = cal.laneNameField;

        // make sure there's a lane.name on each lane - see comment in the method
        cal.checkLaneNames(lanes);

        // set up the local lanes - ones which are shouldShowLane() true
        this.lanes = [];
        for (var i=0; i<lanes.length; i++) {
            if (this.calendar.shouldShowLane(lanes[i])) this.lanes.add(lanes[i]);
        }

        // size the visible lanes
        var laneCount = this.lanes.length;
        for (var i=0; i<laneCount; i++) {
            var lane = this.lanes[i];
            if (lane.sublanes) {
                var laneHeight = this.getLaneHeight(lane),
                    len = lane.sublanes.length,
                    sublaneHeight = Math.floor(laneHeight / len),
                    offset = 0
                ;
                for (var j=0; j<len; j++) {
                    var sublane = lane.sublanes[j];
                    sublane[laneNameField] = sublane.name;
                    sublane.top = offset;
                    if (sublane.height == null) sublane.height = sublaneHeight;
                    offset += sublane.height;
                }
                lane.height = lane.sublanes.getProperty("height").sum();
            } else {
                lane.height = this.getLaneHeight(lane);
            }
        }

        // apply the lanes as rows in the grid
        this.setData(this.lanes);

        // cache a map of lanes to avoid later array-searches - if the grid is grouped,
        // originalData will be set - if it is, use that, because data will be a Tree
        this.laneMap = (this.originalData || this.data).makeIndex("name");

        
        //if (this.isDrawn()) this.redraw();

        // refresh current events according to the new set of lanes
        if (!skipRefreshEvents) this.refreshEvents("setLanes");
        return;
    },

    // cache the result of getLaneIndex(), which is called frequently - cleared in setLanes()
    laneIndexCache: {},
    getLaneIndex : function (laneName) {
        // ignore laneIndex caching for the moment - failing in grouped timelines
        //var laneIndex = this.laneIndexCache[laneName];
        var laneIndex = null;
        if (laneIndex == null) {
            //this.logWarn("*** caching getLaneIndex('" + laneName + "')");
            var lane;
            if (isc.isAn.Object(laneName)) lane = laneName;
            else if (this.data) {
                lane = this.laneMap[laneName] || 
                       this.data.find(this.calendar.laneNameField, laneName);
            } else laneIndex = -1;

            if (laneIndex == null) laneIndex = this.getRecordIndex(lane);

            // cache the index because this method runs a lot
            this.laneIndexCache[laneName] = laneIndex;
        }
        return laneIndex;
    },
    getLane : function (laneName) {
        return this.getLaneMap()[laneName];
    },
    getLaneFromPoint : function (x, y) {
        if (y == null) y = this.body.getOffsetY();
        
        var rowNum = this.getEventRow(y),
            lane = this.getRecord(rowNum)
        ;

        return !this.isGroupNode(lane) ? lane : null;
    },
    getSublaneFromPoint : function (x, y) {
        if (y == null) y = this.body.getOffsetY();

        var rowNum = this.getEventRow(y),
            lane = this.getRecord(rowNum),
            sublanes = lane ? lane.sublanes : null
        ;

        if (!sublanes) return null;

        var rowTop = this.getRowTop(rowNum),
            laneOffset = y - rowTop,
            laneHeight = this.getLaneHeight(lane),
            len = sublanes.length,
            offset = 0
        ;
        for (var i=0; i<len; i++) {
            // needs >= to cater for the pixel at the lane boundary
            if (offset + sublanes[i].height >= laneOffset) {
                return sublanes[i];
            }
            offset += sublanes[i].height;
        }

        return null;
    },
    
    _scrubDateRange : function () {
        var gran = this.calendar.timelineGranularity;
        if (gran == "month") {
            this.startDate.setDate(1);
        } else if (gran == "week") {
            this.startDate = isc.DateUtil.getStartOf(this.startDate, "w", true, this.calendar.firstDayOfWeek);
        } else if (gran == "day") {
            this.startDate.setHours(0);
            this.startDate.setMinutes(0);
            this.startDate.setSeconds(0);
            this.startDate.setMilliseconds(0);
        } else if (gran == "hour") {
            this.startDate.setMinutes(0);
            this.startDate.setSeconds(0);
            this.startDate.setMilliseconds(0);
        } else if (gran == "minute") {
            this.startDate.setSeconds(0);
            this.startDate.setMilliseconds(0);
        }
    },

    // make sure link between lanes and this.data is maintained
    //setData : function (newData) {
    //     this.calendar.lanes = newData;
    //     this.invokeSuper(isc.TimelineView, "setData", newData);
    //},
    scrollTimelineTo : function (pos) {
        this.bodies[1] && this.bodies[1].scrollTo(pos);
    },
        
    setLaneHeight : function (newHeight) {
        this.laneHeight = newHeight;
        this.setCellHeight(newHeight);
        this.refreshEvents("setLaneHeight");
    },
    
    groupRowHeight: 30,
    getRowHeight : function (record, rowNum) {
        var height = null;
        if (record) {
            if (this.isGroupNode(record)) height = this.groupRowHeight;
            else height = record.height;
        }
        return Math.round(height || this.Super("getRowHeight", arguments));
    },
 
    setInnerColumnWidth : function (newWidth) {
        this.columnWidth = newWidth;
        this._rebuild(true);
    },

    rangeCriteriaMode: "view",
    setTimelineRange : function (start, end) 
    {
        //this.logWarn("*** in view.setTimelineRange() -- " + start.toString() + " -- " + (end ? end.toString() : "no end"));
        var cal = this.calendar;

        this.timelineGranularity = cal.timelineGranularity;
        this.timelineUnitsPerColumn = cal.timelineUnitsPerColumn;
        this.timelineColumnSpan = cal.timelineColumnSpan;

        var colSpan = this.timelineColumnSpan || this._totalGranularityCount || cal.defaultTimelineColumnSpan,
            refreshData = false,
            gran = this.timelineGranularity.toLowerCase(),
            granString = isc.DateUtil.getTimeUnitKey(gran);
        ;

        start = start || this.startDate;
        // move the start date to it's closest previous granularity boundary ("day" by default)
        start = isc.DateUtil.getStartOf(start, granString, false, this.firstDayOfWeek);

        if (!end) {
            // end wasn't passed - if this.endDate is set, use that - otherwise, calculate it
            if (start.getTime() == this.startDate.getTime() && this.endDate) end = this.endDate;
            else end = isc.DateUtil.getAbsoluteDate("+" + (colSpan*this.timelineUnitsPerColumn) + granString, start);
        }
        
        var criteriaMode = this.rangeCriteriaMode || cal.rangeCriteriaMode;
        if (criteriaMode && criteriaMode != "none") refreshData = true;
        
        if (start.logicalDate) {
            start = isc.DateUtil.getStartOf(start, granString, false, this.firstDayOfWeek); 
        }
        if (end.logicalDate) {
            end = isc.DateUtil.getEndOf(end, granString, false, this.firstDayOfWeek); 
        }
        
        if (isc.DateUtil.compareLogicalDates(start, end) == 0) {
            if (cal.showWeekends == false && cal.dateIsWeekend(start)) {
                cal.showWeekends = true;
                // log that showWeekends was reset to true because the range-dates span less
                // than one day, and it happens to be a weekend day
                this.logWarn("showWeekends was automatically switched on because the dates " +
                    "provided for the timeline spanned less than one day and the day is a " +
                    "weekend."
                );
            }
        }

        // in timelines, visible and period dates are the same
        this.startDate = this.periodStartDate = start.duplicate();
        this.endDate = this.periodEndDate = end.duplicate();

        cal.startDate = start.duplicate();
        cal.endDate = end.duplicate();

        

        //isc.logWarn('setTimelineRange:' + [timelineGranularity, timelineUnitsPerColumn, 
        //        cal.timelineGranularity, cal.timelineUnitsPerColumn]);

        // only update the dateChooser now if it's part of the UI, rather than a popup
        // the second param here causes the dateChooser to set showTimeItem false if the date
        // is a logicalDate, and true otherwise
        //if (cal.showDateChooser) cal.dateChooser.setData(this.startDate, true);

        cal.setDateLabel();

        // if the calendar is autoFetchData and is in mid-draw, don't refreshData here, or we'll
        // get two fetches
        if (cal.autoFetchData && cal._calendarDrawing) refreshData = false;

        // if not yet drawn, set a flag which will cause a field-rebuild at draw time
        if (!this.isDrawn()) {
             this._needsRebuildOnDraw = true;
        } else {
            this._rebuild(refreshData);
        }
    },
    
    addUnits : function (date, units, granularity) {
        granularity = granularity || this.calendar.timelineGranularity;
        if (granularity == "century") {
            date.setFullYear(date.getFullYear() + (units * 100));
        } else if (granularity == "decade") {
            date.setFullYear(date.getFullYear() + (units * 10));
        } else if (granularity == "year") {
            date.setFullYear(date.getFullYear() + units);
        } else if (granularity == "quarter") {
            date.setMonth(date.getMonth() + (units * 3));
        } else if (granularity == "month") {
            date.setMonth(date.getMonth() + units);
        } else if (granularity == "week") {
            date.setDate(date.getDate() + (units * 7));
        } else if (granularity == "day") {
            date.setDate(date.getDate() + units);
        } else if (granularity == "hour") {
            date.setHours(date.getHours() + units);    
        } else if (granularity == "minute") {
            date.setMinutes(date.getMinutes() + units);    
        } else if (granularity == "second") {
            date.setSeconds(date.getSeconds() + units);    
        } else if (granularity == "millisecond") {
            date.setMilliseconds(date.getMilliseconds() + units);    
        }
        return date;
    },
    
    getColFromDate : function (date, forEndDate) {
        var fields = this.frozenBody ? this.body.fields : this.getFields(),
            startMillis = (date && date.getTime) ? date.getTime() : date
        ;

        if (date) {
            for (var i=0; i<fields.length; i++) {
                var field = fields[i],
                    fieldTime = field && field.date ? field.date.getTime() : null,
                    fieldEndTime = field && field.endDate ? field.endDate.getTime() : null
                ;
                if (!fieldTime || !fieldEndTime) continue;
                if (forEndDate) {
                    if (startMillis >= fieldTime && startMillis < fieldEndTime) {
                        return i;
                    }
                } else {
                    if (fieldTime >= startMillis) {
                        return i;
                        //return i-1;                
                    }
                }
            }
        }
        return null;
    },

    getFieldContainingDate : function (date, nullIfOutOfRange) {
        var fields = this.frozenBody ? this.body.fields : this.getFields(),
            startMillis = (date && date.getTime) ? date.getTime() : date
        ;

        if (startMillis) {
            if (startMillis < this.startDate.getTime()) return fields[0];
            if (startMillis >= this.endDate.getTime()) {
                return nullIfOutOfRange ? null : fields[fields.length - 1];
            }
            for (var i=0; i<fields.length; i++) {
                var field = fields[i],
                    fieldTime = field && field.date ? field.date.getTime() : null,
                    fieldEndTime = field && field.endDate ? field.endDate.getTime() : null
                ;
                if (startMillis >= fieldTime && startMillis <= fieldEndTime) {
                    return field;
                }
            }
        }
        return null;
    },

    // internal attribute that limits the date-loop in calcFields below - just a safeguard in
    // case someone sets a huge startDate/endDate range and a high resolution 
    
    maximumTimelineColumns: 400,
    calcFields : function () {
        var newFields = [],
            cal = this.calendar
        ;


        if (this.showLaneFields != false) {
            var showLaneHovers = this.shouldShowLaneFieldHovers();
            if (cal.laneFields) {
                var laneFields = cal.laneFields;
                for (var i = 0; i < laneFields.length; i++) {
                    var lf = isc.addProperties({}, {
                        hoverDelay: this.hoverDelay+1, 
                        hoverMoveWithMouse: true,
                        frozen: true,
                        isLaneField: true,
                        baseStyle: this.getLaneFieldStyleName(laneFields[i], {}),
                        minWidth: this.labelColumnWidth,
                        width: this.labelColumnWidth,
                        canHover: showLaneHovers, 
                        showHover: showLaneHovers
                    }, laneFields[i]);
                    newFields.add(lf);
                }
            } else {
                var labelCol = isc.addProperties({
                    autoFitWidth: true,
                    width: this.labelColumnWidth,
                    minWidth: this.labelColumnWidth,
                    baseStyle: this.labelColumnBaseStyle,
                    name: "title",
                    title: " ",
                    showTitle: false,
                    frozen: true,
                    isLaneField: true,
                    hoverDelay: this.hoverDelay+1, 
                    hoverMoveWithMouse: true,
                    canHover: showLaneHovers, 
                    showHover: showLaneHovers
                });
                newFields.add(labelCol);    
            }
        }

        if (!cal.headerLevels && !this.headerLevels) {
            cal.headerLevels = [ { unit: cal.timelineGranularity } ];
        }
        
        if (cal.headerLevels) {
            this.headerLevels = isc.shallowClone(cal.headerLevels);
        } 
        
        if (this.headerLevels) {
            // we have some header-levels - the innermost level is going to be stripped and its
            // "unit" and "titles" array used for field-headers (unit becomes 
            // calendar.timelineGranularity - they should already be the same)
            this.fieldHeaderLevel = this.headerLevels[this.headerLevels.length-1];
            if (this.fieldHeaderLevel.headerWidth != null) {
                // update view.columnWidth here, right before updating the snapGaps
                //this.columnWidth = this.fieldHeaderLevel.headerWidth;
            }
            this.headerLevels.remove(this.fieldHeaderLevel);
            cal.timelineGranularity = this.fieldHeaderLevel.unit;
            // cache a couple of values
            this._cache.innerHeaderLevel = this.fieldHeaderLevel;
            this._cache.granularity = cal.timelineGranularity;
            // this will get called by initCacheValues() below
            //this.updateSnapProperties();
        }

        
        this.adjustTimelineForHeaders();

        // add date columns to fields
        var sDate = this.startDate.duplicate(),
            eDate = this.endDate.duplicate(),
            units = cal.timelineUnitsPerColumn,
            spanIndex = 0,
            headerLevel = this.fieldHeaderLevel,
            titles = headerLevel && headerLevel.titles ? headerLevel.titles : []
        ;

        //if (headerLevel.headerWidth) this.columnWidth = headerLevel.headerWidth;

        var eDateMillis = eDate.getTime(),
            //colWidth = this.getHeaderButtonWidth(),
            colWidth = this.columnWidth,
            startLeftOffset = 0,
            endLeftOffset = startLeftOffset + colWidth-1,
            daysPerCell = this.getTimePerCell("d"),
            ignoreHiddenDates =  daysPerCell > 1,
            fieldEndDate
        ;
        
        
        this._totalGranularityCount = 0;

        var showCellHovers = this.shouldShowCellHovers();
        //var headerButtonWidth = this.getHeaderButtonWidth()
        var headerButtonWidth = colWidth; //this.getHeaderButtonWidth()

        while (sDate.getTime() <= eDateMillis) {
            var thisDate = sDate.duplicate(),
                showDate = ignoreHiddenDates || cal.shouldShowDate(sDate, this)
            ;
            
            thisDate = isc.DateUtil.getStartOf(thisDate, cal.timelineGranularity, 
                false, this.firstDayOfWeek);
            
            if (thisDate.getTime() >= eDateMillis) break;
            
            this._totalGranularityCount++;
            
            fieldEndDate = isc.DateUtil.getEndOf(this.addUnits(sDate.duplicate(), units), 
                cal.timelineGranularity, false, this.firstDayOfWeek);
            
            var newField = null;
            
            if (fieldEndDate.getTime() > eDateMillis) {
                fieldEndDate.setTime(eDateMillis);
            }
            
            if (showDate) {
                var title = this.getInnerFieldTitle(headerLevel, spanIndex, sDate);

                newField = isc.addProperties({}, {
                    name: "f" + spanIndex,
                    headerLevel: headerLevel,
                    title: title,
                    width: headerLevel.headerWidth || headerButtonWidth,
                    cellAlign: headerLevel.cellAlign,
                    cellVAlign: headerLevel.cellVAlign,
                    date: thisDate.duplicate(),
                    logicalDate: isc.DateUtil.getLogicalDateOnly(thisDate),
                    logicalTime: isc.DateUtil.getLogicalTimeOnly(thisDate),
                    canGroup: false,
                    canSort: false,
                    canFreeze: false,
                    canFocus: false,
                    startLeftOffset: startLeftOffset,
                    endLeftOffset: endLeftOffset,
                    hoverDelay: this.hoverDelay+1, 
                    hoverMoveWithMouse: true,
                    canHover: showCellHovers, 
                    showHover: showCellHovers
                }, this.getFieldProperties(thisDate));

                if (cal.shouldDisableDate(thisDate)) {
                    newField.dateDisabled = true;
                }

                //isc.logWarn("field " + spanIndex + ":\n" +
                //    "    " + thisDate + "\n" +
                //    "        " + isc.DateUtil.getLogicalDateOnly(thisDate) + "\n" +
                //    "        " + isc.DateUtil.getLogicalTimeOnly(thisDate) + "\n" +
                //    "    " + fieldEndDate + "\n" +
                //    "        " + isc.DateUtil.getLogicalDateOnly(fieldEndDate) + "\n" +
                //    "        " + isc.DateUtil.getLogicalTimeOnly(fieldEndDate) + "\n"
                //);
            }

            sDate = fieldEndDate.duplicate();

            if (showDate) {
                // store the end date, as the next start date
                newField.endDate = sDate.duplicate();
                newField.endDate.setTime(newField.endDate.getTime()-1);
                newField.logicalEndDate = isc.DateUtil.getLogicalDateOnly(sDate);
                newField.logicalEndTime = isc.DateUtil.getLogicalTimeOnly(sDate),
                newFields.add(newField);
                spanIndex++;
                startLeftOffset += colWidth;
                endLeftOffset += colWidth;
            }
            
            if (newFields.length >= this.maximumTimelineColumns) {
                this.endDate = sDate.duplicate();
                this.logWarn("Date-range too large - limiting to " + 
                        this.maximumTimelineColumns + " columns.");
                break;
            }
        }
        
        
        //this._totalGranularityCount--;

        var hoverProps = {
            hoverDelay: this.hoverDelay+1, 
            hoverMoveWithMouse: true,
            // canHover is always true, showHover is calculated in getHoverHTML()
            canHover: true,
            getHoverHTML : function () {
                var view = this.grid;
                // only show header-hovers if the view/calendar is configured to do so
                if (!view.shouldShowHeaderHovers()) return;
                return view.calendar._getHeaderHoverHTML(view, view.fieldHeaderLevel, 
                    this, this.date, this.endDate);
            }
        };
        for (var i=0, fieldCount=newFields.length; i<fieldCount; i++) {
            var field = newFields[i];
            isc.addProperties(field, hoverProps);
            field.headerLevel = this.fieldHeaderLevel;
        }

        // handle headerLevel.headerWidth being "*" - auto fit date-fields to available space
        if (headerLevel && headerLevel.headerWidth != null) {
            if (headerLevel.headerWidth == "*") {
                if (this.isDrawn() && this.isVisible()) {
                    this._innerHeaderWidth = this.body.getColumnWidth(0);
                } else {
                    this._innerHeaderWidth = Math.floor(this.body.getWidth() / this._totalGranularityCount)
                }
            } else if (isc.isA.Number(headerLevel.headerWidth)) {
                this._innerHeaderWidth = headerLevel.headerWidth;
            }
        } else {
            this._innerHeaderWidth = this.columnWidth;
        }
        
        this.buildHeaderSpans(newFields, this.headerLevels, this.startDate, this.endDate);

        this.initCacheValues();

        this._dateFieldCount = spanIndex-1;
        
        // do this in the calling function, after this.fields has been updated
        //this.buildSnapGapList("calcFields");

        return newFields;
    },

    redraw : function () {
        this.Super("redraw", arguments);
        if (!this.animateFolders && this._redrawForGrouping) {
            // _redrawForGrouping is set in groupByComplete() and toggleFolder()
            delete this._redrawForGrouping;
            this.laneHeightCache = {};
            this.laneIndexCache = {};
            this.delayedRefreshVisibleEvents();
        }
    },

    toggleFolder : function (record) {
        this.Super("toggleFolder", arguments);
        // this flag causes redraw() to call refreshVisibleEvents()
        this._redrawForGrouping = true;
        this.markForRedraw();

        // if not animating folders, refresh events now - otherwise, do it when the row
        // animation completes
        //if (!this.animateFolders) {
        //    this._redrawForGrouping = true;
        //    this.markForRedraw();
        //}
    },
    
    rowAnimationComplete : function (body, hasFrozenBody) {
        this.Super("rowAnimationComplete", arguments);
        // animating folders, refresh events now, if the rowAnimationComplete callback is gone,
        // indicating that both bodies are fully redrawn
        if (!this._rowAnimationCompleteCallback) {
            
            delete this.body._rowHeights;
            this.refreshVisibleEvents();
        }
    },

    adjustTimelineForHeaders : function () {
        // if we weren't 
        var cal = this.calendar,
            unit = this.fieldHeaderLevel ? this.fieldHeaderLevel.unit : cal.timelineGranularity,
            start = this.startDate,
            end = new Date(this.endDate.getTime()-1)
        ;

        // we have at least one header - make sure we start and end the timeline 
        // at the beginning and end of the innerLevel's unit-type (the actual field-headers, 
        // that is)
        var key = isc.DateUtil.getTimeUnitKey(unit);

        this.startDate = isc.DateUtil.getStartOf(start, key, false, this.firstDayOfWeek);
        this.endDate = isc.DateUtil.getEndOf(end, key, false, this.firstDayOfWeek);
    },

    buildHeaderSpans : function (fields, levels, startDate, endDate) {
        var date = startDate.duplicate(),
            c = this.calendar,
            result = [],
            spans = []
        ;

        if (levels && levels.length > 0) {
            spans = this.getHeaderSpans(startDate, endDate, levels, 0, fields);
            this.headerHeight = this._headerHeight + (levels.length * this.headerSpanHeight);
        }

        if (spans && spans.length > 0) {
            this.setHeaderSpans(spans, true);
        }
    },

    getHeaderSpans : function (startDate, endDate, headerLevels, levelIndex, fields) {
        var date = startDate.duplicate(),
            c = this.calendar,
            headerLevel = headerLevels[levelIndex],
            unit = headerLevel.unit,
            unitKey = isc.DateUtil.getTimeUnitKey(unit),
            lastUnit = levelIndex > 0 ? headerLevels[levelIndex-1].unit : unit,
            unitsPerColumn = c.timelineUnitsPerColumn,
            titles = headerLevel.titles || [],
            result = [],
            spanIndex = 0
        ;

        if (levelIndex > 0) {
            if (isc.DateUtil.compareTimeUnits(unit, lastUnit) > 0) {
                // the unit on this level is larger than on it's parent-level - warn
                isc.logWarn("The order of the specified HeaderLevels is incorrect - '" + unit +
                    "' is of a larger granularity than '" + lastUnit + "'");
            }
        }
        
        var DU = isc.DateUtil;
        
        var firstLoop = true;
        while (date <= endDate) {
            date = DU.dateAdd(date, "mn", 1, 1);
            if (firstLoop) {
                firstLoop = false;
                var newDate = isc.DateUtil.getEndOf(date, unitKey, false, c.firstDayOfWeek);
            } else {
                var newDate = this.addUnits(date.duplicate(), unitsPerColumn, unit);
            }

            var span = { unit: unit, 
                hoverDelay: this.hoverDelay+1, 
                hoverMoveWithMouse: true,
                // canHover is always true, showHover is calculated in getHoverHTML()
                canHover: true, 
                canFocus: false,
                headerLevel: headerLevel,
                getHoverHTML : function () {
                    var view = this.creator;
                    // only show header-hovers if the view/calendar is configured to do so
                    if (!view.shouldShowHeaderHovers()) return;
                    return view.calendar._getHeaderHoverHTML(view, this.headerLevel, this,
                        this.startDate, this.endDate
                    );
                }
            };
            span.startDate = date.duplicate();
            span.endDate = newDate.duplicate();

            this.setSpanDates(span, date.duplicate());

            newDate = span.endDate;

            var title = this.getHeaderLevelTitle(headerLevel, spanIndex, date, newDate);

            span.title = title;

            // this condition should be re-introduced once LG supports multiple-headers where
            // only the inner-most spans require a fields array
            //if (levelIndex == headerLevels.length-1) {
                span.fields = [];
                for (var i=0; i<fields.length; i++) {
                    var field = fields[i];
                    if (field.isLaneField || field.date < span.startDate) continue;
                    if (field.date >= span.endDate) break;
                    field.headerLevel = headerLevels[levelIndex];
                    span.fields.add(field.name);
                }
            //}

            if (levelIndex < headerLevels.length-1) {
                span.spans = this.getHeaderSpans(span.startDate, span.endDate, 
                    headerLevels, levelIndex + 1, fields);
                if (span.spans && span.spans.length > 0) span.fields = null;
                if (headerLevel.titles && headerLevel.titles.length != span.spans.length) {
                    // fewer titles were supplied than we have spans - log a warning about it
                    // but don't bail because we'll auto-generate titles for any spans that
                    // don't have one in the supplied title-array
                    isc.logWarn("The titles array provided for the " + headerLevel.unit + 
                        " levelHeader has a length mismatch: expected " + span.spans.length + 
                        " but " + headerLevel.titles.length + " are present.  Some titles " +
                        " may be auto-generated according to TimeUnit."
                    );
                }
            }

            result.add(isc.clone(span));
            date = newDate.duplicate();
            spanIndex++;
        }

        return result;
    },

    getHeaderLevelTitle : function (headerLevel, spanIndex, startDate, endDate) {
        var unit = headerLevel.unit,
            title = headerLevel.titles ? headerLevel.titles[spanIndex] : null
        ;
        if (!title) {
            // only generate a default value and call the titleFormatter if there was no 
            // entry for this particular span in headerLevels.titles
            if (unit == "century" || unit == "decade") {
                title = startDate.getFullYear() + " - " + startDate.getFullYear();
            } else if (unit == "year") {
                title = startDate.getFullYear();
            } else if (unit == "quarter") {
                title = startDate.getShortMonthName() + " - " + endDate.getShortMonthName();
            } else if (unit == "month") {
                title = startDate.getShortMonthName();
            } else if (unit == "week") {
                // use the week number for the Date.firstWeekIncludesDay'th day of the week - thursday 
                var midWeek = isc.DateUtil.getStartOf(startDate, "W", false, this.calendar.firstDayOfWeek);
                midWeek.setDate(midWeek.getDate() + (midWeek.firstWeekIncludesDay - this.calendar.firstDayOfWeek));
                title = this.calendar.weekPrefix + " " + midWeek.getWeek(this.calendar.firstDayOfWeek);
            } else if (unit == "day") {
                title = startDate.getShortDayName();
            } else {
                if (unit == "hour") title = startDate.getHours();
                if (unit == "minute") title = startDate.getMinutes();
                if (unit == "second") title = startDate.getSeconds();
                if (unit == "millisecond") title = startDate.getMilliseconds();
                if (unit == "hour") title = startDate.getHours();
            }
            title = "" + title;
            if (isc.isA.Function(headerLevel.titleFormatter)) {
                title = headerLevel.titleFormatter(headerLevel, startDate, endDate, title, this.calendar);
            }
        }
        return title;

    },

    setSpanDates : function (span, date) {
        var key = isc.DateUtil.getTimeUnitKey(span.unit);
        var cal = this.calendar;

        span.startDate = isc.DateUtil.getStartOf(date, key, false, this.firstDayOfWeek);
        span.endDate = isc.DateUtil.getEndOf(span.startDate, key, false, this.firstDayOfWeek);
    },

    getFieldProperties : function (date) {
        return null;
    },
    getInnerFieldTitle : function (headerLevel, spanIndex, startDate, endDate) {
        var granularity = headerLevel.unit,
            result = headerLevel.titles ? headerLevel.titles[spanIndex] : null
        ;
        if (!result) {
            // only generate a default value and call the titleFormatter if there was no 
            // entry for this particular span in headerLevels.titles
            if (granularity == "year") {
                result = startDate.getFullYear();
            } else if (granularity == "month") {
                result = startDate.getShortMonthName();
            } else if (granularity == "week") {
                // use the week number for the Date.firstWeekIncludesDay'th day of the week - thursday 
                var midWeek = isc.DateUtil.getStartOf(startDate, "W", null, this.calendar.firstDayOfWeek);
                midWeek.setDate(midWeek.getDate() + (midWeek.firstWeekIncludesDay - this.calendar.firstDayOfWeek));
                result = this.calendar.weekPrefix + " " + midWeek.getWeek(this.calendar.firstDayOfWeek);
            } else if (granularity == "day") {
                // get the order of date parts from the inputFormat and use the defaultDateSeparator
                var format = isc.DateUtil.getInputFormat();
                if (isc.isA.String(format)) {
                    // remove year and transform day
                    format = format.replace("Y", "");
                    format = format.replace("D", "d");
                    format = format[0] + isc.DateUtil.getDefaultDateSeparator() + format[1];
                    result = isc.DateUtil.format(startDate, format);
                } else {
                    result = (startDate.getMonth() + 1) + "/" + startDate.getDate();
                }
            } else {
                var date = startDate.duplicate();
//                date.setMinutes(date.getMinutes() + offsetMin);
                var mins = date.getMinutes().toString();
                if (mins.length == 1) mins = "0" + mins;
                result = date.getHours() + ":" + mins;    
            }
            if (isc.isA.Function(headerLevel.titleFormatter)) {
                result = headerLevel.titleFormatter(headerLevel, startDate, endDate, result, this.calendar);
            }
        }

        return result;
    },

    // this method is fired from an observation of grid._updateFieldWidths() - if the known
    // width of the first field has changed since it was set up in calcFields(), clear the
    // events visually, reinit the cache values (column-widths, etc), rebuild the snapGapList
    // and then fire refreshVisibleEvents on a delay to resize/reposition/redraw visible events
    refreshEventsForBodyResize : function () {
        if (this._innerHeaderWidth != this.body._fieldWidths[0] && this.isDrawn() && this.isVisible()) {
            this._innerHeaderWidth = this.body._fieldWidths[0];
            this.clearEvents();
            this.initCacheValues();
            this.buildSnapGapList();
            //this.delayedRefreshEvents();
            this.delayedRefreshVisibleEvents();
        }
    },
    
    draw : function (a, b, c, d) {
        this.invokeSuper(isc.TimelineView, "draw", a, b, c, d);

        // observe _updateFieldWidths() in order to resize/reposition visible events when the 
        // field-sizes change
        this.observe(this, "_updateFieldWidths", "observer.refreshEventsForBodyResize();");
        
        var cal = this.calendar;

        this.logDebug('draw', 'calendar');
        // call refreshEvents() whenever we're drawn
        // see comment above dataChanged for the logic behind this

        this.body.addChild(this.eventDragCanvas, null, false);
        this.eventDragCanvas.setView(this);

        if (this._needsRebuildOnDraw) {
            // flag set at the end of setTimelineRange() if it runs before draw
            delete this._needsRebuildOnDraw;
            this._rebuild();
        }

        if (this._refreshEventsOnDraw) {
            delete this._refreshEventsOnDraw;
            //this._refreshEvents();
            //this.setChosenDate(this.calendar.chosenDate);
        }

        if (this._groupOnDraw) {
            // set up grouping based on the laneGroupBy settings on Calendar
            this.canGroupBy = true;
            this.groupByField = cal.laneGroupByField;
            if (cal.laneGroupStartOpen != null) this.groupStartOpen = cal.laneGroupStartOpen;

            this._pendingGroupComplete = true;
            this.delayCall("groupBy", [this.groupByField], 0);
        }

        //this.refreshEvents();
        if (this._fireViewChangedOnDraw) {
            delete this._fireViewChangedOnDraw;
            this.calendar.currentViewChanged(this.viewName);
        }

    },

    groupByComplete : function () {
        // clear the groupOnDraw flag
        delete this._groupOnDraw;
        // these flags are set in draw() and cleared here - refreshVisibleEvents() will bail if 
        // it runs while this flag is set (while the grouping is running)
        delete this._pendingGroupComplete;
        
        this.delayedRefreshVisibleEvents();
        return;
        
        //// this flag is checked in timelineView.redraw() - if it's set, redraw() will call 
        //// refreshVisibleEvents() to reposition events in case their lanes have moved
        //this._redrawForGrouping = true;
        //// cause a redraw() to update the events
        //this.markForRedraw();
    },

    formatDateForDisplay : function (date) {
        return  date.getShortMonthName() + " " + date.getDate() + ", " + date.getFullYear();
    },

    getLabelColCount : function () {
        var cal = this.calendar,
            count = 1
        ;
        if (cal.laneFields) {
            count = 0;
            for (var i=0; i<cal.laneFields.length; i++) {
                if (cal.laneFields[i].hidden != true) count++;
            }
        }
        return count;
    },

    isLabelCol : function (colNum) {
        var field = this.getField(colNum);
        return field && field.frozen;
    },

    showField : function () {
        this.Super("showField", arguments);
        this.refreshEvents("showField");
    },
    hideField : function () {
        this.Super("hideField", arguments);
        this.refreshEvents("hideField");
    },
    
    getLaneStyleName : function (lane) {
        if (lane && lane.styleName) return lane.styleName;
    },
    getLaneFieldStyleName : function (field, lane) {
        if (field && field.styleName) return field.styleName;
        if (lane && lane.fieldStyleName) return lane.fieldStyleName;
        return this.labelColumnBaseStyle;
    },
    
    // timelineView
    getBaseStyle : function (record, rowNum, colNum) {
        var cal = this.calendar;
        // for group rows, return the baseStyle
        if (record._isGroup) return this.groupNodeBaseStyle;
        // for frozen-fields in lanes with a fieldStyleName, return fieldStyleName
        if (record.fieldStyleName && this.frozenFields) {
            if (this.fieldIsFrozen(colNum)) return record.fieldStyleName;
        }
        return this.Super("getBaseStyle", arguments);
    },
    getCellStyle : function (record, rowNum, colNum) {
        var cal = this.calendar,
            field = this.getField(colNum),
            isSelected = this.isSelected(record),
            gridDisabled = this.isDisabled(),
            cellDisabled = (field && field.date && cal.shouldDisableDate(field.date))
        ;

        var bStyle = this.getBaseStyle(record, rowNum, colNum);

        if (gridDisabled || (cellDisabled && !isSelected)) {
            bStyle += "Disabled";
        }
        
        if (isSelected) bStyle += "Selected";

        // odd rows in vertical views
        if (this.alternateRecordStyles && rowNum % 2 != 0) {
            // odd row in TimelineView, with alternateRecordStyles
            bStyle += "Dark";
        }

        return bStyle;
    },


    slideRange : function (slideRight) {
        var c = this.calendar,
            gran = this.timelineGranularity.toLowerCase(),
            granString = isc.DateUtil.getTimeUnitKey(gran),
            units = this.timelineUnitsPerColumn || 1,
            startDate = this.startDate.duplicate(),
            endDate = this.endDate.duplicate(),
            multiplier = slideRight ? 1 : -1,
            scrollCount = c.columnsPerPage || (this.getFields().length - this.getLabelColCount())
        ;

        startDate = isc.DateUtil.dateAdd(startDate, granString, scrollCount * units, multiplier, 
            false, null, this.firstDayOfWeek);
        startDate = isc.DateUtil.getStartOf(startDate, granString, false, this.firstDayOfWeek);

        // this flag prevents _rebuild() from updating the lanes - only dates have changed
        this._skipSetLanes = true;

        // call the usual setChosenDate(), which deals with everything
        // call on the parent calendar, so it's chosenDate is properly updated
        this.calendar.setChosenDate(startDate);
        delete this._skipSetLanes;
    },

    nextOrPrev : function (next) {
        this.slideRange(next);
    },
    
    compareDates : function (date1, date2, d) {
        // year
        if (date1.getFullYear() < date2.getFullYear()) {
            return 1;       
        } else if (date1.getFullYear() > date2.getFullYear()) {
            return -1;
        }
        // month
        if (date1.getMonth() < date2.getMonth()) {
            return 1;       
        } else if (date1.getMonth() > date2.getMonth()) {
            return -1;
        }
        // day
        if (date1.getDate() < date2.getDate()) {
            return 1;       
        } else if (date1.getDate() > date2.getDate()) {
            return -1;
        }
        // equal
        return 0;
        
    },
    
    getDateFromPoint : function (x, y, round, useSnapGap) {
        var cal = this.calendar;
        
        if (x == null && y == null) {
            // if no co-ords passed, assume mouse offsets into the body
            x = this.body.getOffsetX();
            //y = this.body.getOffsetY();
        }
        
        var snapData = this.getSnapData(x, null, null, true);
        if (snapData) {
            if (snapData.nextValidSnap) {
                // it's a left offset, so if the snap is hidden, use the start offset of
                // the next good snap
                return snapData.nextValidSnap[cal.startDateField].duplicate();
            } else if (snapData.lastValidSnap) {
                // there's no valid next snap, use the previous one if it's there
                return snapData.lastValidSnap[cal.endDateField].duplicate();
            }
            return snapData[cal.endDateField].duplicate();
        }

        if (x < 0 || y < 0) return null;

        // get the colNum *before* catering for useSnapGap
        var colNum = this.body.getEventColumn(x);
        if (colNum == -2) colNum = this.body.fields.length-1;
        if (colNum == -1) return null;

        if (useSnapGap == null) useSnapGap = true;
        
        var snapGapPixels = Math.max(cal.getSnapGapPixels(this), 1);
        if (useSnapGap) {
            // when click/drag creating, we want to snap to the eventSnapGap
            var r = x % snapGapPixels;
            if (r) x -= r;
        }

        var date = this.body.fields[colNum].date,
            colLeft = this.body.getColumnLeft(colNum),
            delta = x - colLeft,
            snapGaps = Math.floor(delta / snapGapPixels)
        ;
        if (snapGaps) date = cal.addSnapGapsToDate(date.duplicate(), this, snapGaps);
        return date;
    },
    
    // gets the width that the event should be sized to in pixels
    _getEventBreadth : function (event, exactBreadth) {
        var props = event && event["_" + this.viewName];
        if (props) {
            if (exactBreadth && props.exactBreadth) return props.exactBreadth;
            if (!exactBreadth && props.snapBreadth) return props.snapBreadth;
        }
        
        // this method should now use two calls to getDateLeftOffset() to get start and end 
        // X offset, and the breadth is the pixel delta - this allows events to span arbitrary
        // hidden columns, while still rendering events that span the gap between the two dates
        var cal = this.calendar,
            eventStart = cal.getEventStartDate(event),
            eventEnd = cal.getEventEndDate(event),
            visibleStart = cal.getVisibleStartDate(this),
            visibleEnd = isc.DateUtil.adjustDate(cal.getVisibleEndDate(this), "-1ms");
        ;
        if (eventStart.getTime() < visibleStart.getTime()) eventStart = visibleStart;
        if (eventEnd.getTime() > visibleEnd.getTime()) eventEnd = visibleEnd;
        
        var eventLeft = this.getDateLeftOffset(eventStart, null, exactBreadth),
            eventRight = this.getDateRightOffset(eventEnd, exactBreadth),
            newBreadth = eventRight - eventLeft
        ;
        
        if (props) {
            if (exactBreadth) props.exactBreadth = newBreadth;
            else props.snapBreadth = newBreadth;
        }
        return newBreadth;
    },

    getDateRightOffset : function (date, exactOffset) {
        if (!date) return 0;

        var snapData = this.getSnapData(null, null, date, true);
        var leftOffset = 0;
        if (snapData) {
            if (snapData.lastValidSnap) {
                // it's a right offset, so if the snap is hidden, use the end offset of
                // the last good snap
                leftOffset = snapData.lastValidSnap.endLeftOffset;
            } else leftOffset = snapData.endLeftOffset;
        }
        return leftOffset;
    },
    // getDateLeftOffset timelineView
    getDateLeftOffset : function (date, useNextSnapGap, exactOffset) {
        
        if (!date) return 0;
        
        var snapData = this.getSnapData(null, null, date, true);
        if (snapData) {
            if (snapData.nextValidSnap) {
                // it's a left offset, so if the snap is hidden, use the start offset of
                // the next good snap
                return snapData.nextValidSnap.startLeftOffset;
            } else if (snapData.lastValidSnap) {
                // there's no valid next snap, use the previous one if it's there
                return snapData.lastValidSnap.endLeftOffset;
            }
            return snapData.startLeftOffset;
        }

        var visibleStartMillis = this.calendar.getVisibleStartDate(this).getTime();
        var visibleEndMillis = this.calendar.getVisibleEndDate(this).getTime();

        var millis = isc.isA.Number(date) ? date : date.getTime();
        if (millis <= visibleStartMillis) millis = visibleStartMillis + 1;
        if (millis >= visibleEndMillis) millis = visibleEndMillis;

        var cal = this.calendar,
            snapGapPixels = cal.getSnapGapPixels(this),
            snapMins = cal.getSnapGapMinutes(this)
        ;
        

        var fields = this.body.fields,
            len = fields.getLength(),
            mins = Math.floor(millis / 60000),
            colWidth = this.body.getColumnWidth(0),
            cellMins = this.getTimePerCell("mn")
        ;
        
        
        for (var i=0; i<len; i++) {
            var field = fields[i];
            //if (!this.fieldIsVisible(field)) continue;
            
            var startMillis = field.date.getTime(),
                endMillis = field.endDate.getTime(),
                startMins = Math.floor(field.date.getTime() / 60000),
                endMins = Math.floor(field.endDate.getTime() / 60000)
            ;
            if (mins == endMins) {
                return this.body.getColumnLeft(i) + colWidth;
            } else if (mins < endMins) {
                if (mins == startMins) {
                    return this.body.getColumnLeft(i);
                } else if (mins > startMins) {
                    // passed date is within this field - now get the snap point
                    var columnLeft = (colWidth * i),
                        deltaMins = mins - startMins,
                        snapsToAdd = Math.floor(deltaMins / snapMins),
                        extraMins = deltaMins % snapMins
                    ;
                    if (useNextSnapGap) {
                        // useNextSnapGap is passed in by getDateRightOffset() - if it's set
                        // and passed date is after the last snapGap, use the next one 
                        if (extraMins > 0 || deltaMins < snapMins) snapsToAdd++;
                    }
                    var left = columnLeft + Math.round((snapsToAdd * snapGapPixels));
                    if (exactOffset) left += Math.round(cal.getMinutePixels(extraMins, null, this));
                    return left;
                } else {
                    // passed date should have been in the previous field, but that field is
                    // clearly hidden - just return the left offset of this field
                    return (colWidth * i);
                }
            }
        }
        
        return -1;
    },
    
    // getEventLeft timelineView
    getEventLeft : function (event) {
        return this.getDateLeftOffset(this.calendar.getEventStartDate(event));
    },
    getEventRight : function (event) {
        return this.getDateRightOffset(this.calendar.getEventEndDate(event));
    },

    // cache the result of getLaneHeight(), which is called frequently - cleared in setLanes()
    laneHeightCache: {},
    getLaneHeight : function (lane) {
        var laneName = isc.isA.String(lane) ? lane : (isc.isAn.Object(lane) ? lane.name : null);
        // lane-height is from lane.height or grid.cellHeight
        var laneHeight = (lane && lane.height) || this.cellHeight;

        if (!laneName) {
            if (isc.isA.Number(lane)) lane = this.getRecord(lane);
            if (lane) {
                laneName = lane.name;
                if (lane.height != null) laneHeight = lane.height;
                lane = null;
            }
        }

        var cacheHeight = this.laneHeightCache[laneName];
        if (cacheHeight == null) {
            //this.logWarn("*** caching getLaneHeight('" + laneName + "')");
            this.laneHeightCache[laneName] = laneHeight;
        }
        return this.laneHeightCache[laneName];
    },
    getSublaneHeight : function (sublane, lane) {
        if (!isc.isAn.Object(sublane)) {
            if (!lane || !lane.sublanes) return null;
            if (isc.isA.Number(sublane)) sublane = lane.sublanes[sublane];
            else if (isc.isA.String(sublane)) {
                sublane = lane.sublanes.find(this.calendar.laneNameField, sublane);
            }
        }
        return sublane ? sublane.height : null;
    },

    getEditDialogPosition : function (event) {
        var cal = this.calendar,
            colNum = this.getColFromDate(cal.getEventStartDate(event), event[cal.laneNameField]),
            rowNum = this.getEventLaneIndex(event),
            rect = this.body.getCellPageRect(rowNum, colNum)
        ;
        return {
            left: Math.max(rect[0], this.body.getPageLeft()),
            top: Math.max(rect[1], this.body.getPageTop())
        };
    }

}); // end timelineView addProperties()

isc.DaySchedule.addClassProperties({

    
    _getEventScaffolding : function (view) {
        var minsPerRow = view.getTimePerCell(),
            rowCount = (60 / minsPerRow) * 24,
            data = [],
            row = {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}
        ;

        isc.DaySchedule._getCellDates(view);

        var logicalDate = view.logicalDate.duplicate(),
            logicalTime = isc.DateUtil.createLogicalTime(0, 0, 0)
        ;

        for (var i=0; i<rowCount; i++) {
            var time = isc.DateUtil.combineLogicalDateAndTime(logicalDate, logicalTime);
            var rec = data.add(isc.addProperties({}, row));
            rec.time = time.duplicate();
            rec.logicalTime = logicalTime.duplicate();
            rec.logicalDate = logicalDate.duplicate();
            logicalTime.setMinutes(logicalTime.getMinutes() + minsPerRow);
            //this.logWarn("ROW " + i + " UPDATE: " + isc.echoFull(rec));
        }

        return data;
    },



    
    _getCellDates : function (view) {
        var startDate = view.startDate || new Date();
        var minsPerRow = view.getTimePerCell(),
            rowCount = (60 / minsPerRow) * 24,
            counter = view.isDayView() ? 1 : 7,
            cellDates = []
        ;

        var logicalDate = view.logicalDate.duplicate();

        var date = isc.DateUtil.createDatetime(logicalDate.getFullYear(), logicalDate.getMonth(), 
                    logicalDate.getDate(), 0, 0, 0, 0);

        view._dstCells = null;

        for (var j=0; j < counter; j++) {
            var cellDate = date.duplicate();
            for (var i=0; i<rowCount; i++) {
                if (j == counter-1 && i == rowCount) break;
                if (!cellDates[i]) cellDates[i] = {};
                // store the dates in object properties rather than an array - makes life easier
                // in the week view when weekends aren't visible
                cellDates[i]["day" + (j+1)] = cellDate.duplicate();
                cellDates[i].logicalTime = isc.DateUtil.getLogicalTimeOnly(cellDate);
                
                // when calculating the times for cells, add rows*mins to the column's base
                // datetime - then create a logicalTime with the same offset
                var minsToAdd = minsPerRow * (i + 1);
                var newCellDate = isc.DateUtil.dateAdd(date, "mn", minsToAdd, 1);
                var newTime = isc.DateUtil.getLogicalTimeOnly(newCellDate, true);
                
                // use the logicalTime to cater for custom display timezone
                newTime.setTime(newTime.getTime() + (minsToAdd*60000));
                cellDates[i]["day" + (j+1) + "_end"] = isc.DateUtil.dateAdd(newCellDate, "ms", -1);
                cellDates[i].logicalEndTime = isc.DateUtil.getLogicalTimeOnly(cellDates[i]["day" + (j+1) + "_end"]);
                // compare the newTime (which is a logical time and not subject to DST) with the
                // time portion of the next calculated cellDate - if they're different, the cell's
                // datetime falls during the DST crossover
                var newDate_temp = cellDate.getDate(),
                    newCellDate_temp = newCellDate.getDate(),
                    newHours = newTime.getHours(),
                    newMinutes = newTime.getMinutes(),
                    // use the logicalTime to cater for custom display timezone
                    cellTime = isc.Date.getLogicalTimeOnly(newCellDate, true),
                    cellHours = cellTime.getHours(),
                    cellMinutes = cellTime.getMinutes()
                ;
                
                
                view.calendar.ignoreDST = true;
                if (view.calendar.ignoreDST) {
                    cellDate = newCellDate.duplicate();
                } else {
                    if (newHours != cellHours || newMinutes != cellMinutes) {
                        // the time portion of the parsed date doesn't match the logical time -
                        // this time must be involved in the DST crossover - use whatever was the
                        // time when they were last the same and store off the cell in question
                        // so it can be disabled in the UI
                        if (!view._dstCells) view._dstCells = [];
                        view._dstCells.add({ rowNum: i+1, colNum: j });
                    } else {
                        cellDate = newCellDate.duplicate();
                    }
                }

                cellDates[i]["day" + (j+1) + "_logicalDate"] = logicalDate.duplicate();
            }
            date = isc.DateUtil.dateAdd(date, "d", 1);
            logicalDate = isc.DateUtil.dateAdd(logicalDate, "d", 1);
        }

        view._cellDates = cellDates;
        return cellDates;
    }

});



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
// This file creates a mini-calendar that is used to pick a date, for example, you might have a
// button next to a form date field that brings this file up.




//>	@class	DateGrid
//
// A ListGrid subclass that manages calendar views.
//
// @inheritsFrom ListGrid
// @treeLocation Client Reference/Forms
// @visibility external
//<
if (isc.ListGrid == null) {
    isc.Log.logInfo("Source for DateGrid included in this module, but required " +
        "superclass (ListGrid) is not loaded. This can occur if the Forms module is " +
        "loaded without the Grids module. DateGrid class will not be defined within " + 
        "this page.", "moduleDependencies");
} else {

// create a customized ListGrid to show the days in a month
isc.ClassFactory.defineClass("DateGrid", "ListGrid");

isc.DateGrid.addProperties({
    width: 10,
    height: 10,
    cellHeight: 20,
    minFieldWidth: 20,
    autoFitMaxRows: 5,
    useCellRollOvers: true,
    canSelectCells: true,
    leaveScrollbarGap: false,
    canResizeFields: false,
    headerButtonProperties: {
        padding: 0
    },
    headerHeight: 20,
    canSort: false,
    canEdit: false,

    showSortArrow: isc.ListGrid.NONE,
    showFiscalYear: false,
    showFiscalWeek: false,
    showCalendarWeek: false,
    
    loadingDataMessage: "",
    alternateRecordStyles: false,
    
    showHeaderMenuButton: false,
    showHeaderContextMenu: false,

    canSaveSearches:false,
    
    cellPadding: 0,

    wrapCells: false,

    // we need to locate rows by cell-value, not PK or whatever else
    locateRowsBy: "targetCellValue",
    
    fiscalYearFieldTitle: "Year",
    weekFieldTitle: "Wk",
    
    canReorderFields: false,
    
    bodyProperties: {
        // this should not be needed
        _generated: true,
        canSelectOnRightMouse: false
    },
    autoFitData: "both",
    
    init : function () {
        // set up all fields 
        var weekends = this.getWeekendDays();
        this.shortDayNames = isc.DateUtil.getShortDayNames(3);
        this.shortDayTitles = isc.DateUtil.getShortDayNames(this.dayNameLength);
        this.shortMonthNames = isc.DateUtil.getShortMonthNames();

        var _this = this;
        this.fields = [
            { name: "fiscalYear", type: "number", title: this.fiscalYearFieldTitle, 
                width: this.fiscalYearColWidth, 
                align: "center", cellAlign: "center", showRollOver: false, showDown: false,
                baseStyle: this.baseFiscalYearStyle,
                headerBaseStyle: this.fiscalYearHeaderStyle || this.baseFiscalYearStyle,
                showIf : function (list, field) {
                    return list.showFiscalYear == true;
                }
            },
            { name: "fiscalWeek", type: "number", title: this.weekFieldTitle,
                width: 25, 
                align: "center", showRollOver: false, showDown: false,
                baseStyle: this.baseWeekStyle,
                headerBaseStyle: this.weekHeaderStyle || this.baseWeekStyle,
                showIf : function (list, field) {
                    return list.showFiscalWeek == true;
                }
            },
            { name: "calendarWeek", type: "number", title: this.weekFieldTitle, 
                width: 25, 
                align: "center", showRollOver: false, showDown: false,
                baseStyle: this.baseWeekStyle,
                headerBaseStyle: this.weekHeaderStyle || this.baseWeekStyle,
                showIf : function (list, field) {
                    return list.showCalendarWeek == true;
                }
            }
        ];
        for (var i=0; i<7; i++) {
            var dayNum = i + this.firstDayOfWeek;
            if (dayNum > 6) dayNum -= 7;

            var isWeekend = weekends.contains(dayNum);
            var obj = { name: this.shortDayNames[dayNum], weekStartOffset: i,
                isWeekend: isWeekend,
                isDateField: true,
                align: "center",
                dayNum: dayNum,
                baseStyle: isWeekend && this.styleWeekends ? this.baseWeekendStyle : this.baseWeekdayStyle,
                headerBaseStyle: isWeekend && this.styleWeekends ? this.weekendHeaderStyle : this.headerBaseStyle,
                showIf : function (list, field) { return list.showWeekends || field.isWeekend == false; }
            };
            this.fields.add(obj);
        }
        // flag fields as generated
        this.fields.setProperty("_generated", true);

        // prepare initial date-range
        if (!this.chosenDate) this.chosenDate = isc.DateUtil.createLogicalDate();
        this.month = this.chosenDate.getMonth();
        this.year = this.chosenDate.getFullYear();
        this.day = this.chosenDate.getDate();

        var monthStart = isc.DateUtil.createLogicalDate(this.year, this.month, 1);
        this.visibleStart = isc.DateUtil.getStartOf(monthStart, "w", null, this.firstDayOfWeek);

        // set up grid data - now always 6 rows, each with a weekStart date
        this.data = [];
        var d = this.visibleStart.duplicate();
        var fiscalCalendar = this.getFiscalCalendar();
        for (var i=1; i<7; i++) {
            // fiscal year object for start date
            var fiscalYear = d.getFiscalYear(fiscalCalendar);
            var weekEndDate = isc.DateUtil.getEndOf(d, "W", true, this.firstDayOfWeek)
            var obj = { name: "week" + i,
                // start/end logical dates for the record
                weekStart: d.duplicate(),
                weekEnd: weekEndDate,
                // fiscalYear for the start date
                fiscalYear: fiscalYear.fiscalYear, 
                // fiscalYear for the end date
                fiscalYearEnd: weekEndDate.getFiscalYear(fiscalCalendar).fiscalYear, 

                // fiscal week (for the start date)
                fiscalWeek: d.getFiscalWeek(fiscalCalendar, this.firstDayOfWeek),
                // fiscal week end (for the end date)
                fiscalWeekEnd: weekEndDate.getFiscalWeek(fiscalCalendar, this.firstDayOfWeek),

                // calendar week (for the first day of week)
                calendarWeek: d.getWeek(this.firstDayOfWeek)
            };

            for (var j=0; j<7; j++) {
                obj[this.shortDayNames[j]] = j;
            }
            this.data.add(obj);
            d.setDate(d.getDate() + 7);
        }
        return this.Super("init", arguments);
    },

    initWidget : function () {
        // set a flag that causes setChosenDate() to always run on the first execution
        this.firstRun = true;

        this.Super("initWidget", arguments);
    },
    
    draw : function () {
        var result = this.Super("draw", arguments);
        // switch on space-sharing for rows, after the initial draw, which we use to measure 
        // the grid's required/minimum size
        this._cellHeight = "*";
        if (this.refreshOnDraw) {
            // refreshOnDraw is a flag set in refreshUI() if it runs before draw
            delete this.refreshOnDraw;
            this.refreshUI(this.year, this.month, this.chosenDate);
        }
    },

    getTitleField : function () {
        return null;
    },
    
    getCellAlign : function (record, rowNum, colNum) {
        return "center";
    },

    getBaseStyle : function (record, rowNum, colNum) {
        var field = this.getField(colNum);
        if (field.isWeekend && !this.styleWeekends) return this.baseWeekdayStyle;
        return this.Super("getBaseStyle", arguments);
    },

    getCellStyle : function (record, rowNum, colNum) {
        var field = this.getField(colNum),
            weekNum = this.getRecordWeekNumber(record),
            selected = weekNum == this.selectedWeek
        ;

        if (field.name == "fiscalYear") {
            return !selected ? this.baseFiscalYearStyle : this.selectedWeekStyle;
        } else if (field.name == "fiscalWeek" || field.name == "calendarWeek") {
            return !selected ? this.baseWeekStyle : this.selectedWeekStyle;
        }

        var date = this.getCellDate(record, rowNum, colNum),
            isDisabled = this.dateIsDisabled(date),
            isOtherMonth = date.getMonth() != this.month,
            style = this.Super("getCellStyle", arguments);
        ;

        // If we're undrawn or not visible, no need to worry about special styling for
        // over row
        if (!this.body || !this.body.isDrawn() || !this.body.isVisible()) {
            return style;
        }
        
        if (this.body._handleDisplayIsNone()) {
            return style;
        }

        if (field.isDateField) {
            if ((isDisabled || isOtherMonth || this.isDisabled())) {
                
                style = field.isWeekend && this.styleWeekends ? this.disabledWeekendStyle : this.disabledWeekdayStyle;

                var eventRow = this.body.getEventRow(),
                    eventCol = this.body.getEventColumn(),
                    isOver = (eventRow == rowNum && eventCol == colNum),
                    lastSel = this.selectionManager && this.selectionManager.lastSelectedCell,
                    isSelected = lastSel ? lastSel[0] == rowNum && lastSel[1] == colNum :
                                    this.cellSelection ? 
                                    this.cellSelection.isSelected(rowNum, colNum) : false,
                    overIndex = style.indexOf("Over"),
                    selectedIndex = style.indexOf("Selected")
                ;

                if (overIndex >= 0) style = style.substring(0, overIndex);
                if (selectedIndex >= 0) style = style.substring(0, selectedIndex);
                
                if (isSelected) style += "Selected";
                if (isOver) style += "Over";
            }
        }

        return style;
    },
    
    mouseOut : function () {
        // clear the last hilite 
        this.clearLastHilite();
    },

    cellMouseDown : function (record, rowNum, colNum) {
        var date = this.getCellDate(record, rowNum, colNum);
        if (!date) return true;
        if (this.dateIsDisabled(date)) return false;
        return true;
    },
    
    cellClick : function (record, rowNum, colNum) {
        var date = this.getCellDate(record, rowNum, colNum);
        if (!date) return true;

        if (this.dateIsDisabled(date)) {
            return true;
        }

        // update the local date-parts
        this.year = date.getFullYear();
        this.month = date.getMonth();
        this.day = date.getDate();
        this.chosenDate = isc.DateUtil.createLogicalDate(this.year, this.month, this.day);

        // let the DateChooser know
        this.dateClick(this.year, this.month, this.day);
    },
    dateClick : function (year, month, date) {},

    getRecordWeekNumber : function (record) {
        // allow record-index to be passed, so you can easily get the first one
        if (record == null) return -1;
        if (isc.isA.Number(record)) record = this.data[record];
        return this.showFiscalWeek ? record.fiscalWeek : record.calendarWeek;
    },

    isSelectedWeek : function (record) {
        return this.getRecordWeekNumber(record) == this.selectedWeek;
    },

    cellSelectionChanged : function (cellList) {
        var sel = this.getCellSelection();
        for (var i=0; i<cellList.length; i++) {
            var cell = cellList[i];
            if (sel.cellIsSelected(cell[0], cell[1])) {
                var weekNum = this.getRecordWeekNumber(this.getRecord(cell[0]));
                if (this.selectedWeek != weekNum) {
                    this.setSelectedWeek(weekNum);
                }
                return;
            }
        }
        return;
    },

    getSelectedWeek : function () {
        // return the current selectedWeek, or the first one in the grid, so the 
        // DateChooser header always shows the right week
        return this.selectedWeek || this.getRecordWeekNumber(0);
    },
    
    setSelectedWeek : function (weekNum) {
        this.selectedWeek = weekNum;
        this.markForRedraw();
        this.selectedWeekChanged(this.selectedWeek);
    },
    selectedWeekChanged : function (weekNum) {},

    getWorkingMonth : function () {
        return this.month;
    },
    getSelectedDate : function () {
        return this.chosenDate;
    },

    disableMarkedDates : function () {
        this.disabledDateStrings = {};
        if (this.disabledDates && this.disabledDates.length > 0) {
            for (var i=0; i<this.disabledDates.length; i++) {
                this.disabledDateStrings[this.disabledDates[i].toShortDate()] = true;
            }
        }
    },

    dateIsDisabled : function (date) {
        if (!date) return;
        if (this.disableWeekends && this.dateIsWeekend(date)) return true;
        var disabled = this.disabledDateStrings ? 
                this.disabledDateStrings[date.toShortDate()] != null : false;
        return disabled;
    },
    
    getCellDate : function (record, rowNum, colNum) {
        var field = this.getField(colNum);
        if (field.weekStartOffset == null) return null;
        var rDate = record.weekStart.duplicate();
        rDate.setDate(rDate.getDate() + field.weekStartOffset);
        return rDate;
    },

    dateInView : function (date) {
        if (isc.DateUtil.compareLogicalDates(date, this.visibleStart) > 0) {
            // date before view-start
            return false;
        } else {
            var endDate = isc.DateUtil.createLogicalDate(this.visibleStart);
            endDate = isc.DateUtil.adjustDate(endDate, "+5W")
            if (isc.DateUtil.compareLogicalDates(date, endDate) < 0) {
                // date after view-end
                return false;
            }
        }
        return true;
    },
    selectDateCell : function (date, weekNum) {
        var selection = this.selectionManager;
        if (!this.dateInView(date)) {
            // date outside the current view - clear any current cell-selection
            selection && selection.deselectAll && selection.deselectAll();
            delete selection.lastSelectedCell
            this.body.markForRedraw();
            
            // and select either the passed weekNum (which comes from a cellClick() in the
            // DateChooser's weekMenu), or the first visible week, for display in the 
            // DateChooser header
            this.setSelectedWeek(weekNum != null ? weekNum : this.getRecordWeekNumber(0));

            return;
        }
        
        var cell = this.getDateCell(date);

        if (!cell) {
            // selected date isn't visible - clear the selection - selected date will be 
            // reselected if it re-appears later
            if (selection && selection.deselectAll) selection.deselectAll();
            return;
        }
        
        if (cell.colNum != null) selection.selectSingleCell(cell.rowNum, cell.colNum);

        // select either the passed weekNum (which comes from a cellClick() in the
        // DateChooser's weekMenu), or the week containing the selected date
        this.setSelectedWeek(weekNum != null ? weekNum : this.getRecordWeekNumber(cell.record));
    },

    getDateCell : function (date) {
        //this.logWarn("in getDateCell()");
        // returns an object with rowNum, colNum and record
        var selection = this.getCellSelection(),
            data = this.data
        ;

        if (date && data && data.length > 0) {
            var dayCount = this.showWeekends == false ? 5 : 7;
            var field = this.getField(this.shortDayNames[date.getDay()]);
            var fieldNum = field ? this.getFieldNum(field.name) : null;
            for (var i=0; i<data.length; i++) {
                var record = data[i];
                var cellDate = record.weekStart.duplicate();
                if (cellDate) {
                    cellDate.setDate(cellDate.getDate() + field.weekStartOffset);
                    if (isc.DateUtil.compareLogicalDates(cellDate, date) == 0) {
                        return { rowNum: i, colNum: fieldNum, record: record };
                    }
                }
            }
        }
    },

    shouldDisableDate : function (date) {
        var result = this.dateIsDisabled(date);
        return result;
    },

    getCellValue : function (record, rowNum, colNum, body) {
        var date = this.getCellDate(record, rowNum, colNum);
        if (date) return date.getDate();
        return this.Super("getCellValue", arguments);
    },

    getFieldTitle : function (fieldId) {
        var f = this.getField(fieldId);
        if (f.weekStartOffset != null) {
            return this.shortDayTitles[f.dayNum];
        }
        return this.Super("getFieldTitle", arguments);
    },

    // override getRowHeight() to make the rows always fill the body when it changes size
    getRowHeight : function (record, rowNum) {
        if (this.body && this._cellHeight == "*") {
            // use the outer-grid's current height, minus it's header height as the viewport
            // this is appropriate because the grid is clipping, and the body's inner height
            // doesn't shrink when the grid does, so neither do its rows
            var viewportHeight = this.getViewportHeight() - this.header.getVisibleHeight();
            var rowCount = this.getTotalRows(),
                rowHeight = Math.floor(viewportHeight / rowCount),
                // final row may be up to (rowCount-1) pixels taller than the other rows
                lastRowHeight = Math.floor(viewportHeight - (rowHeight*(rowCount-1)))
            ;
            if (rowNum == rowCount-1) return lastRowHeight-1;
            return rowHeight;
        }
        return this.Super("getRowHeight", arguments);
    },

    refreshUI : function (year, month, chosenDate, weekNum) {
        if (!this.isDrawn()) {
            // store the params and set a flag that will rerun this method on draw()
            this.year = year;
            this.month = month;
            this.chosenDate = chosenDate;
            this.refreshOnDraw = true;
            return;
        }
        if (this.firstRun || chosenDate && isc.DateUtil.compareLogicalDates(chosenDate, this.chosenDate) != 0) {
            delete this.firstRun;
            // if passed a new chosenDate, call setChosenDate() which navigates the view and 
            // selects the date-cell
            this.setChosenDate(chosenDate);
        } else {
            // otherwise, shift to the requested month/year if necessary, and potentially
            // override to select the passed weekNum (from clicks in the DateChooser weekMenu
            this.showMonth(month, year, weekNum);
        }        
    },

    // redrawOnResize, so the rows re-fill the vertical space
    redrawOnResize: true,

    setChosenDate : function (chosenDate) {
        // store the chosenDate, for highlighting later
        this.chosenDate = chosenDate.duplicate();
        this.day = this.chosenDate.getDate();
        // shift month if necessary - update this.month/year
        this.showMonth(this.chosenDate.getMonth(), this.chosenDate.getFullYear());
    },

    showMonth : function (month, year, weekNum) {
        //if (this.month == month && this.year == year) return;

        // remove the selected week - recalculated below
        delete this.selectedWeek;

        this.month = month;
        if (year) this.year = year;

        this.monthStart = isc.DateUtil.createLogicalDate(this.year, this.month, 1)
        this.visibleStart = isc.DateUtil.getStartOf(this.monthStart, "w", true, 
            this.firstDayOfWeek);

        // iterate over the grid data - now always 6 rows, each with a weekStart date
        var d = this.visibleStart.duplicate()
        var fiscalCalendar = this.getFiscalCalendar();
        for (var i=0; i<6; i++) {
            // fiscal year object for start date
            var fiscalYear = d.getFiscalYear(fiscalCalendar);
            var weekEndDate = isc.DateUtil.getEndOf(d, "W", true, this.firstDayOfWeek);
            isc.addProperties(this.data[i], {
                weekStart: d.duplicate(),
                weekEnd: weekEndDate,
                // fiscalYear for the start date
                fiscalYear: fiscalYear.fiscalYear, 
                // fiscalYear for the end date
                fiscalYearEnd: weekEndDate.getFiscalYear(fiscalCalendar).fiscalYear, 

                // fiscal week (for the start date)
                fiscalWeek: d.getFiscalWeek(fiscalCalendar, this.firstDayOfWeek),
                // fiscal week end (for the end date)
                fiscalWeekEnd: weekEndDate.getFiscalWeek(fiscalCalendar, this.firstDayOfWeek),

                // calendar week (for the first day of week)
                calendarWeek: isc.DateUtil.adjustDate(d, "+4d").getWeek(this.firstDayOfWeek)
            });
            d.setDate(d.getDate() + 7);
        }
        this.disableMarkedDates();
        
        // see whether showIf and other details need re-evaluating on the fields
        // always update fields if showFiscalYear is true, because the firstDayOfWeek
        // is different for every year, so the field-titles and weekend-styles always
        // need updating
        var needsFieldUpdate = this.showFiscalYear || 
            (this.showWeekends != this._showWeekends) ||
            (this.showFiscalWeek != this.fieldIsVisible("fiscalWeek")) ||
            (this.showCalendarWeek != this.fieldIsVisible("calendarWeek"))
        ;

        if (needsFieldUpdate) {
            var weekends = this.getWeekendDays();
            var firstDateCol = this.showFiscalYear ? 1 : 0;
            if (this.showFiscalWeek || this.showCalendarWeek) firstDateCol++;
            for (var i=0; i<7; i++) {
                var dayNum = i + this.firstDayOfWeek;
                if (dayNum > 6) dayNum -= 7;

                var isWeekend = weekends.contains(dayNum);
                var obj = { name: this.shortDayNames[dayNum],
                    weekStartOffset: i,
                    isWeekend: isWeekend,
                    isDateField: true,
                    align: "center",
                    dayNum: dayNum,
                    baseStyle: isWeekend && this.styleWeekends ? this.baseWeekendStyle : this.baseWeekdayStyle,
                    headerBaseStyle: isWeekend && this.styleWeekends ? this.weekendHeaderStyle : this.headerBaseStyle,
                    showIf : function (list, field) { return list.showWeekends || field.isWeekend == false; }
                };
                var field = this.fields[firstDateCol + i];
                if (field) isc.addProperties(field, obj);
            }
            this.refreshFields();
        }

        // do an immediate redraw() to update visible fields - needed for autoTests
        if (this.isDrawn()) this.redraw();

        // select the cell for the chosenDate, if it's visible
        this.selectDateCell(this.getSelectedDate(), weekNum) 

        // remember showWeekends, to check for a change on the next run through this method
        this._showWeekends = this.showWeekends;
    },

    fiscalYearColWidth: 30,
    getWeekendDays : function () {
        if (!this.weekendDays) this.weekendDays = isc.DateUtil.getWeekendDays();
        return this.weekendDays;
    },
    dateIsWeekend : function (date) {
        if (!date) return false;
        var wd = this.getWeekendDays();
        return date.getDay() == wd[0] || date.getDay() == wd[1];
    },

    getFiscalCalendar : function () {
        return this.fiscalCalendar || isc.DateUtil.getFiscalCalendar();
    },

    
    // set this to false to allow the DateGrid to NOT always show fiscal week 1 - instead, it 
    // may show either the highest partial week or 1, depending on where the fiscalStartDate is
    alwaysShowFirstFiscalWeek: true,
    getWeekRecord : function (date) {
        var fiscalCalendar = this.getFiscalCalendar(),
            // fiscal year object for start date
            fiscalYear = date.getFiscalYear(fiscalCalendar),
            // end of week date
            endDate = isc.DateUtil.dateAdd(date, "d", 6)
        ;

        if (date.logicalDate) endDate.logicalDate = true;

        // use the fourth day of the week to determine which week-number to display
        var weekDate = isc.DateUtil.dateAdd(date, "D", 4);

        var record = { 
            // first date within the row
            rowStartDate: date,
            rowEndDate: endDate.duplicate(),
            
            // fiscalYear for the start date
            fiscalYear: fiscalYear.fiscalYear, 
            // fiscalYear for the end date
            fiscalYearEnd: endDate.getFiscalYear(fiscalCalendar).fiscalYear, 
            
            // fiscal week (for the start date)
            fiscalWeek: date.getFiscalWeek(fiscalCalendar, this.firstDayOfWeek),
            // fiscal week end (for the end date)
            fiscalWeekEnd: endDate.getFiscalWeek(fiscalCalendar, this.firstDayOfWeek),
            
            // calendar week (for the first day of week)
            calendarWeek: weekDate.getWeek(this.firstDayOfWeek),

            weekDate: weekDate
        };
        
        
        
        // If we hit a fiscal week boundary, or a fiscalYear boundary, show the
        // week / year title in which more days in the week fall.
        
        if (record.fiscalWeek != record.fiscalWeekEnd) {

            var roundUpYear = false,
                roundUpWeek = false;
                
            if (record.fiscalYear != record.fiscalYearEnd) {
                if (!this.alwaysShowFirstFiscalWeek) {
                    var newYearStartDay =  Date.getFiscalStartDate(endDate, fiscalCalendar).getDay(),
                        delta = newYearStartDay - this.firstDayOfWeek;
                    if (delta < 0) delta += 6;
                    if (delta < 3) roundUpYear = true;
                } else roundUpYear = true;
            }
            
            if (!roundUpYear) {
                var yearStartDay = Date.getFiscalStartDate(date, fiscalCalendar).getDay(),
                    delta = yearStartDay - this.firstDayOfWeek;
                if (delta < 0) delta += 6;
                if (delta > 0 && delta < 3) roundUpWeek = true;
            }
            
            if (roundUpYear) {
                record.fiscalYear = record.fiscalYearEnd;
                record.fiscalWeek = 1;
            } else if (roundUpWeek) {
                record.fiscalWeek += 1;
            }
            
            
            
        }

        var year = date.getFullYear(),
            month = date.getMonth(),
            weekendDays = this.getWeekendDays()
        ;
        for (var i=0; i<7; i++) {
            var thisDate = isc.DateUtil.createLogicalDate(year, month, date.getDate() + i, 0);
            //if (this.showWeekends || !weekendDays.contains(thisDate.getDay())) {
                var dayName = this.shortDayNames[thisDate.getDay()];
                record[dayName] = thisDate;
            //}
        }
        
        return record;
    }
});

} // END of if (isc.ListGrid == null) else case
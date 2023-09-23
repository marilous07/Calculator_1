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
// SimpleType Grouping Modes
// --------------------------------------------------------------------------------------------
//> @groupDef builtinGroupingModes
// +link{class:SimpleType, SimpleTypes} support a mechanism for arranging values into groups.
// <P>
// These +link{simpleType.groupingModes, Grouping modes} can be applied to any SimpleType, but 
// some types already support a set of builtin modes, as follows:
// <P>
// <b>Date Grouping modes</b>
// <ul>
// <li> day/dayOfWeek: Group by week-day, all weeks </li>
// <li> dayOfMonth: Group by month-day, all months </li>
// <li> week: Group by Week number, all years </li>
// <li> month: Group by Month number, all years </li>
// <li> quarter: Group by Quarter, all years </li>
// <li> year: Group by Year </li>
// <li> upcoming: Various specific date groups: Today, Yesterday, Last Week, Last Month, etc </li>
// <li> date: Group by specific Date </li>
// <li> dayOfWeekAndYear: Group by week-day, week and year </li>
// <li> dayOfMonthAndYear: Group by month-day, month and year </li>
// <li> weekAndYear: Group by week-number and year </li>
// <li> monthAndYear: Group by month and year </li>
// <li> quarterAndYear: Group by quarter and year </li>
// </ul>
// <P>
// <b>Time Grouping modes</b>
// <ul>
// <li> hours: Group by hours value </li>
// <li> minutes: Group by minutes value </li>
// <li> seconds: Group by seconds value </li>
// <li> milliseconds: Group by milliseconds value </li>
// </ul>
// @visibility external
//<


//> @class GroupingMessages
// Grouping titles that will be displayed when data is grouped
// in a +link{ListGrid}.
// @treeLocation Client Reference/Grids/ListGrid
// @visibility external
//<
isc.ClassFactory.defineClass("GroupingMessages");

isc.GroupingMessages.addClassProperties({
    //> @classAttr GroupingMessages.upcomingBeforeTitle   (String : "Before" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs before
    // the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingBeforeTitle: "Before",
    
    //> @classAttr GroupingMessages.upcomingTodayTitle   (String : "Today" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs today,
    // relative to the current date.
    // 
    // @visibility external
    // @group i18nMessages
    //<
    upcomingTodayTitle: "Today",
    
    //> @classAttr GroupingMessages.upcomingTomorrowTitle   (String : "Tomorrow" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs tomorrow,
    // relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingTomorrowTitle: "Tomorrow",
    
    //> @classAttr GroupingMessages.upcomingThisWeekTitle   (String : "This Week" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs this week,
    // relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingThisWeekTitle: "This Week",
    
    //> @classAttr GroupingMessages.upcomingNextWeekTitle   (String : "Next Week" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs next week, 
    // relative to the current date.
    // 
    // @visibility external
    // @group i18nMessages
    //<
    upcomingNextWeekTitle: "Next Week",
    
    //> @classAttr GroupingMessages.upcomingThisMonthTitle   (String : "This Month" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs this
    // month, relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingThisMonthTitle: "This Month",

    //> @classAttr GroupingMessages.upcomingNextMonthTitle   (String : "Next Month" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs next 
    // month, relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingNextMonthTitle: "Next Month",
    
    //> @classAttr GroupingMessages.upcomingThisYearTitle   (String : "This Year" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs in the
    // same year as the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingThisYearTitle: "This Year",

    //> @classAttr GroupingMessages.upcomingNextYearTitle   (String : "Next Year" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs next 
    // year, relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingNextYearTitle: "Next Year",
    
    //> @classAttr GroupingMessages.upcomingLaterTitle   (String : "Later" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode, 
    // this is the group title for all records in which the grouped date field occurs later 
    // than the end of next year, relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingLaterTitle: "Later",
    
    // ----------------date constants----------------------------------------------------------
    
    //> @classAttr GroupingMessages.byDayTitle   (String : "by Day" : IRW)
    // Title to use for the menu option which groups a date field by day of week, across all 
    // weeks and years.  For example, all values that are on any Tuesday are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byDayTitle: "by Day",
    
    //> @classAttr GroupingMessages.byWeekTitle   (String : "by Week" : IRW)
    // Title to use for the menu option which groups a date field by week number, across all 
    // years.  For example, all values that are in Week 30 of any year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byWeekTitle: "by Week",
    
    //> @classAttr GroupingMessages.byMonthTitle   (String : "by Month" : IRW)
    // Title to use for the menu option which groups a date field by month number, across all 
    // years.  For example, all values that are in December of any year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byMonthTitle: "by Month",
    
    //> @classAttr GroupingMessages.byQuarterTitle   (String : "by Quarter" : IRW)
    // Title to use for the menu option which groups a date field by quarter, across all 
    // years.  For example, all values that are in Q4 of any year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byQuarterTitle: "by Quarter",
    
    //> @classAttr GroupingMessages.byYearTitle   (String : "by Year" : IRW)
    // Title to use for the menu option which groups a date field by year.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byYearTitle: "by Year",
    
    //> @classAttr GroupingMessages.byDayOfMonthTitle   (String : "by Day of Month" : IRW)
    // Title to use for the menu option which groups a date field by day of month, across all 
    // months and years.  For example, all values that are on day 25 of any month in any year 
    // are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byDayOfMonthTitle: "by Day of Month",
    
    //> @classAttr GroupingMessages.byUpcomingTitle   (String : "by Upcoming" : IRW)
    // Title to use for the menu option which groups a date field by upcoming dates.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byUpcomingTitle: "by Upcoming",

    //> @classAttr GroupingMessages.byDateTitle   (String : "by Date" : IRW)
    // Title to use for the menu option which groups a date field by specific dates.  All 
    // values that are within the 24 hours of a specific date in a given year are 
    // grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byDateTitle: "by Date",
    
    //> @classAttr GroupingMessages.byWeekAndYearTitle   (String : "by Week and Year" : IRW)
    // Title to use for the menu option which groups a date field by week number and year.  All
    // values that are in the same week in a given year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byWeekAndYearTitle: "by Week and Year",
    
    //> @classAttr GroupingMessages.byMonthAndYearTitle   (String : "by Month and Year" : IRW)
    // Title to use for the menu option which groups a date field by month number and year.  
    // All values that are in the same month in a given year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byMonthAndYearTitle: "by Month and Year",
    
    //> @classAttr GroupingMessages.byQuarterAndYearTitle   (String : "by Quarter and Year" : IRW)
    // Title to use for the menu option which groups a date field by quarter and year.  All 
    // values that are in the same quarter of a given year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byQuarterAndYearTitle: "by Quarter and Year",

    //> @classAttr GroupingMessages.byDayOfWeekAndYearTitle   (String : "by Day of specific Week" : IRW)
    // Title to use for the menu option which groups a date field by specific day of week.  All 
    // values that are in the same week and day of a given year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byDayOfWeekAndYearTitle: "by Day of specific Week",

    //> @classAttr GroupingMessages.byDayOfMonthAndYearTitle   (String : "by Day of specific Month" : IRW)
    // Title to use for the menu option which groups a date field by specific day of month.  All 
    // values that are in the same day and month of a given year are grouped together.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byDayOfMonthAndYearTitle: "by Day of specific Month",
    
    // -------------time contants--------------------------------------------------------------
    
    //> @classAttr GroupingMessages.byHoursTitle   (String : "by Hours" : IRW)
    // Title to use for the menu option which groups a time field by hours.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byHoursTitle: "by Hours",
    
    //> @classAttr GroupingMessages.byMinutesTitle   (String : "by Minutes" : IRW)
    // Title to use for the menu option which groups a time field by minutes.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byMinutesTitle: "by Minutes",
    
    //> @classAttr GroupingMessages.bySecondsTitle   (String : "by Seconds" : IRW)
    // Title to use for the menu option which groups a time field by seconds.
    //
    // @visibility external
    // @group i18nMessages
    //<
    bySecondsTitle: "by Seconds",
    
    //> @classAttr GroupingMessages.byMillisecondsTitle   (String : "by Milliseconds" : IRW)
    // Title to use for the menu option which groups a time field by milliseconds.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byMillisecondsTitle: "by Milliseconds",
    
    //> @classAttr GroupingMessages.weekNumberTitle   (String : "Week #" : IRW)
    // Title to use for the week number grouping mode
    //
    // @visibility external
    // @group i18nMessages
    //<
    weekNumberTitle: "Week #",

    //> @classAttr GroupingMessages.timezoneMinutesSuffix   (String : "minutes" : IRW)
    // Suffix to append to the timezoneMinutes grouping mode
    //
    // @visibility external
    // @group i18nMessages
    //<
    timezoneMinutesSuffix: "minutes",
    
    //> @classAttr GroupingMessages.timezoneSecondsSuffix   (String : "seconds" : IRW)
    // Suffix to append to the timezoneSeconds grouping mode
    //
    // @visibility external
    // @group i18nMessages
    //<
    timezoneSecondsSuffix: "seconds"
});

isc.builtinTypes =
{
    // basic types
  
    
    //any:{},
    text:{validators:{type:"isString", typeCastValidator:true},
        defaultOperator: "iContains"
    },
    "boolean":{validators:{type:"isBoolean", typeCastValidator:true},
        defaultOperator: "equals"
    },
    integer:{validators:{type:"isInteger", typeCastValidator:true},
        defaultOperator: "equals",
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Number(value)) return value.toFormattedString();
           return value;
        },
        getGroupValue : function(value, record, field, fieldName, grid) {
           var g = field.groupGranularity;
           return g ? Math.ceil(value / g) : value;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
           // if the field is an integer and groupGranularity is set,
           // form the granularity string
           var g = field.groupGranularity;
           return g ? ((value - 1) * g) + " - " + (value * g) : value;
        },
        
        parseInput : function (value) {

            var origValue = value;
            if (isc.isA.String(value)) value = value.trim();

            var res = isc.NumberUtil.parseInt(value, true);
            
            if ((value != res) || isNaN(res)) {
                return value;
            } else {
                return res;
            }
        }
    },
    "float":{validators:{type:"isFloat", typeCastValidator:true},
        defaultOperator: "equals",
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Number(value)) return value.toFormattedString();
           return value;
        },
        getGroupValue : function(value, record, field, fieldName, grid) {
           // the field is a float and groupPrecision is set as positive integer
           field.groupPrecision = parseInt(field.groupPrecision);
           if (field.groupPrecision < 0) field.groupPrecision = field.groupPrecision * -1;
           var p = field.groupPrecision ? Math.pow(10, field.groupPrecision) : null;
           return p ? Math.floor(value * p) / p : value;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
           // the field is a float type and groupPrecision is set
           // the return title should be appended with a *
           return field.groupPrecision ? value+"*" : value;
        },
        
        parseInput : function (value) {
            var res = isc.NumberUtil.parseFloat(value, true);
            if (isNaN(res)) {
                return value;
            } else {
                return res;
            }
        }
    },
    date:{validators:{type:"isDate", typeCastValidator:true},
        defaultOperator: "equals",
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Date(value)) return value.toNormalDate();
           return value;
        },

        getGroupingModes : function () {
            return {
                day: isc.GroupingMessages.byDayTitle,
                week: isc.GroupingMessages.byWeekTitle,
                month: isc.GroupingMessages.byMonthTitle,
                quarter: isc.GroupingMessages.byQuarterTitle,
                year: isc.GroupingMessages.byYearTitle,
                dayOfMonth: isc.GroupingMessages.byDayOfMonthTitle,
                upcoming: isc.GroupingMessages.byUpcomingTitle,
                date: isc.GroupingMessages.byDateTitle,
                weekAndYear: isc.GroupingMessages.byWeekAndYearTitle,
                monthAndYear: isc.GroupingMessages.byMonthAndYearTitle,
                quarterAndYear: isc.GroupingMessages.byQuarterAndYearTitle,
                dayOfWeekAndYear: isc.GroupingMessages.byDayOfWeekAndYearTitle,
                dayOfMonthAndYear: isc.GroupingMessages.byDayOfMonthAndYearTitle
            };
        },
        defaultGroupingMode : "date", //default grouping mode
        // this doesn't do anything
        //groupingMode : this.defaultGroupingMode,
        getGroupValue : function(value, record, field, fieldName, grid) {
            var returnValue=value;
            // if groupingMode is undefined, pick it up here from defaultGroupingMode
            var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
            // the field is a date and groupingModes is set
            if (isc.isA.Date(value) && groupingMode) {
                // check all possible values in the form {identified : return string}
                // { week:"by week", month:"by month", year:"by year" }
                 // { dayOfWeek:"by day of week", dayOfMonth:"by day of month" }
                // { timezoneHours:"by Timezone hours", timezoneMinutes:"by Timezone Minutes" }
                // { timezoneSeconds:"by Timezone Seconds" }
                // { default: { day:"by day" }
                switch (groupingMode) {
                    case "year":
                        returnValue = value.getFullYear();
                        break;

                    
                    case "quarter":
                        returnValue = Math.floor(value.getMonth() / 3) + 1;
                        break;
                    case "month":
                        returnValue = value.getMonth();
                        break;
                    case "week":
                        returnValue = value.getWeek();
                        break;
                    case "day":
                    case "dayOfWeek":
                        returnValue = value.getDay();
                        break;
                    case "dayOfMonth":
                        returnValue = value.getDate();
                        break;


                    
                    case "quarterAndYear":
                        returnValue = value.getFullYear() + "_" + (Math.floor(value.getMonth() / 3) + 1);
                        break;
                    case "monthAndYear":
                        var month = value.getMonth();
                        month = "" + (month < 10 ? "0" : "") + month;
                        returnValue = value.getFullYear() + "_" + month;
                        break;
                    case "weekAndYear":
                        returnValue = value.getFullYear() + "_" + 
                            isc.DateUtil.format(value, "ww");
                        break;
                    case "date":
                        var month = value.getMonth();
                        month = "" + (month < 10 ? "0" : "") + month;
                        returnValue = value.getFullYear() + "_" + 
                            month + "_" + 
                            isc.DateUtil.format(value, "dd");
                        break;
                    case "dayOfWeekAndYear":
                        var delta = isc.DateChooser.getPrototype().firstDayOfWeek;
                        var day = value.getDay() - delta;
                        if (day < 0) day += 7;
                        returnValue = value.getFullYear() + "_" + 
                            isc.DateUtil.format(value, "ww") + "_" + 
                            day;
                        break;
                    case "dayOfMonthAndYear":
                        var month = value.getMonth();
                        month = "" + (month < 10 ? "0" : "") + month;
                        returnValue = value.getFullYear() + "_" + 
                            month + "_" +
                            isc.DateUtil.format(value, "dd") + "_" + 
                            value.getDay();
                        break;

                    case "timezoneHours":
                        returnValue = value.getTimezoneOffset()/60;
                        break;
                    case "timezoneMinutes":
                        returnValue = value.getTimezoneOffset();
                        break;
                    case "timezoneSeconds":
                        returnValue = value.getTimezoneOffset()*60;
                        break;
                    case "upcoming":
                        var today = new Date();
                        if (today.isBeforeToday(value)) return 1;
                        else if (today.isToday(value)) return 2;
                        else if (today.isTomorrow(value)) return 3;
                        else if (today.isThisWeek(value)) return 4;
                        else if (today.isNextWeek(value)) return 5;
                        else if (today.isThisMonth(value)) return 6;
                        else if (today.isNextMonth(value)) return 7;
                        else if (today.getFullYear() == value.getFullYear()) return 8;
                        else if (today.getFullYear() + 1 == value.getFullYear()) return 9;
                        else return 10;
                        break;
               }
           }
           return returnValue;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
            var returnValue=value;
            // if groupingMode is undefined, pick it up here from defaultGroupingMode
            var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
            // the field is a date and groupingModes is set

            if (groupingMode && value != "-none-" && value != null && record.groupValue != null) {
                // check all possible values in the form {identified : return string}
                // { week:"by week", month:"by month", year:"by year" }
                // { dayOfWeek:"by day of week", dayOfMonth:"by day of month" }
                // { timezoneHours:"by Timezone hours", timezoneMinutes:"by Timezone Minutes" }
                // { timezoneSeconds:"by Timezone Seconds" }
                // { default: { day:"by day" }
                switch (groupingMode) {
                    case "quarter":
                        returnValue = "Q" + record.groupValue;
                        break;
                    case "month":
                        returnValue = isc.DateUtil.getShortMonthNames()[value];
                        break;
                    case "week":
                        returnValue = isc.GroupingMessages.weekNumberTitle + record.groupValue;
                        break;
                    case "day":
                    case "dayOfWeek":
                        returnValue = isc.DateUtil.getShortDayNames()[value];
                        break;
                    case "dayOfMonth":
                        returnValue = value;
                        break;
                    
                    // distinct versions 
                    case "quarterAndYear":
                        // eg, "Q4 2014"
                        var values = record.groupValue.split("_");
                        returnValue = "Q" + values[1] + " " + values[0];
                        break;
                    case "monthAndYear":
                        // eg, "December 2014"
                        var values = record.groupValue.split("_");
                        var month = new Number(values[1]);
                        returnValue = isc.DateUtil.getMonthNames()[month] + " " + values[0];
                        break;
                    case "weekAndYear":
                        // eg, "Week #48 2014"
                        var values = record.groupValue.split("_");
                        returnValue = isc.GroupingMessages.weekNumberTitle + values[1] + " " + values[0];
                        break;
                    case "date":
                        // eg, toShortDate()
                        var values = record.groupValue.split("_");
                        var month = new Number(values[1]);
                        var date = isc.DateUtil.createLogicalDate(values[0], month, values[2]);
                        returnValue = date.toShortDate();
                        break;
                    case "dayOfWeekAndYear":
                        // eg, "Week #48 2014, Tuesday"
                        var values = record.groupValue.split("_");
                        returnValue = isc.GroupingMessages.weekNumberTitle + values[1] + " " + 
                            values[0] + ", " + isc.DateUtil.getDayNames()[values[2]];
                        break;
                    case "dayOfMonthAndYear":
                        // eg, "December 2014, Tuesday 30"
                        var values = record.groupValue.split("_");
                        var month = new Number(values[1]);
                        returnValue = isc.DateUtil.getShortMonthNames()[month] + " " + values[0] +
                            ", " + isc.DateUtil.getDayNames()[values[3]] + " " + values[2];
                        break;

                    case "timezoneHours":
                        returnValue = "GMT+" + value;
                        break;
                    case "timezoneMinutes":
                        returnValue = "GMT+" + value + " " + isc.GroupingMessages.timezoneMinutesSuffix;
                        break;
                    case "timezoneSeconds":
                        returnValue = "GMT+" + value + " " + isc.GroupingMessages.timezoneSecondsSuffix;
                        break;
                    case "upcoming":
                        var today = new Date();
                        if (value == 1) return isc.GroupingMessages.upcomingBeforeTitle;
                        else if (value == 2) return isc.GroupingMessages.upcomingTodayTitle;
                        else if (value == 3) return isc.GroupingMessages.upcomingTomorrowTitle;
                        else if (value == 4) return isc.GroupingMessages.upcomingThisWeekTitle;
                        else if (value == 5) return isc.GroupingMessages.upcomingNextWeekTitle;
                        else if (value == 6) return isc.GroupingMessages.upcomingThisMonthTitle;
                        else if (value == 7) return isc.GroupingMessages.upcomingNextMonthTitle;
                        else if (value == 8) return isc.GroupingMessages.upcomingThisYearTitle;
                        else if (value == 9) return isc.GroupingMessages.upcomingNextYearTitle;
                        else return isc.GroupingMessages.upcomingLaterTitle;
                        break;
                }
            }
            return returnValue;
        }
    },
    time:{validators:{type:"isTime", typeCastValidator:true},
        defaultOperator: "equals",
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Date(value)) return isc.Time.toTime(value, null, true);
           return value;
        },
        getGroupingModes : function () {
            return {
                hours:isc.GroupingMessages.byHoursTitle,
                minutes:isc.GroupingMessages.byMinutesTitle,
                seconds:isc.GroupingMessages.bySecondsTitle,
                milliseconds:isc.GroupingMessages.byMillisecondsTitle
            }
        },
        defaultGroupingMode : "hours", //default grouping mode
        getGroupValue : function(value, record, field, fieldName, grid) {
           var returnValue=value;
           // if groupingMode is undefined, pick it up here from defaultGroupingMode
           var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
           // the field is a date and groupingModes is set
           if (isc.isA.Date(value) && groupingMode) {
               // check all possible values in the form {identified : return string}
               // { hours:"by Hours", minutes:"by Minutes", seconds:"by Seconds" }
               // { milliseconds:"by Milliseconds", }
               // { default: { hours:"by hours" }
               switch (groupingMode) {
                   case "hours":
                       returnValue = value.getHours();
                   break;
                   case "minutes":
                       returnValue = value.getMinutes();
                   break;
                   case "seconds":
                       returnValue = value.getSeconds();
                   break;
                   case "milliseconds":
                       returnValue = value.getMilliseconds();
                   break;
               }
           }
           return returnValue;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
           var returnValue=value;
           var groupingMode = field.groupingMode || field._simpleType.defaultGroupingMode || null;
           // the field is a date and groupingModes is set
           if (groupingMode && value != "-none-") {
               // check all possible values in the form {identified : return string}
               // { hours:"by Hours", minutes:"by Minutes", seconds:"by Seconds" }
               // { milliseconds:"by Milliseconds", }
               // { default: { hours:"by hours" }
               switch (groupingMode) {
                   case "hours":
                   case "minutes":
                   case "seconds":
                   case "milliseconds":
                       returnValue = value;
                   break;
               }
           }
           return returnValue;
        }
    },

    // synonyms of basic types.  NOTE: must inheritFrom rather than duplicate base type
    // definitions, so that the equivalent of "instanceof" checks will detect them as
    // being of the same base type
    string:{inheritsFrom:"text"}, // XML Schema
    // needed for sorting - getBaseType("ntext") returns "text"
    ntext:{inheritsFrom:"text"},
    "int":{inheritsFrom:"integer"}, // XML Schema
    "long":{inheritsFrom:"integer"},
    number:{inheritsFrom:"integer"},
    decimal:{inheritsFrom:"float"}, // XML Schema
    "double":{inheritsFrom:"float"}, // XML Schema

    
    datetime:{

        validators:{type:"isDate", typeCastValidator:true},
        defaultOperator: "equals",

        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Date(value)) return value.toShortDateTime(null, true);
           return value;
        },

        getGroupingModes : function () {
            return {
                day: isc.GroupingMessages.byDayTitle,
                week: isc.GroupingMessages.byWeekTitle,
                month: isc.GroupingMessages.byMonthTitle,
                quarter: isc.GroupingMessages.byQuarterTitle,
                year: isc.GroupingMessages.byYearTitle,
                dayOfMonth: isc.GroupingMessages.byDayOfMonthTitle,
                upcoming: isc.GroupingMessages.byUpcomingTitle,
                date: isc.GroupingMessages.byDateTitle,
                weekAndYear: isc.GroupingMessages.byWeekAndYearTitle,
                monthAndYear: isc.GroupingMessages.byMonthAndYearTitle,
                quarterAndYear: isc.GroupingMessages.byQuarterAndYearTitle,
                dayOfWeekAndYear: isc.GroupingMessages.byDayOfWeekAndYearTitle,
                dayOfMonthAndYear: isc.GroupingMessages.byDayOfMonthAndYearTitle
            };
        },
        defaultGroupingMode : "date", //default grouping mode
        // this doesn't do anything
        //groupingMode : this.defaultGroupingMode,
        getGroupValue : function(value, record, field, fieldName, grid) {
            var returnValue=value;
            // if groupingMode is undefined, pick it up here from defaultGroupingMode
            var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
            // the field is a date and groupingModes is set
            if (isc.isA.Date(value) && groupingMode) {
                // check all possible values in the form {identified : return string}
                // { week:"by week", month:"by month", year:"by year" }
                 // { dayOfWeek:"by day of week", dayOfMonth:"by day of month" }
                // { timezoneHours:"by Timezone hours", timezoneMinutes:"by Timezone Minutes" }
                // { timezoneSeconds:"by Timezone Seconds" }
                // { default: { day:"by day" }
                switch (groupingMode) {
                    case "year":
                        returnValue = value.getFullYear();
                        break;

                    
                    case "quarter":
                        returnValue = Math.floor(value.getMonth() / 3) + 1;
                        break;
                    case "month":
                        returnValue = value.getMonth();
                        break;
                    case "week":
                        returnValue = value.getWeek();
                        break;
                    case "day":
                    case "dayOfWeek":
                        returnValue = value.getDay();
                        break;
                    case "dayOfMonth":
                        returnValue = value.getDate();
                        break;


                    
                    case "quarterAndYear":
                        returnValue = value.getFullYear() + "_" + (Math.floor(value.getMonth() / 3) + 1);
                        break;
                    case "monthAndYear":
                        var month = value.getMonth();
                        month = "" + (month < 10 ? "0" : "") + month;
                        returnValue = value.getFullYear() + "_" + month;
                        break;
                    case "weekAndYear":
                        returnValue = value.getFullYear() + "_" + 
                            isc.DateUtil.format(value, "ww");
                        break;
                    case "date":
                        var month = value.getMonth();
                        month = "" + (month < 10 ? "0" : "") + month;
                        returnValue = value.getFullYear() + "_" + 
                            month + "_" + 
                            isc.DateUtil.format(value, "dd");
                        break;
                    case "dayOfWeekAndYear":
                        var delta = isc.DateChooser.getPrototype().firstDayOfWeek;
                        var day = value.getDay() - delta;
                        if (day < 0) day += 7;
                        returnValue = value.getFullYear() + "_" + 
                            isc.DateUtil.format(value, "ww") + "_" + 
                            day;
                        break;
                    case "dayOfMonthAndYear":
                        var month = value.getMonth();
                        month = "" + (month < 10 ? "0" : "") + month;
                        returnValue = value.getFullYear() + "_" + 
                            month + "_" +
                            isc.DateUtil.format(value, "dd") + "_" + 
                            value.getDay();
                        break;

                    case "timezoneHours":
                        returnValue = value.getTimezoneOffset()/60;
                        break;
                    case "timezoneMinutes":
                        returnValue = value.getTimezoneOffset();
                        break;
                    case "timezoneSeconds":
                        returnValue = value.getTimezoneOffset()*60;
                        break;
                    case "upcoming":
                        var today = new Date();
                        if (today.isBeforeToday(value)) return 1;
                        else if (today.isToday(value)) return 2;
                        else if (today.isTomorrow(value)) return 3;
                        else if (today.isThisWeek(value)) return 4;
                        else if (today.isNextWeek(value)) return 5;
                        else if (today.isThisMonth(value)) return 6;
                        else if (today.isNextMonth(value)) return 7;
                        else if (today.getFullYear() == value.getFullYear()) return 8;
                        else if (today.getFullYear() + 1 == value.getFullYear()) return 9;
                        else return 10;
                        break;
               }
           }
           return returnValue;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
            var returnValue=value;
            // if groupingMode is undefined, pick it up here from defaultGroupingMode
            var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
            // the field is a date and groupingModes is set

            if (groupingMode && value != "-none-" && value != null && record.groupValue != null) {
                // check all possible values in the form {identified : return string}
                // { week:"by week", month:"by month", year:"by year" }
                // { dayOfWeek:"by day of week", dayOfMonth:"by day of month" }
                // { timezoneHours:"by Timezone hours", timezoneMinutes:"by Timezone Minutes" }
                // { timezoneSeconds:"by Timezone Seconds" }
                // { default: { day:"by day" }
                switch (groupingMode) {
                    case "quarter":
                        returnValue = "Q" + record.groupValue;
                        break;
                    case "month":
                        returnValue = isc.DateUtil.getShortMonthNames()[value];
                        break;
                    case "week":
                        returnValue = isc.GroupingMessages.weekNumberTitle + record.groupValue;
                        break;
                    case "day":
                    case "dayOfWeek":
                        returnValue = isc.DateUtil.getShortDayNames()[value];
                        break;
                    case "dayOfMonth":
                        returnValue = value;
                        break;
                    
                    // distinct versions 
                    case "quarterAndYear":
                        // eg, "Q4 2014"
                        var values = record.groupValue.split("_");
                        returnValue = "Q" + values[1] + " " + values[0];
                        break;
                    case "monthAndYear":
                        // eg, "December 2014"
                        var values = record.groupValue.split("_");
                        var month = new Number(values[1]);
                        returnValue = isc.DateUtil.getMonthNames()[month] + " " + values[0];
                        break;
                    case "weekAndYear":
                        // eg, "Week #48 2014"
                        var values = record.groupValue.split("_");
                        returnValue = isc.GroupingMessages.weekNumberTitle + values[1] + " " + values[0];
                        break;
                    case "date":
                        // eg, toShortDate()
                        var values = record.groupValue.split("_");
                        var month = new Number(values[1]);
                        var date = isc.DateUtil.createLogicalDate(values[0], month, values[2]);
                        returnValue = date.toShortDate();
                        break;
                    case "dayOfWeekAndYear":
                        // eg, "Week #48 2014, Tuesday"
                        var values = record.groupValue.split("_");
                        returnValue = isc.GroupingMessages.weekNumberTitle + values[1] + " " + 
                            values[0] + ", " + isc.DateUtil.getDayNames()[values[2]];
                        break;
                    case "dayOfMonthAndYear":
                        // eg, "December 2014, Tuesday 30"
                        var values = record.groupValue.split("_");
                        var month = new Number(values[1]);
                        returnValue = isc.DateUtil.getShortMonthNames()[month] + " " + values[0] +
                            ", " + isc.DateUtil.getDayNames()[values[3]] + " " + values[2];
                        break;

                    case "timezoneHours":
                        returnValue = "GMT+" + value;
                        break;
                    case "timezoneMinutes":
                        returnValue = "GMT+" + value + " " + isc.GroupingMessages.timezoneMinutesSuffix;
                        break;
                    case "timezoneSeconds":
                        returnValue = "GMT+" + value + " " + isc.GroupingMessages.timezoneSecondsSuffix;
                        break;
                    case "upcoming":
                        var today = new Date();
                        if (value == 1) return isc.GroupingMessages.upcomingBeforeTitle;
                        else if (value == 2) return isc.GroupingMessages.upcomingTodayTitle;
                        else if (value == 3) return isc.GroupingMessages.upcomingTomorrowTitle;
                        else if (value == 4) return isc.GroupingMessages.upcomingThisWeekTitle;
                        else if (value == 5) return isc.GroupingMessages.upcomingNextWeekTitle;
                        else if (value == 6) return isc.GroupingMessages.upcomingThisMonthTitle;
                        else if (value == 7) return isc.GroupingMessages.upcomingNextMonthTitle;
                        else if (value == 8) return isc.GroupingMessages.upcomingThisYearTitle;
                        else if (value == 9) return isc.GroupingMessages.upcomingNextYearTitle;
                        else return isc.GroupingMessages.upcomingLaterTitle;
                        break;
                }
            }
            return returnValue;
        }
    },
    dateTime:{inheritsFrom:"datetime"},

    // derived types
    positiveInteger:{
        inheritsFrom:"integer",
        validators:{type:"integerRange", min:0}
    },
    integerPercent:{
        inheritsFrom:"integer",
        validators:{type:"integerRange", min:0, max:100}
    },
    percent:{inheritsFrom:"integerPercent"},
    sequence:{
        inheritsFrom:"integer",
        canEdit:false,
        readOnlyDisplay:"static",
        canFilter:true
    },
    "enum":{validators:"isOneOf", defaultOperator: "equals" },
    "intEnum":{inheritsFrom:"integer",validators:"isOneOf"},
    regexp:{inheritsFrom:"text", validators:"isRegexp"},
    identifier:{inheritsFrom:"text", validators:"isIdentifier"},
    URL:{inheritsFrom:"text"},
    image:{inheritsFrom:"text"},
    imageFile:{inheritsFrom:"binary"},
    HTML:{inheritsFrom:"text"},
    measure:{validators:"isMeasure", defaultOperator: "equals"},
    measureOrIdentifier:{validators:"isMeasureOrIdentifier", defaultOperator: "equals"},
    integerOrAuto:{validators:"integerOrAuto", defaultOperator: "equals"},
    positiveIntegerOrAsterisk:{validators:"positiveIntegerOrAsterisk", defaultOperator: "equals"},
    expression:{inheritsFrom:"text"},
    method:{inheritsFrom:"text"},
    "function":{inheritsFrom:"text"},
    alignEnum:{
        inheritsFrom:"enum",
        valueMap:{left:"left", center:"center", right:"right"}
    },
    valignEnum:{
        inheritsFrom:"enum",
        valueMap:{top:"top", bottom:"bottom", center:"center"}
    },
    sideEnum:{
        inheritsFrom:"enum",
        valueMap:{left:"left", right:"right", top:"top", bottom:"bottom"}
    },
    color:{inheritsFrom:"string", validators:"isColor"},
    
    modifier: {inheritsFrom:"text", hidden: true, canEdit: false},
    modifierTimestamp: {inheritsFrom:"datetime", hidden: true, canEdit: false},
    creator: {inheritsFrom:"text", hidden: true, canEdit: false},
    creatorTimestamp: {inheritsFrom:"datetime", hidden: true, canEdit: false},
    password: {
        inheritsFrom:"text",
        normalDisplayFormatter : function (value, field) {
           return new Array((value && value.length > 0 ? value.length+1 : 0)).join("*");
        },
        shortDisplayFormatter : function (value, field) {
           return new Array((value && value.length > 0 ? value.length+1 : 0)).join("*");
        }
    },
    localeInt:{
        inheritsFrom:"integer",
        normalDisplayFormatter : function (value, field) {
            if(!isc.isA.Number(value)) value = this.parseInput(value);
            if(!isc.isA.Number(value)) return value;
            return isc.NumberUtil.toLocalizedString(value);
        },
        shortDisplayFormatter : function (value, field) {
            if(!isc.isA.Number(value)) value = this.parseInput(value);
            if(!isc.isA.Number(value)) return value;
            return isc.NumberUtil.toLocalizedString(value);
        },
        editFormatter : function (value) {
            if (isc.isA.String(value)) return value;
            return isc.NumberUtil.toLocalizedString(value);
        },
        parseInput : function (value) {
            var res = isc.NumberUtil.parseLocaleInt(value);
            if (isNaN(res)) {
                return value;
            } else {
                return res;
            }
        }
    },
    localeFloat:{
        inheritsFrom:"float",
        normalDisplayFormatter : function (value, field) {
            if(!isc.isA.Number(value)) value = this.parseInput(value);
            if(!isc.isA.Number(value)) return value;
            return isc.NumberUtil.floatValueToLocalizedString(value, field.decimalPrecision, field.decimalPad);
        },
        shortDisplayFormatter : function (value, field) {
            if(!isc.isA.Number(value)) value = this.parseInput(value);
            if(!isc.isA.Number(value)) return value;
            return isc.NumberUtil.floatValueToLocalizedString(value, field.decimalPrecision, field.decimalPad);
        },
        editFormatter : function (value, field) {
            // when editing a float, the string should include the localized decimalSymbol,
            // but not the groupingSymbols - the 4th param to this call deals with that
            
            var res = isc.isA.String(value) ? value : 
                    isc.NumberUtil.floatValueToLocalizedString(value, null, null, true);
            return res;
        },
        parseInput : function (value) {
            var res = isc.NumberUtil.parseLocaleFloat(value);
            if (isNaN(res)) {
                return value;
            } else {
                return res;
            }
        },
        compareValues : function(value1, value2, field) {
            if (value1 == value2) {
                // special case for equal values: if value1 is number 
                // and value2 is not, value1 "wins" and vice versa
                var isNumber1 = isc.isA.Number(value1),
                    isNumber2 = isc.isA.Number(value2);

                // only value1 is number
                if (isNumber1 && !isNumber2) return -1;

                // only value2 is number
                if (!isNumber1 && isNumber2) return 1;

                // values are equal
                return 0;
            }

            // no special rules for non-equal values
            if (value1 > value2) {
                return -1;
            } else {
                return 1;
            }
        }
    },
    localeCurrency: {
        inheritsFrom:"decimal",
        normalDisplayFormatter : function (value, field) {
            if(!isc.isA.Number(value)) value = this.parseInput(value);
            if(!isc.isA.Number(value)) return value;
            return isc.NumberUtil.toCurrencyString(value);
        },
        shortDisplayFormatter : function (value, field) {
            if(!isc.isA.Number(value)) value = this.parseInput(value);
            if(!isc.isA.Number(value)) return value;
            return isc.NumberUtil.toCurrencyString(value);
        },
        editFormatter : function (value) {
            if (isc.isA.String(value)) return value;
            return isc.NumberUtil.toCurrencyString(value);
        },
        parseInput : function (value) {
            var res = isc.NumberUtil.parseLocaleCurrency(value);
            if (isNaN(res)) {
                return value;
            } else {
                return res;
            }
        },
        compareValues : function(value1, value2, field) {
            if (value1 == value2) {
                // special case for equal values: if value1 is number 
                // and value2 is not, value1 "wins" and vice versa
                var isNumber1 = isc.isA.Number(value1),
                    isNumber2 = isc.isA.Number(value2);

                // only value1 is number
                if (isNumber1 && !isNumber2) return -1;

                // only value2 is number
                if (!isNumber1 && isNumber2) return 1;

                // values are equal
                return 0;
            }

            // no special rules for non-equal values
            if (value1 > value2) {
                return -1;
            } else {
                return 1;
            }
        }
    },
    phoneNumber:{
        inheritsFrom:"text",
        browserInputType: "tel",
        normalDisplayFormatter : function (value, field) {
            if (value == null || value == "") return value;
            return "<a href='tel:" + value + "' class='sc_phoneNumber'>" + value + "</a>";
        },
        shortDisplayFormatter : function (value, field) {
            if (value == null || value == "") return value;
            return "<a href='tel:" + value + "' class='sc_phoneNumber'>" + value + "</a>";
        }
	},
	// "binary" is a valid field type and we should recognize it even if we don't 
	// have any custom client-side behavior built in at the SimpleType level
	binary:{}
};

(function () { 
    
    for (var typeName in isc.builtinTypes) {
        isc.builtinTypes[typeName].name = typeName;
    }
})();

//> @class SimpleType
// An atomic type such as a string or number, that is generally stored, displayed and
// manipulated as a single value.
// <P>
// SimpleTypes can be created at any time, and subsequently referred to as a 
// +link{dataSourceField.type,field type} in +link{DataSource,DataSources} and
// +link{DataBoundComponent,DataBoundComponents}.  This allows you to define
// +link{simpleType.validators,validation}, +link{simpleType.normalDisplayFormatter,formatting}
// and +link{simpleType.editorType,editing} behaviors for a type to be reused across all
// +link{DataBoundComponent,DataBoundComponents}.
// <P>
// The SimpleType class also allows data to be stored in some opaque format but treated as
// simple atomic values as far as SmartClient components are concerned by implementing
// +link{simpleType.getAtomicValue()} and +link{simpleType.updateAtomicValue()} methods.
// For example, if some record has a field value set to a javascript object with the
// following properties:
// <pre>
// { stringValue:"A String", length: 9 }
// </pre>
// this value could be treated as a simple string by defining a SimpleType with 
// +link{simpleType.inheritsFrom} set to <code>"text"</code> and a custom 
// <code>getAtomicValue()</code> method that simply extracted the <i>"stringValue"</i>
// attribute from the data object. DataBoundComponents would then display
// the string value, and use it for sorting and other standard databinding features.
// <P>
// Note that the term "simpleType" is used in the same sense as in
// +externalLink{http://www.w3.org/TR/xmlschema-0/,XML Schema}, and
// +link{XMLTools.loadXMLSchema()} will create new SimpleType definitions.
// <P>
// When using the SmartClient Server, SimpleTypes can be defined server-side, and should
// be defined server-side if validators are going to be declared so that the server will
// enforce validation. To define server-side SimpleTypes using Component XML you should create
// file {typeName}.type.xml in the following format:
// <pre>
//   &lt;SimpleType name="{typeName}" inheritsFrom="{otherSimpleType}" 
//                  editorType="{FormItemClassName}"&gt;
//     &lt;validators&gt;
//       &lt;!-- validator definition just like DataSourceField --&gt;
//     &lt;/validators&gt;
//   &lt;/SimpleType&gt;
// </pre>
// .. and place this file alongside your DataSource files (.ds.xml) files - in any of folders
// listed in <code>project.datasources</code> property in +link{group:server_properties,server.properties}.
// <P>
// SimpleTypes can be loaded via DataSourceLoader or +link{group:loadDSTag,loadDS JSP tags} and
// should be loaded <b>before</b> the definitions of any DataSources that use them (so
// generally put all SimpleType definitions first).
// <P>
// Define validators in the server-side type definition, for example:
// <pre>
//   &lt;SimpleType name="countryCodeType" inheritsFrom="text"&gt;
//     &lt;validators&gt;
//       &lt;validator type="lengthRange" min="2" max="2"
//         errorMessage="Length of country code should be equal to 2." /&gt;
//       &lt;validator type="regexp" expression="[A-Z][A-Z]"
//         errorMessage="CountryCode should have only uppercase letters." /&gt;
//     &lt;/validators&gt;
//   &lt;/SimpleType&gt;
// </pre>
// <P>
// For client-side formatters, add these to the type definition after loading it from the
// server, for example:
// <smartclient>
//   <pre>
//     isc.SimpleType.getType("independenceDateType").addProperties({
//         normalDisplayFormatter : function (value) {
//             if (value == null) return "";
//             return "&lt;i&gt;" + (value.getYear() + 1900) + "&lt;/i&gt;";
//         }
//     });
//   </pre>
// </smartclient>
// <smartgwt>
//   <pre>
//     SimpleType.getType("independenceDateType").setShortDisplayFormatter(new SimpleTypeFormatter() {
//       public String format(Object value, DataClass field, DataBoundComponent component, Record record) {
//         if (value == null) return null;
//         return "&lt;i&gt;" + (((java.util.Date) value).getYear() + 1900) + "&lt;/i&gt;";
//       }
//     });
//   </pre>
// </smartgwt>
// Note that formatters must be added to the SimpleType definition <b>before</b> any
// DataBoundComponent binds to a DataSource that uses the SimpleType.
// <p>
// An example is <smartclient>+explorerExample{formsCustomSimpleType,here}.</smartclient>
// <smartgwt>+explorerExample{extCustomSimpleType,here}.</smartgwt>
//
// @treeLocation Client Reference/Data Binding
// @serverDS allowed
// @visibility external
// @example extCustomSimpleType
//<

isc.defineClass("SimpleType");

isc.SimpleType.addClassMethods({

    //> @attr simpleType.name (Identifier : null : IR)
    // Name of the type, used to refer to the type from +link{DataSourceField.type,field.type}.
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.inheritsFrom (Identifier : null : IR)
    // Name of another SimpleType from which this type should inherit.
    // <P>
    // Validators, if any, will be combined.  All other SimpleType properties default to the
    // inherited type's value.
    //
    // @serverDS allowed
    // @visibility external
    // @example extCustomSimpleType
    //<

    //> @attr simpleType.validators (Array of Validator : null : IR)
    // Validators to apply to value of this type.
    //
    // @group validation
    // @serverDS allowed
    // @visibility external
    //<
    
    //> @attr simpleType.valueMap (ValueMap : null : IR)
    // List of legal values for this type, like +link{DataSourceField.valueMap}.
    //
    // @group dataType
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.canEdit (Boolean : null : IR)
    // Default value for +link{dataSourceField.canEdit} for fields of this type.
    // <P>
    // This impacts client-side behavior only and is a way to simply disallow 
    // editing of this field type by default within +link{FormItem.canEdit,editors}.
    // <P>
    // This property is set to false for the "sequence" SimpleType by default.
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.canFilter (Boolean : null : IR)
    // Default value for +link{dataSourceField.canFilter} for fields of this type.
    // <P>
    // This impacts client-side behavior only and may be used to explicitly enable
    // editing in filter interfaces, even if +link{simpleType.canEdit,editing is disabled}.
    // <P>
    // This property is set to true for the "sequence" SimpleType by default.
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.editorType (FormItemClassName : null : IR)
    // Classname of the FormItem that should be the default for editing values of this type (eg
    // "SelectItem").
    // <P>
    // You can create a simple custom FormItem by adding default +link{FormItem.icons} that
    // launch custom value picking dialogs (an example is in the <i>QuickStart
    // Guide</i>, Chapter 9, <i>Extending SmartClient</i>).  By setting simpleType.editorType
    // to the name of your custom FormItem, forms will automatically use the custom FormItem,
    // as will grids performing +link{listGrid.canEdit,inline editing}.
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.readOnlyDisplay (ReadOnlyDisplayAppearance : null : IR)
    // Default +link{FormItem.readOnlyDisplay,readOnlyDisplay} for fields of this type.
    // <P>
    // For more sophisticated management of read-only behavior, see +link{simpleType.readOnlyEditorType}.
    //
    // @serverDS allowed
    // @visibility external
    //<
    
    //> @attr simpleType.readOnlyEditorType (FormItemClassName : null : IR)
    // Classname of the FormItem that should be used to display values of this type when a field
    // is marked as +link{DataSourceField.canEdit,canEdit false} and the field is displayed
    // in an editor type component like a DynamicForm.
    // <P>
    // May be overridden by +link{DataSourceField.readOnlyEditorType}.
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.filterEditorType (FormItemClassName : null : IR)
    // Classname of the FormItem that should be used to edit values of this type if it appears
    // in a filter row.
    // <P>
    // May be overridden by +link{DataSourceField.filterEditorType}.
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.fieldProperties (DataSourceField Properties : null : IR)
    // These are properties that are essentially copied onto any DataSourceField where the
    // property is applied. The supported properties are only client-side properties.
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @method simpleType.getAtomicValue()
    // Optional method to extract an atomic value (such as a string or number)
    // from some arbitrary live data value. If defined, this method will be called
    // for every field value of the specified type in order to convert from the
    // raw data value to an atomic type to be used for standard DataBinding features
    // such as sorting and editing.
    // <p>
    // The "reason" parameter is passed by the framework to indicate why it is asking for the 
    // atomic value.  Your method can use this value to affect the atomic value that is 
    // returned - for example, if the reason is "sort" you could return the atomic value 
    // converted to upper-case, to impose case-insensitive sorting.  Reason strings used 
    // by the framework are:<ul>
    // <li>"edit" Retrieving the edit value of the field in a +link{class:DynamicForm} or 
    //               +link{class:ListGrid}</li>
    // <li>"format" Retrieving the value to format it for display</li>
    // <li>"mask" Retrieving the value to present it for masked input</li>
    // <li>"filter" Retrieving the value for use in a filter comparison</li>
    // <li>"sort" Retrieving the value for use in a sort comparison</li>
    // <li>"group" Retrieving the value for use in a group comparison</li>
    // <li>"formula" Retrieving the value for use in a formula calculation</li>
    // <li>"vm_getValue" Retrieving the value from +link{valuesManager.getValue()}</li>
    // <li>"validate" Retrieving the value for validation, or setting the value if validation
    //                   caused it to change</li>
    // <li>"compare" Retrieving the "old" or "new" value from +link{ListGrid.cellHasChanges()}</li>
    // <li>"getRawValue" Retrieving the raw value of a +link{class:ListGrid} cell</li>
    // <li>"criteria" Setting the value from +link{DynamicForm.setValuesAsCriteria()}</li>
    // <li>"updateValue" Setting the value from internal methods of +link{class:DynamicForm} 
    //                      or +link{class:ValuesManager} </li>
    // <li>"setRawValue" Setting the raw value of a +link{class:ListGrid} cell</li>
    // <li>"saveLocally" Setting the value from +link{ListGrid.saveLocally()}</li>
    // </ul>
    //
    // @param value (Any) Raw data value to convert. Typically this would be a field
    //   value for some record.
    // @param reason (String) The reason your getAtomicValue() method is being 
    //   called
    // @return (Any) Atomic value. This should match the underlying atomic type
    //   specified by the +link{SimpleType.inheritsFrom} attribute.
    // @visibility external
    //<

    //> @method simpleType.updateAtomicValue()
    // Optional method to update a live data value with an edited atomic value
    // (such as a string or number). If defined this method will be called
    // when the user edits data in a field of this type, allowing the developer
    // to convert from the atomic type to a raw data value for storage.
    // <P>
    // Note that if the user is editing a field which did not previously have a value, the
    // 'currentValue' will be null. This method should handle this (creating a new data value).
    //
    // @param atomicValue (Any) New atomic value. This should match the underlying
    //  atomic type specified by the +link{SimpleType.inheritsFrom} attribute.
    // @param currentValue (Any) Existing data value to be updated.
    // @param reason (String) The reason your updateAtomicValue() method is being 
    //   called. See +link{getAtomicValue()} for the reason strings used by the framework
    // @return (Any) Updated data value.
    // @visibility external
    //<

    
    //> @method simpleType.compareValues()
    // Optional method to allow you to write a custom comparator for this SimpleType.  If 
    // implemented, this method will be used by the framework when it needs to compare two
    // values of a field for equality - for example, when considering if an edited field 
    // value has changed.  If you do not implement this method, values will be compared using
    // standard techniques, so you should only provide an implementation if you have some 
    // unusual requirement.
    // <p>
    // Implementations of this method should return the following:<ul>
    // <li>0 if the two values are equal</li>
    // <li>-1 if the first value is greater than the second</li>
    // <li>1 if the second value is greater than the first</li>
    // </ul>
    //
    // @param value1 (Any) First value for comparison
    // @param value2 (Any) Second value for comparison
    // @param field (DataSourceField | ListGridField | DetailViewerField | FormItem)
    //  Field definition from a dataSource or dataBoundComponent.
    // @return (Integer) Result of comparison, -1, 0 or 1, as described above
    // @visibility external
    //<

    
    //> @attr simpleType.format (FormatString : null : IR)
    // +link{FormatString} for numeric or date formatting.  See +link{dataSourceField.format}.
    // @group exportFormatting
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.exportFormat (FormatString : null : IR)
    // +link{FormatString} used during exports for numeric or date formatting.  See
    // +link{dataSourceField.exportFormat}.
    // @group exportFormatting
    // @serverDS allowed
    // @visibility external
    //<
    
    //> @method simpleType.shortDisplayFormatter() 
    // Formatter for values of this type when compact display is required, for example, in a
    // +link{ListGrid} or +link{TreeGrid}.
    // <P>
    // When this formatter is called, the SimpleType object is available as "this".  
    // <P>
    // A formatter can make itself configurable on a per-component or per-field basis by
    // checking properties on the component or field.  For example, a formatter for account IDs
    // may want to omit a prefix in views where it is redundant, and could check a flag
    // listGridField.omitAccountIdPrefix for this purpose.
    //
    // @param value (Any) value to be formatted
    // @param [field] (Field) field descriptor from the component calling the formatter, if
    //                      applicable.  Depending on the calling component, this could be a
    //                      +link{ListGridField}, +link{TreeGridField}, etc
    // @param [component] (DataBoundComponent) component calling this formatter, if applicable
    // @param [record] (Object) Full record, if applicable
    //
    // @serverDS allowed
    // @visibility external
    //< 

    //> @method simpleType.normalDisplayFormatter() 
    // Normal formatter for values of this type used in a +link{StaticTextItem} or
    // +link{DetailViewer}.
    // <P>
    // When this formatter is called, the SimpleType object is available as "this".  
    // <P>
    // A formatter can make itself configurable on a per-component or per-field basis by
    // checking properties on the component or field.  For example, a formatter for account IDs
    // may want to omit a prefix in views where it is redundant, and could check a flag
    // detailViewer.omitAccountIdPrefix for this purpose.
    //
    // @param value (Any) value to be formatted
    // @param [field] (Field) field descriptor from the component calling the formatter, if
    //                      applicable.  Depending on the calling component, this could be a
    //                      +link{FormItem}, +link{DetailViewerField}, etc
    // @param [component] (DataBoundComponent) component calling this formatter, if applicable
    // @param [record] (Object) Full record, if applicable
    //
    // @serverDS allowed
    // @visibility external
    //<
    
    //> @method simpleType.editFormatter()
    // Formatter for values of this type when displayed in a freeform text editor, such as
    // a +link{TextItem}.
    // <P>
    // See also +link{simpleType.parseInput()} for parsing an edited text value back to
    // a data value.
    // @param value (Any) value to be formatted
    // @param [field] (FormItem) Editor for this field
    // @param [form] (DynamicForm) DynamicForm containing this editor
    // @param [record] (Record) Current edit values for this record, as displayed in
    //      the edit component.
    //
    // @return (String) formatted value
    //
    // @visibility external
    //<
    
    //> @method simpleType.parseInput()
    // Parser to convert some user-edited value to an underlying data value of this type.
    // This parser is called when storing out values edited in a freeform editor such as
    // a +link{TextItem}. Typically this will convert from the format produced by 
    // +link{simpleType.editFormatter} back to a data value.
    //
    // @param value (String) edited value provided by the user
    // @param [field] (FormItem) Editor for this field
    // @param [form] (DynamicForm) DynamicForm containing this editor
    // @param [record] (Record) Current edit values for this record, as displayed in
    //      the edit component.
    //
    // @return (Any) data value derived from display string passed in.
    //
    // @visibility external
    //<

    //> @classMethod SimpleType.getType()
    // Retrieve a simpleType definition by type name
    // @param typeName (String) the <code>name</code> of the simpleType to return
    // @return (SimpleType) simple type object
    // @visibility external
    //<
    getType : function (typeName, ds) {
        // respect local types (dataSource.getType() calls us back, but without passing itself)
        var type;
        if (ds) {
            type = ds.getType(typeName);
            if (type) return type;

            
            while (ds.inheritsFrom) {
                var parentDS = isc.DS.get(ds.inheritsFrom);
                // Full schema may not be loaded...
                if (!parentDS) break;
                type = this.getType(typeName, parentDS);
                if (type) return type;
                ds = parentDS;
            }
        }

        type = isc.builtinTypes[typeName];
        // Lazily convert to a true SimpleType if we're looking at a simple config object
        if (type != null && !isc.isAn.Instance(type)) {
            isc.builtinTypes[typeName] = null;
            type.name = typeName;
            type = isc.SimpleType.create(type);
            
        }
        return type;
    },

    
    
    // get the type this typeName or type definition inherits from
    getBaseType : function (type, ds) {
        if (isc.isA.String(type)) type = this.getType(type, ds);
        if (type == null) return null; // return null for being passed null and for
                                       // non-existent types
        while (type.inheritsFrom) {
            var parentType = this.getType(type.inheritsFrom, ds);
            if (parentType == null) return null; // no such parentType
            type = parentType;
        }
        return type.name;
    },

    // determine whether one type inherits from another
    inheritsFrom : function (type, otherType, ds) {
        if (otherType == null) {
            this.logWarn("inheritsFrom passed null type");
            return false;
        }
        if (isc.isA.String(type)) type = this.getType(type, ds);
        if (type == null) return false; // return false for non-existent types

        if (type.name == otherType) return true;
        while (type.inheritsFrom) {
            var parentType = this.getType(type.inheritsFrom, ds);
            if (parentType == null) return null; // no such parentType
            if (parentType.name == otherType) return true;
            type = parentType;
        }
        return false;
    },

    // validate a value of simple type
    validateValue : function (type, value, ds) {
        
        var field = { name:"_temp", type:type };
        isc.SimpleType.addTypeDefaults(field);
        var ds = ds || isc.DS.get("Object");
        return ds.validateFieldValue(field, value);
    },

    // add the type defaults to a field, once ever per field.
    // Happens to DataSources fields when fields are first accessed for the DataSource.
    // Happens to component.fields *which don't have a DataSource field* during DataSource
    // binding.  Otherwise, copied from DataSource fields like other properties.
    addTypeDefaults : function (field, ds) {
 
        if (field == null || field._typeDefaultsAdded) return;
        field._typeDefaultsAdded = true; // should only ever happen once per field

        // get the type definition, looking for locally defined type if a DataSource is passed
        // in
        var type = this.getType(field.type, ds);
        if (type == null) return;

        // hang the type definition itself on the field, since when formatters are called, they
        // need to be invoked on the type
        field._simpleType = type;

        // add the valueMap to the field
        if (field.valueMap == null) {
            var valueMap = this.getInheritedProperty(type, "valueMap", ds);
            if (valueMap != null) type.valueMap = field.valueMap = valueMap;
        }
        
        if (field.editorType == null) {
            var editorType = this.getInheritedProperty(type, "editorType", ds);
            if (editorType != null) type.editorType = field.editorType = editorType;
        }
        
        if (field.readOnlyEditorType == null) {
            var editorType = this.getInheritedProperty(type, "readOnlyEditorType", ds);
            if (editorType != null) type.readOnlyEditorType = field.readOnlyEditorType = editorType;
        }

        if (field.filterEditorType == null) {
            var editorType = this.getInheritedProperty(type, "filterEditorType", ds);
            if (editorType != null) type.filterEditorType = field.filterEditorType = editorType;
        }
        
        if (field.browserInputType == null) {
        	var browserInputType = this.getInheritedProperty(type, "browserInputType", ds);
            if (browserInputType != null) type.browserInputType = field.browserInputType = browserInputType;
        }
        if (field.canEdit == null) {
            var canEdit = this.getInheritedProperty(type, "canEdit", ds);
            if (canEdit != null) {
                field.canEdit = canEdit;
            }
        }
        if (field.canFilter == null) {
            var canFilter = this.getInheritedProperty(type, "canFilter", ds);
            if (canFilter != null) {
                field.canFilter = canFilter;
            }
        }

        // run type propagation for the SimpleType associated with this field
        
        this.setupInheritedProperties(type, ds);
        
        
        var editorProps = this.getInheritedProperty(type, "editorProperties", ds);
        if (editorProps != null) {
            // If defined at the field level as well, combine the objects
            if (field.editorProperties != null) {
                field.editorProperties = isc.addProperties({}, editorProps, field.editorProperties);
            } else {
                field.editorProperties = isc.addProperties({}, editorProps);
            }
        }
        
        if (field.readOnlyDisplay == null) {
            var readOnlyDisplay = this.getInheritedProperty(type, "readOnlyDisplay", ds);
            if (readOnlyDisplay != null) field.readOnlyDisplay = readOnlyDisplay;
        }
        
        var readOnlyEditorProps = this.getInheritedProperty(type, "readOnlyEditorProperties", ds);
        if (readOnlyEditorProps != null) {
            // If defined at the field level as well, combine the objects
            if (field.readOnlyEditorProperties != null) {
                isc.addProperties(readOnlyEditorProps, field.readOnlyEditorProperties);
            }
            field.readOnlyEditorProperties = readOnlyEditorProps;
        }

        var filterEditorProps = this.getInheritedProperty(type, "filterEditorProperties", ds);
        if (filterEditorProps != null) {
            // the case where the property on the LGF is null is handled by addProperties()
            field.filterEditorProperties = isc.addProperties({}, filterEditorProps, 
                                                       field.filterEditorProperties);
        }
        
        // add formatters / parsers
        
        var formatter = this.getInheritedProperty(type, "shortDisplayFormatter", ds)
        if (formatter != null) type.shortDisplayFormatter = formatter;
        var formatter = this.getInheritedProperty(type, "normalDisplayFormatter", ds)
        if (formatter != null) type.normalDisplayFormatter = formatter;
        // these aren't documented yet because they only get called by inline editing, not
        // normal forms
        var formatter = this.getInheritedProperty(type, "editFormatter", ds)
        if (formatter != null) type.editFormatter = formatter;
        var parser = this.getInheritedProperty(type, "parseInput", ds)
        if (parser != null) type.parseInput = parser;

        // add validators
        var typeValidators = this.getValidators(type, ds);
        if (typeValidators == null) return;
    
        if (!field.validators) {
            
            field.validators = typeValidators;
        } else {
            // there are both field validators and type validators
            if (!isc.isAn.Array(field.validators)) field.validators = [field.validators];
            field.validators.addAsList(typeValidators);
            this._reorderTypeValidator(field.validators);
        }
    },

    // setup/propagate any inherited properties directly onto the SimpleType
    
    setupInheritedProperties : function (type, ds) {
        if (type.getGroupTitle == null) {
            var getGroupTitle = this.getInheritedProperty(type, "getGroupTitle", ds);
            if (getGroupTitle != null) type.getGroupTitle = getGroupTitle;
        }
        if (type.getGroupValue == null) {
            var getGroupValue = this.getInheritedProperty(type, "getGroupValue", ds);
            if (getGroupValue != null) type.getGroupValue = getGroupValue;
        }
        if (type.getGroupingModes == null) {
            var getGroupingModes = this.getInheritedProperty(type, "getGroupingModes", ds);
            if (getGroupingModes != null) type.getGroupingModes = getGroupingModes;
        }
    },

    // get a property that can be defined in this type, or any type this type inherits from
    getInheritedProperty : function (type, propertyName, ds) {
        while (type != null) {
            if (type[propertyName] != null) return type[propertyName]
            type = this.getType(type.inheritsFrom, ds);
        }
    },

    // return all validators for the given type (can be the name or the type definition), taking
    // inheritance into account
    
    getValidators : function (type, ds) {
        if (isc.isA.String(type)) type = this.getType(type, ds);

        // _normalized flag indicates we've already made sure the "validators" Array is in the
        // canconical Array of Objects format
        if (type._normalized) return type.validators;

        var validators = type.validators;

        if (validators != null) { 
            // handle validators expressed as a single string or object
            if (!isc.isAn.Array(validators)) validators = [validators];

            var normalizedValidators = [];
            // if any of the validators are strings, replace them with validator objects,
            // setting the type to the string
            for (var i = 0; i < validators.length; i++) {
                var validator = validators[i];
                if (isc.isA.String(validator)) {
                    validator = {"type":validator};
                
                } else if (validator.type == null && isc.isAn.emptyObject(validator)) {
                    continue;
                }
                validator._generated = true;
                validator._typeValidator = true;
                normalizedValidators.add(validator);
            }
            validators = normalizedValidators;
        }

        // lookup the parent type's validators and combine
        var parentTypeID = type.inheritsFrom;
        if (parentTypeID != null) {
            var parentType = this.getType(parentTypeID, ds);
            if (parentType != null) {
                var parentValidators = this.getValidators(parentType, ds);
                if (parentValidators != null) {
                    validators = validators || [];
                    // NOTE: this intentionally places the subType's validators first, to allow
                    // error message overrides
                    validators.addAsList(parentValidators);
                    this._reorderTypeValidator(validators);
                }
            }
        }

        // flag this Array of validators as the default for the type
        if (validators) validators._typeValidators = true;

        // store the normalized and combined validators
        type.validators = validators;
        type._normalized = true;
        return validators;
    },
    _$typeCastValidator:"typeCastValidator",
    _reorderTypeValidator : function (validators) {
        

        //this.logWarn("validators are: " + this.echoAll(validators));

        // find the typeCast validator to determine the basic type this field inherits from
        // (equivalent to looking up the base type given the field type)
        var castValidator = validators.find(this._$typeCastValidator, true);
        if (castValidator) {
            // look for the most recent declaration of the basic type validator, in order to 
            // support redeclaration of the type validator with a custom error message, eg
            // { type:"isDate", errorMessage:"customMessage" }
            var castType = castValidator.type;
            //this.logWarn("cast validator is type: " + castType);
            for (var i = 0; i < validators.length; i++) {
                if (validators[i].type == castType) break;
            }
    
            // promote the most recent declaration of the basic type validator so that it will
            // run first, so subsequent validators don't have to check type
            
            //this.logWarn("moving validator to front: " + this.echo(validators[i]));
            if (i != 0) {
                var theType = validators[i];
                validators.splice(i, 1);
                validators.unshift(theType);
            }
            validators[0].stopIfFalse = true;
        }
    },
    
    // -------------------------------------------------------------------------------
    // summary functions

    //> @type SummaryFunction
    // This is used for client-side or server-side summaries
    // <ul><li> Client-side: Function to produce a summary value based on an array of records and a field definition. 
    // An example usage is the +link{listGrid.showGridSummary,listGrid summary row}, where
    // a row is shown at the bottom of the listGrid containing summary information about each
    // column.</li>
    // <li>Server-side: Function used for getting summarized field value using 
    // +link{group:serverSummaries,Server Summaries feature} or when 
    // +link{dataSourceField.includeFrom,Including values from multiple records}</li></ul>
    // <P>
    // For the client-side SummaryFunctions may be specified in one of 2 ways:<ul>
    // <li>as an explicit function or executable
    // +link{group:stringMethods,StringMethod}, which will be passed <code>records</code> (an array of records)
    // and <code>field</code> (the field definition for which the summary is required).</li>
    // <li>as a standard SummaryFunction identifier</li></ul>
    // For valid ways to configure SummaryFunctions to use server-side feature see the
    // +link{group:serverSummaries,Server Summaries overview}, including how to implement custom
    // summary functions, not just builtin ones listed here (look for "Custom Aggregation" section).
    //
    // @value sum <i>Client:</i> iterates through the set of records, picking up and summing all numeric values
    // for the specified field. Returns null to indicate invalid summary value if
    // any non numeric field values are encountered.<br>
    // <i>Server:</i> acts exactly like SQL SUM function.
    // 
    // @value avg <i>Client:</i> iterates through the set of records, picking up all numeric values
    // for the specified field and determining the mean value. Returns null to indicate invalid
    // summary value if any non numeric field values are encountered.<br>
    // <i>Server:</i> acts exactly like SQL AVG function.
    // 
    // @value max <i>Client:</i> iterates through the set of records, picking up all values
    // for the specified field and finding the maximum value. Handles numeric fields and
    // date/time/datetime type fields only. Returns null to indicate invalid
    // summary value if any non numeric/date field values are encountered.<br>
    // <i>Server:</i> acts exactly like SQL MAX function.
    // 
    // @value min <i>Client:</i> iterates through the set of records, picking up all values
    // for the specified field and finding the minimum value.  Handles numeric fields and
    // date/time/datetime type fields only. Returns null to indicate invalid summary value if
    // any non numeric field values are encountered.<br>
    // <i>Server:</i> acts exactly like SQL MIN function.
    // 
    // @value multiplier <i>Client:</i> iterates through the set of records, picking up all numeric values
    // for the specified field and multiplying them together.
    // Returns null to indicate invalid summary value if
    // any non numeric field values are encountered.<br>
    // <i>Server:</i> <b>not supported</b>.
    // 
    // @value count <i>Client:</i> returns a numeric count of the total number of records passed in.<br>
    // <i>Server:</i> acts exactly like SQL COUNT function.
    // 
    // @value title <i>Client:</i> returns <code>field.summaryValueTitle</code> if specified, otherwise
    // <code>field.title</code><br>
    // <i>Server:</i> <b>not supported</b>.
    // 
    // @value first <i>Client:</i> Currently the same as the <b>min</b> function.<br>
    // <i>Server:</i> implemented as SQL MIN function.
    // 
    // @value concat <i>Client:</i> iterates through the set of records, producing a string with
    // each value concatenated to the end.<br>
    // <i>Server:</i> implemented as SQL CONCAT function. Supported only by SQLDataSource. Note that it 
    // is natively supported only by Oracle DB driver, other drivers perform additional query to fetch 
    // values for concatenation. See also +link{dataSourceField.joinPrefix, joinPrefix}, 
    // +link{dataSourceField.joinString, joinString} and +link{dataSourceField.joinSuffix, joinSuffix} 
    // related datasource field attributes.
    //
    // @group serverSummaries
    // @visibility external
    //<

    // -------------------------------------------------------------------------------
    // SummaryConfiguration pseudo-class

    //> @object SummaryConfiguration
    // Settings for use with +link{SimpleType.applySummaryFunction()}.
    // @treeLocation Client Reference/Data Binding/SimpleType
    // @visibility external
    //<

    //>	@attr summaryConfiguration.badFormulaResultValue (String : "." : IRW)
    // The field value to treat as the bad result of a user formula or summary evaluation.
    // If a summary function actually uses the value (rather than say "count"), this usually
    // means that the value will simply be skipped rather than voiding evaluation of the
    // entire summary.
    //
    // @visibility external
    //<

    //> @attr summaryConfiguration.invalidSummaryValue (String : "&nbsp;" : IRWA)
    // The field value to treat as an invalid value from a summary row (see 
    // +link{listGrid.showGridSummary} or +link{listGrid.showGroupSummary}) or as an invalid value
    // in a summary-type field (see +link{listGridFieldType,listGridFieldType:"summary"}).
    // If a summary function actually uses the value (rather than say "count"), this usually
    // means that the value will simply be skipped rather than voiding evaluation of the
    // entire summary.
    //
    // @visibility external
    //<

    

    // set up default registered summary functions (documented above)
    _registeredSummaryFunctions:{
    
        title : function (records, field, config) {
            if (config == null) config = isc.SimpleType._getDefaultSummaryConfiguration();
            if (config.summaryValueTitle != null) return config.summaryValueTitle;
            if (field.summaryValueTitle != null) return field.summaryValueTitle;
            return field.title;
        },
    
        // Note that we use the undocumented 'component' param so _getFieldValue() can
        // handle cases where a field's dataPath is "absolute"
        sum : function (records, field, config, component) {
            if (config == null) config = isc.SimpleType._getDefaultSummaryConfiguration();

            var total = 0;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true, "formula"),
                    floatVal = parseFloat(value)
                ;
                if (value == null || value === isc.emptyString) {
                    continue;
                }
                if (isc.isA.Number(floatVal) && (floatVal == value)) total += floatVal;
                    // if we hit any invalid values, just return null - the grid will show
                    // the 'invalidSummaryValue' marker
                else {
                    // its a formula/summary field, ignore if showing the bad formula value
                    if ((field.userFormula || field.userSummary) &&
                        value == config.badFormulaResultValue ||
                        value == config.invalidSummaryValue) continue;
                    return null;
                }
            }
            return total;
        },
        
        avg : function (records, field, config, component) {
            if (config == null) config = isc.SimpleType._getDefaultSummaryConfiguration();

            var total = 0, count=0;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true, "formula"),
                    floatVal = parseFloat(value)
                ;
                if (value == null || value === isc.emptyString) {
                    continue;
                }
                if (isc.isA.Number(floatVal) && (floatVal == value)) {
                    count += 1;
                    total += floatVal;
                } else {
                    // its a formula/summary field, ignore if showing the bad formula value
                    if ((field.userFormula || field.userSummary) &&
                        value == config.badFormulaResultValue ||
                        value == config.invalidSummaryValue) continue;
                    return null;
                }
            }
            return count > 0 ? total/count : null;
        },
        
        // Returns the highest value, if values are dates it will return the most recent date
        max : function (records, field, config, component) {
            if (config == null) config = isc.SimpleType._getDefaultSummaryConfiguration();

            var dateCompare = (field.type == "date" || field.type == "datetime" || field.type == "time")
            var max;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true, "formula");

                if (value == null || value === isc.emptyString) {
                    continue;
                }
                if (dateCompare) {
                    var dateVal = isc.clone(value);
                    if (!isc.isA.Date(value)) {
                        if (isc.isA.String(value)) {
                            if (isc.DateUtil.isDatetimeString(value)) {
                                dateVal = isc.DateUtil.parseInput(value);
                            } else if (field.type == "time") {
                                dateVal = isc.Time.parseInput(value);
                            } else {
                                dateVal = isc.DateUtil.parseSchemaDate(value);                        
                            }
                        } else {
                            return null;
                        }
                    }
                    if (max == null || dateVal.getTime() > max.getTime()) max = dateVal.duplicate(); 
                } else {
                    var floatVal = parseFloat(value);
                        
                    if (isc.isA.Number(floatVal) && (floatVal == value)) {
                        if (max == null) max = floatVal;
                        else if (max < value) max = floatVal;
                    } else {
                        // its a formula/summary field, ignore if showing the bad formula value
                        if ((field.userFormula || field.userSummary) &&
                            value == config.badFormulaResultValue ||
                            value == config.invalidSummaryValue) continue;
                        return null;
                    }
                }
            }
            return max;
        },

        // Returns the smallest value, if values are dates it will return the least recent date
        min : function (records, field, config, component) {
            if (config == null) config = isc.SimpleType._getDefaultSummaryConfiguration();

            var dateCompare = (field.type == "date" || field.type == "datetime" || field.type == "time")
            var min;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true, "formula");
                if (value == null || value === isc.emptyString) {
                    continue;
                }
                if (dateCompare) {
                    var dateVal = isc.clone(value);
                    if (!isc.isA.Date(value)) {
                        if (isc.isA.String(value)) {
                            if (isc.DateUtil.isDatetimeString(value)) {
                                dateVal = isc.DateUtil.parseInput(value);
                            } else if (field.type == "time") {
                                dateVal = isc.Time.parseInput(value);
                            } else {
                                dateVal = isc.DateUtil.parseSchemaDate(value);                        
                            }
                        } else {
                            return null;
                        }
                    }
                    if (min == null || dateVal.getTime() < min.getTime()) min = dateVal.duplicate();
                } else {
                    var floatVal = parseFloat(value);
                    if (isc.isA.Number(floatVal) && (floatVal == value)) {
                        if (min == null) min = floatVal;
                        else if (min > value) min = floatVal;
                    } else {
                        // its a formula/summary field, ignore if showing the bad formula value
                        if ((field.userFormula || field.userSummary) &&
                            value == config.badFormulaResultValue ||
                            value == config.invalidSummaryValue) continue;
                        return null;
                    }
                }
            }
            return min;
        },

        // Multiplies the values with each other, this requires each value to be a number
        multiplier : function (records, field, config, component) {
            if (config == null) config = isc.SimpleType._getDefaultSummaryConfiguration();

            var multiplier = 0;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true, "formula");
               
                var floatVal = parseFloat(value);
                if (isc.isA.Number(floatVal) && (floatVal == value)) {
                    if (i == 0) multiplier = floatVal;
                    else multiplier = (multiplier * floatVal);
                } else {
                    // its a formula/summary field, ignore if showing the bad formula value
                    if ((field.userFormula || field.userSummary) &&
                        value == config.badFormulaResultValue ||
                        value == config.invalidSummaryValue) continue;
                    return null;
                }
            }
            return multiplier;
        },

        // Returns the a count of the number of records using its length property
        count : function (records) {
            return records.length;
        },

        // Calls the min function for the same behaviour
        first : function(records, field, config, component) {
            return isc.SimpleType.applySummaryFunction(records, field, "min", config,
                                                       component);
        },

        // Adds the values together (as strings) and returns the concatenated string
        
        concat : function(records, field, config, component) {
            if (config == null) config = isc.SimpleType._getDefaultSummaryConfiguration();
            var concatOutput = [];

            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true, "formula");
                concatOutput.add(value);
            }

            var prefix = config.joinPrefix || field.jsonPrefix || '';
            var suffix = config.joinSuffix || field.jsonSuffix || '';
            var separator = config.joinString || field.joinString || '';
            var joined = concatOutput.join(separator);
            return prefix.concat(joined, suffix);
        }
    },

    _getDefaultSummaryConfiguration : function () {
        return {
            invalidSummaryValue: isc.ListGrid == null ? "&nbsp;" :
                isc.ListGrid.getInstanceProperty("invalidSummaryValue"),
            badFormulaResultValue: isc.DataBoundComponent == null ? "." :
                isc.Canvas.getInstanceProperty("badFormulaResultValue")
        };
    },

    //> @classMethod SimpleType.registerSummaryFunction()
    // Registers a new +link{type:SummaryFunction} by name. After calling this method,
    // developers may specify the name passed in as a standard summaryFunction
    // (for example in +link{listGridField.summaryFunction}).
    // @param functionName (String) name for the newly registered summaryFunction
    // @param method (Function) New summary function. This function should take 2 parameters
    // <ul>
    //  <li><code>records</code>: an array of records for which a summary must be generated
    //  <li><code>field</code>: a field definition 
    //  <li><code>summaryConfig</code>: summary configuration (see +link{SummaryConfiguration})
    // </ul>
    // and return a summary value for the field across the records.
    //
    // @visibility external
    //<
    
    registerSummaryFunction : function (functionName, method) {
        
        if (functionName == null) return;
        // handle being passed a stringMethod
        if (isc.isA.String(method)) {
             method = isc.Func.expressionToFunction(
                 "records,field,summaryConfig,displayComponent",
                 functionName);
        }
        this._registeredSummaryFunctions[functionName] = method;
    },

    getRegisteredSummaryFunctions : function () {
        return isc.getKeys(this._registeredSummaryFunctions);
    },

    //> @classMethod SimpleType.setDefaultSummaryFunction()
    // Set up a default summary function for some field type.
    // <P>
    // Note that the following default summary functions are set up when SmartClient initializes:
    // <br>- <code>"integer"</code> defaults to <code>"sum"</code>
    // <br>- <code>"float"</code> defaults to <code>"sum"</code>.
    //
    // @param typeName (String) type name
    // @param summaryFunction (SummaryFunction) summary function to set as the default for
    //   this data type.
    // @visibility external
    //<
    setDefaultSummaryFunction : function (type, summaryFunction) {
        var typeObj = this.getType(type);
        if (typeObj) typeObj._defaultSummaryFunction = summaryFunction;
    },
    
    //> @classMethod SimpleType.getDefaultSummaryFunction()
    // Retrieves the default summary function for some field type.
    // @param typeName (String) type name
    // @return (SummaryFunction) default summary function for this data type.
    // @visibility external
    //<
    getDefaultSummaryFunction : function (type) {
        var typeObj = this.getType(type);
        if (typeObj) {
            if (typeObj._defaultSummaryFunction != null) {
                return typeObj._defaultSummaryFunction;
            }
            if (typeObj.inheritsFrom != null && typeObj.inheritsFrom != type) {
                return this.getDefaultSummaryFunction(typeObj.inheritsFrom);
            }
        }
    },
    
    //> @classMethod SimpleType.applySummaryFunction()
    // Applies a +link{type:SummaryFunction} to an array of records
    // @param records (Array of Objects) set of records to retrieve a summary value for
    // @param field (DataSourceField) field for which we're picking up a summary value
    // @param summaryFunction (SummaryFunction) SummaryFunction to apply to the records
    //  in order to retrieve the summary value. May be specified as an explicit function
    //  or string of script to execute, or a SummaryFunction identifier
    // @param summaryConfig (SummaryConfiguration) config that affects summary calculation
    // @return (Any) summary value generated from the applied SummaryFunction
    // @visibility external
    //< 
    
    applySummaryFunction : function (records, field, summaryFunction, summaryConfig,
                                     displayComponent)
    {
        if (!summaryFunction || !field || !records) return;
        
        // convert to an actual method to execute if necessary
        if (isc.isA.String(summaryFunction)) {
            if (this._registeredSummaryFunctions[summaryFunction]) {
                summaryFunction = this._registeredSummaryFunctions[summaryFunction];
            } else {
                summaryFunction = isc.Func.expressionToFunction(
                    "records,field,summaryConfig,displayComponent",
                    summaryFunction);
            }
        }
        if (isc.isA.Function(summaryFunction)) {
            return summaryFunction(records, field, summaryConfig, displayComponent);
        }
    },
    
    //> @attr simpleType.validOperators (Array of OperatorId : null : IR)
    // Set of +link{type:OperatorId, search-operators} valid for this <code>SimpleType</code>.  
    // <P>
    // If not specified, the +link{inheritsFrom,inherited} type's operators will be used, finally
    // defaulting to the default operators for the basic types (eg, integer).
    // @group advancedFilter
    // @serverDS allowed
    // @visibility external
    //<

    getValidOperators : function (typeName) {
        typeName = typeName || "text";
        var typeObj = this.getType(typeName);
        if (typeObj) {
            if (typeObj.validOperators != null) {
                return typeObj.validOperators;
            }
            if (typeObj.inheritsFrom != null && typeObj.inheritsFrom != typeName) {
                return this.getValidOperators(typeObj.inheritsFrom);
            }
        }
    },

    //> @attr simpleType.defaultOperator (OperatorId : null : IR)
    // The default +link{type:OperatorId, search-operator} for this data-type.
    // @group advancedFilter
    // @serverDS allowed
    // @visibility external
    //<

    getDefaultOperator : function (typeName) {
        typeName = typeName || "text";
        var typeObj = this.getType(typeName);
        if (typeObj) {
            if (typeObj.defaultOperator != null) {
                return typeObj.defaultOperator;
            }
            if (typeObj.inheritsFrom != null && typeObj.inheritsFrom != typeName) {
                return this.getDefaultOperator(typeObj.inheritsFrom);
            }
        }
        // if there's no type or defaultOp, return "iContains"
        //return "iContains";
    }
    
});

isc.SimpleType.addMethods({
    init : function () {
        // anonymous type; really only occurs validly with xsd:list and xsd:union, otherwise
        // anonymous types are just rolled into a DataSourceField definition and never create a
        // SimpleType as such
        if (!this.name) this.name = isc.ClassFactory.getNextGlobalID(this);
        if (isc.builtinTypes[this.name] != null) {
            // clobber existing types, but not if the new type came from XML Schema (and hence
            // is namespaced and still available via the SchemaSet)
            if (!this.xmlSource) {
                this.logWarn("SimpleType '" + this.name + "' defined twice: " +
                             this.getStackTrace());
                isc.builtinTypes[this.name] = this;
            }
        } else {
            isc.builtinTypes[this.name] = this;
        }
        
        // If validOperators is set, register it with isc.DataSource
        if (this.validOperators != null) {
            isc.DataSource.setTypeOperators(this.name, this.validOperators);
        }
    }
});

// these are documented in setDefaultSummaryFunction
isc.SimpleType.setDefaultSummaryFunction("integer", "sum");
isc.SimpleType.setDefaultSummaryFunction("float", "sum");



isc.SimpleType.addProperties({
    //> @attr simpleType.groupingModes (ValueMap : null : IRW)
    // A set of key-value pairs that represent the names and titles of the grouping modes 
    // available to values of this type, for use in components that support grouping.
    // <P>
    // Some types provide a set of builtin groupingModes, as covered 
    // +link{group:builtinGroupingModes, here}.
    // <P>
    // Use +link{simpleType.getGroupValue()} and +link{simpleType.getGroupTitle()} to implement
    // custom grouping logic for each of the grouping modes you provide.
    // @getter simpleType.getGroupingModes()
    // @serverDS allowed
    // @visibility external
    //<

    //> @method simpleType.getGroupingModes()
    // Returns the set of +link{simpleType.groupingModes, grouping modes} available for values 
    // of this type in components that support grouping.
    // @return (ValueMap) the set of grouping modes available for this type
    // @visibility external
    //<

    //> @attr simpleType.defaultGroupingMode (String : null : IRW)
    // In components that support grouping, the default mode from the available 
    // +link{simpleType.groupingModes, groupingModes} to use when grouping values of this type.
    // @serverDS allowed
    // @visibility external
    //<

    //> @method simpleType.getGroupValue()
    // Returns a group value appropriate for the passed record, field and value, in the passed 
    // component.
    // 
    // @param value (Any) the record value to return a group value for
    // @param record (Record) the record containing the passed value
    // @param field (Object) the field relating to the value to be processed
    // @param fieldName (String) the name of the field relating to the value to be processed
    // @param component (Canvas) the component, usually a +link{class:ListGrid}, containing the
    //                           passed record
    // @return (Any) the group value for the passed parameters
    // @visibility external
    //<

    //> @method simpleType.getGroupTitle()
    // Returns a string value appropriate for the title of the group containing the passed
    // value.
    // 
    // @param value (Any) the record value to return a group title for
    // @param record (Record) the record containing the passed group value
    // @param field (Object) the field relating to the value to be processed
    // @param fieldName (String) the name of the field relating to the value to be processed
    // @param component (Canvas) the component, usually a +link{class:ListGrid}, containing the 
    //                           passed record
    // @return (String) the group title for the passed parameters
    // @visibility external
    //<

});

isc.SimpleType.getPrototype().toString = function () {
    return "[" + this.Class + " name=" + this.name + 
        (this.inheritsFrom ? " inheritsFrom=" + this.inheritsFrom : "") + "]";
};

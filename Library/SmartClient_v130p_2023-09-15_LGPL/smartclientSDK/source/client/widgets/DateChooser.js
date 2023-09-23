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




//>	@class	DateChooser
//
// Simple interactive calendar interface used to pick a date.
// Used by the +link{class:dateItem} class.
//
// @inheritsFrom VLayout
// @treeLocation Client Reference/Forms
// @visibility external
//<

// create a special canvas to show the days in a month
isc.ClassFactory.defineClass("DateChooser", "VLayout");

isc.DateChooser.addProperties({
    // set a default initial height to prevent the SGWT Showcase from stretching a standalone
    // DateChooser to full height of it's TabPane
    height: 1,
    overflow: "visible",

    // set inherentWidth, to prevent the DateChooser from filling it's parent layout - 
    // width: "100%" will still work
    inherentWidth: true,
    neverExpandWidth: true,

    // Header
    // ---------------------------------------------------------------------------------------

    //> @attr dateChooser.navigationLayout (AutoChild HLayout : null : IR)
    // An +link{AutoChild} +link{HLayout}, rendered above the +link{class:DateGrid, date grid},
    // and showing a number of widgets for navigating the DateChooser.  These include buttons 
    // for moving to the previous +link{dateChooser.previousYearButton, year} or 
    // +link{dateChooser.previousMonthButton, month}, the next 
    // +link{dateChooser.nextYearButton, year} or +link{dateChooser.nextMonthButton, month}, 
    // and for selecting a specific +link{dateChooser.yearChooserButton, year}, 
    // +link{dateChooser.monthChooserButton, month} or 
    // +link{dateChooser.weekChooserButton, week}.
    // @visibility external
    //<
    showNavigationLayout:true,
    navigationLayoutConstructor: "HLayout",
    navigationLayoutDefaults: {
        width: 1,
        height: 1,
        layoutAlign: "top",
        align: "center"
    },

    //> @attr DateChooser.closeOnDateClick (Boolean : null : IRW)
    // When editing a "date" value, with no time portion, clicking on a date-cell selects the 
    // date and closes the DateChooser.  When a +link{dateChooser.showTimeItem, time portion} 
    // is required, however, the +link{dateChooser.applyButton, apply button} must be clicked
    // to close the chooser, by default.
    // <P>
    // Set this attribute to true to have the DateChooser close when a user clicks in a 
    // date-cell, even if the +link{dateChooser.timeItem, timeItem} is showing.
    // @visibility external
    //< 
    
    //> @attr DateChooser.showFiscalYearChooser (Boolean : false : IRW)
    // When set to true, show a button that allows the calendar to be navigated by fiscal year.
    // @visibility external
    //< 
    showFiscalYearChooser: false,

    //> @attr dateChooser.fiscalYearChooserButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} which, 
    // when clicked, shows a picker for selecting a specific fiscal year.
    // @visibility external
    //<
    fiscalYearChooserButtonDefaults: {
        minWidth: 30,
        autoFit: true,
        click : function () {
            this.creator.showFiscalYearMenu();
        },
        autoParent: "navigationLayout",
        align: "center"
    },

    //> @attr DateChooser.showWeekChooser (Boolean : false : IRW)
    // When set to true, show a button that allows the calendar to be navigated by week or
    // fiscal week, depending on the value of +link{showFiscalYearChooser}.
    // 
    // @visibility external
    //< 
    showWeekChooser: false,

    //> @attr dateChooser.weekChooserButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} which shows
    // a picker for selecting a specific week of the year.  When +link{showFiscalYearChooser}
    // is true, the week number represents a fiscal week number, one offset from the start of 
    // the fiscal year.  Otherwise, it represents a week number offset from the start of the
    // calendar year.
    // 
    // @visibility external
    //<
    weekChooserButtonDefaults: {
        minWidth: 25,
        autoFit: true,
        click : function () {
            this.creator.showWeekMenu();
        },
        autoParent: "navigationLayout",
        align: "center"
    },

    //> @attr dateChooser.previousYearButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} that shifts
    // the calendar view backward by a year.
    // 
    // @visibility external
    //<
    previousYearButtonDefaults: {
        width: 20,
        click : function () {
            this.creator.showPrevYear();
        },
        autoParent: "navigationLayout",
        align: "center",
        noDoubleClicks: true
    },
    //> @attr dateChooser.previousYearButtonAriaLabel (String : "Previous year" : IR)
    // +link{statefulCanvas.ariaLabel,Aria label} for the +link{previousYearButton}.
    //
    // @group i18nMessages
    // @visibility external
    //<
    previousYearButtonAriaLabel:"Previous year",

    //> @attr dateChooser.previousMonthButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} that shifts
    // the calendar view backward by a month.
    // 
    // @visibility external
    //<
    previousMonthButtonDefaults: {
        width: 20,
        click : function () {
            this.creator.showPrevMonth();
        },
        autoParent: "navigationLayout",
        align: "center",
        noDoubleClicks: true
    },
    //> @attr dateChooser.previousMonthButtonAriaLabel (String : "Previous month" : IR)
    // +link{statefulCanvas.ariaLabel,Aria label} for the +link{previousMonthButton}.
    //
    // @group i18nMessages
    // @visibility external
    //<
    previousMonthButtonAriaLabel:"Previous month",

    //> @attr dateChooser.monthChooserButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} that shows 
    // a picker for selecting a specific month.
    // 
    // @visibility external
    //<
    monthChooserButtonDefaults: {
        click : function () {
            this.creator.showMonthMenu();
        },
        autoParent: "navigationLayout",
        align: "center"
    },

    //> @attr dateChooser.yearChooserButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} that shows 
    // a picker for selecting a specific calendar year.
    // 
    // @visibility external
    //<
    yearChooserButtonDefaults: {
        click : function () {
            this.creator.showYearMenu();
        },
        autoParent: "navigationLayout",
        align: "center"
    },
    
    //> @attr dateChooser.nextMonthButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} that shifts
    // the calendar view forward by a month.
    // 
    // @visibility external
    //<
    nextMonthButtonDefaults: {
        width: 20,
        click : function () {
            this.creator.showNextMonth();
        },
        autoParent: "navigationLayout",
        align: "center",
        noDoubleClicks: true
    },
    //> @attr dateChooser.nextMonthButtonAriaLabel (String : "Next month" : IR)
    // +link{statefulCanvas.ariaLabel,Aria label} for the +link{nextMonthButton}.
    //
    // @group i18nMessages
    // @visibility external
    //<
    nextMonthButtonAriaLabel:"Next month",

    //> @attr dateChooser.nextYearButton (AutoChild IButton : null : IR)
    // A button shown in the +link{dateChooser.navigationLayout, navigation layout} that shifts
    // the calendar view forward by a year.
    // 
    // @visibility external
    //<
    nextYearButtonDefaults: {
        width: 20,
        click : function () {
            this.creator.showNextYear();
        },
        autoParent: "navigationLayout",
        align: "center",
        noDoubleClicks: true
    },
    //> @attr dateChooser.nextYearButtonAriaLabel (String : "Next year" : IR)
    // +link{statefulCanvas.ariaLabel,Aria label} for the +link{nextYearButton}.
    //
    // @group i18nMessages
    // @visibility external
    //<
    nextYearButtonAriaLabel:"Next year",
    
    //> @attr dateChooser.buttonLayout (AutoChild HLayout : null : IR)
    // An +link{AutoChild} +link{HLayout}, rendered below the +link{class:DateGrid, date grid},
    // and showing the +link{dateChooser.todayButton, Today},
    // +link{dateChooser.cancelButton, Cancel} and, when working with "datetime" values, 
    // +link{dateChooser.applyButton, Apply} buttons. 
    // @visibility external
    //<
    buttonLayoutConstructor: "HLayout",
    buttonLayoutDefaults: {
        width: 1,
        height: 1,
        overflow: "visible",
        align: "center",
        defaultLayoutAlign:"center",
        extraSpace: 2
    },
    
    //> @attr dateChooser.dateGrid (AutoChild DateGrid : null : IR)
    // A +link{ListGrid} subclass, responsible for rendering the calendar view.
    // 
    // @visibility external
    //<
    dateGridDefaults: {
        _constructor: "DateGrid",
        layoutAlign: "top",
        dateClick : function (year, month, date) {
            this.creator.dateClick(year, month, date);
        },
        getSelectedDate : function () {
            return this.creator.chosenDate;
        },
        selectedWeekChanged : function (weekNum) {
            this.creator.updateWeekChooser();
        }
    },
    
    bottomButtonConstructor:"IButton",
    
    //> @attr dateChooser.todayButton (AutoChild IButton : null : IR)
    // A button shown below the +link{class:DateGrid, calendar grid} which, when clicked, 
    // navigates the calendar to today.
    // 
    // @visibility external
    //<
    todayButtonDefaults: {
        padding: 2,
        autoFit: true,
        //autoParent: "buttonLayout",
        click : function () {
            this.creator.todayClick();
        }
    },

    //> @attr dateChooser.cancelButton (AutoChild IButton : null : IR)
    // A button shown below the +link{class:DateGrid, calendar grid} which, when clicked, 
    // closes the DateChooser without selecting a value.
    // 
    // @visibility external
    //<
    cancelButtonDefaults: {
        padding: 2,
        autoFit: true,
        //autoParent: "buttonLayout",
        click : function () {
            this.creator.cancelClick();
        }
    },

    //> @attr dateChooser.applyButton (AutoChild IButton : null : IR)
    // When a DateChooser is configured for +link{dateChooser.timeItem, a "datetime" value},
    // clicking on a date cell in the +link{dateChooser.dateGrid, grid} will not automatically
    // dismiss the DateChooser canvas.  In this case, use the <code>Apply</code> button to
    // accept the selected date and time and dismiss the chooser.
    // 
    // @visibility external
    //<
    applyButtonDefaults: {
        padding: 2,
        autoFit: true,
        //autoParent: "buttonLayout",
        click : function () {
            this.creator.applyClick();
        }
    },

    //> @attr DateChooser.headerHeight (Integer : 20 : IR)
    // Height of the header area (containing the navigation buttons) in pixels.
    // @visibility external
    // @deprecated in favor of +link{dateChooser.navigationLayoutHeight}
    //<

    //> @attr DateChooser.navigationLayoutHeight (int : 20 : IR)
    // Height of the +link{dateChooser.navigationLayout, navigation area}, containing the 
    // various buttons for navigating the +link{dateChooser.dateGrid, calendar view}.
    // @visibility external
    //<
	navigationLayoutHeight:20,

    
	showYearButtons:true,
	showYearChooser:true,
	showMonthButtons:true,
	showMonthChooser:true,

    //> @attr DateChooser.skinImgDir (SCImgURL : "images/common/" : IRWA)
    // Overridden directory where images for this widget (such as the month and year button icons)
    // may be found.
    // @visibility external
    //<
	skinImgDir:"images/common/",

    //> @attr DateChooser.prevYearIcon (URL : "[SKIN]doubleArrow_left.gif" : IR)
    // Icon for the previous year button
    // @see attr:DateChooser.showDoubleYearIcon
    // @visibility external
    //<
    prevYearIcon:"[SKIN]doubleArrow_left.gif",

    //> @attr DateChooser.prevYearIconRTL (URL : null : IRW)
    // Icon for the previous year button if +link{isc.Page.isRTL()} is true.
    // If not set, and the page is in RTL mode, the +link{nextYearIcon} will be
    // used in place of the +link{prevYearIcon} and vice versa.
    // @see attr:DateChooser.showDoubleYearIcon
    // @visibility external
    //<

    //> @attr DateChooser.prevYearIconWidth (int : 14 : IR)
    // Width of the icon for the previous year button
    // @visibility external
    //<
    prevYearIconWidth:14,
    //> @attr DateChooser.prevYearIconHeight (int : 7 : IR)
    // Height of the icon for the previous year button
    // @visibility external
    //<
    prevYearIconHeight:7,
    
    //> @attr DateChooser.prevMonthIcon (URL : "[SKIN]arrow_left.gif" : IR)
    // Icon for the previous month button
    // @visibility external
    //<
    prevMonthIcon:"[SKIN]arrow_left.gif",
    
    //> @attr DateChooser.prevMonthIconRTL (URL : null : IR)
    // Icon for the previous month button if +link{isc.Page.isRTL()} is true.
    // If not set, and the page is in RTL mode, the +link{nextMonthIcon} will be
    // used in place of the +link{prevMonthIcon} and vice versa.
    // @visibility external
    //<
    
    //> @attr DateChooser.prevMonthIconWidth (int : 7 : IR)
    // Width of the icon for the previous month button
    // @visibility external
    //<
    prevMonthIconWidth:7,
    
    //> @attr DateChooser.prevMonthIconHeight (int : 7 : IR)
    // Height of the icon for the previous month button
    // @visibility external
    //<
    prevMonthIconHeight:7,
    
    //> @attr DateChooser.nextYearIcon (URL : "[SKIN]doubleArrow_right.gif" : IR)
    // Icon for the next year button
    // @see attr:DateChooser.showDoubleYearIcon
    // @visibility external
    //<
    nextYearIcon:"[SKIN]doubleArrow_right.gif",

    //> @attr DateChooser.nextYearIconRTL (URL : null : IR)
    // Icon for the next year button if +link{isc.Page.isRTL()} is true.
    // If not set, and the page is in RTL mode, the +link{nextYearIcon} will be
    // used in place of the +link{prevYearIcon} and vice versa.
    // @see attr:DateChooser.showDoubleYearIcon
    // @visibility external
    //<
    
    //> @attr DateChooser.nextYearIconWidth (int : 14 : IR)
    // Width of the icon for the next year button
    // @visibility external
    //<
    nextYearIconWidth:14,    
    
    //> @attr DateChooser.nextYearIconHeight (int : 7 : IRW)
    // Height of the icon for the next year button
    // @visibility external
    //<
    nextYearIconHeight:7,
    
    //> @attr DateChooser.nextMonthIcon (URL : "[SKIN]arrow_right.gif" : IRW)
    // Icon for the next month button
    // @visibility external
    //< 
    nextMonthIcon:"[SKIN]arrow_right.gif",
    
    //> @attr DateChooser.nextMonthIconRTL (URL : null : IRW)
    // Icon for the next month button
    // @visibility external
    //< 

    //> @attr DateChooser.nextMonthIconWidth (int : 7 : IRW)
    // Width of the icon for the next month button if +link{isc.Page.isRTL()} is true.
    // If not set, and the page is in RTL mode, the +link{nextMonthIcon} will be
    // used in place of the +link{prevMonthIcon} and vice versa.
    // @visibility external
    //<
    nextMonthIconWidth:7,
    
    //> @attr DateChooser.nextMonthIconHeight (int : 7 : IRW)
    // Height of the icon for the next month button
    // @visibility external
    //<
    nextMonthIconHeight:7,
    
    //> @attr DateChooser.showDoubleYearIcon (boolean : true : IRW)
    // If this property is set to true the previous and next year buttons will render out the 
    // previous and next month button icons twice rather than using the
    // +link{DateChooser.prevYearIcon} and +link{DateChooser.nextYearIcon}.
    // <P>
    // Set to <code>true</code> by default as not all skins contain media for the year icons.
    // @visibility external
    //<
    // This is really for back-compat (pre 6.1).
    // We intend to set this to true and provide year icon media in all skins we provide from this
    // point forward, but we don't want to break existing customized skins
    showDoubleYearIcon:true,

    // Pop-up Year & Month Pickers
    // ---------------------------------------------------------------------------------------
    
    //> @attr DateChooser.yearMenuStyle (CSSStyleName : "dateChooserYearMenu" : IR)
    // Style for the pop-up year menu.
    // @visibility external
    //<
    yearMenuStyle:"dateChooserYearMenu",

    //> @attr DateChooser.startYear (int : 2010 : IR)
    // Earliest year that may be selected.  If this chooser was opened by a 
    // +link{class:DateItem}, the default is inherited from +link{dateItem.startDate}.
    // Otherwise, the default is 10 years before today.
    // <P>
    // When opened from a +link{class:RelativeDateItem}, this property and 
    // +link{DateChooser.endYear} are defaulted to null, and the year-picker shows
    // years surrounding the current year, according to 
    // +link{DateChooser.startYearRange, startYearRange} and
    // +link{DateChooser.endYearRange, endYearRange}.
    // @visibility external
    //<
	startYear: (new Date().getFullYear() - 10),

    //> @attr DateChooser.endYear (int : 2025 : IR)
    // Latest year that may be selected.  If this chooser was opened by a 
    // +link{class:DateItem}, the default is inherited from +link{dateItem.endDate}.
    // Otherwise, the default is 5 years after today.
    // <P>
    // When opened from a +link{class:RelativeDateItem}, this property and 
    // +link{DateChooser.startYear} are defaulted to null, and the year-picker shows
    // years surrounding the current year, according to 
    // +link{DateChooser.startYearRange, startYearRange} and
    // +link{DateChooser.endYearRange, endYearRange}.
    // @visibility external
    //<
	endYear: (new Date().getFullYear() + 5),

    //> @attr DateChooser.startYearRange (Integer : 30 : IR)
    // When +link{dateChooser.startYear, startYear} is unset, this is the years before today 
    // that will be available for selection in the year menu.
    // @visibility external
    //<
    startYearRange: 30,
    
    //> @attr DateChooser.endYearRange (Integer : 10 : IR)
    // When +link{dateChooser.endYear, endYear} is unset, this is the years after today that 
    // will be available for selection in the year menu.
    // @visibility external
    //<
    endYearRange: 10,

    //> @attr DateChooser.monthMenuStyle (CSSStyleName : "dateChooserMonthMenu" : IR)
    // Style for the pop-up year menu.
    // @visibility external
    //<
    monthMenuStyle:"dateChooserMonthMenu",
    
    //> @attr DateChooser.weekMenuStyle (CSSStyleName : "dateChooserWeekMenu" : IR)
    // Style for the pop-up week menu.
    // @visibility external
    //<
    weekMenuStyle:"dateChooserWeekMenu",

    
    //> @attr dateChooser.buttonLayoutControls (Array of String : (see below) : IR)
    // Array of members to show in the +link{dateChooser.buttonLayout, buttonLayout}.
    // <P>
    // The default value of <code>buttonLayoutControls</code> is an Array of Strings listing 
    // the standard buttons in their default order:
    // <pre>
    //    buttonLayoutControls : ["todayButton", "cancelButton", "applyButton"]
    // </pre>
    // You can override <code>buttonLayoutControls</code> to change the order of the standard 
    // buttons.  You can also omit standard buttons this way, although it's more efficient to
    // use the related "show" property if available (eg +link{showTodayButton}).  
    // <P>
    // By embedding a Canvas directly in this list you can add arbitrary additional controls to
    // the buttonLayout.  
    // <P>
    // Note that having added controls to buttonLayoutControls, you can still call APIs directly on
    // those controls to change their appearance, and you can also show() and hide() them if
    // they should not be shown in some circumstances.
    // <P>
    // Tip: custom controls need to set layoutAlign:"center" to appear vertically centered.
    //
    // @visibility external
    //<
    buttonLayoutControls : [ "todayButton", "cancelButton", "applyButton" ],


    // Today / Cancel Buttons
    // ---------------------------------------------------------------------------------------
    
    //> @attr DateChooser.showTodayButton (Boolean : true : IRW)
    // Determines whether the "Today" button will be displayed, allowing the user to select 
    // the current date.
    // @visibility external
    //<
	showTodayButton:true,

    //> @attr DateChooser.showCancelButton (Boolean : false : IRW)
    // Determines whether the "Cancel" button will be displayed.
    // @visibility external
    //<    
	showCancelButton:null,
    
    //> @attr DateChooser.showApplyButton (Boolean : null : IRW)
    // Determines whether the +link{applyButton} will be displayed.
    // @visibility external
    //<    

    //> @attr DateChooser.todayButtonTitle  (String:"Today":IRW)
    // Title for "Today" button.
    // @group i18nMessages
    // @visibility external
    //<
    todayButtonTitle:"Today",
    
    //> @attr DateChooser.cancelButtonTitle  (String:"Cancel":IRW)
    // Title for the cancellation button.
    // @group i18nMessages
    // @visibility external
    //<
    cancelButtonTitle:"Cancel",
 
    //> @attr DateChooser.applyButtonTitle  (String:"Apply":IRW)
    // Title for the +link{dateChooser.applyButton, Apply} button.
    // @group i18nMessages
    // @visibility external
    //<
    applyButtonTitle:"Apply",

    //> @attr DateChooser.todayButtonHeight  (Integer :null:IRW)
    // If set specifies a fixed height for the Today and Cancel buttons.
    // @visibility external
    //<
    //todayButtonHeight:null,
    
    // Weekends   
    // ---------------------------------------------------------------------------------------

    //> @attr DateChooser.disableWeekends (Boolean : false : IR)
    // Whether it should be valid to pick a weekend day.  If set to true, weekend days appear
    // in disabled style and cannot be picked. 
    // <P>
    // Which days are considered weekends is controlled by +link{dateChooser.weekendDays} if
    // set or by +link{DateUtil.weekendDays} otherwise.
    //
    // @visibility external
    //<
    disableWeekends: false,
    
    //> @attr DateChooser.showWeekends (Boolean : true : IR)
    // Whether weekend days should be shown.  Which days are considered weekends is controlled 
    // by +link{dateChooser.weekendDays} if set or by +link{DateUtil.weekendDays} otherwise.
    //
    // @visibility external
    //<
    showWeekends: true,

    //> @attr DateChooser.styleWeekends (Boolean : true : IR)
    // Whether weekend days should be styled differently from weekdays.  If false, suppresses
    // the custom +link{dateChooser.baseWeekendStyle} and +link{dateChooser.weekendHeaderStyle},
    // instead using the +link{dateChooser.baseWeekdayStyle} and 
    // +link{dateChooser.weekendHeaderStyle}.
    //
    // @visibility external
    //<
    styleWeekends: true,

    //> @attr dateChooser.weekendDays (Array of int : null : IRW)
    // An array of integer day-numbers that should be considered to be weekend days by this
    // DateChooser instance.  If unset, defaults to the set of days indicated 
    // +link{dateUtil.weekendDays, globally}.
    //
    // @group visibility 
    // @visibility external
    //<
    getWeekendDays : function () {
        return this.weekendDays || isc.DateUtil.getWeekendDays();
    },

    
    //> @attr DateChooser.firstDayOfWeek  (int : 0 : IR)
    // Day of the week to show in the first column.  0=Sunday, 1=Monday, ..., 6=Saturday.  The
    // default value for this attribute is picked up from the current locale and can also be 
    // altered system-wide with the +link{DateUtil.setFirstDayOfWeek, global setter}.
    // 
    // @group i18nMessages, appearance
    // @visibility external
    //<
    
    firstDayOfWeek:0,

    // Initial value   
    // ---------------------------------------------------------------------------------------

	year: isc.DateUtil.getAsDisplayDate(new Date()).getFullYear(),		// full year number
	month: isc.DateUtil.getAsDisplayDate(new Date()).getMonth(),		// 0-11
	chosenDate: isc.DateUtil.getAsDisplayDate(new Date()),	// JS date object -- defaults to today
    
    // Day Buttons styling
    // ---------------------------------------------------------------------------------------

    //> @attr DateChooser.baseButtonStyle (CSSStyleName : "dateChooserButton" : IRW)
    // Base CSS style applied to this picker's buttons. Will have "Over", "Selected" and "Down"
    // suffix appended as the user interacts with buttons.
    // <P>
    // See +link{group:cellStyleSuffixes} for details on how stateful suffixes are combined with the
    // base style to generate stateful cell styles in Grids.
    //
    // @visibility external
    //< 
	baseButtonStyle:"dateChooserButton",

    //> @attr DateChooser.baseWeekdayStyle (CSSStyleName : "dateChooserWeekday" : IRW)
    // Base CSS style applied to weekdays. Will have "Over", "Selected" and "Down"
    // suffix appended as the user interacts with buttons.  Defaults to +link{baseButtonStyle}.
    // <P>
    // See +link{group:cellStyleSuffixes} for details on how stateful suffixes are combined with the
    // base style to generate stateful cell styles in Grids.
    // @visibility external
    //<
    baseWeekdayStyle: "dateChooserWeekday",

    //> @attr DateChooser.baseWeekendStyle (CSSStyleName : "dateChooserWeekend" : IRW)
    // Base CSS style applied to weekends. Will have "Over", "Selected" and "Down"
    // suffix appended as the user interacts with buttons.  Defaults to +link{baseWeekdayStyle}.
    // <P>
    // See +link{group:cellStyleSuffixes} for details on how stateful suffixes are combined with the
    // base style to generate stateful cell styles in Grids.
    // @visibility external
    //<
    baseWeekendStyle: "dateChooserWeekend",

    //> @attr DateChooser.baseFiscalYearStyle (CSSStyleName : "dateChooserFiscalYearCell" : IRW)
    // Base CSS style applied to cells in the +link{showFiscalYearChooser, fiscal year column}.
    // <P>
    // See +link{group:cellStyleSuffixes} for details on how stateful suffixes are combined with the
    // base style to generate stateful cell styles in Grids.
    // @visibility external
    //<
    baseFiscalYearStyle: "dateChooserFiscalYearCell",

    //> @attr DateChooser.fiscalYearHeaderStyle (CSSStyleName : null : IRW)
    // Base CSS style applied to the header of the 
    // +link{showFiscalYearChooser, fiscal year column} in the 
    // +link{dateChooser.dateGrid, calendar view}.
    // @visibility external
    //<

    //> @attr DateChooser.baseWeekStyle (CSSStyleName : "dateChooserWeekCell" : IRW)
    // Base CSS style applied to cells in the +link{showWeekChooser, fiscal week column}.
    // @visibility external
    //<
    baseWeekStyle: "dateChooserWeekCell",

    //> @attr DateChooser.weekHeaderStyle (CSSStyleName : null : IRW)
    // Base CSS style applied to the header of the 
    // +link{showWeekChooser, fiscal or calendar week column} in the
    // +link{dateChooser.dateGrid, calendar view}.
    // @visibility external
    //<

    //> @attr DateChooser.disabledDates (Array of Date : null : IRW)
    // An array of Date instances that should be disabled if they appear in the calendar view.
    // @visibility external
    //<

    //> @attr DateChooser.disabledWeekdayStyle (CSSStyleName : "dateChooserDisabledWeekday" : IRW)
    // Base CSS style applied to weekday dates which have been +link{disabledDates, disabled}.
    // @visibility external
    //<
    disabledWeekdayStyle: "dateChooserDisabledWeekday",

    //> @attr DateChooser.disabledWeekendStyle (CSSStyleName : "dateChooserDisabledWeekend" : IRW)
    // Base CSS style applied to weekend dates which have been +link{disabledDates, disabled}.
    // @visibility external
    //<
    disabledWeekendStyle: "dateChooserDisabledWeekend",

    //> @attr DateChooser.selectedWeekStyle (CSSStyleName : "dateChooserSelectedWeek" : IRW)
    // CSS style applied to the Fiscal Year and Week columns for the currently selected week 
    // (the one being displayed in the +link{dateChooser.showWeekChooser, week chooser}).
    // @visibility external
    //<
    selectedWeekStyle: "dateChooserSelectedWeek",

    //> @attr DateChooser.alternateWeekStyles (boolean:null:IRW)
    // Whether alternating weeks should be drawn in alternating styles. If enabled, the cell style
    // for alternate rows will have +link{alternateStyleSuffix} appended to it.
    // @visibility external
    //<    

    //> @attr DateChooser.alternateStyleSuffix (String:"Dark":IRW)
    // The text appended to the style name when using +link{alternateWeekStyles}.
    // @visibility external
    //<    
    alternateStyleSuffix:"Dark",
    
    //> @attr DateChooser.headerStyle (CSSStyleName : "dateChooserButtonDisabled" : IRW)
    // CSS style applied to the day-of-week headers. By default this applies to all days of the 
    // week. To apply a separate style to weekend headers, set 
    // +link{DateChooser.weekendHeaderStyle}
    // 
    // @visibility external
    //<    
	headerStyle:"dateChooserButtonDisabled",
    
    //> @attr DateChooser.weekendHeaderStyle (String:null:IRW)
    // Optional CSS style applied to the day-of-week headers for weekend days. If unset 
    // +link{DateChooser.headerStyle} will be applied to both weekdays and weekend days.
    // @visibility external
    //<    
	//weekendHeaderStyle:null,
    
    //> @attr DateChooser.baseNavButtonStyle (CSSStyleName : null : IRW)
    // CSS style to apply to navigation buttons and date display at the top of the
    // component. If null, the CSS style specified in +link{baseButtonStyle} is used.
    // @visibility external
    //< 
    
    //> @attr DateChooser.navButtonConstructor (SCClassName : IButton : IRA)
    // Constructor for navigation buttons at the top of the component.
    // @visibility external
    //<
    navButtonConstructor: "IButton",

    //> @attr DateChooser.baseBottomButtonStyle (CSSStyleName : null : IRW)
    // CSS style to apply to the buttons at the bottom of the DateChooser ("Today" and
    // "Cancel").  If null, the CSS style specified in +link{baseButtonStyle} is used.
    // @visibility external
    //< 


    
    useBackMask:true,
    
    canFocus:true,
    
    //> @attr DateChooser.useFirstDayOfFiscalWeek (Boolean : true : IRW)
    // When showing the +link{showFiscalYearChooser, fiscal year chooser}, should firstDayOfWeek
    // be defaulted to the same day as the fiscal start date?  If true and a fiscal year 
    // starts on a Tuesday, the calendar will display Tuesday to Monday from left to right.
    // @visibility external
    //< 
    useFirstDayOfFiscalWeek: true,

    //> @attr dateChooser.timeLayout (AutoChild HLayout : null : IR)
    // An +link{AutoChild} +link{HLayout}, rendered below the +link{class:DateGrid, date grid},
    // and showing the +link{dateChooser.timeItem, timeItem},
    // @visibility internal
    //<
    timeLayoutConstructor: "HLayout",
    timeLayoutDefaults: {
        width: 1,
        height: 1,
        overflow: "visible",
        // have this layout and it's children h-center
        layoutAlign: "center",
        align: "center",
        extraSpace: 1,
        autoDraw: false,
        visibility: "hidden"
    },
    timeFormDefaults: {
        _constructor: "DynamicForm",
        width: 1,
        overflow: "visible"
    },

    //> @attr dateChooser.closeOnEscapeKeypress (boolean : false : IR)
    // Should this dateChooser be dismissed if the user presses the Escape key?
    // @visibility external
    //<
    closeOnEscapeKeypress: false,

    //> @attr dateChooser.timeItem (AutoChild TimeItem : null : R)
    // +link{TimeItem} for editing the time portion of dates.  Visible by default for fields 
    // of type "datetime" and can be controlled by setting +link{dateChooser.showTimeItem}.
    // 
    // @visibility external
    //<
    
    //> @attr dateChooser.timeItemProperties (TimeItem Properties : null : IRA)
    // Custom properties to apply to the +link{dateChooser.timeItem,time field} used 
    // for editing the time portion of the date.
    // @visibility external
    //<
    
    //> @attr DateChooser.showTimeItem  (Boolean : null : IRW)
    // Whether to show the +link{dateChooser.timeItem, time field} for editing the time portion
    // of the date.  When unset, the time field is shown automatically if the field type is
    // "datetime".  Note that the item's +link{dateChooser.showSecondItem, second chooser} is 
    // not shown by default.
    // @visibility external
    //<
    timeItemDefaults: {
        name: "time", 
        editorType: "TimeItem", 
        useTextField: false,
        showTitle: false
    },

    //> @attr DateChooser.timeItemTitle  (String : "Time" : IRW)
    // Title for the +link{dateChooser.timeItem,time field}.
    // @group i18nMessages
    // @visibility external
    //<
    timeItemTitle: "Time",

    //> @attr DateChooser.use24HourTime (Boolean : true : IRW)
    // When showing the +link{showTimeItem, time field}, whether the 
    // +link{class:TimeItem, TimeItem} should be set to use 24-hour time.  The default is true.
    // @visibility external
    //< 
    use24HourTime: true,
    
    //> @attr DateChooser.fiscalYearFieldTitle  (String : "Year" : IRW)
    // Title for the +link{dateChooser.showFiscalYearChooser,fiscal year} field in the date grid.
    // @group i18nMessages
    // @visibility external
    //<
    fiscalYearFieldTitle: "Year",

    //> @attr DateChooser.weekFieldTitle  (String : "Wk" : IRW)
    // Title for the +link{dateChooser.showWeekChooser,week} field in the date grid.
    // @group i18nMessages
    // @visibility external
    //<
    weekFieldTitle: "Wk"

    //> @attr DateChooser.showSecondItem  (Boolean : null : IRW)
    // When showing the +link{dateChooser.timeItem, time field}, whether to show the "second" 
    // picker.  When unset, the second field is not shown.
    // @visibility external
    //<

});

//!>Deferred
isc.DateChooser.addMethods({
    init : function () {
        if (this.showFullScreen()) {
            // make the chooser fill space and clip overflow
            this.width = "100%";
            this.height = "100%";
            this.overflow = "hidden";
        }
        return this.Super("init", arguments);
    },
    
    initWidget : function () {
        // store local [month/shortMonth]Names arrays
        this.monthNames = isc.DateUtil.getMonthNames();
        this.shortMonthNames = isc.DateUtil.getShortMonthNames();
        if (this.showFiscalYearChooser && this.useFirstDayOfFiscalWeek) {
            var fDate = Date.getFiscalStartDate(isc.DateUtil.getAsDisplayDate(new Date()), this.getFiscalCalendar());
            this.firstDayOfWeek = fDate.getDay();
        }

        // let Cancel and Apply buttons be created, if their "show" attributes are unset
        // and the showTimeItem is true
        if (this.showCancelButton == null) this.showCancelButton = !!this.showTimeItem;
        if (this.showApplyButton == null) this.showApplyButton = !!this.showTimeItem;

        this.Super("initWidget", arguments);

        if (this.headerHeight != null) this.navigationLayoutHeight = this.headerHeight;
        
        // create the various child widgets and cache their widths
        this.makeNavigationLayout();

        this.makeTimeLayout();

        this.makeButtonLayout();

        this.makeDateGrid();

        // use the widest child as the minBreadthMember
        if (this._navigationLayoutWidth > this._buttonLayoutWidth) {
            if (this._dateGridWidth > this._navigationLayoutWidth) {
                this.minBreadthMember = this.dateGrid;
            } else {
                this.minBreadthMember = this.navigationLayout;
            }
        } else {
            if (this._dateGridWidth > this._buttonLayoutWidth) {
                this.minBreadthMember = this.dateGrid;
            } else {
                this.minBreadthMember = this.buttonLayout;
            }
        }
        
        this.addMember(this.navigationLayout);

        // if not showing full-screen, add the grid now - for full-screen, this is done at draw()
        if (!this.showFullScreen()) this.addMember(this.dateGrid);

        if (this.showTimeItem == true) {
            this.addMember(this.timeLayout);
            this.timeLayout.setWidth("100%");
            this.timeLayout.show();
        }

        if (!this.allButtonsHidden()) {
            // only show the buttonLayout if there are visible buttons
            this.addMember(this.buttonLayout);
            this.buttonLayout.setWidth("100%");
            this.buttonLayout.show();
        }

        if (this.chosenDate) {
            if (this.showTimeItem) {
                this.chosenTime = isc.DateUtil.getLogicalTimeOnly(this.chosenDate);
            }
            this.chosenDate = isc.DateUtil.getLogicalDateOnly(this.chosenDate);
            this.year = this.chosenDate.getFullYear();
            this.month = this.chosenDate.getMonth();
            this.day = this.chosenDate.getDate();
        }
    },

    makeTimeLayout : function () {
        var item = isc.addProperties({}, 
                { title: this.timeItemTitle, use24HourTime: this.use24HourTime,
                    showSecondItem: !!this.showSecondItem
                },
                this.timeItemDefaults, 
                this.timeItemProperties,
                { name: "time" }
        );
        this.timeForm = this.createAutoChild("timeForm", { top: -1000, autoDraw: false, items: [item] });
        this.timeLayout = this.createAutoChild("timeLayout", { top: -1000, autoDraw: false, members: [this.timeForm] });
        // render offscreen
        this.timeLayout.draw();
        this.timeLayout.show();
        // cache width and set minHeight
        this._timeLayoutWidth = this.timeForm.getVisibleWidth();
        this.timeLayout.minWidth = this._timeLayoutWidth;
        this.timeLayout.minHeight = this.timeForm.getVisibleHeight();
        // stretch the width
        this.timeLayout.clear();
        this.timeLayout.hide();
        this.timeLayout.setWidth("100%");
    },

    makeDateGrid : function () {
        var gridProps = { 
            // pass in the chosenDate
            chosenDate: this.chosenDate, 
            dayNameLength: this.dayNameLength,
            showFiscalYear: this.showFiscalYearChooser,
            fiscalYearFieldTitle: this.fiscalYearFieldTitle,
            showFiscalWeek: this.showFiscalYearChooser && this.showWeekChooser,
            showCalendarWeek: !this.showFiscalYearChooser && this.showWeekChooser,
            weekFieldTitle: this.weekFieldTitle,
            disabledDates: this.disabledDates,
            firstDayOfWeek: this.firstDayOfWeek,
            headerBaseStyle: this.headerStyle,
            weekendHeaderStyle: this.weekendHeaderStyle || this.headerStyle,
            baseFiscalYearStyle: this.baseFiscalYearStyle,
            fiscalYearHeaderStyle: this.fiscalYearHeaderStyle || this.baseFiscalYearStyle,
            baseWeekStyle: this.baseWeekStyle,
            weekHeaderStyle: this.weekHeaderStyle || this.baseWeekStyle,
            baseWeekdayStyle: this.baseWeekdayStyle || this.baseButtonStyle,
            baseWeekendStyle: this.baseWeekendStyle || this.baseWeekdayStyle || this.baseButtonStyle,
            alternateRecordStyles: this.alternateWeekStyles,
            disabledWeekdayStyle: this.disabledWeekdayStyle,
            disabledWeekendStyle: this.disabledWeekendStyle,
            selectedWeekStyle: this.selectedWeekStyle,
            fiscalCalendar: this.getFiscalCalendar(),
            showWeekends: this.showWeekends,
            styleWeekends: this.styleWeekends,
            disableWeekends: this.disableWeekends,
            weekendDays: this.getWeekendDays(),
            locatorParent: this,
            height: "*",
            startDate: this.getData(),
            top: -1000,
            autoDraw: false,
            align: "center"
        };
        this.dateGrid = this.createAutoChild("dateGrid", gridProps);
        this.dateGrid.draw();
        this.dateGrid.show();
        this._dateGridWidth = this.dateGrid.getVisibleWidth();
        this.dateGridHeight = this.dateGrid.getVisibleHeight();

        // set the minWidth/Height on the dateGrid to it's current size
        this.dateGrid.minWidth = this._dateGridWidth;
        this.dateGrid.minHeight = this.dateGridHeight;

        // set overflow:"hidden" on the grid
        this.dateGrid.setOverflow("hidden");

        // stretch the grid-width
        this.dateGrid.clear();
        this.dateGrid.setWidth("100%");
        this.dateGrid.setHeight("*");
    },
    
    makeNavigationLayout : function () {
        if (this.showNavigationLayout != false) {
            this.navigationLayout = this.createAutoChild("navigationLayout", { 
                top: -1000,
                autoDraw: false,
                width: 1, height: 1, overflow: "visible"
            }, this.navigationLayoutConstructor);

            var members = [];

            if (this.showFiscalYearChooser) {
                this.fiscalYearChooserButton = this.createAutoChild("fiscalYearChooserButton", {
                    baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),
                    title: this.chosenDate.getFiscalYear(this.getFiscalCalendar()).fiscalYear
                },
                this.navButtonConstructor);
                members.add(this.fiscalYearChooserButton);
            }

            if (this.showWeekChooser) {
                this.weekChooserButton = this.createAutoChild("weekChooserButton", {
                    baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),
                    title: this.showFiscalYearChooser ? 
                            this.chosenDate.getFiscalWeek(this.getFiscalCalendar()) : 
                            this.chosenDate.getWeek(this.firstDayOfWeek)
                },
                this.navButtonConstructor);
                members.add(this.weekChooserButton);
            }

            if (this.showYearButtons) {
                this.previousYearButton = this.createAutoChild("previousYearButton", {
                    baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),
                    title: this.getPreviousYearIconHTML(),
                    ariaLabel : this.previousYearButtonAriaLabel

                },
                this.navButtonConstructor);
                members.add(this.previousYearButton);
            }
            if (this.showMonthButtons != false) {
                this.previousMonthButton = this.createAutoChild("previousMonthButton", {
                    baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),           
                    title: this.getPreviousMonthIconHTML(),
                    ariaLabel : this.previousMonthButtonAriaLabel

                },
                this.navButtonConstructor);
                members.add(this.previousMonthButton);
            }
            if (this.showMonthChooser != false) {
                var width = this.monthChooserButtonDefaults.width,
                    minWidth = this.monthChooserButtonDefaults.minWidth,
                    autoWidth = this._getMonthChooserButtonWidth();
                this.monthChooserButton = this.createAutoChild("monthChooserButton", isc.addProperties({}, 
                    this.monthChooserButtonDefaults,
                    {
                        baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),           
                        title: this.chosenDate.getShortMonthName(),
                        width: width || autoWidth,
                        minWidth: minWidth || width || autoWidth
                    }, 
                    this.monthChooserButtonProperties),
                this.navButtonConstructor);
                members.add(this.monthChooserButton);
            }
            if (this.showYearChooser != false) {
                var width = this.yearChooserButtonDefaults.width,
                    minWidth = this.yearChooserButtonDefaults.minWidth,
                    autoWidth = this._getYearChooserButtonWidth();
                this.yearChooserButton = this.createAutoChild("yearChooserButton", isc.addProperties({},
                    this.yearChooserButtonDefaults,
                    {
                        baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),           
                        title: this.chosenDate.getFullYear(),
                        width: width || autoWidth,
                        minWidth: minWidth || width || autoWidth
                    },
                    this.yearChooserButtonProperties),
                this.navButtonConstructor);
                members.add(this.yearChooserButton);
            }
            if (this.showMonthButtons) {
                this.nextMonthButton = this.createAutoChild("nextMonthButton", {
                    baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),           
                    title: this.getNextMonthIconHTML(),
                    ariaLabel : this.nextMonthButtonAriaLabel
                },
                this.navButtonConstructor);
                members.add(this.nextMonthButton);
            }
            if (this.showYearButtons) {
                this.nextYearButton = this.createAutoChild("nextYearButton", {
                    baseStyle:(this.baseNavButtonStyle || this.baseButtonStyle),
                    title: this.getNextYearIconHTML(),
                    ariaLabel : this.nextYearButtonAriaLabel
                },
                this.navButtonConstructor);
                members.add(this.nextYearButton);
            }
            
            this.navigationLayout.addMembers(members);
            this.navigationLayout.draw();
            this.navigationLayout.show();

            // cache the visibleWidth
            this._navigationLayoutWidth = this.navigationLayout.getVisibleWidth();

            // cache the visibleHeight and set the minHeight
            this.navigationLayoutHeight = this.navigationLayout.getVisibleHeight();
            this.navigationLayout.minHeight = this.navigationLayoutHeight;
            this.navigationLayout.minWidth = this._navigationLayoutWidth;

            // stretch the width
            this.navigationLayout.clear();
            this.navigationLayout.setWidth("100%");
        }
    },
    
    showControlPropertyMap:{
        todayButton:"showTodayButton",
        cancelButton:"showCancelButton",
        applyButton:"showApplyButton"
    },
    _$body:"body", _$header:"header",
    allButtonsHidden : function () {
        return !this.showTodayButton && !this.showCancelButton && !this.showApplyButton;
    },
    shouldShowButtonLayoutControl : function (component) {
        var property = this.showControlPropertyMap[component];
        if (property == null) {
            this.showControlPropertyMap[component] = property =
                    "show" + component.substring(0,1).toUpperCase + component.substring(1);
        }
        return this[property] != false;
    },
    makeButtonLayout : function (props) {
        //if (this.allButtonsHidden()) return;

        var props = { baseStyle: this.baseBottomButtonStyle || this.baseButtonStyle };
        if (this.todayButtonHeight != null) props.height = this.todayButtonHeight;

        this.todayButtonDefaults.title = this.todayButtonTitle;
        if (props.height) this.todayButtonDefaults.height = props.height;

        this.cancelButtonDefaults.title = this.cancelButtonTitle;
        if (props.height) this.cancelButtonDefaults.height = props.height;
        
        this.applyButtonDefaults.title = this.applyButtonTitle;
        if (props.height) this.applyButtonDefaults.height = props.height;

        var members = [];

        for (var i = 0; i < this.buttonLayoutControls.length; i++) {
            var component = this.buttonLayoutControls[i],
                liveComponent = null
            ;

            // allow arbitrary canvii to be shoehorned into the grid.
            if (isc.isA.Canvas(component)) {
                liveComponent = component;

            } else if (isc.isA.String(component)) {
                //if (!this.shouldShowButtonLayoutControl(component)) continue;
                var visibility = "visible";
                if (!this.shouldShowButtonLayoutControl(component)) visibility = "hidden";
                // this is one of the builtin buttons
                liveComponent = this[component] = this.createAutoChild(component, 
                    isc.addProperties({}, props, { visibility: visibility}), this.bottomButtonConstructor);
                //liveComponent = this.addAutoChild(component, props, this.bottomButtonConstructor);
            }
            // Handle being passed anything you could pass to "addChild" (EG "autoChild:foo") by
            // explicitly calling 'createCanvas'.
            if (component != null && liveComponent == null) {
                liveComponent = this.createCanvas(component);
            }
            members.add(liveComponent);
        }

        this.buttonLayout = this.createAutoChild("buttonLayout", { 
            top: -1000,
            autoDraw: false,
            members: members
        }, this.buttonLayoutConstructor);
        this.buttonLayout.draw();
        this.buttonLayout.show();
        this._buttonLayoutWidth = this.buttonLayout.getVisibleWidth();
        this.buttonLayoutHeight = this.buttonLayout.getVisibleHeight();
        this.buttonLayout.minWidth = this._buttonLayoutWidth;
        this.buttonLayout.minHeight = this.buttonLayoutHeight;
        this.buttonLayout.clear();
        this.buttonLayout.hide();
        //this.buttonLayout.width = "100%";
    },

    getUsedHeight : function () {
        var usedHeight = 10;
        if (this.navigationLayout && this.navigationLayout.isVisible()) {
            usedHeight += this.navigationLayout.getVisibleHeight();
        }
        if (this.showTimeItem) {
            usedHeight += this._timeLayoutHeight;
        }
        usedHeight += this._buttonLayoutHeight;

        // include the size of the top and bottom borders
        var pxOffset = (this.border || "").indexOf("px");
        if (pxOffset >= 0) {
            var borderSize = parseInt(this.border.substring(0, pxOffset+1));
            usedHeight += (borderSize * 2);
        }
        return usedHeight;
    },
    draw : function () {
        this.Super("draw", arguments);

        if (this.dateGrid && !this.hasMember(this.dateGrid)) {
            this.dateGrid.clear();
            if (this.showFullScreen()) {
                this.dateGrid.setOverflow("hidden");
                this.dateGrid.setHeight("*")
            }
            this.addMember(this.dateGrid, 1);
        }

        this.updateUI();
    },

    getTimeItem : function () {
        if (this.showTimeItem) return this.timeForm.getItem(0);
    },
    recreateTimeItem : function (value) {
        var item = isc.addProperties({}, { title: this.timeItemTitle, 
                    use24HourTime: this.use24HourTime, showSecondItem: !!this.showSecondItem },
                this.timeItemDefaults, 
                this.timeItemProperties,
                { value: value }
        );
        this.timeForm.setItems([item]);
    },

    resized : function () {
        // if the chooser was just resized, call placeNear() to make sure it remains on-screen
        // - placeNear() will no-op if there's nothing to do
        this.placeNear(this.getPageLeft(), this.getPageTop());
    },

    handleKeyPress : function () {
        var returnVal = this.Super("handleKeyPress", arguments);
        if (returnVal != false) {
            if ((this.closeOnEscapeKeypress) && ("Escape" == isc.EH.getKey())) {
                this.cancelClick();
            }
        }
    },

    getPreviousYearIconHTML : function () {
        var prevYearIconHTML,
            displayDate = new Date(this.year, this.month, 1),
            disableNextYear = displayDate.getFullYear() == 9999
        ;
        if (this.showDoubleYearIcon) {
            var monthIconHTML = this.getPreviousMonthIconHTML();
            prevYearIconHTML = disableNextYear ? "&nbsp;" :
                   "<NOBR>"+ monthIconHTML + monthIconHTML + "<\/NOBR>";
        } else {
            var icon = this.isRTL() ? 
                    this.prevYearIconRTL || this.nextYearIcon : this.prevYearIcon;
            prevYearIconHTML = disableNextYear ? "&nbsp;" :
                        this.imgHTML(icon, this.prevYearIconWidth,
                                         this.prevYearIconHeight);
        }

        return prevYearIconHTML;
    },
    
    getPreviousMonthIconHTML : function () {
        var icon = this.isRTL() ? 
                this.prevMonthIconRTL || this.nextMonthIcon : this.prevMonthIcon,
            monthIconHTML = this.imgHTML(icon, this.prevMonthIconWidth,
                                                 this.prevMonthIconHeight);
        return monthIconHTML;
    },

    getNextMonthIconHTML : function () {
        var icon = this.isRTL() ? 
                this.nextMonthIconRTL || this.prevMonthIcon : this.nextMonthIcon,
            monthIconHTML = this.imgHTML(icon, this.nextMonthIconWidth,
                                                 this.nextMonthIconHeight);
        return monthIconHTML;
    },

    getNextYearIconHTML : function () {
        var nextYearIconHTML,
            displayDate = new Date(this.year, this.month, 1),
            disableNextYear = displayDate.getFullYear() == 9999
        ;
        if (this.showDoubleYearIcon) {
            var monthIconHTML = this.getNextMonthIconHTML();
            nextYearIconHTML = disableNextYear ? "&nbsp;" :
                               "<NOBR>"+ monthIconHTML + monthIconHTML + "<\/NOBR>";
        } else {
            var icon = this.isRTL() ? 
                    this.nextYearIconRTL || this.prevYearIcon : this.nextYearIcon;
            nextYearIconHTML = disableNextYear ? "&nbsp;" :
                                    this.imgHTML(icon,
                                                 this.nextYearIconWidth,
                                                 this.nextYearIconHeight);
        }
        
        return nextYearIconHTML;
    },

    // Override show() to show the clickMask if autoClose is true
    // Note: If we're showing this date chooser in a separate window, this is unnecessary, as the
    // user will be unable to click on any part of the window that isn't covered by the date-chooser
    // but will do no harm.
    show : function () {
        var returnVal = this.Super("show", arguments);
        
        
        if (this.autoClose) {                
            // pass this dateChooser as an unmasked widget to showClickMask because
            // when the dateChooser is shown from a modal window, the dateChooser
            // ends up being masked by its own clickmask for some unknown reason.
			this.showClickMask(this.getID()+".close();", true, this);        	        	        	
        	this.bringToFront();
        }
    },
    
    // picker interface

    //> @method DateChooser.setData()
    // Set the picker to show the given date.
    // 
    // @param date (Date) new value
    // @visibility external
    //<
    setData : function (data, autoShowTimeItem) {
        if (!isc.isA.Date(data)) data = new Date();

        var type = "datetime";
        if (this.callingFormItem) {
            type = this.callingFormItem.getType();
        }

        var dateOnly = isc.DateUtil.getLogicalDateOnly(data),
            timeOnly = isc.DateUtil.getLogicalTimeOnly(data)
        ;

        this.year = dateOnly.getFullYear();
        this.month = dateOnly.getMonth();
        this.day = dateOnly.getDate(); 

        this.chosenDate = dateOnly;
        this.chosenTime = timeOnly;

        if (autoShowTimeItem) {
            // if autoShowTimeItem is true, always show the timeItem for non-logicalDate data
            if (data.logicalDate || !isc.SimpleType.inheritsFrom(type, "datetime")) this.showTimeItem = false;
            else this.showTimeItem = true;
        }
        // set the timeItem's value, if it's there
        var timeItem = this.getTimeItem();
        if (timeItem) timeItem.setValue(this.chosenTime);

        this.updateUI();
    },

    updateGridData : function (weekNum) {
        if (!this.dateGrid) return;

        var date = isc.DateUtil.createLogicalDate(this.year, this.month, 1);

        var fy = isc.DateUtil._getFiscalYearObjectForDate(date),
            fiscalStart = fy.startDate
        ;

        this.dateGrid.showWeekends = this.showWeekends;

        this.dateGrid.showFiscalYear = this.showFiscalYearChooser;
        this.dateGrid.showFiscalWeek = this.showFiscalYearChooser && this.showWeekChooser;
        this.dateGrid.showCalendarWeek = !this.showFiscalYearChooser && this.showWeekChooser;

        if (this.showFiscalYearChooser) {
            if (this.useFirstDayOfFiscalWeek) {
                // if using fiscal startDate.getDay() as firstDayOfWeek, we need to use the
                // fiscalYear in which the startDate exists, not the one in which the start of
                // the month exists
                //var nfy = isc.DateUtil.getFiscalYear(fy.fiscalYear + 1);
                var nfy = isc.DateUtil.getFiscalYear(fy.fiscalYear);
                if (nfy.year < fy.fiscalYear) {
                    nfy = isc.DateUtil.getFiscalYear(nfy.fiscalYear + 1);
                }
                this.dateGrid.firstDayOfWeek = this.firstDayOfWeek = nfy.startDate.getDay();
            }
        }
        // pass the new year and month, and the chosenDate, to grid.refreshUI() - this will
        // call setChosenDate() if the passed chosenDate has changed since the last run, or
        // showMonth() otherwise, if year/month have changed
        // also pass on the weekNum param, which is passed to this method by a cellClick
        // on the weekMenu, via updateUI(), and used by DateGrid to select the week the 
        // user chose, rather than the first visible week
        this.dateGrid.refreshUI(this.year, this.month, this.chosenDate, weekNum);
    },

    //> @method DateChooser.getData()
    // Get the current value of the picker.
    // <P>
    // See +link{dataChanged()} for how to respond to the user picking a date.
    //
    // @return (Date) current date
    // @visibility external
    //<
    
    getData : function () {
        var date = this.chosenDate.duplicate();
        if (this.showTimeItem) {
            date = isc.DateUtil.combineLogicalDateAndTime(date, this.chosenTime);
        }
        return date;
    },
    
    redraw : function () {
        this.Super("redraw", arguments);
        this.updateUI();
    },
	
	//> @attr DateChooser.dayNameLength (number : 2 : IR)
	// How long (how many characters) should be day names be. May be 1, 2 or 3 characters.
	// @visibility external
	//<
	dayNameLength:2,

    getDayNames : function () {
        if (isc.DateChooser._dayNames == null) {
            // Don't hard-code day-names -- we need them to be localizeable
            // isc.DateChooser._dayNames = ["Su", "Mo","Tu", "We", "Th", "Fr", "Sa"]
            // Support 1, 2 or 3 chars
            isc.DateChooser._dayNames = [isc.DateUtil.getShortDayNames(1),
                                         isc.DateUtil.getShortDayNames(2),
                                         isc.DateUtil.getShortDayNames(3)];
        }
        return isc.DateChooser._dayNames[this.dayNameLength-1];
    },

	getDayCellButtonHTML : function (date, style, state) {
        // null date == Special case for dates beyond 9999
        // This limit is enforced due to dates greater than 9999 causing a browser crash in IE
        // - also our parsing logic assumes a 4 digit date
        if (date == null) 
            return this.getCellButtonHTML("&nbsp;", null, style, false, false, isc.Canvas.CENTER);
        
        
		var selected = this.chosenDate && 
                       (isc.DateUtil.compareLogicalDates(date,this.chosenDate) == 0),
            disabled = (date.getMonth() != this.month);

		var partEvent = "dateFromId",
            id = date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate();

        // check for weekends
        if (this.disableWeekends && this.getWeekendDays().contains(date.getDay())) {
            disabled = true;
            partEvent = null;
        }           
		return this.getCellButtonHTML(date.getDate(), style, selected, disabled, 
                                      isc.Canvas.CENTER, null, partEvent, id);
	},

    dateIsSelected : function (date) {
		return null
	},
    
	showPrevMonth : function () {
		if (--this.month == -1) {
			this.month = 11;
			this.year--;
		}
		this.updateUI();
	},

	showNextMonth : function () {
		if (++this.month == 12) {
			this.month = 0;
			this.year++;
		}
        this.updateUI();
    },
    
    updateHeader : function (weekNum, date) {
        if (!this.showNavigationLayout && this.navigationLayout) {
            this.navigationLayout.hide();
        } else if (this.showNavigationLayout) {
            // construct a logical date from the stored parts, if no date passed
            date = date || isc.DateUtil.createLogicalDate(this.year, this.month, this.day);

            if (!this.navigationLayout.isVisible()) this.navigationLayout.show();

            var members = this.navigationLayout.members;
            if (this.showWeekChooser) {
                // get the weekNum from the dateGrid, where it might be defaulted to the first
                // week, if not selecting a specific week
                this.updateWeekChooser();

                if (!this.weekChooserButton.isVisible()) this.weekChooserButton.show();
            } else if (this.weekChooserButton) {
                if (this.weekChooserButton.isVisible()) this.weekChooserButton.hide();
            }

            if (this.showFiscalYearChooser) {
                this.fiscalYearChooserButton.setTitle("" + date.getFiscalYear(this.getFiscalCalendar()).fiscalYear);
                if (!this.fiscalYearChooserButton.isVisible()) this.fiscalYearChooserButton.show();
            } else if (this.fiscalYearChooserButton) {
                if (this.fiscalYearChooserButton.isVisible()) this.fiscalYearChooserButton.hide();
            }

            if (this.showFullMonthInHeader) {
                this.monthChooserButton.setTitle(this.monthNames[this.month]);
            } else {
                this.monthChooserButton.setTitle(this.shortMonthNames[this.month]);
            }

            this.yearChooserButton.setTitle("" + this.getHeaderYearTitle(this.year));
            this.yearChooserButton.redraw();

            var isFirstYear = this.startYear && this.startYear == this.year,
                isLastYear = this.endYear && this.endYear == this.year
            ;
            this.previousYearButton.setDisabled(isFirstYear);
            this.previousMonthButton.setDisabled(isFirstYear && this.month == 0);
            this.nextMonthButton.setDisabled(isLastYear && this.month == 11);
            this.nextYearButton.setDisabled(isLastYear);
        }
    },
    showFullScreen : function () {
        return isc.Browser.isHandset;
    },

    updateUI : function (weekNum) {
        // update month/year button titles
        var date = new Date(this.year, this.month, this.day);

        if (date.getMonth() > this.month) date = isc.DateUtil.getEndOf(new Date(this.year, this.month, 1), "M", true);

        if (!this.showTimeItem) {
            if (this.members.contains(this.timeLayout)) {
                this.removeMember(this.timeLayout);
                this.timeLayout.clear();
            }
        } else if (this.showTimeItem) {
            this.recreateTimeItem(this.chosenTime);
            this.addMember(this.timeLayout, this.members.length-1);
            this.timeLayout.show();
        }

        this.updateButtonLayout();

        this.updateGridData(weekNum);
        this.updateHeader();
	},

    updateButtonLayout : function () {
        if (this.todayButton) {
            if (this.showTodayButton) {
                if (!this.todayButton.isVisible()) this.todayButton.visibility = "visible";
                this.todayButton.show();
            } else if (this.todayButton.isVisible()) {
                this.todayButton.hide();
            }
        }
        if (this.cancelButton) {
            if (this.showCancelButton) {
                if (!this.cancelButton.isVisible()) this.cancelButton.visibility = "visible";
                this.cancelButton.show();
            } else if (this.cancelButton.isVisible()) {
                this.cancelButton.hide();
            }
        }
        if (this.applyButton) {
            if (this.showApplyButton) {
                if (!this.applyButton.isVisible()) this.applyButton.visibility = "visible";
                this.applyButton.show();
            } else if (this.applyButton.isVisible()) {
                this.applyButton.hide();
            }
        }

        if (this.buttonLayout) {
            if (this.allButtonsHidden()) this.buttonLayout.hide();
            else {
                if (!this.buttonLayout.isVisible()) this.buttonLayout.show();

                // hide the border, it's above the timeLayout
                if (this.showTimeItem) this.buttonLayout.setBorder("0px");
                // clear the border, so it falls back to the skin CSS
                else this.buttonLayout.setBorder(null);
            }
         }
    },
    
    updateWeekChooser : function () {
        if (this.weekChooserButton) {
            this.weekChooserButton.setTitle("" + (this.dateGrid && this.dateGrid.getSelectedWeek()));
        }
    },

	showMonth : function (monthNum) {
		this.month = monthNum;
		if (this.monthMenu) this.monthMenu.hide();
        this.bringToFront();
        this.updateUI();
	},


    //> @method DateChooser.getFiscalCalendar()
    // Returns the +link{FiscalCalendar} object that will be used by this DateChooser.
    //
    // @return (FiscalCalendar) the fiscal calendar for this chooser, if set, or the global
    //            one otherwise
    // @visibility external
    //<
    getFiscalCalendar : function () {
        return this.fiscalCalendar || isc.DateUtil.getFiscalCalendar();
    },

    //> @method DateChooser.setFiscalCalendar()
    // Sets the +link{FiscalCalendar} object that will be used by this DateChooser.  If unset,
    // the +link{DateUtil.getFiscalCalendar, global fiscal calendar} is used.
    //
    // @param [fiscalCalendar] (FiscalCalendar) the fiscal calendar for this chooser
    // @visibility external
    //<
    setFiscalCalendar : function (fiscalCalendar) {
        this.fiscalCalendar = fiscalCalendar;
    },
    
	showWeek : function (weekNum) {   
        var date;
        if (this.showFiscalYearChooser) {
            var displayDate = isc.DateUtil.createLogicalDate(this.year, this.month, 
                                                             this.chosenDate.getDate());
            var cal = this.getFiscalCalendar(),
                fiscalStart = Date.getFiscalStartDate(displayDate)
            ;
            date = new Date(fiscalStart.getFullYear(), cal.defaultMonth, cal.defaultDate + (7 * weekNum))
        } else {
            date = new Date(this.year, 0, 1 + (7 * weekNum));
        }

        this.year = date.getFullYear();
        this.month = date.getMonth();
		if (this.weekMenu) this.weekMenu.hide();
        this.bringToFront();
        this.updateUI(weekNum);
	},

    monthMenuFormat: "MMM",
    getMonthText : function (date) {
        // third param here is "customTimezone" - pass false to prevent the passed logical-date 
        // from being potentially altered in situations where the browser timezone vs display
        // timezone is larger than 12 hours
        var result = isc.DateUtil.format(date, this.monthMenuFormat, false);
        return result;
    },
    
    _getMonthChooserTitles : function () {
        var date = isc.Date.createLogicalDate(2001,0,1);
        var arr = [];
        for (var i = 0; i < 12; i++) {
            date.setMonth(i);
            arr.add(this.getMonthText(date));
        }
        return arr;
    },
    _getMonthChooserButtonWidth : function () {
        var arr = this._getMonthChooserTitles(),
            style = (this.baseNavButtonStyle || this.baseButtonStyle) + "Over",
            extraWidth = isc.Element._getHBorderPad(style) * 2,
            maxWidth = isc.Canvas.measureContent("<span style='white-space:nowrap'>"
                         + arr.join("<br>") + "</span>", style) + extraWidth
        ;
        this._monthChooserButtonWidth =  maxWidth;
        return this._monthChooserButtonWidth;
    },
    
    _getYearChooserButtonWidth : function () {
        var arr = [];
        var start = this.startYear || (this.year - this.startYearRange),
            end = this.endYear || (this.year + this.endYearRange)

        for (var i = start; i <= end; i++) {
            arr.add("" + this.getYearTitle(i));
        }
        var style = (this.baseNavButtonStyle || this.baseButtonStyle) + "Over",
            extraWidth = isc.Element._getHBorderPad(style) * 2,
            maxWidth = isc.Canvas.measureContent(arr.join("<br>"), style) + extraWidth
        ;
        this._yearChooserButtonWidth = maxWidth;
        return this._yearChooserButtonWidth;
    },

    // Menus (monthMenu, dayMenu, yearMenu)

    
    useButtonTable:false,
    shouldUseButtonTable : function () {
        if (this.useButtonTable != null) return this.useButtonTable;
        // We really want keyboard focus in screenReader mode
        return !isc.screenReader;
    },

    monthMenuConstructor:"DateChooserMenuGrid",
    monthMenuDefaults:{
        cellClick : function (record, rowNum, colNum) {
            if (!record) return;
            this.creator.showMonth(record.eventId);
        }
    },

	showMonthMenu : function () {
		if (!this.monthMenu) {
            // create the menu items using the date.getShortMonthName() for internationalization
            var monthItems = [],
                date = isc.DateUtil.createLogicalDate(2001,0,1);
            for (var i = 0; i < 12; i++) {
                if ((i)%3 == 0) monthItems.add([]);
                date.setMonth(i);
                monthItems[monthItems.length-1].add(
                                    {	contents:this.getMonthText(date),
                                        eventPart: "showMonth",
                                        eventId: i
                                    }
                );
            }
            var monthMenuConfig = {
                styleName:this.monthMenuStyle,
                left:this.monthChooserButton.getPageLeft()+5,
                top:this.getPageTop()+this.navigationLayoutHeight,
                width:Math.min(this.getVisibleWidth(), 120),
                height:Math.min(this.getVisibleHeight()-this.navigationLayoutHeight, 80),
                items:monthItems,
                visibility:isc.Canvas.HIDDEN,
                baseButtonStyle:this.baseButtonStyle,
                dateChooser: this
            };
            if (this.shouldUseButtonTable()) {
                this.monthMenu = isc.MonthChooser.newInstance(monthMenuConfig);
            } else {
                this.monthMenu = this.createAutoChild("monthMenu", monthMenuConfig)
            }
            // (autoDraw is true, so it is drawn, with visibility hidden at this point)
            var left = this.monthChooserButton.getPageLeft() - 
                        ((this.monthMenu.getWidth() - this.monthChooserButton.getWidth()) /2);
            this.monthMenu.placeNear(Math.max(left, 0));
		} else {
            // L, T, W, H
            var top = this.getPageTop()+this.navigationLayoutHeight,
				width = Math.min(this.getVisibleWidth(), 120),
				height = Math.min(this.getVisibleHeight()-this.navigationLayoutHeight, 80),
                buttonWidth = this.monthChooserButton.getWidth(),
                left = this.monthChooserButton.getPageLeft() - ((width - buttonWidth)/2)
            ;
            this.monthMenu.resizeTo(width, height);
            this.monthMenu.placeNear(Math.max(left, 0), top);
        }
        
        // We show the month menu modally.  This means if the user clicks outside it, we
        // will not allow the click to carry on down, so it will hide the month menu (and then
        // dismiss the monthMenu's click mask), but won't fire the click action on the 
        // DateChooser's click mask and hide the entire date chooser.
        // As with all modal clickMasks, for us to float the month menu above it, we need the
        // month menu to be a top-level element (which is how it's currently implemented)
		this.monthMenu.showModal();
	},

    weekMenuConstructor:"DateChooserMenuGrid",
    weekMenuDefaults:{
        cellClick : function (record, rowNum, colNum) {
            if (!record) return;
            this.creator.showWeek(record.eventId);
        }
    },

	showWeekMenu : function () {
		if (!this.weekMenu) {
            // create the menu items using the date.getShortMonthName() for internationalization
            var weekItems = [[]],
                date = isc.DateUtil.createLogicalDate(2001,0,1);
            for (var i = 1; i < 53; i++) {
                weekItems[weekItems.length-1].add(
                                    {	contents:"" + i,
                                        eventPart: "showWeek",
                                        eventId: i
                                    }
                    );
                if ((i)%7 == 0) weekItems.add([]);
            }
            
            var weekMenuConfig = {
                styleName:this.weekMenuStyle,
                left:this.weekChooserButton.getPageLeft()+5,
                top:this.getPageTop()+this.navigationLayoutHeight,
                width:Math.min(this.getVisibleWidth(), 120),
                height:Math.min(this.getVisibleHeight()-this.navigationLayoutHeight, 80),
                items:weekItems,
                visibility:isc.Canvas.HIDDEN,
                baseButtonStyle:this.baseButtonStyle,
                dateChooser: this
            };

            if (this.shouldUseButtonTable()) {
                this.weekMenu = isc.WeekChooser.newInstance(weekMenuConfig);
            } else {
                this.weekMenu = this.createAutoChild("weekMenu", weekMenuConfig)
            }
            

            // (autoDraw is true, so it is drawn, with visibility hidden at this point)
            var left = this.weekChooserButton.getPageLeft() - 
                        ((this.weekMenu.getWidth() - this.weekChooserButton.getWidth()) /2);
            this.weekMenu.setPageLeft(Math.max(left, 0));

		} else {
            // L, T, W, H
            var top = this.getPageTop()+this.navigationLayoutHeight,
				width = Math.min(this.getVisibleWidth(), 120),
				height = Math.min(this.getVisibleHeight()-this.navigationLayoutHeight, 80),
                buttonWidth = this.weekChooserButton.getWidth(),
                left = this.weekChooserButton.getPageLeft() - ((width - buttonWidth)/2)
            ;
            this.weekMenu.setPageRect(Math.max(left, 0), top, width, height);
        }
        
		this.weekMenu.showModal();
	},

	showPrevYear : function () {
		this.year--;
        this.updateUI();
	},

	showNextYear : function () {
        if (!this.endYear || this.year < this.endYear) {
		    this.year++;
            this.updateUI();
        }
	},

	showYear : function (yearNum) {
        if ((this.startYear && yearNum < this.startYear) || 
            (this.endYear && yearNum > this.endYear)) return;
		this.year = yearNum;
		if (this.yearMenu) this.yearMenu.hide();
        this.updateUI();
	},

	showFiscalYear : function (yearNum) {
        var f = isc.DateUtil.getFiscalYear(yearNum, this.getFiscalCalendar());

		this.year = f.year;
        this.month = f.month;    
		if (this.yearMenu) this.yearMenu.hide();
        this.updateUI();
	},

    showFiscalYearMenu : function () {
        this.showYearMenu(true);
    },

    yearMenuConstructor:"DateChooserMenuGrid",
    yearMenuDefaults:{
        cellClick : function (record, rowNum, colNum) {
            if (!record) return;
            if (this.fiscal) {
                this.creator.showFiscalYear(record.eventId);
            } else {
                this.creator.showYear(record.eventId);
            }
        }
    },

    
	showYearMenu : function (fiscal) {
        var component = !fiscal ? this.yearChooserButton : this.fiscalYearChooserButton;
    
        var start = this.startYear || (this.year - this.startYearRange),
            end = this.endYear || (this.year + this.endYearRange),
            yearDiff = (end - start)
        ;

        // get a colCount appropriate for the yearDiff
        var colCount = Math.round(Math.sqrt(yearDiff));

        var yearItems = [];
        for (var i = 0; i <= (end-start); i++) {
            if ((i)%colCount == 0) yearItems.add([]);
            var year = i+start;
            yearItems[yearItems.length-1].add({
                contents: this.getYearTitle(year),
                eventPart: "showYear",
                eventId: year
            });
        }

        if (!this.yearMenu) {
            var yearMenuConfig = {
                styleName:this.yearMenuStyle,
                top:this.getPageTop()+this.navigationLayoutHeight,
                width:Math.min(this.getVisibleWidth(), (40*colCount)),
                height:Math.min(this.getVisibleHeight()-this.navigationLayoutHeight, 80),
                items:yearItems,
                visibility:isc.Canvas.HIDDEN,
                baseButtonStyle:this.baseButtonStyle,
                dateChooser: this
            };
            if (this.shouldUseButtonTable()) {
                this.yearMenu = isc.YearChooser.newInstance(yearMenuConfig);
            } else {
                this.yearMenu = this.createAutoChild("yearMenu", yearMenuConfig);
            }
            // (autoDraw is true, so it is drawn, with visibility hidden at this point)
            //this.yearMenu.setPageLeft(this.getPageLeft() + ((this.width - this.yearMenu.width)/2));
            var left = component.getPageLeft() - ((this.yearMenu.getWidth() - component.getWidth()) /2);
            this.yearMenu.placeNear(Math.max(left, 0));

		} else {
            // L, T, W, H
            var top = this.getPageTop()+this.navigationLayoutHeight,
				width = Math.min(this.getVisibleWidth(), (40*colCount)),
				height = Math.min(this.getVisibleHeight()-this.navigationLayoutHeight, 80),
                buttonWidth = component.getWidth(),
                left = component.getPageLeft() - ((width - buttonWidth)/2)
            ;

            this.yearMenu.setItems(yearItems);
            this.yearMenu.resizeTo(width, height);
            this.yearMenu.placeNear(Math.max(left, 0), top);
        }
        // fiscal attribute checked in click handler
        this.yearMenu.fiscal = fiscal;
        
        // Now that we have getYearTitle(), yearItems might have changed since last time we 
        // displayed the yearMenu.  So redraw it to be sure
        this.yearMenu.markForRedraw("Redraw to pick up any changes in yearItems");

		//XXX it'd be nice to hilite the current year somehow...
		this.yearMenu.showModal();
	},
    
    //> @method DateChooser.getYearTitle()
    // Override this method to alter the year representations that are shown in the DateChooser's
    // "Select a year" dropdown.  The default implementation returns the full four-digit 
    // Gregorian year (ie, the same value that is passed in)
    //
    // @param year (Integer) The Gregorian year number to derive a display value for
    // @return (String) the value to show for the parameter year
    // @visibility external
    //<
    
    getYearTitle : function(gregorianYear) {
        return "" + gregorianYear;
    },
    
    //> @method DateChooser.getHeaderYearTitle()
    // Override this method to alter the year representation shown in the DateChooser's header.
    // The default implementation returns the full four-digit Gregorian year (ie, the same 
    // value that is passed in)
    //
    // @param year (Integer) The Gregorian year number to derive a display value for
    // @return (String) the value to show for the parameter year
    // @visibility external
    //<
    getHeaderYearTitle : function(gregorianYear) {
        return "" + gregorianYear;
    },

	dateClick : function (year, month, day, selectNow, closeNow) {
        var date = this.chosenDate = isc.DateUtil.createLogicalDate(year, month, day);
        // set this.month / this.year - this ensures we actually show the selected 
        // date if the user hits the today button while viewing another month
        
        var yearChanged = this.year != year;
        if (yearChanged) this.year = year;
        if (yearChanged || this.month != month) this.showMonth(month);
        
        this.month = month;
        this.year = year;
        this.day = day;
        
        if (selectNow) this.dateGrid.selectDateCell(date);
        
        if (this.showTimeItem) {
            // if we're showing the timeItem, update the local logicalTime with it's current value
            this.chosenTime = this.getTimeItem().getValue();
            if (this.closeOnDateClick != true && closeNow != true) return;
        }
        
        if (closeNow == false) return;

        this.dataChanged();

    	if (window.dateClickCallback) {
			// if it's a string, normalize it to a function
			if (isc.isA.String(window.dateClickCallback)) {
                window.dateClickCallback = isc._makeFunction("date",window.dateClickCallback);
            }
			// and call it, passing the date
			window.dateClickCallback(date)
		}
        
        if (this.autoHide) this.hide();
		if (this.autoClose) this.close();

		return date;
	},
    
    // Observable dataChanged function (fired from dateClick)

    //> @method DateChooser.dataChanged()
    // <smartclient>Method to override or observe in order to be notified when a user picks a date value.
    // </smartclient><smartgwt>Add a notification to be fired whenever the data changes.</smartgwt>
    // <P>
    // Has no default behavior (so no need to call Super).
    // <P>
    // Use +link{getData()} to get the current date value.
    // 
    // @visibility external
    //<
    dataChanged : function () {
    },
    
    //> @method DateChooser.cancelClick()
    // Fired when the user clicks the cancel button in this date chooser. Default implementation
    // clears the date chooser.
    // @visibility external
    //<
    
    cancelClick : function () {
        this.close();
    },
    
    //> @method DateChooser.todayClick()
    // Fired when the user clicks the Today button. Default implementation will select the current
    // date in the date chooser.
    // @visibility external
    //<
    
    todayClick : function () {
        // get today in the defaultDisplayTimezone
        var date = isc.DateUtil.today();
        this.dateClick(date.getFullYear(), date.getMonth(), date.getDate(), true);
    },
    
    //> @method DateChooser.applyClick()
    // Fired when the user clicks the Apply button. Default implementation will select the current
    // date in the date chooser.
    //<
    applyClick : function () {
        var date = this.chosenDate.duplicate();
        this.dateClick(date.getFullYear(), date.getMonth(), date.getDate(), true, true);
    },

    //> @method DateChooser.close()
    // Close the DateChooser.  
    //< 
    close : function () {
        this.hideClickMask();
        if (this.yearMenu && this.yearMenu.isVisible()) this.yearMenu.hide();
        if (this.monthMenu && this.monthMenu.isVisible()) this.monthMenu.hide();
        if (this.isDrawn()) this.clear();
    },

	dateFromIdClick : function (element, id) {
        var parts = id.split("_");
        if (parts.length != 3) return null;
        
        var year  = parseInt(parts[0]),
            month = parseInt(parts[1]),
            day   = parseInt(parts[2]);

        return this.dateClick(year, month, day);
    },
    
    // properties that when changed should update the UI / trigger a redraw
    _$redrawProperties : {
        showTodayButton:true,
        showCancelButton:true,
        showApplyButton:true
    },

    // propertyChanged - fired by setProperties for each modified property.
    propertyChanged : function (propName, value) {
        this.invokeSuper(isc.DateChooser, "propertyChanged", propName, value);
        if (this._$redrawProperties[propName]) this.updateButtonLayout();
    }

});
//!<Deferred




// For efficiency we want to re-use a single date-chooser widget in most cases.
// Add a class method for this
isc.DateChooser.addClassMethods({
    
    // getSharedDateChooser()   Simple method to return a standard date chooser.
    // Used by the DateItem
    
    getSharedDateChooser : function (properties, dataType) {
        if (dataType == null) {
            // no type passed - check for showTimeItem and default to "date"
            if (properties && properties.showTimeItem != null) {
                dataType = (properties.showTimeItem ? "datetime" : "date");
            } else dataType = "date";
        }

        var key = "_" + dataType + "GlobalChooser";
        if (!this[key]) {
            this[key] = this.create(properties, {

                _generated:true,
                // When re-using a DateChooser, we're almost certainly displaying it as a 
                // floating picker rather than an inline element. Apply the common options for 
                // a floating picker
                autoHide:true,
                // don't do this here, it clobbers showCancelButton in the "properties" param 
                // (which comes from DateItem.pickerProperties)
                //showCancelButton:true,
                closeOnEscapeKeypress: true
                
            });
        } else {
            isc.addProperties(this[key], properties);
        }
        return this[key];
    }
    
});

// ButtonTable based menu components
// Used when useButtonTable is true

isc.ClassFactory.defineClass("WeekChooser", "ButtonTable");
isc.WeekChooser.addMethods({

	showWeekClick : function (element, id) {
        this.dateChooser.showWeek(parseInt(id));
    }

});

isc.ClassFactory.defineClass("MonthChooser", "ButtonTable");
isc.MonthChooser.addMethods({

	showMonthClick : function (element, id) {
        this.dateChooser.showMonth(parseInt(id));
    }

});

isc.ClassFactory.defineClass("YearChooser", "ButtonTable");
isc.YearChooser.addMethods({

	showYearClick : function (element, id) {

        if (this.fiscal) this.dateChooser.showFiscalYear(parseInt(id));
        else this.dateChooser.showYear(parseInt(id));

    }

});

// DateChooserMenuGrid
// This is a replacement for the ButtonTables used to show the
// Week, Day and Year picker menus.
// Supports standard GridRenderer / ListGrid features like focus and keyboard navigation
// This is used if useButtonTable is false
isc.ClassFactory.defineClass("DateChooserMenuGrid", isc.ListGrid);


isc.DateChooserMenuGrid.addProperties({
	cellPadding:2,
	tableStyle:"menuTable",
	backgroundColor:"CCCCCC",

    // We'll never show anything but the body
    showHeader:false,
    gridComponents:[
        "body"
    ],
    canSaveSearches:false,

    // Use cell navigation. We're kind of 'record-per-cell' model here
    canSelectCells:true,

    overflow:"visible",
    bodyOverflow:"visible",

    cellHeight:25,
    fixedRecordHeights:false,
    fixedFieldWidths:false,
    alternateRecordStyles:false,
    alternateFieldStyles:false,

    showSelectedRollOverCanvas:false,
    showRollOverCanvas:false,
    showRollUnderCanvas:false,

    arrowKeyAction:"focus"

});

isc.DateChooserMenuGrid.addMethods({
    
    
    
    useCellRecords:true,
    initWidget : function() {
        var rv = this.Super("initWidget", arguments);
        if (this.items) this.setItems(this.items);
        return rv;
    },

    setItems : function (items, fields) {
        this.items = isc.shallowClone(items);
        var data = [], fields = [];
        for (var i = 0; i < this.items.length; i++) {
            data.add({});
            for (var ii = 0; ii < this.items[i].length; ii++) {
                var fieldName = "field" + ii;
                data[i][fieldName] = this.items[i];
                if (fields.length <= ii) {
                    fields.add({name:fieldName, cellAlign:"center"});
                }
            }
        }
        this.setFields(fields);
        this.setData(data);
    },

    // Override getCellRecord() to return the "item" definition
    getCellRecord : function (rowNum, colNum) {
        if (rowNum == null || colNum == null) return null;
        if (this.items) return this.items[rowNum][colNum]; // Also available as this.data[rowNum][this.getFieldName(colNum)]
    },

    getCellValue : function (record, rowNum, colNum) {
        
        if (record == null) record = this.getCellRecord(rowNum, colNum);

        return record ? record.contents : this.Super("getCellValue", arguments);
    },


    // Show Modal: Put focus in the menu, bring to front, and dismiss on outside click
    showModal : function () {
        this.showClickMask(
            {target:this, methodName:"handleOutsideClick"}, 
            "soft",
            this);

        var _this = this;
        this.escapeKeyEvent = isc.Page.registerKey("Escape", function() {_this.handleEscape()});

        this.show();
        this.bringToFront();
        this._showingModal = true;
        this.body.focus();
        
    },
    handleOutsideClick:function () {
        this.hide();
    },
    handleEscape:function () {
        this.hide();
    },

	// override hide to hide the clickMask
	hide : function () {
        this.Super("hide", arguments);
        if (this._showingModal) {
            this.hideClickMask();
            isc.Page.unregisterKey(this.escapeKeyEvent);
            delete this._showingModal;
        }
	},

    getBaseStyle : function (record, rowNum, colNum) {
        if (this.baseButtonStyle) return this.baseButtonStyle;
        return this.Super("getBaseStyle", arguments);
    }

});


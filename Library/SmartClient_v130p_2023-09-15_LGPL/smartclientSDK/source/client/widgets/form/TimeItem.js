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
isc.defineClass("NativeTimeItem", "TextItem");

isc.NativeTimeItem.addProperties({
    ariaRole: "range",

    browserInputType: "time",

    textBoxStyle: "nativeTimeItem",
    inFieldHintStyle: "nativeTimeItemInFieldHint",

    showClippedValueOnHover: false
});

isc.NativeTimeItem.addMethods({

    
    getHint : function () {
        if (this.hint != null) return this.hint;
        if (isc.Browser.isChrome) return isc.TimeItem.getInstanceProperty("shortTimeFormat");
        return isc.TimeItem.getInstanceProperty("short24TimeFormat");
    },

    _$wrapper: "wrapper",
    _getWrapperElementId : function () {
        if (this.isInactiveHTML()) return this._getDOMID(this._$wrapper);
        if (this.__wrapperId == null) {
            this.__wrapperId = this._getDOMID(this._$wrapper, true);
        }
        return this.__wrapperId;
    },

    _$hint: "hint",
    _getHintElementId : function () {
        if (this.isInactiveHTML()) return this._getDOMID(this._$hint);
        if (this.__hintId == null) {
            this.__hintId = this._getDOMID(this._$hint, true);
        }
        return this.__hintId;
    },

    _getInFieldHintElemStyle : function () {
        if (this.showDisabled && this.renderAsDisabled()) return this.inFieldHintStyle + "Disabled";
        return this.inFieldHintStyle;
    },

    getElementHTML : function (value, dataValue) {
        if (!this._getShowHintInField()) return this.Super("getElementHTML", arguments);

        var height = this.getHeight();
        return "<div id='" + this._getWrapperElementId() +
               "' class='" + this._getCellStyle(this._$wrapper) +
               "' style='display:inline-block;position:relative;height:" + height +
               "px'>" +
               this.Super("getElementHTML", arguments) +
               "<span id='" + this._getHintElementId() +
               "' class='" + this._getInFieldHintElemStyle() +
               "' style='line-height:" + height +
               "px'></span></div>";
    },

    getElementValue : function () {
        var element = this.getDataElement(),
            value;
        if (!element || !(value = element.value)) return null;
        // http://www.w3.org/TR/html5/infrastructure.html#times
        var h = parseInt(value, 10),
            m = parseInt(value.substring(3), 10),
            s = (value.length >= 8 ? parseInt(value.substring(6), 10) : 0);
        return isc.Time.createLogicalTime(h, m, s);
    },

    setElementValue : function (newValue, dataValue) {
        if (!this.isDrawn()) return;
        var undef;
        if (dataValue === undef) {
            dataValue = this._value;
        }

        var element = this.getDataElement();
        if (element != null) {
            element.value = newValue;
        }
    },

    mapValueToDisplay : function (value) {
        if (isc.isA.Date(value)) return isc.Time.toShortTime(value, "toTimestamp");
        return value;
    },

    _showInFieldHint : function () {
        var hintElem = isc.Element.get(this._getHintElementId());
        if (hintElem != null) {
            this.getDataElement().className = this._getInFieldHintStyle();

            hintElem.className = this._getInFieldHintElemStyle();
            var hint = this.getHint();
            hintElem.innerText = String.htmlStringToString(hint);
            this._showingInFieldHint = true;
        }
    },

    _hideInFieldHint : function (clearStyleOnly) {
        var hintElem = isc.Element.get(this._getHintElementId());
        if (hintElem != null) {
            this.getDataElement().className = this.getTextBoxStyle();

            hintElem.className = this._getInFieldHintElemStyle();
            hintElem.innerText = isc.emptyString;
            this._showingInFieldHint = false;
        }
    },

    updateState : function () {
        this.Super("updateState", arguments);
        if (this._showingInFieldHint) {
            var hintElem = isc.Element.get(this._getHintElementId());
            if (hintElem != null) hintElem.className = this._getInFieldHintElemStyle();
        }
    }
});


//>	@class TimeItem
// A +link{FormItem} for editing +link{DateUtil.createLogicalTime, logical-time} values, which
// are Date instances where only the time-portion is relevant.
// <P>
// The item renders with one of two appearances, depending on the value of 
// +link{TimeItem.useTextField} - when set to true, the default appearance, times are edited 
// directly as text-values.  In this mode, values are formatted according to 
// +link{TimeItem.timeFormatter}, with defaults coming from +link{timeItem.timeFormatter24Hour} 
// and +link{timeItem.timeFormatter12Hour}, depending on the value of 
// +link{TimeItem.use24HourTime, use24HourTime}.
// See also +link{Time.setNormalDisplayFormat} for system-wide settings.
// <P>
// TimeItem automatically accepts both 12 and 24 hour time as well as partial times and a
// variety of possible time value separators.  Examples:
// <pre>
//		11:34:45 AM	=> 11:34:45
//		1:3:5 AM	=> 01:30:50
//		1:3p		=> 13:30:00
//		11 34 am	=> 11:34:00
//		11-34		=> 11:34:00
//		113445		=> 11:34:45
//		13445		=> 01:34:45
//		1134		=> 11:34:00
//		134			=> 01:34:00
// </pre>
// <P>
// When <code>useTextField</code> is set to false, the item provides separate pickers for 
// +link{TimeItem.hourItem, hour}, +link{TimeItem.minuteItem, minute} and 
// +link{TimeItem.secondItem, second} values.  By default, the pickers edit times in 
// +link{TimeItem.use24HourTime, 24-hour format}, meaning the <code>hourItem</code> shows 
// values from 0-23.  When +link{TimeItem.use24HourTime, use24HourTime} is set to false, the 
// <code>hourItem</code> is limited to a range of 1-12, and the 
// +link{TimeItem.ampmItem, am/pm picker} is displayed.  Note that 
// +link{TimeItem.getValue(), getValue()} always returns a Date instance that represents a
// +link{DateUtil.createLogicalTime, logical-time} in 24-hour format.
// <P>
// Values entered by the user are stored as JavaScript <code>Date</code> objects in local time.  
// The day, month and year values of this <code>Date</code> object are not relevant and should 
// be ignored.
// <P>
// By default, when used in a +link{class:SearchForm} or as a field in a +link{class:ListGrid}'s 
// +link{listGrid.showFilterEditor, filter editor}, TimeItems will automatically generate 
// AdvancedCriteria - for example, entering "11:00" into the item will generate a 
// +link{type:OperatorId,betweenInclusive} Criterion that selects all times between 
// 11:00:00 and 11:59:59.  If the form is databound and the DataSource is marked as being
// +link{dataSource.allowAdvancedCriteria, allowAdvancedCriteria}:false, the criteria generated
// will be simple, checking for data with logical time values equal to the displayed value.
// <P>
// To edit +link{DateUtil.createLogicalDate, logical-Date values}, see +link{class:DateItem},
// and to edit +link{DateUtil.createDatetime, datetime values}, see +link{class:DateTimeItem}.
// For +link{RelativeDateString, relative-date features}, see +link{class:RelativeDateItem}.
// <P>
// For detailed information on working with dates, times and datetimes, see the 
// +link{group:dateFormatAndStorage, Date and Time Format and Storage overview}.
// @inheritsFrom FormItem
// @example timeItem
// @visibility external
//<



isc.ClassFactory.defineClass("TimeItem", "ContainerItem");
isc.TimeItem.addClassProperties({
	DEFAULT_TIME:"00:00:00"
});

isc.TimeItem.addProperties({

    //> @attr timeItem.textField (AutoChild TextItem : null : R)
    // Text field to hold the entire time in "type in" format, if 
    // +link{timeItem.useTextField, useTextField} is true.
    // 
    // @visibility external
    //<

    //> @attr timeItem.textFieldProperties (TextItem Properties : null : IRA)
    // Custom properties to apply to the +link{timeItem.textField,text field} generated for 
    // this timeItem when +link{timeItem.useTextField, useTextField} is true.
    // @visibility external
    //<

    textFieldDefaults: {

        showTitle: false,
        name:"timeTextField", type:"text", changeOnBlur:true,

        _getShowHintInField : function () {
            return this.parentItem._getShowHintInField();
        },
        _getUsePlaceholderForHint : function () {
            
            if (!this.parentItem.usePlaceholderForHint) return false;
            return this._supportsPlaceholderAttribute();
        },
        getHint : function () {
            if (this._getShowHintInField()) {
                return (this.parentItem.hint != null 
                        ? this.parentItem.hint
                        : this.parentItem.getDefaultHint());
            }
            return null;
        },

        // Disable changeOnKeypress - we don't want to attempt to parse partially entered
        // strings. Instead we handle change on blur (and on explicit "Enter" keypress)
        changeOnKeypress:false,
        shouldSaveValue:false,

        // Size the text box / content to fit within the parent instead of looking at this.width
        getInnerWidth : function () {
            return this.parentItem.getInnerWidth();
        },
    
        _shouldUpdateParentItem: true,

        // Have change occur on enter too (useful for things like submitting forms on enter, embedded
        // TimeItems in ListGrid editors, etc)
        handleKeyPress : function () {
            var returnVal = this.Super("handleKeyPress", arguments);
            if (returnVal != false) {
                var keyName = isc.EH.getKey();
                if (keyName == "Enter" && !this.useMask) {
                    
                    if (this.parentItem) this.parentItem.updateValue();
                    // Reformat to display the pretty value
                    
                    
                    this.setElementValue(this.mapValueToDisplay(this.getValue()));
                }
            }
            return returnVal;
        },

        setMask : function (mask) {
            this.logWarn("setMask: custom mask ignored");
        },
        
        shouldApplyStaticTypeFormat : function () {
            if (this.isReadOnly()) return true;
            return this.Super("shouldApplyStaticTypeFormat", arguments);
        }
    },

    //> @attr timeItem.browserInputType (String : null : IRA)
    // If +link{TimeItem.useTextField,useTextField} is true and browserInputType is set to
    // "time", then a native +externalLink{http://www.w3.org/TR/html5/forms.html#time-state-(type=time),HTML5 time input}
    // is used in place of a text input.
    // <p>
    // The use of a native HTML5 time input causes certain features to be disabled. Input masks
    // and a custom +link{TimeItem.timeFormatter,timeFormatter} are not supported.
    // +link{TimeItem.showHintInField,In-field hints} are currently supported, but future browser
    // changes might force this support to be removed. Therefore, it is safest to <em>not</em>
    // use in-field hints (set showHintInField to false) in conjunction with a native HTML5 time
    // input.
    // <p>
    // <b>NOTE:</b> This feature requires specific CSS changes. Currently these changes have
    // been made to the Enterprise, EnterpriseBlue, and Graphite skins only.
    //
    // @visibility external
    //<

    //> @attr timeItem.wrapHintText (Boolean : false : IR)
    // @include FormItem.wrapHintText
    //<
    wrapHintText: false,

    //> @attr timeItem.showHintInField
    // If +link{TimeItem.useTextField,useTextField} is true and a +link{FormItem.hint,hint} is
    // set, should the hint be shown within the field?
    // <p>
    // Note that when using a native HTML5 time input (see +link{TimeItem.browserInputType}),
    // in-field hints are currently supported, but future browser changes might not allow
    // in-field hints to be supported. Therefore, it is safest to <em>not</em> use in-field
    // hints in conjunction with a native HTML5 time input.
    // <p>
    // To change this attribute after being drawn, it is necessary to call +link{FormItem.redraw()}
    // or redraw the form.
    // @include TextItem.showHintInField
    // @visibility external
    //<

    //> @attr timeItem.usePlaceholderForHint (boolean : true : IRA)
    // @include TextItem.usePlaceholderForHint
    // @visibility external
    //<
    
    usePlaceholderForHint: true,

    // titles visible and center-aligned above items, by default

    //> @attr timeItem.showItemTitles (Boolean : true : [IRW])
    // When +link{TimeItem.useTextField, useTextField} is false, whether titles should be shown
    // for for child-items in this TimeItem.  By default, <code>showItemTitles</code> is true,
    // and titles are displayed +link{timeItem.titleOrientation, above the items}.
    // @group formTitles
    // @visibility external
    // @example formLayoutTitles
    // @visibility external
    //<
    showItemTitles: true,

    //> @attr timeItem.itemTitleOrientation (TitleOrientation : "top" : [IRW])
    // When +link{TimeItem.useTextField, useTextField} is false, the default orientation of 
    // titles for child-items, such as the +link{timeItem.hourItem, hour}, 
    // +link{timeItem.minuteItem, minute} and +link{timeItem.secondItem, second} pickers.
    // +link{type:TitleOrientation} lists valid options.
    // <P>
    // Note that titles on the left or right take up a cell in tabular
    // +link{group:formLayout,form layouts}, but titles on top do not.
    // @visibility external
    // @group formTitles
    // @example formLayoutTitles
    //<
    itemTitleOrientation: "top",

    //> @attr timeItem.itemTitleAlign (Alignment : "center" : [IRW])
    // When +link{TimeItem.useTextField, useTextField} is false, the default title-alignment of 
    // child-items such as the +link{timeItem.hourItem, hour}, 
    // +link{timeItem.minuteItem, minute} and +link{timeItem.secondItem, second} pickers,
    // within their cells.
    // @group formTitles
    // @visibility external
    // @example formLayoutTitles
    //<
    itemTitleAlign: "center",

    // Unit Selectors

    //> @attr timeItem.showHourItem (Boolean : true : IRW)
    // Controls whether to display the +link{hourItem} when +link{useTextField} is false.
    // @visibility external
    //<
    showHourItem:true,
    
    //> @attr timeItem.hourItem (AutoChild SelectItem : null : R)
    // Select item to hold the hours portion of the time or 
    // +link{timeItem.getDuration, duration} when +link{timeItem.useTextField, useTextField} 
    // is false.
    // @visibility external
    //<

    //> @attr timeItem.hourItemProperties (SelectItem Properties : null : IRA)
    // Custom properties to apply to this timeItem's generated 
    // +link{timeItem.hourItem, hour picker}.
    // @visibility external
    //<
    hourItemDefaults: {
        name: "hourItem", type: "select", 
        addUnknownValues: false, 
        valueMap: "this.parentItem.getHourValues()", shouldSaveValue: false,
        defaultDynamicValue: "(this.parentItem.defaultValue && this.parentItem.getDefaultValue().getHours()) || this.parentItem.getHourValues()[0]",
        // Override saveValue to update the parent.
        
        saveValue : function () {
            this.Super("saveValue", arguments);
            this.parentItem.updateValue();
        },
        // Don't adjust the selectors for errors (which are shown at the parent-item level)
        getErrorWidth:function () {return 0;},
        // avoid additional changed events from this sub-item
        suppressItemChanged: true
    },
    //> @attr timeItem.hourItemTitle (HTMLString : "Hour" : IRW)
    // Title to show for the +link{timeItem.hourItem, hour picker}.
    // @group i18nMessages
    // @visibility external
    //<
    hourItemTitle: "Hour",
    //> @attr timeItem.hourItemPrompt (HTMLString : "Choose hours" : IRW)
    // The hover prompt to show for the +link{timeItem.hourItem, hour picker}.
    // @group i18nMessages
    // @visibility external
    //<
    hourItemPrompt: "Choose hours",

    //> @attr timeItem.showMinuteItem (Boolean : true : IRW)
    // Controls whether to display the +link{minuteItem} when +link{useTextField} is false.
    // @visibility external
    //<
    showMinuteItem:true,
    //> @attr timeItem.minuteItem (AutoChild SelectItem : null : R)
    // Select item to hold the minutes portion of the time or 
    // +link{timeItem.getDuration, duration} when +link{timeItem.useTextField, useTextField} 
    // is false.
    // @visibility external
    //<

    //> @attr timeItem.minuteItemProperties (SelectItem Properties : null : IRA)
    // Custom properties to apply to this timeItem's generated 
    // +link{timeItem.minuteItem, minute picker}.
    // @visibility external
    //<
    minuteItemDefaults: {
        name: "minuteItem", type: "select", 
        addUnknownValues: false, 
        defaultDynamicValue: "(this.parentItem.defaultValue && " +
            "this.parentItem.getDefaultValue().getMinutes()) || " +
            "this.parentItem.getMinuteValues()[0]",
        valueMap: "this.parentItem.getMinuteValues()", shouldSaveValue: false,
        // Override saveValue to update the parent.
        
        saveValue : function () {
            this.Super("saveValue", arguments);
            this.parentItem.updateValue();
        },
        // Don't adjust the selectors for errors (which are shown at the parent-item level)
        getErrorWidth:function () {return 0;},
        // avoid additional changed events from this sub-item
        suppressItemChanged: true
    },
    //> @attr timeItem.minuteItemTitle (HTMLString : "Min" : IRW)
    // Title to show for the +link{timeItem.minuteItem, minute picker}.
    // @group i18nMessages
    // @visibility external
    //<
    minuteItemTitle: "Min",
    //> @attr timeItem.minuteItemPrompt (HTMLString : "Choose minutes" : IRW)
    // The hover prompt to show for the +link{timeItem.minuteItem, minute picker}.
    // @group i18nMessages
    // @visibility external
    //<
    minuteItemPrompt: "Choose minutes",

    //> @attr timeItem.showSecondItem (Boolean : true : IRW)
    // Controls whether to display the +link{secondItem} when +link{useTextField} is false.
    // @visibility external
    //<
    showSecondItem:true,
    //> @attr timeItem.secondItem (AutoChild SelectItem : null : R)
    // Select item to hold the seconds portion of the time or 
    // +link{timeItem.getDuration, duration} when +link{timeItem.useTextField, useTextField} 
    // is false.
    // @visibility external
    //<
    //> @attr timeItem.secondItemProperties (SelectItem Properties : null : IRA)
    // Custom properties to apply to this timeItem's generated 
    // +link{timeItem.secondItem, seconds picker}.
    // @visibility external
    //<
    secondItemDefaults: {
        name: "secondItem", type: "select", 
        addUnknownValues: false, 
        valueMap: "this.parentItem.getSecondValues()", shouldSaveValue: false,
        defaultDynamicValue: "(this.parentItem.defaultValue && this.parentItem.getDefaultValue().getSeconds()) || this.parentItem.getSecondValues()[0]",
        // Override saveValue to update the parent.
        
        saveValue : function () {
            this.Super("saveValue", arguments);
            this.parentItem.updateValue();
        },
        // Don't adjust the selectors for errors (which are shown at the parent-item level)
        getErrorWidth:function () {return 0;},
        // avoid additional changed events from this sub-item
        suppressItemChanged: true
    },
    //> @attr timeItem.secondItemTitle (HTMLString : "Sec" : IRW)
    // Title to show for the +link{timeItem.secondItem, second picker}.
    // @group i18nMessages
    // @visibility external
    //<
    secondItemTitle: "Sec",
    //> @attr timeItem.secondItemPrompt (HTMLString : "Choose seconds" : IRW)
    // The hover prompt to show for the +link{timeItem.secondItem, second picker}.
    // @group i18nMessages
    // @visibility external
    //<
    secondItemPrompt: "Choose seconds",

    //> @attr timeItem.showMillisecondItem (Boolean : false : IRW)
    // Controls whether to display the +link{millisecondItem} when +link{useTextField} is false.
    // @visibility external
    //<
    showMillisecondItem:false,
    //> @attr timeItem.millisecondItem (AutoChild SelectItem : null : R)
    // Select item to hold the milliseconds portion of the time or 
    // +link{timeItem.getDuration, duration} when +link{timeItem.useTextField, useTextField} 
    // is false.
    // @visibility external
    //<

    //> @attr timeItem.millisecondItemProperties (SelectItem Properties : null : IRA)
    // Custom properties to apply to this timeItem's generated 
    // +link{timeItem.millisecondItem, millisecond picker}.
    // @visibility external
    //<
    showMillisecondItem: false,
    millisecondItemDefaults: {
        name: "millisecondItem", type: "select", 
        addUnknownValues: false,
        defaultDynamicValue: "(this.parentItem.defaultValue && this.parentItem.getDefaultValue().getMilliseconds()) || this.parentItem.getMillisecondValues()[0]",
        valueMap: "this.parentItem.getMillisecondValues()", shouldSaveValue: false,
        // Override saveValue to update the parent.
        
        saveValue : function () {
            this.Super("saveValue", arguments);
            this.parentItem.updateValue();
        },
        // Don't adjust the selectors for errors (which are shown at the parent-item level)
        getErrorWidth:function () {return 0;},
        // avoid additional changed events from this sub-item
        suppressItemChanged: true
    },
    //> @attr timeItem.millisecondItemTitle (HTMLString : "Ms" : IRW)
    // Title to show for the +link{timeItem.millisecondItem, millisecond picker}.
    // @group i18nMessages
    // @visibility external
    //<
    millisecondItemTitle: "Ms",
    //> @attr timeItem.millisecondItemPrompt (HTMLString : "Choose milliseconds" : IRW)
    // The hover prompt to show for the +link{timeItem.millisecondItem, millisecond picker}.
    // @group i18nMessages
    // @visibility external
    //<
    millisecondItemPrompt: "Choose milliseconds",

    //> @attr timeItem.ampmItem (AutoChild SelectItem : null : R)
    // Select item to hold the AM/PM value for the timeItem when 
    // +link{timeItem.useTextField, useTextField} is false.
    // @visibility external
    //<

    //> @attr timeItem.ampmItemProperties (SelectItem Properties : null : IRA)
    // Custom properties to apply to this timeItem's generated 
    // +link{timeItem.ampmItem,AM/PM picker}.
    // @visibility external
    //<
    ampmItemDefaults: {
        name: "ampmItem", prompt: "Choose AM or PM", type: "select", 
        addUnknownValues: false,
        valueMap: "this.parentItem.getAmpmOptions()", shouldSaveValue: false,
        defaultDynamicValue: "this.parentItem.getAmpmOptions()[0]",
        // Override saveValue to update the parent.
        
        saveValue : function () {
            this.Super("saveValue", arguments);
            this.parentItem.updateValue();
        },
        // Don't adjust the selectors for errors (which are shown at the parent-item level)
        getErrorWidth:function () {return 0;},
        // avoid additional changed events from this sub-item
        suppressItemChanged: true
    },
    //> @attr timeItem.ampmItemTitle (HTMLString : "AM/PM" : IRW)
    // Title to show for the +link{timeItem.ampmItem, AM/PM picker}.
    // @group i18nMessages
    // @visibility external
    //<
    ampmItemTitle: "AM/PM",

    //> @attr timeItem.displayFormat (TimeDisplayFormat: null : IRW)
    // What format should this item's time string be presented in?
    // <p>
    // This attribute does not have an effect if a native HTML5 time input is being used.
    // See +link{TimeItem.browserInputType}.
    // @visibility external
    // @deprecated in favor of +link{timeItem.timeFormatter}
    //<
	//displayFormat:"toShort24HourTime",

    //> @attr timeItem.timeFormatter (TimeDisplayFormat: null: IRW)
    // If +link{useTextField} is true, what format should this item's time string be 
    // presented in?
    // <P>
    // If unset, the default formatter will be +link{timeItem.timeFormatter24Hour} or
    // +link{timeFormatter12Hour} depending on the value of +link{timeItem.use24HourTime}.
    // If the property cannot be derived in this way (none of these properties are set),
    // we'll check +link{dynamicForm.timeFormatter}, or finally back off to the
    // standard system-wide +link{Time.displayFormat} will be applied.
    // <p>
    // This attribute does not have an effect if a native HTML5 time input is being used.
    // See +link{TimeItem.browserInputType}.
    // @visibility external
    //<
//	timeFormatter:null,

    //> @attr timeItem.timeFormatter24Hour (TimeDisplayFormat: "toShort24HourTime" : IRW)
    // If +link{useTextField} is true, and +link{use24HourTime} is true,
    // what format should this item's time string be presented in?
    // <P>
    // May be overridden via an explicitly specified +link{timeItem.timeFormatter}.
    // <P>
    // This attribute does not have an effect if a native HTML5 time input is being used.
    // See +link{TimeItem.browserInputType}.
    // @visibility external
    //<
	timeFormatter24Hour:"toShort24HourTime",

    //> @attr timeItem.timeFormatter12Hour (TimeDisplayFormat: "toShortTime" : IRW)
    // If +link{useTextField} is true, and +link{use24HourTime} is false,
    // what format should this item's time string be presented in?
    // <P>
    // May be overridden via an explicitly specified +link{timeItem.timeFormatter}.
    // <p>
    // This attribute does not have an effect if a native HTML5 time input is being used.
    // See +link{TimeItem.browserInputType}.
    // @visibility external
    //<
	timeFormatter12Hour:"toShortTime",

    // Note: we don't have an inputFormat (as we do with DateItems).
    // Time strings are not ambiguous like dates, and our time parsing function deals 
    // with essentially any time format the user is likely to enter.
    
    //> @attr timeItem.allowEmptyValue (Boolean : true : IRW)
    // If true, this time item supports empty values when cleared out    
    //<
    // Not clear whether we should mark this visibility external
    allowEmptyValue:true,


    //> @attr timeItem.useMask (Boolean : null : IRA)
    // If true, a data entry mask will be enabled in the field based on the
    // +link{TimeItem.timeFormatter}.
    // <p>
    // Note that if a non-padded +link{TimeItem.timeFormatter} is specified, it
    // will be changed to the corresponding padded version (ex. "toShort24HourTime"
    // will be changed to "toShortPadded24HourTime").
    // <p>
    // This attribute does not have an effect if a native HTML5 time input is being used.
    // See +link{TimeItem.browserInputType}.
    // @visibility external
    //<

    // Default to 120 wide
    // This is an appropriate default if we're showing the text field.
    width:120,

    cellPadding:0,

    //> @attr timeItem.useTextField (Boolean : true : IR)
    // Should we show the time in a text field, or as a number of SelectItems?
    // @visibility external
    //<
    useTextField: true,

    //> @attr timeItem.textAlign (Alignment : varies : IRW)
    // If +link{timeItem.useTextField} is <code>true</code>, this property governs the alignment
    // of text within the text field. Defaults to <code>"left"</code> by default or
    // <code>"right"</code> if the page is in +link{isc.Page.isRTL(),rtl mode}.
    // <p>
    // This attribute does not have an effect if a native HTML5 time input is being used.
    // See +link{TimeItem.browserInputType}.
    // @visibility external
    //<
    
    textAlign:isc.Page.isRTL() ? isc.Canvas.RIGHT : isc.Canvas.LEFT,

    //> @attr timeItem.invalidTimeStringMessage (HTMLString : "Invalid time" : IRW)
    // Validation error message to display if the user enters an invalid time string.
    // @group i18nMessages
    // @visibility external
    //<
    invalidTimeStringMessage:"Invalid time",

    //> @attr timeItem.use24HourTime (Boolean : null : IRW)
    // Whether to enforce 24-hour time in the UI.  If unset, assumes to the 
    // +link{Time.use24HourTime, global default}.
    // @visibility external
    //<
    use24HourTime: null
});

isc.TimeItem.addMethods({

    //> @attr timeItem.textBoxStyle (CSSStyleName : null : IRW)
    // Base CSS class for this item's text box.
    // If specified this style will be applied to the +link{timeItem.textField} if 
    // +link{timeitem.useTextField} is set to <code>true</code>.
    // @visibility external
    //<
    // If unset (the default) standard text box styling will apply.
    textBoxStyle:null,

    showing24HourTime : function () {
        return this.use24HourTime;
    },
    
    // helper to generate the list of valid entries for some picker (one of 
    // hour/minute/second/millisecond)
    getSubItemValues : function (itemName) {
        var values = this[itemName + "Values"],
            unit = itemName.substring(0,1).toUpperCase() + itemName.substring(1, itemName.length)
        ;
        if (!values) {
            values = [];
            var min = this["get" + unit + "MinValue"](),
                max = this["get" + unit + "MaxValue"](),
                count = 0
            ;
            for (var i=min; i<=max; i+=this[itemName + "Increment"]) {
                if (i < 10) values.add(isc.NumberUtil.stringify(i, 2));
                else values.add(isc.NumberUtil.stringify(i));
                count++;
            }
            this[itemName + "Values"] = values;
        }
        return this[itemName + "Values"];
    },
    
    //> @attr timeItem.hourValues (Array of Number : null : IRW)
    // An array of values to make available in the +link{timeItem.hourItem,hour picker} when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for specifying a limited set of valid Hour values, or when using the 
    // TimeItem to record duration, rather than time per-se.
    // <P> See +link{timeItem.hourMinValue, hourMinValue}, 
    // +link{timeItem.hourMaxValue, hourMaxValue} and 
    // +link{timeItem.hourIncrement, hourIncrement} for another method of controlling the 
    // content in the hour picker.
    // @setter setHourValues
    // @visibility external
    //<

    //> @method timeItem.setHourValues() (A)
    // Sets the array of valid +link{timeItem.hourValues, hour values} to use when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for limiting available valid Hour values, or when using the TimeItem to record
    // duration, rather than time per-se.
    // <P> See +link{timeItem.hourMinValue, hourMinValue}, 
    // +link{timeItem.hourMaxValue, hourMaxValue} and 
    // +link{timeItem.hourIncrement, hourIncrement} for another method of controlling the 
    // content in the hour picker.
    // @param values (Array of Number) array of available Hour values
    // @visibility external
    //<
    setHourValues : function (values) {
        this.hourValues = values;
        if (this.hourItem) this.hourItem.setValueMap(this.getHourValues());
    },
    //> @method timeItem.getHourValues() (A)
    // Returns an array of the current valid hour values, whether set directly as 
    // +link{timeItem.hourValues} or generated according to 
    // +link{timeItem.hourMinValue, hourMinValue}, 
    // +link{timeItem.hourMaxValue, hourMaxValue} and 
    // +link{timeItem.hourIncrement, hourIncrement}.
    // @return (Array of Number) array of available Hour values
    // @visibility external
    //<
    getHourValues : function () {
        return this.getSubItemValues("hour");
    },
    
    //> @attr timeItem.hourMinValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.hourValues, hourValues} is unset, this attribute specifies the minimum
    // value present in the hour picker.
    // <P>Used for specifying a limited set of valid Hour values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default is zero in all cases.
    // <P> See also +link{timeItem.hourMaxValue, hourMaxValue} and 
    // +link{timeItem.hourIncrement, hourIncrement}.
    // @visibility external
    //<
    hourMinValue: null,
    //> @attr timeItem.hourMaxValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.hourValues, hourValues} is unset, this attribute specifies the maximum
    // value present in the hour picker.
    // <P>Used for specifying a limited set of valid Hour values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default is 11 or 23, 
    // according to the value of +link{timeItem.use24HourTime, use24HourTime} and
    // +link{timeItem.timeFormatter, timeFormatter}.
    // <P> See also +link{timeItem.hourMinValue, hourMinValue} and 
    // +link{timeItem.hourIncrement, hourIncrement}.
    // @visibility external
    //<
    hourMaxValue: null,
    //> @attr timeItem.hourIncrement (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.hourValues, hourValues} is unset, this attribute specifies the increment
    // to use when generating entries for the hour picker.  For example, if this attribute is
    // set to 5, the hour picker will contain only every fifth value between the 
    // +link{timeItem.hourMinValue, hourMinValue} and 
    // +link{timeItem.hourMaxValue, hourMaxValue}.
    // @visibility external
    //<
    hourIncrement: 1,
    getHourMinValue : function () {
        if (this.hourMinValue == null) this.hourMinValue = (this.showing24HourTime() ? 0 : 1);
        return this.hourMinValue;
    },
    getHourMaxValue : function () {
        if (this.hourMaxValue == null) this.hourMaxValue = (this.showing24HourTime() ? 23 : 12);
        return this.hourMaxValue;
    },

    //> @attr timeItem.minuteValues (Array of Number : null : IRW)
    // An array of values to make available in the +link{timeItem.minuteItem,minute picker} when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for specifying a limited set of valid Minute values, or when using the 
    // TimeItem to record duration, rather than time per-se.
    // <P> See +link{timeItem.minuteMinValue, minuteMinValue}, 
    // +link{timeItem.minuteMaxValue, minuteMaxValue} and 
    // +link{timeItem.minuteIncrement, minuteIncrement} for another method of controlling the 
    // content in the minute picker.
    // @setter setMinuteValues
    // @visibility external
    //<

    //> @method timeItem.setMinuteValues() (A)
    // Sets the array of valid +link{timeItem.minuteValues, minute values} to use when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for limiting available valid Minute values, or when using the TimeItem to record
    // duration, rather than time per-se.
    // <P> See +link{timeItem.minuteMinValue, minuteMinValue}, 
    // +link{timeItem.minuteMaxValue, minuteMaxValue} and 
    // +link{timeItem.minuteIncrement, minuteIncrement} for another method of controlling the 
    // content in the minute picker.
    // @param values (Array of Number) array of available Minute values
    // @visibility external
    //<
    setMinuteValues : function (values) {
        this.minuteValues = values;
        if (this.minuteItem) this.minuteItem.setValueMap(this.getMinuteValues());
    },
    //> @method timeItem.getMinuteValues() (A)
    // Returns an array of the current valid minute values, whether set directly as 
    // +link{timeItem.minuteValues} or generated according to 
    // +link{timeItem.minuteMinValue, minuteMinValue}, 
    // +link{timeItem.minuteMaxValue, minuteMaxValue} and 
    // +link{timeItem.minuteIncrement, minuteIncrement}.
    // @return (Array of Number) array of available Minute values
    // @visibility external
    //<
    getMinuteValues : function () {
        return this.getSubItemValues("minute");
    },
    
    //> @attr timeItem.minuteMinValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.minuteValues, minuteValues} is unset, this attribute specifies the minimum
    // value present in the minute picker.
    // <P>Used for specifying a limited set of valid Minute values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default is zero in all cases.
    // <P> See also +link{timeItem.minuteMaxValue, minuteMaxValue} and 
    // +link{timeItem.minuteIncrement, minuteIncrement}.
    // @visibility external
    //<
    minuteMinValue: null,
    //> @attr timeItem.minuteMaxValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.minuteValues, minuteValues} is unset, this attribute specifies the maximum
    // value present in the minute picker.
    // <P>Used for specifying a limited set of valid Minute values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default 59.
    // <P> See also +link{timeItem.minuteMinValue, minuteMinValue} and 
    // +link{timeItem.minuteIncrement, minuteIncrement}.
    // @visibility external
    //<
    minuteMaxValue: null,
    //> @attr timeItem.minuteIncrement (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.minuteValues, minuteValues} is unset, this attribute specifies the increment
    // to use when generating entries for the minute picker.  For example, if this attribute is
    // set to 5, the minute picker will contain only every fifth value between the 
    // +link{timeItem.minuteMinValue, minuteMinValue} and 
    // +link{timeItem.minuteMaxValue, minuteMaxValue}.
    // @visibility external
    //<
    minuteIncrement: 1,
    getMinuteMinValue : function () {
        if (this.minuteMinValue == null) this.minuteMinValue = 0;
        return this.minuteMinValue;
    },
    getMinuteMaxValue : function () {
        if (this.minuteMaxValue == null) this.minuteMaxValue = 59;
        return this.minuteMaxValue;
    },

    //> @attr timeItem.secondValues (Array of Number : null : IRW)
    // An array of values to make available in the +link{timeItem.secondItem,second picker} when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for specifying a limited set of valid Second values, or when using the 
    // TimeItem to record duration, rather than time per-se.
    // <P> See +link{timeItem.secondMinValue, secondMinValue}, 
    // +link{timeItem.secondMaxValue, secondMaxValue} and 
    // +link{timeItem.secondIncrement, secondIncrement} for another method of controlling the 
    // content in the second picker.
    // @setter setSecondValues
    // @visibility external
    //<

    //> @method timeItem.setSecondValues() (A)
    // Sets the array of valid +link{timeItem.secondValues, second values} to use when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for limiting available valid Second values, or when using the TimeItem to record
    // duration, rather than time per-se.
    // <P> See +link{timeItem.secondMinValue, secondMinValue}, 
    // +link{timeItem.secondMaxValue, secondMaxValue} and 
    // +link{timeItem.secondIncrement, secondIncrement} for another method of controlling the 
    // content in the second picker.
    // @param values (Array of Number) array of available Second values
    // @visibility external
    //<
    setSecondValues : function (values) {
        this.secondValues = values;
        if (this.secondItem) this.secondItem.setValueMap(this.getSecondValues());
    },
    //> @method timeItem.getSecondValues() (A)
    // Returns an array of the current valid second values, whether set directly as 
    // +link{timeItem.secondValues} or generated according to 
    // +link{timeItem.secondMinValue, secondMinValue}, 
    // +link{timeItem.secondMaxValue, secondMaxValue} and 
    // +link{timeItem.secondIncrement, secondIncrement}.
    // @return (Array of Number) array of available Second values
    // @visibility external
    //<
    getSecondValues : function () {
        return this.getSubItemValues("second");
    },
    
    //> @attr timeItem.secondMinValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.secondValues, secondValues} is unset, this attribute specifies the minimum
    // value present in the second picker.
    // <P>Used for specifying a limited set of valid Second values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default is zero in all cases.
    // <P> See also +link{timeItem.secondMaxValue, secondMaxValue} and 
    // +link{timeItem.secondIncrement, secondIncrement}.
    // @visibility external
    //<
    secondMinValue: null,
    //> @attr timeItem.secondMaxValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.secondValues, secondValues} is unset, this attribute specifies the maximum
    // value present in the second picker.
    // <P>Used for specifying a limited set of valid Second values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default is 59.
    // <P> See also +link{timeItem.secondMinValue, secondMinValue} and 
    // +link{timeItem.secondIncrement, secondIncrement}.
    // @visibility external
    //<
    secondMaxValue: null,
    //> @attr timeItem.secondIncrement (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.secondValues, secondValues} is unset, this attribute specifies the increment
    // to use when generating entries for the second picker.  For example, if this attribute is
    // set to 5, the second picker will contain only every fifth value between the 
    // +link{timeItem.secondMinValue, secondMinValue} and 
    // +link{timeItem.secondMaxValue, secondMaxValue}.
    // @visibility external
    //<
    secondIncrement: 1,
    getSecondMinValue : function () {
        if (this.secondMinValue == null) this.secondMinValue = 0;
        return this.secondMinValue;
    },
    getSecondMaxValue : function () {
        if (this.secondMaxValue == null) this.secondMaxValue = 59;
        return this.secondMaxValue;
    },

    //> @attr timeItem.millisecondValues (Array of Number : null : IRW)
    // An array of values to make available in the 
    // +link{timeItem.millisecondItem,millisecond picker} when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for specifying a limited set of valid Millisecond values, or when using the 
    // TimeItem to record duration, rather than time per-se.
    // <P> See +link{timeItem.millisecondMinValue, millisecondMinValue}, 
    // +link{timeItem.millisecondMaxValue, millisecondMaxValue} and 
    // +link{timeItem.millisecondIncrement, millisecondIncrement} for another method of 
    // controlling the content in the millisecond picker.
    // @setter setMillisecondValues
    // @visibility external
    //<

    //> @method timeItem.setMillisecondValues() (A)
    // Sets the array of valid +link{timeItem.millisecondValues, millisecond values} to use when
    // +link{timeItem.useTextField,useTextField} is false.
    // <P>Used for limiting available valid Millisecond values, or when using the TimeItem to record
    // duration, rather than time per-se.
    // <P> See +link{timeItem.millisecondMinValue, millisecondMinValue}, 
    // +link{timeItem.millisecondMaxValue, millisecondMaxValue} and 
    // +link{timeItem.millisecondIncrement, millisecondIncrement} for another method of controlling the 
    // content in the millisecond picker.
    // @param values (Array of Number) array of available Millisecond values
    // @visibility external
    //<
    setMillisecondValues : function (values) {
        this.millisecondValues = values;
        if (this.millisecondItem) this.millisecondItem.setValueMap(this.getMillisecondValues());
    },
    //> @method timeItem.getMillisecondValues() (A)
    // Returns an array of the current valid millisecond values, whether set directly as 
    // +link{timeItem.millisecondValues} or generated according to 
    // +link{timeItem.millisecondMinValue, millisecondMinValue}, 
    // +link{timeItem.millisecondMaxValue, millisecondMaxValue} and 
    // +link{timeItem.millisecondIncrement, millisecondIncrement}.
    // @return (Array of Number) array of available Millisecond values
    // @visibility external
    //<
    getMillisecondValues : function () {
        return this.getSubItemValues("millisecond");
    },
    
    //> @attr timeItem.millisecondMinValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.millisecondValues, millisecondValues} is unset, this attribute specifies 
    // the minimum value present in the millisecond picker.
    // <P>Used for specifying a limited set of valid Millisecond values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default is zero in all cases.
    // <P> See also +link{timeItem.millisecondMaxValue, millisecondMaxValue} and 
    // +link{timeItem.millisecondIncrement, millisecondIncrement}.
    // @visibility external
    //<
    millisecondMinValue: null,
    //> @attr timeItem.millisecondMaxValue (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.millisecondValues, millisecondValues} is unset, this attribute specifies 
    // the maximum value present in the millisecond picker.
    // <P>Used for specifying a limited set of valid Millisecond values, or when using the 
    // TimeItem to record duration, rather than time per-se.  The default is 999.
    // <P> See also +link{timeItem.millisecondMinValue, millisecondMinValue} and 
    // +link{timeItem.millisecondIncrement, millisecondIncrement}.
    // @visibility external
    //<
    millisecondMaxValue: null,
    //> @attr timeItem.millisecondIncrement (Number : null : IRW)
    // When +link{timeItem.useTextField,useTextField} is false and 
    // +link{timeItem.millisecondValues, millisecondValues} is unset, this attribute specifies 
    // the increment to use when generating entries for the millisecond picker.  For example, 
    // if this attribute is set to 5, the millisecond picker will contain only every fifth 
    // value between the +link{timeItem.millisecondMinValue, millisecondMinValue} and 
    // +link{timeItem.millisecondMaxValue, millisecondMaxValue}.
    // @visibility external
    //<
    millisecondIncrement: 1,
    getMillisecondMinValue : function () {
        if (this.millisecondMinValue == null) this.millisecondMinValue = 0;
        return this.millisecondMinValue;
    },
    getMillisecondMaxValue : function () {
        if (this.millisecondMaxValue == null) this.millisecondMaxValue = 999;
        return this.millisecondMaxValue;
    },

    getAmpmOptions : function () {
        if (this.ampmValues) return this.ampmValues;
        var values = ["AM", "PM"];
        return values;
    },
    
    // value setters
    
    //> @method timeItem.setHours() (A)
    // Set the hour value of this TimeItem.
    // If the item value has not been initialized with +link{TimeItem.setValue(),setValue()}, 
    // the minute will be established to current minute.
    // <P>
    // You can use +link{TimeItem.setValue(),setValue()} to set both hours and minutes at the same time.
    // <P>
    // <smartgwt>
    // setHours() cannot be called until the item has been added to a DynamicForm and the form has been drawn.
    // </smartgwt>    
    // @param hours (Number) new hours value for this TimeItem.
    // @visibility external
    //<
    setHours : function (hours) {
        if (this.useTextField) {
            var date = this.textField.getValue();
            if(date==null) {
                var now = isc.DateUtil.create();
            	date = isc.DateUtil.createLogicalTime(hours,now.getMinutes(),0);
            } else {
	            date.setHours(hours);
            }
            this.textField.setValue(date);
        } else {
            if (!this.getHourValues().contains(hours)) {
                this.logWarn("setHours: " + hours + " is not a valid option");
            } else {
                this.hourItem.setValue(hours);
            }
        }
    },

    //> @method timeItem.setMinutes() (A)
    // Set the minute value of this TimeItem.
    // If the item value has not been initialized with +link{TimeItem.setValue(),setValue()}, 
    // the hour will be established to current hour.
    // <P>
    // You can use +link{TimeItem.setValue(),setValue()} to set both hours and minutes at the same time.
    // <P>
    // <smartgwt>
    // setMinutes() cannot be called until the item has been added to a DynamicForm and the form has been drawn.
    // </smartgwt>    
    // @param minutes (Number) new minutes value for this TimeItem.
    // @visibility external
    //<
    setMinutes : function (minutes) {
        if (this.useTextField) {
            var date = this.textField.getValue();
            if(date==null) {
                var now = isc.DateUtil.create();
            	date = isc.DateUtil.createLogicalTime(now.getHours(),minutes,0);
            } else {
	            date.setMinutes(minutes);
            }
            this.textField.setValue(date);
        } else {
            if (!this.getMinuteValues().contains(minutes)) {
                this.logWarn("setMinutes: " + minutes + " is not a valid option");
            } else {
                this.minuteItem.setValue(minutes);
            }
        }
    },

    //> @method timeItem.setSeconds() (A)
    // Set the seconds value of this TimeItem.
    // @param seconds (Number) new seconds value for this TimeItem.
    // @visibility external
    //<
    setSeconds : function (seconds) {
        if (this.useTextField) {
            var date = this.textField.getValue();
            date.setSeconds(seconds);
            this.textField.setValue(date);
        } else {
            if (!this.getSecondValues().contains(seconds)) {
                this.logWarn("setSeconds: " + seconds + " is not a valid option");
            } else {
                this.secondItem.setValue(seconds);
            }
        }
    },

    //> @method timeItem.setMilliseconds() (A)
    // Set the milliseconds value of this TimeItem.
    // @param milliseconds (Number) new milliseconds value for this TimeItem.
    // @visibility external
    //<
    setMilliseconds : function (milliseconds) {
        if (this.useTextField) {
            var date = this.textField.getValue();
            date.setMilliseconds(milliseconds);
            this.textField.setValue(date);
        } else {
            if (!this.getMillisecondValues().contains(milliseconds)) {
                this.logWarn("setMilliseconds: " + milliseconds + " is not a valid option");
            } else {
                this.millisecondItem.setValue(milliseconds);
            }
        }
    },

    // this is just the order in which the various fields should be displayed - use the 
    // autoChild pattern (show[AutoChildName]) to control visibility of fields...
    selectorFormat: "HMSL",
    getSelectorFormat : function () {
        return this.selectorFormat;
    },

    //> @method timeItem.getDuration() (A)
    // When +link{timeItem.useTextField, useTextField} is set to false, this method 
    // returns the value of the time expressed as a duration in the +link{TimeUnit, timeUnit}
    // provided.  If no timeUnit is passed, the default is the smallest unit for which a 
    // picker is visible.
    // @param [timeUnit] (TimeUnit) the unit of the return value
    // @return (int) the item's value, expressed as a duration in the TimeUnit passed
    // @visibility external
    //<
    getDuration : function (timeUnit) {
        timeUnit = timeUnit || this.getDefaultDurationTimeUnit();
        
        var value = this.getValue();
        if (!isc.isA.Date(value)) return null;
        
        var hours = value.getHours(),
            minutes = value.getMinutes(),
            seconds = value.getSeconds(),
            milliseconds = value.getMilliseconds(),
            duration = (hours*60*60*1000)+(minutes*60*1000)+(seconds*1000)+milliseconds
        ;

        if (timeUnit == "second") return duration/1000;
        else if (timeUnit == "minute") return duration/1000/60;
        else if (timeUnit == "hour") return duration/1000/60/60;
        else return duration;
    },
    getDefaultDurationTimeUnit : function () {
        if (this.millisecondItem && this.millisecondItem.isVisible()) return "millisecond";
        if (this.secondItem && this.secondItem.isVisible()) return "second";
        if (this.minuteItem && this.minuteItem.isVisible()) return "minute";
        if (this.hourItem && this.hourItem.isVisible()) return "hour";
    },

    setItems : function (itemList) {
        var TI = isc.TimeItem,
            format = this.getSelectorFormat()
        ;

        if (itemList != null && itemList.length != 0) {
            this.logWarn("setItems() called for timeItem with itemList:" + itemList + 
                            " - ignoring, and making use of default date fields");
        }

        // create a new itemList
        itemList = this.items = [];      
        
        
        if (this.useTextField) {
            // Setup properties that are being merged from the date item into the text field
            var mergeProperties = {
                textAlign: this.textAlign,
                showInlineStyle:this.showInlineStyle,
                inlineStyleSuffix:this.inlineStyleSuffix,
                emptyDisplayValue: this.emptyDisplayValue,
                invalidTimeStringMessage: this.invalidTimeStringMessage,
                operator: this.operator,
                title: this.title,
                allowEmptyValue: this.allowEmptyValue,
                // text field is of type "time" and expects to deal with JS Date objects
                // Call "getDefaultValue()" on the parent - this automatically handles
                // parsing default values specified as a time-string to a real logical time
                // object.
                getDefaultValue:function () {
                    return this.parentItem.getDefaultValue();
                },
                validateOnChange: this.validateOnChange,
                validators: this.validators,
                type: this.type,
                parentItem: this
            };

            if (this.textBoxStyle != null) mergeProperties.textBoxStyle = this.textBoxStyle;

            var fieldProps = isc.addProperties({}, this.textFieldDefaults, TI.TEXT_FIELD,
                    this.textFieldProperties);

            // pass selectOnClick/Focus through to the textField
            if (fieldProps.selectOnClick == null) fieldProps.selectOnClick = this.selectOnClick;
            if (fieldProps.selectOnFocus == null) fieldProps.selectOnFocus = this.selectOnFocus;

            var maskProperties;
            if (this._useNativeTimeInput()) {
                maskProperties = {
                    textAlign: this.isRTL() ? isc.Canvas.RIGHT : isc.Canvas.LEFT,
                    editorType: isc.NativeTimeItem,
                    browserInputType: this.getBrowserInputType()
                };
            } else {
                maskProperties = {
                    type:"time",
                    editorType:isc.TextItem,
                    useMask:this.useMask,
                    formatterMap:this.formatterMap,
                    _getTimeFormatter : function () {
                        return this.parentItem._getTimeFormatter()
                    },
                    getDisplayValue : function (value) {
                        return this.parentItem.getDisplayValue(value)
                    }
                };
                if (this.useMask) {
                    var timeFormatter = this._getTimeFormatter(),
                        map = this.formatterMap[timeFormatter];
                    if (map == null) {
                        maskProperties.useMask = false;
                        maskProperties.mask = null;
                        this.logWarn("Mask will not be used because timeFormatter " + timeFormatter +
                                     " is not recognized");
                    } else {
                        // Map formatter to padded version if needed
                        if (map.formatter) this.timeFormatter = map.formatter;
                        maskProperties.mask = map.mask;
                    }
                    if (maskProperties.mask) {
                        maskProperties.maskSaveLiterals = true;
                        // support maskOverwriteMode being set via textFieldProperties
                        if (fieldProps.maskOverwriteMode == null) fieldProps.maskOverwriteMode = true;
                    }
                } else {
                    // Make sure user doesn't try to assign a custom mask
                    maskProperties.mask = null;
                }
            }

            if (this.format) maskProperties.format = this.format;

            var textField = isc.addProperties({}, mergeProperties, fieldProps, maskProperties );
            
            // Ensure no one overrode the name of the dtf!
            textField.name = "timeTextField";
            // If we have a specified height, expand the text box to fill the available space
            
            if (this.height && (!this.textFieldProperties || !this.textFieldProperties.height)) 
            {
                textField.height = this.getTextBoxHeight();
            }

            // If custom parser or formatter exists, have the text field call through to it
            
            // Exception - for a native "time" type input, skip this. The user is already
            // restricted to time-formatted entries, and we've already converted these
            // to a logical time (JS date). Seems like there's no room for a custom
            // parser/formatter here.
            if (!this._useNativeTimeInput()) {
                if (this.parseEditorValue) {
                    textField.parseEditorValue = 
                        function innerTimeTextItem_parseEditorValue (value, form, item) {
                            var time = this.parentItem.parseEditorValue(value, form,
                                             this.parentItem);
                            // Technically a custom parser would be expected to return
                            // a logical time object.
                            // However, also handle the case where they just return the 
                            // value unchanged (a String) and parse it explicitly
                            if (time != null && !isc.isA.Date(time)) {
                                var stringVal = time;
                                time = isc.Time.parseInput(time, true);
                                // If the string couldn't be parsed to a time, retain it
                                // as a string value.
                                if (time == null) time = stringVal;
                            }
                            return time;
                        };
                }

                if (this.formatEditorValue) {
                    textField.formatEditorValue = 
                        function innerTimeTextItem_formatEditorValue (value, record, form, item) {
                            var displayVal = this.parentItem.formatEditorValue(value, record, form, this.parentItem);
                            if (isc.isA.Date(displayVal)) {
                                
                                displayVal = isc.Time.format(displayVal, this._getTimeFormatter());
                            }
                            return displayVal;
                        };
                }
            }
            
            itemList.add(textField);
    
            //>EditMode for dynamically changing useTextField
            
            var undef;
            this.hourItem = this.minuteItem = this.secondItem = this.millisecondItem = this.ampmItem = undef;
            //<EditMode
        
        } else {
            
            
            var baseStyleName = isc.SelectItem.getInstanceProperty("textBoxStyle"),
                // get the extra width to add to the render-width of the widest valueMap entry
                extraWidth = isc.SelectItem.getInstanceProperty("pickerIconWidth") +
                    isc.Element._getLeftMargin(baseStyleName) +
                    isc.Element._getRightMargin(baseStyleName) +
                    isc.Element._getHBorderPad(baseStyleName) +
                    4 // this last is necessary because there is no right-padding 
            ;

            // iterate through the characters of the format
            for (var i = 0; i < format.length; i++) {
                var field = format.charAt(i);
                // assigning the selector for that format to the itemList
                var item = null;

                if (field == "H" && this.showHourItem != false) {
                    item = isc.addProperties({title: this.hourItemTitle,
                                titleStyle: this.titleStyle,
                                prompt: this.hourItemPrompt}, 
                                this.hourItemDefaults, TI.HOUR_ITEM, 
                                this.hourItemProperties, {name: "hourItem"}
                    );
                    if (!item.width) {
                        // make the field wide enough to fully contain any of the values
                        if (this._hourItemWidth == null) {
                            var valueHTML = this.getHourValues().join("<br>");
                            this._hourItemWidth = isc.Canvas.measureContent(valueHTML, 
                                item.styleName || baseStyleName) + extraWidth;
                        }
                        item.width = this._hourItemWidth;
                        item.minWidth = this._hourItemWidth;
                    }
                } else if (field == "M" && this.showMinuteItem != false) {
                    item = isc.addProperties({title: this.minuteItemTitle,
                                titleStyle: this.titleStyle,
                                prompt: this.minuteItemPrompt}, 
                                this.minuteItemDefaults, TI.MINUTE_ITEM, 
                                this.minuteItemProperties, {name: "minuteItem"}
                    );
                    if (!item.width) {
                        // make the field wide enough to fully contain any of the values
                        if (this._minuteItemWidth == null) {
                            var valueHTML = this.getMinuteValues().join("<br>");
                            this._minuteItemWidth = isc.Canvas.measureContent(valueHTML, 
                                item.styleName || baseStyleName) + extraWidth;
                        }
                        item.width = this._minuteItemWidth;
                        item.minWidth = this._minuteItemWidth;
                    }
                } else if (field == "S" && this.showSecondItem != false) {
                    item = isc.addProperties({title: this.secondItemTitle,
                                titleStyle: this.titleStyle,
                                prompt: this.secondItemPrompt }, 
                                this.secondItemDefaults, TI.SECOND_ITEM, 
                                this.secondItemProperties, {name: "secondItem"}
                    );
                    if (!item.width) {
                        // make the field wide enough to fully contain any of the values
                        if (this._secondItemWidth == null) {
                            var valueHTML = this.getSecondValues().join("<br>");
                            this._secondItemWidth = isc.Canvas.measureContent(valueHTML, 
                                item.styleName || baseStyleName) + extraWidth;
                        }
                        item.width = this._secondItemWidth;
                        item.minWidth = this._secondItemWidth;
                    }
                } else if ((field == "L" || field == "m") && this.showMillisecondItem != false) {
                    item = isc.addProperties({ title: this.millisecondItemTitle, 
                                titleStyle: this.titleStyle,
                                prompt: this.millisecondItemPrompt }, 
                                this.millisecondItemDefaults, TI.MILLISECOND_ITEM, 
                                this.millisecondItemProperties, {name: "millisecondItem"}
                    );
                    if (!item.width) {
                        // make the field wide enough to fully contain any of the values
                        if (this._millisecondItemWidth == null) {
                            var valueHTML = this.getMillisecondValues().join("<br>");
                            this._millisecondItemWidth = isc.Canvas.measureContent(valueHTML, 
                                item.styleName || baseStyleName) + extraWidth;
                        }
                        item.width = this._millisecondItemWidth;
                        item.minWidth = this._millisecondItemWidth;
                    }
                }


                if (item) {
                    // Leave a gap between items via left-padding
                    
                    if (i > 0) {
                        if (item.cssText == null) {
                            item.cssText = "padding-left:3px;";
                        }
                    }
                    itemList.add(item);
                }
            }
            
            // show the AM/PM picker as appropriate
            if (!this.showing24HourTime()) {
                item = isc.addProperties({title: this.ampmItemTitle}, 
                        this.ampmItemDefaults, TI.AMPM_SELECTOR, 
                        this.ampmItemProperties, {name: "ampmItem"});

                if (!item.width) {
                    // make the am/pm field wide enough to fully contain any of the values
                    if (this._ampmItemWidth == null) {
                        var valueHTML = this.getAmpmOptions().join("<br>");
                        this._ampmItemWidth = isc.Canvas.measureContent(valueHTML, 
                            item.styleName || baseStyleName) + extraWidth;
                    }
                    item.width = this._ampmItemWidth;
                    item.minWidth = this._ampmItemWidth;
                }
                
                if (item.cssText == null) {
                    item.cssText = "padding-left:3px;";
                }

                itemList.add(item);
            }
        }

        // call the superclass routine to properly set the items
        this.Super("setItems", [itemList], arguments);

        if (this._getShowPending()) this._updatePendingStatuses();

        
        if (this.useTextField) {
            this.textField = this.timeTextField;
        }
    }
});


isc.TimeItem.addMethods({

    //> @method timeItem.pendingStatusChanged()
    // Notification method called when +link{FormItem.showPending,showPending} is enabled and
    // this time item should either clear or show its pending visual state.
    // <p>
    // The default behavior is that the +link{FormItem.titleStyle,titleStyle} and
    // +link{FormItem.cellStyle,cellStyle} are updated to include/exclude the "Pending" suffix.
    // In addition, when displayed in the pending state:
    // <ul>
    // <li>If +link{attr:useTextField,useTextField} is <code>true</code>, then the "Pending"
    //     suffix will be appended to the +link{FormItem.textBoxStyle,textBoxStyle} applied to the
    //     +link{attr:textField,textField}; otherwise
    // <li>(<code>useTextField</code> is <code>false</code>) the color of the
    //     +link{attr:hourItem,hourItem}, +link{attr:minuteItem,minuteItem},
    //     +link{attr:secondItem,secondItem}, +link{attr:millisecondItem,millisecondItem},
    //     and/or +link{attr:ampmItem,ampmItem} will change when the hour, minute, second,
    //     millisecond, or whether the time is AM or PM is different, respectively.
    // </ul>
    // Returning <code>false</code> will cancel this default behavior.
    // @include FormItem.pendingStatusChanged()
    //<
    _updatePendingStatuses : function () {
        var pendingStatus = this._getShowPending() && this.pendingStatus;

        if (this.useTextField) {
            var textField = this.textField;
            if (textField != null) textField.setFixedPendingStatus(pendingStatus);
        } else {
            var oldValue = this._getOldValue(),
                oldLogicalTime;
            if (!isc.isA.Date(oldValue)) oldLogicalTime = null;
            else if (oldValue.logicalTime) oldLogicalTime = oldValue;
            else oldLogicalTime = isc.DateUtil.getLogicalTimeOnly(oldValue);

            var newValue = this._value,
                newLogicalTime;
            if (!isc.isA.Date(newValue)) newLogicalTime = null;
            else {
                newLogicalTime = newValue;
                
            }

            var hourItem = this.hourItem;
            if (hourItem != null) {
                if (!pendingStatus) {
                    hourItem.setFixedPendingStatus(false);
                } else if (oldLogicalTime == null || newLogicalTime == null) {
                    hourItem.setFixedPendingStatus(true);
                } else {
                    var oldHours = oldLogicalTime.getHours(),
                        newHours = newLogicalTime.getHours();
                    if (!this.showing24HourTime()) {
                        oldHours = oldHours % 12;
                        newHours = newHours % 12;
                    }
                    hourItem.setFixedPendingStatus(oldHours != newHours);
                }
            }

            var minuteItem = this.minuteItem;
            if (minuteItem != null) {
                minuteItem.setFixedPendingStatus(pendingStatus &&
                                                 (oldLogicalTime == null ||
                                                  newLogicalTime == null ||
                                                  oldLogicalTime.getMinutes() != newLogicalTime.getMinutes()));
            }

            var secondItem = this.secondItem;
            if (secondItem != null) {
                secondItem.setFixedPendingStatus(pendingStatus &&
                                                 (oldLogicalTime == null ||
                                                  newLogicalTime == null ||
                                                  oldLogicalTime.getSeconds() != newLogicalTime.getSeconds()));
            }

            var millisecondItem = this.millisecondItem;
            if (millisecondItem != null) {
                millisecondItem.setFixedPendingStatus(pendingStatus &&
                                                      (oldLogicalTime == null ||
                                                       newLogicalTime == null ||
                                                       oldLogicalTime.getMilliseconds() != newLogicalTime.getMilliseconds()));
            }
     
            var ampmItem = this.ampmItem;
            if (ampmItem != null) {
                ampmItem.setFixedPendingStatus(pendingStatus &&
                                               (oldLogicalTime == null ||
                                                newLogicalTime == null ||
                                                (oldLogicalTime.getHours() < 12) != (newLogicalTime.getHours() < 12)));
            }
        }
    },

    _shouldAllowExpressions : function () {
        // Value expressions cannot be entered unless using a text field.
        if (!this.useTextField) return false;

        // Turn on value expressions support by default because it is able to handle plain values
        // in a more human-friendly way. For example, if the user types "11:59", then values where
        // the seconds are not zero are included if value expressions are allowed.
        return (this.allowExpressions != false);
    },

    // default to equals if this.operator is unset, rather than being sensitive to textMatchStyle
    getOperator : function (textMatchStyle) {
        if (!this.operator) return "equals";
        return this.operator;
    },

    _getShowHintInField : function () {
        return !!(this._mayShowHintInField() && this.hint);
    },
    _mayShowHintInField : function () {
        return !!(this.useTextField && this.showHint && this.__mayShowHintInField());
    },

    short24TimeFormat:"HH:MM",
    shortTimeFormat:"HH:MM [am|pm]",
    long24TimeFormat:"HH:MM:SS",
    longTimeFormat:"HH:MM:SS [am|pm]",
    full24TimeFormat:"HH:MM:SS.lll",
    fullTimeFormat:"HH:MM:SS.lll [am|pm]",
    //>@method timeItem.getHint()
    // If <code>this.hint</code> is specified, display it as a hint. Otherwise a string display 
    // the format of the time string, based on <code>this.timeFormatter</code>.
    // Developer may set a <code>hint</code> value or override this method to show a different
    // hint value.
    //<
    getHint : function () {
        if (!this.showHint || this._getShowHintInField()) return null;
        if (this.hint != null) return this.hint;
        return this.getDefaultHint();
    },

    getDefaultHint : function () {
        if (!this.useTextField) return null;
        var formatter = this._getTimeFormatter();
        switch (formatter) {
            case "to24HourTime":
            case "toPadded24HourTime":
                return this.long24TimeFormat;
            case "toTime":
            case "toPaddedTime":
                return this.longTimeFormat;
            case "toShort24HourTime":
            case "toShortPadded24HourTime":
                return this.short24TimeFormat;
            case "toShortTime":
            case "toShortPaddedTime":
                return this.shortTimeFormat;
            case "toFullTime":
            case "toFullPaddedTime":
                return this.fullTimeFormat;
        }
        return null;
    },

    _$time: "time",
    _useNativeTimeInput : function () {
        return this.useTextField && this.getBrowserInputType() == this._$time;
    },

	//>	@method	timeItem.getDefaultValue()	(A)
    //  If no default value is set for this item, and <code>this.allowEmptyValue</code> is false
    //  this method will create a default time value based on TimeItem.DEFAULT_TIME.
	// @group defaults
	// @return (Time) default Time value
	//<
    getDefaultValue : function () {
        var defaultValue = this.defaultValue;
        if (!defaultValue && !this.allowEmptyValue) defaultValue = isc.TimeItem.DEFAULT_TIME;
        if (defaultValue && !isc.isA.Date(defaultValue)) 
            defaultValue = isc.Time.parseInput(defaultValue);  

        return defaultValue;
	},

    getCriteriaValue : function () {
        // Have to 'getElementValue' to pick up the underlying text value
        // (including the expression)
        if (this._shouldAllowExpressions()) return this.textField.getElementValue();
        
        var value = this.getValue();
        if (value == null || isc.is.emptyString(value)) return null;
        if (!isc.isA.Date(value)) value = isc.Time.parseInput(String(value));
        return value;
    },

    // Override getCriterion() to return a betweenInclusive `Criterion' to ignore the seconds
    // and milliseconds unless the textMatchStyle is "exact".
    
    getCriterion : function (textMatchStyle) {
        var crit,
            operator = this.getOperator(textMatchStyle, isc.isAn.Array(value)),
            fieldName = this.getCriteriaFieldName();
        var value = this.getCriteriaValue();

        if (value == null || isc.is.emptyString(value)) return;

        if (this._shouldAllowExpressions()) {
            crit = this.parseValueExpressions(value, fieldName, operator);
            if (crit != null) {
                // We need to make sure that if the user enters the expression "==11:59pm" or
                // "11:59pm", then time values with non-zero seconds will still be included.
                // If the `Criterion' operator is "equals", then fall through to the code that
                // constructs a "betweenInclusive" advanced criteria.
                if ("equals" != crit.operator) {
                    return crit;
                }
                // Use the parsed value for the case where the expression is "==...". The
                // parsed value is the sought-after `Date' whereas `value' is the expression
                // string, which will fail to be parsed by Time.parseInput().
                value = crit.value;
            }
        }

        if (isc.isA.String(value)) {
            value = isc.Time.parseInput(value);
        }

        if (isc.isA.Date(value) && "exact" != textMatchStyle) {
            // assert value.logicalTime;
            crit = {
                _constructor: "AdvancedCriteria",
                fieldName: fieldName,
                operator: "betweenInclusive",
                start: isc.Time.createLogicalTime(value.getHours(), value.getMinutes(), 0, 0),
                end: isc.Time.createLogicalTime(value.getHours(), value.getMinutes(), 59, 999),
                value: value
            };
            return crit;
        }

        crit = {
            fieldName: fieldName,
            operator: operator, 
            value: value
        };
        return crit;
    },

    canEditCriterion : function (criterion, warnOnField) {
        if (criterion.fieldName != null && criterion.fieldName == this.getCriteriaFieldName() &&
            isc.isA.Date(criterion.value))
        {
            return true;
        }
        return this.Super("canEditCriterion", arguments);
    },

    _formatCriterionValue : function (value) {
        return this.mapValueToDisplay(value);
    },

    // Override updateValue to verify that the contents of the element(s) make a valid time.
    updateValue : function () {
        // _suppressUpdates flag set when we're in the process of setting our sub items' values
        // to represent a known, valid date.
        
        if (this._suppressUpdates) return;

        // We're likely to manipulate the values of the form items as this method runs - avoid
        // re-running updateValue in response to 'saveValue()' on the sub items.
        this._suppressUpdates = true;

        var date;
        if (this.useTextField) {
            // Note: this method is called from "saveValue()" on the sub-items (after saving out 
            // their values) so typically the sub item values will be up to date.
            // However this method may also be called externally while the text item is pending
            // an update (from blur [or keypress]).
            // Call updateValue() to ensure the text field value matches the current element
            // value for that field.
            
            this.timeTextField.updateValue();

            
            date = this.timeTextField.getValue();
            if (date == isc.emptyString) date = null;

        } else {
            var hour, min, sec, ms;

            if (this.hourItem != null) {
                hour = +this.hourItem.getValue();
            }
            if (this.minuteItem != null) {
                min = +this.minuteItem.getValue();
            }
            if (this.secondItem != null) {
                sec = +this.secondItem.getValue();
            }
            if (this.millisecondItem != null) {
                ms = +this.millisecondItem.getValue();
            }
            if (this.ampmItem != null) {
                // if it's PM and hour < 12, add 12 to hour - if it's AM, and hour is 12, make it 0
                var ampmValue = this.ampmItem.getValue(),
                    valueMap = this.getAmpmOptions()
                ;
                
                if (ampmValue == valueMap[1] && hour < 12) hour += 12;
                else if (ampmValue == valueMap[0] && hour == 12) hour = 0;
            }

            date = isc.DateUtil.createLogicalTime(hour, min, sec, ms);
        }
        delete this._suppressUpdates;

        return this.storeValue(date);
        
    },

    saveValue : function (value) {
        var returnVal =  this.Super("saveValue", arguments);
        if (this._getShowPending()) this._updatePendingStatuses();
        return returnVal;
    },

    // Override getItemValue - for inactiveEditorHTML we may be writing out
    // a value that doesn't match this.value [for example editors in random rows
    // when alwaysShowEditors is true for a grid]
    getItemValue : function (item, values) {
        // values object passed in is the value of the containerItem (the TimeItem)
        if (this.isInactiveHTML()) {
            if (item == this.textField) {
                return values;
            } else if (isc.isA.Date(values)) {

                switch (item) {
                    case this.millisecondItem :
                        return values.getMilliseconds();

                    case this.secondItem :
                        return values.getSeconds();

                    case this.minuteItem : 
                        return values.getMinutes();

                    case this.hourItem : 
                        var hours = values.getHours();
                        if (!this.showing24HourTime()) {
                            if (hours > 11) hours -= 12;
                            if (hours == 0) hours = 12;
                        }
                        return hours;
                }
            }
        }
        return this.Super("getItemValue", arguments);
    },

    //> @method timeItem.setValue()
    // @include formItem.setValue()
    //<
    // Override setValue() - if passed a string, map it to the appropriate date before saving
    // (this is required since the string passed in won't go through 'mapDisplayToValue')
    setValue : function (value) {
        var newValue = value,
            undef;
        if (isc.isA.String(newValue)) {
            var timeVal = isc.Time.parseInput(newValue, true);
            // If it doesn't parse to a meaningful time, keep it as a string - may be
            // an expression or similar.
            if (isc.isA.Date(timeVal)) newValue = timeVal;
        } else if (value === undef && !this.useTextField) {
            newValue = this.getDefaultValue();
            if (newValue === undef) newValue = isc.Time.parseInput(isc.TimeItem.DEFAULT_TIME);
        }

        if (this.useTextField) {
            this.textField.setValue(newValue);
        } else if (isc.isA.Date(newValue)) {
            // setup the various SelectItems for the time-parts
            var hours = newValue.getHours(),
                minutes = newValue.getMinutes(),
                seconds = newValue.getSeconds()
            ;
            if (!this.showing24HourTime()) {
                if (hours > 11) hours -= 12;
                if (hours == 0) hours = 12;
            }
            if (hours < 10) hours = isc.NumberUtil.stringify(hours, 2);
            if (this.hourItem) this.hourItem.setValue(hours);
            if (minutes < 10) minutes = isc.NumberUtil.stringify(minutes, 2);
            if (this.minuteItem) this.minuteItem.setValue(minutes);
            if (seconds < 10) seconds = isc.NumberUtil.stringify(seconds, 2);
            if (this.secondItem) this.secondItem.setValue(seconds);
            if (this.millisecondItem) this.millisecondItem.setValue(newValue.getMilliseconds());
            var item = this.ampmItem,
                valueMap = this.getAmpmOptions()
            ;
            if (item) item.setValue(newValue.getHours() > 11 ? valueMap[1] : valueMap[0]);
        }

        return this.Super("setValue", [newValue], arguments);
    },

    getValue : function () {
        if (this.useTextField) {
            var value = this.textField.getValue();
            var date = isc.Time.parseInput(String(value), true);
            if (date != null) value = date;
            return value;
        }

        var h = this.hourItem ? +this.hourItem.getValue() : 0,
            m = this.minuteItem ? +this.minuteItem.getValue() : 0,
            s = this.secondItem ? +this.secondItem.getValue() : 0,
            ms = this.millisecondItem ? +this.millisecondItem.getValue() : 0
        ;

        var item = this.ampmItem;
        if (item != null) {
            // if it's PM and h < 12, add 12 to h - if it's AM, and h is 12, make it 0
            var ampmValue = item.getValue(),
                valueMap = this.getAmpmOptions()
            ;
            
            if (ampmValue == valueMap[1] && h < 12) h += 12;
            else if (ampmValue == valueMap[0] && h == 12) h = 0;
        }

        return isc.DateUtil.createLogicalTime(h, m, s, ms);
    },
    
    //> @method timeItem.getEnteredValue()
    // Returns the raw text value typed into this items text field if +link{timeItem.useTextField} 
    // is true (otherwise returns the result of this.getValue()).
    // @return (String) value the user entered
    // @visibility external
    //<
    getEnteredValue : function () {
        if (this.useTextField && this.textField != null) {
            return this.textField.getEnteredValue();
        }
        return this.getValue();
    },

    // Override compareValues - we want to compare date values as times
    compareValues : function (value1, value2) {
        if (value1 == value2) return true;
        if (isc.isA.Date(value1) && isc.isA.Date(value2) && 
             isc.Time.compareTimes(value1, value2)) return true;
            
        return false;
    },

    formatterMap: {
        toTime:{mask:"[0-1]#:[0-6]#:[0-6]# [ap]m", formatter:"toPaddedTime"},
        to24HourTime:{mask:"[0-2]#:[0-6]#:[0-6]#", formatter:"toPadded24HourTime"},

        toPaddedTime:{mask:"[0-1]#:[0-6]#:[0-6]# [ap]m"},
        toPadded24HourTime:{mask:"[0-2]#:[0-6]#:[0-6]#"},
        
        toShortTime:{mask:"[0-1]#:[0-6]# [ap]m", formatter:"toShortPaddedTime"},
        toShort24HourTime:{mask:"[0-2]#:[0-6]#", formatter:"toShortPadded24HourTime"},

        toShortPaddedTime:{mask:"[0-1]#:[0-6]# [ap]m"},
        toShortPadded24HourTime:{mask:"[0-2]#:[0-6]#"}
    },
    
    init : function () {
        if (this.use24HourTime == null) this.use24HourTime = isc.Time.use24HourTime;
        this.Super("init", arguments);
    },
    
    _getTimeFormatter : function () {
        var format = this.timeFormatter;
        if (format == null) {
            format = this.use24HourTime ? this.timeFormatter24Hour : this.timeFormatter12Hour;
        }
        if (format == null && 
            this.displayFormat != null && isc.SimpleType.inheritsFrom(this.type, "time")) 
        {
            format = this.displayFormat;
        } else {
            if (format == null) format = this.form.timeFormatter;
        }
        // May still be null, in which case system-wide "toTime" [normal formatter]
        // will be used.
        return format;
    },
    
    
    _formatAsTime : function () {
        return true;
    },

    
    _canFocus : function () {
        if (this.canFocus != null) return this.canFocus;
        return true;
    },
    
    // Override focusInItem to focus in the appropriate sub-item
    focusInItem : function () {
        if (!this.isVisible()) return;

        if (this.useTextField) {
            if (this.textField) this.textField.focusInItem();
        } else {
            var format = this.getSelectorFormat(),
                // Format will be "DMY" / "YMD" / "MDY" / etc.
                // (Parse the string rather than comparing with the DateItem.DAY_MONTH_YEAR class 
                // constants - it's slower but will support the user specifying just "MY" or something)
                firstSelector = format.charAt(0)
            ;

            if (firstSelector == "H" && this.hourItem) this.hourItem.focusInItem();
            if (firstSelector == "M" && this.minuteItem) this.minuteItem.focusInItem();
            if (firstSelector == "S" && this.secondItem) this.secondItem.focusInItem();
            if (firstSelector == "L" && this.millisecondItem) this.millisecondItem.focusInItem();
        }
        // If it couldn't find the appropriate sub-item, this method is a no-op        
    },
    
    // override get/setSelectionRange - if we're showing a text field, call through to the
    // methods on that sub-item
    
    //> @method timeItem.setSelectionRange()
    // If +link{timeItem.useTextField} is true, falls through to standard
    // +link{textItem.setSelectionRange(),setSelectionRange} implementation on this items freeform text entry field.
    // Otherwise has no effect.
    // @param start (int) character index for start of new selection
    // @param end (int) character index for end of new selection
    // @visibility external
    //<
    setSelectionRange : function (start,end) {
        if (this.textField) return this.textField.setSelectionRange(start,end);
    },

    //> @method timeItem.getSelectionRange()
    // If +link{timeItem.useTextField} is true, falls through to standard
    // +link{textItem.getSelectionRange(),getSelectionRange} implementation on this items freeform text entry field.
    // Otherwise has no effect.
    // @return (Array) 2 element array indicating start/end character index of current selection
    //  within our text entry field. Returns null if this item is undrawn or doesn't have focus.
    // @visibility external
    //<
    getSelectionRange : function () {
        if (this.textField) return this.textField.getSelectionRange();
    },
    
    //> @method timeItem.selectValue()
    // If +link{timeItem.useTextField} is true, falls through to standard
    // +link{textItem.selectValue(),selectValue()} implementation on this items freeform text entry field.
    // Otherwise has no effect.
    // @visibility external
    //<
    selectValue : function () {
        if (this.textField) return this.textField.selectValue();
    },
    
    //> @method timeItem.deselectValue()
    // If +link{timeItem.useTextField} is true, falls through to standard
    // +link{textItem.deselectValue(),deselectValue()} implementation on this items freeform text entry field.
    // Otherwise has no effect.
    // @param [start] (Boolean) If this parameter is passed, new cursor insertion position will be
    //   moved to the start, rather than the end of this item's value.
    // @visibility external
    //<
    deselectValue : function (start) {
        if (this.textField) return this.textField.deselectValue()
    },
    
    setHint : function (hintText) {
        if (this.useTextField && this.showHintInField) {
            this.textField.setHint(hintText);
        } else {
            this.Super("setHint", arguments); 
        }
    },

    validators: [
        { type: "isTime" }
    ]

});


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
// Class will not work without the ListGrid
if (isc.ListGrid) {





//> @class DateRangeItem
// Allows a user to select an absolute or relative range of dates via two
// +link{RelativeDateItem}s (if +link{DateRangeItem.allowRelativeDates} is true) or two
// +link{DateItem,DateItems}.
// <P>
// The item's +link{formItem.type, data type} is expected to be one of "date" or "datetime" and
// dictates whether the dates in the range include a time portion.  If unset and the item's 
// form is databound, the data type is detected from the associated 
// +link{DataSourceField, dataSource field}.  If there is no such field, or the form is not 
// databound, the default data type value is "date".
// <P>
// DateRangeItem is just a convenience relative to using two +link{RelativeDateItem} or
// +link{DateItem} controls in a form, then using +link{FormItem.operator} and
// +link{FormItem.criteriaField} to cause them to produce a date range.  If you need more
// control over layout, validation, event handling or any other aspect of appearance or
// behavior, stop using DateRangeItem and use two DateItem/RelativeDateItem controls directly
// instead.
// 
// @inheritsFrom CanvasItem
// @visibility external
//<
isc.defineClass("DateRangeItem", "CanvasItem");

isc.DateRangeItem.addProperties({
//> @type DateFieldLayout
// The direction in which an item should lay out it's fields.
// @value "horizontal" fields are placed horizontally
// @value "vertical" fields are placed vertically
// @visibility external
//<

//> @attr dateRangeItem.fieldLayout (DateFieldLayout : "vertical" : IR)
// Controls the placement of the +link{toField} and +link{fromField} in the 
// +link{dateRangeForm}.
// <P>
// Note that we don't recommend "horizontal" placement for mobile, and we also don't recommend 
// it for +link{allowRelativeDates} mode, since +link{RelativeDateItem} changes width 
// drastically during editing, which causes a lot of unpleasant side-to-side shifting of 
// controls.
// @visibility external
//<
fieldLayout: "vertical",

defaultType: "date",

//> @attr dateRangeItem.shouldSaveValue (Boolean : true : IR)
// Allow dateRangeItems' values to show up in the form's values array, or if 
// +link{dynamicForm.getValuesAsCriteria()} is called, for the criterion to be included
// in the returned AdvancedCriteria object
// @visibility external
//<
shouldSaveValue:true,

//> @object DateRange
// A JavaScript object specifying a range of dates.  Values are +link{dateRange.start, start}
// and +link{dateRange.end, end}.  If either value is omitted, the range is assumed to be
// open-ended in that direction - so if dateRange.start is omitted, the range will include any
// date earlier than the value specified in dateRange.end.
// 
// @treeLocation Client Reference/System
// @visibility external
//<

//> @attr dateRange.start (RelativeDate | Date : null : IR)
// The start of this DateRange.
// @visibility external
//<

//> @attr dateRange.end (RelativeDate | Date : null : IR)
// The end of this DateRange.
// @visibility external
//<

//> @attr dateRangeItem.fromTitle (String : "From" : IR)
// The title for the +link{dateRangeItem.fromField, from} part of the range.
// @visibility external
// @group i18nMessages
//<
fromTitle: "From",

//> @attr dateRangeItem.toTitle (String : "To" : IR)
// The title for the +link{dateRangeItem.toField, to} part of the range.
// @visibility external
// @group i18nMessages
//<
toTitle: "To",

//> @attr dateRangeItem.innerTitleOrientation (TitleOrientation : null : IR)
// The title orientation for the to / from sub-items. If unset this will be derived from
// +link{FormItem.titleOrientation,this.titleOrientation} or 
// +link{DynamicForm.titleOrientation,this.form.titleOrientation}.
// @visibility external
//<
//innerTitleOrientation:null,

//> @attr dateRangeItem.allowRelativeDates (Boolean : false : IR)
// Whether to allow the user to specify relative dates (via +link{RelativeDateItem}s) or whether
// dates are absolute (via +link{DateItem}s).
// @visibility external
//<
allowRelativeDates: false,

//> @attr dateRangeItem.fromField (AutoChild FormItem : null : IR)
// The field for the "from" date - a +link{RelativeDateItem} or +link{DateItem} according to
// +link{allowRelativeDates}.
// @visibility external
//<

//> @attr dateRangeItem.fromFieldProperties (FormItem Properties: null : IR)
// Additional property-block to customize the +link{dateRangeItem.fromField, fromField} 
// AutoChild.
// @visibility internal
//<

//> @attr dateRangeItem.toField (AutoChild FormItem : null : IR)
// The field for the "to" date - a +link{RelativeDateItem} or +link{DateItem} according to
// +link{allowRelativeDates}.
// @visibility external
//<

//> @attr dateRangeItem.toFieldProperties (FormItem Properties: null : IR)
// Additional property-block to customize the +link{dateRangeItem.toField, toField} 
// AutoChild.
// @visibility internal
//<

//> @attr dateRangeItem.fromDate (Date | RelativeDateString | TimeUnit : today : IRW)
// Initial value for the "from" date.
// @setter setFromDate
// @visibility external
//<
//fromDate: "$today",

//> @method dateRangeItem.setFromDate()
// Sets the +link{fromDate} for this DateRangeItem.
// @param fromDate (Date | RelativeDateString | TimeUnit) the date from which this item should start it's range
// @visibility external
//<
setFromDate : function (fromDate) {
    this.fromDate = fromDate;
    if (this.fromField) this.fromField.setValue(this.fromDate);
},

//> @attr dateRangeItem.toDate (Date | RelativeDateString | TimeUnit : today : IRW)
// Initial value for the "to" date.
// @setter setToDate
// @visibility external
//<
//toDate: "$today",

//> @method dateRangeItem.setToDate()
// Sets the +link{toDate} for this DateRangeItem.
// @param fromDate (Date | RelativeDateString | TimeUnit) the date at which this item should end it's range
// @visibility external
//<
setToDate : function (toDate) {
    this.toDate = toDate;
    if (this.toField) this.toField.setValue(this.toDate);
},

//> @attr dateRangeItem.dateInputFormat (DateInputFormat : null : IR)
// Format for direct user input of date values.
// <P>
// If unset, the input format will be determined based on the specified
// +link{dateDisplayFormat} if possible, otherwise picked up from the Date class (see
// +link{DateUtil.setInputFormat()}).
// 
// @deprecated This property is supported but 
// the standard +link{formItem.dateFormatter,dateFormatter} and +link{inputFormat} 
// may now be used to specify date formatting parsing behavior for dateRangeItems 
//
// @visibility external
//<

//> @attr dateRangeItem.inputFormat (DateInputFormat : null : IR)
// @include FormItem.inputFormat
//<

//> @attr dateRangeItem.dateDisplayFormat (DateDisplayFormat : null : IR)
// Format for displaying dates in to the user.  
// Defaults to the system-wide default established by +link{DateUtil.setNormalDisplayFormat()}.
// 
// @visibility external
//
// @deprecated This property is supported but 
// the standard +link{formItem.dateFormatter,dateFormatter} and +link{inputFormat} 
// may now be used to specify date formatting parsing behavior for dateRangeItems 
//
//<

//> @attr dateRangeItem.formula  (UserFormula : null : IR)
// Not applicable to a DateRangeItem.
// @visibility external
//<    
//> @attr dateRangeItem.textFormula  (UserSummary : null : IR)
// Not applicable to a DateRangeItem.
// @visibility external
//<    

//> @method dateRangeItem.hasAdvancedCriteria()
// Overridden to return true: dateRangeItems always generate AdvancedCriteria.
// @return (Boolean) true
// @visibility external
// @group criteriaEditing
//<
hasAdvancedCriteria : function () {
    return this.fromField && this.toField && 
        (this.fromField.getValue() != null || this.toField.getValue() != null);
},

//> @method dateRangeItem.getCriterion()
// Returns the Criterion entered in the date field.
// <P>
// A Criterion with an "and" +link{type:OperatorId,operator} will be
// returned with both a "greaterOrEqual" and "lessOrEqual" sub-criteria.  If either date is 
// omitted, only the "greaterOrEqual" (from date) or "lessOrEqual" (to date) Criterion is 
// included.
//
// @return (Criterion)
//
// @group criteriaEditing
// @visibility external
//<

getCriterion : function (absolute) {
    if (this.validateCriteria) {
        if (!this.validateRange()) return null;
    }

    absolute = absolute || !this.allowRelativeDates;

    var fromValue = absolute ? this.fromField.getValue() :
            this.fromField.getRelativeDate() || this.fromField.getValue(),

        hasFromValue = fromValue != null,

        toValue = absolute ? this.toField.getValue() :
            this.toField.getRelativeDate() || this.toField.getValue(),

        hasToValue = toValue != null,
        result = null
    ;

    if (hasFromValue || hasToValue) {
        // return an AdvanvedCriteria with one or two subCriteria
        result = { _constructor: "AdvancedCriteria", operator: "and", criteria: [ ] };

        if (hasFromValue) {
            if (isc.DateUtil.isRelativeDate(fromValue)) {
                var fromRangePos = isc.DateUtil.getDefaultRangePosition(fromValue) || "start";
                fromValue.rangePosition = fromRangePos;
            }
            if (this.fromField.isLogicalDate) {
                fromValue.logicalDate = true;
            }
            result.criteria.add({
                fieldName: this.getCriteriaFieldName(), 
                operator: "greaterOrEqual", 
                value: fromValue 
            });
        }
        if (hasToValue) {
            if (isc.DateUtil.isRelativeDate(toValue)) {
                var toRangePos = isc.DateUtil.getDefaultRangePosition(toValue) || "end";
                toValue.rangePosition = toRangePos;
            }
            if (this.toField.isLogicalDate) {
                toValue.logicalDate = true;
            }
            result.criteria.add({
                fieldName: this.getCriteriaFieldName(), 
                operator: "lessOrEqual", 
                value: toValue 
            });
        }
    }

    return result;    
},

//> @attr dateRangeItem.validateCriteria (Boolean : false :IRW)
// If this attribute is set to <code>true</code> when +link{formItem.getCriterion(),getCriterion()} is
// called, the item will validate the <i>"to"</i> and <i>"from"</i> fields and
// return null if either field fails validation.
// See +link{dateRangeItem.validateRange()}
// @visibility external
//<
validateCriteria:true,

//> @method dateRangeItem.validateRange()
// Validate both <i>"to"</i> and <i>"from"</i> date-fields.
// @return (Boolean) false if either <i>to</i> or <i>from</i>
//   field contains an invalid date value.
// @visibility external
//<
validateRange : function () {
    var success = true;
    if (this.fromField && !this.fromField.validate()) success = false;
    if (this.toField && !this.toField.validate()) success = false;
    return success;
},

//> @method dateRangeItem.canEditCriterion()
// Returns true if the specified criterion contains:
// <ul><li>A single "lessOrEqual" or "greaterOrEqual" criterion on this field</li>
//     <li>An "and" type criterion containing a "lessOrEqual" and a "greaterOrEqual" criterion
//         on this field</li>
//     <li>A single "equals" criterion.  Internally, this will be converted into a range
//         by constructing an "and" type criterion containing both a "lessOrEqual" and 
//         a "greaterOrEqual" criterion on this field.  Note that subsequent calls to 
//         +link{dateRangeItem.getCriterion(), getCriterion()} will return this more complex 
//         criterion.</li>
// </ul>
// @param criterion (Criterion) criterion to test
// @return (boolean) returns true if this criterion can be edited by this item
// @group criteriaEditing
// @visibility external
//<
canEditCriterion : function (criterion) {
    
    if (criterion == null) return false;
    var dateField = this.getCriteriaFieldName();
    if (criterion.operator == "and") {
        var innerCriteria = criterion.criteria;
        // we always produce one or 2 criteria only (to and from date range) - note, however,
        // that we can also edit an "equals" criterion, by first converting it into a range
        
        if (innerCriteria.length == 0 || innerCriteria.length > 2) {
            return false;
        } else if (innerCriteria.length == 1) {
            var crit = innerCriteria[0];
            if (crit.fieldName != dateField) return false;
            if (crit.operator == "equals") {
                this.logWarn("DynamicForm editing Advanced criteria. Includes criterion for " +
                    "field " +  dateField + ". A dateRange editor is showing for this field and " +
                    "the existing criteria has operator: " + crit.operator + ". DateRange " +
                    "items can only edit criteria greaterThan/greaterOrEqual or lessThan/lessOrEqual. "+
                    "However, for the 'equals' operator, a dateRange will be constructed for you, " +
                    "as greaterOrEqual to [value] and lessOrEqual to [value], ie, one day.");
                return true;
            }
        }
        for (var i = 0; i < innerCriteria.length; i++) {
            var innerCriterion = innerCriteria[i];

            // other field - just bail
            if (innerCriterion.fieldName != dateField) return false;

            // wrong operator - bail, but with a warning since this could confuse a 
            // developer
            if (innerCriterion.operator != "greaterThan" && innerCriterion.operator != "greaterOrEqual" 
                && innerCriterion.operator != "lessThan" && innerCriterion.operator != "lessOrEqual") 
            {
                this.logWarn("DynamicForm editing Advanced criteria. Includes criterion for " +
                    "field " +  dateField + ". A dateRange editor is showing for this field but " +
                    "the existing criteria has operator:" + innerCriterion.operator + ". DateRange " +
                    "items can only edit criteria greaterThan/greaterOrEqual or lessThan/lessOrEqual " +
                    "so leaving this unaltered.");
                return false;
            }
        }
        // Only contains a range, with one or 2 values, so we'll allow editing of that.
        return true;
        
    // single criterion matching to or from of range.. We support that..
    } else if (criterion.fieldName == dateField) {
        var message = "DynamicForm editing Advanced criteria. Includes criterion for " +
                "field " +  dateField + ". A dateRange editor is showing for this field and " +
                "the existing criteria has operator:" + criterion.operator + ". DateRange " +
                "items can only edit criteria greaterThan/greaterOrEqual or lessThan/lessOrEqual";

        if (criterion.operator == "equals") {
            this.logWarn(message + ". However, for the 'equals' operator, a dateRange will be " +
                "constructed for you, as greaterOrEqual to [value] and lessOrEqual to [value], " +
                "ie, one day.");
            return true;
        }

        if (criterion.operator != "greaterThan" && criterion.operator != "greaterOrEqual"
            && criterion.operator != "lessThan" && criterion.operator != "lessOrEqual") 
        {
            this.logWarn(message +  " so leaving this unaltered.");
            return false;
        }
        return true;
    }
    
    // in this case it's not on our field at all
    return false;
},

//> @method dateRangeItem.setCriterion()
// Applies the specified criterion to this item for editing. Applies any specified 
// "greaterOrEqual" operator criterion or sub-criterion to our +link{dateRangeItem.fromField, fromField} and any
// specified "lessOrEqual" operator criterion or sub-criterion to our +link{dateRangeItem.toField, toField}.
// <P>
// Note that a single "equals" criterion can also be passed.  See 
// +link{dateRangeItem.canEditCriterion, canEditCriterion()} for more detail.
// @param criterion (Criterion) criterion to edit
// @group criteriaEditing
// @visibility external
//<
setCriterion : function (criterion) {
    if (!criterion) return;

    if (criterion.operator == "equals") {
        // handle "equals" criterion by constructing an AdvancedCriteria that represents a
        // genuine range
        var newCrit = { _constructor: "AdvancedCriteria", operator: "and",
            criteria: [
                { fieldName: criterion.fieldName, operator: "greaterOrEqual", value: criterion.value },
                { fieldName: criterion.fieldName, operator: "lessOrEqual", value: criterion.value }
            ]};
        criterion = newCrit;
    }

    var fromCrit, toCrit;
    if (criterion.operator == "and") {
        fromCrit = criterion.criteria.find("operator", "greaterThan");
        if (!fromCrit) fromCrit = criterion.criteria.find("operator", "greaterOrEqual");
        toCrit = criterion.criteria.find("operator", "lessThan");
        if (!toCrit) toCrit = criterion.criteria.find("operator", "lessOrEqual");
    } else {
        if (criterion.operator == "greaterThan") fromCrit = criterion;
        else if (criterion.operator == "greaterOrEqual") fromCrit = criterion;
        else if (criterion.operator == "lessThan") toCrit = criterion;
        else if (criterion.operator == "lessOrEqual") toCrit = criterion;
    }

    // just call setValue on the relevant items.
    // If we're showing relative date items they should handle being passed an absolute
    // date value
    if (fromCrit != null) {
        this.fromField.setValue(fromCrit.value);
    }
    if (toCrit != null) {
        this.toField.setValue(toCrit.value);
    }
},

//> @attr dateRangeItem.dateRangeForm (AutoChild DynamicForm : null : R)
// +link{DynamicForm} +link{AutoChild} automatically created by the dateRangeItem and applied
// to the item as +link{canvasItem.canvas,this.canvas}.<P>
// This DynamicForm contains the "from" and "to" fields the user will interact with to actually
// select a date-range. Note that as a standard autoChild, developers may customize this form 
// by modifying <code>dateRangeProperties</code>.
//
// @visibility external
//<
dateRangeFormConstructor: "DynamicForm",
dateRangeFormDefaults: {
    margin: 0,
    padding: 0,
    itemChanged : function (item, newValue) {
        var values = this.getValues(),
            dateRange = {_constructor:"DateRange"};
        if (values.fromField != null) dateRange.start = values.fromField;
        if (values.toField != null) dateRange.end = values.toField;
        
        this.creator._updateValue(dateRange);
    }
},

//> @attr dateRangeItem.relativeItemConstructor (String : "RelativeDateItem" : R)
// The +link{FormItem} class to create when +link{allowRelativeDates} is true.
// @visibility external
//<
relativeItemConstructor: "RelativeDateItem",

//> @attr dateRangeItem.absoluteItemConstructor (String : "DateItem" : R)
// The +link{FormItem} class to create when +link{allowRelativeDates} is false,
// but the +link{dateRangeItem} does not have type "datetime".
// @see type:FieldType
// @visibility external
//<
absoluteItemConstructor: "DateItem",

//> @attr dateRangeItem.absoluteDateTimeItemConstructor (String : "DateTimeItem" : R)
// The +link{FormItem} class to create when +link{allowRelativeDates} is false,
// and the +link{dateRangeItem}'s type is "datetime".
// @see type:FieldType
// @visibility external
//<
absoluteDateTimeItemConstructor: "DateTimeItem"

});

isc.DateRangeItem.addMethods({
    init : function () {
        // if unset, set a default type of "date" - it gets passed onto the child items
        if (this.getType() == null) this.type = "date";
        this._createEditor();
        this.Super("init", arguments);
    },

    // If we get destroyed also wipe out our canvas
    autoDestroy:true,

    //> @attr DateRangeItem.invalidRangeErrorMessage (String : "'To' field value cannot be earlier than 'From' field value." : IR)
    // Error message to display if the user enters a date range where the "To" field value
    // is earlier than the "From" field value.
    // @visibility external
    // @group i18nMessages
    //<
    invalidRangeErrorMessage:"'To' field value cannot be earlier than 'From' field value.",

    _createEditor: function () {
        var ds;
        var dynProps = {
            _suppressColWidthWarnings: true
        };

        if (this.form.dataSource) { // Should be, otherwise how have we ended up with a complex field?
            ds = isc.DataSource.getDataSource(this.form.dataSource);
            var field = ds.getField(this.name);
            if (field) {
                dynProps.dataSource = ds.getFieldDataSource(field);
            }
        }

        if (this.form && this.form.showComplexFieldsRecursively) {
            dynProps.showComplexFields = true;
            dynProps.showComplexFieldsRecursively = true;
        } else {
            dynProps.showComplexFields = false;
        }

        dynProps.height = 22;
        
        var titleOrientation = this.innerTitleOrientation || this.titleOrientation || 
                this.form.titleOrientation || "left";

        dynProps.titleOrientation = titleOrientation;
        if (titleOrientation == "left") {
            if (this.fieldLayout == "vertical") {
                dynProps.numCols = 2;
                dynProps.colWidths = [50, "*"];
            } else {
                dynProps.numCols = 4;
                dynProps.colWidths = [50, "*", 50, "*"];
            }
        } else if (titleOrientation == "right") {
            if (this.fieldLayout == "vertical") {
                dynProps.numCols = 2;
                dynProps.colWidths = ["*", 50];
            } else {
                dynProps.numCols = 4;
                dynProps.colWidths = ["*", 50, "*", 50];
            }
        } else {
            if (this.fieldLayout == "vertical") {
                dynProps.numCols = 1;
                dynProps.colWidths = ["*"];
            } else {
                dynProps.numCols = 2;
                dynProps.colWidths = ["*", "*"];
            }
        }

        this.addAutoChild("dateRangeForm", dynProps);
        this.canvas = this.dateRangeForm;        

        // set a default baseDate if one wasn't provided
        var type = this.getType(),
            isLogicalDate = false;
        if (isc.SimpleType.inheritsFrom(type, "date"))
        {
            isLogicalDate = true;
        }
        if (!this.baseDate) this.baseDate = new Date();
        if (isLogicalDate) this.baseDate = isc.DateUtil.getLogicalDateOnly(this.baseDate);

        var _this = this,
            _constructor = this.allowRelativeDates ? this.relativeItemConstructor : 
                (isLogicalDate ? this.absoluteItemConstructor : 
                         this.absoluteDateTimeItemConstructor),
            items = []
        ;

        items[0] = isc.addProperties({}, 
            this.fromFieldDefaults, this.fromFieldProperties,
            { 
                _constructor: this.fromFieldConstructor || _constructor,
                name: "fromField", baseDate: this.baseDate,
                // dateDisplayFormat and dateInputFormat are basically there for back-compat only
                dateFormatter:(this.dateDisplayFormat || this.dateFormatter),
                
                type:this.getType(),
                
                inputFormat: (this.dateInputFormat || this.inputFormat),
                rangePosition: "start",
                title: this.fromTitle, 
                defaultValue: this.fromDate, 
                useTextField: (!this.allowRelativeDates ? true : null)
            }
        );
        items[1] = isc.addProperties({}, 
            this.toFieldDefaults, this.toFieldProperties,
            {
                _constructor: this.toFieldConstructor || _constructor,
                name: "toField", baseDate: this.baseDate,
                dateFormatter:(this.dateDisplayFormat || this.dateFormatter),
                type:this.getType(),
                inputFormat: (this.dateInputFormat || this.inputFormat),
                rangePosition: "end",
                title: this.toTitle,
                defaultValue: this.toDate,
                useTextField: (!this.allowRelativeDates ? true : null)
            }
        );
        // Add a greater-than validator to the toField to enforce valid ranges
        if (!items[1].validators) items[1].validators = [];
        items[1].validators.add({
            type:"custom",
            errorMessage:this.invalidRangeErrorMessage,
            condition:function (item, validator, value, record) {
                if (value != null && isc.isA.Date(value)) {
                    var fromDate = record.fromField;
                    if (fromDate != null && isc.isA.Date(fromDate) &&
                        isc.DateUtil.compareDates(fromDate, value) < 0) 
                    {
                        return false;
                    }
                }
                return true;
            }
        });

        this.canvas.setFields(items);

        this.toField = this.canvas.getField("toField");
        this.fromField = this.canvas.getField("fromField");

        if (this.defaultValue) {
            this.setValue(this.defaultValue);
        } else {
            if (this.fromDate) this.setFromDate(this.fromDate);
            if (this.toDate) this.setToDate(this.toDate);
        }
    },
    
    fieldChanged : function () {
    },

    //> @method dateRangeItem.setValue()
    // Sets the value for this dateRangeItem.  The value parameter is a 
    // +link{object:DateRange} object that optionally includes both start and end values.  If
    // passed null, both start- and end-range values are cleared.
    // @param value (DateRange) the new value for this item
    // @visibility external
    //<
    setValue : function (value) {

        var start = value ? value.start : null,
            end = value ? value.end : null,
            RDI = isc.RelativeDateItem;

        if (!this.allowRelativeDates && RDI.isRelativeDate(start)) this.setFromDate(null);
        else this.setFromDate(start);
        if (!this.allowRelativeDates && RDI.isRelativeDate(end)) this.setToDate(null);
        else this.setToDate(end);
        this.Super("setValue", arguments);
    },

    //> @method dateRangeItem.getValue()
    // Retrieves the current value of this dateRangeItem.  The return value is a 
    // +link{object:DateRange} object that excludes start and end values if they aren't
    // set.
    // @return (DateRange) the current value of this item
    // @visibility external
    //<
    getValue : function () {
        var isRelative = this.allowRelativeDates,
            isDrawn = this.isDrawn(),
            fFrom = this.fromField,
            fTo = this.toField,
            fromValue = null,
            toValue = null
        ;

        if (fFrom) {
            if (isRelative && fFrom.getRelativeDate) fromValue = fFrom.getRelativeDate()
            if (fromValue == null) fromValue = fFrom.getValue();
            if (fromValue != null && this.type == "date") {
                // tag the logicalDate flag onto the fromValue
                fromValue.logicalDate = true;
            }
        } else {
            fromValue = this.fromDate;
        }

        if (fTo) {
            if (isRelative && fTo.getRelativeDate) toValue = fTo.getRelativeDate();
            if (toValue == null) toValue = fTo.getValue();
            if (toValue != null && this.type == "date") {
                // tag the logicalDate flag onto the toValue
                toValue.logicalDate = true;
            }
        } else {
            toValue = this.toDate;
        }

        if (fromValue == null && toValue == null) return null;

        var result = { _constructor: "DateRange" };
        if (fromValue != null) result.start = fromValue;
        if (toValue != null) result.end = toValue;

        return result;
    }
});


if (isc.Window) {
// dateRangeDialog and miniDateRangeItem require isc.Window

//> @class DateRangeDialog
// Simple modal dialog for collecting a date range from the end user.
// 
// @inheritsFrom Window
// @treeLocation Client Reference/Forms
// @visibility external
//<

isc.defineClass("DateRangeDialog", "Window");


//> @method Callbacks.DateRangeCallback
// Callback for +link{dateRangeDialog.askForRange()}.
// @param criterion (Criterion) criterion representing the selected range
// @visibility drawing
//<
    
isc.DateRangeDialog.addClassMethods({
//> @classMethod DateRangeDialog.askForRange()
// Helper method to launch a DateRangeDialog to have a date range input by the user.
// @param allowRelativeDates (boolean) whether to allow relative date entry via
//                                    +link{RelativeDateItem}s, default true
// @param rangeItemProperties (DateRangeItem Properties) properties for the DateRangeItem
// @param windowProperties (DateRangeDialog Properties) properties for the Window
// @param callback (DateRangeCallback) method to fire once user has input values, with a single
//                                     parameter "criterion" of type +link{Criterion}
// @visibility external
//<
askForRange : function (allowRelativeDates, rangeItemProperties, windowProperties, callback) {
    var drd = isc.DateRangeDialog.create({
        allowRelativeDates: allowRelativeDates != null ? allowRelativeDates : true,
        rangeItemProperties: rangeItemProperties,
        callback: callback
    }, windowProperties);

    drd.show();
}
});

isc.DateRangeDialog.addProperties({
isModal: true,
showModalMask: true,
dismissOnEscape: true,
autoCenter: true,
autoSize: true,
autoFocus: true,
vertical: "true",
showMinimizeButton: false,
headerIconProperties: {
    src: "[SKIN]/DynamicForm/DatePicker_icon.gif"
},

keyPress : function () {
    var key = isc.EH.getKey();
    if (key == "Enter") {
        this.accept();
    }
},

returnCriterion: false,

//> @attr dateRangeDialog.headerTitle (String : "Select Date Range" : IR)
// The title to display in the header-bar of this Dialog.
// 
// @visibility external
// @group i18nMessages
//<
headerTitle: "Select Date Range",

mainLayoutDefaults: {
    _constructor: "VLayout",
    width: 380,
    height: 105,
    layoutMargin: 5
},

rangeFormDefaults: {
    _constructor: "DynamicForm",
    numCols: 1,
    height: "100%",
    autoParent: "mainLayout"
},

//> @attr dateRangeDialog.rangeItem (AutoChild DateRangeItem : null : IR)
// 
// @visibility external
//<
rangeItemConstructor: "DateRangeItem",
rangeItemDefaults: {
    allowRelativeDates: true,
    showTitle: false
},

buttonLayoutDefaults: {
    _constructor: "HLayout",
    width: "100%",
    height: 1,
    layoutAlign: "right",
    align: "right",
    membersMargin: 5,
    autoParent: "mainLayout"
},

//> @attr dateRangeDialog.clearButtonTitle (String : "Clear" : IR)
// The title for the "Clear" button on this dialog.
// @visibility external
// @group i18nMessages
//<
clearButtonTitle: "Clear",
//> @attr dateRangeDialog.clearButton (AutoChild IButton : null : IR)
// Button used for clearing the dialog's values.  Note that, since this is an +link{AutoChild},
// it can be configured using clearButtonDefaults and clearButtonProperties.
// @visibility external
//<
clearButtonConstructor: "IButton",
clearButtonDefaults: {
    width: 80,
    canFocus:true,
    autoParent: "buttonLayout",
    click : function () {
        this.creator.clearValues();
    }
},

//> @attr dateRangeDialog.okButtonTitle (String : "OK" : IR)
// The title for the "OK" button on this dialog.
// @visibility external
// @group i18nMessages
//<
okButtonTitle: "OK",
//> @attr dateRangeDialog.okButton (AutoChild IButton : null : IR)
// Button used for accepting the values entered into the dialog.  Note that, since this is an 
// +link{AutoChild}, it can be configured using okButtonDefaults and okButtonProperties.
// @visibility external
//<
okButtonConstructor: "IButton",
okButtonDefaults: {
    width: 80,
    canFocus:true,
    autoParent: "buttonLayout",
    click : function () {
        this.creator.accept();
    }
},

//> @attr dateRangeDialog.cancelButtonTitle (String : "Cancel" : IR)
// The title for the "Cancel" button on this dialog.
// @visibility external
// @group i18nMessages
//<
cancelButtonTitle: "Cancel",
//> @attr dateRangeDialog.cancelButton (AutoChild IButton : null : IR)
// Button used for cancelling the dialog.  Note that, since this is an +link{AutoChild}, it can
// be configured using cancelButtonDefaults and cancelButtonProperties.
// @visibility external
//<
cancelButtonConstructor: "IButton",
cancelButtonDefaults: {
    width: 80,
    canFocus:true,
    autoParent: "buttonLayout",
    click : function () {
        this.creator.cancel();
    }
},

// Pipe the standard top-right close icon through to our cancel method - this method is also
// called as a result of dismissOnEscape: true
closeClick : function () {
    this.cancel();
},

destroyOnClose: true,

destroy : function () {
    if (this.rangeForm) {
        this.rangeForm.markForDestroy();
    }
    this.Super("destroy", arguments);
}

});

isc.DateRangeDialog.addMethods({
    initWidget : function () {
        this.title = this.headerTitle;
        
        this.Super("initWidget", arguments);
        this.addAutoChild("mainLayout");
        
        if (!this.type) this.type = "date";

        var itemProps = isc.addProperties(
            {_constructor: this.rangeItemConstructor}, 
            this.rangeItemDefaults, this.rangeItemProperties,
            { name: "rangeItem", fromDate: this.fromDate, toDate: this.toDate,
                type: this.type,
                dateDisplayFormat: this.dateDisplayFormat
            }
        );

        this.addAutoChild("rangeForm",
            {
                _suppressColWidthWarnings: true,
                items: [ itemProps ]
            }
        );

        var rangeItem = this.rangeItem = this.rangeForm.getField("rangeItem");

        var titleOrientation = rangeItem.innerTitleOrientation || rangeItem.titleOrientation || 
                "left";

        rangeItem.canvas.titleOrientation = titleOrientation;
        if (titleOrientation == "left" || titleOrientation == "right") {
            rangeItem.canvas.numCols = 2;
            rangeItem.canvas.colWidths = [50, "*"];
        } else {
            rangeItem.canvas.numCols = 1;
            rangeItem.canvas.colWidths = ["*"];
        }

        this.addAutoChild("buttonLayout");
        
        this.addAutoChild("clearButton", { canFocus:true, title: this.clearButtonTitle});
        this.addAutoChild("okButton", { canFocus:true, title: this.okButtonTitle});
        this.addAutoChild("cancelButton", { canFocus:true, title: this.cancelButtonTitle});
        this.addItem(this.mainLayout);
        
        if (this.rangeItem.value) {
            // if a value is set, apply it to the range item
            if (isc.DataSource.isAdvancedCriteria(this.rangeItem.value)) {
                this.rangeItem.setCriterion(this.rangeItem.value);
            } else this.rangeItem.setValue(this.rangeItem.value);
        }
    },

    clearValues : function () {
        if (this.rangeItem) {
            this.rangeItem.setValue(null);
            // clear validation errors!
            if (this.autoValidate) this.rangeItem.validateRange();
        }
        
    },

    accept : function () {
        if (this.autoValidate && !this.rangeItem.validateRange()) {
            return;
        }
        this.finished(
            this.rangeItem.returnCriterion ? this.rangeItem.getCriterion() : this.rangeItem.getValue()
        );
    },

    cancel : function () {
        this.hide();
        if (this.item) {
            // revert the values of the from and to widgets to the dates from the parent item
            this.rangeItem.setFromDate(this.item.fromDate);
            this.rangeItem.setToDate(this.item.toDate);
        }
        if (this.destroyOnClose) this.markForDestroy();
    },

    finished : function (value) {
        if (this.callback) this.fireCallback(this.callback, "value", [value]);
        this.hide();
        if (this.destroyOnClose) this.markForDestroy();
    }

});

//> @class MiniDateRangeItem
// Provides a compact interface for editing a date range, by providing a formatted, read-only
// display of the current selected date range with an icon to launch a +link{DateRangeDialog} 
// to edit the range.
// 
// @inheritsFrom StaticTextItem
// @visibility external
//<
isc.defineClass("MiniDateRangeItem", "StaticTextItem");

isc.MiniDateRangeItem.addProperties({
_mayShowHintInField : function () {
    return true;
},

//> @attr miniDateRangeItem.textBoxStyle (FormItemBaseStyle : "textItem" : IRW)
// @include formItem.textBoxStyle
//<
controlStyle:"textItem",
        
clipValue: true,
applyHeightToTextBox:true,
wrap: false,
valign: "middle",
iconVAlign: "middle",
height: 20,
width: 100,

// default to working with "date" values - "date" was the expected default previously,
// but not in all cases 
defaultType: "date",

_shouldVerticallyCenterTextBox : function () { return true; },

//> @attr miniDateRangeItem.shouldSaveValue (Boolean : true : IR)
// Allow miniDateRangeItems' values to show up in the form's values array, or if 
// +link{dynamicForm.getValuesAsCriteria()} is called, for the criterion to be included
// in the returned AdvancedCriteria object
// @visibility external
//<
shouldSaveValue:true,

//> @attr miniDateRangeItem.rangeDialog (AutoChild DateRangeDialog : null : IR)
// Pop-up +link{DateRangeDialog} for entering a date range.
//
// @visibility external
//<
rangeDialogConstructor: "DateRangeDialog",
rangeDialogDefaults: {
    autoDraw: false, 
    destroyOnClose: false
},

//> @attr miniDateRangeItem.canFocus (Boolean : true : IR)
// MiniDateRangeItems are marked as canFocus:true, and set up with properties such that focus
// will always go to the icon to launch the dateRange dialog. Set canFocus to false to 
// suppress this behavior.
// @visibility external
//<

canFocus:true,

// these overrides ensure focus goes to the picker icon (actually this.icons[0]) rather than
// us writing tab-order properties into the static div.

_canFocusInTextBox : function () {
    return false;
},

// Override _setElementTabIndex() to avoid calling this.redraw() - even though
// we're canFocus:true, we don't have a true focus-element so no need to modify the DOM in 
// any way, except to ensure our icons get updated if appropriate.
_setElementTabIndex : function (tabIndex, autoIndexUpdateNotification) {
    
    // If we can't accept focus, or aren't drawn/visible just bail
    if (!this._canFocus() || !this.isDrawn()) return;
    // Also update any form item icons.
    // Note that we are only doing this
    // - if we have an element, because if we do not the redraw (below) is 
    //   required in any case, and will cause the icons' tab index to be updated.
    // - if this isn't a notification from the TabIndexManager [in that case we
    //   can assume the icons will also be notified]
    if (!autoIndexUpdateNotification) this._updateIconTabIndices();
},

//> @attr miniDateRangeItem.canTabToIcons (Boolean : true : IRWA)
// MiniDateRangeItems rely on their icon being able to receive focus for normal user
// interaction as they have no other focusable element. <code>canTabToIcons</code> is
// overridden to achieve this even if the property has been set to <code>false</code> at
// the +link{dynamicForm.canTabToIcons,form level}.
// @visibility external
//<
canTabToIcons:true,

//> @attr miniDateRangeItem.fromDateOnlyPrefix (String : "Since" : IR)
// The text to prepend to the formatted date when only a +link{fromDate, fromDate} is supplied.
// @visibility external
// @group i18nMessages
//<
fromDateOnlyPrefix: "Since",

//> @attr miniDateRangeItem.toDateOnlyPrefix (String : "Before" : IR)
// The text to prepend to the formatted date when only a +link{toDate, toDate} is supplied.
// @visibility external
// @group i18nMessages
//<
toDateOnlyPrefix: "Before",

//> @attr miniDateRangeItem.pickerIconPrompt (HTMLString : "Show Date Chooser" : IR)
// The prompt to show when the mouse is hovered over the +link{pickerIcon}.
// 
// @visibility external
// @group i18nMessages
//<
pickerIconPrompt: "Show Date Chooser",


showPickerIcon: true,

pickerIconSrc: "[SKIN]/DynamicForm/DatePicker_icon.gif",

//> @attr miniDateRangeItem.pickerIcon (FormItemIcon Properties : null : IR)
// Icon that launches a +link{DateChooser} for choosing an absolute date.
// 
// @visibility external
//<
pickerIconDefaults: {
    width: 16, height: 16,
    showOver: false,
    showFocused: false,
    showFocusedWithItem: false,
    hspace: 0,
    click : function (form, item, icon) {
        if (!item.isReadOnly()) {
            item.showRangeDialog();
            
            return false;
        }
    }
},

//> @attr miniDateRangeItem.allowRelativeDates (Boolean : true : IR)
// Whether the +link{DateRangeDialog} opened when the 
// +link{miniDateRangeItem.pickerIcon, pickerIcon} is clicked should display 
// +link{RelativeDateItem}s or +link{DateItem}s.
// 
// @visibility external
//<
allowRelativeDates: true,

//> @attr miniDateRangeItem.dateDisplayFormat (DateDisplayFormat : null : IR)
// Format for displaying dates to the user.  
// <P>
// If this attribute is unset, the display value is formatted intelligently according to the
// dates involved.  For example, if both dates appear in the same month, the value will be 
// formatted as 
// <P><code>Month date1 - date2, Year</code> 
// <P>and, if in different months of the same year, 
// <P><code>Month1 date1 - Month2 date2, Year</code>.
// <P>If either date-value is unset, the display-value is formatted according to 
// +link{miniDateRangeItem.fromDateOnlyPrefix, fromDateOnlyPrefix} and 
// +link{miniDateRangeItem.toDateOnlyPrefix, toDateOnlyPrefix}.
// 
// @visibility external
//<

//> @attr miniDateRangeItem.fromDate (Date | RelativeDateString | TimeUnit : today : IRW)
// Initial value for the "from" date.
// @setter setFromDate
// @visibility external
//<
//fromDate: "$today",

//> @attr miniDateRangeItem.toDate (Date | RelativeDateString | TimeUnit : today : IRW)
// Initial value for the "to" date.
// @setter setFromDate
// @visibility external
//<
//toDate: "$today",


handleClick : function () {
    if (!this.isReadOnly()) this.showRangeDialog();
}

});

isc.MiniDateRangeItem.addMethods({
    init : function () {        
        this.Super("init", arguments);
        
        var type = this.getType();

        // combine any specified rangeItemProperties with the ones we need to pass
        var rangeItemProps = isc.addProperties({}, 
            this.rangeDialogProperties ? this.rangeDialogProperties.rangeItemProperties : null,
            {   
                allowRelativeDates: this.allowRelativeDates,
                criteriaField: this.criteriaField,
                type: type
            }
        );

        this.addAutoChild("rangeDialog", 
            {
                type: type,
                item: this,
                autoValidate:this.autoValidate,
                fromDate: this.fromDate, 
                toDate: this.toDate,
                rangeItemProperties: rangeItemProps,
                dateDisplayFormat: this.dateDisplayFormat,
                callback: this.getID()+".rangeDialogCallback(value)"
            }
        );

        this.rangeItem = this.rangeDialog.rangeItem;
        this.rangeItem.name = this.name;
        
        if (this.defaultValue) {
            this.setValue(this.defaultValue);
        }

        // remove the isDate validator - it's already been applied to the child items and this
        // item produces a DateRange object, not a Date, so date validation here is invalid
        if (this.validators) this.validators.remove(this.validators.find("type", "isDate"));
    },

    validate : function () {
        // when validate is directly called, pass it through to the rangeItem
        return this.rangeItem.validateRange();
    },

    //> @attr miniDateRangeItem.autoValidate (Boolean : true : IRW)
    // If this attribute is set to true, the pop up date range dialog will automatically
    // validate the user-entered <i>"to"</i> and <i>"from"</i> values on 
    // <code>"OK"</code>-click, and refuse to dismiss if these items contain invalid values.
    // @visibility external
    //<
    autoValidate:true,
    
    //> @method miniDateRangeItem.setAutoValidate()
    // Setter for +link{miniDateRangeItem.autoValidate}
    // @param autoValidate (boolean) New auto-validate setting.
    // @visibility external
    //<
    setAutoValidate : function (autoValidate) {
        this.autoValidate = autoValidate;
        if (this.rangeDialog) this.rangeDialog.autoValidate = this.autoValidate;
    },

    showRangeDialog : function () {
        this.rangeDialog.show();
        var rangeItem = this.rangeDialog.rangeItem;
        rangeItem.setFromDate(this.fromDate);
        rangeItem.setToDate(this.toDate);
        rangeItem.canvas.validate();
    },

    rangeDialogCallback : function (value) {
        if (!this._updateValue(value)) return;
        this.displayValue(value);
    },

    //> @method miniDateRangeItem.hasAdvancedCriteria()
    // @include dateRangeItem.hasAdvancedCriteria()
    // @group criteriaEditing
    //<
    hasAdvancedCriteria : function () {
        return this.rangeItem != null && this.rangeItem.hasAdvancedCriteria();
    },

    //> @method miniDateRangeItem.getCriterion()
    // Returns the Criterion entered in the fields shown in the 
    // +link{miniDateRangeItem.rangeDialog}.
    // <P>
    // If both dates are entered, a Criterion with an "and" +link{type:OperatorId,operator} 
    // and both "greaterOrEqual" and "lessOrEqual" sub-criteria will be returned.  If either
    // date is omitted, only the "greaterOrEqual" (from date) or "lessOrEqual" (to date) 
    // Criterion is returned.
    //
    // @return (Criterion)
    //
    // @group criteriaEditing
    // @visibility external
    //<
    getCriterion : function () {
        var criteria = this.rangeItem ? this.rangeItem.getCriterion() : null;
        return criteria;
    },

    //> @method miniDateRangeItem.setCriterion()
    // @include dateRangeItem.setCriterion()
    // @visibility external
    //<
    setCriterion : function (criterion) {
        if (this.rangeItem) {
            this.rangeItem.setCriterion(criterion);
            var value = this.rangeItem.getValue();
            
            // call superclass 'setValue()' to update display and store
            // the new DateRange value derived from the criterion passed in
            // Pass flag to suppress updating the dateRangeItem again
            this.setValue(value, null, true);
        }
        
    },

    //> @method miniDateRangeItem.canEditCriterion()
    // @include dateRangeItem.canEditCriterion()
    // @visibility external
    //<
    canEditCriterion : function (criterion) {
        return this.rangeItem ? this.rangeItem.canEditCriterion(criterion) : false;
    },

    //> @method miniDateRangeItem.setValue()
    // Sets the value for this miniDateRangeItem.  The value parameter is a 
    // +link{object:DateRange} object that optionally includes both start and end values.
    // @param value (DateRange) the new value for this item
    // @visibility external
    //<
    setValue : function (value, allowNull, fromRangeItem) {
        // update this.fromDate / this.toDate
        this.updateStoredDates(value);
     
        // update the rangeItem
        if (!fromRangeItem) {
            this.rangeItem.setFromDate(this.fromDate);
            this.rangeItem.setToDate(this.toDate);
        }
        // this will store the value in the DynamicForm values object, and
        // refresh to display the value
        var newArgs = [this.getValue()];
        this.Super("setValue", newArgs, arguments);
    },
    
    updateStoredDates : function (value) {
       
        if (value != null) {
            if (isc.DataSource.isAdvancedCriteria(value)) {
                // value has come back as an AdvancedCriteria!
                var newValue = {};

                for (var i=0; i<value.criteria.length; i++) {
                    var criterion = value.criteria[i];
                    if (criterion.operator == "greaterThan" || criterion.operator == "greaterOrEqual")
                        newValue.start = criterion.value;
                    else if (criterion.operator == "lessThan" || criterion.operator == "lessOrEqual")
                        newValue.end = criterion.value;
                }
                value = newValue
            }

            this.fromDate = !value.start ? null : value.start;
            this.toDate = !value.end ? null : value.end;
        } else {
            this.fromDate = null;
            this.toDate = null;
            // the prompt is pre-built, based on the stored dates, so clear it now
            this.prompt = "";
        }
    },
    
    saveValue : function () {
        this.Super("saveValue", arguments);
        this.updateStoredDates(this._value);
    },
    
    // show the current value in our text box (called from setValue / updateValue)
    displayValue : function (value) {
        var displayValue = this.mapValueToDisplay(value) || "";
        this.setElementValue(displayValue, value);

    },

    // Override setElementValue to hang onto a copy of the current display value
    
    setElementValue : function (displayValue, dataValue, a,b,c) {
        var isEmptyDisplayValue = (displayValue == null || isc.isAn.emptyString(displayValue) ||
                                   displayValue == this.emptyDisplayValue);

        // If showing hint within data field, see if it should be shown now.        
        
        
        if (!this._showInFieldHintRunning && !this._hideInFieldHintRunning &&
            this._getShowHintInField())
        {
            if (isEmptyDisplayValue) {
                // Set field class to our hint style
                var textBox = this._getTextBoxElement();
                if (textBox != null)
                    textBox.className = this._getInFieldHintStyle();

                // Show the hint in the field
                // Note that hint is HTML which may not display correctly within the field.
                // To improve the situation, call htmlStringToString().
                var hint = this.getHint();
                displayValue = String.htmlStringToString(hint);
                this._showingInFieldHintAsValue = true;
            } else {
                if (this._showingInFieldHintAsValue) {
                    var textBox = this._getTextBoxElement();
                    if (textBox != null) textBox.className = this.getTextBoxStyle();
                }
                this._showingInFieldHintAsValue = false;
            }
        }

        this._displayValue = displayValue;

        return this.invokeSuper(isc.MiniDateRangeItem, "setElementValue", displayValue, dataValue, a,b,c);
    },

    mapValueToDisplay : function (value) {
        if (value == null) return "";
        var fromDate = value.start,
            toDate = value.end,
            RDI = isc.RelativeDateItem,
            start = (RDI.isRelativeDate(fromDate) ?
                RDI.getAbsoluteDate(fromDate.value, null, null, "start") : fromDate),
            end = (RDI.isRelativeDate(toDate) ? 
                RDI.getAbsoluteDate(toDate.value, null, null, "end") : toDate)
        ;

        var prompt;
        if (start || end) {
            if (this.dateDisplayFormat || this.format) {
                if (start) prompt = this.formatDate(start);
                if (end) {
                    if (prompt) prompt += " - " + this.formatDate(end);
                    else prompt = this.formatDate(end);
                }
            } else prompt = isc.DateUtil.getFormattedDateRangeString(start, end);
            
            if (!start) prompt = this.toDateOnlyPrefix + " " + prompt;
            else if (!end) prompt = this.fromDateOnlyPrefix + " " + prompt;
        }
        this.prompt = prompt || "";
        return this.prompt;
    },

    //> @method miniDateRangeItem.getValue()
    // Retrieves the current value of this dateRangeItem.  The return value is a 
    // +link{object:DateRange} object that excludes start and end values if they aren't
    // set.
    // @return (DateRange) the current value of this item
    // @visibility external
    //<
    getValue : function () {
        if (!this.rangeItem) return;
        return this.rangeItem.getValue();
    },

    // formatDate() - given a live date object, returns the formatted date string to display
    formatDate : function (date) {
        if (!isc.isA.Date(date)) return date;
        
        var type = this.getType(),
            isLogicalDate = isc.SimpleType.inheritsFrom(type, "date");
        return date.toShortDate(this._getDateFormatter(), !isLogicalDate);
    },
    
    getCriteriaValue : function () {
        return this.getCriterion();
    },
    
    destroy : function () {
        if (this.rangeDialog) this.rangeDialog.markForDestroy();
        this.Super("destroy", arguments);
    }


});


}


}

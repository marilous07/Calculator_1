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





//> @class PresetCriteriaItem
// A FormItem for use with the +link{FilterBuilder}, allows the user to pick from a set of 
// pre-configured search criteria such as specific ranges in numeric or date data, and provide 
// user friendly titles for such criteria, such as "within the next two weeks" or 
// "High (0.75 - 0.99)".
// 
// @inheritsFrom SelectItem
// @visibility external
//<
isc.defineClass("PresetCriteriaItem", "SelectItem");

isc.PresetCriteriaItem.addClassMethods({

});


isc.PresetCriteriaItem.addProperties({
    canFocus: true,

    //> @attr presetCriteriaItem.valueMap (Object : null : IR)
    // This attribute is not applicable to the PresetCriteriaItem.  See 
    // +link{presetCriteriaItem.options} instead.
    // 
    // @visibility external
    //<

    //> @attr presetCriteriaItem.options (Object : null : IR)
    // An object whose properties are user-visible titles for the preset ranges, and whose 
    // values are Criteria / AdvancedCriteria objects representing the criteria to be used if 
    // the user selects that choice.
    // 
    // @visibility external
    //<

    // i18n attributes

    //> @attr presetCriteriaItem.showCustomOption (boolean : false : IR)
    // If set, an additional option will be shown with the title +link{customOptionTitle}, 
    // which will cause +link{getCustomCriteria()} to be called.
    // 
    // @visibility external
    //<

    //> @attr presetCriteriaItem.customOptionTitle (String : "Custom..." : IR)
    // The title to show for the +link{presetCriteriaItem.showCustomOption, custom option}.
    //
    // @visibility external
    // @group i18nMessages
    //<
    customOptionTitle: "Custom...",

    //> @attr presetCriteriaItem.shouldSaveValue (Boolean : true : IR)
    // @include FormItem.shouldSaveValue
    //<
    shouldSaveValue: true

});

isc.PresetCriteriaItem.addMethods({
    
    init : function () {
        if (!this.options) this.options = {};

        this.valueMap = {};
        for (var key in this.options) {
            this.valueMap[key] = key;
        }

        if (this.showCustomOption) {
            this.options["customOption"] = null;
            this.valueMap["customOption"] = this.customOptionTitle; 
        }

        this.Super("init", arguments);
    },

    pickValue : function (value, customValuePicked) {
        if (value == "customOption") {
            if (!customValuePicked) {
                // pickValue() was called normally
                if (this.getCustomCriteria && isc.isA.Function(this.getCustomCriteria)) {
                    this.getCustomCriteria(this.getID()+".getCustomCriteriaReply(criteria,title)");
                    return;
                }
            }
            // pickValue() was called from getCustomCriteriaReply(), picker has already been shown
        }
        return this.Super("pickValue", arguments);
    },

    //> @method presetCriteriaItem.getCustomCriteria() [A]
    // This method is called when +link{showCustomOption} is true and the user selects the 
    // custom option.  Implement this method by allowing the user to enter custom criteria, for
    // example, by opening a modal dialog.  Once the user has input custom criteria, fire the
    // callback method with the resulting criteria.
    // 
    // @param callback (Callback) callback to fire when custom criteria has been gathered.
    //              Expects parameters "criteria,title".  The "title" will be displayed as the 
    //              currently selected value when custom criteria have been chosen.
    // 
    // @visibility external
    //<
    getCustomCriteria : function (callback) {
    },

    getCustomCriteriaReply : function (criteria, title) {
        this.valueMap["customOption"] = title || this.valueMap["customOption"];
        this.options["customOption"] = criteria;
    },

    getCriteriaValue : function () {
        return this.getCriterion();
    },

    hasAdvancedCriteria : function () {
        return true;
    }

    ,

    //> @method presetCriteriaItem.getCriterion()
    // Get the criterion based on the value selected by the user.
    //
    // @return (Criterion | AdvancedCriteria) the criteria for the selected option
    // 
    // @visibility external
    //<
    getCriterion : function () {
        var key = this.getValue(),
            criterion = this.options[key]
        ;

        return criterion;
    },

    updateCriteriaFieldNames : function (crit) {
        for (var key in crit) {
            var subCrit = crit[key];

            if (isc.DataSource.isAdvancedCriteria(subCrit)) {
                subCrit = this.updateCriteriaFieldNames(subCrit);
            } else {
                if (!subCrit.fieldName) {
                    subCrit.fieldName = this.getCriteriaFieldName();
                }
            }
        }

        return crit;
    },
    
    setValue : function (value) {
        value = this.matchCriteria(value);
        this.Super("setValue", arguments);
    },
    
    setValueMap : function (valueMap) {
        // valueMap is not supported for this FormItem type - we use this.options instead - 
        // ignore this call
        return null;
    },
    
    canEditCriterion : function (criterion) {
        var fieldNames = isc.DS.isAdvancedCriteria(criterion) ?
                isc.DS.getCriteriaFields(criterion).getUniqueItems() :
                criterion.criteria ? criterion.criteria.getProperty("fieldName").getUniqueItems() :
                [criterion.fieldName]
        ;
        
        var fieldName = this.getCriteriaFieldName();
        return fieldNames.contains(fieldName);
    },

    setCriterion : function (criterion) {
        this.setValue(isc.shallowClone(criterion));
    },

    // find the entry in this.options that maps to the criteria object passed in
    matchCriteria : function (criteria, passedOptions) {
        var options = passedOptions || this.options;

        // if passed null, return null - otherwise, a null customOption would be selected
        if (criteria == null) return null;
        for (var key in options) {
            var option = options[key];

            if (this.objectsAreEqual(option, criteria)) {
                return key;
            } else {
                // if an AdvancedCriteria with only one entry in the criteria-array, compare
                // just that criteria-entry - this fixes a problem where user-criteria might
                // be simplified during filter and no longer match, while still being equivalent 
                var flatOption = isc.DS.compressNestedCriteria(isc.shallowClone(option));
                if (flatOption.criteria && flatOption.criteria.length == 1) {
                    flatOption = flatOption.criteria[0];
                }
                if (this.objectsAreEqual(flatOption, criteria)) {
                    return key;
                }
            }
        }

        return criteria;
    },

    // helper method to compare the properties on two objects, not dissimilar to 
    // DS.compareCriteria
    objectsAreEqual : function (object1, object2) {
        if (!object1 && !object2) return true;
        if (!object1 || !object2) return false;

        for (var key in object1) {
            if (key == "_constructor") continue;

            var prop1 = object1[key],
                prop2 = object2[key]
            ;

            if (isc.isAn.Array(prop1)) {
                for (var i=0; i<prop1.length; i++) {
                    if (isc.isAn.Object(prop1[i])) {
                        if (!this.objectsAreEqual(prop1[i], prop2[i])) return false;
                    } else {
                        if (prop1[i] != prop2[i]) return false;
                    }
                }
            
            } else if (isc.isA.Date(prop1)) {
                if (isc.DateUtil.compareDates(prop1, prop2) != 0) return false;
            } else if (isc.isAn.Object(prop1)) {
                if (!this.objectsAreEqual(prop1, prop2)) return false;
            } else {
                if (object1[key] != object2[key]) return false;
            }
        }
        return true;
    }


});

//> @class PresetDateRangeItem
// Allows the user to pick from pre-set date ranges or choose a custom date range via a
// +link{DateRangeDialog}.
// <P>
// To use this item in the +link{listGrid.showFilterEditor,FilterEditor} or 
// +link{FilterBuilder}, create a trivial +link{ClassFactory.defineClass,subclass} which 
// defines +link{presetCriteriaItem.options,preset options}, then set
// +link{listGridField.filterEditorType} to use this class with the FilterEditor, or define a
// custom operator and set +link{operator.editorType} to use it with the FilterBuilder.
// <P>
// See the +explorerExample{dateRangeFilterPresets,Date Range (Presets)} example for sample code.
// @inheritsFrom PresetCriteriaItem
// @visibility external
//<
isc.defineClass("PresetDateRangeItem", "PresetCriteriaItem");

isc.PresetDateRangeItem.addProperties({

    customOptionTitle: "Custom Date Range",

    getCustomCriteria : function (callback) {
        this._callback = callback;
        isc.DateRangeDialog.askForRange(
            true, { 
                returnCriterion: true, criteriaField: this.getCriteriaFieldName(), 
                value: this.options["customOption"]
            }, null, 
            this.getID()+".getCustomCriteriaReply(value)"
        );
    },

    getCustomCriteriaReply : function (criteria,title) {
        var callback = this._callback;
        delete this._callback;
        // clear the item, call super to store the new value, and then call pickValue()
        this.clearValue();
        this.Super("getCustomCriteriaReply", arguments);
        this.pickValue("customOption", true);
    },

    //> @method presetDateRangeItem.getCriterion()
    // Get the criterion based on the value selected by the user.
    //
    // @return (Criterion | AdvancedCriteria) the criteria for the selected option
    // 
    // @visibility external
    //<
    getCriterion : function () {
        var key = this.getValue(),
            criterion = this.options[key]
        ;
        return criterion;
    },

    // hasInternalNavigation is true for PresetCriteriaItem - used by ComponentEditor
    hasInternalNavigation: true
});

}

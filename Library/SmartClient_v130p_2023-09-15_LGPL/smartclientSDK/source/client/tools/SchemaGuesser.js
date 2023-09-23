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
// ----------------------------------------------------------------------------------------

//> @class SchemaGuesser
// Class for deriving field types from a list of objects (records). These records are
// commonly imported from a CSV file as fields of string values. The field values are
// scanned to smartly determine the corresponding types and a resulting set of
// DataSourceFields are returned. 
//
// @treeLocation Client Reference/Data Binding
// @visibility schemaGuesser
//<
isc.defineClass("SchemaGuesser");

isc.SchemaGuesser.addClassProperties({

    //> @type SchemaGuessDetailReason
    // Reason why a field type was chosen that is more general than the values
    // may indicate.
    //
    // @value tooFewExamples
    // There were not enough values provided from which to confidently determine the
    // field type. Minimum value count can be configured with +link{schemaGuesser.minExampleCount}.
    // @value tooManySpecialValues
    // A field type appears to be correct because there are more valid values than there
    // are invalid values but the invalid values cannot be reduced to a single special
    // value to be used as +link{DataSourceField.emptyDisplayValue}.
    //
    // @visibility schemaGuesser
    //<
    TOO_FEW_EXAMPLES:"tooFewExamples",
    TOO_MANY_SPECIAL_VALUES:"tooManySpecialValues"
});

isc.SchemaGuesser.addProperties({

    //> @attr schemaGuesser.fields (Array of DataSourceField : null : IRW)
    // Optional list of +link{class:DataSourceField,DataSourceFields} to be used for
    // type specification instead of deriving the details.
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuesser.dataSourceName (String : null : IRW)
    // Name of the DataSource for which the data is being processed. It is used to
    // identify potential primaryKey fields.
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuesser.detectPrimaryKey (Boolean : null : IRW)
    // Should a primary key be detected from the field values where possible?
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuesser.derivedFields (Array of DataSourceField : null : R)
    // List of +link{class:DataSourceField,DataSourceFields} as derived from the source data.
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuesser.parseDetails (Array of SchemaGuessDetail : null : R)
    // Details on fields whose type was ambiguous.
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuesser.minExampleCount (int : 3 : IRW)
    // Minimum matching examples before a specialized type can be confirmed.
    //
    // @visibility schemaGuesser
    //<
    
    minExampleCount: 3,

    //> @attr schemaGuesser.minDateYear (int : 1970 : IRW)
    // Minimum year to match when examining a set of values that could also be
    // matched as a float (i.e. using decimal point as separator).
    //
    // @visibility schemaGuesser
    //<
    minDateYear: 1970,

    //> @attr schemaGuesser.centuryThreshold (Integer : 25 : IRW)
    // For date formats that support a 2 digit year, if parsed year is 2 digits and less than this
    // number, assume year to be 20xx rather than 19xx.
    // @visibility schemaGuesser
    //<
    centuryThreshold: 25,

    //> @attr schemaGuesser.treatEmptyValueAsBooleanFalse (Boolean : true : IRW)
    // When detecting a boolean field, should empty or null values be treated as false?
    //
    // @visibility schemaGuesser
    //<
    treatEmptyValueAsBooleanFalse: true,

    //> @attr schemaGuesser.valueEquivalences (Array of Equivalence : [...] : IRW)
    // List of equivalence values used when determining emptyDisplayValue. Each object
    // contains <code>value</code> and <code>equivalent</code> attributes for the mapping.
    // Only one pair of mapped values needs to be entered into the list as processing
    // will map either direction.
    // <p>
    // Default value:
    // <pre>
    //   NA: N/A
    // </pre>
    //
    // @visibility schemaGuesser
    //<
    valueEquivalences: [
        { value: "NA", equivalent: "N/A" }
    ],

    //> @attr schemaGuesser.booleanTrueValues (Array of String : [...] : IRW)
    // List of values that are to be interpreted as a boolean <code>true</code> value.
    // Values are always matched as lower case.
    // <p>
    // Default value:
    // <pre>
    //   [ "t", "true", "yes", "[x]", "1" ]
    // </pre>
    //
    // @visibility schemaGuesser
    //<
    booleanTrueValues:  ["t", "true", "yes", "[x]", "1" ],

    //> @attr schemaGuesser.booleanFalseValues (Array of String : [...] : IRW)
    // List of values that are to be interpreted as a boolean <code>false</code> value.
    // Values are always matched as lower case.
    // <p>
    // Default value:
    // <pre>
    //   [ "f", "false", "no", "[ ]", "0" ]
    // </pre>
    //
    // @visibility schemaGuesser
    //<
    booleanFalseValues: ["f", "false", "no", "[]", "[ ]", "0" ],
    
    //> @attr schemaGuesser.decimalSymbol (String : null : IR)
    // The decimal symbol to use when parsing numbers. Defaults from +link{numberUtil.decimalSymbol}.
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuesser.groupingSymbol (String : null : IR)
    // The grouping symbol, or thousands separator, to use when parsing numbers.
    // Defaults from +link{numberUtil.groupingSymbol}.
    // @visibility schemaGuesser
    //<

    // Year range for detecting timeStamps. +/- timeStampYearRange from current date
    timeStampYearRange: 5

    // ---------------------------------------------------------------------------------------
    //> @object SchemaGuessDetail
    // Details on +link{class:SchemaGuesser} parse exceptions.
    //
    // @treeLocation Client Reference/Data Binding/SchemaGuesser
    // @visibility schemaGuesser
    //<
    
    //> @attr schemaGuessDetail.fieldName (String : null : R)
    // Field name for detail.
    //
    // @visibility schemaGuesser
    //<
    
    //> @attr schemaGuessDetail.detectedAs (String : null : R)
    // +link{type:FieldType} as detected.
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuessDetail.couldBe (String : null : R)
    // +link{type:FieldType} that the field could be if not for
    // +link{reason}.
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuessDetail.reason (SchemaGuessDetailReason : null : R)
    // Reason why field was not detected as the more specific +link{couldBe}.
    //
    // @visibility schemaGuesser
    //<

    //> @attr schemaGuessDetail.message (String : null : R)
    // A user-friendly message describing the +link{reason}.
    //
    // @visibility schemaGuesser
    //<

    // ---------------------------------------------------------------------------------------
    //> @object Equivalence
    // Definition of string equivalence for special values.
    //
    // @treeLocation Client Reference/Data Binding/SchemaGuesser
    // @visibility schemaGuesser
    //<
    
    //> @attr equivalence.value (String : null : IR)
    // Value that is considered equivalent to +link{equivalent}.
    // @visibility schemaGuesser
    //<

    //> @attr equivalence.equivalent (String : null : IR)
    // Equivalent value to +link{value}
    // @visibility schemaGuesser
    //<
});

isc.SchemaGuesser.addMethods({

    init : function () {
        this.Super("init", arguments);

        // Type processes
        this._typeProcessMethods = {
            "boolean":        { fieldType: "boolean",  canConvert: this.isBoolean,        convert: this.toBoolean },
            "time":           { fieldType: "time",     canConvert: this.isTime,           convert: this.toTime },
            "dateTimeYMD":    { fieldType: "datetime", canConvert: this.isDateTimeYMD,    convert: this.toDateTimeYMD },
            "dateTimeMDY":    { fieldType: "datetime", canConvert: this.isDateTimeMDY,    convert: this.toDateTimeMDY },
            "dateTimeDMY":    { fieldType: "datetime", canConvert: this.isDateTimeDMY,    convert: this.toDateTimeDMY },
            "dateTimeSchema": { fieldType: "datetime", canConvert: this.isDateTimeSchema, convert: this.toDateTimeSchema },
            "timeStamp":      { fieldType: "datetime", canConvert: this.isTimeStamp,      convert: this.toTimeStamp },
            "dateYM":         { fieldType: "date",     canConvert: this.isDateYM,         convert: this.toDateYM },
            "dateMY":         { fieldType: "date",     canConvert: this.isDateMY,         convert: this.toDateMY },
            "dateYMD":        { fieldType: "date",     canConvert: this.isDateYMD,        convert: this.toDateYMD },
            "dateMDY":        { fieldType: "date",     canConvert: this.isDateMDY,        convert: this.toDateMDY },
            "dateDMY":        { fieldType: "date",     canConvert: this.isDateDMY,        convert: this.toDateDMY },
            "integer":        { fieldType: "integer",  canConvert: this.isInteger,        convert: this.toInteger },
            "float":          { fieldType: "float",    canConvert: this.isFloat,          convert: this.toFloat }
            // text fields have no need for detection or conversion
        };
        
    },

    //> @method schemaGuesser.extractFieldsFrom
    // Extract +link{class:DataSourceField,fields} from records.
    //
    // @param data (Array of Record) The records to process
    // @return (Array of DataSourceField) extracted fields
    // @visibility schemaGuesser
    //<
    extractFieldsFrom : function (data) {
        if (data && !isc.isAn.Array(data)) data = [data];
        if (!data || data.length == 0) {
            this.logWarn("Missing or empty data - Cannot extract field types");
            return null;
        }

        this.resetState();

        this.recordCount = data.length;
        this.classifyValues(data);
        this.extractEmptyDisplayValues(data);
        this.deriveTypes();

        if (this.detectPrimaryKey) {
            this.findPrimaryKey(data);
        }
        
        // sort new fields using this.fields
        if (this.keepFieldOrder) {
            this.restoreOriginalFieldOrder();
        }

        this.derivedFields = this.createFields();

        return this.derivedFields;
    },

    //> @method schemaGuesser.convertData
    // Convert record values to match derived field types. +link{extractFieldsFrom} must
    // have been called previously.
    //
    // @param data (Array of Record) The records to process
    // @return (Array of Record) converted records
    // @visibility schemaGuesser
    //<
    convertData : function (data) {
        if (!this._fieldState) {
            this.logWarn("extractFieldsFrom must be called before parsed data can be fetched");
            return null;
        }

        if (!data || (data && isc.isAn.Array(data) && data.length == 0)) return data;

        return this.convertValues(data);
    },

    resetState : function () {
        // Clear result properties
        this.derivedFields = [];
        this.parsedFields = [];
        this.parsedData = [];
        this.parseDetails = [];

        // Clear internal state
        this._fieldState = {};
    },

    classifyValues : function (data) {

        for (var i = 0; i < data.length; i++) {
            var record = data[i];

            for (var fieldName in record) {
                var fieldState = this._fieldState[fieldName];
                if (!fieldState) {
                    fieldState = this._fieldState[fieldName] = this.createFieldState(fieldName);
                }

                // All values are assumed to be strings
                var value = record[fieldName];

                // Ignore nested objects
                if (isc.isAn.Object(value)) {
                    continue;
                }

                // Count and skip empty values
                if (value == null || (isc.isA.String(value) && !isc.isA.nonemptyString(value))) {
                    fieldState.emptyValueCount++;
                    continue;
                }
                if (!isc.isA.String(value)) {
                    value = ""+value;
                }

                for (var typeName in this._typeProcessMethods) {

                    var type = this._typeProcessMethods[typeName];
                    if (this.fireCallback(type.canConvert, "value", [value])) {
                        fieldState[typeName].valueCount++;
                    } else {
                        fieldState[typeName].badValueCount++;
                        if (!fieldState[typeName].badValues.contains(value)) {
                            fieldState[typeName].badValues.add(value);
                        }
                    }
                }
            }
        }
    },

    extractEmptyDisplayValues : function (data) {

        // If there are not enough records to choose a specific type, there aren't enough
        // records to determine and emptyDisplayValue
        if (this.recordCount < this.minExampleCount) {
            return;
        }

        for (var fieldName in this._fieldState) {
            var fieldState = this._fieldState[fieldName];

            for (var typeName in this._typeProcessMethods) {
                var typeState = fieldState[typeName],
                    badValues = typeState.badValues,
                    emptyDisplayValue = null,
                    nullValues = []
                ;

                // An emptyDisplayValue cannot be applied if there are empty values (i.e. "" or null)
                // unless those are being mapped to false for a boolean field
                if (typeName != "boolean" && fieldState.emptyValueCount > 0) {
                    continue;
                }

                if (badValues.length > 0) {
                    // Normalize the values to a single case and keep up with
                    // variants found.
                    var specialValue = { lowerValue: null, variants: [] };

                    for (var i = 0; i < badValues.length; i++) {
                        var badValue = badValues[i],
                            lowerBadValue = badValue.toLowerCase(),
                            equivalences = this.getValueEquivalences(badValue)
                        ;
                        if (specialValue.lowerValue) {
                            var haveEquivalent = false;
                            for (var j = 0; j < equivalences.length; j++) {
                                var checkValue = equivalences[j],
                                    lowerCheckValue = checkValue.toLowerCase()
                                ;

                                if (specialValue.lowerValue && specialValue.lowerValue == lowerCheckValue) {
                                    haveEquivalent = true;
                                    break;
                                }
                            }

                            if (!haveEquivalent && specialValue.lowerValue != lowerBadValue && !fieldState.detectedAs) {
                                // More than one unique value - no emptyDisplayValue possible
                                specialValue = null;
                                break;
                            }
                        }

                        if (!specialValue.lowerValue) specialValue.lowerValue = lowerBadValue;
                        if (!specialValue.variants.contains(badValue)) specialValue.variants.add(badValue);
                    }
                    if (specialValue) {
                        var highestCount = -1;
                        for (var j = 0; j < specialValue.variants.length; j++) {
                            
                            var value = specialValue.variants[j],
                                matches = data.findAll(fieldName, value),
                                count = (matches ? matches.length : 0)
                            ;
                            if (count > highestCount) {
                                highestCount = count;
                                emptyDisplayValue = value;
                            }

                            // Remove special value from badValues
                            badValues.remove(value);

                            // Save value to be translated to null on input
                            nullValues.add(value);
                        }
                    }
                }
                if (emptyDisplayValue && typeName == "boolean") {
                    var otherValues = [];
                    data.map(function(record) {
                        var value = record[fieldName];
                        if (value == null || otherValues.length > 2) return;
                        if (!isc.isA.String(value)) value = "" + value;
                        var lowerValue = value.toLowerCase();
                        if (!otherValues.contains(lowerValue) && !nullValues.contains(value)) otherValues.add(lowerValue);
                    });
                    if (otherValues.length == 1) {
                        emptyDisplayValue = null;
                        typeState.badValues.addList(nullValues);
                    }
                }
                if (emptyDisplayValue) {
                    typeState.emptyDisplayValue = emptyDisplayValue;
                    typeState.nullValues = nullValues;
                }
            }
        }
    },

    deriveTypes : function () {
        for (var fieldName in this._fieldState) {
            var fieldState = this._fieldState[fieldName];

            var specificTypeDetail = this.chooseType(fieldState),
                broadTypeDetail = null
            ;

            if (specificTypeDetail.type) {
                // Find a broad type that has no bad values (including an emptyDisplayValue).
                // This type will be the fallback type if an exception is found. 
                // No danger of infinite loop because worst case leads to "text"
                // field which has no typeProcessName and ends the search.
                var skipTypes = [specificTypeDetail.typeProcessName];
                while (!broadTypeDetail) {
                    var typeDetail = this.chooseType(fieldState, skipTypes);
                    if (!typeDetail.typeProcessName ||
                        (fieldState[typeDetail.typeProcessName].badValues.length == 0 &&
                            (this.recordCount > this.minExampleCount ||
                                fieldState[typeDetail.typeProcessName].emptyDisplayValue == null)))
                    {
                        broadTypeDetail = typeDetail;
                    }
                    skipTypes.add(typeDetail.typeProcessName);
                }
            }

            var detectedTypeDetail = specificTypeDetail,
                couldBeTypeDetail = null,
                detail = null
            ;

            // A detected boolean field with badValues and no emptyDisplayValue
            // shouldn't be reported as a "couldBe" type below because the values are
            // clearly not really boolean.
            if (detectedTypeDetail.typeProcessName == "boolean") {
                if (fieldState[detectedTypeDetail.typeProcessName].emptyDisplayValue == null &&
                    fieldState[detectedTypeDetail.typeProcessName].badValues.length > 0)
                {
                    detectedTypeDetail = broadTypeDetail;
                }
            }

            if (!fieldState.detectedAs) {
                if (broadTypeDetail && this.recordCount < this.minExampleCount) {
                    couldBeTypeDetail = detectedTypeDetail;
                    detectedTypeDetail = broadTypeDetail;
                    fieldState.reason = isc.SchemaGuesser.TOO_FEW_EXAMPLES;
                    detail = {
                            message: "Field '" + fieldName + "' was detected as " + 
                            detectedTypeDetail.type + " despite having only " +
                            couldBeTypeDetail.type + " values because only " + 
                            this.recordCount + " records were provided."
                    };
                    if (couldBeTypeDetail.type == "boolean") {
                        detail.message += " To force detection as boolean use 'F' and 'T' values.";
                    }
                } else if (broadTypeDetail &&
                        detectedTypeDetail.typeProcessName &&
                        fieldState[detectedTypeDetail.typeProcessName].badValues.length > 0 &&
                        fieldState[detectedTypeDetail.typeProcessName].badValues.length <= 3)
                {
                    couldBeTypeDetail = detectedTypeDetail;
                    detectedTypeDetail = broadTypeDetail;
                    fieldState.reason = isc.SchemaGuesser.TOO_MANY_SPECIAL_VALUES;
                    detail = {
                            message: "Field '" + fieldName + "' was detected as " +
                            detectedTypeDetail.type + " despite having many " +
                            couldBeTypeDetail.type + " values because it had more than one special value." + 
                            " If data is modified so that only one special value is used, field will be detected as type " + couldBeTypeDetail.type,
                            specialValues: fieldState[couldBeTypeDetail.typeProcessName].badValues
                    };
                }
            }

            if (!fieldState.detectedAs) {
                if (couldBeTypeDetail || detail) {
                    if (!detail) detail = {};

                    detail.fieldName = fieldName;
                    detail.detectedAs = detectedTypeDetail.type;
                    detail.couldBe = couldBeTypeDetail.type;
                    detail.reason = fieldState.reason;

                    if (detail.detectedAs != detail.couldBe) {
                        this.parseDetails.add(detail);
                    }
                }
            }

            if (detectedTypeDetail.addEmptyDisplayValue &&
                detectedTypeDetail.typeProcessName &&
                fieldState[detectedTypeDetail.typeProcessName])
            {
                var state = fieldState[detectedTypeDetail.typeProcessName];
                if (state.emptyDisplayValue) fieldState.emptyDisplayValue = state.emptyDisplayValue;
                if (state.nullValues) fieldState.nullValues = state.nullValues;
            }

            if (!fieldState.detectedAs) {
                fieldState.detectedAs = detectedTypeDetail.type;
                if (couldBeTypeDetail) fieldState.couldBe = couldBeTypeDetail.type;
            }

            fieldState.typeProcessName = detectedTypeDetail.typeProcessName;
        }
    },

    

    // Suffixes to try when looking for a PK field by name. Each will be tried as-is
    // and also with a leading underscore (_).
    _pkFieldSuffixes: ["", "id", "sku", "number", "code", "seq"],

    findPrimaryKey : function (data) {

        // Primary key must:
        //  * have all non-null values
        //  * have all unique values
        //  * non-integer fields considered only if:
        //     * none of the values have punctuation other than _ or - and must have no spaces
        //     * all of the values have a common prefix and end in a number
        //         example: PKSV15-220

        // Assemble list of possible field states that meet criteria above except for
        // uniqueness. That is checked next.
        var possibleFieldStates = {};
        for (var fieldName in this._fieldState) {
            var fieldState = this._fieldState[fieldName];

            var type = fieldState.detectedAs;
            if (type && type == "integer" && fieldState.emptyValueCount == 0) {
                possibleFieldStates[fieldName] = fieldState;
            } else {
                var valid = true,
                    validRegex = /^[a-zA-Z0-9_\-]*\d+$/,
                    prefix
                ;
                // Determine if the values are valid for a potential PK including identifying
                // a common prefix, if any
                for (var i = 0; i < data.length; i++) {
                    var record = data[i],
                        fieldValue = record[fieldName]
                    ;
                    if (!validRegex.test(fieldValue)) {
                        // Found an invalid value - bail
                        valid = false;
                        break;
                    }

                    if (i == 0) {
                        prefix = fieldValue;
                    } else {
                        var length = Math.min(prefix, fieldValue.length);

                        for (var j = 0; j < length; j++) {
                            if (prefix.charAt(j) != fieldValue.charAt(j)) {
                                prefix = (j == 0 ? "" : prefix.substring(0,j));
                                break;
                            }
                        }
                        if (prefix.length == 0) {
                            // No common prefix
                            valid = false;
                            break;
                        }
                    }
                    if (prefix && prefix.length > 0) {
                        fieldState.valuePrefix = prefix;
                    }
                }
                if (valid) {
                    possibleFieldStates[fieldName] = fieldState;
                }
            }
        }

        // Out of the possible field states pull the valid ones that have all unique values
        var validFieldStates = {};
        for (var fieldName in possibleFieldStates) {
            var fieldState = possibleFieldStates[fieldName],
                values = data.getProperty(fieldName),
                onlyUnique = function (value, index, self) { 
                    return self.indexOf(value) === index;
                },
                uniqueValues = values.filter(onlyUnique)
            ;

            if (uniqueValues.length == values.length) {
                validFieldStates[fieldName] = fieldState;
            }
        }

        // validFieldStates is now all fields that could be PK
        var validPKFieldCount = isc.getKeys(validFieldStates).length;

        for (var fieldName in validFieldStates) {
            var fieldState = validFieldStates[fieldName];

            var tightness = this._getValueTightness(fieldName, fieldState, data);
        }

        if (validPKFieldCount == 0 || data.length < 3) {
            // No possible PK fields or not enough data to tell
            return;
        }

        // One or more valid PK fields
        var pkFieldState;

        // Preference is to find PK fields with this priority:
        //   1. fields whose name end in the DataSource name + "Id" or "_ID" 
        //      (or whose entire name is just ID)
        //   2. same as #1, but remove trailing S if there is one (to discover eg
        //      employeeID PK in a DS named employees)
        //   3. if the DataSource name is in camelCaps, break it into constituent words
        //      and try each with "id" and "_id" suffixes (to discover eg
        //      orderDetails.detailID).  Here also, if there is an "S" at the end of one
        //      of the camelCaps words, try with and without the S
        //   4. fields whose name is the same as the DataSource name or any camels
        //      (to discover eg employee.employee)
        //
        // Make all comparisons case-insensitive

        // Start with an empty string prefix. This provides a way to check for fields
        // that are named only by the suffix below like "sku"
        var prefixes = [""];
        if (this.dataSourceName) {
            // Remove any trailing numbers from the DS name. Given employees2
            // we don't want to look for employees2Id but rather employeesId, etc.
            var dsName = this.dataSourceName.replace(/\d+$/, "");

            // Start by matching the full DS name with various suffixes. Then try without
            // a trailing "s".
            //
            // Next we will try stripping segments off of the name, if it is in camel case.
            // We do this by removing the leading segment one at a time going from most
            // specific possibility to least specific. For example, given myOrderItems25
            // we want to try myOrderItemsId, myOrderItemId (trailing s removed),
            // orderItemsId, orderItemId, itemsId and itemId.
            //
            // This order is critical to finding the correct PK instead of a potential FK.
            // For a DS orderItem we want to find "orderItemId" before falling back to
            // "itemId" or "orderId".
            //
            // Rather than creating a special means to extract name segments from a camel-
            // cased string just use the getAutoTitle() function which creates a title
            // string by breaking the string apart at camel casing and inserts spaces
            // between the segments.
            var segments = isc.DS.getAutoTitle(dsName).toLowerCase().split(" ");
            for (var i = 0; i < segments.length; i++) {
                var name = segments.slice(i).join('');
                prefixes.add(name);
                if (name.endsWith("s")) {
                    prefixes.add(name.slice(0,-1));
                }
            }

            // Finally try individual segments. Last segment was handled above.
            // This would pick up orderId and myId in the above example.
            segments = segments.reverse().slice(1);
            for (var i = 0; i < segments.length; i++) {
                prefixes.add(segments[i]);
            }
        }

        // Assemble all suffixes to try for each prefix. These are from the core
        // _pkFieldSuffix list but also include the value with leading underscore.
        var suffixes = [];
        for (var i = 0; i < this._pkFieldSuffixes.length; i++) {
            var suffix = this._pkFieldSuffixes[i];
            suffixes.add(suffix);
            if (suffix.length > 0) {
                suffixes.add("_" + suffix);
            }
        }

        // Try all prefix/suffix combinations until a match is found. Note that we try
        // all variations of a suffix before moving on to the next one. For a DS
        // myOrderItems25 we find itemId even if there are fields "sku" and "number".
        for (var i = 0; i < suffixes.length && !pkFieldState; i++) {
            for (var j = 0; j < prefixes.length && !pkFieldState; j++) {
                var name = prefixes[j] + suffixes[i];
                if (name.length == 0) continue;

                for (var fieldName in validFieldStates) {
                    if (!pkFieldState && name == fieldName.toLowerCase()) {
                        pkFieldState = validFieldStates[fieldName];
                    }
                }
            }
        }

        // No PK field identified yet
        if (!pkFieldState) {
            // Final priority check:
            //   5. appears earliest (any later fields are likely to be FKs), unless the
            //      earliest field is a string, in which case, take the first numeric
            for (var fieldName in validFieldStates) {
                var fieldState = validFieldStates[fieldName];
                if (fieldState.detectedAs == "integer") {
                    // Only use this matched as PK
                    //   - if we 10 or more records OR
                    //   - we have 3-9 records, a numeric field, and "tightness" < 2

                    if (data.length >= 10) {
                        pkFieldState = fieldState;
                        break;
                    } else if (data.length >= 3 && fieldState.detectedAs == "integer") {
                        var fieldName = fieldState.name;
                        if (data[0][fieldName] == "0" || data[0][fieldName] == "1") {
                            var tightness = this._getValueTightness(fieldName,
                                                                    fieldState, data);
                            if (tightness < 2) {
                                pkFieldState = fieldState;
                                pkFieldState.primaryKey = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (pkFieldState) {
            pkFieldState.primaryKey = true;
        }
    },

    _getValueTightness : function (fieldName, fieldState, data) {
        var values;
        // If prefixed field values are used, remove prefix and punctuation from each value
        if (fieldState.valuePrefix) {
            var prefixLength = fieldState.valuePrefix.length;
            values = data.map(function(record) {
                return record[fieldName].substring(prefixLength).replace(/[^a-zA-Z0-9]/, "");
            });
        } else {
            values = data.getProperty(fieldName);
        }

        // Convert values in place. There are no empty values in the array.
        var convert = this._typeProcessMethods["integer"].convert,
            prevValue,
            gaps = 0
        ;
        for (var i = 0; i < values.length; i++) {
            var value = values[i] = this.fireCallback(convert, "value", [values[i]]);
            if (prevValue != null) {
                if (value < prevValue) {
                    // Data is not sequential so gaps makes no sense
                    gaps = -1;
                    break;
                } else if (value != prevValue+1) {
                    gaps++;
                }
            }
            prevValue = value;
        }
        return gaps;
    },

    // Set of checks performed to identify a potential field type. The order of detection
    // is important. When determining the fallback type, types will skipped until a type
    // is found without bad values.
    //
    // The 'type' property is used for skipping types and is also assigned to typeDetail
    // as 'typeProcessName' if the matches() function returns true. Once a type check
    // matches() returns true no more checks are done.
    //
    // A type check can set properties on typeDetail if desired but 'typeProcessName' is
    // handled automatically.

    

    _typeChecks: [
        { type: "boolean", matches : function (fieldState, emptyValueCount, typeDetail) {
            if (fieldState.boolean.valueCount > emptyValueCount &&
                ((this.treatEmptyValueAsBooleanFalse ? 0 : emptyValueCount) +
                    fieldState.boolean.badValues.length <= 1))
            {
                typeDetail.addEmptyDisplayValue = (emptyValueCount == 0 || this.treatEmptyValueAsBooleanFalse);
                return true;
            }
        }},
        { type: "time", matches : function (fieldState, emptyValueCount, typeDetail) {
            // Don't detect as time if all values parse as float
            return (fieldState.time.valueCount > emptyValueCount &&
                    fieldState.time.badValues.length <= 3 &&
                    fieldState.float.badValues.length > 0);
        }},
        { type: "dateTimeYMD", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateTimeYMD.valueCount > emptyValueCount &&
                    fieldState.dateTimeYMD.badValues.length <= 3 &&
                    fieldState.dateTimeYMD.valueCount >= fieldState.dateTimeMDY.valueCount &&
                    fieldState.dateTimeYMD.valueCount >= fieldState.dateTimeDMY.valueCount);
        }},
        { type: "dateTimeMDY", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateTimeMDY.valueCount > emptyValueCount &&
                    fieldState.dateTimeMDY.badValues.length <= 3 &&
                    fieldState.dateTimeMDY.valueCount >= fieldState.dateTimeDMY.valueCount);
        }},
        { type: "dateTimeDMY", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateTimeDMY.valueCount > emptyValueCount &&
                    fieldState.dateTimeDMY.badValues.length <= 3);
        }},
        { type: "dateTimeSchema", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateTimeSchema.valueCount > emptyValueCount &&
                    fieldState.dateTimeSchema.badValues.length <= 3);
        }},
        { type: "timeStamp", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateTimeSchema.valueCount > 15 &&
                    fieldState.dateTimeSchema.valueCount > emptyValueCount &&
                    fieldState.dateTimeSchema.badValues.length <= 3);
        }},
        { type: "dateYM", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateYM.valueCount > emptyValueCount &&
                    fieldState.dateYM.badValues.length <= 3 &&
                    fieldState.dateYM.valueCount >= fieldState.dateMY.valueCount &&
                    fieldState.dateYM.valueCount >= fieldState.dateYMD.valueCount &&
                    fieldState.dateYM.valueCount >= fieldState.dateMDY.valueCount &&
                    fieldState.dateYM.valueCount >= fieldState.dateDMY.valueCount);
        }},
        { type: "dateMY", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateMY.valueCount > emptyValueCount &&
                    fieldState.dateMY.badValues.length <= 3 &&
                    fieldState.dateMY.valueCount >= fieldState.dateYMD.valueCount &&
                    fieldState.dateMY.valueCount >= fieldState.dateMDY.valueCount &&
                    fieldState.dateMY.valueCount >= fieldState.dateDMY.valueCount);
        }},
        { type: "dateYMD", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateYMD.valueCount > emptyValueCount &&
                    fieldState.dateYMD.badValues.length <= 3 &&
                    fieldState.dateYMD.valueCount >= fieldState.dateMDY.valueCount &&
                    fieldState.dateYMD.valueCount >= fieldState.dateDMY.valueCount);
        }},
        { type: "dateMDY", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateMDY.valueCount > emptyValueCount &&
                    fieldState.dateMDY.badValues.length <= 3 &&
                    fieldState.dateMDY.valueCount >= fieldState.dateDMY.valueCount);
        }},
        { type: "dateDMY", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.dateDMY.valueCount > emptyValueCount &&
                    fieldState.dateDMY.badValues.length <= 3);
        }},
        { type: "integer", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.integer.valueCount > emptyValueCount &&
                    fieldState.integer.badValues.length <= 3 &&
                    fieldState.integer.valueCount >= fieldState.float.valueCount);
        }},
        { type: "float", matches : function (fieldState, emptyValueCount, typeDetail) {
            return (fieldState.float.valueCount > emptyValueCount &&
                    fieldState.float.badValues.length <= 3);
        }}
    ],

    chooseType : function (fieldState, skipTypes) {
        if (!skipTypes) skipTypes = [];
        var emptyValueCount = fieldState.emptyValueCount;

        var typeDetail = {
            addEmptyDisplayValue: null
        };

        var checks = this._typeChecks;
        for (var i = 0; i < checks.length; i++) {
            var check = checks[i];
            if (!skipTypes.contains(check.type) &&
                (!fieldState.detectedAs ||
                    this._typeProcessMethods[check.type].fieldType == fieldState.detectedAs) &&
                this.fireCallback(check.matches,
                                  "fieldState, emptyValueCount, typeDetail",
                                  [fieldState, emptyValueCount, typeDetail]))
            {
                typeDetail.typeProcessName = check.type;
                break;
            }
        }
        if (typeDetail.typeProcessName) {
            typeDetail.type = fieldState[typeDetail.typeProcessName].fieldType;
            if (typeDetail.addEmptyDisplayValue == null) {
                typeDetail.addEmptyDisplayValue = (emptyValueCount == 0);
            }
        } else if (!fieldState.detectedAs) {
            typeDetail.type = "text";
            typeDetail.addEmptyDisplayValue = false;
        }

        return typeDetail;
    },

    
    restoreOriginalFieldOrder : function () {
        var newState = {},
            oldState = this._fieldState;
        // reorder the field state to reflect this.fields
        for (var i = 0; i < this.fields.length; i++) {
            var fieldName = this.fields[i].name;
            if (fieldName in oldState) {
                newState[fieldName] = oldState[fieldName];
                delete oldState[fieldName];
            }
        }
        this._fieldState = newState;

        // report any dropped fields (undeclared attributes)
        var dropped = [];
        for (fieldName in oldState) {
            dropped.add(fieldName);
        }
        if (dropped.length) {
            this.logInfo("dropped fields " + dropped +
               " not present in your field definitions");
        }
    },

    createFields : function () {
        var fields = [];

        for (var fieldName in this._fieldState) {
            var fieldState = this._fieldState[fieldName];

            var type = fieldState.detectedAs || "text",
                field = isc.addProperties({}, fieldState.fieldTemplate, {
                    name: fieldName,
                    type: type
                })
            ;
            if (fieldState.primaryKey) field.primaryKey = fieldState.primaryKey;
            if (fieldState.emptyDisplayValue) field.emptyDisplayValue = fieldState.emptyDisplayValue;

            fields.add(field);
        }

        if (this.fields) {
            for (var i = 0; i < this.fields.length; i++) {
                var field = this.fields[i];
                if (field.name) {
                    if (!fields.containsProperty("name", field.name)) {
                        fields.add(isc.addProperties({}, field));
                    }
                }
            }
        }

        return fields;
    },

    convertValues : function (data) {
        var fields = this.derivedFields,
            parsedData = [],
            failures = {}
        ;
        for (var i = 0; i < data.length; i++) {
            var record = data[i],
                newRecord = {}
            ;

            for (var fieldName in this._fieldState) {
                var fieldState = this._fieldState[fieldName],
                    type = fieldState.detectedAs || "text",
                    typeIsSpecified = (fieldState.detectedAs &&
                                       fieldState.fieldTemplate &&
                                       fieldState.fieldTemplate.type == fieldState.detectedAs),
                    origValue = record[fieldName],
                    value = origValue,
                    convert = (fieldState.typeProcessName && this._typeProcessMethods[fieldState.typeProcessName].convert
                            ? this._typeProcessMethods[fieldState.typeProcessName].convert : this.toText)
                ;

                // Ignore nested objects
                if (isc.isAn.Object(value)) {
                    continue;
                }

                if (fieldState.nullValues) {
                    for (var j = 0; j < fieldState.nullValues.length; j++) {
                        if (value == fieldState.nullValues[j]) {
                            value = null;
                            break;
                        }
                    }
                }
                newRecord[fieldName] = (value != null || origValue == null ?
                    this.fireCallback(convert, "value", [origValue == null ? origValue : ""+origValue]) :
                    null);
                if (typeIsSpecified &&
                    (value != null || origValue == null) &&
                    newRecord[fieldName] == null)
                {
                    failures[fieldName] = (failures[fieldName] || 0) + 1;
                }
            }
            parsedData.push(newRecord);
        }

        for (var key in failures) {
            var failureCount = failures[key];
            if (failureCount > 10 || failureCount == data.length) {
                var detail = {
                    fieldName: key,
                    message: "Conversion of values to '" +
                             this._fieldState[key].fieldTemplate.type +
                             "' failed for " + failureCount +
                             " of " + data.length + " records."
                };
                this.parseDetails.add(detail);
            }
        }

        return parsedData;
    },

    createFieldState : function (fieldName) {
        var fieldState = {
            name: fieldName
        };
        if (this.fields) {
            var field = this.fields.find("name", fieldName);
            if (field) {
                fieldState.fieldTemplate = field;
                if (field.type) {
                    fieldState.detectedAs = field.type;
                }
            }
        }

        fieldState.emptyValueCount = 0;

        for (var typeName in this._typeProcessMethods) {
            var type = this._typeProcessMethods[typeName];
            fieldState[typeName] = {
                fieldType: type.fieldType,
                valueCount: 0,
                badValueCount: 0,
                badValues: []
            };
            if (fieldState.detectedAs &&
                !fieldState.typeProcessName &&
                fieldState.detectedAs == type.fieldType)
            {
                fieldState.typeProcessName = typeName;
            }
        }

        return fieldState;
    },

    getValueEquivalences : function (value) {
        var matches = [value];

        value = value.toLowerCase();
        for (var i = 0; i < this.valueEquivalences.length; i++) {
            var equivalences = this.valueEquivalences[i];
            if (value == equivalences.value.toLowerCase()) {
                matches.add(equivalences.equivalent);
            } else if (value == equivalences.equivalent.toLowerCase()) {
                matches.add(equivalences.value);
            }
        }
        return matches;
    },


    // The following type checks can be overridden
    isBoolean : function (value) {
        return this.booleanTrueValues.contains(value.toLowerCase()) || this.booleanFalseValues.contains(value.toLowerCase());
    },

    isFloat : function (value) {
        var decimalSymbol = this.decimalSymbol || isc.NumberUtil.decimalSymbol;
        var groupingSymbol = this.groupingSymbol || isc.NumberUtil.groupingSymbol;
        if (!this._isFloatRegexp || 
                this._isFloatDecimalSymbol != this.decimalSymbol ||
                this._isFloatGroupingSymbol != this.groupingSymbol)
        {
            this._isFloatRegexp = new RegExp("^\\s*([+-]?(((\\d+(\\" + decimalSymbol + ")?)|(\\d*\\" + decimalSymbol + "\\d+)|(\\d+(?:[\\" + groupingSymbol + "]\\d{3})*\\" + decimalSymbol + "\\d+))([eE][+-]?\\d+)?))\\s*$");
            this._isFloatDecimalSymbol = this.decimalSymbol;
            this._isFloatGroupingSymbol = this.groupingSymbol;
        }

        return this._isFloatRegexp.test(value);
    },

    isInteger : function (value) {
        var groupingSymbol = this.groupingSymbol || isc.NumberUtil.groupingSymbol;
        if (!this._isIntegerRegexp || 
                this._isIntegerGroupingSymbol != this.groupingSymbol)
        {
            this._isIntegerRegexp = new RegExp("^\\s*([+-]?((\\d+(?:[\\" + groupingSymbol + "]\\d{3})*)))\\s*$");
            this._isIntegerGroupingSymbol = this.groupingSymbol;
        }

        return this._isIntegerRegexp.test(value);
    },

    isDateYM : function (value) {
        var regexp = new RegExp("^\\s*(\\d{1,4})([\\.-/])(\\d{1,2})\\s*$");
        var match = regexp.exec(value);
        if (match) {
            var year = parseInt(match[1], 10),
                separator = match[2],
                month = parseInt(match[3], 10)
            ;
            if (month >= 1 && month <= 12 && (separator != "." || year >= this.minDateYear)) {
                return true;
            }
        }
        return false;
    },
    
    isDateMY : function (value) {
        var regexp = new RegExp("^\\s*(\\d{1,2})([\\.-/])(\\d{1,4})\\s*$");
        var match = regexp.exec(value);
        if (match) {
            var month = parseInt(match[1], 10),
                separator = match[2],
                year = parseInt(match[3], 10)
            ;
            if ((separator != "." || year >= this.minDateYear) && month >= 1 && month <= 12) {
                return true;
            }
        }
        return false;
    },
    
    isDateYMD : function (value) {
        var date = isc.Date.parseInput(value, "YMD", this.centuryThreshold, true, false);
        return (date != null); 
    },

    isDateMDY : function (value) {
        var date = isc.Date.parseInput(value, "MDY", this.centuryThreshold, true, false);
        return (date != null); 
    },

    isDateDMY : function (value) {
        var date = isc.Date.parseInput(value, "DMY", this.centuryThreshold, true, false);
        return (date != null); 
    },

    isDateTimeYMD : function (value) {
        if (!isc.DateUtil.isDatetimeString(value, "YMD")) return false;

        var date = isc.Date.parseInput(value, "YMD", null, true, false);
        return (date != null); 
    },

    isDateTimeMDY : function (value) {
        if (!isc.DateUtil.isDatetimeString(value, "MDY")) return false;

        var date = isc.Date.parseInput(value, "MDY", null, true, false);
        return (date != null); 
    },

    isDateTimeDMY : function (value) {
        if (!isc.DateUtil.isDatetimeString(value, "DMY")) return false;

        var date = isc.Date.parseInput(value, "DMY", null, true, false);
        return (date != null); 
    },

    isDateTimeSchema : function (value) {
        // parseSchemaDate is happy with a date of YYYY-MM-DD with no time.
        // That case is handled by isDate so it must be excluded here.
        var match = value.match(/(\d{4})[\/-](\d{2})[\/-](\d{2})([T ](\d{2}):(\d{2})(:(\d{2}))?)?(\.(\d+))?([+-]\d\d?:\d{2}|Z)?/);
        if (match == null || !match[4]) return false;

        var date = isc.DateUtil.parseSchemaDate(value);
        return (date != null); 
    },

    isTime : function (value) {
        // Exclude all-digit values from being a time
        var all_digits = /^\d+$/;
        if (all_digits.test(value)) return false;

        // Cannot use Time.parseInput because it assumes the value is supposed
        // to be a time and makes every effort to massage the string into a time.
        
        var valid = false;

        if (!isc.SchemaGuesser._timeExpressions) {
            isc.SchemaGuesser._timeExpressions = isc.Time._timeExpressions.duplicate();
            isc.SchemaGuesser._timeExpressions.addList([                
                /^\s*(\d?\d)\.(\d?\d)\.(\d?\d)?\s*([AaPp][Mm]?)?\s*([+-]\d{2}:\d{2}|Z)?\s*$/,
                /^\s*(\d?\d)\.(\d?\d)(\s*)([AaPp][Mm]?)?\s*([+-]\d{2}:\d{2}|Z)?\s*$/
            ]);
        }

        // iterate through the time expressions, trying to find a match
        for (var i = 0; i < isc.SchemaGuesser._timeExpressions.length; i++) {
            
            var match = isc.SchemaGuesser._timeExpressions[i].exec(value);
            if (match) break;
        }
        if (match) {
            valid = true;
            // get the hours, minutes and seconds from the match
            // NOTE: this results in 24:00 going to 23:00 rather than 23:59...
            var hours = match[1] ? parseInt(match[1], 10) : null,
                minutes = match[2] ? parseInt(match[2], 10) : 0,
                seconds = match[3] ? parseInt(match[3], 10) : 0,
                ampm = match[4]
            ;

            if (ampm) {
                if (!this._pmStrings) this._pmStrings = {p:true, P:true, pm:true, PM:true, Pm:true, pM:true};
                if (!this._amStrings) this._amStrings = {a:true, A:true, am:true, AM:true, Am:true, aM:true};
                if (this._pmStrings[ampm] == true) {
                    if (hours == null) hours = 12;
                    else if (hours < 12) hours += 12;
                } else if (this._amStrings[ampm] == true) {
                    if (hours == null) hours = 0;
                    else if (hours > 12) hours -= 12;
                } else {
                    // Invalid am/pm indicator
                    valid = false;
                }
            }
            if (valid && hours == null) {
                valid = false;
            } else if (valid) {
                if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                    valid = false;
                }
            }
        }

        return valid;
    },

    isTimeStamp : function (value) {
        if (!this._isTimeStampRegexp) {
            this._isTimeStampRegexp = new RegExp("^\\s*(\\d+)\\s*$");
            var date = new Date();
            date.setFullYear(date.getFullYear() - isc.SchemaGuesser.timeStampYearRange);
            this._isTimeStampStart = date;
            var date = new Date();
            date.setFullYear(date.getFullYear() + isc.SchemaGuesser.timeStampYearRange);
            this._isTimeStampEnd = date;
        }

        return (this._isTimeStampRegexp.test(value) &&
                parseInt(value, 10) >= this._isTimeStampStart &&
                parseInt(value, 10) <= this._isTimeStampEnd);
    },

    // to* methods must handle a null <value>

    toText : function (value) {
        return value;
    },

    toBoolean : function (value) {
        if (this.treatEmptyValueAsBooleanFalse && (value == null || !isc.isA.nonemptyString(value))) {
            return false;
        }
        var result = this.booleanTrueValues.contains(value.toLowerCase());
        if (!result) {
            if (!this.booleanFalseValues.contains(value.toLowerCase())) {
                result = null;
            }
        }
        return result;
    },

    toFloat : function (value) {
        if (Number(value) === value) return value;
        var result = isc.NumberUtil.parseLocaleFloat(value, this.decimalSymbol || isc.NumberUtil.decimalSymbol, this.groupingSymbol || isc.NumberUtil.groupingSymbol);
        return (isNaN(result) ? null : result);
    },

    toInteger : function (value) {
        if (Number.isInteger(value)) return value;
        var result = isc.NumberUtil.parseLocaleInt(value, this.groupingSymbol || isc.NumberUtil.groupingSymbol);
        return (isNaN(result) ? null : result);
    },

    toDateYM : function (value) {
        var regexp = new RegExp("^\\s*(\\d{1,4})([\\.-/])(\\d{1,2})\\s*$");
        var match = regexp.exec(value);
        if (!match) return null;

        var year = parseInt(match[1], 10),
            separator = match[2],
            month = parseInt(match[3], 10),
            date = null
        ;
        if (month >= 1 && month <= 12 && (separator != "." || year >= this.minDateYear)) {
            date = isc.Date.create(year, month-1, 1);
        }
        return date;
    },

    toDateMY : function (value) {
        var regexp = new RegExp("^\\s*(\\d{1,2})([\\.-/])(\\d{1,4})\\s*$");
        var match = regexp.exec(value);
        if (!match) return null;

        var month = parseInt(match[1], 10),
            separator = match[2],
            year = parseInt(match[3], 10),
            date = null
        ;
        if (month >= 1 && month <= 12 && (separator != "." || year >= this.minDateYear)) {
            date = isc.Date.create(year, month-1, 1);
        }
        return date;
    },

    toDateYMD : function (value) {
        return isc.DateUtil.parseInput(value, "YMD", this.centuryThreshold, true, false);
    },

    toDateMDY : function (value) {
        return isc.DateUtil.parseInput(value, "MDY", this.centuryThreshold, true, false);
    },

    toDateDMY : function (value) {
        return isc.DateUtil.parseInput(value, "DMY", this.centuryThreshold, true, false);
    },

    toDateTimeYMD : function (value) {
        return isc.DateUtil.parseInput(value, "YMD", this.centuryThreshold, true);
    },

    toDateTimeMDY : function (value) {
        return isc.DateUtil.parseInput(value, "MDY", this.centuryThreshold, true);
    },

    toDateTimeDMY : function (value) {
        return isc.DateUtil.parseInput(value, "DMY", this.centuryThreshold, true);
    },

    toDateTimeSchema : function (value) {
        var match = value && value.match(/(\d{4})[\/-](\d{2})[\/-](\d{2})([T ](\d{2}):(\d{2})(:(\d{2}))?)?(\.(\d+))?([+-]\d\d?:\d{2}|Z)?/);
        if (!match) return false;
        
        return isc.DateUtil.parseSchemaDate(value);
    },

    toTime : function (value) {
        value = value && value.replace(/\./g, ":");
        return isc.Time.parseInput(value, true);
    },

    toTimeStamp : function (value) {
        var ms = parseInt(value, 10);
        return new Date(ms);
    },

    // Revert data from actual types to strings
    
    revertValues : function (data) {
        this._typeRevertMethods = {
            "boolean":        { revert: this.fromBoolean },
            "time":           { revert: this.fromTime },
            "datetime":       { revert: this.fromDateTime },
            "date":           { revert: this.fromDate },
            "integer":        { revert: this.fromInteger },
            "float":          { revert: this.fromFloat }
            // text fields have no need for detection or conversion
        };

        var fields = this.derivedFields || this.fields,
            rawData = []
        ;
        if (!fields) {
            this.logWarn("No fields are defined to revert values");
            return;
        }

        for (var i = 0; i < data.length; i++) {
            var record = data[i],
                newRecord = {}
            ;

            for (var j = 0; j < fields.length; j++) {
                var field = fields[j],
                    fieldName = field.name,
                    value = record[fieldName]
                ;
                if (value == null) {
                    if (field.emptyDisplayValue) {
                        newRecord[fieldName] = field.emptyDisplayValue;
                    }
                    continue;
                }

                var type = field.type,
                    revert = (this._typeRevertMethods[type] ? this._typeRevertMethods[type].revert : null)
                ;
                if (revert) {
                    newRecord[fieldName] = this.fireCallback(revert, "value", [value]);
                } else {
                    newRecord[fieldName] = value.toString();
                }
            }
            rawData.push(newRecord);
        }
        return rawData;
    },

    fromBoolean : function (value) {
        return (value == true ? "1" : value == false ? "0" : null);
    },

    fromInteger : function (value) {
        return ""+value;
    },

    fromFloat : function (value) {
        return ""+value;
    },

    fromTime : function (value) {
        return value.getHours() + "." + value.getMinutes();
    },

    fromDate : function (value) {
        return isc.DateUtil.format(value, "YYYY/MM/dd");
    },

    fromDateTime : function (value) {
        return isc.DateUtil.format(value, "YYYY-MM-ddTHH:mm:ss.SSSZ");
    }
});


isc.defineClass("FileParser");

isc.FileParser.addClassProperties({
    // Don't use native parsing right now because currently, JSON.parse() in all browsers 
    // enforces the strict JSON rule that attribute names must be quoted
    USE_NATIVE_JSON_PARSER: false
});

isc.FileParser.addProperties({

    //> @attr fileParser.hasHeaderLine (boolean : false : IRW)
    // Does the first line of the data have the field names?
    //
    // @visibility fileParser
    //<
    hasHeaderLine: false,

    //> @attr fileParser.ignoreEmptyRecords (boolean : true : IRW)
    // Should parsed record with no data be ignored?
    //
    // @visibility fileParser
    //<
    ignoreEmptyRecords: true,

    //> @attr fileParser.separatorChar (String : "," : IRW)
    // Field separator character.
    //
    // @visibility fileParser
    //<
    separatorChar: ",",

    //> @attr fileParser.quoteChar (String : "\"" : IRW)
    // Quote character to wrap field values that include
    // the +link{separatorChar,separator}.
    //
    // @visibility fileParser
    //<
    quoteChar: "\"",

    //> @attr fileParser.allowQuotedValues (boolean : true : IRW)
    // Are quoted values allowed in the data?
    //
    // @visibility fileParser
    //<
    allowQuotedValues: true,

    //> @attr fileParser.fieldNames (Array of String : null : IRW)
    // Field names for the input file. If provided, only matching
    // data columns will be included in the parsed records.
    //
    // @visibility fileParser
    //<
    parseCsvLine : function (line) {
        if (!this.allowQuotedValues) {
            return line.split(this.separatorChar);
        }

        var insideQuote = false,
            entries = [],
            entry = []
        ;

        var lastChar;
        line.split('').forEach(function(c) {
            if (c === this.quoteChar) {
                insideQuote = !insideQuote;
                // support Excel double quote escape format ("")
                if (insideQuote && lastChar === c) entry.push(c);
            } else {
                if (c == this.separatorChar && !insideQuote) {
                    entries.push(entry.join(''));
                    entry = [];
                } else {
                    entry.push(c);
                }
            }
            lastChar = c;
        }, this);
        if (entry.length > 0) entries.push(entry.join(''));

        // if an entry is all whitespace, replace it with the empty string for consistency
        
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].match(/^\s*$/)) entries[i] = "";
        }
        return (entries.length > 0 ? entries : null);
    },

    //> @method fileParser.parseCsvData
    // Parse data into +link{Record,records}.
    //
    // @param data (String | Array of String) The data to process
    // @return (Array of Record) converted records
    // @visibility fileParser
    //<
    parseCsvData : function (data, context) {
        if (!data) return [];
        if (!isc.isAn.Array(data)) {
            if (data.contains("\r\n")) {
                this.lineSeparator = "\r\n";
                data = data.split("\r\n");
            } else if (data.contains("\r")) {
                this.lineSeparator = "\r";
                data = data.split("\r");
            } else if (data.contains("\n")) {
                this.lineSeparator = "\n";
                data = data.split("\n");
            } else {
                this.lineSeparator = "\n";
                data = [data];
            }
        }

        // When filtering empty records create filtered view of data
        var filteredCsvData = this.filteredCsvData = [];

        // Identify the first data row ignoring empty records if so configured
        var firstDataRow,
            firstDataRowIndex = 0
        ;
        while (!firstDataRow) {
            if (firstDataRowIndex >= data.length) {
                // No data was ever found
                return [];
            }
            firstDataRow = this.parseCsvLine(data[firstDataRowIndex]);

            if (this.ignoreEmptyRecords && this.isEmptyRecord(firstDataRow)) {
                firstDataRowIndex++;
                firstDataRow = null;
            }
        }
        filteredCsvData.push(data[firstDataRowIndex]);

        var fieldNames = this.fieldNames;
        this.derivedFieldNames = null;
        var ignoreFields;

        if (!fieldNames) {
            fieldNames = firstDataRow;

            if (this.hasHeaderLine) {
                // See if there are any fields that have no field name.
                // Those fields must be ignored in data records.
                for (var i = 0; i < fieldNames.length; i++) {
                    if (fieldNames[i] == null || fieldNames[i] == "") {
                        if (!ignoreFields) ignoreFields = [];
                        ignoreFields.push(i);
                    }
                }
                if (ignoreFields) {
                    // Sort field indices into reverse order for easy removal from record
                    ignoreFields.sort(function (a,b) { return b - a; });

                    // Remove ignored fields from field names
                    for (var i = 0; i < ignoreFields.length; i++) {
                        fieldNames.splice(ignoreFields[i], 1);
                    }
                }

                // save raw fieldName content before conversion below
                if (context) context.rawHeaderLine = fieldNames.join();

                for (var i = 0; i < fieldNames.length; i++) {
                    // A CSV file with a header line can have titles instead of
                    // of field names. Records, however, need to be referencing
                    // a real fieldName so make sure it is converted using camelCasing.
                    fieldNames[i] = isc.MockDataSource.convertTitleToName(
                        fieldNames[i], null, data[firstDataRowIndex]);
                }

                this.derivedFieldNames = fieldNames;
            }

            // If no header line is expected, derive field names after data is parsed
            // so empty columns can be ignored and then removed from final records.
        }

        // Remove empty leading records and header row from data to parse
        if (firstDataRowIndex > 0 || this.hasHeaderLine) {
            data = data.slice(firstDataRowIndex + (this.hasHeaderLine ? 1 : 0));
        }

        // Parse each remaining line in the data.
        // When there is no header line we also need to determine which fields have no
        // data at all so they can be discarded.
        var lines = [],
            nonEmptyFields = {},
            nonEmptyFieldsSize = 0,
            maxFieldIndex = 0;
        ;
        data.forEach(function (line) {
            var result = this.parseCsvLine(line);
            if (result && (!this.ignoreEmptyRecords || !this.isEmptyRecord(result))) {
                if (ignoreFields) {
                    for (var i = 0; i < ignoreFields.length; i++) {
                        result.splice(ignoreFields[i], 1);
                    }
                }
                if (!this.hasHeaderLine && result.length != nonEmptyFieldsSize) {
                    for (var i = 0; i < result.length; i++) {
                        if (!nonEmptyFields[i] && result[i] != null && result[i] != "") {
                            nonEmptyFields[i] = true;
                            nonEmptyFieldsSize++;
                            if (i > maxFieldIndex) maxFieldIndex = i;
                        }
                    }
                }
                lines.push(result);
                if (!this.isEmptyRecord(result)) filteredCsvData.push(line);
            }
        }, this);

        // If there is no header line then we need to assign field names for non-empty fields
        if (!this.hasHeaderLine) {
            fieldNames = [];
            var fieldNamesMap = [],
                fieldIndex = 0
            ;
            for (var i = 0; i <= maxFieldIndex; i++) {
                if (nonEmptyFields[i]) {
                    fieldNames[fieldIndex] = "field" + (fieldIndex+1);
                    fieldNamesMap[i] = fieldNames[fieldIndex];
                    fieldIndex++;
                }
            }
            this.derivedFieldNames = fieldNames;

            // Use fieldNames map to record field values so that empty fields are dropped
            fieldNames = fieldNamesMap;
        }

        var records = lines.map(function (fieldValues) {
            var record = {};
            fieldNames.forEach(function(fieldName, i) {
                record[fieldName] = fieldValues[i];
            });
            return record;
        });
        
        return records;
    },

    isEmptyRecord : function (record) {
        if (record) {
            for (var i = 0; i < record.length; i++) {
                if (record[i] != null && record[i] != "") return false;
            }
        }
        return true;
    },

    //> @method fileParser.parseJsonData
    // Parse data into +link{Record,records}.
    //
    // @param data (String) The data to process
    // @return (Array of Record) converted records
    // @visibility fileParser
    //<
    parseJsonData : function (data, contextString) {
        this.filteredCsvData = null;

        var records;
        try {
	        if (window.JSON && isc.FileParser.USE_NATIVE_JSON_PARSER) {
	                records = JSON.parse(data);
	        } else {
	            records = isc.JSON.decode(data);
	        }
        } catch(e) {
            this.logWarn("JSON parse error" + (contextString ? contextString : "") + ": " + e.toString());
            this.logWarn("Tried to parse text: " + data);
            isc.warn("JSON parse error" + (contextString ? contextString : "") + ": " + e.toString());
            var rtnval = [];
            rtnval._parseFailure = true;
            return rtnval;
        }

        if (isc.isAn.Object(records)) {
            var keys = isc.getKeys(records);
            if (keys.length == 1 && isc.isAn.Array(records[keys[0]])) {
                records = records[keys[0]];
            }
        }
        if (!isc.isAn.Array(records)) {
            this.logWarn("Invalid data - unable to extract an array of records");
            var rtnval = [];
            rtnval._notAnArray = true;
            return rtnval;
        }

        // Extract field names from the records.
        // Since XML and JSON formats can leave empty
        // fields out of records all of the records
        // must be inspected to determine the full
        // list of field names in use.
        var fieldNames = [];

        records.forEach(function (record) {
            var keys = isc.getKeys(record);

            for (var i = 0; i < keys.length; i++) {
                var fieldName = keys[i];
                if (!fieldNames.contains(fieldName)) fieldNames.add(fieldName);
            }
        });
        this.fieldNames = fieldNames;

        return records;
    },

    //> @method fileParser.getFieldNames
    // Returns the field names as either provided in +link{fieldNames}
    // or derived from the data that are used in the parsed records.
    //
    // @return (Array of String) field names
    // @visibility fileParser
    //<
    getFieldNames : function () {
        return this.fieldNames || this.derivedFieldNames;
    },
    
    //> @method fileParser.getFields
    // Returns the list of +link{DataSourceField,fields}.
    //
    // @return (Array of DataSourceField) fields
    // @visibility fileParser
    //<
    getFields : function () {
        var fieldNames = this.getFieldNames(),
            fields = []
        ;
        if (fieldNames) {
            fieldNames.forEach(function(fieldName) {
                fields.add({ name: fieldName });
            });
        }
        return fields;
    },

    //> @method fileParser.getFilteredCsvData
    // Returns the filtered CSV data after any empty records have been removed.
    //
    // @return (String) CSV Data
    // @visibility fileParser
    //<
    getFilteredCsvData : function () {
        return (this.filteredCsvData ? this.filteredCsvData.join(this.lineSeparator) : null);
    }
});


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
//>	@class	NativeSelectItem
// Select items rendered using a native HTML select item.
// @inheritsFrom FormItem
// @visibility internal
//<
// Note: This should be invisible to the developer in most cases. The Developer will define
// a form item with type 'select' and based on 'form.useNativeSelectItems', we'll render out
// a SelectItem, or a NativeSelectItem.


isc.ClassFactory.defineClass("NativeSelectItem", "FormItem");
isc.NativeSelectItem.addClassProperties({
    //>	@attr NativeSelectItem.DEFAULT_ROW_COUNT	(number : 6 : IRW)
	//		Default maximum number of rows to show for a multiple 
    //      select box. (Overridden by selectItem.rows, or height).
	//		@group	appearance
	//		@see selectItem.getElementStyleHTML()
	//<
    DEFAULT_ROW_COUNT:6,

    // Used to track every Native select item on the page
    instances: []
    
});

// Include the shared SelectItem properties
isc.NativeSelectItem.addProperties(isc._SelectItemProperties);

// Properties to apply to native selects only.
isc.NativeSelectItem.addProperties({

    // Set the height to null by default - will size to 1 row of content.
    height:null,
    
    stopNavKeyPressBubbling:true,

    //> @attr   nativeSelectItem._hasDataElement    (boolean : true : IRW)
    //      Native Select items have a data element.
    // @group formValues
    // @visibility   internal
    // @see     method:FormItem.hasDataElement
    // @see     method:FormItem.getDataElement
    //<
    _hasDataElement:true,

    // This flag means updateState will apply the result of this.getTextBoxStyle() to this item's
    // data element - appropriate for native text boxes, text areas and selects.
    _dataElementIsTextBox:true,
    textBoxStyle: "nativeSelectItem",
    showRTL: true,

    // _nativeEventHandlers is a place to specify native event handlers to be applied to the
    // form item element once it has been written into the DOM (without having to override 
    // '_applyHandlersToElement()'
    _nativeEventHandlers : {
        // apply a native 'onchange' hander to notify us of changes.
        onchange : isc.FormItem._nativeChangeHandler
    }
});

// add the getOptionsHTML method as a static method so it can be used as a utility routine
//	without requiring the creation of a StaticItem instance
isc.NativeSelectItem.addClassMethods({

	//NativeSelectItem.getOptionsHTML()	(A) output the HTML for a select element's OPTION items
	getOptionsHTML : function (valueMap, selectedValue, sortedOptions) {

        if (valueMap == null) valueMap = [];

		var output = isc.SB.create();
        var arrayVM = isc.isAn.Array(valueMap);

        // Ignore sortedOptions if our valueMap is a simple array
        if (arrayVM) {
            for (var i = 0, len = valueMap.length; i < len; i++) {
                var storedValue = valueMap[i];

                // Note - you can break SelectItems by having a valueMap containing unescaped
                // HTML.  The example I saw was setting up a valueMap like this:
                //  { 0:"<select one>", 1:"Some Value", 2:"Some Other Value"}
                // We could catch this here, but it may be expensive to run 'asHTML()' on a 
                // potentially large number of options. Developers must avoid using angle
                // braces in valueMap names.
                //if (isc.isA.String(option)) option = option.asHTML();

                output.append(this._getOptionHTML(storedValue, storedValue, selectedValue));
            }
        } else {

            // sortedOptions will be present if we fetched data from a dataSource with a specified
            // sortField.
            // This allows us to iterate through the options in order if we have both a display and
            // a value field [iteration order for an object is not guaranteed].

            // Ensure that it matches the valueMap and ignore if not [could be stale if a dev changed the valueMap
            // without going through setValueMap()]
            if (sortedOptions != null) {
                if (!this._verifySortedOptions(valueMap, sortedOptions)) {
                    sortedOptions = null;
                }
            }
            
            if (sortedOptions != null) {
                for (var i = 0; i < sortedOptions.length; i++) {
                    output.append(this._getOptionHTML(sortedOptions[i].value, sortedOptions[i].display, selectedValue));
                }
            } else {
                // standard valueMap object iteration order.
                for (var storedValue in valueMap) {
                    var visibleValue = valueMap[storedValue];
                    //if (isc.isA.String(option)) option = option.asHTML();
                    output.append(this._getOptionHTML(storedValue, visibleValue, selectedValue));
                }
            }
        }
        
        return output.release(false);
	},

    _verifySortedOptions : function (valueMap, sortedOptions) {
        var values = isc.getKeys(valueMap);
        if (values.length != sortedOptions.length) {
            return false;
        } else {
            for (var i = 0; i < sortedOptions.length; i++) {

                var keyVal = sortedOptions[i].value,
                    dispVal = sortedOptions[i].display;

                if (!values.contains(keyVal) || valueMap[keyVal] != dispVal) {
                    return false;
                }
            }
        }
        return true;
    },

    _getOptionHTML : function (storedValue, visibleValue, selectedValue) {
        var template = this._template;
        if (!template) {
            this._selectedOption = " SELECTED ";
            template = this._template = [];

            template[0] = "<OPTION ";
            // [1] SELECTED or blank
            template[2] = ' VALUE="';
            // [3] actual value
            template[4] = '">';
            // [5] visible value
            template[6] = "</OPTION>";
        }
        template[1] = (storedValue == selectedValue ? this._selectedOption : null);
        template[3] = storedValue;
        template[5] = visibleValue;
        return template.join(isc._emptyString);
    },
	
	// NativeSelectItem.getOptionCount()	(A)
	//			Return the number of option elements in a valueMap.
	getOptionCount : function (valueMap) {	
		// output each option in turn
		if (isc.isAn.Array(valueMap)) {
			return valueMap.length;
		} else {
			var count = 0;
			for (var key in valueMap) {
				count++;
			}
			return count;
		}
	}
	
});


//!>Deferred
isc.NativeSelectItem.addMethods({
    textMatchStyle: "startsWith",

    getPickListFilterCriteria : function () {
        var baseCrit = this.optionCriteria || {};
        return isc.addProperties(baseCrit, this.pickListCriteria); 
    },

    init : function () {
        this.Super("init", arguments);
        isc.NativeSelectItem.instances.add(this);
        
        // have basic optionDataSource 
        if (this.optionDataSource) {
            var ds = this.getOptionDataSource();
            var valFld = this.getValueFieldName();
            var dispFld = this.getDisplayFieldName();
            var self = this;

            var context = {
                textMatchStyle:this.textMatchStyle,
                showPrompt:false
            };
            if (this.optionFilterContext != null) isc.addProperties(context, this.optionFilterContext);

            // Apply our sort to the fetch request.
            var sort = this._getInitialSort();
            if (sort != null && sort.length > 0) {
                context.sortBy = sort;
            }


            // respect optionOperationId if specified
            if (this.optionOperationId != null) context.operationId = this.optionOperationId;            

            var criteria = this.getPickListFilterCriteria();

            // fetch data manually and create a valuemap from the data
            ds.fetchData(criteria, function (dsResponse, data) {
                var valMap;
                if (!dispFld) valMap = [];
                else valMap = {};
                var sortedOptions = [];
                for (var i=0; i < data.getLength(); i++) {
                    var rec = data[i];
                    if (!dispFld) {
                        valMap.add(rec[valFld]);     
                        sortedOptions.add({display:rec[valFld], value:rec[valFld]});
                    } else {
                        valMap[rec[valFld]] = rec[dispFld];     
                        sortedOptions.add({display:rec[dispFld], value:rec[valFld]});
                    }
                }
                // Store the (potentially sorted) data array along
                // with our valueMap.
                self.setValueMap(valMap, sortedOptions);
            }, context);
             
        }
    },

    // Override setValueMap to optionally store a sorted list of source records
    // This allows us to write our options out in sorted order even though
    // JS objects don't guarantee iteration order of keys.
    setValueMap : function (valueMap, sortedOptions) {
        this._sortedOptions = sortedOptions;
        return this.Super("setValueMap", arguments);
    },

    
    _getInitialSort : function () {
        if (this.preDrawConfig && this.preDrawConfig.initialSort) {
            
            this.initialSort = this.preDrawConfig.initialSort;
            this.preDrawConfig.initialSort = null;
        }
        var initialSort = this.initialSort;
        if (initialSort) {
            // just return the initialSort, after making it an array if necessary
            if (!isc.isAn.Array(this.initialSort)) this.initialSort = [this.initialSort];
            return initialSort.duplicate();
        }
        
        // get any specified sortField and build a sortSpecifier array from it
        
        var sortField = this.sortField != null ? this.sortField : this.sortFieldNum;
        if (!isc.isA.String(sortField)) return null;

        var sortDirection = this.sortDirection != null ? this.sortDirection : "ascending";

        // make sure sortField is an array
        if (!isc.isAn.Array(sortField)) sortField = [sortField];
        var initialSort = [];
        for (var i=0; i<sortField.length; i++) {
            // add a sortSpecifier for each sortField, each using the public sortDirection
            initialSort.add({ property: sortField[i], direction: sortDirection });
        }
        return initialSort;
    },

    destroy : function () {
        isc.NativeSelectItem.instances.remove(this);
        this.Super("destroy", arguments);
    },
    // by putting 'nowrap' on the text box cell we avoid the value icon / text box appearing 
    // on different lines
    getTextBoxCellCSS : function () {
        return this._$nowrapCSS
    },
        
    //> @method nativeSelectItem.setElementReadOnly()
    // Change the read-only state of the form element immediately.
    //<
    setElementReadOnly : function (readOnly) {
        // A native select should be rendered as disabled to simulate read-only.
        this._setElementEnabled(!readOnly && !this.isDisabled());
    },

	// getElementHTML()			output the HTML for this element
	getElementHTML : function (value, dataValue) {
		// since we're redrawing the element, note that we have NOT added an unkown value
		//	to its options.  See nativeSelectItem.setElementValue
		this._unknownValueAdded = false;
        
		var form = this.form,
			formID = form.getID(),
			output = isc.StringBuffer.create(),
			itemID = this.getItemID(),
            emptyString = isc._emptyString,
            valueIconHTML = this._getValueIconHTML(dataValue),
            result = ""
		;
		
        if (this.showValueIconOnly) return valueIconHTML;
        
        if (valueIconHTML != null) output.append(valueIconHTML);
        
        if (this.showInputElement == false) {
            // if showInputElement is false, just return the valueIconHTML, if any
            result = output.release(false);
        } else {
            if (this._isPrinting() || this.renderAsStatic()) {
                if (this.printFullText) {
                    result = isc.StringBuffer.concat(
                        "<SPAN ",this.getElementStyleHTML(), ">",
                        dataValue == null ? "&nbsp;" : dataValue.asHTML(), "</SPAN>"
                    );
                } else {
                    result = isc.StaticTextItem._instancePrototype.getElementHTML.apply(this, arguments);
                }
            } else {
                output.append(
                        "<SELECT",
                        " NAME=" , this.getElementName(),
                        " ID=", this.getDataElementId(),

                        // hang a flag on the element marking it as the data element for the
                        // appropriate form item.
                        this._getItemElementAttributeHTML(),
                        
                        (!this.showTitle && this.accessKey != null ? 
                            " ACCESSKEY=" + this.accessKey : emptyString),
                        ((this.isReadOnly() || this.isDisabled()) ? " DISABLED " : emptyString),
                        this.getElementStyleHTML(),
                        (this.multiple ? " MULTIPLE" : emptyString),
                        " TABINDEX=", this._getElementTabIndex()," handleNativeEvents=false>");
                       
                // _sortedOptions gives us a way to track the definitive order of keys in a valueMap
                // used when we have an optionDataSource and a sort field
                output.append(this.getOptionsHTML(this.getValueMap(), this._sortedOptions));

                output.append("</SELECT>");
                result = output.release(false);
            }
        }

		return result;
	},
    
    // Fired in response to a native onchange event
    _handleElementChanged : function (waited) {
    
        
        if (isc.Browser.isIE && !waited) {
            isc.Timer.setTimeout(this.getID() + "._handleElementChanged(true)", 10);
            return true;
        }
        return this.form.elementChanged(this.getID());
    
    },

    // If changeOnBlur is true, fire change after blur.
    _nativeElementBlur : function (element, itemID) {
        var returnVal = this.Super("_nativeElementBlur", arguments);

        if (this.changeOnBlur) this.form.elementChanged(this);
    },    
    

	//getOptionsHTML()	output the HTML for a select element's options
	getOptionsHTML : function (valueMap, sortedOptions) {
		var output = isc.NativeSelectItem.getOptionsHTML(valueMap ? valueMap : this.getValueMap(), null, sortedOptions);
        
        if (this.isSelectOther) {
    		output += "<OPTION VALUE=\"" + this.separatorValue + "\">" + this.separatorTitle
                    + "<OPTION VALUE=\"" + this.otherValue + "\">" + this.otherTitle
    		;
        }
        
		return output;
        
	},

	
	// getOptionCount()	(A)     Return the number of option elements in a valueMap.
	getOptionCount : function (valueMap) {	
		return isc.NativeSelectItem.getOptionCount(valueMap? valueMap : this.getValueMap());
	},

    getTextBoxStyle : function () {
        if (this._isPrinting()) return isc.TextItem.getInstanceProperty("textBoxStyle");
        else return this.Super("getTextBoxStyle", arguments);
    },

	//  NativeSelectItem.getElementStyleHTML()	(I)
    //      	Get the HTML string used to set the visual characteristics for a select item.
    //          This includes the STYLE=... & CLASS=... properties to be written into this
    //          form item's element.
    //          Uses this.height, this.width and this.rows to calculate desired size
    //          In most DOM browsers uses CSS styling to apply width (and height for multiple-select
    //          style).
    //          In Nav / IE 5.x calculates the appropriate number of rows to make the widget the
    //          desired height.
    //
	//		@group	appearance
	//		@return	(string)    String of HTML containing STYLE=... & CLASS=... properties for 
    //                          this items element.
	//
	getElementStyleHTML : function () {

        var output = isc.SB.create(),
            style = isc.SB.create();         
        if (this.textBoxStyle != null) output.append(" CLASS='", this.getTextBoxStyle(), "' ");

        // There are two interfaces for this item: 
        // - the default single-select interface "drop list"
        // - the default multiple-select interface "pick list"
        
        // Pick List - determine the desired number of rows, and set the height for the item.
        if (this.multiple || this.rows) {

            //desired number of rows
            var rows = this.rows;
            
            // default rows if necessary (ensures a pickbox is drawn and that it looks consistent
            // across browsers).
            if (!isc.isA.Number(rows) || rows < 1) 
                        rows = Math.min(isc.NativeSelectItem.DEFAULT_ROW_COUNT, this.getOptionCount());
        
            // If the height was specified, respect the specified height.
            
            if (this.height) {

                
                if (isc.isA.Number(this.height)) style.append("HEIGHT:", this.height, "px;");
            }
            
	    	output.append(" SIZE=", rows);
        }
        // otherwise were using a drop-list - allow the default form item handling to set the 
        // height for the Dynamic Form table cell.

        // DOM specific styling code
        if (isc.Browser.isDOM) {
            

            var width = this.getTextBoxWidth();
            if (isc.isA.Number(width)) {
                // Don't attempt to write out a negatively sized element!
                width = Math.max(width, 1);

    			// output the width as a CSS width property
	    		style.append("width:", width, "px;");
            }

            // In Mozilla we must use the 'moz-user-focus' css property to govern
            // whether this element can recieve focus or not.
            if (isc.Browser.isMoz) {
                style.append("-moz-user-focus:", 
                             (this._getElementTabIndex() > 0 ? "normal;" : "ignore;")
                );
            }
            
            // Force an explicit top and bottom margin of zero - by default there's
            // 1px above and below, increasing the total size of the item
            style.append("margin-top:0px;margin-bottom:0px;");
            
            style = style.release(false);
			if (style.length > 0) output.append(" STYLE='", style, "'");
        }
            
        return output.release(false);
    },
    
    _sizeTextBoxAsContentBox : function () {
        // override to return false - hBorderPad reduces width by 2px otherwise
        return false;
    },
    
    // We allow SelectItems with no explicitly specified size, to size based on the content
    // of the select - so we avoid writing a width property into the element unless we need to
    // Modify _iconVisibilityChanged() to similarly avoid writing a width property into the
    // element unless it's required, so we don't react to an icon showing/hiding by shrinking
    // or growing the select item unnecessarily.
    _iconVisibilityChanged : function () {
        if (!isc.isA.Number(this.width)) return;
        return this.Super("_iconVisibilityChanged", arguments);
    },

    
    _getIconVMargin : function () {
        return 0;
    },
    
    mapValueToDisplay : function (dataValue) {
        if (isc.isAn.Array(dataValue)) {
            var displayArray = [];
            for (var i = 0; i < dataValue.length; i++) {
                displayArray[i] = this.mapValueToDisplay(dataValue[i]);
            }
            return displayArray;
        }
        return this.Super("mapValueToDisplay", arguments);
    },
    
	//selectItem.setElementValue() : set the value of the form element to the value passed in
	setElementValue : function (newDisplayValue, newValue) {
        
        // Select items support a 'native' value map - each item has the data value (option.value)
        // and the display value (option.text) specified. 
        // We select the item by setting the element's value to the data value.
        // - If the 'data' value is not passed to this method - assume data / display values
        //   match
        // - If we don't fine an option with a .value that matches the value passed in, also
        //   check option.text as we may have been passed the display value only. This
        //   can happen if a developer calls 'item.setValue(<displayValue>)'
        if (arguments.length  == 1) newValue = newDisplayValue;
        
		// get a pointer to the element for this item
		var element = this.getDataElement();

		// if we don't currently have an element, bail
		if (!element) return null;

		// iterate through each option
		var options = element.options;
		
		if (!options) {
			//>DEBUG
			this.logDebug("setElementValue(): element.options is null. ???");
			//<DEBUG
			return null;	//???
		}
        
        // always update the value icon (if we're showing one)
        this._updateValueIcon(newValue);
		
		// if this is a single-select item, set its selectedIndex
		if (!this.multiple) {
			// normalize a null value to the empty string
 			// this fixes a problem in Nav where it creates items called "undefined"
			if (newValue == null) newValue = "";	

			// look for an option with matching value
			for (var i = 0; i < options.length; i++) {
				if (options[i].value == newValue) {
					// only update the selectedIndex if it's not already correct, otherwise the
                    // native select scrolls unnecessarily
					if (element.selectedIndex != i) {
						element.selectedIndex = i;
					}
					return element.selectedIndex;
				}
			}

			// no matching value - look for an option with matching text 
			for (var i = 0; i < options.length; i++) {            
				if (options[i].text == newValue) {
					// only update the selectedIndex if it's not already correct, otherwise the
                    // native select scrolls unnecessarily
					if (element.selectedIndex != i) {
						element.selectedIndex = i;
					}
					element.selectedIndex = i;
					return element.selectedIndex;
				}
			}

			// add a new form option with the value
			if (this.addUnknownValues) {
                
				if (isc.Browser.isIE) {
					var newElementNum = 0;
					// if we've already added an unknown value since the list was redrawn,
					//  simply munge that value (rather than adding a new one).
					if (this._unknownValueAdded) {
						options[newElementNum].text = newDisplayValue;
						options[newElementNum].value = newValue;
					} else {
						options.add(new Option(newValue, newDisplayValue), newElementNum);
						this._unknownValueAdded = true;
					}

				} else {
					if (this._unknownValueAdded) {
						var newElementNum = options.length-1;
						options[newElementNum].value = newValue;
						options[newElementNum].text = newDisplayValue;
					} else {
						var newElementNum = options.length;
						options[newElementNum] = new Option(newValue, newDisplayValue);
						this._unknownValueAdded = true;
					}
				}

				// only update the selectedIndex if it's not already correct, otherwise the
                // native select scrolls unnecessarily
				if (element.selectedIndex != newElementNum) {
					element.selectedIndex = newElementNum;		
				}
	
				return element.selectedIndex;
			} else {
				// not found -- return null
				return null;
			}

		// otherwise it's multi-select item
		} else {
        
            // "newValue" is the list of selected values - normalize to an array
			if (newValue == null) {
				newValue = [];
			} else if (isc.isA.String(newValue) && newValue.contains(",")) {
				newValue = newValue.split(",");
			} else if (!isc.isAn.Array(newValue)) {
				newValue = [newValue];
			} else {
				// duplicate the array since we're changing it below (and don't want to screw
                // up the original)
				newValue = newValue.duplicate();
			}
            
            // same thing with newDisplayValue - may be required if we're adding unknown values
			if (newDisplayValue == null) {
				newDisplayValue = [];
			} else if (isc.isA.String(newDisplayValue) && newDisplayValue.contains(",")) {
				newDisplayValue = newDisplayValue.split(",");
			} else if (!isc.isAn.Array(newDisplayValue)) {
				newDisplayValue = [newDisplayValue];
			} else {
				// duplicate the array since we're changing it below (and don't want to screw
                // up the original)
				newDisplayValue = newDisplayValue.duplicate();
			}            

            // set option.selected on native option elements.  "newValue" will retain only the
            // values for which there are no native option elements.
			for (var i = 0; i < options.length; i++) {
				var option = element.options[i];

				var valueIndex = newValue.indexOf(option.value);

				// only update option.selected if it's not already correct, otherwise the
                // native select scrolls unnecessarily
				if (valueIndex > -1) {
					if (option.selected != true) option.selected = true;
					newValue.removeItem(valueIndex);
				} else {
					if (option.selected != false) option.selected = false;
				}
			}
            
            // iterate through the options a second time in case we were passed display values
            if (newValue.length != 0) {
                for (var i = 0; i < options.length; i++) {
                    var option = element.options[i];
                    var valueIndex = newValue.indexOf(option.text);
                    if (valueIndex > -1) {
                        if (option.selected != true) option.selected = true;
                        newValue.removeItem(valueIndex);
                    }
                }
            }
			
			// if some values in "newValue" had no corresponding option element, add more
            // option elements to the native multi-select
			if (newValue.length != 0 && this.addUnknownValues) {
            
				for (var i = 0; i < newValue.length; i++) {
					var newOption = options[options.length] = 
                            new Option(newValue[i], newDisplayValue[i]);
					newOption.selected = true;
				}
			}
            // XXX: this will be the values that had to be added, not the new value
			return newValue; 
		}
	},

	// getRawElementValue()     return the value stored in the form element(s) for this item.
	getElementValue : function () {
		// get a pointer to the element for this item
		var element = this.getDataElement();
		
		// if no element was found, bail
		if (!element) return null;
		
		var options = element.options;
		if (!options || options.length == 0) return null;
		
		// if we're dealing with a single-select option
		if (!this.multiple) {
			var option = options[element.selectedIndex];
			// if no option found, forget it
			if (!option) return null;
			return (option.value != null ? option.value : option.text);
		
		// otherwise if a multi-select item, return an array
		} else {
			var output = [];
			// for each option
			for (var i = 0; i < options.length; i++) {
				var option = options[i];
				// if that option is selected
				if (option.selected) {
					// add its value (or text if value was not specified) to the output
					output.add(option.value != null ? option.value : option.text);	
				}
			}
            // if there are no selected values, return null
            if (output.length == 0) return null;
			// otherwise return the array of values
			return output;
		}
	},
	
	//setElementValueMap		Set the valueMap for the actual form element to those passed in.
	setElementValueMap : function (valueMap) {
		// since we're resetting the element's options, 
		//	note that we have NOT added an unkown value to its options.  
		//	See nativeSelectItem.setElementValue
		this._unknownValueAdded = false;
	
		this.Super("setElementValueMap", arguments);
		// if this item doesn't currently have an element, bail
        var element = this.getDataElement();
		if (element == null) return;
		
		// get a pointer to the original options
		var elementOptions = element.options;
		// clear the elementValueMap
		elementOptions.length = 0;

        // add the new options
		if (isc.isAn.Array(valueMap)) {
			// array where key and value are the same
			for (var i = 0; i < valueMap.length; i++) {
				elementOptions[i] = new Option(valueMap[i], valueMap[i])
			}
		} else {

            // If we have sortedOptions and they aren't stale, use them!
            // This allows us to output valueMapped options in a predictable order
            if (this._sortedOptions && isc.NativeSelectItem._verifySortedOptions(valueMap, this._sortedOptions)) {
                var sortedOptions = this._sortedOptions;
                for (var i = 0; i < sortedOptions.length; i++) {
                    elementOptions[elementOptions.length] = new Option(sortedOptions[i].display, sortedOptions[i].value);
                }
            } else {
                // object of key:value pairs
                for (var key in valueMap) {
                    elementOptions[elementOptions.length] = new Option(valueMap[key],key)
                }
            }	
		}
        
        if (this.isSelectOther) {
        
        	// add the separators
    		elementOptions[elementOptions.length] = new Option(this.separatorTitle, this.separatorValue);
    		elementOptions[elementOptions.length] = new Option(this.otherTitle, this.otherValue);
    		
            
        }
	},
    
    // override upateValue to handle 'selectOther' functionality
    updateValue : function () {

        if (this.isSelectOther) {
    
            // we have to re-implement some of the default updateValue function to get at the element
            // value.
            if (!this.hasElement() || this.getDataElement() == null) return;
    
            var oldValue = this._value,
                value = this.getElementValue();
    	
    		// if they selected the separator, return false to reject the value
            if (value == this.separatorValue) {
                this.setValue(oldValue);
                return false;
            }
    
            if (value == this.otherValue) {
                var oldTitle = this.getValueMapTitle(oldValue);
                value = prompt("Other value for \r'"+this.getTitle()+"'?", (oldTitle ? oldTitle : ""));
                if (value == null) {
                    this.setValue(oldValue);
                    return false;
                }
    		
                // set the value of the field to value
                //	this has the side effect of adding the element to the field
                // - we'll continue through Superclass 'updateValue' implementation to handle firing
                //   change handlers, and actually saving the value.
                this.setElementValue(value);
            }
        }
	
        return this.Super("updateValue", arguments);    
    }
	
});
//!<Deferred


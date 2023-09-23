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
//> @class FormItem
// A UI component that can participate in a DynamicForm, allowing editing or display of one of
// the +link{dynamicForm.values,values tracked by the form}.
// <P>
// <smartclient>FormItems are never created via the +link{Class.create(),create()} method,
// instead, an Array of plain +link{type:Object,JavaScript objects} are passed as
// +link{DynamicForm.items} when the form is created.</smartclient>
//
// <smartgwt>FormItems do not render themselves, instead, they are provided to a
// +link{DynamicForm} via +link{DynamicForm.setItems()}</smartgwt>
// <p>
// See the +link{DynamicForm} documentation for details and sample code.
//
// @treeLocation Client Reference/Forms/Form Items
// @visibility external
//<
isc.ClassFactory.defineClass("FormItem");

// Copy across the canvas method to generate DOM IDs for the various elements we will be
// creating
isc.FormItem.addMethods({
    // we use getDOMID to generate our elements' unique dom ids
    // If we're writing out 'inactiveHTML' we may be rendering multiple elements on the page
    // with the same 'partName' but we want them to have separate unique IDs. In this
    // case we'll modify the partName to ensure unique IDs for all the inactive elements.
    _inactiveTemplate:[null, "_inactiveContext", null],
    _getDOMID : function (partName, dontCache, dontReuse, inactiveContext) {
        
        // If we're in the process of writing out inactive HTML, pick up the current 
        // inactiveContext ID, or lazily create a new one if we haven't got one yet.
        
        if (inactiveContext == null && this.isInactiveHTML()) {
            inactiveContext = this._currentInactiveContext;
        }
        // see if this becomes expensive (string concat)
        if (inactiveContext != null) {
            this._inactiveTemplate[0] = partName;
            this._inactiveTemplate[2] = inactiveContext;
            partName = this._inactiveTemplate.join(isc.emptyString);
            if (this.logIsDebugEnabled("inactiveEditorHTML")) {
                this.logDebug("_getDOMID called for inactive HTML -- generated partName:"
                    + partName, "inactiveEditorHTML");
            }
            
            // ignore 'dontCache' if we're writing out inactive context.
            
            dontCache = false;
            
        }
        return isc.Canvas.getPrototype()._getDOMID.apply(this, [partName,dontCache,dontReuse]);
    },
    
    _getDOMPartName:isc.Canvas.getPrototype()._getDOMPartName,
    
    
    _releaseDOMIDs:isc.Canvas.getPrototype()._releaseDOMIDs,
    reuseDOMIDs:false
});

isc.FormItem.addClassMethods({
    
    //> @classMethod FormItem.create()
    // FormItem.create() should never be called directly, instead, create a +link{DynamicForm}
    // and specify form items via +link{DynamicForm.items,form.items}.
    //
    // @visibility external
    //<
    // Log a warning if called directly
    create : function (A,B,C,D,E,F,G,H,I,J,K,L,M) {
        this.logWarn(
            "Unsupported call to " + this.getClassName() + ".create(). FormItems must be created " +
            "by their containing form. To create form items, use the 'items' property of a DynamicForm " +
            "instance. See documentation for more details."
        );
        // If we're passed properties combine them into a single raw object - if this is then
        // assigned to a form's "items" attribute the developer will likely get the expected
        // behavior.
        // (No need to call Super)
        return isc.addProperties({}, A,B,C,D,E,F,G,H,I,J,K,L,M);
    },
    
    // getNewTagID() -- a method to broker out IDs for the form element tags, if no name is
    // specified for the form element
    // (If a name is specified we'll use that instead)
    getNewTagID : function () {
        if (this._currentTagIDNumber == null) this._currentTagIDNumber = 0;
        this._currentTagIDNumber += 1;
        return "isc_FormItemElement_ID_" + this._currentTagIDNumber;
    },
    
    // setElementTabIndex()
    // Given a DOM element (a form item element), and a tabIndex, update the tabIndex on
    // the appropriate element.
    setElementTabIndex : function (element, tabIndex) {
        // Set the tabIndex property on the element
        element.tabIndex = tabIndex;
        
        // In mozilla setting a tabIndex to -1 is not sufficient to remove it from the
        // page's tab order -- update the 'mozUserFocus' property as well to achieve this
        // if we're passed a desired tabIndex less than zero (or revert this property if
        // necessary from a previous exclusion from the page's tab order)
        
        if (isc.Browser.isMoz) {
            element.style.MozUserFocus = (tabIndex < 0 ? "ignore" : "normal");
        }
    },
    
    
    
    _aboutToFireNativeElementFocus : function (item) {
        
        if (!isc.Browser.isIE) return;
        var activeElement = this.getActiveElement();
        
        if (activeElement && activeElement.tagName == null) activeElement = null;
        
        // Note: this will work for elements in the DOM that are not part of ISC form items.
        if (activeElement && 
            ((activeElement.tagName.toLowerCase() == this._inputElementTagName && 
              activeElement.type.toLowerCase() == this._textElementType) || 
              activeElement.tagName.toLowerCase() == this._textAreaElementTagName)) 
        {
            // IE proprietary API
            var range = activeElement.createTextRange();
            range.execCommand("Unselect");
        }
    },
    

    // Helper method to determine if the item passed in is text based
    _textBasedItem : function (item, checkForPopUp) {
        if (isc.isA.FormItem(item)) item = item.getClassName();
        
        if (!this._textClassNames) {
            this._textClassNames = {
                text:true,
                TextItem:true,
                textItem:true,
                textArea:true,
                TextAreaItem:true,
                textAreaItem:true
            }
            this._popUpClassNames = {
                popUpTextArea:true,
                PopUpTextAreaItem:true,
                popUpTextAreaItem:true
            }
        }
        
        return this._textClassNames[item] || (!checkForPopUp || this._popUpClassNames[item]);
    },
    
    // Native handlers to be applied to elements written into the DOM
    // --------------------------------------------------------------------------------------
    
    // Focus/blur handelers to be applied to Form item elements.
    // Applied directly to the element, so we need to determine which item we are a part of
    // and call the appropriate focus/blur handler method on that item.
    _nativeFocusHandler : function () {
        if (!window.isc || !isc.DynamicForm) return;
        
        var useFocusInEvents = (isc.EH.useFocusInEvents &&
                                isc.EH.synchronousFocusNotifications);
        if (useFocusInEvents) return isc.FormItem.__nativeAsyncFocusHandler(this);


        isc.EH._setThread("IFCS");

        var result;
        if (isc.Log.supportsOnError) {
            result = isc.FormItem.__nativeFocusHandler(this);
        } else {
            try {
                result = isc.FormItem.__nativeFocusHandler(this);
            } catch (e) {
                isc.Log._reportJSError(e);
                if (isc.Log.rethrowErrors) {
                    
                    throw e;;
                }
                
            }
        }
        isc.EH._clearThread();
        return result;
    },
    
    // If we're using 'onfocusin' to give us synchronous focus notification in IE,
    // the native 'onfocus' notification also fires [asynchronously].
    // We capture this too to handle any cases where native behaviors that we
    // might need to be aware of occur asynchronously on focus
    
    __nativeAsyncFocusHandler : function (element) {
        var useFocusInEvents = (isc.EH.useFocusInEvents &&
                                isc.EH.synchronousFocusNotifications);
        if (useFocusInEvents) {
            var itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item;
            if (item) {
                item._handleAsyncFocusNotification();
            }
            return;
        }
    
    },
    __nativeFocusHandler : function (element) {
        
        //!DONTCOMBINE
        var itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item;

        if (item != null) {
            
            if (item.isDisabled()) {
                element.blur();
                return;
            }

            
            var EH = this.ns.EH;
            
            if (EH.mouseDownEvent != null &&
                EH._nativeMouseEventMap[EH.mouseDownEvent.DOMevent.type] === EH.TOUCH_START &&
                this.containerWidget != null &&
                this.containerWidget.isDrawn())
            {
                var mouseDownDOMevent = EH.mouseDownEvent.DOMevent,
                    targetElem = (mouseDownDOMevent.target && (mouseDownDOMevent.target.nodeType == 1 ? mouseDownDOMevent.target
                                                                                                      : mouseDownDOMevent.target.parentElement));
                if (targetElem != null && !this.containerWidget.getClipHandle().contains(targetElem)) {
                    element.blur();
                    return;
                }
            }

            return item._nativeElementFocus(element, item);
        }
        isc.EH._clearThread();
    },

    _nativeBlurHandler : function () {
        // Check for blur being fired on page unload (when the isc object is out of scope)
        if (!window.isc || !isc.DynamicForm) return;
        if (isc.EH.useFocusInEvents && isc.EH.synchronousFocusNotifications) {
            return;
        }

        isc.EH._setThread("IBLR");
        var result;
        if (isc.Log.supportsOnError) {
            result = isc.FormItem.__nativeBlurHandler(this);
        } else {
            try {
                result = isc.FormItem.__nativeBlurHandler(this);
            } catch (e) {
                isc.Log._reportJSError(e);
                if (isc.Log.rethrowErrors) {
                    
                    throw e;;
                }
            }
        }
        
        isc.EH._clearThread();
        return result;
    },
    __nativeBlurHandler : function (element) {
        //!DONTCOMBINE
        var itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item;
        if (item && item.hasFocus) {
            return item._nativeElementBlur(element, item);
        }
    },
    
    // handler for native oncut / onpaste events
    
    _nativeCut : function (nativeEvent) {
        if (!window.isc) return;
        var element = this,
            itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item;

        if (item && item.hasFocus) {
            return item._nativeCutPaste(element, item, true, nativeEvent);
        }
                
    },
    _nativePaste : function (nativeEvent) {
        if (!window.isc) return;
        var element = this,
            itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item;
            
        if (item && item.hasFocus) {
            return item._nativeCutPaste(element, item, false, nativeEvent);
        }
        
    },
    
    // For some form items we make use of the native onchange handler.
    // This is a single function that will be applied directly to elements as a change handler
    // Currently used by the nativeSelectItem class and the checkboxItem class (and UploadItem)
    _nativeChangeHandler : function () {
        
        //!DONTCOMBINE
        if (!window.isc || !isc.DynamicForm) return;

        var element = this,
            itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item;
        if (item) return item._handleElementChanged();
    },

    // Focus / blur handlers applied directly to icons
    _nativeIconFocus : function () {
        //!DONTCOMBINE
        if (isc.EH.useFocusInEvents && isc.EH.synchronousFocusNotifications) return;

        var element = this,
            itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item,
            iconID = itemInfo.overIcon;
        if (item) {
            
            if (item.iconIsDisabled(iconID)) element.blur();
            else return item._iconFocus(iconID, element);
        }
    },
    
    _nativeIconBlur : function () { 
        //!DONTCOMBINE
        if (!window.isc) return;
        if (isc.EH.useFocusInEvents && isc.EH.synchronousFocusNotifications) return;
        
        var element = this,
            itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
            item = itemInfo.item,
            iconID = itemInfo.overIcon;
        if (item && !item.iconIsDisabled(iconID)) return item._iconBlur(iconID, element);
    },

    // Native click handler for icons can just return false. This will cancel navigation.
    // We will fire icon.click() via the standard DynamicForm.handleClick method    
    _nativeIconClick : function () {
        return false;
    },
    
    
    _testStuckSelectionAfterRedraw : function (formItem) {
        if (!isc.Browser.isIE) return;
        this._testFocusAfterRedrawItem = formItem;
        this.fireOnPause("testStuckSelection", {target:this, methodName:"_testStuckSelection"});
    },
    _testStuckSelection : function () {
        var item = this._testFocusAfterRedrawItem;
        // Focus may have moved elsewhere etc since the refocusAfterRedraw
        if (item == null ||
            item.destroyed ||
            !item.isDrawn() ||
            !item.isVisible() ||
            !item.hasFocus) 
        {
            return;
        }
        if (item._IESelectionStuck()) {
            
            item.focusInItem();
        }
    },
    
    // Helper method to return a prompt string to show in hovers over error icons
    getErrorPromptString : function (errors) {
        var errorString = "";
        if (!isc.isAn.Array(errors)) errors = [errors];
        for (var i =0; i< errors.length; i++) {
            errorString += (i > 0 ? "<br>" : "") + errors[i].asHTML();
        };
        return errorString;
    },
    
    
    // HTML templating involving no-style-doubling string [which may change at runtime]
    _getOuterTableStartTemplate : function () {
        if (!this._observingDoublingStrings) {
            isc.Canvas._doublingStringObservers.add({
                target:this, 
                methodName:"_doublingStringsChanged"
            });
            this._observingDoublingStrings = true;
        }
        if (this._$outerTableStartTemplate == null) {
            this._$outerTableStartTemplate = [
                "<TABLE role='presentation' CELLSPACING=0 CELLPADDING=0 BORDER=0 ID='",         // 0
                ,                                                           // 1 [ID for outer table]
                // We'll apply the 'cellStyle' for the item to the outer table as styles won't
                // be inherited by sub elements of the table.
                // Explicitly avoid getting doubled borders etc.
                "' STYLE='" + isc.Canvas._$noStyleDoublingCSS,              // 2
                ,                                                           // 3 [css to override class attrs]
                "' CLASS='",                                                // 4
                ,                                                           // 5 [pick up the cellStyle css class]
                
                "'><TR>",                                                   // 6
                ,                                                           // 7 Potential first cell for 
                                                                            //   error on left...
                // Main cell - If we're showing a picker this will contain the 'control' table
                // If we're not showing a picker, this will contain the 'text box'                                                                    
                "<TD style='",                                              // 8
                ,                                                           // 9 [possibly css for text box cell]
                "' VALIGN=",                                                // 10 
                        
                ,                                                           // 11   [v align]
                ">"                                                         // 12
                // Either the text box element (returned by getElementHTML()) or an inner control table
                
            ];
        }
        return this._$outerTableStartTemplate;
    },

    _getIconsCellTemplate : function () {
        if (!this._observingDoublingStrings) {
            isc.Canvas._doublingStringObservers.add({
                target:this, 
                methodName:"_doublingStringsChanged"
            });
            this._observingDoublingStrings = true;
        }

        if (this._$iconsCellTemplate == null) {
            this._$iconsCellTemplate = [
                "</TD><TD VALIGN=",     // 0
                ,                       // 1 [v align property for icons]
                
                
                ,                       // 2
                ,                       // 3 [total icons width]
                " style='" + isc.Canvas._$noStyleDoublingCSS + "line-height:",
                ,                       // 5 iconHeight
                "px' class='",          // 6
                ,                       // 7 Apply standard cell style to the item
                "' ID='",               // 8
                ,                       // 9 ID for cell 
                                        //  (allows us to show/hide icons by writing into the cell)
                "'>",                   // 10
                null                    // 11 [icons HTML]
            ];
        }
        return this._$iconsCellTemplate;
    },
    _doublingStringsChanged : function () {
        this._$outerTableStartTemplate = null;
        this._$iconsCellTemplate = null;
    },


    //> @classMethod FormItem.getPickerIcon() 
    // Returns a +link{formItemIcon} for a standard picker with skin-specific
    // settings.
    // @param pickerName (PickerIconName) Name of picker icon
    // @param [properties] (FormItemIcon) Properties to apply to new picker icon
    // @return (FormItemIcon) the icon for picker
    // @visibility external
    //<
    getPickerIcon : function (pickerName, properties) {
        var iconSrc = isc.FormItem.standardPickers[pickerName];
        if (!iconSrc) return null;
        iconSrc += "." + isc.pickerImgType;

        var hspace = isc.FormItem.defaultPickerIconSpace || 0,
            height = isc.FormItem.defaultPickerIconHeight || 22
        ;
        return isc.addProperties({ hspace: hspace, height: height, src: iconSrc }, properties);
    }
});

isc.FormItem.addClassProperties({
    
    _inputElementTagName : "input",
    _textElementType : "text",
    _textAreaElementTagName : "textarea",
    _cellStyleCache: {},
    _rtlCellStyleCache: {},

    //> @classAttr FormItem.defaultPickerIconSpace (Integer : 0 : IR)
    // Default +link{formItemIcon.hspace,hspace} value for pickers
    // created by +link{FormItem.getPickerIcon}.
    // @visibility external
    //<

    //> @classAttr FormItem.defaultPickerIconHeight (Integer : 22 : IR)
    // Default +link{formItemIcon.height,height} value for pickers
    // created by +link{FormItem.getPickerIcon}.
    // @visibility external
    //<

    // Standard pickers used with getPickerIcon
    standardPickers: {
        "clear": "[SKIN]/pickers/clear_picker",
        "comboBox": "[SKIN]/pickers/comboBoxPicker",
        "date": "[SKIN]/pickers/date_picker",
        "refresh": "[SKIN]/pickers/refresh_picker",
        "search": "[SKIN]/pickers/search_picker"
    }
});

isc.FormItem.addProperties({

    // Basics
    // ---------------------------------------------------------------------------------------

    //> @type FormItemClassName
    // Name of a SmartClient Class that subclasses +link{FormItem}.  Some values with this type:
    // <ul><li>+link{TextItem,"TextItem"}
    // <li>+link{SliderItem,"SliderItem"}, 
    // <li>+link{CanvasItem,"CanvasItem"}
    // </ul>
    // 
    // @baseType String
    // @visibility external
    //<

    //> @type FormItemType
    // DynamicForms automatically choose the FormItem type for a field based on the
    // <code>type</code> property of the field.  The table below describes the default FormItem
    // chosen for various values of the <code>type</code> property.
    // <P>
    // You can also set +link{FormItem.editorType,field.editorType} to the classname of a
    // +link{FormItem} to override this default mapping.  You can alternatively override
    // +link{dynamicForm.getEditorType()} to create a form with different rules for which
    // FormItems are chosen.
    // <P>
    // @value "text"    Rendered as a +link{class:TextItem}, unless the length of the field (as
    // specified by +link{attr:dataSourceField.length} attribute) is larger than the value
    // specified by +link{attr:dynamicForm.longTextEditorThreshold}, a
    // +link{class:TextAreaItem} is shown.
    //
    // @value "boolean"   Rendered as a +link{class:CheckboxItem}
    //
    // @value "integer"   Rendered as an +link{class:IntegerItem}, a trivial subclass of  
    //                    +link{class:TextItem}, by default.  
    //                    Consider setting editorType:+link{SpinnerItem}.
    // @value "float"     Rendered as a +link{class:FloatItem}, a trivial subclass of  
    //                    +link{class:TextItem}, by default.
    //                    Consider setting editorType:+link{SpinnerItem}.
    // @value "date"      Rendered as a +link{class:DateItem}
    // @value "time"      Rendered as a +link{class:TimeItem}
    // @value "datetime"  Rendered as a +link{class:DateTimeItem}
    // @value "enum"      Rendered as a +link{class:SelectItem}.  Also true for any field that
    //                    specifies a +link{formItem.valueMap}.  
    //                    Consider setting editorType:+link{ComboBoxItem}.
    // @value "sequence"  Same as <code>text</code>
    // @value "link"      If +link{dataSourceField.canEdit}<code>:false</code> is set on the field,
    //                    the value is rendered as a +link{class:LinkItem}.  Otherwise the field 
    //                    is rendered as a +link{class:TextItem}.
    // @value "image"     If the field is editable, rendered as a +link{TextItem} to edit the 
    //                    URL or partial URL<br>
    //                    If +link{formItem.canEdit,non editable}, and 
    //                    +link{dynamicForm.readOnlyDisplay,readOnlyDisplay} is "static", an
    //                    image will be rendered out, deriving the URL from the field value
    //                    combined with +link{formItem.imageURLPrefix} and 
    //                    +link{formItem.imageURLSuffix} if present. This behavior may be
    //                    suppressed via +link{dynamicForm.showImageAsURL}, in which case
    //                    the value (URL or partial URL) will be rendered out as static text.
    // @value "imageFile" Rendered as a +link{class:FileItem}, or a +link{ViewFileItem} if not editable
    // @value "binary"    Rendered as a +link{class:FileItem}, or a +link{ViewFileItem} if not editable
    //
    // @see attr:FormItem.type
    // @see type:FieldType
    // @visibility external
    //<
    
    //> @attr formItem.type (FormItemType : "text" : [IR])
    // The DynamicForm picks a field renderer based on the type of the field (and sometimes other
    // attributes of the field).
    //
    // @see type:FormItemType
    // @see type:FieldType
    // @group appearance
    // @visibility external
    //< 
    // Note: FormItem.type should not typically be set at the class level as this is likely 
    // to break dynamic data type calculation based on criteriaField or on fieldTypeProperty value.
    // Instead a default may be specified via formItem.defaultType
    

    //> @attr formItem.editorType (FormItem Class : null : [IR])
    // Name of the FormItem to use for editing, eg "TextItem" or "SelectItem".
    // <P>
    // The type of FormItem to use for editing is normally derived automatically from
    // +link{formItem.type,field.type}, which is the data type of the field, by the rules
    // explained +link{type:FormItemType,here}.
    //
    // @see type:FormItemType
    // @see type:FieldType
    // @group appearance
    // @visibility external
    //<

    getReadOnlyDisplay : function () {
        if (this.readOnlyDisplay != null) return this.readOnlyDisplay;

        // Check container(s)
        var item = this;
        while (item.parentItem != null) {
            item = item.parentItem;
            if (item.readOnlyDisplay != null) return item.readOnlyDisplay;
        }

        var form = this.form;
        if (form != null) {
            return form.readOnlyDisplay;
        }

        return isc.DynamicForm._instancePrototype.readOnlyDisplay;
    },

    //> @method formItem.setReadOnlyDisplay()
    // Setter for +link{FormItem.readOnlyDisplay}.
    // <P>
    // Note that calling this method for a +link{ButtonItem} with +link{ButtonItem.enableWhen}
    // set is an error, since +link{readOnlyDisplay} is then considered to always be "disabled".
    // @param appearance (ReadOnlyDisplayAppearance) new <code>readOnlyDisplay</code> value.
    // @visibility external
    //<
    setReadOnlyDisplay : function (appearance) {
        var oldAppearance = this.getReadOnlyDisplay();
        this.readOnlyDisplay = appearance;
        appearance = this.getReadOnlyDisplay();
        var willRedraw = (oldAppearance !== appearance && this.isReadOnly() && this.isDrawn());
        this.updateReadOnlyDisplay(willRedraw);
        if (willRedraw) this.redraw();
    },

    _origReadOnlyDisplay: null,
    updateReadOnlyDisplay : function (willRedraw) {
        var origReadOnlyDisplay = this._origReadOnlyDisplay;
        
        var readOnlyDisplay = this._origReadOnlyDisplay = this.getReadOnlyDisplay();

        if (origReadOnlyDisplay !== readOnlyDisplay) {
            this._readOnlyDisplayChanged(readOnlyDisplay, willRedraw);
        }
    },

    _readOnlyDisplayChanged : function (appearance, willRedraw) {
        if (this.readOnlyDisplayChanged != null) this.readOnlyDisplayChanged(appearance);
    },

    //> @method formItem.readOnlyDisplayChanged()
    // Notification method called when +link{FormItem.readOnlyDisplay,readOnlyDisplay} is
    // modified. Developers may make use of this to toggle between read-only appearances for
    // custom <code>FormItem</code> types.
    // @param appearance (ReadOnlyDisplayAppearance) new <code>readOnlyDisplay</code> value
    // @return (boolean)
    //<
    //readOnlyDisplayChanged : null,

    getReadOnlyTextBoxStyle : function () {
        return this.readOnlyTextBoxStyle || 
                    (this.form ? this.form.readOnlyTextBoxStyle : "staticTextItem");
    },

    _getClipStaticValue : function () {
        var item = this;
        do {
            var clipStaticValue = item.clipStaticValue;
            if (clipStaticValue != null) return clipStaticValue;

            item = item.parentElement;
        } while (item != null);

        var form = this.form;
        if (form != null) {
            return !!form.clipStaticValue;
        }

        return !!isc.DynamicForm._instancePrototype.clipStaticValue;
    },

    //> @attr formItem.name (FieldName : null : IR)
    // Name for this form field. Must be unique within the form as well as a valid JavaScript
    // identifier - see +link{FieldName} for details and how to check for validity.
    // <P>
    // The FormItem's name determines the name of the property it edits within the form.
    // <P>
    // Note that an item must have a valid name or +link{formItem.dataPath, dataPath} in order
    // for its value to be validated and/or saved. 
    // 
    // @group basics
    // @visibility external
    //<
    
    //> @attr formItem.dataPath (DataPath : null : IR)
    // dataPath for this item. Allows the user to edit details nested data structures in a
    // flat set of form fields
    // <P>
    // <b>NOTE: the dataPath feature is intended to help certain legacy architectures, 
    // such as systems that work in terms of exchanging large messages with several different 
    // entity types in one message, and are incapable of providing separate access to each 
    // entity type.<br>
    // See the +link{type:DataPath,DataPath overview} for more information.</b>
    // <P>
    // Note that an item must have a valid dataPath or +link{formItem.name, name} in order
    // for its value to be validated and/or saved. 
    // @visibility external
    //<

    //> @attr formItem.title (HTMLString : null : IRW)
    // User visible title for this form item.
    // 
    // @group basics
    // @visibility external
    //<    

    //> @attr formItem.defaultValue       (Any : null : IRW)
    // Value used when no value is provided for this item. Note that whenever this item's value
    // is cleared programmatically (for example via <code>item.clearValue()</code> or 
    // <code>item.setValue(null)</code>), it will be
    // reverted to the <code>defaultValue</code>. 
    // <P>
    // Developers should use the
    // +link{DynamicForm.values} object if their intention is to provide an initial value for a
    // field in a form rather than a value to use in place of <code>null</code>.
    // <P>
    // Developers looking to provide a 'hint' or placeholder value for an empty item may wish to use
    // +link{hint} (possibly in conjunction with +link{textItem.showHintInField}), or +link{prompt}.
    // <P>
    // Note: Some items provide a user interface allowing the user to explicitly clear them - for
    // example a standard TextItem. If such an item has a defaultValue specified, and the user explicitly
    // clears that value, the value of the item will be (correctly) reported as null, and will remain
    // null over form item redraw()s. However any programmatic call to set the value to null 
    // (including, but not limited to <code>item.clearValue()</code>, <code>item.setValue(null)</code>,
    //  <code>dynamicForm.setValues(...)</code> with a null value for this field, etc) will
    // reset the item value to its default. 
    //
    // @see method:defaultDynamicValue
    // @group basics
    // @visibility external
    // @example fieldEnableDisable
    //<
    
    //> @attr formItem.value (Any : null : IR)
    // Value for this form item.
    // <smartclient>This value may be set directly on the form item initialization
    // block but is not updated on live items and should not be directly accessed.
    // Once a form item has been created by the dynamicForm use +link{FormItem.setValue()} and
    // +link{FormItem.getValue()} directly.</smartclient>
    // @group basics
    // @visibility external
    //<
    
    //> @attr formItem.ID (GlobalId : null : IRW)
    // Global identifier for referring to the formItem in JavaScript.  The ID property is
    // optional if you do not need to refer to the widget from JavaScript, or can refer to it
    // indirectly (for example, via <code>form.getItem("<i>itemName</i>")</code>).
    // <P>
    // An internal, unique ID will automatically be created upon instantiation for any formItem
    // where one is not provided.
    //
    // @group basics
    // @visibility external
    //<

    //> @attr formItem.emptyDisplayValue (String : "" : IRW)
    // Text to display when this form item has a null or undefined value.
    // <P>
    // If the formItem has a databound pickList, and its +link{formItem.displayField} or
    // +link{formItem.valueField} (if the former isn't set) has an undefined
    // +link{ListGridField.emptyCellValue,emptyCellValue} setting, that field's
    // <code>emptyCellValue</code> will automatically be set to the <code>emptyDisplayValue</code>.
    //
    // @group display_values
    // @visibility external
    //<
    emptyDisplayValue:"",
    
    //> @attr formItem.hidden (Boolean : null : IR)
    // Should this form item be hidden? Setting this property to <code>true</code> on 
    // an item configuration will have the same effect as having a +link{formItem.showIf()}
    // implementation which returns <code>false</code>.
    // <P>
    // Note this differs slightly from +link{dataSourceField.hidden}. That property 
    // will cause the field in question to be omitted entirely from databound
    // components by default. A dataSourceField with <code>hidden</code> set to
    // <code>true</code> can still be displayed in a DynamicForm either by being
    // explicitly included in the specified +link{DynamicForm.items,items array}, or 
    // by having +link{DataBoundComponent.showHiddenFields} set to true.
    // In this case, this property will not be inherited onto the FormItem instance,
    // meaning the item will be visible in the form even though the <code>hidden</code>
    // property was set to true on the dataSourceField configuration object.
    //
    // @visibility external
    //<

    // ValueMap
    // -----------------------------------------------------------------------------------------
        
    //> @attr formItem.valueMap (Array | Object: null : IRW)
    // In a form, valueMaps are used for FormItem types that allow the user to pick from a
    // limited set of values, such as a SelectItem.  The valueMap can be either an Array of
    // legal values or an Object where each property maps a stored value to a user-displayable
    // value.
    // <P>
    // To set the initial selection for a form item with a valueMap, use
    // +link{formItem.defaultValue}.
    // <P>
    // See also +link{dataSourceField.valueMap}.
    // 
    // @group valueMap
    // @visibility external
    //<
    
    // optionDataSource
    // ----------------------------------------------------------------------------------------

    //> @attr formItem.optionDataSource        (DataSource | String : null : IR)
    // If set, this FormItem will map stored values to display values as though a
    // +link{valueMap} were specified, by fetching records from the 
    // specified <code>optionDataSource</code> and extracting the
    // +link{formItem.valueField,valueField} and 
    // +link{formItem.displayField,displayField} in loaded records, to derive one
    // valueMap entry per record loaded from the optionDataSource.
    // <P>
    // With the default setting of +link{formItem.fetchMissingValues,fetchMissingValues}, fetches will be initiated against
    // the optionDataSource any time the FormItem has a non-null value and no corresponding
    // display value is available.  This includes when the form is first initialized, as well
    // as any subsequent calls to +link{formItem.setValue()}, such as may happen when
    // +link{DynamicForm.editRecord()} is called.  Retrieved values are automatically cached by
    // the FormItem.
    // <P>
    // Note that if a normal, static +link{formItem.valueMap,valueMap} is <b>also</b> specified for
    // the field (either directly in the form item or as part of the field definition in the
    // dataSource), it will be preferred to the data derived from the optionDataSource for
    // whatever mappings are present.
    // <P>
    // In a databound form, if +link{FormItem.displayField} is specified for a FormItem and 
    // <code>optionDataSource</code> is unset, <code>optionDataSource</code> will default to
    // the form's current DataSource 
    //
    // @see FormItem.invalidateDisplayValueCache()
    // @group display_values
    // @visibility external
    // @getter getOptionDataSource()
    // @example listComboBox
    //<

    //> @attr FormItem.optionFilterContext     (RPCRequest Properties : null : IRA)
    // If this item has a specified <code>optionDataSource</code>, and this property is
    // not null, this will be passed to the datasource as +link{rpcRequest} properties when
    // performing the fetch operation on the dataSource to obtain a data-value to display-value
    // mapping
    // @visibility external
    //<
    
    //> @attr FormItem.optionCriteria     (Criteria : null : IR)
    // If this item has a specified <code>optionDataSource</code>, and this property may be used
    // to specify criteria to pass to the datasource when
    // performing the fetch operation on the dataSource to obtain a data-value to display-value
    // mapping.
    // <p>
    // The criteria generated for this fetch will consist of the specified optionCriteria, 
    // combined with criteria required to identify the current item value.<br>
    // For example, if a developer's use case was DataSource of user records, with 
    // +link{formItem.valueField} set to <i>"userID"</i>" and +link{formItem.displayField}
    // set to <i>"userName"</i>, the generated criteria to retrieve the display value
    // for the item would look for an exact match between the current item value and the
    // userID field in the dataSource. The <i>optionCriteria</i> would allow additional
    // restrictions on this fetch (searching for records matching some other 
    // <i>"region"</i> field, say).<br>
    // The sub-criterion containing the current valueField value will always look for an
    // exact match (rather than any kind of substring match), so if +link{optionTextMatchStyle}
    // is set to something other than "exact", developers may expect to see AdvancedCriteria
    // passed to the server
    // <p>
    // This property supports +link{group:dynamicCriteria} - use +link{criterion.valuePath}
    // to refer to values in the +link{canvas.ruleScope}. Criteria are re-evaluated when
    // the +link{canvas.getRuleContext,rule context} changes.
    //
    // @group databinding
    // @group searchCriteria
    // @visibility external
    //<

    //> @attr FormItem.optionTextMatchStyle (TextMatchStyle : "exact" : IRA)
    // If this item has a specified <code>optionDataSource</code>, this property determines
    // the textMatchStyle to use when interpretating any +link{optionCriteria} during the
    // fetch to map valueField values to displayField values.
    // @group databinding
    // @group searchCriteria
    // @visibility external
    //<
    optionTextMatchStyle:"exact",

    //> @attr FormItem.optionOperationId     (String : null : IRA)
    // If this item has a specified <code>optionDataSource</code>, this attribute may be set
    // to specify an explicit +link{DSRequest.operationId} when performing a fetch against the
    // option dataSource to pick up display value mapping.
    // @group databinding
    // @visibility external
    //<

    //> @attr formItem.valueField  (String : null : IR)
    // If this form item maps data values to display values by retrieving the 
    // +link{FormItem.displayField} values from an 
    // +link{FormItem.optionDataSource,optionDataSource}, this property 
    // denotes the the field to use as the underlying data value in records from the 
    // optionDataSource.<br>
    // If not explicitly supplied, the valueField name will be derived as
    // described in +link{formitem.getValueFieldName()}.
    // @group databinding
    // @visibility external
    // @getter getValueFieldName()
    //<

    //> @attr formItem.displayField   (String : null : IR) 
    // If set, this item will display a value from another field to the user instead of
    // showing the underlying data value for the +link{formItem.name,field name}.
    // <P>
    // This property is used in two ways:
    // <P>
    // The item will display the displayField value from the 
    // +link{dynamicForm.getValues(),record currently being edited} if 
    // +link{formItem.useLocalDisplayFieldValue} is true, (or if unset and the conditions
    // outlined in the documentation for that property are met).
    // <P>
    // If this field has an +link{FormItem.optionDataSource}, this property is used by
    // default to identify which value to use as a display value in records from this
    // related dataSource. In this usage the specified displayField must be 
    // explicitly defined in the optionDataSource to be used - see 
    // +link{getDisplayFieldName()} for more on this behavior.<br>
    // If not using +link{useLocalDisplayFieldValue,local display values}, the display
    // value for this item will be derived by performing a fetch against the 
    // +link{formItem.getOptionDataSource(),option dataSource} 
    // to find a record where the +link{FormItem.getValueFieldName(),value field} matches 
    // this item's value, and use the <code>displayField</code> value from that record.<br>
    // In addition to this, PickList-based form items that provide a list of possible
    // options such as the +link{SelectItem} or +link{ComboBoxItem} will show the 
    // <code>displayField</code> values to the user by default, allowing them to choose
    // a new data value (see +link{formItem.valueField}) from a list of user-friendly
    // display values.
    // <P>
    // This essentially allows the specified <code>optionDataSource</code> to be used as
    // a server based +link{group:valueMap}.
    // <P>
    // If +link{formItem.useLocalDisplayFieldValue,local display values}
    // are being used and +link{formItem.storeDisplayValues} is true, selecting a new value
    // will update both the value for this field and the associated display-field value
    // on the record being edited.
    // <P>
    // Note: Developers may specify the +link{formItem.foreignDisplayField} property 
    // in addition to <code>displayField</code>. This is useful for cases where the
    // display field name in the local dataSource differs from the display field name in
    // the optionDataSource. See the documentation for
    // +link{dataSourceField.foreignDisplayField} for more on this.<br>
    // If a foreignDisplayField is specified, as with just displayField, if 
    // +link{formItem.useLocalDisplayFieldValue,local display values}
    // are being used and +link{formItem.storeDisplayValues} is true, when the user 
    // chooses a value the associated display-field value 
    // on the record being edited will be updated. In this case it would be set to the 
    // foreignDisplayField value from the related record. This means foreignDisplayField 
    // is always expected to be set to the equivalent field in the related dataSources.<br>
    // Developers looking to display some <i>other</i> arbitrary field(s) from the
    // related dataSource during editing should consider using custom
    // +link{pickList.pickListFields} instead of setting a foreignDisplayField. 
    // <P>
    // Note that if <code>optionDataSource</code> is set and no valid display field is
    // specified,
    // +link{formItem.getDisplayFieldName()} will return the dataSource title 
    // field by default.
    // <P>
    // If a displayField is specified for a freeform text based item (such as a 
    // +link{ComboBoxItem}), any user-entered value will be treated as a display value.
    // In this scenario, items will derive the data value for the item from the
    // first record where the displayField value matches the user-entered value.
    // To avoid ambiguity, developers may wish to avoid this usage if display values
    // are not unique.
    //
    // @see FormItem.getDisplayFieldName()
    // @see FormItem.invalidateDisplayValueCache()
    // @group databinding
    // @visibility external
    // @getter getDisplayFieldName()
    //<
    
    //> @attr formItem.useLocalDisplayFieldValue (Boolean : null : IR)
    // If +link{formitem.displayField} is specified for a field, should the
    // display value for the field be picked up from the 
    // +link{dynamicForm.getValues(),record currently being edited}?
    // <P>
    // This behavior is typically valuable for dataBound components where the
    // displayField is specified at the DataSourceField level. See
    // +link{dataSourceField.displayField} for more on this.
    // <P>
    // Note that for DataSources backed by the
    // +link{group:serverDataIntegration,SmartClient server}, fields with a specified
    // +link{DataSourceField.foreignKey} and +link{DataSourceField.displayField} will
    // automatically have this property set to true if not explicitly set to false
    // in the dataSource configuration.
    // <P>
    // Otherwise, if not explicitly set, local display value will be used unless:
    // <ul>
    //  <li>This item has an explicitly specified optionDataSource, rather than
    //      deriving its optionDataSource from a specified 
    //      +link{dataSourceField.foreignKey} specification</li>
    //  <li>The +link{formItem.name} differs from the 
    //      +link{formItem.getValueFieldName(),valueField} for the item</li>
    // </ul>
    //
    // @visibility external
    //<
    
    //> @attr formItem.foreignDisplayField (String : null : IR)
    // For items with an +link{optionDataSource}, this property specifies an explicit
    // display field for records within the option dataSource. Typically this property
    // will be set in conjunction with +link{formItem.displayField} in the case where
    // the name of the displayField within the record being edited differs from the 
    // displayField in the optionDataSource.
    // <P>
    // See +link{dataSourceField.foreignDisplayField} for additional details.
    //
    // @see FormItem.getDisplayFieldName()
    // @visibility external
    //<
    
    
    //> @attr formItem.multipleValueSeparator   (String : ', ' : IR) 
    // If this item is displaying multiple values, this property will be the
    // string that separates those values for display purposes.
    //
    // @group display_values
    // @visibility external
    //<
    multipleValueSeparator: ", ",
    
    //> @attr formItem.fetchMissingValues   (Boolean : true : IRWA)
    // If this form item has a specified +link{FormItem.optionDataSource}, should the
    // item ever perform a fetch against this dataSource to retrieve the related record.
    // <P>
    // The fetch occurs if the item value is non null on initial draw of the form
    // or whenever setValue() is called. Once the fetch completes, the returned record 
    // is available via the +link{FormItem.getSelectedRecord()} api.
    // <P>
    // By default, a fetch will only occur if +link{formItem.displayField} is specified, and
    // the item does not have an explicit +link{formItem.valueMap} containing the
    // data value as a key.<br>
    // However you can also set +link{formItem.alwaysFetchMissingValues} to have a fetch occur
    // even if no <code>displayField</code> is specified. This ensures 
    // +link{formItem.getSelectedRecord()} will return a record if possible - useful for
    // custom formatter functions, etc.
    // <P>
    // Note - for efficiency we cache the associated record once a fetch has been performed, meaning
    // if the value changes, then reverts to a previously seen value, we do not kick
    // off an additional fetch to pick up the display value for the previously seen data value.
    // If necessary this cache may be explicitly invalidated via a call to 
    // +link{formItem.invalidateDisplayValueCache()}
    //
    // @group display_values
    // @see formItem.optionDataSource
    // @see formItem.getSelectedRecord()
    // @see formItem.filterLocally
    // @visibility external
    //<
    fetchMissingValues:true,
    
    //> @attr formItem.alwaysFetchMissingValues (Boolean : false : IRWA)
    // If this form item has a specified +link{FormItem.optionDataSource} and 
    // +link{formItem.fetchMissingValues} is true, when the item value changes, a fetch will be
    // performed against the optionDataSource to retrieve the related record 
    // if +link{formItem.displayField} is specified and the new item value is not present in any
    // valueMap explicitly specified on the item.
    // <P>
    // Setting this property to true means that a fetch will occur against the optionDataSource 
    // to retrieve the related record even if +link{formItem.displayField} is unset, or the
    // item has a valueMap which explicitly contains this field's value.
    // <P>
    // An example of a use case where this might be set would be if +link{formItem.formatValue}
    // or +link{formItem.formatEditorValue} were written to display properties from the
    // +link{formItem.getSelectedRecord(),selected record}.
    // <P>
    // Note - for efficiency we cache the associated record once a fetch has been performed, meaning
    // if the value changes, then reverts to a previously seen value, we do not kick
    // off an additional fetch even if this property is true. If necessary this cache may be
    // explicitly invalidated via a call to +link{formItem.invalidateDisplayValueCache()}
    //
    // @group display_values
    // @visibility external
    //<
    alwaysFetchMissingValues:false,

    //> @attr formItem.loadingDisplayValue (String : "Loading..." : IRW)
    // Value shown in field when +link{fetchMissingValues,fetchMissingValues} is active and a
    // fetch is pending. The field is read-only while a fetch is pending.
    // <P>
    // Set to <code>null</code> to show actual value until display value is loaded.
    // @group display_values
    // @group i18nMessages
    // @visibility external
    //<
    loadingDisplayValue:"Loading...",


    //> @attr formItem.filterLocally (boolean : null : IRA)
    // If this form item is mapping data values to a display value by fetching records from a 
    // dataSource (see +link{FormItem.optionDataSource}, +link{FormItem.displayField} 
    // and +link{FormItem.fetchMissingValues}), setting this property to true ensures that when
    // the form item value is set, entire data-set from the dataSource is loaded at once and 
    // used as a valueMap, rather than just loading the display value for the current value.
    // This avoids the need to perform fetches each time setValue() is called with a new value.
    // <P>
    // See also +link{PickList.filterLocally} for behavior on form items such as SelectItems
    // that show pick-lists.
    //
    // @group display_values
    // @visibility external
    //<
    
    // Data Type Formatters
    // ---------------------------------------------------------------------------------------
    // Note: dateFormatter and timeFormatter provide a way to control format of date or 
    // time data in a generic form item such as a static text item.
    // Consistent name with ListGrid.dateFormatter / timeFormatter
    
    //> @attr formItem.dateFormatter (DateDisplayFormat : null : [IRWA])
    // Display format to use for date type values within this formItem.
    // <P>
    // Note that Fields of type <code>"date"</code>, <code>"datetime"</code> or 
    // <code>"time"</code> will be edited using a +link{DateItem} or +link{TimeItem} by 
    // default, but this can be overridden - for <code>canEdit:false</code> fields, a
    // +link{StaticTextItem} is used by default, and the developer can always specify 
    // a custom +link{formItem.editorType} as well as +link{formItem.type,data type}.
    // <P>
    // The +link{formItem.timeFormatter} may also be used to format underlying Date values as
    // times (ommitting the date part entirely). If both <code>dateFormatter</code> and
    // <code>timeFormatter</code> are specified on an item, for
    // fields specified as +link{formItem.type,type "time"} the
    // <code>timeFormatter</code> will be used, otherwise the <code>dateFormatter</code>
    // <P>
    // If <code>item.dateFormatter</code> and <code>item.timeFormatter</code> is unspecified,
    // date display format may be defined at the component level via
    // +link{DynamicForm.dateFormatter}, or for fields of type <code>"datetime"</code>
    // +link{DynamicForm.datetimeFormatter}. Otherwise the
    // default is to use the system-wide default short date format, configured via
    // +link{DateUtil.setShortDisplayFormat()}.  Specify any valid +link{type:DateDisplayFormat}
    // to change the format used by this item.
    // <P>
    // Note that if this is a freeform editable field, such a +link{TextItem}, with type
    // specified as <code>"date"</code> or <code>"datetime"</code> the system will automatically
    // attempt to parse user entered values back to a Date value, assuming the entered string
    // matches the date format for the field. Developers may further customize this via an
    // explicit +link{formItem.inputFormat} or via entirely custom
    // <smartclient>
    // +link{formItem.formatEditorValue} and +link{formItem.parseEditorValue} methods.
    // </smartclient>
    // <smartgwt>
    // <code>setEditorValueFormatter</code> and <code>setEditorValueParser</code> methods.
    // </smartgwt>
    // 
    // @see formItem.timeFormatter
    // @see formItem.format
    //
    // @group appearance
    // @visibility external
    //<
    //dateFormatter:null
    
    // Undocumented flag -- if no formatter is explicitly specified and we're looking at
    // a js date value should we use "normal" or "short" formatter by default.
    // Won't effect fields of type "date" since we never want to show the time (which is
    // always displayed in the "normal" format.
    useShortDateFormat:true,
    
    //> @attr formItem.timeFormatter (TimeDisplayFormat : null : [IRWA])
    // Time-format to apply to date type values within this formItem.  If specified, any
    // dates displayed in this item will be formatted as times using the appropriate format.
    // This is most commonly only applied to fields specified as type <code>"time"</code> though
    // if no explicit +link{formItem.dateFormatter} is specified it will be respected for other 
    // fields as well.
    // <P>
    // If unspecified, a timeFormatter may be defined 
    // +link{DynamicForm.timeFormatter,at the component level} and will be respected by fields
    // of type <code>"time"</code>.
    //
    // @see formItem.format
    // @group appearance
    // @visibility external
    //<
    //timeFormatter:null
    
    //> @attr formItem.displayFormat (Varies : null : [IRWA])
    // Fields of type <code>"date"</code> or <code>"time"</code> will be edited using
    // a +link{DateItem} or +link{TimeItem} by default.
    // <P>
    // However this can be overridden - for <code>canEdit:false</code> fields, a
    // +link{StaticTextItem} is used by default, and the developer can always specify 
    // a custom +link{formItem.editorType} as well as +link{formItem.type,data type}.
    // <P>
    // For fields of type <code>"date"</code>, set this property to a valid
    // +link{dateDisplayFormat} to specify how the date should be formatted.
    // <br>
    // For fields of type <code>"time"</code>, set this property to a valid 
    // +link{type:TimeDisplayFormat, TimeDisplayFormat} to specify how the time should be formatted.
    // <br>
    // Note that if +link{formItem.dateFormatter} or +link{formItem.timeFormatter} are specified
    // they will take precedence over this setting.
    // <P>
    // If this field is of type <code>"date"</code> and is editable, the 
    // +link{formItem.inputFormat} may be used to specify how user-edited date strings will
    // be parsed.
    //
    // @deprecated in favor of +link{formItem.format}, +link{formItem.dateFormatter} and 
    // +link{formItem.timeFormatter}
    // @see formItem.format
    // @see formItem.inputFormat
    // @see formItem.dateFormatter
    // @see formItem.timeFormatter
    // @visibility external
    //<
    
    //> @attr formItem.inputFormat (DateInputFormat : null : [IRWA])
    // For fields of type <code>"date"</code>, if this is an editable field such as a
    // +link{TextItem}, this property 
    // allows you to specify the +link{DateItem.inputFormat, inputFormat} applied to the item.
    // @see formItem.dateFormatter
    // @visibility external
    //<

    //> @attr formItem.decimalPrecision (number : null : [IRW])
    // @include dataSourceField.decimalPrecision
    //
    // @group appearance
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr formItem.decimalPad (number : null : [IRW])
    // @include dataSourceField.decimalPad
    //
    // @group appearance
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr formItem.format (FormatString : null : IR)
    // +link{FormatString} for numeric or date formatting.  See +link{dataSourceField.format}.
    // @group appearance
    // @visibility external
    //<

    //> @attr formItem.exportFormat (FormatString : null : IR)
    // +link{FormatString} used during exports for numeric or date formatting.  See
    // +link{dataSourceField.exportFormat}.
    // @group exportFormatting
    // @visibility external
    //<


    //> @attr formItem.showInputElement (boolean : true : IRWA) 
    // When set to false, prevents this item's input element from being written into the DOM.
    // If there are +link{formItem.valueIcons, valueIcons} or a 
    // +link{formItem.showPickerIcon, picker icon}, these are displayed as normal, and the item
    // will auto-sizing to that content if its +link{formItem.width, width} is set to null.
    // @visibility internal
    //<
    
    showInputElement: true,


    // ValueIcons
    // ---------------------------------------------------------------------------------------
    //> @attr formItem.valueIcons   (Object : null : IRW)
    // A mapping of logical form item values to +link{SCImgURL}s or the special value "blank",
    // which means that no image will be displayed.
    // If specified, when the form item is set to the value in question, an icon will be 
    // displayed with the appropriate source URL.
    // @group   valueIcons
    // @setter  setValueIcons()
    // @see     formItem.getValueIcon()
    // @visibility external
    //<

    //> @attr formItem.emptyValueIcon (String : null : IRW)
    // This property allows the developer to specify an icon to display when this item has
    // no value. It is configured in the same way as any other valueIcon 
    // (see +link{formItem.valueIcons})
    // @group valueIcons
    // @visibility external
    //<
    
    //> @attr formItem.showValueIconOnly (boolean : null : IRWA) 
    // If +link{FormItem.valueIcons} is set, this property may be set to show the valueIcon
    // only and prevent the standard form item element or text from displaying
    // @group valueIcons
    // @visibility external
    //<
    //> @attr formItem.suppressValueIcon (boolean : null : IRWA)
    // If +link{FormItem.valueIcons} is set, this property may be set to prevent the value
    // icons from showing up next to the form items value
    // @group valueIcons
    // @visibility external
    //<
    
    // If we're showing the valueIcon only, should horizontally fit to it?
    // We use this in the CheckboxItem class where we want to have a default width
    // specified (150), but essentially ignore it and allow a very thin column if
    // showLabel is false
    fitWidthToValueIcon : function () {
        return false;
    },
    
    //> @attr formItem.valueIconWidth (number : null : IRW)
    // If +link{formItem.valueIcons} is specified, use this property to specify a width for
    // the value icon written out.
    // @see FormItem.valueIconHeight
    // @see FormItem.valueIconSize
    // @group valueIcons
    // @visibility external
    //<
    
    //> @attr formItem.valueIconHeight (number : null : IRW)
    // If +link{formItem.valueIcons} is specified, use this property to specify a height for the
    // value icon written out.
    // @see FormItem.valueIconWidth
    // @see FormItem.valueIconSize
    // @group valueIcons
    // @visibility external
    //<
    
    //> @attr formItem.valueIconSize (number : 16 : IRW)
    // If +link{formItem.valueIcons} is specified, this property may be used to specify both
    // the width and height of the icon written out.
    // Note that +link{FormItem.valueIconWidth} and +link{formItem.valueIconHeight} take
    // precedence over this value, if specified.
    // @see FormItem.valueIconWidth
    // @see FormItem.valueIconHeight
    // @group valueIcons
    // @visibility external
    //<
    valueIconSize:16,

    //> @attr formItem.valueIconLeftPadding (number : 0 :  IRW)
    // If we're showing a value icon, this attribute governs the amount of space between the 
    // icon and the start edge of the form item cell.
    // <p>
    // <b>NOTE:</b> In RTL mode, the valueIconLeftPadding is applied to the <em>right</em> of
    // the value icon.
    // @see FormItem.valueIcons
    // @visibility external
    // @group valueIcons
    //<
    valueIconLeftPadding:0,

    //> @attr formItem.valueIconRightPadding (number : 3 :  IRW)
    // If we're showing a value icon, this attribute governs the amount of space between the 
    // icon and the value text.
    // <p>
    // <b>NOTE:</b> In RTL mode, the valueIconRightPadding is applied to the <em>left</em> of
    // the value icon.
    // @see FormItem.valueIcons
    // @visibility external
    // @group valueIcons
    //<
    valueIconRightPadding:3,

    //> @method formItem.valueIconClick()
    // Notification method fires when the user clicks a +link{valueIcons,value icon} for
    // this item.
    // @param form (DynamicForm) the form containing this item
    // @param item (FormItem) the FormItem containing the valueIcon
    // @param value (Any) the current value of the item.
    // @return (boolean) Return false to suppress standard click handling for the item.
    // @visibility external
    //<
    valueIconClick : function () {},

    //> @attr formItem.imageURLPrefix (String : null : IRWA)
    // Prefix to apply to the beginning of any +link{FormItem.valueIcons} when determining the
    // URL for the image.
    // Will not be applied if the <code>valueIcon</code> URL is absolute.
    // @group valueIcons
    // @visibility external
    //<

    //> @attr formItem.imageURLSuffix (String : null : IRWA)
    // Suffix to apply to the end of any +link{FormItem.valueIcons} when determining the URL for
    // the image. A common usage would be to specify a suffix of <code>".gif"</code> in which
    // case the <code>valueIcons</code> property would map values to the names of images without
    // the <code>".gif"</code> extension.
    // @group valueIcons
    // @visibility external
    //<
            
    // Internal
    // ---------------------------------------------------------------------------------------

    //> @attr formItem.form     (DynamicForm : null : R)
    // A Read-Only pointer to this formItem's DynamicForm widget.
    // @visibility external
    //<
    // Handles values for the form item.  Also handles writing the item's HTML by default.
    
    //> @attr formItem.containerWidget  (Canvas : null : RA)
    // A Read-Only pointer to the SmartClient canvas that holds this form item. In most cases this
    // will be the +link{formItem.form,DynamicForm} containing the item but in some cases
    // editable components handle writing out form items directly. An example of this
    // is +link{group:editing,Grid Editing} - when a listGrid shows per-field editors, the
    // <code>containerWidget</code> for each item will be the listGrid body.
    // <P>
    // Note that even if the <code>containerWidget</code> is not a DynamicForm, a DynamicForm
    // will still exist for the item (available as +link{formItem.form}), allowing access
    // to standard APIs such as +link{dynamicForm.getValues()}
    // @visibility external
    //<
    
    
    
    //> @method formItem.isInGrid() 
    // Returns true if this item's +link{containerWidget,containerWidget} is a 
    // +link{class:GridRenderer} or GridRenderer subclass
    //
    // @return (Boolean) whether the item's container is a GridRenderer (and thus ultimately 
    //                   a ListGrid)
    // @visibility external
    //<
    isInGrid : function () {
        
        return this._inGrid ? true : isc.isA.GridRenderer(this.containerWidget);
    },
    
    //> @method formItem.getListGrid() 
    // If this item is being used to edit cells in a ListGrid (see +link{formItem.isInGrid()}), 
    // this method returns the grid in question.
    //
    // @return (ListGrid) For listGrid edit items, the listGrid containing the item. Will
    //   return null for items that are edit items of a listGrid.
    // @visibility external
    //<
    // This helper is useful as otherwise you'd need to pick up the ListGrid from the
    // parent grid renderer (which may not be a direct child of the ListGrid if there
    // are frozen fields).
    
    getListGrid : function () {
        return this.isInGrid() ? this.form && this.form.grid : null;
    },
    
    //> @method formItem.getGridRowNum() 
    // If this formItem is part of a +link{class:ListGrid}'s 
    // +link{listGrid.canEdit,inline edit form}, returns the number of the row currently being
    // edited.  If the formItem is not part of a ListGrid inline edit for any reason, this 
    // method returns null.  Reasons for a formItem not being part of an inline edit include<ul>
    // <li>The item is part of an ordinary DynamicForm, not an inline edit form</li>
    // <li>There is no row in the grid currently being edited</li>
    // <li>A row is being edited, but this formItem is not currently visible and is being 
    // excluded because of horizontal incremental rendering (where SmartClient avoids drawing
    // grid columns that would not be visible without scrolling)</li>
    // </ul>
    //
    // @return (Integer) The grid row number being edited or null, as described above
    // @visibility external
    //<
    getGridRowNum : function () {
        return this.rowNum;
    },
    
    //> @method formItem.getGridColNum() 
    // If this formItem is part of a +link{class:ListGrid}'s 
    // +link{listGrid.canEdit,inline edit form}, returns the number of the grid column this 
    // formItem is responsible for editing, but <b>only</b> if a row is currently being
    // edited.  If the formItem is not part of a ListGrid inline edit for any reason, this 
    // method returns null.  Reasons for a formItem not being part of an inline edit include<ul>
    // <li>The item is part of an ordinary DynamicForm, not an inline edit form</li>
    // <li>There is no row in the grid currently being edited</li>
    // <li>A row is being edited, but this formItem is not currently visible and is being 
    // excluded because of horizontal incremental rendering (where SmartClient avoids drawing
    // grid columns that would not be visible without scrolling)</li>
    // </ul>
    //
    // @return (Integer) The grid column number being edited by this formItem, or null, as 
    //                   described above
    // @visibility external
    //<
    getGridColNum : function () {
        return this.colNum;
    },

    // Helper to get the top level ancestor of our containerWidget
    
    getTopLevelCanvas : function () {
        return this.containerWidget ? this.containerWidget.getTopLevelCanvas() : null;
    },


    // RelationItem
    // ---------------------------------------------------------------------------------------
    
    //> @attr formItem.dataSource (DataSource | String : null : [IRWA])
    //
    // If this FormItem represents a foreignKey relationship into the dataSource of the form
    // containing this item, specify it here.
    //
    //  @visibility experimental
    //<


    // Picker Icon
    // -----------------------------------------------------------------------------------------

    //> @attr formItem.showPickerIcon (Boolean : null : IRW)
    // Should we show a special 'picker' +link{FormItemIcon,icon} for this form item? Picker
    // icons are customizable via +link{formItem.pickerIconProperties,pickerIconProperties}. By default
    // they will be rendered inside the form item's +link{formItem.controlStyle,"control box"}
    // area. By default clicking the pickerIcon will call +link{FormItem.showPicker()}.
    //
    // @group pickerIcon
    // @visibility external
    //<
    

    //> @attr formItem.showFocusedPickerIcon (Boolean : false : [IRW])
    // If +link{FormItem.showPickerIcon} is true for this item, should the picker icon show
    // a focused image when the form item has focus?
    // @group pickerIcon
    // @visibility external
    //<
    showFocusedPickerIcon:false,

    // We draw the icon into an exactly sized table cell - don't draw with any margin
    
    pickerIconHSpace:0,

    //> @attr formItem.pickerIconDefaults (FormItemIcon Properties : ... : IRWA)
    // Block of default properties to apply to the pickerIcon for this widget.
    // Intended for class-level customization: To modify this value we recommend using
    // +link{Class.changeDefaults()} rather than directly assigning a value to the property.
    // @group pickerIcon
    // @visibility external
    //<
    pickerIconDefaults: {
    },

    //> @attr formItem.pickerIconProperties (FormItemIcon Properties : null : IRWA)
    // If +link{showPickerIcon,showPickerIcon} is true for this item, this block of properties will
    // be applied to the pickerIcon. Allows for advanced customization of this icon.
    // @group pickerIcon
    // @visibility external
    //<

    //> @attr formItem.pickerIconName (Identifier : "picker" : IRA)
    // If +link{showPickerIcon,showPickerIcon} is true, this attribute specifies the
    // +link{formItemIcon.name} applied to the picker icon
    // @group pickerIcon
    // @visibility external
    //<
    pickerIconName:"picker",

    //> @attr formItem.pickerIconSrc (SCImgURL : "" : IRWA)
    // If +link{showPickerIcon,showPickerIcon} is true for this item, this property governs the
    // +link{FormItemIcon.src,src} of the picker icon image to be displayed.
    // <P>
    // +link{group:skinning,Spriting} can be used for this image, by setting this property to
    // a +link{type:SCSpriteConfig} formatted string.
    //
    // @group pickerIcon
    // @visibility external
    //<
    pickerIconSrc:"",

    //> @attr formItem.pickerIconWidth (int : null : IRWA)
    // If +link{showPickerIcon,showPickerIcon} is true for this item, this property governs the
    // size of the picker icon. If unset, the picker icon will be sized as a square to fit in the
    // available height for the icon.
    // <p>
    // Note that if spriting is being used, and the image to be displayed is specified 
    // using css properties such as <code>background-image</code>, <code>background-size</code>,
    // changing this value may result in an unexpected appearance as the image will not
    // scale.<br>
    // Scaleable spriting can be achieved using the +link{SCSpriteConfig} format.
    // See the section on spriting in the +link{group:skinning,skinning overview} for 
    // further information.
    // @group pickerIcon
    // @visibility external
    //<

    //> @attr formItem.pickerIconHeight (int : null : IRWA)
    // If +link{showPickerIcon,showPickerIcon} is true for this item, this property governs the
    // size of the picker icon. If unset, the picker icon will be sized as a square to fit in the
    // available height for the icon.
    // <p>
    // Note that if spriting is being used, and the image to be displayed is specified 
    // using css properties such as <code>background-image</code>, <code>background-size</code>,
    // changing this value may result in an unexpected appearance as the image will not
    // scale.<br>
    // Scaleable spriting can be achieved using the +link{SCSpriteConfig} format.
    // See the section on spriting in the +link{group:skinning,skinning overview} for 
    // further information.
    //
    // @group pickerIcon
    // @visibility external
    //<

    //> @attr formItem.pickerIconPrompt (HTMLString : null : IR)
    // Prompt to show when the user hovers the mouse over the picker icon.
    // @group pickerIcon
    // @group i18nMessages
    // @visibility external
    //<

    //> @type PickerIconName
    // Standard pickers
    // @value "clear" Picker icon to clear a field value.
    // @value "search" Picker icon to start a search.
    // @value "refresh" Picker icon to refresh a value.
    // @value "date" Picker icon for date value.
    // @value "comboBox" Picker icon for a general combobox.
    //
    // @visibility external
    //<

    // Picker Widget (pop-up launched by picker icon)
    // -----------------------------------------------------------------------------------------

    //> @attr formItem.picker (AutoChild Canvas : null : [IRW])
    // The component that will be displayed when +link{showPicker()} is called due to a click
    // on the +link{showPickerIcon,picker icon}.
    // <P>
    // Can be specified directly as a Canvas, or created automatically via the
    // +link{type:AutoChild} pattern. The default autoChild configuration for the picker is 
    // a Canvas with backgroundColor set and no other modifications.
    // <P>
    // Note that the picker is not automatically destroyed with the FormItem that uses it, in
    // order to allow recycling of picker components.  To destroy a single-use picker, override
    // +link{Canvas.destroy()}.
    //
    // @visibility external
    //<
    
    pickerDefaults:{
        backgroundColor:"lightgray"
    },

    //> @attr formItem.pickerConstructor (SCClassName : null : [IRW])
    // Class name of the picker to be created.
    //
    // @visibility external
    //<
    
    //> @attr formItem.pickerProperties (Canvas Properties : {} : [IRW])
    // Default properties for the picker.
    //
    // @visibility external
    //<
    

    // Validation
    // -----------------------------------------------------------------------------------------

    //> @attr formItem.validators     (Array of Validator : null : IR)
    // Validators for this form item.  
    // <P>
    // <b>Note:</b> these validators will only be run on the client; to
    // do real client-server validation, validators must be specified via
    // +link{dataSourceField.validators}.
    // @visibility external
    //<

    //> @attr formItem.required (Boolean : null : [IR])
    // Whether a non-empty value is required for this field to pass validation.
    // <P>
    // If the user does not fill in the required field, the error message to be shown will
    // be taken from these properties in the following order: +link{FormItem.requiredMessage},
    // +link{DynamicForm.requiredMessage}, +link{DataSource.requiredMessage}, 
    // +link{Validator.requiredField}.
    // <P>
    // <b>Note:</b> if specified on a FormItem, <code>required</code> is only enforced on the
    // client.  <code>required</code> should generally be specified on a
    // +link{class:DataSourceField}.
    //
    // @group validation
    // @visibility external
    // @example formShowAndHide
    //<

    //> @attr   formItem.requiredMessage     (HTMLString : null : [IRW])
    // The required message for required field errors.
    // @group validation
    // @visibility external
    //<

    //> @attr formItem.requiredWhen (Criteria : null : IR)
    // Criteria to be evaluated to determine whether this FormItem should be +link{required,required}.
    // <p>
    // Criteria are evaluated against the +link{dynamicForm.getValues,form's current values} as well as 
    // the current +link{canvas.ruleScope,rule context}.  Criteria are re-evaluated every time
    // form values or the rule context changes, whether by end user action or by programmatic calls.
    // <P>
    // A basic criteria uses textMatchStyle:"exact". When specified in
    // +link{group:componentXML,Component XML} this property allows
    // +link{group:xmlCriteriaShorthand,shorthand formats} for defining criteria.
    // <p>
    // Note: A FormItem using requiredWhen must have a +link{name} defined.
    // @group ruleCriteria
    // @group validation
    // @visibility external
    //<
    
    
    // Status
    // -----------------------------------------------------------------------------------------
    
    //> @attr formItem.visible (Boolean : true : IRW)
    // Whether this item is currently visible.
    // <P>
    // <code>visible</code> can only be set on creation.  After creation, use
    // +link{formItem.show()} and +link{formItem.hide()} to manipulate visibility.
    //
    // @group appearance
    // @visibility external
    //<
    visible:true,

    //> @attr formItem.visibleWhen (AdvancedCriteria : null : IR)
    // Criteria to be evaluated to determine whether this FormItem should be visible.
    // <p>
    // Criteria are evaluated against the +link{dynamicForm.getValues,form's current values} as well as 
    // the current +link{canvas.ruleScope,rule context}.  Criteria are re-evaluated every time
    // form values or the rule context changes, whether by end user action or by programmatic calls.
    // <p>
    // If both +link{showIf} and <code>visibleWhen</code> are specified, <code>visibleWhen</code> is
    // ignored.
    // <P>
    // A basic criteria uses textMatchStyle:"exact". When specified in
    // +link{group:componentXML,Component XML} this property allows
    // +link{group:xmlCriteriaShorthand,shorthand formats} for defining criteria.
    // <p>
    // Note: A FormItem using visibleWhen must have a +link{name} defined. +link{shouldSaveValue} can
    // be set to <code>false</code> to prevent the field from storing its value
    // into the form's values.
    // @group ruleCriteria
    // @group appearance
    // @visibility external
    //<

    //>	@attr	formItem.alwaysTakeSpace    (boolean : false : IRW)
    // If this form item is not visible, should they form it is contained in re-layout to
    // take advantage of the additional space, or should it continue to flow as if the
    // item were visible.  Set to true to have the form continue to flow around the item
    // even if it's not written out.
    //
    // @group appearance
    // @visibility internal
    //<

    //> @attr formItem.canEdit  (boolean : null : IRW)
    // Is this form item editable (canEdit:true) or read-only (canEdit:false)? Setting the
    // form item to non-editable causes it to render as read-only. Can be updated at runtime via
    // the +link{formItem.setCanEdit(),setCanEdit()} method.
    // <P>
    // Read-only appearance may be specified via +link{formItem.readOnlyDisplay}.
    // The default setting for this value (<code>"readOnly"</code>) differs from
    // the disabled state in that the form item is not rendered with disabled styling and
    // most form items will allow copying of the contents while read-only but do not while
    // disabled.
    // <P>
    // Note that for forms bound to a +link{DataSource}, if this property is not explicitly
    // set at the item level, its default value will match the
    // +link{DynamicForm.canEditFieldAttribute} on the associated dataSource field.
    // <P>
    // Developers should also be aware that the +link{readOnlyDisplay} attribute is
    // unrelated to the +link{dataSourceField.readOnlyEditorType} attribute. When a
    // DynamicForm is first bound to a dataSource, for
    // +link{dataSourceField.canEdit,canEdit:false} DataSourceFields,
    // +link{dataSourceField.readOnlyEditorType} will determine what +link{FormItemType}
    // should be created for the field. Once created, a FormItem's type can not be changed.
    // Setting +link{formItem.canEdit} at runtime will simply change the appearance
    // of the item to allow or disallow editing of the item.
    //
    // <smartgwt><P>Note that this property may validly be <code>null</code> as a distinct state
    // from <code>false</code>.  See +link{dynamicForm.fieldIsEditable()} for an API that will
    // always return <code>true</code> or <code>false</code> and give a definitive answer as to
    // whether editing is possible.</smartgwt>
    //
    // @setter setCanEdit()
    // @group readOnly
    // @see FormItem.setCanEdit()
    // @see DynamicForm.setCanEdit()
    // @visibility external
    //<
    //canEdit: null,

    //> @attr formItem.readOnlyDisplay (ReadOnlyDisplayAppearance : null : IRW)
    // If this item is +link{FormItem.getCanEdit(),read-only}, how should this item be displayed
    // to the user? If set, overrides the form-level +link{DynamicForm.readOnlyDisplay} default.
    // @see DynamicForm.readOnlyDisplay
    // @group appearance
    // @group readOnly
    // @visibility external
    //<
    //readOnlyDisplay: null,

    //> @attr formItem.readOnlyTextBoxStyle (FormItemBaseStyle : null : IRW)
    // Base text box style to apply when this item is +link{FormItem.getCanEdit(),read-only} and
    // is using +link{FormItem.readOnlyDisplay,readOnlyDisplay}
    // <smartclient>"static".</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.ReadOnlyDisplayAppearance#STATIC}.</smartgwt>
    // If set, overrides the form-level +link{DynamicForm.readOnlyTextBoxStyle} default.
    // @see DynamicForm.readOnlyTextBoxStyle
    // @visibility external
    //<
    //readOnlyTextBoxStyle: null,

    //> @attr formItem.clipStaticValue (Boolean : null : IR)
    // If this item is +link{FormItem.getCanEdit(),read-only} and is using
    // +link{FormItem.readOnlyDisplay,readOnlyDisplay}
    // <smartclient>"static",</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.ReadOnlyDisplayAppearance#STATIC},</smartgwt>
    // should the item value be clipped if it overflows the specified size of the item?
    // If set, overrides the form-level +link{DynamicForm.clipStaticValue} default.
    // @see DynamicForm.clipStaticValue
    // @visibility external
    //<
    //clipStaticValue: null,

    //> @attr formItem.readOnlyWhen (AdvancedCriteria : null : IR)
    // Criteria to be evaluated to determine whether this FormItem should be made
    // +link{setCanEdit,read-only}.  Appearance when read-only is determined by
    // +link{readOnlyDisplay}.
    // <p>
    // Criteria are evaluated against the +link{dynamicForm.getValues,form's current values} as well as 
    // the current +link{canvas.ruleScope,rule context}.  Criteria are re-evaluated every time
    // form values or the rule context changes, whether by end user action or by programmatic calls.
    // <P>
    // A basic criteria uses textMatchStyle:"exact". When specified in
    // +link{group:componentXML,Component XML} this property allows
    // +link{group:xmlCriteriaShorthand,shorthand formats} for defining criteria.
    // <p>
    // Note: A FormItem using readOnlyWhen must have a +link{name} defined. +link{shouldSaveValue} can
    // be set to <code>false</code> to prevent the field from storing its value
    // into the form's values.
    //
    // @group ruleCriteria
    // @group readOnly
    // @visibility external
    //<

    //>	@attr	formItem.disabled		(Boolean : false : IRW)
    // Whether this item is disabled.  Can be updated at runtime via the <code>setDisabled()</code>
    // method.  Note that if the widget containing this formItem is disabled, the formItem will
    // behave in a disabled manner regardless of the setting of the item.disabled property.
    // <p>
    // Note that not all items can be disabled, and not all browsers show an obvious disabled style
    // for native form elements.
    // @group appearance
    // @setter setDisabled()
    // @see FormItem.setDisabled()
    // @visibility external
    // @example fieldEnableDisable
    //<

    //> @attr formItem.disableIconsOnReadOnly (Boolean : true : IRW)
    // If +link{formItem.canEdit} is set to false, should +link{formItem.icons,icons} be disabled
    // by default?
    // <P>
    // This may also be specified at the icon level. See +link{formItemIcon.disableOnReadOnly}.
    // @group formIcons
    // @visibility external
    //<
    disableIconsOnReadOnly:true,

    // Keyboard handling
    // -----------------------------------------------------------------------------------------
    
    //>@attr formItem.canFocus  (boolean : null : IRA)
    // Is this form item focusable? Setting this property to true on an otherwise
    // non-focusable element such as a +link{StaticTextItem} will cause the item to be
    // included in the page's tab order and respond to keyboard events.
    // @group focus 
    // @visibility external
    //<
    // If not set focusability is determined by whether this item has a data element by default.
    // If set to true, and this item has no data element we write out HTML to allow focus
    // on the item's text-box.
    
    //> @attr formItem.accessKey  (String : null : IRW)
    // If specified this governs the HTML accessKey for the item.
    // <P>
    // This should be set to a character - when a user hits the html accessKey modifier for
    // the browser, plus this character, focus will be given to the item.
    // The accessKey modifier can vary by browser and platform. 
    // <P>
    // The following list of default behavior is for reference only, developers should also
    // consult browser documentation for additional information.
    // <ul>
    // <li><b>Internet Explorer (all platforms)</b>: <code>Alt</code> + <i>accessKey</i></li>
    // <li><b>Mozilla Firefox (Windows, Unix)</b>: <code>Alt+Shift</code> + <i>accessKey</i></li>
    // <li><b>Mozilla Firefox (Mac)</b>: <code>Ctrl+Opt</code> + <i>accessKey</i></li>
    // <li><b>Chrome and Safari (Windows, Unix)</b>:  <code>Alt</code> + <i>accessKey</i></li>
    // <li><b>Chrome and Safari (Mac)</b>:  <code>Ctrl+Opt</code> + <i>accessKey</i></li>
    // </ul>
    //
    // @group focus
    // @visibility external
    //<
    
    accessKey:null,                                        
    
    //> @attr formItem.tabIndex (Integer : null : IRW)
    // TabIndex for the form item within the form, which controls the order in which controls
    // are visited when the user hits the tab or shift-tab keys to navigate between items. 
    // <P>
    // tabIndex is automatically assigned as the order that items appear in the
    // +link{dynamicForm.items} list.
    // <P>
    // To specify the tabindex of an item within the page as a whole (not just this form), use
    // +link{globalTabIndex} instead.
    //
    //  @visibility external
    // @setter formItem.setTabIndex()
    //  @group focus
    //<                          
    //tabIndex:null,

    //> @attr formItem.globalTabIndex (Integer : null : IRWA)
    // TabIndex for the form item within the page. Takes precedence over any local tab index
    // specified as +link{tabIndex,item.tabIndex}.
    // <P>
    // Use of this API is <b>extremely</b> advanced and essentially implies taking over
    // management of tab index assignment for all components on the page.
    //
    // @group focus
    // @visibility external
    //<                          
    //globalTabIndex:null,
    
    //> @attr   formItem.selectOnFocus  (boolean : null : IRW)
    // Allows the +link{dynamicForm.selectOnFocus,selectOnFocus} behavior to be configured on a
    // per-FormItem basis.  Normally all items in a form default to the value of
    // +link{dynamicForm.selectOnFocus}.
    //
    // @group focus
    // @visibility external
    //<
    // Exposed on TextItem and TextAreaItem directly since it won't apply to other items.

    //> @attr   formItem.selectOnClick  (boolean : null : IRW)
    // Allows the +link{dynamicForm.selectOnClick,selectOnClick} behavior to be configured on a
    // per-FormItem basis.  Normally all items in a form default to the value of
    // +link{dynamicForm.selectOnClick}.
    //
    // @group focus
    // @visibility external
    //<
    // Exposed on TextItem and TextAreaItem directly since it won't apply to other items.
    
    
    //> @attr formItem.changeOnKeypress (Boolean : true : IRW)
    // Should this form item fire its +link{formItem.change(),change} handler (and store its
    // value in the form) on every keypress? Set to <code>false</code> to suppress the 'change'
    // handler firing (and the value stored) on every keypress.
    // <p>
    // Note: If <code>false</code>, the value returned by +link{formItem.getValue(),getValue}
    // will not reflect the value displayed in the form item element as long as focus is in
    // the form item element.
    // 
    // @group  eventHandling, values
	// @visibility external
    //<    
    changeOnKeypress:true,
    
    // maintainSelectionOnTransform
    // Internal, but non obfuscated property.
    // Ensure selection is maintained if:
    // - the value is reverted due to a change handler returning false during typing
    // - the value is modified during typing, but either the value is unchanged except for
    //   case shifting, or the entire value was selected before typing.
    // If this causes a performance hit in any cases, we can disable it.
    maintainSelectionOnTransform:true,
    
    
    //> @attr   formItem.dirtyOnKeyDown (boolean : true : RW)
    //  Should this form item get marked as dirty on every keyDown?
    //  @group  eventHandling, values
    //<    
    dirtyOnKeyDown:true, 

    // Titles
    // --------------------------------------------------------------------------------------------
    //> @attr formItem.showTitle (Boolean : true : IRW)
    // Should we show a title cell for this formItem?
    // <p>
    // Note: the default value of this attribute is overridden by some subclasses.
    //
    // @group title
    // @visibility external
    //<
    showTitle:true,
    
    //> @attr formItem.titleOrientation (TitleOrientation : isc.Canvas.LEFT : IRW)
    // On which side of this item should the title be placed.  +link{type:TitleOrientation}
    // lists valid options.
    // <P>
    // Note that titles on the left or right take up a cell in tabular
    // +link{group:formLayout,form layouts}, but titles on top do not.
    // 
    // @group title
    // @see DynamicForm.titleOrientation
    // @visibility external
    //<
// titleOrientation:isc.Canvas.LEFT, // dynamically defaulted in DynamicForm

    //> @attr formItem.titleAlign (Alignment : null : IRW)
    // Alignment of this item's title in its cell.
    // <p>
    // If null, dynamically set according to text direction.
    // @group title
    // @visibility external
    //<

    //> @attr formItem.titleVAlign (VerticalAlignment : isc.Canvas.CENTER : IRW)
    // Vertical alignment of this item's title in its cell. Only applies when
    // +link{formItem.titleOrientation} is <code>"left"</code> or <code>"right"</code>.
    // @group title
    // @visibility external
    //<
//    titleVAlign:isc.Canvas.CENTER, // dynamically defaulted in getTitleVAlign

    //> @attr formItem.clipTitle (boolean : null : [IRW])
    // If the title for this form item is showing, and is too large for the available space
    // should the title be clipped?
    // <p>
    // Null by default - if set to true or false, overrides +link{DynamicForm.clipItemTitles}.
    // @group title
    // @visibility external
    //<
    clipTitle:null,

    //> @attr formItem.wrapTitle (boolean : null : [IRW])
    // If specified determines whether this items title should wrap.
    // Overrides +link{DynamicForm.wrapItemTitles,wrapItemTitles} at the DynamicForm level.
    // @group title
    // @visibility external
    //<
//    wrapTitle:null,

    // Change handling
    // --------------------------------------------------------------------------------------------

    //> @attr formItem.redrawOnChange (Boolean : false : IRW)
    // If true, this item will cause the entire form to be redrawn
    // when the item's "elementChanged" event is done firing
    // @group changeHandling
    // @visibility external
    //<

    //> @attr formItem.validateOnChange (Boolean : false : IRW)
    // If true, form items will be validated when each item's "change" handler is fired
    // as well as when the entire form is submitted or validated.
    // <p>
    // Note that this property can also be set at the form level or on each validator;
    // If true at the form or field level, validators not explicitly set with
    // <code>validateOnChange:false</code> will be fired on change - displaying errors and
    // rejecting the change on validation failure.
    // @group changeHandling
    // @visibility external
    // @see DynamicForm.validateOnChange
    //<
    
    
    //> @attr formItem.validateOnExit (Boolean : false : IRW)
    // If true, form items will be validated when each item's "editorExit" handler is fired
    // as well as when the entire form is submitted or validated.
    // <p>
    // Note that this property can also be set at the form level.
    // If true at either level the validator will be fired on editorExit.
    // @visibility external
    // @see dynamicForm.validateOnExit
    //<

    //> @attr formItem.stopOnError (boolean : null : IR)
    // Indicates that if validation fails, the user should not be allowed to exit
    // the field - focus will be forced back into the field until the error is corrected.
    // <p>
    // This property defaults to +link{DynamicForm.stopOnError} if unset.
    // <p>
    // Enabling this property also implies +link{FormItem.validateOnExit} is automatically
    // enabled. If there are server-based validators on this item, setting this property
    // also implies that +link{FormItem.synchronousValidation} is forced on.
    // 
    // @visibility external
    //<

    //> @attr formItem.rejectInvalidValueOnChange (Boolean : false : IRWA)
    // If validateOnChange is true, and validation fails for this item on change, with no suggested
    // value, should we revert to the previous value, or continue to display the bad value entered
    // by the user. May be set at the item or form level.
    // @visibility external
    //<
    // Introduced for back-compat: pre 7.0beta2 this was the default behavior, so enable this flag
    // at the item or form level if required for backcompat.
    //rejectInvalidValueOnChange:null,
    

    //>	@attr formItem.changeOnBlur (boolean : false : IRWA)
    // If true, this item will fire it's elementChanged message on BLUR in a field (eg: when the
    // user tabs through without making changes as well as when they actually change something), if
    // false, the message will only fire when the field is actually changed.  This is useful for
    // fields that do validation/value setting on change (such as the TimeItem), to work around a
    // bug in IE where the change event doesn't always fire correctly when you manually set the
    // value of the field in its ONCHANGE handler.  Note that it is not recommended that you set
    // both changeOnBlur==true AND redrawOnChange==true, as this will cause the form to redraw every
    // time you tab through that item.
    // @group changeHandling
    //<
    

    //> @attr  formItem.synchronousValidation (boolean : null : IR)
    // If enabled, whenever validation is triggered and a request to the server is required,
    // user interactivity will be blocked until the request returns. Can be set for the entire
    // form or individual FormItems.
    // <p>
    // If false, the form will try to avoid blocking user interaction until it is strictly
    // required. That is until the user attempts to use a FormItem whose state could be
    // affected by a server request that has not yet returned.
    //
    // @visibility external
    //<

    // Size and Layout
    // --------------------------------------------------------------------------------------------
    //> @attr formItem.width (int | String : "*" : IRW)
    // Width of the FormItem.  Can be either a number indicating a fixed width in pixels, or
    // "*" indicating the FormItem fills the space allocated to it's column (or columns, for a
    // +link{colSpan,column spanning} item).  You may also use "100%" as a synonym for "*", but
    // other percentages are not supported.
    // <P>
    // Note that for "absolute" item layout rather than the default "table" layout, the rules
    // for specifying the width are slightly different.  All percent sizes are allowed, but not
    // "*".  See +link{dynamicForm.itemLayout} for further details.
    // <P>
    // <smartgwt>If width is specified as a String, getWidth() will return -1.  Use 
    // +sgwtLink{getWidthAsString()} in this case.<p></smartgwt>
    // See the +link{group:formLayout} overview for details.
    //
    // @group formLayout
    // @see linearWidth
    // @see group:formLayout
    // @see formItem.height
    // @see dynamicForm.itemLayout
    // @example columnSpanning
    // @visibility external
    //<
    width:"*",

    //> @attr formItem.linearWidth (int | String : null: IRW)
    // Specifies a width for an item in +link{dynamicForm.linearMode,linearMode}, overriding
    // the default width of "*" in that mode.
    // @see width
    // @group formLayout
    // @visibility external
    //<

    //> @attr formItem.height (int | String : 20 : IRW)
    // Height of the FormItem.  Can be either a number indicating a fixed height in pixels, a
    // percentage indicating a percentage of the overall form's height, or "*" indicating take
    // whatever remaining space is available. See the +link{group:formLayout} overview for details.
    // <p>
    // <smartgwt>If height is specified as a String, getHeight() will return -1.  Use 
    // +sgwtLink{getHeightAsString()} in this case.<p></smartgwt>
    // For form items having a +link{showPickerIcon,picker icon} (e.g. +link{SelectItem},
    // +link{ComboBoxItem}) and +link{SpinnerItem}s, if there is no explicit 
    // +link{formItem.pickerIconHeight}, the pickerIcon will be sized to match the available
    // space based on the specified item height.<br>
    // Note that if spriting is being used, and the image to be displayed in these icons
    // is specified 
    // using css properties such as <code>background-image</code>, <code>background-size</code>,
    // changing this value may result in an unexpected appearance as the image will not
    // scale.<br>
    // Scaleable spriting can be achieved using the +link{SCSpriteConfig} format.
    // See the section on spriting in the +link{group:skinning,skinning overview} for 
    // further information.<br>
    // Alternatively, the +link{pickerIconStyle,pickerIconStyle} could be changed to a
    // custom CSS style name, and in the case of +link{SpinnerItem}s, 
    // the +link{FormItemIcon.baseStyle,baseStyle} and
    // +link{FormItemIcon.src,src} of the +link{SpinnerItem.increaseIcon}
    // and +link{SpinnerItem.decreaseIcon} AutoChildren could be customized.
    // <p>
    // Note that when FormItem is rendered as read-only with <code>readOnlyDisplay</code> as "static"
    // the property +link{formItem.staticHeight} is used instead.
    //
    // @group formLayout
    // @see group:formLayout
    // @see formItem.width
    // @see dynamicForm.itemLayout
    // @example formLayoutFilling
    // @visibility external
    //<
    
    height:20,

    //> @attr formItem.staticHeight (Integer : null : IR)
    // Height of the FormItem when <code>canEdit</code> is false and
    // <code>readOnlyDisplay</code> is "static". The normal +link{height} is used
    // if this property is not set.
    //
    // @group formLayout
    // @see height
    // @visibility external
    //<

    //> @attr formItem.cellHeight (number : null : IRW)
    // If specified, this property will govern the height of the cell in which this form
    // item is rendered.
    // Will not apply when the containing DynamicForm sets <code>itemLayout:"absolute"</code>.
    // @group formItemStyling
    // @visibility external
    //<


    //> @attr formItem.titleColSpan  (number : 1 : IRW)
    // Number of columns that this item's title spans.  
    // <P>
    // This setting only applies for items that are showing a title and whose
    // +link{titleOrientation} is either "left" or "right".
    //
    // @group formLayout
    // @visibility external
    //<
    titleColSpan:1,

    //> @attr formItem.colSpan (int | String : 1 : IRW)
    // Number of columns that this item spans.  
    // <P>
    // The <code>colSpan</code> setting does not include the title shown for items with
    // +link{showTitle}:true, so the effective <code>colSpan</code> is one higher than this
    // setting for items that are showing a title and whose +link{titleOrientation} is either
    // "left" or "right".
    //
    // @see linearColSpan
    // @group formLayout
    // @visibility external
    //<
    colSpan:1,

    //> @attr formItem.linearColSpan (int | String : null: IRW)
    // Specifies a column span for an item in +link{dynamicForm.linearMode,linearMode},
    // overriding the default value of "*" in that mode.
    // @see colSpan
    // @group formLayout
    // @visibility external
    //<

    //> @attr formItem.rowSpan (number : 1 : IRW)
    // Number of rows that this item spans
    // @group formLayout
    // @visibility external
    //<
    rowSpan:1,

    //> @attr formItem.startRow (Boolean : false : IRW)
    // Whether this item should always start a new row in the form layout.
    // @see linearStartRow
    // @group formLayout
    // @visibility external
    //<

    //> @attr formItem.endRow (Boolean : false : IRW)
    // Whether this item should end the row it's in in the form layout
    // @see linearEndRow
    // @group formLayout
    // @visibility external
    //<

    //> @attr formItem.linearStartRow (int | String : null: IRW)
    // Specifies +link{startRow} for an item in +link{dynamicForm.linearMode,linearMode},
    // overriding the default of <code>false</code> in that mode.
    // @group formLayout
    // @visibility external
    //<

    //> @attr formItem.linearEndRow (int | String : null: IRW)
    // Specifies +link{endRow} for an item in +link{dynamicForm.linearMode,linearMode},
    // overriding the default of <code>true</code> in that mode.
    // @group formLayout
    // @visibility external
    //<

    // The align property is used by the dynamic form to align the item as a whole (control table
    // and all) in its cell.
    // In addition to this we support textAlign to align the contents within the text-box
     

    //> @attr formItem.align (Alignment : null : IRW)
    // Alignment of this item in its cell. Note that the alignment of text / content within this
    // item is controlled separately via +link{formItem.textAlign} (typically <code>textAlign</code>
    // applies to items showing a "textBox", such as a +link{TextItem} or +link{SelectItem},
    // as well as text-only form item types such as +link{StaticTextItem} and +link{HeaderItem}).
    // If +link{FormItem.applyAlignToText,applyAlignToText} is true, then the <code>textAlign</code>
    // setting, if unset, will default to the <code>align</code> setting if set.
    // @see FormItem.applyAlignToText
    // @group appearance
    // @visibility external
    //<

    //> @attr formItem.vAlign (VerticalAlignment : isc.Canvas.CENTER : IRW)
    // Vertical alignment of this item within its cell. This property governs the position
    // of the item's text box within the cell (not the content within the text box).
    // If +link{shouldApplyHeightToTextBox()} is true, for this to have a visible effect,
    // the cell height must exceed the specified height of the item, either due to
    // an explicit +link{cellHeight} specification, or due to the row being expanded
    // by another taller item.
    // <P>
    // Has no effect if +link{dynamicForm.itemLayout} is set to <code>"absolute"</code> for the
    // form.
    //
    // @getter formItem.getVAlign()
    // @group title
    // @visibility external
    //<
    //> @method formItem.getVAlign()
    // Returns the vertical-alignment for this item within its cell.  By default, when
    // +link{formItem.titleOrientation, titleOrientation} is "top", this method will 
    // return "top", so that items of varying height are top-aligned, beneath their titles.
    // @return (VerticalAlignment) vertical alignment for this item
    // @visibility external
    //<    
    getVAlign : function () {
        if (this.form && this.form.getTitleOrientation(this) == "top") return "top";
        return this.vAlign;
    },
    //> @attr formItem.textAlign (Alignment : null : IRW)
    // Alignment of the text / content within this form item. Note that +link{formItem.align} may
    // be used to control alignment of the entire form item within its cell. <code>textAlign</code>
    // does not apply to all form item types; typically it applies only to items showing a "textBox",
    // such as a +link{TextItem} or +link{SelectItem}, as well as text-only form item types
    // such as +link{StaticTextItem} and +link{HeaderItem}.
    // <p>
    // If +link{FormItem.applyAlignToText,applyAlignToText} is true, then <code>textAlign</code>
    // will default to the <code>align</code> setting if set. Otherwise, if this item has
    // +link{FormItem.icons,icons}, then <code>textAlign</code> will default to
    // <smartclient>"left"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.Alignment#LEFT}</smartgwt>
    // <smartclient>("right"</smartclient>
    // <smartgwt>({@link com.smartgwt.client.types.Alignment#RIGHT}</smartgwt>
    // in +link{isc.Page.isRTL,RTL mode}).
    // @see FormItem.applyAlignToText
    // @group appearance
    // @visibility external
    //<

    //> @attr formItem.applyAlignToText (boolean : false : IRA)
    // If the +link{FormItem.textAlign,textAlign} is unset, should the +link{FormItem.align,align}
    // setting, if set, be used for this item's <code>textAlign</code>?
    // <p>
    // <code>applyAlignToText</code> defaults to false for most form item types. It defaults
    // to true for +link{StaticTextItem} and +link{HeaderItem}, which are text-based form item
    // types that do not have a natural distinction between the item and its cell.
    // @group appearance
    // @visibility external
    //<
    applyAlignToText: false,

    //> @attr formItem.left (int : 0 : IRWA)
    // Left coordinate of this item in pixels.  Applies only when the containing DynamicForm
    // sets <code>itemLayout:"absolute"</code>.
    // @visibility absForm
    //<
    left: 0,

    //> @attr formItem.top (int : 0 : IRWA)
    // Top coordinate of this item in pixels.  Applies only when the containing DynamicForm
    // sets <code>itemLayout:"absolute"</code>.
    // @visibility absForm
    //<
    top: 0,

    //> @attr formItem.wrap (boolean : null : IRW)
    // If true, item contents can wrap. If false, all the contents should appear on a single line.
    // @visibility internal
    //<

    //> @attr formItem.clipValue  (Boolean : null : IRW)
    // If true, text that exceeds the specified size of the form item will be clipped.
    // @visibility internal
    //<
    

    //> @attr formItem.autoCompleteKeywords (Array of String : null : IR)
    // Set of autocompletion keywords to be used with the native "autocomplete" attribute, 
    // in accordance with the 
    // +externalLink{https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill,HTML5 Autofill specification}.
    // <p>
    // When autoCompleteKeywords are provided, the +link{formItem.autoComplete} setting is ignored.
    // @group autoComplete
    // @visibility external
    //<
    
    // AutoComplete
    // --------------------------------------------------------------------------------------------
    //> @attr formItem.autoComplete   (AutoComplete : null : IRW)
    // Should this item allow browser auto-completion of its value? 
    // Applies only to items based on native HTML form elements (+link{TextItem},
    // +link{PasswordItem}, etc), and will only have a user-visible impact for browsers
    // where native autoComplete behavior is actually supported and enabled via user settings.
    // <P>
    // Alternatively, +link{formItem.autoCompleteKeywords} can be specified, in which case 
    // this setting is ignored.  If <code>autoCompleteKeywords</code> are not provided, and 
    // <code>autoComplete</code> is not set on this FormItem, the value of 
    // +link{dynamicForm.autoComplete} is used.
    // <P>
    // Note that even with this value set to <code>"none"</code>, native browser 
    // auto-completion may occur for log in forms (forms containing username and 
    // +link{PasswordItem,password} fields). This behavior varies by browser, and is
    // a result of an 
    // +externalLink{https://www.google.com/search?q=password+ignores+autocomplete+off,intentional change by some browser developers}
    // to disregard the HTML setting <i>autocomplete=off</i> for password items or
    // log-in forms.
    // <P>
    // In some browsers any form redraw (including a redraw from  a call to 
    // +link{DynamicForm.setValues()}) will re-populate the form with the natively 
    // remembered login credentials. This can make it very difficult to control the
    // values displayed to the user, as a call to 'setValues()' may appear to be ignored.
    // While behavior varies by browser we have specifically
    // observed this behavior in Safari. Moreover in this browser, if the user 
    // asks the browser to remember login credentials for a URL, any form with a password 
    // item and a text item may be auto-filled with the remembered login credentials, 
    // even if the form's configuration and field names differ from those on the
    // login form.
    // <P>
    // If an application has both an initial log in form, and a separate form within
    // the application which makes contains a Password item (a use case might be an
    // interface for a user with manager privileges for modifying other users' passwords),
    // this will cause the second form to autofill with unexpected values.
    // <P>
    // Should this arise, developers can avoid this by making the initial log in 
    // interface into a separate log in page from the main application page.
    // This is often good practice in any case for reasons outlined in the 
    // "Authentication" section of the Quick Start guide.
    //
    // @see dynamicForm.autoComplete
    // @group autoComplete
    // @visibility external
    //<
    // Some discussions of the decision to ignore native autocomplete on login forms:
    // Chrome: https://groups.google.com/a/chromium.org/forum/#!topic/chromium-dev/zhhj7hCip5c
    // and http://www.theregister.co.uk/2014/04/09/chrome_makes_new_password_grab_in_version_34/
    // IE11: http://blogs.msdn.com/b/ieinternals/archive/2009/09/10/troubleshooting-stored-login-problems-in-ie.aspx
    // (Search for "Internet Explorer 11 Update")
    // Mozilla - still respects this setting at least for now: http://blog.gerv.net/2013/10/ie-11-ignoring-autocompleteoff/
    
    //
    // "Smart" autoComplete - third mode where we provide autoComplete options from
    // specified valueMap, etc. not currently exposed
    

    //> @attr formItem.uniqueMatch    (boolean : null : IRW)
    // When +link{formItem.autoComplete} is set to <code>"smart"</code>, 
    // whether to offer only unique matches to the user.
    // <p>
    // If unset, defaults to form.uniqueMatch.
    //
    // @see dynamicForm.uniqueMatch
    // @visibility autoComplete
    //<

    //> @attr formItem.autoCompleteCandidates (Array : null : IRW)
    // When +link{formItem.autoComplete} is set to <code>"smart"</code>, 
    // optional set of candidate completions.
    // <p>
    // If candidates are not specified, the values in the valueMap, if any, will be used, or
    // within a DataBound form, the other values currently present in the loaded portion of the
    // dataset.
    // @visibility autoComplete
    //<

    
    //>@attr    formItem.browserSpellCheck  (boolean : null : IRWA)
    // If this browser supports spell-checking of text editing elements, do we want this
    // enabled for this item? If unset the property will be inherited from the containing form.
    // <P>
    // Notes:<br>
    // - this property only applies to text based items such as TextItem and TextAreaItem.<br>
    // - this property is not supported on all browsers.
    // @see dynamicForm.browserSpellCheck
    // @visibility external
    //<

    // In addition to spell-check Safari on iPhone / iPad supports the following features on
    // text items:
    // - auto capitalizing 
    //>@attr formItem.browserAutoCapitalize (Boolean : null : IRA)
    // @visibility internal
    //<

    // - auto correct
    //>@attr formItem.browserAutoCorrect (Boolean : null : IRA)
    // In Mobile Safari, should automatic correction be offered for text in the item's text box?
    // If <code>null</code>, then Mobile Safari determines automatically whether to enable
    // autocorrect.
    // <p>
    // When enabled, Mobile Safari displays "autocorrect bubbles" to suggest automatic corrections:<br>
    // <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABaCAIAAACNE/xKAAANy0lEQVR4Ae2dB3hV5R3G7d6tdW9wgIoDtQ4cldZRq9Q9invSKlVkqgzZIIgICohKQUCUEBNIghjEhARCCJgACUrYZJA9ySAhi9Nf8vU5z9d7yXhI48017/t8T5573nPOHXB+9z++7yTHOD6VJEmCUJIEoSQJQkmSBKEkCUJJag8ShKGx6b2HBWtoaLTpWLZmR6MQrtxSLA41NNqawOXrdzcFIcORJKnNBIGCsAlJkiCUJEH43sr0xNTidjuSUosdSRKEvh2OJAlCQShJglCSBKEglCRBKEmCUBBKkiCUJEEoCCVJEEqSDyQIJanjQRjzTfrwKR/2fv7VB/sMHvbmB1+s32bvXRAazd41SamRm/aMnv7R/c8OHDTu3aCIeLM3JHrL4PEz7n6yX99hk7+K32XM0DWJnDLns1X288wNjsD8ZMU623x3YSgmb6DjQigJwilzAo/t3P2YYzsxfnjc2fz8+SnnA4Z7wOMvjcCcMGvRcedczgMzfnzCufNDot5ZEPKTE89zzV+fcRH4ccqyqM1sdr36VvuFLr6hF+ZN9z3tOpv3Ff6u06W8+qa9BYKwg0oQQsvPTu7605O6EAAJRxt2ZMPkb8+6BFqmz19mQwh1Pe9+YtHnMWB23zMDcIAHXAeOfYcISTzs8de/Y/Z6tK85q1P3G9lkl9lcuzXtB7/vjPObMy+GPWOCMQ5RVOlox5UgvPKW+8HgtUmzbXP24i8wT72wR8KefBfCzpf1BFFzQOy2DBMzH+k71D0rODIBp8tVt5jNJ/q9zub4mR+78ZZNQ+bi8PXGfGbgGEO7IOygEoQkgSSTvzztwvjdeR5wwhJ4wJUL4QPPDbIPINXEBFfXgUyc48+9wmzOWxppB0YqSbgdNW0e5oAx04153pU3E0thu4NCKAnCsLVJduyyx18e6sOuqXODXAj7j55mH9C9512GUhtpHOpGd5N8lc0tKUVsntbtWmpCslOOue6Oh3HC45LdErGDQigJQlOSXXHTvd4Q3vt0f3bRC3Uh5LE3hEtXb2oMQsadj7+IE7AyztD+7KCxJvr94tQLSHSHTn4fc9yMhR0XQkkQRiTsBgNilDeE197em100P1sDIYEU5+VRb9P14cGHgV9iPvbicB7D//W9HvnR8ecw89GhIZTUmPnV6d0o1VbEfmub65MzmTkAFSYMWwMhz0PNedWtD5Dc0oDduDMHc8bHYRz2VP9ROOzSZL3U0SHsM2S8KcxMI5ThBitDSGsgZNzwt0eZ2wDpa257yDhx27Nw6Mdw8CsTZ3V0CCVBSGfSTBt0u+52ZvyYqzCJ6AU9bmNmr/UQjnhrDiaj38iprnn5n+/BMZG2o0MoCUKTNDL9QHJowDixy5XMK0QnprCr9RCu+nonJoNZftd8Yegkw7nWjkqOILQRYtULq2G0gFuSdBeFJAlCQShJglCSBKEglCRBKEmCUBBKkiCUJD+Q/jSaJPkPhJ9KfqLFixcHBAQEBgYGBweHhISEh4dHRUVt3Lhx69atWVlZ1dXVjv9KEDp+Jelwg2praysrK0tKSnJychISEoKCglauXJmUlITp+ESSIJRqamrS0tKWLl0aFxcnFAWh5Ms4SXYKinv37nUkQSj5MCquXbuWihEmHZ9IEoRSbd3h6JjYoLDwqO350TsKfDU0uEG3KQjj95R8jyGUCIJx8ZuXha8WCT7nsFEI0fceQik2Nnbbtm2O7yV1YAjVqgkLCysqKnL8VIKQ/8J9+dXLE8tnrT4QvKksMf2QI/2ftD2r6tvMqvTCGqeNVVxcHBER4fidBCGV/bRVxZ1eST3h5RR7XDsxY0Fsqdpurdc5r6Xx7/nU3Fyn7RUTE5ORkeH4kQQh0e/2aVmGuuvfyHh+Yd4bK4pe+iT/0lHpxnxybm7ZoTqnLSUImXxn5p2FaU6T4gAO42CncbG2Zs2aNY6/SBBW1Ry+etx+ro+LXk9fkVTuWKqpPTwz8oDh8LE5OU5bShDGGRkOmyTQyGlSoaGhFRUVjl9IEL69qpiL4+xXU3NKjlyujAotNBwu+brMkY5W5zZA+PS83JYAxuOjOMBWcnLyvn37nPYvQZhVXHPm4Po68P3okia6NY98mMMxf5yU4ZofrSsxp2QW18xfV/qvRXmkr3PWlhSV1zrNiXM/aDiXLsXcmJJ/LMgbE1YYkXywru6wicyfJ5W/FlTw7Ee5U1YW84RuWH4v6gAdI96z4yUKV3bllh7h1RfF1e8i5bbNzWmHML2/Vnhj+JXVda6TkHJodtSBgUvyH/937vClhfNiSgqtzxi3t5LjQ7eUO17allnFLje5uGx0fW7Pv1Kzqea6BnlgxqbxW0IgokHKGhqn/UsQBmws48o4b2gal7jTuKDCBENafMY5f1jaKQNStqQd6josDd8d3UelJ+1vpqfKuacPSl2/p7Lz//aBJnxeVFFV99DsHNu8YHiaS92d72bhTP7Cs/++I7sKn6etPtKnoMRlL1WubUI45mkDU3hF1/wmowrzmvH7zWZZZd3AgHwcj8FbWrerwhwTs6sC56whqeVeNfMzvIT17XbTlEw2X19W6DQpA5vLYeNm82vZuAHKaf8ShFz3XBm3Ts10mlRaQbW5/hauL3VBYpNuKmAQxHbnVAfGl1FVYt49I7tZCE/sn3LG4FSOZDokPqWy36f55vlvnJRBNygooYwnXLa53BA+ICDfMe9/QymbV41rgMQSgRSfMOUcSSFbyj0+IyGX7x3zimt2Vrj+1C+LcUaHFprNVz8rYPO6iRnE0j151btyqqiQe0zIwPzTm5lumnDFmP04fHzH0oGDtRDO91R+Wa1x7puVzWG8hNlsOYdHQaB5Y9yI6LR/CUJKFK6M5+bntrCkeTO82IaQVqodQokPmIy80tqmITQXt91xNZfyyQNSCGuu+UkDdZBpNok2nYak4pAi2kRdPDIdkzjmeMkEtFMHpoC9m9kSwDneED5+eZF75G1vZ+F8va+Sx6WV/30tvg4cS+FbD2Iysg/UGGdyeDGbBHCP9BiTDNYj9pJ+m82Wc3gUBBotWbLEaf8ShCZHovXiNKeb36o/clhwgQ0S1Z1jidQOk5GcVdUshDMiDtgmVSUmcdU2N+6rxIR/16GmwiFGuU70jgqcnpMBtVE9ODubYwitdi9qWsNPwDMmIQtQu41IN5Oih2oOUzeu2nbQsWR8vinq4cytttOEk/qn2BXpHdOzMO1u86AlBTgEeQe1jMPWEOg3C6QEIQkhV0bfRXlOc7pweJq5cG2QVm/3bIJ3aUjzKAubhTAssdw2iUiYL9K3sEQUwqR0dB0qSVP+uRH4hY/zcOidOI2L+MMxL3+abzbvmpFtAiPBEKIIlZiLG8pjikDHS0Rsgudn8WW8yV4NdDF2WhH7npnZdvlHE8i7RjUfkNRdECJB6Bl/TDRoQlyF5sqjkWOD5A0bTYsWQkic8YZwSGCBbRJtPCBE1ISYX3570CSoNEXc0qsxZRTVcMolI9PNKWSnt7yV6fZOeCo3M/+K0GcFdtqbZhLVHXwZeUNIQYhDsmA2aR3ZWYMRT+WRSDtI6agg5NvdXOUmGjQmIp658vYX1dggbW0FhJx7dBCa9kmf+Xk8Zo6hhQsJTOJNwUmGyYOxYUVu5UbHkpDFq9BnYoLEnRHp/X6OyTNvnpLJlAntGT5XbR3pqCeEB6vqON0tIP8wdr/nBzT1rUli1ZgRhLYIC2aecGRIo2UhnQ+agW7B5nMICWskk3RNKM8enVPPCTMoTnOifWKyVpDjAZUkZkp+takn6ZHygN6JezxTf6b96xGxUwuq7dkaV7RwTfOTz243k+wZxXtnZhcfrNUUhSD01Dtf1adJZHRcJc6RRB1od/N9DiF64L1sfDjhG6SrKb2ak2GDHiYhkVlKpuPtruw/F+Z5dE2Y8MB5+APPGLt0Uzm+dzOWnqrJSA3trCtwWihN1gtC8iuaDSbvYgbCXixCu4+1juaaG2HPwvkaQm6zwr+8gZ+hlF4tEzOQ4EcUpY/iEcEYFIolFXUeSS8vXWol6tzbxfo+czzTmzi2rpmwH5+VMeSr3pM09GZZWrRhb+V3s2yNW3tTUlIcv5AgNCWNaUuYmTpSKSKAucQZXLV0GkhK2w+EfFOY9dD2azWrVxom3xlMUdhsGJPo6nFniZknpMAjKpIvUCLSBGKTYeLwEXMKBkmy4yUzy8970AJuQdhoHU9ldVfDujB3sOaDhZ3uV377gRANDiw4YunVkvbSptRDrllQVmvMeV7T6CxJM+QwzNsYt7x+Yd3EFUVs8i/jcTzT92QT7GIZUIsg1K1MgrCx9SXcAL52ZwWNPpOatk8xAeBOD7adiP/MxTM5yc9m72xmmoQ8gq8Y02JtXrqpVxD6r+iL0o+hirNvaPC5mAlsyRJtP/71FpIgpHZlmQs3T7HGwL0tyOfiPkwWM0QmV7C8jnSUaY/v7S96kgShuWXJDFqd5i5kn8ssu7FbPj5UZGRkG/7KQ0kQsrSApWdMM9w/K5vC1WkfoinKW2K+0dyy6EPxd5o2bNjgIEkQtnWzRG/JW4mJidHR0fq9eIJQ8s0fhKEdSgysq/vOu9mSIJR886fRJEEoVVdXf0d/JFQShBJJZm1tLWvQmADMzMz0+z+XLQglv1BAgwIDA4l1rALlpiSWocXHxzP9QP5JGHT8VIJQkiRBKEmCUJIkQShJglCSJEEoSYJQkiRBKEmCUJKkNtZ/AFmg+xQr+VKLAAAAAElFTkSuQmCC" width="150" height="45" alt="Screenshot of Mobile Safari suggesting &quot;On my way!&quot; to replace &quot;omw&quot;">
    //<

    // - which keyboard to display (text, phone, url, email, zip)
    //>@attr formItem.browserInputType (String : null : IRA)
    // Form item input type - governs which keyboard should be displayed for
    // mobile devices (supported on iPhone / iPad)
    // @visibility external
    //<
    browserInputTypeMap:{
        "digits": "number",

        // likely synonym
        "phone": "tel"
    },

    // Icons
    // --------------------------------------------------------------------------------------------

    //>@attr    formItem.icons      (Array of FormItemIcon Properties : null  : IRW)
    //  An array of descriptor objects for icons to display in a line after this form item.
    //  These icons are clickable images, often used to display some kind of helper for 
    //  populating a form item.
    //  @group formIcons
    //  @see    class:FormItemIcon
    //  @visibility external
    //  @example formIcons
    //<
    icons: null,
    // An array containing all FormItemIcon objects in `this.icons' that are inline:true.
    _inlineIcons: null,
    // An array containing all "left"-aligned inline icons
    _leftInlineIcons: null,
    // The total width of the "left"-aligned inline icons (the sum of the icons' with and hspace).
    _leftInlineIconsWidth: 0,
    // An array containing all "right"-aligned inline icons
    _rightInlineIcons: null,
    // The total width of the "right"-aligned inline icons (the sum of the icons' with and hspace).
    _rightInlineIconsWidth: 0,

    //> @attr   formItem.defaultIconSrc      (SCImgURL : "[SKIN]/DynamicForm/default_formItem_icon.gif" : IRWA)
    // Default icon image source.     
    // Specify as the partial URL to an image, relative to the imgDir of this component.
    // To specify image source for a specific icon use the <code>icon.src</code> property.<br>
    // If this item is drawn in the disabled state, the url will be modified by adding 
    // "_Disabled" to get a disabled state image for the icon.
    // If <code>icon.showOver</code> is true, this url will be modified by adding "_Over" to get
    // an over state image for the icon.
    // <P>
    // +link{group:skinning,Spriting} can be used for this image, by setting this property to
    // a +link{type:SCSpriteConfig} formatted string.
    //
    //  @group  formIcons
    //  @visibility external    
    //<
    defaultIconSrc:"[SKIN]/DynamicForm/default_formItem_icon.gif",

    //> @attr   formItem.showOverIcons  (boolean : null : IRWA)
    //  If we're showing icons, should we change their image source to the appropriate <i>over</i>
    //  source when the user rolls over (or puts focus onto) them?  Can be overridden on a per
    //  icon basis by the formItemIcon <code>showOver</code> property.
    //  @group formIcons
    //  @visibility external
    //<
    
    //> @attr   formItem.showFocusedIcons (boolean : null : IRWA)
    //  If we're showing icons, should we change their image source to the appropriate
    //  <i>focused</i>  source when this item has focus?  Can be overridden on a per
    //  icon basis by the formItemIcon <code>showFocused</code> property.
    //  @group formIcons
    //  @visibility external
    //<

    //> @attr formItem.iconHSpace (int : 3 : IR)
    // Horizontal space (in px) to leave between form item icons. The space appears either on
    // the left or right of each icon. May be overridden at the icon level via +link{FormItemIcon.hspace}.
    // Must be non-negative.
    // @group formIcons
    // @visibility external
    //<
    iconHSpace: 3,

    //> @attr   formItem.iconVAlign (VerticalAlignment: "bottom" : [IRWA])
    //      How should icons be aligned vertically for this form item.
    //  @group  formIcons
    //  @visibility external
    //<
    // Options are "top", "center", "bottom" - Implemented via the css 'vertical-alignment'
    // property
    iconVAlign:isc.Canvas.BOTTOM,

    //> @attr formItem.iconWidth (int : 20 : IRA)
    // Default width for form item icons. May be overridden at the icon level by +link{FormItemIcon.width}.
    // @group formIcons
    // @visibility external
    //<
    iconWidth: 20,

    //> @attr formItem.iconHeight (int : 20 : IRA)
    // Default height for form item icons. May be overridden at the icon level by +link{FormItemIcon.height}.
    // @group formIcons
    // @visibility external
    //<
    iconHeight: 20,

    //> @attr formItem.prompt (HTMLString : null : IRW)
    // This text is shown as a tooltip prompt when the cursor hovers over this item.
    // <P>
    // When item is +link{FormItem.setCanEdit,read-only} a different hover can be shown with
    // +link{FormItem.readOnlyHover}. Or, when item is +link{FormItem.disabled,disabled} or
    // read-only with +link{readOnlyDisplay,readOnlyDisplay:disabled} a different hover can be shown
    // with +link{FormItem.disabledHover}.
    // <P>
    // Note that when the form is +link{DynamicForm.disabled, disabled} this prompt will not
    // be shown.
    //
    // @group basics
    // @visibility external
    //<

    // FormItem.implementsPromptNatively:
    // By default we show prompts in an ISC hover. However for some form items we'll write
    // out HTML that will cause a native hover prompt to show up instead. In these cases
    // we suppress the ISC hover
    
    //implementsPromptNatively:false,

    //> @attr formItem.readOnlyHover (HTMLString : null : IRW)
    // This text is shown as a tooltip prompt when the cursor hovers over this item
    // and the item is +link{FormItem.setCanEdit,read-only}.
    // <P>
    // Note that when the form is +link{DynamicForm.disabled, disabled} this prompt will not
    // be shown.
    //
    // @visibility external
    //<

    //> @attr formItem.disabledHover (HTMLString : null : IRW)
    // This text is shown as a tooltip prompt when the cursor hovers over this item
    // and the item is +link{FormItem.disabled,disabled} or
    // +link{FormItem.setCanEdit,read-only} with +link{readOnlyDisplay,readOnlyDisplay:disabled}.
    // <P>
    // You can also override +link{formItem.itemHoverHTML, itemHoverHTML} on the item to show
    // a custom hover, whether or not the item is disabled.  
    // <P>
    // Note that when the form itself is +link{DynamicForm.disabled, disabled}, no prompt will
    // be shown.
    // @visibility external
    //<

    //> @attr formItem.iconPrompt (HTMLString : "" : IRWA)
    // Default prompt (and tooltip-text) for icons.
    // @group formIcons
    // @visibility external
    //<
    
    iconPrompt:"",

    //> @attr   formItem.showIcons (Boolean : true : IRWA)
    // Set to false to suppress writing out any +link{formItem.icons} for this item.
    //  @group  formIcons
    //  @visibility external
    //<
    
    showIcons:true,

    //> @attr formItem.showIconsOnFocus (Boolean : null : IRWA)
    // Show the +link{formItem.icons} when the item gets focus, and hide them when it loses focus.
    // Can be overridden at the icon level by +link{formItemicon.showOnFocus}.
    // <P>
    // Note that icons marked as disabled will not be shown on focus even if this flag is
    // true by default. This may be overridden by +link{formItem.showDisabledIconsOnFocus}.
    // @group formIcons
    // @visibility external
    //<

    //> @attr formItem.showDisabledIconsOnFocus (Boolean : false : IRWA)
    // If +link{formItem.showIconsOnFocus} is true, should icons marked as disabled be
    // shown on focus?
    // <P>
    // Default setting is <code>false</code> - it is not commonly desirable to 
    // present a user with a disabled icon on focus.
    // <P>
    // Can be overridden at the icon level by +link{formItemIcon.showDisabledOnFocus}
    // @group formIcons
    // @visibility external
    //<

    //> @attr formItem.showPickerIconOnFocus (Boolean : null : IRWA)
    // Show the picker icon when the item gets focus, and hide it when it loses focus.  Can be
    // overridden at the icon level by +link{formItemicon.showOnFocus}.
    // <P>
    // Note that a pickerIcon marked as disabled will not be shown on focus even if this flag is
    // true by default. This may be overridden by +link{formItem.showDisabledIconsOnFocus}.
    // @group formIcons
    // @visibility external
    //<
    

    //> @attr formItem.showDisabledPickerIconOnFocus (Boolean : false : IRWA)
    // If +link{formItem.showPickerIconOnFocus} is true, should the picker icon be
    // shown on focus if it is disabled (as in a read-only item, for example?)
    // <P>
    // Default setting is <code>false</code> - it is not commonly desirable to 
    // present a user with a disabled icon on focus.
    // <P>
    // Can be overridden at the icon level by +link{formItemIcon.showDisabledOnFocus}
    // @group formIcons
    // @visibility external
    //<

    //> @attr formItem.hideIconsOnKeypress (Boolean : null : IRWA)
    // Hide the +link{formItem.icons} as the user types into a form item, to provide more
    // space.  Completing interaction such as by tabbing away will show the icons again.
    // @group formIcons
    //<

    //> @attr   formItem.redrawOnShowIcon (boolean : true : IRWA)
    //      When dynamically showing/hiding icons for this form  item, should we force a
    //      redraw of the entire form?
    //  @group  formIcons
    //<
    
    redrawOnShowIcon:false,

    //> @attr   formItem.canTabToIcons  (Boolean : null : IRWA)
    // Should this item's +link{formItem.icons,icons} and 
    // +link{formItem.showPickerIcon,picker icon} be included in 
    // the page's tab order by default? If not explicitly set, this property 
    // will be derived from +link{dynamicForm.canTabToIcons}.
    // <P>
    // Developers may also suppress tabbing to individual icons by 
    // setting +link{formItemIcon.tabIndex} to <code>-1</code>.
    // <P>
    // Note that if this form item has tabIndex -1, neither the form item nor the icons
    // will be included in the page's tab order.
    //
    // @group  formIcons
    // @visibility external
    //<
    //canTabToIcons:null,
    
    // Validation Error Icon
    // We write out a special icon to indicate validation errors. This will not be part of the
    // icons array but will be rendered using some of the same code.

    //> @attr   formItem.errorIconHeight    (number : 16 : IRW)
    // Height of the error icon, if we're showing icons when validation errors occur.
    // @group  errorIcon
    // @see FormItem.showErrorIcon
    // @visibility external
    //<
    errorIconHeight: 16,
    
    //> @attr   formItem.errorIconWidth    (number : 16 : IRW)
    // Height of the error icon, if we're showing icons when validation errors occur.
    // @group  errorIcon
    // @see FormItem.showErrorIcon
    // @visibility external
    //<    
    errorIconWidth: 16,
    
    //> @attr   formItem.errorIconSrc    (SCImgURL : "[SKIN]/DynamicForm/validation_error_icon.png" : IRW)
    // URL of the image to show as an error icon, if we're showing icons when validation
    // errors occur.
    // @group  errorIcon
    // @see FormItem.showErrorIcon
    // @visibility external
    //<    
    errorIconSrc: "[SKIN]/DynamicForm/validation_error_icon.png",    
    
    //> @attr   formItem.showErrorIcon (boolean : null : IRW)
    // @include dynamicForm.showErrorIcons
    //  @group  errorIcon, validation, appearance
    //  @visibility external
    //<    
    // Note Actually writing this item (and the error text) into the DOM is handled by the
    // Form (or containerWidget) - but this property governs whether we include the icon in the
    // errorHTML we return.
    //showErrorIcon: null,
    
    //> @attr   formItem.showErrorText (boolean : null : IRW)
    // @include dynamicForm.showErrorIcons
    // @group  validation, appearance
    // @visibility external
    //<    
    //showErrorText: null,
    
    //> @attr formItem.showErrorStyle     (boolean : null : IRW)
    // @include dynamicForm.showErrorIcons
    // @group validation, appearance
    // @visibility external
    // @see FormItem.cellStyle
    //<    
    //showErrorStyle: null,
    
    //> @attr formItem.errorOrientation (Align : null : IRW)
    // If +link{dynamicForm.showInlineErrors} is true, where should the error icon and text appear
    // relative to the form item itself. Valid options are <code>"top"</code>, 
    // <code>"bottom"</code>, <code>"left"</code> or <code>"right"</code>.<br>
    // If unset the orientation will be derived from +link{dynamicForm.errorOrientation}. 
    // @group validation, appearance
    // @visibility external
    //<
    //errorOrientation: null,

    // Define a jsdoc pseudo-class for form item icon descriptor objects.
    // ------

        //> @object FormItemIcon
        //
        //  Form item icon descriptor objects used by Form Items to specify the appearance and
        //  behavior of icons displayed after the item in the page flow.
        //  
        //  @treeLocation   Client Reference/Forms/Form Items/FormItem
        //  @see attr:FormItem.icons
        //  @group formIcons
        //  @visibility external
        //  @example formIcons
        //<

        //> @attr formItemIcon.baseStyle (CSSStyleName : null : IRWA)
        // Base CSS style. If set, as the component changes state and/or is focused, suffixes
        // will be added to the base style. Possible suffixes include "Over" if the user mouses
        // over the icon and +link{FormItemIcon.showOver,this.showOver} is true, "Disabled" if
        // the icon is disabled, and "Focused". In addition, if +link{FormItemIcon.showRTL,showRTL}
        // is enabled, then an "RTL" suffix will be added.
        // @visibility external
        //<

        //> @attr formItemIcon.backgroundColor (CSSColor : null : IR)
        // Optional background color for the icon. Settable via +link{FormItem.setIconBackgroundColor()}.
        // @visibility internal
        //<

        //> @attr formItemIcon.name (Identifier : null : IR)
        // Identifier for this form item icon. This identifier (if set) should be unique
        // within this form item and may be used to get a pointer to the icon object
        // via +link{FormItem.getIcon()}.
        // @visibility external
        //<
        // Note: Also used by the AutoTest subsystem - if the name is autoGenerated, we can't
        // guarantee it won't change as the application changes (specifically the order of
        // icons for this form item changes).
        // For auto-generated icons, such as the picker we should always provide a reliable
        // standard name

        //> @attr formItemIcon.inline (Boolean : false : IR)
        // When set, this icon is rendered inside the +link{formItem.textBoxStyle,textBox} area
        // of the <code>FormItem</code> (where input occurs in a +link{TextItem}, +link{TextAreaItem} or
        // +link{ComboBoxItem}) as opposed to as a trailing icon.
        // <p>
        // Use +link{FormItemIcon.inlineIconAlign,inlineIconAlign} to control alignment of the
        // icon.  Multiple icons can be inlined on both the left and right side of the
        // <code>textBox</code> area.  +link{FormItemIcon.hspace,hspace} is honored for spacing
        // between multiple adjacent icons.
        // <p>
        // Inline icons are not supported in Internet Explorer 6, or when the <code>FormItem</code>
        // is not a <code>TextItem</code>, <code>TextAreaItem</code> or <code>ComboBoxItem</code>.
        // When unsupported, the icon will fall back to non-inline mode.
        // <p>
        // The +link{formItem.showPickerIcon,picker icon}, if any, cannot be inlined.
        // <p>
        // As an alternative to displaying an image, an inline icon may display a string of
        // HTML instead. See +link{FormItemIcon.text}.
        // @example inlineFormIcons
        // @visibility external
        //<
        

        //> @attr formItemIcon.inlineIconAlign (Alignment : null : IR)
        // Horizontal alignment for icons marked +link{FormItemIcon.inline,inline}.
        // <p>
        // By default, the first icon that specifies inline is aligned left, and the second and all
        // subsequent icons to the right.  <code>"center"</code> alignment is invalid and will be
        // ignored.
        // <p>
        // In RTL mode, the alignment is automatically mirrored; <code>inlineIconAlign:"left"</code>
        // results in the icon being placed on the right and <code>inlineIconAlign:"right"</code>
        // results in the icon being placed on the left.
        // @visibility external
        //<

        //> @attr formItemIcon.src (SCImgURL : null : IRW)
        // If set, this property determines this icon's image source.
        // If unset the form item's <code>defaultIconSrc</code> property will be used
        // instead.<br>
        // As with <code>defaultIconSrc</code> this URL will be modified by adding
        // "_Over" or "_Disabled" if appropriate to show the icon's over or disabled state.
        // If +link{FormItemIcon.showRTL,showRTL} is enabled, then "_rtl" will be added to the
        // source URL before the extension.
        // <p>
        // The special value "blank" means that no image will be shown for this icon. This
        // is particularly useful together with +link{FormItemIcon.baseStyle} to implement
        // spriting of the different icon states.
        // <p>
        // For an +link{FormItemIcon.inline,inline} <code>FormItemIcon</code>,
        // +link{FormItemIcon.text,text} may be specified to show a string of HTML instead of
        // an image.
        // <P>
        // +link{group:skinning,Spriting} can be used for this image, by setting this property to
        // a +link{type:SCSpriteConfig} formatted string.
        //
        // @group formIcons
        // @see attr:formItem.defaultIconSrc
        // @example formIcons
        // @visibility external
        //<

        //> @attr formItemIcon.text (HTMLString : null : IRWA)
        // As an alternative to displaying an image, an +link{FormItemIcon.inline,inline}
        // <code>FormItemIcon</code> can display a string of HTML where the icon's image would
        // have appeared. This enables advanced customizations such as using text, icon font symbols,
        // Unicode dingbats and emoji, and/or SVG in place of an image.
        // <p>
        // Setting an inline icon's text property will cause the HTML to be used instead of an
        // image, as long as the browser and form item support inline icons.
        // <p>
        // This property only has an effect on inline icons.  If the inline property is false,
        // or the browser or form item does not support inline icons, then the image specified
        // by +link{FormItemIcon.src} (or the form item's +link{FormItem.defaultIconSrc,defaultIconSrc})
        // will be used.
        // <p>
        // Typically, the HTML is styled via +link{FormItemIcon.baseStyle}.
        // <p>
        // Auto-sizing of the HTML is not supported; the HTML will be clipped to the icon's
        // +link{FormItemIcon.width,width} and +link{FormItemIcon.height,height}.
        // @example textIcons
        // @group formIcons
        // @visibility external
        //<

        //> @attr formItemIcon.cursor (Cursor : Canvas.POINTER : IRWA)
        // Specifies the cursor image to display when the mouse pointer is
        // over this icon. It corresponds to the CSS cursor attribute. See Cursor type for
        // different cursors.
        // <p>
        // See also +link{formItemIcon.disabledCursor}.
        // @visibility external
        // @group cues
        //<

        //> @attr formItemIcon.disabledCursor (Cursor : Canvas.DEFAULT : IRWA)
        // Specifies the cursor image to display when the mouse pointer is
        // over this icon if this icon is disabled. It corresponds to the CSS cursor
        // attribute. See Cursor type for different cursors.
        // @visibility external
        // @group cues
        //<

        //> @attr formItemIcon.showOver (boolean : null : IRWA)
        // Should this icon's image and/or +link{FormItemIcon.baseStyle,baseStyle} switch to the
        // appropriate "Over" value when the user rolls over or focuses on the icon?
        // <P>
        // Note if +link{formItem.showOver} is true and +link{formItemIcon.showOverWhen}
        // is set to "textBox", this icon will show over state when the user rolls over the
        // text box (or control table, if visible) for the item. This is most commonly used
        // for +link{formItemIcon.inline,inline} icons.
        //
        // @group  formIcons
        // @visibility external
        // @see attr:formItem.showOverIcons
        //<
        
        //> @type IconOverTrigger
        // Property to govern when the 'over' styling is applied to
        // a formItemIcon. 
        // @value "icon" Show rollover styling and media when the user is over the icon only
        // @value "textBox" Show rollover styling and media when the user is over the icon
        //  or over the textBox (or control-table, if present) for this icon. Only has
        //  an effect when +link{FormItem.showOver} is true.
        // @value "item" Show rollover styling and media when the user is over any part of the
        //  FormItem, including the entire cell within a DynamicForm table containing the item.
        //
        // @visibility external
        //<
        
        //> @attr formItemIcon.showOverWhen (IconOverTrigger : null : IRWA)
        // If +link{formItemIcon.showOver} or +link{formItem.showOverIcons} is true,
        // this property may be set to customize when the 'over' styling is applied to
        // the item. If unset, rollover styling will be applied when the user is over
        // the icon only.
        //
        // @group formIcons
        // @visibility external
        //<

        //> @attr formItemIcon.showFocused (Boolean : null : IRWA)
        // Should this icon's image and/or +link{FormItemIcon.baseStyle,baseStyle} switch to the
        // appropriate "Focused" value when the user puts focus on the form item or icon?
        // @see formItem.showFocusedIcons
        // @see formItemIcon.showFocusedWithItem
        // @group  formIcons
        // @visibility external
        //<

        //> @attr formItemIcon.showRTL (Boolean : null : IRA)
        // Should this icon's +link{FormItemIcon.src,src} and/or +link{FormItemIcon.baseStyle,baseStyle}
        // switch to the appropriate RTL value when the FormItem is in RTL mode? If true, then
        // the image URL for all states will have "_rtl" added before the extension. Also, if
        // baseStyle is set, all style names will have an "RTL" suffix. This should only be
        // enabled if RTL media is available.
        // <p>
        // For example, if an icon's src is "[SKINIMG]formItemIcons/myFormIcon.png" and the baseStyle
        // is "myFormIcon", then in the "Down" state, SmartClient will use "[SKINIMG]formItemIcons/myFormIcon_Down_rtl.png"
        // for the image source and "myFormIconDownRTL" for the style name.
        // @group RTL
        // @group formIcons
        // @visibility external
        //<

        //> @attr formItemIcon.showFocusedWithItem (boolean : null : IRWA)
        // If this icon will be updated to show focus (see +link{formItemIcon.showFocused}, 
        // +link{formItem.showFocusedIcons}), this property governs whether the focused state should
        // be shown when the item as a whole receives focus or just if the icon receives focus.
        // If this property is unset, default behavior is to show focused state when the item
        // receives focus. 
        // @see formItem.showFocusedIcons
        // @see formItemIcon.showFocused
        // @group  formIcons
        // @visibility external
        //<
        
        //> @attr formItemIcon.canFocus (Boolean : null : IRWA)
        // Set to false to suppress all focus features for this icon. Clicking the
        // icon will not apply focus to the icon or to the form item.
        // @group  formIcons
        // @visibility external
        //<

        //> @attr formItemIcon.neverDisable (boolean : null : IRWA)
        // If <code>icon.neverDisable</code> is true, when this form item is disabled, the 
        // icon will remain enabled. 
        // Note that disabling the entire form will disable all items, together with their 
        // icons including those marked as neverDisable - this property only has an effect 
        // if the form is enabled and a specific item is disabled within it.
        // <P>
        // If this property is true, the icons will also remain enabled if a form item 
        // is marked as +link{formItem.canEdit,canEdit:false}. For finer grained control over
        // whether icons are enabled for read-only icons see +link{formItem.disableIconsOnReadOnly}
        // and +link{formItemIcon.disableOnReadOnly}
        //
        // @group  formIcons
        // @visibility external
        //<
        
        //> @attr formItemIcon.disableOnReadOnly (boolean : null : IRWA)
        // If +link{formItem.canEdit} is set to false, should this icon be disabled.
        // If unset this is determined by +link{formItem.disableIconsOnReadOnly}.
        // Note that if +link{formItemIcon.neverDisable} is set to true, the icons will
        // be rendered enabled regardless of this setting and whether the item is editable.
        // @group formIcons
        // @visibility external
        //<
        
        //> @attr formItemIcon.disabled (Boolean : null : IRW)
        // Whether this icon is disabled.  Can be updated at runtime via the +link{formItem.setIconDisabled}
        // method.  Note that if the formItem containing this icon is disabled, the icon will
        // behave in a disabled manner regardless of the setting of the icon.disabled property.
        // @group appearance
        // @see FormItem.setIconDisabled()
        // @visibility external
        //<

        //> @attr formItemIcon.enableWhen (AdvancedCriteria : null : IR)
        // Criteria to be evaluated to determine whether this icon should appear enabled.
        // <p>
        // Criteria are evaluated against the +link{dynamicForm.getValues,form's current values} as well as 
        // the current +link{canvas.ruleScope,rule context}.  Criteria are re-evaluated every time
        // form values or the rule context changes, whether by end user action or by programmatic calls.
        // <P>
        // A basic criteria uses textMatchStyle:"exact". When specified in
        // +link{group:componentXML,Component XML} this property allows
        // +link{group:xmlCriteriaShorthand,shorthand formats} for defining criteria.
        // <p>
        // Note: A FormItemIcon using enableWhen must have a +link{formItem.name,name} defined on
        // its FormItem.
        // @group ruleCriteria
        // @visibility external
        //<

        //> @attr formItemIcon.tabIndex (int : null : IRA)
        // TabIndex for this formItemIcon.
        // <P>
        // Set to -1 to remove the icon from the tab order, but be cautious doing so: if the
        // icon triggers important application functionality that cannot otherwise be accessed
        // via the keyboard, it would be a violation of accessibility standard to remove the
        // icon from the tab order.
        // <P>
        // Any usage other than setting to -1 is extremely advanced in the same way as using
        // +link{formItem.globalTabIndex}.
        //
        // @group formIcons
        // @visibility external
        //<

        //> @method formItemIcon.click()
        // Click handler for this icon.
        // <P>
        // <smartclient>
        // Return false to cancel this event. 
        // </smartclient>
        // <smartgwt>
        // This event may be cancelled. 
        // </smartgwt>
        // If this event is not cancelled by the icon-level click handler, it may also
        // be handled at the FormItem level via +link{formItem.pickerIconClick()} [for the
        // picker icon only], and then +link{formItem.iconClick()}
        //
        //  @param  form (DynamicForm)  The Dynamic Form to which this icon's item belongs.
        //  @param  item (FormItem)     The Form Item containing this icon
        //  @param  icon (FormItemIcon) A pointer to the form item icon clicked
        // @return (boolean) Return false to cancel the event.
        //  @group  formIcons
        //  @visibility external
        //  @example formIcons
        //<    

        //> @method formItemIcon.keyPress()
        //      StringMethod action to fire when this icon has focus and receives a keypress
        //      event.
        //      If unset the form item's <code>iconKeyPress</code> method will be fired instead 
        //      (if specified).
        //  @param  keyName (KeyName)    Name of the key pressed
        //  @param  character (Character) character produced by the keypress
        //  @param  form (DynamicForm)  The Dynamic Form to which this icon's item belongs.
        //  @param  item (FormItem)     The Form Item containing this icon
        //  @param  icon (FormItemIcon) A pointer to the form item icon 
        //  @group  formIcons
        //  @visibility external
        //<

        //> @attr   formItemIcon.width (number : null : IRW)
        //      If set, this property determines the width of this icon in px.
        //      If unset the form item's <code>iconWidth</code> property will be used instead.
        //  @group  formIcons
        //  @visibility external
        //  @see    attr:formItem.iconWidth
        //<

        //> @attr   formItemIcon.height (number : null : IRW)
        //      If set, this property determines the height of this icon in px.
        //      If unset the form item's <code>iconHeight</code> property will be used instead.
        //  @group  formIcons
        //  @visibility external
        //  @see    attr:formItem.iconHeight
        //<    

        //> @attr formItemIcon.prompt (HTMLString : null : IRWA)
        // If set, this property will be displayed as a prompt (and tooltip text) for this form
        // item icon.
        // <P>
        // If unset the form item's <code>iconPrompt</code> property will be used instead.
        //
        //  @group  formIcons
        //  @visibility external
        //  @see    attr:formItem.iconPrompt
        //<

        //> @attr formItemIcon.showOnFocus (Boolean : null : IRWA)
        // Show this icon when its item gets focus, and hide it when it loses focus.  If
        // non-null, overrides the default behavior specified by 
        // +link{formItem.showIconsOnFocus} or +link{formItem.showPickerIconOnFocus}, as
        // appropriate.  This feature allows space to be saved in the form for items not being
        // interacted with, and helps draw attention to the item currently in focus.
        //
        // @group formIcons
        // @visibility external
        // @see method:formItem.setIconShowOnFocus
        //<
        
        
        //> @attr formItemIcon.showDisabledOnFocus (Boolean : null : IRWA)
        // If show-on-focus behavior is enabled for this icon via +link{formItemIcon.showOnFocus}
        // or related properties at the item level, and this icon is marked as disabled,
        // should it be shown on focus? If unset, will be derived from the
        // +link{formItem.showDisabledIconsOnFocus} or 
        // +link{formItem.showDisabledPickerIconOnFocus} settings.
        //
        // @group formIcons
        // @visibility external
        //<

        //> @attr formItemIcon.hspace (Integer : null : IR)
        // If set, this property determines the number of pixels space to be displayed on 
        // the left of this form item icon, or for +link{FormItemIcon.inline,inline} icons
        // whose +link{FormItemIcon.inlineIconAlign,inlineIconAlign} is
        // <smartclient><code>"left"</code>,</smartclient>
        // <smartgwt>{@link com.smartgwt.client.types.Alignment#LEFT},</smartgwt>
        // on the right of this form item icon. Must be non-negative.
        // If unset, the form item's +link{FormItem.iconHSpace,iconHSpace} will be used instead.
        // @group formIcons
        // @visibility external
        //<

        //> @method formItemIcon.showIf ()
        // If specified, <code>icon.showIf</code> will be evaluated when the form item is
        // drawn or redrawn. Return true if the icon should be visible, or false if it
        // should be hidden. Note that if +link{formItem.showIcon()} or +link{formItem.hideIcon()}
        // is called, this method will be overridden.
        // @param form (DynamicForm) the DynamicForm in which the icon is embedded
        // @param item (FormItem) the item to which this icon is attached.
        // @return (boolean) Return true if the icon should be visible, false otherwise.
        // @visibility external
        //<

        //> @attr formItemIcon.visibleWhen (AdvancedCriteria : null : IR)
        // Criteria to be evaluated to determine whether this icon should be visible.
        // <p>
        // Criteria are evaluated against the +link{dynamicForm.getValues(),form's current values} as well as 
        // the current +link{canvas.ruleScope,rule context}.  Criteria are re-evaluated every time
        // form values or the rule context changes, whether by end user action or by programmatic calls.
        // <P>
        // A basic criteria uses textMatchStyle:"exact". When specified in
        // +link{group:componentXML,Component XML} this property allows
        // +link{group:xmlCriteriaShorthand,shorthand formats} for defining criteria.
        // <p>
        // Note: A FormItemIcon using visibleWhen must have a +link{formItem.name,name} defined on
        // its FormItem.
        // @group ruleCriteria
        // @visibility external
        //<
        


    // Hints
    // --------------------------------------------------------------------------------------------

    //> @attr formItem.hint (HTMLString : null : IRW)
    // Specifies "hint" string to show next to the form item to indicate something to the user.
    // This string generally appears to the right of the form item.
    // 
    // @see hintStyle
    // @group appearance
    // @visibility external
    // @example formHints
    //<

    //> @attr formItem.showHint (Boolean : true : IRWA)
    // If a hint is defined for this form item, should it be shown?
    //
    // @group appearance
    // @visibility external
    //<
    showHint:true,

    //> @attr formItem.wrapHintText (Boolean : null : IR)
    // If this item is showing a +link{FormItem.hint}, should the hint text be allowed to
    // wrap? Setting this property to <code>false</code> will render the hint on a single line
    // without wrapping, expanding the width required to render the item if necessary.
    // <P>
    // If unset this property will be picked up from the +link{DynamicForm.wrapHintText}
    // setting.
    // <P>
    // This setting does not apply to hints that are +link{TextItem.showHintInField,shown in field}.
    // @see FormItem.minHintWidth
    // @visibility external
    //<
    //wrapHintText: null,

    //> @attr formItem.minHintWidth (Integer : null : IR)
    // If this item is showing a +link{FormItem.hint}, this setting specifies how much
    // horizontal space is made available for rendering the hint text by default.
    // Typically this reflects how much space the hint text takes up before it wraps.
    // <P>
    // Note that the presence of a hint may cause a form item to expand horizontally past its
    // specified +link{FormItem.width}.
    // This property value acts as a minimum - if the hint text can not wrap within this width
    // (either due to +link{FormItem.wrapHintText} being set to <code>false</code>, or
    // due to it containing long, un-wrappable content), it will further expand to take
    // up the space it needs.
    // <P>
    // If unset this property will be picked up from the +link{DynamicForm.minHintWidth}
    // setting.
    // <P>
    // This setting does not apply to hints that are +link{TextItem.showHintInField,shown in field}.
    // @see FormItem.wrapHintText
    // @visibility external
    //<
    //minHintWidth: null,


    // Styles
    // --------------------------------------------------------------------------------------------

    //> @attr formItem.showFocused     (Boolean : false : IRWA)
    // When this item receives focus, should it be re-styled to indicate it has focus?
    // <P>
    // See +link{group:formItemStyling} for more details on formItem styling.
    // 
    // @group formItemStyling
    // @visibility external
    // @see cellStyle
    //<
    showFocused:false,

    //> @attr formItem.showOver (boolean : false : IRWA)
    // When the user rolls over this item, should it be re-styled to indicate it has focus?
    // <P>
    // When enabled, the "Over" styling is applied to the text box,
    // control table (if present), and pickerIcon (if present), and any icons
    // where +link{formItemIcon.showOver} is true and +link{formItemIcon.showOverWhen} is
    // set to "textBox".<br>
    // These behaviors can be disabled piecemeal via +link{updateTextBoxOnOver}, 
    // +link{updateControlOnOver} and +link{updatePickerIconOnOver} properties.
    // <P>
    // Developers may also show rollover styling for other icons (see 
    // +link{formItem.showOverIcons} and +link{formItemIcon.showOverWhen}).
    // <P>
    // See +link{group:formItemStyling} for more details on formItem styling.
    //
    // @group formItemStyling
    // @visibility external
    // 
    //<
    
    // We also support rollover styling for valueIcons - used for the CheckboxItem class.
    // That's not explicitly linked to showOver at present - we might want to add this.
    //
    // We don't currently offer to style the cell on over - we could fairly easily add this
    // but it seems an unlikely use-case
    
    //> @attr formItem.updateTextBoxOnOver (Boolean : null : IRWA)
    // If +link{formItem.showOver} is true, setting this property to false will explicitly
    // disable showing the "Over" state for the TextBox element of this item.
    //
    // @see showOver
    // @group formItemStyling
    // @visibility external
    //<
    
    getUpdateTextBoxOnOver : function () {
        return this.updateTextBoxOnOver;
    },

    //> @attr formItem.updateControlOnOver (Boolean : null : IRWA)
    // If +link{formItem.showOver} is true, setting this property to false will explicitly
    // disable showing the "Over" state for the control table element of
    // this item (if present).
    //
    // @see showOver
    // @group formItemStyling
    // @visibility external
    //<
    
    getUpdateControlOnOver : function () {
        return this.updateControlOnOver;
    },

    //> @attr formItem.updatePickerIconOnOver (Boolean : null : IRWA)
    // If +link{formItem.showOver} is true, setting this property to false will explicitly
    // disable showing the "Over" state for the PickerIcon of this item (if present)
    //
    // @see showOver
    // @group formItemStyling
    // @visibility external
    //<


    //> @attr formItem.showDisabled (Boolean : true : IRWA)
    // When this item is disabled, should it be re-styled to indicate its disabled state?
    // <P>
    // See +link{group:formItemStyling} for more details on formItem styling.
    //
    // @group formItemStyling
    // @visibility external
    // @see cellStyle
    //<
    showDisabled:true,

    //> @attr formItem.showRTL (boolean : false : IRA)
    // When this item is in RTL mode, should its style name include an "RTL" suffix?
    // @group RTL
    // @group appearance
    // @visibility external
    // @see cellStyle
    //<
    showRTL:false,

    //> @attr formItem.showPending (Boolean : null : IRA)
    // When <code>true</code>, causes the "Pending" optional suffix to be added if the item's
    // current value differs from the value that would be restored by a call to +link{DynamicForm.resetValues()}.
    // <p>
    // +link{attr:shouldSaveValue,shouldSaveValue} must be <code>true</code> for this setting
    // to have an effect.
    // <p>
    // Styling of the value is updated only after the +link{method:change()} event is processed,
    // so depending on the value of +link{attr:changeOnKeypress,changeOnKeypress}, styling may
    // be updated immediately on keystroke or only when the user leaves the field.
    // <p>
    // Default styling is provided for the Enterprise, EnterpriseBlue, and Graphite skins only.
    // <code>showPending</code> should not be enabled for an item when using a skin without
    // default styling unless the default +link{FormItem.pendingStatusChanged()} behavior is
    // canceled and a custom pending visual state is implemented by the item.
    // <p>
    // <strong>NOTE:</strong> Whether an item is shown as pending is not reflected to screen
    // readers. Therefore, it is not advisable to design a UI where it is necessary for the user
    // to know whether an item is shown as pending in order to work with the form.
    // @see FormItem.pendingStatusChanged()
    // @example pendingValues
    // @visibility external
    //<
    showPending:null,

    //> @attr formItem.pendingStatus (Boolean : null : RA)
    // Whether this form item is displaying its pending visual state.
    // @see attr:showPending
    //<
    //pendingStatus: null,

    //> @attr formItem.fixedPendingStatus (Boolean : null : IRWA)
    // When set and +link{attr:showPending,showPending} is <code>true</code>, overrides the
    // value-based detection of the pending status. If <code>true</code>, then this item will
    // be shown in the pending visual state; if <code>false</code>, then this item will not be
    // shown in the pending visual state.
    //<
    //fixedPendingStatus:null,

    //> @attr formItem.showDeletions (Boolean : null : IRA)
    // For items that support +link{SelectItem.multiple,multiple values}, this causes distinct CSS styling
    // to be applied to values that the user has unselected.
    // <p>
    // Only allowed when +link{attr:showPending,showPending} is <code>true</code>. Defaults
    // to the form-level +link{DynamicForm.showDeletions} setting if set; otherwise, to the
    // value of <code>showPending</code>.
    // <p>
    // Only supported for +link{MultiComboBoxItem} and for +link{SelectItem} when
    // +link{SelectItem.multiple,multiple:true} is set. The specific default behaviors are:
    // <ul>
    // <li>For <code>MultiComboBoxItem</code>, buttons corresponding to deleted values
    //     (also called "deselected buttons") will be disabled and have their +link{Button.baseStyle}
    //     set to +link{MultiComboBoxItem.deselectedButtonStyle}.
    // <li>For a multiple <code>SelectItem</code>, +link{FormItem.valueDeselectedCSSText} is
    //     applied to any deleted value in the text box. In addition, "Deselected" is appended
    //     to the cells' +link{ListGrid.baseStyle} for cells in the pickList menu corresponding
    //     to deleted values.
    // </ul>
    // <p>
    // <strong>NOTE:</strong> When a value is shown as deleted, this is not reflected to screen
    // readers, and screen readers are instructed to ignore the deleted value. Therefore, it is
    // not advisable to design a UI where it is necessary for the user to know whether a value
    // is shown as deleted in order to work with the form.
    // @see DynamicForm.showDeletions
    // @visibility external
    //<
    //showDeletions: null,

    // Overview of form item styling. Given the way different items produce different
    // DOM structures etc, it's good to have an overview of what the actual stylable 
    // parts are, and what properties apply to them
    // - Does not expose the "outerTable", or other structure which is not publicly
    //   styleable / is subject to change in the future.
    //> @groupDef formItemStyling
    // Different FormItem types are rendered using different DOM structures. This is
    // an overview explaining the various elements that may be produced and how they can
    // be styled:
    // <P>
    // Form items written out by a DynamicForm with 
    // +link{dynamicForm.itemLayout,itemLayout:"table"} are written into table cells.
    // A formItem can govern the appearance of these cells using properties such as 
    // +link{formItem.cellStyle}, +link{formItem.cellHeight}. These properties have no effect for formItems
    // rendered outside a form (for example the during +link{ListGrid.canEdit,grid editing}),
    // or if <code>itemLayout</code> is "absolute".
    // <P>
    // If a formItem is showing a +link{formItem.showPickerIcon,picker icon}, the picker icon and
    // text box will be written into an element referred to as the control table. Styling
    // applied to this element (via +link{formItem.controlStyle}) will extend around both the
    // text box and the picker (but not other icons, hints, etc). The control table is not
    // written out if the pickerIcon is not visible except in the case where the
    // +link{formItem.showPickerIconOnFocus} is true, and the item does not have focus, or
    // if a developer explicitly sets +link{formItem.alwaysShowControlBox} to true.
    // <P>
    // The textBox of an item is the area containing its main textual content. This may
    // natively be achieved as a data element (such as an &lt;input ...&gt;), or a static
    // DOM element. See +link{formItem.textBoxStyle}, and related +link{formItem.readOnlyTextBoxStyle} and
    // +link{formItem.printTextBoxStyle} for styling options. 
    // See also +link{formItem.shouldApplyHeightToTextBox()} for a discussion on sizing the text box.
    // <P>
    // Any visible +link{formItem.valueIcons,valueIcon} will be rendered inside the text box for 
    // static items, or adjacent to it for items where the text is editable (such as
    // +link{TextItem}). Explicit styling for the valueIcon can be specified via
    // the +link{formItem.getValueIconStyle()} method.
    // <P>
    // FormItems can also show explicitly defined +link{formItem.icons}. By default these 
    // show up next to the item, outside its text box and control table / after the
    // +link{formItem.showPickerIcon,picker icon} (if present), though
    // +link{formitemIcon.inline,inline positioning} is also supported for some cases.
    // Their appearance and behavior are heavily customizable - see
    // +link{formItemIcon.baseStyle}, +link{formItemIcon.src} and related properties.
    // <P>
    // +link{formItem.hint,FormItem hints} may be written out as static text
    // after any icons, and styled according to the +link{formItem.hintStyle} - or where supported,
    // written directly into the text box with styling derived from the textBoxStyle plus
    // a suffix of <code>"Hint"</code>. (See +link{TextItem.showHintInField}).
    // <P>
    // In addition to this, form items may show validation error icons or text 
    // (see +link{dynamicForm.showInlineErrors}, +link{formItem.showErrorIcon} and
    // +link{formItem.showErrorText}). The position of these error indicators is controlled
    // by +link{dynamicForm.errorOrientation}.
    // <P>
    // Most formItem user-interface elements support stateful styling - showing a different
    // appearance for +link{formItem.showFocused,focused}, +link{formItem.showOver,over},
    // +link{formItem.showDisabled,disabled} and +link{formItem.showErrorStyle,error} states.
    // <P>
    // Default styling for items will vary by skin, and note that subclasses of 
    // FormItem may have additional styling properties not explicitly called out here.<br>
    // Developers performing global styling modifications for formItems should also be
    // aware of compound items (such as +link{DateItem}) which achieve their user interface
    // by embedding simpler items in an outer structure. See +link{CompoundFormItem_skinning}.
    //
    // @treeLocation Client Reference/Forms/Form Items
    // @title FormItem Styling
    // @visibility external
    //<
        
    // Discussion on compound item / skinning for jsdoc. This is referred to by other JSDoc 
    // entries but doesn't need to show up in the doc-tree.
    //> @groupDef CompoundFormItem_skinning
    // When skinning basic FormItems like SelectItem and TextItem, consider that compound form
    // items like DateItem and ComboBox reuse simpler items like SelectItem and TextItem, so adding
    // a border to SelectItem would also apply a border to each select item within DateItem.<br>
    // To avoid such side-effects, if you want to add styling to all SelectItems used in your 
    // application, you can create an application-specific subclass like MySelectItem and apply 
    // properties there.<br>
    // @visibility external
    //<

    //> @type FormItemBaseStyle
    // This string is the base CSS class name applied to a FormItem  (or some part of a form item). 
    // See the +link{group:formItemStyling,formItem styling overview} for more information about
    // styling formItems.
    // <P>
    // The specified style name will be modified as the 'state' of the form item changes. 
    // Developers should provide appropriately named CSS classes for each stateful style
    // described below:<ul>
    // <li>If +link{FormItem.showPending} is true, when the current value differs from the
    //     value that would be restored by a call to +link{DynamicForm.resetValues()}, this style
    //     will have the suffix "Pending"  appended to it.</li>
    // <li>If +link{FormItem.showFocused} is true, when the form item receives focus, this
    //     style will have the suffix "Focused" appended to it.</li>
    // <li>If +link{FormItem.showOver} is true, roll-over will be indicated by appending the
    //     suffix "Over" appended to the style name. This applies to the
    //     +link{FormItem.textBoxStyle,textBoxStyle} and
    //     +link{FormItem.controlStyle,controlStyle} only.</li>
    // <li>If +link{FormItem.showErrorStyle} is true, if the form item has errors, this
    //     style will have the suffix "Error" appended to it.</li>
    // <li>If +link{FormItem.showDisabled} is true, when the form item is disabled, this
    //     style will have the suffix "Disabled" appended to it.</li>
    // <li>Finally, if +link{FormItem.showRTL} is true, when the form item is in RTL mode, this
    //     style will have the suffix "RTL" appended to it.</ul>
    // So for example if the cellStyle for some form item is set to "formCell" and showFocused
    // is true, when the form item receives focus, the form item's cell will have the "formCellFocused"
    // style applied to it.
    // @baseType String
    // @visibility external
    // @group formItemStyling
    //<

    //> @attr formItem.cellStyle  (FormItemBaseStyle : "formCell" : IRW)
    // CSS style applied to the form item as a whole, including the text element, any icons, and
    // any hint text for the item. Applied to the cell containing the form item.
    // <P>
    // See +link{group:formItemStyling} for an overview of formItem styling, and 
    // the +link{group:CompoundFormItem_skinning} discussion for special
    // skinning considerations.
    // @visibility external
    // @group formItemStyling
    //<
    cellStyle:"formCell",

    //> @attr formItem.hintStyle      (CSSStyleName : "formHint" : IRW)
    // CSS class for the "hint" string. For items that support
    // +link{TextItem.showHintInField}, this only applies when showHintInField is false.
    //
    // @see hint
    // @group formItemStyling
    // @visibility external
    //<
    
    hintStyle:"formHint",
    
    //> @attr formItem.useDisabledHintStyleForReadOnly (boolean : null : IRW)
    // By default, +link{formItem.canEdit,read-only} fields use the same style name as editable 
    // fields for in-field hints, unless they are +link{formItem.isDisabled(),disabled} or 
    // configured to use a disabled +link{type:ReadOnlyDisplayAppearance}.  This is described 
    // under +link{textItem.showHintInField}
    // <p> 
    // If <code>useDisabledHintStyleForReadOnly</code> is set, the "HintDisabled" style will be 
    // used for read-only fields regardless of their <code>ReadOnlyDisplayAppearance</code>.  This
    // allows you to use a different in-field hint style for read-only fields without having to 
    // use a general disabled appearance for those fields
    // 
    // @group appearance
    // @visibility external
    //<

    //> @attr formItem.titleStyle (FormItemBaseStyle : "formTitle" : IRW)
    // Base CSS class name for a form item's title. Note that this is a +link{FormItemBaseStyle} so
    // will pick up stateful suffixes on focus, disabled state change etc. by default.
    // <p>
    // Note the appearance of the title is also affected by
    // +link{dynamicForm.titlePrefix}/+link{dynamicForm.titleSuffix,titleSuffix} and 
    // +link{dynamicForm.requiredTitlePrefix}/+link{dynamicForm.requiredTitleSuffix,requiredTitleSuffix}.
    //
    // @group formItemStyling
    // @visibility external
    // @see formItem.cellStyle
    //<
    titleStyle:"formTitle",

    //> @attr formItem.verticalTitleStyle (FormItemBaseStyle : null : IRW)
    // Base CSS class name for a form item's title when 
    // +link{formItem.titleOrientation, titleOrientation is 'top'} . Note that this is a 
    // +link{FormItemBaseStyle} so
    // will pick up stateful suffixes on focus, disabled state change etc. by default.
    // <p>
    // Note the appearance of the title is also affected by
    // +link{dynamicForm.titlePrefix}/+link{dynamicForm.titleSuffix,titleSuffix} and 
    // +link{dynamicForm.requiredTitlePrefix}/+link{dynamicForm.requiredTitleSuffix,requiredTitleSuffix}.
    //
    // @group formItemStyling
    // @visibility internal
    // @see formItem.cellStyle
    //<
    //verticalTitleStyle:"formTitle",

    //> @attr formItem.printTitleStyle (FormItemBaseStyle : null : IRW)
    // Base CSS stylename for a form item's title when generating print HTML for the item.
    // If unset +link{formItem.titleStyle} will be used instead.
    // @group printing
    // @visibility external
    //<

    //> @attr formItem.textBoxStyle (FormItemBaseStyle : null : IRW)
    // Base CSS class name for a form item's text box element.
    // <p>
    // See +link{group:formItemStyling} for an overview of formItem styling, and 
    // the +link{group:CompoundFormItem_skinning} discussion for special
    // skinning considerations.
    // <p>
    // If the <code>textBoxStyle</code> is changed at runtime, +link{formItem.updateState(),updateState()}
    // must be called to update the visual state of this item.
    // @group formItemStyling
    // @visibility external
    // @see formItem.cellStyle
    //<
    //textBoxStyle:null,

    //> @attr formItem.printTextBoxStyle (FormItemBaseStyle : null : IRW)
    // Base CSS class name for a form item's text box element when getting printable HTML for the
    // form. If unset +link{formItem.textBoxStyle} will be used instead. Note that focused styling
    // will never be displayed while printing, though error and disabled styling will.
    // <P>
    // By default this style will be used for printHTML for the item even if the item is
    // +link{canEdit,canEdit:false} with +link{readOnlyDisplay,readOnlyDisplay:static}.<br>
    // To override this behavior, developers may also specify a custom print style for this 
    // state via the 
    // +link{formitem.printReadOnlyTextBoxStyle}.
    // 
    // @group printing, formItemStyling
    // @visibility external
    //<
    //printTextBoxStyle:null,

    //> @attr formItem.printReadOnlyTextBoxStyle (FormItemBaseStyle : null : IRW)
    // CSS class name to apply to the print view of an item's text box if the item
    // is +link{canEdit,canEdit:false}, with +link{readOnlyDisplay,readOnlyDisplay:static}.
    // <P>
    // If specified this will take precedence over +link{formItem.printTextBoxStyle} for
    // static readonly items.
    // 
    // @group printing, formItemStyling
    // @visibility external
    //<
    

    //> @attr formItem.pickerIconStyle (FormItemBaseStyle : null : IRW)
    // Base CSS class name for a form item's picker icon cell. If unset, inherits from
    // this item's +link{controlStyle,controlStyle}.
    // @group pickerIcon
    // @group formItemStyling
    // @see formItem.cellStyle
    // @visibility external
    //<
    //pickerIconStyle:null,

    //> @attr formItem.controlStyle (FormItemBaseStyle : null : IRW)
    // Base CSS class name for a form item's "control box". This is an HTML element
    // which contains the text box and picker icon for the item.
    // <P>
    // See +link{formItem.alwaysShowControlBox} for details on when the control box
    // is written out.
    // <P>
    // See +link{group:formItemStyling} for an overview of formItem styling, and 
    // the +link{group:CompoundFormItem_skinning} discussion for special
    // skinning considerations.
    // @group formItemStyling, pickerIcon
	// @visibility external
    // @see formItem.cellStyle
    //<
    //controlStyle:null,

    //> @attr formItem.editPendingCSSText (CSSText : "color:#0066CC;" : [IRWA])
    // Custom CSS text to be applied to cells with pending edits that have not yet been
    // submitted.
    // @visibility external
    // @group appearance
    //<
    editPendingCSSText:"color:#0066CC;",

    //> @attr formItem.valueDeselectedCSSText (CSSText : "color:#A8A8A8;text-decoration:line-through;" : IRA)
    // Custom CSS text to be applied to values that have been deleted, when
    // +link{attr:showDeletions,showDeletions} is enabled.
    // @visibility external
    //<
    valueDeselectedCSSText:"color:#A8A8A8;text-decoration:line-through;",

    // textColor clobbers the color in the textBoxStyle - used by ImageItem to show apparently 
    // disabled text in an otherwise normal TextItem
    //textColor: null,

    //> @attr formItem.showFocusedErrorState (Boolean : false : IRWA)
    // If set to true, when an item has errors and is focused, an "ErrorFocused" suffix 
    // will appear on the stylename.
    //
    // @group appearance
    // @visibility external
    // @see formItem.cellStyle
    //<
    showFocusedErrorState:false,

    // -------------------------------
    // Deprecated styling properties:

    //> @attr formItem.cellClassName (CSSStyleName : null : IR)
    // CSS class for a form item's cell in the form layout
    // 
    // @group appearance
    // @visibility external
    // @deprecated As of SmartClient version 5.5, deprecated in favor of +link{formItem.cellStyle}
    //<

    //> @attr formItem.errorCellClassName (CSSStyleName : null : IR)
    // CSS class for a form item's cell when a validation error is showing.
    //
    // @group appearance
    // @visibility external
    // @deprecated As of SmartClient version 5.5 deprecated in favor of +link{formItem.cellStyle}
	//<

    //> @attr formItem.titleClassName (CSSStyleName : null : IR)
    // CSS class for the form item's title.
    // @group title
    // @visibility external
    // @deprecated As of SmartClient Version 5.5, use +link{formItem.titleStyle} instead
    //<

    //> @attr formItem.titleErrorClassName (CSSStyleName : null : IR)
    // CSS class for a form item's title when a validation error is showing.
    // @group title
    // @visibility external
    // @deprecated As of SmartClient Version 5.5, use +link{formItem.titleStyle} instead    
    //<

    //> @attr formItem.hintClassName (CSSStyleName : null : IR)
	// CSS class for the "hint" string.
    //
    // @see hint
	// @group appearance
    // @visibility external
    // @deprecated As of SmartClient version 5.5, deprecated in favor of +link{FormItem.hintStyle}
	//<

    // Internal flag designating whether this element type has a data element 
    // (an actual HTML form element, holding a value).  Accessed via the 'hasDataElement()'
    // method.
    _hasDataElement:false,
    
    // Hovers
    // -----------------------------------------------------------------------------------------
    //> @attr formItem.hoverDelay (number : null : IRWA)
    // If specified, this is the number of milliseconds to wait between the user rolling over 
    // this form item, and triggering any hover action for it.<br>
    // If not specified <code>this.form.itemHoverDelay</code> will be used instead.
    // @group Hovers
    // @visibility external
    //<
    //,hoverDelay:null
        
    //> @attr formItem.hoverWidth (Number | String : null : [IRW])
    // Option to specify a width for any hover shown for this item.
    // @see DynamicForm.itemHoverWidth
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr FormItem.hoverHeight  (Number | String : null : [IRW])
    // Option to specify a height for any hover shown for this item.
    // @see DynamicForm.itemHoverHeight
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr FormItem.hoverAlign (Alignment  : null : [IRW])
    // Text alignment  for text displayed in this item's hover canvas, if shown.
    // @see DynamicForm.itemHoverAlign
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr FormItem.hoverVAlign (VerticalAlignment : null : [IRW])
    // Vertical text alignment  for text displayed in this item's hover canvas, if shown.
    // @see DynamicForm.itemHoverVAlign
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr FormItem.hoverStyle (CSSStyleName  : null : [IRW])
    // Explicit CSS Style for any hover shown for this item.
    // @see DynamicForm.itemHoverStyle
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr FormItem.hoverOpacity (number : null : [IRW])
    // Opacity for any hover shown for this item
    // @see DynamicForm.itemHoverOpacity
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr FormItem.hoverRect (Object : null : [IRWA])
    // Explicit placement information for any hover shown for this item.
    // Should be specified as an object of the form <br>
    // <code>{left:[value], top:[value], width:[value], height:[value]}</code>
    // @see DynamicForm.itemHoverRect
    // @group Hovers
    // @visibility internal
    //<
    

    //> @attr formItem.showClippedTitleOnHover (boolean : true : [IRW])
    // If true and the title is clipped, then a hover containing the full title of this item
    // is enabled.
    // <p>
    // <smartclient>The +link{formItem.titleHover()} method is called before the
    // hover is displayed, allowing the hover to be canceled if desired. The HTML shown in the
    // hover can be customized by overriding +link{formItem.titleHoverHTML()}.</smartclient>
    // <smartgwt>A <code>TitleHoverEvent</code> is fired before the hover is displayed,
    // allowing the hover to be canceled if desired. The HTML shown in the hover can be customized
    // by setting a <code>FormItemHoverFormatter</code> on either this <code>FormItem</code>
    // or the <code>DynamicForm</code>. See <code>setItemTitleHoverFormatter()</code>.</smartgwt>
    // @group Hovers
    // @visibility external
    //<
    showClippedTitleOnHover:true,

    //> @attr FormItem.showClippedValueOnHover (Boolean : true : [IRW])
    // If true and the value is clipped, then a hover containing the full value of this item
    // is enabled.
    // <p>
    // <smartclient>The +link{FormItem.valueHover()} method is called before the
    // hover is displayed, allowing the hover to be canceled if desired. The HTML shown in the
    // hover can be customized by overriding +link{FormItem.valueHoverHTML()}.</smartclient>
    // <smartgwt>A <code>ValueHoverEvent</code> is fired before the hover is displayed,
    // allowing the hover to be canceled if desired. The HTML shown in the hover can be customized
    // by setting a <code>FormItemHoverFormatter</code> on either this <code>FormItem</code>
    // or the <code>DynamicForm</code>. See <code>setItemValueHoverFormatter()</code>.</smartgwt>
    // @group Hovers
    // @visibility external
    //<
    showClippedValueOnHover:true

    //> @attr formItem.showOldValueInHover (Boolean : null : IRWA)
    // Causes the original value to be shown to the end user when the user hovers over the
    // FormItem as such (when the +link{FormItem.itemHover()} event would fire).
    // <p>
    // When +link{attr:showOldValueInHover} and the form's +link{DynamicForm.showOldValueInHover}
    // are both unset, defaults to the value of +link{attr:showPending}.
    // <p>
    // The message shown is controlled by +link{attr:originalValueMessage}, unless the item is 
    // +link{formItem.disabled, disabled} and +link{formItem.disabledHover, disabledHover} is 
    // set - in this case, the hover shows the <code>disabledHover</code> HTML.
    // @visibility external
    //<
    //, showOldValueInHover: null

    //> @attr formItem.originalValueMessage (HTMLString : null : IRWA)
    // Message shown when +link{attr:showOldValueInHover,showOldValueInHover} is enabled and
    // the value has been modified.
    // <p>
    // If unset, defaults to the form's +link{DynamicForm.originalValueMessage}. Otherwise,
    // overrides the form-default <code>originalValueMessage</code> for this item.
    // @visibility external
    //<
    //, originalValueMessage: null

    //> @attr formItem.nullOriginalValueText (HTMLString : "None" : IRWA)
    // Text shown as the value in the +link{FormItem.originalValueMessage} when 
    // +link{attr:showOldValueInHover,showOldValueInHover} is enabled, and when 
    // the value has been modified but was originally unset.
    // @visibility external
    //<
    , nullOriginalValueText: "None"

    // Criteria and Operators
    // -----------------------------------------------------------------------------------------
    
    //> @attr formItem.operator (OperatorId : null : IR)
    // +link{OperatorId} to be used when +link{dynamicForm.getValuesAsCriteria()} is called.
    // <P>
    // <code>item.operator</code> can be used to create a form that offers search functions such
    // as numeric range filtering, without the more advanced user interface of the
    // +link{FilterBuilder}.  For example, two SpinnerItems could be created with
    // <code>formItem.operator</code> set to "greaterThan" and "lessThan" respectively to
    // enable filtering by a numeric range.
    // <P>
    // When <code>item.operator</code> is set for any FormItem in a form,
    // <code>form.getValuesAsCriteria()</code> will return an +link{AdvancedCriteria} object
    // instead of a normal +link{Criteria} object.  Each FormItem will produce one
    // +link{Criterion} affecting the DataSource field specified by +link{formItem.criteriaField}.
    // The criteria produced by the FormItems will be grouped under the logical operator
    // provided by +link{dynamicForm.operator}.
    // <P>
    // If <code>operator</code> is set for some fields but not others, the default operator is
    // "equals" for fields with a valueMap or an optionDataSource, and for fields of type "enum"
    // (or of a type that inherits from "enum").  The default operator for all other fields is
    // controlled by +link{dynamicForm.defaultSearchOperator}. 
    // <P>
    // <b>Note:</b> <code>formItem.operator</code> is only supported for a form that has a 
    // +link{dataBoundComponent.dataSource,dataSource}.  In a form with no DataSource, 
    // setting <code>formItem.operator</code> will have no effect. 
    //
    // @group criteriaEditing
    // @visibility external
    //<
    
    //> @attr formItem.criteriaField (FieldName : null : IR)
    // When using +link{formItem.operator}, the name of the DataSource field for the
    // +link{Criterion} this FormItem generates.  If not specified, defaults to
    // +link{FormItem.name}.
    // <P>
    // Generally, because <code>criteriaField</code> defaults to <code>item.name</code>, you don't
    // need to specify it.  However, if more than one FormItem specifies criteria for the same
    // DataSource field, they will need unique values for +link{formItem.name} but should set
    // +link{formItem.criteriaField} to the name of DataSource field they both target.
    // <P>
    // For example, if two DateItems are used to provide a min and max date for a single field called
    // "joinDate", set +link{formItem.criteriaField} to "joinDate" on both fields but give the fields
    // distinct names (eg "minDate" and "maxDate") and use those names for any programmatic access,
    // such as +link{dynamicForm.setValue()}.
    //
    // @visibility external
    //<

    // Formula
    // -----------------------------------------------------------------------------------------
    
    //> @attr formItem.formula (UserFormula : null : IR)
    // Formula to be used to calculate the numeric value of this FormItem.  For a field of type
    // "text" (or subtypes) +link{formItem.textFormula} is used instead.
    // <p> 
    // Available fields for use in the formula are the current +link{canvas.ruleScope,rule context}.
    // The formula is re-evaluated every time the rule context changes.
    // <p>
    // Values calculated by the formula will always replace the current value of a non-editable
    // field.  For an editable field, the current value will be replaced if the end user has not
    // changed the value since the last time it was computed by the formula, or if the value of the
    // field is invalid according to declared +link{formItem.validators,validators}.
    // <p>
    // Note: A FormItem using a formula must have a +link{name} defined. +link{shouldSaveValue} can
    // be set to <code>false</code> to prevent the formula field from storing the calculated value
    // into the form's values.
    //
    // @group formulaFields
    // @visibility external
    //<

    //> @attr formItem.textFormula (UserSummary : null : IR)
    // Formula to be used to calculate the text value of this FormItem. For a numeric field
    // +link{formItem.formula} is used instead.
    // <p> 
    // Available fields for use in the formula are the current +link{canvas.ruleScope,rule context}.
    // The formula is re-evaluated every time the rule context changes.
    // <p>
    // See +link{formItem.formula} for details on available fields for the formula and when the
    // formula is calculated.
    // <p>
    // Note: A FormItem using a textFormula must have a +link{name} defined. +link{shouldSaveValue} can
    // be set to <code>false</code> to prevent the formula field from storing the calculated value
    // into the form's values.
    //
    // @group formulaFields
    // @visibility external
    //<

    // -----------------------------------------------------------------------------------------

    //> @attr formItem.saveOnEnter (Boolean : null : IRW)
    // Set this to true to allow the parent form to save it's data when 'Enter' is pressed on 
    // this formItem and +link{DynamicForm.saveOnEnter,saveOnEnter} is true on the parent form.
    // @visibility external
    //<
    //saveOnEnter:false,
    
    
    //> @attr formItem.canEditOpaqueValues  (Boolean : null : IRA)
    // If true, indicates that this FormItem is capable of editing "opaque" values, ie, 
    // objects that are more complex than simple primitive types like numbers, strings and
    // dates.  Ordinarily, you use the +link{class:SimpleType,SimpleType system} to 
    // convert these opaque values into "atomic" values that can be edited by the built-in 
    // editors like +link{class:TextItem}.  However, sometimes you to create a custom editor
    // that knows how to edit a particular opaque type in a domain-specific way - for example,
    // a composite custom FormItem that allows the user to edit both a number and a currency 
    // code, both of which are needed to make a proper monetary amount (for that particular 
    // application).
    //
    // When this value is set, the FormItem will manage the opaque value directly, rather
    // than it being filtered through calls to 
    // +link{simpleType.getAtomicValue(),getAtomicValue()} and 
    // +link{simpleType.updateAtomicValue(),updateAtomicValue()}.  Note, if you set this flag on
    // a FormItem that does not have the ability to edit an opaque value (which is something
    // that must be custom-coded) then you will get garbage in your editor, if not an outright
    // crash.
    //
    // @visibility external
    //<
    
    //> @attr formItem.multiple (Boolean : false : IRW)
    // If true, multiple values may be selected.
    // <P>
    // Only certain FormItems that support both singular and multiple values actually use
    // this setting, such as +link{class:SelectItem}. Other FormItems such as
    // +link{class:MultiComboboxItem} are always effectively multiple:true, even if
    // multiple:true is not set.
    //
    // @group	appearance
    // @visibility external
    //<
});

isc.FormItem.addMethods({


	//>	@method	FormItem.init()	(A)
	//			initialize the formItem object 
	//
	//		@param	[all arguments]	(Object)	objects with properties to override from default
	//<
    _$height:"height", _$width:"width",
    _$colSpan:"colSpan", _$rowSpan:"rowSpan",
	init : function () {
        if (isc._traceMarkers) arguments.__this = this;

        // Always duplicate specified icon objects. This ensures that icon objects/arrays applied to
        // a formItem subclass via a simple addProperties() block won't end up being shared by
        // reference across multiple live items
        if (this.icons != null) {
            var dupIcons = [];
            for (var i = 0; i < this.icons.length; i++) {
                dupIcons.add(isc.addProperties({}, this.icons[i]));
            }
            this.icons = dupIcons;
        }

        // Duplicate the readOnlyCanSelectText array if we're just picking up the
        // class default. This avoids the array being shared across multiple items.
        if (this.readOnlyCanSelectText != null &&
            this.getClass().getPrototype().readOnlyCanSelectText == this.readOnlyCanSelectText)
        {
            this.readOnlyCanSelectText = this.readOnlyCanSelectText.duplicate();
        }
        
        this._origCanEdit = this.getCanEdit();
        this._origReadOnlyDisplay = this.getReadOnlyDisplay();

        // get a global ID so we can be called in the global scope
        // If getID() is called before this (typically only likely in an override of init),
        // we will already have a global ID - in this case avoid clobbering it.
        if (this.ID == null || window[this.ID] != this) {
            isc.ClassFactory.addGlobalID(this); 
        }

        // apply the inlineStyleSuffix as required - secondary styleset, used in grid-editors
        if (this.showInlineStyle && this.inlineStyleSuffix) {
            if (this.textBoxStyle) this.textBoxStyle += this.inlineStyleSuffix;
            if (this.controlStyle) this.controlStyle += this.inlineStyleSuffix;
        }

        // Register the item with the TabIndexManager
        this.initializeTabPosition();
        
		// if "options" was specified, switch to "valueMap"
		if (this.options && !this.valueMap) {
			this.valueMap = this.options;
			delete this.options;
		}

        // Make sure that any 'measure' properties are in the correct format
        
        this._convertRawToMeasure(this._$height);
        this._convertRawToMeasure(this._$width);
        this._convertRawToMeasure(this._$colSpan);
        this._convertRawToMeasure(this._$rowSpan);
        
        // Start with our default value
        // - we do this rather than calling 'this.setValue(this.getDefaultValue())' for a
        //   couple of reasons:
        //   a) At this point the form's "values" object may not be initialized
        //   b) In subclass overrides, such as the container item, setValue() makes use of
        //      properties that get set up after this (for them Superclass) init()
        //      implementation
        // - setValue() would also call form.saveItemValue() - it's ok to skip this at this
        //   stage as after the form item has been created this call would be made after form
        //   item creation via 'setValues()' for any items where 'shouldSaveValue' is true.
        // - setValue() would also call setElementValue() - ok to skip as our elements haven't
        //   been set up until draw().
        this._value = this.getDefaultValue();
        // Note that this is the default value.
        this._setToDefault = true;
	
        this._setUpIcons();

        // If any validators have stopOnError set, this form item must be marked
        // validateOnExit:true. SynchronousValidation is also enabled.
        
        if ((!this.validateOnExit || !this.synchronousValidation) &&
            this.validators && this.validators.length > 0)
        {
            for (var i = 0; i < this.validators.length; i++) {
                if (this.validators[i].stopOnError) {
                    this.validateOnExit = true;
                    this.synchronousValidation = true;
                    break;
                }
            }
        }
        // If any form or form item has stopOnError set, this form item must be marked
        // validateOnExit:true. SynchronousValidation is also enabled.
        if ((!this.validateOnExit || !this.synchronousValidation) &&
            ((this.stopOnError == null && this.form && this.form.stopOnError) || this.stopOnError))
        {
            this.validateOnExit = true;
            this.synchronousValidation = true;
        }

        
        if (this.__sgwtRelink) this.__sgwtRelink();

        this.onInit();
    },

    // Add an item to the TabIndexManager on init.
    // By default we'll initialize ourselves under our form.
    // The actual index will (probably) by changed by the form itself as a result of
    // form.assignItemsTabPosition() to ensure items show up based on tab-position, etc.
    initializeTabPosition : function (item) {
        
        var parentID = this.form ? this.form.getID() : null;
        
        isc.TabIndexManager.addTarget(
            this.ID,
            
            true,
            parentID, 
            null, 
            {target:this, methodName:"autoTabIndexUpdated"},
            {target:this, methodName:"syntheticShiftFocus"},
            this.tabGroupExit != null ? {target:this, methodName:"tabGroupExit"} : null
            
        );
    },

    // onInit() - notification method fired on initialization
    
    onInit:function () {
    },

    isRTL : function () {
        return this.containerWidget == null ? isc.Page.isRTL() : this.containerWidget.isRTL();
    },

    
    _$star:"*",
    _convertRawToMeasure : function (property) {
        var value = this[property];        
        if (value == null || isc.isA.Number(value) || value == this._$star) return value;
        var numericVal = parseInt(value);
        if (numericVal == value) {
            this[property] = numericVal;
            return value;
        }
        return value;
    },


    
    //> @attr formItem.destroyed (Boolean : null : RA)
    // The destroyed attribute will be set to true if this item has been destroyed()
    // Note that FormItem lifecycle is managed by the DynamicForm itself. 
    // FormItem instances are created and destroyed automatically when new fields are 
    // added to the form.
    // @visibility external
    //<

    destroy : function (a,b,c,d,e) {
        // If we get called twice just return. This could have unpredictable results
        // otherwise (for example this.form being unset below, etc)
        
        if (this.destroyed) return;
        
        
        if (isc.FormItem._pendingEditorExitCheck == this) {
            isc.FormItem._pendingEditorExitCheck.checkForEditorExit(true, true);
        }

        this.invalidateDisplayValueCache(true);

        if (this.isDrawn()) this.cleared();

        // If this is a form item that implements the PickList interface (has reusePickList method) 
        // and shows a unique pickList, destroy it too
        if (this.reusePickList != null) {
            var pickList = this.pickList;
            this.pickList = null;
            if (pickList != null) {
                if (pickList.formItem == this) delete pickList.formItem;
                if (pickList.isVisible()) pickList.hide();
                if (!this.reusePickList()) pickList.destroy();
                else if (pickList.body) pickList.body._reused = true;
            }
        }

        // AutoChildren: By default destroy any autochildren we created
        // We set up the _createdAutoChildren object in createAutoChild
        // This is of the format:   {childName:<array of IDs>}
        // Auto destroy these and clear this[childName] at the same time, if appropriate
        
        var autoChildren = this._createdAutoChildren;
        if (autoChildren != null) {
            for (var childName in autoChildren) {
                
                var array = autoChildren[childName];
                for (var i = 0, len = array.length; i < len; ++i) {
                    var childID = array[i],
                        child = (childID ? window[childID] : null) || this[childName];

                    if (child && !child.destroyed && child.destroy && !child.dontAutoDestroy) {
                       child.destroy();
                    }
                }

                // Always clear out this[childName].
                // Probably not really required but if we didn't destroy the child (dontAutoDestroy)
                // we don't want to keep pointing to it
                delete this[childName];
            }
        }
        this.destroyed = true;
        
        
        if (this.form) {
            // Tell the form to remove from TabIndexManager
            this.form._removeItemFromTabIndexManager(this);
            this.form = null;
        }
        this._dataElement = null;
        
        // Allow the IDs to be reused
        isc.ClassFactory.dereferenceGlobalID(this);
        this._releaseDOMIDs();

        // NOTE: we assume picker recycling as a default

        if (isc.EH._focusTarget == this) isc.EH._focusTarget = null;
        this.invokeSuper(isc.FormItem, "destroy", a,b,c,d,e);
    },

    clear : function () {
        if (this.picker) this.picker.clear();
    },
    
    getDataSource : function () {
        if (isc.isA.String(this.dataSource)) return isc.DS.get(this.dataSource);
        return this.dataSource;
    },
    
    
    registerWithDataView : function (dataView) {
        if (!this.inputDataPath) return;
        
        if (!dataView) {
            dataView = this.form;
            while (dataView && !isc.isA.DataView(dataView)) dataView = dataView.parentElement;
        }
        
        if (!dataView) {
            this.logWarn("Component initialized with an inputDataPath property, but no DataView " +
                         "was found in the parent hierarchy. inputDataPath is only applicable to " +
                         "DataBoundComponents and FormItems being managed by a DataView");
            return;
        }
        
        dataView.registerItem(this);
    },


    _getNotificationCallback : function (methodName) {
        var item = this;
        do {
            if (methodName in item) {
                return {
                    target: item,
                    methodName: methodName
                };
            }
        } while ((item = item.parentItem) != null);
        return null;
    },


    // IDs and names
	// --------------------------------------------------------------------------------------------
    
	//>	@method	formItem.getFieldName()	(A)
	//			Return the name for the this formItem.
	//		@group	drawing
	//
	//		@return	(String)	name for this form item
    // @visibility external
	//<
	getFieldName : function () {
        return this.name;
	},
    
    //>	@method	formItem.getDataPath() (A)
    // Return the dataPath for the this formItem.
    // @return (DataPath) dataPath for this form item
    // @visibility external
    //<
    getDataPath : function () {
        return this.dataPath;
    },
    
    // returns this.datapath, but if the path is absolute and includes
    // this form's dataPath, trims that off (so it's the datapath relative to the containing form)
    getTrimmedDataPath : function () {
        var dp = this.getDataPath();
        if (dp && this.form && this.form.dataPath) {
            dp = this.form._trimDataPath(dp);
        }
        if (dp && dp.endsWith("/")) dp = dp.substring(0, dp.length-1);
        return dp;
    },
    
    //>	@method	formItem.getFullDataPath() (A)
    // Return the fully-qualified dataPath for the this formItem (ie, the dataPath expressed 
    // in absolute terms from the root of the hierarchy, rather than relative to the item's 
    // parent form).  Note that the item's name is substituted into the full dataPath if the
    // item does not specify an explicit dataPath.  For example, if we have a field called 
    // <code>name</code> that specifies no dataPath, on a form that specifies a dataPath of 
    // <code>/order/items</code>, this method will return <code>/order/items/name</code>
    // @return (DataPath) Fully-qualified dataPath for this form item
    // @visibility external
    //<
    getFullDataPath : function () {
        var localDP =  this.getDataPath() || this.getFieldName();
        if (!localDP) {
            if (this.shouldSaveValue) {
                this.logWarn("Encountered field with neither name nor dataPath: " + 
                                this.echo(this));
            }
            localDP = "";
        }
        // convert numbers - historically it was allowed to have field names that are numbers...
        if (!isc.isA.String(localDP)) localDP = localDP+"";
        if (localDP.startsWith(isc.Canvas._$slash)) return localDP;
        var parentDP = this.form.getFullDataPath();
        if (parentDP && parentDP != isc.Canvas._$slash) {
            return parentDP + isc.Canvas._$slash + localDP;
        }
        return localDP;
    },
    
    //>	@method	formItem.shouldSaveOnEnter() (A)
    // Returns true if 'Enter' key presses in this formItem should allow a saveOnEnter: true
    // parent form to save it's data.  The default implementation returns the value of
    // +link{FormItem.saveOnEnter} or false if that property is unset.
    // @return (Boolean) boolean indicating whether saving should be allowed to proceed
    // @visibility external
    //<
    shouldSaveOnEnter : function () {
        var result = this.saveOnEnter != null ? this.saveOnEnter : false;
        return result;
    },


    //>	@method	formItem.getItemName()	(A)
	//			Return the name for the this formItem.  Synonym for getFieldName()
	//		@group	drawing
	//
	//		@return	(String)	name for this form item
    // @visibility internal
	//<
    getItemName : function () {
        return this.getFieldName();
    },


	//>	@method	formItem.getElementName()	(A)
	//			Return the name to be written into this form item's HTML element.
    //          This will not necessarily match the value returned by this.getFieldName().
	//		@group	drawing
	//
	//		@return	(String)	name of the form element
	//<
    
    _$underscore:"_",
    _$value:"value",
    getElementName : function () {

        
        if (this.isInactiveHTML()) return "";
		var name = this.getFieldName();

		// if this item has a parentItem, prepend the name of the parentItem
        // This is just for uniqueness - we will not be trying to parse this string to determine
        // what an items' parent element is
		if (this.parentItem) {
			var masterName = this.parentItem.getElementName();
			if (name == isc.emptyString) name = masterName;
			else name = [masterName, this._$underscore, name].join(isc.emptyString);
		}
        
        // If we still don't have a name, or the name matches the ID for the item,
        // return a unique 'name' string for this item.
        // - Note: we can't actually use the ID of the item, because when we write handlers 
        //   into the form items, we want to be able to refer to the item by it's ID. Because 
        //   the handlers are executed in the scope of the native form object in the 
        //   document.forms array, if the native name of the Form Element matches the ID of 
        //   the item, the ID would give us a pointer to the Form Element rather than the item.
        if (name == null || name == this.getID() || name == isc.emptyString) {
            name = this._getDOMID(this._$value);
        }
        
		return name;
	},

    //> @method formItem.getBrowserInputType() (A)
    // Gets the value to use for the INPUT element's type attribute if
    // +link{FormItem.browserInputType,browserInputType} is specified.
    //<
    getBrowserInputType : function () {
        var browserInputType = this.browserInputType;
        if (browserInputType == null) return null;
        if (this.browserInputTypeMap.hasOwnProperty(browserInputType)) {
            browserInputType = this.browserInputTypeMap[browserInputType];
        }
        return browserInputType;
    },

	//>	@method	formItem.getDataElementId()	(A)
	// Return the ID for this form item's data element.
    //		@group	drawing
	//		@return	(String)	name of the form element
    // @visibility testAutomation
	//<
    
    _$dataElement:"dataElement",
    getDataElementId : function () {
        // inactiveHTML depends on context so we can't simply cache...
        if (this.isInactiveHTML()) return this._getDOMID(this._$dataElement);
        
        if (this.__tagId == null) {
            this.__tagId = this._getDOMID(this._$dataElement, true);
        }
        // This will be a unique ID that can be written into the element tag.
        // It's used for getting a reference to the form item element to be used by the
        // "FOR" property written into the label for the form item.
        // Doesn't necessarily reflect anything about the information carried by the form item.
        return this.__tagId;
        
    },
    
	//>	@method	formItem.getItemID()	(A)
	//		Return the unique global ID for this form item instance.
    //      The item is available in the global scope via this ID as window[itemID].
    //      Synonym for getID().
	//		@group	drawing
	//
	//		@return	(String)	ID of the form item.
	//<
	getItemID : function () {
        return this.getID();
	},
   
    //>	@method	formItem.getID()    (A)
	//		Return the unique global ID for this form item instance.
    //      The item is available in the global scope via this ID as window[itemID].
	//		@group	drawing
	//
	//		@return	(String)    ID of the item.
	//<
    getID : function () {
        
        if (this.ID == null) {
            isc.ClassFactory.addGlobalID(this);
        }
        return this.ID;
    },
    
    
    
    // Titles
	// --------------------------------------------------------------------------------------------
    
   	//>	@method	formItem.shouldShowTitle()	(A)
	//	Draw a cell for this item title?
	//		@group	drawing
	//
	//		@return	(boolean)	true if item title cell should be drawn
	//<
	shouldShowTitle : function () {
		return this.showTitle;
	},

    // Some FormItems, like checkboxes and radio-items can handle rendering their titles
    // inline rather than having the Form render the title into a separate cell.
    // This method will return true when this is the case so DynamicForm / ContainerItem etc can
    // suppress standard titles
    willWriteTitleInline : function () {
        return false;
    },

    _$label:"label",
    _getLabelElementID : function () {
        return this._getDOMID(this._$label);
    },

	//>	@method	formItem.getTitleHTML()	(A)
	//	Return the HTML for the title of this formItem
	//		@group	drawing
	//
	//		@return	(HTMLString)	title for the formItem
	//<
    _$forEquals: " for='",
    _$accesskeyEquals: " accesskey='",
    _$titleHTMLTemplate: [
        "<label id='",      // [0]
        ,                   // [1] this._getLabelElementID()
        "'",                // [2]

        // FOR="" attribute
        ,                   // [3] this._$forEquals or null
        ,                   // [4] this.getDataElementId() or null
        ,                   // [5] isc.apos or null

        // ACCESSKEY="" attribute
        ,                   // [6] this._$accesskeyEquals or null
        ,                   // [7] this.accessKey or null
        ,                   // [8] isc.apos or null
        " style='",         // [9] style tag
        ,                   // [10] style css
        "'>",               // [11]
        ,                   // [12] title
        "</label>"          // [13]
    ],
    getTitleHTML : function () {
        if (this.willWriteTitleInline()) return "";
        return this._getTitleHTML(this.getTitle());
    },
    _getTitleHTML : function (title) {
    
        var template = this._$titleHTMLTemplate,
            focusElementId = null,
            accessKey = null;
        if (this._canFocus()) {
            accessKey = this.accessKey;
            if (accessKey != null) {
                // underline the accessKey char within the title
                title = isc.Canvas.hiliteCharacter(title, accessKey);
            }

            // Note: the <LABEL> tag allows us to set an accessKey on the element without writing it
            // directly into the element's HTML.  It also improves on (for example) screen reader 
            // support. It also means clicking the title will put focus into the target form item.
            
            if (this.hasDataElement()) focusElementId = this.getDataElementId();

            
        }

        template[1] = this._getLabelElementID();

        if (focusElementId != null) {
            template[3] = this._$forEquals
            template[4] = focusElementId;
            template[5] = isc.apos;
        } else {
            template[5] = template[4] = template[3] = null;
        }

        if (accessKey != null) {
            template[6] = this._$accesskeyEquals
            template[7] = accessKey;
            template[8] = isc.apos;
        } else {
            template[8] = template[7] = template[6] = null;
        }

        if (isc.isA.CheckboxItem(this) && !this.labelAsTitle) {
            // for checkboxes showing a label, v-center the text next to the icon
            template[10] = "vertical-align: middle;";
        }

        template[12] = title;

        return template.join(isc._emptyString);
    },

    
    getMaxTitleSpace : function () {
        return this.getVisibleWidth();
    },

    //> @method formItem.getTitle() (A)
    // Returns the title HTML for this item.
    // @return (HTMLString) title for the formItem
    // @group drawing
    // @visibility external
    //<
    getTitle : function () {
        var undef;
        if (!this.form) return;
        // allow a developer to actually specify a null title, but showTitle true as an obvious
        // way to leave alignment all the same but not show annoying ":" next to the title cell.
        var title = this[this.form.titleField]
        if (title !== undef) {
            // Map "" to nbsp to avoid rendering oddities like mismatched heights
            // when title has been set to an explicit empty string
            if (isc.isA.emptyString(title)) title = "&nbsp;"
            return title;
        }
        
        if (!this._autoAssignedName) return this[this.form.fieldIdProperty];
    },

    // Defer to DF to pick up the form's default titleOrientation
    getTitleOrientation : function () { return this.form.getTitleOrientation(this); },

    // Layout
	// --------------------------------------------------------------------------------------------

    //> @method formItem.isVisible()    ()
    // Return true if the form item is currently visible. Note that like the similar
    // +link{canvas.isVisible(),Canvas API}, it indicates visibility settings only and so
    // will return true for an item that is not drawn.
    // 
    //  @group  visibility
    //  @return (Boolean)   true if the form item is visible
    // @visibility external
    //<
    
    isVisible : function (itemOnly) {
        if (!itemOnly && !this.containerWidget.isVisible()) return false;
            
        // If we have a showIf(), which evaluated to false, we will have been marked as
        // visibility false (done in DynamicForm.getInnerHTML()).
        if (this.visible == false) return false;
        // If we're a child of a container item, check whether the container item has been
        // marked as not-visible.
        if (this.parentItem && !this.parentItem.isVisible(itemOnly)) return false;
        return true;
    },
	
   	//>	@method	formItem.getRowSpan()	(A)
	// Return the rowSpan for this item
	//		@group	formLayout
	//
	//		@return	(number)	rowSpan
	//<
	getRowSpan : function () {
		return this.rowSpan;
	},

   	//>	@method	formItem.getColSpan()	(A)
	// Return the colSpan for this item
	//		@group	formLayout
	//
	//		@return	(number)	colSpan
	//<
	getColSpan : function () {
        if (this.form && this.form.linearMode) {
            if (this.linearColSpan == 0) this.linearColSpan = 1;
            return this.linearColSpan != null ? this.linearColSpan : "*";
        }
        // disallow colSpan of zero
        if (this.colSpan == 0) this.colSpan = 1;
		return this.colSpan;
	},

    //> @method formItem.getTitleColSpan() (A)
    // Return the titleColSpan for this item
    // @group formLayout
    //
    // @return (number) titleColSpan
    //<
    getTitleColSpan : function () {
        // disallow titleColSpan of zero
        if (this.titleColSpan == 0) this.titleColSpan = 1;
        return this.titleColSpan;
    },

    //> @method formItem.isStartRow()   (A)
    // Should this item be drawn on a new row?
    //      @group tableLayout
    //      @return (boolean) true if a new row should start for this item
    //<
    isStartRow : function () {
        if (this.form && this.form.linearMode) {
            return this.linearStartRow != null ? this.linearStartRow : false;
        }
        return this.startRow;
    },
    
    //> @method formItem.isEndRow()   (A)
    // Should this be the last item on a row?
    //      @group tableLayout
    //      @return (boolean) true if a new row should start after this item
    //<
    isEndRow : function () {
        if (this.form && this.form.linearMode) {
            return this.linearEndRow != null ? this.linearEndRow : true;
        }
        return this.endRow;
    },

    //>	@method	formItem.getRect()
    // Return the coordinates of this object as a 4 element array.
    //		@group	positioning, sizing
    //		
    //		@return	(Array)		[left, top, width, height]
    // @visibility external
    //<
    getRect : function () {
	    return [this.getLeft(), this.getTop(), this.getVisibleWidth(), this.getVisibleHeight()];
    },
  
    //>	@method	formItem.getPageRect()
    // Return the page-level coordinates of this object as a 4 element array.
    //		@group	positioning, sizing
    //		
    //		@return	(Array)		[left, top, width, height]
    // @visibility external
    //<
    getPageRect : function (includeTitle) {
        if (includeTitle) return this.getPageRectIncludingTitle();
        return [this.getPageLeft(), this.getPageTop(), 
                this.getVisibleWidth(), this.getVisibleHeight()];
    },

    getPeerRect : function () {
        return this.getPageRect();
    },
    
    getPageRectIncludingTitle : function () {
        var left = this.getPageLeft(),
            top = this.getPageTop(),
            width = this.getVisibleWidth(),
            height = this.getVisibleHeight();
            
        if (this.showTitle) {
            var titleLeft = this.getTitlePageLeft(),
                titleTop = this.getTitlePageTop(),
                titleWidth = this.getVisibleTitleWidth(),
                titleHeight = this.form.getTitleHeight(this);
            if (this.titleOrientation == "left" || this.titleOrientation == null) {
                left = left < titleLeft ? left : titleLeft;
                width += titleWidth; 
            } else { // for the case titleOrientation = "top"
                left = left < titleLeft ? left : titleLeft;
                width = width > titleWidth ? width : titleWidth;
                if (isc.isA.Number(titleHeight)) {
                    height += titleHeight;
                    top -= titleHeight;
                }
            }
        }
        return [left, top, width, height];        
    },

    
    getCellHeight : function (reportOverflowedSize) {
        if (isc._traceMarkers) arguments.__this = this;
        
        if (this.cellHeight != null) {
            return this.cellHeight;
        }
        
        var height = this.getHeight(reportOverflowedSize);
        if (!isc.isA.Number(height)) return height;

        // never report a height lower than that required by our visible icons
        // (these are our external icons - not our picker icon)
        var iconsHeight = this.getIconsHeight();
        if (height < iconsHeight) {
            height = iconsHeight;
        }
        
        // If we are showing a picker icon, and it has a specified height, that may also cause
        // our height to be larger than expected.
        // If no specified height, sized to fit in available space, so won't expand the item.
        if (this.pickerIconHeight && this._pickerIconVisible()) { 
            var pickerIconHeight = this.pickerIconHeight + this._getPickerIconVPad();
            if (pickerIconHeight > height) height = pickerIconHeight;
        }

        var form = this.containerWidget;
        if (this._absPos() || !isc.isA.DynamicForm(form)) return height;

        height += this._getCellVBorderPadSpacing();
        
        // If titleOrientation is TOP, and we're showing a title, add our title height to our
        // reported cellHeight, so tableLayoutPolicy code will take it into account
        
        if (this.showTitle && this.form.getTitleOrientation(this) == isc.Canvas.TOP) {
            height += this.form.getTitleHeight(this);
        }
        return height;
    },
    // Forms only write a height into the cell containing the form item if shouldFixRowHeight
    // is true.
    // If we have an explicit cellHeight specified, consider the height of this item "fixed"!
    // If we have an explicit height but are not applying it to the text box, also apply
    // the height to the cell.
    shouldFixRowHeight : function () {
        return this.cellHeight != null || 
            (!this.shouldApplyHeightToTextBox() && this.getHeight() != null);
    },
    
    // Returns the space taken up around this form item by the cell (determined from
    // cellSpacing, border and padding).
    _getCellVBorderPadSpacing : function () {
    
        var height = 0,
            form = this.form,
            cellStyle = this.getCellStyle();

        // For items written into containerIems, cellSpacing/padding will be defined on the
        // parent item, not the form.
        if (this.parentItem) form = this.parentItem;            
            
        // Spacing around cells (above and below)
        height += 2*form.cellSpacing;            
    
        
        var cellPadding = isc.isA.Number(form.cellPadding) ? form.cellPadding : 0,
            paddingTop = isc.Element._getTopPadding(cellStyle, true);
        if (paddingTop == null) paddingTop = cellPadding
        
        var paddingBottom = isc.Element._getBottomPadding(cellStyle, true);
        if (paddingBottom == null) paddingBottom = cellPadding;
        
        height += paddingTop;
        height += paddingBottom;
        height += isc.Element._getVBorderSize(cellStyle);
        
        return height;
    },
    _getCellHBorderPadSpacing : function () {
    
        var height = 0,
            form = this.form,
            cellStyle = this.getCellStyle();
        
        // For items written into containerIems, cellSpacing/padding will be defined on the
        // parent item, not the form.
        if (this.parentItem) form = this.parentItem;
            
        // Spacing around cells (above and below)
        if (isc.isA.Number(form.cellSpacing)) height += 2*form.cellSpacing;            
    
        
        // We have seen a case where a developer set form.cellPadding to a string 
        // ("2" rather than 2), which led to us assembling an inappropriate string like "0220"
        // in this method. If cellPadding is specified as a string just ignore it.
        var formCellPadding = isc.isA.Number(form.cellPadding) ? form.cellPadding : 0,
            paddingLeft = isc.Element._getLeftPadding(cellStyle, true);
        if (paddingLeft == null) paddingLeft = formCellPadding;
        
        var paddingRight = isc.Element._getRightPadding(cellStyle, true);
        if (paddingRight == null) paddingRight = formCellPadding;
        
        height += paddingLeft;
        height += paddingRight;
        height += isc.Element._getHBorderSize(cellStyle);
        
        return height;
    },

    //>@method  FormItem.getInnerHeight()   
    // Returns the available space for content of this FormItem, based on the specified
    // height for the item, and any styling.
    // @return (number) height in px.
    //<
    // This method returns the space within the cell derived either from item.cellHeight
    // (less padding etc), or item.height.
    // This means if you have both item.height and item.cellHeight specified, the
    // cellHeight is used.
    // Implementation note: We actually look at item._size in this method - that's set 
    // up by logic at the DynamicForm level which feeds the items into the 
    // TableResizePolicy which in turn calls item.getCellHeight() to figure out
    // the heights.
    
    
    getInnerHeight : function () {
        var form = this.containerWidget;

        if (this._absPos()) return this._getPercentCoord(this.height, true);

        // If we've never run through stretch-resize-policy, this.height/width may be
        // specified as a string.
        // If we're being written out as standalone item HTML in a non-form containerWidget,
        // give that widget a chance to size the item (resolving "*" etc sizes)
        
        if (this._size == null && this.height != null && isc.isA.String(this.height) &&
            this.containerWidget && !isc.isA.DynamicForm(this.containerWidget) &&
            this.containerWidget.sizeFormItem != null)
        {
            this.containerWidget.sizeFormItem(this);
        }

        
        if (this._size) {            
            var height = this._size[1];
            if (!isc.isA.Number(height)) return height;
            
                            
            if (this._writtenIntoCell()) {
                height -= this._getCellVBorderPadSpacing();
            }
            return height;
        }
        return this.getHeight();
    },

    
    getInnerWidth : function (adjustForIcons) {
        var form = this.containerWidget;

        if (this._absPos()) return this._getPercentCoord(this.width);
        
        // If we've never run through stretch-resize-policy, this.height/width may be
        // specified as a string.
        // If we're being written out as standalone item HTML in a non-form containerWidget,
        // give that widget a chance to size the item (resolving "*" etc sizes)
        
        if (this._size == null && this.width != null && isc.isA.String(this.width) &&
            this.containerWidget && !isc.isA.DynamicForm(this.containerWidget) &&
            this.containerWidget.sizeFormItem != null)
        {
            this.containerWidget.sizeFormItem(this);
        }

        var width = this._size ? this._size[0] : this.width;

        // happens if StretchResize hasn't been run and size is specified as eg "*".  In this
        // case the FormItem may not handle the size in string form anyway, but we shouldn't
        // try to do math on it.
        if (!isc.isA.Number(width)) {
            return width;
        }
        // _size refers to the total area taken up by this items cell - to get the innerWidth
        // (available for the item and it's icons), deduct the border / padding / spacing
        // of the cell)
                        
        if (this._writtenIntoCell()) {        
            width -= this._getCellHBorderPadSpacing();
        }
        return width;
    },
    
    // getColWidth()
    // If this item is being written into a standard dynamic form cell, determine the width for
    // the column this item is written into.
    
    getColWidth : function () {
        var items = this.form ? this.form.items : null;
        if (items && items._colWidths != null && this._tablePlacement != null) {
            // this._tablePlacement stored as [startCol, startRow, endCol, endRow]
            var startCol = this._tablePlacement[0],
                endCol = this._tablePlacement[2];
            if (this.showTitle) {
                var titleOrientation = this.getTitleOrientation();
                if (titleOrientation == isc.Canvas.LEFT) startCol += 1;
                else if (titleOrientation == isc.Canvas.RIGHT) endCol -= 1;
            }
            var width = 0;
            for (var c = startCol; c < endCol; c++) {
                width += items._colWidths[c];
            }
            return width;
        }
        return null;
    },

    // overridable APIs used by Canvas.applyTableResizePolicy()
    getMaxHeight : function () {
        return this.maxHeight;
    },
    getMinHeight : function () {
        return this.minHeight;
    },
    
    _absPos : function () {
        return (this.containerWidget._absPos && this.containerWidget._absPos());
    },
    
    _writtenIntoCell : function () {
        return (this.containerItem != null || 
                (this.form == this.containerWidget && !this._absPos()));
    },
    // percent coordinate interpretation for absPos forms
    _$percent:"%",
    _getPercentCoord : function (coord, vertical) {
        // decided against since this re-interprets the default size of "*" for many items
        //if (coord == "*") coord = "100%"; 
        if (isc.isA.String(coord) && isc.endsWith(coord, this._$percent)) {
            var parent = this.containerWidget,
                parentSize = vertical ? parent.getInnerHeight() : parent.getInnerWidth();
            return Math.round((parseInt(coord, 10) / 100) * parentSize);
        }
        return coord;
    },

    
    getElementWidth : function () {
    
        // If we're fitting horizontally to a valueIcon, just return enough space to
        // accommodate it, plus the picker-icon
        
        if (this.fitWidthToValueIcon() && this.showValueIconOnly) {
            var width = this._getValueIconAndPadWidth();
            
            width += this.getPickerIconHSpace();
            
            return width;
        }
    
        var width = this.getInnerWidth();
        
        if (!isc.isA.Number(width)) return null;
        width -= this.getTotalIconsWidth();

        return (isc.isA.Number(width) ? Math.max(width, 1) : null);
    },
    
    getPickerIconHSpace : function () {   
        var width = 0;
        if (this.showPickerIcon) {
            if (this._pickerIconVisible()) {
                width += this.getPickerIconWidth();
            }
            // Additional horizontal space required due to hspace / border/padding on style
            var iconProps = this.getPickerIcon();
            if (iconProps.hspace != null) width += iconProps.hspace;

            if (this.pickerIconStyle) 
                width += isc.Element._getHBorderPad(this.getPickerIconStyle());

            if (this.controlStyle) {
                width += isc.Element._getHBorderPad(this.getControlStyle());
            }
        }
        return width;
    },
        
    
    // getTextBoxWidth() / height()
    // returns the size of the text box (used for writing out HTML - not retrieved by looking at
    // the DOM element in question).    
    
    
    getTextBoxWidth : function (value) {
    
        // If we're fitting horizontally to a valueIcon, just return enough space to
        // accommodate it.
        
        if (this.fitWidthToValueIcon() && this.showValueIconOnly) {
            // So return enough space for the valueIcon
            return this._getValueIconAndPadWidth();
        }
        var basicWidth = this.getElementWidth();
        if (!isc.isA.Number(basicWidth)) return basicWidth;

        var className = this.getTextBoxStyle();
        if (className != null) {
            basicWidth -= (isc.Element._getLeftMargin(className) +
                           isc.Element._getRightMargin(className));
            if (this._sizeTextBoxAsContentBox()) {
                basicWidth -= isc.Element._getHBorderPad(className);
            }
        }

        // we currently suppress the pickerIcon/control table when printing
        if (!this._isPrinting() && this._writeControlTable() && this.controlStyle) {
            basicWidth -= isc.Element._getHBorderPad(this.getControlStyle());
        }
        if (this._pickerIconVisible()) {
            basicWidth -= this.getPickerIconWidth();
            var iconProps = this.getPickerIcon();
            if (iconProps.hspace != null) basicWidth -= iconProps.hspace;
            
            if (this.pickerIconStyle) 
                basicWidth -= isc.Element._getHBorderPad(this.getPickerIconStyle());
        }
        
        basicWidth -= this._leftInlineIconsWidth + this._rightInlineIconsWidth;
        
        
        if (this.hasDataElement() && this._getValueIcon(value)) {
            basicWidth -= ((this.getValueIconWidth() || 0) + 
                                    (this.valueIconLeftPadding + this.valueIconRightPadding));
        }

        // reduce by error width for left or right-oriented errors
        return basicWidth - this._getErrorWidthAdjustment();
    },
    
    // Return the width of the text box as it appears to the user - used to determine 
    // geometry for absolutely floated inline icons
    getLogicalTextBoxWidth : function () {
        var width = this.getElementWidth();
        if (this.showPickerIcon) width -= this.getPickerIconHSpace();
        return width;
    },

    // anticipated width of the error message, if we are showing errors on the left or right
    getErrorWidth : function () {
        // If we are showing errors on the left/right we should adjust the textBox size to account
        // for them. We don't know how long the error strings will be and it's ok for them to wrap
        // so make the default space we leave for them configurable at the item level
        var errorWidth = 0;
        if (this.form.showInlineErrors && this.hasErrors()) {
            var orientation = this.getErrorOrientation();
            if (orientation == isc.Canvas.LEFT || orientation == isc.Canvas.RIGHT) {
                if (this.shouldShowErrorText()) {
                    errorWidth += this.errorMessageWidth;
                } else if (this.shouldShowErrorIcon()) {
                    
                    errorWidth += this.errorIconWidth + this.iconHSpace;
                }
            }
        }
        return errorWidth;
    },
    
    // _getErrorWidthAdjustment
    // If we're showing horizontal-orientated error text/icon - how much do we need to reduce
    // the text box's rendered size by to leave space for the error text
    _getErrorWidthAdjustment : function () {
        var errorWidth = this.getErrorWidth();
        if (errorWidth != 0 && this.expandHintAndErrors && (this.getColWidth() != null)) {
            var additionalColSpace = this.getColWidth() - this.getInnerWidth();
            if (additionalColSpace > 0) errorWidth -= additionalColSpace;
            // don't allow the value to go negative
            if (errorWidth < 0) errorWidth = 0;
        }
        return errorWidth;
    },
    

    

    //> @attr formItem.errorMessageWidth (int : 80 : IRW)
    // When +link{dynamicForm.showInlineErrors} and +link{showErrorText} are both true and
    // +link{errorOrientation} is "left" or "right", errorMessageWidth is the amount to reduce
    // the width of the editor to accommodate the error message and icon.
    // @group validation
    // @visibility external
    //<
    errorMessageWidth:80,

    //> @attr formItem.applyHeightToTextBox (Boolean : null : IRA)
    // If +link{formItem.height} is specified, should it be applied to the
    // item's text box element?
    // <P>
    // If unset, behavior is determined as described in +link{shouldApplyHeightToTextBox()}
    // @visibility external
    //<

    //> @method formItem.shouldApplyHeightToTextBox() [A]
    // If +link{formItem.height} is specified, should it be applied to the
    // item's text box element? If this method returns false, the
    // text box will not have an explicit height applied, though the containing cell
    // will be sized to accommodate any specified height.
    // <P>
    // This is used in cases where the text box does not have distinctive styling
    // (for example in standard +link{StaticTextItem}s). As the textBox has no explicit
    // height, it fits the content. Since the text box is not visually distinct to 
    // the user, this makes +link{formItem.vAlign} behave as expected with the 
    // text value of the item being vertically aligned within the cell.
    // <P>
    // Default implementation will return +link{applyHeightToTextBox} if explicitly set
    // otherwise <code>false</code> if +link{readOnlyDisplay} is set to 
    // <code>"static"</code> and the item is +link{getCanEdit(),not editable}, otherwise
    // true.
    // @return (boolean) true if the height should be written into the items' text box.
    // @visibility external
    //<
    shouldApplyHeightToTextBox : function () {
        if (this.applyHeightToTextBox != null) return this.applyHeightToTextBox;
        if (this.renderAsStatic()) return !!this.clipStaticValue;
        return true;
    },
    
    getTextBoxHeight : function (value) {
        
        if (!this.shouldApplyHeightToTextBox()) {
            return null;
        }
        
        var basicHeight = this.getPixelHeight(true);
        if (!isc.isA.Number(basicHeight)) return basicHeight;
        
        
        var className = this.getTextBoxStyle();
        if (className != null) {
                            
            basicHeight -= (isc.Element._getTopMargin(className) + 
                            isc.Element._getBottomMargin(className));
            if (this._sizeTextBoxAsContentBox()) {
                basicHeight -= isc.Element._getVBorderPad(className);
            }
        }
        // If we're writing out a control box we also have to adjust the height for the control
        // box's styling
        if (this._writeControlTable() && this.controlStyle) {
            basicHeight -= isc.Element._getVBorderPad(this.getControlStyle());
        }
        
        
        if (this.showTitle && this.form.getTitleOrientation(this) == isc.Canvas.TOP &&
            !isc.isA.Number(this.getCellHeight())) 
        {
            basicHeight -= this.form.getTitleHeight(this);
        }
        
        return basicHeight;
    },
    
    
    _sizeTextBoxAsContentBox : function () {
        return !isc.Browser.isBorderBox;
    },


    // getTextPickerIconWidth() / height()
    // returns the size of the picker icon's cell (used for writing out HTML - not retrieved by looking at
    // the DOM element in question).
    // Called from getPickerIcon()
    getPickerIconWidth : function () {
        var width = this.pickerIconWidth != null ? this.pickerIconWidth : this.getPickerIconHeight(true);
        if (width == null) width = this.iconWidth;
        return width;
    },
    
    getPickerIconHeight : function (dontReturnIconHeight) {
        if (this.pickerIconHeight != null) return this.pickerIconHeight;
        else {
            var height = (isc.isA.Number(this.getHeight()) ? this.getHeight() : this.getInnerHeight());
            if (!dontReturnIconHeight && height == null) return this.iconHeight;
            if (!isc.isA.Number(height)) return null;

            height -= this._getPickerIconVPad();

            this.pickerIconHeight = height;
            return height;
        }
    },

    // Vertical padding between the picker icon and the outer table
    _getPickerIconVPad : function () {
        
        var pad = 0;
        if (this.controlStyle){
            pad += isc.Element._getVBorderPad(this.controlStyle);
        }
        if (this.pickerIconStyle) {
            pad += isc.Element._getVBorderPad(this.pickerIconStyle);
        }
        return pad;
    },
    
	//>	@method	formItem.getHeight()	(A)
	//	Output the height for this element
	// @group	sizing
	// @return	(int | String)	height of the form element
	//<
	getHeight : function () {
	    return (this.renderAsStatic() ? (this.staticHeight || this.height) : this.height);
	},
	
    //> @method formItem.getPixelHeight()
    // Returns the specified +link{formItem.height} of this formItem in pixels. 
    // For heights specified as a percentage value or <code>"*"</code>, the 
    // pixel height may not be available prior to the item being drawn. In cases where
    // the height has not yet been resolved to a pixel value, this method will return
    // <code>-1</code>.
    // @return (int) Specified height resolved to a pixel value.
    // @visibility external
    //<
    // returnRawHeight parameter used internally
    getPixelHeight : function (returnRawHeight) {
        var basicHeight = this.getHeight();
        
        if (!isc.isA.Number(basicHeight)) {
            var innerHeight = this.getInnerHeight();
            if (this.cellHeight != null && isc.isA.String(basicHeight) && 
                basicHeight.endsWith("%")) 
            {
                var percentHeight = parseInt(basicHeight);
                if (isc.isA.Number(innerHeight)) {
                    basicHeight = Math.round(innerHeight * (percentHeight/100));
                } else {
                    basicHeight = innerHeight;
                }
            } else {
                basicHeight = innerHeight;
            }
        }
        if (!isc.isA.Number(basicHeight)) return returnRawHeight ? basicHeight : -1;
        
        // If we're showing a valueIcon, adjust the textBox height to accommodate it if necessary
        if (this.valueIcons != null || this.getValueIcon != null) {
            var valueIconHeight = this.getValueIconHeight();
            if (valueIconHeight > basicHeight) basicHeight = valueIconHeight;
        }
        return basicHeight;
    },

    //>	@method	formItem.getVisibleHeight()	(A)
	//	Output the drawn height for this item in pixels.
    //  Note: this is only reliable after this item has been written out into the DOM.
	//		@group	sizing
	//		@return (Integer)	height of the form item
	// @visibility external
	//<    
    // this returns the height of the outer table for the item 
    getVisibleHeight : function () {
        var element = this.isDrawn() ? this.getOuterElement() : null;
        if (element == null) {
            this.logInfo("getVisibleHeight() - unable to determine drawn height for this item -" +
                         " returning pixel height from specified height", "sizing");
            if (isc.isA.Number(this.height)) {
                return this.height;
            } 
           
            this.logWarn("getVisibleHeight() unable to determine height - returning zero", 
                         "sizing");
            return 0;        
        }
        
        return element.offsetHeight;    
    },

    //>	@method	formItem.getIconHeight()	(A)
	//	Takes an icon definition object, and returns the height for that icon in px.
	//		@group	sizing
    //      @param  icon (Object)   icon definition object for this item.
	//		@return	(int)	height of the form item icon in px
    //      @visibility external    
	//<
    getIconHeight : function (icon) {
        // default to the first icon, if possible
        if (icon == null && this.icons != null && this.icons.getLength() > 0) icon = this.icons[0];
        else if (!this._isValidIcon(icon)) {
            this.logWarn("getIconHeight() passed invalid icon:" + isc.Log.echoAll(icon));
            return null;
        }
        
        // Note: we could actually look at the icon element in the DOM, (if it's drawn)
        // but we have full control over the HTML written into form item icons, so this value 
        // should always match the specified size for the icon.
        return (icon.height != null ? icon.height : this.iconHeight);

    },

    getTitleVisibleHeight : function () {
        var titleElement = this.isDrawn() && this.form
                                          ? isc.Element.get(this.form._getTitleCellID(this)) 
                                          : null;
        if (titleElement == null) {
            var warning = "getTitleHeight() Unable to determine position for " + 
                          (this.name == null ? "this item " : this.name) + ". ";
            if (this.isDrawn()) {
                warning += "This method is not supported by items of type " + this.getClass();
            } else {
                warning += "Position cannot be determined before the element is drawn"
            }
            warning += " - returning zero.";
            
            this.form.logWarn(warning);
            return 0;
        }
        return isc.Element.getVisibleHeight(titleElement);
    },
    

	//>	@method	formItem.getWidth()	(A)
	//	Output the width for this element. Note this returns the specified width for the 
    //  element, which may be "*" or a percentage value. Use 'getVisibleWidth()' to get the
    //  drawn width in pixels.
	// @group	sizing
	// @return	(int | String)	width of the form element
	// @visibility external
	//<
	getWidth : function () {
		return this.width;
	},
	
    //> @method formItem.getPixelWidth()
    // Returns the specified +link{formItem.width} of this formItem in pixels. 
    // For widths specified as a percentage value or <code>"*"</code>, the 
    // pixel width may not be available prior to the item being drawn. In cases where
    // the width has not yet been resolved to a pixel value, this method will return
    // <code>-1</code>.
    // @return (int) Specified width resolved to a pixel value.
    // @visibility external
    //<
    
    getPixelWidth : function () {
        var basicWidth = this.getWidth();
        if (!isc.isA.Number(basicWidth)) {
            var innerWidth = this.getInnerWidth();
            if (innerWidth != null) {
                basicWidth = innerWidth;
                // add the HBorderSize to the innerWidth - as noted above this method, there's
                // otherwise a difference in width, and this causes a redraw, and a run through
                // setValue/setCriterion, via form.setItemValues()
                basicWidth += isc.Element.getHBorderSize(this.getHandle());
            }
        }
        return isc.isA.Number(basicWidth) ? basicWidth : -1;
    },
 
    //>	@method	formItem.getVisibleWidth()	(A)
	//	Output the drawn width for this item in pixels. This method is only reliable after
	//  the item has been drawn into the page.
	//		@group	sizing
	//		@return (Integer)	width of the form item
	// @visibility external
	//<    
    
    getVisibleWidth : function () {
        var element = this.isDrawn() ? this.getOuterElement() : null;
        if (element == null) {
            this.logInfo("getVisibleWidth() - unable to determine drawn width for this item -" +
                         " returning pixel width from specified width", "sizing");
            if (isc.isA.Number(this.width)) {
                return this.width;
            // HACK: stretchResizePolicy is run on the form when writing out items into the DOM
            // this will resolve non numeric (* and percentage) sizes to pixel widths, and store
            // the specified column sizes on the items object as _colWidths.  If this is present
            // return the appropriate numeric value.
            } else if (this.form && this.form.items._colWidths != null) {
                return this.getColWidth();
            }
        
            this.logWarn("getVisibleWidth() unable to determine width - returning zero", 
                         "sizing");
            return 0;        
        }
        
        return element.offsetWidth;
    },
    
    //>	@method	formItem.getVisibleTitleWidth()	(A)
	//	Returns the visible width of this item's title in px.  If that is not applicable (for 
    // example, the form item has no title) or cannot be determined (for example, the form 
    // is not drawn), returns 0.
	//		@group	sizing
    //      @param  labelOnly (Boolean) If true, returns the visible width of the title text
    //                                  only; if false (the default) returns the width of the 
    //                                  title cell
	//		@return	(number)	width of the form item's title in px
    //      @visibility external    
	//<
    getVisibleTitleWidth : function (labelOnly) {
        if (labelOnly) {
            var element = isc.Element.get(this._getTitleLabelID());
            if (element == null) {
                this.logInfo("getVisibleTitleWidth() was called with labelOnly: true, but this " +
                             "item (" + this.getID() + ") has no label element.  Returning the " +
                             "width of the containing cell, as if labelOnly were false");
            } else {
                return element.offsetWidth;
            }
        }
        var element = this.isDrawn() && this.form
                                     ? isc.Element.get(this.form._getTitleCellID(this)) 
                                     : null;
        if (element == null) {
            this.logInfo("getVisibleTitleWidth() - unable to determine drawn width for this " +
                         "item - returning 0", "sizing");
            return 0;        
        }
        
        return element.offsetWidth;
    },

    _$labelSuffix: "_label",
    _getTitleLabelID : function () {
        return this.getID() + this._$labelSuffix;
    },
    
    //>	@method	formItem.getIconWidth()	(A)
	//	Takes an icon definition object, and returns the width for that icon in px.
	//		@group	sizing
    //      @param  icon (Object)   icon definition object for this item.
	//		@return	(int)	width of the form item icon in px
    //      @visibility external    
	//<
    getIconWidth : function (icon) {
        // default to the first icon, if possible
        if (icon == null && this.icons != null && this.icons.getLength() > 0) icon = this.icons[0];
        else if (!this._isValidIcon(icon)) {
            this.logWarn("getIconWidth() passed invalid icon:" + isc.Log.echoAll(icon));
            return null;
        }
        
        // Note: we could actually look at the icon element in the DOM, (if it's drawn)
        // but we have full control over the HTML written into form item icons, so this value 
        // should always match the specified size for the icon.
        return (icon.width != null ? icon.width : this.iconWidth);

    },
    
    //> @method formItem.setHeight()    (A)
    // Set the height for this element
    // @group  sizing
    // @param    (int | String)    new height for the form element
    //<
    setHeight : function (height) {
        if("100%" == height) {
        	this.height = "*";    		
    	} else {
    		this.height = height;
    	}
        // redraw the item (default implementation notifies the container widget that the item
        // needs redrawing)
        this.redraw();
    },
    
    //> @method formItem.setWidth()    (A)
    // Set the width for this element
    // @group  sizing
    // @param    (int | String)    new width for the form element
    //<
    setWidth : function (width) {
        // Optimizations: avoid redrawing if the width (whether supplied as an explicit
        // pixel value or a dynamic string) is unchanged
        if (width == this.width) return;
        var oldWidth = this.getPixelWidth();
        
        if("100%" == width) {
        	this.width = "*";    		
    	} else {
    		this.width = width;
    	}
        
        if (oldWidth == this.getPixelWidth()) return;

        this.redraw();

    },

    //> @method formItem.setLeft()    (A)
    // For a form with +link{DynamicForm.itemLayout,itemLayout}:"absolute" only, set the left
    // coordinate of this form item.
    // <P>
    // Causes the form to redraw.
    // @visibility absForm
    //<
    setLeft : function (left) {
        this.left = left;
        this.redraw();
    },
    //> @method formItem.setTop()    (A)
    // For a form with +link{DynamicForm.itemLayout,itemLayout}:"absolute" only, set the top
    // coordinate of this form item.
    // <P>
    // Causes the form to redraw.
    // @visibility absForm
    //<
    setTop : function (top) {
        this.top = top;
        this.redraw();
    },
    
    //> @method formItem.moved()    (A)
    // The container widget is responsible for writing the HTML for form items into the DOM.
    // This is a notification function fired by the container items on form items when their
    // global position changes.
    //<
    moved : function () {
        // No default implementation - can be overridden / observed as required.
    },
    
    //> @method formItem.visibilityChanged()    (A)
    // The container widget is responsible for writing the HTML for form items into the DOM.
    // This is a notification function fired by the container items on form items when they are
    // hidden or shown on the page.  May be caused by parent show() / hide(), or calls to
    // showItem / hideItem.
    //<
    
    visibilityChanged : function () {
        // No default implementation - can be overridden / observed as required.
    },
    
    //> @method formItem.zIndexChanged()    (A)
    // The container widget is responsible for writing the HTML for form items into the DOM.
    // This is a notification function fired by the container items on form items when their
    // zIndex is modified on the page.  
    //<
    zIndexChanged : function () {
        // No default implementation - can be overridden / observed as required.
    },
    
    // HTML generation: element, errors, icons and hints
	// --------------------------------------------------------------------------------------------


    //> @method formItem.getInactiveEditorHTML()
    // This method returns a non-interactive HTML representation of this formItem
    // The HTML may be rendered multiple times on the same page and will not include 
    // standard unique DOM identifiers or error handling.
    // Used by ListGrids for +link{ListGrid.alwaysShowEditors} type functionality.
    // @param includeHint (boolean) passed through to getStandaloneItemHTML
    // @param includeErrrs (boolean ) passed through to getStandaloneItemHTML
    // @param [context] (Any) optional arbitrary context for the inactive HTML. This will 
    //  allow us to associate a chunk of HTML with information about the calling code such
    //  as which cell this inactive HTML was written out into in a grid, etc.
    //<
    getInactiveEditorHTML : function (value, includeHint, includeErrors, context) {
        this._retrievingInactiveHTML = true;

        
        // call 'setupInactiveContext()' to generate a new 'inactiveContext' ID and
        // associate any passed in context with it.
        
        this._currentInactiveContext = this.setupInactiveContext(context);
        if (this.logIsDebugEnabled("inactiveEditorHTML")) {
            this.logDebug("getInactiveEditorHTML() called - context passed in:" + this.echo(context) +
                    " generated context ID:" + this._currentInactiveContext, "inactiveEditorHTML");
        }
        
        this._resolveIconsVisibility();

        var HTML = this.getStandaloneItemHTML(value, includeHint, includeErrors);
        delete this._currentInactiveContext;
        delete this._retrievingInactiveHTML;
        return HTML;
    },
    
    // creates a directory of the 'inactiveHTML' contexts we were passed.
    // Returns a unique identifier by which the context was indexed. Also used
    // to create unique DOM IDs for inactive elements
    
    // Use an object rather than an array for the directory - easier to delete spots that
    // are no longer required.
    
    //_inactiveDirectory:null,
    _currentInactiveContextIDCount:1,
    setupInactiveContext : function (context) {
        
        if (context == null) context = {};
        if (this._isPrinting()) context.isPrintHTML = true;
        
        var ID = this._currentInactiveContextIDCount++;
        
        // store the ID directly on the context object so we can manage the directory with just
        // the context object to refer us back to where it's stored!
        context.inactiveContextID = ID;
        context.formItem = this;
        
        // This is important: Don't share a single object across form items
        // Also this._inactiveDirectory == null is a quick check for never
        // having rendered any inactive items 
        if (!this._inactiveDirectory) this._inactiveDirectory = {};
        this._inactiveDirectory[ID] = context;
        return ID;
    },
    
    // helper to delete inactive context?
    clearAllInactiveEditorContexts : function () {
        delete this._inactiveDirectory;
    },
    
    clearInactiveEditorContext : function (context) {
        if (isc.isAn.Object(context)) context = context.inactiveContextID;
        if (this._inactiveDirectory) delete this._inactiveDirectory[context];
        
    },
    
    // based on a live element in the DOM, determine which (if any) inactiveContext
    // it's associated with by looking at the ID
    
    _$inactiveContextParsingRegex:new RegExp(".*_inactiveContext(.*)$"),
    _getInactiveContextFromElement : function (element) {
        if (element && element.id != null && this._inactiveDirectory != null) {
            var id = element.id,
                partName = this._getDOMPartName(id);
            
            if (partName) {
                var inactiveContext = partName.match(this._$inactiveContextParsingRegex);
                if (inactiveContext) {
                    return this.getInactiveContext(inactiveContext[1]);
                }
            }
        }
        return null;
    },
    getInactiveContext : function (contextID) {
        return this._inactiveDirectory[contextID];
    },

    // Are we retrieving inactive HTML?
    // This includes the HTML we'll render out into the print window, and 
    // the [what?]
    isInactiveHTML : function () {
        
        if (this.parentItem && this.parentItem.isInactiveHTML()) return true;
        return this._isPrinting() || this._retrievingInactiveHTML;
    },
    
    _isPrinting : function () {
        return this.containerWidget && this.containerWidget.isPrinting;
    },
    
    // Should we write 'nowrap' into the cell containing this item
    _cellNoWrap : function () {
        return false;
    },

    //> @method formItem.getStandaloneItemHTML()   (A)
    // This method returns the HTML for any form item not being written into a standard 
    // DynamicForm's table. It allows other widgets to embed form items in their HTML without
    // having to have a DynamicForm as a child.
    //      @group drawing
    //      @return         (HTMLString)      HTML output for this standalone item's element
    //      @visibility internal
    //<
    // For a widget (other than a DynamicForm) to embed form items, the other widget must
    // - Define a form for it's "standalone" items to belong to.
    // - set the 'containerWidget' property on the form item[s] it wants to write out
    // - use this method to get the HTML for the form item
    // - call 'drawn()' when the HTML for the item has been written out
    // - call 'cleared()' when the HTML for the item is removed from the DOM
    // - call 'redrawn()' when the HTML for the item is re-written in the DOM
    // This is used by the ListGrid to show the edit form items within cells.
    
    _$absDivStart:"<DIV STYLE='position:absolute;z-index:",
    _$semiLeftColon:";left:",
    _$pxSemiTopColon:"px;top:",
    _$pxSemiWidthColon:"px;width:",
    _$pxSemiHeightColon:"px;height:",
    _$pxSemiIDEquals:"px;' ID='",
    _$quoteRightAngle:"'>",
    _$absDivEnd:"</DIV>",
    
    _$standaloneStartTemplate:[
        "<SPAN style='",        // [0]
        ,                       // [1] wrapCSS 
        "' eventProxy=",        // [2]
        ,                       // [3] formID
            // this 'containsItem' property may be used to determine which
            // form item events (passed to the form) occurred over.
            
        " " + isc.DynamicForm._containsItem + "='",             // [4]
        ,                                                       // [5] itemID
        "' ID='",                                               // [6]
        ,                                                       // [7] ID for span
        "'>"                                                    // [8]
    ],
    getStandaloneItemWrapCSS : function () {
        return "white-space:nowrap;"
    },
    _$standaloneEnd:"</SPAN>",
    _$standaloneSpan:"_standaloneSpan",
    getStandaloneItemHTML : function (value, includeHint, includeErrors) {
        // Write a span around the item with this form's ID as the eventProxy -- this ensures
        // that events are handled by the form rather than whatever the next parent canvas is
        var output = isc.SB.create(),
            form = this.form;
        
        // output a <SPAN> so the EventHandler recognizes which form this item belongs to
        if (form) {
            if (this._absPos()) {
                var left = this._getPercentCoord(this.left), 
                    top = this._getPercentCoord(this.top, true),
                    width = this.getInnerWidth(),
                    height = this.getInnerHeight();
                if (!isc.isA.Number(left)) left = 0;
                if (!isc.isA.Number(top)) top = 0;
                output.append(this._$absDivStart);
                
                output.appendNumber(isc.Canvas._nextZIndex);
                output.append(this._$semiLeftColon);
                output.appendNumber(left);
                output.append(this._$pxSemiTopColon);
                output.appendNumber(top);
                
                if (isc.isA.Number(width)) {
                    output.append(this._$pxSemiWidthColon);
                    output.appendNumber(width);
                }
                if (isc.isA.Number(height)) {
                    output.append(this._$pxSemiHeightColon);
                    output.appendNumber(height);
                }
                output.append(this._$pxSemiIDEquals, this._getAbsDivID(), this._$quoteRightAngle);
            }
            
            var template = this._$standaloneStartTemplate,
                formID = form.getID(),
                itemID = this.getID();
            
            template[1] = this.getStandaloneItemWrapCSS();
            template[3] = formID;
            template[5] = itemID;
            
            template[7] = this._getDOMID(this._$standaloneSpan);

            output.append(template);


                        
            output.append(this.getInnerHTML(value, includeHint, includeErrors, true));
            
            if (this.addContentToStandaloneFormProxy) output.append(" ");
            output.append(this._$standaloneEnd);
            
            if (this._absPos()) {
                output.append(this._$absDivEnd); 
            }
        }
        // return and relese the buffer so it can be reused  
        return output.release(false);
    },
    addContentToStandaloneFormProxy:isc.Browser.isChrome,
    
    _$absDiv:"_absDiv",
    _getAbsDivID : function () {
        return this._getDOMID(this._$absDiv);
    },
    
    // cache the absolute div (when 'cleared()' fires this will get cleared)
    getAbsDiv : function (ignoreDrawnCheck) {
        if (this._absDiv) return this._absDiv;
        var isDrawn = this.isDrawn();
        if (!ignoreDrawnCheck && !isDrawn) return;
        var absDiv = isc.Element.get(this._getAbsDivID());
        if (isDrawn) this._absDiv = absDiv;
        return absDiv;
    },

    _hasExternalIcons : function () {
        var icons = this.icons;
        if (!icons) return false;
        var allowInline = this._supportsInlineIcons();
        for (var i = 0; i < icons.length; i++) {
            if (allowInline && icons[i].inline) continue;
            if (!icons[i].writeIntoItem) return true; // found external icon
        }
        return false; // all icons internal
    },

    // -- Disabled item event mask --

    // In some browsers (seen in Moz), native mouse events (such as mousemove) are not generated
    // when the user moves over disabled native form item elements. 
    // If this form item is disabled, we write out a div floating over the native form item
    // so we can still get native mouse events and respond by showing hovers, etc.
    //
    // In IE, we get bogus native events (event.srcElement is an object that can't be
    // enumerated - crashes browser and all event properties produce error if poked) when the
    // mouse is over disabled text in textitems that can be fixed with this workaround
    useDisabledEventMask : function () {
        return ((isc.Browser.isMoz && this.hasDataElement()) ||
                (isc.Browser.isIE && isc.isA.TextItem(this))) &&
               this.getHeight() != null;
    },
    
    // When should we render the disabled eventMask out?
	renderDisabledEventMask : function () {
       return (this.isInactiveHTML() || this.isDisabled()) && this.useDisabledEventMask();
    },

    // Check whether element is disabled eventMask
    _isDisabledEventMaskElement : function (element) {
        if (!this.renderDisabledEventMask()) return false;
        return this._getEventMaskElement() != element;
    },
    
    
    _eventMaskTemplate:[
        "<DIV isDisabledEventMask='true' style='overflow:hidden;position:absolute;width:",
        null,   // 1 width
        "px;height:",
        null,   // 3 height
        //"px;border:1px solid red;' containsItem='", 
        "px' " + isc.DynamicForm._containsItem + "='",
        null,   // 5 item id
        "' " + isc.DynamicForm._itemPart + "='" + isc.DynamicForm._element + "' ID='",
        ,       // 7 ID for the element - so we can easily clear it from the DOM
        "'>",
        null,   // 9 spacerHTML - we'll lazily add a spacer here, otherwise a &nbsp; - 
                // this needs to be lazy to avoiding trying to load blank.gif before the skin 
                // is loaded
                
        "</DIV>"
    ],
    _getEventMaskHTML : function () {
        var template = this._eventMaskTemplate;
        template[1] = this._getEventMaskWidth();
        template[3] = this.getHeight();
        template[5] = this.getItemID();
        template[7] = this._getDOMID("eventMask");
        template[9] = this._getEventMaskSpacerHTML();

        return template.join(isc.emptyString);        
    },

    _getEventMaskSpacerHTML : function () {
        return isc.Canvas.spacerHTML(1600, 100)
    },

    _getEventMaskElement : function () {
        return isc.Element.get(this._getDOMID("eventMask"));
    },

    
    
    
    _getEventMaskWidth : function () {
        var width = this.getTextBoxWidth();
        if (width == null) {
            if (isc.RadioItem && isc.isA.RadioItem(this) && this.parentItem != null) {
                width = this.parentItem.getElementWidth();
            }

            if (width == null) return 0;
            
        } else {     
            // Shrink to account for error icons if necessary
            if (this.form.showInlineErrors && this.hasErrors()
                     && this.getErrorOrientation() == isc.Canvas.LEFT) 
            {
                width -= this.getErrorWidth();
            }
        }
        return width;
    },
    
    // Browser spell checking
    // Supported on 
    //  Moz Firefox 2.0 beta2 and above
    //  Safari (tested on 5.0)
    //  Chrome (tested on 5.0.375)
    //  Safari/iPad and Safari/iPhone
    // Untested on IE
    // Note: if browserSpellCheck is unset, we pick it up from the containing form item
    
    getBrowserSpellCheck : function () {
        if (this.browserSpellCheck != null) return this.browserSpellCheck;
        return this.form.browserSpellCheck;
    },
    
    // -- Hidden data element --
    
    // If this is an item with no native form element, but this form's value is being 
    // submitted directly to the server, we are going to need a hidden item in the form to 
    // represent its value.
    _useHiddenDataElement : function () {
        return (this.shouldSaveValue && !this.hasDataElement() && this.shouldSubmitValue());
    },
    
    // HTML for the hidden data element
    _$hiddenDataElement:"hiddenDataElement",
    _getHiddenDataElementID : function () {
        return this._getDOMID(this._$hiddenDataElement);
    },
    _getHiddenDataElement : function () {
        return this._getHTMLPartHandle(this._$hiddenDataElement);
    },
    
    _getHTMLPartHandle : function (part) {
        if (!this.isDrawn()) return null;
        
        if (!this._htmlPartHandles) this._htmlPartHandles = {};
    
        // Note: we free up this cache on 'cleared()' / 'redrawn()'
        var handle = this._htmlPartHandles[part];
        if (handle == null) {
            handle = isc.Element.get(this._getDOMID(part));
            if (handle != null) this._htmlPartHandles[part] = handle;
        }
        return handle;
    },

    _$control:"control",
    _getControlTableID : function () {
        return this._getDOMID(this._$control);
    },
    _getControlTableElement : function () {
        return this._getHTMLPartHandle(this._$control);
    },

    _$textBox:"textBox",
    _getTextBoxID : function () {
        return this._getDOMID(this._$textBox);
    },
    _getTextBoxElement : function () {
        if (this.hasDataElement() && this._dataElementIsTextBox && !this.renderAsStatic()) {
            return this.getDataElement();
        }
        return this._getHTMLPartHandle(this._$textBox);
    },

    _$inlineiconswrapper: "inlineiconswrapper",
    _getInlineIconsWrapperID : function () {
        return this._getDOMID(this._$inlineiconswrapper);
    },

    _getElementStyledAsTextBox : function () {
        if (this._haveInlineIcons() && this._inlineIconsMarkupApproach === "divStyledAsDataElement") {
            return this._getHTMLPartHandle(this._$inlineiconswrapper);
        } else {
            return this._getTextBoxElement();
        }
    },


    _$pickerIconCell:"pickerIconCell",
    _getPickerIconCellID : function () {
        return this._getDOMID(this._$pickerIconCell);
    },
    _getPickerIconCellElement : function () {
        return this._getHTMLPartHandle(this._$pickerIconCell);
    },


    _getHiddenDataElementHTML : function () {
        return "<INPUT type='hidden' name='" + 
                this.getFieldName() + "' ID='" + this._getHiddenDataElementID() + "'>";
    },

    _$hintCell:"hintCell",
    _getHintCellID : function () {
        return this._getDOMID(this._$hintCell);
    },
    _getHintCellElement : function () {
        return this._getHTMLPartHandle(this._$hintCell);
    },
    
    // Helper to update state when the user rolls onto / off the text-box
    updateStateForRollover : function () {

        this._updatePickerCellAndControlTableState();
        this._updateTextBoxState();

        var scEvent = isc.EH.lastEvent,
            itemInfo = scEvent.itemInfo,
            overItem = itemInfo && itemInfo.item,
            overIcon = (itemInfo && itemInfo.overIcon && this.getIcon(itemInfo.overIcon));

        // Update pickerIcon src to reflect over state if appropriate
        var pickerIcon = this._pickerIconVisible() ? this.getPickerIcon() : null;
        if (pickerIcon && this.updatePickerIconOnOver != false) {

            this._setIconState(pickerIcon, 
                (this._isOverTextBox || this._isOverControlTable || (overIcon == pickerIcon)));
        }
        
        // Update over state of any other icons where showOverWhen is "textbox"
        var icons = this.icons;
        if (icons) {
            for (var i = 0; i < icons.length; i++) {
                if (icons[i] == pickerIcon || icons[i] == null) continue;
                if (this._iconShouldShowOver(icons[i])) {

                    var overWhen = this._iconShowOverWhen(icons[i]),
                        over = overIcon == icons[i] ||
                                (overWhen == "item" && overItem == this && !itemInfo.overTitle) ||
                                (overWhen == "textBox" && (this._isOverControlTable || this._isOverControlTable));
                    this._setIconState(icons[i], over);
                }
            }
        }
    },

    //> @method formItem.updateState() (A)
    // Update the visual state of a FormItem to reflect any changes in state or any changes in
    // style settings (e.g. +link{FormItem.textBoxStyle}).
    // <P>
    // Calls to <code>updateState()</code> normally occur automatically as a consequence of
    // focus changes, items becoming disabled, etc.  This method is advanced and intended only
    // for use in workarounds.
    //
    // @visibility external
    //<
    
    _$FormItemStyling:"FormItemStyling",
    updateState : function () {
        if (!this.isDrawn()) return;
        // elements to style:
        // - cell
        
        var isStandalone = (this.containerWidget != this.form || this._absPos());
        if (!isStandalone) {
            this._updateCellState();
            this._updateTitleCellState();
        }

        
        this._updatePickerCellAndControlTableState();

        this._updateTextBoxState();
        
        
    },
    
    _updateCellState : function () {
            
        if (this.containerWidget != this.form || this._absPos()) return;
        var showDebugLogs = this.logIsDebugEnabled(this._$FormItemStyling);
        
        var cellStyle = this.getCellStyle();
        if (showDebugLogs) this.logDebug("About to apply basic cell style:"+ cellStyle, "FormItemStyling");

        // We'll either have a form cell around us, or we'll have written out an absolutely positioned
        // div
        var formCell = this.getFormCell();
        if (formCell) formCell.className = cellStyle;
        // If we have an outer table element we also apply the overall cellstyle to that
        var outerTable = this.getOuterTableElement();
        if (outerTable) outerTable.className = cellStyle;    
    },
    _updateTitleCellState : function () {
        // Tell the form to update our title cell's state too.
        if (this.showTitle) this.form.updateTitleCellState(this);
    },
    
    _updatePickerCellAndControlTableState : function () {

        var showDebugLogs = this.logIsDebugEnabled(this._$FormItemStyling);
        if (this._writeControlTable()) {
            var controlStyle = this.getControlStyle(),
                pickerIconStyle = this.getPickerIconStyle();
               if (showDebugLogs) {
                    this.logDebug("About to apply cell styles to control box and picker icon cell:"+
                                    [controlStyle, pickerIconStyle], "FormItemStyling");
                                    
               }

            // - inner table (control style)
            var controlHandle = this._getControlTableElement();
            if (controlHandle) controlHandle.className = controlStyle;
            // - pickerIconBox
            var pickerIconHandle = this._getPickerIconCellElement();
            if (pickerIconHandle) pickerIconHandle.className = pickerIconStyle;
        }
    
    },
    
    _updateTextBoxState : function () {
        var showDebugLogs = this.logIsDebugEnabled(this._$FormItemStyling);
        
        var textBoxStyle = !this._showingInFieldHintAsValue ? this.getTextBoxStyle()
                                                            : this._getInFieldHintStyle();
        if (showDebugLogs) this.logDebug("About to apply text box style:"+ textBoxStyle, "FormItemStyling");

        var styledHandle = this._getElementStyledAsTextBox();
        if (styledHandle != null) {
            styledHandle.className = textBoxStyle;
        }
        var textBoxHandle = this._getTextBoxElement();
        if (textBoxHandle != null) {
            var cssObj = textBoxHandle.style;
            if (this.getImplicitSave()) {
                if (this.awaitingImplicitSave) {
                    if (cssObj && this._implicitSaveCSS != true) {
                        this._implicitSaveCSS = true;
                        this._oldCssText = "" + cssObj.cssText;
                        cssObj.cssText = "" + cssObj.cssText + this.editPendingCSSText;
                    }
                } else {
                    if (this.wasAwaitingImplicitSave == true && this._oldCssText) {
                        delete this._implicitSaveCSS;
                        delete this.wasAwaitingImplicitSave;   
                        cssObj.cssText = "" + this._oldCssText;                          
                        delete this._oldCssText;
                    }
                }
            }
            if (this.textColor) {
                
                if (textBoxStyle.contains("Pending")) {
                    cssObj.color = null;
                } else {
                    cssObj.color = this.textColor;
                }
            }
        }

        
        if (this._writeOutFocusProxy() && textBoxHandle) {
            if (!this._focusOutline) {
                // Size the focus outline to match this item's text box size, adjusted for
                // the fact that we always write out a 1px border
                var value = this.getValue();
                var width = this.getTextBoxWidth(value), height = this.getTextBoxHeight(value);
                width += isc.Element.getHBorderSize(textBoxHandle) -2;
                if (height != null) height += isc.Element.getVBorderSize(textBoxHandle) -2;
                var focusOutlineID = this._getDOMID("focusOutline");
                var textBoxStyle = this.getTextBoxStyle();
                isc.Element.insertAdjacentHTML(
                    textBoxHandle,
                    "beforeBegin",
                    "<DIV ID='" +  focusOutlineID + 
                    (textBoxStyle ? "' CLASS='" + textBoxStyle +  "Focused'" : "'") + 
                    " STYLE='background-image:none;background-color:transparent;position:absolute;width:" 
                    +
                    width +
                    (height == null ? "px;" : "px;height:" + height) + 
                    "px;visibility:hidden;border:1px dotted white;z-index:100;'>&nbsp;</DIV>"
                );
                this._focusOutline = isc.Element.get(focusOutlineID);
            }
            
            if (this.hasFocus) this._focusOutline.style.visibility = "inherit";
            else this._focusOutline.style.visibility = "hidden";
        }
    
    },

    // We have a number of deprecated classNames as of 5.5 - helper method to log warnings
    _$deprecated:"deprecated",
    _warnDeprecated : function (oldPropertyName, newPropertyName, version) {
        if (!this.logIsInfoEnabled(this._$deprecated)) return;
        // Keep track of which property names we've already warned about on this item.
        if (!this._warnedDeprecated) this._warnedDeprecated = {};
        if (this._warnedDeprecated[oldPropertyName] == true) return;

        if (version == null) version = "5.5";
        var logString = isc.SB.create();
        logString.append(
            "Using '", oldPropertyName, "': ", this[oldPropertyName], 
            " to style this form item.  This property is deprecated as of SmartClient Version ",
            version, " - we recommend removing this property and using '", newPropertyName, "' instead.");
        this.logInfo(logString.release(false), "deprecated");

        this._warnedDeprecated[oldPropertyName] = true;
    },
    
	//>	@method	formItem.getInnerHTML()		(A)
	//	Return the HTML for this formItem's element(s) and icons.
	//		@group	drawing
	//
	//		@param	value	(String)	Value of the element.
	//		@return			(HTMLString)	HTML output for this element
	//<
    
    getInnerHTML : function (value, includeHint, includeErrors, returnArray) {
        // Inactive content: such as printHTML:
        // If we're marked as inactive while getting innerHTML set the _currentInactiveContext
        // flag if it hasn't been set already
        // This ensures we generate unique DOMIDs for inactive content which
        // is separate from the default DOMIDs for our active HTML elements on the page.
        // Note: may have already been set up / mapped to an explicit 'context' object via
        // setupInactiveContext() - we do this in getInactiveHTML(). In this case respect the
        // existing context / contextID
        var clearInactiveContext, clearPInactiveContext;
        if (this.isInactiveHTML() && this._currentInactiveContext == null) {
            clearInactiveContext = true;
            // If our parent is inactive pick up the same 'inactiveContext' object.
            
            var parentContext, parentItem = this.parentItem;
            if (parentItem != null && parentItem.isInactiveHTML()) {
                if (parentItem._currentInactiveContext == null) {
                    
                    parentItem.setupInactiveContext();
                    clearPInactiveContext = true;
                }
                parentContext = parentItem._inactiveDirectory[parentItem._currentInactiveContext];
            }
            this._currentInactiveContext = this.setupInactiveContext(parentContext);
            
            if (this.logIsDebugEnabled("inactiveEditorHTML")) {
                this.logDebug("getInnerHTML(): Item is marked as inactive - set up " +
                    "new inactive context ID:" + this._currentInactiveContext,
                    "inactiveEditorHTML");
            }
        }
        
        
        this._gotHintHTML = includeHint && !this._mayShowHintInField();
        var output;

        // If we need to write out a hidden native data element, do so now.        
        if (this._useHiddenDataElement()) {
            if (!output) output = isc.SB.create();
            output.append(this._getHiddenDataElementHTML());
        }

        // If displaying hint in-field, suppress displaying hint in surrounding table.
        if (this._getShowHintInField()) includeHint = false;

        // Note that the tableHTML is an array
        var tableHTML = this._getTableHTML(value, includeHint, includeErrors);

        
        var returnVal;
        
        if (output != null) {
            output.append(tableHTML);
            if (returnArray) {
                
                returnVal = output.getArray().duplicate();
                // pass true here to suppress the normal "toString()" / return from 
                // StringBuffer.release, which is a small optimization
                output.release(true);
            } else {
                returnVal = output.release(false);
            }
        } else {
            returnVal = (returnArray ? tableHTML : tableHTML.join(isc.emptyString));
        }

        // If we set the _currentInactiveContext flag, clear it now.
        if (clearInactiveContext) delete this._currentInactiveContext;
        if (this.parentItem && clearPInactiveContext)
            delete this.parentItem._currentInactiveContext;
        return returnVal;
    },

    _writeOuterTable : function (includeHint, hasLeftRightErrors) {
        if (hasLeftRightErrors) return true;

        if (includeHint && this.getHint() != null) return true;
        if (this._hasExternalIcons()) return true;
    },

    _getValueIconStateSuffix : function () {
        return ((this.isDisabled() || this.isReadOnly()) &&
                this.showValueIconDisabled ? this._$Disabled : this._iconState);
    },

    // _getValueIcon()
    // Returns the URL for the value icon to show for this cell, or null if there is none.
    // Checks for the presence of this.getValueIcon, or this.valueIcons
     _$Over:"Over", _$Down:"Down", _$Disabled:"Disabled",
    _getValueIcon : function (value) {
        if (this.suppressValueIcon) return null;

        if (value == null) {
            this.logInfo("null value passed to _getValueIcon()");
        }

        var icon;
        if (this._isPrinting() && this.getPrintValueIcon != null) {
            icon = this.getPrintValueIcon(value);

        } else if (this.getValueIcon != null) {
            icon = this.getValueIcon(value);

        // Default behavior
        } else {
            if (value == null) icon = this.emptyValueIcon;
            else if (this.valueIcons != null) icon = this.valueIcons[value];
        }

        // We may (and commonly do) just not have a valueIcon
        if (icon == null) return null;

        if (icon == isc.Canvas._$blank) return icon;

        // We need to be able to show over, disabled, focused and 'mouseDown' state 
        // Required for the CheckboxItem
        // This is done independently of the cell style applied to the item's text.
        
        var newState = this._getValueIconStateSuffix();
        if (newState != null) {
            // Use caching to speed up image-name generation
            if (!isc.CheckboxItem._valueIconStateCache) isc.CheckboxItem._valueIconStateCache = {};
            var cacheObject = isc.CheckboxItem._valueIconStateCache[icon];
            
            if (!cacheObject) {
                cacheObject = {};
                
                var spriteConfig = isc.Canvas._getSpriteConfig(icon);
                if (spriteConfig) {
                    cacheObject.Over = isc.addProperties({},spriteConfig);
                    cacheObject.Down = isc.addProperties({},spriteConfig);
                    cacheObject.Disabled = isc.addProperties({},spriteConfig);
                    if (spriteConfig.src) {
                        cacheObject.Over.src = isc.Img.urlForState(cacheObject.Over.src, false, false, this._$Over);
                        cacheObject.Down.src = isc.Img.urlForState(cacheObject.Over.src, false, false, this._$Down);
                        cacheObject.Disabled.src = isc.Img.urlForState(cacheObject.Over.src, false, false, this._$Disabled);
                    }
                    if (spriteConfig.cssClass) {
                        cacheObject.Over.cssClass += this._$Over;
                        cacheObject.Down.cssClass += this._$Down;
                        cacheObject.Disabled.cssClass += this._$Disabled;
                    }
                
                } else {
                    cacheObject.Over = isc.Img.urlForState(icon, false, false, this._$Over);
                    cacheObject.Down = isc.Img.urlForState(icon, false, false, this._$Down);
                    cacheObject.Disabled = isc.Img.urlForState(icon, false, false, this._$Disabled);
                }

                isc.CheckboxItem._valueIconStateCache[icon] = cacheObject;
            }

            icon = cacheObject[newState];
        }

        return icon;
    },

    //> @method formItem.getValueIconStyle() (A)
    // Except when +link{group:printing,printing} and +link{FormItem.getPrintValueIconStyle(),getPrintValueIconStyle()}
    // is implemented, this method is called to obtain the base CSS style to use on the
    // +link{FormItem.getValueIcon(),value icon} for the item's current value.
    // <p>
    // If not <code>null</code>, the base style is suffixed with the state of the value icon
    // ("", "Over", "Down", "Disabled").
    //
    // @param value (Any) value of this item.
    // @return (CSSStyleName) CSS style to use, or <code>null</code> if no style should be used.
    // @see FormItem.getPrintValueIconStyle()
    // @visibility external
    //<

    //> @method formItem.getPrintValueIconStyle() (A)
    // If implemented, this method is called when +link{group:printing,printing} to obtain
    // the base CSS style to use on the +link{FormItem.getPrintValueIcon(),print value icon}
    // for the item's current value.
    // <p>
    // If not <code>null</code>, the base style is suffixed with the state of the value icon
    // ("", "Over", "Down", "Disabled").
    // <p>
    // NOTE: It is not recommended to apply CSS <code>background-image</code> styling to the
    // value icon style. This is because browsers typically default to not printing background
    // images.
    //
    // @param value (Any) value of this item.
    // @return (CSSStyleName) CSS style to use, or <code>null</code> if no style should be used.
    // @group printing
    // @see FormItem.getValueIconStyle()
    // @visibility external
    //<

    _getValueIconStyle : function (value) {
        
        if (this.getValueIconStyle == null) return null;

        var iconStyle;
        if (this._isPrinting() && this.getPrintValueIconStyle != null) {
            iconStyle = this.getPrintValueIconStyle(value);
        } else {
            iconStyle = this.getValueIconStyle(value);
        }

        if (iconStyle != null) {
            var newState = this._getValueIconStateSuffix();
            if (newState != null) {
                iconStyle += newState;
            }
        }

        return iconStyle;
    },

    getValueIconWidth : function () {
        if (this.suppressValueIconSizing) return null;
        var width = this.valueIconWidth;
        if (width == null) width = this.valueIconSize;
        return width;
    },
    _getValueIconAndPadWidth : function () {
        return this.getValueIconWidth() + 
                    (this.valueIconLeftPadding + this.valueIconRightPadding);
    },


    getValueIconHeight : function () {
        if (this.suppressValueIconSizing) return null;
        var height = this.valueIconHeight;
        if (height == null) height = this.valueIconSize;
        return height;
    },

    // _getValueIconHTML - returns the IMG tag to write out as our valueIcon
    // or null if we're not showing a valueIcon
    _$valueIcon:"valueIcon",
    _getValueIconHTML : function (value) {
        
        var valueIcon = this._getValueIcon(value);
        if (valueIcon == null) {
            return isc.emptyString;
        }

        if (this.imageURLSuffix != null && valueIcon != isc.Canvas._$blank) {
            valueIcon += this.imageURLSuffix;
        }

        var imgDir = this.imageURLPrefix || this.baseURL || this.imgDir;

        var valueIconStyle = this._getValueIconStyle(value);

        var valueIconWidth = this.getValueIconWidth();
        var valueIconHeight = this.getValueIconHeight();

        var isRTL = this.isRTL(),
            valueIconLeftPadding = isRTL ? this.valueIconRightPadding : this.valueIconLeftPadding,
            valueIconRightPadding = isRTL ? this.valueIconLeftPadding : this.valueIconRightPadding;

        
        return isc.Canvas._getValueIconHTML(valueIcon, imgDir, valueIconStyle, valueIconWidth, valueIconHeight,
                                            valueIconLeftPadding, valueIconRightPadding,
                                            this._getDOMID(this._$valueIcon),
                                            // Pass the containerWidget as the instance to make
                                            // sure that when this item is printed, the value
                                            // icon HTML uses a regular <img> rather than a <span>
                                            // with `background-image' CSS. This is needed because
                                            // browsers typically do not print background images
                                            // by default.
                                            this.containerWidget);
    },

    // method to get a pointer to the valueIcon img element
    _getValueIconHandle : function () {
        if (!this.isDrawn()) return null;
        var img = isc.Element.get(this._getDOMID(this._$valueIcon));
        return img;
    },

    
    _inlineIconsMarkupApproach: (!isc.Browser.isIE || isc.Browser.isIE11
                                 ? "absolutePositioning"
                                 : (isc.Browser.isIE && isc.Browser.version >= 7
                                    ? "divStyledAsDataElement"
                                    : null)),

    _supportsInlineIcons : function () {
        return false;
    },

    _haveInlineIcons : function () {
        return this._supportsInlineIcons() && this._inlineIcons != null && this._inlineIcons.length > 0;
    },

    _$outerTableEnd:"</TD></TR></TABLE>",

    _$controlTableTemplate:[
       // Control table
       "<TABLE role='presentation' ID='",        // 0
       ,                     // 1 [ID for the table] this._getControlTablID()

       // By marking the control table with the 'itemPart' attributes we simplify determining
       // what "part" of the item received the event.
       "' " + isc.DynamicForm._containsItem + "='",                // 2
       ,                                                           // 3 [formItem ID]
       "' " + isc.DynamicForm._itemPart + "='" + isc.DynamicForm._controlTableString,       // 4
       "' CELLPADDING=0 CELLSPACING=0 STYLE='",                     // 5
       ,                    // 6 [css text for the control table]
       "' CLASS='",         // 7
       ,                    // 8 [control table className]
       
       // Text box cell
       "'><TR><TD style='", // 9
       ,                    // 10 [css text for textBox cell]
       "'>",                // 11

       // Text
       ,                    // 12 [textBox html]
       
       "</TD><TD ID='",     // 13
       ,                    // 14 [picker icon cell ID]
       "' " + isc.DynamicForm._itemPart + "='" + isc.DynamicForm._pickerIconCellString,       // 15
       "' CLASS='",         // 16
       ,                    // 17 [Picker Icon className]
       "' STYLE='",         // 18
       ,                    // 19 [picker icon css]
       "'>",                // 20
       ,                    // 21 [Picker Icon HTML]                
       "</TD></TR></TABLE>"
    ],

    _$hintCellTemplate: [
        "<TD ID='",      // 0
        ,                // 1 this._getHintCellID()
        "' CLASS='",     // 2
        ,                // 3 this.getHintStyle() 
        "' style='",     // 4
        ,                // 5 `white-space:nowrap;' or null
        ,                // 6 `min-width:` or null
        ,                // 7 minHintWidth or null
        ,                // 8 "px" or null
        "'",             // 9
        ,                // 10 extraStuff
        ">",             // 11
        ,                // 12
        ,                // 13
        ,                // 14
        ,                // 15 hintString
        null             // 16
    ],
    _fillHintCellTemplate : function (hintString, styleName, extraStuff) {
        
        var hintCellTemplate = this._$hintCellTemplate;
        hintCellTemplate[1] = this._getHintCellID();
        hintCellTemplate[3] = styleName;
        var wrapHintText = this._shouldWrapHintText();
        if (!wrapHintText) {
            hintCellTemplate[5] = "white-space:nowrap";
        } else {
            hintCellTemplate[5] = null;
        }
        var minHintWidth = this._getMinHintWidth(),
            useMinWidthCSS = !isc.Browser.isIE || isc.Browser.isIE8Strict || isc.Browser.isIE9;
        
        if (wrapHintText && minHintWidth > 0 && useMinWidthCSS) {
            hintCellTemplate[6] = "min-width:";
            hintCellTemplate[7] = minHintWidth;
            hintCellTemplate[8] = "px";
        } else {
            hintCellTemplate[6] = null;
            hintCellTemplate[7] = null;
            hintCellTemplate[8] = null;
        }
        hintCellTemplate[10] = extraStuff;
        var innerHTMLStart = 12
        hintCellTemplate[innerHTMLStart + 3] = hintString;
        if (wrapHintText && minHintWidth > 0 && !useMinWidthCSS) {
            hintCellTemplate[innerHTMLStart] = "<div style='width:";
            hintCellTemplate[innerHTMLStart + 1] = minHintWidth;
            hintCellTemplate[innerHTMLStart + 2] = "px'>";
            hintCellTemplate[innerHTMLStart + 4] = "</div>";
        } else {
            hintCellTemplate[innerHTMLStart] = null;
            hintCellTemplate[innerHTMLStart + 1] = null;
            hintCellTemplate[innerHTMLStart + 2] = null;
            hintCellTemplate[innerHTMLStart + 4] = null;
        }
        return hintCellTemplate;
    },

    _shouldWrapHintText : function () {
        var wrapHintText = this.wrapHintText;
        if (wrapHintText != null) return wrapHintText;

        var form = this.form;
        if (form != null) return !!form.wrapHintText;
        return false;
    },

    _getMinHintWidth : function () {
        var minHintWidth = this.minHintWidth;
        if (minHintWidth != null) return minHintWidth;

        var form = this.form;
        if (form != null) {
            minHintWidth = form.minHintWidth;
            if (minHintWidth != null) return minHintWidth;
        }
        return null;
    },

    // helper method to return the HTML for the form item's outer element.
    
    
    // Returns an array of strings that form the appropriate HTML.
    

    _$divStyledAsDataElementTemplate: [
        "<div id='",                    // 0
        ,                               // 1 - 'inlineiconswrapper' DOMID
        "' class='",                    // 2
        ,                               // 3 - textBoxStyle
        "' style='position:relative;display:inline-block;",  // 4
        ,                               // 5 - width CSS
        "'>",                           // 6
        ,                               // 7 - logically left-aligned inline icons markup
        ,                               // 8 - elementHTML
        ,                               // 9 - logically right-aligned inline icons markup
        "</div>"
    ],

    
    _getTableHTML : function (value, includeHint, includeErrors) {
        var errorOrientation = this.getErrorOrientation(),
            showErrors,
            errorOnLeft = errorOrientation == isc.Canvas.LEFT,
            errorHTML,
            readOnly = this.isReadOnly()
        ;
        if (includeErrors && 
            (errorOnLeft || errorOrientation == isc.Canvas.RIGHT)) 
        {
            var errors = this.getErrors();
            if (errors) {
                showErrors = true;
                errorHTML = this.getErrorHTML(errors);
            }
        }

        var vAlign = this.iconVAlign,
            displayValue = this._getDisplayValue(value),
            writeOuterTable = this._writeOuterTable(includeHint, showErrors),
            writeControlTable = this._writeControlTable()
        ;

        var template = writeOuterTable ? isc.FormItem._getOuterTableStartTemplate() : [];
        if (writeOuterTable) {

            
            template.length = 13;

            template[1] = this._getOuterTableID();
            template[3] = this.getOuterTableCSS();
            // Apply the cell style to the outer table so (EG) font color / weight get inherited
            // Note that we don't write out the 'cellStyle' at all unless the item is
            // written into a DF cell
            if (this.containerWidget == this.form && !this._absPos()) {            
                template[5] = this.getCellStyle();
            } else {
                template[5] = null;
            }

            // If we show the error on the left this is where we output it...
            if (showErrors && errorOnLeft) {
                template[7] = isc.StringBuffer.concat("<TD STYLE='",
                                isc.Canvas._$noStyleDoublingCSS, "' CLASS='", 
                                this.getCellStyle(), "'>", errorHTML, "</TD>");
            } else template[7] = null;

            // If the first cell of the outer table contains the text box, write out the 
            // appropriate css text            
            if (!writeControlTable) template[9] = this.getTextBoxCellCSS();
            else template[9] = isc.Canvas._$noStyleDoublingCSS;
            // First cell            
            template[11] = vAlign;
        }

        // If the element is disabled, in some browsers we write an event mask over it
        // to capture mouse events.
        // This is required because we don't get any mouse events (at a native level) over 
        // disabled form item elements.     
        if (this.renderDisabledEventMask()) {
            template[template.length] = this._getEventMaskHTML();
        }

        var elementHTML = (readOnly ? this.getReadOnlyHTML(displayValue, value)
                                    : this.getElementHTML(displayValue, value));
        if (this._haveInlineIcons()) {
            var isRTL = this.isRTL(),
                textBoxStyle = this.getTextBoxStyle(),
                basicHeight = this.getPixelHeight(true),
                leftPad = this._getInlineLeftPadding(textBoxStyle),
                rightPad = this._getInlineRightPadding(textBoxStyle)
            ;

            if (this._inlineIconsMarkupApproach === "absolutePositioning") {
                var leftBorderPad = isc.Element._getLeftBorderSize(textBoxStyle) + leftPad,
                    rightBorderPad = isc.Element._getRightBorderSize(textBoxStyle) + rightPad;
                    
                var logicalTextBoxWidth = this.getLogicalTextBoxWidth();
                // reduce the element width by the width used for the errorIcon
                if (this.hasErrors() && this.shouldShowErrorIcon()) logicalTextBoxWidth -= (this.getErrorWidth());
                
                elementHTML = "<div id='" + this._getInlineIconsWrapperID() + 
                    "' style='position:relative;vertical-align:center;display:block;width:" 
                    + logicalTextBoxWidth + "px;'>"
                     + elementHTML;
                     
                elementHTML += this.getIconsHTML(false, isRTL ? this._rightInlineIcons : this._leftInlineIcons, "position:absolute;top:0px;left:" + leftBorderPad + "px;height:" + basicHeight + "px");
                elementHTML += this.getIconsHTML(
                    false, 
                    isRTL ? this._leftInlineIcons : this._rightInlineIcons, 
                    "position:absolute;top:0px;right:" + rightBorderPad 
                    + "px;height:" + basicHeight + "px");
                elementHTML += "</div>";

            } else {
                

                var topPad = 0;
                if (isc.Browser.isIE && !isc.Browser.isStrict) {
                    topPad = isc.Element._getTopPadding(textBoxStyle);
                    basicHeight -= topPad + isc.Element._getBottomPadding(textBoxStyle);
                }
                
                var elementHTMLTemplate = this._$divStyledAsDataElementTemplate;
                elementHTMLTemplate[1] = this._getInlineIconsWrapperID();
                elementHTMLTemplate[3] = textBoxStyle;

                elementHTMLTemplate[5] = null;
                if (!readOnly) {
                    var elementWidth = this.getTextBoxWidth(value);
                    elementWidth += this._leftInlineIconsWidth + this._rightInlineIconsWidth;
                    if (isc.isA.Number(elementWidth)) {
                        if (isc.Browser.isIE && !isc.Browser.isStrict) {
                            elementWidth += isc.Element._getHBorderSize(textBoxStyle) + leftPad + rightPad;
                        }

                        if ((isc.Browser.isOpera
                             || isc.Browser.isMoz
                             || isc.Browser.isSafari
                             || isc.Browser.isIE9) && !this._getClipValue()) {
                            elementHTMLTemplate[5] = this._$minWidthColon + elementWidth + this._$pxSemi;
                        } else {
                            elementHTMLTemplate[5] = this._$widthColon + elementWidth + this._$pxSemi;
                        }
                    }
                }

                elementHTMLTemplate[7] = this.getIconsHTML(false, isRTL ? this._rightInlineIcons : this._leftInlineIcons, "position:absolute;top:" + topPad + "px;left:" + leftPad + "px;height:" + basicHeight + "px");
                elementHTMLTemplate[8] = elementHTML;
                elementHTMLTemplate[9] = this.getIconsHTML(false, isRTL ? this._leftInlineIcons : this._rightInlineIcons, "position:absolute;top:" + topPad + "px;right:" + rightPad + "px;height:" + basicHeight + "px");
                elementHTML = elementHTMLTemplate.join(isc._emptyString);
                elementHTMLTemplate[8] = null;
            }
        }

        // Logic is quite different for showing a picker icon vs not showing a picker icon.
        if (!writeControlTable) {
            // write the element HTML (text box) directly into the outer table's first cell
            
            // Note - if we are showing a valueIcon, it will be included in the HTML returned
            // from getElementHTML()
            template[template.length] = elementHTML;

        } else {
            var pickerIconStyle = this.getPickerIconStyle(),
                itemID = this.getID(),
                controlStyle = this.getControlStyle(),
                controlTemplate = this._$controlTableTemplate,
                controlHandleID = this._getControlTableID(),
                textBoxID = this._getTextBoxID(),
                pickerCellID = this._getPickerIconCellID()
            ;

            controlTemplate[1] = controlHandleID;
            controlTemplate[3] = itemID;
            controlTemplate[6] = this.getControlTableCSS();
            // If no control table style was explicitly specified, pick up the style for the
            // DF cell containing this item (as it will not cascade up through the table element
            
            if (controlStyle == null && this.containerWidget == this.form && !this._absPos()) {
                controlTemplate[8] = this.getCellStyle();
                controlTemplate[6] += isc.Canvas._$noStyleDoublingCSS;
            } else {
            	controlTemplate[8] = controlStyle
            }
            controlTemplate[10] = this.getTextBoxCellCSS();
            controlTemplate[12] = elementHTML;

            if (writeControlTable) {
                controlTemplate[14] = pickerCellID;
                controlTemplate[17] = pickerIconStyle;
                controlTemplate[19] = this.getPickerIconCellCSS();
                controlTemplate[21] = this._getPickerIconCellValue();
            } else {
                controlTemplate[14] = controlTemplate[17] = null;
                controlTemplate[19] = controlTemplate[21] = null;
            }

            // Actually write out the control table in the cell
            for (var i = 0; i < controlTemplate.length; i++) {
                template[template.length] = controlTemplate[i];
            }
        }

                
        if (writeOuterTable) {
            if (this._hasExternalIcons()) {

                var iconsTemplate = isc.FormItem._getIconsCellTemplate();
                iconsTemplate[1] = vAlign;
                
                //iconsTemplate[3] = this.getTotalIconsWidth();
                iconsTemplate[5] = this.iconHeight;
                iconsTemplate[7] = this.getCellStyle();
                iconsTemplate[9] = this.getIconCellID();
                // that actually gives back the HTML for each icon.
                iconsTemplate[11] = this.getIconsHTML();

                for (var i = 0; i < iconsTemplate.length; i++) {
                    template[template.length] = iconsTemplate[i];
                }
            }

            var showRightError = (showErrors && !errorOnLeft);
            var hint;
            if (includeHint) {
                hint = this.getHint();
                if (isc.isA.emptyString(hint)) hint = null;
            }
            if (hint || showRightError) {
                var hasHint = (hint != null && !isc.isAn.emptyString(hint)),
                    hasError = showRightError && errorHTML != null && !isc.isAn.emptyString(errorHTML);
                   
                if (hasHint) {
                    template.add("</TD>");
                    var hintCellTemplate = this._fillHintCellTemplate(hint, this.getHintStyle());
                    template.push.apply(template, hintCellTemplate);
                }
                if (hasError) {
                    template.add(isc.StringBuffer.concat("<TD STYLE='",
                                                         isc.Canvas._$noStyleDoublingCSS, "' CLASS='",
                                                         this.getCellStyle(), "'>", errorHTML));
                }
            }
            // close the table
            template[template.length] = this._$outerTableEnd;
        }

        return template;
	},
	_getPickerIconCellValue : function () {
        if (this._pickerIconVisible()) {
            var PI = this.getPickerIcon(),
                hasFocus = this._hasRedrawFocus(true),
                showPIFocus = hasFocus && this._iconShouldShowFocused(PI, true);
                
            return this.getIconHTML(PI, null, this.iconIsDisabled(PI),
                                                   !!showPIFocus);
        // control table with no picker icon
        // Can happen due to 'alwaysShowControlBox', etc
        } else {
            return null;
        }
    },

    //>@attr formItem.leftInlineIconsPadding (Integer : null : IRA)
    // If this item has +link{formItemIcon.inline,inline icons) rendered on
    // the +link{formItemIcon.inlineIconAlign,left), this attribute governs how many px padding
    // to have between the icons and the left of the text box.
    // <P>
    // If unset, icons will be offset by the padding specified by the +link{formItem.textBoxStyle}
    //<
    // Used by the DynamicPropertyEditorItem
    //leftInlineIconsPadding:null,
    _getInlineLeftPadding : function (style) {
        if (this.leftInlineIconsPadding != null) return this.leftInlineIconsPadding;

        // ListGrid overrides this method to force operatorIcons to the a 1px left offset
        return isc.Element._getLeftPadding(style);
    },

    //>@attr formItem.rightInlineIconsPadding (Integer : null : IRA)
    // If this item has +link{formItemIcon.inline,inline icons) rendered on
    // the +link{formItemIcon.inlineIconAlign,right), this attribute governs how many px padding
    // to have between the icons and the right edge of the text box.
    // <P>
    // If unset, icons will be offset by the padding specified by the +link{formItem.textBoxStyle}
    //<
    // Used by the DynamicPropertyEditorItem
    //rightInlineIconsPadding:null,    
    _getInlineRightPadding : function (style) {

        if (this.rightInlineIconsPadding != null) return this.rightInlineIconsPadding;
            
        return isc.Element._getRightPadding(style);
    },

	_$iconCell:"iconCell",
	getIconCellID : function () {
	    return this._getDOMID(this._$iconCell);
	},
    
    _$outerTable:"_outerTable",
    _getOuterTableID : function () {
        return this._getDOMID(this._$outerTable);
    },

    // Retrieving Stylenames
    // --------------------------------------

    // Helper to get style name from base style based on current state
    
    _getCellStyle : function (baseStyle, which) {
        
        // If pending, append the "Pending" suffix, but don't return - we want to
        // apply subsequent suffixes too, like "PendingFocused", etc.
        if (this._getShowPending() && this.pendingStatus && !this._defaultPendingStatusChangedBehaviorCanceled) {
            baseStyle = this._getPendingBaseStyle(baseStyle, which);
        }
        
        // Sanity check - if baseStyle is null, just return null.
        // Any assembled string will be dubious and this way calling code upstream can
        // check for cases where the baseStyle is absent more easily
        // (For example calling getTextBoxStyle() when this.textBoxStyle is null)
        if (baseStyle == null) return null;

        var hasErrors = this.hasErrors(),
            rtl = this.showRTL && this.isRTL();

        // Use caching to speed up style-name generation
        var cacheObject;
        if (rtl) {
            cacheObject = isc.FormItem._rtlCellStyleCache[baseStyle];
            if (!cacheObject) {
                cacheObject = isc.FormItem._rtlCellStyleCache[baseStyle] = {
                    Normal: baseStyle + "RTL",
                    Error: baseStyle + "ErrorRTL",

                    Over: baseStyle + "OverRTL",
                    Focused: baseStyle + "FocusedRTL",

                    // Combine error, focused and over
                    ErrorFocused: baseStyle + "ErrorFocusedRTL",
                    ErrorOver: baseStyle + "ErrorOverRTL",

                    FocusedOver: baseStyle + "FocusedOverRTL",                    
                    ErrorFocusedOver: baseStyle + "ErrorFocusedOverRTL",
                    
                    Disabled: baseStyle + "DisabledRTL",
                    ErrorDisabled: baseStyle + "ErrorDisabledRTL"
                };
            }
        } else {
            cacheObject = isc.FormItem._cellStyleCache[baseStyle];
            if (!cacheObject) {
                cacheObject = isc.FormItem._cellStyleCache[baseStyle] = {
                    Normal: baseStyle,
                    Error: baseStyle + "Error",

                    Over: baseStyle + "Over",
                    Focused: baseStyle + "Focused",

                    // Combine error, focused and over
                    ErrorFocused: baseStyle + "ErrorFocused",
                    ErrorOver: baseStyle + "ErrorOver",

                    FocusedOver: baseStyle + "FocusedOver",                    
                    ErrorFocusedOver: baseStyle + "ErrorFocusedOver",
                    
                    Disabled: baseStyle + "Disabled",
                    ErrorDisabled: baseStyle + "ErrorDisabled"
                };
            }
        }

        var style;
        
        // call isFocused() rather than checking this.hasFocus - ContainerItem at least 
        // overrides isFocused() to return true when child items have focus
        var showFocused = this.showFocused && !this.renderAsDisabled() && this.isFocused() 
                            && !this.isInactiveHTML();
        if (this._showingPickList && !showFocused) {
            // show the item as focused if it's pickList is showing - needed to maintain
            // focused styling for items with modal pickLists
            showFocused = true;
        }
        if (which == this._$pickerIcon && showFocused) {
            showFocused = this.showFocusedPickerIcon;
        }
        var showOver = false;
        if (this.showOver && !this.isInactiveHTML() && !this.renderAsDisabled() &&
            (this._isOverTextBox || this._isOverControlTable))
        {
            switch (which) {
                case this._$textBox:
                    showOver = this.getUpdateTextBoxOnOver() != false;
                    break;
                    
                // Note that if passed "pickerIcon", we're actually picking up style for
                // the pickerIcon's cell - so style this along with the control table
                // (check updateControlOnOver rather than updatePickerIconOnOver)
                case this._$control:
                case this._$pickerIcon:
                    showOver = this.getUpdateControlOnOver() != false;
                    break;
                    
                
                    
            }
        }
        // if we have an error always just return the error state
        if (hasErrors && this.shouldShowErrorStyle() && this.form.showInlineErrors) {
            if (this.hasFocus && this.showFocusedErrorState) {
                style = !this.isInactiveHTML() ? 
                        (showOver ? cacheObject.ErrorFocusedOver : cacheObject.ErrorFocused) : 
                        cacheObject.ErrorFocused;
            } else if (this.showDisabled && this.renderAsDisabled()) {
                style = cacheObject.ErrorDisabled;
            } else {
                style = !this.isInactiveHTML() ? 
                        (showOver ? cacheObject.ErrorOver : cacheObject.Error) : 
                        cacheObject.ErrorOver;
            }
        } else {
            // suppress focused styling when inactive
            if (showFocused) {
                style = showOver ? cacheObject.FocusedOver : cacheObject.Focused;
            } else if (this.showDisabled && this.renderAsDisabled()) {
                style = cacheObject.Disabled;
            } else {
                // Otherwise "normal" state.
                style = showOver ? cacheObject.Over : cacheObject.Normal;
            }
        }
        
        if (this.getCustomState) {
            
            var state = style.substring(baseStyle.length);
            state = this.getCustomState(which ? which : this._$cell, state, this);
            if (state) style = baseStyle + state;
        }
        
        return style;
    },

    _getPendingBaseStyle : function (baseStyle, which) {
        if (which === this._$printTitle ||
            which === this._$title ||
            which === this._$cell ||
            which === this._$printTextBox ||
            which === this._$textBox)
        {
            return baseStyle + "Pending";
        }
        return baseStyle;
    },
    
    //> @type FormItemElementType
    // HTML elements that make up a complete FormItem (note, not all FormItems use all of 
    // these elements)
    // <P>
    // @value "cell"       The form item as a whole, including the text element, any icons, 
    //                     and any hint text for the item. This is the cell containing the 
    //                     form item
    // @value "control"    The "control" cell containing the text box and picker
    // @value "pickerIcon" The cell containing the item's picker icon, if it has one
    // @value "textBox"    The item's native text box, if it has one
    // @value "title"      The cell containing the title
    //
    // @see method:FormItem.getCustomState()
    // @visibility external
    //<


    //> @method formItem.getCustomState() (A)
    // Optional method to retrieve a custom state suffix to append to the style name that is 
    // applied to some element of a formItem - see +link{type:FormItemBaseStyle} for more 
    // information on how state-based FormItem style names are derived.  
    // <p>
    // If this method exists on a formItem, the framework will call it, passing in the state
    // suffix it has derived.  Your <code>getCustomState()</code> implementation can make use 
    // of this derived state or ignore it.  For example, if you wanted two different types of
    // focus styling depending on some factor unrelated to focus, you would probably make use
    // of the incoming "Focused" state and return something like "Focused1" or "Focused2".  On 
    // the other hand, if you want your custom state to just override whatever the system 
    // derived, you would ignore the incoming state.  Finally, if you do not wish to provide a
    // custom style for this formItem element at this time - for example, you are only 
    // interested in providing a custom "textBox" style and this call is for a "cell" element  
    // type - your <code>getCustomStyle()</code> method should just return the state it was
    // passed.
    // <p>
    // This method is an advanced API, and you should only provide an implementation of it if 
    // you have specialized styling requirements.  If you do implement it, note that it will 
    // be called very frequently, from rendering code: if your custom logic does significant 
    // processing, it could introduce a system-wide performance problem.
    //
    // @param elementType (FormItemElementType) The element type to return a custom state for
    // @param derivedState (String) The state suffix the system derived
    // @return (String) custom state suffix to use for the parameter elementType for this 
    //                  FormItem
    // @see type:FormItemBaseStyle
    // @visibility external
    //<

    //> @method formItem.getCellStyle() (A)
    // Function to retrieve the style name to apply to this form item's cell.
    // Derives the style name from +link{FormItem.cellStyle,this.cellStyle}.
    //
    // @return (CSSStyleName) style to apply to the cell
    //<
    // In some cases we apply the base cells tyle to sub items within the cell. In this case
    // avoid logging warnings if the deprecated styling property attributes are set, so we
    // don't warn repeatedly per rendered item.
    _$parentItemCell: "parentItemCell",
    getCellStyle : function () {
        // For items written into a container item, allow the container item to override the
        // cellStyle, so it can re-skin it's child items effectively
        if (this.parentItem != null) {
            if (this.parentItem.itemCellStyle) return this._getCellStyle(this.parentItem.itemCellStyle, this._$parentItemCell);
        }

        var className = this._getCellStyle(this.cellStyle, this._$cell);
        //>!BackCompat 2006.3.9
        // If the  old styling properties are set have them take precedence over the 
        // new  style names since new names will typically be present from the skin files,
        // but old app code will not know about the new names
        if (!this.hasErrors()) {
            // If the deprecated 'cellClassName' property is set, use that
            if (this.cellClassName != null) {
                this._warnDeprecated("cellClassName", "cellStyle");
                className = this.cellClassName;
            }
        } else {
            // If the deprecated 'errorCellClassName' property is set, use that
            if (this.errorCellClassName != null) {
                this._warnDeprecated("errorCellClassname", "cellStyle");
                className = this.errorCellClassName;
            }
        }
        //<!BackCompat
        return className;
    },

    //> @method formItem.setCellStyle()
    // Setter for +link{FormItem.cellStyle}.
    //
    // @param newCellStyle (FormItemBaseStyle) the new <code>cellStyle</code> value.
    // @group appearance
    // @visibility external
    //<
    setCellStyle : function (newCellStyle) {
        var oldCellStyle = this.cellStyle;
        this.cellStyle = newCellStyle;
        if (oldCellStyle != newCellStyle) this.updateState();
    },

    //>@method  FormItem.getTitleStyle() (A)
    // Function to retrieve the css style class name to apply to this form item's title.
    // Derives the style name from +link{formItem.titleStyle, titleStyle}, or from 
    // +link{formItem.verticalTitleStyle, verticalTitleStyle} when 
    // +link{formItem.titleOrientation, titleOrientation} is <code>"top"</code>.
    // @return (CSSStyleName) css class to apply to the item's title
    //<
    _$printTitle: "printTitle",
    _$title: "title",
    getTitleStyle : function () {
        // If we are printing default to this.printTitleStyle if specified
        
        if (this._isPrinting() && this.printTitleStyle) {
            return this._getCellStyle(this.printTitleStyle, this._$title);
        } 
        var error = this.getErrors();
        if (error == isc.emptyString) error = null;
        // use one of two base-styles, depending on title-orientation
        var titleStyle = this.getTitleOrientation() == "top" ? this.verticalTitleStyle : null;
        titleStyle = titleStyle || this.titleStyle;
        var className = this._getCellStyle(titleStyle, "title");
        //>!BackCompat 2006.3.9
        if (!error) {
            // If the deprecated 'titleClassName' property is set, use that
            if (this.titleClassName != null) {
                this._warnDeprecated("titleClassName", "titleStyle");
                className = this.titleClassName;
            }
        } else {
            // If the deprecated 'titleErrorClassName' proeprty is set, use that
            if (this.titleErrorClassName != null) {
                this._warnDeprecated("titleErrorClassName", "titleStyle");
                className = this.titleErrorClassName
            }
        }        
        //<!BackCompat
        return className;
        
    },

    //>@method  FormItem.getHintStyle() (A)
    // Function to retrieve the css style class name to apply to this form item's hint text
    // Derives the style name from <code>this.hintStyle</code>
    // @return (CSSStyleName) css class to apply to the cell
    //<
    getHintStyle : function () {
        //>!BackCompat 2006.3.9
        if (this.hintClassName != null) {
            this._warnDeprecated("hintClassName", "hintStyle");
            return this.hintClassName;
        }
        //<!BackCompat
        if (this.hintStyle != null) return this.hintStyle;
    },

    
    inlineStyleSuffix: "",
    showInlineStyle: false,

    // The text box is the element that we write into the first cell of the table control
    // table which contains the textual value of the form item.
    // This is written out by this.getElementHTML and by default is a DIV.
    
    _$printTextBox: "printTextBox",
    getTextBoxStyle : function () {
        var isStatic = (this.getCanEdit() == false && this.renderAsStatic());

        if (this._isPrinting()) {
            if (isStatic && this.printReadOnlyTextBoxStyle) {
                return this._getCellStyle(this.printReadOnlyTextBoxStyle, this._$printTextBox);
            } else if (this.printTextBoxStyle) {
                return this._getCellStyle(this.printTextBoxStyle, this._$printTextBox);
            }
        }

        // use the readOnlyTextBoxStyle with canEdit: false and readOnlyDisplay: "static"
        
        var tbStyle = (isStatic ? 
                this.getReadOnlyTextBoxStyle() : this.textBoxStyle),
            styleName = this._getCellStyle(tbStyle, this._$textBox)
        ;
        //>!BackCompat 2006.3.9
        // deprecated input element style
        if (this.elementClassName != null) {
            this._warnDeprecated("elementClassName", "textBoxStyle");
            styleName = this.elementClassName;
        } 
        //<!BackCompat
        return styleName;
    },

    // Styling applied to the table cell containing the picker icon (if we're showing one)
    
    _$pickerIcon: "pickerIcon",
    getPickerIconStyle : function () {
        var pickerIcon = this.getPickerIcon();
        if (pickerIcon && pickerIcon.visible && this.pickerIconStyle != null) {
            return this._getCellStyle(this.pickerIconStyle, this._$pickerIcon);
        }
        // allow styling to be inherited from our parent table
        return null;
    },

    // Styling applied to the 'control' table - only rendered if we're showing a picker icon - 
    // contains the main text box and the picker icon.
    getControlStyle : function () {
        if (this.controlStyle != null) return this._getCellStyle(this.controlStyle, this._$control);
        return null;
    },

    // CSS Generation
    // -----------------
    // Method to return custom CSS styling for various parts of the form item

    _$wrapCSS:"white-space:normal;",_$nowrapCSS:"white-space:nowrap;",
    _$minWidthColon:"min-width:", _$minHeightColon:"min-height:",
    _$widthColon:"width:", _$heightColon:"height:", _$pxSemi:"px;", _$semi:";",
    
    _$cachedOuterTableCSS:{},
    getOuterTableCSS : function () {
        
        return this._$wrapCSS;
    },

    // Control table
    
    // Retrieve style text to apply to the controlbox table, if we're writing one out.
    _$defaultCursor:"cursor:default;",
    getControlTableCSS : function () {
        var output = isc.SB.create();
        output.append(this._$defaultCursor);
        
        // The control-table should be sized to the 'innerWidth', minus the size of any
        // external icons. This is currently available as this.getElementWidth()
        var width = this.getElementWidth() - this._getErrorWidthAdjustment();
        if (isc.isA.Number(width)) output.append(this._$widthColon, width, this._$pxSemi);
        
        // no need to specify height - we will pick this up from the text box element

        return output.release(false);
    },

    // Text Box Cell

    _getTextAlign : function () {
        var textAlign = this.textAlign;
        if (textAlign == null) {
            if (this.applyAlignToText && this.align != null) {
                return this.align;
            } else if (this.icons != null && this.icons.length > 0) {
                return this.isRTL() ? "right" : "left";
            }
        }
        return textAlign;
    },

    // Apply no-style-doubling css to the cell containing the text box. This will prevent
    // globally applied "td" styles from showing up around items with hints / checkboxes etc
    // May be overridden by subclasses
    
    getTextBoxCellCSS : function () {
        return this.textBoxCellCSS != null ? this.textBoxCellCSS : isc.Canvas._$noStyleDoublingCSS;
    },

    // Retrieve style text to apply directly to the text box
    _$textOverflowEllipsisCSS:"overflow:hidden;" + isc.Browser._textOverflowPropertyName + ":ellipsis;",
    _$textAlignColon:"text-align:",
    _$lineHeightColon:"line-height:",
    _$borderBox:"border-box",
    _$boxSizingColon:isc.Element._boxSizingCSSName + ":",
    getTextBoxCSS : function (value) {
        var output = isc.SB.create(),
            needTextBoxTable = this._needTextBoxTable(),
            clipValue = this._getClipValue();
        
        if (!(isc.Browser.isIE && isc.Browser.version < 11 && needTextBoxTable)) {
            var isPrinting = this._isPrinting();

            
            if (!isPrinting || isc.isA.Number(this.width)) {
                var elementWidth = this.getTextBoxWidth(value);
                if (isc.isA.Number(elementWidth)) {
                    if ((isc.Browser.isOpera
                         || isc.Browser.isMoz
                         || isc.Browser.isSafari
                         || isc.Browser.isIE9) && !clipValue) {
                        output.append(this._$minWidthColon, elementWidth, this._$pxSemi);
                    } else {
                        output.append(this._$widthColon, elementWidth, this._$pxSemi);
                    }
                }
            }
            if (this._haveInlineIcons() && this._inlineIconsMarkupApproach === "absolutePositioning") {
                var isRTL = this.isRTL(),
                    style = this.getTextBoxStyle(),
                    logicalLeftInlineIconsWidth = isRTL ? this._rightInlineIconsWidth : this._leftInlineIconsWidth,
                    logicalRightInlineIconsWidth = isRTL ? this._leftInlineIconsWidth : this._rightInlineIconsWidth;
                var logicalLeftPadding =  this._getInlineLeftPadding(style)
                                            + logicalLeftInlineIconsWidth,
                    logicalRightPadding = this._getInlineRightPadding(style)
                                            + logicalRightInlineIconsWidth;

                output.append("padding-right:", logicalRightPadding, this._$pxSemi);
                output.append("padding-left:", logicalLeftPadding, this._$pxSemi);
            }
            var height = this.getTextBoxHeight(value),
                heightIsNumber = isc.isA.Number(height);
            if (heightIsNumber && (!this._haveInlineIcons() || this._inlineIconsMarkupApproach !== "divStyledAsDataElement")) {
                
                if (!isPrinting && isc.Browser.isMoz && !clipValue) {
                    output.append(this._$minHeightColon, height, this._$pxSemi);
                } else {
                    output.append(this._$heightColon, height, this._$pxSemi);

                    
                    
                    if (isPrinting && !this.wrap) output.append(this._$lineHeightColon, height, this._$pxSemi);
                }
            }
        }
        // Don't allow overflow if clipValue is true.
        if (clipValue) output.append(this._$textOverflowEllipsisCSS);

        if (this.wrap) {
            output.append(this._$wrapCSS);
        } else {
            output.append(this._$nowrapCSS);

            
            if (this._shouldVerticallyCenterTextBox() && !needTextBoxTable) {
                if (isc.Browser.isMoz && isc.Browser.version < 68) output.append(this._$lineHeightColon, "-moz-block-height;");
                else if (heightIsNumber) output.append(this._$lineHeightColon, height, this._$pxSemi);
            }
        }

        var textAlign = this._getTextAlign();
        if (textAlign != null) {
            output.append(this._$textAlignColon, textAlign, this._$semi);
        }

        if (isc.Browser.isBorderBox) {
            output.append(this._$boxSizingColon, this._$borderBox, this._$semi);
        }
        return output.release(false);

    },

    // custom styling for picker icon cell
    
    _$fontSize:"font-size:",
    getPickerIconCellCSS : function () {
        // Not required in IE
        if (isc.Browser.isIE) return isc.emptyString;
        
        var height = this.getPickerIconHeight();
        if (isc.isA.Number(height) && height < this.getInnerHeight()) {
            return this._$fontSize + height + this._$pxSemi;
        }
        return isc.emptyString;
    },

    // Helper method to get the properties this item's picker icon if 'showPickerIcon' is true.
    
    getPickerIcon : function () {      
    
        // pick up properties like pickerIconSrc et al dynamically and
        // ensure they're applied to the icon lazily
        
        var dynamicPickerIconProps = {
            showFocused:this.showFocusedPickerIcon,
            hspace:this.pickerIconHSpace,
        
            width:this.getPickerIconWidth(),
            height:this.getPickerIconHeight(),
            src:this.pickerIconSrc,
            prompt: this.pickerIconPrompt
        };
            
        if (this._pickerIcon == null) {

            var props = isc.addProperties({}, 
                this.pickerIconDefaults, this.pickerIconProperties, 
                {
                    // Flag this as the picker icon to simplify any special manipulation
                    pickerIcon:true,

                    writeIntoItem:true,
                    inline:false
                },
                dynamicPickerIconProps
            );

            // apply a name to it to make it a 'valid' icon type object - allows us to get
            // a pointer to its HTML element
            this._setupIconName(props, this.pickerIconName);
            
            // This adds the pickerIcon to the TabIndexManager
            this.setupPickerIconTabPosition(props);

            this._pickerIcon = props;
            // We need to have the _disabled flag be set from when the picker icon is
            // first drawn so subsequent enable() / disable()s will update it.
            if (this.iconIsDisabled(props)) props._disabled = true;

        } else {
            isc.addProperties(this._pickerIcon, dynamicPickerIconProps);
        }

        return this._pickerIcon;
    },

    // getElementHTML() - writes out the valueIcon (if present) and text box for the form item
    // For form items using a native HTML Form element such as <input>, this method returns 
    // that element's HTML
    
    
    _$accessKeyEquals:" ACCESSKEY='",
    _$tabIndexEquals:" TABINDEX='",
    _$singleQuote:"'",
    _$textBoxTemplate:[ "<DIV ID='", // 0
                        ,            // 1: ID for text box
                        // By marking the textBox with the 'itemPart' attributes we simplify 
                        // determining what "part" of the item received the event.
                        "' " + isc.DynamicForm._containsItem + "='",                // 2
                        ,            // 3: [formItem ID]
                        "' " + isc.DynamicForm._itemPart + "='" + isc.DynamicForm._textBoxString, // 4
                        "' CLASS='", // 5
                        ,            // 6: this.getTextBoxStyle()
                        "' STYLE='", // 7
                        ,            // 8: this.getTextBoxCSS()
                        "'",         // 9
                        ,            // 10: textBoxFocusAttributes
                        ">",         // 11
                        ,            // 12: valueIcon HTML (if required)
                        ,            // 13: actual value
                        "</DIV>"     // 14
                      ],
    _$textBoxTableTemplate: [
                        "<table role='presentation' cellpadding='0' cellspacing='0' " +
                        "style='table-layout:fixed;overflow:hidden' width='", // 0
                        ,            // 1:
                        "'",         // 2
                        ,            // 3: " height='...'" or null
                        "><tbody><tr><td", // 4
                        ,            // 5: nowrap
                        " id='",     // 6 + 0
                        ,            // 6 + 1: ID for text box
                        "' " + isc.DynamicForm._containsItem + "='", // 6 + 2
                        ,            // 6 + 3: [formItem ID]
                        "' " + isc.DynamicForm._itemPart + "='" + isc.DynamicForm._textBoxString, // 6 + 4
                        "' class='", // 6 + 5
                        ,            // 6 + 6: this.getTextBoxStyle()
                        "' style='", // 6 + 7
                        ,            // 6 + 8: this.getTextBoxCSS()
                        ";overflow:hidden' valign='middle'", // 6 + 9
                        ,            // 6 + 10: textBoxFocusAttributes
                        ">",         // 6 + 11
                        ,            // 6 + 12: valueIcon HTML (if required)
                        ,            // 6 + 13: actual value
                        "</td></tr></tbody></table>" // 6 + 14
                      ],
    _nowrapTrue: " nowrap='true'",
    
    _shouldVerticallyCenterTextBox : function () {
        return false;
    },
    
    _needTextBoxTable : function () {
        return (this._shouldVerticallyCenterTextBox() &&
                !this._isPrinting() &&
                isc.Browser.isIE &&
                ((!isc.Browser.isStrict && 7 <= isc.Browser.version && isc.Browser.version <= 8) ||
                 isc.Browser.version <= 6));
    },
    getElementHTML : function (value, dataValue) {
        var output = isc.SB.create(),
            useFocusProxy = this._writeOutFocusProxy();

        
        var canFocus = this._canFocusInTextBox(),
            textBoxFocusAttributes,
            focusProxyString,
            textBoxStyle = this.getTextBoxStyle();

        if (this._showingLoadingDisplayValue) {
            textBoxStyle = this._getInFieldHintStyle();
        }

        if (canFocus) {
            // If we're disabled tabIndex will currently be -1. However we don't clear 
            // this.accessKey, so do an explicit check to avoid writing out an accessKey on
            // a disabled form item
            var tabIndex = this._getElementTabIndex(),
                accessKey = this.renderAsDisabled() ? null : this.accessKey;
            if (useFocusProxy) {
                focusProxyString = isc.Canvas.getFocusProxyString(
                                        this.getID(),
                                        // position the focus proxy at 0,0 in the appropriate
                                        // table cell
                                        
                                        false, 0, 0,
                                        
                                        this.getTextBoxWidth(dataValue), this.getTextBoxHeight(dataValue),
                                        this.isVisible(), !this.renderAsDisabled(),
                                        tabIndex, accessKey,
                                        // Events on this focus proxy will be handled by the ISC
                                        // eventHandling system 
                                        
                                        false
                            );    
            } else {
                var attrs = isc.SB.create();
                if (accessKey != null) attrs.append(this._$accessKeyEquals, accessKey, this._$singleQuote);
                attrs.append(this._$tabIndexEquals, tabIndex, this._$singleQuote);
                textBoxFocusAttributes = attrs.release();
            }
        }

        if (focusProxyString != null) output.append(focusProxyString);

        var tbTemplate,
            tbOffset;
        if (this._needTextBoxTable()) {
            tbTemplate = this._$textBoxTableTemplate;
            tbOffset = 6;

            var width = this.getTextBoxWidth(dataValue);
            if (isc.Browser.isIE6 && isc.Browser.isStrict) {
                width += isc.Element._getHBorderPad(textBoxStyle);
            }
            tbTemplate[1] = width;

            var height = this.getTextBoxHeight(dataValue);
            if (isc.isA.Number(height)) {
                if (isc.Browser.isIE6 && isc.Browser.isStrict) {
                    height += isc.Element._getVBorderPad(textBoxStyle);
                }
                tbTemplate[3] = " height='" + height + "'";
            } else {
                tbTemplate[3] = null;
            }

            tbTemplate[5] = this.wrap ? null : this._nowrapTrue;

        } else {
            tbTemplate = this._$textBoxTemplate;
            tbOffset = 0;
        }

        tbTemplate[tbOffset + 1] = this._getTextBoxID();
        tbTemplate[tbOffset + 3] = this.getID();
        tbTemplate[tbOffset + 6] = String.asAttValue(textBoxStyle);
        tbTemplate[tbOffset + 8] = this.getTextBoxCSS(dataValue);
        tbTemplate[tbOffset + 10] = textBoxFocusAttributes; // Will be null if appropriate

        // Pre-pend the value with the valueIconHTML [will be null if appropriate]
        
        var valueIconHTML;
        if (this.multiple && isc.isAn.Array(dataValue)) {
            if (dataValue.length == 1) {
                valueIconHTML = this._getValueIconHTML(dataValue[0]);
            } 
        } else {
            valueIconHTML = this._getValueIconHTML(dataValue);
        }
        tbTemplate[tbOffset + 12] = valueIconHTML;
        tbTemplate[tbOffset + 13] = (this.showValueIconOnly ? null : value);

        output.append(tbTemplate);

        //this.logWarn("element HTML:"+ output.toString());
        return output.release(false);
    },

    // By default, getElementHTML returns a static display field so we use that.
    // This also allows subclasses that have read-only support inline in getElementHTML()
    // to not require a simple getReadOnlyHTML() override just to call it.
    getReadOnlyHTML : function (value, dataValue) {
        return this.getElementHTML(value, dataValue);
    },

    //> @method formItem.getPrintHTML() (A)
    // @param [printProperties] (PrintProperties)
    // @param [callback] (Callback)
    // @return (HTMLString) print HTML for this item
    // @group printing
    // @visibility internal
    //<
    getPrintHTML : function (printProperties, callback) {
        var value = this.getValue();
        var HTML = this[this.isReadOnly() ? "getReadOnlyHTML" : "getElementHTML"](this.mapValueToDisplay(value), value);
        if (HTML == null) HTML = isc.emptyString;
        return HTML;
    },

    // If we are focusable and not flagged as having an 'inputElement' use a focus proxy 
    // wherever we can't make a DIV natively focusable 
    
    _writeOutFocusProxy : function () {
    
        
        if (this.useFocusProxy != null) return this.useFocusProxy;
        
        // Focus proxies were required for older versions of Safari and Chrome
        // This is no longer the case with the latest versions
        // Tested on:
        // - Chrome 13.0.782.215 on Mac OSX and Windows 7 (reports as safariVersion 535.1).
        // - Safari 5.1 on Mac OSX and Windows 7 (reports as safariVersion 534.5)
        
        return (isc.Browser.isMoz && isc.Browser.geckoVersion < 20051111) && 
                this._canFocus() && !this.hasDataElement();
    },
    
    // Helper method for HTML parts:
    
    _getItemElementAttributeHTML : function () {
        if (!isc.FormItem._itemElementAttrHTML) {
            isc.FormItem._itemElementAttrHTML =  [
                " ", isc.DynamicForm._containsItem, "='", 
                null,   // item ID
                "' ",
                isc.DynamicForm._itemPart, "='", isc.DynamicForm._element, "'"
            ];
        }
        isc.FormItem._itemElementAttrHTML[3] = this.getItemID();
        return isc.FormItem._itemElementAttrHTML.join(isc.emptyString);
    },

    //> @method formItem.isValid() 
    // Returns true if this FormItem has no validation errors.
    // @return (Boolean) 
    //<
    isValid : function () {
        var errors = this.getErrors();
        if (errors == null || isc.isAn.emptyObject(errors)) {
            return true;
        }
        return false;
    },

	//>	@method	formItem.getErrors()	(A)
	// Return the validation errors in the form associated with this item, if any.
    // Errors will be returned as either a string (single error message) or an array of strings
    // (multiple error messages).
	//  @return	(String | Array of String) Error message(s) for this item.
    // @group errors
    // @visibility external
	//<
	getErrors : function () {
        if (this.form) return this.form.getFieldErrors(this);
	},
    
    // getError() synonym for getErrors() for backcompat
    
    getError : function () {
        //>DEBUG
        this.logWarn("call to deprecated method FormItem.getError()." +
                     " Use FormItem.getErrors() instead."
                     
                     );
        //<DEBUG
        return this.getErrors();
    },

    // getErrorMessage - given an error string or array of errors - return it formatted as HTML for
    // display
    getErrorMessage : function (error) {
        var errorMessageID = this._getErrorMessageID();
        return (isc.isAn.Array(error) ? "<ul id='" + errorMessageID + "'><li>" + error.join("</li><li>") + "</li></ul>"
                                      : "<span id='" + errorMessageID + "'>" + error + "</span>");
    },

    _getErrorMessageID : function () {
        return this._getDOMID("errorMessage");
    },

    // shouldShowErrorIcon / text / style helpers
    // Allows for form level control of whether error icons/text shows up inline
    shouldShowErrorIcon : function () {
        return this.showErrorIcon != null ? this.showErrorIcon : this.form.showErrorIcons; 
    },
    shouldShowErrorText : function () {
        return this.showErrorText != null ? this.showErrorText : this.form.shouldShowErrorText();
    },
    shouldShowErrorStyle : function () {
        return this.showErrorStyle != null ? this.showErrorStyle : this.form.showErrorStyle;
    },
    // by default show hover prompts on the icon if we're showing the icon but not the message
    shouldShowErrorIconPrompt : function () {
        return this.shouldShowErrorIcon && !this.shouldShowErrorText();
    },
    
    // should the error show up above / below / left/right of the item?
    getErrorOrientation : function () {
        return this.errorOrientation != null ? this.errorOrientation : this.form.getErrorOrientation();
    },


    //>	@method	formItem.getErrorHTML()	(A)
    // Output the HTML for an error message in a form element. Default behavior respects
    // +link{FormItem.showErrorIcon} and +link{FormItem.showErrorText} as described in the
    // documentation for those attributes.
    // @param error (String | Array of String) error message string or array of error messages
    // @return (HTMLString) HTML to display the error
    // @visibility external
	//<
	
	getErrorHTML : function (error) {
        var showErrorText = this.shouldShowErrorText(),
            showErrorIcon = this.shouldShowErrorIcon();
           
        if (!showErrorText && !showErrorIcon) return isc.emptyString;
        
		var form = this.form,
            // If we are writing out an error icon, use a table to insure:
            // - if we're showing a single error message that wraps it doesn't
            //   wrap UNDERNEATH the error icon
            // - if we're showing multiple error messages in a bulleted list the icon
            //   appears to the left of the list rather than appearing above it on a 
            //   separate line
            // - note in strict mode (inc HTML5 mode), an img followed by a nbsp char
            //   will wrap the nbsp char, causing the image to appear essentially misaligned
            //   handle this by always writing the table if we're writing out the 
            //   error icon in strict mode 
            
            writeTable = (isc.Browser.isStrict ? showErrorIcon :
                          showErrorIcon && showErrorText),
            
            
            writeDivInline = !writeTable && showErrorIcon && 
                            ((this.getErrorOrientation() == isc.Canvas.LEFT) || 
                             (this.getErrorOrientation() == isc.Canvas.RIGHT)),
            
                        // We may want to make this setting hierarchical - so it can be set at 
                        // the item or validator level as well
            titleText = (showErrorText && this.form.showTitlesWithErrorMessages &&
                         this.getTitle() != null ? this.getTitle() + ": " : null),
            output,
            
            messageString = showErrorText ? this.getErrorMessage(error) : null;

        
        // Write out containsItem / itemPart - this allows us to 
        // use partwise events to identify the inline error text.
        // Could be used for custom events, but more importantly, this
        // is helpful for the AutoTest subsystem.
        if (!writeTable) {
            output = isc.SB.concat("<DIV ", 
                    this._getInlineErrorHandleAttributes(),
                    (writeDivInline ? "style='display:inline;'" : null)
                    ," CLASS='", this.getCellStyle() , "'>" 
                    , (showErrorIcon ? this.getErrorIconHTML(error) + "&nbsp;" : null)
                    , titleText
                    , messageString
                    , "</DIV>"
            );
        } else {
            
            output = isc.SB.create();
            output.append("<TABLE ",
                this._getInlineErrorHandleAttributes(),
                    " role='presentation' WIDTH=100% CELLSPACING=0 CELLPADDING=0><TR>",
                "<TD WIDTH=",this.errorIconWidth + this.iconHSpace,">"
                // If we're writing a table we know we're always writing out the icon
                , this.getErrorIconHTML(error)
                , "</TD>"
            );

            if (showErrorText) {
                output.append("<TD STYLE='", isc.Canvas._$noStyleDoublingCSS, "' CLASS='" , 
                        this.getCellStyle(), "'>&nbsp;"                         
                    , titleText
                    , messageString
                    , "</TD>"
                );
            }
            output.append("</TR></TABLE>");
            output = output.release(false);
        }
		return output;
	},

    _getInlineErrorHandleID : function () {
        return this._getDOMID("inlineErrorHandle");
    },

	_getInlineErrorHandleAttributes : function () {
	    if (this._inlineErrorAttributeString == null) {
	        this._inlineErrorAttributeString = isc.SB.concat(
	            "ID='", this._getInlineErrorHandleID(), "' ",
	            isc.DynamicForm._containsItem, "='", this.getID(), "' ",
	            isc.DynamicForm._itemPart, "='", isc.DynamicForm._inlineErrorString, "' "
	        );
	    }
	    return this._inlineErrorAttributeString;
	},

    getInlineErrorHandle : function () {
        return this.getDocument().getElementById(this._getInlineErrorHandleID());
    },

    getErrorIconHTML : function (error) {
        
        this._currentIconError = error;

        var id = this.getErrorIconId();

        var errorString = "";
        // add the error as an aria-label so that we can point to this as an "aria-describedby"
        // element.  This is added as part of the "extraStuff" parameter below
        if (error != null && isc.Canvas.ariaEnabled() && !isc.Canvas.useLiteAria()) {
            if (isc.isAn.Array(error)) error = error.join(",");
            errorString = " aria-label='" + String.asAttValue(String.htmlStringToString(error)) + "'";
        }

        
        // pad the errorIcon with iconHSpace left or right, according to orientation
        var hspace = this.iconHSpace;
        if (this.getErrorOrientation() == "left") hspace *= -1;
        return this._getIconImgHTML(
                // unique ID for the img
                id, 
                this.errorIconWidth, this.errorIconHeight,
                //vAlign for the icon
                "top", 
                0,  // vMargin
                // No left margin for the icon, no background-color for this icon
                hspace,
                null,
                
                // Src 
                
                this.form.getImgURL(this.errorIconSrc),
                // always suppress 'display:block' in standards mode
                false,

                errorString,
                null,

                // eventStuff for error icon info for event (This will cause error text
                // to show up in a hover)
                // getIconImgHTML doesn't handle this directly since we usually 
                // don't have img-only icons be interactive.
                isc.DynamicForm._containsItem + "='" + this.getID() + "' " +
                
                // Don't use the same ID for the icon part name (used for event handling) 
                // as for the element in the DOM - the 'errorIconId' is retrieved via
                // _getDOMId which guarantees
                // a unique ID within the page (required for img name / dom element ID etc), 
                // but doesn't guarantee consistency across page reloads etc.
                // We want the eventPart type ID to be consistent so the autoTest subsystem
                // can reliably identify error icons.
                isc.DynamicForm._itemPart + "='" + this.errorIconName + "'"
        );
    },

    getErrorIconId : function () {
        return this._getDOMID("error");
    },
    errorIconName:"isc_errorIcon",

	//>	@method	textItem.getHint()	(A)
	//	Returns the hint text for this item. Default implementation returns +link{FormItem.hint}, or
    //  null if there is no hint to show.
    //
	// @group	appearance
    // @return (HTMLString) HTML to show as the hint for the item
    // @visibility external
	//<
    getHint : function () {
        if (!this.showHint || !this.hint) return null;
        return this.hint;
	},
    
    

    // Drawing
    // ----------------------------------------------------------------------------------------
    // Form items don't write themselves into the DOM - this is typically handled by their
    // dynamicForm, or for 'standalone items', this is handled by the items' containerWidget.
    // The code to write the items out into the DOM should also notify the form items that they
    // have been written into the DOM, to allow us to perform 'isDrawn()' checks and perform
    // any necessary manipulations of the items' data element.
    
    
    
    // Notification method fired when formItem.visibility changes.
    // Note: Unlike 'visibilityChanged()', this method is not fired when the containerWidget
    // is shown or hidden - just when
    // item.show / item.hide are called directly, or the 'showIf' method re-evaluates to a new value.
    
    itemVisibilityChanged : function (visibility) {
        // Use this method to fire the (older) 'visiblityChanged' method.
        // That method also fires when the containerWidget as a whole is shown or hidden.
        this.visibilityChanged();
    },
    
    _$drawing:"drawing",
    drawing : function (itemVisibilityChanged) {
	   //>DEBUG
        if (this.logIsInfoEnabled(this._$drawing)) {
        	this.logInfo("About to draw this form item." + 
                         (itemVisibilityChanged ? " [Item added / visibility changed]." 
                                                : " [ContainerWidget drawn]."),
                         "drawing");
        }
        //<DEBUG
        
        // For each item, evaluate icon 'showIf' and 'showIconsOnFocus' / 'hideIconsOnKeypress'
        // to determine current visibility
        this._resolveIconsVisibility();
    },
    //> @method formItem.drawn() 
    // Notification function to be fired on the form item when the item has been written into
    // the DOM by some container widget.
    //
    // @group drawing
    // @visibility internal
    //<
    drawn : function () {
    	//>DEBUG
        if (this.logIsInfoEnabled(this._$drawing)) {
        	this.logInfo("Form item drawn " + 
                         (this.containerWidget == this.form ? 
                                "in form " + this.form.getID() :
                                "in container widget " + this.containerWidget.getID()) +
                         (this.logIsDebugEnabled("drawing") ? this.getStackTrace() : ""), 
                         "drawing");
        }
        //<DEBUG

        if (this._needHideUsingDisplayNone()) {
            var widget = this.containerWidget;
            while (widget != null) {
                widget._incrementHideUsingDisplayNoneCounter();
                widget = widget.parentElement;
            }
        }

        // suppress updateValue() until we've applied our value to the element itself
        this._drawPendingSetValue = true;
        this._drawn = true;
        if (this._gotHintHTML) this._wroteOutHint = true;
        this._gotHintHTML = null;

        this._applyHandlersToElement();
        this._showValueAfterDraw();

        delete this._drawPendingSetValue;


        if (isc.screenReader) this.addContentRoles();
    },

    // fired when this item is about to be redrawn
    
    
    mustRefocusOnRedraw:true,
    redrawing : function () {
	   //>DEBUG
        if (this.logIsInfoEnabled(this._$drawing)) {
        	this.logInfo("About to redraw this form item.", "drawing");
        }
        //<DEBUG
        
        
        if (isc.Browser.isIE && this.hasFocus && this.form && !this.form._setValuesPending) {
           this.form.elementChanged(this);
       }        
       
        if (this.mustRefocusOnRedraw && this._hasRedrawFocus(true)) {
            
            this._storeFocusForRedraw(); 
        }
        this.form.clearingElement(this);
        this._absDiv = null;
        
        // suppress updateValue until we get a redrawn() notification
        this._redrawInProgress = true;
        
        // For each item, evaluate icon 'showIf' and 'showIconsOnFocus' / 'hideIconsOnKeypress'
        // to determine current visibility
        this._resolveIconsVisibility();

        // make sure we're not focused in any element as it gets rewritten in the DOM
        // Note: FormItem.storeFocusForRedraw / restoreFocusAfterRedraw handles silently refocusing
        // after the redraw completes
        
        if (this.mustRefocusOnRedraw && this.hasFocus) this.blurItemWithoutHandler();
                
    },
    
    //> @method formItem.redrawn() 
    // Notification function to be fired on the form item when the items HTML has been redrawn
    // by some container widget.
    //
    // @group drawing
    // @visibility internal    
    //<
    redrawn : function () {     
        //>DEBUG
        if (this.logIsInfoEnabled("drawing")) {
        	this.logInfo("Form item redrawn " + 
                         (this.containerWidget == this.form ? 
                                "in form " + this.form.getID() :
                                "in container widget " + this.containerWidget.getID()) +
                         (this.logIsDebugEnabled("drawing") ? this.getStackTrace() : ""), 
                         "drawing");
        }
        //<DEBUG
        
        // clear pointer to data element
        this._clearCachedHandles();
        
        this._applyHandlersToElement();
        this._showValueAfterDraw(true);
        
        if (isc.screenReader) this.addContentRoles();
        if (this.mustRefocusOnRedraw && this._hasRedrawFocus(true)) {
            this._refocusAfterRedraw();
        }
        // clear the redraw in progress flag (re-enables updateValue)
        delete this._redrawInProgress;   
        
        if (this._changingValue) {
            this._redrawnDuringChange = true;
        }
     

    },

    // After item draw or redraw, explicitly "show" our current value
    // This basically ensures the element value is set for cases where we didn't
    // write it out as part of our innerHTML.
    // It also handles evaluating dynamic or modified default values
    
    _showValueAfterDraw : function (redrawing) {
        // We want to set to our default value if
        // - we are currently showing the default value [this allows us to reevaluate dynamic defaults]
        // - we are currently empty [default value may have been set since the last redraw() call]
        //   * exception: If the value has been set to null since it was last programmatically set, we
        //     can assume the user explicitly cleared out whatever was contained in the item.
        //     In this case we do not want to clobber the user's modification with the default
        
        // Otherwise just show our current value.
        if (!this.valueHasChanged() && 
            (this.isSetToDefaultValue() || this._value == null)) 
        {
            this.setValue();
        } else {
            
            this._showValue(this._value);
            
            if (redrawing && this.form._redrawInProgress) this._skipSetFromForm = true;
        }
    },
    
    
    valueHasChanged : function () {
        return this.form.valueHasChanged(this.name);
    },

    // _storeFocusForRedraw()
    // When a dynamicForm is redrawn, if an item has focus, we want it to continue to have the same
    // focus / selection as before the redraw.
    // This method stores the selection / where the focus is (text box vs icons etc), so we
    // can restore it after focus
    
    _storeFocusForRedraw : function () {

        if (this._skipStoreFocusForRedraw) return;
        this._hadFocusBeforeRedraw = true;
        
        this.rememberSelection();
        
        if (this.items) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].hasFocus) {
                    return this.items[i]._storeFocusForRedraw();
                }
            }
        }

        var element = this._getCurrentFocusElement();
        if (element != null && element != this.getFocusElement()) {
            var picker = this.getPickerIcon();
            if (picker != null && this._getIconLinkElement(picker) == element) {
                this._redrawFocusIcon = picker;
            } else if (this.icons) {
                for (var i = 0; i < this.icons.length; i++) {
                    if (this._getIconLinkElement(this.icons[i]) == element) {
                        this._redrawFocusIcon = this.icons[i];
                        break;
                    }
                }
            }
        }
    },

    // _refocusAfterRedraw - fired in response to item.redrawn()
    // If the item had focus when the redraw occurred, put focus back in it (without firing any
    // focus handlers) now.
    _refocusAfterRedraw : function () {
        // Sanity checks - don't refocus if
        // - we're not visible or drawn
        // - focus is marked as being elsewhere on the page
        // - focus is marked as being elsewhere on the form
        //  (focus shift implies this was delayed and focus has subsequently moved)
        // - this item has subitems, one of which is the focus subitem
        //   In this case, the item should make sure that _refocusAfterRedraw() is called on
        //   its subitems (ensuring that the redrawn() notification is called is sufficient).
        
        var shouldRefocus = this.isDrawn() && this.isVisible();
        if (shouldRefocus) {
            var focusCanvas = isc.EH.getFocusCanvas();
            if (focusCanvas != null && focusCanvas != this.form) {
                shouldRefocus = false;
            } else {
                var focusItem = this.form.getFocusSubItem();
                if (focusItem !== this && focusItem != this.parentItem &&
                    (!this.items || this.items.contains(focusItem)))
                {
                    shouldRefocus = false;
                }
            }
        }         
        delete this._hadFocusBeforeRedraw;

        
        if (shouldRefocus && isc.Browser.isIE) {
            isc.FormItem._testStuckSelectionAfterRedraw(this);
        }

        // we want our refocus to be silent - call the uber-advanced method to suppress 
        // developer-specified focus handlers from firing when focus gets restored
        if (shouldRefocus) {
            this.form._suppressFocusHandlerForItem(this);
            // If the focus item was scrolled out of view, it'll natively jump into
            // view when we refocus on it, scrolling the parent.
            // Use the notifyAncestorsAboutToReflow / notifyAncestorsReflowComplete mechanism
            // to avoid a scroll jump on the containerWidget (even though the redraw has
            // already occurred at this point)
            
            this.containerWidget.notifyAncestorsAboutToReflow();
        }
        
        // If appropriate stick focus back into the icon which previously had it
        var focussed = false;
        if (this._redrawFocusIcon) {
            var icon = this.getIcon(this._redrawFocusIcon);
            delete this._redrawFocusIcon;
            if (icon) {
                if (shouldRefocus) {
                    this.focusInIcon(icon);
                }
                focussed = true;
            }
        }
        
        // still going - we weren't focused in a sub icon or an item - just focus in
        // our standard focus element
        if (shouldRefocus && !focussed) {
            // set a flag noting that we're currently refocussing after redraw
            // on element focus (which may be async) we'll clear this flag
            // This allows us to suppress 'selectOnFocus' behavior, and instead reset to last selection
            this._refocussingAfterRedraw = true;
            this.focusInItem();
        }
        if (shouldRefocus) {
            this.containerWidget.notifyAncestorsReflowComplete();
            
            
            if (isc.EH.useFocusInEvents &&
                isc.EH.synchronousFocusNotifications) 
            {
                this.containerWidget.notifyAncestorsAboutToReflow();
                this._notifyAncestorsReflowCompleteOnAsyncFocus = true;
            }
        }
        
    },
    
    
    _applyHandlersToElement : function () {
        //!DONTCOMBINE

        if (this._canFocus()) {
            var element = this.getFocusElement();
            if (!element) {
                if (this._canFocusInTextBox()) {
                    this.logWarn("Attempting to apply event handlers to this item. " + 
                        "Unable to get a pointer to this item's focus element");
                    return;
                }
            } else {

                if (this._propagateMultiple) {
                    // _propagateMultiple is set on items that can support multiple-files
                    if (this.multiple) {
                        element.multiple = this.multiple;
                    } else {
                        element.multiple = false;
                    }
                }

                if (this.accept) {
                    // FileItem and UploadItem use this to supply filters to the file picker
                    element.accept = this.accept;
                }

                // Apply focus/blur handlers to the focus element. These fall through to 
                // formItem._nativeElementFocus() / formItem._nativeElementBlur()
                element.onfocus = isc.FormItem._nativeFocusHandler;
                element.onblur = isc.FormItem._nativeBlurHandler;
                
                // oncut / onpaste events:
                // - set up handlers for these so devs can determine whether a cut/paste
                //   occurred during the change notification flow.
                
                if (this.supportsCutPasteEvents) {
                    element.onpaste = isc.FormItem._nativePaste;
                    element.oncut= isc.FormItem._nativeCut;
                }
                    
                // Support a generic way to apply native event handlers to the element without
                // overriding this method.
                //  this._nativeEventHandlers is expected to be an object of the format
                //   {nativeHandlerName:function}
                // [Don't apply these handlers to icons!]
                if (this._nativeEventHandlers) {    
                    for (var handler in this._nativeEventHandlers) {
                        if (this._nativeEventHandlers[handler] == null) continue;
                        element[handler] = this._nativeEventHandlers[handler];
                    }
                }
            }
        }
        
        this._setUpIconEventHandlers();
    },
    
    _setUpIconEventHandlers : function () {
        // If we have any icons, we need to apply focus/blur handlers to them as well.
        // Note that we may draw/clear icons independently of redrawing the form item, so we
        // need a separate method to handle them being drawn
        if (this.showPickerIcon) {
            var pickerIcon = this.getPickerIcon();
            if (pickerIcon && pickerIcon.visible) {
                this._iconDrawn(this.getPickerIcon());
            }
        }
        if (this.showIcons && this.icons && this.icons.length > 0) {
    
            for (var i = 0; i < this.icons.length; i++) {
                var icon = this.icons[i];
                if (icon && (this._writeIconIntoItem(icon) || icon.visible)){
                    this._iconDrawn(icon);
                }
            }
        }    
    },
    
    // Notification function fired whenever an icons is written into the DOM.
    // Allows us to apply event handlers directly to the icon rather than writing them out
    // as part of the icon's HTML
    _$hash:"#",
    _useIconLinkElements:
        
        (!isc.Browser.isSafari) &&
        (!isc.Browser.isMoz),
    _iconDrawn : function (icon) {
        if (!icon.imgOnly) {
            var link = this._getIconLinkElement(icon);

            if (link) {
                link.onfocus = isc.FormItem._nativeIconFocus
                link.onblur = isc.FormItem._nativeIconBlur
                
                if (this._useIconLinkElements) {
                    // The link needs an HREF or it will not be focus-able
                    link.href = this._$hash;

                    // Write out an onclick handler that simply stops us navigating to the href
                    // for the icon's link.  We will fire the icon's click action via
                    // standard form item click handling 
                    link.onclick = isc.FormItem._nativeIconClick;
                }
            }
                
        }
        
        
    
    },

    clearing : function (itemVisibilityChanged) {
	    //>DEBUG
        if (this.logIsInfoEnabled("drawing")) {
        	this.logInfo("About to clear this form item" +                          
                         (itemVisibilityChanged ? " [Item removed / visibility changed]." 
                                                : " [ContainerWidget cleared]."),
                         "drawing");
        }
        //<DEBUG
    },
    //> @method formItem.cleared() 
    // Notification function to be fired on the form item when the items HTML has been removed
    // from the DOM by some container widget.
    //
    // @group drawing
    // @visibility internal    
    //<
    cleared : function () {
    
    	//>DEBUG
        if (this.logIsInfoEnabled("drawing")) {
        	this.logInfo("Form item cleared " + 
                         (this.containerWidget == this.form ? 
                                "from within form " + this.form.getID() :
                                "from within container widget " + this.containerWidget.getID()) +
                         (this.logIsDebugEnabled("drawing") ? this.getStackTrace() : ""), 
                         "drawing");
        }
        //<DEBUG
        
        if (this._needHideUsingDisplayNone()) {
            var widget = this.containerWidget;
            while (widget != null) {
                widget._decrementHideUsingDisplayNoneCounter();
                widget = widget.parentElement;
            }
        }
        this.form.clearingElement(this);
        this._clearCachedHandles();

        this._wroteOutHint = false;
        this._gotHintHTML = false;
        this._drawn = false;
        
        
        if (isc.FormItem._pendingEditorExitCheck == this) {
            isc.FormItem._pendingEditorExitCheck.checkForEditorExit(true, true);
        }

    },

    _clearCachedHandles : function () {
        this._dataElement = null;
        this._absDiv = null;
        this._focusProxyHandle = null;
        this._htmlPartHandles = {};
    },

    //> @method formItem.isDrawn() 
    // Returns true if this item has been written out into the DOM.
    //
    // @return (Boolean) whether this item is drawn
    // @group drawing
    // @visibility external
    //<
    isDrawn : function () {
        return this._drawn;
    },

    

    // Icons   
	// -----------------------------------------------------------------------------------------

    // _setUpIcons called at init time.  This should apply default properties to icons as
    // required.
    _setUpIcons : function () {
        this._inlineIcons = null;
        this._leftInlineIcons = null;
        this._leftInlineIconsWidth = 0;
        this._rightInlineIcons = null;
        this._rightInlineIconsWidth = 0;

        var icons = this.icons;
        if (icons == null) return;
        var numIcons = icons.length;

        for (var i = 0; i < numIcons; ++i) {
            var icon = icons[i];
            this._setUpIcon(icon);
        }

        if (this._supportsInlineIcons()) {
            var inlineIcons = this._inlineIcons = [],
                leftInlineIcons = this._leftInlineIcons = [],
                rightInlineIcons = this._rightInlineIcons = [];
            for (var i = 0; i < numIcons; ++i) {
                var icon = icons[i];
                if (icon.inline) {
                    inlineIcons.add(icon);
                }
            }
            
            var numInlineIcons = inlineIcons.length
            ;
            // Initialize the inline icons' inlineIconAlign.
            for (var j = 0; j < numInlineIcons; ++j) {
                var icon = inlineIcons[j];

                // set the inlineIconAlign if null or invalid
                if (icon.inlineIconAlign == null ||
                    (icon.inlineIconAlign !== "left" && icon.inlineIconAlign !== "right"))
                {
                    icon.inlineIconAlign = (j == 0 ? "left" : "right");
                }

                
                
                if (icon.inlineIconAlign === "left") {
                    leftInlineIcons.add(icon);
                } else {
                    
                    rightInlineIcons.add(icon);
                }
            }
        }
    },
    
    // Clean up all icons for this item. Used by setIcons
    _removeIcons : function () {
        if (!this.icons || this.icons.length == 0) return;
        
        for (var i = this.icons.length-1; i >= 0; i--) {
            isc.TabIndexManager.removeTarget(this.getTabIndexIdentifierForIcon(this.icons[i]));
        }
        this.icons = null;
    },

    _recomputeLeftAndRightInlineIconsWidth : function () {
        this._leftInlineIconsWidth = 0;
        this._rightInlineIconsWidth = 0;

        if (this._supportsInlineIcons() && this._inlineIcons != null) {
            var inlineIcons = this._leftInlineIcons,
                numInlineIcons = inlineIcons.length
            ;
            // Recompute the total width of "left"-aligned inline icons.
            for (var i = 0; i < numInlineIcons; ++i) {
                var icon = inlineIcons[i];
                if (icon.visible) {
                    
                    this._leftInlineIconsWidth += icon.width + icon.hspace;
                }
            }
            // Recompute the total width of "right"-aligned inline icons.
            inlineIcons = this._rightInlineIcons;
            numInlineIcons = inlineIcons.length;
            for (var i = 0; i < numInlineIcons; ++i) {
                var icon = inlineIcons[i];
                if (icon.visible) {
                    
                    this._rightInlineIconsWidth += icon.width + icon.hspace;
                }
            }
        }
        
    },

    // _setUpIcon - run by setUpIcons() on each specified icon object to apply required 
    // properties such as ID.
    // Split into a separate method so this can be called separately if icons are applied after
    // setUpIcons has been run (See ExpressionItem for an example of this)
    _setUpIcon : function (icon) {
        // apply an identifier to the icon (to be written into the DOM as an attribute) 
        // to ensure that the
        // appropriate click action is fired on a click, and allow us to get a pointer
        // back to the icon image / link elements in the DOM
        this._setupIconName(icon);
        // This adds the icon to the TabIndexManager
        this.setupIconTabPosition(icon);
        
        // Set the '_disabled' flag on the icon. We use this to track whether we need to
        // update HTML when the icon gets enabled / disabled
        if (this.iconIsDisabled(icon)) icon._disabled = true;

        if (icon.width == null) icon.width = this.iconWidth;
        if (icon.height == null) icon.height = this.iconHeight;
        if (icon.hspace == null) icon.hspace = this.iconHSpace;
        icon.hspace = Math.max(0, icon.hspace);

        // An icon that should not receive focus nor focus its
        // FormItem is implemented by setting imgOnly
        if (icon.canFocus == false) icon.imgOnly = true;
    },

    //> @method formItem.getIconTabPosition()
    // Returns the desired tab-position of some icon with respect to other focusable
    // sub-elements for this formItem.
    // <P>
    // Default implementation returns the index of the icon in the icons array, 
    // (plus one if a pickerIcon is showing) meaning users can tab through icons in order.
    // Has no effect for non-focusable icons.
    // @return (Integer) desired position in the tab-order within this item's sub-elements
    // @visibility external
    //<
    
    getIconTabPosition : function (icon) {
        var iconIndex = this.icons.indexOf(icon);
        
        if (this.showPickerIcon) iconIndex++;
        return iconIndex;
    },
    // Sets up the icon tab position from 'setupIcon'
    setupIconTabPosition : function (icon) {
        var iconIndex = this.getIconTabPosition(icon);
        // sanity check only
        if (iconIndex == -1) {
            this.logWarn("Icon passed to setupIconTabPosition is not present in this.icons:"
                         + this.echo(icon), "TabIndexManager");
            return;
        }
                
        // treat icons as a child of this widget in the TabIndexManager so they move with us.
        isc.TabIndexManager.addTarget(
            
            this.getTabIndexIdentifierForIcon(icon),
            true,
            this.ID, 
            iconIndex, 
            {target:this, methodName:"iconAutoTabIndexUpdated"},
            {target:this, methodName:"iconSyntheticShiftFocus"}
        );
        
    },
    
    getTabIndexIdentifierForIcon : function (icon) {
        if (this._iconTabIndexIDs == null) this._iconTabIndexIDs = {};
        if (this._iconTabIndexIDs[icon.name] == null) {
            
            this._iconTabIndexIDs[icon.name]  = "$" + this.ID + "_" + icon.name;
        }
        return this._iconTabIndexIDs[icon.name];
            
    },
    getIconFromTabIndexIdentifier : function (ID) {
        if (this._iconTabIndexIDs == null) return null;
        for (var iconName in this._iconTabIndexIDs) {
            if (this._iconTabIndexIDs[iconName] == ID) return iconName;
        }
    },
    
    //> @method formItem.getPickerIconTabPosition()
    // Returns the desired tab-position of the picker icon with respect to other focusable
    // sub-elements for this formItem.
    // <P>
    // Default implementation returns zero, making the picker the first focusable element
    // after the items text box.
    // @return (Integer) desired position in the tab-order within this item's sub-elements
    // @visibility external
    //<
    getPickerIconTabPosition : function () {
        return 0;
    },
    
    setupPickerIconTabPosition : function (icon) {
        // By default the icon shows up before any other "tab children" of the item
        // (IE the other icons).
        // Will be overridden for containerItems.
        // treat icons as a child of this widget in the TabIndexManager so they move with us.
        var index = this.getPickerIconTabPosition();     
        isc.TabIndexManager.addTarget(
            this.getTabIndexIdentifierForIcon(icon),
            
            true,
            this.ID, 
            index, 
            {target:this, methodName:"iconAutoTabIndexUpdated"},
            {target:this, methodName:"pickerIconSyntheticShiftFocus"}
        );
    },
    
    // Notification fired when an icon's tab index has been changed by the TabIndexManager
    // Update the tabIndex on the icon link element
    iconAutoTabIndexUpdated : function (iconID) {
        var iconName = this.getIconFromTabIndexIdentifier(iconID),
            icon = iconName ? this.getIcon(iconName) : null;
        if (icon) {
            var linkElement = this._getIconLinkElement(icon);
            if (linkElement) {
                isc.FormItem.setElementTabIndex(linkElement, this._getIconTabIndex(icon));
            }
        }
    },

    //> @method	formItem.getIconsHTML()  (A)
    //  Return the HTML to draw any icons to be displayed after the form item
	//  @group  appearance
    //
    //      @return (HTMLString)      HTML for the icons
    //<
    _iconsTableStart0:"<table role='presentation' cellpadding=0 cellspacing=0 margin=0 style='",
    _iconsTableStart1:"'><tr>",
    _tdStart:"<td>",
    _tdEnd:"</td>",
    _iconsTableEnd:"</table>",
    getIconsHTML : function (includePicker, icons, extraCSSText) {
        if (!this.showIcons) return isc.emptyString;
        var hasFocus = this._hasRedrawFocus(true),
            showPickerIcon = includePicker && this._pickerIconVisible()
        ;
        if ((this.icons == null || this.icons.length == 0) && !showPickerIcon) {
            return isc.emptyString;
        }

        var output = isc.SB.create(),
            showingIcons = false;

        // Write the icons out into a table with one cell per icon.
        // This will ensure they reliably show up in a row horizontally without
        // relying on <nobr> or css white-space:nowrap;
        

        if (icons == null) {
            var icons = [];
            if (includePicker) {
                var pickerIcon = this.getPickerIcon();
                if (pickerIcon && pickerIcon.visible) {
                    icons = [pickerIcon];
                }
            }
            icons.addList(this.icons);
            
            if (this._haveInlineIcons()) {
                var k = 0;
                for (var i = 0; i < icons.length; ++i) {
                    var icon = icons[i];
                    if (icon.inline) {
                        
                        ++k;
                    } else if (k > 0) {
                        
                        icons[i - k] = icon;
                    } 
                }
                
                icons.setLength(icons.length - k);
            }
        }

        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];
            // don't write out the icon if showIf, showIconOnFocus etc returned false
            // (captured in icon.visible)
            if (!icon.visible || this._writeIconIntoItem(icon)) {
                continue;
            }

            if (showingIcons == false) {
                showingIcons = true;
                output.append(this._iconsTableStart0, extraCSSText, this._iconsTableStart1);
            }

            output.append(this._tdStart);

            var showFocused = hasFocus && this._iconShouldShowFocused(icon, true);
            output.append(this.getIconHTML(icon, null, this.iconIsDisabled(icon), !!showFocused));
            output.append(this._tdEnd);
        }
        if (showingIcons) output.append(this._iconsTableEnd);

        return output.release(false);
    },

    // Helper method to determine if an item (or one of it's subItems) has focus before redraw
    _hasRedrawFocus : function (checkSubItems) {
        var hasFocus = this.hasFocus ||  this._hadFocusBeforeRedraw;

        // If we have sub items, check for whether one of those has focus
        if (checkSubItems && !hasFocus && this.items != null) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].hasFocus || this.items[i]._hadFocusBeforeRedraw) hasFocus = true;
                break;
            }
        }
        // Exception: If we're scrolled out of the containerWidget's viewport, don't refocus or
        // we'll natively jump scroll into view.
        return !!hasFocus;
    },
    
    // setupIconName
    // Given an icon object, ensure it has a unique name, autoGenerating one if appropriate
    // This method is called on init and on setIcons so should be able to test for 
    // uniqueness here.
    
    _setupIconName : function (icon, name) {
        if (name == null) name = icon.autoName || icon.name;
        // Backcompat: We used to use icon._id.
        // This was never exposed so developers shouldn't have been setting this
        // attribute but for safety, if this is set, respect it
        if (name == null && icon._id != null) {
            this.logWarn("Attempting to use '_id' property as icon name - this property has been deprecated in favor of 'name'");
            name = icon._id;
        }
        if (name != null) {
            // test for uniqueness - names must be unique or getIcon / updateIconSrc etc will fail
            var collisions = this.icons ? this.icons.findAll("name", name) : [];
            if (collisions != null && collisions.length > 0 &&
                (collisions.length > 1 || collisions[0] != icon))
            {
                this.logWarn("This form item has more than one icon with the same specified name:"
                    + name + ". Ignoring this name and using an auto-generated one instead.");
                name = null;
            } else {
                icon.name = name;
                return icon;
            }
        }
        if (this._nextIconId == null) this._nextIconId = 0;
        icon.name =  "_" + this._nextIconId++;
        return icon;
    },
    
    
    _getIconVAlign : function (icon) {
        // Don't write out a vertical-align css property for the picker icon
        if (this._pickerIcon && (icon == this._pickerIcon)) return null;
        
        var alignment = this.iconVAlign;
        
        if (alignment == isc.Canvas.TOP) {
            return "top";            
        } else if (alignment == isc.Canvas.BOTTOM) {
            return (isc.Browser.isSafari ? "bottom" : "text-bottom");
        } else if (alignment == isc.Canvas.CENTER) {
            return "middle"
        }
        
        // if we don't recognize the alignment, just return it. 
        return alignment;
    },
    
    // _getIconVMargin - return a value to write as a top / bottom margin onto the icons' img
    // tag
    
    _getIconVMargin : function () {
        return 0;
    },
    
    _getIconTextAlign : function (icon) {
        return this._iconTextAlign;
    },
    
    // Helper to get the prompt for the icon, if there is one.
    getIconPrompt : function (icon) {
        // don't show icon-specific prompt on hover over disabled icon (or disabled item with
        // icon, which is obviously also disabled).
        // We still show item level prompt for disabled items - this is useful for 
        // telling the user why an item is disabled, for example.
        if (this.iconIsDisabled(icon)) return null;
        return icon && icon.prompt || this.iconPrompt;
    },

    
    showErrorPickerIcon: false,
    showErrorHintStyle: false,

    // Gets the src for an icon's image.
    _$rtl: "rtl",
    getIconURL : function (icon, over, disabled, focused) {        
        var src = icon.src || this.defaultIconSrc;
        if (src == isc.Canvas._$blank) return isc.Canvas._blankImgURL;

        disabled = this.showDisabled && (disabled || this.iconIsDisabled(icon));
        
        var state = disabled ? isc.StatefulCanvas.STATE_DISABLED 
                            : over ? isc.StatefulCanvas.STATE_OVER : null,
            pieceName = (icon.showRTL && this.isRTL() ? this._$rtl : null),
            customState = icon.customState;

        // handle being passed a sprite configuration string
        // In this case update both the URL and the css class
        var spriteConfig = isc.Canvas._getSpriteConfig(src);
        if (spriteConfig != null) {
            if (spriteConfig.src != null) {
                spriteConfig.src = isc.Img.urlForState(spriteConfig.src, 
                                        false, focused, state, pieceName, customState);
            }
            if (spriteConfig.cssClass != null) {
                if (this.showErrorPickerIcon && this.hasErrors()) {
                    // support Error classes for the picker icon
                    spriteConfig.cssClass += "Error";
                }
                if (disabled) {
                    spriteConfig.cssClass += isc.StatefulCanvas.STATE_DISABLED;
                } else {
                    if (focused) spriteConfig.cssClass += isc.StatefulCanvas.FOCUSED;
                    if (over) spriteConfig.cssClass += isc.StatefulCanvas.STATE_OVER;
                }
                if (pieceName != null) spriteConfig.cssClass += pieceName
                if (customState != null) spriteConfig.cssClass += customState;
            }
            return spriteConfig;

        // Normal image URL
        }  else {
            if (this.showErrorPickerIcon && this.hasErrors()) {
                // support Error classes for the picker icon
                state = "Error" + state;
            }
            src = isc.Img.urlForState(src, false, focused, state, pieceName, customState);
            return src;            
        }
    },

    _$RTL: "RTL",
    getIconStyle : function (icon, over, disabled, focused) {
        if (!icon || icon.baseStyle == null) return null;
        var retValue = icon.baseStyle;
        if (this.showDisabled && (disabled || this.iconIsDisabled(icon))) {
            retValue += isc.StatefulCanvas.STATE_DISABLED;
        } else {
            if (focused) retValue += isc.StatefulCanvas.FOCUSED;
            if (over) retValue += isc.StatefulCanvas.STATE_OVER;
        }
        if (icon.showRTL && this.isRTL()) retValue += this._$RTL;
        if (icon.customState != null) retValue += icon.customState;
        return retValue;
    },


    
    getIconBackgroundColor : function (icon, over, disabled, focused) {
        return icon.backgroundColor;
    },

    // getIconHTML() retrieves the HTML for icons.
    // By default icons are written into the DOM after the form item. However we also use this
    // method for icons written directly into the form item's HTML (see the SelectItem for
    // an example of this).
    getIconHTML : function (icon, over, disabled, focused) {
        var inline = icon.inline && this._supportsInlineIcons(),
            width = this.getIconWidth(icon),
            height = this.getIconHeight(icon),
            hspace = (icon.hspace != null ? icon.hspace : this.iconHSpace),
            backgroundColor = this.getIconBackgroundColor(icon, over, disabled, focused),
            formID = this.form.getID(),
            // Remember - this is a global ID for this Form Item Instance, so can be used
            // as window[itemID].foo(), as well as being passed to the 'bubbleEvent()' method
            // on the Form.
            itemID = this.getItemID(),
            iconID = icon.name,
            iconStyle = this.getIconStyle(icon, over, disabled, focused),
            disabled = this.iconIsDisabled(icon),
            canTabToIcons = (this.canTabToIcons == null && this.form != null) 
                            ? this.form.canTabToIcons : this.canTabToIcons,
            tabIndex = disabled || canTabToIcons == false ? -1 : this._getIconTabIndex(icon);
      
        if (inline && icon.inlineIconAlign === "left") {
            hspace *= -1;
        }

        if (inline && icon.text != null) {
            var hspaceOnRight = this.isRTL();
            if (hspace < 0) {
                hspace *= -1;
                hspaceOnRight = !hspaceOnRight;
            }
            var vMargin = this._getIconVMargin(icon);
            // text icons use the link element ID on the wrapper
            var iconHTML = "<div role='button' id='" + this._getIconLinkId(iconID) + "'";

            if (iconStyle != null) iconHTML += " class='" + iconStyle + "'";

            var iconTextAlign = this._getIconTextAlign(icon);

            // inline style
            iconHTML += " style='display:inline-block";
            
            if (isc.Browser.isIE && isc.Browser.version <= 7) {
                if (iconStyle != null) {
                    width = Math.max(0, width - isc.Element._getHBorderPad(iconStyle));
                    height = Math.max(0, height - isc.Element._getVBorderPad(iconStyle));
                }
            } else {
                iconHTML += ";" + isc.Element._boxSizingCSSName + ":border-box";
            }

            // get line-height from the skin style, if it's there - otherwise, use height (legacy) 
            var styleObj = icon.baseStyle && isc.Element.getStyleDeclaration(icon.baseStyle);
            var lineHeight = parseInt(styleObj && styleObj.lineHeight);
            if (isNaN(lineHeight)) lineHeight = height;

            iconHTML += ";width:" + width +
                        "px;height:" + height +
                        "px;line-height:" + lineHeight +
                        "px;vertical-align:" + this._getIconVAlign(icon) +
                        (iconTextAlign ? ";text-align: " + iconTextAlign : "") +
                        ";margin-top:" + vMargin +
                        "px;margin-bottom:" + vMargin +
                        "px;" +
                        (hspaceOnRight ? "margin-right:" : "margin-left:") + hspace +
                        "px";
            if (backgroundColor != null) {
                iconHTML += ";background-color:" + backgroundColor;
            }
            iconHTML += ";overflow:hidden'";

            // ARIA attributes
            if (isc.Canvas.ariaEnabled()) {
                iconHTML += " aria-label='" + String.asAttValue(String.htmlStringToString(icon.prompt)) + "'";
                if (disabled) iconHTML += " aria-disabled='true'";
            }

            // misc. attributes
            if (disabled) iconHTML += " disabled='disabled'";
            iconHTML += " tabindex='" + tabIndex + "'";
            iconHTML += " " + isc.DynamicForm._containsItem + "='" + itemID + "'";
            iconHTML += " " + isc.DynamicForm._itemPart + "='" + iconID + "'";
            iconHTML += " handleNativeEvents='false'";

            iconHTML += ">" + icon.text + "</div>";
            return iconHTML;
        }

        var iconSrc = this.getIconURL(icon, over,disabled,focused),
            classText = (iconStyle == null ? isc.emptyString : " class='" + iconStyle + this._$singleQuote);

        var cursor = (disabled ? icon.disabledCursor : icon.cursor);
        // Use documented defaults if explicit cursor is not provided
        
        if (!cursor) cursor = (disabled ? isc.Canvas.DEFAULT : isc.Canvas.POINTER_OR_HAND);

        // If the icon is marked as 'imgOnly', just return the img tag - event handling should
        // be handled by the Form Item itself
        
        
        if (icon.imgOnly) {

            var extraStuff = (classText == null ? "" : classText + " "),
                eventStuff =  isc.DynamicForm._containsItem + "='" + itemID + "' " +
                              isc.DynamicForm._itemPart + "='" + iconID + "'";
            return this._getIconImgHTML(
                                this._getIconImgId(iconID),
                                width, 
                                height, 
                                this._getIconVAlign(icon),
                                this._getIconVMargin(icon),
                                // If it's just an image we always put hspace onto the image tag
                                // as a left margin
                                hspace,
                                backgroundColor,
                                iconSrc,
                                // do write out display:block for this case
                                !inline,
                                
                                extraStuff,
                                cursor,
                                eventStuff
                    );

        // We embed the icon in a link to make it focusable
        
        } else {
            
            if (isc.FormItem._iconTemplate == null) {
                isc.FormItem._iconHSpacePrefix = " style='margin-left:";
                isc.FormItem._iconHSpaceRTLPrefix = " style='margin-right:";

                isc.FormItem._iconTemplate = [
                    (this._useIconLinkElements
                        ? "<a role='button' ID='" : "<span role='button' ID='"),    // 0
                    ,                           // 1: link elementID: this._getIconLinkId(icon.name)
                    "'",                        // 2
                      
                    
                    isc.FormItem._iconHSpacePrefix,  // 3
                    ,                           // 4: icon h-space: hspace
                    "px;"
                    + (isc.Browser.isMoz ? "-moz-user-focus:" : ""),    // 5
                    ,                           // 6: normal / ignore (MOZ ONLY)
                    ,                           // 7: cursor:default if disabled, otherwise "hand"
                    

                    "' tabIndex=",              // 8
                    ,                           // 9: Tab index

                    " ",                        // 10: ARIA state

                    // Identifiers for the form item event handling system
                    isc.DynamicForm._containsItem,  // 11
                    "='",                       // 12
                    ,                           // 13: itemID
                    "' ",                       // 14
                    isc.DynamicForm._itemPart,  // 15
                    "='",                       // 16
                    ,                           // 17: iconID

                    // Allow the ISC event handling system to handle events occurring over
                    // this link.                    
                    "' handleNativeEvents=false>", // 18
                    ,                           // 19: this._getIconImgHTML()
                    (this._useIconLinkElements ? "</a>" : "</span>") // 20
                    

                ]
            }

            var template = isc.FormItem._iconTemplate;
            

            
            template[1] = this._getIconLinkId(iconID);

            var hspaceToLink = this._applyIconHSpaceToLink(icon);
            if (hspaceToLink) {
                if (this.isRTL()) {
                    template[3] = isc.FormItem._iconHSpaceRTLPrefix;
                } else {
                    template[3] = isc.FormItem._iconHSpacePrefix;
                }
                template[4] = hspace;
            } else {
                template[4] = "0"
            }

            //In Moz we need to set -moz-user-focus to disable focus if tabIndex < 0
            if (isc.Browser.isMoz) template[6] = (tabIndex < 0 ? "ignore;" : "normal;");

            if (!inline) {
                template[7] = ";display:block;height:" + height + "px;"
            } else {
                template[7] = null;
            }                
            template[9] = tabIndex;

            template[10] = " ";
            if (isc.Canvas.ariaEnabled() && !isc.Canvas.useLiteAria()) {
                // we use window.status to show the prompt, this won't work for a screenReader
                if (icon.prompt) {
                    template[10] = " aria-label='" + String.asAttValue(String.htmlStringToString(icon.prompt)) + "' ";
                }
                // advertise disabled state as well
                if (disabled) template[10] += " aria-disabled='true' ";
            }

            template[13] = itemID;
            template[17] = iconID;
            
            template[19] = this._getIconImgHTML(
                                this._getIconImgId(iconID),
                                width, 
                                height, 
                                this._getIconVAlign(icon),
                                this._getIconVMargin(icon),
                                (!hspaceToLink ? hspace : null),
                                backgroundColor,
                                iconSrc,
                                
                                !isc.Browser.isDOM || !isc.Browser.isIE,
                                classText,
                                cursor
                           );
            return template.join(isc.emptyString);

        }
    },
    
    // Helper method - Wherever possibly we apply icon hspace as margin-left on the Link item
    // around an icon rather than on the img tag. This avoids the dotted focus outline extending
    // to the left of the image when the icon has focus.
    // However 
    // - this doesn't work in IE
    // - in Safari / Chrome we've seen it introduce styling problems
    
    // - In Moz strict mode it also introduces styling problems, causing (for example) 
    //   the date picker icon to appear vertically misaligned with other icons.
    // - in some cases we don't write out a link element
    // So we can't always use this approach
    
    _applyIconHSpaceToLink : function (icon) {
        return (!isc.Browser.isIE && !isc.Browser.isSafari && !icon.imgOnly && !isc.Browser.isStrict);
    },
    
    // Use _getIconImgHTML() to get the HTML for the image, without the link tag 
    // Called from getIconHTML(), and also used for the error icon
    
    _$vAlignColon:"vertical-align:",
    _iconImgHTMLExtraCSSTextTemplate: [
        // Align the icon vertically as specified.
        
        ,                           // 0 vertical-align:, or null
        ,                           // 1 valign or null (this._getIconVAlign(icon))
        ";margin-top:",             // 2
        ,                           // 3: this._getIconVMargin(icon)
        "px;margin-bottom:",        // 4
        ,                           // 5: this._getIconVMargin(icon)
        "px;",                      // 6
        // Optional left margin for the icon
        ,                           // 7
        // Optional background-color for the icon
        ,                           // 8: background-color='xxx'
        ,                           // 9: optional display:block for strict mode
        ,                           // 10: optional cursor
        "-webkit-touch-callout:none" // 11 - disables Mobile Safari's "Save Image" dialog
                                     // The "Save Image" dialog is prevented in Chrome for Android
                                     // by canceling the native 'contextmenu' event.
                                     // See DynamicForm.handleShowContextMenu()
    ],
    _getIconImgHTML : function (imgID, width, height, vAlign, vMargin, hspace, backgroundColor,
                                src, displayBlock, extraStuff, cursor, eventStuff)
    {
        // Get the icon Img HTML from the Canvas 'imgHTML()' method.  This handles displaying
        // PNG type files as well as other img files.

        
        var template = this._iconImgHTMLExtraCSSTextTemplate;

        if (vAlign != null) {
            template[0] = this._$vAlignColon;
            template[1] = vAlign;
        } else {
            template[0] = null;
            template[1] = null;
        }

        // apply any top / bottom margin to the icon
        
        template[3] = vMargin;
        template[5] = vMargin;

        if (hspace != null) {
            
            var hspaceOnRight = this.isRTL();
            if (hspace < 0) {
                hspace *= -1;
                hspaceOnRight = !hspaceOnRight;
            }
            template[7] = (hspaceOnRight ? "margin-right:" : "margin-left:") + hspace + "px;";
        } else {
            template[7] = null;
        }

        template[8] = (backgroundColor != null ? "background-color:" + backgroundColor + ";" : null);

        
        if (displayBlock) template[9] = "display:block;";
        else template[9] = ""

        template[10] = (cursor != null ? "cursor:" + cursor + ";" : null);

        var extraCSSText = template.join(isc._emptyString);

        if (extraStuff == null) {
            extraStuff = " id='" + imgID + "'";
        } else {
            extraStuff += " id='" + imgID + "'";
        }

        
        var imgParams = isc.FormItem._imgParams = isc.FormItem._imgParams || 
                { align:isc.Browser.isSafari ? "absmiddle" : "TEXTTOP" };
        imgParams.src = src;
        imgParams.width = width;
        imgParams.height = height;
        imgParams.extraCSSText = extraCSSText;
        imgParams.extraStuff = extraStuff;
        imgParams.eventStuff = eventStuff;
        return isc.Canvas.imgHTML(imgParams);
    },

    // -------------------------
    // icons methods
    //

    // Icons consist of 2 elements - an image surrounded by a link
    // Internal methods _getIconLinkId() and _geticonImgId() return a unique identifier for
    // these elements based on some icon's ID
    _ImgIDCache:{},
    _$_iLink_:"_iLink_",
    _$_iImg_:"_iImg_",
    _getIconLinkId : function (id) {
        // inactiveHTML - avoid caching the IDs here - we'll not be needing to get at the generated
        // link/img elements directly
        if (this.isInactiveHTML()) {
            return this._getDOMID(this._$_iLink_ + id);
        }
        if (!this._iLinkIDCache) this._iLinkIDCache = {};
        var cache = this._iLinkIDCache;
        if (!cache[id]) {
            // doing our own cacheing so don't have _getDOMID also cache the result
            cache[id] = this._getDOMID(this._$_iLink_ + id, true);
        }
        return cache[id];
    },
    _getIconImgId : function (id) {
        // inactiveHTML - avoid caching the IDs here - we'll not be needing to get at the generated
        // link/img elements directly
        if (this.isInactiveHTML()) {
            return this._getDOMID(this._$_iImg_ + id);
        }
        if (!this._iImgIDCache) this._iImgIDCache = {};
        var cache = this._iImgIDCache;
        if (!cache[id]) {
            // doing our own cacheing so don't have _getDOMID also cache the result
            cache[id] = this._getDOMID(this._$_iImg_ + id, true);
        }
        return cache[id];
    },
    

    // Internal methods to get a pointer to Icon's HTML elements in the DOM
    
    _getIconLinkElement : function (icon) {
        icon = this.getIcon(icon);
        if (icon == null || icon.imgOnly) return null;
        var elementID = this._getIconLinkId(icon.name);       
        return isc.Element.get(elementID);
    },
    
    _getIconImgElement : function (iconName) {
        var icon = this.getIcon(iconName);
        if (icon == null) {
            if (iconName == this.errorIconName) {
                return isc.Element.get(this.getErrorIconId());
            }
            return null;
        }

        var elementID = this._getIconImgId(icon.name);
        return isc.Element.get(elementID);
    },
    
    // Helper method - determines whether the some event occurred over one of our icons based
    // on the native target element for the event.
    
    _getTargetIcon  : function (element) {
        if (!element || !this.icons) return null;
        
        var itemInfo = isc.DynamicForm._getItemInfoFromElement(element);
        if (!itemInfo || itemInfo.item != this) return null;
        return itemInfo.icon;
    },

    isPickerIcon : function (icon) {
        // return true if the passed icon is the pickerIcon
        if (isc.isAn.Object(icon)) return icon.pickerIcon;
        var pickerIcon = this.getPickerIcon();
        return (pickerIcon && pickerIcon.name == icon);
    },
    
    // _shouldShowIcon() helper method to evaluate 'showIf' property on form item icons
    _$true:"true",
    _$false:"false",
    
    // _getShowIconOnFocus() - returns true if icon.showOnFocus or the appropriate
    // item-level equivalents are set.
    _getShowIconOnFocus : function (icon) {
            var showOnFocus = icon.showOnFocus;
            
            if (showOnFocus == null) {
                showOnFocus = icon.pickerIcon ? this.showPickerIconOnFocus : this.showIconsOnFocus;
            }
            
            return !!showOnFocus;
    },
    // Typically developers don't want *disabled* icons to show on focus.
    // An example of this is the pickerIcon for a read-only item.
    // Catch this case and return false even if we have focus
    // (Support flags to allow disabled icons to show on focus if a dev actually wants that)
    _getShowDisabledIconOnFocus : function (icon) {
        var showDisabledOnFocus = icon.showDisabledOnFocus;
        if (showDisabledOnFocus == null) {
            showDisabledOnFocus = icon.pickerIcon 
                    ? this.showDisabledPickerIconOnFocus : this.showDisabledIconsOnFocus;
        }
        return showDisabledOnFocus;
    },
    
    
    // _resolveIconsVisibility: Called on redraw. Evaluate showIf / showOnFocus etc
    // to determine whether each icon should be displayed and remember the result in 
    // 'icon.visible'.
    // This doesn't actually update the DOM. That's handled by upstream code
    _resolveIconsVisibility : function () {
        
        if (this.showPickerIcon) {
            // re-evaluate showIf etc and remember the result as icon.visible
            var pickerIcon = this.getPickerIcon();
            pickerIcon.visible = this._shouldShowIcon(pickerIcon);
            
        }
    
        if (!this.icons) return;
        
        var icons = this.icons,
            recomputeInlineIconsWidth = false;
        
        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];
            
            // If the icon's ID hasn't been set yet, set it now
            
            if (icon.name == null) {
                this._setupIcon(icon);
            }
            
            var wasVisible = icon.visible,
                isVisible = this._shouldShowIcon(icon);
            if (wasVisible != isVisible) {
                icon.visible = isVisible;
            }
            
            // We cache some sizing information for inline icons based on what's
            // currently visible. If our set of shown/hidden inline icons changes
            // recalculate this cached value.
            
            if (icon.inline) {
                if (icon.inline) recomputeInlineIconsWidth = true;
            }
        }

        // recompute padding etc for inline icons if this has changed.        
        if (recomputeInlineIconsWidth) {
            this._recomputeLeftAndRightInlineIconsWidth();
        }
    },
    
    
    
    // _shouldShowIcon()
    // Evaluates icon.showIf / showIconOnFocus etc to determine if 
    // an icon should be displayed.
    
    _shouldShowIcon : function (icon, hasFocus) {
        if (icon == null) return false;
        
        // showPickerIcon false:
        if (icon.pickerIcon && !this.showPickerIcon) return false;
        
        // this flag is set by hideIconsOnKeypress - it overrides other dynamic
        // visibility properties.
        if (!icon.pickerIcon && this._iconsHiddenForKeypress) return false;
        

        // If showOnFocus is true, only show if we have focus
        
        if (this._getShowIconOnFocus(icon)) {

            // Test for showOnFocus / showDisabledOnFocus type behavior:
            if (hasFocus == null) hasFocus = this._hasRedrawFocus(true);
            
            // If we don't have focus don't show
            // * Exception: Treat 'showingPickList' as having focus, but only if the picker is 
            // visible - a pending fetch can mean the item blurs after _showingPickList is set
            // to true, but before the picklist if ready to show
            if (hasFocus == false) {
                if (!this._showingPickList) return false;
                if (this._isPickListVisible && !this._isPickListVisible()) {
                    //this.logWarn("picker not visible - hiding icon");
                    return false;
                }
            }
            
            // If showOnFocus is true, and the icon is disabled, potentially avoid
            // showing it even if we do have focus
            if (this.iconIsDisabled(icon) && !this._getShowDisabledIconOnFocus(icon)) {
                return false;
            }
            
            // In this case we have focus and showOnFocus is true. Allow an explicit
            // showIf to still suppress the icon rather than just returning true here.
        }
        return this._evaluateIconShowIf(icon);
    },
    _evaluateIconShowIf : function (icon) {
        
        // if printing, or if canEdit is false and readOnlyDisplay is "static", show no icon
        
        if (this._isPrinting() || (this.renderAsStatic() && icon.pickerIcon)) {
            return false;
        }

        // optimize handling of cases where we don't need to build a function
        if (icon.showIf == null) return true;
        
        if (icon.showIf === true  || icon.showIf == this._$true)  return true;
        if (icon.showIf === false || icon.showIf == this._$false) return false;

        // Note - icons are simple objects and have no stringMethodRegistry, so we must
        // use replaceWithMethod() to convert to a method (if it's currently a string)
        isc.Func.replaceWithMethod(icon, "showIf", "form,item");
        return !!icon.showIf(this.form, this);
    },

    _pickerIconVisible : function () {
        if (!this.showPickerIcon) return false;

        // we currently suppress the pickerIcon/control table when printing
        if (this._isPrinting()) {
            return false; 
        }

        var pickerIcon = this.getPickerIcon();
        if (pickerIcon && pickerIcon.visible) {
            return true;
        }
        return false;
    },
    
    //> @attr formItem.alwaysShowControlBox (Boolean : null : IRA)
    // A formItem showing a +link{formItem.showPickerIcon,pickerIcon} will always
    // write out a "control box" around the text box and picker icon. This is an HTML
    // element styled using the specified +link{formItem.controlStyle}.
    // <P>
    // This attribute controls whether the control box should be written out even
    // if the picker icon is not being shown. If unset, default behavior will write out
    // a control table if +link{formItem.showPickerIcon} is true and the icon is
    // not suppressed via +link{formItemIcon.showIf()}. This means the control table
    // can be written out with no visible picker if +link{formItem.showPickerIconOnFocus}
    // is true and the item does not have focus.
    // <P>
    // This attribute is useful for developers who wish to rely on styling specified
    // via the +link{formItem.controlStyle} even while the picker icon is not visible.
    // <P>
    // See the +link{group:formItemStyling,form item styling overview} for details of the
    // control table and other styling options.
    //
    // @visibility external
    //<
    _writeControlTable : function () {
        // Have we actually written out the picker icon? If so we of course need
        // a control table.
        if (this._pickerIconVisible()) return true;
        
        // Allow dev to explicitly choose whether to show a control table without a
        // picker icon
        if (this.alwaysShowControlBox != null) return this.alwaysShowControlBox;
        
        // Default behavior: Write out a control table if we have a pickerIcon which isn't
        // suppressed via showIf (or static HTML being written out).
        // This doesn't guarantee the pickerIcon is visible: We *do* write the control table
        // if the thing is hidden due to showPickerIconOnFocus returning false.
        if (this.showPickerIcon) {
            var pickerIcon = this.getPickerIcon();
            if (pickerIcon && this._evaluateIconShowIf(pickerIcon)) return true;
        }
        return false;
    },

    
    _writeIconIntoItem : function (icon) {
        if (icon.writeIntoItem) return true;
        return false;
    },

    _mayShowIcons : function () {
        return this.showIcons && this.icons != null;
    },

    // getTotalIconsWidth()
    // Method to return the horizontal drawn space taken up by all this form item's icons.
    // This enables us to size the form's HTML element appropriately.
    getTotalIconsWidth : function () {
        if (!this._mayShowIcons()) return 0;

        var width = 0,
            hasFocus = this._hasRedrawFocus(true),
            supportsInlineIcons = this._supportsInlineIcons();
        for (var i = 0; i < this.icons.length; i++) {
            var icon = this.icons[i];
            // skip hidden icons, or those that aren't written into the normal table.
            
            if (!icon.visible || this._writeIconIntoItem(icon) ||
                (supportsInlineIcons && icon.inline))
            {
                continue;
            }

            width += (icon.width != null ? icon.width : this.iconWidth) + 
                        (icon.hspace != null ? icon.hspace : this.iconHSpace);
            // if the icon has a baseStyle, include its border and padding
            if (icon.baseStyle) width += isc.Element._getHBorderPad(icon.baseStyle);
        }
        return width;
    },

    getIconsHeight : function () {
        if (!this._mayShowIcons()) return 0;

        var maxHeight = 0,
            hasFocus = this._hasRedrawFocus(true);
        for (var i = 0; i < this.icons.length; i++) {
            var icon = this.icons[i];
            if (!icon.visible || this._writeIconIntoItem(icon)) {
                continue;
            }
            var iconHeight = (icon.height != null ? icon.height : this.iconHeight);
            // If we're writing margins out, the icons will take up more space
            iconHeight += this._getIconVMargin() *2;
            if (iconHeight > maxHeight) maxHeight = iconHeight;
        }

        return maxHeight;
    },

    //>@method setIcons() 
    //  Programmatically update the icons for this Form Item.  Will redraw the form item to show
    //  the new icons
    //  @param  icons   (Array) Array of icon definition objects
    //<
    
    setIcons : function (icons) {
        this._removeIcons();
        this.icons = icons;
        this._setUpIcons();
        this.redraw();
    },

    //> @method FormItem.addIcon()
    // Adds a +link{FormItemIcon} to this item.  If the optional index parameter is not passed,
    // the icon is added to the end of the existing +link{formItem.icons, icon list}.
    // <P>
    // If the passed icon already exists in the +link{formItem.icons, icon list}, by 
    // +link{formItemIcon.name, name}, the original icon is moved to the new index and no new 
    // icon is added.
    // @param icon (FormItemIcon) the icon to add
    // @param [index] (int) the index to add the icon at - if omitted, add the icon to the end 
    //          of the current icon list
    // @return (FormItemIcon) the live form item icon
    // @visibility external
    //<
    addIcon : function (icon, index) {
        if (icon == null) return;
        if (this.icons == null) this.icons = [];
        
        if (index == null) index = this.icons.length;
        // use getIcon() to get the icon by name
        var currentIcon = this.getIcon(icon.name);
        var currentIndex = this.icons.indexOf(currentIcon);
        if (currentIndex >= 0) {
            // the icon's already present - move it to the requested index (the end, if not passed)
            if (index != currentIndex) this.icons.slide(currentIndex, index);
        } else {
            this.icons.addAt(icon, index);
        }
        this.setIcons(this.icons);
        return this.getIcon(icon.name);
    },
    
    //> @method FormItem.removeIcon()
    // Given an icon's +link{formItemIcon.name, name}, remove it from this item.
    // @param icon (Identifier) the name of the icon to remove
    // @return (boolean) true if an icon was removed, false otherwise
    // @visibility external
    //<
    removeIcon : function (icon) {
        if (!this.icons || this.icons.length == 0) return;
        
        // deal with the actual icon being passed, rather than it's name
        var iconName = isc.isA.String(icon) ? icon : icon.name;
        var iconInstance = this.getIcon(iconName);
        
        if (iconInstance) {
            // remove the icon, refresh the remaining ones and return true
            isc.TabIndexManager.removeTarget(this.getTabIndexIdentifierForIcon(iconInstance));
            this.icons.remove(iconInstance);
            iconInstance = null;
            this.setIcons(this.icons);
            return true;
        }
        return false;
    },

    getIconByProperty : function (key, value) {
        if (this.icons != null) return this.icons.find(key, value);
    },

    // enable / disable icons at runtime
    // (Used by 'setDisabled')
    setIconEnabled : function (icon) {
        icon = this.getIcon(icon);
        if (!icon) return;

        // Track the enabled / disabled state on the icon. This avoids us updating the 
        // HTML if we don't have to.
        var enabled = !this.iconIsDisabled(icon);
        if (!!icon._disabled != enabled) return;
        if (!enabled) icon._disabled = true;
        else delete icon._disabled;

        if (!this.isDrawn()) return;

        var linkElement = this._getIconLinkElement(icon),
            imgElement = this._getIconImgElement(icon);

        // Enabling / disabling an icon will modify:
        // - tabIndex (can't tab to disabled icons);
        //   - focus altogether
        // - ARIA state and HTML5 disabled attribute
        // - disabled image should be shown if there is one.
        // - possibly the style
        if (linkElement != null) {
            // Note - if we did a 'this.setElementTabIndex(-1)' on 'setDisabled(true)' there
            // would be no need for this, as that will also update the tabIndex of icons.
            // However we don't by default because applying the native 'disabled' state to
            // the native HTML form elements will already remove them from the page's tab order.
            if (!enabled) {
                isc.FormItem.setElementTabIndex(linkElement, -1);
                linkElement.style.cursor = "default"
            } else {
                isc.FormItem.setElementTabIndex(linkElement, this._getIconTabIndex(icon))
                linkElement.style.cursor = "";
            }
            if (isc.Canvas.ariaEnabled()) linkElement.setAttribute("aria-disabled", !enabled);
            linkElement.disabled = !enabled;

            // text icons apply the base style to the linkElement
            if (icon.inline && this._supportsInlineIcons() && icon.text != null) {
                var styleName = this.getIconStyle(icon, null, !enabled);
                if (styleName != null) linkElement.className = styleName;
            }
        }
        if (imgElement != null) {
            var src = this.getIconURL(icon, null, !enabled);
            isc.Canvas._setImageURL(imgElement, src);
            var styleName = this.getIconStyle(icon, null, !enabled);
            if (styleName != null) imgElement.className = styleName;
            // set the mouse cursor to an arrow if disabled and a hand otherwise
            imgElement.style.cursor = !enabled ? "default" : isc.Canvas.POINTER_OR_HAND;
        }
    },

    //> @method formItem.setIconDisabled()    (A)
    // Set an icon as enabled or disabled at runtime. 
    // @param icon (Identifier) +link{FormItemIcon.name,name} of the icon to be disabled/enabled.
    // @param disabled (boolean) true if icon should be disabled
    // @see attr:FormItemIcon.disabled
    // @group enable
    // @visibility external
    //<
    setIconDisabled : function (icon, disabled) {
        icon = this.getIcon(icon);
        if (!icon) return;

        var wasDisabled = this.iconIsDisabled(icon);
        icon.disabled = disabled;
        if (wasDisabled != disabled) {
            this.setIconEnabled(icon);
        }
    },

    //> @method formItem.enableIcon()
    // This method will enable some icon in this item's +link{formItem.icons} array, if it is 
    // currently disabled.
    //
    // @param icon (Identifier) +link{FormItemIcon.name,name} of the icon to be enabled.
    // @see attr:FormItemIcon.disabled
    // @group enable
    // @visibility external
    //<
    enableIcon : function (icon) {
        this.setIconDisabled(icon, false);
    },

    //> @method formItem.disableIcon()
    // This method will disable some icon in this item's +link{formItem.icons} array, if it is 
    // currently enabled.
    //
    // @param icon (Identifier) +link{FormItemIcon.name,name} of the icon to be disabled.
    // @see attr:FormItemIcon.disabled
    // @group enable
    // @visibility external
    //<
    disableIcon : function (icon) {
        this.setIconDisabled(icon, true);
    },

    _setIconVisibilityRequiresRedraw : function (icon, isShow) {
        
        var isInline = isShow && this._supportsInlineIcons() && icon.inline;
        return this.redrawOnShowIcon || isInline || icon.writeIntoItem ||
               icon.redrawOnShowIcon;
    },
    
    //> @method  formItem.showIcon()  
    // This method will show some icon in this item's +link{formItem.icons} array, if it is not
    // already visible. Note that once this method has been called, any previously specified
    // +link{formItemIcon.showIf} will be discarded.
    // <P>
    // Note that if the form item's showIcons property is set to false, no icons will be displayed
    // for the item. In this case this method will not cause the icon to be displayed.
    //
    // @param icon (Identifier) +link{FormItemIcon.name,name} of the icon to be shown.
    // @visibility external
    //<    
    showIcon : function (icon) {
        // icon param doc'd as being icon name but support index or raw icon object too.
        if (isc.isA.String(icon) || isc.isA.Number(icon)) icon = this.getIcon(icon);

        if (!isc.isAn.Object(icon)) return;

        // If the icon's ID hasn't been set yet, set it now
        
        if (icon.name == null) {
            this._setupIcon(icon);
        }
        
        var wasVisible = icon.visible;
        
        // Override 'showIf' to return true. The icon is 'permanently' shown
        icon.showIf = this._$true;
        if (!wasVisible && this._shouldShowIcon(icon)) {
            var hasFocus = this._hasRedrawFocus(true),
                showFocus = hasFocus && this._iconShouldShowFocused(icon, true);
        
            this._showIcon(icon, showFocus);
        }
        
    },
    
    // _showIcon() Used internally to actually update the DOM to show an icon.
    // Will cause a redraw if the icon can't be injected into the DOM dynamically.
    
    _showIcon : function (icon, showFocused) {
    
        // update the "visible" flag.
        
        icon.visible = true;

        // showIcons trumps individual icon visibility
        // if we're undrawn, nothing to do.        
        if (!this.showIcons || !this.containerWidget.isDrawn() || !this.isVisible()) return;
        
        
        if (this._setIconVisibilityRequiresRedraw(icon, true) || 
            this.containerWidget.isDirty()) 
        {
            this.redraw();
            return;
        }
        
        // Otherwise we're going to show/hide the icon without redrawing the whole form
        
        var iconCellElement = isc.Element.get(this.getIconCellID());
        if (iconCellElement != null) {

            // If no icons are visible just get getIconsHTML to get full HTML, including
            // an outer table we write out to ensure we don't wrap icons.
            if (iconCellElement.childNodes.length == 0) {
            
                
                iconCellElement.innerHTML = this.getIconsHTML(!!icon.pickerIcon);

            } else {
                var iconHTML = this.getIconHTML(icon, null, this.renderAsDisabled(),
                                                showFocused),
                    // We write icons into separate cells of a table...
                    cellHTML = "<td>" + iconHTML + "</td>",
                    
                    iconTable = iconCellElement.firstChild, 
                    index = 0;
                for (var i = 0; i < this.icons.length; i++) {
                    if (this.icons[i] == icon) break;
                    if (this.icons[i].visible) {
                        index++;
                    }
                }
                if (index == 0) {
                    isc.Element.insertAdjacentHTML(iconTable.rows[0], "afterBegin", 
                                                   cellHTML);
                } else {            
                    isc.Element.insertAdjacentHTML(iconTable.rows[0].cells[index-1], 
                                                   "afterEnd", cellHTML);
                }
            }
            
            

            // Fire _iconVisibilityChanged().  This method will handle resizing the form
            // item element to accommodate the space taken up by the newly shown icon.
            this._iconVisibilityChanged();
            // notify the icon that it has been written into the DOM so we can set u
            // eventHandlers for it.
            
            this._iconDrawn(icon);

        // No icon cell element - must redraw.  
        // This could happen if this.icons was null so we didn't write an outer-table
        // at all
        } else {
            
            this.logInfo("showIcon(): Unable to dynamically update icon visibility - " +
                         "redrawing the form", "formItemIcons");
            this.redraw();
        }
    },
    
    //> @method  formItem.hideIcon()  
    // This method will hide some icon in this item's +link{formItem.icons} array, if it is 
    // currently visible. Note that once this method has been called, any previously specified
    // +link{formItemIcon.showIf} will be discarded.
    //
    // @param icon (Identifier) +link{FormItemIcon.name,name} of the icon to be hidden.
    // @visibility external
    //<
    hideIcon : function (icon) {
        // icon param doc'd as being icon name but support index or raw icon object too.
        if (isc.isA.String(icon) || isc.isA.Number(icon)) icon = this.getIcon(icon);

        if (!isc.isAn.Object(icon)) return;

        // If the icon's ID hasn't been set yet, set it now
        
        if (icon.name == null) {
            this._setupIcon(icon);
        }
        
        var wasVisible = icon.visible;
        
        // Override 'showIf' to return false. The icon is 'permanently' shown
        icon.showIf = this._$false;
        
        
        if (wasVisible && !this._shouldShowIcon(icon)) {
            this._hideIcon(icon);
        }        
    },

    // actually update the DOM to hide an icon. May require a redraw
    _hideIcon : function (icon) {

        // update the "visible" flag.
        
        icon.visible = false;

        // Only force a redraw / remove from the DOM if the widget was previously visible
        if (!this.showIcons || !this.containerWidget.isDrawn() || !this.isVisible()) return;
        
        // If we require a redraw, do it and rely on logic in that flow
        // to write out the appropriate set of icons.
        
        if (this._setIconVisibilityRequiresRedraw(icon, false) || this.containerWidget.isDirty())
        {
            this.redraw();
            return;
        }
        
        // Otherwise we're going to show/hide the icon without redrawing the whole form
        var element = icon.imgOnly  ? this._getIconImgElement(icon) 
                                    : this._getIconLinkElement(icon);
        
        if (element == null) {
            this.logInfo("hideIcon(): Unable to dynamically update icon visibility - " +
                         "redrawing the form");
            this.redraw();
            return;
        }

        //this.logWarn("would remove element: " + this.echo(element) + 
        //             " from parentNode: " + this.echo(element.parentNode));
        var cell = element.parentNode;
        // sanity check - the external icons are all written into a table - verify
        // that the parent element *is* a td element
        if (cell.tagName != "TD") {
            isc.Element.clear(element);
        } else {
            
            cell.parentNode.removeChild(cell);
        }

        // For inline icons we need to recalculate padding so text doesn't end up
        // oddly offset.        
        var isInline = this._supportsInlineIcons() && icon.inline;
        if (isInline) this._recomputeLeftAndRightInlineIconsWidth();

        // Fire _iconVisibilityChanged().  This method will handle resizing the form
        // item element to accommodate the space taken up by the newly shown icon.
        this._iconVisibilityChanged();
    },

    //> @method formItem.setIconShowOnFocus()
    // Sets +link{formItemIcon.showOnFocus} for the supplied icon, and causes that icon's
    // visibility to be updated and the item redrawn as appropriate.
    //
    // @param icon (Identifier) +link{FormItemIcon.name,name} of the icon to update
    // @param showOnFocus (Boolean) new value of +link{formItemIcon.showOnFocus}
    //
    // @group formIcons
    // @visibility external
    //<
    setIconShowOnFocus : function (icon, showOnFocus) {
        icon.showOnFocus = showOnFocus;
        this._updateOnFocusIconVisibility([icon]);
    },

    //> @method formItem.setShowIconsOnFocus()
    // Sets +link{showIconsOnFocus} and causes the visibility of all +link{icons} to be updated
    // and the item redrawn as appropriate.
    //
    // @param showIconsOnFocus (Boolean) new value of +link{showIconsOnFocus}
    //
    // @group formIcons
    // @visibility external
    //<
    setShowIconsOnFocus : function (showIconsOnFocus) {
        this.showIconsOnFocus = showIconsOnFocus;
        this._updateOnFocusIconVisibility();
    },

    //> @method formItem.setShowPickerIconOnFocus()
    // Sets +link{showPickerIconOnFocus} and causes the visibility of the picker icon to be
    // updated and the item redrawn as appropriate.
    //
    // @param showPickerIconOnFocus (Boolean) new value of +link{showPickerIconOnFocus}
    //
    // @group formIcons
    // @visibility external
    //<
    setShowPickerIconOnFocus : function (showPickerIconOnFocus) {
        this.showPickerIconOnFocus = showPickerIconOnFocus;
        this._updateOnFocusIconVisibility([this.getPickerIcon()]);
    },

    // _iconVisibilityChanged()
    // Notification fired when showIcon() or hideIcon() succussfully completes having 
    // manipulated the DOM to show/hide an icon.
    // Default implementation will resize the form item element to accommodate the space
    // taken up by its visible icons.
    // Will not be fired if showIcon() or hideIcon() fell through to form.markForRedraw().
    _iconVisibilityChanged : function () {
        this._resetWidths();
    },

    // _setIconVisibilityForFocus / _hideIcons
    // - supports 'showOnFocus' / 'showIconsOnFocus' / 'showPickerIconOnFocus' behavior
    _setIconVisibilityForFocus : function (hasFocus, iconsToUpdate)
    {
    
        var undef;
        hasFocus = !!hasFocus;
        // If hideIconsOnKeypress is true, reset the flag to hide icons on blur.
        if (!hasFocus) delete this._iconsHiddenForKeypress;

        var icons = iconsToUpdate ? iconsToUpdate : [];
        if (!iconsToUpdate) {
             if (this.showPickerIcon) icons.add(this.getPickerIcon())
             if (this.icons != null) {
                icons.addList(this.icons);
             }
        }
        if (icons.length == 0) {
            return;
        }
        var iconsToShow = [],
            iconsToHide = [],
            showIcons = this.showIcons,
            showingPicker = this._showingPickList
        ;

        // update visibility for the main set of icons
        
        var logDebug = this.logIsDebugEnabled("icons");
        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i],
                wasVisible = icon.visible,
                isShow = this._shouldShowIcon(icons[i], hasFocus);
                
            if (logDebug) {
                this.logDebug("Setting icons visibility for focus - icon " 
                    + (icon.pickerIcon ? "(picker)" : this.icons.indexOf(icon)) + 
                        ((wasVisible == isShow) ? " visibility unchanged." :
                            (isShow ? " showing." : " hiding.")), "icons");
            }

            // We can skip already showing or already hidden icons.
            if (isShow == wasVisible) {
                // Ensure focused state is applied if necessary
                if (wasVisible) {
                     this._updateIconForFocus(icon, hasFocus);
                }
                continue;
            }
                
            var requiresRedraw = this._setIconVisibilityRequiresRedraw(icon, isShow);
            if (requiresRedraw) {
                if (logDebug) {
                    this.logDebug("Set icon visibility requires item redraw", "icons");
                }
                this.redraw();
                return;
            }
            if (isShow) {
                // Skip the case where the icon is disabled and we aren't
                // showing disabled icons on focus
                
                iconsToShow.add(icon);
                
            } else {
                iconsToHide.add(icon);
            }
        }

        // first process all of the icons to be shown
        
        for (var i = 0; i < iconsToShow.length; i++) {
            var shouldShowFocused = this._iconShouldShowFocused(iconsToShow[i], hasFocus);
            this._showIcon(iconsToShow[i], hasFocus && shouldShowFocused);
        }

        if (iconsToHide.length > 0 && !iconsToUpdate) {
            for (var i = 0; i < iconsToHide.length; i++) {
                this._hideIcon(iconsToHide[i]);
            }    
        }
    },
    
    _hideIconsForKeypress : function () {
        // Temporary flag indicating icons are hidden while the user
        // is focused in this item.
        // Will be cleared on blur.
        this._iconsHiddenForKeypress = true;

        var icons = this.icons;
        if (!icons || icons.length == 0) {
            return;
        }
        var iconsToHide = [];
        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];
            if (!icon.visible) continue;
            if (this._setIconVisibilityRequiresRedraw(icon, false) || 
                this.containerWidget.isDirty())
            {
                this.redraw();
                return;
            }
            iconsToHide.add(icon);
        }

        for (var i = 0; i < iconsToHide.length; i++) {            
            this._hideIcon(iconsToHide[i]);
        }
    },

    // update current icon visibility to reflect "show on focus" settings
    _updateOnFocusIconVisibility : function (icons) {
        
        var hasFocus = this._hasRedrawFocus(true);
        if (!hasFocus) this._setIconVisibilityForFocus(false, icons);
    },

    //> @method FormItem.getIcon()
    // Given a +link{formItemIcon.name}, returns the <code>FormItemIcon</code> object.
    // @param name (Identifier) specified +link{formItemIcon.name}
    // @return (FormItemIcon) form item icon matching the specified name, or <code>null</code>
    // if there is no such icon.
    // @visibility external
    //<
    getIcon : function (name) {
        if (name == null) return;

        var icon;
        if (this.icons) {
            if (isc.isA.Number(name)) {
                return this.icons[name];
            }
            for (var i = 0; i < this.icons.length; i++) {
                // make sure we fire the click action of the appropriate object in the 'icons' array
                if (this.icons[i] == name || this.icons[i].name == name) icon = this.icons[i];
            }
        }
        if (!icon && this.showPickerIcon) {
            if (this.isPickerIcon(name)) icon = this.getPickerIcon();
        }
        if (!icon) {
            this.logInfo("FormItem unable to get pointer to icon with name:"+ name +
                         " - Invalid name, or icons array has been inappropriately modified." +
                         " To update icon[s] for some form item, use the method 'setIcons()'.")
        }
        return icon;
    },


    // _setIconState() - an internal method to show the 'over' / 'focused' image for an icon.
    _setIconState : function (icon, over, focused) {
        // If we weren't explicitly passed 'focused', look at this.hasFocus 
        if (focused == null) focused = this.hasFocus && this._iconShouldShowFocused(icon, true);

        focused = focused && !this.iconIsDisabled(icon);

        var styleName = this.getIconStyle(icon, over, null, focused);
        if (icon.inline && this._supportsInlineIcons() && icon.text != null) {
            var linkElem = this._getIconLinkElement(icon);
            if (linkElem != null && styleName != null) linkElem.className = styleName;
        } else {
            var iconImg = this._getIconImgElement(icon);
            if (iconImg != null) {
                var src = this.getIconURL(icon, over, null, focused);
                isc.Canvas._updateImage(iconImg, src, null, this.containerWidget, styleName,
                                        this);
            }
        }
    },
    
    _iconShouldShowOver : function (icon) {
        if (!icon || this.iconIsDisabled(icon)) return false;
        if (icon.showOver != null) return icon.showOver;
        // Allow a pickerIcon to show over if 'updatePickerIconOnOver' is true
        // even if showOver wasn't explicitly set on the icon.
        if (this.showOver && (this.updatePickerIconOnOver != false) && 
            this.isPickerIcon(icon)) 
        {
            return true;
        }
        return this.showOverIcons;
    },
    
    _iconShowOverWhen : function (icon) {
        if (icon.showOverWhen) return icon.showOverWhen;
        return "icon";        
    },

    _iconShouldShowFocused : function (icon, itemFocus) {
        if (!icon || this.iconIsDisabled(icon)) return false;
        if (itemFocus && icon.showFocusedWithItem == false) return false;
        if (icon.showFocused != null) return icon.showFocused;
        return this.showFocusedIcons;
    },

    // setIconBackgroundColor() - change the backgroundColor of an icon
    // (used by ColorItem).
    setIconBackgroundColor : function (icon, color) {
        icon.backgroundColor = color;

        var backgroundColorElem;
        if (icon.inline && this._supportsInlineIcons() && icon.text != null) {
            backgroundColorElem = this._getIconLinkElement(icon);
        } else {
            backgroundColorElem = this._getIconImgElement(icon);
        }
        if (backgroundColorElem != null) {
            
            try {
                backgroundColorElem.style.backgroundColor = color == null ? "" : color;
            } catch (e) {}
        }
    },

    // set the customState of an icon
    setIconCustomState : function (icon, customState) {
        if (icon.customState != customState) {
            icon.customState = customState;
            this._setIconState(icon);
        }
    },

    // Picker
	// -----------------------------------------------------------------------------------------

    //> @method formItem.showPicker() (A)
    // Method to show a picker for this item. By default this method is called if the user
    // clicks on a +link{showPickerIcon,pickerIcon}.  May also be called programmatically.
    // <P>
    // Default implementation lazily creates and shows the +link{FormItem.picker,Picker Autochild}.
    // <P>
    // Developers wishing to show a custom picker widget can either implement a 
    // +link{pickerIconClick()} handler with an entirely custom implementation (and bypass
    // the call to <code>showPicker()</code> altogether), 
    // <smartclient>override this method, </smartclient>
    // or use the +link{autoChild,AutoChild pattern} to customize the automatically generated
    // +link{formItem.picker,picker autoChild}.
    //
    // @visibility external
    //<
    
    showPicker : function (modal, icon, pickerProperties, rect) {

        var picker = this.picker;
        pickerProperties = isc.addProperties(pickerProperties || {}, {
            callingForm: this.form, 
            callingFormItem: this
        });

        // support being passsed the global ID of a picker
        if (isc.isA.String(picker) && isc.isA.Canvas(window[picker])) {
            picker = this.picker = window[picker];
        }

        // lazily create the picker
        if (!picker) {
            picker = this.picker = this.createPicker(pickerProperties);

            // provide observeable dataChanged function to all pickers
            if (!isc.isA.Function(picker.dataChanged)) {
                picker.dataChanged = isc.Class.NO_OP;
            }

            // make sure the picker doesn't drift too far away from the original coordinates or
            // off the screen by resizing (items being added or removed)
            picker.observe(picker, "resized",
                                   "observed.placeNear(observed.lastShowRect)");

            // observe dataChanged 
            
            if (this.pickerDataChanged && picker.dataChanged) {
                this.observe(picker, "dataChanged", "observer.pickerDataChanged(observed)");
            }
        } else {
            isc.addProperties(picker, pickerProperties);
        }
        var pickerID = picker.getID();

        //this.logWarn("showPicker with rect: " + this.echo(rect) +
        //             ", getPickerRect: " + this.echoLeaf(this.getPickerRect) +
        //             ", icon: " + this.echo(icon));

        // if no position was specified, use either the top left of the (if it
        // exists) or the last mouse position
        if (!rect) {
            if (this.getPickerRect) {
                rect = this.getPickerRect();
            } else if (icon) {
                var iconRect = this.getIconPageRect(icon);
                rect = [iconRect[0],iconRect[1]]
            }
            else rect = [isc.EH.getX(), isc.EH.getY()];
        }
        // storing the lastShowRect allows the picker to reposition itself if it resizes
        picker.lastShowRect = rect;

        picker.setRect(rect);
        // draw the picker offscreen to get a size before placing it
        if (!picker.isDrawn()) {
            picker.moveTo(null, -9999);
            picker.draw();
        }
        // use placeNear so we don't get clipped by the window.
        this.picker.placeNear(rect);

        // set the picker data.  A picker advertises its desire to have data set on it by
        // defining a setData method.  If the formItem defines the special getPickerData()
        // function, call that - otherwise call getValue() which works for all formItems
        if (isc.isA.Function(picker.setData)) {
            if (picker._ignorePickerSetData) {
                // flag set by, eg, RelativeDateItem, which has already called setData()
                delete picker._ignorePickerSetData;
            } else {
                if (isc.isA.Function(this.getPickerData)) {
                    picker.setData(this.getPickerData(picker));
                } else picker.setData(this.getValue(picker));
            }
        }

        // show a clickmask.  When the clickmask is clicked notify the picker if it has the
        // clickMaskClicked method defined.  If we're asked to open a modal picker, the picker
        // needs to take care of hiding itself and clearing the clickMask.
        var clickAction = modal ? null : pickerID+".hide()";
        if (modal && isc.isA.Function(picker.clickMaskClicked)) 
            clickAction = pickerID+".clickMaskClicked()";
        
        picker.showClickMask(clickAction, !modal, picker);
        if (modal != null && picker.isModal == null) picker.isModal = modal;
        picker.show();
        picker.bringToFront();
        picker.focus();
        
        // Return false to suppress default click handling from firing
        return false;
    },
    
    createPicker : function (pickerProperties) {
        return this.createAutoChild("picker", pickerProperties);
    },

    hidePicker : function () {
        if (!this.picker) return;
        this.picker.hideClickMask();
        this.picker.hide();
    },

	// ----------------------------------------------------------------------------------------

    

    //> @method	formItem.redraw()
    // Redraw this form item.
    // <p>
    // Depending on the item and the +link{containerWidget} it's embedded in, this may redraw
    // this particular item or require a redraw of all items in the form.
    // <p>
    // Do not call this method unless the documentation directs you to do so.  Calling
    // <code>redraw()</code> unnecessarily has significant performance consequences.
    //
    // @param [reason] (String) optional reason for performing the redraw, which may appear in
    //                          diagnostic logs if enabled
    // @visibility external
    //<
    // Will call containerWidget.redrawFormItem() (if it's present) to give the container the
    // chance to do something incremental (use by ListGrid), otherwise, will just mark the
    // containerWidget for redraw.
    // DynamicForm 'redrawFormItem()' simply marks the form for redraw.
    
    redraw : function (reason) {
        // we can get redraw() attempts during init before we're actually drawn, which have no
        // effect on a DynamicForm, but will affect inline editing by redrawing the grid body
        if (!this.isDrawn()) return;
        
        // If we're reacting synchronously to mouseDown or mouseUp, we've seen an
        // immediate redraw interfere with focus (even with our logic to remember the 
        // current focus target and reset focus post redraw)
        // Delay the redraw in this case
        
        if (isc.EH._handlingMouseDown || isc.EH._handlingMouseUp) {
            
            this.logDebug("Delaying call to formItem.redraw() during mouseDown/mouseUp sequence",
                     "nativeFocus");
            this.delayCall("redraw", [reason], null);
            return;
        }

        // Note - We record whether we had focus before the redraw.
        // This is required because the form will blur the focus item during redraw, and then
        // refocus when redraw is complete.
        // In some cases getInnerHTML() will return different HTML for an item with focus
        // so we need this flag as the item will not have real focus until after redraw is 
        // complete.
        // This flag is cleared by DynamicForm._refocusAfterRedraw()
        
        

        
        if (this._hadFocusBeforeRedraw) {
        	// if focus has moved to a new item since we were marked as having redrawFocus, drop that flag
            var focusItem = this.form.getFocusSubItem();
            if (focusItem != null && focusItem != this && focusItem.parentItem != this) {
                delete this._hadFocusBeforeRedraw;
            }
        }

        if (this.hasFocus) {
            this._hadFocusBeforeRedraw = true;
        }
        if (!this.hasFocus && this.items != null) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].hasFocus) {
                    this._hadFocusBeforeRedraw = true;
                    break;
                }
            }
        }
        if (this.containerWidget.redrawFormItem) {
            this.containerWidget.redrawFormItem(this, reason);
        } else {
            this.containerWidget.markForRedraw("Form item redrawn"+ (reason ? ": " + reason : isc.emptyString));
        }
    },
    
    // adjustOverflow
    // Called when content changes (which may cause size change)
    // By default calls adjustOverflow on DynamicForm 
    
    adjustOverflow : function (reason) {
        if (!this._adjustOverflowReason) {
            this._adjustOverflowReason = [this.getID(), "  overflow changed: "]
        }
        if (reason == null) this._adjustOverflowReason[2] = "No Reason Specified.";
        else this._adjustOverflowReason[2] = reason;
        
        if (isc.isA.DynamicForm(this.containerWidget)) {
            this.containerWidget._resetHandleOnAdjustOverflow = true;
            // shift canvasItems around if necessary
            this.containerWidget._placeCanvasItems();
            this.containerWidget.adjustOverflow(this._adjustOverflowReason.join(isc.emptyString));
        }
        
    },

    //> @method	formItem.show()
    // Show this form item.
    // <p>
    // This will cause the form to redraw.  If this item had an item.showIf expression, it will
    // be destroyed.
    // @visibility external
    //<
    // If the container widget has a redrawFormItem method we use that. This is currently only
    // implemented on the DynamicForm class where it is used to invalidate cached 
    // tableResizePolicy information.
    // If there is no redrawFormItem method we just mark the container widget for redraw
    
    show : function (preserveShowIf) {
        if (this.visible == true && this.showIf == null) return;
        this.visible = true;
        if (!preserveShowIf) this.showIf = null;
        if (this.containerWidget.redrawFormItem) this.containerWidget.redrawFormItem(this, "showing form item");
        else this.containerWidget.markForRedraw("showing form item");
        
        this.itemVisibilityChanged(true);
    },

    //> @method	formItem.hide()
    // Hide this form item.
    // <BR><BR>
    // This will cause the form to redraw.  If this item had an item.showIf expression, it will
    // be destroyed.
    // @visibility external
    //<    
    hide : function (preserveShowIf) {
        if (this.visible == false) return;
        this.visible = false;
        if (!preserveShowIf) this.showIf = null;
        if (this.containerWidget.redrawFormItem) this.containerWidget.redrawFormItem(this, "hiding form item");
        else this.containerWidget.markForRedraw("hiding form item");
        
        this.itemVisibilityChanged(false);        
    },

    // Whether the containerWidget needs to use display:none in order to hide this FormItem.
    _needHideUsingDisplayNone : function () {
        return false;
    },

    //>Safari
    
    _updateHTMLForPageLoad : function () {
        if (!isc.Browser.isSafari || !this.isDrawn()) return;
        
        this._resetWidths();
    },

    _resetWidths : function () {
        if (!this.isDrawn()) return;
        var shouldClip = this._getClipValue();
        
        
        if (this._writeControlTable()) {
            var controlTable = this._getControlTableElement();
            if (controlTable) controlTable.style.width = this.getElementWidth() + "px";

            var iconDef = this.getPickerIcon(),
                img = this._getIconImgElement(iconDef);
                if (img) {
                    img.style.height = iconDef.height;
                    img.style.width = iconDef.width;
                }
        }

        var value = this.getValue(),
            textBoxWidth = this.getTextBoxWidth(value),
            widthCSSText = (textBoxWidth == null ? isc.emptyString : textBoxWidth + isc.px),
            textBoxHeight = this.getTextBoxHeight(value),
            heightCSSText = (textBoxHeight == null ? isc.emptyString : textBoxHeight + isc.px),
            textBox = this._getTextBoxElement();
        if (textBox) {
            
            if (shouldClip) textBox.style.width = widthCSSText;
            else textBox.style.minWidth = widthCSSText;
            if (!this._haveInlineIcons() || this._inlineIconsMarkupApproach !== "divStyledAsDataElement") {
                textBox.style.height = heightCSSText;
            }
        }
        if (this._writeOutFocusProxy()) {
            var focusProxy = this.getFocusElement()
            if (focusProxy) {
                focusProxy.style.width = widthCSSText;
                focusProxy.style.height = heightCSSText;
            } 
        }
    },
    //<Safari

    // Element management   
	// --------------------------------------------------------------------------------------------


	//>	@method	formItem.hasElement()
	//	Deprecated form of hasDataElement() - kept for backwards compat.
	//		@group	elements
	//		@return	(boolean)		true == item has a form element containing a value for the item
    //      @see    hasDataElement()
    //      @deprecated As of SmartClient 5.5, use +link{formItem.hasDataElement}.
	//<
    hasElement : function () {
        return this.hasDataElement();
	},
    
    //> @method     formItem.hasDataElement()   
    // Does this form item type have an associated form element in the DOM, containing a value?
    // Note - if hasDataElement() returns true, this implies that this data element type
    // has a data element - it doesn't imply that the form is drawn, or that the data element
    // is currently written into the DOM.
    // <P>
    // Use 'getDataElement()' to get a pointer to the data element (will return null if the
    // data element is not found).
    //
    // @group formValues
    // @visibility   internal
    // @see     method:FormItem.getDataElement
    //<
    
    hasDataElement : function () {
        // Most FormItems either always have or always do not have an element, however we make
        // this a function rather than accessing the _hasDataElement flag directly because
        // subclasses such as the ContainerItem class may do more complicated things which 
        // make this method's return value vary.
        if (this.showValueIconOnly) return false;
        if (this.showInputElement == false) return false;
        return this._hasDataElement;
    },

	//>	@method	formItem.getElement()
	//  Deprecated form of getDataElement() - kept for backwards compatability.
	//		@group	elements
	//
	//		@param	[itemName] 	(String)	Item to get the element for.  If null, use this item.
	//		@return	(Element)		DOM element subclass
    //      @deprecated As of SmartClient 5.5, use +link{formItem.getDataElement}.
	//<
	getElement : function (itemName) {
        return this.getDataElement(itemName);
    },

    //> @method formItem.getFocusElement()
    // Returns the HTML element that should receive focus when 'focusInItem()' is called on this
    // form item.
    // Default implementation returns the data element for the form item. May be overridden by
    // subclasses
    //  @group events
    //  @return (Element) DOM element to receive native focus
    //  @visibility internal
    //<
    getFocusElement : function () {
        if (!this.isDrawn() || !this._canFocus()) return null;
        if (this.hasDataElement()) return this.getDataElement();
        if (this._writeOutFocusProxy()) {
            if (!this._focusProxyHandle) {
                // this ID is created by the Canvas-level focusProxy string generation
                this._focusProxyHandle = isc.Element.get(this.getID() + "__focusProxy");
            }
            return this._focusProxyHandle;
        }
        return this._canFocusInTextBox() ? this._getTextBoxElement() : null;
    },
    
    // _getCurrentFocusElement()
    // Since form items can consist of multiple focusable HTML elements (most commonly an input 
    // element and a number of icons (defined as <A> tags), we need a way to determine
    // which DOM element has native focus when formItem.hasFocus is true.
    // In IE we could rely on 'document.activeElement', but there is no equivalent in the
    // other browsers, so instead we hang a flag onto the form item on element focus, 
    // (via the 'nativeFocusHandler()' and 'iconFocus()' methods) and clear it on blur (or 
    // update on focus to a different element).
    _getCurrentFocusElement : function () {
        if (this.hasFocus == null && !isc.EH._lastFocusTarget == this) {
            return null;
        }
        var element = this._currentFocusElement;
        // double check for IE using the native document.activeElement - should not be 
        // necessary
        
        if (isc.Browser.isIE && !isc.EH.synchronousFocusNotifications && element != this.getActiveElement()) {
            this.logInfo("not returning focus element " + this.echoLeaf(element) + 
                         " since it's not active" + isc.EH._getActiveElementText(),
                         "nativeFocus");
            if (this.hasFocus) {
                this.hasFocus = false;
                this.elementBlur();
            }
            this._currentFocusElement = null;
            return null;
        }
        
        return element;
    },

	//>	@method	formItem.getDataElement()
    //      Return a pointer to the form element containing the value for this form item, or
    //      null if it doesn't currently exist.
    //      Will always return null if this form item type does not have an associated data 
    //      element which can be determined by formItem.hasDataElement()
    //
	//		@group	elements
	//
	//		@param	[itemName]    (String)    Optional form item name - if passed will return that 
    //                                      item's element.  (Item should be a member of the same 
    //                                      form) 
	//		@return	(Element)		DOM element subclass (or null)
	//<
    getDataElement : function (itemName) {
		// if no itemName was specified, assume they mean us!
		if (itemName == null) {
			var item = this;
		} else {
			// otherwise have the form get a pointer to the item
            var item = this.form.getItem(itemName);
		}
        
        // If the item does not have a data element, return null.
        if (!item.hasDataElement()) return null;
        
        // If the item is not marked as drawn() bail.
        
        if (!this.isDrawn()) return;
        
        

        // cache the result of getElementById, cleared in redrawn()/cleared()/destroy()   
        var dataElement = this._dataElement;
        if (dataElement == null) {
            dataElement = (this._dataElement = isc.Element.get(this.getDataElementId()));
        }
        return dataElement
	},
    
    // This method returns a pointer to the outer element of the form item
    
    getOuterElement : function () {
        if (!this.isDrawn()) return null;
        
        // If the "includeHint" parameter was passed to getInnerHTML() when we were written out
        // we pass this on to the method determining whether we wrote an outer table.
        var hasHint = this._wroteOutHint;
        if (this._writeOuterTable(hasHint)) {   
            return this.getOuterTableElement();
        }
        if (this._writeControlTable()) {
            return this._getControlTableElement();
        }
        var element = this._getTextBoxElement();

        // If all else fails (possible due to custom innerHTML) back off to the 
        // containing element for the entire item
        if (element == null) {  
            element = this.getHandle();
        }               
        return element;
    },    

    // getHandle() returns a pointer to the element that contains this form item.
    // One of:
    // - form cell
    // - abs div
    // - standalone 'span' element
    getHandle : function () {
        if (!this.isDrawn()) return null;
        if (this._absPos()) return this.getAbsDiv();
        if (this.containerWidget == this.form) return this.getFormCell();
        return isc.Element.get(this._getDOMID(this._$standaloneSpan));
    },

    // similar to getHandle() above but always returns the element
    // with the "_containsItem" property. Used by VB and editMode proxy
    _getItemInfoElement : function () {
        if (!this.isDrawn()) return null;
        if (this._absPos() || this.containerWidget != this.form) {
            return isc.Element.get(this._getDOMID(this._$standaloneSpan));
        }
        return this.getFormCell();
    },

    // pointer to the table around this form item's content
    getOuterTableElement : function () {
        return this._getHTMLPartHandle(this._$outerTable);
    },
    
    // Which part of the form item did the event occur over?
    _overElement : function (event) {
        if (!event) event = isc.EH.lastEvent;
        var itemInfo = event.itemInfo;
        return (itemInfo && itemInfo.overElement);
    },
    
    _overTextBox : function (event) {
        if (!event) event = isc.EH.lastEvent;
        var itemInfo = event.itemInfo;
        
        return (itemInfo && (itemInfo.overTextBox || itemInfo.overElement));
    },

    // control table comprises the text box, picker icon and surrounding table
    _overControlTable : function (event) {
        if (!event) event = isc.EH.lastEvent;
        var itemInfo = event.itemInfo;
        return (itemInfo &&
                (itemInfo.overControlTable || this._overTextBox(event) ||
                 (itemInfo.overIcon && this.getIcon(itemInfo.overIcon) == this.getPickerIcon()) 
                )
               );
    },

    _$cell:"cell",
    getFormCellID : function () {
        return this._getDOMID(this._$cell);
    },
    getFormCell : function () {
        return isc.Element.get(this.getFormCellID());
    },

    // ValueMaps
	// --------------------------------------------------------------------------------------------
    
    //>	@method	formItem.getDisplayValue()
    // Returns this item's value with any valueMap applied to it - the value as currently
    // displayed to the user.
    // @param [value] (Any) optional stored value to be mapped to a display value.  Default is to
    //                use the form's current value
	// @return (Any) value displayed to the user
    // @group valueMap
    // @visibility external
	//<
    
    getDisplayValue : function (value) {
        return this._getDisplayValue(value, true);
    },
    _getDisplayValue : function (value, canUseCurrentValue) {
        var undef;
        if (this.multiple) {       
            var useCurrentValue = false;

            if (canUseCurrentValue && value === undef) {
                value = this.getValue();
                useCurrentValue = true;
            }

            if (!(value == null || isc.isAn.Array(value))) {

                if (useCurrentValue) {
                    this.logWarn(
                            "getDisplayValue - this is a multiple FormItem but the value obtained " +
                            "from getValue() was not null and was not an array.");
                    value = [value];
                } else {

                    // The form item is `multiple: true` and the caller passed in a value that
                    // is not null and not an array.  Assume that the caller is seeking the
                    // display value for the single value that was passed in.
                    return this.mapValueToDisplay(value);
                }
            }
            if (value != null) {

                // empty array - default handling will display the empty value
                if (value.length == 0) {
                    return this.emptyDisplayValue;
                }

                
                var displayValue = [];
                
                for (var i = 0, len = value.length; i < len; i++) {
                    displayValue[i] = this.mapValueToDisplay(value[i], null, (len>1));
                }
                return displayValue;
            }
        }

        return this.mapValueToDisplay((!canUseCurrentValue || value !== undef) ? value : this.getValue());
    },

	//>	@method	formItem.mapValueToDisplay()
	// Given a value for this FormItem, return the value to be displayed.
    // <p>
    // This method is called by the framework to derive a display value for a given data value
    // in a FormItem.  Your own code can call this method if you need to programmatically obtain
    // the display value (for example, to display in a hover prompt or error message).  However,
    // <smartclient>it is <b>not</b> intended as an override point, and you should not treat 
    // it as one.</smartclient>
    // <smartgwt>this method is not an override point.</smartgwt>
    // There are several supported ways to apply custom formatting to your form values:<ul>
    // <li>If you want to apply a consistent custom format to every instance of a given
    // +link{class:SimpleType}, specify a +link{simpleType.format,format} on the SimpleType.    
    // This is the most general approach.  Note, this is a static formatter: it will only 
    // affect the format of values the user can interact with if +link{textItem.formatOnBlur}
    // is set</li>
    // <li>If you want to apply a consistent custom format to a 
    // +link{class:DataSourceField,DataSource-described field}, the best approach is 
    // +link{DataSourceField.format}. This overrides SimpleType-level formatting and,
    // again, is static formatting</li>
    // <li>For a FormItem that is not DataSource-described, or for special formats that 
    // should only be used on a particular form, +link{formItem.format,format} can also be 
    // declared for individual FormItems.  This overrides DataSource-level formatting</li>
    // <li>For temporal values, you can declare +link{formItem.dateFormatter,dateFormatter} 
    // and +link{formItem.timeFormatter,timeFormatter} at both <code>FormItem</code> and 
    // +link{class:DynamicForm} levels.  Generally, however, we recommend the generic 
    // declarative +link{formItem.format,format} as the simpler approach</li>
    // <li>If you want to apply a specialized format that cannot be expressed declaratively,
    // use <smartclient>+link{formItem.formatValue,formatValue()}</smartclient>
    // <smartgwt>{@link com.smartgwt.client.widgets.form.fields.FormItem#setValueFormatter}</smartgwt>
    // for static-valued items like +link{class:StaticTextItem} or +link{class:SelectItem},
    // and <smartclient>+link{formItem.formatEditorValue,formatEditorValue()}</smartclient>
    // <smartgwt>{@link com.smartgwt.client.widgets.form.fields.FormItem#setEditorValueFormatter}</smartgwt>
    // for other types of FormItem</li>
    // </ul>
    // <h3>Deriving the display value</h3>
    // The process of deriving a display value from a data value involves the following steps:<ul>
    // <li>If the item declares a +link{formItem.valueMap,valueMap}, the display value is 
    // derived by looking up the value in the valueMap</li>
    // <li>If the item does not have a valueMap - or the value was not found in the item's 
    // valueMap - and the item declares a +link{formItem.displayField,displayField}
    // and an +link{formItem.optionDataSource,optionDataSource}, the display value is derived 
    // by looking up the "displayField" corresponding to the value in the optionDataSource's
    // local cache</li>
    // <li>Formatting is now applied to the derived display value.  Note, it is perfectly normal 
    // at this point for no display value has to be derived - this will be the case for any  
    // field with no <code>valueMap</code> and no <code>optionDataSource</code>.  In this case, 
    // the passed-in value is treated as the display value for all further purposes.<ul>
    //     <li>If the FormItem involves static display value(s), like +link{class:StaticTextItem}
    //         or +link{class:SelectItem}<ul>
    //         <li>If the FormItem
    //         <smartclient>has a +link{formItem.formatValue(),formatValue()} method, it is called</smartclient>
    //         <smartgwt>has had a static value formatter applied with the 
    //                   <code>setValueFormatter()</code> API, the value formatter is called</smartgwt></li>
    //         <li>Otherwise, if the formItem declares a +link{formItem.format,format}, the formst
    //             is applied in line with the rules of +link{type:FormatString}</li>
    //         <li>Otherwise, if the FormItem is of a +link{class:SimpleType} that declares a
    //             +link{SimpleType.format,format}, the format is applied</li>
    //     </ul>
    //     </li>
    //     <li>Otherwise, if the FormItem 
    //         <smartclient>has a +link{formItem.formatEditorValue(),formatEditorValue()} method, 
    //                      it is called</smartclient>
    //         <smartgwt>has had an editor value formatter applied with the 
    //                   <code>setEditorValueFormatter()</code> API, the editor value formatter
    //                   is called</smartgwt>
    //     </li>
    //     <li>Otherwise, if the FormItem is of a +link{class:SimpleType} that
    //         <smartclient>declares an +link{SimpleType.editFormatter(),editFormatter()},</smartclient>
    //         <smartgwt>has had an edit formatter applied with the 
    //                   <code>setEditFormatter()</code> API,</smartgwt>
    //         the edit formatter is called</li>
    //     <li>Otherwise, if the value is a Date:<ul>
    //         <li>If the formItem declares a +link{timeFormatter,timeFormatter} and no 
    //             +link{dateFormatter,dateFormatter}, the timeFormatter is called</li>
    //         <li>Otherwise, if the formItem is of a +link{class:SimpleType} that 
    //             +link{simpleType.inheritsFrom,inheritsFrom} "time", the value is formatted
    //             using the 
    //             <smartclient>+link{Time.shortDisplayFormat,default time format}</smartclient>
    //             <smartgwt>{@link com.smartgwt.client.util.DateUtil#setShortTimeDisplayFormatter default time format}</smartgwt>
    //         <li>Otherwise, the date or datetime is formatted using the rules described 
    //             for +link{formItem.dateFormatter}.
    //     </ul>
    //     </li>
    //     <li>Otherwise, if the FormItem involves static display value(s) and is of a 
    //         <code>SimpleType</code> that declares a 
    //         +link{SimpleType.normalDisplayFormatter,normalDisplayFormatter}, this is used</li>
    //     <li>Otherwise, if the value is not null and is of a "simple" type (ie, it is not an
    //         object or an array), a display value is derived by calling the Javascript 
    //         <code>toLocaleString()</code> method, if the value has one, or the 
    //         <code>toString()</code> method if it does not</li>
    //     <li>Otherwise, if the value is null or a zero-length string, the display value is 
    //         set to the formItem's +link{formItem.emptyDisplayValue,emptyDisplayValue}</li>
    //     <li>Otherwise, the "display value" is the simple, unformatted data value that was 
    //         passed in</li>
    // </ul>
    // </li>
    // </ul>
    // <h3>Treatment of arrays</h3>
    // Ordinarily, arrays are treated like any other value.  This means you can, for example, 
    // create a <smartclient>+link{formItem.formatEditorValue,formatEditorValue()} implementation</smartclient>
    // <smartgwt>{@link com.smartgwt.client..widgets.form.FormItemValueFormatter value formatter}</smartgwt>
    // that is capable of formatting an array-valued field in some way that makes sense for the 
    // particular application domain.
    // <p>
    // However, for items that are marked to handle +link{DataSourceField.multiple,multiple} 
    // values, array values are treated differently.  In this case, the display value is built 
    // up by calling <code>mapValueToDisplay()</code> recursively for each array entry, and 
    // concatenating these partial display values together using the 
    // +link{formItem.multipleValueSeparator,multipleValueSeparator}.
    // 
    //  @see formItem.mapDisplayToValue()
	//	@param  value  (Any) value to be mapped to a display value
    //  @return (String)     value to display. Note, for items with static value(s), such as 
    //                       +link{class:SelectItem} or +link{StaticTextItem}, the display 
    //                       value string will be interpreted as HTML by the browser.  See 
    //                       +link{selectItem.escapeHTML} for more details
    //
    //  @visibility external
	//<
    
    _$nbsp:"&nbsp;",
    mapValueToDisplay : function (value, recursed, includeValueIcons) {

        var noBreaks = this.skipLineBreaks,
            asHTML = this.getCanEscapeHTML() && 
                    // outputAsHTML / asHTML are old and deprecated
                    (this.escapeHTML || this.outputAsHTML || this.asHTML);

        // we want to call the float-formatting if
        // - this is a FloatItem
        // - this is a StaticTextItem, and this.type inherits from "float"
        if (isc.isA.FloatItem(this) || 
            isc.isA.StaticTextItem(this) && isc.SimpleType.inheritsFrom(this.type, "float")) 
        {
            var floatResult = this.mapFloatValueToDisplay(value);
            if (floatResult != null) return floatResult;
        }

        var displayValue;
        
        if (this.multiple && isc.isAn.Array(value)) {
            var numValues = value.length;
            // For multi-select items, the value should be an array of selected values.
            // Display them as a list of display values, separated by the multipleValueSeparator.
            var displayValues = new Array(numValues);
            for (var i = 0; i < numValues; ++i) {
                var key = value[i];

                displayValue = "";

                var valueIconHTML = this._getValueIconHTML(key);
                if (valueIconHTML != null) displayValue += valueIconHTML;

                // trim keys to avoid including spaces from the multipleValueSeparator
                if (this.autoTrimMultipleValues && key && key.trim) key = value[i] = key.trim();
                displayValue += this.mapValueToDisplay(key, true);

                displayValues[i] = displayValue;
            }
            if (!recursed) displayValue = this._finishMapMultipleValueToDisplay(displayValues, value);
            else displayValue = displayValues.join(this.multipleValueSeparator);
        } else {
            if (includeValueIcons && value != null && this._getValueIcon(value)) {
                 
                displayValue = "";
                var valueIconHTML = this._getValueIconHTML(value);
                if (valueIconHTML != null) displayValue += valueIconHTML;
                displayValue += this._mapKey(value, true);
            } else {
                displayValue = this._mapKey(value, true);
            }

            var displayFieldName = this.getDisplayFieldName();
            if (displayFieldName != null) {
                var ods = this.getOptionDataSource();

                // Check whether the displayField has escapeHTML:true.
                var displayField = (ods == null ? null : ods.getField(displayFieldName));
                if (displayField != null && this.getCanEscapeHTML() && displayField.escapeHTML) {
                    noBreaks = displayField.skipLineBreaks;
                    asHTML = true;
                }

                if (displayValue == null) {
                    // Try looking in the option data source's cache data.
                    var odsCacheData = (ods == null || this.suppressOptionDSCacheAccess 
                                        ? null : ods.getCacheData());
                    if (odsCacheData != null) {
                        var optionRecord = odsCacheData.find(this.getValueFieldName(), value);
                        if (optionRecord != null) displayValue = optionRecord[displayFieldName];
                    }
                }
            }
            
            displayValue = this._formatDataType(displayValue != null ? displayValue : value, asHTML, noBreaks);
            // trim the displayValue to avoid including spaces from the multipleValueSeparator
            if (this.multiple && displayValue && displayValue.trim) displayValue = displayValue.trim();

            // map "" to our &nbsp; - allows subclasses such as selectItems
            // to style the content properly by writing out "&nbsp;" rather than ""
            // Don't 'escape' this HTML
            
            var isEmptyValue = (value == null || value == isc.emptyString);
            if (!isEmptyValue && (displayValue == isc.emptyString)) {
                displayValue = this.getEmptyStringDisplayValue()
            }
            displayValue = this._finishMapValueToDisplay(displayValue, value);
        }
        return displayValue;
    },

    canEscapeHTML:false,
    
    getCanEscapeHTML : function () {
        return this.canEscapeHTML;
    },

    //> @attr formItem.escapeHTML (Boolean : varies : IRW)
    // Controls whether HTML item value(s) should be rendered or shown as HTML source.
    // <P>
    // This property is supported by specific formItem sub-types (e.g.
    // +link{TextItem.escapeHTML,TextItem}), and has no effect in others.  To understand the
    // effects, look at the documentation for the specific formItem sub-type in question.
    // @group appearance
    // @visibility sgwt
    //<    
    

    _finishMapMultipleValueToDisplay : function (displayValues, values) {
        return displayValues.join(this.multipleValueSeparator);
    },

    _finishMapValueToDisplay : function (displayValue, value) {
        return displayValue;
    },

    
    _getDisplayValueForOldValueHover : function (value, internalParam) {
        // there's a third param, includeValueIcons, which are needed in the hover
        return this.mapValueToDisplay(value, null, true);
    },

    //> @attr FormItem.storeDisplayValues (Boolean : null : IRA)
    // If specified, this overrides the +link{dynamicForm.storeDisplayValues} property
    // for this field.
    //
    // @visibility external
    //<
    //storeDisplayValues: null,

    //> @method formItem.formatValue()
    // Allows customization of how the FormItem's stored value is formatted for display.
    // If you are considering using this method, you should first consider using 
    // +link{formItem.format}, which provides for simple and flexible declarative 
    // formatting of dates, times and numbers, without the need to write formatting code.
    // <p>
    // By default, this formatter will only be applied to static displays such
    // as +link{StaticTextItem} or +link{SelectItem}, and does not apply to values 
    // displayed in a freely editable text entry field 
    // (such as a +link{TextItem} or +link{TextAreaItem}).
    // <p>
    // To define formatting logic for editable text, developers may:
    // <ul>
    // <li>set +link{textItem.formatOnBlur} to true, which causes the static formatter
    // to be applied while the item does not have focus, and then be cleared when the user
    // moves focus to the text field</li>
    // <li>use +link{formatEditorValue} and supply a
    // corresponding +link{parseEditorValue} that can convert a formatted and subsequently
    // user-edited value back to a stored value.</li>
    // </ul>
    // @param value (Any) Underlying data value to format. May be null.
    // @param record (ListGridRecord) The record currently being edited by this form.
    //      Essentially the form's current values object.
    // @param form (DynamicForm) pointer to the DynamicForm
    // @param item (FormItem) pointer to the FormItem
    // @return (String) Display value to show.
    // 
    // @example formatRelatedValue
	// @visibility external
	//<
    
    //> @method formItem.formatEditorValue()
    // Allows customization of how the FormItem's stored value is formatted for display
    // in an editable text entry area, such as a +link{TextItem} +link{TextAreaItem}.  For
    // display values which will not be directly editable by the user, use
    // +link{formItem.formatValue()} instead.
    // <p>
    // When customizing how values are displayed during editing, it is almost always necessary
    // to provide a +link{formItem.parseEditorValue()} as well, in order to convert a formatted
    // and subsequently user-edited value back to a stored value.
    //
    // @param value (Any) Underlying data value to format. May be null.
    // @param record (ListGridRecord) The record currently being edited by this form.
    //      Essentially the form's current values object.
    // @param form (DynamicForm) pointer to the DynamicForm
    // @param item (FormItem) pointer to the FormItem
    // @return (String) display value to show in the editor.
    // 
	// @visibility external
	//<
    
    //> @method formItem.parseEditorValue()
    // Allows customization of how a used-entered text value is converted to the FormItem's
    // logical stored value (the value available from +link{getValue()}).  
    // <p>
    // This method only applies to form items which show an editable text entry area, such at
    // the +link{TextItem} or +link{TextAreaItem}.
    // <p>
    // See also +link{formItem.formatEditorValue()}
    //
    // @param value (String) value as entered by the user
    // @param form (DynamicForm) pointer to the dynamicForm containing this item
    // @param item (FormItem) pointer to this item
    // @return (Any) Data value to store for this item.
    // 
    // @visibility external
    //<
    
    //> @method formItem.formValuesChanged()
    // Notification that fires when the parent form's values are changed by a
    // +link{ValuesManager}.
    // @visibility internal
    //<    

    // should we apply static formatters to the display value
    // We typically want to do this for readOnly fields.
    // For fields with a freeform text entry area (text / textArea) we don't want to use the
    // static formatter -- instead we'll use the special "edit value" formatters which should
    // have a corollary parser method.
    // Note that for some formItems, such as LinkItem, this is flipped based on the
    // 'canEdit' setting for the item
    // If formatOnBlur is true, we always apply the static format while the item is unfocussed
    // This gives developers an easy way to specify a formatter without needing a
    // corollary parser method.
    applyStaticTypeFormat:true,
    shouldApplyStaticTypeFormat : function () {
        if (this.applyStaticTypeFormat) return true;
        if (this.formatOnBlur) {
            var hasFocus = this.hasFocus;
            // If we're blurred, apply the staticTypeFormat
            return !hasFocus;
        }
        return false;
    },
    
    // If we have a non-string value, use the appropriate formatter to display it as a string.
    // note - if we have an optionDataSource and display-field specified, we assume the value is
    // a display-value and check for the display-field data type.
    
    _formatDataType : function (value, asHTML, noLineBreaks) {
        var applyStaticTypeFormat = this.shouldApplyStaticTypeFormat();
        // If we have a displayField - the value being displayed will be from the displayField, so
        // we typically want to pick up type formatters etc from that.
        var displayField = this;
        var ods = this.getOptionDataSource(),
            displayFieldName = this.getDisplayFieldName();
        if (ods && displayFieldName) {
            var field = ods.getField(displayFieldName);
            if (field != null) {            
                displayField = field;
            }
        }
        var formattedValue, undef;
        if (applyStaticTypeFormat) {
            if (this.formatValue != null) {
                var form = this.form,
                    record = this.form ? this.form.values : {};
                formattedValue = this.formatValue(value,record,form,this);
                
            } else {
                // If explicit format is specified (on the item or the display field) respect it.
                var format = this.format || displayField.format;
                if (format != null && (isc.isA.Number(value) || isc.isA.Date(value))) {
                    formattedValue = isc.isA.Number(value) ? isc.NumberUtil.format(value, format)
                                                 : isc.DateUtil.format(value, format);
                
                // Pick up formatter based on type (if specified)
                } else {
                    var simpleType = displayField._simpleType;
                    if (simpleType && simpleType.format) {
                        if (isc.isA.Number(value) || isc.isA.Date(value)) {
                            formattedValue = isc.isA.Number(value) 
                                        ? isc.NumberUtil.format(value, simpleType.format)
                                        : isc.DateUtil.format(value, simpleType.format);
                        }
                    // If this is an "image" type field, see if we should write out imgHTML for it
                    } else if (this.shouldFormatStaticValueAsImage(displayField)) {
                        formattedValue = this.form.formatValueAsImage(value, this, record);
                        asHTML = false; // never escape this image HTML!
                    }
                }
            }
        } else if (this.formatEditorValue != null) {
            var form = this.form,
                record = this.form ? this.form.values : {};
            formattedValue = this.formatEditorValue(value,record,form,this);
            
        } else {
            var simpleType = displayField._simpleType;
            if (simpleType && simpleType.editFormatter) {
                var form = this.form,
                record = this.form ? this.form.values : {};
                formattedValue = simpleType.editFormatter(value, this, form, record);
            }
        }

        if (formattedValue === undef) {
            
            // If the value is a native Date object format it according to the following rules:
            // - if this.dateFormatter or this.timeFormatter is specified, respect it (If both are
            //   specified, favor 'dateFormatter' unless field is explicitly of type "time")
            // - if this.displayFormat is specified respect it as either a dateFormatter or timeFormatter
            //   depending on specified field type.
            // - otherwise check for form.timeFormatter for time fields, form.datetimeFormatter for
            //   datetime fields, or form.dateFormatter for all other field types.
            if (isc.isA.Date(value)) {
                if (this._formatAsTime(displayField)) {
                    var formatter = this._getTimeFormatter();
                    var isLogicalTime = isc.SimpleType.inheritsFrom(this.getDisplayFieldType(), "time");
                    formattedValue = isc.Time.toTime(value, formatter, isLogicalTime);
                } else {
                    
                    var formatter = this._getDateFormatter();
                    var type = this.getDisplayFieldType(),
                        dateField = isc.SimpleType.inheritsFrom(type, "date"),
                        datetimeField = isc.SimpleType.inheritsFrom(type, "datetime");
                    // Logical date fields -- always use short format (time is meaningless) and pass
                    // in the "logicalDate" parameter so we ignore any custom timezone.
                    if (dateField && !datetimeField) {
                        formattedValue = value.toShortDate(formatter, false);
                    
                    // Otherwise, if showing short format, use toShortDate or toShortDatetime for
                    // explicit datetime fields -- or for long format use default "normal" formatter.
                    
                    } else {
                        if (this.useShortDateFormat) {
                            formattedValue = datetimeField ? value.toShortDatetime(formatter, true) 
                                                : value.toShortDate(formatter, true);
                        } else {
                            formattedValue = value.toNormalDate(formatter);
                        }
                    }
                }
            } else {
                // normalDisplayFormatter and shortDisplayFormatter may be present on our 
                // simpleType
                
                //
                // Note: if the simpleType with the formatter exists on the field, use that in
                // preference to the method patched from the simpleType because use of 'this' within
                // said formatter then correctly references the simpleType and not the field.
                if (displayField._simpleType && isc.isA.Function(displayField._simpleType.normalDisplayFormatter) &&
                    applyStaticTypeFormat) 
                {
                    
                    formattedValue = displayField._simpleType.normalDisplayFormatter(value, displayField,
                                                                            this.form, this.form.values);

                } else if (value != null) {
                    // Don't attempt to convert object / array to a string - doesn't return anything meaningful
                    if (this.isSimpleTypeValue(value)) {
                        formattedValue = isc.iscToLocaleString(value);
                    }
                }
            }
        }
        if (formattedValue == null) formattedValue = this.emptyDisplayValue;
        if (asHTML) {
            
            var isEmptyValue = (value == null || value == isc.emptyString),
                suppressAsHTML = (formattedValue == null) || 
                                 (isEmptyValue && 
                                    (formattedValue == this.emptyDisplayValue || 
                                     formattedValue == this._$nbsp));

            if (!suppressAsHTML) {
                formattedValue = String(formattedValue).asHTML(null, noLineBreaks);
            }
        }
        return formattedValue;
    },

    //> @attr formItem.showImageAsURL (Boolean : null : IRW)
    // For fields of +link{type:FormItemType,type:"image"}, if the field is non editable, and
    // being displayed with +link{formItem.readOnlyDisplay,readOnlyDisplay:"static"}, should
    // the value (URL) be displayed as text, or should an image be rendered?
    // <P>
    // If unset, +link{dynamicForm.showImageAsURL} will be consulted instead.
    // @visibility external
    //<
    

    shouldFormatStaticValueAsImage : function () {
        var type = this.type,
            isImage = isc.SimpleType ? isc.SimpleType.inheritsFrom(type, "image") : type == "image";

        if (isImage) {
            // Dev can explicitly mark a specific image type field to format as an image
            if (this.showImageAsURL != null) {
                return !this.showImageAsURL;
            }
            // Otherwise we'll respect the setting at the form level
            
            return !this.form.showImageAsURL;
        }
        return false;
    },
    
    // Punt to DS.isSimpleTypeValue
    
    isSimpleTypeValue : function (value) {
        return ((isc.DS  && isc.DS.isSimpleTypeValue(value)) ||
                (value != null && (!isc.isAn.Object(value) || isc.isA.Date(value))));
    },


    // What string should we display if the "displayValue" is "" [but the value for the
    // item wasn't empty]
    // Use the emptyDisplayValue by default
    getEmptyStringDisplayValue : function () {
        return this.emptyDisplayValue;
    },
    
    // Helper methods to determine how to format date values.
    _formatAsTime : function () {
        var formatAsTime = null;
        // at the item level, the presence of timeFormatter but no date, or vice-versa
        // implies we should use the formatter regardless of type.
        if (this.timeFormatter == null && this.dateFormatter != null) formatAsTime = false;
        if (this.dateFormatter == null && this.timeFormatter != null) formatAsTime = true;
        // If neither are set, rely on type inheriting from time - anything will format as a date.
        if (formatAsTime == null) {
            var type = this.getDisplayFieldType(),
                isTime = isc.SimpleType.inheritsFrom(type, "time");
            formatAsTime = isTime;
        }
        
        return formatAsTime;
    },
    _getDateFormatter : function () {
    
        if (this.dateFormatter != null) return this.dateFormatter;
        if (this.format != null) return this.format;
        var type = this.getDisplayFieldType(),
        isDatetime = isc.SimpleType.inheritsFrom(type, "datetime"),
        isDate = isDatetime || isc.SimpleType.inheritsFrom(type, "date");
        
        // 'displayFormat' may also be specified as either a date or time formatter
        // this expects the field to have a specified "type".
        
        if (isDate && this.displayFormat != null) return this.displayFormat;
        
        if (isDatetime && this.form.datetimeFormatter != null) return this.form.datetimeFormatter;
        return this.form.dateFormatter;
    },
    _getTimeFormatter : function () {
        if (this.timeFormatter != null) return this.timeFormatter;
        // 'displayFormat' may also be specified as either a date or time formatter
        // this expects the field to have a specified "type".
        
        if (this.displayFormat != null && isc.SimpleType.inheritsFrom(this.type, "time")) {
            return this.displayFormat;
        }
        return this.form.timeFormatter;
    },

    
	//>	@method	formItem.mapDisplayToValue()
	// Given a display value for this FormItem, return the underlying data value.  This is 
    // done by reverse value-mapping, and/or parsing.
    // <p>
    // This method is called by the framework to derive an underlying data value for a given 
    // display value (ie, the value the user sees and interacts with) in a FormItem.  Your own 
    // code can call this method if you need to programmatically obtain the underlying data  
    // value for a given display value.  However,
    // <smartclient>it is <b>not</b> intended as an override point, and you should not treat 
    // it as one.</smartclient>
    // <smartgwt>this method is not an override point.</smartgwt>
    // If you have a field that requires the stored value to be different from the displayed 
    // value, and the requirement cannot be satisfied with a +link{formItem.valueMap,valueMap}
    // for some reason, you can add custom parsing logic by 
    // <smartclient>implementing +link{formItem.parseEditorValue(),parseEditorValue()}</smartclient>
    // <smartgwt>setting an {@link com.smartgwt.client.widgets.form.fields.FormItem#setEditorValueParser editor value parser}</smartgwt>
    // <p>
    // This method is also <b>not</b> intended as a place where you can validate, sanitize, 
    // transform or canonicalize user input<ul>
    // <li>To ensure you get well-formed input values, use +link{textItem.mask,input masks} or 
    // <smartclient>the +link{formItem.change(),change() event}</smartclient>
    // <smartgwt>a {@link com.smartgwt.client.widgets.form.fields.FormItem#addChangeHandler(com.smartgwt.client.widgets.form.fields.events.ChangeHandler change handler)}</smartgwt>
    // </li>
    // <li>To transform or canonicalize input values, use a +link{type:ValidatorType,mask validator}
    // with "transformTo".  See the link to "mask validator" for more details and an example of this</li>
    // <li>To transform or canonicalize input character-by-character as the user types, use 
    // <smartclient>+link{formItem.transformInput(),transformInput()}</smartclient>
    // <smartgwt>an {@link com.smartgwt.client.widgets.form.fields.FormItem#setInputTransformer() input transformer}</smartgwt>
    // </li></ul>
    // <h3>Deriving the data value</h3>
    // The process of deriving an underlying data display value from a display value involves 
    // the following steps:<ul>
    // <li>If the formItem 
    //     <smartclient>declares a +link{formItem.parseEditorValue().parseEditorValue()}
    //     method,</smartclient>
    //     <smartgwt>has an {@link com.smartgwt.client.widgets.form.fields.FormItem#setEditorValueParser() editor value parser},</smartgwt>
    //      it is called</li>
    // <li>Otherwise, if the formItem is of a +link{class:SimpleType} that 
    //     <smartclient>declares a +link{SimpleType.parseInput(),parseInput()} method, it</smartclient>
    //     <smartgwt>has had an edit parser applied with the 
    //                   <code>setEditParser()</code> API, the edit parser</smartgwt>
    //     is called</li>
    // <li>If the formItem is of a <code>SimpleType</code> that 
    //     +link{simpleType.inheritsFrom,inheritsFrom} "date", "time" or "datetime", it will 
    //     be parsed as a date, time or datetime.  Note, this parsing step is applied on top of 
    //     custom SimpleType- and FormItem-level parsing</li>
    // <li>If the formItem declares a +link{formItem.valueMap,valueMap}, a value is derived by 
    // looking up the display value (including the effects of any parsing we may have done so far)
    // in the valueMap</li>
    // </ul>
    // <b>Note:</b> Unlike the corollary method +link{formItem.mapValueToDisplay(),mapValueToDisplay()},
    // there is no special built-in handling of <code>+link{dataSourceField.multiple}:true</code> 
    // fields.  If you want an array to be parsed out of some user input, you must write the
    // parser method to do so.
    //  @see formItem.mapValueToDisplay()
	//	@param  value  (String) display value
    //  @return (Any)           value re-mapped for storing
    //
    //  @visibility external
	//<
    
    
    mapDisplayToValue : function (value) {
        value = this._parseDisplayValue(value);

        
        if (this.mapEmptyDisplayValue || 
            (value != this.emptyDisplayValue)) value = this._unmapKey(value);
        return value;
    },    
    
    mapEmptyDisplayValue:true,
    
    // If this is an item with data type set to "time", and the user enters an 
    // unconvertible string, should we accept it?
    
    forceTimeConversion : function () {
        return false;
    },
    
    _parseDisplayValue : function (value, forceParse) {
        var applyStaticTypeFormat = this.shouldApplyStaticTypeFormat();
        if (!applyStaticTypeFormat) {
            if (this.parseEditorValue != null) {
                value = this.parseEditorValue(value, this.form, this);
            } else if (this._simpleType && this._simpleType.parseInput) {
                var form = this.form,
                    record = form ? form.values : {};
                if (forceParse || !this._shouldAllowExpressions()) {
                    // fire it in the scope of the simpleType
                    value = this._simpleType.parseInput(value, this, form, record);
                }
            }
            // Handle parsing values to Dates for fields of type "date"
            // This is rarely going to be required but would handle something special like
            // the developer showing a date type field with 'editorType' explicitly set to
            // "TextItem"
            
            if (value != null && isc.isA.String(value)) {
                var type = this.getType();
                var isDate = isc.SimpleType.inheritsFrom(type,"date"),
                    isTime = isc.SimpleType.inheritsFrom(type,"time"),
                    isDatetime = isc.SimpleType.inheritsFrom(type, "datetime"),
                    isNumeric = !isDate && !isTime && !isDatetime && (
                        isc.SimpleType.inheritsFrom(type, "integer") || 
                        isc.SimpleType.inheritsFrom(type, "float")),
                    isEmptyString = (value == "")
                ;

                if (isDatetime || isDate || isTime) {
                    if (this._formatAsTime()) {
                        if (isEmptyString && this.allowEmptyValue) {
                            // handle empty time-values
                            value = null;
                        } else {
                            
                            var baseDate;
                            if (!isTime && isc.isA.Date(this._value)) {
                                baseDate = this._value;
                            }
                            var timeVal = isc.Time.parseInput(
                                            value, !this.forceTimeConversion(), 
                                            false, !isTime, baseDate);
                            if (isc.isA.Date(timeVal)) value = timeVal;
                        }
                    } else {
                        var inputFormat = this.inputFormat;
                        if (inputFormat == null) {
                            inputFormat = isc.DateUtil.mapDisplayFormatToInputFormat(
                                this._getDateFormatter());
                        }
                        var logicalDate = isDate && !isDatetime;
                        
                        var dateVal = isc.DateUtil.parseInput(value, inputFormat, 
                                          this.centuryThreshold, false, !logicalDate);
                        if (isc.isA.Date(dateVal)) value = dateVal;
                    }
                } else if (isNumeric) {
                    // as with dates, clear number fields if the value is an empty string
                    if (isEmptyString && this.allowEmptyValue) {
                        value = null;
                    }
                }
            }
        }
        return value;
    
    },
    
    // getType() - returns the specified 'type' for this item
    // If this.criteriaField is specified, type will be picked up from that field
    
    getType : function () {
        var type = this.form ? this.form.getFieldType(this) : null;
        return type || this.defaultType;
    },
    
    getDisplayFieldType : function () {
        var optionDataSource = this.getOptionDataSource(),
            displayFieldName = this.getDisplayFieldName();
        if (optionDataSource && displayFieldName) {
            var displayField = optionDataSource.getField(displayFieldName);
            if (displayField != null && displayField.type != null) {
                return displayField.type;
            }
        }
        return this.getType();
    },
    
    // Helper to set the time on a date to zero for a datetime
    
    setToZeroTime : function (date) {
        isc.DateUtil.setToZeroTime(date);
    },
	
	//>	@method	formItem._mapKey() (A)
	// Map a key value through the item.valueMap, if defined,
	// to return the display value that we should show to the user.
    // By default returns the key if no mapping was found. 2nd parameter allows the developer
    // to suppress this behavior, and return null if no mapping was found.
	//<
	_mapKey : function (key, dontReturnKey) {
        // assert !isc.isAn.Array(key)

        var defaultValue = dontReturnKey ? null : key;

		var map = this.getAllValueMappings();
		if (!map) return defaultValue;		
		if (isc.isA.String(map)) map = this.getGlobalReference(map);

        // If it's an array, just return the key.  It's either in the array or not - no need
        // to transform.
        if (isc.isAn.Array(map)) return defaultValue;

        return isc.getValueForKey(key, map, defaultValue);
	},

	//>	@method	formItem._unmapKey() (A)
	//		Map a display value through the item.valueMap, if defined,
	//		to return the key value used internally.
	//<
    _unmapKey : function (value, dontReturnValue) {
//JMD: handle null value in isc.getKeyForValue instead?

        var defaultKey = dontReturnValue ? null : value;
		var map = this.getAllValueMappings();
		if (!map) return dontReturnValue ? null : value;		
		if (isc.isA.String(map)) map = this.getGlobalReference(map);

        // if it's an array, just return the value, it's either in the array or not - no need
        // to transform.
        if (isc.isAn.Array(map)) return value;

        var result = isc.getKeyForValue(value, map, defaultKey);
        // if getKeyForValue returns the same value it was passed, and that happens to also
        // be the emptyDisplayValue for this item, don't allow the emptyDisplayValue to be
        // promoted to the internal value
        if (result != null && result == value && result === this.emptyDisplayValue) {
            result = "";

            var valueField = this.getValueFieldName();
            if (valueField != null) {
                // Try looking in the option data source's cache data.
                var ods = this.getOptionDataSource();
                var odsCacheData = (ods == null || this.suppressOptionDSCacheAccess 
                                     ? null : ods.getCacheData());
                if (odsCacheData != null) {
                    var optionRecord = odsCacheData.find(this.getDisplayFieldName(), value);
                    if (optionRecord != null) {
                        result = optionRecord[valueField];
                    }
                }
            }
        }

        

        return result;
	},

	//>	@method	formItem.setValueMap()	(A)
	// Set the valueMap for this item.
	// @group	valueMap
	// @param	valueMap (Array | Object) new valueMap
    // @see attr:valueMap
    // @visibility external
	//<
	setValueMap : function (valueMap) {
		this.valueMap = valueMap;
        
        this.updateValueMap();
	},
	
	//> @method formItem.setOptionDataSource() [A]
	// Method to set the +link{formItem.optionDataSource} at runtime
	// @param dataSource (DataSource) new optionDatasource
	// @visibility external
	//<
	setOptionDataSource : function (dataSource) {
        if (isc.isA.String(dataSource)) dataSource = isc.DataSource.get(dataSource);

        var calculatedODS = this.getOptionDataSource();
        if (dataSource == calculatedODS) {
            // We always want to ensure that this.optionDataSource is updated to reflect the
            // DS passed in, even if it already matches the result of the 
            // getOptionDataSource() method.
            
            if (this.optionDataSource != dataSource) {
                this.optionDataSource = dataSource;
            }
	        return;
	    }
	    this.ignoreOptionDataSource();
	    this.optionDataSource = dataSource;
	    // This in turn calls updateValueMap
	    this.invalidateDisplayValueCache();
	},

    //> @method formItem.setValueIcons()
    // Sets the +link{FormItem.valueIcons,valueIcons} for this item.
    // @param map (Object) mapping of logical values for this item to icon src +link{SCImgURL}s
    // or the special value "blank".
    // @group valueIcons
    // @visibility external
    //<
    setValueIcons : function (map) {
        this.valueIcons = map;
        if (this.isDrawn()) this.redraw();
    },

	//>	@method	formItem.setOptions()	(A)
	// Set the options for this item (a select or a radioGroup, etc.).  Synonymous with
    // setValueMap().
	//		@group	valueMap
	//		@param	valueMap (Array | Object) new valueMap
	//<
	setOptions : function (valueMap) {
		return this.setValueMap(valueMap);
	},

    //> @method formItem.updateValueMap()
    // Helper method fired whenever the valueMap is modified.
    // Will refresh the displayed value if appropriate.
    // @param   refreshDisplay  (boolean)   Can be passed to explicitly indicate that the new
    //                                      valueMap effects the currently displayed value so
    //                                      a refresh is required, or vice versa. If not passed
    //                                      we always refresh.
    //<
    updateValueMap : function (refreshDisplay) {
        if (refreshDisplay != false && !this._showingInFieldHintAsValue) {
            this._setElementValue(this.getDisplayValue(), this.getValue());
        }
		if (this.hasElement()) this.setElementValueMap(this.getValueMap());
    },
    
	//>	@method	formItem.setElementValueMap()	(A)
	// Set the valueMap in the form representation for this object.<p>
    //
	// Default implementation does nothing -- override in a subclass to actually manipulate the
    // form.
	//		@group	valueMap
	//		@param	valueMap (Array | Object) new valueMap
	//<
	setElementValueMap : function (valueMap) {
		// no default implementation
	},
    
    // Helper method to get the valueMap, plus any mappings from data to display values
    // derived from this.specialValues
    
    getAllValueMappings : function () {
        var valueMap = this.getValueMap();
        // If a devloper specifies specialValues in the form of a valueMap, add this to
        // the "getValueMap()" map so we map a selected "special" data value to a display value.
        var specialMap = !isc.isAn.Array(this.specialValues) ? this.specialValues : null;
        if (specialMap != null) {
            if (valueMap == null) valueMap = specialMap;
            
            else {
                // if the explicit map is an array, convert it to an object
                if (isc.isAn.Array(valueMap)) {
                    var explicitMap = valueMap;
                    valueMap = {};
                    for (var i = 0; i < explicitMap.length; i++) {
                        valueMap[explicitMap[i]] = explicitMap[i];
                    }
                }
                // Add entries for the special displayFieldValueMap
                // Note that the explicitly specified entries should take precedence
                valueMap = isc.addProperties({}, valueMap);
                var undef;
                for (var prop in specialMap) {
                    if (valueMap[prop] === undef) valueMap[prop] = specialMap[prop];
                }
            }
        }
        return valueMap;
    },
	
	//>	@method	formItem.getValueMap()	(A)
	// Internal method to compute the actual valueMap from the author-specified valueMap and
    // other properties.
	//		@group	valueMap
	//		@return	(Object) the valueMap
	//<
	getValueMap : function () {

		// get the valueMap from the item
		var valueMap = this.valueMap;
	
		// if valueMap are specified as a string, treat it as a global reference to the actual
        // list
		if (isc.isA.String(valueMap)) {
			valueMap = this.getGlobalReference(valueMap);
		}

        // for FormItems with displayFields, this._displayFieldValueMap is a special map between 
        // data field values and display field values in the items' optionDataSource.
        // Set up in 2 ways:
        // - if the optionDataSource matches the dataSource for the form, this is picked up
        //   from a call to setValues() on the form as a whole (EG editing records)
        // - if the value for the item is set to an unrecognized value as part of 
        //   item.setValue(), mapValueToDisplay will perform an explicit fetch against the 
        //   dataSource to retrieve the displayValue for the value passed in.
        // Combine this special map with the explicitly specified valueMap.
        var displayMap = this._displayFieldValueMap;
        if (displayMap != null) {
            if (valueMap == null) valueMap = displayMap;
            
            else {
                // if the explicit map is an array, convert it to an object
                if (isc.isAn.Array(valueMap)) {
                    var explicitMap = valueMap;
                    valueMap = {};
                    for (var i = 0; i < explicitMap.length; i++) {
                        valueMap[explicitMap[i]] = explicitMap[i];
                    }
                }
                // Add entries for the special displayFieldValueMap
                // Note that the explicitly specified entries should take precedence
                valueMap = isc.addProperties({}, valueMap);
                var undef;
                for (var prop in displayMap) {
                    if (valueMap[prop] === undef) valueMap[prop] = displayMap[prop];
                }
            }
        }
        return valueMap;
    },

    //> @method FormItem.getValueFieldName()
    // Getter method to retrieve the +link{FormItem.valueField} for this item. For
    // items with a specified +link{formItem.optionDataSource}, this determines which
    // field in that dataSource corresponds to the value for this item.
    // <P>
    // If unset, if a +link{dataSourceField.foreignKey,foreignKey relationship} exists
    // between this field and the optionDataSource, this will be used,
    // otherwise default behavior will return the +link{FormItem.name} of this field.
    //
    // @group display_values
    // @return (String) fieldName to use a "value field" in records from this items 
    //              +link{FormItem.optionDataSource}
    // @visibility external
    //<
    getValueFieldName : function () {
        if (this.valueField) return this.valueField;
        
        if (this.form && this.form.dataSource && this.foreignKey) 
            return isc.DS.getForeignFieldName(this, this.form.dataSource);

        var fieldName = this.getFieldName();

        
        
        
        return fieldName || "name";
    },
    
    //> @method   FormItem.getDisplayFieldName()
    // Returns the <code>displayField</code> for this item.
    // <P>
    // Behavior varies based on the configuration of this item, as follows:
    // <ul><li>If this item has an +link{optionDataSource} and an explicit 
    //  +link{FormItem.foreignDisplayField} is specified, this will be returned.</li>
    // <li>Otherwise if an explicit +link{displayField} is specified it will be returned 
    //  by default. If the <code>displayField</code> was specified on the underlying 
    //  dataSource field, and no matching field is present in the +link{optionDataSource} for
    //  the item, we avoid returning the specified displayField value and instead return the
    //  title field of the option DataSource. We do this to
    //  avoid confusion for the case where the displayField is intended as a display-field
    //  value for showing another field value within the same record in the underlying
    //  dataSource only.</li>
    // <li>If no explicit foreignDisplay or displayField 
    //  specification was found, and the +link{formItem.valueField} for this item is hidden in the 
    //  +link{formItem.optionDataSource}, this method will return the title field for 
    //  the <code>optionDataSource</code>.</li></ul>
    //
    // @return (FieldName) display field name, or null if there is no separate display field to
    //                     use.
    // @visibility external
    //<
    getDisplayFieldName : function () {
        
        var optionDataSource = this.getOptionDataSource(),
            formDS = this.form.getDataSource();
        
        // For a databound form, we can hit a situation where a field has a
        // specified displayField for displaying values from the same record (statically),
        // but the equivalent field in the optionDataSource has a different name.
        // This means if we have both a dataSource on the form and an optionDataSource
        // on the item, the intention of item.displayField is ambiguous.
        // Therefore:
        // - support explicit 'foreignDisplayField' as a displayField when retrieving
        //   values from an ODS
        // - otherwise if we have both ODS and form.dataSource, and displayField is set:
        //  - verify the displayField actually exists in the ODS before using it.
        if (optionDataSource) {
            if (this.foreignDisplayField) {
                return this.foreignDisplayField;
            } else if (formDS == null && this.displayField) {
                return this.displayField;
            }
        } else if (this.displayField) {
            return this.displayField;
        }
        
        // At this stage, if we have a displayField, we know we also have
        // both a form dataSource and an option dataSource.
        // Verify the field exists in the optionDataSource before using it!
        if (this.displayField) {
            var formDSField = formDS.getField(this.getFieldName()),
                formDSFieldDisplayField = formDSField ? formDSField.displayField : null;
            if (this.displayField != formDSFieldDisplayField ||
                optionDataSource.getField(this.displayField) != null) 
            {
                return this.displayField;
            } else {
                this.logInfo(
                    "Ignoring specified displayField:" + this.displayField + 
                    " - this doesn't  match any fields present in our optionDataSource:" + 
                    optionDataSource);
            }
        }
        
        var valueFieldName = this.getValueFieldName();

        if (optionDataSource && 
            optionDataSource != isc.DataSource.getDataSource(this.form.dataSource) && 
            // Has a displayField - this implies a mapping from data to display values
            // in the main DS which doesn't apply in the option DataSource. Assume
            // we're working with (something like) primary keys in the ODS and return
            // the title field as a display-field
            (this.displayField != null ||
            // The name field in the ODS is hidden - use the title field
            
            (optionDataSource.getField(valueFieldName) &&
             optionDataSource.getField(valueFieldName).hidden == true))) 
        {
            return optionDataSource.getTitleField();
        }
    },


    // If this item has a specified displayField, and no specified optionDataSource
    // we can pick up the display value for the field from the displayField value of the form's
    // values object
    // (This is based on the assumption that we are editing a 'record' - similar behavior
    // to the ListGrid).
    // See DynamicForm._useDisplayFieldValue()
    
    _displayFieldValueFromFormValues : function () {
        // for items with an option dataSource and a specified displayField, display the 
        // form's displayField value by default
        
        if (this.displayField != null) {
            var vals = this.form.getValues();
            var undef,
                fieldName = this.getFieldName();
            if (vals[fieldName] !== undef) {
                var valueField = this.getValueFieldName(),
                    displayField = this.displayField,
                    remoteDisplayField = this.getDisplayFieldName(),
                    record;
                    
                
                if (valueField != fieldName ||
                    (displayField != null && remoteDisplayField != displayField) )
                {
                    record = {};
                    record[valueField] = vals[fieldName];
                    record[remoteDisplayField] = vals[displayField];
                } else {
                    record = isc.addProperties({}, vals);
                }
                if (record) {
                    this._addDataToDisplayFieldCache([record]);
                    // Update the valueMap to include the new record
                    this.updateDisplayValueMap(true);
                }
            }
        }
    },
	
	//>	@method	formItem.getOptions()	(A)
	// Return the valueMap for this item.  Synonymous with getValueMap()
	//		@group	valueMap
	//
	//		@return	(Object) the valueMap
	//<
	getOptions : function () {
		return this.getValueMap()
	},
    

    //> @method FormItem.getOptionDataSource()
    // Returns the +link{FormItem.optionDataSource} for this item.  
    // <p>
    // Always uses <code>item.optionDataSource</code> if specified.  Otherwise, if
    // +link{dataSourceField.foreignKey} was specified, uses the target DataSource.  Otherwise,
    // uses the DataSource of this item's form (if one is configured).  
    //
    // @return (DataSource) the optionDataSource, or null if none is configured
    // @group display_values
    // @visibility external
    //<
    getOptionDataSource : function () {
        var ods = this.optionDataSource;
       
        if (ods == null) {
            var formDS = this.form ? this.form.getDefaultOptionDataSource(this) : null;

            // use foreignKey if specified
            // Will back off to form-ds if the foreignKey is unqualified (no dot)
            if (this.foreignKey) ods = isc.DS.getForeignDSName(this, formDS);

            // otherwise fall back to DataSource for form as a whole
            if (ods == null && formDS) ods = formDS;
        }        
        // convert identifiers to an actual datasource object
        if (isc.isA.String(ods)) ods = isc.DataSource.getDataSource(ods);
        
        return ods;
    },

    // getPickListFields()  - used by PickList items [SelectItem, ComboBoxItem]
    // Also used by MultiPickerItem
    getPickListFields : function () {
        // Allow the developer to specify a set of fields 
        // Only really has meaning if the select item is databound, where multiple fields are
        // available, or if custom client pickList data was supplied.
        // For databound lists, properties such as valueMaps will be picked up from
        // the dataSource.
        if (this.pickListFields) {

            
            var value = this.emptyDisplayValue;
            if (value != null) {
                var fields = this.pickListFields,
                    valueField   = this.getValueFieldName(),
                    displayField = this.getDisplayFieldName(),
                    object, undef;
                if      ((object = fields.find("name", displayField)) != null &&
                    object.emptyCellValue === undef) object.emptyCellValue = value;
                else if ((object = fields.find("name",   valueField)) != null && 
                    object.emptyCellValue === undef) object.emptyCellValue = value;
            }
            return this.pickListFields;
        }
        
        
        var displayField = this.getDisplayFieldName(),
            fieldObj;
        if (displayField != null) {
            fieldObj = {width:"*", name:displayField}

        } else {
            fieldObj = {width:"*", name:this.getValueFieldName(),
                        // apply the same valueMap to this field so the display values show up
                        // correctly
                        
                        valueMap:this.getAllValueMappings()
                       }
        }
        // if this is a SelectItem and escapeHTML is set, apply it to the
        // pickList field too (this is supported at the LG level already)
        if (this.canEscapeHTML && 
                // outputAsHTML / asHTML are old and deprecated
                (this.escapeHTML || this.outputAsHTML || this.asHTML))
        {
            fieldObj.skipLineBreaks = this.skipLineBreaks;
            fieldObj.escapeHTML     = true;
        }

        // If an empty display value is specified, apply it to the field as well so we show
        // empty options with the correct title.
        if (this.emptyDisplayValue != null) {
            // For consistency, unless canEscapeHTML is true for this item type (which indicates
            // that the item supports displaying HTML), escape the emptyDisplayValue.
            fieldObj.emptyCellValue = (this.canEscapeHTML ? this.emptyDisplayValue : String(this.emptyDisplayValue).asHTML());
        }

        // If we have an explicitly specified dateFormatter for this item, it will be passed to 
        // the pickList but only respected for fields of type "date" there.
        // Assume this is what the user intended and default the type to "date" for the pickList
        // field. This'll be unnecessary if the dataSource field is already of type:"date" of
        // course.
        if (this.dateFormatter != null) {
            fieldObj.type = "date"
        }
        
        // Apply imageURLPrefix and imageURLSuffix to the field if specified
        if (this.imageURLPrefix)    fieldObj.imageURLPrefix = this.imageURLPrefix;
        if (this.imageURLSuffix)    fieldObj.imageURLSuffix = this.imageURLSuffix;
        
        // hang a flag on the field object as being auto-generated.
        // in this case we'll assign our custom formatter to it.
        // Otherwise the user is on their own.
        fieldObj._isGeneratedField = true;
        
        return [fieldObj]
    },
    
	//>	@method	formItem.getValueMapTitle()	(A)
	// Return the title associated with a particular value
	//		@group	valueMap
	//		@return	(String)	title of the option in question
	//<
	getValueMapTitle : function (value) {
		var valueMap = this.getAllValueMappings();
		// return the value as the title if it exists in the valueMap array
		if (isc.isAn.Array(valueMap)) return (valueMap.contains(value) ? value : "");
		return valueMap[value];
	},

    
    setOptionCriteria : function (newCriteria) {
        this.optionCriteria = newCriteria;
        this._optionCriteria = null;
    },

    getOptionCriteriaCopy : function () {
        if (this.optionCriteria == null) return null;
        
        if (this._optionCriteria) {
            return this._optionCriteria;
        }

        var criteria = isc.addProperties({}, this.optionCriteria);

        if (!isc.DS.isAdvancedCriteria(criteria)) {
            if (criteria.operator && criteria.criteria) {
                // Advanced format but missing constructor
                criteria._constructor = "AdvancedCriteria";
                this._optionCriteria = criteria;
            } else if (criteria.fieldName && criteria.operator) {
                // Shorthand format
                criteria = {
                        _constructor: "AdvancedCriteria",
                        operator: "and",
                        criteria: isc.isAn.Array(criteria) ? criteria : [criteria]
                };
                this._optionCriteria = criteria;
            } else {
                this._optionCriteria = this.optionCriteria;
            }
        }
        return criteria;
    },

	// --------------------------------------------------------------------------------------------

	//>	@method	formItem.saveValue()
	// Store a value for this form item internally, and at the form level.<br>
    // This method will update our internal "_value" property and the value stored in the form's
    // "values" array.
    // It is used in 'setValue()', and in  'elementChanged()', and 'handleKeyPress()' to ensure the 
    // stored values for this item reflect the value displayed in this form item's element.
    //      @visibility internal
	//		@group formValues
	//
    // @param	value 	(Any)				value to save for this item
    // @param [isDefault] (boolean) Indicates that this value was derived from the default 
    //  value for this item (allowing us to re eval dynamic defaults in setItemValues())
	//<
    saveValue : function (value, isDefault) {

        // this.logWarn("saving value: " + value + this.getStackTrace());

        
        this._supercededFetchMissingValuesIndex = this._fetchMissingValuesIndex;
        
        var undef;
        this._value = value;
        // set or clear the flag indicating whether this is a default value.
        this._setToDefault = isDefault;

        // This value is going to be saved on the form itself under form.values.
        // If we have a hidden data element (for direct submission), update it now so that
        // when the form gets submitted the element value is present.
        if (this.isDrawn()) {
            if (this._useHiddenDataElement()) this._setHiddenDataElementValue(value);      
        }

        var form = this.form;
        if (form == null) return;

        if (value == undef && this._clearingValue) {
            form.clearItemValue(this);
        } else {
            form.saveItemValue(this, value);
        }

        if (this._getShowPending()) this.updatePendingStatus(value);
    },

    _getShowPending : function () {
        var parentItem = this.parentItem;
        if (parentItem != null) return parentItem._getShowPending();

        var form = this.form;
        if (this.showPending == null && form != null) return !!form.showPending;
        else return !!this.showPending;
    },

    _getShowDeletions : function () {
        var parentItem = this.parentItem;
        if (parentItem != null) return parentItem._getShowDeletions();

        var showDeletions,
            form;
        if ((showDeletions = this.showDeletions) != null) {
            return !!showDeletions;
        } else if ((form = this.form) != null &&
                   (showDeletions = form.showDeletions) != null)
        {
            return !!showDeletions;
        } else {
            return this._getShowPending();
        }
    },

    //> @method formItem.setFixedPendingStatus()
    // Setter for +link{attr:fixedPendingStatus,fixedPendingStatus}.
    // @param newManualPendingStatus (Boolean) new <code>fixedPendingStatus</code>.
    //<
    setFixedPendingStatus : function (newManualPendingStatus) {
        this.fixedPendingStatus = newManualPendingStatus;
        if (this._getShowPending()) {
            this._setFixedPendingStatusCalled = true;
            this.updatePendingStatus(this._value);
            this._setFixedPendingStatusCalled = false;
        }
    },

    updatePendingStatus : function (value) {
        var form = this.form;
        
        var origPendingStatus = !!this.pendingStatus,
            oldValue = this._getOldValue(),
            result = this.compareValues(oldValue, value),
            pendingStatus = (this.fixedPendingStatus != null
                                                  ? !!this.fixedPendingStatus.valueOf()
                                                  : !result)
        ;
        
        // if the form is in mid-load, via a valuesManager, don't show the pending style
        var vm = this.form && this.form.valuesManager;
        if (vm && (vm.__editingNewRecord || vm.__saveDataReply)) {
            pendingStatus = false;
        }
        this.pendingStatus = pendingStatus;
                                                  
        

        if (origPendingStatus != pendingStatus) {
            // Clear any hover in case the old value hover is showing.
            if (!pendingStatus) isc.Hover.clear();
            this._pendingStatusChanged(pendingStatus);
        }
    },

    _pendingStatusChanged : function (pendingStatus) {
        var canceled = (this.pendingStatusChanged != null &&
                        this.pendingStatusChanged(this.form, this, pendingStatus,
                                                  this._value, this._getOldValue()) == false);
        // Remember whether the default pendingStatusChanged behavior was canceled so that if
        // this form item is redrawn, we won't apply (at least in part) the default behavior.
        this._defaultPendingStatusChangedBehaviorCanceled = canceled;
        if (!canceled) {
            this._defaultPendingStatusChangedBehavior(pendingStatus);
        }
    },

    _defaultPendingStatusChangedBehavior : function (pendingStatus) {
        this.updateState();
    },

    // If we're using a hidden data element, this method will set its value, so when the form
    // is natively submitted the value is available to the server.
    _setHiddenDataElementValue : function (value) {
        var hde = this._getHiddenDataElement();
        if (hde) hde.value = value;
    },

    //>	@method	formItem.setValue()
	// Set the value of the form item to the value passed in
    // <p>
	// NOTE: for valueMap'd items, newValue should be data value not displayed value
    // @visibility external
	// @param	newValue 	(Any)				value to set the element to
    //<
    // @param   [allowNullValue]   (boolean) Internal parameter to avoid setting to default when
    // passed a null value. 
    
    _$smart:"smart",
	setValue : function (newValue, allowNullValue, timeCritical, dontResetCursor) {

        
        this._settingValue = true;

        
        this._setValueCalled = true;

        // If we have focus, remember the selection so we can retain the cursor insertion point
        // - useful for the case where this is a simple data transform, such as case-shifting
        var resetCursor = !dontResetCursor && 
                           (this.maintainSelectionOnTransform && this.hasFocus && 
                           (this._getAutoCompleteSetting() != this._$smart));

        
        if (resetCursor && !isc.EH.synchronousFocusNotifications && isc.Browser.isIE) {
            if (!this._hasNativeFocus()) {
                resetCursor = false;
            }
        }

        if (resetCursor) this.rememberSelection(timeCritical);

        // since we're being set to an explicit value, cancel delayed save on keyPress
        if (this._pendingUpdate != null) {
            isc.Timer.clearTimeout(this._pendingUpdate);
            this._pendingUpdate = null;
        }

        // If the passed in value is null and we have a defaultValue, apply it.
        
        var isDefault;
        if (newValue == null && !allowNullValue) {
            var defaultVal = this.getDefaultValue();
            // don't apply the default value if it's not set - this allows for the distinction 
            // between setting the value to 'null' vs 'undefined'
            if (defaultVal != null) {
                isDefault = true;
                newValue = defaultVal;
            }
        }
        // If the form item is `multiple` then the value of the form must be an array.
        if (this.multiple && newValue != null && !isc.isAn.Array(newValue)) {
            var op = isc.DS._operators[this.getOperator()];
            if (op && op.valueType == "valueSet" && op.processValue) {
                newValue = op.processValue(newValue);
            } else {
            newValue = [newValue];
        }
        }
		// truncate newValue to the length of the field, if specified
        if (this.enforceLength && this.length != null && newValue != null) {
            var isNumber = isc.isA.Number(newValue);
            if (isNumber) {
            // number-based items will have already converted the entered value - stringify it again 
                if (this._getFormattedNumberString) {
                    newValue = this._getFormattedNumberString(newValue);
                } else {
                    newValue = "" + newValue;
                }
            }
            if (isc.isA.String(newValue) && newValue.length > this.length) {
                // Note - we simply truncate here - no need to reset to the existing value as 
                // we do with change handlers since this isn't an attempted user-edit
                newValue = newValue.substring(0, this.length);
            }
            if (isNumber) newValue = this.mapDisplayToValue(newValue, true); 
        }
        // saveValue will store the value as this._value, and will save the value in the form 
        // if this.shouldSaveValue is true
        this.saveValue(newValue, isDefault);
        this._showValue(newValue, resetCursor);

        this._settingValue = false;

        return newValue
	},

	
	_showValue : function (newValue, resetCursor) {
        if (this.destroyed) return;
	    // shouldFetchMissingValue() tests for whether we should fetch values at all 
	    // (option dataSource, fetchMissingValues etc) and whether we already have the
	    // value cached.
	    if (newValue != null) {

	        if (this.multiple) {
	            // assert isc.isAn.Array(newValue) // enforced above
	            var shouldFetchValues = [];
	            for (var i = 0, len = newValue.length; i < len; ++i) {
	                var val = newValue[i];
	                if (val != null && this.shouldFetchMissingValue(val)) {
	                    shouldFetchValues.push(val);
	                }
	            }
	            this._clearSelectedRecord();
	            this._checkForDisplayFieldValue(shouldFetchValues);
	        } else if (this.shouldFetchMissingValue(newValue)) {
	            // _checkForDisplayFieldValue() will kick off a fetch (Unless we're already pending a
	            // response for this value).
	            // Drop the current selected record - it's invalid right now and will be
	            // repopulated when the fetch completes
	            this._clearSelectedRecord();
	            this._checkForDisplayFieldValue(newValue);
	        // If we're not fetching a missing value it's likely we already have it
	        // in our cache - ensure our "selected record" is up to date in this case
	        } else {
                if (this._selectedRecordValue == null || 
                        !this.compareValues(this._selectedRecordValue, this._value))
                {
                    this._updateSelectedRecord();
                }
	        
	        }
	    } else {
	        // update the selected record from cache unless we already have it set up correctly.
	        if (this._selectedRecordValue == null || 
	                !this.compareValues(this._selectedRecordValue, this._value))
	        {
	            this._updateSelectedRecord();
	        }
	    }

	    // map the value passed to the visible value as necessary
	    var displayValue = this._getDisplayValue(newValue);
	    // set the value of the item
	    
        
	    this._setElementValue(displayValue, newValue);

	    // On simple data transforms (currently case shifting only), we will retain the
	    // cursor positon across setValue() calls if the item has focus
	    if (resetCursor) {
            this.resetToLastSelection(true);
        }
	},

	//>@method formItem.shouldFetchMissingValue()
	// If this field has a specified +link{optionDataSource}, should we perform a fetch against
	// that dataSource to find the record that matches this field's value?
	// <P>
	// If the value is non-null, this method is called when the item is first rendered 
	// or whenever the value is changed via a call to +link{setValue()}. If it returns 
	// true, a fetch will be dispatched against the optionDataSource to get the record
	// matching the value
	// <P>
	// When the fetch completes, if a record was found that matches the
	// data value (and the form item value has not subsequently changed again), 
	// the item will be re-rendered to reflect any changes to the display value,
	// and the record matching the value
	// will be available via +link{FormItem.getSelectedRecord(),this.getSelectedRecord()}.
	// <P>
	// Default behavior will return false if +link{FormItem.fetchMissingValues,this.fetchMissingValues} is 
	// set to false. Otherwise it will return true if +link{FormItem.alwaysFetchMissingValues,this.alwaysFetchMissingValues} is
	// set to true, or if a +link{displayField} is specified for this item and the item 
	// value is not already present in the item's valueMap.
    //
    // @param newValue (Any) The new data value of the item.
	// @return (Boolean) should we fetch the record matching the new value from the
	//   item's optionDataSource?
	// @visibility external
	//<
	shouldFetchMissingValue : function (newValue) {
        var returnVal = this._shouldFetchMissingValue(newValue, this.getValueFieldName());
        if (returnVal != null) {
            return returnVal;
        }        

	    // if alwaysFetchMissingValues was not true, and the flag to suppress the fetch
        // while editable is set, return false
        
        if (!(this.isReadOnly()) && this._suppressFetchMissingValueIfEditable) return false;
	    // return true if we have a displayField set and we don't have the
	    // value in our valueMap
	    if (this.getDisplayFieldName() == null) return false;
        var inValueMap = (this._mapKey(newValue, true) != null);
	    return !inValueMap;
	},

    shouldFetchMissingDisplayValue : function (newValue) {
        var displayField = this.getDisplayFieldName();
        if (displayField == null) return false;

        var returnVal = this._shouldFetchMissingValue(newValue, displayField);
        if (returnVal != null) return returnVal;

        var inValueMap = (this._unmapKey(newValue, true) != null);
        return !inValueMap;
    },

    _shouldFetchMissingValue : function (value, fieldName) {
        if (this.fetchMissingValues == false) return false;
        if (this.getOptionDataSource() == null) return false;
        // If we already fetched for this data value, and didn't find a match,
        // don't kick off another.
        var valueField = this.getValueFieldName(),
        isValueField = (valueField == fieldName);
        if (this._notValueFieldValueCache && isValueField 
            && this._notValueFieldValueCache[value] != null) 
        {
            return false;
        }
        if (!isValueField) {
            var displayField = this.getDisplayFieldName();
            
            if (this._notDisplayFieldValueCache && fieldName == displayField
                && this._notDisplayFieldValueCache[value] != null) 
            {
                return false;
            }
        }
        // If we already saw this data value and performed a fetch against it, don't kick off another
        // fetch even if alwaysFetchValues is true.
        var inCache = false;
        if (this._displayFieldCache != null && 
            // _gotAllOptions basically indicates that filterLocally was true when we
            // populated our cache, so even if we can't find the record we don't need to
            // fetch again.
            (this._gotAllOptions ||
             this._displayFieldCache.find(fieldName, value) != null))
        {
            inCache = true;
        }
        if (inCache) return false;
        // Fetch missing value if the flag to always fetch is true.
        if (this.alwaysFetchMissingValues) return true;
        // returning null tells upstream code that the value isn't cached but
        // alwaysFetchMissingValues isn't set either - it can make the decision about
        // whether to fetch.
        return null;
    },

    // used by Visual ISC only
    setDefaultValue : function (newValue) {
        var prevDefaultValue = this.defaultValue, undef;
        this.defaultValue = newValue;
        if (this.isSetToDefaultValue() || (this._value == null && prevDefaultValue === undef)) 
            this.clearValue();
    },

    // This handles the case where we have a dataValue (from a "setValue()" call typically)
    // and we want to pick up the associated record / display value
    _checkForDisplayFieldValue : function (dataValue) {
        return this._checkForTargetFieldValue(
                    dataValue, this.getValueFieldName(), false);
    },

    // This handles the case where we have a display value (from user editing of a 
    // ComboBoxItem typically), and we want to pick up the associated data value and 
    // record.
    
    _checkForValueFieldValue : function (displayValue) {
        return this._checkForTargetFieldValue(
                    displayValue, this.getDisplayFieldName(), true);
    },

    
    _fetchMissingValuesIndex:0,
    _checkForTargetFieldValue : function (newValue, targetField, isValueField) {

        var suppressLoadingDisplay = isValueField;
        var fetchingMissingValues;
        if (isValueField) {
            if (!this._fetchingMissingValueFieldValues) this._fetchingMissingValueFieldValues = {};
            fetchingMissingValues = this._fetchingMissingValueFieldValues;
        } else {
            if (!this._fetchingMissingDisplayFieldValues) this._fetchingMissingDisplayFieldValues = {};
            fetchingMissingValues = this._fetchingMissingDisplayFieldValues;            
        }
        
        // Flag to indicate we're currently getting this missing value from the server
        // so we don't kick off another fetch for the same value.
        // This will be cleared when we get the target field value back
        var needFetch = false;
        if (isc.isAn.Array(newValue)) {
            for (var i = 0, len = newValue.length; i < len; ++i) {
                var val = newValue[i];
                if (!fetchingMissingValues[val]) {
                    needFetch = true;
                    fetchingMissingValues[val] = ++this._fetchMissingValuesIndex;
                }
            }
        } else if (!fetchingMissingValues[newValue]) {
            needFetch = true;
            fetchingMissingValues[newValue] = ++this._fetchMissingValuesIndex;
        }
        if (needFetch) {

            // Show "Loading" message and set field read-only until loaded
            
            if (!suppressLoadingDisplay) this._setLoadingDisplayValue();

            var ods = this.getOptionDataSource();

            // when deriving a valueMap from a DataSource, respect optionCriteria, 
            // optionFetchContext etc as we do in ListGrid fields and PickList based items
            var recordCrit = this.getOptionCriteriaCopy();
            // Convert to AdvancedCriteria if we don't want an exact match for these criteria
            // Required as we always do want an exact match for the actual data to display value
            // mapping part of the criteria.
            if (recordCrit && recordCrit._constructor != "AdvancedCriteria" &&
                    this.optionTextMatchStyle != "exact") 
            {
                recordCrit = isc.DataSource.convertCriteria(recordCrit, this.optionTextMatchStyle, ods);
            }

            
            if (!recordCrit && this.getPickListFilterCriteria && this.optionOperationId) {
                recordCrit = this.getPickListFilterCriteria();
                // Convert to AdvancedCriteria to respect this.textMatchStyle if necessary
                
                if (recordCrit && recordCrit._constructor != "AdvancedCriteria" &&
                    this.textMatchStyle != "exact") 
                {
                    recordCrit = isc.DataSource.convertCriteria(recordCrit, this.textMatchStyle, ods);
                }
            }

            if (!this.filterLocally) {
                var valueCriterion = {};
                // If `newValue' is an array with exactly one element, send the element instead
                // of an array with one element.
                
                if (isc.isAn.Array(newValue) && newValue.length == 1) {
                    valueCriterion[targetField] = newValue[0];
                } else {
                    valueCriterion[targetField] = newValue;
                }
                
                recordCrit = (ods || isc.DS).combineCriteria(
                    recordCrit, valueCriterion, "and", "exact"
                );
            }

            var context = isc.addProperties(
                {},
                this.optionFilterContext,
                {showPrompt:false,
                 internalClientContext:{newValue:newValue,
                     filterLocally:this.filterLocally,
                     targetField:targetField,
                     fetchingMissingValues:fetchingMissingValues},
                 componentId:this.containerWidget.getID(), 
                 componentContext:this.getFieldName(),
                 textMatchStyle:"exact"}
            );

            var undef;
            if (this.optionOperationId !== undef) {
                context.operationId = this.optionOperationId;
            }
            ods.fetchData(
                recordCrit, 
                {
                    target:this, 
                    methodName:"fetchMissingValueReply"
                },
                context
            );
        }

        return !needFetch;
    },

    // Callback method fired when the server returns with the target field value from
    // our optionDataSource.
    // If we fetched a display value, fold this new value into our valueMap, and if necessary
    // refresh to display it.
    fetchMissingValueReply : function (response, data, request) {

        // If we fetched all the values in the data-set, use array.find to find the appropriate
        // one
        var clientContext = response.internalClientContext,
            newValue = clientContext.newValue,
            targetField = clientContext.targetField,
            fetchingMissingValues = clientContext.fetchingMissingValues,
            // Look at filterLocally as it was set when the fetch was initialized as that
            // governs what the criteria were - could have been subsequently changed.
            filterLocally = clientContext.filterLocally,
            fetchedDisplayFieldValues = (this._fetchingMissingDisplayFieldValues === fetchingMissingValues),
            // If this was a fetch for a data-value from a display-value, should we 
            // run "_updateValue(...)"?
            // This will be set to false if we've had the value altered since the fetch
            // was kicked off.
            shouldUpdateValue;
        if (!fetchedDisplayFieldValues) {
            var testedDisplayValue = response.internalClientContext.newValue;

            shouldUpdateValue = false;

            if (this._fetchingMissingValueFieldValues &&
                this._fetchingMissingValueFieldValues[testedDisplayValue])
            {
                shouldUpdateValue = true;
                var fetchIndex = this._fetchingMissingValueFieldValues[testedDisplayValue]
                
                if (fetchIndex <= this._supercededFetchMissingValuesIndex) {
                    shouldUpdateValue = false;
                
                } else {
                    for (var value in this._fetchingMissingValueFieldValues) {
                        if (this._fetchingMissingValueFieldValues[value] > fetchIndex) {
                            shouldUpdateValue = false;
                            break;
                        }
                    }
                }
            } else {
                
            }
        
        }
        
        if (!isc.isAn.Array(newValue)) newValue = [newValue];
        var filteredData;
        if (!filterLocally) {
            filteredData = [];
        }

        var notFoundCount = 0,
            notFoundValues = [];
        for (var i = 0, len = newValue.length; i < len; ++i) {
            // Clean up the fetchingMissingValues object
            if (!fetchingMissingValues || !newValue || !newValue[i]) {
                this.logWarn("fetchMissingValueReply returned unexpected data: " + this.echo(clientContext));
            }
            delete fetchingMissingValues[newValue[i]];

            var record = data ? data.find(targetField, newValue[i]) : null;
            if (!record) {
                //>DEBUG
                if (fetchedDisplayFieldValues) {
                    this.logInfo("Unable to retrieve display value for data value:" + newValue[i] +
                                 " from dataSource " + this.getOptionDataSource());
                }
                //<DEBUG
                notFoundValues.add(newValue[i]);
                ++notFoundCount;
            } else if (!filterLocally) {
                filteredData.push(record);
            }
        }

        var dataLength = data ? data.getLength() : 0,
            newValueLength = newValue.getLength();
        if (!filterLocally && (dataLength > (newValueLength - notFoundCount))) {
            if (fetchedDisplayFieldValues) {
                this.logWarn("FetchMissingValues - filterLocally is false yet optionDataSource " +
                             "fetch included records that do not match our current data value. Ignoring " +
                             "these values.", "fetchMissingValues");
            }
            this.logDebug("Data returned:" + this.echoAll(data), "fetchMissingValues");

            data = filteredData;
        }
/*
        // If we fetched all the values in the data-set, use array.find to find the appropriate
        // one
        var dataVal = response.internalClientContext.dataValue,
            // Look at filterLocally as it was set when the fetch was initialized as that
            // governs what the criteria were - could have been subsequently changed.
            filterLocally = response.internalClientContext.filterLocally,
            displayField = this.getDisplayFieldName(),
            valueField = this.getValueFieldName();

        if (!isc.isAn.Array(dataVal)) dataVal = [dataVal];

        var filteredData;
        if (!filterLocally) {
            filteredData = [];
        }

        var notFoundCount = 0;
        for (var i = 0, len = dataVal.length; i < len; ++i) {
            // Clean up the fetchingMissingValues object
            delete fetchingMissingValues[dataVal[i]];

            var record = data ? data.find(valueField, dataVal[i]) : null;
            if (!record) {
                //>DEBUG
                if (fetchedDisplayFieldValues) {
                    this.logInfo("Unable to retrieve display value for data value:" + dataVal[i] +
                                 " from dataSource " + this.getOptionDataSource());
                }
                //<DEBUG

                ++notFoundCount;
            } else if (!filterLocally) {
                filteredData.push(record);
            }
        }

        var dataLength = data ? data.getLength() : 0,
            dataValLength = dataVal.getLength();
        if (!filterLocally && (dataLength > (dataValLength - notFoundCount))) {
            if (fetchedDisplayFieldValues) {
                this.logWarn("FetchMissingValues - filterLocally is false yet optionDataSource " +
                             "fetch included records that do not match our current data value. Ignoring " +
                             "these values.", "fetchMissingValues");
            }
            this.logDebug("Data returned:" + this.echoAll(data), "fetchMissingValues");

            data = filteredData;
        }
*/
        if (fetchedDisplayFieldValues) {
            this._fetchMissingDisplayFieldValueReply(
                response, data, request, notFoundCount, notFoundValues);
        } else if (this._fetchingMissingValueFieldValues === fetchingMissingValues) {
            this._fetchMissingValueFieldValueReply(
                response, data, request, notFoundCount, notFoundValues, shouldUpdateValue);
        }
        
    },

    
    _fetchMissingDisplayFieldValueReply : function (dsResponse, data, dsRequest,
                                         notFoundCount, notFoundValues, wasValueFieldFetch) 
    {
        // Cache the returned results in our 'displayFieldCache' array. This has 2 advantages:
        // - on 'setValue()' to a value we've already seen we can update the selected record
        //   without requiring an additional fetch
        // - We can maintain cache-synch with the dataSource by observing dataChanged 
        //   [like resultsets]. Caching the entire record rather than just the valueMap means we
        //   can handle sparse updates which refer only to primaryKeys [just deletion, probably].
        
        if (notFoundValues != null && notFoundValues.length > 0) {
            this._cacheNoMatchDisplayValues(notFoundValues, wasValueFieldFetch);
        }
        var displayValueModified = this._addDataToDisplayFieldCache(data);
        var needsRefresh =  displayValueModified &&
                            this._refreshForDisplayValueChange();

        // If we retrieved the entire dataSet, set a flag to avoid future fetches that
        // would otherwise occur if 'setValue()' was called passing in a value that's
        // not present in this valueMap
        if (dsResponse.internalClientContext.filterLocally) this._gotAllOptions = true;

        // We need to refresh our displayed value if we're still showing the
        // data value
        
        this.updateDisplayValueMap(needsRefresh, notFoundValues);
        
        // If field was set to read-only during Loading message, make it editable now
        if (this._showingLoadingDisplayValue) {
            if (!wasValueFieldFetch) {
                this._clearLoadingDisplayValue(notFoundCount);
            } else {
                // A sanity check - we should have fetchingMissingDisplayFieldValues active
                // and have overlapping fetches or we wouldn't have shown the loading marker...
                if (!this._fetchMissingValueInProgress(true)) {
                
                    this.logWarn(
                        "Possible confusion: Callback fired from 'fetchMissingValueFieldValue()' [attempt to " +
                        "map user-entered display value to a data value]. The loadingDisplayValue " +
                        "is currently showing. This should only be shown when the fetching " +
                        "a display value from a data value. " +
                        "This can occur with overlapping fetches but we do not appear to have " +
                        "an outstanding fetch for display field values.",
                        "loadingDisplayValue");
                 }
            }
        }
        // Notify the form so we can save out the display field value too.
        if (displayValueModified) this.form.itemDisplayValueModified(this, this._value);
        
        if (this._selectAfterLoading) {
            
            delete this._selectAfterLoading;
            this.selectValue();
        }
    },
    
    // Cache out the cases where we have a data value and we've attempted to find
    // a matching display value but the ODS fails to find a match
    // (And the case where the user enters a display value and we failed to find a 
    // matching record).
    _cacheNoMatchDisplayValues : function (notFoundValues, wasValueFieldFetch) {
        
        if (this._notDisplayFieldValueCache == null) {
            this._notDisplayFieldValueCache = {};
        }
        if (this._notValueFieldValueCache == null) {
            this._notValueFieldValueCache = {};
        }

        // Which field within the dataSource did we think this value might match?
        // If the "wasValueFieldFetch" parameter is true, we were attempting to get
        // the "valueField" value from a display value, so this value doesn't match
        // any displayField value in the DataSource
        // if false, we were attempting to get a display value from a data value, so
        // this value doesn't match any value-field value.
        var noMatchCache = wasValueFieldFetch ? 
                            this._notDisplayFieldValueCache : this._notValueFieldValueCache;
        if (notFoundValues != null && notFoundValues.length > 0) {
            for (var i = 0; i < notFoundValues.length; i++) {
                noMatchCache[notFoundValues[i]] = true;
            }
        }
    },

    _clearPendingMissingValue : function (value) {
        if (this._fetchingMissingValueFieldValues) delete this._fetchingMissingValueFieldValues[value];
    },

    
    _fetchMissingValueInProgress : function (checkDisplayFieldValues, keyValue) {
        var targetObject = checkDisplayFieldValues 
                ? this._fetchingMissingDisplayFieldValues : this._fetchingMissingValueFieldValues;

        if (keyValue != null) {
            return targetObject != null && (targetObject[keyValue] > 0);
        }
        // If no explicit key was passed in, return true if we have any outstanding fetches
        // of the type requested (display or valueField, or vice versa)
        return (targetObject != null && !isc.isAn.emptyObject(targetObject));
    },

    _setLoadingDisplayValue : function () {
        this.logDebug("showing loadingDisplayValue. Value specified as: " 
                        + this.loadingDisplayValue, "loadingDisplayValue");
        if (this.loadingDisplayValue != null) {
            if (!this.isReadOnly()) {
                this._explicitCanEdit = this.canEdit;
                this.setCanEdit(false);
                // Keep record of changing the read-only status of the field
                // so we know to reset it when value is loaded.
                this._readOnlyFetchMissingValue = true;
            }
            // This flag helps us avoid reading back the loadingDisplayValue and
            // assuming it was user-entered
            if (this._showingLoadingDisplayValue) {
                this.logInfo(
                    "_setLoadingDisplayValue called, but the value is already showing. " +
                    "This may be valid if we have a second fetch kicked off before the " +
                    "first completes (due to 2 calls to 'setValue()', say)",
                    "loadingDisplayValue");
            }
            this._showingLoadingDisplayValue = true;
            this._hideInFieldHint();
            this.setElementValue(this.loadingDisplayValue);
        }
    },
    
    // This method is called from the callback to checkDisplayFieldValue [mapping from
    // data value to display value] to clear the "Loading..." marker.
    // Within the method, check whether there is still an outstanding fetch for our *current*
    // data value's display value, and if so avoid clearing the value.
    
    _clearLoadingDisplayValue : function (notFoundCount) {
        this.logDebug("clearLoadingDisplayValue called", "loadingDisplayValue");

        var resetValue = this._showingLoadingDisplayValue
        if (!resetValue) {
            this.logInfo("_clearLoadingDisplay value called without a prior call to " +
                "show the loading display value", "loadingDisplayValue");
        }
        
        // The message clears itself because of the new value assigned (or reverts to
        // original value in the case where no new value was assigned), however,
        // if the field was set to read-only during Loading message, make it editable now
        
        var value = this.getValue();
        var fetchStillInProgress;
        if (this.multiple && isc.isAn.Array(value)) {
            for (var i = 0; i < value.length; i++) {
                fetchStillInProgress = fetchStillInProgress || 
                                        this._fetchMissingValueInProgress(true, value[i]);
            }
        } else {
            fetchStillInProgress = this._fetchMissingValueInProgress(true, value);
        }
        if (!fetchStillInProgress) {
            this.logDebug("clearLoadingDisplayValue() - " +
                          "no outstanding fetch for display value, so clearing loading marker",
                          "loadingDisplayValue");
            this._showingLoadingDisplayValue = false;
            if (this._readOnlyFetchMissingValue) {     
                delete this._readOnlyFetchMissingValue;
                this.setCanEdit(this._explicitCanEdit);
            }
            
            if (resetValue) {
                var displayValue = this.getDisplayValue();
                this._setElementValue(displayValue, this._value);
                
                this._updateTextBoxState();
            }
        } else {
            this.logInfo("clearLoadingDisplayValue(): Still has outstanding fetch for display value" +
                          "- leaving loading marker visible", "loadingDisplayValue");
        }
    },

    _fetchMissingValueFieldValueReply : function (dsResponse, data, dsRequest, notFoundCount, 
                                                   notFoundValues, shouldUpdateValue) 
    {
        this._fetchMissingDisplayFieldValueReply(dsResponse, data, dsRequest, notFoundCount, notFoundValues, true);
        
        // Call _updateValue() to fire change events in case this item's value changed as a result
        // of fetching a missing data value.
        // Exceptions: 
        // - if saveValue has run since we kicked off the fetch, assume it's stale.
        // - also if we have any other outstanding fetch which supercedes ours, assume it's stale.
        if (shouldUpdateValue) {
            var testedDisplayValue = dsResponse.internalClientContext.newValue;
            
            this._updateValue(testedDisplayValue);
            this._updateSelectedRecord();
        }
    },

    _addRecordToDisplayFieldCache : function (record) {
        //>DEBUG
        this.logInfo("Adding Record to displayFieldCache:" + this.echo(record), "displayFieldCache");
        //<DEBUG
        var data = record == null ? null : [record];
        return this._addDataToDisplayFieldCache(data);
    },

    _addDataToDisplayFieldCache : function (data) {
        //>DEBUG
        this.logInfo("Adding Data to displayFieldCache" + 
            (this.logIsDebugEnabled("displayFieldCache") ? this.echoAll(data) : ""), 
            "displayFieldCache");
        //<DEBUG
        return this._modifyDataInDisplayFieldCache(data, true, true, false, true);
    },

    _removeValueFromDisplayFieldCache : function (value) {
        var cache = this._displayFieldCache;
        if (cache) {
            var valueField = this.getValueFieldName(),
                record = cache.find(valueField, value);

            if (record != null) {
                //>DEBUG
                this.logInfo("Removing record from displayFieldCache" + this.echo(record), 
                    "displayFieldCache");
                //<DEBUG
                return this._modifyDataInDisplayFieldCache([record], false, false, true, true);
            }
        }
        return false;
    },

    // Add a list of records to the displayValue cache.  The `add`, `update`, and `remove`
    // arguments are flags that determine the action taken.  If `returnNeedsRefresh` is true
    // then this method also returns whether or not the changes to the cache affect the
    // the displayField values of the current value of the form item.
    _modifyDataInDisplayFieldCache : function (data, add, update, remove, returnNeedsRefresh) {
        var needsRefresh = false;
    
        // If the cache is unchanged other than "not found values" we can
        // just return false
        if (data == null) return needsRefresh;

        if (this._displayFieldCache == null) {
            this._displayFieldCache = [];
        }

        var cache = this._displayFieldCache,
            valueField = this.getValueFieldName(),
            displayField = this.getDisplayFieldName(),
            hasDisplayField = (displayField != valueField),
            addOnly = add && !(update || remove);

        if (returnNeedsRefresh) {
            var value = this.getValue();

            if (!isc.isAn.Array(value)) value = [value];
        }

        // get a map of valueField to array-index for items already in the cache - used to 
        // avoid scanning the arrays in the loop below with indexof() or similar
        var inCacheMap = cache.getValueIndexMap(valueField);

        
        for (var i = 0; i < data.length; i++) {
            var record = data[i],
                recordValue = record[valueField],
                displayValue = record[displayField],
                j = inCacheMap[recordValue],
                maybeNeedsRefresh = false
            ;
                
            // If an add or an update made a record match some value we previously 
            // have stored as having no matches, we can get rid of that.
            if (this._notValueFieldValueCache && 
                this._notValueFieldValueCache[recordValue]) 
            {
                delete this._notValueFieldValueCache[recordValue];
            }
      
            if (hasDisplayField && this._notDisplayFieldValueCache &&
                 this._notDisplayFieldValueCache[displayValue]) 
            {
                delete this._notDisplayFieldValueCache[displayValue];
            }

            if (j == null) {
                if (add) {
                    cache.push(record);
                    maybeNeedsRefresh = true;
                }
            } else if (update || remove) {
                var cachedRecord = cache[j],
                    changed = (record[displayField] != cachedRecord[displayField]);

                if (update && changed) {
                    cache[j] = record;
                    maybeNeedsRefresh = true;
                } else if (remove) {
                    cache.splice(j, 1);
                    maybeNeedsRefresh = true;
                }
            }

            if (returnNeedsRefresh && maybeNeedsRefresh && !needsRefresh) {
                needsRefresh = (value.indexOf(recordValue) != -1);
            }
        }

        // As with ResultSets, observe dataChanged on the dataSource so we can update our
        // cache automatically when records cached in our displayFieldCache are modified.
        var dataSource = this.getOptionDataSource();
        if (dataSource && !this.isObserving(dataSource, "dataChanged")) {
            this.observe(dataSource, 
                "dataChanged", "observer.dataSourceDataChanged(observed,dsRequest,dsResponse)");
        } 

        if (returnNeedsRefresh) return needsRefresh;
    },

    _refreshForDisplayValueChange : function () {
        return true;
    },

    updateDisplayValueMap : function (needsRefresh) {

        // update this._selectedRecord from the _displayFieldCache
        // If we have no cache, this ensures selection is clear
        this._updateSelectedRecord();

        var data = this._displayFieldCache,
            displayField = this.getDisplayFieldName(),
            valueField = this.getValueFieldName();
            
        // Add to the special 'displayFieldValueMap'
        // This is combined with any explicitly specified valueMap by 'getValueMap()'
        
        var valueMap = this._displayFieldValueMap = {};

        // if we have no cache, we'll hang onto the empty object
        if (data != null) {        
            var undef;
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                var value = record[valueField], display = record[displayField];
                // Note: We assume uniqueness here - if multiple records are returned with the same
                // data value, we'd expect them to have the same display value (and we can ignore
                // the later rows).
                if (value == null || valueMap[value] !== undef) {
                    if (valueMap[value] != display) {
                        // Log a warning if we hit duplicate entries with non duplicate display
                        // values
                        this.logWarn("Deriving valueMap for '" + valueField + 
                                        "' from dataSource based on displayField '" + displayField + 
                                        "'. This dataSource contains more than one record with " + valueField 
                                        + " set to " + value + " with differing " + displayField + " values." 
                                        + " Derived valueMap is therefore unpredictable.",
                                    "fetchMissingValues");
                    }
                    continue;
                }
                valueMap[record[valueField]] = displayField != null ? display : value;
            }
        }
        // UpdateValueMap actually combines the displayFieldValueMap with any user-specified VM.
        this.updateValueMap(needsRefresh);

    },
    
    //> @method formItem.invalidateDisplayValueCache()
    // If this item has a specified +link{formItem.displayField}, the value displayed to the
    // user for this item may be derived from another field.
    // <P>
    // The display field can be either another field value in the same record or a field that
    // must be retrieved from a related +link{formItem.optionDataSource,optionDataSource} if
    // +link{FormItem.fetchMissingValues} is true. In this latter case, we perform a fetch against
    // the option dataSource when the item value changes in order to determine the
    // display value to show (and we make the associated record available via
    // +link{formItem.getSelectedRecord()}).
    // <P>
    // We cache this data on the form item, so if the item value changes to a new value, then reverts
    // to a previously-seen value, the display value and selected record are already available 
    // without the need for an additional fetch. The cached values will also be kept in synch with
    // the dataSource data assuming it is modified via standard add, update or delete operations.
    // <P>
    // This method explicitly invalidates this cache of optionDataSource data, and if the item value
    // is non null and fetchMissingValues is still true, re-fetches the data.
    // 
    // @group display_values
    // @visibility external
    //<
    // Internal destroying parameter allows us to clean up optionDataSources / missingValues type
    // stuff without instantiating a new fetch.
    invalidateDisplayValueCache : function (destroying) {
        // drop the generated 'displayFieldValueMap' / 'displayFieldCache'
        this._displayFieldValueMap = null;
        this._displayFieldCache = null;
        this._notDisplayFieldValueCache = null;
        this._notValueFieldValueCache = null;
        this._clearSelectedRecord();
        this._gotAllOptions = false;
        
        this.ignoreOptionDataSource();
        if (destroying) return;
        
        // If we are just showing values from the form as a whole, regenerate
        if (this.form._useDisplayFieldValue(this)) {
            this._displayFieldValueFromFormValues();
        // Otherwise call _checkForDisplayFieldValue which will re-fetch against the OptionDataSource
        // unless fetchMissingValues is false, etc.
        } else if (this._value != null && this.shouldFetchMissingValue(this._value)) {
            this._clearSelectedRecord();
            this._checkForDisplayFieldValue(this._value);
        }
        // updateValueMap should reset our display value - of course if an asynch fetch occurred
        // we'll temporarily show the data value, until the fetch completes.
        this.updateValueMap();
    },
 
    ignoreOptionDataSource : function () {
        // Drop optionDataSource observation. We'll re-set it up in fetchMissingValueReply if
        // fetchMissingValues is true
        
        var ODS = this.getOptionDataSource();
        if (ODS != null && this.isObserving(ODS, "dataChanged")) {
            this.ignore(ODS, "dataChanged");
        }
    },
    
    // dataSourceDataChanged
    // if optionDataSource and fetchMissingValues is specified we pick up DataSource records
    // and build a valueMap from them.
    // As with ResultSets, we observe dataChanged on the dataSource so we can keep these cached
    // records / valueMap synched with the dataSource.
    dataSourceDataChanged : function (dataSource,dsRequest,dsResponse) {
        var logCacheSynch = this.logIsDebugEnabled("fetchMissingValues");
        if (logCacheSynch) {
            this.logDebug("dataSourceDataChanged is firing for request:" + this.echo(dsRequest),
             "fetchMissingValues");
        }
        var cache = this._displayFieldCache;
        if (cache == null) return;
        
        if (dsResponse.invalidateCache) {
            if (logCacheSynch) {
                this.logDebug("Request had invalidateCache set, dropping cached display values", 
                    "fetchMissingValues");
            }
            this.invalidateDisplayValueCache();
        } else {
            
            var displayField = this.getDisplayFieldName(),
                valueField = this.getValueFieldName();

            var updateData = dataSource.getUpdatedData(dsRequest, dsResponse, true),
                isAdd = dsRequest.operationType == "add",
                isUpdate = dsRequest.operationType == "update",
                isRemove = dsRequest.operationType == "remove";
            
            if (logCacheSynch) {
                this.logDebug("Operation type:" + dsRequest.operationType + ", updateData:" + 
                        this.echoAll(updateData), "fetchMissingValues");
            }
            
            // Bail if no change was actually made or we don't understand the operation
            // in question
            
            if (updateData == null || (!isAdd && !isRemove && !isUpdate)) return;
            
            if (!isc.isAn.Array(updateData)) {
                updateData = [updateData];
            }
            var dataValueModified = false;
            
            var hasDisplayField = (valueField != displayField);
            
            // an add will *always* add to the cache
            if (isAdd) {
                cache.addList(updateData);
            }
            var keyColumns = dataSource.getPrimaryKeyFields();
            var this_value = this._value;
            if (this.multiple && !(this_value == null || isc.isAn.Array(this_value))) {
                this.logWarn(
                        "dataSourceDataChanged - this is a multiple FormItem but " +
                        "this._value is not null and is not an array.");
                this_value = [this_value];
            }
            
            for (var i = 0; i < updateData.length; i++) {
                var updateRow = updateData[i];

                // First update the "no match cache" - we use this to 
                // avoid kicking off fetches for data values which we know have no
                // matching records in the dataSource                
                if (!isRemove) {
                    
                    if (this._notValueFieldValueCache &&
                        this._notValueFieldValueCache[updateRow[valueField]]) 
                    {
                        delete this._notValueFieldValueCache[updateRow[valueField]];
                    }
                    if (hasDisplayField && this._notDisplayFieldValueCache &&
                        this._notDisplayFieldValueCache[updateRow[displayField]]) 
                    {
                        delete this._notDisplayFieldValueCache[updateRow[displayField]];
                    }
                // If it's a remove, we can add the entry to the "no match cache" as
                // we know we don't have a match in the DataSource.
                } else {
                    if (this._notValueFieldValueCache == null) {
                        this._notValueFieldValueCache = {};
                    }
                    this._notValueFieldValueCache[updateRow[valueField]] = true;
                    if (hasDisplayField) {
                        if (this._notDisplayFieldValueCache == null) {
                            this._notDisplayFieldValueCache = {};
                        }
                        this._notDisplayFieldValueCache[updateRow[displayField]] = true;
                    }
                }
                
                
                // find the index of the old row
                var recordValue;
                if (isAdd) {
                    recordValue = updateRow[valueField];
                } else {
                    var keyValues = isc.applyMask(updateRow, keyColumns);
                    var index = dataSource.findByKeys(keyValues, cache);
                    if (index == -1) {
                        if (isRemove) continue;
                        // else - update, if we didn't have the record add it
                        
                        cache.add(updateRow);
                    } else {
                        if (isRemove) {
                            recordValue = cache[index][valueField];
                            cache.removeAt(index);

                        } else {
                            cache[index] = updateRow;
                            recordValue = cache[index][valueField];
                        }
                    
                    }
                }
                
                if (recordValue != null) {

                    if (this.multiple) {
                        if (this_value != null) {
                            var len = this_value.getLength();
                            for (var k = 0; !dataValueModified && k < len; ++k) {
                                dataValueModified = recordValue == this_value[k];
                            }
                        }
                    } else if (recordValue == this._value) {
                        dataValueModified = true;
                    }
                }
            }
                                
            // Now rebuild the valueMap from the new set of cache data, and the 'selectedRecord'
            // if necessary.
            this.updateDisplayValueMap(dataValueModified && this._refreshForDisplayValueChange());
            
            // Notify the form - we save out the modified display field value too.                
            if (dataValueModified) this.form.itemDisplayValueModified(this, this._value);

        }
    },
    
    //> @method formItem.getSelectedRecord()
    // Get the record returned from the +link{optionDataSource} when +link{formItem.fetchMissingValues,fetchMissingValues}
    // is true, and the missing value is fetched.
    // <P>
    // +link{formItem.fetchMissingValues} kicks off the fetch when the form item is initialized
    // with a non null value or when setValue() is called on the item. Note that this method
    // will return null before the fetch completes, or if no record is found in the
    // optionDataSource matching the underlying value.
    // @return (ListGridRecord) selected record
    // @group display_values
    // @visibility external
    //<
    getSelectedRecord : function () {
        if (this._selectedRecordValue != null) {
            if (!this.compareValues(this._selectedRecordValue, this._value)) {
                this.logInfo("getSelectedRecord - cached record doesn't match new value - dropping",
                            "fetchMissingValues");
                this._clearSelectedRecord();
            }
        }
        return this._selectedRecord;
    },

    _updateSelectedRecord : function () {
        // Remember the current selectedRecord - if it changes we want to
        // fire a notification
        var prevSelectedRecord = this._selectedRecord;

        var changed = false;
        if (this._value == null || this._displayFieldCache == null) {
            this._clearSelectedRecord();
        } else {

            var valueField = this.getValueFieldName();
            this._selectedRecordValue = this._value;
            if (this.multiple) {
                var this_value = this._value;
                if (!(this_value == null || isc.isAn.Array(this_value))) {
                    this.logWarn(
                            "_updateSelectedRecord - this is a multiple FormItem but this._value " +
                            "is not null and is not an array");
                    this_value = [this_value];
                }

                if (this_value == null) {
                    this._selectedRecord = null;
                } else {
                    // assert isc.isAn.Array(this._value)
                    this._selectedRecord = [];
                    for (var i = 0, len = this_value.length; i < len; ++i) {
                        this._selectedRecord.push(
                                this._displayFieldCache.find(valueField, this_value[i]));
                    }
                }
            } else {
                this._selectedRecord = this._displayFieldCache.find(valueField, this._value);
            }
        }
        if (prevSelectedRecord != this._selectedRecord) {
            this.selectedRecordChanged(this._selectedRecord);
        }

    },
    _clearSelectedRecord : function () {
        delete this._selectedRecord;
        delete this._selectedRecordValue;
    },

    //> @method formItem.selectedRecordChanged()
    // Notification method fired for +link{formItem.optionDataSource,data bound items}
    // with +link{formItem.fetchMissingValues} enabled when the
    // +link{formItem.getSelectedRecord(),selected record} is updated as a result of
    // the value changing or a fetch for a new record completing.<br>
    // Note that a formItem with an optionDataSource may avoid fetching an associated
    // record altogether in some cases. See +link{formItem.fetchMissingValues} and
    // +link{formItem.alwaysFetchMissingValues}. Developers should also be aware that
    // if +link{PickList.fetchDisplayedFieldsOnly} is set (or some custom 
    // +link{formItem.optionOperationId,fetch operation} has been specified), the
    // data returned from the server may include only a subset of dataSource fields rather than
    // complete records.
    // @param record (ListGridRecord) new selected record. May be null if the item has been
    //  set to a value with no associated record.
    // @visibility external
    //<
    selectedRecordChanged : function (record) {
    },

    //>	@method	formItem.clearValue()
	// Clear the value for this form item.
    // <P>
    // Note that if a default value is specified, value will be set to that default value,
    // otherwise value will be cleared, (and removed from the containing form's values).
    // @visibility external
	//<
    
    clearValue : function () {
        
        this._clearingValue = true;
        this.setValue();
        delete this._clearingValue;
    },

    // Update the form item to display the value passed in.  This method basically calls
    // setElementValue().  In the case of `multiple: true` FormItems this method
    // converts the input value (assumed to be an array of strings) to a string using the
    // multipleValueSeparator to join the values.
    // Note that the <code>newValue</code> passed in is expected to be the display value
    // (which is, in the case of a multiple FormItem, an array of display values), 
    // rather than a raw value.
    
    _setElementValue : function (newValue, dataValue) {
        if (this.multiple && newValue != null && isc.isAn.Array(newValue)) {
            newValue = this._finishMapMultipleValueToDisplay(newValue, dataValue);
        }
        return this.setElementValue(newValue, dataValue);
    },

	//>	@method	formItem.setElementValue()
	// Update the form item to display the value passed in.  If this item has a true form data
    // element (text box, checkbox, etc), this method will set the value of that element.
    // Otherwise updates the necessary HTML for the form item to display the new value.
    // Note that the <code>newValue</code> passed in is expected to be the display value, 
    // rather than the raw value (should have  already been passed through 
    // <code>this.mapValueToDisplay()</code>).
    //
	//		@group	elements
	//		@param	newValue 	(Any)	value to set the element to 
	//<
    // Note this method also update any valueIcon to display the appropriate value for the
    // current form item value
    

	setElementValue : function (newValue, dataValue) {
        if (!this.isDrawn()) return;
        
        var undef;
        if (dataValue === undef) {  
            dataValue = this._value;
        }

        newValue = this._convertDisplayToLoadingValue(newValue, dataValue);
        // If we hae a data element we always set element.value
        if (this.hasDataElement()) {
            
        
        
		    // get a pointer to the native form element for this item
    		var element = this.getDataElement();
            if (element != null) {
                this._updateValueIcon(dataValue);
                // If the element.value already matches the new value don't explicitly 
                // reassign
                
                
                if (element.value !== newValue) {
                    var scrollLeft, scrollTop,
                        resetScroll = false,
                        mapToString = false;
                    if (isc.Browser.isIE) {
                        
                        mapToString = isc.isA.TextItem(this);
                        if (isc.Browser.version >= 10) {
                            resetScroll = true;
                            scrollLeft = element.scrollLeft;
                            scrollTop = element.scrollTop;
                        }
                    }
                    
                    element.value = (mapToString && newValue == null) ? isc.emptyString 
                                                                      : newValue;
                    
                    if (resetScroll) {
                        element.scrollLeft = scrollLeft;
                        element.scrollTop = scrollTop;
                    }
                }
                if (newValue == null || isc.isAn.emptyString(newValue)) {
                    
                    this._showingInFieldHintAsValue = false;
                }
                return newValue;
            }
        } else if (this._useHiddenDataElement()) {
            // update the internal value on the hidden dataElement
            this._setHiddenDataElementValue(dataValue);
        }
        // otherwise if we have no data element, just redraw the content of our text box
        var textBox = this._getTextBoxElement();
        if (textBox != null) {
            if (this.showValueIconOnly) newValue = isc.emptyString;
            
            
            var valueIconHTML;
            if (this.multiple && isc.isAn.Array(dataValue)) {
                if (dataValue.length == 1) {
                    valueIconHTML = this._getValueIconHTML(dataValue[0]);
                }
            } else {
                valueIconHTML = this._getValueIconHTML(dataValue);
            }
            if (valueIconHTML != null) {
                newValue = valueIconHTML + (newValue != null ? newValue :  isc.emptyString);
            }
            
            
            if (isc.Browser.isIE) {
                if (newValue && newValue.startsWith("<nobr>")) 
                    newValue = newValue.substring(6);
                if (newValue && newValue.endsWith("</nobr>"))
                    newValue = newValue.substring(0,newValue.length-7);
                try {
                    textBox.innerHTML = newValue;
                } catch (e) {
                    var newSpan = document.createElement("span");
                    newSpan.innerHTML = newValue;
                    textBox.innerHTML = "";
                    textBox.appendChild(newSpan);
                }
            } else {            
                textBox.innerHTML = newValue;
            }
            if (!this._getClipValue() || this.height == null || this.width == null) {
                this.adjustOverflow("textBox value changed");
            }
        }

        // If we didn't get a pointer to our text box, we would expect the sub item to
        // implement an appropriate override to setElementValue()
	},
    
    
    _convertDisplayToLoadingValue : function (displayValue, dataValue) {
        // Bail instantly if we're not fetching anything
        if (!this._fetchMissingValueInProgress(true)) {
            return displayValue;
        }
        
        // if dataVal wasn't passed, derive it from displayValue
        
        var undef;
        if (dataValue === undef) {
            dataValue = this.mapDisplayToValue(displayValue);
        }
        
        if (this.loadingDisplayValue != null) {
            var isLoading = false;
            if (this.multiple && isc.isAn.Array(dataValue)) {
                for (var i = 0; i < dataValue.length; i++) {
                    if (this._fetchMissingValueInProgress(true, dataValue[i])) {
                        isLoading = true;
                        break;
                    }
                }
            } else {
                if (this._fetchMissingValueInProgress(true, dataValue)) {
                    isLoading = true;
                }
            }
            if (isLoading) {
                if (!this._showingLoadingDisplayValue || displayValue != this.loadingDisplayValue) {
                    this.logInfo("setElementValue() called while attempting to fetch missing " +
                        "display-value / record from DataSource. " +
                        (displayValue != this.loadingDisplayValue ? 
                            " Specified element value is :" + displayValue +
                            " (doesn't match this.loadingDisplayValue)." : "") + 
                        (!this._showingLoadingDisplayValue ?
                            "  setLoadingDisplayValue() hasn't yet been called." : "") +
                        " Will set value to loadingDisplayValue and mark showingLoadingDisplayValue as true",
                        "loadingDisplayValue");
                }
                this._showingLoadingDisplayValue = true;
                displayValue = this.loadingDisplayValue;
            }
        }
        return displayValue;
    },


    // _updateValueIcon
    // Explicitly updates the valueIcon image src based on the data value passed in.
    _updateValueIcon : function (value) {
    
        if (this.suppressValueIcon || !this.isDrawn()) return;

        var src = this._getValueIcon(value),
            valueIconHandle = this._getValueIconHandle();
        if (src != null) {

            // If the image is already written out, just update its src and style
            if (valueIconHandle != null) {
                var spriteConfig = isc.Canvas._getSpriteConfig(src);
                
                if (this.imageURLSuffix != null && src != isc.Canvas._$blank) {
                    if (spriteConfig) {
                        if (spriteConfig.src && spriteConfig.src != isc.Canvas._$blank) {
                            spriteConfig.src += this.imageURLSuffix;
                        }
                    } else {
                        src += this.imageURLSuffix;
                    }
                }
                
                var imgDir = this.imageURLPrefix || this.baseURL || this.imgDir;

                isc.Canvas._updateImage(valueIconHandle, src, imgDir, this.containerWidget,
                                        this._getValueIconStyle(value), this);

            // In this case the valueIcon has never been written out.
            // Positioning of the valueIcon will vary by form item. 
            // - for data element based items, such as text items, we write the icon out before
            //   the data element
            // - for non data element based items, such as (synthetic) selects, we write the
            //   icon out inside the text box
            
            } else {
                var inserted = false;
                if (this.hasDataElement()) {
                    var element = this.getDataElement();
                    if (element != null) {
                        isc.Element.insertAdjacentHTML(
                            element, "beforeBegin", this._getValueIconHTML(value)            
                        );
                        var textBoxWidth = this.getTextBoxWidth(value);
                        element.style.width = (isc.isA.Number(textBoxWidth) ? textBoxWidth + isc.px : textBoxWidth);
                        inserted = true;
                    }
                } else {
                    var textBox = this._getTextBoxElement();
                    if (textBox != null) {
                        isc.Element.insertAdjacentHTML(
                            textBox, "afterBegin", this._getValueIconHTML(value)                     

                        );
                        inserted = true;
                    }
                }
                // sanity check - if we failed to insert the icon, redraw
                if (!inserted) this.redraw();
            }

        // If we have no current value icon, clear the handle if its present.
        
        } else if (valueIconHandle != null && !(isc.isAn.Array(value) && value.length > 0) ) {
            isc.Element.clear(valueIconHandle);
            if (this.hasDataElement()) {
                var element = this.getDataElement(),
                    textBoxWidth = this.getTextBoxWidth(value);
                element.style.width = (isc.isA.Number(textBoxWidth) ? textBoxWidth + isc.px : textBoxWidth);
            }
        }
    },

    //> @method formItem.setPrompt()
    // Sets the +link{FormItem.prompt,prompt} for this item.
    // @param newPrompt (HTMLString) new prompt for the item.
    // @visibility external
    //<
    setPrompt : function (newPrompt) {
        this.prompt = newPrompt;
        // no need for a redraw - we don't rely on native HTML tooltips, but react to hover events to
        // show prompts
    },

    //> @method formItem.setHint()
    // Sets the +link{FormItem.hint,hint} for this item.
    // @param newHint (HTMLString) new hint for the item.
    // @visibility external
    //<
    setHint : function (newHint) {
        if (this.hint == newHint) return;
        this.hint = newHint;
        if (this.showHint) {
            var dataElement;
            if (this._getShowHintInField() && this._getUsePlaceholderForHint() &&
                (dataElement = this.getDataElement()) != null)
            {
                dataElement.placeholder = String.htmlStringToString(newHint);

            } else {
                
                this.redraw();
            }
        }
    },

    //>@method formItem.setHintStyle()
    // Set the hintStyle for this item
    // @param hintStyle (CSSStyleName) new style for hint text
    // @visibility external
    //<
    setHintStyle : function (style) {
        if (!this._getShowHintInField() && this.getHint()) {
            var hintHandle = this._getHintCellElement();
            if (hintHandle) hintHandle.className = style;
        }
    },

    // Internal methods to show/hide hints within field
    // _showingInFieldHintAsValue maintains the visibility state of hint within field
    
    _showInFieldHint : function () {
        if (!this._showingInFieldHintAsValue && !this.hasFocus) {
            // Note that hint is HTML which may not display correctly within the field.
            // To improve the situation, call htmlStringToString() first.
            var hint = String.htmlStringToString(this.getHint());

            // Set field class to our hint style
            var element = this.getDataElement();
            if (element != null) {
                element.className = this._getInFieldHintStyle();
                // Try switching password items to plain-text while the hint is showing.
                if (isc.isA.PasswordItem && isc.isA.PasswordItem(this)) {
                    
                    if (!isc.Browser.isIE || isc.Browser.isIE9) {
                        try {
                            var preHintElementType = element.type;
                            element.type = "text";
                            this._preHintElementType = preHintElementType;
                        } catch (e) {}
                    }
                    
                    if (element.type !== "text") hint = "";
                }
            } else {
                var styledHandle = this._getElementStyledAsTextBox();
                if (styledHandle != null) {
                    styledHandle.className = this._getInFieldHintStyle();
                }
            }

            // Show the hint in the field
            this.setElementValue(hint);
            this._showingInFieldHintAsValue = true;
        }
    },
    _hideInFieldHint : function (clearStyleOnly) {
        if (this._showingInFieldHintAsValue) {
            // Reset field class to the default style
            var element = this.getDataElement();
            if (element != null) {
                element.className = this.getTextBoxStyle();
                if (this._preHintElementType != null) {
                    try {
                        element.type = this._preHintElementType;
                    } catch (e) {}
                    this._preHintElementType = null;
                }
            } else {
                var styledHandle = this._getElementStyledAsTextBox();
                if (styledHandle != null) {
                    styledHandle.className = this.getTextBoxStyle();
                }
            }
            // Clear the hint text from the field
            if (!clearStyleOnly) this.setElementValue(isc.emptyString);
            this._showingInFieldHintAsValue = false;
        }
    },

    // Internal method to define hint style
    _getInFieldHintStyle : function() {
        var rtl = this.showRTL && this.isRTL();
        var style = this.textBoxStyle;
        if (this.showErrorHintStyle && this.hasErrors()) {
            // allow a separate style for hints when the item is in error
            //style += "Error";
        }
        if ((this.showDisabled && this.renderAsDisabled()) || 
                (this.isReadOnly() && this.useDisabledHintStyleForReadOnly))
        {
            return style + (rtl ? "DisabledHintRTL" : "DisabledHint");
        } else {
            return style + (rtl ? "HintRTL" : "Hint");
        }
    },

    __mayShowHintInField : function () {
        return this.showHintInField != null ? this.showHintInField :
                   this.form && this.form.linearMode && this.linearWidth == null;
    },
    // Do we support showing infield hints?
    // Overridden to return true in subclasses where
    // - showHints is enabled
    // - showHintInField flag is enabled
    _mayShowHintInField : function() {
        return false;
    },
    // Are we showing an infield hint?
    _getShowHintInField : function () {
        return this._mayShowHintInField() && !!this.getHint();
    },

    // Helper to catch the case where we explicitly write the hint text into the 
    // data element rather than relying on placeholder
    _getShowHintTextInDataElement : function () {
        return this._getShowHintInField() &&
            !this._getUsePlaceholderForHint();
    },

    // Should an HTML5 'placeholder' be written out? this._getShowHintInField() must be true.
    //
    // Because of the common calling pattern
    //    this._getShowHintInField() && !this._getUsePlaceholderForHint()
    // .. for performance reasons, this method assumes the precondition that this._getShowHintInField()
    // is true.
    _getUsePlaceholderForHint : function () {
        
        return false;
    },

    // Value Management
	// --------------------------------------------------------------------------------------------

	//>	@method	formItem.getDefaultValue()
	// Return the default value for this item
	//		@group	elements
	//
	//		@return	(Any)		value of this element
	//<
	getDefaultValue : function () {
		if (this.defaultDynamicValue) {
			// CALLBACK API:  available variables:  "item,form,values"
			// Convert a string callback to a function
            this.convertToMethod("defaultDynamicValue");
			var item = this,
				form = this.form,
				values = this.form.getValues()
			;
			return this.defaultDynamicValue(item,form,values);
		}
        // Return this.defaultValue - note that this will return null (technically 'undef') if no
        // default value has been set, which is appropriate - allows null values in form items.
		return this.defaultValue;
	},
	
	//>	@method	formItem.setToDefaultValue()
	// Set the value for this item to the default value stored in the item
	//		@group	elements
	//		@return	(Any)		value of this element
	//<
    // Since a defaultValue means we don't support setting to null, this is really just a 
    // synonym for clearValue(), which itself calls 'setValue(null)' and lets setValue figure
    // out the defaultValue.
	setToDefaultValue : function () {
        return this.clearValue();
	},
    
    //> @method formItem.isSetToDefaultValue()
    // Is the current value displayed by the form item derived from the default value for the
    // item.
    // @return (boolean) True if this item's value is derived from the default
    //<
    isSetToDefaultValue : function () {
        return (this._setToDefault == true);
    },

    _completionAcceptKeys : {
        "Tab":true,
        "Arrow_Left":true,
        "Arrow_Right":true,
        "Arrow_Up":true,
        "Arrow_Down":true,
        "Home":true,
        "End":true,
        "Page_Up":true,
        "Page_Down":true,
        "Enter":true
    },

    //> @method formItem.updateValue()
    // Update the stored value for this form item based on the current display value.
    // 
    //  @see saveValue()
    //  @see handleChange()
    //  @see mapDisplayToValue()
    //  @visibility internal
    //<
    // Performs the following steps:
    // - takes the current value of this item's form element
    // - maps it to the appropriate value for storage using 'mapDisplayToValue()'
    // - perform validation of the form item [if validateOnChange is true]
    //      - if the resulting value from the validator differs from the value passed in,
    //        update the display and stored value to reflect this.
    // - fire any 'transformInput()' method on the value passed in. If the value is changed,
    //   store and display this new value
    // - fire the change handler for the field.
    //      - if the change handler returns false, revert to the previous value
    // - return false if the change was "rejected". IE:
    //      - a validator failed
    //      - a change handler returned false.
    
    updateValue : function (checkSetValuesPending) {
        
        if (checkSetValuesPending) {            
            // If we're in the window when we're pending set values, don't store out the
            // (as yet unpopulated) value.
            if (this.form && this.form._setValuesPending) {
                return;
            }

            // If we're in mid redraw (having already blurred the item)
            // or draw has not yet completed / not yet populated the item's element
            // with initial value, don't store out the (likely as yet unpopulated) value
            
            if (!this.isDrawn() || this._redrawInProgress || this._drawPendingSetValue) {
                return;
            }
        }
                
        // for the case where we're changeOnKeypress false, throw away the 
        // remembered value from the last "minimalUpdate"
        if (this._lastMinimalUpdateValue != null) delete this._lastMinimalUpdateValue;
        
        // If "Loading..." message is display during missing value fetch, ignore any element changes.
        if (this._showingLoadingDisplayValue) return;

        // If we're in the middle of "setValue" just bail - it's possible that this._value
        // has been updated but the element hasn't yet been updated to reflect that.
        // If we encounter this we don't want to make the (incorrect) assumption that 
        // the user has modified the element value
        if (this._settingValue) return;

        // this is effectively meaningless if we have no element (override for special cases
        // like container items)
        if (!this.hasElement() || this.getDataElement() == null) return;
        
        if (this._suppressUpdateValueFromElement()) return;

        var newValue = this.getElementValue();
        return this._updateValue(newValue);
    },

    _suppressUpdateValueFromElement : function () {
        // If we're marked as canEdit:false, never pick up the value from the element.
        // We wouldn't expect the (display) value to be able to be changed by the user, but
        // this will avoid edge cases where the display <--> data value mapping is
        // not exactly 1:1
        
        if (this.getCanEdit() == false) return true;
        return false;
    },
    
    // Helper to catch the case where updateValue is called and we have a displayValue
    // is already a (remapped) display value for the current data value.
    // We use this to short-circuit _updateValue() and avoid clobbering a user-selected
    // value in the case where the dataVal -> displayVal conversion is ambiguous.
    
    _remappedDisplayValueUnchanged : function (newValue) {
        if (this.getDisplayFieldName() != null) {
            var currentDisplayValue = this.mapValueToDisplay(this._value);
            if ( currentDisplayValue == newValue &&
                (currentDisplayValue != this._value || this.getSelectedRecord() != null)) 
            {
                return true;
            }
            return false;
        }
    },
    _updateValue : function (newValue, forceSave) {

        
        if (this._showingLoadingDisplayValue && newValue == this._loadingDisplayValue) {
            
            return;
        }
 
        // avoid spurious changes with auto-completion
        if (this._pendingCompletion) {
            newValue = this._handleChangeWithCompletion(newValue);
        }
        
        // this method is passed the user-entered value (AKA "display value")
        // In some cases we have an ambiguous conversion from display value to data value --
        // IE: we can have multiple records [or valueMap entries] with the same display value
        // but different data values.
        // Add a check to avoid saving out the value if it is unchanged from the display value
        // for our current stored value so we don't change values inappropriately.
        
        if (this._remappedDisplayValueUnchanged(newValue)) return;
        
        // unmap the value if necessary 
        
        newValue = this.mapDisplayToValue(newValue);
        return this.storeValue(newValue);
    },

    //> @method formItem.storeValue()
    // Store (and optionally show) a value for this form item. 
    // <p>
    // This method will fire standard +link{formItem.change()} and
    // +link{dynamicForm.itemChanged()} handlers, and store the value passed in such that
    // subsequent calls to +link{formItem.getValue()} or +link{dynamicForm.getValue()} will
    // return the new value for this item.
    // <P>
    // This method is intended to provide a way for custom formItems - most commonly 
    // +link{canvasItem,canvasItems} - to provide a new interface to the user, allowing them
    // to manipulate the item's value, for example in an embedded +link{CanvasItem.canvas},
    // or a pop-up dialog launched from an +link{FormItemIcon,icon}, etc.  Developers
    // should call this method when the user interacts with this custom 
    // interface in order to store the changed value.
    // <P>
    // +link{CanvasItem.shouldSaveValue,shouldSaveValue} for CanvasItems is
    // false by default. Custom CanvasItems will need to override shouldSaveValue
    // to true if the values stored via this API should be included in the form's
    // +link{DynamicForm.getValues(),getValues()} and saved with the form when
    // +link{DynamicForm.saveData(),saveData()} is called.
    // <P>
    // If you cannot easily detect interactions that should change the value as the 
    // user performs them, a workaround is to call
    // <code>storeValue</code> right before the form saves.
    // <P>
    // Note that this method is not designed for customizing a value which is already being
    // saved by a standard user interaction. For example you should not call this method
    // from a +link{formItem.change(),change handler}. Other APIs such as 
    // +link{formItem.transformInput()} exist for this.
    // 
    // @example canvasItem
    //
    // @param value (Any) value to save for this item
    // @param [showValue] (Boolean) Should the formItem be updated to display the new value?
    // @visibility external
    //<
    
    storeValue : function (newValue, showValue) {

        // Bail if we have already saved the value (avoids firing change on arrow keypresses,
        // etc.)      

        if (this.compareValues(newValue, this._value)) {
            //this.logWarn("FI._updateValue: not saving, value unchanged: " + this._value);
            return true;
        }
        // This method may have been tripped by the developer's change handler somehow
        // (most common example - causing formItem to blur() when changeOnBlur is true)
        // If this is the case, bail unless the value passed in differs from the value we're
        // about to save (stored as this._changeValue)
        if (this._changingValue) {
            if (this.compareValues(newValue, this._changeValue)) {
                // this.logWarn("FI._updateValue: bailing on redundant change: " + this._changeValue);
                return true;
            }
            
        }

        // fire the change handler, (handles validation etc)
        // Notes:
        // - handleChange may modify the value to be saved (due to validator.suggestedValue,
        //   change handler returning false, etc). 
        //   In this case:
        //   - it will also actually save the value / reset the elementValue via a call to 
        //      setValue()
        //   - It will store the resulting value from the change handler 
        //     (whether modified and saved or not) as this._changeValue. We can then save
        //     this value out iff it hasn't already been saved (!= this._value).
        // - We consider some interactions a change "failure"- such as the change handler
        //   explicitly returning false. In these cases the handleChange() method will return
        //   false. We simply return this to our calling method in case there is any special
        //   handling to be performed.
        var returnVal = this.handleChange(newValue, this._value);

        var redrawnDuringChange = this._redrawnDuringChange;
        delete this._redrawnDuringChange;

        // bail if handleChange() returned false
        if (!returnVal) return false;

        // The change handler may call 'setItems' on the form (particularly likely in LG editing)
        // in which case we'll be destroyed
         
        if (this.destroyed) return;

        // Ensure we have the latest value (stored as this._changeValue)
        newValue = this._changeValue;
        // We may need to perform some visual updates based on the new value - do this here
        this.updateAppearance(newValue);

        // save the value
        // this.logWarn("FI._updateValue: old value: " + this._value + ", newValue: " + newValue + 
        //              ", will save: " + (!this.compareValues(newValue, this._value)));
        if (!this.compareValues(newValue, this._value)) {
            // if the saved value is null and newValue is the emptyDisplayValue,
            // don't store it as the new saved value
            if (!(this._value == null && newValue && newValue == this.emptyDisplayValue)) {
                this.saveValue(newValue);
            }
        }

        delete this._changeValue;

        // fire any specified 'changed' handler for this item.
        
        this.handleChanged(this._value);    

        // If updated value should be shown, do that now
        
        if (showValue || redrawnDuringChange) this._showValue(newValue);

        return returnVal;
    },

    //> @attr formItem.implicitSave (Boolean : false : IRW)
    // When true, indicates that changes to this item will cause an automatic save on a 
    // +link{dynamicForm.implicitSaveDelay, delay}, as well as when the entire form is
    // submitted.  If implicitSaveOnBlur is set to true on either this 
    // +link{formItem.implicitSaveOnBlur, formItem} or it's  
    // +link{dynamicForm.implicitSaveOnBlur, form}, changes will also be automatically saved  
    // immediately on editorExit.
    // @visibility external
    //<	

    //> @attr formItem.implicitSaveOnBlur (Boolean : false : IRW)
    // If set to true, this item's value will be saved immediately when its 
    // "editorExit" handler is fired.  This attribute works separately from 
    // +link{formItem.implicitSave, implicitSave}, which causes saves during editing, after a 
    // +link{dynamicForm.implicitSaveDelay, short delay},
    // and when the entire form is submitted.
    // @visibility external
    //<	

    // handleChanged() - helper to fire any user-specified "changed" handler on this item.
    handleChanged : function (value) {
        // Give any Rules associated via a rulesEngine a chance to fire. However, if the
        // form is going to trigger the same processing on item change, just wait until then.
        if (this.form && this.form.rulesEngine != null && !this.form._fireRuleContextOnItemChange) {
            this.form.rulesEngine.processChanged(this.form, this);
        }

        if (this.changed) {
            
            this.changed(this.form, this, value);
        }
        if (this.form) {
            this.form._itemChanged(this, value);

            this.checkForImplicitSave();
        }
    },

    checkForImplicitSave : function () {
        if (this.getImplicitSave()) {
            var _this = this;
            this.form._addItemToImplicitSaveUpdateArray(this);
            this.form.awaitingImplicitSave = true;
            this.form.fireOnPause("fiImplicitSave", 
                function () {
                    if (_this.form.awaitingImplicitSave) {
                        _this.form.performImplicitSave(_this, true);
                    }
                }, this.form.implicitSaveDelay
            );
        }
    },

    // updateAppearance() - helper method fired in response to updateValue when we have
    // a new value (entered by the user)
    // Default implementation will just rewrite any valueIcon's URL.
    
    updateAppearance : function (newValue) {
        if (this.valueIcons || this.getValueIcon) {
            this._updateValueIcon(newValue);
        }
    },


	//>	@method	formItem.getValue()
	// Return the value tracked by this form item.
    // <P>
    // Note that for FormItems that have a +link{ValueMap} or where a
    // +link{formatValue(),formatter} has been defined, <code>getValue()</code> returns the
    // underlying value of the FormItem, not the displayed value.
    //
    // @group formValues
	// @return (Any) value of this element
    // @visibility external
	//<
	getValue : function () {
	    if (this.destroyed || this.destroying) return;
	    
        // We return this._value, rather than looking at the form item's element and deriving
        // the value from there.
        // This is appropriate for a number of reasons.
        //  - this._value may be of a type not supported by the form element, which usually only 
        //    supports strings.  We need to track booleans, null (as distinct from null
        //    string), or a number (as opposed to a number in String form). 
        //    The value set by user interaction in the form may need to be processed before it
        //    can be stored as this._value.
        //  - We want to ensure that a change handler is fired before the value is updated
        //    (allowing users to cancel a change).  
        //    If getValue() were to return the value derived from the element, in some cases we 
        //    would not have received a change notification, but the value returned would be 
        //    different from the last stored value.
        //
        // We keep this._value up to date via the 'updateValue()' method, which will fire
        // change handlers and validators for the item, then store the value via 'saveValue()'
        // updateValue() is called whenever the value may have changed (depending on the form
        // item type this may be a result of native onchange, keypress or other event[s]).
        var undef;
        if (this._value !== undef) {
            return this._value;
        }
        
        // If no value has been stored for this element, return the value the form has for this 
        // element.
        
        return this.form.getSavedItemValue(this);
	},

    _getOldValue : function () {
        var form = this.form;
        if (form == null) return;
        var fieldName = this.getTrimmedDataPath() || this[form.fieldIdProperty];
        return form._oldValues && form._oldValues[fieldName];
    },

    //> @method	formItem.getElementValue()
    // Return the value stored in the form element(s) for this item without modification
    //  @group	elements
    //
    //  @return	(Any)		value of this element
    //<
    
    getElementValue : function () {
        

        // If showing an in-field hint, simulate an element value of undefined
        if (this._showingInFieldHintAsValue) return this.emptyDisplayValue;

        // get a pointer to the element for this item
        var element = this.getDataElement();

        // if no element was found, bail
        if (!element) return null;

        var value = "";

        
        if (this._propagateMultiple && element.files && element.files.length > 1) {
            for (var i=0; i < element.files.length; i++) {
                if (value != "") value += this.multipleValueSeparator;
                value += element.files[i].name;
            }
        } else {
            value = element.value;
        }

        return value;
    },


	//>	@method	formItem.resetValue()
	// Reset the value for this item to the value stored in the last save point for the form
	//		@group	elements
	//<
	resetValue : function () {
		var oldValue = this.form._oldValues[this.getFieldName()];
		this.setValue(oldValue);
	},

    //> @method formItem.getValueAsInteger()
    // Return the value tracked by this form item as an Integer.  If the value cannot
    // be parsed to an int that matches the original value, null will be returned.
    //
    // @return (Integer) value of this element
    //
    // @see method:FormItem.getValue()
    // @see method:FormItem.getValueAsLong()
    // @visibility external
    //<
    
    getValueAsInteger : function () {
        var origValue   = this.getValue(),
            parsedValue = parseInt(origValue);
        
        return isNaN(parsedValue) || parsedValue.toString() != origValue ? null : parsedValue;
    },

    //>	@attr formItem.shouldSaveValue (Boolean : true : IR)
    // Should this item's value be saved in the form's values and hence returned from
    // +link{dynamicForm.getValues,form.getValues()}?
    // <p>
    // <code>shouldSaveValue:false</code> is used to mark formItems which do not correspond to
    // the underlying data model and should not save a value into the form's
    // +link{dynamicForm.values,values}.  Example includes visual separators, password re-type fields,
    // or checkboxes used to show/hide other form items.
    // <p>
    // A <code>shouldSaveValue:false</code> item should be given a value either via
    // +link{formItem.defaultValue} or by calling
    // +link{dynamicForm.setValue,form.setValue(item, value)} or 
    // +link{formItem.setValue,formItem.setValue(value)}.  Providing a value via
    // +link{dynamicForm.values,form.values} or +link{dynamicForm.setValues,form.setValues()} 
    // will automatically switch the item to <code>shouldSaveValue:true</code>.
    // <P>
    // Note that <ul>
    // <li>if an item is shouldSaveValue true, but has no name, a warning is logged, and 
    //     shouldSaveValue will be set to false.
    // </li></ul>
    //
    // @group formValues
    // @visibility external
    //<
    shouldSaveValue:true,

    // Will this form item's value be submitted directly to the server via a native form submit?
    shouldSubmitValue : function () {
        return this.form._formWillSubmit();
    },

    //> @method formItem.applyFormula()
    // Manually sets this FormItem to the result of +link{formItem.formula} or +link{formItem.textFormula}.
    // Formulas are normally automatically recomputed and the result automatically applied to the FormItem
    // according to the rules described under +link{formItem.formula}. <code>applyFormula()</code> exists
    // to cover any rare cases where these rules are not correct.
    // <p>
    // Calling <code>applyFormula()</code> has no effect if no +link{formItem.formula} or 
    // +link{formItem.textFormula} is configured for this FormItem.
    //
    // @visibility external
    //<
    applyFormula : function () {
        if (!this.form) return;
        var rulesEngine = this.form.getRulesEngine();
        if (!rulesEngine) return;
        var itemName = this.getTrimmedDataPath() ||this.getFieldName(),
            formulaProperty = (this.formula ? "formula" : "textFormula"),
            name = this.form._getRuleName(formulaProperty, {fieldName:itemName})
        ;
        if (!name) return;

        var rule = rulesEngine.getRule(name);

        if (rule) {
            // Apply formula result unconditionally

            
            this._forceApplyFormula = true;
            rulesEngine.processRules([rule]);
        }
    },

    //> @method formItem.getCanEdit()
    // Is this form item editable or read-only?
    // <P>
    // This setting differs from the enabled/disabled state in that most form items will
    // allow copying of the contents while read-only but do not while disabled.
    // @return (boolean) true if editable
    // @group readOnly
    // @visibility external
    //<
    getCanEdit : function () {
        return !this.isReadOnly();
    },

    //> @method formItem.setCanEdit()
    // Is this form item editable (canEdit:true) or read-only (canEdit:false)?
    // Setting the form item to non-editable causes it to render as read-only,
    // using the appearance specified via +link{formItem.readOnlyDisplay}.
    // <P>
    // The default appearance for canEdit:false items
    // (<code>readOnlyDisplay:"readOnly"</code>) differs from the disabled state in that
    // the form item is not rendered with disabled styling and
    // most form items will allow copying of the contents while read-only but do not while
    // disabled.
    //
    // @param canEdit (Boolean) Can this form item be edited?
    // @group readOnly
    // @see attr:FormItem.canEdit
    // @see setDisabled()
    // @visibility external
    //<
    setCanEdit : function (canEdit) {
        // Suppress 'setCanEdit()' while we're showing that read-only style for
        // fetching missing display value
        if (this._readOnlyFetchMissingValue == true) {
            this._explicitCanEdit = canEdit;
            return;
        }
        
        var wasEditable = this.getCanEdit();
        this.canEdit = canEdit;
        canEdit = this.getCanEdit();
        var willRedraw = wasEditable != canEdit;
        this.updateCanEdit(willRedraw);
        if (willRedraw) {
            
            this.redraw();
        }
    },

    renderAsStatic : function () {
        return this.getCanEdit() == false && this.getReadOnlyDisplay() == "static";
    },
    renderAsReadOnly : function () {
        return this.getCanEdit() == false && this.getReadOnlyDisplay() == "readOnly";
    },
    renderAsDisabled : function () {
        return (this.isDisabled() ||
                (this.getCanEdit() == false && this.getReadOnlyDisplay() == "disabled"));
    },

    // updateCanEdit - helper method to update the form item to reflect its read-only state
    _origCanEdit: null,
    updateCanEdit : function (willRedraw) {
        var origCanEdit = this._origCanEdit;
        
        var canEdit = this._origCanEdit = this.getCanEdit();

        if (origCanEdit != canEdit) {
            // Disabled state takes precedence over read-only.
            if (!this.renderAsDisabled() && !willRedraw) {
                var isReadOnly = !canEdit;
                this.setElementReadOnly(isReadOnly);
                this._setIconsEnabled();
                // update the valueIcon if we have one
                this._updateValueIcon(this.getValue());
                // UpdateState is a catch-all method that updates the css classes applied to our elements
                // to reflect the 'disabled' versions
                this.updateState();
            }

            this._canEditChanged(canEdit, willRedraw);
        }
    },

    _canEditChanged : function (canEdit, willRedraw) {
        if (this.canEditChanged) this.canEditChanged(canEdit);
    },

    //> @method formItem.canEditChanged()
    // Notification method called when +link{FormItem.canEdit,canEdit} is modified. Developers
    // may make use of this to toggle between an editable and a read-only appearance
    // for custom <code>FormItem</code>s.
    // @param canEdit (boolean) New <code>canEdit</code> value
    // @return (boolean)
    //<
    //canEditChanged : null,

    //> @method formItem.setElementReadOnly()
    // Change the read-only state of the form element immediately.
    //<
    // Unless the specific form item overrides this method and can change the state directly,
    // redraw the item using the new state.
    setElementReadOnly : function (readOnly) {
        if (this.hasDataElement()) this.redraw();
    },

    // _setElementReadOnly()
    // Actually update the HTML to mark the data element as enabled / disabled
    
    _setElementReadOnly : function (readOnly) {
        if (this.hasDataElement()) {     
            var element = this.getDataElement();
            if (element) {
                if (!readOnly && !element.readOnly) {
                    // must be using disabled state
                    element.disabled = readOnly;
                } else {
                    element.readOnly = readOnly;
                    if (isc.screenReader) {
                        if (element.setAttribute) element.setAttribute("aria-readonly", "true");
                    }
                }
                element.tabIndex = this._getElementTabIndex();
            }
        } else if (this._canFocus()) {
            var element = this.getFocusElement();
            if (element) element.tabIndex = this._getElementTabIndex();
        }
    },

    // isReadOnly - helper method to determine whether a field is editable
    // the public 'getCanEdit()' method falls through to this.
    isReadOnly : function () {
        

        // Check container(s)
        var item = this;
        while (item.parentItem != null) {
            if (item.canEdit != null) {
                return !item.canEdit;
            }
            item = item.parentItem;
        }

        return !isc.DynamicForm.canEditField(item, this.form);
    },

    //> @method formItem.isEditable()
    // Can this items value be edited by the user
    // @return (boolean)    true if the user can edit this item's value.
    //<
    
    isEditable : function () {
        //>DEBUG
        this.logWarn("Encoutered a call to FormItem.isEditable(): This is an internal " + 
            " method scheduled for removal - please use getCanEdit() instead");
        //<DEBUG
        return this.getCanEdit();
    },

    //> @method formItem.getCriteriaFieldName()
    // Returns the name of the field to use in a Criteria object for this item
    //
    // @return (FieldName) the name of the field to use in a Criteria object for this item
    // @group criteriaEditing
    //<
    // The main current use for this method is when filtering a field that has a displayField,
    // using a ComboBoxItem. Depending on whether the user selected from the picklist or just 
    // typed some partial filter into the combo box, we will want to filter on either the 
    // underlying field or the display field.  Done this way to make it extensible.
    
    getCriteriaFieldName : function () {
        var fieldName = this.criteriaField || this.getDataPath() || this.getFieldName();
        if (fieldName != null && this.form.dataPath != null) {
            fieldName = this.form._trimDataPath(fieldName);
            if (fieldName.endsWith("/")) fieldName = fieldName.substring(0, fieldName.length-1);
        }
        return fieldName;
    },

    //> @method formItem.getCriteriaValue()
    // Returns the value of the field to use in a Criteria object for this item
    //
    // @return (String)    the value of the field to use in a Criteria object for this item
    // @group criteriaEditing
    //<
    getCriteriaValue : function (suppressTypeConversion) {
        var value;
        if (this.canEditOpaqueValues) {
            var simpleType = isc.SimpleType.getType(this.type);
            if (simpleType && simpleType.getAtomicValue) {
                value = simpleType.getAtomicValue(this.getValue(), "criteria");
            } else {
                value = this.getValue();
            }
        } else {
            value = this.getValue();
        }
        // Handle turning user entered string into integers, etc
        if (!suppressTypeConversion) {
            value = this.performTypeConversion(value);
        }
        return value;
    },
    
    performTypeConversion : function (value) {
        var type = this.getType();
        if (type != null) {
            if (isc.isA.String(value)) {
                if (isc.SimpleType.inheritsFrom(
                        type, "integer", this.form.getDataSource()))
                {
                    var intVal = parseInt(value);
                    if (intVal == value) value = intVal;
                } else if (isc.SimpleType.inheritsFrom(
                        type, "float", this.form.getDataSource())) 
                {
                    var floatVal = parseFloat(value);
                    if (floatVal == value) value = floatVal;
                }
            }
        }
        return value;
    },
    
    //> @attr formItem.useAdvancedCriteria (Boolean : null : IRW)
    // Should this form item always produce an +link{AdvancedCriteria} sub criterion object?
    // When set to true, causes +link{formItem.hasAdvancedCriteria, hasAdvancedCriteria} to 
    // return true.  Can also be set at the +link{listGrid.useAdvancedCriteria, ListGrid} level.
    // @group criteriaEditing
    // @visibility external
    //<
    
    useAdvancedCriteria: null,
    _shouldUseAdvancedCriteria : function () {
        // public flag, can be set on item, form or grid
        if (this.useAdvancedCriteria != null) return this.useAdvancedCriteria;
        if (this.form && this.form.useAdvancedCriteria != null) {
            return this.form.useAdvancedCriteria;
        }
        if (this.grid && this.grid.useAdvancedCriteria != null) {
            return this.grid.useAdvancedCriteria;
        }
    },
    
    //> @method formItem.hasAdvancedCriteria()
    // Does this form item produce an +link{AdvancedCriteria} sub criterion object?
    // If this method returns true, +link{dynamicForm.getValuesAsCriteria()} on the
    // form containing this item will always return an +link{AdvancedCriteria} object, calling
    // <smartclient>+link{formItem.getCriterion()}</smartclient>
    // <smartgwt><code>FormItemCriterionGetter.getCriterion()</code></smartgwt>
    // on each item to retrieve the individual criteria.
    // <P>
    // Default implementation will return <code>true</code> if +link{formItem.operator} is
    // explicitly specified.
    //
    // @return (Boolean) true if this item will return an AdvancedCriteria sub-criterion.
    //
    // @group criteriaEditing
    // @visibility external
    //<
    
    hasAdvancedCriteria : function () {
        // if useAdvancedCriteria is set, respect it
        if (this._shouldUseAdvancedCriteria()) return true;
        var value = this._value == null ? null : this._value,
            opName = this.getSpecifiedOperator(isc.isAn.Array(value))
        ;
        var op = isc.DS._operators[opName];
        if (op && op.valueType == "none") return true;

        return (value != null && (opName != null || this._shouldAllowExpressions()));
    },
    
    _shouldAllowExpressions : function () {
        // by default, text, textArea, canvas, container and date (which calls through to this
        // function from it's own override) Items allow expressions
        var allow = isc.isA.TextItem(this) || isc.isA.TextAreaItem(this) || 
                isc.isA.CanvasItem(this) || isc.isA.ContainerItem(this) ||
                isc.isA.DateItem(this)
        ;

        if (!allow) return false;

        allow = this.allowExpressions;
        if (this.form == null) {
            
            return allow;
        }
        if (allow == null) allow = this.form.allowExpressions;
        return allow;
    },
    
    // getOperator() returns the operator for this form item
    // will return this.operator if specified, otherwise the default operator for the type
    // being edited by this item.    
    getOperator : function (textMatchStyle, isMultiValued) {
        return this.operator ? this.operator : 
            this.getDefaultOperator(textMatchStyle, isMultiValued);
    },

    
    getSpecifiedOperator : function (isMultiValued) {
        return this.operator ? this.operator : 
            this.getDefaultOperator(null, isMultiValued, true);
    },
    
    supportsOperator : function (operatorId, validOps) {
        validOps = validOps || this.getValidOperators();
        return validOps.contains(operatorId);
    },

    getValidOperators : function () {
        // if the item has validOperators, return them
        if (this.validOperators) return this.validOperators;

        // if the item is in a RecordEditor and it's LGField has validOperators, return them
        if (this.lgField && this.lgField.validOperators) return this.lgField.validOperators;

        var ds = isc.DataSource.get(this.dataSource || (this.form && this.form.dataSource)),
            type = this.getType() || "text"
        ;
        if (ds) {
            // if there's a DS, return field.validOperators if it's set - if not, the simpleType's
            // validOperators, or finally the global valid ops for the Type
            var field = ds.getField(this.getCriteriaFieldName());
            return ds.getFieldOperators(field);
        } else {
            // return the validOperators from the SimpleType if there's no DS
            var validOps = isc.SimpleType.getValidOperators(type);
            if (validOps) return validOps;
        }
        
        if (isc.DataSource) {
            // no DS, get the global typeOperators from isc.DataSource
            var validOps = isc.DataSource.getTypeOperators(type);
            if (validOps) return validOps;
        }

        return null;
    },

    // if strict is set, skip any SimpleType-based or hardcoded default operators
    getDefaultOperator : function (textMatchStyle, isMultiValued, strict) {
        var defaultOp = null;
        // if true, indicates the defaultOp was not auto-detected from DS or SimpleType
        var userDefined = false;

        // if the item has a defaultOperator, use it
        if (this.defaultOperator) {
            defaultOp = this.defaultOperator;
            userDefined = true;
        }

        // if it's multiValued and there's no defaultOp, use defaultMultipleOperator, or "inSet"
        if (!defaultOp && isMultiValued) {
            if (this.defaultMultipleOperator != null) {
                // return defaultOperator if it's set and valid for the item
                defaultOp = this.defaultMultipleOperator;
                userDefined = true;
            }
            if (!defaultOp) {
                if (strict) return null;
                defaultOp = "inSet";
            }
        }

        if (!defaultOp) {
            // no defaultOperator and not multi-valued
            var ds = isc.DataSource.get(this.dataSource || (this.form && this.form.dataSource));
            if (ds) {
                // if there's a DS, use field.defaultOperator if it's set, or  
                // simpleType.getDefaultOperator() otherwise
                defaultOp = ds.getFieldDefaultOperator(this.getCriteriaFieldName(), strict);

            } else if (!strict) {
                
                if (this.valueMap || this.optionDataSource) {
                    defaultOp = "equals";
                } else {
                    // if there's no DS, use SimpleType.getDefaultOperator()
                    defaultOp = isc.SimpleType.getDefaultOperator(this.getType());
                }
            }
        }

        
        var isStrict = strict || userDefined || 
            (!userDefined && defaultOp && 
            !(this.form && this.form.allowExpressions && defaultOp == "iContains"));
        defaultOp = this._getDefaultOperator(textMatchStyle, isMultiValued,
                                             isStrict, defaultOp);

        // get the specified or inherited validOperators from the item, field or type
        var validOps = this.getValidOperators();
        if (!validOps || validOps.length == 0) {
            // no valid ops for this item - some items, like buttons and sections, don't have
            // types and don't support operators - log a warning and return the detected 
            // default anyway - this is what would always have happened in the past (before 
            // the recent addition of defaultOperator)
            this.logInfo("This item does not support filter operators."); 
            return defaultOp;
        }

        if (defaultOp) {
            // if the detected defaultOperator is valid, return it
            if (this.supportsOperator(defaultOp, validOps)) return defaultOp;
        }
        if (strict) return null;

        this.logInfo("Detected defaultOperator, '" + defaultOp + "', is unsupported in " +
            "this item.  Valid operators are: " + isc.echoAll(validOps) + "\n " +
            "Using " + validOps[0] + " instead."); 
        return validOps[0];
    },

    
    _getDefaultOperator : function (textMatchStyle, isMultiValued, strict, defaultOperator) {
        var validOps = this.getValidOperators();

        // get the defaultOperator from the data-type
        var type = this.getType();
        if (this.valueMap || this.optionDataSource || 
            isc.SimpleType.inheritsFrom(type, "enum") ||
            isc.SimpleType.inheritsFrom(type, "boolean") ||
            isc.SimpleType.inheritsFrom(type, "float") ||
            isc.SimpleType.inheritsFrom(type, "integer") ||
            isc.SimpleType.inheritsFrom(type, "date") ||
            isc.SimpleType.inheritsFrom(type, "datetime") ||
            isc.SimpleType.inheritsFrom(type, "time"))
        {
            return strict ? defaultOperator : "equals";

        } else {
            // Don't pass in a value - this is appropriate for text-based items
            // we'll override for other items if necessary.
            
            var operator = strict ? null : "iContains";
            if (this.form) {
                operator = this.form.defaultSearchOperator || (strict ? null :
                    (this.form.allowExpressions ? "iContainsPattern" : "iContains"));
                var ds = this.form.getDataSource(),
                    types = ds && ds.getFieldOperators(this.name),
                    validOp = types && types.contains(operator)
                ;
                if (!validOp && types) {
                    if (strict) return defaultOperator;
                    operator = types[0];
                }
            }

            return isc.DataSource.getCriteriaOperator(null, textMatchStyle, operator, strict) ||
                   defaultOperator;
        }
    },

    //> @method formItem.canEditCriterion() [A]
    // When a dynamic form is editing an advanced criteria
    // object via +link{DynamicForm.setValuesAsCriteria()}, this method is used to determine
    // which sub-criteria apply to which form item(s).
    // <P>
    // This method will be called on each item, and passed the sub-criterion of the
    // AdvancedCriteria object. It should return true if the item can edit the criterion,
    // otherwise false. If it returns true, setValuesAsCriteria() will call 
    // +link{formItem.setCriterion()} to actually apply the criterion to the form item, and
    // +link{dynamicForm.getValuesAsCriteria()} can subsequently retrieve the edited criterion
    // by calling +link{formItem.getCriterion()}.
    // <P>
    // Default implementation will return true if the criterion <code>fieldName</code> and
    // <code>operator</code> match the fieldName and operator (or default operator) for
    // this item.
    //
    // @param criterion (Criterion) sub-criterion from an AdvancedCriteria object
    // @return (boolean) return true if this item can edit the criterion in question.
    //
    // @group criteriaEditing
    // @visibility external
    //<
    
    canEditCriterion : function (criterion, warnOnField) {
        // this criterion can clearly be edited, if it's already *being* edited
        if (this.hasMatchingCriterion(criterion)) return true;

        // If criterion has a valuePath it is a dynamicCriteria criterion and cannot
        // be edited by a standard filter editor.
        if (criterion.valuePath != null) return;

        var thisOperator = this.getOperator(null, isc.isAn.Array(criterion.value));
        var criteriaFieldName = this.getCriteriaFieldName();
        if (criterion.fieldName != null && criterion.fieldName == criteriaFieldName
            && criterion.operator == thisOperator)
        {
            return true;
        }

        var allowExpressions = this._shouldAllowExpressions();
        if (this.multiple || allowExpressions) {
            var ds = allowExpressions ? this.form.expressionDataSource : null;
            ds = ds || this.form.dataSource;
            var fieldNames = isc.DS.getCriteriaFields(criterion, ds, true);
            if (allowExpressions) {
                // if allowExpressions is true, allow editing if there's any subCrit for this
                // item's criteriaFieldName
                return fieldNames.contains(criteriaFieldName);
            } else {
                // if the item is multiple:true, the criterion is editable if the operator is
                // "or" and all subCriteria apply to the item's criteriaFieldName
                var isAdvanced = isc.DS.isAdvancedCriteria(criterion);
                if (isAdvanced && criterion.operator == "or") {
                    return fieldNames.contains(criteriaFieldName) 
                        && fieldNames.getUniqueItems().length == 1;
                }
            }
        }

        return false;
    },
    
    //> @method formItem.canEditSimpleCriterion() [A]
    // Is this FormItem responsible for editing the simple criterion value for the specified 
    // fieldName? Default implementation will return true if the fieldName matches the specified
    // +link{criteriaField} if there is one, otherwise the +link{name} for this item.
    // @return (boolean) true if this item can edit the specified fieldName
    //<
    canEditSimpleCriterion : function (fieldName) {
        var cField = this.getCriteriaFieldName();
        return cField == fieldName;
    },
    
    // method called from setValuesAsCriteria to actually apply a simple criterion to this item.
    
    setSimpleCriterion : function (value, fieldName) {
        this.setValue(value);
    },
        
    //> @method formItem.getCriterion() (A)
    // Override this method if you need to provide a specialized criterion from this formItem
	// when creating an AdvancedCriteria via +link{dynamicForm.getValuesAsCriteria()}.
	// <P>
	// This API is provided to allow you to specify a more complex criterion than the 
	// "field-operator-value" criterions that are built-in.  Note that the built-in behavior is
	// generally quite flexible and powerful enough for most requirements.  An example of a case
    // where you might want to override this method is if you wanted to implement a date range 
    // selection (ie, date &gt; x AND date &lt; y) on a form that was combining its other criteria 
    // fields with an "or" operator.
    // <P>
    // Note that this method is part of the criteria editing subsystem: if overridden, it
    // is likely that you will want to also override +link{formItem.hasAdvancedCriteria()} to
    // ensure this method is called by the form, and to support editing of existing advanced
    // criteria you may also need to override +link{formItem.canEditCriterion()} and 
    // +link{formItem.setCriterion()}.
    // <P>
    // The default implementation will return a criterion including the form item value, fieldName
    // and specified +link{formItem.operator}, or a default operator derived from the
    // form item data type if no explicit operator is specified.
    //
    // @param [textMatchStyle] (TextMatchStyle) If passed assume the textMatchStyle
    //   will be used when performing a fetch operation with these criteria. This may impact
    //   the criterion's operator property.
    // @return (Criterion) criterion object based on this fields current edited value(s).
    // @group criteriaEditing
    // @visibility external
    //<
    allowEmptyStringInArrayCriterion:false,
    getCriterion : function (textMatchStyle, includeEmptyValues) {
        var operator = this.getOperator(textMatchStyle, isc.isAn.Array(this.getValue())),
            op = isc.DataSource._operators[operator],
            fieldName = this.getCriteriaFieldName();

        // Operator could be a validator in a FilterClause that is not found in _operators
        if (!op) return;

        // if it's not one of the "string" type operators, we'll want to perform
        // type conversion (so we get greaterThan + an actual int, etc)
        var type = this.getType(),
            ds = this.form.getDataSource();
        var useUnconvertedStringValue = (!type || !ds || 
                (!ds.getTypeOperators(type).contains(operator) &&
                 ds.getTypeOperators("text").contains(operator))) ||
            (this.form && this.form.allowExpressions);

        var value = this.getCriteriaValue(useUnconvertedStringValue);

        if (op.valueType == "criteria" && isc.isA.String(value)) {
            // if the operator is logical, like "or", parse the value
            return this.parseValueExpressions(value, fieldName, op);
        }
        
        if (op.valueType != "none" && !includeEmptyValues && (value == null || isc.is.emptyString(value))) {
            return;
        }
		// multi-selects are returned as an array.  
		if (isc.isAn.Array(value)) {
             // If nothing is selected, or if blank is selected, no criteria
            var uniqueItems = value.getUniqueItems();
            if (value.length == 0 || 
                ( !this.allowEmptyStringInArrayCriterion && uniqueItems.length == 1 &&
                  isc.isA.String(value[0]) && isc.is.emptyString(value[0]) 
                )
               )
            {
                return;
            }
        }

        var result = { fieldName: fieldName, operator: operator };
        // some ops (isNull and notNull) have valueType "none" - no value is required
        if (op.valueType != "none") result.value = value;

        if (isc.isA.String(value) && this._shouldAllowExpressions()) {
            var crit = this.parseValueExpressions(value, fieldName, operator);
            if (crit != null) {
                var tOp = isc.DS._operators[crit.operator];
                if (tOp.valueType == "valueSet" && crit.value != null && isc.isA.String(crit.value)) {
                    crit.value = tOp.processValue(crit.value);
                }

                
                if (!this.canEditCriterion(crit)) result = null;
                else result = crit;
            }
        }

        return result;
    },

    // helper to determine whether the passed criterion is different from the current one - 
    // used to allow complex crit through canEditCriterion(), and to no-op setCriterion() when 
    // it would run unnecessarily in LG filterEditors
    hasMatchingCriterion : function (criterion) {
        if (this._checkingCriteriaMatch) return;
        this._checkingCriteriaMatch = true;

        var result = false;

        // if the passed criterion is the same as the current criterion, nothing to do
        var ds = this.grid && this.grid.getDataSource();
        if (ds) {
            // compare the passed criterion to the current one 
            var thisCrit = this.getCriterion();
            result = (ds.compareCriteria(thisCrit, criterion) == 0);
        }
        delete this._checkingCriteriaMatch;
        return result;
    },

    //> @method formItem.setCriterion() [A]
    // Update this form item to reflect a criterion object from within an AdvancedCriteria.
    // Called by +link{DynamicForm.setValuesAsCriteria()} when +link{formItem.canEditCriterion()}
    // returns true for this item.
    // <P>
    // Default implementation simply calls +link{formItem.setValue} with the <code>value</code>
    // of the criterion passed in
    // @param criterion (Criterion) criterion to edit
    // @group criteriaEditing
    // @visibility external
    //<
    setCriterion : function (criterion) {
        var allowEx = this._shouldAllowExpressions(),
            value = criterion ? criterion.value : null
        ;

        var isAdvanced=isc.DS.isAdvancedCriteria(criterion);
        if (allowEx) {
            var op = isc.DS._operators[criterion.operator];
            var grid = this.form && this.form.grid;
            if (isAdvanced || op.valueType == "valueRange" ||
                    (grid && grid.shouldAllowFilterOperators && !grid.shouldAllowFilterOperators())) 
            {
                // if operatorIcons are showing, we don't want to add the expression to the 
                // value, because it's already been applied to the operatorIcon
                value = this.buildValueExpressions(criterion);
            } else {
                if (op.valueType == "valueSet") {
                    if (isc.isAn.Array(value)) {
                        value = value.join(op.valueSeparator);
                    }
                }
            }
        } else {
            if (this.multiple) {
                //var isAdvanced = isc.DS.isAdvancedCriteria(criterion);
                if (isAdvanced && criterion.operator == "or") {
                    // if the passed advancedCriteria is a flat list of ORs with the same 
                    // operator and field (this one), build an array of values from them and 
                    // pass that to setValue
                    var newValue = [],
                        critArray = criterion.criteria,
                        fieldName = this.getCriteriaFieldName(),
                        firstOp = critArray[0] ? critArray[0].operator : null,
                        failed = false
                    ;
                    for (var i=0; i<critArray.length; i++) {
                        var subCrit = critArray[i];
                        if (subCrit.criteria || subCrit.fieldName != fieldName ||
                                subCrit.operator != firstOp)
                        {
                            failed = true;
                            break;
                        }
                        newValue.add(subCrit.value);
                    }
                    if (!failed) value = newValue;
                }
            }
        }
        this.setValue(value);
    },

    _getTextBoxScrollWidth : function (textBoxHandle) {
        return textBoxHandle.scrollWidth;
    },

    _getClipValue : function () {
        return (this.renderAsStatic() ? this._getClipStaticValue() : !!this.clipValue);
    },

    //> @method formItem.valueClipped()
    // Is the value clipped?
    // <p>
    // The form item must have value clipping enabled. If a form item type supports the
    // clipValue attribute, then clipValue must be true. +link{TextItem}s and derivatives
    // (e.g. +link{SpinnerItem}) automatically clip their values.
    //
    // @return (boolean) true if the value is clipped; false otherwise.
    // @visibility external
    //<
    valueClipped : function () {
        var clipValue = this._getClipValue(),
            textBoxHandle;
        return (clipValue &&
                (textBoxHandle = this._getTextBoxElement()) != null &&
                isc.Element.getClientWidth(textBoxHandle) < this._getTextBoxScrollWidth(textBoxHandle));
    },

    // Errors
	// --------------------------------------------------------------------------------------------
	
	//>	@method	formItem.clearErrors()
	//			Clear all error messages for this item
	//		@group	errorHandling
    // @visibility external
	//<
	clearErrors : function (suppressAutoFocus) {
		var name = this.getFieldName();
		if (name) this.form.clearFieldErrors(name, true, suppressAutoFocus);
	},
	
	//>	@method	formItem.setErrors()
	// Set the error message(s) for this item
	//		@group	errorHandling
	//		@param	errors	(String | Array of String) error message(s)
    // @visibility external
	//<
	setErrors : function (errors) {
		var name = this.getFieldName();
		if (name) this.form.setFieldErrors(name, errors, true);
	},

	//>	@method	formItem.setError()
	// Set the error message for this item.  This method is deprecated and retained only 
    // for backward compatibility - use setErrors() instead
	//		@group	errorHandling
	//		@param	message	(String) error message
	//<
	setError : function (message) {
		var name = this.getFieldName();
		if (name) this.form.setError(name, message);
	},

	//>	@method	formItem.hasErrors()
    //		Return whether this item currently has any validation errors as
    //		 a result of a previous validation pass.
    //		@group	errorHandling
    //	@return	(boolean)	true == item currently has validation errors.
    // @visibility external
	//<
    hasErrors : function () {
        // recurse up parent tree to find the root form item and get the correct error status
        if (this.parentItem != null) return this.parentItem.hasErrors();
        var name = this.getFieldName();
        
        if (name && this.form) return this.form.hasFieldErrors(name);
        var dp = this.getDataPath();
        if (dp && this.form) return this.form.hasFieldErrors(dp);
        return false;
    },
    	
    //> @method formItem.validate()
    // Validate this item.
    // 
    // @return (Boolean) returns true if validation was successful (no errors encountered), false
    //                   otherwise.
    // @visibility external
    //<
    validate : function (deferServerValidation, validationOptionOverrides) {
        var hadErrorsBefore = this.hasErrors(),
            fieldErrors = [],
            allErrors = null,
            stopOnError = false,
            form = this.form
        ;
        
        // Wrap field validation in a queue so that server validators are
        // sent as a single request.
        var wasAlreadyQueuing = isc.rpc.startQueue();

        // Process all validators on field that are applicable.
        // Note that validateFieldAndDependencies may modify the record so we pass
        // a copy of our current values.
        var value = this.getValue(),
            record = form._getRecordForValidation(true),
            validationOptions = {unknownErrorMessage: form.unknownErrorMessage,
                                typeValidationsOnly:form.validateTypeOnly,
                                deferServerValidation:deferServerValidation}
        ;
        if (validationOptionOverrides != null) {
            isc.addProperties(validationOptions, validationOptionOverrides);
        }
        var fieldResult = form.validateFieldAndDependencies(this, this.validators, value,
                                                                 record, validationOptions);
        
        var storeErrorAs = this.name;
        if (storeErrorAs == null) storeErrorAs = this.getDataPath();
        if (storeErrorAs == null) {
            this.logWarn("item has no specified name or dataPath - " +
                "unable to meaningfully store validation errors.");
        }
        
        // Submit server validation requests queue
        if (!wasAlreadyQueuing) isc.rpc.sendQueue();

        if (fieldResult != null) {
            // if the validator returned a resultingValue, use that as the new value
            // whether the validator passed or failed.  This lets us transform data
            // (such as with the mask validator).
            if (fieldResult.resultingValue != null) { 
                // Update field value
                this.setValue(fieldResult.resultingValue);
            }
            if (!fieldResult.valid) {
                fieldErrors = fieldResult.errors[storeErrorAs];
                if (fieldErrors == null) fieldErrors = [];
            }
            stopOnError = fieldResult.stopOnError;

            // Even though the changed field may be valid, there may be other fields
            // that are no longer valid because of a dependency. These errors should
            // be shown on the form.
            allErrors = fieldResult.errors;
        }

        // If any errors are set or cleared, mark that a redraw is needed.
        
        var redrawRequired = false;

        // If we failed validation or validation is clearing previous errors,
        // update the errors on the field.
        if (fieldErrors.length > 0 || hadErrorsBefore) {
            // set current validation errors on the item
            if (fieldErrors.length > 0) {
                if (form.setFieldErrors(storeErrorAs, fieldErrors)) {
                    redrawRequired = true;
                }
            // otherwise clear old errors if there were any
            } else {
                form.clearFieldErrors(storeErrorAs, false);
                redrawRequired = true;
            }

            // If validation failed and we shouldn't leave field, set the blocking error flag
            // Rely on calling code to explicitly force a refocus if necessary
            this.setBlockingErrors(stopOnError);
        }

        // If other fields on the form have been validated, show/clear their error(s)
        
        if (allErrors) {
            for (var errorFieldName in allErrors) {
                if (errorFieldName != storeErrorAs) {
                    var errors = allErrors[errorFieldName];
                    if ((errors != null && !isc.isAn.emptyArray(errors)) ||
                        form.hasFieldErrors(errorFieldName))
                    {
                        if (form.setFieldErrors(errorFieldName, errors)) {
                            redrawRequired = true;
                        }
                    }
                }
            }
        }
        if (redrawRequired) {
            
            this.redraw();
        }

        return (fieldErrors.length == 0);
    },


    // Validation failure plus "stopOnError" should prevent the user taking focus from the
    // item.
    // The "shouldDisallowEditorExit" helper lets us know when we're in this state
    
    shouldDisallowEditorExit : function () {
        return (this._hasBlockingErrors || this._disallowEditorExit);
    },

    // When disallowing editorExit, we want the ability to also block certain keypresses
    // as it's common to have these dismiss the editor
    
    _editorExitKeys:[
        "Tab"
    ],

    // Used by the Tour subsystem
    setDisallowEditorExit : function (disallowEditorExit) {
        this._disallowEditorExit = disallowEditorExit;
    },

    setBlockingErrors : function (hasBlockingErrors) {
        this._hasBlockingErrors = hasBlockingErrors;
    },
    
    //> @method formItem.setRequired()
    // Setter to mark this formItem as +link{formItem.required}, or not required at runtime.
    // Note that an alternative approach to updating the <code>required</code> flag directly
    // would be to simply use a +link{ValidatorType,requiredIf} type validator.
    // <P>
    // Note that this method will not re-validate this item by default or clear any 
    // existing validation errors. If desired, this may be achieved by calling
    // +link{formItem.validate()} or +link{dynamicForm.clearErrors()}.
    // @param required (boolean) new +link{formItem.required} value.
    // @visibility external
    //<
    setRequired : function (required) {
        if (required == this.required) return;
        this.required = required;
        if (this.form == null) return;
        
        if (required) {
            // getRequiredValidator defined in dataBoundComponent
            var requiredValidator = this.form.getRequiredValidator(this);
            this.addValidator(requiredValidator);
        } else {
            this.removeValidator({type:"required"});
        }
        // redraw the item - this'll refresh the form / refreshing the item title to
        // show / hide the bold prefix / suffix...
        this.redraw();
    },
    
    
    addValidator : function (validator) {
        if (this.validators == null) this.validators = [];
        else if (!isc.isAn.Array(this.validators)) this.validators = [this.validators];
        
        if (this.validators._typeValidators) {
            this.validators = this.validators.duplicate();
        }
        this.validators.add(validator);
    },
    
    removeValidator : function (validator) {
        if (this.validators == null) return;
        if (!isc.isAn.Array(this.validators)) this.validators = [this.validators];
        if (this.validators._typeValidators) {
            this.validators = this.validators.duplicate();
        }
        
        // Handle being passed a properties block rather than a pointer to the
        // live object...
        var liveVal = this.validators.find(validator);
        this.validators.remove(liveVal);
    },

    // AutoComplete
	// -----------------------------------------------------------------------------------------

    // change fires on keyPresses that change value

    // intended key behaviors: no changes needed to accomplish these, generally
    // - accept match:
    //   - Navigate away from field: Tab/Shift-Tab
    //     - inline editing: Arrow Up/Down, Enter
    //   - Enter (w/o inline editing)
    // - remove match:
    //   - Delete/Backspace

    //> @method formItem.setAutoComplete()
    // Change the autoCompletion mode for this form field.
    //
    // @param   newSetting (AutoComplete)  new setting
    // @visibility autoComplete
    //<
    
    setAutoComplete : function (newSetting) {
        this.autoComplete = newSetting;
        this._handleAutoCompleteChange();
    },

    _handleAutoCompleteChange : function () {
        // get cascaded setting
        var setting = this._getAutoCompleteSetting();
        // toggle setting on native element
        if (isc.Browser.isIE && this.hasDataElement()) {
            var element = this.getDataElement();
            if (element) element.autoComplete = (setting == "native" ? "" : "off");
        }
    },

    // get cascaded autoComplete setting
    _getAutoCompleteSetting : function () {
        if (this.autoCompleteKeywords != null && isc.isAn.Array(this.autoCompleteKeywords)) {
            return this.autoCompleteKeywords.join(" ");
        } else if (this.autoComplete != null) return this.autoComplete;
        return this.form ? this.form.autoComplete : null;
    },

    // whether ISC auto complete is enabled
    autoCompleteEnabled : function () {
        // unsupportable at the moment
        if (isc.Browser.isSafari) return false;

        return this._getAutoCompleteSetting() == "smart";
    },

    // whether we're set to show unique matches only 
    uniqueMatchOnly : function () {
        if (this.uniqueMatch != null) return this.uniqueMatch;
        return this.form.uniqueMatch;
    },

    // get candidates for SmartClient autoCompletion
    getCandidates : function () {
        var candidates = this.autoCompleteCandidates;
        
        if (candidates == null) {
            var valueMap = this.getAllValueMappings();
            if (valueMap != null) {
                if (isc.isAn.Array(valueMap)) candidates = valueMap;
                else candidates = isc.getValues(valueMap);
            // return values from adjacent records in the dataset, if available
            } else if (this.form.grid) {
                var data = this.form.grid.data;

                // return all values that happen to be cached
                if (isc.isA.ResultSet!=null && isc.isA.ResultSet(data)) candidates = data.getValuesList(this.name);
                // return all values for the column
                else candidates = data.getProperty(this.name);
            }
        }

        // Clear out duplicates from the candidates - if we have a ListGrid with multiple
        // instances of some string in the results, we want to allow autoCompletion to that
        // string.
        // (Note this will NOT clear out strings that are identical except for case, even 
        // though they don't autoComplete differently, which is appropriate)
        if (candidates != null) candidates = candidates.getUniqueItems();
        return candidates;
    },
    
    // get the completion, if any, for this value
    getCompletion : function (base) {
        if (base == null) return;
        var candidates = this.getCandidates();
        if (candidates == null || candidates.length == 0) return;
        
        var upperBase = base.toUpperCase(),
            uniqueMatchOnly = this.uniqueMatchOnly(),
            firstMatch;        
        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i],
                upperCandidate = candidate != null ? candidate.toUpperCase() : null;
            // if the user has exactly typed one of our auto-complete options, don't show
            // any completions
                        
            if (upperCandidate == upperBase) return null;
            if (isc.startsWith(upperCandidate, upperBase)) {
                // return the first match
                if (!uniqueMatchOnly) return candidate;
     
                // only return a unique match
                if (firstMatch != null) return null;           
                firstMatch = candidate;
            }
        }
        return firstMatch;
    },

    // show an autoComplete value, if there's a valid match
    showCompletion : function (value) {

        // drop any existing completion
        this.clearCompletion();

        // check for whether autoCompletion makes sense for this type of FormItem, whether we
        // currently have an element
        if (!this.canAutoComplete || !this.hasDataElement() || 
            !this.autoCompleteEnabled()) return;

        // don't autoComplete on backspace or delete, despite change to form value
        var keyName = isc.EH.lastEvent.keyName;
        
        if (keyName == "Backspace" || keyName == "Delete") return;

        var completion = this.getCompletion(value);
        if (completion == null) {
            
            return;
        }

        // set the autocompletion value
        // NOTE: preserve upper/lowercase of typed-in value; we only convert to the
        // completion's casing when the user accepts the completion

        // Blur, and re-focus in the form item (without firing handlers).
        // This is required if the Input Method Editor (IME) is active to get out of the IME
        // mode, so that additional keypresses will overwrite the (selected) completion 
        // characters
        // (The IME is used to enter multibyte chars, such as Japanese, using a western 
        // keyboard, with multiple keystrokes returning a single character)
        
     
        this.form._blurFocusItemWithoutHandler();
        this.form._focusInItemWithoutHandler(this);


        this.setElementValue(value + completion.substring(value.length));
        this._baseValue = value;
        this._pendingCompletion = completion;

        // select the completion
        if (this._canSetSelectionRange()) {
            this.setSelectionRange(value.length, completion.length);
        }
    },

    
    _handleChangeWithCompletion : function (newValue) {
        var completion = this._pendingCompletion,
            keyName = isc.EH.lastEvent.keyName;
        
        if (this._completionAcceptKeys[keyName] == true) {
            // if the completion is accepted, switch value to the exact letter case
            // of the completion value.
            // Note that with the exception of the "Enter" key, all completionAcceptKeys are
            // navigation keys that will modify the selection / text insertion point in the
            // text box.
            // If the user hit Enter, always put focus at the end of the word so the user can
            // continue typing.
            // Otherwise, respect wherever the browser natively put the cursor.
            
            this.acceptCompletion(keyName == this._$Enter);
            return completion;
        }

        var offeredText = completion.substring(this._baseValue.length);
        

        // if the field value doesn't end with the completion, the user must have typed
        // something over the completion, or deleted some characters, etc - handle as a
        // normal change.
        if (!newValue.endsWith(offeredText)) {
            this.clearCompletion();
            return newValue;
        }

        

        // if the completion is still selected, override the value in the field, which contains
        // the completion, returning instead the text as it was when the completion was offered
        if (this.getSelectedText() == offeredText) {
            
            return this._baseValue;
        }
    
        // otherwise the completion is no longer selected, use the value in the field
        
        this.clearCompletion();
        return newValue;

        // alternate approach: 
        //var charValue = isc.EH.lastEvent.characterValue;
        //if (charValue != null) return newValue;
        //this.logWarn("no change, trimmed value to: " + newValue);
        //return this._baseValue;
    },

    clearCompletion : function () {
        delete this._pendingCompletion;
        delete this._baseValue;
    },

    // accept any pending autoCompletion
    acceptCompletion : function (cursorAtEnd) {
        var completion = this._pendingCompletion;
        if (!completion) return;

        if (this.autoCompleteEnabled()) {
            

            // Cursor insertion position:
            // The user can accept completion in several ways. Depending on what interaction
            // occurred we may need to change the cursor insertion point after setting the
            // form item element value.
            // Completion tripped by:
            // - taking focus from the field.
            //      No need to worry about cursor insertion position
            // - via various 'navigation' type keypresses (arrow left, home, etc)
            //      In this case rely on native browser behavior to 'do the right thing'
            //      Observed behavior: On right arrow focus goes to the end of the completion.
            //      On Left arrow, behavior varies by browser
            //      Remember the position before changing the element value so we can re-set 
            //      to that position.
            // - enter keypress
            //      Explicitly put focus at the end of the field so the user can continue typing
            //      We achieve this by passing in a special 'focusAtEnd' parameter if the 
            //      completion was accepted via an enter keypress.
            var selectionRange = cursorAtEnd ? [completion.length, completion.length] : null;
            if (this.getElementValue() != completion) {
                if (!cursorAtEnd && this._canSetSelectionRange()) {
                    selectionRange = this.getSelectionRange();
                }
                this.setElementValue(completion);
            }

            if (this.hasFocus && selectionRange && this._canSetSelectionRange()) {
                this.setSelectionRange(selectionRange[0], selectionRange[1]);
            }
        }
        this.clearCompletion();
    },

    // Text Selection
	// ----------------------------------------------------------------------------------------

    //> @method formItem.setSelectionRange()
    // Puts focus into this form item and selects characters between the given indices.
    // Only applies to drawn text based items.
    // @param start (int) selection starting character index
    // @param end (int) end of selection character index
    // @visibility internal
    //<
    // exposed on textItem / textAreaItem
    _$setSelectionRange: "setSelectionRange",
    _$character:"character",
    _canSetSelectionRange : function () {
        if (!isc.isA.TextItem(this) && !isc.isA.TextAreaItem(this)) return false;
        return true;
    },
    setSelectionRange : function (start, end) {
        // applies only to text items (and subclasses)
        if (!this._canSetSelectionRange()) return;
        
        // bail if undrawn
        if (!this.isDrawn()) return;

        // undoc'd, but accept an array input that's equivalent to what getSelectionRange returns
        if (isc.isAn.Array(start)) {
            start = start[0];
            end = start[1];
        }
            
        
        if (!isc.isA.Number(start)) start = 0;
        if (!isc.isA.Number(end)) end = 0;
        if (start > end) {
            var newStart = end;
            end = start;
            start = newStart;
        }

        var element = this.getDataElement();
        if (element == null) return;

        
        var EH = this.ns.EH,
            mouseDownDOMevent = EH.mouseDownEvent && EH.mouseDownEvent.DOMevent;
        if (mouseDownDOMevent != null && EH._handlingTouchEventSequence() && EH._shouldIgnoreTargetElem(element)) {
            var targetElem = (mouseDownDOMevent.target &&
                              (mouseDownDOMevent.target.nodeType == 1 ? mouseDownDOMevent.target
                                                                      : mouseDownDOMevent.target.parentElement));
            if (targetElem != null && element.contains(targetElem)) {
                return;
            }
        }

        if (this.logIsInfoEnabled("nativeFocus") && !this._hasNativeFocus()) {
            this.logInfo("setSelectionRange() about to change focus " + isc.EH._getActiveElementText() +
                          (this.logIsDebugEnabled("traceFocus") ? this.getStackTrace() : ""),
                         "nativeFocus");
        }

        var recursive = this._settingSelectionRange;
        this._settingSelectionRange = true;
        var returnVal;
        if (isc.Browser.isIE) {
            
            this._selectIETextRange(start, end);
        } else {
            // DOM API, known to be supported by Moz and Safari (as-of circa 2.0 (2006?))
            if (!this.hasFocus) {
                element.focus();
            }
            
            isc.EH._settingTextSelection = true;
            element.setSelectionRange(start, end);
            returnVal = isc.EH._settingTextSelection;
        }
        if (!recursive) delete this._settingSelectionRange;
        
        

        if (end > start) this._lastSelectRange = [start, end];
        return returnVal;
    },
    
    _selectIETextRange : function (start, end, preventDelayCall) {
        
        
        
        
        if (this._delayedSelectTimer) {
            
            isc.Timer.clear(this._delayedSelectTimer);
            delete this._delayedSelectTimer;
        }
        isc.EH._settingTextSelection = true;
        
        var element = this.getDataElement();
        if (element == null) return;
        
        var success = true,
            range = element.createTextRange()
        ;
        range.collapse(true);
        range.moveStart(this._$character, start);
        range.moveEnd(this._$character, (end-start));            
        try {
            range.select();
        } 
        catch (err) {
            success = false;
            this.logWarn("Text selection failure: '" + err.message + "'.  " + 
                (!preventDelayCall ? "Retrying selection in another thread." :
                    "Retry failed - no selection will be made.")
            );
        }
        delete isc.EH._settingTextSelection;
        if (!success && !preventDelayCall) {
            this._delayedSelectTimer = isc.Timer.setTimeout(this.getID() + 
                    "._selectIETextRange(" + start + "," + end + ",true)", 0
            );
        }
    },

    //> @method formItem.selectValue()
    // Put focus in this item and select the entire value.
    // Only applies to text based items
    // @visibility internal
    //<
    selectValue : function () {
        var val = this.getElementValue(),
            end = isc.isA.String(val) ? val.length : 0;
        this.setSelectionRange(0,end);
    },

    //> @method formItem.deselectValue()
    // If this item currently has focus, clear the current selection. leaving focus in the item.
    // Has no effect if the item is undrawn or unfocused.
    // Only applies to text-based items.
    // @param [start] (Boolean) By default the text insertion cursor will be moved to the end of the
    //   current value - pass in this parameter to move to the start instead
    // @visibility internal
    //<
    deselectValue : function (start) {
        if (!this.hasFocus) return;
        if (start) this.setSelectionRange(0,0);
        else {
            var val = this.getElementValue(),
                end = isc.isA.String(val) ? val.length : 0;
            this.setSelectionRange(end,end);
        }
    },

    // this setting will allow us to bypass the check related to the browserInputType property
    // in getSelectionRange()
    allowTextSelection:null,

    //> @method formItem.getSelectionRange()
    // For text-based items, this method returns the indices of the start/end of the current
    // selection if the item currently has the focus. In browsers other than Internet Explorer 6-9,
    // if this item does not have focus, then this method returns the indices of the start/end
    // of the selection the last time that this item had focus. In IE 6-9, returns null if the
    // item does not have focus.
    // <P>
    // In all browsers, clicking anywhere outside of the item causes the item to lose focus;
    // hence, in IE 6-9, this method will not work in other components' event handlers for
    // certain events. For example, within the +link{Canvas.click(),click()} handler of a button,
    // this item will have already lost focus, so in IE 6-9, this method will return null
    // if called within the button's click() handler. One cross-browser solution to this issue
    // is to save the selection range for later in a +link{Canvas.mouseDown(),mouseDown()} or
    // +link{Canvas.mouseOver(),mouseOver()} handler.
    // <P>
    // Notes:
    // <UL>
    //   <LI>In browsers other than IE 6-9, calling +link{formItem.setValue(),setValue()}
    // or otherwise changing the +link{getEnteredValue(),entered value} invalidates the past
    // selection range.</LI>
    //   <LI>The returned indices are indices within the entered value rather than the item's
    // value as returned by +link{FormItem.getValue(),getValue()}.
    // The distinction is particularly important for +link{TextAreaItem}s because browsers
    // normalize the line endings in the <code>&lt;textarea&gt;</code> element's value.
    // Internet Explorer 6, 7, and 8 convert line endings to "\r\n" while other browsers
    // convert line endings to "\n"
    // +externalLink{http://www.w3.org/TR/html5/forms.html#concept-textarea-api-value,as specified by the HTML5 standard}.</LI>
    // </UL>
    // @return (Array of int) 2 element array showing character index of the current or past
    // selection's start and end points within this item's +link{getEnteredValue(),entered value}.
    // In IE 6-9, returns null if the item does not have focus.
    // @visibility internal
    //<
    // Exposed on TextItem / TextAreaItem
    _$getSelectionRange: "getSelectionRange",
    _$EndToEnd:"EndToEnd", _$EndToStart:"EndToStart",
    _$StartToEnd: "StartToEnd", _$StartToStart: "StartToStart",
    _$character:"character",
    getSelectionRange : function (timeCritical) {
        // applies only to text items (and subclasses)
        if (!this._canSetSelectionRange()) return;
        
        if (isc.isA.UploadItem(this)) return;

        
        if (!this.allowTextSelection) {
            var isBrowserInputTypeDateTime = this.browserInputType == "time" ||
                                            this.browserInputType == "date" || 
                                            this.browserInputType == "datetime-local";
            if ((isc.Browser.isChrome && 
                (this.browserInputType == "digits" || this.browserInputType == "number" ||
                this.browserInputType == "email" || isBrowserInputTypeDateTime)) ||
                (isc.Browser.isEdge && isBrowserInputTypeDateTime))
            {
                return;
            }
        }
            
        var element = this.getDataElement();
        if (element == null) return;
        if (isc.Browser.isIE && isc.Browser.version < 10) {
            if (!this._hasNativeFocus()) return null;

            var selectedRange = this._getIESelectionRange();
            if (selectedRange == null) return null;

            if (isc.isA.TextAreaItem(this)) {
                if (!this.supportsSelectionRange) return null;

                
                var testRange = selectedRange.duplicate();
                testRange.moveToElementText(element);
                var length = testRange.text.length;
                testRange.setEndPoint(this._$StartToStart, selectedRange);
                var i = length - testRange.text.length;
                return [i, i + selectedRange.text.length];
            } else {
                var rangeArray = [],
                    testRange = element.createTextRange();
                if (testRange == null) return null;
                // does the selection end at the end of the input?
                if (testRange.compareEndPoints(this._$EndToEnd, selectedRange) == 0) {

                    rangeArray[1] = testRange.text.length;
                } else {
                    testRange.setEndPoint(this._$EndToEnd, selectedRange);
                    rangeArray[1] = testRange.text.length;
                }

                testRange.setEndPoint(this._$EndToStart, selectedRange);
                rangeArray[0] = testRange.text.length;
                return rangeArray;
            }
        
        } else if (isc.Browser.isMoz || isc.Browser.isSafari || isc.Browser.isOpera || isc.Browser.isIE) {
            return [element.selectionStart, element.selectionEnd];
        }
        
    },
    

    //> @method formItem.getCursorPosition()
    // For text-based items, this method returns the index of the start of the current
    // selection if the item currently has the focus (if no text is selected, this equates to
    // the current position of the text editing cursor). See +link{TextItem.getSelectionRange()}
    // for details of what is returned if the item does not have the focus (note, it is 
    // important to read this documentation, because the behavior when the item does not have
    // the focus varies by browser)
    // @return (Integer) Index of the current or past selection's start point
    // @visibility external
    //<
    getCursorPosition : function() {
        var range = this.getSelectionRange();
        return range ? range[0] : null;
    },
    
    clearSelectionRange : function (updateDataElement) {
        // clear the range used by get/setSelectionRange()
        delete this._lastSelectRange;
        if (updateDataElement) {
            var element = this.getDataElement();
            if (element) {
                // remove the range stored on the element
                element.selectionStart = element.selectionEnd;
            }
        }
    },
   
    // return true if this item has focus as reported by the browser natively
    
    _hasNativeFocus : function () {
        var focusElement = this.getFocusElement(),
            activeElement = this.getActiveElement()
        ;
        return (focusElement == activeElement);
    },

    // return the selected text within the form item
    getSelectedText : function () {
        // Only support getting selected text of a textual edit field
        if (!isc.isA.TextItem(this) && !isc.isA.TextAreaItem(this)) {
            return;
        }
        
        if (isc.Browser.isIE) {
            
            var range = this._getIESelectionRange();
            if (range) return range.text;
        } else if (isc.Browser.isMoz || isc.Browser.isSafari) {
            
            var element = this.getElement();
            if (element != null) {
                return element.value.substring(element.selectionStart, element.selectionEnd);
            }
        }
    },

    
    _IESelectionStuck : function () {
        if (!isc.Browser.isIE) return false;
        if (isc.Browser.version > 9) return false;
        
        try {
            var typeDetail = document.selection ? document.selection.typeDetail : null;
        } catch (e) {
            this.logDebug("Internet explorer native 'stuck focus' state detected");
            return true;
        }
        return false;
    },

    // Helper method for determining form item selection in IE
    _getIESelectionRange : function () {
        if (!isc.Browser.isIE) return;
        
        if (isc.isA.TextAreaItem(this) && !this.supportsSelectionRange) return null;


        
        var selection = this.getDocument().selection,
            range = (selection != null ? selection.createRange() : null);

        if (range != null && range.parentElement().id == this.getDataElementId()) return range;
        return null;
    },

    // helper methods to remember the current text selection / text insertion point within
    // some form item.
    
    rememberSelection : function (timeCritical) {
        // No op if we're not drawn or getSelectionRange() is unsupported
        if (!this.isDrawn() || !this._canSetSelectionRange()) return;

        // applies only to text items (and subclasses (but not UploadItems))
        if ((!isc.isA.TextItem(this) && !isc.isA.TextAreaItem(this)) 
                    || isc.isAn.UploadItem(this)) 
        {
            return;
        }

        // If the field is empty we can skip remembering the insertion point!
        var elementValue = this.getElementValue();
        if (elementValue == isc.emptyString) return;

        this._valueAtLastSelection = elementValue;
        
        var range = this.getSelectionRange(timeCritical);        
        if (range) {      
            this._lastSelectionStart = range[0];
            this._lastSelectionEnd = range[1];
        }
    },

    // Reset the selection to whatever was selected when 'rememberSelection' last ran
    resetToLastSelection : function (dataTransform) {
        // If we aren't drawn, or don't have a remembered selection we can't reset it!
        if (!this.isDrawn() || this._lastSelectionStart == null) return;
        var shouldReset,
            elementValue = this.getElementValue(),
            // valueAtLastSelection will always be a string.
            oldValue = this._valueAtLastSelection;
        
        if (oldValue == null || elementValue == null) {
            shouldReset = false;
        } else if (!dataTransform) {
            shouldReset = (elementValue == oldValue);
        } else {
            shouldReset = true;
            // if everything was selected pre-change, select everything again, regardless
            // of how the value changed.
            if (this._lastSelectionStart == 0 && this._lastSelectionEnd == oldValue.length) {
                // Shift the end to ensure we select the entire new value
                this._lastSelectionEnd = elementValue.length;

            // Otherwise, if we're just shifting case retain the remembered selection.
            
            } else {
                if (elementValue.toLowerCase() != oldValue.toLowerCase()) {
                    this._lastSelectionStart = this._lastSelectionEnd = elementValue.length;
                }
            }
        }

        if (shouldReset && this._canSetSelectionRange()) {
            this.setSelectionRange(this._lastSelectionStart, this._lastSelectionEnd);
        }
        delete this._lastSelectionStart;
        delete this._lastSelectionEnd;
        delete this._valueAtLastSelection;
    },


    // Event handling
	// ----------------------------------------------------------------------------------------
    
      
    //> @method formItem.handleChange()
    //      Internal method called whenever this item value is modified by user interaction
    //      (Called from 'updateValue()').<br>
    //      Calls call validators on this item if this.validateOnChange is true<br>
    //      Calls any 'change' handler specified for this item.<br>
    //      If validation fails or the change handler returns false, this method will reset the
    //      element to display the current item value, or validator suggested value (rejecting the 
    //      change).
    //  @return (boolean)   false if the change was rejected
    //  @see updateValue()
    //  @see change()
    //  @see validateOnChange
    //  @visibility internal
    //<
    
    handleChange : function (value, oldValue) {
        var oldErrors = this.form.getFieldErrors(this.name);
        
        if (this._changingValue && this.compareValues(value, this._changeValue)) return true;
        
        
        // Set the flag to indicate that we're performing a change
        this._changingValue = true;
        // By default we will not modify the value passed in.
        this._changeValue = value;
        
        // If the value changes due to a validator, etc. we have to know about it so we can
        // call this.setValue()
        var originalValue = value;
        // Handle the kinds of data that get passed around by reference
        if (isc.isA.Date(originalValue)) originalValue = originalValue.duplicate();
        else if (isc.isAn.Array(originalValue)) originalValue = originalValue.duplicate();
        else if (isc.isAn.Object(originalValue)) originalValue = isc.addProperties({}, originalValue);
    
        // If there's a transformInput method specified, allow it to update the value before
        // we proceed with validation, etc.
        if (this.transformInput) {
            value = this.transformInput(this.form, this, value, oldValue);
        }
    
        var hadErrorsBefore = this.hasErrors(),
            cancelSave = false,
            fieldErrors = [],
            allErrors = null,
            suggestedValue,
            fieldResult
        ;

        // Set the "setValueCalled" flag to false - we want to detect whether
        // a user calls 'setValue' directly from a change handler (in which case we
        // won't reset to something else)
        this._setValueCalled = false; // setValue(), if called, sets this to true
        
        
        // Refuse the new value if it exceeds the specified length for the field if 
        // appropriate
        var trimmedValue = this._enforceLengthOnEdit(value, oldValue);
        if (trimmedValue != value) {
            value = trimmedValue;
            cancelSave = (value == oldValue);
        }
        
        // If we simply reject the change because it exceeds the specified length,
        // no need to run through validation / change notifications.
        // Otherwise do carry on and validate the new (truncated) string.
        if (!cancelSave) {
        
            // Process all validators on field that are applicable for validateOnChange
            // along with any dependent fields. Note that validateFieldAndDependencies may
            // modify the record so we pass a copy of our current values.

            // Wrap field validation in a queue so that server validators are
            // sent as a single request.
            var wasAlreadyQueuing = isc.rpc.startQueue();

            // NOTE: Do not call this.form.getValues(). If this field has both a edit parser
            // and formatter to handle a value that is an object, the returned object from
            // the parser is likely to be a new object each time even if the entered value
            // did not change. In that case, _updateValue() does not see the redundant update
            // and stop an infinite recursion via: DF.getValues() -> DF.updateFocusItemValue
            // -> FI.updateValue -> FI._updateValue -> FI.mapDisplayToValue -> FI.handleChange.
            var record = this.form._getRecordForValidation(),
                validationOptions = {unknownErrorMessage: this.form.unknownErrorMessage, 
                                     changing: true}
            ;
            fieldResult = this.form.validateFieldAndDependencies (this, this.validators, value,
                                                                  record, validationOptions);

            // Submit server validation requests queue
            if (!wasAlreadyQueuing) isc.rpc.sendQueue();
        
            var validationFailed = false;

            if (fieldResult != null) {
                validationFailed = !fieldResult.valid;
                // if the validator returned a resultingValue, use that as the new value
                // whether the validator passed or failed.  This lets us transform data
                // (such as with the mask validator).
                if (fieldResult.resultingValue != null) { 
                    // remember that value in the values list
                    suggestedValue = fieldResult.resultingValue;
                }
                if (!fieldResult.valid) {
                    fieldErrors = fieldResult.errors[this.name];
                    if (fieldErrors == null) fieldErrors = [];
                }

                // Even though the changed field may be valid, there may be other fields
                // that are no longer valid because of a dependency. These errors should
                // be shown on the form.
                allErrors = fieldResult.errors;
            }

            
            var undef;
            if (validationFailed && suggestedValue === undef && this._rejectInvalidValueOnChange()) 
            {
                cancelSave = true;
                suggestedValue = oldValue;
                
                if (oldValue == null) suggestedValue = null;
            }
                
            // hang onto any suggested value as our working value (so it gets passed to any
            // change handler we have)
            if (suggestedValue !== undef) value = suggestedValue;

            // If we failed validation, update the errors object on the form
            
            
            var errorsDiffer;
            if (validationFailed) {
        
                if (!isc.isAn.Array(oldErrors)) {
                    oldErrors =  oldErrors == null ? [] : [oldErrors];
                }
                var fieldErrorsArr = fieldErrors;
                if (!isc.isAn.Array(fieldErrorsArr)) {
                    fieldErrorsArr = [fieldErrorsArr];
                }
                var errorsDiffer = fieldErrorsArr.length != oldErrors.length;
                if (!errorsDiffer) {
                    for (var i = 0; i < oldErrors.length; i++) {
                        if (!fieldErrorsArr.contains(oldErrors[i])) {
                            errorsDiffer = true;
                            break;
                        }
                    }
                }
                if (errorsDiffer) {
                this.clearErrors(true);
                this.setError(fieldErrors);			
                }
            // otherwise clear old errors if there were any
            } else if (fieldResult != null && hadErrorsBefore) {
                errorsDiffer = true;
                this.clearErrors(true);
            }
        
            // Fire the change handler if 
            // - we passed validation 
            // - or we're supposed to fire the change handler whether an error was found or not
            if ((!validationFailed || this.changeOnError)) {

                // if either change handler returns false, we'll reset to the old value     
                if (this.change != null) {
                    if (this.change(this.form, this, value, oldValue) == false) {
                        value = oldValue;
                        cancelSave = true;             
                    }
                }          
                // the change handler can do anything including setItems on the form.
                // therefore check whether we got destroyed before continuing with this thread
                if (this.destroyed) return;

                if (!cancelSave && this.form && this.form.itemChange != null) {
                    if (this.form.itemChange(this, value, oldValue) == false) {
                        value = oldValue;
                        cancelSave = true;
                    }
                }
            }
        }

        
        var userCalledSetValue = this._setValueCalled;
        // if an error was found, or another value was suggested, set the value now
        
        var valueChanged = !this.compareValues(value, originalValue);
        if ((cancelSave || valueChanged) && !userCalledSetValue)
        {
            // If we cancelSave, avoid having setValue attempt to reset the cursor
            // - we revert to the pre change selection below.
            this.setValue(value, null, true, cancelSave);
            // Reset the selection to whatever it was BEFORE the change occurred if change /
            // validators reset to the old value
            // Note that "cancelSave" specifically indicates we're rejecting the
            // change (and resetting to the original value).
            if (cancelSave && this.maintainSelectionOnTransform) {
                this._revertToPreChangeSelection();
            }
        }
        
        if (this._setValueCalled) this._changeValue = this._value;

        // if this item wants to redraw the form when it's changed, 
        // or an error was found in validator, redraw the form
        // or the item had errors before but they are now cleared, redraw the form
        if (this.redrawOnChange || errorsDiffer) {
            this.redraw();
        }

        // If other fields on the form have been validated, show/clear their error(s)
        
        if (allErrors) {
            for (var errorFieldName in allErrors) {
                if (errorFieldName != this.name) {
                    this.form.setFieldErrors(errorFieldName, allErrors[errorFieldName], true);
                }
            }
        }
        
        // Avoid showing completion if focus is being taken from this item
        if (!cancelSave && this.hasFocus) this.showCompletion(value);
        // Clear out this._changingValue - we're done with our change handler
        // Leave this._changeValue in place, this is used by the calling method to determine
        // the result of the change handler.
        delete this._changingValue;
        
        
        return (!cancelSave);
    },
    
    // Documented in Text / TextAreaItems
    enforceLength:false,
    
    _enforceLengthOnEdit : function (value, oldValue) {
        if (this.enforceLength && this.length != null && value != null) {
            var isNumber = isc.isA.Number(value);
            // number-based items will have already converted the entered value - stringify it again 
            if (isNumber) {
                if (this._getFormattedNumberString) {
                    value = this._getFormattedNumberString(value);
                } else {
                    value = "" + value;
                }
            }
            if (isc.isA.String(value) && value.length > this.length) {
                // We don't want to just trim the new value as the user may put the cursor at
                // the front of a "full" text item, and press a key, and in this case we want
                // to reject the change and reset to the old string (not show a changed string
                // with the new character at the front).
                // However if the existing value was shorter than the specified length we don't
                // want to reject the change entirely - for example a user might paste
                // 11 characters into an empty field with a 10-char limit and it's better to
                // show the truncated string than to refuse the change entirely.
                // Therefore reset to the old value iff it exactly matches the specified length
                // otherwise trim the new string.
                
                if (isNumber) {
                    if (isc.isA.Number(oldValue)) {
                        oldValue = this._getFormattedNumberString(oldValue, true);
                    }
                }
                var resetToOldValue = oldValue != null && isc.isA.String(oldValue) && 
                                        oldValue.length == this.length;
                if (resetToOldValue) {
                    value = oldValue;
                } else {
                    value = value.substring(0, this.length);
                }
            }
            if (isNumber) value = this.mapDisplayToValue(value, true); 
        }
        return value;
    },
    
    // if this.validateOnChange is true, and validation fails with no suggested value, should
    // we revert to the previous value, or allow the bad value to be displayed along with the
    // validation error?
    _rejectInvalidValueOnChange : function () {
        return (this.rejectInvalidValueOnChange != null) ? this.rejectInvalidValueOnChange 
                                                           : this.form.rejectInvalidValueOnChange;
    },
    
    // compareValues - undocumented (non obfuscated) helper method: do 2 possible values for
    // this item match
    
    compareValues : function (value1, value2) {
        

        // shortcut: If value1 === value2 we always have a match
        
        if (value1 === value2) return true;

        // comparison implemented on the DynamicForm class directly
        var compareValues = isc.Canvas.compareValues;
        if (this.multiple) {

            if (!(value1 == null || isc.isAn.Array(value1))) {
                if (!this._propagateMultiple && !this.suppressMultipleComparisonWarning) 
                { 
                    this.logWarn(
                     "compareValues - this is a multiple FormItem but compareValues was " + 
                     "called with a non-null first argument `value1` that is not an array.");
                }
                value1 = [value1];
            }
            if (!(value2 == null || isc.isAn.Array(value2))) {
                if (!this._propagateMultiple && !this.suppressMultipleComparisonWarning) {
                    this.logWarn(
                        "compareValues - this is a multiple FormItem but compareValues was " +
                        "called with a non-null second argument `value2` that is not an array.");
                }
                value2 = [value2];
            }

            if (value1 == null && value2 == null) {
                return true;
            } else if (value1 == null || value2 == null) {
                return false;
            }

            if (value1.length != value2.length) {
                return false;
            }
            var i = 0, len = value1.length;
            while (i < len && compareValues(value1[i], value2[i], this)) {
                ++i;
            }
            return (i == len);
        }
        return compareValues(value1, value2, this);
    },
    
    
	// Handle a change event from an element.  Called directly by handlers on the native HTML
    // element
	elementChanged : function () {
        // we sometimes call this method synthetically
        var inThread = (isc.EH._thread != null);
        if (!inThread) isc.EH._setThread("ICHG");

        this.logDebug("native change");
        // updateValue() will handle firing any validators, validate-on-change change handlers,
        // and will save the value.
        if (isc.Log.supportsOnError) {
            this.updateValue(true);
        } else {        
            try {
                this.updateValue(true);
            } catch (e) {
                isc.Log._reportJSError(e);

                if (isc.Log.rethrowErrors) {
                    
                    throw e;;
                }
            }
        }
    
        if (!inThread) isc.EH._clearThread();

		// return true so the event terminates normally (and the user can leave the field)
        
		return true;
	},
    
    // Inactive Editor events
    // We sometimes write out "inactive" editor HTML for items - these match the live item
    // elements appearance-wise but are non editable and have limited interactivity
    // [used for printing / ListGrid.alwaysShowEditors]
    // All interactivity on these items will go through handleInactiveEditorEvent - 
    // Given an event type such as 'click' check for the presence of a handler
    // named "inactiveEditor" + event type - EG "inactiveEditorClick" - if present fire it
    // passing in the inactiveContext set up when the HTML was generated and the standard
    // itemInfo which will include where over the inactive content the event occurred
    // [giving us potential support for inactive clicks on icons, etc]
    
    // Lazily created map of standard event names to 'inactiveEditor' event names
    _inactiveEditorEvents:{
    },
    _handleInactiveEditorEvent : function (eventType, inactiveContext, itemInfo) {
        
        if (this.logIsDebugEnabled("inactiveEditorHTML")) {
            this.logDebug("handling inactive editor event:" + eventType + ", inactive context:" +   
                   this.echo(inactiveContext), "inactiveEditorHTML");
        }
        var eventName = this._inactiveEditorEvents[eventType];
        if (eventName == null) {
            eventName = this._inactiveEditorEvents[eventType] =
                "inactiveEditor" + eventType.substring(0,1).toUpperCase() + eventType.substring(1);
        }
        
        if (this[eventName] != null) {
            return this[eventName](inactiveContext, itemInfo);
        }
    },
    
    // Most of our handlers are stringMethods which take 2 params, form and item.
    // To avoid code duplication have a 'fireStandardHandler' method to handle this pattern.
    _fireStandardHandler : function (handlerName) {
        this.convertToMethod(handlerName);
        return this[handlerName](this.form, this, isc.EH.lastEvent);
    },
    
    
	//>	@method	formItem.handleTitleClick()
	// Handle a click event from this items title cell.
	//		@group	event handling
	//<
    handleTitleClick : function () {
        if (this.isDisabled()) return;
        //>EditMode
        if (this.editingOn) {
			this.editProxy.click();
            // Also fire normal click event in EditMode, so we know to hilite the item
            this.handleClick();
            return false;
        }
        //<EditMode
        return this._fireStandardHandler("titleClick");
    },
    
    //>	@method	formItem.handleTitleDoubleClick()
	// Handle a double click event from this items title cell.
	//		@group	event handling
	//<
    handleTitleDoubleClick : function () {
        if (this.isDisabled()) return;
        return this._fireStandardHandler("titleDoubleClick");
    },

	//>	@method	formItem.handleClick()
	// Handle a click event over this form item
	//		@group	event handling
	//<
	handleClick : function () {
        //>EditMode
        if (this.editingOn) {
            isc.EditContext.selectCanvasOrFormItem(this, true);
            return false;
        }
        //<EditMode
        if (this.isDisabled()) return;
        var returnVal = this._fireStandardHandler("click");
        // If selectOnClick is true, we will have set a 'selectValueOnMouseUp' flag
        // during mouseDown. Perform selection in response to the click event in this case.
        if (this._selectValueOnMouseUp) {
            delete this._selectValueOnMouseUp;
            if (returnVal != false) {
                this.selectValue();
            }
        }
        return returnVal;
	},

    //> @method formItem.handleDoubleClick()
	// Handle a double click event over this form item
	// @group event handling
	//<
	handleDoubleClick : function () {
        if (this.isDisabled()) return;    
        return this._fireStandardHandler("doubleClick");
	},
    
    //> @method formItem.handleShowContextMenu()
	// Handle a request to show the context menu for this FormItem.
	// @group event handling
	//<
    handleShowContextMenu : function () {
        //if (this.isDisabled()) return;    
        return this._fireStandardHandler("showContextMenu");
    },
    
	//>	@method	formItem.handleCellClick()
	// Handle a click event from an enclosing cell
	//		@group	event handling
	//<
	handleCellClick : function () {
        if (this.isDisabled()) return;    
        return this._fireStandardHandler("cellClick");
	},
    
    //>	@method	formItem.handleCellDoubleClick()
	// Handle a double click event from an enclosing cell
	//		@group	event handling
	//<
	handleCellDoubleClick : function () {
        if (this.isDisabled()) return;    
        return this._fireStandardHandler("cellDoubleClick");
	},
    
    
    _handleElementChanged : function () {
        return this.form.elementChanged(this.getID());
    },

    
    // Handlers for mouseOver/Move/Out events (sent from the Form)
    // Fires developer specified mouseOver/move/out and titleOver/move/out handlers if present.
    // handleMouseMove also handles showing icon prompts in the Hover canvas.
    
    handleMouseMove : function () {
        var itemInfo = isc.EH.lastEvent.itemInfo;
        
        // This conditional is all dealing with valueIcon styling
        if (!this.isDisabled() && (this.showValueIconOver || this.showValueIconDown)) {
            var overItem = (itemInfo.overElement || itemInfo.overTextBox || 
                            itemInfo.overControlTable),
                iconState = this._iconState;
            if (overItem) {
                // If appropriate show the 'over' version of the valueIcon
                // _mouseIsDown is a flag set when the user does a mouseDown over the item and 
                // cleared on mouseUp. If this flag is set, the user did a mouseDown on the 
                // item, moved the mouse off, and back on without releasing the mouse, so we 
                // want to show down rather than over state
                if (this._mouseIsDown && this.showValueIconDown) {
                    if (iconState != this._$Down) {
                        this._iconState = this._$Down;
                        this._updateValueIcon(this.getValue());
                    }
                } else {
                    if (this.showValueIconOver && iconState != this._$Over) {
                        this._iconState = this._$Over;
                        this._updateValueIcon(this.getValue());
                    }
                }
            } else {
                
                var expectedState = (this.showValueIconFocused && this.showValueIconOver 
                                     && this.hasFocus) ? this._$Over : null;
                if (iconState != expectedState) {
                    this._iconState = expectedState;
                    this._updateValueIcon(this.getValue());
                }
            }
        }
        
        var wasOverTextBox = this._isOverTextBox,
            showRollOver = this._isOverControlTable;
            
        this._isOverTextBox = itemInfo && (itemInfo.overElement || itemInfo.overTextBox);
        // inline icons are written into the text box.
        if (!this._isOverTextBox && itemInfo && itemInfo.overIcon) {
            var icon = this.getIcon(itemInfo.overIcon);
            if (icon && icon.inline && this._supportsInlineIcons()) {
                this._isOverTextBox = true;
            }
        }

        // This item may not write out a control table, so itemInfo.overControlTable could
        // be false while we're over the text-box.
        // However, for showOver this distinction doesn't matter - if we're over either
        // the text box or the control table we're in "over" state.
        this._isOverControlTable = this._isOverTextBox || 
                                    (itemInfo && itemInfo.overControlTable) ||
                                    (itemInfo.overIcon && 
                                        this.getIcon(itemInfo.overIcon) == this.getPickerIcon());
        if (this.showOver && (showRollOver != this._isOverControlTable)) {
            this.updateStateForRollover();
        }
        
        if (this._fireStandardHandler("mouseMove") == false) return false;
        if (this._isOverTextBox) {
            if (!wasOverTextBox) {
                if (this.handleTextBoxOver() == false) return false;
            }
            if (this.handleTextBoxMove() == false) return false;
        } else if (wasOverTextBox) {
            this.handleTextBoxOut(itemInfo);
        }
        
    },    
    
    handleMouseOver : function () {
        this.updateStateForRollover();

        // set up the hover to show a prompt for this cell if appropriate      
        isc.Hover.setAction(this, this._handleHover, null, this._getHoverDelay());

        return this._fireStandardHandler("mouseOver");
    },
    handleMouseOut : function () {

        // Clear any valueIcon 'over' state when the user moves off the item
        
        
        var expectedState = (this.showValueIconFocused && this.showValueIconOver 
                              && this.hasFocus) ? this._$Over : null;
        if (this._iconState != expectedState) {
            this._iconState = expectedState;
            this._updateValueIcon(this.getValue());   
        }

        // Clear the hover set up for this item
        
        this.stopHover();    
        var rv = this._fireStandardHandler("mouseOut");
        var wasOverTextBox = this._isOverTextBox,
            wasOverControlTable = this._isOverControlTable;
        this._isOverTextBox = this._isOverControlTable = false;
        
        this.updateStateForRollover();

        if (wasOverTextBox) {
            var textBoxOutRV = this.handleTextBoxOut();
            rv = textBoxOutRV == null ? rv : (rv && textBoxOutRV);
        }
        return rv;
    },
    
    handleMouseDown : function () {
        this._mouseIsDown = true;
        isc.Page.setEvent(isc.EH.MOUSE_UP, this, isc.Page.FIRE_ONCE, "_clearMouseDown");

        var itemInfo = isc.EH.lastEvent.itemInfo,
            inactiveContext = itemInfo.inactiveContext;
        if (inactiveContext != null) {
            return this.form.bubbleInactiveEditorEvent(this, "mouseDown", itemInfo);
        }
               
        if (!this.isDisabled() && this.showValueIconDown) {
            var overItem = (itemInfo.overElement || itemInfo.overTextBox || itemInfo.overControlTable);
            if (overItem) {
                this._iconState = this._$Down;
                
                this._updateValueIcon(this.getValue());
            }
        }
        var returnValue;
        if (this.mouseDown) returnValue = this._fireStandardHandler("mouseDown");
        
        var value = this._value,
            displayValue = this.getDisplayValue()
        ;
        if (itemInfo && itemInfo.overElement &&
            !this.hasFocus && 
            returnValue != false &&
            this._shouldSelectOnClick() && this._canSetSelectionRange() &&
            // if the stored "value" is empty but the there's a displayValue, whether the 
            // emptyDisplayValue or a user-entered value, it still needs selecting on click
            ((value != null && value !== isc.emptyString) || 
                (displayValue != null && displayValue !== isc.emptyString)
            ))
        {
            this.setSelectionRange(0,0);
            this._selectValueOnMouseUp = true;
        }
        return returnValue;
    },
    
    // Called by DF on mouse-wheel event.
    // If the mouseWheel 'has meaning' to the item, stop bubbling so
    // the form, or ancestors thereof will not scroll.
    _stopBubblingMouseWheelEvent : function (event, eventInfo) {
        return false;
    },
    
    //> @method FormItem.stopHover()    [A]
    // This method is fired when the user rolls off this item (or the title for this item) and
    // will clear any hover canvas shown by the item.
    // @group Hovers
    // @visibility external
    //<
    stopHover : function () {
        isc.Hover.clearForTargetMouseOut();  
    },

    //> @attr formItem.hoverFocusKey (KeyName : null : IRW)
    // This attribute gives users a way to pin this item's hover in place so they can interact 
    // with it (scroll it, click embedded links, etc).
    // <P>
    // Overrides the +link{canvas.hoverFocusKey, same attribute} on the parent form.
    // @see formItem.hoverPersist
    // @group hovers
    // @visibility external
    //<
    setHoverFocusKey : function (hoverFocusKey) {
        this.hoverFocusKey = hoverFocusKey;
    },

    //> @attr formItem.hoverPersist (HoverPersistMode : null : IRW)
    // Allows interaction with hovers when the cursor is positioned over them.
    // <P>
    // Overrides the +link{canvas.hoverPersist, same attribute} on the parent form.
    // @see formItem.hoverFocusKey
    // @group hovers
    // @visibility external
    //<
    setHoverPersist : function (hoverPersist) {
        this.hoverPersist = hoverPersist;
    },

    // _clearMouseDown fired on mouseUp to clear valueIcon mouseDown state.
    // (Fires whether the mouse is over this icon or not - this is how we track the case of
    // the user doing a mouseDown over us, moving off, then back on without releasing the mouse)
    _clearMouseDown : function () {
        this._mouseIsDown = null;
        // If the mouse is over us, we will be in state "Down" - in this case reset to Over
        if (this._iconState == this._$Down) {
            this._iconState = this.showValueIconOver ? this._$Over : null;
            this._updateValueIcon(this.getValue());
        }
    },
    
    handleMouseStillDown : function (event) {
        if (this.mouseStillDown) {
            return this._fireStandardHandler("mouseStillDown");
        }
    },
    
    // Helper method - how long should we delay before showing hovers?
    _getHoverDelay : function () {
        return this.hoverDelay != null ? this.hoverDelay : this.form.itemHoverDelay;
    },
    
    handleTitleMove : function () {
        return this._fireStandardHandler("titleMove");
    },
    
    handleTitleOver : function () {
        // set up the hover to show a prompt for this cell if appropriate
        isc.Hover.setAction(this, this._handleTitleHover, null, this._getHoverDelay());
    
        return this._fireStandardHandler("titleOver");
    },
    handleTitleOut : function () {
        // clear the hover event set up on this item title
        this.stopHover();
        return this._fireStandardHandler("titleOut");
    },

    handleTextBoxMove : function () {
        return this._fireStandardHandler("textBoxMove");
    },

    handleTextBoxOver : function () {
        isc.Hover.setAction(this, this._handleTextBoxHover, null, this._getHoverDelay());
        return this._fireStandardHandler("textBoxOver");
        
    },
    handleTextBoxOut : function (itemInfo) {
        if (itemInfo && itemInfo.overIcon) { 
            // if moving from textBox to icon, handleIconHover() rather than hiding the hover
            // - this shows either the icon's or the formItem's prompt in the hover
            this._handleIconHover();
        } else {
            // if not over an icon, hide the hover
            this.stopHover();
        }
        return this._fireStandardHandler("textBoxOut");
    },

    // Icon events:
    
    // On icon focus and blur, update the icon appearance (showing the over style), if showOver 
    // is true, and show the icon prompt in the window's status bar (rather than the href of 
    // the link).
    // Fire _nativeElementFocus() on the form item to handle default focus behavior
    // Note that Safari doesn't fully support focus/blur on icons - see comments in 
    // getIconHTML() for further details
    _iconFocus : function (id, element) {        
        var icon = this.getIcon(id);
        if (icon != null) {
            
            var prompt = (icon.prompt != null ? icon.prompt : this.iconPrompt)    
            window.status=prompt;

            if (this._iconShouldShowFocused(icon)) {
                this._setIconState(icon, false, true);
            }
            else if (this._iconShouldShowOver(icon)) this._setIconState(icon, true);
        }
        return this._nativeElementFocus(element,this);
    },

    _iconBlur : function (id, element) {
        var icon = this.getIcon(id);
        if (icon != null) {

            window.status="";

            // If we're showing the icon's focused state, clear it if showFocusedWithItem is false
            // If showFocusedWithItem is true, clear if this.showIconsOnFocus is false since
            // if focus goes to another element within the item, the focus styling will be
            // reapplied, and if showIconsOnFocuse is true and focus goes outside the item the
            // icon will be hidden in any case.
            var showFocused = this._iconShouldShowFocused(icon),
                showFocusedWithItem = icon.showFocusedWithItem != false,
                showOnFocus = icon.showOnFocus || 
                              icon.showOnFocus == null && this.showIconsOnFocus;
            if (showFocused && (!showOnFocus || !showFocusedWithItem)) {
                this._setIconState(icon, false, false);
            }
            if (this._iconShouldShowOver(icon)) this._setIconState(icon, false, false);
        }        
        return this._nativeElementBlur(element,this);        
    },



    // On icon mouseOver / mouseOut, 
    // - update the icon's appearance if showOver is true.
    // - show the prompt in a hover if there is a prompt defined for the icon
    // - update window.status to also show the prompt.
    _iconMouseOver : function (id) {
        
        // We use the standard icon code to write out our validation error icon - if this is
        // where the event occurred, pass that through to a separate handler.
        if (id == this.errorIconName) return this._handleErrorIconMouseOver();
        var icon = this.getIcon(id);
        if (icon != null) {

            // If appropriate set the 'over' state for the icon img
            if (this._iconShouldShowOver(icon)) this._setIconState(icon, true);

            // Set up the hover action on this item:
            // Remember which icon we're over, then set hover action (will fire instantly if
            // the hover is already up)
            this._lastPromptIcon = icon;
            isc.Hover.setAction(this, this._handleIconHover, null, this._getHoverDelay());
            
            
            var prompt = (icon.prompt != null ? icon.prompt : this.iconPrompt)    
            window.status=prompt;
            return true;
        }
    },

    _iconMouseOut : function (id) {
        if (id == this.errorIconName) return this._handleErrorIconMouseOut();    
        var icon = this.getIcon(id);
        if (icon != null) {
            window.status = "";

            if (this._iconShouldShowOver(icon)) {
                var overWhen = this._iconShowOverWhen(icon),
                    itemInfo = isc.EH.lastEvent.itemInfo,    
                    over = overWhen == "item" ?  itemInfo && itemInfo.item == this :
                        (overWhen == "textbox" ? this._overTextBox : false);
                if (!over) {
                    this._setIconState(icon, false);
                }
            }

            // Reset the hover action to show the hover for the item as a whole
            delete this._lastPromptIcon;
            isc.Hover.setAction(this, this._handleHover, null, this._getHoverDelay());

            return true;
        }
    },

    
    _iconMouseMove : isc.Class.NO_OP,

    //> @method	formItem._iconClick()  (I)
    // Handle a click on a form item icon.  Fires the click action defined for the icon.
	//  @group  appearance, events
    //
    //<
    _iconClick : function (id) {

        if (id == this.errorIconName) return this._handleErrorIconClick();

        var icon = this.getIcon(id);
        if (icon == null) return;
        if (this.iconIsDisabled(icon)) return;
        if (icon.click != null) {
            // Note - can't use 'convertToMethod' on the icon object, as it has no registry of 
            // stringMethods.  Must use 'replaceWithMethod' instead.
            if (!isc.isA.Function(icon.click)) {
                isc.Func.replaceWithMethod(icon, "click", "form,item,icon");
            }
            if (icon.click(this.form, this, icon) == false) {
                return false;
            }
        }
        if (icon.pickerIcon && this.pickerIconClick) {
            if (this.pickerIconClick(this.form, this, icon) == false) {
                return false;
            }            
        }

        if (this.iconClick) {
            if (this.iconClick(this.form, this, icon) == false) {
                return false;
            }
        }
    },
    
    // Default pickerIconClick handler will show the picker autoChild
    // May be overridden for custom behavior
    // Documented in registerStringMethods block
    
    suppressPickerForCustomIconClick:true,
    pickerIconClick : function () {
        var pickerIcon = this.getIcon("picker");
        if (this.suppressPickerForCustomIconClick
            && pickerIcon != null && pickerIcon.click != null) 
        {
            return;
        }
        this.showPicker();
    },


    _$Enter:"Enter",
    _$Space:"Space",
    _$Escape: "Escape", 

    iconClickOnEnter:true,
    iconClickOnSpace:true,
    _iconKeyPress : function (id) {
        var icon = this.getIcon(id);
        if (icon) {
            var keyName = isc.EH.getKey(),
                character = isc.EH.getKeyEventCharacter();
            if (icon.keyPress) {
                // Note - can't use 'convertToMethod' on the icon object, as it has no registry 
                // of  stringMethods.  Must use 'replaceWithMethod' instead.
                if (!isc.isA.Function(icon.keyPress)) {
                    isc.Func.replaceWithMethod(icon, "keyPress", "keyName, character,form,item,icon");
                }
                if (icon.keyPress(keyName, character, this.form, this, icon) == false) 
                    return false;
            }
            if (this.iconKeyPress) this.iconKeyPress(keyName, character, this.form, this, icon);

            // by default we always have "enter" or "space" fire the icon's click action
            if ((this.iconClickOnEnter && keyName == this._$Enter) || 
                (this.iconClickOnSpace && keyName == this._$Space))
            {
                if (this._iconClick(icon) == false) return false;
            }
            
        }
    },
        
    // error icon events
    
    _handleErrorIconMouseOver : function () {
        isc.Hover.setAction(this, this._handleErrorIconHover, null, this._getHoverDelay());
    },
    
    _handleErrorIconMouseOut : function () {
        isc.Hover.setAction(this, this._handleHover, null, this._getHoverDelay());

    },
    _handleErrorIconClick : function () {
        // Don't wait for long-touch to show the error message on mobile devices
        // Expectation would be for these to show instantly
        if (isc.Browser.isTouch) {
            this._handleErrorIconHover();
        }
    },
    
    _handleErrorIconHover : function () {
        //!DONTCOMBINE
        if (this.itemHover && this.itemHover(this, this.form) == false) return false;
        
           
        var promptString = this.shouldShowErrorIconPrompt() 
                            ? isc.FormItem.getErrorPromptString(this._currentIconError) 
                            : isc.emptyString;
                            
        if (promptString && !isc.is.emptyString(promptString)) 
            isc.Hover.showForTargetMouseOver(promptString, this.form._getItemHoverProperties(this));
        else isc.Hover.setAction(this, this._handleHover, null, this._getHoverDelay());        
    },


    // Hover events ---------------------------------------------------------------------------

    //_handleHover / _handleTitleHover fired when the user hovers over this item/title.
    //
    // Fire any custom hover-handler for the item.
    // If the custom handler does not return false, show a hover canvas for this item.
    // contents for the hover derived from item.itemHoverHTML() or form.itemHoverHTML()
    // (default implementation at the form level shows item prompt)
    _handleHover : function () {
        // Note itemHover / titleHover registered as stringMethods
        var form = this.form,
            itemHoverCallback = this._getNotificationCallback("itemHover");
        if (itemHoverCallback != null &&
            this.fireCallback(itemHoverCallback, null, [itemHoverCallback.target, form]) == false)
        {
            return false;
        }

        var showOldValueInHover;
        if (this.showOldValueInHover != null) {
            showOldValueInHover = this.showOldValueInHover;
        } else if (form.showOldValueInHover != null) {
            showOldValueInHover = form.showOldValueInHover;
        } else {
            showOldValueInHover = this._getShowPending();
        }
        // if the item is disabled disabledHover is set, we want to show the disabledHover,
        // even if generally configured to show the oldValue - for disabled items with no
        // disabledHover, we will continue to show the old-value if configured to do so
        if (this.disabledHover && this.renderAsDisabled()) showOldValueInHover = false;

        var originalValueMessage;
        if (showOldValueInHover) {
            if (this.originalValueMessage != null) originalValueMessage = this.originalValueMessage;
            else if (form.originalValueMessage != null) originalValueMessage = form.originalValueMessage;
        }

        var HTML,
            itemHoverHTMLCallback = this._getNotificationCallback("itemHoverHTML");
        if (itemHoverHTMLCallback != null) {
            HTML = this.fireCallback(itemHoverHTMLCallback, null, [itemHoverHTMLCallback.target, form]);
        } else if (showOldValueInHover && originalValueMessage != null && (this._getOldValue() != this.getValue())) {
            var item = this;
            while (item.parentItem != null) item = item.parentItem;
            HTML = originalValueMessage.replace(/(\$?)\$(value|newValue)/g, function (match, p1, p2, offset, originalValueMessage) {
                if (p1 === "$") return "$" + p2;
                else if (p2 === "value") {
                    var result = item._getDisplayValueForOldValueHover(item._getOldValue());
                    return result == "" ? this.nullOriginalValueText : result;
                } else if (p2 === "newValue") {
                    var result = item._getDisplayValueForOldValueHover(item._value);
                    return result == "" ? this.nullOriginalValueText : result;
                }
                
            });
        } else if (form.itemHoverHTML === isc.DynamicForm._defaultItemHoverHTMLImpl) {
            HTML = isc.DynamicForm._defaultItemHoverHTMLImpl(this);
        } else {
            var item = this;
            while (item.parentItem != null) item = item.parentItem;
            HTML = form.itemHoverHTML(item, form);
        }

        this.form._showItemHover(this, HTML);
    },

    _handleTitleHover : function (event) {
        //!DONTCOMBINE

        if (this.titleHover && this.titleHover(this, this.form) == false) return false;

        var HTML;
        if (this.titleHoverHTML) HTML = this.titleHoverHTML(this, this.form);
        else HTML = this.form.titleHoverHTML(this, this.form);

        this.form._showItemHover(this, HTML);
    },

    _handleTextBoxHover : function () {
        //!DONTCOMBINE
        
        // If the user is hovering over an inline icon, show it's prompt (if defined)
        // otherwise carry on with standard text box hover behavior.
        var itemInfo = isc.EH.lastEvent.itemInfo,
            icon = this.getIcon(itemInfo && itemInfo.overIcon);
        if (icon && icon == this._lastPromptIcon && icon.inline) {
            var prompt = this.getIconPrompt(icon);
            if (prompt && !isc.is.emptyString(prompt)) {
                return this._handleIconHover();
            }
        }
        

        
        var valueHoverCallback = this._getNotificationCallback("valueHover");
        if ((this._getNotificationCallback("itemHoverHTML") != null ||
             this.form.itemHoverHTML !== isc.DynamicForm._defaultItemHoverHTMLImpl) &&
            valueHoverCallback == null &&
            this.form.valueHoverHTML === isc.DynamicForm._defaultValueHoverHTMLImpl)
        {
            return this._handleHover();
        }

        if (!this.showClippedValueOnHover || !this.valueClipped() || 
                // the value's changed, show the old value if showOldValueInHover is set
                (this.showOldValueInHover && this._getOldValue() != this.getValue())) {
            return this._handleHover();
        }
        if (valueHoverCallback != null &&
            this.fireCallback(valueHoverCallback, null, [valueHoverCallback.target, this.form]) == false)
        {
            return false;
        }

        var HTML,
            valueHoverHTMLCallback = this._getNotificationCallback("valueHoverHTML");
        if (valueHoverHTMLCallback != null) {
            HTML = this.fireCallback(valueHoverHTMLCallback, null, [valueHoverHTMLCallback.target, this.form]);
        } else {
            var item = this;
            while (item.parentItem != null) item = item.parentItem;
            HTML = this.form.valueHoverHTML(item, this.form);
        }

        this.form._showItemHover(this, HTML);
    },

    // _handleIconHover: helper method fired when the user hovers over an icon.  Only fired if
    // the hovered-over icon has a prompt to show.
    // Call 'itemHover()' if defined *(allows the user to suppress the prompt), and then show
    // the icon prompt.
    _handleIconHover : function () {
        // note: we don't want to show the icon prompt if the item level 'itemHover' method 
        // returns false.
        
        //!DONTCOMBINE
        if (this.itemHover && this.itemHover(this, this.form) == false) {
            return false;
        }
        var icon = this._lastPromptIcon,
            prompt = icon && this.getIconPrompt(icon);
        if (prompt && !isc.is.emptyString(prompt)) {
            isc.Hover.showForTargetMouseOver(prompt, this.form._getItemHoverProperties(this));
        }
        // If there's no prompt, the standard item hover to show the appropriate HTML
        // (will get shown synchronously since the hover's already up)
        else isc.Hover.setAction(this, this._handleHover, null, this._getHoverDelay());        
    },
    
    //> @method formItem.itemHover()     (A)
    // Optional stringMethod to fire when the user hovers over this item.
    // Return false to suppress default behavior of showing a hover canvas containing the
    // HTML returned by <code>formItem.itemHoverHTML()</code> / 
    // <code>form.itemHoverHTML()</code>.
    //
    // @param  item (FormItem)     Pointer to this item
    // @param  form (DynamicForm)  This items form
    // @group Hovers
    // @see FormItem.titleHover()
    // @see FormItem.itemHoverHTML()
    // @visibility external
    //<

    //> @method formItem.titleHover()     (A)
    // Optional stringMethod to fire when the user hovers over this item's title.
    // Return false to suppress default behavior of showing a hover canvas containing the
    // HTML returned by <code>formItem.titleHoverHTML()</code> / 
    // <code>form.titleHoverHTML()</code>.
    //
    // @param  item (FormItem)     Pointer to this item
    // @param  form (DynamicForm)  This items form
    // @group Hovers
    // @see FormItem.itemHover()
    // @see FormItem.titleHoverHTML()
    // @visibility external    
    //<

    //> @method formItem.valueHover()     (A)
    // Optional stringMethod to fire when the user hovers over this item's value.
    // Return false to suppress default behavior of showing a hover canvas containing the
    // HTML returned by +link{FormItem.valueHoverHTML()} / +link{DynamicForm.valueHoverHTML()}.
    //
    // @param  item (FormItem)     Pointer to this item
    // @param  form (DynamicForm)  This items form
    // @group Hovers
    // @see FormItem.itemHover()
    // @visibility external
    //<


    //> @method formItem.titleHoverHTML()     (A)
    // If defined, this method should return the HTML to display in a hover canvas when the 
    // user holds the mousepointer over this item's title.  Return null to suppress the hover 
    // canvas altogether.
    // <P>
    // If not defined, +link{DynamicForm.titleHoverHTML()} will be evaluated to determine
    // hover content instead.
    //
    // @param  item (FormItem)     Pointer to this item
    // @param  form (DynamicForm)  This items form
    // @return (HTMLString) HTML to be displayed in the hover
    // @group Hovers
    // @see FormItem.prompt
    // @see FormItem.titleHover()
    // @see FormItem.itemHoverHTML()
    // @see FormItem.showClippedTitleOnHover
    // @visibility external    
    //<

    //> @method formItem.valueHoverHTML()     (A)
    // If defined, this method should return the HTML to display in a hover canvas when the
    // user holds the mousepointer over this item's value.  Return null to suppress the hover
    // canvas altogether.
    // <p>
    // If not defined, +link{DynamicForm.valueHoverHTML()} will be evaluated to determine
    // hover content instead.
    //
    // @param  item (FormItem)     Pointer to this item
    // @param  form (DynamicForm)  This items form
    // @return (HTMLString) HTML to be displayed in the hover
    // @group Hovers
    // @see FormItem.showClippedValueOnHover
    // @visibility external
    //<

    //> @method formItem.itemHoverHTML()     (A)
    // If defined, this method should return the HTML to display in a hover canvas when the 
    // user holds the mousepointer over this item.  Return null to suppress the hover 
    // canvas altogether.
    // <P>
    // If not defined, <code>dynamicForm.itemHoverHTML()</code> will be evaluated to 
    // determine hover content instead.
    //
    // @param  item (FormItem)     Pointer to this item
    // @param  form (DynamicForm)  This items form
    // @return (HTMLString) HTML to be displayed in the hover
    // @group Hovers
    // @see FormItem.prompt
    // @see FormItem.itemHover()
    // @see FormItem.titleHoverHTML()
    // @example itemHoverHTML
    // @visibility external    
    //<

    
    getGlobalTabIndex : function () {
        
        if (this.form && this.form._keyboardEventsDisabled) {
            return -1;
        }
        
        if (this.globalTabIndex == null) {
            if (this.tabIndex == -1) this.globalTabIndex = -1;
            else {
                // we've been added to the tab-index-manager by our form on init
                return isc.TabIndexManager.getTabIndex(this.ID); 
            }
        }
        return this.globalTabIndex;
    },
    
    // getTabIndex() - returns the local tabIndex for this item.
    // Probably only to be used by internally
    getTabIndex : function () {
        if (this.tabIndex != null) return this.tabIndex;
        if (this.globalTabIndex || !this._canFocus()) return null;
        // In form.addItems(), we assign the items' local tab indices
        // (basically in item-order, modified to account for any items with an explicit
        // tab index specified).
        // If this method gets called before that logic runs (would have to be called
        // during item initialization), just return null
        
        if (this._localTabIndex == null) {
            return null;
        }
        return this._localTabIndex;
    },
    
    // setTabIndex() / setGlobalTabIndex()
    // force the form to redraw so the HTML is updated to reflect the changes in tabIndex
    setGlobalTabIndex : function (index) {
        this.globalTabIndex = index;
        this._setElementTabIndex(index);

    },
    //> @method formItem.setTabIndex()
    // Setter for +link{formItem.tabIndex}.
    // @param tabIndex (Integer) new tabIndex for the item
    // @visibility external
    //<
    setTabIndex : function (tabIndex) {

        // If we already have the appropriate tabIndex assigned, no-op
        if (this.tabIndex == tabIndex) return;
    
        this.globalTabIndex = null;
        this.tabIndex = tabIndex;
        
        // Tell the form to reassign tab order of items - this may impact the
        // tab position or tab index of other items as well.
        //
        // Exceptions: If the new tabIndex is -1 we won't change the order of any other items.
        // If we're in the middle of adding items, the form will call assignItemsTabPosition()
        // after building the items list.
        if (tabIndex != -1 && this.form && !this.form.addingItems) {
            this.form.assignItemsTabPosition();
        }
        
        this._setElementTabIndex(this.getGlobalTabIndex());
    },

    // _getElementTabIndex() returns the tab index to actually write into the element.
    // This may differ from the result of this.getGlobalTabIndex() to allow (for example) 
    // taking form items out of the page's tab order without forgetting their global tab index.
    
    _getElementTabIndex : function (ignoreDisabled) {
        //!DONTCOMBINE
        if (this.isInactiveHTML() || 
            (!ignoreDisabled && this.renderAsDisabled())) 
        {
            return -1;
        }
        
        return this.getGlobalTabIndex();
    },
    
    // _setElementTabIndex() - update the tab index written into the HTML element for this 
    // form item.
    // The second 'autoIndexUpdateNotification' method tells us this came from 
    // a notification from the TabIndexManager. In this case we can skip updating the
    // icons since these are also registered and will receive notifications of their own.
    //
    
    _setElementTabIndex : function (tabIndex, autoIndexUpdateNotification) {
    
        // If we can't accept focus, or aren't drawn/visible just bail
        if (!this._canFocus() || !this.isDrawn()) return;
        
        // Default implementation will set the tabIndex on whatever element is returned by
        // this.getFocusElement().
        // Note that this may not work for all items - for example items with multiple elements
        // in the DOM.
        if (this.getFocusElement() != null) {
            isc.FormItem.setElementTabIndex(this.getFocusElement(), tabIndex);
            
            // Also update any form item icons.
            // Note that we are only doing this
            // - if we have an element, because if we do not the redraw (below) is 
            //   required in any case, and will cause the icons' tab index to be updated.
            // - if this isn't a notification from the TabIndexManager [in that case we
            //   can assume the icons will also be notified]
            if (!autoIndexUpdateNotification) this._updateIconTabIndices();
            
        } else {
            // Make the default implementation for form items with no 'focusElement' to redraw
            // the form - this should reset the innerHTML of the element to whatever is 
            // required for an updated tabIndex in most cases.
            
            this.redraw("set tab index");
        }
    }, 
    
    // returns the (global) tab index for some icon
    _getIconTabIndex : function (icon) {
        // We want the developer to be able to specify tabIndex -1 on icons
        
        if (icon.tabIndex == -1 || this.iconIsDisabled(icon)) return -1;

        
        if (this.globalTabIndex != null) {
            return this._getElementTabIndex(true);
        }

        return isc.TabIndexManager.getTabIndex(this.getTabIndexIdentifierForIcon(icon));
        
    },

    // Helper method to iterate through this item's icons, and update all their tab indices.
    
    _updateIconTabIndices : function () {
        var icons = [];
        if (this._pickerIconVisible()) icons.add(this.getPickerIcon());
        icons.addList(this.icons);

        for (var i = 0; i < icons.length; i++) {     
            var icon = icons[i];
            if (!icon || icon.imgOnly) continue;
            var tabIndexElement = this._getIconLinkElement(icon) || this._getIconImgElement();
            if (tabIndexElement != null) {
                isc.FormItem.setElementTabIndex(tabIndexElement, this._getIconTabIndex(icon));
            }
        }
    },

    //> @method formItem.setDisabled()    (A)
    //  Set this item to be enabled or disabled at runtime. 
    //  @param  disabled (boolean)   true if this item should be disabled
    //  @see    attr:FormItem.disabled
    // @see setCanEdit()
    // @group enable
    //  @visibility external
    //<
    setDisabled : function (disabled) {
        var wasDisabled = this.isDisabled();
        this.disabled = disabled;
        var isDisabled = this.isDisabled();
        if (wasDisabled != isDisabled) this.updateDisabled();
    },
    
    //> @method formItem.setShowDisabled()
    // Setter method for +link{formItem.showDisabled}
    // @param showDisabled (boolean) new showDisabled setting
    // @visibility external
    //<
    setShowDisabled : function (showDisabled) {
        this.showDisabled = showDisabled;
        this.updateDisabled();
    },
    
    // updateDisabled - helper method to update the form item to reflect it's enabled/disabled
    // state
    
    updateDisabled : function () {
        var disabled = this.isDisabled();
        this._setElementEnabled(!disabled);
        this._setIconsEnabled();
        // update the valueIcon if we have one
        this._updateValueIcon(this.getValue());
        // UpdateState is a catch-all method that updates the css classes applied to our elements
        // to reflect the 'disabled' versions
        
        if (this.showDisabled) this.updateState();

    },
    
    // deprecated corollary to setEnabled()
    setEnabled : function (enabled) {
        return this.setDisabled(!enabled);
    },

    //> @method formItem.isDisabled()    (A)
    //  Is this item disabled?
    //  @return disabled (Boolean)   true if this item is be disabled
    //  @see    attr:FormItem.disabled
    // @group enable
    //  @visibility external
    //<
    isDisabled : function () {
        
        if (this.form == null) return this.disabled;

        var disabled = this.disabled;
        // For members of containerItems, inherit the disabled-ness of the parent item
        if (!disabled) {
            if (this.parentItem != null) disabled = this.parentItem.isDisabled();
            else {
                disabled = this.form.isDisabled();

                // Allow disabled-ness to be inherited from either the form or the containerWidget
                if (!disabled && this.containerWidget != this.form) disabled = this.containerWidget.isDisabled();
            }
        }
        return disabled;
    },

    //>@method formItem.enable()
    // Set this item to be enabled at runtime.
    // @see attr:FormItem.disabled
    // @group enable
    // @visibility external
    //<
    enable : function () {
        this.setDisabled(false);
    },

    //>@method formItem.disable()
    // Set this item to be disabled at runtime.
    // @see attr:FormItem.disabled
    // @group enable
    // @visibility external
    //<
    disable : function () {
        this.setDisabled(true);
    },

    // _setElementEnabled()
    // Actually update the HTML to mark the data element as enabled / disabled
    // (Overridden where appropriate by subclasses)
    
    _setElementEnabled : function (enabled) {
        if (this.hasDataElement()) {     
            var element = this.getDataElement();
            if (element) {
                element.disabled = !enabled;
                element.tabIndex = this._getElementTabIndex();
                // If we use an 'eventMask' clear it out if we're being enabled, or write it
                // over the native form item element if we're being disabled.
                
                if (this.useDisabledEventMask() && !this.renderDisabledEventMask()) {
                    var maskElement = this._getEventMaskElement();
                    if (maskElement && (!maskElement.getAttribute || 
                        maskElement.getAttribute("isDisabledEventMask") != "true"))
                    {
                        maskElement = null;
                    }
                            
                    if (enabled && maskElement) {
                        isc.Element.clear(maskElement);
                    } else if (!enabled && !maskElement) {
                        isc.Element.insertAdjacentHTML(element, "beforeBegin", this._getEventMaskHTML());
                    }
                }
            }
        } else if (this._canFocus()) {
            var element = this.getFocusElement();
            if (element) element.tabIndex = this._getElementTabIndex();
        }
    },
    // _setIconsEnabled()
    // Update all icons' html to match a new enabled state
    _setIconsEnabled : function () {
        if (this.showPickerIcon) {
            var pickerIcon = this.getPickerIcon();
            this.setIconEnabled(pickerIcon);
        }
        if (!this.icons || this.icons.length < 1) return;
        for (var i = 0; i< this.icons.length; i++) {
            this.setIconEnabled(this.icons[i]);
        }
    },
    
    iconIsDisabled : function (icon) {        
        icon = this.getIcon(icon);
        if (!icon) return;
        // if we're in a disabled container that trumps 'neverDisable'
        if (this.containerWidget && this.containerWidget.isDisabled()) return true;
        if (icon.neverDisable) return false;
        // disabled at the item or icon level - trumps read-only
        if (this.isDisabled() || icon.disabled) return true;
        // Check for flag to see if the icon should be disabled if the item is readOnly
        var disableOnReadOnly = icon.disableOnReadOnly;
        if (disableOnReadOnly == null) {
            disableOnReadOnly = this.disableIconsOnReadOnly;
        }
        if (disableOnReadOnly) return this.isReadOnly();
        return false;
    },
    
    //> @method formItem._canFocus()    ()
    //  Return true if the form item can accept keyboard focus
    //  @group  visibility
    //  @return (boolean)   true if the form item is visible
    //<
    
    _canFocus : function () {
        // If there's an explicit 'canFocus' property, respect it.
        if (this.canFocus != null) return this.canFocus;
        return this.hasDataElement();
    },
    
    // Should we write out focus-attributes on the textBox [or if required, a focusProxy]
    _canFocusInTextBox : function () {
        return this._canFocus() && 
            
            !this.renderAsStatic()
        ;
    },

    //> @method formItem.getCanFocus()
    // Returns true for items that can accept keyboard focus such as data items 
    // (+link{TextItem,TextItems}, +link{TextAreaItem,TextAreaItems}, etc), 
    // +link{CanvasItem,CanvasItems} with a focusable canvas, or items where +link{canFocus}
    // was explicitly set to true.
    // 
    // @return (boolean)   true if the form item is visible
    // @group focus
    // @visibility external 
    //<
    getCanFocus : function () {
        return this._canFocus();
    },
    
    

    // _shouldSelectOnFocus() - should we select the entire text string on (this) focus event?
    // Checks this.selectOnFocus but also whether focus came from a mouse click in the item
    // (in which case we want to suppress the selectOnFocus behavior so the user doesn't have to
    // click twice).
    _shouldSelectOnFocus : function () {
        // If we're actually focussing in response to a setSelectionRange() call, don't select all
        // as that would throw away the desired selectionRange.
        if (this._settingSelectionRange) {
            return false;
        }
        
        var selectOnFocus = this.selectOnFocus;
        if (selectOnFocus == null && this.form) selectOnFocus = this.form.selectOnFocus;
        if (selectOnFocus) {
            // We want to select on focus when the user is tabbing through the form,
            // or on programmatic focus, but not on click.
            // Check for a mouse event *over this widget*, and avoid focus in that case
            
            var isMouseEvent = isc.EH.isMouseEvent() && 
                                (this.containerWidget.contains(isc.EH.lastEvent.target, true));
            if (isMouseEvent) selectOnFocus = false;
        }
        return selectOnFocus;
    },
    
    // _shouldSelectOnClick() - should we select the entire text string on (this) click event?
    
    _shouldSelectOnClick : function () {
        var selectOnClick = this.selectOnClick;
        if (selectOnClick == null && this.form) selectOnClick = this.form.selectOnClick;
        return selectOnClick;        
    },
    
    // focusAtEnd()
    // Put focus into the first or last focusable element for this item.
    
    focusAtEnd : function (start) {
        return isc.TabIndexManager.shiftFocusWithinGroup(this.getID(), null, start);
    },

    //>	@method formItem.focusInItem()
    //			Move the keyboard focus into this item's focusable element
    //		@group eventHandling, focus    
    // @visibility external
    //<
    focusInItem : function () {
        // Verify that the form is visible (Script errors occur if you attempt to focus
        // on a hidden item)
        var canFocus = this.isVisible() && this._canFocus() && !this.renderAsDisabled(),
            element = canFocus ? this.getFocusElement() : null;     

        if (canFocus && element == null) {
            // If we're undrawn and our parent is dirty
            // [and we're theoretically focusable and visible], we may be waiting on the 
            // show/hide redraw
            // In this case force an immediate redraw and see if we can get our element
            if (canFocus && this.isVisible() && !this.isDrawn() && 
                this.containerWidget && this.containerWidget.isDrawn() && this.containerWidget.isDirty()) 
            {
                this.containerWidget.redraw();
                element = this.getFocusElement();
            }
        }

        if (!canFocus || !element) {
            
            // This method will return null if we don't have an HTML element, or the
            // element is currently not drawn into the DOM
            return;
        }

        // Remember refocusAfterRedraw before we actually execute any logic to focus.
        // This will ensure that if the native focus handler clears this flag we still
        // correctly detect this case
        var refocusAfterRedraw = this._refocussingAfterRedraw;
        
        // If the form for this item is masked, suppress the focus attempt and record the
        // form as the masked focus target (and the item as the focusItem for the form)
        
        var form = this.form;
        if (isc.EH._targetIsMasked(form, this, this.getFocusElement(), null, true) && !form._ignoreClickMaskFocus) {
            var topMask = isc.EH.clickMaskRegistry.last();
            isc.EH.setMaskedFocusCanvas(form, topMask);
            form.setFocusItem(this);
            return;
        }

        
        if (this.hasFocus) {
            this.logDebug("focusInItem() not calling element.focus() as element already has " +
                          "native focus", "nativeFocus");
        }

        var EH = this.ns.EH,
            mouseDownDOMevent = EH.mouseDownEvent && EH.mouseDownEvent.DOMevent;
        if (mouseDownDOMevent != null && EH._handlingTouchEventSequence() && EH._shouldIgnoreTargetElem(element)) {
            var targetElem = (mouseDownDOMevent.target &&
                              (mouseDownDOMevent.target.nodeType == 1 ? mouseDownDOMevent.target
                                                                      : mouseDownDOMevent.target.parentElement));
            if (targetElem != null && element.contains(targetElem)) {
                return;
            }
        }

        if (element.focus) {
            var suppressFocus = false;
            
            if (this._IESelectionStuck()) {
                
                try {
                    document.selection.clear();
                } catch (e) {
                    this.logInfo("Internet explorer error calling document.selection.clear()."
                        + e.message);
                }

                
                //>DEBUG
                this.logDebug("focusInItem(): Internet Explorer selection is currently " +
                    "wedged due to a native bug tripped by synchronous focus manipulation " +
                    "and redraw. Explicitly clearing selection before resetting native focus.", 
                     "nativeFocus");
                //<DEBUG

            // In IE - avoid calling 'focus' on an element that already has native focus
            
            } else if (isc.Browser.isIE && element == this.getActiveElement()) {
                suppressFocus = true;
            }
            if (!suppressFocus) {
                //>DEBUG
                this.logInfo("about to call element.focus() " + isc.EH._getActiveElementText() +
                             (this.logIsDebugEnabled("traceFocus") ? this.getStackTrace() : ""), 
                             "nativeFocus");
                //<DEBUG
                
                
                isc.EH._clearThread();
                element = this.getFocusElement();
                
                if (element && element.focus) {                
                    // Fire a notification function centrally so we know a programmatic focus
                    // change has been triggered
                    isc.FormItem._aboutToFireNativeElementFocus(this);
                    isc.EventHandler._unconfirmedFocus = this;
                    element.focus();
                
                } else {
                    
                }
                

                //if (isc.Browser.isIE) {
                //    this.logDebug("called element focus" + isc.EH._getActiveElementText(),
                //                  "nativeFocus");
                //}
            } else {
                this.logInfo("element already focused, not focus()ing", "nativeFocus");
            }
            
            
            
            if (isc.Browser.isIE && isc.EH.synchronousFocusNotifications) {
                isc.EH._lastFocusTarget = this;
                this._currentFocusElement = element;
            }
        } else {
            //>DEBUG
            this.logInfo("can't call element focus, no element", "nativeFocus");
            //<DEBUG
        }
        var selectOnFocus = this._shouldSelectOnFocus();
        // if we're just refocussing after redraw call the method to reset to whatever the previous 
        // selection was (ignore selectOnFocus in this case!)
        if (refocusAfterRedraw) {
            this.resetToLastSelection(true);
        } else if (selectOnFocus && element.select) {
            element.select();
        }

    },
    
    blurItemWithoutHandler : function () {
        if (!this.hasFocus) return;
        this.form._suppressBlurHandlerForItem(this);
        this.blurItem();
    },

    //>	@method formItem.blurItem()
    //			Takes focus from this form item's focusable element.
    //		@group eventHandling, focus   
    // @visibility external 
    //<
    blurItem : function (isRedraw) {
        if (!this.isVisible() || !(this.hasFocus || isc.EH._lastFocusTarget == this)) return;

        // Call 'blur()' on whatever element has been recorded as having native focus.
        // We record the current focus element in '_nativeElementFocus()'
         
        var element = this._getCurrentFocusElement();

        if (element && element.blur) {
            //>DEBUG
            this.logInfo("about to call element blur" + isc.EH._getActiveElementText() +
                         (this.logIsDebugEnabled("traceBlur") ? this.getStackTrace() : ""), 
                         "nativeFocus");                         
            //<DEBUG
            isc.EH._unconfirmedBlur = this;   

            
            if (isc.Browser.isIE) {
                try {
                    element.blur();
                } catch (e) {
                    
                }
            } else {
                element.blur();
            }

            //if (isc.Browser.isIE) {
            //    this.logDebug("called element blur, active element now: " +
            //              document.activeElement.id, "nativeFocus");
            //}
        } else {
            //>DEBUG
            this.logInfo("can't call element blur, no element", "nativeFocus");
            //<DEBUG
            // Note: if this item was marked as having focus, _getCurrentFocusElement()
            // ensures that flag gets cleared
        }

        
	},

    // focusInIcon()
    // - explicitly puts focus into an icon
    focusInIcon : function (icon) {
        icon = this.getIcon(icon);
        if (icon == null || icon.imgOnly) return false;
        var element = this._getIconLinkElement(icon);     
        if (element != null) {
            this.logDebug("focusInIcon() about to call native focus()", "nativeFocus");
            element.focus();
            return true;
        }
        return false;
    },

    // blurIcon()
    // - take focus from an icon
    blurIcon : function (icon) {
        if (isc.isA.String(icon)) icon = this.getIcon(icon);    
        if (icon == null || !this.icons || !this.icons.contains(icon) || icon.imgOnly) return;
        var element = this._getIconLinkElement(icon);

        // Note - we are checking for the icon being present and drawn, but not whether it
        // actually has focus in this method - it is relying on the fact that this should only
        // be called if the passed in icon has focus.
        if (element != null) {
            this.logDebug("blurIcon() about to call native blur()", "nativeFocus");
            element.blur();
        }
    },
    
    //> @method formItem.isFocused()
    // Returns true if this formItem has the keyboard focus.  Note that in Internet Explorer
    // focus notifications can be asynchronous (see +link{EventHandler.synchronousFocusNotifications}).
    // In this case, this method can correctly 
    // return false when, intuitively, you would expect it to return true:
    // <pre>
    //     someItem.focusInItem();
    //     if (someItem.isFocused()) {
    //         // In most browsers we would get here, but not in Internet Explorer with
    //         // EventHandler.synchronousFocusNotifications disabled
    //     }
    // </pre>
    //
    // @return (Boolean) whether this formItem has the keyboard focus
    // @visibility external
    //<
    isFocused : function () {
        return this.hasFocus;
    },

    // _nativeElementFocus
    // Internal method fired when an element of this form item receives focus.
    // (Fired from focus on the data-element, or icons for most form item types)
    // Sets up formItem.hasFocus, and remembers which native element has focus, before firing
    // Form.elementFocus() to handle bubbling the focus event through the Form item hierarchy.
    
    _nativeElementFocus : function (element, itemID) {
        if (this._refocussingAfterRedraw) delete this._refocussingAfterRedraw;
        if (isc.EH._unconfirmedFocus == this) delete isc.EH._unconfirmedFocus
        isc.EH._logFocus(this, true);
        
        
        if (isc.Browser.isMoz && !this.isVisible()) {
            this.logWarn("calling element.blur() to correct focus in hidden item: " + this, 
                         "nativeFocus");
            element.blur();
            return;
        }

        // set this.hasFocus:
        this.hasFocus = true;
        
        // remember which element got focus:
        this._currentFocusElement = element;
        
        var result = this.form.elementFocus(element, itemID);
        return result;
    },
    
    
    _handleAsyncFocusNotification : function () {
        if (this._notifyAncestorsReflowCompleteOnAsyncFocus) {
            delete this._notifyAncestorsReflowCompleteOnAsyncFocus;
            this.containerWidget.notifyAncestorsReflowComplete();
        }
    },
    
    _nativeElementBlur : function (element, itemID) {
        if (isc.EH._unconfirmedBlur == this) delete isc.EH._unconfirmedBlur

        // If we're pending an update, and we've lost focus, update now 
        if (this._pendingUpdate != null) {
            isc.Timer.clearTimeout(this._pendingUpdate);
            this._delayedUpdate();
        }

        isc.EH._logFocus(this);      
        this.hasFocus = false;
        delete this._currentFocusElement;
        
        var result = this.form.elementBlur(element, itemID);
        return result;
    },

	//>	@method	formItem.elementFocus()
	// Handle a focus event from an element
    // @param suppressHandlers (boolean) If passed, don't fire any developer-visible focus 
    //                                  handler functions.
	//		@group	event handling
	//<
    // Note: currently our onfocus handler will call 'elementFocus' at the form level, which
    // will then 
    // - mark "hasFocus" as true on this item
    // - call this method.
    // We may want to shift the 'hasFocus' into this file to make it clearer when we get rid of
    // the 'standalone' behavior.
    
	elementFocus : function (suppressHandlers) {  
		// if the item specifies a prompt, show it in the status bar
        
		if (this.prompt) this.form.showPrompt(this.prompt);
        
        // Show icon(s) affected by +link{formItem.showIconsOnFocus} or +link{icon.showOnFocus}.
        // Or if the icons are already visible update their appearance to show "Focused" image.
        
        if (!suppressHandlers) this._setIconVisibilityForFocus(true);

        
        // if formatOnBlur is true, update the element value to get rid 
        // of the static formatter
        if (this.formatOnBlur) {
            var displayValue = this.getDisplayValue();
            this._setElementValue(displayValue, this._value);
        }
        // Update the className of our various bits of HTML to show focused state
        if (this.showFocused) this.updateState();
        
        // If we're showing a valueIcon, put it into 'over' state if necessary
        
        if (this.showValueIconFocused && this.showValueIconOver && this._iconState == null) {
            this._iconState = this._$Over;
            this._updateValueIcon(this.getValue());
        }
        
        if (suppressHandlers) return;

        // If there are pending server validations that could affect this field,
        // block UI interaction until they complete. Skip any further handlers as well.
        
        if ((this.grid && this.grid.blockOnFieldBusy(this))
            || (!this.grid && this.form.blockOnFieldBusy(this)))
        {
            return false;
        }

        // If necessary fire this.editorEnter
        this.handleEditorEnter()
        
		// if the item has a "focus" handler
		if (this.focus) {
			// CALLBACK API:  available variables:  "form,item"
			// Convert a string callback to a function
            this.convertToMethod("focus");
			return this.focus(this.form, this);
		}
		
		return true;
	},

    _updateIconForFocus : function (icon, hasFocus) {
        if (this._iconShouldShowFocused(icon, true)) {
            if (icon.inline && this._supportsInlineIcons() && icon.text != null) {
                var linkElem = this._getIconLinkElement(icon);
                if (linkElem != null) {
                    var styleName = this.getIconStyle(icon, false, null, hasFocus);
                    if (styleName != null) linkElem.className = styleName;
                }
                return;
            }
            var img = this._getIconImgElement(icon);
            if (img != null) { 
                isc.Canvas._setImageURL(img, this.getIconURL(icon, false, null, hasFocus));
                var styleName = this.getIconStyle(icon, false, null, hasFocus);
                if (styleName != null) img.className = styleName;
            }
        }
    },

    //>	@method	formItem.elementBlur()
	// Handle a blur event from an element
	//		@group	event handling
	//<
	elementBlur : function () {  
		// if the item specified a prompt, clear it from the status bar since it no longer 
        // applies
		if (this.prompt) this.form.clearPrompt();
		
		// If we're showing icons on focus, we should hide them on blur.
		// We handle this in editorExit rather than blur: That ensures that if the user is tabbing
		// between sub-items of a containerItem or into an icon, etc, we don't hide
		// the icon on the sub-item's blur event (and then have to re-show it on focus).

        // if formatOnBlur is true, update the element value to apply 
        // the static formatter
        if (this.formatOnBlur) {
            var displayValue = this.getDisplayValue();
            this._setElementValue(displayValue, this._value);
        }
         
        // Update the className of our various bits of HTML to show focused state 
        if (this.showFocused) {
            this.updateState();
        }
        
        // If we're showing a valueIcon, we use the "Over" state to indicate focus - 
        // clear this if appropriate
        
        if (this._iconState == this._$Over) {
            this._iconState = null
            this._updateValueIcon(this.getValue());
        }
				

        // if there's a pending autoCompletion, accept it now
        // No need for 'focusAtEnd()' - the element will no longer have focus 
        this.acceptCompletion();
        
        // If necessary fire this.editorExit();
        this.checkForEditorExit();

		// if the item has a "blur" handler
		if (this.blur) {
			// CALLBACK API:  available variables:  "form,item"
			// Convert a string callback to a function
            this.convertToMethod("blur");
			return this.blur(this.form, this);
		}
		
		return true;
	},
	
	// Helper method - we got an onblur but focus may have moved to a sub-element within this
	// item (EG going to an icon).
	// Only fire editorExit if focus has actually gone elsewhere on the page.
	checkForEditorExit : function (delayed, fromFocusEvent) {
        
        if (!delayed) {
            isc.FormItem._pendingEditorExitCheck = this;
            this._delayedEditorExitCheck = this.delayCall("checkForEditorExit", [true]);
            return;
        }
        
        if (fromFocusEvent && this._delayedEditorExitCheck != null) {
            isc.Timer.clearTimeout(this._delayedEditorExitCheck);
        }
        // If we got this far, any delayedEditorExitCheck is no longer applicable.
        this._delayedEditorExitCheck = null;
        if (isc.FormItem._pendingEditorExitCheck == this) {
            isc.FormItem._pendingEditorExitCheck = null;
        }
        
        var sameForm = false;
        var activeElement = this.getActiveElement();
        if (activeElement != null) {
            
            var itemInfo = isc.DynamicForm._getItemInfoFromElement(activeElement);
            if (itemInfo != null) {
                var item = itemInfo.item;
                while (item) {
                    if (item == this) return;

                    // Check if focus moved to a sub-item of a container item.
                    if (item.parentItem == null) {
                        sameForm = (item.form == this.form);
                    }
                    item = item.parentItem;
                }
            }
        }
        
        if (this.form.hasFocus && !sameForm) {
            isc.EH.blurFocusCanvas(this.form, false);
        }
        this.handleEditorExit();
    },
    
    //> @method formItem.focusAfterItem()
    // Shifts focus to the next focusable element after this item, skipping any elements
    // nested inside the tabbing group for this item, such as sub-elements, nested canvases
    // in a CanvasItem, or icons.
    // <P>
    // This method makes use of the +link{TabIndexManager.shiftFocusAfterGroup()} method to request
    // focus be changed to the next registered entry. By default standard focusable 
    // SmartClient UI elements, including Canvases, FormItems, FormItemIcons, etc are
    // registered with the TabIndexManager in the appropriate order, and will accept focus
    // if +link{canvas.canFocus,focusable}, and not +link{formItem.disabled,disabled} or
    //  +link{canvas.showClickMask,masked}. 
    // <P>
    // Canvases support a similar method: +link{canvas.focusAfterGroup()}.
    // <P>
    // <b>NOTE: </b>Focusable elements created directly in the raw HTML bootstrap or 
    // by application code will not be passed focus by this method unless they have also been
    // explicitly registered with the TabIndexManager. See the +link{group:tabOrderOverview}
    // for more information.
    // @param forward (boolean) direction to shift focus - true to move forward, false to move
    //          backwards (as with a shift+tab interaction).
    // @group focus
    // @visibility external
    //<
    // We take a forward param here, unlike canvas.focusAfterGroup(). That makes sense as
    // we don't provide a direct equivalent to focusInPreviousElement() which exists for canvas
    // so there's no other way to shift focus backward.
    focusAfterItem : function (forward) {
        isc.TabIndexManager.shiftFocusAfterGroup(this.getID(), forward);
    },
    
    // _getCurrentFocusTargetID() - called from the DF method 'getFocusedTabIndexEntry'
    // to determine what registered entry with the TabIndexManager currently has focus
    
    _getCurrentFocusTargetID : function () {

        // If we're currently focused on an icon rather than our item, use the
        // icon ID
        var iconIndex = this.getFocusIconIndex(true),
            icon;
        if (iconIndex != null) {
            if (this._pickerIcon != null) {
                if (iconIndex == 0) icon = this._pickerIcon;
                else iconIndex--;
            }
            if (icon == null) icon = this.icons[iconIndex];
        }
        if (icon != null) return this.getTabIndexIdentifierForIcon(icon);
        
        // Default behavior - use our own ID which will cause focus to go to our element
        
        return this.getID();
    },        
        
    
    // This method may be called from DynamicForm.focusInNextTabElement()
    
    
    _focusInNextTabElement : function (forward) {
        return this.__focusInNextTabElement(forward, false);
        
    },
    
    // The 'withinItem' parameter is used by moveFocusWithinItem(), and ensures we
    // only shift focus within this item and its sub elements.
    
    __focusInNextTabElement : function (forward, withinItem) {

        // If we're a container-item and its in one of our sub-items we want to
        // start tabbing from there
        var currentTargetID = this._getCurrentFocusTargetID() || this.getID();
        var returnVal;
        if (withinItem) {
            returnVal = isc.TabIndexManager.shiftFocusWithinGroup(this.getID(), currentTargetID, forward);
        } else {
            returnVal = isc.TabIndexManager.shiftFocus(currentTargetID, forward);
        }
        return returnVal;
    },

    // notification when tabIndex is updated (having been assigned) by the
    // TabIndexManager
    autoTabIndexUpdated : function (ID) {
        if (this.form != null) {
            this.form.itemAutoTabIndexUpdated(ID);
        }
    },

    // notification when 'shiftFocus' on the TabIndexManager attempts to shift focus to this item.
    // Registration set up by DynamicForm
    syntheticShiftFocus : function (itemID) {
        if (!this.isValidTabStop()) return false;
        
        this.focusInItem();
        return true;
        
    },
    // largely copied from Canvas.js        
    isValidTabStop : function (isIcon) {
        
        if (!this.isDrawn() || !this.isVisible() || this.renderAsDisabled() || !this._canFocus() ||
            (!isIcon && !this._canFocusInTextBox()) || 
            this.getTabIndex() == -1) 
        {
            return false;
        }

        var mask= this.form._getTopHardMask();
        if (mask != null && isc.EH._targetIsMasked(this.form, this, null, mask)) return false;
        return true;
    },

    // notification when 'shiftFocus' on the TabIndexManager attempts to shift focus to
    // the pickerIcon.
    // Registration set up by setupPickerIconTabPosition
    pickerIconSyntheticShiftFocus : function () {
        if (!this.isValidTabStop(true)) return false;
        var icon = this._pickerIcon,
            canTabToIcons = (this.canTabToIcons == null && this.form != null) 
                            ? this.form.canTabToIcons : this.canTabToIcons;
        
        if (canTabToIcons != false &&
            icon && icon.visible && !icon.imgOnly &&
            icon.tabIndex != -1)
        {
            this.logInfo("Moving to picker icon", "syntheticTabIndex");

            // Found a visible icon after the last focus element - focus
            // in it and return.
            // This method will return false if it somehow failed to focus in the element
            // pass this back to TabIndexManager so we don't get stuck on the item
            // if this occurs
            return this.focusInIcon(icon);
        }
        return false;
    },
    // notification when 'shiftFocus' on the TabIndexManager attempts to shift focus to
    // the pickerIcon.
    // Registration set up by setupIconTabPosition
    iconSyntheticShiftFocus : function (iconID) {
        if (!this.isValidTabStop(true)) return false;
        
        var icon,
            canTabToIcons = (this.canTabToIcons == null && this.form != null) 
                            ? this.form.canTabToIcons : this.canTabToIcons;
        
        if (canTabToIcons != false && this.showIcons && this.icons != null) {
            var iconName = this.getIconFromTabIndexIdentifier(iconID),
                icon = iconName ? this.getIcon(iconName) : null;
       
            if (icon && icon.visible && !icon.imgOnly &&
                icon.tabIndex != -1) 
            {
                this.logInfo("Moving to icon:" + this.echo(icon), "syntheticTabIndex");
                // Found a visible icon after the last focus element - focus
                // in it and return.
                return this.focusInIcon(icon);
            }
        }
        if (icon == null) {
            this.logInfo("Synthetic ShiftFocus failed to find target icon matching ID:" 
                         + iconID, "syntheticTabIndex");
        }
        return false;
    },

    
    _moveFocusWithinItem : function (forward) {
        return this.__focusInNextTabElement(forward, true);
    },

    // Helper method to determine the index of the icon with focus (or null if no icon has 
    // focus) based on the focus'd HTML element 
    
    getFocusIconIndex : function (includePickerIcon) {
        var currentFocusElement = this._getCurrentFocusElement();
        var icons;
        if (includePickerIcon && this._pickerIcon != null) {
            icons = [this._pickerIcon];
            icons.addList(this.icons);
        } else {
            icons = this.icons;
        }
        if (currentFocusElement == null || icons == null || icons.length == 0) return null;
        for (var i = 0; i < icons.length; i++) {
            if (this._getIconLinkElement(icons[i]) == currentFocusElement) return i;
        }
        return null;
    },

    _$img:"img",
    _allowNativeTextSelection : function (event, itemInfo) {
        if (itemInfo.overTitle) return;
        // Allow mouseDown on icon to return true natively. This ensures
        // focus can go to the icon as expected.
        if (itemInfo.overIcon) {
            return true;
        }
        // Note that imgOnly icons and valueIcons won't set the "overIcon" attribute.
        // Explicitly check for the user attempting to select or drag an IMG tag
        if (event == null) event = isc.EH.lastEvent;
        if (event.nativeTarget && (event.nativeTarget.tagName && 
                        event.nativeTarget.tagName.toLowerCase() == this._$img))
            return false;

        // If canSelectText is false, disallow even if we're currently read-only
        if (this.canSelectText == false) return false;
        
        if (this.getCanEdit() == false) {
            var canSelectText = this.readOnlyCanSelectText;
            // Null or (old-style) boolean false = never allow
            if (!canSelectText) return false;
            // old style boolean true - disallow for 'disabled' appearance
            
            if (canSelectText === true) {
                canSelectText = ["static", "readOnly"];
            }
            return canSelectText.contains(this.getReadOnlyDisplay());
        }
        
        return true;
    },
    _allowNativeDrag : function (event, itemInfo) {
        // Suppress native dragging of icon images
        if (itemInfo.overIcon) {
            return false;
        }
        // Otherwise same as allowNativeTextSelection
        return this._allowNativeTextSelection(event, itemInfo);

    },    
    //> @attr formItem.canSelectText (boolean : true : IRW)
    // For items showing a text value, should the user be able to select the text in this item? 
    // <P>
    // For +link{formItem.canEdit,canEdit:false} items, see +link{formItem.readOnlyCanSelectText}
    //
	// @visibility external
	//<
	
    
	//> @attr formItem.readOnlyCanSelectText (Array of ReadOnlyDisplayAppearance : ["static", "readOnly"] : IRW)
	// For items showing a text value with +link{formItem.canEdit} set to false, 
	// should the user be able to select the text in the item?
    // <P>
    // Default behavior allows selection if +link{formItem.readOnlyDisplay} is 
    // <code>"static"</code> or <code>"readOnly"</code> [but not <code>"disabled"</code>].
    // Developers may add or remove ReadOnlyDisplayAppearance values to change this behavior.
    // <P>
    // Note that this does not apply to +link{formItem.disabled, disabled items}, 
    // where text selection is
    // never enabled
    // @visibility external
    //<
    
    
	readOnlyCanSelectText : ["static", "readOnly"],
    
    
    handleEditorExit : function () {
        // Don't crash if this is tripped post destroy somehow.
        if (!this.form) return;
        
        if (!this._hasEditorFocus) return;

        this._hasEditorFocus = null;

        
        if (!this._hasRedrawFocus(true)) {        
            this._setIconVisibilityForFocus(false);
        }
        
        var value = this.getValue();

        // validateOnExit if necessary.
        // _suppressValidateOnEditorExit flag introduced for ComboBoxItem where we have
        // 'completeOnTab' behavior, which completes based on teh values in the pickList for
        // the item. These values may be being fetched asynchronously meaning the completion can
        // occur after focus has truly left the field. In this case it doesn't make sense to 
        // validate the temp value that's entered while the fetch is occuring. 
        // Instead validate when the fetch completes and we perform tab auto-completion
        if (!this._suppressValidateOnEditorExit) this._performValidateOnEditorExit(value);

        // If implicitSaving and value in editor changed, call the parent form to save
        if (!this.form.implicitSaveInProgress && this.getImplicitSaveOnBlur()) {
            this.form.performImplicitSave(this, false);
        }

        // If we set up blocking errors, disallow the blur
        if (this.shouldDisallowEditorExit()) {
            this.focusInItem();
            return;
        }

        if (this.editorExit) this.editorExit(this.form, this, value);
    },

    getImplicitSave : function () {
        // Just bail if we've already been removed from our form
        
        if (this.form == null) return false;
        return !!(this.implicitSave != null ? this.implicitSave : this.form.implicitSave);
    },

    getImplicitSaveOnBlur : function () {
        if (this.form == null) return false;
        return !!(this.implicitSaveOnBlur != null ? 
            this.implicitSaveOnBlur : this.form.implicitSaveOnBlur);
    },

    // helper to validate() on editor exit if necessary.
    // Checks for this form not being in update mode or the value in the editor having changed since
    // editorEnter.
    // Fired from handleEditorExit
    // In ComboBoxItem we also fire this from 'fireTabCompletion()' in the case where we
    // had a delayed tab completion due to a pending fetch.
    _performValidateOnEditorExit : function (value) {

        if (this.form == null) return;
        
        var mustValidate = this.alwaysValidateOnExit || 
            ((this.validateOnExit || this.form.validateOnExit) &&
             (this._forceValidateOnExit ||
                (this.form.getSaveOperationType && this.form.getSaveOperationType() != "update")
                 || !this.compareValues(value, this._editorEnterValue)
             )
            );
        if (mustValidate) {

            this.validate(null, {exiting:true});

            this._forceValidateOnExit = null;
            this._editorEnterValue = null;
        }
          
        var rulesEngine = this.form.rulesEngine;
        if (rulesEngine != null) {
            rulesEngine.processEditorExit(this.form, this);
        }
    },
    
    
    // Documented in actionMethods
    handleEditorEnter : function () {
        if (isc.FormItem._pendingEditorExitCheck != null) {
            isc.FormItem._pendingEditorExitCheck.checkForEditorExit(true, true);
        }
        if (this._hasEditorFocus) return;
        this._hasEditorFocus = true;

        var value = this.getValue();
        // Save starting value for validateOnExit
        if (this.validateOnExit || this.form.validateOnExit) this._editorEnterValue = value;

        if (this.editorEnter) this.editorEnter(this.form, this, value);
        
        if (this.form.rulesEngine != null) {
            this.form.rulesEngine.processEditorEnter(this.form, this);
        }
    },

    
    _setupFocusCheck : function () {
        var formItem = this;
        this._nativeFocusCheckEvent = isc.Page.setEvent(
                isc.EH.MOUSE_UP, function () {
                    if (!formItem.destroyed) formItem._checkNativeFocus();
                });
        
    },
    _checkNativeFocus : function () {
        // clear out the event so we don't fire on future clicks
        isc.Page.clearEvent(isc.EH.MOUSE_UP, this._nativeFocusCheckEvent);
        delete this._nativeFocusCheckEvent;
        
        if (this.getActiveElement() == document.body) {
            //this.logWarn("Catching native focus issue");
            this.focusInItem()
        }
    },

    _manageCharacterInput : function () {
        return !!this.mask;
    },

    //isMultiLineEditor: false,
    getIsMultiLineEditor : function () { 
        // internal isMultiLineEditor is false for most items - used by LG
        return !!this.isMultiLineEditor; 
    },
    //hasInternalNavigation: false,
    getHasInternalNavigation : function () {
        // returns true if this item has builtin behaviors for the arrow keys
        return !!this.hasInternalNavigation;
    },

    // _willHandleInput / _handleInput
    
    _willHandleInput : function () {
        // Only returns true for supported browsers, and for items where we explicitly write out
        // an oninput handler.
        return false;
    },
    _handleInput : function () {   
        isc.EH._setThread("INP");
        this._handlingInput = true;
        this.__handleInput();
        this._handlingInput = false;
        isc.EH._clearThread();
    },
    __handleInput : function () {
        // If managing character input, changeOnKeypress is handled there.
        if (!this._manageCharacterInput()) {
            // If this 'input' event follows a cut/paste event, set the public
            // _isCutEvent/_isPasteEvent flags so dev code can make use of this information
            if (this._unhandledCutEvent) {
                this.logDebug("Native input event from cut", "cutpaste");
                this._isCutEvent = true;
            }
            delete this._unhandledCutEvent;
            if (this._unhandledPasteEvent) {
                this.logDebug("Native input event from paste", "cutpaste");
                this._isPasteEvent = true;
            }
            delete this._unhandledPasteEvent;
            if (this._isPasteEvent) {
                this.fireTransformPaste()
            }
            if (this.changeOnKeypress) {

                if (isc.Log.supportsOnError) {
                    this.updateValue(true);
                } else {
                    try {
                        this.updateValue(true);
                    } catch (e) {
                        isc.Log._reportJSError(e);
                        if (isc.Log.rethrowErrors) {
                            
                            throw e;;
                        }
                    }
                }
            } else {
                var elementValue = this.getElementValue();
                this._minimalUpdateValue(elementValue);
            }
            // clear cut/paste flags if set.
            delete this._isPasteEvent;
            delete this._isCutEvent;

        }
    },
    
    fireTransformPaste : function () {
        // shortcut - if transformPastedValue is unset we don't need to do a
        // transformation
        if (!this.transformPastedValue) return;
    
        var pastedValue = this._getPastedValue();
        if (pastedValue == null) return;
        
        
        var elementValue = this.getElementValue() || "";
        // After a paste the selection typically sits right after the pasted value
        var selectionStart = this.getSelectionRange()[0];
        
        var pasteIndex = this._pasteSelectionStart,
            supportsMultiline = this.supportsMultilineEntry; 
            
        // We want to replace the value between the original selection start and the current
        // cursor position with the (transformed) pasted text.
        // Sanity check that pasteIndex / selectionIndex are valid.
        
        if (pasteIndex == null || pasteIndex == -1 || selectionStart <= pasteIndex) {
            this.logWarn("Paste event occurred, but unable to determine " + 
                "pasted text position in element value. Skipping transformPastedValue()", 
                "cutpaste");
            
            return;
        }

        if (!supportsMultiline) {
            
            // If a multi line value was pasted into a single line item log a debug-level
            // notification. This doesn't typically actually matter but may be of interest.
            var crIndex = pastedValue.indexOf("\r"),
                lbIndex = pastedValue.indexOf("\n"),
                newlineIndex = crIndex >= 0 ? Math.min(crIndex, lbIndex) : lbIndex;
                
            if (newlineIndex >= 0) {
                this.logDebug("Multi-line paste into single-line item detected.", "cutpaste");
            }
        }

        var transformedValue = this.transformPastedValue(this, this.form, pastedValue);
        if (transformedValue != null && transformedValue != pastedValue) {
            // If a dev returns a multi-line value, let them know we can't predict the
            // outcome!
            if (!supportsMultiline && 
                (transformedValue.contains("\n") || transformedValue.contains("\r"))) 
            {
                this.logWarn("transformPastedValue() returned multi-line value. " +
                    "This is not supported for this item type. Value may be natively truncated or modified.",
                    "cutpaste");
            }
            var postCursorText =  elementValue.substring(selectionStart);
            
            this.setElementValue(elementValue.substring(0,pasteIndex) 
                                + transformedValue + postCursorText);
            
            var finalEV = this.getElementValue(),
                newCursorPosition = finalEV.lastIndexOf(postCursorText);
            if (newCursorPosition != -1) {
                this.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }
    },
    
    // Set to true for TextAreas
    supportsMultilineEntry:false,
    
    // This method returns the clipboard data value when the native pasteEvent ran.
    
    //_fixMaskAfterCutPaste 
    _getPastedValue : function () {
        return this._pastedValue
    },
    
    // Called when changeOnKeypress is false to minimally handle an 'input' event (i.e. no
    // change event is fired, but this gives us a chance to apply some behaviors that are
    // otherwise only done in the full updateValue() path).
    _minimalUpdateValue : function (elementValue) {
        // For a FormItem with a mask, length is not
        // enforced until blur. Otherwise the elementValue
        // at this point includes all mask characters and
        // therefore makes the length enforcement invalid.
        if (this.mask) return;

        var oldValue = this._lastMinimalUpdateValue;
        if (oldValue == null) oldValue = this._value;
        var trimmedValue = this._enforceLengthOnEdit(elementValue, oldValue);
        if (trimmedValue != elementValue) {
            this.setElementValue(trimmedValue);
            if (trimmedValue == oldValue) this._revertToPreChangeSelection();
        }
        // We need to be able to reset to the last element value, but
        // since we're not logically changing, we're not storing this as this._value
        this._lastMinimalUpdateValue = trimmedValue;
    },

    _handleSelect : function () {   
        isc.EH._setThread("SEL");
        this.__handleSelect();
        isc.EH._clearThread();
    },
    __handleSelect : isc.Class.NO_OP,

    // Native oncut / onpaste handlers
    // Fires before the value is pasted into the form item, so returning false would cancel the
    // paste. (We don't offer this option).
    
    _nativeCutPaste : function (element, item, isCut, nativeEvent) {
        this.logDebug("Native " + (isCut ? "oncut" : "onpaste") + " event received", "cutpaste");

        // remember the pasted value. We'll use this in downstream code to perform
        // transformPastedValue        
        if (!isCut) {
            
            var clipboardData = nativeEvent ? 
                                    nativeEvent.clipboardData || window.clipboardData 
                                            : window.clipboardData;
            if (clipboardData && clipboardData.getData) {
                this._pastedValue = clipboardData.getData(isc.Browser.isIE ? 'Text' : 'text/plain');
                this.logDebug("Native Paste event - got pasted value from clipboard data:" 
                    + this._pastedValue, "cutpaste");
                            
                // Also remember the current cursor position (or selection start)
                // This will simplify allowing the user to transform the pasted value
                // and reinserting the new value at the right spot.
                var selectionRange = this.getSelectionRange();
                if (selectionRange != null) {
                    this._pasteSelectionStart = selectionRange[0];
                }
            }
        }
        
        if (!this._willHandleInput()) {
            
            if (this.changeOnKeypress) {
                this._queueForUpdate(isCut, !isCut);
            } else {
                this._queueForMinimalUpdate(isCut, !isCut);
            }
        } else {
            // Set a flag indicating that we received a cut event.
            // The public change-handling flow will be fired in a separate thread from the
            // input event (or from a timer where handleInput is unsupported). We'll pick
            // up this flag there and give devs a way to check whether the change came from
            // a cut/paste.
            if (isCut) {
                this._unhandledCutEvent = true;
            } else {
                this._unhandledPasteEvent = true;
            }
                
        }
    },
    
    //> @attr formItem.supportsCutPasteEvents (boolean : false : IR)
    // Does the current formItem support native cut and paste events?
    // <P>
    // This attribute only applies to freeform text entry fields such as +link{TextItem} and
    // +link{TextAreaItem}, and only if +link{changeOnKeypress} is true. 
    // If true, developers can detect the user editing the value 
    // via cut or paste interactions (triggered from keyboard shortcuts or the native 
    // browser menu options) using the +link{formItem.isCutEvent()} and
    // +link{formItem.isPasteEvent()} methods. This allows custom cut/paste handling
    // to be added to the various change notification flow methods including 
    // +link{formItem.change()}, and
    // +link{formItem.transformInput()}.
    // @visibility external
    //<
    
    supportsCutPasteEvents:false,
    
    //> @method formItem.isCutEvent()
    // Is the user performing a native "cut" event to modify the value of a freeform text
    // field? This method may be invoked during change notification flow methods including 
    // +link{formItem.change()}, +link{formItem.changed()} and
    // +link{formItem.transformInput()}. See +link{formItem.supportsCutPasteEvents}.
    // @return (boolean) true if this is a cut event.
    // @visibility external
    //<
    isCutEvent : function () {
        return (!!this._isCutEvent);
    },

    //> @method formItem.isPasteEvent()
    // Is the user performing a native "paste" event to modify the value of a freeform text
    // field? This method may be invoked during change notification flow methods including 
    // +link{formItem.change()}, +link{formItem.changed()} and
    // +link{formItem.transformInput()}. See +link{formItem.supportsCutPasteEvents}.
    // @return (boolean) true if this is a cut event.
    // @visibility external
    //<
    isPasteEvent : function () {
        return (!!this._isPasteEvent);
    },
    
    

    // This is called by EventHandler.bubbleEvent - we make use of it to give the special
    // form item specific parameters to the keyPress string method, and to call 'itemKeyPress'
    // on the form.
    _$Tab:"Tab",
    handleKeyPress : function (event, eventInfo) {
        // if we don't have a form - we've presumably been removed from our form via a
        // 'setItems()' call since the native keyPress event
        
        if (!this.form) return;
        
        var targetInfo = this.form._getEventTargetItemInfo(event),
            keyName = event.keyName;

        // Fire iconKeyPress if approrpriate
        if (targetInfo.overIcon) {
            if (this._iconKeyPress(targetInfo.overIcon) == false) return false;
            
        // Only update value if focus was on the item itself (not on an icon)
        // Similarly only hideIconsOnKeypress if we were not focused on an icon
        } else {

            if (this.shouldDisallowEditorExit() && 
                this._editorExitKeys && this._editorExitKeys.contains(keyName)) 
            {
                return false;
            }
    
            // If we're changing on every keypress, set this up to happen asynchronously so
            // the new value is available
            
            if (!this._willHandleInput()) {
                if (this.changeOnKeypress) {
                    this._queueForUpdate();
                } else {
                    this._queueForMinimalUpdate();
                }
            // If our change handler will be tripped from 'handleInput' we still need
            // to remember the "pre change" selection here as by the time that method
            // fires, the element value, and cursor insertion point, has already changed.
            } else {
                this.rememberSelectionForUpdate();
            }
    
            // If hideIconsOnKeypress is true, we want to hide all the icons (gives the user more
            // space to type).
            // Only do this if this is not the Tab key (in which case the user is just navigating 
            // through the field), and the user is not currently focused on an icon's link element.
            
            if (this.hideIconsOnKeypress && keyName != this._$Tab) {
                this._hideIconsForKeypress();
            }
        }
        
        // Fire this.keyPress and this.form.itemKeyPress
        var characterValue = event.characterValue;
        var returnVal = this._fireKeyPressHandlers(this,this.form,keyName,characterValue);

        // Eat character keys / keys that "have meaning" to the item here.                
        if (returnVal !== false && this.shouldStopKeyPressBubbling(keyName, characterValue)) {
            returnVal = isc.EH.STOP_BUBBLING;
        }
        return returnVal;
        
    },
    
    // For keys that 'have meaning' to form items, we don't want to bubble them up to the form.
    // For example - we don't want to bubble Arrow_Up / Arrow_Down and cause the form, or
    // its parent to scroll around when you're trying to move around inside a text area.
    // return STOP_BUBBLING for those cases - this will prevent parent widgets from reacting to the
    // events without cancelling them
    // (And also avoid the form, or some parent from returning false, killing the native
    // browser behavior for the keypress)
    // Non character keys which modify content
    _formItemEditKeys:{
        "Backspace":true,
        "Delete":true
    },
    
    // Keys which navigate around within a free form text item.
    _formItemNavBackKeys:{
        "Arrow_Up":true,
        "Arrow_Left":true,
        "Home":true
    },
    _formItemNavFwdKeys:{
        "Arrow_Down":true,
        "Arrow_Right":true,
        "End":true
    },
    // Helper to return STOP_BUBBLING for any character value (plus "Backspace / Delete");
    // Set to true in TextItem / TextAreaItem.
    stopCharacterKeyPressBubbling:false,
    // Helper to return STOP_BUBBLING for arrow keys / home and end
    // Set to true in TextItem / TextAreaItem / NativeSelectItem.
    stopNavKeyPressBubbling:false,


    //> @method formItem.shouldStopKeyPressBubbling() [A]
    // Should some keypress event on this item be prevented from bubbling (such that
    // the containing form and ancestors do not receive the event).
    // <P>
    // This method is called after standard item keypress handlers when the user presses
    // a key while focused in this item. Returning true will suppress bubbling of the event
    // to the containing form. This is useful to avoid having the form react to key
    // events which "have meaning" to the focused item.
    // <P>
    // Default implementation varies by item type. In short character keys 
    // are suppressed for all editable fields, as are keys which will modify the 
    // current state of the field
    // ("Arrow" keys for moving around free form text editors, etc).
    // <P>
    // <smartclient>
    // Developers may override this method to allow the form to react to certain keypresses,
    // for example allowing scrolling of the form when the user presses the arrow keys, 
    // but they should be aware that doing so could lead to confusing user experience
    // if the keypress will also move the position of the caret within a text box (say).
    // </smartclient>
    // Note that when this method returns true, no +link{canvas.keyPress,keyPress} event
    // will fire on the form for the key pressed. However developers will still receive the
    // separate +link{dynamicForm.itemKeyPress} event.
    // @param keyName (KeyName) name of the key pressed
    // @param characterValue (number) If this was a character key, this is the numeric value
    //        for the character
    //
    // @return (boolean) return true to prevent bubbling of the pressed key.
    // @visibility external
    //<
    shouldStopKeyPressBubbling : function (keyName, characterValue) {
        // Always stop Tabs from bubbling
        if (keyName == "Tab") return true;
        
        // All character keys will have impact on the form item (this includes Enter, which is 
        // appropriate)
        // Avoid this on "Escape" keypress since we do want this to bubble so we can (for example)
        // dismiss on outside click.
        // Also avoid this on "Enter" keypress, because not doing so breaks saveOnEnter - 
        // TextAreaItem has special handling for this
        // Also avoid this if the Alt or Ctrl keys are down - "p" and "q" have meaning to a 
        // FormItem, Ctrl-P and Alt-Q do not
        var bubbleTheseKeys = [this._$Escape, this._$Enter];
        if (this.stopCharacterKeyPressBubbling && !this.isReadOnly() &&
            !isc.EH.ctrlKeyDown() && !isc.EH.altKeyDown() &&
            (this._formItemEditKeys[keyName] ||
             (characterValue != null && characterValue != 0 && (!bubbleTheseKeys.contains(keyName))) 
            ))
        {
            return true;
        }

        // Keys which move the caret around in a Text Box should be cancelled 
        // (unless we're already at the start or end of the text box.
        // This is also true of Ctrl-modified navigation keys, which have standard editing 
        // behavior in all browsers (Ctrl Up/Left/Home acts like Home, Ctrl Down/Right/End 
        // acts like End), but NOT Alt-modified navigation keys, which do have a standard
        // behavior, but it is a browser behavior, not something intrinsic to the editor 
        // (Alt-Left/Right emulate clicking the page backward / forward arrows)
        if (this.stopNavKeyPressBubbling && !isc.EH.altKeyDown()) {
            if (this._formItemNavBackKeys[keyName]) {
                if (!this._canSetSelectionRange()) {
                    return true;
                }

                var selection = this._selectionAtKeyDown || this.getSelectionRange();
                // Returning true will suppress form-level handling (and allow normal
                // caret-positioning to occur).
                // Do this unless the caret is entirely at the start of the string
                // in which case we can pass the event to the form (and allow it to scroll
                // if appropriate).
                if (selection) {
                    if (selection[0] == 0 && selection[1] == 0) {
                        return false;
                    }
                    return true;
                }
            }

            if (this._formItemNavFwdKeys[keyName]) {
                if (!this._canSetSelectionRange()) return true;

                var selection = this._selectionAtKeyDown || this.getSelectionRange();
                if (selection) {
                    var length = this.getElementValue().length;
                    if (selection[0] == length && selection[1] == length) return false;
                    return true;
                }
            }
        }
    },

    // _fireKeyPressHandlers - will fire item.keyPress and form.itemKeypress
    _fireKeyPressHandlers : function (item, form, keyName, characterValue) {
        if (this.keyPress != null && this.keyPress(item, form, keyName, characterValue) == false) {
            return false;
        }
        
        // it's possible for the keyPress handler to not return false, but to destroy the form
        // - for example an implementation that uses arrow_up/down to move the inline editor in
        // a ListGrid.
        if (!this.form) return false;

        // Let masked field handle keyPress
        
        if (this._maskKeyPress != null
            && this._maskKeyPress(item, form, keyName, characterValue) == false)
        {
            return false;
        }

        // itemKeyPress is a method fired on the form when an item receives a keypress.
        // Differs from "keyPress" on the form in that:
        // - the event is guaranteed to have come from a keypress in an item (not just a
        //   keypress on the form itself)
        // - it tells the form which item generated the event.
        // - itemKeyPress will not bubble up from the form to parent widgets as we're 
        //   calling it directly.
        
        // Don't fire itemKeypress directly from a sub item of a container item. The Container
        // is the logical form item as far as the form is concerned, and the developer can
        // get back to the sub item via event.keyTarget anyway, so wait for the keyPress to
        // bubble to the container and have that fire itemKeyPress at the form level.
        
        if (this.parentItem == null) {
            return this.form.handleItemKeyPress(item , keyName , characterValue);
        }
    },
    
    // If we're firing change on every keypress, we actually do this asynchronously on a timer
    // so that the value is available in the form item when change fires.
    
    _$delayedUpdate:"_delayedUpdate",
    _queueForUpdate : function (cutEvent,pasteEvent) {    
        if (this._pendingUpdate != null) {
            isc.Timer.clearTimeout(this._pendingUpdate);
            this._delayedUpdate();
        }
        this.rememberSelectionForUpdate();
        
        // Set the cut/paste events so we can make this information available to the
        // devs when the delayed update event actually fires.
        if (cutEvent) this._unhandledCutEvent = true;
        if (pasteEvent) this._unhandledPasteEvent = true;

        this._pendingUpdate = this.delayCall("_delayedUpdate", [], 0);
    },
    rememberSelectionForUpdate : function () {
        // If we're changing on keypress, remember the current insertion point, so that if
        // the change handler fires and returns FALSE, we can reset the cursor insertion point.
        
        if (this.maintainSelectionOnTransform && 
            (this._getAutoCompleteSetting() != this._$smart)) 
        {
            this._rememberPreChangeSelection();
        }
    },
    _delayedUpdate : function () {

        if (this._unhandledCutEvent) this._isCutEvent = true;
        delete this._unhandledCutEvent;
        if (this._unhandledPasteEvent) this._isPasteEvent = true;
        delete this._unhandledPasteEvent;
        if (this._isPasteEvent) {
            this.fireTransformPaste()
        }
        

        this.updateValue(true);
        this._clearPreChangeSelection();
        
        // clear cut/paste flags if set.
        delete this._isPasteEvent;
        delete this._isCutEvent;
    },
    
    // Similar logic for changeOnKeypress:false items
    _$delayedMinimalUpdate:"_delayedMinimalUpdate",
    _queueForMinimalUpdate : function (isCut, isPaste) {    
        if (this._pendingUpdate != null) {
            isc.Timer.clearTimeout(this._pendingUpdate);
            this._delayedUpdate(isCut,isPaste);
        }
        if (!this._pendingMinimalUpdate) {
            this.rememberSelectionForUpdate();
            this._pendingMinimalUpdate = 
                isc.Timer.setTimeout({target:this, methodName:this._$delayedMinimalUpdate}, 
                                                   0);
        }
        
        // Set the cut/paste events so we can make this information available to the
        // devs when the delayed minimal update event actually fires.
        if (isCut) this._unhandledCutEvent = true;
        if (isPaste) this._unhandledPasteEvent = true;
        
    },
    _delayedMinimalUpdate : function () {
        delete this._pendingMinimalUpdate;
        
        // Fire the paste transform logic here if necessary
        
        if (this._unhandledCutEvent) this._isCutEvent = true;
        delete this._unhandledCutEvent;
        if (this._unhandledPasteEvent) this._isPasteEvent = true;
        delete this._unhandledPasteEvent;
        if (this._isPasteEvent) {
            this.fireTransformPaste()
        }
        
        this._minimalUpdateValue(this.getElementValue());
        this._clearPreChangeSelection();

        // clear cut/paste flags if set.
        delete this._isPasteEvent;
        delete this._isCutEvent;        
                
    },
    

    // Helper methods for resetting the selection if a change handler triggered by a keyPress
    // returns false.
    _rememberPreChangeSelection : function () {
        if (!this._canSetSelectionRange()) return;

        
        var preChangeRange = this.getSelectionRange(true);
        if (preChangeRange) {
            this._preChangeStart = preChangeRange[0];
            this._preChangeEnd = preChangeRange[1];
        }
    },

    _revertToPreChangeSelection : function () {
        // No op if this change didn't come from a keypress
        if (this._preChangeStart == null) return;
        if (this._canSetSelectionRange()) {
            this.setSelectionRange(this._preChangeStart, this._preChangeEnd);
        }
    },
    _clearPreChangeSelection : function () {
        delete this._preChangeStart;
        delete this._preChangeEnd;
    },


    // HandleKeyDown overridden to mark the item dirty.
    // Also calls formItem.keyDown with appropriate parameters
    _$nonDataKeys: ["Tab", "Arrow_Up", "Arrow_Down", "Arrow_Left", "Arrow_Right", "Insert", 
                    "Home", "End", "Page_Up", "Page_Down", "Escape", "Shift", "Ctrl", "Alt"],
    handleKeyDown : function (event, eventInfo) {
        var keyName = event.keyName,
            nonData = this._$nonDataKeys.contains(keyName);

        // Mark the value as dirty if appropriate
        if (this.dirtyOnKeyDown && !nonData) {
            this._markValueAsDirty();
        } else {
            //isc.logWarn("Received " + keyName + " keyPress, leaving field clean!");
        }

        
        this._selectionAtKeyDown = this.getSelectionRange();
        
        var item = this, 
            form = this.form;

        // fire keyDown stringMethod
        if (this.keyDown != null && this.keyDown(item, form, keyName) == false) return false
	},

	//>	@method	formItem._itemValueIsDirty()	(IA)
	//      Is this form item marked as having a dirty value?
	//
    //      @return (boolean)   true if the value is marked as being dirty via the _valueIsDirty 
    //                          flag
	//<
    // Return this value from a method to allow overriding by container items
    _itemValueIsDirty : function () {        
        return this._valueIsDirty == true;
    },
    
    _markValueAsDirty : function () {
        this._valueIsDirty = true;
    },
    
    _markValueAsNotDirty : function () {
        this._valueIsDirty = false;
    },
    
    // handleKeyUp
    // Overridden to call this.keyUp with appropriate parameters.
    handleKeyUp : function (event, eventInfo) {
        // if we don't have a form - we've presumably been removed from our form via a
        // 'setItems()' call since the native keyUp event
        
        if (!this.form) return;

        var item = this, 
            form = this.form, 
            keyName = event.keyName;
        
        // Fire keyUp stringMethod
        if (this.keyUp != null && this.keyUp(item, form, keyName) == false) return false;
	},
    
    // Serialization
	// ----------------------------------------------------------------------------------------
    
	getSerializeableFields : function(removeFields, keepFields) {
        removeFields = removeFields || [];
		
        // form is a backref
		removeFields.addList(["form"]); 
		return this.Super("getSerializeableFields", [removeFields, keepFields], arguments);
	},
 
    // Element coordinates
	// ----------------------------------------------------------------------------------------
   
	// These are needed by elements that create Canvii that float in the vicinity of the item,
    // such as the ComboBox.
    //
    

    //>@method formItem.getLeft()
    // Returns the left coordinate of this form item in pixels. Note that this method
    // is only reliable after the item has been drawn.
    // @return (int) left coordinate within the form in pixels\
    // @group positioning,sizing
    // @visibility external
    //<
    getLeft : function () {
        var tableElement = this.isDrawn() ? this.getOuterElement() : null;
        if (tableElement == null) {
            var warning = "getLeft() Unable to determine position for " + 
                          (this.name == null ? "this item " : this.name) + ". ";
            if (this.isDrawn()) {
                warning += "This method is not supported by items of type " + this.getClass();
            } else {
                warning += "Position cannot be determined before the element is drawn"
            }
            warning += " - returning zero.";

            this.form.logWarn(warning);
            return 0;
        }
        return this._getElementLeft(tableElement);
    },

    getTitleLeft : function () {
        var titleElement = this.isDrawn() && this.form 
                                          ? isc.Element.get(this.form._getTitleCellID(this)) 
                                          : null;
        if (titleElement == null) {
            var warning = "getTitleLeft() Unable to determine position for " + 
                          (this.name == null ? "this item " : this.name) + ". ";
            if (this.isDrawn()) {
                warning += "This method is not supported by items of type " + this.getClass();
            } else {
                warning += "Position cannot be determined before the element is drawn"
            }
            warning += " - returning zero.";
            
            this.form.logWarn(warning);
            return 0;
        }
        return this._getElementLeft(titleElement);
    },

    // Separate out the method to get the position based on an HTML element.  This simplifies
    // overriding 'getLeft()' to look at something other than the result of this.getElement()
    // for items with no data element.
    _getElementLeft : function (element) {
        var currentNode = element.offsetParent,
            formElement = this.containerWidget.getClipHandle(),
            formParent = formElement.offsetParent,
            left = isc.Element.getOffsetLeft(element);

        // iterate up until we reach the targetElement, or the targetElement's offsetParent
        
        while (currentNode && currentNode != formElement && currentNode != formParent) {

            // Add the currentNode's offsetLeft - left w.r.t. its offsetParent
            left += isc.Element.getOffsetLeft(currentNode) 

            // Deduct the scrollLeft
            left -= (currentNode.scrollLeft || 0);
            // Add the border thickness 
            // (last offsetLeft relative to inside of border, this one relative to outside of border)
            var borderLeftWidth = parseInt(isc.Element.getComputedStyleAttribute(currentNode, "borderLeftWidth"));

            if (isc.isA.Number(borderLeftWidth)) left += borderLeftWidth;

            // getOffsetLeft() will give the distance from the outside of this element's margin
            // to the parent element -- we want the distance from the inside of the margin, so
            // add the margin thickness
            var marginLeftWidth = parseInt(isc.Element.getComputedStyleAttribute(currentNode, "marginLeft"));
            
            if (isc.isA.Number(marginLeftWidth)) left += marginLeftWidth;

            // Move up the DOM chain
            currentNode = currentNode.offsetParent;
        }

        // OffsetLeft from the last iteration was relative to the content of the offsetParent
        if (currentNode == formParent) {
            // deduct the targetElement's offsetLeft
            // No need to adjust for border / padding in this case
            left -= isc.Element.getOffsetLeft(formElement)
        }           

        return left;
    },

    _isValidIcon : function (icon) {
        return (icon != null && 
                (this.icons && this.icons.contains(icon) || 
                 this.showPickerIcon && this.getPickerIcon() == icon));
    },

    //>@method  getIconLeft()    (A)
    //  Returns the (offset) left-coordinate of an icon within its containing widget.
    //  @param  icon    (Object)    icon definition
    //  @return (number)    icon left position in px
    //  @visibility external    
    //<
    getIconLeft : function (icon) {
        // default to the first icon, if possible
        if (icon == null && this.icons != null && this.icons.getLength() > 0) icon = this.icons[0];
        else  if (!this._isValidIcon(icon)) {
            this.logWarn("getIconLeft() passed invalid icon:" + isc.Log.echoAll(icon));
            return null;
        }
        var element;
        if (icon.inline && this._supportsInlineIcons() && icon.text != null) {
            element = this._getIconLinkElement(icon);
        } else {
            element = this._getIconImgElement(icon);
        }
        if (element == null) {
            this.logWarn("getIconLeft() unable to return position of icon - " +
                         "this icon is not currently drawn into the page. Returning null");
            return null;
        }
        // Determine offsetLeft wrt containing widget
        return isc.Element.getLeftOffset(element, this.containerWidget.getClipHandle());
    },

    // Methods to get the rendered position of the form item.
    // Note that these rely on the standard nested table element format - if getInnerHTML() is
    // overridden these may need to also be overridden
    //>@method formItem.getTop()
    // Returns the top coordinate of the form item in pixels. Note that this method is only 
    // reliable after the item has been drawn out.
    // @return (int) top position in pixels
    // @group positioning,sizing
    // @visibility external
    //<
    getTop : function () {
        var element = this.isDrawn() ? this.getOuterElement() : null;
        if (element == null) {
            // We will not find an element if we are not drawn into the DOM, or if we don't 
            // have a data element.
            // In either case, bail with an appropriate warning.
            var warning = "getTop() Unable to determine position for " + 
                          (this.name == null ? "this item " : this.name) + ". ";
            if (this.isDrawn()) {
                warning += "This method is not supported by items of type " + this.getClass();
            } else {
                warning += "Position cannot be determined before the element is drawn"
            }
            warning += " - returning zero.";
            
            this.form.logWarn(warning);
            return 0;                              
        }   
        var top = this._getElementTop(element);     
        return top;
    },

    getTitleTop : function () {
        var titleElement = this.isDrawn() && this.form
                                          ? isc.Element.get(this.form._getTitleCellID(this)) 
                                          : null;
        if (titleElement == null) {
            var warning = "getTitleTop() Unable to determine position for " + 
                          (this.name == null ? "this item " : this.name) + ". ";
            if (this.isDrawn()) {
                warning += "This method is not supported by items of type " + this.getClass();
            } else {
                warning += "Position cannot be determined before the element is drawn"
            }
            warning += " - returning zero.";
            
            this.form.logWarn(warning);
            return 0;
        }
        return this._getElementTop(titleElement);
    },
    _getElementTop : function (element) {
        var formElement = this.containerWidget.getClipHandle(),
            formParent = formElement.offsetParent,
            currentNode = element.offsetParent,
            top = isc.Element.getOffsetTop(element)
        
        ;

        // iterate up until we reach the targetElement, or the targetElement's offsetParent
        // We could also check for documentBody to avoid crashing in the case where we were 
        // passed bad params.
        while (currentNode && currentNode != formElement && currentNode != formParent) {
            // Add the currentNode's offsetTop - top w.r.t. its offsetParent
            top += isc.Element.getOffsetTop(currentNode) 
            // Deduct the scroll top
            top -= (currentNode.scrollTop || 0);
            // Add the border thickness 
            // (last offsetTop relative to inside of border, this one relative to outside of border)
            
            var borderTopWidth = (isc.Browser.isMoz ? 0 :
                                  (isc.Browser.isIE ? 
                                    parseInt(currentNode.currentStyle.borderTopWidth) :
                                    parseInt(isc.Element.getComputedStyleAttribute(currentNode, 
                                                                                "borderTopWidth"))
                                  )
                                 );
                                                                                                            
            if (isc.isA.Number(borderTopWidth)) top += borderTopWidth;

            // getOffsetTop() will give the distance from the outside of this element's margin
            // to the parent element -- we want the distance from the inside of the margin, so
            // add the margin thickness
            
            var marginTopWidth = (isc.Browser.isIE ? 
                                    parseInt(currentNode.currentStyle.marginTop) :
                                    parseInt(isc.Element.getComputedStyleAttribute(currentNode, "marginTop")));
            if (isc.isA.Number(marginTopWidth)) top += marginTopWidth;

            // Move up the DOM chain
            currentNode = currentNode.offsetParent;
        }

        // OffsetTop from the last iteration was relative to the content of the offsetParent
        if (currentNode == formParent) {
            // deduct the targetElement's offsetTop
            // No need to adjust for border / padding in this case
            top -= isc.Element.getOffsetTop(formElement)
        }
        
        return top;
                      
    },

    //>@method  getIconTop()    (A)
    //  Returns the (offset) top-coordinate of an icon within its containing widget.
    //  @param  icon    (Object)    icon definition
    //  @return (number)    icon top position in px
    //  @visibility external    
    //<
    getIconTop : function (icon) {
        // default to the first icon, if possible
        if (icon == null && this.icons != null && this.icons.getLength() > 0) icon = this.icons[0];
        else if (!this._isValidIcon(icon)) {
            this.logWarn("getIconTop() passed invalid icon:" + isc.Log.echoAll(icon));
            return null;
        }
        var element;
        if (icon.inline && this._supportsInlineIcons() && icon.text != null) {
            element = this._getIconLinkElement(icon);
        } else {
            element = this._getIconImgElement(icon);
        }
        if (element == null) {
            this.logWarn("getIconTop() unable to return position of icon - " +
                         "this icon is not currently drawn into the page. Returning null");
            return null;
        }
        // Determine offsetTop wrt containing widget
        return isc.Element.getTopOffset(element, this.containerWidget.getClipHandle());
    },

    //> @method formItem.getPageLeft()
    // Returns the drawn page-left coordinate of this form item in pixels.
    // @return (int) page-left coordinate in px
    // @group positioning
    // @visibility external
    //<
    
    getPageLeft : function () {
        var cw = this.containerWidget;
        var adjustForRTL = (this.isRTL() && cw.overflow != isc.Canvas.VISIBLE);
        if (!adjustForRTL) {
            return this.getLeft() + 
                   ((this.containerWidget.getPageLeft() 
                        + this.containerWidget.getLeftMargin() 
                        + this.containerWidget.getLeftBorderSize())
                   - this.containerWidget.getScrollLeft());
        } else {
            var maxScroll = cw.getScrollRight();
            return this.getLeft() +
                (this.containerWidget.getPageLeft() 
                        + this.containerWidget.getLeftMargin() 
                        + this.containerWidget.getLeftBorderSize()
                        + (cw.vscrollOn ? cw.getScrollbarSize() : 0))
                - (cw.getScrollLeft() - maxScroll);
        }
    },

    //> @method formItem.getPageTop()
    // Returns the drawn page-top coordinate of this form item in pixels.
    // @return (int) page-top coordinate in px
    // @group positioning
    // @visibility external
    //<
    getPageTop : function () {
        return this.getTop() + 
                ((this.containerWidget.getPageTop() 
                    + this.containerWidget.getTopMargin() 
                    + this.containerWidget.getTopBorderSize())
                - this.containerWidget.getScrollTop());
    },

    getTitlePageLeft : function () {
        return this.getTitleLeft() + 
               ((this.containerWidget.getPageLeft() 
                    + this.containerWidget.getLeftMargin() 
                    + this.containerWidget.getLeftBorderSize())
                - this.containerWidget.getScrollLeft());
    },
    getTitlePageTop : function () {
        return this.getTitleTop() + 
                ((this.containerWidget.getPageTop() 
                    + this.containerWidget.getTopMargin() 
                    + this.containerWidget.getTopBorderSize())
                - this.containerWidget.getScrollTop());
    },

    //>@method  getIconRect()    (A)
    //  Returns the size / position of an icon with respect to the widget rendering out the
    //  form item as an array of coordinates.
    //  @param  icon    (Object)    icon definition for the icon you want to determine the 
    //                              position of (defaults to first icon in this.icons).
    //
    //  @return (Array)    four element array representing the Left, Top, Width, and Height of
    //                      the icon in px.
    //  @visibility external
    //<
	getIconRect : function (icon) {
        // if the icon param is empty, it will be defaulted to the first icon by each of the
        // getIcon...() methods.
        return [this.getIconLeft(icon), 
                this.getIconTop(icon), 
                this.getIconWidth(icon), 
                this.getIconHeight(icon)];
    },

    //>@method  getIconPageRect()    (A)
    //  Returns the size / position of an icon on the page as an array of coordinates.
    //  @param  icon    (Object)    icon definition for the icon you want to determine the 
    //                              position of (defaults to first icon in this.icons).
    //
    //  @return (Array)    four element array representing the Left, Top, Width, and Height of
    //                      the icon in px.
    //  @visibility external
    //<
    getIconPageRect : function (icon) {
        var rect = this.getIconRect(icon);
        rect[0] += this.containerWidget.getPageLeft();
        rect[1] += this.containerWidget.getPageTop();
        return rect;
    },
    
    
    // Mark the form for redraw if 'setProperties()' is called passing in
    // any properties that would effect the layout of the form.
    // Call 'updateState()' if setProperties modifies any properties that would effect the
    // styling of the form item elements
    _relayoutProperties : {
        colSpan:true,
        rowSpan:true,
        startRow:true,
        endRow:true,
        showTitle:true,
        showHint:true
    },
    _stylingProperties:{
        baseStyle:true,
        //showDisabled:true // handled by explicit setShowDisabled method
        showFocused:true,
        showErrorStyle:true,
        controlStyle:true,
        pickerIconStyle:true,
        textBoxStyle:true
    },
    _ruleCriteriaProperties:{
        readOnlyWhen:true,
        visibleWhen:true,
        requiredWhen:true,
        formula:true,
        textFormula:true
    },
    _$itemCellStyle:"itemCellStyle",
    propertyChanged : function (prop, val) {
        if (this.destroyed) return;
        if (this._relayoutProperties[prop] == true) this._requiresFormRedraw = true;
        if (this._stylingProperties[prop] == true) this.updateState();
        if (this._ruleCriteriaProperties[prop] == true && this.form) this.form._updateItemWhenRule(this, prop);
        if (prop == this._$itemCellStyle && this.items) {
            for (var i = 0; i< this.items.length; i++) {
                this.items[i].updateState();
            }
        }
    },
    
    doneSettingProperties : function () {
        if (this._requiresFormRedraw) {
            var form = this.form, items = form.items;
            
            items._rowTable = null;
            form.markForRedraw();
        }
        delete this._requiresFormRedraw;
    },
    
    // Expression parsing

    //> @attr formItem.allowExpressions (boolean : null : IRW)
    // For a form that produces filter criteria
    // (see +link{dynamicForm.getValuesAsCriteria,form.getValuesAsCriteria()}), allows the user
    // to type in simple expressions to cause filtering with that operator.  For
    // example, entering "&gt;5" means values greater than 5, and "&gt;0 and &lt;5" means values between
    // 0 and 5.
    // <P>
    // The following table lists character sequences that can be entered as a prefix to a value, 
    // and the corresponding +link{OperatorId,operator} that will be used. 
    // <P>
    // <table style='font-size:14;'>
    // <tr><td><b>Prefix</b></td><td><b>Operator</b></td></tr>
    // <tr><td>&lt;</td><td>lessThan</td></tr>
    // <tr><td>&gt;</td><td>greaterThan</td></tr>
    // <tr><td>&lt;=</td><td>lessThanOrEqual</td></tr>
    // <tr><td>&gt;=</td><td>greaterThanOrEqual</td></tr>
    // <tr><td>someValue...someValue</td><td>betweenInclusive</td></tr>
    // <tr><td>!</td><td>notEqual</td></tr>
    // <tr><td>^</td><td>startsWith</td></tr>
    // <tr><td>|</td><td>endsWith</td></tr>
    // <tr><td>!^</td><td>notStartsWith plus logical not</td></tr>
    // <tr><td>!@</td><td>notEndsWith plus logical not</td></tr>
    // <tr><td>~</td><td>contains</td></tr>
    // <tr><td>!~</td><td>notContains</td></tr>
    // <tr><td>$</td><td>isBlank</td></tr>
    // <tr><td>!$</td><td>notBlank</td></tr>
    // <tr><td>#</td><td>isNull</td></tr>
    // <tr><td>!#</td><td>isNotNull</td></tr>
    // <tr><td>==</td><td>exact match (for fields where 'contains' is the default)</td></tr>
    // </table>
    // <P>
    // Two further special notations are allowed:
    // <ul>
    // <li> /<i>regex</i>/ means the value is taken as a regular expression and applied via the
    // "regexp" operator
    // <li> =.<i>fieldName</i> means the value should match the value of another field.  Either the
    // user-visible title of the field (field.title) or the field's name (field.name) may be used.
    // </ul>
    // <P>
    // In all cases, if an operator is disallowed for the field (via
    // +link{dataSourceField.validOperators,field.validOperators} at either the dataSource or field
    // level), the operator character is ignored (treated as part of a literal value).
    // <P>
    // By default, the case-insensitive version of the operator is used (eg, startsWith will
    // actually use "iStartsWith").  To avoid this, explicitly set item.operator (the default
    // operator) to any case sensitive operator (eg "equals" or "contains") and case sensitive
    // operators will be used for user-entered expressions.
    // <P>
    // Compound expressions (including "and" and "or") are allowed only for numeric or date/time
    // types.
    // <P>
    // Note that if the user does not type a prefix or use other special notation as described
    // above, the operator specified via +link{formItem.operator} is used, or if
    // <code>formItem.operator</code> is unspecified, a default operator chosen as described
    // under +link{formItem.operator}.  
    // <p>
    // Also note that whatever you enter will be used literally, including any whitespace
    // characters. For example if you input '== China ' then ' China ' will be the value.
    // <p>
    // The <code>allowExpression</code> behavior can be enabled for every field in a form via
    // +link{dynamicForm.allowExpressions}.
    // <P>
    // Finally, note that, like +link{formItem.operator}, enabling
    // <code>allowExpressions:true</code> causes
    // +link{dynamicForm.getValuesAsCriteria,form.getValuesAsCriteria()}) to return
    // +link{AdvancedCriteria}.
    //
    // @group advancedFilter
    // @visibility external
    //<
    

    //> @attr formItem.validOperators (Array of OperatorId : null : IR)
    // Array of valid filtering operators (eg "greaterThan") that are legal for this FormItem.
    // <P>
    // Applies only to form/formItem when +link{formItem.allowExpressions} is true, allowing the
    // user to input expressions.
    // @group advancedFilter
    // @visibility external
    //<

    //> @attr formItem.defaultOperator (OperatorId : null : IR)
    // The default search-operator for this item when it or its form allow 
    // +link{formItem.allowExpressions, filter-expressions}.
    // @group advancedFilter
    // @visibility external
    //<
    
    // the default "between" operator to use when the expression-symbol is "..."
    defaultBetweenOperator: "iBetweenInclusive",
    
    
    parseValueExpressions : function (value, fieldName, operator) {
        var type = this.getType(),
            typeInheritsFromTime = isc.SimpleType.inheritsFrom(type, "time"),
            typeIsNumeric = (isc.SimpleType.inheritsFrom(type, "integer") ||
                isc.SimpleType.inheritsFrom(type, "float")),
            isValidLogicType = (isc.SimpleType.inheritsFrom(type, "date") ||
                isc.SimpleType.inheritsFrom(type, "datetime") ||
                typeInheritsFromTime || typeIsNumeric
            ),
            opIndex = isc.DynamicForm.getOperatorIndex(),
            validOps = isc.getKeys(opIndex),
            result = { operator: "and", criteria: [] },
            crit = result.criteria,
            valueParts = [],
            allowEx = this._shouldAllowExpressions(),
            ds = isc.DS.get(this.form.expressionDataSource || this.form.dataSource)
        ;

        if (!value) value = this.getValue();
        if (!value) return;

        if (!isc.isA.String(value)) value += "";

        if (typeInheritsFromTime) {
            value = isc.Time._prepForParseValueExpressions(value);
        }

        if (isc.isAn.Object(operator)) operator = operator.ID;
        var operatorObj = isc.DataSource._operators[operator];

        // if the passed operator (ie the current one, before this method parses the new value)
        // is a specialist operator but its required components are not in the passed value
        // string, switch the filter operation to whatever is the default for the item.  Eg,
        // if the field has an "or" filter-expression, like "< 100 or > 1000", and you overtype 
        // that filter value with just "100", the field will switch to its defaultOperator, 
        // because "100" isn't valid for an "or" crit.  Also applies to between operators "..."
        var defOpName = this.getOperator();
        if (operatorObj) {
            if (operatorObj.symbol == "..." && !value.contains("...")) {
                // if the operator is a between variant, but the value doesn't contain the between
                // symbol, use the formItem/type default op for this parse operation
                operator = this.getDefaultOperator();
                defOpName = operator;
            } else if (operatorObj.valueType == "criteria" && (""+value != "") && 
                    !value.contains(operatorObj.symbol)) {
                operator = this.getDefaultOperator();
                defOpName = operator;
            }
        }

        if (defOpName) validOps.add(defOpName);

        var defOp = ds ? ds.getSearchOperator(operator || defOpName) : 
                { ID: (operator || defOpName) };
        
        var insensitive = defOp.caseInsensitive;
        
        if (isValidLogicType && value.contains(" and ")) {
            valueParts = value.split(" and ");
        } else if (isValidLogicType && value.contains(" or ")) {
            valueParts = value.split(" or ");
            result.operator = "or";
        } else if (value.contains("...")) {
            if (operatorObj.symbol != "...") {
                // only default a between-op if the operator passed isn't a between op
                if (isValidLogicType) {
                    if (isc.SimpleType.inheritsFrom(this.type, "text")) {
                        operator = "iBetweenInclusive";
                    } else {
                        operator = "betweenInclusive";
                    }
                }
            }
            valueParts = value.split("...");
            if (valueParts.length == 2) {
                var tempOps = opIndex["..."] || [];
                
                if (!operator || !tempOps.getProperty("ID").contains(operator)) {
                    
                    if (!operator) {
                        this.logWarn("No operator passed for 'between' expression for item '" + 
                            this.name + "' - using defaultBetweenOperator: " +
                            this.defaultBetweenOperator);
                    } else {
                        this.logInfo("Invalid 'between' operator for item '" + 
                            this.name + "' - using defaultBetweenOperator: " +
                            this.defaultBetweenOperator);
                    }
                    operator = this.defaultBetweenOperator;
                }
                var tempOp = tempOps.find("ID", operator);

                if (!tempOp) {
                    
                    this.logWarn("unexpected auto-detection of 'between' operator for item '" + 
                        this.name + "' - this is unexpected...");
                    var opSuffix = (operator.startsWith("i") ? operator.substring(1) :
                        operator).toLowerCase()
                    ;
                    for (var o=0; o<tempOps.length; o++) {
                        var tempOpSuffix = (tempOps[o].ID.startsWith("i") ? 
                                tempOps[o].ID.substring(1) : tempOps[o].ID).toLowerCase()

                        if (insensitive == tempOps[o].caseInsensitive) {
                            // there are 4 between variants - so we want to match both 
                            // case-sensitivity *and* a portion of the ID
                            if (tempOpSuffix == opSuffix) {
                                tempOp = tempOps[o];
                                break;
                            }
                        }
                    }
                    if (!tempOp) tempOp = tempOps[0];
                }

                var field = ds ? ds.getField(fieldName) : null;
                if (field) {
                    if (typeIsNumeric) {
                        
		                valueParts[0] = this._parseDisplayValue(valueParts[0], true);
		                valueParts[1] = this._parseDisplayValue(valueParts[1], true);
                    } else if (isc.SimpleType.inheritsFrom(field.type, "date") || 
                               isc.SimpleType.inheritsFrom(field.type, "datetime")) 
                    {
                        valueParts[0] = new Date(Date.parse(valueParts[0]));
                        valueParts[0].logicalDate = true;
                        valueParts[1] = new Date(Date.parse(valueParts[1]));
                        valueParts[1].logicalDate = true;
                    } else if (isc.SimpleType.inheritsFrom(field.type, "time")) {
                        var baseDatetime = isc.Time.createLogicalTime(0, 0, 0, 0);
                        valueParts[0] = isc.Time.parseInput(valueParts[0], false, false, false, baseDatetime);
                        baseDatetime.setSeconds(59, 999);
                        valueParts[1] = isc.Time.parseInput(valueParts[1], false, false, false, baseDatetime);
                    } else if (field.type == "text") {
                        
                        if (!valueParts[1].endsWith(this._betweenInclusiveEndCrit)) {
                            valueParts[1] += this._betweenInclusiveEndCrit;
                        }
                    }
                }

                return { fieldName: fieldName, operator: tempOp.ID, 
                    start: valueParts[0], end: valueParts[1] };
            }
        } else {
            valueParts = [value];
        }

        var skipTheseOps = [ " and ", " or " ];

        for (var i=0; i<valueParts.length; i++) {
            var valuePart = valueParts[i],
                subCrit = { fieldName: fieldName }
                field = ds ? ds.getField(fieldName) : null,
                isDateField = (field ? 
                    field.type && 
                    (isc.SimpleType.inheritsFrom(field.type, "date") || isc.SimpleType.inheritsFrom(field.type, "datetime")) 
                                    : false),
                isTimeField = (field ? field.type && isc.SimpleType.inheritsFrom(field.type, "time") : false),
                valueHasExpression = false
            ;
            
            var exactMatchKey = null;
            // Looking for exact operator match, if we will found it we should consider only this
            // operator
            for (var key in opIndex) {
                if (!key) continue;
                if (isc.isA.String(valuePart) && valuePart.startsWith(key)) {
                    exactMatchKey = key;
                    break;
                }
            }

            for (var symbol in opIndex) {
                if (!symbol) continue;
                if (exactMatchKey && symbol != exactMatchKey) continue;
                
                // "ops" is the array of operators that use the associated symbol
                var ops = opIndex[symbol].duplicate(),
                    wildCard = false,
                    op = null
                ;

                if (key == "==" && isc.isA.String(valuePart) && valuePart.startsWith("=") && 
                        !valuePart.startsWith("==") && !valuePart.startsWith("=(")) 
                {
                    wildCard = true;
                }

                
                if (ops && ops.length) {
                    // at least one operator associated with this "symbol"
                    if (ops.length == 1) {
                        // only one op for this symbol - use it
                        op = ops[0];
                    } else {
                        var localOps = [];
                        for (var kk = 0; kk < ops.length; kk++) {
                            var opt = ops[kk];
                            // ensure there's a value for the caseInsensitive flag
                            if (!isc.propertyDefined(opt, "caseInsensitive")) opt.caseInsensitive = false;
                            // add the operator
                            localOps.add(opt);
                        }
                        
                        if (localOps.length == 1) {
                            op = localOps[0];
                        } else if (localOps.length > 1) {
                            for (var jj = 0; jj < localOps.length; jj++) {
                                if (localOps[jj].caseInsensitive == insensitive) {
                                    //return if correct case-sensitivity
                                    op = localOps[jj];
                                    break;
                                }
                            }
                            if (!op) op = localOps[0];
                        }
                    }
                }                

                if (!op || !op.symbol || skipTheseOps.contains(op.symbol)) {
                    continue;
                }
                
                if (validOps.contains(op.symbol) && 
                        ((isc.isA.String(valuePart) && (valuePart.startsWith(op.symbol) || 
                            
                            (op.symbol == "..." && valuePart.contains(op.symbol)))
                        ) 
                        || wildCard))
                {
                    valueHasExpression = true;
                
                    if (valuePart.startsWith(op.symbol)) {
                        valuePart = valuePart.substring(op.symbol.length - (wildCard ? 1 : 0));
                    }

                    if (op.closingSymbol) {
                        // this is a containing operator (inSet, notInSet), with opening and 
                        // closing symbols...  check that the value endsWith the correct 
                        // closing symbol and strip it off - op.processValue() will split 
                        // the string for us later
                        if (valuePart.endsWith(op.closingSymbol)) {
                            valuePart = valuePart.substring(0, valuePart.length - op.closingSymbol.length);
                        }
                    }

                    if (valuePart.contains("...")) {
                        // allow range operators as well as conjunctives
                        var rangeValueParts = valuePart.split("...");
                        if (rangeValueParts.length == 2) {
                            var tempOps = opIndex["..."],
                                tempOp;

                            if (tempOps) tempOp = (insensitive ? tempOps.find("caseInsensitive", true) : tempOps[0]);

                            var field = ds ? ds.getField(fieldName) : null;

                            if (field) {
                                if (isc.SimpleType.inheritsFrom(field.type, "date") ||
                                    isc.SimpleType.inheritsFrom(field.type, "datetime")) 
                                {
                                    rangeValueParts[0] = new Date(Date.parse(rangeValueParts[0]));
                                    rangeValueParts[0].logicalDate = true;
                                    rangeValueParts[1] = new Date(Date.parse(rangeValueParts[1]));
                                    rangeValueParts[1].logicalDate = true;
                                } else if (isc.SimpleType.inheritsFrom(field.type, "time")) {
                                    var baseDatetime = isc.Time.createLogicalTime(0, 0, 0, 0);
                                    rangeValueParts[0] = isc.Time.parseInput(rangeValueParts[0], false, false, false, baseDatetime);
                                    baseDatetime.setSeconds(59, 999);
                                    rangeValueParts[1] = isc.Time.parseInput(rangeValueParts[1], false, false, false, baseDatetime);
                                } else if (field.type == "text") {
                                    
                                    if (!rangeValueParts[1].endsWith(this._betweenInclusiveEndCrit)) {
                                        rangeValueParts[1] += this._betweenInclusiveEndCrit;
                                    }
                                }
                            }

                            result.criteria.add({ fieldName: fieldName, operator: tempOp.ID, 
                                start: rangeValueParts[0], end: rangeValueParts[1] 
                            });

                            continue;
                        }
                    }

                    if (isDateField) {
                        valuePart = new Date(Date.parse(valuePart));
                        valuePart.logicalDate = true;
                    } else if (isTimeField) {
                        var baseDatetime = null;

                        // lessThan, lessOrEqual
                        if (op.upperBounds) {
                            if (op.inclusive) baseDatetime = isc.Time.createLogicalTime(0, 0, 59, 999);
                            else baseDatetime = isc.Time.createLogicalTime(0, 0, 0, 0);

                        // greaterThan, greaterOrEqual
                        } else if (op.lowerBounds) {
                            if (op.inclusive) baseDatetime = isc.Time.createLogicalTime(0, 0, 0, 0);
                            else baseDatetime = isc.Time.createLogicalTime(0, 0, 59, 999);
                        }

                        valuePart = isc.Time.parseInput(valuePart, false, false, false, baseDatetime);
                    } else {
                        valuePart = this._parseDisplayValue(valuePart, !typeIsNumeric);
                    }

                    subCrit.operator = op.ID;

                    if (op.processValue) {
                        valuePart = op.processValue(valuePart, ds);
                    }

                    if (op.wildCard && isc.isA.String(valuePart) && valuePart.contains(op.wildCard)) {
                        // this is an operator that supports wildCards (equals, notEquals)...
                        

                        // Convert the existing wildcard characters into something the DataSource
                        // will understand, namely the DataSource.patternMultiWildcard value.
                        var matchesPatternWildcard = ds ? ds.patternMultiWildcard : "*";
                        matchesPatternWildcard = isc.isA.Array(matchesPatternWildcard) ? matchesPatternWildcard[0] : matchesPatternWildcard;
                        var convertedValue = valuePart.replaceAll(op.wildCard, matchesPatternWildcard);

                        // Add the matchesPattern criteria and let the DataSource handle the
                        // conversion from here.
                        var op = insensitive ? "iMatchesPattern" : "matchesPattern";
                        if (operator) {
                            op = operator;
                        }
                        result.criteria.add({
                            operator: op,
                            fieldName: fieldName,
                            value: convertedValue
                        });

                        subCrit.operator = null;
                        this._lastValueHadWildCards = true;
                    } else {
                        // set the value if one is required for the op
                        if (op.valueType != "none") subCrit.value = valuePart;
                    }

                    break;
                }
                
            }
            if (!valueHasExpression) {
                // this was a straight expression like "10" - use the current (or default) op
                subCrit.operator = defOpName;
                var someOp = isc.DS._operators[defOpName];
                if (someOp.processValue) {
                    // valuePart might be multiple valueSeparator-separated values
                    subCrit.value = someOp.processValue(valuePart, ds)
                } else {
                    subCrit.value = this._parseDisplayValue(valuePart, true);
                }
            }
            if (subCrit.operator) result.criteria.add(subCrit);
        }
        if (result.criteria.length == 1) result = result.criteria[0];
        if (result.criteria && result.criteria.length == 0) result = null;
        // if there's a criteria array but no constructor, mark the result as AdvancedCriteria
        // so the criteria round-trips properly
        if (result.criteria && !result._constructor) result._constructor = "AdvancedCriteria"; 
//        this.logWarn("Parsed expression:" + value + " to criterion:" + this.echo(result));

        return result;
    },

    flattenExpressionCriteria : function (crit) {
        var result = [];

        for (var i=0; i<crit.length; i++) {
            var subCrit = crit[i];

            if (!subCrit.criteria) {
                result.add(subCrit);
            } else {
                result.addList(this.flattenExpressionCriteria(subCrit.criteria))
            }
        }

        return result;
    },

    
    
    useWildCardsByDefault: true,
    _betweenInclusiveEndCrit: "ZZZZZZZZZZ",
    buildValueExpressions : function (advancedCriteria) {
        var fullCrit = advancedCriteria,
            crit = isc.shallowClone(fullCrit),
            defaultConjunctive = " " + crit.operator + " ",
            // we're going to support more than one identical conjunctive (like 10 or 20 or 30)
            // and also multiple "between" operators simultaneaously (like 10...20 and 20...30)
            conjunctives = [defaultConjunctive],
            values = [],
            result = "",
            ds = isc.DS.get(this.form.expressionDataSource || this.form.dataSource)
        ;

        if (fullCrit.criteria) {
            crit.criteria = this.flattenExpressionCriteria(fullCrit.criteria);
        } 

        var opIndex = isc.DynamicForm.getOperatorIndex(),
            opList = isc.getKeys(opIndex),
            validOps = this.getValidOperators()
        ;

        var defOpName = this.getOperator();
        if (defOpName) validOps.add(defOpName);

        var defOp = ds ? ds.getSearchOperator(defOpName) : { id: defOpName };

        var insensitive = defOp.caseInsensitive,
            hasWildCards = false,
            wildCard
        ;

        if (!crit.criteria) {
            var critArray = [ crit ];
            crit = { criteria: critArray };
        }

        var opsWithWildCards = ["startsWith", "iStartsWith", "contains", "iContains",
                "endsWith", "iEndsWith"
        ];
        
        if (this.useWildCardsByDefault && this.type == "text" && 
                (crit.criteria.length > 1 ||
                (crit.criteria.length == 1 && 
                    opsWithWildCards.contains(crit.criteria[0].operator) &&
                    crit.criteria[0].value && crit.criteria[0].value.startsWith("=") &&
                    !crit.criteria[0].value.startsWith("==") && !crit.criteria[0].value.startsWith("=(")
                ) || this._lastValueHadWildCards

            )) 
        {
            
            hasWildCards = true;
            var opSymbol = opIndex["=="];
            var equalsOp = opSymbol.find({ "ID": "equals" });
            wildCard = equalsOp.wildCard;
            conjunctives[0] = "";
        }
        
        var conjunctiveOffset=0;
        
        var betweenOps = ["between", "iBetween", "betweenInclusive", "iBetweenInclusive"];

        for (var i=0; i < crit.criteria.length; i++) {
            var subCrit = crit.criteria[i],
                subOp = subCrit.operator,
                value = subCrit.value,
                field = ds ? ds.getField(subCrit.fieldName) : null
            ;

            for (var j=0; j< opList.length; j++) {
                var opSymbol = opIndex[opList[j]];
                var tempOp = opSymbol.find({ "ID": subOp });
                if (tempOp) {
                    subOp = tempOp;
                    break;
                }
            }

            if (i>0) {
                conjunctives.add(defaultConjunctive);
            }

            if (isc.isA.String(subOp)) {
                this.logWarn("Unknown filter-expression operator: '" + subOp + "'");
            } else if (hasWildCards) {
                // we have wildCards
                if (subOp.ID == "contains" || subOp.ID == "iContains") {
                    if (values[values.length-1] != wildCard) values.add(wildCard);
                    values.add(subCrit.value);
                    values.add(wildCard);
                } else if (subOp.ID == "startsWith" || subOp.ID == "iStartsWith") {
                    values.add(subCrit.value);
                    values.add(wildCard);
                } else if (subOp.ID == "endsWith" || subOp.ID == "iEndsWith") {
                    if (values[values.length-1] != wildCard) values.add(wildCard);
                    values.add(subCrit.value);
                }
            } else if (subOp.ID == defOpName && !betweenOps.contains(subOp.ID)) {
                if(isc.isAn.Array(subCrit.value)) {
                    values.add(subCrit.value.join(subOp.valueSeparator));
                } else {
                    values.add(this._formatCriterionValue(subCrit.value));
                }
            } else if (betweenOps.contains(subOp.ID)) {
                if (crit.criteria.length > 1) conjunctives.addAt(subOp.symbol, conjunctiveOffset);
                else conjunctives[conjunctiveOffset] = subOp.symbol
                // make sure the ... conjunctive is in the correct place 
                conjunctiveOffset++;
                
                var endVal = subCrit.end;
                if (field && field.type == "text") {
                    if (endVal && endVal.endsWith(this._betweenInclusiveEndCrit)) {
                        endVal = endVal.replace(this._betweenInclusiveEndCrit, "");
                    }
                }
                var startVal = this._formatCriterionValue(subCrit.start);
                endVal = this._formatCriterionValue(endVal);
                if (startVal != endVal) values.addList([ startVal, endVal ]);
                else values.add(startVal);
            } else if (subOp.ID == "isBlank" || subOp.ID == "notBlank" ||
                       subOp.ID == "isNull" || subOp.ID == "notNull") {
                values.add(subOp.symbol);
            } else if (validOps.contains(subOp.ID)) {
                var op = subOp;
                if (isc.isAn.Array(value)) value = value.join(subOp.valueSeparator);
                if (op.ID != defOp) {
                    value = (op && op.symbol ? op.symbol : "") + this._formatCriterionValue(value);
                    if (op.closingSymbol) value += op.closingSymbol;
                }
                values.add(value);
            } else if (subOp.ID.startsWith("i")) {
                var otherOp = subOp.ID.substring(1),
                    initial = otherOp.charAt(0)
                ;
                otherOp = initial.toLowerCase() + otherOp.substring(1)
                if (validOps.contains(otherOp)) {
                    var op2 = opList.find("ID", otherOp);
                    if (op2.ID != defOp) {
                        value = (op && op.symbol ? op.symbol : "") + this._formatCriterionValue(value);
                        if (op.closingSymbol) value += op.closingSymbol;
                    }
                    values.add(value);
                }
            }
            
            
            conjunctiveOffset++;
        }

        if (hasWildCards) values.addAt("=", 0);
        
        if (conjunctives.length > 1) {
            // if the expression includes multiple expressions, the individual ones may also 
            // contain a between conjunctive - build the string up manually
            for (var i=0; i<values.length; i++) {
                result += values[i];
                if (i<values.length-1) result += conjunctives[i];
            }
        } else {
            result = values.join((values.length > 1 ? conjunctives[0] : ""));
        }

        delete this._lastValueHadWildCards;

        return result.length > 0 ? result : null;
    },
    
    enteredCompleteExpression : function () {
        var value = this._value;

        if (!isc.isA.String(value)) {
            // not a string, can't be parsed as an expression - return true
            this._hasExpression = true;
            return true;
        }

        if (this._hasExpression && (value == null || isc.isAn.emptyString(value))) {
            // the value *was* valid, but is now empty - this should be considered valid (cause a filter)
            delete this._hasExpression;
            return true;
        }
        
        var ds = isc.DS.get(this.form.expressionDataSource || this.form.dataSource),
            validOps = this.getValidOperators() || [],
            needsAValue = !["$", "!$", "#", "!#"].contains(value),
            hasExpression = true
        ;
        
        if (hasExpression && validOps.contains(value) && needsAValue) {
            // this is a recognized operator only - no value
            hasExpression = false;
        }
        
        if (hasExpression && value.contains("=(") && !value.contains(")")) {
            // opening bracket but no closing bracket
            hasExpression = false;
        }

        if (hasExpression && needsAValue) {
            var opList = isc.DS._operators;
            for (var j=0; j<validOps.length; j++) {
                var op = opList[validOps[j]];
                if (op.symbol && op.symbol.startsWith(value)) {
                    // this will deal with, for instance, "=", which is not a recognized op in 
                    // itself, but is the beginning of many different ones
                    hasExpression = false;
                    break;
                }
            }
        }

        this._hasExpression = hasExpression;
        return this._hasExpression;
    },

    _formatCriterionValue : function (value) {
        return String(value);
    },
    
    //> @method formItem.getValueAsFloat()
    // Return the value tracked by this form item as a Float.  If the value cannot
    // be parsed to a valid float, null will be returned.
    //
    // @return (Float) value of this element
    //
    // @see method:FormItem.getValue
    // @visibility external
    //<
    
    getValueAsFloat : function () {
        var origValue   = this.getValue(),
            parsedValue = null
        ;
        // if the data-type for this item is "localeFloat", use locale-sensitive parsing
        if (isc.SimpleType.inheritsFrom(this.type, "localeFloat")) {
            parsedValue = isc.NumberUtil.parseLocaleFloat(origValue);
        } else parsedValue = parseFloat(origValue);
        return isNaN(parsedValue) ? null : parsedValue;
    },
    mapFloatValueToDisplay : function (value) {
        // for FloatItem with _inEditorMode, and for StaticTextItems with type "float", we
        // want to apply special formatting - this code moved up from both of those classes
        if (isc.isA.StaticTextItem(this) || !this._inEditorMode) {
            var floatValue = null;
            if (isc.isA.String(value) && (this.type == null || !this.type.startsWith("locale"))) {
                var parsedValue = window.parseFloat(value);
                if (!window.isNaN(parsedValue) && parsedValue == value) {
                    floatValue = parsedValue;
                }
            } else if (isc.isA.Number(value)) {
                floatValue = value;
            }
            if (floatValue != null) {
                if (this.format) {
                    return isc.NumberUtil.format(floatValue, this.format);
                
                } else if (this._getFormattedNumberString &&
                    (this.decimalPrecision != null || this.decimalPad != null || this.precision))
                {
                    
                    var result = this._getFormattedNumberString(floatValue);
                    if (result) return result;
                } else if (this._simpleType != null && this._simpleType.normalDisplayFormatter != null) {
                    var form = this.form,
                        record = form ? form.values : {};
                    return this._simpleType.normalDisplayFormatter(value, this, form, record);
                }
            }
        }
    }
});

isc.FormItem.registerStringMethods({
	//>	@method formItem.showIf() (A)
	// Expression that's evaluated to see if an item should be dynamically hidden.
    // <p>
    // <code>showIf()</code> is evaluated whenever the form draws or redraws.
    // <P>
    // Note that explicit calls to +link{formItem.show()} or +link{formItem.hide()} will
    // will wipe out the <code>showIf</code> expression.
    // <p>
    // Alternatively, you can use +link{Criteria} to declare when a FormItem is
    // visible via +link{formItem.visibleWhen}.
    //
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @param	value   (Any)         current value of the form item
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param   values  (Object)      the current set of values for the form as a whole
    // @return (boolean) whether the item should be shown
    // 
    // @example formShowAndHide
    // @visibility external
	//<
    showIf : "item,value,form,values",

	//> @method formItem.defaultDynamicValue() (A)
    // Expression evaluated to determine the +link{FormItem.defaultValue} when no value is 
    // provided for this item.
    // <P>
    // <i>formItem.defaultDynamicValue</i> may be specified as a method or
    // +link{stringMethod,sting of script} to evaluate. It should return a calculated
    // default value for the item.
    // <P>
    // If you don't need dynamic evaluation, you can just use <code>item.defaultValue</code>.
    //
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param   values  (Object)      the current set of values for the form as a whole
    //
    // @return (Any) dynamically calculated default value for this item
    // 
    // @see attr:defaultValue
    // @group formValues
    // @visibility external
    //<
    defaultDynamicValue : "item,form,values",

    //> @method formItem.focus
    // Called when this FormItem receives focus.
    // 
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @group eventHandling
    // @visibility external
    //<
    focus : "form,item",

    //> @method formItem.blur
    // Called when this FormItem loses focus.
    // 
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @group eventHandling
    // @visibility external
    //<
    blur : "form,item",
    
        

    //> @method formItem.editorEnter()
    // Notification method fired when the user enters this formItem.
    // Differs from +link{formItem.focus()} in that while <code>focus</code> and <code>blur</code>
    // may fire multiple as the user navigates sub elements of an item (such as interacting
    // with a pick list), <code>editorEnter</code> will typically fire once when the user 
    // starts to edit this item as a whole, and once when the user moves onto a different
    // item or component
    // @param form (DynamicForm) form containing this item
    // @param item (FormItem) form item recieving focus
    // @param value (Any) current item value.
    // @group eventHandling
    // @visibility external
    //<
    editorEnter : "form,item,value",
    
    //> @method formItem.editorExit
    // Notification method fired when the user leaves this formItem.
    // Differs from +link{formItem.blur()} in that while <code>focus</code> and <code>blur</code>
    // may fire multiple as the user navigates sub elements of an item (such as interacting
    // with a pick list), <code>editorEnter</code> will typically fire once when the user 
    // starts to edit this item as a whole, and <code>editorExit</code> fires once when the 
    // user moves onto a different item or component
    // @param form (DynamicForm) form managing this form item
    // @param item (FormItem) pointer to the form item being managed
    // @param value (Any) current value of the form item
    // @group eventHandling
    // @visibility external
    //<
    editorExit : "form,item,value",
 
    //> @method formItem.click
    // Called when this FormItem is clicked on.
    // <P>
    // Note: <code>click()</code> is available on StaticTextItem, BlurbItems, ButtonItem, and
    // derivatives.  Other form items (such as HiddenItem) do not support <code>click()</code>.
    //
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @return (boolean) Return false to cancel the click event. This will prevent the event from
    //   bubbling up, suppressing
    //   +link{canvas.click,click} on the form containing this item.
    // @group eventHandling
    // @visibility external
    //<
    click : "form,item",

    //> @method formItem.doubleClick
    // Called when this FormItem is double-clicked.
    //
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @return (boolean) Return false to cancel the doubleClick event. This will prevent the event from
    //   bubbling up, suppressing
    //   +link{canvas.doubleClick,doubleClick} on the form containing this item.
    // @group eventHandling
    // @visibility external
    //<
    doubleClick : "form,item",

    //> @method formItem.showContextMenu
    // Called when the mouse is right-clicked anywhere in this formItem.  If the implementation
    // returns false, default browser behavior is cancelled.
    // <P> 
    // Note that it can be bad practice to cancel this method if the mouse is over the data 
    // element for the item, because doing so would replace the builtin browser-default menus 
    // that users may expect.  You can use +link{dynamicForm.getEventItemInfo} to return an 
    // +link{FormItemEventInfo, info object} that can be used to determine which part of the 
    // item is under the mouse.
    //
    // @param form (DynamicForm) the managing DynamicForm instance
    // @param item (FormItem) the form item itself (also available as "this")
    // @return (boolean) return false to cancel default behavior
    // @group eventHandling
    // @visibility external
    //<
    showContextMenu : "form,item",

    //> @method formItem.pickerIconClick()
    // Notification method called when the +link{showPickerIcon,picker icon} is clicked.
    // This method will fire after the +link{formItemIcon.click()} handler for the
    // +link{formItem.pickerIconProperties,pickerIcon}. If the event is not cancelled, 
    // the standard +link{formItem.iconClick()} will also fire.
    // <P>
    // The default implementation will call +link{showPicker()}.
    //
    // @param form (DynamicForm) the DynamicForm containing the picker icon's item.
    // @param item (FormItem) the FormItem containing the picker icon.
    // @param pickerIcon (FormItemIcon) the picker icon.
    // @return (boolean) Return false to cancel the event.
    // @group pickerIcon
    // @visibility external
    //<
    pickerIconClick : "form,item,pickerIcon",

    //> @method formItem.iconClick()
    //  Notification method called when the user clicks on a form item icon.
    //  <p>
    //  The icon's +link{FormItemIcon.click()} method if any is called first. Then, if the clicked
    //  icon is the +link{showPickerIcon,picker icon}, the +link{pickerIconClick()} method is
    //  called. Then, this method is called.
    //  <P>
    //  This event may be cancelled <smartclient>by returning false</smartclient> to 
    //  suppress the +link{formItem.click()} handler from also firing in response to the
    //  user interaction.
    // 
    //  @group  formIcons
    //  @visibility external
    //  @param form (DynamicForm)   a pointer to this item's form
    //  @param  item    (FormItem)  a pointer to this form item
    //  @param  icon    (FormItemIcon)  a pointer to the icon that received the click event.
    // @return (boolean) return false to cancel this event
    //<
    iconClick : "form,item,icon",    

    //> @method formItem.iconKeyPress()
    //      StringMethod.
    //      Default action to fire when an icon has keyboard focus and the user types a key.
    //      May be overridden by setting <code>keyPress</code> on the form item icon directly.
    //  @group  formIcons
    //  @visibility external
    //  @param keyName (KeyName) name of the key pressed
    //  @param character (Character) character produced by the keypress
    //  @param form (DynamicForm)   a pointer to this item's form
    //  @param  item    (FormItem)  a pointer to this form item
    //  @param  icon    (FormItemIcon)  a pointer to the icon that received the click event.
    //<
    iconKeyPress : "keyName,character,form,item,icon",    

    //> @method formItem.change()
    // Called when a FormItem's value is about to change as the result of user interaction.  This
    // method fires after the user performed an action that would change the value of this field,
    // but before the element itself is changed.  
    // <P>
    // Returning false cancels the change.  Note that if what you want to do is
    // <b>transform</b> the user's input, for example, automatically change separator
    // characters to a standard separator character, you should implement
    // +link{formItem.transformInput,transformInput} rather than using a combination of
    // change() and setValue() to accomplish the same thing.  Returning false from
    // <code>change</code> is intended for rejecting input entirely, such as typing invalid
    // characters.
    // <p>
    // Note that if you ask the form for the current value in this handler, you will get the old
    // value because the change has not yet been committed.  The new value is available as a
    // parameter to this method.
    // <p>
    // Change/Changed notifications vs <i>"...When"</i> rules: the <code>change</code> and
    // <code>changed</code> events only fire when an end user modifies a field value. 
    // If you are trying to dynamically control the visibility or enabled state of other 
    // components in response to these events, consider instead using properties 
    // such as +link{canvas.visibleWhen}, +link{formItem.readOnlyWhen,item.readOnlyWhen},
    // +link{canvas.enableWhen} on the target component. (Similar properties are 
    // available on +link{FormItem}, +link{Canvas}, +link{MenuItem} and other components).
    //
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @param   value   (Any)         The new value of the form item
    // @param   oldValue    (Any)     The previous value of the form item
    //
    // @return  (boolean) In your handler, return false to cancel the change, true to allow the change
    // @group eventHandling
    // @visibility external
    // @example fieldEnableDisable
    //<
    change : "form,item,value,oldValue",

    //> @method formItem.changed()
    // Called when a FormItem's value has been changed as the result of user interaction.  This
    // method fires after the newly specified value has been stored.
    // <p>
    // Change/Changed notifications vs <i>"...When"</i> rules: the <code>change</code> and
    // <code>changed</code> events only fire when an end user modifies a field value. 
    // If you are trying to dynamically control the visibility or enabled state of other 
    // components in response to these events, consider instead using properties 
    // such as +link{canvas.visibleWhen}, +link{formItem.readOnlyWhen,item.readOnlyWhen},
    // +link{canvas.enableWhen} on the target component. (Similar properties are 
    // available on +link{FormItem}, +link{Canvas}, +link{MenuItem} and other components).
    //
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @param   value   (Any)         The current value (after the change).
    // @group eventHandling
    // @visibility external
    //<
    changed : "form,item,value",

    //> @method formItem.pendingStatusChanged() (A)
    // Notification method called when +link{attr:showPending,showPending} is enabled and this
    // form item should either clear or show its "Pending" visual state.
    // <p>
    // The default behavior is that the +link{FormItem.titleStyle,titleStyle} and
    // +link{FormItem.cellStyle,cellStyle} are updated to include/exclude the "Pending" suffix.
    // Standard form item types may implement additional default behavior (see any item-specific
    // pendingStatusChanged() documentation). Returning <code>false</code> will cancel the default
    // behavior.
    // <p>
    // The pendingStatusChanged() notification method is typically used by +link{CanvasItem}-derived
    // form items, where a custom or supplemental pending visual state is desired.
    // @param form (DynamicForm) the managing <code>DynamicForm</code> instance.
    // @param item (FormItem) the form item itself (also available as "this").
    // @param pendingStatus (boolean) <code>true</code> if the item should show its pending
    // visual state; <code>false</code> otherwise.
    // @param newValue (Any) the current form item value.
    // @param value (Any) the value that would be restored by a call to +link{DynamicForm.resetValues()}.
    // @return (boolean) <code>false</code> to cancel the default behavior.
    // @example canvasItemShowPendingSupport
    // @visibility external
    //<
    pendingStatusChanged : "form,item,pendingStatus,newValue,value",


    //> @method formItem.transformInput()
    // Called when a FormItem's value is about to change as the result of user interaction.  This
    // method fires after the user performed an action that would change the value of this field,
    // and allows the developer to modify / reformat the value before it gets validated / saved.
    // Fires before +link{formItem.change}.
    // <P>
    // Return the reformatted value.
    //
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @param   value   (Any)         The new value of the form item
    // @param   oldValue    (Any)     The previous (current) value of the form item
    //
    // @return  (Any) The desired new value for the form item
    // @visibility external
    //<
    
    transformInput : "form,item,value,oldValue",
    
    
    cellClick : "form,item",
    cellDoubleClick : "form,item",
    
    //> @method formItem.titleClick()
    // Notification method fired when the user clicks the title for this item
    // @param form (DynamicForm) the managing DynamicForm instance
    // @param item (FormItem) the form item whose title was clicked
    // @return (boolean) Return false to cancel the click event. This will prevent the event from
    //   bubbling up, suppressing
    //   +link{canvas.click,click} on the form containing this item.
    // @visibility external
    //<
    titleClick : "form,item",
    //> @method formItem.titleDoubleClick()
    // Notification method fired when the user double-clicks the title for this item
    // @param form (DynamicForm) the managing DynamicForm instance
    // @param item (FormItem) the form item whose title was double-clicked
    // @return (boolean) Return false to cancel the doubleclick event. This will prevent the event from
    //   bubbling up, suppressing
    //   +link{canvas.doubleClick,doubleClick} on the form containing this item.
    // @visibility external
    //<
    titleDoubleClick : "form,item",

    mouseMove : "form,item", 
    mouseOver : "form,item", 
    mouseOut : "form,item", 
    titleMove : "form,item", 
    titleOver : "form,item",
    titleOut : "form,item",
    textBoxMove : "form,item",
    textBoxOver : "form,item",
    textBoxOut : "form,item",

        
    itemHover : "item,form",
    titleHover : "item,form",
    valueHover : "item,form",

    //> @method formItem.keyPress()
    // StringMethod fired when the user presses a key while focused in this form item.
    //
    // @param item (FormItem) Item over which the keypress occurred
    // @param form (DynamicForm) Pointer to the item's form
    // @param keyName (KeyName) Name of the key pressed (Example: <code>"A"</code>, <code>"Enter"</code>)
    // @param characterValue (number) If this was a character key, this is the numeric value
    //        for the character
    //
    // @return (boolean) return false to attempt to cancel the event.  Note for general purpose
    //                   APIs for managing whether user input is allowed, use +link{change()} 
    //                   or +link{transformInput()} instead.
    // 
    //
    // @group eventHandling
    // @visibility external
    //<
    keyPress : "item, form, keyName, characterValue",  // was keyNum, form, item

    // NOTE: characterValue not passed to keyDown/keyUp because it's not guaranteed to be
    // available for these events
    
    //> @method formItem.keyDown()
    // StringMethod fired in response to a keydown while focused in this form item.
    //
    // @param item (FormItem) Item over which the keydown occurred
    // @param form (DynamicForm) Pointer to the item's form
    // @param keyName (KeyName) Name of the key pressed (Example: <code>"A"</code>, <code>"Enter"</code>)
    // @return (boolean) return false to attempt to cancel the event.  Note for general purpose
    //                   APIs for managing whether user input is allowed, use +link{change()} 
    //                   or +link{transformInput()} instead.
    //
    // @group eventHandling
    // @visibility external
    //<    
    keyDown : "item,form,keyName",

    //> @method formItem.keyUp()
    // StringMethod fired in response to a keyup while focused in this form item.
    //
    // @param item (FormItem) Item over which the keyup occurred
    // @param form (DynamicForm) Pointer to the item's form
    // @param keyName (KeyName) Name of the key pressed (Example: <code>"A"</code>, <code>"Enter"</code>)
    // @return (boolean) return false to attempt to cancel the event.  Note for general purpose
    //                   APIs for managing whether user input is allowed, use +link{change()} 
    //                   or +link{transformInput()} instead.
    //
    // @group eventHandling
    // @visibility external
    //<    
    keyUp : "item,form,keyName",
    
    //> @method formItem.transformPastedValue()
    // Notification fired in response to a clipboard "paste" event on freeform text
    // items, giving developers an opportunity to reformat the pasted text. The 
    // <code>pastedValue</code> argument contains the text pasted from the clipboard.
    // This method should return the text value to actually insert into the input element.
    //
    // @param item (FormItem) Item into which the user pasted a value
    // @param form (DynamicForm) Pointer to the item's form
    // @param pastedValue (String) Pasted text value
    // @return (String) Reformatted version of the pasted text.
    //
    // @group eventHandling
    // @visibility internal
    //<
    // Exposed on TextItem and TextAreaItem.
    
    transformPastedValue : "item,form,pastedValue",


    //> @method formItem.getValueIcon()
    // Except when +link{group:printing,printing} and +link{FormItem.getPrintValueIcon(),getPrintValueIcon()}
    // is implemented, implementing this stringMethod allows the developer to specify the image
    // source for an icon to be displayed for the current form item value.
    // <p>
    // The special value "blank" means that no image will be displayed. This is typically used
    // in conjunction with +link{FormItem.getValueIconStyle()} to implement spriting of the
    // value icon. Note that when spriting the value icon, it is recommended to implement
    // <code>getPrintValueIcon()</code> and +link{FormItem.getPrintValueIconStyle(),getPrintValueIconStyle()}
    // when printing.
    // <P>
    // Takes precedence over +link{FormItem.valueIcons}
    // <P>
    // The returned +link{SCImgURL}, if not <code>null</code> or "blank", will be suffixed with
    // +link{FormItem.imageURLSuffix,FormItem.imageURLSuffix}.
    //
    // @param value (Any) value of the item.
    // @return (SCImgURL) the image source or <code>null</code> if no value icon should be
    // displayed.
    // @group valueIcons
    // @see FormItem.getPrintValueIcon()
    // @visibility external
    //<
    getValueIcon : "value",

    //> @method formItem.getPrintValueIcon()
    // If implemented, this stringMethod is called when +link{group:printing,printing} to
    // obtain the image source for an icon to be displayed for the current form item value.
    // The special value "blank" means that no image will be displayed.
    // <p>
    // Implementing <code>getPrintValueIcon()</code> may be useful in order to swap out the
    // value icon with a more printer-friendly image (perhaps a grayscale-only image). Another
    // use is to avoid spriting when printing. Value icon spriting may be problematic when
    // printing because browsers typically default to not printing background images.
    // <p>
    // Takes precedence over +link{FormItem.valueIcons} and +link{FormItem.getValueIcon()}
    // when printing.
    // <p>
    // The returned +link{SCImgURL}, if not <code>null</code> or "blank", will be suffixed with
    // +link{FormItem.imageURLSuffix,FormItem.imageURLSuffix}.
    //
    // @param value (Any) value of the item.
    // @return (SCImgURL) the image source or <code>null</code> if no value icon should be
    // displayed.
    // @group valueIcons
    // @group printing
    // @see FormItem.getValueIcon()
    // @visibility external
    //<

    // called via DF.saveData() callback.  Return false from this method to perform async
    // processing before saveData() callback is called.  Then call form.saveDataComplete() to
    // tell the form to proceed.
    formSaved: "request,response,data",
    
    
    // Custom formatters and parsers, documented above
    formatValue:"value,record,form,item",
    formatEditorValue:"value,record,form,item",
    parseEditorValue:"value,form,item"
    
});


// NOTE: toString functions CANNOT be added by addMethods, because a property named "toString"
// will not be enumerated by for..in.  This is actually part of the ECMAScript standard!

isc.FormItem.getPrototype().toString = function () {
    return "[" + this.Class + " ID:" + this.ID +
            (this.name != null ? " name:" + this.name : "") + "]";
};

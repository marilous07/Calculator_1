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
// ** Limitations when working with a databound pickList. **
// We support databinding the pickList by setting optionDataSource (implemented in the
// PickList interface - not available for NativeSelectItems).
// We currently DO NOT support 
//  - 'isSelectOther' behavior 
// on select items with databound pickLists.





// Class will not work without the ListGrid
if (isc.ListGrid != null) {



//>	@class	SelectItem
// FormItem that allows picking between several mutually exclusive options via a select list.
// <P>
// Options may be derived from a <code>dataSource</code> or a <code>valueMap</code>.
// <P>
// Note that to select the first option as a default value for the item,
// +link{SelectItem.defaultToFirstOption} may be set.
//
// @inheritsFrom FormItem
// @implements PickList
// @see PickList.optionDataSource
// @see formItem.valueMap
// @visibility external
// @example selectItem
//<
isc.ClassFactory.defineClass("SelectItem", "FormItem");

isc.defer("if (isc.SelectItem._instancePrototype.animatePickList == null) isc.SelectItem.addProperties({ animatePickList: isc.Browser.isHandset || isc.Browser.isTablet });");

// Pick up "instanceMethodOverrides from the PickList interface
// These are methods which override the FormItem implementation and so won't get picked up
// by the 'mixInInterface' flow
if (isc.PickList) isc.SelectItem.addMethods(isc.PickList._instanceMethodOverrides);

// When the developer specifies a form item as type 'select', depending on the form's 
// useNativeSelectItems property, we may give them a SelectItem, or a NativeSelectItem.
// The APIs and defaults for these classes match, but the implementations are completely
// different.
// Define 'select' type property defaults (to be applied to both classes) in a separate
// object to avoid duplication.

isc._SelectItemProperties = {

    // Have native and synthetic selects' text styling match
    textBoxStyle:"selectItemText",
    
    printTextBoxStyle:"textItem",
    printReadOnlyTextBoxStyle:"staticTextItem",


    //> @attr selectItem.height (number : 19 : IRW)
    // @include FormItem.height
    //<
    height:19,
    width:150,

    // Override the 'dirtyOnKeyDown' property to avoid marking the form item as dirty on every
    // keyDown. We'll handle marking as dirty explicitly when the value should be updated, 
    // without being saved to the form or firing the change handler.
    dirtyOnKeyDown:false,
    // Similarly avoid firing 'updateValue' on every keypress - we will handle when to save the
    // value out.
    changeOnKeypress:false,
    
    // Override redrawOnShowIcon - we can to avoid redrawing the entire form when showing
    // or hiding icons for this item.
    redrawOnShowIcon:false,

    //> @method selectItem.setValueMap()
    // @include formItem.setValueMap()
    //<

    //> @attr selectItem.addUnknownValues (Boolean : true : IRWA)
    // If this item's value is set (via +link{setValue()} or similar) to a value which
    // is not present in the +link{valueMap}, should the value be rejected.
    // <P>
    // If set to <code>false</code> the setValue() call will have no effect if the value
    // is not a valid option.
    // <P>
    // If set to <code>true</code> the item's value will be updated to the new value, and
    // the value will be added to the set of options displayed in the pick-list until the
    // next call to +link{setValueMap()} or +link{setValue()}.
    // <P>
    // Exception: If the value is set to <code>null</code> but there is no null entry in the
    // valueMap for this item, setting <code>addUnknownValues</code> to true will not cause
    // a null option to show up at the top of the select item pickList. Whether an empty
    // option is shown in the pickList is governed by +link{SelectItem.allowEmptyValue}
    // instead.
    // <P>
    // Note that this property has no effect if the selectItem has a specified
    // +link{optionDataSource}. If +link{setValue()} is called on a databound SelectItem
    // and the new value does not match any loaded options, the value will be accepted,
    // but not added to the options displayed in the pickList. Also note that if a
    // +link{displayField} exists, a fetch will be performed in an attempt to retrieve
    // a valid display value, as described under +link{formItem.fetchMissingValues}.  
    // If specified the +link{formItem.loadingDisplayValue} will be displayed while the 
    // fetch is in progress, and then the real value (mapped to a display field value if
    // a matching record was found) will be displayed when the fetch completes.
    //
    // @visibility external
    // @example formDependentSelectsLocal
    //<
    
    addUnknownValues:true,
    
    //> @attr SelectItem.defaultValue (Any : null : IRW)
    // Static default value for this SelectItem. To default to the first option use
    // +link{SelectItem.defaultToFirstOption} instead.
    // @visibility external
    //<
    
    //> @method SelectItem.defaultDynamicValue() (A)
    // Expression evaluated to determine the +link{SelectItem.defaultValue} when no value is
    // provided for this item. To default to the first option use
    // +link{SelectItem.defaultToFirstOption} instead.
    // @param	item	(FormItem)    the form item itself (also available as "this")
    // @param	form    (DynamicForm) the managing DynamicForm instance
    // @param   values  (Object)      the current set of values for the form as a whole
    //
    // @return (Any) dynamically calculated default value for this item
    // @visibility external
    //<
    
    //> @attr SelectItem.defaultToFirstOption (Boolean : false : IRW) 
    // Select the first option as the default value for this SelectItem. 
    // <P>
    // If options are derived from a dataSource, the first value returned by the server will be
    // used, otherwise the first value in the valueMap.  Note that setting this property to
    // true will trigger a fetch at soon as the form is created, because the form will try to
    // establish a default value at that time.
    // <P>
    // If enabled, this setting overrides +link{SelectItem.defaultValue} and
    // +link{SelectItem.defaultDynamicValue}.
    //
    // @group formValues
    // @visibility external
    //<
    
    autoSizePickList:true,
    
    //>	@attr selectItem.multiple (Boolean : null : IRW)
	// If true, multiple values may be selected.
    // <P>
    // The SelectItem will either render as a drop-down allowing multiple selections, or a
    // multi-row list of options similar to a small headerless +link{ListGrid}, based on the
    // +link{multipleAppearance} setting.
    // <P>
    // The logical value of the formItem, as retrieved by +link{formItem.getValue,getValue()}
    // and set via +link{formItem.setValue,setValue()}, is an Array of Strings reflecting the
    // selected values.
    // <P>
    // When this value is true, we disable doubleClick events by default, instead issuing two
    // single clicks by forcibly setting +link{Canvas.noDoubleClicks, noDoubleClicks: true}.
    // If you need to work with doubleClick events, you can disable this default behavior by
    // explicitly setting formItem.pickListProperties.noDoubleClicks: false.
    // <P>
    // Note: <code>multiple:true</code> SelectItems with multipleAppearance:"grid" do not
    // currently support optionDataSource binding.  You can get around this by calling
    // +link{DataSource.fetchData()} directly and calling
    // +link{list.getValueMap,dsResponse.data.getValueMap()} to obtain a valueMap.
    // <P>
    // If the <code>multiple</code> attribute is not explicitly specified, it will default
    // to <code>false</code>, unless thie item has a specified 
    // +link{selectItem.valueMap,valueMap} and is part of a +link{SearchForm,filter interface} 
    // with +link{searchForm.useMultiSelectForValueMaps} set to true.
    //
    // @group	formValues
	// @group	appearance
    // @visibility external
	//<
    // Note that if multipleAppearance is "grid", this currently uses NativeSelectItem
    
    //> @type MultipleAppearance
    // Appearance for a SelectItem that allows multiple selection
    //
    // @value "picklist" a drop-down picklist that allows multiple choices by
    //              clicking on a checkbox next to each item
    // @value "grid" a grid that displays all items in-place. Multiple selection is 
    //              accomplished by ctrl-click or shift-click.
    // @visibility external
    //<

    //> @attr SelectItem.multipleAppearance   (MultipleAppearance : "picklist" : IR)
    // How should items with +link{SelectItem.multiple} set to 'true' be displayed?
    // @visibility external
    //<
    multipleAppearance: "picklist",
    
    //> @attr selectItem.useClientFiltering (Boolean : null : IRA)
    // @include pickList.useClientFiltering
    // @visibility external
    //<

    // ---------------------------
    // SelectOther is a behavior implemented on select items 
    // This is doc'd as a separate form item type, and can be specified by creating a 
    // form item of type 'selectOther' (or setting the 'isSelectOther' flag on a select item)
    // ---------------------------
    
    
    // isSelectOther - flag to specify this as a special 'selectOther' type item.
    // may be set up by the FormItemFactory when the item is created
    //isSelectOther:false,

    //>	@class	SelectOtherItem
    //
    // FormItem that shows a list of options, plus an "Other..." option that allows them to enter
    // another value.
    // <p>
    // Note - SelectOtherItem does not support using an +link{SelectItem.optionDataSource,optionDataSource},
    // instead, use a normal +link{SelectItem} and use the +link{SelectItem.specialValues,specialValues} 
    // to implement a way to add new DataSource records to the +link{SelectItem.optionDataSource,optionDataSource}.
    // This creates a UI more appropriate to +link{SelectItem.optionDataSource,optionDataSource}: 
    // the +link{SelectOtherItem.otherValue,otherValue} option or options 
    // can be placed at the top of the list, so that scrolling to the bottom of a long list is not required.
    // In addition, the +link{SelectItem.specialValues,specialValues} system allows you 
    // to open a custom form or other UI for adding new DataSource records, rather than just 
    // the simple single-value input dialog of SelectOtherItem.
    // 
    // @treeLocation Client Reference/Forms/Form Items
    // @visibility external
    //<
    
    //>	@attr	selectOtherItem.separatorTitle		(String : "--------------------" : IRW)
    // Title for the separator between normal items and the <code>Other...</code> item in the drop
    // down list.  Selecting this item will not change the FormItem's value.
    // @group appearance
    // @visibility external
    //<
    separatorTitle:"--------------------",
    
    //>	@attr	selectOtherItem.separatorValue		(String : "----" : IRWA)
    // Value for the separator item between normal items and the <code>Other...</code> value. 
    // If necessary the value may be changed to ensure it doesn't collide with any data values in
    // this item's +link{formItem.valueMap,valueMap}.
    // @group appearance
    // @visibility external
    //<
    separatorValue:"----",

    //> @attr selectOtherItem.otherTitle (String : "Other..." : IRW)
    // Title for the <code>Other...</code> item. When this item is selected, the user will be 
    // shown a prompt allowing them to enter a new value for the item. 
    // @group appearance, i18nMessages
    // @visibility external
    //<
    otherTitle:"Other...",
    
    //>	@attr	selectOtherItem.otherValue		(String : "***other***" : IRWA)
    // Data value for the <code>Other...</code> item. If necessary this value may be changed to
    // ensure it doesn't collide with any data values in this item's
    // +link{formItem.valueMap,valueMap}.
    // @group appearance
    // @visibility external
    //<
    otherValue:"***other***"

};


// Include the shared select item properties
isc.SelectItem.addProperties(isc._SelectItemProperties);

// The following properties apply only to SelectItems (not NativeSelectItems)
isc.SelectItem.addProperties({

    
    //> @attr selectItem.showPickerIcon (Boolean : true : IRW)
    // @include FormItem.showPickerIcon
    // @visibility external
    //<
    showPickerIcon:true,

    //> @attr SelectItem.emptyDisplayValue (HTMLString : "&nbsp;" : IRW)
    // @include FormItem.emptyDisplayValue
    //<
    // override emptyDisplayValue to show a nonbreaking space so styling works correctly
    emptyDisplayValue:"&nbsp;",

    //> @attr SelectItem.textBoxStyle (FormItemBaseStyle : "selectItemText", [IRA])
    // @include FormItem.textBoxStyle
    // @visibility external
    // @group appearance
    //<
    // This is applied to the visible, selected value in the select item.
    

    //> @attr SelectItem.controlStyle (FormItemBaseStyle : "selectItemControl", [IRA])
    // @include FormItem.controlStyle
    // @group appearance
    // @visibility external
    //<
    controlStyle:"selectItemControl",

    //> @attr selectItem.pickerIconStyle (FormItemBaseStyle : "selectItemPickerIcon" : IRW)
    // @include FormItem.pickerIconStyle
    // @visibility external
    //<
    pickerIconStyle:"selectItemPickerIcon",

        

    // Select items can accept focus
    
    canFocus:true,
    
    //> @attr SelectItem.showFocused    (Boolean : true, [IRWA])
    // @include FormItem.showFocused
    // @visibility external
    //<
    showFocused:true,

    //> @attr selectItem.pickerIconWidth
    // @include FormItem.pickerIconWidth
    // @visibility external
    //<

    //> @attr selectItem.pickerIconHeight
    // @include FormItem.pickerIconHeight
    // @visibility external
    //<

    //> @attr selectItem.pickerIconSrc (SCImgURL : "[SKIN]/DynamicForm/SelectItem_PickButton_icon.gif" : IRWA)
    // If +link{showPickerIcon,showPickerIcon} is true for this item, this property governs the
    // +link{FormItemIcon.src,src} of the picker icon image to be displayed.
    // <P>
    // When +link{group:skinning,spriting} is enabled, this property will not 
    // be used to locate an image, instead, the image is drawn via CSS based on the 
    // +link{SelectItem.pickerIconStyle} property.
    // @include FormItem.pickerIconSrc
    // @visibility external
    //<
    pickerIconSrc:"[SKIN]/DynamicForm/SelectItem_PickButton_icon.gif",

    // Override pickerIconDefaults
    // Don't make this pickerIcon independantly focusable - we only want the user to focus
    // once on the form item
    pickerIconDefaults : {
        
        //imgOnly:true
        tabIndex: -1,
        click : isc.Class.NO_OP
    },

    // Clip the content.
    
    clipValue:true,
    
    // -----------------------
    // Deprecated:

    //> @attr SelectItem.hiliteOnFocus   (boolean : true : [IRWA])
    // Should this SelectItem show a hilite when it receives keyboard focus?
    // @visibility external
    // @deprecated As of SmartClient version 5.5, use +link{SelectItem.showFocused} instead.
    //<
    
    //> @attr    SelectItem.hiliteColor (String : "#316AC5": IRWA)
    // Background color to apply to the select item's selected value when the SelectItem 
    // receives focus, if <code>hiliteOnFocus</code> is true.
    // @visibility external
    // @deprecated As of SmartClient version 5.5, if +link{SelectItem.showFocused} is true,
    //  styling will be updated for this form item on focus. The hiliting effect can therefore
    //  be achieved via +link{SelectItem.textBoxStyle} and +link{SelectItem.controlStyle} 
    //  instead.
    //<
    
    //> @attr    SelectItem.hiliteTextColor (String : "white": IRWA)
    // Text color to apply to the select item's selected value when the SelectItem 
    // receives focus, if <code>hiliteOnFocus</code> is true.
    // @visibility external
    // @deprecated As of SmartClient version 5.5, if +link{SelectItem.showFocused} is true,
    //  styling will be updated for this form item on focus. The hiliting effect can therefore
    //  be achieved via +link{SelectItem.textBoxStyle} and +link{SelectItem.controlStyle} 
    //  instead.
    //<

    //> @attr    SelectItem.pickButtonWidth  (number : null : IRWA)
    // How large should the pick button be rendered?
    // @visibility external
    // @deprecated As of SmartClient version 5.5, pickButtonWidth has been deprecated in 
    //  favor of +link{SelectItem.pickerIconWidth}.
    //<
    
    //> @attr    SelectItem.pickButtonHeight  (number : null : IRWA)
    // How large should the pick button be rendered?
    //
    // @visibility external    
    // @deprecated As of SmartClient version 5.5, pickButtonHeight has been deprecated in 
    //  favor of +link{SelectItem.pickerIconHeight}.
    //<
    
    //> @attr    SelectItem.pickButtonSrc  (String : null : IRWA)
    // Source for image to show for the pick button
    // @visibility external    
    // @deprecated As of SmartClient version 5.5, pickButtonSrc has been deprecated in 
    //  favor of +link{SelectItem.pickerIconSrc}.
    //<    
    
    // ------------
    
    
    
    // Allow customization of the hilite color-scheme applied to the pickList.
    // If specified, overrides styling applied via the selected state of pickListBaseStyle.
    
    //>@attr    SelectItem.pickListHiliteColor (String : null : IRWA)
    // If specified this property determines the backgroundColor to show highlighted items in the 
    // pickList.  By default we don't specify this property, and pick up the styling based on
    // the <code>selected</code> state of the <code>pickListBaseStyle</code>.
    //<
    //pickListHiliteColor:"#316AC5",

    //>@attr    SelectItem.pickListHiliteTextColor (String : null : IRWA)
    // If specified this property determines the text color to show highlighted items in the 
    // pickList.  By default we don't specify this property, and pick up the styling based on
    // the <code>selected</code> state of the <code>pickListBaseStyle</code>.
    //<
    //pickListHiliteTextColor:"white",
    
    // Enable over styling by default for *just* the picker Icon
    
    //> @attr SelectItem.showOver (boolean : true : IRWA)
    // When the user rolls over this item, should it be re-styled to indicate it has focus?
    // <P>
    // By default this property is true for SelectItems, and +link{updateTextBoxOnOver} and
    // +link{updateControlOnOver} are set to false. This means the picker icon will show
    // over styling when the user rolls over the control table.<br>
    // These defaults may be overridden by different SmartClient skins.
    // <P>
    // See +link{group:formItemStyling} for more details on formItem styling.
    //
    // @group formItemStyling
    // @visibility external
    // 
    //<
    showOver:true,
    
    //> @attr selectItem.updateTextBoxOnOver (Boolean : false : IRWA)
    // @include formItem.updateTextBoxOnOver
    // @group formItemStyling
    // @visibility external
    //<
    updateTextBoxOnOver:false,
    //> @attr selectItem.updateControlOnOver (Boolean : false : IRWA)
    // @include formItem.updateControlOnOver
    // @group formItemStyling
    // @visibility external
    //<
    updateControlOnOver:false,
    
    // Non-exposed property governing whether the pickList should be shown with a clickMask, 
    // and take focus when shown.
    modalPickList:true,
    
    //>@attr SelectItem.fireChangeOnSelect (boolean : true : IRW)
    // Whether +link{FormItem.change()} 
    // fires each time the pickList selection changes, or only when the pickList is dismissed. 
    //<
    
    //>@attr    SelectItem.changeOnValueChange (boolean : true : IRW) 
    //  If true the change handler for this item will fire when the item has focus and
    //  modifies the selection for the item.
    //  If false, the change handler will only fire when the user leaves a modified selectItem.
    //<
    
    
        
    changeOnValueChange:true,
    
    //>@attr    SelectItem.changeOnKeyboardNavigation (boolean : true : IRW) 
    //  If this.changeOnValueChange is true, and the user is navigating through values via
    //  keypresses such as up and down arrows, while the pick-list is not visible, should we
    //  fire change?
    //  Has no effect if this.changeOnValueChange is false.
    // @visibility internal
    //<
    
    changeOnKeyboardNavigation:true,

    //> @attr SelectItem.canSelectText (boolean : false : IRW)
    // By default SelectItems do not allow users to select the text of the
    // selected value.
    // @visibility external
    //<
    // Don't allow native text selection of the content of the SelectItem
    
    canSelectText : false,

    //> @attr selectItem.allowEmptyValue  (Boolean : false : IR)
    // If set to true, always show an empty option in this item's pickList, allowing the user
    // to clear the value (even if there is no empty entry in the valueMap for the item).
    // <P>
    // The empty value will be displayed with the
    // +link{formItem.emptyDisplayValue,emptyDisplayValue}.
    // <P>
    // With a +link{optionDataSource,databound selectItem}, enabling
    // <code>allowEmptyValue</code> disables data paging by default - all data matching the
    // +link{pickList.pickListCriteria,current criteria} will be requested.  However, enabling
    // +link{separateSpecialValues} allows data paging to be used if required.
    // <P>
    // See also +link{specialValues} as a way of providing several different special values in
    // addition to an empty value, such as "Invalid".  Note that setting
    // <code>specialValues</code> disables the use of <code>allowEmptyValue</code> - see
    // details of how to have an empty value while using <code>specialValues</code> in 
    // in +link{specialValues,the <code>specialValues</code> documentation}.
    // 
    // @group formValues
    // @visibility external
    //<
    allowEmptyValue : false,
    
    
    
    //> @attr selectItem.specialValues (ValueMap : null : IR)
    // @include pickList.specialValues
    // @visibility external
    //<

    //> @attr selectItem.separateSpecialValues (boolean : null : IR)
    // If true, +link{specialValues,special values} such as the empty value will be shown in a
    // separate non-scrolling area, in the +link{separateValuesList}.  Aside from making these values
    // more easily accessible, showing them in a separate list allows data paging to be used, which is
    // disabled if the separateValues are shown in the normal drop-down list along with other values.
    //
    // @visibility external
    //<
    
    //> @attr selectItem.separateValuesList (AutoChild ListGrid : null : IR)
    // AutoChild used to show +link{specialValues}.
    //
    // @visibility external
    //<

    
    //> @attr selectItem.autoFetchData   (Boolean : true : [IRA])
    // If this select item retrieves its options from a <code>dataSource</code>, should options
    // be fetched from the server when the item is first drawn, or should this fetch be
    // delayed until the user opens the pickList.
    // <P>
    // The default is true in order to allow the user to select a value via keyboard input
    // while keyboard focus is on the SelectItem but the pickList has not actually been shown.
    //
    // @visibility external
    // @see PickList.optionDataSource
    //<
    autoFetchData:true,

    //>@attr SelectItem.showHintInField (boolean : null : IRW)
    // If showing a hint for this form item, should it be shown within the field?
    // <P>CSS style for the hint is +link{selectItem.textBoxStyle} with the suffix
    // "Hint" appended to it. 
    // @group appearance
    // @see FormItem.hint
    // @visibility external
    //<

    //>@attr SelectItem.progressiveLoading (boolean : null : IRW)
    // Indicates whether or not this SelectItem will load its list of options 
    // +link{DataSource.progressiveLoading,progressively}.  This property is copied onto the
    // underlying +link{class:PickList}.
    // @see DataSource.progressiveLoading
	// @group progressiveLoading
    // @visibility external
    //<
    
    //> @attr selectItem.saveOnEnter (Boolean : true : IRW)
    // Select items will submit their containing form on enter keypress 
    // if +link{DynamicForm.saveOnEnter,saveOnEnter} is true. Setting this property to
    // <code>false</code> will disable this behavior.
    // <P>
    // Note that if the drop down list of options (pickList) is visible an
    // <code>Enter</code> keypress is used to select a value from the available set of
    // options and will not automatically cause form submission.
    // @visibility external
    //<
    // default implementation of formItem.shouldSaveOnEnter() returns this
    saveOnEnter: true,

    //> @attr selectItem.openOnSpace (Boolean : false : IRW)
    // Causes the PickList to open when the spacebar is pressed, default false.  
    // <P>
    // For native OS widgets, space opens the PickList on Macs, but not on Windows.  Consider
    // using this setting if your users are almost entirely Mac users, or enabling it only for
    // users running MacOS.  
    // <P>
    // However, before using this setting, consider that it means that Spacebar will not be able
    // to be used for another purpose when focus is in a SelectItem.
    //
    // @visibility external
    //<
    openOnSpace: false,
    
    //> @attr selectItem.openOnDownArrow (Boolean : false : IRW)
    // Causes the PickList to open when the down arrow is pressed, default false.  
    // <P>
    // For native OS widgets, the down arrow changes the value of a select on Windows, but 
    // opens the select on Macs.  This setting is not recommended unless you are certain that 
    // all users of your applications will expect the Mac convention.
    // @visibility external
    //<
    openOnDownArrow: false
    
    //> @attr selectItem.rootNodeId (String | Number : null : IRW)
    // @include pickList.rootNodeId
    // @visibility external
    //<
    
    //> @attr selectItem.autoOpenTree (String : "none" : IRW)
    // @include pickList.autoOpenTree
    // @visibility external
    //<

    //> @attr SelectItem.singleClickFolderToggle (boolean : false : IRW)
    // @include pickList.singleClickFolderToggle
    // @visibility external
    //<
});


isc.SelectItem.addMethods({

    init : function () {

        if (this.specialValues && this.allowEmptyValue) {
            this.logWarn("Both specialValues and allowEmptyValue properties set. allowEmptyValue will be ignored.");
            this.allowEmptyValue = false;
        }

        // At init time, pick up any deprecated properties applied to this select item.
        //>!BackCompat 2006.3.9
        if (this.hiliteOnFocus != null) {
            this._warnDeprecated("hiliteOnFocus", "showFocused");
            this.showFocused = this.hiliteOnFocus;
        }
        
        if (this.pickButtonWidth != null) {
            this._warnDeprecated("pickButtonWidth", "pickerIconWidth");
            this.pickerIconWidth = this.pickButtonWidth;
        }
        if (this.pickButtonHeight != null) {
            this._warnDeprecated("pickButtonHeight", "pickerIconHeight");
            this.pickerIconHeight = this.pickButtonHeight;
        }
        
        if (this.pickButtonSrc != null) {
            this._warnDeprecated("pickButtonSrc", "pickerIconSrc");
            this.pickerIconSrc = this.pickButtonSrc;
        }
        //<!BackCompat

        if (this.multiple) this._valuesSet = isc.Set.create();

        return this.Super("init", arguments);    
    },

    _mayShowHintInField : function () {
        return !!(this.showHint && this.__mayShowHintInField());
    },
    
    // For parity with ComboBoxItems, the contents of the SelectItem should be vertically centered.
    _shouldVerticallyCenterTextBox : function () {
        return true;
    },

    

    // Override drawn() - if this is a databound pickList we want to perform a filter before
    // the pickList itself ever gets shown.
    
    drawn : function (a,b,c,d) {
        this.invokeSuper(isc.SelectItem, "drawn", a,b,c,d);
        if (this.autoFetchData && this._getOptionsFromDataSource()) {
            // if the item is not currently editable, set a flag that allows the one-time 
            // autoFetch to occur on redrawn() instead, assuming it is editable at that time
            if (this.getCanEdit() == false && 
                (!this._readOnlyFetchMissingValue || this._explicitCanEdit == false)) {
                this.autoFetchDataOnRedrawn = true;
            } else {
                this.fetchData(null, null, true);
            }
        }
    },
    redrawn : function (a,b,c,d) {
        this.invokeSuper(isc.SelectItem, "redrawn", a,b,c,d);
        if (this.autoFetchDataOnRedrawn == true && this.getCanEdit()) {
            // if the item was not editable when it was first drawn, and it is now editable,
            // issue the one-time autoFetch
            delete this.autoFetchDataOnRedrawn;
            this.fetchData(null, null, true);
        }
    },

    // Override _supportsInlineIcons() - SelectItem supports inline icons.
    _supportsInlineIcons : function () {
        
        if (this._inlineIconsMarkupApproach == null) return false;
        return true;
    },
    
    
    _getIconVMargin : function () {
        return 0;
    },
    
    // Override iconFocus() - if focus goes to the picker icon, shift it to the textbox instead
    
    _iconFocus : function (id, element) {
        var icon = this.getIcon(id);
        if (icon == this.getPickerIcon()) {
            element.blur();
            this.focusInItem();
            return;
        }
        
        return this.Super("_iconFocus", arguments);
    },
    
    //> @method selectItem.setElementReadOnly()
    // Change the read-only state of the form element immediately.
    //<
    setElementReadOnly : function (readOnly) {
        // Don't need to do anything as all changes are handled by styling and the
        // pick icon. This override keeps a redraw from occurring.
    },

    _getPendingBaseStyle : function (baseStyle, which) {
        // When multiple is true, we will style any newly-selected values in the pending style,
        // but the text box needs to be 
        if (this.multiple && (which === this._$textBox ||
                              which === this._$printTextBox))
        {
            return baseStyle;
        }
        return this.Super("_getPendingBaseStyle", arguments);
    },

    //> @method selectItem.pendingStatusChanged()
    // Notification method called when +link{FormItem.showPending,showPending} is enabled and
    // this <code>SelectItem</code> should either clear or show its pending visual state.
    // <p>
    // The default behavior is that the +link{FormItem.titleStyle,titleStyle} and
    // +link{FormItem.cellStyle,cellStyle} are updated to include/exclude the "Pending" suffix.
    // In addition, a +link{attr:multiple,multiple} <code>SelectItem</code> when displayed in
    // the pending state will apply +link{FormItem.editPendingCSSText} to any new value in the
    // text box and also append "Pending" to the cells' +link{ListGrid.baseStyle} for cells
    // in the pickList menu corresponding to new values. Returning <code>false</code> will
    // cancel this default behavior.
    // @include FormItem.pendingStatusChanged()
    //<

    // ---------------------------------------------------------------------------------------
    // EVENTS
    // ---------------------------------------------------------------------------------------


    // Override click to show the pick list 
	handleClick : function () {
        if (!(this.isDisabled()) && !(this.isReadOnly())) {
            // Give this item explicit focus before we show the pickList
            // This should only be done if the item is not disabled, otherwise 
            // focusInItem() causes a recursion error.
            
            this.focusInItem();
            this.showPicker();
        }
        // call to Super fires any developer specified click handlers
        return this.Super("handleClick", arguments);
    },
    
    // Override handleKeyPress to allow navigation via typing the first letters of valid
    // options
    _$PageUp:"Page_Up", _$PageDown:"Page_Down",
    handleKeyPress : function (event, eventInfo) {
        var returnVal = this.Super("handleKeyPress", arguments);
        if (returnVal == false) return false;

        // If item is read-only, there is nothing more to do
        if ((this.isDisabled()) || (this.isReadOnly())) return returnVal;

        var keyName = event.keyName;

        // On Enter keyPress resolve "other..." (or separator) selection to a meaningful value.
        if (keyName == "Enter" && this.isSelectOther) {
            if (this._selectOtherValue != null) this.updateValue();
        // Navigate where appropriate            
        } else if (keyName == "Arrow_Down") {
            if (this.openOnDownArrow) {
                // note that this has the same effect as the altKeyDown check below, will still 
                // occur, even if openOnDownArow is false
                this.showPicker();
            } else {
                if (isc.EH.altKeyDown()) this.showPicker();
                else this.moveToNextValue(1);
            }
            // Don't allow scrolling, etc
            returnVal = false;
            
        } else if (keyName == "Arrow_Up") {
            if (isc.EH.altKeyDown()) this.showPicker();
            else this.moveToNextValue(-1);
            // Don't allow scrolling, etc
            returnVal = false;
            
        } else if (keyName == this._$PageUp) {
            this.moveToNextPage(-1);
            // Don't allow scrolling, etc
            returnVal = false;

        } else if (keyName == this._$PageDown) {
            this.moveToNextPage(1);
            // Don't allow scrolling, etc
            returnVal = false;

        } else if (keyName == "Home") {
            this.moveToFirstValue();
            // Don't allow scrolling, etc
            returnVal = false;
        } else if (keyName == "End") {
            this.moveToLastValue();
            // Don't allow scrolling, etc
            returnVal = false;
        } else if (keyName == "Space" && this.openOnSpace) {
            this.showPicker();
        } else {
            // if it was a character key, add it to the search buffer and re-search
            var charVal = event.characterValue;
            if (charVal != null) {
                this._setClearMoveToTimer(charVal);
            }
        }
        return returnVal;
    },  

    // On Blur, if we were marked as dirty, fire the change handler
    _nativeElementBlur : function (element, itemID) {
        var returnVal = this.Super("_nativeElementBlur", arguments);
        if (this.changeOnBlur || this._itemValueIsDirty() || this._selectOtherValue) {
            
            if (isc.Browser.isMoz && this._selectOtherValue == this.otherValue)
                this.form.__suppressFocusHandler = true;
            this.updateValue();
        }

        return returnVal;
    },    
    
    

    //> @method selectItem.showPicker()
    // Method to show a picker for this item. By default this method is called if the user
    // clicks on a +link{showPickerIcon,pickerIcon}.  May also be called programmatically.
    // <P>
    // Overridden from the default +link{formItem.showPicker()} implementation to show
    // the +link{pickList}
    //
    // @visibility external
    //<
    showPicker : function (waitForData, queueFetches) {
        this.showPickList(waitForData, queueFetches);
    },

    //> @attr SelectItem.clickMaskMode (ClickMaskMode : "hard" : IRW)
    // @include PickList.clickMaskMode
    // @visibility external
    //<
    //clickMaskMode: "hard",

    showPickList : function (waitForData, queueFetches) {
        var interfaceShowPickList = isc.PickList.getPrototype().showPickList;
        interfaceShowPickList.apply(this, arguments);
        if (this.pickList) {
            this.pickList._suppressSelectionUpdatedEvent = true;
            this.pickList.deselectAllRecords();
            this.pickList._suppressSelectionUpdatedEvent = false;
            // if either a value was passed in or this.defaultToFirstOption: true, select now
            var value = this.getValue();
            if (value != null) this.selectItemFromValue(value);
        }
    },
        
    // Override handleEditorExit() - when fired from a blur, if the pickList is visible we
    // don't want to fire the editorExit method, since focus is going to the pickList
    handleEditorExit : function () {
        
        if (this._showingPickList) return;
        return this.Super("handleEditorExit", arguments);
    },

    // When the pick list is shown, fire editorEnter - essentially interacting with the picklist
    // is the same as interacting with this item.
    _pickListShown : function () {
        // Note: this will no-op if we've already fired editorEnter()
        this.handleEditorEnter();
        var interfacePickListShown = isc.PickList.getPrototype()._pickListShown;
        interfacePickListShown.apply(this, arguments);
    },

    // override _pickListHidden so that change notifications can be fired when
    // fireChangeOnSelect is false, and the item is in multi mode
    _pickListHidden : function () {
        if (this.fireChangeOnSelect == false) this.updateValue();   
        var interfacePickListHidden = isc.PickList.getPrototype()._pickListHidden;
        interfacePickListHidden.apply(this, arguments);
    },


    // UI for mobile devices (pickListPlacement other than 'nearOrigin')
    // -----------------------

    //> @attr selectItem.pickListPlacement (PanelPlacement | Canvas | String : null : IR)
    // Controls where the +link{PickList} is placed.  
    // Can be specified as a +link{type:PanelPlacement}
    // or a specific widget that should be filled (by specifying an actual Canvas or
    // +link{Canvas.ID}).
    // <p>
    // Default behavior is to <code>"fillPanel"</code> if +link{Browser.isHandset} or
    // +link{Browser.isTablet}, to better accommodate the smaller screen real estate and 
    // less precise
    // pointing ability on such devices.
    // <p>
    // When filling the whole screen, part of the screen or a specific panel, the expanded
    // interface is created as a +link{FormItem.picker,standard FormItem picker}, and 
    // incorporates a +link{pickerNavigationBar,navigation bar} and 
    // +link{pickerExitButton,done button} that hides the expanded interface.
    // @group panelPlacement
    // @visibility external
    //<
    


    //> @attr selectItem.iconPlacement (PickListItemIconPlacement : "both" : IR)
    // @include pickList.iconPlacement
    //<
    
    //> @attr SelectItem.pickerExitButton (AutoChild NavigationButton : null : IR)
    // +link{NavigationButton} to dismiss the picker interface, created when 
    // +link{pickListPlacement} indicates that the search interface takes over the
    // entire panel or screen.
    // <p>
    // The following +link{group:autoChildUsage,passthroughs} apply:
    // <ul>
    // <li>+link{SelectItem.pickerExitButtonTitle,pickerExitButtonTitle} for +link{Button.title}</li>
    // </ul>
    //
    // @group panelPlacement
    // @visibility external
    //<
    pickerExitButtonDefaults: {
        _constructor: "NavigationButton",

        click : function () {
            this.creator.pickerExitButtonClick();
        }
    },

    //> @attr selectItem.pickerExitButtonTitle (HTMLString : "Done" : IR)
    // The title for the +link{pickerExitButton}.
    //
    // @group i18nMessages
    // @group panelPlacement
    // @visibility external
    //<
    pickerExitButtonTitle:"Done",

    //> @attr SelectItem.pickerClearButton (AutoChild NavigationButton : null : IR)
    // +link{NavigationButton} to clear the picker value, created when +link{pickListPlacement}
    // indicates that the search interface takes over the entire panel or screen.
    // <P>
    // This button will only be shown if +link{allowEmptyValue} is true.
    // <p>
    // The following +link{group:autoChildUsage,passthroughs} apply:
    // <ul>
    // <li>+link{SelectItem.pickerClearButtonTitle,pickerClearButtonTitle} for
    // +link{Button.title}</li>
    // </ul>
    //
    // @group panelPlacement
    // @visibility external
    //<
    pickerClearButtonDefaults: {
        _constructor: "NavigationButton",

        click : function () {
            this.creator.pickerClearButtonClick();
        }
    },

    //> @attr selectItem.pickerClearButtonTitle (HTMLString : "Clear" : IR)
    // The title for the +link{pickerClearButton}.
    //
    // @group i18nMessages
    // @group panelPlacement
    // @visibility external
    //<
    pickerClearButtonTitle:"Clear",

    //> @attr selectItem.emptyPickListMessage (String : "No items to show" : IRWA)
    // Empty message to display in the selectItem if +link{PickList.hideEmptyPickList}
    // is <code>false</code>.
    // @group i18nMessages
    // @visibility external
    //<
    emptyPickListMessage: "No items to show",
    
    //> @attr SelectItem.pickerNavigationBar (AutoChild NavigationBar : null : IR)
    // +link{NavigationBar} created when +link{pickListPlacement} indicates that the search
    // interface takes over the entire panel or screen.
    //
    // @group panelPlacement
    // @visibility external
    //<

    createPickerNavigationBar : function () {
        if (this.pickerClearButton == null) {
            this.pickerClearButton = this.createAutoChild("pickerClearButton", {
                title: this.pickerClearButtonTitle,
                visibility: this.allowEmptyValue ? isc.Canvas.INHERIT : isc.Canvas.HIDDEN
            });
        }
        if (this.pickerExitButton == null) {
            this.pickerExitButton = this.createAutoChild("pickerExitButton", {
                title: this.pickerExitButtonTitle
            });
        }
        if (this.pickerNavigationBar == null) {
            this.pickerNavigationBar = this.createAutoChild("pickerNavigationBar", {
                // We're totally overriding the controls so really
                // we're just using the styling of the Nav Bar class
                controls: [this.pickerClearButton, this.pickerExitButton]
            });
        } else {
            this.pickerNavigationBar.setControls([this.pickerClearButton, 
                                                  this.pickerExitButton]);
        }
    },

    // Click handler for exit button click
    pickerExitButtonClick : function () {
        // exit without picking.
        // Standard "hide" handles clearing the clickMask etc too
        this.pickList.hide();
    },

    // Click handler for clear button click
    pickerClearButtonClick : function () {
        this.setValue(this.emptyStringValue);
        this.pickList.hide();
    },

    // --------------------------------------

    // Navigation methods:

    

    // helper to get the locally loaded set of options:
    // Returns set of options if the pickList is not databound
    // For databound picklists, returns the set of all rows, if every row is cached 
    // Otherwise we know we don't have complete client side data so returns null.
    getAllLocalOptions : function (skipDisabled) {
        var valsArray;
        if (this._getOptionsFromDataSource()) {
            // if we're databound, allow keyboard navigation if we've got a full cache
            if (!this.pickList || this.pickList.destroyed) return;
            var rs = this.pickList.getOriginalData();
            if (this.dataSetType == "tree") {
                if (!rs || !rs._openListCache || rs._openListCache.length == 0) return;
            } else {
                if (!rs || !rs.lengthIsKnown() || !rs.allMatchingRowsCached()) return;
            }
            
            // We're going to have to refilter (on the client) if the criteria have changed
            var criteria = this.getPickListFilterCriteria();
            if (this.form) {
                criteria = isc.DataSource.resolveDynamicCriteria(criteria, this.form.getRuleContext());
            }
        	if (rs.compareCriteria(criteria, rs.criteria) != 0) {
                if (!rs.allRowsCached() || !rs.useClientFiltering) return;
                this.filterPickList(false, false);    
            }
            if (this.dataSetType == "tree") {
                valsArray = rs._openListCache;
            } else {
                valsArray = rs.getAllRows();
            }
        } else {
            valsArray = this.getClientPickListData();
        }
        // skip disabled and skip selected...
        var finalArray = [];
        if (skipDisabled) {
            var enabledProp = this.getRecordEnabledProperty(),
                canSelectProp = this.getCanSelectRecordProperty();
                
            for (var i = 0; i < valsArray.length; i++) {
                if (valsArray[i][enabledProp] == false) continue;
                if (valsArray[i][canSelectProp] == false) continue;
                finalArray[finalArray.length] = valsArray[i];
            }
        } else {
            finalArray = valsArray;
        }
        return finalArray;
    },
    
    getRecordEnabledProperty : function () {
        if (this.pickList != null) return this.pickList.recordEnabledProperty;
        if (this.pickListProperties && this.pickListProperties.recordEnabledProperty) {
            return this.pickListProperties.recordEnabledProperty;
        }
        if (this.pickListDefaults && this.pickListDefaults.recordEnabledProperty) {
            return this.pickListDefaults.recordEnabledProperty;
        }
        return isc.PickListMenu.getPrototype().recordEnabledProperty;
    },
    getCanSelectRecordProperty : function () {
        if (this.pickList != null) return this.pickList.recordCanSelectProperty;
        if (this.pickListProperties && this.pickListProperties.recordCanSelectProperty) {
            return this.pickListProperties.recordCanSelectProperty;
        }
        if (this.pickListDefaults && this.pickListDefaults.recordCanSelectProperty) {
            return this.pickListDefaults.recordCanSelectProperty;
        }
        return isc.PickListMenu.getPrototype().recordCanSelectProperty;
    },
    

    //> @attr selectItem.allowMultiCharSearch (boolean : true : IRW)
    // By default, if multiple keys are pressed in quick succession, a SelectItem will buffer
    // them together and use the resulting multi-char string when searching.  Set this 
    // attribute to false to force the item to match only one character at a time.
    // @visibility external
    //<
    allowMultiCharSearch: true,
    
    _clearMoveToDelay: 500,
    _setClearMoveToTimer : function (charVal, suppressMoveTo) {
        var character = String.fromCharCode(charVal);
        if (character == null) return;
        if (this._clearMoveToTimer) {
            isc.Timer.clear(this._clearMoveToTimer);
            delete this._clearMoveToTimer;
        }
        // if allowMultiCharSearch is false, clear out the buffer
        if (!this._moveToBuffer || !this.allowMultiCharSearch) this._moveToBuffer = "";
        this._moveToBuffer += character;
        if (!suppressMoveTo) {
            if (!this.moveToBuffer(this._moveToBuffer)) {
                if (this._moveToBuffer == (character + character)) {
                    // special case - no match found, but the last two characters were the same -
                    // we want to effectively clear the buffer and search just for the latest 
                    // character
                    this._moveToBuffer = character;
                    this.moveToBuffer(this._moveToBuffer);
                }
            }
        }
        if (this.allowMultiCharSearch) {
            // don't fire the timer unless multiCharSearch is allowed (it is, by default)
            this._clearMoveToTimer = isc.Timer.setTimeout(
                this.getID() + "._$delayedClearMoveTo()", this._clearMoveToDelay
            );
        }
    },

    _$delayedClearMoveTo : function () {
        isc.Timer.clear(this._clearMoveToTimer);
        delete this._clearMoveToTimer;
        delete this._moveToBuffer;
    },
    
    // moveToBuffer() - sets the value of this item to the next valid option that starts with
    // the specified string
     
    moveToBuffer : function (buffer) {
        var valsArray = this.getAllLocalOptions(true);
        if (!valsArray || valsArray.length < 1) {
            // getAllLocalOptions returns null if we have a partial-cache'd resultSet - in this
            // case, we want to search whatever rows are cached
            if (this.pickList && this.pickList.data && this.pickList.data.localData) {
                valsArray = this.pickList.data.localData;
            }
        }
        if (valsArray == null || valsArray.length < 1) return false;

        var character = buffer;
        if (character == null) return false;
        
        // Normalize to a lowercase string for comparison.
        character = character.toLowerCase();
        
        var value = (this.isSelectOther && this._selectOtherValue != null) ? this._selectOtherValue :
                    (this._itemValueIsDirty() ? this._localValue : this.getValue()),
            valueField = this.getValueFieldName(),
            entry = isc.isAn.Array(value) ? value[0] : value,
            currentIndex = valsArray.findIndex(valueField, entry),
            i = currentIndex < valsArray.length - 1 ? currentIndex + 1: 0,
            canRestart = currentIndex > 0,
            buffer = character,
            allowFirstLoop = false
        ;
        
        if (buffer.length > 1) {
            i = currentIndex;
            allowFirstLoop = true;
        }
        
        while (allowFirstLoop || i != currentIndex ||
                (this.multiple && this.openPickListOnKeyPress && i < valsArray.length))
        {
            allowFirstLoop = false;
            // avoid an infinite loop if the current value is not in the valueMap
            if (currentIndex < 0) currentIndex = 0;

            // if the record isn't loaded, there's a partial cache - allow restart from zero
            if (!valsArray[i]) {
                if (canRestart) {
                    canRestart = false;
                    i = 0;
                    continue;
                }
                return false;
            }

            var testValue = valsArray[i][this.getValueFieldName()],
                displayValue = this.mapValueToDisplay(testValue);

            if (isc.isA.String(displayValue)) {
                // strip HTML tags from the value before comparing the first char
                var compareChar = displayValue.replace(/<(?:.|\n)*?>/gm, '').toLowerCase();
                if (compareChar.startsWith(character)) {
                    var newValue = testValue;
                
                    
                    if (this.openPickListOnKeyPress) {
                        this.showPicker();
                        this.pickList.scrollRecordIntoView(i);
                        this.pickList._hiliteRecord(i);
                    } else {
                        // use changeToValue() to update the value and fire the change handler                
                        this.changeToValue(
                            newValue, 
                            (this.changeOnValueChange && this.changeOnKeyboardNavigation),
                            valsArray[i]
                        );
                    }
                    return true;
                }
            }
            i += 1;
            if (i >= valsArray.length) i = 0;
        }
        return false;
    },

    moveToNextPage : function (step) {
        var value;
        if (this.isSelectOther && this._selectOtherValue != null) value = this._selectOtherValue;
        else value = (this._itemValueIsDirty() ? this._localValue : this.getValue());
        
        var valueField = this.getValueFieldName();
        
        var currentIndex = -1,
            totalRows;
        
        var valsArray = this.getAllLocalOptions(true);
        if (!valsArray || valsArray.length < 1) {
            // getAllLocalOptions returns null if we have a partial-cache'd resultSet.
            // However we should be able to request the range directly from the RS in this case
            if (this._getOptionsFromDataSource() && this.pickList && !this.pickList.destroyed) {
                var rs = this.pickList.getOriginalData();
                var criteria = this.getPickListFilterCriteria();
                if (this.form) {
                    criteria = isc.DataSource.resolveDynamicCriteria(criteria, this.form.getRuleContext());
                }
                if (rs && rs.compareCriteria(criteria, rs.criteria) != 0) {
                    this.filterPickList(false, false);
                }
                valsArray = rs;
            }
        }
        if (valsArray == null || valsArray.length < 1) return;
        
        var currentIndex = valsArray.findIndex(valueField, value),
            totalRows = valsArray.getLength(),
            pageSize = this.dataPageSize 
        ;
        
        if (pageSize == null) pageSize = this.pickList ? this.pickList.dataPageSize || 10 : 10;
        if (step < 0) pageSize *= -1;
        
        currentIndex += pageSize;
        
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex >= totalRows) currentIndex = totalRows - 1;
        
        // Note - this will kick off a fetch if the new record is outside our cached
        // data-set.
        var record = valsArray.get(currentIndex);
        if (record != null && !Array.isLoading(record)) {
            // use changeToValue() to update the value and fire the change handler                
            var val = record[valueField]
            this.changeToValue(
                val, 
                (this.changeOnValueChange && this.changeOnKeyboardNavigation),
                record
            );
        }
        
    },
    
    // moveToNextValue() - sets the value of this item to the previous / next valid option in
    // the valueMap
    moveToNextValue : function (step, end) {
        
        var valsArray = this.getAllLocalOptions(true);
        if (!valsArray || valsArray.length < 1) {
            // getAllLocalOptions returns null if we have a partial-cache'd resultSet.
            // However we should be able to request the range directly from the RS in this case
            if (this._getOptionsFromDataSource() && this.pickList && !this.pickList.destroyed) {
                var rs = this.pickList.getOriginalData();
                var criteria = this.getPickListFilterCriteria();
                if (this.form) {
                    criteria = isc.DataSource.resolveDynamicCriteria(criteria, this.form.getRuleContext());
                }
                if (rs && rs.compareCriteria(criteria, rs.criteria) != 0) {
                    this.filterPickList(false, false);
                }
                valsArray = rs;
            }
        }
        if (valsArray == null || valsArray.length < 1) return;
        
        var totalRows = valsArray.getLength();
        var valueField = this.getValueFieldName();
        var currentIndex = -1;

        if (end) {
            
            if (totalRows > 0) {
                if (step > 0) {
                    currentIndex = totalRows-1;
                } else {
                    currentIndex = 0;
                }
            }

        } else {

            var value;
            if (this.isSelectOther && this._selectOtherValue != null) value = this._selectOtherValue;
            else value = (this._itemValueIsDirty() ? this._localValue : this.getValue());
            
            currentIndex = valsArray.findIndex(valueField, value);
            currentIndex += step;
        }
        // Native selects don't allow wrapping of arrow key navigation (so we won't either)
        if (totalRows == null || currentIndex >= totalRows || currentIndex < 0) return;
        
        // Note - this will kick off a fetch if the new record is outside our cached
        // data-set.
        var record = valsArray.get(currentIndex);
        if (record != null && !Array.isLoading(record)) {
            // use changeToValue() to update the value and fire the change handler                
            var val = record[valueField]            
            this.changeToValue(
                val, 
                (this.changeOnValueChange && this.changeOnKeyboardNavigation),
                record
            );
        }
    },
    
    // moveToFirstValue() / moveToLastValue() - sets the value of this item to the first/last
    // values in the valueMap for this item.
    moveToFirstValue : function () {
        this.moveToNextValue(-1, true);
    },

    moveToLastValue : function () {
        this.moveToNextValue(1, true);
    },

    // ---------------------------------------------------------------------------------------
    // FOCUS AND STYLING
    // ---------------------------------------------------------------------------------------
    
    
    _getIconMouseDownFunction: function () {
        if (!this._iconMouseDownFunction) {
            this._iconMouseDownFunction = 
                isc._makeFunction("if(window." + this.getID() + ")window." + this.getID() +
                                  "._showingPickList=true;");
        }
        return this._iconMouseDownFunction;
    },
    
    _applyHandlersToElement : function (a,b,c,d) {
        // Apply the normal handlers
        this.invokeSuper(isc.SelectItem, "_applyHandlersToElement", a,b,c,d);
        if (isc.Browser.isIE) {
            var iconElement = this._getIconImgElement(this.getPickerIcon());
            if (iconElement) {
                iconElement.onmousedown = this._getIconMouseDownFunction();
            }
        }
        
    },
    
    
    // ----------------------------------------------------------------------------------------
    // Values Management
    // ----------------------------------------------------------------------------------------

    _pendingStatusChanged : function (pendingStatus) {
        // When no longer pending, set the valuesSet to the now-saved values. This allows the
        // pickList menu and SelectItem._finishMapValueToDisplay() to determine which values
        // are new.
        if (this.multiple && !pendingStatus) {
            var valuesSet = this._valuesSet;
            valuesSet.clear();

            var value = this._value;
            if (isc.isAn.Array(value)) {
                var numValues = value.length;
                for (var i = 0; i < numValues; ++i) {
                    valuesSet.add(value[i]);
                }
            } else {
                valuesSet.add(value);
            }

            // Refresh the element value in case there were any values shown as pending or deleted.
            this.setLocalValue(value);
        }
        this.Super("_pendingStatusChanged", arguments);
    },

    
    makePickList : function (show) {
        if (this.progressiveLoading === true || this.progressiveLoading === false) {
            if (this.pickListProperties == null) this.pickListProperties = {};
            this.pickListProperties.progressiveLoading = this.progressiveLoading;
        }
        if (!this.filterLocally && 
            (this.allowEmptyValue || (this.specialValues && !this.separateSpecialValues)) &&
            this._getOptionsFromDataSource())
        {
            if (this.pickListProperties == null) 
                this.pickListProperties = {};
            if (this.pickListProperties.dataProperties == null) 
                this.pickListProperties.dataProperties = {};
            // Using basic rather than local means if we do have outstanding filter criteria
            // we'll fetch fewer rows from the server, while still being able to manipulate
            // the cache to insert the empty row at the top.
            this.pickListProperties.dataProperties.fetchMode = "basic";
        }
        
        var interfaceMakePickList = isc.PickList.getPrototype().makePickList;
        var pickList = interfaceMakePickList.apply(this, arguments);
        if (this.multiple && this.pickList && this.pickList.showFilterEditor) {
            this.logWarn("SelectItem defined with multiple set to true, and showFilterEditor " +
                "enabled on the pick-list. This combination of settings is not supported as it " +
                "can lead to ambiguity if a user selects an item, then re-filters such that the item " +
                "is no longer visible and attempts to modify the selection.");
        }
        return pickList;
    },
    
    // changeToValue()
    // Helper method to fire the change handler for this item, then update to the value 
    // specified.  Called when the user navigates to a new value.
    
    changeToValue : function (newValue, saveValue, record) {

        var value = (this._selectOtherValue || this._localValue || this.getValue());
        if (value == newValue) return;

        // make sure the new selection is in the displayFieldCache
        if (this.dataSetType == "tree" && this.pickList && this.pickList.selection) {
            if (record) {
                var rec = isc.addProperties({}, record);
                delete rec.children;
                this._addDataToDisplayFieldCache([rec]);
                this._updateSelectedRecord();
                if (this.getDisplayFieldName() != this.getValueFieldName()) {
                    this.updateDisplayValueMap();
                }
            }
        }

        
        if (this.isSelectOther && 
            (newValue == this.separatorValue || newValue == this.otherValue)) 
        {
            this._setElementValue(this.mapValueToDisplay(newValue), newValue);
            // keep a pointer around to tell us which value the user selected.
            
            this._selectOtherValue = newValue;
            return;
        } else {
            delete this._selectOtherValue;
        }
        // for multiple:true items, if the value isn't null, ensure the stored value is an array
        if (this.multiple && newValue != null && !isc.isAn.Array(newValue)) newValue = [newValue];
        // Update the displayed HTML and store the new value locally.
        this.setLocalValue(newValue);
        // if we're saving the value out, fire 'updateValue()'
        if (saveValue) this.updateValue();
    },

    // setLocalValue:
    // Update the displayed value without saving the value out / firing the change handler.
    setLocalValue : function (value) {
        this._localValue = value;

        if (this.isVisible() && this.containerWidget.isDrawn()) {
            
            if (value == null) value = null;

    	    var displayValue = this._getDisplayValue(value);
            this._setElementValue(displayValue, value);
        }
        this._markValueAsDirty();
    },

    // Override setElementValue to hang onto a copy of the current display value
    
    setElementValue : function (displayValue, dataValue, a,b,c) {
        
        var isEmptyDisplayValue = (displayValue == null || isc.isAn.emptyString(displayValue) ||
                                   displayValue == this.emptyDisplayValue);
        if (isc.Canvas.ariaEnabled() && this.outerAriaRole === "listbox") {
            this.setAriaRole(isEmptyDisplayValue ? "presentation" : "option");
        }

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

        // If we're currently fetching a display value, convert from the data value to 
        // the "loading" marker
        displayValue = this._convertDisplayToLoadingValue(displayValue, dataValue);
        this._displayValue = displayValue;

        return this.invokeSuper(isc.SelectItem, "setElementValue", displayValue, dataValue, a,b,c);
    },

    
    _showInFieldHint : function () {
        
        if (this._showInFieldHintRunning) {
            
            return;
        }
        this._showInFieldHintRunning = true;
        this.Super("_showInFieldHint", arguments);
        this._showInFieldHintRunning = false;
    },

    _hideInFieldHint : function (clearStyleOnly) {
        
        if (this._hideInFieldHintRunning) {
            
            return;
        }
        this._hideInFieldHintRunning = true;
        this.Super("_hideInFieldHint", arguments);
        this._hideInFieldHintRunning = false;
    },

    // Override updateValue - this method will save out the value previously applied locally.
    updateValue : function () {
        // Handle the case of a selectOther item where the user has selected the separator
        // or the "Other..." options.
        if (this.isSelectOther && this._selectOtherValue != null) {
            var selectOtherValue = this.getSelectOtherValue(this._selectOtherValue);
            delete this._selectOtherValue;
            this.setLocalValue(selectOtherValue);
        }
        // if we're not dirty we don't need to update at all.
        if (!this._itemValueIsDirty()) return;
        
        var newValue = this._localValue;
        this._updateValue(newValue);
    },

    // Disable mapDisplayToValue entirely.
    // This method is called from _updateValue which is passed the displayValue in most form items
    // however in SelectItems we always pass the data value directly into this method so it needs
    // no further modification.
    mapDisplayToValue : function (value) {
        return value;
    },


    //> @attr SelectOtherItem.selectOtherPrompt (HTMLString : "Other value for <br>${item.getTitle()}?" : IR)
    // Title to show in prompt for "other" value.
    // Note this is a dynamic string. JavaScript content is supported within <code>&#36;{...}</code>
    // tags, with local variables for <code>item</code> (a pointer to this item) and 
    // <code>value</code> a pointer to the currently selected item value.
    // @group i18nMessages
    // @visibility external
    //<
    selectOtherPrompt:"Other value for <br>${item.getTitle()}?",

    //> @attr SelectOtherItem.dialogWidth (int : 250 : IRW)
    // Width for the "other value" prompt dialog.
    // @visibility external
    //<
    dialogWidth:250,
    
    // getSelectOtherValue - only used by isSelectOther items -- if the user selected
    // "Other" or the separator, return the desired value for the cell (uses the prompt if
    // necessary)
    getSelectOtherValue : function (value) {
        // separator should never be selected
        if (value == this.separatorValue) return true;
        if (value == this.otherValue) {

            // Note the prompt contents should probably be customizable
            var oldValue = this._localValue || this.getValue(),
                oldTitle = (oldValue == null ? "" : this.mapValueToDisplay(oldValue)),
                promptTitle = this.selectOtherPrompt.evalDynamicString(null,
                                                     {item:this, value:oldValue}),
                config = isc.addProperties({width:this.dialogWidth},
                                            // support dialogDefaults / dialogProperties to
                                            // configure the prompt - this mimics the
                                            // auto-child APIs
                                            this.dialogDefaults, this.dialogProperties); 
                                                     
            isc.askForValue(promptTitle, this.getID() + ".getSelectOtherValueCallback(value)",
                            config);
            return true;
        }
    },
    
    getSelectOtherValueCallback : function (value) {
        if (value != null) {
            value = this.mapDisplayToValue(value);
            this.changeToValue(value, this.changeOnValueChange);
        }
    },

    //> @method selectItem.setValue()
    // @include formItem.setValue()
    //<
    // Override setValue 
    // - must handle 'addUnknownValues' logic
    // - must redraw the selected value text.
    setValue : function (value,b,c,d) {
        // Make sure this value is a valid option from our valueMap if necessary.
        
        value = this._getValidValue(value);
        
        
        var undef,
            localValue = this._localValue;
        if (localValue === undef) localValue = this._value;

        
        this._markValueAsNotDirty();

        // Let the superclass implementation save the value out and mark as not dirty. 
        // Note: at this point the value passed in may be null - if so we're relying on 
        // the superclass implementation to get the defaultValue and set up the 'isDefaultValue'
        // flag on this item.
        // NOTE: we are passing a modified value.  
        this.invokeSuper(isc.SelectItem, "setValue", value,b,c,d);
        value = this.getValue();

        // Calling setLocalValue actually sets the displayed element value (may have been
        // changed by the call to Super("setValue"...)
        
        if (value != localValue) this.setLocalValue(value);
        
        // if the pickList is showing, ensure it's showing the right set of data and has
        // the correct element selected.
        
        if (this.pickList && this.pickList.isDrawn() && this.pickListVisible()) {
            this.setUpPickList(true);
        }

        // See if the in-field hint needs to be shown
        if (!this.hasFocus && this._getShowHintInField()) {
            if (value == null || isc.isAn.emptyString(value)) {
                this._showInFieldHint();
            } else {
                // hide the inFieldHint styling (and clear the flag) if we were
                // showing the in-field-hint.
                // No need to update the element value - we will have already handled
                // this as part of standard setValue() flow.
                this._hideInFieldHint(true);
            }
        }

        return value;
    },
    
    
    
    saveValue : function (value, a,b,c,d) {
        var oldValue = this._value;
        if (this._dropCacheOnValueChange(oldValue, value)) delete this._clientPickListData;
        return this.invokeSuper(isc.SelectItem, "saveValue", value, a,b,c,d);
    },
    _dropCacheOnValueChange : function (oldValue, newValue) {
        return (this.addUnknownValues && this._clientPickListData &&
                ((oldValue != null && !this._valueInValueMap(oldValue)) ||
                 (newValue != null && !this._valueInValueMap(newValue))    ) );
    },
    
    // Override 'markValueAsNotDirty' to clear out the temp local value.
    // note this means that callers should have already ensured that the displayed value
    // matches the appropriate value. This method is strictly internal, so this is an 
    // acceptable assertion to make
    _markValueAsNotDirty : function (a,b,c,d) {
        this.invokeSuper(isc.SelectItem, "_markValueAsNotDirty", a,b,c,d);
        delete this._localValue;
    },
    
    // override getDefaultValue to pick up the first option if defaultToFirstOption is true
    // getDefaultValue should not be able to return a value that is not included
    // in the valueMap for this select.
    getDefaultValue : function () {
        
        // If an explicitly specified defaultValue exists, respect it.
        var dV =  this.Super("getDefaultValue", arguments);
        if (dV == null && this.defaultToFirstOption) dV = this.getFirstOptionValue();
        
        return this._getValidValue(dV);
    },
    
    // selectItems have a limited set of valid values (represented by the valueMap).
    // this method will take a value, and ensure it is a member of the value map for the item.
    // The value will be returned if valid - otherwise this method returns null.
    _getValidValue : function (value) {
        
        // Disallow values that aren't in the valueMap.
        // If passed a value not in the valueMap:
        // - if our current (or 'previous') value is valid, return it
        // - if not, clear the value
        if (!this._valueIsValid(value)) {

            
            var alreadyChecking = this._checkingValidValue;
            this._checkingValidValue = true;
            var validValue;
            if (alreadyChecking) validValue = value;
            else validValue = this._localValue || this.getValue();

            // If the value passed in is the 'current value', or our previous value isn't
            // valid, clear the value.
            // [a null value is always considered valid by this mechanism].
            if (value == validValue || !this._valueIsValid(validValue)) {
                validValue = null;
            } 
            value = validValue;
        }       
        return value;
    },
    
    _valueIsValid : function (value) {
        

        // addUnknownValues is true, or there's an explicit optionDataSource, accept the value
        if (this.addUnknownValues || this.optionDataSource) return true;
        // there's an *implicit* ODS, and there is NOT a valueMap, accept the value
        if (!this.valueMap && this.getOptionDataSource()) return true;

        // Allow null values regardless of what the valueMap looks like
        
        if (value == null) return true;

        // Disallow values that aren't in the valueMap.
        // In multi-select mode, the value could be an array of choices.
        if (isc.isAn.Array(value)) {
            for (var i = 0; i < value.length; i++) {
                if (!this._valueInValueMap(value[i])) return false;
            }
            return true;
        } else {
            return this._valueInValueMap(value)
        }
    },

    _valueInValueMap : function (value) {
        var valueMap = this.getAllValueMappings(),
            undef;
        if (isc.isAn.Array(valueMap)) {
            return valueMap.contains(value)
        } else if (isc.isAn.Object(valueMap)) {
            return (valueMap[value] !== undef);
        } 
        return false;
    },

    //> @attr selectItem.escapeHTML (Boolean : false : IRW)
    // By default HTML values in a selectItem will be interpreted by the browser.
    // Setting this flag to true will causes HTML characters to be escaped, meaning the
    // raw value of the field (for example <code>"&lt;b&gt;AAA&lt;/b&gt;"</code>) is displayed
    // to the user rather than the interpreted HTML (for example <code>"<b>AAA</b>"</code>)
    // @group appearance
    // @visibility external
    //<
    // Implemented at the form item level - enable via the canEscapeHTML flag.
    canEscapeHTML:true,
    // escapeHTML also requires the pickList field has this property set - handled 
    // for the standard 'value' field via code in PickList.js.
    // For custom fields the developer would have to set this flag directly.
	
    // Display vs internal value mapping
    // mapValueToDisplay() allows us to convert internal value to  display value.
    
    mapValueToDisplay : function (internalValue, b,c,d) {
        if (this.isSelectOther) {
            if (internalValue == this.otherValue) return this.otherTitle;
            if (internalValue == this.separatorValue) return this.separatorTitle;
        }

        return this.invokeSuper(isc.SelectItem, "mapValueToDisplay", internalValue, b,c,d);
	},

    // String objects are used to be able to distinguish them from display values (even though
    // such display values would be invalid HTML fragments).
    _$beginARIAHiddenHTML: new String("<span aria-hidden='true'>"),
    _$endARIAHiddenHTML: new String("</span>"),
    _finishMapMultipleValueToDisplay : function (displayValues, values) {
        
        if (this.multiple && this._getShowDeletions()) {
            var tmp = [];

            var oldValues = this._getOldValue();
            var numOldValues;
            if (oldValues == null) numOldValues = 0;
            else if (!isc.isAn.Array(oldValues)) {
                oldValues = [oldValues];
                numOldValues = 1;
            } else {
                numOldValues = oldValues.length;
            }

            var numValues = (values == null ? 0 : values.length);

            var valuesSet = this._valuesSet,
                i = 0,
                j = 0,
                withinARIAHidden = false;
            while (i < numOldValues && j < numValues) {
                var oldValue = oldValues[i],
                    value = values[j];
                if (valuesSet.has(value)) {
                    if (values.contains(oldValue)) {
                        // `values[j]' was neither added nor deleted.
                        if (withinARIAHidden) {
                            tmp.add(this._$endARIAHiddenHTML);
                            withinARIAHidden = false;
                        }
                        tmp.add(displayValues[j]);
                        ++i;
                        ++j;

                    } else {
                        // `oldValues[i]' was removed.
                        if (!withinARIAHidden) {
                            tmp.add(this._$beginARIAHiddenHTML);
                            withinARIAHidden = true;
                        }
                        tmp.add("<span style='" +
                                String.asAttValue(this.valueDeselectedCSSText) +
                                "'>" +
                                this.mapValueToDisplay(oldValue) +
                                "</span>");
                        ++i;
                    }

                } else {
                    // `values[j]' is new.
                    if (withinARIAHidden) {
                        tmp.add(this._$endARIAHiddenHTML);
                        withinARIAHidden = false;
                    }
                    
                    tmp.add(displayValues[j]);
                    ++j;
                }
            }
            if (i < numOldValues) {
                
                if (!withinARIAHidden) {
                    tmp.add(this._$beginARIAHiddenHTML);
                    withinARIAHidden = true;
                }
                do {
                    tmp.add("<span style='" +
                            String.asAttValue(this.valueDeselectedCSSText) +
                            "'>" +
                            this.mapValueToDisplay(oldValues[i]) +
                            "</span>");
                } while (++i < numOldValues);
                tmp.add(this._$endARIAHiddenHTML);
                withinARIAHidden = false;
            } else if (j < numValues) {
                
                if (withinARIAHidden) {
                    tmp.add(this._$endARIAHiddenHTML);
                    withinARIAHidden = false;
                }
                do {
                    
                    tmp.add(displayValues[j]);
                } while (++j < numValues);
            }

            // Insert the multipleValueSeparator at places within `tmp'.
            for (var len = tmp.length, ri = len; ri > 1; --ri) {
                var str = tmp[ri - 1];
                if (str === this._$beginARIAHiddenHTML) {
                    if (ri >= 2) tmp.addAt(this.multipleValueSeparator, ri - 1);
                } else if (str === this._$endARIAHiddenHTML) {
                    if (ri < len) {
                        tmp.addAt(this.multipleValueSeparator, ri - 1);
                    }
                } else {
                    if (tmp[ri - 2] !== this._$beginARIAHiddenHTML &&
                        tmp[ri - 2] !== this._$endARIAHiddenHTML)
                    {
                        tmp.addAt(this.multipleValueSeparator, ri - 1);
                    }
                }
            }

            return tmp.join(isc.emptyString);
        } else return displayValues.join(this.multipleValueSeparator);
    },

    _finishMapValueToDisplay : function (displayValue, value) {
        if (this.multiple) {
            // NOTE: Don't check the pendingStatus because this may be called to update the element
            // value before the pendingStatus is updated.
            if (value != null && !this._defaultPendingStatusChangedBehaviorCanceled &&
                this._getShowPending() && !this._valuesSet.has(value))
            {
                
                if (this.pendingValueStyle) {
                    
                    if (!this.renderAsDisabled()) {
                        displayValue = ("<span class='" + this.pendingValueStyle + "'>" + 
                            displayValue + "</span>");
                    } else {
                        displayValue = ("<span class='" + this.pendingValueStyle + 
                            "Disabled'>" + displayValue + "</span>");
                    }
                } else {
                    displayValue = ("<span style='" +
                        // Pass the CSS text through asAttValue() in case it contains single quotes
                        // (e.g. "cursor: url('my-cursor.cur'), auto;").
                        String.asAttValue(this.editPendingCSSText) +
                        "'>" + displayValue + "</span>");
                }
            } else if (value == null && this._getShowDeletions()) {
                var tmp = this._finishMapMultipleValueToDisplay(null, null);
                if (tmp) displayValue = tmp;
                // Otherwise, leave the `displayValue' (which is probably set to the emptyDisplayValue)
                // as-is.
            }
        }
        return displayValue;
    },

    // getSelectedRecord()
    // For SelectItems there's a _localValue which gets set up before we store our
    // value properly.
    // This is used to allow change to occur on blur rather than just on standard 'change' event.
    //
    // For selectItems use the current _local value rather than the stored item value when
    // picking up the current record from the pickList. Otherwise you get unexpected behaviour if
    // (for example) custom formatters make use of the pick list records -- we'll see the last
    // selected record rather than the newly selected record until the change handler fires and
    // stores the value out.
    getSelectedRecord : function () {
        
        if (this.pickList == null || this.pickList.destroyed) this.makePickList(false);
    
        // We can't just say this.pickList.getSelectedRecord(), since the
        // value may not have been picked from a pickListClick -- instead force a selection
        // that matches our item value then retrieve the selected value.
        var undef,
            value = this._localValue;
        if (value === undef) value = this.getValue();
    
        if (this.selectItemFromValue(value, true)) {
            return this.pickList.getSelectedRecord();
        }
        // if we didn't find the selectedRecord in the pickList, call 'super'
        // this will pick up this._selectedRecord if present -- that gets set up by
        // the fetchMissingValues code in FormItem.
        
        return this.Super("getSelectedRecord", arguments);
    },

    //> @method selectItem.getSelectedRecords()
    // For a SelectItem with an +link{optionDataSource} and allowing multiple selection
    // (+link{multiple,via multiple:true}), returns the list of currently selected records, or
    // null if none are selected.
    // 
    // @return (Array of ListGridRecord) the list of selected records, or null if none are selected
    // @visibility external
    //< 
    getSelectedRecords : function () {
        var value = this._localValue;
        this.selectItemFromValue(value, true);
        var sel = this.pickList.getSelection();
        return (sel.length > 0 ? sel : null);
    },

    // Map valueToDisplay needs to pick up
    // the mapping between displayField and valueField, if there is one.
    // We implement this by overriding _mapKey() to check for the value in
    // our pickList's dataSet, in addition to checking against any explicitly specified valueMap
    
    
    _mapKey : function (value, dontReturnKey, a,b,c,d) {
        var displayValue = this.invokeSuper(isc.SelectItem, "_mapKey", value, true ,a,b,c,d);
        // _translateFieldValue part of the pickList interface
        if (displayValue == null && this.getDisplayFieldName() != null) {
            var translatedValue = this._translateValueFieldValue(value, false),
                undef;
            if (translatedValue !== undef) {
                displayValue = translatedValue;
            } else if (this.specialValues) {
                var map = this.specialValues;
                if (isc.isA.String(map)) map = this.getGlobalReference(map);

                // If it's an array, just return the key.  It's either in the array or not - no need
                // to transform.
                if (!isc.isAn.Array(map)) {
                    if (isc.PickList.emptyStoredValue && value === null) value = isc.PickList.emptyStoredValue;
                    displayValue =  isc.getValueForKey(value, map, value);
                }
            }
        }
        if (displayValue == null && !dontReturnKey) displayValue = value;            
        return displayValue;
    },
    
        
    // Override checkForDisplayFieldValue()
    // This is the method that, if we have a displayField specified, kicks off a fetch against
    // our optionDataSource to load the appropriate display value from the server.
    // In PickList based items we use the pickList data (if present) to map data to display 
    // values. 
    // Catch the case where checkForDisplayFieldValue is called when we are in the process of
    // fetching our pickList data from the server.
    // In this case we want to wait for the pickList data to be returned rather than kicking off
    // an additional fetch as our data value will usually be present in that pickList data.
    // When the pickList data returns we re-check this method. If the data is present, we're 
    // done, otherwise we need to kick off another fetch as we didn't find our data value in
    // the pickList data array. This can happen if the pickList data is paged, for instance.
    _checkForDisplayFieldValue : function (newValue, delayed) {
        var inValueMap = false;
        if (this.multiple) {
            // assert isc.isAn.Array(newValue)
            for (var i = 0, len = newValue.getLength(); !inValueMap && i < len; ++i) {
                inValueMap = (this._mapKey(newValue[i], true) != null);
            }
        } else {
            inValueMap = (this._mapKey(newValue, true) != null);
        }
        if (inValueMap) return;

        if (this._fetchingPickListData) {
            this._checkDisplayFieldValueOnFilterComplete = true;
            return;
        }        
        this.invokeSuper(isc.SelectItem, "_checkForDisplayFieldValue", newValue);
    },

    // Override _fetchMissingValueInProgress - if _checkDisplayFieldValueOnFilterComplete is true,
    // we are essentially fetching a missing value - though we aren't using the FormItem mechanism for it
    // This ensures the loadingDisplayValue shows up when expected
    
    _fetchMissingValueInProgress : function (checkDisplayFieldValues, newValue) {
    
        // Assertion - if we have the value in our _displayFieldValueMap, we've already
        // fetched and retrieved the display value
        var undef;
        if (newValue !== undef && checkDisplayFieldValues && this._displayFieldValueMap && 
            isc.propertyDefined(this._displayFieldValueMap, newValue)) 
        {
            return false;
        }
        // We only use the checkDisplayFieldValueOnFilterComplete flag to map from
        // data to display value, so only return true if the checkDisplayFieldValues arg was
        // passed.
        if (this._checkDisplayFieldValueOnFilterComplete && checkDisplayFieldValues) {
           return true;
        }
        return this.Super("_fetchMissingValueInProgress", arguments);
    },
    
    
        
    // INTERACTIONS WITH PICK-LIST ------------------------------------------------------------
    // comes from the interface
    
    // Include useful JSDoc from pickList

    //> @attr selectItem.pickListConstructor (SCClassName : "PickListMenu" : IR)
    // @include PickList.pickListConstructor
    //<

    //> @attr selectItem.pickTreeConstructor (SCClassName : "PickTreeMenu" : IR)
    // @include PickList.pickTreeConstructor
    //<

    //> @attr selectItem.dataSetType (String : "list" : IR)
    // @include PickList.dataSetType
    //<

    //> @attr SelectItem.optionDataSource (DataSource | String : null : IR)
    // @include PickList.optionDataSource
    //<
    
     //> @attr selectItem.textMatchStyle (TextMatchStyle : "startsWith" : IR)
    // @include PickList.textMatchStyle
    //<
    
    //> @attr SelectItem.pickListFields (Array of ListGridField : null : IRA)
    // @include PickList.pickListFields
    // @example relatedRecords
    //<
    
    //> @method SelectItem.fetchData()
    // @include PickList.fetchData()
    //<
    
    //>@attr selectItem.cachePickListResults (Boolean : true : IR)
    // @include pickList.cachePickListResults
    // @visibility external
    //<

    //> @attr SelectItem.fetchDisplayedFieldsOnly (boolean : null : IRA)
    // @include PickList.fetchDisplayedFieldsOnly
    //<
 
    //> @attr SelectItem.optionFilterContext (DSRequest Properties : null : IRA)
    // @include PickList.optionFilterContext
    //<
 
    //> @attr SelectItem.optionOperationId (String : null : [IR])
    // @include FormItem.optionOperationId
    // @visibility external
    //<
 
    //> @attr SelectItem.displayField (String : null : IRW)
    // @include PickList.displayField
    // @visibility external
    // @example relatedRecords
    //<
    
    //> @attr SelectItem.valueField   (String : null : IRW)
    // @include PickList.valueField
    // @visibility external
    // @example relatedRecords
    //<
    
    //> @method SelectItem.getDisplayFieldName() ([A])
    // @include PickList.getDisplayFieldName
    // @visibility external
    //<
    
    //> @method SelectItem.getValueFieldName() ([A])
    // @include PickList.getValueFieldName
    // @visibility external
    //<
    
    //> @attr SelectItem.filterLocally
    // @include PickList.filterLocally
    // @visibility external
    //<
    
    //> @method SelectItem.dataArrived()
    // @include PickList.dataArrived()
    // @visibility external
    //<
    
    //> @method SelectItem.getSelectedRecord()
    // @include FormItem.getSelectedRecord()
    // @visibility external
    //<
    
    //> @attr SelectItem.pickListCriteria (Criteria : null : IRWA)
    // @include PickList.pickListCriteria
    // @visibility external
    //<
    
    //> @attr SelectItem.showOptionsFromDataSource (boolean : null : IRWA)
    // @include PickList.showOptionsFromDataSource
    // @visibility external
    //<
    
    //> @attr SelectItem.pickListProperties (ListGrid Properties : null : IRA)
    // @include PickList.pickListProperties
    // @visibility external
    //<

    //> @attr SelectItem.pickList (ListGrid AutoChild : null : RA)
    // @include PickList.pickList
    // @visibility external
    //<

    //> @attr SelectItem.sortField (String | Array of String | Integer : null : IR)
    // @include PickList.sortField
    // @visibility external
    //<

    //> @attr SelectItem.initialSort (Array of SortSpecifier : null : IR)
    // @include PickList.initialSort
    // @visibility external
    //<

    // Override the method to get pickList data to add unknown values and selectOther
    // properties
    
    getClientPickListData : function () {
        if (this._clientPickListData) return this._clientPickListData;
        
        var records = isc.PickList.optionsFromValueMap(this),
            valueField = this.getValueFieldName();
        var specialValues = this._getSpecialValues(true);
        if (specialValues) {
            if (this.separateSpecialValues) {
                this.updateSpecialValues(specialValues);
            } else {
                if (this.multiple) {
                    for (var i = 0; i< specialValues.length; i++) {
                        specialValues[i] = isc.addProperties(specialValues[i], {canSelect:false});
                    }
                }
                records.addListAt(specialValues, 0);
            }
        }
        // The current selected value must always be present in the records for the VM.
        
        
        var value = this.getValue();
        // don't add the value if value is an array;  this means the item is in 
        // multiselect mode
        
        if (value != null && !isc.isAn.Array(value)) {
            if (this.addUnknownValues != false && records.find(valueField, value) == null) {
                var newRecord = {};
                newRecord[valueField] = value;
                // If a displayField was specified, apply the value to that as well - this
                // means we won't see a blank line in the pickList for the current value
                if (this.displayField) {
                    newRecord[this.getDisplayFieldName()] = value;
                }
                records.addAt(newRecord, 0);
            }
        }
        
        if (this.isSelectOther) {
            var separator = {},
                other = {};

            separator[valueField] = this.separatorValue;
            other[valueField] = this.otherValue;
            
            records.addListAt([separator, other], records.length);
        }
        
        this._clientPickListData = records;

        
        return records;
    },
    
    // Override the method to update display values in special values
    updateDisplayValueMap : function (needsRefresh) {
        this.Super("updateDisplayValueMap", arguments);

        // SpecialValues can be used to pull existing records
        // to the top for easy selection. The original record
        // remains in place as well. When the display field
        // changes on the existing record it must be updated
        // in the special values array as well.
        if (this._specialValues && this._displayFieldCache) {
            var displayField = this.getDisplayFieldName();
            if (displayField) {
                var cache = this._displayFieldCache,
                    valueField = this.getValueFieldName(),
                    specialValues = this._specialValues,
                    updatedSpecialValues = false
                ;
                for (var i = 0; i < specialValues.length; i++) {
                    var specialValue = specialValues[i],
                        value = specialValue[valueField],
                        record = cache.find(valueField, value)
                    ;
                    if (this.multiple && !this.separateSpecialValues) {
                        specialValue = isc.addProperties(specialValue, {canSelect:false});
                    }

                    if (record != null) {
                        specialValue[displayField] = record[displayField];
                        updatedSpecialValues = true;
                    }
                }
                if (updatedSpecialValues && this.separateSpecialValues) {
                    if (this.separateValuesList) this.separateValuesList.markForRedraw();
                }
            }
        }
        
    },

    // Use the 'formatPickListValue()' method to display the appropriate title for the
    // special selectOther options.
    formatPickListValue : function (value, fieldName, record) {
        if (this.isSelectOther && (fieldName == this.getValueFieldName())) {
            if (value == this.otherValue) return this.otherTitle;
            if (value == this.separatorValue) return this.separatorTitle;
        }
        
        // apply standard formatter to the value in the single generated field for
        // standard pick lists.
        // This handles formatters applied via simpleType as well as any
        // 'formatValue()' method applied to this item
        var field = this.pickList.getField(fieldName);
        if (field && field._isGeneratedField) {
            return this._formatDataType(value);
        }
        
        return value;
    },
    
    // pickValue : select the picked value.
    
    pickValue : function (value) {        
        var record;
        // get the selected-record so it can be passed to changeToValue(), which may add it
        // to the displayFieldCache
        if (this.dataSetType == "tree" && this.pickList && this.pickList.selection) {
            record = this.pickList.selection.lastSelectionItem;
        }

        // selectOther behavior:
        // If the user selects the separator, treat this as a null selection.
        // If they select the "other" value, pop a prompt to get the value to use.
        
        if (this.isSelectOther) {
            if(this.getSelectOtherValue(value)) return;
        }
        
        // use changeToValue() to update the value and fire the change handler
        this.changeToValue(value, 
            (this.changeOnValueChange && this.fireChangeOnSelect != false),
            record
        );
    },

    //>@method SelectItem.getPickListPosition() (A)
    // Returns the global left and top coordinates for the pickList.
    // Default implementation always draws the pick-list below the Select Item - override for
    // any special implementation.
    // @return (Array)  2 element array indicating left and top coordinate for the pick list.
    //<
    getPickListPosition : function () {
        var itemTop = this.getPageTop(),
            top =  itemTop + this.getHeight(),
            left = this.getPageLeft(),
            pageTop = isc.Page.getScrollTop(),
            pageBottom = isc.Page.getHeight() + pageTop;
        
        // we auto-fit the pickList to the data.
        // If it's not yet drawn it may not have autofitted yet - so determine the expected height
        var height;
        if (!this.pickList.isDrawn()) {
            var data = this.pickList.data;
            if (data == null || data.getLength() == 0) {
                height = this.emptyPickListHeight;    
            } else {
                height = Math.min(
                            (data.getLength() * this.pickList.cellHeight) +
                            (this.pickList.showHeader ? this.pickList.headerHeight : 0) +
                            (this.pickList.showFilterEditor ? this.pickList.filterEditorHeight : 0),
                            this.pickListHeight);
            }
        } else {
            height = this.pickList.getVisibleHeight();
        }
       
        // If the pickList would extend beyond the end of the page, show it above the select 
        // item
        if (top + height > pageBottom) {
            top = Math.max(pageTop, (itemTop - height));
        }
        
        // In RTL mode we want to shift so the right edge rather than the left edge is aligned
        // with us
        if (this.containerWidget.isRTL()) {                    
            left += this.getVisibleWidth();
            left -= this.pickList.getVisibleWidth();
        }
            
            
        return [left,top];
    },

    // override updateValueMap to update the list and update the displayed value if necessary.
    updateValueMap : function (refreshDisplay) {
        this.Super("updateValueMap", arguments);
        // This method is called from filter-complete with a flag set to suppress display
        // of the new valueMap. In that case nothing to do here
        if (this._processingFilterComplete) return;

        // Otherwise we've got a totally new set of values or new optionDataSource.
        // Hide and detatch from the the pickList so it gets refreshed when re-shown.
        if (this._clientPickListData) delete this._clientPickListData;
        var reShowPickList = false;
        if (this.hasPickList() && 
            // If the optionDataSource hasn't changed to a different DS, but the
            // data within that ODS has changed, ResultSet behavior automatically
            // handles updating to display new options so no need to hide/show
            // the pickList (forcing it to repopulate, which is visible to the user).
            (!this.getOptionDataSource() ||
                (this.pickList.getDataSource() != this.getOptionDataSource())) )
        {
            if (this.pickList.isVisible() && this.pickList.isDrawn()) {
                this.hidePicker();
                reShowPickList = true;
            } 
            // clear the 'formItem' property on the pickList - ensures it will have its data
            // reset when it is next shown.     
            delete this.pickList.formItem;
        }
        // if the current value is no longer valid, update it.
        var currentValue = this.getValue(),
            value = this._getValidValue(currentValue);            
        if (currentValue != value) {
            this.setValue(value);
        } else {
            // Even if the value is unchanged, its display value is likely to be different, so
            // do a setElementValue.

            this._setElementValue(this._getDisplayValue(value), value);
        }
        if (reShowPickList) this.showPicker();
    },

    // Returns true if this item has its picklist already set up
    hasPickList : function () {
        // note the check for this.pickList.formItem pointing back to this select is required
        // for the case where the pickList is reused.
        return (this.pickList && !this.pickList.destroyed && this.pickList.formItem == this);
    },
    
    // Returns true if this item's pickList is showing.
    pickListVisible : function () {
        return (this.hasPickList() && this.pickList.isDrawn() && this.pickList.isVisible());
    },
    
    // If we get yanked out of the DOM, ensure our pickList gets hidden
    cleared : function () {
        var rv = this.Super("cleared", arguments);
        // hide the pickList *after* calling Super. This ensures that this.isDrawn() returns false
        // so we don't try to focus in a stale focus element thats been removed from the DOM, etc.
        
        if (this.pickListVisible()) this.pickList.hide();
        return rv;
    },
    
    // Override filterComplete to 
    // - Add an empty entry to the top of the list if this.allowEmptyValue is true
    // - Add specialValues to the top of the list if this.specialValues and not separateSpecialValues
    filterComplete : function () {
        // If we are allowing empty or special values we always to 'basic' filtering, which means
        // we can directly add the entries to the ResultSet's cache

        var specialValues = this._getSpecialValues(true);
        if (specialValues) {
            if (this.specialValues && this.separateSpecialValues) {
                this.updateSpecialValues(specialValues);
            } else {
                var data = this.pickList.getOriginalData(); // handle the pl being grouped
                if (isc.isA.ResultSet(data)) {
                    
                    var recordAdded = data.addSpecialValueRecords(this.getValueFieldName(), this.getDisplayFieldName(), specialValues);
                    if (recordAdded) {
                        if (this.pickListVisible()) this.pickList.markForRedraw();
                    }
                }
            }
        }
        var interfaceFilterComplete = isc.PickList.getPrototype().filterComplete;
        interfaceFilterComplete.apply(this, arguments);
    },

    // hasInternalNavigation is true for Selects - used by ComponentEditor
    hasInternalNavigation: true
});

// Mix in the PickList interface - handles creating and showing the PickList itself.
isc.ClassFactory.mixInInterface("SelectItem", "PickList");


isc.SelectItem.registerStringMethods({
    dataArrived:"startRow,endRow,data",
    getPickListFilterCriteria:""
});

} else {

    

    isc.Log.logWarn("Source for standard SelectItem class included in this module, but required " +
        "related class (ListGrid) is not loaded. This can occur if the Forms module is " +
        "loaded without the Grids module. SelectItem class will be defined as " +
        "a subclass of NativeSelectItem.", "moduleDependencies");

    isc.ClassFactory.defineClass("SelectItem", "NativeSelectItem");

}


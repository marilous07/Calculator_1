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
//>	@class	ColorItem
// Form item for selecting a color via a pop-up +link{ColorPicker}.
//
// @inheritsFrom TextItem
// @treeLocation Client Reference/Forms/Form Items
// @visibility external
//<

isc.ClassFactory.defineClass("ColorItem", "TextItem");

//> @class  ColorPickerItem
// Form item for selecting a color via a pop-up +link{ColorPicker}. This is an alias of
// +link{ColorItem}.
//
// @inheritsFrom ColorItem
// @visibility external
//<
// Alias for smartgwt
isc.addGlobal("ColorPickerItem", isc.ColorItem);

isc.ColorItem.addProperties({
    // Don't update on keystrokes, as we're verifying the color on change.
    changeOnBlur:true,
    changeOnKeypress:false,

    // Properties for the default formItem picker handling code
    pickerConstructor: "ColorPicker",
    pickerDefaults: {
        // By default the form item 'picker' subsystem will fired pickerDataChanged in response
        // to a picker firing its dataChanged() method.
        // ColorChoosers support 'colorSelected()' rather than dataChanged, so override this
        // notification method to fire pickerColorSelected instead.
        colorSelected : function (color, opacity) { 
            this.callingFormItem._pickerColorSelected(color, opacity) 
        },
        pickerCancelled : function () {
            this.callingFormItem._pickerCancelled();
        }
    },

    //> @attr colorItem.showPickerIcon (Boolean : true : IRW)
    // Should the pick button icon be shown for choosing colors from a ColorPicker
    // @visibility external
    //<
    showPickerIcon:true,

    //> @attr colorItem.overlayPickerImage (Boolean : null : IRW)
    // When set to true, shows the picker-icon on top of the color-square when this item has a
    // value.  Shows a dark icon when the selected color is light, and a light icon otherwise.
    // The +link{ColorItem.pickerIconSrc,pickerIconSrc} will have the suffix 
    // <code>"_overlayLight"</code> or <code>_overlayDark</code>, depending on the current
    // selected color.
    // @visibility internal
    //<
    //overlayPickerImage: true,

    //> @attr colorItem.showEmptyPickerIcon (boolean : false: IRA)
    // When this <code>ColorItem</code>'s value is empty, should an <code>"empty"</code> state
    // be applied to the picker icon? If <code>true</code>, then the +link{ColorItem.pickerIconSrc,pickerIconSrc}
    // will have the suffix <code>"_empty"</code> and the icon style will have <code>"empty"</code>
    // appended to it.
    // @visibility internal
    //<
    showEmptyPickerIcon:false,

    //>	@attr	colorItem.pickerIconWidth (Integer : 18 : IRW)
    // @include FormItem.pickerIconWidth
    // @visibility external
    //<
    pickerIconWidth:18,

    //>	@attr	colorItem.pickerIconHeight    (Integer : 18 : IRW)
    // @include FormItem.pickerIconHeight
    // @visibility external
    //<
    pickerIconHeight:18,
    
    // separate the colored square icon from the dataElement a bit
    pickerIconHSpace: 2,

    //> @attr colorItem.pickerIconSrc (SCImgURL : "[SKIN]/DynamicForm/ColorPicker_icon.png" : IRW)
    // @include FormItem.pickerIconSrc
    // @visibility external
    //<
    // Note - by default this image has a transparent patch allowing the
    // background color to show through.
    pickerIconSrc:"[SKIN]/DynamicForm/ColorPicker_icon.png",

    //> @attr colorItem.pickerIconPrompt (HTMLString : "Click to select a new color" : IR)
    // @include formItem.pickerIconPrompt
    // @group i18nMessages
    // @visibility external
    //<
    pickerIconPrompt: "Click to select a new color",
    
    //> @attr colorItem.defaultPickerMode (ColorPickerMode : "simple" : IR)
    // The +link{ColorPicker.defaultPickMode,defaultPickMode} for the +link{ColorPicker} associated
    // with this <code>ColorItem</code>.
    // @see ColorPicker.defaultPickMode
    // @visibility external
    //<
    defaultPickerMode: "simple",

    //>@attr colorItem.allowComplexMode (Boolean : true : IR)
    // Should "complex" mode be allowed for the +link{ColorPicker} window associated with  
    // this ColorItem?<p>
    // If false, no "More" button is shown on the simple picker
    // @visibility external
    //<     
    allowComplexMode: true,
    
    //> @attr colorItem.supportsTransparency (Boolean : true : IRW)
    // Determines whether the +link{ColorPicker} associated with this ColorItem allows the user 
    // to set transparency/opacity information whilst selecting a color. If false, no opacity
    // slider is shown and all colors are 100% opaque.<p>
    // When an opacity value is selected, the HTML color string produced is 8 characters long
    // because the opacity setting is included.
    // You can also capture the the separate color and opacity information by overriding 
    // +link{pickerColorSelected}.
    // @visibility external
    //<
    supportsTransparency : true,
    
    // Disable native spellChecking on color fields
    browserSpellCheck:false,

    defaultType: "color"
});

isc.ColorItem.addMethods({

    // Override updateValue to validate the color, and update the icon color
    _$empty: "empty",
    // when overlayPickerImage is true, show an image suffixed _overlayLight or _overlayDark
    _$overlay: "overlay",
    
    updateValue : function () {
        var color = isc.tinycolor(this.getElementValue());
        if (color.isValid()) {
            if (!this.supportsTransparency) {
                // prevent users from typing in 'transparent', or semi-transparent colors
                if (color.getOriginalInput() == "transparent") {
                    // default 'transparent' to white
                    color = isc.tinycolor("#ffffff");
                } else {
                    // otherwise, make the color fully opaque
                    color.setAlpha(1);
                }
            }
            // map whatever was typed in to the expected display format
            this.setElementValue(this.toDisplayFormat(color));
        }
        
        // Allow the superclass implementation to actually update the value
        this.Super("updateValue", arguments);

        // update the icon background color.
        if (this.showPickerIcon) { 
            this.modifyPickerIcon();
        }

        if (this.colorChanged) this.colorChanged(this.getColor());
    },

    //> @attr colorItem.retainColorNames (Boolean : true : IRW)
    // Should valid color-names, like 'red', be retained as the item's value?  If set to false,
    // color-names will be converted to their associated color-values.
    // @visibility internal
    //<
    retainColorNames: false,
    //> @attr colorItem.upperCaseHexValues (Boolean : true : IRW)
    // Should hex color-values use upper-cased letters, like '#FF00FF'.
    // @visibility internal
    //<
    upperCaseHexValues: true,

    storageFormat: "hex",
    toStorageFormat : function (value) {
        var color = isc.tinycolor(value);
        if (color.isValid()) {
            if (color.getOriginalInput() == "transparent") return "transparent";
            if (this.storageFormat == "hex") {
                if (this.retainColorNames && color._format == "name") return color.toString("name");
                var result;
                if (color.getAlpha() != 1 && this.supportsTransparency) {
                    // show 8-char hex to include the alpha value
                    result = color.toHex8String();
                } else {
                    // ignore any alpha, just use the 6-char hex value
                    result = color.toHexString();
                }
                return this.upperCaseHexValues ? result.toUpperCase() : result;
            } else {
                return color.toRgbString();
            }
        }
        return "";
    },
    displayFormat: "hex",
    toDisplayFormat : function (value) {
        var color = isc.tinycolor(value);
        if (color.isValid()) {
            if (color.getOriginalInput() == "transparent") return "transparent";
            if (this.displayFormat == "hex") {
                if (this.retainColorNames && color._format == "name") return color.toString("name");
                var result;
                if (color.getAlpha() != 1 && this.supportsTransparency) {
                    // show 8-char hex to include the alpha value
                    result = color.toHex8String();
                } else {
                    // ignore any alpha, just use the 6-char hex value
                    result = color.toHexString();
                }
                return this.upperCaseHexValues ? result.toUpperCase() : result;
            } else {
                return color.toRgbString();
            }
        }
        return "";
    },
    mapDisplayToValue : function (display) {
        var color = isc.tinycolor(display);
        if (color.isValid()) {
            return this.toStorageFormat(color);
        }
        return display;
    },
    mapValueToDisplay : function (value) {
        if (value == "transparent") return "transparent";
        var color = isc.tinycolor(value);
        if (color.isValid()) {
            return this.toDisplayFormat(color);
        }
        return value || "";
    },
    
    getColor : function () {
        return isc.tinycolor(this.getValue());
    },

	//>	@method colorItem.getDefaultValue() (A)
	// Override getDefaultValue to guarantee that it returns a color (or null)
	//<
	getDefaultValue : function () {
		var value = this.Super("getDefaultValue", arguments);
        if (value && !isc.isA.color(value)) {
            this.logWarn("Default value:" + value + " is not a valid color identifier." + 
                        " Ignoring this default.");
            value = this.defaultValue = null;
        }
        return value;
	},

    // Override 'showPicker' to pass in supportsTransparency
    showPicker : function () {
        var props = isc.addProperties({}, this.pickerDefaults);
        props.defaultPickMode = this.defaultPickerMode;
        props.allowComplexMode = this.allowComplexMode;
        props.supportsTransparency = this.supportsTransparency;
        this.picker = isc.ColorPicker.getSharedColorPicker(props);
        var picker = this.picker;

        var oldItem = picker.callingFormItem;
        if (oldItem != this) {
            picker.callingFormItem = this;
            picker.callingForm = this.form;
        }
        picker.setSupportsTransparency(this.supportsTransparency);
        if (picker.allowComplexMode) {
            if (picker._currentPickMode == 'simple') {  
                picker.modeToggleButton.setTitle(picker.moreButtonTitle);
            } else {
                picker.modeToggleButton.setTitle(picker.lessButtonTitle);
            }
        }

        // pass the tinycolor object to the picker
        picker.setColor(this.getColor());

        if (!this.isObserving(picker, "visibilityChanged")) {
            this.observe(picker, "visibilityChanged", this.pickerVisibilityChanged);
        }

        // store the value before showing the picker - revert to this in _pickerCancelled
        // if the picker is canceled
        this._revertToValue = this.getValue();
        return this.Super("showPicker", arguments);
    },

    _pickerCancelled : function () {
        this.setValue(this._revertToValue);
        delete this._revertToValue;
    },
    
    _pickerColorSelected : function (color, opacity) {
        if (this.pickerColorSelected) this.pickerColorSelected(color, opacity);

        var colorObj = isc.tinycolor(color);
        if (colorObj.isValid()) {
            // apply semi-transparency
            this.opacity = opacity != null ? opacity : 100;
            colorObj.setAlpha(this.opacity / 100);
            color = this.toStorageFormat(colorObj);
        }
        
        if (this.hasDataElement()) this.setElementValue(color);
        else this.setValue(color);
        this.updateValue();

        // fire undoc'd pickerColorChanged() hook after the value is fully updated
        if (this.pickerColorChanged) this.pickerColorChanged(color);
    },

    //> @method colorItem.pickerColorSelected()
    // Store the color value selected by the user from the color picker.  You will need to 
    // override this method if you wish to capture opacity information from the
    // +link{ColorPicker}.
    // @param color   (String)  The selected color as a string.
    // @param opacity (Integer) The selected opacity, from 0 (transparent) to 100 (opaque),
    //                          or null if +link{supportsTransparency} is false or the
    //                          +link{ColorPicker,color picker} selected a color while in
    //                          +link{ColorPickerMode,simple mode}.
    // @visibility external
    //<
    pickerColorSelected : function (color, opacity) { },

    pickerVisibilityChanged : function (isVisible) {
        if (!isVisible) {
            this.focusInIcon("picker");
            // Ignore it - we share the picker so don't want to be notified if
            // another item shows/hides the same picker widget.
            this.ignore(this.picker, "visibilityChanged");
        }
    },

    // Override setValue to ensure we update the color swatch icon.
    setValue : function (value, b, c, d) {
        // support color-strings in any format
        var color = isc.tinycolor(value);
        // but store as RGBA, for easier semi-transparency support
        if (color.isValid()) {
            if (color.getOriginalInput() == "transparent") value = "transparent";
            // one-time conversion to rgb as a standard
            else value = this.toStorageFormat(color);
            this.opacity = color.getAlpha() * 100;
        } else value == "";

        value = this.invokeSuper(isc.ColorItem, "setValue", value, b, c, d);
        if (this.showPickerIcon) {
            this.modifyPickerIcon();
        }
        return value;
    },
    
    modifyPickerIcon : function () {
        var pickerIcon = this.getPickerIcon();
        var value = this.getValue();
        var isEmpty = (value == null || isc.isAn.emptyString(value));
        var color = this.getColor();
        if (color.isValid()) {
            value = color.toRgbString();
            isEmpty = (value == null || isc.isAn.emptyString(value));
            this.setIconBackgroundColor(pickerIcon, isEmpty ? isc.emptyString : color.toRgbString());
            if (color.toString() == "transparent") {
                // value is "transparent"
                this.setIconCustomState(pickerIcon, "transparent");
            } else if (this.overlayPickerImage) {
                var iconSuffix = this._$overlay;
                iconSuffix += color.isDark() ? "Light" : "Dark";
                this.setIconCustomState(pickerIcon, iconSuffix);
            } else if (this.showEmptyPickerIcon) {
                this.setIconCustomState(pickerIcon, isEmpty ? this._$empty : null);
            }
        } else {
            this.setIconBackgroundColor(pickerIcon, isc.emptyString);
            if (this.overlayPickerImage) {
                // default to showing the regular overlay icon
                this.setIconCustomState(pickerIcon, this._$overlay + "Dark")
            } else if (this.showEmptyPickerIcon) {
                this.setIconCustomState(pickerIcon, this._$empty);
            }
        }
        this.updateState();
    }

});

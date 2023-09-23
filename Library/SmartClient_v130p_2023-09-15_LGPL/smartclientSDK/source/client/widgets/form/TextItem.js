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
//>	@class	TextItem
//
// FormItem for managing a text field.
//
// @inheritsFrom FormItem
// @visibility external
// @example textItem
//<
isc.ClassFactory.defineClass("TextItem", "FormItem");

//	Add class-level properties
//		You can access these properties on the static class object.
//		e.g.,	Canvas.myStaticProperty

isc.TextItem.addClassProperties({

    //>	@type CharacterCasing
    // @visibility external
    // @group validation
    // @value isc.TextItem.DEFAULT No character translation
    // @value  isc.TextItem.UPPER  Map characters to uppercase
    // @value  isc.TextItem.LOWER  Map characters to lowercase
    //<

    //> @classAttr TextItem.DEFAULT (Constant : "default" : [R])
    // A declared value of the enum type  
    // +link{type:CharacterCasing,CharacterCasing}.
    // @visibility external
    // @constant
    //<
    DEFAULT:"default",

    //> @classAttr TextItem.UPPER (Constant : "upper" : [R])
    // A declared value of the enum type  
    // +link{type:CharacterCasing,CharacterCasing}.
    // @visibility external
    // @constant
    //<
    UPPER:"upper",

    //> @classAttr TextItem.LOWER (Constant : "lower" : [R])
    // A declared value of the enum type  
    // +link{type:CharacterCasing,CharacterCasing}.
    // @visibility external
    // @constant
    //<
    LOWER:"lower",

    // Filter definitions for mask characters
    _filterDefinitions: {
        '0': { charFilter: "[0-9+\\-]" },
        '#': { charFilter: "[0-9]" },
        '9': { charFilter: "[0-9 ]" },
        'L': { charFilter: "[A-Za-z]" },
        '?': { charFilter: "[A-Za-z ]" },
        'a': { charFilter: "[0-9A-Za-z]" },
        'A': { charFilter: "[0-9A-Za-z]" },
        'C': { charFilter: "." }
    },

    _needNegativeMargins: isc.Browser.isIE &&
                          isc.Browser.version <= 9 &&
                          (isc.Browser.version <= 7 || !isc.Browser.isStrict),
         
    //> @classAttr TextItem.suppressClearIconClassName (String : "isc_suppressClearIcon" : IRA)
    // Reserved css className applied to TextItem <i>&lt;input &gt;</i> elements where 
    // +link{textItem.suppressBrowserClearIcon} is true.
    // <P>
    // Note that this is an advanced property and in most cases developers do not need to
    // be aware of it. The style definition for this style-name will be 
    // generated automatically with appropriate css content to suppress the browser
    // clear icon. It is documented only so that developers are aware that this css className
    // (and can choose a different name in the extremely rare case where this name has
    // meaning within their application code).
    // @visibility external
    //<
    // This property is documented as read-only. It is technically writeable but only
    // before any TextItems with the suppressBrowserClearIcon flag have been created
    suppressClearIconClassName:"isc_suppressClearIcon",

    createClearIconCSSDefinition : function () {
        if (this._clearIconCSSElement == null) {
            this._clearIconCSSElement = isc.Canvas.create({
                visibility:"hidden",
                width:1, height:1,
                top:1,
                _generated:true,
                autoDraw:false,
                getInnerHTML : function () {
                    return "<style>."
                        + isc.TextItem.suppressClearIconClassName 
                        + "::-ms-clear {width:0;height:0;}</style>"
                }
            });
            this._clearIconCSSElement.draw();
        }
    }

});

isc.TextItem.addProperties({
    //>	@attr	textItem.width		(number : 150 : IRW)
	//			Default width for fields.
	//		@group	appearance
    // @visibility external
	//<
	width:150,		
    
    //>	@attr	textItem.height		(number : 19 : IRW)
	//			Default height for text items.
	//		@group	appearance
    // @visibility external
	//<                                       
    
    height:isc.Browser.isSafari ? 22 : 19,

    //>	@attr	textItem.textBoxStyle     (FormItemBaseStyle : "textItem" : IRW)
	//  Base CSS class name for this item's input element.
    // NOTE: See the +link{group:CompoundFormItem_skinning} discussion for special skinning considerations. 
    // <p>
    // For a rounded text item, you can set <code>textBoxStyle</code> to "roundedTextItem".
    // This style exists only in Enterprise, EnterpriseBlue and Graphite skins.  There is
    // no corresponding rounded style for SelectItem or ComboBoxItem as this creates an
    // awkward seam with the pop-up list (and a rounded pop-up list wouldn't help: data could
    // not be flush to corners).  For these reasons we recommend rounded inputs only in
    // limited cases like single standalone fields.
	// @group	appearance
    // @visibility external
	//<
	textBoxStyle:"textItem",		

    //>	@attr	textItem.length		(number : null : IRW)
	// If set, the maximum number of characters for this field. If 
    // +link{textItem.enforceLength,enforceLength} is set to true, user input will be limited 
    // to this value, and values exceeding this length passed to 
    // +link{formItem.setValue(),setValue()} will be trimmed. Otherwise values exceeding the 
	// specified length will raise an error on validation.
	// <P>
    // If the item has a numeric type, like +link{class:IntegerItem, integer} or 
    // +link{class:FloatItem, float}, length is applied to the raw number value, after any
    // specified +link{formItem.decimalPrecision, decimalPrecision} and 
    // +link{formItem.decimalPad, decimalPad} but before any formatters - this means the string
    // measured includes sign and decimal placeholder, and padded decimal places as required,
    // but not thousands separators or any custom formatting.
    // <P>
	// See also +link{dataSourceField.length}.
	// @group	validation
    // @visibility external
	//<
	length:null,
	
	//> @attr textItem.enforceLength (boolean : true : IRW)
	// If a +link{textItem.length} is specified for this item, should user input be limited
	// to the specified length? If set to true, user input and values passed to 
	// +link{formItem.setValue(),setValue()} will be trimmed to the specified length. Otherwise values
	// exceeding the specified length will raise an error on validation.
	// <P>
	// Note that having this value set to true limits user interactivity in some ways.
	// For example users would be unable to paste a longer string into the field for
	// editing without seeing it be truncated.
	// @visibility external
	//<
	enforceLength:true,

    // whether its possible for this type of FormItem to do autoCompletion
    canAutoComplete:true,

	//>	@attr	textItem._elementType			(String : "TEXT" : IRW)
	//			type of field (eg: "PASSWORD", "UPLOAD", etc)
	//<		
	_elementType:"TEXT",

    //> @attr   textItem._hasDataElement    (boolean : true : IRW)
    //      Text items have a data element.
    // @group formValues
    // @visibility   internal
    // @see     method:FormItem.hasDataElement
    // @see     method:FormItem.getDataElement
    //<
    _hasDataElement:true,
    
    // Set flag to indicate that our data element is used as the textBox for this item.
    // This flag means updateState will apply the result of this.getTextBoxStyle() to this item's
    // data element - appropriate for native text boxes, text areas and selects.
    _dataElementIsTextBox:true,

    //> @attr   textItem.emptyStringValue   (Any : null : IRW)
    // How should an empty string entered by the user be stored?
    // This value is typically set to <code>null</code> or <code>""</code>.
    // <P>
    // Note that a call to +link{formItem.setValue(),setValue(null)} or +link{formItem.setValue(),setValue("")}
    // automatically updates this property to ensure that "empty" values are stored in a 
    // consistent format.
    // @group formValues
    // @visibility   external
    //<    
    
    emptyStringValue:null,
    
    // Override redrawOnShowFormIcon - we can handle dynamically updating the item's HTML to
    // show / hide text item icons
    redrawOnShowIcon:false,
    // setting clipValue to true ensures we resize the text box when showing/hiding icons
    clipValue:true,

    // _nativeEventHandlers is a place to specify native event handlers to be applied to the
    // form item element once it has been written into the DOM (without having to override 
    // '_applyHandlersToElement()'
    _nativeEventHandlers : {

        
        onmousedown : (
            isc.Browser.isIE ? function () {
                var element = this,
                    itemInfo = isc.DynamicForm._getItemInfoFromElement(element),
                    item = itemInfo.item;
                if (item) item._setupFocusCheck();

            } :
            // iOS <= 4.3.2 doesn't give us normal touch start / touch end events when the user
            // touches a text item to focus in it. iOS 5.0+ does fire touch start / touch end events,
            // however, so only use this native handler for affected versions or else we'll process
            // two "mouse down" events.
            // Therefore use explicit handlers for this.
            
            isc.Browser.isIPhone && isc.Browser.iOSVersion < 5 ? function (e) {
                var EH = isc.EventHandler;
                EH.DOMevent = e;
                var	event = EH.getMouseEventProperties(e);
                return EH.handleMouseDown(e, event);
            } : null
        ),

        onmouseup : (
            isc.Browser.isIPhone && isc.Browser.iOSVersion < 5 ? function (e) {
                var EH = isc.EventHandler;
                EH.DOMevent = e;
                var	event = EH.getMouseEventProperties(e);
                return EH.handleMouseUp(e, event);
            } : null
        )
    },

    //> @attr textItem.browserSpellCheck (boolean : null : IRWA)
    // @include FormItem.browserSpellCheck
    // @visibility internal
    //<
    

    //> @attr textItem.browserAutoCapitalize
    // @include FormItem.browserAutoCapitalize
    // @visibility external
    //<

    //> @attr textItem.browserAutoCorrect
    // @include FormItem.browserAutoCorrect
    // @visibility external
    //<

    //> @attr textItem.browserInputType (String : null : IRA)
    // This property corresponds to the HTML5 "inputType" attribute applied to the &lt;input&gt;
    // element for this TextItem.
    // <p>
    // The only currently supported use of this attribute is hinting to touch-enabled mobile
    // devices that a particular keyboard layout should be used.  Even here, be careful; to
    // take a random example, using type "number" on Android up to at least 3.2 leads to a
    // keyboard with no "-" key, so negative numbers cannot be entered.
    // <p>
    // <b>Valid values:</b>
    // <table class="normal" cellpadding="2">
    //   <tbody>
    //   <tr>
    //     <td valign="top"><em>"text"</em></td>
    //     <td>Normal text keyboard</td>
    //   </tr>
    //   <tr>
    //     <td valign="top"><em>"digits"</em></td>
    //     <td>Makes the text field more suitable for entering a string of digits 0 - 9. On iOS,
    //         this causes the virtual keyboard to show a numeric keypad with only "0", "1",
    //         "2", ..., "9", and delete keys.</td>
    //   </tr>
    //   <tr>
    //     <td valign="top"><em>"email"</em></td>
    //     <td>Makes the text field more suitable for entering an e-mail address. On iOS, this
    //         causes the virtual keyboard to show special "@" and "." keys on the alphabetic
    //         keys screen.</td>
    //   </tr>
    //   <tr>
    //     <td valign="top"><em>"tel"</em></td>
    //     <td>Makes the text field more suitable for entering a telephone number. On iOS, this
    //         causes the virtual keyboard to show a numeric keypad with a "+*#" key for
    //         displaying punctuation keys.</td>
    //   </tr>
    //   <tr>
    //     <td valign="top"><em>"number"</em></td>
    //     <td>Makes the text field more suitable for entering a floating-point value. On iOS,
    //         this causes the virtual keyboard to start on the number and punctuation keys screen.
    //         <p>
    //         <b>NOTE:</b> This is not an appropriate text input type for credit card numbers,
    //         postal codes, ISBNs, and other formats that are not strictly parsable as floating-point
    //         numbers. This is because the browser is required to perform floating-point value
    //         sanitization to ensure that the value is a <a href="http://www.w3.org/TR/html5/infrastructure.html#valid-floating-point-number">valid floating-point number</a>.</td>
    //   </tr>
    //   <tr>
    //     <td valign="top"><em>"url"</em></td>
    //     <td>Makes the text field more suitable for entering a URL. On iOS, this causes the
    //         virtual keyboard to show a special ".com" key.</td>
    //   </tr>
    //   <tr>
    //     <td valign="top">Any&nbsp;vendor-<br>specific value</td>
    //     <td>If a browser supports another input type.</td>
    //   </tr>
    //   </tbody>
    // </table>
    // @visibility external
    //<
    

    //> @attr textItem.selectOnFocus (boolean : null : IRW)
    // @include FormItem.selectOnFocus
    // @visibility external
    //<

    //> @attr textItem.selectOnClick (boolean : null : IRW)
    // @include FormItem.selectOnClick
    // @visibility external
    //<
    
    //> @attr textItem.changeOnKeypress (Boolean : true : IRW)
    // @include FormItem.changeOnKeypress
    // @visibility external
    //<
    
    //> @attr textItem.supportsCutPasteEvents (boolean : true : IRW)
    // @include FormItem.supportsCutPasteEvents
    // @visibility external
    //<
    supportsCutPasteEvents:true,
    
    //> @method textItem.getSelectionRange()
    // @include FormItem.getSelectionRange()
    // @visibility external
    //<
    
    //> @method textItem.setSelectionRange()
    // @include FormItem.setSelectionRange()
    // @visibility external
    //<
    
    //> @method textItem.selectValue()
    // @include FormItem.selectValue()
    // @visibility external
    //<
    
    //> @method textItem.deselectValue()
    // @include FormItem.deselectValue()
    // @visibility external
    //<
    
    //> @attr textItem.readOnly  (boolean : null : IRWA)
    // Setter for the standard HTML readonly property of the input element.
    // If set to true, text will be non editable (though it can still be selected and copied etc)
    // @visibility internal
    //<
    
    //> @attr textItem.fetchMissingValues   (Boolean : true : IRWA)
    // If this form item has a specified +link{FormItem.optionDataSource}, should the
    // item ever perform a fetch against this dataSource to retrieve the related record.
    // <P>
    // Note that for editable textItems, behavior differs slightly than for other
    // item types as we will not issue fetches unless +link{formItem.alwaysFetchMissingValues} has
    // been set to true. 
    // See +link{textItem.shouldFetchMissingValue()} for more details.
    // 
    // @group display_values
    // @see formItem.optionDataSource
    // @see formItem.getSelectedRecord()
    // @see formItem.filterLocally
    // @visibility external
    //<
    
    
	//>@method textItem.shouldFetchMissingValue()
    // If this field has a specified +link{formItem.optionDataSource,optionDataSource}, should we perform a fetch against
	// that dataSource to find the record that matches this field's value?
	// <P>
    // For textItems this method will return false if the item is
    // +link{formItem.canEdit,editable} unless +link{formItem.alwaysFetchMissingValues} is true, even
    // if there is a specified +link{formItem.displayField,displayField}. 
    // We do this as, for a freeform text-entry field with a specified displayField, the
    // correct behavior when the user enters an unrecognized value is somewhat ambiguous.
    // The user could have entered a complete display-field value, in which case it
    // might be appropriate to issue a fetch against the display-field of the optionDataSource, 
    // and set the underlying item value.<br>
    // If a match was not found though, we necessarily treat the entered value as the new "dataValue"
    // for the field. Should we then issue a second fetch against the optionDataSource comparing
    // the user-entered value with the value-field of the dataSource?
    // <P>
    // There are still cases where it could make sense to issue the fetch against the dataSource,
    // and developers who want this behavior can set +link{formItem.alwaysFetchMissingValues,alwaysFetchMissingValues} to true.
    // <P>
    // See +link{FormItem.shouldFetchMissingValue()} for how this method behaves for other
    // item types.
    //
    // @param newValue (Any) The new data value of the item.
	// @return (Boolean) should we fetch the record matching the new value from the
	//   item's optionDataSource?
	// @visibility external
	//<
    // actually implemented at the formItem level by looking at this attribute
    // Note - we reenable this in ComboBoxItem.
    _suppressFetchMissingValueIfEditable:true,

    //> @attr textItem.showHintInField (Boolean : null : IRW)
    // If +link{formItem.showHint,showing a hint for this form item}, should the hint be shown
    // within the field?
    // <P>
    // Unless the HTML5 <code>placeholder</code> attribute is used to display the hint
    // (see +link{usePlaceholderForHint}),
    // the value of the &lt;input&gt; element for this item will be set to the hint
    // whenever this item is not focused. Also, when displaying the hint, the CSS style of the
    // data element will be set to the +link{TextItem.textBoxStyle,textBoxStyle} with the suffix
    // "Hint" appended to it; or, if the item is disabled, the suffix "DisabledHint" will be used.
    // In +link{Page.isRTL(),RTL mode} when +link{FormItem.showRTL,showRTL} is <code>true</code>,
    // an additional "RTL" suffix will be appended; i.e. the CSS style of the data element when
    // the hint is displayed will be the <code>textBoxStyle</code> plus "HintRTL" or 
    // "DisabledHintRTL".
    // <P>
    // To change this attribute after being drawn, it is necessary to call +link{FormItem.redraw()}
    // or redraw the form.
    // <P>
    // <h3>Styling the in-field hint</h3>
    // The in-field hint can be styled with CSS for the <code>textBoxStyle</code> + "Hint" /
    // "HintRTL" / "DisabledHint" / "DisabledHintRTL" styles. For example, if this item's
    // <code>textBoxStyle</code> is set to "mySpecialItem", then changing the hint color to
    // blue can be accomplished with the following CSS:
    // <pre>.mySpecialItemHint,
    //.mySpecialItemHintRTL,
    //.mySpecialItemDisabledHint,
    //.mySpecialItemDisabledHintRTL {
    //    color: blue;
    //}</pre>
    // <P>
    // In +link{dynamicForm.linearMode}, this property will be defaulted true if left unset.
    // @group appearance
    // @see FormItem.hint
    // @see attr:usePlaceholderForHint
    // @visibility external
    //<
    //showHintInField: null,

    //> @attr textItem.usePlaceholderForHint (boolean : true : IRA)
    // If +link{showHintInField,showing the hint in field} and if supported by the browser, should the HTML5
    // +externalLink{http://www.whatwg.org/specs/web-apps/current-work/multipage/forms.html#attr-input-placeholder,<code>placeholder</code> attribute}
    // be used to display the hint within the field? If set to <code>false</code>, then use of
    // the <code>placeholder</code> attribute is disabled and an alternative technique to display
    // the hint in-field is used instead.
    // <p>
    // The HTML5 <code>placeholder</code> attribute is supported in the following major browsers:
    // <ul>
    // <li>Chrome 4+</li>
    // <li>Firefox 4+</li>
    // <li>Internet Explorer 10+</li>
    // <li>Safari 5+</li>
    // <li>Opera 11.50+</li>
    // <li>Android 2.1+ <code>WebView</code> (used by the stock Browser app and when
    //     +link{group:phonegapIntegration,packaging with PhoneGap})</li>
    // <li>Mobile Safari for iOS 3.2+</li>
    // </ul>
    // <p>
    // In browsers other than the above, in-field hints are implemented via a different technique.
    // <p>
    // Note that placeholder behavior is known to differ in Internet Explorer and certain old
    // versions of the above browsers due to a recent change in the HTML5 specification regarding
    // the <code>placeholder</code> attribute. Under the old rules, the placeholder is cleared
    // when the element is focused. In the latest HTML5 spec as published by WHATWG, the placeholder
    // is still displayed when the element is focused as long as the value is an empty string.
    // <p>
    // <h3>Styling the placeholder</h3>
    // While there isn't a standard way to style the placeholder text, Chrome, Firefox,
    // Internet Explorer, and Safari provide vendor-prefixed pseudo-classes and/or pseudo-elements
    // that can be used in CSS selectors:
    // <table border="1">
    // <tr>
    //   <th>Browser</th>
    //   <th>Pseudo-class or pseudo-element</th>
    // </tr>
    // <tr>
    //   <td>Chrome, Safari</td>
    //   <td><code>::-webkit-input-placeholder</code></td>
    // </tr>
    // <tr>
    //   <td>Firefox 4 - 18</td>
    //   <td><code>:-moz-placeholder</code></td>
    // </tr>
    // <tr>
    //   <td>Firefox 19+</td>
    //   <td><code>::-moz-placeholder</code></td>
    // </tr>
    // <tr>
    //   <td>Internet Explorer</td>
    //   <td><code>:-ms-input-placeholder</code></td>
    // </tr>
    // </table>
    // <p>
    // Note that unlike other browsers, Firefox 19+ applies opacity:0.4 to the placeholder text.
    // See +externalLink{https://bugzilla.mozilla.org/show_bug.cgi?id=556145,Bug 556145 - Placeholder text default style should use opacity instead of GrayText}
    // <p>
    // Because browsers are required to ignore the entire rule if a selector is invalid,
    // separate rules are needed for each browser. For example:
    // <pre>::-webkit-input-placeholder {
    //    color: blue;
    //    opacity: 1;
    //&#125;
    //:-moz-placeholder {
    //    color: blue;
    //    opacity: 1;
    //&#125;
    //::-moz-placeholder {
    //    color: blue;
    //    opacity: 1;
    //&#125;
    //:-ms-input-placeholder {
    //    color: blue;
    //    opacity: 1;
    //&#125;</pre>
    // <p>
    // If using +externalLink{http://sass-lang.com,Sass}, it may be useful to utilize Sass'
    // +externalLink{http://sass-lang.com/documentation/file.SASS_REFERENCE.html#parent-selector,parent selector feature}.
    // For example:
    // <pre>.myCustomItem,
    //.myCustomItemRTL,
    //.myCustomItemDisabled,
    //.myCustomItemDisabledRTL,
    //.myCustomItemError,
    //.myCustomItemErrorRTL,
    //.myCustomItemFocused,
    //.myCustomItemFocusedRTL,
    //.myCustomItemHint,
    //.myCustomItemHintRTL,
    //.myCustomItemDisabledHint,
    //.myCustomItemDisabledHintRTL {
    //    // ...
    //
    //    &amp;::-webkit-input-placeholder {
    //        color: blue;
    //        opacity: 1;
    //    }
    //    &amp;:-moz-placeholder {
    //        color: blue;
    //        opacity: 1;
    //    }
    //    &amp;::-moz-placeholder {
    //        color: blue;
    //        opacity: 1;
    //    }
    //    &amp;:-ms-input-placeholder {
    //        color: blue;
    //        opacity: 1;
    //    }
    //&#125;</pre>
    // <p>
    // If using +externalLink{http://compass-style.org,Compass}, the
    // +externalLink{http://compass-style.org/reference/compass/css3/user_interface/#mixin-input-placeholder,<code>input-placeholder</code> mixin}
    // that was added in version 1.0 can further simplify the code to style the placeholder text
    // For example:
    // <pre>.myCustomItem,
    //.myCustomItemRTL,
    //.myCustomItemDisabled,
    //.myCustomItemDisabledRTL,
    //.myCustomItemError,
    //.myCustomItemErrorRTL,
    //.myCustomItemFocused,
    //.myCustomItemFocusedRTL,
    //.myCustomItemHint,
    //.myCustomItemHintRTL,
    //.myCustomItemDisabledHint,
    //.myCustomItemDisabledHintRTL {
    //    // ...
    //
    //    &#64;include input-placeholder {
    //        color: blue;
    //        opacity: 1;
    //    }
    //&#125;</pre>
    // <h3>Accessibility concerns</h3>
    // The HTML5 specification notes that a placeholder should not be used as a replacement
    // for a title. The placeholder is intended to be a <em>short</em> hint that assists the user
    // who is entering a value into the empty field. The placeholder can be mistaken by some
    // users for a pre-filled value, particularly in Internet Explorer because the same color
    // is used, and the placeholder text color may provide insufficient contrast, particularly
    // in Firefox 19+ because of the default 0.4 opacity. Furthermore, not having a title reduces
    // the hit area available for setting focus on the item.
    // @group appearance
    // @see FormItem.hint
    // @visibility external
    //<
    
    usePlaceholderForHint: true,

    //> @attr textItem.printFullText (Boolean : false : IRW)
    // When generating a print-view of the component containing this TextItem, should
    // the form item expand to accommodate its value? If set to false the text box will not expand
    // to fit its content in the print view, instead showing exactly as it does in the
    // live form.
    // @visibility external
    // @group printing
    //<
    printFullText:false,

    //> @attr textItem.saveOnEnter (Boolean : true : IRW)
    // Text items will submit their containing form on enter keypress 
    // if +link{DynamicForm.saveOnEnter,saveOnEnter} is true. Setting this property to
    // <code>false</code> will disable this behavior.
    // @visibility external
    //<
    // default implementation of formItem.shouldSaveOnEnter() returns this
    saveOnEnter: true,

    //> @attr textItem.escapeHTML (Boolean : true : IRW)
    // By default HTML characters will be escaped when +link{canEdit} is false and 
    // +link{readOnlyDisplay} is "static", so that the raw value of the field (for
    // example <code>"&lt;b&gt;AAA&lt;/b&gt;"</code>) is displayed to the user rather than
    // the interpreted HTML (for example <code>"<b>AAA</b>"</code>).  Setting
    // <code>escapeHTML</code> false will instead force HTML values in a textItem to be
    // interpreted by the browser in that situation.
    // @group appearance
    // @visibility external
    //<
    escapeHTML: true,

    
    getCanEscapeHTML : function () {
        if ((this._isPrinting() && this.printFullText) || this.renderAsStatic()) {
            return true;
        }
        return this.canEscapeHTML;
    },
    
    //> @attr textItem.showInputElement (boolean : true : IRWA) 
    // When set to false, prevents this item's input element from being written into the DOM.
    // If there are +link{formItem.valueIcons, valueIcons} or a 
    // +link{formItem.showPickerIcon, picker icon}, these are displayed as normal, and the item
    // will auto-sizing to that content if its +link{formItem.width, width} is set to null.
    // @visibility external
    //<


    
    _editorExitKeys:[
        "Enter", "Escape", "Tab"
    ]

});

isc.TextItem.addMethods({
    _mayShowHintInField : function () {
        return !!(this.showHint && this.__mayShowHintInField());
    },
    _getUsePlaceholderForHint : function () {
        
        if (!this.usePlaceholderForHint) return false;
        return this._supportsPlaceholderAttribute();
    },
    
    _$inputTypesSupportingPlaceholderAttribute: {
        "email": true,
        "number": (!isc.Browser.isAndroidWebView || !(2.3 < isc.Browser.androidMinorVersion && isc.Browser.androidMinorVersion < 4.2)),
        "password": true,
        "search": true,
        "tel": true,
        "text": true,
        "url": true
    },
    _supportsPlaceholderAttribute : function () {
        if (!isc.Browser._supportsPlaceholderAttribute) return false;
        var inputType = this._getInputType();
        if (inputType == null) return true;
        inputType = inputType.toLowerCase();
        // See the content attributes summary table for the HTML5 <input> element:
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/forms.html#input-type-attr-summary
        return this._$inputTypesSupportingPlaceholderAttribute.hasOwnProperty(inputType);
    },

    _manageCharacterInput : function () {
        return (!!this.mask || !!this._keyPressRegExp || this.characterCasing == isc.TextItem.UPPER ||
                this.characterCasing == isc.TextItem.LOWER);
    },

    // _willHandleInput()
    // Can we use the "input" event in this browser / form item?
    // True for Moz and Safari, but not IE. See comments near FormItem._handleInput()
    _willHandleInput : function () {
        return !isc.Browser.isIE;
    },

    // If the user cuts or pastes into a text field, then, depending on the browser,
    // we will either get an input event or a cut or paste event.  In either case, we
    // need to update the mask with the text currently stored in the text box.
    _$fixMaskAfterCutPaste: "_fixMaskAfterCutPaste",
    _pendingFixMask: null,
    _nativeCutPaste : function () { 
        
        if (this._pendingFixMask != null) {
            isc.Timer.clearTimeout(this._pendingFixMask);
        }
        this._pendingFixMask = isc.Timer.setTimeout({target: this, methodName: this._$fixMaskAfterCutPaste}, 0);
        return this.Super("_nativeCutPaste", arguments);
    },
    __handleInput : function () {
        // In IE10+, we only listen for ONINPUT to catch the case where the user clicks on the
        // -ms-clear pseudo-element: http://msdn.microsoft.com/en-us/library/windows/apps/hh465740.aspx
        if (isc.Browser.isIE && isc.Browser.version >= 10) {
            // If the data element value is empty and the _pendingFixMask timer is not set
            // (indicating the user just cut or pasted text), then clear the value.
            if (this._pendingFixMask == null && !this.getElementValue()) {
                this.updateValue();
            }

        } else {
            
            this._fixMaskAfterCutPaste();
            return this.Super("__handleInput", arguments);
        }
    },
    __handleSelect : function () {
        if (this._manageCharacterInput()) {
            this._lastSelectRange = this.getSelectionRange();
        }
        return this.Super("__handleSelect", arguments);
    },

    // _fixMaskAfterCutPaste(): Method to modify the input in response to user action to
    // ensure it matches any mask or keypress filter regex applied to the item.
    
    _fixMaskAfterCutPaste : function () {
        delete this._pendingFixMask;
        if (this._manageCharacterInput()) {

            // Ensure that `value' is a string.
            
            var value = this._getMaskableValue(this.getValue());

            var expectedElementValue = (this.mask ? this._maskValue(value) : value),
                currentElementValue = this.getElementValue();

            // The user might have just cut the entire value.
            
            if (!currentElementValue) {
				if (this.changeOnKeypress) {
					this.updateValue();
				} else {
					 this._minimalUpdateValue(currentElementValue);
				}       
                return;
            }

            
            
            

            var selection = this.getSelectionRange(),
                pasteLen = currentElementValue.length - expectedElementValue.length,
                pasteEnd;

            if ((isc.Browser.iOSVersion < 7 && isc.Browser.isMobileWebkit && !isc.Browser.isChrome) ||
                (isc.Browser.isSafari && !isc.Browser.isChrome && isc.Browser.version < 6))
            {
                
                pasteEnd = selection[0] + pasteLen;

            } else if (isc.Browser.isAndroid && isc.Browser.androidMinorVersion >= 4.4 &&
                       isc.Browser.isMobileWebkit)
            {
                
                pasteEnd = selection[1];

            } else if (expectedElementValue != currentElementValue &&
                       this._lastSelectRange && this._lastSelectRange[0] < this._lastSelectRange[1])
            {
                
                //pasteLen += (this._lastSelectRange[1] - this._lastSelectRange[0]);

                
                if (isc.Browser.isSafari && !isc.Browser.isChrome && isc.Browser.minorVersion < 6.1 &&
                    this._lastSelectRange[1] == expectedElementValue.length)
                {
                    pasteEnd = selection[0] + pasteLen;
                } else {
                    pasteEnd = selection[0];
                }

            } else {
                pasteEnd = selection[0];
                
            }

            // if the user cut characters (via cut or backspace key), and we don't have a mask,
            // we don't need to modify the element value or change selection.
            // Instead just ensure the value is updated.
            
            if (pasteLen < 0 && !this.mask) {
                if (this.changeOnKeypress) {
                    this.updateValue();
                } else {
                     this._minimalUpdateValue(currentElementValue);
                }       
                return;
            }

            var pasteStart = pasteEnd - pasteLen;

            value = currentElementValue.substring(0, pasteStart);

            // Ensure that `value' is a prefix of `expectedElementValue'
            if (!expectedElementValue.startsWith(value)) {
                for (pasteStart = 0; pasteStart < value.length && 
                     pasteStart < expectedElementValue.length; ++pasteStart) 
                {
                    if (value.charAt(pasteStart) != expectedElementValue.charAt(pasteStart)) {
                        break;
                    }
                }
                if (!this.mask) pasteLen = pasteEnd - pasteStart;
                value = currentElementValue.substring(0, pasteStart);
            }

            this.setElementValue(value);
            this._setSelection(pasteStart);

            if (this.mask) {
                var lengthOffset, next;
                if (pasteEnd > pasteStart) {
                    
                    next = this._insertTextAtSelectionStart(
                        currentElementValue.substring(pasteStart, pasteEnd), pasteStart);
                    var selection = this._getSelection();
                    lengthOffset = this._getMaskSlots(pasteEnd - pasteLen, selection.begin);
                } else {
                    
                    next = pasteEnd;
                    this._setSelection(pasteEnd);
                    lengthOffset = -this._getMaskSlots(pasteEnd, pasteEnd - pasteLen);
                }
                // replay the remaining suffix of content against the mask filters
                
                var replaySuffix = this._getReplaySuffixForCutPaste(expectedElementValue,
                                                       lengthOffset, pasteEnd, pasteLen);
                this._insertTextAtSelectionStart(replaySuffix);
                
                this._setSelection(next);
            } else {
                var replayString = currentElementValue.substring(pasteStart);
                
                var numRejected = 0;
                for (var i = 0; i < replayString.length; ++i) {
                    var c = replayString[i];

                    // Perform character case changes
                    var nc = c;
                    if (!this.mask) nc = this._mapCharacterCase(c, this.characterCasing);

                    // Check keyPress filter to determine if entered character is valid
                    if (this._keyPressRegExp && !this._keyPressRegExp.test(nc)) {
                        ++numRejected;
                        continue;
                    }

                    value += nc;
                }

                // Push new value to field
                this.setElementValue(value);
                if (this.changeOnKeypress) {
                    this.updateValue();
                }

                // Set the caret position to pasteEnd less the number of characters that were
                // filtered out of the paste.
                this._setSelection(pasteEnd - numRejected);
            }
        }
    },

    // replay specified content, inserting each character as if typed
    _insertTextAtSelectionStart : function (replayString, pasteStart) {
        var next = pasteStart,
            foundInvalid = false;
        for (var i = 0; i < replayString.length; ++i) {
            var c = replayString.charAt(i),
                characterValue = replayString.charCodeAt(i);
            if (i == 0) this._setUpInsertCharacterValue(characterValue);
            var newNext = this._insertCharacterValue(characterValue, true, false);
            if (newNext === false) {
                foundInvalid = true;
            } else if (!foundInvalid) {
                next = newNext;
            }
        }
        return next;
    },

    // count the number of mask slots in specified range
    _getMaskSlots : function (maskStart, maskEnd) {
        var slots = 0;
        if (maskStart < maskEnd) {
            if (maskEnd > this._length) maskEnd = this._Length;
            for (var i = maskStart; i < maskEnd; i++) {
                if (this._maskFilters[i] != null) slots++;
            }
        } else {
            if (maskStart > this._length) maskStart = this._Length;
            for (var i = maskEnd; i < maskStart; i++) {
                if (this._maskFilters[i] != null) slots--;
            }
        }
        return slots;
    },

    // generate the right suffix to replay to preserve content during a cut or paste operation
    _getReplaySuffixForCutPaste : function (elementValue, lengthOffset, pasteEnd, pasteLen) {
        var replayBuffer = isc.StringBuffer.create(),
            bufferArray = replayBuffer.getArray();

        if (lengthOffset > 0) { // paste

            for (var i = pasteEnd - pasteLen; i < elementValue.length; i++) {
                if (this._maskFilters[i] == null) continue;

                // skip each empty mask slot to attempt to align the remaining content
                if (lengthOffset > 0 && (this.maskOverwriteMode ||
                                         elementValue.charAt(i) == this.maskPromptChar))
                {
                    lengthOffset--;
                    continue;
                }
                // otherwise, just copy the element value into the replay buffer
                bufferArray[bufferArray.length] = elementValue.charAt(i);
            }

        } else { // cut

            for (var i = pasteEnd - pasteLen; i < elementValue.length; i++) {
                if (this._maskFilters[i] == null) continue;

                // if an empty mask slot is found, align the remaining content
                if (lengthOffset < 0 && !this.maskOverwriteMode &&
                    elementValue.charAt(i) == this.maskPromptChar)
                {
                    for (var j = 0; j < -lengthOffset; j++) {
                        bufferArray[bufferArray.length] = this.maskPromptChar;
                    }
                    lengthOffset = 0;
                }
                // otherwise, just copy the element value into the replay buffer
                bufferArray[bufferArray.length] = elementValue.charAt(i);
            }
            // insert empty slots at the end, if we failed above
            if (lengthOffset < 0) {
                    for (var j = 0; j < -lengthOffset; j++) {
                    bufferArray[bufferArray.length] = this.maskPromptChar;
                }
            }
        }
        return replayBuffer.toString();
    },

    // by putting 'nowrap' on the text box cell we avoid the value icon / text box appearing 
    // on different lines
    getTextBoxCellCSS : function () {
        return this._$nowrapCSS
    },

    //> @method textItem.setElementReadOnly()
    // Change the read-only state of the form element immediately.
    //<
    setElementReadOnly : function (readOnly) {
        // Text HTML element has readonly property
        this._setElementReadOnly(readOnly);
    },

    // NOTE: this is here for doc generation
    //>	@method textItem.keyPress		(A)
	//		@group	event handling
	//			event handler for keys pressed in this item
	//<

    _supportsInlineIcons : function () {
        
        if (this._inlineIconsMarkupApproach == null) return false;
        var inputType = this._getInputType();
        if (inputType != null) inputType = inputType.toLowerCase();
        
        var textItemPrototype = isc.TextItem._instancePrototype;
        return ((inputType == null || inputType === "text" || inputType === "password") &&
                this.getElementStyleHTML === textItemPrototype.getElementStyleHTML &&
                this.getIconHTML === textItemPrototype.getIconHTML &&
                this.getIconsHTML === textItemPrototype.getIconsHTML);
    },

    _iconVisibilityChanged : function () {
        var dataElement = this.getDataElement();
        if (dataElement != null && this._haveInlineIcons()) {

            if (this._inlineIconsMarkupApproach === "absolutePositioning") {
                var style = this.getTextBoxStyle(),
                    isRTL = this.isRTL(),
                    logicalLeftInlineIconsWidth = (isRTL ? this._rightInlineIconsWidth : this._leftInlineIconsWidth),
                    logicalRightInlineIconsWidth = (isRTL ? this._leftInlineIconsWidth : this._rightInlineIconsWidth),
                    logicalLeftPadding = isc.Element._getLeftPadding(style) + logicalLeftInlineIconsWidth,
                    logicalRightPadding = isc.Element._getRightPadding(style) + logicalRightInlineIconsWidth,
                    styleHandle = dataElement.style;
                styleHandle.paddingRight = logicalRightPadding + "px";
                styleHandle.paddingLeft = logicalLeftPadding + "px";
            } else {
                
                this.redraw("iconVisibilityChanged, 'divStyledAsDataElement' inline icons markup approach");
            }
        }
        this.Super("_iconVisibilityChanged", arguments);
    },

	//>	@method	textItem.getElementHTML()	(A)
	//			output the HTML for a text field element
	//		@group	drawing
	//		@param	value	(String)	Value of the element [Unused because it is more reliably set by setValue].
	//		@return	(HTMLString)	HTML output for this element
	//<
    _$elementStartTemplate:[
        ,                   // [0] possible value icon stuff
        "<INPUT TYPE=",         // [1]
        ,                       // [2] this._elementType,
        " NAME='",               // [3]
        ,                       // [4] this.getElementName(),
        "' ID='",                 // [5]
        ,                       // [6] this.getDataElementId(),
            // We want the EH system to handle events rather than writing native
            // handlers into the form item.
        "' handleNativeEvents=false" // [7]
    ],
    _$tabIndexEquals:" TABINDEX=",
    _$rightAngle:">",
            
    _$disabled:" DISABLED ",
    _$native:"native",
    _$autoCompleteOff:" AUTOCOMPLETE=OFF ",
    _$autoCompleteString:" AUTOCOMPLETE= ",
    _$accessKeyEquals:" ACCESSKEY=",
    
    
    _writeOuterTable : function () {
        var writeOT = this.Super("_writeOuterTable", arguments);
        if (writeOT) return true;
        // always write the outer table if there's a chance values have valueIcons
        if (this.valueIcons || this.getValueIcon) return true;
        return false;
    },

    // http://www.w3.org/TR/html-markup/input.html
    _getInputType : function () {
        var inputType = this._elementType;
        if (this.browserInputType != null) {
            inputType = this.getBrowserInputType();
        }
        return inputType;
    },
    
    drawing : function () {
        
        if (this._shouldSuppressBrowserClearIcon()) {
            isc.TextItem.createClearIconCSSDefinition();
        }
        this.Super("drawing", arguments);
    },

    getElementHTML : function (value, dataValue) {
        var valueIconHTML = this._getValueIconHTML(dataValue);
        if (this.showValueIconOnly) return valueIconHTML;
      
        // if showInputElement is false, don't add it to the DOM
        if (this.showInputElement == false) return "";

        var result;

        if (this._isPrinting() || this.renderAsStatic()) {
            if (this.printFullText) {
                result = isc.StringBuffer.concat(
                    "<SPAN ",this.getElementStyleHTML(value), ">",
                    dataValue == null ? "&nbsp;" : dataValue.asHTML(), "</SPAN>"
                );
            } else {
                result = this.Super("getElementHTML", arguments);
            }
        } else {

            var template = this._$elementStartTemplate,
                origTemplateLength = template.length,
                form = this.form,
                formID = form.getID(),
                itemID = this.getItemID()
            ;

            // May be null
            template[0] = valueIconHTML;

            var inputType = this._getInputType();

            template[2] = inputType;
            template[4] = this.getElementName();
            template[6] = this.getDataElementId();

            // hang a flag on the element marking it as the data element for the
            // appropriate form item.
            template[8] = this._getItemElementAttributeHTML();

            // At this point we're appending to the end of the template Disable spellchecker in
            // Moz if appropriate so we don't get the red wavy line under email addresses etc.
             
            
            if (isc.Browser.isMoz || isc.Browser.isSafari || isc.Browser.isEdge || 
                (isc.Browser.isIE && isc.Browser.version >= 10)) 
            {
                if (this.getBrowserSpellCheck()) template[template.length] = " spellcheck=true";
                else template[template.length] = " spellcheck=false"
            }

            // iPhone / Safari specific native features
            if (isc.Browser.isSafari) {
                if (this.browserAutoCapitalize == false) {
                    template[template.length] = " autocapitalize=off";
                }
                if (this.browserAutoCorrect != null) {
                    template[template.length] = this.browserAutoCorrect ? " autocorrect='on'" : " autocorrect='off'";
                }
                if (this.browserInputType == "digits") {
                    template[template.length] = " pattern='\\d*'";
                }
            }

            // If we get an oninput event for this browser, write it out into our element's HTML
            
            
            if (this._willHandleInput() || (isc.Browser.isIE && isc.Browser.version >= 10)) {
                template[template.length] = " ONINPUT='" 
                template[template.length] = this.getID() 
                template[template.length] = "._handleInput()'"
            }

            template[template.length] = " ONSELECT='if (window.";
            template[template.length] = this.getID() 
            template[template.length] = " == null) return;";
            template[template.length] = this.getID();
            template[template.length] = "._handleSelect()'";

            
            if (this.isDisabled() || (this._elementType == "FILE" && this.isReadOnly())) {
                template[template.length] = this._$disabled;
            }

            // Write out 'readOnly' setting if present
            if (this._elementIsReadOnly()) {
                template[template.length] = " READONLY=TRUE";
                if (isc.screenReader) template[template.length] = " aria-readonly=true";
            }

            if (this.isInactiveHTML() && value != null && value != isc.emptyString) {
                template[template.length] = " value='" + String.asAttValue(value) + "'";
            }

            // disable native autoComplete 
                  
                  
            var autoCompleteValues = this._getAutoCompleteSetting();
            if (this.autoCompleteKeywords != null && isc.isAn.Array(this.autoCompleteKeywords)) {
                template[template.length] = this._$autoCompleteString + "\"" + autoCompleteValues + "\"";
            } else if (autoCompleteValues != this._$native) {
                template[template.length] = this._$autoCompleteOff;
            }

            if (this._getShowHintInField() && this._getUsePlaceholderForHint()) {
                var hint = this.getHint();
                template[template.length] = " placeholder='" + String.asAttValue(String.htmlStringToString(hint)) + "'";
            }

            template[template.length] = this.getElementStyleHTML(dataValue);
            
            if (this._elementType == "FILE") {
                // capture is not defined in the fileItem/uploadItem
                if (!this.capture) {
                    // we search for the mimeType in the DSField
                    if (this.form.parentElement && this.form.parentElement.dataSource) {
                        var ds = this.form.parentElement.dataSource,
                            field = ds.getField(this.name);

                        if (field && field.mimeType) {
                            var mimeType = field.mimeType.toUpperCase();
                            if (mimeType == "AUDIO/3GPP" || mimeType == "AUDIO/MP4" || mimeType == "VIDEO/MP4" || mimeType == "VIDEO/3GPP" ||
                               mimeType == "IMAGE/JPEG" || mimeType == "IMAGE/PNG")
                            {
                                template[template.length] = "capture";
                            }
                        }
                    }
                } else {
                    template[template.length] = "capture="+this.capture;
                }
            }
            
            
            var tabIndex = this._getElementTabIndex();
            if (tabIndex != null) {
                var end = template.length;
                template[end] = this._$tabIndexEquals;  
                isc._fillNumber(template, tabIndex, end+1, 5);
            }

            // Note: if we're showing a title for the element, we don't need to set
            // up an accessKey here, since the label tag takes care of that
            if (this.showTitle == false && this.accessKey != null) {
                template[template.length] = this._$accessKeyEquals;
                template[template.length] = this.accessKey;
            }

            template[template.length] = this._$rightAngle;

            result = template.join(isc.emptyString);

            // Trim the entries off the end of the template so we can reuse it.
            template.length = origTemplateLength;
        }
        //this.logWarn("generated textItem HTML:"+ result);

        return result;
	},
	
	//> @attr textItem.suppressBrowserClearIcon (Boolean : null : IRW)
	// This attribute currently only has an effect in Internet Explorer.
	// That browser will dynamically add a native "clear" icon to
	// <i>&lt;input type="text" &gt;</i> elements when the user enters a value.
	// Setting <code>suppressBrowserClearIcon</code> to <code>true</code>
	// will write out HTML to suppress this icon. This can be particularly useful for
	// items which define their own clear icon as in 
	// +explorerExample{inlineFormIcons, this sample}.
	// <P>
	// If this property is not set at the item level,
	// +link{dynamicForm.suppressBrowserClearIcons} will be used instead.
	// <P>
	// Note that as an alternative to using this feature, the icon may also be suppressed 
	// (or have other styling applied to it) directly via CSS, using the 
	// <code>::-ms-clear</code> css pseudo-element (proprietary Internet Explorer feature).
	// <P>
	// Implementation note: This feature makes use of the automatically generated
	// +link{TextItem.suppressClearIconClassName} css class.
	//
	// @visibility external
	//<
    
	suppressBrowserClearIcon:null,
	
	//> @method textItem.setSuppressBrowserClearIcon()
	// Setter for the +link{suppressBrowserClearIcon}
	// @param newValue (Boolean) new value for suppressBrowserClearIcon
	// @visibility external
	//<
	setSuppressBrowserClearIcon : function (newValue) {
	    if (this.suppressBrowserClearIcon != newValue) {
	        this.suppressBrowserClearIcon = newValue;
	        this.redraw();
	    }
	},
	
	_shouldSuppressBrowserClearIcon : function () {
	    return isc.Browser.isIE && 
            (this.suppressBrowserClearIcon != null
        	         ? this.suppressBrowserClearIcon : this.form.suppressBrowserClearIcons);
	},

    
	_elementIsReadOnly : function () {
	    return this.isInactiveHTML() || this.isReadOnly();
    },

    _suppressUpdateValueFromElement : function () {
        if (this._elementIsReadOnly()) return true;
        return this.Super("_suppressUpdateValueFromElement", arguments);
    },
 

    
    _sizeTextBoxAsContentBox : function () {
        if (this._isPrinting()) {
            return this.Super("_sizeTextBoxAsContentBox", arguments);
        }
        return isc.Browser.isStrict;
    },
    
    // override _nativeElementBlur() to fire blur and change handlers in response to a native 
    // blur
    //
    // Natively onblur is fired when focus is taken from the text item, but onchange will
    // only fire if the value on leaving the text item is different from what it was when
    // the user put focus into the text item.
    //
    // Since we do internal values handling, having the same element value when focus is 
    // taken from a form item as when focus first went to a form item is not a guarantee
    // that our stored value for the form item has not changed, and vice versa - 
    // typically we are saving values in response to key events due to 'changeOnKeypress'.
    // 
    // Therefore instead of relying on the native change handler, on blur we will always fire
    // our change handler if changeOnBlur is true, and otherwise compare our stored value to
    // the current element value, and fire the change handler if they do not match.
    

    _nativeElementBlur : function (element, itemID) {
        // On blur always call elementChanged. This falls through to updateValue() which
        // saves out the new value and fires change handlers [if the value has been modified].
        // If the value is unchanged, elementChanged() essentially no ops so we can always call
        // it here.
        
       if (this.form &&
            !this.form._setValuesPending &&
            (this.form.__suppressBlurHandler == null)) 
       {
           this.form.elementChanged(this);
       }

        var returnVal = this.Super("_nativeElementBlur", arguments);
        if (!this.isReadOnly() &&
            (this.formatOnFocusChange || this.mask != null || this._elementValueAtFocus == null ||
             this._elementValueAtFocus != this.getEnteredValue()))
        {
            this.refreshDisplayValue();
        }

        // If showing the hint within the data field, see if it should be shown now.
        
        if (this._getShowHintInField() && !this._getUsePlaceholderForHint()) {
            var value = this.getElementValue();
            if (value == null || isc.isAn.emptyString(value)) {
                this._showInFieldHint();
            }
        }

        if (this._delayedSelect != null) {
            isc.Timer.clear(this._delayedSelect);
            this._delayedSelect = null;
        }
        return returnVal;
    },

    // Helper to refresh display value:
    // Call mapValueToDisplay() so we format the stored value to the appropriate display value.
    // Required if we have a mask
    // Also required if a developer has custom formatters/parsers that are not 1:1
    // [EG: A forgiving data parser allowing variants on a display format].
    // In this second case - compare the current element value to the element value when
    // the user put focus into the item and skip the call if they're unchanged.
    // This means we'll catch cases where the user has modified the display value (even if it
    // ultimately mapped back to the same data value) but shouldn't run the formatter when
    // the user simply tabbed through the field.
    
    refreshDisplayValue : function () {
        var value = this.getValue();
        if (this.mapValueToDisplay) {
            value = this.mapValueToDisplay(value);
        }
        if (!this.hasFocus && this._getShowHintInField() && !this._getUsePlaceholderForHint() &&
            (value == null || isc.isAn.emptyString(value)))
        {
            this._showInFieldHint();
        } else {
            this.setElementValue(value);
        }
    },

    getTextBoxStyle : function () {
        var textBoxStyle;
        if ((!this.hasFocus && this._getShowHintInField() && !this._getUsePlaceholderForHint() && 
             this._value == null) ||
            (this._showingLoadingDisplayValue))
        {
            textBoxStyle = this._getInFieldHintStyle();
        } else {
            textBoxStyle = this.Super("getTextBoxStyle", arguments);
        }
        if (this._shouldSuppressBrowserClearIcon()) {
            textBoxStyle += " " + isc.TextItem.suppressClearIconClassName;
        }

        return textBoxStyle;
        
    },

	//>	@method	textItem.getElementStyleHTML()	(I)
    // Get the HTML string used to set the visual characteristics for a text item.
    // This includes the STYLE=... & CLASS=... properties to be written into this
    // form item's element.
	// This varies by platform, as we attempt to make Netscape think in pixels rather than 
    // characters and rows
	//
	// @group appearance
	// @return (String) String of HTML containing STYLE=... & CLASS=... properties for 
    //                  this items element.
	//<
    _$styleTemplate:[
        " CLASS='",         // [0]
        ,                   // [1] this.getTextBoxStyle(),
        "' STYLE='",        // [2]
        ,                   // [3] null or 'width:'
        ,,,,                // [4-7] null or width
        ,                   // [8] null or 'px;'

             
        ,                   // [9] null or 'height:'
        ,,,,                // [10-13] null or height
        ,                   // [14] null or 'px;'

            // text align property, known to be supported in IE6 and Moz/Firefox on
            // Windows, not supported on Safari 1.2
        ,                   // [15] null or 'text-align'
        ,                   // [16] null or this.textAlign
        ,                   // [17] null or ";"
        
            // In Mozilla we must use the '-moz-user-focus' css property to govern
            // whether this element can recieve focus or not.
            // (slots 18 and 19)
        (isc.Browser.isMoz ? "-moz-user-focus:" 
          
            :  null),       // [18]
        ,                   // [19] Moz: 'normal' or 'ignore' - otherwise null
        ,                   // [20] padding-left & padding-right or null
        "' "                // [21]
    ],
    _$normal:"normal;", _$ignore:"ignore;",
    
    _$negativeMargins:"margin-top:-1px;margin-bottom:-1px;",
	getElementStyleHTML : function (value) {

	    // in 'printFullText' / printing mode we write out a span rather than
	    // an input.
	    // Most of the css will be the same but we can skip a few steps
	    var isStaticElement = this._isPrinting() && this.printFullText;

        var template = this._$styleTemplate,

        
            width = this.getTextBoxWidth(value),
            height = this.getTextBoxHeight(value),
            style = this.getTextBoxStyle(),
            haveInlineIcons = this._haveInlineIcons();

        template[1] = style;

        
        if (isc.isA.Number(width)) {
            template[3] = this._$widthColon;
            isc._fillNumber(template, width, 4, 4);            
            template[8] = this._$pxSemi;
        } else {
            template[3] = template[4] = template[5] = template[6] = 
                template[7] = template[8] = null;
        }

        if (isc.isA.Number(height) && (!haveInlineIcons || this._inlineIconsMarkupApproach !== "divStyledAsDataElement")) {
            template[9] = this._$heightColon;
            isc._fillNumber(template, height, 10, 4);
            template[14] = this._$pxSemi;
        } else {
            template[9] = template[10] = template[11] = template[12] = 
                template[13] = template[14] = null;            
        }

        if (this.textAlign) {
            template[15] = this._$textAlignColon;
            template[16] = this.textAlign;
            template[17] = this._$semi;
        } else {
            template[15] = template[16] = template[17] = null;
        }
        if (isc.TextItem._needNegativeMargins) {
            template[18] = isStaticElement ? null : this._$negativeMargins;
        }
        if (isc.Browser.isMoz && !isStaticElement) {
            template[19] = (this._getElementTabIndex() > 0 ? this._$normal
                                                           : this._$ignore);
        }

        if (this._haveInlineIcons()) {
            var isRTL = this.isRTL(),
                logicalLeftInlineIconsWidth = isRTL ? this._rightInlineIconsWidth : this._leftInlineIconsWidth;

            if (this._inlineIconsMarkupApproach === "absolutePositioning") {
                var logicalLeftPadding = isc.Element._getLeftPadding(style) + logicalLeftInlineIconsWidth,
                    logicalRightInlineIconsWidth = isRTL ? this._leftInlineIconsWidth : this._rightInlineIconsWidth,
                    logicalRightPadding = isc.Element._getRightPadding(style) + logicalRightInlineIconsWidth;
                template[20] = "padding-right:" + logicalRightPadding + "px;padding-left:" + logicalLeftPadding + "px";
            } else {
                

                if (isc.Browser.isIE && !isc.Browser.isStrict) {
                    template[20] = isc.Canvas._$noStyleDoublingCSS + "position:relative;left:" + logicalLeftInlineIconsWidth + "px";
                } else {
                    template[20] = isc.Canvas._$noStyleDoublingCSS + "position:relative;top:0px;bottom:0px;left:" + logicalLeftInlineIconsWidth + "px";
                }

                // For IE9/10 the element height needs to be specified to match outer div height
                if (isc.Browser.isIE && 9 <= isc.Browser.version && isc.Browser.version <= 10) {
                    template[20] += "; height: " + this.getTextBoxHeight() + "px;";
                }
            }
        } else {
            template[20] = null;
        }
        
        return template.join(isc.emptyString);
    },
    
    _getMeasureCanvas : function () {
        return isc.TextItem._measureCanvas ||
               (isc.TextItem._measureCanvas = isc.Canvas.create({
                    _generated: true,
                    top: -1000,
                    
                    ariaState: {
                        hidden: true
                    },
                    overflow: "visible",
                    autoDraw: true,
                    height: 1,
                    width: 1,

                    markForRedraw : function () {}
                }));
    },

    
    _$INPUT: "INPUT",
    _$TEXTAREA: "TEXTAREA",
    _getTextBoxScrollWidth : function (textBoxHandle, b, c, d) {
        var tagName = textBoxHandle.tagName;
        if ((tagName === this._$INPUT || tagName === this._$TEXTAREA) &&
            (isc.Browser.isEdge || isc.Browser.isIE10 || isc.Browser.isMoz ||
             (this.textAlign != null && this.textAlign != (this.isRTL() ? "right" : "left"))
            )
           )
        {
            var textBoxStyle = this.getTextBoxStyle(),
                elementValue = this.getElementValue();
            if (elementValue == null) elementValue = "";
            else elementValue = String(elementValue);
            if (this._cachedValueScrollWidthInfo == null ||
                this._cachedValueScrollWidthInfo.textBoxStyle != textBoxStyle ||
                this._cachedValueScrollWidthInfo.elementValue != elementValue)
            {
                var measureCanvas = this._getMeasureCanvas();
                if (measureCanvas.styleName != textBoxStyle) measureCanvas.setStyleName(textBoxStyle);
                measureCanvas.setContents("<span style='white-space:nowrap'>" + isc.makeXMLSafe(elementValue) + "</span>");
                measureCanvas.redraw("value scrollWidth measurement: " + elementValue);
                var width = measureCanvas.getScrollWidth(true);
                this._cachedValueScrollWidthInfo = {
                    width: width,
                    textBoxStyle: textBoxStyle,
                    elementValue: elementValue
                };
            }
            return this._cachedValueScrollWidthInfo.width;
        } else {
            return this.invokeSuper(isc.TextItem, "_getTextBoxScrollWidth", textBoxHandle, b, c, d);
        }
    },

    //> @method textItem.getEnteredValue()
    // Returns the raw text value that currently appears in the text field, which can differ from 
    // +link{formItem.getValue()} in various cases - for example:
    // <ul>
    // <li>for items that constrain the value range, such as a +link{DateItem} with
    // +link{DateItem.enforceDate,enforceDate}:true, or a +link{ComboBoxItem} with
    // +link{ComboBoxItem.addUnknownValues,addUnknownValues}:false</li>
    // <li>for items with a defined valueMap or edit value formatter and parser functions
    // which converts display value to data value</li>
    // <li>while the item has focus if +link{TextItem.changeOnKeypress, changeOnKeypress} is false
    // </li></ul>
    // @return (String) current entered value
    // @visibility external
    //<
    getEnteredValue : function () {
        return this.getElementValue();
    },


    //>@method textItem.mapValueToDisplay()  (A)
    // Map from the internal value for this item to the display value.
    // @param   internalValue   (String)   Internal value for this item.
    // @return  (String)   Displayed value corresponding to internal value.
    // @group   drawing
    //<
    mapValueToDisplay : function (internalValue, updateMask) {
        var value;
        if (this.mask && this.hasFocus && !updateMask) {
            value = this._getMaskBuffer();
        } else {
            
            
            value = isc.FormItem._instancePrototype.mapValueToDisplay.call(this, internalValue);

            // always display the empty string for null values, rather than "null" or "undefined"
            if (value == null) return isc.emptyString;
            if (this.mask) {
                value = this._maskValue(value);
            }
        }
        
        return value;
    },
    
    _getFormattedNumberString : function (numberValue) {
        if (isc.SimpleType.inheritsFrom(this.type, "float")) {
            // may need decimal processing
            if (this.decimalPrecision != null || this.decimalPad != null) {
                return isc.Canvas.getFloatValueAsString(numberValue, 
                    this.decimalPrecision, this.decimalPad);
            } else if (this.precision != null) {
                return isc.Canvas.getNumberValueAsString(numberValue, this.precision, "float");
            }
        }
        // stringify the numeric input
        return "" + numberValue;
    },

    handleEditorEnter : function () {
        // moved from FloatItem - if dealing with floats, 
        if (isc.SimpleType.inheritsFrom(this.getType(), "float") ||
                isc.SimpleType.inheritsFrom(this.getType(), "localeFloat")) 
        {
            this._inEditorMode = true;
            var value = this.getValue(),
                displayValue = this.mapValueToDisplay(value);
            var currentValue = this.getEnteredValue() || "";
            if (currentValue != displayValue) {
                var currentSelection = this.getSelectionRange(), newSelection;

                if (currentSelection) {
                    // Attempt to reset selection, if it makes sense
                    // (current selection is at start, end or spanning the value)
                    
                    if (currentValue.length == displayValue.length ||
                        (currentSelection[0] == 0 && currentSelection[1] == 0)) 
                    {
                        newSelection = currentSelection;
                    } else if (currentSelection[1] == currentValue.length) {
                        if (currentSelection[0] == 0) {
                            newSelection = [0,displayValue.length];
                        } else if (currentSelection[0] == currentValue.length) {
                            newSelection = [displayValue.length,displayValue.length];
                        }
                    }
                    this.setElementValue(displayValue, value);
                    if (newSelection != null) {
                        this.setSelectionRange(newSelection[0],newSelection[1]);
                    }
                }
            }
        }
        this.Super("handleEditorEnter", arguments);
    },

    handleEditorExit : function () {
        // moved from FloatItem
        this.Super("handleEditorExit", arguments);

        if (isc.SimpleType.inheritsFrom(this.getType(), "float") ||
                isc.SimpleType.inheritsFrom(this.getType(), "localeFloat")) 
        {
            this._inEditorMode = false;
            var value = this.getValue(),
                displayValue = this.mapValueToDisplay(value);
            this.setElementValue(displayValue, value);
        }
    },

    // Override shouldApplyStaticTypeFormat to disallow static-type-format when we're
    // rendering content into an editable text-box
    shouldApplyStaticTypeFormat : function () {
        // If rendering as static allow static type format
        
        if (this.renderAsStatic()) {
            return this.Super("shouldApplyStaticTypeFormat", arguments);

        // If rendering as a text field, behave as if applyStaticTypeFormat were false -
        // allow static format on blur only
        } else {
            if (this.formatOnBlur) {
                var hasFocus = this.hasFocus;
                // If we're blurred, apply the staticTypeFormat
                return !hasFocus;
            }
            return false;
        }
    },

    //>@method textItem.mapDisplayToValue() (A)
    // Map from the display value for this item to the internal value.
    // @param displayValue (String) Value displayed to the user.
    // @return (String) Internal value corresponding to that display value.
    // @group drawing
    //<
    mapDisplayToValue : function (displayValue) {
        var value;
        if (this.mask) {
            value = this._unmaskValue(displayValue);
        } else {
            // See comments in FormItem.js and ComboBoxItem.js about mapEmptyDisplayToValue
            if (this.mapEmptyDisplayValue || (displayValue != this.emptyDisplayValue)) {
                value = this._unmapKey(displayValue);
            }
        }
        value = this._parseDisplayValue(value);
        // if the value to be saved is an empty string, map it to 'null' if necessary
        if (isc.is.emptyString(value)) value = this.emptyStringValue;
        return value;
    },
    
    // override 'saveValue' so new value can be mapped into mask if used.
    saveValue : function (value, isDefault) {

        // Save the new value into our mask buffer
        if (this.mask) this._maskValue (value);

        this.Super("saveValue", arguments);
    },

    // override 'setValue'.
    // If passed null or the empty string, we store this as the 'empty string value' - this will
    // then be returned whenever the user clears out the text item element.
    setValue : function (value,b,c,d) {
        

        // Make sure in-field hint is hidden
        this._hideInFieldHint();

        var undef;
        if (this.emptyStringValue === null || this.emptyStringValue === undef) {
            
            if (value == null || isc.is.emptyString(value)) {
                //this.logWarn("setting the emptyStringValue to :" + isc.Log.echo(value));
                this.emptyStringValue = value;
            }
        }

        // Translate incoming value based on characterCasing if needed
        if (value !== undef && value != null && this.characterCasing != isc.TextItem.DEFAULT) {
            if (this.characterCasing == isc.TextItem.UPPER) {
            	if(isc.isA.Array(value))
                    this.arrayToUpperCase(value);
            	else
	                value = value.toUpperCase();
            } else if (this.characterCasing == isc.TextItem.LOWER) {
            	if(isc.isA.Array(value))
                    this.arrayToLowerCase(value);
            	else
	                value = value.toLowerCase();
            }
        }

        // Let parent take care of saving the value
        value = this.invokeSuper(isc.TextItem, "setValue", value,b,c,d);

        // See if the in-field hint needs to be shown
        if (!this.hasFocus && this._getShowHintInField() && !this._getUsePlaceholderForHint()) {
            var elementValue = this.getElementValue();
            if (elementValue == null || isc.isAn.emptyString(elementValue)) {
                this._showInFieldHint();

            
            } else {
                var element = this.getDataElement();
                if (element != null) element.className = this.getTextBoxStyle();
            }

        // If there is a mask and the new value is empty, then update the editor caret position
        // if focused.
        } else if (this.hasFocus && this.mask && (value == null || isc.isAn.emptyString(value))) {
            this._setSelection(this._firstNonMaskPos == null ? 0 : this._firstNonMaskPos);
        }

        return value;
    },
    
    // Override _showValue to explicitly call _showInFieldHint() if necessary
    
    _showValue : function (newValue, resetCursor) {
        
	    var showHintInField = false;
        if (!this.hasFocus && this._getShowHintInField() && !this._getUsePlaceholderForHint()) {
            // map the value passed to the visible value as necessary
            var displayValue = this.getDisplayValue(newValue);
            if (displayValue == null || isc.isAn.emptyString(displayValue)) {
                showHintInField = true;
            }
        }
        if (showHintInField) { 
            if (this._showingInFieldHintAsValue && 
                this.getElementValue() != String.htmlStringToString(this.getHint())) {
                this._showingInFieldHintAsValue = false;
            }
            this._showInFieldHint();

        }else {
            if (this._showingInFieldHintAsValue) this._showingInFieldHintAsValue = false;
            return this.Super("_showValue", arguments);
        }
    },
    
    arrayToUpperCase : function(value) {
        for (var i = 0; i < value.length; i++) {
            value[i] = value[i].toUpperCase();
        }
    },
    arrayToLowerCase : function(value) {
        for (var i = 0; i < value.length; i++) {
            value[i] = value[i].toLowerCase();
        }
    },

    // Override getCriteriaFieldName - if we have a displayField, return it rather than the
    // item name
    getCriteriaFieldName : function () {
        if (this.criteriaField) return this.criteriaField;
        if (this.displayField) return this.displayField;
        return this.Super("getCriteriaFieldName", arguments);
    },


    // When focus is received, the hint should be hidden if TextItem.showHintInField is true.
    _nativeElementFocus : function (element, itemID) {
        // if this focus came from a redraw, don't select- we want to retain the pre-redraw selection
        var refocusAfterRedraw = this._refocussingAfterRedraw;

        var returnVal = this.Super("_nativeElementFocus", arguments);

        // UploadItem (inherits from this class) doesn't not allow the selection range to be read/modified
        var manipulateSelection = this.getClass().isMethodSupported("getSelectionRange");

        // Hide in-field hint if being shown
        var wasShowingInFieldHintAsValue = this._showingInFieldHintAsValue;
        this._hideInFieldHint();

        

        
        if (this._mouseIsDown) {
            if (this.manipulateSelection) this._selectionAtFocus = this.getSelectionRange();
            
        }


        
        if (this.mask && this.mapValueToDisplay) {
            this.mapValueToDisplay(this.getValue(), true);
        }

        // If this TextItem is readonly, don't change the selection.
        if (this.isReadOnly()) return returnVal;

        
        var retainSelection = this._mouseIsDown;

        // In IE there's a native bug whereby if you change an element value on focus,
        // you see the caret at the end of the new string, then jump to the beginning of
        // the new string.
        // Work around this by forcing the caret back to the end so the user doesn't get
        // surprised by this result
        
        var forceCaretToEnd;

        // If the special flag is set to refresh the display value on focus / blur, refresh the
        // display value
        // (Allows the user to specify a different value when the item has focus)
        if (this.formatOnFocusChange || this.formatOnBlur) {
            var elementValue = this.getElementValue();
            // RefreshDisplayValue will fall through to setElementValue with the new
            // display value. If the value is unchanged this shouldn't actually 
            // touch the native 'element.value' attribute.
            this.refreshDisplayValue()
            if ((isc.Browser.isIE10 ||
                (isc.Browser.isIE && elementValue != this.getElementValue())))
            {
                forceCaretToEnd = true;
            }
        }

        if (this.mask) {
            // Force buffer back into control so unfilled mask spaces
            // will be shown with the maskPromptChar
            this._saveMaskBuffer(false);

            var selectOnFocus = !retainSelection && 
                                // not from a redraw, or redrawn because icons are being shown 
                                // on focus
                                (!refocusAfterRedraw || 
                                    (this.selectOnFocus && this.showPickerIconOnFocus )) && 
                                this._shouldSelectOnFocus();
            if (!selectOnFocus) {

                // If we're not selecting on focus, shift the caret to the desired position
                // now
                
                this._fixCaretForMask(retainSelection ? this._selectionAtFocus : null);
                this._selectionAfterMaskReformat = this.getSelectionRange();
                if (retainSelection) {
                    isc.Page.setEvent(
                        "click", 
                        this,
                        isc.Page.FIRE_ONCE,
                        "_fixCaretForMaskOnMouseUp"
                    );
                // if the mouse isn't down, the user tabbed into the field, or
                // focus was shifted programmatically.
                // Use a delay to fix the caret after this thread exits, as
                // native selection may occur later in the event handling flow
                } else {
                    this.delayCall("_fixCaretForMask", null, 50);
                }
        
            } else {
                this._delayedSelect = this.delayCall("_delayed_selectValue");
            }

        // There may be custom parser / formatter logic applied to any text item and this
        // may not be a 1:1 mapping [EG a forgiving date format parser allowing variants on
        // a display format].
        // In this case the developer would typically specify changeOnKeypress:false [so as
        // not to break on partial values] and on blur expect values to be updated and 
        // if necessary reformatted to the appropriate display value.
        // We don't want to run potentially expensive formatters if the user hasn't changed
        // the display value, so record the element value on focus and don't reformat
        // if its unchanged on blur implying the user just tabbed through the field or
        // edited, then reverted their edits.
        } else {
            var selectOnFocus = !retainSelection &&
                                !refocusAfterRedraw && this._shouldSelectOnFocus();
            var value = this.getEnteredValue();
            if (manipulateSelection) {
                if (selectOnFocus) {
                    if (value != null && !this._delayedSelect) {
                        this._delayedSelect = this.delayCall("_delayed_selectValue");
                    }
                } else if (forceCaretToEnd) {
                    var elementValue = this.getElementValue();
                    if (elementValue.length > 0) {
                        this.setSelectionRange(elementValue.length, elementValue.length);
                    }
                }
            }
            this._elementValueAtFocus = value;
        }

        return returnVal;
    },
    _delayed_setSelection : function (begin, end) {
        this._delayedSelect = null;
        // manipulating the selection changes focus, so don't do it if focus has moved on
        if (!this._hasNativeFocus()) return;  
        this._setSelection(begin, end);
    },
    _delayed_selectValue : function () {
        this._delayedSelect = null;
        // manipulating the selection changes focus, so don't do it if focus has moved on
        if (!this._hasNativeFocus()) return;  
        this.selectValue();
    },

    _fixCaretForMaskOnMouseUp : function () {
        if (this._hasNativeFocus()) {
            var selectionRange = this.getSelectionRange();
            if (selectionRange[0] != this._selectionAfterMaskReformat[0] || 
                selectionRange[1] != this._selectionAfterMaskReformat[1])
            {
                this._fixCaretForMask(selectionRange);
            }
        }
    },
    // Case conversion and keyPressFilter handling

    //> @attr   textItem.characterCasing   (CharacterCasing : isc.TextItem.DEFAULT : IRWA)
    // Should entered characters be converted to upper or lowercase?
    // Also applies to values applied with +link{formItem.setValue}.
    // <P>
    // Note: character casing cannot be used at the same time as a +link{textItem.mask}.
    // @example formFilters
    // @visibility  external
    //<    
    characterCasing: isc.TextItem.DEFAULT,

    //> @attr   textItem.keyPressFilter   (String : null : IRWA)
    // Sets a keypress filter regular expression to limit valid characters
    // that can be entered by the user. If defined, keys that match the
    // regular expression are allowed; all others are suppressed. The
    // filter is applied after character casing, if defined.
    // <P>
    // Note: keypress filtering cannot be used at the same time as a +link{textItem.mask}.
    // @see textItem.characterCasing
    // @setter setKeyPressFilter
    // @example formFilters
    // @visibility  external
    //<    

    //>@method textItem.setKeyPressFilter()
    // Set the +link{keyPressFilter,keyPressFilter} for this item
    // @param filter (String) new keyPress filter for the item
    // @visibility external
    //<
    setKeyPressFilter : function (filter) {
        if (this.mask) {
            this.logWarn("setKeyPressFilter() ignored because mask is enabled");
            return;
        }
        this.keyPressFilter = filter;
        this._keyPressRegExp = null;
        if (this.keyPressFilter) {
            this._keyPressRegExp = new RegExp (this.keyPressFilter);
        }
    },

    init : function() {
        this.Super("init", arguments);

        // If "inputDataType" was specified, switch to "browserInputType"
        
        if (this.inputDataType != null && this.browserInputType == null) {
            this.browserInputType = this.inputDataType;
        }

        // Setup mask or keyPress filter

        if (this.mask) {
            if ((isc.ComboBoxItem && isc.isA.ComboBoxItem(this)) ||
                (isc.SpinnerItem && isc.isA.SpinnerItem(this)))
            {
                this.logWarn("item.mask is unsupported for this FormItem type. " +
                    "This item has mask specified as '" + this.mask + "' - ignoring.");
                this.mask = null;
            // browserInputType number / digits disallows setting the element value to anything
            // non numeric including 'mask' characters like the "_" used to indicate length
            } else if (this.browserInputType == "digits" || this.browserInputType == "number") {
                this.logWarn("item.mask is unsupported for a FormItem with browserInputType '" +
                    this.browserInputType + "'. Ignoring.");
                this.mask = null;
            } else {
                this._parseMask ();
                if (this.keyPressFilter) {
                    this.logWarn("init: keyPressFilter ignored because mask is enabled");
                }
            }
        } else if (this.keyPressFilter) {
            this._keyPressRegExp = new RegExp (this.keyPressFilter);
        }
    },
    
    // Document the transformPastedValue API here (actually implemented at the FormItem level)
    //> @method TextItem.transformPastedValue()
    // @include FormItem.transformPastedValue()
    // @visibility external
    //<

    // Disallow bubbling of edit / navigation keys
    stopNavKeyPressBubbling:true,
    stopCharacterKeyPressBubbling:true,


    // Override handleKeyPress to implement character casing, keypress filter, and
    // masking.
    handleKeyPress : function (event, eventInfo) {
        // default implementation will pick up "STOP_BUBBLING" for character keys
        // and Arrow Keys / home/end if necessary.
        var returnVal = this.Super("handleKeyPress", arguments);
        if (returnVal == false) {
            return false;
        }
        // If we're not explicitly returning false, we'll return this returnVal
        // This allows superclass logic to return stop-bubbling and thus prevent
        // things like scrolling of the form/parents on arrow keypresses which have
        // meaning to this item.

        
        // If field is read-only, nothing more to do
        if (this.isReadOnly()) return returnVal;

        var keyName = event.keyName || "";

        // Let standard key handling process this keyPress if
        // - Ctrl or Alt or Meta key is also pressed
        // - not performing case conversion, key press filtering or masked entry
        
        if ((isc.EventHandler.ctrlKeyDown() || isc.EventHandler.altKeyDown() || isc.EH.metaKeyDown()) &&
	    (eventInfo.characterValue === null || eventInfo.characterValue < 128)) {
            if (this.mask &&
                (keyName.startsWith("Arrow_") || keyName == "Home" || keyName == "End") &&
                !isc.EH.shiftKeyDown())
            {
                this.clearSelectionRange();
            }

            return returnVal;
        }
        if ((!this.characterCasing || this.characterCasing == isc.TextItem.DEFAULT) &&
            !this._keyPressRegExp &&
            !this.mask)
        {
            return returnVal;
        }

        var characterValue = event.characterValue
        ;
        // Perform in-field navigation and deletion
        if (this.mask) {
            var selection = this._getSelection();
            if (isc.Browser.isFirefox) {
                // for Firefox, use the selectionAtKeyDown, because the current selection
                // has been reset by this point
                var sel = this._selectionAtKeyDown;
                
                if (sel) {
                    selection.begin = sel[0];
                    selection.end = sel[1];
                }
            }
            var isSafari = isc.Browser.isSafari;

            var pos = selection.begin;
            // Handle backspace and delete keys
            if (keyName == "Backspace" || keyName == "Delete") {
                // If there is a selection, these keys the result is identical
                if ((selection.begin - selection.end) != 0 || 
                    (isSafari && this._lastSelection))
                {
                    if (isc.Browser.isSafari && this._lastSelection) {
                        
                        selection = this._lastSelection;
                        this._lastSelection = null;
                    }
                    if (this.maskOverwriteMode) {
                        this._clearMaskBuffer(selection.begin, selection.end);
                    } else {
                        var len = selection.end - selection.begin;
                        this._shiftMaskBufferLeft(selection.begin, len);
                    }
                    this._saveMaskBuffer(true);
                    this._positionCaret(selection.begin, 0);
                } else {
                    // No selection
                    if (keyName == "Backspace") {
                        
                        var shiftPos = pos - 1;
                        if (shiftPos >= 0) {
                            if (this.maskOverwriteMode) {
                                while (!this._maskFilters[shiftPos] && shiftPos >= 0) shiftPos--;
                                if (shiftPos > -1) {
                                    this._maskBuffer[shiftPos] = this.maskPromptChar;
                                }
                            } else {
                                this._shiftMaskBufferLeft(shiftPos);
                            }
                            if (shiftPos >= 0) {
                                this._saveMaskBuffer(true);
                                this._positionCaret(shiftPos, -1);
                            }
                        }
                    } else {
                        if (this.maskOverwriteMode) {
                            // Don't clear a non-entry position
                            if (pos < this._length && pos == this._getNextEntryPosition (pos - 1)) {
                                this._maskBuffer[pos] = this.maskPromptChar;
                            }
                        } else {
                            this._shiftMaskBufferLeft(pos);
                        }
                        this._saveMaskBuffer(true);
                        this._positionCaret(pos, 0);
                    }
                }
                return false;

            } else if ((keyName.startsWith("Arrow_") || keyName == "Home" || keyName == "End") &&
                       !isc.EH.shiftKeyDown())
            {
                
                this.clearSelectionRange(true);
            }
            // setupInsertCharacterValue handles clearing selected characters prior to typing (except for
            // literals, natch), and positioning the caret correctly.
            // insertCharacterValue handles actually adding the typed character to the buffer
            if (this._willInsertCharacterValue(characterValue)) {
                
                this._setUpInsertCharacterValue(characterValue);
            }

            // Handle ESC key
            if (keyName == "Escape") {
                if (this.resetMaskOnEscape) {
                    
                    this._clearMaskBuffer(0, this._length); 
                    this._saveMaskBuffer(true);
                    this._setSelection(this._firstNonMaskPos == null ? 0 : this._firstNonMaskPos);
                }
            }
        }
        if (this._insertCharacterValue(characterValue) == false) {
            return false;
        } else {
            if (returnVal != false) this.clearSelectionRange();
            return returnVal;
        }
    },

    // helper to determine whether a given character will be accepted by the current mask
    
    _willInsertCharacterValue : function (characterValue) {        
        var selection = this._getSelection(),
            pos = selection.begin;
        // Completely unhandled characters can be filtered
        if ((this.mask && !this._isTypableCharacter (characterValue)) ||
            (!this.mask && ((!this._keyPressRegExp && !this._isAlphaCharacter (characterValue)) ||
                            (this._keyPressRegExp && !this._isTypableCharacter (characterValue)))))
        {
            return false;
        }

        var c = String.fromCharCode(characterValue);

        if (this.mask) {
            // Get next typable position
            var p = this._getNextEntryPosition (pos - 1);
            if (p < this._length) {
                 if (!this.maskOverwriteMode) {
                     // This method determines whether the mask buffer is full such that inserting
                     // a character would force meaningful user-entered values to be pushed off the end
                     // of the string
                     var bufferFull = this._subsequentMaskBufferFull(pos, selection);
                     if (bufferFull) return false;
                 }
            
                var filter = this._maskFilters[p];
                if (filter != null) {
                    // Perform character case changes
                    if (c !== this.maskPromptChar && filter.casing != null) {
                        // The German eszett 'ß' is a special case that maps to 'SS' when
                        // uppercased. Use charAt(0) to get a single character.
                        // See: http://unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
                        c = this._mapCharacterCase(c, filter.casing).charAt(0);
                    }

                    // Validate against the mask filter
                    
                    if (filter.filter.test(c) || (c === this.maskPromptChar && 
                                                  filter.filter.test(this.maskPromptChar))) 
                    {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    },

    // _subsequentMaskBufferFull(): Helper to determine whether we can insert a character into a specified
    // position without dropping any entered characters [other than maskPromptChars which are effectively "empty"]
    // Only relevent if we're not in blanket overwrite mode
    
    _subsequentMaskBufferFull : function (p, selection) {

        // "p" argument was derived via '_getNextEntryPosition' from the start of the current selection.
        // It's the position in which the character would be inserted, guaranteed to be 
        // a filter-char rather than a literal. 
        // Selection is the current selection
        var bufferFull = true;

        // If p < selection.end, there is (at least one) selected non literal char we can overwrite
        // Note that we explicitly test whether the typed character matches the filter for this target
        // position outside this method.
        if (p < selection.end) {
            bufferFull = false;
        // Common case: we're after the end of the selection [likely a simple caret insertion point]
        // Check that we have gaps (prompt characters) we can shift subsequent values into
        } else {
            
            // Loop through the string looking at each editable character, and the position it'd be shifted to.
            // If the character is already empty, we're done - we have space to move things into
            // Otherwise if it won't match the filter criteria for the target spot, we're done - we can't shift things
            var fromPos = p, toPos = p;
            while (fromPos <= this._length) {
                var fromChar = this._maskBuffer[fromPos];
                
                // If we're considering 'shifting' a gap, we're done
                // We don't need to shift the gap - we can just fill it.
                if (fromChar == this.maskPromptChar) {
                    bufferFull = false;
                    break;
                }

                toPos = this._getNextEntryPosition(toPos);
                // if fromPos == toPos, we're at the last enterable character in the string already
                // and we know it's not the maskPrompt character, so the mask is full
                if (toPos == fromPos) {
                    bufferFull = true;
                    break;
                }
                // Otherwise, if we've hit a character we can't shift into the new position to make room for
                // the typed character, the buffer is effectively "full" (immobile)
                if (fromChar != this.maskPromptChar) {
                    var filter = this._maskFilters[toPos];
                    if (filter && !filter.filter.test(fromChar)) {
                        bufferFull = true;
                        break;
                    }
                }
                // Look at the next non-literal character
                fromPos = toPos;
            }
        }
        return bufferFull;
    },
    
    _insertCharacterValue : function (characterValue, replayingCharacters) {

        var selection = this._getSelection(),
            pos = selection.begin;

        // Completely unhandled characters can be filtered
        if ((this.mask && !this._isTypableCharacter (characterValue)) ||
            (!this.mask && ((!this._keyPressRegExp && !this._isAlphaCharacter (characterValue)) ||
                            (this._keyPressRegExp && !this._isTypableCharacter (characterValue)))))
        {
            return true;
        }

        var c = String.fromCharCode(characterValue);

        if (this.mask) {
            
            // Get next typable position
            var p = this._getNextEntryPosition (pos - 1);
            if (p < this._length) {
                // if the mask if full, and not in overwrite mode, ignore inserts
                if (!this.maskOverwriteMode) {
                    // This method determines whether the mask buffer is full such that inserting
                    // a character would force meaningful user-entered values to be pushed off the end
                    // of the string, or into positions where they don't match the character filter
                    if (this._subsequentMaskBufferFull(p, selection)) return false;    
                }            

                var filter = this._maskFilters[p];
                if (filter != null) {
                    // Perform character case changes
                    if (c !== this.maskPromptChar && filter.casing != null) {
                        // The German eszett 'ß' is a special case that maps to 'SS' when
                        // uppercased. Use charAt(0) to get a single character.
                        // See: http://unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
                        c = this._mapCharacterCase(c, filter.casing).charAt(0);
                    }

                    // Validate against the mask filter
                    
                    if (filter.filter.test(c) || (c === this.maskPromptChar && 
                                                  filter.filter.test(this.maskPromptChar)))
                    {
                        if (!this.maskOverwriteMode && !replayingCharacters) {
                            this._shiftMaskBufferRight(p);
                        }
                        this._maskBuffer[p] = c;
                        var next = p;                        
                        if (this._saveMaskBuffer(true)) {
                            next = this._getNextEntryPosition(p);
                        }
                        this._setSelection(next);
                        if (replayingCharacters && c !== this.maskPromptChar) return next;
                    }
                }
            }
            return false;
        }

        // Perform character case changes
        var nc = c;
        if (!this.mask) nc = this._mapCharacterCase(c, this.characterCasing);

        // If no conversion was performed and a key press filter is not registered,
        // revert to standard keyPress handling
        if (c == nc && !this._keyPressRegExp) return true;

        // Check keyPress filter to determine if entered character is valid
        if (this._keyPressRegExp) {
            
            if (this._isTypableCharacter(characterValue) && !this._keyPressRegExp.test(nc)) {
                // Keypress is not valid. Suppress it by telling keyPress
                // handler that we handled the character but do nothing with it.
                return false;
            }
        }

        // If we get this far, the character entered is valid.
        // However, if case conversion was not performed we are done.
        if (c == nc) return true;

        // Case-converted character needs to be added to the current value.
        // Using the current selection (or insertion point) write the new character.
        var value = this.getValue() || "";

        // If changeOnKeypress is turned off, then lets use the elements current value as a base
        // for modification instead of the stored value as it will be more up to date.
        if (!this.changeOnKeypress) {
            value = this.getElementValue() || "";
        }

        selection = this.getSelectionRange();
        
        
        value = value.substring(0, selection[0]) + nc + value.substring(selection[1]);
        
        // Push new value to field and update caret position
        if (this.changeOnKeypress) {
            this.setElementValue(value);
            this.updateValue();
        } else {
            this.setValue(value);
        }
        this.setSelectionRange(selection[0] + 1, selection[0] + 1);


        // Don't process this keyPress event further
        return false;
    },

    _setUpInsertCharacterValue : function (characterValue) {
        if (this.mask) {
            var selection = this._getSelection();
            var isSafari = isc.Browser.isSafari;

            // If there is a selection, see if it should be cleared first
            if (this._isTypableCharacter (characterValue) &&
                ((selection.begin - selection.end) != 0 || (isSafari && this._lastSelection)))
            {
                if (isc.Browser.isSafari && this._lastSelection) {
                    selection = this._lastSelection;
                    this._lastSelection = null;
                }
                if (this.maskOverwriteMode) {
                    this._clearMaskBuffer(selection.begin, selection.end);
                } else {
                    // retrieve the selection as it is now
                    selection = this._getSelection();
                    var len = selection.end - selection.begin;
                    this._shiftMaskBufferLeft(selection.begin, len);
                }
            }

            // For Safari, save selection
            if (isSafari && (selection.begin - selection.end) != 0 &&
                !this._isTypableCharacter(characterValue))
            { 
                this._lastSelection = selection;
            } else {
                this._lastSelection = null;
            }
        }
    },

    // Helper methods to determine valid typed characters
    _isTypableCharacter : function (characterValue) {
        return characterValue != null && (((characterValue >= 32 && characterValue <= 126) || characterValue > 127));
    },
    _isAlphaCharacter : function (characterValue) {
        return (characterValue >= 65 && characterValue <= 90) ||
            (characterValue >= 97 && characterValue <= 122);
     },
    _mapCharacterCase : function (c, casing) {
        if (casing == isc.TextItem.UPPER) {
            c = c.toUpperCase();
        } else if (casing == isc.TextItem.LOWER) {
            c = c.toLowerCase();
        }
        return c; 
    },
    
    //> @attr textItem.formatOnBlur (Boolean : false : IRW)
    // With <code>formatOnBlur</code> enabled, this textItem will format its value
    // according to the rules described in +link{formItem.mapValueToDisplay} as long as the 
    // item does not have focus.  Once the user puts focus into the item
    // the formatter will be removed. This provides a simple way for developers to
    // show a nicely formatted display value in a freeform text field, without the need
    // for an explicit +link{formItem.formatEditorValue()} 
    // and +link{formItem.parseEditorValue()} pair.
    // @visibility external
    //<
    // Implemented at the FormItem level.
    
    //> @attr textItem.formatOnFocusChange (Boolean : false : IRW)
    // Should +link{formItem.formatEditorValue} re-run whenever this item recieves or loses focus?
    // Setting this property allows developers to conditionally format the display value based on
    // item.hasFocus, typically to display a longer, more informative string while the item does
    // not have focus, and simplifying it down to an easier-to-edit string when the user puts
    // focus into the item.
    // @visibility external
    //<
    formatOnFocusChange:false,

    //> @attr   textItem.mask   (String : null : IRWA)
    // Input mask used to restrict and format text within this item.
    // <P>
    // Overview of available mask characters
    // <P>
    // <table class="normal">
    // <tr><th>Character</th><th>Description</th></tr>
    // <tr><td>0</td><td>Digit (0 through 9) or plus [+] or minus [-] signs</td></tr>
    // <tr><td>9</td><td>Digit or space</td></tr>
    // <tr><td>#</td><td>Digit</td></tr>
    // <tr><td>L</td><td>Letter (A through Z)</td></tr>
    // <tr><td>?</td><td>Letter (A through Z) or space</td></tr>
    // <tr><td>A</td><td>Letter or digit</td></tr>
    // <tr><td>a</td><td>Letter or digit</td></tr>
    // <tr><td>C</td><td>Any character or space</td></tr>
    // <tr><td>&nbsp;</td></tr>
    // <tr><td>&lt;</td><td>Causes all characters that follow to be converted to lowercase</td></tr>
    // <tr><td>&gt;</td><td>Causes all characters that follow to be converted to uppercase</td></tr>
    // <tr><td>&nbsp;</td></tr>
    // <tr><td>[ ... ]</td><td>Square brakets denote the start and end of a custom 
    //      regular expression character set or range.</td></tr>
    // </table>
    // <P>
    // The mask can also contain literals - arbitrary non editable characters 
    // to be displayed as part of the formatted text. Any character not matching one
    // of the above mask characters will be considered a literal. To use one of the
    // mask characters as a literal, it must be escaped with a pair of backslashes (\\). By 
    // default literals are formatting characters only and will not be saved as part of the 
    // item's value.  This behavior is controlled via +link{TextItem.maskSaveLiterals}.
    // <P>
    // When a TextItem with a mask has focus, the formatted mask string will be displayed, 
    // with the +link{maskPromptChar} displayed as a placeholder for characters that have not yet
    // been entered.<br>
    // As the user types in the field, input will be restricted to the appropriate character class
    // for each character, with uppercase/lowercase conversion occurring automatically. When focus
    // is moved away from the field, the displayed value will be formatted to include any literals
    // in the appropriate places.
    // <P>
    // Sample masks:
    // <UL>
    // <LI>Phone number: (###) ###-####</LI>
    // <LI>Social Security number: ###-##-####
    // <LI>First name: &gt;?&lt;??????????</LI>
    // <LI>Date: ##/##/####</LI>
    // <LI>State: &gt;LL</LI>
    // </UL>
    // <P>
    // Custom mask characters can be defined by standard regular expression character set
    // or range. For example, a hexadecimal color code mask could be:
    // <UL>
    // <LI>Color: \\#&gt;[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F]</LI>
    // </UL>
    // <P>
    // Note: input mask cannot be used at the same time as a +link{textItem.keyPressFilter}.
    // Also note that this property is not supported for
    // +link{ComboBoxItem} or +link{SpinnerItem}, or for items with +link{browserInputType}
    // set to "digits" or "number".
    //
    // @setter setMask()
    // @see textItem.keyPressFilter
    // @example maskedTextItem
    // @visibility  external
    //<
    

    //> @attr   textItem.maskOverwriteMode   (boolean : null : IRWA)
    // During entry into a +link{TextItem.mask,masked field}, should keystrokes overwrite current position value?
    // By default new keystrokes are inserted into the field.
    // @visibility  external
    //<    

    //> @attr   textItem.maskSaveLiterals   (boolean : null : IRWA)
    // Should entered +link{TextItem.mask,mask} value be saved with embedded literals?
    // @visibility  external
    //<    

    //> @attr   textItem.maskPadChar   (String : " " : IRWA)
    // Character that is used to fill required empty +link{textItem.mask,mask} positions
    // to display text while control has no focus.
    // @visibility  external
    //<    
    
    maskPadChar: " ",

    //> @attr   textItem.maskPromptChar   (String : "_" : IRWA)
    // Character that is used to fill required empty +link{textItem.mask,mask} positions
    // to display text while control has focus.
    // @visibility  external
    //<    
    maskPromptChar: "_",

    //> @method textItem.setMask ()
    // Set the +link{textItem.mask,mask} for this item.  Pass null to clear an existing mask.
    // <P>
    // Note that the current value of the field is cleared when changing the mask.
    // @param mask (String) mask to apply to text item
    // @see textItem.mask
    // @visibility external
    //<
    setMask : function (mask) {
        if (isc.isA.ComboBoxItem(this) || isc.isA.SpinnerItem(this)) {
            this.logWarn("setMask(): This TextItem subclass does not support input masks.")
            return;    
        }
        
        if (!this.mask != !mask && this._delayedSelect != null) {
            isc.Timer.clear(this._delayedSelect);
            this._delayedSelect = null;
        }
        // Setup mask
        this.mask = mask;
        this._parseMask ();
        if (this.keyPressFilter) {
            this._keyPressRegExp = null;
            this.logWarn("setMask: keyPressFilter ignored because mask is enabled");
        }

        // Clear the field value
        this.clearValue();
    },

    _parseMask : function () {
        var mask = this.mask;
        if (!mask) return;

        // Create an array of mask position checks for keyPress filtering.
        // Each entry will be an object holding the regular expression of
        // valid characters, whether the character should be converted to
        // upper of lower case, and if the character is required (for
        // validation).
        this._maskFilters = [];
        this._firstNonMaskPos = null;

        // This buffer holds the prompt characters and fixed characters from
        // the mask along with the characters entered by the user. It is
        // updated and then rewritten to the field when ready.
        this._maskBuffer = [];

        this._length = 0;

        // Current casing state
        var casing = null;     // no casing change
        // Current escape sequence state
        var escaping = false;
        // Are we processing a custom regex?
        var inRegex = false;
        // Current custom regex value
        var customRegex = "";

        // Build the mask filters and buffer
        for (var i = 0, numMaskChars = mask.length; i < numMaskChars; ++i) {
            
            var c = mask.charAt(i);

            if (!inRegex) {
                if (!escaping && c === "\\") {
                    escaping = true;
                } else if (escaping) {
                    this._addLiteralToMask(c, casing);
                    escaping = false;
                } else if (c === "<") {
                    // lowercase
                    casing = (casing == isc.TextItem.LOWER ? null : isc.TextItem.LOWER);
                } else if (c === ">") {
                    // uppercase
                    casing = (casing == isc.TextItem.UPPER ? null : isc.TextItem.UPPER);
                } else if (c === "[") {
                    // Start of custom regex
                    inRegex = true;
                    customRegex += c;
                } else {
                    this._addUnknownToMask(c, casing);
                }
    
            } else {
                
                if (c === "]") {
                    // End of custom regex
                    inRegex = false;
                    customRegex += c;
                    this._addCustomRegexToMask(customRegex, casing);
                    customRegex = "";

                } else {
                    // Building custom regex
                    customRegex += c;
                }
            }
        }

        // If we've reached the end of the mask, but are still escaping or within a regex...
        if (!inRegex) {
            if (escaping) {
                this.logWarn("Invalid mask syntax: Trailing backslash");
                this._addLiteralToMask("\\", casing);
                escaping = false;
            }
        } else {
            this.logWarn("Invalid mask syntax: Character class regular expression was not terminated");
            inRegex = false;
            customRegex += "]";
            this._addCustomRegexToMask(customRegex, casing);
            customRegex = "";
        }
    },

    _addLiteralToMask : function(c, casing) {
        this._maskFilters.push (null);
        this._maskBuffer.push (c);
        this._length++;
    },

    _addCustomRegexToMask : function (customRegex, casing) {
        this._maskFilters.add({
            filter: new RegExp(customRegex),
            casing: casing
        });
        if (this._firstNonMaskPos == null) {
            this._firstNonMaskPos = this._maskFilters.length - 1;
        }
        this._maskBuffer.push(this.maskPromptChar);
        this._length++;
    },

    _addUnknownToMask : function(c, casing) {
        // Define standard keypress filters
        var def = isc.TextItem._filterDefinitions[c];
        if (def) {
            this._maskFilters.push(
                { filter: new RegExp (def.charFilter),
                  casing: casing }
            );
            if (this._firstNonMaskPos == null) {
                this._firstNonMaskPos = this._maskFilters.length - 1;
            }
            this._maskBuffer.push (this.maskPromptChar);
        } else {
            // No filter defined for character. Assumed to be a literal.
            this._maskFilters.push (null);
            this._maskBuffer.push (c);
        }
        // Add to our length
        this._length++;
    },

    // Mask handling private helper methods
    // Selection handling wrapper methods
    _getSelection : function () {
        var range = this.getSelectionRange();
        if (range == null) range = [0,0];
        return { begin: range[0], end: range[1] };
    },
    _setSelection : function (begin, end) {
        // end parameter is optional. If not passed, it is matched to begin
        // to set the caret position.
        if (this.hasFocus) {
            end = (isc.isA.Number(end) ? end : begin);
            this.setSelectionRange(begin, end);
        }
    },
    // Get position of next user-entered character (i.e. non-literal)
    _getNextEntryPosition : function (pos) {
        while (++pos < this._length) {
            if (this._maskFilters[pos]) return pos;
        }
        return this._length;
    },
    // Get last unentered character position
    _getEndPosition : function () {
        var lastMatch;
        for (var i = this._length-1; i >= 0; i--) {
            if (this._maskFilters[i]) {
                if (this._maskBuffer[i] == this.maskPromptChar) 
                    lastMatch = i;
                else
                    break;
            }
        }
        if (lastMatch == null) lastMatch = this._length;
        return lastMatch;
    },
    // Map the stored value to the display (edit) format.
    // There are two ways a value can be stored: with literals and without.
    // If stored with literals, all entered characters and literals are mapped
    // directly into the mask.
    // If stored without literals the characters have to be placed into the
    // mask from left to right as if typed by the user. 
    // When this control has focus, maskPromptChars are used to fill in unentered
    // characters in the mask. When focus is lost, these same characters are
    // replaced by the maskPadChar.
    // 
    _maskValue : function (paramValue) {
        var value = paramValue || "";
        
        value = this._getMaskableValue(value);
        
        // Clear buffer contents of entered characters. All that is left are
        // the literals and maskPromptChars.
        this._clearMaskBuffer (0, this._length);

        // Keep up with the last character matched into the mask.
        var lastMatch = -1;

        // Merge value into buffer
        if (this.maskSaveLiterals) {
            // value should be a one-to-one match for mask
            for (var i = 0, pos = 0; i < value.length; i++) {
                if (this._maskFilters[i]) {
                    // Position expects user entry
                    var c = value.charAt(i);

                    // Map a space to maskPromptChar when focused.
                    // Or place entered character into buffer.
                    if (c == " " ) {
                        this._maskBuffer[i] = this.hasFocus ? this.maskPromptChar : 
                                                              this.maskPadChar;
                    } else if (this._maskFilters[i].filter.test(c)) {
                        this._maskBuffer[i] = c;
                        lastMatch = i;
                    }
                }
            }
        } else {
            // try to place characters into mask as if type manually.
            for (var i = 0, pos = 0; i < this._length; i++) {
                if (this._maskFilters[i]) {
                    while (pos < value.length) {
                        var c = value.charAt (pos++);

                        // If there is a space in this position, let it be
                        // replaced with the maskPromptChar because it can
                        // be entered.
                        var maskFilter = this._maskFilters[i];
                        if (c == " ") {
                            this._maskBuffer[i] = this.hasFocus ? this.maskPromptChar : 
                                                                  this.maskPadChar;
                            break;
                        } else if (maskFilter.filter.test(c)) {
                            this._maskBuffer[i] = maskFilter.casing ? 
                                this._mapCharacterCase(c, maskFilter.casing) : c;
                            lastMatch = i;
                            break;
                        }
                    }
                    if (pos > value.length) break;
                }
            }
        }

        value = this._getMaskBuffer();
        if (!this.hasFocus) {
            // If there are literals after the last matched entry, include
            // those in display.
            if (lastMatch >= 0) {
                for (var i = lastMatch + 1; i < this._length; i++) {
                    if (this._maskFilters[i]) break;
                    lastMatch++;
                }
            }
            // Chop display value to remove trailing spaces
            value = value.substring (0, lastMatch + 1);
            // this.logWarn("No focus, so chop:" + value);
        }
        return value;
    },
    // Map the edit value to the stored format.
    _unmaskValue : function (value) {
        // Display should be in masked format. Convert it to desired output format.
        if (value == null) value = "";

        // We need to know if there is anything in the display value other
        // than literals. This way an empty value is produced when done.
        // The resulting value should also be chopped after the last entered
        // or literal character.
        var hasNonLiterals = false;
        var lastValidChar = -1;

        var newValue = "";
        for (var i = 0, pos = 0; i < value.length; i++) {
            var c = value.charAt (i);

            if (this._maskFilters[i]) {
                if (c != this.maskPromptChar && this._maskFilters[i].filter.test (c)) {
                    // Valid character at this position
                    newValue += c;
                    hasNonLiterals = true;
                    lastValidChar = pos++;
                } else {
                    // Invalid character
                    newValue += this.maskPadChar;
                    pos++;
                }

            } else if (this.maskSaveLiterals) {
                // Literal character
                newValue += c;
                lastValidChar = pos++;
            }
        }

        // Truncate result
        if (!hasNonLiterals) {
            newValue = "";
        } else {
            newValue = newValue.substring (0, lastValidChar + 1);
        }
        return newValue;
    },

    // Mask buffer helper methods
    _getMaskBuffer : function () {
        if (this._maskBuffer == null) return "";
        return this._maskBuffer.join('');
    },
    _clearMaskBuffer : function (start, end) {
        for (var i = start; i < end && i < this._length; i++) {
            if (this._maskFilters[i]) this._maskBuffer[i] = this.maskPromptChar;
        }
    },
    _saveMaskBuffer : function (changed) {
        // Update our saved value so a call to getValue() will return our
        // current edit value. Don't call setValue() because it requires
        // the unformatted value and then formats it. We already have a
        // formatted (display) value.
        var buffer = this._getMaskBuffer();
        // Show current display value
        this.setElementValue (buffer);

        if (changed && this.changeOnKeypress) {
            var value = this._unmaskValue(buffer);

            // Below here is something like a subset of 'storeValue()'

            
            // fire the change handler, (handles validation etc)
            var returnVal = this.handleChange(value, this._value);
            // The change handler may call 'setItems' on the form (particularly likely in LG
            // editing) in which case we'll be destroyed
             
            if (this.destroyed) return;
            // Ensure we have the latest value (stored as this._changeValue)
            value = this._changeValue;
            // We may need to perform some visual updates based on the new value - do this here
            this.updateAppearance(value);
            // save the value
            this.saveValue (value);
            // fire any specifed 'changed' handler for this item.
            this.handleChanged(value);

            return returnVal;
        }
        return true;
    },

    // When the user puts focus into a masked text field, position the caret at the
    // intuitive position for typing
    _fixCaretForMask : function (selection) {

        var endPos = this._getEndPosition(),
            begin,end;

        // If we're not interested in retaining caret position, 
        // or we are empty, always just put focus at the first typeable character
        if (selection == null || this.getValue() == null) {
            

            begin = end = endPos;
        // Otherwise - user clicked in the field
        // - if caret was placed in a valid spot within already-typed characters
        //   retain it
        // - otherwise, 
        //  - if the user clicked after the meaningful typed characters,
        //    clamp to the end spot
        //  - if the user clicked before the first meaningful typed character, clamp to
        //    the start spot
        } else {
            
            var startPos = Math.min(endPos, this._getNextEntryPosition(-1));
            
            
            begin = Math.max(startPos, Math.min(selection[0], endPos));
            end =  Math.max(startPos, Math.min(selection[1],endPos));
        }
        this.setSelectionRange(begin,end);
    },

    // Position caret at offset in field
    _positionCaret : function (pos, offset) {
        if (offset < 0) {
            while (!this._maskFilters[pos] && pos > 0) pos--;
        } else {
            while (!this._maskFilters[pos] && pos <= this._length) pos++;
        }
        this._setSelection (pos);
    },
    // Shift contents of buffer to left starting at <pos>
    // selectionLength argument indicates length of current selection - we'll be replacing all the characters
    // within this selection (from pos to pos+selectionLength), excluding literals of course
    _shiftMaskBufferLeft : function (pos, selectionLength) {
        
        // Note: Behavioral difference. If len is unset or zero we're literally deleting whatever
        // is to the left of the caret. If it happens to be a literal, we'll jump over the literal
        // to find the next deletable character, and replace that with the next editable character (to the
        // right of the caret position)
        // If len is > 0, the user has explicitly selected a chunk of text to replace.
        // In this case we want to clear everything within this chunk (except literals) and shift
        // the subsequent editable characters into the editable spots within this range. We don't ever
        // want to walk the starting position to the left in this case.
        var len;
        if (selectionLength == null || selectionLength == 0) {
            while (!this._maskFilters[pos] && pos > 0) pos--;
            len = 1;
        } else {
            len = selectionLength;
        }

        // Starting at "pos + len", move each character <len> positions to the left
        // Exceptions / special cases:
        // - If the characters to be replaced include literals, these are just skipped
        //   For example if a standard US phone filter is set up like "(###) ### ####", with values: "(510) 418 1234"
        //   A user could select the entire "(510)" substring (pos:0, len:5)
        //   and we'd only actually replace the non literal characters "510" with other non literal characters "418"
        // - Each character moved into a new position has to match the mask restrictions for its new position
        //   otherwise we'll just write a "_" into the target position instead.
        //   For example:
        //   Filter "LLL ###", value "ABC 123" 
        //      - deleting the 2 would give "ABC 13_", deleting the 1 and 3 would give "ABC 3__"
        //      - deleting the "B" couldn't validly give us "AC1 23_" so instead we don't attempt to shift and
        //        give "A_C 123".
        
        var charactersToMove = [],
            invalid = false;

        for (var toIndex = pos, fromIndex = pos+(len-1); toIndex < this._length; toIndex++) {
            // if target character to replace is a literal [non editable / no mask],
            // move to the right, leaving 'fromIndex' in the same position
            var filter = this._maskFilters[toIndex];
            if (!filter) {
                continue;
            }

            fromIndex = this._getNextEntryPosition(fromIndex);

            var characterToMove;
            if (fromIndex >= this._length) characterToMove = this.maskPromptChar;
            else {
                characterToMove = this._maskBuffer[fromIndex];
                if (characterToMove != this.maskPromptChar && !filter.filter.test(characterToMove)) {
                    // invalid flag indicates we can't just move everything. We'll instead insert
                    // a gap to fill the space where the character was removed
                    invalid = true;
                    break;
                } else {
                    // Perform character case changes
                    if (filter.casing) {
                        characterToMove = this._mapCharacterCase (characterToMove, filter.casing);
                    }
                }
            }
            charactersToMove.add({c:characterToMove, from:fromIndex, to:toIndex});
        }

        // If we couldn't move *all* the subsequent chars into their desired positions just
        // replace the "deleted" characters with prompt characters, leaving the subsequent chars
        // where they are
        if (invalid) {
            for (var i = pos; i < pos+len; i++) {
                if (this._maskFilters[i]) this._maskBuffer[i] = this.maskPromptChar;
            }
        // Otherwise shift everything
        } else {
            for (var i = 0; i < charactersToMove.length; i++) {
                var c = charactersToMove[i].c,
                    from = charactersToMove[i].from,
                    to =  charactersToMove[i].to;
                this._maskBuffer[to] = c;
            }
        }

        return !invalid;
    },

    // Shift contents of buffer to right starting at <pos>
    _shiftMaskBufferRight : function (pos) {

        for (var i = pos, c = this.maskPromptChar; i < this._length; i++) {
            var filter = this._maskFilters[i];
            if (filter) {
                // Perform character case changes
                if (filter.casing) {
                    c = this._mapCharacterCase (c, filter.casing);
                }
                var j = this._getNextEntryPosition (i);
                var t = this._maskBuffer[i];
                this._maskBuffer[i] = c;
                if (j < this._length && this._maskFilters[j].filter.test (t)) {
                    c = t;
                } else {
                    break;
                }
            }
        }

    },
    
    // Returns either:
    // - The atomic value, converted to a String, if this item can edit opaque values and the 
    //   the item's value is an object, and this item's SimpleType provides a getAtomicValue()
    //   implementation    
    // - In all other circumstances, the item's value converted to a String
    _getMaskableValue : function (value) {
        
        if (this.canEditOpaqueValues && isc.isAn.Object(value)) {
            if (isc.SimpleType) {
                var simpleType = isc.SimpleType.getType(this.type)
                if (simpleType && simpleType.getAtomicValue) {
                    value = simpleType.getAtomicValue(value, "mask");
                }
            }
        }
        if (value == null) value = "";
        if (!isc.isA.String(value)) value = value.toString();    
        
        return value;
    }

    //> @method textItem.pendingStatusChanged()
    // Notification method called when +link{FormItem.showPending,showPending} is enabled and
    // this text item should either clear or show its pending visual state.
    // <p>
    // The default behavior is that the +link{FormItem.titleStyle,titleStyle},
    // +link{FormItem.cellStyle,cellStyle}, and +link{attr:textBoxStyle,textBoxStyle} are
    // updated to include/exclude the "Pending" suffix. Returning <code>false</code> will cancel
    // this default behavior.
    // @include FormItem.pendingStatusChanged()
    //<
});

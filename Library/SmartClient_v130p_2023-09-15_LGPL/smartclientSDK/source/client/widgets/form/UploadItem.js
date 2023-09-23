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
//>	@class UploadItem
//
// FormItem that creates an HTML &lt;input type="file"&gt; control, with an interface that
// allows a user to pick a file from his machine to upload to the server.
// <P>
// <b>NOTE:</b> use +link{FileItem}, <b>not</b> UploadItem, if you are using the SmartClient
// Server framework.  FileItem is much easier to use and addresses all the limitations of
// UploadItem discussed below.  See the +link{group:upload,Uploading Files} overview for
// details.
// <P>
// If a form containing an UploadItem is +link{canvas.redraw(),redrawn} (which may
// happen if other form items are shown or hidden, the form is
// +link{canvas.redrawOnResize,resized}, or this or other items show validation errors) then 
// the value in the upload item is lost (because an HTML upload field may not be created with a
// value).  For this reason, if you are building a form that combines an UploadItem with other
// FormItems that could trigger redraw()s, recommended practice is to place each UploadItem in
// a distinct DynamicForm instance and create the visual appearance of a single logical form 
// via combining the DynamicForms in a +link{Layout}.  For the same reason, do not apply 
// +link{class:Validator,validators} to UploadItems: if such a validator fails, it will 
// cause the form to be redrawn and the UploadItem's value to be lost.
// <P>
// <B>NOTE: Browser-specific behaviors:</B> 
// <ul>
// <li> while getDisplayValue() can be used to retrieve the filesystem path of the uploaded file on some
// browsers, different browsers will return either just the file name without path or the full path.  It
// is plausible that some browsers may switch behavior in the future to not supply this value at all.  Do
// not rely on this value.
// <li> the appearance of the UploadItem is not consistent across browsers and we do not
// recommend trying to make it consistent or trying to apply styling to the upload control at all.  It is
// a potential security problem if an end user is unable to reliably recognize the upload control, hence,
// all browsers limit what styling can be applied.  Various hacks exists to get further control of
// styling, but it is likely these hacks will be broken by browser upgrades in the future.
// </ul>
//
// @inheritsFrom TextItem
// @group upload
// @visibility external
//<




isc.ClassFactory.defineClass("UploadItem", "TextItem");
isc.UploadItem.addProperties({
	_elementType:"FILE",

    //> @attr uploadItem.textBoxStyle (FormItemBaseStyle : "uploadItem" : IRW)
    // Base CSS class name for this <code>UploadItem</code>'s native file input element.
    // <p>
    // Note that the customization via CSS of a native file input element allowable by the
    // browser varies widely; in some browsers on certain platforms, it may be possible to
    // customize certain CSS properties, but not in others; or, it may be that the CSS property
    // (e.g. border) is applied differently in some browsers.
    // <p>
    // If the textBoxStyle is changed at runtime, +link{FormItem.updateState()} must be called
    // to update the visual state. However, calling updateState() will clear any file selected
    // by the user to be uploaded.
    // @include FormItem.textBoxStyle
    //<
    textBoxStyle: "uploadItem",

    // _nativeEventHandlers is a place to specify native event handlers to be applied to the
    // form item element once it has been written into the DOM (without having to override 
    // '_applyHandlersToElement()'
    _nativeEventHandlers : {
        // apply a native 'onchange' hander to notify us of changes.
        
        onchange : isc.FormItem._nativeChangeHandler
    },

    // this flag causes FormItem to set multiple="true" for the element in the DOM
    _propagateMultiple: true,
    
    //> @attr uploadItem.multiple (Boolean : true : [IR])
    // @include fileItem.multiple
    // @visibility external
    //< 
    multiple: true,

    //> @attr uploadItem.accept (String : null : [IR])
    // @include fileItem.accept
    // @visibility external
    //< 

    //> @attr uploadItem.capture  (String : null : [IR])
    // @include fileItem.capture
    // @visibility external
    //<
    
    maintainSelectionOnTransform: false
});


isc.UploadItem.addMethods({
    

    
    
    writeTextBoxWidth: isc.Browser.isMoz && isc.Browser.version >= 22,

    //> @attr uploadItem.width (number : 150 : IRW)
	// Width for this uploadItem. Note that SmartClient will not apply this size to the
	// native HTML &lt;input ...&gt; element written out by this formItem as this leads to
	// inconsistent appearance across different browsers. The specified width
	// acts as a minimum cell width for the item.
	// @visibility external
	//<
    //> @attr uploadItem.height (number : 19 : IRW)
	// Height for this uploadItem. Note that SmartClient will not apply this size to the
	// native HTML &lt;input ...&gt; element written out by this formItem as this leads to
	// inconsistent appearance across different browsers. The specified height
	// acts as a minimum cell width for the item.
	// @visibility external
	//<

    shouldFixRowHeight:function () {
        return true;
    },
    shouldWriteTextBoxWidth:function () {
        if (this.writeTextBoxWidth != null) return this.writeTextBoxWidth;
        return false;
    },
    shouldWriteTextBoxHeight:function () {
        if (this.writeTextBoxHeight != null) return this.writeTextBoxHeight;
        return false;
    },
    getTextBoxWidth : function (value) {
        if (!this.shouldWriteTextBoxWidth()) return null;
        return this.Super("getTextBoxWidth", arguments);
    },
    getTextBoxHeight : function (value) {
        if (!this.shouldWriteTextBoxHeight()) return null;
        return this.Super("getTextBoxHeight", arguments);
    },

    
    _sizeTextBoxAsContentBox : function () {
        return false;
    },
   
    
    _getEventMaskWidth : function () {
        var width = this.getElementWidth();
        if (!isc.isA.Number(width)) width = 185;
        return width;
    },

    // Override _updateValue - if the change handler etc attempts to modify the value 
    // log a warning that we can't support this and save the value the user entered.
    _updateValue : function (newValue) {
        // unmap the value if necessary 
        newValue = this.mapDisplayToValue(newValue);

        // Bail if we have already saved the value (avoids firing change on arrow keypresses,
        // etc.)
        if (newValue == this._value) return true;

        // fire the change handler, and bail if the change failed validation, etc.
        // Note: this method will call 'setValue()' to reset to the old value, or any value
        // suggested by the validators
        var returnVal = this.handleChange(newValue, this._value);

        // UploadItems don't support setting the value. If a change handler returned false, or
        // we otherwiser attempted to change the value, log a warning and drop that changed val
        if (this._changeValue != newValue) {
            this.logWarn("Upload Items do not support programmatically modifying the value entered " +
                         "by the user. Ignoring attempt to update from change handler");
        }

        // save the value
        
        this.saveValue(this.mapDisplayToValue(this.getElementValue()));
        delete this._changeValue;

        this.handleChanged(this._value);

        return returnVal;
    },

    redrawn : function () {
        this.Super("redrawn", arguments);
        this.updateValue(this.getElementValue());
    },

    //> @method uploadItem.setElementReadOnly()
    // Change the read-only state of the form element immediately.
    //<
    setElementReadOnly : function (readOnly) {
        // The element is actually a "FILE" and only has a disabled state.
        this._setElementEnabled(!readOnly && !this.isDisabled());
    },

    //>	@method	uploadItem.setValue()
    // Attempting to set the value for an upload form item is disallowed for security reasons.
    // Therefore this method will just log a warning, and not modify the value of the item.
    // @visibility external
	//<
	setValue : function (newValue) {
        var val = this.getValue();
        if (newValue == null || isc.isAn.emptyString(newValue)) {
            if (val == null || isc.isAn.emptyString(val)) return;
            return this.Super("setValue", arguments);
        }

        if (newValue != val) {
            this.logWarn("Attempting to set the value for an upload form item. This is disallowed " +
                         "for security reasons - returning the current value of the form item");
        }
        return val;
	},

    _handleElementChanged : function () {
        this.Super("_handleElementChanged", arguments);
        this.checkForImplicitSave();

        // If the value changed, ensure the container widget's scroll size reflects the
        // new value
        if (this.isDrawn()) this.adjustOverflow();

    },

	//>	@method	uploadItem.setElementValue()
	//		@group	elements
	//			Override setElementValue to explicity NOT manipulate the form element
	//			in Nav, since this is likely to crash.
	//		@param	newValue 	(Any)				value to set the element to
	//<
	setElementValue : function (newValue) {
        // we CAN clear an upload item's value, but not set it to anything else.
        if (newValue == null || isc.isAn.emptyString(newValue)) {
            // Moz and Safari do allow setting element value to "" but IE does not
            // However redrawing a form with an uploadItem in it will clear its value natively
            if (isc.Browser.isIE) {
                this.redraw();
                return;
            }
            return this.Super("setElementValue", arguments);
        }

        var val = this.getElementValue();
        if (newValue != val) {
            this.logInfo("Attempting to set the value for an upload form item. This is disallowed " +
                         "for security reasons - returning the current value of the form item");
        }

        // don't try to set the value of an upload field.  This should not be allowed by the
        // browser, as part of its security model, and attempting it will cause errors in some
        // browsers.
        return val;
	},

	// Make 'refreshDisplayValue' a no-op - there's no way to reformat the data value for display
	// for an upload item - it'd fall through to setElementValue().
	
	refreshDisplayValue:function () {
    },

    _shouldAllowExpressions : function () {
        return false;
    },

    

    _shouldSelectOnFocus : function () {
        return false;
    },

    //> @method uploadItem.getSelectionRange()
    // <strong>This method is not supported</strong> by <code>UploadItem</code>.
    // @return (Array of int) <code>null</code>
    // @visibility external
    //<

    //> @method uploadItem.setSelectionRange()
    // <strong>This method is not supported</strong> by <code>UploadItem</code>.
    // @visibility external
    //<

    //> @method uploadItem.selectValue()
    // <strong>This method is not supported</strong> by <code>UploadItem</code>.
    // @include TextItem.selectValue()
    //<

    //> @method uploadItem.deselectValue()
    // <strong>This method is not supported</strong> by <code>UploadItem</code>.
    // @include TextItem.deselectValue()
    //<


    // In some cases files selected on the filesystem may not be accessible to
    // the browser due to permission problems that have occurred after the file was
    // selected. 
    // This helper detects this
    
    checkFileAccess : function (callback) {
        if (isc.Browser.supportsAsynchFunctions) {
            var checkFiles = new Function("target", this.checkFileScript)(this);
            checkFiles(callback);
        } else {
            callback(true);
        }
    },
    checkFileScript:"        var _this = target;\r" + 
                    "        async function checkFiles(callback) {\r" +
                    "            var element = _this.getDataElement(),\r" +
                    "                files = element && element.files;\r" +
                    "            if (files == null || files.length == 0) {\r" +
                    "                callback(null);\r" +
                    "            } else {\r" +
                    "                for (var i = 0; i < files.length; i++) {\r" +
                    "                    var file = files[i];\r" +
                    "                    try {\r" +
                    "                        \r" +
                    "                        var oneByteBlob = await file.slice(0,1);\r" +
                    "                        var oneByteText = await oneByteBlob.text();\r" +
                    "                    } catch (e) {\r" +
                    "                        isc.logWarn(\"Attempting to access file encountered an error:\" + e);\r" +
                    "                        console.log(e);\r" +
                    "                        callback(false);\r" +
                    "                        return;\r" +
                    "                    }\r" +
                    "                }\r" +
                    "                callback(true);\r" +
                    "            }\r" +
                    "        }\r" + 
                    "        return checkFiles;"

});


isc.UploadItem.markUnsupportedMethods(null, ["getSelectionRange", "setSelectionRange", "selectValue", "deselectValue"]);

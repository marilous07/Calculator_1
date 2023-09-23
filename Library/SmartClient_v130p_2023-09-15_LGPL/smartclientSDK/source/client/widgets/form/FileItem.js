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
//> @groupDef upload
// SmartClient provides special client and server-side support for file upload that allows
// uploaded files to be treated like ordinary DataSource fields.  This includes:
// <ul>
// <li>the +link{FileItem} and +link{MultiFileItem} FormItems that enable users to upload one or
// more files as a background operation, without leaving the current page
// <li>server-side support that allows binary uploads to be treated as a normal DataSource field
// values, with all other aspects of server-side integration unchanged
// <li>built-in SQL &amp; Hibernate DataSource support that can store and retrieve uploaded
// files from SQL databases
// </ul>
// <P>
// The following documentation assumes you are using the SmartClient Java Server.  If you are
// not, skip to the sections near the end of this document.<br>
// <i>Note: This documentation topic is concerned specifically with file upload. Developers
// looking for a general discussion of how Binary fields are handled with the SmartClient
// server may also be interested in the +link{binaryFields,Binary Fields} overview.</i>
// <P>
// <b>Single file upload: "binary" field type</b>
// <P>
// To use SmartClient's client-server upload system, you use a DataSource field of
// +link{dataSourceField.type,type} "binary".  By default, a DynamicForm bound to a DataSource
// with a field of type "binary" will use the +link{FileItem}, which displays a standard HTML
// &lt;input type="upload"&gt; form control.
// <P>
// When you call +link{dynamicForm.saveData()} on a DynamicForm containing a FileItem,
// SmartClient processes the save identically to a saveData() call that did not include a file
// upload:
// <ul>
// <li> if you are using the built-in SQL connectors via serverType:"sql", the file will be
// saved to SQL as described under +link{type:FieldType,field type "binary"}.
// <li> if you have server-side business logic, the inbound request may be routed to your
// business logic via RPCManager dispatch or DMI declarations as normal, your business logic
// will receive a normal DSRequest, and you are expected to provide a normal DSResponse.
// </ul>
// <P>
// Client-side callbacks, such as the callback passed to saveData(), fire normally.
// <P>
// Note that FileItems cannot be programmatically populated - this is a browser security
// restriction over which we have no control.  This restriction means that we are unable to 
// populate a FileItem with the correct filename when a form is editing an existing record.
// Also, when you call saveData() on a form that is editing a new record, the FileItem will
// be cleared on successful completion of the saveData() call; this is a side-effect of the
// form being placed into "edit" mode.  In both of these cases, the fact that the FileItem 
// has been cleared will not cause the persisted binary data to be removed by SmartClient 
// Server on subsequent calls to setData().  If the user selects another file, it will 
// overwrite the existing one; if the FileItem is left blank, the server simply ignores it.
// If you actually wish to wipe out the value of a binary field, call 
// +link{DataSource.updateData(),updateData()} on the underlying dataSource, passing an 
// explicit null value for the binary field.
// <P>
// DataSources can have multiple binary fields, but developers should be aware that
// you can not submit more than one FileItem in a single form. Developers needing
// to upload multiple files can either use the +link{MultiFileItem}, or use multiple 
// DynamicForms (nested in a +link{VStack}, or similar), and submit them
// separately. For an add operation, the pattern would be to perform the initial submission
// of values for the record and then use the +link{dsRequest.callback,callback} to apply
// the primary key value for the new record to the forms with binary fields and save them
// to the server separately. This approach has the advantage that if an error or
// timeout occurs, users will not be caught waiting for files to complete uploading 
// before being notified of the failure and having to repeat the entire transaction.<br>
// Note when adding a new record using this pattern, if you have a binary field marked
// as <code>required="true"</code> it should be submitted as part of the initial submission.
// <P>
// <b>Restricting upload sizes</b> 
// <p> 
// The server framework includes mechanisms for setting maximum allowable file sizes. The 
// first, applied using +link{server_properties, global configuration properties}, is meant to 
// prevent an end user from uploading a file large enough to cause memory issues on the server.
// <p> 
// To configure the maximum allowed size of a single uploaded file (disabled by default), set 
// the <b>fileUpload.maxFileSize</b> property's value (in bytes): 
// <p style="text-indent: 25px">
// fileUpload.maxFileSize: 104857600 
// <p> 
// To configure the maximum combined size of all files in a single request (disabled by 
// default), set the <b>fileUpload.maxSize</b> property's value (also in bytes):  
// <p style="text-indent: 25px">
// fileUpload.maxSize: 209715200 
// <p> 
// Another configuration property controls the default value of a "binary" DataSourceField's 
// +link{dataSourceField.maxFileSize,maxFileSize} attribute, suitable for managing storage 
// requirements for a given DataSource over time (e.g., limiting images to 100MB). 
// <p style="text-indent: 25px">
// DSRequest.maxUploadFileSize: 104857600
// <p>
// To configure the maximum number of files in a single request (set to 10 by default), set
// the <b>fileUpload.maxFileCount</b> property's value:
// <p style="text-indent: 25px">
// fileUpload.maxFileCount: 10
// <p>
// When a +link{FileItem} or +link{UploadItem} is bound to a "binary" <code>DataSourceField</code>
// with a <code>maxFileSize</code> setting, a +link{ValidatorType,<code>maxFileSize</code>-type}
// validator is automatically added to the item's +link{FormItem.validators,validators}. In
// supported browsers, a <code>maxFileSize</code> validator is a client-side check that the
// size of a file selected for upload does not exceed the field's <code>maxFileSize</code>.
// Note, however, that server-side enforcement of the <code>maxFileSize</code> is always required
// because the user's browser might not support client-side file size checks. Also, any client-side
// check can be bypassed by a malicious user.
// <p>
//
// <b>Processing File Uploads with server-side business logic</b>
// <P>
// Server-side business logic that processes file uploads may retrieve upload files via the
// server side API dsRequest.getUploadedFile(<i>fieldName</i>).  The uploaded file is returned
// as an instance of ISCFileItem, which provides access to a Java InputStream as well as
// metadata about the file (size, name).  
// See the server-side JavaDoc (com.isomorphic.*) for details.
// <P>
// Server-side validation errors may be provided, including validation errors for the uploaded
// file (such as too large or invalid content), and will be displayed in the form that
// attempted an upload.
// <P>
// Be aware of the following special concerns when processing file uploads:
// <ul>
// <li> if you provide your own Java Servlet or JSP that creates an instance of RPCManager in
// order process SmartClient requests, many APIs of the HttpServletRequest are not safe to call
// before you have created the RPCManager, passing in the HttpServletRequest.  These include
// getReader(), getParameter() and other commonly called methods.  This is a limitation of
// Java Servlets, not specific to SmartClient
// <li> unlike other DataSource "add" and "update" operations, you are not expected to return
// the file as part of the data returned in the DSResponse
// </ul>
// <P>
// <b>Multi file upload: MultiFileItem</b>
// <P>
// The MultiFileItem provides an interface for a user to save one or more files that are
// related to a DataSource record, where each file is represented by a record in a
// related DataSource.
// <P>
// See the +link{MultiFileItem} docs for details.
// <P>
// <b>Upload without the SmartClient Server</b>
// <P>
// If it is acceptable that the application will do a full-page reload after the upload
// completes, you can simply:
// <ul>
// <li> set +link{DynamicForm.encoding} to "multipart"
// <li> include an +link{UploadItem} to get a basic HTML upload control
// <li> set +link{DynamicForm.action} to a URL where you have deployed server-side code to
// handle the upload
// <li> call +link{dynamicForm.submitForm()} to cause the form to be submitted
// </ul>
// This cause the DynamicForm component to submit to the form.action URL like an ordinary HTML
// &lt;form&gt; element.  Many 
// +externalLink{http://www.google.com/search?q=html+file+upload+example,online tutorials}
// are available which explain how to handle HTML form file upload in various server-side
// technologies.
// <P>
// Note that when you submitForm(), the only values that will be sent to your actionURL are 
// values for which actual FormItems exist.  This differs from saveData(), in which the
// entire set of +link{dynamicForm.values,form values} are always sent.  To handle submitting
// extra values, use +link{HiddenItem}s.
// <P>
// For further details, see the +link{UploadItem} docs.
// <P>
// <b>Background upload without the SmartClient Server</b>
// <P>
// Achieving background file upload without using the SmartClient server is also possible
// although considerably more advanced.  In addition to the steps above, create a hidden
// &lt;iframe&gt; element in the page, and use +link{dynamicForm.target} to target the form
// submission at this IFRAME.  In order receive a callback notification when the upload
// completes, after processing the file upload, your server should output HTML content for the
// IFRAME that includes a &lt;SCRIPT&gt; block which will navigate out of the IFRAME (generally
// via the JavaScript global "top") and call a global method you have declared as a callback.
//
// @title Uploading Files
// @visibility external
// @treeLocation Client Reference/Forms/Form Items/FileItem
// @example upload
// @example customBinaryField
// @example multiFileItem
//<

//> @class FileItem
//
// Binary data interface for use in DynamicForms. Allows users to select a single file for
// upload. In read-only mode (canEdit:false), can display the contents of "imageFile" fields.
//
// <P>
// <b>Editable mode</b>
// <P>
// The +link{fileItem.editForm} will be automatically generated and displayed as 
// +link{canvasItem.canvas,this.canvas}, allowing the user to select file(s) to upload.
// <P>
// See the +link{group:upload,Upload Overview} for information on using this control.
//
// <P>
// <b>Read-only mode</b>
// <P>
// For fields of type <code>"blob"</code> the raw data value will be displayed in the 
// generated +link{fileItem.displayForm}.
// <P>
// For other fields, the +link{fileItem.displayCanvas} will be displayed.
// <P>
// For <code>"imageFile"</code> fields with +link{fileItem.showFileInline, showFileInline}
// set to true, the image-file will be streamed and displayed inline within the displayCanvas.
// <P>
// Otherwise, the displayCanvas will render out +link{fileItem.viewIconSrc,View} and 
// +link{fileItem.downloadIconSrc,Download} icons and the fileName.
//
// @inheritsFrom CanvasItem
// @group upload
// @treeLocation Client Reference/Forms/Form Items
// @visibility external
//<
isc.ClassFactory.defineClass("FileItem", "CanvasItem");

isc.FileItem.addProperties({
    //> @attr fileItem.shouldSaveValue (Boolean : true : IR)
    // @include FormItem.shouldSaveValue
    //<
    // we want our value to show up in the forms values object!
    shouldSaveValue:true,

    // this flag causes FormItem to set multiple="true" for the element in the DOM
    _propagateMultiple: true,
    
    //> @attr fileItem.multiple (Boolean : true : [IR])
    // When true, allow the file-selection dialog shelled by the browser to select multiple 
    // files.
    // <P>
    // Support is not full-cycle at the server - that is, there are server APIs for retrieving
    // each file that was uploaded, but no built-in support for storing multiple files against
    // a single DataSource field.  However, you can write custom server DMI code to do
    // something with the files - for instance, you could create multiple new DataSource 
    // records for each file via a server DMI like this below:
    //
    // <pre>
    //    String fileNameStr = (String)dsRequest.getValues().get("image_filename").toString();
    //
    //    String[] fileNames = fileNameStr.split(", ");
    //    List files = dsRequest.getUploadedFiles();
    //
    //    for (int i = 0; i < files.size(); i++) {
    //        ISCFileItem file = (ISCFileItem)files.get(i);
    //        InputStream fileData = file.getInputStream();
    //        DSRequest inner = new DSRequest("mediaLibrary", "add");
    //        Map values = new HashMap();
    //        values.put("title", dsRequest.getValues().get("title"));
    //        values.put("image", fileData);
    //        values.put("image_filename", fileNames[i]);
    //        values.put("image_filesize", file.getSize());
    //        values.put("image_date_created", new Date());
    //        
    //        inner.setValues(values);
    //        inner.execute();
    //    }
    //    
    //    DSResponse dsResponse = new DSResponse();
    //    
    //    dsResponse.setStatus(0);
    //
    //    return dsResponse;
    // </pre>
    //
    // @setter setMultiple()
    // @visibility external
    //< 
    multiple: true,
    
    //> @method fileItem.setMultiple()
    // Updates the +link{fileItem.multiple} setting at runtime, propagating it to the Browser's
    // file dialog.  Causes a redraw.
    // 
    // @param multiple (boolean) the HTML of the view link
    // @visibility external
    //<
    setMultiple : function (multiple) {
        this.multiple = multiple;
        if (this.isDrawn()) this.redraw();
    },

    //> @attr fileItem.accept (String : null : [IR])
    // A comma-separated list of valid MIME types, used as a filter for the file picker window.
    // <P>
    // Note that this property makes use of the HTML <code>accept</code> attribute, and so
    // relies on the browser to perform the desired filtering.  For further study, see:<ul>
    // <li>+externalLink{https://www.w3schools.com/TAGS/att_input_accept.asp,HTML &lt;input&gt; accept Attribute}
    // <li>+externalLink{https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input,The Input (Form Input) element}
    // <li>+externalLink{https://stackoverflow.com/questions/181214/file-input-accept-attribute-is-it-useful,File input 'accept' attribute - is it useful?}
    // </ul>
    // @visibility external
    //< 

    //> @attr fileItem.showFileInline  (boolean : null : IR)
    // Indicates whether to stream the image and display it
    // inline or to display the View and Download icons.
    // 
    // @visibility external
    //<

    //> @attr fileItem.capture  (String : null : IR)
    // This attribute enables camera capture functionality for mobile devices, accepting the 
    // following values:
    // <ul>
    // <li>Set it to "user" to capture using the front-facing camera.</li>
    // <li>Set it to "environment" to capture using the rear-facing camera.</li>
    // </ul>
    // <p>
    // Please note that in the latest versions of Android and iOS, utilizing this attribute 
    // will consistently load the rear camera. This behavior is due to the direct camera software's 
    // ability to switch between the two cameras seamlessly.
    // <p>
    // When working with the capture functionality of iPhones and Android devices, it's important 
    // to consider the supported DataSourceField.mimeTypes for audio, video, and image files that 
    // can be used with the fileItem.accept attribute. Here's a list of commonly supported mime types 
    // for capturing on these devices:
    // <p>
    // Supported Image Mime Types:
    // <ul>
    // <li>image/jpeg: JPEG image format (.jpg, .jpeg)</li>
    // <li>image/png: Portable Network Graphics format (.png)</li>
    // </ul>
    // Supported Audio Mime Types:
    // <ul>
    // <li>audio/3gpp: 3GPP format, commonly used for audio capture.</li>
    // <li>audio/mp4: MP4 format, widely supported for audio capture.</li>
    // </ul>
    // Supported Video Mime Types:
    // <ul>
    // <li>video/3gpp: 3GPP format, commonly used for video capture.</li>
    // <li>video/mp4: MP4 format, widely supported for video capture.</li>
    // </ul>
    // <b>Behavior Based on 'accept' Attribute</b>
    // <p>
    // The behavior of using the capture attribute depends on the value used in the accept 
    // attribute. For example:
    // <ul>
    // <li><i>accept="image/*"</i> will load the camera ready to take pictures.</li>
    // <li><i>accept="audio/*"</i> will load the default audio recorder, not the camera.</li>
    // <li><i>accept="video/*"</i> will load the camera in video mode, ready to capture videos.</li>
    // </ul>
    // Please note that the SmartClient framework does not control the native device behavior 
    // beyond these attribute settings.
    // <p>
    // Lastly, keep in mind that these settings have no effect on desktop browsers; they apply 
    // exclusively to mobile devices.
    // <p>
    // This information is "circa 2023" and may not apply to all devices.
    // <p>
    //
    // @visibility external
    //<
    
    
    //> @attr fileItem.editForm (AutoChild DynamicForm : null : RA)
    // The +link{class:DynamicForm} created automatically when +link{formItem.canEdit, canEdit}
    // is true. Displays a single +link{fileItem.uploadItem, item} for manipulating a file.
    // <P>
    // This component is an +link{type:AutoChild} and as such may be customized via 
    // <code>fileItem.editFormDefaults</code> and
    // <code>fileItem.editFormProperties</code>.
    // <P>
    //
    // @group upload
    // @visibility external
    //<
    editFormConstructor: "DynamicForm",
    editFormDefaults: {
        // only one column: the UploadItem
        numCols:1,
        colWidths:["*"], 
        autoDraw:false,
        cellPadding:0,
        // suppress redraws as much as possible - redraw == killing the item value.
        _redrawWithParent:false,
        redrawOnResize:false,
        canSubmit:true,
        getSaveOperationType:function () {
            if (this.targetItem && this.targetItem.form) 
                return this.targetItem.form.getSaveOperationType();
            return this.Super("getSaveOperationType", arguments);
        }
    },
    
    //> @attr fileItem.uploadItem (AutoChild UploadItem : null : RA)
    // The +link{class:UploadItem} created automatically and displayed in the 
    // +link{editForm} when +link{formItem.canEdit, canEdit} is true.
    // <P>
    // This component is an +link{type:AutoChild} and as such may be customized via 
    // <code>fileItem.uploadItemDefaults</code> and
    // <code>fileItem.uploadItemProperties</code>.
    // <P>
    //
    // @group upload
    // @visibility external
    //<
    uploadItemConstructor: isc.TUploadItem || isc.UploadItem,
    //> @attr fileItem.displayForm (AutoChild DynamicForm : null : RA)
    // The +link{class:DynamicForm} created automatically when +link{formItem.canEdit, canEdit}
    // is false and the field is of type "blob". Displays a single 
    // +link{fileItem.displayItem, item} for viewing the content of a blob file.
    // <P>
    // This component is an +link{type:AutoChild} and as such may be customized via 
    // <code>fileItem.displayFormDefaults</code> and
    // <code>fileItem.displayFormProperties</code>.
    //
    // @group upload
    // @visibility external
    //<
    displayFormConstructor: "DynamicForm",
    displayFormDefaults: {
        autoDraw:false,
        // suppress redraws as much as possible - redraw == killing the item value.
        _redrawWithParent:false,
        redrawOnResize:false,
        canSubmit:true
    },

    //> @attr fileItem.displayItem (AutoChild StaticTextItem : null : RA)
    // The +link{class:StaticTextItem} created automatically and displayed in the 
    // +link{displayForm} when +link{formItem.canEdit, canEdit} is false and the field type is
    // "blob".
    // <P>
    // This component is an +link{type:AutoChild} and as such may be customized via 
    // <code>fileItem.displayItemDefaults</code> and
    // <code>fileItem.displayItemProperties</code>. 
    // <P>
    //
    // @group upload
    // @visibility external
    //<
    displayItemConstructor: "StaticTextItem",

    //> @attr fileItem.displayCanvas (AutoChild Canvas : null : RA)
    // The +link{class:Canvas} created automatically when +link{formItem.canEdit, canEdit}
    // is false and the field is of any type other than "blob".
    // <P>
    // If the field is of type "imageFile", and +link{fileItem.showFileInline, showFileInline} 
    // is true, the contents of the canvas are set to HTML that streams the image file for 
    // display. Otherwise, the item renders icons that allow the file to be 
    // +link{fileItem.viewIconSrc,viewed} or +link{fileItem.downloadIconSrc,downloaded}.
    // <P>
    // This component is an +link{type:AutoChild} and as such may be customized via 
    // <code>fileItem.displayCanvasDefaults</code> and 
    // <code>fileItem.displayCanvasProperties</code>.
    //
    // @group upload
    // @visibility external
    //<
    displayCanvasConstructor: "Canvas",

    _$blob:"blob",
    _createCanvas : function () {
        if (!isc.isA.Canvas(this.canvas)) {
            // Save the read-only state of our canvas

            this._isReadOnly = this.isReadOnly();
            this.canvas = (this._isReadOnly ? this._createReadOnlyCanvas()
                                            : this._createEditableCanvas());
        }
        this.containerWidget.addChild(this.canvas);
    },
    
    _createReadOnlyCanvas : function () {
        var props = {},
            canvas
        ;

        if (this.type == this._$blob) {
            // A read-only blob is rendered as a StaticTextItem.
            props = isc.addProperties({width: "100%", height: 10}, this.displayFormDefaults, this.displayFormProperties,
                {
                    action:this.action,
                    targetItem:this,
                    items:[
                        isc.addProperties({}, this.displayItemDefaults, this.displayItemProperties,
                            {
                                type:"text", editorType: this.displayItemConstructor,
                                width:this.width, height:"*",
                                name:this.getFieldName(), showTitle:false
                            }
                        )
                    ]
                }
            );
            var theClass = isc.isA.Class(this.displayFormConstructor) ? 
                    this.displayFormConstructor : isc[this.displayFormConstructor];
            canvas = this.displayForm = theClass.create(props);
        } else {
            props = isc.addProperties({width: "100%", height: 10, visibility: "hidden" }, 
                        this.displayCanvasDefaults, this.displayCanvasProperties
            );
            var theClass = isc.isA.Class(this.displayCanvasConstructor) ? 
                    this.displayCanvasConstructor : isc[this.displayCanvasConstructor];
            canvas = this.displayCanvas = theClass.create(props);
        }
        
        return canvas;
    },

    _createEditableCanvas : function () {
        var props = isc.addProperties({}, this.editFormDefaults, this.editFormProperties,
            {
                action:this.action,
                targetItem:this,
                checkFileAccessOnSubmit:this.form.checkFileAccessOnSubmit,
                
                visibility: "hidden",
                addOperation:this.form.addOperation,
                updateOperation:this.form.updateOperation,
                removeOperation:this.form.removeOperation,
                fetchOperation:this.form.fetchOperation,
                items:[
                    isc.addProperties({}, this.uploadItemDefaults, this.uploadItemProperties,
                        {
                            name: this.getFieldName(), 
                            showTitle: false, targetItem: this, 
                            editorType: this.uploadItemConstructor,
                            
                            width: isc.isA.Number(this.width) ? this.width : null,
                            height: isc.isA.Number(this.height) ? this.height : null,
                            multiple: this.multiple,
                            accept: this.accept, 
                            capture: this.capture,
                            getElementName : function () {
                                return this.getFieldName();
                            },
                            changed : function (form, item, value) {
                                this.targetItem.storeValue(value);
                            },
                            _fireStandardHandler : function () {
                                var targetItem = this.targetItem;
                                return targetItem._fireStandardHandler.apply(targetItem, arguments);
                            }
                        }
                    ),
                    // FileItems are used with the SmartClient server - _transaction item to contain
                    // details of the transaction when submitted to the server.
                    
                    {name:"_transaction", type:"HiddenItem"}
                ]
            }
        );

        var theClass = isc.isA.Class(this.editFormConstructor) ? 
                this.editFormConstructor : isc[this.editFormConstructor];
        var editForm = this.editForm = theClass.create(props);
        
        editForm.redrawIfDirty();
        this.uploadItem = editForm.items[0];
        return editForm;
    },

    _canEditChanged : function (canEdit, willRedraw) {
        // The two states require two different canvas's therefore a redraw.
        // This override is necessary because CanvasItem avoids redraws by default.
        this.redraw();
        return this.Super("_canEditChanged", arguments);
    },
    
    
    redraw : function () {
        var isReadOnly = this.isReadOnly();
        // This occurs when changing the state of canEdit.
        if (this._isReadOnly != isReadOnly) {
            this._recreateCanvas();
        } else if (this.canvas && !isReadOnly) {
            
            // if this.multiple is different from the "multiple" setting on the item in the 
            // canvas DynamicForm, recreate the form...
            var item = this.editForm.getItem(0);
            if (this.multiple != item.multiple) {
                item == null;
                this._recreateCanvas();
            }
        }
        this.Super("redraw", arguments);
    },
    
    _recreateCanvas : function () {
        var value = this.getValue();
        if (this.canvas) {
            delete this.canvas.canvasItem;
            this.canvas.destroy(true);
        }
        this._isReadOnly = this.isReadOnly();
        this.setCanvas(this._isReadOnly ? this._createReadOnlyCanvas()
                                        : this._createEditableCanvas());
        this.setValue(value);
    },

    // support setValue() if the newValue is empty (to clear a programmatically set value)
    // and ignore setting the value to the current value
    setValue : function (newValue) {
        if (this.isReadOnly()) {
            var form = this.form,
                record = form.getValues()
            ;
            if (this.type == "blob") {
                // Update the StaticTextItem value
                this.canvas.items[0].setValue(newValue);
            } else {
                this.setCanvasContent(newValue);
            }
            
            return this.Super("setValue", arguments)
        } else {
            if (newValue == null || isc.isA.emptyString(newValue)) {
                this.canvas.items[0].setValue(newValue);
                return this.Super("setValue", arguments);
            }

            return this.canvas.items[0].setValue(newValue);
        }
    },
    
    setCanvasContent : function (data) {
        var record = this.getFormRecord();

        
        if ((this.type == "imageFile" || this.type == "viewFile") && this.showFileInline != false) {
            this.canvas.setHeight("*");
            this.canvas.setWidth("*");
            this.canvas.setContents(this.getImageHTML() || "&nbsp;");
        } else {
            if (this.showFileInline == true) { // non-imageFile field
                this.logWarn("setValue(): Unsupported field-type for showFileInline: " +this.type);
            }
            this.canvas.setHeight(20);
            this.canvas.setWidth("*");
            this.canvas.setContents(this.getViewDownloadHTML(data, record) || "&nbsp;");
        }
    },


    setWidth : function (width) {
        if (this.canvas && !this.isReadOnly()) {
            this.canvas.items[0].setWidth(width);
        }
        this.Super("setWidth", arguments);
    },
    setHeight : function (height) {
        if (this.canvas && !this.isReadOnly()) {
            this.canvas.items[0].setHeight(height);
        }
        this.Super("setHeight", arguments);
    },

    getViewDownloadHTML : function (value, record) {

        //if (isc.isA.String(value)) return value;
        if (record == null) return null;

        var form = this.form,
            vm = form.valuesManager,
            ds = form.getDataSource(),
            field = ds ? ds.getField(this.name) : null,
            filenameField = (ds ? ds.getFilenameField(this.name) : null) || this.name + "_filename",
            name = record[filenameField],
            // see if the form has a value for the pk-field
            pkFields = ds ? ds.getPrimaryKeyFieldNames() : null,
            missingPkValues = (pkFields == null)
        ;

        
        if (field && !field.filenameSuppressed && (name == null || isc.isAn.emptyString(name))) {
            return this.emptyCellValue;
        }

        if (pkFields) {
            // use the values from the VM if there is one, so that participating forms don't 
            // need a hidden pk-field
            var values = vm ? vm.getValues() : form.getValues();
            for (var i = 0; i < pkFields.length; i++) {
                var pk = pkFields[i];
                if (isc.DynamicForm._getFieldValue(pk, this, values, form, true) == null) {
                    missingPkValues = true;
                    break;
                }
            }
        }

        
        if (missingPkValues) {
            // never show view/download if the record has no PK
            return this.emptyCellValue;
        }

        return "<nobr>" + this._getViewIconSrc() + "&nbsp;" + this._getDownloadIconSrc() + 
            (name ? "&nbsp;" + name : "") + "</nobr>";
    },
    
    //> @attr fileItem.viewIconSrc (SCImgURL : "[SKIN]actions/view.png" : [IR])
    // Returns the URL for an Icon that will allow the file to be viewed.
    // @visibility external
    // @group images
    //<
 
    //> @attr fileItem.downloadIconSrc (SCImgURL : "[SKIN]actions/download.png" : [IR])
    // Returns the URL for an Icon that will allow the file to be downloaded
    // @visibility external
    // @group images
    //<
    
    //> @method fileItem._getViewIconSrc()
    //  returns HTML for an Icon that will allow the file to be viewed
    // 
    // @return (String) the HTML of the view link
    // @visibility internal
    //<
    _getViewIconSrc : function() {
        return isc.Canvas.imgHTML({
            src: this.viewIconSrc,
            width: 16,
            height: 16,
            extraCSSText: "cursor:" + isc.Canvas.POINTER_OR_HAND,
            eventStuff: " onclick='" + this.getID() + ".viewFile()'"
        });
    },
    //> @method fileItem._getDownloadIconSrc()
    //  returns HTML for an Icon that will allow the file to be downloaded
    // 
    // @return (String) the HTML of the download link
    // @visibility internal
    //<
    _getDownloadIconSrc : function() {
        return isc.Canvas.imgHTML({
            src: this.downloadIconSrc,
            width: 16,
            height: 16,
            extraCSSText: "cursor:" + isc.Canvas.POINTER_OR_HAND,
            eventStuff: " onclick='" + this.getID() + ".downloadFile()'"
        });
    },

    getFormDataSource : function () {
        // get the DS from either the parent form or it's VM
        var ds = this.form.getDataSource() || 
                (this.form.valuesManager ? this.form.valuesManager.getDataSource() : null)
        ;
        return ds;
    },

    getFormRecord : function () {
        // get the data from either the VM or the parent form
        var record = this.form.valuesManager ? this.form.valuesManager.getValues() : null;
        if (!record || isc.isAn.emptyObject(record)) record = this.form.getValues();
        return record;
    },

    getImageHTML : function () {
        var record = this.getFormRecord();
        if (!record || isc.isAn.emptyObject(record)) return;

        var field = this.form.getField(this.name),
            urlProperty = this.name + "_imgURL",
            value = record ? record[urlProperty] : null,
            ds = this.getFormDataSource()
        ;

        if (value == null && ds) {
            var dimensions = isc.Canvas.getFieldImageDimensions(field, record);

            value = record[urlProperty] = isc.Canvas.imgHTML(ds.getFileURL(record, field.name),
                dimensions.width, dimensions.height, null, null, isc.Canvas._$allowRelativeSrc);
        }

        return value;
    },

    viewFile : function () {
        isc.DS.get(this.getFormDataSource()).viewFile(this.getFormRecord(), this.name);
    },

    downloadFile : function () {
        isc.DS.get(this.getFormDataSource()).downloadFile(this.getFormRecord(), this.name);
    },

    _shouldAllowExpressions : function () {
        return false;
    }
});

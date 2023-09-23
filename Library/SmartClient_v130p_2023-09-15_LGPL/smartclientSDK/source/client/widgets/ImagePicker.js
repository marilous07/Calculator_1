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
// Class will not work without the FlowLayout
if (isc.FlowLayout != null) {



//> @class ImagePicker
// A widget for selecting an image from one of various standard or customized repositories.
// @inheritsFrom VLayout
// @treeLocation Client Reference/Forms
// @visibility tools
//<
isc.defineClass("ImagePicker", "VLayout");
isc.ImagePicker.addClassMethods({
    //> @classMethod ImagePicker.getSharedImagePicker
    // Returns the shared global ImagePicker. 
    // Many applications will only need one ImagePicker instance; for such use 
    // cases, it is a good idea to use the shared object for performance reasons.
    // <p>
    // The optional second parameter to this method indicates whether the shared picker
    // should retain the state it was in last time it was used, or revert to defaults.
    // Generally, you will want the picker to revert to default state; this gives the
    // same user experience as creating a new instance without incurring the overhead.
    // However, some use cases will benefit from the picker remembering what the user
    // did last time.
    // @param properties (Object) Properties to apply to the global ImagePicker object
    // @param [keepCurrentState] (boolean) Should we keep the current state?
    //          If false (or not provided), revert to default state
    // @visibility internal
    //<
    getSharedImagePicker : function (properties, keepCurrentState) {
        properties = properties || {};
        
        if (!isc.isAn.ImagePicker(this._globalImagePicker)) {
            this._globalImagePicker = isc.ImagePicker.create(properties);
        } else {
            // Ensure previous selection methods won't fire even if unset on the properties 
            if (properties.acceptSelection == null) delete this._globalImagePicker.acceptSelection;
            if (properties.cancelSelection == null) delete this._globalImagePicker.cancelSelection;

            this._globalImagePicker.setProperties(properties);
        }

        if (!keepCurrentState) {
            var picker = this._globalImagePicker;
            // set state here
        }
        return this._globalImagePicker;
    }

});
isc.ImagePicker.addProperties({
    defaultWidth: 400,
    defaultHeight: 400,
    
    title: "Image Picker",
    
    //> @attr imagePicker.thumbnailSize (int : null : IR)
    // Default size for images in the various image-layouts.  If unset at runtime, defaults to
    // the +link{formItem.iconWidth, FormItem icon-size} for the current skin.
    // @visibility tools
    //<
    thumbnailSize: null,

    //> @attr imagePicker.thumbnailWidth (int : null : IR)
    // Default width for images in the various image-layouts.  If unset at runtime, defaults to
    // +link{imagePicker.thumbnailSize}.
    // @visibility tools
    //<
    thumbnailWidth: null,

    //> @attr imagePicker.thumbnailHeight (int : null : IR)
    // Default height for images in the various image-layouts.  If unset at runtime, defaults to
    // +link{imagePicker.thumbnailSize}.
    // @visibility tools
    //<
    thumbnailHeight: null,
    
    pickerLayoutDefaults: {
        _constructor: "VLayout",
        autoDraw: false,
        width: "100%",
        height: "100%",
        layoutMargin: 5,
        membersMargin: 5
    },

    imageStackDefaults: {
        _constructor: "SectionStack",
        autoDraw: false,
        width: "100%",
        height: "*",
        overflow: "auto",
        headerHeight: 30,
        padding: 0,
        visibilityMode: "multiple"
    },

    //> @attr imagePicker.showActionIcons (boolean : true : IR)
    // When true, shows a section containing the standard framework Action icons.
    // @visibility tools
    //<
    // setter setShowActionIcons
    showActionIcons: true,
    setShowActionIcons : function (showIcons) {
        this.showActionIcons = showIcons;
        if (this.showActionIcons) {
            this.imageStack.showSection("action");
        } else {
            this.imageStack.hideSection("action");
        }
    },
    //> @attr imagePicker.actionIconsTitle (String : "Action Icons" : IR)
    // The title for the +link{imagePicker.showActionIcons, Action icons} section.
    // @group i18nMessages
    // @visibility tools
    //<
    actionIconsTitle: "Action Icons",
    actionIconsLayoutDefaults: {
        _constructor: "ImageLayout",
        autoDraw: false,
        iconGroup: "action"
    },

    //> @attr imagePicker.showHeaderIcons (boolean : true : IR)
    // When true, shows a section containing the standard framework Header icons.
    // @visibility tools
    //<
    showHeaderIcons: true,
    setShowHeaderIcons : function (showIcons) {
        this.showHeaderIcons = showIcons;
        if (this.showHeaderIcons) {
            this.imageStack.showSection("headerIcons");
        } else {
            this.imageStack.hideSection("headerIcons");
        }
    },
    //> @attr imagePicker.headerIconsTitle (String : "Header Icons" : IR)
    // The title for the +link{imagePicker.showHeaderIcons, Header icons} section.
    // @group i18nMessages
    // @visibility tools
    //<
    headerIconsTitle: "Header Icons",
    headerIconsLayoutDefaults: {
        _constructor: "ImageLayout",
        autoDraw: false,
        styleName: "windowHeader",
        iconGroup: "header"
    },
    
    //> @attr imagePicker.showCustomImages (Boolean : null : IR)
    // When true, shows a +link{imagePicker.customImagesTitle, Custom Images} section 
    // containing the specified +link{imagePicker.customImages, images}.
    // @visibility internal
    //<
    
    showCustomImages: false,
    customImagesLayoutDefaults: {
        _constructor: "ImageLayout",
        autoDraw: false
    },

    //> @attr imagePicker.customImagesTitle (String : "Custom Images" : IR)
    // The title for the +link{imagePicker.showCustomImages, custom images} section.
    // @group i18nMessages
    // @visibility internal
    //<
    customImagesTitle: "Custom Images",

    //> @attr imagePicker.customImages (Array of SCImgURL | Array of Image Properties : null : IR)
    // The images to show in the +link{imagePicker.showCustomImages, custom images} section.
    // @visibility internal
    //<

    //> @attr imagePicker.tipText (String : "Upload images to DropBox or a similar service and enter the public URL below" : IR)
    // The text displayed below the various image sections.
    // @group i18nMessages
    // @visibility tools
    //<
    tipText: "Upload images to DropBox or a similar service and enter the public URL below",

    editFormDefaults: {
        _constructor: "DynamicForm",
        autoDraw: false,
        width: "100%",
        padding: 0,
        autoFocusOnError: false
    },
    
    buttonLayoutDefaults: {
        _constructor: "HLayout",
        autoDraw: false,
        width: "100%",
        height: 1,
        align: "right",
        membersMargin: 10
    },
    
    //> @attr imagePicker.okButtonTitle (String : "Ok" : IR)
    // The text displayed in the +link{imagePicker.okButton, Ok button}.
    // @group i18nMessages
    // @visibility tools
    //<
    okButtonTitle: "Ok",    
    //> @attr imagePicker.okButton (AutoChild IButton : null : IR)
    // The button that confirms the selection in this widget and fires the 
    // +link{imagePicker.acceptSelection, acceptSelection} notification.
    // @visibility tools
    //<
    okButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        click : function () {
            this.creator._pickerSelectionChanged()
        }
    },
    
    //> @attr imagePicker.cancelButtonTitle (String : "Cancel" : IR)
    // The text displayed in the +link{imagePicker.cancelButton, Cancel button}.
    // @group i18nMessages
    // @visibility tools
    //<
    cancelButtonTitle: "Cancel",
    //> @attr imagePicker.cancelButton (AutoChild IButton : null : IR)
    // The button that clears the selection in this widget and fires the
    // +link{imagePicker.cancelSelection, cancelSelection} notification.
    // @visibility tools
    //<
    cancelButtonDefaults: {
        _constructor: "IButton",
        autoDraw: false,
        click : function () {
            this.creator._cancelSelection();
        }
    },
    
    initWidget : function () {
        this.Super("initWidget", arguments);
        if (this.thumbnailSize == null) {
            // if the global thumbnailSize is still unset, default it to formItem.iconWidth
            if (isc.ImagePicker.getPrototype().thumbnailSize == null) {
                var iconWidth = isc.FormItem.getPrototype().iconWidth;
                isc.ImagePicker.addProperties({ thumbnailSize: iconWidth });
            }
            this.thumbnailSize = isc.ImagePicker.getPrototype().thumbnailSize;
        }
        this.createCustomChildren();
    },

    createCustomChildren : function () {
        this.addAutoChild("pickerLayout");

        var tileWidth = this.thumbnailWidth || this.thumbnailSize,
            tileHeight = this.thumbnailHeight || this.thumbnailSize
        ;
        var sections = [];
        this.imageLayouts = [];
        if (this.showActionIcons) {
            this.addAutoChild("actionIconsLayout", { tileWidth: tileWidth, tileHeight: tileHeight});
            this.imageLayouts.add(this.actionIconsLayout);
            sections.add({name: "action", title: this.actionIconsTitle, expanded: true, items: [this.actionIconsLayout]});
        } 
        if (this.showHeaderIcons) {
            this.addAutoChild("headerIconsLayout", { tileWidth: tileWidth, tileHeight: tileHeight });
            this.imageLayouts.add(this.headerIconsLayout);
            sections.add({name: "headerIcons", title: this.headerIconsTitle, expanded: true, items: [this.headerIconsLayout]});
        } 
        if (this.showCustomImages) {
            this.addAutoChild("customImagesLayout", { tileWidth: tileWidth, tileHeight: tileHeight });
            this.imageLayouts.add(this.customImagesLayout);
            sections.add({name: "customIcons", title: this.customImagesTitle, expanded: true, items: [this.customImagesLayout]});
        } 
            
        this.addAutoChild("imageStack", { sections: sections });

        var formProps = {};
        formProps.items = [
            { 
                name: "imageBlurb", editorType: "BlurbItem", width: "*", 
                value: this.tipText, wrap: true, styleName: "labelAnchor"
            },
            { name: "imageURL", title: "Image", width: "*", 
                mapValueToDisplay : function (value) {
                    // if the value is a stockIcon, the object returned by getImageProperties() will 
                    // have a "name" attribute - show [name] instead of the actual value
                    if (!value || value == "") return "";
                    if (this.selectedImage) {
                        var imgRecord = this.selectedImage.imageRecord;
                        if (imgRecord) {
                            var result = !imgRecord.name ? imgRecord.src : "[" + imgRecord.name + "]";
                            return result;
                        }
                    }
                    return value;
                },
                getValue : function () {
                    var imgRecord = this.selectedImage && this.selectedImage.imageRecord;
                    if (imgRecord) {
                        return imgRecord.src;
                    }
                    return this.Super("getValue", arguments);
                },
                isStockImage : function () {
                    return this.selectedImage && this.selectedImage.imageRecord;
                },
                clearValueIconDefaults: {
                    // "clear" icon - just an x 
                    text: "&#x2715;",
                    width: 12,
                    inline: true,
                    inlineIconAlign: "right",
                    neverDisable: true,
                    showFocused: false,
                    showOver: false,
                    prompt: "Clear the current value",
                    showIf: "return false;",
                    click : function (form, item, icon) {
                        item.clearValue();
                    }
                },
                init : function () {
                    // set up the clearValue icon, initially hidden
                    this.icons = [isc.addProperties({}, 
                        this.clearValueIconDefaults, this.clearValueIconProperties, 
                        { name: "clearValue" }
                    )];
                    this.Super("init", arguments);
                },
                setValue : function () {
                    var result = this.Super("setValue", arguments);
                    if (this.getValue() != null) this.showIcon("clearValue");
                    else this.hideIcon("clearValue");
                    // Prevent editing "url" when a stockIcon is used. The display
                    // value isn't a URL.
                    this.setCanEdit(!this.selectedImage || !this.selectedImage.imageRecord);
                    return result;
                },
                clearValue : function () {
                    this.hideIcon("clearValue");
                    this.Super("clearValue", arguments);
                    // clear out the imageRecord
                    this.form.creator.clearSelectedImage();
                    this.setCanEdit(true);
                },
                change : function (form, item) {
                    // Any change causes the field to no longer be considered validated
                    delete this._validated;
                },
                editorExit : function (form, item, value) {
                    this.form.creator.validateURL();
                },
                itemHoverHTML : function (item, form) {
                    var imgRecord = item.selectedImage && item.selectedImage.imageRecord;
                    if (!imgRecord) return;
                    var html = isc.Canvas.imgHTML(imgRecord.src) + "<br>" + imgRecord.src;
                    return html;
                }
            }
        ];
        this.addAutoChild("editForm", formProps);
        
        this.okButton = this.createAutoChild("okButton", { title: this.okButtonTitle });
        this.cancelButton = this.createAutoChild("cancelButton", { title: this.cancelButtonTitle });
        this.buttonLayout = this.createAutoChild("buttonLayout", { 
            members: [this.cancelButton, this.okButton]
        });

        this.pickerLayout.addMembers([ 
            this.imageStack, this.editForm, this.buttonLayout
        ]);
    },

    //> @method imagePicker.clearSelectedImage()
    // Clear the selected image and edit field.
    // @visibility tools
    //<
    clearSelectedImage : function () {
        if (this.selectedImage) {
            // clear the last selection
            this.selectedImage.clearSelected();
            this.selectedImage = null;
        }
        // clear the imageRecord
        this.selectedImageRecord = null;
        // update the edit field
        this.updateEditor();
    },

    //> @method imagePicker.selectImage()
    // Apply the passed URL, or the src or url properties defined in the passed properties block,
    // to the picker, updating the URL field and selecting known URLs in the appropriate image 
    // group.
    // @param image (SCImgURL | Record) The URL or image-properties, including src, of the 
    // image to select.
    // @visibility tools
    //<
    selectImage : function (img) {
        if (!this.isDrawn()) {
            // store the requested img so it can be selected after draw
            this._selectImgOnDraw = img;
            // Set the URL in case it doesn't match an existing image
            if (img && img.src) {
                // var item = this.editForm.getItem("imageURL");
                // Use setValues() so original value is recorded
                this.editForm.setValues({ imageURL: img.src });
            }
            return;
        }
        // clear the selected image
        this.clearSelectedImage();

        // bail if nothing passed
        if (img == null) return;

        var image = img;
        // if the param isn't an Img instance, see if it maps to one
        if (!isc.isAn.Img(image)) {
            // find an Img instance for a passed src or imageRecord
            var src = isc.isA.String(image) ? image : image.src || image.scImgURL;
            image = this.findImage(src);
        }
        if (isc.isAn.Img(image)) {
            // select the image that matches the passed src
            this.selectedImage = image;
            // imageRecord is the standard image settings - name, src (SCImgURL), url, width, 
            // height - as returned by Media.getStockIconDS() 
            this.selectedImageRecord = image.imageRecord;
            // style the selected image in the layout
            image.showSelected();
        } else {
            // make a dummy imageRecord - it's a custom icon url, doesn't map to an Img instance
            this.selectedImageRecord = { src: src };
        }
        this.updateEditor();
    },

    _pickerSelectionChanged : function (skipValidation) {
        var _this = this,
            item = this.editForm.getItem("imageURL")
        ;
        // If URL validation is pending or focus is in the URL field, set flag so that
        // after validation this method will be called.
        if (this.isValidatingURL() || item.isFocused()) {
            this._pendingSave = true;
            this.showValidatingPrompt();
            if (!this.isValidatingURL()) {
                this.validateURL();
            }
            return;
        }

        // Allow user to save a URL that cannot be verified. This might happen if the user
        // knows the correct URL but the image is not yet available.
        if (item.hasErrors()) {
            isc.warn("An image couldn't be loaded from the provided URL. Save anyway?", function (value) {
                if (value) {
                    // Save anyway - clear validation errors restart save process
                    item.clearErrors();
                    _this._pickerSelectionChanged(true);
                }
            }, {
                buttons: [isc.Dialog.NO, isc.Dialog.YES],
                autoFocusButton: 1
            });
            return;
        }
        if (!skipValidation) {
            // Make sure that the URL has been validated
            this.showValidatingPrompt();
            // Register state so function will be called after validation if it passes
            _this._pendingSave = true;
            this.validateURL();
            return;
        }

        // Validation is complete and the URL is valid or user wants to save anyway.
        // Any validation errors should be cleared for next use of the form
        this.editForm.clearErrors(true);

        var img = this.selectedImage || {};
        var value = item.getValue();
        if (img.src != value) {
            // custom image url - clear the selected image and create a dummy record for it
            item.selectedImage = null;
            this.selectedImage = null;
            this.selectedImageRecord = { src: value, custom: true };
        } else {
            // selected Img in one of the layouts - return the record stored on the widget
            this.selectedImageRecord = img.imageRecord;
        }
        this._acceptSelection(this.selectedImageRecord);
    },

    //> @method imagePicker.acceptSelection()
    // Notification method fired when the +link{imagePicker.okButton, Ok button} is clicked,
    // and passed the properties of the currently selected image.
    // @param imageRecord (Record) the properties for the currently selected image
    // @visibility tools
    //<
    _acceptSelection : function (imageRecord) {
        // fire the public notification
        if (this.acceptSelection) this.acceptSelection(imageRecord);
    },
    //> @method imagePicker.cancelSelection()
    // Notification method fired when the +link{imagePicker.cancelButton, Cancel button} is 
    // clicked.
    // @visibility tools
    //<
    clearOnCancel: true,
    _cancelSelection : function () {
        // clear the selection
        if (this.clearOnCancel) this.clearSelectedImage();
        // fire the public notification
        if (this.cancelSelection) this.cancelSelection();
    },
    findImage : function (src) {
        // checks each of the imageLayouts for a tile representing the passed src 
        var image = null;
        for (var i=0; i<this.imageLayouts.length; i++) {
            var innerImg = this.imageLayouts[i].findImage(src);
            if (innerImg) {
                image = innerImg;
                break;
            }
        }
        return image;
    },
    updateEditor : function () {
        // update the edit FormItem
        var item = this.editForm.getItem("imageURL");
        item.selectedImage = this.selectedImage;
        item.setValue(this.selectedImageRecord ? this.selectedImageRecord.src : null);
    },

    urlValidationTimeout: 10000,
    urlValidationPrompt: "Validating image URL ${loadingImage}",

    validateURL : function () {
        if (this._validatingURL) {
            // Current validation request may now be out-of-date.
            // Set flag to re-validate once complete
            this._revalidate = true;
            return;
        }

        var _this = this;
        var validationComplete = function (error) {
            var valid = (error == null);
            delete _this._validatingURL;

            if (_this._pendingSave) isc.clearPrompt();

            if (!valid) {
                _this.editForm.setFieldErrors("imageURL",
                    "An image could not be downloaded from the provided URL (" + error + ")",
                    true);
                delete _this._pendingSave;
            } else {
                _this.editForm.clearErrors(true);
                _this.editForm.getItem("imageURL")._validated = true;
                if (!_this.revalidate && _this._pendingSave) {
                    delete _this._pendingSave;
                    _this._pickerSelectionChanged(true);
                    return;
                }
            }
            // If a re-validation is needed, do it now
            if (_this._revalidate) {
                delete _this._revalidate;
                _this.validateURL();
            }
        };

        
        var url = this.editForm.getValue("imageURL");
        if (url && url.contains("dropbox.com") && url.contains("dl=0") && !url.contains("raw=1")) {
            url = url.replace("dl=0","raw=1");
            this.editForm.setValue("imageURL", url);
        }

        if (this.urlNeedsValidating()) {
            this._validatingURL = true;

            isc.RPC.sendRequest({
                actionURL: this.editForm.getValue("imageURL"),
                httpMethod: "GET",
                timeout: this.urlValidationTimeout,
                useSimpleHttp: true,
                // Force http proxy because it is not uncommon to use an https: address
                // which won't automatically proxy. DropBox uses https addresses.
                useHttpProxy: true,
                willHandleError: true,
                callback: function (response, data, request) {
                    var error;
                    if (response.status == isc.RPCResponse.STATUS_TRANSPORT_ERROR) {
                        if (response.httpResponseCode != null) {
                            error = "HTTP error: " + response.httpResponseCode;
                        } else {
                            error = "transport data";
                        }
                    } else if (response.status == isc.RPCResponse.STATUS_UNKNOWN_HOST_ERROR) {
                        error = "unknown host";
                    } else if (response.status == isc.RPCResponse.STATUS_CONNECTION_RESET_ERROR) {
                        error = "connection reset";
                    } else if (response.status == isc.RPCResponse.STATUS_SERVER_TIMEOUT) {
                        error = "request timeout";
                    } else {
                        var contentType = response && response.httpHeaders && response.httpHeaders["content-type"];
                        if (!contentType || !contentType.startsWith("image/")) {
                            error = "image data not returned";
                        }

                        
                    }
                    validationComplete(error);
                }
            });
        } else {
            validationComplete();
        }
    },
    isValidatingURL : function () {
        return this._validatingURL;
    },
    urlNeedsValidating : function () {
        var newURL = this.editForm.getValue("imageURL");
        if (!newURL || newURL.startsWith("data:")) return false;

        var item = this.editForm.getItem("imageURL");

        var isStockImage = item.isStockImage();
        if (isStockImage) return false;

        var validated = item._validated;
        if (validated) return false;

        var oldValues = this.editForm.getOldValues(),
            oldURL = oldValues.imageURL,
            urlChanged = (!oldURL || (oldURL && newURL && newURL.length > 0 && oldURL != newURL))
        ;
        return urlChanged;
    },
    showValidatingPrompt : function () {
        isc.showPrompt(this.urlValidationPrompt);
    }
});

isc.defineClass("ImageLayout", "FlowLayout");
isc.ImageLayout.addProperties({
    width: "100%",
    height: "100%",
    overflow: "auto",
    tileMargin: 5,
    animateTileChange: false,
    autoDraw: false,
    
    // if iconGroup is set, loads the standard set of icons with that groupName
    //iconGroup: "action",
    
    initWidget : function () {
        this.Super("initWidget", arguments);
        this.images = [];
        if (this.iconGroup != null) {
            this.dataSource = isc.Media.getStockIconDS(this.iconGroup);
            this._shouldLoadImages = true;
        }
    },
    show : function () {
        this.Super("show", arguments);
        if (this._shouldLoadImages) {
            this._shouldLoadImages = false;
            this.delayCall("loadImages");
        }
    },
    getImageRecords : function () {
        return this.dataSource ? this.dataSource.cacheData.duplicate() : [];
    },
    loadImages : function ( ) {
        if (!this.dataSource) {
            isc.logWarn("No datasource for widget with ID " + this.getID());
            return;
        }
        // clear out the old array of Img instances
        //this.images.map("destroy");
        this.tiles = [];
        // add Img instances for the records in the DS/repo/whatever getImageRecords() returns
        var images = this.getImageRecords();
        for (var i=0; i<images.length; i++) {
            var record = images[i];
            if (record.width == null) record.width = this.tileWidth || this.tileSize; 
            if (record.height == null) record.height = this.tileHeight || this.tileSize; 
            this.addImageTile(record);
        }
        this.tiles = this.images;
        var onDrawImg = this.creator._selectImgOnDraw;
        if (onDrawImg) {
            var src = isc.isAn.Object(onDrawImg) ? onDrawImg.src : onDrawImg;
            var img = this.findImage(src);
            if (img) {
                this.selectImage(img);
                delete this.creator._selectImgOnDraw;
            }
        }
        this.delayCall("layoutTiles");
    },
    findImage : function (src) {
        if (!this.images) return null;
        return this.images.find("src", src);
    },
    imageTileDefaults: {
        _constructor: "Img",
        autoDraw: false,
        imageType: "center",
        border: "1px solid transparent",
        normalBorder: "1px solid transparent",
        overBorder: "1px solid red",
        selectedBorder: "1px solid green",
        showSelected: false,
        click : function () {
            this.layout.selectImage(this);
        },
        mouseOver : function () {
            this.setBorder(this.overBorder);
        },
        mouseOut : function () {
            this.setBorder(this._selected ? this.selectedBorder : this.normalBorder);
        },
        showSelected : function () {
            this._selected = true;
            this.setBorder(this.selectedBorder);
        },
        clearSelected : function () {
            this._selected = false;
            this.setBorder(this.normalBorder);
        }
    },
    addImageTile : function (record) {
        this.images.add(this.createAutoChild("imageTile", {
            imageRecord: record,
            src: record.src,
            prompt: record.name,
            width: record.width,
            height: record.height,
            imageWidth: record.width,
            imageHeight: record.height,
            layout: this
        }));
    },
    clearSelectedImage : function () {
        if (this.selectedImage) this.selectedImage.clearSelected();
        this.selectedImage = null;
        this.selectedImageRecord = null;
    },
    selectImage : function (image) {
        this.clearSelectedImage();
        if (!image) return false;

        this.selectedImage = image;
        this.selectedImageRecord = image.imageRecord;
        this.selectedImage.showSelected();
        if (this.creator.selectImage) this.creator.selectImage(this.selectedImage);
    }
});


} // end of if (isc.FlowLayout)...

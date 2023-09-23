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
//> @class CanvasItem
// FormItem which renders a Canvas inline in a DynamicForm instance.
// <P>
// CanvasItem is +link{CanvasItem.shouldSaveValue,shouldSaveValue}:false by default, meaning that
// no value from the CanvasItem will be present in +link{dynamicForm.getValues()} and no value will be
// saved when +link{dynamicForm.saveData()} is called.  This is appropriate if the Canvas does
// not participate in editing a value of the form and is embedded in the form for layout or UI
// purposes only (e.g. +link{ButtonItem}, +link{SectionItem}). Note that some built-in CanvasItem
// types override the shouldSaveValue default to true (e.g. +link{MultiComboBoxItem}, +link{RichTextItem}).
// <P>
// If you set +link{FormItem.shouldSaveValue,shouldSaveValue}:true, a 
// +link{CanvasItem.showValue(),showValue} event will be raised to provide a value that your
// item should display.  Handle this event by calling methods on the Canvas you've created
// to cause the value to be displayed.
// <P>
// The +link{CanvasItem.showValue,showValue} event will be triggered in various situations where
// the form receives data, including a call to +link{dynamicForm.setValues()},
// +link{dynamicForm.editRecord()}, or if +link{dynamicForm.fetchData()} is called and a Record
// is returned.  Bear in mind that the <code>showValue</code> event can be called when the form
// and your item have not yet been drawn; in this case, store the value for later display.
// <P>
// To provide a value to the form, call +link{CanvasItem.storeValue()} whenever the user changes
// the value in your Canvas.  Generally, if storeValue() is called then
// +link{CanvasItem.shouldSaveValue,shouldSaveValue} should be overridden to true.  Note that
// the form <b>will not</b> call getValue() in order to discover your item's value, so there is
// no purpose in overriding this method; instead, call storeValue() to proactively inform the
// form about changes to the value.  This approach is necessary in order to enable change events.
// <P>
// If you cannot easily detect changes to values in your Canvas, a workaround is to call
// <code>storeValue</code> right before the form saves.
//
// @inheritsFrom FormItem
// @treeLocation Client Reference/Forms/Form Items
// @visibility external
//<
isc.ClassFactory.defineClass("CanvasItem", "FormItem");
isc.CanvasItem.addProperties({
    width:"*", height:null,

    
    
    //> @attr canvasItem.height (int | String : null : IRW)
    // Height of the Canvas.  Can be either a number indicating a fixed height in pixels, a
    // percentage indicating a percentage of the overall form's height, or "*" indicating take
    // whatever remaining space is available. See the +link{group:formLayout} overview for details.
    // <p>
    // Height may also be explicitly specified on the +link{canvasItem.canvas}. In this
    // any <code>canvasItem.height</code> will be ignored in favor of the value applied 
    // to the canvas directly. In either case, percentage values will be resolved using
    // standard formItem sizing rules as described in +link{group:formLayout}
    // @visibility external
    //<
    
    
    //> @attr canvasItem.multiple (Boolean : null : IR)
    // Whether this CanvasItem is intended to hold multiple values.
    // <smartgwt>
    // <P>
    // This attribute can affect the return type of getValue(). If this CanvasItem is storing
    // multiple values, then the return type of getValue() is <code>JavaScriptObject</code>
    // (a JavaScript array object) if multiple is null or false. However, if multiple is true,
    // then the return type is either <code>List</code> or <code>RecordList</code>.
    // </smartgwt>
    // @visibility external
    //<

    //> @attr canvasItem.shouldSaveValue (Boolean : false : IR)
    // Should this item's value be saved in the form's values and hence returned from
    // +link{DynamicForm.getValues()}?
    // <P>
    // Note that by default, <code>shouldSaveValue</code> is false for CanvasItems,
    // meaning that no value from the CanvasItem will be present in +link{DynamicForm.getValues()}
    // and no value for the CanvasItem will be saved when +link{DynamicForm.saveData()} is called.
    // See the +link{CanvasItem} class overview for a discussion of values handling in
    // CanvasItems.
    // @visibility external
    //<
    shouldSaveValue:false,

    // override _setElementValue() to call showValue()
    _setElementValue : function (newValue, dataValue) {
        var undef;
        if (dataValue === undef) {  
            dataValue = this._value;
        }
        
        this.showValue(newValue, dataValue, this.form, this);
    },  
    
    // Have showvalue no-op by default -- documented in registerStringMethods
    showValue : function (displayValue, dataValue) {
    
    },
    
    _showValueAfterDraw : function (redraw) {
        // Skip calling "_showValue", which falls through to setElementValue() -> showValue()
        // after redraw
        
        if (redraw) {
            //this.logWarn("Skipping 'showValue()' call on form redraw");
            return;
        }
        return this.Super("_showValueAfterDraw", arguments);
    },
    
    //> @method canvasItem.storeValue()
    // @include formItem.storeValue()
	// @visibility external
	//<
	// Implemented at the FormItem level

    // ------------------------
    // Methods applied directly to this.canvas (fired in the scope of the canvas, not the
    // canvasItem-  use this.canvasItem to point back to the item).
    
    // set up observation of resizing
    
    _canvas_resized : function (deltaX, deltaY, reason) {
        this.Super("resized", arguments);

        // CanvasResized will cause a form redraw - only call this if we're not drag
        // resizing to avoid redrawing repeatedly during drag resize interactions.
        
        if (!this.dragResizing() && this.canvasItem && (this.canvasItem.canvas == this)) {
            this.canvasItem.canvasResized(deltaX, deltaY, reason);
        }
    },
    _canvas_dragResized : function () {
        this.canvasItem.canvasResized(1,1); // HACK: 
        return this.Super("dragResized", arguments);
    },
    
    //> @attr canvasItem.canvas (AutoChild Canvas : null : [IRW])
    //
    // The canvas that will be displayed inside this item.  You can pass an instance you've 
    // already created, or its global ID as a String. <smartclient>You can also implement 
    // +link{CanvasItem.createCanvas()} to dynamically create the canvas when the FormItem
    // is initialized.</smartclient>
    // <P><smartclient>
    // If <code>canvas</code> and <code>createCanvas()</code> are unspecified, the 
    // canvas for this item will be auto-created using the overrideable defaults:
    // +link{attr:CanvasItem.canvasProperties} and +link{attr:CanvasItem.canvasConstructor}
    // </smartclient><smartgwt>
    // If a <code>canvas</code> hasn't been specified via +link{CanvasItem.setCanvas()},
    // the canvas for this item will be auto-created as configured by the methods
    // {@link com.smartgwt.client.widgets.form.fields.FormItem#setAutoChildProperties 
    // setAutoChildProperties()} and 
    // {@link com.smartgwt.client.widgets.form.fields.FormItem#setAutoChildConstructor
    // setAutoChildConstructor()}.</smartgwt>
    // <P>
    // Note that subclasses of <code>CanvasItem</code> may use a different AutoChild name than
    // just "canvas".  For example, +link{SliderItem} uses "slider", and in that case, you need
    // to use the specific APIs provided by the subclass.
    // <P>
    // Note that +link{canvas.canvasItem} will be set on the canvas to point back to this
    // item.
    // @visibility external
    // @see group:autoChildUsage
	//<
	
	//> @attr canvas.canvasItem (CanvasItem : null : R)
	// If this canvas is being displayed in a +link{CanvasItem}, this property will be set
	// to point at the item. Otherwise this property will be null.
	// @visibility external
	//<

  	//> @attr	canvasItem.canvasConstructor		(String : "Canvas" : [IRW])
    //
    // If +link{canvasItem.canvas, this.canvas} is not specified as a canvas instance at init
    // time, a canvas will be created instead. This property denotes the class of that widget
    // (Should be set to the name of a subclass of Canvas).
    //
    //  @visibility external
	//<
    
    
    
    //> @attr	canvasItem.canvasDefaults		(Object : {} : [IRW])
    //
    // Default properties for the canvas if this.canvas is not already a canvas instance.
    //
    //  @visibility external
	//<
    
    //> @attr	canvasItem.canvasProperties		(Object : {} : [IRW])
    //
    // Properties to apply to this canvas on creation if this.canvas is not already a canvas 
    // instance.
    //
    //  @visibility external
	//<
    

    //> @attr canvasItem.autoDestroy (Boolean : false : [IRWA])
    // Should this item's +link{canvasItem.canvas,canvas} be automatically destroyed when the item 
    // is destroyed? Form items are destroyed automatically when a call to
    // +link{DynamicForm.setItems()} removes them from their parent form, or if their
    // parent form is destroyed. This property governs whether, when this occurs, 
    // the item's canvas should also be +link{Canvas.destroy(),destroyed}.
    // <P>
    // This property has no effect for canvases automatically created via the "autoChild" pattern, 
    // using +link{canvasProperties}, +link{canvasDefaults} etc. CanvasItems which create their
    // canvas in this way will always destroy the canvas when the item is destroyed or on an
    // explicit +link{setCanvas()} call, regardless of this property's value.
    // <P>
    // Setting this property to true
    // is typically appropriate for cases where a custom CanvasItem automatically creates
    // its canvas as part of its initialization flow, and the canvas will not be re-used outside
    // the item.<br>
    // Note that once a canvas has been destroyed it can not be re-used elsewhere within
    // an application.
    //
    // @visibility external
    //<
    autoDestroy: false

    //showTitle:false
    
    //> @attr CanvasItem.overflow (Overflow : null : IR)
    // CanvasItems support specifying overflow for the Canvas directly on the item.
    // @visibility external
    //<
});
isc.CanvasItem.addMethods({
    init : function () {
        this.Super("init", arguments);
        this._createCanvas(this.form, this);
        this.canvasInitialized = true;
    },
        
    // override _canFocus -- if our canvas is focusable, we're focusable
    _canFocus : function () {
        // If the developer explicitly marks the item as canFocus true, assume they know what
        // they're doing.
        if (this.canFocus == true) return this.canFocus;
        var canvas = this.canvas;
        if (canvas && canvas._canFocus) return canvas._canFocus();
        return false;
    },

    // overridden so that we pick up the <span> rather than the <td> from the DynamicForm table
    getOuterElement : function (a, b, c) {
        var element = this._getHTMLPartHandle("spacerParent");
        if (element && element.firstChild) element = element.firstChild;
        return element ? element : this.invokeSuper(isc.CanvasItem, "getOuterElement", a, b, c);
    },

    // _createCanvas    Method to ensure that the canvas for this item has been instantiated
    // with appropriate properties and stored as this.canvas
    // Note this does not add the canvas to the containerWidget as a child - that's handled
    // on draw / redraw
    
    _createCanvas : function () {
        // CanvasItem.canvas
        // - can be defined as a live canvas instance
        // - can be defined as a properties block to turn into a live canvas
        // If this.createCanvas() is specified, this.canvas is dynamically set to the
        // result of calling that method
        // 
        // If this.canvas is still unspecified we'll use the autoChild pattern
        // (canvasConstructor, canvasDefaults, canvasProperties)
        //
        // Undocumented: The autoChild subsystem also supports dynamically getting defaults via
        // getDynamicDefaults() which would allow dynamic customization of the canvas autoChild
        // when it's auto-created.
        if (this.createCanvas != null) {
            var canvas = this.canvas;
            this.canvas = this.fireCallback("createCanvas", "form,item", arguments);
            // if this.createCanvas existed but returned nothing, hang onto our original
            // canvas object
            // It could just modify it in place and we should allow that
            if (this.canvas == null) this.canvas = canvas;
        }
        
        //>DEBUG
        if (!isc.isAn.Object(this.canvas) && !this.canvasProperties && !window[this.canvas]) {
            this.logInfo("CanvasItem: " + 
                        (this.getFieldName() ? this.getFieldName() : this.getID()) + 
                        " defined with no canvas property - creating a default " +
                        "canvas for this item.");
        }
        //<DEBUG
        
        // If the supplied canvas property is a string containing the ID of a valid Canvas 
        // object, use that Canvas object 
        if (!isc.isAn.Object(this.canvas) && isc.isA.Canvas(window[this.canvas])) {
            this.canvas = window[this.canvas]
        }

        var canvasProps = {
            //hideUsingDisplayNone:true,

            // don't redraw when the form redraws - if the developer wishes to redraw this canvas
            // they will have to call redraw() on this form item, or on the Canvas directly.
            _redrawWithParent: false,
            
            // Don't auto-destroy with parent.
            // We can render our canvas as a child of some
            // arbitrary container widget, and we don't want it to be destroyed automatically
            // when that gets destroyed if our form / formItem isn't explicitly destroyed.
            // We use this pattern in Grid editing / filterEditor stuff: If the grid-body 
            // in which the edit item was embedded is destroyed and rebuilt, we use the
            // same FormItem in the new version of the grid body, so we just reparent the
            // canvas rather than destroying and rebuilding.
            // If the form is actually destroyed we should get a destroy call on the item
            // which will clean up the canvases of all CanvasItems.
            destroyWithParent:false
        };
        canvasProps.resized = this._canvas_resized;
        canvasProps.dragResized = this._canvas_dragResized;
        
        // Have standard events on the canvas fall back through to us.
        
        
        canvasProps.handleClick = function () {
            var rv = this.Super("handleClick", arguments);
            // if this is a StatefulCanvas, rely on the 'handleActivate' path to 
            // fire the item level click handler.
            if (!isc.isA.StatefulCanvas(this) && this.canvasItem) {
                rv = this.canvasItem.handleClick() && rv;
            }
            return rv;
        }
        // handleActivate will only be called for StatefulCanvas and subclasses
        canvasProps.handleActivate = function () {
            var rv = this.Super("handleActivate", arguments);
            if (this.canvasItem) rv = this.canvasItem.handleClick() && rv;
            return rv;
        }
        
        canvasProps.handleDoubleClick = function () {
            var rv = this.Super("handleDoubleClick", arguments);
            if (this.canvasItem) rv = this.canvasItem.handleDoubleClick() && rv;
            return rv;
        }
        
        canvasProps.handleKeyPress = function () {        
            var rv = this.Super("handleKeyPress", arguments);
            
            if (this.canvasItem) {
                // fire item.keyPress / form.itemKeyPress if we get a keyPress on the 
                // target canvas (or in fact a sub-canvas thereof).
                var itemRV = this.canvasItem._fireKeyPressHandlers(
                        this.canvasItem,
                        this.canvasItem.form,
                        isc.EH.getKey(),
                        isc.EH.getKeyEventCharacterValue()
                );
                if (itemRV == false) rv = false;
            }
            return rv;
        }

        canvasProps.handleKeyDown = function (event,eventInfo) {
            var rv = this.Super("handleKeyDown", arguments);
            if (this.canvasItem) {
                var itemRV = this.canvasItem.handleKeyDown(event, eventInfo);
                if (itemRV == false) rv = false;
            }
            return rv;
        }
        canvasProps.handleKeyUp = function (event,eventInfo) {
            var rv;
            if (this.keyUp != null) {
                rv = this.keyUp(event, eventInfo);
            }
            if (this.canvasItem) {
                var itemRV = this.canvasItem.handleKeyUp(event, eventInfo);
                if (itemRV == false) rv = false;
            }
            return rv;
        }
        
        // if this is a DynamicForm, override handleItemKeyPress as well
        // as handleKeyPress, since we won't receive a standard 'handleKeyPress' 
        // notification for any keys the item doesn't bubble 
        // (such as character keys and Tab)
        
        canvasProps.handleItemKeyPress = function (item, keyName, characterValue) {
            var rv = this.Super("handleKeyPress", arguments);
            if (this.canvasItem) {
                // fire item.keyPress / form.itemKeyPress if we get a keyPress on the 
                // target canvas (or in fact a sub-canvas thereof).
                var itemRV = this.canvasItem._fireKeyPressHandlers(
                        this.canvasItem,
                        this.canvasItem.form,
                        isc.EH.getKey(),
                        isc.EH.getKeyEventCharacterValue()
                );
                if (itemRV == false) rv = false;
            }
            return rv;
        }
        
        // pass our datasource, if any to the CanvasItem
        if (this.dataSource) canvasProps.dataSource = this.dataSource;
        // pass on our prompt (if any) to the CanvasItem
        if (this.prompt && this.applyPromptToCanvas) canvasProps.prompt = this.prompt;
        // pass on our overflow (is specified) to the canvas.
        if (this.overflow != null) canvasProps.overflow = this.overflow;

        // We'll set the tabIndex on the canvas when we write out our innerHTML.
        
                
        // pass on our accessKey if appropriate
        if (this.accessKey != null) canvasProps.accessKey = this.accessKey;
        
        // pass on 'showFocused'
        if (this.showFocused != null) canvasProps.showFocused = this.showFocused;
        if (this.showFocusedAsOver != null) canvasProps.showFocusedAsOver = this.showFocusedAsOver;
        
        // if hoverFocusKey is defined on the item (even as null), pass it to the child canvas
        if (this.hasOwnProperty("hoverFocusKey")) canvasProps.hoverFocusKey = this.hoverFocusKey;
        // otherwise, pass it from the parent form
        else canvasProps.hoverFocusKey = this.form && this.form.hoverFocusKey;

        // if hoverPersist is defined on the item, pass it to the child canvas
        if (this.hoverPersist != null) canvasProps.hoverPersist = this.hoverPersist;
        // otherwise, pass it from the parent form
        else canvasProps.hoverPersist = this.form && this.form.hoverPersist;

        if (isc.isA.String(this.canvas) && window[this.canvas]) this.canvas = window[this.canvas];

        // if the canvas hasn't been instantiated for us, use the autoChild method to create it
        // otherwise we have to do a bunch of manual patching to achieve the same effect.
        if (!isc.isA.Canvas(this.canvas)) {
            // pick up any properties specified directly on the 'this.canvas' object
            isc.addProperties(canvasProps, this.canvas, { canvasItem: this });
            if (canvasProps.ID != null) canvasProps.ID = null;
            // since we're auto-creating it's appropriate to autoDestroy
            this.autoDestroy = true;
            
            this.canvas = this.createAutoChild("canvas", canvasProps, isc.Canvas);
            
        } else {
            
            var originalProps = {};
            for (var prop in canvasProps) {
                originalProps[prop] = this.canvas[prop];
            }
            this.canvas._originalProps = originalProps

            // apply dynamic properties to existing canvas
            // (Call setter methods wherever necessary).
            if (this.applyPromptToCanvas) this.canvas.setPrompt(this.prompt);
            this.canvas.setAccessKey(this.accessKey);

            isc.addProperties(this.canvas, canvasProps, { canvasItem: this });
            if (canvasProps.dataSource) this.canvas.bindToDataSource();
        }

        // Apply the effects of the default behaviors of canEditChanged() and readOnlyDisplayChanged().
        if (isc.isA.DynamicForm(this.canvas)) {
            this.canvas.setReadOnlyDisplay(this.getReadOnlyDisplay());
            this.canvas.setCanEdit(this.getCanEdit());
        }
        this.canvas.setDisabled(this.shouldDisableCanvas());

        // We'll handle percent sizing specified on the embedded Canvas directly
        if (this.canvas != null) {
            this.canvas._initialPercentBox = this.canvas.percentBox;
            this.canvas.percentBox = "custom";
        }
        
        // updateCanvasTabPosition() ensures the canvas is placed in the correct spot by
        // the TabIndexManager
        this.updateCanvasTabPosition();

        // If we're added to a containerWidget rather than the form, and a clickMask is showing
        // we may need to unmask explicitly
        
        if (this.containerWidget != this.form) {
            if (isc.EH.clickMaskUp()) {
                var CMIDs = isc.EH.getAllClickMaskIDs();
                for (var i = CMIDs.length -1; i >= 0; i--) {
                    var parentMasked = isc.EH.targetIsMasked(this.containerWidget, CMIDs[i]);
                    if (!parentMasked) {
                        isc.EH.addUnmaskedTarget(this.canvas, CMIDs[i]);
                        // We're iterating down from the top - once a widget is over one mask it's also
                        // over any masks below that one. Therefore we don't need to keep iterating 
                        // down to the bottom adding unmasked targets.
                        break;
                    }
                }
            }
        }
        if (this.canvas) {
            this.observe(this.canvas, "_focusChanged", "observer.canvasFocusChanged()");
            this.observe(this.canvas, "_childFocusChanged", "observer.canvasChildFocusChanged()");
        }
        
        
        if (isc.isA.DynamicForm(this.canvas)) {
            this.observe(this.canvas, "setFocusItem", "observer.nestedFormSetFocusItem()");
        }
    },
    
    //> @method canvasItem.updateCanvasTabPosition()
    // This method will place an entry for the +link{canvasItem.canvas} under this item in the 
    // +link{TabIndexManager}. This ensures the user can tab into the canvas (and its
    // descendants) in the expected position within this item's DynamicForm.
    // <P>
    // See also +link{dynamicForm.updateChildTabPositions()}.
    // 
    // @visibility external
    //<
    // Have the canvas sit underneath us in the page's tab index
    // (Before any icons)
    updateCanvasTabPosition : function () {
        var canvas = this.canvas;
        if (canvas != null) {
            // opt out of tab index mgmt on draw,
            // or by DynamicForm or other containerWidget(s)
            canvas.updateTabPositionOnDraw = false;
            canvas.updateTabPositionOnReparent = false;

            isc.TabIndexManager.moveTarget(canvas.ID,  this.ID, 0);
            // If we have a global tabIndex specified, copy it onto the canvas.
            // The canvas will still be in the TabIndexManager tree but we'll basically
            // ignore the value specified there in favor of this
            if (this.globalTabIndex != null) {
                this.canvas.setTabIndex(this.globalTabIndex);
            }
        }
    },
    getPickerIconTabPosition : function () {
        return this.canvas ? 1 : 0;
    },
    getIconTabPosition : function (icon) {
        var offset = this.canvas ? 1 : 0;
        return this.Super("getIconTabPosition", arguments) + offset;
    },
   
    // Helper for __focusInNextTabElement() - what is the TabIndexManager entry ID
    // for the current focus target?    
    // Overridden to handle focus being on a child of our canvas
    
    _getCurrentFocusTargetID : function () {
        if (isc.isA.Canvas(this.canvas) && isc.EH._focusCanvas != null &&
            this.canvas.contains(isc.EH._focusCanvas, true)) 
        {
            // If focus is in a nested form item, we want to use the ID associated with
            // the item (or sub-element thereof) instead of just returning the ID of
            // the form - this ensures focus will move through the form's elements
            if (isc.isA.DynamicForm(isc.EH._focusCanvas)) {
                return isc.EH._focusCanvas.getFocusSubItem()._getCurrentFocusTargetID();
            }
        
            return isc.EH._focusCanvas.getID();
        }
        
        return this.Super("_getCurrentFocusTargetID", arguments);
    },        
    
    //> @method canvasItem.setCanvas()
    // Setter to update the +link{canvasItem.canvas} at runtime
    // @param canvas (Canvas) New canvas to display.
    // @visibility external
    //<
    setCanvas : function (canvas) {
        if (isc.isA.Canvas(this.canvas)) {
            if (this.canvas != canvas) {
                // "destroy" the old canvas.
                // if this.autoDestroy is true, this will truly destroy it
                // otherwise it simply deparents it and cleans up various props we
                // scribble onto it connecting it with the CanvasItem.
                this._destroyCanvas();
            // nothing to do if we're passed in our existing canvas
            } else {
                return;
            }
        }
        if (canvas) this.canvas = canvas;
        // No need to call _createCanvas if we haven't yet completed init (occurs automatically at the
        // end of init())
        if (this.canvasInitialized) {
            this._createCanvas();
            
            if (this.containerWidget && this.containerWidget.isDrawn() && this.isDrawn()) {
                var containerWidget = this.containerWidget;
            
                // Add the canvas as a child
                // Normally this would be handled by our drawing() notification, but if we're already drawn
                // we won't get that notification
                
                var canvasParentElement = canvas ? canvas.getParentCanvas() : null;
                if (canvas && canvasParentElement !== containerWidget) {
                    if (canvasParentElement != null && this.isObserving(canvasParentElement, "_visibilityChanged")) {
                        this.ignore(canvasParentElement, "_visibilityChanged");
                    }
                    containerWidget.addChild(canvas);
                }
                
                // redraw the containerWidget to size and position the canvas
                this.containerWidget.markForRedraw();
            }
        }
    },
    
    
    /*
    // Ensure redraw on this item redraws the Canvas.
    redraw : function (suppressCanvasRedraw) {
        // redraw the canvas before redrawing our innerHTML - allows us to calculate sizes
        // accurately, if they change.
        if (!suppressCanvasRedraw && this.canvas.isDrawn()) {
            this.canvas.redraw("canvasItem.redraw");
        }
        this.Super("redraw", arguments);
    },
    */


    //> @method canvasItem.canEditChanged()
    // Notification method called when the +link{FormItem.canEdit,canEdit} setting is modified.
    // Developers may make use of this to toggle between an editable and a read-only appearance
    // of the +link{CanvasItem.canvas,canvas}.
    // <p>
    // The default behavior is:
    // <ul>
    // <li>If <code>canvas</code> is a +link{DynamicForm}, the form's +link{DynamicForm.canEdit}
    // setting is set to <code>canEdit</code>.
    // <li>+link{shouldDisableCanvas()} is called to determine if the <code>canvas</code> should
    // be disabled.
    // </ul>
    // <p>
    // Standard <code>CanvasItem</code>-based form items may customize the default behavior.
    // For example, a +link{MultiComboBoxItem} will hide its +link{MultiComboBoxItem.comboForm,comboForm}
    // if the +link{FormItem.readOnlyDisplay,readOnlyDisplay} is
    // <smartclient>"readOnly" or "static"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.ReadOnlyDisplayAppearance#READONLY} or
    // {@link com.smartgwt.client.types.ReadOnlyDisplayAppearance#STATIC}</smartgwt>
    // and also disable the buttons when made read-only.
    // @return (boolean) <code>false</code> to cancel the default behavior.
    // @include FormItem.canEditChanged()
    // @see readOnlyDisplayChanged()
    // @visibility external
    //<
    _canEditChanged : function (canEdit, willRedraw) {
        var canvas = this.canvas;
        if ((this.canEditChanged == null || this.canEditChanged(canEdit) != false) &&
            canvas != null)
        {
            if (isc.isA.DynamicForm(canvas)) {
                canvas.setCanEdit(canEdit);
            }
            canvas.setDisabled(this.shouldDisableCanvas());
        }
    },

    //> @method canvasItem.readOnlyDisplayChanged()
    // Notification method called when the +link{FormItem.readOnlyDisplay,readOnlyDisplay} setting
    // is modified. Developers may make use of this to toggle between an editable and a read-only
    // appearance of the +link{CanvasItem.canvas,canvas}.
    // <p>
    // The default behavior is: when the <code>canvas</code> is a +link{DynamicForm}, the form's
    // +link{DynamicForm.readOnlyDisplay} setting is set to <code>appearance</code>.
    // <p>
    // Standard <code>CanvasItem</code>-based form items may customize the default behavior.
    // @return (boolean) <code>false</code> to cancel the default behavior.
    // @include FormItem.readOnlyDisplayChanged()
    // @see canEditChanged()
    // @visibility external
    //<
    _readOnlyDisplayChanged : function (appearance, willRedraw) {
        var canvas = this.canvas;
        if ((this.readOnlyDisplayChanged == null || this.readOnlyDisplayChanged(appearance) != false) &&
            canvas != null)
        {
            if (isc.isA.DynamicForm(canvas)) {
                canvas.setReadOnlyDisplay(appearance);
            }
        }
    },
    
    
    drawing : function (itemVisibilityChanged) {
        var canvas = this.canvas,
            containerWidget = this.containerWidget;
        
        
        if (canvas && canvas.destroyed) {
            
            this._createCanvas();
        }
        canvas = this.canvas;

        var canvasParentElement = canvas ? canvas.getParentCanvas() : null;

        if (canvas && canvasParentElement !== containerWidget) {
            
            if (canvasParentElement != null && this.isObserving(canvasParentElement, "_visibilityChanged")) {
                this.ignore(canvasParentElement, "_visibilityChanged");
            }
            containerWidget.addChild(canvas);
        }
        
        this.Super("drawing", arguments);
    },
    
    // ItemVisibiltyChanged() - notifiation fired when hide() or show() or a re-eval of
    // showIf() changes the items 'visible' status.
    // Use this to ensure we deparent a newly-hidden item's canvas from the containerWidget
    // in the case where the widget is undrawn (so we won't see a 'cleared()' notification).
    
    itemVisibilityChanged : function (visible) {
        if (!visible && this.canvas &&
            this.containerWidget && !this.containerWidget.isDrawn() &&
            this.canvas.getParentCanvas() == this.containerWidget) 
        {
            this.canvas.deparent();
        }
    },

    // clear the pointer on this item's canvas back to this item on destroy()
    destroy : function () {
        this._destroyCanvas();
        return this.Super("destroy", arguments);
    },

    _destroyCanvas : function () {
        if (this.canvas) {
            delete this.canvas.canvasItem;
            var parentElement = this.canvas.getParentCanvas();
            
            delete this.canvas.parentElement;
            if (parentElement == this.containerWidget) {
                if (this.isObserving(this.containerWidget, "_visibilityChanged")) {
                    this.ignore(this.containerWidget, "_visibilityChanged");
                }
                this.containerWidget.removeChild(this.canvas);
            }
            if (this.autoDestroy) {
                this.canvas.destroy(true);
            } else {
                
                isc._allowDeleteFuncProperty = true;

                // reset the various odd overrides to resized etc that won't apply without
                // a canvasItem
                isc.addProperties(this.canvas, this.canvas._originalProps);
                delete this.canvas._originalProps;

                delete isc._allowDeleteFuncProperty;
                
                // clear and pull out of the containerWidget.
                if (this.canvas.isDrawn()) {
                    this.canvas.clear();
                }
                this.canvas.deparent();
                
                // the canvas's tab-position is registered as being under ours - 
                // reset this so it doesn't get removed from the TIM tree when we are
                isc.TabIndexManager.moveTarget(this.canvas.getID());
                
                // ignore the focus methods we observed at init
                this.ignore(this.canvas, "_focusChanged");
                if (isc.isA.DynamicForm(this.canvas)) {
                    this.ignore(this.canvas, "setFocusItem");
                }
                
                // reset the "percentBox" flag.                
                this.canvas.percentBox = this.canvas._initialPercentBox;
                delete this.canvas._initialPercentBox;

                // and set this.canvas to null so this code doesn't run again later
                this.canvas = null;
            }
        }
    },

    placeCanvas : function (delayed) {
        var canvas = this.canvas;
        if (!canvas) return;

        
        if (canvas.destroyed) return;

        // If this.visible is false, our canvas should never be drawn into our containerWidget, so
        // nothing to do here.
        if (this.visible == false) {
            return;
        }
 
        if (this.form && !this.form.isDrawn() && this.form.position == isc.Canvas.RELATIVE) {
            
            //this.logWarn("hiding Canvas during initial relative draw");
            canvas.hide();
            return;
        }

        // place the Canvas over the cell for the item

        // figure out the spacer's coordinates within the form
        var containerWidget = this.containerWidget;

        
        
        if (!containerWidget.isVisible()) {
            if (!this.isObserving(containerWidget, "_visibilityChanged")) {
                this.observe(containerWidget, "_visibilityChanged", this._containerWidgetVisibilityChanged);
            }
            return;
        }

        var containerHandle = containerWidget.getHandle(),
            spacerParent = isc.Element.get(this.getID() + "_spacerParent");

        
        if (isc.Browser.isIE && !isc.Browser.isStrict && isc.Browser.version >= 9) {
            spacerParent = spacerParent && spacerParent.firstChild;
        }

        // Pass the "dontRound" param to Element.getOffsets(). If getBoundingClientRect returns a fractional
        // coordinate we want to round it rather than truncate/floor it.
        
        var spacerOffsets = spacerParent ? 
                                isc.Element.getOffsets(spacerParent, containerHandle, null, null, null, true) : 
                                {left:0,top:0},
            left = Math.round(spacerOffsets[isc.Canvas.LEFT]) + containerWidget.getScrollLeft(),
            top = Math.round(spacerOffsets[isc.Canvas.TOP]) + containerWidget.getScrollTop();

        
        //>SingleDiv
        if (!containerWidget._drewClipDiv) {
            var borderSizes = containerWidget._calculateBorderSize();
            left -= borderSizes.left;
            top -= borderSizes.top;
        }
        //<SingleDiv

        // this.logWarn("placing Canvas at: " + [left, top]);

        // place the Canvas on top of that cell
        var canvasParentElement = canvas.getParentCanvas();
        
        if (canvasParentElement !== containerWidget) {
            
            if (canvasParentElement != null && this.isObserving(canvasParentElement, "_visibilityChanged")) {
                this.ignore(canvasParentElement, "_visibilityChanged");
            }
            containerWidget.addChild(canvas);
        }
        canvas.moveTo(left, top);
        // If we're abs-pos, ensure the Canvas has a zIndex higher than our absDiv.
        if (this._absPos()) {
            var absDiv = this.getAbsDiv(true);
            if (absDiv && absDiv.style) {
                var zIndex = parseInt(absDiv.style.zIndex);
                if (canvas.getZIndex() < zIndex) {
                    canvas.setZIndex(zIndex+1);
                }
            }
        }
        if (canvas.visibility == isc.Canvas.HIDDEN) {
            canvas.show();
        }
        if (!canvas.isDrawn()) {
            canvas.draw();
        }

        
        if (this.form != containerWidget) {
	        var EH = this.ns.EH;
	        if (EH.clickMaskUp()) {
	
	            var CMIDs = EH.getAllClickMaskIDs();
	            for (var i = CMIDs.length -1; i >= 0; i--) {
	                var formMasked = EH.targetIsMasked(this.form, CMIDs[i]);
	                if (!formMasked) {
	                    EH.addUnmaskedTarget(canvas, CMIDs[i]);
	                    // We're iterating down from the top - once a widget is over one mask it's also
	                    // over any masks below that one. Therefore we don't need to keep iterating
	                    // down to the bottom adding unmasked targets.
	                    break;
	                }
	            }
	        }
        }

        
        if (!delayed && isc.Browser.isMac && isc.Browser.isMoz && left == 0 && top == 0) {
            isc.Timer.setTimeout({target:this, methodName:"_delayedPlaceCanvas"}, 0);
        }
    },

    _delayedPlaceCanvas : function () {
        this.placeCanvas(true);
    },

    _containerWidgetVisibilityChanged : function () {
    
        
        if (this.containerWidget.isVisible()) this.placeCanvas();
    },

    cleared : function (itemVisibilityChanged) {
        this.Super("cleared", arguments);
        // when a canvasItem gets cleared, ensure the canvas is cleared too
        if (this.canvas && this.canvas.isDrawn()) {
            this.canvas.clear();

            // If we are simply hiding the item, remove as a child, so a clear/draw cycle
            // on the form doesn't cause it to redraw.
            // If the form as a whole is being cleared, no need to do this.
            
            if (itemVisibilityChanged) {
                if (this.isObserving(this.containerWidget, "_visibilityChanged")) {
                    this.ignore(this.containerWidget, "_visibilityChanged");
                }

                this.containerWidget.removeChild(this.canvas);
                // Set the one-time flag to reset handle size on adjust overflow and
                // mark for adjust overflow
                this.containerWidget._resetHandleOnAdjustOverflow = true;
                this.containerWidget._markForAdjustOverflow("CanvasItem canvas cleared");
            }
        }
    },

    // ensure the canvas floats in the right place if the item is moved
    moved : function () {
        
        if (this.isDrawn() || (this.containerWidget != null && this.containerWidget.isDrawn())) {
            this.placeCanvas();
        }
    },

    // Sizing
    // ---------------------------------------------------------------------------------------
    

    checkCanvasOverflow : function () {
        return this.sizeCanvas(true);
    },
    
    // Historically we sized the canvas to fit the entire cell (using getInnerWidth/height).
    // This is actually not what we want and has been reported as a bug (for example here
    // http://forums.smartclient.com/showpost.php?p=96220&postcount=7)
    // We now use getTextBoxWidth() / height which sizes in a manner consistent with other
    // form items.
    // Retain an undocumented flag to use the old behavior as a hedge against backcompat
    // issues going forward
    sizeCanvasAsTextBox:true,
    _sizeTextBoxAsContentBox : function () {
        return false;
    },

    shouldApplyHeightToTextBox : function () {
        if (this.sizeCanvasAsTextBox) return true;
        return this.Super("shouldApplyHeightToTextBox", arguments);
    },

    sizeCanvas : function (firstResizePass) {
        var canvas = this.canvas;
        if (!canvas) return;

        // if we can't overflow in the height direction, we don't need to do anything on the
        // first sizing pass
        if (firstResizePass && 
            !(canvas.overflow == isc.Canvas.VISIBLE || canvas.overflow == isc.Canvas.CLIP_H))
        {
            this.logDebug("ignoring first pass, can't overflow", "canvasItemSizing");
            return;
        }

        // get the sizes specified by layout policy
        var value = this.getValue(),
            policyWidth = this.sizeCanvasAsTextBox ? this.getTextBoxWidth(value)
                                                    : this.getInnerWidth(),
            policyHeight = this.sizeCanvasAsTextBox ? this.getTextBoxHeight(value)
                                                    : this.getInnerHeight(),
            resizeWidth, resizeHeight;
        // we feed the specified height (whether it appears on the Canvas or CanvasItem) to 
        // TableResizePolicy; if we give it a pixel size it will feed that back.  If we give it
        // a variable size (percent or "*"), that size will be incorporated into sizing the row
        // as a whole and we'll get the row height back.
        
        
        if (this.heightIncludesTitle && 
            this.showTitle && this.getTitleOrientation() == isc.Canvas.TOP) 
        {
            policyHeight -= this.form.getTitleHeight(this);
        }
        resizeHeight = policyHeight;
        

        // TableResizePolicy doesn't consider the specified width of items when determining
        // column widths.  Hence only apply the width if our width is unset or "*"
        var specifiedWidth = !this._appliedWidthToCanvas ? canvas._userWidth : null;
        var applyPolicyWidth = specifiedWidth == null 
                                || specifiedWidth == "*" || specifiedWidth == "100%";
        
        resizeWidth = (applyPolicyWidth ? policyWidth : specifiedWidth);
        

        var percentWidth = canvas._percent_width,
            percentHeight = canvas._percent_height;

        var parsedPercentWidth;
        if (policyWidth != null && percentWidth != null && percentWidth.endsWith("%") &&
            !window.isNaN(parsedPercentWidth = parseInt(percentWidth)))
        {
            // We're driving the width of the canvas in this case
            // even though we're doing it as a percentage
            applyPolicyWidth = true;
            resizeWidth = Math.round(policyWidth * (parsedPercentWidth/100));
        }
        
        this._appliedWidthToCanvas = applyPolicyWidth;

        // if width is not increasing past the current overflowed size, don't try to reduce the
        // height of an height-overflowed Canvas to less than the overflowed size, because 
        // there's no reason to expect it to shrink (unless it's dirty, in which case we assume
        // it might change size)
        
        var applyPolicyHeight = true;
        if (!canvas.isDirty() &&
            (resizeWidth == null || resizeWidth <= canvas.getVisibleWidth()) &&
            canvas.getHeight() < canvas.getVisibleHeight() && 
            resizeHeight <= canvas.getVisibleHeight()) 
        {
            this.logDebug("not applying height: " + resizeHeight + 
                          " to overflowed Canvas with height: " + canvas.getVisibleHeight(),
                          "canvasItemSizing");
            resizeHeight = null;
            applyPolicyHeight = false;
        }
        this._appliedHeightToCanvas = applyPolicyHeight;


        if (!isc.isA.Number(resizeWidth)) resizeWidth = null;
        if (!isc.isA.Number(resizeHeight)) resizeHeight = null;

        // actually call 'resizeTo' on the canvas
        this._setCanvasSize(resizeWidth,resizeHeight,percentWidth,percentHeight);

        this.logDebug("this._size: " + this._size + 
                      ", policy size: " + [policyWidth, policyHeight] +
                      ", specifiedSize: " + [specifiedWidth, canvas._userHeight || this.height] +
                      ", Resized Canvas to: " + [resizeWidth, resizeHeight],
                      "canvasItemSizing");

        // draw or redraw the Canvas so we get an accurate size
        if (!canvas.isDrawn()) {
            // skip the case where the containerWidget is undrawn (for example getting PrintHMTL of
            // an undrawn form)
            var containerDrawnState = this.containerWidget.getDrawnState();
            if (containerDrawnState == isc.Canvas.COMPLETE || 
                containerDrawnState == isc.Canvas.HANDLE_DRAWN) {
                    // move offscreen before draw so we don't impact the scroll height of
                    // the parent if we're not actually drawn
                    isc.Canvas.moveOffscreen(canvas);
                    canvas.draw();
            }
            
        } else canvas.redrawIfDirty("CanvasItem getting new size");
            
        var width = canvas.getVisibleWidth(),
            height = canvas.getVisibleHeight();

        this.logDebug("visible size of embedded Canvas: " + [width, height], 
                      "canvasItemSizing");
        
        // if the Canvas overflows in the height direction, set this as a minimum
        
        if (!firstResizePass) this._minHeight = null;
        else this._minHeight = height > canvas.getHeight() ? height : null;

        // policyHeight is the space allocated to the row(s) this Canvas spans.  If we've
        // exceeded the space that table sizing policy allocated to our row(s), the policy will
        // need to be rerun, in order to reallocate space among other items that can flex.
        // Note: doesn't matter if we've exceeded width; our width isn't taken into account by
        // the policy.
        // Note: doesn't matter whether the Canvas has actually overflowed it's own specified
        // size, which might be much smaller; eg a button next to a TextArea doesn't need to be
        // as tall as the TextArea.
        if (height > policyHeight) return true;
    },
    
    _setCanvasSize : function (resizeWidth, resizeHeight, percentWidth, percentHeight) {
        this._resizingCanvas = true;
        this.canvas.resizeTo(resizeWidth, resizeHeight);
        if (percentWidth != null) this.canvas._percent_width = percentWidth;
        if (percentHeight != null) this.canvas._percent_height = percentHeight;
        this._resizingCanvas = false;
    },

    getInnerHTML : function () {
        // size the Canvas to the final size determined by the resize policy - our
        // element HTML includes a spacer sized to match this
        
        if (this.canvas) this.sizeCanvas();
        
        return this.Super("getInnerHTML", arguments);
    },


    // Rather than embedding HTML for the canvas into the form, we write out a spacer of the
    // appropriate size, and float the Canvas over it.
    getElementHTML : function (value) {
        var canvas = this.canvas;
        if (!canvas) return null;

        

        

        // IE has an issue with getOffsetTop method if there is transitional doctype is used
        // to overcome this we add invisible 0px border - this helps somehow
        var invisibleBorder = "";
        if (isc.Browser.isIE && isc.Browser.isTransitional) {
            invisibleBorder = "border:0px solid transparent;"
        }
        return "<SPAN style='padding:0px;margin:0px;" + invisibleBorder + "' ID='"
                + this.getID() + "_spacerParent'>" 
                + isc.Canvas.spacerHTML(canvas.getVisibleWidth(), canvas.getVisibleHeight()) 
                + "</SPAN>";
    },

    getPrintHTML : function (printProperties, callback) {
        // If we're printing, write the printHTML for our canvasItem directly into the item.
        
        if (this.canvas == null) return isc.nbsp;
        return this.canvas.getPrintHTML(printProperties, callback);
    },

    
    _applyHandlersToElement : function () {
        this._setUpIconEventHandlers();
    },
        
    
    // return specified widths (which can be %s or *s), whether they appear on the Canvas or
    // CanvasItem, to be fed to the table resize policy.  If there is no specified size, feed
    // the layout policy our default height.
    getHeight : function (reportOverflowedSize) {    
        var canvas = this.canvas;
        if (canvas == null) {
            return this.Super("getHeight", arguments);
        }
        if (reportOverflowedSize) {
            var visibleHeight = canvas.getVisibleHeight();
            if (visibleHeight > canvas.getHeight()) return visibleHeight;
        }
        return canvas._userHeight || this.height || canvas.defaultHeight;
    },
    
    getWidth : function () {
        return this.canvas == null ? this.Super("getWidth", arguments) :
                (this.canvas._userWidth || this.width || this.canvas.defaultWidth);
    },

    // handle setWidth/Height(), as well as resize (below) - needed, for example, when used as 
    // an item in the FilterEditor of a ListGrid where a user can resize columns
    setWidth : function (width) {
        this.Super("setWidth", arguments);
        if (this.canvas) {
            var value = this.getValue(),
                policyWidth = this.sizeCanvasAsTextBox ? this.getTextBoxWidth(value)
                                                        : this.getInnerWidth();
            this.canvas.setWidth(Math.max(1, policyWidth));
            this._appliedWidthToCanvas = true;
        }
    },
    setHeight : function (height) {
        this.Super("setHeight", arguments);
        var value = this.getValue(),
            policyHeight = this.sizeCanvasAsTextBox ? this.getTextBoxHeight(value)
                                                    : this.getInnerHeight();

        
        if (this.heightIncludesTitle && 
            this.showTitle && this.getTitleOrientation() == isc.Canvas.TOP) 
        {
            policyHeight -= this.form.getTitleHeight(this);
        }
        this.canvas.setHeight(policyHeight);
        this._appliedHeightToCanvas = true;
    },

    //> @attr CanvasItem.minHeight (Integer : null : IRW)
    // Minimum valid height for this CanvasItem in pixels.  Used in calculating the row heights
    // of the containing +link{DynamicForm} if the item has a flexible +link{height}.
    // @visibility external
    //<
    //> @attr CanvasItem.maxHeight (Integer : null : IRW)
    // Maximum valid height for this CanvasItem in pixels.  Used in calculating the row heights
    // of the containing +link{DynamicForm} if the item has a flexible +link{height}.
    // @visibility external
    //<

    // overridable APIs used by Canvas.applyTableResizePolicy()
    getMaxHeight : function () {
        return this.maxHeight != null ? this.maxHeight : this.canvas.maxHeight;
    },
    getMinHeight : function () {
        // use the minimum height set on the CanvasItem, or set on the Canvas itself
        var minHeight = this.minHeight != null ? this.minHeight : this.canvas.minHeight;
        // use the greater of minimum above or _minHeight (from an overflowed canvas)
        return this._minHeight == null ? minHeight : Math.max(minHeight, this._minHeight);
    },

    // if the Canvas is resized by the user or programmatically outside of CanvasItem's layout
    // code, 
    canvasResized : function (deltaX, deltaY, reason) {
        if (this._resizingCanvas) return;
        
        var canvas = this.canvas;
        if (!isc.isA.Canvas(canvas)) {
            //>DEBUG
            // Sanity check that we have a real canvas - this shouldn't happen, as we're
            // called directly from the resized handler of the live widget, but
            // if we've somehow been disconnected from it, stop processing before
            // downstream code causes a JS error.
            this.logWarn("canvasItem canvasResized notification fired, but this.canvas is " +
                "not a live Canvas instance. Ignoring.");
            //<DEBUG
            return;
        }
        var newWidth = Math.max(1, canvas.getWidth()),
            newHeight = canvas.getHeight();

        
        if (reason != "init" && 
            reason != "overflow" && reason != "Overflow on initial draw") 
        {
            if (deltaX != null && deltaX != 0) {
                canvas.updateUserSize(newWidth, canvas._$width);
            }
            if (deltaY != null && deltaY != 0) {
                canvas.updateUserSize(newHeight, canvas._$height);
            }
        }

        this.logDebug("canvas resized: new specified sizes: " + [newWidth, newHeight],
                      "canvasItemSizing");

        if (!canvas.isDrawn()) return;
        // redraw to change size
        this.redraw();
    },

    //> @method canvasItem.shouldDisableCanvas()
    // Method called to determine whether the +link{CanvasItem.canvas,canvas} should be
    // +link{Canvas.setDisabled(),disabled} when this <code>CanvasItem</code> is disabled
    // or its +link{canEditChanged(),editability changes}.
    // By default, if the <code>canvas</code> is a +link{DynamicForm}, then it is disabled if
    // and only if this <code>CanvasItem</code> is disabled; otherwise, the <code>canvas</code>
    // is disabled if and only if this <code>CanvasItem</code> is disabled or
    // +link{FormItem.getCanEdit(),read-only}.
    // <smartclient><p>
    // This method may be overridden to customize the default return value.</smartclient>
    // @return (boolean) <code>true</code> if the <code>canvas</code> should be disabled;
    // <code>false</code> otherwise.
    // @visibility external
    //<
    shouldDisableCanvas : function () {
        var canvas = this.canvas;
        if (canvas == null) return false;
        if (isc.isA.DynamicForm(canvas)) {
            return this.isDisabled();
        } else {
            return this.isDisabled() || this.isReadOnly();
        }
    },

    // override 'updateDisabled()' to disable the canvas
    updateDisabled : function (settingFormHandleDisabled) {
        this.Super("updateDisabled", arguments);
        
        this.canvas.setDisabled(this.shouldDisableCanvas(), settingFormHandleDisabled);
    },

    // Update enabled/disabled state of the element to match our read-only/disabled state.
    // This avoids a complete redraw when changing read-only state.
    setElementReadOnly : function () {
        this._setElementEnabled(!this.isReadOnly() && !this.isDisabled());
    },

    
    mustRefocusOnRedraw:false,

    // On a programatic call to 'focusInItem', put focus onto our canvas.
    // Use the tabIndexManager to do this - if the canvas itself is not
    // focusable but its descendants are, we want focus to shift to the first
    // focusable child.
    
    focusInItem : function () {
        if (this.canvas != null && isc.isA.Canvas(this.canvas)) {

            var canvasID = this.canvas.getID();
            this.logDebug("CanvasItem.focusInItem(): Asking TabIndexManager to shift focus into:"
                        + canvasID, "syntheticTabIndex");
            return isc.TabIndexManager.shiftFocus(this.getID(), true, this.getID())

        } else {
            return this.Super("focusInItem", arguments);
        }
    },
    
    // We're marked as 'canFocus:true' on the TabIndexManager tree, so 
    // we can expect to get our syntheticShiftFocus callback fired when the user is
    // tabbing through a UI with other masked elements.
    // Simply return false when this happens - that allows the TIM to move onto the
    // next target -- if moving forward that'll be our Canvas (or icons, etc), if moving
    // backwards we can assume focus was previously on our canvas, so it's appropriate
    // to skip us and move to the previous item on the form.
    
    syntheticShiftFocus : function (itemID) {
        return false;
    },
    
    
    blurItem : function (isRedraw) {
        // suppress blur/refocus on redraw
        
        if (!isRedraw && this.canvas) this.canvas.blur();
        return this.Super("blurItem", arguments);
    },
    
    // Values management with nested editors
    // If our canvas is (or contains) a DynamicForm, a common pattern is for our
    // value to depend on the value of item(s) within that form.
    // If updateValue / valueIsDirty is called on us, we really want the nested item
    // to be up to date too (its 'changed' handler will likely already handle calling
    // storeValue on us if necessary).
    // Therefore catch this case by checking for a nested focus item and passing the
    // dirty/update methods through to it
    _getNestedFocusItem : function () {
        var canvas = this.canvas,
            focusCanvas = isc.EH.getFocusCanvas();
            
        if (canvas && focusCanvas && 
            isc.isA.DynamicForm(focusCanvas) &&
            canvas.contains(focusCanvas, true)) 
        {
            return focusCanvas.getFocusSubItem();
        }
    },

    _itemValueIsDirty : function () {
        if (this.Super("_itemValueIsDirty", arguments)) return true;
        
        var embeddedFocusItem = this._getNestedFocusItem();
        if (embeddedFocusItem) {
            return embeddedFocusItem._itemValueIsDirty();
        }
        return false;
    },
    
    updateValue : function () {
        var embeddedFocusItem = this._getNestedFocusItem();
        if (embeddedFocusItem) {
            embeddedFocusItem.updateValue();
        }
        return this.Super("updateValue", arguments);
        
    },

    // observation of focusChanged / childFocusChanged on the Canvas
    
    canvasFocusChanged : function () {
        this._canvasFocusChanged();
    },
    canvasChildFocusChanged : function () {
        this._canvasFocusChanged();
    },
    _canvasFocusChanged : function () {

        var hasFocus = this.canvas && this.canvas.containsFocus();
        if (hasFocus != this.hasFocus) {
            this.hasFocus = hasFocus;
            var form = this.form;
            if (this.canvas.containsFocus()) {
                if (form.getFocusSubItem() !== this) {
                    form.setFocusItem(this);
                    this.elementFocus();
                }
            } else {
                this.elementBlur();
                if (form.getFocusSubItem() === this) form.setFocusItem(null);
            }
        }
    },
    
    //> @method canvasItem.isFocused()
    // Does this CanvasItem have keyboard focus.
    // <P>
    // This method will return true if this item's canvas, or any of its descendents, has
    // keyboard focus
    // @return (Boolean) returns true if this item contains focus.
    // @visibility external
    //<
    isFocused:function () {
        if (this.canvas && this.canvas.containsFocus()) return true;
        return this.Super("isFocused", arguments);
    },

    
    nestedFormSetFocusItem : function () {
        this.form.setFocusItem(this);
    },

    //> @method canvasItem.hasAdvancedCriteria()
    // Overridden to return true if +link{canvasItem.canvas} is a dynamicForm.
    // See <smartclient>+link{getCriterion()}</smartclient>
    // <smartgwt><code>setCriterionGetter()</code></smartgwt>
    // for details of editing advanced criteria using nested
    // dynamicForms.
    // @return (Boolean) true if this item's canvas is a DynamicForm
    // @group criteriaEditing
    // @visibility external
    //<
    hasAdvancedCriteria : function () {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) return true;
        return this.Super("hasAdvancedCriteria", arguments);
    },

    //> @method canvasItem.canEditCriterion()
    // AdvancedCriteria objects may be edited via nested dynamicForms as described in
    // +link{canvasItem.getCriterion()}
    // <P>
    // This method has been overridden to return true if this item's canvas is a DynamicForm,
    // where the +link{dynamicForm.operator} matches the operator of the criterion passed in
    // and dynamicForm contains items where +link{formItem.canEditCriterion()} returns true
    // for each sub-criterion in the object passed in.
    // @param criterion (Criterion) criteria to test
    // @return (boolean) returns true if the specified criterion may be edited by this item
    // @group criteriaEditing
    // @visibility external
    //<
    canEditCriterion : function (criterion) {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) {
            if (criterion.operator != this.canvas.operator) return false;
            //this.logWarn("going to compare criterion:" + this.echo(criterion) + " with form: " +
            //    this.canvas);
            for (var i = 0; i < criterion.criteria; i++) {
                var items = this.canvas.getItems(),
                    foundItem;
                for (var ii = 0; ii < items.length; ii++) {
                    if (items[ii].canEditCriterion(criterion.criteria[i])) {
                        //this.logWarn("item:" + items[ii] + " can edit:" + this.echo(criterion.criteria[i]));
                        foundItem = true;
                        break;
                    }
                }
                //this.logWarn("found item:" + foundItem + " for criterion:" + this.echo(criterion.criteria[i]));
                if (!foundItem) return false;
            }
            return true;
        }
        return this.Super("canEditCriterion", arguments);
    },
    
    //> @attr canvasItem.editCriteriaInInnerForm (Boolean : true : IRA)
    // Flag to disable the criteria editing overrides described in
    // <smartclient>+link{getCriterion()}</smartclient>
    // <smartgwt><code>setCriterionGetter()</code></smartgwt> whereby
    // if this item contains a DynamicForm as its canvas, it will be used to edit nested
    // AdvancedCriteria automatically.
    // <P>
    // This flag is required for cases where a canvasItem contains a DynamicForm, but the form
    // is not set up to show inner field values of nested objects, and therefore should not
    // attempt to apply nested advanced criteria directly to the form.
    //
    // @visibility external
    //<
    // This is required for the RelativeDateItem. It's quite likely to be required for 
    // developer-defined canvasItems too. For simple items where the form just displays an atomic
    // field value in some custom way, setting this flag will be sufficient to get simple
    // operator-based advanced criteria editing working. If the inner form does something more
    // complex, developers would potentially need to override hasAdvancedCriteria, getCriterion, etc
    editCriteriaInInnerForm:true,

    //> @method canvasItem.getCriterion()
    // The standard formItem criteria editing APIs have been overridden in the canvasItem class
    // to simplify the editing of complex +link{AdvancedCriteria} objects using nested 
    // DynamicForms.
    // <P>
    // The following pattern is supported without need for further modification:<br>
    // A complex Advanced criteria object may have nested sub criteria using the <code>"and"</code>
    // or <code>"or"</code> operators. For example:
    // <pre>
    // { _constructor:"AdvancedCriteria",
    //   operator:"and",
    //   criteria:[
    //      {fieldName:"field1", value:"value1", operator:"iContains"},
    //      {operator:"or", criteria:[
    //          {fieldName:"innerField1", value:"value1", operator:"equals"},
    //          {fieldName:"innerField2", value:"value2", operator:"iContains"}
    //       ]
    //      }
    //   ]
    // }
    // </pre>
    // To create a form capable of editing the above criteria without providing custom overrides
    // to +link{formItem.getCriterion()} et al, you would create a form with 2 items.
    // The 'field1' criterion could be edited by a simple form item such as a TextItem.
    // The nested criteria ('innerField1' and 'innerField2') could be edited by a canvasItem
    // whose canvas property was set to a DynamicForm showing items capable of editing the 2
    // inner criteria, and whose operator was specified as "or".<br>
    // For example:
    // <smartclient>
    // <pre>
    //  isc.DynamicForm.create({
    //      items:[
    //          {name:"field1", type:"TextItem"},
    //          {name:"nestedItem", shouldSaveValue:true, type:"CanvasItem",
    //              canvas:isc.DynamicForm.create({
    //                  operator:"or",
    //                  items:[
    //                      {name:"innerField1", type:"TextItem", operator:"equals"},
    //                      {name:"innerField2", type:"TextItem"}
    //                  ]
    //              })
    //          }
    //      ]
    //  });
    // </pre>
    // </smartclient>
    // <smartgwt>
    // <pre>
    //  DynamicForm form = new DynamicForm();
    //
    //  DynamicForm innerForm = new DynamicForm();
    //  innerForm.setOperator(OperatorId.OR);
    //  TextItem innerField1 = new TextItem();
    //  innerField1.setOperator(OperatorId.EQUALS);
    //  TextItem innerField2 = new TextItem();
    //  innerForm.setFields(innerField1, innerField2);
    //
    //  TextItem field1 = new TextItem();
    //  CanvasItem nestedItem = new CanvasItem();
    //  nestedItem.setShouldSaveValue(true);
    //  nestedItem.setCanvas(innerForm);
    //
    //  form.setFields(field1, nestedItem);
    // </pre>
    // </smartgwt>
    // This form would be able to edit the above advanced criteria object via
    // +link{dynamicForm.setValuesAsCriteria()}. Edited values would be retrieved via
    // +link{dynamicForm.getValuesAsCriteria()}.
    // <P>
    // Note that the canvas item has <code>shouldSaveValue</code> set to true - this is required
    // to ensure the nested form is actually passed the values to edit. 
    // <P>
    // The default implementation of this method checks for this.canvas being specified as a
    // dynamicForm, and in that case simply returns the result of 
    // +link{dynamicForm.getValuesAsAdvancedCriteria()} on the inner form.
    // <P>
    // Note that this functionality may be entirely bypassed by
    // setting +link{editCriteriaInInnerForm} to false. This flag is useful when defining a
    // dynamicForm based canvasItem which is not intended for editing nested data -- for example
    // if a standard atomic field value is being displayed in some custom way using a
    // DynamicForm embedded in the item.
    // 
    // @return (Criterion) criterion to merge with advanced criteria returned by 
    //  +link{dynamicForm.getValuesAsCriteria()}
    // @group criteriaEditing
    // @visibility external
    //<
    getCriterion : function () {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) {
            return this.canvas.getValuesAsAdvancedCriteria();
        } else return this.Super("getCriterion", arguments);
    },
    
    //> @method canvasItem.setCriterion()
    // Display a +link{criterion} object in this item for editing. Overridden from 
    // +link{formItem.setCriterion()} in order to support editing nested criteria using 
    // nested dynamicForms as described in +link{canvasItem.getCriterion()}.
    // <P>
    // Implementation checks for this.canvas being specified as a DynamicForm, and applies
    // criterion directly to the embedded form via setValuesAsCriteria()
    // @param criterion (Criterion) criteria to edit
    // @group criteriaEditing
    // @visibility external
    //<
    setCriterion : function (criterion) {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) {
            this.canvas.setValuesAsCriteria(criterion, true);
        } else return this.Super("setCriterion", arguments);
    },

    // we copy the prompt onto the Canvas by default - override setPrompt to do the same at runtime

    //> @attr canvasItem.applyPromptToCanvas (Boolean : true : IRW)
    // If +link{formItem.prompt} is specified for this item, should the prompt be applied to the
    // +link{canvasItem.canvas} for this item?
    // @visibility external
    //<
    applyPromptToCanvas:true,

    //> @attr canvasItem.prompt
    // @include FormItem.prompt
    // @visibility external
    //<

    //> @method canvasItem.setPrompt()
    // Set the +link{formItem.prompt} for this item. Default implementation will also apply the
    // prompt to +link{canvasItem.canvas} if +link{canvasItem.applyPromptToCanvas} is true.
    // @param prompt (HTMLString) new prompt for the item.
    // @visibility external
    //<
    setPrompt : function (prompt) {
        this.Super("setPrompt", prompt);
        if (this.applyPromptToCanvas && this.canvas) {
            if (isc.isA.Canvas(this.canvas)) this.canvas.setPrompt(prompt);
            else this.canvas.prompt = prompt;
        }
    },

    // override setHoverPersist() to apply the new value to the child canvas
    setHoverPersist : function (hoverPersist) {
        this.Super("setHoverPersist", arguments);
        // push the new hoverPersist to the child canvas
        if (this.canvas) this.canvas.hoverPersist = hoverPersist;
    },
    // override setHoverFocusKey() to apply the new value to the child canvas
    setHoverFocusKey : function (hoverFocusKey) {
        this.Super("setHoverFocusKey", arguments);
        // push the new hoverFocusKey to the child canvas
        if (this.canvas) this.canvas.setHoverFocusKey(hoverFocusKey);
    },

    // methods that DynamicForm calls on this item

    _setHoverPersist : function (hoverPersist) {
        // This method is called by setHoverPersist() on the parent DynamicForm - it's internal
        // and used to push the form's new hoverPersist to this item's child canvas, but only 
        // if this item doesn't have a local hoverPersist.
        if (!this.hoverPersist && this.canvas) this.canvas.hoverPersist = hoverPersist;
    },

    _setHoverFocusKey : function (hoverFocusKey) {
        // This method is called by setHoverFocusKey() on the parent DynamicForm - it's internal
        // and used to push the form's new hoverFocusKey to this item's child canvas, but only 
        // if this item doesn't have a local hoverFocusKey.  Done this way, with 
        // hasOwnProperty(),  because the default is undefined and we need to support null 
        // being set, which is how you switch off the focusKey label
        if (this.canvas && !this.hasOwnProperty("hoverFocusKey")) {
            this.canvas.setHoverFocusKey(hoverFocusKey);
        }
    }
});

isc.CanvasItem.registerStringMethods({
    //> @method canvasItem.createCanvas ()
    // This method allows dynamic creation of a CanvasItem's canvas, rather than
    // setting +link{CanvasItem.canvas} statically.
    // If specified this +link{group:stringMethods,StringMethod} will be called when the form item is 
    // initialized and should return the Canvas to display for this item.
    // @param form (DynamicForm) the dynamicForm in which this item is contained
    // @param item (CanvasItem) the live form item instance
    // @return (Canvas) the canvas to be rendered inside this CanvasItem
    // @visibility external
    //<
    createCanvas:"form,item",
    
    
    //> @method canvasItem.showValue()
    // This method will be called whenever this FormItem's value is being set via a programmatic
    // call to e.g: +link{dynamicForm.setValues()} or +link{formItem.setValue()} and may be
    // overridden by CanvasItems intended to support displaying data values to update the
    // embedded Canvas to reflect the value passed in. Note that the first parameter will be a 
    // formatted value - while the second parameter will contain the underlying data value for
    // the item.
    // @param displayValue (Any) new display value for the item.  This is the value after applying
    //   any custom formatter or valueMap
    // @param dataValue (Any) underlying data value for the item
    // @param form (DynamicForm) the dynamicForm in which this item is contained
    // @param item (CanvasItem) the live form item instance
    // @visibility external
    //<
    showValue:"displayValue,dataValue,form,item"
});

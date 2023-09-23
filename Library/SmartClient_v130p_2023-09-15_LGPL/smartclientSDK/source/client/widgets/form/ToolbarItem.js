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
//>	@class	ToolbarItem
//
// Set of horizontally arranged buttons.
//
// @inheritsFrom CanvasItem
// @visibility external
//<
isc.ClassFactory.defineClass("ToolbarItem", "CanvasItem");

isc.ToolbarItem.addProperties({

    // Override canFocus -- even though toolbars have no data element, they can accept focus.
    canFocus:true,
    
    // Avoid attempting to save this item's value in the values array.
    shouldSaveValue:false,
    
	//>	@attr	toolbarItem.buttons		(Array of StatefulCanvas : null : IRW)
	//  List of buttons for the toolbar.
    //  Each button should be specified as a simple JS object with properties to apply to the
    //  button to be displayed. Note that any <code>click</code> stringMethod applied to the
    //  button will be passed 2 parameters: <code>form</code> and <code>item</code>.
	//		@group	items
    // @visibility external
	//<

    //>	@attr	toolbarItem.showTitle		(Boolean : false : IRW)
	//	Don't show a title for toolbars
	//		@group	appearance
    // @visibility external
	//<
	showTitle:false,						


    //>	@attr	toolbarItem.buttonSpace     (number : 4 : IRW)
	//  Space between the buttons of this toolbar. Configures the +link{layout.membersMargin} 
    //  property on the created +link{toolbarItem.canvas}.
	//		@group	appearance
    // @visibility external
	//<
	buttonSpace:4,

    //>	@attr	toolbarItem.startRow		(Boolean : true : IRW)
	//			these items are in a row by themselves by default
	//		@group	appearance
    // @visibility external
	//<
	startRow:true,

	//>	@attr	toolbarItem.endRow			(Boolean : true : IRW)
	//			these items are in a row by themselves by default
	//		@group	appearance
    // @visibility external
	//<
	endRow:true,

    //>	@attr	toolbarItem.colSpan			(int | String : "*" : IRW)
	//			these items span all columns
	//		@group	appearance
    // @visibility external
	//<
	colSpan:"*",
    
    //> @attr toolbarItem.canvas (AutoChild Canvas : null : R)
    //      This item is an autoChild generated +link{class:Canvas} displayed by
    // the ToolbarItem and is an instance of +link{class:Toolbar} by default<smartclient>, 
    // customizable via the +link{attr:toolbarItem.canvasConstructor} attribute</smartclient>.
    // @visibility external
    //<

    //>@attr    toolbarItem.canvasConstructor  (String : Toolbar : IRA)
    // Constructor class for this toolbarItem's +link{toolbarItem.canvas,canvas}.
    // @visibility external
    //<
    canvasConstructor:'Toolbar',

    //>@attr    toolbarItem.vertical    (Boolean    : false : IRA)
    //  Should the toolbar stack its buttons vertically or horizontally?
    //  @visibility external
    //<    
    vertical:false,
    
    
    
    //>@attr    toolbarItem.buttonProperties   (Object : null : IRA)
    //  Default properties for this toolbar's buttons.
    //  @visibility external
    //<
    

    //>@attr    toolbarItem.buttonAutoFit   (Boolean : true : IRA)
    // Default +link{button.autoFit} for buttons - true by default. Note that 
    // autoFit:true buttons will fit to their title regardless of specified width.
    // 
    //  @visibility external
    //<
    buttonAutoFit:true

    //>	@attr	toolbarItem.buttonBaseStyle        (CSSStyleName : null : IRW)
	//  If specified this baseStyle will be applied to the buttons in this toolbar.
	//		@group	appearance
    //      @visibility external
	//<
	//buttonBaseStyle:null,
    
    //>	@attr	buttonItem.buttonTitleStyle       (CSSStyleName : "buttonItem" : IRW)
	//  CSS class to apply to the buttons' titles.
    //      @visibility internal
	//<
    

    //> @attr toolbarItem.createButtonsOnInit (Boolean : null : [IR])
    // If set to true, causes the toolbar created by this item to create its child buttons 
    // during initialization, instead of waiting until draw().
    // <p>
    // See the corresponding +link{toolbar.createButtonsOnInit, Toolbar attribute} for more
    // information.
    // @visibility external
    //<
    //createButtonsOnInit: null,
    
});

isc.ToolbarItem.addMethods({

    _createCanvas : function () {
    
        var buttons = (this.buttons || this.items || []),
            buttonProperties = this.buttonProperties || {};
            
        isc.addProperties(buttonProperties, {
            // override handleClick to fire 'click' passing in 'form' and 'item' as params
            handleActivate : function () {
                var item = this.parentElement.canvasItem,
                    form = item.form;
                if (this.click != null) return this.click(form, item);
            }
        });
        
        if (this.buttonAutoFit != null && buttonProperties.autoFit == null) {
            buttonProperties.autoFit = this.buttonAutoFit;
        }

        if (this.buttonBaseStyle && !buttonProperties.baseStyle) {
            buttonProperties.baseStyle = this.buttonBaseStyle;
        }
        if (this.buttonTitleStyle && !buttonProperties.titleStyle) {
            buttonProperties.titleStyle = this.buttonTitleStyle;
        }
        
        // Update properties on the individual button init blocks as required.
        this._updateButtons(buttons);
        
        this.canvas = { overflow:isc.Canvas.VISIBLE, 
                        buttons:buttons,
                        membersMargin:this.buttonSpace,
                        vertical:this.vertical,
                        // Button defaults are applied via Toolbar.button property
                        buttonProperties:buttonProperties };

        var height = this.height,
            width = this.width;
        if (!isc.isA.Number(width) && this._size) 
            width = isc.isA.Number(this._size[0]) ? this._size[0] : null;
        if (!isc.isA.Number(height) && this._size) 
            height = isc.isA.Number(this._size[1]) ? this._size[1] : null;

        if (height) this.canvas.height = height;
        if (width) this.canvas.width = width;
        
        if (this.buttonConstructor != null) 
            this.canvas.buttonConstructor = this.buttonConstructor;

        if (this.createButtonsOnInit != null) {
            // passthrough createButtonsOnInit - create buttons at init, rather than at draw()
            this.canvas.createButtonsOnInit = this.createButtonsOnInit;
        }
        
        return this.Super("_createCanvas", arguments);
    },
    
    // Helper function to update the button init blocks before creating them as button instances
    _updateButtons : function (buttons) {
        if (!buttons || buttons.length == 0) return;
        // override 'click' on button init blocks to always be functions taking 'form,item'
        // as params
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].click && isc.isA.String(buttons[i].click)) {
                buttons[i].click = isc.Func.expressionToFunction("form,item", buttons[i].click);
            }
        }   
        
    },

    //>EditMode dynamic addition/removal of buttons
    getButton : function (button) {
        return isc.Class.getArrayItem(button, this.buttons, "name");
    },
    addButton : function (button, index) {
        this.buttons = this.buttons || [];
        this.buttons.addAt(button, index);
        this.setButtons(this.buttons);
    },
    removeButton : function (button) {
        var index = isc.Class.getArrayItemIndex(button, this.buttons, "name");
        if (index != -1) {
            this.buttons.removeAt(index);
            this.setButtons(this.buttons);
        }
    },
    //<EditMode
    
    setButtons : function (buttons) {
        this._updateButtons(buttons);
        this.buttons = buttons;
        // if we're not initialized, no-op since the buttons will get set up with _createCanvas
        // when we init
        if (!this.canvas) return;
        
        this.canvas.setButtons(buttons);
    },

    // Allow setItems as well as setButtons for back-compat
    setItems : function (buttons) {
        return this.setButtons(buttons);
    }
    
});



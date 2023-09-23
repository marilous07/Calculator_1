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
// Class will not work without the ListGrid
if (isc.ListGrid) {




//>	@class	ScrollingMenu
//
//	Implements a scrollable, user-selectable, menu
//
//  @treeLocation Client Reference/Control
//<


// define us as a subclass of the ListGrid
isc.ClassFactory.defineClass("ScrollingMenu", "ListGrid");

isc.ScrollingMenu.scrollingPickerProperties = {

    
    minHeight: 1,

    
    useBackMask:true,
    
    // Explicitly default canFocus to true.
    canFocus:true,
    
    showHeader:false,
    // Avoid showing edges.
    showEdges:false,
    
    autoDraw:false,
    
    // don't use the default ListGrid component/body styles, which usually have partial borders 
    className:"scrollingMenu",
    bodyStyleName:"scrollingMenuBody",

    selectionType:"single",
    leaveScrollbarGap:false,

    // keyboard - we respond to clicks and Enter keypresses identically. 
    // Space has no meaning.
    generateClickOnSpace : false,
    generateDoubleClickOnEnter : false,
    generateClickOnEnter : true,
    // By default show as a modal component.
    showModal:true,

    // arrowKeyAction will select by default
    
    arrowKeyAction:"select",    
    //enableSelectOnRowOver: null, // !isc.Browser.isTouch

    // default to filter on keypress if we show a filter editor
    filterOnKeypress:true

};

isc.ScrollingMenu.scrollingPickerMethods = {
    show : function () {
        
        if (this.showModal) {
            var mode = this.clickMaskMode || (this.formItem && this.formItem.clickMaskMode);
            if (mode == null) {
                // legacy behavior of showing a hard clickMask for modal pickLists
                mode = "hard";
            }
            this.showClickMask({target:this, methodName:"cancel"}, mode, [this]);
        }
        this.Super("show", arguments);
        if (this.showModal) this.body.focus();
    },

    // override recordClick to fire the 'itemClick' method.
    recordClick : function (viewer,record,recordNum,field,fieldNum,value,rawValue) {
        // hide before firing itemClick.
        // This avoids issues with focus, where the itemClick action is expected to put focus
        // somewhere that is masked until this menu hides.
        this.hide();
        // add support for click handlers on the individual rows
        // make itemClick a stringMethod?
        if (record != null) this.itemClick(record);
    },

    // override this for click handling behavior
    itemClick : function (record) {},
    
    // On RowOver change selection. The user can then use arrow keys to further modify selection
    // This matches behavior in native select item drop-downs.
    
    rowOver : function (record,rowNum,colNum) {
        if (this.enableSelectOnRowOver) {
            this.selectionManager.selectSingle(record);
            this.fireSelectionUpdated();
        }
    },
    createSelectionModel : function (a,b,c,d,e) {
        var returnVal = this.invokeSuper(isc.ScrollingMenu, "createSelectionModel", a,b,c,d,e);
        // Override selection so we can tell the difference between selection from rollOver and
        // from keyboard events / clicks.
        // This is required so we can do the right thing on Enter keypress
        this.selectionManager.addProperties({
            selectOnRowOver : function (record) {
                this.selectSingle(record);
                this.selectionFromMouse = true;
            },
            
            setSelected : function (record, state) {
                this.selectionFromMouse = false;
                return this.Super("setSelected", arguments);
            }
        });
        
        return returnVal;
    },
    // Keyboard handling:

    // Override bodyKeyPress to handle firing 'cancel()' on escape click.    
    bodyKeyPress : function (event, eventInfo) {
        var keyName = event.keyName;
        
        if (keyName == this._$Enter) {
            var selection = this.selectionManager;
            if (selection && selection.selectionFromMouse) {
                this.cancel();
                return false;
            }
        }
        if (keyName == "Escape") {
            this.cancel();

            // stop bubbling!
            return false;
        } 
        return this.Super("bodyKeyPress", arguments);
    },    
    
    
    cancel : function () {
        this.hide();
    },
    
    // Override hide to ensure that the clickMask gets hidden too
    hide : function () {    
        this.hideClickMask();
        return this.Super("hide", arguments);
    },
    
    // Always select the first item in the list *IF* nothing is selected
    
    _selectFirstOnDataChanged:true,
    dataChanged : function () {
        var returnVal = this.Super("dataChanged", arguments);
        if (!this._selectFirstOnDataChanged) return;
        
        if (this.data && this.data.getLength() > 0 && 
            this.selectionManager && !this.selectionManager.anySelected() && 
            //FIXME: tweak as appropriate for trees
            (isc.isA.ResultSet==null || !isc.isA.ResultSet(this.data) || this.data.rowIsLoaded(0))) 
        {
                this.selectionManager.selectItem(0);
                this.fireSelectionUpdated();
        }
        return returnVal;
    }
                          
};

isc.defer("isc.ScrollingMenu.addProperties({ enableSelectOnRowOver: !isc.Browser.isTouch });");

isc.ScrollingMenu.addProperties(isc.ScrollingMenu.scrollingPickerProperties);
isc.ScrollingMenu.addProperties(isc.ScrollingMenu.scrollingPickerMethods);

isc.ScrollingMenu.changeDefaults("filterEditorDefaults", {
        // If the filter editor is showing, explicitly give it a solid bg color.
        // This prevents things showing through under the transparent background of
        // the filter button image
        backgroundColor:"white",
        
        // Override editor keypress -- allow the user to move around and select
        // records as expected
        editorKeyPress : function (item, keyName, characterValue) {
            if (keyName == "Arrow_Down") {
                this.sourceWidget._navigateToNextRecord(1);    
                return false;
            }
            if (keyName == "Arrow_Up") {
                this.sourceWidget._navigateToNextRecord(-1);
                return false;
            }
            if (keyName == "Enter") {
                this.sourceWidget._generateFocusRecordClick();
                return;
            }
            return this.Super("editorKeyPress", arguments);
        }
});

isc.ScrollingMenu.changeDefaults("bodyDefaults", {
    
    _readyToSetFocus : function () {
        return this.creator._readyToSetFocus.apply(this.creator, arguments);
    }
});



}

// Class will not work without the TreeGrid
if (isc.TreeGrid) {

// define us as a subclass of the TreeGrid
isc.ClassFactory.defineClass("ScrollingTreeMenu", "TreeGrid");

isc.defer("isc.ScrollingTreeMenu.addProperties({ enableSelectOnRowOver: !isc.Browser.isTouch });");

isc.ScrollingTreeMenu.addProperties(isc.ScrollingMenu.scrollingPickerProperties);
isc.ScrollingTreeMenu.addProperties(isc.ScrollingMenu.scrollingPickerMethods);

isc.ScrollingTreeMenu.addProperties({
    //arrowKeyAction:"move"
});

isc.ScrollingTreeMenu.changeDefaults("filterEditorDefaults", {
        // If the filter editor is showing, explicitly give it a solid bg color.
        // This prevents things showing through under the transparent background of
        // the filter button image
        backgroundColor:"white",
        
        // Override editor keypress -- allow the user to move around and select
        // records as expected
        editorKeyPress : function (item, keyName, characterValue) {
            if (keyName == "Arrow_Down") {
                this.sourceWidget._navigateToNextRecord(1);    
                return false;
            }
            if (keyName == "Arrow_Up") {
                this.sourceWidget._navigateToNextRecord(-1);
                return false;
            }
            if (keyName == "Enter") {
                this.sourceWidget._generateFocusRecordClick();
                return;
            }
            return this.Super("editorKeyPress", arguments);
        }
});

isc.ScrollingTreeMenu.changeDefaults("bodyDefaults", {
    
    _readyToSetFocus : function () {
        return this.creator._readyToSetFocus.apply(this.creator, arguments);
    }
});

}

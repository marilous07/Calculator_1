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
//>	@class	TabBar
// Shows a set of Tabs.  TabBars are automatically created by TabSets and shouldn't be used
// directly.  The TabBar is documented for skinning purposes.
// 
// @inheritsFrom Toolbar
// @treeLocation Client Reference/Layout/TabSet
// @visibility external
//<
isc.ClassFactory.defineClass("TabBar", "Toolbar");

isc.TabBar.addProperties({
    //>	@attr TabBar.tabs		(Array of Tab Properties : null : IR)
    // Tab for this TabBar.
    // @visibility external
    //<

    //>	@attr TabBar.breadth	(number : 21 : IRW)
    // Breadth of the tabBar (including baseline breadth)
    // @visibility external
    //<
    breadth: 21,

    //>	@attr TabBar.buttonConstructor	(Class: ImgTab : AIRW)
    // SmartClient component used for the tabs of the tabBar. 
    // Must be Button or Button subclass.
    // @visibility external
    //<
    // Note - if this TabBar is part of a TabSet, this constructor can be overridden by setting 
    // 'useSimpleTabs' on the TabSet - will use buttons instead, styled via CSS to look like
    // tabs.
    buttonConstructor:isc.ImgTab,

    // We want to have arrow keys, not tab-keypresses, move between tabs
    tabWithinToolbar:false,

    //> @attr tabBar.closeTabKeys (Array of KeyIdentifier : see below : IRA)
    // An array of shortcut keyboard commands which will close the currently selected tab, if
    // the currently selected tab is closeable. Either this <code>TabBar</code> or the currently
    // selected tab must have keyboard focus.
    // <p>
    // By default, this is an array of two <code>KeyIdentifier</code>s: <code>Alt+Delete</code>,
    // which is the keyboard command recommended by
    // +externalLink{http://www.w3.org/WAI/PF/aria-practices/#tabpanel,WAI-ARIA Authoring Practices},
    // and <code>Ctrl+W</code>.
    // Notes:
    // <ul>
    // <li>On Mac, the <code>Alt+Delete</code> keyboard command is accomplished via
    // <code>Fn-Option-Delete</code>.
    // <li><code>Alt+Delete</code> is a
    // +externalLink{http://doccenter.freedomscientific.com/doccenter/archives/training/jawskeystrokes.htm,JAWS Keystroke}
    // to "Say Active Cursor". If using JAWS, pressing <code>Alt+Shift+Delete</code> will close
    // the tab.
    // <li>In Chrome, Firefox, and Internet Explorer on Windows, <code>Ctrl+W</code> will also
    // close the browser tab/window if focus is not within a <code>TabBar</code>.
    // If <code>Ctrl+W</code> will be used frequently by the application's users, it may be useful to
    // <smartclient>
    // +link{Page.registerKey(),register this key} to cancel it by default:
    // <pre>isc.Page.registerKey({ctrlKey: true, keyName: "W"}, "return false");</pre>
    // </smartclient>
    // <smartgwt>
    // {@link com.smartgwt.client.util.Page#registerKey(KeyIdentifier, PageKeyHandler) register this key}
    // to cancel it by default:
    // <pre>final KeyIdentifier ctrlWKey = new KeyIdentifier();
    //ctrlWKey.setCtrlKey(true);
    //ctrlWKey.setKeyName("W");
    //Page.registerKey(ctrlWKey, new PageKeyHandler() {
    //    &#64;Override
    //    public void execute(String keyName) {
    //        cancel();
    //    }
    //});</pre>
    // </smartgwt>
    // </ul>
    // @visibility external
    //<
    
    closeTabKeys: [{
        altKey: true,
        keyName: "Delete"
    }, {
        ctrlKey: true,
        keyName: "W"
    }],
    _$ctrlWKey: {
        ctrlKey: true,
        keyName: "W"
    },

    // override keyPress - in addition to shifting focus on arrow keypress we want to
    // actually select the new tab
    
    keyPress : function () {
        var EH = this.ns.EH,
            lastEvent = EH.lastEvent,
            keyName = lastEvent.keyName;

        
        if ((this.vertical && keyName == "Arrow_Up") || 
            (!this.vertical && keyName == "Arrow_Left")) 
        {
            this._selectNextTab(false);
        } else if ((this.vertical && keyName == "Arrow_Down") || 
                   (!this.vertical && keyName == "Arrow_Right"))
        {
            this._selectNextTab(true);
        }

        var matchesCloseTabKey = false;
        var closeTabKeys = this.closeTabKeys;
        if (isc.isAn.Array(closeTabKeys)) {
            for (var i = 0, numCloseTabKeys = closeTabKeys.length; i < numCloseTabKeys; ++i) {
                if (EH._matchesKeyIdentifier(closeTabKeys[i], lastEvent)) {
                    matchesCloseTabKey = true;
                    break;
                }
            }
        }
        if (matchesCloseTabKey) {
            var selectedTab = this.getButton(this.getSelectedTab()),
                tabSet = this.parentElement;
            if (selectedTab != null && tabSet != null) {
                var shouldClose = tabSet.canCloseTab(selectedTab);
                if (shouldClose) {
                    tabSet.closeClick(selectedTab);
                    return false;
                }
            }
        }

        // Always cancel Ctrl+W if focus is within this TabBar. This is because in Chrome,
        // Firefox, and IE on Windows, Ctrl+W will close the current browser tab if not canceled.
        // We don't want users to be focused within a TabBar, press Ctrl+W accidentally on a
        // non-closeable tab and have the browser tab close on them!
        if (EH._matchesKeyIdentifier(this._$ctrlWKey, lastEvent)) {
            return false;
        }
    },

    _selectNextTab : function (forward, start) {
        if (start == null) start = this.getSelectedTab();
        var step = forward ? 1 : -1;
        var target = start;
        do {
            if (target < 0) {
                target = this.buttons.length;
            } else if (target >= this.buttons.length) {
                target = -1;
            }
            target += step;
        } while (target != start && 
            (this.getMember(target) == null || this.getMember(target).isDisabled()));
        if (target != start && this.getMember(target)) {
            this.selectTab(target);
            // Explicitly focus in the tab too, if selection wasn't rejected via a
            // tabDeselected handler.
            if (this.getSelectedTab() == target) {
                var button = this.getMember(target);
                button.focus();
            }
        }
    },

    //>	@attr TabBar.skinImgDir		(SCImgURL : "images/Tab/" : AIRW)
    //			base path for the tab images, if an image-based
    //			tab is being used.
    //		@group skins, files
    //<
    skinImgDir:"images/Tab/",			
										
    // --------------------------------------------------------------------------------------------
    //> @attr tabBar.showMoreTab (boolean : null : IR)
    // Should tabs exceeding +link{moreTabCount} be shown on a "more" tab?
    // <p>
    // This setting is used to emulate an iPhone-style tab bar "more" button.
    // @visibility external
    //<

    //> @attr tabBar.moreTabCount (int : 5 : IR)
    // This property defines the number tab buttons that should be shown before
    // automatically adding a "more" button to handle the remaining tabs. This
    // property is only used when +link{showMoreTab} is enabled.
    // @visibility external
    //<
    moreTabCount:5,

    //> @attr tabBar.moreTab (Tab : null : IR)
    // Tab to show as the "more" tab when +link{showMoreTab} is enabled and the number
    // of tabs to show exceeds +link{moreTabCount}.
    // @visibility external
    //<

    // Baseline
    // --------------------------------------------------------------------------------------------
    
    //> @groupDef baseLine
    // The baseLine is StretchImg that is placed along the edge of the TabBar that borders on
    // the pane, occluding the pane's actual border but matching it exactly.  The selected tab
    // is in front of the baseLine, and the rest are behind it.
    // @visibility external
    //<

    //>	@attr TabBar.baseLineThickness (number : 1 : IR)
    // Thickness of the baseLine, in pixels.  This should be set to match the media specified
    // by +link{baseLineSrc}.  The baseLineThickness also determines the degree of overlap with
    // the TabSet's paneContainer when using decorative edges - see +link{TabSet.paneContainer}
    // for details.
    // 
    // @group baseLine 
    // @visibility external
    //<
    baseLineThickness:1,

    //>	@attr TabBar.baseLineSrc	(SCImgURL : "[SKIN]baseline.gif" : IR)
    // Sets +link{stretchImg.src} for the +link{group:baseLine} StretchImg.
    // @group baseLine 
    // @visibility external
    //<
    baseLineSrc:"[SKIN]baseline.gif",

    //>	@attr TabBar.baseLineCapSize	(number : 2 : IR)
    // Set +link{stretchImg.capSize} for the +link{group:baseLine} stretchImg.
    // @group baseLine
    // @visibility external
    //<
    baseLineCapSize:2,

    // Positioning and Alignment
    // --------------------------------------------------------------------------------------------
    //>	@attr TabBar.tabBarPosition	(Side : isc.Canvas.TOP : IRW)
    // Position of the tabBar in relation to whatever it controls.
    //<
    // Not doc'd, do via TabSet
    tabBarPosition:isc.Canvas.TOP,

    // --------------------------------------------------------------------------------------------
    //>	@attr TabBar.selectedTab		(number : 0 : IR)
    // Index of the initially selected tab.  Settable at initialization only, afterwards, call
    // +link{selectTab}.
    //<
    // Not doc'd, do via TabSet
    selectedTab:0,

    //>	@attr TabBar.defaultTabSize		(number : 80 : IR)
    // Default size (length) in pixels for tabs within this tabBar
    // @visibility external
    //<    
    defaultTabSize:80
										
    //>	@attr	TabBar.tabDefaults		(Tab : 0 : AIR)
    //			Defaults applied to tabs on init.
    //			Note that these are overlaid over the superclass property
    //			toolBar.buttonDefaults.
    //<
    // Null by default - we will set this up in initWidget - this avoids multiple tabBars
    // pointing to the same tabDefaults object
    //tabDefaults:{}

});


isc.TabBar.addMethods({
//>	@method	tabBar.initWidget()	(A)
// Initialize the TabBar object.
// <p>
// Setup special button properties and create the baseLine
//<
initWidget : function () {
    // if the name of the pane property of a tab is specified as a string, check it
    // now, and reassign.
    for (var i = 0; i < this.tabs.length; i++) {
        var pane = this.tabs[i].pane;
    	
        if (isc.isA.String(pane) && isc.isA.Canvas(window[pane])) {
            this.tabs[i].pane = window[pane];
        }
        
    }
    
    // copy tabs over to the buttons array, which is what the superclass uses.
    this.buttons = this.tabs;
    
    if (this.moreTab) {
        this._moreTabIndex = this.buttons.length;
        this.buttons[this._moreTabIndex] = this.moreTab;
    }

    // Note that the order of the tabs can be reversed by setting the 'reverseOrder' property
    // on this tabBar [can be done in tabBarDefaults] if this is zrequired.
    
    // set up the skinImgDir for the baseline
    this.skinImgDir = this.skinImgDir + this.tabBarPosition + "/";
    
    var tabDefaults = this.tabDefaults;
    if (tabDefaults == null) tabDefaults = this.tabDefaults = {};
    
    tabDefaults.focusChanged = function (hasFocus) {
        this.parentElement.tabFocusChanged(this, hasFocus);
    }

    // tabs are created as "buttons" by Toolbar superclass code; to have tabDefaults applied to
    // each button, assign to buttonDefaults.
    // NOTE: if we add properties directly to the buttonDefaults object, we'll side effect all
    // Toolbars
    tabDefaults = this.buttonDefaults = isc.addProperties({}, this.buttonDefaults, tabDefaults);

    // tabs are mutually exclusive
    tabDefaults.actionType = isc.StatefulCanvas.RADIO;
    
    // Default tabs to defaultTabWidth
    if (this.vertical) {
        tabDefaults.defaultHeight = this.defaultTabSize;
    } else {
        tabDefaults.defaultWidth = this.defaultTabSize;
    }
    // .. and allow them to expand to fit content
    tabDefaults.overflow = isc.Canvas.VISIBLE;

    // set tab style information directly on the (presumed) ImgTab, so that it may be
    // overridden by the user in tabProperties.
    tabDefaults.vertical =
        (this.tabBarPosition == isc.Canvas.LEFT || this.tabBarPosition == isc.Canvas.RIGHT);
    
    // skinImgDir: For image based tabs, we need to update the skin img dir to account for
    // tab orientation.
    // Note that we *don't* want per-side media for standard icons like the close icon.
    // Therefore we don't want to modify the skinImgDir if we're using simple tabs.
    // In ImgTabs we handle this by having a separate labelSkinImgDir
    var buttonClass = isc.ClassFactory.getClass(this.buttonConstructor);
    if (buttonClass && buttonClass.isA("ImgTab")) {
        tabDefaults.skinImgDir = buttonClass.getInstanceProperty("skinImgDir") +
            this.tabBarPosition + "/";
    }
    
    // Channel the icon mouseDown event through to the tabIcon click handler
    // (Used for [eg] closing tabs)
    
    tabDefaults.iconMouseDown = this._tabIconClickHandler;
    
    // Override the click and doubleClick handler as necessary to implement title editing
    // Note if _editTabTitle returns false this indicates we're editing the title - in this
    // case suppress any doubleClick etc handler defined by the developer directly on the
    // tab
    tabDefaults.handleDoubleClick = function () {
        var tabSet = this.parentElement.parentElement;
        if (tabSet && tabSet.titleEditEvent == "doubleClick" && tabSet._editTabTitle(this)) return;
        return this.Super("handleDoubleClick", arguments);
    }
    tabDefaults.handleClick = function () {
        var tabSet = this.parentElement.parentElement;
        if (tabSet && tabSet.titleEditEvent == "click" && tabSet._editTabTitle(this)) return;
        return this.Super("handleClick", arguments);
    },

    tabDefaults._generated = true;

    var perSideStyleProperty = this.tabBarPosition + "StyleName";
    if (this[perSideStyleProperty]) this.setStyleName(this[perSideStyleProperty]);

    if (this.tabProperties != null) {
        var props = this.buttonProperties || {};
        this.buttonProperties = isc.addProperties(props, this.tabProperties);
    }

    this.Super(this._$initWidget);

    if (this._baseLine == null) this.makeBaseLine();
},

isShowingMoreTab : function () {
    return (this.showMoreTab &&
        this.moreTab &&
        this._moreTabIndex >= 0 &&
        this.getMembers(this._moreTabIndex).isVisible &&
        this.getMembers(this._moreTabIndex).isVisible()
    );
},

updateMoreTab : function () {
    // If we were initialized without a 'moreTab', this system is essentially disabled- nothing to do here.
    if (this.moreTab == null) return;

    var moreTabIndex = this.buttons.indexOf(this.moreTab);

    

    // Sanity check: moreTab should always be our last button/member if it exists
    if (moreTabIndex != this.buttons.length-1) {
        
        this.buttons.slide(moreTabIndex, this.buttons.length-1);
        this.buttons.reorderMembers(moreTabIndex, this.buttons.length-1);
        moreTabIndex = this.buttons.length-1;
    }

    var moreTabButton = this.getMember(moreTabIndex),
        moreTabVisible = (moreTabButton.visibility != "hidden"),
        showMoreTab = false;
    
    if (this.showMoreTab && this.moreTabCount) {
        var visibleTabCount = 0;
        for (var i = 0; i < this.buttons.length; i++) {
            // this.buttons[i] is the tab config object.
            // We support marking tabs explicitly as 'hidden', in which case we'll hide
            // the corresponding live widget!
            if(!this.buttons[i].hidden) visibleTabCount++;
        }
        // if we have 4 visible tabs and the moreTabCount is 3, show the more tab!
        showMoreTab = (visibleTabCount > (this.moreTabCount+1));
    }

    // Show / hide the moreTabButton
    if (showMoreTab) {
        if (!moreTabVisible) moreTabButton.show();
    } else {
        if (moreTabVisible) moreTabButton.hide();
    }

    // Now hide/show all the other tabs!
    for (var i = moreTabIndex-1; i >=0 ; i--) {
        if (this.buttons[i].hidden) continue;

        var member = this.getMember(i);

        if (showMoreTab && visibleTabCount > this.moreTabCount) {
            if (member.isVisible()) member.hide();
            visibleTabCount --;
        } else {
            if (!member.isVisible()) member.show();
        }
    }

    this._moreTabIndex = showMoreTab ? moreTabIndex : null; 
},


// _tabIconClickHandler - method applied directly to the tabs
_tabIconClickHandler : function () {
    return this.parentElement.tabIconClick(this);
},

tabIconClick : function (tab) {
    var ts = this.parentElement;
    return ts._tabIconClick(tab);
},

// reset any native scroll that occurred on focus if the tabs are taller than
// the available space
tabFocusChanged : function (tab, hasFocus) {
    if (this.tabBarPosition == isc.Canvas.TOP) {
        this.scrollToTop();
    }
    if (this.tabBarPosition == isc.Canvas.BOTTOM) {
        this.scrollToBottom();
    }
    if (this.tabBarPosition == isc.Canvas.LEFT) {
        this.scrollToLeft();
    }
    if (this.tabBarPosition == isc.Canvas.RIGHT) {
        this.scrollToRight();
    }
},


_clearSgwtTabReferences : function () {
    var liveButtons = this.getMembers();
    for (var i = 0; i < liveButtons.length; i++) {
        if (window.SmartGWT.isTab(liveButtons[i].__ref)) {
            liveButtons[i].__ref = null;
            delete liveButtons[i].__module;
        }
    }
},

// helper for tabSet.fixLayout()
_canAdaptWidth : function () {
    var liveButtons = this.getMembers();
    if (!liveButtons) return false;

    for (var i = 0; i < liveButtons.length; i++) {
        if (liveButtons[i].canAdaptWidth) return true;
    }
    return false;
},

// Override to add "more" button and hide buttons that are now on "more" tab
setButtons : function (newButtons) {
    this.Super("setButtons", arguments);
       
    if (isc.Browser.isSGWT) this._clearSgwtTabReferences();
    
    if (this.showMoreTab) this.updateMoreTab();
},

// override makeButton to show the icon for the button
// Also set up locator parent for autoTest APIs
makeButton : function (properties, a,b,c,d) {
    var canClose = this.parentElement.canCloseTab(properties),
        
        properties = isc.addProperties({}, properties, this.getCloseIconProperties(properties, canClose));
    properties.locatorParent = this.parentElement;
    
    if (properties._autoAssignedID) delete properties.ID;

    
    if (properties.canAdaptWidth && isc.Canvas._isStretchSize(properties.width)) {
        properties.overflow = isc.Canvas.HIDDEN;
        properties.autoFit = false;
    }

    // An empty title should not result in an extra spacing that is
    // applied when there is an actual title.
    if (properties.title != null && properties.title == "") properties.title = null;

    if (properties.hidden) {
        properties.visibility = "hidden";
    }
   
    // enableWhen / visibleWhen are handled at the TabSet level - don't allow the
    // button widgets to set these up as simple CanvasWhenRules
    properties.createCanvasWhenRules = false;

    return this.invokeSuper(isc.TabBar, "makeButton", properties, a,b,c,d);
},

getCloseIconProperties : function(properties, canClose) {
    var override = {};
    if (properties.canClose == true || (properties.canClose == null && canClose)) {
        override.icon = (properties.closeIcon || this.parentElement.closeTabIcon);
        override.iconSize = (properties.closeIconSize || this.parentElement.closeTabIconSize);
        // close icon should appear at the end of the tab
        
        override.iconOrientation = "right";
        override.iconAlign = override.iconOrientation;
        
    } else {
        // Explicitly override icon-related properties to the tab properties passed in.
        // This is so we can use TabSet.setCanCloseTab() to toggle the canClose state of a 
        // live Tab without touching any other properties on the live object.
        override.icon = (properties.icon);
        override.iconSize = (properties.iconSize);
        if (properties.iconOrientation != null) override.iconOrientation = properties.iconOrientation;
        if (properties.iconAlign != null) override.iconAlign = properties.iconAlign;
    }
    return override;
},

addTabs : function (tabs, position) {

    if (!position && this.tabBarPosition == isc.Canvas.LEFT) position = 0;
    this.addButtons(tabs, position);
    if (isc.Browser.isSGWT) this._clearSgwtTabReferences();
    
    // Hide any new buttons that belong on "more" tab and show "more" if needed
    if (this.showMoreTab) this.updateMoreTab();

    // ensure the tabs initially show up behind the baseline
    if (this._baseLine != null) {
        this._baseLine.bringToFront();        
        var selectedTab = this.getButton(this.getSelectedTab());
    	if (selectedTab) selectedTab.bringToFront();
    }
},


removeTabs : function (tabs, dontDestroy) {
    // get the list of tab widgets to be removed
    if (tabs == null) return;
    if (!isc.isAn.Array(tabs)) tabs = [tabs];
    var tabWidgets = this.map("getButton", tabs);

    // remove the tabs
    this.removeButtons(tabs);

    if (this.showMoreTab) this.updateMoreTab();

    // destroy each of the buttons we removed; it's appropriate/okay to do this because the buttons
    // were automatically created by this tabBar
    if (!dontDestroy) {
        for (var i = 0; i < tabWidgets.length; i++) {
            if (tabWidgets[i] != null) tabWidgets[i].destroy();
        }
    }
},

reorderTab : function (tab, moveToPosition) {
    var button = this.getButton(tab);
    if (button) {
        this.removeTabs(tab, true);
        this.addTabs(tab, moveToPosition);
    }
},

//> @method tabBar.draw()	(A)
// Extended to do layout and handle the selected tab.
// @group drawing
//<
draw : function (a,b,c,d) {
    arguments.__this = this;

    this.fixLayout();

    this.invokeSuper(isc.TabBar, "draw", a,b,c,d);

    var selectedTab = this.getButton(this.selectedTab);  
    // now that the buttons have all drawn, bring the baseline in front of them, then count on
    // the setSelected() behavior to bring the selected tab in front of the baseLine
    if (selectedTab) {
        
        
        
        if (selectedTab.children && selectedTab.children[0] == this.parentElement.addTabButton) return;
        
        
        if (selectedTab.setSelected) selectedTab.setSelected(true);
    }
},

//> @method tabBar.makeBaseLine()	(A)
//  The baseline exists to create the appearance that one of the tabs is part of the pane whereas
//  the other tabs are behind the pane.
//
//	The baseline is an image that runs along the edge of the TabBar that borders on the pane,
//  occluding the pane's actual border but matching it exactly.  The selected tab is in front
//  of the baseline, and the rest are behind it.
//<


makeBaseLine : function () {
    var barPos = this.tabBarPosition,
        snapTo,
        baseLineWidth,
        baseLineHeight;

    if (barPos === isc.Canvas.TOP) {
        snapTo = "BL";
        baseLineWidth = "100%";
        baseLineHeight = this.baseLineThickness;
    } else if (barPos === isc.Canvas.RIGHT) {
        snapTo = "TL";
        baseLineWidth = this.baseLineThickness;
        baseLineHeight = "100%";
    } else if (barPos === isc.Canvas.BOTTOM) {
        snapTo = "TL";
        baseLineWidth = "100%";
        baseLineHeight = this.baseLineThickness;
    } else {
        
        snapTo = "TR";
        baseLineWidth = this.baseLineThickness;
        baseLineHeight = "100%";
    }

    // create the baseline stretchImg and add as child.
    this._baseLine = this.addAutoChild("baseLine", {
        width: baseLineWidth,
        height: baseLineHeight,
        vertical: (barPos === isc.Canvas.LEFT || barPos === isc.Canvas.RIGHT),
        skinImgDir:this.skinImgDir,
        src:this.baseLineSrc,
        capSize:this.baseLineCapSize,
        imageType:isc.Img.STRETCH,
        overflow: "hidden", // since the baseline can be a Canvas if it doesn't need to display images
        addAsChild:true,
        snapTo: snapTo
    }, isc.StretchImg);
    
    this.ignoreMemberZIndex(this._baseline);
},




//> @method tabBar.fixLayout()	(A)
//  Places the baseLine on the side of the TabBar adjacent to the tabbedPane, according to which
//  side the tabs are on.
//<
fixLayout : function () {
    var bl = this._baseLine;

    if (bl == null) return;

    // Note: It is important to pass true to getScrollWidth/Height(). Otherwise, the initial
    // scrollWidth/Height can be too small, and the baseLine won't span the entire scrollWidth/Height
    // of the tabBar.
    var barPos = this.tabBarPosition;
    if (barPos === isc.Canvas.TOP) {
        //bl.setRect(0, null, this.getScrollWidth(true), null);
        bl.setWidth(Math.max(this.getScrollWidth(true), 1));
    } else if (barPos === isc.Canvas.RIGHT) {
        //bl.setRect(null, 0, null, this.getScrollHeight(true));
        bl.setHeight(Math.max(this.getScrollHeight(true), 1));
    } else if (barPos === isc.Canvas.BOTTOM) {
        //bl.setRect(0, null, this.getScrollWidth(true), null);
        bl.setWidth(Math.max(this.getScrollWidth(true), 1));
    } else {
        
        //bl.setRect(null, 0, null, this.getScrollHeight(true));
        bl.setHeight(Math.max(this.getScrollHeight(true), 1));
    }

    
}, 

// fix layout on a change of size
layoutChildren : function (a,b,c,d) {
    this.invokeSuper(isc.TabBar, "layoutChildren", a,b,c,d);
    this.fixLayout();
},

//> @method tabBar.buttonSelected()	(A)
// This method overrides the toolBar's buttonSelected method.
// Differences are as follows:
//   - assumes tab is of type "radio", as all tabBar tabs are set to be a radiogroup
//   - handles z-axis reorderings of tabs and baseLine
//   - overlaps tabs by expanding and contracting them
//
// Note: we assume here that buttonSelected is only fired when the button is initially
//       set to "selected." Repeated clicks should not fire this method.
//       This assumption can be overridden by setting allowButtonReselect:true.
//
// @param tab (Tab)  tab that has been selected.
//<
buttonSelected : function (tab) {

    this.ignoreMemberZIndex(tab);

    // bring tab and label to front.	
    tab.bringToFront();

    // store the currently selected tab as the lastSelectedButton.
    this.lastSelectedButton = tab;

    // Make sure we never tab to an unselected button
    // Note that deselection of the other tabs is handled by built in Toolbar / Radiogroup
    // behavior.
    this._updateFocusButton(this.lastSelectedButton);
},

// Override buttonDeselected() to send the tab to the back (behind the baseLine image)
buttonDeselected : function (tab) {
    tab.sendToBack();
    this.stopIgnoringMemberZIndex(tab);
},

//> @method tabBar.getSelectedTab()	(A)
// Get the tab object currently selected.
// @return (Tab) tab object
//<
getSelectedTab : function () {
    return this.getButtonNumber(this.getSelectedButton());
},

//> @method tabBar.selectTab()	
// Select a tab
// @param  tabNum  (number)    index of tab to select
// @visibility external
//<
selectTab : function (tabNum) {    
    this.selectedTab = tabNum;
    this.selectButton(tabNum);
},

// Override setupButtonFocusProperties to ensure that this.selectedTab is the initial
// focusButton (will then be selected by _updateFocusButton())
setupButtonFocusProperties : function () {
    // sync up the focus with the selection
    
    this._updateFocusButton(this.getButton(this.selectedTab));
    return this.Super("setupButtonFocusProperties", arguments);

},

_scrollForward : function (backward, animated) {
    if (this.overflow == isc.Canvas.VISIBLE || !this.members || this.members.length == 0) return;
    var nextTab, nextTabEdge;
    
    // If we're in the process of scrolling to a tab - jump straight to the one after it
    if (this._scrollingToTab != null) {
        nextTab = this.members[this._scrollingToTab + (backward ? -1 : 1)];
        if (nextTab == null) {
            return;
        }
        nextTabEdge = (backward ? (this.vertical ? nextTab.getTop() : nextTab.getLeft())
                                : (this.vertical ? nextTab.getBottom() : nextTab.getRight()));
    } else {
        
        var scrollSize = (this.vertical ? this.getScrollHeight() : this.getScrollWidth());
        if (scrollSize <= (this.vertical ? this.getViewportHeight() : this.getViewportWidth())) 
            return;
    
        var scrollStart = (this.vertical ? this.getScrollTop() : this.getScrollLeft()),
            viewSize = (this.vertical ? this.getViewportHeight() : this.getViewportWidth());
    
        
        var scrollThreshold = 5;        
        for (var i = 0; i < this.members.length; i++) {
            nextTab = (backward ? this.members[this.members.length - (i+1)] : this.members[i]);
            // Note if the member order is reversed we look at the left where normally
            // we'd look at the right, etc.
            var clipBackward = backward;
            if (this.reverseOrder) clipBackward = !clipBackward
            nextTabEdge = (clipBackward ? (this.vertical ? nextTab.getTop() : nextTab.getLeft())
                                    : (this.vertical ? nextTab.getBottom() : nextTab.getRight()));
                                    
            // RTL mode - have to map from specified left (negative value) to scroll position
            // (positive value)
            if (!this.vertical && this.isRTL()) {
                nextTabEdge = this._shiftScrollLeftOrigin(nextTabEdge, false);
            }                                   
            // Determine which tab is currently clipped
            var clipped = clipBackward ? (nextTabEdge + scrollThreshold < scrollStart) 
                                   : (nextTabEdge - scrollThreshold > (scrollStart + viewSize));
            if (clipped) break;
        }
    }  
    
    if (animated) {
        this._scrollingToTab = this.members.indexOf(nextTab);
        this.scrollTabIntoView(nextTab, backward, true, "this._completeScroll(" + this._scrollingToTab + ")");
    } else this.scrollTabIntoView(nextTab, backward);
},

_completeScroll : function (scrolledToTab) {
    if (this._scrollingToTab == scrolledToTab) delete this._scrollingToTab;
},

//> @method  tabBar.scrollTabIntoView()  
// If a tab is not currently visible for this tab-bar, scroll it into view.
// Can specify where you want the tab to appear.
// edge it was clipped on.
// @param   tab (number | ImgTab)  tab to scroll into view (or index of tab to scroll into view)
// @param   [start] (boolean) Should the tab be scrolled to the start or end of the viewport?
//                          If not specified the tab will be scrolled to whichever end it is
//                          currently clipped by.
// @param [animated] (boolean) If true, do an animated scroll.
// @param [callback] (Callback) If specified this will fire when the tab has been scrolled into
//                              view. Will be synchronously fired if this is not an animated
//                              scroll, or if the tab is already in view, so no scrolling occurs.
//                              The callback takes a single argument, <code>tab</code> - the tab
//                              scrolled into view.
//<
scrollTabIntoView : function (tab, start, animated, callback) {

    
    var tabNum;
    if (isc.isA.Number(tab)) {
        tabNum = tab;
        tab = this.members[tab];
    } else {
        tabNum = this.members.indexOf(tab);
    }
    if (!tab) return;
    
    // if _layoutIsDirty or _layoutInProgress, we can't guarantee that the tab is in the right place
    // (EG the tab may be currently drawn offscreen).
    // In this case wait for the layout to complete
    if (this._layoutIsDirty || this._layoutInProgress) {
        this._scrollOnLayoutComplete = [tab,start,animated,callback];
        return;
    }
    var rect = tab.getRect(),
        xPos, yPos;

    // If not pased "start" parameter, we'll scroll the tab to the start of our viewport
    // iff its clipped to the left, otherwise to the end of our viewport.
    var vertical = this.vertical;
    if (start == null) {
        if (tabNum == 0) start = true;
        else if (tabNum == (this.members.getLength() -1)) start = false;
        else {
            if (vertical) {
                if (this.getScrollTop() > rect[1]) start = true;
                else start = false;
            } else {
                if (this.getScrollLeft() > rect[0]) start = true;
                else start = false;
            }
        }
    }
        
    if (vertical) {
        yPos = (start ? "top" : "bottom");
        // don't scroll horizontally - leave at zero
        xPos = "left";
        rect[2] = 0;
    } else {
        xPos = (start ? "left" : "right");
        // Don't scroll vertically
        yPos = "top";
        rect[3] = 0;
    }
    // When scrolling to the first tab, actually scroll to 0,0, rather than the edge of the
    // tab.
    if (tabNum == 0)  rect[0] = rect[1] = this.isRTL() ? this.getScrollWidth() : 0;
    this.scrollIntoView(rect[0], rect[1], rect[2], rect[3], xPos, yPos, animated, 
        {target:this, methodName:"scrolledTabIntoView", args:[tab, callback]},
        null, // alwaysCenter
        null, // source
        this  // target (avoid scrolling ancestors)
    );
},

// Helper to fire the explicit callback passed to scrollTabIntoView.
scrolledTabIntoView : function (tab, scrollCallback) {
    if (scrollCallback != null) {
        this.fireCallback(scrollCallback, "tab", [tab]);
    }
},

// Override _layoutChildrenDone -- if we have a pending scrollTabIntoView, allow it to proceed
_layoutChildrenDone : function (reason, a,b,c,d) {
    this.invokeSuper(isc.TabBar, "_layoutChildrenDone", reason, a,b,c,d);
    if (this._scrollOnLayoutComplete != null) {
        var args = this._scrollOnLayoutComplete;
        this.scrollTabIntoView(args[0],args[1],args[2],args[3]);
        delete this._scrollOnLayoutComplete;
    }
},

scrollForward : function (animated) {
    this._scrollForward(false, animated);
},

scrollBack : function (animated) {
    this._scrollForward(true, animated);
},

// If there is an "add icon", it counts as a tab. But if we have that
// icon we cannot consider a valid position any beyond that point.
dragReorderMove : function () {
    var currentPosition = this.getDropPosition();
    var firstInvalidPos = this.canAddTabs ? this.tabs.length - 1 : this.tabs.length;
    if (this.canAddTabs && currentPosition > firstInvalidPos) {
        return this.ns.EH.STOP_BUBBLING;
    }
    
    return this.Super("dragReorderMove", arguments);
},

// If there is an "add icon", it counts as a tab. But if we have that
// icon we cannot consider a valid position any beyond that point.
dragReorderStop : function () {
    var currentPosition = this.dragCurrentPosition;
    var firstInvalidPos = this.canAddTabs ? this.tabs.length - 1 : this.tabs.length;
    if (this.canAddTabs && currentPosition > firstInvalidPos) {
        return this.ns.EH.STOP_BUBBLING;
    }
    return this.Super("dragReorderStop", arguments);
}

});

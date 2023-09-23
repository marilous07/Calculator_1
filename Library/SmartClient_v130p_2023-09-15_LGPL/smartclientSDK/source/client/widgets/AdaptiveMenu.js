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
//> @class AdaptiveMenu
// A menu that can either show its menu options inline, or show them via a drop-down,
// depending on available space in the surrounding +link{Layout} or +link{ToolStrip}.
// <p>
// See +link{canvas.canAdaptWidth,canAdaptWidth} for background on adaptive layout.
//
// @inheritsFrom Layout
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.ClassFactory.defineClass("AdaptiveMenu", "Layout");

isc.AdaptiveMenu.addProperties({

    overflow: "hidden",

    //> @attr adaptiveMenu.partialInlining (boolean : true : IRW)
    // If there is not enough space to show the full set of items as buttons inline, how
    // should the Adaptive menu behave?<br>
    // If <code>showPartialInlining</code> is true, the menu will render as many items as
    // inline buttons as can be shown in the available space, plus the menu button to 
    // access the remaining items.<br>
    // If false, it will show just the menu button.
    // <P>
    // If there is enough space to show the full set of items inline they will be shown
    // inline regardless of this property.
    //
    // @visibility external
    //<
    partialInlining: true,

    //> @attr adaptiveMenu.inlinePlacement (Alignment | VerticalAlignment : null : IR)
    // Placement of inlined items relative to the main +link{menuButton}.  Default is to place items
    // above the menu if the parent is a Layout with +link{layout.orientation,vertical orientation},
    // otherwise to the left of the <code>menuButton</code> (or right if the +link{Page.isRTL,page is
    // RTL (right-to-left)}.
    // <p>
    // A setting of "center" is invalid and will cause a warning and be ignored
    //
    // @visibility external
    //<

    //> @attr menuItem.showIconOnlyInline (boolean : null : IR)
    // When used in an +link{AdaptiveMenu}, should this MenuItem show only it's
    // +link{menuItem.icon,icon} when displayed inline?
    //
    // @visibility external
    //<

    //> @attr adaptiveMenu.showIconOnlyInline (boolean : false : IR)
    // Default setting for +link{menuItem.showIconOnlyInline}.  Individual items can set
    // <code>showIconOnlyInline</code> to override this setting.
    //
    // @visibility external
    //<
    showIconOnlyInline: false,

    //> @attr adaptiveMenu.items (Array of MenuItem : null : IRW)
    // MenuItems to be show either inline or as a drop-down +link{Menu}.
    // <p>
    // When shown inline, items are rendered as different +link{AutoChild} according to the
    // settings on the MenuItem:
    // <ul>
    // <li> normal MenuItems render as the +link{adaptiveMenu.inlineMenuItem}, a +link{ToolStripButton} AutoChild
    // <li> MenuItems that have submenus render as the +link{adaptiveMenu.inlineSubmenuItem}, a
    //      +link{MenuButton} AutoChild
    // <li> MenuItems with +link{menuItem.showIconOnlyInline,showIconOnlyInline} set render as the
    //      +link{adaptiveMenu.inlineImgButton}, a +link{ToolStripButton} AutoChild
    // <li> MenuItems where +link{MenuItem.embeddedComponent} has been specified will have the
    //      embedded component displayed directly instead (no AutoChild involvement here).  If the
    //      control should have different appearance when inlined vs embedded in the menu, one way
    //      to achieve this is to detect whether the parent is a Menu when it is drawn.
    // </ul>
    //
    // @setter setItems (see +link{adaptiveMenu.setItems()})
    // @visibility external
    //<

    //> @method adaptiveMenu.setItems()
    //
    // @param items (Array of MenuItem | MenuItem) array of menuItems to replace current menuItems
    //
    // @visibility external
    //<
    setItems : function (items) {
        return this.setData(items);
    },
    
    setData : function (items) {
        this.Super("setData");

        this.inlinedCount = 0;
        this.inlinedMax = 0;
        this.removedMembers = 0;

        // Now remove all members and the menuButton child
        this.setMembers([]);
        
        if (this.menuButton) this.menuButton=undefined;

        // Remove current menu entries
        this.menu = null;
        
        this.items = items;
        this.data = items;

        // Used to notify layoutChildren() that it must create both inlined items and MenuButton
        this._needsInitialization = true;
        
        // Refresh
        this.resizeBy(1, 1); this.resizeBy(-1,-1);        // Really ugly, but works
    },

    //> @attr adaptiveMenu.menu (AutoChild Menu : null : IR)
    // Instance of the normal (non-Adaptive) +link{Menu} class used to show items that do not fit inline.
    //
    // @visibility external
    //<
    menuDefaults: {
        _constructor: "Menu"
    },

    //> @attr adaptiveMenu.menuButton (AutoChild MenuButton : null : R)
    // +link{MenuButton} used as a drop-down control for showing any items of the menu that are not
    // displayed inline.
    //
    // @visibility external
    //<
    menuButtonConstructor: "ToolStripMenuButton",
    menuButtonDefaults: {
        overflow: "visible",
        visibility: "display"
    },

    //> @attr adaptiveMenu.menuButtonTitle (HTMLString : null : IR)
    // Title used for the +link{menuButton}.
    //
    // @visibility external
    //<

    //> @attr adaptiveMenu.menuButtonIcon (SCImgURL : null : IR)
    // Icon used for the +link{menuButton}.  Default of null means to use the default for the
    // +link{MenuButton} class.
    //
    // @visibility external
    //<

    //> @attr adaptiveMenu.inlineMenuItem (MultiAutoChild ToolStripButton : null : R)
    // +link{MultiAutoChild} used to create inline menu items.
    // <p>
    // The +link{MenuItem.icon} and +link{MenuItem.title} will be rendered via +link{Button.icon} and
    // +link{Button.title} respectively; other +link{MenuItem} appearance-related properties do not
    // apply.
    //
    // @visibility external
    //<
    inlineMenuItemDefaults: {
        _constructor: "ToolStripButton",
        width: 1,
        visibility: "hidden",
        wrap: false
    },

    //> @attr adaptiveMenu.inlineSubmenuItem (MultiAutoChild IconMenuButton : null : R)
    // +link{MultiAutoChild} used to create inline menu items for menu items that have a submenu.
    // <p>
    // The +link{MenuItem.icon} and +link{MenuItem.title} will be rendered via
    // +link{IconButton.icon} and +link{Button.title} respectively; other +link{MenuItem}
    // appearance-related properties do not apply.
    //
    // @visibility external
    //<
    inlineSubmenuItemDefaults: {
        _constructor: "IconMenuButton",
        width: 1,
        visibility: "hidden",
        wrap: false
    },

    //> @attr adaptiveMenu.showInlineSeparators (boolean : null : IR)
    // Whether +link{toolStripSeparator,separators} should be shown for inline menu items. 
    // True by default for horizontal +link{layout.orientation,orientation}, false for vertical.
    //
    // @visibility external
    //<

    //> @attr adaptiveMenu.separator (MultiAutoChild ToolStripSeparator : null : R)
    // +link{MultiAutoChild} used to create separators if +link{showInlineSeparators} is enabled.
    //<
    separatorDefaults: {
        isSeparator: true
    },
    
    //> @attr adaptiveMenu.inlineImgButton (MultiAutoChild ImgButton : null : R)
    // +link{ToolStripButton} to display when +link{showIconOnlyInline} is set for one +link{MenuItem}
    //
    // @visibility external
    //<
    inlineImgButtonDefaults: {
        _constructor: "ToolStripButton",
        width: 1,
        title: undefined,
        visibility: "hidden",
        wrap: false
    }
});

// add instance methods
isc.AdaptiveMenu.addMethods({

    initWidget : function () {
        this.inlinedCount = 0;
        this.removedMembers = 0;

        if (this.vertical) {
            this.canAdaptHeight = true;
            if (this.showInlineSeparators == undefined) this.showInlineSeparators = false;
        } else {
            this.canAdaptWidth = true;
            if (this.showInlineSeparators == undefined) this.showInlineSeparators = true;
            // For H-Layouts perform a horizontal animation effect when showing / hiding
            this.animateMemberEffect = {effect:"slide", startFrom:"L", endAt:"L"};
        }

        // Check inlinePlacement: A setting of "center" is invalid and will cause a warning and be ignored
        if (this.inlinePlacement == "center") {
            isc.logWarn("Center is an invalid value for inlinePlacement in adaptiveMenu, ignoring this setting.");
            this.inlinePlacement = undefined;
        }
        
       // call the superclass function
       this.Super("initWidget",arguments);
    },
    
    createChildren : function () {
        for (var i = 0; i < this.items.getLength(); i++) {
            var item = this.items.get(i);
            var showIconOnlyInline =
                item.showIconOnlyInline == undefined ? this.showIconOnlyInline : item.showIconOnlyInline;

            var lastMember;

            if (item.embeddedComponent) {
                lastMember = item.embeddedComponent;
                lastMember.visibility = "hidden";
            } else if (showIconOnlyInline) {
                lastMember =  this.createAutoChild("inlineImgButton", {
                    icon: item.icon,
                    click: item.click
                });
            } else if (item.submenu != undefined) {
                var menu = this.createAutoChild("inlineSubmenu", {data: item.submenu}, isc.Menu);
                lastMember = this.createAutoChild("inlineSubmenuItem", {
                    icon: item.icon,
                    title: item.title,
                    click: item.click,
                    menu: menu
                });
            } else {
                lastMember = this.createAutoChild("inlineMenuItem", {
                    icon: item.icon,
                    title: item.title,
                    click: item.click
                });
            }
            this.addMember(lastMember);
        }
        this.inlinedMax = this.items.getLength();

        if (!this.menuButton) this.createMenuButton();

        this._needsInitialization = false;
    },

    // Lazily create and populate the menu
    populateMenu : function () {
        if (!this.menuButton.menu) {
            var data = [];
            var j = 0;
            for (var i = 0; i < this.items.getLength(); i++) {
                data[j++] = this.items.get(i);
                if (this.showInlineSeparators && i < this.items.getLength()-1) data[j++] = this.createAutoChild("separator");
            }

            this.menu = this.createAutoChild("menu", {
                data: data
            });

            this.menuButton.menu = this.menu;
        }

        return this.menu;
    },

    createMenuButton : function () {
        // MenuButton autochild should be just barely wider than its icon by default
        var mbWidth = 1;
        if (this.menuButtonIcon) mbWidth = this.menuButtonIcon.width + 1;
        
        this.addAutoChild("menuButton", {
                title: this.menuButtonTitle,
                icon: this.menuButtonIcon,
                width: mbWidth
            });
        if (!this.menuButton.isDrawn()) this.menuButton.draw();

        // Observe menuButton, to avoid creating Menu until drop-down is clicked
        this.observe(this.menuButton, "click", function () {
            // Create and draw the menu, if not created before
            this.populateMenu();
        });
    },

    // Avoid creating MenuButton or any inlineItem AutoChildren
    // until first call to layoutChildren()
    layoutChildren : function (reason) {
        this.Super("layoutChildren");

        if (reason==this._$initial_draw) this._needsInitialization = true;
        if (this._needsInitialization) this.createChildren();
    },

    //> @method AdaptiveMenu.setPartialInlining()
    //
    // @param partialInlining (boolean) 
    // @visibility external
    //<
    setPartialInlining : function (partialInlining) {
        this.partialInlining = partialInlining;
        
        // To refresh
        if (!this.vertical) this.adaptWidthBy(0, this.getVisibleWidth());
        else this.adaptHeightBy(0, this.getVisibleHeight());
    },

    adaptWidthBy: function (pixelDifference, unadaptedWidth) {
        return this._adaptDimensionBy("Width", pixelDifference, unadaptedWidth);
    },

    adaptHeightBy: function (pixelDifference, unadaptedHeight) {
        return this._adaptDimensionBy("Height", pixelDifference, unadaptedHeight);
    },

    // get dimension of the next item to be inlined, by drawing it if needed
    // axis needs to be either "Width" or "Height" case sensitive.
    getNextInlineItemDimension : function (dimension) {
        var itemPosition = isc.NumberUtil.clamp(this.inlinedCount, 0, this.inlinedMax);
        var item = this.items.get(this.inlinedCount);
        var member = this.members[itemPosition];
        var component = item && item.embeddedComponent ? item.embeddedComponent : member;

        if (!component.isDrawn()) component.draw();
        var isLast = itemPosition === this.inlinedMax - 1;
        return component["getVisible" + dimension]() + (isLast ? -this["minimal" + dimension] : 0);
    },

    // get width of the next item to be inlined, by drawing it if needed
    getNextInlinedItemWidth : function () {
        return this.getNextInlineItemDimension("Width");
    },
    
    // get height of the next item to be inlined, by drawing it if needed
    getNextInlinedItemHeight : function () {
        return this.getNextInlineItemDimension("Height");
    },
    
    // remove an inlined item - show menu button if appropriate
    // In fact we do not remove inlined, just move from one array to another
    removeInlinedItem : function () {
        var currentMenu = this.populateMenu();
        if (!currentMenu) {
            return;
        }

        if (currentMenu.getTotalRows() === 0) {
            this.menuButton.show();
        }

        if (this.inlinedCount === 0) {
            return;
        }

        if (this.showInlineSeparators && currentMenu.data.getLength() > 0) {
            currentMenu.data.addAt({isSeparator: true}, 0);
        }

        this.inlinedCount--;

        var item = this.items.get(this.inlinedCount);
        var member = this.members[this.inlinedCount];
        var component = item && item.embeddedComponent ? item.embeddedComponent : member;
        component.hide();

        // If this inlined item has an embedded component, lets make sure we remove it as a member
        // otherwise just hide() the member.
        if (item && item.embeddedComponent) {
            this.removeMember(member);
            this.removedMembers++;
        }

        currentMenu.data.addAt(item, 0);

        // If the item we just added was an embedded component, lets tell the menu to update it's
        // record components.
        if (item && item.embeddedComponent) {
            if (item.embeddedComponent._snapTo) {
                item.embeddedComponent.setSnapTo(item.embeddedComponent._snapTo);
                delete item.embeddedComponent._snapTo;
            }

            currentMenu.updateRecordComponents();
        }
    },

    // add an inlined item - hide menu button if appropriate
    addInlinedItem : function () {
        var currentMenu = this.populateMenu();

        if (!currentMenu) {
            return;
        }

        var itemRemovedFromMenu = currentMenu.data.removeAt(0);

        if (this.showInlineSeparators && currentMenu.data.getLength() > 0) {
            currentMenu.data.removeAt(0);
        }

        // If the menu item we just removed has an embedded component, lets ensure that record
        // components are updated on the menu.
        if (itemRemovedFromMenu && itemRemovedFromMenu.embeddedComponent) {
            currentMenu.updateRecordComponents();

            // We need to tell the menu to redraw here, this will update the markup in order to
            // be able to add the embedded component back to the AdaptiveMenu later on.
            if (currentMenu.isDrawn()) {
                currentMenu.redraw();
            }
        }

        // If there are no items left in the menu, lets hide the menu button.
        if (currentMenu.getTotalRows() === 0) {
            this.menuButton.hide();
        }

        var itemToAdd = this.items.get(this.inlinedCount);

        if (itemToAdd && itemToAdd.embeddedComponent) {
            if (itemToAdd.embeddedComponent.snapTo) {
                itemToAdd.embeddedComponent._snapTo = itemToAdd.embeddedComponent.snapTo;
                delete itemToAdd.embeddedComponent.snapTo;
            }

            this.addMember(itemToAdd.embeddedComponent, this.inlinedCount);
            this.removedMembers = isc.NumberUtil.clamp(this.removedMembers - 1, 0, this.inlinedMax);
        }

        this.members[this.inlinedCount].show();

        this.inlinedCount++;
    },

    _adaptDimensionBy : function (dimension, pixelDifference, unadaptedValue) {
        if (this["minimal" + dimension] == null && this.menuButton) {
            this["minimal" + dimension] = this.menuButton["getVisible" + dimension]();
        }

        // all non-hidden children are drawn; expected height is sum of their Heights
        var expectedDimension = 0;  // Current Height of all members, included menu if visible
        var inlinedDimension = 0;   // Current Height of all inlined elements, visible or not, menu excluded
        for (var i = 0; i < this.inlinedMax; i++) {
            var item = this.items.get(i);
            var member = this.members[i];
            var component = item && item.embeddedComponent ? item.embeddedComponent : member;

            if (component !== this.menuButton) {
                if (!component.isDrawn()) {
                    component.draw();
                }

                inlinedDimension += component["getVisible" + dimension]();
            }

            if ((component && component.visibility === "hidden") ||
                (item && item.embeddedComponent && !item.embeddedComponent.isVisible()))
            {
                continue;
            }

            expectedDimension += component["getVisible" + dimension]();
        }

        // calculate desired Height based on overflow/surplus and unadapted Height;
        // if desired Height differs from the expected, add/remove inlined items
        var desiredDimension = unadaptedValue + pixelDifference;

        if (this.inlinedCount !== this.inlinedMax) {
            desiredDimension -= this["minimal" + dimension];
        }

        if (!this.partialInlining) {
            if (inlinedDimension > desiredDimension) {
                // Remove all inlined
                while (this.inlinedCount > 0) {
                    this.removeInlinedItem();
                }
                return this.menuButton["getVisible" + dimension]() - unadaptedValue;
            }
        }

        if (desiredDimension < expectedDimension) {
            // remove inlined items if we have an overflow
            var itemCount = isc.NumberUtil.clamp(this.inlinedCount + this.removedMembers, 0, this.inlinedMax);
            while (itemCount > 0 && expectedDimension > desiredDimension) {
                this.removeInlinedItem();
                expectedDimension -= this.getNextInlineItemDimension(dimension);
            }
        } else if (desiredDimension > expectedDimension) {
            var delta;
            // add inlined items if we have surplus space
            while (this.inlinedCount < this.inlinedMax &&
            expectedDimension + (delta = this.getNextInlineItemDimension(dimension)) <= desiredDimension)
            {
                this.addInlinedItem();
                expectedDimension += delta;
            }
        }

        return pixelDifference;
    }
});

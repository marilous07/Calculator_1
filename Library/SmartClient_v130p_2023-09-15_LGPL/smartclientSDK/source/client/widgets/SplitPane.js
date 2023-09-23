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
//> @type CurrentPane
// Possible values for the current pane showing in a +link{SplitPane}.  See
// +link{SplitPane.currentPane} for details.
// @value "navigation" +link{SplitPane.navigationPane} is the most recently shown
// @value "list" +link{SplitPane.listPane} is the most recently shown
// @value "detail" +link{SplitPane.detailPane} is the most recently shown
// @visibility external
//<

//> @type NavigationMethod
// Method of, or reason for, navigation between panes.
// @value "backClick" a "back" +link{NavigationButton} has been clicked
// @value "sideClick" a side panel +link{NavigationButton} has been clicked
// @value "programmatic" application code called
//                       +link{splitPane.setCurrentPane(),setCurrentPane()},
//                       +link{splitPane.showNavigationPane(),showNavigationPane()},
//                       +link{splitPane.showListPane(),showListPane()},
//                       +link{splitPane.showDetailPane(),showDetailPane()}, etc.
// @value "navigatePane" application code directly called
//                       +link{splitPane.navigatePane(),navigatePane()}
// @value "selectionChanged" a seletion change automatically called
//                           +link{splitPane.navigatePane(),navigatePane()}
// @value "historyCallback" browser navigation triggered +link{SplitPane} navigation
// @visibility external
//<


isc.defineClass("SplitPanePagedPanel", "Canvas").addProperties({
    overflow: "hidden",
    backgroundColor: "#ffffff",
    // animations brutally slow on high end (circa Q2 2014) WinPhone hardware
    animateTransitions: !isc.Browser.isMobileIE,
    skinUsesCSSTransitions: false,
    animateScrollDuration: 350,

    // All of the pages of this SplitPanePagedPanel are added as children to pagesContainer.
    // The pagesContainer has overflow:"visible" so that all of the pages are visible, but
    // clipped by the SplitPanePagedPanel handle. The animated page change transitions are
    // implemented by translating the entire pagesContainer if CSS3 transitions are supported;
    // otherwise, animateMove() is used as a fall-back.
    pagesContainerBaseStyle: "splitPanePagedPanelPagesContainer",
    pagesContainerDefaults: {
        width: "100%",
        height: "100%",
        overflow: "visible",

        _getTranslateX : function () {
            var creator = this.creator;
            if (!creator.animateTransitions || !isc.Browser._supportsCSSTransitions || 
                !creator.skinUsesCSSTransitions) 
            {
                return null;
            } else {
                var currentPage = creator.currentPage,
                    left;
                if (currentPage >= 0) {
                    left = -(creator.isRTL() ? creator.pages.length - 1 - currentPage : 
                             currentPage) * creator.getInnerWidth();
                } else {
                    left = 0;
                }
                return left;
            }
        },

        getTransformCSS : function () {
            var left = this._getTranslateX();
            if (left == null) return null;

            // Android 2.x does not support 3D transforms.
            // http://caniuse.com/transforms3d
            return ";" + isc.Element._transformCSSName + ": translateX(" + left + "px);";
        },

        
        scrollIntoView : function (x, y) {
            
            if (x != null) {
                var left = this._getTranslateX();
                if (left != null) x += left;
            }
            return this.Super("scrollIntoView", arguments);
        },

        _transitionEnded : function (transitionRemoved) {
            var creator = this.creator;

            if (!transitionRemoved) delete creator._animating;
            this._enableOffsetCoordsCaching();

            
            var pages = creator.pages,
                currentPage = creator.currentPage;
            for (var i = 0, len = pages.length; i < len; ++i) {
                if (i != currentPage) pages[i].setVisibility(isc.Canvas.HIDDEN);
            }

            var scrollFinishedCallback = creator._scrollFinishedCallback;
            if (scrollFinishedCallback != null) {
                delete creator._scrollFinishedCallback;
                creator.fireCallback(scrollFinishedCallback);
            }

            delete creator._animating;

            
        },

        handleTransitionEnd : function (event, eventInfo) {
            // Since 'transitionend' bubbles, need to make sure that it's our transition that
            // ended, not a descendant's.
            if (eventInfo.target === this) {
                
                this._transitionEnded(false);
            }
        },

        transitionsRemoved : function () {
            var creator = this.creator;
            if (isc.Browser._supportsCSSTransitions && creator.skinUsesCSSTransitions && creator._animating) {
                this._transitionEnded(true);
            }
        }
    },

    //> @attr splitPanePagedPanel.pages (Array of Canvas : [] : IRW)
    //<
    //pages: [],

    //> @attr splitPanePagedPanel.currentPage (int : -1 : IRW)
    // Index of the current page.
    //<
    currentPage: -1,

    autoChildren: ["pagesContainer"],


initWidget : function () {
    this.Super("initWidget", arguments);
    this.addAutoChild("pagesContainer", {
        styleName: this.pagesContainerBaseStyle
    });
    
    if (isc.Browser.isIPhone && this.animateTransitions && isc.Browser._supportsCSSTransitions && this.skinUsesCSSTransitions) {
        this._orientationChangeEventID = isc.Page.setEvent("orientationChange", this);
    }

    if (this.pages == null) this.pages = [];
    else this._addPagesToPagesContainer(this.pages);

    this.currentPage = Math.min(Math.max(0, this.currentPage), this.pages.length - 1);
    this._scrollToPage(-1);
},

destroy : function () {
    if (this._orientationChangeEventID != null) {
        isc.Page.clearEvent("orientationChange", this._orientationChangeEventID);
        delete this._orientationChangeEventID;
    }
    this.Super("destroy", arguments);
},

pageOrientationChange : function () {
    
    if (isc.Browser.isIPhone && this.animateTransitions && isc.Browser._supportsCSSTransitions && this.skinUsesCSSTransitions) {
        var pagesContainer = this.pagesContainer;
        
        if (pagesContainer.isDrawn() && pagesContainer.isVisible()) {
            pagesContainer.markForRedraw();
        }
    }
},


_needHideUsingDisplayNone : function () {
    return (isc.Browser.isAndroid && isc.Browser.isChrome) || this.Super("_needHideUsingDisplayNone", arguments);
},

_scrollToPage : function (prevCurrentPage, immediate, scrollFinishedCallback) {
    

    if (this.pagesContainer == null) return;
    immediate = !this.animateTransitions || immediate || prevCurrentPage < 0 || !this.isVisible();

    var currentPage = this.currentPage;

    var pages = this.pages;
    if (currentPage < 0 || immediate) {
        for (var i = 0; i < pages.length; ++i) {
            if (i == currentPage) pages[i].setVisibility(isc.Canvas.INHERIT);
            else pages[i].setVisibility(isc.Canvas.HIDDEN);
        }
    } else {
        // Show all pages in between the previous page and the new current page, inclusive.
        var minI = Math.min(currentPage, prevCurrentPage),
            maxI = Math.max(currentPage, prevCurrentPage);
        
        var i = 0;
        for (; i < minI; ++i) {
            pages[i].setVisibility(isc.Canvas.HIDDEN);
        }
        for (; i <= maxI; ++i) {
            pages[i].setVisibility(isc.Canvas.INHERIT);
        }
        for (; i < pages.length; ++i) {
            pages[i].setVisibility(isc.Canvas.HIDDEN);
        }
    }

    var left;
    if (currentPage >= 0) {
        left = -(this.isRTL() ? this.pages.length - 1 - currentPage : currentPage) * this.getInnerWidth();
    } else {
        left = 0;
    }

    var pagesContainer = this.pagesContainer;
    if (!this.animateTransitions || !isc.Browser._supportsCSSTransitions || !this.skinUsesCSSTransitions) {
        if (currentPage >= 0 && !immediate) {
            pagesContainer.animateMove(left, 0, {
                target: this,
                method: function (earlyFinish) {
                    // If earlyFinish is true, then a new scrollToPage animation has already started (and the
                    // appropriate pages have been shown), so don't hide them here.
                    if (!earlyFinish) {
                        // The _animating flag is reset if this is not an early finish before
                        // the callback is called to mirror handleTransitionEnd().
                        delete this._animating;

                        
                        var pages = this.pages,
                            currentPage = this.currentPage;
                        for (var i = 0, len = pages.length; i < len; ++i) {
                            if (i != currentPage) pages[i].setVisibility(isc.Canvas.HIDDEN);
                        }
                    }

                    if (scrollFinishedCallback != null) this.fireCallback(scrollFinishedCallback);

                    // Reset the _animating flag unconditionally. This covers the case where, if
                    // this is an early finish, we want to preserve the current _animating flag
                    // value while calling the callback.
                    delete this._animating;
                }
            }, this.animateScrollDuration);
            this._animating = true;
        } else {
            if (this.moveAnimation != null) this.finishAnimation(this._$move);
            pagesContainer.setLeft(left);
            if (scrollFinishedCallback != null) this.fireCallback(scrollFinishedCallback);
        }

    } else if (pagesContainer.isDrawn()) {
        var oldScrollFinishedCallback = this._scrollFinishedCallback;
        delete this._scrollFinishedCallback;
        if (oldScrollFinishedCallback != null) this.fireCallback(oldScrollFinishedCallback);

        if (currentPage >= 0 && !immediate) {
            var computedTranslateX = isc.Element._getComputedTranslateX(pagesContainer);

            // If the computed translateX (the "used" value - normally a matrix) is different,
            // then there will be a transition. Disable offset coords caching so that we don't
            // cache offsets in the middle of the transition.
            if (computedTranslateX != left) {
                pagesContainer._disableOffsetCoordsCaching();

            // Otherwise, the transition of the transform is going to be canceled (or won't start).
            // In this case, need to make sure that offset coordinate caching is re-enabled if
            // previously disabled.
            } else {
                pagesContainer._enableOffsetCoordsCaching();
            }

            pagesContainer.setStyleName(this.pagesContainerBaseStyle + "Animated");
            isc.Element._updateTransformStyle(pagesContainer, "translateX(" + left + "px)");

            if (computedTranslateX != left) {
                this._animating = true;
                this._scrollFinishedCallback = scrollFinishedCallback;
            } else {
                delete this._animating;
                if (scrollFinishedCallback != null) this.fireCallback(scrollFinishedCallback);
            }
        } else {
            // The 'transitionend' event will not fire if the transition is removed before completion.
            // https://developer.mozilla.org/en-US/docs/Web/Reference/Events/transitionend
            delete this._animating;
            pagesContainer._enableOffsetCoordsCaching();

            
            isc.Element._updateTransformStyle(pagesContainer, "translateX(0px)");
            pagesContainer.setStyleName(this.pagesContainerBaseStyle); // disable transitions
            isc.Element._updateTransformStyle(pagesContainer, "translateX(" + left + "px)");
            if (scrollFinishedCallback != null) this.fireCallback(scrollFinishedCallback);
        }

    // Otherwise, we're using CSS transitions, but the pagesContainer is not drawn yet. In this case,
    // the pagesContainer clip handle will be written out with the correct CSS transform styling.
    // Call the scrollFinishedCallback if one was provided, as effectively the scroll has finished
    // (the current state now matches what it would have been if the pagesContainer were drawn
    // and the CSS transition had completed).
    } else {
        if (scrollFinishedCallback != null) this.fireCallback(scrollFinishedCallback);
    }

    var splitPane = this._splitPane;
    if (splitPane != null && splitPane.currentUIConfig != null) {
        var activeNavigationBar = splitPane._getActiveNavigationBar();
        if (activeNavigationBar != null && isc.Browser._supportsCSSTransitions &&
            activeNavigationBar.skinUsesCSSTransitions)
        {
            activeNavigationBar._animateStateChange(true);
        }
    }

    
},

//> @method splitPanePagedPanel.setCurrentPage()
// Setter for +link{SplitPanePagedPanel.currentPage,currentPage}.
//
// @param currentPage (int) the new <code>currentPage</code>.
//<
// `immediate' (boolean) internal parameter for whether the `SplitPanePagedPanel' should jump
// immediately to the page rather than animating the page into view.
setCurrentPage : function (currentPage, immediate, scrollFinishedCallback) {
    var prevCurrentPage = this.currentPage;
    currentPage = this.currentPage = Math.min(Math.max(0, currentPage), this.pages.length - 1);
    this._scrollToPage(prevCurrentPage, immediate, scrollFinishedCallback);
},

_addPageToContainer : function (page, i, len) {
    
    this.pagesContainer.addChild(page);
    page.setRect(((this.isRTL() ? len - 1 - i : i) * 100) + "%", 0, "100%", null);
},

_addPagesToPagesContainer : function (pages) {
    for (var i = 0, len = pages.length; i < len; ++i) {
        this._addPageToContainer(pages[i], i, len);
    }
},

setPages : function (pages) {
    if (pages == null) {
        this.pages.callMethod("deparent");
        this.pages.setLength(0);
    } else {
        var pagesToRemove,
            currentPages = this.pages;

        if (currentPages.equals(pages)) return;

        // If in screen reader mode, remove all current pages and then re-add them to ensure
        // that the DOM order matches the new order.
        if (isc.screenReader) {
            pagesToRemove = currentPages;

        } else {
            pagesToRemove = [];
            for (var i = 0, len = currentPages.length; i < len; ++i) {
                var currentPage = currentPages[i];
                if (!pages.contains(currentPage)) pagesToRemove.add(currentPage);
            }
        }
        pagesToRemove.callMethod("deparent");
        currentPages.setArray(pages);
        this._addPagesToPagesContainer(pages);
    }
    this.setCurrentPage(this.currentPage, true);
},

resized : function (deltaX, deltaY) {
    // Fix up the translation of the pagesContainer if we were resized horizontally. Note: The
    // SplitPanePagedPanel can be resized vertically when, for example, the navigation bar
    // title is set to an overly-long string, causing the navigation bar to increase in height
    // and this SplitPanePagedPanel to decrease in height. If resized only vertically, then
    // we do not want to jump immediately to the new translation on the pagesContainer.
    if (!!deltaX) {
        this._scrollToPage(this.currentPage, true);
    }
}



});



isc.defineClass("SplitPaneSidePanel", "VLayout").addProperties({
    width: "42%",
    height: "100%",
    overflow: "hidden",
    baseStyle: "splitPaneSidePanel",
    skinUsesCSSTransitions: false,
    // animations brutally slow on high end (circa Q2 2014) WinPhone hardware
    animate: !isc.Browser.isMobileIE,
    animateShowTime: 300,
    animateShowEffectConfig: {
        effect: "slide",
        startFrom: "L"
    },
    animateHideTime: 250,
    animateHideEffectConfig: {
        effect: "slide",
        endAt: "L"
    },

    //> @attr splitPaneSidePanel.navigationBar (AutoChild NavigationBar : AutoChild : R)
    //<
    navigationBarDefaults: {
        _constructor: "NavigationBar",
        width: "100%"
    },

    //> @attr splitPaneSidePanel.pagedPanel (AutoChild SplitPanePagedPanel : AutoChild : IRW)
    //<
    pagedPanelDefaults: {
        _constructor: "SplitPanePagedPanel",
        width: "100%",
        height: "*"
    },

    //> @attr splitPaneSidePanel.onScreen (boolean : false : R)
    //<
    onScreen: false,

autoChildren: ["navigationBar"],
initWidget : function () {
    this.Super("initWidget", arguments);
    this.addAutoChildren(this.autoChildren);
    this.addAutoChild("pagedPanel", {
        _splitPane: this._splitPane
    });

    var isRTL = this.isRTL();
    this._offScreenStyleName = this.baseStyle + (isRTL ? "OffScreenRTL" : "OffScreen");
    this._onScreenStyleName = this.baseStyle + (isRTL ? "OnScreenRTL" : "OnScreen");

    this.hide();
    if (!this.animate) {
        if (isRTL) {
            this._pageResizeEvent = isc.Page.setEvent("resize", this, null, "pageResized");
        } else {
            this.setLeft(0);
        }
        this.setStyleName(isRTL ? this.baseStyle + "RTL" : this.baseStyle);
    } else {
        if (!isc.Browser._supportsCSSTransitions || !this.skinUsesCSSTransitions) {
            this.setStyleName(isRTL ? this.baseStyle + "RTL" : this.baseStyle);
        } else {
            if (isRTL) this.setLeft("100%");
            this.setStyleName(this._offScreenStyleName);
        }
    }
    this.onScreen = false;
},

destroy : function () {
    if (this._pageResizeEvent != null) {
        isc.Page.clearEvent("resize", this._pageResizeEvent);
        delete this._pageResizeEvent;
    }
    if (this._slideInTimer != null) {
        isc.Timer.clear(this._slideInTimer);
        delete this._slideInTimer;
    }

    this.Super("destroy", arguments);
},

setPagedPanel : function (pagedPanel) {
    if (this.pagedPanel !== pagedPanel) {
        if (this.pagedPanel != null) this.removeMember(this.pagedPanel);

        this.pagedPanel = pagedPanel;
        if (pagedPanel != null) {
            this.addMember(pagedPanel);
        }
    }
},

getTransformCSS : function () {
    if (!this.animate || !isc.Browser._supportsCSSTransitions || !this.skinUsesCSSTransitions) {
        return null;
    } else {
        var dX;
        if (this.onScreen) {
            dX = this.isRTL() ? "-100%" : "0";
        } else {
            dX = this.isRTL() ? "0" : "-100%";
        }
        return ";" + isc.Element._transformCSSName + ": translateX(" + dX + ");";
    }
},

slideIn : function () {
    if (this.onScreen) return;

    if (!this.animate) {
        this.show();
    } else {
        if (!isc.Browser._supportsCSSTransitions || !this.skinUsesCSSTransitions) {
            
            this.animateShow(this.animateShowEffectConfig);

        } else {
            this.setStyleName(this._onScreenStyleName);
            this.show();
            
            if (this._slideInTimer != null) {
                isc.Timer.clear(this._slideInTimer);
                this._slideInTimer = null;
            }
            if (this.isDrawn()) {
                this._slideInTimer = this.delayCall("_slideIn");
            }
        }
    }

    this.onScreen = true;
    if (isc.Canvas.ariaEnabled()) this.setAriaState("hidden", false);
},

_slideIn : function () {
    delete this._slideInTimer;
    if (this.isDrawn() && this.isVisible()) { // if undrawn, then _disableOffsetCoordsCaching() and _updateTransformStyle() are no-ops
        var clipHandle = this.getClipHandle();

        var dX,
            left;
        if (this.isRTL()) {
            dX = "-100%";
            // percentages are interpreted relative to the offsetWidth in this case.
            left = -clipHandle.offsetWidth;
        } else {
            dX = "0";
            left = 0;
        }

        var computedTranslateX = isc.Element._getComputedTranslateX(this);
        if (computedTranslateX != left) {
            this._disableOffsetCoordsCaching();
        } else {
            this._enableOffsetCoordsCaching();
        }

        isc.Element._updateTransformStyle(this, "translateX(" + dX + ")");
    }
},

slideOut : function () {
    if (!this.onScreen) return;

    if (!this.animate) {
        this.hide();
    } else {
        if (!isc.Browser._supportsCSSTransitions || !this.skinUsesCSSTransitions) {
            this.animateHide(this.animateHideEffectConfig);
        } else {
            if (this._slideInTimer != null) {
                isc.Timer.clear(this._slideInTimer);
                delete this._slideInTimer;
            }
            this.setStyleName(this._offScreenStyleName);
            if (this.isDrawn() && this.isVisible()) {
                var clipHandle = this.getClipHandle();

                var dX,
                    left;
                if (this.isRTL()) {
                    dX = "0";
                    left = 0;
                } else {
                    dX = "-100%";
                    // percentages are interpreted relative to the offsetWidth in this case.
                    left = -clipHandle.offsetWidth;
                }

                var computedTranslateX = isc.Element._getComputedTranslateX(this);
                if (computedTranslateX != left) {
                    this._disableOffsetCoordsCaching();
                } else {
                    this._enableOffsetCoordsCaching();
                }
                isc.Element._updateTransformStyle(this, "translateX(" + dX + ")");
            }
        }
    }

    this.onScreen = false;
    if (isc.Canvas.ariaEnabled()) this.setAriaState("hidden", true);
},


handleTransitionEnd : function (event, eventInfo) {
    // Since 'transitionend' bubbles, need to make sure that it's our transition that
    // ended, not a descendant's.
    if (eventInfo.target === this) {
        
        this._enableOffsetCoordsCaching();

        if (!this.onScreen) this.hide();
    }
},

onDraw : function () {
    if (!this.animate && this.isRTL()) {
        this.setLeft(isc.Page.getWidth() - this.getVisibleWidth());
    }
},

pageResized : function () {
    if (this.isDrawn() && !this.animate && this.isRTL()) {
        this.setLeft(isc.Page.getWidth() - this.getVisibleWidth());
    }
},

resized : function (deltaX, deltaY) {
    if (this.isDrawn() && !this.animate && this.isRTL()) {
        this.setLeft(isc.Page.getWidth() - this.getVisibleWidth());
    }
}

});


//> @class SplitPane
// A device- and orientation-sensitive layout that implements the common pattern of rendering
// two panes side-by-side on desktop machines and on tablets in landscape orientation,
// while switching to showing a single pane for handset-sized devices or tablets in portrait
// orientation (this type of behavior is sometimes called "responsive design").
// <p>
// A <code>SplitPane</code> can manage either two or three panes &mdash; a
// +link{SplitPane.navigationPane,navigationPane} and the
// +link{SplitPane.detailPane,detailPane} are required, and a
// +link{SplitPane.listPane,listPane} can also be provided which appears in the same place as
// the navigation pane, with built-in navigation between the panes based on
// +link{NavigationBar}.  An example of 3-pane usage would be an email application:
// <ul>
// <li> <code>navigationPane</code>: +link{TreeGrid} of folders
// <li> <code>listPane</code>: +link{ListGrid} showing messages in a folder
// <li> <code>detailPane</code>: message detail view (perhaps a +link{DetailViewer} over an
//      +link{HTMLFlow} or similar arrangement)
// </ul>
// <p>
// The placement of the panes is by default sensitive to whether the device is detected as a
// handset (phone), tablet or desktop device (see +link{DeviceMode}) and to the current
// +link{PageOrientation}.  You can also configure a <code>SplitPane</code> with a fixed
// +link{SplitPane.pageOrientation} or +link{SplitPane.deviceMode}.
// <p>
// Beyond providing the panes listed above, typical usage is simply to call
// +link{SplitPane.showListPane(),showListPane()} and +link{SplitPane.showDetailPane(),showDetailPane()} when the
// <code>SplitPane</code> should navigate to a new pane.  For example, in an email application,
// clicking on a folder in the <code>navigationPane</code> should cause the
// <code>listPane</code> to show messages from the folder, then
// <code>showListPane(<em>"folder name"</em>)</code> would be called to show the
// <code>listPane</code> and give it a new title reflecting the name of the folder.
// <p>
// Similarly, clicking on a message in the <code>listPane</code> should show the message
// details in the <code>detailPane</code> and call
// <code>showDetailPane(<em>"message title"</em>)</code> to reveal the <code>detailPane</code>
// and give it an appropriate title.
// <p>
// <h3>Auto-Navigation</h3>
// <p>
// By default, SplitPane will analyze the controls placed in each pane and the DataSources they 
// are bound to, and automatically navigate between panes.  
// <p>
// For example, in a two-pane SplitPane with a ListGrid in the navigationPane and a DynamicForm 
// in the detailPane, both with the same DataSource, when a record is selected in the grid, 
// +link{dynamicForm.editRecord()} will be called to populate the form, and the detailPane will be shown.
// <p>
// In a 3-pane SplitPane with a TreeGrid and ListGrid in the navigationPane and listPane respectively, 
// if there is a 1-to-Many relation from the TreeGrid's DataSource to the ListGrid's DataSource, 
// +link{listGrid.fetchRelatedData()} will be used to load related records when tree nodes are clicked, 
// and the listPane will be shown.
// <p>
// For a full description of auto-navigation, see +link{splitPane.autoNavigate}. Just set <code>autoNavigate</code> 
// to false if you don't want these behaviors.
// <p>
// <h3>Automatic control placement</h3>
// <p>
// +link{SplitPane.detailToolButtons} allows you to define a set of controls that are specially
// placed based on the <code>deviceMode</code> and <code>pageOrientation</code>.  See
// +link{SplitPane.detailToolButtons} for details.
// <p>
// <h3>NavigationBar and ToolStrips</h3>
// <p>
// By default, bars are created as follows:
// <ul>
// <li> in <code>deviceMode:"tablet"</code> and <code>deviceMode</code> "handset", the
//      +link{SplitPane.navigationBar} is always created.
// <li> in <code>deviceMode:"desktop"</code>, the <code>navigationBar</code> is created by
//      default only if the +link{SplitPane.navigationTitle} is specified and non-empty or
//      +link{SplitPane.showRightButton} and/or +link{SplitPane.showLeftButton} is <code>true</code>,
//      or +link{SplitPane.showNavigationBar} is <code>true</code>.
// <li> in <code>deviceMode:"desktop"</code> and <code>deviceMode</code> "tablet", the
//      +link{SplitPane.detailToolStrip} is shown <em>above</em> the <code>detailPane</code>.
// <li> in <code>deviceMode:"handset"</code>, the +link{SplitPane.detailToolStrip} is created
//      <strong>only</strong> if <code>detailToolButtons</code> are specified, and is placed
//      <em>underneath</em> the <code>detailPane</code>.
// <li> +link{SplitPane.listToolStrip} - separate bar for the <code>listPane</code>, only present
//      for <code>deviceMode:"desktop"</code> when a <code>listPane</code> is provided.
// </ul>
// All of these bars are +link{group:autoChildUsage,AutoChildren} and hence completely
// optional.  You can omit them entirely, or, if you want navigation bars or tool strips but
// want to customize them more than the AutoChild system allows, you can prevent the built-in
// bars from being created and place your own +link{NavigationBar}s either <em>inside</em> your
// navigation, list or detail panes, or <em>outside</em> the <code>SplitPane</code> as a whole.
// This allows you to completely customize your navigation but still use <code>SplitPane</code>
// to handle device- and orientation-aware layout. See +link{SplitPane.showNavigationBar},
// +link{SplitPane.showListToolStrip}, and +link{SplitPane.showDetailToolStrip}.
// <p>
// Note that in addition to the +link{SplitPane.navigationBar,navigationBar}, the other automatically
// created bars are also instances of +link{NavigationBar} despite the "toolStrip" naming convention.
// These controls will not generally contain navigation elements; the <code>NavigationBar</code>
// class is used for consistent styling, since the <code>navigationBar</code> appears adjacent
// to the toolstrips in some modes and orientations, so they should have the same height and
// styling.
//
// @inheritsFrom Layout
// @visibility external
// @example layoutSplitPane
// @treeLocation Client Reference/Layout
//<
isc.defineClass("SplitPane", "Layout");

isc.SplitPane.addProperties({
    overflow: "hidden",
    vertical: true,

    //> @attr splitPane.vertical (boolean : null : IRW)
    // <b>Note</b>: This is a Layout property which is inapplicable on this class. 
    // @include layout.vertical
    //<

    //> @attr splitPane.reverseOrder (Boolean : null : IRW)
    // <b>Note</b>: This is a Layout property which is inapplicable on this class. A SplitPane
    // always works from left to right.
    // @include layout.reverseOrder
    //<

    //> @attr splitPane.addHistoryEntries (boolean : false : IRW)
    // Should default history-tracking support be enabled? If <code>true</code>, then a history
    // management scheme utilizing +link{History.addHistoryEntry()} and +link{History.registerCallback}
    // is enabled. The history callback is registered as an additive callback, allowing other
    // history callbacks including the primary callback to be registered.
    // <p>
    // The default history management scheme is as follows:
    // <ul>
    // <li>History entries are only added after +link{Page.isLoaded(),page load} and when the
    // <code>SplitPane</code> is drawn.</li>
    // <li>A history entry is added for a pane that is hidden by +link{showNavigationPane()},
    // +link{showListPane()}, or +link{showDetailPane()} for the current +link{SplitPane.deviceMode,deviceMode}
    // and +link{SplitPane.pageOrientation,pageOrientation} settings.
    // <p>
    // Example 1: When <code>deviceMode</code> is "desktop", all 3 panes are shown simultaneously,
    // so no history entries are added.
    // <p>
    // Example 2: When <code>deviceMode</code> is "handset", calling +link{showDetailPane()}
    // will hide the current pane (the +link{listPane} if present, otherwise the +link{navigationPane}).
    // A history entry is added for the pane that was hidden</li>
    // </ul>
    // <p>
    // The default history management scheme can be supplemented with application-specific
    // history management. For example, when <code>deviceMode</code> is "tablet", the +link{detailPane}
    // is always visible, but changes to the content of the <code>detailPane</code> are transparent
    // to the <code>SplitPane</code>. The application can add history entries of its own when
    // the user causes new information to be displayed in the <code>detailPane</code>.
    // @setter setAddHistoryEntries()
    // @requiresModules History
    // @visibility external
    //<
    addHistoryEntries: false,

    //> @attr splitPane.deviceMode (DeviceMode : null : IR)
    // UI layout mode used for this <code>SplitPane</code>.
    // <p>
    // A <code>SplitPane</code> can be configured with up to 3 panes: the +link{navigationPane},
    // +link{listPane} and +link{detailPane}.  Both +link{deviceMode} and +link{PageOrientation}
    // influence the placement of these panes as follows:
    // <ul>
    // <li>"handset" <code>deviceMode</code>: only a single pane is shown at a time.  Not
    //      orientation sensitive
    // <li>"tablet" <code>deviceMode</code> with <code>pageOrientation</code>:"landscape": the
    //      <code>detailPane</code> is shown side by side with either the
    //      <code>navigationPane</code> or <code>listPane</code>
    // <li>"tablet" <code>deviceMode</code> with <code>pageOrientation</code>:"portrait": the
    //      <code>detailPane</code> is shown only.  End user navigation that would show the
    //      <code>listPane</code> or <code>navigationPane</code> shows those panes on top of the
    //      <code>detailPane</code> (temporarily covering part of its content)
    // <li>"desktop" <code>deviceMode</code>: all 3 panes are shown simultaneously.  Not
    //      orientation sensitive
    // </ul>
    // The <code>listPane</code> is optional; if not present, wherever the <code>listPane</code>
    // is mentioned above, the <code>navigationPane</code> is shown instead.
    //
    // @visibility external
    // @example layoutSplitPane
    //<
    //deviceMode: null,

    //> @attr splitPane.pageOrientation (PageOrientation : null : IRW)
    // Current +link{PageOrientation}.  The default behavior of the <code>SplitPane</code> is to
    // register for orientation change notifications from the device (see
    // +link{Page.getOrientation()}) and automatically change orientation based on the
    // +link{SplitPane.deviceMode,type of device}.
    // <p>
    // You can instead set a specific value for <code>pageOrientation</code> if you only want to
    // use a specific layout, and not respond to orientation information from the device.
    //
    // @setter setPageOrientation()
    // @visibility external
    //<
    //pageOrientation: null,

    //> @attr splitPane.notifyAfterNavigationClick (boolean : false : IRW)
    // Whether or not to call +link{navigationClick()}, if present, after navigation has already
    // occurred.  This may be set to provide backcompat with legacy code, as by default the
    // Framework will call +link{navigationClick()} before navigation to allow cancelation.
    // <P>
    // Note that if this property is set, +link{navigationClick()} cannot be canceled.
    // @see paneChanged
    // @see navigationClick
    // @visibility external
    //<
    
    
    //> @attr splitPane.navigationPaneWidth (Number | String : 320 : IR)
    // Sets a size for the navigation pane.
    // <p>
    // This size is active only on platforms where multiple panes are showing at once; if a
    // single pane is showing, <code>navigationPaneWidth</code> is ignored.
    // <p>
    // Note that setting a <code>navigationPaneWidth</code> which creates more size in one of
    // the panes may backfire on mobile, where all panes end up having the same width (the
    // device width).  If you make one pane larger to accommodate more controls or content, make
    // sure you use techniques such as showing fewer columns on mobile, or using adaptive
    // components such as +link{AdaptiveMenu}.
    // <p>
    // If you simply want side-by-side display with arbitrary proportions, and don't care about
    // tablet and mobile adaptation, use +link{HLayout} instead.
    //
    // @see canvas.width
    // @visibility external
    //<
    navigationPaneWidth: 320,

    portraitClickMaskDefaults: {
        _constructor: "Canvas",
        width: "100%",
        height: "100%",
        overflow: "hidden",

        click : function () {
            this.creator._dismissPortraitSidePanel();
        }
    },
    portraitSidePanelDefaults: {
        _constructor: "SplitPaneSidePanel",

        navigationBar_autoMaker : function (dynamicProperties) {
            var splitPane = this.creator;
            dynamicProperties = isc.addProperties({}, dynamicProperties, {
                animateStateChanges: splitPane.animateNavigationBarStateChanges,
                showLeftButton: splitPane.showBackButton,
                leftButtonConstructor: splitPane.backButtonConstructor,
                leftButtonDefaults: splitPane.backButtonDefaults,
                leftButtonProperties: splitPane.backButtonProperties
            });
            return splitPane.createAutoChild("portraitSidePanelNavigationBar", dynamicProperties);
        }
    },

    handsetPagedPanelDefaults: {
        _constructor: "SplitPanePagedPanel",
        width: "100%",
        height: "*"
    },

    showSidePanelButtonDefaults: {
        _constructor: "NavigationButton",
        click : function () {
            var creator = this.creator;
            
            var currentPane = this.creator.currentPane;
            if (currentPane === "list" ||
                (currentPane === "detail" && creator._hasListPane()))
            {
                creator.showListPane(null, null, null, false, true);
            } else {
                
                creator.showNavigationPane(null, false, true);
            }
        }
    },

    leftLayoutDefaults: {
        _constructor: "VLayout",
        setWidth : function (newWidth) {
            //>EditMode
            var splitPane = this.creator;
            if (splitPane.editingOn && splitPane.editContext) {
                var fullWidth = splitPane.getVisibleWidth(),
                    widthPercent = Math.round(newWidth / fullWidth * 100.0) + "%"
                ;
                splitPane.editContext.setNodeProperties(splitPane.editNode, { navigationPaneWidth: widthPercent });
            }
            //<EditMode
            this.Super("setWidth", arguments);
        }
    },

    getDynamicDefaults: function(childName) {
        if (childName == "leftLayout") {
            return {width: this.navigationPaneWidth};
        }
    },
    
    rightLayoutDefaults: {
        _constructor: "VLayout",
        width: "*"
    },

    spacerDefaults: {
        backgroundColor: "black",
        overflow: "hidden",
        width: 1,
        height: "100%"
    },

    //> @attr splitPane.showResizeBars (boolean : true : IR)
    // If enabled, the <code>SplitPane</code> will add resize bars between the
    // +link{SplitPane.navigationPane,navigationPane} and +link{SplitPane.detailPane,detailPane}
    // when these panes are shown side-by-side, and between the +link{SplitPane.listPane,listPane}
    // and +link{SplitPane.detailPane,detailPane} in +link{SplitPane.deviceMode,deviceMode:"desktop"}.
    //
    // @visibility external
    //<
    showResizeBars: true,

    //> @attr splitPane.desktopNavigationBarHeight (int : 30 : IR)
    // The height of all navigation bars when +link{SplitPane.deviceMode,deviceMode} is
    // <smartclient>"desktop".</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#DESKTOP}.</smartgwt>
    //
    // @visibility internal
    //<
    desktopNavigationBarHeight: 30,

    //> @attr splitPane.navigationBar (AutoChild NavigationBar : null : IR)
    // A <code>NavigationBar</code> instance managed by this <code>SplitPane</code> that is
    // placed above the +link{SplitPane.navigationPane,navigationPane}.
    // <p>
    // The following +link{group:autoChildUsage,passthroughs} apply:
    // <ul>
    // <li>+link{SplitPane.animateNavigationBarStateChanges,animateNavigationBarStateChanges}
    //     for +link{NavigationBar.animateStateChanges}
    // <li>+link{SplitPane.showRightButton,showRightButton} for +link{NavigationBar.showRightButton}
    // </ul>
    // <p>
    // Note that in +link{SplitPane.deviceMode,deviceMode}
    // <smartclient>"desktop"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#DESKTOP}</smartgwt>
    // with +link{SplitPane.showNavigationBar,showNavigationBar} unset,
    // the <code>navigationBar</code> is automatically hidden when it would be empty
    // (+link{SplitPane.navigationTitle,navigationTitle} is an empty string and
    // <code>showRightButton</code> and <code>showLeftButton</code> are both <code>false</code>).
    // The <code>navigationBar</code> will be shown if the <code>navigationTitle</code>
    // +link{SplitPane.setNavigationTitle(),is set} to a non-empty string, or
    // <code>showRightButton</code> or <code>showLeftButton</code> is set to <code>true</code>.
    // @see SplitPane.showNavigationBar
    // @visibility external
    //<
    
    navigationBarDefaults: {
        _constructor: "NavigationBar",
        autoParent: "none",
        rightPadding: 5,
        leftPadding: 5,
        defaultLayoutAlign: "center",
        

        leftButton_autoMaker : function (dynamicProperties) {
            if (this.showLeftButton == false) return null;
            return this.creator.createAutoChild("backButton", dynamicProperties);
        },
        navigationClick : function (direction) {
            var creator = this.creator;
            if (creator.navigationClick != null) creator.navigationClick(direction);
        },
        upClick : function () {
            var creator = this.creator,
                upClickFun = creator.upClick;
            if (upClickFun != null) {
                return upClickFun.apply(creator, arguments);
            }
        },
        downClick : function () {
            var creator = this.creator,
                downClickFun = creator.downClick;
            if (downClickFun != null) {
                return downClickFun.apply(creator, arguments);
            }
        }
    },

    portraitSidePanelNavigationBarDefaults: {
        _constructor: "NavigationBar",
        

        leftButton_autoMaker : function (dynamicProperties) {
            if (this.showLeftButton == false) return null;
            return this.creator.createAutoChild("backButton", dynamicProperties);
        }
    },

    //> @attr splitPane.showNavigationBar (Boolean : null : IRW)
    // If set to <code>false</code>, the +link{SplitPane.navigationBar,navigationBar}
    // will not be shown. If set to <code>true</code>, the <code>navigationBar</code> will
    // always be shown, even when the +link{SplitPane.deviceMode,deviceMode} is
    // <smartclient>"desktop"</smartclient>
    // <P>
    // If this property is unset, the +link{attr:navigationBar} will be shown if at least one
    // of the following conditions holds:<ul>
    // <li>the +link{SplitPane.deviceMode,deviceMode} is not
    // <smartclient>"desktop"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#DESKTOP}</smartgwt>
    // <li>the +link{SplitPane.navigationTitle} is specified and non-empty
    // <li>+link{SplitPane.showRightButton} and/or +link{SplitPane.showLeftButton} is
    // <code>true</code>,</ul>
    // @visibility external
    //<
    //showNavigationBar: null,

    //> @method splitPane.setShowNavigationBar()
    // Setter for +link{showNavigationBar}.
    // <P>
    // <b>Note:</b> If the property is set <code>false</code> after the
    // +link{attr:navigationBar} autochild has already been created, it will be hidden but not
    // destroyed.
    // @param showNavigationBar (Boolean) new value
    // @visibility external
    //<
    setShowNavigationBar : function (showNavigationBar) {
        if (this.showNavigationBar == showNavigationBar) return;
        this.showNavigationBar = showNavigationBar;
        // create or hide navigationBar as appropriate, then run update logic
        var navigationBar = this._getActiveNavigationBar();
        if (navigationBar == null) {
            
            if (this.currentUIConfig === "portrait") {
                var sidePanel = this.portraitSidePanel;
                sidePanel.showNavigationBar = showNavigationBar;
                sidePanel.addAutoChild("navigationBar", null, null, sidePanel, 0);
            } else this.addAutoChild("navigationBar");
        }
        this.updateUI(true);
    },

    //> @attr splitPane.animateNavigationBarStateChanges (boolean : true : IR)
    // Whether to animate state changes of the +link{SplitPane.navigationBar,navigationBar}.
    // Enabled by default except when the browser is known to have poor animation
    // performance.
    // @see NavigationBar.animateStateChanges
    // @visibility external
    //<
    animateNavigationBarStateChanges: ((isc.Browser._supportsCSSTransitions &&
                                        !isc.Browser.isMobileIE) ||
                                       isc.Browser.isMoz),

    //> @attr splitPane.backButton (AutoChild NavigationButton : null : IR)
    // A +link{class:NavigationButton} shown to the left of the 
    // +link{splitPane.navigationTitle, title} 
    // in the +link{splitPane.navigationBar,navigationBar}. 
    // <P>
    // In +link{SplitPane.deviceMode,deviceModes} other than "desktop", this button is 
    // automatically created and allows transitioning back to the 
    // +link{SplitPane.navigationPane,navigationPane} (in tablet and handset modes) or the 
    // +link{SplitPane.listPane,listPane} (in handset mode).  In these 
    // +link{splitPane.deviceMode, deviceModes}, setting 
    // +link{splitPane.showLeftButton, showLeftButton} to true shows the 
    // +link{splitPane.leftButton, leftButton} <em>in addition to</em> the 
    // automatically-created back button.
    // <P>
    // When +link{splitPane.deviceMode, deviceMode} is "desktop", this button is never shown.
    // See +link{splitPane.showLeftButton, showLeftButton} for more information.
    // <P>
    // This button's +link{Button.title,title} is determined automatically by the 
    // <code>SplitPane</code>.  See +link{splitPane.listTitle, listTitle} and 
    // +link{splitPane.detailTitle, detailTitle}.
    //
    // @visibility external
    //<
    
    // NOTE: The SplitPane.backButton MultiAutoChild is used to create the leftButton of the
    // main navigationBar as well as the leftButton of the portraitSidePanel's navigationBar.
    // This is a bit confusing because the SplitPane leftButton is different from the leftButton's
    // of the various NavigationBar instances.
    //
    // This is done so that the SplitPane backButtons are the "leftButton" instance for the
    // purpose of automatic NavigationBar title fitting.
    backButtonDefaults: {
        _constructor: "NavigationButton",
        direction: "back",
        click : function () {
            
            if (this.parentElement._animating) return;
            
            var creator = this.creator;

            // default is to fire navigationClick handler before navigation to allow canceling
            if (creator.navigationClick != null && !creator.notifyAfterNavigationClick) {
                if (creator.navigationClick(this.direction) == false) return false;
            }
            // do the navigation, which will show and hide new and old pane, respectively
            if (creator.currentPane === "detail" && creator._hasListPane() &&
                creator.currentUIConfig !== "landscape")
            {
                creator.showListPane(null, null, "back", null, false);
            } else {
                creator.showNavigationPane("back", null, false);
            }
            // fire navigationClick handler now, after navigation, if legacy prop is set
            if (creator.navigationClick != null && creator.notifyAfterNavigationClick) {
                creator.navigationClick(this.direction);
            }
            return false;
        }
    },

    //> @attr splitPane.leftButton (AutoChild NavigationButton : null : IR)
    // An additional +link{NavigationButton} which may be shown to the left of the 
    // +link{SplitPane.navigationTitle, title} in the
    // +link{SplitPane.navigationBar, navigation bar}.
    // <P>
    // <b>Important note:</b> by default, this button has no 
    // +link{navigationButton.direction, direction} and does not fire the 
    // +link{splitPane.navigationClick, navigationClick} notification.  You can provide a 
    // <code>direction</code> and apply a click handler via the autoChild system.
    // @see splitPane.showLeftButton
    // @see splitPane.backButton
    // @visibility external
    //<
    leftButtonDefaults: {
        _constructor: "NavigationButton",
        direction: null,
        click : function () {
            
            if (this.parentElement._animating) return;
            
            // Always fire the navigationClick handler if defined
            if (this.creator.navigationClick != null) {
                this.creator.navigationClick(this.direction);
            }
            return false;
        }
    },

    //> @attr splitPane.currentPane (CurrentPane : "navigation" : IRW)
    // The most recently shown pane.  In handset +link{DeviceMode}, the
    // <code>currentPane</code> is the only pane that is actually visible to the user.  In other
    // modes more than one pane can be simultaneously visible, so the <code>currentPane</code> is
    // the most recent pane that was brought into view via a call to +link{setCurrentPane()} or
    // +link{showNavigationPane()}.
    // <p>
    // The default value of <code>currentPane</code> is "navigation".
    //
    // @visibility external
    //<
    currentPane: "navigation",

    //> @attr splitPane.navigationTitle (HTMLString : null : IRW)
    // The title for the +link{SplitPane.navigationPane,navigationPane}, displayed in the
    // +link{SplitPane.navigationBar,navigationBar} and also used for the title of a back
    // button in some configurations.
    //
    // @setter setNavigationTitle()
    // @visibility external
    //<

    //> @attr splitPane.navigationPane (Canvas : null : IRW)
    // An arbitrary widget that is visible in all configurations when the
    // +link{SplitPane.currentPane,currentPane} is
    // <smartclient>"navigation"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.CurrentPane#NAVIGATION}</smartgwt>
    // (it may also be visible when the <code>currentPane</code> is
    // <smartclient>"list"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.CurrentPane#LIST}</smartgwt>
    // or
    // <smartclient>"detail").</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.CurrentPane#DETAIL}).</smartgwt>
    // <p>
    // The <code>navigationPane</code> is typically used for navigation, to initialize the
    // content of the +link{SplitPane.listPane,listPane} (when using a <code>listPane</code>)
    // or the +link{SplitPane.detailPane,detailPane}. For example, in an email application
    // the <code>navigationPane</code> pane widget could be a +link{TreeGrid} of the inboxes
    // and folders.
    // @visibility external
    //<

    //> @attr splitPane.listTitle (HTMLString : null : IRW)
    // The title for the +link{SplitPane.listPane,listPane}.
    //
    // @setter setListTitle()
    // @visibility external
    //<

    listTitleLabelDefaults: {
        _constructor: "Label",
        align: "center",
        valign: "center",
        width: "*",
        height: "100%"
    },

    //> @attr splitPane.listPane (Canvas : null : IRW)
    // An optional list pane displayed in the left-hand of the panes or in a side panel
    // according to the pane layout.
    //
    // @visibility external
    //<

    //> @attr splitPane.listToolStrip (AutoChild NavigationBar : null : IR)
    // Bar displayed above the +link{SplitPane.listPane,listPane}, if a <code>listPane</code> is present,
    // <b>only</b> for +link{SplitPane.deviceMode,deviceMode} "desktop".
    //
    // @visibility external
    //<
    listToolStripDefaults: {
        _constructor: "NavigationBar",
        rightPadding: 5,
        leftPadding: 5,
        defaultLayoutAlign: "center",
        overflow: "hidden",
        showLeftButton: false,
        showRightButton: false
    },

    //> @attr splitPane.showListToolStrip (Boolean : null : IRW)
    // If set to <code>false</code>, the +link{SplitPane.listToolStrip,listToolStrip}
    // will not be shown.  Otherwise, the +link{attr:listToolStrip} will be shown if
    // the +link{SplitPane.deviceMode,deviceMode} is
    // <smartclient>"desktop"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#DESKTOP}</smartgwt> and
    // a +link{listPane} is provided.
    // @visibility external
    //<
    //showListToolStrip: null,

    //> @method splitPane.setShowListToolStrip()
    // Setter for +link{showListToolStrip}.
    // <b>Note:</b> If the property is set <code>false</code> after the
    // +link{attr:detailToolStrip} autochild has already been created, it will be hidden but
    // not destroyed.
    // @param showListToolStrip (Boolean) new value
    // @visibility external
    //<
    setShowListToolStrip : function (showListToolStrip) {
        if (this.showListToolStrip == showListToolStrip) return;
        this.showListToolStrip = showListToolStrip;
        // create or hide listToolStrip as appropriate, then run update logic
        if (this.listToolStrip == null) this.addAutoChild("listToolStrip");
        this.updateUI(true);
    },

    //> @attr splitPane.detailTitle (HTMLString : null : IRW)
    // The title for the +link{SplitPane.detailPane,detailPane}.
    //
    // @setter setDetailTitle()
    // @visibility external
    //<

    detailTitleLabelDefaults: {
        _constructor: "Label",
        height: "100%",
        align: "center",
        valign: "center",
        clipTitle: true,
        wrap: false,
        overflow: "hidden"
    },

    //> @attr splitPane.detailPane (Canvas : null : IRW)
    // The right-hand of the two panes managed by this widget, used for viewing details.
    //
    // @visibility external
    //<

    detailPaneContainerDefaults: {
        _constructor: "VLayout",
        height: "100%"
    },

    //> @attr splitPane.detailToolStrip (AutoChild NavigationBar : null : IR)
    // Toolstrip servicing the +link{SplitPane.detailPane,detailPane}.
    // <p>
    // In +link{SplitPane.deviceMode,deviceMode}
    // <smartclient>"desktop"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#DESKTOP}</smartgwt>
    // and <code>deviceMode</code>
    // <smartclient>"tablet",</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#TABLET},</smartgwt>
    // the <code>detailToolStrip</code> is shown <em>above</em> the <code>detailPane</code>.
    // In +link{SplitPane.deviceMode,deviceMode}
    // <smartclient>"handset",</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#HANDSET},</smartgwt>
    // the <code>detailToolStrip</code> is created <strong>only</strong> if
    // +link{SplitPane.detailToolButtons,detailToolButtons} are specified, and is placed
    // <em>underneath</em> the <code>detailPane</code>.
    //
    // @visibility external
    //<
    detailToolStripDefaults: {
        _constructor: "NavigationBar",
        rightPadding: 5,
        leftPadding: 5,
        leftButtonIcon: null,
        defaultLayoutAlign: "center"
    },

    //> @attr splitPane.showDetailToolStrip (Boolean : null : IRW)
    // If set to <code>false</code>, the +link{SplitPane.detailToolStrip,detailToolStrip}
    // will not be shown.  Otherwise, the +link{attr:detailToolStrip} will be shown if either
    // the +link{SplitPane.deviceMode,deviceMode} is not
    // <smartclient>"handset"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.DeviceMode#HANDSET}</smartgwt> or
    // +link{detailToolButtons} are specified.
    // @visibility external
    //<
    //showDetailToolStrip: null,

    //> @method splitPane.setShowDetailToolStrip()
    // Setter for +link{showDetailToolStrip}.
    // <b>Note:</b> If the property is set <code>false</code> after the
    // +link{attr:detailToolStrip} autochild has already been created, it will be hidden but
    // not destroyed.
    // @param showDetailToolStrip (Boolean) new value
    // @visibility external
    //<
    setShowDetailToolStrip : function (showDetailToolStrip) {
        if (this.showDetailToolStrip == showDetailToolStrip) return;
        this.showDetailToolStrip = showDetailToolStrip;
        // create or hide detailToolStrip as appropriate, then run update logic
        if (this.detailToolStrip == null) this.addAutoChild("detailToolStrip");
        this.updateUI(true);
    },

    //> @attr splitPane.detailToolButtons (Array of Canvas : null : IRW)
    // <code>detailToolButtons</code> allows you to specify a set of controls that are specially
    // placed based on the +link{SplitPane.deviceMode,deviceMode} and +link{SplitPane.pageOrientation,pageOrientation}.
    // This is generally useful for a compact strip of +link{ImgButton} controls, approximately
    // 5 of which will fit comfortably using typically-sized icons and in the most space-constricted
    // modes.
    // <p>
    // These controls are placed as follows:
    // <ul>
    // <li> in <code>deviceMode:"desktop"</code> and <code>deviceMode</code> "tablet" with
    //      <code>pageOrientation</code> "landscape", <code>detailToolButtons</code> appear in the
    //      +link{splitPane.detailToolStrip} shown <i>above</i> of the <code>detailPane</code>.
    // <li> in <code>deviceMode:"handset"</code>, <code>detailToolButtons</code> appear in a
    //       +link{splitPane.detailToolStrip} <i>underneath</i> the detailPane.  This toolstrip
    //      is only created in "handset" mode if <code>detailToolButtons</code> are provided.
    // <li> in <code>deviceMode:"tablet"</code> and <code>pageOrientation:"portrait"</code>,
    //      <code>detailToolButtons</code> appear in <code>splitPane.navigationBar</code>.
    // </ul>
    //
    // @visibility external
    //<

    autoChildren: ["leftLayout", "rightLayout", "navigationBar", "listToolStrip", "detailToolStrip"],

    //> @attr splitPane.showMiniNav (Boolean : false : IR)
    // If true, a +link{MiniNavControl} will be shown:
    // <ul>
    // <li>In the +link{attr:navigationBar,navigationBar} when the device mode is
    //     <smartclient>"handset"</smartclient>
    //     <smartgwt>{@link com.smartgwt.client.types.DeviceMode#HANDSET}</smartgwt>
    //     and the +link{attr:currentPane,currentPane} is
    //     <smartclient>"detail".</smartclient>
    //     <smartgwt>{@link com.smartgwt.client.types.CurrentPane#DETAIL}.</smartgwt>
    // <li>In the +link{attr:detailToolStrip,detailToolStrip} when the device mode is
    //     <smartclient>"tablet"</smartclient>
    //     <smartgwt>{@link com.smartgwt.client.types.DeviceMode#TABLET}</smartgwt>
    //     and the +link{attr:pageOrientation,pageOrientation} is
    //     <smartclient>"portrait".</smartclient>
    //     <smartgwt>{@link com.smartgwt.client.types.PageOrientation#PORTRAIT}.</smartgwt>
    // </ul>
    // <p>
    // @see attr:detailNavigationControl
    // @visibility external
    //<
    showMiniNav: false,

    

    isHandset : function () {
        return this.deviceMode == null ? isc.Browser.isHandset : this.deviceMode === "handset";
    },

    isTablet : function () {
        return this.deviceMode == null ? isc.Browser.isTablet : this.deviceMode === "tablet";
    },

    getPageOrientation : function () {
        return this.pageOrientation || isc.Page.getOrientation();
    },

    initWidget : function () {
        this.Super("initWidget", arguments);
        
        this.addAutoChildren(this.autoChildren, "none");
        if (this.detailToolStrip != null) this.detailTitleLabel = this.detailToolStrip.titleLabel;

        // On tablets, we need to create the side panel right away
        if (this.isTablet()) {
            var portraitClickMask = this.portraitClickMask = this.createAutoChild("portraitClickMask", {
                visibility: "hidden"
            });
            this.addChild(portraitClickMask);
            var portraitSidePanel = this.portraitSidePanel = this.createAutoChild("portraitSidePanel", {
                _splitPane: this,
                showNavigationBar: this.showNavigationBar
            });
            this._pagedPanel = portraitSidePanel.pagedPanel;
            this.addChild(portraitSidePanel);

        // On handsets, create a paged panel to host the navigation, list, and detail panes.
        } else if (this.isHandset()) {
            this._pagedPanel = this.createAutoChild("handsetPagedPanel", {
                _splitPane: this
            });
        }

        // If initialized with the navigationPane and/or listPane and/or detailPane, resize the
        // width to "100%". If the pane's _userHeight is null, then this means that the application
        // did not specify an initial height; in such cases, default the height to "100%" as well.
        if (this.navigationPane != null) {
            this.navigationPane.resizeTo("100%", this.navigationPane._userHeight != null ? null : "100%");
            this.navigationPane.splitPane = this;
            if (this.autoNavigate) this._observePane("navigation", this.navigationPane);
        }
        if (this.listPane != null) {
            this.listPane.resizeTo("100%", this.listPane._userHeight != null ? null : "100%");
            this.listPane.splitPane = this;
            if (this.autoNavigate) this._observePane("list", this.listPane);
        }
        if (this.detailPane != null) {
            this.detailPane.resizeTo("100%", this.detailPane._userHeight != null ? null : "100%");
            this.detailPane.splitPane = this;
        }

        // Set an 'orientationChange' event handler if this.pageOrientation is null, as per documentation.
        if (this.pageOrientation == null) {
            this._orientationChangeEventID = isc.Page.setEvent("orientationChange", this);
        }

        this._historyIDPrefix = this.getID() + "_";
        if (this.addHistoryEntries) this._setUpDefaultHistoryManagement();

        this.pageOrientationChange();
    },

    navigationBar_autoMaker : function (dynamicProperties) {
        // Create the navigationBar AutoChild with the passthroughs applied.
        dynamicProperties = isc.addProperties({}, dynamicProperties, {
            animateStateChanges: this.animateNavigationBarStateChanges,
            showLeftButton: this.showBackButton,
            leftButtonConstructor: this.backButtonConstructor,
            leftButtonDefaults: this.backButtonDefaults,
            leftButtonProperties: this.backButtonProperties,

            showRightButton: this.showRightButton,
            // pass the rightButtonTitle through
            rightButtonTitle: this.rightButtonTitle,

            showMiniNavControl: this.showMiniNav
            
        });
        if (!this.isTablet() && !this.isHandset()) {
            
            dynamicProperties.height = this.desktopNavigationBarHeight;
            dynamicProperties.visibility = "hidden";
        }
        return this.createAutoChild("navigationBar", dynamicProperties);
    },

    listToolStrip_autoMaker : function (dynamicProperties) {
        dynamicProperties = isc.addProperties({}, this.listToolStripProperties, dynamicProperties);
        if (!this.isTablet() && !this.isHandset()) {
            
            dynamicProperties.height = this.desktopNavigationBarHeight;
        }
        return this.createAutoChild("listToolStrip", dynamicProperties);
    },

    detailToolStrip_autoMaker : function (dynamicProperties) {
        dynamicProperties = isc.addProperties({}, this.detailToolStripProperties, dynamicProperties, {
            titleLabelConstructor: this.detailTitleLabelConstructor,
            titleLabelDefaults: this.detailTitleLabelDefaults,
            titleLabelProperties: this.detailTitleLabelProperties
        });
        var uiConfiguration;
        if (this.isTablet()) {
            dynamicProperties.showMiniNavControl = this.showMiniNav;
            dynamicProperties.leftButton_autoMaker = function (dynamicProperties) {
                return (this.creator.showSidePanelButton = this.creator.createAutoChild("showSidePanelButton", dynamicProperties));
            };
        } else if (!this.isHandset()) {
            
            dynamicProperties.height = this.desktopNavigationBarHeight;
        }
        return this.createAutoChild("detailToolStrip", dynamicProperties);
    },

    destroy : function () {
        if (this._historyCallbackID != null) {
            
            isc.History.unregisterCallback(this._historyCallbackID);
            delete this._historyCallbackID;
        }
        if (this._orientationChangeEventID != null) {
            isc.Page.clearEvent("orientationChange", this._orientationChangeEventID);
            delete this._orientationChangeEventID;
        }
        this.Super("destroy", arguments);
    },

    draw : function () {
        this.Super("draw", arguments);
        this._maybeAddHistoryEntry();
    },

    _setUpDefaultHistoryManagement : function () {
        
        if (!isc.History) {
            this.logError("addHistoryEntries is true, but the History module is not loaded.");
        } else if (this._historyCallbackID == null) {
            this._historyCallbackID = isc.History.registerCallback({ target: this, methodName: "historyCallback" }, true, true);
        }
        this._maybeAddHistoryEntry();
    },

    //> @method splitPane.setAddHistoryEntries()
    // Setter for +link{SplitPane.addHistoryEntries}.
    // @param addHistoryEntries (boolean) the new setting.
    // @visibility external
    //<
    setAddHistoryEntries : function (addHistoryEntries) {
        

        this.addHistoryEntries = addHistoryEntries;
        if (addHistoryEntries) this._setUpDefaultHistoryManagement();
        else if (this._historyCallbackID != null) {
            
            isc.History.unregisterCallback(this._historyCallbackID);
            delete this._historyCallbackID;
        }

        
    },

    _maybeAddHistoryEntry : function () {
        if (!this.addHistoryEntries || !isc.History) return;

        if (!this.isDrawn()) return;

        var currentPane = this.currentPane;
        var id = this._historyIDPrefix + currentPane;
        var title = String(this.navigationTitle);
        var data = {
            _overriddenBackButtonTitle: this._overriddenBackButtonTitle
        };
        if (currentPane === "navigation") {
            // In "desktop" layout mode, the navigation pane is always visible, so don't add a
            // history entry for it.
            if (!(this.isTablet() || this.isHandset())) return;
            data.title = this.navigationTitle;
        } else if (currentPane === "list") {
            // In "desktop" layout mode, the list pane is always visible, so don't add a history
            // entry for it.
            if (!(this.isTablet() || this.isHandset())) return;
            title += " > " + (this.listTitle == null ? "" : String(this.listTitle));
            data.title = this.listTitle;
        } else if (currentPane === "detail") {
            // In "tablet" and "desktop" layout modes, the detail pane is always visible, so don't
            // add a history entry for it.
            if (!this.isHandset()) return;
            if (this._hasListPane()) {
                title += " > " + (this.listTitle == null ? "" : String(this.listTitle));
            }
            title += " > " + (this.detailTitle == null ? "" : String(this.detailTitle));
            data.title = this.detailTitle;
        }

        // History entries can only be added after the page has loaded. If not loaded yet, set
        // a one-time 'load' event.
        if (!isc.Page.isLoaded()) {
            isc.Page.setEvent("load", function () {
                if (isc.History.readyForAnotherHistoryEntry()) isc.History.addHistoryEntry(id, title, data);
                else isc.Class.delayCall("addHistoryEntry", [id, title, data], 0, isc.History);
            }, isc.Page.FIRE_ONCE);
        } else {
            if (isc.History.readyForAnotherHistoryEntry()) isc.History.addHistoryEntry(id, title, data);
            else isc.Class.delayCall("addHistoryEntry", [id, title, data], 0, isc.History);
        }
    },

    //> @method splitPane.historyCallback() (A)
    // @param id (String)
    // @param [data] (String)
    //<
    historyCallback : function (id, data) {
        if (this.destroyed || id == null) return;

        

        var historyIDPrefix = this._historyIDPrefix;
        if (id.startsWith(historyIDPrefix)) {
            var oldPane = id.substring(historyIDPrefix.length);
            if (oldPane === "navigation") {
                this.setNavigationTitle(data.title);
                this.showNavigationPane(null, true);
            } else if (oldPane === "list") {
                this.showListPane(data.title, data._overriddenBackButtonTitle, null, true);
            } else {
                this.showDetailPane(data.title, data._overriddenBackButtonTitle, null, true);
            }
        }
    },

    //> @method splitPane.setCurrentPane()
    // Reveals the pane indicated by the <code>newPane</code> parameter.
    // <p>
    // This has different effects based on the +link{deviceMode} and +link{pageOrientation}.  For
    // example, in "handset" mode, the new pane will be the only one showing.  In other modes such
    // as "desktop", this method may do nothing, but should still be called in order to ensure
    // correct behavior with other +link{type:DeviceMode} settings.
    //
    // @param newPane (CurrentPane) new pane to show.
    // @visibility external
    //<
    setCurrentPane : function (newPane) {
        if (newPane === "navigation") this.showNavigationPane();
        else if (newPane === "list") this.showListPane();
        else this.showDetailPane();
    },

    //> @method splitPane.setDetailToolButtons()
    // Updates the +link{SplitPane.detailToolButtons,detailToolButtons} at runtime.
    //
    // @param buttons (Array of Canvas) new controls for the toolstrip.
    // @visibility external
    //<
    setDetailToolButtons : function (buttons) {
        
        this.detailToolButtons = buttons;
        this.updateDetailToolStrip();
    },

    //> @method splitPane.setPageOrientation()
    // Explicitly sets the page orientation to a fixed value instead of being responsive to device
    // orientation changes.  Pass <code>null</code> to return to responding automatically to device
    // orientation.
    // <p>
    // See +link{PageOrientation} for details of how page orientation affects layout.
    //
    // @param newOrientation (PageOrientation) new orientation to use.
    // @visibility external
    //<
    setPageOrientation : function (newOrientation) {
        

        if (this.pageOrientation !== newOrientation) {
            this.pageOrientation = newOrientation;

            // Set an 'orientationChange' event handler if null.
            if (newOrientation == null) {
                if (this._orientationChangeEventID == null) {
                    this._orientationChangeEventID = isc.Page.setEvent("orientationChange", this);
                }

            // Otherwise, an explicit pageOrientation was set, so clear the 'orientationChange'
            // event handler if set.
            } else if (this._orientationChangeEventID != null) {
                isc.Page.clearEvent("orientationChange", this._orientationChangeEventID);
                delete this._orientationChangeEventID;
            }
        }

        

        this.pageOrientationChange();
    },

    pageOrientationChange : function () {
        

        this.updateUI();
    },

    _getDetailPaneContainer : function () {
        
        var detailPaneContainer = this.detailPaneContainer;
        if (detailPaneContainer == null) {
            detailPaneContainer = this.detailPaneContainer = this.createAutoChild("detailPaneContainer");
        }
        var members = [];
        if (this.detailPane != null) {
            members.add(this.detailPane);
        }
        if (this.detailToolButtons != null && !this.detailToolButtons.isEmpty()) {
            this.updateDetailToolStrip();
            members.add(this.detailToolStrip);
        }
        detailPaneContainer.setMembers(members);
        return detailPaneContainer;
    },

    updateUI : function (forceRefresh, direction) {
        // AutoChild & pane structure:
        // setMembers() is used to change the hierarchy according to:
        //
        // "desktop" hierarchy:
        // - SplitPane (H)
        //   - leftLayout (V)
        //     - navigationBar
        //     - navigationPane
        //   - rightLayout (V)
        //     - listToolStrip
        //     - listPane
        //     - detailToolStrip
        //     - detailPane
        //
        // "landscape" hierarchy:
        // - SplitPane (H)
        //   - leftLayout (V)
        //     - navigationBar
        //     - portraitSidePanel_pagedPanel (contains either navigationPane or listPane)
        //   - rightLayout (V)
        //     - detailToolStrip
        //     - detailPane
        //
        // "portrait" hierarchy:
        // - SplitPane (V)
        //   - detailToolStrip (contains a button to reveal the side panel)
        //   - detailPane
        //
        // "handset" hierarchy:
        // - SplitPane (V)
        //   - navigationBar
        //   - handsetPagedPanel (contains either navigationPane, listPane, or detailPaneContainer)

        var prevConfig = this.currentUIConfig,
            prevPane = this._lastPane,
            config = this.currentUIConfig = this.getUIConfiguration(),
            pane = this._lastPane = this.currentPane;

        if (!forceRefresh && config === prevConfig && pane === prevPane) {
            if (config === "handset") {
                this._pagedPanel._scrollToPage(this._pagedPanel.currentPage, true);
            }
            return;
        }

        this.updateNavigationBar(direction);
        // NOTE: this.navigationBar might be null at this point if showNavigationBar is false.

        if (config === "handset") {
            this.setProperty("vertical", true);

            var pages;
            if (prevConfig !== "handset" || forceRefresh) {
                pages = [];
                if (this.navigationPane != null) pages.add(this.navigationPane);
                if (this.listPane != null) pages.add(this.listPane);
                pages.add(this._getDetailPaneContainer());
                this._pagedPanel.setPages(pages);
            } else {
                pages = this._pagedPanel.pages;
            }

            var members = [];
            if (this.navigationBar != null) members.add(this.navigationBar);
            members.add(this._pagedPanel);
            if (pane === "navigation") {
                this._pagedPanel.setCurrentPage(0, prevConfig !== "handset");
            } else if (pane === "list") {
                this._pagedPanel.setCurrentPage(1, prevConfig !== "handset");
            } else {
                
                this._pagedPanel.setCurrentPage((this._hasListPane() ? 2 : 1), prevConfig !== "handset");
            }
            this.setMembers(members);

        } else if (config === "portrait") {
            this.setProperty("vertical", true);

            this.leftLayout.removeMembers(this.leftLayout.members);
            this.portraitSidePanel.setPagedPanel(this._pagedPanel);
            this.updateDetailToolStrip();

            var newMembers = [this.detailToolStrip];
            if (this.detailPane != null) newMembers.add(this.detailPane);
            this.setMembers(newMembers);

            var pages;
            if (prevConfig !== "portrait") {
                pages = [];
                if (this.navigationPane != null) pages.add(this.navigationPane);
                if (this.listPane != null) pages.add(this.listPane);
                this.portraitSidePanel.pagedPanel.setPages(pages);
            } else {
                pages = this.portraitSidePanel.pagedPanel.pages;
            }

            if (pane === "navigation") {
                this._pagedPanel.setCurrentPage(0, !this.portraitSidePanel.onScreen);
                if (this.isDrawn() && this.isVisible()) {
                    this._engagePortraitSidePanel();
                }

            } else if (pane === "list") {
                
                this._pagedPanel.setCurrentPage(1, !this.portraitSidePanel.onScreen);
                if (this.isDrawn() && this.isVisible()) {
                    this._engagePortraitSidePanel();
                }

            } else {
                if (this.portraitSidePanel.onScreen) {
                    this._dismissPortraitSidePanel();
                }
            }

        } else if (config === "landscape") {
            this.setProperty("vertical", false);

            this.portraitSidePanel.setPagedPanel(null);

            if (this.portraitSidePanel.onScreen) {
                this.portraitSidePanel.slideOut();
            }

            this.updateDetailToolStrip();
            var members = [];
            if (this.detailToolStrip != null) members.add(this.detailToolStrip);
            if (this.detailPane != null) members.add(this.detailPane);
            this.rightLayout.setMembers(members);

            var pages;
            if (prevConfig !== "landscape") {
                pages = [];
                if (this.navigationPane != null) pages.add(this.navigationPane);
                if (this.listPane != null) pages.add(this.listPane);
                this._pagedPanel.setPages(pages);
            } else {
                pages = this._pagedPanel.pages;
            }

            if (pane === "navigation") {
                this._pagedPanel.setCurrentPage(0, prevConfig !== "landscape");

            } else if (pane === "list") {
                
                this._pagedPanel.setCurrentPage(1, prevConfig !== "landscape");
            }

            members.setLength(0);
            if (this.navigationBar != null) members.add(this.navigationBar);
            members.add(this._pagedPanel);
            this.leftLayout.setMembers(members);

            
            members.setLength(0);
            members.add(this.leftLayout);
            if (this.showResizeBars) {
                this.leftLayout.setShowResizeBar(true);
            } else {
                this.leftLayout.setShowResizeBar(false);
                if (this.spacer == null) {
                    this.spacer = this.createAutoChild("spacer");
                }
                members.add(this.spacer);
            }
            members.add(this.rightLayout);
            this.setMembers(members);

        } else {
            

            this.setProperty("vertical", false);

            var members = [];
            if (this.navigationBar != null) members.add(this.navigationBar);
            if (this.navigationPane != null) members.add(this.navigationPane);
            this.leftLayout.setMembers(members);
            this.leftLayout.setShowResizeBar(this.showResizeBars);

            this.updateListToolStrip();
            this.updateDetailToolStrip();
            members.setLength(0);
            if (this._hasListPane()) {
                if (this.listToolStrip != null) members.add(this.listToolStrip);
                
                members.add(this.listPane);
                this.listPane.setShowResizeBar(this.showResizeBars);
            }
            //>EditMode
            else if (this.editingOn && this.editProxy && this.editProxy.isTriplePane) {
                // When showing a TriplePane in VB, always show a listPane or placeholder
                // along with detailPane so that all 3 panes are visible during editing
                var placeholder = isc.LayoutSpacer.create({ height: "50%", showResizeBar: true });
                members.add(placeholder);
            }
            //<EditMode
            if (this.detailPane != null) {
                if (this.detailToolStrip != null) members.add(this.detailToolStrip);
                members.add(this.detailPane);
            }
            //>EditMode
            else if (this.editingOn && this.editProxy && this.editProxy.isTriplePane) {
                var placeholder = isc.LayoutSpacer.create({ height: "*" });
                members.add(placeholder);
            }
            //<EditMode
            this.rightLayout.setMembers(members);

            this.setMembers([this.leftLayout, this.rightLayout]);
        }

        var newReverseOrder = this.isRTL() && !this.vertical;
        if (this.reverseOrder != newReverseOrder) {
            this.reverseOrder = newReverseOrder;
            this.reflow();
        }

        
    },

    _engagePortraitSidePanel : function () {
        this.portraitClickMask.show();
        this.portraitClickMask.bringToFront();
        if (!this.portraitSidePanel.isDrawn()) this.portraitSidePanel.draw();
        else this.portraitSidePanel.redraw();
        this.portraitSidePanel.slideIn();
        this.portraitSidePanel.show();
        this.portraitSidePanel.moveAbove(this.portraitClickMask);
    },

    _dismissPortraitSidePanel : function () {
        this.portraitSidePanel.slideOut();
        this.portraitClickMask.hide();
    },

    updateListToolStrip : function () {
        var listToolStrip = this.listToolStrip;
        if (listToolStrip == null) return;

        if (this.showListToolStrip != false && this._hasListPane() && 
            this.currentUIConfig === "desktop") 
        {
            this.updateListTitleLabel();
            var members = [];
            if (listToolStrip.leftButton) {
                members.add(listToolStrip.leftButton);
            }
            if (this.listTitleLabel != null) members.add(this.listTitleLabel);
            if (listToolStrip.rightButton) {
                members.add(listToolStrip.rightButton);
            }
            listToolStrip.setMembers(members);
            listToolStrip.show();
        } else {
            listToolStrip.hide();
        }
    },

    updateListTitleLabel : function () {
        if (this.showListTitleLabel == false) return;
        if (this.listTitleLabel == null) {
            this.listTitleLabel = this.createAutoChild("listTitleLabel");
        }
        this.listTitleLabel.setContents(this.listTitle);
    },

    updateDetailToolStrip : function () {
        var detailToolStrip = this.detailToolStrip;
        if (detailToolStrip == null) return;

        // support showDetailToolStrip becoming false
        if (this.showDetailToolStrip == false) {
            detailToolStrip.hide();
            return;
        }

        var currentUIConfig = this.currentUIConfig;
        

        var newViewState = {
            showLeftButton: false,
            leftButtonTitle: null,
            title: null,
            controls: []
        };
        var controls = newViewState.controls;
    
        var showToolStrip = true;
        if (currentUIConfig === "handset") {
            if (this.detailToolButtons == null || this.detailToolButtons.isEmpty()) {
                showToolStrip = false;
            }
            controls.addList(this.detailToolButtons);

            detailToolStrip.setProperty("align", "center");

        } else if (currentUIConfig === "portrait") {
            

            newViewState.showLeftButton = true;
            newViewState.leftButtonTitle = (this.currentPane !== "navigation" && this.listPane
                                            ? this.listTitle
                                            : this.navigationTitle);
            // Use the same shortLeftButtonTitle so that the title of the showSidePanelButton
            // will not be shortened (by default, to "Back", which is not a good title for the
            // showSidePanelButton).
            newViewState.shortLeftButtonTitle = newViewState.leftButtonTitle;

            controls.add(this.showSidePanelButton);
            if (this.detailNavigationControl != null) {
                controls.add(this.detailNavigationControl);
            }
            controls.add("titleLabel");
            if (this.showDetailTitleLabel != false) newViewState.title = this.detailTitle;
            if (this.detailToolButtons != null) controls.addList(this.detailToolButtons);
            if (this.showMiniNav) controls.add("miniNavControl");

            detailToolStrip.setProperty("align", "left");

        } else {
            
            if (currentUIConfig === "desktop" && !this._hasDetailPane()) showToolStrip = false;

            controls.add("titleLabel");
            if (this.showDetailTitleLabel != false) newViewState.title = this.detailTitle;
            if (this.detailToolButtons != null) controls.addList(this.detailToolButtons);

            detailToolStrip.setProperty("align", "left");
        }
        if (showToolStrip) detailToolStrip.show();
        else               detailToolStrip.hide();

        detailToolStrip.setViewState(newViewState);
    },

    _getActiveNavigationBar : function () {
        
        if (this.currentUIConfig === "portrait") {
            return this.portraitSidePanel.navigationBar;
        } else {
            return this.navigationBar;
        }
    },

    updateNavigationBar : function (direction) {
        var navigationBar = this._getActiveNavigationBar();
        if (navigationBar == null) return;

        // support showNavigationBar becoming false
        if (this.showNavigationBar == false) {
            navigationBar.hide();
            return;
        }

        var undef;
        var newViewState = {
            showLeftButton: undef,
            leftButtonTitle: undef,
            shortLeftButtonTitle: undef,
            alwaysShowLeftButtonTitle: undef,
            title: undef,
            controls: []
        };
        var controls = newViewState.controls;

        //>DEBUG
        this.logInfo("updateNavigationBar, currentPane: " + this.currentPane +
                     ", currentUI: " + this.currentUIConfig);
        //<DEBUG

        if (this.showLeftButton) {
            if (this.leftButton == null) {
                this.leftButton = this.createAutoChild("leftButton", {
                    title: this.leftButtonTitle
                    
                });
            } else {
                this.leftButton.setTitle(this.leftButtonTitle);
                
            }
        }

        // When showing detail view on a handset we show the navigation bar
        // but repurpose it as a detail navigation bar.
        //      - custom left button to return to navigation pane
        //      - Detail pane title
        //      - custom right button based on 'detail nav control'  
        if ((this.currentUIConfig === "handset" && this.currentPane !== "navigation") ||
            (this.currentUIConfig === "portrait" && this.currentPane !== "navigation") ||
            (this.currentUIConfig === "landscape" && this.currentPane !== "navigation" && this._hasListPane()))
        {
            // In portrait mode we show the nav or list pane
            // and the detail pane at the same time
            // In this case the title should reflect the current pane visible on the left
            var title;
            if (this.currentUIConfig === "landscape") {
                title = (this._hasListPane() ? this.listTitle
                                             : this.navigationTitle);
            } else if (this.currentUIConfig === "portrait") {
                title = (this._hasListPane() && this.currentPane !== "navigation" ? this.listTitle
                                                                                  : this.navigationTitle);
            } else {
                title = (this.currentPane === "detail"
                         ? this.detailTitle 
                         : (this.currentPane === "list"
                            ? this.listTitle
                            : this.navigationTitle));
            }
            if (!title) title = "&nbsp;";

            newViewState.title = title;

            var backButtonTitle;
            if (this._overriddenBackButtonTitle != null) {
                backButtonTitle = this._overriddenBackButtonTitle;
            } else {
                backButtonTitle =
                    this.isHandset() && this.currentPane === "detail" && this._hasListPane()
                        ? this.listTitle
                        : this.navigationTitle;
            }
            newViewState.leftButtonTitle = backButtonTitle;

            newViewState.showLeftButton = (this.currentUIConfig !== "portrait" || this._hasListPane());

            controls.add("leftButton");

        // default behavior - navigation bar shows navigation title and controls
        // specified by the developer (so update title, icons, visibility)
        } else {
            if (this.currentUIConfig === "desktop" && this.showNavigationBar == null &&
                !this.navigationTitle && !this.showRightButton && !this.showLeftButton)
            {
                navigationBar.hide();
                newViewState.title = isc.nbsp;
            } else {
                navigationBar.show();
                if (!navigationBar.isDrawn() && (navigationBar.parentElement == null ||
                                                 navigationBar.parentElement.isDrawn()))
                {
                    navigationBar.draw();
                }
                newViewState.title = (this.navigationTitle || isc.nbsp);
            }

            newViewState.showLeftButton = false;
            newViewState.leftButtonTitle = null;
        }

        if (this.showLeftButton) {
            controls.add(this.leftButton);
        }
        controls.add("titleLabel");
        if (this.detailNavigationControl != null) {
            controls.add(this.detailNavigationControl);
        }
        if (this.showMiniNav && this.currentUIConfig === "handset" && this.currentPane === "detail") {
            controls.add("miniNavControl");
        }
        if (this.showRightButton) {
            controls.add("rightButton");
        }

        newViewState.rightButtonTitle = this.rightButtonTitle;
        newViewState.showRightButton = this.showRightButton;

        if (this.currentUIConfig === "portrait") {
        } else if (this.currentUIConfig === "landscape") {
            var styleName = (this.navigationBarProperties && this.navigationBarProperties.styleName) ||
                            (this.navigationBarDefaults && this.navigationBarDefaults.styleName) ||
                            this.navigationBar.getClass().getInstanceProperty("styleName");
            navigationBar.setStyleName(styleName);
        }

        var navigationBarUsingCSSTransitions = (isc.Browser._supportsCSSTransitions &&
                                                navigationBar.skinUsesCSSTransitions);
        navigationBar.setViewState(newViewState, direction, navigationBarUsingCSSTransitions);
    },

    
    getUIConfiguration : function () {
        if (this.isHandset()) return "handset";
        else if (this.isTablet() && this.getPageOrientation() === "portrait") return "portrait";
        else if (this.isTablet() && this.getPageOrientation() === "landscape") return "landscape";
        else return "desktop";
    },

    //> @attr splitPane.showLeftButton (boolean : false : IRW)
    // Should the +link{splitPane.leftButton} be shown in the 
    // +link{splitPane.navigationBar, navigation bar}?
    // <p>
    // When set to true, the +link{splitPane.leftButton} is displayed to the left of the 
    // +link{splitPane.navigationTitle}, and to the right of the +link{splitPane.backButton},
    // when +link{splitPane.deviceMode} is not "desktop".
    // <P>
    // @see splitPane.leftButton
    // @see splitPane.backButton
    //
    // @visibility external
    //<
    showLeftButton:false,

    //> @method splitPane.setShowLeftButton()
    // Show or hide the +link{SplitPane.leftButton,leftButton} in the navigation bar.
    // @param show (boolean) if <code>true</code>, the <code>leftButton</code> will be shown,
    // otherwise hidden.
    // @visibility external
    //<
    setShowLeftButton : function (show) {
        this.showLeftButton = show;
        this.updateNavigationBar();
    },

    //> @method splitPane.setLeftButtonTitle()
    // Setter for the +link{NavigationBar.leftButtonTitle,leftButtonTitle} of the
    // +link{SplitPane.navigationBar,navigationBar}.
    //
    // @param newTitle (HTMLString) new title for the left button.
    // @visibility external
    //<
    setLeftButtonTitle : function (newTitle) {
        this.leftButtonTitle = newTitle;
        this.updateNavigationBar();
    },

    

    //> @attr splitPane.showRightButton (boolean : false : IRW)
    // Should the +link{NavigationBar.rightButton,rightButton} be shown in the
    // +link{SplitPane.navigationBar,navigationBar}?
    //
    // @visibility external
    //<
    showRightButton:false,

    //> @method splitPane.setShowRightButton()
    // Show or hide the +link{NavigationBar.rightButton,rightButton} of the
    // +link{SplitPane.navigationBar,navigationBar}.
    //
    // @param visible (boolean) if <code>true</code>, the button will be shown, otherwise hidden.
    // @visibility external
    //<
    setShowRightButton : function (show) {
        this.showRightButton = show;
        this.updateNavigationBar();
    },

    //> @method splitPane.setRightButtonTitle()
    // Setter for the +link{NavigationBar.rightButtonTitle,rightButtonTitle} of the
    // +link{SplitPane.navigationBar,navigationBar}.
    //
    // @param newTitle (HTMLString) new title for the right button.
    // @visibility external
    //<
    setRightButtonTitle : function (newTitle) {
        this.rightButtonTitle = newTitle;
        this.updateNavigationBar();
    },

    

    _setNavigationPane : function (pane) {
        var oldNavigationPane = this.navigationPane;

        if (oldNavigationPane != null) {
            if (oldNavigationPane === pane) return;

            delete oldNavigationPane.splitPane;
            this._ignorePane("navigation", oldNavigationPane); // will no-op if not observing
        }

        this.navigationPane = pane;
        if (pane != null) {
            pane.resizeTo("100%", pane._userHeight != null ? null : "100%");
            pane.splitPane = this;
            if (this.autoNavigate) this._observePane("navigation", pane);
        }

        if (this.isTablet() || this.isHandset()) {
            var pages = [];
            if (pane != null) pages.add(pane);
            if (this.listPane != null) pages.add(this.listPane);
            if (this.isHandset()) pages.add(this._getDetailPaneContainer());
            this._pagedPanel.setPages(pages);
        }
    },

    //> @method splitPane.setNavigationPane()
    // Update the +link{SplitPane.navigationPane,navigationPane} at runtime.
    // @param pane (Canvas) new navigation pane for this widget.
    // @visibility external
    //<
    setNavigationPane : function (pane) {
        this._setNavigationPane(pane);
        this.updateUI(true);
    },

    //> @method splitPane.setNavigationTitle()
    // Sets the title for the +link{SplitPane.navigationPane,navigationPane}.
    // @param title (HTMLString) new title for the navigation pane.
    // @visibility external
    //< 
    setNavigationTitle : function (title) {
        this.navigationTitle = title;
        this.updateNavigationBar();
    },

    //> @method splitPane.showNavigationPane()
    // Causes a transition to the +link{SplitPane.navigationPane,navigationPane}.
    // @param [direction] (NavigationDirection) when +link{attr:animateNavigationBarStateChanges}
    // is <code>true</code>, this is the direction passed to +link{NavigationBar.setViewState()}.
    // @visibility external
    //<
    
    showNavigationPane : function (direction, fromHistoryCallback, forceUIRefresh, autoNavigate)
    {
        if (!this.navigationPane || !this.navigationPane.isVisible()) forceUIRefresh = true;

        var currentPane = this.currentPane,
            changed = currentPane != null && currentPane !== "navigation";
        this.currentPane = "navigation";
        // If coming from the history callback, then we need to refresh the UI because the
        // navigation title might be different.
        this.updateUI(fromHistoryCallback || forceUIRefresh, direction);

        if (changed) {
            if (!fromHistoryCallback) {
                this._maybeAddHistoryEntry();
            }
            delete this._overriddenBackButtonTitle;

            if (this.isDrawn()) {
                var method = this._getNavigationMethod(direction, fromHistoryCallback,
                                                       forceUIRefresh, autoNavigate);
                this._paneChanged("navigation", currentPane, method);
            }
        }
    },

    _paneChanged : function (newPane, oldPane, method) {
        if (this.autoNavigate) delete this._ignoreRecordClick;
        if (this.paneChanged != null) this.paneChanged(newPane, oldPane, method);
    },

    _hasListPane : function () {
        return this.listPane != null;
    },

    _setListPane : function (pane) {
        if (this._hasListPane()) {
            var oldListPane = this.listPane;
            if (oldListPane === pane) return;

            delete oldListPane.splitPane;
            this._ignorePane("list", oldListPane); // will no-op if not observing
        }

        this.listPane = pane;
        // Since the listPane is optional, it may be set to null.
        if (pane != null) {
            pane.resizeTo("100%", pane._userHeight != null ? null : "100%");
            pane.splitPane = this;
            if (this.autoNavigate) this._observePane("list", pane);
        }

        if (this.isTablet() || this.isHandset()) {
            var pages = [];
            if (this.navigationPane != null) pages.add(this.navigationPane);
            if (pane != null) pages.add(pane);
            if (this.isHandset()) pages.add(this._getDetailPaneContainer());
            this._pagedPanel.setPages(pages);
        }
    },

    //> @method splitPane.setListPane()
    // Sets a new +link{SplitPane.listPane,listPane} at runtime.
    // @param pane (Canvas) new list pane for this widget.
    // @visibility external
    //<
    setListPane : function (pane) {
        this._setListPane(pane);
        this.updateUI(true);
    },

    //> @method splitPane.showListPane()
    // Causes a transition to the +link{SplitPane.listPane,listPane}, optionally updating the
    // +link{SplitPane.setListTitle(),list title}.
    // <p>
    // If, based on the +link{SplitPane.deviceMode,deviceMode} and +link{SplitPane.pageOrientation,pageOrientation},
    // this causes the +link{SplitPane.navigationPane,navigationPane} to be hidden, the
    // +link{SplitPane.backButton,back button} will be updated with the current title of the
    // <code>navigationPane</code>, or the <code>backButtonTitle</code> passed to this method.
    // When +link{SplitPane.addHistoryEntries} is enabled and <code>backButtonTitle</code> is passed,
    // then <code>backButtonTitle</code> will be used for the back button title if the user goes
    // back to the <code>listPane</code>.
    //
    // @param [listPaneTitle] (HTMLString) optional new list title.
    // @param [backButtonTitle] (HTMLString) optional new title for the +link{SplitPane.backButton,back button}.
    // @param [direction] (NavigationDirection) when +link{attr:animateNavigationBarStateChanges}
    // is <code>true</code>, this is the direction passed to +link{NavigationBar.setViewState()}.
    // @visibility external
    //<
    
    showListPane : function (listPaneTitle, backButtonTitle, direction, fromHistoryCallback, 
                             forceUIRefresh, autoNavigate) 
    {
        if (!this._hasListPane()) {
            this.logWarn("Attempted to show the list pane, but this SplitPane does not have a list pane. Ignoring.");
            return;
        }

        if (!this.listPane || !this.listPane.isVisible()) forceUIRefresh = true;

        var currentPane = this.currentPane,
            changed = this.currentPane !== "list";

        // update title from listPaneTitle unless it should come from the dynamicProperty
        if (autoNavigate && this.hasDynamicProperty("listTitle")) forceUIRefresh = true;
        else if (listPaneTitle != null) this.listTitle = listPaneTitle;

        if (backButtonTitle != null) this._overriddenBackButtonTitle = backButtonTitle;
        this.currentPane = "list";
        // If coming from the history callback, then we need to refresh the UI because the
        // list title might be different or there might be an overridden back button title.
        this.updateUI(listPaneTitle != null || backButtonTitle != null ||
                      fromHistoryCallback || forceUIRefresh, direction);

        if (changed) {
            if (!fromHistoryCallback) {
                this._maybeAddHistoryEntry();
            }
            delete this._overriddenBackButtonTitle;

            if (this.isDrawn()) {
                var method = this._getNavigationMethod(direction, fromHistoryCallback,
                                                       forceUIRefresh, autoNavigate);
                this._paneChanged("list", currentPane, method);
            }
        }
    },

    //> @method splitPane.setListTitle()
    // Sets the title for the +link{SplitPane.listPane,listPane}.
    // @param title (HTMLString) new title for the list pane.
    // @visibility external
    //<
    setListTitle : function (title) {
        this.listTitle = title;

        
        this.updateNavigationBar();
        this.updateListToolStrip();
        this.updateDetailToolStrip();
    },

    _hasDetailPane : function () {
        return this.detailPane != null;
    },

    _setDetailPane : function (pane) {
        if (this.detailPane != null) {
            delete this.detailPane.splitPane;
        }
        this.detailPane = pane;
        if (pane) {
            pane.resizeTo("100%", pane._userHeight != null ? null : "100%");
            pane.splitPane = this;
        }

        if (this.isHandset()) {
            var pages = [];
            if (this.navigationPane != null) pages.add(this.navigationPane);
            if (this.listPane != null) pages.add(this.listPane);
            pages.add(this._getDetailPaneContainer());
            this._pagedPanel.setPages(pages);
        }
    },

    //> @method splitPane.setDetailPane()
    // Sets a new +link{SplitPane.detailPane,detailPane} at runtime.
    // @param pane (Canvas) new detail pane for this widget.
    // @visibility external
    //<
    setDetailPane : function (pane) {
        this._setDetailPane(pane);
        this.updateUI(true);
    },

    //> @method splitPane.showDetailPane()
    // Causes a transition to the +link{SplitPane.detailPane,detailPane}, optionally updating
    // the +link{SplitPane.setDetailTitle(),detail title}.
    // <p>
    // If, based on the +link{SplitPane.deviceMode,deviceMode} and +link{SplitPane.pageOrientation,pageOrientation},
    // this causes the +link{SplitPane.navigationPane,navigationPane} or +link{SplitPane.listPane,listPane}
    // to be hidden, the +link{SplitPane.backButton,back button} will be updated
    // with the current title of the <code>navigationPane</code> or <code>listPane</code>, or the
    // <code>backButtonTitle</code> passed to this method. When +link{SplitPane.addHistoryEntries}
    // is enabled and <code>backButtonTitle</code> is passed, then <code>backButtonTitle</code>
    // will be used for the back button title if the user goes back to the <code>detailPane</code>.
    //
    // @param [detailPaneTitle] (HTMLString) optional new +link{SplitPane.detailTitle,detail title}.
    // @param [backButtonTitle] (HTMLString) optional new title for the +link{SplitPane.backButton,back button}.
    // @param [direction] (NavigationDirection) when +link{attr:animateNavigationBarStateChanges}
    // is <code>true</code>, this is the direction passed to +link{NavigationBar.setViewState()}.
    // @visibility external
    //<
    
    showDetailPane : function (detailPaneTitle, backButtonTitle, direction, fromHistoryCallback,
                               forceUIRefresh, autoNavigate) 
    {
        if (!this.detailPane || !this.detailPane.isVisible()) forceUIRefresh = true;

        var currentPane = this.currentPane,
            changed = this.currentPane !== "detail";

        // update title from detailPaneTitle unless it should come from the dynamicProperty
        if (autoNavigate && this.hasDynamicProperty("detailTitle")) forceUIRefresh = true;
        else if (detailPaneTitle != null) this.detailTitle = detailPaneTitle;

        if (backButtonTitle != null) this._overriddenBackButtonTitle = backButtonTitle;
        this.currentPane = "detail";
        // If coming from the history callback, then we need to refresh the UI because the
        // detail title might be different or there might be an overridden back button title.
        this.updateUI(detailPaneTitle != null || backButtonTitle != null ||
                      fromHistoryCallback || forceUIRefresh, direction);

        if (changed) {
            if (!fromHistoryCallback) {
                this._maybeAddHistoryEntry();
            }
            delete this._overriddenBackButtonTitle;

            if (this.isDrawn()) {
                var method = this._getNavigationMethod(direction, fromHistoryCallback,
                                                       forceUIRefresh, autoNavigate);
                this._paneChanged("detail", currentPane, method);
            }
        }
    },

    //> @method splitPane.setDetailTitle()
    // Sets the title for the +link{SplitPane.detailPane,detailPane}.
    // @param title (HTMLString) new title for the detail pane.
    // @visibility external
    //<
    setDetailTitle : function (title) {
        this.detailTitle = title;
        // In handset mode we need to update the navigation bar
        // otherwise we'll update the detailToolStrip
        if (this.currentUIConfig === "handset") {
            if (this.currentPane === "detail") this.updateNavigationBar();
        } else {
            this.updateDetailToolStrip();
        }
    },

    //> @attr splitPane.detailNavigationControl (Canvas : null : IRWA)
    // Navigation control that appears only when the navigation pane is not showing (showing detail
    // pane on handset, or portrait mode on tablet).
    // <p>
    // See also +link{showMiniNav} for a way to enable a built-in control.
    // @visibility external
    //<

    //> @method splitPane.setDetailNavigationControl()
    // Navigation control that appears only when the navigation pane is not showing (showing detail
    // pane on handset, or portrait mode on tablet).
    // @param control (Canvas) 
    // @visibility external
    //<
    setDetailNavigationControl : function (canvas) {
        this.detailNavigationControl = canvas;
        var updateUI = this.currentUIConfig !== "landscape" && this.currentPane === "detail";
        if (updateUI) this.updateUI(true);
    },

    _parsePaneTitleTemplate : function(template, paneDBC) {
        if (!isc.isA.DataBoundComponent(paneDBC)) return "";

        var selectedRecord = paneDBC.getSelectedRecord(),
            paneDS = paneDBC.getDataSource()
        ;
        // set up the available template variables before calling evalDynamicString()
        var variables = {
            titleField: (!selectedRecord || !paneDS) ? "" :
                          selectedRecord[paneDS.getTitleField()],
            index: selectedRecord == null ? -1 : paneDBC.getRecordIndex(selectedRecord),
            totalRows: paneDBC.getTotalRows ? paneDBC.getTotalRows() : 1,
            record: selectedRecord
        };

        return template.evalDynamicString(this, variables);
    },

    //> @attr splitPane.listPaneTitleTemplate (HTMLString : "${titleField}" : IRW)
    // Default value chosen for +link{splitPane.setListTitle,listPaneTitle} when +link{navigateListPane()} is called.
    // <p>
    // Available variables are:
    // <ul>
    // <li> "titleField" - the value of the +link{DataSource.titleField} in the selected record from
    // the +link{navigationPane}
    // <li> "index" - position of the selected record
    // <li> "totalRows" - total number of rows in the component where the record is selected
    // <li> "record" - the entire selected Record
    // </ul>
    // @see SplitPane.detailPaneTitleTemplate
    // @example layoutSplitPane
    // @group i18nMessages
    // @visibility external
    //<
    listPaneTitleTemplate: "${titleField}",

    //> @method splitPane.setListPaneTitleTemplate()
    // Sets a new +link{SplitPane.listPaneTitleTemplate,listPaneTitleTemplate} at runtime.
    // <p>
    // By calling this method it is assumed you want the list pane title to change to the new
    // template.
    //
    // @param template (HTMLString) new template, can use HTML to be styled.
    // @visibility external
    //<
    setListPaneTitleTemplate : function (template) {
        this.listPaneTitleTemplate = template;
        var navigationDBC = this.navigationPane ?
            this._getNavigatePaneComponent("navigation", this.navigationPane) : null;
        this.setListTitle(this._parsePaneTitleTemplate(template, navigationDBC));
    },

    //> @attr splitPane.detailPaneTitleTemplate (HTMLString : "${titleField}" : IRW)
    // Default value chosen for +link{SplitPane.setDetailTitle,detailPaneTitle} when +link{navigateDetailPane()} is called.
    // <p>
    // Available variables are the same as for +link{listPaneTitleTemplate}.
    // @see SplitPane.listPaneTitleTemplate
    // @example layoutSplitPane
    // @group i18nMessages
    // @visibility external
    //<
    detailPaneTitleTemplate: "${titleField}",

    //> @method splitPane.setDetailPaneTitleTemplate()
    // Sets a new +link{SplitPane.detailPaneTitleTemplate,detailPaneTitleTemplate} at runtime.
    // <p>
    // By calling this method it is assumed you want the detail pane title to change to the new
    // template.
    //
    // @param template (HTMLString) new template, can use HTML to be styled.
    // @visibility external
    //<
    setDetailPaneTitleTemplate : function (template) {
        this.detailPaneTitleTemplate = template;
        var listDBC = this.listPane ?
            this._getNavigatePaneComponent("list", this.listPane) : null;
        this.setDetailTitle(this._parsePaneTitleTemplate(template, listDBC));
    },

    //> @attr splitPane.autoNavigate (boolean : true : IR)
    // If set, the <code>SplitPane</code> will automatically monitor selection changes in the
    // +link{navigationPane} and +link{listPane}, and call +link{navigateListPane()} or
    // +link{navigateDetailPane()} when selections are changed.
    // <p>
    // If a pane is not a +link{DataBoundComponent}, but contains a component (selected via a
    // breadth-first search), then that inner component will be monitored for selection changes
    // instead.  In either case, <code>autoNavigate</code> does nothing unless the monitored
    // component has a valid +link{DataSource} and there is a DataSource relationship declared
    // between panes.  Note that for +link{Layout}s, the +link{layout.members,members} will be
    // searched when looking for a component rather than the +link{canvas.children,children}.
    // <p>
    // The selection of the pane or pane inner component for monitoring is done only when the
    // <code>SplitPane</code> is created, and when a new +link{navigationPane} or
    // +link{listPane} is assigned, except when the <code>SplitPane</code> is in
    // +link{Canvas.setEditMode,edit mode} (e.g. when using +link{group:reify,Reify}). where the
    // component redetection logic gets run every time a pane's widget hierarchy changes.
    // @example layoutSplitPaneAutoNavigate
    // @visibility external
    //<
    autoNavigate: true,

    
    navigationId: 0,

    //> @method splitPane.navigatePane()
    // Causes the target pane component to load data and update its title based on the current
    // selection in the source pane.  Also shows the target pane if it's not already visible.
    // <p>
    // For the target pane to load data, both the source pane and target pane must be
    // +link{DataBoundComponent}s or contain a component as a descendant widget, and have a
    // +link{DataSource}, and either:
    // <ul>
    // <li> The two DataSources must have a Many-To-One relationship declared via
    // +link{dataSourceField.foreignKey}, so that +link{listGrid.fetchRelatedData()} can be
    // used on the target pane.  A common example of this would be navigation from a source
    // pane that's a +link{TreeGrid} to a +link{ListGrid} target.
    // <li> The two DataSources must be the same, so that the record selected in the source pane
    // can be displayed in the target pane via simply calling +link{detailViewer.setData(),
    // setData()}.  This would apply, for example, if the source pane is a +link{ListGrid} and
    // the target is a +link{DynamicForm}, so that +link{DynamicForm.editRecord(),editRecord()}
    // gets called, or if the target is a +link{DetailViewer}.
    // </ul>
    // For purposes of this check, if the pane is not itself a component, we will use the first
    // component we can find in a breath-first search of the hierarchy underneath it.  Note that
    // one or more records must be selected in the source component for related data to be
    // loaded (which should be automatically true for +link{autoNavigate,auto-navigation}).
    // <P>
    // Even if we can't load related data into the target pane by the above rules, we'll still
    // show the target pane if it's not already visible, except during +link{autoNavigate,
    // auto-navigation}.
    // <P>
    // The default <code>target</code> is
    // <smartclient>"list"</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.CurrentPane#LIST}</smartgwt>
    // if the +link{SplitPane.listPane,listPane} is present,
    // otherwise
    // <smartclient>"detail".</smartclient>
    // <smartgwt>{@link com.smartgwt.client.types.CurrentPane#DETAIL}.</smartgwt>
    // <p>
    // The title applied to the target pane is based on +link{listPaneTitleTemplate} if the target
    // pane is the <code>listPane</code>, otherwise +link{detailPaneTitleTemplate}.
    // <p>
    // The source pane usually does not need to be specified: if the
    // target pane is the <code>detailPane</code>, the default source pane
    // is the <code>listPane</code> if present, otherwise the +link{navigationPane}.  If the
    // target pane is the <code>listPane</code>, the source pane is always
    // the <code>navigationPane</code>.
    //
    // @param [target] (CurrentPane) pane that should navigate
    // @param [title] (HTMLString) optional title to use for target pane. If not specified, the
    // title is based on +link{listPaneTitleTemplate} if the target pane is the <code>listPane</code>,
    // otherwise +link{detailPaneTitleTemplate}.
    // @param [source] (CurrentPane) source pane used for selection
    // @visibility external
    //<
    
    navigatePane : function (target, title, source, isAuto) {
        var targetPane,
            logLevel = isAuto ? isc.Log.INFO : isc.Log.WARN;
        if (isc.isA.Canvas(target)) {
            if (target === this.navigationPane) {
                targetPane = target;
                target = "navigation";
            } else if (target === this.listPane) {
                targetPane = target;
                target = "list";
            } else if (target === this.detailPane) {
                targetPane = target;
                target = "detail";
            } else {
                
                this.logWarn("navigatePane(): Unknown target pane:" + isc.echoLeaf(target) +
                             ". Will use the default target pane.");
                target = null;
            }

        } else {
            if (target === "navigation") {
                targetPane = this.navigationPane;
            } else if (target === "list") {
                targetPane = this.listPane;
                if (targetPane == null) {
                    this.logMessage(logLevel, "navigatePane(): The listPane cannot be the " +
                                    "target because there isn't a listPane set. Will default " +
                                    "to the detailPane.");
                }
            } else if (target === "detail") {
                targetPane = this.detailPane;
            }
            
        }

        // default targetPane; bail out if it's still not set
        if (targetPane == null) {
            if (this._hasListPane()) {
                target = "list";
                targetPane = this.listPane;
            } else {
                target = "detail";
                targetPane = this.detailPane;
            }
        }
        if (targetPane == null) {
            this.logInfo("navigatePane(): unable to navigate - can't resolve the targetPane");
            return;
        }

        // default the source based on currentPane
        
        if (source == null) source = this.currentPane;

        var sourcePane;
        if (isc.isA.Canvas(source)) {
            if (source === this.navigationPane) {
                sourcePane = source;
                source = "navigation";
            } else if (source === this.listPane) {
                sourcePane = source;
                source = "list";
            } else if (source === this.detailPane) {
                sourcePane = source;
                source = "detail";
            } else {
                
                this.logWarn("navigatePane(): Unknown source pane:" + isc.echoLeaf(source) +
                             ". Will use the default source pane.");
                source = null;
            }

        } else {
            if (source === "navigation") {
                sourcePane = this.navigationPane;
            } else if (source === "list") {
                sourcePane = this.listPane;
                if (sourcePane == null) {
                    this.logMessage(logLevel, "navigatePane(): The listPane cannot be the " +
                                    "source because there isn't a listPane set. Will use " +
                                    "the default source pane.");
                }
            } else if (source === "detail") {
                sourcePane = this.detailPane;
            }
            
        }

        // default sourcePane; bail out if it's still not set
        if (sourcePane == null) {
            if (target === "detail" && this._hasListPane()) {
                source = "list";
                sourcePane = this.listPane;
            } else {
                source = "navigation";
                sourcePane = this.navigationPane;
            }
        }
        if (sourcePane == null) {
            this.logInfo("navigatePane(): unable to navigate - can't resolve the sourcePane");
            return;
        }

        // retrieve sourceDBC from sourcePane; may be pane itself or descendant canvas
        var sourceDBC = this._getNavigatePaneComponent("source", sourcePane);
        if (!sourceDBC) {
            this.logMessage(logLevel, "navigatePane(): source pane isn't a DataBoundComponent");
        }
        // retrieve targetDBC from targetPane; may be pane itself or descendant canvas
        var targetDBC = this._getNavigatePaneComponent("target", targetPane);
        if (!targetDBC) {
            this.logMessage(logLevel, "navigatePane(): target pane isn't a DataBoundComponent");
        }

        
        var navigateOnFetch;
        if (sourceDBC && targetDBC && sourceDBC != targetDBC) {
            var record = sourceDBC.getSelectedRecord();
            if (record) {
                if (sourceDBC.getDataSource() == targetDBC.getDataSource()) {
                    if (targetDBC.editRecord) targetDBC.editRecord(record);
                    else                      targetDBC.setData([record]);
                    navigateOnFetch = false;
                } else {
                    var splitPane = this,
                        id = ++this.navigationId;
                    navigateOnFetch = targetDBC.fetchRelatedData(record, sourceDBC, function ()
                    {
                        splitPane._completeNavigatePane(title, target, sourceDBC, id, !!isAuto);
                    }, null, true);
                }
            } else {
                this.logInfo("navigatePane(): no selected record(s) found for " + sourceDBC);
            }
        }
        // server won't be hit so navigate immediately
        if (!navigateOnFetch) {
            if (navigateOnFetch == null && isAuto) {
                this.logInfo("navigatePane(): unable to auto-navigate as proper source and " +
                             "target panes with related DataSources were not located");
            } else {
                this._completeNavigatePane(title, target, sourceDBC, ++this.navigationId,
                                           !!isAuto);
            }
        }
    },

    // actually perform the navigation, run as a callback if the server is hit
    _completeNavigatePane : function (titleToSet, target, sourceDBC, id, isAuto) {
        if (id != this.navigationId) {
            this.logInfo("navigatePane(): skipping delayed navigation to " + target +
                         " as another navigation has already been completed");
            return;
        }

        
        if (sourceDBC && !sourceDBC.getSelectedRecord()) sourceDBC = null;

        switch (target) {
        case "list":
            if (titleToSet == null && this.listPaneTitleTemplate != null && sourceDBC) {
                titleToSet = this._parsePaneTitleTemplate(this.listPaneTitleTemplate, 
                                                          sourceDBC);
            }
            this.showListPane(titleToSet, null, "forward", null, null, isAuto);
            break;

        case "detail":
            if (titleToSet == null && this.detailPaneTitleTemplate != null && sourceDBC) {
                titleToSet = this._parsePaneTitleTemplate(this.detailPaneTitleTemplate, 
                                                          sourceDBC);
            }
            this.showDetailPane(titleToSet, null, "forward", null, null, isAuto);
            break;

        case "navigation":
            this.showNavigationPane("forward", null, null, isAuto);
            break;
        }
    },

    _getNavigationMethod : function (direction, fromHistoryCallback, forceUIRefresh,
                                     autoNavigate)
    {
        if (autoNavigate != null) {
            return autoNavigate ? "selectionChanged" : "navigatePane";
        } else if (forceUIRefresh != null) {
            return direction == "back" ? "backClick" : "sideClick";
        } else if (fromHistoryCallback) {
            return "historyCallback";
        }
        return "programmatic";
    },

    // return pane canvas if it's a DBC; otherwise the first breadth-first DBC descendant
    _getNavigatePaneComponent : function (paneName, paneCanvas) {
        if (isc.isA.DataBoundComponent(paneCanvas)) return paneCanvas;

        var children = paneCanvas.members || paneCanvas.children,
            component = children ? this.__getNavigatePaneComponent(children) : null;
        if (component) {
            this.logInfo("navigatePane(): using child canvas " + component + " for the " +
                paneName + " pane since " + paneCanvas + " isn't a DataBoundComponent");
        }
        return component;
    },

    
    __getNavigatePaneComponent : function (canvasSearchList) {
        var children = [];
        for (var i = 0; i < canvasSearchList.length; i++) {
            var canvas = canvasSearchList[i];
            if (isc.isA.DataBoundComponent(canvas)) {
                return canvas;
            }
            children.addList(canvas.members || canvas.children);
        }
        return children.length ? this.__getNavigatePaneComponent(children) : null;
    },

    // start observing selectionUpdated() and recordClick() (if defined) on the navigation pane
    
    _observePane : function (paneName, paneCanvas, paneEdit) {
        var target = paneName == "list" ? "detail" : "list",
            component = this._getNavigatePaneComponent(paneName, paneCanvas)
        ;
        // EditMode (Reify) - called when children added to/removed from pane hierarchy
        if (paneEdit) {
            if (paneCanvas._paneComponent == component) return;
            this._ignorePane(paneName, paneCanvas);
        }

        //  no component found, so nothing to observe
        if (!component) return;        

        // remember observed component for ignore()
        paneCanvas._paneComponent = component;

        // primarily observe selection changes to trigger navigation
        this.observe(component, "selectionUpdated", function () {
            this.navigatePane(target, null, paneName, true);
            this._ignoreRecordClick = true;
        });
        // observe recordClick() if present to pick up clicks on an already-selected record
        if (component.recordClick) this.observe(component, "recordClick", function () {
            if (this._ignoreRecordClick || this.currentPane != paneName) return;
            this.navigatePane(target, null, paneName, true);
        });
    },

    // stop observing selectionUpdated() and recordClick() (if defined) on the list pane
    _ignorePane : function (paneName, paneCanvas) {
        var component = paneCanvas._paneComponent;
        delete paneCanvas._paneComponent;
        if (!component) return;

        this.ignore(component, "selectionUpdated");
        this.ignore(component, "recordClick");
    },
    
    //> @method splitPane.navigateListPane()
    // Calls +link{navigatePane} with the +link{listPane} as the target pane.
    // @param [title] (HTMLString) optional title to use instead of the automatically chosen one
    //
    // @visibility external
    //<
    navigateListPane : function (title) {
        this.navigatePane("list", title, "navigation");
    },

    //> @method splitPane.navigateDetailPane()
    // Calls +link{navigatePane} with the +link{detailPane} as the target pane.
    // @param [title] (HTMLString) optional title to use instead of the automatically chosen one
    //
    // @visibility external
    //<
    navigateDetailPane : function (title) {
        this.navigatePane("detail", title, "list");
    }
});

isc.SplitPane.registerStringMethods({
    //> @method splitPane.navigationClick()
    // Notification method fired when the user clicks the default back / forward buttons
    // on the navigation bar for this <code>SplitPane</code>.
    // <P>
    // Note that the return value will be ignored and cancelation won't be possible if
    // +link{notifyAfterNavigationClick} has been set true, since that forces this method to run
    // after we've already navigated to the new pane.
    // @param direction (NavigationDirection) direction in which the user is attempting to navigate.
    // @return (Boolean) false to cancel navigation
    // @visibility external
    //<
    navigationClick : "direction",

    //> @method splitPane.paneChanged()
    // Notification fired when the +link{SplitPane.currentPane} changes, either due to end-user
    // action or due to a programmatic call to +link{SplitPane.setCurrentPane(),setCurrentPane()}
    // or other APIs that can change the pane.
    // <p>
    // Note that depending on the +link{DeviceMode}, this event may not signal that any pane has
    // actually been shown or hidden, since in some modes multiple panes are shown simultaneously.
    // <p>
    // Never fires while the <code>SplitPane</code> is not drawn.
    //
    // @param newPane (CurrentPane) new +link{SplitPane.currentPane} value.
    // @param oldPane (CurrentPane) old +link{SplitPane.currentPane} value.
    // @param navigationMethod (NavigationMethod) reason for pane change
    // @visibility external
    //<
    
    paneChanged : "newPane, oldPane, navigationMethod",

    //> @method splitPane.upClick()
    // Notification method fired when the +link{SplitPane.showMiniNav,miniNav is showing} and the
    // up button on the +link{SplitPane.navigationBar,navigationBar}'s +link{MiniNavControl} is
    // clicked.
    //
    // @include NavigationBar.upClick()
    //<
    upClick : "",

    //> @method splitPane.downClick()
    // Notification method fired when the +link{SplitPane.showMiniNav,miniNav is showing} and the
    // down button on the +link{SplitPane.navigationBar,navigationBar}'s +link{MiniNavControl} is
    // clicked.
    //
    // @include NavigationBar.downClick()
    //<
    downClick : ""
});

//> @class TriplePane
// This class is a synonym for SplitPane that can be used to make intent clearer.
// It is used by some development tools for that purpose.
//
// @inheritsFrom SplitPane
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("TriplePane", "SplitPane");

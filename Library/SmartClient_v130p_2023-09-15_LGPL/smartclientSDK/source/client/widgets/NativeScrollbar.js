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
//>	@class NativeScrollbar
//
// The NativeScrollbar widget will render in the browser as a native 
// scrollbar, and has APIs allowing it to be applied to scroll content any another widget
// on the page. Essentially this behaves similarly to the +link{Scrollbar} class but will
// be rendered as a native browser scrollbar rather than  using media, thus providing the
// advantages of an independant scrollbar (support for rendering the scrollbar separate from the
// content it effects, support for "virtual scrolling" mechanisms where content size is unknown
// at initial render, etc), with a native look and feel and without requiring the loading of
// additional media on the page.
// <P>
// To enable this for a component simply set +link{canvas.showCustomScrollbars} to true and
// set +link{canvas.scrollbarConstructor} to <code>"NativeScrollbar"</code>
//
// @inheritsFrom Canvas
// @treeLocation Client Reference/Foundation
// @visibility external
//<

// Implementation:
// The NativeScrollbar is overflow:"hidden". It renders an autoChild which shows native 
// scrollbars and has overflow set to "scroll".
// The autoChild is sized, and the NativeScrollbar is itself scrolled such that the
// scrollbars will show in the NativeScrollbar's viewport (while the rest of the auto-child is
// clipped).
// The autoChild is populated with content such that the scrollbars render at the expected
// size, and we react to the css scroll event by scrolling our scroll target.
// We share the same basic set of APIs as the Scrollbar widget so to get a native scrollbar
// appearance a widget needs to just set ScrollbarConstructor to "NativeScrollbar" (and
// showCustomScrollbars:true



isc.ClassFactory.defineClass("NativeScrollbar", "Canvas");

// Pick up Standard Scrollbar interface APIs
isc.NativeScrollbar.addProperties(isc._ScrollbarProperties);

isc.NativeScrollbar.addClassProperties({
    // NativeScrollbars will *always* render at the native browser SB size + 1px for the
    // spacer content.
    getScrollbarSize : function () {
        var nativeSize = isc.Element.getNativeScrollbarSize();
        if (nativeSize != 0) return nativeSize;
        
        return 16;
    }
});

isc.NativeScrollbar.addProperties({
    
    
    
    showCustomScrollbars:false,
    overflow:"hidden",
    
    //>	@attr nativeScrollbar.autoEnable (boolean : true : [IRWA])
    // If true, this scrollbar will automatically enable when the scrollTarget is
    // scrollable (i.e., when the contents of the scrollTarget exceed its clip size in the
    // direction relevant to this scrollbar), and automatically disable when the
    // scrollTarget is not scrollable. Set this property to false for full manual control
    // over a scrollbar's enabled state.
    // @visibility internal
    //<
    
	autoEnable:true,
	
    //scrollTarget:null,

    initWidget : function () {
        // If native SB size is reported as zero, assume these are native auto-hide sb's
        // which are shown dynamically as the user scrolls rather than always being visible.
        // In this case we'll typically float them over the widget handle, achieved via
        // canvas.floatingScrollbars=true
        // We'll also automatically hide/show the NativeScrollbar itself as the user
        // interacts with the SB
        this.autoHide = isc.Element.getNativeScrollbarSize() == 0;

        // Default to autoShow when the mouse moves over the target on Windows only
        // This matches native behavior
        
        if (this.autoHide && this.autoShowOnTargetMouseMove == null) {
            this.autoShowOnTargetMouseMove = isc.Browser.isWin;
        } 

        var scrollThickness = isc.NativeScrollbar.getScrollbarSize();
        // disallow a width/height that is not equal to native scrollbar size
        
        if (this.vertical) {
            this.setWidth(scrollThickness);
        } else {
            this.setHeight(scrollThickness);
        }
        
        this.setOverflow(isc.Canvas.HIDDEN);
        
        this.addAutoChild("scrollbarCanvas");
        this.sizeScrollbarCanvas();
        
        // initialize us for our scrollTarget
        this.setScrollTarget();
    
        // call setThumb to figure out how big and where the scrollbar thumb should be
        // note: this will enable and disable the scrollbar if autoEnable is true
        this.setThumb();

    },

    // show the autoHide:true SB on any mouseMove over the target widget if appropriate
    
    scrollTargetMouseMove : function () {
        if (this.autoHide && this.autoShowOnTargetMouseMove) {
            this.setScrollbarActive(true);
        }
    },
    
    // scrollbarCanvas autoChild
    // This is a child which actually shows native scrollbars.
    // We will clip this widget in our viewport to get the appearance we want,
    // and we'll respond to the user interacting with (scrolling) this widget to give us
    // the scroll events we need.
    scrollbarCanvasDefaults:{
        
        overflow:"scroll",
        showCustomScrollbars:false,

        
        canFocus: false,
        
        // parallels Scrollbar.thumbOut()
        mouseOut : function (event) {
            // For autoHide SB's a mouseOut should start this auto-hide timer
            if (this.creator.autoHide) this.creator.setInactiveOnPause();

            if (this.creator._shouldSuppressMouseOut(event)) {
                return isc.EH.STOP_BUBBLING;
            }
        },
        
        // Respond to a user scrolling this scrollbar by scrolling our scroll target
        _handleCSSScroll : function (waited, fromFocus) {
            this.Super("_handleCSSScroll", arguments);
            
            if (isc.Browser.isMoz && !waited && (fromFocus ||  isc.Browser.geckoVersion < 20030312))
            {
                return;
            }
            if (this._scrollingHandleDirectly) return;
            this.creator.scrollbarCanvasScrolled();
        },
        
        // On scrollbar resize, the scrollbarCanvas needs to also resize to stay at the
        // correct dimensions
        parentResized : function () {
            this.creator.sizeScrollbarCanvas();
            this.creator.adjustOverflow();
        },

        getScrollWidth : function (recalculate, a,b,c,d) {
            if (this.isDirty()) this.redraw("Immediate redraw to get scroll width"); // never return a stale scroll-size
            return this.Super("getScrollWidth", arguments);
        
        },
        getScrollHeight : function (recalculate, a,b,c,d) {
            if (this.isDirty()) this.redraw("Immediate redraw to get scroll height");
            return this.Super("getScrollHeight", arguments);
        },

        
        _getHandleOverflow : function () {
            if (isc.Element.getNativeScrollbarSize() != 0) {
                return this.Super("_getHandleOverflow", arguments);
            } else {
                var showHScrollbar = !this.creator.vertical || this.creator.showCorner,
                    showVScrollbar = this.creator.vertical || this.creator.showCorner;
                return [
                    (showHScrollbar ? "scroll" : "hidden"),
                    (showVScrollbar ? "scroll" : "hidden")
                ];
            }
        }
        
    },
    // The scrollbarCanvas will show H and V scrollbars
    // Size it to essentially match our length and be an arbitrary width (larger than the
    // native scrollbar thickness).
    // Everything but the scrollbar we're interested in will be clipped.
    scrollbarCanvasThickness:100,
    sizeScrollbarCanvas : function (showCornerChanged) {
        if (!this.scrollbarCanvas) return;

        var scrollThickness = isc.Element.getNativeScrollbarSize();

        
        if (showCornerChanged && scrollThickness == 0) {
            var sbc = this.scrollbarCanvas;
            var nativeOverflow = sbc._getHandleOverflow();
            var handle = sbc.getClipHandle();
            if (handle != null) {
                if (isc.isAn.Array(nativeOverflow)) {
                    handle.style.overflowX = nativeOverflow[0];
                    handle.style.overflowY = nativeOverflow[1];
                } else {
                    handle.overflow = nativeOverflow;
                }
            }
        }

        // native overflow:"scroll" always shows a corner at the bottom/right edge
        // (since there are 2 sb's showing).
        // size the sb lengthwise to clip the corner if showCorner is false
        
        var width = this.vertical ? this.scrollbarCanvasThickness 
                      : this.getInnerWidth() + (this.showCorner ? 0 : scrollThickness),
            height = !this.vertical ? this.scrollbarCanvasThickness 
                      : this.getInnerHeight() + (this.showCorner ? 0 : scrollThickness);
                      
        this.scrollbarCanvas.resizeTo(width,height);
    },
    _adjustOverflow : function () {
        this.Super("_adjustOverflow", arguments);
        // We have to keep the bottom/right edge of the scrollbarCanvas actually in view.
        // Negative top/left position on the scrollbarCanvas isn't allows so just scroll 
        // ourselves to the bottom/right
        
        if (this.vertical) {
            this.scrollToTop();
            this.scrollToRight();
        } else {
            this.scrollToLeft();
            this.scrollToBottom();
        }
	},
	
    // helper to force the thumb to appear
    // Achieve this by temporarily setting the scroll height to zero
    _forceThumb : function () {
        // Don't fire repeatedly
        if (this._suppressScrollEvents) return;

        var sbc = this.scrollbarCanvas;
        this._suppressScrollEvents = true;
        sbc.setContents(isc.Canvas.spacerHTML(1,1));
        sbc.spacerLength = 1;
        this.delayCall("_resetThumb");
    },
    _resetThumb : function () {
        this.setThumb();
        this._suppressScrollEvents = false;
    },

    //>	@method	nativeScrollbar.setThumb()	(A)
    // Resize the thumb so that the thumb's size relative to the track reflects the viewport size
    // relative to the overall scrollable area.
    //		@param	forceResize		(boolean)	if true, resize regardless of whether it is necessary
    //<
    setThumb : function () {

        // used when animating components for performance
        if (this._suppressSetThumb) return;
        var sbc = this.scrollbarCanvas,
        
            scrollingOn = (this._selfManaged || this.scrollTarget.canScroll(this.vertical)),
         
            spacerWidth = 1,
            spacerHeight = 1;
            
        if (scrollingOn) {
            
        
            // calculate size for thumb
            // NOTE: We use 'getViewportRatio()' here - this is required rather than looking at
            // the target's scroll height etc directly, for virtual scrolling
            var ratio = this.scrollTarget.getViewportRatio(this.vertical);
            
            // basically viewportHeight/scrollHeight = viewportRatio - so make content (scrollHeight)
            // into viewportHeight / ratio
            var viewportSize = (this.vertical ? sbc.getViewportHeight() : sbc.getViewportWidth()),
                spacerLength = ratio == 0 ? 0 : Math.round(viewportSize / ratio);
            if (this.vertical) spacerHeight = spacerLength;
            else spacerWidth = spacerLength;
        }
        // Show the SB if appropriate (it will auto hide on a delay)
        if (this.autoHide) {
            if (scrollingOn) {
                this.setScrollbarActive();
            } else {
                this.setScrollbarInactive();
            }
        }


        if (sbc.spacerLength != spacerLength) {  
            sbc.setContents(isc.Canvas.spacerHTML(spacerWidth,spacerHeight));
            sbc.spacerLength = spacerLength;
        }
        
        // now move the thumb according to the scroll
        this.moveThumb();
    },

    //>	@method	nativeScrollbar.setVisibility()	(A)
    // Extended to ensure thumb is placed correctly when this scrollbar is shown.
    //		@group	visibility
    //
    //		@param	newState		(boolean)	new visible state
    //<
    setVisibility : function (newState,b,c,d) {
        this.invokeSuper(isc.Scrollbar, "setVisibility", newState,b,c,d);
        if (this.isVisible()) this.setThumb();
    },
    
    //>	@method	nativeScrollbar.parentVisibilityChanged()	(A)
    // Extended to ensure thumb is placed correctly when this scrollbar is shown due to a hidden
    // ancestor being shown.
    //		@group	visibility
    //
    //		@param	newState		(boolean)	new visible state
    //<
    parentVisibilityChanged : function (newState,b,c,d) {
        this.invokeSuper(isc.Scrollbar, "parentVisibilityChanged", newState,b,c,d);
        if (this.isVisible()) this.setThumb();
    },

    
    // updates the thumb's position to match the scrollLeft / scrollTop of the scroll target
    moveThumb : function () {

        var scrollRatio = this.scrollTarget.getScrollRatio(this.vertical);
        
        var sbc = this.scrollbarCanvas;
        
        // scrollRatio is basically scrollTop / (scrollHeight - viewportHeight)
        // so to get scrollTop we need scrollRatio * (scrollHeight - viewportheight)
        var scrollableLength = this.vertical ? sbc.getScrollHeight() - sbc.getViewportHeight()
                                            : sbc.getScrollWidth() - sbc.getViewportWidth(),
                                            
            scrollPosition = Math.round(scrollRatio * scrollableLength);
            
        sbc.scrollTo(this.vertical ? 0 : scrollPosition, this.vertical ? scrollPosition : 0);
        
        
	},
	
    
    scrollbarCanvasScrolled : function () {
        if (this._suppressScrollEvents) return;
        var sbc = this.scrollbarCanvas,
            ratio = this.vertical ?
                    sbc.getScrollTop() / (sbc.getScrollHeight() - sbc.getViewportHeight()) :
                    sbc.getScrollLeft() / (sbc.getScrollWidth() - sbc.getViewportWidth());
                            
        // Use scrollToRatio rather than straight "scrollTo()"
        // This allows virtual scrolling to work on the target (in GridRenderers)
        this.scrollTarget.scrollToRatio(this.vertical, ratio);
    },      
   
    
    setShowCorner : function (showCorner) {
        if (this.showCorner == showCorner || !this.scrollbarCanvas) return; 
        this.showCorner = showCorner;
        this.sizeScrollbarCanvas(true);
    },
    //
    // Handle Canvas.receiveScrollbarEvents - migrated from Scrollbar class

    handleMouseOut : function (event) {

        // For autoHide SB's a mouseOut should start this auto-hide timer
        if (this.autoHide) this.setInactiveOnPause();

        if (this._shouldSuppressMouseOut(event)) return isc.EH.STOP_BUBBLING;
    },

    // helper to set eventParent of both this scrollbar and the thumb
    _redirectEvents : function (eventParent) {
        if (!eventParent) eventParent = null;
        this.eventParent = eventParent;

        var scrollbarCanvas = this.scrollbarCanvas;
        if (scrollbarCanvas != null) {
            scrollbarCanvas.eventParent = eventParent;
        }
	},

    
    _shouldSuppressMouseOut : function (event) {
        var target = event.target;
        return target && target == this.scrollTarget && target.receiveScrollbarEvents;
    },

    // whether canvas is one of ours (the scrollbar or thumb) that bubbles to scrollTarget
    _hasScrollTargetEventParent : function (canvas) {
        if (this.disabled) return false;
        return canvas == this || canvas && canvas == this.scrollbarCanvas;
    },

    // autoHide: If the browser native scrollbars support autoHide, we want to 
    // hide the NativeScrollbar canvas while the native CSS scrollbars are not active/visible

    
    
    autoHideDelay:1000,
    setScrollbarActive : function (forceThumb) {
        if (!this.autoHide) return;
        if (!this.active) {
            this.active = true;
            if (!this.isVisible()) this.show();
            if (forceThumb) this._forceThumb();
        }

        // auto hide when interaction stops unless the user is actively hovering over us
        if (!this.containsEvent()) {
            this.setInactiveOnPause();
        }
    },

    setInactiveOnPause : function () {
        this._setInactiveTimer = this.fireOnPause("setScrollbarInactive",
            {target:this, methodName:"setScrollbarInactive"},
            this.autoHideDelay);
    },

    setScrollbarInactive : function () {
        
        if (!this.autoHide) return;

        // Never dismiss while the user is hovering over the SB - this is used to 
        // natively go into fully interactive mode where the scrollbar appearance becomes
        // more substantial and the user can drag the thumb around more easily.
        if (this.containsEvent()) {
            return;
        }

        this.active = false;
        if (this.isVisible()) this.hide();
        delete this._setInactiveTimer;
    }

});



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
//>	@class MinimalScrollbar
//
// MinimalScrollbar is an alternative scrollbar interface to the standard +link{Scrollbar}.
// It has a number of differences:
// <ul>
// <li>MinimalScrollbar has no end buttons - it consists of just a thumb floating over a track</li>
// <li>The appearance is achieved entirely via CSS - see +link{minimalScrollbar.trackBaseStyle} and
//     +link{minimalScrollbar.thumbBaseStyle}</li>
// <li>By default MinimalScrollbars automatically become visible when the user is actually 
//     scrolling a target, and hide themselves when the interaction is complete. 
//     See +link{minimalScrollbar.autoShow}.<br>
//     In effect this means that as a user drag-scrolls a component, the scrollbars
//     will show up as a temporary indicator of the current drag position.<br>
//     <b>Note: we recommend always +link{canvas.floatingScrollbars,enabling floating scrollbars} in
//     conjunction with <code>autoShow:true</code></b>
// <li>MinimalScrollbars have an +link{minimalScrollbar.interactive,interactive} mode in which they appear more substantial.
//     By default this mode is turned on as
//     +link{minimalScrollbar.setInteractiveOnMouseOver,the user rolls over the visible scrollbar}</li>
// <li>The +link{minimalScrollbar.contrastSuffix} feature allows minimalScrollbars to show an appropriate
//     appearance to contrast against either light or dark colored backgrounds.<br>
//     By default canvases handle switching to the appropriate contrast setting based on the
//     components rendered background-color.</li>
// </ul>
// To enable MinimalScrollbars we recommend the following component-level settings:
// <ul>
// <li>+link{canvas.scrollbarConstructor,scrollbarConstructor:"MinimalScrollbar"}</li>
// <li>+link{canvas.showCustomScrollbars,showCustomScrollbars:true}</li>
// <li>+link{canvas.nativeAutoHideScrollbars,nativeAutoHideScrollbars:false}</li>
// <li>+link{canvas.floatingScrollbars,floatingScrollbars:true}</li>
// </ul>
//
// @inheritsFrom Canvas
// @treeLocation Client Reference/Foundation
// @visibility external
//<



isc.ClassFactory.defineClass("MinimalScrollbar", "Canvas");

// Pick up the standard scrollbar interface properties

isc.MinimalScrollbar.addProperties(isc._ScrollbarProperties);

isc.defineClass("MinimalScrollbarThumb", "Canvas");

// Pick up thumb "interface" from Scrollbar.js

isc.MinimalScrollbarThumb.addProperties(isc._thumbProperties, {overflow:"hidden"});

isc.MinimalScrollbar.addProperties({

	overflow:"hidden",


	//> @type MinimalScrollbarContrastSuffix
	// @value "Light" suffix to apply to +link{minimalScrollbar.trackBaseStyle} and
	//   +link{minimalScrollbar.thumbBaseStyle} to get a light appearance 
	//   (appropriate for contrasting against a dark background)
	// @value "Dark"  suffix to apply to +link{minimalScrollbar.trackBaseStyle} and 
	//   +link{minimalScrollbar.thumbBaseStyle} to get a dark
	//   appearance (appropriate for contrasting against a light background)
	// @visibility external
	//<

	//> @attr minimalScrollbar.contrastSuffix (MinimalScrollbarContrastSuffix : "Dark": IRW)
	// Suffix to apply to the +link{thumbBaseStyle}
	// and +link{trackBaseStyle} to show scrollbars with an appropriate
	// contrast against a light or dark background
	//
	// @visibility external
	//<
	contrastSuffix:"Dark",

	//>@attr minimalScrollbar.trackBaseStyle  (String : minimalScrollTrack : IR)
	// Base style to apply to the minimal scrollbar track.<br>
	// The actual +link{canvas.styleName,styleName} applied to the track will be generated
	// by applying the specified +link{minimalScrollbar.contrastSuffix} and, if +link{minimalScrollbar.interactive} is true
	// the additional sufix <code>"Interactive"</code>
	// <P>
	// For example, a minimalScrollbar with trackBaseStyle set to "minimalScrollTrack",
	// and +link{minimalScrollbar.contrastSuffix} set to "Light" would pick up the cssStyle
	// <code>"minimalScrollTrackLight"</code> by default, or 
	// <code>"minimalScrollTrackLightInteractive"</code> when +link{minimalScrollbar.interactive} was set
	// to true
	//
	// @visibility external
	//<
	trackBaseStyle:"minimalScrollTrack",
	// border:"1px solid red",

	getTrackStyleName : function () {
		var baseContrastStyle = this.trackBaseStyle + this.contrastSuffix;
		return this.interactive ? baseContrastStyle + "Interactive" : baseContrastStyle;
	},

	//> @attr minimalScrollbar.thumbBaseStyle  (String : minimalScrollThumb : IR)
	// Base style to apply to the minimal scrollbar thumb.<br>
	// The actual +link{canvas.styleName,styleName} applied to the thumb will be generated
	// by applying the specified +link{minimalScrollbar.contrastSuffix} and, if +link{minimalScrollbar.interactive} is true
	// the additional sufix <code>"Interactive"</code>
	// <P>
	// For example, a minimalScrollbar with thumbBaseStyle set to "minimalScrollThumb",
	// and +link{minimalScrollbar.contrastSuffix} set to "Light" would pick up the cssStyle
	// <code>"minimalScrollThumbLight"</code> by default, or 
	// <code>"minimalScrollThumbLightInteractive"</code> when +link{minimalScrollbar.interactive} was set
	// to true
	// @visibility external
	//<
	thumbBaseStyle:"minimalScrollThumb",

	getThumbStyleName : function () {
		var baseContrastStyle = this.thumbBaseStyle + this.contrastSuffix;
		return this.interactive ? baseContrastStyle + "Interactive" : baseContrastStyle;
	},

    // Thumb autoChild
    thumbConstructor:"MinimalScrollbarThumb",
    thumbDefaults:{
    },

	initWidget : function() {

		if (this.vertical) this.setWidth(this.getBreadth());
		else this.setHeight(this.getBreadth());

		this.setStyleName(this.getTrackStyleName());

        this.addAutoChild("thumb", {
		  scrollbar:this,
		  styleName:this.getThumbStyleName()
        });

        // Set up events / interaction with target if we have one
        if (this.scrollTarget) this.setScrollTarget(this.scrollTarget);

        // size and position the thumb
        this.setThumb();

        return this.Super("initWidget", arguments);
    },

	// Override scrollTarget changed - as with the Scrollbar class
	// we want to be able to get at the "other" scrollbar for the target.
	// We handle this by setting up _vscrollbar/_hscrollbar flags.
	// For this class this is required so we can 
	// - show and hide scrollbars together when autoHide is true
	// - ensure only one scrollbar shows "interactive" appearance at a time.
	scrollTargetChanged : function (oldTarget, newTarget) {
	
		var attributeName = this.vertical ? "_vscrollbar" : "_hscrollbar",
			activeOldTarget = oldTarget && (oldTarget[attributeName] == this),

		
		unchanged = activeOldTarget && (oldTarget == newTarget);
	
	
		if (!unchanged) {
			if (activeOldTarget) delete oldTarget[attributeName];
			this._setScrollbarOnTarget(newTarget);
		}
		
		// call setThumb to figure out how big and where the scrollbar thumb should be
		// note: this will enable and disable the scrollbar if autoEnable is true
		this.setThumb();

	},

	// helper called by setScrollTarget for "self managed" scrollbars
	
	_setScrollbarOnTarget : function (scrollTarget) {

		// set a reference back to this scrollbar in the scrollTarget
		if (this.vertical) {
			scrollTarget._vscrollbar = this;
		} else {
			scrollTarget._hscrollbar = this;
		}
	},

	//> @attr minimalScrollbar.showOnTargetMouseMove (boolean : false : IRW)
	// If +link{autoShow} is enabled, should this scrollbar automatically show itself
	// whenever the user moves the mouse over the scroll target?
	// @visibility internal
	//<
	
	showOnTargetMouseMove:false,
	scrollTargetMouseMove : function () {
		if (this.autoShow && this.showOnTargetMouseMove) {
			var scrollingOn = (this._selfManaged || this.scrollTarget.canScroll(this.vertical));
			if (scrollingOn) {
				this._performAutoShow();
			}
		}
	},

    // Thumb event handlers

    // By default this scrollbar doesn't show special thumb-state on rollover etc
    // We already react to the bubbled thumb-over to switch to the larger appearance
    thumbOver : function () { },

    thumbOut : function (event) { },

    thumbDown : function () {
        return isc.EventHandler.STOP_BUBBLING;
    },


    thumbUp : function () {    
        return isc.EventHandler.STOP_BUBBLING;
    },

    // Thumb drag scroll events

    thumbDragStart : function () {
        // set the offsetX and offsetY so the thumb moves with the mouse properly
        var EH = isc.EH;
        EH.setDragOffset(this.thumb.getOffsetX(EH.mouseDownEvent),
                      this.thumb.getOffsetY(EH.mouseDownEvent));
        this._dragScrolling = true;
        return EH.STOP_BUBBLING;
    },

    thumbMove : function () {
        // get the total amount of the track that's scrollable
        var trackSize = this.trackSize() - this.thumbSize(),

            // get the Y coordinate of the event, less the track start and the offsetY from mouseDown
            eventCoord = this.getEventCoord(),
            // get ratio to scroll to; make sure to avoid / by zero
			ratio = trackSize != 0 ? eventCoord / trackSize : eventCoord;
			

        ratio = Math.max(0, Math.min(ratio, 1));

        this.scrollTarget.scrollToRatio(this.vertical, ratio, "thumbMove");

        return isc.EventHandler.STOP_BUBBLING;
    },

    thumbDragStop : function () {
        delete this._dragScrolling;
        
        // doneFastScrolling() - notifies the target that the user is no longer performing
        // rapid scrolls on the widget
        if (this.scrollTarget && this.scrollTarget.doneFastScrolling) this.scrollTarget.doneFastScrolling();
        
        // Fire any standard "mouse up on thumb" handling
        // If we were showing thumb state, for example, this would clear it
        return this.thumbUp();
	},
	
	getEventCoord : function () {
		var EH = isc.EH;
		return (this.vertical ? 
				EH.getY() - this.getPageTop()  - EH.dragOffsetY :
				EH.getX() - this.getPageLeft() - EH.dragOffsetX);
	},
	

    // Size of the track (Matches height/width of the scrollbar since we don't
    // show end buttons for this class)
    trackSize : function () {
        return this.vertical ? this.getHeight() : this.getWidth();
    },
    // Size of the thumb
    thumbSize : function () {
        if (!this.thumb) return;
        return (this.vertical ? this.thumb.getHeight() : this.thumb.getWidth());
    },
	
	// helper to set eventParent of both this scrollbar and the thumb
	_redirectEvents : function (eventParent) {
		var thumb = this.thumb;
		if (!eventParent) eventParent = null;
		this.eventParent = eventParent;
		if (thumb != null) thumb.eventParent = eventParent;
	},

    
    
    //>	@attr minimalScrollbar.thumbMinSize   (number : 12 : IRA)
    // The minimum pixel size of the draggable thumb regardless of how large the scrolling
    // region becomes.
    // @group thumb
    // @visibility external
	//<
	
	thumbMinSize : 12,
	
	// Documented in the common scrollbar interface attributes
	setThumb : function () {

		// Bail if the thumb hasn't been created yet. This happens on setWidth() / setHeight()
		// during initWidget()
		if (this.thumb == null || this._suppressSetThumb || !this.scrollTarget) {
			return;
		}

		

		var thumb = this.thumb,
			trackSize = this.trackSize();

		// calculate size for thumb
		var size = Math.round(this.scrollTarget.getViewportRatio(this.vertical) * trackSize);

		// don't go below a minimum thumb size (too hard to grab)
		if (!isc.isA.Number(size) || size < this.thumbMinSize) size = this.thumbMinSize;

		// don't let it exceed trackSize
		if (size > trackSize) size = trackSize;

		// always ensure the thumb's thickness matches the available space for it
		var thickness = Math.max(1, (this.vertical ? this.getWidth() : this.getHeight()) 
									- (2*this.thumbInset));
		// resize the thumb
		this.vertical ? thumb.resizeTo(thickness, size) : thumb.resizeTo(size, thickness);
		// now move the thumb according to the scroll
		this.moveThumb();
	},

	// If our length changes we need to adjust the thumb size too
	resized:function () {
		this.setThumb();
	},
	
	
	
	//> @attr minimalScrollbar.thumbInset (number : 2 : IRA)
    // Inset of the thumb relative to the track.  An inset of N pixels means the thumb is 2N
    // pixels smaller in breadth than the track.
    // @group thumb
    // @visibility external
    //<
    thumbInset:2,


	moveThumb : function () {
		var scrollingOn = (this._selfManaged || this.scrollTarget.canScroll(this.vertical));

		if (!scrollingOn) {
			if (this.autoEnable) this.disable();
			this.moveThumbTo(this.trackStart());
			return;
		}
	
		if (this.autoEnable && !this.scrollTarget.isDisabled()) this.enable();
		var scrollRatio = this.scrollTarget.getScrollRatio(this.vertical),
			maxThumbPosition = this.trackSize() - this.thumbSize(),
			thumbCoord = Math.round(scrollRatio * maxThumbPosition);
	
		this.moveThumbTo(thumbCoord + this.trackStart());
	
		// If the thumb moved due to the user holding the mouse down over our track, this kills
		// repeatTrackScrolling 
		var EH = isc.EH;
		
		// if (EH.mouseIsDown() && (EH.mouseDownTarget() == this) && this.thumb.containsEvent())
		// 	this.doneTrackScrolling();

		// If autoShow is true, show the SB on every setThumb/moveThumb
		// This handles
		// - initial draw
		// - adjustOverflow changing contents' size
		// - resize of widget as a whole
		// - actual scroll from mouseWheel/trackpad, etc
		
		if (this.autoShow) {
			this._performAutoShow();
		}

	},
	_performAutoShow : function () {
		if (!this.isVisible()) {
			this.show();
			// Always show and hide pairs of SB's together
			var otherSB = this._getOtherScrollbar();
			if (otherSB) otherSB.show();
		}
		this._resetAutoHideTimer();
	},

	trackStart : function () {
		return 0;
	},
	
	moveThumbTo : function (coord) {
		if (!this.thumb) return;
		if (this.vertical)
			return this.thumb.moveTo(this.thumbInset, coord);
		else
			return this.thumb.moveTo(coord, this.thumbInset);
	},

	//> @attr minimalScrollbar.interactive (boolean : false : IRW)
	// Is this scrollbar currently in "interactive" mode? If true, the scrollbar will be shown
	// with a more prominent appearance, making it clear the user can interact with it by
	// clicking the track or dragging the thumb.
	// <P>
	// If +link{minimalScrollbar.setInteractiveOnMouseOver} is true, this property will automatically
	// be updated on mouseOver.
	// @visibility external
	//<
	interactive:false,

	//> @attr minimalScrollbar.scrollbarSize (Number : 12 : IR)
	// Default thickness for this scrollbar.
	// <P>
	// If the scrollbar is in +link{minimalScrollbar.interactive,interactive mode}, breadth
	// will be set to +link{minimalScrollbar.interactiveScrollbarSize} instead.
	// @visibility external
	//<
	scrollbarSize:12,

	//> @attr minimalScrollbar.interactiveScrollbarSize (Number : 19 : IR)
	// Thickness for this scrollbar in +link{minimalScrollbar.interactive,interactive mode}.
	// @visibility external
	//<
	interactiveScrollbarSize:15,

	
	getBreadth : function () {
		if (this.interactive && this.interactiveScrollbarSize != null) {
			return this.interactiveScrollbarSize;
		}
		return this.scrollbarSize;
	},


	updateBreadth : function () {

		var breadth = this.getBreadth(),
			currentBreadth =  this.vertical ? this.getWidth() : this.getHeight();
		if (currentBreadth == breadth) return;

		if (this.vertical) {
			this.setWidth(breadth);
			
			this.moveBy(currentBreadth-breadth);
		} else {
			this.setHeight(this.getBreadth());
			if (!this.isRTL()) {
				this.moveBy(null, currentBreadth-breadth);
			}
		}
	},

	show : function () {
		// Ensure that our thickness matches our 'interactive' state on show
		this.updateBreadth();
		return this.Super("show", arguments);
	},

	//> @method minimalScrollbar.setInteractive()
	// Set +link{minimalScrollbar.interactive,interactive mode} at runtime. For +link{setInteractiveOnMouseOver}
	// scrollbars this method is invoked automatically at the appropriate times
	// @visibility external
	//<
	setInteractive : function (interactive) {
		if (this.interactive == interactive) return;

		this.interactive = interactive;
		this.setStyleName(this.getTrackStyleName());
		if (this.thumb) this.thumb.setStyleName(this.getThumbStyleName());
		this.updateBreadth();
		if (interactive) {
			var osb = this._getOtherScrollbar();
			if (osb) osb.setInteractive(false);
		}
	},

	//> @attr minimalScrollbar.setInteractiveOnMouseOver (boolean : true : IRW)
	// Always set to +link{minimalScrollbar.interactive} mode on roll over.
	// @visibility external
	//<
	setInteractiveOnMouseOver : true,

	// override mouseMove to update interactive mode if appropriate
	mouseMove : function() {
		if (this.setInteractiveOnMouseOver && !this.interactive) {
			this.setInteractive(true);
		}
		if (this.setInteractiveOnMouseOver) this._resetAutoHideTimer();
	},

	mouseOut : function () {
		// If autoShow is true, we stay interactive until the sb is dismissed, otherwise
		// explicitly clear it.
		if (this.setInteractiveOnMouseOver && this.interactive && !this.autoShow) {
			this.setInteractive(false);
		}
	},

	//> @attr minimalScrollbar.autoShow (boolean : true : IRW)
	// Should this scrollbar automatically show itself when the scroll position / size
	// changes and hide itself after a +link{autoHideDelay,delay} when left untouched?
	// @visibility external
	//<
	
	autoShow:true,

	//> @attr minimalScrollbar.autoHideDelay (number : 1000 : IRW)
	// If +link{minimalScrollbar.autoShow} is true, the scrollbar will auto hide after
	// the user has stopped interacting with it for this many milliseconds.
	// @visibility external
	//<
	autoHideDelay:1000,

	_resetAutoHideTimer : function () {
        this._pendingAutoHide = this.fireOnPause("autoHideOnPauseTimer",
                            {target:this, methodName:"autoHideOnPause"},
                            this.autoHideDelay);
	},

	_getOtherScrollbar : function () {
		if (this.scrollTarget) {
			var otherScrollbarAttr = this.vertical ? "_hscrollbar" : "_vscrollbar";
			return  this.scrollTarget[otherScrollbarAttr];
		}
	},

	autoHideOnPause : function (indirect) {

		delete this._pendingAutoHide;

			
		// if the other scrollbar has been interacted-with more recently than us
		// just wait for it to hide both sb's
		var otherScrollbar = indirect ? null : this._getOtherScrollbar();
		if (otherScrollbar && otherScrollbar._pendingAutoHide) {
			return;
		}

		
		
		if (this.autoShow) this.hide();
		if (this.setInteractiveOnMouseOver && this.interactive) {
			this.setInteractive(false);
		}

		// Fire this same method directly on the other scrollbar to cause it to hide
		// and set interactive(false)
		if (otherScrollbar) {
			otherScrollbar.autoHideOnPause(true);
		}
	}

});

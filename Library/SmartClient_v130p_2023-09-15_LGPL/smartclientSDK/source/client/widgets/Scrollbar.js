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
//>	@class Scrollbar
//
// The Scrollbar widget implements cross-platform, image-based scrollbars that control the
// scrolling of content in other widgets.  Scrollbar widgets are created and displayed
// automatically for widgets that require them, based on settings for +link{canvas.overflow}.
// <P>
// The scrollbar's appearance is based on a +link{StretchImg} for the "track", which consists
// of two fixed size buttons and a stretchable center segment, and the +link{ScrollThumb},
// the draggable portion of the scrollbar, also a StretchImg, with an optional
// +link{stretchImg.showGrip,grip}.
//
// @inheritsFrom StretchImg
// @treeLocation Client Reference/Foundation
// @visibility external
//<

// Shared Scrollbar properties and methods for any standard uni-directional scrolling interface
// Applied to 'Scrollbar', 'NativeScrollbar', 'MinimalScrollbar' [which have different
// base classes / appearances, etc]
 
isc._ScrollbarProperties = {
    //> @attr scrollbar.vertical (boolean : true : IR)
    // Governs whether this is a vertical or horizontal scrollbar
    //<
    vertical:true,

    //>	@attr scrollbar.scrollTarget (Canvas : null : [IRWA])
    // The widget whose contents should be scrolled by this scrollbar. The scrollbar thumb
    // is sized according to the amount of visible vs. scrollable content in this widget.
    // @visibility external
	//<

    //>	@method	scrollbar.setScrollTarget() ([])
    //          Sets or clears the scrollbar's scrollTarget. If no argument is provided, then the
    //          scrollTarget will be set to the scrollbar itself.
    //
    //      @visibility external
    //      @group  scroll
    //		@param	[newTarget]		(Canvas)	target canvas to be scrolled
    //<
    
    
	//	Make sure we have a scrollTarget defined -- use us if nothing was ever specified.
	//	Also, make sure the observation relationship between the scrollbar and the scrollTarget
	//	is set up.
	setScrollTarget : function (newTarget) {

		var oldTarget = this.scrollTarget;

		// If we have been given a newTarget, stop observing the current scrollTarget that we're
		// observing.
		if (this._selfManaged && this.scrollTarget != null &&
			this.isObserving(this.scrollTarget, "scrollTo")) 
		{
			//stop observing (current) this.scrollTarget
			this.ignore(this.scrollTarget, "scrollTo");
			this.ignore(this.scrollTarget, "_adjustOverflow");
		}

		// setScrollTarget() can be called to switch targets, so clear any previous eventParent
		if (this.scrollTarget && this.scrollTarget.receiveScrollbarEvents) {
			this._redirectEvents();
		}

		// If a newTarget was specified, set the scrollTarget to it.
		// If a newTarget was not specified, we'll use the current scrollTarget. If the
		// current scrollTarget isn't set, we use the scrollBar itself to avoid
		// null pointers
		if (newTarget != null) this.scrollTarget = newTarget;
		// if a target was not specified, use ourself for the target just so stuff doesn't break
		if (this.scrollTarget == null) this.scrollTarget = this;
		
		// We now are sure that we have a scrollTarget. If the scrollTarget has been changed
		// then we re-observe it. Otherwise, we're done.
		
		var scrollTarget = this.scrollTarget;
		if (this._selfManaged && scrollTarget != this) {
			this.observe(scrollTarget, "scrollTo",        "observer.setThumb()");
            this.observe(scrollTarget, "_adjustOverflow", "observer.setThumb()");

            
			this._setScrollbarOnTarget(scrollTarget);
		}

		
		if (scrollTarget.receiveScrollbarEvents) this._redirectEvents(scrollTarget);
		this.scrollTargetChanged(oldTarget,scrollTarget);
    },
    
    _setScrollbarOnTarget : function (scrollTarget) {
        var otherScrollbar;
    
        // set a reference back to this scrollbar in the scrollTarget
        if (this.vertical) {
            scrollTarget._vscrollbar = this;
            otherScrollbar = scrollTarget._hscrollbar;
        } else {
            scrollTarget._hscrollbar = this;
            otherScrollbar = scrollTarget._vscrollbar;
        }
    },    

	// helper to set eventParent this scrollbar and any standard autoChildren
    
	_redirectEvents : function (eventParent) {
        
	},

	// Central notification when setScrollTarget is run
	
	scrollTargetChanged : function(oldTarget, newTarget) {
		// call setThumb to figure out how big and where the scrollbar thumb should be
		// note: this will enable and disable the scrollbar if autoEnable is true
		this.setThumb();

	},

    // notification fired when the scroll target recieves a mouseMove event
    
    scrollTargetMouseMove : function () {
    },


    //>	@method	scrollbar.setThumb()	(A)
    // Resize the thumb so that the thumb's size relative to the track reflects the viewport size
    // relative to the overall scrollable area.
    //		@param	forceResize		(boolean)	if true, resize regardless of whether it is necessary
    //<
    
    setThumb : function () {
        
	},
	

    //>	@attr scrollbar.showCorner (Boolean : false : IRA)
    // If true, displays a corner piece at the bottom end of a vertical scrollbar, or the
    // right end of a horizontal scrollbar. This is typically set only when both horizontal
    // and vertical scrollbars are displayed and about the same corner.
    // @group corner
    // @visibility external
    //<
	//showCorner:false,


    //> @method scrollbar.setShowCorner()   (A)
    // Start showing the corner piece.
    // <p>
    // Marks the scrollbar for redraw.
    //
    // @param newState (boolean) true == show the corner piece
    //<
    
    setShowCorner : function (newState) {
        this.showCorner = newState;
        
    },

	// Undocumented boolean showThumbTriggerArea (no default setting)
	
	// Undocumented boolean _suppressSetThumb - gets set to true during animation of 
	// components - implementations should simply have setThumb bail if set

    // flag for whether or not the scrollBar should be managing its own scrollTarget.
	// set to false if a scrollTarget actually creates the scrollBar itself.
    _selfManaged:true,
        
    // whether canvas is one of ours (the scrollbar or thumb) that bubbles to scrollTarget
    
    _hasScrollTargetEventParent : function (canvas) {
        

        return false;
    }
}


isc.ClassFactory.defineClass("Scrollbar", "StretchImg");

isc.Scrollbar.addProperties(isc._ScrollbarProperties);




//> @class ScrollThumb
// Class used for the draggable "thumb" of a scrollbar.  Do not use directly; this class is
// documented only for skinning purposes.
//
// @inheritsFrom StretchImg
// @treeLocation Client Reference/Foundation/Scrollbar
// @visibility external
//<

isc._thumbProperties = {
    autoDraw:false,
    _generated:true,
    _isScrollThumb:true,

    // we redraw the thumb manually, not automatically with parent or master
    _redrawWithMaster:false,
    _resizeWithMaster:false,
    _redrawWithParent:false,
    containedPeer:true,

    triggerAreaTop: 0,
    triggerAreaRight: 0,
    triggerAreaBottom: 0,
    triggerAreaLeft: 0,

    _updateTriggerArea : function (scrollTarget) {
        var vertical = this.scrollbar.vertical,
            offset = isc.Browser.isTouch ? 8 : 0,
            minThumbLength = isc.Browser.minDualInputThumbLength
        ;
        if (vertical) { // vertical thumb - expand on left (non-RTL) or right (RTL)
            var isRTL = scrollTarget == null ? isc.Page.isRTL() : scrollTarget.isRTL();
            this.setTriggerAreaLeft(!isRTL ? offset : 0);
            this.setTriggerAreaRight(isRTL ? offset : 0);

            // enforce minimum effective thumb height in dual input mode
            if (minThumbLength != null && isc.Browser.hasDualInput) {
                var height = this.getVisibleHeight();
                offset = height < minThumbLength ? Math.ceil((minThumbLength - height) / 2) : 0;
                this.setTriggerAreaTop(offset);
                this.setTriggerAreaBottom(offset);
            }

        } else { // horizontal thumb - expand on top
            this.setTriggerAreaTop(offset);
            this.setTriggerAreaBottom(0);

            // enforce minimum effective thumb width in dual input mode
            if (minThumbLength != null && isc.Browser.hasDualInput) {
                var width = this.getVisibleWidth();
                offset = width < minThumbLength ? Math.ceil((minThumbLength - width) / 2) : 0;
                this.setTriggerAreaLeft(offset);
                this.setTriggerAreaRight(offset);
            }
        }
    },

    enableTouchSupport : function () {
        this.Super("enableTouchSupport", arguments);
        if (this.triggerArea) this._updateTriggerArea();
    },

    
    showDisabled:false,

	skinImgDir:"images/Scrollbar/",	
 
    // the thumb drags with a custom drag style
    canDrag:true,
    dragAppearance:isc.EventHandler.NONE,
    dragStartDistance:0, // start drag scrolling on any mouse movement
    dragScrollType:"parentsOnly",

    // stop various events from bubbling to parent of the Canvas we are scrolling
    click : isc.EventHandler.stopBubbling,
    doubleClick : isc.EventHandler.stopBubbling,
    mouseMove : isc.EventHandler.stopBubbling,

    showContextMenu : function () {
        // Disable the "Save image" dialog in Chrome for Android
        if (this.ns.EH._handlingTouchEventSequence()) return false;
    },

    // send special notifications for some events
    mouseOver : function () {return this.scrollbar.thumbOver();},
    mouseOut : function (event) {return this.scrollbar.thumbOut(event);},
    mouseDown : function () {return this.scrollbar.thumbDown();},
    dragStart : function () {return this.scrollbar.thumbDragStart();},
    dragMove : function () {return this.scrollbar.thumbMove();},
    dragStop : function () {return this.scrollbar.thumbDragStop();},
    mouseUp : function () {return this.scrollbar.thumbUp();},

    // bubble other events to the scrollbar
    keyPress : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.KEY_PRESS);
    },
    keyDown : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.KEY_DOWN);
    },
    keyUp : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.KEY_UP);
    },
    mouseWheel : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.MOUSE_WHEEL);
    },
    
    masterMoved : function () {
        // on scrollbar.setRect, we'll be positioned to our final position in response to 
        // the resize, so no need to also reposition in response to the scrollbar moving
        var master = this.masterElement;
        if (master && master._settingRect) return;
        this.Super("masterMoved", arguments);
    }
};    


if (isc.Browser.minDualInputThumbLength != null) {
    isc._thumbProperties.triggerAreaDefaults = 
        isc.addProperties({}, isc.StatefulCanvas.getPrototype().triggerAreaDefaults, {
            _fitToMaster : function () {
                var master = this.masterElement;
                master._updateTriggerArea();
                this.setRect(master._getTriggerAreaRect());
            }
        });
}

isc.defineClass("ScrollThumb", "StretchImg").addProperties(isc._thumbProperties);
isc.ScrollThumb.addProperties({
    hSrc:"[SKIN]hthumb.gif",
    vSrc:"[SKIN]vthumb.gif",
    backgroundColor:"#EEEEEE",
    // don't reverse, even in RTL, (in case media is asymetric)
    textDirection:"ltr",
    capSize:2
});
isc.defineClass("HScrollThumb", isc.ScrollThumb).addProperties({ vertical:false });
isc.defineClass("VScrollThumb", isc.ScrollThumb).addProperties({ vertical:true });

isc.defineClass("SimpleScrollThumb", "Img").addProperties(isc._thumbProperties);
isc.SimpleScrollThumb.addProperties({
    title:"&nbsp;",
    titleStyle:"normal",
    overflow:"hidden",
    vBaseStyle:"vScrollThumb",
    hBaseStyle:"hScrollThumb",

    // we use "Img" as the base class in order to render the grip as a centered Img with no
    // separate Label component
    imageType:"center",
    hSrc:"[SKIN]hthumb_grip.gif",
    vSrc:"[SKIN]vthumb_grip.gif",
    showRollOver:true,
    
    statelessImage:true,

    initWidget : function () {
        if (this.vertical) {
            this.src = this.vSrc || this.src;
            this.baseStyle = this.vBaseStyle || this.baseStyle;
        } else {
            this.src = this.hSrc || this.src;
            this.baseStyle = this.hBaseStyle || this.baseStyle;
        }
        this.Super("initWidget", arguments);
    }
});
isc.defineClass("HSimpleScrollThumb", isc.SimpleScrollThumb).addProperties({ vertical:false });
isc.defineClass("VSimpleScrollThumb", isc.SimpleScrollThumb).addProperties({ vertical:true });


isc.Scrollbar.addProperties( {
    //>	@attr scrollbar.btnSize (number : null : [IRW])
    // The size of the square buttons (arrows) at the ends of this scrollbar. This overrides 
    // +link{Canvas.scrollbarSize} to set the width of a vertical scrollbar or the height of a
    // horizontal scrollbar.  If not set it will default to +link{Canvas.scrollbarSize}.
    // @group track
    // @visibility external
    //<
    
    //>	@attr scrollbar.state (ImgState : isc.StatefulCanvas.STATE_UP : IRWA)
	// Default to the "up" state, other states are "down" and isc.StatefulCanvas.STATE_DISABLED
	// @group appearance
	//<
	state:isc.StatefulCanvas.STATE_UP,							

    //>	@attr scrollbar.autoEnable (Boolean : true : [IRWA])
    // If true, this scrollbar will automatically enable when the scrollTarget is
    // scrollable (i.e., when the contents of the scrollTarget exceed its clip size in the
    // direction relevant to this scrollbar), and automatically disable when the
    // scrollTarget is not scrollable. Set this property to false for full manual control
    // over a scrollbar's enabled state.
    // @visibility external
    //<
	autoEnable:true,


    //> @attr scrollbar.allowThumbDownState	(Boolean : false : IRA)
    // If true, the thumb's appearance changes when it's clicked on.
    // @group thumb
    // @visibility external
    //<
	allowThumbDownState:false,

    //> @attr scrollbar.allowThumbOverState	(Boolean : false : IRA)
    // If true, the thumb's appearance changes when the user rolls over it.
    // @group thumb
    // @visibility external
    //<
	allowThumbOverState:false,

    //> @attr scrollbar.showTrackEnds	(Boolean : false : IRA)
    // If true, the scrollbar uses a 5-segment rather than 3-segment image representation,
    // where the 3 interior image segments have the same state (Down, Over, etc), independent
    // of the two outermost image segments.  
    // <P>
    // This allows certain advanced skinning designs where the track-as-such (space in which
    // the thumb may be dragged) has curved endcaps, and is also visually stateful (that is,
    // changes when the mouse goes down, without affecting the appearance of the outermost
    // segments).
    //
    // @group track
    // @visibility external
    //<
    showTrackEnds:false,

    //> @attr scrollbar.showTrackButtons (Boolean : true : IRA)
    // Should the track buttons that allow page scrolling be shown?
    // <P>
    // @group track
    // @visibility external
    //<
    showTrackButtons:true,

    //>	@attr scrollbar.thumbMinSize   (number : 12 : IRA)
    // The minimum pixel size of the draggable thumb regardless of how large the scrolling
    // region becomes.
    // @group thumb
    // @visibility external
    //<
    thumbMinSize : 12,

    //>	@attr scrollbar.trackEndWidth   (number : 12 : IRA)
    // The minimum pixel width of the track end segments (if enabled with showTrackEnds).
    // @group track
    // @visibility external
    //<
    trackEndWidth : 12,

    //>	@attr scrollbar.trackEndHeight   (number : 12 : IRA)
    // The minimum pixel height of the track end segments (if enabled with showTrackEnds).
    // @group track
    // @visibility external
    //<
    trackEndHeight : 12,

    //>	@attr scrollbar.thumbOverlap   (number : 1 : IRA)
    // Number of pixels the thumb is allowed to overlap the buttons at each end of the track.
    // Default prevents doubling of 1px borders.  Set higher to allow media that shows curved
    // joins between the track button and ScrollThumb.
    // @group thumb
    // @visibility external
    //<
    thumbOverlap : 1,

    //>	@attr scrollbar.startThumbOverlap   (number : null : IRA)
    // Number of pixels the thumb is allowed to overlap the buttons at the start of the track.
    // Default prevents doubling of 1px borders.  Set higher to allow media that shows curved
    // joins between the track button and ScrollThumb.
    // @group thumb
    // @visibility external
    //<

    //>	@attr scrollbar.endThumbOverlap   (number : null : IRA)
    // Number of pixels the thumb is allowed to overlap the buttons at the end of the track.
    // Default prevents doubling of 1px borders.  Set higher to allow media that shows curved
    // joins between the track button and ScrollThumb.
    // @group thumb
    // @visibility external
    //<

    //> @attr scrollbar.thumbInset (number : null : IRA)
    // Inset of the thumb relative to the track.  An inset of N pixels means the thumb is 2N
    // pixels smaller in breadth than the track.
    // @group thumb
    // @visibility external
    //<
    thumbInset:0,

	overflow:isc.Canvas.HIDDEN,

    //>	@attr scrollbar.skinImgDir (SCImgURL : "images/Scrollbar/" : IRA)
	// Where are the skin images for the Scrollbar.  This is local to the +link{Page.getSkinDir(),
    // overall skin directory}.
	// @group images
    // @visibility external
	//<
	skinImgDir:"images/Scrollbar/",	

    //> @attr scrollbar.cornerSrc (SCImgURL : "[SKIN]corner.gif" : IR)
    // URL for the corner image, a singular image that appears in the corner when both h and v
    // scrollbars are showing.
    // @group images
    // @visibility external
    //<
    cornerSrc : "[SKIN]corner.gif",

    //> @attr scrollbar.cornerSize (Integer : null : IR)
    // Allows the size of the corner segment to be set independently of the +link{btnSize}.
    // @group corner
    // @visibility external
    //<

    //> @attr scrollbar.hSrc (SCImgURL : "[SKIN]hscroll.gif" : IR)
    // Base URL for the images used for the horizontal scrollbar track and end buttons.  
    // <P>
    // See +link{StretchImg.items} for a general explanation of how this base URL is
    // transformed into various pieces and states.
    // <P>
    // For a normal 3-segment track, the suffixes "_start", "_track" and "_end" are added to
    // this URL.  The "start" and "end" images should appear to be buttons (the user can click
    // on these segments to scroll slowly).  The "track" segment provides a background for the
    // space in which the thumb can be dragged, and can also be clicked on to scroll quickly.
    // <P>
    // For a 5-segment track (+link{showTrackEnds}:true), the suffixes are "_start", "_track_start",
    // "_track", "_track_end" and "_end".
    //
    // @group images
    // @visibility external
    //<
    hSrc:"[SKIN]hscroll.gif",
    
    //> @attr scrollbar.vSrc (SCImgURL : "[SKIN]vscroll.gif" : IR)
    // Base URL for the images used for the vertical scrollbar track and end buttons.  See
    // +link{hSrc} for usage.
    //
    // @group images
    // @visibility external
    //<
    vSrc:"[SKIN]vscroll.gif",

    // internal attributes to allow instance level skinning of scrollbars
    // do not expose - thumb should be implemented as autoChild instead
    hThumbClass: isc.HScrollThumb,
    vThumbClass: isc.VScrollThumb,
    
	// Images for parts of the scrollbar, initialized in scrollbar.initWidget
	// ----------------------------------------------------------------------------------------

    //> @attr scrollbar.startImg (StretchItem : see below : IR)
    // The StretchItem for the start of a scrollbar (the "scroll up" or "scroll left" button
    // image). The default is:
    // <smartclient><code>{ name:"start", width:"btnSize", height:"btnSize" }</code></smartclient>
    // <smartgwt><code>new StretchItem("start", "btnSize", "btnSize")</code></smartgwt>
    // @visibility external
    //<
    startImg:      {name:"start",       width:"btnSize",        height:"btnSize",        browserTouchCallout:false},

    //> @attr scrollbar.trackStartImg (StretchItem : see below : IR)
    // The StretchItem for the start of a scrollbar track. The default is:
    // <smartclient><code>{ name:"track_start", width:"trackStartSize", height:"trackStartSize" }</code></smartclient>
    // <smartgwt><code>new StretchItem("track_start", "trackStartSize", "trackStartSize")</code></smartgwt>
    // @visibility external
    //<
    trackStartImg: {name:"track_start", width:"trackStartSize", height:"trackStartSize", browserTouchCallout:false},

    //> @attr scrollbar.trackImg (StretchItem : see below : IR)
    // The StretchItem for the middle part of a scrollbar track, which usually takes up the majority
    // of the width or height of the scrollbar. The default is:
    // <smartclient><code>{ name:"track", width:"*", height:"*" }</code></smartclient>
    // <smartgwt><code>new StretchItem("track", "*", "*")</code></smartgwt>
    // @visibility external
    //<
    trackImg:      {name:"track",       width:"*",              height:"*",              browserTouchCallout:false},

    //> @attr scrollbar.trackEndImg (StretchItem : see below : IR)
    // The StretchItem for the end of a scrollbar track. The default is:
    // <smartclient><code>{ name:"track_end", width:"trackEndSize", height:"trackEndSize" }</code></smartclient>
    // <smartgwt><code>new StretchItem("track_end", "trackEndSize", "trackEndSize")</code></smartgwt>
    // @visibility external
    //<
    trackEndImg:   {name:"track_end",   width:"trackEndSize",   height:"trackEndSize",   browserTouchCallout:false},

    //> @attr scrollbar.endImg (StretchItem : see below : IR)
    // The StretchItem for the end of a scrollbar (the "scroll down" or "scroll right" button
    // image). The default is:
    // <smartclient><code>{ name:"end", width:"btnSize", height:"btnSize" }</code></smartclient>
    // <smartgwt><code>new StretchItem("end", "btnSize", "btnSize")</code></smartgwt>
    // @visibility external
    //<
    endImg:        {name:"end",         width:"btnSize",        height:"btnSize",        browserTouchCallout:false},

    //> @attr scrollbar.cornerImg (StretchItem : see below : IR)
    // The StretchItem for the corner between vertical and horizontal scrollbars. The width
    // and height are determined automatically, so +link{StretchItem.width} and +link{StretchItem.height}
    // set on the cornerImg StretchItem are ignored. The default is:
    // <smartclient><code>{ name:"corner" }</code></smartclient>
    // <smartgwt><code>new StretchItem("corner", null, null)</code></smartgwt>
    // @visibility external
    //<
    cornerImg:     {name:"corner",      browserTouchCallout:false},

	
    // don't reverse, even in RTL, since otherwise track-end arrows would point inwards
    
    textDirection:"ltr",

    
    // undocumented flag scrollbar.showThumb: set to false to disable displaying thumb.
    // eventually this will also disable the track.
    showThumb:true
    
    // undocumented flag scrollbar.disableButtonsOnEdges: if beginning or end of scrolling
    // is reached, show either the start or end buttons as disabled, respectively.
    //disableButtonsOnEdges:false
});

isc.Scrollbar.addMethods({

//>	@method	scrollbar.initWidget()	(A)
//			creates the thumb and adds it as a peer
//			calls setScrollTarget() to set us up with the target to be scrolled
//
//		@param	[all arguments]	(Object)	objects with properties to override from default
//<
initWidget : function () {
	this.invokeSuper(isc.Scrollbar,"initWidget");

    var size = this.cornerSize || "otherScrollbarSize";
    this._cornerImg = isc.addProperties({}, this.cornerImg, {width:size, height:size});

    if (null == this.startThumbOverlap)    this.startThumbOverlap  = this.thumbOverlap;
    if (null == this.endThumbOverlap)      this.endThumbOverlap    = this.thumbOverlap;
    
	// set up the image list for this scrollbar
	this.setItems();

    // must be after setItems() because updateButtonsOnEdges() may trigger setState.
    // If setItems() hasn't been called yet, setState() changes the global StretchImg items.
    var breadth = this.btnSize = this.btnSize || this.scrollbarSize;
    this.setBreadth(breadth)
    
	// create our thumb
	this.makeThumb();

	// add the thumb as a peer
	this.addPeer(this.thumb);
	
	// initialize us for our scrollTarget
	this.setScrollTarget(this.scrollTarget);
},

// the breadth is also referred to as the scrollbar's "size"
getBreadth : function () {
    return this.vertical ? this.getWidth() : this.getHeight();
},
setBreadth : function (breadth) {
    if (this.vertical) this.setWidth (breadth);
    else               this.setHeight(breadth);
},

// called to set our cornerSize to the other scrollbar's size (breadth)
getOtherScrollbarSize : function () {
    var scrollTarget = this.scrollTarget;
    // if we can access the other scrollbar (via the scrollTarget) use its breadth;
    if (this._selfManaged && scrollTarget != null) {
        var otherScrollbar = this.vertical ? scrollTarget._hscrollbar : 
                                             scrollTarget._vscrollbar;
        if (otherScrollbar) return otherScrollbar.getBreadth();
    }
    // otherwise, use our own breadth
    return this.getBreadth();
},

//> @method scrollbar.setItems()
// Set up the list of images for this scrollbar. The image list changes depending on whether
// we're showing a corner piece or not.
// @param items (Array of StretchItem) ignored
// @group appearance
//<
setItems : function () {
	// create the items
    
    var items = this.items = [];
    if (this.showTrackButtons == true) items.add(this.startImg);
    if (this.showTrackEnds == true) items.add(this.trackStartImg);
    items.add(this.trackImg);
    if (this.showTrackEnds == true) items.add(this.trackEndImg);
    if (this.showTrackButtons == true) items.add(this.endImg);
	if (this.showCorner) this.items.add(this._cornerImg);
},

_resizeItems : function (reason) {
	// change the image list
	this.setItems();
	// resize the images in preparation for the redraw
	this.resizeImages();
    // update thumb slider
    this.setThumb();
	// mark this object as dirty to be redrawn later
	this.markForRedraw(reason || "resizeItems");
},

// show or hide corner
// Documented in the Scrollbar interface methods/attributes
setShowCorner : function (newState) {
	newState = newState != false;
	
	// if the newState is not the same as the old state
	if (this.showCorner != newState) {
		this.showCorner = newState;
        this._resizeItems("showCorner");
	}
	return newState;
},

_getCornerSize : function () {
    var index = this.getPartNum(this.cornerImg.name);
    return index != null ? this.getSize(index) : null;
},

// helper called by setScrollTarget for "self managed" scrollbars

_setScrollbarOnTarget : function (scrollTarget) {
    var otherScrollbar;

    // set a reference back to this scrollbar in the scrollTarget
    if (this.vertical) {
        scrollTarget._vscrollbar = this;
        otherScrollbar = scrollTarget._hscrollbar;
    } else {
        scrollTarget._hscrollbar = this;
        otherScrollbar = scrollTarget._vscrollbar;
    }
    // if the other scrollbar has an inconsistent corner size, resize its items
    if (otherScrollbar) {
        var cornerSize = otherScrollbar._getCornerSize();
        if (isc.isA.Number(cornerSize) && cornerSize != this.getBreadth()) {
            otherScrollbar._resizeItems("scrollbarDependency");
        }
    }
},

// When the scroll target is changed, update the _vscrollbar/_hscrollbar flags so we can
// size our corner appropriately and update the thumb trigger area
scrollTargetChanged : function (oldTarget, newTarget) {
	if (this._selfManaged) {

		var attributeName = this.vertical ? "_vscrollbar" : "_hscrollbar",
			activeOldTarget = oldTarget && (oldTarget[attributeName] == this),

			
			unchanged = activeOldTarget && (oldTarget == newTarget);
		
		
		if (!unchanged) {
			if (activeOldTarget) delete oldTarget[attributeName];
			this._setScrollbarOnTarget(newTarget);
		}
	}
	// update the thumb's trigger area to deal with new scroll target
	if (this.thumb != null) this.thumb._updateTriggerArea(newTarget);

	// call setThumb to figure out how big and where the scrollbar thumb should be
	// note: this will enable and disable the scrollbar if autoEnable is true
	this.setThumb();

},


//>	@method	scrollbar.setHandleDisabled()	(A)
// Extend setHandleDisabled to hide the thumb and show disabled styling when disabled.
//		@group enable
//
//		@param	disabled (boolean)		true if disabling
//<
setHandleDisabled : function (disabled) {
    // clear out the auto-enabled property - if we were auto disabled, we don't want to
    // auto enable.
    
	// call the superclass method
	this.Super("setHandleDisabled",arguments);

	// hide the thumb if necessary, and set it's _showWithMaster flag to avoid it showing
    // when the scrollbar is shown, if the scrollbar is disabled.
	if (this.thumb) {
         
        if (this.scrollTarget && this.scrollTarget._delayThumbVisibility) {
            if (disabled) this.thumb.delayCall("setVisibility", [isc.Canvas.HIDDEN]);
            else this.thumb.delayCall("setVisibility", [this.visibility]);
        } else {
            if (disabled) this.thumb.setVisibility(isc.Canvas.HIDDEN);
            else this.thumb.setVisibility(this.visibility);
        }
        this.thumb._showWithMaster = !disabled;
    }

	// make sure our drawn state matches the enabled state
	if (disabled == (this.state == isc.StatefulCanvas.STATE_UP)) {
		this.setState(disabled ? isc.StatefulCanvas.STATE_DISABLED: 
                                 isc.StatefulCanvas.STATE_UP );
	}
    
},


//>	@method	scrollbar.setVisibility()	(A)
// Extended to ensure thumb is placed correctly when this scrollbar is shown.
//		@group	visibility
//
//		@param	newState		(boolean)	new visible state
//<
setVisibility : function (newState,b,c,d) {
	this.invokeSuper(isc.Scrollbar, "setVisibility", newState,b,c,d);
	if (this.isVisible()) this.setThumb();
},

//>	@method	scrollbar.parentVisibilityChanged()	(A)
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

//>	@method	scrollbar.drawPeers()	(A)
//			custom drawPeers routine to size the thumb before it's drawn
//
//		@param	document		(Document)
//
//		@return	()
//<
drawPeers : function (a,b,c,d) {
	// call the routine to resize the thumb
	this.setThumb();

	// call the superclass method to actually do the drawing
	this.invokeSuper(isc.Scrollbar, "drawPeers", a,b,c,d);
},


//>	@method	scrollbar.resizePeersBy()	(A)
// Overridden to size the thumb
//
//		@param	deltaX		(number)	change in width
//		@param	deltaY		(number)	change in height
//<
resizePeersBy : function (deltaX, deltaY) {
	this.setThumb();
},

makeThumb : function () {
    if (!this.showThumb) return;

    // Note: Scrollbar sets its textDirection to "ltr", so even if running in RTL mode, `this.isRTL()'
    // will be false.

    
    var scrollTargetIsRTL = this.scrollTarget == null ? isc.Page.isRTL() : this.scrollTarget.isRTL(),
        triggerAreaOffset = isc.Browser.isTouch ? 8 : 0
    ;

	// figure out derived attributes
    var classObject = this.vertical ? this.vThumbClass : this.hThumbClass;
	this.thumb = classObject.create({
		ID:this.getID()+"_thumb",
        scrollbar:this,
		state:this.state,
        visibility:this.visibility,
        
        autoApplyDownState:false,
        autoApplyOverState:false,

		width : this.vertical ? this.getWidth() : 1,
		height : !this.vertical ? this.getHeight() : 1,

        showTriggerArea: !!this.showThumbTriggerArea,
        // In LTR mode, the trigger area cannot extend to the right of the thumb without increasing
        // the scrollWidth of the scrollTarget. Similarly, in RTL mode the trigger area cannot
        // extend to the left of the thumb without increasing the scrollWidth.
        triggerAreaLeft: this.vertical && !scrollTargetIsRTL ? triggerAreaOffset : 0,
        triggerAreaRight: this.vertical && scrollTargetIsRTL ? triggerAreaOffset : 0,

        triggerAreaTop: !this.vertical ? triggerAreaOffset : 0,

        dragScrollDirection : this.vertical ? isc.Canvas.VERTICAL : isc.Canvas.HORIZONTAL
	});
    
    // Down / Over styling
    // - by default when a statefulCanvas starts to be dragged we clear any down / over state
    //   on the item.
    // - we handle scrollbar thumb down / over styling independently via the allowThumbDownState
    //   allowThumbOverState attributes, and avoid clearing these states when the user starts
    //   dragging the thumb
    // - If showDown / showRollOver was set explicitly on the thumb, have those setting override
    //   allowThumbDown / allowThumbOver so a skin can set these attributes on the scrollbar thumb
    //   class and we'll react to them as expected.
    if (this.thumb.showRollOver) {
        this.allowThumbOverState = true
    }
    if (this.thumb.showDown) {
        this.allowThumbDownState = true;
    }
},

updateButtonsOnEdges : function () {
    // if at start/end of track, optionally disable start/end buttons
    if (this.disableButtonsOnEdges) {
        var scrollRatio = this.scrollTarget.getScrollRatio(this.vertical);
        var vpRatio = this.scrollTarget.getViewportRatio(this.vertical);
        
        // Because setState() also occurs on button clicks, we can't be clever and
        // store the previous ratio to optimize out duplicate setState() calls
        if (scrollRatio == 0) {
            this.setState(isc.StatefulCanvas.STATE_DISABLED, this.startImg.name);
        } else {
            this.setState(isc.StatefulCanvas.STATE_UP, this.startImg.name);
        }
        if (scrollRatio == 1 || vpRatio >= 1) {
            this.setState(isc.StatefulCanvas.STATE_DISABLED, this.endImg.name);
        } else {
            this.setState(isc.StatefulCanvas.STATE_UP, this.endImg.name);
        }
    }
},

// Documented in the common scrollbar interface attributes
setThumb : function () {
    // every time thumb is updated, check to see if buttons need disabling
    this.updateButtonsOnEdges();

    // Bail if the thumb hasn't been created yet. This happens on setWidth() / setHeight()
    // during initWidget()
    if (this.thumb == null || this._suppressSetThumb) return;

    

    this._adjustThumbOverlap();

    var thumb = this.thumb,
        trackSize = this.trackSize();

    // make sure the thumb is above us (we avoid automatically redrawing the thumb, so it can
    // end up underneath the zIndex of the latest draw of the track/buttons)
    if (this.isDrawn() && thumb.isDrawn()) thumb.moveAbove(this);

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

// whether canvas is one of ours (the scrollbar or thumb) that bubbles to scrollTarget
_hasScrollTargetEventParent : function (canvas) {
    if (this.disabled) return false;
    return canvas == this || canvas && canvas == this.thumb;
},


// Override 'setZIndex' to ensure the thumb stays above us when our z-index changes.
setZIndex : function (newIndex) {
    this.Super("setZIndex", arguments);
    if (this.thumb) this.thumb.moveAbove(this);
},

//>	@method	scrollbar.moveThumbTo()	(A)
//			move the thumb to a particular coordinate
//
//		@param	coord		(number)	new x or y coordinate to move to
//<
moveThumbTo : function (coord) {
    if (!this.thumb) return;
	if (this.vertical)
		return this.thumb.moveTo(this.getLeft() + this.thumbInset, coord);
	else
		return this.thumb.moveTo(coord, this.getTop() + this.thumbInset);
},


//>	@method	scrollbar.thumbSize()	(A)
//		@group	sizing
//			return the size of the thumb in the direction of the scroll
//		@return	(number)	the size of the thumb in the direction of the scroll
//<
thumbSize : function () {
    if (!this.thumb) return;
	return (this.vertical ? this.thumb.getHeight() : this.thumb.getWidth());
},


//>	@method	scrollbar.moveThumb()	(A)
// Move the thumb to the right place for the scroll of the target
// <P>
// May enable/disable the scrollbar if scrolling is no longer necessary because everything is
// visible.
//		@group	sizing
//<
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
    if (EH.mouseIsDown() && (EH.mouseDownTarget() == this) && this.thumb.containsEvent())
        this.doneTrackScrolling();
},


_adjustThumbOverlap : function () {
    this._startThumbOverlap = this.startThumbOverlap;
    this._endThumbOverlap   = this.endThumbOverlap;

    // shortfall - how far are we from the minimum size?
    var shortfall = this.trackMinSize - this.trackSize();
    if (shortfall <= 0) return;

    // if overlaps are different, increase more negative overlap first
    var overlapDiff = this._startThumbOverlap - this._endThumbOverlap;
    if (overlapDiff > 0) {
        var offset = Math.min(shortfall, overlapDiff);
        shortfall -= offset, this._endThumbOverlap += offset;
    } else if (overlapDiff < 0) {
        var offset = Math.min(shortfall, -overlapDiff);
        shortfall -= offset, this._startThumbOverlap += offset;
    }
    if (shortfall <= 0) return;

    // otherwise, increase them equally to meet trackMinSize
    var startOffset = shortfall >> 1,
        endOffset = shortfall - startOffset;
    this._startThumbOverlap += startOffset;
    this._endThumbOverlap   += endOffset;
},

_$thumb:"thumb",
trackMinSize: 1,
//>	@method	scrollbar.trackSize()	(A)
//		@group	sizing
//			return the size of the scroll track
//		@return	(number)	size of the scroll track
//<
trackSize : function () {
    // only include trackStart/End sizes if showTrackEnds isn't false
    return this.getSize(this.getPartNum(this.trackImg.name)) +
           (this.showTrackEnds != false ? (this.getSize(this.getPartNum(this.trackStartImg.name)) +
                                           this.getSize(this.getPartNum(this.trackEndImg.name)))
                                        : 0) +
           this._startThumbOverlap + this._endThumbOverlap;
},


//>	@method	scrollbar.trackStart()	(A)
// Return where the scroll track starts
//		@group	sizing
//
//		@return	(number)	relative pixel where the scroll track starts
//<
trackStart : function () {
	return (this.vertical ? this.getTop() : this.getLeft()) + (this.showTrackButtons == true ? 
               this.getSize(this.getPartNum(this.startImg.name)) : 0) - this._startThumbOverlap;
},

//>	@method	scrollbar.directionRelativeToThumb()	(A)
// Return where an x,y coordinate is in relation to the scroll thumb, accounting for direction
//
//		@return	(number)
//			negative == before thumb
//			0 == inside thumb
//			positive == after thumb
//<
directionRelativeToThumb : function () {
    if (!this.thumb) {
        // no thumb means no track: buttons only
        if (this.clickPart == this.startImg.name) return -1;
        else return 1;
    }
    var coord, thumb = this.thumb, thumbEdge, thumbSize;   
    if (this.vertical) {
        coord = isc.EH.getY();
        thumbEdge = thumb.getPageTop();
        thumbSize = thumb.getHeight();
    } else {
        coord = isc.EH.getX();
        thumbEdge = thumb.getPageLeft();
        thumbSize = thumb.getWidth();
    }
    if (coord < thumbEdge) return -1;
    else if (coord > thumbEdge + thumbSize) return 1;
    return 0;
},

autoApplyDownState:false,
autoApplyOverState:false,


//>	@method	scrollbar.mouseDown()	(A)
//			mouseDown handler -- figures out what was clicked on and what to do
//		@group	event handling
//
//		@return	(boolean)	false == cancel event processing
//<
mouseDown : function () {
	// figure out which part they clicked in and remember it
	this.clickPart = this.inWhichPart();

    // if the click is in a corner, clear the clickPart
    if (this.clickPart == this.cornerImg.name) {
        this.clickPart = null;

    // show that clickPart as down visually
    } else {
        this._updateItemStates(isc.StatefulCanvas.STATE_DOWN, this.clickPart);
    }

	// remember the 'direction' of the click relative to the thumb
	//	 -1 = before thumb, 0 = inside thumb, 1 = after thumb
	this.startDirection = this.directionRelativeToThumb();

	// return false so we cancel event processing
	return isc.EH.STOP_BUBBLING;
},

//>	@method	scrollbar.mouseStillDown()	(A)
//			mouseStillDown handler
//		@group	event handling
//
//		@return	(boolean)	false == cancel event processing
//<
mouseStillDown : function () {
	// scroll the target according to where the mouse went down
	if (this.clickPart == this.trackImg.name || this.showTrackEnds == true && 
            (this.clickPart == this.trackStartImg.name || this.clickPart == this.trackEndImg.name)) {
        
        // avoid continuing to page scroll if the thumb passes the cursor
        // direction will be zero the the thumb is actually underneath the cursor
        var direction = this.directionRelativeToThumb();
        if (direction != 0 && direction == this.startDirection) {
            // Make a note of the fact that we're doing repeated track scrolls
            // Note: do this on the 2nd track scroll only - we don't want a single click in the
            // track to count as this kind of rapid scrolling
            if (this._initialTrackScroll) {
                delete this._initialTrackScroll;
                this._repeatTrackScrolling = true;
            } else if (!this._repeatTrackScrolling) 
                this._initialTrackScroll = true;
            
            this.scrollTarget.scrollByPage(this.vertical, this.startDirection, "trackClick");
        }
        
    } else {
        // button click
        this.scrollTarget.scrollByDelta(this.vertical, this.startDirection, "trackButtonClick");
    }

	// return true that mouseStillDown should continue
	//return isc.EventHandler.STOP_BUBBLING;
	return true;
},

doubleClick : function () {
    //this.logWarn("scrollbar double click");
    
    if (isc.Browser.isIE) return this.mouseStillDown();

	// return isc.EventHandler.STOP_BUBBLING so we cancel event processing
	return isc.EH.STOP_BUBBLING;
},

handleShowContextMenu : function () {
    // Disable the "Save image" dialog in Chrome for Android
    if (this.ns.EH._handlingTouchEventSequence()) return false;
},

_updateItemStates : function (newState, part) {
    if (part == null) return this.setState(newState);
    var defaultState = isc.StatefulCanvas.STATE_UP,
        track = (part  == this.trackImg.name || 
                 part == this.trackStartImg.name ||
                 part == this.trackEndImg.name),
        start = !track && part == this.startImg.name,
        end = !track && !start && part == this.endImg.name,
        corner = !track && !start && !end,
        
        trackState = track ? newState : defaultState;

    this.setState(start ? newState : defaultState, this.startImg.name);
    this.setState(trackState,this.trackImg.name);
    if (this.showTrackEnds) this.setState(trackState,this.trackStartImg.name);
    if (this.showTrackEnds) this.setState(trackState,this.trackEndImg.name);
    this.setState(end ? newState : defaultState, this.endImg.name);
    if (this.showCorner) this.setState(corner ? newState : defaultState, this.cornerImg.name);
},

//>	@method	scrollbar.mouseUp()	(A)
//		@group	event handling
//			mouseUp handler for the main scrollbar
//
//		@return	(boolean)	false == cancel event processing
//<
mouseUp : function () {
	// show the clickPart as up again visually
	if (this.clickPart) {
        var newState = this.showRollOver ? 
                        isc.StatefulCanvas.STATE_OVER : isc.StatefulCanvas.STATE_UP;
        this._updateItemStates(newState, this.clickPart);
    }
    this.clickPart = null;
    this.doneTrackScrolling();
    
    this.updateButtonsOnEdges();

	// return isc.EventHandler.STOP_BUBBLING so we cancel event processing
	return isc.EventHandler.STOP_BUBBLING;
},

// Stop various events from propagating to the parent of the Canvas we are scrolling.
click : isc.EventHandler.stopBubbling,
handleMouseOver:isc.EH.stopBubbling,
// MouseMove - respect showRollOver - implemented to show partwise rollOver  
handleMouseMove : function () {
    // clickPart should be defined if the mouse went down over this item - otherwise 
    // we don't want to show a down state at all
    if (this.ns.EH.mouseIsDown() && this.clickPart) {
        // appropriate item down state should have been set already - no need to re-set
        //this._updateItemStates(isc.StatefulCanvas.STATE_DOWN, this.clickPart);
    } else if (this.showRollOver) {
        this._updateItemStates(isc.StatefulCanvas.STATE_OVER, this.inWhichPart());
    }
    return isc.EH.STOP_BUBBLING;
},

//>	@method	scrollbar.mouseOut()	(A)
//			mouseOut event handler -- clear the button hilite, if appropriate
//			may redraw the button
//		@group	events
//<
handleMouseOut : function (event) {
    if (this.ns.EH.mouseIsDown()) return isc.EH.STOP_BUBBLING;
    if (this.showRollOver) {
        this.setState(isc.StatefulCanvas.STATE_UP);
	}
    if (this._shouldSuppressMouseOut(event)) {
        return isc.EH.STOP_BUBBLING;
    }
},

// avoid triggering drag interactions on the track (possible if any of our master's parents are
// canDrag:true and aren't coded to explicitly avoid drag interactions on scrollbars)
prepareForDragging : function () { return false; },

// is the user currently scrolling by dragging the scroll thumb?
isDragScrolling : function () {
    return this._dragScrolling;
},

// is the user scrolling by holding the mouse down over the track?
isRepeatTrackScrolling : function () {
    return this._repeatTrackScrolling;
},

doneTrackScrolling : function () {
    // We're no longer repeat track scrolling
    delete this._initialTrackScroll;
    if (this.isRepeatTrackScrolling()) {
        delete this._repeatTrackScrolling;
        
        // notify the target we're done with 'track scrolling'
        if (this.scrollTarget && this.scrollTarget.doneFastScrolling) this.scrollTarget.doneFastScrolling();
    }
},


// Implement custom mouseOver / mouseOut handlers for the thumb to show and clear over state
// We do this rather than relying on the standard StatefulCanvas.showRollOver behavior since
// when the user starts dragging the thumb we get mouseOut event and we don't want to clear the
// state in that case - instead wait for drag stop / mouseUp

//>	@method	scrollbar.thumbOver()	(A)
// Handle mouse over the thumb
//		@group	event handling
//
//		@return	(boolean)	false == cancel event processing
//<
thumbOver : function () {    
	// show the thumb as down
	if (this.allowThumbOverState) {
        this.thumb.setState(isc.StatefulCanvas.STATE_OVER);
    }
},

//>	@method	scrollbar.thumbOut()	(A)
// Handle mouse out over the thumb
//		@group	event handling
//
//		@return	(boolean)	false == cancel event processing
//<
thumbOut : function (event) {
    if (!isc.EH.mouseIsDown()) {
        this.thumb.setState(isc.StatefulCanvas.STATE_UP);
    }
    if (this._shouldSuppressMouseOut(event)) {
        return isc.EH.STOP_BUBBLING;
    }
},


//>	@method	scrollbar.thumbDown()	(A)
// Handle mouse down in the thumb
//		@group	event handling
//
//		@return	(boolean)	false == cancel event processing
//<
thumbDown : function () {
    this.clickPart = this._$thumb;
    
	// show the thumb as down
	if (this.allowThumbDownState) {
        this.thumb.setState(isc.StatefulCanvas.STATE_DOWN);
    }
	return isc.EventHandler.STOP_BUBBLING;
},


//>	@method	scrollbar.thumbDragStart()	(A)
// Handle drag start in the thumb
//		@group	event handling
//
//		@return	(boolean)	false == cancel event processing
//<
thumbDragStart : function () {
	// set the offsetX and offsetY so the thumb moves with the mouse properly
    var EH = isc.EH;
    EH.setDragOffset(this.thumb.getOffsetX(EH.mouseDownEvent),
	                 this.thumb.getOffsetY(EH.mouseDownEvent));
    this._dragScrolling = true;
	return EH.STOP_BUBBLING;
},

//>	@method	scrollbar.getEventCoord()	(A)
//			return the event coordinate we care about, in the relevant direction
//		@return	(number)	x or y coordinate, relative to our coordinate system
//<
getEventCoord : function () {
    var EH = isc.EH;
    return (this.vertical ? 
            EH.getY() - this.getPageTop()  - EH.dragOffsetY :
            EH.getX() - this.getPageLeft() - EH.dragOffsetX) + this._startThumbOverlap -
        (this.showTrackButtons == true ? this.getSize(this.getPartNum(this.startImg.name)) : 0);
},


masterMoved : function (dX,dY,a,b,c,d) {
    if (this.masterElement._settingRect) return;
    return this.invokeSuper(isc.Scrollbar, "masterMoved", dX, dY, a,b,c,d);
},

//>	@method	scrollbar.thumbMove()	(A)
//			mouse move in the thumb
//
//		@return	(boolean)	false == cancel event processing
//<
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


//>	@method	scrollbar.thumbUp()	(A)
//			mouse up in the thumb
//
//		@return	(boolean)	false == cancel event processing
//<
thumbUp : function () {    
    // The thumb can catch the mouse up events that really should be going to
    // the track, because the thumb winds up occluding the track when the button is
    // held down long enough to move the thumb to where the mouse pointer is. If we're
    // currently servicing a non-thumb click, bail out and call mouseUp.
    if (this.clickPart != this._$thumb)
        return this.mouseUp();

    // Keep the thumb in the "Over" state if not handling a touch event sequence and the mouse
    // pointer is still within the thumb because we'll get a mouseOut() event when the mouse
    // leaves the thumb, and that's when we should change the thumb state back to STATE_UP.
    var newState = (this.allowThumbOverState && this.thumb.containsEvent() &&
                    !isc.EH._handlingTouchEventSequence()
                    ? isc.StatefulCanvas.STATE_OVER
                    : isc.StatefulCanvas.STATE_UP);

	this.thumb.setState(newState);
	return isc.EventHandler.STOP_BUBBLING;
},

//>	@method	scrollbar.thumbDragStop()
//  Event fired when the user stops dragging the scrollbar thumb
//<
thumbDragStop : function () {
    delete this._dragScrolling;
    
    // doneFastScrolling() - notifies the target that the user is no longer performing
    // rapid scrolls on the widget
    if (this.scrollTarget && this.scrollTarget.doneFastScrolling) this.scrollTarget.doneFastScrolling();
    
    // thumbUp will handle clearing the down state, etc.
    return this.thumbUp();
},


// pass key and mousewheel events through
keyPress : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.KEY_PRESS);
},
keyDown : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.KEY_DOWN);
},
keyUp : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.KEY_UP);
},
mouseWheel : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.MOUSE_WHEEL);
},

// If this scrollbar was created by a widget automatically, always hide by shifting to 
// top/left and sizing to smallest possible size of the target.

hide : function (a,b,c,d) {
    this.invokeSuper(isc.Scrollbar, "hide", a,b,c,d);
    if (!this._selfManaged && this.scrollTarget != null) {
        this.moveTo(this.scrollTarget.getLeft(), this.scrollTarget.getTop());
        this.resizeTo(1,1);
    }
},

// helper to set eventParent of both this scrollbar and the thumb
_redirectEvents : function (eventParent) {
    var thumb = this.thumb;
    if (!eventParent) eventParent = null;
    this.eventParent = eventParent;
    if (thumb != null) thumb.eventParent = eventParent;
},


_shouldSuppressMouseOut : function (event) {
    var target = event.target;
    return target && target == this.scrollTarget && target.receiveScrollbarEvents;
},


enableTouchSupport : function () {
    this.Super("enableTouchSupport", arguments);
    if (isc.Browser.isChrome && this.thumb) this.thumb._updateTouchSupport();
}

});

// When spriting is enabled, the Enterprise, EnterpriseBlue, and Graphite skins customize these
// Sprited* subclasses instead of Scrollbar, HScrollThumb, and VScrollThumb so that scrollbar
// spriting can be disabled on a per-component basis by setting the scrollbarConstructor to
// "Scrollbar" instead of the default.
isc.defineClass("SpritedScrollThumb", "ScrollThumb");
isc.defineClass("SpritedHScrollThumb", "SpritedScrollThumb").addProperties({ vertical:false });
isc.defineClass("SpritedVScrollThumb", "SpritedScrollThumb").addProperties({ vertical:true });
isc.defineClass("SpritedSimpleScrollThumb", "HSimpleScrollThumb");
isc.defineClass("SpritedHSimpleScrollThumb", "SpritedSimpleScrollThumb").addProperties({ vertical:false });
isc.defineClass("SpritedVSimpleScrollThumb", "SpritedSimpleScrollThumb").addProperties({ vertical:true });
isc.defineClass("SpritedScrollbar", "Scrollbar").addProperties({
    hThumbClass: isc.SpritedHScrollThumb,
    vThumbClass: isc.SpritedVScrollThumb
});

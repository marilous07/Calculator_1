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
/*---------->    isc.Slider.js    <----------*/

//	The Slider class was developed as an instructional/documentation example of
//	creating a new widget class, covering a broad range of ISC client-side
//	framework concepts and conventions.

// Questions: jeff@isomorphic.com





//----------  Description  ----------
//> @class Slider
//	The Slider class implements a GUI slider widget allowing the user to select a numeric 
//  value from within a range by dragging a visual indicator up and down a track.
//	<p>
//  The slider will generate events as the user interacts with it and changes its value.
//  If slider.sliderTarget is specified, moving the slider thumb generates a custom
//	event named 'sliderMove', sent to the sliderTarget.
//  If a <code>sliderMove</code> handler stringMethod is defined on the target, it will be 
//  fired when the slider is moved. The second parameter (available via the variable name
//  <code>eventInfo</code> if the handler is a string) is a pointer back to the slider.
//  <p>
//  The slider will also fire a <code>valueChanged()</code> method whenever its value is 
//  changed.  This can be observed or overridden on the Slider instance to perform some action.
// 
//  @inheritsFrom Canvas
//  @treeLocation Client Reference/Control
//  @visibility external
//  @example slider
//<

//----------  Create the class  ----------
isc.ClassFactory.defineClass("Slider", isc.Canvas);



//----------  Define static properties  ----------
isc.Slider.addClassProperties({
    // isc.Slider.DOWN                   down state for the slider thumb
	DOWN:"down",				
    // isc.Slider.UP                     up (enabled) state for the slider thumb
	UP:"",						
    // isc.Slider.EVENTNAME              name of event sent to sliderTarget when thumb moved
	EVENTNAME:"sliderMove"		
});


//----------  Define instance properties  ----------
isc.Slider.addProperties({
    
    overflow: "hidden",

    //>	@attr	slider.title		(String : "Set Value" : [IRW])
    // Optional display title for the slider.
    //      @see attr:showTitle
    //      @visibility external
    //<
	title:"Set Value",					
	
    //>	@attr	slider.length		(int : 200 : [IRW])
    // Used to set slider height if vertical, slider width if horizontal.
    // Applied to the slider track, not necessarily the entire widget.
    // Overridden by an explicit width/height specification for the widget.
    //      @visibility external
    //<
	length:200,					

    //>	@attr	slider.vertical		(Boolean : true : [IRW])
    // Indicates whether this is a vertical or horizontal slider.
    //      @visibility external
    //      @example slider
    //<
	vertical:true,				
	
    //>	@attr	slider.thumbThickWidth		(int : 23 : [IRW])
    // The dimension of the thumb perpendicular to the slider track.
    //      @visibility external
    //<
	thumbThickWidth:23,

    //>	@attr	slider.thumbThinWidth		(int : 17 : [IRW])
    // The dimension of the thumb parallel to the slider track.
    //      @visibility external
    //<
	thumbThinWidth:17,			

    //> @attr slider.trackWidth (int : 7 : [IRW])
    // The thickness of the track. This is the width, for a +link{slider.vertical, vertical} 
    // slider, or the height, for a horizontal slider.
    // @visibility external
    //<
	trackWidth:7,				

    //> @attr slider.hThumbStyle (CSSStyleName : null : IR)
    // Optional CSS style for the thumb for a +link{slider.vertical, horizontally oriented}
    // slider.
    // <P>
    // Will have the suffix "down" added when the mouse is down on the thumb, and "Disabled"
    // added when the slider is disabled.
    //
    // @visibility external
    //<

    //> @attr slider.vThumbStyle (CSSStyleName : null : IR)
    // Optional CSS style for the thumb for a +link{slider.vertical, vertically oriented} 
    // slider.  See +link{hThumbStyle} for state suffixes.
    // @visibility external
    //<

    //> @attr slider.hTrackStyle (CSSStyleName : null : IR)
    // Optional CSS style for the track for a +link{slider.vertical, horizontally oriented} 
    // slider.
    // <P>
    // Will have the suffix "Disabled" added when the slider is disabled.
    //
    // @visibility external
    //<

    //> @attr slider.vTrackStyle (CSSStyleName : null : IR)
    // Optional CSS style for the track for a +link{slider.vertical, vertically oriented} 
    // slider.
    // <P>
    // Will have the suffix "Disabled" added when the slider is disabled.
    // @visibility external
    //<

    // skinImgDir       subdirectory for slider skin images
	skinImgDir:"images/Slider/",	

    //>	@attr	slider.thumbSrc		(String : "thumb.gif" : [IRW])
    // The base filename for the slider thumb images.
    // The filenames for the thumb icons are assembled from this base filename and the state of the
    // thumb, as follows:<br>
    // Assume the thumbSrc is set to <code>{baseName}.{extension}</code><br>
    // The full set of images to be displayed is:<br>
    // For horizontal sliders:
    // <ul>
    // <li><code>h{baseName}.{extension}</code>: default enabled appearance.
    // <li><code>h{baseName}_down.{extension}</code>:  appearance when the slider is enabled and the
    //     thumb is clicked.
    // <li><code>h{baseName}_Disabled.{extension}</code>:  appearance when the slider is disabled.
    // </ul>
    // For vertical sliders:
    // <ul>
    // <li><code>v{baseName}.{extension}</code>: default enabled appearance.
    // <li><code>v{baseName}_down.{extension}</code>:  appearance when the slider is enabled and the
    //     thumb is clicked.
    // <li><code>v{baseName}_Disabled.{extension}</code>:  appearance when the slider is disabled.
    // </ul>
    //      @visibility external
    //<
	thumbSrc:"thumb.gif",		

    //>	@attr	slider.trackSrc		(String : "track.gif" : [IRW])
    // The base filename for the slider track images.
    // The filenames for the track icons are assembled from this base filename and the state of the
    // slider, as follows:<br>
    // Assume the trackSrc is set to <code>{baseName}.{extension}</code><br>
    // The full set of images to be displayed is:<br>
    // For horizontal sliders:
    // <ul>
    // <li><code>h{baseName}_start.{extension}</code>: start (left edge) of the track for a slider
    //     that is enabled.
    // <li><code>h{baseName}_stretch.{extension}</code>:  the track for an enabled slider; this may
    //     be centered, tiled, or stretched.
    // <li><code>h{baseName}_end.{extension}</code>:  end (right edge) of the track for a slider
    //     that is enabled.
    // <li><code>h{baseName}_Disabled_start.{extension}</code>: start (left edge) of the track for a slider
    //     that is disabled.
    // <li><code>h{baseName}_Disabled_stretch.{extension}</code>:  the track for a disabled slider; this
    //     may be centered, tiled, or stretched.
    // <li><code>h{baseName}_Disabled_end.{extension}</code>:  end (right edge) of the track for a slider
    //     that is disabled.
    // </ul>
    // For vertical sliders:
    // <ul>
    // <li><code>v{baseName}_start.{extension}</code>: start (bottom edge) of the track for a slider
    //     that is enabled.
    // <li><code>v{baseName}_stretch.{extension}</code>:  the track for an enabled slider; this may
    //     be centered, tiled, or stretched.
    // <li><code>v{baseName}_end.{extension}</code>:  end (top edge) of the track for a slider
    //     that is enabled.
    // <li><code>v{baseName}_Disabled_start.{extension}</code>: start (bottom edge) of the track for a slider
    //     that is disabled.
    // <li><code>v{baseName}_Disabled_stretch.{extension}</code>:  the track for a disabled slider; this
    //     may be centered, tiled, or stretched.
    // <li><code>v{baseName}_end.{extension}</code>:  end (top edge) of the track for a slider
    //     that is disabled.
    // </ul>
    //      @see attr:trackImageType
    //      @visibility external
    //<
	trackSrc:"track.gif",		
								
    //> @attr slider.trackCapSize (int : 6 : [IRW])
    // The height of +link{slider.vertical, vertical} slider start and end images, or width of 
    // horizontal slider start and end images.
    // @visibility external
    //<
	trackCapSize:6,

    //>	@attr	slider.trackImageType		(ImageStyle : "stretch" : [IRW])
    // The imageType setting for the slider track.
    //      @see type:ImageStyle
    //      @see attr:stretchImg.imageType
    //      @visibility external
    //<
	trackImageType:isc.Img.STRETCH,

    //> @attr slider.showTitle (Boolean : true : [IRW])
    // Indicates whether the slider's +link{slider.title, title} should be displayed. The 
    // default position for the title-label is to the left of a horizontal slider, or above a 
    // +link{slider.vertical, vertical} slider.
    // @see attr:title
    // @visibility external
    //<
	showTitle:true,				
								
    //> @attr slider.showRange (Boolean : true : [IRW])
    // Indicates whether labels for the +link{slider.rangeLabel, min and max values} of the 
    // slider should be displayed. The default positions for these labels are below the 
    // start/end of a horizontal slider, or to the right of the start/end of a 
    // +link{slider.vertical, vertical} slider.
    // @see attr:minValueLabel
    // @see attr:maxValueLabel
    // @visibility external
    //<
	showRange:true,				
								
    //> @attr slider.showValue (Boolean : true : [IRW])
    // Indicates whether a +link{slider.valueLabel, label} for the value of the slider should 
    // be displayed. The default position for this label is to the right of a 
    // +link{slider.vertical, vertical} slider, 
    // or below a horizontal slider.
    // @see attr:value
    // @visibility external
    //<
	showValue:true,

    //>	@attr	slider.labelWidth		(int : 50 : [IRW])
    // The width of the labels used to display the minimum, maximum and current values of the
    // slider.
    //      @visibility external
    //<
	labelWidth:50,

    //> @attr slider.labelHeight (int : 20 : [IRW])
    // The height of the labels used to display the 
    // +link{slider.rangeLabel, minimum, maximum} and +link{slider.valueLabel, current} values 
    // of the slider.
    // @visibility external
    //<
	labelHeight:20,

    //> @attr slider.labelSpacing (int : 5 : [IRW])
    // The space around the labels used to display the 
    // +link{slider.rangeLabel, minimum, maximum} and +link{slider.valueLabel, current} values 
    // of the slider.
    // @visibility external
    //<
	labelSpacing:5,

    //> @attr slider.vLabelSpacing (Integer : null : [IRW])
    // The space around the labels used to display the 
    // +link{slider.rangeLabel, minimum, maximum} and +link{slider.valueLabel, current} values 
    // of the slider, when +link{slider.vertical, vertical} is true.  If unset, defaults to 
    // +link{slider.labelSpacing}.
    // @visibility external
    //<
    
    //> @attr slider.hLabelSpacing (Integer : null : [IRW])
    // The space around the labels used to display the 
    // +link{slider.rangeLabel, minimum, maximum} and +link{slider.valueLabel, current} values 
    // of the slider, when +link{slider.vertical, vertical} is false.  If unset, defaults to 
    // +link{slider.labelSpacing}.
    // @visibility external
    //<

    //> @attr slider.titleSpacing (int : 5 : [IRW])
    // The space between the +link{slider.showTitle, title} and the track.
    // @visibility external
    //<
    titleSpacing: 5,

    //> @attr slider.titleStyle (CSSStyleName : "sliderTitle" : IR)
    // CSS style for the +link{slider.title, title-text}, when 
    // +link{slider.showTitle, showTitle} is true.
    // @visibility external
    //<
	titleStyle: "sliderTitle",
    
    //> @attr slider.rangeStyle (CSSStyleName : "sliderRange" : IR)
    // CSS style for the +link{slider.rangeLabel, min and max} range-labels, when 
    // +link{slider.showRange, showRange} is true.
    // @visibility external
    //<
	rangeStyle: "sliderRange",
    
    //> @attr slider.valueStyle (CSSStyleName : "sliderValue" : IR)
    // CSS style for the floating +link{slider.valueLabel, valueLabel}, visible when
    // +link{slider.showValue} is true.
    // @visibility external
    //<
	valueStyle: "sliderValue",
    
    //> @attr slider.vValueStyle (CSSStyleName : null : IR)
    // Optional CSS style for the floating +link{slider.valueLabel, valueLabel}, visible when
    // +link{slider.showValue} is true and +link{slider.vertical, vertical} is true.
    // @visibility external
    //<

    //> @attr slider.hValueStyle (CSSStyleName : null : IR)
    // Optional CSS style for the floating +link{slider.valueLabel, valueLabel}, visible when
    // +link{slider.showValue} is true and +link{slider.vertical, vertical} is false.
    // @visibility external
    //<
    
    //> @attr slider.valueTextStyle (CSSStyleName : "sliderValueText" : IR)
    // CSS style for the text in the floating +link{slider.valueLabel, valueLabel}, 
    // visible when +link{slider.showValue, showValue} is true.
    // @visibility external
    //<
	valueTextStyle: "sliderValueText",

	//XXX need to create and use these CSS styles
	//XXX need mechanism for overriding default layouts

    //>	@attr	slider.value		(float : 1 : [IRW])
    // The slider value. This value should lie between the minValue and maxValue and increases as
    // the thumb is moved up (for a vertical slider) or right (for a horizontal slider) unless
    // flipValues is set to true.
    //      @see attr:minValue
    //      @see attr:maxValue
    //      @see attr:flipValues
    //      @see attr:showValue
    //      @visibility external
    //<
	value:1,					
	
    //>	@attr	slider.minValue		(float : 1 : [IRW])
    // The minimum slider value. The slider value is equal to minValue when the thumb is at the
    // bottom or left of the slider (unless flipValues is true, in which case the minimum value
	// is at the top/right of the slider)
    //      @see attr:slider.flipValues
    //      @visibility external
    //      @example slider
    //<
	minValue:1,					

    //>	@attr	slider.minValueLabel		(String : null : [IRW])
    // The text displayed in the label for the minimum value of the slider. If left as null, then
    // slider.minValue will be displayed.
    //      @see attr:showRange
    //      @see attr:minValue
    //      @visibility external
    //<
	
    //>	@attr	slider.maxValue		(float : 100 : [IRW])
    // The maximum slider value. The slider value is equal to maxValue when the thumb is at the
    // top or right of the slider (unless flipValues is true, in which case the maximum value
	// is at the bottom/left of the slider)
    //      @see attr:slider.flipValues
    //      @visibility external
    //      @example slider
    //<
	maxValue:100,				

    //>	@attr	slider.maxValueLabel		(String : null : [IRW])
    // The text displayed in the label for the maximum value of the slider. If left as null, then
    // slider.maxValue will be displayed.
    //      @see attr:showRange
    //      @see attr:maxValue
    //      @visibility external
    //<

    //> @attr slider.numValues (Integer : null : [IRW])
    // The number of discrete values represented by slider. If specified, the range of valid
    // values (between <code>minValue</code> and <code>maxValue</code>) will be divided into
    // this many steps. As the thumb is moved along the track it will only select these values
    // and appear to jump between the steps.
    // @visibility external
    // @example slider
    //<

    //>	@attr slider.roundValues		(Boolean : true : [IRW])
    // Specifies whether the slider value should be rounded to the nearest integer.  If set to
    // false, values will be rounded to a fixed number of decimal places controlled by
    // +link{roundPrecision}.
    //
    //      @visibility external
    //<
	roundValues:true,
    
    //> @attr slider.roundPrecision (int : 1 : [IRW])
    // If +link{slider.roundValues} is false, the slider value will be rounded to this number of
    // decimal places. If set to null the value will not be rounded
    // @visibility external
    //<
    roundPrecision:1,

    //> @attr slider.flipValues (Boolean : false : [IRW])
    // Specifies whether the value range of the slider should be flipped so that values increase as
    // the thumb is moved down (for a +link{slider.vertical, vertical} slider) or to the left 
    // (for a horizontal slider).
    // @visibility external
    //<
	flipValues:false,
						
    //>	@attr	slider.sliderTarget		(Canvas : null : [IRW])
    // The target widget for the <code>sliderMove</code> event generated when the slider thumb 
    // is moved.
    //      @visibility external
    //<

    //>	@attr	slider.canFocus		(Boolean : true : [IRW])
    // Indicates whether keyboard manipulation of the slider is allowed.
    //      @visibility external
    //<
    canFocus:true,   

    //>	@attr	slider.stepPercent		(float : 5 : [IRW])
    // The percentage of the total slider that constitutes one discrete step. The slider will move
    // one step when the appropriate arrow key is pressed.
    //      @visibility external
    //<
    stepPercent:5,
    
    //>	@attr	slider.animateThumb		(Boolean : true : [IRW])
    // Should the thumb be animated to its new position when the value is changed programmatically,
    // or by clicking in the slider track.
    //      @visibility animation
    //      @group animation
    //<
    //animateThumb:false,

    //>	@attr	slider.animateThumbTime		(int : 250 : [IRW])
    // Duration of thumb animation, in milliseconds.
    //      @visibility animation
    //      @group animation
    //<
    animateThumbTime:250,
    
    //>	@attr	slider.animateThumbInit		(Boolean : false : [IRW])
    // If thumb animation is enabled, should the thumb be animated to its initial value?
    //      @visibility animation
    //      @group animation
    //<
    //animateThumbInit:false,    

    // undocumented for now; possibly make this internal
    animateThumbAcceleration:"slowStartandEnd",
    
    
    valueChangedOnDrag:true,   // default false may be more appropriate, but has backcompat problems
    valueChangedOnRelease:true, // can set this to false to exactly match the pre-5.5 behavior
	valueChangedOnClick:true // actually on mouseUp, but that is too confusable with thumb release
});



//!>Deferred
//----------  Define instance methods  ----------
isc.Slider.addMethods({

// update the valueLabel (a top-level widget) when the Slider resizes/moves 
resized : function () {
    this._updateValueLabel("resized");
},
moved : function () {
    this._updateValueLabel("moved");
},
// also update the valueLabel when the parent resizes/moves/scrolls/changes visibility
parentResized : function () {
    this._updateValueLabel("parentResized");
},
parentMoved : function () {
    this._updateValueLabel("parentMoved");
},
parentScrolled : function () {
    this._updateValueLabel("parentScrolled");
},
parentVisibilityChanged : function (visible) {
    this._updateValueLabel("parentVisibilityChanged");
},

//------  initWidget()
// Extends superclass initWidget() to set slider dimensions, create the track and thumb child
// widgets, and initialize the slider's target, value, and enabled state.
initWidget : function () {
	this.Super("initWidget", arguments);
    // If passed a minValue that's greater than a max value, swap them.
    // If they are equal just leave them for now - we'll always return that value.
    if (!(this.minValue <= this.maxValue)) {
        this.logWarn("Slider specified with minValue:"+ this.minValue 
                    + ", greater than maxValue:"+ this.maxValue 
                    + " - reversing max and min value.");
        var minValue = this.minValue;
        this.minValue = this.maxValue;
        this.maxValue = minValue;
    }

    // Enforce rounding precision on min/max values.
    
    if (this.minValue != null) this.minValue = this._getRoundedValue(this.minValue);
    if (this.maxValue != null) this.maxValue = this._getRoundedValue(this.maxValue);

    // Save explicit length in case vertical state is changed
    this._userLength = this.length;

    this._createChildren();
},

_createChildren : function () {
    // calculate canvas width and height according to this.vertical
    this.setUpSize();

	// create track and thumb
    this._createTrackLayout();

	// create title, range, value labels if specified
	if (this.showTitle) this._titleLabel = this.addChild(this._createTitleLabel());
	if (this.showRange) {
		this._minLabel = this.addChild(this._createRangeLabel("min"));
		this._maxLabel = this.addChild(this._createRangeLabel("max"));
	}
	if (this.showValue) {
        this._createValueLabel();
        var l = this._valueLabelLayoutContainer || this._valueLabelLayout;
        l.bringToFront();
        // Ensure the valueLabel is drawn at the correct position by delaying its placement
        // until the Slider as a whole is draw()n
        this._updateValueLabelOnDraw = true;
    }

	// If an event is sent with a null target, the event handling system determines the
	// target based on the last mouse event. We definitely don't want that, so make this
	// slider the target if no target has been specified.
    

	this.setValue(this.value, !(this.animateThumbInit==true));
},
_refreshChildren : function () {
    // destroy the components and recreate - called when this.vertical changes
    this._destroyChildren();
    this._createChildren();
},
_destroyChildren : function () {
    // destroy all the children if they exist
    this._titleLabel && this._titleLabel.destroy();
    this._track && this._track.destroy();
    this._thumb && this._thumb.destroy();
    this._valueLabel && this._valueLabel.destroy();
    this._minLabel && this._minLabel.destroy();
    this._maxLabel && this._maxLabel.destroy();  
    this._valueLabelLayoutContainer && this._valueLabelLayoutContainer.destroy();
    this._valueLabelLayout && this._valueLabelLayout.destroy();

    // clear the refs
    this._titleLabel = this._track = this._thumb = this._valueLabel = this.valueLabel = null;
    this._minLabel = this._maxLabel = null;
    this._valueLabelLayoutContainer = this._valueLabelLayout = null;
},

// override destroy() to call _destroyChildren(), just in case
destroy : function () {
    this._destroyChildren();
    this.Super("destroy", arguments);
},

// setUpSize() - sets up width/height/length (track length)
// If width / height is explicitly specified, determine length from this
// Otherwise determine width/height based on specified length

setUpSize : function () {
    var specifiedWidth = this._userWidth,
        specifiedHeight = this._userHeight,
        thumbThickWidth = this._getThumbThickWidth(),
        thumbThinWidth = this._getThumbThinWidth();

    // If the user didn't specify a width / height, default them based on which components are
    // being shown.
	if (this.vertical) {
        if (specifiedWidth == null) {

            var width = Math.max(thumbThickWidth, this.trackWidth);
            // value shows on one side of the slider, range (min/max labels) show on the
            // other side
            if (this.showValue) width += this.labelWidth + this.labelSpacing;
            if (this.showRange) width += this.labelWidth + this.labelSpacing;

            // Note: titleLabel width is derived from the width of the slider so no need to account
            // for it here

            // If padding is specified, we want to expand enough that it shows around the
            // inner components
            width += this.getHPadding();
            
            //>DEBUG
            this.logInfo("defaulting width to " + width + "px");            
            //<DEBUG
            this.setWidth(width);
            this.updateUserSize(width, this._$width);
        }
        if (specifiedHeight == null) {
            var height = this.length;

            if (this.showTitle) height += this.labelHeight + this.labelSpacing;

            // if we show the floating value label, it can overflow beyond the 
            // end of the track - account for this when sizing the widget so we don't 
            // overflow by default
            if (this.showValue && (this.labelHeight > thumbThinWidth)) {
                height += (this.labelHeight - thumbThinWidth);
            }
            
            // If padding/margin are specified, expand to account for them
            height += this.getVPadding() + this.getVMarginSize();

            //>DEBUG
            this.logInfo("no specified height on vertical Slider - defaulting to:" + height +
                         " based on slider.length of " + this.length);
            //<DEBUG
            this.setHeight(height);
            this.updateUserSize(height, this._$height);
        } else {
            // if the user specifies both length and height, let height win.
            // (using innerContentWidth accounts for padding)
            this.length = this.getInnerContentHeight(false);
            if (this.showTitle) this.length -= (this.labelHeight + this.labelSpacing);
            if (this.showValue && (this.labelHeight > thumbThinWidth)) {
                this.length -= (this.labelHeight - thumbThinWidth);
            }
            //>DEBUG
            this.logInfo("setting slider track length to:"+ this.length 
                        + ", based on specified height");
            //<DEBUG
        }
	} else {
        if (specifiedHeight == null) {
            var height = Math.max(thumbThickWidth, this.trackWidth);
            if (this.showValue) height += this.labelHeight + this.labelSpacing;
            if (this.showRange) height += this.labelHeight + this.labelSpacing;

            height += this.getVPadding();
            
            //>DEBUG
            this.logInfo("defaulting height to " + height + "px");
            //<DEBUG
    		this.setHeight(height);
            this.updateUserSize(height, this._$height);
        }
        if (specifiedWidth == null) {
            var width = this.length;
            if (this.showTitle) {
                var rect = this._getTrackLayoutPos();
                width += rect[0];
            }
            if (this.showValue && (this.labelWidth > thumbThinWidth)) {
                width += (this.labelWidth - thumbThinWidth);
            }

            // If padding/margin are specified, expand to account for them
            width += this.getHPadding() + this.getHMarginSize();

            //>DEBUG
            this.logInfo("no specified width on horizontal Slider - defaulting to:" + width +
                         " based on slider.length of " + this.length);
            //<DEBUG
    		this.setWidth(width);
            this.updateUserSize(width, this._$width);
        } else {
    
            // if the user specifies both length and width let width win.
            this.length = this.getInnerContentWidth(false);
            if (this.showTitle) {
                var rect = this._getTrackLayoutPos();
                this.length -= rect[0];
            }
            // We don't use labelWidth for the valueLabel - we use a smaller value
            // (undocumented 'hValueWidth' on the assumption that the value will
            // overflow if necessary)
            if (this.showValue && (this.hValueLabelWidth > thumbThinWidth)) {
                // We use a small label width for the horizontal valueLabel and
                // allow the content to overflow if necessary
                this.length -= (this.hValueLabelWidth - thumbThinWidth);
            }
            //>DEBUG            
            this.logInfo("setting slider track length to:"+ this.length 
                        + ", based on specified width");
            //<DEBUG
        }
	}

	// calculate usable length and step size, in pixels, for use in ongoing calculations

	this._usableLength = this.length - thumbThickWidth;
	if (this.numValues) {
        this.numStops = this.numValues-1;
        if (this.numStops == 0) this.numStops = 1;
        // divide by the number of values, not by that number minus 1
        this._stepSize = this._usableLength/this.numStops;
    }

},
 
// Override resizeBy to resize the track.
// setWidth / setHeight / setRect et al. fall through to this method
resizeBy : function (deltaX, deltaY) {
    this.Super("resizeBy", arguments);
    if (!this._track) return;

    var vertical = this.vertical;

    if ((vertical && deltaY != 0) || (!vertical && deltaX != 0)) {
        // Update length / usable length for caculations...
        this.length += vertical ? deltaY : deltaX;
        this._usableLength = this.length - this._getThumbThinWidth();
        // resize the track
        if (vertical) this._track.resizeBy(0, deltaY);
        else this._track.resizeBy(deltaX, 0);

    	// re-calculate stepSize if numStops is defined
    	if (this.numStops) {
            this._stepSize = this._usableLength/this.numStops;
        }

        // fire setValue to update the thumb.
        this.setValue(this.value, true, true); // no animation, no logical value change
        // Also move the max (or min) marker
        if (this.showRange) {
            if (this.vertical) {
                var endMarker = this.flipValues ? this._maxLabel : this._minLabel;
                endMarker.moveBy(0, deltaY);
            } else {
                var endMarker = this.flipValues ? this._minLabel : this._maxLabel;
                endMarker.moveBy(deltaX, 0);
            }
        }
    }
},

//------  _createRangeLabel(minOrMax)

//> @attr slider.rangeLabel (MultiAutoChild Label : null : IR)
// Used to create both of the min and max range-labels, via the +link{AutoChild} pattern, hence
// <code>rangeLabelConstructor</code>, <code>rangeLabelDefaults</code> and
// <code>rangeLabelProperties</code> are valid.
//
// @visibility external
//<
rangeLabelConstructor: "Label",
rangeLabelDefaults: {
    overflow: "hidden",
    wrap: false
},

// Creates, initializes, and returns a new Label widget to be the slider's mix or max value
// label. minOrMax must be the string "min" or "max".
_createRangeLabel : function (minOrMax) {
	var labelLeft, labelTop, labelAlign, labelValign,
        // Should the label be at the start (top / left) or end (bottom/right) of the slider?
        atStartPosition = (this.vertical ? minOrMax == "max" : minOrMax == "min");
    if (this.flipValues) atStartPosition = !atStartPosition;

    // For vertical sliders, range labels appear to the right of the slider track
    // for horizontal sliders, they appear below the slider track.
	if (this.vertical) {
		labelLeft = Math.max(this._getThumbThickWidth(), this.trackWidth) + this.labelSpacing +
                    (this.showValue ? this.labelWidth + this.labelSpacing : 0) +
                    this.getLeftPadding();
		labelAlign = isc.Canvas.LEFT;
        if (atStartPosition) {
            labelTop = this._track.getTop();
			labelValign = isc.Canvas.TOP;
		} else {
            var trackBottom = this._track.getTop() + this._track.getHeight();
            labelTop = trackBottom - this.labelHeight;
			labelValign = isc.Canvas.BOTTOM;
		}
	} else { // this.horizontal
		labelTop = Math.max(this._getThumbThickWidth(), this.trackWidth) + this.labelSpacing +
                    (this.showValue ? this.labelHeight + this.labelSpacing : 0) 
                    + this.getTopPadding();
                    

		labelValign = isc.Canvas.TOP;
        if (atStartPosition) {
            labelLeft = this._track.getLeft();
			labelAlign = isc.Canvas.LEFT;
		} else {
            var trackRight = this._track.getLeft() + this._track.getWidth();
            labelLeft = trackRight - this.labelWidth;
			labelAlign = isc.Canvas.RIGHT;
		}
	}

    var rangeLabel = this.createAutoChild("rangeLabel", {
		ID:this.getID()+"_"+minOrMax+"Label",
		left:labelLeft,
		top:labelTop,
        width:this.labelWidth,
		height: this.labelHeight,
		align:labelAlign,
		valign:labelValign,
		styleName:this.rangeStyle
        
	});
    // set the label contents with a call to setContents(), so a dev can override that method 
    // on slider.rangeLabelProperties to apply formatting, for example
    rangeLabel.setContents(minOrMax == "min" ?
        (this.minValueLabel ? this.minValueLabel : this.formatValue(this.minValue, this.rangeFormat)) : 
        (this.maxValueLabel ? this.maxValueLabel : this.formatValue(this.maxValue, this.rangeFormat)) 
    );
    return rangeLabel;
},


//> @attr slider.valueFormat (FormatString : null : IR)
// +link{FormatString} for numeric formatting of the value and range labels.
// @group appearance
// @visibility external
//<

//> @attr slider.rangeFormat (FormatString : null : IR)
// +link{FormatString} for numeric formatting of the range labels.  If unset, defaults to 
// +link{slider.valueFormat}
// @group appearance
// @visibility external
//<

formatValue : function (value, format) {
    var result = isc.shallowClone(value);
    // default to this.valueFormat
    format = format || this.valueFormat;
    if (format != null && isc.isA.Number(value)) {
        result = isc.NumberUtil.format(value, format);
    }
    return result;
},


//------  _createTitleLabel()
// Creates, initializes, and returns a new Label widget to be the slider's title label.
_createTitleLabel : function () {
    // Title label will always float at 0,0 within the slider.
	var labelAlign = (this.vertical ? isc.Canvas.CENTER : isc.Canvas.RIGHT);
	
	return isc.Label.create({
		ID:this.getID()+"_titleLabel",
        autoDraw:false,
		left:this.getLeftPadding(),
		top:this.getTopPadding(),
		width:(this.vertical ? this.getInnerContentWidth(false) : this.labelWidth),
		height:(this.vertical ? this.labelHeight : this.getInnerContentHeight(false)),
		align:labelAlign,
		className:this.titleStyle,
		contents:this.title
	});
},


//------  _createValueLabel()
// Creates, initializes, and returns a new Label widget to be the slider's dynamic value label.
hValueLabelWidth:5,

//> @attr slider.valueLabel (AutoChild Label : null : IR)
// +link{AutoChild} displaying the current value as a floating label when 
// +link{slider.showValue, showValue} is true.
//
// @visibility external
//<
valueLabelConstructor: "Label",
valueLabelDefaults: {
    moveWithMaster: false, // We'll explicitly handle moving the valueLabel
    overflow: true,
    wrap: false,
    canFocus: false,
    mouseUp : function () {
        return false;
    }
},

_createValueLabel : function () {
	var labelLeft, labelTop, labelWidth, labelAlign, labelValign;
    
    var hSpacing = this.hLabelSpacing == null ? this.labelSpacing : this.hLabelSpacing;
    var vSpacing = this.vLabelSpacing == null ? this.labelSpacing : this.vLabelSpacing;
	
	if (this.vertical) {
		labelLeft = this._thumb.getLeft() - this.labelWidth - hSpacing;
        // align the center of the label with the center of the thumb
		labelTop = this._thumb.getPageTop() 
                    + parseInt(this._thumb.getHeight()/2 - (this.labelHeight/2));
		labelAlign = isc.Canvas.RIGHT;
		labelValign = isc.Canvas.CENTER;
        labelWidth = this.labelWidth;
	} else {
		labelLeft = this._thumb.getLeft() 
                    + parseInt(this._thumb.getWidth()/2 - this.labelWidth/2);
		labelTop = this._thumb.getPageTop() - this.labelHeight - vSpacing;
		labelAlign = isc.Canvas.CENTER;
		labelValign = isc.Canvas.BOTTOM;
		labelWidth = this.labelWidth;
	}

    var valueStyle = (this.vertical ? this.vValueStyle : this.hValueStyle) || this.valueStyle;

    var layout = this._valueLabelLayout = this.createAutoChild("valueLabelLayout", {
        //_constructor: this.vertical ? "HLayout" : "VLayout",
        _constructor: "StatefulCanvas",
        autoDraw: false,
        left:labelLeft,
        top:labelTop,
        canFocus: false,
        showFocused: false,
        showDown: false,
        slider: this,
        // the _valueLabelLayout is 1px wide in horizontal sliders, and it overflows
        //width: this.vertical ? labelWidth : 1,
        width: 1,
        height:this.labelHeight,
        align:labelAlign,
        defaultLayoutAlign: "center",
        observes:[
            {source:this, message:"handleValueChanged", action:"this._updateValueLabel('handleValueChanged');"}
            //,
            //{source:this, message:"parentMoved", action:"this._updateValueLabel('parentMoved');"}
        ],
        baseStyle: valueStyle
    });
    // deparent the label, it floats at the top level
    layout.deparent();

    if (this.vertical) {
        // put the _valueLabelLayout (which shows the borders) in another canvas 
        this._valueLabelLayoutContainer = this.createAutoChild("valueLabelLayoutContainer", {
            _constructor: "HLayout",
            width: this.labelWidth,
            height: this.labelHeight,
            overflow: "hidden",
            align: "right",
            layoutRightMargin: 5
        });
        this._valueLabelLayoutContainer.deparent();
        this._valueLabelLayoutContainer.addMember(this._valueLabelLayout);
    }
    
    var label = this.createAutoChild("valueLabel", {
        width: 1,
        height: 1,
        overflow: 'visible',
        styleName: this.valueTextStyle,
        contents:this.value
    });
    
    this._valueLabel = label;
//    this._valueLabelLayout.addMember(label);
    this._valueLabelLayout.addChild(label);
    if (!this.vertical) {
        isc.addMethods(layout, {        
            // Override draw() to reposition the label after drawing.
            // we have to do this as we don't know the drawn size of the label until it has been
            // drawn in the DOM, and the desired position depends on the drawn size.
            draw : function () {
                this.Super("draw", arguments);
                this.slider._updateValueLabel();
            }
        });
    };
    
    return this._valueLabelLayoutContainer || this._valueLabelLayout;
},

draw : function () {
	this.Super("draw", arguments);
	if (this.showActiveTrack) this.updateActiveTrack();
    if (this._updateValueLabelOnDraw) {
        // place the valueLabel after draw, so its offsets are correct
        delete this._updateValueLabelOnDraw;
        this.delayCall("_updateValueLabel");
    }
},

setValueStyle : function (newValueStyle) {
    this.valueStyle = newValueStyle;
    if (this._valueLabel != null) {
        this._valueLabel.setBaseStyle(newValueStyle);
        this._updateValueLabel("setValueStyle");
    }
},


//_createTrackLayout()
// Internal function fired once at init time to create the track and thumb for the slider

_createTrackLayout : function () {

    // Determine the rect for the trackLayout.  We will center the thumb and track along the
    // long axis of this rect.
    var layoutRect = this._getTrackLayoutPos(),
        trackLeft, trackTop, 
        trackWidth = (this.vertical ? this.trackWidth : this.length), 
        trackHeight = (this.vertical ? this.length : this.trackWidth),
        thumbLeft, thumbTop,
        thumbThickWidth = this._getThumbThickWidth(),
        thumbThinWidth = this._getThumbThinWidth(),
        thumbWidth = (this.vertical ? thumbThickWidth : thumbThinWidth),
        thumbHeight = (this.vertical ? thumbThinWidth : thumbThickWidth)
    ;

    
    var thumbThicker = thumbThickWidth > this.trackWidth;
    if (thumbThicker) {
        if (this.vertical) {
            thumbLeft = layoutRect[0];
            trackLeft = thumbLeft + parseInt(thumbThickWidth/2 - this.trackWidth/2);
            trackTop = layoutRect[1];
            // Doesn't really matter where we put the thumb vertically - it'll be shifted via 
            // 'setValue()'
            thumbTop = layoutRect[1];
        } else {
            thumbTop = layoutRect[1];           
            trackTop = thumbTop + parseInt(thumbThickWidth/2 - this.trackWidth/2);
            trackLeft = layoutRect[0];
            thumbLeft = layoutRect[0];
        }
    // track is thicker than the thumb
    } else {
        if (this.vertical) {
            trackLeft = layoutRect[0];
            thumbLeft = trackLeft + parseInt(this.trackWidth/2 - thumbThinWidth/2);
            trackTop = layoutRect[1];
            thumbTop = layoutRect[1];
        } else {
            trackTop = layoutRect[1];
            thumbTop = trackTop + parseInt(this.trackWidth/2 - thumbThinWidth/2);
            trackLeft = layoutRect[0];
            thumbLeft = layoutRect[0];
        }
    }

    //>DEBUG
    this.logDebug("calculated coords for track:"+ [trackLeft, trackTop, trackWidth, trackHeight]);
    this.logDebug("calculated coords for thumb:"+ [thumbLeft, thumbTop, thumbWidth, thumbHeight]);
    //<DEBUG
    
	this._track = this.addChild(this._createTrack(trackTop, trackLeft, trackWidth, trackHeight));
    // Make the thumb a peer of the track. When the track gets moved, so will the thumb
    // (but the thumb can move without moving the track, of course)
	this._thumb = this._track.addPeer(this._createThumb(thumbTop, thumbLeft, thumbWidth, thumbHeight));
},

// _getTrackLayoutPos()
_getTrackLayoutPos : function () {
    // value floats to the left of a vertical slider and above a horizontal one
    // title floats above a vertical slider and to the left of a horizontal one.
    var spacing = (this.vertical ? this.vTitleSpacing : this.hTitleSpacing) || this.titleSpacing;
    var left = this.vertical ? (this.showValue ? this.labelWidth + this.labelSpacing: 0) 
                             : (this.showTitle ? this.labelWidth + spacing: 0),
        // title always floats above a slider
        top = this.vertical ? (this.showTitle ? this.labelHeight + spacing : 0) 
                            : (this.showValue ? this.labelHeight + this.labelSpacing: 0);

    left += this.getLeftPadding();
    top += this.getTopPadding();
    
    // if the valueLabel can overflow the ends of the track (because it's wider or taller
    // than the thumb), add padding at the start of the track to account for it.
    // (We've already accounted for this difference when determining the track length so no
    // need to also account for this on the end of the track)
    if (this.showValue) {
        var thumbThinWidth = this._getThumbThinWidth()
        if (this.vertical && (this.labelHeight > thumbThinWidth)) {
            top += Math.round((this.labelHeight - thumbThinWidth)/2);
        }
        if (this.horizontal && (this.labelWidth > thumbThinWidth)) {
            left += Math.round((this.labelWidth - thumbThinWidth)/2);
        }
    }

    return [left, top];
},

//------  _createTrack()
// Creates, initializes, and returns a new StretchImg widget to be the slider's track.

//> @attr slider.track (AutoChild StretchImg : null : IR)
//<
trackConstructor: "StretchImg", // note: RangeSlider.js gets the trackConstructor instance property
trackDefaults: {
    // prevent Down style
    showDown: false,
    showDisabled: true
},


//> @attr slider.showActiveTrack (Boolean : false : IR)
// Whether to show the +link{slider.activeTrack, activeTrack}, which highlights the 'active' 
// portion of a slider, from its minimum to its current +link{slider.value, value}.
// @visibility external
//<
showActiveTrack: false,

//> @attr slider.activeTrackStyle (CSSStyleName : "sliderTrackActive" : IR)
// CSS style used to highlight the +link{slider.showActiveTrack, active} part of the
// slider track.
// <P>
// Will have the suffix "Disabled" added when the slider is disabled.
// @visibility external
//<
activeTrackStyle: 'sliderTrackActive',

//> @attr slider.activeTrack (AutoChild StatefulCanvas : null : IR)
// A styled canvas used to highlight the +link{slider.showActiveTrack, active} part of the
// slider track.
//
// @visibility external
//<
activeTrackConstructor: "StatefulCanvas", 
activeTrackDefaults: {
    contents: '',
    // prevent Down style
    showDown: false
},
_createActiveTrack : function (properties) {
    properties = properties || {};
    properties.styleName = this.activeTrackStyle;

    this._activeTrack = this.createAutoChild('activeTrack',
        properties
    );
    this.addChild(this._activeTrack);
},
updateActiveTrack : function () {
    if (!this.showActiveTrack || !this.isDrawn()) return;

    var track = this._track,
        thumb = this._thumb,
        aTrack
    ;

    
    if (!this._activeTrack) {
        var properties;

        if (this.vertical) {
            var activeTop = thumb.getTop() + (thumb.getHeight() / 2);
            var activeHeight = Math.max(0, track.getTop() + track.getHeight() - activeTop);
    
            properties = {
                top: activeTop,
                left: track.getLeft(),
                width: track.getWidth(),
                height: activeHeight
            };
        } else {
            properties = {
                top: track.getTop(),
                left: track.getLeft(),
                width: (thumb.getLeft() + (thumb.getWidth()/2)) - track.getLeft(),
                height: track.getHeight()
            };
        }
        this._createActiveTrack(properties);
        aTrack = this._activeTrack;
    } else {
        aTrack = this._activeTrack;
        aTrack.moveTo(track.getLeft(), track.getTop());
        if (this.vertical) {
            var activeTop = thumb.getTop() + (thumb.getHeight() / 2);
            var activeHeight = Math.max(0, track.getTop() + track.getHeight() - activeTop);
            
            aTrack.setTop(activeTop);
            aTrack.resizeTo(track.getWidth(), activeHeight);
        } else {
            aTrack.resizeTo((thumb.getLeft() + (thumb.getWidth()/2)) - aTrack.getLeft(), track.getHeight());
        }
    }
    
    if (!aTrack.isDrawn()) aTrack.draw();
    else aTrack.redraw();
    aTrack.moveAbove(track);
},

_createTrack : function (top, left, width, height) {

	return this.createAutoChild("track", {
		left:left,
		top:top,
		width:width,
		height:height,
		vertical:this.vertical,

        // image-based appearance: StretchImg props
		capSize:this.trackCapSize,
		src:"[SKIN]" + (this.vertical ? "v" : "h") + this.trackSrc,
		skinImgDir:this.skinImgDir,
		imageType:this.trackImageType,

        // allows a Label to be used with pure CSS styling
        styleName:this[(this.vertical ? "v" : "h") + "TrackStyle"],
        overflow:"hidden",

        // allow the thumb and the track to have focus, but set exclude them from the tab order
        // this allows for bubbling of keypress events after the user has clicked on the thumb or
        // track of the slider
        canFocus:true,
        tabIndex:-1,
        cacheImageSizes: false
		//backgroundColor:"#666666"	// in case images aren't available
	});
},


//------  _createThumb()
// Creates, initializes, and returns a new Img widget to be the slider's thumb.
extraThumbSpace: 2,
touchExtraThumbSpace: 8,
thumbDefaults: {
    _constructor: "Img",
    overflow: "hidden",
    showDisabled: true,
    
    cursor: isc.Canvas.HAND,
    // We want the thumb to move with the track, but NOT resize with it.
    _resizeWithMaster: false,

    handleMouseDown : function () {
        this.setState(isc.Slider.DOWN);
    },
    handleMouseUp : function () {
        this.setState(isc.Slider.UP);
    },
    handleMouseOut : function () {
        var EH = this.ns.EH;
        // If the mouse leaves the thumb area and the thumb is not being dragged, then
        // reset the state to UP.
        if (!EH.dragging || this !== EH.dragTarget) {
            this.setState(isc.Slider.UP);
        }
    },

    canDrag: true,
    dragAppearance: isc.EventHandler.NONE,
    dragStartDistance: 0, // start drag scrolling on any mouse movement
    handleDragStart : function () {
        var EH = this.ns.EH;
        EH.setDragOffset(-1 * (this.getPageLeft() - EH.mouseDownEvent.x),
                         -1 * (this.getPageTop()  - EH.mouseDownEvent.y));
        this.setState(isc.Slider.DOWN);
    },
    handleDragMove : function () {
        this.creator._thumbMove();
    },
    handleDragStop : function () {
        this.setState(isc.Slider.UP);
        if (this.creator.valueChangedOnRelease) {
            this.creator.handleValueChanged(this.creator.value);
        }
    },

    // allow the thumb and the track to have focus, but exclude them from the tab order.
    // This allows for bubbling of keypress events after the user has clicked on the thumb or
    // track of the slider
    canFocus: true,
    tabIndex: -1,

    
    showTriggerArea: isc.Browser.isTouch ? true : false
    ,setLeft : function (newLeft) {
        this._updateTriggerArea(newLeft);
        var result = this.Super("setLeft", arguments);
        return result;
    },
    _updateTriggerArea : function (left) {
        if (this.showTriggerArea) {
            // make sure the thumb's triggerArea doesn't cause the slider to overflow
            var trackLeft = this.creator._track.getLeft(),
                trackEnd = trackLeft + this.creator._usableLength,
                thumbWidth = this.getVisibleWidth()
            ;
            if (left-trackLeft <= this.triggerSpace) {
                if (this.triggerAreaLeft == this.triggerSpace) {
                    this.setTriggerAreaLeft(0);
                    this.logInfo("newLeft is " + left + " - clearing triggerAreaLeft", "slider");
                }
            } else if (this.triggerAreaLeft != this.triggerSpace) {
                this.setTriggerAreaLeft(this.triggerSpace);
                this.logInfo("newLeft is " + left + " - restoring triggerAreaLeft", "slider");
            }                
            if (left+thumbWidth+this.triggerSpace >= trackEnd) {
                if (this.triggerAreaRight == this.triggerSpace) {
                    this.setTriggerAreaRight(0);
                    this.logInfo("newLeft is " + left + " - clearing triggerAreaRight", "slider");
                }
            } else if (this.triggerAreaRight != this.triggerSpace) {
                this.setTriggerAreaRight(this.triggerSpace);
                this.logInfo("newLeft is " + left + " - restoring triggerAreaRight", "slider");
            }                
        }
    }
},
_createThumb : function (top, left, width, height) {
    var extraSpace = (isc.Browser.isTouch ? this.touchExtraThumbSpace : this.extraThumbSpace);
    var thumb = this.createAutoChild("thumb", {
        left: left,
        top: top,
        width: width,
        height: height,

        // image-based appearance: Img props
        src: "[SKIN]" + (this.vertical ? "v" : "h") + this.thumbSrc,
        skinImgDir: this.skinImgDir,

        styleName: this[(this.vertical ? "v" : "h") + "ThumbStyle"],

        triggerSpace: extraSpace,
        triggerAreaTop: extraSpace,
        triggerAreaRight: extraSpace,
        triggerAreaBottom: extraSpace,
        triggerAreaLeft: extraSpace
    });

    return thumb;
},

// Get the slider value associated with provided coords
_getValueFromCoords : function (fromClick, coords, thumbMove) {
	var thumbPosition, rawValue,
        EH = isc.EventHandler;

	if (this.vertical) {
        var trackTop = this._track.getTop(),
            trackEnd = this._usableLength + trackTop; 

        // determine the desired position on the track
		thumbPosition = coords[1] - EH.dragOffsetY - this.getPageTop();
		thumbPosition = Math.max(trackTop, Math.min(trackEnd, thumbPosition));
        // for values calculations we want positions relative to trackTop
        var thumbOffset = thumbPosition - trackTop;
		if (this.numStops) {
            // do not round thumbOffset yet, since it is used to calculate the raw value below
            thumbOffset = Math.round(thumbOffset/this._stepSize) * this._stepSize;
            thumbPosition = Math.round(thumbOffset) + trackTop;
        }
		if (thumbPosition == this._thumb.getTop()) return; // no thumb movement
        //>DEBUG
        this.logDebug("drag-moving thumb to:"+ thumbPosition)
        //<DEBUG
        if (fromClick && this.animateThumb) {
            this._thumbAnimation = this._thumb.animateMove(this._thumb.getLeft(), thumbPosition,
                null, this.animateThumbTime, this.animateThumbAcceleration);
        } else if (thumbMove) {
		    this._thumb.setTop(thumbPosition);
        }
		rawValue = (this.flipValues ? thumbOffset/this._usableLength : 1-thumbOffset/this._usableLength);

	} else {
        var trackLeft = this._track.getLeft(),
            trackEnd = this._usableLength + trackLeft,
            thumbWidth = this._thumb ? this._thumb.getVisibleWidth() : this.thumbThickWidth
        ;
            
		thumbPosition = coords[0] - EH.dragOffsetX - this.getPageLeft();
		thumbPosition = Math.max(trackLeft, Math.min(trackEnd, thumbPosition));
        var thumbOffset = thumbPosition - trackLeft;
		if (this.numStops) {
            // do not round thumbOffset yet, since it is used to calculate the raw value below
            thumbOffset = Math.round(thumbOffset/this._stepSize) * this._stepSize;
            thumbPosition = Math.round(thumbOffset) + trackLeft;
        }
		if (thumbPosition == this._thumb.getLeft()) return; // no thumb movement
        //>DEBUG
        this.logDebug("drag-moving thumb to:"+ thumbPosition)
        //<DEBUG
        if (fromClick && this.animateThumb) {
            this._thumbAnimation = this._thumb.animateMove(thumbPosition, this._thumb.getTop(),
                null, this.animateThumbTime, this.animateThumbAcceleration);
        } else if (thumbMove) {
		    this._thumb.setLeft(thumbPosition);
        }
		rawValue = (this.flipValues ? 1-thumbOffset/this._usableLength : thumbOffset/this._usableLength);
	}

    if (this.maxValue == this.minValue) return this.minValue;
    var finalValue = rawValue * (this.maxValue - this.minValue) + this.minValue;
    return this._getRoundedValue(finalValue);
},

//------  _thumbMove()
// Called by the dragMove handler for the slider thumb (this._thumb). Calculates
// the new thumb position, and if the position has changed: moves the thumb widget,
// calculates the new slider value (this.value) and sends the 'sliderMove' event
// to the target (this.sliderTarget).
// The 'fromClick' parameter indicates whether this movement is called from a click
// (eg elsewhere on the track) instead of a drag, in which case we might animate the thumb.
_thumbMove : function (fromClick) {
    var EH = this.ns.EH;
    var finalValue = this._getValueFromCoords(fromClick, [EH.getX(), EH.getY()], true);
    if (finalValue != null) this.value = finalValue;

    //>DEBUG
    this.logDebug("slider value from drag-move:" + this.value);
    //<DEBUG

    // NB: second part of this conditional is required because slider.mouseUp calls slider._thumbMove
    if (this.valueChangedOnDrag || !this.valueIsChanging()) {
        this.handleValueChanged(this.value);	// fires observable valueChanged() method
	}
    
	if (this.sliderTarget) isc.EventHandler.handleEvent(this.sliderTarget, isc.Slider.EVENTNAME, this);
},

_getRoundedValue : function (value) {
    if (this.roundValues) value = Math.round(value);
    else if (this.roundPrecision != null) {
        var multiplier = Math.pow(10, this.roundPrecision);
        value = (Math.round(value * multiplier))/multiplier;
    }
    return value;
},

// forcibly hide the floating label
hideValueLabel : function () {
    var hideThis = this._valueLabelLayoutContainer || this._valueLabelLayout;
    hideThis && hideThis.hide();
},

// _updateValueLabel is called on 'valueChanged' observation when the valueLabel is set up
_updateValueLabel : function (reason) {
    // bail if still pending a draw
    if (this._updateValueLabelOnDraw) return;

    if (!this.isDrawn() || !this._thumb || !this._thumb.isDrawn()) return;

    // bail if offscreen
    if (this.getPageTop() < -100) return;

    // showActiveTrack causes a progressBar-like overlay - see, eg, Tahoe 
    if (this.showActiveTrack) this.updateActiveTrack();

    var innerLabel = this._valueLabel;
    
    if (innerLabel == null) return;

    //this.logWarn("_updateValueLabel - reason '" + reason + "'");
    
    // if there's a labelLayout, shrink it so it can overflow with the new, 
    // potentially-formatted, value
    if (this.labelLayout) this.labelLayout.setWidth(1);
    if (this._valueLabelLayout) this._valueLabelLayout.setWidth(1);
    
    var value = this.getValue();

    // format the value for display in the valueLabel
    innerLabel.setContents(this.formatValue(value));

    var thumb = this._thumb,
        layoutContainer = this._valueLabelLayoutContainer,
        layout = this._valueLabelLayout
    ;
    
    if (layoutContainer) layoutContainer.deparent();
    else if (layout) layout.deparent();

    if ((layoutContainer && layoutContainer.isDrawn()) || layout.isDrawn()) {
        if (innerLabel.isDrawn()) innerLabel.redraw("sizing layout");
        else innerLabel.draw();
    }// else return;
    
    innerLabel.adjustForContent();

    // get the widget being positioned (a canvas or layout depending on this.vertical)
    var moveThis = layoutContainer || this._valueLabelLayoutContainer || this._valueLabelLayout;
    if (!moveThis) {
        this.logInfo("No label container.", "slider");
    }
    // make sure it's drawn
    if (!moveThis.isDrawn()) moveThis.draw();
    else moveThis.redraw();

    var labelWidth = moveThis.getVisibleWidth(), 
        labelHeight = moveThis.getVisibleHeight(),
        thumbLeft = thumb.getPageLeft(),
        thumbTop = thumb.getPageTop(),
        thumbWidth = thumb.getVisibleWidth(),
        thumbHeight = thumb.getVisibleHeight(),
        pageScrollWidth = isc.Page.getScrollWidth(),
        pageScrollHeight = isc.Page.getScrollHeight(),
        hSpacing = this.hLabelSpacing == null ? this.labelSpacing : this.hLabelSpacing,
        vSpacing = this.vLabelSpacing == null ? this.labelSpacing : this.vLabelSpacing
    ;

    if (this.vertical) {
        var newTop = parseInt(thumbTop + (thumbHeight/2) - (labelHeight / 2));
        var newLeft = parseInt(thumbLeft - labelWidth - hSpacing);
        if (newTop + labelHeight > pageScrollHeight) {
            newTop = (pageScrollHeight - labelHeight) - 1;
        }
        moveThis.setPageRect(newLeft, newTop, labelWidth, labelHeight);
        if (this.visibleAtPoint(thumbLeft, newTop, true, [moveThis])) {
            moveThis.show();
        } else {
            moveThis.hide();
        }
    } else {
        
        var newLeft = parseInt(thumbLeft + (thumbWidth/2) - (labelWidth/2));
        var newTop = parseInt(thumbTop - labelHeight - vSpacing);
        if (newLeft + labelWidth > pageScrollWidth) {
            // don't overflow the page to the right
            newLeft = (pageScrollWidth - labelWidth) - 1;
        }
        moveThis.setPageRect(newLeft, newTop, labelWidth, labelHeight);

        // show the label if the top of the Slider is visible, directly above the thumb, but 
        // inset by the margin, since visibleAtPoint() returns false for offsets in the margin
        var innerTop = this.getPageTop() + (this.getTopMargin() || 0);
        if (this.visibleAtPoint(thumbLeft, innerTop, true, [moveThis])) {
            moveThis.show();
        } else {
            moveThis.hide();
        }
    }

},


handleMouseUp : function() {
    
	if (this.valueChangedOnClick) this._thumbMove(true);
},

// get the thumb position from the supplied value, updating the value if requested
_getThumbPositionFromValue : function (newValue, setValue) {
	var rawValue, thumbOffset;
	if (!isc.isA.Number(newValue)) return;
	
	// Ensure minValue<=newValue<=maxValue.
	newValue = Math.max(this.minValue, (Math.min(newValue, this.maxValue)));
	
	// Set value, rounding if specified.
	newValue = this._getRoundedValue(newValue);
    if (setValue) this.value = newValue;

	// Calculate rawValue and resulting thumbOffset.
	if (this.minValue == this.maxValue) rawValue = 1;
    else rawValue = (newValue - this.minValue)/(this.maxValue - this.minValue);
	thumbOffset = rawValue * this._usableLength;
    
	// get the thumb position.
	if (this.vertical) {
        return this._track.getTop() + 
            parseInt(this.flipValues ? thumbOffset : this._usableLength - thumbOffset);
    } else {
        return this._track.getLeft() + 
            parseInt(this.flipValues ? this._usableLength - thumbOffset : thumbOffset);
    }
},


//------ setValue(newValue)
//> @method slider.setValue()   ([])
// Sets the slider value to newValue and moves the slider thumb to the appropriate position for this
// value. Sends the 'sliderMove' event to the sliderTarget.
//
// @param newValue (float) the new value
// <smartgwt><b>Note:</b>Use Doubles rather Floats when manipulating decimal
// values.  See +link{group:gwtFloatVsDouble} for details</smartgwt>
// @param noAnimation (boolean) do not animate the slider thumb to the new value
// @visibility external
//<
setValue : function (newValue, noAnimation, noValueChange) {

    var thumbPosition = this._getThumbPositionFromValue(newValue, true);
    if (thumbPosition == null) return;

	// Set the thumb position.
	if (this.vertical) {
        if (this.animateThumb && !noAnimation) {
            this._thumbAnimation = this._thumb.animateMove(this._thumb.getLeft(), thumbPosition,
                null, this.animateThumbTime, this.animateThumbAcceleration);
        } else {
		    this._thumb.setTop(thumbPosition);
        }
    } else {
        if (this.animateThumb && !noAnimation) {
            this._thumbAnimation = this._thumb.animateMove(thumbPosition, this._thumb.getTop(),
                null, this.animateThumbTime, this.animateThumbAcceleration);
        } else {
            this._thumb.setLeft(thumbPosition);
        }
    }
    
	if (!noValueChange) {
        // fires observable valueChanged() method and updates activeTrack
        this.handleValueChanged(this.value);
    }
	
	if (this.sliderTarget) isc.EventHandler.handleEvent(this.sliderTarget, isc.Slider.EVENTNAME, this);
},

//------ getValue()
//>	@method	slider.getValue()   ([])
// Returns the current slider value.
//
// @return	(float)	current slider value
// <smartgwt><b>Note:</b>Use Doubles rather Floats when manipulating decimal
// values.  See +link{group:gwtFloatVsDouble} for details</smartgwt>
// @visibility external
//<
getValue : function () {
	return this.value;
},


//------ valueChanged()
//> @method slider.valueChanged() (A)
// This method is called when the slider value changes. This occurs when the +link{Slider.setValue(),setValue()}
// method is called, or when the slider is moved. <smartclient>Observe this method to be notified when
// </smartclient><smartgwt>Add a notification to be fired whenever </smartgwt>the slider value
// changes.
//
// @param value (double) the new value.
// @see method:class.observe
// @visibility external
// @example slider
//<
valueChanged : function (value) {
},

// handleValueChanged updates the UI (activeTrack) and fires the observable valueChanged() method
handleValueChanged : function (value) {
    this.valueChanged(value);
    this.updateActiveTrack();
},

//> @method slider.valueIsChanging()   ([A])
// Call this method in your +link{slider.valueChanged()} handler to determine whether the
// value change is due to an ongoing drag interaction (true) or due to a thumb-release,
// mouse click, keypress, or programmatic event (false). You may choose to execute temporary or
// partial updates while the slider thumb is dragged, and final updates or persistence of the value
// in response to the other events.
//
// @return  (Boolean)   true if user is still dragging the slider thumb, false otherwise
//
// @visibility external
//<

valueIsChanging : function () {
    var EH = this.ns.EH;
    return (EH.dragging && this._thumb === EH.dragTarget);
},


// HandleKeyPress:
// If Home, End, or the arrow keys are pressed while this slider has focus, move the slider
// appropriately.
// 20050912: Thumb animation is explicitly disabled by setting the noAnimation parameter of
// setValue(), because the thumb jumps around when one of the arrow keys is held down. Not worth
// tracking down, since the effect is already pretty close to an animation in this case.
handleKeyPress : function (event, eventInfo) {

    var keyName = event.keyName;

    // Note: if this.flipValues is true, vertical sliders will start at the top, and increase
    // toward the bottom, horizontal sliders will start at the right and increase towards the
    // left

    // "Home" will move the slider all the way to the min value (may be either end depending on
    // flipValues)
    if (keyName == "Home") {
        this.setValue(this.minValue, true);
        return false;
    }
    // "End" will move the slider all the way to the max value
    if (keyName == "End") {
        this.setValue(this.maxValue, true);
        return false;
    }
    
    // If an arrow key was pressed, move the slider one step in the direction indicated

    // Calculate one step from this.stepPercent:
    var change = (this.maxValue - this.minValue) * this.stepPercent / 100;
    // if roundValues is enabled, ensure we always move (a change < 1 could be rounded to no
    // change)
    if (this.roundValues && change < 1) change = 1;

    if (this.vertical) {
        if ((this.flipValues && keyName == "Arrow_Up") ||
            (!this.flipValues && keyName == "Arrow_Down"))
        {
            this.setValue(this.getValue() - change, true);
            return false;
            
        } else if ( (this.flipValues && keyName == "Arrow_Down") || 
                    (!this.flipValues && keyName == "Arrow_Up"))
        {
            this.setValue(this.getValue() + change, true);
            return false
        }
    
    } else {
        if ((this.flipValues && keyName == "Arrow_Left") || 
            (!this.flipValues && keyName == "Arrow_Right"))
        {
            this.setValue(this.getValue() + change, true)
            return false;
            
        } else if ( (this.flipValues && keyName == "Arrow_Right") || 
                    (!this.flipValues && keyName == "Arrow_Left"))
        {
            this.setValue(this.getValue() - change, true)
            return false;
        }
    }

    if (this.keyPress) {
        this.convertToMethod("keyPress");
        return this.keyPress(event, eventInfo);
    }
},

// override setCanFocus to set the canFocus property on the track and the thumb as well
setCanFocus : function (canFocus) {
    this.Super("canFocus", arguments);
    if (this._thumb != null) this._thumb.setCanFocus(canFocus);
    if (this._track != null) this._track.setCanFocus(canFocus);
    
},

//>	@method	slider.setMinValue()   ([])
// Sets the +link{slider.minValue, minimum value} of the slider 
//
// @param newValue (float) the new minimum value
// <smartgwt><b>Note:</b>Use Doubles rather Floats when manipulating decimal
// values.  See +link{group:gwtFloatVsDouble} for details</smartgwt>
// @visibility external
//<
setMinValue : function (newValue) {
    newValue = this._getRoundedValue(newValue);
    this.minValue = newValue;
    if (this._minLabel) this._minLabel.setContents(newValue);
    // only update the current value if it's less than the new minValue
    if (this.getValue() < this.minValue) this.setValue(this.minValue);
},

//>	@method	slider.setMaxValue()   ([])
// Sets the +link{slider.maxValue, maximum value} of the slider 
//
// @param newValue (float) the new maximum value
// <smartgwt><b>Note:</b>Use Doubles rather Floats when manipulating decimal
// values.  See +link{group:gwtFloatVsDouble} for details</smartgwt>
// @visibility external
//<
setMaxValue : function (newValue) {
    // If we're rounding, round the min/max value as well
    
    newValue = this._getRoundedValue(newValue);
    this.maxValue = newValue;
    if (this._maxLabel) this._maxLabel.setContents(newValue);
    // only update the current value if it's larger than the new maxValue
    if (this.getValue() > this.maxValue) this.setValue(this.maxValue);
},

//>	@method	slider.setNumValues()   ([])
// Sets the +link{slider.numValues, number of values} for the slider 
//
// @param newNumValues (Integer) the new number of values
// <smartgwt><b>Note:</b>Use Doubles rather Floats when manipulating decimal
// values.  See +link{group:gwtFloatVsDouble} for details</smartgwt>
// @visibility external
//<
setNumValues : function (newNumValues) {
    this.numValues = newNumValues;
    this.numStops = this.numValues - 1;
    if (this.numStops == 0) this.numStops = 1;
    // divide by the number of stops 
    this._stepSize = this._usableLength/this.numStops;
    this.setValue(this.minValue);
},

//> @method slider.setTitle()  
// Sets the +link{title} of the slider
//
// @param newTitle (String) new title for the slider
// @visibility external
//<
setTitle : function (newTitle) {
    this._titleLabel.setContents(newTitle);
},

//> method slider.setLength()
// Sets the +link{length} of the slider
//
// @param newLength (number) the new length to set the slider to
// @visibility external
//<
setLength : function (newLength) {
    this.length = newLength;
    this.setUpSize();    
},


//> @method slider.setVertical()
// Sets the +link{vertical} property of the slider
//
// @param isVertical (boolean) is the slider vertical
// @visibility external
//<
setVertical : function (isVertical) {
    this.vertical = isVertical;

    // Reset length so it can be recalculated if needed
    this.length = this._userLength;
    this._userWidth = this._userHeight = null;

    this._refreshChildren();
},

_getThumbThickWidth : function () {
    return (isc.Browser.isTouch && this.touchThumbThickWidth != null ? this.touchThumbThickWidth : this.thumbThickWidth);
},

//> @method slider.setThumbThickWidth()
// Sets the +link{thumbThickWidth} property of the slider
//
// @param newWidth (int) new thumbThickWidth
// @visibility external
//<
setThumbThickWidth : function (newWidth) {
    this.thumbThickWidth = newWidth;
    this._refreshChildren();
},

_getThumbThinWidth : function () {
    return (isc.Browser.isTouch && this.touchThumbThinWidth != null ? this.touchThumbThinWidth : this.thumbThinWidth);
},

//> @method slider.setThumbThinWidth()
// Sets the +link{thumbThinWidth} property of the slider
//
// @param newWidth (int) new thumbThinWidth
// @visibility external
//< 
setThumbThinWidth : function (newWidth) {
    this.thumbThinWidth = newWidth;
    this._refreshChildren();
},

//> @method slider.setTrackWidth()
// Sets the +link{trackWidth} property of the slider
//
// @param newWidth (int) new trackWidth
// @visibility external
//< 
setTrackWidth : function (newWidth) {
    this.trackWidth = newWidth;
    this._refreshChildren();    
},

//> @method slider.setThumbSrc()
// Sets the +link{thumbSrc} property of the slider
//
// @param newSrc (String) new thumbSrc
// @visibility external
//< 
setThumbSrc : function (newSrc) {
    this.thumbSrc = newSrc;
    this._refreshChildren();
},

//> @method slider.setTrackSrc()
// Sets the +link{trackSrc} property of the slider
//
// @param newSrc (String) new trackSrc
// @visibility external
//< 
setTrackSrc : function (newSrc) {
    this.trackSrc = newSrc; 
    this._refreshChildren();
},

//> @method slider.setTrackCapSize()
// Sets the +link{trackCapSize} property of the slider
//
// @param newSize (int) new trackCapSize
// @visibility external
//< 
setTrackCapSize : function (newSize) {
    this.trackCapSize = newSize;  
    this._refreshChildren();
},

//> @method slider.setTrackImageType()
// Sets the +link{trackImageType} property of the slider
//
// @param newType (ImageStyle) new trackImageType
// @visibility external
//< 
setTrackImageType : function (newType) {
    this.trackImageType = newType;
    this._refreshChildren();    
},

//> @method slider.setShowTitle()
// Sets the +link{showTitle} property of the slider
//
// @param showTitle (Boolean) show the slider title?
// @visibility external
//< 
setShowTitle : function (showTitle) {
    this.showTitle = showTitle;
    this._refreshChildren();    
},

//> @method slider.setShowRange()
// Sets the +link{showRange} property of the slider
//
// @param showRange (boolean) show the slider range?
// @visibility external
//< 
setShowRange : function (showRange) {
    this.showRange = showRange;
    this._refreshChildren();    
},

//> @method slider.setShowValue()
// Sets the +link{showValue} property of the slider
//
// @param showValue (boolean) show the slider value?
// @visibility external
//< 
setShowValue : function (showValue) {
    this.showValue = showValue;
    this._refreshChildren();    
},

//> @method slider.setLabelWidth()
// Sets the +link{labelWidth} property of the slider
//
// @param labelWidth (int) new label width
// @visibility external
//< 
setLabelWidth : function (labelWidth) {
    this.labelWidth = labelWidth;
    this._refreshChildren();    
},

//> @method slider.setLabelHeight()
// Sets the +link{labelHeight} property of the slider
//
// @param newHeight (int) new label height
// @visibility external
//< 
setLabelHeight : function (newHeight) {
    this.labelHeight = newHeight;
    this._refreshChildren();    
},

//> @method slider.setLabelSpacing()
// Sets the +link{labelSpacing} property of the slider
//
// @param labelWidth (int) new label spacing
// @visibility external
//< 
setLabelSpacing : function (newSpacing) {
    this.labelSpacing = newSpacing;
    this._refreshChildren();    
},

//> @method slider.setMaxValueLabel()
// Sets the +link{maxValueLabel} property of the slider
//
// @param labelText (String) new label text
// @visibility external
//< 
setMaxValueLabel : function (labelText) {
    this._maxLabel.setContents(labelText);    
},

//> @method slider.setRoundValues()
// Sets the +link{roundValues} property of the slider
//
// @param roundValues (boolean) round slider values?
// @visibility external
//< 
setRoundValues : function (roundValues) {
    this.roundValues = roundValues;
    this._refreshChildren();    
},

//> @method slider.setRoundPrecision()
// Sets the +link{roundPrecision} property of the slider
//
// @param roundPrecision (int) new round precision
// @visibility external
//< 
setRoundPrecision : function (roundPrecision) {
    this.roundPrecision = roundPrecision;
    this._refreshChildren();    
},

//> @method slider.setFlipValues()
// Sets the +link{flipValues} property of the slider
//
// @param flipValues (boolean) flip slider values?
// @visibility external
//< 
setFlipValues : function (flipValues) {
    this.flipValues = flipValues;
    this._refreshChildren();    
},

//> @method slider.setStepPercent()
// Sets the +link{stepPercent} property of the slider
//
// @param stepPercent (float) new slider step percent
// @visibility external
//< 
setStepPercent : function (stepPercent) {
    this.stepPercent = stepPercent;
    this._refreshChildren();    
}

});


isc.Slider.registerStringMethods({
    valueChanged : "value"
})

//!<Deferred



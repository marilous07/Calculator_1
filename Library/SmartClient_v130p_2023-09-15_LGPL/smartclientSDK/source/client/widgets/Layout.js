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
//>	@class	Layout
//
// Arranges a set of "member" Canvases in horizontal or vertical stacks, applying a layout
// policy to determine member heights and widths.
// <P>
// A Layout manages a set of "member" Canvases provided as +link{layout.members}.  Layouts
// can have both "members", whose position and size are managed by the Layout, and normal
// Canvas children, which manage their own position and size.
// <P>
// Rather than using the Layout class directly, use the +link{HLayout}, +link{VLayout},
// +link{HStack} and +link{VStack} classes, which are subclasses of Layout preconfigured for
// horizontal or vertical stacking, with the "fill" (VLayout) or "none" (VStack)
// +link{type:LayoutPolicy,policies} already set.
// <P>
// Layouts and Stacks may be nested to create arbitrarily complex layouts.
// <p>
// Since Layouts can be either horizontally or vertically oriented, throughout the
// documentation of Layout and it's subclasses, the term "length" refers to the axis of
// stacking, and the term "breadth" refers to the other axis.  Hence, "length" means height in
// the context of a VLayout or VStack, but means width in the context of an HLayout or HStack.
// <P>
// To show a resizer bar after (to the right or bottom of) a layout member, set
// +link{canvas.showResizeBar,showResizeBar} to
// true on that member component (not on the HLayout or VLayout).  Resizer bars override
// +link{layout.membersMargin,membersMargin} spacing.
// <P>
// Like other Canvas subclasses, Layout and Stack components may have % width and height
// values. To create a dynamically-resizing layout that occupies the entire page (or entire
// parent component), set width and height to "100%".
//
// @inheritsFrom Canvas
// @see type:LayoutPolicy for available policies
// @see class:VLayout
// @see class:HLayout
// @see class:VStack
// @see class:HStack
// @see class:LayoutSpacer
// @treeLocation Client Reference/Layout
// @visibility external
//<

isc.ClassFactory.defineClass("Layout","Canvas");


isc.Layout.addClassProperties({
    //> @type   Orientation
    //          @group  orientation
    // @visibility external
    // @value  isc.Layout.VERTICAL members laid out vertically
    // @value  isc.Layout.HORIZONTAL members laid out horizontally
    //< 

    //> @classAttr Layout.VERTICAL (Constant : "vertical" : [R])
    // A declared value of the enum type  
    // +link{type:Orientation,Orientation}.
    // @visibility external
    // @constant
    //<
	//VERTICAL:"vertical", // NOTE: constant declared by Canvas

    //> @classAttr Layout.HORIZONTAL (Constant : "horizontal" : [R])
    // A declared value of the enum type  
    // +link{type:Orientation,Orientation}.
    // @visibility external
    // @constant
    //<
	//HORIZONTAL:"horizontal", // NOTE: constant declared by Canvas

    
	//> @type LayoutPolicy
    // Policy controlling how the Layout will manage member sizes on this axis.
    // <P>
    // Note that, by default, Layouts do <i>not</i> automatically expand the size of all members
    // to match a member that overflows the layout on the breadth axis.  This means that a
    // +link{DynamicForm} or other component that can't shrink beyond a minimum width will 
    // "stick out" of the Layout, wider than any other member and wider than automatically
    // generated components like resizeBars or sectionHeaders (in a +link{SectionStack}).
    // <P>
    // This is by design: matching the size of overflowing members would cause expensive redraws
    // of all members in the Layout, and with two or more members potentially overflowing, could
    // turn minor browser size reporting bugs or minor glitches in custom components into
    // infinite resizing loops.
    // <P>
    // If you run into this situation, you can either:<ul>
    // <li>set the overflowing member to +link{Canvas.overflow, overflow}: "auto", so that it
    // scrolls if it needs more space
    // <li>set the Layout as a whole to +link{Canvas.overflow, overflow}:"auto", so that the
    // whole Layout scrolls when the member overflows
    // <li>define a +link{Canvas.resized(), resized()} handler to manually update the breadth
    // of the layout
    // <li>set +link{Layout.minBreadthMember} to ensure that the available breadth used to
    // expand all (other) members is artificially increased to match the current breadth of the
    // <code>minBreadthMember</code> member; the layout will still be overflowed in this case
    // and the reported size from +link{Canvas.getWidth} or +link{Canvas.getHeight} won't
    // change, but all members should fill the visible width or height along the breadth axis
    // </ul><P>
    // For the last approach, given the VLayout <code>myLayout</code> and a member <code>
    // myWideMember</code>, then we could define the following +link{Canvas.resized(),
    // resized()} handler on <code>myLayout</code>:
    // <smartclient>
    // <pre>
    // resized : function () {
    //     var memberWidth = myWideMember.getVisibleWidth();
    //     this.setWidth(Math.max(this.getWidth(), memberWidth + offset));
    // }</pre></smartclient><smartgwt>
    // <pre>
    // myLayout.addResizedHandler(new ResizedHandler() {
    //     &#64;Override
    //     public void onResized(ResizedEvent event) {
    //         int memberWidth = myWideMember.getVisibleWidth();
    //         myLayout.setWidth(Math.max(myLayout.getWidth(), memberWidth + offset));
    // }</pre>
    // </smartgwt>
    // where <code>offset</code> reflects the difference in width (due to margins, padding,
    // etc.) between the layout and its widest member.  In most cases, a fixed offset can
    // be used, but it can also be computed via the calculation:
    // <P>
    // <pre>
    //     myLayout.getWidth() - myLayout.getViewportWidth()
    // </pre>
    // <smartclient>in an override of +link{Canvas.draw(), draw()}</smartclient><smartgwt>by
    // adding a {@link com.smartgwt.client.widgets.Canvas#addDrawHandler draw handler}</smartgwt>
    // for <code>myLayout</cOde>.  (That calculation is not always valid inside the 
    // +link{Canvas.resized(), resized()} handler itself.)
    // <P>
    // Note: the HLayout case is similar- just substitute height where width appears above.
    // <P>
    // See also +link{layout.overflow}.
    //
    //  @value  isc.Layout.NONE 
    //  Layout does not try to size members on the axis at all, merely stacking them (length
    //  axis) and leaving them at default breadth.
    //
    //  @value  isc.Layout.FILL 
    //  Layout sizes members so that they fill the specified size of the layout.  The rules
    //  are:
    //  <ul>
    //  <li> Any component given an initial pixel size, programmatically resized to a specific
    //  pixel size, or drag resized by user action is left at that exact size
    //  <li> Any component that +link{button.autoFit,autofits} is given exactly the space it
    //  needs, never forced to take up more.
    //  <li> All other components split the remaining space equally, or according to their
    //  relative percentages.
    //  <li> Any component that declares a +link{canvas.minWidth} or +link{canvas.minHeight}
    //  will never be sized smaller than that size
    //  <li> Any component that declares a +link{canvas.maxWidth} or +link{canvas.maxHeight}
    //  will never be sized larger than that size
    //  </ul>
    //  In addition, components may declare that they have 
    //  +link{canvas.canAdaptWidth,adaptive sizing}, and may coordinate with the Layout to render
    //  at different sizes according to the amount of available space.
    //                      
    // @see Layout.minBreadthMember
    // @visibility external
	//<   

    //> @classAttr Layout.NONE (Constant : "none" : [R])
    // A declared value of the enum type  
    // +link{type:LayoutPolicy,LayoutPolicy}.
    // @visibility external
    // @constant
    //<
	//NONE:"none", // NOTE: constant declared by Canvas

    //> @classAttr Layout.FILL (Constant : "fill" : [R])
    // A declared value of the enum type  
    // +link{type:LayoutPolicy,LayoutPolicy}.
    // @visibility external
    // @constant
    //<
	FILL:"fill",

    
    _animateHSlideEffect: {
        effect:"slide", startFrom:"L", endAt:"L"
    },

    reflowOnTEA : function (layout, reason) {

        // remember in the current reflowCount so we don't do an extra reflow if reflowNow() is
        // called before the timer fires (happens every time with TEAs, since 
        // EH._setThreadExitAction() sets up the TEA AND sets a timer in case
        // the TEA fails to fire, and can happen if reflowNow() is called
        // explicitly)
        var layoutInfo = {
                theLayout:layout,
                reflowCount:layout._reflowCount,
                reason:reason
        };
        if (this.reflowQueue == null) this.reflowQueue = [];
        var reflowQueue = this.reflowQueue;
        for (var i = 0; i < reflowQueue.length; i++) {
            // If we already have an entry in the queue, clear it - the more recent
            // reflow call takes precedence.
            
            if (reflowQueue[i] != null && reflowQueue[i].theLayout == layout) {
                reflowQueue[i] = null;
            }
        }
        this.reflowQueue.add(layoutInfo);
    
        if (!this.reflowTEASet) {
            isc.EH._setThreadExitAction(function () {
                isc.Layout.clearReflowQueue();
            });
            this.reflowTEASet = true;
        }
    },
    
    clearReflowQueue : function () {
        // Clear the flag before doing anything else. That way if below code actually
        // causes a new reflow() call on another layout we'll correctly set up a new TEA for it.
        this.reflowTEASet = false;

        var queue = this.reflowQueue;
        // Clear the reflowQueue attribute now (that way if code below trips a new reflow() call we
        // won't modify the array we're currently working our way through!)
        this.reflowQueue = null;
    
        if (queue == null) return;
    
        for (var i = 0; i < queue.length; i++) {
            if (queue[i] == null) continue; // may have been cleared above
            var theLayout = queue[i].theLayout,
                reflowCount = queue[i].reflowCount,
                reason = queue[i].reason;
        
            //isc.logWarn("reflowing " + theLayout + " at end of thread");
            if (!theLayout.destroyed) {
                // reflowNow would no-op anyway in this condition, 
                // but let's avoid the unnecessary function call
                if (reflowCount != null && reflowCount < theLayout._reflowCount) continue;
                theLayout.reflowNow(reason, reflowCount);
            }
        }
    }
});

isc.Layout.addProperties({
	//> @attr layout.members    (Array of Canvas : null : [IRW])
	// An array of canvases that will be contained within this layout. You can set the
    // following properties on these canvases (in addition to the standard component
    // properties):
    // <ul>
    //  <li>+link{canvas.layoutAlign,layoutAlign} -- specifies the member's alignment along the
    //      breadth axis; valid values are "top", "center" and "bottom" for a horizontal layout
    //      and "left", "center" and "right" for a vertical layout (see
    //      +link{layout.defaultLayoutAlign} for default implementation.)
    //  <li>+link{canvas.showResizeBar,showResizeBar} -- set to true to show a resize bar
    //      (default is false)
    // </ul>
    // Height and width settings found on members are interpreted by the Layout according to
    // the +link{layout.vPolicy,layout policy}.
    // <p>
    // Note that it is valid to have null slots in the provided <code>members</code> Array,
    // and the Layout will ignore those slots. This can be useful to keep code compact, for
    // example, when constructing the <code>members</code> Array, you might use an expression
    // that either returns a component or null depending on whether the component should be
    // present. If the expression returns null, the null slot will be ignored by the Layout.
    //
    // @visibility external
	//<
    
    // Policy
    // ---------------------------------------------------------------------------------------
 
    //> @attr layout.overflow   (Overflow : "visible" : IRW)
    // A Layout may overflow if it has one or more members with a fixed width or height, or that
    // themselves overflow.  For details on member sizing see +link{layoutPolicy}.
    // <P>
    // Note that for overflow: "auto", "scroll", or "visible", members exceeding the Layout's
    // specified breadth but falling short of its overflow breadth will keep the alignment set
    // via +link{defaultLayoutAlign} or +link{canvas.layoutAlign}.
    //
    // @see canvas.overflow
    // @see minBreadthMember
    // @group layoutPolicy
    // @visibility external
    //<
                     
	//> @attr layout.orientation    (Orientation : "horizontal" : AIRW)
	// Orientation of this layout.
    // @group layoutPolicy
	// @visibility external
    // @deprecated in favor of +link{layout.vertical,this.vertical}, which, if specified takes
    //  precedence over this setting
	//<
    orientation:"horizontal",
    
    //> @attr layout.vertical (boolean : null : IRW)
    // Should this layout appear with members stacked vertically or horizontally. Defaults to 
    // <code>false</code> if unspecified.
    // @group layoutPolicy
    // @visibility external
    //<
    // Not specified by default as this would change behavior of subclasses that make use of
    // the orientation setting instead.
    // Actually 'defaults to false if unspecified' isn't quite true -- it defaults to the
    // orientation setting but that's deprecated.

	//> @attr layout.vPolicy    (LayoutPolicy : "fill" : IRWA)
	// Sizing policy applied to members on vertical axis
    // @group layoutPolicy
    // @visibility external
	//<
    vPolicy:isc.Layout.FILL,

	//> @attr layout.hPolicy    (LayoutPolicy : "fill" : IRWA)
	// Sizing policy applied to members on horizontal axis
    // @group layoutPolicy
    // @visibility external
	//<   
    hPolicy:isc.Layout.FILL,
 
    //> @attr layout.minMemberSize (int : 1 : IRW)
    // See +link{minMemberLength}.
    //
    // @group layoutPolicy
    // @deprecated use the more intuitively named +link{minMemberLength}
    // @visibility external
    //<
    minMemberSize: 1,

    //> @attr layout.minMemberLength (int : 1 : IRW)
    // Minimum size, in pixels, below which flexible-sized members should never be shrunk, even
    // if this requires the Layout to overflow.  Note that this property only applies along
    // the <i>length</i> axis of the Layout, and has no affect on <i>breadth</i>.
    // <p>
    // Does not apply to members given a fixed size in pixels - such members will never be
    // shrunk below their specified size in general.
    //
    // @see Canvas.minWidth
    // @group layoutPolicy
    // @visibility external
    //<
    minMemberLength: 1,

    //> @attr layout.minMemberBreadth (int : null : IRW)
    // Minimum size, in pixels, below which members being managed on the breadth axis should
    // never be shrunk, even if this results in overflow or clipping.  (If +{LayoutPolicy}
    // for an axis is "none" the members are not managed along that axis.)
    // <p>
    // Does not apply to members given a fixed size in pixels - such members will never be
    // shrunk below their specified size in general.
    //
    // @see Layout.overflow
    // @see defaultLayoutAlign
    // @group layoutPolicy
    //<
    minMemberBreadth: null, // null allows simpler handling than leaving it undefined

	//> @attr layout.minBreadthMember (String | int | Canvas : null : IRWA)
    // Set this property to cause the layout to assign the breadths of other members as if the
    // available breadth is actually wide enough to accommodate the
    // <code>minBreadthMember</code> (even though the Layout might <i>not</i> actually be that
    // wide, and may overflow its assigned size along the breadth axis due to the breadth of the
    // <code>minBreadthMember</code>.
    // <P>
    // Without this property set, members of a layout aren't ever expanded in breadth (by the
    // layout) to fit an overflow of the layout along the breadth axis.  Setting this property
    // will make sure all members (other than the one specified) get expanded to fill the full
    // visual breadth of the layout (assuming they are configured to use 100% layout breadth).
    //
    // @see type:LayoutPolicy
    // @visibility external
    //<
    
	//> @attr layout.enforcePolicy (Boolean : true : IRWA)
	// Whether the layout policy is continuously enforced as new members are added or removed
    // and as members are resized.
    // <p>
    // This setting implies that any member that resizes larger, or any added member, will take
    // space from other members in order to allow the overall layout to stay the same size.
    // @group layoutPolicy
    // @visibility external
	//<
    enforcePolicy:true,

    //> @attr layout.defaultLayoutAlign (Alignment | VerticalAlignment : null : IRW)
    // Specifies the default alignment for layout members on the breadth axis (horizontal axis
    // for a VLayout, vertical axis for an HLayout).  Can be overridden on a per-member basis
    // by setting +link{canvas.layoutAlign}.
    // <P>
    // If unset, default member layout alignment will be "top" for a horizontal layout, and
    // "left" for a vertical layout, or "right" if in +link{Page.isRTL(),RTL} mode.
    // <P>
    // When attempting to center components be sure that you have set a specific size on the
    // component(s) involved.  If components fill all available space in the layout, centering
    // looks the same as not centering.
    // <P>
    // Similarly, if a component has no visible boundary (like a border), it can appear similar
    // to when it's not centered if the component is larger than you expect - use the Watch tab
    // in the Developer Console to see the component's extents visually.
    //
    // @group layoutMember
    // @group layoutPolicy
    // @see Layout.overflow
    // @visibility external
    // @example layoutCenterAlign
    //<

	//> @attr layout.align (Alignment | VerticalAlignment : null : IRW)
	// Alignment of all members in this Layout on the length axis (vertical for a VLayout,
    // horizontal for an HLayout).  Defaults to "top" for vertical Layouts, and "left" for
    // horizontal Layouts.
    // <p>
    // Horizontal layouts should only be set to +link{Alignment}, and vertical layouts to
    // +link{VerticalAlignment}, otherwise they will be considered invalid values, and assigning an
    // invalid value here will log a warning to the Developer Console.
    // <P>
    // For alignment on the breadth axis, see +link{defaultLayoutAlign} and
    // +link{canvas.layoutAlign}.
    // <P>
    // When attempting to center components be sure that you have set a specific size on the
    // component(s) involved.  If components fill all available space in the layout, centering
    // looks the same as not centering.
    // <P>
    // Similarly, if a component has no visible boundary (like a border), it can appear similar
    // to when it's not centered if the component is larger than you expect - use the Watch tab
    // in the Developer Console to see the component's extents visually.
    //
    // @group layoutPolicy
	// @visibility external
        // @example layoutCenterAlign
	//<
    //align:null,
    // NB: you can achieve the same effect with a LayoutSpacer in the first slot, but that
    // throws off member numbering

    //> @attr layout.reverseOrder   (Boolean : false : IRW)
    // Reverse the order of stacking for this Layout, so that the last member is shown first.
    // <P>
    // Requires a manual call to <code>reflow()</code> if changed on the fly.
    // <P>
    // In RTL mode, for horizontal Layouts the value of this flag will be flipped during
    // initialization.
    // @group layoutPolicy
	// @visibility external
    //<
 
    // Margins and Spacing
    // ---------------------------------------------------------------------------------------

    //> @attr layout.paddingAsLayoutMargin (Boolean : true : IRWA) 
    // If this widget has padding specified (as +link{canvas.padding, this.padding} or in the
    // CSS style applied to this layout), should it show up as space outside the members,
    // similar to layoutMargin?
    // <P>
    // If this setting is false, padding will not affect member positioning (as CSS padding
    // normally does not affect absolutely positioned children).  Leaving this setting true
    // allows a designer to more effectively control layout purely from CSS.
    // <P>
    // Note that +link{layout.layoutMargin} if specified, takes precedence over this value.
    // @group layoutMargin
    // @visibility external
    //<
    paddingAsLayoutMargin:true,
    
    

    //> @attr layout.layoutMargin (Integer : null : [IRW])
    // Space outside of all members. This attribute, along with +link{layout.layoutLeftMargin}
    // and related properties do not have a true setter method.
    // <smartclient>
    // It may be assigned directly at runtime.  After setting the property,
    // +link{layout.setLayoutMargin()} may be called with no arguments to reflow the layout.
    // </smartclient><smartgwt>
    // If this method is called after the layout instance has been created, it will force a
    // reflow of the layout and pick up changes to all of the layout*Margin properties.
    // </smartgwt>
    // @see layoutLeftMargin
    // @see layoutRightMargin
    // @see layoutBottomMargin
    // @see layoutTopMargin
    // @see paddingAsLayoutMargin
    // @setter noauto
    // @group layoutMargin
    // @visibility external
    // @example userSizing
    //<
//	layoutMargin:null,

    //> @attr layout.layoutLeftMargin (Integer : null : [IRW])
    // Space outside of all members, on the left-hand side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<
    
    //> @attr layout.layoutRightMargin (Integer : null : [IRW])
    // Space outside of all members, on the right-hand side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<
    
    //> @attr layout.layoutTopMargin (Integer : null : [IRW])
    // Space outside of all members, on the top side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<
    
    //> @attr layout.layoutBottomMargin (Integer : null : [IRW])
    // Space outside of all members, on the bottom side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<
    
    //> @attr layout.membersMargin (int : 0 : [IRW])
    // Space between each member of the layout.
    // <P>
    // Requires a manual call to <code>reflow()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    // @example userSizing
    //<
	membersMargin:0,

    //> @attr layout.leaveScrollbarGap (Boolean : false : IR)
    // Whether to leave a gap for a vertical scrollbar even when one is not actually present.
    // <P>
    // This setting avoids the layout resizing all members when the vertical scrollbar is
    // introduced or removed, which can avoid unnecessary screen shifting and improve
    // performance.
    //
    // @visibility external
    //<

    //> @attr layout.memberOverlap (PositiveInteger : 0 : IR)
    // Number of pixels by which each member should overlap the preceding member, used for
    // creating an "stack of cards" appearance for the members of a Layout.
    // <P>
    // <code>memberOverlap</code> can be used in conjunction with +link{stackZIndex} to create
    // a particular visual stacking order.
    // <P>
    // Note that overlap of individual members can be accomplished with a negative setting for
    // +link{canvas.extraSpace}.
    //
    // @group layoutMember
    // @visibility external
    //<

    //> @attr layout.layoutStartMargin (Integer : null : [IRW])
    // Equivalent to +link{layoutLeftMargin} for a horizontal layout, or +link{layoutTopMargin} 
    // for a vertical layout.
    // <p>
    // If both <code>layoutStartMargin</code> and the more specific properties (top/left margin) 
    // are both set, the more specific properties win.
    // @visibility external
    //<

    //> @attr layout.layoutEndMargin (Integer : null : [IRW])
    // Equivalent to +link{layoutRightMargin} for a horizontal layout, or +link{layoutBottomMargin} 
    // for a vertical  layout.
    // <p>
    // If both <code>layoutEndMargin</code> and the more specific properties (right/bottom margin) 
    // are both set, the more specific properties win.
    // @visibility external
    //<
    
    // ResizeBars
    // ---------------------------------------------------------------------------------------
    
    //> @type LayoutResizeBarPolicy
    // Policy for whether resize bars are shown on members by default.
    //
    // @value "marked" resize bars are only shown on members marked
    //                 +link{canvas.showResizeBar,showResizeBar:true}
    // @value "middle" resize bars are shown on all resizable members that are not explicitly marked
    //              showResizeBar:false, except the last member.  Appropriate for a
    //              +link{LayoutPolicy} of "fill" (VLayout, HLayout) since the overall space will
    //              always be filled.
    // @value "all" resize bars are shown on all resizable members that are not explicitly marked
    //              showResizeBar:false, including the last member.  Can be appropriate for a
    //              +link{LayoutPolicy} of "none" (VStack, HStack) since the overall size of the
    //              layout is dictated by it's member's sizes.
    // @value "none" resize bars are not shown even if members are marked with
    //                 +link{canvas.showResizeBar,showResizeBar:true}
    //
    // @visibility external
    //<

    //> @attr layout.defaultResizeBars (LayoutResizeBarPolicy : "marked" : IRW)
    // Policy for whether resize bars are shown on members by default. Note that this setting
    // changes the effect of +link{canvas.showResizeBar} for members of this layout.
    //
    // @see canvas.showResizeBar
    // @visibility external
    //<
    defaultResizeBars: "marked",

    setDefaultResizeBars : function (resizeBars) {
        if (this.defaultResizeBars == resizeBars) return;
        this.defaultResizeBars = resizeBars;
        this._computeShowResizeBarsForMembers();
    },

    //> @attr layout.resizeBar (MultiAutoChild Splitbar : see below : A)
    // A MultiAutoChild created to resize members of this <code>Layout</code>.
    // <p>
    // A resize bar will be created for any member of this <code>Layout</code> that has
    // +link{Canvas.showResizeBar,showResizeBar} set to <code>true</code>. Resize bars will be
    // instances of the class specified by +link{Layout.resizeBarClass} by default, and will
    // automatically be sized to the member's breadth, and to the thickness specified by
    // +link{Layout.resizeBarSize}.
    // <p>
    // To customize the appearance or behavior of resizeBars within some layout a custom
    // resize bar class can be created by subclassing +link{Splitbar} or +link{ImgSplitbar} and
    // setting +link{Layout.resizeBarClass} or <code>resizeBarConstructor</code> to this custom class.
    // <smartclient>
    // Alternatively, <code>resizeBarProperties</code> may be specified. See +link{group:autoChildUsage}
    // for more information.
    // </smartclient>
    // <smartgwt>
    // Alternatively, {@link com.smartgwt.client.widgets.Canvas#setAutoChildProperties(java.lang.String, com.smartgwt.client.widgets.Canvas)}
    // may be called to set resizeBar properties:
    // <pre>
    //     final Splitbar resizeBarProperties = new Splitbar();
    //     //...
    //     layout.setAutoChildProperties("resizeBar", resizeBarProperties);
    // </pre>
    // See +link{group:autoChildUsage} for more information.
    // <p>
    // If you create a custom resize bar class in Java, enable +link{group:reflection} to
    // allow it to be used.
    // <p>
    // Alternatively, you can use the &#83;martClient class system to create a simple
    // &#83;martClient subclass of either <code>Splitbar</code> or <code>ImgSplitbar</code>
    // for use with this API - see the +link{group:skinning,Skinning Guide} for details.
    // </smartgwt>
    // <p>
    // The built-in <code>Splitbar</code> class supports drag resizing of its target member,
    // and clicking on the bar with a mouse to collapse/uncollapse the target member.
    // @visibility external
    //<
    
    resizeBarDefaults: {
        dragScrollType: "parentsOnly"
    },

	//> @attr layout.resizeBarClass (String : "Splitbar" : AIRW)
    // Default class to use for creating +link{Layout.resizeBar,resizeBars}. This may be
    // overridden by <code>resizeBarConstructor</code>.
    // <p>
    // Classes that are valid by default are +link{Splitbar}, +link{ImgSplitbar}, and
    // +link{Snapbar}.
    //
    // @see class:Splitbar
    // @see class:ImgSplitbar
    // @visibility external
    //<
    resizeBarClass:"Splitbar",


	//> @attr layout.resizeBarSize (int : 7 : AIRW)
    // Thickness of the resizeBar in pixels.
    // @visibility external
	//<
    resizeBarSize:7,

    //>Animation
    // ---------------------------------------------------------------------------------------

    //> @attr layout.animateMembers (boolean : null : IRW)
    // If true when members are added / removed, they should be animated as they are shown
    // or hidden in position
    // @group animation
    // @visibility animation
    // @example animateLayout
    //<

    //> @attr layout.animateMemberEffect (String : "slide" : IRW)
    // Animation effect for hiding and showing members when animateMembers is true.
    // @group animation
    // @visibility internal
    //<
    animateMemberEffect:"slide",

    //> @method canvas.setAnimateMemberEffect()
    // Setter for +link{animateMemberEffect}.
    //<
    setAnimateMemberEffect : function (effect) {
        // override "slide" for HLayouts to perform horizontal rather than vertical animation
        this.animateMemberEffect = !this.vertical && effect == "slide" ? 
                                   isc.Layout._animateHSlideEffect : effect;
    },

    //> @attr layout.animateMemberTime (number : null : IRWA)
    // If specified this is the duration of show/hide animations when members are being shown
    // or hidden due to being added / removed from this layout.
    // @group animation
    // @visibility animation
    //<
    
    //> @attr layout.suppressMemberAnimations (boolean : null : IRWA)
    // If true, when a member starts to perform an animated resize, instantly finish the 
    // animation rather than reflowing the Layout on each step of the animation.
    // @group animation
    //<
    
    //<Animation    

    // Drag and Drop
    // ---------------------------------------------------------------------------------------

    //> @attr layout.canDropComponents (Boolean : true : IRA)
    // Layouts provide a default implementation of a drag and drop interaction.  If you set
    // +link{Canvas.canAcceptDrop,canAcceptDrop}:true and <code>canDropComponents:true</code>
    // on a Layout, when a droppable Canvas (+link{canvas.canDrop,canDrop:true} is dragged over
    // the layout, it will show a dropLine (a simple insertion line) at the drop location.  
    // <P>
    // When the drop occurs, the dragTarget (obtained using
    // +link{EventHandler.getDragTarget()}) is added as a member of this layout at the location
    // shown by the dropLine (calculated by +link{Layout.getDropPosition()}).  This default
    // behavior allows either members or external components that have
    // +link{Canvas.canDragReposition} (or +link{Canvas.canDrag}) and +link{Canvas.canDrop} set
    // to <code>true</code> to be added to or reordered within the Layout.
    // <P>
    // You can control the thickness of the dropLine via +link{Layout.dropLineThickness} and
    // you can customize the style using css styling in the skin file (look for .layoutDropLine
    // in skin_styles.css for your skin).  
    // <P>
    // If you want to dynamically create a component to be added to the Layout in response to a
    // drop event you can do so as follows: 
    // <smartclient>
    // <pre>
    // isc.VLayout.create({
    //   ...various layout properties...
    //   canDropComponents: true,
    //   drop : function () {
    //     // create the new component 
    //     var newMember = isc.Canvas.create(); 
    //     // add to the layout at the current drop position 
    //     // (the dropLine will be showing here)
    //     this.addMember(newMember, this.getDropPosition());  
    //     // hide the dropLine that was automatically shown 
    //     // by builtin SmartClient methods
    //     this.hideDropLine();
    //   }
    // });
    // </pre>
    // </smartclient>
    // <smartgwt>
    // <pre>
    //  final VLayout vLayout = new VLayout();
	//  //...various layout properties...
    //  vLayout.setCanDropComponents(true);
    //  vLayout.addDropHandler(new DropHandler() {
    //      &#64;Override
    //      public void onDrop(DropEvent event) {
    //          // create the new component 
    //          Canvas newMember = new Canvas();
    //          // add to the layout at the current drop position  
    //          // (the dropLine will be showing here)
    //          vLayout.addMember(newMember, vLayout.getDropPosition());
    //          // hide the dropLine that was automatically shown 
    //          // by builtin SmartGWT methods
    //          vLayout.hideDropLine();
    //      }
    //  });
    // </pre>
    // </smartgwt>
    // If you want to completely suppress the builtin drag and drop logic, but still receive drag
    // and drop events for your own custom implementation, set +link{Canvas.canAcceptDrop} to
    // <code>true</code> and <code>canDropComponents</code> to <code>false</code> on your Layout.
    // 
    // @group dragdrop
    // @visibility external
    //<
    canDropComponents: true,

    //> @attr layout.dropLineThickness (number : 2 : IRA)
    //
    // Thickness, in pixels of the dropLine shown during drag and drop when
    // +link{Layout.canDropComponents} is set to <code>true</code>.  See the discussion in
    // +link{Layout} for more info.
    // 
    // @see Layout
    // @group dragdrop
    // @visibility external
    // @example dragMove
    //< 
    dropLineThickness : 2, 

    //> @attr layout.showDropLines (boolean : null : IRW)
    // Controls whether to show a drop-indicator during a drag and drop operation.  Set to 
    // false if you either don't want to show drop-lines, or plan to create your own.
    // 
    // @group dragdrop
    // @visibility external
    //< 
    //showDropLines : true, 
    
    //> @attr layout.showDragPlaceHolder (boolean : null : IRW) 
    // If set to true, when a member is dragged out of layout, a visible placeholder canvas 
    // will be displayed in place of the dragged widget for the duration of the drag and drop
    // interaction.
    // @group dragdrop
    // @visibility external
    // @example dragMove
    //<

    //> @attr layout.placeHolderProperties (Canvas Properties: null : IR) 
    // If +link{layout.showDragPlaceHolder, this.showDragPlaceHolder} is true, this 
    // properties object can be used to customize the appearance of the placeholder displayed
    // when the user drags a widget out of this layout.
    // @group dragdrop
    // @visibility external
    // @example dragMove
    //<

    membersAreChildren:true

    //> @attr layout.stackZIndex (String: null : IR)
    // For use in conjunction with +link{memberOverlap}, controls the z-stacking order of
    // members.
    // <P>
    // If set to "lastOnTop", members stack from the first member at bottom to the last member
    // at top. If set to "firstOnTop", members stack from the last member at bottom to the
    // first member at top.
    // 
    // @visibility external
    //<
});

//> @groupDef layoutMember
// Properties that can be set on members of a layout to control how the layout is done
// @visibility external
//<

//> @attr canvas.layoutAlign (Alignment | VerticalAlignment : null : IRW)
// When this Canvas is included as a member in a Layout, layoutAlign controls alignment on the
// breadth axis of the layout.  Default is "left" for a VLayout, "top" for an HLayout.
// @group layoutMember
// @visibility external
// @example layoutCenterAlign
//<

//> @attr canvas.showResizeBar (Boolean : false : IRW)
// When this Canvas is included as a member in a +link{Layout}, whether a resizeBar should be shown
// after this member in the layout, to allow it to be resized.
// <p>
// Whether a resizeBar is actually shown also depends on the 
// +link{layout.defaultResizeBars,defaultResizeBars} attribute of the layout, and whether this
// Canvas is the last layout member.
// <p>
// By default the resize bar acts on the Canvas that it is declared on.  If you want the resize
// bar to instead act on the next member of the Layout (e.g. to collapse down or to the right),
// set +link{canvas.resizeBarTarget} as well.
//
// @group layoutMember
// @see canvas.resizeBarTarget
// @see layout.defaultResizeBars
// @visibility external
// @example layoutNesting
//<

//> @attr canvas.resizeBarTarget (String : null : IR)
// When this Canvas is included as a member in a Layout, and +link{showResizeBar} is set to
// <code>true</code> so that a resizeBar is created, <code>resizeBarTarget:"next"</code> can be
// set to indicate that the resizeBar should resize the next member of the layout rather than
// this one.  For resizeBars that support hiding their target member when clicked on, 
// <code>resizeBarTarget:"next"</code> also means that the next member will be the one hidden.
// <P>
// This is typically used to create a 3-way split pane, where left and right-hand sections can
// be resized or hidden to allow a center section to expand.
// <P>
// <b>NOTE:</b> as with any Layout, to ensure all available space is used, one or more members
// must maintain a flexible size (eg 75%, or *).  In a two pane Layout with a normal resize
// bar, to fill all space after a user resizes, the member on the <b>right</b> should have
// flexible size.  With resizeBarTarget:"next", the member on the <b>left</b> should have
// flexible size.
//
// @group layoutMember
// @see canvas.showResizeBar
// @visibility external
//<

//> @attr canvas.extraSpace (PositiveInteger : 0 : IR)
// When this Canvas is included as a member in a Layout, extra blank space that should be left
// after this member in a Layout.
// @see class:LayoutSpacer for more control
// @group layoutMember
// @visibility external
//<

isc.Canvas.addMethods({

    //> @method canvas.setLayoutAlign()
    // Setter for +link{canvas.layoutAlign}
    //<
    setLayoutAlign : function (layoutAlign) {
        this.layoutAlign = layoutAlign;
        if (this.parentElement && isc.isA.Layout(this.parentElement) && 
            this.parentElement.isDrawn()) 
        {
            this.parentElement.reflow();
        }
    },

    //> @method canvas.setShowResizeBar()
    // When this Canvas is included as a member in a +link{Layout}, dynamically updates whether a 
    // resizeBar should be shown after this member in the layout, to allow it to be resized.
    // <p>
    // Whether a resizeBar is actually shown also depends on the 
    // +link{layout.defaultResizeBars,defaultResizeBars} attribute of the layout, and whether this
    // Canvas is the last layout member.
    // @param show (boolean) setting for this.showResizeBar
    // @group layoutMember
    // @see layout.defaultResizeBars
    // @visibility external
    //<
    setShowResizeBar : function (show) {
        if (this.showResizeBar == show) return;
        this.showResizeBar = show;

        var layout = this.parentElement;
        if (layout == null || !isc.isA.Layout(layout)) return;
        layout._computeShowResizeBarsForMembers();
    }
});


// Length/Breadth sizing functions
// --------------------------------------------------------------------------------------------
// NOTE: To generalize layouts to either dimension we use the following terms:
//
// - length: size along the axis on which the layout stacks the members (the "length axis")
// - breadth: size on the other axis (the "breadth axis")

isc.Layout.addMethods({

//> @method layout.getMemberOffset() [A]
// Override point for changing the offset on the breadth axis for members, that is, the offset
// relative to the left edge for a vertical layout, or the offset relative to the top edge for
// a horizontal layout.
// <P>
// The method is passed the default offset that would be used for the member if
// getMemberOffset() were not implemented.  This default offset already takes into account
// +link{layoutMargin}, as well as the +link{defaultLayoutAlign,alignment on the breadth axis},
// which is also passed to getMemberOffset().
// <P>
// This method is an override point only; it does not exist by default and cannot be called.
//
// @param member (Canvas) Component to be positioned
// @param defaultOffset (Number) Value of the currently calculated member offset.  If this
//      value is returned unchanged the layout will have its default behavior
// @param alignment (String) alignment of the enclosing layout, on the breadth axis
// @group layoutMember
// @visibility external
//<

getMemberLength : function (member) { 
    return this.vertical ? member.getVisibleHeight() : member.getVisibleWidth() 
},
getMemberBreadth : function (member) {
    return this.vertical ? member.getVisibleWidth() : member.getVisibleHeight() 
},

setMemberBreadth : function (member, breadth) { 
    if (this.logIsDebugEnabled(this._$layout)) this._reportResize(member, breadth);
    this.vertical ? member.setWidth(breadth) : member.setHeight(breadth); 
},

getMemberMaxBreadth : function (member) {
    return this.vertical ? member.maxWidth : member.maxHeight;
},
getMemberMinBreadth : function (member) {
    return Math.max(this.vertical ? member.minWidth : member.minHeight, this.minMemberBreadth);
},

getMemberMaxLength : function (member) {
    return this.vertical ? member.maxHeight : member.maxWidth; 
},
getMemberMinLength : function (member) {
    return Math.max(this.vertical ? member.minHeight : member.minWidth,
                    this.minMemberSize, this.minMemberLength);
},


// NOTE: these return the space available to lay out components, not the specified size
getLength : function () {
    if (this.vertical) return this.getInnerHeight();
    var width = this.getInnerWidth();
    if (this.leaveScrollbarGap && !this.vscrollOn) width -= this.getScrollbarSize(); 
    return width;
},
getBreadth : function () {
    if (!this.vertical) return this.getInnerHeight();
    var width = this.getInnerWidth();
    if (this.leaveScrollbarGap && !this.vscrollOn) width -= this.getScrollbarSize(); 
    return width;
},

getLengthPolicy : function () {
    return this.vertical ? this.vPolicy : this.hPolicy;
},

getBreadthPolicy : function () {
    return this.vertical ? this.hPolicy : this.vPolicy;
},


memberHasInherentLength : function (member) {

    if (!(this.vertical ? member.hasInherentHeight() : member.hasInherentWidth())) {
        return false;
    }
    // adaptive-length members are not considered to have an "inherent length"
    if (this.vertical ? member.canAdaptHeight : member.canAdaptWidth) {
        return false;
    }
    // if a percent size or "*" is set on a member that supposedly has inherent length, take
    // this as a sign that the member should actually be sized normally.  Note that if we allow
    // a percent-size member to size itself, a stack of such members would not perfectly fill
    // space, because they can't coordinate on rounding to the nearest pixel!
    var explicitLength = this._explicitLength(member);
    if (isc.isA.String(explicitLength) && 
        (explicitLength.endsWith(this._$percent) || explicitLength == this._$star)) 
    {
        return false;
    }
    return true;
},

memberHasInherentBreadth : function (member) {
    return (this.vertical ? member.hasInherentWidth() : member.hasInherentHeight());
},

_overflowsLength : function (member) {
    return ((this.vertical && member.canOverflowHeight()) || 
            (!this.vertical && member.canOverflowWidth()));
},

_canAdaptLength : function (member) {
    return this.vertical ? member.canAdaptHeight : member.canAdaptWidth
},

// NOTE: specified width/height will be defined if width/height were set on construction.
_explicitLength : function (member) {
    return this.vertical ? member._userHeight : member._userWidth;
},

_explicitBreadth : function (member) {
    return this.vertical ? member._userWidth : member._userHeight;
},

_memberPercentLength : function (member) {
    return this.vertical ? member._percent_height : member._percent_width;
},

scrollingOnLength : function () { return this.vertical ? this.vscrollOn : this.hscrollOn },

getMemberGap : function (member) {
    return (member.extraSpace  || 0)  - (this.memberOverlap || 0) 
        + (member._internalExtraSpace || 0);
},





// Creation/Drawing
// --------------------------------------------------------------------------------------------

//>	@method	Layout.initWidget()
//		sets up the layout for various management duties (various observations of member canvases, 
//		initialization of sizes, array, etc.)
//<
initWidget : function () {
    if (isc._traceMarkers) arguments.__this = this;
    // initialize "vertical" for "orientation", or vice versa
    var Layout = isc.Layout;
    if (this.vertical == null) {
        this.vertical = (this.orientation == Layout.VERTICAL);
    } else {
        this.orientation = (this.vertical ? Layout.VERTICAL : Layout.HORIZONTAL);
    }

    // For horizontal Layouts perform a horizontal animation effect when showing / hiding
    if (!this.vertical && this.animateMemberEffect == "slide") {
        this.animateMemberEffect = isc.Layout._animateHSlideEffect;
    }

    // for horizontal layouts in RTL, set (or flip) the reverseOrder flag
    if (this.isRTL() && !this.vertical) this.reverseOrder = !this.reverseOrder;

    if (this.members == null) this.members = [];
    else if (!isc.isA.Array(this.members)) this.members = [this.members];

    // NOTE: trickiness with timing of creating members/children/peers:
    // Once we add the "members" as children or peers, Canvas code will auto-create any members
    // specified as instantiation blocks rather than live widgets.  Therefore, we make sure all
    // members have been instantiated here, because if we allow Canvas code to do the
    // instantiation, our "members" array will contain pointers to instantiation blocks instead
    // of the live Canvii.
    if (this.membersAreChildren) {
        if (!this._dontCopyChildrenToMembers && this.members.length == 0 && this.children != null && 
            !this._allGeneratedChildren()) 
        {
            // since no members were specified, but children were specified, and this is a
            // Layout, assume all children are members.  NOTE: don't be fooled by having a
            // children Array that contains only generated components, which doesn't indicate
            // old-style usage, rather it indicates a Layout subclass that creates
            // non-member children.

            // NOTE: ensure this.members contains live Canvii
            this.members = this.children = this.createMemberCanvii(this.children);
        } else {
            // explicit list of members: create them and add them to the children array
            // NOTE: ensure this.members contains live Canvii
            this.members = this.createMemberCanvii(this.members);
            if (this.children == null) this.children = []; 
            // Add to the children array if they're not already added.
            
            for (var i = 0; i < this.members.length; i++) {
                if (!this.children.contains(this.members[i])) {
                    this.children.add(this.members[i]);
                }
            }
        }

    } else {
        this.logInfo("members are peers", "layout");

        // we override drawPeers() to do our special drawing.  The Layout itself *will not draw*
        // since there's no need.  

        // override draw() to avoid actually drawing this Canvas.  
        
        this.addMethods({draw:this._drawOverride});

        // explicit list of members: create them and add them to the peers array
        // NOTE: ensure this.members contains live Canvii
        this.members = this.createMemberCanvii(this.members);
        if (this.peers == null) this.peers = [];
        this.peers.addList(this.members);
    }
    // Run 'getUserSizes' to ensure we store out specified percent etc sizes
    // For dynamically added members this is handled in addMembers()
    for (var i = 0; i < this.members.length; i++) {
        this._getUserSizes(this.members[i]);
    }
    
    // set up per-side margin properties based on settings
    this.setLayoutMargin();
     // fire membersChanged() if we have members
    if (this.members && this.members.length > 0) {
        this._membersChanged();
    }
    
    // Warn if align is useless for current orientation
    this.checkAlign(this.align);
},

//> @method layout.setAlign()
// Changes the +link{layout.align} for this Layout.
// <p>
// Horizontal layouts should only be changed to +link{Alignment}, and vertical layouts to
// +link{VerticalAlignment}, otherwise they will be considered invalid values, and assigning an
// invalid value here will log a warning to the Developer Console.
// <p>
// For alignment on the breadth axis, see +link{defaultLayoutAlign} and
// +link{canvas.layoutAlign}.
//
// @param align (Alignment | VerticalAlignment)
// @visibility external
//<
setAlign : function (align) {
    this.checkAlign(align);
    this.align = align;
},

// checks if the requested align makes sense for the current orientation, and warns if it is invalid
checkAlign : function (align) {
    if (this.vertical) {
        if (align == isc.Canvas.LEFT || align == isc.Canvas.RIGHT) {
            this.logWarn("Layout.align set to " + align + ", which is invalid for vertical layouts");
        }
    } else {
        if (align == isc.Canvas.TOP || align == isc.Canvas.BOTTOM) {
            this.logWarn("Layout.align set to " + align + ", which is invalid for horizontal layouts");
        }
    }

},

// createMemberCanvii - resolves specified members / children to actual canvas instances, and
// unlike createCanvii, clears out anything that didn't resolve to a Canvas with a warning
createMemberCanvii : function (members) {
    // initialize any (manually-created) LayoutResizeBars
    for (var i = members.length-1; i >= 0; i--) {
        if (isc.isA.LayoutResizeBar(members[i])) {
            this.initResizeBarMember(members[i]);
        }
    }
    members = this.createCanvii(members);


    // If a member is included multiple times in the array, remove the dup's and warn
    // For LayoutSpacers we can go a step further and just create a second LS that matches
    // the size and position (not best practice but should actually work)
    for (var i = members.length-1; i >= 0; i--) {
        // Skip null entries - we handle these separately
        if (members[i] == null) continue;
        if (!isc.isA.Canvas(members[i])) {
            this.logWarn("Layout unable to resolve member:" + this.echo(members[i]) + 
                         " to a Canvas - ignoring this member");
            members.removeAt(i);
        }
    }
    var dups = this._checkMembersForDuplicates(members);
    if (dups.length != 0) {
        this.logWarn("Specified members array contains the following component(s) multiple times:" + 
            dups + ". This is unsupported. Duplicate Canvas entries will be removed. " +
            "Duplicate LayoutSpacer entries will be replaced with new LayoutSpacers with the same dimensions.");
    }

    return members;
},

_checkMembersForDuplicates : function (members) {
    // Loop through the members checking for duplicates
    
    var duplicates = [];
    for (var i = 0; i < members.length; i++) {
        var member = members[i],
        nextIndex = members.indexOf(member, i+1);
        if (nextIndex != -1) duplicates.add(member);
        while (nextIndex != -1) {
            if (isc.isA.LayoutSpacer(member)) {
                members[nextIndex] = isc.LayoutSpacer.create({
                    height:member.height,
                    width:member.width,
                    minHeight:member.minHeight,
                    minWidth:member.minWidth
                });
                nextIndex = members.indexOf(member, nextIndex+1);
            } else {
                members.removeAt(nextIndex);
                nextIndex = members.indexOf(member, nextIndex);
            }
        }
    }
    // return whatever we removed/replaced
    return duplicates;
},

_allGeneratedChildren : function () {
    for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (child != null && !child._generated) return false;
    }
    return true;
},

// Margins handling
// ---------------------------------------------------------------------------------------

setPadding : function () {
    this.Super("setPadding", arguments);
    if (this.paddingAsLayoutMargin) {
        this.setLayoutMargin();
    }
},

//> @method layout.setLayoutMargin()
// Method to force a reflow of the layout after directly assigning a value to any of the
// layout*Margin properties. Takes no arguments.
//
// @param [newMargin] (Integer) optional new setting for layout.layoutMargin.  Regardless of whether a new
//                          layout margin is passed, the layout reflows according to the current settings
//                          for layoutStartMargin et al
//
// @group layoutMargin
// @visibility external
//<

setLayoutMargin : function (newMargin) {

    if (newMargin != null) this.layoutMargin = newMargin;

    var lhm = this.layoutHMargin,
        lvm = this.layoutVMargin,
        lm = this.layoutMargin,
        // if we are reversed and eg horizontal, the start margin should be on the right, etc
        sm = this.reverseOrder ? this.layoutEndMargin : this.layoutStartMargin,
        em = this.reverseOrder ? this.layoutStartMargin : this.layoutEndMargin;
        
    var lpm, rpm, tpm, bpm;
    if (this.paddingAsLayoutMargin) {
        var padding = this._calculatePadding();
        lpm = padding.left; rpm = padding.right;
        tpm = padding.top; bpm = padding.bottom;
    }

    

    this._leftMargin = this._firstNonNull(this.layoutLeftMargin, 
                                          (!this.vertical ? sm : null), 
                                          lhm, lm, lpm, 0);
    this._rightMargin = this._firstNonNull(this.layoutRightMargin, 
                                           (!this.vertical ? em : null),
                                           lhm, lm, rpm, 0);
    this._topMargin = this._firstNonNull(this.layoutTopMargin, 
                                          (this.vertical ? sm : null),
                                          lvm, lm, tpm, 0);
    this._bottomMargin = this._firstNonNull(this.layoutBottomMargin, 
                                           (this.vertical ? em : null),
                                           lvm, lm, bpm, 0);

    this._breadthChanged = true;
    this.reflow();
},

_getSideMargin : function (vertical) {
    if (this._leftMargin == null) this.setLayoutMargin();
    
    if (vertical) return this._leftMargin + this._rightMargin;
    else return this._topMargin + this._bottomMargin;
},
_getBreadthMargin : function () { return this._getSideMargin(this.vertical); },
_getLengthMargin : function () { return this._getSideMargin(!this.vertical); },

// ---------------------------------------------------------------------------------------

// draw() override for members-aren't-children mode.
_drawOverride : function () {
    //!DONTCOMBINE
    if (isc._traceMarkers) arguments.__this = this;
    if (!this.membersAreChildren) {
        // we draw the members now, and never draw the Layout as such
        
        this._setupMembers();

        // draw all the other members.
    	this.layoutChildren(this._$initial_draw);

        this.drawPeers();
        this._drawn = true;
        return;
    } 
    //StackDepth do a manual Super to avoid stack depth (and its faster)
    isc.Canvas._instancePrototype.draw.apply(this, arguments);
    //this.Super("draw", arguments);
},

// override to ensure padding gets updated for CSS changes
setStyleName : function (newStyle) {
    // Avoid marking the layout as dirty if the new and current styleNames are the same.
    
    if (this.styleName != newStyle) {
        this.Super("setStyleName", arguments);
        this.setLayoutMargin(this.layoutMargin);
    }
},

// if our members are peers, suppress the normal behavior of resizing peers with the parent 
resizePeersBy : function (a,b,c) {
    if (!this.membersAreChildren) return;
    
    isc.Canvas._instancePrototype.resizePeersBy.call(this, a,b,c);    
    //this.Super("resizePeersBy", arguments);
},

markForRedraw : function () {
    if (this.membersAreChildren) return this.Super("markForRedraw", arguments);
    // if members aren't children, we don't draw, so ignore the redraw and just treat it as
    // dirtying the layout
    this.reflow("markedForRedraw");
},

// NOTE: we need to override drawChildren because if we don't, we will have to run the layout
// policy after the children have already been drawn, hence resizing them all and causing them
// to redraw.
drawChildren : function () {
    if (this.membersAreChildren) {
        // members are all children: handle drawing them specially
        this._setupMembers();

        this._setupMembersRuleScope();

        this.updateChildTabPositions();

        // draw all the members.
        // NOTE: odd behavior of Layouts: because layoutChildren() skips hidden members, members
        // which are initially hidden DO NOT DRAW.  This is unlike any other Canvas
        // parent-child relationship, where it is guaranteed that all children have been drawn
        // if the parent has been drawn.  The primary reason not to draw hidden members is
        // performance.
    	this.layoutChildren(this._$initial_draw);

        // if there are any children who are not members, call draw on them.  NOTE: a typical
        // case is the *peers of our members*.  This also implies that we must draw members
        // before non-member children, since peers must draw after their masters.
        this._drawNonMemberChildren();
        
        // Fix the zIndex / tab-index of masked children if we're showing the component mask
        // Normally this happens when 'showComponentMask' is called, so this handles the case where a 
        // developer clears and re-draws the parent while the mask is still up.
        if (this.componentMaskShowing) {
            this._updateChildrenForComponentMask();
        }
    }
    // if members aren't children, we don't draw ourselves, so we can't draw children 
    return;
},


//>	@method	layout._setupMembers()
// Do one time setup of members.
// Sets initial breadth for all members.
// Returns the set of members that should be predrawn.
//<	
_setupMembers : function () {
    if (!this.members) return;
	for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        if (member == null) {
            this.logWarn("members array: " + this.members + " includes null entry at position " 
                         + i + ". Removing");
            this.members.removeAt(i);
            i-=1;
            continue;
        }

        // set each member's breadth
        this.autoSetBreadth(member);
	}
},

// Normally ruleScope is assigned on first draw as are canvas *When rules, however,
// visibleWhen rules in a canvas need to be processed prior to layout because those
// that are not visible should not initially be shown nor should the potential space
// be allocated within the layout. In other words, an initially hidden component
// should show initially just like it would if hidden later without the transition.
_setupMembersRuleScope : function () {
    // Assign ruleScope and *When rules if needed
    if (this.members) {
        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i];
            // A hidden component may be assigned a ruleScope when added as a child but it could
            // be wrong (see where flag is set in this file). Recompute the ruleScope to pick up
            // the correct ruleScope.
            if (member._recomputeRuleScopeOnDraw) {
                member._removeCanvasWhenRules();
                member._removeDynamicPropertyRules();
                member._removeFromRuleScope();
                delete member._recomputeRuleScopeOnDraw;
            }
            // Determine ruleScope on first draw if needed. 
            // Must be done before children are drawn.
            member.computeRuleScope();
            member._createCanvasWhenRules(true, true);
        }
    }
},

// _drawNonMemberChildren
// Iterate through the children array, and for any children that are not members, draw them without
// managing their layout
// (Duplicates some code to achieve this from Canvas.drawChildren())
_drawNonMemberChildren : function () {

    // bail for the case where members are not children for now
    if (!this.membersAreChildren || !this.children) return;
    
    for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (this.members.contains(child)) continue;

        if (!isc.isA.Canvas(child)) {
            child.autoDraw = false;
            child = isc.Canvas.create(child);
        }
        // Skip any children that shouldn't draw automatically along with the parent
        // EG: componentMask
       if (!this.drawChildWithParent(child)) continue;
          
        if (!child.isDrawn()) child.draw();
    }
},

//> @method layout.revealChild()
// Reveals the child or member Canvas passed in by showing it if it is currently hidden
//
// @param child (GlobalId | Canvas) the child Canvas to reveal, or its global ID
// @visibility external
//<
revealChild : function (child) {
    if (isc.isA.String(child)) child = window[child];
    if (child) {
        if (this.children && this.children.contains(child) && !child.isVisible()) {
            child.show();
        } else {
            // Members are not necessarily children
            if (this.members && this.members.contains(child) && !child.isVisible()) {
                child.show();
            }
        }
    }
},


// Setting member sizes
// --------------------------------------------------------------------------------------------

//> @attr layout.managePercentBreadth (Boolean : true : IR)
// If set, a Layout with breadthPolicy:"fill" will specially interpret a percentage breadth on
// a member as a percentage of available space excluding the +link{layoutMargin}.  If false,
// percentages work exactly as for a non-member, with layoutMargins, if any, ignored.
// @visibility external
//<
managePercentBreadth:true,

//> @method layout.getMemberDefaultBreadth() [A]
// Return the breadth for a member of this layout which either didn't specify a breadth or
// specified a percent breadth with +link{managePercentBreadth}:true.
// <P>
// Called only for Layouts which have a +link{type:LayoutPolicy,layout policy} for the breadth
// axis of "fill", since Layouts with a breadth policy of "none" leave all member breadths alone.
//
// @param member (Canvas) Component to be sized
// @param defaultBreadth (Number) Value of the currently calculated member breadth. This
//      may be returned verbatim or manipulated in this method.
// @group layoutMember
// @visibility external
//<
getMemberDefaultBreadth : function (member, defaultBreadth) {
    return defaultBreadth;
},

_getMemberDefaultBreadth : function (member) {
    var explicitBreadth = this._explicitBreadth(member),
        percentBreadth = isc.isA.String(explicitBreadth) && isc.endsWith(explicitBreadth,this._$percent) 
                    ? explicitBreadth : null,
        availableBreadth = Math.max(this.getBreadth() - this._getBreadthMargin(), 1);


    
    var minBreadthMember = this._minBreadthMember;
    if (minBreadthMember && minBreadthMember != member) {
        var minMemberBreadth = this.getMemberBreadth(minBreadthMember);
        if (minMemberBreadth > availableBreadth) availableBreadth = minMemberBreadth;
    }

    
    

    if (!this.leaveScrollbarGap) {
        if (this._willScrollLength != null) {
            // this.logWarn("resizeMembers adjusting breath for scrolling (" + this._willScrollLength + ")");
            availableBreadth += ((this._willScrollLength ? -1 : 1) * this.getScrollbarSize());
        }
    }

    var breadth = (percentBreadth == null ? availableBreadth :
                   Math.floor(availableBreadth * (parseInt(percentBreadth)/100)));

    // call user-specified override, if any
    if (this.getMemberDefaultBreadth != null) {
        breadth = this.getMemberDefaultBreadth(member, breadth);
    }

    // clamp to member min/max in breadth direction
    var minBreadth = this.getMemberMinBreadth(member),
        maxBreadth = this.getMemberMaxBreadth(member);
    if      (breadth < minBreadth) breadth = minBreadth;
    else if (breadth > maxBreadth) breadth = maxBreadth;
    
    return breadth;
},

// sets the member's breadth if the member does not have an explicitly specified breadth and
// this layout alters member breadths.  Returns true if the member's breadth was changed, false
// otherwise
autoSetBreadth : function (member) {
    if (!this.shouldAlterBreadth(member)) return false;

    // set layoutInProgress, otherwise, we'll think the resize we're about to do was done by the
    // user and treat it as an explicit size
    var wasInProgress = this._layoutInProgress;
    this._layoutInProgress = true;

    this.setMemberBreadth(member, this._getMemberDefaultBreadth(member));
    
    this._layoutInProgress = wasInProgress;


    return true;
},

// return whether this member should be resized on the perpendicular axis.  
shouldAlterBreadth : function (member) {
    // any member with an explicit breadth setting is left alone (hence will stick out or be
    // smaller than the breadth of the layout)
    var explicitBreadth = this._explicitBreadth(member);
    if (explicitBreadth != null) {
        // managePercentBreadths if so configured.  For any other explicit breath, let the
        // member size itself.
        return (this.managePercentBreadth && 
                this.getBreadthPolicy() == isc.Layout.FILL &&
                isc.isA.String(explicitBreadth) && 
                isc.endsWith(explicitBreadth,this._$percent));
                
    }

    // NOTE: overflow:visible members: if the policy indicates that we change their breadth,
    // what we're basically setting is a minimum, and also advising the browser as to the optimal
    // point to wrap their content if it's wrappable.  Once such a member is drawn, it may exceed
    // the layout's breadth, similar to a member with an explicit size.

    
    if ((this.vertical && member.neverExpandWidth) ||
        (!this.vertical && member.neverExpandHeight)) return false;


    // members will be set to the breadth of the layout if they have no explicit size of their own
    if (this.getBreadthPolicy() == isc.Layout.FILL) return true;

    // with no breadth policy, don't change member breadth
    return false;
},

// move these canvases offscreen so that we can find out their size
_moveOffscreen : function (member) {
    return isc.Canvas.moveOffscreen(member);
},

// return the total space dedicated to margins or resizeBars

getMarginSpace : function () {
    var lastMemberWasHidden, 
        lastMemberWasResizeBar,
        lastMemberHadResizeBar,
        membersMarginPending,
        marginSpace = this._getLengthMargin()
    ;
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i],
            isResizeBar = isc.isA.LayoutResizeBar(member),
            showResizeBar = member._computedShowResizeBar,
            shouldIgnore = this._shouldIgnoreMember(member)
        ;

        if (showResizeBar) {
            // leave room for resizeBar
            marginSpace += this.resizeBarSize;
        }

        
        if (i > 0 && !lastMemberHadResizeBar) {
            if (!lastMemberWasHidden && !lastMemberWasResizeBar && !isResizeBar) {
                if (shouldIgnore) membersMarginPending = true;
                else marginSpace += this.membersMargin;
            } else if (lastMemberWasHidden && !isResizeBar && membersMarginPending) {
                marginSpace += this.membersMargin;
                membersMarginPending = false;
            }
        }

        lastMemberWasResizeBar = isResizeBar;
        lastMemberHadResizeBar = showResizeBar;
        lastMemberWasHidden = shouldIgnore;

        if (shouldIgnore) {
            // hidden member with a resizeBar; clear any pending margin
            if (showResizeBar) membersMarginPending = false;
        } else {
            // leave extra space on a member-by-member basis
            marginSpace += this.getMemberGap(member);
        }
    }

    // re add 1 * this.memberOverlap so we don't clip the member closest to our edge
    if (this.memberOverlap != null) marginSpace += this.memberOverlap;
    return marginSpace;
},

// return the total space to be allocated among members by the layout policy: the specified
// size minus space taken up by margins and resizeBars
getTotalMemberSpace : function () {
    return this.getLength() - this.getMarginSpace(); 
},

// get the total length of all members including margins and resizeBars, which may exceed the
// specified size of the layout if the layout as a whole overflowed
_getTotalMemberLength : function () {
    var totalMemberLength = 0;
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        if (this._shouldIgnoreMember(member)) continue;
        totalMemberLength += this.getMemberLength(member);
    }
    return totalMemberLength + this.getMarginSpace();
},

// This method prevents the member from being repositioned / resized when we reflow, even
// if it's visible
ignoreMember : function (member) {
    // don't require `member' to be a member of this Layout in case we want the member to be
    // ignored before it's added as a member.

    member._isIgnoringLayout = true;
},

// Allow a member that was previously being ignored to respond to reflow.
stopIgnoringMember : function (member) {
    if (!this.hasMember(member)) return;
    var wasIgnoringMember = this._shouldIgnoreMember(member);
    member._isIgnoringLayout = false;
    // If we were ignoring the member, and now we are not, reflow() to reposition / resize the
    // member.
    if (wasIgnoringMember && !this._shouldIgnoreMember(member)) this.reflow();
},

isIgnoringMember : function (member) {
    return !!member._isIgnoringLayout;
},

// Helper method to determine whether the specified member should be resized / relayed out when
// layoutChildren / reflow
// Returns true if we're ignoring the member, or its hidden.
_shouldIgnoreMember : function (member) {
    
    if (member.visibility == isc.Canvas.HIDDEN
        && !(member._edgedCanvas && member._edgedCanvas.isVisible())) return true;
    if (this.isIgnoringMember(member)) return true;
    return false;
},

// Allow a member with a managed Z order (via stackZIndex) to be unmanaged.
// DO NOT MANIPULATE _isIgnoringZIndex DIRECTLY! Side effects may be necessary (notably
// when one stops ignoring the member).
ignoreMemberZIndex : function (member) {
    if (!member || !this.members || this.members.indexOf(member) == -1) return;
    member._isIgnoringZIndex = true;
    this.reflow();
},

stopIgnoringMemberZIndex : function (member) {
    member._isIgnoringZIndex = false;
    this.reflow();
},

_isIgnoringMemberZIndex : function (member) {
    if (this.isIgnoringMember(member))
        return true;
    else if (member._isIgnoringZIndex)
        return member._isIgnoringZIndex;
    return false;
},

_$layout : "layout",
// gather the sizes settings that should be passed to the layout policy
// two modes: normal mode, or mode where members that can overflow are treated as being fixed
// size at their drawn size
gatherSizes : function (overflowAsFixed, layoutInfo, sizes) {
    if (!layoutInfo) {
        // re-use a per-instance array for storing layoutInfo
        layoutInfo = this._layoutInfo;
        if (layoutInfo == null) {
            layoutInfo = this._layoutInfo = [];
        } else {
            layoutInfo.length = 0;
        }
    }

    var policy = this.getLengthPolicy();

    // whether to put together info for a big layout report at the end of the resizing/policy run
    var report = this.logIsInfoEnabled(this._$layout);

    // detect sizes that should be regarded as fixed
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
 
        var memberInfo = layoutInfo[i];
        if (memberInfo == null) {
            memberInfo = layoutInfo[i] = {};
        }

        // skip hidden members
        if (this._shouldIgnoreMember(member) 
            //>Animation
            // If we're about to animateShow() a new member, it's visibility will be hidden, 
            // but we need to determine its initial size anyway
            && !member._prefetchingSize //<Animation
           ) {
            memberInfo._policyLength = 0;
            if (report) memberInfo._lengthReason = "hidden";
            continue;
        }

        // If a member has an inherent length, we always respect it as a fixed size.  If we have
        // no sizing policy, in effect everything is "inherent length": we just ask it for it's
        // size; if it has a percent size or other non-numeric size, it interprets it itself.
        if (this.memberHasInherentLength(member) || policy == isc.Layout.NONE) {
            memberInfo._policyLength = this.getMemberLength(member);
            // we never want to set a length for inherent size members
            if (report) {
                memberInfo._lengthReason = (policy == isc.Layout.NONE ? "no length policy" : 
                                           "inherent size");
            }
            continue;
        }

        
        if (this._canAdaptLength(member)) {
            var canOverflow = this._overflowsLength(member), 
                specifiedLength = this.vertical ? member.getHeight() : member.getWidth(),
                overflowLength = canOverflow ? this.getMemberLength(member) : specifiedLength
            ;
            memberInfo._policyLength = overflowAsFixed && !canOverflow ? sizes[i] : 
                                                                    overflowLength;
            memberInfo._overflowed = overflowLength > specifiedLength;

            if (report) {
                memberInfo._lengthReason = "adaptive length";
            }
            continue;
        }

        // if we are treating overflowing members as fixed (second pass), members that can
        // overflow should now be treated as fixed size by the policy
        if (overflowAsFixed && this._overflowsLength(member)) {
            var drawnLength = this.getMemberLength(member);

            // if the member's drawn size doesn't match the size we assigned it in the first
            // pass, it has overflowed, unless that member hasn't yet been resized to sizes[i]
            if (drawnLength != sizes[i] && this._isSizesValidForMember(sizes, i)) {
                if (report) {
                    this.logInfo("member: " + member + " overflowed.  set length: " + sizes[i] +
                                 " got length: " + drawnLength, "layout"); 
                    memberInfo._lengthReason = "length overflowed";
                }
                var policyLength = memberInfo._policyLength;
                // mark overflowed stretch-size-policy members with policy to limit reversion
                memberInfo._overflowed =isc.Canvas.isStretchResizePolicy(policyLength) ? 
                                                                         policyLength : true;
                memberInfo._policyLength = drawnLength;
            }
            continue;
        }

        // respect any explicitly specified size (this includes percent)
        if (this._explicitLength(member) != null) {
            memberInfo._policyLength = this.vertical ? member._userHeight : member._userWidth;
            if (report) memberInfo._lengthReason = "explicit size";
            continue;
        }
        // no size specified; ask for as much space as is available
        if (memberInfo._policyLength == null) {
            memberInfo._policyLength = this._$star;
            if (report) memberInfo._lengthReason = "no length specified";
        }
    }
    return layoutInfo;
},

// resize the members to the sizes given in the sizes[] array.  If overflowersOnly is true, only
// resize members that can overflow. 
//>Animation
_resizeAnimations:["show", "hide", "rect"],
//<Animation


_hasCosmeticOverflowOnly : function () {
    var members = this.members,
        pageRight,
        pageBottom;
    for (var i = 0; i < members.length; ++i) {
        var member = members[i];
        if (!member) continue; //support sparse arrays

        var memberPeers = member.peers;
        if (memberPeers) {
            for (var j = 0; j < memberPeers.length; ++j) {
                var peer = memberPeers[j];
                if (peer._cosmetic) {
                    if (pageRight == null) {
                        var clipHandle = this.getClipHandle();
                        pageRight = this.getPageRight() - isc.Element.getRightBorderSize(clipHandle);
                        pageBottom = this.getPageBottom() - isc.Element.getBottomBorderSize(clipHandle);
                    }

                    var peerRect = peer.getPeerRect();
                    if ((peerRect[0] + peerRect[2]) >= pageRight ||
                        (peerRect[1] + peerRect[3]) >= pageBottom)
                    {
                        // Proceed on to checking whether any other non-cosmetic child has
                        // a right/bottom coordinate outside of the specified size.
                        for (var k = 0; k < members.length; ++k) {
                            member = members[k]; 
                            if (member.getPageRight() >= pageRight ||
                                member.getPageBottom() >= pageBottom)
                            {
                                // One of the members is causing overflow, so this layout does
                                // not have purely cosmetic elements causing overflow.
                                return false;
                            }
                        }
                        return true;
                    }
                }
            }
        }
    }
    return false;
},

// resize a single member of the layout; called during layoutChildren()
resizeMember : function (member, size, memberInfo, overflowers, overflowAsFixed, overflowIndex)
{
    var report = this.logIsInfoEnabled(this._$layout);

    // ignore hidden members and explicitly ignored members
    if (this._shouldIgnoreMember(member)) return;

    
    if (overflowers != null && overflowers != this._overflowsLength(member)) return;

    
    var canAdaptLength = this._canAdaptLength(member);
    if (overflowIndex != null && !canAdaptLength) return;
        
    // get the breadth this member should be set to, or null if it shouldn't be changed
    var breadth = null;
    if (this.shouldAlterBreadth(member)) { 
        if (report) memberInfo._breadthReason = "breadth policy: " + this.getBreadthPolicy();
        breadth = memberInfo._breadth = this._getMemberDefaultBreadth(member);
    } else {
        // don't set breadth
        memberInfo._breadth = this.getMemberBreadth(member);
        if (report) {
            memberInfo._breadthReason = this.getBreadthPolicy() == isc.Layout.NONE ?
                "no breadth policy" : "explicit size";
        }
    }
        
    // get the length we should set the member to
    
    var length = null;
    if (this.getLengthPolicy() != isc.Layout.NONE && !this.memberHasInherentLength(member)) {
        if (canAdaptLength && this._overflowsLength(member)) {
            var specifiedLength = this.vertical ? member.getHeight() : member.getWidth();
            if (size < specifiedLength) {
                length = memberInfo._resizeLength = size;
                if (report) {
                    this.logInfo("size-adaptive member: " + member + " had to be resized " + 
                        "narrower to ensure that adaptWidthBy()/adaptHeightBy() can assume " +
                        "its size is overflow-driven", this._$adaptMembers);
                }
            }
        } else if (!memberInfo._overflowed) {
            length = memberInfo._resizeLength = size;
        }
    }

    // avoid trying to resize an overflowed member to less than its overflowed size
    // (if the width is not also changing, and the member isn't dirty for another reason)
    
    if (length != null && !canAdaptLength && this._overflowsLength(member) && 
        !member.isDirty() &&
        (!member._hasCosmeticOverflowOnly || !member._hasCosmeticOverflowOnly()))
    {
        var specifiedLength = (this.vertical ? member.getHeight() : member.getWidth()),
            visibleLength = this.getMemberLength(member);
        // member has overflowed length
        if (visibleLength > specifiedLength &&
            // specified length doesn't violate minimum for that member
            this.getMemberMinLength(member) <= specifiedLength &&
            // the new length is less than or equal to the member's overflowed size
            length <= visibleLength && 
            // breadth won't change or isn't increasing
            (breadth == null || breadth <= this.getMemberBreadth(member))) 
        {
            if (report) this.logInfo("not applying " + this.getLengthAxis() + ": " + length +
                                     " to overflowed member: " + member + " w/" + 
                                     this.getLengthAxis() + ": " + visibleLength, "layout");
            length = null;          
        }
    }
        
    if (this.logIsDebugEnabled(this._$layout)) this._reportResize(member, breadth, length);

    //>Animation
    // Don't resize a member that's in the process of animate-resizing
    if (!member.isAnimating(this._resizeAnimations)) {//<Animation
        var width  = this.vertical ? breadth : length,
            height = this.vertical ? length : breadth;
        
        if (!overflowers || !overflowAsFixed || !member._equalsCurrentSize(width, height)) {
            member.resizeTo(width, height);
        }
        //>Animation
    }//<Animation
        
    // redraw the member if it changed size, so we can get the right size for stacking
    // purposes (or draw the member if it's never been drawn)
    
    if (member.isDrawn()) {
        if (member.isDirty()) member.redrawForNewSize("Layout getting new size");
    } else {
        // cause undrawn members to draw (drawOffscreen because we haven't positioned them
        // yet and don't want them to momentarily appear stacked on top of each other)
        member._needsDraw = true;
    }

    
    if (overflowAsFixed && this._overflowsLength(member) && !canAdaptLength) {
        var drawnLength = this.getMemberLength(member);

        // if the member's drawn size exceeds the size we assigned it in the first pass, it has
        // overflowed
        
        if (drawnLength > size) {
            if (report) {
                this.logInfo("resizeMembers(): member: " + member + " overflowed.  Set " + 
                             "length: " + size + ", got length: " + 
                             drawnLength + "; skipping resize of remaining members", "layout");
            }
            return true;
        }
    }
},

resizeMembers : function (sizes, layoutInfo, overflowers, overflowAsFixed) {

    
    if (this.overflow == isc.Canvas.AUTO) {
        var lengthOverflows = sizes.sum() > this.getTotalMemberSpace(),
            scrollingOnLength = this.scrollingOnLength();

        this._willScrollLength = null;
        if (lengthOverflows) {
            if (!scrollingOnLength) {
                this.logInfo("scrolling will be required on length axis, after overflow", 
                    this._$layout);

                this._willScrollLength = true;
            }
        } else {
            if (scrollingOnLength) {
                this.logInfo("scrolling will no longer be required on length axis, after overflow", 
                    this._$layout);
                this._willScrollLength = false;
            }
        }
    }

    
    var stretchSizeOverflowIndex,
        minBreadthIndex = this._minBreadthIndex,
        minBreadthMember = this._minBreadthMember;
    if (minBreadthMember) {
        if (this.resizeMember(minBreadthMember, sizes[minBreadthIndex], 
                              layoutInfo[minBreadthIndex], overflowers, overflowAsFixed))
        {
            stretchSizeOverflowIndex = minBreadthIndex;
        }
    }

    // resize each member (skipping the minBreadthMember if any)
    var members = this.members;
	for (var i = 0; i < members.length; i++) {
        if (i == minBreadthIndex) continue;
        if (this.resizeMember(members[i], sizes[i], layoutInfo[i], 
                              overflowers, overflowAsFixed, stretchSizeOverflowIndex))
        {
            stretchSizeOverflowIndex = i;
        }
    }

    
    return (sizes.maxResizedIndex = stretchSizeOverflowIndex) == null;
},

// if stackZIndex is "firstOnTop" or "lastOnTop", ensure all managed members have 
// consistently increasing or decreasing Z-order, except members which should be ignored 
// (such as selected tabs in a TabBar which must be at the top).
_enforceStackZIndex : function () {
    
    if (!this.stackZIndex || this.members.length < 2) return;
    
    // advance to the first non-ignored member
    for (var firstStacked=0; firstStacked<this.members.length; firstStacked++)
        if (!this._isIgnoringMemberZIndex(this.members[firstStacked])) break;
    
    var thisMember=this.members[firstStacked], thisZ=thisMember.getZIndex();
    var lastMember, lastZ;
    
    // compare the Z-order of each stackable member to the last stackable member before
    // it. Adjust the Z-order if it does not match the stack ordering.
    for (var i = firstStacked+1; i < this.members.length; i++) {
        if (this._isIgnoringMemberZIndex(this.members[i])) continue;
        lastMember = thisMember;
        lastZ = lastMember.getZIndex();
        thisMember = this.members[i];
        thisZ = thisMember.getZIndex();
        
        if ((thisZ <= lastZ) && this.stackZIndex == "lastOnTop")
            thisMember.moveAbove(lastMember);
        else if ((thisZ >= lastZ) && this.stackZIndex == "firstOnTop")
            thisMember.moveBelow(lastMember);
    }
},

//>Animation When the member is in the middle of an animated move, avoid attempting to move as
// part of layout.
_moveAnimations:["rect", "move"], //<Animation


stackMembers : function (members, layoutInfo, updateSizes) {
    
    if (updateSizes == null) updateSizes = true;
    
    // top/left coordinate of layout: if members are children, placing a member at 0,0
    // places it in the top left corner of the Layout, since child coordinates are relative
    // to the parent.  Otherwise, if members are peers, the top/left corner is the
    // offsetLeft/Top with respect to the Layout's parent
    var layoutLeft = (this.membersAreChildren ? 0 : this.getOffsetLeft()),
        layoutTop  = (this.membersAreChildren ? 0 : this.getOffsetTop()),
        // support reversing the order members appear in
        reverse = this.reverseOrder,
        direction = (reverse ? -1 : 1);

    

    // breadth to use for centering based on specified size, which we'll use as is
    // for the clipping/scrolling case, and acts as a minimum for the overflow case.  
    // Note getInner* takes into account native margin/border
    var vertical = this.vertical,
        specifiedBreadth = (vertical ? this.getInnerWidth() : 
                                       this.getInnerHeight()) - this._getBreadthMargin()
    ;
    
    var Canvas = isc.Canvas, centerBreadth = specifiedBreadth,
        overflow = this._$suppressedOverflowDuringAnimation || this.overflow;
    if (overflow != Canvas.HIDDEN && (vertical ? (overflow != Canvas.CLIP_H) : 
                                                 (overflow != Canvas.CLIP_V)))
    {
        // overflow case.  Note we can't just call getScrollWidth() and subtract off synthetic
        // margins because members have not been placed yet.
        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i];
            // ignore hidden members and explicitly ignored members
            if (this._shouldIgnoreMember(member)) continue;
            var value = this.getMemberBreadth(member);
            if (value > centerBreadth) centerBreadth = value;
        }
    }
    if (this.logIsDebugEnabled(this._$layout)) {
        this.logDebug("centering wrt visible breadth: " + centerBreadth, this._$layout);
    }

    
    var totalLength;
    if (reverse) {
        
        var allowNegative = this.isRTL() && this.overflow != isc.Canvas.VISIBLE;
        if (allowNegative) {

                         
            totalLength = this.getLength();
        } else {
            totalLength = Math.max(this.getLength(), this._getTotalMemberLength());
        }        
    }

	// start position of the next member on length axis.
    // if reversing, start stacking at end coordinate and work backwards.  Note that this
    // effectively creates right/bottom alignment by default. 
    var nextMemberPosition = vertical ? (!reverse ? layoutTop  : layoutTop  + totalLength) :
                                        (!reverse ? layoutLeft : layoutLeft + totalLength)
    ;
    // if align has been set to non-default, 
    if (this.align != null) {
        var totalMemberLength = this._getTotalMemberLength(),
            visibleLength = Math.max(this.getLength(), totalMemberLength),
            remainingSpace = visibleLength - totalMemberLength;


        if (((!reverse && (this.align == Canvas.BOTTOM || this.align == Canvas.RIGHT)) ||
              (reverse && (this.align == Canvas.LEFT   || this.align == Canvas.TOP))))
        {
            // leave the space that would have been at the end at the beginning instead.
            // if reversed, hence normally right/bottom aligned, and align has been set to
            // left/top, subtract off remaining space instead.  NOTE: can't simplify reversal to
            // just mean right/bottom align: reverse stacking starts from endpoint and subtracts
            // off sizes during stacking.
            nextMemberPosition += (direction * remainingSpace);
        } else if (this.align == isc.Canvas.CENTER) {
            nextMemberPosition += (direction * Math.round(remainingSpace/2));
        }
    }

    // start position of all members on breadth axis
    var defaultOffset = vertical ? layoutLeft + this._leftMargin : 
                                   layoutTop  + this._topMargin,
        lastMemberHadResizeBar = false,
        lastMemberWasResizeBar = false,
        lastMemberWasHidden = false,
        membersMarginPending = false,
        numHiddenMembers = 0;
        
	for (var i = 0; i < members.length; i++) {
        var member = members[i],
            isResizeBar = isc.isA.LayoutResizeBar(member),
            shouldIgnore = this._shouldIgnoreMember(member),
            // NOTE: layoutInfo is optional, only used for reporting purposes when stackMembers is
            // called as part of a full layoutChildren run
            memberInfo = layoutInfo ? layoutInfo[i] : null;
        // margin before the member / room for resizeBar
        if (i == 0) {
            // first element is preceded by the outer margin of the layout as a whole.  
            // NOTE: the last element is implicitly followed by the outer margin because space
            // for it is subtracted before we determine sizes.
            var startMargin;
            if (vertical) startMargin = (reverse ? this._bottomMargin : this._topMargin);
            else          startMargin = (reverse ? this._rightMargin  : this._leftMargin);
            nextMemberPosition += (direction * startMargin);  
        } else {
            // if the last member showed a resizeBar, leave room for it
            if (lastMemberHadResizeBar) {
                nextMemberPosition += (direction * this.resizeBarSize);

            // otherwise leave membersMargin (avoid stacking margins if a member is hidden)
            
            } else if (!lastMemberWasHidden && !lastMemberWasResizeBar && !isResizeBar) {
                if (shouldIgnore) membersMarginPending = true;
                else nextMemberPosition += (direction * this.membersMargin);

            // convert membersMarginPending, if still set, into a membersMargin
            } else if (lastMemberWasHidden && !isResizeBar && membersMarginPending) {
                nextMemberPosition += (direction * this.membersMargin);               
                membersMarginPending = false;
            }
        }
        
        //>Animation
        // Avoid interrupting animations in progress with any kind of move
        var animating = member.isAnimating(this._moveAnimations); //<Animation 
        
        // skip hidden members
        if (shouldIgnore) {
            
            if (!this.isIgnoringMember(member)
                //>Animation
                && !animating   //<Animation
               ) {
                member.moveTo(layoutLeft + this._leftMargin, layoutTop + this._topMargin);
            }
            // if a hidden member has a resizeBar (it was previously visible) leave the
            // resizeBar showing, and place it properly
            if (member._computedShowResizeBar) {
                var breadth = this.getBreadth() - this._getBreadthMargin();
                this.makeResizeBar(member, defaultOffset, nextMemberPosition, breadth);
                lastMemberHadResizeBar = true;
                membersMarginPending = false;
            } else {
                if (member._resizeBar != null) member._resizeBar.hide();
                lastMemberHadResizeBar = false;
            }
            lastMemberWasResizeBar = isResizeBar;
            lastMemberWasHidden = true;
            numHiddenMembers++;
            continue;
        } else {
            lastMemberWasHidden = false;
        }

        // handle alignment (default is left/top)
        var offset = defaultOffset,
            layoutAlign = this.getLayoutAlign(member)
        ;
        // if RTL mode is active with scrolling overflow, shift the breadth alignment baseline
        if (this.isRTL() && vertical && (overflow == Canvas.AUTO || overflow == Canvas.SCROLL))
        {
            var breadthOverflow = centerBreadth - specifiedBreadth;
            if (breadthOverflow > 0) offset -= breadthOverflow;
        }

        // NOTE: the centerBreadth properly subtracts out layoutMargins
        if (layoutAlign == Canvas.RIGHT || layoutAlign == Canvas.BOTTOM) {
            offset += centerBreadth - this.getMemberBreadth(member);
        } else if (layoutAlign == Canvas.CENTER) {
            offset += Math.floor((centerBreadth - this.getMemberBreadth(member)) / 2);
        }
        if (this.getMemberOffset != null) {
            offset = this.getMemberOffset(member, offset, layoutAlign);
        }

        var memberLength = this.getMemberLength(member);
        //>Animation
        if (!animating) {//<Animation
        // move the member into position
		if (vertical) {
            if (!reverse) member.moveTo(offset, nextMemberPosition);
            else member.moveTo(offset, nextMemberPosition-memberLength);
        } else {
            if (!reverse) member.moveTo(nextMemberPosition, offset);
            else member.moveTo(nextMemberPosition-memberLength, offset);
        }
        
        //>Animation
        } //<Animation
 
        // next member will be placed after this one
        nextMemberPosition += (direction * memberLength);
        // leave extra space on a member-by-member basis
        nextMemberPosition += (direction * this.getMemberGap(member));
		
        // show a resize bar for members that request it
        if (member._computedShowResizeBar) {
            var breadth = this.getBreadth() - this._getBreadthMargin();
            this.makeResizeBar(member, defaultOffset, nextMemberPosition, breadth);
        } else {
            // ensure we hide the resizebar for any hidden members.
            if (member._resizeBar != null) member._resizeBar.hide();
        }
        lastMemberHadResizeBar = member._computedShowResizeBar;
        lastMemberWasResizeBar = isResizeBar;

        // update memberSizes.  NOTE: this is only necessary when we have turned off the sizing
        // policy are doing stackMembers() only
        if (updateSizes) this.memberSizes[i - numHiddenMembers] = memberLength;

        // record length for reporting if being called as part of layoutChildren
        if (layoutInfo) memberInfo._visibleLength = memberLength;
	}
    // trim memberSizes to the currently visible members.  NOTE: this is only necessary when we have
    // turned off the sizing policy are doing stackMembers() only
    if (updateSizes) this.memberSizes.length = (i - numHiddenMembers);
    
    // Ensure that the reported scroll-size matches the scrollable area of this layout.
    if (overflow != isc.Canvas.VISIBLE) this._enforceScrollSize();

    this._enforceStackZIndex();
},

// determine the breadth axis alignment per member.
getLayoutAlign : function (member) {
    if (member.layoutAlign != null) return member.layoutAlign;
    if (this.defaultLayoutAlign != null) return this.defaultLayoutAlign;
    return this.vertical ? (this.isRTL() ? isc.Canvas.RIGHT : isc.Canvas.LEFT) 
                          : isc.Canvas.TOP;
},


_enforceScrollSize : function () {
    
    var breadthLayoutMargin,
        lengthLayoutMargin,
        hasMargin = false, spacerForcesOverflow = false,
        
        lastMember, 
        member, 
        scrollBottom, scrollRight, vertical = this.vertical;

    // convert null margins to zero so we don't need to worry about doing math with them
    if (vertical) {
        lengthLayoutMargin = this._bottomMargin || 0;
        breadthLayoutMargin = this._rightMargin || 0;
    } else {
        lengthLayoutMargin = this._rightMargin || 0;
        breadthLayoutMargin = this._bottomMargin || 0;
    }
    
    if (lengthLayoutMargin > 0 || breadthLayoutMargin > 0) hasMargin = true; 
    
    var innerWidth = this.getInnerWidth(),
        innerHeight = this.getInnerHeight();

    // If we have layout margins that cause scrolling, we need to find the bottom (or right) 
    // of the last member, and the right (or bottom) of the broadest member to enforce scroll 
    // size.
    // In this case just iterate through every member to find our broadest member.
    if (hasMargin) {
        for (var i = this.members.length-1 ; i >= 0; i--) {
            member = this.members[i];
            if (!member.isVisible()) continue;
            
            if (vertical) {
                if (lastMember == null) {
                    lastMember = member;            
                    scrollBottom = member.getTop() + member.getVisibleHeight();
                }
    
                var right = member.getLeft() + member.getVisibleWidth();
                if (scrollRight == null || scrollRight < right) scrollRight = right;
                    
            } else {
                if (lastMember == null) {
                    lastMember = member;
                    scrollRight = member.getLeft() + member.getVisibleWidth();
                }
                
                var bottom = member.getTop() + member.getVisibleHeight();
                if (scrollBottom == null || scrollBottom < bottom) scrollBottom = bottom;
            }
        }
        
        // If we had no visible members we still need a valid scrollBottom/scrollLeft 
        // to enforce, or we'll end up trying to math on null values 
        if (scrollBottom == null) scrollBottom = 0;
        if (scrollRight == null) scrollRight = 0;

    // if we have no layout margins, we will only need to enforce scrollSize if our last member
    // is a layout spacer and/or our broadest member is a layout spacer (and is wider than
    // this.innerWidth
    // In this case, for efficiency, iterate through our members array checking for a layout 
    // spacer at the end, or one that effects the broadness of the content.
    // Then, iff we found a layoutSpacer that effects the broadness of the content, iterate
    // through all the other members to determine whether it's the broadest member in the 
    // layout - as we may be able to avoid enforcing scroll size.
    } else {
        var spacerBreadthOverflow = false;
        for (var i = this.members.length-1 ; i >= 0; i--) {
            var member = this.members[i];
            if (isc.isA.LayoutSpacer(member) && member.isVisible()) {
                var width = member.getWidth(), height = member.getHeight();
                
                // spacer at end - always have to enforce overflow
                if (i == this.members.length-1) {
                    spacerForcesOverflow = true;
                    if (vertical) scrollBottom = member.getTop() + height;
                    else scrollRight = member.getLeft() + width;
                }
                // Otherwise only if we have a layout spacer member that is the widest member
                // and exceeds the available space
                if (vertical) {
                    if(width > innerWidth && (scrollRight == null || width > scrollRight)) {
                        spacerBreadthOverflow = true;
                        scrollRight = width;
                    }
                } else if (height > innerHeight && 
                          (scrollBottom == null || height > scrollBottom)) {
                    spacerBreadthOverflow = true;
                    scrollBottom = height;
                }
            }
        }
        
        // if spacerBreadthOveflow is true, we have a spacer that may be the widest member of
        // this layout.
        // If our last member is a layout spacer we know we have to enforce scroll size
        // - otherwise iterate through the members array again checking the widths of all
        //   non-layoutSpacer members to determine whether this is the widest member.
        
        if (spacerBreadthOverflow && !spacerForcesOverflow) {
            for (var i = this.members.length-1 ; i >= 0; i--) {
                var member = this.members[i];
                if (isc.isA.LayoutSpacer(member)) continue;
                
                if (this.vertical) {
                    var width = member.getVisibleWidth();
                    if (width >= scrollRight) {
                        spacerBreadthOverflow = false;
                        break;
                    }
                } else {
                    var height = member.getVisibleHeight();
                    if (height >= scrollBottom) {
                        spacerBreadthOverflow = false;
                        break;
                    }
                }
            }
            
            // at this point if spacerBreadthOverflow is true we need to enforce scroll breadth
            if (spacerBreadthOverflow) spacerForcesOverflow = true;
        }
        
        if (spacerForcesOverflow) {
            // Ensure we have a non-null position on both axes.
            // May not be the case if spacers only cause overflow in one direction.
            if (scrollRight == null) scrollRight = 1;
            if (scrollBottom == null) scrollBottom = 1;
        } 

    } 

    if (spacerForcesOverflow || hasMargin) {
        if (this.vertical) {
            scrollRight += breadthLayoutMargin;
            scrollBottom += lengthLayoutMargin;
        } else {
            scrollRight += lengthLayoutMargin;
            scrollBottom += breadthLayoutMargin;
        }
        this.enforceScrollSize(scrollRight, scrollBottom);
    }
    else this.stopEnforcingScrollSize();
    
},


// Override setOverflow:
// we only need to write out scroll-sizing divs iff we're not overflow visible (so need to be
// able to natively scroll to the bottom right even if we have no true HTML content there).
setOverflow : function (newOverflow, a, b, c, d) {
    var oldOverflow = this.overflow;
    if (oldOverflow == isc.Canvas.VISIBLE && newOverflow != isc.Canvas.VISIBLE) {
        this._enforceScrollSize();
    } else if (oldOverflow != isc.Canvas.VISIBLE && newOverflow == isc.Canvas.VISIBLE) {
        this.stopEnforcingScrollSize();
    }
    return this.invokeSuper(isc.Layout, "setOverflow", newOverflow, a, b, c, d);
},


//>	@method	layout.layoutChildren() [A]
// Size and place members according to the layout policy.
//<	
layoutChildren : function (reason, deltaX, deltaY) {
    if (isc._traceMarkers) arguments.__this = this;

    // avoid doing a bunch of Layout runs as we blow away our members during a destroy()
    if (this.destroying) return;
 
    if (this._reflowCount == null) this._reflowCount = 1;
    else this._reflowCount++;
   
    
    if (!this.members) this.members = [];

    // mimic the superclass Canvas.layoutChildren() by resolving percentage sizes, but only for
    // percent sizes the layout doesn't specially manage.
    // Non-member children always interpret percents themselves.  
    // However, if we have length policy:"fill", percentages specified for the length axis on 
    // members have special meaning, and the member should not interpret them itself.
    // Likewise breadth-axis percentages when breadthPolicy is "fill" (handled in 
    // shouldAlterBreadth()
    if (this.children && this.children.length) {
        for (var i = 0; i < this.children.length; i++) {
            this._resolvePercentageSizeForChild(this.children[i]);
        }
    }

    // don't layoutChildren() before draw() unless layoutChildren() is being called as part of
    // draw()
    if (!this.isDrawn() && reason != this._$initial_draw) return;

    // set a flag that we are doing layout stuff, so that we can ignore when we're notified that a
    // member has been resized
    var layoutAlreadyInProgress = this._layoutInProgress;
    this._layoutInProgress = true;

    if (deltaX != null || deltaY != null) {
        // since deltaX or deltaY was passed, we're being called from Canvas.resizeBy()

        // if we are resized on the breadth axis, set a marker so we know that we may have to
        // resize members on the breadth axis
        if ((this.vertical && isc.isA.Number(deltaX)) || 
            (!this.vertical && isc.isA.Number(deltaY)))
        {   
            this._breadthChanged = true;
        }
    }

    if (this.isDrawn() && this.getLengthPolicy() == isc.Layout.NONE && !this._breadthChanged) {
        if (this.logIsInfoEnabled(this._$layout)) {
            this.logInfo("Restacking, reason: " + reason, this._$layout);
        }

        
        this.stackMembers(this.members);
        
        this._breadthChanged = false;
        this._layoutChildrenDone(reason, layoutAlreadyInProgress);
        return;
    //} else {
    //    this.logWarn("couldn't take shortcut, policy: " + this.getLengthPolicy() + 
    //                 ", breadthChanged: " + this._breadthChanged); 
    }
    this._breadthChanged = false;

    

    

    // get the amount the total amount of space available for members (eg, margins and room for
    // resizeBars is subtracted off)
    var totalSpace = this.getTotalMemberSpace()

    if (this.manageChildOverflow) this._suppressOverflow = true;
    //StackDepth draw() from here instead of having resizeMembers do it, to avoid stack
    
    var drawnInline = [];

    var minBreadthMember = this.getMember(this.minBreadthMember);
    if (minBreadthMember) {
        if (!minBreadthMember.isDrawn()) {
            this._moveOffscreen(minBreadthMember);
            minBreadthMember.draw();
            drawnInline[0] = minBreadthMember;
        }
        // cache minBreadthMember and its index for efficiency
        this._minBreadthIndex = this.members.indexOf(minBreadthMember);
        this._minBreadthMember = minBreadthMember;
    } else {
        delete this._minBreadthIndex;
        delete this._minBreadthMember;
    }

	for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        
        if (this._canAdaptLength(member) && !member.allowAdaptSizeBeforeDraw &&
            !member.isDrawn())
        {
            this._moveOffscreen(member);
            member.draw();
            drawnInline[drawnInline.length] = member;
        }
        // default member minHeight that hasn't been set explicitly
        if (member.minHeight == null && member._getDefaultMinHeight) {
            member.minHeight = member._getDefaultMinHeight();
        }
    }
    
    
    if (this.manageChildOverflow && drawnInline.length > 0) {
        this._completeChildOverflow(drawnInline);
    }
    // reset the drawnInline array
    drawnInline = [];

    // Determine the sizes for the members
    var sizes = this._getMemberSizes(totalSpace),
        
        layoutInfo = this._layoutInfo;

    // size any members that can overflow
    this.resizeMembers(sizes, layoutInfo, true);

    if (this.manageChildOverflow) this._suppressOverflow = true;
    //StackDepth draw() from here instead of having resizeMembers do it, to avoid stack

    
	for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];

        if (member._needsDraw) {
            this._moveOffscreen(member);
            member.draw();
            member._needsDraw = null;
            drawnInline[drawnInline.length] = member;
        }
    }
    if (this.manageChildOverflow && drawnInline.length > 0) {
        this._completeChildOverflow(this.members);
    }
    drawnInline = [];

    
    do {
        // gather sizes again, this time treating any members that can overflow as fixed size
        this._getMemberSizes(totalSpace, true, sizes, layoutInfo);

    } while (!this.resizeMembers(sizes, layoutInfo, true, true));

    // size all the rest of the members
    this.resizeMembers(this.memberSizes = sizes, layoutInfo, false);

    if (this.manageChildOverflow) this._suppressOverflow = true;
    //StackDepth draw() from here instead of having resizeMembers do it, to avoid stack
	for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        if (member._needsDraw) {
            this._moveOffscreen(member);
            member.draw();
            member._needsDraw = null;
            
            drawnInline[drawnInline.length] = member;
        }
    }
    // At this point the only newly drawn members would be ones that were overflow
    // hidden.
    // Complete their 'adjustOverflow' now.
    
    if (this.manageChildOverflow && drawnInline.length > 0) {
        this._completeChildOverflow(this.members);
    }

    // stack the members
    this.stackMembers(this.members, layoutInfo);

    // report what happened
    this.reportSizes(layoutInfo, reason);

    this._layoutChildrenDone(reason, layoutAlreadyInProgress);
},

// Helper broken out from HTMLInit to call '_completeChildOverflow()' on this.children
// if appropriate.

_completeChildrenOverflowOnHTMLInit : function () {
    if (this.manageChildOverflow && this.children != null &&
        (this.parentElement == null || !this.parentElement._suppressOverflow)) 
    {
        // We only care about non-member children here - we already adjusted overflow
        // for members during layoutChildren.
        var nonMemberChildren = [];
        if (this.members && (this.members.length < this.children.length)) {
            for (var i = 0; i < this.children.length; i++) {
                if (this.members.indexOf(this.children[i]) == -1) {
                    nonMemberChildren.add(this.children[i]);
                }
            }
        }
        this._completeChildOverflow(nonMemberChildren);
    }
},

_resolvePercentageSizeForChild : function (child) {
    var childManaged = this.members.contains(child) && !this._shouldIgnoreMember(child);

    
    if (childManaged && this.snapTo == null) {
        var percentWidth, percentHeight,
            fillLength  = this.getLengthPolicy()  == isc.Layout.FILL,
            fillBreadth = this.getBreadthPolicy() == isc.Layout.FILL
        ;
        if (this.vertical) {
            percentWidth  = fillBreadth ? null : child._percent_width;
            percentHeight = fillLength  ? null : child._percent_height;
        } else {
            percentWidth  = fillLength  ? null : child._percent_width;
            percentHeight = fillBreadth ? null : child._percent_height;
        }
        // call setRect() if if we've still got percentages to apply the member
        if (child._percent_left || child._percent_top || percentHeight || percentWidth) {
            child.setRect(child._percent_left, child._percent_top, percentWidth, percentHeight);
        }
    }
    // run snapTo/percent resolution on unmanaged layout children
    
    if (isc.isA.Canvas(child)) child.parentResized(childManaged);
},

// get list of "canAdapt" members, ordered by priority
_getCanAdaptLengthMembers : function (surplus) {
    var list = [];

    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        if (this._canAdaptLength(member)) {
            list.add(member);
            member._memberIndex = i;
        }
    }

    // numerically higher priorities get offered surplus space first,
    // and asked last to surrender space in the event of an overflow 
    list.sortByProperty(this.vertical ? "adaptiveHeightPriority" : 
                                        "adaptiveWidthPriority", !surplus);

    if (this.logIsInfoEnabled(this._$adaptMembers)) {
        var direction = surplus ? "descending" : "ascending";
        this.logInfo("found " + list.length + " size-adaptable members (" + direction + "): " +
            list.map(function(member) { return member.getID(); }), this._$adaptMembers);
    }
    return list;
},

// calculate the initial amount of remaining space to offer to "canAdapt" members
_getRemainingSpace : function (sizes, totalSize, commonMinSize) {
    var results = this.getClass()._calculateStaticSize(sizes, sizes, totalSize, this),
        vertical = this.vertical,
        staticSize = results.staticSize,
        stretchCount = results.starCount + results.percentCount;

    // minimum stretch-member sizes
    if (this.useOriginalStretchResizePolicy || this.ignoreStretchResizeMemberSizeLimits) {
        // if we're not enforcing per-member minimums, then the minimum size for each stretch-
        // member is just the single common value passed in, so it's scaled by the # of members
        staticSize += stretchCount * commonMinSize;
    } else {
        // add per-member minimum for each stretch member still prssent in the size policy array
        for (var i = 0; i < sizes.length; i++) {
            if (isc.Canvas.isStretchResizePolicy(sizes[i])) {
                var member = this.members[i],
                    minSize = vertical ? member.minHeight : member.minWidth;
                staticSize += Math.max(minSize, commonMinSize);
            }
        }
    }
        
    var remainingSpace = totalSize - staticSize;

    if (this.logIsInfoEnabled(this._$adaptMembers)) {
        this.logInfo("Layout._getRemainingSpace(): remaining space is " + remainingSpace +
                     " after reserving minimums for " + stretchCount + " stretch members",
                     this._$adaptMembers);
    }
    return remainingSpace;
},


_revertOverflowedStretchSizedPolicyLengths : function (layoutInfo, sizes) {
    for (var i = 0; i < this.members.length; i++) {
        var memberInfo = layoutInfo[i];
        if (isc.isA.String(memberInfo._overflowed)) {
            sizes[i] = memberInfo._policyLength = memberInfo._overflowed;
            delete memberInfo._overflowed;
        }
    }
    delete sizes.maxResizedIndex;

    if (this.logIsInfoEnabled(this._$adaptMembers)) {
        this.logInfo("Layout._revertOverflowedStretchSizedPolicyLengths(): " +
                     "overflowAsFixed processing has been reset for all affected members",
                     this._$adaptMembers);
    }
},
    
// convenience method to redirect instance calls to implementation at class level
applyStretchResizePolicy : function (sizes, totalSize, minSize, modifyInPlace) {
    var thisClass = this.getClass(),
        policy = this.useOriginalStretchResizePolicy ? thisClass.applyStretchResizePolicy :
                                                    thisClass.applyNewStretchResizePolicy;
        return policy.call(thisClass, sizes, totalSize, minSize, modifyInPlace, this);
},

adaptMembersToSpace : function (sizes, totalSpace, overflowAsFixed, layoutInfo) {

    var adapted = false,
        vertical = this.vertical,
        commonMinLength = Math.max(this.minMemberSize, this.minMemberLength),
        remainingSpace = this._getRemainingSpace(sizes, totalSpace, commonMinLength)
    ;

    var adaptiveMembers = this._getCanAdaptLengthMembers(remainingSpace > 0);
    for (var i = 0; i < adaptiveMembers.length; i++) {
        // bail out if nothing to offer
        if (remainingSpace == 0) break;

        var member = adaptiveMembers[i],
            adaptLengthBy = vertical ? member.adaptHeightBy : member.adaptWidthBy
        ;
        // just skip the member if no function is present
        if (!isc.isA.Function(adaptLengthBy)) {
            this.logWarn("adaptMembersToSpace(): member " + member.getID() +
                " specified as canAdaptWidth/canAdaptHeight: true, but no " +
                "corresponding adaptWidthBy/adaptHeightBy() function is present",
                this._$adaptMembers);
            continue;
        }

        
        delete member._acceptedAdaptOffer;

        // query and react to current canAdaptWidth/Height member
        

        var index = member._memberIndex, 
            deltaLength, length = sizes[index],
            canOverflow = this._overflowsLength(member),
            lastAdaptedLength = member._lastAdaptedLength,
            passAdaptedLength = !canOverflow && 
                isc.Canvas._isStretchSize(this._explicitLength(member))
        ;
        if (passAdaptedLength && lastAdaptedLength) {
            deltaLength = adaptLengthBy.call(member, remainingSpace + 
                              length - lastAdaptedLength, lastAdaptedLength, !overflowAsFixed);
        } else {
            deltaLength = adaptLengthBy.call(member, remainingSpace, length, !overflowAsFixed,
                                             layoutInfo[index]._overflowed);
        }            

        // only numerical results are valid
        if (!isc.isA.Number(deltaLength)) {
            this.logWarn("adaptMembersToSpace(): ignoring nonsense value " + deltaLength +
                         " returned from adaptWidthBy/adaptHeightBy() by member " +
                         member.getID(), this._$adaptMembers);
            continue;
        }

        // translate user's requested deltaLength back to an offset from the current length
        if (passAdaptedLength && lastAdaptedLength) deltaLength += lastAdaptedLength - length;

        // member rejects proposal; nothing to do
        if (deltaLength == 0) {
            if (passAdaptedLength) member._lastAdaptedLength = length;
            if (this.logIsInfoEnabled(this._$adaptMembers)) {
                this.logInfo("adaptMembersToSpace(): member " + member.getID() + 
                    " has rejected offer of " + remainingSpace, this._$adaptMembers);
            }
            continue;
        }

        // don't allow an increase in length if there's no remaining space
        if (remainingSpace < 0 && deltaLength > 0) {
            this.logWarn("adaptMembersToSpace(): ignoring request for " + deltaLength + " px " +
                "returned from adaptWidthBy/adaptHeightBy() by member " + member.getID() +
                " since no remaining space is available; no length increase is allowed",
                this._$adaptMembers);
            continue;
        }

        // for increases, don't let the response exceed the offer
        if (remainingSpace > 0 && deltaLength > remainingSpace) {
            this.logWarn("adaptMembersToSpace(): ignoring request for " + deltaLength + " px " +
                "returned from adaptWidthBy/adaptHeightBy() by member " + member.getID() +
                " since it exceeds offer of " + remainingSpace,
                this._$adaptMembers);
            continue;
        }

        // enforce minimum member length
        var minLength = Math.max(commonMinLength, vertical ? member.minHeight : 
                                                             member.minWidth);
        if (length + deltaLength < minLength) {
            this.logWarn("adaptMembersToSpace(): ignoring request for " + deltaLength + " px " +
                         "returned from adaptWidthBy/adaptHeightBy() by member " +
                         member.getID() + " since it would reduce member length below " +
                         "minimum of " + minLength, this._$adaptMembers);
            continue;
        }
        
        // enforce maximum member length
        var maxLength = vertical ?  member.maxHeight : member.maxWidth;
        if (length + deltaLength > maxLength) {
            this.logWarn("adaptMembersToSpace(): ignoring request for " + deltaLength + " px " +
                         "returned from adaptWidthBy/adaptHeightBy() by member " +
                         member.getID() + " since it would increase member length above " +
                         "maximum of " + maxLength, this._$adaptMembers);
            continue;
        }

        var originalRemainingSpace = remainingSpace;

        if (this.logIsInfoEnabled(this._$adaptMembers)) {
            this.logInfo("adaptMembersToSpace(): member " + member.getID() + " has accepted " +
                         "offer of " + deltaLength + "(" + remainingSpace + " offered) pixels", 
                         this._$adaptMembers);
        }
        member._acceptedAdaptOffer = deltaLength;
        sizes[index]              += deltaLength;
        remainingSpace            -= deltaLength;
        adapted = true;

        // user's length change granted - update cached adapted length
        if (passAdaptedLength) member._lastAdaptedLength = sizes[index];
        else if (canOverflow) delete member._lastAdaptedLength;

        
        if (originalRemainingSpace < 0 && remainingSpace > 0) return remainingSpace;
    }

    return null;
},

// get target sizes for members, by gathering current sizes and applying stretchResizePolicy
_getMemberSizes : function (totalSpace, overflowAsFixed, sizes, layoutInfo) {

    // re-use an Array for storing gathered and calculate sizes.  Note this must be
    // per-instance as child widgets may be Layouts
    if (!sizes) {
        sizes = this._sizesArray;
        if (sizes == null) sizes = this._sizesArray = [];
        else sizes.length = this.members.length;
    }
        
    // Note: overflowAsFixed implies we're running a second pass through this method 
    // In this case some of the sizes and layoutInfo passed in are up to date and will
    // be used by gatherSizes()

    // gather sizes for the members
    layoutInfo = this.gatherSizes(overflowAsFixed, layoutInfo, sizes);

	// apply the sizing policy
    this._getPolicyLengths(sizes, layoutInfo);

    // fit the adaptive-size members to the available space
    
    if (this.adaptMembersToSpace(sizes, totalSpace, overflowAsFixed, layoutInfo) && 
        overflowAsFixed) 
    {
        this._revertOverflowedStretchSizedPolicyLengths(layoutInfo, sizes);
    }
        
    
    return this.applyStretchResizePolicy(sizes, totalSpace,
        Math.max(this.minMemberSize, this.minMemberLength), true);
},

//StackDepth this strange factoring is to avoid a stack frame
_layoutChildrenDone : function (reason, layoutAlreadyInProgress) {

    this._willScrollLength = null;

    // the layout is now up to date and any changes we see from here on, we need to respond to
    this._layoutIsDirty = false;
    this._layoutInProgress = layoutAlreadyInProgress;


    // if moving and resizing of children has marked us as needing an adjustOverflow, run it
    // now.  Otherwise, it will run after a timer, and if we change size our parent will only
    // react to it after yet another timer, and the browser may repaint in the meantime,
    // creating too much visual churn.
    // However, we shouldn't attempt to adjustOverflow() now if the _suppressAdjustOverflow
    // flag is set because the _overflowQueued flag will be cleared, but adjustOverflow() will
    // no-op.
    if (this._overflowQueued && !this._suppressAdjustOverflow && this.isDrawn() &&
        // NOTE: adjustOverflow can call layoutChildren for eg scroll state changes, don't call
        // it recursively.  
        !this._inAdjustOverflow && 
        // Also don't call it when we're resized, because resizing does an immediate
        // adjustOverflow anyway (unless we're redrawOnResize, in which it will be delayed and
        // *we* should do an immediate adjustOverflow)
        (reason != "resized" || this.shouldRedrawOnResize())) 
    {
        if (this.notifyAncestorsOnReflow && this.parentElement != null) {
            this.notifyAncestorsAboutToReflow();
        } 
        //this.logWarn("calling adjustOverflow, reason: " + reason);
        this.adjustOverflow();
        if (this.notifyAncestorsOnReflow && this.parentElement != null) {
            this.notifyAncestorsReflowComplete();
        } 
    }

    // if we're not continuously enforcing the layout policy, set the policy to none
    if (!this.enforcePolicy) {
        this.vertical ? this.vPolicy = isc.Layout.NONE : this.hPolicy = isc.Layout.NONE;
    }
},

_getPolicyLengths : function (sizes, layoutInfo) {
    for (var i = 0; i < layoutInfo.length; i++) {
        sizes[i] = layoutInfo[i]._policyLength;
    }
},


_isSizesValidForMember : function (sizes, index) {
    var maxResizedIndex = sizes.maxResizedIndex;
    if (maxResizedIndex == null) return true;
    var minBreadthIndex = this._minBreadthIndex;
    return index == minBreadthIndex ? true : index <= maxResizedIndex;
},

//> @method layout.getMemberSizes()
// 
// @return (Array) array of member sizes
// @visibility external
//<
getMemberSizes : function () { 
    // callable publicly, so we clone
    if (this.memberSizes) return this.memberSizes.duplicate();
    return this.memberSizes;
},


getScrollWidth : function (calcNewValue) {
    if (isc._traceMarkers) arguments.__this = this;

    // handle deferred adjustOverflow
    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("widthCheckWhileDeferred");
    }
    
    // size caching: adjustOverflow needs the old value of scrollWidth/scrollHeight in order to
    // correctly fire resized(), which is cached by the default
    // getScrollHeight()/getScrollWidth() methods, hence anyone who overrides those methods
    // needs to leave a cached value around.
    if (!calcNewValue && this._scrollWidth != null) return this._scrollWidth;

    // NOTE: we can have non-member children, but if so the margin isn't added to them, so we
    // need to calculate member and non-member size separately
    var childrenSize = this.children ? this._getWidthSpan(this.children, true) : 0,
        membersSize = this.members ? this._getWidthSpan(this.members, true) : 0,
        rightMargin = isc.isA.Number(this._rightMargin) ? this._rightMargin : 0,    
    // NOTE: tacking margins onto the furthest right/bottom member implies that we are willing
    // to overflow specified size in order to maintain the right/bottom margin, which is the
    // intent.
    
        scrollSize = this.isRTL() && this.overflow != isc.Canvas.VISIBLE 
                        ? Math.max(childrenSize, membersSize) 
                        : Math.max(childrenSize, membersSize + rightMargin);

    if (this.overflow == isc.Canvas.VISIBLE &&
        this.useClipDiv && !this._willSuppressOuterDivPadding(false, true)) 
    {
        scrollSize += isc.Element._getHPadding(this.styleName);

    }
    
//     this.logWarn("childrenSize: " + childrenSize + ", memberSize: " + membersSize +
//                  ", _rightMargin: " + this._rightMargin + this.getStackTrace());
    
    return (this._scrollWidth = scrollSize);
},

getScrollHeight : function (calcNewValue) {
    if (isc._traceMarkers) arguments.__this = this;

    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("heightCheckWhileDeferred");
    }

    if (!calcNewValue && this._scrollHeight != null) return this._scrollHeight;

    var childrenSize = this.children ? this._getHeightSpan(this.children, true) : 0,
        membersSize = this.children ? this._getHeightSpan(this.members, true) : 0,
        bottomMargin = isc.isA.Number(this._bottomMargin) ? this._bottomMargin : 0,
        scrollSize = Math.max(childrenSize, membersSize + bottomMargin);

    return (this._scrollHeight = scrollSize);
},

// Rerunning layout
// --------------------------------------------------------------------------------------------

//> @method layout.layoutIsDirty() [A]
// Returns whether there is a pending reflow of the members of the layout.
// <P>
// Modifying the set of members, resizing members or changing layout settings will cause a
// recalculation of member sizes to be scheduled.  The recalculation is delayed
// so that it is not performed redundantly if multiple changes are made in a row.  
// <P>
// To force immediate recalculation of new member sizes and resizing of members, call
// +link{reflowNow()}.
// 
// @return (boolean) whether the layout is currently dirty
// @visibility external
//<
layoutIsDirty : function () {
	return this._layoutIsDirty == true;
},


//>	@method	layout.reflow() [A]
// Layout members according to current settings.
// <P>
// Members will reflow automatically when the layout is resized, members resize, the list of
// members changes or members change visibility.  It is only necessary to manually call
// <code>reflow()</code> after changing settings on the layout, for example,
// <code>layout.reverseOrder</code>.
//
// @param [reason] (String) reason reflow() had to be called (appear in logs if enabled)
//
// @visibility external
//<
reflow : function (reason) {
	// if we're already dirty, we've already set a timer to re-layout
	if (this._layoutIsDirty) return;

	if (this.isDrawn()) {
		this._layoutIsDirty = true;
        if (this.instantRelayout) {
            //isc.logWarn("reflowing NOW");
            this.layoutChildren(reason);
        } else {
            isc.Layout.reflowOnTEA(this, reason);
        }
	}
},	

//> @method layout.reflowNow() [A]
// Layout members according to current settings, immediately.
// <br>
// Generally, when changes occur that require a layout to reflow (such as members being shown
// or hidden), the Layout will reflow only after a delay, so that multiple changes cause only
// one reflow.  To remove this delay for cases where it is not helpful, reflowNow() can be
// called.
// @visibility external
//<
reflowNow : function (reason, reflowCount) {

    // No need to reflow if we're undrawn
    
    if (!this.isDrawn()) return;

    if (reflowCount != null && reflowCount < this._reflowCount) return;
    this.layoutChildren(reason);
},

// If a user is resizing a widget via a drag (or a drag on resizeBar, etc), we want to
// allow the dragged edge to resize to the expected mouse position and keep the other
// edge still. This means fixing (freezing) the sizes of any prior members that previously had
// percent/"*" sizes.
fixLayoutOnMemberResize:true,
// This notification is fired from a canDragResize:true member, or from a target
// resize (drag from resizeBar / sectionStack section header)
_childResizingOnDragStart : function (child, resizeEdge) {
    if (!this.fixLayoutOnMemberResize) return this.Super("_childResizingOnDragStart", arguments);
    if (this.members.contains(child)) {
        var forward = this.vertical ? resizeEdge.contains("B") : resizeEdge.contains("R");

        // If we're dragging from the leading edge (bottom or right), we want to fix sizes
        // of prior members so the top edge stays still and the bottom edge ends up whereever
        // the user releases the mouse
        
        if (forward) {
            for (var i = 0; i < this.members.indexOf(child); i++) {
                var priorMember = this.members[i];

                if (this._memberWillResizeOnReflow(priorMember)) {
                    priorMember.updateUserSize(
                        this.vertical ? priorMember.getHeight() : priorMember.getWidth(),
                        this.vertical ? "height" : "width",
                        "Fixing other member sizes for drag resize"
                    );
                    
                }
            }

        }
    }

},


// Helper to determine whether a member will resize to fill the available space on 
// reflow when gatherSizes runs
// Returns true if size was set to an explicitly variable value ("*" / percentage), or
// if our layout-policy should impact the member in question.

_memberWillResizeOnReflow : function (member) {

    if (this._memberPercentLength(member) != null) return true;
    var length = this._explicitLength(member);
    if (length != null) {
        return length == "*";
    } else {
        var policy = this.getLengthPolicy();
        return (policy == "fill" ? !this.memberHasInherentLength(member) : false);
    }

},



// when a member resizes, rerun layout.
childResized : function (child, deltaX, deltaY, reason) {
    if (isc._traceMarkers) arguments.__this = this;
    
    // Ignore resize on the component mask
    if (this.componentMask == child) return;
    
    //>Animation
	var animatingShow = child.isAnimating(this._$show),
		animatingHide = child.isAnimating(this._$hide),
		animatingRect = child.isAnimating(this._$rect),
		animatingResize = child.isAnimating(this._$resize),
		animating = (animatingShow || animatingHide || animatingRect || animatingResize);

    // If this is an animated resize, and we have the flag to suppress member animation, just
    // finish the animation as it's too expensive to respond to every step.    
    if (this.suppressMemberAnimations && animating) {
    	child.finishAnimation(animatingShow ? this._$show : 
    							(animatingHide ? this._$hide : 
    								(animatingRect ? this._$rect : this._$resize)));
        return;
    }
    //<Animation
    
    this._markForAdjustOverflow("child resize");
    
    if (this._layoutInProgress) {
        return;
    }

    /*
    this.logWarn("child resize for: " + child + ", reason: " + reason + 
                 ", deltas: " + [deltaX, deltaY] +
                 ", percent sizes: " + [child._percent_width, child._percent_height] +
                 ", userSizes: " + [child._userWidth, child._userHeight] +
                 ", isMember: " + this.members.contains(child));
    */

    
    if (child._canvas_initializing) return;
	
    // non-member child, ignore
    if (!this.members.contains(child)) return;
    
    var member = child;
    
    
    if (reason != "overflow" && reason != "overflow changed" && 
        reason != "Overflow on initial draw") {
        
        if (deltaX != null && deltaX != 0) {
            member.updateUserSize(member._percent_width || member.getWidth(), 
                                  this._$width, reason);
        }
        if (deltaY != null && deltaY != 0) {
            member.updateUserSize(member._percent_height || member.getHeight(), 
                                  this._$height, reason);
        }
    }

    // If we're undrawn, no need to proceed
    
    if (this.getDrawnState() == isc.Canvas.UNDRAWN) {
        return;
    }
    
    var reflowReason = isc.SB.concat("memberResized: (", deltaX, ",", deltaY, "): ", member.getID()); 
    //>Animation
    if (animating) this.reflowNow(reflowReason);
    else //<Animation
        this.reflow(reflowReason);
},

_reportNewSize : function (oldSize, member, reason, isWidth) {
    if (!this.logIsDebugEnabled(this._$layout)) return;
    var newSize = isWidth ? member._userWidth : member._userHeight;
    if (newSize != oldSize) {
        this.logDebug("new user " + (isWidth ? "width: " : "height: ") + newSize +
                      " for member " + member + ", oldSize: " + oldSize + 
                      " reason: " + reason +
                      (this.logIsDebugEnabled("userSize") ? this.getStackTrace() : ""), 
                      "layout");
        
    }
},

// immediately handle change to user size - called from Canvas.updateUserSize()
childUserSizeChanged : function (member, name) {
    if (!this.hasMember(member)) return false;

    var isWidth = name == this._$width;
    if (this.isDrawn() && this.vertical != isWidth) {
        this.reflow(member.getID() + " set " + name + " to '*'");
    }
    return true;
},

// when a member changes visibility, rerun layout.
// XXX reacting to childVisibilityChanged isn't adequate when members aren't children
childVisibilityChanged : function (child, newVisibility, c,d,e) {
    if (!this.members.contains(child)) return;

    //this.logWarn("childVisChange: child: " + child + this.getStackTrace());

    // an undrawn hidden member that gets show()n needs to be drawn on the next reflow, so we
    // can't take the stacking-only shortcut in layoutChildren()
    if (!child.isDrawn()) this._breadthChanged = true;

    // NOTE: With our default strategy reflowing on a timer, members made visible this way will
    // appear briefly at the wrong location before reflow occurs.  However, we don't want to
    // fix this by always calling reflowNow(), because it means that several show()s in the
    // same thread would reflow multiple times unnecessarily.  Ideally, we could set a special
    // kind of action to reflow() at the end of the current thread rather than on a timer.
    // Code that does a series of show()s can work around this problem by calling reflowNow()
    // at the end.
    this.reflow("member changed visibility: " + child);
    // If the child was showing a resize bar, and the resizeBy shows closed/open state, 
    // update it's state
    var resizeBar = child._resizeBar;
    if (resizeBar == null || resizeBar.target != child) {
        resizeBar = null;
        var prevChild = this.members[this.members.indexOf(child)-1];
        if (prevChild && prevChild._resizeBar != null && prevChild._resizeBar.target == child) {
            resizeBar = prevChild._resizeBar;
        }
         
    }
    if (resizeBar != null && resizeBar.showGrip && resizeBar.showClosedGrip && resizeBar.label) {
        
        resizeBar.label.stateChanged();
    }
    this.invokeSuper(isc.Layout, "childVisibilityChanged", child, newVisibility, c,d,e);
},

pageResize : function () {
    
    var reflowCount = this._reflowCount;
    this.Super("pageResize", arguments);
    // If the default 'pageResize' implementation resized this canvas it will already have
    // reflowed our members - if this didn't occur explicitly reflow now.
    if (this.isDrawn() && 
        (this._reflowCount == null || reflowCount == this._reflowCount)) 
    {
        this.reflow("pageResize");
    }
},

// Sections
// ---------------------------------------------------------------------------------------
// Full declarative section support (including mutex visibility), is provided by the SectionStack
// subclass of Layout, but Layout supports manual instantiation of SectionHeaders
sectionHeaderClick : function (sectionHeader) {
    var section = sectionHeader.section;
    if (section == null) return;

    if (!isc.isAn.Array(section)) section = [section];

    var anyVisible = false;
    for (var i = 0; i < section.length; i++) {
        if (isc.isA.String(section[i])) section[i] = window[section[i]];
        // NOTE: individual members of the group may be hidden, eg by clicking on resizeBars.
        // Assume if any members of the group are visible, the group should be considered
        // visible and hence be hidden.
        if (section[i].visibility != "hidden") anyVisible = true;
    }
    if (anyVisible) {
        section.callMethod("hide");
        sectionHeader.setExpanded(false);
    } else {
        section.callMethod("show");
        sectionHeader.setExpanded(true);
    }
},

// Retrieving Members
// --------------------------------------------------------------------------------------------

//>	@method	layout.getMember()
// Given a numerical index or a member +link{canvas.name,name} or member +link{canvas.ID,ID},
// return a pointer to the appropriate member.  If passed a member Canvas, just returns it.
// <p>
// Note that if more than one member has the same <code>name</code>, passing in a
// <code>name</code> has an undefined result.
//
// @param memberID (String | int | Canvas) identifier for the required member
// @return (Canvas)  member widget
// @see getMemberNumber()
// @visibility external
//<	
getMember : function (member) {
    var index = this.getMemberNumber(member);
    if (index == -1) return null;
    return this.members[index];
},

//>	@method	layout.getMemberNumber()
// Given a member Canvas or member +link{canvas.ID,ID} or +link{canvas.name,name}, return the
// index of that member within this layout's members array.  If passed a number, just returns it.
// <p>
// Note that if more than one member has the same <code>name</code>, passing in a
// <code>name</code> has an undefined result.
//
// @param memberID (String | Canvas | int) identifier for the required member
// @return (int) index of the member canvas (or -1 if not found)
// @see getMember()
// @visibility external
//<	
getMemberNumber : function (member) {
    // String: assume global ID of widget
    if (isc.isA.String(member)) {
        var index = this.members.findIndex("name", member);
        if (index != -1) return index;
        
        member = window[member];
        return this.members.indexOf(member);

    // Widget: check members array
    } else if (isc.isA.Canvas(member)) {
        return this.members.indexOf(member);
    }
    // Number: return unchanged 
    if (isc.isA.Number(member)) return member;

    // otherwise invalid
    return -1;
},

//>	@method	layout.hasMember()
// Returns true if the layout includes the specified canvas.
// @param canvas (Canvas) the canvas to check for
// @return (Boolean) true if the layout includes the specified canvas
// @visibility external
//<	
hasMember : function (canvas) {
    
    var retValue = this.members.contains(canvas);
    
    return retValue;
},

//>	@method	layout.getMembers()  ([])
// Get the Array of members.
// <smartclient>
// <p>
// <b>NOTE</b>: the returned array should not be modified directly.  Use +link{addMember()} /
// +link{removeMember()} to add or remove members from the Layout.  Call
// +link{List.duplicate(),duplicate()} on the returned Array if you need a copy of the members
// array for some other purpose.
// </smartclient>
// @return (Array of Canvas) the Array of members
// @visibility external
//<
getMembers : function (memberNum) {
    return this.members;
},

//>	@method	layout.getMembersLength()  ([])
// Convenience method to return the number of members this Layout has
// @return (Integer) the number of members this Layout has
// @visibility external
//<
getMembersLength : function (memberNum) {
    if (!this.members) return 0;
    return this.members.length;
},

// Print HTML - ensure we print in member order
getPrintChildren : function () {
    var children = this.members;
    if (!children || children.length == 0) return;
    var printChildren = [];
    for (var i = 0; i < children.length; i++) {
        if (this.shouldPrintChild(children[i])) printChildren.add(children[i]);
    }
    return (printChildren.length > 0) ? printChildren : null;
},

// For HLayouts, render children inside a table so they're
// in a horizontal row.

_joinChildrenPrintHTML : function (childrenHTML) {
    if (childrenHTML != null && !this.vertical) {
        if (!isc.isAn.Array(childrenHTML)) childrenHTML = [childrenHTML];
        return "<table><tr><td>" + childrenHTML.join("</td><td>") + "</td></tr></table>";
    } else {
        return this.Super("_joinChildrenPrintHTML", arguments);
    }
},

// modify the getCompletePrintHTML function to write table-tags around the children HTML if
// appropriate
printFillWidth:true,
getCompletePrintHTMLFunction : function (HTML, callback) {
    // The HTML / callback params will be available due to JS closure
    var self = this;
    return function (childrenHTML) {
        self.isPrinting = false;
        var vertical = self.vertical || self.printVertical;
        if (isc.isAn.Array(childrenHTML) && childrenHTML.length > 0) {
            if (vertical) childrenHTML = childrenHTML.join(isc.emptyString);
            else {
                childrenHTML = "<TABLE" + 
                                (self.printFillWidth ? " WIDTH=100%>" : ">") +
                                "<TR><TD valign=top>" + 
                                childrenHTML.join("</TD><TD valign=top>") + "</TD></TR></TABLE>";
            }
        }
        if (childrenHTML) HTML[2] = childrenHTML;
        HTML = HTML.join(isc.emptyString);
        delete self.currentPrintProperties;
        if (callback) {
            self.fireCallback(callback, "html, callback", [HTML, callback]);
            return null;
        } else {
            //self.logWarn("completePrintHTML() - no callback, returning HTML");
            return HTML;
        }
    }
},

// Adding/Removing members
// --------------------------------------------------------------------------------------------

//>	@method	layout.addMember()  ([])
// Add a canvas to the layout, optionally at a specific position.
// <P>
// Depending on the layout policy, adding a new member may cause existing members to
// resize.
// <P>
// When adding a member to a drawn Layout, the layout will not immediately reflow, that is, the
// member will not immediately draw and existing members will not immediately resize.  This is 
// to allow multiple new members to be added and multiple manual resizes to take place without
// requiring layout members to redraw and resize multiple times.  
// <P>
// To force an immediate reflow in order to, for example, find out what size a newly added
// member has been assigned, call +link{reflowNow()}.
//
// @param newMember (Canvas) the canvas object to be added to the layout
// @param [position] (Integer) the position in the layout to place newMember (starts with 0);
//                            if omitted, it will be added at the last position
// @see addMembers()
// @visibility external
//<	
addMember : function (newMember, position, dontAnimate, callback) {
    this.addMembers(newMember, position, dontAnimate, callback);
    return this;
},

//>	@method	layout.addMembers() ([])
// Add one or more canvases to the layout, optionally at a specific position.  See
// +link{addMember()} for details.
//
// @param newMembers (Array of Canvas | Canvas) array of canvases to be added or single Canvas
// @param [position] (Number) position to add newMembers; if omitted newMembers will be added
//                            at the last position
// @visibility external
//<	
_singleArray : [],
_$membersAdded : "membersAdded",
addMembers : function (newMembers, position, dontAnimate, callback) {
    if (!newMembers) return;
    
    if (isc._traceMarkers) arguments.__this = this;
    
    //>Animation If we're in the process of a drag/drop animation, finish it up before
    // proceeding to remove members
    this._finishDropAnimation(); //<Animation

    if (this.logIsInfoEnabled(this._$layout)) {
        this.logInfo("adding newMembers: " + newMembers + 
                     (position != null ? " at position: " + position : ""),
                     "layout");
    }

    if (!isc.isAn.Array(newMembers)) {
        this._singleArray[0] = newMembers;
        newMembers = this._singleArray;
    }

    if (this.members == null) this.members = [];

    // if the position is beyond the end of the layout, clamp it to the last index.
    // This is an incorrect call, but happens easily if the calling code removes members before
    // adding.
    if (position > this.members.length) position = this.members.length;

    var layoutDrawn = this.isDrawn(),
        numSkipped = 0;
    var dups = this._checkMembersForDuplicates(newMembers);
    if (dups.length != 0) {
        this.logWarn("addMembers(): new members array contained the following component(s) multiple times:" + 
            dups + ". This is unsupported. Duplicate Canvas entries will be removed. " +
            "Duplicate LayoutSpacer entries will be replaced with new LayoutSpacers with the same dimensions.");

    }
    for (var i = 0; i < newMembers.length; i++) {
        
        var newMember = newMembers[i];

        // support sparse array
        if (!newMember) {
            ++numSkipped;
            continue;
        }

        // if the member is a (manually-created) LayoutResizeBar, initialize it now
        if (isc.isA.LayoutResizeBar(newMember)) this.initResizeBarMember(newMember);

        if (!isc.isAn.Instance(newMember)) {
            newMember = this.createCanvas(newMember);
        }
        if (!isc.isA.Canvas(newMember)) {
            this.logWarn("addMembers() unable to resolve member:" + this.echo(newMember) + 
                         " to a Canvas - ignoring");
            ++numSkipped;
            continue;
        }
        
        if (this.members.contains(newMember)) {
            // already a member; if a position was specified, move to that position
            if (position != null) {
                var d = i - numSkipped,
                    currentPos = this.members.indexOf(newMember),
                    newPos = position + d;
                
                if (currentPos < newPos) {
                    ++numSkipped;
                    --newPos;
                }
                this.members.slide(currentPos, newPos);
                
                // Shift the member in the page's tab order
                if (this.isDrawn()) this.updateMemberTabPosition(newMember);
                
            }
            continue; // but don't do anything else
        }
		// if the new member has snapTo set or is a peer, add it and continue
		
		if (newMember.addAsPeer || newMember.snapEdge) {
			this.addPeer(newMember, null, false);
            ++numSkipped;
			continue;
		} else if (newMember.addAsChild || newMember.snapTo) {
			this.addChild(newMember, null, false);
            ++numSkipped;
			continue;
		}
        // really a new member (not just changing positions)

        // deparent the member if it has a parent and clear() it if it's drawn.  This is key to
        // do before we begin resizing the member for this new Layout, otherwise:
        // - the old parent would receive childResized() notifications and may react
        // - if the member was drawn, we would pointlessly resize a DOM representation we are
        //   about to clear()
        
        if (newMember.parentElement !== this) {
            if (newMember.parentElement) newMember.deparent();
            if (newMember.isDrawn()) newMember.clear();
        }

        if (position != null) {
            // add the new member
            this.members.addAt(newMember, position + i - numSkipped);
        } else {
            this.members.add(newMember);
        }
        
        // note: no call to 'updateMemberTabPosition' here - we'll rely on addChild to
        // pick up the desired position from our overridden getChildTabPosition method.

        // pick up explicit size specifications, if any
        this._getUserSizes(newMember);

        // set breadth according to sizing policy
        this.autoSetBreadth(newMember);

        //>Animation    If animating we want the member to be hidden so we can do an animateShow()
        // once it's in place 
        var shouldAnimateShow = layoutDrawn && this.animateMembers && 
                                !dontAnimate && 
                                newMembers.length == 1 && 
                                newMember.visibility != isc.Canvas.HIDDEN;
        if (shouldAnimateShow) newMember.hide();
        //<Animation                                

        // add the member as a child or peer, suppressing the behavior of automatically drawing a
        // child or peer as it gets added, because we don't want this member to draw until the
        // sizing policy gets run and gives it a size.
        var drawNow = (layoutDrawn && this.getLengthPolicy() == isc.Layout.NONE);
        if (this.membersAreChildren) {
            this.addChild(newMember, null, drawNow);
        } else {
            this.addPeer(newMember, null, drawNow);
        }

        // move to 0,0 to avoid any getScrollHeight/Width() calls that happen before reflow 
        // picking up this newMember at a large left/top coordinate.  In particular this can
        // happen if centering wrt visible breadth.
        newMember.moveTo(0,0);

        // if the member has inherent length, make sure it gets drawn before the policy runs
        if (this.isDrawn() && this.memberHasInherentLength(newMember)) {
            this._moveOffscreen(newMember);
            if (!newMember.isDrawn()) newMember.draw();
        }
    }
    // avoid leaking an added member
    this._singleArray[0] = null;

    //>Animation
    // We're relying on the fact that we have a single member in the array - newMember will
    // always be the member newMembers[0] refers to.
    if (shouldAnimateShow) {
        this._animateMemberShow(newMember, callback);
    } else    //<Animation 
        this.reflow(this._$membersAdded);
        
    // fire _membersChanged()
    this._membersChanged();
},

// pick up explicit size specifications, if any
_getUserSizes : function (newMember) {

    // support sparce members array
    if (newMember == null) return;
    
    
    if (newMember._percent_width) {
        newMember.updateUserSize(newMember._percent_width, this._$width);
    }
    //else if (newMember._widthSetAfterInit) {
    //    this.logWarn("picked up width for member: " + newMember + 
    //                 ", width: " + newMember.getWidth());
    //    newMember.updateUserSize(newMember.getWidth(), this._$width);
    //}
    if (newMember._percent_height) {
        newMember.updateUserSize(newMember._percent_height, this._$height);
    }
    //else if (newMember._heightSetAfterInit) {
    //    this.logWarn("picked up height for member: " + newMember + 
    //                 ", height: " + newMember.getHeight());
    //    newMember.updateUserSize(newMember.getHeight(), this._$height);
    //}

    
    if (this.memberHasInherentLength(newMember)) {
        if (!newMember._userHeight && !newMember._heightSetAfterInit) {
            //this.logWarn("restoring default height on add");
            newMember.restoreDefaultSize(true);
        }
        if (!newMember._userWidth && !newMember._widthSetAfterInit) {
            //this.logWarn("restoring default width on add");
            newMember.restoreDefaultSize();
        }
    }
},

// to cleanly animate additions and removals of members, we have to animate the membersMargin
// as well
_animateMargin : function (member, added) {
    var layout = this;

    // if the last member is being added or removed, animate the preceding member's margin
    // instead
    var addRemoveMember = member;
    var memberNum = this.getMemberNumber(member);
    if (memberNum == this.members.length - 1) member = this.getMember(--memberNum);
    if (!member) return;

    
    var nextMember = this.getMember(memberNum + 1),
        membersMargin = isc.isA.LayoutResizeBar(member) || 
                        isc.isA.LayoutResizeBar(nextMember) ? 0 : this.membersMargin
    ;

    // when animating simultaneous addition and removal of same-size members (eg D&D reorder),
    // it's important that the Layout not change overall size.  This is only possible if both
    // members have the same size, their animations start simulteanously and fire on the same
    // frame, and have the same accelleration.
    // The first reflow will be triggered by addition/removal of members with the added member
    // at 1px height and the removed member still at full height.  
    var margin = membersMargin + this.getMemberGap(member);
    if (added) member._internalExtraSpace = -(margin+1);
    //if (added) member._internalExtraSpace = -margin; // alternative margin placement
    //else member._internalExtraSpace = -1;

    this.registerAnimation(
        function (ratio) {
            // round, then subtract to ensure the margin adjustments for simultaneous
            // add/remove add to one whole membersMargin exactly.  
            // NOTE: simultaneous show/hide animations will have matching deltas because they
            // apply the same ratio to the same total size difference (fullSize to/from 1px)
            var fraction = Math.floor(ratio * margin);
            if (added) fraction = margin - fraction;
    
            member._internalExtraSpace = -fraction;
            //isc.Log.logWarn("set extraSpace on member: " + member + 
            //                " to: " + member._internalExtraSpace + " on ratio: " + ratio);
            
            if (ratio == 1) member._internalExtraSpace = null;
        },
        this.animateMemberTime
    );
},

// override removeChild to properly remove children which are also members
removeChild : function (child, name) {
    
    isc.Canvas._instancePrototype.removeChild.call(this, child, name);
    //this.Super("removeChild", arguments);

    if (this.membersAreChildren && this.members.contains(child)) {
        this.removeMember(child);
    }
},

//>	@method	layout.removeMember()  ([])
// Removes the specified member from the layout.  If it has a resize bar, the bar will be
// destroyed.
//
// @param member (Canvas) the canvas to be removed from the layout
// @visibility external
//<	
removeMember : function (member, dontAnimate, callback) {
    this.removeMembers(member, dontAnimate, callback);
},


//>	@method	layout.removeMembers()  ([])
//
//  Removes the specified members from the layout. If any of the removed members have resize
//  bars, the bars will be destroyed.
//
// 	@param members (Array of Canvas | Canvas) array of members to be removed, or single member
//	@visibility external
//<	
removeMembers : function (members, dontAnimate, callback) {
    if (members == null || (isc.isAn.Array(members) && members.length == 0)) return;

    //>Animation If we're in the process of a drag/drop animation, finish it up before
    // proceeding to remove members
    this._finishDropAnimation(); //<Animation

    if (!isc.isAn.Array(members)) {
        this._singleArray[0] = members;
        members = this._singleArray;
    }
    // if we were passed our own members array, copy it, because otherwise we'll get confused
    // when iterating through it, and simultaneously removing members from it!    
    if (members === this.members) members = members.duplicate();

    // Resolve all member IDs to actual members
    // Note: do this before we start removing members, so if we're passed an index, the removal
    // of other members won't modify it.
    for (var i = 0; i < members.length; i++) {
        var memberId = members[i];
        if (isc.isA.Canvas(animatingMember)) continue;
        members[i] = this.getMember(memberId);
        if (members[i] == null) {
            this.logWarn("couldn't find member to remove: " + this.echoLeaf(memberId));
            members.removeAt(i);
            i -=1;
        }
    }

    //>Animation
    // If we have a single member, and we're animating member change, animate hide() it before
    // removing it.
    var shouldAnimate = (this.animateMembers && members.length == 1 && !dontAnimate),
        animatingMember = (shouldAnimate ? members[0] : null);

    if (shouldAnimate) {
        // don't try to animate something deparenting or destroying, or invisible           
        if (animatingMember.parentElement != this || 
            animatingMember.destroying || !animatingMember.isVisible())
        {
            shouldAnimate = false;
        }
    }
    if (shouldAnimate) {
        // NOTE: copy the Array of members to remove to avoid changes during the animation.
        // Note this avoids changes to the passed in Array as well as incorrect reuse of the
        // singleton this._singleArray during the animation.
        var layout = this,
            removeMembers = members.duplicate();
        this._animateMemberHide(animatingMember, function () { 
            layout._completeRemoveMembers(removeMembers);
            if (callback) callback.apply(animatingMember, arguments);
        });
    // If we're not animating fall through to _completeRemoveMembers() synchronously
    } else {
    //<Animation

        this._completeRemoveMembers(members);
    //>Animation
    }   //<Animation

    // clear the singleton Array
    this._singleArray[0] = null;
    // fire _membersChanged()
    this._membersChanged();
},

// internal method fired to complete removing members
_$membersRemoved : "membersRemoved",
_completeRemoveMembers : function (members) {
    if (!members) return;    
 
    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        this.members.remove(member);

        // NOTE: the member.parentElement check avoids a loop when removeMembers is called from
        // removeChild
        if (this.membersAreChildren && member.parentElement == this) member.deparent(); 
 
        member._heightSetAfterInit = member._widthSetAfterInit = null;

        // if we created a resizeBar for this member, destroy it
        if (member._resizeBar) {
            member._resizeBar.destroy();
            member._resizeBar = null;
        }
        // the member should no longer show us when it gets shown
        if (member.showTarget == this) delete member.showTarget;

        // clean up most important LayoutResizeBar state
        if (isc.isA.LayoutResizeBar(member)) {
            delete member.vertical;
            delete member.layout;
        }

        if (member._isPlaceHolder) member.destroy();
    }

    this.reflow(this._$membersRemoved);
},

//> @method layout.setMembers()
// Display a new set of members in this layout. Equivalent to calling removeMembers() then
// addMembers(). Note that the new members may include members already present, in which case
// they will be reordered / integrated with any other new members passed into this method.
// @param members (Array of Canvas)
// @visibility external
//<
setMembers : function (members) {
    if (members == this.members || !isc.isAn.Array(members)) return;
    var removeMembers = [];
    
    if (this.members != null) {
        for (var i = 0; i < this.members.length; i++) {
            if (!members.contains(this.members[i])) removeMembers.add(this.members[i]);
        }
    }
    var instantRelayout = this.instantRelayout;
    this.instantRelayout = false;
    this.removeMembers(removeMembers, true);
    // Note members may contain some members we already have (and shuffle order etc)
    // addMembers should handle this.
    
    this.addMembers(members, 0, true);
    this.instantRelayout = instantRelayout;
    if (instantRelayout) this.reflow("set members");
    
},


// Methods to show/hide members, with animation if appropraite

//> @method layout.showMember()
// Show the specified member, firing the specified callback when the show is complete.
// <P>
// Members can always be directly shown via <code>member.show()</code>, but if
// +link{animateMembers,animation} is enabled, animation will only occur if showMember() is
// called to show the member.
//
// @param member (Canvas) Member to show
// @param [callback] (Function) action to fire when the member has been shown
// @visibility external
//<
showMember : function (member, callback) {
    return this.showMembers([member], callback);
},

//> @method layout.showMembers()
// Show the specified array of members, and then fire the callback passed in.
// @param members (Array of Canvas) Members to show
// @param [callback] (Callback) action to fire when the members are showing.
//<
//>Animation  If <code>this.animateMembers</code> is true, the show will be performed as an 
// animation in the case where a single, animate clip-able member was passed.   //<Animation
showMembers : function (members, callback) {
    //>Animation
    if (this.isDrawn() && this.animateMembers && members.length == 1) {
        this._animateMemberShow(members[0], callback);
    } else {    //<Animation
        for (var i = 0; i < members.length; i++) {
            var member = this.getMember(members[i]);
            member.show();
        }
        this.fireCallback(callback);
    //>Animation
    }   //<Animation
},

// shared between showMembers and addMembers
_animateMemberShow : function (member, callback) {
    member = this.getMember(member);
    this.setNewMemberLength(member);
    member.animateShow(this.animateMemberEffect, callback, this.animateMemberTime);
    if (member.isAnimating()) this._animateMargin(member, true);
},


setNewMemberLength : function (newMember) {
    // resize the new member to the desired size
    newMember._prefetchingSize = true;
    var sizes = this._getMemberSizes(this.getTotalMemberSpace());
    delete newMember._prefetchingSize;      
    var size = sizes[this.members.indexOf(newMember)];

    // apply the height; avoid it being regarded as a new user size
    var oldSetting = this._layoutInProgress;
    this._layoutInProgress = true;
    
    this.vertical ? newMember.setHeight(size) : newMember.setWidth(size);
    this._layoutInProgress = oldSetting;

},

//> @method layout.hideMember()
// Hide the specified member, firing the specified callback when the hide is complete.
// <P>
// Members can always be directly hidden via <code>member.hide()</code>, but if
// +link{animateMembers,animation} is enabled, animation will only occur if hideMember() is
// called to hide the member.
//
// @param member (Canvas) Member to hide
// @param [callback] (Function) callback to fire when the member is hidden.
// @visibility external
//<
hideMember : function (member, callback) {
    return this.hideMembers([member], callback);
},

//> @method layout.hideMembers()
// Hide the specified array of members, and then fire the callback passed in.
// @param members (Array of Canvas) Members to hide
// @param [callback] (Callback) action to fire when the members are hidden.
//<
//>Animation  If <code>this.animateMembers</code> is true, the hide will be performed as an 
// animation in the case where a single, animate clip-able member was passed.   //<Animation
hideMembers : function (members, callback) {
    this._hideMembersCallback = callback;
    //>Animation
    if (this.animateMembers && members.length == 1) {
        this._animateMemberHide(members[0], callback);
    } else {//<Animation
        for (var i = 0; i < members.length; i++) {
            var member = this.getMember(members[i]);
            member.hide();
        }
        this.fireCallback(callback);
    //>Animation
    } //<Animation
},


// shared between hideMembers and removeMembers
_animateMemberHide : function (member, callback) {
    // resolve index to actual member
    member = this.getMember(member);
    member.animateHide(this.animateMemberEffect, callback, this.animateMemberTime);
    if (member.isAnimating()) this._animateMargin(member);
},

//> @method layout.setVisibleMember()
// Hide all other members and make the single parameter member visible.
//
// @param member (Canvas) member to show
//
// @visibility external
//<
setVisibleMember : function (member) {
    var theMem = this.getMember(member);
    if (theMem == null) return;
    this.hideMembers(this.members);
    this.showMember(theMem);
},

// Reordering Members
// --------------------------------------------------------------------------------------------

//>	@method	layout.reorderMember()  ([])
// Shift a member of the layout to a new position
//		    
// @param memberNum   (number)  current position of the member to move to a new position
// @param newPosition (number)  new position to move the member to
//
// @visibility external
//<	
reorderMember : function (memberNum, newPosition) {
    this.reorderMembers(memberNum, memberNum+1, newPosition)
},

//>	@method	layout.reorderMembers()  ([])
// Move a range of members to a new position
//		    
// @param start       (number)  beginning of range of members to move
// @param end         (number)  end of range of members to move, non-inclusive
// @param newPosition (number)  new position to move the members to
//
// @visibility external
//<	
reorderMembers : function (start, end, newPosition) {
	this.members.slideRange(start, end, newPosition);
	// update tab index
	for (var i = newPosition; i < newPosition + (end-start); i++) {
    	this.updateMemberTabPosition(this.members[i]);
    }
	this._membersReordered("membersReordered");
},

// Helper method to update the UI after the members array has been reworked.

_membersReordered : function (reason) {
    this.layoutChildren(reason);
     // fire _membersChanged()
    this._membersChanged();
},

// replace one member with another, without an intervening relayout, and without animation
_replaceMember : function (oldMember, newMember) {
    var oldSetting = this.instantRelayout;
    this.instantRelayout = false;
    var oldMemberPos = this.getMemberNumber(oldMember);
    if (oldMemberPos < 0) {
        this.logWarn("_replaceMember(): " + oldMember.getID() + " is not a member");
        oldMemberPos = 0;
    } else {
        this.removeMember(oldMember, true);
    }
    this.addMember(newMember, oldMemberPos, true);
    this.instantRelayout = oldSetting;
    if (oldSetting) this.reflowNow();
},

//>	@method	layout.replaceMember()
// Replaces an existing member of the layout with a different widget.  The new member will be
// assigned the width and height of the existing member (including sizes configured via end
// user resize), so no reflow will occur unless the new component has visible overflow and it
// differs from that of the widget it replaced.
//
// @param oldMember (Canvas) an existing member of the layout to be replaced
// @param newMember (Canvas) a different widget that should replace <code>oldMember</code>
// @see RPCManager.createScreen()
// @visibility external
//<
replaceMember : function (oldMember, newMember) {
    // just bail if it would be a no-op
    if (oldMember == newMember) return;

    // non-sensical case; oldMember isn't a member
    if (!this.hasMember(oldMember)) {
        this.logWarn("replaceMember(): the first argument must already be a member widget");
        return;
    }

    
    var alreadyMember = this.hasMember(newMember);

    
    var dirty = this.layoutIsDirty();
    this._layoutIsDirty = true;

    // remember the overflow and user sizing of the old member
    var userWidth  = oldMember._userWidth,
        userHeight = oldMember._userHeight,
        visibleWidth  = oldMember.getVisibleWidth(),
        visibleHeight = oldMember.getVisibleHeight()
    ;
    // remember the placement of the old member
    var oldLeft = oldMember.getLeft(),
        oldTop  = oldMember.getTop()
    ;

    // apply the old member's width and height to new member
    
    var memberPos;
    if (isc.isA.Canvas(newMember)) {
        newMember.resizeTo(oldMember.width, oldMember.height);
    } else {
        memberPos = this.getMemberNumber(oldMember);
        newMember.width = oldMember.width;
        newMember.height = oldMember.height;
    }

    // do actual replacement of members now
    this._replaceMember(oldMember, newMember);

    // if new member was properties object, replace it with widget
    if (memberPos != null) newMember = this.getMember(memberPos);

    // apply user sizing present before resizeTo() above
    newMember.updateUserSize(userWidth,  this._$width);
    newMember.updateUserSize(userHeight, this._$height);

    // place the new member in same spot as the old member
    newMember.moveTo(oldLeft, oldTop);

    // if the new member is still undrawn, draw it now
    if (!newMember.isDrawn()) newMember.draw();

    
    this._layoutIsDirty = dirty;
    if (!dirty && this.isDrawn()) {
        if (newMember.getVisibleHeight() != visibleHeight || alreadyMember ||
            newMember.getVisibleWidth()  != visibleWidth)
        {
            this.reflow();
        }
    }
},

//> @method layout.membersChanged()
// Fires once at initialization if the layout has any initial members, and then fires whenever
// members are added, removed or reordered.
// 
// @visibility external
//<

// internal membersChanged
_membersChanged : function () {
    if (!this.destroying) { // skip if happening during destroy()
        this._computeShowResizeBarsForMembers();
    }

    // fire membersChanged event
    if (this.membersChanged) this.membersChanged();
},

// We keep track of whether the resizeBar should actually be shown in _computedShowResizeBar
// because it depends on showResizeBar, defaultResizeBars and the position of the member
// within the layout. By caching the computed value, we can keep track of changes without
// interfering with the desired setting in showResizeBar itself.
_computeShowResizeBarsForMembers : function () {
    var member, lastMember, 
        defResize = this.defaultResizeBars;
    for (var i = this.members.length - 1; i >= 0; i--, lastMember = member) {
        member = this.members[i];

        // handle sparse array
        if (member == null) continue;
        var showResize = false; // Covers defResize == isc.Canvas.NONE
        if (defResize == isc.Canvas.MARKED) {
            showResize = member.showResizeBar;
        } else if (defResize == isc.Canvas.MIDDLE) {
            // Note that we need the explicit comparison to false here and below due to the 
            // semantics of defaultResizeBars
            showResize = (i < this.members.length - 1) && (member.showResizeBar != false);
        } else if (defResize == isc.Canvas.ALL) {
            showResize = member.showResizeBar != false;
        }
        if (this.neverShowResizeBars) {
            showResize = false;
        }

        // if a manually-created LayoutResizeBar is present, defer to it
        
        if (showResize && isc.isA.LayoutResizeBar(lastMember)) {
            if (!lastMember.hasOwnProperty("resizeDirection")) {
                this._applyAutoChildSettingsToResizeBar(member, lastMember, i + 1);
            }
            showResize = false;
        }

        var currentComputedResizeBar = member._computedShowResizeBar;
        member._computedShowResizeBar = showResize;
        if (currentComputedResizeBar != showResize) this.reflow("_computedShowResizeBar changed");
    }

    // members have changed; update LayoutResizeBar's target
    for (var i = this.members.length - 1; i >= 0; i--) {
        var member = this.members[i];
        if (isc.isA.LayoutResizeBar(member)) member._updateTarget(i);
    }
},

// LayoutResizeBars 
// --------------------------------------------------------------------------------------------

_applyAutoChildSettingsToResizeBar : function (prevMember, resizeBar, resizeBarPos) {
    
    
    // set LayoutResizeBar.target based on resizeBarTarget of member before it
    var targetAfter, target;
    if (prevMember.resizeBarTarget == "next") {
        target = this.getMember(resizeBarPos + 1);
        if (target) targetAfter = true;
    }
    if (!target) target = prevMember;

    // set LayoutResizeBar.hideTarget based on resizeBarHideTarget of member before it
    var hideTarget = target;
    if (prevMember.resizeBarHideTarget != null) {
        hideTarget = prevMember.resizeBarHideTarget == "next" ?
            this.getMember(resizeBarPos + 1) : null;
        if (!hideTarget) hideTarget = prevMember;
    }

    resizeBar.setResizeDirection(targetAfter ? isc.Splitbar.AFTER : isc.Splitbar.BEFORE);

    // provide support for the undoc'd member property resizeBarHideTarget
    if (target != hideTarget) resizeBar.setProperty("hideTarget", hideTarget);
},

initResizeBarMember : function (resizeBar) {
    if (resizeBar.layout == this) return;
    else resizeBar.layout = this;

    // orientation of resizeBar is opposite layout
    var vertical = !this.vertical;
    if (vertical != resizeBar.vertical) {
        resizeBar.setVertical(vertical, true);
    }

    
    if (vertical) {
        resizeBar.setProperties({
            dragScrollDirection: isc.Canvas.HORIZONTAL,
            width: this.resizeBarSize, inherentWidth: true
        });
    } else {
        resizeBar.setProperties({
            dragScrollDirection: isc.Canvas.VERTICAL,
            height: this.resizeBarSize, inherentHeight: true
        });
    }
},

    
// Tabbing
// --------------------------------------------------------------------------------------------
 
//> @method layout.getChildTabPosition()
// Layouts ensure children are ordered
// in the tab-sequence with members being reachable first (in member order), then any
// non-member children.
// <P>
// As with +link{canvas.getChildTabPosition()} if +link{canvas.setRelativeTabPosition()}
// was called explicitly called for some child, it will be respected over member order.
//
// @param child (Canvas) The child for which the tab position should be returned
// @return (Integer) tab position of the child within this layout.
// @visibility external
//<


_getChildrenInDefaultTabOrder : function () {
    var memberOrderedChildren = [];
    if (!this.members || !this.children) return memberOrderedChildren;
    for (var i = 0; i < this.members.length; i++) {
        if (!this.members[i].updateTabPositionOnReparent) continue;
        memberOrderedChildren.add(this.members[i]);
    }
    if (this.members.length != this.children.length) {
        for (var i = 0; i < this.children.length; i++) {
            if (!this.children[i].updateTabPositionOnReparent || 
                this.members.contains(this.children[i])) 
            {
                continue;
            }
            memberOrderedChildren.add(this.children[i]);
        }
    }
    return memberOrderedChildren;
},

// Method to update the tab position of some member
// Called from reorderMembers() [or addMember if passed and existing member and we're already drawn, so
// essentially a reorder]
updateMemberTabPosition : function (member) {

    this.logDebug("Update member tab position:" + member + 
                  ", index in this.members?:" + this.members.indexOf(member), "TabIndexManager");
    // the override to getChildTabPosition() ensures that standard 'updateChildTabPosition()'
    // will put the member in the right slot.
    return this.updateChildTabPosition(member);
},

// Dragging members out
// --------------------------------------------------------------------------------------------

// if a member is dragged with "target" dragAppearance, put a placeholder into the layout to
// prevent reflow and restacking during the drag

//> @attr layout.placeHolderDefaults (Canvas Properties: null : IR) 
// If +link{layout.showDragPlaceHolder, this.showDragPlaceHolder} is true, this 
// defaults object determines the default appearance of the placeholder displayed
// when the user drags a widget out of this layout.<br>
// Default value for this property sets the placeholder +link{canvas.styleName, styleName} to
// <code>"layoutPlaceHolder"</code><br>
// To modify this object, use +link{Class.changeDefaults()}
// @group dragdrop
// @visibility external
//<
placeHolderDefaults : {
    styleName:"layoutPlaceHolder",
    overflow:isc.Canvas.HIDDEN
},
dragRepositionStart : function () {

    var dragTarget = isc.EH.dragTarget;

    // only take over the drag interaction if an immediate member is being dragged with target
    // drag animation.
    if (!this.hasMember(dragTarget) || dragTarget.getDragAppearance(isc.EH.DRAG_REPOSITION) != "target") return;
    
    // record page-level coordinates before reparent       
    var left = dragTarget.getPageLeft(),
        top = dragTarget.getPageTop();
    
    this._popOutDraggingMember(dragTarget, left, top);
},

// This helper method is called when dragging a member out of a layout.
// It will deparent the member and move it to the appropriate position (so it can be dragged
// and/or animated around outside the parent).
// It also adds a spacer to the layout where the member was taken from so we don't get an
// unexpected reflow.

_popOutDraggingMember : function (member, left, top) {

    this._draggingMember = member;

    // make a visible placeHolder if showDragPlaceHolder is set
    var placeHolder = this._createSpacer(member, "_dragOutPlaceHolder", this.showDragPlaceHolder)
    member._dragPlaceHolder = placeHolder;

    // prevent relayout while we deparent and swap a placeholder in.  Also, prevent
    // animation of the placeholder we add
    var oldSetting = this.instantRelayout;
    this.instantRelayout = false;

    
    this._doPopOutDragMember(placeHolder, member);

    if (!member.isDrawn() || member.readyToRedraw()) {
        // deparent, but keep us in the event processing chain by setting eventParent
        member.deparent();
        member.eventParent = this;

        this.instantRelayout = oldSetting;

        member.moveTo(left,top);
        member.draw();

    
    } else {
        var memberClipHandle = member.getClipHandle();
        member.getDocumentBody(true).appendChild(memberClipHandle);

        // Prepare a list of the member and all descendants. Visit each one, setting the _drawn
        // flag to false and decrementing the hide using display none counters (as we're moving
        // this whole widget tree to top-level).
        var drawnMemberAndDescendants = [];
        var visit = function (node) {
            if (node._drawn) {
                drawnMemberAndDescendants.add(node);

                if (node._needHideUsingDisplayNone()) {
                    var parent = node.parentElement;
                    while (parent != null) {
                        parent._decrementHideUsingDisplayNoneCounter();
                        parent = parent.parentElement;
                    }
                }

                node._drawn = false;
            }
        };
        var node = member;
        var parentStack = [];
        var top = node;
        while (top != null) {
            visit(top);
            if (top.children != null) parentStack.push.apply(parentStack, top.children);
            top = parentStack.pop();
        }
        

        member.deparent();
        for (var ri = drawnMemberAndDescendants.length; ri > 0; --ri) {
            var node = drawnMemberAndDescendants[ri - 1];
            node._drawn = true;
            node._completeHTMLInit();
        }
        

        member.eventParent = this;

        this.instantRelayout = oldSetting;

        member.moveTo(left,top);
    }
},

_doPopOutDragMember : function (placeHolder, member) {
    this.addMember(placeHolder, this.getMemberNumber(member), true);
},

// dragRepositionStop will be bubbled up to the Layout from drag-repositoned members.
// The only supported drag reposition of members is drag reordering / dragging out to 
// another layout.  We override this method to 
// - suppress the default EventHandler behavior for members (which will directly call 'moveTo()' 
//   on the dragTarget in some cases).

// - If dragAppearance on the member being dragged is "Target", on dragRepositionStart() we
//   removed the member from the Layout and put a placeholder in instead.
//   - if a successful drop occurred on this or another layout, that method takes care of 
//     removing this placeholder
//   - otherwise remove the placeholder here, and if no drop occurred, put the widget back
//     into our members' array

dragRepositionStop : function () {

    var dragTarget = isc.EH.dragTarget;

    // We may be getting this event bubbled up from a child of a member.
    // in this case allow normal drag repo behavior on the target    
    
    if (!this.members.contains(dragTarget) && dragTarget != this._draggingMember) return;
    
    // In this case we were drag repositioning a member.
    var appearance = dragTarget.getDragAppearance(isc.EH.DRAG_REPOSITION),
        isTarget = appearance == isc.EH.TARGET;
    // If the appearance is neither OUTLINE nor TARGET - just kill the event        
    if (!isTarget && (appearance != isc.EH.OUTLINE)) return false;
    
    // Default EH.dragRepositionStop() behavior:
    // - if dragAppearance is target, and target.dragRepositionStop() returns false, call 
    //   'moveTo' to reset the position of the member to whatever it was before dragging started
    // - if dragAppearance is outline or tracker, and target.dragRepositionStop() does not 
    //   return false, call 'moveTo' on the target to move it to the drop position.
    // To suppress both these behaviors we therefore return false if dragAppearance is outline,
    // or STOP_BUBBLING if dragAppearance is target.
    var returnVal = isTarget ? isc.EH.STOP_BUBBLING : false;
    
    // Clear out the draggingMember
    this._draggingMember = null;
    // no longer act as the event parent
    if (dragTarget.eventParent == this) dragTarget.eventParent = null;
    
    // If we set up a placeHolder in the dragTarget on dragRepositionStart() we may need to clear
    // it now
    
    if (dragTarget.dropSucceeded) return returnVal;

    var placeHolder = dragTarget._dragPlaceHolder;
    if (placeHolder != null) {     
    
        // If the member has been reparented or destroyed, it's no longer under our management.
        // Simply remove the placeholder.
        if (dragTarget.parentElement != null || dragTarget.destroyed) {
            this._cleanUpPlaceHolder(dragTarget); 
            
        // otherwise, drop failed, put member back into layout at placeholder
        
        } else {
            // clear the pointer to the placeholder
            dragTarget._dragPlaceHolder = null;

            var oldPosition = this.getMemberNumber(placeHolder),
                oldRect = placeHolder.getPageRect(),
                
                layout = this,
                replaceMember = function () { 
                    if (dragTarget._canDrag != null) {
                        dragTarget.canDrag = dragTarget._canDrag;
                        delete dragTarget._canDrag;
                    }
                    if (dragTarget._canDragReposition != null) {
                        dragTarget.canDragReposition = dragTarget._canDragReposition;
                        delete dragTarget._canDragReposition;
                    }
                    layout._replaceMember(placeHolder, dragTarget); 
                }
            ;
        
            //>Animation
            // do this via an animation if we are animating member changes
            if (this.animateMembers) { 
                // prevent more drags from being initiated on the dragTarget while
                // its animating back to its placeholder position
                dragTarget._canDrag = dragTarget.canDrag;
                dragTarget.canDrag = false;

                dragTarget._canDragReposition = dragTarget.canDragReposition;
                dragTarget.canDragReposition = false;

                dragTarget.animateRect(oldRect[0], oldRect[1], oldRect[2], oldRect[3],
                                       replaceMember);
            } else 
            //<Animation
                replaceMember(true);
        }
    }
    return returnVal;
},

_createSpacer : function (member, suffix, visible) {
    var spacer, props;
    
    
    if (visible) {
        spacer = this.createAutoChild("placeHolder", props, isc.Canvas);
    } else {
        spacer = isc.LayoutSpacer.create(props);
    }
    spacer.setRect(member.getRect());

    // HACK: since the spacer gets sized outside of the Layout, if we don't do this, the Layout
    // will resize the spacer when it's added
    spacer.updateUserSize(spacer.getWidth(), this._$width);
    spacer.updateUserSize(spacer.getHeight(), this._$height);

    spacer.layoutAlign = member.layoutAlign;

    // Ignore *both*:
    // - memberOverlap (it's already included with the margin of the moved item)
    // - _internalExtraSpace (spacer is placed on fixed locations in the layout)
    spacer.extraSpace = (member.extraSpace || 0);

    spacer._isPlaceHolder = true; // HACK see addMember()

    return spacer;
},

// Helper method to remove the placeHolder set up when a member gets dragged out of this Layout
removePlaceHolder : function (placeHolder) {
    // if the placeHolder wasn't a LayoutSpacer, ie it was something visible, and we're going
    // to animate it's remove, switch to an invisible placeHolder for the animation (the idea
    // is that the placeHolder stands in for the member, and the member isn't actually
    // shrinking)
    if (this.animateMembers && !isc.isA.LayoutSpacer(placeHolder)) {
        var newPlaceHolder = this._createSpacer(placeHolder);
        this._replaceMember(placeHolder, newPlaceHolder);
        placeHolder.destroy();
        placeHolder = newPlaceHolder;
    }
    // this will animate if enabled.  When the remove is complete, the placeholder will also be
    // destroyed
    this.removeMember(placeHolder); 
},


// Dropping members in
// --------------------------------------------------------------------------------------------
	
willAcceptDrop : function () {
    // Allow drop() to bubble by returning null
    if (!this.canDropComponents) {
        return this.canAcceptDrop ? true : null;
    } else if (!this.canAcceptDrop) {
        return null;
    }
    return this.invokeSuper(isc.Layout, "willAcceptDrop");
},

// create and place the dropLine 
dropOver : function () {
    // note: allow bubbling
    //>EditMode
    if (this.editingOn && this.editProxy && !this.editProxy.willAcceptDrop()) return;
    //<EditMode
    if (!this.willAcceptDrop()) return;
    this.showDropLine();
    
    isc.EventHandler.dragTarget.bringToFront();
    return true;
},

// place the dropLine 
dropMove : function () {
    //>EditMode
    if (this.editingOn && this.editProxy && !this.editProxy.willAcceptDrop()) return;
    //<EditMode
    if (!this.willAcceptDrop()) return;
    this.showDropLine();
},
	
dropOut : function () { this.hideDropLine(); },

dropStop : function () { this.hideDropLine(); },

//> @method layout.getDropComponent() 
// When +link{canDropComponents} is true, this method will be called when a component is
// dropped onto the layout to determine what component to add as a new layout member.
// <P>
// By default, the actual component being dragged (isc.EventHandler.getDragTarget()) will be
// added to the layout.  For a different behavior, such as wrapping dropped components in
// Windows, or creating components on the fly from dropped data, override this method.  
// <P>
// You can also return null to cancel the drop.
//
// @param dragTarget (Canvas) current drag target 
// @param dropPosition (int) index of the drop in the list of current members
// @return (Canvas) the component to add to the layout, or null to cancel the drop
//
// @visibility external
//<
getDropComponent : function (dragTarget, dropPosition) {

    // portlet moved
    if (!isc.isA.Palette(dragTarget)) return dragTarget;

    // other, drag and drop from palette, create new portlet
    var data = dragTarget.transferDragData(),
        component = (isc.isAn.Array(data) ? data[0] : data);

	return component.liveObject;
},

//>	@method	layout.drop() (A)
// Layouts have built-in handling of component drag and drop.  See the discussion in
// +link{Layout} on how it works.  If you override this builtin implementation of drop() and
// you're using the built-in dropLine via +link{Layout.canDropComponents}:true, be sure to call
// +link{Layout.hideDropLine()} to hide the dropLine after doing your custom drop() handling.
//
// @return (boolean) Returning false will cancel the drop entirely
// @visibility external
//<
drop : function () {
    if (!this.willAcceptDrop() || this._suppressLayoutDrag) return;
    
    var dropPosition = this.getDropPosition();
    var newMember = this.getDropComponent(isc.EventHandler.getDragTarget(), dropPosition);
    // allow cancelation of the drop from getDropComponent
    // we pass through the value to distinguish between null (cancel but continuing bubbling) and
    // false (cancel and stop bubbling)
    if (!newMember) return newMember;
    // If we contain the member (or its placeholder) and the new position matches the old one
    // we can just bail since there will be no movement
    var newMemberIndex = this.members.indexOf(newMember);
    if (newMemberIndex == -1 && newMember._dragPlaceHolder) 
        newMemberIndex = this.members.indexOf(newMember._dragPlaceHolder)
    if (newMemberIndex != -1 && 
        (newMemberIndex == dropPosition || newMemberIndex + 1== dropPosition)) 
    {
        return false;
    }
      
    
    newMember.dropSucceeded = true;

    
    if (isc.Browser.isMoz) {
        this.delayCall("_completeDrop", [newMember, dropPosition]);
    } else {
        this._completeDrop(newMember, dropPosition);
    }
    return isc.EH.STOP_BUBBLING;
},

// Helper to complete a drop operation
_completeDrop : function (newMember, dropPosition) {

    this.hideDropLine();
    
    //>Animation
    
    var memberParent = newMember.parentElement;
    if (memberParent && newMember.getDragAppearance(isc.EH.dragOperation) == isc.EH.OUTLINE && 
        this.animateMembers && isc.isA.Layout(memberParent) && 
        memberParent.hasMember(newMember))
    {
        memberParent._popOutDraggingMember(newMember, isc.EH.dragOutline.getPageLeft(), 
                                            isc.EH.dragOutline.getPageTop());
    }
    //<Animation
    
    // if this member was really reordered (dragged from this same layout), it's new position
    // is one less if it was dropped past it's old position
    var dropAfterSelf = false;
    // Because we deparent a member that has dragAppearance:"target" or that will animate into
    // place, this will only occur if:
    // - reordering something with dragAppearance 'tracker'
    // - reordering something with dragAppearance 'outline' if we're not animating into place
    if (this.members.contains(newMember)) {
        var memberPos = this.members.indexOf(newMember);
        
        if (memberPos < dropPosition) dropAfterSelf = true;
        this.removeMember(newMember, true);
        
    // If we don't contain the member:
    // - the member currently resides in another layout (will get pulled out when we do
    //   addMember())
    // - there is a placeHolder wherever the member was (could be in this layout or
    //   another layout)
    // Handle Drag target or outline / drag reposition case (placeholder is in the members array)
    } else {

        var placeHolder = newMember._dragPlaceHolder;
        if (placeHolder != null) {
            var placeHolderIndex = this.getMemberNumber(placeHolder)
            if ((placeHolderIndex >= 0) && (placeHolderIndex < dropPosition)) { 
                dropAfterSelf = true;
            }
            placeHolder.parentElement._cleanUpPlaceHolder(newMember);
        }
    }

    // if we're dropping a member after itself (reorder), the insertionPosition is reduced by
    // one (assuming the member is removed before being re-added)
    var insertionPosition = dropPosition - (dropAfterSelf ? 1 : 0);
    
    //>Animation
    // If we're doing a drag-reposition of the new member with dragAppearance 'target' our
    // outline, and animateMembers is true, we want to animate the new member into place 
    // by moving it from the drop position to the final position in the layout.
    // If the drag-appearance is tracker it's not clear what an appropriate animation 
    // would be - we could have the dragged widget float from either it's current position or 
    // from the drag-outline position into the slot, but just have it do the normal 'addMember'
    // animation for now.
    if (!this.animateMembers || 
        (newMember.dragAppearance != "target" && newMember.dragAppearance != "outline" )) {
    //<Animation    
        this.addMember(newMember, insertionPosition);
        // Clear the dropSucceeded method so it doesn't effect subsequent drag-reorderings
        delete newMember.dropSucceeded;
        return;
    //>Animation
    }


    // make a spacer to take the place of the member while we animate it into place.  Note that
    // we will automatically animateShow() on this spacer so the amount of space will grow as
    // the member moves towards it.
    // NOTE: the prospective member may be resized on the width axis when finally added to the
    // Layout, which could cause the member to be extended on the length axis.  Changing the
    // member's size before starting the move animation would be odd looking, so we instead
    // live with the possibility of other members being pushed down at the end of the
    // animation.  The only other alternative would be to resize the member to the Layout's
    // breadth, redraw if necessary to check the extents, and resize back, which would probably
    // be too slow even if we could avoid flashing.
    var spacer = this._createSpacer(newMember, "_slideInTarget");
    this.addMember(spacer, dropPosition); // automatically animates, pushing other members down
    
    this.reflowNow();

    //this.logWarn("hDistance: " + hDistance + ", vDistance: " + vDistance +
    //             ", distance: " + distance);
    // Hang onto a pointer to the member being animated so we can finish this animation early
    // if required.
    this._animatingDrag = newMember;
    
    var layout = this,
        targetLeft = spacer.getPageLeft(),
        targetTop = spacer.getPageTop();

    if (dropAfterSelf) {
        // shift the target position by the amount of space the reordered member is vacating.
        // NOTE: if being dropped in the last position, the margin due to this member
        // disappears
        var margin = this.membersMargin + this.getMemberGap(newMember);
        if (this.vertical) targetTop -= (newMember.getVisibleHeight() + margin);
        else targetLeft -= (newMember.getVisibleWidth() + margin);
    }

    // XXX HACK very special case for margin animation
    // When we add a member we use _internalExtraSpace to animate the addition of it's
    // margin as well.  In every case but adding in the last position, the animated
    // margin is the margin *after* the added member (the spacer), and hence wouldn't
    // affect positioning.  But for the case of adding at the end, we have to compensate
    // for the fact that the second to last member has _internalExtraSpace set,
    // representing a temporary reduction in margin that affects the spacer placement right
    // now but won't be there when the animation completes
    if (spacer == this.members.last() && this.members.length > 1) {
        var internalSpace = (this.members[this.members.length-2]._internalExtraSpace || 0);
        //this.logWarn("internalSpace: " + internalSpace);
        if (this.vertical) targetTop -= internalSpace;
        else targetLeft -= internalSpace;
    }
    newMember.animateMove(
        targetLeft, targetTop,
        function () {
            // clear the flag that indicates we're in mid-drag
            layout._animatingDrag = null;
                
            // suppress instantRelayout while destroying the placeholder to avoid restack
            // before we add the new member
            var oldSetting = layout.instantRelayout;
            layout.instantRelayout = false;
            spacer.destroy();
            newMember.dropSucceeded = null;
            layout.addMember(newMember, insertionPosition, true);
            layout.instantRelayout = oldSetting;
            if (oldSetting) layout.reflowNow();
        },
        this.animateMemberTime
    );
    //<Animation
},


_cleanUpPlaceHolder : function (newMember) {

    var placeHolder = newMember._dragPlaceHolder;
        
    if (this.hasMember(placeHolder)) {
        newMember._dragPlaceHolder = null;
        this.removePlaceHolder(placeHolder)
   } 
},

//>Animation Helper method to finish up a drag/drop animation if one is currently in progress.
_finishDropAnimation : function () {
    
    if (this._animatingDrag != null) {
        this._animatingDrag.finishAnimation("move");
    }
},
//<Animation

//>	@method	layout.getDropPosition() (A)
//
// Get the position a new member would be dropped.  This drop position switches in the
// middle of each member, and both edges (before beginning, after end) are legal drop positions
// <p>
// Use this method to obtain the drop position for e.g. a custom drop handler.
//
// @return (int) the position a new member would be dropped
//
// @visibility external
//<	
getDropPosition : function () {
    var coord = this.vertical ? this.getOffsetY() : this.getOffsetX();
    
    // before beginning 
    if (coord < 0) return 0;

    var totalSize = this.vertical ? this._topMargin : this._leftMargin;
    for (var i = 0; i < this.memberSizes.length; i++) {
        var size = this.memberSizes[i],
            member = this.members[i];
        if (!member) continue;
        if (coord < (totalSize + (size/2))) {
            // respect an explicit canDropBefore setting, which prevents dropping before a
            // member
            if (member.canDropBefore === false) return false;
            return i;
        }
        totalSize += size + this.membersMargin + this.getMemberGap(member);
    }
    // last position: past halfway mark on last member
    return this.members.length;
},

// Drop line
// --------------------------------------------------------------------------------------------

_getChildInset : function (topEdge) {
    return (topEdge ? this.getTopMargin() + this.getTopBorderSize() : 
                      this.getLeftMargin() + this.getLeftBorderSize())
},

getPositionOffset : function (position) {
    if (this.members.length == 0) {
        // empty layout
        return this.vertical ? this.getPageTop() + this._getChildInset(true) + this._topMargin : 
                               this.getPageLeft() + this._getChildInset() + this._leftMargin;
    }
    if (position < this.members.length) {
        // get near side of member
        var member = this.members[position];

        return (this.vertical ? member.getPageTop() : member.getPageLeft());
    } else {
        // last position: get far side of last member (not end of Layout, since Layout may be
        // larger than last member)
        var member = this.members[position - 1];
        return (this.vertical ? member.getPageBottom() : member.getPageRight());
    }
},

// show a drop line in the middle of the margin at that drop position
showDropLine : function () {
    
    if (this._suppressLayoutDrag) return;
    
    if (this.showDropLines == false) {
        // just bail
        return;
    }
    
    var position = this.getDropPosition();
    if (!isc.isA.Number(position)) {
        this.hideDropLine();
        return;
    }

    // before or after list
    if (position < 0) return;

    
    if (this._layoutIsDirty) this.reflowNow();
    
    if (!this._dropLine) this._dropLine = this.makeDropLine();
    
    var thickness = this.dropLineThickness,
        lengthOffset = this.getPositionOffset(position);

    // place the dropLine in the middle of the margin between members, or in the middle of the
    // layoutMargin at the ends of the layout
    // note use _leftMargin / _rightMargin rather than this.layoutMargin. Handles
    // explicit layoutLeftMargin or paddingAsLayoutMargin as well as explicit layoutMargin.
    var margin;
    // this is just a sanity check - the widget should be drawn at this point so we'd expect
    // the layout margins to have been set up already
    if (this._leftMargin == null) this.setLayoutMargin();

    if (position == 0) {
        margin = this.vertical ? this._topMargin : this._leftMargin;
    } else if (position == this.members.length) {
        // when placing at the end, add to the offset instead of subtracting
        margin = - (this.vertical ? this._bottomMargin : this._rightMargin);
    } else {
        margin = this.membersMargin;
    }
    lengthOffset = lengthOffset - Math.round((margin+thickness)/2);

    var breadthOffset = this.vertical ? 
            this._leftMargin + this._getChildInset() :
            this._topMargin + this._getChildInset(true);

    var breadth = this.vertical ? 
        this.getVisibleWidth() - this.getVMarginBorder() - this._getBreadthMargin() :
        this.getVisibleHeight() - this.getHMarginBorder() - this._getLengthMargin();
        
    this._dropLine.setPageRect(
        (this.vertical ? this.getPageLeft() + breadthOffset : lengthOffset),
        (this.vertical ? lengthOffset : this.getPageTop() + breadthOffset),
        (this.vertical ? breadth : thickness),
        (this.vertical ? thickness : breadth)
    );
    
    var topParent = this.topElement || this;
    if (this._dropLine.getZIndex() < topParent.getZIndex()) this._dropLine.moveAbove(topParent);

    //this.logWarn("showDropLine, relative top of layout: " + 
    //             (this.getPageTop() - this._dropLine.getPageTop()) + " for pos: " + position);
    this._dropLine.show();
},
	

//>	@method	layout.hideDropLine() (A)
// Calling this method hides the dropLine shown during a drag and drop interaction with a
// Layout that has +link{Layout.canDropComponents} set to true.  This method is only useful for
// custom implementations of +link{Layout.drop()} as the default implementation calls this
// method automatically.
//
// @visibility external    
//<
hideDropLine : function () {
    if (this._dropLine) this._dropLine.hide();
},
	
//> @attr layout.dropLine (AutoChild Canvas : null : R)
// Line showed to mark the drop position when components are being dragged onto this Layout.
// A simple Canvas typically styled via CSS.  The default dropLine.styleName is
// "layoutDropLine".
// @visibility external
// @example dragMove
//<

dropLineDefaults : {
    styleName:"layoutDropLine",
    overflow:"hidden",
    isMouseTransparent:true // to prevent dropline occlusion of drop events
},
makeDropLine : function () {
    var dropLine = this.createAutoChild("dropLine", null, isc.Canvas);
    dropLine.dropTarget = this; // delegate dropTarget
    return dropLine;
},

// ResizeBar handling
// --------------------------------------------------------------------------------------------

createResizeBar : function (member, position, targetAfter, hideTarget) {
    var bar = this.createAutoChild("resizeBar", {
        target: member,
        targetAfter: targetAfter,
        hideTarget: hideTarget,
        layout: this,
        vertical: !this.vertical,
        dragScrollDirection: this.vertical ? isc.Canvas.VERTICAL : isc.Canvas.HORIZONTAL
    }, this.resizeBarClass);

    return isc.SGWTFactory.extractFromConfigBlock(bar);
},

makeResizeBar : function (member, offset, position, length) {

    // create a resizerBar for this member
    var bar = member._resizeBar;
    var nextMember = this.getMember(this.getMemberNumber(member)+1) || member;

    if (bar == null) {
        var target = member,
            targetAfter, 
            hideTarget;

        if (member.resizeBarTarget == "next") {
            target = nextMember;
            targetAfter = true;
        }

        // by default a resizeBar will target the same member for both resizing and hiding.  
        // This flag allows us to resize one member but hide another.  Not documented until we
        // see an actual request for this; just covering all the cases
        
        if (member.resizeBarHideTarget != null) {
            if (member.resizeBarHideTarget == "next") hideTarget = nextMember;
            else hideTarget = member;
        } else {
            hideTarget = target;
        }

        bar = this.createResizeBar(target, position, targetAfter, hideTarget);
        member._resizeBar = bar;
    }

    // for handling resizeBar joints in nested layouts
    //this._handleJoints(bar);
    // position bar as top-level widget
    //offset += (this.vertical ? this.getPageLeft() : this.getPageTop());
    //position += (this.vertical ? this.getPageTop() : this.getPageLeft());

    // place the bar after the member
    if (this.vertical) {
        bar.setRect(offset, position,
                    length, this.resizeBarSize);
    } else {
        if (this.isRTL()) position -= this.resizeBarSize;
        bar.setRect(position, offset, 
                    this.resizeBarSize, length);
    }
    // add the bar as a child/peer (will no-op second time around)
    if (this.membersAreChildren) {
        this.addChild(bar);
    } else {
        this.addPeer(bar);
    }

    // draw the bar (this won't happen automatically)
    if (!bar.isDrawn()) bar.draw();
    // May have been hidden by a previous stackMembers call
    if (!bar.isVisible()) bar.show();

    // Always float the resizeBar above the 2 members it is attached to
    
    if (nextMember != member && nextMember.getZIndex() > member.getZIndex()) {
        bar.moveAbove(nextMember);
    } else {
        bar.moveAbove(member);
    }
    
    return bar;
},



_reflowOnChangeProperties:{
    align:true,
    defaultLayoutAlign:true,
    reverseOrder:true,
    vertical:true,
    orientation:true,
    vPolicy:true,
    minMemberSize:true,
    minMemberLength:true,
    minMemberBreadth:true,
    hPolicy:true,
    membersMargin:true    
},
propertyChanged : function (propertyName, value) {
    this.invokeSuper(isc.Layout, "propertyChanged", propertyName, value);
    if (this._reflowOnChangeProperties[propertyName]) {
    
        // layoutChildren will skip resizing members if the breadth is unchanged and
        // the length policy is "none". Explicitly set the "_breadthChanged" flag to
        // force a resize of members if we hit this case but we changed a property which
        // requires a resize
        if (propertyName == "minMemberSize" ||
            propertyName == "minMemberLength" ||
            propertyName == "minMemberBreadth" ||
            propertyName == "hPolicy" ||
            propertyName == "vPolicy")
        {
            this._breadthChanged = true;
        }
    
        this.reflow("Reflow for change to " + propertyName);
    } else if (isc.endsWith(propertyName, "Margin")) this.setLayoutMargin();
},

// Debug output
// --------------------------------------------------------------------------------------------

getLengthAxis : function () { return this.vertical ? "height" : "width" },

_reportResize : function (member, breadth, length) {
    // report this size change if it's non a no-op.  We go through some contortions here in
    // order to report the resize before we actually do it, because it makes the logs much
    // easier to read
    var width = this.vertical ? breadth : length,
        height = this.vertical ? length : breadth,
        deltaX = member.getDelta("width", width, member.getWidth()),
        deltaY = member.getDelta("height", height, member.getHeight());
    if ((deltaX != null && deltaX != 0) || (deltaY != null && deltaY != 0)) {
        this.logDebug("resizing " + member + 
            (member.isDrawn() ? " (drawn): " : ": ") + 
            (breadth != null ? breadth + (this.vertical ? "w " : "h ") : "") +
            (length != null ? length + (this.vertical ? "h" : "w") : ""), "layout");
    }
},

reportSizes : function (layoutInfo, reason) {
    if (!this.logIsInfoEnabled(this._$layout)) return;

    var output = "layoutChildren (reason: " + reason + 
        "):\nlayout specified size: " + this.getWidth() + "w x " + this.getHeight() + "h\n" +
        "drawn size: " + this.getVisibleWidth(true) + "w x " + this.getVisibleHeight(true) + "h\n" +
        "available size: " + 
        this.getInnerWidth() + (!this.vertical ? "w (length) x " : "w x ") +
        this.getInnerHeight() + (this.vertical ? "h (length)\n" : "h\n");

    // report the length and breadth each member was sized to and why
    for (var i = 0; i < layoutInfo.length; i++) {
        var memberInfo = layoutInfo[i];
        output += "   " + this.members[i] + "\n";
        output += "      " + memberInfo._visibleLength + " drawn length" +
            (memberInfo._resizeLength ? " (resizeLength: " + memberInfo._resizeLength + ")" : "") +
            " (policyLength: " + memberInfo._policyLength + ")" +
            " (" + memberInfo._lengthReason + ")\n";
        output += "      " + memberInfo._breadth + " drawn breadth (" + memberInfo._breadthReason + ")\n";
    }

    if (layoutInfo.length == 0) output += "[No members]";

    this.logInfo(output, "layout");
}
	
});

// Preconfigured Layout classes
// --------------------------------------------------------------------------------------------

//>	@class	HLayout
//
//  A subclass of Layout that applies a sizing policy along the horizontal axis, interpreting
//  percent and "*" sizes as proportions of the width of the layout. HLayouts will set any members
//  that do not have explicit heights to match the layout.
//
// @inheritsFrom Layout
// @see Layout.hPolicy
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("HLayout","Layout").addProperties({
    orientation:"horizontal"
});

//>	@class	VLayout
//
//  A subclass of Layout that applies a sizing policy along the vertical axis, interpreting
//  percent and "*" sizes as proportions of the height of the layout. VLayouts will set any
//  members that do not have explicit widths to match the layout.
//
// @see Layout.vPolicy
// @inheritsFrom Layout
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("VLayout","Layout").addProperties({
    orientation:"vertical"
});


//>	@class	HStack
//
// A subclass of Layout that simply stacks members on the horizontal axis without trying to
// manage their width.  On the vertical axis, any members that do not have explicit heights will
// be sized to match the height of the stack.
//
// @inheritsFrom Layout
// @see Layout.hPolicy
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("HStack","Layout").addProperties({
    orientation:"horizontal",
    hPolicy:isc.Layout.NONE,
    // NOTE: set a small defaultWidth since typical use is auto-sizing to contents on the
    // length axis, in order to avoid a mysterious 100px minimum length.  Since this is just a
    // defaultWidth, this really only affects HStacks which are not nested inside other
    // Layouts/Stacks
    defaultWidth:20
});

//>	@class	VStack
//
// A subclass of Layout that simply stacks members on the vertical axis without trying to
// manage their height.  On the horizontal axis, any members that do not have explicit widths
// will be sized to match the width of the stack.
//
// @see Layout.vPolicy
// @inheritsFrom Layout
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("VStack","Layout").addProperties({
    orientation:"vertical",
    vPolicy:isc.Layout.NONE,
    defaultHeight:20 // see defaultWidth setting for HStack above
});

// LayoutSpacer
// --------------------------------------------------------------------------------------------

//> @class LayoutSpacer
// Add a spacer to a +link{Layout} that takes up space just like a normal member, without actually
// drawing anything. A <code>LayoutSpacer</code> is semantically equivalent to using an empty canvas,
// but higher performance for this particular use case.
//
// @inheritsFrom Canvas
// @treeLocation Client Reference/Layout
// @visibility external
//<
// NOTE: LayoutSpacer is a Canvas so that it can respond to all sizing, etc, methods, however, it
// never actually draws.
isc.defineClass("LayoutSpacer", "Canvas").addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true
});

//> @class FixedSpacer
// This class is a synonym for LayoutSpacer that can be used to make intent clearer.
// It is used by some development tools for that purpose.
//
// @inheritsFrom LayoutSpacer
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("FixedSpacer", "LayoutSpacer").addMethods({
    height: 5
});

//> @class FlexSpacer
// This class is a synonym for LayoutSpacer that can be used to make intent clearer.
// It is used by some development tools for that purpose.
//
// @inheritsFrom LayoutSpacer
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("FlexSpacer", "LayoutSpacer").addMethods({
    height: 5
});

// register 'members' as a dup-property. This means if a layout subclass instance prototype
// has 'members' assigned it'll be duplicated (and shallow cloned) on instances.
isc.Layout.registerDupProperties("members");


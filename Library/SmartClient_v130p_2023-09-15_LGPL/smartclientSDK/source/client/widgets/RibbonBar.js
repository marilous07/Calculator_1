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
//> @class RibbonBar
// A +link{class:ToolStrip, ToolStrip-based} class for showing 
// +link{class:RibbonGroup, groups} of +link{class:RibbonButton, RibbonButtons}s.
//
// @inheritsFrom ToolStrip
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("RibbonBar", "ToolStrip").addProperties({
    //> @attr ribbonBar.showGroupTitle (Boolean : true : IR)
    // If set, this attribute affects whether +link{class:RibbonGroup, RibbonGroups}
    // in this <code>RibbonBar</code> show their header control.  You can override this at the 
    // +link{ribbonGroup.setShowTitle, individual RibbonGroup} level.
    // @group ribbonGroup
    // @visibility external
    //<
    showGroupTitle : true,
    
    //> @attr ribbonBar.groupTitleAlign (Alignment : "center" : IR)
    // If set, this attribute affects the alignment of the titles in 
    // +link{class:RibbonGroup, RibbonGroups} in this <code>RibbonBar</code>.  You can 
    // override this at the +link{RibbonGroup.titleAlign, individual RibbonGroup} level.
    // @group ribbonGroup
    // @visibility external
    //<
    groupTitleAlign : "center",

    //> @attr ribbonBar.groupTitleOrientation (VerticalAlignment : "top" : IR)
    // If set, this attribute affects the orientation of the titles in 
    // +link{class:RibbonGroup, RibbonGroups} in this <code>RibbonBar</code>.  You can 
    // override this at the +link{RibbonGroup.titleOrientation, individual RibbonGroup} level.
    // @group ribbonGroup
    // @visibility external
    //<
    groupTitleOrientation : "top",

    membersMargin: 2,
    layoutMargin: 2,
    
    groupConstructor: "RibbonGroup",
    
    //> @method ribbonBar.addGroup()
    // Add a new group to this RibbonBar. You can either create your group externally and pass 
    // it in, or you can pass a properties block from which to automatically construct it.
    //
    // @param group (RibbonGroup) the new group to add to this ribbon
    // @param [position] (Integer) the index at which to insert the new group
    // @group ribbonGroup
    // @visibility external
    //<
    addGroup : function (group, position) {
        if (!group) return null;

        if (!isc.isA.Class(group)) {
            var cons = this.groupConstructor;
            if (isc.isA.String(cons)) {
                cons = isc.ClassFactory.getClass(this.groupConstructor, true);
            }
            group = cons.create(group);
        }

        if (!group || !isc.isA.RibbonGroup(group)) return null;

        // apply some overrides here
        if (group.showTitle == null) group.setShowTitle(this.showGroupTitle);
        if (!group.titleAlign) group.setTitleAlign(this.groupTitleAlign);
        if (!group.titleOrientation) group.setTitleOrientation(this.groupTitleOrientation);

        this.addMember(group, position);
        return group;
    },
    
    destroy : function () {
        // destroy all the children
        if (this.members) {
            for (var i=0; i<this.members.length; i++) {
                var m = this.members[i];
                if (m && !m.destroying && !m.destroyed) m.destroy();
                this.members[i] = null;
                m = null;
            }
        }
        return this.Super("destroy", arguments);
    }

});

//> @class RibbonGroup
// 
// A widget that groups +link{class:RibbonButton, RibbonButtons}s for use in 
// +link{class:RibbonBar, RibbonBars}.
// 
// @inheritsFrom VLayout
// @treeLocation Client Reference/Layout/RibbonBar
// @visibility external
//<
isc.defineClass("RibbonGroup", "VLayout").addProperties({
    //> @attr ribbonGroup.newControlConstructor (Class : "RibbonButton" : IR)
    // Widget class for controls +link{createControl, created automatically} by this 
    // RibbonGroup.  Since +link{newControlConstructor, such controls} are created via the 
    // autoChild system, they can be further customized via the newControlProperties property.
    // @group ribbonGroup
    // @visibility external
    //<
    newControlConstructor: "RibbonButton",
    //> @attr ribbonGroup.newControlDefaults (MultiAutoChild RibbonButton : null : IR)
    // Properties used by +link{ribbonGroup.createControl, createControl} when creating new
    // controls.
    // @group ribbonGroup
    // @visibility external
    //<
    newControlDefaults: {
    },

    //> @method ribbonGroup.createControl()
    // Creates a new control and adds it to this RibbonGroup.  The control is created using the 
    // autoChild system, according to the specified
    // +link{ribbonGroup.newControlConstructor, constructor} and the passed properties are
    // applied to it.
    //
    // @param properties (Canvas Properties) properties to apply to the new control
    // @param [position] (Integer) the index at which to insert the new control
    // 
    // @visibility external
    //<
    createControl : function (properties, position) {
        var newControl = this.createAutoChild("newControl", properties);

        return this.addControl(newControl, position);
    },

    groupConstructor: "RibbonGroup",
    //> @attr ribbonGroup.styleName (CSSStyleName : "ribbonGroup" : IRW)
    // CSS class applied to this RibbonGroup.
    // @group appearance
    // @setter setStyleName()
    // @visibility external
    //<
    styleName: "ribbonGroup",

    canAcceptDrop: true,
    canDropComponents: false,
    
    drop : function (event, eventInfo) {
        var control = isc.EventHandler.getDragTarget();
        if (control) {
            this.addControl(control);
        }
        return false;
    },

    membersMargin: 1,
    
    layoutAlign: "top",
    
    autoDraw: false,
    
    height: 1,
    width: 1,
    overflow: "visible",

    //> @attr ribbonGroup.controls (Array of Canvas : null : IRW)
    // The array of controls to show in this group.
    //
    // @group ribbonGroup
    // @visibility external
    //<

    //> @attr ribbonGroup.labelLayout (AutoChild HLayout : null : IR)
    // HLayout autoChild that houses the +link{RibbonGroup.label, label} 
    // in which the +link{RibbonGroup.title, title text} is displayed.
    // <P>
    // This can be customized via the standard +link{type:AutoChild} pattern.
    // @visibility external
    //<

    labelLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        autoDraw: false,
        height: 22
    },

    //> @attr ribbonGroup.labelConstructor (String : "Label" : IRA)
    // SmartClient class for the +link{RibbonGroup.label, title label} AutoChild.
    // @visibility external
    //<
    labelConstructor: "Label",

    //> @attr ribbonGroup.label (AutoChild Label : null : IR)
    // AutoChild +link{class:Label, Label} used to display the 
    // +link{RibbonGroup.title, title text} for this group.
    // <P>
    // Can be customized via the standard +link{type:AutoChild} pattern, and various 
    // convenience APIs exist for configuring it after initial draw: see 
    // +link{RibbonGroup.setShowTitle, setShowTitle}, 
    // +link{RibbonGroup.setTitle, setTitle}, 
    // +link{RibbonGroup.setTitleAlign, setTitleAlign},
    // +link{RibbonGroup.setTitleHeight, setTitleHeight},
    // +link{RibbonGroup.setTitleOrientation, setTitleOrientation} and
    // +link{RibbonGroup.setTitleStyle, setTitleStyle}.
    // @visibility external
    //<
    labelDefaults: {
        width: "100%",
        height: 18,
        autoDraw: false,
        wrap: false,
        overflow: "visible",
        canAcceptDrop: false
    },

    //> @attr ribbonGroup.titleAlign (Alignment : "center" : IRW)
    // Controls the horizontal alignment of the group's 
    // +link{RibbonGroup.title, title-text}, within its 
    // +link{RibbonGroup.label, label}.  Setting this
    // attribute overrides the default specified by 
    // +link{ribbonBar.groupTitleAlign, groupTitleAlign} on the containing 
    // +link{class:RibbonBar, RibbonBar}.
    // @setter RibbonGroup.setTitleAlign
    // @group ribbonGroup
    // @visibility external
    //<
    titleAlign: "center",

    //> @attr ribbonGroup.titleStyle (CSSStyleName : "ribbonGroupTitle" : IRW)
    // CSS class applied to the +link{RibbonGroup.label, title label} in this group.
    // @setter RibbonGroup.setTitleStyle
    // @visibility external
    //<
    titleStyle: "ribbonGroupTitle",

    //> @attr ribbonGroup.autoSizeToTitle (Boolean : true : IR)
    // By default, <code>RibbonGroups</code> are assigned a minimum width that allows the 
    // entire title to be visible.  To prevent this behavior and have group-titles cut off 
    // when they're wider than the buttons they contain, set this attribute to false
    // @group title
    // @visibility external
    //<
    autoSizeToTitle: true,

    //> @attr ribbonGroup.titleOrientation (VerticalAlignment : "top" : IRW)
    // Controls the +link{RibbonGroup.titleOrientation, vertical orientation} of 
    // this group's +link{RibbonGroup.label, title label}.  Setting this
    // attribute overrides the default specified by 
    // +link{ribbonBar.groupTitleOrientation, groupTitleOrientation} on the containing 
    // +link{class:RibbonBar, RibbonBar}.
    // @setter RibbonGroup.setTitleOrientation
    // @group ribbonGroup
    // @visibility external
    //<
    titleOrientation: "top",

    //> @attr ribbonGroup.titleProperties (AutoChild Label : null : IRW)
    // AutoChild properties for fine customization of the 
    // +link{RibbonGroup.label, title label}.
    // @visibility external
    // @deprecated set these properties directly via the +link{RibbonGroup.label, label autoChild}
    //<
    
    //> @attr ribbonGroup.titleHeight (int : 18 : IRW)
    // Controls the height of the +link{RibbonGroup.label, title label} in this group.
    // @setter RibbonGroup.setTitleHeight
    // @visibility external
    //<
    titleHeight: 18,

    //> @attr ribbonGroup.body (AutoChild HLayout : null : IR)
    // HLayout autoChild that manages multiple +link{RibbonGroup.columnLayout, VLayouts} 
    // containing controls.
    // @visibility external
    //<

    //> @attr ribbonGroup.bodyConstructor (String : "HLayout" : IRA)
    // SmartClient class for the body.
    // @visibility external
    //<
    bodyConstructor:"HLayout",

    bodyDefaults: {
        width: "100%",
        height: "*",
        overflow: "visible",
        membersMargin: 2,
        autoDraw: false,
        canAcceptDrop: false
    },

    //> @attr ribbonGroup.columnLayout (MultiAutoChild VLayout : null : IR)
    // AutoChild VLayouts created automatically by groups.  Each manages a single column of
    // child controls in the group.  Child controls that support <code>rowSpan</code> may 
    // specify it in order to occupy more than one row in a single column.  See 
    // +link{RibbonGroup.numRows, numRows} for related information.
    // @visibility external
    //<
    // some autochild defaults for the individual VLayouts that represent columns
    columnLayoutDefaults: {
        _constructor: "VLayout",
        width: 1,
        membersMargin: 2,
        height: "100%",
        overflow: "visible",
        autoDraw: false,
        numRows: 0,
        canAcceptDrop: false,
        addMember : function (member, position) {
            this.Super("addMember", arguments);
    
            if (member.rowSpan == null) member.rowSpan = 1;
            var height = member.rowSpan * this.creator.rowHeight + 
                ((member.rowSpan-1) * this.membersMargin);

            if (member.vertical) {
                member.rowSpan = this.maxRows;
                height = (member.rowSpan * this.creator.rowHeight) + 
                    ((this.maxRows-1) * this.membersMargin);
            }
            member.setHeight(height);
            this.numRows += member.rowSpan;
            if (this.numRows > this.maxRows) this.numRows = this.maxRows;
        },
        removeMember : function (member) {
            this.Super("removeMember", arguments);

            delete member._currentColumn;
            if (member._dragPlaceHolder) return;
            if (member.rowSpan == null) member.rowSpan = 1;
            this.numRows -= member.rowSpan;

            // don't destroy members
        }
    },

    //> @attr ribbonGroup.numRows (Number : 1 : IRW)
    // The number of rows of controls to display in each column.  Each control will take one
    // row in a +link{RibbonGroup.columnLayout, columnLayout} by default, but those that 
    // support the feature may specify <code>rowSpan</code> to override that.
    // <P>
    // Note that settings like this, which affect the group's layout, are not applied directly
    // if changed at runtime - a call to +link{RibbonGroup.reflowControls, reflowControls} 
    // will force the group to reflow.
    // @visibility external
    //<
    numRows: 1,

    //> @attr ribbonGroup.rowHeight (Number : 26 : IRW)
    // The height of rows in each column.
    // @visibility external
    //<
    rowHeight: 26,

    defaultColWidth: "*",

    initWidget : function () {
        this.Super("initWidget", arguments);

        var showLabel = this.showTitle != false && this.showLabel != false;

        if (showLabel) {
            this.addAutoChild("labelLayout", { height: this.titleHeight });

            var labelProps = isc.addProperties({}, this.titleProperties || {}, {
                styleName: this.titleStyle,
                height: this.titleHeight,
                maxHeight: this.titleHeight,
                align: this.titleAlign,
                contents: this.title,
                autoDraw: false
            });
            
            if (this.autoSizeToTitle == false) labelProps.overflow = "hidden";

            this.addAutoChild("label", labelProps);

            this.labelLayout.addMember(this.label);
            
            if (this.showTitle == false) this.labelLayout.hide();
            this.addMember(this.labelLayout);
        }

        this.addAutoChild("body", {
            _constructor: this.bodyConstructor,
            height: this.numRows * this.rowHeight,
            parentResized : function () {
                var newWidth = this.getVisibleWidth();
                if (this.parentElement.label) this.parentElement.label.setWidth(newWidth);
            }
        });

        this.addMember(this.body, showLabel ? (this.titleOrientation == "bottom" ? 0 : 1) : 0);

        // observe body-resize
        this.observe(this.body, "resized", "observer.bodyResized(observed);");

        var controls = this.controls || [];
        this.controls = [];
        if (!this.editingOn && controls.length > 0) {
            // if not in editMode, add the controls - editMode adds them with separate calls to
            // addControl()
            this.setControls(controls);
        }
    },

    // resize the title labelLayout when the body overflows, so it always fills width
    bodyResized : function (body) {
        var newWidth = this.getInnerWidth();
        if (newWidth < 0) {
            newWidth =  body ? body.getVisibleWidth() : this.getVisibleWidth();
        }
        if (this.labelLayout) this.labelLayout.setWidth(newWidth);
    },

    destroy : function () {
        // ignore body-resize
        this.ignore(this.body, "resized");
        for (var i=0; i<this.controls.length; i++) {
            // ignore visibilityChanged observation
            this.ignoreControl(this.controls[i]);
            this.controls[i].destroy();
            this.controls[i] = null;
        }
        if (this.members) {
            for (var i=0; i<this.members.length; i++) {
                var m = this.members[i];
                if (m && !m.destroying && !m.destroyed) m.destroy();
                this.members[i] = null;
                m = null
            }
        }
        return this.Super("destroy", arguments);
    },

    //> @attr ribbonGroup.title (String : null : IRW)
    // The title text to display in this group's 
    // +link{RibbonGroup.label, title label}.
    // @setter RibbonGroup.setTitle
    // @group ribbonGroup
    // @visibility external
    //<

    //> @method ribbonGroup.setTitle()
    // Sets the +link{RibbonGroup.title, text} to display in this group's
    // +link{RibbonGroup.label, title label} after initial draw.
    // 
    // @param title (String) The new title for this group
    // @visibility external
    //<
    setTitle : function (title) {
        this.title = title;
        if (this.label) this.label.setContents(this.title);
    },

    //> @method ribbonGroup.setShowTitle()
    // This method forcibly shows or hides this group's 
    // +link{RibbonGroup.label, title label} after initial draw.
    // @param showTitle (boolean) should the title be shown or hidden?
    // @visibility external
    //<
    setShowTitle : function (showTitle) {
        this.showTitle = showTitle;
        if (!showTitle && this.labelLayout && this.labelLayout.isVisible()) this.labelLayout.hide();
        else if (showTitle && this.labelLayout && !this.labelLayout.isVisible()) this.labelLayout.show();
    },

    //> @method ribbonGroup.setTitleAlign()
    // This method forcibly sets the horizontal alignment of the 
    // +link{RibbonGroup.title, title-text}, within the 
    // +link{RibbonGroup.label, title label}, after initial draw.
    // @param align (Alignment) the new alignment for the text, left or right
    // @group ribbonGroup
    // @visibility external
    //<
    setTitleAlign : function (align) {
        this.titleAlign = align;
        if (this.label) this.label.setAlign(this.titleAlign);
    },

    //> @method ribbonGroup.setTitleStyle()
    // This method forcibly sets the +link{RibbonGroup.titleStyle, CSS class name}  
    // for this group's +link{RibbonGroup.label, title label} after initial draw.
    // 
    // @param styleName (CSSStyleName) the CSS class to apply to the 
    //                                 +link{RibbonGroup.label, title label}.
    // @visibility external
    //<
    setTitleStyle : function (styleName) {
        this.titleStyle = styleName;
        if (this.label) {
            this.label.setStyleName(this.titleStyle);
            if (this.label.isDrawn()) this.label.redraw();
        }
    },

    //> @method ribbonGroup.setTitleOrientation()
    // This method forcibly sets the 
    // +link{RibbonGroup.titleOrientation, vertical orientation} of this group's 
    // +link{RibbonGroup.label, title label} after initial draw.
    // @param orientation (VerticalAlignment) the new orientation for the title, either bottom or top
    // @group ribbonGroup
    // @visibility external
    //<
    setTitleOrientation : function (orientation) {
        this.titleOrientation = orientation;
        if (this.label && this.labelLayout) {
            if (this.titleOrientation == "top") {
                this.removeMember(this.labelLayout);
                this.addMember(this.labelLayout, 0);
            } else if (this.titleOrientation == "bottom") {
                this.removeMember(this.labelLayout);
                this.addMember(this.labelLayout, 1);
            }
        }
    },

    //> @method ribbonGroup.setTitleHeight()
    // This method forcibly sets the height of this group's 
    // +link{RibbonGroup.label, title label} after initial draw.
    // 
    // @param titleHeight (int) the new height for the +link{RibbonGroup.label, title label}
    // @visibility external
    //<
    setTitleHeight : function (titleHeight) {
        this.titleHeight = titleHeight;
        if (this.label) this.label.setHeight(this.titleHeight);
    },

    addColumn : function (index, controls) {
        var undef;
        if (index === null || index === undef) {
            index = this.body.members.length;
        }
        
        var colWidth = this.defaultColWidth;
        if (this.colWidths && this.colWidths[index] != null) colWidth = this.colWidths[index];

        var props = { maxRows: this.numRows, numRows: 0, width: colWidth, 
            height: this.body.getInnerHeight()
        };
        var newColumn = this.createAutoChild("columnLayout", props);
        this.body.addMember(newColumn, index);

        if (controls) newColumn.addMembers(controls);

        return newColumn;
    },

    autoFillColumns: false,
    getAvailableColumn : function (createIfUnavailable) {
        var members = this.body.members;

        if (members && members.length > 0) {
            var member;
            if (this.autoFillColumns) {
                for (var i=0; i<members.length; i++) {
                    member = members[i];
                    //this.logWarn("member " + member + " numRows is " + member.numRows);
                    if (member.numRows < member.maxRows) return member;
                }
            } else {
                member = members[members.length-1];
                //isc.logWarn("ID: " + member.ID + " -- numRows: " + member.numRows + " -- maxRows: " + member.maxRows);
                if (member.numRows < member.maxRows) return member;
            }
        }

        if (createIfUnavailable != false) return this.addColumn();
        return null;
    },

    //> @method ribbonGroup.getControlColumn()
    // Return the +link{RibbonGroup.columnLayout, column widget} that contains the passed 
    // control.
    // 
    // @param control (Canvas) the control to find in this group
    // @return (Layout) the column widget containing the passed control
    // @visibility external
    //<
    getControlColumn : function (control) {
        var members = this.body.members;

        if (members && members.length > 0) {
            for (var i=members.length-1; i>=0; i--) {
                if (members[i].members.contains(control)) return members[i];
            }
        }

        return null;
    },

    //> @method ribbonGroup.setControls()
    // Clears the array of controls and then adds the passed array to this group, 
    // creating new +link{RibbonGroup.columnLayout, columns} as necessary, according to each
    // control's <code>rowSpan</code> attribute and the group's 
    // +link{RibbonGroup.numRows, numRows} attribute.
    // 
    // @param controls (Array of Canvas) an array of widgets to add to this group
    // @visibility external
    //<
    setControls : function (controls, store) {
        this._settingControls = true;
        if (this.controls) {
            // don't remove all the controls if not drawn - not clear we ever
            // need to do this, in fact, since _updateControls() does it...
            if (this.isDrawn()) this.removeAllControls();
        }
        this.controls = controls;
        this._updateControls();
        // observe visibilityChanged on each control, to reflow at runtime
        for (var i=0; i<this.controls.length; i++) {
            this.observeControl(this.controls[i]);
        }
        delete this._settingControls;
    },

    //> @method ribbonGroup.reflowControls()
    // Forces this group to reflow following changes to attributes that affect layout, like 
    // +link{RibbonGroup.numRows, numRows}.
    // 
    // @visibility external
    //<
    reflowControls : function () {
        this._updateControls();
    },

    //> @method ribbonGroup.addControls()
    // Adds an array of controls to this group, creating new 
    // +link{RibbonGroup.columnLayout, columns} as necessary, according to each control's 
    // <code>rowSpan</code> value and the group's 
    // +link{RibbonGroup.numRows, numRows} value.
    // 
    // @param controls (Array of Canvas) an array of widgets to add to this group
    // @visibility external
    //<
    addControls : function (controls, store) {
        if (!controls) return;
        if (!isc.isAn.Array(controls)) controls = [controls];

        for (var i=0; i<controls.length; i++) {
            this.addControl(controls[i], null, store);
        }
    },

    //> @method ribbonGroup.addControl()
    // Adds a control to this <code>RibbonGroup</code>, creating a new 
    // +link{RibbonGroup.columnLayout, column} as necessary, according to the control's 
    // <code>rowSpan</code> value and the group's 
    // +link{RibbonGroup.numRows, numRows} value.
    // 
    // @param control (Canvas) a widget to add to this group
    // @param [index] (Integer) optional insertion index for this control
    // @visibility external
    //<
    addControl : function (control, index, skipUpdate) {
        if (!control) return null;
        if (this.controls.contains(control)) this.controls.remove(control);
        if (index == null) index = this.controls.length;
        control._ribbonGroup = this;
        // observe visibility changed on the control
        this.observeControl(control);
        this.controls.addAt(control, index);
        if (!skipUpdate) this._updateControls();
    },
    _addControl : function (control) {
        var column;
        if (control.vertical) {
            column = this.addColumn()
        } else {
            column = this.getAvailableColumn(true);
        }
        control._ribbonGroup = this;
        control._currentColumn = column.getID();
        column.addMember(control);
        if (!column.isVisible()) column.show(); 
        column.reflowNow();
    },
    
    _updateControls : function () {
        this._updatingControls = true;
        for (var i=0; i<this.controls.length; i++) {
            var control = this.controls[i];
            if (control._currentColumn) {
                var canvas = isc.Canvas.getById(control._currentColumn);
                //if (canvas && !canvas.destroyed) canvas.members.remove(control);
                if (canvas && !canvas.destroyed) canvas.removeMember(control);
            }
            this.addChild(control, null, false);
            delete control._currentColumn;
        }
        this.body.members.callMethod("hide");

        for (var i=0; i<this.controls.length; i++) {
            var control = this.controls[i];
            if (!control.isVisible()) continue;
            this._addControl(control);
        }
        delete this._updatingControls;
    },

    //> @method ribbonGroup.removeControl()
    // Removes a control from this <code>RibbonGroup</code>, destroying an existing 
    // +link{RibbonGroup.columnLayout, column} if this is the last widget in that column.
    // 
    // @param control (Canvas) a widget to remove from this group
    // @visibility external
    //<
    autoHideOnLastRemove: false,
    removeControl : function (control) {
        control = isc.isAn.Object(control) ? control : this.getMember(control);
        if (!control) return null;

        if (this.controls.contains(control)) this.controls.remove(control);
        this.getControlColumn(control).removeMember(control);
        control._ribbonGroup = null;
        this.ignoreControl(control);
        this._updateControls();
        if (this.body.members.length == 0 && this.autoHideOnLastRemove) {
            // hide ourselves
            this.hide();
        }
    },
    // observe _visibilityChanged on child controls to enable runtime reflow - 
    // visibilityChanged() doesn't run before draw() and setVisibility() doesn't
    // imply that visibility actually changed
    observeControl : function (control) {
        if (!this.isObserving(control, "_visibilityChanged")) {
            this.observe(control, "_visibilityChanged", "observer.controlVisibilityChanged(observed);");
        }
    },
    // clear _visibilityChanged observation on child controls
    ignoreControl : function (control) {
        if (this.isObserving(control, "_visibilityChanged")) {
            this.ignore(control, "_visibilityChanged");
        }
    },
    controlVisibilityChanged : function (control) {
        if (this._settingControls || this._updatingControls) {
            return;
        }
        if (!this.isDrawn()) {
            this.logInfo("Delaying _updateControls() until draw()");
            this._updateControlsOnDraw = true;
            return;
        }
        this.logInfo(control.ID + " - visibility changed - Updating controls");
        this._updateControls();
    },

    removeAllControls : function () {
        if (!this.controls || this.controls.length == 0) return null;

        for (var i=0; i<this.controls.length; i++) {
            var control = this.controls[i];
            control.hide();
            if (control._currentColumn) {
                var canvas = isc.Canvas.getById(control._currentColumn);
                //if (canvas && !canvas.destroyed) canvas.members.remove(control);
                if (canvas && !canvas.destroyed && canvas.members.contains(control)) {
                    canvas.removeMember(control);
                }
            }
            this.controls[i] = null;
        }

        // clear out nulls - that is, any controls that got destroyed
        this.controls = [];

        this._updateControls();

        // shrink the group's body layout, so it can overflow properly when new controls arrive
        this.body.height = 1;
        this.height = 1;
        //this.redraw();
    },
    
    resized : function () {
        if (this.destroyed || this.destroying) return;
        this._updateLabel();
    },
    
    draw : function () {
        if (this.destroyed || this.destroying) return;
        this.Super("draw", arguments);
        this._updateLabel();
        if (this._updateControlsOnDraw) {
            delete this._updateControlsOnDraw;
            this._updateControls();
        }
    },

    redraw : function () {
        if (this.destroyed || this.destroying) return;
        this.Super("redraw", arguments);
        this._updateLabel();
    },

    _updateLabel : function () {
        //this.logWarn("in _updateLabel")

        
        var innerWidth = this.getInnerWidth(),
            newWidth = innerWidth
        ;
        if (newWidth < 0) {
            newWidth =  this.body ? this.body.getVisibleWidth() : this.getVisibleWidth();
        }

        if (this.label) this.label.setWidth(newWidth);	 
    }
    
});


//> @class RibbonButton
// A Button subclass that displays an +link{ribbonButton.icon, icon}, 
// +link{ribbonButton.showButtonTitle, title} and optional +link{ribbonButton.menuIconSrc, menuIcon} 
// and is capable of +link{ribbonButton.vertical, horizontal and vertical} orientation.
//
// @inheritsFrom Button
// @treeLocation Client Reference/Layout/RibbonBar
// @visibility external
//<
isc.defineClass("RibbonButton", "Button").addProperties({
    // have the super-class ignore it's icon - this widget puts the icon in titleHTML
    _ignoreIcon: true,

width: 1,
overflow: "visible",
height: 1,

autoDraw: false,

usePartEvents: true,

//> @attr ribbonButton.orientation (String : "vertical" : IRW)
// The orientation of this RibbonButton.  The default value, "vertical", renders 
// +link{ribbonButton.icon, icon}, +link{ribbonButton.showButtonTitle, title} and potentially 
// +link{ribbonButton.menuIconSrc, menuIcon}, from top to bottom: "horizontal" does the same 
// from top to bottom.
// @group layout
// @visibility external
// @deprecated in favor of +link{ribbonButton.vertical} which, if set, takes precendence over this setting
//<
orientation: "vertical",

//> @attr ribbonButton.vertical (boolean : false : IRW)
// Whether this button renders vertically.  Renders the 
// +link{ribbonButton.icon, icon}, +link{ribbonButton.showButtonTitle, title} and potentially 
// +link{ribbonButton.menuIconSrc, menuIcon} from top to bottom, when true, and from left to right
// when false.
// @group layout
// @visibility external
//<
setVertical : function (vertical) {
    if (this.vertical != vertical) {
        this.vertical = vertical;
        if (vertical) {
            this._hRowSpan = this.rowSpan;
            if (this._ribbonGroup) this.rowSpan = this._ribbonGroup.numRows;
        } else if (this._hRowSpan) {
            this.rowSpan = this._hRowSpan;
        }
    }
    this.setTitle(this.title);
    if (this._ribbonGroup) this._ribbonGroup._updateControls();
},

//> @attr ribbonButton.rowSpan (Number : 1 : IRW)
// When used in a +link{class:RibbonBar}, the number of rows this button should occupy in a
// single +link{RibbonGroup.columnLayout, column}.
// @group layout
// @visibility external
//<
rowSpan: 1,

//> @attr ribbonButton.baseStyle (CSSStyleName : "ribbonButton" : IRW)
// Default CSS class for this button.
// @group appearance
// @visibility external
//<
baseStyle: "ribbonButton",

//> @attr ribbonButton.showMenuIcon (Boolean : null : IRW)
// Whether to show the +link{menuIconSrc, menu-icon} which fires the +link{menuIconClick} 
// notification method when clicked.
// @group menu
// @visibility external
//<
showMenuIcon: null,

//> @attr ribbonButton.menuIconSrc (SCImgURL : "[SKINIMG]/Menu/submenu_down.png" : IRW)
// Base URL for an Image that shows a +link{class:Menu, menu} when clicked.  See also 
// +link{ribbonButton.showMenuIconDisabled} and +link{ribbonButton.showMenuIconOver}.
// @group menu
// @visibility external
//<
menuIconSrc: "[SKINIMG]/Menu/submenu_down.png",

//> @attr ribbonButton.menuIconWidth (Number : 14 : IRW)
// The width of the icon for this button.
// @group menu
// @visibility external
//<
menuIconWidth: 14,

//> @attr ribbonButton.menuIconHeight (Number : 13 : IRW)
// The height of the icon for this button.
// @group menu
// @visibility external
//<
menuIconHeight: 13,

menuConstructor: isc.Menu,

//> @attr ribbonButton.iconOrientation (String : null : IRW)
// This attribute is not supported in this subclass.  However, RTL mode is still supported.
// 
// @visibility external
//<

//> @attr ribbonButton.iconAlign (String : null : IRW)
// This attribute is not supported in this subclass.  However, RTL mode is still supported.
// 
// @visibility external
//<

//> @attr ribbonButton.align (Alignment : null : IRW)
// Horizontal alignment of this button's content.  If unset, 
// +link{ribbonButton.vertical, vertical buttons} are center-aligned and horizontal
// buttons left-aligned by default.
// @group appearance
// @visibility external
//<
align: null,

//> @attr ribbonButton.valign (VerticalAlignment : null : IRW)
// Vertical alignment of this button's content.  If unset, 
// +link{ribbonButton.vertical, vertical buttons} are top-aligned and horizontal
// buttons center-aligned by default.
// @group appearance
// @visibility external
//<
valign: null,

init : function () {
    // map deprecated "orientation" property to vertical, if that setting has been cleared
    if (this.vertical == null) {
        this.vertical = this.orientation == "vertical" ? true : false;
    }
    if (this.vertical) {
        this.align = this.align || "center";
        this.valign = this.valign || "top";
    } else {
        this.align = this.align || "left";
        this.valign = this.valign || "center";
    }
    this._originalAlign = this.align;
    this._originalVAlign = this.valign;

    // if showMenuIcon is not specifically turned off, turn it on if this.menu is set
    if (this.showMenuIcon != false && this.menu) this.showMenuIcon = true;

    return this.Super("init", arguments);
},
initWidget : function () {
    this.Super("initWidget", arguments);
},

//> @attr ribbonButton.showTitle (Boolean : null : IRW)
// showTitle is not applicable to this class - use +link{ribbonButton.showButtonTitle}
// instead.
//
// @visibility external
//<

//> @attr ribbonButton.showButtonTitle (Boolean : true : IRW)
// Whether to show the title-text for this RibbonButton.  If set to false, title-text is omitted
// altogether and just the icon is displayed.
// @group button
// @visibility external
//<
showButtonTitle: true,

//> @attr ribbonButton.showIcon (Boolean : null : IRW)
// Whether to show an Icon in this RibbonButton.  Set to false to render a text-only button.
// @group icon
// @visibility external
//<

//> @attr ribbonButton.icon (SCImgURL : null : IRW)
// Icon to show to the left of or above the title, according to the button's 
// +link{ribbonButton.vertical, orientation}.
// <P>
// When specifying <code>vertical = true</code>, this icon will be stretched to 
// the +link{largeIconSize} unless a +link{largeIcon} is specified.
// @group icon
// @visibility external
//<
icon: "[SKINIMG]actions/edit.png",

//> @attr ribbonButton.iconSize (Number : 16 : IRW)
// The size of the normal icon for this button.
// @group icon
// @visibility external
//<
iconSize: 16,

//> @method ribbonButton.setIcon()
// Sets a new Icon for this button after initialization.
// @param icon (SCImgURL) URL of new icon
// @group icon
// @visibility external
//<
setIcon : function (icon) {
    // this class sets Button._ignoreIcon on the super class, which prevents is from writing 
    // button.icon into the DOM - instead, RibbonButton.getTitleHTML() includes this.icon in 
    // the title HTML
    this.icon = icon;
    this.setTitle(this.title);
},
//> @method ribbonButton.getIcon()
// Returns the URL for the current icon.
// @return (SCImgURL) URL of current icon
// @group icon
// @visibility external
//<
getIcon : function () {
    return this.icon;
},

stateChanged : function () {
    if (this.destroyed || this.destroying) return;
    var result = this.Super("stateChanged", arguments);
    // rebuild the title, to include stateful icons for example
    //this.logWarn("in StateChanged")
    //this.redraw();
    //this.setTitle(this.title);
    return result;
},

//> @attr ribbonButton.largeIcon (SCImgURL : null : IRW)
// Icon to show above the title when +link{orientation} is "vertical".
// <P>
// If a largeIcon is not specified, the +link{icon, normal icon} will be stretched to 
// the +link{largeIconSize}.
// @group icon
// @visibility external
//<

//> @method ribbonButton.setLargeIcon()
// Sets a new Large-Icon for vertical buttons after initialization - synonymous with 
// +link{ribbonButton.setIcon, setIcon} for normal horizontal buttons.
// @group icon
// @visibility external
//<
setLargeIcon : function (icon) {
    // set the largeIcon and rebuild the title to incorporate it.
    this.largeIcon = icon;
    this.setTitle(this.title);
},

//> @attr ribbonButton.largeIconSize (Number : 32 : IRW)
// The size of the large icon for this button.  If +link{largeIcon} is not specified, the
// +link{icon, normal icon} will be stretched to this size.
// @group icon
// @visibility external
//<
largeIconSize: 32,

setTitle : function (title) {
    this.title = title;
    this.align = this._originalAlign;
    this.valign = this._originalVAlign;
    this.Super("setTitle", arguments);
},

titleSeparator: "&nbsp;",
getTitle : function () {
    return this.title;
},
getTitleHTML : function () {
    var isLarge = this.vertical,
        icon = this.showIcon == false ? null :
            (isLarge ? this.largeIcon || this.icon : this.icon),
        iconSize = (isLarge ? this.largeIconSize : this.iconSize),
        title = this.showButtonTitle ? this.title : ""
    ;

    if (icon == "") icon = null;

    // pick up disabled, over etc state if appropriate
    icon = this._getStatefulIconURL(icon);
    var img = icon ? this.imgHTML({
            src: icon,
            width: iconSize,
            height: iconSize,
            eventStuff: " eventpart='icon'",
            cssClass: isLarge ? this.baseStyle + "VIcon" : this.baseStyle + "HIcon"
        }) : null
    ;

    var menuIcon = null;
    if (this.showMenuIcon) {
        var menuIconUrl = this._getMenuIconURL();

        menuIcon = this.menuIcon = (this.showMenuIcon ? 
            this.imgHTML({
                src: menuIconUrl,
                width: this.menuIconWidth,
                height: this.menuIconHeight,
                name: "menuIcon",
                eventStuff: " eventpart='menuIcon'",
                cssClass: isLarge ? this.baseStyle + "VMenuIcon" : this.baseStyle + "HMenuIcon"
            }) : null);
        ;
    }

    //this.icon = null;
    
    var tempTitle = title;
    title = img || "";

    if (this.vertical) {
        if (this.showButtonTitle) {
            if (title != "") title += "<br>";
            title += tempTitle;
        }
        if (this.showMenuIcon && menuIcon) {
            title += "<br>";
            title += menuIcon;
        }
    } else {
        var titleSeparator = this.titleSeparator;
        
        if (isc.Browser.isChrome && isc.Browser.version == 78 && titleSeparator == "&nbsp;") {
            titleSeparator = " ";
        }
        
        this.valign = "center";
        if (this.showButtonTitle) {
            if (title != "") {
                title += titleSeparator;
            }
            title += "<span style='vertical-align:middle;align-content:center;'>" + tempTitle + "</span>";
        }
        if (this.showMenuIcon && menuIcon) {
            if (title != "") title += titleSeparator;
            title += menuIcon;
        }
    }

    return title;
},

_getMenuIconURL : function () {
    var state = this.state,
        selected = this.selected,
        customState = this.getCustomState(),
        sc = isc.StatefulCanvas
    ;

    //this.logWarn(isc.echoFull("state is " + state));

    // ignore states we don't care about
    if (state == sc.STATE_DOWN && !this.showMenuIconDown) state = null;
    else if (state == sc.STATE_DISABLED && !this.showMenuIconDisabled) state = null;
    else if (state == sc.STATE_OVER && (!this.showMenuIconOver || !this.showingMenuButtonOver)) 
        state = null;

    var focused = null; //this.showFocusedMenuIcon ? this.getFocusedState() : null; 
    var icon = this.menuIconSrc;
    return isc.Img.urlForState(icon, selected, focused, state, null, customState);
},

setHandleDisabled : function () {
    this.Super("setHandleDisabled", arguments);
    if (this.isDrawn()) this.setTitle(this.title);
},

mouseOut : function () {
    this.Super("mouseOut", arguments);
    
    if (this.showingMenuButtonOver) this.menuIconMouseOut();
},

//> @method ribbonButton.menuIconClick()
// Notification method fired when a user clicks on the menuIcon on this RibbonButton.  
// <smartclient>Return false to suppress the standard click handling code.</smartclient>
// <smartgwt>call <code>event.cancel()</code> to suppress the standard 
// click handling code.</smartgwt>
//
// @return (Boolean) return false to cancel event-bubbling
// @visibility external
//<
menuIconClick : function () { return true; },

//> @method ribbonButton.iconClick()
// Notification method fired when a user clicks on the +link{ribbonButton.icon, icon} in this 
// RibbonButton.  
// <smartclient>Return false to suppress the standard click handling code.</smartclient>
// <smartgwt>call <code>event.cancel()</code> to suppress the standard 
// click handling code.</smartgwt>
//
// @return (Boolean) return false to cancel event-bubbling
// @visibility external
//<
iconClick : function () { return true; },

//> @method ribbonButton.click()
// Notification method fired when a user clicks anywhere on this button.  If the click occurred
// directly on the +link{button.icon, icon} or the +link{ribbonButton.menuIconSrc, menuIcon}, 
// the related notifications +link{ribbonButton.iconClick, iconClick} and 
// +link{ribbonButton.menuIconClick, menuIconClick} are fired first and must return false to 
// prevent this notification from firing.
// <P>
// If a +link{class:Menu, menu} is installed then, by default, it is only displayed when a 
// user clicks on the +link{ribbonButton.menuIconSrc, menuIcon}.  This can be altered via 
// +link{ribbonButton.showMenuOnClick, showMenuOnClick}.
//
// @return (Boolean) return false to cancel event-bubbling
// @visibility external
//<
click : function () {
    //this.logWarn("in ribbonButton.click")
    if (this.showMenuOnClick && this.showMenu) this.showMenu();
},

//> @attr ribbonButton.showMenuOnClick (Boolean : false : IRW)
// If set to true, shows this button's +link{class:Menu, menu} when a user clicks anywhere 
// in the button, rather than specifically on the +link{ribbonButton.menuIconSrc, menuIcon}.
// <P>
// Note that this property has a different meaning than +link{statefulCanvas.showMenuOnClick,
// showMenuOnClick} in the ancestor class +link{StatefulCanvas}.
// @group menu
// @visibility external
//<
showMenuOnClick: false,

//> @attr ribbonButton.showMenuIconOver (Boolean : true : IRW)
// Whether to show an Over version of the +link{menuIconSrc, menuIcon}.
// @group menu
// @visibility external
//<
showMenuIconOver: true,

//> @attr ribbonButton.showMenuIconDown (Boolean : false : IRW)
// Whether to show a Down version of the +link{menuIconSrc, menuIcon}.
// @group menu
// @visibility external
//<
showMenuIconDown: false,

//> @attr ribbonButton.showMenuIconDisabled (Boolean : true : IRW)
// Whether to show a Disabled version of the +link{menuIconSrc, menuIcon}.
// @group menu
// @visibility external
//<
showMenuIconDisabled: true,

menuIconMouseMove : function () {
    if (!this.showMenuIconOver || this.showingMenuButtonOver) return;

    var element = this.getImage("menuIcon");

    if (element) {
        this.showingMenuButtonOver = true;
        this.setTitle(this.title);
    }
},

menuIconMouseOut : function () {
    if (!this.showMenuIconOver) return;

    var element = this.getImage("menuIcon");

    if (element) {
        this.showingMenuButtonOver = false;
        this.setTitle(this.title);
    }
},

_shouldRedrawOnStateChange : function () {
    if (this.Super("_shouldRedrawOnStateChange", arguments)) return true;
    var icon = this.showIcon != false ? 
                (this.vertical ?  this.largeIcon || this.icon : this.icon) : null;
    if (icon === isc.Canvas._blankImgURL) return icon;

    // If we have an icon and it changes with states, we need to reset the title
    // (IE redraw) on state change.
    if (icon && this.showIconState &&
         (this.showDisabledIcon || this.showSelectedIcon || this.showRollOverIcon ||
            this.showFocusedIcon || this.showDownIcon)) return true;
            
    return false;
},

menuIconClick : function () {
    this.showMenu();
    return false;
},

//>	@attr ribbonButton.menu (Menu : null : IRW)
// The menu to show when the +link{ribbonButton.menuIconSrc, menu-icon} is clicked.
// <P>
// For a menu button with no menu (menu: null) the up/down arrow image can
// be suppressed by setting
// +link{ribbonButton.showMenuIcon, showMenuIcon}: <code>false</code>.
// @group menu
// @visibility external
// @setter ribbonButton.setMenu
//<
menu:null,

//>	@method ribbonButton.setMenu ()
// The menu to show when the +link{ribbonButton.menuIconSrc, menu-icon} is clicked.
// <P>
// For a menu button with no menu (menu: null) the up/down arrow image can
// be suppressed by setting
// +link{ribbonButton.showMenuIcon, showMenuIcon}: <code>false</code>.  Note that 
// <code>showMenuIcon</code> is updated automatically by calls to 
// +link{ribbonButton.setMenu}.
// @param menu (Menu) a menu to assign to this button
// @group menu
// @visibility external
//<
setMenu : function (menu) {
    this.menu = menu;
    this.showMenuIcon = (this.menu != null);
    this.markForRedraw();
    //this.setTitle(this.title);
},
getMenu : function () {
    return this.menu;
},

//> @attr ribbonButton.menuAnimationEffect (String : null : IRWA)
// Allows you to specify an animation effect to apply to the menu when it is being shown.
// Valid options are "none" (no animation), "fade", "slide" and "wipe".
// If unspecified falls through to <code>menu.showAnimationEffect</code>
// @group menu
// @visibility animation
//<

//> @attr ribbonButton.menuAlign (Alignment : null : IR)
// The horizontal alignment of this button's menu, in relation to the button.  When unset,
// default behavior is to align the right edges of button and menu if the page is in RTL 
// mode, and the left edges otherwise.
// @group menu
// @visibility external
//<	
//menuAlign: null,

//>	@attr ribbonButton.showMenuBelow (Boolean : true : IRW)
// The menu drops down below the menu button.
// Set to false if the menu should appear above the menu button.
// @group menu
// @visibility external
//<
showMenuBelow: true,

//> @method ribbonButton.showMenu()
// Shows this button's +link{ribbonButton.menu}.  Called automatically when a user clicks the 
// +link{ribbonButton.menuIconSrc, menuIcon}.
// @return (Boolean) true if a menu was shown
// @group menu
// @visibility external
//<
showMenu : function () {
    // lazily create the menu if necessary, so we can init with, or set menu to, an object 
    // properties block
    if (isc.isA.String(this.menu)) this.menu = window[this.menu];
    if (!isc.isA.Menu(this.menu)) this._createMenu(this.menu);
    if (!isc.isA.Menu(this.menu)) return false;

    var menu = this.menu;
    
    // draw offscreen so that we can figure out what size the menu is
    // Note that we use _showOffscreen which handles figuring out the size, and
    // applying scrollbars if necessary.
    menu._showOffscreen();
    this.positionMenu(menu);
    menu.show(this.menuAnimationEffect);
},

positionMenu : function (menu) {
    if (!menu) return;
    // figure out the left coordinate of the drop-down menu
    var left = this.getPageLeft();

    if (this.menuAlign == isc.Canvas.CENTER) {
        // center-align the menu to the menuButton
        left = left - ((menu.getVisibleWidth() - this.getVisibleWidth()) / 2); 
    } else if (this.menuAlign == isc.Canvas.RIGHT) {
        // align the right-edge of the menu to the right edge of the menuButton
        left -= (menu.getVisibleWidth() - this.getVisibleWidth());
    }

    var top = this.showMenuBelow ? this.getPageTop()+this.getVisibleHeight()+1 :  
                                   this.getPageTop()-menu.getVisibleHeight()+2;
    // don't allow the menu to show up off-screen
    menu.placeNear(left, top);
},

_createMenu : function (menu) {
    if (!menu) return;
    menu.autoDraw = false;

    var cons = this.menuConstructor || isc.Menu;
    this.menu = cons.create(menu);
}

});

//> @class RibbonMenuButton
// A simple subclass of +link{RibbonButton} that shows a menuIcon by default and implements 
// showMenu().
// <P>
// This class has +link{ribbonButton.showMenuIcon,showMenuIcon} set to <code>true</code> by 
// default, and has a +link{ribbonButton.menuIconClick} handler which will show the specified 
// +link{ribbonButton.menu} via a call to +link{ribbonButton.showMenu()}.
// This menuIconClick handler cancels default click behavior, so, if a user clicks the menu 
// icon, any specified +link{canvas.click,click handler} for the button as a whole will not fire.
//
// @inheritsFrom RibbonButton
// @treeLocation Client Reference/Layout/RibbonBar
// @visibility external
//<
isc.defineClass("RibbonMenuButton", "RibbonButton").addProperties({

    usePartEvents: true,

    //> @attr ribbonMenuButton.showMenuIcon (Boolean : true : IRW)
    // Whether to show the +link{menuIconSrc, menu-icon} which fires the 
    // +link{ribbonButton.menuIconClick} notification method when clicked.
    // @group menu
    // @visibility external
    //<
    showMenuIcon: true

});



//> @class ToolStripGroup
// A simple subclass of +link{class:RibbonGroup}, which groups other controls for use in 
// +link{class:RibbonBar, ribbon-bars}.
// @inheritsFrom RibbonGroup
// @treeLocation Client Reference/Layout
// @visibility external
// @deprecated this is an old synonym for +link{class:RibbonGroup, RibbonGroup}, scheduled for removal in the next release
//<
isc.defineClass("ToolStripGroup", "RibbonGroup");

//> @class IconButton
// A simple subclass of +link{class:RibbonButton, RibbonButton}.
// @inheritsFrom RibbonButton
// @treeLocation Client Reference/Layout/RibbonBar
// @visibility external
// @deprecated this is an old synonym for +link{RibbonButton}, scheduled for removal in the next release
//<
isc.defineClass("IconButton", "RibbonButton").addProperties({
    // default deprecated IconButton to horizontal - legacy behavior
    orientation: "horizontal",
    vertical: false,
    init : function () {
        var result = this.Super("init", arguments);
        if (!window.sessionStorage.iscSkipIconButtonWarning) {
            window.sessionStorage.iscSkipIconButtonWarning = true;
            this.logWarn("Note that IconButton is deprecated and will be removed in the " +
                "next major release.  Use RibbonButton instead,");
        }
        return result;
    }
});

//>	@class IconMenuButton
// A simple subclass of +link{class:RibbonMenuButton}.
// @inheritsFrom IconButton
// @treeLocation Client Reference/Layout/RibbonBar
// @visibility external
// @deprecated this is an old synonym for +link{class:RibbonMenuButton, RibbonMenuButton}, scheduled for removal in the next release
//<
isc.defineClass("IconMenuButton", "RibbonMenuButton").addProperties({
    // default deprecated IconMenuButton to horizontal - legacy behavior
    orientation: "horizontal",
    vertical: false,
    init : function () {
        var result = this.Super("init", arguments);
        if (!window.sessionStorage.iscSkipIconMenuButtonWarning) {
            window.sessionStorage.iscSkipIconMenuButtonWarning = true;
            this.logWarn("Note that IconMenuButton is deprecated and will be removed in the " +
                "next major release.  Use RibbonMenuButton instead,");
        }
        return result;
    }
});


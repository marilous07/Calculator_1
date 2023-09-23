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
//> @groupDef accessibility
// SmartClient is a fully accessible technology which fulfills the Section 508 requirements of
// U.S. government law and similar international standards.  Specificallly:
// <ul>
// <li> components are fully keyboard navigable and the browser's native focus indicator reveals
// keyboard focus to the user
// <li> components are themable/brandable, allowing a variety of high contrast and limited color
// range look and feel options to compensate for visual acuity disabilities
// <li> the WAI-ARIA standard is supported for adding semantic markup to components to identify them to
// screen readers such as NVDA or JAWS.
// </ul>
// <P>
// <b>WAI-ARIA support</b>
// <P>
// ARIA is a standard from the WAI (Web Accessibility Institute) that allows modern Ajax applications to
// add semantic markup to the HTML used to create modern Ajax interfaces to enable screen reader support.
// This semantic markup allows a screen reader to identify the function and state of complex components
// such as load-on-demand lists and trees even though they are composed of simple elements such a &lt;div&gt;s.  
// <P>
// Note that ARIA support is the correct way to evaluate the accessibility of a web
// <i>application</i>.  Standards which apply to a web <i>site</i>, such as ensuring that all interactive
// elements are composed of native HTML anchor (&lt;a&gt;) or &lt;form&gt; controls, cannot and should
// not be applied to a web <i>application</i>.  A web application's accessibility must be evaluated in
// terms of its ARIA support.
// <P>
// By default, SmartClient components will write out limited ARIA markup sufficient to navigate basic
// menus and buttons.  Full screen reader mode is not enabled by default because it has a small
// performance impact and subtly changes the management of keyboard focus in a way that may be less
// intuitive when primarily navigating an application with the mouse.
// <P>
// The limited ARIA support which is enabled by default is intended to allow a screen reader user to
// navigate to a menu to enable full screen reader support.  This is analogous to a partially visually
// impaired user ariving at a site with normal theming and needing to switch to a high-contrast skin.
// <P>
// To enable full screenReader mode, call <smartclient>+link{isc.setScreenReaderMode}</smartclient>
// <smartgwt>+link{SC.setScreenReaderMode()}</smartgwt> before any
// SmartClient components are created or drawn.  This implies that if an end user dynamically enables
// full screen reader support, the application page must be reloaded, as an any existing components will
// not have full ARIA markup.
// <P>
// For an overview of ARIA, see +externalLink{http://www.w3.org/WAI/intro/aria.php}.
// <P>
// To completely disable ARIA markup, call
// <smartclient>+link{isc.setScreenReaderMode(),isc.setScreenReaderMode(false)}</smartclient>
// <smartgwt>+link{SC.setScreenReaderMode(), SC.setScreenReaderMode(false)}</smartgwt> before any components are drawn.
// <P>
// <b>Recommended Screen Reader Configuration</b>
// <P>
// The recommended configuration for screen reader use is the most recent available release of Firefox
// and either the JAWS or NVDA screen reader.
// <P>
// While WAI-ARIA markup is provided for other browsers, support for WAI-ARIA itself is known to be
// limited in current release versions of IE and other browsers supported by SmartClient.
// <P>
// <b>Application-level concerns</b>
// <P>
// While SmartClient enables accessible web applications to be created, it is always possible for an
// application to violate accessibility standards.  The following is a brief and not exhaustive list of
// concerns for application authors:
// <ul>
// <li> for any operation that can be triggered via drag and drop, you should offer an equivalent
// keyboard-only means of performing the same operation.  For common grid to grid drags, this is easily
// accomplished using +link{ListGrid.transferSelectedData()}.
// <li> if you use a component in a way that is not typical, such as using an ImgButton as a
// non-interactive stateful display, set its +link{canvas.ariaRole} appropriately.  For a list of ARIA
// roles, see +externalLink{http://www.w3.org/WAI/PF/aria/roles#role_definitions}.
// Note that in most cases you will not need to modify the default ariaRole written out by
// the SmartClient framework with screenReader mode enabled.
// <li> for plain HTML content that is incorporated into an Ajax interface (such as an embedded help
// system), embed the HTML into an +link{HTMLFlow} (whose default ARIA role is "article") and ensure the
// HTML itself is accessible (for example, has "alt" attributes on all images which are semantically
// meaningful)
// <li> in addition to setting explicit ARIA roles per canvas, SmartClient also allows 
// developers to specify values for explicit 
// <smartclient>+link{canvas.ariaState,ARIA states}</smartclient>
// <smartgwt>+link{canvas.setAriaState(),ARIA states}</smartgwt>
// (see +externalLink{http://www.w3.org/TR/wai-aria/states_and_properties}) to be written
// out with the HTML for a component. <br>
// Note that, as with ariaRoles, in most cases the
// framework automatically writes out any appropriate aria state information based
// on the component being generated - you'd only make use of this property if
// using components in some custom way. 
// To provide a concrete example: a developer might implement a logical nested
// "menu" built from a set of Button instances. In that case, some button might have
// ariaRole set to <code>"menuitem"</code> and (if it launches a sub-menu),
// also the +externalLink{https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-haspopup,"haspopup"}
// aria state. The code for this would be something like:
// <smartclient>
// <pre>
// isc.Button.create({
//      // ... various properties
//      
//      ariaRole:"menuitem",
//      ariaState:{haspopup:true}
// });
// </pre>
// </smartclient>
// <smartgwt>
// <pre>
//  myButton.setAriaRole("menuitem");
//  myButton.setAriaState("haspopup", true);
// </pre>
// </smartgwt>
// </ul>
// <p>
// <b>Known Screen Reader bugs / quirks</b>
// <p>
// JAWS: By default, JAWS treats a web page as a web document - text interspersed with graphics,
// links, etc. - and not as an application consisting of form controls, interactive buttons,
// lists, and so on. To enable application mode in JAWS, it is necessary to add <code>role="application"</code>
// to the &lt;body&gt; tag. See
// +externalLink{https://support.freedomscientific.com/support/technicalsupport/bulletin/1665,Freedom Scientific Bulletin - In ARIA&#44; what is the difference in how JAWS treats role="application" and role="document"?}
//
// @treeLocation Concepts
// @title Accessibility / Section 508 compliance
// @visibility external
//<


//> @staticMethod isc.setScreenReaderMode()
// Enables full screen reader mode.  Must be called before any components are created.  See
// +link{group:accessibility}.
// @param newState (boolean) new setting
// @group accessibility
// @visibility external
//<
isc.setScreenReaderMode = function (newState) {
   isc.screenReader = newState;
}

//> @attr canvas.ariaRole (String : null : IR)
// ARIA role of this component.  Usually does not need to be manually set - see
// +link{group:accessibility}.
// @group accessibility
// @visibility external
//<

//> @attr canvas.ariaState (Object : null : IRA)
// Explicit set of ARIA state mappings for this component. Any values specified in this
// object will be combined with +link{getAriaStateDefaults()} as described in +link{getAriaState()}.
// <P>
// Usually this does not need to be manually set - see +link{group:accessibility}.
// <P>
// Usage: This attribute should be set to a mapping of aria state-names to values - for example
// to have the "aria-haspopup" property be present with a value "true", you'd specify:
// <pre>
//  { haspopup : true }
// </pre>
//
// @group accessibility
// @visibility external
//<
 
//isc.screenReader = undefined; // initially undefined

// liteAria
// - may be explicitly set to true to minimize what Aria behaviors are enabled
// - otherwise we default to true in IE8 and earlier unless 'setScreenReaderMode(true)' has been
//   explicitly called.
isc.liteAria = null;

// internal DOM manipulation methods, don't document
isc.Canvas.addClassMethods({

    
    // this just indicates whether we write out basic ARIA attributes for most elements, not whether we
    // are in full screenReader mode
    ariaEnabled : function () {
        return isc.screenReader || isc.screenReader !== false &&
            ((isc.Browser.isIE && isc.Browser.version >=8) || !isc.Browser.isIE);
    },

    useLiteAria : function () {
        // allow "liteAria" to be explicitly specified.
        // Otherwise if screenReader is explicitly set to true, don't use liteAria
        // - otherwise use liteAria for <= IE8 since it's slow.
        if (isc.liteAria != null) return isc.liteAria;
        if (isc.screenReader == true) return false;
        return (isc.Browser.isIE && isc.Browser.version < 9);
    },

    setAriaRole : function (element, role) {
        if (!element) return;
        if (this.logIsDebugEnabled("aria")) {
            this.logDebug("ARIA role changed to: " + role + 
                          " on element: " + this.echoLeaf(element), "aria");
        }
        element.setAttribute("role", role);
    },

    setAriaState : function (element, stateName, stateValue) {
        if (!element) return;
        if (this.logIsInfoEnabled("aria")) {
            this.logInfo("ARIA state: " + stateName + ": " + stateValue +
                         ", set on element: " + isc.echoLeaf(element), "aria");
        }
        if (stateValue == null) {
            this.clearAriaState(element, stateName);
        } else {
           element.setAttribute("aria-" + stateName, stateValue);
        }
    },

    setAriaStates : function (element, state) {
        if (!element) return;
        if (state == null) return;
        for (var stateName in state) {
            var value = state[stateName];
            if (value == null) {
                this.clearAriaState(element,stateName);
            } else {
                this.setAriaState(element, stateName, state[stateName]);
            }
        }
    },

    clearAriaState : function (element, stateName) {

        if (!element) return;
        element.removeAttribute("aria-" + stateName);
    },

    getAriaStateAttributes : function (ariaState) {
        var output = "";
        if (ariaState) {
            for (var stateName in ariaState) {
                var stateValue = ariaState[stateName];

                // These are the attributes being written into a fresh handle - skip
                // any entries
                if (stateValue == null) continue;

                output += " aria-" + stateName + "='" + String.asAttValue(stateValue) + "'";
            }
        }
        return output;
    }
});

isc.Canvas.addMethods({
    // instance-level methods.  Canvases set ariaRole and ariaState on their
    // clipHandle

    // Fired from canvas.init.
    // This gives us an opportunity to set up our default aria state/role
    initializeAria : function () {
        // Ensure that we never share the instance-prototype aria-state across widgets
        
        if (this.ariaState != null) {
            this._calculatedAriaState = this.ariaState = isc.addProperties({},this.ariaState);
        }

    },

    //> @method canvas.setAriaRole()
    // Update the +link{canvas.ariaRole} at runtime
    // @param role (String) new ariaRole
    // @group accessibility
    // @visibility internal
    //<
    
    setAriaRole : function (role) {
        // remember the role for future clear/draw's etc
        this.ariaRole = role;
        isc.Canvas.setAriaRole(this.getClipHandle(), role);
    },

    //> @method canvas.setAriaState()
    // Set a specific +link{canvas.ariaState,ARIA state} for this component.
    // 
    // @param stateName (String) aria state to update
    // @param stateValue (String | Boolean | Integer | Float) value for the aria state
    // @group accessibility    
    // @visibility external
    //<
    // Additional parameter to suppress updating this.ariaState used to update the
    // handle only
    
    setAriaState : function (stateName, stateValue, dontStoreValue) {
        if (!dontStoreValue) {
            var ariaState = this.ariaState || {};
            ariaState[stateName] = stateValue;
            this.ariaState = ariaState;
        }
        // Track the aria-state we actually apply to the handle
        if (this._calculatedAriaState == null) {
            this._calculatedAriaState = {};
            this._calculatedAriaState[stateName] = stateValue;
        }
        if (this.isDrawn()) {
            isc.Canvas.setAriaState(this.getClipHandle(), stateName, stateValue);
        }
    },

    // Setter for this.ariaState object
    setAriaStates : function (state) {
        this.ariaState = state;

        if (this.isDrawn()) {
            this.updateAriaState();
        }
    },
    clearAriaState : function (stateName, dontStoreValue) {
        if (!dontStoreValue && this.ariaState) {
            delete this.ariaState[stateName];
        }
        if (this._calculatedAriaState != null) {
            delete this._calculatedAriaState[stateName];
        }

        isc.Canvas.clearAriaState(this.getClipHandle(), stateName);
    },

    //> @method canvas.getAriaState() [A]
    // Gets the ARIA state mappings to apply to this component's
    // handle. See +link{group:accessibility} for more information on WAI-ARIA support in
    // SmartClient.
    // <P>
    // The returned object consists of a mapping of aria attribute names to values to write
    // into the component HTML. For example, the following mapping:
    // <pre>
    //  { haspopup:true, label:"Settings submenu"}
    // </pre>
    // Would result in ARIA html attributes like
    // <code>aria-haspopup="true" aria-label="Settings submenu"</code>.
    // <P>
    // The returned state mappings include +link{getAriaStateDefaults(),default mappings} 
    // combined with any +link{ariaState,explicitly specified aria state}.
    // <P>
    // Note that if a property is explicitly specified it will take precedence over
    // the dynamically calculated default value. For example a +link{canvas.disabled,disabled}
    // canvas will include <code>aria-disabled</code> in its markup by default, but 
    // a developer may change this behavior by explicitly setting ariaState to an object
    // with the property <code>disabled</code> explicitly set to <code>false</code> or <code>null</code>.
    // <P>
    // This method will be invoked during on +link{canvas.draw()} and +link{canvas.redraw()} 
    // and the resulting state attributes will be applied to the component handle.
    //
    // @return (Object) object containing aria attribute names and values
    // @visibility external
    //<
    getAriaState : function () {
        return isc.addProperties({}, this.getAriaStateDefaults(), this.ariaState);
    },
    
    //> @method canvas.getAriaStateDefaults() [A]
    // Retrieves dynamically calculated default ARIA state properties for this canvas. 
    // These will be combined with +link{canvas.ariaState,explicitly specified aria state}
    // and applied to the widget handle as described in +link{canvas.getAriaState()}.
    // <P>
    // For +link{canvas.disabled,disabled canvases}, this method returns an object
    // with <code>disabled</code> set to true. May be overridden to apply additional 
    // defaults in canvas subclasses.
    // 
    // @return (Object) dynamically calculated default aria state properties
    // @visibility external
    //<
    getAriaStateDefaults : function () {
        var dynamicAriaState = {};
        if (this.isDisabled()) dynamicAriaState.disabled = true;
        return dynamicAriaState;
    },


    // _getAriaState() helper - used when we're picking up the aria state to apply to our handle
    // This will remember the returned object as this._calculatedAriaState so we can
    // track the current state applied to our handle, including dynamically applied properties
    _getAriaState : function () {
        this._calculatedAriaState = this.getAriaState();
        return this._calculatedAriaState;
    },

    // Helper for getTagStart() to pick up all the aria-<property> strings to inject into
    // our handle at draw time
    getAriaStateAttributes : function () {
        
        return isc.Canvas.getAriaStateAttributes(this._getAriaState());
    },

    // Apply aria state attributes to our handle at runtime.
    // Invoked as part of canvas.redraw(), or from explicit setAriaState()
    // Useful for the case where getAriaState() is dynamic and we want to pick up
    // new values on redraw automatically
    updateAriaState : function () {
        if (!this.isDrawn()) return;

        // Ensure that any previously applied state attributes are cleared from the handle
        var oldState = this._calculatedAriaState,
            // Note: _getAriaState will lazily update this.calculatedAriaState()
            finalState = isc.addProperties({}, this._getAriaState());
        // Add explicit nulls for any removed properties - Canvas.setAriaStates() will
        // clear those from our handle. Note that we dup'd the result of _getAriaState()
        // so we're not storing nulls into the _caculatedAriaState object
        if (oldState != null) {
            var undef;
            for (var attribute in oldState) {
                if (finalState[attribute] === undef) finalState[attribute] = null;
            }
        }
        isc.Canvas.setAriaStates(this.getClipHandle(), finalState);
    }
});


if (isc.StatefulCanvas) {

isc.StatefulCanvas.addProperties({
    
    //> @method statefulCanvas.getAriaStateDefaults() [A]
    // Retrieves dynamically calculated default +link{canvas.ariaState,ARIA state mapping} 
    // properties for this canvas. These will be combined with explicitly specified aria
    // state as described in +link{canvas.getAriaState()}.
    // <P>
    // Overridden by StatefulCanvas to pick up +link{statefulCanvas.getAriaLabel(),aria-label}.
    // 
    // @return (Object) dynamically calculated default aria state properties
    // @visibility external
    //<
    getAriaStateDefaults : function () {
        var ariaState = this.Super("getAriaStateDefaults", arguments);
        if (ariaState == null) ariaState = {};
        // Don't set labelledby state here because we want 'aria-label' to take precedence
        // but "As required by the text alternative computation, user agents give precedence
        // to aria-labelledby over aria-label when computing the accessible name property."
        // http://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby
        //
        // ImgTab depends on labelledby *not* being set so that its override of getAriaLabel()
        // can append the ariaCloseableSuffix.

        // getAriaLabel defined in StatefulCanvas.js
        var ariaLabel = this.getAriaLabel();
        if (ariaLabel != null) ariaState.label = ariaLabel;

        return ariaState;
    }
});

}

if (isc.Progressbar) {

isc.Progressbar.changeDefaults("ariaState", {
    valuemin: 0,
    valuemax: 100
});
isc.Progressbar.addProperties({
    ariaRole: "progressbar",

    //> @method progressbar.getAriaStateDefaults() [A]
    // Retrieves dynamically calculated default +link{canvas.ariaState,ARIA state mapping} 
    // properties for this canvas. These will be combined with explicitly specified aria
    // state as described in +link{canvas.getAriaState()}.
    // <P>
    // Overridden by Progressbar to pick up aria-valuenow.
    // 
    // @return (Object) dynamically calculated default aria state properties
    // @visibility external
    //<
    getAriaStateDefaults : function () {
        var ariaState = this.Super("getAriaStateDefaults", arguments);
        if (ariaState == null) ariaState = {};
        if (this.percentDone != null) ariaState.valuenow = this.percentDone;

        return ariaState;
    }
});

}


if (isc.DynamicForm) {

isc.DynamicForm.addProperties({
    rightTitlePrefix: "<span aria-hidden='true' style='vertical-align:middle;'>:&nbsp;</span>",
    titleSuffix: "<span aria-hidden='true' style='vertical-align:middle;'>&nbsp;:</span>",
    requiredRightTitlePrefix: "<b><span aria-hidden='true' style='vertical-align:middle;'>:&nbsp;</span>",
    requiredTitleSuffix: "<span aria-hidden='true' style='vertical-align:middle;'>&nbsp;:</span></b>"
});

// General support for formItems
// ---------------------------------------------------------------------------------------
// Note: FormItemIcon: in FormItem.js, given fixed role="button" and icon.prompt made into aria-label.

isc.FormItem.addMethods({

    //> @attr formItem.ariaRole (String : null : IRWA)
    // ARIA role of this formItem.  Usually does not need to be manually set - see
    // +link{group:accessibility}.
    // @group accessibility
    // @visibility external
    //<

    //> @attr formItem.ariaState (Object : null : IRWA)
    // ARIA state mappings for this formItem. Usually this does not need to be manually
    // set - see +link{group:accessibility}.
    // <P>
    // This attribute should be set to a mapping of aria state-names to values - for example
    // to have the "aria-multiline" property be present with a value "true", you'd specify:
    // <pre>
    //  { multiline : true }
    // </pre>
    // @group accessibility
    // @visibility external
    //<

    // FormItems set ariaRole and ariaState on their focus element, if any

    //> @method formItem.setAriaRole()
    // Sets the ARIA role of this FormItem.  Usually does not need to be manually set - see
    // +link{groupDef:accessibility}.
    // @param role (String) ARIA role for this item
    // @group accessibility
    // @visibility internal
    //<
    setAriaRole : function (role) {
        var focusElement = this.getFocusElement();  
        if (focusElement != null) isc.Canvas.setAriaRole(focusElement, role);
    },

    setOuterAriaRole : function (outerRole) {
        var outerElement = this.getHandle();
        if (outerElement != null) isc.Canvas.setAriaRole(outerElement, outerRole);
    },

    //> @method formItem.setAriaState()
    // Sets some ARIA state value for this FormItem.
    // Usually does not need to be manually set - see
    // +link{groupDef:accessibility}.
    // @param stateName (String) ARIA state name to set
    // @param stateValue (String | Boolean | Integer) value for the specified state
    // @group accessibility
    // @visibility internal
    //<
    
    setAriaState : function (stateName, stateValue) {
        var element;
        if (this.outerAriaRole) {
            element = this.getHandle();
        } else {
            element = this.getFocusElement();
        }
        if (element != null) isc.Canvas.setAriaState(element, stateName, stateValue);
    },
    setAriaStates : function (state) {
        var element;
        if (this.outerAriaRole) {
            element = this.getHandle();
        } else {
            element = this.getFocusElement();
        }
        if (element != null) isc.Canvas.setAriaStates(element, state);
    },
    clearAriaState : function (stateName) {
        var element;
        if (this.outerAriaRole) {
            element = this.getHandle();
        } else {
            element = this.getFocusElement();
        }
        if (element != null) isc.Canvas.clearAriaState(element, stateName);
    },
    getAriaState : function () {
        return isc.addProperties({}, this.getAriaStateDefaults(), this.ariaState);
    },
    getAriaStateDefaults : function () {
        var state = {};

        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-required  
        if (this.required && this.form && this.form.hiliteRequiredFields) state.required = true;
 
        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-invalid
        if (this.hasErrors()) {
            state.invalid = true;
            
            // When showInlineErrors is false, a list of the errors is written out at the top
            // of the form - see DynamicForm.getErrorsHTML().
            //
            // If writing out inline errors, prefer to describe-by the error text rather than an error
            // icon because some screen readers do not handle reading the error icon's 'aria-label'.
            
            if (!this.form.showInlineErrors || this.shouldShowErrorText()) {
                var errorMessageID = this._getErrorMessageID();
                
                state.describedby = errorMessageID;

            } else if (this.form.showInlineErrors && this.shouldShowErrorIcon()) {
                var errorIconID = this.getErrorIconId();
                
                state.describedby = errorIconID;
            }

        }

        // If there is no describedby state yet, set it to the ID of the hint cell.
        if (state.describedby == null && !this._getShowHintInField()) {
            var hintHTML = this.getHint();
            if (hintHTML) {
                var hintCellID = this._getHintCellID();
                
                state.describedby = hintCellID;
            }
        }

        // Disabled also means it's not in the tab order so won't be read by default.  However the spec
        // below mentions this is the case so presumably this is for screen readers to add features to
        // allow users to have disabled fields read.
        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-disabled
        if (this.isDisabled()) state.disabled = true;

        if (isc.isA.CheckboxItem(this)) state.checked = !!this.getValue();

        return state;
    },

    // called after a FormItem is drawn
    addContentRoles : function () {
        if (!isc.Canvas.ariaEnabled() || isc.Canvas.useLiteAria()) return;

        if (!this._canFocus() || !this.ariaRole) return;

        this.setAriaRole(this.ariaRole);

        var outerElement;
        if (this.outerAriaRole) {
            outerElement = this.getHandle();
            if (outerElement != null) isc.Canvas.setAriaRole(outerElement, this.outerAriaRole);
        }

        // with a visible title, we write out <label for=>, but we need an explicit aria-label if the
        // title is either not visible or if we do not have a native HTML input element (since 
        // <label for=> is intended for true HTML input elements).
        
        
        var title = this.getTitle();
        if (title) {
            var labelElementID = this._getLabelElementID(),
                labelElement = this.getDocument().getElementById(labelElementID);

            var titleElement;
            if (this.hasDataElement()) {
                titleElement = this.getDataElement();
            } else if (this.outerAriaRole) {
                titleElement = outerElement != null ? outerElement : this.getHandle();
            } else if (isc.isA.ContainerItem(this)) {
                titleElement = this._getTableElement();
            } else {
                titleElement = this._getTextBoxElement();
            }
            if (titleElement != null) {
                // According to WAI-ARIA:
                // "If the label text is visible on screen, authors SHOULD use 'aria-labelledby'
                // and SHOULD NOT use 'aria-label'."
                // http://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby
                //
                // Thus, if we have a <label> element, use 'aria-labelledby'.
                if (labelElement != null) {
                    isc.Canvas.setAriaState(titleElement, "labelledby", labelElementID);
                } else {
                    // Because the title is an HTMLString value, we need to remove HTML.
                    isc.Canvas.setAriaState(titleElement, "label", String.htmlStringToString(title));
                    //this.logWarn("applied aria-label to: " + this.echo(titleElement));
                }
            }

            
        }

        // instance default state such as multiline:true for TextArea
        if (this.ariaState) this.setAriaStates(this.ariaState);

        // dynamic state
        this.setAriaStates(this.getAriaState());

        // If we are modeling a SelectItem as a listbox with one option, then set 'aria-selected'
        // on the text box element, which contains the SelectItem's value.
        if (isc.isA.SelectItem(this) && this.outerAriaRole === "listbox") {
            var textBox = this._getTextBoxElement();
            if (textBox != null) {
                isc.Canvas.setAriaStates(textBox, {
                    selected: true
                });
            }
        }
    }
});

isc.TextAreaItem.addProperties({
    ariaState : { multiline : true }
});



isc.RadioItem.addProperties({
    ariaRole: "radio"
});


isc.ComboBoxItem.addProperties({
    ariaState: {
        
        autocomplete: "list",

        // "The combobox must have aria-expanded = true if the list is displayed or aria-expanded = false
        // when it is not."
        // http://www.w3.org/WAI/PF/aria-practices/#combobox
        expanded: false
    },
    ariaRole: "combobox"
    //pickListAriaRole:"list", // not implemented 
    //pickListItemAriaRole:"listitem" // not implemented
});


isc.SelectItem.addProperties({
    ariaRole:"option",
    outerAriaRole:"listbox",
    ariaState: {
        expanded: false,

        // To indicate that this single-option listbox has a popup listbox, we need to apply
        // aria-haspopup = true.
        // http://www.w3.org/TR/wai-aria-practices/#relations_haspopup
        haspopup: true
    },

    // This prevents VoiceOver from reading "space" for the value of an empty SelectItem.
    emptyDisplayValue: "<span aria-hidden='true'>&nbsp;</span>"
});

isc.StaticTextItem.addProperties({
    ariaRole:"textbox",
    
    ariaState:{ disabled:true }
});

// "menu" role vs "list" role: somewhat ambiguous, as both roles have the notions of
// selectability (via "checked" for menus), but generally menus show actions and sometimes
// choices whereas lists show just choices.
// ListGrid currently advertises itself as a List, it's subclass ScrollingMenu sounds like it
// should advertise itself as a Menu, however it is not used for anything but the PickList
// NOTE: separators already handled by ListGrid superclass
//isc.PickListMenu.addProperties({
//    ariaRole:"list",
//    rowRole:"listitem"
//});
if (isc.PickListMenu) {
isc.PickListMenu.addProperties({

    // For role="combobox", the associated listbox must have role="listbox" because a listbox
    // is a required owned element of a combobox: http://www.w3.org/TR/wai-aria/roles#combobox
    // For role="listbox", the associated options must have role="option"
    // http://www.w3.org/TR/wai-aria/roles#listbox
    ariaRole: "listbox",
    rowRole: "option"



});
}

isc.ContainerItem.addProperties({
    setAriaRole : function (role) {
        var tableElement = this._getTableElement();
        if (tableElement != null) isc.Canvas.setAriaRole(tableElement, role);
    },
    setAriaState : function (stateName, stateValue) {
        var tableElement = this._getTableElement();
        if (tableElement != null) isc.Canvas.setAriaState(tableElement, stateName, stateValue);
    },
    setAriaStates : function (state) {
        var tableElement = this._getTableElement();
        if (tableElement != null) isc.Canvas.setAriaStates(tableElement, state);
    },
    clearAriaState : function (stateName) {
        var tableElement = this._getTableElement();
        if (tableElement != null) isc.Canvas.clearAriaState(tableElement, stateName);
    }
});

isc.RadioGroupItem.addProperties({
    ariaRole: "radiogroup"
});

} // end if (isc.DynamicForm)

if (isc.MultiComboBoxItem) {

isc.MultiComboBoxItem.changeDefaults("buttonProperties", {
    ariaState: {
        // The buttons' 'aria-hidden' attributes are explicitly managed by the MCBI.
        hidden: true
    },
    getAriaState : function () {
        var ariaState = this.getClass()._instancePrototype.getAriaState.apply(this, arguments);
        return isc.addProperties({}, this.getAriaStateDefaults(), ariaState);
    },
    getAriaStateDefaults : function () {
        var ariaState = this.Super("getAriaStateDefaults", arguments);
        if (ariaState == null) ariaState = {};
        ariaState.hidden = !this.isVisible();
        return ariaState;
    }
});

}


if (isc.GridRenderer) {

// Grids
// ---------------------------------------------------------------------------------------



// Support for row and cell roles and states
isc.GridRenderer.addMethods({

    setRowAriaState : function (rowNum, stateName, stateValue) {
        var row = this.getTableElement(rowNum);
        if (row == null) return;
        isc.Canvas.setAriaState(row, stateName, stateValue);
    },
    setRowAriaStates : function (rowNum, state) {
        var row = this.getTableElement(rowNum);
        if (row == null) return;
        isc.Canvas.setAriaStates(row, state);
    }

});

isc.GridBody.addMethods({

    

    
    // In getTableHTML(), we invoke this method to pick up 'labelled-by' attribute for
    // the row
    // Use this to pick up the header / value / separator text iff we're advertising ourself 
    // as a list with listitems
    // 
    // This requires the DOM IDs of the various cells we want to read and the row and cell 
    // separator elements - passed in from getTableHTML() where they're locally available
    _getRowAriaLabelledBy : function (colNums, labelledByIDs, cellSeparatorID, rowSeparatorID) {
        var grid = this.grid;
        if (grid == null) return null;
        if (grid.ariaRole != "list") return null;

        // Give developers the option to entirely disable this labelled-by text via a simple flag
        
        if (!grid.screenReaderWriteRowLabelledBy) {
            return null;
        }

        var includeHeader = grid.screenReaderIncludeFieldTitles && grid.showHeader && grid.header;

        // No need for labelled by if we're not trying to inject either the header titles or
        // the separators
        if (grid.screenReaderCellSeparator == null && includeHeader == false) return null;

        // Write out labelled by as a series of IDs for the header button [to pick up the titles],
        // the cell itself [to pick up the value] and the special element with separator written into it
        // ... for each cell in the row
        if (includeHeader) {
            var labelledBy = "";
            for (var i = 0; i < labelledByIDs.length; i++) {
                
                var colNum = colNums[i];
                if (this.fields && this.fields[colNum]) colNum = this.fields[colNum].masterIndex;


                var button = grid.getFieldHeaderButton(colNum);

                labelledBy += button.getAriaHandleID() 
                                + " " + labelledByIDs[i] + " "
                                + " " + cellSeparatorID + " ";

            }
            labelledBy += " " + rowSeparatorID + " ";
            return labelledBy;

        } else {

            return labelledByIDs.join(" " + cellSeparatorID + " ") + " " + rowSeparatorID;
        }
    }
});

isc.ListGrid.addMethods({

    //> @attr listGrid.ariaRole (String : "list" : IRWA)
    // ARIA role for this ListGrid if +link{isc.setScreenReaderMode(),screen reader mode} is
    // enabled.
    // <P>
    // The +externalLink{https://www.w3.org/WAI/standards-guidelines/aria/,WAI-Aria standards}
    // contain a number of roles and related attributes that could apply to data presented in
    // a ListGrid or its subclasses. In order to make screenreader support as straightforward
    // as possible we have built-in support for writing out appropriate aria roles and 
    // attributes on the listGrid and its component elements for a couple of standard modes, as
    // well as providing override points allowing developers to explicitly specify the 
    // properties that get written out.
    // <P>
    // The two "standard" ariaRoles supported for ListGrids are 
    // +externalLink{https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Grid_Role,"grid"} and
    // +externalLink{https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/List_role,"list"}.
    // <P>
    // When <i>ariaRole</i> is set to <code>"list"</code> we write out the following 
    // standard properties by default:
    // <ul>
    // <li>rows have role set to <code>"listitem"</code></li>
    // <li>+link{listGrid.getRowAriaState()} will return aria properties for 
    //     <code>setsize</code>, <code>posinset</code>, 
    //     <code>selected</code> (for selected rows) and 
    //     <code>expanded</code> (for +link{listGrid.canExpandRecords,expanded} rows)</li>
    // <li>Additionally, if +link{listGrid.screenReaderWriteRowLabelledBy} is  true, 
    //     rows will write out an <code>aria-labelldby</code> that will cause ScreenReaders
    //     to read the column header and cell / row separators in addition to the cell
    //     content for the row</li>
    // </ul>
    // <P>
    // When <i>ariaRole</i> is set to <code>"grid"</code> we write out the following 
    // standard properties by default:
    // <ul>
    // <li><code>aria-rowcount</code> and <code>aria-colcount</code> will be specified on
    //     the listGrid itself</li>
    // <li>The +link{listGrid.header,header} will have role <code>row</code> 
    //     and <code>aria-rowindex</code> set to 1</li>
    // <li>Column header buttons will have role <code>columnheader</code>, and 
    //    <code>aria-colindex</code> set to the appropriate value for the column.
    //    Additionally <code>aria-sort</code> will be specified to reflect the current sort-state
    //    for the field, and if the header menu is enabled, <code>aria-haspopup</code> will be
    //    <code>true</code></li>
    // <li>Rows within the grid body will have role <code>row</code></li>
    // <li>+link{listGrid.getRowAriaState()} will return aria properties for 
    //     <code>rowindex</code>, <code>selected</code> (for selected rows) and 
    //     <code>expanded</code> (for +link{listGrid.canExpandRecords,expanded} rows)</li>
    // <li>Cells within rows will have role <code>gridcell</code></li>
    // </ul>
    // Developers may configure different ARIA HTML roles and attributes by modifying 
    // this attribute (<code>listGrid.ariaRole</code>) and implementing custom
    // handling for the following APIs:
    // <table border=1>
    //  <tr>
    //   <td>ListGrid</td>
    //   <td><code>listGrid.ariaRole</code>, +link{listGrid.ariaState}, 
    //       <smartclient>+link{listGrid.getAriaState()}</smartclient>.</td>
    //  </tr><tr>
    //   <td>header / header buttons</td>
    //   <td>+link{listGrid.headerAriaRole}, 
    //      +link{listGrid.headerButtonAriaRole}, +link{listGridField.headerButtonAriaRole}
    //      +link{listGrid.headerButtonAriaState}, +link{listGridField.headerButtonAriaState}</td>
    //  </tr><tr>
    //   <td>rows</td>
    //   <td>+link{listGrid.rowRole}, +link{listGrid.recordRowRoleProperty},
    //    +link{listGrid.rowAriaState}, +link{listGrid.recordRowAriaStateProperty}
    //    <smartclient>, +link{listGrid.getRowRole()}, +link{listGrid.getRowAriaState()}</smartclient>. 
    //    To update row state
    //    at runtime, developers may redraw the grid or its body.</td>
    //  </tr><tr>
    //   <td>cells</td>
    //   <td>+link{listGrid.cellRole}, +link{listGrid.recordCellRoleProperty}
    //    <smartclient>, +link{listGrid.getCellRole()}, +link{listGrid.getCellAriaState()}</smartclient>. 
    //    To update cell state
    //    at runtime, developers may redraw the grid or its body.</td>
    //  </tr>
    // </table>
    //
    // @group accessibility
    // @visibility external
    //<
    
    
    ariaRole:"list",

    // If ariaRole is set to "grid" or "table" we want to advertise the total rows and columns
    // in the table on the ListGrid handle.
    // Both the header and the body are part of the "grid" from the screenreader's perspective
    writeOutAriaRowCount : function () {
        return this.ariaRole == "grid" || this.ariaRole == "table";
    },
    writeOutAriaColCount : function () {
        return this.ariaRole == "grid" || this.ariaRole == "table";
    },

    //> @method listGrid.getAriaState() [A]
    // Dynamically retrieves the aria properties to write out for this listGrid in
    // +link{isc.setScreenReaderMode(),screen reader mode}.
    // <P>
    // If +link{listGrid.ariaRole} is set to <code>"grid"</code> this will return an object
    // with <code>rowcount</code> and <code>colcount</code> attributes populated to indicate
    // this size of the grid and its data.
    // <P>
    // If a static +link{canvas.ariaState,ariaState} has been specified, the default implementation
    // will apply these dynamically derived properties in addition to any properties specified
    // on the static object.
    // <P>
    // Note that +link{canvas.redraw(),redrawing} the grid will re-evaluate this method and
    // apply the result to the handle.
    // 
    // @return (Object) object containing aria attribute names and values to apply to this grid's handle
    //
    // @visibility external
    //<
    getAriaState : function () {
        var staticState = this.Super("getAriaState", arguments);
        if (staticState == null) staticState = {};
        return isc.addProperties({}, this.getAriaStateDefaults(), staticState);
    },

    //> @method listGrid.getAriaStateDefaults() [A]
    // Retrieves dynamically calculated default +link{listGrid.ariaState,ARIA state mapping} 
    // properties for this listGrid. These will be combined with explicitly specified aria
    // state as described in +link{listGrid.getAriaState()}.
    // <P>
    // Overridden by ListGrid to pick up aria-rowcount and aria-colcount.
    // 
    // @return (Object) dynamically calculated default aria state properties
    // @visibility external
    //<
    getAriaStateDefaults : function () {
        var dynamicAriaState = this.Super("getAriaStateDefaults", arguments);

        if (dynamicAriaState == null) dynamicAriaState = {};
        
        if (this.writeOutAriaRowCount()) {
            var ariaRowCount = this.getTotalRows() + (this.showHeader ? 1 : 0)
            dynamicAriaState["rowcount"] = ariaRowCount;
        }
        if (this.writeOutAriaColCount()) {
            var ariaColCount = this.fields.length;
            dynamicAriaState["colcount"] = ariaColCount;
        }
        return dynamicAriaState;
    },

    // Helper fired on dataChanged to update our rowcount aria state
    
    updateAriaForDataChanged : function () {
        if (this.isDrawn() && this.writeOutAriaRowCount()) {
            this.setAriaState("rowcount", this.getTotalRows() + (this.showHeader ? 1 : 0));
        }
    },
    // Helper fired on setFields to update our colcount aria state
    updateAriaForFieldsChanged : function () {
        if (this.isDrawn() && this.writeOutAriaColCount()) {            
            this.setAriaState("colcount", this.fields ? this.fields.length : 0);
        }
    },

    // CellRole
    // Typically null

    //> @attr listGrid.cellRole (String : null : IRWA)
    // Returns the default WAI ARIA role for cells within this listGrid.
    // See +link{listGrid.getCellRole()}
    // @visibility external
    //<
    //cellRole:null

    //> @attr listGrid.recordCellRoleProperty (String : "cellRole" : IRWA)
    // If this property is set on a record it will designate the WAI ARIA role for cells
    // within this records row
    // @visibility external
    //<
    recordCellRoleProperty:"cellRole",

    //> @method listGrid.getCellRole() [A]
    // Returns the WAI ARIA role for cells within this listGrid.
    // <P>
    // If the record has a value for the +link{listGrid.recordCellRoleProperty}, this
    // will be respected.<br>
    // Otherwise if +link{listGrid.cellRole} is specified, it will be used.
    // <P>
    // If neither property is set, the default implementation will return <code>"gridcell"</code> 
    // if this listGrid has +link{listGrid.ariaRole,role:"grid"}, otherwise <code>null</code>, meaning
    // no role will be written out for cells.
    //
    // @param rowNum (Integer) row index of the cell
    // @param colNum (Integer) column index of the cell
    // @param record (ListGridRecord) Record for the cell in question
    // @return (String) role for cells within this grid
    // @group accessibility
    // @visibility external
    //<
    
    getCellRole:function (rowNum, colNum, record) {
        if (record && record[this.recordCellRoleProperty] != null) {
            return record[this.recordCellRoleProperty];
        }

        if (this.cellRole != null) return this.cellRole;

        if (this.ariaRole == "grid") return "gridcell";
        // no per-cell role
        return null;
    },

    //> @method listGrid.getCellAriaState() [A]
    // Returns a map of +link{canvas.ariaState,WAI ARIA state attribute values} to be
    // written into cells within this grid. Default implementation return null, meaning
    // no per-cell aria state is written out
    //
    // @param rowNum (Integer) row index of the cell
    // @param colNum (Integer) column index of the cell
    // @param record (ListGridRecord) record for the cell in question
    // @param role (String) ARIA role for the cell as returned by +link{listGrid.getCellRole()}
    // @return (Object) Object containing aria property names and values to write into the cell's HTML
    // 
    // @group accessibility
    // @visibility external
    //<
    
    getCellAriaState : function (rowNum, colNum, record, role) {
        return null;
    },

    //> @attr listGrid.rowRole (String : null : IRWA)
    // Returns the default WAI ARIA role for rows within this listGrid.
    // See +link{listGrid.getRowRole()}
    // @visibility external
    //<
    //rowRole:null

    //> @attr listGrid.recordRowRoleProperty (String : "rowRole" : IRWA)
    // If this property is set on a record it will designate the WAI ARIA role for this
    // record's row.
    // @visibility external
    //<
    recordRowRoleProperty:"rowRole",

    //> @method listGrid.getRowRole() [A]
    // Returns the WAI ARIA role for rows within this listGrid.
    // <P>
    // If the record has a value for the +link{listGrid.recordRowRoleProperty}, this
    // will be respected.<br>
    // Otherwise if +link{listGrid.rowRole} is specified, it will be used.
    // <P>
    // If the property is not explicitly set, default implementation will 
    // return <code>"separator"</code> for separator rows,
    // <code>"listitem"</code> for data rows if this listGrid has 
    // +link{listGrid.ariaRole,role:"list"}, or <code>"row"</code> for data rows if this 
    // listGrid has <code>ariaRole:"grid"</code>.
    //
    // @param rowNum (Integer) row index
    // @param record (ListGridRecord) Record for the row in question
    // @return (String) role for rows within this grid
    // @group accessibility
    // @visibility external
    //<
    getRowRole : function (rowNum, record) {
        if (record && record[this.recordRowRoleProperty] != null) return record[this.recordRowRoleProperty];
        if (record && record.isSeparator) return "separator";
        if (this.rowRole != null) return this.rowRole;

        if (this.ariaRole == "list") return "listitem";
        // Appropriate for ariaRole "grid". Would also be appropriate for "table", etc
        return "row"
    },

    //> @attr listGrid.rowAriaState (Object : null : IRWA)
    // Returns a mapping of default WAI ARIA attributes for rows within this listGrid.
    // See +link{listGrid.getRowAriaState()}
    // @visibility external
    //<
    //rowAriaState:null

    //> @attr listGrid.recordRowAriaStateProperty (String : "rowAriaState" : IRWA)
    // If this property is set on a record it will designate a mapping of WAI ARIA attribute
    // names and values for this record's row.
    // @visibility external
    //<
    recordRowAriaStateProperty:"rowAriaState",

    //> @method listGrid.getRowAriaState() [A]
    // Returns a map of +link{canvas.ariaState,WAI ARIA state attribute values} to be
    // written into rows within this grid.
    // <P>
    // <P>
    // Default implementation returns an object with combined properties from any
    // specified +link{listGrid.rowAriaState,row aria state default object}, overlaid with
    // any +link{listGrid.recordRowAriaStateProperty} properties specified on the record itself,
    // plus the following attributes:
    // <ul>
    // <li><code>setsize</code> - total row count for the grid if +link{listGrid.ariaRole} is set to 
    //  <code>"list"</code></li>
    // <li><code>posinset</code> - index of the row if +link{listGrid.ariaRole} is set to <code>"list"</code></li>
    // <li><code>rowindex</code> - index of the row if +link{listGrid.ariaRole} is set to <code>"grid"</code></li>
    // <li><code>selected</code> - true if the record is +link{listGrid.getSelection(),selected}</li>
    // <li><code>expanded</code> - true for +link{listGrid.canExpandRecords,expanded records} 
    //  or +link{Tree.isOpen(),open folders}</li>
    // </ul>
    //
    // @param rowNum (Integer) row index
    // @param record (ListGridRecord) record for the row in question
    // @param role (String) ARIA role for the cell as returned by +link{listGrid.getRowRole()}
    // @return (Object) Object containing aria property names and values to write into the cell's HTML
    // 
    // @group accessibility
    // @visibility external
    //<
    // We don't currently provide a way to turn off our defaults other than overriding this method
    // so we may want to provide a customizer API for SmartGWT
    getRowAriaState : function (rowNum, record, role) {
        if (!isc.Canvas.ariaEnabled() || isc.Canvas.useLiteAria()) return; // too expensive to enable by default

        if (role == null) role = "listitem";

        // if only rendering a range of rows, need to tell the reader the total size and position
        var state;
        if (this.rowAriaState || (record && record[this.recordRowAriaStateProperty] != null)) {
            state = isc.addProperties({}, this.rowAriaState, record[this.recordRowAriaStateProperty]);
        }

        if (!this.showAllRecords && this.data != null) {
            if (state == null) state = {};
            if (role == "listitem") {
                state.setsize = this.getTotalRows();
                state.posinset = rowNum + 1;

            // Role "row" implies the ListGrid has ariaRole "grid"
            
            } else if (role == "row") {
                state.rowIndex = rowNum+ (this.showHeader ? 2 : 1)
            }
        }
        
        
        var selection = this.selectionManager,
            value = record != null ? record : rowNum;
        if (selection && selection.isSelected && selection.isSelected(value, rowNum)) {
            if (state == null) state = {}
            state.selected = true;
        }
        
        // If the row is 'expandable' due to expansion components, or due to
        // it being a group header node, write out the aria-expanded state
        if (record != null) {
            if (this.canExpandRecords && this.canExpandRecord(record, rowNum)) {
                if (state == null) state = {}
                state.expanded = this.isExpanded(record);
            } else if (this.isGrouped && this.isGroupNode(record)) {
                if (state == null) state = {}
                // group header node is a folder, data is (should be) a tree
                var groupTree = isc.isA.Tree(this.data) ? this.data : null;
                if (groupTree) {
                    this._addFolderAriaStateAttributes(state, rowNum, record, groupTree, role);
                }
            }
        }
        
        return state;
    },

    _addFolderAriaStateAttributes : function (state, rowNum, node, tree, role) {

        // node may be a nodeLocator - see TreeGrid.getRowAriaState()
        var isOpen = !!tree.isOpen(node);
        state.expanded = isOpen;
        
        // Write out aria-owns values so screenreaders know what will be collapsed
        // on collapse-click.
        // This requires we are either drawn or drawing - otherwise we don't know which 
        // DOM elements would be written out
        if (isOpen && this.body != null && this.body._firstDrawnRow != null) {
            var children = tree.getChildren(node);
            if (children != null && children.length > 0) {

                // First / last drawn row are set up by getTableHTMLDrawArea() at the top
                // of getTableHTML so should reflect what's currently being written out if
                // we're in draw/redraw, or what's currently written out if something else
                // is live-updating existing elements
                var firstDrawnRow = this.body._firstDrawnRow,
                    lastDrawnRow = this.body._lastDrawnRow;
                var ariaOwns = [];
                for (var i = 0; i < children.length; i++) {
                    var childRowNum = rowNum+(i+1),
                        physicalChildRowNum = childRowNum-firstDrawnRow;
                    
                    // don't go off the end of the draw area
                    if (i > lastDrawnRow) break;
                    
                    ariaOwns[i] = this.getRowElementId(childRowNum, physicalChildRowNum);
                }
                state.owns = ariaOwns.join(" ");
            }
        }

    },

    //> @attr listGrid.headerAriaRole (String : null : IRA)
    // +link{canvas.ariaRole,Aria role} for this listGrid's +link{listGrid.showHeader,header}.
    // See +link{listGrid.getHeaderAriaRole()}
    // @visibility external
    //<
    // headerAriaRole:null

    //> @method listGrid.getHeaderAriaRole() [A]
    // Returns the +link{canvas.ariaRole,role} for this listGrid's +link{listGrid.showHeader,header}.
    // <P>
    // If +link{listGrid.headerAriaRole} is explicitly provided, it will be used.<br>
    // Otherwise default implementation returns <code>"row"</code> if +link{listGrid.ariaRole} is set to 
    // <code>"grid"</code>
    //
    // @return (String) role for the header
    // @visibility external
    //<
    getHeaderAriaRole : function () {
        var undef;
        if (this.headerAriaRole !== undef) return this.headerAriaRole;
        if (this.ariaRole == "grid") return "row";
        return "toolbar";
    },

    

    //> @attr listGrid.headerButtonAriaRole (String : null : IRA)
    // Default +link{canvas.ariaRole,role} for +link{listGrid.showHeader,header buttons}.
    // See +link{listGrid.getHeaderButtonAriaRole()}.
    // @visibility external
    //<
    // headerButtonAriaRole:null

    //> @attr listGridField.headerButtonAriaRole (String : null : IRA)
    // +link{canvas.ariaRole,Aria role} for the header button for this field.
    // @visibility external
    //<
    

    //> @method listGrid.getHeaderButtonAriaRole() [A]
    // Returns the +link{canvas.ariaRole,role} for this listGrid's +link{listGrid.showHeader,header buttons}.
    // <P>
    // If +link{listGridField.headerButtonAriaRole} or +link{listGrid.headerButtonAriaRole} is set, it will be used.<br>
    // Othewise, the default implementation returns <code>"columnheader"</code> if +link{listGrid.ariaRole} is set to 
    // <code>"grid"</code>, <code>"button"</code> otherwise.
    //
    // @param field (ListGridField) header button field object
    // @return (String) role for the header button
    // @visibility external
    //<
    getHeaderButtonAriaRole : function (field) {

        if (field && field.headerButtonAriaRole != null) return field.headerButtonAriaRole;

        if (this.headerButtonAriaRole != null) return this.headerButtonAriaRole;
        
        // If our ariaRole is grid, the header is marked as the first row (header row), and
        // the buttons are columnheaders
        if (this.ariaRole == "grid") return "columnheader";
        return "button"
    },

    //> @attr listGrid.headerButtonAriaState (Object : null : IRA)
    // Default +link{canvas.ariaState,ARIA state} for +link{listGrid.showHeader,header buttons}.
    // See +link{listGrid.getHeaderButtonAriaState()}.
    // @visibility external
    //<
    // headerButtonAriaState:null

    //> @attr listGridField.headerButtonAriaState (Object : null : IRA)
    // +link{canvas.ariaState,Aria state} for the header button for this field.
    // @visibility external
    //<

    //> @method listGrid.getHeaderButtonAriaState() [A]
    // Returns a map of +link{canvas.ariaState,WAI ARIA state attribute values} to be
    // written into header buttons for this grid.
    // <P>
    // Default implementation returns an object with combined properties from any
    // specified +link{listGrid.headerButtonAriaState,header button aria state default object}, 
    // overlaid with any +link{listGridField.headerButtonAriaState} properties specified on the 
    // field itself, plus the following attributes:
    // <ul>
    // <li><code>haspopup</code> - true if the button should show the header context menu</li>
    // <li><code>colindex</code> - index of the column if +link{listGrid.ariaRole} is <code>"grid"</code></li>
    // <li><code>sort</code> - "ascending", "descending" or "none" depending on the sort-state of the field</li>
    // </ul>
    //
    // Also, if an explicit property is set in ariaState, it will be respected and will take precedence over 
    // the calculated property.
    // 
    // @param button (Button) The live ListGrid column header button.
    //  Note that the <code>"name"</code> attribute of the button will be set to the field name
    //  for the column.
    // @return (Object) Object containing aria property names and values to write into the button's handle
    // 
    // @group accessibility
    // @visibility external
    //<
    getHeaderButtonAriaState : function (button) {

        var ariaState = {};
        isc.addProperties(ariaState, button.ariaState); // pick up any listGridField.ariaState or ariaState defined on the button class
        isc.addProperties(ariaState, this.headerButtonAriaState); // pick up grid-level header button aria state defaults
        isc.addProperties(ariaState, button.getAriaStateDefaults()) // pick up normal "dynamic defaults" (disabled status, etc)

         
        var shouldShowMenu = this.shouldShowHeaderMenuButton(button, null, true),
            items = button._menuItems || [],
            hasPopup = button.showDefaultContextMenu != false && items.length > 0
        ;

        if (hasPopup) {
            ariaState = isc.addProperties(ariaState, {haspopup:true});
        }

        if (this.ariaRole == "grid") {
            ariaState.colindex = button.masterIndex +1;     // 1-based rather than zero based
            
                        
            var sortSpecifier = this.getSortSpecifier(button.name),
                sortDirection;
            if (sortSpecifier != null) {
                sortDirection = sortSpecifier.direction;
            }
            if (sortDirection) {
                ariaState.sort = sortDirection;
            } else {
                if (this._canSort(button)) ariaState.sort = "none";
            }
            // if the dynamic properties (sort, colIndex and haspopup) are explicitly 
            // specified in listGridField.headerButtonAriaState this will take precedence 
            // over the calculated settings.
            isc.addProperties(ariaState, button.headerButtonAriaState);
        }
        return ariaState;
    }


});

isc.TreeGrid.addMethods({

    ariaRole:"tree",
    rowRole:"treeitem",
    getRowRole : function (rowNum, node) {
        return this.rowRole;
    },
    getRowAriaState : function (rowNum, node, role) {
        if (!isc.Canvas.ariaEnabled() || isc.Canvas.useLiteAria()) return; // too expensive to enable by default
        // If our data object isn't a tree but we have been passed a row (new record row, say)
        // just bail
        if (!this.data || !isc.isA.Tree(this.data)) return;
        var theTree = this.data,
            manager = this.selectionManager,
            selected = !!(manager && manager.isSelected && manager.isSelected(node, rowNum, true)),
            level = theTree.getLevel(node, rowNum);
    
        var state = { selected : selected, 
                      level : level,
                      // if only rendering a range of rows, need to tell the reader the 
                      // total size and position
                      setsize : this.getTotalRows(),
                      posinset : rowNum + 1
                    };

        var nodeLocator;
        if (theTree.isMultiLinkTree()) {
            nodeLocator = theTree.getNodeLocator(rowNum);
        }
        if (theTree.isFolder(node)) {
            // Add expanded / owns attributes to the state
            this._addFolderAriaStateAttributes(state, rowNum, (nodeLocator || node), theTree, role);
        }

        return state;
    }
});

// NOTE: CubeGrid support in AnalyticsScreenReader.js

// Menus / ListPickers
// ---------------------------------------------------------------------------------------

isc.Menu.addMethods({
    ariaRole:"menu",
    // get rid of the "/" cell separators since we commonly 
    // have empty cols and we don't want to render out seemingly random slashes
    screenReaderCellSeparator:null,
    getRowRole : function (rowNum, item) {
        if (!item || item.isSeparator) return "separator";
        if (item.checked || item.checkIf || item.checkable) return "menuitemcheckable";
        if (item.radio) return "menuitemradio";
        return "menuitem";
    },
    getRowAriaState : function (rowNum) {
        if (this.hasSubmenu(this.getItem(rowNum))) return { haspopup:true };
    }
});

// There is no "menubutton" role, but with aria-haspopup NVDA 2011.1.1 at least reads
// this as "menubutton submenu".
isc.MenuButton.addProperties({
    ariaRole:"button",
    ariaState:{ haspopup:true }
});
isc.MenuBar.addProperties({
    ariaRole:"menubar"
});

} // end if (isc.GridRenderer)


if (isc.RichTextEditor) {

isc.ListPropertiesSampleTile.addMethods({
    ariaState: {},
    _ariaLabelMap: {
        "disc": "Bullets",
        "circle": "Circles",
        "square": "Filled squares",
        "decimal": "Numbers",
        "upper-roman": "Uppercase Roman numerals",
        "lower-roman": "Lowercase Roman numerals",
        "upper-alpha": "Uppercase letters",
        "lower-alpha": "Lowercase letters"
    },
    _otherUnorderedListAriaLabel: "Other bulleted style",
    _otherOrderedListAriaLabel: "Other numbered style",
    getAriaState : function () {
        return isc.addProperties({}, this.getAriaStateDefaults(), this.ariaState);
    },
    getAriaStateDefaults : function () {
        var state = {};
        var listProperties = this._canonicalProperties,
            style = listProperties.style;
        if (style == "custom-image") {
            var image = listProperties.image;
            var lastSlashPos = image.lastIndexOf('/');
            if (lastSlashPos >= 0) {
                image = image.substring(lastSlashPos + 1);
            }
            state.label = "Custom bullet image '" + image + "'";
        } else if (this._ariaLabelMap.hasOwnProperty(style)) {
            state.label = this._ariaLabelMap[style];
        } else {
            var isUnordered = isc.ListPropertiesPane.getListType(listProperties) == "unordered";
            state.label = isUnordered ? this._otherUnorderedListAriaLabel
                                      : this._otherOrderedListAriaLabel;
        }

        return state;
    },
    getAriaStateAttributes : function () {
        return isc.Canvas.getAriaStateAttributes(this.getAriaState());
    }
});

isc.ListPropertiesPane.addProperties({
    //< @attr listPropertiesPane.sampleTileLayoutAriaLabel (String : "List style" : IR)
    // The ARIA label to use for the +link{ListPropertiesPane.sampleTileLayout,sampleTileLayout}.
    // @group i18nMessages
    //<
    sampleTileLayoutAriaLabel: "List style"
});

isc.ListPropertiesPane.changeDefaults("sampleTileLayoutDefaults", {
    ariaRole: "radiogroup",
    ariaState: {
        haspopup: false
    },
    init : function () {
        this.Super("init", arguments);
        this.ariaState = isc.addProperties({}, this.ariaState, {
            label: this.creator.sampleTileLayoutAriaLabel
        });
    }
});

isc.ListPropertiesPane.changeDefaults("sampleTileDefaults", {
    ariaRole: "radio",
    setSelected : function () {
        this.Super("setSelected", arguments);
        this.setAriaState("checked", this.isSelected());
    }
});

} // end if (isc.RichTextEditor)


//>SectionStack
if (isc.SectionStack) {


isc.SectionStack.addProperties({
    ariaRole: "tablist",
    sectionHeaderAriaRole: "tab",

    getAriaState : function () {
        return isc.addProperties({}, this.getAriaStateDefaults(), this.ariaState);
    },
    getAriaStateDefaults : function () {
        var ariaState = this.Super("getAriaStateDefaults", arguments);
        if (ariaState == null) ariaState = {};

        ariaState.multiselectable = (this.visibilityMode != "mutex");
        return ariaState;
    }
});

isc.SectionStack.changeDefaults("tabPanelDefaults", {
    ariaRole: "tabpanel",
    getAriaState : function () {
        return isc.addProperties({}, this.getAriaStateDefaults(), this.ariaState);
    },
    getAriaStateDefaults : function () {
        var ariaState = this.Super("getAriaStateDefaults", arguments);
        if (ariaState == null) ariaState = {};
        var tab = this._tab;
        if (tab != null) {
            ariaState.hidden = tab.hidden || !tab.expanded;
            ariaState.labelledby = tab.getAriaHandleID();
            var tabItems = tab.items;
            if (tabItems != null && tabItems.length > 0) {
                var itemIDs = tabItems.callMethod("getAriaHandleID");
                ariaState.owns = itemIDs.join(" ");
            }
        }
        return ariaState;
    }
});

isc._commonScreenReaderProps = {
    ariaState: {
        controls: null
    },
    getAriaState : function () {
        var ariaState;
        if (isc.isA.SectionHeader(this)) {
            ariaState = this.Super("getAriaState", arguments);
        } 
        return isc.addProperties({}, this.getAriaStateDefaults(), ariaState);
    },
    getAriaStateDefaults : function () {
        var ariaState;
        if (isc.isA.SectionHeader(this)) {
            ariaState = this.Super("getAriaStateDefaults", arguments);
        } else {
            
            ariaState = isc.addProperties({}, ariaState); 
            if (isc.isA.StatefulCanvas(this.background) && this.background.label != null) {
                ariaState.labelledby = this.background.label.getAriaHandleID();
            } else if (this.background != null) {
                ariaState.labelledby = this.background.getAriaHandleID();
            }
        }

        var sectionStack = this.layout;
        if (isc.isA.SectionStack(sectionStack)) {
            var multiselectable = (sectionStack.visibilityMode != "mutex");
            if (multiselectable) {
                ariaState.expanded = !!this.expanded;
            } else {
                ariaState.selected = !!this.expanded;
            }
        }

        var tabPanel = this._tabPanel;
        if (tabPanel != null) {
            ariaState.controls = tabPanel.getAriaHandleID();
        }

        // To indicate that the user cannot expand/collapse the section, set 'aria-disabled' to true.
        // "Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable."
        // http://www.w3.org/TR/wai-aria/states_and_properties#aria-disabled
        if (this.canCollapse == false) {
            ariaState.disabled = true;
        }

        return ariaState;
    }
};

isc.SectionHeader.addProperties(isc._commonScreenReaderProps);
isc.ImgSectionHeader.addProperties(isc._commonScreenReaderProps);

}
//<SectionStack


// SplitPane
// ---------------------------------------------------------------------------------------
if (isc.SplitPaneSidePanel) {

isc.SplitPaneSidePanel.addProperties({
    ariaState: {
        // manage our own 'aria-hidden' state
        hidden: true
    },
    getAriaState : function () {
        return isc.addProperties({}, this.getAriaStateDefaults(), this.ariaState);
    },
    getAriaStateDefaults : function () {
        var dynamicAriaState = {};
        dynamicAriaState.hidden = !this.onScreen;
        return dynamicAriaState;
    }
});

} // end if (isc.SplitPaneSidePanel)


isc._tab_getAriaLabel = function () {
    var label = this.Super("getAriaLabel", arguments);
    var tabBar = this.parentElement;
    if (isc.isA.TabBar(tabBar)) {
        var tabSet = tabBar.parentElement;
        if (isc.isA.TabSet(tabSet)) {
            var isClosable = tabSet.canCloseTab(this);
            if (isClosable && tabSet.ariaCloseableSuffix) {
                label = label == null ? tabSet.ariaCloseableSuffix : label + tabSet.ariaCloseableSuffix;
            }
        }
    }
    return label;
};

if (isc.ImgTab) {
isc.ImgTab.addProperties({
    getAriaLabel : isc._tab_getAriaLabel
});
}
if (isc.SimpleTabButton) {
isc.SimpleTabButton.addProperties({
    getAriaLabel : isc._tab_getAriaLabel
});
}


if (isc.Window) {
isc.Window.addProperties({
    ariaState: {
        labelledby: null,
        describedby: null
    },
    getAriaState : function () {
        var state = this.Super("getAriaState", arguments);
        return isc.addProperties({}, this.getAriaStateDefaults(), state);
    },
    getAriaStateDefaults : function () {
        var state = this.Super("getAriaStateDefaults", arguments);
        if (state == null) state = {};
        
        var headerLabel = this.headerLabel;
        if (headerLabel != null && headerLabel.isVisible()) state.labelledby = headerLabel.getAriaHandleID();
        var body = this.body;
        if (body != null && body.isVisible()) state.describedby = body.getAriaHandleID();
        return state;
    }
});
}

if (isc.Dialog) {
isc.Dialog.addProperties({
    
    getAriaState : function () {
        var ariaState = this.Super("getAriaState", arguments);
        return isc.addProperties({}, this.getAriaStateDefaults(), ariaState);
    },
    getAriaStateDefaults : function () {
        var state = this.Super("getAriaStateDefaults", arguments);
        if (state == null) state = {};
        var messageLabel = this.messageLabel;
        if (messageLabel != null && messageLabel.isVisible()) state.describedby = messageLabel.getAriaHandleID();
        return state;
    }
});
}


(function () {
    var roleMap = {
        Button : "button",
        StretchImgButton : "button",
        ImgButton : "button",
        
        // Label inherits from Button but shouldn't pick up role "button"
        Label : null,
        
        // Section stacks - headers are "heading"s
        
        SectionHeader:"heading",
        ImgSectionHeader:"heading",
    
        // FormItems
        CheckboxItem : "checkbox",
        Slider : "slider",

        TextItem : "textbox",

        // TextArea is textbox + plus multiple:true state 
        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-multiline
        TextAreaItem : "textbox", 

        Window : "dialog",
        Dialog : "alertdialog",
        Toolbar : "toolbar",

        // a good default.  Without this NVDA will read an HTMLFlow as just "section" and stop.  With
        // this, contents are read.
        HTMLFlow:"article",
        HTMLPane:"article",

        // not doing this by default since lots of components use Layouts in various internal
        // ways that do not correspond to a "group"
        //Layout : "group", 

        // NOTE example shows 'tablist' element surrounding 'tab's but not 'tabpanel's
        // http://www.mozilla.org/access/dhtml/class/tabpanel
        TabBar : "tablist",
        PaneContainer : "tabpanel",
        ImgTab : "tab",
        
        EdgedCanvas : "presentation",
        BackMask : "presentation"
        
    }
    for (var className in roleMap) {
        var theClass = isc.ClassFactory.getClass(className);
        if (theClass) theClass.addProperties({ariaRole:roleMap[className]});
    }
})();

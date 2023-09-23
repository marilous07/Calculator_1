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
//> @class Rule
// A rule is a declaration that on some triggering event, some standard action will occur.
// Most commonly, a form will change the display or behavior of one or more of its fields.  
// Examples include displaying a warning message,
// disabling a field, or populating a field with a calculated value. Some Rules can also act
// upon other components in the application, for example the +link{validatorType,readOnly rule}
// can be used to hide components as well as just FormItems.
// <P>
// A rule is a special-case of a +link{Validator}: validators are designed so that they always
// make sense to run where data is being saved and can either accept or reject the saved data.
// Rules can be triggered by actions other than saving (including button presses) and rather than
// accepting or rejecting values via a +link{validator.condition}, they run some action when 
// their trigger event fires, such as displaying informational messages, or
// automatically calculating suggested values for fields.
// <P>
// A validator can be identified as a rule by setting the flag "isRule" on the validator definition.
// <P>
// As with other validators, Rules may be applied directly to fields, or may be applied to the
// +link{RulesEngine.rulesData,rulesData} array of a RulesEngine.
// 
//
// @inheritsFrom Validator
// @visibility rules
//<
isc.ClassFactory.defineClass("Rule", "Validator");



//> @attr validatorDefinition.isRule (boolean : false : IR) 
// Flag indicating validators of this type are +link{Rule}s
// @visibility rules
//<

//> @attr validatorDefinition.supportedTargets (Array of String : ["FormItem"] : IR)
// If +link{rule.locator} is used to specify a target object, what target types are
// supported? When the rule is executed, the locator will be resolved to the
// object in question. If the object is of a type listed here, the object will be passed to
// the +link{validatorDefinition.action} for processing, along with its container if appropriate.
// @visibility rules
//<



//> @attr rule.type (RuleType : null : IR)
// Type of rule - see +link{type:RuleType}.  Any +link{type:ValidatorType} is valid as a rule type
// as well.
// @visibility rules
//<


//> @type RuleType
// @value "message" displays an informational or warning message without marking a field invalid
// @value "populate" applies a calculated value to a field based on values in other fields
// @value "setRequired" marks a field as being required
// @visibility rules
//<


//> @attr rule.fieldName (String | Array of String : null : IR)
// This attribute may be used to specify a target field for validators and rules applied
// within a +link{RulesEngine}.
// <P>
// Name of the field that this rule effects.  If this rule affects multiple fields (for example, a
// "readOnly" rule that disables editing on a whole set of fields), either a comma-separated list
// of fieldNames or an Array of fieldNames can be specified.
// @visibility rules
//<


//> @attr rule.locator (AutoTestObjectLocator : null : IR)
// This attribute may be use to specify a target object for rules within a +link{RulesEngine}.
// Only applies to validators specified with the +link{validatorDefinition.isRule} attribute
// set to true.
// <P>
// Locator for target object effected by this rule. This will typically be a locator that resolves
// to a +link{FormItem}, but note that depending on +link{validatorDefinition.supportedTargets},
// other target objects, such as +link{Canvas} instances may be used.
// <P>
// This locator may be specified as an absolute locator derived from 
// +link{AutoTest.getObjectLocator()}, or if +link{RulesEngine.baseComponent}
// is specified, a relative locator derived from +link{AutoTest.getRelativeLocator()} 
// should be used, and the +link{rulesEngine.baseComponent} will be used to resolve this 
// to a live object at runtime.
// @visibility rules
//<


//> @type ValidatorTargetType
// Used by +link{validatorDefinition.supportedTargets}.
// If a rule is specified with a +link{rule.locator}, what object type(s) does the
// validatorDefinition support? The target object will be passed to the +link{validatorDefinition.action()} 
// method so that method should be able to handle any specified type being passed in.
// @value FormItem
//  Validator supports FormItem targets. In this case the FormItem and its containerWidget will
//  be passed to the validator action method.
// @value Canvas
//  Validator supports a Canvas as a target. In this case the target canvas will be passed to the
//  action method. No targetContainer will be passed for simple canvases.
// @value Section
//  Validator supports a SectionStackSection as a target. In this case the target Section will be
//  passed to the action method, and the stack will be passed as the targetContainer parameter.
//
// @visibility rules
//<



//> @attr rule.triggerEvent (TriggerEvent : "submit" : IR)
// Event that triggers this rule.  See +link{TriggerEvent}.
// @visibility rules
//<

//> @type TriggerEvent
// @value "editStart" Rule is triggered each time the form is populated with data (inclusive of
//                    being initialized to +link{dynamicForm.editNewRecord,edit a new record},
//                    such that all fields show their +link{FormItem.defaultValue,default value})
// @value "editStartAndChange" Rule is triggered each time the form is populated with data and
//                    whenever a changed event happens on it's field.
// @value "editorEnter" Rule is triggered when focus enters the field
// @value "editorExit" Rule is triggered when focus leaves the field
// @value "changed" Rule is triggered whenever a changed event happens on it's field
// @value "submit" Rule is triggered when values in the form are being submitted.  This includes
//                 both saving in a form that edits a record, or being submitted as search
//                 criteria in a search form
// @value "manual" Rule is never automatically fired and must be programmatically triggered
// @visibility rules
//<


//> @attr rule.dependentFields (String | Array of String : null : IR)
// For rules that are triggered by user actions in other fields, a list of fieldNames that can
// trigger the rule.  If multiple fields trigger the rule, either a comma-separated list of
// fieldNames or an Array of fieldNames can be specified. Notes:
// <ul>
// <li>If +link{rule.applyWhen} is specified, any fields referenced in the applyWhen conditional
//     are automatically included as implicit dependent fields, in addition to any fields specified
//     here</li>
// <li>If unset, +link{validatorDefinition.getDependentFields()} may be implemented to derive
//     dependent fields directly from the rule. For example the +link{type:ValidatorType,"populate" rule}
//     has this method defined to derive dependent fields from the rule's specified formula.</li>
// <li>If unset and no <code>getDependentFields()</code> implementation exists, the 
//     trigger event will be assumed to come from the +link{rule.fieldName} field</li>
// </ul>
//
// @visibility rules
//<

//> @method validatorDefinition.getDependentFields()
// Optional method to derive dynamic +link{rule.dependentFields,dependentFields} from a rule
// at runtime. This method should return the field names to use.
// @param rule (Rule) rule in question
// @param event (TriggerEvent) triggerEvent for the rule in question
// @return (Array of String) dependent field names
// @visibility rules
//<

//> @attr rule.applyWhen (AdvancedCriteria : null : IRA)
// Used to create a conditional rule based on +link{AdvancedCriteria,criteria}.  The rule
// will only be triggered if the criteria match the current form values.
// @visibility rules
//<

//> @class RulesEngine
// The rulesEngine class applies +link{Rule,Rules} to fields displayed across dataBoundComponents
// @visibility rules
// @treeLocation Client Reference/Forms
//<
isc.defineClass("RulesEngine");

isc.RulesEngine.addProperties({
    init : function () {
        this.Super("init", arguments);
        isc.ClassFactory.addGlobalID(this);
        
        if (this.members == null) this.members = [];
        else {
            for (var i = 0; i < this.members.length; i++) {
                var member = this.members[i];
                
                if (isc.isA.String(member)) {
                    this.members[i] = member = window[member];
                }
                this._addMember(member, true);
            }
        }
        
    },

    destroy : function () {
        this.Super("destroy", arguments);
        // Drop global reference because this rulesEngine is no longer valid
        isc.ClassFactory.dereferenceGlobalID(this);
    },

    //> @attr rulesEngine.baseComponent (Canvas : null : IRW)
    // When finding the target of a rule via +link{rule.locator}, the baseComponent is used as
    // the starting point for resolving the locator if the locator is a relative 
    // +link{AutoTestObjectLocator}.  Not required if not using locators, or if
    // locators are absolute.
    // @see AutoTest.getObjectLocator()
    // @see AutoTest.getRelativeObjectLocator()
    //
    // @visibility rules
    //<
    
    //> @attr rulesEngine.members (Array of DataBoundComponents : null : IRW)
    // Array of +link{DataBoundComponent}s associated with this rulesEngine. The +link{rulesData,rules}
    // for this engine can be triggered by events generated from this set of components and
    // will act upon them, using +link{rule.fieldName} to find the appropriate component and
    // field to interact with.
    // <P>
    // Note that developers may attach members to a rulesEngine either by setting
    // +link{dataBoundComponent.rulesEngine}, or by including the component in the members array
    // for a rulesEngine.
    //
    // @visibility rules
    //<
    
    //> @method rulesEngine.addMember()
    // Add a member to +link{rulesEngine.members}.
    // @param member (DataBoundComponent) new member to add
    // @visibility rules
    //<
    addMember : function (member) {
        if (!this.members.contains(member)) {
            this.members.add(member);
            this._addMember(member);
        }
    },
    
    _addMember : function (member) {
        if (member.rulesEngine != this) {
            
            if (member.rulesEngine != null) {
                member.rulesEngine.removeMember(member);
            }
            member.rulesEngine = this;
        }
        
        
    },
    
    // Notification method that one of our members started editing a new set of values - 
    // called from DynamicForm.setValues()
    processEditStart : function (component) {
        this._processComponentTriggerEvent("editStart", component);
        this._processComponentTriggerEvent("editStartAndChanged", component);
    },
    
    // Notification when a field gets focus (editor enter)
    processEditorEnter : function (component, field) {
        this._processFieldTriggerEvent("editorEnter", component, field);
    },

    // Notification method that a field changed
    // Fired in response to 'changed' not 'change' since we need to extract values from the
    // DBC. Therefore no way to (for example) cancel the change.
    processChanged : function (component, field) {
        this._processFieldTriggerEvent("changed", component, field);
        this._processFieldTriggerEvent("editStartAndChanged", component, field);
    },
    
    // Notification method that a field lost focus
    processEditorExit : function (component, field) {
        this._processFieldTriggerEvent("editorExit", component, field);
    },
    
    // Notification that one of our members was submitted (fires after validation at the form level)
    processSubmit : function (component) {
        // In this case we return the result of the validation run. This allows the
        // calling form to cancel submit.
        
        return this._processComponentTriggerEvent("submit", component);            
    },
    
    // Notification method that the ruleContext changed
    processContextChanged : function (component) {
        this._processComponentTriggerEvent("contextChanged", component);
    },
    
    // Actual code to fire 'processRules' on for rules associated with a trigger-event.
    _processComponentTriggerEvent : function (eventType, component) {
        var rules = this.rulesData;
        if (!rules || rules.length == 0) return;
        var eventTypeRules = [];
        
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].triggerEvent == eventType) {
                eventTypeRules[eventTypeRules.length] = rules[i];
            }
        }
        
        if (eventTypeRules.length > 0) return this.processRules(eventTypeRules, component);
        return null;

    },
    
    _processFieldTriggerEvent : function (eventType, component, field) {
        var rules = this.rulesData;
        if (!rules || rules.length == 0) return;
        var eventTypeRules = [];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].triggerEvent == eventType) {
                var rule = rules[i],
                    ruleDefinition = isc.Validator.getValidatorDefinition(rules[i].type),
                    sourceField = null;
                    
                // Don't crash if an invalid rule type is specified.
                if (!ruleDefinition) {
                    this.logWarn("RulesEngine unable to process rule with invalid type: " + rules[i].type);
                    continue;
                }
                
                if (rule.dependentFields != null) {
                    sourceField = rule.dependentFields;
                } else if (ruleDefinition.getDependentFields != null) {
                    sourceField = ruleDefinition.getDependentFields(rule, eventType);
                }
                if (sourceField == null || isc.isAn.emptyArray(sourceField)) {
                    // Avoid altering existing rule fieldName array
                    sourceField = (isc.isAn.Array(rule.fieldName) ? rule.fieldName.duplicate() : rule.fieldName);
                }
                
                if (sourceField != null && !isc.isAn.Array(sourceField)) {
                    sourceField = sourceField.split(",");
                }
                
                // By default combine "applyWhen" source fields - this ensures if the trigger
                // condition changes we re-evaluate
                if (rule.applyWhen != null) {
                    var includeApplyWhenFields = true;
                    if (rule.dependsOnApplyWhenFields != null) {
                        includeApplyWhenFields = rule.dependsOnApplyWhenFields;
                    } else if (ruleDefinition.dependsOnApplyWhenFields != null) {
                        includeApplyWhenFields = rule.dependsOnApplyWhenFields;
                    }
                    if (includeApplyWhenFields) {
                        var criteriaFields = isc.DataSource.getCriteriaFields(rule.applyWhen);
                        if (sourceField == null) {
                            sourceField = criteriaFields;
                        } else {
                            sourceField.addList(criteriaFields);
                        }
                    }
                }
                
                if (sourceField) {
                    for (var j = 0; j < sourceField.length; j++) {
                        var dotIndex = sourceField[j].indexOf("."),
                            ds = sourceField[j].substring(0, dotIndex),
                            dsField = sourceField[j].substring(dotIndex+1);
                    
                        if (component.getDataSource() == isc.DataSource.get(ds) &&
                            dsField == field.name) 
                        {
                            eventTypeRules.add(rules[i]);
                            // drop out of the inner for-loop
                            break;
                        }
                    }
                }
            }
        }
        if (eventTypeRules.length > 0) return this.processRules(eventTypeRules, component);
        return null;
    },
    
    //> @attr rulesEngine.ruleContext (Object : null : IRW)
    // The +link{canvas.ruleScope,rule context} to be used during rules processing.
    // <p>
    // If not provided a rule context is generated on the fly from the rules engine
    // member forms. 
    // @visibility rules
    //<

    // getValues() Assembles a record values type object comprised of values from all 
    // member forms. This will be used by rule / validator logic.
    // Note that for databound forms we store the form values under the dataSource name
    // as an attribute on this object.
    getValues : function () {
        if (this.ruleContext) return this.ruleContext;

        var record = {};
        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i];
            if (member.destroyed || !member.getValues) continue;

            var values = member.getValues(),
                dataSource = member.getDataSource(),
                dsID = dataSource ? dataSource.getID() : null;
            
            if (dsID != null) {
                record[dsID] = isc.addProperties(record[dsID] || {}, values);
            } else {
                
                isc.addProperties(record, values);
            }
        }
        return record;
    },
    
    //> @method rulesEngine.processRules()
    // Process a set of the rules present in +link{rulesEngine.rulesData}.
    // This method is invoked by the system when the appropriate +link{rule.triggerEvent} occurs
    // on +link{members} of this engine. It may also be called manually, passing in the
    // array of rules to process. This is how rules with <code>triggerEvent</code> set to
    // <code>"manual"</code> are processed.
    // @param rules (Array of Rules) Rules to process
    // @visibility rules
    //<
    
    processRules : function (rules, component) {
        if (rules == null) return;
        
        var ruleContext = this.getValues(),
            result = null
        ;
        if (!isc.isAn.Array(rules)) {
            rules = [rules]
        }
        for (var i = 0; i < rules.length; i++) {
        try {
            var rule = rules[i],
                values = ruleContext,
                targetComponent = rule.component,
                fieldNames = rule.fieldName,
                propertyNames = rule.propertyName,
                locator = rule.locator,
                shouldApply = true,
                criteria = rule.applyWhen,
                passedApplyWhen,
                logCategory = rule.logCategory || "rulesEngine",
                logSummary = this.logIsInfoEnabled("rulesEngine"),
                logDetail = this.logIsDebugEnabled(logCategory)
            ;

            // Pull list of targetContexts from locator to be used later when applying the
            // rule if applicable and for updating filter values with non-stable ID DBC values
            var targetContexts = [];

            // Rules can apply to a component/field or to a (relative) locator which will
            // return a SC object -- a component, a FormItem or a SectionStackSection.
            // To specify a Canvas directly, use rule.component or rule.locator.
            // To specify a Form field, use rule.fieldName specified as someDS.someFieldName;
            //   rule.component and rule.fieldName; or a locator.
            // To specify a Form field icon, use rule.component, rule.fieldName and
            //   rule.formIconName (name or index); or a locator.
            

            // If a locator is used, we need to find the relevant object and call the
            // appropriate API on it.
            // Note that many rule types don't apply to anything other than FormItems
            

            
            var objectType = rule.targetObjectType;
            if (targetComponent) {
                if (fieldNames) {

                    // Form + Field(s) [ + FormIcon ]
                    var formIconName = rule.formIconName;

                    // Support fieldName being a single fieldName, an array of fieldName strings, or
                    // a comma-separated string.
                    // Normalize to an array first.
                    if (isc.isA.String(fieldNames)) {
                        fieldNames = fieldNames.split(",");
                    // handle locator with no specified fieldName
                    } else if (fieldNames == null) {
                        fieldNames = [];
                    }
                    for (var j = 0; j < fieldNames.length; j++) {
                        var fieldName = fieldNames[j],
                            field = targetComponent.getSpecifiedField(fieldName)
                        ;
                        if (!field) field = window[fieldName];
                        if (field) {
                            var targetContext = {
                                object: field,
                                objectType: objectType || "FormItem",
                                container: targetComponent
                            };
                            if (formIconName != null) {
                                var icon = field.getIcon(formIconName);
                                if (icon) {
                                    targetContext.object = icon;
                                    targetContext.objectType = objectType || "FormItemIcon";
                                    targetContext.container = field;
                                }
                            }
                            targetContexts.add(targetContext);
                        }
                    }
                    // Don't treat fieldNames in the other context (<ds>.<fieldName>)
                    fieldNames = null;
                } else if (targetComponent.isSectionHeader) {
                    // Section header
                    targetContexts.add({
                        object: targetComponent,
                        objectType:objectType || "Section",
                        
                        container: targetComponent.parentElement
                    });

                } else if (isc.isA.Canvas(targetComponent)) {
                    // Canvas
                    targetContexts.add({
                        object: targetComponent,
                        objectType: objectType || "Canvas"
                        // no 'container'
                    });
                }
            } else if (locator != null) {
                // support for multiple locators
                
                if (isc.isA.String(locator)) locator = locator.split(/,(?![^\[]*\])/);
                for (var j = 0; j < locator.length; j++) {
                    var currentLocator = locator[j],
                        isRelativeLocator = isc.AutoTest.isRelativeLocator(currentLocator),
                        targetContext = null  
                    ;
                    if (isRelativeLocator) {
                        if (this.baseComponent == null) {
                            this.logWarn("RulesEngine has no specified baseComponent. Unable to" +
                                    " process rule with specified relative locator:" + currentLocator);
                            continue;
                        }
                        targetContext = isc.AutoTest.getRelativeObjectContext(this.baseComponent, currentLocator, rule.internalRule);
                    } else {
                        targetContext = isc.AutoTest.getObjectContext(currentLocator, rule.internalRule);
                    }

                    if (targetContext == null || targetContext.object == null) {
                        // While destroying a hierarchy of components rules might be fired as
                        // components are removed from the ruleScope. If the rules target another
                        // component in the hierarchy a locator will not be valid anymore because
                        // of the locatorMatching=restrictSuffix. Logging the bad locator is not
                        // desired in this case so another attempt is made to use the locator without
                        // the locatorMatching restriction. If a component is found and is being
                        // destroyed, don't log the locator failure.
                        currentLocator = currentLocator.replace(/,locatorMatching=restrictSuffix/, "");
                        targetContext = isc.AutoTest.getObjectContext(currentLocator, rule.internalRule);
                        if (!targetContext || !targetContext.object || !targetContext.object.destroying) {
                            this.logWarn("RulesEngine unable to resolve locator specified on rule. " +
                                    (this.baseComponent ? "\nBase Component: " + this.baseComponent : "") +
                                    "\nLocator in question:\n" + currentLocator + " - " + isc.AutoTest.getLogFailureText() + this.getStackTrace());
                        }
                        continue;
                    }
                    
                    targetContexts.add(targetContext);
                }
            }

            // If rule.applyWhen is specified we can test this against the full set of values,
            // before spinning through individual targets, running the 'performAction' et al.
            if (criteria) {
                // use the static "applyFilter" since we're gathering values from forms in
                // multiple dataSources
                
                if (isc.DS.isAdvancedCriteria(criteria)) {
                    criteria = isc.DataSource.resolveDynamicCriteria(criteria, values);
                }

                var ruleScope = component ? component.getRuleScopeComponent() : null;
                criteria = isc.DataSource.validateCriteria(criteria, this, ruleScope,
                                                    this.resolveFieldOrPropertyType, this.resolveField);

                // For each of the targetContexts from the locator(s) update the values with
                // non-stable ID DBC values. Hold onto the added property IDs so they can be
                // removed when filtering is complete
                var tempValues = [];
                for (var j = 0; j < targetContexts.length; j++) {
                    var targetContext = targetContexts[j],
                        containers = []
                    ;

                    // A ListGrid EditRowForm field locator resolves the container too nicely to the
                    // grid body instead of the embedded form. For the context of rules the form is
                    // the desired container.
                    if (isc.isA.GridBody(container) && container.grid._editRowForm) {
                        containers.add(container.grid._editRowForm);
                    } else if (isc.isA.FormItem(container)) {
                        containers.add(container.containerWidget);
                    } else if (targetContext.container) {
                        var form = targetContext.container,
                            vm = form.valuesManager
                        ;
                        if (!vm) {
                            containers.add(form);
                        } else {
                            var vmForms = vm.getMembers();
                            for (var m = 0; m < vmForms.length; m++) {
                                containers.add(vmForms[m]);
                            }
                        }
                    }

                    // A form can be a member of a ValuesManager allowing the user to reference
                    // and VM field by simple format in the *When rules. The rule criteria will
                    // be expanded to handle that field value in any of the member forms. For
                    // this to work against the ruleContext, each of the VM members forms needs
                    // to be added to the ruleContext rather than just the base form. Therefore,
                    // there can be multiple containers to add.
                    for (var k = 0; k < containers.length; k++) {
                        var container = containers[k];

                        // For a component without a DS and no stable ID, create a copy of the ruleContext
                        // and add the DBC values using the actual ID. The rule will have been
                        // created to use its actual ID so this design allows access to its values as
                        // well as the rest of the ruleContext.
                        var hasStableID = container &&
                                ((container.hasStableLocalID && container.hasStableLocalID()) ||
                                    container.grid ||
                                    (container.editNode != null))
                        ;
                        if (container && !hasStableID && container.getValues) {
                            
                            var ID = container.getLocalId();
                            values[ID] = { values: container.getValues() };
                            tempValues.add(ID);
                        }
                    }
                }

                var matchingRows = isc.DataSource.applyFilter([values], criteria,
                        this, ruleScope, this.resolveField);
                if (matchingRows.length == 0) {
                    shouldApply = false;
                }
                passedApplyWhen = shouldApply;

                if (tempValues.length > 0) {
                    // Remove temporary DBC field values
                    for (var j = 0; j < tempValues.length; j++) {
                        delete values[tempValues[j]];
                    }
                }
            }

            var logMessageStart,
                logMessageEnd,
                rulesEngine = this,
                logApplyMessage = function(forText, result) {
                    var message = logMessageStart + (forText ? forText : "") + logMessageEnd + result;
                    if (logDetail) {
                        if (passedApplyWhen != null) {
                            var criteriaText;
                            try {
                                criteriaText = isc.echoFull(criteria);
                            } catch (e) {
                                // ignore failure to extract criteria text
                            }
                            message += ". applyWhen criteria " +
                                       (passedApplyWhen ? "matched" : "did not match") +
                                       (criteriaText ? ": " + criteriaText : "");
                        }
                        rulesEngine.logDebug(message, logCategory);
                    } else if (logSummary) {
                        rulesEngine.logInfo(message, logCategory);
                    }
                }
            ;
            if (logSummary || logDetail) {
                logMessageStart = "Applying " + rule.type + " rule '" + rule.name + "' for ",
                logMessageEnd = " with action result ";
            }

            for (var j = 0; j < targetContexts.length; j++) {
                var targetContext = targetContexts[j];

                // Only "rules" have locators (validators do not).
                // The distinction is that the validator has no "condition" and so no need
                // to call "processValidator()" - just call performAction.
                // However - first verify the targetObject type is supported by the
                // validator.

                // A ListGrid EditRowForm field locator resolves the container too nicely to the
                // grid body instead of the embedded form. For the context of rules the form is
                // the desired container.
                var container = targetContext.container;
                if (isc.isA.GridBody(container) && container.grid._editRowForm) {
                    container = container.grid._editRowForm;
                }

                if (logSummary || logDetail) {
                    var objectType = targetContext.objectType,
                        target = targetContext.object,
                        containerPath = (objectType == "FormItemIcon" ?
                                            container.form.ID + "." + container.name + "." :
                                            (container ? container.ID + "." : "")),
                        targetName = (objectType == "MenuItem" ? target.getItem(rule.menuItem).title :
                                        (target.name || target.ID))
                    ;
                    logApplyMessage(objectType + " " + containerPath + targetName, (shouldApply ? "true" : "null"));
                }

                
                isc.Validator.performAction(shouldApply ? true : null, 
                    targetContext.object, rule, values, container, targetContext.objectType);
            }
                
            // Support fieldName being a single fieldName, an array of fieldName strings, or
            // a comma-separated string.
            // Normalize to an array first.
            if (isc.isA.String(fieldNames)) {
                fieldNames = fieldNames.split(",");
            // handle locator with no specified fieldName
            } else if (fieldNames == null) {
                fieldNames = [];
            }
            for (var j = 0; j < fieldNames.length; j++) {
                var fieldName = fieldNames[j],
                    dsName = fieldName.substring(0,fieldName.indexOf(".")),
                    ds = dsName ? isc.DataSource.get(dsName) : null,
                    dsFieldName = (dsName ? fieldName.substring(dsName.length+1) : fieldName),
    
                    value = isc.DataSource.getPathValue(values, fieldName),
    
                    componentInfo = this.getComponentInfo(fieldName),
                    component = componentInfo ? componentInfo.component: null,
                    field = componentInfo ? componentInfo.item : 
                                (ds ? ds.getField(dsFieldName) : null);
                ;
                
                
                
                if (component == null || field == null) {
                    this.logWarn("RulesEngine contains rule definition with specified fieldName:"
                            + fieldName + " - unable to find associated " + 
                             (component == null ? "member component" : "field") + " for this rule.");
                    continue;
                }

                var isValid = null;
                if (shouldApply) {
                    isValid = 
                        (isc.Validator.processValidator(field, rule, value, null, values) == true);
                }
                if (logSummary || logDetail) {
                    logApplyMessage("field '" + fieldName + "'" +
                                    (component ? " in " + component.ID : ""), isValid);
                }
                isc.Validator.performAction(isValid, field, rule, values, component);
                
                

                
                if (isValid == false) {
                    result = false;
                    var errorMessage = isc.Validator.getErrorMessage(rule);
                    component.addFieldErrors(field.name, errorMessage, true);
                    this.rememberRuleFieldError(rule, component, field, errorMessage);
                } else {
                    var currentError = this.getRuleFieldError(rule, component, field);
                    
                    if (currentError && component.clearFieldError) {
                        component.clearFieldError(field.name, currentError, true);
                        this.clearRememberedRuleFieldError(rule, component, field);
                    }
                    if (result == null) result = true;
                }
            }
            
            // Support propertyName being a single propertyName, an array of propertyName strings, or
            // a comma-separated string.
            // Normalize to an array first.
            if (isc.isA.String(propertyNames)) {
                propertyNames = propertyNames.split(",");
            // handle locator with no specified propertyName
            } else if (propertyNames == null) {
                propertyNames = [];
            }
            for (var j = 0; j < propertyNames.length; j++) {
                var propertyName = propertyNames[j],
                    parts = propertyName.split("."),
                    componentID = (parts.length > 0 ? parts[0] : null),
                    fieldName = (parts.length > 2 ? parts[1] : null),
                    propertyName = parts[parts.length-1],
                    component = (componentID.length > 0 ? window[componentID] : null)
                ;

                if (fieldName && fieldName.length > 0) {
                    component = component.getField(fieldName);
                }

                
                
                if (component == null || propertyName == null) {
                    this.logWarn("RulesEngine contains rule definition with specified propertyName:"
                            + propertyName + " - unable to find associated " + 
                             (component == null ? "member component" : "property") + " for this rule.");
                    continue;
                }

                var isValid = null;
                if (shouldApply) {
                    isValid = 
                        (isc.Validator.processValidator(propertyName, rule, value, null, values) == true);
                }
                if (logSummary || logDetail) {
                    logApplyMessage("property '" + propertyName + "'" +
                                    (component ? " in " + component.ID : ""), isValid);
                }
                isc.Validator.performAction(isValid, propertyName, rule, values, component, "Canvas");
            }
        } catch (e) {
            this.logWarn("exception occurred processing rule - skipped: " + (rules[i] && rules[i].name) + " -> " + e);
        }
        }
        return result;
    },
    
    //> @method rulesEngine.resolveFieldOrPropertyType()
    // Given a +link{Canvas.dataPath,dataPath}, resolves a field type by inspecting the 
    // +link{class:DataSource,DataSource} or +link{class:DataBoundComponent,DataBoundComponent}
    // specified in the dataPath.  This method is used by the rules system when validating 
    // and coercing criteria.
    // @param path (String) A +link{Canvas.dataPath,dataPath}
    // @param ruleScope (Canvas) The +link{Canvas.ruleScope,ruleScope component}
    // @return (SimpleType) The field type, or null if the type cannot be resolved
    // @visibility rules
    //<
    resolveFieldOrPropertyType : function(path, ruleScope) {
        var details = (ruleScope ? ruleScope.getRuleContextPathDetails(path) : null),
            field = (details ? details.field : null),
            type = (field ? isc.SimpleType.getType(field.type ? field.type : "text") : null)
        ;
        return type;
    },

    // fieldResolver implementation passed to isc.DS.applyFilter that understands the multiple
    // dataSources that are part of the ruleContext and criteriaPaths.
    // Returns object { field: <field>, dataSource: <ds> }
    resolveField : function(path, ruleScope) {
        return (ruleScope ? ruleScope.getRuleContextPathDetails(path) : null);
    },

    rememberRuleFieldError : function (rule, component, field, errorMessage) {
        // Hang onto the applied error string. We'll selectively clear it below if
        // the triggerEvent runs and validation passes
        
        if (rule._currentErrors ==  null) {
            rule._currentErrors = {};
        }
        var componentID = component.getID();
        if (rule._currentErrors[componentID] == null) {
            rule._currentErrors[componentID] = {};
        }
        rule._currentErrors[componentID][field.name] = errorMessage;    
    },
    getRuleFieldError : function (rule, component, field) {
        var componentID = component.getID();
        if (rule._currentErrors && rule._currentErrors[componentID] 
            && rule._currentErrors[componentID][field.name] != null) 
        {
            return rule._currentErrors[componentID][field.name];
            
        }    
    },
    clearRememberedRuleFieldError : function (rule, component, field) {
        var componentID = component.getID();
        if (rule._currentErrors && rule._currentErrors[componentID] 
            && rule._currentErrors[componentID][field.name] != null) 
        {
            delete rule._currentErrors[componentID][field.name];
        }
    },
    
    // When a rulesEngine applies validators to a field (running in response to a triggerEvent), 
    // errors will be applied to the component.
    // If the component is then actually submitted or explicitly 'validated', all errors are
    // cleared and rebuilt from the field.validators
    // This is a notification fired by the DBC when this happens. It gives us a chance to
    // re-run validators for the field in question and re-apply errors if the value would
    // still fail validation.
    
    applyFieldValidators : function (errors, component) {
        var rules = this.rulesData || [],
            ruleContext = this.getValues(),
            addedErrors = false
        ;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i],
                values = ruleContext,
                targetField = rule.fieldName
            ;
            // Assertion: If there's no rule.fieldName this isn't a validator to
            // apply to an item so will be uneffected by the form's "validate()" method
            if (targetField == null) continue;
            var componentInfo = this.getComponentInfo(targetField);
            // Assertion: We are passed the component being validated. Ignore any rules
            // where the target field is not held by the component.
            if (componentInfo == null || componentInfo.component != component) continue;
            
            var field = componentInfo.item,
                value = isc.DataSource.getPathValue(values, targetField);
            if (!field) return;
            
            // Drop any "remembered" error that we've applied before. It was already cleared
            // by the logic in the DF code.
            this.clearRememberedRuleFieldError(rule, component, field);

            var shouldApply = true;
            if (rule.applyWhen) {
                var criteria = rule.applyWhen;
                var matchingRows = isc.DataSource.applyFilter([values], criteria);
                if (matchingRows.length == 0) {
                    shouldApply = false;
                }
            }
            // Don't do anything if 'shouldApply' is false. The normal form validation code
            // will have already cleared any error so we can just ignore the validator.
            if (!shouldApply) continue;
            
            var isValid = isc.Validator.processValidator(field, rule, value, null, values) == true;
            if (!isValid) {
                var errorMessage = isc.Validator.getErrorMessage(rule);
                if (errors[field.name] == null) errors[field.name] = errorMessage;
                else {
                    if (!isc.isAn.Array(errors[field.name])) {
                        errors[field.name] = [errors[field.name]];
                    }
                    errors[field.name].add(errorMessage);
                }
                // Remember the applied error message so we can selectively clear it if necessary.
                this.rememberRuleFieldError(rule, component, field, errorMessage);
                addedErrors = true;
            }
        }
        
        return addedErrors;
    },
    
    // Method to take a fieldName (including DS name) like "supplyItem.SKU" and find the
    // associated component and item.
    // Returns an object like {component:<dynamicFormInstance>, item:<formitemInstance>}
    getComponentInfo : function (fieldName) {
        var item,
            index = fieldName.indexOf("."),
            dataSource;
        if (index != -1) {
            dataSource = isc.DataSource.get(fieldName.substring(0, index));
            fieldName = fieldName.substring(index+1);
        }
        
        
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].getDataSource() == dataSource && this.members[i].getItem) {
                item = this.members[i].getItem(fieldName);
                if (item != null) {
                    return {component:this.members[i], item:item};
                }
            }
        }
        
    },

    //> @method rulesEngine.removeMember()
    // Removes a dataBoundComponent from this engine's +link{members} array.
    // @param member (DataBoundComponent) member to remove
    // @visibility rules
    //<
    removeMember : function (member) {
        if (this.members.contains(member)) {
            this._removeMember(member);
        }
    },
    _removeMember : function (member) {
        this.members.remove(member);
        member.rulesEngine = null;
    },
    
    //> @attr rulesEngine.rulesData (Array of Rule : null : IRW)
    // This list of rules to be processed by the RulesEngine. 
    // @visibility rules
    //<

    //> @method rulesEngine.setRulesData()
    // Setter for +link{rulesEngine.rulesData}.
    // @param rulesData (Array of Rule) the new rules
    // @visibility rules
    //<
    setRulesData : function (rulesData) {
        this.rulesData = rulesData;
    },

    //> @method rulesEngine.addRule()
    // Add a new rule to +link{rulesEngine.rulesData,rules}.
    // <P>
    // By assigning a unique +link{validator.name,name} to the rule it can be
    // later removed with +link{rulesEngine.removeRule}.
    // @param newRule (Rule) the new rule
    // @visibility rules
    //<
    addRule : function (newRule) {
        if (!newRule) return;
        if (!this.rulesData) this.rulesData = [];
        this.rulesData.add(newRule);
    },

    //> @method rulesEngine.removeRule()
    // Remove a named rule from the +link{rulesEngine.rulesData,rules}.
    // @param name (String) the rule name to remove
    // @visibility rules
    //<
    removeRule : function (name) {
        if (!name || !this.rulesData || this.rulesData.length == 0) return;
        var rules = this.rulesData;
        for (var i = 0; i < rules.length; i++) {
            if (name == rules[i].name) {
                rules.removeAt(i);
                // assume only a single rule with the same name
                break;
            }
        }
    },

    getRule : function (name) {
        if (name && this.rulesData && this.rulesData.length > 0) {
            var rules = this.rulesData;
            for (var i = 0; i < rules.length; i++) {
                if (name == rules[i].name) {
                    return rules[i];
                }
            }
        }
        return null;
    }
});

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
//-------------------------------
// Field Validation functions
//-------------------------------

// Define Validators class for docs
//> @class Validator
// A validator describes a check that should be performed on a value the user is trying to
// save.
// <p>
// Validators are specified for DataSource fields via the +link{attr:DataSourceField.validators}
// property and +link{group:validatorExecution,are executed in the order in which they are defined}.
// Validators that need not be run on the server can also be specified for a
// specific +link{class:FormItem} or +link{class:ListGridField}.
// <p>
// SmartClient supports a powerful library of +link{type:ValidatorType,ValidatorTypes} which
// have identical behavior on both the client and the server.  
// <p> 
// Beyond this, custom validators can be defined on the client and custom validation logic
// added on the server.  Note that the <code>regexp</code> and <code>mask</code> validator
// types are very flexible and can be used to perform virtually any kind of formatting check
// that doesn't involve some large external dataset.
// <p>
// Custom validators can be reused on the client by adding them to the global validator list,
// via the +link{classMethod:Validator.addValidator()} method.
//
// @serverDS allowed
// @visibility external
// @see ValidatorType
// @treeLocation Client Reference/Forms
//<
 
//> @attr validator.type (ValidatorType | String : null : IR)
// Type of the validator.
// <p>
// This can be one of the built-in +link{type:ValidatorType}, the string "custom" to define
// a custom validator, or the string "serverCustom" to define a server-only custom validator.
//
// @serverDS allowed
// @visibility external
//<

//> @attr validator.name (String : null : IR)
// Descriptive name for a validator. Useful when displaying or editing rules in
// a +link{RuleEditor}.
// @visibility rules
//<

//> @attr validator.description (String : null : IR)
// Optional description of this validator, typically used to explain the purpose behind the
// validator. Useful when displaying or editing validators in a +link{RuleEditor}.
// @visibility rules
//<

//> @groupDef xmlCriteriaShorthand
// <i>All rules described in this topic are applied any time a property is of type
// +link{AdvancedCriteria} (in both Component XML and JavaScript component creation)
// and any API declares an +link{AdvancedCriteria} param.</i>
// <p>
// A shorthand format for +link{AdvancedCriteria} is supported for simple criteria
// where the outer criterion is assumed to be an "and" operator:
// <pre>
// &lt;!-- Simple format --&gt;
// &lt;criteria fieldName="restrictAge" operator="equals" value="true"/&gt;
// </pre>
// This is equivalent to:
// <pre>
// &lt;!-- Normal format --&gt;
// &lt;criteria _constructor="AdvancedCriteria operator="and"&gt;
//   &lt;criteria&gt;
//     &lt;criterion fieldName="restrictAge" operator="equals" value="true"/&gt;
//   &lt;/criteria&gt; 
// &lt;/criteria&gt;
// </pre>
// Additionally these defaults are used allowing to simplify AdvancedCriteria declaration:
// <ul>
// <li/> <i>operator="and"</i> default is used if <i>criteria</i> is present at the same level
// <li/> <i>operator="equals"</i> default is used if <i>fieldName</i> is present at the same level
// <li/> <i>value="true"</i> default is used if <i>operator="equals"</i> default was applied
// </ul>
// So, shorthand format above could be simplified even more, for example to
// +link{ButtonItem.enableWhen,conditionally enable a form button}:
// <pre>
// &lt;!-- Simple format --&gt;
// &lt;enableWhen fieldName="CustomerGrid.anySelected"/&gt;
// </pre>
// Full equivalent:
// <pre>
// &lt;!-- Normal format --&gt;
// &lt;enableWhen _constructor="AdvancedCriteria operator="and"&gt;
//   &lt;criteria&gt;
//     &lt;criterion fieldName="CustomerGrid.anySelected" operator="equals" value="true"/&gt;
//   &lt;/criteria&gt;
// &lt;/enableWhen&gt;
// </pre>
// Another example shows all defaults usage, significantly shortening AdvancedCriteria declaration for
// +link{Class.dynamicProperties,boolean dynamic property} (see full setup in
// +explorerExample{booleanDynamicPropertiesXML,Boolean Dynamic Properties} example):
// <pre>
// &lt;!-- Simple format --&gt;
// &lt;trueWhen&gt;
//     &lt;criteria fieldName="settingsForm/values/exportFieldWidths" /&gt;
//     &lt;criteria fieldName="settingsForm/values/exportAs" operator="inSet" &gt;
//         &lt;value&gt;xls&lt;/value&gt;
//         &lt;value&gt;ooxml&lt;/value&gt;
//     &lt;/criteria&gt;
// &lt;/trueWhen&gt;
// </pre>
// Full equivalent:
// <pre>
// &lt;!-- Normal format --&gt;
// &lt;trueWhen&gt;
//     &lt;AdvancedCriteria operator="and"&gt;
//         &lt;criteria&gt;
//             &lt;criterion fieldName="settingsForm/values/exportFieldWidths" operator="equals" value="true"/&gt;
//             &lt;criterion fieldName="settingsForm/values/exportAs" operator="inSet" &gt;
//                 &lt;value&gt;xls&lt;/value&gt;
//                 &lt;value&gt;ooxml&lt;/value&gt;
//             &lt;/criterion&gt;
//         &lt;/criteria&gt;
//     &lt;/AdvancedCriteria&gt;
// &lt;/trueWhen&gt;
// </pre>
// JS example:
// <pre>
// // Simple format
// {fieldName: "restrictAge"}
//
// // Normal format
// {
//   _constructor: "AdvancedCriteria",
//   operator: "and",
//   criteria: [
//     {fieldName: "restrictAge", operator: "equals", value: true}
//   ]
// }
// </pre>
//
// @visibility external
//<

//> @groupDef validatorExecution
// <ul>
// <li>Explicitly defined validators on the dataSource field are run in the order in which they are 
// defined on the client and on the server. Obviously any server-only validators are skipped 
// on the client, and any client-only validators are skipped on the server.</li>
// <li>Implicit type validators (an "isInteger" validator being applied automatically to all fields 
// of type "Integer", for example) are run before any validators applied explicitly at the field level.
// </li>
// <li>If a component has explicitly applied validators in addition to those picked up from the 
// DataSourceField definition, the component-level validators will execute first. 
// (This of course does not apply to server side validation).</li>
// </ul>
// 
// @visibility external
//<

//> @attr validator.applyWhen (AdvancedCriteria : null : IRA)
// Used to create a conditional validator based on +link{AdvancedCriteria,criteria}.
// The criteria defines when the validator applies. The form current values or ListGrid record
// is used as reference for the criteria. If the criteria match, then the validator will be
// processed. Otherwise the validator is skipped and assumed valid.
// <p>
// To use an <code>applyWhen</code> criteria the form or grid must use a +link{DataSource}.
// <p>
// <strong>NOTE:</strong> <code>applyWhen</code> is not supported for "binary" fields.
// <p>
// <h3>Server and client use</h3>
// Conditional validators are enforced both on the server and on the client-side
// when defined on a DataSource field as shown in the examples below. Note the
// <code>applyWhen</code> element is treated as a +link{object:Criterion}.
// <pre>
// &lt;!-- Normal format --&gt;
// &lt;field name="age" type="integer"&gt;
//   &lt;validators&gt;
//     &lt;validator type="integerRange" min="0" max="100"&gt;
//       &lt;applyWhen operator="or"&gt;
//         &lt;criteria&gt;
//           &lt;criterion fieldName="restrictAge" operator="equals" value="true"/&gt;
//           &lt;criterion fieldName="gender" operator="equals" value="female"/&gt;
//         &lt;/criteria&gt; 
//       &lt;/applyWhen&gt;
//     &lt;/validator&gt;
//   &lt;/validators&gt;
// &lt;/field&gt;
//
// &lt;!-- Conditional requirement --&gt;
// &lt;field name="reason" type="text"&gt;
//   &lt;validators&gt;
//     &lt;validator type="required"&gt;
//       &lt;applyWhen fieldName="willAttend" operator="equals" value="false"/&gt;
//     &lt;/validator&gt;
//   &lt;/validators&gt;
// &lt;/field&gt;
// </pre>

// The last example above shows an alternate to the <code>requiredIf</code> validator using a
// +link{group:xmlCriteriaShorthand,shorthand format} which is only available for client-side
// use. On the client the <code>reason</code> field will change appearance to match other
// required or non-required fields when <code>willAttend</code> changes.  Note that using
// <code>applyWhen</code> for a validator of type <code>required</code> as in the example may
// result in validation request being set to the server where a fetch is made against the
// DataSource.  For more details, see the discussion at the end of the
// +link{DataSourceField.required} help topic.
// <p>
// <h3>Component XML and client-only use</h3> 
// Conditional validators can also be applied to +link{group:componentXML,Component XML}
// similarly to provide client-only validations or read-only state management. A common
// use case is conditionally displaying or enabling fields. Use the <code>readOnly</code>
// validator with an <code>applyWhen</code> value to control the read-only appearance of a
// field. The example below shows a field which is hidden when <code>willAttend=true</code>.
// <pre>
// &lt;!-- field definition within a Component XML DynamicForm --&gt;
// &lt;field name="reason" type="text"&gt;
//   &lt;validators&gt;
//     &lt;validator type="readOnly" fieldAppearance="hidden"&gt;
//       &lt;applyWhen fieldName="willAttend" operator="equals" value="true"/&gt;
//     &lt;/validator&gt;
//   &lt;/validators&gt;
// &lt;/field&gt;
// </pre>
// <p>
// Conditional validators can be applied to DynamicForm or ListGrid fields in 
// <smartclient>JavaScript</smartclient><smartgwt>Java</smartgwt> code as well.
// @serverDS allowed
// @visibility external
//<

//> @attr validator.dependentFields (Array of String[] : null : IRA)
// User-defined list of fields on which this validator depends. Primarily used for validators
// of type "custom" but can also be used to supplement +link{validator.applyWhen} criteria.
// <P>
// Note that for validators run on the server, fields required due to
// <code>dependentFields</code> but not present in the +link{DSRequest.data} of an update
// because they haven't changed will be filled in from the server DataSource.
// @serverDS allowed
// @visibility external
// @see validator.applyWhen
//<

//> @attr validator.condition (StringMethod | ValidatorConditionCallback : null : IR)
// For a validator that is not a built-in +link{type:ValidatorType}, a +link{Callback}, 
// function, or JavaScript expression to evaluate to see if this validator passes or fails.
// <p>
// Because the validator declaration itself is passed as a parameter to
// <code>condition()</code>, you can effectively parameterize the validator.  For example, to
// create a validator that checks that the value is after a certain date:<pre> 
//     { type:"custom", afterDate:new Date(), 
//       condition:"value.getTime() > validator.afterDate.getTime()" }
// </pre>
// Reusable validators, like the above, can be registered as a standard validatorType by
// calling +link{Validator.addValidator()}.
// <P>
// Note that, if a field is declared with a builtin +link{type:FieldType}, the value passed in
// will already have been converted to the specified type, if possible.
// <p>
// For the required parameters, see the documentation for
// +link{Callbacks.ValidatorConditionCallback,ValidatorConditionCallback}.
// @serverDS allowed
// @visibility external
//<

//> @method Callbacks.ValidatorConditionCallback
// +link{Callback} required for the property +link{validator.condition} and
// +link{validatorDefinition.condition}.
// @param item (DataSourceField | ListGridField | FormItem) FormItem, DataSourceField or 
//                                          ListGridField on which this validator was 
//                                          declared.  NOTE: FormItem will not
//                                          be available during a save performed without a
//                                          form (eg programmatic save) or if the field 
//                                          is not available in the form.
// @param validator (Validator) Validator declaration from eg
//                              +link{DataSourceField.validators}.
// @param value     (Any)       value to validate
// @param record (Object) Field values for record being validated.
// @param additionalContext (Object) Object containing extra context which may be useful to the 
//                                   condition function.  Contains the following properties:<br>
//                    component: the DynamicForm or ListGrid being validated<br>
//                    rowNum: the row number of the cell being validated (only if component is a ListGrid)<br>
//                    colNum: the column number of the cell being validated (only if component is a ListGrid)
// @return (boolean) whether the value passed validation.  True for passed, false for fail.
//
// @serverDS allowed
// @visibility external
//<

//> @attr validator.serverCondition (String : null : IR)
// For validators of type "serverCustom" only: a scriptlet in any supported JSR223 scripting
// language which is run in order to see if validation passes.  For example:
// <P>
// <pre>
//     &lt;validator type="serverCustom"&gt;
//         &lt;serverCondition language="groovy"&gt;&lt;![CDATA[
//             value &lt; dataSources.StockItem.fetchById(record.itemId).quantity
//         ]]&gt;&lt;/serverCondition&gt;
//     &lt;/validator&gt;
// </pre>
// The scriptlet should return a boolean true or false value - failing to return a value will
// be considered a false result (validator failed).  If your expression is syntactically
// invalid, an exception is thrown and the error message is displayed in the client.
// <P>
// See +link{group:serverScript} for general information on Server Scripting and JSR223, and
// +link{group:velocitySupport} for general information on Velocity support, and also see below
// for special rules for Velocity.
// <P>
// <b>Available variables</b>
// The following variables are available in a <code>serverCondition</code>:
// <ul>
// <li><b>dataSource</b> - The current DataSource</li>
// <li><b>record</b> - Other submitted values part of the same update</li>
// <li><b>value</b> - The value of the field</li>
// <li><b>validator</b> - The config of this validator, including all attributes declared on
//                        the &lt;validator&gt; tag, presented as a <code>Map</code></li>
// <li><b>field</b> - The field (as a <code>DSField</code> object)</li>
// </ul>
// Note that "record" will contain only other values submitted at the same time, not the
// complete DataSource record.  For most types of cross-field validation, you should fetch the
// current saved record using the server-side API DataSource.fetchById().  For example, in
// Velocity:
// <pre>
//     $dataSource.fetchById($record.<i>primaryKeyField</i>).otherFieldName
// </pre>
// Note that, while a DSRequest provides dsRequest.oldValues, these values cannot be relied
// upon for a security check since they could be faked.
// <P>
// Server-side custom validators also have access to the standard set of context variables that
// come from the Servlet API.  However, be aware that if you write conditions that depend upon 
// these variables, you preclude your Validator from being used in the widest possible variety 
// of circumstances; for example, in a command-line process.  Rather, it will be tied to 
// operating in the context of, say, an <code>HttpSession</code>.  
// <P>
// Given the above caveat, the following context variables are also available:
// <ul>
// <li><b>servletRequest</b> - The associated <code>HttpServletRequest</code></li>
// <li><b>session</b> - The associated <code>HttpSession</code></li>
// <li><b>httpParameters</b> - This variable gives you access to the parameters <code>Map</code>
//         of the associated <code>HttpServletRequest</code>; it is an alternate form of 
//         <code>$servletRequest.getParameter</code></li>
// <li><b>requestAttributes</b> - This variable gives you access to the attributes <code>Map</code> 
//         of the associated <code>HttpServletRequest</code>; it is an alternate form of 
//         <code>$servletRequest.getAttribute</code></li>
// <li><b>sessionAttributes</b> - This variable gives you access to the attributes <code>Map</code> 
//         of the associated <code>HttpSession</code>; it is an alternate form of 
//         <code>$session.getAttribute</code></li>
// </ul>
// <P>
// <b>Special considerations for Velocity</b>
// <P>
// To return a true or false value in Velocity, you script can either be just an expression
// that returns a boolean value, or the result of evaluating the Velocity template can result
// in output of "true" or "false".  All of the following are valid forms:
// <p><code>
// &nbsp;&nbsp;$value &lt; 100<br>
// &nbsp;&nbsp;$util.contains($value, "some string")<br>
// &nbsp;&nbsp;$record.someField</code>(assuming that "someField" contains a boolean value)<code><br>
// &nbsp;&nbsp;$value &gt; $record.otherField</code>
// <P>
// For additional troubleshooting information when Velocity expressions aren't working as
// expected, set the log category org.apache.Velocity to DEBUG in log4j.isc.config.xml.
// <P>
// Because it's tricky to call arbitrary Java methods in Velocity, the following special
// objects are passed to Velocity for convenience:
// <ul>
// <li><b>dataSources</b> - The list of all DataSources, accessible by name (so, for example, 
//     <code>$dataSources.supplyItem</code> refers to the <code>supplyItem</code> DataSource
//     object).</li>
// <li><b>util</b> - A <code>com.isomorphic.util.DataTools</code> object, giving you access to
//               all of that class's useful helper functions</li>
// </ul>
//
// @serverDS only
// @example inlineScriptValidation
// @example velocityValidation
// @visibility external
//<

//> @attr validator.serverObject (ServerObject : null : IR)
// For validators of type "serverCustom" only, a +link{ServerObject} declaration that allows
// the SmartClient Server to find a Java class via a variety of possible approaches, and call a
// method on it to perform validation.
// <P>
// The target object must implement a method whose first 4 arguments are:
// <code>
//    Object value, Validator validator, String fieldName, Map record
// </code><p>
// (<code>com.isomorphic.datasource.Validator</code> is a subclass of <code>Map</code> that 
// represents a validator's configuration, and also provides APIs for implementing templated
// error messages).<p>
// You provide the name of the method to call by specifying 
// +link{serverObject.methodName,methodName}
// as part of the serverObject declaration.  If you do not specify a methodName, SmartClient 
// expects to find a compliant method called "condition".
// <P>
// Additional arguments may be declared and are automatically supplied based on the declared
// argument type, via +link{group:dmiOverview,DMI}.  Available objects include:
// <ul>
// <li><b>DataSource</b> - the DataSource where this validator is declared, an instance of
//                         com.isomorphic.datasource.DataSource or a subclass</li>
// <li><b>HttpServletRequest</b> - from standard Java servlets API</li>
// <li><b>HttpServletResponse</b> - from standard Java servlets API</li>
// <li><b>ServletContext</b> - from standard Java servlets API</li>
// <li><b>HttpSession</b> - from standard Java servlets API</li>
// <li><b>RequestContext</b> - an instance of com.isomorphic.servlet.RequestContext</li>
// <li><b>RPCManager</b> - the RPCManager associated with the transaction this validation is 
//                         part of; an instance of com.isomorphic.rpc.RPCManager</li>
// <li><b>DSRequest</b> - the DSRequest this validation is part of; an instance of com.isomorphic.datasource.DSRequest</li>
// <li><b>DSField</b> - the datasource field which value is validated; an instance of com.isomorphic.datasource.DSField</li>
// <li><b>ValidationContext</b> - the context where value is validated; an instance of com.isomorphic.datasource.ValidationContext</li>
// </ul>
// Note that any servlet-related objects will not be available if your validator is run outside
// of the scope of an HTTP servlet request, such as a command-line process.
// <p>
// Note that "record" will contain only other values submitted at the same time, not the
// complete DataSource record.  For most types of cross-field validation, you should fetch the
// current saved record.  For example:
// <pre>
//     final Map<String, Object> existingRecord = dataSource.fetchById(record);
// </pre>
//
// @serverDS only
// @visibility external
// @example dmiValidation
//<

//> @attr validator.resultingValue (Object : null : IR)
// To transform the incoming value that is validated into a different value or format set this
// property from +link{validator.condition()} to the desired value.
// @serverDS allowed
// @visibility external
//<

//> @attr validator.errorMessage (String : null : IR)
// Text to display if the value does not pass this validation check.
// <P>
// If unspecified, default error messages exist for all built-in validators, and a generic
// message will be used for a custom validator that is not passed.
// <P>
// Server-side this string evaluates in a Velocity context where the variables $value and
// $fieldName are available and refer to the supplied value and the field name, respectively.
// Note that if the validator is intended to run both on the client and server, you shouldn't
// use these velocity vars as they will not be expanded on the client and the user may then see
// raw uninterpolated strings.
// 
// @serverDS allowed
// @visibility external
// @example conditionallyRequired
//<

//> @attr validator.stopIfFalse (Boolean : false : IR)
// Normally, all validators defined for a field will be run 
// +link{group:validatorExecution, in the order in which they are defined} 
// even if one of the validators has already failed. 
// However, if <code>stopIfFalse</code> is set, validation will not proceed
// beyond this validator if the check fails.
// <P>
// This is useful to prevent expensive validators from being run unnecessarily, or to allow
// custom validators that don't need to be robust about handling every conceivable type of
// value.
// 
// @serverDS allowed
// @visibility external
//<

//> @attr validator.stopOnError (boolean : null : IR)
// Indicates that if this validator is not passed, the user should not be allowed to exit
// the field - focus will be forced back into the field until the error is corrected.
// <p>
// This property defaults to +link{FormItem.stopOnError} if unset.
// <p>
// Enabling this property also implies +link{FormItem.validateOnExit} is automatically
// enabled. If this is a server-based validator, setting this property also implies that
// +link{FormItem.synchronousValidation} is forced on.
// 
// @serverDS allowed
// @visibility external
//<

//> @attr validator.clientOnly (Boolean : false : IR)
// Indicates this validator runs on the client only.
// <p>
// Normally, if the server is trying to run validators and finds a validator that it can't
// execute, for safety reasons validation is considered to have failed.  Use this flag to
// explicitly mark a validator that only needs to run on the client.  
// 
// @serverDS allowed
// @visibility external
//<

//> @attr validator.validateOnChange (boolean : null : IRW)
// If true, validator will be validated when each item's "change" handler is fired
// as well as when the entire form is submitted or validated. If false, this validator
// will not fire on the item's "change" handler.
// <p>
// Note that this property can also be set at the form/grid or field level;
// If true at any level and not explicitly false on the validator, the validator will be
// fired on change - displaying errors and rejecting the change on validation failure.
// 
// @serverDS allowed
// @visibility external
//<

//> @attr validator.caseSensitive (boolean : false : IR)
// Applies only to the "isUnique" and "hasRelatedRecord" validators and controls
// whether the search for existing records is case sensitive or not.
//
// @serverDS only
// @visibility external
//<

//> @attr validator.operationId (String : null : IR)
// Applies only to the "isUnique" validator; allows you to name a specific 
// +link{dataSource.operationBindings,operation} for the server-side uniqueness check.
// Ignored on the client.
//
// @serverDS only
// @visibility external
//<

//> @attr validator.min (Any : null : IR)
// Indicates the minimum value for range-based validators. By default, range-validators are 
// inclusive, meaning that values that equal the <code>min</code> value will pass validation.  
// To make a validator-range exclusive, and have equal values fail validation, set 
// +link{validator.exclusive, validator.exclusive} to true and provide a 
// +link{validator.errorMessage, custom message}.
//
// @serverDS allowed
// @see validator.max
// @see validator.exclusive
// @visibility external
//<

//> @attr validator.max (Any : null : IR)
// Indicates the maximum value for range-based validators. By default, range-validators are 
// inclusive, meaning that values that equal the <code>max</code> value will pass validation.  
// To make a validator-range exclusive, and have equal values fail validation, set 
// +link{validator.exclusive, validator.exclusive} to true and provide a 
// +link{validator.errorMessage, custom message}.
//
// @serverDS allowed
// @see validator.min
// @see validator.exclusive
// @visibility external
//<

//> @attr validator.exclusive (Boolean : null : IR)
// When set to true, values that equal the specified +link{validator.min} or 
// +link{validator.max} values will fail validation.  When setting this property, consider
// also adding a +link{validator.errorMessage, custom message}.
//
// @serverDS allowed
// @see validator.min
// @see validator.max
// @visibility external
//<



//> @object ValidatorDefinition
// Validator definition for a built-in +link{Validator.type}. 
//
// @treeLocation Client Reference/Forms/Validator
// @visibility external
//<
// Unexposed properties
// - valueType: similar to Operator.valueType -- basically what kind of condition is this - is it
//   a value (like equals, substring, etc), a range, a list of values, none or something custom.
//   Used by the RuleEditor
// - dataType: Many validators only apply to specific data types -- For example integerRange,
//   floatLimit, etc. Sepecifying a dataType indicates that a validator should apply to a data-source
//   field of the specified type only.
//   May be specified as a single type, an array of types, or "none" (or unset) meaning it's not
//   type-specific at all (EG "required").
//   Again - used by the RuleEditor.

//> @attr validatorDefinition.type (String : null : IR)
// Type of the validator unique in +link{type:ValidatorType}.
//
// @visibility external
//<
//> @attr validatorDefinition.shortName (String : null : IR)
// Optional name to be shown in tools that edit validators. If not specified,
// the tools will derive the short name from the +link{type} by assuming it is
// camelCaps similar to +link{dataSource.getAutoTitle}.
//
// @visibility external
//<
//> @attr validatorDefinition.title (String : null : IR)
// Short title of validator used to create an automatic description.
//
// @visibility rules
//<
//> @attr validatorDefinition.description (String : null : IR)
// Short description of this validator.
//
// @visibility rules
//<
//> @attr validatorDefinition.requiresServer (boolean : false : IR)
// Does this validator only run server-side?
//
// @visibility external
//<

//> @attr validatorDefinition.defaultErrorMessage (String : null : IR)
// Default error message to be shown when validator fails validation. Can be overridden
// for an individual validator by setting +link{validator.errorMessage}.
//
// @visibility external
//<

//> @attr validatorDefinition.condition (StringMethod | ValidatorConditionCallback : null : IR)
// +link{Callback}, function or JavaScript expression invoked to perform the actual validation
// of a value.
// <p>
// Because the validator itself is passed as a parameter, you can effectively parameterize it.
// For example, to create a validator that checks that the value is after a certain date:<pre>
//     { type:"custom", afterDate:new Date(), 
//       condition:"value.getTime() > validator.afterDate.getTime()" }
// </pre>
// Note that, if a field is declared with a builtin +link{type:FieldType}, the value passed in
// will already have been converted to the specified type, if possible.
// <p>
// For the required parameters, see the documentation for
// +link{Callbacks.ValidatorConditionCallback,ValidatorConditionCallback}.
// @serverDS allowed
// @visibility external
//<


//> @attr validatorDefinition.action (StringMethod | ValidatorActionCallback : null : IR)
// +link{Callback}, function, or JavaScript expression called after every validation (i.e. call
// to +link{validatorDefinition.condition}) whether it passed or failed. This allows the
// validator perform an operation on the field based on the validation outcome.
// <p>
// An <code>action()</code> function is not needed to report an error message only.
// <P>
// For the required parameters, see the documentation for
// +link{Callbacks.ValidatorActionCallback,ValidatorActionCallback}.
// @visibility external
//<
//> @method Callbacks.ValidatorActionCallback
// +link{Callback} required for the property +link{validatorDefinition.action}.
//
// @param result    (boolean)   The result of the validator. The value will be null if
//                              the validator was skipped because of conditional criteria.
// @param item (DataSourceField | FormItem) FormItem or DataSourceField on which this
//                                          validator was declared.  NOTE: FormItem will not
//                                          be available during a save performed without a
//                                          form (eg programmatic save) or if the field 
//                                          is not available in the form.
// @param validator (Validator) Validator declaration from eg
//                              +link{DataSourceField.validators}.
// @param record (Record) Record that was validated
// @param component (DataBoundComponent) The DataBoundComponent holding the item such
//                                       DynamicForm or ListGrid.
// @visibility external
//<


//> @type ValidatorType
// Used to name a validator or reference a standard, built-in +link{validator} - see list below.
// <p>
// To make use of a standard validator type for a field in a DataSource, or 
// DynamicForm instance, specify the <code>validators</code> property to an array 
// containing a validator definition where the <code>type</code> property is set to 
// the appropriate type.  
// <p>
// A custom error message can be specified for any validator type by setting the
// <code>errorMessage</code> property on the validator definition object, and some
// validator types make use of additional properties on the validator definition 
// object such as <code>max</code> or <code>min</code>.
// <p>
// For example, to use the <code>integerRange</code> validator type:<br><br><code>
// &nbsp;&nbsp;field:{<br>
// &nbsp;&nbsp;&nbsp;&nbsp;validators:[<br>
// &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{type:"integerRange", min:1, max:100}<br>
// &nbsp;&nbsp;&nbsp;&nbsp;]<br>
// &nbsp;&nbsp;}
// </code>
// <p>
// Custom validators can be reused on the client by adding them to the global validator list,
// via the +link{classMethod:Validator.addValidatorDefinition()} method.
//  
// @value isBoolean
// Validation will fail if this field is non-empty and has a non-boolean value.
//
// @value isString
// Validation will fail if the value is not a string value.
//
// @value isInteger
// Tests whether the value for this field is a whole number.  If 
// <code>validator.convertToInteger</code> is true, float values will be converted 
// into integers and validation will succeed.
//
// @value isFloat
// Tests whether the value for this field is a valid floating point number.
//
// @value isFunction
// Tests whether the value for this field is a valid expression or function; if it is
// valid, creates a +link{group:stringMethods,stringMethod} object with the value
// and set the resultingValue to the StringMethod.
//
// @value requiredIf
// RequiredIf type validators should be specified with an <code>expression</code>
// property set to a +link{group:stringMethods,stringMethod}, which takes four
// parameters:<ul>
// <li>item - the DynamicForm item on which the error occurred (may be null)
// <li>validator - a pointer to the validator object
// <li>value - the value of the field in question
// <li>record - the "record" object - the set of values being edited by the widget
// </ul>
// When validation is performed, the expression will be evaluated (or executed). If it
// returns <code>true</code>, the field will be treated as a required field, so validation
// will fail if the field has no value, or, in the case of a +link{FileItem} or +link{UploadItem}
// and if client-side validation is supported by the browser, if no file is selected for upload
// or the selected file is empty.
// <p>To allow server-side enforcement, a <code>required</code> validator can be used instead.
// With the exception of "binary" fields, conditional criteria can be specified with the
// +link{Validator.applyWhen,applyWhen} property.
// <p>See +explorerExample{conditionallyRequired}.
// <p>
// <smartgwt>
// Moreover, the expression provided needs to be in JavaScript, so to use this API, you should be familiar 
// with JavaScript and SmartClient APIs. A pure-Java alternative is to add a 
// {@link com.smartgwt.client.widgets.form.validator.RequiredIfValidator RequiredIfValidator}
// on the DynamicForm or ListGrid where validation is required.
// </smartgwt>
// <p><strong>NOTE:</strong> A requiredIf validator cannot be used to guarantee that a non-empty
// file is uploaded. The user's browser might not support client-side file validation.
// Using a requiredIf validator on a "binary" field may be appropriate in scenarios where the
// application does not technically require a non-empty file to be uploaded by the user.
// For example, in a bug tracking application, a file upload may be required if the
// "Have a test case?" checkbox is checked, but the value of the "Have a test case?" checkbox is
// not actually saved by the application; instead, whether the user is providing a test case is
// inferred by whether a non-empty test case file was uploaded.
//
// @value matchesField
// Tests whether the value for this field matches the value of some other field.
// The field to compare against is specified via the <code>otherField</code> property
// on the validator object (should be set to a field name).
// <p>See +explorerExample{matchValue}.
//
// @value equals
// Tests whether the value for this field matches some value specified via
// <code>value</code>.
//
// @value notEqual
// Tests whether the value for this field does not match some value specified via
// <code>value</code>.
//
// @value isOneOf
// Tests whether the value for this field matches any value from an arbitrary
// list of acceptable values.  The set of acceptable values is specified via
// the <code>list</code> property on the validator, which should be set to an array of
// values. If validator.list is not supplied, the valueMap for the field will be used.
// If there is no valueMap, not providing validator.list is an error.
//
// @value inSet
// Tests whether the value for this field matches any value from an arbitrary
// list of acceptable values.  The set of acceptable values is specified via
// the <code>list</code> property on the validator, which should be set to an array of
// values. If validator.list is not supplied, the valueMap for the field will be used.
// If there is no valueMap, not providing validator.list is an error.
//
// @value notInSet
// Tests whether the value for this field does not match any value from an arbitrary
// list of unacceptable values.  The set of unacceptable values is specified via
// the <code>list</code> property on the validator, which should be set to an array of
// values. Not providing validator.list is an error.
//
// @value integerRange
// Tests whether the value for this field is a whole number within the range 
// specified.  The <code>max</code> and <code>min</code> properties on the validator
// are used to determine the acceptable range, inclusive. To specify the range as
// exclusive of the min/mix values, set <code>exclusive</code> to <code>true</code>.
// <p>See +explorerExample{validationBuiltins}.
//
// @value lengthRange
// This validator type applies to string values only.  If the value is a string value
// validation will fail if the string's length falls outside the range specified by 
// <code>validator.max</code> and <code>validator.min</code>.
// <p>
// Note that non-string values will always pass validation by this validator type.
// <p>
// Note that the <code>errorMessage</code> for this validator will be evaluated as
// a dynamicString - text within <code>&#36;{...}</code> will be evaluated as JS code
// when the message is displayed, with <code>max</code> and <code>min</code> available as
// variables mapped to <code>validator.max</code> and <code>validator.min</code>.
//
// @value contains
// Determine whether a string value contains some substring specified via 
// <code>validator.substring</code>.
//
// @value doesntContain
// Determine whether a string value does <b>not</b> contain some substring specified via 
// <code>validator.substring</code>.
//
// @value substringCount
// Determine whether a string value contains some substring multiple times.
// The substring to check for is specified via <code>validator.substring</code>.
// The <code>validator.operator</code> property allows you to specify how to test
// the number of substring occurrences. Valid values for this property are
// <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>,
// <code>&gt;</code>, <code>&gt;=</code>.
// <p>
// The number of matches to check for is specified via <code>validator.count</code>.
//
// @value regexp
// <code>regexp</code> type validators will determine whether the value specified 
// matches a given regular expression.  The expression should be specified on the
// <code>validator</code> object as the <code>expression</code> property.
// <p>See +explorerExample{formsRegularExpression}.
//
// @value mask
// Validate against a regular expression mask, specified as <code>validator.mask</code>.
// If validation is successful a transformation can also be specified via the
// <code>validator.transformTo</code> property. This should be set to a string in the
// standard format for string replacement via the native JavaScript <code>replace()</code>
// method.
// <p>See +explorerExample{formsValueTransform}.
//
// @value dateRange
// Tests whether the value for a date field is within the range specified.
// Range is inclusive, and is specified via <code>validator.min</code> and
// <code>validator.max</code>, which should be specified in
// <a target=_blank href="http://www.w3.org/TR/xmlschema-2/#dateTime">XML Schema
// date format</a> or as a live JavaScript Date object (for client-only validators only).
// To specify the range as exclusive of the min/mix values, set <code>exclusive</code>
// to <code>true</code>.
// <p>
// Note that the <code>errorMessage</code> for this validator will be evaluated as
// a dynamicString - text within <code>&#36;{...}</code> will be evaluated as JS code
// when the message is displayed, with <code>max</code> and <code>min</code> available as
// variables mapped to <code>validator.max</code> and <code>validator.min</code>.
//
// @value floatLimit
// Validate a field as a valid floating point value within a value range.
// Range is specified via <code>validator.min</code> and <code>validator.max</code>.
// Also checks precision, specified as number of decimal places in 
// <code>validator.precision</code>. If <code>validator.roundToPrecision</code> is set 
// a value that doesn't match the specified number of decimal places will be rounded
// to the nearest value that does.        
// <p>
// For backwards compatibility only. Use "floatRange" and/or "floatPrecision" instead.
//
// @value floatRange
// Tests whether the value for this field is a floating point number within the range 
// specified.  The <code>max</code> and <code>min</code> properties on the validator
// are used to determine the acceptable range, inclusive. To specify the range as
// exclusive of the min/mix values, set <code>exclusive</code> to <code>true</code>.
// <p>
// Note that the <code>errorMessage</code> for this validator will be evaluated as
// a dynamicString - text within <code>&#36;{...}</code> will be evaluated as JS code
// when the message is displayed, with <code>max</code> and <code>min</code> available as
// variables mapped to <code>validator.max</code> and <code>validator.min</code>.
//
// @value floatPrecision
// Tests whether the value for this field is a floating point number with the 
// appropriate number of decimal places - specified in <code>validator.precision</code>
// If the value is of higher precision and <code>validator.roundToPrecision</code> 
// is specified, the value will be rounded to the specified number of decimal places
// and validation will pass, otherwise validation will fail.
//
// @value required
// A non-empty value is required for this field to pass validation.
// <p>In the case of a "binary" field, a non-empty file must be uploaded.
//
// @value readOnly
// Disallows changes to this field, based on the +link{validator.applyWhen} condition.  
// <p>
// In addition to server-side enforcement, this validator will automatically cause editors 
// for the field to become read-only, by rendering in a disabled appearance, readOnly 
// appearance, or even by becoming hidden.
// <p>
// The appearance of the read-only field can be controlled by validator.fieldAppearance.  
// See +link{type:FieldAppearance} for choices. If <code>fieldAppearance</code> is not 
// specified, the default is "readOnly".
//
// @value visibility
// Change the visibility of this field.
//
// @value enable
// Change the enable/disable state of this field.
//
// @value isUnique
// Returns true if the value for this field is unique.  The uniqueness check is performed across
// the whole DataSource unless you specify property <code>validator.criteriaFields</code> as a 
// comma-separated string of field names; in that case, the uniqueness check is done in the 
// context of those extra criteria, allowing you to check, for example, whether an employee 
// number is unique for the department and location found on the record being validated.
// By default the uniqueness check is not case sensitive but this can be controlled through
// the +link{attr:Validator.caseSensitive,caseSensitive} attribute.  You can specify the 
// +link{dataSource.operationBindings,operation} to use for the uniqueness check with the 
// +link{attr:Validator.operationId,operationId} attribute.
// <p>
// Validators of this type have +link{attr:ValidatorDefinition.requiresServer,requiresServer} 
// set to <code>true</code> and do not run on the client, unless all of the following are true:
// <ul>
//   <li> The validation is run in the context of a DataBoundComponent or ValuesManager
//        bound to some DataSource.
//   <li> The DataSource is either clientOnly:true or cacheAllData: true and all data is loaded
//   <li> The item is made available to the validator.  Note that the item is not be available
//        during a save performed without a form (eg programmatic save), or if the field is
//        not available in the form.
// </ul>
// <p>
// Note when isUnique validator is executed as part of validation process during update 
// operation, it will perform uniqueness check only for single row updates. If update targets 
// +link{operationBinding.allowMultiUpdate,multiple records}, then isUnique validator will 
// be skipped. If uniqueness check is needed when updating multiple records, consider using 
// +link{group:dmiOverview,custom DMI} approach to add this check manually.
// <p>See +explorerExample{uniqueCheckValidation}.
//
// @value hasRelatedRecord
// Returns true if the record implied by a relation exists.  The relation can be 
// derived automatically from the +link{attr:DataSourceField.foreignKey} attribute of 
// the field being validated, or you can specify it manually via 
// <code>validator.relatedDataSource</code> and <code>validator.relatedField</code>.
// <p>
// You can specify at DataSource level that this validator should be automatically 
// applied to all fields that specify a +link{attr:DataSourceField.foreignKey,foreignKey} -
// see +link{attr:DataSource.validateRelatedRecords}.
// <p>
// By default the uniqueness check is not case sensitive but this can be controlled through
// the +link{attr:Validator.caseSensitive,caseSensitive} attribute.
// <p>
// Validators of this type have +link{attr:ValidatorDefinition.requiresServer,requiresServer} 
// set to <code>true</code> and do not run on the client.
// <p>
// Note that this validation is generally unnecessary for data coming from a UI.  The 
// typical UI uses a +link{class:SelectItem} or +link{class:ComboBoxItem} with an 
// +link{FormItem.optionDataSource,optionDataSource} for user entry, such that the user 
// can't accidentally enter a related record if that doesn't exist, and a typical SQL 
// schema will include constraints that prevent a bad insert if the user attempts to 
// circumvent the UI.  The primary purpose of declaring this validation explicitly is 
// to provide clear, friendly error messages for use cases such as +link{class:BatchUploader}, 
// where values aren't individually chosen by the user. See also the example
// +explorerExample{hasRelatedValidation,Related Records}.
//
// @value maxFileSize
// This validator type is not for direct usage, instead +link{dataSourceField.maxFileSize} can 
// be set and <code>maxFileSize</code> validator will be added automatically. Use 
// +link{DataSource.maxFileSizeExceededMessage} to customize validation error message.
// <p>
// In supported browsers (Internet Explorer 10+, Chrome, Firefox, Safari 6+, Opera 11.1+), returns
// <code>true</code> if the file(s) selected by the user are not larger than the field's
// +link{DataSourceField.maxFileSize}. If not supported by the browser, the validator will always
// return <code>true</code>.
// <p>
// Note that server-side enforcement of the <code>maxFileSize</code> is always required because
// the user's browser might not support client-side file size checks. Also, any client-side
// check can be bypassed by a malicious user.
//
// @value custom
// Custom client-side validator.  
// <smartclient>+link{validator.condition} will be called to verify data.</smartclient>
// <smartgwt>Use by creating a subclass of +sgwtLink{CustomValidator} and implementing the
// <code>condition</code> method.</smartgwt>
//
// @value serverCustom
// Custom server-side validator that either evaluates the Velocity expression provided in 
// +link{Validator.serverCondition,serverCondition} (see +explorerExample{velocityValidation})
// or makes DMI call to +link{Validator.serverObject,serverObject} to evaluate condition
// (see +explorerExample{dmiValidation}).
// <p>
// Validators of this type have +link{attr:ValidatorDefinition.requiresServer,requiresServer} 
// set to <code>true</code> and do not run on the client.
//
// @visibility external
//<
        
// NOTE ON DEFAULT ERROR MESSAGES:
// If the validator doesn't have an error message, set the defaultErrorMessage property on the
// object to distinguish it from an error message set by the user (errorMessage property).
// It's unnecessary to do this on the server because the error message is returned as part of
// the validation result, and the validator parameters aren't modified.

isc.ClassFactory.defineClass("Validator");

isc.Validator.addProperties({

//> @attr validator.serverOnly (boolean : null : IR)
// Indicates this validator runs on the server only.
// 
// @serverDS only
// @visibility external
//<

});

// These need to be constants to allow the built-in validators to be i18n'd.  NOTE: it would be
// nice to move these definitions closer to the relevant validator, but note that some
// validators have more than one error message, so we can't adopt a simple convention of naming
// the errors after the validator.
isc.Validator.addClassProperties({
    //> @classAttr   Validator.notABoolean (String : "Must be a true/false value." : [IRA])
    //  Default error message to display when standard <code>isBoolean</code> type validator
    //  returns false.
    // @visibility external
    // @group i18nMessages
    //<
    notABoolean:"Must be a true/false value.",
    //> @classAttr   Validator.notAString (String : "Must be a string." : [IRA])
    //  Default error message to display when standard <code>isString</code> type validator
    //  returns false.
    // @visibility external
    // @group i18nMessages
    //<
    notAString:"Must be a string.",
    //> @classAttr   Validator.notAnInteger (String : "Must be a whole number." : [IRA])
    //  Default error message to display when standard <code>isInteger</code> type validator
    //  returns false.
    // @visibility external
    // @group i18nMessages    
    //<    
    notAnInteger:"Must be a whole number.",
    //> @classAttr   Validator.notADecimal (String : "Must be a valid decimal." : [IRA])
    //  Default error message to display when standard <code>isFloat</code> type validator
    //  returns false.
    // @visibility external
    // @group i18nMessages
    //<    
    notADecimal:"Must be a valid decimal.",
    //> @classAttr   Validator.notADate (String : "Must be a date." : [IRA])
    //  Default error message to display when standard <code>isDate</code> type validator
    //  returns false.
    // @visibility external
    // @group i18nMessages    
    //<    
    notADate:"Must be a date.",

    
    //> @classAttr   Validator.notATime (String : "Must be a time." : [IRA])
    //  Default error message to display when standard <code>isTime</code> type validator
    //  returns false.
    // @group i18nMessages
    //<    
    notATime: "Must be a time.",
    
    //> @classAttr   Validator.notAnIdentifier (String : "Identifiers must start with a letter, underscore or $ character, and may contain only letters, numbers, underscores or $ characters." : [IRA])
    //  Default error message to display when standard <code>isIdentifier</code> type validator
    //  returns false.
    // @group i18nMessages    
    //<    
    notAnIdentifier: "Identifiers must start with a letter, underscore or $ character, " +
                    "and may contain only letters, numbers, underscores or $ characters.",
                    
    //> @classAttr   Validator.notARegex (String : "Must be a valid regular expression." : [IRA])
    //  Default error message to display when standard <code>isRegex</code> type validator
    //  returns false.
    // @group i18nMessages    
    //<    
    notARegex:"Must be a valid regular expression.",
    
    //> @classAttr   Validator.notAColor (String : "Must be a CSS color identifier." : [IRA])
    //  Default error message to display when standard <code>isColor</code> type validator
    //  returns false.
    // @group i18nMessages    
    //<    
    notAColor:"Must be a CSS color identifier.",

    //> @classAttr   Validator.mustBeLessThan (String : "Must be no more than ${max}" : [IRA])
    //  Default error message to display when standard <code>integerRange</code> type validator
    //  returns false because the value passed in is greater than the specified maximum.
    // This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<
    mustBeLessThan:"Must be no more than ${max}", 

    //> @classAttr   Validator.mustBeGreaterThan (String : "Must be at least ${min}" : [IRA])
    //  Default error message to display when standard <code>integerRange</code> type validator
    //  returns false because the value passed in is less than the specified minimum.
    // <p>This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<        
    mustBeGreaterThan:"Must be at least ${min}", 
    
    //> @classAttr Validator.mustBeLaterThan (String : "Must be ${min.toShortDate()} or later" : [IRA])
    // Default error message to display when standard <code>dateRange</code> type validator
    // returns false because the value passed in is greater than the specified maximum date.
    // <p>This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<
    
    mustBeLaterThan:"Must be ${min.toShortDate()} or later", 

    //> @classAttr Validator.mustBeLaterThanTime (String : "Must be ${isc.Time.toShortTime(min)} or later" : [IRA])
    // Default error message to display when standard <code>timeRange</code> type validator
    // returns false because the time-portion of the date-value passed in is less than the 
    // specified minimum time.
    // <p> This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<
    mustBeLaterThanTime:"Must be ${isc.Time.toShortTime(min)} or later", 

    //> @classAttr Validator.mustBeEarlierThan (String : "Must be ${max.toShortDate()} or earlier" : IRA)
    // Default error message to display when standard <code>dateRange</code> type validator
    // returns false because the value passed in is less than the specified maximum date.
    // This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<        
    mustBeEarlierThan:"Must be ${max.toShortDate()} or earlier", 

    //> @classAttr Validator.mustBeEarlierThanTime (String : "Must be ${isc.Time.toShortTime(max)} or earlier" : [IRA])
    // Default error message to display when standard <code>timeRange</code> type validator
    // returns false because the time-portion of the date-value passed in is greater than the 
    // specified minimum time.
    // <p> This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<
    mustBeEarlierThanTime:"Must be ${isc.Time.toShortTime(max)} or earlier", 

    //> @classAttr Validator.mustBeShorterThan (String : "Must be no more than ${max} characters" : IRA)
    // Default error message to display when standard <code>lengthRange</code> type validator
    // returns false because the value passed in has more than <code>validator.max</code> characters.
    // This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<
    mustBeShorterThan:"Must be no more than ${max} characters",

    //> @classAttr Validator.mustBeLongerThan (String : "Must be at least ${min} characters" : IRA)
    // Default error message to display when standard <code>lengthRange</code> type validator
    // returns false because the value passed in has fewer than <code>validator.min</code> characters.
    // This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<    
    mustBeLongerThan:"Must be at least ${min} characters",
    
    //> @classAttr   Validator.mustBeExactLength (String : "Must be exactly ${max} characters" : [IRA])
    // Default error message to display when standard <code>lengthRange</code> type validator
    // has <code>validator.max</code> and <code>validator.min</code> set to the same value,
    // and returns false because the value passed is not the same length as these limits.<br>
    // This is a dynamic string - text within <code>&#36;{...}</code> will be evaluated as JS code
    // when the message is displayed, with <code>max</code> and <code>min</code> available as
    // variables mapped to <code>validator.max</code> and <code>validator.min</code>.
    // @visibility external
    // @group i18nMessages    
    //<
    mustBeExactLength:"Must be exactly ${max} characters",

    //> @classAttr   Validator.mustBeUnique (String : "Value must be unique" : [IRA])
    //  Default error message to display when standard <code>isUnique</code> type validator
    //  returns false.
    // @group i18nMessages
    //<
    mustBeUnique:"Value must be unique",
    
    //> @classAttr   Validator.notAMeasure (String : "Must be a whole number, percentage, '*' or 'auto'" : [IRA])
    //  Default error message to display when standard <code>isMeasure</code> type validator
    //  returns false.
    // @group i18nMessages    
    //<    
    notAMeasure:"Must be a whole number, percentage, '*' or 'auto'",
    
    //> @classAttr   Validator.requiredField (String : "Field is required" : [IRA])
    // Default error message to display when validation fails for a field marked as required
    // or with a standard <code>required</code> type validator.
    // The message is also displayed for a field with a standard <code>requiredIf</code> type
    // validator whose condition evaluates to true, because the field has no value.
    // @visibility external
    // @group i18nMessages    
    //<    
    requiredField:"Field is required",

    //> @classAttr Validator.requiredFile (HTMLString : "Non-empty file required" : IRA)
    // Default error message to display for a required +link{UploadItem} or +link{FileItem}
    // when no file is selected for upload or the selected file is empty.
    // @group i18nMessages
    //<
    requiredFile:"Non-empty file required",

    //> @classAttr   Validator.notOneOf (String : "Not a valid option" : [IRA])
    // Default error message to display when standard <code>isOneOf</code> type validator
    // is not passed.
    // @visibility external
    // @group i18nMessages    
    //<    
    notOneOf:"Not a valid option",
    
    //> @classAttr   Validator.notAFunction (String : "Must be a function." : [IRA])
    //  Default error message to display when standard <code>isFunction</code> type validator
    //  returns false.
    // @group i18nMessages    
    //<    
    notAFunction:"Must be a function.",

    //> @classAttr Validator.maxFileSizeExceeded (HTMLString : "Size of '${uploadedFileName}' (${isc.NumberUtil.toMiBString(uploadedFileSize, maxFileSize)} MiB) exceeds maximum allowed file size of ${isc.NumberUtil.toMiBString(maxFileSize, uploadedFileSize)} MiB." : IR)
    // Default error message to display when the standard <code>maxFileSize</code> type validator
    // returns <code>false</code>.
    // @group i18nMessages
    // @visibility external
    //<
    maxFileSizeExceeded:"Size of '${uploadedFileName}' (${isc.NumberUtil.toMiBString(uploadedFileSize, maxFileSize)} MiB) exceeds maximum allowed file size of ${isc.NumberUtil.toMiBString(maxFileSize, uploadedFileSize)} MiB.",
    _getUploadItem : function (item) {
        if (!isc.isAn.UploadItem ||
            !(isc.isAn.UploadItem(item) ||
              (isc.isA.FileItem && isc.isA.FileItem(item) &&
               isc.isAn.UploadItem(item.uploadItem))))
        {
            return null;
        }

        var uploadItem = item;
        if (isc.isA.FileItem && isc.isA.FileItem(item)) {
            uploadItem = item.uploadItem;
        }
        
        return uploadItem;
    },

    _$true : "true",
    _$false : "false",
    _$dot:".",

    //> @type FieldAppearance
    // @value isc.Validator.READONLY Show in read-only appearance
    // @value isc.Validator.HIDDEN   Hide field
    // @value isc.Validator.DISABLED Disable field
    // @visibility external
    //<

    //> @classAttr Validator.READONLY (Constant : "readOnly" : [R])
    // A declared value of the enum type  
    // +link{type:FieldAppearance,FieldAppearance}.
    // @visibility external
    // @constant
    //<
    READONLY:"readOnly",

    //> @classAttr Validator.HIDDEN (Constant : "hidden" : [R])
    // A declared value of the enum type  
    // +link{type:FieldAppearance,FieldAppearance}.
    // @visibility external
    // @constant
    //<
    HIDDEN:"hidden",

    //> @classAttr Validator.DISABLED (Constant : "disabled" : [R])
    // A declared value of the enum type  
    // +link{type:FieldAppearance,FieldAppearance}.
    // @visibility external
    // @constant
    //<
    DISABLED:"disabled",

    _validatorDefinitions : {
    
    
        // isType validators
        // ------------------------------------------------------------------------------------

        // Validation will fail if this field is non-empty and has a non-boolean value.
        isBoolean: {
            type:"isBoolean",
            description:"Value is boolean",
            valueType:"none",
            dataType:"none",
            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;
                if (isc.isA.Boolean(value)) return true;
    
                if (!validator.errorMessage) {
                    validator.defaultErrorMessage = isc.Validator.notABoolean;
                }
    
                if (isc.isA.String(value)) {
                    var Validator = isc.Validator;
                    validator.resultingValue = (value == Validator._$true);
                    // "true" and "false" is the valid String representation of a boolean
                    return (value == Validator._$true || value == Validator._$false);
                } else if (isc.isA.Number(value)) {
                    validator.resultingValue = (value != 0);
                    // 0 and 1 is the valid numeric representation of a boolean
                    return (value == 0 || value == 1);
                }
                // anything else is a failure, but we still tell you it's boolean value
                validator.resultingValue = !!value;
                return false;
            }
        },
        
        // Validation will fail if the value is not a string value.
        
        isString: {
            type:"isString",
            description:"Value is a string",
            valueType:"none",
            dataType:"none",
            condition : function (item, validator, value) {
                if (value == null || isc.isA.String(value)) return true;
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notAString;
                validator.resultingValue = isc.iscToLocaleString(value);
                return true;
            }
        },

        // Tests whether the value for this field is a whole number.  If 
        // validator.convertToInteger is true, float values will be converted 
        // into integers and validation will succeed.
        isInteger: {
            type:"isInteger",
            description:"Value is a whole number",
            valueType:"none",
            dataType:"none",
            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notAnInteger;
                if (isc.isA.String(value)) {
                    value = value.trim();
                    if (value.length == 0) {
                        // if the trimmed value is a zero-length string, that's invalid
                        validator.resultingValue = null;
                        return false;
                    }
                }

                // if the value can't be resolved to a number, return false
                if (isNaN(value)) {
                    validator.resultingValue = null;
                    return false;
                }

                var stringInBrowser = (item && item.stringInBrowser !== undefined ? isc.booleanValue(item.stringInBrowser) : undefined);

                // If stringInBrowser is set to true and value is a string - leave it as string. 
                if (stringInBrowser === true && isc.isA.String(value)) {
                    validator.resultingValue = value;
                    return true;
                }

                if (item && item.type && item.type.startsWith("locale") && isc.isA.String(value)) {
                    var intValue = isc.NumberUtil.parseLocaleInt(value);
                    if (isNaN(intValue)) {
                        validator.resultingValue = null;
                        return false;
                    } else {
                    	validator.resultingValue = intValue;
                    	return true;
                    }
                }

                // Note: this routine will be subject to JavaScript's rounding errors for extremely
                // large numbers (16+ digits)
                var intValue = parseInt(value,10),
                    isInteger = (value == intValue);
                

                if (!isInteger) {
                    // if convertToInteger is true, convert floats to ints and pass validation
                    if (validator.convertToInteger) {
                        // Parse as float and round instead of parseInt() because parseInt() is
                        // basically Math.floor().  We want 1.5 to become 2, etc.
                        var floatValue = parseFloat(value);
                        intValue = Math.round(floatValue);

                        // reset suggested value (no change if already an integer)
                        validator.resultingValue = intValue;

                        // return true - if we're doing the conversion allow validation to succeed
                        return true;

                    // if convertToInteger is false, leave the value in place and fail validation
                    
                    } else {
                        return false;
                    }
                } else {
                    

                    // detecting lost precision useful code snippet not needed at the moment
                    /*
                    var lostPrecision = !(value == intValue.toString());
                    // If stringInBrowser is not defined and loosing precision - leave string value.
                    if (item && isc.booleanValue(item.stringInBrowser, true) !== false) {
                        // Test do we really lost precision or it is just preceding zeroes.
                        if (isc.isA.String(value) && lostPrecision) {
                            // Check if validating value has same significant digits as parsed int.
                            // For example: value +00123 is correctly converted to int but
                            // checking with (value == floatValue.toString()) will incrrectly identify it as a lost precision.
                            // Regex to parse any integer
                            var r = new RegExp('^([+|-](?=\\d))?(\\d*)');
                            // Parse validating value
                            var parsedValue = r.exec(value);
                            // Removing preceding zeroes
                            if (parsedValue[2] == null) parsedValue[2] = '';
                            parsedValue[2] = parsedValue[2].replace(/^0+/,'');
                            // Parse converted int value
                            var parsedInt = r.exec(intValue.toString());
                            // Removing preceding zeroes
                            if (parsedInt[2] == null) parsedInt[2] = '';
                            parsedInt[2] = parsedInt[2].replace(/^0+/,'');
                            lostPrecision = !(parsedValue[2] == parsedInt[2]);
                        }
                        if (isc.isA.String(value) && lostPrecision) {
                            validator.resultingValue = value;
                            return true;
                        }
                    }
                    */
                    if (intValue == Number.POSITIVE_INFINITY || intValue == Number.NEGATIVE_INFINITY) {
                        // return string value if configured, otherwise leave "forced" int value even if it is out of range
                        if (isc.isA.String(value) &&
                            (stringInBrowser === true || isc.booleanValue(isc.DataSource.defaultStringInBrowser, true)))
                        {
                            validator.resultingValue = value;
                            return true;
                        }
                    }

                    validator.resultingValue = intValue;
                    return true;
                }
            }
        },

        // Tests whether the value for this field is a valid floating point number.
        isFloat: {
            type:"isFloat",
            description:"Value is a floating point number",
            valueType:"none",
            dataType:"none",            
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value)) return true;
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notADecimal;
                
                if (isc.isA.String(value)) {
                    value = value.trim();
                    if (value.length == 0) {
                        // if the trimmed value is a zero-length string, that's invalid
                        validator.resultingValue = null;
                        return false;
                    }
                }

                // if the value can't be resolved to a number, return false
                if (isNaN(value)) {
                    validator.resultingValue = null;
                    return false;
                }

                var stringInBrowser = (item && item.stringInBrowser !==   undefined ? isc.booleanValue(item.stringInBrowser) : undefined);

                // If stringInBrowser is set to true and value is a string - leave it as string. 
                if (stringInBrowser === true && isc.isA.String(value)) {
                    validator.resultingValue = value;
                    return true;
                }
                // is the value a valid float?
                var floatValue;
                // treat "." as zero - this ensures that if the user is typing ".3", and we're
                // validating on change, the '.' doesn't kill editing
                if (value == isc.Validator._$dot) {
                    floatValue = "0.";
                } else if (item && item.type && item.type.startsWith("locale") && isc.isA.String(value)) {
                	floatValue = isc.NumberUtil.parseLocaleFloat(value);
                    if (isNaN(floatValue)) {
                        return false;
                    }
                } else {
                    floatValue = parseFloat(value);

                    

                    // detecting lost precision useful code snippet not needed at the moment
                    /*
                    var lostPrecision = !(value == floatValue.toString());
                    // Test do we really lost precision or it is just preceding/trailing zeroes or exponential number representation.
                    if (isc.isA.String(value) && lostPrecision) {
                        // Check if validating value has same significant digits as parsed float.
                        // For example: values 001.23 or 1.230 are correctly converted to float but
                        // checking with (value == floatValue.toString()) will incrrectly identify it as a lost precision.
                        // We do not check sign or exponent part. Check maximum 16 significant digits - all browsers should support it.
                        // Regex to parse any number (including exponential representation)
                        var r = new RegExp('^([+|-](?=\\d|(?:\\.(?=\\d))))?(\\d*)(\\.(?=\\d)\\d*)?(?:e([+|-])?(\\d+))?', 'i');
                        // Parse validating value
                        var parsedValue = r.exec(value);
                        // Removing preceding zeroes
                        if (parsedValue[2] == null) parsedValue[2] = '';
                        parsedValue[2] = parsedValue[2].replace(/^0+/,'');
                        // Removing decimal point
                        if (parsedValue[3] == null) parsedValue[3] = '';
                        if (parsedValue[3].indexOf('.') == 0) parsedValue[3] = parsedValue[3].substring(1);
                        // Remove trailing zeroes
                        parsedValue[3] = parsedValue[3].replace(/0+$/,'');
                        var sDigits = parsedValue[2] + parsedValue[3];
                        // If there are more than 16 significant digits - we definitely lost precision
                        if (sDigits.length <= 16) {
                            // Less or equal than 16 significant digits - compare to float value
                            // Make it 16 digits long
                            var sDigits = parsedValue[2] + parsedValue[3] + '0000000000000000';
                            sDigits = sDigits.substring(0, 16);
                            // Parse converted float value
                            var parsedFloat = r.exec(floatValue.toExponential(16));
                            // Removing preceding zeroes
                            if (parsedFloat[2] == null) parsedFloat[2] = '';
                            parsedFloat[2] = parsedFloat[2].replace(/^0+/,'');
                            // Removing decimal point
                            if (parsedFloat[3] == null) parsedFloat[3] = '';
                            if (parsedFloat[3].indexOf('.') == 0) parsedFloat[3] = parsedFloat[3].substring(1);
                            // Make it 16 digits long
                            var fDigits = parsedFloat[2] + parsedFloat[3] + '0000000000000000';
                            fDigits = sDigits.substring(0, 16);
                            lostPrecision = !(sDigits == fDigits);
                        } else {
                            lostPrecision = true;
                        }
                    }
                    */

                    // out of range check
                    if ((floatValue == Number.POSITIVE_INFINITY || floatValue == Number.NEGATIVE_INFINITY)) {
                        // return string value if configured, otherwise leave "forced" float value even if it is out of range
                        if (isc.isA.String(value) &&
                            (stringInBrowser === true || isc.booleanValue(isc.DataSource.defaultStringInBrowser, true)))
                        {
                            validator.resultingValue = value;
                            return true;
                        }
                    }
                }
                validator.resultingValue = floatValue;
            
                return true;
            }
        },
        
        
        isDate: {
            type:"isDate",
            description:"Value is a date",
            valueType:"none",
            dataType:"none",            
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value) || isc.isA.Date(value)) return true;
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notADate;
            
                var dateValue = isc.Validator._acceptExcelFormats ? 
                    isc.DateUtil.parseInput(value) : isc.DateUtil.parseSchemaDate(value);
                // an "invalid date" will return true from isNaN()
                if (dateValue == null || isNaN(dateValue.getTime())) return false;
    
                validator.resultingValue = dateValue;
                return true;
            }
        },
        
        
        isTime: {
            type:"isTime",
            description:"Value is a logical Time value",
            valueType:"none",
            dataType:"none",            
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value) || isc.isA.Date(value)) return true;
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notATime;
                
                var dateValue = isc.Time.parseInput(value, true);
                // support being passed a full datetime string as well
                if (dateValue == null) {
                    dateValue = isc.DateUtil.parseSchemaDate(value);
                }
                if (dateValue != null) {
                    validator.resultingValue = dateValue;
                    return true;
                }
                return false;
            }
        },
        
        // This is used for validating ISC components defined in XML
        // Leave as un-exposed for now.
        isIdentifier: {
            type:"isIdentifier",
            valueType:"none",
            dataType:"none",            
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value)) return true;
                if (!validator.errorMessage) {
                    validator.defaultErrorMessage = isc.Validator.notAnIdentifier;
                }
                return value.match(/^[a-zA-Z_\$][\w\$]*$/) != null;
            }
        },
            
        // This is used for validating ISC components defined in XML
        // Leave as un-exposed for now.
        isRegexp: {
            type:"isRegexp",
            description:"Matches pattern",
            valueType:"none",
            dataType:"none", // This is really string or Regexp           
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value)) return true;
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notARegex;
                
                if (typeof value == 'object' && value.constructor == RegExp) return true;
            
                
                if (isc.Browser.isDOM) {
                    if (!isc.Validator._isRegexp) {
                        isc.Validator._isRegexp = isc._makeFunction("value",
                            "try{var regex=new RegExp(value)}catch(e){return false}return true");
                    }
                    return isc.Validator._isRegexp(value);
                } else {
                    var regex = new RegExp(value);
                    return true;
                }
            }
        },

        // Tests whether the value for this field is a valid expression or function; if it is
        // valid, creates a StringMethod object with the value, and set the resultingValue to
        // the StringMethod
        isFunction: {
            type:"isFunction",
            valueType:"none",
            dataType:"none",            
            condition :  function (item, validator, value) {
                if (value == null || isc.isAn.emptyString(value) || value === isc.Class.NO_OP ||
                    isc.isA.Function(value) || isc.isA.StringMethod(value))
                {
                    return true;
                }
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notAFunction;

                if (isc.isAn.Array(value)) {
                    if (!item.multiple) return false;

                    var resultingValue = new Array(value.length);
                    for (var i = 0; i < value.length; ++i) {
                        var val = value[i];
                        if (val == null || isc.isAn.emptyString(val) || val === isc.Class.NO_OP ||
                            isc.isA.Function(val) || isc.isA.StringMethod(val))
                        {
                            resultingValue[i] = val;
                        } else {
                            try {
                                isc.Func.expressionToFunction("", val);
                            } catch (e) {
                                return false;
                            }

                            if (val.iscAction) val = val.iscAction;
                            resultingValue[i] = isc.StringMethod.create({value:val});
                        }
                    }

                    validator.resultingValue = resultingValue;
                    return true;

                } else {
                    try {
                        isc.Func.expressionToFunction("", value);
                    } catch (e) {
                        return false;
                    }

                    // catch the case where we have a function derived from an Action
                    // in this case pick up the original action again.
                    if (value.iscAction) value = value.iscAction;
                    validator.resultingValue = isc.StringMethod.create({value:value});
                    return true;
                }
            }
        },

        // isColor() - used for validating ISC components defined in XML
        // Leave as un-exposed for now.
        isColor: {
            type:"isColor",
            valueType:"none",
            dataType:"text",            
            condition : function (item, validator, value) {
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notAColor;
                
                // empty string/undefined/null is generally treated as the transparent color, so allow
                // that.  If an actual entry is required, you can specify the 'required' validator
                if (!value) return true;
    
                return isc.isA.color(value);
            }
        },
        
        // This is used for validating ISC components defined in XML
        // Leave as un-exposed for now.
        isMeasure: {
            type:"isMeasure",
            valueType:"none",
            dataType:["integer", "string"],
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value) || value == "*") return true;
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.notAMeasure;
     
    
                // if it ends in percent, check if it's all digits       
                if (isc.isA.String(value) && value.charAt(value.length - 1) == '%') {
                    value = value.slice(0, -1);
                    // Not using parseInt here because parseInt returns a valid number if the
                    // string is prefixed with a valid number
                    return value.match(/\d+\.?\d*/) != null;
                }
                return isc.Validator.processValidator(item, validator, value, "integerOrAuto");
            }
        },
    
        // This is used for validating ISC components defined in XML
        // Leave as un-exposed for now.
        integerOrAuto: {
            type:"integerOrAuto",
            valueType:"none",
            dataType:["integer", "string"],
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value) || 
                    (isc.isA.String(value) && value.toLowerCase() == "auto")) return true;
                return isc.Validator.processValidator(item, validator, value, "isInteger");
            }
        },
    
        // This is used for validating ISC components defined in XML
        // Leave as un-exposed for now.
        integerOrIdentifier: {
            type:"integerOrIdentifier",
            valueType:"none",
            dataType:["integer", "string"],
            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value)) return true;
                
                if (value.match(/^[a-zA-Z_\$][\w\$]*$/) != null) return true;

                return isc.Validator.processValidator(item, validator, value, "isInteger");
            }
        },
    
            
        // Integer validators
        // ------------------------------------------------------------------------------------
        
        // Tests whether the value for this field is a whole number within the range 
        // specified.  The max and min properties on the validator
        // are used to determine the acceptable range.
        integerRange: {
            type:"integerRange",
            title:"Value in range",
            description:"Value is an integer within the specified range",
            
            valueType:"valueRange",
            dataType:"integer",    // You could apply an integerRange to a float type field,
                                   // but it'd be less common than just using a floatRange
            rangeStartAttribute:"min",
            rangeEndAttribute:"max",

            condition : function (item, validator, value) {
                // skip null or zero-length strings - those are valid
                if (value == null || isc.is.emptyString(value)) return true;

                if (isc.isA.String(value)) {
                    value = value.trim();
                    if (value.length == 0) {
                        // if the trimmed value is a zero-length string, that's invalid - bail
                        // but return true, allowing an overarching isInteger validator to fail
                        return true;
                    }
                }
                // If we're passed a non numeric value, just return without adding an error.
                // This is appropriate since the type of the field will probably be specified as 
                // "integer" meaning that the built in integer validator will also be present on the
                // field.
                if (isNaN(value)) return true;
                var intValue;
                if (isc.isA.Number(value)) {
                    intValue = value;
                } else {
                    intValue = parseInt(value,10);
                }

                // If stringInBrowser is set to true and value is a string - validator pass.
                if (item && isc.booleanValue(item.stringInBrowser) === true && isc.isA.String(value)) {
                    return true;
                }

                // Allow dynamic error messages to be eval'd, with pointers to min and max values
                validator.dynamicErrorMessageArguments = {validator:validator,
                                                          max:validator.max,
                                                          min:validator.min};

                // If stringInBrowser is not defined and loosing precision - use BigDecimal.
                // For normal numbers we should avoid using BigDecimal because it is slow.
                if (item && isc.booleanValue(item.stringInBrowser, true) !== false && isc.isA.String(value) && !(value == intValue.toString())) {
                    var bd = isc.BigDecimal.create(value);
                    if (isc.isA.Number(validator.max) &&
                        // exclusive means it's an error is value is exactly max
                        ((!validator.exclusive && bd.compareTo(validator.max) > 0) ||
                         (validator.exclusive && bd.compareTo(validator.max) >= 0)))
                    {
                        if (!validator.errorMessage) {
                            validator.defaultErrorMessage = isc.Validator.mustBeLessThan
                        }
                        return false;
                    }
                    if (isc.isA.Number(validator.min) &&
                        // exclusive means it's an error is value is exactly min
                        ((!validator.exclusive && bd.compareTo(validator.min) < 0) ||
                         (validator.exclusive && bd.compareTo(validator.min) <= 0)))
                    {
                        if (!validator.errorMessage) {
                            validator.defaultErrorMessage = isc.Validator.mustBeGreaterThan
                        }
                        return false;
                    }
                    return true;
                }

                // if a maximum was specified, return false if we're greater than the max
                if (isc.isA.Number(validator.max) && 
                    // exclusive means it's an error if value is exactly max
                    ((!validator.exclusive && intValue > validator.max) ||
                     (validator.exclusive && intValue >= validator.max)))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeLessThan
                    }
                    return false;
                }
                // if a minumum was specified, return false if we're less than the min
                if (isc.isA.Number(validator.min) && 
                    // exclusive means it's an error is value is exactly min
                    ((!validator.exclusive && intValue < validator.min) ||
                     (validator.exclusive && intValue <= validator.min)))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeGreaterThan;
                    }
                    return false;
                }
                return true;
            }
        },
        
        // String validators
        // ------------------------------------------------------------------------------------
        
        // This validator type applies to string values only.  If the value is a string value
        // validation will fail if the strings length falls outside the range specified by 
        // validator.max and validator.min.
        // Note that non-string values will always pass validation by this validator type.<br>
        // Note that the errorMessage for this validator will be evaluated as
        // a dynamicString - text within ${...} will be evaluated as JS code
        // when the message is displayed, with max and min available as
        // variables mapped to validator.max and validator.min.
        lengthRange: {
            type:"lengthRange",
            title:"String length in range",
            description:"Value is a string whose length falls within the specified range",

            valueType:"valueRange",    
            dataType:"text",
            rangeStartAttribute:"min",
            rangeEndAttribute:"max",
            
            editorTitle:"Range",

            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;
                
                // if value null/undefined, or isn't a string, return true
                if (!isc.isA.String(value)) return true;
                
                // Allow dynamic error messages to be eval'd, with pointers to min and max values
                validator.dynamicErrorMessageArguments = {validator:validator,
                                                          max:validator.max,
                                                          min:validator.min};
            
                // get the length of the value
                var length = value.length,
                    maxNumber = validator.max != null ? parseInt(validator.max,10) : null,
                    minNumber = validator.min != null ? parseInt(validator.min,10) : null;
                    
                if (!isc.isA.Number(maxNumber)) maxNumber = null;
                if (!isc.isA.Number(minNumber)) minNumber = null;
                
                // if a maximum was specified, return false if length is greater than the max
                if (maxNumber != null && length > maxNumber) {
                    validator.defaultErrorMessage = 
                        (maxNumber == minNumber ? isc.Validator.mustBeExactLength 
                                                : isc.Validator.mustBeShorterThan);
                    return false;
                }
    
                // if a minumum was specified, return false if length is less than the min
                if (minNumber != null && length < minNumber) {
                    validator.defaultErrorMessage = 
                        (maxNumber == minNumber ? isc.Validator.mustBeExactLength
                                                : isc.Validator.mustBeLongerThan);
                    return false;
                }
                return true;
            }
        },
        
        // Determine whether a string value contains some substring specified via 
        // validator.substring.
        contains:{
            type:"contains",
            title:"String contains substring",
            description:"Value contains the specified substring",
            valueType:"fieldType",
            dataType:"text",
            valueAttribute:"substring",
            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;
                if (!isc.isA.String(value)) value = isc.iscToLocaleString(value);
                return value.indexOf(validator.substring) > -1;
            }
        },
            
        // Determine whether a string value does not contain some substring specified via 
        // validator.substring.
        doesntContain: {
            type:"doesntContain",
            shortName: "Doesn't Contain",
            title:"String does not contain substring",
            description:"Value does not contain the specified substring",
            valueType:"fieldType",
            dataType:"text",
            valueAttribute:"substring",
            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;
                if (!isc.isA.String(value)) value = isc.iscToLocaleString(value);
                return value.indexOf(validator.substring) == -1;
            }
        },
        
        // Determine whether a string value contains some substring multiple times.
        // The substring to check for is specified via validator.substring.
        // The <code>validator.operator</code> property allows you to specify how to test
        // the number of substring occurrences. Valid values for this property are
        // ==, !=, <, <=, >, >=.
        // The number of matches to check for is specified via validator.count.
        substringCount: {
            type:"substringCount",
            title:"String contains substring multple times",
            description:"Value contains a specified substring multiple times",
            reifyName:"Repeating strings",
            valueType:"custom",
            dataType:"text",
            // This will show a custom edit-item when rendered in a RuleEditor, allowing the
            // user to specify substring, count and operator.
            // Defined in RuleEditor.js
            // Implemented as a simple dynamicForm embedded in a canvasItem, so we can
            // just 'getValues' to pick up rule attributes
            
            
            editorType:"SubstringCountEditor",
            editorTitle:"Substring",
            getAttributesFromEditor:function (fieldName, item) {
                var form = item.canvas;
                return form.getValues();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                var form = item.canvas;
                if (attributes == null) {
                    form.clearValues();
                    return;
                }
                form.setValue("substring", attributes.substring);
                form.setValue("count", attributes.count);
                form.setValue("operator", attributes.operator);
            },
            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;
                var substring = validator.substring;
                // get the number of times the value contains the substring and put it into "matchCount"
                for (var index = 0,	matchCount = 0; index < value.length; index++) {
                    index = value.indexOf(substring,index);
                    if (index > -1) matchCount++;
                    else break;
                }
                
                var operator = validator.operator, 
                    count = validator.count
                ;
                if (!operator) operator = "==";
                if (!count) count = 0;
                
                switch (operator) {
                    case "==" : return matchCount == count;
                    case "!=" : return matchCount != count;
                    case "<" : return matchCount < count;
                    case "<=" : return matchCount <= count;
                    case ">" : return matchCount > count;
                    case ">=" : return matchCount >= count;
                }
                
                // otherwise return false
                return false;
            }
        },

        // regexp type validators will determine whether the value specified 
        // matches a given regular expression.  The expression should be specified on the
        // validator object as the expression property.
        regexp: {
            type:"regexp",
            title:"Value matches regex",
            description:"Value matches a regular expression",
            reifyName: "Matches pattern",
            valueType:"fieldType",
            dataType:"text",
            valueAttribute:"expression",
            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;

                // get the expression to validate and normalize it to a regExp value
                var expression = validator.expression;
                if (isc.isA.String(expression)) {
                    expression = new RegExp(expression);
                }

                // return whether or not the expression matches the value
                expression.lastIndex = 0;
                return expression.test(value);
            }
        },

        // Validate against a regular expression mask, specified as validator.mask.
        // If validation is successful a transformation can also be specified via the
        // validator.transformTo property. This should be set to a string in the
        // standard format for string replacement via the native JavaScript replace()
        // method.
        mask: {
            type:"mask",
            title:"Values matches regex mask",
            description:"Value matches a regular expression mask",
            reifyName: "Match pattern and transform",
            valueType:"custom",
            dataType:"text",
            editorType:"MaskRuleEditor",
            getAttributesFromEditor:function (fieldName, item) {
                var form = item.canvas;
                return form.getValues();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                var form = item.canvas;
                if (attributes == null) {
                    form.clearValues();
                    return;
                }
                form.setValue("mask", attributes.mask);
                form.setValue("transformTo", attributes.transformTo);
            },

            condition : function (item, validator, value) {
                // skip empty fields
                if (value == null) return true;

                // cater for earlier validators converting the value
                if (!isc.isA.String(value) && isc.isA.Function(value.toString)) 
                    value = value.toString();

                if (isc.is.emptyString(value)) return true;
                var mask = validator.mask;

                // and convert to a regular expression if it's a string
                if (isc.isA.String(mask)) mask = validator.mask = new RegExp(mask);

                // check the value against the mask
                mask.lastIndex = 0;
                if (!mask.test(value)) {
                    return false;
                } else {
                    // if it passes the test

                    // if they specify a transformTo, transform the item and set the 
                    //	resultingValue to the transformed value
                    if (validator.transformTo) {
                        validator.resultingValue = value.replace(mask, validator.transformTo);
                    }
                }

                // return that the mask was validated successfully
                return true;
            }
        },

        // Dates
        // ---------------------------------------------------------------------------------------
        // Tests whether the value for a date field is within the range specified.
        // Range is inclusive, and is specified via validator.min and
        // validator.max, which should be specified in "http://www.w3.org/TR/xmlschema-2/#dateTime".
        // date format or as a live JavaScript Date object (for client-only validators only).
        // 
        // Note that the errorMessage for this validator will be evaluated as
        // a dynamicString - text within ${...} will be evaluated as JS code
        // when the message is displayed, with max and min available as
        // variables mapped to validator.max and validator.min.
        dateRange:{
            type:"dateRange",
            title:"Value in range",
            description:"Value is a date within the specified range",
            valueType:"valueRange",
            dataType:"date",
            rangeStartAttribute:"min",
            rangeEndAttribute:"max",
            // We don't want to pick the the default from 
            // SearchForm for dates (which is a DateRangeItem)
            editorType:"RelativeDateItem",

            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value)) return true;
    
                if (!isc.isA.Date(value)) return false;
    
                var min = validator.min, max = validator.max;
    
                // make a one-time attempt to parse min and max to dates.  Handy when specifying
                // min and max dates in XML.
                if (min != null && !isc.isA.Date(min)) {
                    min = validator.min = isc.DateUtil.parseSchemaDate(min);
                }
                if (max != null && !isc.isA.Date(max)) {
                    max = validator.max = isc.DateUtil.parseSchemaDate(max);
                }
    
                // Allow dynamic error messages to be eval'd, with pointers to min and max values
                validator.dynamicErrorMessageArguments = {validator:validator,
                                                          max:max,
                                                          min:min};
                if (isc.isA.Date(min) && 
                    // exclusive means it's an error is value is exactly min
                    ((!validator.exclusive && value.getTime() < min.getTime()) ||
                     (validator.exclusive && value.getTime() <= min.getTime())))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeLaterThan
                    }
                    return false;
                }
                if (isc.isA.Date(max) &&
                    // exclusive means it's an error is value is exactly max
                    ((!validator.exclusive && value.getTime() > max.getTime()) ||
                     (validator.exclusive && value.getTime() >= max.getTime())))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeEarlierThan;
                    }
                    return false;
                }
                return true;
            }
        },
  
        // Times
        // ---------------------------------------------------------------------------------------
        // Tests whether the time-value for a date field is within the range specified.
        // Range is inclusive, and is specified via validator.min and
        // validator.max, which should be specified in "http://www.w3.org/TR/xmlschema-2/#dateTime".
        // date format or as a live JavaScript Date object (for client-only validators only).
        // 
        // Note that the errorMessage for this validator will be evaluated as
        // a dynamicString - text within ${...} will be evaluated as JS code
        // when the message is displayed, with max and min available as
        // variables mapped to validator.max and validator.min.
        timeRange: {
            type:"timeRange",
            title:"Value in range",
            description:"Value is a logical time value within the specified range",
            valueType:"valueRange",
            dataType:"time",
            rangeStartAttribute:"min",
            rangeEndAttribute:"max",

            condition : function (item, validator, value) {
                if (value == null || isc.is.emptyString(value)) return true;
    
                if (!isc.isA.Date(value)) return false;
    
                var min = validator.min, max = validator.max;
    
                // make a one-time attempt to parse min and max to dates.  Handy when specifying
                // min and max dates in XML.
                if (min != null && !isc.isA.Date(min)) {
                    if (isc.isA.String(min) && min.contains(":")) {
                        // support a time-string like "10:30"
                        var parts = min.split(":"),
                            hours = parts[0] || 0,
                            minutes = parts[1] || 0,
                            seconds = parts[2] || 0,
                            milliseconds = parts[3] || 0
                        ;
                        min = validator.min = new Date(0,0,0, hours, minutes, seconds, milliseconds);
                    } else {
                        min = validator.min = isc.DateUtil.parseSchemaDate(min);
                    }
                }
                if (max != null && !isc.isA.Date(max)) {
                    if (isc.isA.String(max) && max.contains(":")) {
                        // support a time-string like "10:30"
                        var parts = max.split(":"),
                            hours = parts[0] || 0,
                            minutes = parts[1] || 0,
                            seconds = parts[2] || 0,
                            milliseconds = parts[3] || 0
                        ;
                        max = validator.max = new Date(0,0,0, hours, minutes, seconds, milliseconds);
                    } else {
                        max = validator.max = isc.DateUtil.parseSchemaDate(max);
                    }
                }
    
                // Allow dynamic error messages to be eval'd, with pointers to min and max values
                validator.dynamicErrorMessageArguments = {validator:validator,
                                                          max: max,
                                                          min: min};
    
                min.setFullYear(value.getFullYear());
                min.setMonth(value.getMonth());
                min.setDate(value.getDate());
    
                max.setFullYear(value.getFullYear());
                max.setMonth(value.getMonth());
                max.setDate(value.getDate());
    
                if (isc.isA.Date(min) && 
                    // exclusive means it's an error if value is exactly min
                    ((!validator.exclusive && value < min) ||
                     (validator.exclusive && value <= min)))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeLaterThanTime;
                    }
                    return false;
                }
                if (isc.isA.Date(max) &&
                    // exclusive means it's an error is value is exactly max
                    ((!validator.exclusive && value > max) ||
                     (validator.exclusive && value >= max)))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeEarlierThanTime;
                    }
                    return false;
                }
                return true;
            }
        },

        // Floats
        // ---------------------------------------------------------------------------------------
        // Validate a variable as a valid floating point value, within a value range.
        // Range is specified via validator.min and validator.max.
        // Also checks precision, specified as number of decimal places in 
        // validator.precision. If validator.roundToPrecision is set, 
        // a value that doesn't match the specified number of decimal places will be rounded
        // to the nearest value that does.        
        //
        // backcompat only, replaced by floatRange and floatPrecision
        floatLimit: {
            type:"floatLimit",
            
            valueType:"custom", 
            dataType:"float",
            condition : function (item, validator, value) {
                var roundedValue;
    
                // Check precision before max/min as rounding may push it over the edge.        
                if (validator.precision != null) {
                    //>!BackCompat 2005.02.03
                    // Old functionality always had no 'roundToPrecision' param, but always
                    // rounded and passed.
                    if (validator.roundToPrecision == null) validator.roundToPrecision = true;
                    //<!BackCompat
                    if (!isc.Validator.processValidator(item, validator, value, "floatPrecision"))
                        return false;
                    // from now on test with the rounded version.
                    if (validator.resultingValue != null) 
                        value = roundedValue = validator.resultingValue;
                }
                if (validator.min != null || validator.max != null) {
                    if (!isc.Validator.processValidator(item, validator, value, "floatRange")) {
                        return false
                    } else {
                        // the second processValidator call will have cleared out resultingValue
                        // which may have come from the precision validator.
                        if (roundedValue != null && validator.resultingValue == null && 
                            validator.roundToPrecision) 
                            validator.resultingValue = roundedValue;
                    } 
                }            
                return true;
            }
        },
        
        // Tests whether the value for this field is a floating point number within the range 
        // specified.  The max and min properties on the validator
        // are used to determine the acceptable range.
        // Note that the errorMessage for this validator will be evaluated as
        // a dynamicString - text within ${...} will be evaluated as JS code
        // when the message is displayed, with max and min available as
        // variables mapped to validator.max and validator.min.
        floatRange: {
            type:"floatRange",
            title:"Value in range",
            description:"Value is a floating point number within the specified range",
            // Editor implemented in RuleEditor.js - simple dynamicForm based canvasItem
            // with fields for each attribute.
            valueType:"custom",
            dataType:"float",
            editorType:"FloatRangeEditor",
            getAttributesFromEditor:function (fieldName, item) {
                var form = item.canvas;
                return form.getValues();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                var form = item.canvas;
                if (attributes == null) {
                    form.clearValues();
                    return;
                }
                form.setValue("min", attributes.min);
                form.setValue("max", attributes.max);
                form.setValue("exclusive", !!attributes.exclusive);
            },

            condition : function (item, validator, value) {
                // skip null or zero-length strings - those are valid
                if (value == null || isc.is.emptyString(value)) return true;

                if (isc.isA.String(value)) {
                    value = value.trim();
                    if (value.length == 0) {
                        // if the trimmed value is a zero-length string, that's invalid - bail
                        // but return true, allowing an overarching isInteger validator to fail
                        return true;
                    }
                }

                // If we're passed a non numeric value, just return without adding an error.
                // This is appropriate since the type of the field will probably be specified as 
                // "float" meaning that the built in float validator will also be present on the
                // field.
                
                if (isNaN(value)) return true;
                var floatValue;
                if (isc.isA.Number(value)) {
                    floatValue = value;
                } else {
                    floatValue = parseFloat(value);
                }

                // If stringInBrowser is set to true and value is a string - validator pass.
                if (item && isc.booleanValue(item.stringInBrowser) === true && isc.isA.String(value)) {
                    return true;
                }

                // Allow dynamic error messages to be eval'd, with pointers to min and max values
                validator.dynamicErrorMessageArguments = {validator:validator,
                                                          max:validator.max,
                                                          min:validator.min};
            
                
                var max, 
                    min;
                if (validator.max != null) {
                    max = isc.isA.Number(validator.max) ? validator.max : parseFloat(validator.max);
                }
                if (validator.min != null) {
                    min = isc.isA.Number(validator.min) ? validator.min : parseFloat(validator.min);
                }

                // If stringInBrowser is not defined and loosing precision - use BigDecimal.
                // For normal numbers we should avoid using BigDecimal because it is slow.
                if (item && isc.booleanValue(item.stringInBrowser, true) !== false && isc.isA.String(value) && !(value == floatValue.toString())) {
                    var bd = isc.BigDecimal.create(value);
                    if (isc.isA.Number(max) &&
                        // exclusive means it's an error is value is exactly max
                        ((!validator.exclusive && bd.compareTo(max) > 0) ||
                         (validator.exclusive && bd.compareTo(max) >= 0)))
                    {
                        if (!validator.errorMessage) {
                            validator.defaultErrorMessage = isc.Validator.mustBeLessThan
                        }
                        return false;
                    }
                    if (isc.isA.Number(min) &&
                        // exclusive means it's an error is value is exactly min
                        ((!validator.exclusive && bd.compareTo(min) < 0) ||
                         (validator.exclusive && bd.compareTo(min) <= 0)))
                    {
                        if (!validator.errorMessage) {
                            validator.defaultErrorMessage = isc.Validator.mustBeGreaterThan
                        }
                        return false;
                    }
                    return true;
                }

                // is the value less than the max allowable? (if specified)
                if (isc.isA.Number(max) && (
                    // fail if value exceeds maximum JS number
                    floatValue > Number.MAX_VALUE || floatValue == Number.POSITIVE_INFINITY ||
                    // exclusive means it's an error is value is exactly max
                    (!validator.exclusive && floatValue > max) ||
                    (validator.exclusive && floatValue >= max)))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeLessThan;
                    }
                    return false;
                }
                
                // is the value greater than the min allowable? (if specified)
                if (isc.isA.Number(min) && (
                    // fail if value exceeds minimum JS number
                    floatValue < -Number.MAX_VALUE || floatValue == Number.NEGATIVE_INFINITY ||
                    // exclusive means it's an error is value is exactly min
                    (!validator.exclusive && floatValue < min) ||
                    (validator.exclusive && floatValue <= min)))
                {
                    if (!validator.errorMessage) {
                        validator.defaultErrorMessage = isc.Validator.mustBeGreaterThan;
                    }
                    return false;
                }
                return true;
            }
        },
        
        // Tests whether the value for this field is a floating point number with the 
        // appropriate number of decimal places - specified in validator.precision
        // If the value is of higher precision, if validator.roundToPrecision 
        // is specified, the value will be rounded to the specified number of decimal places
        // and validation will pass, otherwise validation will fail.
        floatPrecision: {
            type:"floatPrecision",
            title:"Floating point number precision check",
            description:"Value is a floating point number specified to the appropriate precision",
            // Editor implemented in RuleEditor.js - simple dynamicForm based canvasItem
            // with fields for each attribute.
            valueType:"custom",
            dataType:"float",
            editorType:"FloatPrecisionEditor",
            getAttributesFromEditor:function (fieldName, item) {
                var form = item.canvas;
                return form.getValues();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                var form = item.canvas;
                if (attributes == null) {
                    form.clearValues();
                    return;
                }
                form.setValue("precision", attributes.precision);
                form.setValue("roundToPrecision", attributes.roundToPrecision);
            },


            condition : function (item, validator, value) {
                // skip null or zero-length strings - those are valid
                if (value == null || isc.is.emptyString(value)) return true;

                if (isc.isA.String(value)) {
                    value = value.trim();
                    if (value.length == 0) {
                        // if the trimmed value is a zero-length string, that's invalid - fail
                        return false;
                    }
                }

                if (isNaN(value)) return false;
                var floatValue = parseFloat(value);

                // If stringInBrowser is set to true and value is a string - validator pass.
                if (item && isc.booleanValue(item.stringInBrowser) === true && isc.isA.String(value)) {
                    return true;
                }
                // If stringInBrowser is not defined and loosing precision - validator pass.
                if (item && isc.booleanValue(item.stringInBrowser, true) !== false) {
                    var lostPrecision = !(value == floatValue.toString());
                    // Test do we really lost precision or it is just preceding/trailing zeroes or exponential number representation.
                    if (isc.isA.String(value) && lostPrecision) {
                        // Check if validating value has same significant digits as parsed float.
                        // For example: values 001.23 or 1.230 are correctly converted to float but
                        // checking with (value == floatValue.toString()) will incrrectly identify it as a lost precision.
                        // We do not check sign or exponent part. Check maximum 16 significant digits - all browsers should support it.
                        // Regex to parse any number (including exponential representation)
                        var r = new RegExp('^([+|-](?=\\d|(?:\\.(?=\\d))))?(\\d*)(\\.(?=\\d)\\d*)?(?:e([+|-])?(\\d+))?', 'i');
                        // Parse validating value
                        var parsedValue = r.exec(value);
                        // Removing preceding zeroes
                        if (parsedValue[2] == null) parsedValue[2] = '';
                        parsedValue[2] = parsedValue[2].replace(/^0+/,'');
                        // Removing decimal point
                        if (parsedValue[3] == null) parsedValue[3] = '';
                        if (parsedValue[3].indexOf('.') == 0) parsedValue[3] = parsedValue[3].substring(1);
                        // Remove trailing zeroes
                        parsedValue[3] = parsedValue[3].replace(/0+$/,'');
                        var sDigits = parsedValue[2] + parsedValue[3];
                        // If there are more than 16 significant digits - we definitely lost precision
                        if (sDigits.length <= 16) {
                            // Less or equal than 16 significant digits - compare to float value
                            // Make it 16 digits long
                            var sDigits = parsedValue[2] + parsedValue[3] + '0000000000000000';
                            sDigits = sDigits.substring(0, 16);
                            // Parse converted float value
                            var parsedFloat = r.exec(floatValue.toExponential(16));
                            // Removing preceding zeroes
                            if (parsedFloat[2] == null) parsedFloat[2] = '';
                            parsedFloat[2] = parsedFloat[2].replace(/^0+/,'');
                            // Removing decimal point
                            if (parsedFloat[3] == null) parsedFloat[3] = '';
                            if (parsedFloat[3].indexOf('.') == 0) parsedFloat[3] = parsedFloat[3].substring(1);
                            // Make it 16 digits long
                            var fDigits = parsedFloat[2] + parsedFloat[3] + '0000000000000000';
                            fDigits = sDigits.substring(0, 16);
                            lostPrecision = !(sDigits == fDigits);
                        } else {
                            lostPrecision = true;
                        }
                    }
                    if (isc.isA.String(value) && lostPrecision) {
                        return true;
                    }
                }

                // if validator.precision is defined, round to that precision.
                if (isc.isA.Number(validator.precision)) {
                    var multiplier = Math.pow(10, validator.precision);
                    var roundedValue = (Math.round(floatValue * multiplier))/multiplier;
                    if (validator.roundToPrecision) {
                        validator.resultingValue = roundedValue;
                        return true;
                    } else {
                        return (floatValue == roundedValue);
                    }
                }
            }
        },

        // Generic (typeless) validators
        // ---------------------------------------------------------------------------------------

        // RequiredIf type validators should be specified with an expression
        // property set to a stringMethod which takes three parameters:
        //   item - the DynamicForm item on which the error occurred (may be null)
        //   validator - a pointer to the validator object
        //   value - the value of the field in question
        // When validation is performed, the expression will be evaluated (or executed) - if it
        // returns true, the field will be treated as a required field, so validation
        // will fail if the field has no value.
        requiredIf: {
            type: "requiredIf",
            description: "Conditionally required field",
            
            valueType:"fieldType",
            dataType:"none",
            valueAttribute:"expression",
            editorType:"TextAreaItem",

            condition : function (item, validator, value, record) {
                // CALLBACK API:  available variables:  "item,validator,value"
                // Convert a string callback to a function
                if (validator.expression != null && !isc.isA.Function(validator.expression)) {
                    isc.Func.replaceWithMethod(validator, "expression", "item,validator,value,record");
                }

                var required = validator.expression(item,validator,value,record);

                var uploadItem,
                    fileInputElem,
                    files;
                if (required &&
                    (uploadItem = isc.Validator._getUploadItem(item)) != null &&
                    (fileInputElem = uploadItem.getFocusElement()) != null &&
                    (files = fileInputElem.files) != null)
                {
                    // Default to displaying the 'requiredFile' error message.
                    if (!validator.errorMessage) {
                        validator.errorMessage = isc.Validator.requiredFile;
                    }

                    var numFiles = files.length;
                    for (var i = 0; i < numFiles; ++i) {
                        var file = files[i],
                            fileSize = file.size || file.fileSize;
                        if (fileSize > 0) return true;
                    }
                    return false;

                } else {

                    // Default to displaying the 'requiredField' error message.
                    if (!validator.errorMessage) {
                        validator.errorMessage = isc.Validator.requiredField;
                    }

                    // if the item is not required, or isn't empty, return true
                    return !required || (value != null && !isc.isAn.emptyString(value));
                }
            }
        },

        // Tests whether the value for this field matches any value from an arbitrary
        // list of acceptable values.  The set of acceptable values is specified via
        // the list property on the validator, which should be set to an array of
        // values. If validator.list is not supplied, the valueMap for the field will be used.
        // If there is no valueMap, not providing validator.list is an error.
        isOneOf: {
            type: "isOneOf",
            title:"Value in list",
            description: "Is one of list",
            valueType:"valueSet",
            dataType:"none",
            valueAttribute:"list",
            editorTitle:"Values",
            condition : function (item, validator, value, record) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;

                // get the list of items to match against, either declared on this validator
                // or automatically derived from the field's valueMap (item.valueMap)
                
                var valueMap = validator.list || (item ? (item.getValueMap ? item.getValueMap() 
                                                                           : item.valueMap) 
                                                       : null),
                valueList = valueMap;
                if (!isc.isAn.Array(valueMap) && isc.isAn.Object(valueMap)) {
                    valueList = isc.getKeys(valueMap);
                }
            
                if (valueList != null) {
                    // if any item == the value, return true
                    for (var i = 0, length = valueList.length; i < length; i++) {
                        if (valueList[i] == value) return true;
                    }
                //>DEBUG
                } else {
                    isc.Log.logWarn("isOneOf validator specified with no specified list of options " +
                                "or valueMap - validator will always fail. " +
                                "Field definition:" + isc.Log.echo(item), "validation");
                //<DEBUG
                }
                // otherwise, failure return false
                if (!validator.errorMessage) {
                    validator.defaultErrorMessage = isc.Validator.notOneOf;
                }
                return false;
            }
        },

        // Tests whether the value for this field matches any value from an arbitrary
        // list of acceptable values.  The set of acceptable values is specified via
        // the list property on the validator, which should be set to an array of
        // values. If validator.list is not supplied, the valueMap for the field will be used.
        // If there is no valueMap, not providing validator.list is an error.
        inSet: {
            type: "inSet",
            title:"Value in set",
            description: "In list of values",
            valueType:"valueSet",
            dataType:"none",
            valueAttribute:"list",
            editorTitle:"Values",
            condition : function (item, validator, value, record) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;

                // get the list of items to match against, either declared on this validator
                // or automatically derived from the field's valueMap (item.valueMap)
                
                var valueMap = validator.list || (item ? (item.getValueMap ? item.getValueMap() 
                                                                           : item.valueMap) 
                                                       : null),
                valueList = valueMap;
                if (!isc.isAn.Array(valueMap) && isc.isAn.Object(valueMap)) {
                    valueList = isc.getKeys(valueMap);
                }
            
                if (valueList != null) {
                    // if any item == the value, return true
                    for (var i = 0, length = valueList.length; i < length; i++) {
                        if (valueList[i] == value) return true;
                    }
                //>DEBUG
                } else {
                    isc.Log.logWarn("inSet validator specified with no specified list of options " +
                                "or valueMap - validator will always fail. " +
                                "Field definition:" + isc.Log.echo(item), "validation");
                //<DEBUG
                }
                // otherwise, failure return false
                if (!validator.errorMessage) {
                    validator.defaultErrorMessage = isc.Validator.notInSet;
                }
                return false;
            }
        },

        // Tests whether the value for this field does not match any value from an arbitrary
        // list of unacceptable values.  The set of unacceptable values is specified via
        // the list property on the validator, which should be set to an array of
        // values. If there is no valueMap, not providing validator.list is an error.
        notInSet: {
            type: "notInSet",
            title:"Value in set",
            description: "Not in list of values",
            valueType:"valueSet",
            dataType:"none",
            valueAttribute:"list",
            editorTitle:"Values",
            condition : function (item, validator, value, record) {
                // skip empty fields
                if (value == null || isc.is.emptyString(value)) return true;

                // get the list of items to match against declared on this validator
                
                var valueMap = validator.list,
                    valueList = valueMap;
                if (!isc.isAn.Array(valueMap) && isc.isAn.Object(valueMap)) {
                    valueList = isc.getKeys(valueMap);
                }
            
                if (valueList != null) {
                    // if any item == the value, return true
                    for (var i = 0, length = valueList.length; i < length; i++) {
                        if (valueList[i] == value) return true;
                    }
                //>DEBUG
                } else {
                    isc.Log.logWarn("inSet validator specified with no specified list of options " +
                                "- validator will always fail. " +
                                "Field definition:" + isc.Log.echo(item), "validation");
                //<DEBUG
                }
                // otherwise, failure return false
                if (!validator.errorMessage) {
                    validator.defaultErrorMessage = isc.Validator.notInSet;
                }
                return false;
            }
        },

        // A non-empty value is required for this field to pass validation.
        required: {
            type: "required",
            title: "Required",
            description: "Required field",
            valueType:"none",
            dataType:"none",
            condition : function (item, validator, value, record) {
                var uploadItem = isc.Validator._getUploadItem(item),
                    fileInputElem,
                    files;
                if (uploadItem != null &&
                    (fileInputElem = uploadItem.getFocusElement()) != null &&
                    (files = fileInputElem.files) != null)
                {
                    // Default to displaying the 'requiredFile' error message.
                    if (!validator.errorMessage) {
                        validator.errorMessage = isc.Validator.requiredFile;
                    }

                    var numFiles = files.length;
                    for (var i = 0; i < numFiles; ++i) {
                        var file = files[i],
                            fileSize = file.size || file.fileSize;
                        if (fileSize > 0) return true;
                    }
                    return false;

                } else {

                    // Default to displaying the 'requiredField' error message.
                    if (!validator.errorMessage) {
                        validator.errorMessage = isc.Validator.requiredField;
                    }
           
                    var valid = (value != null && !isc.is.emptyString(value));
                    // for multiple: true items, an empty array is considered a validation failure
                    if (valid && item && item.multiple) {
                        if (isc.isAn.Array(value) && value.isEmpty()) valid = false;
                    }
                    return valid;
                }
            },
            action : function (result, item, validator, record, component) {
                // For a conditional required validator we need to set the
                // item._required flag so field will be drawn with the correct style.
                if (item && !item.required) {
                    item._required = (result != null);
                }
            }
        },

        // Tests whether the value for this field matches an acceptable value.  The
        // acceptable values is specified via the value property.
        equals: {
            type: "equals",
            title: "Equals value",
            description: "Equals value",
            valueType:"fieldType",
            condition : function (item, validator, value, record) {
                if (validator.value == null) {
                    isc.logWarn("equals validator is missing 'value' definition. " +
                                "Validator forced false.");
                    return false;
                }
                
                // do the values match?
                return (value == validator.value);
            }
        },
        
        // Tests whether the value for this field does not match an acceptable value.  The
        // acceptable values is specified via the value property.
        notEqual: {
            type: "notEqual",
            shortName: "Doesn't equal",
            title: "Not equal value",
            description: "Not equal value",
            valueType:"fieldType",
            condition : function (item, validator, value, record) {
                if (validator.value == null) {
                    isc.logWarn("not equals validator is missing 'value' definition. " +
                                "Validator forced false.");
                    return false;
                }
                
                // do the values not match?
                return (value != validator.value);
            }
        },
        
        // Tests whether the value for this field matches the value of some other field.
        // The field to compare against is specified via the otherField property
        // on the validator object (should be set to a field name).
        
        matchesField: {
            type: "matchesField",
            title: "Match another field",
            description: "Matches another field value",
            valueType:"fieldName",
            dataType:"none",
            valueAttribute:"otherField",
            editorTitle:"Field Name",
            condition : function (item, validator, value, record) {
                if (validator.otherField == null) {
                    isc.logWarn("matchesField validator is missing 'otherField' definition. " +
                                "Validator forced false.");
                    return false;
                }
                
                var otherFieldName;
                if (isc.isA.String(validator.otherField)) {
                    otherFieldName = validator.otherField;
                } else {
                    otherFieldName = validator.otherField.dataPath || validator.otherField.name;
                }
                

                // Extract value from record for otherField allowing DS.field format
                var otherValue = (isc.DataSource != null ?
                        isc.DataSource.getPathValue(record, otherFieldName, validator.otherField) :
                        record[otherFieldName]);

                // do the values match?
                return (value == otherValue);
            },
            
            // By default matchesField rules depend on the "otherField" so 
            // changes to that field should trigger the rule to re-run along
            // with any changes to the main field.
            getDependentFields : function (rule, triggerEvent) {
                if (!rule.otherField || rule.otherField == "") return rule.fieldName;
                return [ rule.fieldName, rule.otherField ];
            }
        },
        
        // Returns true if the value for this field is unique for the criteria specified in 
        // "criteriaFields", or across the whole DataSource if no criteriaFields is specified
        isUnique: {
            type: "isUnique",
            title: "Value is unique",
            description: "Validate field value is unique on DataSource",
            // Editor implemented in ValidatorEditor.js - simple dynamicForm based canvasItem
            // with fields for each attribute.
            valueType:"custom",
            dataType:"none",
            editorType:"IsUniqueEditor",
            editorTitle:"Options",
            hintText: " ",
            getAttributesFromEditor:function (fieldName, item) {
                var form = item.canvas;
                var attrs = {};
                if (form.getValue("useMultipleFields") === true) {
                    attrs.criteriaFields = (form.getValue("selectFields") || []).join(",");
                }
                if (form.getValue("isCaseSensitive") === true) {
                    attrs.caseSensitive = true;
                }
                return attrs;
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                var form = item.canvas;
                if (attributes == null) {
                    form.clearValues();
                    return;
                }
                form.setValue("isCaseSensitive", attributes.caseSensitive);
                form.setValue("useMultipleFields", attributes.criteriaFields && 
                                                        attributes.criteriaFields.length > 0);
                form.setValue("selectFields", (isc.isA.String(attributes.criteriaFields) ? 
                                                        attributes.criteriaFields : "").split(","));
                form.getItem("selectFields").setDisabled(form.getValue("useMultipleFields") !== true);
            },
            condition: function(item, validator, value, record, additionalContext) {
                // Effectively skipJsonValidation that occurs during cacheData transformation
                // at DataSource init
                if (!record) {
                    if (isc.Log.logIsDebugEnabled('validation')) {
                        isc.Log.logDebug(
                            'Record is null, ignoring client-side isUnique validation for item ' + item.name,
                            'validation');
                    }
                    return true;
                }

                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.mustBeUnique;

                // "NOTE: FormItem will not be available during a save performed without a form (eg programmatic save)
                // or if the field is not available in the form," but we need it to know which ds field we're trying
                // (not) to match
                if (!item) {
                    isc.Log.logWarn(
                        'Item is null, ignoring client-side isUnique validation for item ' + item.name,
                        'validation');
                    additionalContext.needsServerValidation = true;
                    return true;
                }
                if (!additionalContext && (!additionalContext.dataSource || !additionalContext.component)) {
                    isc.logWarn(
                        'Component is null, ignoring client-side isUnique validation for item ' + item.name
                    );
                    additionalContext.needsServerValidation = true;
                    return true;
                }
                var ds = additionalContext.dataSource || additionalContext.component.dataSource;
                if (! isc.isA.DataSource(ds)) {
                    ds = isc.DataSource.get(ds);
                }
                if (! ds) {
                    isc.logWarn(
                        'Unable to derive dataSource from item. ' +
                        'Ignoring client-side isUnique validation for item ' + item.name
                    );
                    additionalContext.needsServerValidation = true;
                    return true;
                }
                // "For a DataSource to support being passed AdvancedCriteria, it must be
                // clientOnly:true or cacheAllData:true, or have server side logic which can
                // process AdvancedCriteria objects passed from the client."
                // In either case, we should have all the data we need to check on the client
                // using an advancedCriteria
                if (! ds.clientOnly && !(ds.cacheAllData && ds.hasAllData())) {
                    isc.logInfo('DataSource ' + ds.ID + ' does not appear to have all rows ' +
                        'loaded.  Skipping client-side isUnique validation on item' + item.name
                    );
                    additionalContext.needsServerValidation = true;
                    return true;
                }

                var keys = ds.getPrimaryKeyFieldNames();
                var operatorId = 'iEquals';
                if (validator.caseSensitive || !ds.getFieldOperators(item.name).contains('iEquals')) {
                    operatorId = 'equals'
                }
                var advancedCriteria = {
                    _constructor: "AdvancedCriteria",
                    operator: "and",
                    criteria:[
                        { fieldName: item.name, operator: operatorId, value: value }
                    ]
                }
                var criteriaFields = [];
                if (validator.criteriaFields) {
                    if (isc.isA.String(validator.criteriaFields)) {
                        criteriaFields = validator.criteriaFields.split(',');
                    }
                }
                
                if (!criteriaFields.intersect(keys).isEmpty()) {
                    criteriaFields.removeList(keys);
                    isc.logWarn(
                        'Primary key unnecessarily provided in criteria to isUnique ' +
                        'validator.  Discarded.'
                    );
                }
                for (var i = 0; i < criteriaFields.length; i++) {
                    var criteriaField = criteriaFields[i];
                    var criteriaOperatorId = 'iEquals';
                    if (validator.caseSensitive || !ds.getFieldOperators(criteriaField).contains('iEquals')) {
                        criteriaOperatorId = 'equals'
                    }
                    advancedCriteria.criteria.add({
                        fieldName: criteriaField, operator: criteriaOperatorId, value: record[criteriaField]
                    });
                }

                for (var i = 0; i < keys.length; i++) {
                    var pk = keys[i];
                    var pkOperatorId = 'iNotEqual';
                    if (validator.caseSensitive || !ds.getFieldOperators(pk).contains('iNotEqual')) {
                        pkOperatorId = 'notEqual'
                    }
                    advancedCriteria.criteria.add({
                        fieldName: pk, operator: pkOperatorId, value: record[pk]
                    });
                }
                var response = ds.getClientOnlyResponse({
                    operationType: "fetch",
                    data: advancedCriteria
                }, null, true);

                return response.data.length == 0;
            }
        },

        // Returns true if the record implied by a relation exists.  The relation can be 
        // derived automatically from the DataSourceField.foreignKey attribute of 
        // the field being validated, or you can specify it manually via 
        // validator.relatedDataSource and validator.relatedField.
        //
        // You can specify at DataSource level that this validator should be automatically 
        // applied to all fields that specify a DataSourceField.foreignKey -
        // see DataSource.validateRelatedRecords.
        hasRelatedRecord: {
            type: "hasRelatedRecord",
            valueType:"none",
            dataType:"none",
            title: "Value exists on related DataSource",
            description: "Validate field value exists on the related DataSource",
            requiresServer: true
        },

        // Evaluates the Velocity expression provided in 
        // Validator.serverCondition on the server side.
        serverCustom: {
            type: "serverCustom",
            valueType:"none",
            dataType:"none",
            description: "Validate field value using a custom server expression",
            requiresServer: true
        },

        maxFileSize: {
            type: "maxFileSize",
            description: "Size of file to be uploaded does not exceed maxFileSize",
            valueType: "custom",
            dataType: "binary",

            condition : function (item, validator, value, record) {
                if (!validator.errorMessage) validator.defaultErrorMessage = isc.Validator.maxFileSizeExceeded;

                validator.dynamicErrorMessageArguments = null;

                var maxFileSize = validator.maxFileSize;
                if (maxFileSize == null) {
                    isc.logWarn("maxFileSize validator specified with no maxFileSize. Validator will return false causing validation to fail." +
                                "Field definition:" + isc.Log.echo(item), "validation");
                    return false;
                }

                var uploadItem = isc.Validator._getUploadItem(item);
                if (uploadItem == null) {
                    isc.logWarn("maxFileSize validator supported on editable UploadItem and FileItem only. " +
                        "This field appears to be the wrong editor type, or not be editable. Validator will return false causing validation to fail.\n" +
                                "Field definition:" + isc.Log.echo(item), "validation");
                    return false;
                }

                var fileInputElem = uploadItem.getFocusElement();
                if (fileInputElem == null) return true;

                var files = fileInputElem.files,
                    numFiles;
                if (files == null || (numFiles = files.length) == 0) return true;

                for (var i = 0; i < numFiles; ++i) {
                    var file = files[i];

                    
                    var fileSize = file.size || file.fileSize;
                    if (fileSize == null) continue;

                    
                    if (fileSize >= maxFileSize) {
                        
                        var fileName = file.webkitRelativePath || file.name || file.fileName;

                        validator.dynamicErrorMessageArguments = {
                            uploadedFileName: String(fileName).asHTML(),
                            uploadedFileSize: fileSize,
                            maxFileSize: maxFileSize
                        };

                        return false;
                    }
                }

                return true;
            }
        },

        // ---------------------------------------------
        // Rules: Implemented as special validator types
        // ---------------------------------------------
        
        
        //> @object MessageRule
        // A +link{Rule} that causes a message to be shown to a user, but does not prevent saving 
        // or cause the data to be considered invalid.
        // @visibility rules
        //<
        
        //> @attr messageRule.message (String : null : IRW)
        // Message to display for this rule
        // @visibility rules
        //<
        
        
        //> @type MessageSeverity
        // @value "warning" message is a warning and should be displayed in a high-visibility style
        //  that indicates it is a warning
        // @value "information" message is informational and should be displayed in a neutral manner
        // @visibility rules
        //<
        

        //> @attr messageRule.severity (MessageSeverity : "info" : IR)
        // Severity of the message - see +link{type:MessageSeverity}.
        // @visibility rules
        //<

        //> @type MessageDisplayMode
        // @value "form" message is displayed by the form according to the form's standard rules for
        //  displaying validation errors
        // @value "transient" message is displayed as a pop-up which automatically fades after a short
        //  period, without user action
        // @value "dialog" message is displayed in a modal pop-up dialog that the user must dismiss
        //
        // @visibility rules
        //<

        //> @attr messageRule.displayMode (MessageDisplayMode : "dialog" : IR)
        // How should this message be displayed. See +link{messageDisplayMode}
        // @visibility rules
        //<
        

        //> @attr messageRule.duration (number : null : IR)
        // If +link{messageRule.displayMode} is set to <code>"transient"</code>, this property
        // specifies how long the message should appear for (in milliseconds).
        // @visibility rules
        //<
        
        message : {
            type:"message",
            title:"Display message",
            description:"Displays an informational or warning message",
            
            valueType:"none",
            dataType:"none",
            
            isRule:true,
            supportedTargets:["FormItem"],

            action : function (result, item, validator, record, component) {
                var displayMode = validator.displayMode,
                    // default to "message" rather than "errorMessage" for Message type rules.
                    messageAttr = (validator.message == null ? "errorMessage" : "message"),
                    message = isc.Validator.getErrorMessage(validator, messageAttr);
                
                if (displayMode == "form") {
                    
                    if (!component.addFieldErrors) {
                        return;
                    }
                    if (result == true) {
                        component.addFieldErrors(item.name, message, true);
                    
                    } else {
                        component.setFieldErrors(item.name, null, true);
                    }
                } else if (displayMode == "transient") {
                    
                    if (result == true) {
                        var action = function () {
                            if (component && component.hasFocus) component.blur();
                            isc.showFadingPrompt(message, validator.duration);
                        };
                        isc.Page.setEvent("idle", action, isc.Page.FIRE_ONCE);
                    }
                } else {
                    // displayMode is "dialog"
                    var severity = validator.severity;
                    if (result == true) {
                        var action = function () {
                            
                            if (component && component.hasFocus) component.blur();
                            if (severity == "warning") {
                                isc.warn(message);
                            } else {
                                isc.say(message);
                            }
                        };
                        // fire on timeout so we don't interfere with focus etc on 
                        // editorExit / editorEnter
                        isc.Page.setEvent("idle", action, isc.Page.FIRE_ONCE);
                        
                    }
                }
            }
        },
        
        //> @object PopulateRule
        // Populates a target field with a value calculated based on values in other fields.
        // <P>
        // Use +link{populateRule.formulaVars} to define variables available to the formula in terms of
        // DataSources and fieldNames in the input data, and use +link{populateRule.formula} to 
        // define the formula itself.
        // <P>
        // <b>NOTE:</b> If the target field is on a form that has a +link{dataBoundComponent.rulesEngine, rulesEngine}
        // and this rule changes the target field value, rules that are dependent on the value are
        // also triggered even though the field's <code>changed</code> event does not fire.
        // @visibility rules
        //<
        
        //> @attr populateRule.formula (String : null : IR)
        // Formula to be evaluated.  All variables used by the formula must be single-letter capital
        // characters (eg A) - see +link{formulaVars} - unless +link{targetRuleScope} is provided.
        // @visibility rules
        //<
        
        //> @attr populateRule.targetRuleScope (String | Canvas : null : IR)
        // +link{canvas.ruleScope} providing the available formula fields.
        // <P>
        // There is no need to declare +link{rule.dependentFields} for a PopulateRule if the desired
        // <code>dependentFields</code> are just the formula vars - these are automatically used for
        // dependentFields.
        // @visibility rules
        //<

        //> @attr populateRule.formulaVars (Object : null : IR)
        // Object mapping from variable names to fieldNames. See +link{userFormula.formulaVars} for
        // map details.
        // <P>
        // There is no need to declare +link{rule.dependentFields} for a PopulateRule if the desired
        // <code>dependentFields</code> are just the formula vars - these are automatically used for
        // dependentFields.
        // @visibility rules
        //<
        
        populate : {
            type:"populate",
            title:"Populate value",
            description:"Populates a target field with a value calculated based on values in other fields",
            
            valueType:"custom",
            dataType:"none",
            editorType:"PopulateRuleEditor",
            getAttributesFromEditor:function (fieldName, item) {
                // item stores value as an object formula/formulaVars
                return item.getValue();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                // Attributes we're interested in are formulaVars and formula
                if (attributes != null && attributes.formula != null) {
                    item.setValue({formula:attributes.formula, formulaVars:attributes.formulaVars});
                } else {
                    item.clearValue();
                }
            },

            isRule:true,
            supportedTargets:["FormItem", "Canvas"],
            action : function (result, item, validator, record, component, componentType) {
                // do nothing unless we actually ran (so if appliesWhen doesn't pass we don't
                // run the 'populate' logic)
                if (result != true) return;
                
                // lazily create and cache the formula function (the vars will not change post
                // create)
                if (validator._formulaFunction == null) {
                    // Use FormulaBuilder.generateFunction() to convert the formula string to
                    // a function.
                    // This method takes
                    // - formula - an object with "text" (the formula string) and "formulaVars"
                    // - an array of field objects, which should contain "name" and "mappingKey"
                    //   We create this dynamically from the formulaVars here
                    // - an (optional) component, which we omit.
                    
                    var formulaObject = {};
                    formulaObject.text = validator.formula;
                    if (validator.allowEscapedKeys) formulaObject.allowEscapedKeys = validator.allowEscapedKeys;

                    var fieldDescriptors = [];
                    if (validator.targetRuleScope) {
                        validator._formulaFunction =
                            isc.FormulaBuilder.generateRuleScopeFunction(formulaObject, validator.targetRuleScope, component);
                    } else {
                        var formulaVars = formulaObject.formulaVars = validator.formulaVars;
                        for (var key in formulaVars) {
                            var fieldDescriptor = {};
                            fieldDescriptor.mappingKey = key;
                            fieldDescriptor.name = formulaVars[key];
                            fieldDescriptors.add(fieldDescriptor);
                        }
                        validator._formulaFunction =
                            isc.FormulaBuilder.generateFunction(formulaObject, fieldDescriptors);
                    }
                }

                var name = (componentType == "Canvas" ? item : item.name);

                var formulaResult = validator._formulaFunction(record, component),
                    targetType = validator.targetType,
                    undef
                ;
                // Treat non-numeric results as undefined
                if (isNaN(formulaResult)) {
                    formulaResult = undef;
                }

                // If a targetType is specified, coerce value into that type if necessary
                if (formulaResult != null &&
                    ("text" == targetType || "string" == targetType) &&
                    !isc.isA.String(formulaResult))
                {
                    formulaResult = "" + formulaResult;
                }

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;

                if (componentType == "FormItem") {
                    if (item && item.setValue) {
                        
                        var oldValue = item.getValue(),
                            lastComputedValue = item._lastFormulaValue,
                            isInitialValue = (lastComputedValue == null),
                            isFieldCleared = (validator.autoPopulateClearedFlag != false && lastComputedValue != null && oldValue == null && !item.hasFocus),
                            saveValue = !validator.overwriteInvalidValue || isInitialValue || isFieldCleared
                        ;
    
                        
                        if (item._forceApplyFormula) {
                            saveValue = true;
                            delete item._forceApplyFormula;
                        }
    
                        // When validator.overwriteInvalidValue=true
                        //   - for an editable field, the current value will be replaced if the end user has not changed
                        //     the value since the last time it was computed by the formula, or if the value of the field
                        //     is invalid according to declared validators.
                        //   - values calculated by the formula will always replace the current value of a non-editable field.
                        //     This will take place as a side-effect of the handling of an editable field because the last
                        //     computed value will never change by a user edit.
    
                        // It's key that a formula overwrites invalid user-edited values - an example is a formula
                        // that auto-populates an end date field with start date + one day.  If the user then edits
                        // the end date field, we still want to overwrite the end date with the formula result if the
                        // user enters a new start date that is after the end date.
    
                        if (!saveValue && item.form && lastComputedValue != null) {
                            saveValue = true;
                            if (oldValue != lastComputedValue) {
                                var validationOptions = {
                                        skipServerValidation: true
                                    }, 
                                    fieldResult = item.form.validateField(item, item.validators, oldValue, item.form.getValues(), validationOptions)
                                ;
                                saveValue = (fieldResult && !fieldResult.valid);
                            }
                        }
    
                        if (saveValue && oldValue != formulaResult) {
                            item.setValue(formulaResult);
                            item._lastFormulaValue = formulaResult;
    
                            // Give any dependent rules via a rulesEngine a chance to fire.
                            if (item.form && item.form.rulesEngine) {
                                // Must use another thread if triggered from rules engine
                                isc.Class.delayCall("processChanged", [item.form, item], 0, item.form.rulesEngine);
                            }
                            if (logSummary) {
                                isc.Log.logInfo("Set (populate) '" + item.form.ID + "." + item.name +
                                                "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                                formulaResult, logCategory);
                            }
                        } else if (saveValue && logDetail) {
                            var valueType = "[" + (oldValue == null ? "initial" :
                                                    (oldValue != formulaResult ? "changed" :
                                                        "existing")) +
                                            " value]"
                            isc.Log.logDebug("Set (populate) '" + item.form.ID + "." + item.name +
                                             "' to " + valueType + ": " +
                                             formulaResult, logCategory);
                        }
                    } else if (item && component && component.setValue) {
                        var fieldName = item.fieldName;
                        if (fieldName == null) fieldName = item.dataPath;
                        var oldValue = component.getValue(fieldName);
                        if (oldValue != formulaResult) {
                            component.setValue(fieldName, formulaResult);
                            if (logSummary) {
                                isc.Log.logInfo("Set (populate) '" + component.ID + "." + fieldName +
                                                "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                                formulaResult, logCategory);
                            }
                        } else if (logDetail) {
                            var valueType = "[" + (oldValue == null ? "initial" :
                                                    (oldValue != formulaResult ? "changed" :
                                                        "existing")) +
                                            " value]"
                            isc.Log.logDebug("Set (populate) '" + component.ID + "." + fieldName +
                                             "' to " + valueType + ": " +
                                             formulaResult, logCategory);
                        }
                    }
                } else {
                    var oldValue = (component.getProperty ? component.getProperty(name) : component[name]);
                    if (component.setProperty) component.setProperty(name, formulaResult);
                    else component[name] = formulaResult;
                    if (logSummary && oldValue != formulaResult) {
                        isc.Log.logInfo("Set (populate) '" + component.ID + "." + name +
                                        "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                        formulaResult, logCategory);
                    } else if (logDetail) {
                        var valueType = "[" + (oldValue == null ? "initial" :
                                                (oldValue != formulaResult ? "changed" :
                                                    "existing")) +
                                        " value]"
                        isc.Log.logDebug("Set (populate) '" + component.ID + "." + name +
                                        "' to " + valueType + ": " +
                                        formulaResult, logCategory);
                    }
                }
            },
            
            // By default populate rules depend on their formula source fields so 
            // changes to those fields should trigger the rule to re-run.
            getDependentFields : function (rule, triggerEvent) {
                // if passed a non object as formulaVars, ignore it
                
                if (rule.formulaVars == null || !isc.isAn.Object(rule.formulaVars)) return null;
                var sourceField = [];
                for (var key in rule.formulaVars) {
                    sourceField.add(rule.formulaVars[key]);
                }
                return sourceField;
            }
        },
        
        populateText: {
            type:"populateText",
            title:"Populate text value",
            description:"Populates a target field with a text value formatted from values in other fields",
            
            valueType:"custom",
            dataType:"none",
            editorType:"PopulateTextRuleEditor",
            getAttributesFromEditor:function (fieldName, item) {
                // item stores value as an object formula/formulaVars
                return item.getValue();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                // Attributes we're interested in are formulaVars and formula
                if (attributes != null && attributes.formula != null) {
                    item.setValue({formula:attributes.formula, formulaVars:attributes.formulaVars});
                } else {
                    item.clearValue();
                }
            },

            isRule:true,
            supportedTargets:["FormItem", "Canvas"],
            action : function (result, item, validator, record, component, componentType) {
                // do nothing unless we actually ran (so if appliesWhen doesn't pass we don't
                // run the 'populate' logic)
                if (result != true) return;

                // lazily create and cache the summary function (the vars will not change post
                // create)
                if (validator._summaryFunction == null) {
                    // Use SummaryBuilder.generateFunction() to convert the formula string to
                    // a function.
                    // This method takes
                    // - summary - an object with "text" (the summary string) and "summaryVars"
                    // - an array of field objects, which should contain "name" and "mappingKey"
                    //   We create this dynamically from the formulaVars here
                    // - an (optional) component, which we omit.
                    if (validator.formulaVars && validator.formulaVars.length == 0) validator.formulaVars = null;

                    var formulaObject = {};
                    var formulaVars = formulaObject.summaryVars = validator.formulaVars;
                    formulaObject.text = validator.formula;

                    if (validator.targetRuleScope) {
                        validator._summaryFunction =
                            isc.SummaryBuilder.generateRuleScopeFunction(formulaObject, validator.targetRuleScope, component);
                    } else {
                        var fieldDescriptors = [];
                        for (var key in formulaVars) {
                            var fieldDescriptor = {};
                            fieldDescriptor.mappingKey = key;
                            fieldDescriptor.name = formulaVars[key];
                            fieldDescriptors.add(fieldDescriptor);
                        }

                        validator._summaryFunction =
                            isc.SummaryBuilder.generateFunction(formulaObject, fieldDescriptors, null, true);
                    }
                }
                var name = (componentType == "Canvas" ? item : item.name);

                var formulaResult = validator._summaryFunction(record, name, (componentType == "Canvas" ? null : component));

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;

                if (componentType == "FormItem") {
                    if (item.setValue) {
                        
                        var oldValue = item.getValue(),
                            lastComputedValue = item._lastFormulaValue,
                            isInitialValue = (lastComputedValue == null),
                            isFieldCleared = (validator.autoPopulateClearedFlag != false && lastComputedValue != null && oldValue == null && !item.hasFocus),
                            saveValue = !validator.overwriteInvalidValue || isInitialValue || isFieldCleared
                        ;
    
                        
                        if (item._forceApplyFormula) {
                            saveValue = true;
                            delete item._forceApplyFormula;
                        }
    
                        // When validator.overwriteInvalidValue=true
                        //   - for an editable field, the current value will be replaced if the end user has not changed
                        //     the value since the last time it was computed by the formula, or if the value of the field
                        //     is invalid according to declared validators.
                        //   - values calculated by the formula will always replace the current value of a non-editable field.
                        //     This will take place as a side-effect of the handling of an editable field because the last
                        //     computed value will never change by a user edit.
    
                        // It's key that a formula overwriting invalid user-edited values - an example is a formula
                        // that auto-populates an end date field with start date + one day.  If the user then edits
                        // the end date field, we still want to overwrite the end date with the formula result if the
                        // user enters a new start date that is after the end date.
    
                        if (!saveValue && item.form && lastComputedValue != null) {
                            saveValue = true;
                            if (oldValue != lastComputedValue) {
                                var validationOptions = {
                                        skipServerValidation: true
                                    }, 
                                    fieldResult = item.form.validateField(item, item.validators, oldValue, item.form.getValues(), validationOptions)
                                ;
                                saveValue = (fieldResult && !fieldResult.valid);
                            }
                        }
                        if (saveValue && oldValue != formulaResult) {
                            item.setValue(formulaResult);
                            item._lastFormulaValue = formulaResult;
    
                            // Give any dependent rules via a rulesEngine a chance to fire.
                            if (item.form && item.form.rulesEngine) {
                                // Must use another thread if triggered from rules engine
                                isc.Class.delayCall("processChanged", [item.form, item], 0, item.form.rulesEngine);
                            }
                            if (logSummary) {
                                isc.Log.logInfo("Set (populateText) '" + item.form.ID + "." + item.name +
                                                "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                                formulaResult, logCategory);
                            }
                        } else if (saveValue && logDetail) {
                            var valueType = "[" + (oldValue == null ? "initial" :
                                                    (oldValue != formulaResult ? "changed" :
                                                        "existing")) +
                                            " value]"
                            isc.Log.logDebug("Set (populateText) '" + item.form.ID + "." + item.name +
                                             "' to " + valueType + ": " +
                                             formulaResult, logCategory);
                        }
                    } else if (component && component.setValue) {
                        var fieldName = item.fieldName;
                        if (fieldName == null) fieldName = item.dataPath;
                        var oldValue = component.getValue(fieldName);
                        if (oldValue != formulaResult) {
                            component.setValue(fieldName, formulaResult);
                            if (logSummary) {
                                isc.Log.logInfo("Set (populateText) '" + component.ID + "." + fieldName +
                                                "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                                formulaResult, logCategory);
                            }
                        } else if (logDetail) {
                            var valueType = "[" + (oldValue == null ? "initial" :
                                                    (oldValue != formulaResult ? "changed" :
                                                        "existing")) +
                                            " value]"
                            isc.Log.logDebug("Set (populateText) '" + component.ID + "." + fieldName +
                                             "' to " + valueType + ": " +
                                             formulaResult, logCategory);
                        }
                    }
                } else {
                    var oldValue = (component.getProperty ? component.getProperty(name) : component[name]);
                    if (component.setProperty) component.setProperty(name, formulaResult);
                    else component[name] = formulaResult;
                    if (logSummary && oldValue != formulaResult) {
                        isc.Log.logInfo("Set (populateText) '" + component.ID + "." + name +
                                        "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                        formulaResult, logCategory);
                    } else if (logDetail) {
                        var valueType = "[" + (oldValue == null ? "initial" :
                                                (oldValue != formulaResult ? "changed" :
                                                    "existing")) +
                                        " value]"
                        isc.Log.logDebug("Set (populateText) '" + component.ID + "." + name +
                                        "' to " + valueType + ": " +
                                        formulaResult, logCategory);
                    }
                }
            },

            // By default populate rules depend on their formula source fields so
            // changes to those fields should trigger the rule to re-run.
            getDependentFields : function (rule, triggerEvent) {
                // if passed a non object as formulaVars, ignore it
                if (rule.formulaVars == null || !isc.isAn.Object(rule.formulaVars) || isc.isAn.emptyArray(rule.formulaVars)) return null;
                var sourceField = [];
                for (var key in rule.formulaVars) {
                    sourceField.add(rule.formulaVars[key]);
                }
                return sourceField;
            }
        },

        
        populateExpression : {
            type:"populateExpression",
            title:"Populate expression",
            description:"Populates a target field with a value calculated based on values in other fields",
            
            valueType:"custom",
            dataType:"none",
            editorType:"PopulateRuleEditor",
            getAttributesFromEditor:function (fieldName, item) {
                // item stores value as an object formula/formulaVars
                return item.getValue();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                // Attributes we're interested in are formulaVars and formula
                if (attributes != null && attributes.formula != null) {
                    item.setValue({formula:attributes.formula, formulaVars:attributes.formulaVars});
                } else {
                    item.clearValue();
                }
            },

            isRule:true,
            supportedTargets:["FormItem"],
            action : function (result, item, validator, record, component) {
                // do nothing unless we actually ran (so if appliesWhen doesn't pass we don't
                // run the 'populate' logic)
                if (result != true) return;
                
                // lazily create and cache the formula function (the vars will not change post
                // create)
                if (validator._formulaFunction == null) {
                    // Use FormulaBuilder.generateFunction() to convert the formula string to
                    // a function.
                    // This method takes
                    // - formula - an object with "text" (the formula string) and "formulaVars"
                    // - an array of field objects, which should contain "name" and "mappingKey"
                    //   We create this dynamically from the formulaVars here
                    // - an (optional) component, which we omit.
                    
                    var formulaObject = {allowEscapedKeys:true};
                    formulaObject.text = validator.formula;

                    var fieldDescriptors = [];
                    if (validator.targetRuleScope) {
                        validator._formulaFunction =
                            isc.FormulaBuilder.generateRuleScopeFunction(formulaObject, validator.targetRuleScope, component);
                    } else {
                        var formulaVars = formulaObject.formulaVars = validator.formulaVars;
                        for (var key in formulaVars) {
                            var fieldDescriptor = {};
                            fieldDescriptor.mappingKey = key;
                            fieldDescriptor.name = formulaVars[key];
                            fieldDescriptors.add(fieldDescriptor);
                        }
                        validator._formulaFunction =
                            isc.FormulaBuilder.generateFunction(formulaObject, fieldDescriptors);
                    }
                }
                var valuesMatch = function (type, value1, value2) {
                    return type == "date" ? 
                        (isc.DateUtil.compareDates(value1, value2) == 0) : (value1 == value2);
                };
                
                var formulaResult = validator._formulaFunction(record, component);

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;

                if (item.setValue) {
                    
                    var itemType = item.type || item.defaultType,
                        oldValue = item.getValue(),
                        lastComputedValue = item._lastFormulaValue,
                        isInitialValue = (lastComputedValue == null),
                        isFieldCleared = (validator.autoPopulateClearedFlag != false && lastComputedValue != null && oldValue == null && !item.hasFocus),
                        saveValue = !validator.overwriteInvalidValue || isInitialValue || isFieldCleared
                    ;

                    
                    if (item._forceApplyFormula) {
                        saveValue = true;
                        delete item._forceApplyFormula;
                    }

                    // When validator.overwriteInvalidValue=true
                    //   - for an editable field, the current value will be replaced if the end user has not changed
                    //     the value since the last time it was computed by the formula, or if the value of the field
                    //     is invalid according to declared validators.
                    //   - values calculated by the formula will always replace the current value of a non-editable field.
                    //     This will take place as a side-effect of the handling of an editable field because the last
                    //     computed value will never change by a user edit.

                    // It's key that a formula overwriting invalid user-edited values - an example is a formula
                    // that auto-populates an end date field with start date + one day.  If the user then edits
                    // the end date field, we still want to overwrite the end date with the formula result if the
                    // user enters a new start date that is after the end date.

                    if (!saveValue && item.form && lastComputedValue != null) {
                        saveValue = true;
                        if (!valuesMatch(itemType, oldValue, lastComputedValue)) {
                            var validationOptions = {
                                    skipServerValidation: true
                                }, 
                                fieldResult = item.form.validateField(item, item.validators, oldValue, item.form.getValues(), validationOptions)
                            ;
                            saveValue = (fieldResult && !fieldResult.valid);
                        }
                    }
                    if (saveValue && !valuesMatch(itemType, oldValue, formulaResult)) {
                        item.setValue(formulaResult);
                        item._lastFormulaValue = formulaResult;

                        // Give any dependent rules via a rulesEngine a chance to fire.
                        if (item.form && item.form.rulesEngine) {
                            // Must use another thread if triggered from rules engine
                            isc.Class.delayCall("processChanged", [item.form, item], 0, item.form.rulesEngine);
                        }
                        if (logSummary) {
                            isc.Log.logInfo("Set (populateExpression) '" + item.form.ID + "." + item.name +
                                            "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                            formulaResult, logCategory);
                        }
                    } else if (saveValue && logDetail) {
                        var valueType = "[" + (oldValue == null ? "initial" :
                                                (oldValue != formulaResult ? "changed" :
                                                    "existing")) +
                                        " value]"
                        isc.Log.logDebug("Set (populateExpression) '" + item.form.ID + "." + item.name +
                                         "' to " + valueType + ": " +
                                         formulaResult, logCategory);
                    }
                } else if (component && component.setValue) {
                    var fieldName = item.fieldName;
                    if (fieldName == null) fieldName = item.dataPath;
                    var oldValue = component.getValue(fieldName);
                    if (oldValue != formulaResult) {
                        component.setValue(fieldName, formulaResult);
                        if (logSummary) {
                            isc.Log.logInfo("Set (populateExpression) '" + component.ID + "." + fieldName +
                                            "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                            formulaResult, logCategory);
                        }
                    } else if (logDetail) {
                        var valueType = "[" + (oldValue == null ? "initial" :
                                                (oldValue != formulaResult ? "changed" :
                                                    "existing")) +
                                        " value]"
                        isc.Log.logDebug("Set (populateExpression) '" + component.ID + "." + fieldName +
                                         "' to " + valueType + ": " +
                                         formulaResult, logCategory);
                    }
                }
            },

            // By default populate rules depend on their formula source fields so 
            // changes to those fields should trigger the rule to re-run.
            getDependentFields : function (rule, triggerEvent) {
                // if passed a non object as formulaVars, ignore it
                
                if (rule.formulaVars == null || !isc.isAn.Object(rule.formulaVars)) return null;
                var sourceField = [];
                for (var key in rule.formulaVars) {
                    sourceField.add(rule.formulaVars[key]);
                }
                return sourceField;
            }
        },

        populateFromDataPath: {
            type:"populateFromDataPath",
            title:"Populate value from ruleScope DataPath",
            description:"Populates a target with a DataPath value",
            valueType:"custom",
            dataType:"none",
            getAttributesFromEditor:function (fieldName, item) {
                // item stores value as an object formula/formulaVars
                return item.getValue();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                // Attributes we're interested in are formulaVars and formula
                if (attributes != null && attributes.formula != null) {
                    item.setValue({formula:attributes.formula, formulaVars:attributes.formulaVars});
                } else {
                    item.clearValue();
                }
            },

            isRule:true,
            supportedTargets:["FormItem", "Canvas"],
            action : function (result, item, validator, record, component, componentType) {
                // do nothing unless we actually ran (so if appliesWhen doesn't pass we don't
                // run the 'populate' logic)
                if (result != true) return;

                var name = (componentType == "Canvas" ? item : item.name),
                    path = validator.formula,
                    formulaResult = isc.Canvas._getFieldValue(path, null, record),
                    targetType = validator.targetType,
                    undef
                ;

                // If a targetType is specified, coerce value into that type if necessary
                if (formulaResult != null) {
                    if (("text" == targetType || "string" == targetType) && !isc.isA.String(formulaResult)) {
                        formulaResult = "" + formulaResult;
                    } else if ("integer" == targetType && !isc.isA.Number(formulaResult)) {
                        formulaResult = parseInt("" + formulaResult);
                        if (isNaN(formulaResult)) formulaResult = undef;
                    } else if ("float" == targetType && !isc.isA.Number(formulaResult)) {
                        formulaResult = parseFloat("" + formulaResult);
                        if (isNaN(formulaResult)) formulaResult = undef;
                    }
                }

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;

                if (componentType == "FormItem") {
                    if (item.setValue) {
                        
                        var oldValue = item.getValue(),
                            lastComputedValue = item._lastFormulaValue,
                            isInitialValue = (lastComputedValue == null),
                            isFieldCleared = (validator.autoPopulateClearedFlag != false && lastComputedValue != null && oldValue == null && !item.hasFocus),
                            saveValue = !validator.overwriteInvalidValue || isInitialValue || isFieldCleared
                        ;
    
                        
                        if (item._forceApplyFormula) {
                            saveValue = true;
                            delete item._forceApplyFormula;
                        }
    
                        // When validator.overwriteInvalidValue=true
                        //   - for an editable field, the current value will be replaced if the end user has not changed
                        //     the value since the last time it was computed by the formula, or if the value of the field
                        //     is invalid according to declared validators.
                        //   - values calculated by the formula will always replace the current value of a non-editable field.
                        //     This will take place as a side-effect of the handling of an editable field because the last
                        //     computed value will never change by a user edit.
    
                        // It's key that a formula overwriting invalid user-edited values - an example is a formula
                        // that auto-populates an end date field with start date + one day.  If the user then edits
                        // the end date field, we still want to overwrite the end date with the formula result if the
                        // user enters a new start date that is after the end date.
    
                        if (!saveValue && item.form && lastComputedValue != null) {
                            saveValue = true;
                            if (oldValue != lastComputedValue) {
                                var validationOptions = {
                                        skipServerValidation: true
                                    }, 
                                    fieldResult = item.form.validateField(item, item.validators, oldValue, item.form.getValues(), validationOptions)
                                ;
                                saveValue = (fieldResult && !fieldResult.valid);
                            }
                        }
                        if (saveValue && oldValue != formulaResult) {
                            item.setValue(formulaResult);
                            item._lastFormulaValue = formulaResult;
    
                            // Give any dependent rules via a rulesEngine a chance to fire.
                            if (item.form && item.form.rulesEngine) {
                                // Must use another thread if triggered from rules engine
                                isc.Class.delayCall("processChanged", [item.form, item], 0, item.form.rulesEngine);
                            }
                            if (logSummary && oldValue != formulaResult) {
                                isc.Log.logInfo("Set (populateFromDataPath) '" + item.form.ID + "." + item.name +
                                                "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                                formulaResult, logCategory);
                            }
                        } else if (saveValue && logDetail) {
                            var valueType = "[" + (oldValue == null ? "initial" :
                                                    (oldValue != formulaResult ? "changed" :
                                                        "existing")) +
                                            " value]"
                            isc.Log.logDebug("Set (populateFromDataPath) '" + item.form.ID + "." + item.name +
                                            "' to " + valueType + ": " +
                                            formulaResult, logCategory);
                        }
                    } else if (component && component.setValue) {
                        var fieldName = item.fieldName;
                        if (fieldName == null) fieldName = item.dataPath;
                        var oldValue = component.getValue(fieldName);
                        if (oldValue != formulaResult) {
                            component.setValue(fieldName, formulaResult);
                            if (logSummary && oldValue != formulaResult) {
                                isc.Log.logInfo("Set (populateFromDataPath) '" + component.ID + "." + fieldName +
                                                "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                                formulaResult, logCategory);
                            }
                        } else if (logDetail) {
                            var valueType = "[" + (oldValue == null ? "initial" :
                                                    (oldValue != formulaResult ? "changed" :
                                                        "existing")) +
                                            " value]"
                            isc.Log.logDebug("Set (populateFromDataPath) '" + component.ID + "." + fieldName +
                                            "' to " + valueType + ": " +
                                            formulaResult, logCategory);
                        }
                    }
                } else {
                    var oldValue = (component.getProperty ? component.getProperty(name) : component[name]);
                    if (component.setProperty) component.setProperty(name, formulaResult);
                    else component[name] = formulaResult;
                    if (logSummary && oldValue != formulaResult) {
                        isc.Log.logInfo("Set (populateFromDataPath) '" + component.ID + "." + name +
                                        "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                        formulaResult, logCategory);
                    } else if (logDetail) {
                        var valueType = "[" + (oldValue == null ? "initial" :
                                                (oldValue != formulaResult ? "changed" :
                                                    "existing")) +
                                        " value]"
                        isc.Log.logDebug("Set (populateFromDataPath) '" + component.ID + "." + name +
                                        "' to " + valueType + ": " +
                                        formulaResult, logCategory);
                    }
                }
            },

            // By default populate rules depend on their formula source fields so
            // changes to those fields should trigger the rule to re-run.
            getDependentFields : function (rule, triggerEvent) {
                // if passed a non object as formulaVars, ignore it
                if (rule.formulaVars == null || !isc.isAn.Object(rule.formulaVars) || isc.isAn.emptyArray(rule.formulaVars)) return null;
                var sourceField = [];
                for (var key in rule.formulaVars) {
                    sourceField.add(rule.formulaVars[key]);
                }
                return sourceField;
            }
        },

        // used by rules created to bind an AdvancedCriteria to a dynamic property
        populateFromCriteria: {
            type:"populateFromCriteria",
            title:"Populate value from ruleScope DataPath",
            description:"Populates a target with boolean derived from an AdvancedCriteria",
            valueType:"custom",
            dataType:"none",

            getAttributesFromEditor:function (fieldName, item) {
                // item stores value as an object formula/formulaVars
                return item.getValue();
            },
            setEditorAttributes:function(fieldName, item, attributes) {
                // Attributes we're interested in are formulaVars and formula
                if (attributes != null && attributes.formula != null) {
                    item.setValue({formula:attributes.formula, formulaVars:attributes.formulaVars});
                } else {
                    item.clearValue();
                }
            },

            isRule:true,
            supportedTargets:["FormItem", "Canvas"],

            action : function (result, item, validator, record, component, componentType) {
                // do nothing unless we actually ran (so if appliesWhen doesn't pass we don't
                // run the 'populate' logic)
                if (result != true) return;

                

                var ruleScope = component.getRuleScopeComponent(),
                    rulesEngine = ruleScope ? ruleScope.getRulesEngine() : null
                ;

                
                if (ruleScope == null || rulesEngine == null) return;

                
                var criteria = isc.DS.resolveDynamicCriteria(validator.formula, record);

                criteria = isc.DS.validateCriteria(criteria, rulesEngine, ruleScope,
                                                   rulesEngine.resolveFieldOrPropertyType);

                // dynamic property value is simply whether the record passes the criteria
                var matchingRows = isc.DS.applyFilter([record], criteria, rulesEngine,
                                                      ruleScope, rulesEngine.resolveField),
                    critResult = matchingRows.length > 0
                ;

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;

                // we always get componentType as "Canvas", even if formItem is a component
                if (componentType == "Canvas") {
                    var oldValue = (component.getProperty ? component.getProperty(item) : component[item]);
                    if (component.setProperty) component.setProperty(item, critResult);
                    else component[item] = critResult;
                    if (logSummary && oldValue != critResult) {
                        isc.Log.logInfo("Set (populateFromCriteria) '" + component.ID + "." + item +
                                        "' to" + (oldValue == null ? " [initial value]: " : ": ") +
                                        critResult, logCategory);
                    } else if (logDetail) {
                        var valueType = "[" + (oldValue == null ? "initial" :
                                                (oldValue != critResult ? "changed" :
                                                    "existing")) +
                                        " value]"
                        isc.Log.logDebug("Set (populateFromCriteria) '" + component.ID + "." + item +
                                        "' to " + valueType + ": " +
                                        critResult, logCategory);
                    }
                }
            },

            // following the pattern of dataPath-based dynamic properties, we only run on
            // context change, and don't attempt to individually track the dataPaths used
            getDependentFields : function (rule, triggerEvent) {
                return null;
            }
        },

        //> @object SetRequiredRule
        // Marks a field as required.
        // <P>
        // This rule will most commonly be used in conjunction with +link{validator.applyWhen}
        // criteria set to conditionally set a field as required in response to some standard
        // +link{rule.triggerEvent}.
        //
        // @visibility rules
        //<
        setRequired : {
            type:"setRequired",
            title:"Set required",
            description:"Set field required state",
            valueType:"none",
            dataType:"none",
            isRule:true,
            supportedTargets:["FormItem"],
            action : function (result, item, validator, record, component) {
                if ((validator.logCategory && isc.Log.logIsDebugEnabled(validator.logCategory)) ||
                        (!validator.logCategory && isc.Log.logIsDebugEnabled("rulesEngine")))
                {
                    isc.Log.logDebug("Perform 'setRequired' rule action with result: " + result,
                                     validator.logCategory || "rulesEngine");
                }

                // If the validator was skipped (result == null), we'll set required to false.
                var required = !!result;
                var liveItem = item;
                if (!liveItem.setRequired && component.getItem) {
                    liveItem = component.getItem(item.name || item.dataPath);
                }
                var oldValue = (liveItem || item).required;
                if (liveItem && liveItem.setRequired) {
                    liveItem.setRequired(required);
                
                } else {
                    item.required = required;
                }

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;
                if (logDetail || logSummary) {
                    if (logSummary && oldValue != required) {
                        isc.Log.logInfo("Set field " + (required ? "" : "not ") + "required " +
                                        liveItem.form.ID + "." + liveItem.name + "'", logCategory);
                    } else if (logDetail) {
                        isc.Log.logDebug("Set field " + (result ? "" : "not ") + "required " +
                                        liveItem.form.ID + "." + liveItem.name + "'", logCategory);
                    }
                }
            }
        },

        //> @object ReadOnlyRule
        // Change the state/appearance of a field to readOnly. Desired appearance is specified via
        // the +link{readOnlyRule.fieldAppearance} property on the rule object.
        // <P>
        // This rule will most commonly be used in conjunction with +link{validator.applyWhen}
        // criteria set to conditionally set a field as readOnly in response to some standard
        // +link{rule.triggerEvent}.
        //
        // @visibility rules
        //<

        //> @attr readOnlyRule.fieldAppearance (FieldAppearance : "readOnly" : IR)
        // Appearance of a readOnly field.
        // @visibility rules
        //<
        readOnly: {
            type: "readOnly",
            
            valueType:"custom",
            dataType:"none",
            // This is actually a simple subclass of SelectItem
            
            
            editorType:"ReadOnlyRuleEditor",
            valueAttribute:"fieldAppearance",

            title: "Set read-only appearance",
            description: "Set field read-only state/appearance",

            // Mark this as a rule, not a validator. No condition, and supports 
            // locator.
            isRule:true,
            supportedTargets:["FormItem", "ListGridField", "Canvas", "Section"],

            action : function (result, target, validator, record, targetContainer, targetType) {
                // This rule is used by readOnlyWhen rules. When the widget is in editMode it shouldn't
                // be hidden or disabled so override the result to force it visible/enabled.
                if (target.editingOn) result = false;

                var oldValue;   // true when read-only
                if (validator.fieldAppearance == isc.Validator.HIDDEN) {
                    
                    if (result == true) {
                        // Only "Canvas" would be expected to have no "targetContainer".
                        // Just call 'hide' on the target.
                        if (targetContainer == null) {
                            // check for the method is a sanity check only
                            if (target.hide) {
                                oldValue = !target.isVisible();
                                target.hide();
                            }
                        } else {
                            
                            if (targetType == "Section") {
                                var section = targetContainer.getSection(target);
                                oldValue = section && section.hidden;
                                targetContainer.hideSection(target);
                            } else if (targetType == "FormItem") {
                                var field = targetContainer.getField(field);
                                oldValue = field && !field.isVisible(true);
                                targetContainer.hideItem(target);
                            }
                            
                        }
                    } else {
                        if (targetContainer == null) {
                            if (target.show) {
                                oldValue = !target.isVisible();
                                target.show();
                            }
                        } else {
                            if (targetType == "Section") {
                                var section = targetContainer.getSection(target);
                                oldValue = section && section.hidden;
                                targetContainer.showSection(target);
                            } else {
                                var field = targetContainer.getField(field);
                                oldValue = field && !field.isVisible(true);
                                targetContainer.showField(target);
                            }
                        }
                    }

                } else if (validator.fieldAppearance == isc.Validator.DISABLED) {
                    if (result == true) {
                        if (targetContainer == null) {
                            oldValue = !target.isDisabled();
                            target.disable();
                        } else {
                            if (targetType == "Section") {
                                oldValue = !target.isDisabled();
                                
                                target.disable();
                                if (target.items) {
                                    for (var i = 0; i < target.items.length; i++) {
                                        target.items[i].disable();
                                    }
                                }
                            } else {
                                var field = targetContainer.getField(field);
                                oldValue = field && !field.isDisabled();
                                targetContainer.disableField(target);
                            }
                        }
                    } else {
                        if (targetContainer == null) {
                            oldValue = !target.isDisabled();
                            target.enable();
                        } else {
                            if (targetType == "Section") {
                                oldValue = !target.isDisabled();
                                target.enable();
                                if (target.items) {
                                    for (var i = 0; i < target.items.length; i++) {
                                        target.items[i].enable();
                                    }
                                }
                            } else {
                                var field = targetContainer.getField(field);
                                oldValue = field && !field.isDisabled();
                                targetContainer.enableField(target);
                            }
                        }
                    }
                } else {
                    if (targetType != "FormItem" && targetType != "ListGridField") {
                        isc.logWarn("ReadOnly rule with fieldAppearance set to '" 
                            + validator.fieldAppearance + "' not supported for specified locator:" 
                            + validator.locator);
                        oldValue = result;  // suppress logging a change
                    } else {
                        var field = targetContainer.getField(target.name);
                        switch (targetType) {
                        case "FormItem":
                            oldValue = field && !field.getCanEdit();
                            break;
                        case "ListGridField":
                            oldValue = field && !field.canEdit;
                            break;
                        }
                        targetContainer.setFieldCanEdit(target.name, result != true);
                    }
                }

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;
                if (logDetail || logSummary) {
                    var containerPath = (targetType == "FormItemIcon" ?
                                            targetContainer.form.ID + "." + targetContainer.name + "." :
                                            (targetContainer ? targetContainer.ID + "." : ""));
                    if (logSummary && oldValue != !!result) {
                        isc.Log.logInfo("Set " + (result ? "read-only" : "editable") +
                                        " (appearance " + validator.fieldAppearance + ") " +
                                        targetType + " '" + containerPath +
                                        (target.name || target.ID) + "'", logCategory);
                    } else if (logDetail) {
                        var changedText = (oldValue != !!result ? "" : " [not changed]");
                        isc.Log.logDebug("Set " + (result ? "read-only" : "editable") +
                                         " (appearance " + validator.fieldAppearance + ") " +
                                         targetType + " '" + containerPath +
                                         (target.name || target.ID) + "'" + changedText, logCategory);
                    }
                }
            }
        },

        //> @object VisibilityRule
        // Change the visibility of a field. Field is shown when rule is true.
        // <P>
        // This rule will most commonly be used in conjunction with +link{validator.applyWhen}
        // criteria set to conditionally set a field as visible in response to some standard
        // +link{rule.triggerEvent}.
        //
        // @visibility rules
        //<
        visibility: {
            type: "visibility",
            
            valueType:"custom",
            dataType:"none",
            title: "Set visibility",
            description: "Set field visibility",

            // Mark this as a rule, not a validator. No condition, and supports 
            // locator.
            isRule:true,
            supportedTargets:["FormItem", "FormItemIcon", "Canvas", "Section", "MenuItem", "Tab", "ListGridField"],

            action : function (result, target, validator, record, targetContainer, targetType) {
                
                // This rule is used by visibleWhen rules. When the widget is in editMode it
                // shouldn't be hidden so override the result to force it visible.
                
                if (target.editingOn) {
                    if (!result) {
                        target.editProxy.setHiddenByRule(true);
                        result = true;
                    } else {
                        target.editProxy.setHiddenByRule(false);
                    }
                }



                var oldValue;   // true when visible


                
                
                if (targetType == "Section") {
                    var section = targetContainer.getSection(target);
                    oldValue = section && !section.hidden;
                    if (result == true) {
                        targetContainer.showSection(target);
                    } else {
                        targetContainer.hideSection(target);
                    }
                } else if (targetType == "FormItemIcon") {
                    var icon = targetContainer.getIcon(target);
                    oldValue = icon.visible;
                    if (result == true) {
                        targetContainer.showIcon(target);
                    } else {
                        targetContainer.hideIcon(target);
                    }
                } else if (targetType == "FormItem") {
                    if (targetContainer != null) {
                        var field = targetContainer.getField(field);
                        oldValue = field && field.isVisible(true);
                        if (result) targetContainer.showField(target);
                        else targetContainer.hideField(target);
                    }
                // Default case - use processVisibilityRule() on the target component
                // This will determine the appropriate action to take based on the validator config
                } else {

                    var component = targetContainer || target;

                    var changed = component.processVisibilityRule(result, validator);
                    oldValue = changed ? !result : result;
                }

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;
                if (logDetail || logSummary) {
                    var containerPath = (targetType == "FormItemIcon" ?
                                            targetContainer.form.ID + "." + targetContainer.name + "." :
                                            (targetContainer ? targetContainer.ID + "." : ""));
                    if (logSummary && oldValue != !!result) {
                        isc.Log.logInfo((result ? "Show " : "Hide ") + targetType + " '" + containerPath +
                                        (target.ID || target.name) + "'", logCategory);
                    } else if (logDetail) {
                        isc.Log.logDebug((result ? "Show " : "Hide ") + targetType + " '" + containerPath +
                                        (target.ID || target.name) + "'", logCategory);
                    }
                }
            }
        },

        //> @object EnableRule
        // Enable/disable a field. Field is enabled when rule is true.
        // <P>
        // This rule will most commonly be used in conjunction with +link{validator.applyWhen}
        // criteria set to conditionally set a field as enabled in response to some standard
        // +link{rule.triggerEvent}.
        //
        // @visibility rules
        //<
        enable: {
            type: "enable",
            
            valueType:"custom",
            dataType:"none",
            title: "Enable/disable",
            description: "Enable/disable field",

            // Mark this as a rule, not a validator. No condition, and supports 
            // locator.
            isRule:true,
            supportedTargets:["FormItem", "FormItemIcon", "Canvas", "Section", "MenuItem", "Tab", "ListGridField"],

            action : function (result, target, validator, record, targetContainer, targetType) {

                var oldValue;   // true when enabled
                

                if (targetType == "Section") {
                    oldValue = !target.isDisabled();
                    if (result) {
                        target.enable();
                        if (target.items) {
                            for (var i = 0; i < target.items.length; i++) {
                                target.items[i].enable();
                            }
                        }
                    } else {
                        
                        target.disable();
                        if (target.items) {
                            for (var i = 0; i < target.items.length; i++) {
                                target.items[i].disable();
                            }
                        }
                    }
                } else if (targetType == "FormItemIcon") {
                    oldValue = targetContainer.iconIsDisabled(target);
                    targetContainer.setIconDisabled(target, !result);

                // If targetContainer is non-null we're updating enabled state for a form item
                } else if (targetType == "FormItem") {
                    if (targetContainer != null) {
                        var field = targetContainer.getField(field);
                        oldValue = field && !field.isDisabled();
                        if (result) targetContainer.enableField(target);
                        else targetContainer.disableField(target);
                    }
                // Default case - use processVisibilityRule() on the target component
                // This will determine the appropriate action to take based on the validator config
                } else {

                    var component = targetContainer || target,
                        changed = component.processEnableRule(result, validator);
                    oldValue = changed ? !result : !!result;
                }

                var logCategory = validator.logCategory || "rulesEngine",
                    logDetail = isc.Log.logIsDebugEnabled(logCategory),
                    logSummary = !logDetail && isc.Log.logIsInfoEnabled(logCategory)
                ;
                if (logDetail || logSummary) {
                    var containerPath = (targetType == "FormItemIcon" ?
                                            targetContainer.form.ID + "." + targetContainer.name + "." :
                                            (targetContainer ? targetContainer.ID + "." : "")),
                        targetName = (targetType == "MenuItem" ? targetContainer.getItem(target).title :
                                        (target.ID || target.name))
                    ;
                    if (logSummary && oldValue != !!result) {
                        isc.Log.logInfo((result ? "Enabling " : "Disabling ") + targetType +
                                        " '" + containerPath + targetName + "'",
                                        logCategory);
                    } else if (logDetail) {
                        isc.Log.logDebug((result ? "Enabling " : "Disabling ") + targetType +
                                         " '" + containerPath + targetName + "'",
                                         logCategory);
                    }
                }
            }
        }
    },

    //> @attr Validator._acceptExcelFormats (Boolean : false : IRW)
    // Whether to force validators to accept Excel formats.  Default is not to do so.
    //<
    _acceptExcelFormats: false                                     

});


isc.Validator.addClassMethods({

    //> @classMethod Validator.create()
    // A Validator shouldn't be created directly. Instead pass +link{Properties} as
    // each Validator in +link{formItem.validators} or wherever a Validator is needed.
    // 
    // @visibility external
    //<
    // Log a warning if called directly
    create : function (A,B,C,D,E,F,G,H,I,J,K,L,M) {
        this.logWarn("A Validator shouldn't be created directly. Instead pass properties " +
                     "as each Validator in a FormItem's validators property or wherever a " +
                     "Validator is needed.");
       
        return isc.addProperties({}, A,B,C,D,E,F,G,H,I,J,K,L,M);
    },
    
    getValidatorType : function (validator) {
        // if no type was specified, get it from the validator.type property
        var type = validator.type;
        // use _constructor if specified. This allows us to handle validators converted from XML
        // using schema
        if (type == null && validator._constructor) type = validator._constructor;
        return type;
    },
    
    // Is the validator server-only?
    
    isServerValidator : function (validator) {
    	if (validator.serverOnly) return true;

        // Check whether we have a build-in validator definition of the appropriate type.
        var validatorDefinition = this._validatorDefinitions[this.getValidatorType(validator)];
        if (validatorDefinition != null && validatorDefinition.requiresServer) return true;

        return false;
    },

    // Process validator and performAction are internal methods called by
    // DynamicForm, valuesManagers, and editable ListGrids to perform validation.
    //
    // The RulesEngine also makes use of this method to process Rules, which are
    // implemented as specialized validators.
    
    processValidator : function (item, validator, value, type, record, additionalContext) {
    	// if the validator is server-side only, return true
    	if (validator.serverOnly) return true;
        
        // pick up the type from the validator object if not explicitly passed
    	if (type == null) type = isc.Validator.getValidatorType(validator);

    	if (additionalContext == null) additionalContext = {};

    	var result = true;
        
        // Check whether we have a build-in validator definition of the appropriate type.
        var validatorDefinition;
        if (type != null)  validatorDefinition = this._validatorDefinitions[type];
    	
    	// if the validator is marked as a "rule" we don't support validator.condition
        
        if (validator.isRule || (validatorDefinition && validatorDefinition.isRule)) {
            return true;
        }
        // If a validator definition was not found, check whether we have a
        // standard validator in the old format of the appropriate type.
        var validationFunction;
        if (validatorDefinition == null) {
    	
            // use the validator.condition if one was specified
            if (validator.condition) {
                // CALLBACK API:  available variables:  "item,validator,value,record"
                // Convert a string callback to a function
                if (!isc.isA.Function(validator.condition)) {
                    //>DEBUG
                    this.logDebug("Creating function for validation condition:\r" +
                                  validator.condition);
                    //<DEBUG
                    isc.Func.replaceWithMethod(validator, "condition",
                                               "item,validator,value,record");
                }
                validationFunction = validator.condition;
            }
        } else {
            // If validator is server-only, return successful validation for client
            if (validatorDefinition.requiresServer == true) {
                return true;
            }

            // Convert a string callback to a function
            if (isc.isA.String(validatorDefinition.condition)) {
                //>DEBUG
                this.logDebug("Creating function for validation condition:\r" +
                              validatorDefinition.condition);
                //<DEBUG
                isc.Func.replaceWithMethod(validatorDefinition, "condition",
                                           "item,validator,value,record");
            }

            // Pull validation function from definition
            validationFunction = validatorDefinition.condition;

            // Push default error message to validator if not already set
            if (!validator.errorMessage) {
                validator.defaultErrorMessage = validatorDefinition.defaultErrorMessage;
            }
        }
    
        // if we found a validating function, call it 
        if (validationFunction != null) {
            // NOTE: first clear the "resultingValue" field and suggested value of the
            // validator, in case the validation rule decides to set it

            // for Array-valued fields (field.multiple=true), validate each value in the Array
            
            var validateEachItem = validator.validateEachItem;
            if (validateEachItem == null && item) validateEachItem = item.validateEachItem;
            
            if (validateEachItem == null && item && item.multiple) validateEachItem = true;
            if (item && item.multiple && validateEachItem && 
                    (isc.isAn.Array(value))) 
            {
                var undef;
                if (value.length > 0) {
                    var resultingValue = [];
                    for (var i = 0; i < value.length; i++) {
                        // Each call to validationFunction could set the resultingValue
                        delete validator.resultingValue;
                        // NOTE: don't stop on failure
                        result = result && validationFunction(item, validator, value[i], record, additionalContext);
                        // capture each resulting value
                        resultingValue[i] = (validator.resultingValue != null ?
                                            validator.resultingValue : value[i]);
                    }
                    // return the array value as the overall resulting value
                    validator.resultingValue = resultingValue;
                } else {
                    // A "cleared" multiple-valued item may have its value set to an empty array
                    // In this case we don't want to skip validation altogether (this would cause
                    // a required validator to fail for example). Pass undefined to the validation
                    // function instead
                    
                    
                    var undef,
                        valueToValidate = undef,
                        validateEmptyArray = validator.validateEmptyArray;
                    if (validateEmptyArray == null && item) validateEmptyArray = item.validateEmptyArray;
                    if (item.validateEmptyArray) valueToValidate = value;

                    delete validator.resultingValue;
                    result = validationFunction(item, validator, valueToValidate, record, additionalContext);
                }
                    
            } else {
                delete validator.resultingValue;
                result = validationFunction(item, validator, value, record, additionalContext);
            }
        //>DEBUG
        } else {
            this.logWarn("validator not understood on item: " + isc.echo(item) + ":\r" + 
                         isc.echoFull(validator));
        //<DEBUG
        }

    	return result;
    },
    
    performAction : function (result, item, validator, record, component, targetObjectType) {

        var type = this.getValidatorType(validator);

        // Check whether we have a build-in validator definition of the appropriate type.
        var validatorDefinition;
        if (type != null)  validatorDefinition = this._validatorDefinitions[type];
        
        // Rules require a target object type since the "locator" can point to 
        // something other than a FormItem. This will be passed in by the RulesEngine if
        // the rule was derived from a locator. Otherwise it's always a field.
        if (targetObjectType == null) targetObjectType = "FormItem";
        var isRule = validator.isRule,
            supportedTargets = validator.supportedTargets;
        var actionFunction;
        if (validatorDefinition != null) {

            // Convert a string callback to a function
            if (isc.isA.String(validatorDefinition.action)) {
                //>DEBUG
                this.logDebug("Creating function for validation action:\r" +
                              validatorDefinition.action);
                //<DEBUG
                isc.Func.replaceWithMethod(validatorDefinition, "action",
                    "result,item,validator,record,component,targetObjectType");
            }

            actionFunction = validatorDefinition.action;
            if (isRule == null) isRule = validatorDefinition.isRule;
            if (isRule && supportedTargets == null) {
                // assume if supportedTargets is unset the rule supports just FormItems like any
                // other validator.
                supportedTargets = validatorDefinition.supportedTargets || ["FormItem"]
            }
        }
        
        if (isRule && !supportedTargets.contains(targetObjectType)) {
            this.logWarn("Rule of type:" + type +
                " called for target object " + item + ", of type:" + targetObjectType + 
                ". This is not a valid target for this rule. Ignoring.");
        }
        
        // if we didn't find an actionFunction, use the validator.action if one was specified
        
        if (actionFunction == null && validator.action) {
            // CALLBACK API:  available variables:  "result,item,validator,component"
            // Convert a string callback to a function
            if (!isc.isA.Function(validator.action)) {
                //>DEBUG
                this.logDebug("Creating function for validation action:\r" +
                              validator.action);
                //<DEBUG
                isc.Func.replaceWithMethod(validator, "action",
                                           "result,item,validator,record,component,targetObjectType");
            }
            actionFunction = validator.action;
        }
        // call the action method
        if (actionFunction != null) {
            actionFunction(result, item, validator, record, component, targetObjectType);

            // if the record validated, update the fire time if we're tracking it
            if (result && validator.trackFireTime) validator._fireTime = new Date();
        }
    },

    getErrorMessage : function (validator, messageAttribute) {
        
        var errorMessage = messageAttribute ? validator[messageAttribute] : validator.errorMessage;
        
        if (errorMessage == null) errorMessage = validator.defaultErrorMessage;
        
        // Convert (potentially) dynamic error message strings to straight
        // strings
        if (errorMessage && validator.dynamicErrorMessageArguments) {
            errorMessage = errorMessage.evalDynamicString(
                                null, validator.dynamicErrorMessageArguments);
        }
        return errorMessage;
    },
    
    getShortName : function (validatorType) {
        var shortName = (this._shortNameCache ? this._shortNameCache[validatorType] : null);
        if (!shortName) {
            shortName = isc.DS.getAutoTitle(validatorType);
            if (!this._shortNameCache) this._shortNameCache = {};
            this._shortNameCache[validatorType] = shortName;
        }
        return shortName;
    },
    
    //>	@classMethod	Validator.addValidator()	(A)
    // Add a new validator type that can be specified as +link{Validator.type} anywhere
    // validators are declared, such as +link{DataSourceField.validators} or
    // +link{FormItem.validators}.
    // <br>
    // The <code>condition</code> argument should be a method of the same signature as
    // +link{Validator.condition()}.
    // <P>
    // This method is essentially a shortcut for building a +link{validatorDefinition} object
    // and passing that to +link{Validator.addValidatorDefinition()}
    //
    // @param type (String) type name for the new validator
    // @param condition (ValidatorConditionCallback) callback, function or expression to
    //                                   evaluate to determine whether validation was successful
    // @group validation
    // @visibility external
    // @see Validator.addValidators()
    //<
    addValidator : function (type, condition) {
        if (isc.isA.String(type)) {
            var valsObject = {};
            valsObject[type] = condition;
            return this.addValidators(valsObject);
        }
    },

    //>	@classMethod	Validator.addValidators()	(A)
    //  Add several new validator types at once, as though +link{addValidator()} were called
    //  several times.
    // 
    //   @group	validation
    //   @param	newValidators	(Object)	Set of validators to add.  This parameter should
    //      be a JavaScript object where the property names are validator type names, and the
    //      property values are condition functions or expressions, for example:<br>
    //      &nbsp;&nbsp;&nbsp;<code>{type1:condition1, type2:condition2}</code><br>.
    //
    // @visibility external
    // @see Validator.addValidator()
    //<
    addValidators : function (newValidators) {
        // wrap the functions in a definition object and pass through to addValidatorDefinition()
        for (var type in newValidators) {
            var definition = {};
            definition.type = type;
            definition.condition = newValidators[type];
            if (!isc.isA.Function(definition.condition)) {
                isc.Func.replaceWithMethod(definition, "condition", "item,validator,value");
            }
            newValidators[type] = definition;
        }
        this.addValidatorDefinitions(newValidators);
    },
    
    //> @classMethod  Validator.addValidatorDefinition() (A)
    // Add a new validator type that can be specified as +link{Validator.type} anywhere
    // validators are declared, such as +link{DataSourceField.validators} or
    // +link{FormItem.validators}.
    //
    // @param type (String) type name for the new validator
    // @param definition (ValidatorDefinition) the validator definition
    //
    // @group validation
    // @visibility external
    // @see Validator.addValidatorDefinitions()
    //<
    addValidatorDefinition : function (type, definition) {
        if (!isc.isAn.Object(definition)) {
            isc.logWarn("Invalid validator in call to addValidatorDefinition. Ignored.");
        }
        var valsObject = {};
        valsObject[type] = definition;
        return this.addValidatorDefinitions(valsObject);
    },
    
    //> @classMethod  Validator.addValidatorDefinitions() (A)
    // Add several new validator types at once, as though +link{addValidatorDefinition()}
    // were called several times.
    // 
    // @group validation
    // @param newDefinitions (Object) Set of validators to add.  This parameter should
    //      be a JavaScript object where the property names are validator type names, and the
    //      property values are +link{validatorDefinition}s.
    //
    // @visibility external
    // @see Validator.addValidatorDefinition()
    //<
    addValidatorDefinitions : function (newDefinitions) {
        if (!newDefinitions || !isc.isAn.Object(newDefinitions)) return;

        // Check for redefinition of validators and log warning
        for (var type in newDefinitions) {
            if (this._validatorDefinitions[type]) {
                isc.logWarn("addValidatorDefinitions: Validator definition already exists " +
                            "for type " + type + ". Replacing.");
            }
        }
    	isc.addProperties(this._validatorDefinitions, newDefinitions);
    },
    
    //> @classMethod Validator.getValidatorDefinition() [A]
    // Return the +link{type:ValidatorDefinition} for some validator type name registered via
    // +link{addValidatorDefinition}
    // @param type (String) type name to retrieve the validator for
    // @return (ValidatorDefinition) registered validator definition (or null if no
    //  validator was found for this type name).
    //<
    
    getValidatorDefinition : function (type) {
        return this._validatorDefinitions[type];
    },

    
    // Validation error message for regex name@host.com regex validator
    emailFormatErrorMessage:"Must be in the form name@host.com",
    // General error message used for "bad" email address validators
    emailGeneralErrorMessage:"Your email address does not appear to be valid. Please check the spelling and try again",
    getStandardEmailValidators:function (blockDomains) {
        return [
            {type: "lengthRange", max: 100, min: 8,
                errorMessage: this.emailGeneralErrorMessage},
            {type: "regexp", 
                errorMessage: this.emailFormatErrorMessage,
                expression:"^([a-zA-Z0-9_.\\-+])+@(?!abcd)(?!asd)(([a-zA-Z0-9\\-]{2,60})+\\.)+[a-zA-Z]{2,63}$"},
            {type: "regexp", 
                errorMessage: this.emailGeneralErrorMessage,
                expression:"^(?!(S|s)df).*$"},
            {type: "regexp", 
                errorMessage: this.emailGeneralErrorMessage,
                expression:"^(?!(G|g)fd).*$"},
            {type: "regexp", 
                errorMessage: this.emailGeneralErrorMessage,
                expression:"^(?!(F|f)ds).*$"},
            {type: "regexp", 
                errorMessage: this.emailGeneralErrorMessage,
                expression:"^(?!qq@).*$"}
        ] 
    }
    
});

// Synonym with regexp. Same as in server side.
isc.Validator.addValidatorDefinition("regex", isc.Validator.getValidatorDefinition("regexp"));


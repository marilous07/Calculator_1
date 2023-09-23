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
//>	@class	DynamicForm
//
// The DynamicForm manages a collection of FormItems which represent user input controls.  The
// DynamicForm provides +link{group:formLayout,layout}, value management, validation and
// databinding for the controls it manages.
// <P>
// <smartgwt>
// To create a DynamicForm, create several +link{FormItem}s and pass them to
// +link{dynamicForm.setItems(),setItems()}.  For example:
// <pre>
//    DynamicForm form = new DynamicForm();
//    TextItem textItem = new TextItem("userName");
//    SelectItem selectItem = new SelectItem("usState");
//    form.setItems(textItem, selectItem);
// </pre>
// </smartgwt>
// <smartclient>
// To create a DynamicForm, set +link{dynamicForm.fields} to an Array of Objects describing the
// FormItems you want to use.  For example:
// <pre>
//    isc.DynamicForm.create({
//        fields:[
//            {name:"userName", type:"text"},  // creates a TextItem
//            {name:"usState", type:"select"}  // creates a SelectItem
//        ]
//    })
// </pre>
// </smartclient>
// The item <code>name</code> is an identifier for the item that must be unique just within
// this form.  It is used:
// <ul>
// <li> as the name under which the item's value is stored in the form (the form's
//      current values are accessible as +link{dynamicForm.getValues,form.getValues()}
// <li> when retrieving the FormItem's current value (via
//      +link{dynamicForm.getValue,form.getValue()}) 
// <li> to retrieve the item itself via +link{dynamicForm.getItem(),form.getItem()}
// </ul>
// FormItems can also be created by binding the form to a DataSource via
// <code>setDataSource()</code>.  In this case, FormItems are
// chosen based on the data type of the field - see +link{type:FormItemType}.  You can override
// the automatically chosen FormItem via +link{DataSourceField.editorType}.  
// <P>
// FormItem lifecycle is managed by the DynamicForm itself. FormItem instances are created
// and destroyed automatically when new fields are added to the form. 
// <P>
// When using DataSource binding, you can also add additional FormItems not specified in the
// DataSource, or override any properties on the automatically generated FormItems, without
// having to re-declare any information that comes from the DataSource.  See the QuickStart
// Guide chapter on Data Binding for an overview.
// <P>
// All FormItems share a common set of properties for controlling +link{group:formLayout,form
// layout}.  Other properties common to all FormItems are documented on the +link{FormItem}
// class, and properties specific to particular FormItems are documented on the respective
// FormItems.  
// <P>
// NOTE: For very simple forms consisting of exactly one item, you still use a DynamicForm.
// See the "fontSelector" form in the +explorerExample{toolstrip,Toolstrip example}.
//
//  @inheritsFrom Canvas
//  @implements DataBoundComponent    
//  @treeLocation Client Reference/Forms
//  @visibility external
//<

// create the form as a descendant of the Canvas
isc.ClassFactory.defineClass("DynamicForm", "Canvas", "DataBoundComponent");

// Synonym for use by ValuesManagers working with distributed 'FormLayouts'
isc.addGlobal("FormLayout", isc.DynamicForm);


//> @groupDef items
// Manipulating the items that belong to a form.
// <BR><br>
// An item manages an atomic value (eg a String, Number, Date, etc) that appears as one of the
// properties in the overall form's values.  Some items exist purely for layout or appearance
// purposes (eg SpacerItem) and do not manage a value.
// @title Form Items
// @visibility external
//<

//> @groupDef values
// Manipulating the values stored in the form.
// @visibility external
//<

//> @groupDef valueMap
// A +link{type:ValueMap} defines the set of legal values for a field, and optionally allows you to provide
// a mapping from stored values to values as seen by the end user.
//
// @visibility external
//<

//> @groupDef validation
// Validation
// @visibility external
//<

//> @groupDef formTitles
// Properties that affect form item title placement and styling.
// @title Form Titles
// @visibility external
//<

//> @groupDef errors
// Validation errors and how they are shown
// @visibility external
//<

//> @groupDef submitting
// Direct submission of forms to a target URL
// <P>
// <b>NOTE:</b> directly submitting forms is only done for specialized purposes, such as
// integration with certain legacy systems.  Normal form usage contacts the server via 
// +link{group:dataBoundComponentMethods,DataBound Component Methods}, through the RPCManager system.
// @visibility external
//<

//> @groupDef elements
// Manipulating native form elements
//<


// add constants
isc.DynamicForm.addClassProperties({
    

    //> @type   FormMethod
    //          Form METHOD parameters - how the form fields are submitted to the server
    // @value  isc.DynamicForm.GET     GET request -- URL encoding (~4K max)
    // @value  isc.DynamicForm.POST    POST request -- separate field encoding (no max)
    // @group  submitting
    // @visibility external
    //<

    //> @classAttr DynamicForm.GET (Constant : "GET" : [R])
    // A declared value of the enum type  
    // +link{type:FormMethod,FormMethod}.
    // @visibility external
    // @constant
    //<
	GET:"GET",

    //> @classAttr DynamicForm.POST (Constant : "POST" : [R])
    // A declared value of the enum type  
    // +link{type:FormMethod,FormMethod}.
    // @visibility external
    // @constant
    //<
	POST:"POST",

    //> @type   Encoding
    // Form encoding types - these translate to Form ENCTYPE parameters.
    // @value isc.DynamicForm.NORMAL  normal form encoding ("application/x-www-form-urlencoded")
    // @value isc.DynamicForm.MULTIPART  form encoding for forms with INPUT file elements, that
    //                                   is, forms that upload files ("multipart/form-data")
    // @group  submitting
    // @visibility external
    //<
    // NOTE: EncodingTypes has the values that we actually write into the form in HTML.

    //> @classAttr DynamicForm.NORMAL (Constant : "normal" : [R])
    // A declared value of the enum type  
    // +link{type:Encoding,Encoding}.
    // @visibility external
    // @constant
    //<
	NORMAL:	"normal",	     

    //> @classAttr DynamicForm.MULTIPART (Constant : "multipart" : [R])
    // A declared value of the enum type  
    // +link{type:Encoding,Encoding}.
    // @visibility external
    // @constant
    //<
	MULTIPART:	"multipart", 

	//>	@type	EncodingTypes
	// Form ENCTYPE parameters - how data is encoded when sent to the server.
    // See:  http://www.w3.org/TR/html4/interact/forms.html#adef-enctype
	//			@group	submitting
    // normal form encoding 
	NORMAL_ENCODING:	"application/x-www-form-urlencoded",
    // multipart encoding for file upload
	MULTIPART_ENCODING:	"multipart/form-data",
	//<
    
    // Attributes written into containers for form items / form item elements
    _containsItem : "_containsItem",
    _itemPart : "_itemPart",
    // Options for the itemPart setting
    _element : "_element",
    _textBoxString : "_textBox",
    _controlTableString : "_controlTable",
    _pickerIconCellString : "_pickerIconCell",
    _inlineErrorString : "inlineErrorHandle",
    _title : "_title",

    buildOperatorIndex : function () {
        if (isc.DataSource == null) return;
        var list = isc.getValues(isc.DataSource.getSearchOperators());

        list = list.sortByProperties(["symbol"], [false],
            [function (item, propertyName, context) {
                var value = item[propertyName],
                    length = isc.isA.String(value) ? value.length : 0
                ;

                return length;
            }]
        );

        this._operatorIndex = list.makeIndex("symbol", true);
    },
    getOperatorIndex : function () {
        return this._operatorIndex;
    },

    _defaultItemHoverHTMLImpl : function (item) {
        // Just bail if a native prompt is shown
        if (item.implementsPromptNatively) return null;
        // use renderAsDisabled(), to support both disabled and readOnlyDisplay:"disabled"
        var prompt = (item.renderAsDisabled() ? item.disabledHover : null) || 
                     (item.isReadOnly() ? item.readOnlyHover : null) ||
                     item.prompt;
        if (!prompt && item.parentItem) prompt = isc.DynamicForm._defaultItemHoverHTMLImpl(item.parentItem);
        return prompt
    },

    _defaultValueHoverHTMLImpl : function (item) {
        
        var returnVal = item.getDisplayValue();
        
        if (item != null && item.multiple && item.multipleValueSeparator) {
            if (isc.isAn.Array(returnVal)) returnVal = returnVal.join(item.multipleValueSeparator);
        }
        
        if (returnVal != null) {
            returnVal = "" + returnVal;

            // Don't escape &nbsp; unless that's actually the data value
            var value;
            if (returnVal == item._$nbsp &&
                ((value = item.getValue()) == null || value == isc.emptyString))
            {
                returnVal = "";

            // If escapeHTML is irrelevant (e.g. TextItems), then explicitly escape the value
            // here because mapValueToDisplay() will not.
            
            } else if (!item.canEscapeHTML) {
                returnVal = returnVal.asHTML();
            }
        }
        return returnVal;
    }

    /*
    ,
    getDefaultOperatorForType : function (type, item, textMatchStyle, field) {
        if (item) {
            var defaultOp = item.getDefaultOperator(textMatchStyle);
            if (defaultOp) return defaultOp;
        }

        var form = item && item.form,
            typeName = type == null ? "text" : isc.isA.String(type) ? type : type.name,
            operator
        ;
        if ((item && (item.valueMap || item.optionDataSource)) || 
            isc.SimpleType.inheritsFrom(typeName, "enum") ||
            isc.SimpleType.inheritsFrom(typeName, "boolean") ||
            isc.SimpleType.inheritsFrom(typeName, "float") ||
            isc.SimpleType.inheritsFrom(typeName, "integer") ||
            isc.SimpleType.inheritsFrom(typeName, "date") ||
            isc.SimpleType.inheritsFrom(typeName, "time"))
        {
            // if a field was passed, and it has validOperators, make sure they include "equals"
            // - if not, use "iEquals" if it's there, or just the first of them otherwise...
            if (field && field.validOperators) {
                if (field.validOperators.contains("equals")) operator = "equals";
                else if (field.validOperators.contains("iEquals")) operator = "iEquals";
                else operator = field.validOperators[0];
            } else {
                operator = "equals";
            }
        } else {
            var defaultOperator = "iContains";
            if (form) {
                defaultOperator = form.defaultSearchOperator || 
                    (form.allowExpressions ? "iContainsPattern" : "iContains");
                // if the default op isn't valid for the field, use the first valid operator
                var ds = form.getDataSource(),
                    theField = field && isc.isA.String(field) ? ds && ds.getField(field) : field,
                    types = ds && ds.getFieldOperators(theField),
                    validOp = types && types.contains(defaultOperator)
                ;
                if (!validOp && types) defaultOperator = types[0];
            }
            
            operator = isc.DataSource.getCriteriaOperator(null, textMatchStyle, defaultOperator);
        }
        return operator;
    }
    */
});



isc.DynamicForm.addProperties({

    // Basic Definition: items and values   
	// --------------------------------------------------------------------------------------------

    //>	@attr	dynamicForm.items		(Array of FormItem Properties : null : [IRW])
    // Synonym for +link{attr:dynamicForm.fields}
    // 
    // @see attr:dynamicForm.fields
    // @group items
    // @setter setItems()
    // @visibility external
    //<
    
    //> @attr dynamicForm.fields (Array of FormItem Properties : null : [IRW])
    // An array of field objects, specifying the order, layout, and types of each field in the
    // DynamicForm.
    // <p>
    // When both <code>dynamicForm.fields</code> and <code>dynamicForm.dataSource</code> are
    // set, <code>dynamicForm.fields</code> acts as a set of overrides as explained in
    // +link{attr:DataBoundComponent.fields}.
    // <P>
    // See +link{group:formLayout,Form Layout} for information about how flags specified on
    // the FormItems control how the form is laid out.
    //
    // @see class:FormItem
    // @setter setFields()
    // @group items
    // @visibility external
    //<

    //>	@attr	dynamicForm.defaultItems    (Array of FormItem Properties : null : [ARW])
    // An array of FormItem objects, defining the default set of elements this form 
    // creates. (Typically set at a class level on the instance prototype).
    // @group items
    //<
    // NOTE: not external; used for making specialized form subclasses

    //>	@attr	dynamicForm.values		(Object : null : [IRW])
    // An Object containing the initial values of the form as properties, where each
    // propertyName is the name of a +link{items,form item} in the form, and each property
    // value is the value held by that form item.
    // <P>
    // The form's values may contain values that are not managed by any FormItem, and these
    // values will be preserved and available when the form values are subsequently retrieved
    // via +link{getValues()}.
    // <P>
    // Providing values on initialization is equivalent to calling +link{setValues()}.
    // <P>
    // As the user manipulates form items to change values, change events fire
    // +link{formItem.change,on the items} and 
    // +link{dynamicForm.itemChange,on the form as a whole}.
    // <P>
    // Note that form values are logical values, for example, the value of a +link{DateItem} is
    // a JavaScript Date object, not a String, even if the user enters the date via a text
    // input.  Likewise the value of a +link{TextItem} or +link{CheckboxItem} that started out
    // null remains null until the user changes it; the value will not be automatically
    // converted to the null string ("") or false respectively, as happens with native HTML
    // elements.
    //
    // @group formValues
    // @visibility external
    //<
    
    // Table Layout
	// --------------------------------------------------------------------------------------------
 
    //> @groupDef formLayout
    // <b>FormItem Placement in Columns and Rows</b>
    // <P>
    // With the default tabular layout mechanism, items are laid out in rows from left to
    // right until the number of columns, specified by +link{dynamicForm.numCols,form.numCols},
    // is filled, then a new row is begun.  Flags on FormItems, including
    // +link{FormItem.startRow,startRow}, +link{FormItem.endRow,endRow},
    // +link{FormItem.colSpan,colSpan} and +link{FormItem.rowSpan,rowSpan}, control row and
    // column placement and spanning.  
    // <P>
    // Note that the most common form items (TextItem, SelectItem, etc) take up <b>two</b>
    // columns by default: one for the form control itself, and one for it's title.  The
    // default setting of +link{dynamicForm.numCols,form.numCols:2} will result in one TextItem
    // or SelectItem per row.
    // <P>
    // Note also that ButtonItems have both startRow:true and endRow:true by default.  You must
    // set startRow and/or endRow to <code>false</code> on a ButtonItem in order to place a
    // button in the same row as any other item.
    // <P>
    // The log category "tablePlacement" can be enabled from the Developer Console to watch
    // items being placed.  You can also set +link{dynamicForm.cellBorder,form.cellBorder:1} to
    // reveal the table structure for layout troubleshooting purposes.
    // <P>
    // <b>Row and Column Sizing</b>
    // <P>
    // +link{DynamicForm.colWidths} controls the widths of form columns.  FormItems that have
    // "*" for +link{formItem.width} will fill the column.  FormItems with a numeric width will
    // have that width in pixels regardless of the column's specified width, which may cause the
    // column to overflow as described under +link{DynamicForm.fixedColWidths}.
    // <P>
    // For row heights, the largest pixel height specified on any item in the row is taken as a
    // minimum size for the row.  Then, any rows that have "*" or "%" height items will share
    // any height not taken up by fixed-sized items.
    // <P>
    // Individual item heights are controlled by +link{formItem.height,item.height}. This may be specified as
    // an integer (pixel value), or a percentage string, or the special string "*", which 
    // indicates an item should fill the available space.<br>
    // Percentages allow developers to determine how the available space in the form
    // is split amongst items. For example if a form has 4 items in a single column,
    // 2 of which have an  absolute pixel height specified, and 2 of which are have
    // heights of <code>"30%"</code> and <code>"70%"</code> respectively, the percentage
    // sized items will split up the available space after the fixed size items have been
    // rendered.<br>
    // Note that +link{formItem.cellHeight,item.cellHeight} may be specified to explicitly control the height of 
    // an item's cell. In this case the specified +link{formItem.height,item.height} will govern the size
    // of the item within the cell (and if set to a percentage, this will be interpreted as
    // a percentage of the cellHeight).
    // <P>
    // <b>Managing Overflow</b>
    // <P>
    // Forms often contain labels, data values, or instructional text which can vary in
    // size based on the skin, data values, or internationalization settings.  There are a few
    // ways to deal with a form potentially varying in size:
    // <ol>
    // <li> Allow scrolling when necessary, using +link{Canvas.overflow,overflow:auto}, either
    // on the immediate form, or on some parent.
    // <li> Place the form in a Layout along with a component that can render any specified
    // size, such as a +link{ListGrid}.  In this case, the Layout will automatically shrink the
    // grid in order to accommodate the form.
    // <li> Ensure that the form can always render at a designed minimum size by reducing
    // the number of cases of variable-sized text, and testing remaining cases across all
    // supported skins.  For example, move help text into hovers on help icons, or clip 
    // long text values at a maximum length and provide a hover to see the rest.
    // </ol>
    // <P>
    // <b>Adaptive Layout</b>
    // <P>
    // To have various automatic adjustments made to render your form items in a single column,
    // you can use +link{dynamicForm.linearMode,linearMode}.  Importantly, you can have this
    // mode automatically applied to a form on +link{Browser.isHandset, handset devices} by
    // setting +link{dynamicForm.linearOnMobile,linearOnMobile} true.  For further details and
    // the properties that are available to customize this mode, see the
    // +link{dynamicForm.linearMode,linearMode} documentation.
    // <P>
    // Several examples of Form Layout are available +explorerExample{formsLayout,here}.
    //
    // @treeLocation Client Reference/Forms
    // @title Form Layout
    // @see formItem.width
    // @see formItem.height
    // @see dynamicForm.itemLayout
    // @visibility external
    //<
    

    //> @attr dynamicForm.itemLayout   (FormLayoutType : "table" : IRWA)
    // Layout style to use with this form.  
    // <P>
    // The default of "table" uses a tabular layout similar to HTML tables, but with much more
    // powerful control over sizing, item visibility and reflow, overflow handling, etc.
    // <P>
    // <code>itemLayout:"absolute"</code> allows absolute positioning of every form item.  This
    // provides maximum flexibility in placement, with the following limitations:<ul>
    // <li> titles, which normally take up an adjacent cell, are not shown.  Use
    //      StaticTextItems to show titles
    // <li> no automatic reflow when showing or hiding items.  +link{method:FormItem.setLeft()}
    //      and +link{method:FormItem.setTop()} can be used for manual reflow.
    // <li> only pixel and percent sizes are allowed, no "*".  Percent widths mean percentage
    //      of the overall form size rather than the column size
    // <li> with different font styling or internationalized titles, items may overlap that did
    //      not overlap in the skin used at design time
    // </ul>
    //
	// @group formLayout
    // @see group:formLayout
    // @see formItem.width
    // @see formItem.height
    // @visibility absForm
    //<
    //itemLayout:"table",

    //> @attr dynamicForm.flattenItems (boolean : false : IR)
    // If set, the form will set +link{numCols} automatically such that all form items will be
    // laid out in a single row.
    // <P>
    // +link{colWidths} may still be set.  If unset, they will be generated so that all columns
    // showing a title will have +link{titleWidth} and all other columns will have width:"*".
    //
    // @group formLayout
    //<
    flattenItems:false,

    //> @attr dynamicForm.linearMode (Boolean : null : IRW)
    // Switches the entire form to render in a style that is typical for form on a mobile
    // device with one +link{FormItem} per row.
    // <P>
    // The +link{linearOnMobile} attribute allows linear mode to be enabled on
    // mobile interfaces automatically.
    // <P>
    // While <code>linearMode</code> is active, the form's table layout is determined using the
    // following logic:<ul>
    // <li> If +link{titleOrientation} is not explicitly specified, it will be defaulted to 
    //      <code>top</code>, causing each item's title to appear above its element.<br>
    //      <b>Note:</b> in linear mode, each item will have the same title orientation.
    //      The item-level +link{formItem.titleOrientation} attribute will be ignored.</li>
    // <li> For those items with a +link{formItem.hint,hint} that support
    //      +link{textItem.showHintInField,showing the hint in the field},
    //      <code>showHintInField</code> will be defaulted true if unset.</li>
    // <li> For items showing validation errors inline, by default
    //      +link{dynamicForm.showErrorText,error text} will be displayed, and
    //      errors will +link{dynamicForm.errorOrientation,be rendered above the item element}.</li>
    // <li> The +link{numCols} property for the form is ignored. The form will render as
    //      a single column of items - or two columns if <code>titleOrientation</code> is
    //      specified as <code>"left"</code> or <code>"right"</code> by default.
    //      To override this, a developer may specify an explicit +link{linearNumCols}
    //      allowing multiple items to potentially be placed next to each other.</li>
    // <li> +link{formItem.width} is ignored and all items receive "*" width unless
    //      +link{formItem.linearWidth} is specified.</li>
    // </ul>
    // Note that if column widths have been specified via +link{colWidths}, but the number
    // of columns doesn't match the number of columns being rendered in linear mode, it will be
    // ignored.
    // <P>
    // If +link{linearAutoSpanItems} is true, each item in linear mode will span the full
    // set of columns by default. With this setting enabled, <code>linearNumCols</code> can 
    // be understood as a way to allow some items that are known to not require the full width
    // of the UI to appear next to each other in an otherwise single-column form.
    // <P>
    // When <code>linearAutoSpanItems</code> is enabled, the following properties are available
    // for further customizing the placement and sizing of items in a linear form:
    // <ul>
    // <li> +link{formItem.colSpan} is ignored and defaulted to "*", unless 
    //      +link{formItem.linearColSpan} is specified.</li>
    // <li> +link{formItem.startRow} and +link{formItem.endRow} are ignored and
    //      all items will default to <code>startRow:false</code> and <code>endRow:true</code>.
    //      This may be overridden per item via +link{formItem.linearStartRow} and
    //      +link{formItem.linearEndRow}.</li>
    // </ul>
    // For the best appearance, try to get your form to horizontally fill the screen, or almost
    // all of it, on handset-sized devices.  Any kind of fixed width on mobile is probably not
    // going to work as well.  One way to achieve this is by using a +link{SplitPane}.
    // @see linearOnMobile
    // @group formLayout
    // @visibility external
    //<
    setLinearMode : function (linearMode) {
        if (this.linearMode == linearMode) return;
        this.linearMode = linearMode;
        this._setLinearMode(linearMode);
        this.markForRedraw();
    },

    _setLinearMode : function (linearMode) {
        // in linear mode, first save, then default numCols and (potentially) colWidths
        if (linearMode) {
            // configure numCols
            this._numCols = this.numCols;
            this.setNumCols(this.linearNumCols != null ? this.linearNumCols :
                            (this.getTitleOrientation() == isc.Canvas.TOP ? 1 : 2));
            // clear colWidths, if it would conflict with configured numCols
            if (this.colWidths && this.colWidths.length != this.numCols) {
                this._colWidths = this.colWidths, this.colWidths = null;
            }    
        // otherwise, if we're switching off linear mode, restore any cached properties
        } else {
            if (this._numCols != null) {
                this.setNumCols(this._numCols);
                delete this._numCols;
            }
            if (this._colWidths) {
                this.setColWidths(this._colWidths);
                delete this._colWidths;
            }
        }
    },

    //> @attr dynamicForm.linearAutoSpanItems (Boolean : true : IRW) 
    // When a form is rendered in +link{linearMode}, should each item appear on its own
    // row, spanning the full set of rendered columns by default?
    // @visibility external
    //< 
    linearAutoSpanItems:true,

    //> @attr dynamicForm.linearOnMobile (boolean : false : IR)
    // Switches the entire form to render in a style that is typical for form on a
    // +link{Browser.isHandset,handset device} with one +link{FormItem} per row by
    // automatically defaulting +link{linearMode} to <code>true</code> on handsets.
    // <P>
    // <b>Note:</b> This property should not be changed framework-wide via
    // +link{classMethod:addProperties()} as the framework itself assumes and relies upon normal
    // behavior for forms.  If you want most of your forms to use +link{linearMode} on mobile,
    // create a subclass where <code>linearOnMobile</code> defaults to true, and pervasively
    // use that subclass.
    // @group formLayout
    // @visibility external
    //<

    //>	@attr dynamicForm.numCols		(number : 2 : [IRW])
    // The number of columns of titles and items in this form's layout grid. A title and
    // corresponding item each have their own column, so to display two form elements per
    // row (each having a title and item), you would set this property to 4.
    //
    // @group formLayout
    // @visibility external
    //<
	numCols:2,

    //> @attr dynamicForm.linearNumCols (number : null : [IRW])
    // Specifies the +link{numCols,number of columns} when the form is being rendered in
    // +link{linearMode}, overriding any automatically derived value in that mode.
    // @group formLayout
    // @visibility external
    //<
    
    //>	@attr dynamicForm.fixedColWidths	(Boolean : false : IRW)
	// If true, we ensure that column widths are at least as large as you specify them.  This
    // means that if any single column overflows (due to, eg, a long unbreakable title),
    // the form as a whole overflows.
    // <P>
	// If false, columns will have their specified sizes as long as no column overflows.  If
    // any column overflows, space will be taken from any other columns that aren't filling the
    // available room, until there is no more free space, in which case the form as a whole
    // overflows.
    // 
	// @group formLayout
    // @visibility external
	//<
    
	fixedColWidths:false,
    
    // fixedRowHeights - undocumented property that causes heights to be written into cells, 
    // which, like fixedColumnWidths, puts you into a situation where you're more likely to 
    // overflow. 
    fixedRowHeights:false,

    //>	@attr	dynamicForm.colWidths		(Array : null : [IRW])
    // An array of widths for the columns of items in this form's layout grid. 
    // <P>
    // If specified, these widths should sum to the total width of the form (form.width).
    // If not specified, we assume every other column will contain form item titles, and so
    // should have <code>form.titleWidth</code>, and all other columns should share the
    // remaining space.
    // <P>
    // Acceptable values for each element in the array are:<br>
    // <ul>
    // <li>A number (e.g. 100) representing the number of pixel widths to allocate to a
    //     column.
    // <li>A percent (e.g. 20%) representing the percentage of the total form.width to
    //     allocate to a column.
    // <li>"*" (all) to allocate remaining width (form.width minus all specified column
    //     widths). Multiple columns can use "*", in which case remaining width is divided
    //     between all columns marked "*".
    // </ul>
    // <P>
    // Note that if title columns are left at the default +link{titleWidth} or assigned a fixed
    // width, while the others are configured to use the remaining horizontal space (i.e. with a
    // percent or "*" as described above), then care must be taken if you have long titles with
    // no spaces or +link{wrapItemTitles} is false.
    // <P>
    // Depending on the title font and exact column width applied, the title may overflow its
    // assigned column, causing the form itself to overflow.  If the form's parent has
    // +link{canvas.overflow,overflow}: "auto" and the form has width: "100%" or its parent is
    // a +link{Layout} with +link{Layout.hPolicy,hPolicy}: "fill", this could cause a horizontal
    // scrollbar to appear in a situation where it doesn't seem necessary.
    // <P>
    // If the parent's height is just right so that the space taken by the unwanted horizontal
    // scrollbar introduces a vertical scrollbar, this may even lead to oscillating scrollbars
    // on the parent.  To avoid, you must address the original problem of the title overflowing
    // its assigned column, by widening it, using a smaller font, or allowing wrapping to occur.
    //
    // @group formLayout
    // @visibility external
    // @example columnSpanning
    //<
	colWidths:null,
    
    //>	@attr dynamicForm.minColWidth		(number : 20 : IRW)
	// Minimum width of a form column.
	// @group formLayout
    // @visibility external
	//<
	minColWidth:20,

    //>	@attr	dynamicForm.cellSpacing		(number : 0 : [IRW])
    // The amount of empty space, in pixels, between form item cells in the layout grid.
    // @group formLayout
    // @visibility internal
    //<
    
	cellSpacing:0,
    
    //>	@attr dynamicForm.cellPadding		(number : 2 : [IRW])
    // The amount of empty space, in pixels, surrounding each form item within its cell in
    // the layout grid.
    // @group formLayout
    // @visibility external
    //<
	cellPadding:2,
    
    //>	@attr dynamicForm.cellBorder		(number : 0 : [IRW])
    // Width of border for the table that form is drawn in. This is primarily used for debugging
    // form layout.
    // @group formLayout
    // @visibility external
    //<
	cellBorder:0,

    // default height for a table row where there are no specified sizes at all (pixel, '*', or
    // percent)
    defaultRowHeight:22,

    //> @attr DynamicForm.sectionVisibilityMode (VisibilityMode : "multiple" : [IRW])
    // If the form has sections, [implemented as +link{SectionItem}s], this attribute controls
    // whether multiple sections can be expanded at once.
    //
    // @see type:VisibilityMode
    // @see class:SectionItem
    // @group formLayout
    // @visibility external
    //<
    sectionVisibilityMode: "multiple",

    // Embedded widgets
    // --------------------------------------------------------------------------------------------
    // Turn on allowContentAndChildren for Canvas Items.
    // NOTE: this has no actual effect unless a CanvasItem is used
    
    allowContentAndChildren : true,
    separateContentInsertion: true,
    _avoidRedrawFlash:true,
    // necessary because the default determination assumes anything with children doesn't have
    // inherent height
    hasInherentHeight : function () {
        if (this.inherentHeight != null) return this.inherentHeight;
        return (this.overflow == isc.Canvas.VISIBLE || this.overflow == isc.Canvas.CLIP_H);
    },

    // DataBinding
	// --------------------------------------------------------------------------------------------
    //>	@attr	dynamicForm.fieldIdProperty		(String : "name" : IRWA)
	// Name of the column in the fields array that holds the name of the item property that holds
    // the value
	//		@group	data
	//<
	fieldIdProperty:"name",		

    //>	@attr	dynamicForm.titleField		(String : "title" : IRWA)
	// Name of the column in the fields array that holds the name of the title property that holds
    // the title
	//		@group	appearance
	//<
	titleField:"title",

    //>	@attr	dynamicForm.showDetailFields (Boolean : true : IR)
	// For databound forms, whether to show fields marked as detail fields.
	// @visibility external
	//<
    showDetailFields: true,

    //>	@attr dynamicForm.longTextEditorThreshold (number : 255 : IRW)
	// When creating form items for fields with text type data, if the specified length of the
    // field exceeds this threshold we will create form item of type 
    // <code>this.longTextEditorType</code> (a TextAreaItem by default), rather than a simple
    // text item.  Overridden by explicitly specifying <code>editorType</code> for the field. 
	// @group appearance
    // @visibility external    
	//<
	longTextEditorThreshold:255,
    //>	@attr dynamicForm.longTextEditorType (String  : "textArea" : IRW)
	// Name of the Form Item class to use for text fields which exceed the 
    // longTextEditorThreshold for this form. 
	// @group appearance
    // @visibility external
	//<
    longTextEditorType:"textArea",
    
    // Values formatting
    
    //> @attr dynamicForm.dateFormatter (DateDisplayFormat : null : IRW)
    // Default +link{DateDisplayFormat} for Date type values displayed in this form.
    // <P>
    // If some field's value is set to a native Date object, how should it be displayed to the
    // user? If specified this is the default display format to use, and will apply to all fields
    // except those specified as +link{formItem.type,type:"time"} 
    // (See +link{dynamicForm.timeFormatter}).
    // <P>
    // May be overridden at the component level for fields of type <code>datetime</code> via 
    // +link{dynamicForm.datetimeFormatter}.
    // <P>
    // Note that if specified, +link{formItem.dateFormatter} and +link{formItem.timeFormatter}
    // take precedence over the format specified at the component level.
    // <P>
    // If no explicit formatter is specified at the field or component level, dates will be 
    // formatted according to the system-wide
    // +link{DateUtil.setShortDisplayFormat(),short date display format} or 
    // +link{DateUtil.setShortDatetimeDisplayFormat(),short datetime display format} depending
    // on the specified field type.
    // @visibility external
    //<
    
    //> @attr dynamicForm.timeFormatter (TimeDisplayFormat : null : IRW)
    // Default +link{TimeDisplayFormat} for +link{formItem.type,type:"time"} field values displayed
    // in this form.
    // <P>
    // Note that if specified, +link{formItem.dateFormatter} and +link{formItem.timeFormatter}
    // take precedence over the format specified at the component level.
    // <P>
    // If no explicit formatter is specified at the field or component level, time values will be 
    // formatted according to the system-wide
    // +link{Time.setNormalDisplayFormat(),normal time display format}.
    // specified field type.
    // @visibility external
    //<
    
    //> @attr dynamicForm.datetimeFormatter (DateDisplayFormat : null : IRW)
    // Default +link{DateDisplayFormat} for Date type values displayed in this form in fields
    // of type <code>datetime</code>.
    // <P>
    // For datetime fields, this attribute will be used instead of +link{dynamicForm.dateFormatter}
    // when formatting Date values.
    // <P>
    // Note that if specified, +link{formItem.dateFormatter} and +link{formItem.timeFormatter}
    // take precedence over the format specified at the component level.
    // <P>
    // If no explicit formatter is specified at the field or component level, datetime field
    // values will be formatted according to the system-wide
    // +link{DateUtil.setShortDatetimeDisplayFormat(),short datetime display format}.
    // @visibility external
    //<
    
    //>ValuesManager
    
    //> @groupDef formValuesManager
    // Values Manager references.
    //
    // @title Values Manager
    // @visibility external
    //<

    // ValuesManager
    // ----------------------------------------------------------------------------------------
    //>@attr dynamicForm.valuesManager  (ValuesManager | GlobalId : null : [I])
    // If set at init time, this dynamicForm will be created as a member form of the
    // specified valuesManager.  To update the form's valuesManager after init, use the
    // +link{dynamicForm.setValuesManager, form-level setter}, or the 
    // +link{valuesManager.addMember, addMember(form)} /
    // +link{valuesManager.removeMember, removeMember(form)} APIs on 
    // <code>ValuesManager</code>.
    // @see class:ValuesManager
    // @setter dynamicForm.setValuesManager()
    // @visibility external
    // @group formValuesManager
    //<
    
    //>	@method	dynamicForm.setValuesManager()
    // Binds this dynamicForm to a +link{dynamicForm.valuesManager, valuesManager} at runtime.
    // @param valuesManager (ValuesManager | GlobalId) the ValuesManager that controls this
    //                                                 form's values
    // @group formValuesManager
    // @visibility external
    //<
    setValuesManager : function (valuesManager) {
        // if the param is a global ID, get the instance
        if (isc.isA.String(valuesManager)) valuesManager = window[valuesManager];
        // if it's a valuesManager, call addMember() on it, passing this DF instance
        if (isc.isA.ValuesManager(valuesManager)) valuesManager.addMember(this);
        else this.valuesManager = valuesManager;
    },
    //<ValuesManager
    

    // Title Formatting
	// --------------------------------------------------------------------------------------------

    //> @type  TitleOrientation
    // Orientation of titles relative to the FormItem being labeled.  Can be set a the
    // DynamicForm level as a default, or on individual items.
    // 
    // @value  "left"
    // @value  "top"
    // @value  "right"
    // @group formTitles
    // @see DynamicForm.titleOrientation
    // @see FormItem.titleOrientation
    // @visibility external
    //<

    //>	@attr	dynamicForm.titleOrientation    (TitleOrientation : "left" : [IRW])
    // Default orientation for titles for items in this form.  +link{type:TitleOrientation}
    // lists valid options.
    // <P>
    // Note that titles on the left or right take up a cell in tabular
    // +link{group:formLayout,form layouts}, but titles on top do not.
    // 
    //      @group  formTitles
    //      @visibility external
    // @example formLayoutTitles
    //<
    
    //>	@attr dynamicForm.titlePrefix (HTMLString : "" : [IRW])
    // The string pre-pended to the title of every item in this form.  See also +{requiredTitlePrefix} for
    // fields that are required.
    // @group formTitles
    // @visibility external
    //<
	titlePrefix:"",
    
    //>	@attr dynamicForm.rightTitlePrefix (HTMLString : ":&nbsp;" : [IRW])
    // The string pre-pended to the title of an item in this form if its
    // titleOrientation property is set to "right".
    // @group formTitles
    // @visibility external
    //<
	rightTitlePrefix:":&nbsp;",

    //>	@attr dynamicForm.titleSuffix (HTMLString : "&nbsp;:" : [IRW])
    // The string appended to the title of every item in this form.  See also +{requiredTitleSuffix} for
    // fields that are required.
    // @group formTitles
    // @visibility external
    //<
	titleSuffix:"&nbsp;:",
    
    //> @attr dynamicForm.rightTitleSuffix (HTMLString : "" : [IRW])
    // The string appended to the title of an item in this form if its titleOrientation
    // property is set to "right".
    // @group formTitles
    // @visibility external
    //<
	rightTitleSuffix:"",

    //>	@attr	dynamicForm.titleWidth		(number | "*": 100 : [IRW])
    //          The width in pixels allocated to the title of every item in this form.  If you
    //          don't specify explicit +link{attr:dynamicForm.colWidths}, you can set this
    //          value to the string "*" to divide the usable space evenly between titles and
    //          fields.
    //      @group  formTitles
    //      @visibility external
    //<
	titleWidth:100,

    //> @attr dynamicForm.clipItemTitles (boolean : false : [IRW])
    // Should the titles for form items be clipped if they are too large for the available 
    // space?
    // <p>
    // Can be overridden for individual items via +link{FormItem.clipTitle}.
    // @visibility external
    //<
    clipItemTitles:false,

    //>	@attr	dynamicForm.wrapItemTitles (boolean : null : [IRW])
    // Whether titles for form items should wrap.  If not specified, titles will wrap by
    // default.  Can be overridden for individual items via +link{formItem.wrapTitle}
    // @visibility external
    // @group formTitles    
    //<
//    wrapItemTitles:null,

    //> @attr   dynamicForm.showInlineErrors (Boolean : true : [IRW])
    // If true, field errors are written into the form next to the item(s) where the errors
    // occurred.  Errors may appear as text or just an icon (via +link{showErrorText}:false).
    // <P>
    // If false, errors are written at the top of the form.
    // <P>
    // To do some other kind of error display, override +link{showErrors()}.
    //
    // @group validation
    // @visibility external
    //<
    showInlineErrors: true,
    
    // customization of inline errors appearance on items
    
    // showErrorIcons doc contains an overview of error styling to be reused as the docs for
    // showErrorText / showErrorStyle as well
    //> @attr dynamicForm.showErrorIcons (Boolean : true : IRW)
    // +link{dynamicForm.showErrorIcons,showErrorIcons}, 
    // +link{dynamicForm.showErrorText,showErrorText}, +link{dynamicForm.errorOrientation,errorOrientation},
    // and +link{dynamicForm.showErrorStyle,showErrorStyle} control how validation errors are
    // displayed when they are displayed inline in the form (next to the form item where there
    // is a validation error).  To instead display all errors at the top of the form, set
    // +link{dynamicForm.showInlineErrors,showInlineErrors}:false.
    // <P>
    // <code>showErrorIcons</code>, <code>showErrorText</code>, <code>errorOrientation</code>
    // and <code>showErrorStyle</code>
    // are all boolean properties, and can be set on a DynamicForm to control the behavior
    // form-wide, or set on individual FormItems.  
    // <P>
    // The HTML displayed next to a form item with errors is generated by 
    // +link{FormItem.getErrorHTML()}.
    // The default implementation of that method respects <code>showErrorIcons</code> and
    // <code>showErrorText</code> as follows:
    // <P>
    // <code>showErrorIcons</code>, or <code>showErrorIcon</code> at the FormItem level controls
    // whether an error icon should appear next to fields which have validation errors.  The icon's
    // appearance is governed by +link{FormItem.errorIconSrc}, +link{FormItem.errorIconWidth} and
    // +link{FormItem.errorIconHeight}
    // <P>
    // <code>showErrorText</code> determines whether the text of the validation error should be
    // displayed next to fields which have validation errors. The attribute
    // +link{dynamicForm.showTitlesWithErrorMessages} may be set to prefix error messages with the 
    // form item's title + <code>":"</code> (may be desired if the item has 
    // +link{formItem.showTitle} set to false).<br>
    // If <code>showErrorText</code> is unset, the error text will be shown if
    // +link{dynamicForm.linearMode} is true (or +link{dynamicForm.linearOnMobile} is true for
    // mobile devices), otherwise it will not be shown.
    // <P>
    // In addition to this:
    // <P>
    // +link{dynamicForm.errorOrientation} controls where the error HTML should appear relative 
    // to form items. Therefore the combination of +link{showErrorText}<code>:false</code> and
    // +link{errorOrientation}<code>:"left"</code> creates a compact validation error display
    // consisting of just an icon, to the left of the item with the error message
    // available via a hover (similar appearance to ListGrid validation error display).<br>
    // If <code>errorOrientation</code> is unset, the error orientation will default to "top" 
    // if +link{dynamicForm.linearMode} is enabled (or +link{dynamicForm.linearOnMobile} is true
    // for mobile devices) and error text is not showing, "left" otherwise.
    // <P>
    // <code>showErrorStyle</code> determines whether fields  with validation
    // errors should have special styling applied to them. Error styling is achieved by
    // applying suffixes to existing styling applied to various parts of the form item.
    // See +link{type:FormItemBaseStyle}  for more on this.
    //
    // @group  validation
    // @visibility external
    //<    
    showErrorIcons: true,
    
    //> @attr dynamicForm.showErrorText (Boolean : false : IRW)
    // @include dynamicForm.showErrorIcons
    // @group  validation
    // @visibility external
    //< 
    showErrorText:null,
    shouldShowErrorText : function () {
        if (this.showErrorText != null) return this.showErrorText;
        if (this.linearMode && this.showInlineErrors) return true;
        return false;
    },
    
    //> @attr dynamicForm.showErrorStyle (Boolean : true : IRW)
    // @include dynamicForm.showErrorIcons
    // @group  validation
    // @visibility external
    //<    
    showErrorStyle: true,
    
    //> @attr dynamicForm.errorOrientation (Align : "left" : IRW)
    // @include dynamicForm.showErrorIcons
    // @group validation, appearance
    // @visibility external
    //<
    errorOrientation: null,
    getErrorOrientation : function () {
        if (this.errorOrientation != null) {
            return this.errorOrientation;
        }
        
        if (this.linearMode && this.shouldShowErrorText()) return "top";
        return "left";

    },
    
    // Enable customization of the error item
    errorItemDefaults : {
        type:"blurb",
        wrap:true,
        showIf:function () {
            return !this.form.showInlineErrors && this.form.hasErrors(); 
        },
        defaultDynamicValue : function (item,form,values) {
            return form.getErrorsHTML(form.getErrors());
        }
    },
    //> @attr dynamicForm.errorItemProperties (Object : null : [IRA])
    // If +link{dynamicForm.showInlineErrors} is false we show all errors for the form item in 
    // a single item rendered at the top of the form.<br>
    // This attribute contains a properties block for this item.
    // @group validation
    // @visibility external
    //<
    //errorItemProperties : {},
    
    //> @attr dynamicForm.errorItemCellStyle (String  : "formCellError" : [IR])
    // If +link{dynamicForm.showInlineErrors} is false we show all errors for the form item in 
    // a single item rendered at the top of the form.<br>
    // This attribute specifies the cellStyle to apply to this item.
    // @group validation
    // @visibility external
    //<
    errorItemCellStyle:"formCellError",

    //> @attr dynamicForm.errorsPreamble (HTMLString :"The following errors were found:" : IR)
    // If +link{dynamicForm.showInlineErrors} is <code>false</code>, all errors for the items
    // in the form are rendered as a single item at the top of the form. This attribute specifies
    // an introductory message rendered out before the individual error messages.
    // @group validation, i18nMessages
    // @visibility external
    //<
    errorsPreamble:"The following errors were found:",

    //>	@attr	dynamicForm.showTitlesWithErrorMessages     (Boolean : false : [IRW])
    //          Indicates whether on validation failure, the error message displayed to the
    //          user should be pre-pended with the title for the item.
    //      @group  validation
    //      @visibility external
    //<
    // This property is referenced by 'formItem.getErrorHTML()'
//    showTitlesWithErrorMessages : false,

    //>	@attr dynamicForm.hiliteRequiredFields (Boolean : true : IRW)
    // Indicates whether the titles of required items in this form should use the special
    // prefix and suffix specified by the next two properties, instead of the standard
    // prefix and suffix.
    // @group formTitles
    // @visibility external
    //<
	hiliteRequiredFields:true,
    

    // override setHoverFocusKey() and propagate the new value to items that have a child canvas
    setHoverFocusKey : function (hoverFocusKey) {
        this.Super("setHoverFocusKey", arguments);
        if (!this.items) return;
        for (var i=0; i<this.items.length; i++) {
            // check for underscore-prefixed method - this is present on CanvasItems and pushes 
            // the new value to the child canvas, unless the item has a local value
            if (this.items[i]._setHoverFocusKey) {
                this.items[i]._setHoverFocusKey(hoverFocusKey);
            }
        }
    },

    // override setHoverPersist() and propagate the new value to items that have a child canvas
    setHoverPersist : function (hoverPersist) {
        this.hoverPersist = hoverPersist;
        if (!this.items) return;
        for (var i=0; i<this.items.length; i++) {
            if (this.items[i]._setHoverPersist) this.items[i]._setHoverPersist(hoverPersist);
        }
    },

    
    //>	@attr dynamicForm.requiredTitlePrefix (HTMLString : "<b>" : IRW)
    // The string pre-pended to the title of every required item in this form if
    // +link{hiliteRequiredFields} is true.
    // @group formTitles
    // @visibility external
    //<
	requiredTitlePrefix:"<b>",
    
    //>	@attr dynamicForm.requiredRightTitlePrefix (HTMLString : "<b>:&nbsp;" : IRW)
    // The string pre-pended to the title of every required item in this form if
    // +link{hiliteRequiredFields} is true and the +link{titleOrientation} property is set to "right".
    // @group formTitles
    // @visibility external
    //<
	requiredRightTitlePrefix:"<b>:&nbsp;",

    //>	@attr dynamicForm.requiredTitleSuffix (HTMLString : "&nbsp;:</b>" : [IRW])
    // The string appended to the title of every required item in this form if
    // +link{hiliteRequiredFields} is true.                                        
    // @group  formTitles
    // @visibility external
    //<
	requiredTitleSuffix:"&nbsp;:</b>",
    
    //>	@attr dynamicForm.requiredRightTitleSuffix (HTMLString : "</b>" : [IRW])
    // The string appended to the title of every required item in this form if
    // +link{hiliteRequiredFields} is true and the +link{titleOrientation} property is set to "right".
    // @group formTitles
    // @visibility external
    //<
	requiredRightTitleSuffix:"</b>",

    //> @attr dynamicForm.requiredMessage (HTMLString : null : [IRW])
    // The required message for required field errors.
    // @group formTitles
    // @visibility external
    //<


    // Generic item defaults
    // ---------------------------------------------------------------------------------------

    //> @attr dynamicForm.canEdit (Boolean : null : IRWA)
    // If set to <code>false</code>, the form will be marked read-only. A widget on the form
    // is editable if either (1) beginning with the widget and continuing up the containment
    // hierarchy, including the form, the first widget to have a non-null <code>canEdit</code>
    // attribute has canEdit:true, or (2) neither the widget nor any parent has a non-null
    // <code>canEdit</code> attribute. This setting allows you to enable or disable the default
    // editability of the form's items at one time.
    // <p>
    // This setting differs from the enabled/disabled state in that most form items will
    // allow copying of the contents while read-only but do not while disabled.
    // <p>
    // Note that a form is considered editable if <code>canEdit</code> is null (default) or
    // <code>true</code>.
    //
    // <smartgwt><P>Note that this property may validly be <code>null</code> as a distinct state
    // from <code>false</code>.  See +link{fieldIsEditable()} for an API that will always
    // return <code>true</code> or <code>false</code> and give a definitive answer as to whether
    // editing is possible.</smartgwt>
    //
    // @see DynamicForm.readOnlyDisplay
    // @group readOnly
    // @visibility external
    //<

    //> @type ReadOnlyDisplayAppearance
    // Dictates the appearance of form items when +link{FormItem.canEdit} is set to
    // <code>false</code>.
    //
    // @value "static" Item value should appear within the form as a static block of text,
    // similar to the default appearance of a +link{StaticTextItem}. This appearance may be
    // modified via +link{FormItem.readOnlyTextBoxStyle} and +link{formItem.clipStaticValue}.
    // @value "readOnly" Item should appear unchanged, but user interaction to edit the item
    // will be disallowed. Note that some interactions will be allowed, such as selecting text
    // within a read-only +link{TextItem} for copy and paste. Exact implementation may vary by
    // form item type.
    // @value "disabled" Item will appear disabled.
    //
    // @see attr:DynamicForm.readOnlyDisplay
    // @see attr:FormItem.readOnlyDisplay
    // @visibility external
    //<

    //> @attr dynamicForm.readOnlyDisplay (ReadOnlyDisplayAppearance : "readOnly" : IRW)
    // If +link{DynamicForm.canEdit} is set to <code>false</code>, how should the items in this
    // form be displayed to the user?
    // <p>
    // Can be overridden via +link{FormItem.readOnlyDisplay} on individual form items.
    // @group appearance
    // @group readOnly
    // @visibility external
    //<
    readOnlyDisplay: "readOnly",

    //> @attr dynamicForm.readOnlyTextBoxStyle (FormItemBaseStyle : "staticTextItem" : IRW)
    // Default +link{FormItem.readOnlyTextBoxStyle} setting for items in this form.
    // @visibility external
    //<
    readOnlyTextBoxStyle: "staticTextItem",

    //> @attr dynamicForm.showImageAsURL (boolean : false : IRW)
    // For fields of +link{type:FormItemType,type:"image"}, if the field is non editable, and
    // being displayed with +link{formItem.readOnlyDisplay,readOnlyDisplay:"static"}, should
    // the value (URL) be displayed as text, or should an image be rendered?
    // <P>
    // May be overridden for individual items via +link{formItem.showImageAsURL}.
    // @visibility external
    //<
    showImageAsURL:false,

    //> @attr dynamicForm.clipStaticValue (Boolean : null : IR)
    // Default +link{FormItem.clipStaticValue} setting for items in this form. When unset, this
    // is equivalent to <code>false</code>.
    // @visibility external
    //<
    //clipStaticValue: null,

    //> @attr dynamicForm.showDeletions (Boolean : null : IRA)
    // Default +link{FormItem.showDeletions} setting for items in this form.
    // @visibility external
    //<
    //showDeletions: null,

    //> @attr dynamicForm.wrapHintText (Boolean : true : IR)
    // Should items within this form that are showing a +link{FormItem.hint} have the hint text
    // wrap? May be overridden at the item level via +link{FormItem.wrapHintText}. If
    // <code>wrapHintText</code> is unset on both the form and item, then the default behavior
    // is not wrapping the hint.
    // <p>
    // This setting does not apply to hints that are +link{TextItem.showHintInField,shown in field}.
    // @see DynamicForm.minHintWidth
    // @visibility external
    //<
    wrapHintText: true,

    //> @attr dynamicForm.minHintWidth (Integer : 80 : IR)
    // Minimum horizontal space made available for +link{formItem.hint} text.
    // Typically this reflects how much space the hint text takes up before it wraps.
    // May be overridden at the item level via +link{FormItem.minHintWidth}.
    // <p>
    // This setting does not apply to hints that are +link{TextItem.showHintInField,shown in field}.
    // @see DynamicForm.wrapHintText
    // @visibility external
    //<
    minHintWidth: 80,


    // Hovers
    // ---------------------------------------------------------------------------------------
    
    // Turn off standard form item hover handling - we're doing our own custom handling instead.
    canHover:false,
    
    //> @attr dynamicForm.itemHoverDelay (number : 500 : [IRW])
    // If the user rolls over an item, how long a delay before we fire any hover action / show
    // a hover for that item?
    // @see FormItem.hoverDelay
    // @group Hovers
    // @visibility external
    //<
    itemHoverDelay:500,
    
    //> @attr dynamicForm.itemHoverWidth (Number | String : null : [IRW])
    // A default width for hovers shown for items
    // @see FormItem.hoverWidth
    // @group Hovers
    // @visibility external
    // @example itemHoverHTML
    //<
    
    //> @attr dynamicForm.itemHoverHeight (Number | String : null : [IRW])
    // A default height for hovers shown for items
    // @see FormItem.hoverHeight
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr dynamicForm.itemHoverAlign (Alignment  : null : [IRW])
    // Text alignment for hovers shown for items
    // @see FormItem.hoverAlign
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr dynamicForm.itemHoverVAlign (Number | String : null : [IRW])
    // Vertical text alignment for hovers shown for items
    // @see FormItem.hoverVAlign
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr dynamicForm.itemHoverStyle (CSSStyleName  : "formHover" : [IRW])
    // CSS Style for hovers shown for items
    // @see FormItem.hoverStyle
    // @group Hovers
    // @visibility external
    //<
    itemHoverStyle:"formHover",
    
    //> @attr dynamicForm.itemHoverOpacity (number : null : [IRW])
    // Opacity for hovers shown for items
    // @see FormItem.hoverOpacity
    // @group Hovers
    // @visibility external
    //<
    
    //> @attr dynamicForm.itemHoverRect (Object : null : [IRWA])
    // Object of the form <code>{left:[value], top:[value], width:[value], height:[value]}</code>
    // for specifying an explicit position for the item hovers to appear.
    // @see FormItem.hoverRect
    // @group Hovers
    // @visibility internal
    //<
    

    //> @attr dynamicForm.showOldValueInHover (Boolean : null : IRWA)
    // Default setting for the form items' +link{FormItem.showOldValueInHover} setting.
    // @visibility external
    //<

    //> @attr dynamicForm.originalValueMessage (HTMLString : "Original value: $value" : IRWA)
    // Default template HTML string when an item does not set its own +link{FormItem.originalValueMessage}.
    // <p>
    // Variables in the template are substituted as follows:
    // <table border="1">
    // <tr>
    //   <th>Variable</th>
    //   <th>Substitution</th>
    // </tr>
    // <tr>
    //   <td><code>$value</code></td>
    //   <td>The item's old value as stored in the
    //       <smartclient>object</smartclient><smartgwt>map</smartgwt>
    //       returned by +link{method:getOldValues()}.</td>
    // </tr>
    // <tr>
    //   <td><code>$newValue</code></td>
    //   <td>The item's new value.</td>
    // </tr>
    // </table>
    // <p>
    // For <code>$value</code> and <code>$newValue</code>, any formatters or stored/display value
    // mapping will be applied.
    // @group i18nMessages
    // @visibility external
    //<
    originalValueMessage: "Original value: $value",

    // Sizing
	// --------------------------------------------------------------------------------------------

    // we can't perfectly control the drawn sizes of all form elements, hence by default we
    // show overflow.  Our defaultHeight acts as a minimum.
	overflow:isc.Canvas.VISIBLE,
    defaultHeight:20,
	
    // Validation
	// --------------------------------------------------------------------------------------------
    //>	@attr	dynamicForm.errors		(Object : null : [IRW])
    //          A property list of itemName:errorMessage pairs, specifying the set of error messages
    //          displayed with the corresponding form elements. Each errorMessage may be either a
    //          single string or an array of strings, for example:<br><br>
    //          <code>{fieldName:errors, fieldName:errors}</code><br><br>
    //          where each <code>errors</code> object will be either an error message string or an array
    //          of error message strings.
    // @group validation
    //      @visibility external
    //<

    //> @attr dynamicForm.validateOnChange (Boolean : false : IRW)
    // If true, form fields will be validated when each item's "change" handler is fired
    // as well as when the entire form is submitted or validated.
    // <p>
    // Note that this property can also be set at the item level or on each validator
    // to enable finer granularity validation in response to user interaction.
    // If true at the form or field level, validators not explicitly set with
    // <code>validateOnChange:false</code> will be fired on change - displaying errors and
    // rejecting the change on validation failure.
    // @group validation
    // @visibility external
    // @see FormItem.validateOnChange
    //<
    
	validateOnChange:false,
    
    //>@attr dynamicForm.rejectInvalidValueOnChange (boolean : null : IRWA)
    // If validateOnChange is true, and validation fails for an item on change, with no suggested
    // value, should we revert to the previous value, or continue to display the bad value entered
    // by the user. May be set at the item or form level.
    // @visibility external
    //<
    // Introduced for back-compat: pre 7.0beta2 this was the default behavior, so enable this flag
    // at the item or form level if required for backcompat.
    //rejectInvalidValueOnChange:null,

    //> @attr dynamicForm.unknownErrorMessage (HTMLString : "Invalid value" : [IRW])
    // The error message for a failed validator that does not specify its own errorMessage.
    // @group validation, i18nMessages
    // @visibility external
    //<
    // Inherited from DBC
//	unknownErrorMessage : "Invalid value",

    //> @attr dynamicForm.noErrorDetailsMessage (String : "Error during validation; no error details were provided" : IRW)
    // A message to display to the user if server-side validation fails with an error but the
    // server did not provide an error message
    // @group validation, i18nMessages
    // @visibility external
    //< 
    // Inherited from DBC
//  noErrorDetailsMessage: "Error during validation; no error details were provided",
    
    //> @attr dynamicForm.validateOnExit (Boolean : false : IRW)
    // If true, form items will be validated when each item's "editorExit" handler is fired
    // as well as when the entire form is submitted or validated.
    // <P>
    // Note that this property can also be set at the item level to enable finer granularity
    // validation in response to user interaction - if true at either level, validation
    // will occur on editorExit.
    // @visibility external
    // @see formItem.validateOnExit
    //<	

    //> @attr dynamicForm.implicitSave (Boolean : false : IRW)
    // When true, indicates that changes to items in this form will be automatically saved on a 
    // +link{dynamicForm.implicitSaveDelay, delay}, as well as when the entire form is
    // submitted.  Unless +link{dynamicForm.implicitSaveOnBlur, form.implicitSaveOnBlur} is set 
    // to false, changes will also be automatically saved on editorExit for each item.  This
    // attribute can also be set directly on FormItems.
    // @visibility external
    //<	

    //> @attr dynamicForm.implicitSaveOnBlur (Boolean : false : IRW)
    // If true, form item values will be automatically saved when each item's "editorExit" 
    // handler is fired as well as on a delay and when the entire form is submitted.  This
    // attribute can also be set directly on FormItems.
    // @visibility external
    //<	

    //> @attr dynamicForm.implicitSaveDelay (number : 2000 : IRW)
    // When +link{dynamicForm.implicitSave, implicitSave} is true, this attribute dictates the 
    // millisecond delay after which form items are automatically saved during editing.
    // @visibility external
    //<
    implicitSaveDelay: 2000,

    //> @attr dynamicForm.stopOnError (boolean : null : IR)
    // Indicates that if validation fails, the user should not be allowed to exit
    // the field - focus will be forced back into the field until the error is corrected.
    // <p>
    // Enabling this property also implies +link{FormItem.validateOnExit} is automatically
    // enabled. If there are server-based validators on this item, setting this property
    // also implies that +link{FormItem.synchronousValidation} is forced on.
    // 
    // @visibility external
    //<

    //> @attr  dynamicForm.synchronousValidation (Boolean : false : IR)
    // If enabled, whenever validation is triggered and a request to the server is required,
    // user interactivity will be blocked until the request returns. Can be set for the entire
    // form or individual FormItems.
    // <p>
    // If false, the form will try to avoid blocking user interaction until it is strictly
    // required. That is until the user attempts to use a FormItem whose state could be
    // affected by a server request that has not yet returned.
    //
    // @visibility external
    //<
    synchronousValidation:false,

    // Focus
	// --------------------------------------------------------------------------------------------

    //>	@attr	dynamicForm.autoFocus		(Boolean : false : IRW)
	// If true, when the form is drawn, focus will automatically be put into the first focusable
    // element in the form.<br>
    // Note that to put focus in a different item you can explicitly call 
    // <code>dynamicForm.focusInItem(<i>itemName</i>)</code>
	// @group focus	
    // @visibility external
    // @see focusInItem()
	//<
    autoFocus:false,
	
	//> @attr dynamicForm.autoFocusOnError (Boolean : true : IRW)
	// If true, when +link{dynamicForm.validate(),validation} fails focus will automatically
	// be put into the first focusable field which failed validation.
	// @group focus
	// @visibility external
	//<
	autoFocusOnError:true,

    //>	@attr	dynamicForm.selectOnFocus	(Boolean : false : IRW)
    // If this property is set to true, whenever a text-based field in this form 
    // (+link{class:TextItem}, +link{class:TextAreaItem}) is given focus programmatically 
    // (see +link{DynamicForm.focusInItem()}), all text within the item will be selected.
    // <P>
    // Note that this flag affects only programmatic focus.  It's the normal behavior of text
    // fields to select all text if the user navigates into them via keyboard, or if the user
    // navigates via mouse, to place the text insertion point at the mouse click, and
    // SmartClient preserves these behaviors.  <code>selectOnFocus</code> is only needed for
    // cases like a form within a pop-up dialog that should have the first field selected.
    // <P>
    // If you also want the value to be selected when the user clicks on the field, set 
    // +link{dynamicForm.selectOnClick, selectOnClick} instead.
    // <P>
    // If <code>selectOnFocus</code> is false, the selection is not modified on focus - any
    // previous selection within the item will be maintained.
    // <P>
    // May be overridden at the form item level via +link{formItem.selectOnFocus}.
    //
	// @group focus	
    // @visibility external
	//<
	selectOnFocus:false,

    //>	@attr	dynamicForm.selectOnClick	(Boolean : false : IRW)
    // If this property is set to true, whenever a text-based field in this form 
    // (+link{class:TextItem}, +link{class:TextAreaItem}) is given focus - whether
    // programmatically (see +link{DynamicForm.focusInItem()}), or via a mouse click, all text
    // within the item will be selected.
    // <P>
    // If you only want the value to be selected when on programmatic focus or keyboard
    // navigation (this is the native browser behavior), set 
    // +link{dynamicForm.selectOnFocus, selectOnFocus} instead.
    // <P>
    // May be overridden at the form item level via +link{formItem.selectOnClick}.
    //
	// @group focus	
    // @visibility external
	//<
	selectOnClick:false,

    //> @attr   dynamicForm.canFocus    (Boolean : true : IRWA)
    // DynamicForms are considered to have focus if any of their form items have focus.
    // Note that setting <code>dynamicForm.canFocus</code> to false will have no effect on
    // whether form items within the form may receive focus. This property will only govern
    // whether the form may receive focus if the form contains no focusable items.
    // @group focus
    // @visibility external
    //<
    // Focus behavior for forms is a little different than for other elements.
    // o _canFocus() always returns true if the form contains any focusable items
    //   (required to allow programmatic focus() on the form / proper keyboard event handling)
    // o Set _useNativeTabIndex to false - we don't want the form to ever have native focus (instead
    //   native focus will always go to the form items).
    //   Note - we don't want to set tabIndex to -1, as the form items will default to having their
    //   form's tabIndex as their own tabIndex.
    // o Set _useFocusProxy to false - same reason as setting _useNativeTabIndex to false.
    // o Override focus() to call focusInItem() (below)
    // o Override _focusChanged() to blur the focus item on a blur() call (below)
    // - see also comments on form item tabIndex in formItem.js
    canFocus : true,
    _useNativeTabIndex:false,
    _useFocusProxy:false,
        
    // AutoComplete
	// --------------------------------------------------------------------------------------------

    //> @type AutoComplete
    // AutoComplete behavior for +link{formItem,FormItems}.
    // @value "none" Disable browser autoComplete. Note that some browsers will disregard
    //    this setting and still perform native autoComplete for certain items - typically
    //    only for log in / password forms. See the discussion +link{formItem.autoComplete,here}.
    // @value "native" Allow native browser autoComplete.
    // @group autoComplete
    // @visibility external
    //<
    // @value "smart" Enable SmartClient autoComplete feature.  Suppresses browser's
	//                built-in autoComplete feature where applicable.
	
    //>	@attr	dynamicForm.autoComplete   (AutoComplete : "none" : IRW)
    // Should this form allow browser auto-completion of its items' values?     
    // Applies only to items based on native HTML form elements (+link{TextItem},
    // +link{PasswordItem}, etc), and will only have a user-visible impact for browsers
    // where native autoComplete behavior is actually supported and enabled via user settings.
    // <P>
    // This property may be explicitly specified per item via +link{formItem.autoComplete}.
    // <P>
    // Note that even with this value set to <code>"none"</code>, native browser 
    // auto-completion may occur for log in forms (forms containing username and 
    // +link{PasswordItem,password} fields). This behavior varies by browser, and is
    // a result of an 
    // +externalLink{https://www.google.com/search?q=password+ignores+autocomplete+off,intentional change by some browser developers}
    // to disregard the HTML setting <i>autocomplete=off</i> for password items or
    // log-in forms.
    //
    // @see formItem.autoComplete
    // @group autoComplete
    // @visibility external
    //<
    
    autoComplete:"none",

    //>	@attr	dynamicForm.uniqueMatch   (boolean : true : IRW)
    // When +link{formItem.autoComplete} is set to <code>"smart"</code>, 
    // whether to offer only unique matches to the user.
    // <p>
    // Can be individually enabled per TextItem, or if set for the form as a whole, can
    // be set differently for individual items.
    //
    // @see formItem.uniqueMatch
    // @group autoComplete
    // @visibility autoComplete
    //<
    uniqueMatch:true,
    
    
    // Spellcheck:
    //>@attr    DynamicForm.browserSpellCheck   (Boolean : true : IRW)
    // If this browser has a 'spellCheck' feature for text-based form item elements, should
    // it be used for items in this form? Can be overridden at the item level via 
    // +link{FormItem.browserSpellCheck}
    // <P>
    // Notes:<br>
    // - this property only applies to text based items such as TextItem and TextAreaItem.<br>
    // - this property is not supported on all browsers.
    //
    // @see formItem.browserSpellCheck
    // @visibility external
    //<
    
    browserSpellCheck:true,
    
    // Direct Submit
    // --------------------------------------------------------------------------------------------
    //>	@attr dynamicForm.validationURL		(URL : null : IRW)
    // validationURL can be set to do server-side validation against a different URL from where
    // the form will ultimately save, as part of an incremental upgrade strategy for
    // Struts-like applications.  
    // <P>
    // If set, calling +link{method:DynamicForm.submit()} causes an RPC to be sent to this URL to
    // perform server-side validation of the form values.  If the validation fails, the
    // validation errors returned by the server are rendered in the form.  If the validation
    // succeeds, the form is submitted to the URL specified by +link{attr:DynamicForm.action}.
    // <p>
    // The form values are available on the server as request parameters (just like a normal form
    // submit) and also as the values of a DSRequest sent as an RPC alongside the normal
    // submit.
    // <p>
    // The expected response to this request is a DSResponse sent via the RPC mechanism.  If
    // validation is successful, an empty response with the STATUS_SUCCESS status code is
    // sufficient.  If there are validation errors, the DSResponse should have the status set to 
    // STATUS_VALIDATION_ERROR and the errors should be set on the response via the
    // addError()/setErrorReport() API on DSResponse.  See the javadoc for DSResponse for
    // details.
    //
    // @group validation
    // @visibility external
    // @see DynamicForm.saveData()
    // @see DynamicForm.submit()
    //<

    //>	@attr dynamicForm.disableValidation		(boolean : null : IRW)
    //
    // If set to true, client-side validators will not run on the form when validate() is
    // called.  Server-side validators (if any) will still run on attempted save.
    //
    // @group validation
    // @visibility external
    // @see DynamicForm.saveData()
    // @see DynamicForm.submit()
    //<

    //>	@attr	dynamicForm.action		(URL : "#" : IRW)
    // The URL to which the form will submit its values.
    // <p>
    // <b>NOTE:</b> this is used only in the very rare case that a form is used to submit data
    // directly to a URL.  Normal server contact is through RPCManager.<br>
    // See +link{DynamicForm.canSubmit} for more on this.
    //
    // @see group:operations
    // @see class:RPCManager
    //
    //      @visibility external
    //      @group  submitting
    //<
    //	XXX SHOULD SUPPORT [APP], [ISOMORPHIC], etc. special directories
    // Note: if this property is modified from the class default, and saveData() is called, 
    // the rpcManager code will perform its request as a direct submission to the action URL 
    // by setting request.directSubmit
    action:"#",

    //>	@attr	dynamicForm.target		(String : null : IRWA)
    // The name of a window or frame that will receive the results returned by the form's
    // action. The default null indicates to use the current frame.
    // <p>
    // <b>NOTE:</b> this is used only in the very rare case that a form is used to submit data
    // directly to a URL.  Normal server contact is through
    // +link{group:dataBoundComponentMethods,DataBound Component Methods}.
    //      @group  submitting
    //      @visibility external
    //<
    
    //>	@attr	dynamicForm.method		(FormMethod : isc.DynamicForm.POST : [IRW])
    // The mechanism by which form data is sent to the action URL. See FormMethod type
    // for details.
    // <p>
    // <b>NOTE:</b> this is used only in the very rare case that a form is used to submit data
    // directly to a URL.  Normal server contact is through 
    // +link{group:dataBoundComponentMethods,DataBound Component Methods}.
    //      @group  submitting
    //      @visibility external
    //<
	method:isc.DynamicForm.POST,
    
	//>	@attr	dynamicForm.encoding		(Encoding : DynamicForm.NORMAL : IRWA)
	// encoding for the form, use MULTIPART_ENCODING for file upload forms
	// @group submitting
    // @visibility external
	//<
	encoding:isc.DynamicForm.NORMAL_ENCODING,

    //>	@attr	dynamicForm.canSubmit		(Boolean : false : IRWA)
    // Governs whether this form will be used to perform a standard HTML form submission.
    // Note that if true, +link{DynamicForm.submit()} will perform a native HTML submission
    // to the specified +link{DynamicForm.action} URL.<br>
    // Wherever possible we strongly recommend using the 
    // +link{group:dataBoundComponentMethods,DataBound Component Methods} to send data to
    // the server as they provide a far more sophisticated interface, with built in 
    // options for server validation, required fields, etc.<br>
    // @group	submitting
    // @visibility external
	//<
    // Defaulted to false, as we usually do not want direct submission behavior.
    // Note: if true, and saveData() is called, the rpcManager code will perform its request
    // as a direct submission to the action URL by setting request.directSubmit

    // whether to write the <form> tag
    
    writeFormTag:true,


    //> @attr   dynamicForm.saveOnEnter (Boolean : false :IRW)
    // If <code>true</code>, when the user hits the Enter key while focused in a text-item in
    // this form, we automatically submit the form to the server using the 
    // +link{dynamicForm.submit()} method.
    // @visibility external
    // @group submitting
    //<

    //> @attr dynamicForm.revertValueKey (KeyIdentifier : null : IR)
    // Keyboard shortcut that causes the value of the currently focused form item to be reverted
    // to whatever value would be shown if +link{DynamicForm.resetValues()} were called.
    // @example pendingValues
    // @visibility external
    //<


    //>	@attr	dynamicForm.autoSendTarget		(boolean : false : IRWA)
	// Should we send the form target name to the server automatically?
	//		@group	submitting
	//<
	// if autoSendTarget is true, we automatically add a hidden field to the form that tells the
    // server the name of the target the form was submitting to.  This is useful for
    // re-authentication purposes.

    //>	@attr	dynamicForm.autoSendTargetFieldName		(String : "__target__" : IRWA)
	// Name of the field in which the form target will be set
	//		@group	submitting
	//<
	autoSendTargetFieldName:"__target__",

    // useNativeSelectItems
    // Determines whether items of type "select" or "SelectItem" should be rendered as 
    // our ISC SelectItems or NativeSelectItems
    
    useNativeSelectItems:false,

    //> @attr dynamicForm.operator (OperatorId : "and" : IR)
    // When +link{formItem.operator} has been set for any +link{FormItem} in this form, what
    // logical operator should be applied across the +link{Criterion,criteria} produced by the form
    // items?  Only applicable to forms that have a +link{DataBoundComponent.dataSource,dataSource}.
    //
    // @visibility external
    //<
    operator: "and",

    //> @attr dynamicForm.showComplexFieldsRecursively (Boolean : null : IR)
    // If set, this <code>DynamicForm</code> will set both 
    // +link{DataBoundComponent.showComplexFields,showComplexFields} and 
    // <code>showComplexFieldsRecursively</code> on any nested component used for showing/editing
    // a complex field.  Thus any of this form's items that handle complex fields will themselves
    // also show complex fields.  This allows for handling of field structures of any complexity.
    // <p>
    // If set, this value automatically sets +link{DataBoundComponent.showComplexFields,showComplexFields}
    // as well.
    //
    // @visibility external
    //<
    
    //> @attr dynamicForm.nestedEditorType (String : "NestedEditorItem" : IRW)
    // +link{class:FormItem} class to use for any singular (ie, non-list) complex fields 
    // on this DynamicForm.
    //
    // @see nestedListEditorType
    // @visibility external
    //<
    nestedEditorType: "NestedEditorItem",
    
    //> @attr dynamicForm.nestedListEditorType (String : "NestedListEditorItem" : IRW)
    // +link{class:FormItem} class to use for any list-type complex fields on this DynamicForm.
    // List-type fields are denoted by marking them <code>multiple: true</code> in the 
    // DataSource.
    //
    // @see nestedEditorType
    // @visibility external
    //<
    nestedListEditorType: "NestedListEditorItem",

    canDropItems: false,
    canAddColumns: true,

    //> @attr dynamicForm.showPending (Boolean : null : IRA)
    // This property applies to all of the items that a form has, and works according to 
    // +link{FormItem.showPending}. <P>
    // Also, in a form with showPending:true, an individual +link{FormItem} can set 
    // showPending:false and vice versa.
    // @visibility external
    //<
    showPending:null
    
    //> @attr dynamicForm.dataFetchMode (FetchMode : "paged" : IRW)
    // @include dataBoundComponent.dataFetchMode
    //<

    //> @attr dynamicForm.dataSource (DataSource | ID : null : IRW)
    // @include dataBoundComponent.dataSource
    //<

    //> @attr dynamicForm.defaultSearchOperator (OperatorId : null : IR)
    // Default +link{type:OperatorId,search operator} to use for fields in a form that produces
    // +link{AdvancedCriteria}.  Default is "iContains" unless +link{allowExpressions} is
    // enabled for the form as a whole, in which case the default is
    // +link{dataSource.translatePatternOperators,"iContainsPattern"}.
    // <p>
    // Does not apply to special fields where exact match is obviously the right default
    // setting, such as fields of type:"enum", or fields with a
    // +link{formItem.valueMap,valueMap} or  +link{formItem.optionDataSource,optionDataSource}.
    // <p>
    // <code>defaultSearchOperator</code> also has no effect in a form that does not produce
    // <code>AdvancedCriteria</code> - see +link{dynamicForm.getValuesAsCriteria()} for
    // settings that cause a form to produce AdvancedCriteria.
    // @visibility external
    //<

    //> @method dynamicForm.viewSelectedData()
    // @include dataBoundComponent.viewSelectedData()
    // @group dataBoundComponentMethods
    // @visibility external
    //<
});

// add default methods
isc.DynamicForm.addMethods({


//---------------------------
//	Data initialization
//---------------------------


//>	@method	dynamicForm.initWidget()	(A)
//			initialize the form object 
//
//			initializes th list of fields
//			sets up the data (if specified)
//			clears the errors array
//
//		@param	[all arguments]	(Object)	objects with properties to override from default
//<
initWidget : function () {
    if (isc._traceMarkers) arguments.__this = this;

    if (!isc.DynamicForm._operatorIndex) isc.DynamicForm.buildOperatorIndex();

    // does String -> Array conversion if needed
    this.setColWidths(this.colWidths);

    // default linearMode to true on handset devices if linearOnMobile is set
    if (this.linearMode == null && this.linearOnMobile && isc.Browser.isHandset) {
        this.linearMode = true;
    }
    // configure form for linear mode if enabled
    if (this.linearMode) this._setLinearMode(true);

	// call the superclass function
	this.Super("initWidget",arguments);
    
    // Set this-level showComplexFields if showComplexFieldsRecursively has been set
    if (this.showComplexFieldsRecursively) this.showComplexFields = true;

	// allow for fields instead of items specification
	if (this.fields && this.items == null) this.items = this.fields;

    // If we have a set of 'defaultItems' in an array, and the developer hasn't set the items
    // property, use the defaultItems array instead.
    // Notes:
    // - The 'defaultItems' property would typically be set on the instance prototype this class
    //   (or subclasses).
    // - In each instance we *copy* the defaultItems array into this.items, and avoid manipulating
    //   it directly.  This means specific instances will not write properties out into the 
    //   instance prototype's 'defaultItems' array (which would happen if manipulated directly as 
    //   it is passed by reference to each instance, so all instances point to the same object)
    // When creating a DynamicForm subclass, for which each instance should show a specific set 
    // of items by default, the defaultItems property should be set on the instance prototype.  
    // Setting the items property directly on the instance prototype is a bad idea as each 
    // instance will then point to the same items array.
    // (Used in Editor.js)
    if (this.defaultItems != null && this.items == null) {
        this.items = [];
        for (var i = 0; i < this.defaultItems.length; i++) {
            this.items[i] = isc.addProperties({}, this.defaultItems[i]);
        }
    }
        
    // Default values to an empty list.
    if (this.values == null) this.values = {};
    
    // explicitly call setAction() if the action has been overridden so we set the explicitAction
    // flag
    if (this.action != isc.DynamicForm.getPrototype().action &&
        this.action != null && !isc.isA.emptyString(this.action)) 
    {
        this.setAction(this.action);
    } 
    
     
    if (this.valuesManager != null) {
        // If we have a valuesManager and it is a string, check if it's a global ID for a VM
        // and use that - otherwise, initializeValuesManager() will auto-create it later
        if (isc.isA.String(this.valuesManager)) {
            if (window[this.valuesManager]) {
                this.valuesManager = window[this.valuesManager];
            } else if (this.getByLocalId(this.valuesManager)) {
                this.valuesManager = this.getByLocalId(this.valuesManager);
            }
        }

        if (isc.isA.ValuesManager(this.valuesManager)) {
            if (this.dataSource == null && this.valuesManager.dataSource != null) {
                this.dataSource = this.valuesManager.dataSource;
            }
        }
    }
    
    // If the form or any of its items specify dataPath, but not dataSource, this implies that 
    // the form will later be rebound.  This introduces all sorts of implications because the 
    // field properties should now inherit from the corresponding dataSource field.  So, we 
    // must hold onto the original field config so the rebinding process can use it.
    
    if (!this.dataSource) {
        var items = this.items || [];
        for (var i = 0; i < items.length; i++) {
            if (items[i] == null) continue;
            if (this.dataPath || items[i].dataPath) {
                this._itemsConfig = isc.shallowClone(items);
                break;
            }
        }
    }
    
    // make sure this.dataSource is a DS instance
    if (this.dataSource) this.dataSource = this.getDataSource();
    
	// initialize the list of fields, defaulting to an empty list
    // Note: We set up the items (and set their values / eval defaultDynamicValue) at Form init 
    // time so that a developer can define a form and then work with the items before drawing the 
    // form using the standard form item APIs.
    // This is in contrast to the approach used (for example) in the ListGrid, where the component
    // parts of the LG (header, body, etc.) are not created until draw in order to minimize the
    // cost associated with changing the dataSource / data /etc. while the widget is undrawn.
	this._setItems(this.items ? this.items : null, true);
    
    // If we've been marked as disabled explicitly disable all form items.
    if (this.isDisabled()) {
        this.setDisabled(true);
    }
    
	// initialize the form errors, defaulting to an empty list
	this.setErrors(this.errors ? this.errors : {});

	// initialize the form values, via 'setValues()'
	// this automatically remembers the old values for us as well
    	this.setValues(this.values, true);
    
    // If we have a selectionComponent, call the setter method to set up observation of selection
    if (this.selectionComponent != null) this.setSelectionComponent(this.selectionComponent,true);
    
},

_destroyItems : function (items) {
    if (!items) return;
    if (!isc.isA.FormItem(items[0])) return;
    items.callMethod("destroy");
    
    this.destroyOrphanedItems("containing form destroyed");
},

destroy : function () {
    this._removeItemWhenRules();

    if (this.valuesManager && this.valuesManager.removeMember) {
        this.valuesManager.removeMember(this);
    }
    this._destroyItems(this.items);
    this.Super("destroy", arguments);
},

// Override 'setHandleDisabled' to disable / enable all items
setHandleDisabled : function (disabled) {
    if (this.isDrawn()) {
        if (this.redrawOnDisable) this.markForRedraw("setDisabled");
        this._disablingForm = true;
        this.disableKeyboardEvents(disabled);
        delete this._disablingForm;
    }

    var items = this.getItems();
    for (var i = 0; i < items.length; i ++) {
        
        items[i].updateDisabled(true);
    }
},

    
disableKeyboardEvents : function (disabled, recursive, disablingForm) {
    

    var disablingForm = this._disablingForm;
    var wasDisabled = this._keyboardEventsDisabled;
    this.Super("disableKeyboardEvents", arguments);
    // by default disabling the form will also disable all items within it (no need to explicitly
    // suppress keyboard access to them)
    // If the form is not being disabled but just having keyboard access suppressed (EG for
    // a clickMask), notify the form items individually
    if (!disablingForm && (wasDisabled != disabled)) {
        // We'll have FormItem.getGlobalTabIndex() check this attribute.
        this._keyboardEventsDisabled = disabled;
        this.markForRedraw("Disable Keyboard events on items");
    }
},

//>	@method	dynamicForm.applyFieldDefaults()
//		@group	data
//         Selects the appropriate form item type for fields if not specified,
//         based on schema information.
//<
applyFieldDefaults : function (fields) {
	if (fields == null) return;

	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
        
        // This null check will avoid JS errors if someone defines an array of fields with
        // a trailing comma in IE
        if (field == null) return;
        
	}
},

//>	@method dynamicForm.getEditorType()  ([A])
//
// Returns the form item type (Class Name) to be created for some field.<br>
// By default <code>field.editorType</code> will be used if present - otherwise backs off to
// deriving the appropriate form item type from the data type of the field (see
// +link{type:FormItemType} for details).
//
//  @group  editing
//
//  @param  field   (Object)    field definition for which we are deriving form item type.
//  @param [values] (Object)    Current set of values being edited by this form. May be null.
//  @return         (String)  form item type for the field
//  @visibility external 
//<
getEditorType : function (field, values) {
    return this.getClass().getEditorType(field, this, values);
},
    
// getFieldType() - returns the data type for some field.
getFieldType : function (field, values) {
    
    if (field.type != null && 
      // if field.type is "any", field type is likely driven by another field.
      (field.type != "any" || field.fieldTypeProperty == null)) 
    {
        return field.type;
    }
    
    if (field.criteriaField && this.dataSource) {
        var ds = isc.DataSource.get(this.dataSource);
        var criteriaField = ds ? ds.getField(field.criteriaField) : null;
        if (criteriaField) return criteriaField.type;
    }

    // derive type from field definition's optionDataSource
    if (field.optionDataSource && field.getValueFieldName) {
        var ds = isc.DataSource.get(field.optionDataSource);
        var dsField = ds ? ds.getField(field.getValueFieldName()) : null;
        if (dsField) return dsField.type;
    }
    
    // If a field has no explicit type, but has "fieldTypeProperty" set, this should
    // be another field (of type FieldType), which will drive the type of this field.
    
    if (field.fieldTypeProperty != null) {
        if (values == null) values = this.values;
        if (values && values[field.fieldTypeProperty] != null) {
            return values[field.fieldTypeProperty];
        }
    }
    
    return null;
},
    
_itemChanged : function (item, value) {
    if (!item.suppressItemChanged) {
        if (this.itemChanged != null) {
            this.itemChanged(item, value);
        }
        if (this.valuesManager && this.valuesManager.itemChanged) {
            // fire itemChanged() on the VM, if there is one
            this.valuesManager.itemChanged(item, value);
        }
    }
    if (this._fireRuleContextOnItemChange) {
        this.fireRuleContextChanged(this);
    }
},

_canonicalizeItems : function (itemList) {
    if (itemList != null) {
        for (var i = 0; i < itemList.length; i++) { 
            var invalidItem = false;
            if (itemList[i] == null) {
                this.logWarn("Encountered empty entry in items array - removing this entry.")
                invalidItem = true;
            }
            if (isc.isA.Canvas(itemList[i])) {
                this.logWarn("Encountered a Canvas instance:" + itemList[i] + " in the items " +
                             "array - the DynamicForm items array should contain only FormItem " +
                             "definitions. Removing this entry.");
                 invalidItem = true;
            }
            if (invalidItem) {
                itemList.removeAt(i);                
                i -= 1;
            }
        }
    }
},

//> @method dynamicForm.setHilites()
// Only supported on ListGrid for now.
// @include dataBoundComponent.setHilites()
// @param hilites (Array of Hilite) Array of hilite objects
// @group hiliting
// @visibility smartclient
//<
    
//>	@method	dynamicForm.setItems()
// Synonym for +link{DynamicForm.setFields()}
//
// @group elements
// @param itemList		(Array of FormItem Properties)	list of new items to show in the form
// @visibility external
//<
setItems : function (itemList) {
    this._setItems(itemList);
},
alwaysRecreateItems:false,
_setItems:function (itemList, firstInit) {

    // remove invalid items from itemList
    this._canonicalizeItems(itemList);

    // get field data by binding to a DataSource, if we were provided one.  NOTE we do this first
    // because the returned list of items may be a new list
    itemList = this.bindToDataSource(itemList);

    //this.logWarn("itemList is : " + this.echo(itemList) +
//                  ", this.items is : " + this.echo(this.items) + "\n\n" + this.getStackTrace());
    if (!itemList) itemList = [];
    // If the itemList passed in is the same array object as this.items, duplicate it, as 
    // the removeItems call (below) will clear out that array if alwaysRecreateItems is true
    else if (itemList == this.items) itemList = itemList.duplicate();

    // If the new array contains our current live items support shifting them in the
    // items array rather than destroying and recreating them
    var oldItems = this.items ? this.items.duplicate() : null;
    if (!firstInit && itemList != null && this.items != null) {

        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i];
            if ((this.alwaysRecreateItems == false && !item._mustRecreate) && isc.isA.FormItem(item) && 
                this.items.contains(item)) 
            {
                oldItems.remove(item);
            }
        }
    }

    // Remove existing item *When rules
    if (!firstInit) this._removeItemWhenRules();

    // remove all existing items (destroy FormItem objects we created)
    if (oldItems != null && oldItems.length > 0 && !firstInit) {
        this.removeItems(oldItems);
    }
    this._addItems(itemList, null, true, firstInit);

    // Add/update ruleContext schema details. For firstInit time, the schema is automatically
    // added by draw(). This is only necessary when a new set of fields is applied.
    if (!firstInit) {
        this.addToRuleContextSchema();
    }

    // Create *When rules for new items if needed.
    // Trigger on isc.disableRuleScope even though ruleScope will be null
    // so that individual attempts to define *When criteria will be logged.
    if (this.ruleScope || this.isRuleScope || isc.disableRuleScope) this._createItemWhenRules(this.getItems());
    var rulesEngine = this.getRulesEngine();
    if (!firstInit && rulesEngine) {
        // When resetting rules after initial form creation
        // contextChanged rules need to be fired.
        rulesEngine.processContextChanged();
    }
},

//>	@method	dynamicForm.setFields()
// Set the +link{dynamicForm.fields,items} for this DynamicForm.  Takes an array of item
// definitions, which will be converted to +link{FormItem}s and displayed in the form.
// <P>
// <smartclient>
// Note: Do not attempt to create +link{FormItem} instances directly. This method should be
// passed the raw properties for each item only.
// </smartclient>
// <P>
// Objects passed to <code>setFields()</code> may not be reused in other forms and may not be
// used in subsequent calls to <code>setFields()</code> with the same form, new objects must be
// created instead.
// <P>
// To create a form where some items are conditionally present, rather than repeated calls to
// <code>setFields()</code> or <code>setItems()</code>, you should generally use
// +link{formItem.hide()} and +link{formItem.show()} and/or +link{formItem.showIf} rather than
// calling <code>setItems() or setFields()</code>.  <code>setItems()</code> and
// <code>setFields()</code> are appropriate for dynamically generated forms where there are
// few if any items that are the same each time the form is used.
//
// @param itemList		(Array of FormItem Properties)	list of new items to show in the form
// @group elements
// @visibility external
//<
setFields : function (fieldList) {
	this.setItems(fieldList);
},


//>	@method	dynamicForm.getFields()
// Method to retrieve the +link{dynamicForm.fields, items} for this DynamicForm. 
//
// @return (Array of FormItem)
//
// @group elements
// @visibility external
//<
getFields : function () {
	return this.items;
},

// Override the DBC getAllFields method to simply return the items array as well
// (Since we don't maintain a separate completeFields array, and since the default
// getAllFields implementation returns this.fields which is unpopulated for forms)
getAllFields : function () {
    return this.items;
},

//>	@method	dynamicForm.getItems()
// Method to retrieve the +link{dynamicForm.fields, items} for this DynamicForm. 
//
// @return (Array of FormItem)
// @group elements
// @visibility external
//<
getItems : function () {
	return this.items;
},

// Override visibleAtPoint to return true if we have any items contained in containerWidgets
// which would be visible at the specified point.

visibleAtPoint : function (x, y, withinViewport, ignoreWidgets) {

    if (this.invokeSuper(isc.DynamicForm, "visibleAtPoint", x,y,withinViewport,ignoreWidgets)) 
        return true;
    
    
    var items = this.items || [],
        containerWidgets = {},
        focusItemIndex = items.indexOf(this.getFocusSubItem());
    
    for (var i = -1; i < items.length; i++) {
        
        var itemIndex = i;
        if (i == -1) {
            itemIndex = focusItemIndex;
        // avoid checking the focus item twice
        } else if (itemIndex == focusItemIndex) continue;
        
        // Catch the case where we had no focusItem;
        if (itemIndex == -1) continue;
        var item = items[itemIndex],
            cw = item.containerWidget;
        if (cw == this || !item.isDrawn() || !item.isVisible()) continue;
        
        
        var cwID = cw.getID();
        if (containerWidgets[cwID] == null) {
            containerWidgets[cwID] = cw.visibleAtPoint(x,y,withinViewport, ignoreWidgets);
        }
        if (!containerWidgets[cwID]) continue;
            
        
        var PL = item.getPageLeft(),
            PT = item.getPageTop();
        if (PL <= x && (PL + item.getVisibleWidth()) >= x && PT <= y && (PT + item.getVisibleHeight()) >= y) {
            return true;
        }
    }

    return false;
},

// addItems - slot new items into the appropriate position in the items in this DynamicForm

addItems : function (newItems, position) {
    if (!isc.isAn.Array(newItems)) newItems = [newItems];
    if (this.dataSource) {
        var ds = isc.DS.get(this.dataSource);
        for (var i = 0; i < newItems.length; i++) {
            // "name" must be set for combineFieldData to merge in DS field properties
            if (newItems[i].autoName && !newItems[i].name) newItems[i].name = newItems[i].autoName;

            newItems[i] = this.combineFieldData(newItems[i]);
    
            // on name collision, remove the old item.  
            
            var itemName = newItems[i].name || newItems[i].autoName;
            if (itemName && this.getItem(itemName)) {
                this.removeItem(itemName);
            }

                    
        }
    }
    this.addFieldValidators(newItems);
    if (position == null || position > this.items.length) position = this.items.length;

    this._addItems(newItems, position);

    // Add/update ruleContext schema details
    this.addToRuleContextSchema();
    // And add/update item *When rules
    this._createItemWhenRules(newItems);
},

// This flag is used by DataBoundComponent logic to ensure we pick up 
// dataSourceField.editorProperties and apply directly to the fields during the
// bindToDataSource flow
isEditComponent:true,


_$upload : "upload",_$uploadItem:"UploadItem", _$tUploadItem:"TUploadItem",
_$mutex:"mutex",
_addItems : function (newItems, position, fromSetItems, firstInit) {
    
    this.addingItems = true;
    
    // adding items will almost always change the tab-index-span used by the form
    // If this increases, we need to catch the case where the tabIndex of our items overlaps
    // the next widget on the page
    var drawn = this.isDrawn();
    
    //this.logWarn("addItems: " + this.echoAll(newItems));
    // apply type-based field defaults to the items passed in
    // Note: this will not change the type of an already-instantiated form item, so we do this
    // before converting the items init objects to FormItems
    this.applyFieldDefaults(newItems);
        
    var sectionItems = [];
    
	// iterate through all the items, creating FormItems from object literals
    var haveUploadFields = false,
        foundFileItem = false,
        mutexSections = (this.sectionVisibilityMode == this._$mutex)
    ;
 
	for (var itemNum = 0; itemNum < newItems.length; itemNum++) {
		var item = newItems[itemNum];

		// remove any empty items from the list
		if (!item) {
			newItems.removeItem(itemNum);
			itemNum--;
			continue;
		}

        // What if we're passed a live item?
        // - if it's already in our items array
        //  - if alwaysRecreateItems is true continue as normal. It may have already been
        //    destroyed via removeItems. In this case create a new item using this items' 
        //    properties as a template. [If its been orphaned but not destroyed this will cause its
        //    destruction thanks to ID collision!]
        //  - otherwise just skip over it and leave it in the items array at the appropriate spot
        // - if it was attached to another form, log an obvious warning!
        var mustCreateItem = true;
        if (isc.isA.FormItem(item)) {
            if (this.alwaysRecreateItems == false && !item._mustRecreate && item.form == this) {
                mustCreateItem = false;
                this.logInfo("setItems() / addItems(): Passed existing item:" + item + 
                            ". This item will not be destroyed and recreated.");
            } else {
                if (item.form == this) {
                    this.logInfo("setItems() / addItems(): Passed existing item:" + item +
                                ". This item will be destroyed and recreated.");
                // Being passed a live item from a *different* form implies a coding error
                } else {
                    this.logWarn("setItems() / addItems(): Passed live form item instance:" + item +
                            " currently applied to a different DynamicForm:" + item.form +
                            ". This is unsupported and may lead to unpredictable results.");
                }
            }
        }
        
        if (mustCreateItem) {
            var itemType = this.getEditorType(item, this.values);
            item._calculatedEditorType = itemType;

            newItems[itemNum] = item = this.createItem(item, itemType);
        }
        
        if (itemType == this._$upload || itemType == this._$uploadItem || 
                itemType == this._$tUploadItem) 
        {
            haveUploadFields = true;
        }
        
        if (isc.FileItem && isc.isA.FileItem(item) && foundFileItem) {
            this.logWarn("Attempting to creating a form with multiple FileItems. This is " +
                         "not currently supported - only the first file type field value will " +
                         "be committed on submission of this form.");
        }

        // add to list of form sections that should start out hidden
        if (isc.isA.SectionItem(item)) {
            sectionItems.add(item);
            // remember the last visible section for mutex operation
            
            if (item.sectionExpanded && mutexSections) 
                this._lastExpandedSection = item;
        }
	}
    
    // Actually store the items in this.items
    
    if (fromSetItems) this.items = newItems
    else this.items.addListAt(newItems, position);
    
    
    if (!firstInit) {
        this.setItemValues(this.getValues(), false, true, newItems);
    }
    
    // enable multipart encoding if upload fields are included
    // NOTE: imperfect: we aren't detecting all the ways you can include an UploadItem, eg
    // editorType:"UploadItem" isn't caught, neither would any subclasses be.
    if (haveUploadFields) this.encoding = isc.DynamicForm.MULTIPART_ENCODING;
    
    for (var i = 0; i < sectionItems.length; i++) {
        var sectionItem = sectionItems[i],
            isVisible = sectionItem.sectionExpanded;

            
            if (isVisible && (!mutexSections || (this._lastExpandedSection == sectionItem))) {
                // call expandSection on visible items to ensure that sections defined with an
                // inline items array have added their items to the form.
                sectionItem.expandSection();              
            } else {
                // hide form sections for section items that have sectionExpanded property set 
                // to false
                // do this as separate for loop to ensure that all form items to be hidden have 
                // been initialized
                sectionItem.collapseSection();
            }
    }
    
    // set the _itemsChanged flag so we recalculate the layout
	this._itemsChanged = true;

    // Call assignItemsTabPosition
    // This handles both shuffling existing items and adding new ones.
    this.assignItemsTabPosition();

	this.markForRedraw("Form items added");
    
    delete this.addingItems;

},

// there are extra limitations when submitting the form if uploadItems are present
_hasUpload : function () {
    var items = this.items;
    for (var i = 0; i < items.length; i++) {
        if (isc.isAn.UploadItem(items[i])) return true;
    }
    return false;
},        

_knownProps : ["name", "editorType", "readOnlyEditorType", "type", 
               "valueMap", "defaultValue", "showTitle",
               "left", "top", "width", "height"],
copyKnownProperties : function (target, props, propNames) {
    var undef;
    for (var i = 0; i < propNames.length; i++) {
        var propName = propNames[i],
            value = props[propName];
        if (value !== undef) {
            target[propName] = value;
            delete props[propName];
        }
    }
},
createItem : function (item, type) {

    // We may want to support having the user specify which form an item belongs to before it
    // is initialized as a FormItem instance.  (The specified form will then handle values 
    // management, etc.)
    // However this is not currently supported - we'll always have form items point back to the
    // form that created them.
    // (Note: We may want a customizable 'formProperty' property, rather than hard-coding the
    // "form" property)
    if (item.form != null && !(item.form == this.getID() || item.form != this)) {
        this.logWarn("Unsupported 'form' property [" + item.form + "] set on item:" +
                      item + ".  Ignoring.");
    }

    if (item.destroyed && isc.isA.FormItem(item)) {
        this.logWarn("destroyed FormItem passed to setItems()/addItem(): FormItems cannot be " +
                     "re-used with different DynamicForms");
    }

    // warn for a percent width other than "100%", unless using absolute item layout
    if (!this._absPos() && isc.isA.String(item.width) && item.width != "100%" && 
                                                         item.width != "*")
    {
        this.logWarn("Found width:'" + item.width + "' for item " + item.name + 
                     ".  Percent sizes other than '100%' (as a synonym for '*') " + 
                     "aren't allowed unless using absolute item layout");
    }
    
    // Handle item.hidden as a synonym for showIf:"false"
    // This matches behavior with ListGrid Fields and is something we supported at one time.
    
    if (item.showIf == null && item.hidden) {
        item.showIf = "return false";
    }

	// convert from a simple object into a FormItem
	var className = isc.FormItemFactory.getItemClassName(item, type, this),
        classObject = isc.FormItemFactory.getItemClass(className);

    var substituteSpacer = !classObject;
    if (substituteSpacer) {
        this.logWarn("Problem initializing item: " + isc.Log.echo(item) +
                     " - derived FormItem class is: " + className + ".  If this is " +
                     " not a typo, please make sure the relevant module is loaded.  " +
                    "A SpacerItem will be created for this FormItem.");
        
        classObject = isc.ClassFactory.getClass("SpacerItem", true);
        if (item.showTitle == false) substituteSpacer = false;
    }

    if (this.shouldUseMultiSelectForValueMaps() && item.valueMap != null && 
        item.multiple == null && classObject.isA(isc.SelectItem)) 
    {
        item.multiple = true;
    }

    // If the classObject is an SGWTFactory, then our type actually pointed
    // to a SmartGWT class, not a SmartClient class. In that case, we need
    // to figure out what SmartClient class to create! We can't just call
    // SGWTFactory.create() in the usual way, because the SGWT side of FormItem
    // only creates a properties block on initialization, and that's what we've
    // got already ... we need to turn it into a real SC FormItem, and this is 
    // the only place where that happens.
    if (isc.SGWTFactory && isc.isA.SGWTFactoryObject(classObject)) {
        // First, create the desired SGWT FormItem object. We supply the
        // properties block in case there is something there that is really an
        // SGWT property ...  this allows the SGWT side to define a new
        // property and have it picked up on creation. SGWTFactory will set
        // unknown properties on the JavaScriptObject we get back. Thus, in the
        // ordinary case, we get back a copy of what we put in, but backed by a
        // SmartGWT FormItem.
        
        // We delete the editorType if supplied with the item, since we want to
        // pick that up from SGWT -- we don't want to clobber what SGWT is about
        // to tell us. We also delete the __module and __ref, if the item is
        // already backed by an SGWT object -- this would only happen if the
        // SGWT FormItem has specified a different editorType by reflection.
        var config = item;
        if (config.editorType || config[isc.gwtRef]) {
            config = isc.addProperties({}, item);
            delete config.editorType;
            delete config[isc.gwtRef];
            delete config[isc.gwtModule];
        }
      
        var reflectedItem = classObject.create(config);
    
        // Now, what we have is a normal situation, with a properties block
        // that is backed by a SmartGWT FormItem. So, just call ourselves
        // recursively with the correct type, and everything should happen
        // jut as it should.
        var createdItem = this.createItem(reflectedItem, reflectedItem.editorType);
       

        // Then reset the jsObj on the SmartGWT side to the actual FormItem,
        // since there are cases where this doesn't happen otherwise.
        classObject.setJsObj(createdItem[isc.gwtRef], createdItem);

        return createdItem;
    }

    var itemConfig = item;
    item = classObject.createRaw();

	// set up a pointer back to this form, and to the containerWidget, which might be a
    // different widget, eg a grid doing inline editing.
    // Note: several FormItem methods assume item.form will be set before init() is called.
    // CanvasItems at least need containerWidget in init as well.
    // set this up as the item's eventParent (for ISC bubbling)
    item.form = item.containerWidget = item.eventParent = this;
    
    
    var baseValidators = null;
    if (item["validators"] != null && itemConfig["validators"] != null) {
        baseValidators = item.validators;
    }

    
    if (isc.Browser.isIE && this.canAlterItems) {
        this.copyKnownProperties(item, itemConfig, this._knownProps);
    }

    if (!itemConfig.name && itemConfig.autoName) itemConfig.name = itemConfig.autoName;

    if (this.autoChildItems) {
        // use the autoChild system to instantiate items with FormItem class-specific defaults
        

        // ensure an auto-ID is not assigned by the autoChild system
        if (item.ID == null) item.ID = null;

        this._completeCreationWithDefaults(classObject.Class, item, itemConfig);
    } else {
         //this.logWarn("item: " + this.echoLeaf(item) + ", item.form is: " + item.form + 
         //             ", itemConfig is: " + this.echo(itemConfig));
        item.completeCreation(itemConfig);
        
        if (baseValidators != null) {
            // Add base validator(s) to item
            if (!item.validators) {
                item.validators = baseValidators;
            } else {
                if (!isc.isAn.Array(item.validators)) {
                    item.validators = [item.validators];
                }
                // if the field is using the shared, default validators for the type, 
                // make a copy before modifying
                if (item.validators._typeValidators) {
                    item.validators = item.validators.duplicate();
                }
                item.validators.addList(baseValidators);
            }
        }
    }
    
    
    item.form = this;
    if (item.destroyed) item.destroyed = false;    

    // Log a warning if this item has no name, but is expected to save values
    // See comment in formItem.js next to the 'shouldSaveValue' property declaration.
    // (Note: we could put this check into FormItem.init)
    if (item.shouldSaveValue && 
        (item[this.fieldIdProperty] == null || 
         isc.isAn.emptyString(item[this.fieldIdProperty])) &&
        (item.dataPath == null || isc.isAn.emptyString(item.dataPath)) 
        ) 
    {

        // 'shouldSaveValue' is a property denoting whether this item should be included
        // in the form's values object.
        // False by default for non-data items.
        this.logWarn(item.getClass() + " form item defined with no '" + 
                 this.fieldIdProperty + "' property - Value cannot be validated and will " +
                 "not be saved. To explicitly exclude a form item from the set of values " +
                 "to be saved, set 'shouldSaveValue' to false for this item.")

        item.shouldSaveValue = false;                        
    }

    // The item may be inheriting its canEdit and/or readOnlyDisplay settings from the form.
    // Need to call updateCanEdit() and updateReadOnlyDisplay() to give the item a chance to
    // update its state for this new form.
    item.updateCanEdit();
    item.updateReadOnlyDisplay();

    
    if (substituteSpacer && item.titleOrientation != "top") item.colSpan += item.titleColSpan;

    return item;
},

//>	@method	dynamicForm.removeItems()
// Removes some items from this form.
// Marks form to be redrawn.
//
//		@group	elements
//		@param	items   (Array of Object[])  list of form items to remove from the form
//<
removeItems : function (items) {
    if (items == null) return;

    if (!isc.isAn.Array(items)) items = [items];

    // If passed this.items, duplicate it - we want to be able to manipulate this.items without
    // changing the array passed in.
    if (items == this.items) items = this.items.duplicate();
    else {
        items = this.map("getItem", items);
        for (var i = 0; i < items.length; i++) {
            // yank out any items that aren't currently in this form (typically orphaned / destroyed items)
            if (this.items.indexOf(items[i]) == -1) {
                items[i] = null;
            }
        }
    }
    
    var hasAdvancedCriteria = this._hasAdvancedCriteria();

    // If the form as a whole will return advanced criteria
    // get the criteria from any item(s) being removed and 
    // apply them to our "extraAdvancedCriteria"
    // object so we can continue to return the right thing from getValuesAsCriteria()
    // (If an item with the same name is reintroduced, we'll also update from
    // the extraAdvancedCriteria object)
    
    for (var i = 0 ; i < items.length; i++) {
        var item = items[i];
        if (item == null) continue;

        if (hasAdvancedCriteria) {
            var crit = items[i].getCriterion();
            if (crit != null) {
                if (this._extraAdvancedCriteria == null) {
                    this._extraAdvancedCriteria = {
                        _constructor:"AdvancedCriteria",
                        operator:"and",
                        criteria:[]
                    }
                }
                this._extraAdvancedCriteria.criteria.add(crit);
            }
            
            delete this.values[items[i].name];
        }
    }
        
    this.items.removeList(items);
    
    if (this._orphanedItems == null) {
        this._orphanedItems = [];
    }


    // if we've removed any items from this form, destroy() them too
    var ruleScopeComponent = this.getRuleScopeComponent();

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        // bad item name passed in, getItem() failed
        if (item == null) continue;

        if (ruleScopeComponent && ruleScopeComponent.rulesEngine && isc.isA.FormItem(item)) {
            if (item.requiredWhen) this._removeWhenRule("setRequired", {formItem:item.name});
            if (item.visibleWhen) this._removeWhenRule("visibility", {formItem:item.name});
            if (item.readOnlyWhen) this._removeWhenRule("readOnly", {formItem:item.name});
            if (item.formula) this._removeWhenRule("formula", {formItem:item.name});
            if (item.textFormula) this._removeWhenRule("textFormula", {formItem:item.name});

            if (item.icons) {
                var icons = item.icons;
                for (var j = 0; j < icons.length; j++) {
                    var icon = icons[j];
                    if (icon.visibleWhen) this._removeWhenRule("visibility", {formItem:item.name, formIconName:j});
                    if (icon.enableWhen) this._removeWhenRule("enable", {formItem:item.name, formIconName:j});
                }
            }
        }

        // If this has sub-items, slot them in after this item in the items array
        if (item.items != null) {
            items.addList(item.items, i+1);
        }

        // don't leave a pointer to a destroyed focus item.
        if (this._focusItem == item) {
            delete this._focusItem;
            delete this._focusItemIcon;
            if (this.hasStableLocalID()) this.provideRuleContext(this.getLocalId() + ".focusField", null, this);
        }

        
        if (!this.items.contains(item) && isc.isA.FormItem(item)) {
            if (this.isDrawn()) {
                
                if (item._destroyCanvas) item._destroyCanvas();
                this._orphanedItems.add(item);
            } else {
                item.destroy();
            }
        }
    }
    
    // set the _itemsChanged flag so we recalculate the layout
	this._itemsChanged = true;
    this.markForRedraw("Form items removed")
},

// canvas overrides
addField : function (field, position) { this.addItems(field, position) },
removeField : function (field) { this.removeItems(field); },

// obvious synonyms for single items 
addItem : function (item, position) { this.addItems(item, position); },
removeItem : function (item) { this.removeItems(item); },

// Synonymous addFields / removeFields methods for completeness
addFields : function (items, pos) {
    return this.addItems(items, pos);
},
removeFields : function (items) {
    return this.removeItems(items);
},


// tabIndex management
// ---------------------------------------------------------------------------------------



//> @attr dynamicForm.canTabToIcons  (Boolean : true : IRWA)
// Should users be able to tab into the +link{formItem.icons,icons} and 
// +link{formItem.showPickerIcon,picker icon} for items within this form by default?
// <p>
// May be overridden at the item level by +link{formItem.canTabToIcons}.
// <P>
// Developers may also suppress tabbing to individual icons by 
// setting +link{formItemIcon.tabIndex} to <code>-1</code>.
//
// @group  formIcons
// @visibility external
//<

canTabToIcons:true,


// Notification method fired for some item when the tab index assigned by the
// tabIndexManager changes.
itemAutoTabIndexUpdated : function (ID) {
    // If we're undrawn we don't have a handle to update
    if (!this.isDrawn()) return;
    
    var item = window[ID];
    
   if (this.logIsDebugEnabled("TabIndexManager")) {
        this.logDebug("tab index update notification for item:" + item,
            "TabIndexManager");
    }
    
    if (item == null || item.destroyed || item.form != this) {
        this.logWarn("auto tab index update notification for item with ID " + ID + 
            ", this may be a stale entry as we do not have an item with this " +
            "ID.");
        return;
    }
    
    // If the item is drawn / visible, update its element tab index
    // (otherwise this will happen lazily on draw)
    if (item._canFocus() && item.isDrawn()) {
        // second parameter notifies the item that this came from the
        // TabIndexManager - it can skip updating its icons etc.
        item._setElementTabIndex(item.getGlobalTabIndex(), true);
    }
    
    // Notification
    this.itemTabIndexUpdated(item);
},

// Documented in registerStringMethods
itemTabIndexUpdated : function (item) {
},

// Called from FormItem.destroy()
_removeItemFromTabIndexManager : function (item) {
    isc.TabIndexManager.removeTarget(item.ID);
},


//> @method dynamicForm.assignItemsTabPositions()
// This method is called automatically by the DynamicForm when the set of items changes
// and ensures that items show up in the correct tab order positions.
// <P>
// Makes use of +link{dynamicForm.sortItemsIntoTabOrder()} to order the items and ensures
// the items are ordered in the +link{TabIndexManager} correctly.
// @visibility external
//<
// Called from _addItems() (at which stage we have a full set of items - required to
// handle explicit local-tab-indices, etc)
// Also called from explicit 'setTabIndex' on items within this form as they can
// effect the local tab index of other items
assignItemsTabPosition : function () {
    var items = this.items;
    if (!items || items.length == 0) return;
    
    var orderedItems = this.sortItemsIntoTabOrder();

    // Loop through the final array adding to the TabIndexManager
    for (var i = 0, position = 0; i < orderedItems.length; i++) {
        var item = orderedItems[i];
        // Don't get confused by empty slots due to larger-than-necessary tab indices
        if (item == null) continue;
        
        // Shift the item in the TabIndexManager tree
        isc.TabIndexManager.moveTarget(item.ID,  this.ID, position);
        position++;
        
        // Always update the items' elementTabIndex
        // (Even if it isn't drawn, this is stored out for future use)
        if (item._canFocus() && item.globalTabIndex == null && item.tabIndex != -1) {
           item._setElementTabIndex(item.getGlobalTabIndex());
        }
    }
    
},

//> @method dynamicForm.sortItemsIntoTabOrder()    
// Helper method to take our specified items and sort them into their desired
// tab sequence
// <P>
// Default behavior will respect explicitly specified tab index as a local tab
// index, otherwise just use specified order within the items array
// @return (Array of FormItem) Returns an array containing our items in the desired tab sequence.
// @visibility external
//<


sortItemsIntoTabOrder : function () {    
    return isc.DynamicForm.sortItemsIntoTabOrder(this.items, this);
},

// Customize 'updateChildTabPosition' - the most common child of a DF is a CanvasItem canvas
// We allow the item to manage that widget's tab position, so avoid tweaking it in response
// to our addChild call, etc.

// getChildTabPosition should only be called for normal (not canvasItem) children
getChildTabPosition : function (child) {
    if (child.canvasItem != null) {
        this.logWarn("Unexpected call to 'getChildTabPosition' for a CanvasItem canvas");
    }
    
    var totalItems = this.items ? this.items.length : 0;
    var children = this.children,
        childOffset = 0;
    for (var i = 0; i < this.children.length; i++) {

        if (!children[i].updateTabPositionOnReparent) continue;
        if (children[i] == child) break;
        childOffset++;
    }
    return totalItems + childOffset;
},

// Widget level _canFocus
// If this method returns false we will not get keyboard events on the form.
// Therefore check for our items' _canFocus() instead.
// Only respect canFocus:false if we have no focusable items
_canFocus : function (a,b,c,d) {
    // shortcut: allow canFocus:true
    if (this.canFocus == true) return true;
    var items = this.getItems() || [];
    for (var i = 0; i < items.length; i++) {
        if (!isc.isA.FormItem(items[i])) continue;
        if (items[i]._canFocus()) return true;
    }
    
    return this.invokeSuper(isc.DynamicForm, "_canFocus", a,b,c,d);
},

// Item notifications
// ---------------------------------------------------------------------------------------

// Whenever this DynamicForm is moved, notify all the items that they have been moved.

handleMoved : function (a,b,c,d) {
    this.invokeSuper(isc.DynamicForm, "handleMoved", a,b,c,d);
    this.itemsMoved();
},

handleParentMoved : function (a,b,c,d) {
    this.invokeSuper(isc.DynamicForm, "handleParentMoved", a,b,c,d);
    this.itemsMoved();
},

// Also notify the items if the zIndex is modified
zIndexChanged : function (a,b,c,d) {
    this.invokeSuper(isc.DynamicForm, "zIndexChanged", a,b,c,d);
    this.itemsZIndexChanged();
},

parentZIndexChanged : function (a,b,c,d) {
    this.invokeSuper(isc.DynamicForm, "parentZIndexChanged", a,b,c,d);
    this.itemsZIndexChanged();
},


// Since the container widget for form items manages their position / HTML we need to fire
// a notification function to let them know if they have moved.
// itemsMoved is a helper method to fire 'moved()' on each item in this form.
itemsMoved : function (items) {
    
    if (items == null) items = this.getItems();
    if (!items) return;    
    for (var i = 0; i < items.length; i++) {
        if (items[i].isVisible()) items[i].moved();
    }
},

// When our visibility changes, notify all our items of the visibility change.

itemsVisibilityChanged : function () {
    var items = this.getItems();
    if (!items) return;    
    for (var i = 0; i < items.length; i++) {
        if (items[i].visibilityChanged) items[i].visibilityChanged();
    }
},

itemsZIndexChanged : function () {
    var items = this.getItems();
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
        items[i].zIndexChanged();
    }
},

// Override scrollTo to notify our form items that they have moved.
scrollTo : function (left, top, reason) {
    var oldLeft = this.getScrollLeft(),
        oldTop = this.getScrollTop();
        
    this.Super("scrollTo", arguments);

    // If the scroll position changed, notify our form items that they have moved.
    if (oldLeft != this.getScrollLeft() || oldTop != this.getScrollTop()) this.itemsMoved();
},

//>Animation
// We override scrollTo() which normally causes _canAnimateClip to return false but there's no
// reason for us not to support animateShow() / animateHide() in DynamicForms, so override
// _canAnimateClip to explicitly return true (unless 'canAnimateClip' is set)
_canAnimateClip : function () {
    if (this.canAnimateClip != null) return this.canAnimateClip;
    return true;
},
//<Animation

//> @method dynamicForm.setTitleOrientation() 
// Modify this form's +link{titleOrientation} at runtime
// @param orientation (TitleOrientation) new default item titleOrientation
// @group  formTitles
// @visibility external
// @example formLayoutTitles
//<
setTitleOrientation : function (orientation) {
    this.titleOrientation = orientation;
    this._itemsChanged = true;
    this.markForRedraw();
},

// EditMode setters
// ---------------------------------------------------------------------------------------

//>EditMode

setNumCols : function (numCols) {
    this.numCols = numCols;
    this._itemsChanged = true;
    this.markForRedraw();
},
//<EditMode


// AutoComplete
// --------------------------------------------------------------------------------------------

//> @method dynamicForm.setAutoComplete()
// Change the autoCompletion mode for the form as a whole.
//
// @param   newSetting (AutoComplete)  new setting
// @group autoComplete
// @visibility autoComplete
//<

setAutoComplete : function (newSetting) {
    this.autoComplete = newSetting;
    // have items change mode if applicable
	for (var i = 0; i < this.items.length; i++) {
        this.items[i]._handleAutoCompleteChange();
    }
},

/////////
// Form Values handling
// --------------------------------------------------------------------------------------------
//  
// From a developers' point of view:
//  - You can initialize a form with form.values set (an array of field / value pairs).
//    - you can include fields that are not in the items array for the form.
//
//  - You can retrieve the entire set of values via form.getValues();
//    - this is basically this.values, so includes values set via setValues() that don't have
//      an associated form item.
//    - In theory this will always show you the visible value in each form element (value-mapped
//      back to the appropriate raw value if applicable).
//
//  - You can set this.values with a call to setValues()
//    - again you can include fields that are not in the items array for the form.
//    - the form will be redrawn to show the changes in the actual form elements
//
//  - form.resetValues() will reset the values to the last values set programmatically via 
//    form.setValues or form.setValue();
//
//  - form.clearValues() will set this.values to {}
//    - for form items with a defaultValue or defaultDynamicValue, this will be respected in this 
//      case.
//
//  - You can set the value for an individual form item via "form.setValue(item, value);" or
//    "form.getItem(itemName).setValue(value)"
//  - You can retrieve the value for an individual form item via form.getValue(item), or 
//    form.getItem(itemName).getValue();
//      - the value retrieved by these getter methods will be determined by looking at the 
//        stored formItem._value (set on every 'change' event) first.  If that is not present, 
//        this method will fall through to form.getSavedItemValue() which will look for the value
//        in the form.values array, and if it's not there return the default value for the item.
//  These four methods do not allow you to set values in the form.values array for fields that
//  are not included as actual form items.
//
//
// Internally:
//  There are several sets of values to consider:
//  - form.values - the values we return to the user from getValues() calls - should always be in
//    sync with the form item element values, but may include fields that are not in the set of
//    form items.
//  - form._oldValues - which is set up via form.rememberValues().  
//    This is used for resetting values on an explicit call to resetValues(), or after a 
//    failed validation attempt.  
//    form.rememberValues() is called every time a form value is set programmatically - from 
//    setValues() and setValue() calls.
//  - formItem._value.  This is the FormItem's internal representation of the form item value.
//    it is updated whenever the value is saved, so on programmatic 'setValue()', on change (and
//    keypress for some widgets).
//    Only used by code in FormItem.js (the form knows nothing each formItem's _value property).
//    Returned by FormItem.getValue().
//    Note - We store _oldValues on the form rather than on each item because:
//    - Having form._oldValues rather than just formItem._oldValue for each item allows us to store
//      values for non-form item fields
//  - The value displayed in the html element for each form item.  This differs from formItem._value
//    in a couple of ways:
//      - for form elements that have valueMaps, the display value will not match the "data" value
//      - form elements grouped into a container where there are multiple form elements for one 
//        logical value (such as date items).
//      - Anything where 'mapValueToDisplay()' and 'mapDisplayToValue()' is non trivial (allowing
//        checkboxes to represent values other than true and false, for example)
//      Important:
//      - The value displayed in the element can be out of sync with the _value for a form item,
//        for example while typing in a form item with 'changeOnKeypress' set to false (such as the
//        time item).  The form item is responsible for updating it's _value whenever appropriate
//        via the 'updateValue()' method, as the APIs to get directly at the value stored in the
//        element are not public.
//        *One case where it may not be in sync is items which have to validate / or reformat their 
//         element values to , such as time items and date items.
//         If a user is in the process of entering a time into a Time item, the element may display 
//         "1:", but the _value will not be updated (and saved in the form item values) until the 
//         change handler fires on the element, meaning we won't be interfering with a user's typing 
//         by attempting to verify the time on every keypress.
//         In this case, if a developer was to call 'getValue()' on a time item while focus was 
//         still in that item (and the user theoretically still typing), the stored time value
//         would be returned, rather that attempting to parse the partially typed value.
//
//  - formItem.defaultValue and formItem.defaultDynamicValue.
//    - whenever an item's value is programmatically set to null, the appropriate default value will
//      be applied to the form item.
//
//  form.values is updated in the following places:
//      - form.setValues().  
//        - Sets this.values to the object passed in, 
//        - Saves the values in this._oldValues
//        - Calls 'setItemValues()' to take care of updating the values for each form item.
//        - Redraws the form to re-evaluate show-ifs
//        Called by:
//          - init() - call to this.setValues() with this.values or {}.
//          - this.clearValues() - falls through to this.setValues({});
//          - this.resetValues() - falls through to this.setValues(this._oldValues);
//
//      - this.saveItemValue() (Basically used to keep form.values in sync with the values for each
//        form item).
//        - Updates this.values[item] for an item.
//        - Clears the '_valueIsDirty' flag for the form item 
//        Called from:
//          - form.elementChanged() (fired from an item's native change handler)
//          - item.handleKeyPress() (fired from a text / textArea item's keyPress handler)
//          - form.getValues() - if the current focus item is marked as dirty, this.values[...] for
//            the item will be updated to match the element value for the dirty form item.  (Other 
//            form items than the focus item should not be out of sync because of the 
//            elementChanged call to this method above).  Form items are marked as dirty via an
//            '_valueIsDirty' flag, which is set on keyDown in text / textArea type fields only.
//          - item.setValue() - which is called by form.setValue(item, value)
//
//  form._oldValues is updated when form.setValues(), formItem.setValue(), or form.setValue() is 
//  called.
//
//  formItem._value (and form.values[item]) are updated via 'formItem.saveValue(newValue)'.
//  This method is called on formItem.setValue() [programmatically updating a form item's value], or
//  formItem.updateValue(), which is called as a result of the native onchange handler for form 
//  items as well as the onclick handler for checkbox / radio items, and the onkeypress handler for
//  text items (where changeOnKeypress is true).
//  When these values are updated as a result of user interaction, the change handler will always
//  fire first (due to 'updateValue()').
//
//  The values displayed in the HTML form elements (and sub-elements) is updated by 
//  form.setItemValues() and formItem.setElementValue().  Every method that can effect the value
//  of a form item should fall through to these, or force a form redraw (which will also update the
//  values displayed).
//
//  Additional methods on the form:
//      - form.valuesHaveChanged - compares this.getValues() (effectively the current values for
//        each item) with this._oldValues (the values as they were last set via setValue() or 
//        setValues()) - used in resetValues() for example.
//
//  Additional methods on the form item:
//      - formItem.resetValue() - this will reset the value of the form item to the value stored in
//        form._oldValues[colName]
//      - formItem.elementChanged() - an internal method fired when the native element changed handler
//        is fired.  This is mentioned above as one of the callers for form.saveItemValue().  It
//        performs some other functions too, such as performing validation on the form item, and
//        setting up errors if necessary.  It has a number of "XXX" type comments and probably 
//        warrants reviewing!
//      - formItem.updateValue() - called on change (and keypress if change on keypress is true)
//        determines value (mapped to data value) from element, called 'handleChange()' and 
//        'saveValue()'
//      - formItem.handleChange() - internal method fired from updateValue() - will fire validators 
//        and change handlers.  If this method returns false, the value in the form item element
//        will not be saved.
//      - formItem.saveValue() - called from 'setValue()' or 'updateValue()', this will save the
//        value passed in as this._value, and update this.form.values[this.name], if the item has
//        been marked as 'shouldSaveValue' true.
//
// Notes:
//  - direct submission of the HTML form drawn out by the dynamicForm widget is supported in a 
//    couple of ways
//      - completely standard HTML submission is supported when canSubmit is true.
//        tripped from SubmitItem click, explicit call to "submit()" or "submitForm()".
//        Direct submission of course requires the values for form items to be present in real
//        HTML form elements - we handle this by writing out hidden elements with the intended
//        values where necessary.
//      - We also support an rpcManager direct submit transaction. This is tripped by
//        the saveData() code path if
//          a) this.canSubmit is true
//          b) this.isMultipart() [required for upload fields]
//          c) this.action has been specified.
//      Note that in rpcManager direct submit, the server pays attention to the _transaction 
//      parameter, which is a structure that contains the intended field values wherever 
//      possible.
//
//////////////////

//> @attr dynamicForm.dataArity (String : "single" : IRWA)
// A DynamicForm is a +link{dataBoundComponent.dataArity,dataArity}:single component.
// @group databinding
// @visibility external
//<
// Used by the valuesManager class
dataArity:"single",


//>	@method	dynamicForm.setValues()
// Replaces the current values of the entire form with the values passed in.
// <P>
// Note: when working with a form that is saving to a DataSource, you would typically call
// either +link{editRecord()} for an existing record, or +link{editNewRecord()} for a new
// record.  In addition to setting the current values of the form, these APIs establish the
// +link{DSRequest.operationType} used to save ("update" vs "add").
// <P>
// Values should be provided as an Object containing the new values as properties, where each
// propertyName is the name of a +link{items,form item} in the form, and each property value is
// the value to apply to that form item via +link{FormItem.setValue()}. 
// <P>
// Values with no corresponding form item may also be passed, will be tracked by the form
// and returned by subsequent calls to +link{getValues()}.
// <P>
// Any +link{FormItem} for which a value is not provided will revert to its
// +link{formItem.defaultValue,defaultValue}.  To cause all FormItems to revert to default
// values, pass null.
// <P>
// This method also calls +link{rememberValues()} so that a subsequent later call to
// +link{resetValues()} will revert to the passed values.
//
// @param [newData] (Object) values for the form, or null to reset all items to default values
//
// @group formValues	
// @visibility external
//<
setValues : function (newData, initTime, skipRememberValues, skipRuleContextChange) {
    // clear any extra advancedCriteria stored by setValuesAsCriteria()
    // getValuesAsCriteria() should return whatever was passed into this method rather than
    // hanging onto a stale advanced criteria object.
    /*if (this._extraAdvancedCriteria != null) {
        
        this.logWarn("clearing stored _extraAdvancedCriteria due to setValues. values:"
            + this.echo(newData) + ", old stored crit:" + isc.Comm.serialize(this._extraAdvancedCriteria) +
            " stack:" + this.getStackTrace());
    }*/
    delete this._extraAdvancedCriteria;
    
    if (isc.isAn.Array(newData)) {
        var useFirst = isc.isA.Object(newData[0]);
        this.logWarn("values specified as an array." + 
                    (useFirst ? " Treating the first item in the array as intended values."
                              : " Ignoring specified values (resetting to defaults)."));
        if (useFirst) newData = newData[0];
        else newData= null;
    }
    
    if (newData == null) {
        newData = {};
    } else {
        // Duplicate the values object passed in.
        // This ensures that we don't directly manipulate a record that may be
        // referenced elsewhere (and vice-versa).
        
        // Use _duplicateValues() - this performs a recursive duplication using dataPaths to
        // access nested values.
        var clonedData = {};
        isc.DynamicForm._duplicateValues(this, newData, clonedData);
        newData = clonedData;
    }

    // store the new values object
	this._saveValues(newData);
    
    // If any of our items have a specified 'displayField', call the method to create a 
    // special valueMap on that item so the value for that field is displayed rather than
    // the fields own value.
    
    var items = this.items;

    for (var i = 0; i < items.length; i++) {
    
        if (items[i].shouldSaveValue && this._useDisplayFieldValue(items[i])) {
            items[i]._displayFieldValueFromFormValues();
        }
    }
    
    // While setting item values, suppress ruleContext updates so rules aren't processed
    // for each FormItem. RuleContext will be explicitly updated immediately afterwards.
    this._suppressRuleContextUpdates = true;

    // and set the values in the form elements 
    
    this._settingValues = true;
	this.setItemValues(newData, null, initTime);
    if (!initTime) delete this._settingValues;

    delete this._suppressRuleContextUpdates;

    // Update ruleContext with new values
    this.setValuesInRuleContext(skipRememberValues, skipRuleContextChange);

    // remember the values so we can undo things
    if (!skipRememberValues) {
        this.rememberValues();
    } else {
        // If we have a specified rulesEngine, notify it that we're editing a new set of values
        var rulesEngine = this.getRulesEngine();
        if (rulesEngine != null) {
            rulesEngine.processEditStart(this);
        }
    }
    if (initTime) delete this._settingValues;

    // fire valuesChanged if it's been installed
    if (isc.isA.Function(this.valuesChanged)) this.valuesChanged();

    // redraw so that we will re-evaluate showIfs
    this.markForRedraw("setValues");
},

setValuesInRuleContext : function (skipRememberValues, skipRuleContextChange) {
    // when called from Canvas.addToRuleContextSchema() because the form is not visible,
    // no arguments are passed. In this case there is no call to rememberValues so we
    // flag it that way so that ruleContext changes transaction will be completed.
    skipRememberValues = (skipRememberValues == null ? true : skipRememberValues);

    if (this.ruleScope || this.isRuleScope) {
        var ds = this.getDataSource(),
            hasStableID = this.hasStableLocalID() || (this.editNode != null),
            values = this.getValues()
        ;

        if (ds && isc.isA.DataSource(ds) && this._populateSharedRuleContext != false) {
            // Make sure the new values are reported as a 'change' by clearing any current values
            var willFireRuleContextChanged = ((hasStableID &&
                                                (!skipRememberValues || skipRuleContextChange)) ||
                                              (this._fireRuleContextOnItemChange &&
                                                !skipRuleContextChange &&
                                                (this.grid == null || !this._settingValues)));

            this.provideRuleContext(ds.getID(), null, this, null, true);
            this.provideRuleContext(ds.getID(), isc.shallowClone(values),
                this, null, willFireRuleContextChanged);
        }
        if (hasStableID) {
            // Make sure the new values are reported as a 'change' by clearing any current values
            this.provideRuleContext(this.getLocalId() + ".values", null, this, null, true);
            this.provideRuleContext(this.getLocalId() + ".values", isc.shallowClone(values),
                this, null, true);
            this.provideRuleContext(this.getLocalId() + ".hasChanges", false, this, null,
                !skipRememberValues || skipRuleContextChange);
        } else if (this._fireRuleContextOnItemChange &&
            !skipRuleContextChange &&
            (this.grid == null || !this._settingValues))
        {
            this.fireRuleContextChanged(this);
        }
    }
},

// Helper method to detect the case where we a field should display the value from a 
// different field (field.displayField) in this form's values object
// The logic behind this is that if we're editing a record from the DataSource, we already have
// both the data value and the display value in the record values we were passed, and 
// don't need to perform a fetch against the ds to get another display value.
//
// This is only valid if we have a specified display field and no optionDataSource / valueField
// specified

_useDisplayFieldValue : function (field) {
    if (!field || !field.displayField) return false;
    
    if (field.useLocalDisplayFieldValue != null) return field.useLocalDisplayFieldValue;

    
    if (field.optionDataSource != null) return false;
    
    
    // If we're looking at a different underlying field on the optionDataSource, even if it's
    // the same dataSource, we don't want the display field value from this record    
    if (field.getValueFieldName() != field.getFieldName()) return false;
    
    return true;
},    

// If a (pickList-based) formItem has a specified displayField and no explicit 
// optionDataSource, this method returns the default dataSource to use

getDefaultOptionDataSource : function (field) {
    return this.dataSource;
},
 

//>	@method	dynamicForm.setData()
//			Pass-through to the standard setData interface.
//		@group formValues
//
//		@param	newData		(Object)	data to display in the form
//<
setData : function (newData) {
	this.setValues(newData);
},

// clear validation errors on rebind.  NOTE: should probably go to generic DataBinding
// framework when validation becomes a generic databinding behavior such that individual
// widgets just choose validation presentation.
setDataSource : function (dataSource, fields) {
    // If a dev calls 'setDataSource()' and passes in a subset of our existing fields
    // as a second argument, things get ambiguous.
    // Should an item that represents a field in the new DS change its editor type, for example?
    // Should an item that represented a field in the old DS drop properties derived from the
    // dsField?
    // - Log a warning if this happens
    
    if (fields != null) {
        var oldDS = this.getDataSource(),
            newDS = isc.DataSource.get(dataSource);

        if (newDS != oldDS) {
            for (var i =0; i < fields.length; i++) {
                var field = fields[i];
                if (isc.isA.FormItem(field)) {
                    var inOldDS = (oldDS && oldDS.getField(field.name) != null),
                        inNewDS = (newDS && newDS.getField(field.name) != null);
                    
                    if (inOldDS || inNewDS) {
                        this.logWarn("setDataSource(): fields argument contains already-created FormItem:" + field +
                            " which represents a dataSource field. This can lead to unexpected results if there are differences" +
                            " between the dsField attributes in the new dataSource vs the current dataSource.");
                        
                    }
                }
            }
        }
    }
    this.Super("setDataSource", arguments);
    this.clearErrors();
},

//>	@method	dynamicForm.rememberValues()
//			Make a snapshot of the current set of values, so we can reset to them later.
//			Creates a new object, then adds all non-method properties of values
//			to the new object.  Use <code>resetValues()</code> to revert to these values.
//          Note that this method is automatically called when the values for this form are
//          set programmatically via a call to +link{DynamicForm.setValues()}.
//
//      @visibility external
//		@group formValues
//
//		@return	(Object)	copy of current form values
//<

rememberValues : function () {
    var values = this.getValues();
    
    var oldVals = {},
        rememberedDefault = [];
        
    // Recursively duplicate values so further edits won't manipulate the remembered values
    // directly.
    isc.DynamicForm._duplicateValues(this, values, oldVals, rememberedDefault);
    
    // Remember the duplicated values object
    this._oldValues = oldVals;
    // rememberedDefault array will contain dataPaths for every item that had its value
    // set to the default in the 'values' object we passed in.
    // We need this information so 'resetValues' can set these items to null and
    // potentially re-evaluate a dynamicDefault rather than resetting to whatever the
    // value is at this moment.
    // [still store the current val for valuesHaveChanged() checks]
    this._rememberedDefault = rememberedDefault;

    this.updatePendingStyles();

    if (this.ruleScope || this.isRuleScope) {
        var ds = this.getDataSource(),
            hasStableID = this.hasStableLocalID() || (this.editNode != null)
        ;

        if (hasStableID) {
            this.provideRuleContext(this.getLocalId() + ".hasChanges", false,
                this, null, this._settingValues);
        }
    }

    return this._oldValues;
},

updatePendingStyles : function () {
    var items = this.items;
    for (var i = 0, numItems = (items == null ? 0 : items.length); i < numItems; ++i) {
        var item = items[i];
        if (!isc.isA.FormItem(item)) continue;
        item.updatePendingStatus(item._value);
    }
},

//>	@method	dynamicForm.resetValues()   ([])
//
// Same as +link{method:DynamicForm.reset()}.
//
// @group formValues
// @visibility external
//<

resetValues : function () {
	// reset the form errors as well as the values
	this.clearErrors();

    // pull the values from form._oldValues into ValuesManager.values
    var values = {};
    isc.DynamicForm._duplicateValues(this, this._oldValues, values);
    // clear any remembered defaults so they get re-eval'd
    if (this._rememberedDefaults != null) {
        
        for (var i = 0; i < this._rememberedDefaults.length; i++) {
            isc.DynamicForm._clearFieldValue(this._rememberedDefaults[i], values, this);
        }
    }
    
    this.setValues(values);
    
},

//>	@method	dynamicForm.clearValues()
// Reset to default form values and clear errors
//		@group formValues
// @visibility external
//<
clearValues : function () {
    var skipRuleContextChange = false;
    if (this.ruleScope || this.isRuleScope) {
        var ds = this.getDataSource(),
            hasStableID = this.hasStableID() || (this.editNode != null)
        ;

        skipRuleContextChange = hasStableID;
    }

    // call setValues() to clear out all our saved values
    this.setValues(null, null, true, skipRuleContextChange);
    
    // also iterate through every unnamed form item, setting its value to null.
    
    var items = this.getItems();
    for (var i = 0; i < items.length; i++) {
        if (items[i].shouldSaveValue == false) items[i].setValue(null);
    }

	// reset the form errors
	this.clearErrors();
    
    // remember the current values for future calls to 'resetValues()'
    this.rememberValues();
    
	// redraw the form
	this.markForRedraw("clearValues");
},

//>	@method	dynamicForm.valuesHaveChanged() ([])
// Compares the current set of values with the values stored by the call to the
// +link{dynamicForm.rememberValues()} method.  <code>rememberValues()</code> runs when the
// form is initialized and on every call to +link{dynamicForm.setValues()}.
// Returns true if the values have changed, and false otherwise.
// @return	(Boolean)	true if current values do not match remembered values
//
// @see getChangedValues()
// @see getOldValues()
//
// @group formValues
// @visibility external
//<
valuesHaveChanged : function (returnChangedVals, values, oldValues, useActionCache) {
	if (values == null) values = this.getValues();
	// form._oldValues is used to store the values in rememberValues()
    if (oldValues == null) oldValues = this._oldValues || {};
    
    return isc.DynamicForm.valuesHaveChanged(this, returnChangedVals, values, oldValues, null,
                                             useActionCache);
},
    
valueHasChanged : function (fieldName) {
    var values = {
            fieldName:this.getValue(fieldName)
        },
        undef,
        oldValues = {
            fieldName:this._oldValues ? this._oldValues[fieldName] : undef
        }
    ;
    return this.valuesHaveChanged(false, values, oldValues);
},

// return the updated form fields - mappings with field values
_getUpdatedFields : function () {
    var fields = [],
        map = this._updatedFields;
    if (map) for (var fieldName in map) {
        var field = map[fieldName];
        if (field) fields.add(field);
    }
    return fields;
},

// return updated DS fields - no mapped value but key names DSF
_getUpdatedDSFields : function () {
    var fields = [],
        map = this._updatedFields;
    if (!map) return fields;

    var ds = this.getDataSource(),
        dsFields = ds.getFields(),
        dataPaths = ds.dataPaths
    ;
    for (var dataPath in map) {
        var field = map[dataPath];
        if (field) continue;
        field = dsFields[dataPath] || dataPaths[dataPath];
        if (field) fields.add(field);
    }
    return fields;
},

// filter the passed values using the update tracking map
    
_filterWithUpdatedFields : function (values) {
    var filtered = {},
        map = this._updatedFields;
    if (map) for (var fieldName in map) {
        var field = map[fieldName];
        // might be a dataPath; chop off all but the first segment for lookup
        if (!field) {
            var splitPos = fieldName.indexOf("/");
            if (splitPos >= 0) fieldName = fieldName.substring(0, splitPos);
        }
        if (fieldName in values) filtered[fieldName] = values[fieldName];
    }
    return filtered;
},

//> @method dynamicForm.getOldValues() ([])
// Returns the set of values last stored by +link{dynamicForm.rememberValues()}.
// Note that <code>rememberValues()</code> is called automatically by
// +link{dynamicForm.setValues()}, and on form initialization, so this typically contains
// all values as they were before the user edited them.
//
// @return (Object) old values in the form
// @group formValues
// @see getChangedValues()
// @visibility external
//<
getOldValues : function () {
    var oldValues = {};
    isc.addProperties(oldValues, this._oldValues);
    return oldValues;
},


getOldValue : function (itemName) {
    return this.getOldValues()[itemName];
},

//> @method dynamicForm.getChangedValues()  ([])
// Returns all values within this DynamicForm that have changed since 
// +link{dynamicForm.rememberValues()} last ran. Note that +link{dynamicForm.rememberValues()}
// runs on dynamicForm initialization, and with every call to +link{dynamicForm.setValues()}
// so this will typically contain all values the user has explicitly edited since then.
// @return (Object) changed values in the form
// @group formValues
// @see getOldValues()
// @visibility external
//<
getChangedValues : function (useActionCache) {
    return this.valuesHaveChanged(true, null, null, useActionCache);
},

//>	@method	dynamicForm.getValues() ([])
// An Object containing the values of the form as properties, where each propertyName is
// the name of a +link{items,form item} in the form, and each property value is the value
// held by that form item.
// <P>
// Note that modifying the returned object is not a supported way of adding or modifying values.
// Instead use +link{setValue()} or +link{setValues()}.
// @return (Object) values in the form
// @see valuesManager.getValues()
// @group formValues
// @visibility external
//<
getValues : function () {

    // Note: this method will not validate each field - to run validators on all the field, a 
    // developer should explicitly call the 'validate()' method on the form (or the item in 
    // question).
    // Call updateFocusItemValue() to ensure that if we have focus our values are up to date.
    // This makes sure that all the active field's value is saved when filtering, saving a
    // form, etc.
    this.updateFocusItemValue();
    
    return this.values;
},


//> @method updateFocusItemValue()
//  If we're currently focused in an item, who's value has been changed since last being
//  saved in this DynamicForm, call item.updateValue().
//<
updateFocusItemValue : function () {
    // During redraw we re-render the HTML for the items and then set item values.
    // Never attempt to pick up the values from the item before that process is complete.
    if (!this.isDrawn() || this._redrawInProgress) return;
    
    var focusItem = this.getFocusSubItem();
	if (!this._setValuesPending) {
	    var checkAllItems = false;
        var items = this.getItems(),
            itemsToTest = [];
        for (var i = 0; i < items.length; i++) {
            if (isc.isA.PasswordItem(items[i])) {
                checkAllItems = true;
                break;
            } else {
                

                // Note that item.changeOnKeypress check is required to avoid handling item value that 
                // was already handled on key press, so first it is not needed and second it leads to 
                // an issue when formatting was applied to item when focus has left the form and getting 
                // value here reads formatted value instead of actual value, which leads to validation failure
                // although real value entered into the item was correct, such issue example:
                // - editing item with format: ",##0.00 €"
                // - enter 900.01
                // - make focus leave the form, formatting applies when focus is lost
                // - formatted item displays "900.01 €"
                // - call form.validate() which eventually calls this method: updateFocusItemValue(), 
                //   which calls formItem.updateValue, which stores "900.01 €"
                //   string value instead of the "real value", which is float 900.01.
                // - validation fails since string value is not a valid float value
                //
                // So, this check avoids updating the value if it was already updated, which is expected 
                // when formItem.changeOnKeypress is true
                if (items[i] == focusItem && focusItem._itemValueIsDirty() && !items[i].changeOnKeypress) {
                    itemsToTest[itemsToTest.length] = items[i];
                    
                } else if (items[i]._getAutoCompleteSetting() == "native") {
                    itemsToTest[itemsToTest.length] = items[i];
                }
            }
        }
        if (checkAllItems) itemsToTest = items;
        for (var i = 0; i < itemsToTest.length; i++) {
            var itemToTest = itemsToTest[i];
            itemToTest.updateValue();
        }
	}
},



//>	@method	dynamicForm.getData()
//			Return the values stored in the form.
//			Pass-through to dynamicForm.getValues();
//		@group	data
//		@return	(Object)	values in the form
//<
getData : function () {
	return this.getValues();
},

//> @method dynamicForm.fetchRelatedData()
// Based on the relationship between the DataSource this component is bound to and the
// DataSource specified as the "schema" argument, call fetchData() to retrieve records in this
// data set that are related to the passed-in record.
// <P>
// Relationships between DataSources are declared via +link{dataSourceField.foreignKey}.
// <P>
// For example, given two related DataSources "orders" and "orderItems", where we want to fetch
// the "orderItems" that belong to a given "order".  "orderItems" should declare a field that
// is a +link{dataSourceField.foreignKey,foreignKey} to the "orders" table (for example, it
// might be named "orderId" with foreignKey="orders.id").  Then, to load the records related to
// a given "order", call fetchRelatedData() on the component bound to "orderItems", pass the
// "orders" DataSource as the "schema" and pass a record from the "orders" DataSource as the
// "record" argument.
//
// @param record              (ListGridRecord) DataSource record
// @param schema              (Canvas | DataSource | ID) schema of the DataSource record, or
//                            DataBoundComponent already bound to that schema
// @param [callback]          (DSCallback)  callback to invoke on completion
// @param [requestProperties] (DSRequest)   additional properties to set on the DSRequest
//                                            that will be issued
//
// @group dataBoundComponentMethods
// @visibility external
//<

//> @groupDef criteriaEditing
// DynamicForms may be used to edit +link{Criteria} or +link{AdvancedCriteria} for filtering 
// data from a DataSource.
// <P>
// The main APIs for this are +link{dynamicForm.getValuesAsCriteria()} and
// +link{dynamicForm.setValuesAsCriteria()}.
// <P>
// <code>getValuesAsCriteria()</code> will return an AdvancedCriteria object in the following
// cases:
// <ul>
// <li>The form was previously passed AdvancedCriteria via <code>setValuesAsCriteria()</code></li>
// <li>The form has a specified +link{dynamicForm.operator} of <code>"or"</code></li>
// <li>+link{FormItem.hasAdvancedCriteria()} returns true for some item(s) within the form</li>
// </ul>
// <P>
// <smartclient>
// Note that at the form item level, individual items can support editing of advanced criteria
// via overrides to the +link{formItem.hasAdvancedCriteria()}, +link{formItem.canEditCriterion()},
// +link{formItem.setCriterion()} and +link{formItem.getCriterion()} methods.
// </smartclient>
// <smartgwt>
// Note that at the form item level, individual items can support editing of advanced criteria
// by registering <code>FormItemCanEditCriterionPredicate</code>, <code>FormItemCriterionSetter</code>,
// and <code>FormItemCriterionGetter</code> objects to implement the methods <code>canEditCriterion()</code>,
// <code>setCriterion()</code>, and <code>getCriterion()</code>, respectively.
// </smartgwt>
// <P>
// There is also built-in support for +link{dynamicForm.allowExpressions, expression-parsing} 
// in DynamicForms.  This allows expressions, like '&gt;5' (greater than 5) or 'a...c' 
// (between a and c) to be edited and generated automatically by appropriate formItems.
// <P>
// Some FormItems have special behavior - for instance, a +link{SelectItem} with 
// +link{SelectItem.multiple, multiple:true} will successfully edit and return criteria with an
// <code>inSet</code> operator.
// <P>
// The common pattern of using nested dynamicForms to edit arbitrary advanced criteria has been
// implemented via overrides to these methods in the +link{CanvasItem} class. See 
// <smartclient>+link{CanvasItem.getCriterion()}</smartclient>
// <smartgwt><code>CanvasItem.setCriterionGetter()</code></smartgwt> for details.
// <P>
// For completely user-driven advanced criteria editing see also the +link{FilterBuilder} class.
//
// @title Criteria Editing
// @treeLocation Client Reference/Forms
// @visibility external
//<


//>	@method	dynamicForm.getValuesAsCriteria()
// Return search criteria based on the current set of values within this form.
// <p>
// The returned search criteria will be a simple +link{Criteria} object, except for
// in the following cases, in which case an +link{AdvancedCriteria} object will be returned:
// <ul>
// <li>The <code>advanced</code> parameter may be passed to explicitly request a 
// <code>AdvancedCriteria</code> object be returned</li>
// <li>If +link{setValuesAsCriteria()} was called with an <code>AdvancedCriteria</code>
//     object, this method will return advanced criteria.</li>
// <li>If +link{dynamicForm.operator} is set to <code>"or"</code> rather than 
//     <code>"and"</code> the generated criteria will always be advanced.</li>
// <li>If any item within this form returns true for +link{FormItem.hasAdvancedCriteria()},
//     which can be caused by setting +link{formItem.operator}, and is always true for
//     items such as +link{DateRangeItem}</li>
// <li>If +link{formItem.allowExpressions} is enabled
// </ul>
// The criteria returned will be picked up from the current values for this form. For simple
// criteria, each form item simply maps its value to it's fieldName. See
// <smartclient>+link{formItem.getCriterion()}</smartclient>
// <smartgwt><code>FormItem.setCriterionGetter()</code></smartgwt>
// for details on how form items generate advanced criteria.
// Note that any values or criteria specified via +link{setValues()} or
// +link{setValuesAsCriteria()} which do not correspond to an item within the form will be
// combined with the live item values when criteria are generated.
// <P>
// The returned criteria object can be used to filter data via methods such as
// +link{ListGrid.fetchData()}, +link{DataSource.fetchData()}, or, for more advanced usage,
// +link{ResultSet.setCriteria()}.
// <P>
// Note that any form field which the user has left blank is omitted as criteria, that is,
// a blank field is assumed to mean "allow any value for this field" and not "this field must
// be blank".  Examples of empty values include a blank text field or SelectItem with an empty
// selection.
//
// @param advanced (boolean) if true, return an +link{AdvancedCriteria} object even if the
//   form item values could be represented in a simple +link{Criterion} object.
// @param [textMatchStyle] (TextMatchStyle) This parameter may be passed to indicate whether
//   the criteria are to be applied to a substring match (filter) or exact match (fetch).
//   When advanced criteria are returned this parameter will cause the appropriate
//   <code>operator</code> to be generated for individual fields' criterion clauses.
//
// @group criteriaEditing
// @return (Criteria | AdvancedCriteria) a +link{Criteria} object, or +link{AdvancedCriteria}
//
// @visibility external
//<


_hasAdvancedCriteria : function (omitHiddenCriteria) {
    if (this.operator != "and" || this.allowExpressions) return true;
    if (!omitHiddenCriteria && this._extraAdvancedCriteria != null) return true; 
    return this.getItems().callMethod("hasAdvancedCriteria").contains(true);
},

getExtraAdvancedCriteria : function () { 
    
    // returns any criteria applied to this form that couldn't be edited
    return this._extraAdvancedCriteria ? isc.clone(this._extraAdvancedCriteria) : null;
},

getItemValuesAsCriteria : function (advanced, textMatchStyle, returnNulls) { 
    // only returns criteria for the current values of accessible FormItems
    if (advanced == null) {
        
        advanced = this._hasAdvancedCriteria(true);
    }
    // this call will return either a simple criterion object, or an array of each item value 
    // as a sub criterion (remapping field name and value according to getCriteraiFieldName() 
    // and getCriteriaValue())
    var values = this._getMappedCriteriaValues(advanced, textMatchStyle);
    if (advanced) {
        // remove any empty criteria entries
        values.removeEmpty();
    } else {
        // Simple criteria:
        // - criteria basically == values object
        // - remap specific items according to getCriteriaFieldName() and getCriteriaValue()
        // - pass through DS.filterCriteriaforFormValues() to clear nulls and handle arrays
        if (returnNulls) return values;
        values = isc.DataSource.filterCriteriaForFormValues(values);
    }
    return values;
},

getValuesAsCriteria : function (advanced, textMatchStyle, returnNulls) {
    
    if (advanced == null) {
        advanced = this._hasAdvancedCriteria();
    }

    // get the criteria for values from fields with an accessible FormItem - this does not 
    // include criteria which were too advanced to be edited, even if a field was accessible
    var criteria = this.getItemValuesAsCriteria(advanced, textMatchStyle, returnNulls)
    
    if (!advanced) {
        // Simple criteria - just return it
        return criteria;
    }
    
    // Advanced criteria:
    // - top level operator comes from form.operator
    // - if there's static criteria (_extraAdvancedCriteria):
    //    1) if it's operator is the same as the form, use it as the wrapper criteria
    //    2) if not, create a wrapper criteria with the correct operator and add the static crit
    // - add the dynamic criteria (from the live fields) into the wrapper 

    var wrapper = { operator:this.operator, _constructor: "AdvancedCriteria", criteria: [] };
    
    // get the "static" criteria that couldn't be edited
    var staticCrit = this.getExtraAdvancedCriteria();
    if (staticCrit && staticCrit.criteria) {
        // if there's static crit and it's got subCrit, its valid - if it has the same operator,
        // use it as the wrapper - otherwise, add it to the wrapper as a subCrit
        if (staticCrit.operator == this.operator) wrapper = staticCrit;
        else wrapper.criteria.add(staticCrit);
    }

    if (criteria && criteria.length > 0) {
        wrapper.criteria.addList(criteria);
    }

    // don't return nonsensical criteria (advanced crit with no sub-crit)
    
    var result = isc.DS.checkEmptyCriteria(wrapper);
    return result;
},

// _getMappedCriteriaValues()
// Pick up the criteria field name and criteria value for each item in the form.
// 
// Combine this with items from the form values object so we don't omit criteria fields
// without a specified item
_getMappedCriteriaValues : function (advanced, textMatchStyle) {
    
    // Note we iterate through all the items in the form, but we also need to look at the
    // form's values object, since there may be values set for fields that have no associated
    // item.
    // Cases where this could happen:
    // - setValues() was called, with a simple values object including fields with no item.
    //   In this case this._extraAdvancedCriteria will have been wiped
    // - the items in the form have changed since setValuesAsCriteria() was called.
    var values = isc.addProperties({},this.getValues()),
        simpleCriteria = {},
        advancedCriteria = [];
        
        
    var items = this.getFields();
    for (var i = 0; i < items.length; i++) {
        if (!items[i].shouldSaveValue) continue;
        var item = items[i],
            itemName = items[i].getTrimmedDataPath() || items[i].getFieldName(),
            // getCriteriaFieldName already handles trimming data path to be relative to the
            // values within this form
            criterionName = items[i].getCriteriaFieldName();
        
        // clear the value from the values object if it has an associated item!
        // We do this so we can retain values that don't have an associated item, but for
        // those that do we can remap values to a new criteria field name and a new
        // value via getCriteriaValue()
        isc.Canvas._clearFieldValue(itemName, values);
        
        if (!advanced) {
            // If the item returns a criteriaFieldName of null, exclude it from the criteria
            // altogether
            if (criterionName != null) {
                // If the values object already contains a value for this "criterionName"
                // because it is a field with both a name and a dataPath, remove the version
                // keyed by name
                if (values[items[i].name]) delete values[items[i].name];
                
                if (items[i].displayField && items[i]._value == null &&
                        values[items[i].displayField] == items[i].emptyDisplayValue)
                {
                    delete values[items[i].displayField];
                }
                // If we're doing an exact match, ensure we convert from user-entered
                // string to actual type value if this is not a 'substring' / 'startswith'
                // match.
                var convertToType = textMatchStyle == null || 
                                    textMatchStyle == "exact" || textMatchStyle == "equals";
                simpleCriteria[criterionName] = items[i].getCriteriaValue(!convertToType);
                
            }
        } else {
            var criterion = item.getCriterion(textMatchStyle);
            if (criterion != null) advancedCriteria.add(criterion);
        }
    }
    // overlay the values from actual items on top of the values from the values object.
    if (!advanced) {
        return isc.addProperties(values, simpleCriteria);
    } else {
        for (var fieldName in values) {
            if (advancedCriteria.find("fieldName", fieldName)) continue;
            // we don't want null values adding as criteria elements
            if (values[fieldName] == null) continue;
            advancedCriteria.add({
                // DF's can be used as a filter (substring match) or a fetch (exact match)
                // allow a textMatchStyle param to configure what operator we produce here
                operator:isc.DataSource.getCriteriaOperator(values[fieldName], textMatchStyle), 
                fieldName:fieldName,
                value:values[fieldName]
            });
        }
        return advancedCriteria;
    }

},    

removeFieldCriteria : function (fieldName, operator, value, criteria) {
    if (!criteria || !criteria.criteria) return false;

    var critArray = criteria.criteria;
    for (var i = critArray.length-1; i>=0; i--) {
        var thisCrit = critArray[i];
        if (thisCrit.criteria) {
            this.removeFieldCriteria(fieldName, operator, value, thisCrit);
            if (thisCrit.criteria.length == 0) critArray.removeAt(i);
        } else {
            if (thisCrit.fieldName == fieldName) {
                // only process stored crit for the specified field
                if (thisCrit.operator != operator || thisCrit.value != value) {
                    // remove if the op or value are different
                    critArray.removeAt(i);
                }
            }
        }
    }
},

// This helper cleans up advancedCriteria entries which are already 
// referenced in explicit criteria that'll apply to items
removeExtraAdvancedCriteria : function (criteria) {
    var fieldNames = isc.getKeys(criteria),
        items = this.items
    ;

    for (var i=0; i< fieldNames.length; i++) {
        var fieldName = fieldNames[i],
            value = criteria[fieldName],
            operator = null,
            item = null
        ;

        // find the appropriate formItem using getCriteriaFieldName()
        items.map(function (mapItem) {
            if (fieldName == mapItem.getCriteriaFieldName()) item = mapItem;
        });

        if (item) {
            // get the specified or default operator for the item
            operator = item.getOperator();
            // remove any stored criteria this field that do not exactly match the new (simple)
            // criteria passed in
            this.removeFieldCriteria(fieldName, operator, value, this._extraAdvancedCriteria);
        }
    }
},


// This helper removes extraAdvancedCriteria whose fieldName matches the specified
// fieldNames. We use this in the recordEditor to clear criteria for fields which have been
// hidden but are explicitly defined when the user clears filter using the menu.
// (Of course this is crude and could be tripped up by custom editors, etc)
removeExtraAdvancedCriteriaFields : function (dropCriteriaFields) {
    for (var i = 0; i < dropCriteriaFields.length; i++) {
        this.removeFieldCriteria(dropCriteriaFields[i], null, null, this._extraAdvancedCriteria);
    }
},


//> @method dynamicForm.setValuesAsCriteria()
// This method will display the specified criteria in this form for editing. The criteria
// parameter may be a simple +link{criterion} object or an +link{AdvancedCriteria} object.
// <P>
// For simple criteria, the specified fieldName will be used to apply criteria to form items,
// as with a standard setValues() call.
// <P>
// For AdvancedCriteria, behavior is as follows:
// <ul>
// <li>If the top level operator doesn't match the +link{dynamicForm.operator,operator} for
//  this form, the entire criteria will be nested in an outer advanced criteria object with
//  the appropriate operator.</li>
// <li>Each criterion within AdvancedCriteria will be applied to a form item if
//  +link{formItem.shouldSaveValue} is true for the item and 
//  +link{formItem.canEditCriterion()} returns true for the criterion in question. By default
//  this method checks for a match with both the <code>fieldName</code> and <code>operator</code>
//  of the criterion. The criterion is actually passed to the item for editing via
//  <smartclient>+link{formItem.setCriterion()}</smartclient>
//  <smartgwt>the <code>FormItemCriterionSetter</code>'s <code>setCriterion()</code> method</smartgwt>.
//  Note that these methods may be overridden for custom
//  handling. Also note that the default <smartclient>+link{CanvasItem.setCriterion()} implementation</smartclient>
//  <smartgwt><code>FormItemCriterionSetter.setCriterion()</code> implementation
//  used by +link{CanvasItem}</smartgwt> handles editing nested criteria via embedded dynamicForms.</li>
// <li>Criteria which don't map to any form item will be stored directly on the form and
//  recombined with the edited values from each item when +link{getValuesAsCriteria()} is
//  called.</li>
// </ul>
// @param criteria (Criterion) criteria to edit.
// 
// @group criteriaEditing
// @visibility external
//<
// advanced parameter used when we're using nested forms to edit advanced criteria. In this
// case we don't have the "AdvancedCriteria" constructor property set on the inner criteria
// but we still want to use the 'advanced' type handling to apply it to our form items.
//
// dropExtraCriteria - used by ListGrid filterEditor to handle the case where there
// are some meaningful criteria applied to fields which aren't defined for the grid
// (or aren't visible, together with the 'dropCriteriaFields' array)
setValuesAsCriteria : function (criteria, advanced, dropExtraCriteria, dropCriteriaFields) {
    var ds = this.getDataSource();
    if (!advanced && !isc.DataSource.isAdvancedCriteria(criteria, ds)) {
        // In this case the criteria passed in is a simple values object of fieldName-> value
        // mappings.
        // We could just do 'setValues(criteria)' and it would work in most cases, however we
        // support having items work with simple criteria but use a different criteria field
        // (EG ComboBoxItem with display field set and addUnknownValues:true).
        // Therefore we want to actually go through all our items and allow them to grab specific
        // criteria they're interested in.
        this._saveValuesAsCriteria(criteria, dropExtraCriteria, dropCriteriaFields);
        
        var items = this.items || [];
        var itemsToClear = [];

        
        if (dropExtraCriteria && (!dropCriteriaFields || dropCriteriaFields.length == 0)) {
            delete this._extraAdvancedCriteria;
        } else if (this._extraAdvancedCriteria) {
            if (this._parseExtraCriteria) {
                // RecordEditor uses this - remove any entries in the stored 
                // _extraAdvancedCriteria that do not appear in the new criteria
                this.removeExtraAdvancedCriteria(criteria);
                var eAC = this._extraAdvancedCriteria;
                
                if (dropExtraCriteria && dropCriteriaFields) {
                    this.removeExtraAdvancedCriteriaFields(dropCriteriaFields);
                }
                
                if (!eAC || !eAC.criteria || eAC.criteria.length == 0) eAC = null;
            } else {
                // normal forms just clear out any stored extra criteria
                delete this._extraAdvancedCriteria;
            }
        }

        for (var i = 0; i < items.length; i++) {
            var item = items[i],
                itemName = item.getFieldName(),
                itemModified = false;
            if (isc.propertyDefined(criteria, itemName) && item.canEditSimpleCriterion(itemName)) {
                item.setSimpleCriterion(criteria[itemName], itemName);
                itemModified = true;
            } else {
                for (var fieldName in criteria) {

                    if (fieldName != itemName && item.canEditSimpleCriterion(fieldName)) {
                        item.setSimpleCriterion(criteria[fieldName], fieldName);
                        itemModified = true;
                        break;
                    }
                }
            }
            if (!itemModified) {
                itemsToClear.add(item);
            }
        }
        
        // Explicitly empty any items we didn't touch
        for (var i = 0; i < itemsToClear.length; i++) {
            if (!itemsToClear[i].shouldSaveValue) {
                continue;
            }
            itemsToClear[i].clearValue();
        }
        
        this.rememberValues();
    } else {
        // Wipe out any existing "values" object.
        // We'll update the values for each item that can edit sub-criterion of the criteria
        // passed in below, which will also store their simple value in the values object,
        // but this ensures we don't hang onto values for stale keys.
        
        var oldValues = this.values;
        this._saveValues({});
    
        // copy the crit object - we don't want to directly manipulate it and confuse other
        // code
        criteria = isc.clone(criteria);
        
        var topOperator = criteria.operator;
        if (topOperator != this.operator) {
            // this doesn't necessarily indicate an error but it might be unexpected.
            // Log a warning and wrap in a top level AC object.
            this.logInfo("Dynamic Form editing advanced criteria object:" +
                isc.Comm.serialize(criteria) + ". Form level operator specified as '" +
                this.operator + "' - Criteria returned from this form will be nested in an outer " +
                this.operator + " clause.", "AdvancedCriteria");
            delete criteria._constructor;
            criteria = {
                _constructor:"AdvancedCriteria",
                operator:this.operator,
                criteria:[criteria]
            }
        }
        
        // We have to determine which items will edit which of the criteria.
        // For each inner criterion - see if we have an item that can edit it. If so,
        // clear it off the stored "extra criteria" and apply it directly to the item for
        // editing. getValuesAsCriteria() will reconstitute it when it runs!
        // Note: Some items have the ability to edit composite ("and" / "or") criteria - for
        // example if editing expressions a user can enter ">1 and <2".
        // This means we can't assume a 1:1 mapping between top level criterion objects and
        // items - we may have to combine multiple top level criteria acting on a particular field
        // into a single composite criterion and apply this to an item.
        // getValuesAsCriteria() simplifies criteria down so we don't need to worry about introducing
        // extra levels of nesting - the returned criteria will be logically equivalent and as 
        // simple as possible.
        
        var items = this.getItems(),
            innerCriteria = criteria.criteria || [],
            assigned = {},
            itemsToClear = {};
        
        for (var i = 0; i < items.length; i ++) {
            itemsToClear[items[i].getID()] = true;
        }            

        for (var i = 0; i < innerCriteria.length; i++) {
    
            for (var ii = 0; ii < items.length; ii++) {
                if (!items[ii].shouldSaveValue) {
                    itemsToClear[items[ii].getID()] = false;
                    continue;
                }
                var item = items[ii];

                if (this.shouldApplyCriterionToItem(items[ii], innerCriteria[i])) {
//                      this.logWarn("applying advanced criterion:" + isc.Comm.serialize(innerCriteria[i]) + 
//                          "to item:" + items[ii]);
                    var itemID = items[ii].getID();
                    if (assigned[itemID] == null) {
                        assigned[itemID] = innerCriteria[i];
                        itemsToClear[itemID] = false;
                    } else {
                        // Do not try to combine criteria for items that express canEditOpaqueValues
                        if (!items[ii].canEditOpaqueValues) {
                            var existingCriteria = assigned[itemID];
                            var compositeCriterion = ds.combineCriteria(
                                existingCriteria, innerCriteria[i],
                                
                                this.operator, null, true);

                            // attempt to compress/flatten the criteria
                            compositeCriterion = isc.DataSource.compressNestedCriteria(compositeCriterion, null, true);

                            
                            if (!item.canEditCriterion(compositeCriterion)) {
                                this.logInfo("setValuesAsCriteria(): criteria include:" +
                                    this.echoFull(existingCriteria) + " and " +
                                    this.echoFull(innerCriteria[i]) + ". Both of these " +
                                    "could be applied to item:" + item +
                                    ". However, the item is unable to edit a composite criterion " +
                                    "resulting from combining these criteria. Therefore " +
                                    this.echoFull(innerCriteria[i]) + " will not be applied to this item",
                                    "AdvancedCriteria");
                                
                                // Don't clear the inner criteria - we'll see if another item can
                                // edit it, otherwise we'll leave it around as "extraAdvancedCriteria"
                                continue;

                            } else {
                                this.logDebug("setValuesAsCriteria(): Combined multiple criteria into " +
                                    "composite criterion:" + 
                                    this.echoFull(compositeCriterion) + " and assigned to item:" + item,
                                    "AdvancedCriteria");
                                assigned[itemID] = compositeCriterion;
                                itemsToClear[itemID] = false;
                            }
                        } else {
                            // Leave it around as "extraAdvancedCriteria"
                            continue;
                        }
                    }
                    innerCriteria[i] = null;
                    // no need to go through the rest of the items for this criterion...
                    break;
    //                 } else {
    //                     this.logWarn("Not applying adv criterion:"
    //                      + isc.Comm.serialize(innerCriteria[i]) + " to item:" + items[ii]);
                }
                
                
            }
        }
        innerCriteria.removeEmpty();
        
        // actually call 'setCriterion' to apply the criteria to the items
        for (var itemID in assigned) {
            var item = window[itemID];
            var value = assigned[itemID];
            if (item.canEditOpaqueValues && value) {
                isc.Canvas._saveFieldValue(null, item, value.value, oldValues, this, true, "criteria");
                value.value = isc.Canvas._getFieldValue(null, item, oldValues, this, true, "edit");
            }
            item.setCriterion(value);
        }

        // Clear any editable fields that aren't editing anything specific in the criterion.
        for (var itemID in itemsToClear) {
            if (!itemsToClear[itemID]) continue;
            var item = window[itemID];
            if (item) item.clearValue();
        }
        // store the fields we're not directly editing -- these will be recombined with
        // live values as part of getValuesAsCriteria();
        
        this._extraAdvancedCriteria = criteria;
    }
},

_saveValuesAsCriteria : function(criteria, dropExtraCriteria, dropCriteriaFields) {
    // if dropExtraCriteria is true, clear all field values that aren't defined in the criteria
    // before saving out the new criteria.
    if (dropExtraCriteria) {
        var undef;
        for (var key in this.values) {
            // Option to specify what extra fields we actually drop
            
            if (dropCriteriaFields && !dropCriteriaFields.contains(key)) continue;
            if (criteria[key] === undef && this.values[key] !== undef) {
                this.clearValue(key);
            }
        }
    }

    for (var key in criteria) {
        var item = this.getItem(key);
        if (item != null) {
            isc.Canvas._saveFieldValue(key, item, criteria[key], this.values, this, true, "criteria");
        } else {
            this.setValue(key, criteria[key]);
        }
    }
    
    // Now go through _saveValues() in order to refresh the ValuesManager
    this._saveValues(this.values);
},

shouldApplyCriterionToItem : function (item, criterion) {
    if (item.canEditCriterion(criterion)) return true;
    if (criterion.fieldName != null && criterion.fieldName == item.getCriteriaFieldName()) {
        // This is actually valid - we may have 2 items in the form used to edit the
        // same field with different operators (for example a number range with ">" and "<" operators)
        this.logInfo("Editing AdvancedCriteria in a dynamicForm. Criteria " +
                    "includes a value for field:" + criterion.fieldName + 
                    ". This form includes an item " + item + " with the same fieldName" +
                    " but the specified operator '" + 
                    criterion.operator + "' does not match the operator for this form item:" + 
                    item.getOperator() +
                    ". Original criterion will be retained and combined with any " +
                    "criterion returned from this item.", "AdvancedCriteria");
    }
    return false;
},

//>	@method	dynamicForm.getValuesAsAdvancedCriteria()
// Return an AdvancedCriteria object based on the current set of values within this form.
// <p>
// Similar to +link{dynamicForm.getValuesAsCriteria()}, except the returned criteria object
// is guaranteed to be an AdvancedCriteria object, even if none of the form's fields has a
// specified +link{formItem.operator}
//
// @param [textMatchStyle] (TextMatchStyle) If specified the text match style will be used to
//   generate the appropriate <code>operator</code> for per field criteria.
// @group criteriaEditing
// @return (AdvancedCriteria) a +link{AdvancedCriteria} based on the form's current values
//
// @visibility external
//<
getValuesAsAdvancedCriteria : function (textMatchStyle, returnNulls) {
    return this.getValuesAsCriteria(true, textMatchStyle, returnNulls);
    
},

//> @attr dynamicForm.isSearchForm (Boolean : false : IRA)
// Is this form a "search form", used to edit filter criteria?
// <P>
// Marking a dynamicForm as a search form may cause differences in appearance, in which
// items are created for various data types, and in behaviors such as validation.
// See the +link{SearchForm} class for more information.
// @visibility internal
//<
// Undocumented for now

//isSearchForm:false,

//> @attr dynamicForm.useMultiSelectForValueMaps (boolean : true : IRW)
// When creating a SelectItem within a Search Form for editing criteria for a field with a ValueMap,
// should the SelectItem default to +link{SelectItem.multiple,multiple:true}?
// <P>
// Note that for ListGrids showing a +link{listGrid.showFilterEditor,filterEditor}, this property
// will be derived from +link{listGrid.useMultiSelectForFilterValueMaps}
// @visibility internal
//<
// Exposed on the SearchForm class
useMultiSelectForValueMaps:true,

shouldUseMultiSelectForValueMaps : function () {
    return (this.useMultiSelectForValueMaps && this.isSearchForm);
},

//>	@method	dynamicForm.getItem()
// Retrieve a +link{FormItem} in this form by it's +link{formItem.name,name},
// +link{formItem.dataPath,dataPath}, or index within
// the +link{dynamicForm.items,items} array.
// <P>
// FormItems that also have a +link{formItem.ID} may be accessed directly as a global variable
// <code>window[itemID]</code> or just <code>itemID</code>
//
// @param itemName (String | int) name of the item you're looking for
//
// @return (FormItem) FormItem object or null if not found
// @see getItem()
// @group items
// @visibility external
//<
getItem : function (itemName, isFieldName) {
    // if passed a null itemName, just bail
    if (itemName == null) return null;

    if (isc.isA.FormItem(itemName)) return itemName;

    var item = isc.Class.getArrayItem(itemName, this.items, this.fieldIdProperty);

    if (item != null) return item;
    
    // handle being passed a dataPath
    if (isc.isA.String(itemName)) {
        var targetDataPath = isc.DynamicForm._trimDataPath(itemName, this);
        for (var i = 0; i < this.items.length; i++) {
            var path = this.items[i].dataPath;
            path = isc.DynamicForm._trimDataPath(path, this);
            if (path == targetDataPath) return this.items[i];
        }
    }
    
    // If we couldn't find an item with the same name - check that we weren't passed 
    // a quoted index (like the string "0")
    
    if (!isFieldName && isc.isA.Number(itemName - 1)) {
        return this.items[parseInt(itemName)];
    }
    
    return null;
},

//>	@method	dynamicForm.getField()   ([])
// Synonym for dynamicForm.getItem()
//
// @param itemName (FieldName) name of the item you're looking for
//
// @return (FormItem) FormItem object or null if not found	
// @see getItem()
// @group items
// @visibility external
//<
getField : function (fieldID) {
	return this.getItem(fieldID);
},


//>	@method	dynamicForm.getSubItem()
//			Synonym for getItem()
//		@group	items
//		@param	itemID		(String)	name of the element you're looking for.
//		@return	(Object)	form item object, or null if not found	
//      @deprecated As of SmartClient 5.5, use +link{dynamicForm.getItem}.
//<
getSubItem : function (itemID) {
    return this.getItem(itemID);
},

//>	@method	dynamicForm.getItemById()
//    Gets a pointer to a form item from it's global ID.
//    (the form item is also available globally as window[itemID])
//
//		@param	itemID		(String)	ID of the element you're looking for.
//		@return	(Object)	form item object or null if not found	
//<
getItemById : function (itemID) {
    var item;

    if (isc.isA.String(itemID)) {
        item = window[itemID];
    } else item = itemID;

	if (isc.isA.FormItem(item)) return item;
    return null;
},


//>	@method	dynamicForm.getValue()  ([])
// Returns the value stored in the form for some field.
//      @visibility external
//		@group formValues
//
//		@param	fieldName (String)    name of the field for which you're retrieving a value. Nested
//          values may be retrieved by passing in a +link{type:DataPath}
//		@return	(Any)	value of the field
//      @example dateItem
//<
getValue : function (fieldName, reason) {
    
 	var item = this.getItem(fieldName);
 	if (item) {
 	    if (item.shouldSaveValue == false) {
 	        return item.getValue();
 	    }
 	    var fieldName = item.getTrimmedDataPath() || item.name;
 	}
    return this._getValue(fieldName, reason);
},

_getValue : function (fieldName, reason) {
    return isc.DynamicForm._getFieldValue(fieldName, null, this.values, this, true, reason);
},

//>	@method	dynamicForm.setValue()  ([])
//   Sets the value for some field
//		@group formValues
//
//		@param	fieldName   (String)	Name of the field being updated. A +link{type:DataPath} may 
//                          be passed to set nested values
//		@param	value		(String)	New value.
//      @visibility external
//<

storeAtomicValues:false,
setValue : function (fieldName, value, updatingDisplayValue) {
	var item = this.getItem(fieldName, updatingDisplayValue);
    // setValue on the item will update this.values.
    
    if (item != null) {
        
        if (item.destroyed) return;

        // Handle this being a field with an 'opaque' data type with a get/set atomic value method
        // If this is the case, extract the atomic value and pass it to the item.
        if (!this.storeAtomicValues && !item.canEditOpaqueValues) {
            var type = item.type ? isc.SimpleType.getType(item.type) : null;
            if (type && type.getAtomicValue && type.updateAtomicValue) {
                // store the new atomic type on our values object
                
                fieldName = item.getTrimmedDataPath() || item.name;
                this._saveValue(fieldName, value);
                // extract the atomic value which we'll pass to item.setValue()
                value = type.getAtomicValue(value);
            }
        }
        return item.setValue(value);

    } else if (this.values != null) {
        this._saveValue(fieldName, value);
        return value;
    }
},

//> @method dynamicForm.clearValue()
// Clears the value for some field via a call to +link{FormItem.clearValue()} if appropriate.
// If there is no item associated with the field name, the field will just be cleared within
// our stored set of values.
// @param fieldName (String) Name of the field being cleared. A +link{type:DataPath} may be used for
//  clearing details of nested data structures. 
// @visibility external
//<
clearValue : function (fieldName) {
    var item = this.getItem(fieldName);
    if (item != null) item.clearValue();
    else if (this.values) isc.DynamicForm._clearFieldValue(fieldName, this.values);
},

//>	@method	dynamicForm.showItem()  ([])
// Show a form item via +link{FormItem.show()}
//		@group formValues
//
//		@param	itemName    (String)	Name of the item to show
//      @visibility external
//<
showItem : function (fieldName) {
	var item = this.getItem(fieldName);
    if (item != null) return item.show();
},

//>	@method	dynamicForm.hideItem()  ([])
// Hide a form item via +link{FormItem.hide()}
//		@group formValues
//
//		@param	itemName    (String)	Name of the item to show
//      @visibility external
//<
hideItem : function (fieldName) {
	var item = this.getItem(fieldName);
    if (item != null) return item.hide();
},

// This flag is used by DataBoundComponent.fieldShouldBeVisible()
_supportsFieldVisibleAttribute:true,

//>	@method	dynamicForm.saveItemValue()
// Save the value passed in in the values array associated with the item.
//		@group formValues
//
//		@param	item		(FormItem)	Item to save value for (cannot be a string or number, etc).
//		@param	value		(String)	New value to set.
//<
saveItemValue : function (item, value) {
	// if this is not supposed to be included in our values array, return
	if (item.shouldSaveValue == false) return;
    var dataFieldID = item.getDataPath() || item.getFieldName();

    if (dataFieldID == null) return;
    if (item.canEditOpaqueValues) {
        // Don't pass in the field object, or it will call updateAtomicValue() even though we
        // know we are dealing with opaque values
        var trimmedDataPath = isc.Canvas._getDataPathFromField(item, this);
        this._saveOpaqueValue(trimmedDataPath, value);
    } else {
        this._saveAtomicValue(item, value);
    }
    
    // If this is an item with a display field, store the display field value as well.
    // This will update any auto-generated valueMap for the field.
    
    
    this.itemDisplayValueModified(item, value);
    
    //this.logWarn("saveItemValue: " + itemName + ": " + this.echoLeaf(value));
    // Mark the item as no longer being dirty
    item._markValueAsNotDirty(); 
},

//> @attr DynamicForm.storeDisplayValues (Boolean : true : IRA)
// For editable fields with a specified +link{formItem.displayField} and 
// +link{formItem.optionDataSource}, if the user selects a new value (typically from
// PickList based item such as a SelectItem), should the selected displayValue be updated
// on the record being edited in addition to the value for the actual item.<br>
// Note that this only applies for fields using 
// +link{formItem.useLocalDisplayFieldValue,local display field values} - typically
// +link{dataSourceField.foreignKey,foreignKey fields} where the display field is
// +link{dataSourceField.includeFrom,included from} another dataSource.
// <P>
// Default value is <code>true</code>. This is typically desirable for editing records
// with a displayField-mapped field, as it ensures the edited record will be be updated
// to contain the correct display value as well as the correct data value. As such, the
// expected display value is available on the record for display (for example in a ListGrid
// cell).
// <P>
// It may not be desirable for an interface specifically intended for 
// +link{dynamicForm.getValuesAsCriteria, gathering criteria} - in this case, results ought
// to be limited by an item's actual selected value, not by whatever text is displayed to 
// the user.
// <P>
// See +link{dataSourceField.displayField} for more details.
// <P>
// Note: the modified display field value will be passed to the server along with the
// modified foreignKey field value if a 
// +link{dynamicForm.saveData(),databound update operation} is performed. This occurs
// even if the displayField is
// +link{dataSourceField.includeFrom,included from another DataSource} and therefore
// read-only. In this case the server will simply ignore the modified display field value.
// This is as expected - a subsequent fetch for the same record would recalculate the
// displayField value on the server using the updated foreignKey field value (and return
// the same display value previously displayed to the user).
// <P>
// This attribute can also be set for +link{formItem.storeDisplayValues, individual items}.
// @visibility external
//<
storeDisplayValues: true,

// Called from saveItemValue, and also called from FormItem._fetchMissingDisplayFieldValueReply
itemDisplayValueModified : function (item, value) {
    var dataFieldID = item.getDataPath() || item.getFieldName();

    if (!this._useDisplayFieldValue(item) || (item.displayField == dataFieldID)) return;

    
    // storeDisplayValues attribute allows developers to explicitly indicate whether
    // for fields with a valueField and displayField specified, both values should be
    // updated when a user selects a new optionDataSource record.
    if (this.storeDisplayValues == false || item.storeDisplayValues == false) return;

    var displayValue = item.mapValueToDisplay(value);

    // if displayValue was set to {formItem}.emptyDisplayValue, this means that data 
    // value is empty (i.e. is null). {formItem} here stands for items that support 
    // emptyDisplayValue, like SelectItem/ComboBoxItem/etc, for other items this check 
    // would be always false, since emptyDisplayValue would be undefined.
    // So, we do not want to save emptydisplayValue (which can be set to some string as 
    // part of UI) as displayField value if data value is empty (null), therefore we save 
    // null as value for displayField as well.
    if (displayValue == item.emptyDisplayValue) displayValue = null;

    this.setValue(item.displayField, displayValue, true);
},

// _saveValue and _saveValues - actually update this.values

_$slash:"/",
// _saveAtomicValue() - this is fired from 'saveItemValue' - IE the user has edited an atomic value
// (a string etc) and we need to save it.
// If the field has a specified simpleType with 'setAtomicType()' we'll make use of it here.
_saveAtomicValue : function (field, value) {
    this._saveValue(field, value, true);
},
_saveOpaqueValue : function (field, value) {
    this._saveValue(field, value, false);
},
_saveValue : function (field, value, isAtomicValue) {
    
    
    var fieldName, origFieldName;
    origFieldName = fieldName = field;
    field = this.getField(fieldName);
    var origField = field;
    if (this.storeAtomicValues && (!field || !field.canEditOpaqueValues)) {
        if (isc.isAn.Object(fieldName)) {
            fieldName = field.getTrimmedDataPath() || field[this.fieldIdProperty];
            field = null;
        }
    } else {
        
        if (!isc.isA.String(fieldName)) {
            // we'll handle extracting the fieldName in DBC._saveFieldValue
            
            fieldName = null;
        } else {
            if (isAtomicValue) {
                field = this.getField(fieldName);
                if (field == null) {
                    var ds = this.getDataSource();
                    if (ds) field = ds.getField(fieldName) || ds.getFieldForDataPath(fieldName);
                }
            } else {
                field = null;
            }
        }
    }
    
    isc.DynamicForm._saveFieldValue(fieldName, field, value, this.values, this, true, "updateValue");
    
    field = origField;
    
    

    this._updateRuleScopeValues(field, fieldName, value);

    // If this form is part of a valuesManager, notify that of the change.
    // Note that the presence of a selectionComponent means we skip this - instead of 
    // interacting with the VM values object directly, our selectionComponent will interact
    // with the VM values
    var selComponent = this.selectionComponent;
    if (!selComponent && this.valuesManager != null) {
        // If called during init, we may have not yet been added to the valuesManager as a member
        // or vm may be set to an ID, etc
        if (isc.isA.ValuesManager(this.valuesManager) && this.valuesManager.members &&
            this.valuesManager.members.contains(this)) 
        {
            // Normalize to a string - that's what _updateValue on the VM expects to be passed.
            if (!isc.isA.String(origFieldName)) {
                origFieldName = origFieldName.dataPath || origFieldName.name;
            }
            this.valuesManager._updateValue(origFieldName, value, this);
        }
    }    
},

// clearItemValue()
// Internal method to clear the value for some field from the values object for this form.
// Called from item.clearValue()
clearItemValue : function (item) {
    var fieldName = isc.DynamicForm._combineDataPaths(this.dataPath, item.getDataPath() ||
                                                                     item.getFieldName());

    isc.DynamicForm._clearFieldValue(fieldName, this.values);
    this._updateRuleScopeValues(item, fieldName, null);

    if (!this.selectionComponent && isc.isA.ValuesManager(this.valuesManager) && 
         this.valuesManager.members && this.valuesManager.members.contains(this)) 
    {
        this.valuesManager._clearValue(fieldName, this);
    }
},

_updateRuleScopeValues : function (field, fieldName, value, noChangeEvent) {
    if (this._suppressRuleContextUpdates) return;

     
    if ((this.grid == null || !this._settingValues) &&
        (this.ruleScope || this.isRuleScope) &&
        (fieldName || (field && field.name)))
    {
        fieldName = fieldName || field.name;
        var ds = this.getDataSource(),
            hasStableID = this.hasStableLocalID() || this.grid || (this.editNode != null)
        ;
        if (ds && isc.isA.DataSource(ds) && this._populateSharedRuleContext != false) {
            this.provideRuleContext(ds.getID() + "." + fieldName, value,
                this, null, noChangeEvent || hasStableID || this._setValuesPending || (!noChangeEvent && this._fireRuleContextOnItemChange));
        }
        if (hasStableID) {
            // Suppress ruleContextChanged events during initial draw. A single event is raised
            // when rememberValues() is called.
            var gridRefreshing = field && field._gridRefresh,
                suppressChangeEvent = this._initialDraw || this._settingValues ||
                                      this._setValuesPending || gridRefreshing
            ;
            this.provideRuleContext(this.getLocalId() + ".values." + fieldName, value,
                this, null, true);
            if (!this._settingValues) {
                var hasChangesPath = this.getLocalId() + ".hasChanges";
                

                
                var hasChanges = this.valuesHaveChanged(false, this.values);
                
                this.provideRuleContext(hasChangesPath, hasChanges,
                    this, null, noChangeEvent || suppressChangeEvent);
            }
        } else if (!noChangeEvent && this._fireRuleContextOnItemChange) {
            this.fireRuleContextChanged(this);
        }
    }
},

// _saveValues() updates this.values with the object passed in

_saveValues : function (values) {
    
    this.values = values;
    
    //>ValuesManager    If this form is part of a valuesManager, notify that of each field 
    // affected by the change
    if (!this.selectionComponent && isc.isA.ValuesManager(this.valuesManager) && 
         this.valuesManager.members && this.valuesManager.members.contains(this)) 
    {
        var oldFields = isc.getKeys(this.values);
        for (var fieldName in values) {
            this.valuesManager._updateValue(fieldName, values[fieldName], this);
            oldFields.remove(fieldName);
        }
        // Clear any values in the VM that have been cleared by this
        for (var i = 0; i < oldFields.length; i++) {
            this.valuesManager._clearValue(oldFields[i], this);
        }
    }   //<ValuesManager
},

//>	@method	dynamicForm.getSavedItemValue()
// Save the value passed in in the values array associated with the item.
//		@group formValues
//
//		@param	item		(FormItem)	Form item instance to check for the saved item value
//		@return	(Any)					Value saved for that item
//<
getSavedItemValue : function (item) {
    // If this is marked as a value we don't want to save, skip it.
	if (item.shouldSaveValue == false) return null;
	
	var	fieldName = isc.DynamicForm._combineDataPaths(this.dataPath, item.getDataPath() || 
                                                                     item.getFieldName());
    return this._getValue(fieldName);
},


//>	@method	dynamicForm.resetValue()
//		@group formValues
//
//		@param	itemName		(String)	name of the element you're looking for
//<
resetValue : function (itemName) {
	var item = this.getItem(itemName);
	return (item ? item.resetValue() : null);
},



//>	@method	dynamicForm.getValueMap()
//		return the valueMap for a specified item
//		@group formValues
//		@param	itemName		(String)	name of the element you're looking for
//<
getValueMap : function (itemName) {
	var item = this.getItem(itemName);
	return (item ? item.getValueMap() : null);
},

//>	@method	dynamicForm.setValueMap()
// Set the valueMap for a specified item
// @group formValues
// @param itemName (String) itemName of the item upon which the valueMap should be set.
// @param valueMap (ValueMap) new valueMap for the field in question.
// @visibility external
//<
setValueMap : function (itemName, valueMap) {
	var item = this.getItem(itemName);
	return (item ? item.setValueMap(valueMap) : null);
},

//>	@method	dynamicForm.getOptions()
//		Get the options for a specified item.  Pass-through to form.getValueMap()
//		@group formValues
//		@param	itemName		(String)	name of the element you're looking for
//<
getOptions : function (itemName) {
	return this.getValueMap(itemName);
},

//>	@method	dynamicForm.setOptions()
//		Set the options for a specified item.  Pass-through to form.setValueMap()
//		@group formValues
//		@param	itemName		(String)			name of the element you're looking for
//		@param	valueMap	(Array | Object)	new value map to set
//<
setOptions : function (itemName, valueMap) {
	return this.setValueMap(itemName, valueMap);
},

//>	@method	dynamicForm.getForm()
// Return the DOM form object.  Returns null if not found
//
//		@param	[form]		(Form | String | number)	identifier for the form or an actual form
//
//		@return	(Form)	Form object
//<
getForm : function (form) {
	var args = (form == null ? [this.getFormID()] : arguments);
	return this.Super("getForm", args);
},

//>	@method	dynamicForm.getFormID()	(A)
//		@group	drawing
//			return the ID for this form
//
//		@return	(String)	ID for this form in the DOM
//<
_$form:"form",
getFormID : function () {
    return this._getDOMID(this._$form);
},

getSerializeableFields : function(removeFields, keepFields) {
    removeFields = removeFields || [];
	
    // items and fields are the same thing, but items is deprecated and printing both would
	// produce a backref - so remove one of them
	removeFields.addList(["items"]);
		
	return this.Super("getSerializeableFields", [removeFields, keepFields], arguments);
},

// Form Sections
// --------------------------------------------------------------------------------------------

//> @attr DynamicForm.canTabToSectionHeaders (boolean : null : IRA)
// If true, the headers for any +link{SectionStackSection.items,SectionItems} will be included in the page's tab
// order for accessibility. May also be set at the item level via +link{SectionItem.canTabToHeader}
// <P>
// If unset, section headers will be focusable if <smartclient>+link{isc.setScreenReaderMode}</smartclient>
// <smartgwt>{@link com.smartgwt.client.util.SC#setScreenReaderMode SC.setScreenReaderMode()}</smartgwt> 
// has been called.
// See +link{group:accessibility}.
//
// @visibility external
//<

expandSection : function (sectionID) {
    var section = this.getItem(sectionID);
    if (isc.isA.SectionItem(section)) section.expandSection();
},

collapseSection : function (sectionID) {
    var section = this.getItem(sectionID);
    if (isc.isA.SectionItem(section)) section.collapseSection();
},

// Notification functions fired when a section is about to be expanded or collapsed - allows
// us to handle mutex sections.
_sectionExpanding : function (section) {
    
    if (this.isDrawn()) {
        this._specifiedNotifyAncestorsOnReflow = this.notifyAncestorsOnReflow;
        this.notifyAncestorsOnReflow = true;
    }

    if (this.sectionVisibilityMode == "mutex" && this._lastExpandedSection &&
         this._lastExpandedSection != section) 
    {
        this._lastExpandedSection.collapseSection();
    }
    this._lastExpandedSection = section;
},

_sectionCollapsing : function (section) {
    if (this.isDrawn()) {
        this._specifiedNotifyAncestorsOnReflow = this.notifyAncestorsOnReflow;
        this.notifyAncestorsOnReflow = true;
    }
    
},

// Validation error management
// --------------------------------------------------------------------------------------------

//> @method dynamicForm.getErrors()
// Returns any errors that are currently visible to the user for this form, without performing
// validation.
//
// @return (Object) Errors are returned as an object of the format<br>
// <code>{fieldName:errors, fieldName:errors}</code><br>
// where each <code>errors</code> object will be either an error message string or an array
// of error message strings.
// @group errors
// @visibility external
//<
getErrors : function () {
    return this.errors;
},


//> @method dynamicForm.getFieldErrors()
// Returns any errors that are currently visible to the user for the specified field in this
// form, without performing validation.
//
// @param fieldName (String) fieldName to check for errors
// @return (String | Array of String) Error message string, or if there is more than one error
//      associated with this field, array of error message strings.
// @group errors
// @visibility external
//<
// Note that the fieldName doesn't have to be associated with a form item - this could be
// a validator on a dataSource field too.
getFieldErrors : function (fieldName) {
    if (!this.errors) return null;
    var dataPath;
    if (isc.isA.FormItem(fieldName)) {
        var formItem = fieldName;
        fieldName = formItem.getFieldName();
        dataPath = this.buildFieldDataPath(this.getFullDataPath(), formItem)
    }
    var err = this.errors[fieldName];
    if (isc.isA.String(err) || isc.isAn.Array(err)) {
        return err;
    }
    if (dataPath != null) {
        //var err = this.getDataPathErrors(dataPath);
        if (isc.isA.String(err) || isc.isAn.Array(err)) return err;
    }
    return null;
},

getDataPathErrors : function (dataPath) {
    var elements = dataPath.split("/");
    var work = this.errors;
    for (var i = 0; i < elements.length; i++) {
        work = work[elements[i]];
        if (!work) return null;
    }
    return work;
},


//>	@method	dynamicForm.setErrors() ([A])
// Setter for validation errors on this form. Errors passed in should be a Javascript object
// of the format<br>
// <code>{fieldName1:errors, fieldName2:errors}</code><br>
// Where the <code>errors</code> value may be either a string (single error message) or an
// array of strings (if multiple errors should be applied to the field in question).
// @param	errors		(Object)	list of errors as an object with the field names as keys
// @param  showErrors  (boolean)   
//      If true redraw form to display errors now. Otherwise errors can be displayed by calling
//      +link{DynamicForm.showErrors()}<br>
//      Note: When the errors are shown, 
//      +link{dynamicForm.handleHiddenValidationErrors(), handleHiddenValidationErrors()} will
//      be fired for errors on hidden fields, or with no associated formItem.
//		@group	errors
//      @visibility external
//<
setErrors : function (errors, showErrors) {

    var hadErrors = this.hasErrors();
    this.errors = isc.DynamicForm.formatValidationErrors(errors);
    var hasHiddenErrors = false,
        hiddenErrors = {};
        
    this._updateFormHasErrorsInRuleScope(hadErrors);

    for (var fieldName in this.errors) {
        var item = this.getItem(fieldName);
        if (!item || !item.visible) {
            hiddenErrors[fieldName] = this.errors[fieldName];
            hasHiddenErrors = true;
        }
    }
    
    // pass in current set of hidden errors - we know they're up to date so no need to
    // call 'getHiddenErrors()' again
    if (showErrors) this.showErrors(this.errors, hiddenErrors);
    
},

//>	@method	dynamicForm.setError()  ([A])
//          Sets error message(s) for the specified itemName to the error string or array of
//          strings. You must call form.markForRedraw() to display the new error message(s).<br>
//          <b>Note:</b> you can call this multiple times for an individual itemName
//			 which will result in an array of errors being remembered.
//
//		@param	itemName		(String)	name of the item to set
//		@param	errorMessage	(String | Array)	error message string or array of strings
//		@group	errors
//      @visibility external
// @deprecated This method has been deprecated as of SmartClient release 5.7.
//  Use +link{DynamicForm.addFieldErrors()} or +link{DynamicForm.setFieldErrors()} instead
//<
setError : function (itemName, errorMessage) {
    var hadErrors = this.hasErrors(),
        oldError = this.errors[itemName];
	if (!oldError) {
        this.errors[itemName] = errorMessage;
    } else {
		if (isc.isA.String(oldError)) this.errors[itemName] = [oldError, errorMessage];
		else this.errors[itemName].add(errorMessage);
	}
    this._updateFormHasErrorsInRuleScope(hadErrors);
},





//>	@method	dynamicForm.addFieldErrors()
// Adds field validation error[s] to the specified field. Errors passed in will be added
// to any existing errors on the field caused by validation or a previous call to this method.
// <br>
// The errors parameter may be passed in as a string (a single error message), or an array of
// strings.<br>
// The showErrors parameter allows the errors to be displayed immediately. Alternatively, call
// +link{DynamicForm.showFieldErrors()} to display the errors for this field.
// @param fieldName (String) field to apply the new errors to
// @param errors (String | Array of String) errors to apply to the field in question
// @param show (boolean) If true this method will fall through to +link{dynamicForm.showFieldErrors} 
// to update the display
// @group errors
// @visibility external
//<
// Not clear whether this is necessary in addition to 'setFieldErrors()', but this matches
// the previous 'setError()' method implementation, which was public in 5.6.
addFieldErrors : function (fieldName, errors, showErrors) {
    var hadErrors = this.hasErrors();
    if (!this.errors) this.errors = {};
    
    this.addValidationError(this.errors, fieldName, errors);

    this._updateFormHasErrorsInRuleScope(hadErrors);

    // Don't bother updating hiddenErrors - this will be updated by 
    // showErrors() / showFieldErrors()
    if (showErrors) this.showFieldErrors(fieldName);
},

//>	@method	dynamicForm.setFieldErrors()
// Set field validation error[s] for some field.<br>
// The errors parameter may be passed in as a string (a single error message), or an array of
// strings.<br>
// The showErrors parameter allows the errors to be displayed immediately. Alternatively, an
// explicit call to +link{DynamicForm.showFieldErrors()} will display the errors for this field.
// @param fieldName (String) field to apply the new errors to
// @param errors (String | Array of String) errors to apply to the field in question
// @param show (boolean) If true this method will fall through to +link{dynamicForm.showFieldErrors} 
// to update the display
// @group errors
// @visibility external
//<
setFieldErrors : function (fieldName, errors, showErrors) {
    var hadErrors = this.hasErrors();
    if (this.errors == null) this.errors = {};

    // if we'd just be re-applying the same errors, then bail out now
    if (isc.Canvas.compareValues(this.errors[fieldName], errors)) {
        return false;
    }
    this.errors[fieldName] = errors;
    
    this._updateFormHasErrorsInRuleScope(hadErrors);

    // Don't bother updating hiddenErrors - this will be updated by 
    // showErrors() / showFieldErrors()
    
    if (showErrors) this.showFieldErrors(fieldName);

    return true;
},

//> @method dynamicForm.clearFieldErrors()
// Clear any validation errors on the field passed in.
// @param fieldName (String) field to clear errors from
// @param show (boolean) If true this method will fall through to +link{dynamicForm.showFieldErrors} 
// to update the display 
// @group errors
// @visibility external
//<
clearFieldErrors : function (fieldName, show, suppressAutoFocus) {
    if (this.errors == null) return;
    if (!this.errors[fieldName]) return;
    
    delete this.errors[fieldName];
    this._updateFormHasErrorsInRuleScope(true);
    if (show) {
        this.showFieldErrors(fieldName, suppressAutoFocus);
    }
},

// Helper to clear a specific error message from a field's errors.
clearFieldError : function (fieldName, error, show) {
    if (this.errors == null || !this.errors[fieldName]) return;
    var fieldErrors = this.errors[fieldName];
    if (!isc.isAn.Array(fieldErrors)) {
        if (fieldErrors == error) {
            delete this.errors[fieldName];
        }
    } else {
        if (fieldErrors.contains(error)){
            fieldErrors.remove(error);
        }
        if (fieldErrors.length == 0) delete this.errors[fieldName];
    }
    this._updateFormHasErrorsInRuleScope(true);
    if (show) this.showFieldErrors(fieldName);        
},

//>	@method	dynamicForm.clearErrors()   ([])
//	Clears all errors for this DynamicForm.
// @param show (boolean) If true, redraw the form to clear any visible error messages.
// @group	errors
// @visibility external
//<
clearErrors : function (show) {
	this.setErrors({}, show);
},


//>	@method	dynamicForm.hasErrors()
// Returns whether there are currently any errors visible to the user for this form, without
// performing validation.
// <P>
// Note that validation errors are set up automatically by validation (see +link{validate()}),
// or may be explicitly set via +link{dynamicForm.setErrors()} or 
// +link{dynamicForm.setFieldErrors()}.
// @return (Boolean) true if the form currently has validation errors.
// @group errors
// @visibility external
//<
hasErrors : function () {
	var errors = this.errors;
	if (!errors) return false;
    for (var name in errors) {
		if (errors[name] != null) return true;
	}
	return false;
},

//> @method dynamicForm.hasFieldErrors()
// Returns whether there are currently any errors visible to the user for the specified field in
// this form, without performing any validation.
// <P>
// Note that validation errors are set up automatically by validation (see +link{validate()}),
// or may be explicitly set via +link{dynamicForm.setErrors()} or
// +link{dynamicForm.setFieldErrors()}.
// @param fieldName (String) field to test for validation errors
// @return (Boolean) true if the form has outstanding errors for the field in question.
// @group errors
// @visibility external
//<
hasFieldErrors : function (fieldName) {
	var errors = this.errors;
	return (errors && errors[fieldName] != null);
},


// Drawing and redrawing
// --------------------------------------------------------------------------------------------

//>	@method	dynamicForm.draw()	(A)
// Focuses in the first form field on idle
//
//		@group	drawing
//
//		@param	[document]		(DOM Document)	document to draw in
//
//		@return	()
//<
_$_delayedSetValues:"_delayedSetValues",
_$_delayedSetValuesFocus:"_delayedSetValuesFocus",
draw : function (a,b,c,d) {
    if (isc._traceMarkers) arguments.__this = this;
	// draw the form as normal
    if (!this.readyToDraw()) return this;
    
    // Notification that items are about to draw()
    
    this._itemsDrawing();
    
    // While drawing, suppress ruleContext updates so rules aren't processed
    // for each FormItem. Once drawing is complete, the delayed setValues() call
    // will take care of updating ruleContext.
    this._suppressRuleContextUpdates = true;

    this.invokeSuper(isc.DynamicForm, this._$draw, a,b,c,d);
    
    // We've now written all our items into the DOM - notify them that they are drawn!
    this._itemsDrawn();

    // Re-enable ruleContext updates
    delete this._suppressRuleContextUpdates;

    
    var shouldFocus = this.autoFocus,
        functionName = (!shouldFocus ? this._$_delayedSetValues : this._$_delayedSetValuesFocus);
    this._setValuesPending = true;
	    
    // If there is an outstanding delayed setValues call, cancel it because this new
    // one will take care of the same thing. Don't just let the previous one fire because
    // the new functionName may be different.
    var eventId = this._delayedSetValuesEventId;
    if (eventId != null) {
        isc.Page.clearEvent(isc.EH.IDLE, eventId);
    }
    this._delayedSetValuesEventId = isc.Page.setEvent(isc.EH.IDLE, this, isc.Page.FIRE_ONCE, functionName);

    
    if (this.position == isc.Canvas.RELATIVE) {
        isc.Page.setEvent(isc.EH.LOAD, this, isc.Page.FIRE_ONCE, "_placeCanvasItems");
    }

    return this;    
},

_createItemWhenRules : function (items) {
    var rules = [],
        affectedItems = [],
        ruleScope = this.getRuleScope()
    ;
    for (var i = 0; i < items.length; i++) {
        if (items[i]._createdItemWhenRules) {
            continue;
        }

        var item = items[i],
            rulesCount = rules.length
        ;

        // A canvas inherits ruleScope from its parent but in the case of a FormItem
        // it's not a Canvas and therefore would require an explicit ruleScope setting
        // just like any other non-Canvas instance. To make this process easier,
        // a ruleScope is pushed into the FormItem. Note that this isn't necessary for
        // *When rules or for normal ruleContext updates but is useful for setting a
        // dynamicProperty on a form field.
        if (ruleScope && !item.ruleScope) item.ruleScope = ruleScope;

        if ((!item.showIf && item.visibleWhen) || 
                (!item.requiredIf && item.requiredWhen) || 
                item.readOnlyWhen || 
                (item.formula && !isc.isA.emptyObject(item.formula)) || 
                (item.textFormula && !isc.isA.emptyObject(item.textFormula)))
        {
            // An item with no 'name' defined cannot be assigned to a rule
            // and is ignored. A warning is logged below.
            var badProperties = (item.name == null ? [] : null);
            if (!item.showIf && item.visibleWhen) {
                if (isc.disableRuleScope) {
                    this.logWarn("Attempt to define FormItem visibleWhen criteria while RuleScope has been explicitly disabled (isc.disableRuleScope=true). Criteria will be ignored.")
                    continue;
                }
                if (badProperties) {
                    badProperties.add("visibleWhen");
                } else {
                    rules.add(this._createWhenRule("visibility", item.visibleWhen, {fieldName:item.name}));            
                }
            }
            if (!item.requiredIf && item.requiredWhen) {
                if (isc.disableRuleScope) {
                    this.logWarn("Attempt to define FormItem requiredWhen criteria while RuleScope has been explicitly disabled (isc.disableRuleScope=true). Criteria will be ignored.")
                    continue;
                }
                if (badProperties) {
                    badProperties.add("requiredWhen");
                } else {
                    rules.add(this._createWhenRule("setRequired", item.requiredWhen, {fieldName:item.name}));
                }
            }
            if (item.readOnlyWhen) {
                if (isc.disableRuleScope) {
                    this.logWarn("Attempt to define FormItem readOnlyWhen criteria while RuleScope has been explicitly disabled (isc.disableRuleScope=true). Criteria will be ignored.")
                    continue;
                }
                if (badProperties) {
                    badProperties.add("readOnlyWhen");
                } else {
                    var rule = this._createWhenRule("readOnly", item.readOnlyWhen, {fieldName:item.name});
                    rule.fieldAppearance = item.readOnlyDisplay || this.readOnlyDisplay; 
                    rules.add(rule);
                }
            }
            if (item.formula || item.textFormula) {
                if (isc.disableRuleScope) {
                    this.logWarn("Attempt to define FormItem " + (item.formula ? "formula" : "textFormula") + " while RuleScope has been explicitly disabled (isc.disableRuleScope=true). Formula will be ignored.")
                    continue;
                }
                if (badProperties) {
                    badProperties.add(item.formula ? "formula" : "textFormula");
                } else {
                    var rule = this._createFormulaRule(item);
                    rules.add(rule);
                }
            }
            if (badProperties) {
                for (var j = 0; j < badProperties.length; j++) {
                    this.logWarn("Form item with no name defined - '" + badProperties[j] + "' is ignored: " + this.echo(item));
                }
            }
        }

        // FormItemIcon rules
        if (item.icons) {
            var icons = item.icons;
            for (var j = 0; j < icons.length; j++) {
                var icon = icons[j];
                if ((!icon.showIf && icon.visibleWhen) || icon.enableWhen) {
                    if (!icon.showIf && icon.visibleWhen) {
                        if (item.name == null) {
                            this.logWarn("Form item icon with no formItem.name defined - 'visibleWhen' is ignored: " + this.echo(icon));
                        } else {
                            rules.add(this._createWhenRule("visibility", icon.visibleWhen, 
                                {fieldName:(item.name || item.ID), formIconName:j}));                
                        }
                    }
                    if (icon.enableWhen) {
                        if (item.name == null) {
                            this.logWarn("Form item icon with no formItem.name defined - 'enableWhen' is ignored: " + this.echo(icon));
                        } else {
                            // The criteria is for "enable" but the rule is for "disable" so it must be negated.
                            var negatedCriteria = {
                                _constructor: "AdvancedCriteria",
                                operator: "not",
                                criteria: icon.enableWhen
                            };
                            rules.add(this._createWhenRule("enable", negatedCriteria, 
                                {fieldName:(item.name || item.ID), formIconName:j}));
                        }
                    }
                }
            }
        }
        if (rules.length != rulesCount) {
            affectedItems.add(item);
        }
    }
    if (rules.length > 0) {
        var rulesEngine = this.getRulesEngine();
        // The rulesEngine may not be accessible yet because the ruleScope
        // is not yet derived.
        if (!rulesEngine) {
            // Note that no item._createdItemWhenRules is set
            return;
        }
        rulesEngine.addMember(this);
        for (var i = 0; i < rules.length; i++) {
            rulesEngine.addRule(rules[i]);
        }

        for (var i = 0; i < affectedItems.length; i++) {
            affectedItems[i]._createdItemWhenRules = true;
        }
        // If form doesn't have a stable ID have the itemChange event
        // fire ruleContext changed event so rules are processed. This
        // only affects rules that reference only local values. 
        if (!this.hasStableLocalID() && this.editNode == null) {
            this._fireRuleContextOnItemChange = true;
        }
    }
},

_removeItemWhenRules : function () {
    var component = this.getRuleScopeComponent();
    if (component && this.items && this.getRulesEngine()) {
        var items = this.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i],
                itemName = item.getTrimmedDataPath() || item.getFieldName()
            ;
            if (item.requiredWhen) this._removeWhenRule("setRequired", {fieldName:itemName});
            if (item.visibleWhen) this._removeWhenRule("visibility", {fieldName:itemName});
            if (item.readOnlyWhen) this._removeWhenRule("readOnly", {fieldName:itemName});
            if (item.formula) this._removeWhenRule("formula", {fieldName:itemName});
            if (item.textFormula) this._removeWhenRule("textFormula", {fieldName:itemName});

            if (item.icons) {
                var icons = item.icons;
                for (var j = 0; j < icons.length; j++) {
                    var icon = icons[j];
                    if (icon.visibleWhen) this._removeWhenRule("visibility", {fieldName:itemName, formIconName:j});
                    if (icon.enableWhen) this._removeWhenRule("enable", {fieldName:itemName, formIconName:j});
                }
            }
            delete item._createdItemWhenRules;
        }
        delete this._fireRuleContextOnItemChange;
    }
},

_createFormulaRule : function (item) {
    var fieldName = item.name,
        formulaProperty = (item.formula ? "formula" : "textFormula"),
        ruleName = this._getRuleName(formulaProperty, {fieldName:fieldName}),
        target = { component: this, fieldName: fieldName },
        formItemType = item.type || item.defaultType,
        ruleType = (formulaProperty == "formula"
            ? (formItemType == 'date' || formItemType == 'time' ? "populateExpression" : "populate")
            : "populateText"),
        formula = item.formula || item.textFormula
    ;

    return isc.addProperties({
        name: ruleName,
        triggerEvent: "contextChanged",
        type: ruleType,
        internalRule: true,
        overwriteInvalidValue: true,
        autoPopulateClearedFlag: this.autoPopulateClearedFlag,
        formula: formula.text,
        targetRuleScope: this.getRuleScope(),
        allowEscapedKeys: true
    }, target);
},

// Update a live formItem with new *When rule. Used in editMode.
_ruleCriteriaProperties:{
    visibleWhen: { attribute: "visibility", exclusiveProperty: "showIf" },
    requiredWhen: { attribute: "setRequired", exclusiveProperty: "requiredId" },
    readOnlyWhen: { attribute: "readOnly", additionalProperties: { "fieldAppearance": "readOnlyDisplay" }},
    formula: { attribute: "formula" },
    textFormula: { attribute: "textFormula" }
},
_updateItemWhenRule : function (item, criteriaProperty) {
    var properties = this._ruleCriteriaProperties[criteriaProperty];
    if (!properties) return;
    var rulesEngine = this.getRulesEngine();
    if (!rulesEngine) return;
    var targetAttribute = properties.attribute;

    // Remove rule in case it previously existed
    this._removeWhenRule(targetAttribute, {formItem:item.name});
    // Create new rule if criteria is defined
    if (item[criteriaProperty] && (!properties.exclusiveProperty || !item[properties.exclusiveProperty])) {
        if (criteriaProperty == "formula" || criteriaProperty == "textFormula") {
            var rule = this._createFormulaRule(item);
        } else {
            var rule = this._createWhenRule(targetAttribute, item[criteriaProperty], {fieldName:item.name});
        }
        if (properties.additionalProperties) {
            for (var key in properties.additionalProperties) {
                rule[key] = item[properties.additionalProperties[key]];
            }
        }
        rulesEngine.addRule(rule);
    }
    // process rules immediately to pick up changes
    rulesEngine.processContextChanged();
},

_removeFromRuleScope : function () {
    // remove any ruleContext values for this form 
    if (this.ruleScope) {
        var ds = this.getDataSource(),
            hasStableID = this.hasStableLocalID() || this.grid || (this.editNode != null)
        ;
        if (ds && isc.isA.DataSource(ds) && this._populateSharedRuleContext != false) {
            this.provideRuleContext(ds.getID(), null, this, null, hasStableID);
        }
        if (hasStableID) this.provideRuleContext(this.getLocalId(), null, this);
    }
    this.Super("_removeFromRuleScope", arguments);
},


//>Safari

_adjustOverflowForPageLoad : function () {    
    if (isc.Browser.isSafari) {
        var items = this.getItems();
        if (this.isDrawn() && items) {
            for (var i = 0; i < items.length; i++) {
                items[i]._updateHTMLForPageLoad();
                // If the item the form to redraw completely we don't need individual items to
                // sort out their sizes since they'll get wiped out and redrawn anyway.
                if (this.isDirty()) break;
            }
        }
    }
    return this.Super("_adjustOverflowForPageLoad", arguments); 
},
//<Safari
    
// helper methods fired asynchronously after draw 
_delayedSetValues : function () {
    this._createItemWhenRules(this.getItems());

    this.setItemValues(null, true);

    
    //this.rememberValues();
    

    
    
    if (this.ruleScope || this.isRuleScope) {
        var ds = this.getDataSource(),
            hasStableID = this.hasStableLocalID() || this.editNode != null
        ;
        if (hasStableID) {
            this.provideRuleContext(this.getLocalId() + ".hasChanges", false, this);
        }
    }

    delete this._setValuesPending;
    delete this._delayedSetValuesEventId;

    // If we have a specified rulesEngine, notify it that we're editing a new set of values
    var rulesEngine = this.getRulesEngine();
    if (rulesEngine != null) rulesEngine.processEditStart(this);

    if (this._fireRuleContextOnItemChange) {
        this.fireRuleContextChanged(this);
    }
},

_delayedSetValuesFocus : function () {
    this._delayedSetValues();
	
	this.delayCall("focus");
},

//>	@method	dynamicForm.redraw()
//		@group	drawing
//<
redraw : function () {
    
    var recursiveRedraw = this._redrawInProgress;
    
    
    this._itemsRedrawing();
    this._redrawInProgress = true;
    // While redrawing, suppress ruleContext updates so rules aren't processed
    // for each FormItem. Once drawing is complete, fire the ruleContext changed event
    // so the rules can be processed one time
    this._suppressRuleContextUpdates = true;
    
    
    if (this.__suppressBlurHandler != null) delete this.__suppressBlurHandler;
    
	// call the superclass method to redraw the form
	this.Super("redraw", arguments);
	
    // notify our items that they've been redrawn in the DOM.
    this._itemsRedrawn();

    // Re-enable normal ruleContext updates and fire ruleContext changed event to process
    // applicable rules once for the entire form
    delete this._suppressRuleContextUpdates;
    // No need to call fireRuleContextChanged() because the setItemValues() call below
    // will update the items and provide ruleContext updates as needed.

    // If this was a recursive call to redraw, allow the parent thread to clear the flag
    if (!recursiveRedraw) this._redrawInProgress = false;

    
    this.setItemValues(null, true);

    
    var scrollLeft, scrollTop, clipHandle;
    if (isc.Browser.isMoz) {
        clipHandle = this.getClipHandle();
        if (clipHandle) {
            scrollLeft = clipHandle.scrollLeft;
            scrollTop = clipHandle.scrollTop;
        }
    }
    
    if (isc.Browser.isMoz) {
        if (scrollLeft != null && clipHandle.scrollLeft != scrollLeft) 
            clipHandle.scrollLeft = scrollLeft;
        if (scrollTop != null && clipHandle.scrollTop != scrollTop)
            clipHandle.scrollTop = scrollTop;
    }

    // Notify all our items that their positions may have been modified by the redraw.
    // This catches the many possible cases where the HTML written into the DF will have
    // changed, causing layout changes to visible form items.
    
    this.itemsMoved();
    
    
    if (this._specifiedNotifyAncestorsOnReflow != null) {
        this.notifyAncestorsOnReflow = this._specifiedNotifyAncestorsOnReflow;
        this._specifiedNotifyAncestorsOnReflow = null;
    }

},

// Notification for each item to tell it we're about to draw it
// Called directly from draw()
_itemsDrawing : function () {
   
    var items = this.items;
    for (var i = 0; i < items.length; i++) {

        
        if (items[i]) {
            // re-evaluate 'showIf' on each item
            this.updateItemVisible(items[i]);
            // fire the 'drawing()' notification [essentially "about to draw"]
            if (items[i].visible) items[i].drawing();
        }
    }
},
    
// Re-evaluate 'showIf' for each item

updateItemVisible : function(item) {
    var visible = item.visible;
    var values = this.values;

    // if the item has a showIf method
    //	evaluate that to see whether the item should be visible or not.
    //	We note if the visible states of any items changes so we can know to recalculate
    //		form layout if visibility of any items has changed.
    if (item.showIf) {
        // CALLBACK API:  available variables:  "item,value,form,values"
        // Convert a string callback to a function
        isc.Func.replaceWithMethod(item, this._$showIf, this._$showIfArgs);

        var value = item.getValue();
        visible = (item.showIf(item,value,this,values) == true);
    }
    if (visible && this.isPrinting) {
        // shouldPrint takes precedence over whether it's a control or not, etc
        
        if (item.shouldPrint != null) {
            visible = item.shouldPrint;
        } else if (visible && this.currentPrintProperties.omitControls) {
            var omitControls = this.currentPrintProperties.omitControls;
            for (var i = 0; i < omitControls.length; i++) {
                var cName = omitControls[i];
                if (isc.isA[cName] && isc.isA[cName](item)) {  
                    visible = false;
                }
            }
        }
    }   
    // Remember the visible state directly on the item.
    var changed =  (item.visible != visible);
    if (changed) {
        item.visible = visible;
        // Fire the special 'itemVisibilityChanged' so we know a dynamic 'showIf()' function
        // changed the item visibility
        item.itemVisibilityChanged(visible);
    }

},

// When we draw / redraw, we want to notify our items that their HTML is now present in the DOM

_itemsDrawn : function () {
    // formItems with an optionDataSource will commonly issue a fetch request on draw
    // to pick up display values.
    // Use queuing to minimize server turnarounds when this happens.
    var shouldSendQueue = isc.RPCManager && !isc.RPCManager.startQueue();
    
    this._initialDraw = true;

    var items = this.items;
    for (var i = 0; i < items.length; i++) {
        if (items[i]) {
            if (items[i].visible) items[i].drawn();
        }
    }
    delete this._initialDraw;
    
    if (shouldSendQueue) isc.RPCManager.sendQueue();
},

_itemsRedrawn : function () {
    var items = this.items;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item) continue;
        // If an items visibility changed due to showIf() evaluating differently, or
        // this redraw being kicked off by "item.show()" / "item.hide()", we want to fire
        // a cleared() / drawn() notification on the item.
        // Pass in the parameter indicating that this was the item visibility changing, not
        // the form as a whole being cleared/drawn
        if (item.visible) {
            item.isDrawn() ? item.redrawn() : item.drawn(true);
        } else if (item.isDrawn()) {
            item.cleared(true);
        }
    }
    this.destroyOrphanedItems("Delayed destroy of removed items on form redraw");

},
    
// Called from form.clear() - notify each item it has been cleared
_itemsCleared : function () {
    var items = this.items;
    if (items) {
        for (var i = 0; i < items.length; i++) {
            // The function check here is because we sometimes end up in this function when
            // this.items is still a bunch of config, not a list of FormItems
            if (items[i].isDrawn && items[i].isDrawn()) items[i].cleared();
        }
    }

    this.destroyOrphanedItems("Delayed destroy of removed items on clear");
},

destroyOrphanedItems : function (reason) {
    if (this._orphanedItems != null) {
	    this._orphanedItems.callMethod("destroy", [reason]);
	    delete this._orphanedItems;
	}
},

// Notify items that are about to be redrawn BEFORE the redraw occurs as well as after

_itemsRedrawing : function () {
    var items = this.items;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item) continue;
        
        // re-evaluate 'showIf' on each item
        
        var wasVisible = items[i].isDrawn();
        this.updateItemVisible(items[i]);
        
        // Call the notifications on items indicating they're about to redraw, draw or clear
        // as appropriate  
        // Pass in the itemVisibilityChange argument - this is useful so items can have
        // different logic for reacting to the form as a whole drawing and clearing vs just the item.
        
        var isVisible = item.visible;
        if (isVisible && wasVisible) item.redrawing();
        else if (isVisible && !wasVisible) item.drawing(true);
        else if (!isVisible && wasVisible) item.clearing(true);
        // No notification required for !isVisible && !isDrawn (was hidden, still is!)
    }
},

modifyContent : function () {
    // NOTE: we have to place Canvas items after the form's table has been redrawn, but before
    // adjustOverflow, so that CanvasItems do not force a shrinking form to stay full size
    this._placeCanvasItems();
},


_placeCanvasItems : function () {
    return this._notifyCanvasItems("placeCanvas", true);
}, 

// a utility for making notification calls to all CanvasItems 
_notifyCanvasItems : function (method, visibleOnly) {
    // don't JS error if CanvasItem not included
    if (!isc.CanvasItem) return;

    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        
        if (item && isc.isA.CanvasItem(item) && (!visibleOnly || item.isVisible(true))) {
            item[method]();
        }
    }
},

//> @method	dynamicForm.redrawFormItem()  
// Redraw the form item passed in.  This should handle re-evaluating showIf / visible property
// on the item, and width/height, as well as updating the HTML content of the item.
// Default implementation just marks the form for redraw.
//  @param  item    (FormItem)  Form item to be redrawn.
//<

redrawFormItem : function (item, reason) {

    var items = this.getItems();
    if (!item) return;
    while (item.parentItem) item = item.parentItem;
    if (!items.contains(item)) return;

    // Set this._itemsChanged so when we redraw we'll re-run the TableResizePolicy before 
    // This is required for showing / hiding items or changing colSpan, etc.
    
    this._itemsChanged = true;
    this.markForRedraw(item.ID + ": " + (reason ? reason : "redrawFormItem"));
},

// for debugging purposes only
getElementValues : function () {
    var values = {};
	for (var i = 0; i < this.items.length; i++) {
		var item = this.items[i],
            value = item.getDataElement() ? item.getDataElement().value : "[no element]";
        
        values[item[this.fieldIdProperty]] = value;
    }
    return values;
},


setItemValues : function (values, onRedraw, initTime, items, validating) {
    
    var shouldSendQueue = isc.RPCManager ? !isc.RPCManager.startQueue() : false;
    
	// get the item values from the values object if it was not passed in.
    var setToExisting = (values == null);
    if (setToExisting) values = this.getValues();
    if (values == null) values = {};
    // If we're changing the set of items and setValuesAsCriteria has been
    // called, we may have advancedCriteria stored that didn't have an item but now
    // applies to an item that's been added.
    var extraCriteria;
    if (initTime) {
        extraCriteria = this._extraAdvancedCriteria ? this._extraAdvancedCriteria.criteria : null;
    }

    items = items || this.items;
    var undef,
        ds = this.getDataSource(),
        haveValues = values != null && !isc.isAn.emptyObject(values),
        fieldChanges = { /* fieldName -> newFieldValue */ }
    ;

    // Suppress ruleContext updates while setting values so they can all be provided at
    // one time upon completion resulting in a single ruleContextChanged event. To do
    // this, keep up with the fieldChanges.
    var origSuppressRuleContextUpdates = this._suppressRuleContextUpdates;
    this._suppressRuleContextUpdates = true;

	for (var itemNum = 0; itemNum < items.length; itemNum++) {
		var item = items[itemNum];

        
        if (!item || item.destroyed || item.destroying) {
            continue;
        }

        
        if (item._skipSetFromForm) {
            
            
            if (!this._redrawInProgress) delete item._skipSetFromForm;
            continue;
        }

        var fieldName = item.getFieldName(),
            dataPath = item.getTrimmedDataPath(),
            isSetToDefault = item.isSetToDefaultValue(),
            
            value = undef;

        if (haveValues) {
            
            

            if (dataPath) {
            //    var segments = dataPath.split(isc.slash),
            //        nestedValues = values;
            //    for (var i = 0; i < segments.length-1; i++) {
            //        nestedValues = nestedValues[segments[i]];
            //        if (nestedValues == null) break;
            //    }
            //    if (nestedValues != null) value = nestedValues[segments.last()];
                value = isc.DynamicForm._getFieldValue(dataPath, 
                            (item.canEditOpaqueValues || (this.storeAtomicValues && !item.canEditOpaqueValues) ? null : item), 
                                    values, this, true, "edit");
            } else if (fieldName) {
                value = isc.DynamicForm._getFieldValue(fieldName, 
                            (item.canEditOpaqueValues || (this.storeAtomicValues && !item.canEditOpaqueValues) ? null : item), 
                                    values, this, true, "edit");
            }
        }

        
        if (onRedraw && isc.CanvasItem && isc.isA.CanvasItem(item) &&
            
            !item._useHiddenDataElement()) 
        {
            continue;
        }

        var undef,
            
            isUndefined = ((!fieldName && !dataPath) || value === undef);

        var initValue = null;
        // support initializing form items with a specified 'value'
        if (initTime && isUndefined && item.value != null) {
            initValue = item.value;
            // Ignore the fact that item is set to default if the init-value (item.value) 
            // doesn't match the value stored as item._value [which is derived from the default]
            if (initValue != item._value) isSetToDefault = false;
        }
        
        // If there's no value for the item in the simple values array,
        // but we have something in the 'extraCriteria' object
        // that applies to the item, use setCriteria to apply it
        
        var setToCriterion = null;
        if (isUndefined && extraCriteria != null) {
            for (var i = 0; i < extraCriteria.length; i++) {

                if (item.canEditCriterion(extraCriteria[i])) {

                    isUndefined = false;
                    
                    if (setToCriterion == null) {
                        setToCriterion = extraCriteria[i];
                    } else {
                        var compositeCriterion = ds.combineCriteria(
                            setToCriterion, extraCriteria[i],
                            this.operator, null, true);

                        if (!item.canEditCriterion(compositeCriterion)) {
                            this.logInfo("setItemValues(): current values include multiple extra criteria " +
                                "that could be applied to form item:" + item +
                                ". Criteria include:" +
                                this.echoFull(setToCriterion) + " and " +
                                this.echoFull(extraCriteria[i]) +
                                ". However, the item is unable to edit a composite criterion " +
                                "resulting from combining these criteria. Therefore " +
                                this.echoFull(extraCriteria[i]) + " will not be applied to this item",
                                "AdvancedCriteria");
                            
                            // Don't clear the extraCriteria criterion- we'll see if another item can
                            // edit it, otherwise we'll leave it around as "extraAdvancedCriteria"
                            continue;

                        } else {
                            this.logInfo("setItemValues(): Combined multiple 'extra' criteria into " +
                                "composite criterion:" + 
                                this.echoFull(compositeCriterion) + " and assigned to item:" + item,
                                "AdvancedCriteria");
                            setToCriterion = compositeCriterion;
                        }
                    }
                    // Arrays are passed around by reference in JS so this we're updating
                    // this._extraAdvancedCriteria here
                    extraCriteria.removeAt(i);
                    if (extraCriteria.length == 0) {
                        delete this._extraAdvancedCriteria;
                    } else {
                        // We've directly modified the array, so decrement the counter since
                        // we'll now be pointing at the next entry.
                        i--;
                    }
                    
                    // Don't break - we may be able to apply more than one
                    // "extra" sub-criterion to this item by combining them as a composite crit
                    //break;
                } 
            }
        }

        if (item.shouldSaveValue == false) {           
            if (!isUndefined) {
                // If the item is marked as shouldSaveValue false, but we've been passed a
                // value for it, assume the developer wants the item store a value in the
                // values array, so turn 'shouldSaveValue' back on for that item.
                //>DEBUG
                this.logInfo("DynamicForm.setValues() passed a value for '" + item[this.fieldIdProperty] + "'." +
                             " The corresponding form item was declared with 'shouldSaveValue' set to " +
                             " false to exclude its value from the form's values object." +
                             " Setting 'shouldSaveValue' to true for this item." +
                             "\n[To avoid seeing this message in the future, set 'shouldSaveValue'" +
                             " to true for any form items whose values are to be managed via " +
                             " form.setValues() / form.getValues().]")
                //<DEBUG
                item.shouldSaveValue = true;
            } else {
                
                
                var oldItemValue = (isSetToDefault ? null : item._value);
                if (initValue != null) oldItemValue = initValue;
                item.setValue(oldItemValue, (isSetToDefault ? false : onRedraw));
                if (item.name) fieldChanges[item.name] = oldItemValue;
                continue;
            }

        }

        if (initValue != null) {
            isUndefined = false;
            value = initValue;
        }

        // If the value is undefined, we want to use 'item.clearValue()' to reset to the
        // default value.  Note that in order to cause defaultValues to be re-evaluated on a
        // redraw, if an item has it's default value we need to call clearValue() rather than
        // restoring the old default value.
        if ((isUndefined || (setToCriterion == null && setToExisting && isSetToDefault)) &&
            !validating)
        {
            
            
            var undef;
            if (!initTime) {
                if (!item.valueHasChanged() || item._value != value) {
                    item.clearValue();
                    if (item.name && !isSetToDefault) fieldChanges[item.name] = undef;
                    else if (item.name) fieldChanges[item.name] = item._value;
                } else {
                    item.saveValue(value, isSetToDefault);
                    if (item.name) fieldChanges[item.name] = value;
                }
            } else if (initTime && isSetToDefault && item._value !== undef) {
                item.saveValue(item._value, true);
                if (item.name) fieldChanges[item.name] = item._value;
            }

        } else {
            if (setToCriterion != null) {
                item.setCriterion(setToCriterion);

            
            } else if (!validating || !isUndefined) {
                
                item.setValue(value, true);
                if (item.name) fieldChanges[item.name] = value;
            } 
        }
	}

    // Restore ruleContext updates flag as it was
    this._suppressRuleContextUpdates = origSuppressRuleContextUpdates;

    // If we aren't still suppresing ruleContext updates apply any fieldChanges found.
    // Skip this if form is a grid edit form - let the grid manage it. Otherwise, changes
    // can be made against the form (indirectly) that are recorded in _updatedFields.
    if (!this._suppressRuleContextUpdates && !isc.isAn.emptyObject(fieldChanges) && this.grid == null) {
        // Hold the ruleContextChanged event until all changes have been made to ruleContext
        for (var fieldName in fieldChanges) {
            var field = this.getField(fieldName),
                newFieldValue = fieldChanges[fieldName]
            ;
            if (field) {
                this._updateRuleScopeValues(field, fieldName, newFieldValue, true);
            }
        }
        this.fireRuleContextChanged(this);
    }

    if (shouldSendQueue) isc.RPCManager.sendQueue();

},

// Drawing
// --------------------------------------------------------------------------------------------

_$absolute:"absolute",
_absPos : function () {
    //!DONTCOMBINE
    return this.itemLayout == this._$absolute;
},


setColWidths : function (colWidths) {
    if (colWidths == null) return;
    // handle a comma-separated String
    if (isc.isA.String(colWidths)) {
        var colWidthsArray = colWidths.split(/[, ]+/);
        if (colWidthsArray == null || colWidthsArray.length == 0) {
            this.logWarn("ignoring invalid colWidths string: " + colWidths);
            // wipe it out if it's the value we were created with
            if (colWidths == this.colWidths) this.colWidths = null;
            return;
        }
        colWidths = colWidthsArray;
    // handle an Array of one String where the string is comma-separated.  This happens when
    // coming from Component XML if colWidths is specified as an attribute - the colWidths
    // field needs to be declared multiple="true" to handle the normal XML format for an Array,
    // so the String attribute gets wrapped in an Array
    } else if (isc.isAn.Array(colWidths) && colWidths.length == 1 &&
               isc.isA.String(colWidths[0])) 
    {
        var colWidthsArray = colWidths[0].split(/[, ]+/);
        if (colWidthsArray != null || colWidthsArray.length > 1) {
            colWidths = colWidthsArray;
        }
    }
    this.colWidths = colWidths;

    if (this.isDrawn()) this.markForRedraw();
},

//>	@method	dynamicForm.getInnerHTML()	(A)
//			Output the HTML for this form
//		@group	drawing
//
//		@return	(String)				HTML for the form		
//<
_$showIf:"showIf",
_$showIfArgs:"item,value,form,values",
_$closeForm:"</FORM>",
_$tablePolicy:"tablePolicy",
_$colWidthEquals:"<COL WIDTH=",


_$topRowTag:((isc.Browser.isIE && !isc.Browser.isIE9) ? "<TR STYLE='position:absolute'>" : "<TR>"),

_$topRowCellEnd:(isc.Browser.isSafari || isc.Browser.isMoz ? "</div></TD>" : "</TD>"),
_$cellStart:"<TD>",
_$cellEnd:"</TD>",
_$rowStart:"<TR>",
_$rowEnd:"</TR>",
_$br:"<br>",
_$tableFormClose:"</TABLE></FORM>",
_$tableClose:"</TABLE>",

getInnerHTML : function (printCallback) {
    if (this.autoDupMethods) this.duplicateMethod("getInnerHTML");

	// get the values and items
	var values = this.values,
		items = this.items
	;

    // Check Visibility / Disabled State
	// --------------------------------------------------------------------------------------------

	// iterate through the items, marking items as invisible if their .showIf is false
	// keep track if the visibility has changed or not
	var visibilityChanged = false;

	for (var itemNum = 0; itemNum < items.length; itemNum++) {
        var item = items[itemNum],
            drawn = item.isDrawn(),
            
            // item.visible is set up from showIf() and shouldPrint - handled in
            // itemsDrawing() and itemsRedrawing(), called before this method in the draw()/redraw() flow.
            visible = item.visible;

        if (visible != drawn) {
            // If the item is marked to take up space even when it's hidden, don't reflow
            // on show/hide
            if (!item.alwaysTakeSpace) visibilityChanged = true;
        }
	}

	// if the dynamic visibility for any item(s) has changed, or the _itemsChanged flag has
    // been set, throw away any cached tableResizePolicy for the size of the form elements, etc.
    // We set the _itemsChanged flag when we modify the items array (adding/removing items)
    // or modify other things that invalidate the cache (like changing title orientation, 
    // visibility of items, etc)
	if (visibilityChanged || this._itemsChanged) isc.Canvas.invalidateTableResizePolicy(items);
    this._itemsChanged = false;

	// set the required property of any fields that are conditionally required
    
	this.setRequiredIf();

    // Layout
	// --------------------------------------------------------------------------------------------

    // if flattenItems is set, summing columns, taking into account showTitle and colSpan
    // settings, as well as title orientation (titleOrientation:"top" means the title
    // doesn't take up a column)

    if (this.flattenItems) {
        var flatCols = null;

    	for (var itemNum = 0; itemNum < items.length; itemNum++) {
            var item = items[itemNum];

            // if this field is not hidden or if it is and takes space
            // increment the total columns
            if (item.visible || item.alwaysTakeSpace) flatCols++;

            // if this field has a displayed title on the left,
            // increment the total columns
            if (item.showTitle && item.titleOrientation != "top")
                flatCols++;

            // if there is a colSpan set, make a copy of it and nullify it
            item._colSpan = item.colSpan || null;
            item.colSpan = null;
        }

        if (flatCols) {
            this.numCols = flatCols;
            this._itemsChanged = true;
            this.markForRedraw();
        }
    }


    // get a StringBuffer to hold the output
    var output = isc.StringBuffer.create();

    

    // start the form tag
    if (this.writeFormTag && !this.isPrinting) output.append(this.getFormTagStartHTML());

    if (this._absPos()) {
        output.append(this.getAbsPosHTML());

    	// end the form
	    output.append(this._$closeForm);

        return output.release(false);
    }

	// start the table
	output.append(this.getTableStartHTML());

    // generate evenly spaced colWidths if no explicit colWidths have been provided and
    // titleWidth is set to *
    if (this.titleWidth == this._$star && !this.colWidths) {
        this.colWidths = [];
        for (var i = 0; i < this.numCols; i++) this.colWidths[i] = this._$star;
    }

	// set up the colWidths array 
	var colWidths;

	// if the form has colWidths defined, use those
	if (this.colWidths) {
		colWidths = this.colWidths;
        if (colWidths.length > this.numCols) {
            if (!this._suppressColWidthWarnings) {
                this.logWarn("colWidths Array longer than numCols, using only first " + 
                             this.numCols + " column widths");
            }
            colWidths = colWidths.slice(0, this.numCols);
        } else if (colWidths.length < this.numCols) {
            if (!this._suppressColWidthWarnings) {
                this.logWarn("colWidths Array shorter than numCols, remaining columns get '*' size");
            }
            // duplicate the colWidths array in case it comes from *Defaults
            colWidths = colWidths.duplicate();
            for (var i = colWidths.length; i < this.numCols; i++) colWidths[i] = isc.star; 
        }
	} else {
	    // otherwise create default column widths, based on the assumption that every other
        // column will be full of labels and so should have DF.titleWidth.
        // NOTE: We'll have a column full of labels by default because each item in the form
        // takes up two columns in the table: one for the label, the other for the native form
        // element itself.  We do it this way so that a series of textboxes will line up.
		colWidths = [];

		var totalWidth = this.getInnerContentWidth();

        // Take off cellBorder - this is actually the border of the native HTML <table>
        totalWidth -= (this.cellBorder != null ? this.cellBorder : 0);

        // NOTE: items that actually try to fit within the column width take into account
        // cellSpacing and cellPadding via FormItem.getInnerWidth()

        // if an odd number of columns is specified, assume the last column is an element
        // column, as a column of dangling labels is unlikely.  To produce reasonable layout,
        // a form with an odd number of columns will probably need to specify colWidths..
		var	titleCols = Math.floor(this.numCols/2),
            // total width for all label columns
            totalElementColWidth = totalWidth - (titleCols * this.titleWidth),
            // width of each form element column
            elementColWidth;
        if (this.isPrinting) {
            // When printing don't calculate element column widths based on
            // the DynamicForm size -- the printHTML may be written into a 
            // different sized container
            elementColWidth = "*";
        } else {
            elementColWidth =  Math.floor(totalElementColWidth / (this.numCols-titleCols));
            // don't let it get too small
            elementColWidth = Math.max(this.minColWidth, elementColWidth);
        }

		for (var i = 0; i < titleCols; i++) {
			// add a column for the label
			colWidths.add(this.titleWidth);
			// add a column for the form element
			colWidths.add(elementColWidth);
		}
        // for an odd number of columns, take on another element column
        if ((this.numCols % 2) != 0) colWidths.add(elementColWidth);
        if (this.logIsInfoEnabled(this._$tablePolicy)) {
            this.logInfo("totalWidth: " + totalWidth + ", generated colWidths: " + colWidths,
                         this._$tablePolicy);
        }
	}
	// run the tableResizePolicy on the list to set up the table of form items
	//	this assigns sizes to dynamic items as well as populating the structure
	//	that maps items to particular rows/cols
    //   Note: This will set up the _size property on the items as a 2 element array, where
    //   the first element represents the desired width, and the the second the height.
    //   For some items getInnerHTML() will make use of this property to specify the elements 
    //   drawn size, though if not available, the standard item.width, item.height will be used 
    //   instead.

    var innerWidth = this.getInnerContentWidth(),
        innerHeight = this.getInnerContentHeight();

    
    if (this.cellSpacing != 0) {
        if (isc.Browser.isMoz) innerHeight -= 2*this.cellSpacing;
        else if (isc.Browser.isSafari) innerHeight -= this.cellSpacing;
    }

    items._defaultRowHeight = this.defaultRowHeight;
    isc.Canvas.applyTableResizePolicy(items, innerWidth, innerHeight, 
                                  this.numCols, colWidths);

    
    
    var overflowed = false;
    if (isc.CanvasItem) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.visible && isc.isA.CanvasItem(item) && item.checkCanvasOverflow()) {
                if (!overflowed && this.logIsInfoEnabled(this._$tablePolicy)) {
                    this.logInfo("CanvasItem: " + item + " overflowed, rerunning policy",
                                 this._$tablePolicy);
                }
                overflowed = true;
            }
        }
    }

    if (overflowed) {
        isc.Canvas.applyTableResizePolicy(items, innerWidth, innerHeight,
                                          this.numCols, colWidths, null, true);
    }

    if (!this.isPrinting) {
        colWidths = items._colWidths;
    }

    // output <COL> tags to set the sizes of the columns.
    
	for (var colNum = 0; colNum < colWidths.length; colNum++) {
        var colWidth = colWidths[colNum];
        // In printing mode we avoided the tableResizePolicy - we expect to see
        // colWidths specified as "*" and titleWidth
        // If "*" just omit writing out a width at all
        if (colWidth == "*") {
            output.append("<COL>");
        } else {
            output.append(this._$colWidthEquals, colWidth, this._$rightAngle);
        }
    }

    

    

	// if fixedColWidths is set, force column widths to be respected as minimums by writing
    // out a row of cells with spacers.  <COL> tags on their own won't enforce minimums.
    if (this.isPrinting) {
        
        output.append("<tr>");
    } else {
        output.append(this._$topRowTag);
    }

    var topRowCellStart = isc.DynamicForm._getTopRowCellStart();
    for (var colNum = 0; colNum < colWidths.length; colNum++) {
        if (!isc.isA.Number(colWidths[colNum])) {
            output.append(topRowCellStart.join(isc.emptyString), this._$topRowCellEnd);
        } else {
            var innerWidth = colWidths[colNum];
            // NOTE: correct for spacing, but *do not* correct for padding, because we write out
            // padding:0px on the cells
            innerWidth -= (this.cellSpacing!= null ? (2 * this.cellSpacing) : 0);

                        
            if (isc.Browser.isIE8Strict) {
                innerWidth -= this.cellPadding != null ? (2* this.cellPadding) : 0;
            }
            // The top row has theoretically a height of zero px, but can actually be visible in IE
            // if it has a bg-color applied to it.
            // We've seen this occur with a stylesheet that globally sets td background-color.
            // handle this by applying standard form cell style
             
            topRowCellStart[3] = (isc.FormItem ? isc.FormItem.getPrototype().baseStyle : null);

            var spacerHeight = isc.Browser.isIE ? 1 : 0,
                cellStart = topRowCellStart.join(isc.emptyString);
            output.append(cellStart, 
                          this.fixedColWidths ? isc.Canvas.spacerHTML(innerWidth,spacerHeight) : null,
                          this._$topRowCellEnd);
        }
    }
    output.append(this._$rowEnd);

	// if this.autoSendTarget is set, add a '__target__' hidden field so that the server knows the
    // name of the frame/window this form is being targeted at.
	if (this.autoSendTarget && this.target) output.append(this._getAutoSendTargetHTML());

    // Draw HTML for Items
	// --------------------------------------------------------------------------------------------

    

    var len = items.length,
        wentAsync = false;

    var self = this;
    var completeInnerHTMLFun = function completeInnerHTMLFun(htmlOutputs) {
        // append all item outputs
        if (htmlOutputs != null) {
            // since there may be more than 26 outputs, need to push onto output's stream directly.
            var outputStream = output.getArray();
            outputStream.push.apply(outputStream, htmlOutputs);
        }

        // end the current row
        if (len > 0) output.append(self._$rowEnd);

        // end the table and form
        if (self.writeFormTag && !self.isPrinting) output.append(self._$tableFormClose);
        // end just the table
        else output.append(self._$tableClose);

        var HTML = output.release(false);
        if (wentAsync) {
            self.fireCallback(printCallback, "HTML", [HTML]);
            return false;
        } else {
            return HTML;
        }
    };

    // for each item in the list, get HTML output for it and combine the output
    if (len > 0) {
        // Handle this by tracking items to include in the next cell in an array, to be updated 
        // in the loop while writing cells out.
        var includeInNextCell = [],
            htmlOutputs = new Array(len),
            completedCount = 0;

        var itemCompletedFun = function itemCompletedFun() {
            if (++completedCount == len) {
                return completeInnerHTMLFun(htmlOutputs);
            }
        };

        var theHTML;
        for (var itemNum = 0; itemNum < len; ++itemNum) {

            
            var item = items[itemNum],
                itemOutput = isc.SB.create(),
                visible,
                column,
                error,
                value,
                titleOrientation,
                showErrors;

            // if a null item, skip it
            if (!item) {
                theHTML = itemCompletedFun();
                continue;
            }

            visible = item.visible;
            // note that the value of this item can't possibly be dirty anymore
            item._markValueAsNotDirty();

            //>DEBUG
            if (this.logIsDebugEnabled()) this.logDebug("Drawing FormItem: " + item); //<DEBUG

            // if the item has been marked as invisible, skip it unless it's marked to take space
            // even when hidden
            if (!item.alwaysTakeSpace && !visible) {
                theHTML = itemCompletedFun();
                continue;
            }

            // if this item should not take up a cell, we'll include it in the next cell's HTML
            // (Unless we're the last item, in which case, just take up a cell!)
            if ((item.rowSpan == 0 || item.colSpan == 0) && itemNum < len-1) {
                includeInNextCell.add(item);
                theHTML = itemCompletedFun();
                continue;
            }

            // get the error for this form element
            column = item.getFieldName();
            error = item.getErrors();
            value = item.getValue();
            titleOrientation = this.getTitleOrientation(item);

            // if the error is an empty string, null it out
            if (isc.is.emptyString(error)) error = null;

            // if the item should start its row or passes the name boundary
            // output the end and start row tag
            // Note: _startRow attribute set up via Canvas.applyTableResizePolicy()
            if (item._startRow || itemNum == 0) {
                if (itemNum != 0) {
                    itemOutput.append(this._$rowEnd);
                }
                if (item._emptyRows && item._emptyRows.length > 0) {
                    for (var i = 0; i < item._emptyRows.length; i++) {
                        itemOutput.append(this._$rowStart);
                        
                        var numCells = this.numCols;
                        for (var ii = 0; ii < item._emptyRows[i]; ii++) {
                            itemOutput.append(this._$cellStart, "&nbsp;", this._$cellEnd);
                            
                        }
                        itemOutput.append(this._$rowEnd);
                    }
                }
                itemOutput.append(this._$rowStart);
                if (item._emptyCells > 0) {
                    for (var i = 0; i < item._emptyCells; i++) itemOutput.append(this._$cellStart, this._$cellEnd);
                }
            }

            // place title on the left of the item, in its own cell
            if (titleOrientation == isc.Canvas.LEFT) {
                itemOutput.append(this.getTitleCellHTML(item, error));
            }

            // output the tag start for the item if it has a positive row and colSpan
            itemOutput.append(this.getCellStartHTML(item, error));

            // place title on top of the item, with no separate cell
            if (visible && titleOrientation == isc.Canvas.TOP) {
                if (this.shouldClipTitle(item)) {
                    itemOutput.append(this.getTitleCellInnerHTML(item, error, true));
                } else {
                    itemOutput.append(this.getTitleSpanHTML(item, error), this._$br);
                }
            }

            // if there is an error associated with the item, output that
            showErrors = (visible && error && this.showInlineErrors); 
            if (showErrors && item.getErrorOrientation() == isc.Canvas.TOP) {
                itemOutput.append(this.getItemErrorHTML(item, error));
            }

            var completeIncludedInnerHTMLFun = (function (itemNum, item, itemOutput, visible, column, error, value, titleOrientation, showErrors) {
                var func = function func(HTML) {
                    itemOutput.append(HTML);

                    // Top and bottom orientation are handled by writing the error HTML out here -- left
                    // and right orientation will be handled as part of formItem.getInnerHTML
                    if (showErrors && item.getErrorOrientation() == isc.Canvas.BOTTOM) {
                        itemOutput.append(self.getItemErrorHTML(item, error));
                    }

                    // append the tag end for the item
                    itemOutput.append(self.getCellEndHTML(item, error));

                    // place title on right of item, in it's own cell
                    if (titleOrientation == isc.Canvas.RIGHT) {
                        itemOutput.append(self.getTitleCellHTML(item, error));
                    }

                    htmlOutputs[itemNum] = itemOutput.release(false);

                    return itemCompletedFun();
                };

                return function (includedHtmlOutputs) {
                    if (includedHtmlOutputs != null) {
                        // since there may be more than 26 included items, we need to push onto
                        // itemOutput's stream directly.
                        var itemOutputStream = itemOutput.getArray();
                        itemOutputStream.push.apply(itemOutputStream, includedHtmlOutputs);
                    }

                    // output the innerHTML for the item
                    if (visible) {
                        // pass in the parameter to write out the hint text and validation errors
                        // along with the form item
                        // Note if validation error orientation is top or bottom we write the error out
                        // as part of this method - otherwise we need to write the error out in the form
                        // item HTML (like the hint)
                        if (self.isPrinting) {
                            var printHTML = item.getPrintHTML(self.currentPrintProperties, func);
                            if (printHTML == null) {
                                return false;
                            } else {
                                return func(printHTML);
                            }
                        } else {
                            return func(item.getInnerHTML(value, true, self.showInlineErrors));
                        }

                    } else return func(isc.Canvas.spacerHTML(item.width, item.height));
                };
            })(itemNum, item, itemOutput, visible, column, error, value, titleOrientation, showErrors);

            // if any items are being 'piggy backed' into this item's cell, write them out now.
            var includedLen = includeInNextCell.length;
            if (includedLen > 0) {
                var includedHtmlOutputs = new Array(includedLen);

                var includedCompletedFun = (function (completeIncludedInnerHTMLFun, includedLen, includedHtmlOutputs) {
                    var includedCompletedCount = 0;
                    return function () {
                        if (++includedCompletedCount == includedLen) {
                            return completeIncludedInnerHTMLFun(includedHtmlOutputs);
                        }
                    };
                })(completeIncludedInnerHTMLFun, includedLen, includedHtmlOutputs);

                for (var m = 0; m < includedLen; ++m) {
                    var includedItem = includeInNextCell[m];

                    if (!includedItem.visible) {
                        includedCompletedFun();
                        continue;
                    }

                    var innerFunc = (function (includedHtmlOutputs, includedCompletedFun, m) {
                        return function (HTML) {
                            includedHtmlOutputs[m] = HTML;
                            return includedCompletedFun();
                        };
                    })(includedHtmlOutputs, includedCompletedFun, m);

                    if (this.isPrinting) {
                        var printHTML = includedItem.getPrintHTML(self.currentPrintProperties, innerFunc);
                        if (printHTML == null) {
                            wentAsync = true;
                        } else {
                            theHTML = innerFunc(printHTML);
                        }
                    } else {
                        theHTML = innerFunc(includedItem.getInnerHTML(includedItem.getValue()));
                    }
                }

                // drop the old 'includeInNextCell' array for the next item.
                includeInNextCell.length = 0;
            } else {
                theHTML = completeIncludedInnerHTMLFun();
            }

            if (theHTML === false) wentAsync = true;
        }

        if (wentAsync) {
            // indicate that we went asynchronous
            
            return false;
        } else {
            return theHTML;
        }
    } else {
        return completeInnerHTMLFun();
    }
},

// Any children of the form are likely to be canvasItems' canvii which are written out inline
// via code in CanvasItem.js
getPrintChildren : function () {
    return null;
},

// Method to return any canvasItems' canvases contained by this form.

getCanvasItemCanvii : function () {
    var items = this.items || [],
        canvii = [];
    for (var i = 0; i < items.length; i++) {
        if (items[i].isA("CanvasItem") && isc.isA.Canvas(items[i].canvas)) {
            canvii.add(items[i].canvas);
        }
    }
    return canvii;
},

createErrorItem : function () {
    var errorItem = isc.addProperties({cellStyle:this.errorItemCellStyle}, 
                                      this.errorItemDefaults,
                                      this.errorItemProperties);

    // Make the errorItem focusable in screen reader mode because then the user can tab to
    // the errorItem to have all error messages read at once.
    if (isc.screenReader) errorItem.canFocus = true;

    this.addItems([errorItem], 0);
    this._errorItem = this.getItem(0);
},

//> @method DynamicForm.getErrorsHTML()
// If +link{dynamicForm.showInlineErrors} is false, the form will render all errors in a list at
// the top of the form. This method returns the HTML for this list of errors.
// @param errors (Object) Map of field names to error messages. Each field may contain a single
//                        error message (string) or an array of errors
// @return (HTMLString) error HTML.
// @group validation
// @visibility external
//<
getErrorsHTML : function (errors) {
    if (!errors || isc.isAn.emptyObject(errors)) return isc.emptyString;

    var SB = isc.SB.create(),
        sep = " : ";
    SB.append(this.errorsPreamble, "<ul>");
    for (var field in errors) {
        var item = this.getItem(field),
            message;
        if (item != null) {
            message = item.getErrorMessage(errors[field]);

            SB.append("<li>", item.getTitle(), sep, message, "</li>");

        // Field with no associated item (ds field?) Just display the error as normal
        } else {
            message = errors[field];
            if (isc.isAn.Array(message)) {
                message = "<ul><li>" + message.join("</li><li>") + "</li></ul>";
            }

            SB.append("<li>", field, sep, message, "</li>");
        }
    }
    SB.append("</ul>");
    return SB.release();
},

//> @method dynamicForm.getItemErrorHTML()
// If +link{dynamicForm.showInlineErrors} is true, this method is called for each item in the form
// and returns the error HTML to be written out next to the item.<br>
// Default implementation falls through to +link{FormItem.getErrorHTML()} on the item in question.
// @param item (FormItem) Form item for which the HTML should be retrieved
// @param error (String | Array) Error message to display for the item, or array of error message
//                              strings.
// @group validation
// @visibility external
//<
getItemErrorHTML : function (item, error) {
    return item.getErrorHTML(error);
},

// Helper to generate the input required for the autoSendTarget feature
_$autoSendTargetTemplate:[
      "<INPUT TYPE=HIDDEN NAME='" , 
      , // target field name
      "' VALUE='" , 
      , // target 
      "'>"
],
_getAutoSendTargetHTML : function () {
    this._$autoSendTargetTemplate[1] = this.autoSendTargetFieldName;
    this._$autoSendTargetTemplate[3] = this.target;
    return this._$autoSendTargetTemplate.join(isc.emptyString);
},
 

//>	@method	dynamicForm.getCellStartHTML()	(A)
//			Return the HTML for start tag of this item's cell.
//		@group	drawing
//
//		@param	item	(FormItem)	item in question
//		@param	error	(String)	error for this item
//
//		@return	(HTMLString)	output for the start tag
//<
getCellStartHTML : function (item, error) {
	// get the colSpan for the item, which might be a "*"
	var colSpan = item.getColSpan(),
	    
        rowSpan = item._rowSpan != null ? item._rowSpan : item.getRowSpan();

    // colSpan / rowSpan of zero is handled by writing the form item out into the next form
    // item's cell.
    // However if the last item in a form has rowSpan / colSpan of zero, we need to put it into its
    // own cell, so we should treat it as having rowSpan / colSpan of 1.
    if (colSpan == 0) colSpan = 1;
    if (rowSpan == 0) rowSpan = 1;
    
	// if the colSpan is a "*", set it appropriately
	if (colSpan == "*") {
		var startCol = (item._tablePlacement ? item._tablePlacement[0] : 0);
		colSpan = (this.numCols - startCol);
	}
    
    var className = item.getCellStyle();
    
    // Use the height calculated by tableResizePolicy rather than the specified size (may be
    // null, "*" or a percentage).
    
    var forceHeight = this.fixedRowHeights || item.shouldFixRowHeight();
    var height = item._size ? item._size[1] : null;
    
    if (isc.isA.Number(height) && this.cellSpacing != 0) height -= 2*this.cellSpacing;
    if (isc.Browser.isStrict && isc.isA.Number(height) && this.cellPadding != 0) {
        height -= 2*this.cellPadding;
    }
    return this._getCellStartHTML(
        (item.align ? item.align : 
                       ((this.form? this.form.isRTL() : this.isRTL()) ? isc.Canvas.RIGHT : isc.Canvas.LEFT)),
        item.getVAlign(),
        
        className,
        rowSpan,
        colSpan,
            
        null,
        
        (forceHeight ? height : null),
        
        null,
        item.cssText,
        (this.form ? this.form.getID() : this.getID()),
        item.getItemID(),
        item.getFormCellID(),
        item._cellNoWrap()

    );
},
    
_getCellStartHTML : function (align, vAlign, className, rowSpan, colSpan, width, height, 
                              extraStuff, cssText, formID, itemID, cellID, nowrap) 
{
	var output = isc.StringBuffer.create(),
        ns = isc._emptyString;

    output.append(
		"<TD ALIGN=", align,
		    (vAlign == null ? ns : " VALIGN=" + vAlign),
            (className != null ? " CLASS='" + className + "'" : ns),
            " STYLE='", (cssText != null ? cssText : ns), "'",

            (rowSpan > 1 ? " ROWSPAN=" + rowSpan: ns),
            (colSpan > 1 ? " COLSPAN=" + colSpan : ns),
            (width != null ? " WIDTH=" + width : ns),
            (height != null ? " HEIGHT=" + height : ns),
            (extraStuff != null ? extraStuff : ns)
    );

    
    // If this is the containing cell for some item, write in ID and 'containsItem' attribute
    // for the item.
    // This method is used for cells containing things other than the form items, such as icons
    // in which case we'll avoid writing in these attributes.
    if (cellID) {
        output.append(" ID=", cellID, " ");
    }
    if (itemID && formID) {
        
        output.append(isc.DynamicForm._containsItem, "='",itemID,"'");
        
    }
    
    
    output.append(nowrap ? "><NOBR>" : ">");

    return output.release(false);
},

//>	@method	dynamicForm.getCellEndHTML()	(A)
//		@group	drawing
//			Return the HTML for start tag of this item's cell.
//
//		@param	item	(FormItem)	item in question
//		@param	error	(String)	error for this item
//
//		@return	(HTMLString)	output for the start tag
//<
getCellEndHTML : function (item, error) {

	// otherwise return a simple end of cell
	return  this._getCellEndHTML();
},

_getCellEndHTML : function (nowrap) {
    return nowrap ? "</NOBR></TD>" : "</TD>";
},

//>	@method	dynamicForm.getTitleOrientation()	(A)
// Return the orientation of the title for a specific item or the default title orientation if
// no item is passed.
// 
// @param [item] (FormItem) item to check
// @return (TitleOrientation) orientation of the title, or null if an item is passed and has no
//                            title
// @visibility external
//<
getTitleOrientation : function (item) {
    if (item && !item.shouldShowTitle()) return null;
    if (this.linearMode) return this.titleOrientation || isc.Canvas.TOP;
    return (item ? item.titleOrientation : null) || this.titleOrientation || isc.Canvas.LEFT;
},

//> @attr dynamicForm.titleAlign (Alignment : null : IRW)
// Default alignment for item titles. If unset default alignment will be derived from
// +link{Page.isRTL(),text direction} as described in +link{dynamicForm.getTitleAlign()}
// @visibility external
//<

//>	@method	dynamicForm.getTitleAlign()	(A)
// Get the alignment for the title for some item. Default implementation is as follows:
// <ul><li>If +link{formItem.titleAlign} is specified, it will be respected</li>
//     <li>If not, and +link{dynamicForm.titleAlign,this.titleAlign} is set, it will be
//         respected</li>
//     <li>Otherwise titles will be aligned according to +link{Page.isRTL(),text direction};
//         for +link{dynamicForm.titleOrientation,titleOrientation} "top", this
//         method returns <code>"left"</code> if text direction is LTR, and
//         <code>"right"</code> if not; for horizontal orientations, this method returns 
//         <code>"right"</code> if text direction is LTR, or <code>"left"</code> if text 
//         direction is RTL.</li>
// </ul>
// @param item (FormItem) item for which we're getting title alignment
// @return (Alignment) alignment for title
// @visibility external
//<
getTitleAlign : function (item) {
    var form = this.form || this; // for ContainerItem method-stealing hack
    return (item.titleAlign ? item.titleAlign : 
            this.titleAlign ? this.titleAlign :
            // textDirection: set the direction of the titles according to the text direction
            // if not specified - for "top" orientation, RTL - otherwise, opposite to RTL
            this.getTitleOrientation(item) == "top" ?
                this.isRTL() ? isc.Canvas.RIGHT : isc.Canvas.LEFT :
                this.isRTL() ? isc.Canvas.LEFT : isc.Canvas.RIGHT);
},

//> @method dynamicForm.getTitleVAlign()  (A)
// Get the vertical alignment for the title for this item
//<

getTitleVAlign : function (item) {
    var valign = (item.titleVAlign ? item.titleVAlign : 
                  this.titleVAlign ? this.titleVAlign :
                  isc.Canvas.CENTER);
    return (valign == isc.Canvas.CENTER ? isc.Canvas.MIDDLE : valign);
},

// reinstate this internal default height 
titleHeight:15,

// titleHeight / getTitleHeight
// When calculating the size of items for tableResizePolicy, if the title is written into the
// items cell (for titleAlign:top), we need to take the height of the title into account
// so "*" sized items can take up the appropriate amount of space.

getTitleHeight : function (item) {
    var form = this.form || this; // for ContainerItem method-stealing hack

    // return cached height
    if (item._titleHeight != null) return item._titleHeight;

    // default to item/this.titleHeight
    var titleHeight = (item.titleHeight != null ? item.titleHeight : this.titleHeight);

    var titleStyle = item.getTitleStyle();
    if (titleStyle) {
        // if there's a titleStyle, measure its height to include padding
        var title = item.getTitle();
        var opts = {};
        if (this.getTitleOrientation(item) == "top") {
            // titles above fields - getMaxTitleSpace() returns the item's visible-width
            // by default, but can be overridden to return something else - for example,
            // CheckboxItem uses cell-width, since it's visibleWidth is very narrow
            opts.width = item.getMaxTitleSpace();
        }
        if (item.wrapTitle == false || (item.wrapTitle == null && this.wrapItemTitles == false)) {
                // not wrapping - just use a short string to avoid having to deal with overflow
                title = "M";
        }
        var measuredHeight = isc.Canvas.measureContent(title, titleStyle, true, true, opts);
        titleHeight = Math.max(titleHeight, measuredHeight);
    }

    // cache the measured height
    item._titleHeight = titleHeight;

    return item._titleHeight;
},

//> @method dynamicForm.getTitleSpanHTML() (A)
// Return the HTML for a FormItem's title, wrapping in SPAN rather than a table cell so that it
// doesn't affect the table used for Layout
//
// @group drawing
// @param item (FormItem) Item to show title of.
// @param error (String) error message for this item
// @return (HTMLString) HTML output for this element
//<
getTitleSpanHTML : function (item, error) {
	var output = isc.StringBuffer.create();
    output.append("<SPAN ", this._containsItemTitleAttrHTML(item),
                  " style='display:inline-block;",
                  // propagate wrapTitle to top-oriented titles
                  item.wrapTitle ? "" :
                    (item.wrapTitle == false || this.wrapItemTitles == false
                        ? "white-space:nowrap;" : ""),
                  "'",
                  " CLASS='", item.getTitleStyle(),
                  "' ALIGN=", this.getTitleAlign(item),
                  ">");

    // get the actual title from the item
    output.append(this.getTitleHTML(item, error));

	// now end the title span
	output.append("</SPAN>");
	// and return the whole thing
    return output.release(false);
},

// Should a specific form item's title be clipped?
shouldClipTitle : function (item) {
    if (!item || !item.form == this) return false;
    return (item.clipTitle != null ? item.clipTitle : !!this.clipItemTitles);
},

//>	@method	dynamicForm.getTitleCellHTML()	(A)
//			Output a title cell for a FormItem.
//		@group	drawing
//
//		@param	item		(FormItem)	Item to show title of.
//		@param	error		(String)	error message for this item
//
//		@return	(HTMLString)	HTML output for this element
//<

_$heightColon:"height:", _$widthColon:"width:",_$maxWidthColon:"max-width:",
_$maxHeightColon:"max-height:",_$heightColon:"height:",
_$NOBR:"<NOBR>", _$innerTitleTableClose:"</td></tr></TABLE>", _$divClose:"</DIV>", _$tdClose:"</TD>",

_outerTitleCellTemplate:[
    "<TD ", // 0
    , // 1: this._containsItemTitleAttrHTML(item)
    " CLASS='", // 2
    , // 3: className
    "' ALIGN='", // 4
    , // 5: this.getTitleAlign(item)
    "' VALIGN='", // 6
    , // 7: this.getTitleVAlign(item)
    "'", // 8: 
    , // 9: possible rowspan
      // NOTE: based on the titleOrientation, this may want to output colSpan OR rowSpan based
      // on the original item size. For now we just respect rowspan
    , // 10: possible colspan
    ">" // 11
],

// When clipping titles, a div is emitted which wraps the block having text-overflow:ellipsis.
// If emitOuterTextOverflow:true, then text-overflow:ellipsis is also applied to the wrapper
// div.
emitOuterTextOverflow: false,

getTitleCellHTML : function (item, error) {
	var output = isc.StringBuffer.create(),
        className = item.getTitleStyle(),
        titleAlign = this.getTitleAlign(item),
        titleVAlign = this.getTitleVAlign(item);

    if (item.showTitle == false) return "";

    // get the item title cell start
    var cellTemplate = this._outerTitleCellTemplate;
    cellTemplate[1] = this._containsItemTitleAttrHTML(item);
    cellTemplate[3] = className;
    cellTemplate[5] = titleAlign;
    cellTemplate[7] = titleVAlign;

    
    var rowSpan = item._rowSpan;
    if (rowSpan == null) rowSpan = item.getRowSpan();
    if (rowSpan > 1) cellTemplate[9] = " ROWSPAN=" + rowSpan;
    
    else cellTemplate[9] = null;
    if (item.getTitleColSpan() > 1) cellTemplate[10] = " COLSPAN=" + item.getTitleColSpan();
    else cellTemplate[10] = null;
    
    
    
	output.append(cellTemplate.join(isc.emptyString));
    output.append(this.getTitleCellInnerHTML(item, error));
    
	// now end the title cell
	output.append(this._$tdClose);

	// and return the whole thing
    return output.release(false);
},

_$top: "top",

// Content of the title cell
getTitleCellInnerHTML : function (item, error, includeClassName) {
    // Use the width / height calculated by TableResizePolicy rather than the specified
    // height / titleWidth properties.
    // Note that this is the total available space for the cell rather than the inner
    // space, so we need to adjust for styling.
    
    var output = isc.StringBuffer.create(),
        className = item.getTitleStyle(),
        titleAlign = this.getTitleAlign(item),
        titleOrientation = this.getTitleOrientation(item),
        titleWidth = item._titleWidth || null,
        height = item._size ? item._size[1] : null,
        clipTitle = this.shouldClipTitle(item),
        // Unless explicitly specified, wrap unclipped titles, but don't wrap clipped titles
        wrapTitle = (item.wrapTitle != null ? item.wrapTitle : 
                    (this.wrapItemTitles != null ? this.wrapItemTitles : !clipTitle));

    
    
    // Adjust titleWidth/height for padding applied by this.cellPadding this.cellSpacing, & 
    // the title class name
    if (height) {
        if (this.cellSpacing) height -= 2*this.cellSpacing;   
        
        var tPadding, bPadding;
        if (className) {
            tPadding = isc.Element._getTopPadding(className, true);
            bPadding = isc.Element._getBottomPadding(className, true);
        }
        if (tPadding == null) tPadding = this.cellPadding || 0;
        if (bPadding == null) bPadding = this.cellPadding || 0;
        
        height -= (tPadding + bPadding)
        
        if (className) height -= isc.Element._getVBorderSize(className);
    }

    if (titleWidth) {
        if (this.cellSpacing) titleWidth -= 2*this.cellSpacing;                
        var lPadding, rPadding;
        if (className) {
            lPadding = isc.Element._getLeftPadding(className, true);
            rPadding = isc.Element._getRightPadding(className, true);
        }
        if (lPadding == null) lPadding = this.cellPadding || 0;
        if (rPadding == null) rPadding = this.cellPadding || 0;
        
        titleWidth -= (lPadding + rPadding)
        titleWidth -= isc.Element._getHBorderSize(className);
    }
    
    var heightProperty = isc.Browser.isMoz ? this._$maxHeightColon : this._$heightColon,
        widthProperty = isc.Browser.isMoz ? this._$maxWidthColon : this._$widthColon;

    if (clipTitle) {
        if (this._titleClipDivTemplate == null) {
            this._titleClipDivTemplate = [
                
                "<DIV style='overflow:hidden;display:flex;", // 0
                "white-space:nowrap;",          // 1
                ,                               // 2: possible width
                "' ",                           // 3
                isc.DynamicForm._itemPart,      // 4
                "='",                           // 5
                isc.DynamicForm._title,         // 6
                "' ",                           // 7
                isc.DynamicForm._containsItem,  // 8
                "='",                           // 9
                ,                               // 10: item ID
                , (includeClassName ? "' class='" + className : null) // 11: possible className
                ,"'>"                            // 12
            ];
            if (this.emitOuterTextOverflow) {
                this._titleClipDivTemplate[0] += isc.Browser._textOverflowPropertyName + ":ellipsis;";
            }
        } else {
            if (includeClassName) {
                this._titleClipDivTemplate[11] = "' class='" + className;
            } else {
                this._titleClipDivTemplate[11] = null;
            }
        }

        var divTemplate = this._titleClipDivTemplate;

        if (titleWidth != null) divTemplate[2] = widthProperty + titleWidth + "px;";
        else divTemplate[2] = null;

        divTemplate[10] = item.getID();

        output.append(divTemplate.join(isc.emptyString));

    // use NOBR to suppress wrapping. (white-space:nowrap inside a TD works in Moz but not IE)
    } else if (!wrapTitle) { 
        output.append(this._$NOBR);
    }
    // get the actual title from the item
    output.append(this.getTitleHTML(item, error, clipTitle));
    
    if (clipTitle) {
        output.append(this._$divClose);
    }

	// and return the whole thing
    return output.release(false);
},

// Helper method for item title cell identifiers

_containsItemTitleAttrHTML : function (item) {
    if (!isc.DynamicForm._itemTitleAttrHTML) {
        isc.DynamicForm._itemTitleElementAttrHTML =  [
            " ", isc.DynamicForm._containsItem, "='", 
            null,   // item ID
            "' ",
            isc.DynamicForm._itemPart, "='", isc.DynamicForm._title, "' ",
            // Also apply a unique ID so we can grab a pointer to the cell for re-styling 
            // without redrawing the form as a whole.
            "ID='",
            , // title cell ID
            "'"
        ];
    }
    isc.DynamicForm._itemTitleElementAttrHTML[3] = item.getItemID();
    // [Item ID is unique]
    isc.DynamicForm._itemTitleElementAttrHTML[10] = this._getTitleCellID(item);
    return isc.DynamicForm._itemTitleElementAttrHTML.join(isc.emptyString);
},

_$titleCell:"_titleCell",
_getTitleCellID : function (item) {
    return this._getDOMID(item.getID() + this._$titleCell);
},

getTitleCell : function (item) {
    if (!this.isDrawn()) return null;
    // Ensure we normalize name etc to an item object.
    item = this.getItem(item);
    if (!item) return null;
    return isc.Element.get(this._getTitleCellID(item));
},

// We support custom state-based styles for item titles. 
// This method will apply the current style for the title item's title cell
updateTitleCellState : function (item) {
    var titleCell = this.getTitleCell(item);
    if (titleCell == null) return;
    item = this.getItem(item);
    
    // Apply the style to the cell, and also redraw the content of the cell.
    // This will handle things like:
    // - applying updated style to inner (clipping) table if necessary
    // - applying / clearing required title prefix / suffix
    // - picking up any custom state-based HTML returned by getTitleHTML()
    titleCell.className = item.getTitleStyle();
    titleCell.innerHTML = this.getTitleCellInnerHTML(item, item.getErrors());
},


_$titleClipper:"_titleClipper",
_getTitleClipperID : function (item) {
    return this._getDOMID(item.getID() + this._$titleClipper);
},

_getTitleClipper : function (item) {
    if (!this.isDrawn()) return null;
    item = this.getItem(item);
    if (!item) return null;
    return isc.Element.get(this._getTitleClipperID(item));
},

//> @method dynamicForm.titleClipped()
// Is the title for the given form item clipped? The form item must have title clipping enabled.
//
// @param item (FormItem) the form item.
// @return (boolean) true if the title is clipped; false otherwise.
// @see attr:dynamicForm.clipItemTitles
// @see attr:formItem.clipTitle
// @visibility external
//<
titleClipped : function (item) {
    var titleClipper = this._getTitleClipper(item);
    return (titleClipper != null &&
            isc.Element.getClientWidth(titleClipper) < titleClipper.scrollWidth);
},



_titleClipperTemplate: [
    "<div style='" + ((isc.Browser.isIE && isc.Browser.version < 11) ? "float:right;" : "order:2;")
         + "'>",               // 0
    ,                                          // 1: extracted HTML tag starts from title prefix
    ,                                          // 2: title suffix
    "</div><div id='",                         // 3
    ,                                          // 4: "titleClipper" DOM ID
    "' style='overflow:hidden;",               // 5
    isc.Browser._textOverflowPropertyName,     // 6
    ":ellipsis",                               // 7
    (isc.Browser.isIE && !isc.Browser.isStrict ? ";width:100%" : ""), // 8
    "'>",                                      // 9 (note that white-space:nowrap is inherited)
    ,                                          // 10: title prefix
    ,                                          // 11: title HTML
    ,                                          // 12: extracted HTML tag ends from title suffix
    "</div>"                                   // 13
],

//>	@method	dynamicForm.getTitleHTML()	(A)
//	Output the HTML for a title for a FormItem.
//		@group	drawing
//
//		@param	item		(FormItem)	Item to show title of.
//		@param	error		(String)	error message for this item
//
//		@return	(HTMLString)	HTML output for this element
//<
getTitleHTML : function (item, error, clipTitle) {
    
	var output = isc.StringBuffer.create();

	// get the title to display
    
    var title = item.visible ? item.getTitleHTML() : null;
	if (title) {
		var required = this.isRequired(item, true),
            orientation = this.getTitleOrientation(item),
            leftPrefix = (orientation == isc.Canvas.LEFT || orientation == isc.Canvas.TOP);

        if (clipTitle) {
            var clipperTemplate = this._titleClipperTemplate;

            var prefix,suffix;
            if (required && this.hiliteRequiredFields) {
                prefix = leftPrefix ? this.requiredTitlePrefix : this.requiredRightTitlePrefix;
                suffix = leftPrefix ? this.requiredTitleSuffix : this.requiredRightTitleSuffix;
            } else {
                prefix = leftPrefix ? this.titlePrefix : this.rightTitlePrefix;
                suffix = leftPrefix ? this.titleSuffix : this.rightTitleSuffix;
            }



            

            // Extract any HTML tags we're opening in the prefix and closing in the suffix
            // Returns a 2-element array containing the isolated opening and closing tags
            var unequalTags = this._resolveUnequalHTMLTags(prefix, suffix);

            // Write out the suffix (plus any unclosed HTML start-tags extracted from the prefix)
            clipperTemplate[1] = unequalTags[0];
            clipperTemplate[2] = suffix;

            // write ID into clipper element
            clipperTemplate[4] = this._getTitleClipperID(item);

            // Write the prefix, then the title, then for any unclosed HTML tags, 
            // inject the closing tags (extracted from the suffix)
            
            clipperTemplate[10] = prefix;
            clipperTemplate[11] = title;
            clipperTemplate[12] = unequalTags[1];
            output.append.apply(output, clipperTemplate);
        } else {
            // if the title is defined, output the titlePrefix + title + titleSuffix
            output.append(
                (required && this.hiliteRequiredFields ? 
                    (leftPrefix ? this.requiredTitlePrefix : this.requiredRightTitlePrefix) : 
                    (leftPrefix ? this.titlePrefix : this.rightTitlePrefix))
                , title
                , (required && this.hiliteRequiredFields ? 
                    (leftPrefix ? this.requiredTitleSuffix : this.requiredRightTitleSuffix) : 
                    (leftPrefix ? this.titleSuffix : this.rightTitleSuffix))
            );
		}
	} else {
		// otherwise just output a space
		//	this prevents us from putting colons next to an empty title item
		output.append("&nbsp;");
	}
	
	// and return the whole thing
    return output.release(false);
},

// Given a title prefix and suffix, extract any HTML tags being opened in the prefix and
// closed in the suffix

_resolveUnequalHTMLTags : function (prefix, suffix) {

    // For performance, use cacheing rather than extracting HTML tags from prefix/suffix
    // every time this method is run!
    if (isc.DynamicForm._unequalTagsInPrefixCache != null) {
        var cachedObject = isc.DynamicForm._unequalTagsInPrefixCache.find("prefix", prefix);
        if (cachedObject && cachedObject.suffix == suffix) {
            return cachedObject.unequalTags;
        }
    }

    // Start by looking for any html end tags in the suffix that don't have a corresponding
    // start tag (in the suffix)
    
    var openingTagRegex = new RegExp("<\\w.*?>", "g"),
        openingTagsInSuffix = suffix.match(openingTagRegex),
        closingTagRegex = new RegExp("</.*?>", "g"),
        closingTagsInSuffix = suffix.match(closingTagRegex),
        unequalTagNames = {},
        unequalClosingTags = [];

    if (closingTagsInSuffix) {
        for (var i = 0; i < closingTagsInSuffix.length; i++) {
            var closingTag = closingTagsInSuffix[i],
                tagName = closingTag.match("\\w+")[0];

            var foundMatch = false;    
            if (openingTagsInSuffix) {
                for (var ii = 0; ii < openingTagsInSuffix.length; ii++) {
                    var openingTag = openingTagsInSuffix[ii];
                    if (openingTag == null) continue;

                    if (openingTag.substring(1,(tagName.length+1)).toLowerCase() == tagName.toLowerCase()) {
                        foundMatch = true;
                        openingTagsInSuffix[ii] = null;
                    } 
                }
            }

            // If we didn't find an opening tag in the suffix, it is presumably in the prefix
            // Remember these unmatched closing tags in an array
            if (!foundMatch) {
                // remembering the tag-name simplifies code below to look up the opening tag
                // in the prefix string.
                // Edge case note: It's possible there will be more than one tag of the same type
                // for example
                // prefix : <span className="foo"><span style='font-weight:bold;'>
                // suffix : &nbsp:</span></span>
                // In this case we do need to grab both opening tags (and both closing tags)
                unequalTagNames[tagName.toLowerCase()] = true;
                unequalClosingTags.add(closingTag);
                
            }
        }
    }

    // At this stage we've got all closing tags in the suffix which don't have a corresponding
    // opening tag.
    // We can assume these are opened in the prefix. Grab that chunk of HTML so we can
    // prepend it to the suffix HTML in its separate element
    var unequalOpeningTags = [];
    for (var tagName in unequalTagNames) {
        // I need to extract any opening tags for the unequal closing tags
        // which don't already have a corresponding closing tag!
        
        var closingTagIndex = prefix.toLowerCase().lastIndexOf("</" + tagName),
            prefixSubstring = closingTagIndex > 0 ? prefix.substring(closingTagIndex) : prefix;

        // note that this is a global match, and we may legitimately have more than one 
        // unmatched opening tag for the tagName in question.   
        var openingTagRegex = new RegExp("<" + tagName + ".*?>", "gi");
        var matchingOpeningTags = prefixSubstring.match(openingTagRegex);
        
        // As noted above, we may legitimately find more than one opening tag of the same
        // type
        if (matchingOpeningTags != null) {
            unequalOpeningTags.addList(matchingOpeningTags);
        } else {
            // If we couldn't find an orphaned opening tag, ignore the orphaned closing
            // tag we detected - this likely implies some incorrect HTML structure in the
            // prefix/suffix pair
            unequalClosingTags[i] = null;
        }
    }
    unequalClosingTags.removeEmpty();

    var result;

    if (unequalClosingTags.length == 0 || 
        (unequalClosingTags.length != unequalOpeningTags.length))
    {
        result = [null,null]
    } else {
        result = [unequalOpeningTags.join(""), unequalClosingTags.join("")];
    }
    // Cache the result
    if (isc.DynamicForm._unequalTagsInPrefixCache == null) {
        isc.DynamicForm._unequalTagsInPrefixCache = [];
    }
    isc.DynamicForm._unequalTagsInPrefixCache.add({
        prefix:prefix,
        suffix:suffix,
        unequalTags:result
    });

    return result;
},


//>	@method	dynamicForm.getFormTagStartHTML()	(A)
//		@group	drawing
//			Return the HTML to start the form object itself.
//		@return	(String)				HTML for the start form tag
//<
_$formTagStartTemplate:[
    "<FORM " ,                              // 0
    "ID",                                   // 1
    "=" ,                                   // 2
    ,                                       // 3: this.getFormID() 
    ,                                       // 4: absolute positioning, or null
    " METHOD=",                             // 5
    ,                                       // 6: this.method
    " ACTION='",                            // 7
    ,                                       // 8: this.action
    "' ENCTYPE=",                           // 9
    ,                                       // 10: multipart or normal encoding
    ,                                       // 11: Target= or null
    ,                                       // 12: target or null
    ,                                       // 13: close target quote or null
    
    " ONSUBMIT='return ",                   // 14
    ,                                       // 15: this.getID()
    "._handleNativeSubmit()' ONRESET='",    // 16
    ,                                       // 17: this.getID()
    
    // Do our proprietary reset rather than a real native reset.
    // There's no benefit to doing a native reset here, and it breaks certain items such
    // as date items.
    
    ".resetValues(); return false;'",       // 18

    
    " STYLE='margin-bottom:0px'",   // 19
    // This is required to send i18n data to server (which assumes UTF-8 encoding)
    " ACCEPT-CHARSET='UTF-8'", //20
    ">"           // 21
],
_$absPosStyle:" STYLE='position:absolute;left:0px;top:0px;'",
_$targetEquals:" TARGET='",
getFormTagStartHTML : function () {
    var template = this._$formTagStartTemplate,
        FormID = this.getFormID(),
        ID = this.getID();
    template[3] = FormID;
    // In order to get an absPos item placed at 0,0 in Moz (but not IE), it's necessary
    // to absolutely position the <FORM> element, or Moz generates an extra line box
    // with this simple structure.  (change font size to verify the extra space is due
    // to a line box)
    // <DIV STYLE='position:absolute;LEFT:0px;TOP:0px;WIDTH:500px;HEIGHT:500px;'
    // ><div style="position:relative;"><form><div 
    // style="position: absolute; left: 0px; top: 0px;">foobar</div></form></div>
    if (this._absPos()) template[4] = this._$absPosStyle;
    else template[4] = null;
    
    template[6] = this.method;
    template[8] = this.action;
    
	if (this.isMultipart()) template[10] = isc.DynamicForm.MULTIPART_ENCODING;
    else template[10] = isc.DynamicForm.NORMAL_ENCODING;
    
    if (this.target != null) {
        template[11] = this._$targetEquals;
        template[12] = this.target;
        template[13] = this._$singleQuote;
    } else {
        template[11] = null;
        template[12] = null;
        template[13] = null;
    }
    
    
    template[15] = ID;
    template[17] = ID;
    
    return template.join(isc.emptyString);
},



writeWidthAttribute: false,
_writeWidthAttribute : function () {
    return this.writeWidthAttribute;
},
    
//>	@method	dynamicForm.getTableStartHTML()	(A)
//		@group	drawing
//			Return the HTML to start the table drawn around this form.
//		@return	(String)				HTML for the start table tag
//<
_$tableStartTemplate:[
    "<TABLE role='presentation' ID='",          // 0
    ,                       // 1:  this._getTableElementID()

    
    "' WIDTH='",            // 2
    ,                       // 3: innerContentWidth / innerWidth
    "' CELLSPACING='" ,     // 4
    ,                       // 5: this.cellSpacing
    "' CELLPADDING='" ,     // 6
    ,                       // 7: this.cellPadding
    "' BORDER='",           // 8
    ,                       // 9: this.cellBorder

    
    (isc.Browser.isMoz ? "'><TBODY>" : "'>") // 10
],
_$widthEquals: "' WIDTH='",
getTableStartHTML : function () {
    // This method is also applied to containerItems
    var isForm = isc.isA.DynamicForm(this),
        template = isForm ? this._$tableStartTemplate
                          : isc.DynamicForm.getPrototype()._$tableStartTemplate;
    template[1] = this._getTableElementID();
    if (this.isPrinting) {
        template[2] = isForm ? this._$widthEquals : isc.DynamicForm.getPrototype()._$widthEquals;
        template[3] = "100%";
    } else if (!!this._writeWidthAttribute()) {
        template[2] = isForm ? this._$widthEquals : isc.DynamicForm.getPrototype()._$widthEquals;
        template[3] = (this.getInnerContentWidth != null
                       ? this.getInnerContentWidth()
                       : this.getInnerWidth());
    } else {
        template[3] = template[2] = null;
    }
    template[5] = this.cellSpacing;
    template[7] = this.cellPadding;
    template[9] = this.cellBorder;
    
    return template.join(isc.emptyString);
},

// Methods to access the table element for this form
_$table:"table",
_getTableElementID : function () {
    return this._getDOMID(this._$table);
},

_getTableElement : function () {
    return isc.Element.get(this._getTableElementID());
},


// Resizing:
// If we're showing any items who's sizes depend on the specified form size, 
// redraw on resize to force them to be recalculated and redrawn
layoutChildren : function (a,b,c,d) {
    this.invokeSuper(isc.DynamicForm, "layoutChildren", a,b,c,d);
    var items = this.getItems();
    if (!items) return;
    for (var i = 0; i< items.length; i++) {
        // redraw for any percent sized / "*" width child
        var width = items[i].width, height = items[i].height;
        if ( 
            (isc.isA.String(width) && (width.contains("%") || width.contains("*"))) ||
             (isc.isA.String(height) && (height.contains("%") || height.contains("*"))) )
        {
            
            this.markForRedraw("size change with dynamic size children");
            break;
        }
    }
},

getAbsPosHTML : function () {
    var output = isc.SB.create();
	// for each item in the list, get HTML output for it and combine the output
	for (var itemNum = 0, len = this.items.length; itemNum < len; itemNum++) {
    
        // get a pointer to the item for that field
		var item = this.items[itemNum];
		// if a null item, skip it
		if (!item) continue;
		// note that the value of this item can't possibly be dirty anymore
        item._markValueAsNotDirty();

		// if the item has been marked as invisible, skip it
		if (!item.visible) continue;

        
        var includeHint = !item._getShowHintInField(),
            includeErrors = this.showInlineErrors
        ;
        output.append(item.getStandaloneItemHTML(item.getValue(), includeHint, includeErrors));
    }

    //this.logWarn("absPos HTML: " + output.toString());

    // Allow the SB to be reused
    return output.release(false);
},



getScrollWidth : function (recalculate) {
    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("widthCheckWhileDeferred");
    }
    // re-implement caching code
    // Note: important to use the same cache field name because __adjustOverflow() invalidates it.
    if (!recalculate && this._scrollWidth != null) return this._scrollWidth;
    
    var width;
    // call super the fast way if we don't have absolutely positioned items
    if (!isc.Browser.isIE || !this._absPos() || 
        !(this.isDrawn() || this.handleDrawn()) || this.items == null) 
    {
        width = isc.Canvas._instancePrototype.getScrollWidth.call(this, recalculate);
    } else {
        width = 0;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.visible == false || !item.isDrawn()) continue;
            
            var handle = item.getAbsDiv();
            if (handle) {
                var itemRight = handle.scrollWidth + item._getPercentCoord(item.left);
                if (itemRight > width) width = itemRight;
            }
        }
    }
    this._scrollWidth = width;
    return width;
},

getScrollHeight : function (recalculate) {
    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("heightCheckWhileDeferred");
    }
    // re-implement caching code
    // Note: important to use the same cache field name because __adjustOverflow() invalidates it.
    if (!recalculate && this._scrollHeight != null) return this._scrollHeight;
    
    var height;
    // call super the fast way if we don't have absolutely positioned items
    if (!isc.Browser.isIE || !this._absPos() || 
        !(this.isDrawn() || this.handleDrawn()) || this.items == null) 
    {
        height = isc.Canvas._instancePrototype.getScrollHeight.call(this, recalculate);
    } else {
        height = 0;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.visible == false || !item.isDrawn()) continue;
            
            var handle = item.getAbsDiv();
            if (handle) {
                var itemBottom = handle.scrollHeight + item._getPercentCoord(item.top, true);
                if (itemBottom > height) height = itemBottom;
            }
        }        
    }
    this._scrollHeight = height;
    return height;

},

// Submitting
// --------------------------------------------------------------------------------------------

// _formWillSubmit() - will this form perform a direct submission
// If true we need to ensure we write out native elements for each form item 
// (using hidden elements if necessary)
// Note that we need to consider 2 kinds of direct submission:
// - if this.canSubmit is true, and the user hits a submit button (or 'submit()'/ 'submitForm()' 
//   are called, we're performing a completely standard HTML direct submission to the 
//   action URL specified by the developer
// - We also in some cases use direct submission to convey RPC operations. 
//   Cases where this occurs when saveData() is called:
//      - this.canSubmit is true
//      - this.action has been specified (differs from the class prototype value)
//      - isMultipart() is true
// In each of these cases return true to indicate a direct submission will occur
_formWillSubmit : function () {
    return this.canSubmit || this.isMultipart() || 
            (this.action != isc.DynamicForm.getPrototype().action);
},

//>	@method	dynamicForm.submitForm()    ([])
// Submits the form to the URL defined by +link{dynamicForm.action}, 
// identically to how a plain HTML &lt;form&gt; element would submit data,
// as either an HTTP GET or POST as specified by +link{dynamicForm.method}.
// <P>
// <b>Notes:</b>
// <ul>
// <li>this is used only in the very rare case that a form is used to submit data
// directly to a URL.  Normal server contact is through 
// +link{group:dataBoundComponentMethods,DataBound Component Methods}.</li>
// <li>For this method to reliably include values for every field in the grid, 
//      +link{DynamicForm.canSubmit} must be set to <code>true</code></li>
// <li>To submit values for fields that do not have an editor, use +link{HiddenItem} 
// with a +link{formItem.defaultValue} set.  This is analogous to &lt;input type="hidden"&gt;
// in HTML forms.
// </ul>
//      @visibility external
//		@group	submitting
//<
submitForm : function () {
    if (!this._formWillSubmit()) {
        this.logWarn("Attempt to perform direct submission on DynamicForm where this.canSubmit " +
                     "is false. Please set this property to true, or use the standard databinding " +
                     "interfaces to send data to the server.");
    }
    
    // If we have a FileItem as an item in this form warn that we won't save its value and ignore 
    // it. This is appropriate since FileItemForms are intended to be used with a SC Server backed
    // dataSource only and go through the saveData() codepath. We can't apply our values to the
    // FileItemForm and submit it directly since it doesn't have html form items for our various
    // values so will fail to commit them to the server.
    if (this.getFileItemForm() != null) {
        this.logWarn("Performing a direct submission on a DynamicForm containing a FileItem. " +
                    "Note: This item's value will not be submitted to the server.  FileItems " +
                    "are intended for use with databound forms backed by the SmartClient server " +
                    "only.  If you are not using the SmartClient Databinding subsystem, " +
                    "use an UploadItem rather than a FileItem to submit a file as part of a raw " +
                    "HTTP request. Otherwise use saveData() rather than a direct call to " +
                    "submitForm() to save the full set of values for the form.");
    }
    var items = this.getItems() || [],
        uploadItems = [];
    for (var i = 0; i < items.length; i++) {
        if (isc.isA.UploadItem(items[i])) {
            uploadItems.add(items[i]);
        }
    }
    if (this.checkFileAccessOnSubmit && uploadItems.length > 0) {
        this._verifyFileAccessAndSubmit(uploadItems);
    } else {
        this.submitNativeForm();
    }
},

//> @attr dynamicForm.checkFileAccessOnSubmit (boolean : true : IRWA)
// For dynamicForms containing a +link{FileItem} for uploading files,
// should the browser verify that the file is accessible before submitting
// the uploaded file to the server?
// <P>
// In some cases the browser may not be able to access the selected file.<br>
// This can occur when the file has been modified in the file system after selection in the
// browser, or if the current user doesn't have permission to view the file.
// <P>
// By default, before submitting the file to the server
// the browser will verify that it can access the file's contents and display 
// the +link{fileAccessFailedWarning} if file access fails.<br>
// Note that accessing the file's contents is an asynchronous process, so
// form submission is not performed synchronously.
// <P>
// This means that if application code calls +link{saveData()} on a form containing a
// fileItem and then synchronously +link{canvas.clear(),clears} it from the DOM, the upload will
// never be kicked off.<br>
// Setting <code>checkFileAccessOnSubmit</code> to false will suppress the (asynchronous) check, 
// and can be used to bypass this limitation, but this is not recommended except as a short term
// backwards-compatibility workaround. Instead we'd recommend using the +link{saveData(),saveData callback}
// to clear the form when the upload has completed. This also gives the user an opportunity to correct
// validation errors and re-submit the form if necessary.
//
// @visibility external
//<
checkFileAccessOnSubmit:true,

_verifyFileAccessAndSubmit : function (items) {
    this._verifyingFileAccess = true;
    var item = items.pop(),
        _this = this;
    item.checkFileAccess(
        function verifyFileAccessCallback (result) {
            if (_this._abortNativeSubmit) {
                delete _this._abortNativeSubmit;
                return;
            }

            // Note result of "null" just indicates there was no selected file - not a failure
            if (result === false) {
                _this.handleFileAccessError(item);
            } else {
                if (items.length > 0) _this._verifyFileAccessAndSubmit(items);
                else {
                    delete _this._verifyingFileAccess;
                    _this.submitNativeForm();
                }
            }
        }
    );
},

submitNativeForm : function () {

    var form = this.getForm();
    if (!form) {
        this.logWarn("Unable to access native form for submission. Verify that this form has been drawn and has not been cleared.");
        // Clear up the RPC prompt / wait cursor if necessary
        this._cleanUpFailedRPCTransaction();
        return;
    }
    
    // Update the action lazily if necessary - required for the case where it has been modified	 
    // after draw	 
    
    if (form.action != this.action) form.action = this.action;
    
    // In IE, having a partially populated uploadItem on a form, and then attempting to submit
    // the form via a call to form.submit() throws an Access Denied JS error
    // http://support.microsoft.com/kb/892442
    // Trap this case and log a warning
    
    try {
        return form.submit();
    } catch (e) {
        this.logWarn("Form submission was unsuccessful. In some browsers this can occur when " +
            "an upload item is present and has an invalid value.\n" + e.message);
        // We could fire a generic 'submission failed' handler here.
        // Developers can override this to warn the user in a way that makes sense for their
        // application.
        this.formSubmitFailed();
    }
},

// when implicitSave is true, this method is called by changed formItems at editorExit(), or 
// after a pause in editing specified by implicitSaveDelay
performImplicitSave : function (item, onPause) {
    this.implicitSaveInProgress = true;

    if (item) {
        if (item._shouldUpdateParentItem) {
            item.parentItem.updateValue();
        }
        if (item._fireOnPauseTimer != null) isc.Timer.clear(item._fireOnPauseTimer);
    }

    if (this.awaitingImplicitSave) delete this.awaitingImplicitSave;
    this.logInfo("performImplicitSave called " + 
        (!onPause ? "by editorExit()" : "after implicitSaveDelay (" + this.implicitSaveDelay + "ms)") +
        " for item " + item.name + ".");

    var _this = this;

    if (this.valuesManager) {
        // we have a valuesManager - since this is an implicitSave, we want a proper save to occur,
        // so trigger the VM to save, which causes it to gather changed values from all members, 
        // including this one.
        this.valuesManager.saveData(function (dsResponse, data) {
            _this._implicitSaveCallback(data); }, {showPrompt: false});
    } else {
        this.saveData(function (dsResponse, data) {
            _this._implicitSaveCallback(data); }, {showPrompt: false});
    }
},

_addItemToImplicitSaveUpdateArray : function (item) {
    var storage = this.valuesManager ? this.valuesManager : this;
    if (!storage.itemsToUpdateState) storage.itemsToUpdateState = [];
    item.awaitingImplicitSave = true;
    storage.itemsToUpdateState.add(item);
    item.updateState();
},

_implicitSaveCallback : function (data) {
    delete this.implicitSaveInProgress;
    var storage = this.valuesManager ? this.valuesManager : this;
    if (storage.itemsToUpdateState) {
        for (var i=0; i< storage.itemsToUpdateState.length; i++) {
            var item = storage.itemsToUpdateState[i];
            delete item.awaitingImplicitSave;
            item.wasAwaitingImplicitSave = true;
            item.updateState();
        }
        delete storage.itemsToUpdateState;
    }
    this.implicitSaveCallback(data);
},



// default empty implementation in case devs switch implicitSave on without providing an override of this
implicitSaveCallback : function (data) {},

//> @attr DynamicForm.formSubmitFailedWarning (String : "Form was unable to be submitted. The most likely cause for this is an invalid value in an upload field." : IRWA)
// Warning to display to the user if an attempt to +link{dynamicForm.submitForm,natively submit} a
// form is unable to submit to the server. The most common cause for this failure is that the user
// has typed an invalid file-path into an upload type field.
// @visibility external
// @group i18nMessages
// @deprecated see +link{formSubmitFailed}
//<
formSubmitFailedWarning:"Form was unable to be submitted. The most likely cause for this is an " +
                        "invalid value in an upload field.",

//> @attr DynamicForm.fileAccessFailedWarning (String : "Unable to access the selected file(s) for upload. Please re-select the file and try again." : IRW)
// Warning to display to the user if a selected file in an UploadItem cannot be accessed.
// This will be displayed on form submission when the browser is unable to access the
// selected file for upload.
// <P>
// Typically this indicates a browser-level security restriction - for example the file has been edited
// on the disk, or had its permissions changed after the user selected it, but before they 
// attempted to submit the form.
// <P>
// When this occurs the selected file will be cleared from the upload item and this message will be
// displayed to the user in a +link{isc.warn(),warn dialog}.
// @group i18nMessages
// @visibility external
//<
fileAccessFailedWarning:"Unable to access the selected file for upload. Please re-select the file and try again.",
handleFileAccessError : function (item) {
    if (item != null) {
        item.clearValue();
        isc.warn(this.fileAccessFailedWarning.evalDynamicString(this, {form:this, item:item}));
    }
    this._cleanUpFailedRPCTransaction();
},


//> @method DynamicForm.formSubmitFailed() [A]
// Method called when an attempt to +link{dynamicForm.submitForm,natively submit} a
// form is unable to submit to the server. Default behavior is to display the
// +link{formSubmitFailedWarning} in a warning dialog.
// The most common cause for this failure is that the user
// has typed an invalid file-path into an upload type field.
// <P>
// <b>Note:</b> This is very unlikely to occur with modern versions of IE, which don't allow the
// path of a file to be edited by hand (only selected via file navigation).  It was last seen
// in IE6-7 under Windows XP.
// <P>
// Rather than throwing an exception on the client during submit(),
// normally all failures in native form submission are handled by the server.  For further
// information, see +link{group:upload,File Uploading}.
// @visibility external
// @group i18nMessages
// @deprecated only known to be called in IE6-7, not supported by SmartClient 12+
//<
// Also cleans up pending RPCManager transactions if this form was doing a submit type transaction
formSubmitFailed : function () {
    isc.warn(this.formSubmitFailedWarning);
    this._cleanUpFailedRPCTransaction();
},
_cleanUpFailedRPCTransaction : function () {
    // go a step further - if this was an attempt to commit an RPCManager transaction
    // we can cancel it so we don't hang with a prompt, or pop a timeout warning in a minute or 2
    var transactionText = this.getValues()._transaction;
    if (transactionText != null && isc.RPCManager && isc.XMLTools) {
        var doc = isc.XMLTools.parseXML(this.getValues()._transaction),
            transactionNum;
        if (doc) transactionNum = isc.XMLTools.selectNumber(doc, "//transactionNum");
        if (transactionNum != null) {
            
            isc.RPCManager.doClearPrompt(transactionNum);
            isc.RPCManager.clearTransaction(transactionNum);
        }
        
        var transactionItem = this.getItem("_transaction");
        if (transactionItem && isc.isA.HiddenItem(transactionItem)) {
            this.clearValue("_transaction");
        }
    }
},

//> @method DynamicForm.setAction()
// Sets the +link{DynamicForm.action,action} for this form.
// @param action (URL) New action URL
// @visibility external
//<
// @param autoGenerated (boolean) Was this action auto-generated by the SmartClient databinding
// system or explicitly specified by a developer?
 
setAction : function (action, autoGenerated) {
    this.action = action;
    var form = this.getForm();
    if (form) form.action = action;
    this._explicitAction = !autoGenerated;
},

//> @method DynamicForm.setTarget()
// Sets the +link{DynamicForm.target,target} for this form.
// @param target (String) New submission target
// @visibility external
//<
setTarget : function (target) {
    this.target = target;
    var form = this.getForm();
    if (form) form.target = target;
},


//> @method DynamicForm.setMethod()
// Sets the +link{DynamicForm.method,method} for this form.
// @param method (FormMethod) html form submission method (get or post)
// @visibility external
//<
setMethod : function (method) {
    this.method = method;
    var form = this.getForm();
    if (form) form.method = method;
},


// If we have a FileItem in this form, this helper method will return a pointer to its form 
getFileItemForm : function () {
    if (!isc.FileItem) return null;
    var items = this.getItems() || [];
    var seenFileItem = false,
        fileItemCanvas = null;
    for (var i = 0; i < items.length; i++) {
        if (isc.isA.FileItem(items[i])) {

            // If we encounter multiple file items on a form, log a warning (once)
            if (seenFileItem) {
                this._multiFileItemWarningShown = true;
                this.logWarn("This DynamicForm contains more than one item of type FileItem. " +
                    "This is not supported - a DynamicForm can only support a single FileItem.");
                continue;
            }
            
            var canvas = items[i].canvas;

            // Make sure that the FileItem's canvas is a DynamicForm before returning it because
            // there are cases where the canvas is not a form (for example, if the FileItem is
            // read-only).
            if (isc.isA.DynamicForm(canvas)) {
                seenFileItem = true;

                fileItemCanvas = canvas;
                // If we've already shown the multi-fileItem warning, no need to look
                // at other items and potentially warn again.
                if (this._multiFileItemWarningShown) break;
            }
        }
    }
    return fileItemCanvas;
},

_propagateOperationsToFileItem : function() {
    var form = this.getFileItemForm();
    if (form != null) {
        form.fetchOperation = this.fetchOperation;
        form.updateOperation = this.updateOperation;
        form.addOperation = this.addOperation;
        form.removeOperation = this.removeOperation;
    }
},


// _handleNativeSubmit.
// This method is fired from the onsubmit handler for the HTML form for this DynamicForm widget.
// The onsubmit handler will fire whenever a user action would normally trip a form submission
// These cases are:
// - If there's a submit element on the form and the user clicks it
// - If there's a submit element on the form and the user is focused in a Text item, and
//   hits enter.
// - If there's a single text element in the form only (even if there is no submit item) and 
//   the user hits enter while focused in it
// We disallow native submission by returning false from this method in each of these cases
// because:
// - we never write out a native submit element (our submitItem is a buttonItem subclass)
// - we have our own more reliable handling for submitting on Enter keypress, explicitly handled
//   by our keypress handler.
// Note that onsubmit does NOT fire when form.submit() is called programmatically, so this has
// no effect except on the user interactions listed above.  
// We can therefore always return false to suppress this event.
_handleNativeSubmit : function () {
    return false;  
},



// Validation
// --------------------------------------------------------------------------------------------

//>	@method	dynamicForm.validate()  ([])
// Validates the form without submitting it, and redraws the form to display error messages
// if there are any validation errors. Returns true if validation succeeds, or false if
// validation fails.
// <P>
// For databound forms, any +link{Datasource} field validators will be run even if there is no
// associated item in the form.  Validators will also be run on hidden form items.  In both
// these cases, validation failure can be handled via 
// +link{DynamicForm.handleHiddenValidationErrors()}.
// <P>
// If this form has any fields which require server-side validation (see 
// +link{Validator.serverCondition}) this will also be initialized. Such validation will
// occur asynchronously.  Developers can use +link{dynamicForm.isPendingAsyncValidation()} and
// +link{dynamicForm.handleAsyncValidationReply()} to detect and respond to asynchronous
// validation.
// <P>
// Note that for silent validation, +link{valuesAreValid()} (client-side) and 
// +link{checkForValidationErrors()} (client and server-side) can be used instead.
//
// @param [validateHiddenFields] (boolean) Should validators be processed for non-visible fields
//         such as dataSource fields with no associated item or fields with visibility set to
//         <code>"hidden"</code>?
// @return (boolean) true if validation succeeds, or false if validation fails.
// @visibility external
// @group	validation
// @example formsValidationType
// @see method:valuesManager.validate
//<



// checkValuesOnly parameter - if passed we're not going to store errors on the form or display
// them - simply pick up the error values and return them. Called by the 'valuesAreValid()' method




validate : function (validateHiddenFields, ignoreDSFields, typeValidationsOnly,
                     checkValuesOnly, skipServerValidation, suppressShowErrors, callerContext)
{
    if (this.disableValidation) return true;

    // skip validation if we're databound and our datasource has validation disabled
    if (this.dataSource && this.dataSource.useLocalValidators != null &&
        this.useLocalValidators == false) return true;

    var hadErrorsBefore = this.hasErrors(),   // remember if we had errors before
                                              // so we'll redraw the form if this
                                              // validation pass finds no errors
        errorsFound = false,
        form = this.getForm(),
        hasChanges = false
    ;
    
    // We need to validate: 
    // - form items with validators
    // - values that map to DS fields with validators.
    // (we don't need to worry about values with no associated field as there is no way to
    //  specify validators for such fields)
    var errors = {},
        hiddenErrors = {},
        values = this.getValues(),
        record = this._getRecordForValidation(true, values),
        // fields are returned from ds in {fieldName:fieldObject} format
        dsFields = (validateHiddenFields && !ignoreDSFields && this.dataSource) 
                        ? isc.addProperties({}, this.getDataSource().getFields()) 
                        : null
    ;
    // Validate each form item
    // Note that when validating ContainerItem (e.g. DateItem) form items, only the
    // ContainerItem itself is validated, and not any of its sub-items.
    var validationOptions = {unknownErrorMessage: this.unknownErrorMessage,
                             serverValidationMode: "full"};
    if (typeValidationsOnly)
        validationOptions.typeValidationsOnly = typeValidationsOnly;
    if (skipServerValidation)
        validationOptions.skipServerValidation = skipServerValidation;
    else
        validationOptions.deferServerValidation = true;

    // Wrap field validation in a queue so that server validators are
    // sent as a single request.
    var wasAlreadyQueuing = isc.rpc ? isc.rpc.startQueue() : false;

    // Field objects that require server validation
    var fieldsNeedingServerValidation = [];

    for (var itemNum = 0; itemNum < this.items.length; itemNum++) {
    	var fieldErrorsFound = false,
            // get the field item
            item = this.items[itemNum],
            // get the name of this column in the values
            column = item.getFieldName(),
            // get the dataPath so we can perform validation with dataPath
            
            dp = item.getTrimmedDataPath() || item.getFieldName(),
            // get the value of this item
            value = item.getValue(),
            hidden = !item.visible || isc.isA.HiddenItem(item)
        ;
        if (hidden && !validateHiddenFields) continue;
        
        if (!column && !dp) {
            if (item.validators != null) {
                // the field has no name and no dataPath - can't apply the validation error - just
                // log a warning instead, and continue
                this.logWarn("Item with index " + itemNum +
                     " has no name or dataPath - can't validate.");
                continue;
            }
        }

        if (item.validators != null) {
            
            // normalize item.validators to an array.
            if (!isc.isAn.Array(item.validators)) {
                item.validators = [item.validators];
            }	

            // Perform actual validation.
            var fieldResult = this.validateField(item, item.validators, value,
                                                 record, validationOptions);
            if (fieldResult != null) {
                if (fieldResult.needsServerValidation) {
                    fieldsNeedingServerValidation.add(item);
                }
                if (fieldResult.errors != null) {
                    fieldErrorsFound = this.addValidationError(errors, column || dp,
                                                                fieldResult.errors);
                    if (fieldErrorsFound) errorsFound = true;
                }

                // if the validator returned a resultingValue, use that as the new value
                // whether the validator passed or failed.  This lets us transform data
                // (such as with the mask validator).
                if (fieldResult.resultingValue != null && 
                	this.compareValues(value, fieldResult.resultingValue, item)) 
                { 
                    // remember that value in the values list
                    value = fieldResult.resultingValue;
                    if (dp) {
                        isc.DynamicForm._saveFieldValue(dp, item, value, values, this, true, "validate");
                    } else if (column) {
                        values[column] = value;
                    }
                    hasChanges = true;
                }
            }
        }
                
        // If the item is not visible, copy the errors so we can run a method to let the
        // developer handle errors on hidden fields
        // Note that this includes 'hiddenItems' that are not marked as visible:false
        if (hidden && fieldErrorsFound) hiddenErrors[column || dp] = errors[column || dp];
        
        // Validators applied to an item are a superset of the validators applied to
        // a dataSource field - therefore no need to run DSField validators for this field
        
        if (dsFields) delete dsFields[column];
    }
    
    // If we are attached to a rules engine, notify it that we are performing validation.
    // This gives it a chance to re-run any validators it has in its rulesData that apply to
    // our specific fields
    var rulesEngine = this.getRulesEngine();
    if (rulesEngine != null) {
        var rulesErrors = rulesEngine.applyFieldValidators(errors, this);
        if (rulesErrors) errorsFound = true;
    }

    var mustStopOnError = false;

    
    // Explicitly run through datasource field validators
    if (dsFields) {    
        // Unless we're looking at a 'required' or 'requiredIf' field,
        // don't try to validate null values.
        validationOptions.dontValidateNullValue = true;
        // We want to process all validators
        delete validationOptions.typeValidationsOnly;
        // Tell the validation process that we are validating fields that have no matching 
        // FormItem, so the conditionallyRequired checks know whether a missing value is 
        // definitely missing or needs to be checked on the server
        validationOptions.validatingDsFields = true;

        for (var i in dsFields) {
            
            var fieldObject = dsFields[i],
                fieldName = i,
                validators = fieldObject.validators
            ;

            if (validators != null) {
                var value = values[fieldName];

                // Validate the dataSource field
                var fieldResult = this.validateField(fieldObject, validators, value,
                                                     values, validationOptions);
                if (fieldResult != null && fieldResult.errors != null) {
                    this.addValidationError(errors, fieldName, fieldResult.errors);
                }
                if (!checkValuesOnly && fieldResult && fieldResult.stopOnError) {
                    var item = this.getItem(fieldName);
                    if (item) {
                        item.setBlockingErrors(fieldResult.errors != null);
                        mustStopOnError = true;
                    }
                }
            }
            
            if (errors[fieldName] != null) hiddenErrors[fieldName] = errors[fieldName];
        }
    }

    // Perform deferred server validation if needed
    if (fieldsNeedingServerValidation.length > 0) {
        // Note - pass the entire record to the server (may be derived from our parent
        // valuesManager) - this ensures that we have values for all required fields, etc
        
        this.validateFieldsOnServer(fieldsNeedingServerValidation, record, validationOptions,
                                    callerContext);
    }
	
    // Submit server validation requests queue
    if (!wasAlreadyQueuing && isc.rpc) isc.rpc.sendQueue();

    //>DEBUG
    if (errorsFound) this.logInfo("Validation errors: " + isc.Log.echoAll(errors));
    //<DEBUG 

    if (checkValuesOnly) return (errorsFound ? errors : true);

    // set the error messages for the form whether any were found or not
    this.setErrors(errors);
    

    // if validation changes values, update the visible values in the form elements, which will
    // automatically update this.values
    if (hasChanges) {
        this.setItemValues(values, null, null, null, true);
        // directly save values for which there are no form elements
        for (var field in values) {
            if (this.getItem(field) == null) this._saveValue(field, values[field]);
        }
    }

    // redraw if we found new errors or if we previously had errors which must be cleared from view
    if (!suppressShowErrors && (errorsFound || hadErrorsBefore)) {
        this.showErrors(errors, hiddenErrors, mustStopOnError);
    }

    return !errorsFound;
},

_getRecordForValidation : function (updateFocusItemValue, defaultValues) {
    
    var manager = this.valuesManager;
    if (manager != null) {
        var record = updateFocusItemValue ? manager.getValues() : 
                         isc.addProperties({}, manager.values);
        if (this.dataPath != null) {
            record = isc.DynamicForm._getFieldValue(this.dataPath, null, record, this, true);
        }
        return record;
    } 

    var undef;
    if (defaultValues !== undef) return defaultValues;

    
    return isc.addProperties({}, updateFocusItemValue ? this.getValues() : this.values);
},

//> @method DynamicForm.valuesAreValid()
// Method to determine whether the current form values would pass validation.
// This method operates client-side, without contacting the server, running validators on the
// form's values and returning a value indicating whether validation was successful.  
// <P>
// Unlike +link{DynamicForm.validate()} this method will not store the errors on the DynamicForm
// or display them to the user.
// <P>
// Note that +link{checkForValidationErrors()} allows for checking for server-side errors, and
// finding out what those errors are via a callback.
//
// @param validateHiddenFields (boolean) Should validators be processed for non-visible fields
//         such as dataSource fields with no associated item or fields with visibility set to
//         <code>"hidden"</code>?
// @param [returnErrors] (boolean) If unset, this method returns a simple boolean value indicating
// success or failure of validation. If this parameter is passed, this method will return
// an object mapping each field name to the errors(s) encountered on validation failure, or null
// if validation was successful.
// @return (boolean | Map) Boolean value indicating validation success, or if 
// <code>returnErrors</code> was specified, <smartclient>an object mapping</smartclient>
// <smartgwt>a map of</smartgwt> field names to the associated errors, for those fields that
// failed validation, or null if validation succeeded.
// @visibility external
// @group validation
//<
valuesAreValid : function (validateHiddenFields, returnErrors) {
    var errors = this.validate(validateHiddenFields, null, null, true, true);
    if (errors === true) {
        return (returnErrors ? null : true);
    } else {
        return (returnErrors ? errors : false);
    }
},

//> @method Callbacks.ValidationStatusCallback
// A +link{type:Callback} to evaluate when form validation completes.
// <p>
// The available parameters are:
// @param errorMap (Map) null if validation succeeded for all fields, or <smartclient>an
// object mapping</smartclient><smartgwt>a Map of</smartgwt> field names to the associated
// errors, for those fields that failed validation.
//
// @visibility external
//<

//> @method DynamicForm.checkForValidationErrors
// Performs silent validation of the current form values, like +link{valuesAreValid()}.  In
// contrast to +link{valuesAreValid()}, this method allows checking for server-side errors, and
// finding out what the errors are.  
// <P>
// The callback must be passed unless server-side validation is being skipped, and If passed,
// it always fires, errors or not, firing synchronously if server validation is skipped.
//
// @param callback (ValidationStatusCallback) callback to invoke after validation is complete
// @param [validateHiddenFields] (boolean) should validators be processed for non-visible fields
//         such as dataSource fields with no associated item or fields with visibility set to
//         <code>"hidden"</code>
// @param [skipServerValidation] (boolean) whether to skip doing server-side validation
//
// @return (Map) null if server-side validation is required, or no errors are present;
// otherwise, <smartclient>an object mapping</smartclient><smartgwt>a Map of</smartgwt> field
// names to the associated errors, for those fields that failed validation.
//
// @visibility external
// @group validation
//<
checkForValidationErrors : function (callback, validateHiddenFields, skipServerValidation) {
    
    var errors = this.validate(validateHiddenFields, null, null, true, true);
    if (errors === true) errors = null;

    // return immediately if errors detected or skipping server-side validation
    var dataSource = this.getDataSource();
    if (errors || skipServerValidation || !dataSource) {
        if (callback != null) this.fireCallback(callback, "errorMap", [errors]);
        return errors;
    }

    if (!callback) {
        this.logWarn("checkForValidationErrors(): no callback has been provided, but not " +
                     "skipping server-side validation - this is invalid usage");
        return;
    }
        
    // validate the data on the server
    var values = this.getValues(),
        context = this.buildRequest(null, "validate");
    context.editor = this;

    var form = this;
    dataSource.validateData(values, function (response, data) {
        var errors = response.status == isc.RPCResponse.STATUS_VALIDATION_ERROR && 
                     response.errors ? response.errors : null;
        // translate server error format to editor component error format
        
        if (errors && !form.reportRawServerErrors) {
            errors = isc.DynamicForm.getSimpleErrors(errors);
        }
        this.fireCallback(callback, "errorMap", [errors]);
    }, context);
},

//> @method DynamicForm.getValidatedValues()
// Call +link{dynamicForm.validate()} to check for validation errors. If no errors are found,
// return the current values for this form, otherwise return null.
// @return (Object) current values or null if validation failed.
// @group errors
// @visibility external
//<
getValidatedValues : function () {
    // validate the form
    // This will cause the form to redraw automatically if it has new errors 
    // (or it had errors before and doesn't now).
     
    if (!this.validate()) return null;
    return this.getValues();
}, 

//> @method DynamicForm.showErrors()
// If this form has any outstanding validation errors, show them now.<br>
// This method is called when the set of errors is changed by +link{dynamicForm.setErrors()} or
// +link{dynamicForm.validate()}.<br>
// Default implementation will redraw the form to display error messages and call
// +link{DynamicForm.handleHiddenValidationErrors(), handleHiddenValidationErrors()} to
// display errors with no visible field.<br>
// Note that this method may be overridden to perform custom display of validation errors.  
// @group errors
// @visibility external
//<
// Additional 'errors' / 'hiddenErrors' parameters
// Used internally when we have just calculated the errors, as well as which fields are visible 
// and which are hidden
// contains an object of fieldName to error mappings for fields that are not visible.
// Not public - if this method is being called by the user, always re-calculate which fields are
// visible /hidden. This is cleaner than tracking the hidden errors in a separate object as we'd
// have to update that each time fields were shown / hidden, etc.
showErrors : function (errors, hiddenErrors, forceRefocus) {
    
    var suppressAutoFocus = (!forceRefocus && !this.autoFocusOnError) || this._suppressAutoFocusOnErrors;
    if (this._suppressAutoFocusOnErrors) delete this._suppressAutoFocusOnErrors;

    
    var focusItem = this.getFocusItem();
    if (focusItem && focusItem._handlingInput && focusItem.hasFocus) suppressAutoFocus = true;
    
    var undef;
    if (hiddenErrors === undef) hiddenErrors = this.getHiddenErrors();
    if (errors === undef) errors = this.getErrors();
    
    // If we have errors and we're not showing them inline, we need to auto-generate a blurb
    // item at the top of the form to display the errors.
    // Do this in showErrors only - this way if showInlineErrors is set to false, and this
    // method is overridden the developer will be suppressing this default approach.
    if (errors && !this.showInlineErrors && 
        (!this._errorItem || this._errorItem.destroyed || !this.items.contains(this._errorItem))) 
    {
        this.createErrorItem();
    }

    // Redraw whether there are outstanding errors or not. This means that this method will 
    // also clear visible errors that have been resolved.
    this.markForRedraw("Validation Errors Changed");

    if (errors && !isc.isAn.emptyObject(errors) && !suppressAutoFocus) {
        for (var fieldName in errors) {
            var item = this.getItem(fieldName);
            // if an error item was found, set the focus to that item
            
            if (item && item.isVisible() && item.isDrawn()) {
                this._focusInItemWithoutHandler(item);
                break;
            }
        }
    }
    // if we're showing the blurb at the top of the form scroll it into view.
    // Do this on a delay to allow IE to asynchronously complete focusing in the first error item 
    if (!this.showInlineErrors) {
        this.delayCall("scrollIntoView", [0,0], 100);
    }
    
    if (hiddenErrors) {    
        this._handleHiddenValidationErrors(hiddenErrors);
    }
},

getHiddenErrors : function () {
    if (!this.errors) return null;
    var hasHiddenErrors = false, hiddenErrors = {};
    
    for (var fieldName in this.errors) {
        var item = this.getItem(fieldName);
        if (!item || !item.visible) {
            hasHiddenErrors = true;
            hiddenErrors[fieldName] = this.errors[fieldName];
        }
    }    
    return (hasHiddenErrors ? hiddenErrors : null);
},

//> @method DynamicForm.showFieldErrors () 
// If this form has any outstanding validation errors for the field passed in, show them now.
// Called when field errors are set directly via +link{dynamicForm.setFieldErrors()} / 
// +link{dynamicForm.addFieldErrors} / +link{dynamicForm.clearFieldErrors()}.<br>
// Default implementation simply falls through to +link{dynamicForm.showErrors()}.
// @param fieldName (String) field to show errors for
// @group errors
// @visibility external
//<
// This can be called if errors are being updated individually on a per field basis.
// Note that calling handleHiddenVlaidationErrors will actually fire the handler and pass in
// the full set of hidden errors. We could have a more fine grained method 
// like 'handleHiddenFieldValidationErrors()' instead.

showFieldErrors : function (fieldName, suppressAutoFocus) {
    // 'null' has meaning to showErrors so use explicit undefined instead
    var undef;
    if (suppressAutoFocus) this._suppressAutoFocusOnErrors = true;
    return this.showErrors();
},

// _handleHiddenValidationErrors()
// Internal method to display validation errors when we can't show them in a form.
// This is used to handle 
// - errors coming from hidden form items
// - errors coming from a dataSource field for which we have no form item.
_handleHiddenValidationErrors : function (errors) {
    if (errors == null || isc.isAn.emptyObject(errors)) return;

    // If we have an implementation to handle the hidden validation errors, call it now.
    var returnVal;
    if (this.handleHiddenValidationErrors) {
        returnVal = this.handleHiddenValidationErrors(errors);
    }
    
    
    // returning false suppresses the log warn statement
    if (returnVal == false) return;

    var errorString = "Validation errors occurred for the following fields " +
                        "with no visible form items:";
                        
    for (var fieldName in errors) {
        var fieldErrors = errors[fieldName];
        if (!isc.isAn.Array(fieldErrors)) fieldErrors = [fieldErrors];
        if (fieldErrors.length == 0) continue;
            
        errorString += "\n" + fieldName + ":";
        for (var i = 0; i < fieldErrors.length; i++) {
            errorString += (i == 0 ? "- " : "\n - ") + fieldErrors[i];
        }
    }
    
    this.logWarn(errorString, "validation");
},

isRequired : function (item, ignoreCanEdit) {
    return (
        (ignoreCanEdit ? true : isc.DynamicForm.canEditField(item, this)) &&
            (item.required ||  // marked required is form or DS fields
             item._required || // currently required due to requiredIf
             // XML element is required and we are treating that as meaning required
             this.isXMLRequired(item))
           );
},

//>	@method	dynamicForm.setRequiredIf()	(A)
// Iterate through the items, setting the _required property of any item with a requiredIf
// to correspond to the evaluation that property
//
//			some fields may become required or not required
//		@group	validation
//<

_$requiredIf:"requiredIf",
_$required:"required",
setRequiredIf : function () {
	var values = this.getValues();

	// if any fields have 'requiredIf' set, set their required property now
	for (var itemNum = 0; itemNum < this.items.length; itemNum++) {
		var item = this.items[itemNum],
			validators = item.validators
		;
		// Ensure if a 'required'/'requiredIf' 
		// validator gets removed we don't keep stale "_required" flags around!
		delete item._required;
		// if item is not visible or it has no validators, skip it
		if (!item.visible || !validators || validators.length == 0) continue;
		
		for (var v = 0; v < validators.length; v++) {
			var validator = validators[v];
			if (!validator) continue;
			var type = isc.Validator.getValidatorType(validator);
			if (type == this._$requiredIf) {
				var value = item.getValue();
				// CALLBACK API:  available variables:  "item,validator,value"
				// Convert a string callback to a function
				if (validator.expression != null && !isc.isA.Function(validator.expression)) {
					isc.Func.replaceWithMethod(validator, "expression", 
                                                     "item,validator,value,record");
				}
				
				// set the hidden value for item._required according to the results of the 
				// expression
				item._required = validator.expression.apply(this, [item, validator, value, values]);
			// if an explicit 'required' validator was specified but the field wasn't marked
			// as required:true, set the _required flag so we still show the required styling
			// on the title, etc.
			} else if (type == this._$required) {
			    item._required = true;
			}
		}
	}	
},


//special handling of focus is required when a click mask is hidden
_restoreFocusForClickMaskHide : function () {
	
    this.setFocus(true, true);
},

//>	@method	dynamicForm.setFocusItem()	(A)
//  Internal method used to track which form item last had focus.
//  The focusItem is updated with this method whenever an item receives focus.  When focus()
//  is called on the form, the focusItem will then be given focus.
//  Can be retrieved via 'getFocusSubItem()' [or 'getFocusItem()' if we don't want sub items
//  of containerItems], and cleared via 'clearFocusItem()'
//  Note that the focusItem may not currently have focus - focus could be on another widget.
//  Check formItem.hasFocus to see if an item currently has focus.
//
//		@group eventHandling, focus
//		@param	item (FormItem)	item to focus in
//      @param  [itemIcon] (String) item icon name to focus in
//<
setFocusItem :  function (item, itemIcon) {
	// normalize the item passed in
	item = this.getItem(item);
	this._focusItem = item;
	this._focusItemIcon = itemIcon;
	if (this.hasStableLocalID()) {
	    var path = this.getLocalId() + ".focusField",
            value = item && this.isFocused() ? item.name : null,
            currentValue = this._getFromRuleContext(path)
	    ;
	    if (value != currentValue) this.provideRuleContext(path, value, this);
	}
},
    
//> @method dynamicForm.isFocused()
// Returns true if this DynamicForm has the keyboard focus.
// <P>
// Unlike standard canvases, for a DynamicForm this method will return true when keyboard
// focus is currently on one of the form's +link{dynamicForm.items,items}.
// <P>
// Note that in some cases the items of a form may be written directly into a different
// +link{formItem.containerWidget, canvas}. In this case the dynamicForm containing the
// items may not have been drawn on the page itself, but this method can still return true
// if one of the items has focus.
// @return (Boolean) whether focus is currently in one of this form's items.
// @visibility external
//<

isFocused : function () {
    if (this.Super("isFocused", arguments) == true) return true;
    var focusItem = this.getFocusItem();
    if (focusItem && isc.isA.CanvasItem(focusItem) && focusItem.isFocused()) {
        return true;
    }
    return false;
},

//>	@method	dynamicForm.getFocusItem()	(A)
// Return the current focus item for this form. 
// <P>
// This is the item which either currently has focus, or if focus is not
// currently within this form, would be given focus on a call to
// +link{dynamicForm.focus()}. May return null if this form has never had focus,
// in which case a call to <code>form.focus()</code> would put focus into the 
// first focusable item within the the form.
// <P>
// Note that if focus is currently in a sub-item of a +link{DateItem} or +link{RadioGroupItem},
// this method will return the parent item, not the sub-item.
// @return (FormItem) Current focus item within this form. May be null.
// @see dynamicForm.isFocused()
// @see formItem.isFocused()
// @group eventHandling, focus
// @visibility external
//<
getFocusItem : function () {
    var item = this.getFocusSubItem();
    if (item != null) {
        while (item.parentItem != null) {
            item = item.parentItem;
        }
    }
    return item;
},

// For container items, we actually store the focusable sub item rather than
// the containerItem.
// This is what we typically use internally as this is where we'll explicitly put focus
// on redraw, etc.
getFocusSubItem : function () {
	return this._focusItem;
},

getFocusItemIcon : function () {
    return this._focusItemIcon;
},

// Override _readyToFocus() -- if this DF is not drawn, it may still be appropriate to give it
// focus as it's items may be written into a container widget.
_readyToSetFocus : function () {

    // Note: see comment in Canvas._readyToSetFocus() for docs on isc_suppressFocus
    return !this.isDisabled() && !window.isc_suppressFocus;
    
    
},

// Disable focusOnMouseDown
// We rely on native focus on mouse down in natively focusable elements (form items, etc)
// and on item-level mouseDown / click handlng for non-focusable elements (select item div, etc)

focusOnMouseDown : function () {
    return;
},

// Override 'setFocus()' to update item focus.

setFocus : function (hasFocus, canTargetIcon) {
    if (!this._readyToSetFocus()) return;
    var visible = this.isVisible();
    if (hasFocus) {

        // focus back in the last focus item if there is one.
        var item = this.getFocusSubItem();
        if (item == null) {
            var items = this.getItems();
            if (items != null) {
                for (var i = 0; i < items.length; i++) {
                    var testItem = items[i];
                    if (testItem._canFocus() && testItem.isDrawn() && 
                        testItem.isVisible() && !testItem.isDisabled()) 
                    {
                        item = testItem;
                        break;
                    }
                }
            }
        }
        var itemIcon = (canTargetIcon && item ? this.getFocusItemIcon() : null);
        
        var event = isc.EH.lastEvent;
        if (item != null) {
            // No need to call Super because focusing in the item will trigger the 
            // elementFocus() method which updates this.hasFocus, etc.
            return this.focusInItem(item, itemIcon);
        }
    }

    this.Super("setFocus", arguments);
    // Override 'blur()' to take focus away from the focus item, as well as clear out 
    // this.hasFocus.    
    if (!hasFocus) {
        
        // Note we use the internal _blurItem() method to avoid clearing out this._focusItem.
        // This means a subsequent 'focus()' call on this form will restore focus to the same 
        // item.
        this._blurItem(this.getFocusSubItem());
        
    }
},

// Override getFocusedTabIndexEntry() to delegate down to the relevant item's focused
// part (text box, icon, etc)

getFocusedTabIndexEntry : function () {
    var focusItem = this.getFocusSubItem();
    if (focusItem == null) {
        return this.Super("getFocusedTabIndexEntry", arguments);
    } else {
        return focusItem._getCurrentFocusTargetID();
    }
},

    
// Since in dynamicForm focus is essentially delegated to our items, simply no-op if
// the TabIndexManager shiftFocus method attempts to focus in the form itself.
// The items are also registered and can handle shifting focus to themselves directly.    
syntheticShiftFocus : function (ID) {
    return false;
},

// Helper - can we currently call 'focus' on an item?
_canFocusInItem : function (item, tabStop) {
    if (isc.isA.String(item)) item = this.getItem(item);
    return item && item._canFocus() && item.isDrawn() && item.isVisible() && !item.isDisabled()
            && (!tabStop || item.tabIndex != -1);
},

// Re-document focus to explain the "focusItem" behavior.
//> @method dynamicForm.focus()
// Give keyboard focus to this form. If this form has had focus before, focus will be
// passed to the item which last had focus (see +link{dynamicForm.getFocusItem()}) - 
// otherwise focus will be passed to the first focusable item in the form.
// <P>
// To put focus in a specific item, use +link{dynamicForm.focusInItem()} instead.
// @group   focus
// @visibility external
//<


//>	@method dynamicForm.focusInItem()
// Move the keyboard focus into a particular item.
// @group eventHandling, focus
// @param	itemName 	(number | ItemName | FormItem)	Item (or reference to) item to focus in.
// @visibility external
//<
focusInItem : function (itemName, itemIcon) {
    // normalize the item in case it's a number or a string
    if (itemName != null) {
        var item = this.getItem(itemName);
    } else {
        var item = this.getFocusSubItem();
    }
    // if nothing was found to focus in, bail!
    if (!item) {
        if (itemName != null) this.logWarn("couldn't find focus item: " + itemName);
        return;
    }

    // if the item can accept focus
    if (item._canFocus()) {
        // focus in it
        if (!itemIcon) item.focusInItem();
        if (itemIcon && item.focusInIcon) item.focusInIcon(itemIcon);
        if (this._setValuesPending) {
            var theForm = this;
		    isc.Page.setEvent("idle", 
                              function () { if (!theForm.destroyed) theForm.focusInItem(); },
                              isc.Page.FIRE_ONCE);
        }
    } else {
        // otherwise complain
        this.logWarn("focusInItem: item cannot accept focus: " + item);
    }
},

// removes the form instance's knowledge of the currently focused element, but does not actually
// blur the element
clearFocusItem : function () {
	delete this._focusItem;
    delete this._focusItemIcon;
    if (this.hasStableLocalID()) this.provideRuleContext(this.getLocalId() + ".focusField", null, this);
},


//>	@method	dynamicForm.blurFocusItem()	(A)
//  Fires the blurItem() command on the focused item
//  @group eventHandling, focus
//<

blurFocusItem : function (exitCheck) {
    var focusItem = this.getFocusSubItem();
    if (focusItem != null) {
        this._blurItem(focusItem);
        // clear out the remembered focus item - this is an explicit blur, so we don't want
        // focus to go to that item.
        this.clearFocusItem();
        // if requested, check for a pending checkForEditorExit(), and run if appropriate
        if (exitCheck && isc.FormItem._pendingEditorExitCheck == focusItem) {
            isc.FormItem._pendingEditorExitCheck.checkForEditorExit(true, true);
        }
    }
},

// Internal '_blurItem' method fires the blur method on the item passed in, if it has focus.
// This does not update this._focusItem, so can be used to blur the form entirely without
// losing track of which item has focus
_blurItem : function (item) {
    if (item != null && item.hasFocus) item.blurItem();
},

// _blurFocusItemWithoutHandler
// Internal method to blur the focus item, without triggering its blur handler.
// Will not clear out this._focusItem.

_blurFocusItemWithoutHandler : function () {
      
    var focusItem = this.getFocusSubItem();
    if (focusItem != null && focusItem.hasFocus) {
        this._suppressBlurHandlerForItem(focusItem);
        this._blurItem(focusItem); 
        
    } else {
        this.logDebug("blur w/o handler: no item to blur");
    }
},

//_focusInItemWithoutHandler
// Internal method to focus in a form item without firing it's focus handler
_focusInItemWithoutHandler : function (item) {
    // If the item is non-focusable, no-op
    if (!item || !this._canFocusInItem(item)) {
        var parentItem;
        if (item && item.parentItem) {
            this._focusInItemWithoutHandler(item.parentItem);
            parentItem = true;
        }
        this.logInfo("_focusInItemWithoutHandler(" + item + 
                     "): not calling focus as item not focusable or item already has focus" + 
                     (parentItem ? ". Putting focus into containerItem instead." : ""),
                     "nativeFocus")
        return;
    }
    
    // If the item already has focus, no op
    // Note: In IE hasFocus is not a reliable check - it only gets updated on the asynchronous
    // onfocus handler - look directly at the document.activeElement to see where focus 
    // currently is instead.
    
    var hasFocus = item.hasFocus;
    if (isc.Browser.isIE && !isc.EH.synchronousFocusNotifications) {
        var focusItemInfo = isc.DynamicForm._getItemInfoFromElement(document.activeElement);
        hasFocus = (focusItemInfo && focusItemInfo.item == item);
    }
    if (hasFocus) return;
    
    this._suppressFocusHandlerForItem(item);
   
    this.focusInItem(item);
},

// _suppressFocusHandlerForItem()
// Sets a flag to avoid firing focus handlers when an item receives focus. This, together with
// _blurFocusItemWithoutHandler() allows us to silently blur and refocus in an item (EG on redraw)
// Note that this method should ALWAYS be followed by a call to focus in the item in question.
_suppressFocusHandlerForItem : function (item) {
    
    if (this.__suppressFocusHandler == null) this.__suppressFocusHandler = 0;
    else this.__suppressFocusHandler += 1;
    this.__suppressFocusItem = item;
},

// See _suppressFocusHandlerForItem for related details
_suppressBlurHandlerForItem : function (item) {
    if (this.__suppressBlurHandler == null) this.__suppressBlurHandler = 0;
    else this.__suppressBlurHandler += 1;
},


setOpacity : function (newOpacity, animating, forceFilter, a,b,c) {
    var oldOp = this.opacity;
    this.invokeSuper(isc.DynamicForm, "setOpacity", newOpacity, animating, forceFilter, a,b,c);
    
    newOpacity = this.opacity;        
    if (isc.Browser.isMoz && this.hasFocus &&
        (newOpacity != oldOp) && 
        (newOpacity == null || newOpacity == 100 || oldOp == null || oldOp == 100) ) 
    {
        var item = this.getFocusSubItem();
        if (item && item._willHandleInput()) {
            this._blurFocusItemWithoutHandler();
            this._focusInItemWithoutHandler(item);
        }
    }
},

// clearingElement
// When a form item is cleared or redrawn, its element will be removed from the DOM
// this is a notification for this.

clearingElement : function (item) {
    
    
    if (this.__suppressFocusHandler != null && this.__suppressFocusItem == item) {
        delete this.__suppressFocusHandler;
        delete this.__suppressFocusItem;
    }
    if (this.__suppressBlurHandler != null && (this.getFocusSubItem() == item)) {
        delete this.__suppressBlurHandler;
    }
},

hide : function () {
    
    if (isc.Browser.isMoz) this._blurItem(this.getFocusSubItem());
    this.Super("hide", arguments);
},

// Override setVisibility to ensure that 'visibilityChanged' notifications are fired on the
// items in this form.
setVisibility : function (newVisibility,a,b,c) {
    this.invokeSuper(isc.DynamicForm, "setVisibility", newVisibility,a,b,c);
    this.itemsVisibilityChanged();
    // If we are shown and we are auto-focus true, focus now
    if (this.isVisible() && this.isDrawn() && this.autoFocus) this.focus();
},


_updateHandleDisplay : function (a, b, c) {
    var result = this.invokeSuper(isc.DynamicForm, "_updateHandleDisplay", a, b, c);
    if (result) this._placeCanvasItems();
    return result;
},

// override 'clear' to notify the form items that they have been hidden.

clear : function () {

    if (this._verifyingFileAccess) {
        this.logWarn("clear(): This form was cleared during an asynchronous operation to upload file. " + 
            "Upload will be aborted. Synchronous file upload can be enabled by setting " + 
            "'checkFileAccessOnSubmit' to false, but note that this disables logic to verify that " + 
            " the uploaded file can be accessed by the browser.");
        this._abortNativeSubmit = true;
        this._cleanUpFailedRPCTransaction();
    }


    if (!this.destroying) {
        // Remove item *When rules from rulesEngine
        // Do this before calling Super() because form will be removed from ruleContext
        // before returning.
        this._removeItemWhenRules();
    }

    this.Super("clear", arguments);

    this.itemsVisibilityChanged()
    this._itemsCleared();
},

// If focus is taken from the form as a whole, ensure the focusItem's HTML element is blurred
_focusChanged : function (hasFocus) {
    this.Super("_focusChanged", arguments);
    
    if (!this.hasFocus) this._blurItem(this.getFocusSubItem());

    // If losing focus, update ruleContext. Gaining focus will trigger a 
    // a formItem focus to update ruleContext.
    if (this.hasStableLocalID() && !hasFocus) {
        if (this.destroying || this.destroyed) {
            this.logInfo("Attempt to provide RuleContext from focus-change during destruction...");
            return;
        }
        this.provideRuleContext(this.getLocalId() + ".focusField", null, this);
    }
},


parentVisibilityChanged : function (newVisibility) {
    //this.logWarn("parentVisibilityChanged, visible: " + this.isVisible());
    if (!this.isVisible() && isc.Browser.isMoz) this._blurItem(this.getFocusSubItem());
    this.Super("parentVisibilityChanged", arguments);
    this.itemsVisibilityChanged();
    
    // If we are shown due to a parent being shown, and we are auto-focus true, focus now.
    if (this.isVisible() && this.autoFocus) this.focus();
},

// Ensure we allow native text selection within form items.
_allowNativeTextSelection : function (event) {
    
    if (event == null) event = isc.EH.lastEvent;
    var itemInfo = this._getEventTargetItemInfo(event);
    
    // For now always allow text selection of form items' cells.
    if (itemInfo.item) {
        var rv = itemInfo.item._allowNativeTextSelection(event, itemInfo);
        if (rv != null) return rv;
    }
    return this.Super("_allowNativeTextSelection", arguments);
},

_allowNativeDrag : function (event) {
    
    if (event == null) event = isc.EH.lastEvent;
    var itemInfo = this._getEventTargetItemInfo(event);
    
    // For now always allow text selection of form items' cells.
    if (itemInfo.item) {
        var rv = itemInfo.item._allowNativeDrag(event, itemInfo);
        if (rv != null) return rv;
    }
    return this.Super("_allowNativeDrag", arguments);
},

// Override prepareForDragging
// If the developer is dragging from inside one of our formItems, just disallow it
// This would be really odd UI - if a user drags across a text based item, you'd expect a 
// selection to occur, taking precedence over this.canDragReposition.
prepareForDragging : function (a,b,c,d) {
    var EH = this.ns.EH;
    // this would indicate that a child has set itself as the dragTarget, and then
    // prepareForDragging bubbled to this Canvas.  By default, we leave this alone.  
    if (EH.dragTarget) return;
    
    // If the event occurred over the text box / element / control-table of one of our items, 
    // return false - We don't want to allow dragging of the form as a whole from within an
    // item - instead we'll support drag selection of the item. We also don't want to allow 
    // 'prepareForDragging' to bubble up and allow dragging of a parent.
    var event = EH.lastEvent,
        itemInfo = this._getEventTargetItemInfo(event);
    if (itemInfo.item && 
        (itemInfo.overElement || itemInfo.overTextBox || itemInfo.overControlTable)) return false;
    
    return this.invokeSuper(isc.DynamicForm, "prepareForDragging", a,b,c,d);
}, 


// -------------------------------------------------------------------------------------------
// Event handling
// For events that get passed to form items, we will fire the event on the item where it 
// occurred, then bubble it up through any parent items. For standard mouse and key events, we 
// then allow the event to be fired on the DynamicForm, and bubbled up through the widget
// parent chain.

// -------------------------------------------------------------------------------------------



// Given an event, determine whether it occurred over one of our items.
// Note: we return an object of the following format:   {item:item, overTitle:boolean}   
// - if the event occurred over the item's title rather than the item itself, overTitle will 
// be true.
_getEventTargetItemInfo : function (event) {

    if (!event) event = isc.EH.lastEvent;

    
    
    var target = isc.EH.isMouseEvent(event.eventType) ? event.nativeTarget 
                                                      : event.nativeKeyTarget;
    var info = isc.DynamicForm._getItemInfoFromElement(target, this);
    // Copy the item info onto the event object itself so handlers can check what part of the
    // item the event occurred over directly; set the current DOMevent to allow caching
    event.itemInfo          = info;
    event._itemInfoDOMevent = event.DOMevent;

    return info;
},

//> @method dynamicForm.getEventItem () 
// If the current mouse event occurred over an item in this dynamicForm, returns that item.
// @return (FormItem) the current event target item
// @visibility external
//<
getEventItem : function () {
    var info = isc.EH.lastEvent.itemInfo;
    // skip events over titles or over "inactive" elements (EG placeholders in 
    // alwaysShowEditors grids...)
    if (info != null && !info.inactiveContext && !info.overTitle) return info.item;
    return null;
},

//> @object FormItemEventInfo
// An object containing details for mouse events occurring over a FormItem.
// @treeLocation Client Reference/Forms/DynamicForm
// @visibility external
//<

//>@attr formItemEventInfo.item (FormItem : null : R)
// Item over which the event occurred.
// @visibility external
//<

//>@attr formItemEventInfo.overTextBox (Boolean : null : R)
// True if the event occurred within the item's +link{formItem.textBoxStyle, textBox}.
// @visibility external
//<

//>@attr formItemEventInfo.overElement (Boolean : null : R)
// True if the event occurred over the item's data or input element.  Note that it can be bad 
// practice to implement custom context menus when overElement is true, since this will
// replace browser-default menus that users might expect.
// @visibility external
//<

//>@attr formItemEventInfo.overItem (Boolean : null : R)
// True if the event occurred over the main body of the item (for example the text-box), rather
// than over the title or within the form item's cell in the DynamicForm but outside the
// text box area.
// @visibility external
//<

//>@attr formItemEventInfo.overTitle (Boolean : null : R)
// True if the event occurred over the item's title.
// @visibility external
//<

//>@attr formItemEventInfo.overInlineError (Boolean : null : R)
// True if the event occurred over the form's 
// +link{dynamicForm.errorItemProperties, single error item}.
// @visibility external
//<

//>@attr formItemEventInfo.icon (String : null : IR)
// If this event occurred over a formItemIcon this attribute contains the 
// +link{formItemIcon.name} for the icon.
// 
// @visibility external
//<

//> @method dynamicForm.getEventItemInfo () 
// If the current mouse event occurred over an item, or the title of an item in this
// dynamicForm, return details about where the event occurred.
// @return (FormItemEventInfo) the current event target item details
// @visibility external
//<
getEventItemInfo : function () {
    var itemInfo = this._getEventTargetItemInfo();
    if (itemInfo == null || itemInfo.inactiveContext) return null;
    return {
        item:itemInfo.item,
        // simplify details of which part of the form item received the event
        // since the difference between (EG) textBox and element is implementation dependent
        // only
        overElement: itemInfo.overElement,
        overtextBox: itemInfo.overTextBox,
        overItem: (itemInfo.overElement || itemInfo.overTextBox || itemInfo.overControlTable),
        overTitle: itemInfo.overTitle,
        overInlineError: itemInfo.overInlineError,
        icon: itemInfo.overIcon
    }
},

// Have handleMouseStillDown send a 'mouseStillDown' event to items, if they have a handler
// for it.

handleMouseStillDown : function (event, eventInfo) {
    if (isc._traceMarkers) arguments.__this = this;

    var targetInfo = this._getEventTargetItemInfo(event),
        item = ((targetInfo.overTitle || targetInfo.inactiveContext) ? null : targetInfo.item);
        
    // avoid double delivery of events if there are nested DynamicForm elements all receiving
    // this event via bubbling - only deliver to item if it's one of ours
    if (item != null) {
        if (item.form != this) return;

        if (item.mouseStillDown) {
            if (item.handleMouseStillDown(event) == false) return false;
        }
    }
    
},
// also send 'mouseDown' to items

handleMouseDown : function (event, eventInfo) {
    var targetInfo = this._getEventTargetItemInfo(event),
        item = (targetInfo.overTitle ? null : targetInfo.item);

    // store off the mouseDownTarget so we can cancel handleClick if the mouseUpTarget is different
    this._mouseDownTarget = targetInfo;

    if (item != null) {
        // avoid double delivery of events if there are nested DynamicForm elements all receiving
        // this event via bubbling - only deliver to item if it's one of ours
        if (item.form != this) return;

        item.handleMouseDown(event);

        if (targetInfo.overControlTable || targetInfo.overPickerIconCell) {
            
            return false;
        }

        
        if (isc.Browser.isSafari && !targetInfo.inactiveContext && targetInfo.overElement
            && isc.isA.CheckboxItem(item))
        {    
            item.focusInItem();
        }
    }        
},

// Form item mouse event APIs:
// - FormItem.mouseOver(), mouseMove(), mouseOut() 
//      Not currently exposed
// - FormItem.titleOver(), titleMove(), titleOut()
//      Not currently exposed - fired if the event occurred over the  title rather than item.
// - FormItem.itemHover(), titleHover() 
//      fired after a delay - return false to cancel showing any Hover canvas for the item
// - FormItem.itemHoverHTML() / titleHoverHTML() 
//      not implemented by default - returns the HTML to show in the Hover canvas for this 
//      item (null will suppress hover canvas). Takes precedence over the equivalent form-level
//      item/titleHoverHTML() methods.
// - Form.itemHoverHTML(item) / titleHoverHTML(item) 
//      returns the HTML to show for the Hover canvas for some item.  Default implementation
//      for both methods returns the 'prompt' for the Item.

 
// _itemMouseEvent - fired in response to mouseMove, mouseOver or mouseOut.
// Fires appropriate handlers on the item.    
_itemMouseEvent : function (itemInfo, eventType) {

    var lastMoveItem = this._lastMoveItem,
        wasOverTitle = this._overItemTitle,
        lastOverIcon = this._lastOverIconID,
        
        item = itemInfo.item,
        overTitle = itemInfo.overTitle,
        overIcon = itemInfo.overIcon
    ;

    // Don't fire mouse events on disabled items - set item to null so we fire mouseOut on
    // the previous item
    
    
    
    // If the event occurred over some 'inactiveEditorHTML' don't fire mouse-move based events
    // at all
    if (itemInfo.inactiveContext != null) {
        item = null;
        overTitle = null;
        overIcon = null;
    }
    
    // Don't attempt to fire events on items that have been destroyed
    
    if (lastMoveItem && lastMoveItem.destroyed) {
        lastMoveItem = null;
        this._lastMoveItem = null;
        this._lastOverIconID = null;
        this._overItemTitle = null;
    }
    if (item && item.destroyed) {
        item = null;
        overTitle = null;
        overIcon = null;
    }

    // Remember the information for the next mouse event
    this._lastMoveItem = item;
    this._overItemTitle = overTitle;
    this._lastOverIconID = overIcon;

    
    if (eventType == isc.EH.MOUSE_OVER) {
        if (item) {
            if (overTitle) item.handleTitleOver();
            else {
                
                if (overIcon) this._lastOverIconID = null;
                
//                if (this.editMode) this.showRolloverControls(item);
                item.handleMouseOver();
            }
        }
    } else if (eventType == isc.EH.MOUSE_OUT) {
        if (lastMoveItem) {
            if (wasOverTitle) lastMoveItem.handleTitleOut();
            else {
                if (lastOverIcon) lastMoveItem._iconMouseOut(lastOverIcon);
//                if (this.editMode) this.hideRolloverControls(item);
                lastMoveItem.handleMouseOut();
            }
        }

    // Mouse-Move case is more complex, as the user may have moved within an item, or be moving
    // between items, etc.
    } else {
        var changedItem = (lastMoveItem != item || wasOverTitle != overTitle)

        // In this case the user has switched items.  
        // We catch:    - moving between two items' cells (or title cells)
        //              - moving over a new item or title cell
        //              - moving out of an item or title cell
        //              - moving from an item's cell to title (or vice versa)
        if (changedItem) {
            if (lastMoveItem) {
                if (wasOverTitle) lastMoveItem.handleTitleOut();
                else {
                    if (lastOverIcon) lastMoveItem._iconMouseOut(lastOverIcon);
                    lastMoveItem.handleMouseOut();
                }
            }
            if (item) {
                if (overTitle) item.handleTitleOver();
                else {
                    if (overIcon) item._iconMouseOver(overIcon);

                    // If the mouse is over an icon, then _iconMouseOver() was just called. If
                    // _lastPromptIcon was set by _iconMouseOver(), then Hover.setAction() was
                    // called to fire _handleIconHover() on a delay. We don't want to now call
                    // handleMouseOver() because that will reset the Hover action to call
                    // _handleHover() on a delay, thus canceling the icon's prompt.
                    // Note that the error icon is handled specially via _handleErrorIconMouseOver()
                    // and this does not set the _lastPromptIcon because there isn't a FormItemIcon
                    // object for the error icon.
                    
                    if (!overIcon || (item._lastPromptIcon == null && overIcon != item.errorIconName)) {
                        item.handleMouseOver();
                    }
                }
            }

        // In this case we know the user has moved within an item's cell, title cell, or textBox.
        } else if (item) {
            
//            this.logWarn("overTitle:" + overTitle + ", overIcon: "+ overIcon);
            if (overTitle) item.handleTitleMove();
            else {
                // we may have moved between icons within the item's cell.
                if (lastOverIcon != overIcon) {
                    if (lastOverIcon) item._iconMouseOut(lastOverIcon);
                    if (overIcon) item._iconMouseOver(overIcon);
                } else if (item) {
                    if (overIcon) item._iconMouseMove(overIcon);
                    item.handleMouseMove();
                }
            }
        }
    }
},

// Override 'handleMouseOver' / 'Out' / 'Move' to fire mouseOver / titleOver et al on 
// form items.
handleMouseOver : function (event, eventInfo) {
    if (this.mouseOver && this.mouseOver(event, eventInfo) == false) return false;
    this._itemMouseEvent(this._getEventTargetItemInfo(event), isc.EH.MOUSE_OVER);
},

handleMouseMove : function (event, eventInfo) {
    // allow a form-level mouseMove handler to completely suppress item level handling.
    if (this.mouseMove && this.mouseMove(event,eventInfo) == false) return false;
    this._itemMouseEvent(this._getEventTargetItemInfo(event), isc.EH.MOUSE_MOVE);
},

handleMouseOut : function (event, eventInfo) {
    
    // Explicitly clear event.itemInfo so we don't have stale "overIcon" etc attributes
    event.itemInfo = {};

    // We know if it's a mouseOut that there's no new item!
    
    this._itemMouseEvent({}, isc.EH.MOUSE_OUT);

    // If there's a form level mouseout handler, ensure we also fire it (and prevent bubbling
    // if appropriate)
    if (this.mouseOut && this.mouseOut(event,eventInfo) == false) return false;
},

// override handleMouseWheel() to stop bubbling if the user is scrolling a textAreaItem

handleMouseWheel : function (event, eventInfo) {
    var itemInfo = this._getEventTargetItemInfo(event),
        item = itemInfo.item;
    if (item && item._stopBubblingMouseWheelEvent(event, eventInfo)) return isc.EH.STOP_BUBBLING;
    return this.Super("handleMouseWheel", arguments);
},

//>	@method	dynamicForm.bubbleItemHandler()
//		Bubble an event up the nested item hierarchy for a particular item.
//		@group	event handling
//		@param	itemID			(number)			Global identifier for the item on which call the handler.
//		@param	handlerName		(String)			Name of the handler to call.
//		@param	[arg1]			(Any)				Optional argument to the call.
//		@param	[arg2]			(Any)				Optional argument to the call.
//		@param	[arg3]			(Any)				Optional argument to the call.
//		@param	[arg4]			(Any)				Optional argument to the call.
//<
bubbleItemHandler : function (itemID, handlerName, arg1, arg2, arg3, arg4) {
    
    var subItem = this.getItemById(itemID),
        result = null;

	for (; subItem != null; subItem = subItem.parentItem) {
	    // if we don't directly hold this form item, don't attempt to send events to it
	    
	    if (subItem.form != this) continue;
		if (subItem[handlerName] != null && !isc.isA.Function(subItem[handlerName])) {
			isc.Func.replaceWithMethod(subItem, handlerName, "arg1,arg2,arg3,arg4");
		}
        
        if (subItem[handlerName] == null) {
            this.logWarn("handler:"+ handlerName + " is not present on itemID " + itemID);
            return false;
        }
		result = subItem[handlerName](arg1, arg2, arg3, arg4);
		
		// if result is false, bail from the handler!
		if (result == false) return result;
	}
	
	return result;
},

// helper for bubbling inactiveEditorEvents
// the item will handle actually firing the appropriate named event if it exists
bubbleInactiveEditorEvent : function (item, eventName, itemInfo) {
    return this.bubbleItemHandler(item, "_handleInactiveEditorEvent", 
                                    eventName, itemInfo.inactiveContext, itemInfo);
},
  
//>	@method	dynamicForm.elementChanged()
// Handle a change event from an element.
// <p>
// May cause the form to redraw if the item (or sub-item) has redrawOnChange turned on
//
//		@group	event handling
// 
//		@param	itemID			(ItemID)	Reference to the (possibly nested) item that has changed.
//		@return	(boolean)			true == event should proceed normally, false == halt event
//<
elementChanged : function (itemID) {
	// bubble the elementChanged handler up through the item(s) specified.
	var result = this.bubbleItemHandler(itemID, "elementChanged", itemID);
    return (result != false);
},


// Override handleClick to fire click events on the item clicked.
handleClick : function (event, eventInfo) {
    var itemInfo =  this._getEventTargetItemInfo(event);

    var returnVal;
    if (itemInfo && itemInfo.item) {
        var item = itemInfo.item;
        // If the mouse went down over a *different* item, don't fire click on this
        // item.
        
        var mouseDownInfo = this._mouseDownTarget || {},
            mouseDownItem = this._mouseDownTarget ? this._mouseDownTarget.item : null;
        if (mouseDownItem == itemInfo.item) {
            returnVal = this.handleItemClick(itemInfo, mouseDownInfo);
            // remember the "clickTarget" - we'll check this in double-click
            this._clickTarget = this._mouseDownTarget;
        }
    }
    delete this._mouseDownTarget;
    if (returnVal == false || returnVal == isc.EH.STOP_BUBBLING) return returnVal;
    return this.Super("handleClick", arguments);
},

handleItemClick : function (itemInfo, mouseDownInfo) {
    var returnVal;
    
    var item = itemInfo.item;
    
    if (itemInfo.inactiveContext) {
        this.logInfo("Bubbling inactive editor event for " + item.ID, "EventHandler");
        returnVal = this.bubbleInactiveEditorEvent("click", item, itemInfo);
    } else {
        if (this._mouseDownTarget.overTitle && itemInfo.overTitle) {
            this.logInfo("Bubbling handleTitleClick event for " + item.ID, "EventHandler");
            returnVal = this.bubbleItemHandler(item, "handleTitleClick", item);
        } else {
        
            // If we're over the item itself (essentially the element / text box, or picker),
            // fire click      
            // SpacerItem is a special case...
            var isSpacer = item.isA("SpacerItem"),
                overItem = isSpacer || (itemInfo.overElement || itemInfo.overTextBox || itemInfo.overControlTable),
                wasOverItem = isSpacer || (mouseDownInfo.overElement || mouseDownInfo.overTextBox || mouseDownInfo.overControlTable)
            
            
            
            if (mouseDownInfo.overIcon && itemInfo.overIcon && (item.form == this)) {
                if (item._iconClick(itemInfo.overIcon) == false) 
                    return false;
                // The picker is written into the main body of the item - other icons are not,
                // so don't fire the standard click handler for them.
                var icon = item.getIcon(itemInfo.overIcon);
                if (icon && icon.writeIntoItem) {
                    overItem = true;
                    wasOverItem = true;
                }
            }
                   
            if (mouseDownInfo.overValueIcon && itemInfo.overValueIcon && (item.form == this)) {
                if (item.valueIconClick != null) {
                    if (item.valueIconClick(this, item, item.getValue()) === false) {
                        return false;
                    }
                }
            }
            
            if (overItem && wasOverItem) {
                this.logInfo("Bubbling handleClick event for " + item.ID, "EventHandler");
                if (this.bubbleItemHandler(item, "handleClick", item) == false) {
                    returnVal = false;
                }
            }
            
            if (returnVal != false) {
                // fire cellClick (in addition to click where appropriate unless handleClick() returned
                // false).
                this.logInfo("Bubbling handleCellClick event for " + item.ID, "EventHandler");
                returnVal = this.bubbleItemHandler(item, "handleCellClick", item);
            }
        }
    }
    return returnVal;
},

// Override handleDoubleClick to fire doubleclick events on the item clicked.
handleDoubleClick : function (event, eventInfo) {
    var itemInfo =  this._getEventTargetItemInfo(event),
        mouseDownInfo = this._mouseDownTarget,
        clickInfo = this._clickTarget;
    var returnVal;
    if (itemInfo && itemInfo.item && 
        mouseDownInfo && (mouseDownInfo.item == itemInfo.item))
    {
        if (clickInfo && (clickInfo.item == itemInfo.item)) {
            var item = itemInfo.item;
            if (itemInfo.inactiveContext) {
                returnVal = this.bubbleInactiveEditorEvent(item, "doubleClick", itemInfo);
            } else if (itemInfo.overTitle && mouseDownInfo.overTitle) { 
                returnVal = this.bubbleItemHandler(item, "handleTitleDoubleClick", item);
            } else {  

                // If we're over the item itself (essentially the element / text box, or picker),
                // fire click      
                var overItem = (itemInfo.overElement || itemInfo.overTextBox
                                 || itemInfo.overControlTable),
                    wasOverItem = (mouseDownInfo.overElement || mouseDownInfo.overTextBox
                                 || mouseDownInfo.overControlTable)

                
                if (itemInfo.overIcon && mouseDownInfo.overIcon) {
                    if (item._iconClick(itemInfo.overIcon) == false) return false;
                    // The picker is written into the main body of the item - other icons are not,
                    // so don't fire the standard click handler for them.
                    var icon = item.getIcon(itemInfo.overIcon);
                    if (icon && icon.writeIntoItem) {
                        overItem = true;
                        wasOverItem = true;
                    }
                }

                if (overItem && wasOverItem) {
                    if (this.bubbleItemHandler(item, "handleDoubleClick", item) == false) {
                        returnVal = false;
                    }
                }
                if (returnVal != false) {
                    // fire cellClick (in addition to click where appropriate unless handleClick() returned
                    // false).
                    returnVal = this.bubbleItemHandler(item, "handleCellDoubleClick", item);
                }
            }
        } else {
            // If the user double clicked with the first click landing in a different
            // item, fire a click on the second item here.
            returnVal = this.handleItemClick(itemInfo, mouseDownInfo || {});
        }
    }
    delete this._mouseDownTarget;
    delete this._clickTarget;

    if (returnVal == false || returnVal == isc.EH.STOP_BUBBLING) return returnVal;
    return this.Super("handleDoubleClick", arguments);
},

handleShowContextMenu : function (event, eventInfo) {
    var itemInfo =  this._getEventTargetItemInfo(event);

    var returnVal;
    if (itemInfo != null && itemInfo.item != null) {
        
        if (itemInfo.overIcon && isc.Browser.isTouch) returnVal = false;
        else {
            var item = itemInfo.item;
            if (item) {
                // fire the stringMethods, first on the item, then on the form, unless the item
                // cancels by returning false
                if (item.handleShowContextMenu) {
                    returnVal = item.handleShowContextMenu();
                }
                if (returnVal != false && this.showItemContextMenu) {
                    returnVal = this.showItemContextMenu(item);
                }
            }
        }
    }
    if (returnVal == false || returnVal == isc.EH.STOP_BUBBLING) return returnVal;
    return this.Super("handleShowContextMenu", arguments);
},

// Override handleFocusIn() and handleFocusOut() to fire item-level focus/blur notifications
handleFocusIn : function (element, event) {

    var focusedInItem = false;
    if (isc.EH.synchronousFocusNotifications && element != null) {
        var itemInfo = isc.DynamicForm._getItemInfoFromElement(element, this);
        var item = itemInfo ? itemInfo.item : null;
        if (item && !item.disabled) {
            // focusIn occurred on the focus handler - fire standard item focus handling
            
            if (element == item.getFocusElement()) {
                isc.FormItem.__nativeFocusHandler(element);
                focusedInItem = true;
            // If focus was given to an icon, we also need to fire item level 
            // notifications for icon focus
            
            } else if (itemInfo.overIcon != null) {
                item._iconFocus(itemInfo.overIcon, element)
                focusedInItem = true;
            }
        }
    }
    if (!focusedInItem) {
        
        this.logDebug("DynamicForm.handleFocusIn(): Received focusin notification for element:" +
                element + ". This doesn't appear to be a focus target for an item, so simply " +
                "recording the event as a widget-level focus on the form itself.", "nativeFocusIn");

        return this.Super("handleFocusIn", arguments);
    }
},

handleFocusOut : function (element, event) {
    
    var blurredItem = false;
    if (isc.EH.synchronousFocusNotifications && element != null) {

        var itemInfo = isc.DynamicForm._getItemInfoFromElement(element, this),
            item = itemInfo ? itemInfo.item : null;
        
        if (item) {
                    
            if (element == item.getFocusElement()) {
                isc.FormItem.__nativeBlurHandler(element);
                blurredItem = true;
                
            } else if (itemInfo.overIcon != null) {
                item._iconBlur(itemInfo.overIcon, element)
                blurredItem = true;
            }
        }
    }
    if (!blurredItem) {
        this.logDebug("DynamicForm.handleFocusOut(): Received focusout notification for element:" +
                element + ". This doesn't appear to be a focus target for an item, so simply " +
                "recording the event as a widget-level blur on the form itself.", "nativeFocusIn");

        return this.Super("handleFocusOut", arguments);    
    }
},

//>	@method	dynamicForm.elementFocus()	(A)
// Event fired when the keyboard focus goes to a particular item
// <P>
// Fired from the native focus event on form items.<br>
// This method fires the formItem.elementFocus handler, which will also fire any developer-
// specified focus handler on the appropriate item(s).
//
//		@group eventHandling, focus
//
//		@param	itemID     (ItemID)	item that been focused.
//		@return	(boolean)  true == event should proceed normally, false == halt event
//<
elementFocus : function (element, itemID) {
    var item = this.getItemById(itemID);

    // Set the ISC focus element to this
    
    if (!this.hasFocus) {
        isc.EventHandler.focusInCanvas(this,null,item);
    }

    var focusItemInfo = isc.DynamicForm._getItemInfoFromElement(element, this);
    var itemIcon = focusItemInfo.overIcon;
    
	// call setFocusItem on the inner-most item that was focused
    
	this.setFocusItem(item, itemIcon);
    
	// bubble the "elementFocus" event up through the event handler(s) for the element
	var result = true,
        suppressHandler = false;
    
    if (this.__suppressFocusHandler != null) {
        // Catch the case where we get an onfocus handler from a different item to the one
        // on which we are suppressing elementFocus() - this can happen if when focus w/o 
        // handler was fired the item already had focus, so its onfocus handler never fired.
        if (this.__suppressFocusItem != item) {
            
            delete this.__suppressFocusHandler;
            delete this.__suppressFocusItem;                        
        } else {
            suppressHandler = true;
            this.__suppressFocusHandler -=1;
            if (this.__suppressFocusHandler < 0) {
                delete this.__suppressFocusHandler;
                delete this.__suppressFocusItem;
            }
        }
    }
    
    result = this.bubbleItemHandler(itemID, "elementFocus", suppressHandler);

    return (result != false);
},

//>	@method	dynamicForm.elementBlur()	(A)
// Event fired when the keyboard blurs from a particular item
// <P>
// If the item has a "blur" handler, this will be fired automatically
//
// @group eventHandling, focus
//
//		@param	itemID    (ItemID)  item that has blurred
//		@return	(boolean)           true == event should proceed normally, false == halt event
//<
elementBlur : function (element, itemID)  {
    if (!isc.isA.FormItem(this.getItemById(itemID))) return;
    
	// bubble the "elementBlur" event up through the event handler(s) for the element
    
	var result = true;
    if (this.__suppressBlurHandler == null) result = this.bubbleItemHandler(itemID, "elementBlur");
    else {
        this.__suppressBlurHandler -=1;
        if (this.__suppressBlurHandler < 0) delete this.__suppressBlurHandler;
    }

	// clear any prompt shown from the item
	this.clearPrompt();

	
	
	return (result != false);
},



_shouldSaveOnEnter:function () {
    return this.saveOnEnter;
},

_$Enter:"Enter",
_$Backspace:"Backspace",
handleKeyPress : function (event, eventInfo) {
    var EH = this.ns.EH,
        keyName = EH.getKey(event);

    // Special case for Enter keypress: If this.saveOnEnter is true, and the enter keypress
    // occurred in a text item, auto-submit the form
    if (keyName === this._$Enter) {
        if (this._shouldSaveOnEnter()) {
            var item = this.getFocusSubItem();
            // Note that this.submit() will call this.saveData() unless this.canSubmit is true
            if (item && item.shouldSaveOnEnter()) {
                // if the item should update it's parent, do that now - needed for items with
                // a child textItem, like Date/Time/DateTime items
                if (item._shouldUpdateParentItem && item.parentItem) item.parentItem.updateValue();
                this.submit();
            }
            // we always return STOP_BUBBLING on enter keypress (handled below) which is
            // appropriate.
        }
    }

    var revertValueKey = this.revertValueKey,
        focusSubItem = this.getFocusSubItem();
    if (focusSubItem != null &&
        revertValueKey != null &&
        EH._matchesKeyIdentifier(revertValueKey, event))
    {
        var item = focusSubItem;
        while (item.parentItem != null) item = item.parentItem;
        
        item.storeValue(item._getOldValue(), true);

        // Also clear any hover in case the old value hover is showing.
        isc.Hover.clear();
    }

    
    if (keyName === this._$Backspace &&
        !isc.DynamicForm.canEditField(focusSubItem, this))
    {
        return false;
    }

    return this.Super("handleKeyPress", arguments);
},

// handleItemKeyPress: Called directly from the formItem keypress handler. Fires the
// 'itemKeypress' notification.
// Note that formItems swallow keypress events for a lot of keys, meaning we won't necessarily
// see a standard canvas "handleKeyPress" even if this method fires
handleItemKeyPress : function (item, keyName, characterValue) {
    if (this.itemKeyPress != null) {
        return this.itemKeyPress(item , keyName , characterValue);
    }
},
 
// Item Hover HTML
// --------------------------------------------------------------------------------------------

//>@method  dynamicForm.itemHoverHTML()     (A)
//  Retrieves the HTML to display in a hover canvas when the user holds the mouse pointer over
//  some item.  Return null to suppress the hover canvas altogether.<br>
//  Default implementation returns the prompt for the item if defined.<br>
//  Can be overridden via <code>item.itemHoverHTML()</code>
//
//  @group Hovers
//  @see FormItem.prompt
//  @see FormItem.itemHoverHTML()
//  @param item (FormItem)  Item the user is hovering over.
//  @visibility external
//<
itemHoverHTML : isc.DynamicForm._defaultItemHoverHTMLImpl,

//>@method  dynamicForm.titleHoverHTML()     (A)
//  Retrieves the HTML to display in a hover canvas when the user holds the mouse pointer over
//  some item's title.  Return null to suppress the hover canvas altogether.<br>
//  Default implementation returns the prompt for the item if defined.  If no prompt is defined
//  and the item title is clipped, the item title will be shown in a hover by default.<br>
//  Can be overridden by +link{FormItem.titleHoverHTML()}.
//
//  @group Hovers
//  @see FormItem.prompt
//  @see FormItem.titleHoverHTML()
//  @param item (FormItem)  Item the user is hovering over.
//  @return (HTMLString) HTML to be displayed in the hover
//  @visibility external
//<
titleHoverHTML : function (item) {
    if (item.prompt) return item.prompt;
    if (item.showClippedTitleOnHover && this.shouldClipTitle(item) && 
        this.titleClipped(item))
    {
        return item.getTitle();
    }
},

//>@method  dynamicForm.valueHoverHTML()     (A)
//  Retrieves the HTML to display in a hover canvas when the user holds the mousepointer over
//  some item's value.  Return null to suppress the hover canvas altogether.<br>
//  Can be overridden by +link{FormItem.valueHoverHTML()}.
//
//  @group Hovers
//  @see FormItem.valueHoverHTML()
//  @param item (FormItem)  Item the user is hovering over.
//  @visibility external
//<
valueHoverHTML : isc.DynamicForm._defaultValueHoverHTMLImpl,

// Method to actually show the Hover - called from the item when the user has hovered over
// the item.
_showItemHover : function (item, HTML) {
    if (HTML && !isc.is.emptyString(HTML) && item.showHover != false) {
        var properties = this._getItemHoverProperties(item);
        isc.Hover.showForTargetMouseOver(HTML, properties, (item.hoverRect || this.itemHoverRect));
    } else isc.Hover.clearForTargetMouseOut();
},

// Properties to apply to the hover shown for some item.
_getItemHoverProperties : function (item) {
    if (!isc.isA.FormItem(item)) item = this.getItem(item);
    while (item.parentItem != null) item = item.parentItem;

    // Determine whether the hover is being applied to a title, or icon
    var event = isc.EH.lastEvent;
    var itemInfo = this._getEventTargetItemInfo(event);
    var icon = itemInfo.overIcon ? item.getIcon(itemInfo.overIcon) : null,
        overTitle = itemInfo.overTitle;

    var props = this._getHoverProperties();
    if (item) {
        props = isc.addProperties(props, {
            align: (item.hoverAlign != null ? item.hoverAlign : this.itemHoverAlign),
            hoverDelay: (item.hoverDelay != null ? item.hoverDelay : this.itemHoverDelay),
            height: (item.hoverHeight != null ? item.hoverHeight : this.itemHoverHeight),
            opacity: (item.hoverOpacity != null ? item.hoverOpacity : this.itemHoverOpacity),
            baseStyle: (item.hoverStyle != null ? item.hoverStyle : this.itemHoverStyle),
            showHover: (item.showHover != null ? item.showHover : this.showHover),
            valign: (item.hoverVAlign != null ? item.hoverVAlign : this.itemHoverVAlign),
            width: (item.hoverWidth != null ? item.hoverWidth : this.itemHoverWidth),
            wrap: (item.hoverWrap != null ? item.hoverWrap : this.itemHoverWrap),
            autoFitWidth: (item.hoverAutoFitWidth != null ? item.hoverAutoFitWidth :
                this.itemHoverAutoFitWidth != null ? this.itemHoverAutoFitWidth : 
                this.hoverAutoFitWidth),
            autoFitMaxWidth: (item.hoverAutoFitMaxWidth || this.itemHoverAutoFitMaxWidth || 
                this.hoverAutoFitMaxWidth),
            focusKey: item.hasOwnProperty("hoverFocusKey") ? item.hoverFocusKey : 
                this.hoverFocusKey,
            persistent: item.hasOwnProperty("hoverPersist") ? item.hoverPersist : 
                this.hoverPersist
        });
    } else {
        props = isc.addProperties(props, {
            align: this.hoverAlign,
            hoverDelay: this.hoverDelay,
            height: this.hoverHeight,
            opacity: this.hoverOpacity,
            baseStyle: this.hoverStyle,
            valign: this.hoverVAlign,
            width: this.hoverWidth,
            autoFitWidth: this.itemHoverAutoFitWidth != null ? this.itemHoverAutoFitWidth : 
                this.hoverAutoFitWidth,
            autoFitMaxWidth: this.itemHoverAutoFitMaxWidth || this.hoverAutoFitMaxWidth,
            focusKey: this.hoverFocusKey,
            persistent: this.hoverPersist
        });
    }

    // Customizations for specific items / parts

    // Hover focus key: Support item.hoverFocusKey, form.titleHoverFocusKey, item.titleHoverFocusKey
    // Used by componentEditor / VB
    
    var undef;
    if (item.hoverFocusKey !== undef) {
        props.focusKey = item.hoverFocusKey;
    }
    if (overTitle) {
        if (item.titleHoverFocusKey !== undef) props.focusKey = item.titleHoverFocusKey;
        else if (this.titleHoverFocusKey !== undef) props.focusKey = this.titleHoverFocusKey;
    }


    // Allow different icon hoverStyle from the item. Not doc'd and used only by VB.
    if (icon && item.iconHoverStyle) props.baseStyle = item.iconHoverStyle;



    props.moveWithMouse = this.hoverMoveWithMouse;

    return props;
},

// Item Prompts
// --------------------------------------------------------------------------------------------



//>	@method	dynamicForm.showPrompt()	(A)
//		@group	prompt
//			Show a prompt (as dictated by an item, say).
//
//		@param	prompt	(String)			Prompt to show.
//<
showPrompt : function (prompt) {
	window.status = prompt;
},

//>	@method	dynamicForm.clearPrompt()	(A)
//		@group	prompt
//			Clear any form prompt currently showing.
//
//<
clearPrompt : function () {
	window.status = "";
},

// Queries on form properties
// --------------------------------------------------------------------------------------------


// returns true if the form encoding is set to multipart, false otherwise
isMultipart : function () {
    // normal is the default setting; if encoding is set to a value other than this, assume
    // multipart encoding is desired
    return !(this.encoding == isc.DynamicForm.NORMAL || 
             this.encoding == isc.DynamicForm.NORMAL_ENCODING);
},

// Drag and drop
// ---------------------------------------------------------------------------------------

itemIsLastInRow : function (item, rowNum) {
    var rowTable=this.items._rowTable,
        row = rowTable[rowNum],
        index = this.getItems().indexOf(item);
    
    if (!row || index < 0) return false;
    
    if (row[this.numCols-1] == index) return true;
    return false;    
},

getColumnWidths : function () {
    var rowTable=this.items._rowTable,
        widths = [];

    widths.length = this.numCols;
    // Init the widths array to zeroes to make the population loop simpler
    for (var j = 0; j < widths.length; j++) widths[j] = 0;

    for (var rowCount = 0; rowCount < rowTable.length; rowCount++) {
        var row = rowTable[rowCount];
        for (var i = 0; i < row.length; i++) {
            var item = this.items.get(row[i]);
            if (item.colSpan && item.colSpan > 1) continue;
            if (item.showTitle && 
                  (this.titleOrientation == "left" || !this.titleOrientation)) {
                if (item.getVisibleTitleWidth() > widths[i]) {
                    widths[i] = item.getVisibleTitleWidth();
                }
                i++;
            }
            if (item.width > widths[i]) widths[i] = item.width;
            if (item.showTitle && item.titleOrientation == "right" && 
                  item.getVisibleTitleWidth() > widths[i+1]) {
                widths[++i] = item.getVisibleTitleWidth();
            }
        }
    }
    return widths;
},

getItemTableOffsets : function (item, overrideRowTable) {
    var rowTable = overrideRowTable || this.items._rowTable,
        itemIndex = this.getItems().indexOf(item),
        result = {};

    result.itemIndex = itemIndex

    for (var rowCount = 0; rowCount < rowTable.length; rowCount++) {
        var row = rowTable[rowCount],
            start = row.indexOf(itemIndex),
            end = row.lastIndexOf(itemIndex);
        
        if (start > -1 && end > -1) {
            if (!result.left || start < result.left) result.left = start;
            if (!result.width || result.width < end - start) result.width = end - start+1;
            if (!result.top || rowCount < result.top) result.top = rowCount;
            if (!result.height || result.height < rowCount - result.top) {
                result.height = rowCount - result.top + 1;
            }
        }
    }

    return result;
},

getItemDropIndex : function (item, dropSide) {
    if (!item) return;
    if (!dropSide) dropSide = "L"; // by default, drop at item.itemIndex

    var offsets = this.getItemTableOffsets(item),
        rowTable = this.items._rowTable;
    
    if (dropSide == "L") return offsets.itemIndex;
    if (dropSide == "R") {
        if (this.itemIsLastInRow(item) && this.canAddColumns != true) {
            // This isn't really a special case in terms of item drop index - it might end up
            // in new column k rather than wrapping to old column j, but it will still be in
            // index position n.  Leaving in place in case it turns out that something special
            // *is* needed when we have the ability to auto-add columns
            return offsets.itemIndex+1;
        }
        return offsets.itemIndex+1;
    }
    if (dropSide == "T") {
        // if dropping above the top row, drop at the mouse location
        return this.getItemIndexAtTableLocation(
            offsets.top - (offsets.top==0 ? 0 : 1), offsets.left
            );    
    }
    if (dropSide == "B") {
        var bottom = offsets.top + offsets.height - 1;
        var itemIndex = this.getItemIndexAtTableLocation(bottom + 1, offsets.left);
        if (itemIndex == null) {
            itemIndex = this.items.length;
        }
        return itemIndex;
    }
},

getItemIndexAtTableLocation : function (rowNum, colNum) {
    var rowTable=this.items._rowTable;

    if (!rowTable[rowNum]) return;
    return rowTable[rowNum][colNum];
},

getItemAtPageOffset : function (x, y) {
    // FIXME - should really cache this value as we're called from mouse movement events, but
    // the caching that was in place was hanging on to stale values
    this.items._currentColWidths = this.getColumnWidths();
    var rowTable=this.items._rowTable,
        widths=this.items._currentColWidths,
        heights=this.items._rowHeights;

    var colNum = this.inWhichPosition(widths,x-this.getPageLeft()),
        rowNum = this.inWhichPosition(heights,y-this.getPageTop());

    colNum = colNum == -1 ? 0 : colNum == -2 ? widths.length : colNum;
    rowNum = rowNum == -1 ? 0 : rowNum == -2 ? heights.length : rowNum;

    if (!rowTable[rowNum]) return null;

    var itemIndex = rowTable[rowNum][colNum],
        item = this.getItem(itemIndex);

    if (item!=null) {
        item._dragRowNum = rowNum;
        item._dragColNum = colNum;
        item._dragItemIndex = itemIndex;
    }

    return item;
},

getNearestItem : function (x, y) {

    var shortest = 9999999999,
        nearestItem;

    this.logDebug("Computing nearest item to (" + x + "," + y + ")", "formItemDragDrop");
    
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        var area = item.getPageRect(true),  // "true" = return a rect including the title
            left = area[0],
            top = area[1],
            width = area[2],
            height = area[3],
            xDelta = 0,
            yDelta = 0;
        if (x >= left && x <= left+width &&
            y >= top && y <= top+height)
        {
            // The cursor is inside this item, so it's obviously the nearest!
            return item;
        }
        if (x > left) {
            if (x > left+width) {
                xDelta = x - (left+width);
            }
        } else {
            xDelta = left - x;
        }
        if (y > top) {
            if (y > top+height) {
                yDelta = y - (top+height);
            }
        } else {
            yDelta = top - y;
        }
        
        // Compute the straight-line distance to the nearest point of the item's area
        var distance = Math.sqrt(xDelta*xDelta + yDelta*yDelta);

        this.logDebug("Item " + item.name + ": (l,t,w,h) = " + area, "formItemDragDrop");
        this.logDebug("XDelta: " + xDelta + ", yDelta: " + yDelta + 
            ", straight line distance: " + distance, "formItemDragDrop");        

        if (distance < shortest) {
            this.logDebug("Item " + item.name + ": distance is shorter than " + shortest +  
                ", it is now the nearest item", "formItemDragDrop");
            shortest = distance;
            nearestItem = item;
        }
    }
    
    return nearestItem;
},

dragLineStyle: "dragLine",
showDragLineForItem : function (item, mouseX, mouseY) {
	// make sure the drag line is set up
	this.makeDragLine();

	if (!item) {
		this._dragLine.hide();
		return;
	}

    var itemRect = item.getPageRect(),
        left = itemRect[0],
        top = itemRect[1],
        width = itemRect[2],
        height = item.getVisibleHeight(),
        titlesAt = this.titleOrientation || "left",
        styleName = this.dragLineStyle;

    if (item.showTitle!=false) {
        if (titlesAt == "left" || titlesAt == "right") width +=  item.getVisibleTitleWidth();
        if (titlesAt == "left") left -=  item.getVisibleTitleWidth();
    }

    // Dropping to the right of an item is a special case - we should always show the right-
    // hand dropLine
    var toRight;
    
    if (mouseX <= left) mouseX = left+1;
    else if (mouseX >= left+width) {
        mouseX = left+width-1;
        toRight = true;
    }
    
    // Favor top/bottom unless we are within a certain number of pixels of the left or right 
    // edge.  This will be 20 pixels or a quarter of the widget width, whichever is the 
    // smaller 
    var sideExtent = width / 4;
    if (sideExtent > 20) sideExtent = 20;

    if (mouseY <= top) mouseY = top+1;
    else if (mouseY >= top+height) mouseY = top+height-1;

    var lOffset = mouseX - left, lPercent = Math.round(width / lOffset),
        tOffset = mouseY - top, tPercent = Math.round(height / tOffset),
        rOffset = (left+width)-mouseX, rPercent = Math.round(width / rOffset),
        bOffset = (top+height)-mouseY, bPercent = Math.round(height / bOffset),
        side,
        lineHeight, lineWidth, lineLeft, lineTop;

    left--; top--;

    if (toRight || (Math.min(lPercent, rPercent) < Math.min(tPercent, bPercent) &&
                   ((lPercent > rPercent && lOffset < sideExtent) ||
                    (rPercent > lPercent && rOffset < sideExtent)))) {
        // it's left or right, so vertical line
        side = toRight ? "R" : lPercent > rPercent ? "L" : "R";
        lineWidth = 3;
        lineHeight = height;
        lineLeft = side == "L" ? left : left+width-1;
        lineTop = top;
        styleName = this.dragLineStyle + "Vertical";
    }
    
    if ((item.endRow && side == "R") || (item.startRow && side == "L")) {
        // Targeting L/R beside an item that starts/ends row. Cannot do that
        side = null;
        // Let T/B handle it
    }

    if (!side) {
        // it's top or bottom, so horizontal line
        side = tPercent > bPercent ? "T" : "B";
        lineWidth = width;
        lineLeft = left;
        lineHeight = 3;
        lineTop = side == "T" ? top : top+height-1;
        styleName = this.dragLineStyle;
    }

    item.dropSide = side;

    if (this.itemIsLastInRow(item, item._dragRowNum) && !this.canAddColumns && item.dropSide == "R") {
        // if the item is the last in the row and this.canAddColumns is false, show the noDrop cursor
        this.hideDragLine();
        this.setNoDropIndicator();

        this._oldCursor = this.currentCursor;
        this.setCursor("not-allowed");
    }
    else {
        if (this._noDropIndicatorSet) {
            this.clearNoDropIndicator()
            this.setCursor(this._oldCursor);
        }
        
        var dims = {left: lineLeft, top: lineTop};
        this.adjustDragLinePosition(dims, item, side);
        lineLeft = dims.left;
        lineTop = dims.top;

        this._dragLine.setStyleName(styleName);
    	// resize and reposition the dragLine appropriately
    	this._dragLine.resizeTo(lineWidth, lineHeight);
    	this._dragLine.setPageRect(lineLeft, lineTop); 
    	// and stick it on top of everything else
        this._dragLine.bringToFront();
        this._dragLine.show();
    }
},

// Adjust the line position so it doesn't appear that we have two different drop positions (ie, 
// to the right of item n and to the left of item n+1).  In fact we DO have these two distinct 
// drop positions, but they result in the same thing happening
adjustDragLinePosition : function (dims, item, side) {
    var rowTable = this.items._rowTable,
        index = this.items.indexOf(item),
        row,
        colFrom, colTo;
    
    for (var i = 0; i < rowTable.length; i++) {
        if (rowTable[i].indexOf(index) != -1) {
            row = i;
            colFrom = rowTable[i].indexOf(index);
            colTo = rowTable[i].lastIndexOf(index);
            break;
        }
    }
    
    if (row == null || colFrom == null || colTo == null) return;
    
    if (side == "T") {
        if (row == 0) return;
        if (rowTable[row-1][colFrom] == rowTable[row-1][colTo] &&
            rowTable[row-1][colFrom-1] != rowTable[row-1][colFrom] &&
            rowTable[row-1][colTo+1] != rowTable[row-1][colFrom])
        {
            var rect = this.items[rowTable[row-1][colFrom]].getPageRect(true);
            var otherY = rect[1] + rect[3];
            dims.top -= Math.round((dims.top - otherY) / 2);
        }
    }
    
    if (side == "B") {
        if (row == rowTable.length - 1) return;
        if (rowTable[row+1][colFrom] == rowTable[row+1][colTo] &&
            rowTable[row+1][colFrom-1] != rowTable[row+1][colFrom] &&
            rowTable[row+1][colTo+1] != rowTable[row+1][colFrom])
        {
            var rect = this.items[rowTable[row+1][colFrom]].getPageRect(true);
            var otherY = rect[1];
            dims.top += Math.round((otherY - dims.top) / 2);
        }
    }
    
    if (side == "L") {
        if (colFrom == 0) return;
        // Need support for row-spanning columns here
        var rect = this.items[rowTable[row][colFrom-1]].getPageRect(true);
        var otherX = rect[0] + rect[2];
        dims.left -= Math.round((dims.left - otherX) / 2);
    }
    
    if (side == "R") {
        if (colTo == rowTable[row].length - 1) return;
        // Need support for row-spanning columns here
        var rect = this.items[rowTable[row][colTo+1]].getPageRect(true);
        var otherX = rect[0];
        dims.left += Math.round((otherX - dims.left) / 2);
    }
},

showDragLineForForm : function () {
	// make sure the drag line is set up
	this.makeDragLine();
	this._dragLine.setStyleName(this.dragLineStyle + "Vertical");
    this._dragLine.resizeTo(3, this.getHeight());
    this._dragLine.setPageRect(this.getPageLeft(), this.getPageTop()); 
    this._dragLine.bringToFront();
    this._dragLine.show();
},

// Field hide/show, enable/disable
// ---------------------------------------------------------------------------------------
// The following enable/disable and show/hide methods are overrides of DBC

enableField : function (fieldName) {
    if (fieldName == null || isc.isAn.emptyString(fieldName)) return;
 
    var item = this.getItem(fieldName);
    if (item) item.enable();
},

disableField : function (fieldName) {
    if (fieldName == null || isc.isAn.emptyString(fieldName)) return;
 
    var item = this.getItem(fieldName);
    if (item) item.disable();
},

showField : function (fieldName) {
    if (fieldName == null || isc.isAn.emptyString(fieldName)) return;
 
    var item = this.getItem(fieldName);
    if (item) item.show();
},

hideField : function (fieldName) {
    if (fieldName == null || isc.isAn.emptyString(fieldName)) return;
 
    var item = this.getItem(fieldName);
    if (item) item.hide();
},

// A form's "selection chain" is the chain of selectionComponents that control what part of
// a complex nested structure the form is currently editing.  For a form that is editing a
// row from a nested list, this "chain" will consist of one component - it doesn't become a 
// chain until we get to lists nested within lists, at which point we can only sensibly decide
// what data the form is editing if we know which record is selected in the outer list *as well
// as* which record is selected in the inner list
//
// This helper method actually returns an array consisting of the indices of selected records
// that describe this form's current position in the data hierarchy, from top to bottom.
getSelectionChain : function () {
    if (!this.selectionComponent) return [];
    var selComponents = [];
    var work = this;
    while (work.selectionComponent) {
        selComponents.add(work.selectionComponent);
        work = work.selectionComponent;
    }
    var indices = [];
    for (var i = selComponents.length - 1; i >= 0; i--) {
        indices.add(selComponents[i].getRecordIndex(selComponents[i].getSelectedRecord()));
    }
    return indices;
},

//> @method dynamicForm.setCanEdit
// Is this form editable or read-only? Setting the form to non-editable causes all
// form items to render as read-only unless a form item is specifically marked as editable
// (the item's +link{formItem.canEdit,canEdit} attribute is <code>true</code>).
//
// @param canEdit (boolean) Can this form be edited?
// @group readOnly
// @see dynamicForm.canEdit
// @visibility external
//<
setCanEdit : function (newValue) {
    this.canEdit = newValue;

    var willRedraw = this.isDrawn();

    // Call updateCanEdit() on our items.
    var items = this.getItems();
    if (items != null) {
        for (var i = 0, len = items.length; i < len; ++i) {
            var item = items[i];
            
            item.updateCanEdit(willRedraw);
        }
    }

    if (willRedraw) this.markForRedraw("setCanEdit");
},

// Override setFieldCanEdit to setCanEdit on specific items.
setFieldCanEdit : function (fieldName, canEdit) {
    if (fieldName == null || isc.isAn.emptyString(fieldName)) return;
 
    var field = this.getField(fieldName);
    if (field) {
        if (field.setCanEdit) {
            field.setCanEdit(canEdit);
        } else {
            field.canEdit = canEdit;
            this.redraw();
        }
    }
},

//> @method dynamicForm.fieldIsEditable()
// Can the field be edited?  This method looks at +link{canEdit} for the grid as well as the
// +link{formItem.canEdit} value, to determine whether editing is actually allowed.
// For a detailed discussion, see the documentation at +link{canEdit}.
//
// @param field (FormItem | number | String)  field object or identifier
// @return      (boolean)                     whether field can be edited
//
// @group editing
// @visibility external
//<
fieldIsEditable : function (field) {
    if (!isc.isAn.Object(field)) field = this.getField(field);
    return field ? isc.DynamicForm.canEditField(field, this) : false;
},

//> @method dynamicForm.setReadOnlyDisplay()
// Setter for the +link{readOnlyDisplay} attribute.
// @param appearance (ReadOnlyDisplayAppearance) New read-only display appearance.
// @visibility external
//<
setReadOnlyDisplay : function (appearance) {
    this.readOnlyDisplay = appearance;

    var willRedraw = (this.canEdit == false && this.isDrawn());

    // Call updateReadOnlyDisplay() on our items.
    var items = this.getItems();
    if (items != null) {
        for (var i = 0, len = items.length; i < len; ++i) {
            var item = items[i];
            
            item.updateReadOnlyDisplay(willRedraw);
        }
    }

    if (willRedraw) this.markForRedraw("setReadOnlyDisplay");
}



});	// END isc.DynamicForm.addMethods()



// class methods
isc.DynamicForm.addClassMethods({
    
 
// Static method to put a series of items into order based on specified
// tab index (where present)

sortItemsIntoTabOrder : function (items, logTarget) {
    
    if (logTarget == null) logTarget = this;
    
    // We want to ensure the auto-allocated tabIndices don't collide with the explicitly 
    // specified index of some other form item, so we can't just use items.indexOf(item) for
    // each item.
    var explicitTabIndexArray = [], warnedTIs = {};    
    for (var i = 0; i < items.length; i++) {
        
        var item = items[i], ti = item.tabIndex;
        if (ti != null && ti != -1) {
            // Warn if we have explicit tabIndices that collide
            
            if (explicitTabIndexArray[ti] != null) {
                if (!warnedTIs[ti]) {
                    logTarget.logWarn("More than one item in this form have an explicitly specified tabIndex of '" 
                                + ti + "'. Tab order cannot be guaranteed within this form.");
                    // avoid warning over and over for the same tab index.
                    warnedTIs[ti] = true;
                }
                item._tabIndexCollision = true;
            }
            // Making a sparse array of previously assigned tabIndices. 
            explicitTabIndexArray[ti] = item;
        }
    }
    
    // iterate through a second time actually setting up the local tabIndices
    // We'll do this by setting the local tabIndex to the index in the items array offset by
    // any tab-indices already explicitly populated.
    // (Start with an offset of 1 - we want to use 1-based rather than 0-based tab indices for
    // simplicity)
    var tabIndexOffset = 1,
        orderedItems = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        // Don't increment the next tabIndex if:
        // - this item has not yet been initialized
        // - this item already has an explicit tabIndex
        // - it can't receive focus
        
        if (!isc.isA.FormItem(item)) {
            if (logTarget.logIsInfoEnabled("TabIndexManager")) 
                logTarget.logInfo("dynamicForm.sortItemsIntoTabOrder() fired before all form items have been initialized" 
                             + this.getStackTrace());
                             
            continue;
        }
        if (item.tabIndex != null && !item._tabIndexCollision) {
            orderedItems[item.tabIndex] = item;
            continue;
        }

        tabIndexOffset += 1;
        // Avoid colliding with explicitly specified local tab indices
        while (explicitTabIndexArray[tabIndexOffset] != null) {
            tabIndexOffset += 1;
        }
        
        item._localTabIndex = tabIndexOffset;
        
        orderedItems[tabIndexOffset] = item;
    }
    return orderedItems;
    
},    

defaultFieldType:"text",

// Avoid re-instantiating strings every time this method is run
_$link:"link", _$text:"text", _$select:"select", _$checkbox:"checkbox",
_$staticText:"staticText", _$boolean:"boolean", _$integer:"integer",
_$binary:"binary", _$blob:"blob", _$multifile:"multifile", _$multiupload:"multiupload",
_$upload:"upload", _$file:"file", 
_$base64Binary: "base64Binary", _$enum:"enum", _$CycleItem:"CycleItem", _$selectOther:"selectOther",
_$relation:"relation", _$nestedEditor:"NestedEditorItem", _$nestedListEditor:"NestedListEditorItem",
_$imageFile:"imageFile", _$viewFileItem:"ViewFileItem",
_$section:"section", _$sectionItem:"SectionItem",
_$button:"button", _$buttonItem:"ButtonItem", _$formItem:"FormItem",
_$datetime:"datetime", _$DateTimeItem:"DateTimeItem",
getEditorType : function (field, widget, values) {
    
    // choosing which form item type to use:
    // Each field may consist of either entirely properties that were passed in, a mixture
    // of passed-in overrides and DataSource defaults, or entirely DataSource defaults.
    // - if "editorType" is present (or the legacy name "formItemType" for the same
    //   concept), use it regardless of whether it came from passed-in fields or from the
    //   DataSource defaults
    // - _constructor comes from XML translation.  When a field is specified as 
    //      <TextItem name="foo" .../>
    //   .. _constructor will be "TextItem".  When a field is just specified as
    //      <field name="foo" type="text" .../>
    //   .. _constructor will have the value "FormItem", which we ignore because FormItem
    //   is an abstract base class, so we want to apply automatic item-choosing.
    if (field._constructor == isc.FormItem.Class) field._constructor = null;    

    // Grab the DataSource (if any) for later use
    var ds = widget.getDataSource();

    var canEdit = this.canEditField(field,widget),
        defaultType = this.defaultFieldType,
        editorType = field.editorType
    ;

    if (isc.isA.Class(editorType)) {
        // we were passed a class, not a string - map to the class-name
        editorType = editorType.getClassName();
    }
    
    // items originating in SGWT may have FormItem as editorType - ignore
    if (editorType == this._$formItem) editorType = null;

    
    var useConstructor = !field.editNode || isc[field._constructor];

    // NOTE: "formItemType" is a legacy synonym of "editorType"    
    var type = (canEdit == false && field.readOnlyEditorType) || editorType ||
               field.formItemType || (useConstructor && field._constructor);
    if (type == null) {
        type = widget && widget.getFieldType ? widget.getFieldType(field, values) : field.type;
    }
    
    if (type == null) type = defaultType;

    

    if ((canEdit == false && field.readOnlyEditorType) || editorType || 
        field.formItemType || field._constructor) 
    {
        return type;
    }

    var currentType = type;
    var returnType = null;
    
    var isFileType = (type == this._$binary || type == this._$file || type == this._$imageFile);
    
    while (currentType) {
        // .. otherwise, "type" has been specified on its own without the more specific
        // "editorType", and could refer either to a data type or form item type.
        // For certain known data types, pick appropriate editors.
        if (type == this._$link) {
            // NOTE: Looking at the canEdit property directly here, because the canEditField()
            // method returns true if there is no explicit setting t5o switch editability off,
            // but for links we need the opposite behavior (they should only be editable if 
            // the user code explicitly sets canEdit:true)
            if (this.canEditField(field, widget) && field.canEdit) returnType = this._$text;
            else returnType = this._$link;
        /*
        } else if (!canEdit && isFileType && field.canEdit == false) {
            
            // Default to using static text items for all canEdit:false fields regardless of data type
            // with the exception of links (which are already non editable)      
            
            
            
            
            if (type == this._$binary || type == this._$file || type == this._$imageFile) 
                returnType = this._$viewFileItem;
            // a couple of common special-cases to avoid converting to staticText
            else if (type != this._$section && type != this._$sectionItem &&
                     type != this._$button && type != this._$buttonItem) 
            {
                returnType = this._$staticText;
            }
        */
        } else if (type == this._$boolean) {
            var map = field.valueMap;
            // assumption is that if a valueMap is provided, a boolean storage type
            // is being used for a field with two possible values but no obvious true/false 
            // aspect, eg, Sex: Male/Female.  In this case, we should show a SelectItem rather 
            // than eg a checkbox labeled "Sex"
            if (!isc.isAn.Array(map) && isc.isAn.Object(map)) returnType = this._$select;
            else returnType = this._$checkbox;
        } else if (type == this._$binary || type == this._$blob || type == this._$file || 
            type == this._$imageFile) 
        {
            if (field.dataSource) returnType = this._$multifile
            else returnType = this._$file;
        } else if (type == this._$multiupload) {
            returnType = this._$multifile;
        } else if (type == this._$base64Binary) {
            returnType = this._$base64Binary;
        } else if (type == this._$enum) {
            // If we're just showing valueIcons and no type is specified, use a cycle-item rather
            // than a select.
            if (field.showValueIconOnly) returnType = this._$CycleItem
            else returnType = this._$select;
        } else if (isc.DataSource && isc.isA.DataSource(ds) && ds.fieldIsComplexType(field.name)) {
            // Note: if showComplexFields is false, fields of complexType declared in the
            // DataSource never make it to the form.
            returnType = field.multiple ? widget.nestedListEditorType : widget.nestedEditorType;
        } else if (type == this._$datetime) {
            // Need to explicitly translate "datetime" to "DateTimeItem" because of the different
            // casing of time/Time
            returnType = this._$DateTimeItem;
        } else {
            
            if (currentType && currentType != defaultType && currentType != this._$integer &&
                (currentType == this._$selectOther || (isc.FormItemFactory.getItemClass(currentType) != null)))
            {
                returnType = currentType;
            } else {
                currentType = isc.SimpleType.getType(currentType);
                if (returnType) {
                    break;
                } else if (currentType == null || currentType.inheritsFrom == null) {
                    // if field.type=="text" or field.type==null or field.type is not directly recognized by
                    // getItemClass():
                    
                    
                    // "text" is both a data type and a form item type.  We take it to mean the data
                    // type, and may pick a SelectItem or TextAreaItem instead of a TextItem.  This is
                    // the only case in which setting field.type to the short name of a FormItem type
                    // ("Item" suffix omitted) will not select that form item.  It can be avoided by
                    // setting editorType="text".
                    if (field.dataSource) {
                        // Use a relationItem for databound form items of unspecified type.
                        returnType = this._$relation;            
                    } else if (field.valueMap || field.optionDataSource || field.displayField) {
                        // if a field has a valueMap, or an explicit optionDataSource / displayField
                        // [which is essentially a server-side valueMap]                        
                        // If we're showing valueIcons only, use CycleItem - otherwise default to "select"
                        returnType = (field.showValueIconOnly ? this._$CycleItem : this._$select);
                        
                    } else if (widget && 
                               (field.length && field.length > widget.longTextEditorThreshold)) 
                    {
                        // for very large text fields, show a textArea.
                        returnType = widget.longTextEditorType;
                    } else {
                        // default anything else to text
                        returnType = defaultType;
                    }
                } else {
                    currentType = currentType.inheritsFrom;
                    type = currentType;
                    returnType = null;
                    continue;
                }
            }
        }
        break;
    }
    
    return returnType;
},

//> @attr dynamicForm.canEditFieldAttribute
// @include dataBoundComponent.canEditFieldAttribute
// @visibility external
//<

// _getItemInfoFromElement - given some DOM element, determine which (if any) item the
// element is a part of.
// Returns an object of the following format:
//  {item:[formItem object], overTitle:boolean, overElement:boolean }

_$id:"id",
_getItemInfoFromElement : function (target, form) {

    var handle = form ? form.getClipHandle() : document,
        itemInfo = {},
        overPickerIconCell,
        pickerCellTarget,
        
        containsItem = isc.DynamicForm._containsItem,
        
        itemPart = isc.DynamicForm._itemPart,
        
        elementString = isc.DynamicForm._element,
        textBoxString = isc.DynamicForm._textBoxString,
        controlTableString = isc.DynamicForm._controlTableString,
        inlineErrorString = isc.DynamicForm._inlineErrorString,
        pickerIconCellString = isc.DynamicForm._pickerIconCellString,
        titleString = isc.DynamicForm._title,
        eventPartString = "eventpart",
        valueIconString = "valueicon";

    // We mark form items' HTML elements with a 'containsItem' parameter so we can determine
    // which item we're looking at.
    // Iterate up the DOM from the target checking for this attr
    while (target && target != handle && target != document) {
        
        var itemID = target.getAttribute ? target.getAttribute(containsItem) : null;

        if (target.getAttribute && 
            (target.getAttribute(eventPartString) == valueIconString)) 
        {
            itemInfo.overValueIcon = true;
        }
        if (target.getAttribute && 
            (target.getAttribute(itemPart) == pickerIconCellString)) 
        {
            // save details of finding pickerIconCell. If final "over"
            // state is overControlTable this information will be used
            // to change state to appear as if the picker icon was
            // targeted.
            pickerCellTarget = target;
            overPickerIconCell = true;
        }

        if (itemID != null && !isc.isAn.emptyString(itemID)) {
            var item = window[itemID];
            // If the item is part of the given form and is not destroyed, then fill out itemInfo.
            if (item != null && !item.destroyed && (form == null || item.form === form)) {
                itemInfo.item = item;

                // catch the case where it's inactive itemHTML
                
                var inactiveContext = item._getInactiveContextFromElement(target);
                if (inactiveContext != null) {
                    if (this.logIsDebugEnabled("inactiveEditorHTML")) {
                        this.logDebug("Event occurred over inactive HTML for item:" + item +
                                " inactiveContext:" + this.echo(inactiveContext),
                                "inactiveEditorHTML");
                    }
                    itemInfo.inactiveContext = inactiveContext;
                }

                // We also hang an attribute describing which part of the item an element is
                // so we can determine whether we're looking at the item's title, element or
                // one of it's icons.
                // Options are: 
                //  "element" - over a native element like an <input> box
                //  "title" - over the title cell
                //  "textbox" - over the textBox
                //  "controlTable" - control table
                //  Anything else assumed to be an icon ID
                
                var eventItemPart = target.getAttribute(itemPart);
                if (eventItemPart == elementString) itemInfo.overElement = true;
                else if (eventItemPart == titleString) itemInfo.overTitle = true;
                else if (eventItemPart == textBoxString)itemInfo.overTextBox = true;
                else if (eventItemPart == controlTableString) itemInfo.overControlTable = true;
                else if (eventItemPart == inlineErrorString) itemInfo.overInlineError = true;
                else if (eventItemPart && !isc.isAn.emptyString(eventItemPart)) 
                    itemInfo.overIcon = eventItemPart;
                // quit the loop so we can return the item info.
                break;
            }
        }

        target = target.parentNode;
    }

    if (overPickerIconCell && itemInfo.overControlTable) {
        
        target = this._getEventTargetForItemPart(pickerCellTarget);
        if (target != null) {
            var itemID = target.getAttribute ? target.getAttribute(containsItem) : null;
            var item = window[itemID];
            // If the item is part of the given form and is not destroyed, then fill out itemInfo.
            if (item != null && !item.destroyed && (form == null || item.form === form)) {
                var eventItemPart = target.getAttribute(itemPart);
                itemInfo.overIcon = eventItemPart;
                itemInfo.item = item;
                itemInfo.overPickerIconCell = true;
                delete itemInfo.overControlTable;
            }
        }
    }

    return itemInfo;
},

_getEventTargetForItemPart : function (parentNode) {
    var childNodes = parentNode.childNodes,
        itemPart = isc.DynamicForm._itemPart,
        result
    ;
    if (childNodes) {
        for (var i = 0; i < childNodes.length; i++) {
            var target = childNodes[i],
                eventItemPart = target.getAttribute(itemPart);
            if (eventItemPart && !isc.isAn.emptyString(eventItemPart)) {
                result = target;
                break;
            }
            result = this._getEventTargetForItemPart(target, eventItemPart);
            if (result != null) break;
        }
    }
    return result;
},

// helper used by the EventHandler; gets item associated with last event
_getEventTargetItem : function (event) {
    if (!event) event = isc.EH.lastEvent;

    // if cached item info is not set or is stale, recalculate it if target is a DynamicForm
    
    var target = event.target,
        info = event.itemInfo;
    if (isc.isA.DynamicForm(target) && (!info || event._itemInfoDOMevent != event.DOMevent)) {
        info = target._getEventTargetItemInfo(event);
    }

    // if a valid item is present that belongs to the event, return it
    return info && info.item && info.item.form == target ? info.item : null;
},

// Callable either on server-formatted errors or editor component format errors.
// Response:
//     { fieldName : {errorMessage: value, otherProp: value},
//       anotherFieldName : {errorMessage: value, otherProp: value},
//       ...
//     }
//   Note that error object {} can also be an array of error objects [{}, ...]
getSimpleErrors : function (errors) {
    // If error is in server format, transform the server error report format to the error
    // report expected by an editor component.  Server errors are formatted as:
    // [{ "recordPath" : pathString, 
    //    fieldName : errors,
    //    anotherFieldName : errors,
    //  }]
    // Where pathString is a string representing the record (used for flat or hierarchical data
    // on the server).
    // And where the errors for each field have the format
    // { errorMessage : msg, resultingValue : value }
    // or 
    // [{ errorMessage : msg, resultingValue : value }, 
    //  { errorMessage : msg, otherProp : value },  ... ]
    //
    // Editor components expect just { fieldName : errorMessage } - we drop
    // the resultingValue and other properties
    //
    var errorObjects = {};
    // note we support errors for only one row
    if (isc.isAn.Array(errors)) errors = errors[0];

    for (var fieldName in errors) {
        var fieldErrors = errors[fieldName];
        if (fieldName == "recordPath" && !isc.isAn.Object(fieldErrors)) continue;

        if (isc.isAn.Array(fieldErrors)) {
            errorObjects[fieldName] = [];
            for(var i = 0; i < fieldErrors.length; i++) {
                var error = fieldErrors[i];
                errorObjects[fieldName][i] = isc.isAn.Object(error)
                                                ? isc.shallowClone(error)
                                                : {errorMessage: error};
            }
        } else {
            errorObjects[fieldName] = isc.isAn.Object(fieldErrors)
                                          ? isc.shallowClone(fieldErrors)
                                          : {errorMessage: fieldErrors};
        }
    }
    return errorObjects;
},

// Callable either on server-formatted errors or editor component format errors.

formatValidationErrors : function (errors) {
    // If error is in server format, transform the server error report format to the error
    // report expected by an editor component.  Each server error is:
    // { fieldName : errors },
    //   anotherFieldName : errors },
    //   ...
    // }
    // where the errors for each field have the format
    // { errorMessage : msg, resultingValue : value }
    // or 
    // [{ errorMessage : msg, resultingValue : value }, 
    //  { errorMessage : msg, otherProp : value },  ... ]
    //
    // Editor components expect just { fieldName : errorMessage } - we drop
    // the resultingValue and possible other properties
    //
    
    var errorMessages = {};
    // note we support errors for only one row
    if (isc.isAn.Array(errors)) errors = errors[0];

    for (var fieldName in errors) {
        var fieldErrors = errors[fieldName];
        if (fieldName == "recordPath" && !isc.isAn.Object(fieldErrors)) continue;

        if (isc.isAn.Array(fieldErrors)) {
            errorMessages[fieldName] = [];
            for(var i = 0; i < fieldErrors.length; i++) {
                var error = fieldErrors[i];
                if(isc.isAn.Object(error)) error = error.errorMessage;
                errorMessages[fieldName][i] = error;
            }
        } else {
            errorMessages[fieldName] = isc.isAn.Object(fieldErrors) ? fieldErrors.errorMessage
                                                                    : fieldErrors;
        }
    }
    return errorMessages;
},


// valuesHaveChanged - recursively compares newValues with oldValues, allowing formItem
// compareValues() to run for values with an associated item and handling data paths.
//
// Implemented as a classMethod and used by DynamicForm.valuesHaveChanged
// and ValuesManager.valuesHaveChanged [so the form parameter may be a ValuesManager rather than
// a DynamicForm].
valuesHaveChanged : function (form, returnChangedVals, values, oldValues, rootPath,
                              useActionCache)
{

    var changed = false,
        changedVals = {};

    // A value may have been cleared and the property deleted from `values'. To ensure that we
    // detect the clearing of a value as a change, we need to make sure that `values' is
    // augmented with any properties that exist in `oldValues'.
    
    var augmentedValues = values,
        undef;
    for (var oldProp in oldValues) {
        if (!(oldProp in values)) {
            // Lazily create a copy of `values' the first time a property is found in `oldValues'
            // that is not in `values'.
            if (augmentedValues === values) augmentedValues = isc.addProperties({}, values);

            augmentedValues[oldProp] = undef;
        }
    }
    values = augmentedValues;

    var fields = useActionCache ? form._getUpdatedFields() : form.getFields().duplicate(),
        dsFields = {};
    if (isc.DataSource && isc.isA.DataSource(form.getDataSource())) {
        dsFields = useActionCache ? form._getUpdatedDSFields() :
                                    form.getDataSource().getFields();
    }

    // Process properties mapped to fields first, since this allows us to quickly deal with
    // items with dataPaths like "topLevel/someSubPath/anEvenDeeperPath" without blind mining

    var pathsProcessed = {};
    
    // Compare the merged set of fields.  
    for (var i = 0; 
             i < fields.length || this._mergeDSFields(fields, dsFields, pathsProcessed);
             i++)
    {
        var dataPath = fields[i].dataPath || fields[i].name;
        if (dataPath != null) {  // If null, field has neither a name nor a dataPath - ignore it
            if (pathsProcessed[dataPath]) continue;
            pathsProcessed[dataPath] = fields[i];
            
            var oldFieldValue = isc.DataSource ? 
                                    isc.DataSource.getFieldValue(null, oldValues, dataPath, null, "compare") : 
                                    oldValues[dataPath];
            var newFieldValue = isc.DataSource ? 
                                    isc.DataSource.getFieldValue(null, values, dataPath, null, "compare") :
                                    values[dataPath];
            var partialPaths = dataPath.split('/');
            if (partialPaths.length > 1) {
                var pPath = "";
                for (var j = 0; j < partialPaths.length; j++) {
                    if (j > 0) pPath += "/";
                    pPath += partialPaths[j];
                    if (!pathsProcessed[pPath]) {
                        pathsProcessed[pPath] = fields[i];
                    }
                }
            }
            if (!form.fieldValuesAreEqual(fields[i], oldFieldValue, newFieldValue)) {
                changed = true;
                if (!returnChangedVals) break;
                
                changedVals[fields[i].name] = newFieldValue;
            }
        }
    }

    if (changed && !returnChangedVals) {
        return changed;
    }

    // Bail out without diving down through all the non-field values if we are so configured
    if (form.canChangeNonFieldValues === false) {
        return (returnChangedVals ? changedVals : changed);
    }

    if (useActionCache) {
        
        values    = form._filterWithUpdatedFields(values);
        oldValues = form._filterWithUpdatedFields(oldValues);
    }

    for (var prop in values) {
        // ignore functions
        if (isc.isA.Function(values[prop])) continue;

        
        if (prop == isc.gwtRef || prop == isc.gwtModule) continue;
        
        // Skip instances and classes
        
        
        if (isc.isAn.Instance(values[prop]) || isc.isA.Class(values[prop]) 
                                            || (values[prop] && values[prop]._constructor)) 
        {
            continue;
        }

        var fullPath = rootPath == null ? prop : rootPath + "/" + prop;

        // If we've seen this path before, that will be because it is the dataPath of a declared
        // field - we've already checked it
        if (pathsProcessed[fullPath]) continue;

        // Use compareValues to compare old and new values
        // This will catch cases such as Dates where an '==' comparison is
        // not sufficient.
        // Note: If we have a form item use item.compareValues() in case it has been overridden
        var item = form.getItem(fullPath);
        if (item != null) {
            // ASSERT: This will never happen, we processed all the field-mapped values in the
            // loop above
            //changed = !item.compareValues(values[prop], oldValues[prop]);
            //if (changed && returnChangedVals) changedVals[prop] = values[prop];
            
        } else {
            var value = values[prop],
                oldValue = oldValues[prop];
                
            
            var valIsObj, oldValIsObj;
            if (isc.isA.Number(value) || isc.isA.String(value) || isc.isA.Boolean(value)) {
                valIsObj = false;
            } else {
                valIsObj = isc.isAn.Object(value);
            }
            if (isc.isA.Number(oldValue) || isc.isA.String(oldValue) || isc.isA.Boolean(oldValue)) {
                valIsObj = false;
            } else {
                valIsObj = isc.isAn.Object(oldValue);
            }

            if (valIsObj && 
                !isc.isAn.Array(value) && !isc.isA.Date(value) &&
                oldValIsObj && !isc.isAn.Array(oldValue) && !isc.isA.Date(oldValue)) 
            {
                var innerChanged = isc.Canvas.valuesHaveChanged(
                                    form, returnChangedVals, values[prop], oldValues[prop], fullPath);
                if (!returnChangedVals && innerChanged) {
                    changed = true;
                    break;
                } else if (!isc.isAn.emptyObject(innerChanged)) {
                    if (changedVals[prop] == null) changedVals[prop] = {};
                    isc.addProperties(changedVals[prop], innerChanged);
                }
            } else {
                changed = !isc.Canvas.compareValues(value, oldValue);
                if (changed && returnChangedVals) changedVals[prop] = value;
            }
        }
        // no need to keep going once we've found a difference
        // unless we've been asked to return the changed values
        if (changed && !returnChangedVals) {
            return true;
        }
    }

    return (returnChangedVals ? changedVals : changed);
},


_mergeDSFields : function (fields, dsFields, pathsProcessed) {
    
    if (isc.isAn.emptyObject(dsFields) || isc.isAn.emptyArray(dsFields)) return false;

    var startLen = fields.length;

    if (isc.isAn.Array(dsFields)) {
        var fieldArray = dsFields;
        dsFields = {};
        for (var i = 0; i < fieldArray.length; i++) {
            dsFields[fieldArray.name] = fieldArray[i];
        }
    }

    // Merge in any DS fields that do not have corresponding FormItems
    for (var key in dsFields) {
        var dsField = dsFields[key];
        if (dsField.dataPath) {
            if (!pathsProcessed[dsField.dataPath]) fields.add(dsField);

        } else if (dsField.name) {
            if (!pathsProcessed[dsField.name]) fields.add(dsField);
        }
    }

    dsFields = isc.emptyObject;

    return fields.length > startLen;
},

// get filter criteria for a list of filter components (passed as arguments)
getFilterCriteria : function () {
    var criteria = {};
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg == null) continue;
        if (arg.getValuesAsCriteria == null) {
            this.logInfo("DynamicForm.getFilterCriteria() - unable to call 'getValuesAsCriteria()' on argument:" + this.echo(arg));
            continue;
        }
        isc.addProperties(criteria, arg.getValuesAsCriteria());
    }
    return criteria;
},

// HTML template generation
_getTopRowCellStart : function () {
     if (!this._observingDoublingStrings) {
        isc.Canvas._doublingStringObservers.add({
            target:this, 
            methodName:"_doublingStringsChanged"
        });
        this._observingDoublingStrings = true;
    }
    if (this._$topRowCellStart == null) {
        
        this._$topRowCellStart = [
            "<TD style='",
            isc.Canvas._$noStyleDoublingCSS,
            "font-size:0px;height:0px;overflow:hidden;padding:0px;' class='",
            null,            
            "'>",
            
            (isc.Browser.isSafari || isc.Browser.isMoz ? "<div style='overflow:hidden;height:0px'>" : "")
        ]
    }
    return this._$topRowCellStart;
},
_getTitleInnerTableTemplate : function () {
    if (!this._observingDoublingStrings) {
        isc.Canvas._doublingStringObservers.add({
            target:this, 
            methodName:"_doublingStringsChanged"
        });
        this._observingDoublingStrings = true;
    }
    if (this._titleInnerTableTemplate == null) {
        this._titleInnerTableTemplate = [
            "<TABLE height=",   // 0
            , // 1: height
            " border=0 cellspacing=0 cellpadding=0><tr><td class='", // 2
            , // 3: className
            // Override any style attributes that would look wrong double-applied by the className
            "' style='" + isc.Canvas._$noStyleDoublingCSS + "' ALIGN='", // 4
            , // 5: this.getTitleAlign(item)
            "'>",   // 6
            null    // 7: <NOBR>
        ];
    }
    return this._titleInnerTableTemplate;
},

_doublingStringsChanged:function () {
    this._$topRowCellStart = null;
    this._titleInnerTableTemplate = null;
},
	

//> @attr dynamicForm.allowExpressions (boolean : null : IRW)
// For a form that produces filter criteria
// (see +link{dynamicForm.getValuesAsCriteria,form.getValuesAsCriteria()}), allows the user to
// enter simple expressions in any field in this form that takes text input.
// <P>
// Also note that enabling <code>allowExpressions</code> for an entire form changes the
// +link{defaultSearchOperator} to
// +link{dataSource.translatePatternOperators,"iContainsPattern"},
// so that simple search expressions similar to SQL "LIKE" patterns can be entered in most
// fields.
// <P>
// See +link{formItem.allowExpressions} for details.
//
// @group advancedFilter
// @visibility external
//<

//> @attr dynamicForm.suppressBrowserClearIcons (boolean : false : IRW)
// Default +link{textItem.suppressBrowserClearIcon} value for TextItems within this 
// form.
// @visibility external
//<
suppressBrowserClearIcons:false

});
// InlineForms: embedding SmartClient FormItems into native HTML forms.
// See QA/DynamicForm/inlineForms.jsp
// ---------------------------------------------------------------------------------------

isc.defineClass("InlineFormItem", "DynamicForm").addProperties({
    position:"relative",

    // don't write a form tag, so that form items written out join a surrounding HTML
    // form.  Note if we did not set this flag, IE will JS error if you try to insert a form
    // inside a form.  Firefox doesn't mind and the values show up within the outer form.
    // Safari untested.
    writeFormTag:false,

    // write native form fields to carry values for synthetic items, just as with direct submit
    canSubmit:true,

    // only one item, with no title
    numCols: 1,
    
    // in case the default is switched at the Canvas level
    autoDraw: true

    
    //redraw : function (a,b,c,d) {
    //    this.invokeSuper(isc.InlineFormItem, this._$redraw, a,b,c,d);
    //    this.getItem(0).getDataElement().form.offsetHeight;
    //}
});

isc.InlineFormItem.addClassMethods({
    // This override of create() does create a form, but applies properties to the (singular)
    // FormItem, so that it's possible to use inline items from XML like so:
    //     <InlineItem name="name" type="type">
    //       <valueMap> ... </valueMap>
    //     </InlineItem>
    // NOTE: it's ordinarily not a good idea to override create to return some kind of
    // "wrapper" component, because in order to be used inline in eg a Layout.members array,
    // create() must return the wrapper component, however in other usage (eg subcomponent
    // creation) the expectation is that create will return an instance of whatever was
    // created.
    create : function (A,B,C,D,E,F,G,H,I,J,K,L,M) {

        var itemProps = isc.addProperties({ 
            showTitle:false,
            validate : function () { this.form.validate(); },
            destroy : function () { this.form.destroy(); this.Super("destroy", arguments); } 
        }, A,B,C,D,E,F,G,H,I,J,K,L,M);

        var theForm = this.createRaw().completeCreation({
            fields : [ itemProps ],
            valuesManager : itemProps.valuesManager
        }, itemProps.formProperties );

        return theForm.getItem(0);
    }
});

isc.DynamicForm.addClassMethods({
    //> @classMethod DynamicForm.makeInlineItem()
    // Return a SmartClient form item suitable for embedding into a normal HTML form.
    // <P>
    // For example, embedding a +link{ComboBoxItem}:
    // <pre>
    // &lt;form name="contactForm" action="/makeContact.jsp"&gt;
    //    &lt;input type="text" name="name"&gt;
    //    &lt;script&gt;isc.DynamicForm.makeInlineItem("title", "comboBox", 
    //                       { valueMap:["CEO", "CTO", "CIO", "COO"] })&lt;/script&gt;
    // &lt;/form&gt;
    // </pre>
    // The value managed by the SmartClient form item is then available for direct DOM access
    // just like ordinary HTML &lt;INPUT&gt; elements, and will be submitted normally with the
    // form.
    // <P>
    // This is an advanced API for use in incremental upgrade of older applications, or for
    // unusual form layouts that can't be accommodated by any combination of
    // +link{group:formLayout,form layout}, +link{ValuesManager} and +link{Layout,H/VLayouts}.
    //
    // @param name (String) name of the form field
    // @param type (String) type of the form field, same as +link{FormItem.type}
    // @param props (FormItem) other properties for the created FormItem
    //
    // @group inlineFormItems
    // @visibility inlineFormItems
    //<
    makeInlineItem : function (name, type, props, formProps) {
        return isc.InlineFormItem.create({
            name: name, 
            type: type,
            formProperties : formProps
        }, props)
    },

    //> @classMethod DynamicForm.getFormValues()
    // Return the values of a native HTML &lt;form&gt; element as JavaScript object.
    // <P>
    // Each property in the returned object represents a native form element value.  Select
    // multiple items are represented as an Array of the selected values.
    //
    // @param formId (String) DOM ID of the form
    // 
    // @group inlineFormItems
    // @visibility inlineFormItems
    //<
    getFormValues : function (formId) {
        return isc.Canvas.getFormValues(formId);
    }

});	


isc.DynamicForm.registerStringMethods({

    //> @method dynamicForm.valuesChanged()
    // Handler fired when the entire set of values is replaced, as by a call to 
    // +link{setValues}, +link{resetValues} or +link{editRecord}.
    // <P>
    // Note that it is invalid to call such methods from this handler because doing so would 
    // result in an infinite loop.
    //
    // @visibility external
    //<
    valuesChanged : "",

    //> @method dynamicForm.itemChanged()
    // Handler fired when there is a changed() event fired on a FormItem within this form.
    // <P>
    // Fires after the change() handler on the FormItem itself, and only if the item did not
    // cancel the change event and chooses to allow it to propagate to the form as a whole. 
    //
    // @param	item	(FormItem)    the FormItem where the change event occurred
    // @param	newValue (Any)    new value for the FormItem
    // @visibility external
    //<
    itemChanged : "item,newValue",

    //> @method dynamicForm.itemChange()
    // Handler fired when there is a change() event fired on a FormItem within this form.
    // <P>
    // Fires after the change() handler on the FormItem itself, and only if the item did not
    // cancel the change event and chooses to allow it to propagate to the form as a whole. 
    //
    // @param	item	(FormItem)    the FormItem where the change event occurred
    // @param	newValue (Any)    new value for the FormItem
    // @param	oldValue (Any)    value the FormItem had previous to this change() event
    // @return (boolean) return false to cancel the change, or true to allow it
    // @visibility external
    //<
    itemChange : "item,newValue,oldValue",

	//>	@method dynamicForm.itemKeyPress()
    // Handler fired when a FormItem within this form receives a keypress event.
    // <P>
    // Fires after the keyPress handler on the FormItem itself, and only if the item did not
    // cancel the event and chooses to allow it to propagate to the form as a whole. 
    // 
    // @param	item	(FormItem)    the FormItem where the change event occurred
    // @param	keyName (KeyName)     name of the key that was pressed (EG: "A", "Space")
    // @param   characterValue  (number)    numeric character value of the pressed key.
    // @return (boolean) return false to cancel the keyPress, or true to allow it
    // 
    // @visibility external
	//<
    itemKeyPress : "item,keyName,characterValue",
    
    //> @method dynamicForm.showItemContextMenu
    // Called when the mouse is right-clicked in some formItem.  If the implementation
    // returns false, default browser behavior is cancelled.
    // <P> 
    // Note that it can be bad practice to cancel this method if the mouse is over the data 
    // element of an item, because doing so would replace the builtin browser-default menus 
    // that users may expect.  You can use +link{dynamicForm.getEventItemInfo} to return an 
    // +link{FormItemEventInfo, info object} that can be used to determine which part of the 
    // item is under the mouse.
    //
    // @param item (FormItem) the form item showing its context menu
    // @return (boolean) return false to cancel default behavior
    // @group eventHandling
    // @visibility external
    //<
    showItemContextMenu : "item",

	//>	@method dynamicForm.submitValues()
    // Triggered when a SubmitItem is included in the form is submitted and gets pressed.
    // 
    // @param	values    (Object)        the form values
    // @param	form      (DynamicForm)   the form being submitted
    // @group submitting
    // @see method:dynamicForm.submit()
    // @visibility external
	//<
    submitValues : "values,form",
    
    //> @method dynamicForm.handleHiddenValidationErrors (A)
    // Method to display validation error messages for fields that are not currently visible 
    // in this form.<br>
    // This will be called when validation fails for<br>
    // - a hidden field in this form<br>
    // - if this form is databound, a datasource field with specified validators, for which we
    //   have no specified form item.<br>
    // Implement this to provide custom validation error handling for these fields.<br>
    // By default hidden validation errors will be logged as warnings in the developerConsole.
    // Return false from this method to suppress that behavior.
    // @param   errors (Object) The set of errors returned - this is an object of the form<br>
    //                      &nbsp;&nbsp;<code>{fieldName:errors}</code><br>
    //                      Where the 'errors' object is either a single string or an array
    //                      of strings containing the error messages for the field.
    // @return (boolean) false from this method to suppress that behavior
    // @visibility external
    //<
    handleHiddenValidationErrors:"errors",
    
    
    //> @method dynamicForm.itemTabIndexUpdated()
    // Notification method fired when the tab index for some item is modified
    // by the system, due to a change in item layout, or a change in the page's structure 
    // (for example as a result of an ancestor being added to a new parent, etc). 
    // <P>
    // This only happens for items with an automatically assigned global tab index
    // (i.e.: cases where an explicit +link{formItem.globalTabIndex} has not been 
    // specified in application code).
    // <P>
    // Use +link{item.getGlobalTabIndex()} to retrieve the new tab index.
    // 
    // @visibility internal
    //<
    // As with canvas.tabIndexUpdated(),
    // Leaving internal for now simply because we don't really have a use case
    // where this is required (though it is useful for internal testing).    
    itemTabIndexUpdated:"item"
});

//> @class HandPlacedForm
// This class is a DynamicForm with the default +link{dynamicForm.itemLayout,itemLayout}
// property set to "absolute".
// <P>
// Another synonym is AbsoluteForm.
// @inheritsFrom DynamicForm
// @treeLocation Client Reference/Forms
// @visibility external
//<
isc.ClassFactory.defineClass("HandPlacedForm", "DynamicForm");

isc.HandPlacedForm.addProperties({
    itemLayout: "absolute",
    height: 100,
    snapVGap: 8,
    snapHGap: 8,
    snapHDirection: isc.Canvas.NEAREST,
    snapVDirection: isc.Canvas.NEAREST
});

isc.ClassFactory.defineClass("AbsoluteForm", "HandPlacedForm");

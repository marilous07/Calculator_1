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
//
//	Comm.serialize() methods for the comm package
//

// XXX this package must not be dependant on the Comm package, because serialization is a useful
// feature completely apart from Comm.  Unfortunately, the methods are currently expected to be on
// the Comm class, so if the Comm class doesn't exist we need to define it.
if (!isc.Comm) isc.ClassFactory.defineClass("Comm");

isc.Comm.addClassProperties( {
    //>	@classAttr	Comm._simpleIdentifierRE (Regex : /^[\$_a-zA-Z][\$\w]*$/ : IR)
    //			Regular expression to match legal identifier names so we can 
    //			 avoid unnecessary quotes when serializing.
    //		@group	serialization
    //<
	_simpleIdentifierRE : 	/^[\$_a-zA-Z][\$\w]*$/,

    //>	@classAttr	Comm.BACKREF_PREFIX (String : "$$BACKREF$$:" : IR)
	//			Prefix for back-references in serialized object references.
	//		@group	serialization
	//<
	BACKREF_PREFIX : "$$BACKREF$$:",	

    indent : "    "

    
});


isc.Comm.addClassMethods({

//>	@classMethod	Comm.serialize()
// Serialize an object of any type into a string, in a form that
// can be simply eval'd to rebuild the original object.
//
//		@group	serialization
//		
//		@param	object		(Any)		object to be serialized
//		@param	[indent]	(boolean)	should output be formatted with line breaks and indenting
//                                      for readability? If unspecified, indenting occurs if
//                                      +link{JSONEncoder.prettyPrint} is true.
//		@return				(String)	serialized form of the object
//<

serialize : function (object, indent) {
    var props = { strictQuoting:false, dateFormat:"logicalDateConstructor"};

    // if indent was explicitly specified, respect it
    if (indent != null) props.prettyPrint = indent;
	return isc.JSON.encode(object, props);
}

});	// END isc.addMethods(isc.Comm, {})

//> @class JSON
// Utilities for working with JSON data.
// 
// @treeLocation Client Reference/Data Binding
// @visibility external
//<
isc.ClassFactory.defineClass("JSON", null, null, true);
isc.JSON.addClassProperties({
//> @classMethod JSON.encode()
// Serialize an object as a JSON string by creating a +link{JSONEncoder} and calling
// +link{JSONEncoder.encode()}.
// <P>
// Note that using the String produced by this API with +link{JSON.decode()} <b>will not
// successfully preserve dates</b>.  Use +link{JSONEncoder.dateFormat} "dateConstructor" or
// "logicalDateConstructor" to have dates round-trip properly.
//
// @param object (Any) object to serialize
// @param [settings] (JSONEncoder Properties) optional settings for encoding
// @return (String) object encoded as a JSON String
// @visibility external
//<
encode : function (object, settings) {
    return isc.JSONEncoder.create(settings).encode(object);    
},

//> @classMethod JSON.decode()
// De-serialize an object from JSON.  Currently, this is simply a JavaScript eval() and should
// be used for trusted data only.
//
// @param jsonString (String) JSON data to be de-serialized
// @return (Object) object derived from JSON String
// @visibility external
//<
decode : function (jsonString) {
    //!OBFUSCATEOK
    // Add parens to the JSON to avoid
    // an issue where eval() gets confused and believes it is dealing with a block
    return eval("(" + jsonString + ")");        
}
});

//> @class JSONEncoder
// Class for encoding objects as JSON strings.  
// @treeLocation Client Reference/Data Binding
// @visibility external
//<
isc.ClassFactory.defineClass("JSONEncoder");
isc.JSONEncoder.addClassProperties({

//>	@classMethod	JSONEncoder._serialize_remember()	(A)
//			Remember an object that has just been serialized, so we don't
//			 attempt to serialize it again (and thus get into an endless loop).
//		@group	serialization
//
//		@param	objRefs	(Array of Object[])	array of objects that have been serialized already so
//		@param	object	(Any)		object to serialize
//		@param	path	(String)	global variable path to this object, for serializing object references
//<
// helper function to remember that we've already output a particular object in this serialize pass

_serialize_remember : function (objRefs, object, path, replace) {
    if (replace) {
        var rowNum = objRefs.obj.fastIndexOf(object);
        
        if (rowNum >= 0) objRefs.path[rowNum] = path;
    } else {
	    if (objRefs && objRefs.obj && objRefs.obj.add) objRefs.obj.add(object);
        if (objRefs && objRefs.path && objRefs.path.add) objRefs.path.add(path);
    }
},

// If this object is a Tree node, automatically clean off properties that the Tree adds to the
// node that should not be saved.

_serialize_cleanNode : function (object) {
    var treeId = object["_isc_tree"];
    if (treeId != null) {
        var theTree = window[treeId];
        if (theTree && theTree.parentProperty && object[theTree.parentProperty]) {
            object = theTree.getCleanNodeData(object);
        }
    }
    return object;
},

// Have we already output a particular object in this serialize pass? If so, return the path to
// that object.
_serialize_alreadyReferenced : function (objRefs, object) {
    var rowNum = objRefs.obj.fastIndexOf(object);
	if (rowNum == -1) return null;
	return objRefs.path[rowNum];
},

// Add a new identifier to an object path, used to build the path passed in to _serialize() above.
_serialize_addToPath : function (objPath, newIdentifier) {
	if (isc.isA.Number(newIdentifier)) {
		return objPath + "[" + newIdentifier + "]";
	} else if (! isc.Comm._simpleIdentifierRE.test(newIdentifier)) {
		return objPath + '["' + newIdentifier + '"]';
	} else {
		return objPath + "." + newIdentifier;
	}
}        
});

isc.JSONEncoder.addProperties({
//> @method JSONEncoder.encode()
// Serialize an object as a JSON string.
// <P>
// Automatically handles circular references - see +link{JSONEncoder.circularReferenceMode}.
// <smartgwt>
// <P>
// Because GWT does not support Java reflection, JSON encoding cannot discover the properties
// of an arbitrary Java POJO.  The following objects are supported:
// <ul> 
// <li> any primitive type (String, Date, Number, Boolean)
// <li> any Map or Collection in any level of nesting
// <li> DataClass (Record's superclass) and RecordList
// <li> any widget (see +link{JSONEncoder.serializeInstances})
// <li> JavaScriptObject
// <li> an Array containing any of the above
// </ul>
// </smartgwt>
// <P>
// Note that using the String produced by this API with +link{JSON.decode()} <b>will not
// successfully preserve dates</b>.  Use +link{JSONEncoder.dateFormat} "dateConstructor" or
// "logicalDateConstructor" to have dates round-trip properly.
//
// @param object (Any) object to serialize
// @return (String) object encoded as a JSON String
// @visibility external
//<
encode : function (object) {
    this.objRefs = {obj:[],path:[]};
    var retVal = this._serialize(object, this.prettyPrint ? this.leadingIndent || "" : null , null);
    this.objRefs = null;
    return retVal
},

//> @type JSONDateFormat
// Format for encoding dates in JSON.  Note you can override +link{JSONEncoder.encodeDate()}
// for a custom format.
//
// @value "xmlSchema" dates are is encoded as a String in <a target=_blank
//        href="http://www.w3.org/TR/xmlschema-2/#dateTime">XML Schema date format</a> in UTC,
//        for example, "2005-08-02" for logical date fields or "2005-08-01T21:35:48.350"
//        for <code>datetime</code> fields. See +link{group:dateFormatAndStorage,Date format and
//        storage} for more information.
// @value "dateConstructor" dates are encoded as raw JavaScript code for creating a Date object,
//        that is:
//        <pre>
//        new Date(1238792738633)
//        </pre>
//        This is not strictly valid JSON, but if eval()d, will result in an identical date object,
//        regardless of timezone.  However, it does not preserve the distinction between
//        logical dates vs full datetime values - use "logicalDateConstructor" mode for that.
// @value "logicalDateConstructor" serializes Date instances in a way that preserves the
//        distinction between logical dates, logical times, and full datetime values, as
//        explained +link{group:dateFormatAndStorage,here}.  Like 'dateConstructor' mode, this
//        does not produce strictly valid JSON, and instead embeds JavaScript calls.  
//        <p>
//        In addition, unlike 'dateConstructor' mode, using eval() to reconstruct the original
//        JavaScript objects will only work in the presence of SmartClient, and not just in a
//        generic JavaScript interpreter.
//
// @visibility external
//<



//> @type JSONInstanceSerializationMode
// Controls the output of the JSONEncoder when instances of SmartClient classes (eg a ListGrid)
// are included in the data to be serialized.
//
// @value "long" instances will be shown as a specially formatted JSON listing the most
//               relevant properties of the instance. Result is not expected to
//               decode()/eval() successfully if instances are included.
// @value "short" instances will be shown in a shorter format via a call to <smartclient>
//                +link{isc.echoLeaf()}</smartclient><smartgwt>
//                {@link com.smartgwt.client.util.SC#echoLeaf SC.echoLeaf()}</smartgwt>.
//                Result is not expected to decode()/eval() successfully if instances are
//                included.
// @value "skip" no output will be shown for instances (as though they were not present in the
//               data).  Result should decode()/eval() successfully (depending on other
//               settings)
//
// @visibility external
//<


//> @attr JSONEncoder.serializeInstances (JSONInstanceSerializationMode : "long" : IR)
// Controls the output of the JSONEncoder when instances of SmartClient classes (eg a ListGrid)
// are included in the data to be serialized.  See +link{JSONInstanceSerializationMode}.
// <P>
// Note that the JSONEncoder does not support a format that will recreate the instance if
// passed to decode() or eval().
//
// @visibility external
//<
serializeInstances: "long",

//> @attr JSONEncoder.skipInternalProperties    (Boolean : false : IR)
// If true, don't show SmartClient internal properties when encoding and object.
// @visibility external
//<

//> @attr JSONEncoder.showDebugOutput (Boolean : false : IR)
// If objects that cannot be serialized to JSON are encountered during serialization, show a
// placeholder rather than just omitting them. 
// <P>
// The resulting String will not be valid JSON and so cannot be decoded/eval()'d
// @visibility external
//<


//> @attr JSONEncoder.dateFormat (JSONDateFormat : "xmlSchema" : IR)
// Format for encoding JavaScript Date values in JSON.  See +link{type:JSONDateFormat} for
// valid options, or override +link{JSONEncoder.encodeDate()} to do something custom.
// @visibility external
//<
dateFormat: "xmlSchema",

//> @method JSONEncoder.encodeDate()
// Encode a JavaScript Date value.
// <P>
// By default, follows the +link{JSONEncoder.dateFormat} setting.  <smartclient>Override to do
// custom encoding.</smartclient><smartgwt>To override the date format, all Dates should be
// converted to Strings beforehand.</smartgwt>
// 
// @param theDate (Date) JavaScript date object to be serialized
// @return (String) value to be included in result.  <b>If this value is intended to appear
//                  as a String it should include quotes (")</b>
//
// @visibility external
//<
encodeDate : function (date) {
    // If we were handed a date from some other window without our extensions on it, 
    // duplicate it.
    if (!date.toSchemaDate) {
        var newDate = new Date(date.getTime());
        // Unlikely to be set for a date picked up from another frame, but respect logical
        // date/time flags if present.
        newDate.logicalDate = this.logicalDate;
        newDate.logicalTime = this.logicalTime;
        date = newDate;
    }
    if (this.dateFormat == "dateConstructor") {
        return date._serialize();
    } else if (this.dateFormat == "logicalDateConstructor") {
        // SC-dependent - uses createLogicalDate/createLogicalTime
        if (date.logicalTime) {
            return "isc.Time.createLogicalTime(" + date.getHours() + ", " + 
                date.getMinutes() + ", " + date.getSeconds() + ", " + date.getMilliseconds() +
                ")";
        } else if (date.logicalDate) {
            return "isc.DateUtil.createLogicalDate(" + date.getFullYear() + ", " + 
                date.getMonth() + ", " + date.getDate() + ")";
        } else {
            return date._serialize();
        }
    } else { // quotes for xml schema
        return '"' + date.toSchemaDate(null, this.trimMilliseconds) + '"';    
    }
},

//> @attr JSONEncoder.escapeNonPrintable (Boolean : true : IRW)
// By default, obscure non-printable characters such as DC3 (Device Control 3, U+0013 hexadecimal)
// will be escaped according to JSON standards. ECMA-404 / The JSON Data Interchange Format
// requires the quotation mark (U+0022), reverse solidus (U+005C), and control characters (U+0000
// through U+001F) to be escaped.
// <p>
// These characters are very rarely used in JSON data in web applications.  If you know that
// your application does not use such characters in JSON data, there can be a performance
// advantage to setting <code>escapeNonPrintable</code> to false in order to disable the
// logic for escaping these characters.  This is a detectable difference only when dealing
// with very large JSON structures on older browsers that do not provide native support (for
// example, Internet Explorer 8).
// @visibility external
//<
escapeNonPrintable: true,

//> @attr JSONEncoder.strictQuoting (Boolean : true : IR)
// Whether all property names should be quoted, or only those property names that are not valid
// identifiers or are JavaScript reserved words (such as "true").
// <P>
// Encoding only where required produces slightly shorter, more readable output which is still
// compatible with JavaScript's eval():
// <pre>
// {
//     someProp : "someValue",
//     "true" : "otherValue",
//     otherProp : "otherValue"
// }
// </pre>
// .. but is not understood by many server-side JSON parser implementations.
// @visibility external
//<  
strictQuoting: true,

//> @type JSONCircularReferenceMode
// What the +link{JSONEncoder} should do when it encounters a circular reference in an object
// structure.
// @value "omit" circular references in Arrays will be represented as a null entry, and objects
//               will have a property with a null value
// @value "marker" leave a string marker, the +link{jsonEncoder.circularReferenceMarker},
//                 wherever a circular reference is found
// @value "path" leave a string marker <i>followed by</i> the path to the first occurrence of
//               the circular reference from the top of the object tree that was serialized.
//               This potentially allows the original object graph to be reconstructed.
// @visibility external
//<

//> @attr JSONEncoder.circularReferenceMode (JSONCircularReferenceMode : "path" : IR)
// What the JSONEncoder should do if it encounters a circular reference.
//
// @visibility external
//<
circularReferenceMode: "path",

//> @attr JSONEncoder.circularReferenceMarker (String : "$$BACKREF$$" : IR)
// The string marker used to represent circular references.  See +link{circularReferenceMode}.
//
// @visibility external
//<
circularReferenceMarker: "$$BACKREF$$",

//> @attr JSONEncoder.prettyPrint (Boolean : true : IR)
// Whether to add indentation to the returned JSON string.  This makes the returned JSON much
// easier to read but adds size.  Note that when delivering JSON responses compressed, the size
// difference between prettyPrinted JSON and normal JSON is negligible.
// @visibility external
//<
prettyPrint: true,

//>	@method	JSONEncoder._serialize()	(A)
//		Internal routine that actually does the serialization.
//		@group	serialization
//
//		@param	object	(Any)		object to serialize
//		@param	prefix	(String)	string to put before each line of serialization output
//		@param	context (Object)	context that tracks previously encountered objects and
//                                  settings
//
//		@return	(String)			serialized object as a string
//<
_serialize : function (object, prefix, objPath) {	

    // Avoid attempting to manipulate SGWT Java objects
    if (isc.Browser.isSGWT && window.SmartGWT.isNativeJavaObject(object)){
        
        if (object == null) object = null;
        // If the global flag has been set to warn when we hit an unconvertible
        // object, do this.
        else {
            if (window.SmartGWT.warnOnSerializeError) {
                window.SmartGWT.throwUnconvertibleObjectException(
                    object, window.SmartGWT.serializeErrorMessage 
                );
            }
            object = String.asSource(object + "");
        }
        return object;
    }

    //if (this.autoDupMethods) this.duplicateMethod("_serialize");

    if (!objPath) {
        if (object && isc.isA.Function(object.getID)) objPath = object.getID();
        else objPath = "";
    }
	
	if (object == null) return null;

	// handle simple types
    // call the static version of the same method if this happens.
    if (isc.isA.String(object)) {
        if (this.escapeNonPrintable) {
            return String.asJSONString(object);

        // In Safari a cross-frame scripting bug means that the 'asSource' method may not always be
        // available as an instance method.
        } else {
            return object.asSource != null ? object.asSource() : String.asSource(object);
        }
    }
	if (isc.isA.Function(object)) return null;
	if (isc.isA.Number(object) || isc.isA.SpecialNumber(object)) return object;
	if (isc.isA.Boolean(object)) return object;
	if (isc.isA.Date(object)) return this.encodeDate(object);

    // handle instances (and class objects)
    if (isc.isAn.Instance(object) || isc.isA.Class(object)) {
        if (this.serializeInstances == "skip") return null;
        else if (this.serializeInstances == "short") return isc.echoLeaf(object);
        // else "long".. fall through to logic below to have properties output
    }
	
	// for complex types:
	// detect infinite loops by checking if we've seen this object before.
    // To disambiguate between true loops vs the same leaf object being encountered twice
    // (such as a simple Array containing two Strings which appears in two spots).  Only
    // consider this a loop if the preceding occurrence of the object was some parent of
    // ours.  
	var prevPath = isc.JSONEncoder._serialize_alreadyReferenced(this.objRefs, object);
    
	if (prevPath != null && objPath.contains(prevPath)) {
        
        // Note: check that the first char after "prevPath" is a path separator char in order
        // to avoid false loop detection with "prop" and "prop2" having the same non-looping
        // object (since "prop2" contains "prop").
        var nextChar = objPath.substring(prevPath.length, prevPath.length+1);
        //this.logWarn("backref: prevPath: " + prevPath + ", current: " + context.objPath +
        //             ", char after prevPath: " + nextChar);
        if (nextChar == "." || nextChar == "[" || nextChar == "]") {
            var mode = this.circularReferenceMode;
            if (mode == "marker") {
                return "'" + this.circularReferenceMarker + "'";    
            } else if (mode == "path") {
                return  "'" + this.circularReferenceMarker + ":" + prevPath + "'";   
            } else {
                return null;    
            }
        }
	}

    if (object == window) {
        this.logWarn("Serializer encountered the window object at path: " + objPath
                    +" - returning null for this slot.");
        return null;
    }

	// add the object to the list of objRefs so we can avoid an endless loop, only if it is
	// not already there
    isc.JSONEncoder._serialize_remember(this.objRefs, object, objPath, prevPath != null);
	
	// if there is a serialize method associated with this object, call that
	if (isc.isA.Function(object._serialize)) {
        return object._serialize(prefix, this.objRefs, objPath, prefix);
    }

	// handle arrays as a special case
	if (isc.isAn.Array(object))	{
        return this._serializeArray(object, objPath, this.objRefs, prefix);
    }

    var data;
	// if the object has a getSerializeableFields, use whatever it returns, otherwise just use
    // the object
    if (object.getSerializeableFields) {
        
		data = object.getSerializeableFields([], []);
    } else {
        data = object;
    }
	// and return anything else as a simple object
	return this._serializeObject(data, objPath, this.objRefs, prefix);
},

//>	@method	JSONEncoder._serializeArray()	(A)
//			Internal routine to serialize an array.
//		@group	serialization
//
//		@param	object	(Any)		object o serialize
//		@param	objPath	(String)	global variable path to this object, for serializing object references
//		@param	objRefs	(Array of Object[])	array of objects that have been serialized already so
//									 we don't get into endless loops		
//		@param	prefix	(String)	string to put before each line of serialization output 
//
//		@return	(String)			serialized object as a string
//<
_serializeArray : function (object, objPath, objRefs, prefix) {
	// add the start array marker
	var output = isc.SB.create();
    output.append("[");
	// for each element in the array
	for (var i = 0, len = object.length; i < len; i++) {
		var value = object[i];
		// output that element
        if (prefix != null) output.append("\n", prefix, isc.Comm.indent);

        var valueObjPath = isc.JSONEncoder._serialize_addToPath(objPath, i);
        var serializedValue =  
            this._serialize(value,
                                (prefix != null ? prefix + isc.Comm.indent : null), 
                                valueObjPath);
        // NOTE: need to concat serializedValue to have null/undef properly handled, normally
        // skipped by StringBuffers
        output.append(serializedValue + ",");
        if (prefix != null) output.append(" ");
	}
	// get rid of the trailing comma, if any
    output = output.release(false);
	var commaChar = output.lastIndexOf(",");
	if (commaChar > -1) output = output.substring(0, commaChar);

	// add the end array marker
    if (prefix != null) output += "\n" + prefix;
    output += "]";

	// and return the output
	return output;	
},

//>	@method	JSONEncoder._serializeObject()	(A)
//			Internal routine to serialize an object.
//		@group	serialization
//
//		@param	object	(Any)		object o serialize
//		@param	prefix	(String)	string to put before each line of serialization output
//		@param	objRefs	(Array of Object[])	array of objects that have been serialized already so
//									 we don't get into endless loops		
//		@param	objPath	(String)	global variable path to this object, for serializing object references
//
//		@return	(String)			serialized object as a string
//<
_serializeObject : function (object, objPath, objRefs, prefix) {
	// add the start object marker
	var output = isc.SB.create(),
        undef;

    object = isc.JSONEncoder._serialize_cleanNode(object);

    try {
        
    	for (var key in object) break;
    } catch (e) {
        if (this.showDebugOutput) {
            if (isc.isAn.XMLNode(object)) return isc.echoLeaf(object);

            var message;
            if (e.message) {
	            message = (e.message.asSource != null ? e.message.asSource() 
                                                      : String.asSource(e.message));
                return "{ cantEchoObject: " + message + "}";
            } else {
                return "{ cantEchoObject: 'unspecified error' }";
            }
        } else return null;
    }

    output.append("{");
	// for each key in the object
	for (var key in object) {
		// skip null keys
		if (key == null) continue;
        // skip internal properties, if the flag is set
		if (this.skipInternalProperties && (isc.startsWith(key, isc._underscore) || isc.startsWith(key, isc._dollar))) continue;
		var value = object[key];

		// if the value is a function, skip it		
		if (isc.isA.Function(value)) continue;

        // we don't want to access attributes of the object if it's a Java object
        var isJavaObj = isc.Browser.isSGWT ? window.SmartGWT.isNativeJavaObject(value) : false;
        // omit instances entirely if so configured
        
        if (key != isc.gwtRef && !isJavaObj && isc.isAn.Instance(value) && this.serializeInstances == "skip") continue;

		// otherwise return the key:value pair

		// convert the key to a string
		var keyStr = key.toString();
		// and if it isn't a simple identifier, quote it
        if (this.strictQuoting || !isc.Comm._simpleIdentifierRE.test(keyStr)) {
            if (keyStr.contains('"')) {
                keyStr = '"' + this.convertToEncodedQuotes(keyStr) + '"';
            } else {
                keyStr = '"' + keyStr + '"';
            }
        }
    
        var otherObjPath = isc.JSONEncoder._serialize_addToPath(objPath, key);
        var serializedValue;

        if (key == isc.gwtRef) {
            // don't try to serialize references to GWT Java objects
            if (!this.showDebugOutput) continue;
            // show a marker if asked for debug output
            
            serializedValue = String.asSource("{GWT Java Obj}");
        // We could return the string value via an implicit toString using "" + value
        // but this won't eval successfully
        } else if (key == isc.gwtModule) {
            if (!this.showDebugOutput) continue;
            serializedValue = String.asSource("{GWT Module}");
        } else if (isJavaObj) {
            serializedValue = (value == null ? null : String.asSource(value + ""));
        
        } else {
            serializedValue = 
                this._serialize(value, 
                                    (prefix != null ? prefix + isc.Comm.indent : null),
                                    otherObjPath);
        }

        // skip values that resolve to undefined
        //if (serializedValue === undef) {
        //    continue;
        //}

		// now output the key : value pair
        if (prefix != null) output.append("\n", prefix, isc.Comm.indent);

        // NOTE: need to concat serializedValue to have null/undef properly handled, normally
        // skipped by StringBuffers
		output.append(keyStr, ":" + serializedValue, ",");
    
        if (prefix != null) output.append(" ");
	}
	// get rid of the trailing comma, if any
    output = output.release(false);
	var commaChar = output.lastIndexOf(",");
	if (commaChar > -1) output = output.substring(0, commaChar);

	// add the end object marker
    if (prefix != null) output += "\n" + prefix;
    output += "}";

	// and return the output
	return output;
},

// Converts a string so that embedded ' and " characters are converted to the HTML encodings
// &apos; and &quot;  Only used if a key string contains both ' and " (otherwise, we just 
// quote it using the symbol that isn't contained in the key name)
convertToEncodedQuotes : function (string) {
    return string.replace(String._doubleQuoteRegex, "&quot;").
                  replace(String._singleQuoteRegex, "&apos;");
},
convertFromEncodedQuotes : function (string) {
    return string.replace(new RegExp("&quot;", "g"), '"').
                  replace(new RegExp("&apos;", "g"), "'");
}
});

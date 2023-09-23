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
//>	@object	Array
// Generic extensions to JavaScript Arrays.  You can call these on any Array.
// <P>
// JavaScript's native Array is retrofitted to support the <code>List</code> API.
//
// @implements List
// @see List
// @treeLocation Client Reference/System
// @visibility external
//<

// Internal notes: Array vs the List interface
// - List is an interface which the native JavaScript Array object is retrofitted to implement
// - When a given method can be implemented solely in terms of other parts of the List interface,
//   there is the possibility that Array and the List interface can share the actual JavaScript
//   function object.  When this is done, the method is first defined on Array (for load order
//   reasons).
// - on Array, several methods can be faster if they use various native functions (like splice()),
//   and so a unique implementation appears here
// - on List, in order to allow a valid List implementation with a minimum of effort, all methods
//   boil down to very simple primitives like addAt

// - public documentation for the List interface is in List.js

//> @groupDef dataChanged
// Operations that change the Array
// @title Data Changes
//<

//> @groupDef iteration
// Operations on entire Arrays at once
// @title Iteration
//<

//> @groupDef arrayMath
// Math operations on entire Arrays at once
// @title Array Math
//<

// add a "Class" property to the array prototype
//	so we can recognize Array instances
Array.prototype.Class = "Array";

//>	@classMethod		Array.newInstance()
//		Create a new array, adding any arguments passed in as properties.
//		Here so we can make standard newInstance() calls on arrays.
//
//		@param	[all arguments]	(Object)	objects with properties to override from default
//		@return	(Array)	new array.
//<
Array.newInstance = function () {
	var instance = [];
	isc.addPropertyList(instance, arguments);
	return instance;
}
Array.create = Array.newInstance;

//> @classMethod Array.duplicate()
// Return an array that is a shallow copy of the supplied array, that is, containing the same
// items.
//
// @param array (Array) array to duplicate
// @return      (Array) new array
//<
Array.duplicate = function (array) {
    return isc._emptyArray.concat(array);
},

//> @classMethod Array.createFromItemArgs()
// Return a new array consisting of the provided arguments as array items.
//
// @param [arguments 1-N] (Object) objects to add as items of the new array
// @return (Array) new array
//<
Array.createFromItemArgs = function () {
    return Array.prototype.slice.call(arguments);
},

//> @classAttr Array.LOADING (String : "loading" : IRA)
// Marker value returned by Lists that manage remote datasets, indicating the requested data is
// being loaded. Note that the recommended test for loading data is to call +link{Array.isLoading()}
// rather than compare to this value directly.
// @visibility external
//<

Array.LOADING = "loading";

//> @classMethod Array.isLoading() (A)
// Is the object passed in a loading marker value? For use with Lists that manage remote
// datasets, to indicate that a record has not yet been retrieved from the server. A typical
// use case might be to check if a row has been loaded in a ListGrid - for example:
// <P>
// <code>
// if (Array.isLoading(myList.getRecord(0))) isc.warn("Please wait for the data to load.");
// </code>
// @param value (Any) data to test. 
// @visibility external
//<
Array.isLoading = function (row) {
    
    return row != null &&
            
            !isc.isAn.XMLNode(row) &&
            
            (row === Array.LOADING);
}

//> @classAttr Array.CASE_INSENSITIVE (Function : See below : R)
// This is a built-in comparator for the +link{array.find,find} and +link{array.findIndex,findIndex}
// methods of Array.  Passing this comparator to those methods will find case-insensitively,
// so, eg, <code>find("foo", "bar")</code> would find objects with a "foo" property set to 
// "Bar", "BAR" or "bar"
// @visibility external
//<
Array.CASE_INSENSITIVE = function(arrayMemberProperty, comparisonProperty, propertyName) {
    return (
        arrayMemberProperty == comparisonProperty ||
        (isc.isA.String(arrayMemberProperty) &&
         isc.isA.String(comparisonProperty) &&
         arrayMemberProperty.toLowerCase() == comparisonProperty.toLowerCase()));
};

//> @classAttr Array.DATE_VALUES (Function : See below : R)
// This is a built-in comparator for the +link{array.find,find} and +link{array.findIndex,findIndex}
// methods of Array.  Passing this comparator to those methods will find instances where Dates  
// in the search criteria match Dates in the array members (ordinarily, Javascript only regards
// Dates as equal if they refer to the exact same object).  This comparator compares <i>logical</i>
// dates; the time elements of the values being compared are ignored, so two Dates representing
// different times on the same day will be considered equal.
// @see Array.DATETIME_VALUES
// @visibility external
//<
Array.DATE_VALUES = function(arrayMemberProperty, comparisonProperty, propertyName) {
    return (
        arrayMemberProperty == comparisonProperty ||
        (isc.isA.Date(arrayMemberProperty) &&
         isc.isA.Date(comparisonProperty) &&
         isc.DateUtil.compareLogicalDates(arrayMemberProperty, comparisonProperty) == 0));
};

//> @classAttr Array.DATETIME_VALUES (Function : See below : R)
// This is a built-in comparator for the +link{array.find,find} and +link{array.findIndex,findIndex}
// methods of Array.  Passing this comparator to those methods will find instances where Dates  
// in the search criteria match Dates in the array members (ordinarily, Javascript only regards
// Dates as equal if they refer to the exact same object).  This comparator compares entire
// date values, including the time elements of the values being compared, so two Dates
// representing different times on the same day (even if they are only a millisecond apart)
// will not be considered equal.
// @see Array.DATE_VALUES
// @visibility external
//<
Array.DATETIME_VALUES = function (arrayMemberProperty, comparisonProperty, propertyName) {
    
    return (
        arrayMemberProperty == comparisonProperty ||
        (isc.isA.Date(arrayMemberProperty) &&
         isc.isA.Date(comparisonProperty) &&
         isc.DateUtil.compareDates(arrayMemberProperty, comparisonProperty) == 0));
};


if (!Array.prototype.localeStringFormatter) 
    Array.prototype.localeStringFormatter = "toString";

//> @classAttr Array.excludeFromSortProperty (String : "_excludeFromSort" : IRA)
// If this property is set on a record, calling +link{Array.add} won't trigger
// a sort even if +link{Array.sortProps} are set.
//<
Array.excludeFromSortProperty = "_excludeFromSort";

// add a bunch of methods to the Array prototype so all arrays can use them
isc.addMethods(Array.prototype, {

iscToLocaleString : function () {
	return this[this.localeStringFormatter]();
},

//>	@method		array.getPrototype()
//		Return the Array.prototype -- for conformity with the Class.getPrototype() method
//		Used in exporting arrays.
//<
getPrototype : function () {
	return Array.prototype;
},


//>	@method		array.newInstance()
//		Create a new array, adding any arguments passed in as properties.
//		Here so we can make standard newInstance() calls on arrays.
//
//		@param	[all arguments]	(Object)	objects with properties to override from default
//		@return	(Array)	new array.
//<
newInstance : Array.newInstance,
create : Array.newInstance,

// List Interface
// --------------------------------------------------------------------------------------------

//>	@method		array.get()
// @include list.get()
//<
get : function (pos) {
	return this[pos]
},

//>	@method		array.getLength()
// @include list.getLength()
//<
getLength : function () {
	return this.length
},

//>	@method		array.isEmpty()
// @include list.isEmpty()
//<
// NOTE: implementation stolen by List interface.  Must use only List API for internal access.
isEmpty : function () {
	return this.getLength() == 0;
},

//>	@method		array.first()
// @include list.first()
//<
first : function () {
	return this[0]
},

//>	@method		array.last()
// @include list.last()
//<
last : function () {
	return this[this.length-1]
},

nativeIndexOf : Array.prototype.indexOf,

//>	@method		array.indexOf()
// @include list.indexOf()
//<

indexOf : function (obj, pos, endPos, comparator) {

    var OBJ = Object(this),
        length = OBJ.length >>> 0;

    // normalize position to the start of the list
    if (pos == null) pos = 0;
    else if (pos < 0) pos = Math.max(0, length + pos);
    if (endPos == null) endPos = length - 1;

    var hasComparator = (comparator != null);
    for (var i = pos; i <= endPos; i++) {
        if (hasComparator ? comparator(OBJ[i], obj) : OBJ[i] == obj) {
            return i;
        }
    }

	// not found -- return the not found flag
	return -1;
}, 


fastIndexOf : function (obj, pos, endPos) {
    // normalize position to the start of the list
    if (pos == null) pos = 0;
    if (endPos == null) endPos = this.length - 1;

    for (var i = pos; i <= endPos; i++) {
        if (this[i] == obj) {
            return i;
        }
    }

    // not found -- return the not found flag
    return -1;
},

nativeLastIndexOf : Array.prototype.lastIndexOf,

//>	@method		array.lastIndexOf()
// @include list.lastIndexOf()
//<

lastIndexOf : function (obj, pos, endPos, comparator) {
    var OBJ = Object(this),
        length = OBJ.length >>> 0;

    // normalize position to the end of the list
    if (pos == null) pos = length - 1;
    else if (pos < 0) {
        pos = length + pos;
        if (pos < 0) return -1;
    }
    if (endPos == null) endPos = 0;

    var hasComparator = (comparator != null);
    for (var i = pos; i >= endPos; i--) {
        if (hasComparator ? comparator(OBJ[i], obj) : OBJ[i] == obj) {
            return i;
        }
    }

	// not found -- return the not found flag
    return -1;
},

//>	@method		array.contains()
// @include list.contains()
//<
// NOTE: implementation stolen by List interface.  Must use only List API for internal access.
contains : function (obj, pos, comparator) {
	return (this.indexOf(obj, pos, null, comparator) != -1);
},

_containsDuplicates : function (comparator) {
    for (var i = 0, len = this.length; i < len - 1; ++i) {
        var obj = this[i];
        if (this.contains(obj, i + 1, comparator)) return true;
    }
    return false;
},

removeDuplicates : function () {
    for (var i = 0, len = this.length; i < len - 1; ++i) {
        var obj = this[i];
        if (obj == null) continue;
        var nextIndex = this.indexOf(obj, i+1);
        while (nextIndex != -1) {
            this.removeAt(nextIndex);
            nextIndex = this.indexOf(obj, nextIndex);
        }
    }


},

// helper method for doing a substring search

containsSubstring : function (obj, startPos, endPos, ignoreCase, matchStyle) {
    if (obj == null) return true;
    if (matchStyle == null) matchStyle = "substring";
    var result = this.indexOf(obj, startPos, endPos, function (a, b) {
        var filter = b == null ? null : (isc.isA.String(b) ? b : b.toString()),
            value = a == null ? null : (isc.isA.String(a) ? a : a.toString())
        ;
        if (ignoreCase) {
            if (filter != null) filter = filter.toLowerCase();
            if (value != null) value = value.toLowerCase();
        }
        var r = false;
        if (value != null && filter != null) {
            if (value == filter) {
                r = true;
            } else if (matchStyle == "substring" && 
                                        value && value.contains && value.contains(filter))
            {
                r = true;
            } else if (matchStyle == "startsWith" && 
                                        value && value.startsWith && value.startsWith(filter))
            {
                r = true;
            }
        }
        return r;
    });

	return result >= 0;
},

//> @method     array.containsAll()
// @include list.containsAll()
//<
// NOTE: implementation stolen by List interface.  Must use only List API for internal access.
containsAll : function (list) {
    if (list == null) return true;
    var length = list.getLength();
    for (var i = 0; i < length; i++) {
        if (!this.contains(list.get(i))) return false;
    }
    return true;
},

// string-based method - substring search - returns true if all of the values from the passed 
// list appear somewhere in the contents of the values in this list 
containsAllSubstring : function (list, ignoreCase) {
    if (list == null) return true;
    var length = list.getLength();
    for (var i = 0; i < length; i++) {
        if (!this.containsSubstring(list.get(i), null, null, ignoreCase)) return false;
    }
    return true;
},

//>	@method		array.intersect()
// @include list.intersect()
//<
// NOTE: implementation stolen by List interface.  Must use only List API for internal access.
intersect : function () {
	var results = [];

	// for each element in this array
	for (var i = 0; i < this.length; i++) {
		// if the element is in each argument, add it to the results
		var item = this.get(i),
			isPresent = true;

		// skip null elements
		if (item == null) continue;

		// for each array passed in
		for (var a = 0; a < arguments.length; a++) {
			// if the item is not in that array
			if (!arguments[a].contains(item)) {
				// it hasn't been found
				isPresent = false;
				break;
			}
		}
		if (isPresent) results.add(item);
	}

	// return true
	return results;
},

// variant of intersect that specifically deals with arrays of dates, which need to be compared
// with compareDates() and compareLogicalDates()
intersectDates : function () {
	var results = [];

	// for each element in this array
	for (var i = 0; i < this.length; i++) {
		// if the element is in each argument, add it to the results
		var item = this.get(i),
			isPresent = true
        ;

		// skip null elements
		if (item == null) continue;

        var logicalDate = item.logicalDate;

            // for each array passed in
		for (var a = 0; a < arguments.length; a++) {
            var otherArray = arguments[a];
            var inOtherArray = false;
            if (!otherArray) continue;
            for (var b = 0; b < otherArray.length; b++) {
                var otherItem = otherArray[b];
                if (!otherItem) continue;
                if (logicalDate) {
                    if (isc.DateUtil.compareLogicalDates(item, otherItem) == 0) {
                        inOtherArray = true;
                        break;
                    }
                } else {
                    if (isc.DateUtil.compareDates(item, otherItem) == 0) {
                        inOtherArray = true;
                        break;
                    }
                }
			}
            if (!inOtherArray) {
                isPresent = false;
                break;
            }
		}
		if (isPresent) results.add(item);
	}

	return results;
},

// variant of intersect that compares arrays of values as strings - returns entries from this
// array that appear as a substring of at least one entry in each of the passed arrays

_intersectSubstringIgnoreCase: true,
intersectSubstring : function (lists, ignoreCase, matchStyle) {
    // If the "lists" param is not a list of lists, make it one
    if (!isc.isAn.Array(lists)) lists = [lists];
    if (!isc.isAn.Array(lists[0])) lists =[lists];
	var results = [];
    if (ignoreCase == null) ignoreCase = this._intersectSubstringIgnoreCase;
    ;

	// for each element in this array
	for (var i = 0; i < this.length; i++) {
		// if the element is in each argument, add it to the results
		var item = this.get(i),
			isPresent = true;

		// skip null elements
		if (!item) continue;

		// for each array passed in
		for (var a = 0; a < lists.length; a++) {
            var otherArray = lists[a];
            if (!otherArray) continue;

            // match if any of the elements in the passed array contains "item" as a substring
            if (!otherArray.containsSubstring(item, null, null, ignoreCase, matchStyle)) {
                isPresent = false;
                break;
            }
		}
		if (isPresent) results.add(item);
	}

	// return true
	return results;
},

//>	@method		array.equals()
// @include list.equals()
//<
// NOTE: implementation stolen by List interface.  Must use only List API for internal access.
equals : function (list) {
    if (list == null || !isc.isA.List(list)) return false;
    
    var length = list.getLength();

    // arrays of differing lengths cannot be equals
    if (length != this.getLength()) return false;

    for (var i = 0; i < length; i++) {
        if (list.get(i) != this.get(i)) return false;
    }
    return true;
},

//>	@method		array.getItems()
// @include list.getItems()
//<
// NOTE: implementation stolen by List interface.  Must use only List API for internal access.
getItems : function (itemList) {
    var length = itemList.getLength(),
        outputs = new Array(length);
    for (var i = 0; i < length; ++i) {
        outputs[i] = this.get(itemList.get(i));
    }
    return outputs;
},

//>	@method		array.getRange()
// @include list.getRange()
//<
getRange : function (start, end) {
    if (end == null) end = this.length - 1;
	return this.slice(start, end);
},

//>	@method		array.duplicate()	(A)
// @include list.duplicate()
//<

duplicate : function () {
	return isc._emptyArray.concat(this); // NOTE: concat creates a copy
},

// getData() from list - no analogous method

//>	@method		array.set()	
// @include list.set()
//<
set : function (pos, item) {
    var result = this[pos];
    this[pos] = item;
    this.dataChanged();
    return result;
},

//>	@method		array.addAt()
// @include list.addAt()
//<
addAt : function (obj, pos) {
    if (pos == null) pos = 0;

    this.splice(pos, 0, obj);

	// call dataChanged in case anyone is observing it
	this.dataChanged();

    // return the object that was added
    return obj;
},

//>	@method		array.removeAt()
// @include list.removeAt()
//<
removeAt : function (pos) {
	// make sure the pos passed in is valid
	var length = this.length;
	if (pos >= length || pos < 0) return null;

    var removedList = this.splice(pos, 1);

	// call dataChanged in case anyone is observing it
	this.dataChanged();

    return removedList[0];
},

//>	@method		array.add()
// @include list.add()
//<
add : function (object, secondArg, disallowSortingOnLoadingMarker) {
    var undef;
    if (secondArg !== undef) {
        // support calling as add(index, object)
        return this.addAt(object, secondArg);
    }
	var pos;
	// if the list.sortUnique is true, we're only supposed to have each item once
	if (this.sortUnique) {
		// find the current position of the item in the list
		pos = this.indexOf(object);
		// if it wasn't found, put it at the end
		if (pos == -1) pos = this.length;
	} else {
		// otherwise we always put the item at the end
		pos = this.length;
	}
	// actually stick the object in the list
	this[pos] = object;

    // if we are currently sorted, maintain current sort
    
    if (!this._addListRunning) {
        if (this.sortProps && this.sortProps.length > 0 && 
            (object == null || !object[Array.excludeFromSortProperty])) 
        {
            
            this.sortByProperties(
                this.sortProps, this.sortDirections, this.sortNormalizers, undef, undef,
                false, disallowSortingOnLoadingMarker);
        }

        // call dataChanged in case anyone is observing it
        this.dataChanged();
    }
	
	// return the object that was added
	return object;
},

//>	@method		array.addList()
// @include list.addList()
//<
// NOTE: implementation stolen by List interface.  Must use only List API for internal access.
addList : function (list, listStartRow, listEndRow) {
    if (list == null) return null;

	this._startChangingData();
	
	if (listStartRow == null) listStartRow = 0;
	if (listEndRow == null) listEndRow = list.getLength();

    var recursive = this._addListRunning;
    this._addListRunning = true;
    var mustResort = false;
	for (var pos = listStartRow; pos < listEndRow; pos++) {
        var object = list.get(pos)
		this.add(object);
        if (object != null && !object[Array.excludeFromSortProperty]) mustResort = true;
	}
    if (!recursive) delete this._addListRunning;
    
    if (this.sortProps && this.sortProps.length > 0 && mustResort) {
        
        var undef;
        this.sortByProperties(
            this.sortProps,
            this.sortDirections,
            this.sortNormalizers,
            undef,
            undef,
            false
        );
    }

	this._doneChangingData();

	// return the objects that were added
	return list;
},

//>	@method		array.setLength()
// @include list.setLength()
//<
setLength : function (length) {
	this.length = length;
},

//>	@method		array.addListAt()
// @include list.addListAt()
//<

addListAt : function (list, pos) {
    if (list == null) return null;

    // extract the tail of this array, from pos through the end
    var tail = this.splice(pos, this.length - pos);

    // add the new items in list
    if (isc.isAn.Array(list)) {
        list.forEach(function(value, index) {this[pos + index] = value;}, this);
    } else {
        for (var i = 0; i < list.getLength(); i++) this[pos + i] = list.get(i);
    }        

    // add back the tail
    var tailPos = pos + list.getLength();
    tail.forEach(function(value, index) {this[tailPos + index] = value;}, this);

	// call dataChanged in case anyone is observing it
	this.dataChanged();

    // return the list that was added
    return list;
}, 


//>	@method		array.remove()
// @include list.remove()
//<
remove : function (obj) {
    

    var index = this.indexOf(obj);
    if (index == -1) return false;

    this.removeAt(index);
    // removeAt() calls dataChanged().

    return true; // indicating object was removed, per java.util.Collection
},

//>	@method		array.removeList()
// @include list.removeList()
//<
removeList : function (list) {
    if (list == null) return null;

	// run through all the items, putting things we want to retain into new list output
	for (var output = [], i = 0, l = this.length;i < l;i++) {
		if (!list.contains(this[i])) output.add(this[i]);
    }
	// now set the items in this list to the items in output
	this.setArray(output);

	// return the list that was removed
	return list;
}, 

// useful in chaining expressions eg someList.removeEvery(null).getProperty(...)
// .. removeList/removeAll don't work in this circumstance
removeEvery : function (value) {
    this.removeList([value]);
    return this;
},

// methods to ensure dataChanged() fired only once when a series of changes are made: see List.js
_startChangingData : function () {
    var undef;
	if (this._dataChangeFlag === undef) this._dataChangeFlag = 0;
	this._dataChangeFlag++;
},

_doneChangingData : function () {
	if (--this._dataChangeFlag == 0) this.dataChanged();
},

//>	@method		array.dataChanged()	(A)
// @include list.dataChanged()
//<
dataChanged : function () {
    
    if (this.onDataChanged) this.onDataChanged()
},

// In some cases we want to perform a one-liner - call dataChanged unless we're inside a data
// changing loop
_isChangingData : function () {
    return (this._dataChangeFlag != null && this._dataChangeFlag > 0); 
},

// End of List API
// --------------------------------------------------------------------------------------------

//>	@method		array.setArray()
// Completely change the contents of one array to the contents of another array.
// <P>
// This is useful if you have an external pointer to an array, but you want to change its
// contents, such as when you remove some items from the array.
//
//		@group	dataChanged
//
//		@param	(Array)		array to set this array to
//<

setArray : function (list) {
    this.setLength(0);

	// fill slots
    if (isc.isAn.Array(list)) {
        list.forEach(function(value, index) {this[index] = value;}, this);
    } else {
        for (var i = 0; i < list.getLength(); i++) this[i] = list.get(i);
    }        

	// call dataChanged in case someone is observing data in the list
	this.dataChanged();
},

//>	@method		array.addAsList()
// Add either a single object or a list of items to this array.
//
//      @group  dataChanged
//
//      @param  list  (Array | Object)  a single object or a list of items to add
//
//      @return       (List)            list of items that were added
//<
addAsList : function (list) {
	if (!isc.isAn.Array(list)) list = [list];
	// return the objects that were added
	return this.addList(list);
},

//>	@method		array.removeRange()
// Remove and return a range of elements from an array - same return value as array.slice(),
// but removes the slice from the array
//
//		@group	dataChanged
//
//		@param	startPos	(number)	start position of range to remove
//      @param  endPos      (number)    end position of range to remove
//
//      @return (Array) array of items that were removed
//<
removeRange : function (startPos, endPos) {
    // fall through to splice
    var undef;
    if (startPos === undef) return this;    // no arguments
    if (!isc.isA.Number(startPos)) startPos = 0;
    if (!isc.isA.Number(endPos)) endPos = this.length;
    return this.splice(startPos, endPos - startPos);
}, 


//>	@method		array.removeWhere()
//			Remove all instances of object from this array
//		@group	dataChanged
//
//		@param	property	(String)	property to look for
//		@param	value		(String)	value to look for
//<
// If "property" is passed in as an object, and we have no value
// argument, treat it as a mask to match
removeWhere : function (property, value) {
    return this._removeWhere(property, value, true);
},
_removeWhere : function (property, value, dropMatches) {
    var mask;
    if (isc.isA.Object(property)) {
        var undef;
        //>DEBUG
        if (value !== undef) {
            isc.logWarn("removeWhere() passed an object as the 'property' parameter" +
                " AND a non-null value parameter. Ignoring value parameter");
        }
        //<DEBUG
        mask = property;
    } else {
        mask = {};
        mask[property] = value;
    }
	for (var i = 0, newList = []; i < this.length; i++) {
        var item = this[i];
        
        if (item == null) {
            if (dropMatches) newList.add(item);
        } else {
            var isMatch= true;
            for (var attribute in mask) {
                var attrVal = mask[attribute];
                if (item[attribute] != attrVal) {
                    isMatch = false;
                    break;
                }
            }
            // If dropMatches is true, and we don't have a match, or
            // dropMatches is false and we do have a match, we want to
            // keep the item
            if (isMatch != dropMatches) {
                newList.add(item);
            }
        }
    }
	this.setArray(newList);
    return this;
}, 

// Corollary to removeWhere - remove every item where some property is not set to some
// specified value.
removeUnless : function (property, value) {
    return this._removeWhere(property, value, false);
},

//>	@method		array.removeEmpty()
//			Remove all empty slots in this array (where array[n] == null)
//		@group	dataChanged
//<
removeEmpty : function (property, value) {
	for (var i = 0, newList = []; i < this.length; i++) {
		if (this[i] != null) {
			newList.add(this[i]);
		}
	}
	this.setArray(newList);
}, 

//> @method array.getProperty()
// @include list.getProperty
// @visibility external
//<
getProperty : function (property) {
    var output = new Array(this.length);
    for (var i = this.length; i--; ) {
        var entry = this[i];
        output[i] = (entry ? entry[property] : null);
    }
    return output;
},

//>@method array.getValueMap()
// @include list.getValueMap()
// @visibility external
//<
getValueMap : function (idField, displayField) {
    var valueMap = {},
        length = this.getLength()
    ;
    if (isc.isA.ResultSet(this) && !this.lengthIsKnown() && this.initialData) {
		// if this is a ResultSet of unknown length but with initialData, use the length of 
        // the initialData - see similar code in ListGrid._updateValueMapFromODS
        length = this.initialData.getLength();
    }
    for (var i = 0, l = length; i < l; i++) {
        var item = this.get(i);
        // Don't attempt to pull properties from empty values / basic data types in the list.
        if (!isc.isAn.Object(item)) continue;
        if (item && item[idField] != null && displayField) {
            valueMap[item[idField]] = item[displayField];
        }
    }
    return valueMap;
},

// helper to return a map of item[fieldName] to item array-index - useful for optimizing loops 
// that modify one array based on another, by avoiding subsequent findIndex() lookups  
// - added for use in optimizing FormItem._modifyDataInDisplayFieldCache()
getValueIndexMap : function (fieldName) {
    if (Object.fromEntries) {
        // use native Object.fromEntries() to build a map of item[fieldName] to item array-index
        
        return Object.fromEntries(this._nativeMap(function (entry, index) {
            return [entry[fieldName], index];
        }));
    }

    // otherwise, use native map() to build the object manually
    var result = {};
    this._nativeMap(function (entry, index) {
        result[entry[fieldName]] = index;
    });
    return result;
},

//>	@method		array.map()
// Calls a function for each member of an array, passing in the member, its index and
// the array itself as arguments. Returns a new array containing the
// resulting values.
// <P>
// This behavior is part of the
// +externalLink{http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.map,ECMA-262 specification}.
// <P>
// <b>Backwards compatibility note:</b> Historically SmartClient provided a version of
// array.map() which differed from the native behavior in a couple of ways:
// <ul>
// <li>If passed a string as the function argument, it would invoke a same-named method on
//   each member of the array. This is now deprecated in favor of 
//   calling +link{array.callMethod()} directly</li>
// <li>If additional arguments other than the <code>function</code> were passed to this
//   method, when the function was invoked for each member, these additional arguments
//   would be passed in when the function was invoked. This is also deprecated as it
//   conflicts with the default native implementation</li>
// </ul>
//		@group	iteration
//
//		@param	method  (Function) function to execute for each item
//		@return	(Array)		array of returned values
// @visibility external
//<

_nativeMap : Array.prototype.map,
map : function (method, arg1, arg2, arg3, arg4, arg5) {

    var OBJ = Object(this),
        isFunc = isc.isA.Function(method);
        
    if (!isFunc) {
        if (isc.isA.String(method)) {
            if (isc._deprecatedMapWarningShown == null) {
                isc._deprecatedMapWarningShown = {};
            }
            if (!isc._deprecatedMapWarningShown[method]) {
                isc.logWarn("Array.map() passed a string rather than a function:" + method + 
                    ". This usage is deprecated in favor of Array.callMethod().");
                isc._deprecatedMapWarningShown[method] = true;
            }
        }
        return this.callMethod(method, arg1, arg2, arg3, arg4, arg5);
    }

	var undef,
        mimicNativeImp = (arg2 === undef && arg3=== undef && arg4 === undef && arg5 === undef);
    if (!mimicNativeImp) {
        if (!isc._deprecatedMapArgsWarningShown) {
            isc.logWarn("Array.map() passed " + arguments.length + "arguments. " +
                "This usage is deprecated.");
            isc._deprecatedMapArgsWarningShown = true;
        }
        return this.mapArgs(method, arg1, arg2, arg3, arg4, arg5);
    }
    
    // Use the default implementation (assuming it exists)
    if (this._nativeMap) return this._nativeMap(method, arg1);

    // for older browsers, mimic it.
    var length = OBJ.length >>> 0;

    var output = new Array(length);
    for (var i = 0; i < length; ++i) {
        var item;
        item = OBJ[i];
        output[i] = method.call(arg1, item, i, OBJ);
    }
    return output;
},

// Historically this method was implemented in array.call
// Moved to a separate method since this differs from the native JS array.call
// implementation
mapArgs : function (func, arg1, arg2, arg3, arg4, arg5) {
    var result = [],
        length = this.getLength();
    for (var i = 0; i < length; i++) {
        result[i] = func(this[i], arg1,arg2,arg3,arg4,arg5);
    }
    return result;
},


//>	@method array.callMethod()
// Calls a method on each member of an array and returns a new array containing the
// resulting values.
// <P>
// The <code>method</code> argument should be the String name of a
// method present on each item, which will be invoked.  If any item is null
// or lacks the named method, null will be returned for that item.
// <P>
// Examples:<PRE>
//    // line up widgets at 20 pixels from page edge
//    [widget1, widget2].callMethod("setPageLeft", 20);
//
//    // find furthest right widget
//    [widget1, widget2].callMethod("getPageRight").max();
// </PRE>
// 
//		@group	iteration
//
//		@param	method  (String) Name of method to execute for on item
//	    @param	[arguments 1-N]	(Any)	     arguments to pass to the method
//                                           invoked on each item
//		@return	(Array)		array of returned values
// @visibility external
//<
// Historically this method was implemented in array.call (along with the
// 'mapArgs' logic)
// Moved to a separate method since this differs from the native JS array.call
// implementation
callMethod : function (method, arg1, arg2, arg3, arg4, arg5) {
    var result = [],
        length = this.getLength();
    for (var i = 0; i < length; i++) {
        var item = this.get(i);
        result[i] = (item && item[method] != null) ? item[method](arg1,arg2,arg3,arg4,arg5) : null;
    }
    return result;
},


//>	@method		array.setProperty()
//	Set item[property] = value for each item in this array.
//		@group	iteration
//
//		@param	property	(String)	name of the property to set
//		@param	value		(Any)		value to set to
// @visibility external
//<
setProperty : function (property, value) {
	for(var i = 0, l = this.length;i < l;i++)
		if (this[i]) this[i][property] = value;
}, 

//>	@method		array.clearProperty()
// Delete property in each item in this array.
//		@group	iteration
//
//		@param	property 	(String)	name of the property to clear
// @return (boolean) returns true if any of the properties in the array had a value for the
//     specified property.
// @visibility external
//<
clearProperty : function (property) {
    var hadValue = false, undef;
	for(var i = 0, l = this.length;i < l;i++) {
        hadValue = hadValue || this[i] !== undef;
		if (this[i]) delete this[i][property];
    }
    return hadValue;
},


_extractProperty : function (property) {
    var hadValue = false,
        output = new Array(this.length),
        undef;
    for (var i = this.length; i--; ) {
        var record = this[i];
        hadValue = hadValue || (record !== undef);
        if (record) {
            output[i] = record[property];
            delete record[property];
        } else {
            output[i] = null;
        }
    }
    return (hadValue ? output : null);
},

//>	@method		array.getProperties()
// Return a copy of the array where each object has only the list of properties provided.
//		@group	iteration
//
//		@param	properties	(Array of String[])	names of the properties you want to export
//		                    (object)	object with the properties you want to export
//
//		@return	(Array)		new Array with each item limited to the specified properties
//<
getProperties : function (properties) {
    return isc.applyMask(this, properties);
},

//>	@method		array.getUniqueItems()
// Return a list of each unique item in this list exactly once.
// <P>
// Returns in the same order they were found in the list.
// <P>
// Usage example:<br>
// &nbsp;&nbsp;&nbsp;&nbsp;uniqueList = myArray.getProperty("foo").getUniqueItems();
//
//		@group	subset
//
//		@return	(Array)	list of each unique item in the list
// @visibility external
//<
getUniqueItems : function () {
	for (var output = [], i = 0, l = this.length; i < l; i++) {
		if (!output.contains(this[i])) output[output.length] = this[i];
	}
	return output;
},

//>	@method		array.slice()
// Return a contiguous range of rows of the array.  
// DOES NOT include element at position <code>end</code> (similar to .substring())
// <P>
// NOTE: uses browser's native implementation if one is provided
//
// @param	start	(number)	start index
// @param	[end]	(number)	end index, if not specified will be list.length
//
// @return	(Array)	new array with items from start -> end-1 in it	
// @group	subset
//<
slice :
	(Array.prototype.slice 
		? Array.prototype.slice
		: function (start, end) {
			if (end == null) end = this.length;
			for(var output = [], l = this.length; start < end && start < l;start++)
				output[output.length] = this[start];
			return output;
		}
	), 

//>	@method array.findIndex()
// @include list.findIndex
//<

findIndex : function (property, value, comparator) {
    if (isc.isA.List(this) || !isc.isA.Function(property)) {
        // NOTE: implementation stolen by List interface.  Must use only List API for internal access.
        return this.findNextIndex(0, property, value, null, comparator);
    }
    var OBJ = Object(this);
    return Array.prototype.findNextIndex.call(OBJ, 0, property, value, null, comparator);
},

//>	@method array.findNextIndex()
// @include list.findNextIndex
//<
findNextIndex : function (start, property, value, endPos, comparator) {
    var OBJ = Object(this),
        len = OBJ.length >>> 0;
    if (start == null) start = 0;
    else if (start >= len) return -1;
    if (endPos == null) endPos = len - 1;

    if (property == null) return -1;

    var up = endPos >= start;

	if (isc.isA.String(property)) {
        // single property to match
        if (comparator) {
            for (var i = start; (up ? i <= endPos : i >= endPos) ; (up ? i++ : i--)) {
                if (this[i] && comparator(this[i][property], value, property)) return i;
            }
        } else {
            for (var i = start; (up ? i <= endPos : i >= endPos) ; (up ? i++ : i--)) {
                if (this[i] && this[i][property] == value) return i;
            }
        } 
        return -1;

    
    } else if (isc.isA.Function(property)) {
        var predicate = property,
            thisArg = value;
        for (var i = start; (up ? i <= endPos : i >= endPos) ; (up ? i++ : i--)) {
            value = OBJ[i];
            if (predicate.call(thisArg, value, i, OBJ)) return i;
        }
        return -1;

    } else {
        // "property" is an object specifying a set of properties to match
        return this.findNextMatch(property, start, endPos, comparator);
    }
},

findAllIndices : function (property, value, comparitor) {
    var matches = [];
    var start = 0;
    var match;
    do {
         
        match = this.findNextIndex(start, property, value, null, comparitor);
        if (match != -1) {
            matches.add(match);
            start = match+1;
        }
        
    } while (match != -1);
    return matches;
},

// internal: assumes multiple properties
findNextMatch : function (properties, start, end, comparator) {
    // AdvancedCriteria explicitly requested
    if (properties._constructor == "AdvancedCriteria" && isc.DataSource == null) {
        isc.warn("DataBinding module not loaded, AdvancedCriteria not supported for find()/findAll()");
        return -1;
    }
    // check for short-hand AdvancedCriteria formats
    var dataSource = isc.DataSource.get(this.dataSource) || isc.DataSource;
    if (dataSource && dataSource.isAdvancedCriteria(properties)) {
        var result = dataSource.applyFilter(this.getRange(start, end + 1), properties);
        if (result.size() != 0) return this.findIndex(result.get(0));
        else return -1;
    }

    var propertyNames = isc.getKeys(properties),
        up = end >= start;

    // This processing is largely duplicated, to avoid a check on comparator in the inner loop
    if (comparator) {
        var isFunction = isc.isA.Function(comparator),
            isObject = !isFunction && isc.isAn.Object(comparator),
            isArray = !isFunction && isc.isAn.Array(comparator)
        ;
        if (isArray) {
            // comparator should be a Function or an object of fieldName --> Function, not an Array
            return -1;
        }
        // check the comparators are valid functions in advance, rather than in the main loop
        var validComps = {};
        if (isObject) {
            for (var i = 0; i < propertyNames.length; i++) {
                // multiple-comparator object - establish whether each is a valid Function
                validComps[propertyNames[i]] = isc.isA.Function(comparator[propertyNames[i]]);  
                if (!validComps[propertyNames[i]]) {
                    isc.logWarn("Invalid comparator for " + propertyNames[i] + " - " +
                        isc.echo(comparator[propertyNames[i]])
                    );
                }
            }
        }
        for (var i = start; (up ? i <= end : i >= end); (up ? i++ : i--)) {
            var item = this.get(i);
            if (!item) continue;
            var found = true;
            for (var j = 0; j < propertyNames.length; j++) {
                var propertyName = propertyNames[j];
                if (isFunction) {
                    // single comparator, already known to be a Function
                    if (!comparator(item[propertyName], properties[propertyName], propertyName)) {
                        found = false;
                        break;
                    }
                } else if (isObject) {
                    // multiple-comparator object - if the one involved is a Function, execute it
                    if (validComps[propertyName]) {
                        if (!comparator[propertyName](item[propertyName], properties[propertyName], propertyName)) {
                            found = false;
                            break;
                        }
                    }
                }
            }
            if (found) return i;
        }
    } else {
        for (var i = start; (up ? i <= end : i >= end); (up ? i++ : i--)) {
            var item = this.get(i);
            if (!item) continue;
            var found = true;
            for (var j = 0; j < propertyNames.length; j++) {
                var propertyName = propertyNames[j];
                if (item[propertyName] != properties[propertyName]) {
                    found = false;
                    break;
                }
            }
            if (found) return i;
        }
    }
    return -1;
},

//>	@method array.find()
// @include list.find
//<

find : function (property, value, comparator) {
    // NOTE: implementation stolen by List interface.  Must use only List API for internal access.
    if (isc.isA.List(this) || !isc.isA.Function(property)) {
        var index = this.findIndex(property, value, comparator);
        return (index != -1) ? this.get(index) : null;
    }
    var OBJ = Object(this),
        index = Array.prototype.findIndex.call(OBJ, property, value, comparator);

    // The native find() method returns `undefined' when the predicate does not return true for
    // any value.
    if (index == -1) {
        var undef;
        return undef;
    }
    return ("get" in OBJ ? OBJ.get(index) : OBJ[index]);
},

// given values for the primary key fields ("record"), find the _index of_ the unique 
// matching record.
// Will automatically trim extra, non-key fields from "record"
findByKeys : function (record, dataSource, pos, endPos, comparator) {
    if (record == null) {
        //>DEBUG
        isc.Log.logWarn("findByKeys: passed null record");
        //<DEBUG
        return -1;
    }

    // get the values for all the primary key fields from the passed record
    var findKeys = {}, 
        keyFields = dataSource.getPrimaryKeyFields(),
        hasKeys = false,
        comparators = comparator ? null : {}
    ;
    
    for (var keyField in keyFields) {
        hasKeys = true;
        var r = record[keyField];
        if (r == null) {
            //>DEBUG
            isc.Log.logWarn("findByKeys: passed record does not have a value for key field '"
            			 + keyField + "'");
            //<DEBUG
            return -1;
        }
        findKeys[keyField] = r;
        if (comparators && isc.isAn.Object(r)) {
            
            comparators[keyField] = isc.Canvas.compareValues;
            //this.logWarn("defaulting comparator[" + keyField + "] to DF.compareValues()", "arrayFind");
        }
    }

    if (!hasKeys) {
        //>DEBUG
        isc.Log.logWarn("findByKeys: dataSource '" + dataSource.ID + "' does not have primary " +
                     "keys declared, can't find record"); 
        //<DEBUG
        return -1;
    }

    if (isc.getKeys(comparators).length > 0) comparator = comparators;
    
    // go through the recordSet looking for a record with the same values for the primary keys
    return this.findNextIndex(pos, findKeys, null, endPos, comparator);
},

//>	@method		array.containsProperty()
//  Determine whether this array contains any members where the property passed in matches the value
//  passed in.
//
//		@group	find
//		@param	property	(String)	property to look for
//							(object)	key:value pairs to look for
//		@param	[value]		(Any)		value to compare against (if property is a string)
//
//		@return	(boolean)   true if this array contains an object with the appropriate property value
// @visibility external
//<
containsProperty : function (property, value) {
    var index = this.findIndex(property, value);
    return (index != -1);
},

//>	@method array.findAll()
// @include list.findAll
//<
findAll : function (property, value, comparator) {

    if (property == null) return null;

	if (isc.isA.String(property)) {
        var matches = null,
            l = this.length;

        // single property to match
        var multiVal = isc.isAn.Array(value),
            hasComparator = (comparator != null);
        for (var i = 0; i < l; i++) {
            var item = this[i];
            if (item && (multiVal ?
                    value.contains(item[property], null, comparator) :
                    (hasComparator ?
                        comparator(item[property], value) :
                        item[property] == value)))
            {
                if (matches == null) matches = [];
                matches.add(item);
            }
		}
        return matches;

    
	} else if (isc.isA.Function(property)) {
        var matches = null,
            l = this.length,
            iterator = property,
            context = value;

        for (var i = 0; i < l; i++) {
            var item = this[i];
            if (iterator(item, context)) {
                if (matches == null) matches = [];
                matches.add(item);
            }
		}
        return matches;
	} else {
        // "property" is an object specifying a set of properties to match
        return this.findAllMatches(property, comparator);
	}
},

// internal: assumes multiple properties
findAllMatches : function (properties, comparators) {
    var l = this.getLength(),
        propertyNames = isc.getKeys(properties),
        matches = null,
        hasComparators = (comparators != null),
        singleComparator = (hasComparators && !isc.isAn.Object(comparators) && comparators);

    // AdvancedCriteria explicitly requested
    if (properties._constructor == "AdvancedCriteria" && isc.DataSource == null) {
            isc.warn("DataBinding module not loaded, AdvancedCriteria not supported for find()/findAll()");
            return -1;
    }
    // check for short-hand AdvancedCriteria formats
    var dataSource = isc.DataSource.get(this.dataSource) || isc.DataSource;
    if (dataSource && dataSource.isAdvancedCriteria(properties)) {
        return dataSource.applyFilter(this.getRange(0, this.getLength() + 1), properties);
    }

    for (var i = 0; i < l; i++) {
        var item = this.get(i);
        if (!item) continue;
        var found = true;
        for (var j = 0; j < propertyNames.length; j++) {
            var propertyName = propertyNames[j],
                comparator = (hasComparators && (singleComparator || comparators[propertyName])),
                itemValue = item[propertyName],
                propertiesValue = properties[propertyName];
            if (comparator ?
                !comparator(itemValue, propertiesValue) :
                (itemValue != propertiesValue))
            {
                found = false;
                break;
            }
        }
        if (found) {
            if (matches == null) matches = [];
            matches.add(item);
        }
    }
    return matches;
},

//>	@method		array.slide()	(A)
// Slide element at position start to position destination, moving all the other elements to cover
// the gap.
//
//		@param	start		(number)	start position
//		@param	destination	(number)	destination position for the value at start
// @visibility external
//<
slide : function (start, destination) {
    this.slideRange(start, start+1, destination);
},

//>	@method		array.slideRange()	(A)
// Slide a range of elements from start to end to position destination, moving all the other
// elements to cover the gap.
//
//		@param	start		(number)	start position
//		@param	end         (number)	end position (exclusive, like substring() and slice())
//		@param	destination	(number)	destination position for the range
// @visibility external
//<
slideRange : function (rangeStart, rangeEnd, destination) {
    if (rangeStart == destination) return;
    // remove the range to be moved
    var removed = this.splice(rangeStart, rangeEnd - rangeStart);
    // and add it at the destination
    this.addListAt(removed, destination);
},

//>	@method		array.slideList()	(A)
// Slide the array of rows list to position destination.
//
//		@param	start		(number)	start position
//		@param	destination	(number)	destination position for this[start]
//<
slideList : function (list, destination) {
	var output = [], 
		i
	;

//XXX if destination is negative, set to 0 (same effect, cleaner code below)
if (destination < 0) destination = 0;

	// take all the things from this table before destination that aren't in the list to be moved
	for(i = 0;i < destination;i++)
		if (!list.contains(this[i]))
			output.add(this[i]);

	// now put in all the things to be moved
	for(i = 0;i < list.length;i++)
		output.add(list[i]);

	// now put in all the things after destination that aren't in the list to be moved
	for(i = destination;i < this.length;i++)
		if (!list.contains(this[i]))
			output.add(this[i]);

	// now copy the reordered list back into this array
	this.setArray(output);
},

//>	@method		array.makeIndex()	(A)
// Make an index for the items in this Array by a particular property of each item.
// <P>
// Returns an Object with keys for each distinct listItem[property] value.  Each key will point
// to an array of items that share that property value.  The sub-array will be in the same order
// that they are in this list.
//
//		@param	property		(String)			names of the property to index by
//		@param	alwaysMakeArray	(boolean : false)	
//              if true, we always make an array for every index.  if false, we make an Array only
//              when more than one item has the same value for the index property
//		@return	(Object)					index object
// @visibility external
//<
// NOTE: we don't document the awkard -1 param to allow collisions
makeIndex : function (property, alwaysMakeArray, useIndexAsKey) {
	var index = {};
    var allowCollisions = (alwaysMakeArray == -1);
    alwaysMakeArray = (alwaysMakeArray != null && alwaysMakeArray != 0);
	for (var i = 0; i < this.length; i++) {
		var item = this[i],
			key = item[property]
		;

        // if the item has no value for the key property
        if (key == null) {
            // either skip it..
            if (!useIndexAsKey) continue;
            // or place it in the index under its position in the array
            key = i;
        }

        if (allowCollisions) {
            index[key] = item;
            continue;
        }
 
        var existingValue = index[key];
        if (existingValue == null) {
            if (alwaysMakeArray) {
                // every entry should be an array
                index[key] = [item];
            } else {
                index[key] = item;
            }
        } else {
            if (alwaysMakeArray) {
                // any non-null value is an array we created the first time we found an item
                // with this key value
                index[key].add(item);
            } else {
                // if the existing value is an array, add to it, otherwise put the new and old
                // value together in a new array
                if (isc.isAn.Array(existingValue)) {
                    index[key].add(item);
                } else {
                    index[key] = [existingValue, item];
                }
            }
        }
	}
	
	return index;	
},


//>	@method		array.arraysToObjects()	(A)
// Map an array of arrays to an array of objects.
// <P>
// Each array becomes one object, which will have as many properties as the number of property
// names passed as the "propertyList".  The values of the properties will be the values found
// in the Array, in order.
// <P>
// For example:
// <pre>
//    var arrays = [
//       ["Mickey", "Mouse"],
//       ["Donald", "Duck"],
//       ["Yosemite", "Sam"]
//    ];
//    var objects = arrays.arraysToObjects(["firstName", "lastName"]);
// </pre>
// <code>objects</code> is now:
// <pre>
//    [
//       { firstName:"Mickey", lastName:"Mouse" },
//       { firstName:"Donald", lastName:"Duck" },
//       { firstName:"Yosemite", lastName:"Sam" }
//    ]
// </pre>
//
//		@param	propertyList	(Array of String)		names of the properties to assign to
//
//		@return	(Array of Object)		corresponding array of objects
//<
arraysToObjects : function (propertyList) {
    // get the number of properties we're dealing with
    var propLength = propertyList.length;
    // for each item in this array
    var output = new Array(this.length);
    for (var i = this.length; i--; ) {
        // make a new object to hold the output
        var entry = this[i],
            it = output[i] = {};
        // for each property in the propertyList list
        for (var p = propLength; p--; ) {
            var property = propertyList[p];
            // assign that item in the array to the proper name of the new object
            it[property] = entry[p];
        }
    }
    // return the list that was generated
    return output;
},

//>	@method		array.objectsToArrays()	(A)
// Map an array of objects into an array of arrays.
// <P>
// Each object becomes one array, which contains the values of a list of properties from
// the source object.
// <P>
// For example:
// <pre>
//    var objects = [
//       { firstName:"Mickey", lastName:"Mouse" },
//       { firstName:"Donald", lastName:"Duck" },
//       { firstName:"Yosemite", lastName:"Sam" }
//    ]
//    var arrays = objects.objectsToArrays(["firstName", "lastName"]);
// </pre>
// <code>arrays</code> is now:
// <pre>
// [
//    ["Mickey", "Mouse"],
//    ["Donald", "Duck"],
//    ["Yosemite", "Sam"]
// ]
// </pre>
//
//		@param	propertyList	(Array of String)		names of the properties to output
//
//		@return	(Array of Object)		corresponding array of arrays
//<
objectsToArrays : function (propertyList) {
    // get the number of properties we're dealing with
    var propLength = propertyList.length;
    // for each item in this array
    var output = new Array(this.length);
    for (var i = this.length; i--; ) {
        // make a new object to hold the output
        var entry = this[i],
            it = output[i] = [];
        // for each property in the propertyList list
        for (var p = propLength; p--; ) {
            var property = propertyList[p];
            // assign that item in the array to the proper name of the new object
            it[p] = entry[property];
        }
    }
    // return the list that was generated
    return output;
},


_MAX_APPLY_ARGCOUNT: 65535,

//>	@method		array.spliceArray()	
// 			Like array.splice() but takes an array (to concat) as a third parameter,
//          rather than a number of additional parameters.
//
//      @param  startPos    (number)        starting position for the splice
//      @param  deleteCount (number)        Number of elements to delete from affected array
//      @param  newArray    (Array of Any[])         Array of elements to splice into existing array
//      @return             (Array of Any)  Array of removed elements
//<
spliceArray : function (startPos, deleteCount, newArray) {
    var undef;
    if (startPos    === undef) return this.splice();
    if (deleteCount === undef) return this.splice(startPos);
    if (newArray    === undef) return this.splice(startPos, deleteCount);
    if (!isc.isAn.Array(newArray)) {
        isc.Log.logWarn("spliceArray() method passed a non-array third parameter. Ignoring...", "Array");
        return this.splice(startPos, deleteCount); 
    }

    
    if (newArray.length + 2 <= this._MAX_APPLY_ARGCOUNT) {
        return this.splice.apply(this, [startPos, deleteCount].concat(newArray))
    }

    // extract tail of this array, from startPos through end
    var tail = this.splice(startPos, this.length - startPos);

    // add the elements from newArray at startPos
    newArray.forEach(function(value, index) {this[startPos + index] = value;}, this);

    var deleted = [];
    if (deleteCount < 0) deleteCount = 0;

    // add back the tail, less any deleted items, and build deleted list result
    var tailPos = startPos + newArray.length - deleteCount;
    tail.forEach(function(value, index) {
        if (index < deleteCount) deleted[index]= value;
        else              this[tailPos + index]= value;
    }, this);

    return deleted;
},

// stack peek method - returns the top item on the stack without removing it.
peek : function () {
    var item = this.pop();
    this.push(item);
    return item;
},

// see ResultSet.getCachedRow()
getCachedRow : function (rowNum) {
    return this[rowNum];
},

// Shuffles the elements of this array using the Fisher–Yates shuffle algorithm:
// https://en.wikipedia.org/wiki/Fisher–Yates_shuffle

shuffle : function () {
    var n = this.length;
    while (n > 0) {
        var i = Math.floor(Math.random() * n);
        n--;
        var tmp = this[n];
        this[n] = this[i];
        this[i] = tmp;
    }
},

//
// ----------------------------------------------------------------------------------
// add the observation methods to the Array.prototype as well so we can use 'em there
//

observe: isc.Class.getPrototype().observe, 
ignore : isc.Class.getPrototype().ignore,

// Synonyms and backcompat
// --------------------------------------------------------------------------------------------

    //>!BackCompat 2004.6.15 for old ISC names
    removeItem : function (pos) { return this.removeAt(pos) },
    getItem : function (pos) { return this.get(pos) },
    setItem : function (pos) { return this.set(pos) },
    // NOTE: instead of calling clearAll(), setLength(0) should be called (which is much more
    // efficient), however clearAll() still exists to support the old behavior of returning the
    // removed items.
    clearAll : function (list) { return this.removeList(this) },
    //<!BackCompat

    // Support for java.util.List API
    size : function () { return this.getLength() },
    subList : function (start, end) { return this.getRange(start, end) },
    addAll : function (list) { return this.addList(list); },
    removeAll : function (list) { 
        var origLength = this.getLength();
        this.removeList(list); 
        return this.getLength() != origLength; // return whether list was changed
    },
    clear : function () { this.setLength(0); },
    toArray : function () { return this.duplicate(); }
    // NOTE: incomplete compatibility:
    // - no iterators.  This exists in Java largely for concurrent modification reasons.
    // - remove(int): in Java, the collision between remove(int) and remove(object) is
    //   implemented by method overloading.  In JS, we assume if you pass a number you want
    //   removal by index, but this means remove(5) cannot be used to remove the first instance
    //   of the number 5 from our List.
    // - retainAll: not yet implemented.  Similar to intersect, except the Java version
    //   requires the List to change in place instead of returning the intersection, in order
    //   to preserve the target List's class.
    // - toArray(): in Java, this means go to a native, non-modifiable Array

});


if (!isc.Browser.isIE || isc.Browser.isIE8Strict) {
    Array.prototype.duplicate = Array.prototype.slice;
}


if (isc.Browser.isIE) {
    
     [].fastIndexOf();
     [].fastIndexOf();
}

if (Array.prototype.nativeIndexOf != null) {
    Array.prototype.indexOf = function (obj, pos, endPos, comparator) {
        
        var OBJ = Object(this),
            length = OBJ.length >>> 0;
        if (pos == null) pos = 0;
        else if (pos < 0) pos = Math.max(0, length + pos);
        if (endPos == null) endPos = length - 1;

        var i;
        if (comparator != null) {
            for (i = pos; i <= endPos; ++i) {
                if (comparator(OBJ[i], obj)) return i;
            }
        } else {
            if (isc.isAn.Instance(obj)) {
                i = Array.prototype.nativeIndexOf.call(OBJ, obj, pos);
                if (i > endPos) i = -1;
                return i;
            }

            for (i = pos; i <= endPos; ++i) {
                if (OBJ[i] == obj) return i;
            }
        }

        return -1;
    };
} else {
    // native indexOf() doesn't exist in IE <= 8
    Array.prototype.nativeIndexOf = Array.prototype.indexOf;    
}


if (isc.Browser.isFirefox || isc.Browser.isSafari) {
    Array.prototype.fastIndexOf = Array.prototype.nativeIndexOf;
}

// Fixes to splice() in older browsers.  




//>IE8
// filter() doesn't exist in IE <= 8
if (Array.prototype.filter == null) {

    isc.addMethods(Array.prototype, {

        filter : function (callback, thisObject) {
            var result = [],
                initialLength = this.length; // scan original elements only
            for (var i = 0; i < initialLength; i++) {
                // skip positions for which no elements have been defined
                if (i in this && callback.call(thisObject, this[i])) {
                    result.add(this[i]);
                }
            }
            return result;
        }
    });
    
}
// forEach() doesn't exist in IE <= 8
if (Array.prototype.forEach == null) {
    
    isc.addMethods(Array.prototype, {

        forEach : function (callback, thisObject) {
            var initialLength = this.length;
            for (var i = 0; i < initialLength; i++) {
                if (i in this) {
                    callback.call(thisObject, this[i], i, this)
                }
            }
        }
    });

}
//<IE8

// fill() is supported by recent versions of all browsers, including MS Edge, but not IE
if (Array.prototype.fill == null) {
    isc.addMethods(Array.prototype, {
        fill : function (value, start, end) {
            for (var i=start; i<end; i++) {
                this[i] = value;
            }
        }
    });
}

// Array helpers
isc.Array = {
    // Rotates the range of the array `arr` from `i` to `j` (inclusive) in-place by `n` places
    // to the right (or by `-n` places to the left if `n` is negative).
    _rotate : function (arr, i, j, n) {
        
        if (arr.length < 2) {
            return;
        }

        var m = j - i + 1;
        if (m > 1) {
            n = (m + (n % m)) % m;
            var gcd = isc.Math._gcd(n, m),
                s = (m / gcd);

            for (var p = gcd; p--; ) {
                var kPrime = i + n,
                    k = i + p,
                    temp = arr[k];
                for (var q = s - 1; q--; ) {
                    var l = k - n;
                    if (k < kPrime) {
                        l += m;
                    }
                    arr[k] = arr[l];
                    k = l;
                }
                arr[k] = temp;
            }
        }
    },

    // Move { arr[i], ..., arr[i + n - 1] } to appear after arr[j].
    _moveAfter : function (arr, i, j, n) {
        
        if (i < j) {
            isc.Array._rotate(arr, i, j, -n);
        } else {
            isc.Array._rotate(arr, j + 1, i + n - 1, n);
        }
    },

    // _binarySearch() returns either the lowest index of a value in `values' that equals `value'
    // or indicates the lowest index in `values' at which `value' may be inserted without breaking
    // the sort order of `values', as induced by `compareFn'.
    //
    // This function assumes that `values' is already sorted by `compareFn'.
    //
    // Parameters:
    // - values (Array of any) an array of values in which to search.
    // - value (any) the value to search for.
    // - [compareFn] (Function) an optional comparator function used to compare values in
    //   `values' with `value'. `compareFn' is called with two arguments. The first is a value
    //   from `values' and the second is always `value'. `compareFn' defaults to
    //   isc.Array._defaultCompareFn if it is not specified.
    // - [strict] (boolean) Should this function search for identical values to `value'
    //   (via ===), or is a zero of `compareFn' sufficient for determining equality? The
    //   default value is false. Note that `compareFn' must return zero when passed identically
    //   equal values for this function to work correctly.
    //
    // Returns:
    // (integer) If `value' is in `values' then this function returns the index of `value' in
    // the array. Otherwise, the return value is `-(insertion index) - 1', where the insertion
    // index is the lowest index at which `value' could be inserted into `values' while maintaining
    // the sort order.
    _binarySearch : function (values, value, compareFn, strict) {
        
        if (!compareFn) {
            compareFn = isc.Array._defaultCompareFn;
        }

        var low = 0,
            len = values.length,
            high = len - 1;
        var i = 0,
            comparison;
        while (low <= high) {
            i = Math.floor((low + high) / 2);
            comparison = compareFn(values[i], value);
            if (comparison < 0) {
                low = i + 1;
            } else if (comparison > 0) {
                high = i - 1;
            } else {
                

                // `values[i]' equals `value' according to the compare function. However,
                // it may be that `i' is in the middle of a range of equal values. Keep
                // decrementing `i' until it is the lowest index of that range.
                // If `strict' is true then we are actually looking to return the index of an
                // identically equal value in the `values' array.

                if (strict) {
                    var j = i;
                    
                    do {
                        if (values[j] === value) {
                            return j;
                        }
                        ++j;
                    } while (j < len && compareFn(values[j], value) == 0);
                }

                while (i > 0 && compareFn(values[i - 1], value) == 0) {
                    if (strict && values[i - 1] === value) {
                        return i - 1;
                    }
                    --i;
                }

                // `i' is the insertion index. If strict, return `-i - 1' because the value was
                // not strictly in the `values' array.
                if (strict) {
                    
                    return -i - 1;

                } else {
                    return i;
                }
            }
        }

        // Return the lowest index such that `values' at that index is greater than `value'.
        // That is the index at which `value' could be inserted while maintaining sort order.
        // The actual return value is `-(insertion index) - 1', so that callers can know whether
        // the value was in the `values' array by checking the sign.
        var undef;
        if (comparison !== undef && comparison < 0) {
            // values[i] < value, so i + 1 is the correct insertion index.
            return -(i + 1) - 1;
        } else {
            

            // values[i] > value, so i is the correct insertion index.
            return -i - 1;
        }
    },

    // Default comparator function used by _binarySearch() if `compareFn' is not provided.
    //
    // Parameters:
    // - lhs (any)
    // - rhs (any)
    //
    // Returns:
    // (number) -1 if `lhs' is less than `rhs', 0 if `lhs' and `rhs' are equal, or 1 if `lhs'
    // is greater than `rhs'
    _defaultCompareFn : function (lhs, rhs) {
        if (lhs < rhs) {
            return -1;
        } else if (lhs > rhs) {
            return 1;
        } else {
            return 0;
        }
    }
};

isc.ClassFactory.defineClass("BitSet");

isc.BitSet.addProperties({

    addPropertiesOnCreate: false,
    init : function () {
        this._ranges = [];
        return this.Super("init", arguments);
    },

    _getRangesIndex : function (index) {
        var k = isc.Array._binarySearch(this._ranges, index);
        return (k < 0 ? -(2 + k) : k);
    },

    get : function (index) {
        return (this._getRangesIndex(index) % 2 == 0);
    },

    nextIndex : function (iterIndex) {
        
        var ranges = this._ranges;
        return (iterIndex + 1 < ranges.length ? ranges[iterIndex + 1] : -1);
    },

    all : function (value, start, end) {
        
        var i = this._getRangesIndex(start),
            j = this._getRangesIndex(end - 1);
        return (i == j && (value == (i % 2 == 0)));
    },

    none : function (value, start, end) {
        
        var i = this._getRangesIndex(start),
            j = this._getRangesIndex(end - 1);
        return (i == j && (value != (i % 2 == 0)));
    },

    firstIndexOf : function (value, start, end) {
        if (!(start < end)) {
            return -1;
        }
        var ranges = this._ranges,
            j = this._getRangesIndex(start);
        if (value == (j % 2 == 0)) {
            return start;
        } else if (j + 1 < ranges.length && ranges[j + 1] < end) {
            return ranges[j + 1];
        } else {
            return -1;
        }
    },

    lastIndexOf : function (value, start, end) {
        if (!(start < end)) {
            return -1;
        }
        var ranges = this._ranges,
            j = this._getRangesIndex(end - 1);
        if (value == (j % 2 == 0)) {
            return end - 1;
        } else if (0 <= j && start <= ranges[j] - 1) {
            return ranges[j] - 1;
        } else {
            return -1;
        }
    },

    // Same as setRange(index, index + 1, value), but returns whether the value at the given
    // index was changed.
    set : function (index, value) {
        
        var k = this._getRangesIndex(index),
            changed = (value != (k % 2 == 0));
        if (changed) {
            this._setRange(index, k, index + 1, k, value);
        }
        return changed;
    },

    setRange : function (start, end, value) {
        if (!(0 <= start && start < end)) {
            return;
        }
        
        this._setRange(
            start, this._getRangesIndex(start), end, this._getRangesIndex(end - 1), value);
    },

    // Implementation for set() and setRange():
    _setRange : function (start, i, end, j, value) {
        var ranges = this._ranges;
        

        // The terminology used here assumes that value is true.
        var startFalse = (value != (i % 2 == 0)),
            endFalse = (value != (j % 2 == 0)),
            mergeLeft = (startFalse && 0 <= i && start == ranges[i]),
            mergeRight = (
                endFalse &&
                j + 1 < ranges.length &&
                end == ranges[j + 1]),
            addStart = (!mergeLeft && startFalse),
            addEnd = (!mergeRight && endFalse),
            index = i + (mergeLeft ? 0 : 1),
            howMany = (j - i + (mergeLeft ? 1 : 0) + (mergeRight ? 1 : 0));
        if (addStart && addEnd) {
            ranges.splice(index, howMany, start, end);
        } else if (addStart) {
            ranges.splice(index, howMany, start);
        } else if (addEnd) {
            ranges.splice(index, howMany, end);
        } else {
            ranges.splice(index, howMany);
        }
        
    }
});

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
// This script will load all of the Isomorhic SmartClient Application Framework libraries for you
//
// The idea is that in your app file you can just load the script "Isomorphic_SmartClient.js" which
// in a production situation would be all of the scripts jammed together into a single file.
//
// However, it's easier to work on the scripts as individual files, this file will load all of the
// scripts individually for you (with a speed penalty).
//		
var libs = 
	[

		//>DEBUG
		"language/Packager",			// packager, only used for making sure you have everything you need
		//<DEBUG

		"browser/Browser",				// browser detection and bail if not supported
		
		// core library stuff -- everybody needs all of these
 		// packages assume that all of this is already loaded
		"language/Object",				// core object extensions
		"language/IsA",					// provides identity and typing services
		"language/ClassFactory",		// creates classes for you
		"language/Class",				// base of our class system

		// language stuff -- used by many sub-systems
		"language/Function",			// extensions to the native Function object
		"language/Array",				// extensions to the array object -- used heavily

		"language/NumberUtil",	        // Number-related utilities
		"language/Number",				// extensions to the native Number object
		"language/Math",				// Math helpers
		"language/Date",				// extensions to the native Date object / DateUtil class
		"language/RelativeDate",        // APIs for working with relative date values
		"language/String",				// extensions to the native String object
		"language/StringBuffer",		// provides an efficient way of concatenating strings
        "language/StringMethod",        // provides xmlSerialize method for expressions/functions

        "language/URIBuilder",

		"browser/Cookie",				// processing browser cookies - used during loading of ISC (by Log.js at least)

		//>DEBUG
        "debug/StackTrace",             // transform native stack traces into more readable traces
		"debug/debug",					// debug utilities and stack walking
        //<DEBUG

        

		"debug/Log",					// log package (NOTE: contains stubs necessary in production build)

		//>DEBUG
        //"debug/Debugger",             // debugger package (with the exception of
                                        // getStackTrace / getCallTrace)
		//<DEBUG

		// optional language stuff -- use only if needed by your app
		"language/Array_sort",			// sort arrays of objects easily
		"language/Array_math",			// math operations on arrays
		//"language/Reflection",		// provides for reflection or inspection of any Class or instance
		//"language/Array_util",		// utility array methods, not commonly used
		"language/List",			    // equivalent functionality to a native Array, as a isc.Class
		"language/Map",					// map of name->value pairs
        "language/Set",
		"language/Time",				// time object, including parsing rules
		"language/Tree",				// generic isc.Tree implementation
		//"language/Tree_util",			// additional, not commonly used Tree routines
		//"language/ObjectTree",		// wrapper so you can treat an arbitrary object as a tree
        "language/SGWTFactory",        // Enables reflection in SGWT

        

        "language/TabIndexManager",     // tab-order management to associate a unique ID with tabOrder/tabIndex as required
                                        // (requires Tree)

		"browser/Page",					// characteristics of the browser window
		"browser/Params",				// OPTIONAL: processing URL parameters
		//"browser/UI",					// misc. UI helper functions
	

		// client-server communications
		"communications/Comm",			// simple client-server communication channel and protocols
		"communications/HiddenFrame",	// hidden frame for doing 'invisible' c-s communications
        "communications/FileLoaderBootstrap",        // self-bootstrap for FileLoader - relies on RPCManager
    
        // event handling
        "event/Timer",                  // consolidated timing functions
        "event/EventRegistry",          // global event trapping mechanism
        "event/EventHandler",           // cross-browser event handling framework
        "event/ClickStream",            // event recorder

		"language/Serialize",			// serialize an object as a js literal so it can be re-instantiated

        "browser/MultiWindow",          // base multi-window support
        "browser/OpenFin",              // OpenFin support

        "communications/MessagingDMISocket",	// DMI over messaging
        "communications/MessagingDMIClient",	// DMI over messaging - here for local DevConsole
        "communications/MessagingDMIServer",	// DMI over messaging - here for local DevConsole
        "debug/DebugTarget",                    // Dev Console supporting logic
        "debug/RemoteDebug",            // Code to enable remote debugging

		//"language/Selection",			// provides a selection of a list, including selecting based
                                        // on mouse events
        
		
		// drawable, positionable elements
        "widgets/Element",              // helper methods for DOM element manipulation
		"widgets/Canvas",				// base class of all widgets, very extensive
		"widgets/Media",				// static class with APIs for managing icons and fonts
        // printing
        "widgets/PrintCanvas",
        
        "communications/FontLoader",    // force-load custom fonts and update autosized canvii

        "application/DataBoundComponent", // DataBoundComponent interface APIs applied to the Canvas class
        "application/RuleScopeDBC",       // RuleScope DBC methods (refactored from DBC)

        //>RoundCorners
		"widgets/EdgedCanvas",				// base class of all widgets, very extensive
        //<RoundCorners

		"widgets/Hover",				// singleton that manages hover (e.g. tooltip) timing and window

        "widgets/Sound",
        
		"language/Clone",				// make a isc.clone (duplicate) of an object

        "tools/AutoTest",               // Module for simplified integration with automated
                                        // testing tools

        

        
        
        
       
		"debug/DoneLoading"				// code to be executed when the libraries are done loading
	];

//<STOP PARSING 

// The following code only executes if the script is being dynamically loaded.

// the following statement allows a page that is not in the standard location to take advantage of
// dynamically loaded scripts by explicitly setting the window.isomorphiDir variable itself.
if (! window.isomorphicDir) window.isomorphicDir = "../isomorphic/";

// dynamic loading
(function () {
    function loadLib(lib, hash) {
        if (hash == null) hash = "";
        document.write("<"+"script src='" + window.isomorphicDir + "client/" + lib + ".js" + hash + "' type='text/javascript' charset='UTF-8'><"+"/script>");
    }

    // load Packager.js to define the `isc' global
    loadLib("language/Packager");
    if (libs[0] == "language/Packager") libs[0] = null;

    loadLib("language/startDefiningFramework", "#module=Core");
    for (var i = 0, l = libs.length; i < l; ++i) {
        if (!libs[i]) continue;
        if (window.UNSUPPORTED_BROWSER_DETECTED == true) break;
        loadLib(libs[i]);
    }
    loadLib("language/stopDefiningFramework", "#module=Core");
})();

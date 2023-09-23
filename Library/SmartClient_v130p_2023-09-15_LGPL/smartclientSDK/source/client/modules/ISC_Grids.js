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
        "debug/version",  // check for module version mismatches

		//"language/Array_util",		// utility array methods, not commonly used
		//"language/List",			    // equivalent functionality to a native Array, as a isc.Class
		//"language/Tree",				// generic isc.Tree implementation
		//"language/Tree_util",			// additional, not commonly used Tree routines
		//"language/ObjectTree",		// wrapper so you can treat an arbitrary object as a tree

		"language/Selection",			// provides a selection of a list, including selecting based
                                        // on mouse events
        "language/MultiLinkSelection",  // Selection manager for multi-link trees - caches NodeLocators
                                        // rather than records
        //>DetailViewer
		"widgets/DetailViewer",			// show attributes of one or more objects as a vertical table
        //<DetailViewer

//		"widgets/Toolbar",				// collection of buttons

		"widgets/GridRenderer",			// high speed, flexible, feature-rich table
		"widgets/ListGrid",			// multi-column viewer for a list of objects
        "widgets/TreeGrid",			// viewer for a tree of objects
        "widgets/GridToolStrip",
        "widgets/FieldPicker",          // allows DBC field selection
                
        

        "widgets/RecordEditor",         // specialized listViewer for editing a single record

		//"widgets/Finder",				// specialized tree viewer that resembles the Macintosh isc.Finder
		//"widgets/Explorer",			// specialized tree viewer that resembles the left part of a Windows Explorer
		//"widgets/ExplorerList",		// specialized tree viewer that resembles the right part of a Windows Explorer

        //"widgets/ScrollingMenu",        // specialized listViewer with menu type event-handling 
                                        // behaviour, but scrollable and ready for data-binding

        //>Menu        		
		"widgets/Menu",					// pull-down or context menus
        //<Menu
        //>MenuButton
		"widgets/MenuButton",			// button that shows a menu on click
        //<MenuButton

        //>TreeMenuButton
        "widgets/TreeMenuButton",        // Button/Menu with hierachichal, selectable data
        //<TreeMenuButton

        
        "widgets/TileLayout",
        "widgets/TileGrid",               // displays a tiled list of items

        //>AdaptiveMenu
        "widgets/AdaptiveMenu",           // A menu that can either show it's menu options inline, or show them via a drop-down
        //<AdaptiveMenu
        

        //>ColumnTree
        "widgets/ColumnTree",             // displays a tree structure as Miller Columns, like iTunes
        //<ColumnTree
        
        //>TableView
        "widgets/TableView",             // displays an iPhone-style table for selection
        //<TableView

        //>DOMGrids
        "language/DOMTree",             // Tree model that understands DOMs (XML and HTML)
        "widgets/DOMGrid",              // TreeGrid subclass specialized to show DOMs
        //<DOMGrids
    
        //>Menubar
		"widgets/Menubar",				// set of menus shown as a menubar
        //<Menubar
		"language/CellSelection",		// provides a selection of a grid, including selecting based 
                                        // on mouse events
        "widgets/FieldEditor",
        
        "widgets/FormulaBuilder",

        "widgets/HiliteEditor",

        //"widgets/ReportChooser",
        "application/MultiGroupDialog",

        "widgets/TreeCells",

        "widgets/Shuttle"

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

    loadLib("language/startDefiningFramework", "#module=Grids");
    for (var i = 0, l = libs.length; i < l; ++i) {
        if (!libs[i]) continue;
        if (window.UNSUPPORTED_BROWSER_DETECTED == true) break;
        loadLib(libs[i]);
    }
    loadLib("language/stopDefiningFramework", "#module=Grids");
})();

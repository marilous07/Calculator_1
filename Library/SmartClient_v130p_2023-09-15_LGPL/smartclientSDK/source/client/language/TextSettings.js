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
//> @class TextSettings
// Common base class of +link{TextImportSettings()}.
// @treeLocation Client Reference/System
// @visibility external
//<
isc.ClassFactory.defineClass("TextSettings");

isc.TextSettings.addClassProperties({
    //> @type EscapingMode
    // Mode for escaping text values when using +link{DataSource.recordsAsText()} or
    // +link{DataSource.recordsFromText()}.
    DOUBLE: "double",
    // @value "double" Literal double quotes in data values are doubled (""), as expected by Microsoft
    //                 Excel when pasting text values
    BACKSLASH: "backslash"
    // @value "backslash" double quotes in data values have a blackslash (\) prepended, similar to
    //                    String escaping in JavaScript and Java
    // @visibility external
    //<
});

isc.TextSettings.addProperties({

    //> @attr textSettings.fieldList (Array of String : null : IR)
    // For export, a set of fields to export.  Default is to export all DataSource fields.  
    // <P>
    // Fields may be specified that are not in the DataSource but for which data values are present
    // in the provided Records.  In this case the field is assumed to be of type "text".
    // <p>                               
    // For import, names of DataSource fields to use to parse values, in order.
    // <P>
    // If <code>fieldList</code> is unset, DataSource fields are used, in order.
    // <P>
    // If more values exist in a given Record than the listed fields or than all DataSource fields,
    // remaining values are ignored.
    // @visibility external
    //<
    fieldList: null,

    //> @attr textSettings.fieldSeparator (String : "," : IR)
    // Separator between field values.  Default is a comma character, producing CSV 
    // (comma-separated values) format.
    // @visibility external
    //<
    fieldSeparator: ",",

    //> @attr textSettings.lineSeparator (String : null : IR)
    // Separator between Records.  For import, default of null means that either the Unix/Mac
    // format of just a newline ("\n") or the typical DOS/Windows format of a carriage return
    // and newline ("\r\n") will be accepted.  For export, overridden in +link{TextExportSettings}.
    // @visibility external
    //<
    lineSeparator: null,

    //> @attr textSettings.escapingMode (EscapingMode : "backslash" : IR)
    // +link{EscapingMode} expected for escaping special characters embedded in text values.
    // @visibility external
    //<
    escapingMode: isc.TextSettings.BACKSLASH
});

isc.TextSettings.addMethods({

    getEscapingModeEscapeChar : function () {
        switch (this.escapingMode) {
        case isc.TextSettings.DOUBLE:
            return "\"";
            break;
        case isc.TextSettings.BACKSLASH:
            return "\\";
            break;
        }
        return "";
    }

});

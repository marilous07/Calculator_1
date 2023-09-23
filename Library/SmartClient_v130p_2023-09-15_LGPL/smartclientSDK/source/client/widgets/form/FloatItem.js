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
//> @class FloatItem
// <p>
// A TextItem for managing a text field that displays a floating point value.  FloatItem is the
// default FormItem if the +link{formItem.type} is "float".
// <p>
// FloatItem displays its value according to the +link{formItem.decimalPrecision} and
// +link{formItem.decimalPad} properties of the FormItem.  While the value is being edited,
// the item will display the value with its original precision and without extra zero-padding.
// </p>
//
// @inheritsFrom TextItem
// @group gwtFloatVsDouble
// @visibility external
//<
isc.ClassFactory.defineClass("FloatItem", "TextItem");

isc.FloatItem.addProperties({
// A boolean flag to store whether the item is currently displaying an editor.  This is
// used in the override of mapValueToDisplay() to display the full floating-point value while
// in "editor mode" and a formatted version of that value (where the format is specified by
// decimalPrecision and decimalPad) outside of "editor mode".
_inEditorMode: false,

defaultType: "float",


_forceValidateOnExit: true

});

isc.FloatItem.addMethods({
});


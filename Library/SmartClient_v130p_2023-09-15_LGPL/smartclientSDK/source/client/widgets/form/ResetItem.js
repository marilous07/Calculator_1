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
//>	@class	ResetItem
// Button that resets the form to default values, by calling
// <code>DynamicForm.resetValues()</code>
// 
// If you define a click handler on this item, you can return false to cancel the reset.
//
// @inheritsFrom ButtonItem
// @visibility external
//<

isc.ClassFactory.defineClass("ResetItem", "ButtonItem");
isc.ResetItem.addProperties({
    // default the title to "Reset"
    title:"Reset"
});

isc.ResetItem.addMethods({
    // override handleClick to reset the form unless a user defined click-handler suppresses
    // the reset.    
    handleClick : function () {
        if (this.Super("handleClick", arguments) == false) return false;
        this.form.resetValues();
    }
});


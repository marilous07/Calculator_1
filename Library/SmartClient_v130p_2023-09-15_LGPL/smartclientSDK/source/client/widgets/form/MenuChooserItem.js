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
//> @class MenuChooserItem
// 
// @inheritsFrom SelectItem
// @visibility internal
//<
isc.defineClass("MenuChooserItem", "SelectItem");
isc.MenuChooserItem.addProperties({
    valueField: "id",
    displayField: "name",
    sortField: "id",

    init : function () {
        this._menuData = this.initValueMap();
        this.Super("init", arguments);
    },

    destroy : function () {
        if (this._menuDataSource) this._menuDataSource.destroy();
        this.Super("destroy", arguments);
    },

    // Returns a client-only DataSource for existing ValuesManagers
    getOptionDataSource : function () {
        // called numerous times so cache
        if (!this._menuDataSource) {
            this._menuDataSource = isc.DS.create({
                clientOnly: true,
                fields: [
                    { name: "id", primaryKey: true },
                    { name: "name" }
                ],
                cacheData: this._menuData
            });
        }
        return this._menuDataSource;
    },

    getComponent : function () {
        return this.creator.currentComponent;
    },

    getEditContext : function () {
        var editor = this.creator,
            editNode = editor.currentComponent,
            currentComponent = editNode.liveObject,
            editContext = currentComponent.editContext
        ;
        return editContext;
    },

    initMenuInstances : function () {
        var editor = this.creator,
            builder = editor.builder,
            menuEditNodes = builder.getEditNodesByType("Menu")
        ;
        this.liveMenus = (menuEditNodes ? menuEditNodes.getProperty("liveObject") : null) || [];
    },

    initValueMap : function() {
        this.initMenuInstances();
        var data = [];
        for (var i = 0; i < this.liveMenus.length; i++) {
            var menu = this.liveMenus[i];
            data.add({ id: menu.ID, name: menu.ID });
        }
        return data;
    }

});

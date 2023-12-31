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
if (isc.Window) {
    
isc.ClassFactory.defineClass("FieldEditor", "Window");

isc.FieldEditor.addProperties({
        //fields:null, // to be set by the component that uses this
        isModal: true,
        showMinimizeButton: false,
        autoCenter: true,
        autoSize:true,
        defaultWidth:475,
        visibleFieldsConstructor: "ListGrid",
        hiddenFieldsConstructor: "ListGrid",
        showFooter: false,
        title:"Customize Fields",
        showInstructionsPane:true,
        bodyProperties:{ layoutMargin : 5 },
        instructionsPaneDefaults : {
            _constructor:isc.HTMLFlow,
            padding:5,
            height:1
        },
        instructions:"Drag fields between grids to control which fields are visible " +
                     "and the order in which fields are displayed",

        initWidget : function () {
            this.invokeSuper(isc.FieldEditor, "initWidget");

            if (!this.fields) {
                isc.logWarn('FieldEditor can not be created because no fields were provided');
                return;
            }

            this.addItem(this.addAutoChild("instructionsPane", {
                contents:this.instructions
            }));

            this.visibleFieldsDefaults = this.hiddenFieldsDefaults = {
                height:200, width: 200,
                leaveScrollbarGap:false,
                canDragRecordsOut: true,
                canAcceptDroppedRecords: true,
                canReorderRecords: true,
                dragDataAction: "move"                
            };
    

            var visFieldsGrid = this.visibleFieldsGrid = this.createAutoChild("visibleFields", {
                fields:[{
                    name:"title", title: "Visible Fields",
                    formatCellValue : "value || record.name"
                }]
            });
    
            var allFields = this.fields;
    
            var vFields = allFields.findAll("visible", null);
            var hFields = allFields.findAll("visible", false);
    
            visFieldsGrid.setData(vFields);
            var hidFieldsGrid = this.hiddenFieldsGrid = this.createAutoChild("hiddenFields", {
    	        canReorderRecords: false,
                fields:[{
                    name:"title", title: "Hidden Fields",
                    formatCellValue : "value || record.name"
                }]
            });
   
            hidFieldsGrid.setData(hFields);
            var container = isc.HLayout.create({membersMargin:10,
    	        layoutMargin: 5,
                height: 1, overflow:"visible",
                members:[
                    visFieldsGrid,
                    isc.VStack.create({width:32, height:74, layoutAlign:"center", membersMargin:10, 
                    members:[
                        isc.Img.create({src:"[SKINIMG]actions/back.png", width:16, height:16,
                            visFieldsGrid: visFieldsGrid, hidFieldsGrid: hidFieldsGrid,
                            layoutAlign:"center",
                            click:"this.visFieldsGrid.transferSelectedData(this.hidFieldsGrid)"
                        }),
                        isc.Img.create({src:"[SKINIMG]actions/forward.png", width:16, height:16,
                            layoutAlign:"center",
                            visFieldsGrid: visFieldsGrid, hidFieldsGrid: hidFieldsGrid,
                            click:"this.hidFieldsGrid.transferSelectedData(this.visFieldsGrid)"
                        })
                    ]}),
                    hidFieldsGrid
                ]
            });
       
            this.addItem(container);
    
            var okButton = this.createAutoChild("okButton", {
                autoDraw: false,
                title: "Done",
                fieldEditor: this,
                click: function () { this.creator.okClick(); },
                layoutAlign:"center"
            }, isc.IButton);
            this.addItem(okButton);
        },


        okClick : function () {
            var vFields = isc.clone(this.visibleFieldsGrid.data);
            var hFields = isc.clone(this.hiddenFieldsGrid.data);
                        
            vFields.setProperty("visible", null);
            hFields.setProperty("visible", false);
                       
            vFields.addList(hFields);

            var fieldState = vFields.getProperties(["name", "visible"]);

            this.done(vFields, fieldState);

            this.hide();
            this.destroy();
        },
        done : function (vFields, fieldState) {
        }
        
});

} // end if (isc.Window)
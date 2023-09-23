// we need to call setCurrentUser(), otherwise the client security code assumes you are not authenticated.
isc.Authentication.setCurrentUser({userId:"jean"});

function createUI () {

    var hLayout = isc.HLayout.create({
        ID: "hLayout",
        membersMargin: 15,
        members:[
            isc.TreeGrid.create({
                ID: "employeeTree",
                width: 525,
                height: 400,
                dataSource: employeesCO,
                nodeIcon: "icons/16/person.png",
                folderIcon: "icons/16/person.png",
                showOpenIcons: false,
                showDropIcons: false,
                closedIconSuffix: "",
                autoFetchData: true,
                dataFetchMode: "local",
                loadDataOnDemand: false,
                showSelectedIcons: true,
                showAllColumns: true,
                autoOpenTree: "all",
                fields: [
                    {name: "name", width: "40%", title:"Name"},
                    {name: "job"},
                    {name: "salary"}
                ],
                dynamicProperties: {
                    canEdit: { operator: "or",
                              criteria: [
                                  { fieldName: "auth.roles", operator:"contains", value:"CEO" },
                                  { fieldName: "auth.roles", operator:"contains", value:"HR" }
                              ]
                             }
                }
            }),
            isc.VLayout.create({
                membersMargin: 15,
                members: [
                    isc.IButton.create({
                        title: "Remove Employee",
                        width: 200, 
                        visibleWhen: { fieldName: "auth.roles", operator:"regexp", value:"CEO" },
                        enableWhen: { fieldName: "employeeTree.anySelected", operator:"equals", value:true },
                        click: function () {
                            employeeTree.removeData(employeeTree.getSelectedRecord());
                        }
                    }),
                    isc.IButton.create({
                        title: "Cheater Remove Employee",
                        width: 200,
                        enableWhen: { fieldName: "employeeTree.anySelected", operator:"equals", value:true },
                        click: function () {
                            employeeTree.removeData(employeeTree.getSelectedRecord());
                        }
                    }),
                ]
            })
        ]
    });
    return hLayout;
}

isc.VLayout.create({
    ID: "mainLayout",
    membersMargin: 15,
    members:[
        isc.DynamicForm.create({
            ID: "formRoles",
            fields : [
                {
                    name: "selectRoles", title: "Roles",
                    editorType: "SelectItem",
                    multiple: true,
                    valueMap : {
                        "HR" : "HR",
                        "CEO" : "CEO"
                    },
                    changed :function (form, item, value) {
                        // setRoles() is meant to be called before application startup, and the roles should be provided by whatever system
                        // you use for authentication.  Note that you are *not* normally allowed to change roles after your application has started;
                        // this sample simulates dynamic role change by completely rebuilding the UI.
                        isc.Authentication.setRoles(value);                    
                        hLayout.destroy();
                        mainLayout.addMember(createUI());
                    }
                }]            
        }),
        createUI()
    ]
});



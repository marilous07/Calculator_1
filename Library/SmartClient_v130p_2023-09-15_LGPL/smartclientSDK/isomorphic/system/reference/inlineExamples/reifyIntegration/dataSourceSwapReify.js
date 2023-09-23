isc.VLayout.create({
    ID:"mainLayout",
    padding:10,
    layoutMargin: 5,
    defaultLayoutAlign:"center",
    width:"100%", height:"100%",
    border:"1px dashed blue",
    members:[
        isc.DynamicForm.create({
            ID:"projectForm",
            snapTo:"T",
            width:250,
            canEdit:false,
            wrapItemTitles:false,
            fields: [
                { name:"projectName", title:"Project Name", defaultValue:"Supply Catalog" },
                { name:"userName", title:"Email / User Name", defaultValue:"reifySample"},
                { name:"password", title:"Password", type:"password", defaultValue:"tryReify"},
                { name:"serverURL", title:"Server URL", defaultValue:"https://create.reify.com" },
                { name:"loadProject", type:"button", title:"Load Project", canEdit:true,
                    click: function () {
                        var projectName = projectForm.getValue("projectName");

                        isc.Reify.loadProject(projectName, function (project, projects, rpcResponse) {
                            var message = isc.RPCManager.getLoadProjectErrorMessage(rpcResponse);
                            if (message) { 
                                isc.warn(message); 
                                return; 
                            }
                            if (rpcResponse.status == 0) {
                                if (mainLayout.getMember(1) != null) mainLayout.removeMember(1);
                                var screen = project.createScreen(project.screens[0].ID);
                                mainLayout.addMember(screen);

                                isc.notify("Project "+projectName+" loaded from "+projectForm.getValue("serverURL"), null, null,
                                    {autoFitMaxWidth:400, canDismiss: true,  appearMethod: "fade", disappearMethod: "fade", position: "C" });
                                    
                            }
                        },  {
                                userName: projectForm.getValue("userName"),
                                password: projectForm.getValue("password"),
                                serverURL: projectForm.getValue("serverURL"),
                                willHandleError: true
                            }
                        );
                    }
                }
            ]
        })
    ]
});

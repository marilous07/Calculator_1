
isc.VLayout.create({
    ID: "container",
    width: "100%",
    height: "100%",
    membersMargin: 20,
    members: [
        isc.IButton.create({
            title: "Load Project",
            click: function() {
                isc.Reify.loadProject("Incompatible Simple Form", function (project, projects, rpcResponse) {
                    var message = isc.RPCManager.getLoadProjectErrorMessage(rpcResponse);
                    if (message) { 
                        isc.warn(message); 
                        return; 
                    }
                    if (rpcResponse.status == 0) {
                        var screen = project.createScreen(project.screens[0].ID),
                            saveForm = screen.getByLocalId("simpleForm"),
                            values = saveForm.getValues();
                        isc.observe(saveForm.getField("saveDataButton"), "click", function () {
                            if (values.inStock != true && values.nextShipment == null) {
                                isc.warn("New stock items which are not already stocked must have a Stock Date");
                            }
                        });
                        var target = container.getMember(1);
                        if (target) {
                            container.replaceMember(target, screen);
                        } else {
                            container.addMember(screen);
                        }
                    }
                },
                {
                    userName:"reifySample",
                    password:"tryReify",
                    serverURL:"https://create.reify.com",
                    willHandleError: true,
                    verifyAsError: true,
                    verifyDataSources: true,
                    verifyComponents: {
                        'simpleForm.saveDataButton': 'ButtonItem'
                    }
                });
            }
        })
    ]
});

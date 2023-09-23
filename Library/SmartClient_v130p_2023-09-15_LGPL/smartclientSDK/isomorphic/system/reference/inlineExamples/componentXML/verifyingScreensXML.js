isc.VLayout.create({
    ID: "container",
    width: "100%",
    height: "100%",
    membersMargin: 20,
    members: [
        isc.IButton.create({
            title: "Load Project",
            click: function() {
                isc.RPCManager.loadScreen("verifyingScreensXML",function (screen, response) {
                    var saveForm = screen.getByLocalId("simpleForm"),
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
                },
                {
                    verifyAsError: true,
                    verifyComponents: {
                        'simpleForm.saveDataButton': 'ButtonItem'
                    },
                    willHandleError: false
                });
            }
        })
    ]
});


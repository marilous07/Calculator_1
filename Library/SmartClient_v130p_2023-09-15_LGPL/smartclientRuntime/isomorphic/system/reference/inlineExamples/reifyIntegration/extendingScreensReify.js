isc.Canvas.create({
    ID:"container",
    width:600,
    height:300
});

isc.Reify.loadProject("Simple Form", function (project, projects, rpcResponse) {
        var screen = project.createScreen(project.screens[0].ID),
            saveForm = screen.getByLocalId("simpleForm"),
            values = saveForm.getValues();
        isc.observe(saveForm.getField("saveDataButton"), "click", function () {
            if (values.inStock != true && values.nextShipment == null) {
                isc.warn("New stock items which are not already stocked must have a Stock Date");
            }
        });
        container.addChild(screen);
    },  
    {
        userName:"reifySample",
        password:"tryReify",
        serverURL:"https://create.reify.com"
    }
);
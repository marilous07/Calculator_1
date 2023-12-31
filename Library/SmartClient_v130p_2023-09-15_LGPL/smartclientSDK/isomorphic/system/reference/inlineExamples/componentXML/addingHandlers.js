isc.Canvas.create({
    ID: "container"
});

isc.RPCManager.loadScreen("addingHandlers",function (screen) {
    saveForm = screen.getByLocalId("saveForm");
    isc.observe(screen.getByLocalId("saveButton"), "click", function () {
        if (saveForm.getValue("inStock") == false 
                && saveForm.getValue("nextShipment") == null) {
            isc.warn("New stock items which are not already stocked must have a Stock Date");
        }
    });
    container.addChild(screen);
});
// Ενημερώστε τα script tags για να φορτώσετε τη βιβλιοθήκη SmartClient

// Φόρτωση του SmartClient
isc.loadSkin('Enterprise');

// Αρχικοποίηση του UI
isc.VLayout.create({
    ID: "mainContainer",
    width: "100%",
    height: "100%",
    members: [
        // Header
        isc.Label.create({
            contents: "My Calculator",
            height: 50,
            width: "100%",
            align: "right",
            members: [
                isc.Button.create({
                    title: "Close",
                    click: function() {
                        mainContainer.hide();
                    }
                })
            ]
        }),
        // Καρτέλες
        isc.TabSet.create({
            ID: "mainTabSet",
            tabBarPosition: "top",
            tabs: [
                {title: "Calculator", pane: calculatorForm },
                {title: "History", pane: history}
            ]
        })
    ]
});

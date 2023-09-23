isc.defineClass("BlueBox", "Label").addProperties({
    align:"center",
    border:"1px solid #808080",
    backgroundColor:"lightblue",
    styleName:"blackText"
});

isc.VStack.create({
    showEdges:true,
    width:150, membersMargin:5,  layoutMargin:10,
    members:[
        isc.BlueBox.create({height:40, contents:"height 40"}),
        isc.BlueBox.create({height:80, contents:"height 80"}),
        isc.BlueBox.create({height:160, contents:"height 160"})
    ]
});

// Ο υπόλοιπος κώδικας του main.js (ή όποιο αρχείο JS χρησιμοποιείτε)
// ...


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

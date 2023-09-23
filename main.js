document.addEventListener("DOMContentLoaded", function() {
    // Your SmartClient code here

// Εξαρτήσεις και αρχικές ρυθμίσεις του SmartClient
isc.loadSkin('Enterprise');

// Ορισμός της κλάσης BlueBox
isc.defineClass("BlueBox", "Label").addProperties({
    align:"center",
    border:"1px solid #808080",
    backgroundColor:"lightblue",
    styleName:"blackText"
});

let historyArray = [];

// Προσθήκη αποτελέσματος στο ιστορικό
function addToHistory(firstOperand, operation, secondOperand, result) {
    const historyEntry = `${firstOperand} ${operation} ${secondOperand} = ${result}`;
    historyArray.push(historyEntry);
    updateHistoryDisplay();
}

// Ενημέρωση του ιστορικού
function updateHistoryDisplay() {
    const historyCanvas = isc.Canvas.getById("history");
    let historyHtml = "";
    for (const item of historyArray) {
        historyHtml += `<p>${item}</p>`;
    }
    historyCanvas.setContents(historyHtml);
}

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
            align: "center"
        }),
        // Καρτέλες
        isc.TabSet.create({
            ID: "mainTabSet",
            tabBarPosition: "top",
            tabs: [
                {title: "Calculator", pane: isc.DynamicForm.create({
                    ID: "calculatorForm",
                    fields: [
                        // Your calculator fields go here
                    ]
                })},
                {title: "History", pane: isc.Canvas.create({
                    ID: "history",
                    contents: ""
                })}
            ]
        }),
        // BlueBox
        isc.VStack.create({
            showEdges: true,
            width: 150,
            membersMargin: 5,
            layoutMargin: 10,
            members: [
                isc.BlueBox.create({height: 40, contents: "height 40"}),
                isc.BlueBox.create({height: 80, contents: "height 80"}),
                isc.BlueBox.create({height: 160, contents: "height 160"})
            ]
        })
    ]
});
});
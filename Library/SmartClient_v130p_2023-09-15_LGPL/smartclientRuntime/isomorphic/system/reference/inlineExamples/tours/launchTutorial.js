// Get the Tutorial (defined in XML)
// This tutorial has already been loaded from the server - otherwise we would 
//  use the asynchronous "loadTour" method here.
var tutorial = isc.Tour.getTour("tutorial");

// Float a window over the application with a button to start the tutorial
isc.Window.create({
    title:"Complete Application Tutorial",
    ID:"tutorialLaunchWindow",
    autoCenter:true,
    autoSize:true,
    bodyProperties:{
        defaultLayoutAlign:"center",
        layoutMargin:10
    },
    items:[
        isc.Label.create({
            wrap:false,
            contents:"Click 'Start Tutorial' to learn how to use this application!"
        }),
        isc.Button.create({
            ID:"tutorialButton",
            title:"Start Tutorial",
            disabled:true,
            click:function () {
                tutorial.start();
                tutorialLaunchWindow.hide();
            }
        })
    ]
});

// Set up initial condition for the tutorial - we expect to find the 
// "Suger White 1KG" entry under Canteen and Washroom products - reset any edits to
// ensure this is the case before the tour starts
supplyItem.updateData({
     itemID: 1996,
     itemName: "Sugar White 1KG",
     unitCost: 2.45,
     inStock: true,
     units: "Pkt",
     SKU: "85201400",
     category: "Canteen and Washroom Products",
    },
    "tutorialButton.enable()"
);

// You can optionally modify the tour after loading it
// In this case we're adding an information message for the user
tutorial.addMethods({
    finished : function (state) {
       isc.say("You've completed the tour - we'll leave the application up for you to play with.<P>" +
        "If you want to re-run the tour, quit and re-launch the application from the 'Show Example' button");
    }
});
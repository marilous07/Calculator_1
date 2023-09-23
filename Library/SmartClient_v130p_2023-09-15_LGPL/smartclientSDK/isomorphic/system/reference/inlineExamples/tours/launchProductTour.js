// Get the Tour (defined in XML)
// This tour has already been loaded from the server - otherwise we would 
//  use the asynchronous "loadTour" method here.
var productTour = isc.Tour.getTour("productTour");

// You can optionally modify the tour after loading it
// In this case we're adding a step to re-display the "View" tab
//  when the tour has been completed
productTour.addMethods({
    finished : function (state) {
       featureExplorer_exampleViewer.selectTab(0);
    }
});

isc.Button.create({
    title:"Launch Tour",
    click:function () {
        productTour.start();
    }
});
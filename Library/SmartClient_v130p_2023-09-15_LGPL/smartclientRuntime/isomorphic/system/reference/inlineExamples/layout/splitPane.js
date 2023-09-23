function createSplitPane() {

    var detailPane = isc.DetailViewer.create({
        dataSource: "supplyItem",
        autoDraw:false
    });

    var listPane = isc.ListGrid.create({
        autoDraw:false,
        dataSource:"supplyItem",
        recordClick : function (grid, record, rowNum) {
            detailPane.viewSelectedData(this);
            splitPane.showDetailPane((rowNum+1) + " of " + grid.getTotalRows(), null, "forward");
        }
    });
    if (isc.Browser.isTablet) {
        listPane.addProperties({fields:[{name:"itemName"}, {name:"unitCost"}, {name:"inStock"}]});
    }

    var navigationPane = isc.TreeGrid.create({
        autoDraw:false,
        dataSource: "supplyCategory", autoFetchData: true,
        showHeader: isc.Browser.isDesktop,
        selectionUpdated : function () {
            this.splitPane.setDetailTitle(null);
            detailPane.setData([]);
        },
        nodeClick : function (grid, record) {
            listPane.fetchRelatedData(record, this);
            splitPane.showListPane(record.categoryName, null, "forward");
        }
    });

    var splitPane = isc.SplitPane.create({
        autoDraw:false,
        navigationTitle:"Categories",
        showLeftButton:false,
        showRightButton:false,
        border:"1px solid blue",
        detailPane:detailPane,
        listPane:listPane,
        navigationPane:navigationPane,
        autoNavigate:false
    });

    return splitPane;
}

isc.VLayout.create({
    width: "100%",
    height: "100%",
    members: [createSplitPane()]
});

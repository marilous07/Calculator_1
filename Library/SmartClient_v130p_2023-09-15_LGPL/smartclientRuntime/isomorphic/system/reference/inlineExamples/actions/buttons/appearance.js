
isc.HLayout.create({
    membersMargin: 20,
    members: [
        isc.IButton.create({
            title: "Stretch Button",
            width: 150,
            icon: "icons/16/find.png"
        }),

        isc.Button.create({
            autoFit: true,
            title: "CSS Button",
            icon: "icons/16/find.png"
        }),

        isc.ImgButton.create({
            width:18,
            height:18,
            src:"[SKIN]/ImgButton/button.png"
        })
    ]
});
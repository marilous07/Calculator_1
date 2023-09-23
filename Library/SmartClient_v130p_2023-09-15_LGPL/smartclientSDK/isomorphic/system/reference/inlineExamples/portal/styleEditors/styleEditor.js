var values = {
    "border": "1px solid red",
    "border-radius": "5px",
    "padding": "3px"
};

isc.CSSEditor.create({
    ID: "ed",
    top: 10, left: 10,
    autoDraw: true,
    values: values,
    groups: [
        { name: "myGroup", title: "Border / Radius / Padding", canCollapse: false, allowAsymmetry: true,
            settings: [
                { name: "border" },
                { name: "border-radius" },
                { name: "padding" }
            ] 
        }
    ],
   
    valuesChanged : function () {
        // log the new output, both CSS-text and block of CSS-properties
        var css = this.getCSSText().replaceAll(";", ";\n");
        var settings = isc.JSON.encode(this.getCSSProperties(), {prettyPrint: true});
        var msg = "<pre>== CSS text ==\n" + css + "\n\n== Settings ==<br>" + settings + "</pre>";
        label.setContents(msg);
    },
   
    editComplete : function () {
        var css = this.getCSSText().replaceAll(";", ";\n");
        var settings = isc.JSON.encode(this.getCSSProperties(), {prettyPrint: true});
        var msg = "<pre>== CSS text ==\n" + css + "\n\n== Settings ==<br>" + settings + "</pre>";
        isc.say(msg);
    }
   
});

// label for the output
isc.Label.create({
    ID: "label",
    top: 10, left: 410, width: 600
});

ed.valuesChanged();

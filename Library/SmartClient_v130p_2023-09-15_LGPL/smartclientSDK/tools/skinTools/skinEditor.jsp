<!doctype html>
<%@ taglib uri="http://www.smartclient.com/taglib" prefix="isomorphic" %>
<html>
<head><title>
        Skin Editor | Isomorphic Software
</title>
<link rel="icon" type="image/x-icon" href="favicon.ico">
<style>
.themeEditor {
    background-color: #fafafa;
}
.startPane {
    background-color: #fafafa;
}
.headerLabel {
    color: rgb(101,115,121);
    font-family: calibri;
    font-size: 32px;
    line-height: 32px;
    padding: 0px;
}
.themeheader {
    background-color: white;
    border: 1px solid rgb(208,208,208);
    padding-left: 10px;
}
.themeNameLabel {
    color: #4d4d4d;
    background-color: transparent;
    font-family: calibri;
    font-size: 12px;
    line-height: 12px;
    padding: 5px;
}
.showHelpButton,
.showHelpButtonOver,
.showHelpButtonDown,
.showHelpButtonFocused {
    color: white;
    background-color: rgb(84, 91, 95);
    font-family: calibri;
    font-size: 23px;
    line-height: 23px;
    padding: 6px;
    border-radius: 10px 0px 0px 10px;
}
.hideHelpButton,
.hideHelpButtonOver,
.hideHelpButtonDown,
.hideHelpButtonFocused {
    color: white;
    background-color: rgb(84, 91, 95);
    font-family: calibri;
    font-size: 23px;
    line-height: 23px;
    padding: 6px;
    border-radius: 0px 10px 10px 0px;
}
.helpPanel {
    background-color: rgb(250, 250, 250);
    border: 1px solid rgb(205, 205, 205);
}
.helpTextHeader {
    color: rgb(101, 115, 121);
    background-color: rgb(250, 250, 250);
    font-family: calibri;
    font-size: 24px;
    line-height: 24px;
    vertical-align: center;
    margin: 10px 5px 10px 10px;
}
.helpTextBody {
    color: rgb(101, 115, 121);
    background-color: rgb(250, 250, 250);
    font-family: calibri;
    font-size: 15px;
    margin: 0px 5px 25px 10px;
}

.skinTileIcon,
.skinTile,
.skinTileOver,
.skinTileSelected,
.skinTileSelectedOver {
    background-color:white;
    border:1px solid #dadada;
    font-size: 8pt;
    -moz-box-shadow: 0px 0px 3px 2px none;
    -webkit-box-shadow: 0px 0px 3px 2px none;
    box-shadow: 0px 0px 3px 2px none;
}

.skinTileDown,
.skinTileSelectedDown {
    background-color: #f6f6f6;
}

.skinTileOver,
.skinTileSelected,
.skinTileSelectedOver {
    -moz-box-shadow: 0px 0px 3px 2px #dcdcdc;
    -webkit-box-shadow: 0px 0px 3px 2px #dcdcdc;
    box-shadow: 0px 0px 3px 2px #dcdcdc;
}

.skinTileSelected,
.skinTileSelectedDown,
.skinTileSelectedOver {
    border: 1px solid #157fcc;
}

.skinTileTitle,
.skinTileTitleRTL,
.skinTileTitleOver,
.skinTileTitleOverRTL,
.skinTileTitleFocused,
.skinTileTitleFocusedRTL,
.skinTileTitleFocusedOver,
.skinTileTitleFocusedOverRTL,
.skinTileTitleDisabled,
.skinTileTitleDisabledRTL,
.skinTileTitleError,
.skinTileTitleErrorRTL,
.skinTileTitlePending,
.skinTileTitlePendingRTL,
.skinTileTitlePendingFocused,
.skinTileTitlePendingFocusedRTL,
.skinTileTitlePendingDisabled,
.skinTileTitlePendingDisabledRTL,
.skinTileTitlePendingError,
.skinTileTitlePendingErrorRTL
{
  color: black;
  font-family: RobotoLight, corbel;
  font-size: 9px;
  font-weight: bold;
  padding: 0px 2px 2px 2px;
  background-color: #ecedee;
}

.skinTileTitleDisabled,
.skinTileTitleDisabledRTL,
.skinTileTitlePendingDisabled,
.skinTileTitlePendingDisabledRTL {
  color: #ababab;
}

.startPaneTitle {
    color: rgb(101,115,121);
    background-color: transparent;
    font-family: calibri;
    font-size: 20px;
    line-height: 20px;
    padding: 0px;
}

.refreshingLabel {
    font-family: calibri;
    font-size: 20px;
    color: rgb(101,115,121);
    text-align: center;
}

.darkHover {
  background-color: #3a4a53;
  color: #ffffff;
  font-family: calibri;
  font-size: 14px;
  padding: 10px;
  -moz-border-radius: 8px;
  -webkit-border-radius: 8px;
  border-radius: 8px;
  -moz-box-shadow: 0 0 5px #3a4a53;
  -webkit-box-shadow: 0 0 5px #3a4a53;
  box-shadow: 0 0 5px #3a4a53;
}

</style>
</head>

<body style="overflow:hidden;">

<!-- preload Flat-series fonts -->
<link rel="preload" as="font" href="../../isomorphic/system/helpers/fonts/RobotoLight/RobotoLight.woff2" type="font/woff2" crossorigin="anonymous">
<link rel="preload" as="font" href="../../isomorphic/system/helpers/fonts/calibri/CALIBRI_1.TTF" type="font/ttf" crossorigin="anonymous">
<link rel="preload" as="font" href="../../isomorphic/system/helpers/fonts/corbel/corbel.woff" type="font/woff" crossorigin="anonymous">

<%
Config baseConfig = Config.getGlobal();

RequestContext context = RequestContext.instance(this, request, response, out);
Map user = (Map)Authentication.getUser(context);
context.jsTrans.toJSVariableInScript(user, "user", out);
String username = user != null ? (String)user.get("username") : null;
context.jsTrans.toJSVariableInScript(username, "username", out);
String skin = request.getParameter("skin");
if (skin == null) skin = "Tahoe";

String baseSecureVBTeamURL = baseConfig.getString("baseSecureVBTeamURL");
context.jsTrans.toJSVariableInScript(baseSecureVBTeamURL, "baseSecureVBTeamURL", out);

String skinToolsDir = request.getRequestURI();
skinToolsDir = skinToolsDir.replaceFirst("[^\\/]*$", "");

String isomorphicURI = (String)request.getAttribute("isomorphicURI");
if (isomorphicURI != null) skinToolsDir = isomorphicURI + "../tools/skinTools/";
%>
<script>
var skinToolsDir = "<%=skinToolsDir%>";
</script>
<%
if (isomorphicURI != null) {
%>
<isomorphic:loadISC isomorphicURI="<%=isomorphicURI%>" modulesDir="system/development/"
                    includeModules="Tools,FileLoader,SkinUtil" skin="<%=skin%>"/>
<%
} else {
%>
<isomorphic:loadISC modulesDir="system/development/" includeModules="Tools,FileLoader,SkinUtil"
                    skin="<%=skin%>"/>
<%
}
%>
<% if (user != null) {%>
<script>
var baseSecureVBTeamURL = "<%=baseSecureVBTeamURL%>";
isc.RPCManager.actionURL=skinToolsDir+'skinEditorOperations';
</script>
<%}%>
<%@ page import="com.isomorphic.base.*" %>
<%@ page import="com.isomorphic.rpc.*" %>
<%@ page import="com.isomorphic.auth.*" %>
<%@ page import="com.isomorphic.site.*" %>
<%@ page import="com.isomorphic.servlet.*" %>
<%@ page import="java.util.*" %>

<script>

<isomorphic:loadDS ID='Filesystem,isc_baseSkin,isc_userSkin,skinVariables,skinVariableGroups' />
isc.setAutoDraw(false);

isc.Canvas.addProperties({ hoverStyle: "darkHover", hoverAutoFitWidth: true, hoverAutoFitMaxWidth: 300 });
isc.DynamicForm.addProperties({ 
    itemHoverStyle: "darkHover",
    itemHoverAutoFitWidth: true,
    itemHoverAutoFitMaxWidth: 300
});

isc.ColorPickerItem.addProperties({ defaultPickerMode: "complex" });

var toolsDir = isc.Page.getToolsDir();
var metadataPath = skinToolsDir+"data/";
isc.Page.setAppImgDir(skinToolsDir+"images/");

var currentSeries;

isc.parseSkinURLParams(6, 0);

isc.RPCManager.startQueue();
isc.DataSource.create({
    ID: "groupMetadataDS",
    inheritsFrom: "skinVariableGroups",
    clientOnly: true,
    dataURL: metadataPath+"groupMetadata.json"
}).fetchData();


var fields = isc.DS.get("skinVariables").getFields();
var newFields = [];
for (var fieldName in fields) {
    var field = fields[fieldName];
    var newField = isc.addProperties({}, field);
    delete newField.columnCode;
    delete newField._typeDefaultsAdded;
    delete newField.validators;
    delete newField._simpleType;
    var fKey = newField.foreignKey;
    if (fKey) {
        newField.foreignKey = fKey.replace("skinVariables", "variableMetadataDS");
    }
    newFields.add(newField);
}

newFields.add({ name: "transformedValue" });
newFields.add({ name: "transformResult" });
newFields.add({ name: "metadataValue" });
newFields.add({ name: "themeValue" });
newFields.add({ name: "customValue" });
newFields.add({ name: "savedValue" });
newFields.add({ name: "internal", type: "boolean" });

isc.DataSource.create({
    ID: "variableMetadataDS",
    fields: newFields,
    clientOnly: true,
    dataURL: metadataPath+"variableMetadata.json"
}).fetchData(null, function (resp, data) {
    var _classIcons = {};
    var groupMap = groupMetadataDS.cacheData.getValueMap("name", "internal");
    variableMetadataDS.cacheData.map(function (row) {
        if (groupMap[row.outputGroup]) row.internal = true;
        row.metadataValue = row.value
        row.icon = _classIcons[row.iscClass];
        if (!row.icon) {
            var imageRecord = isc.Class.getClassIcon(row.iscClass);
            if (imageRecord) {
                row.icon = imageRecord.src;
                _classIcons[row.iscClass] = row.icon;
            }
        }
    });
    // if opened from a Reify project with a custom skin/density, reload/reset those data
    appState.checkAutoLoadSkin();
});

isc.RPCManager.sendQueue(function () {
    // this function never runs - move to the DS's fetchData() callback and update icons also
    //variableMetadataDS.cacheData.map(function (row) {
    //    row.metadataValue = row.value
    //});
});

// stick a sortIndex on the isc_baseSkin records - they're retrieved by a file-system scan, but we
// want Tahoe first, and dark skins last
isc_baseSkin.transformResponse = function (resp, req, data) {
    // start index for non internal file-based skins - none as yet
    var fileSkinIndex = 10;
    for (var i=0; i<resp.data.length; i++) {
        var rec = resp.data[i];
        switch (rec.name) {
            case "Tahoe": rec.sortIndex = 0; break;
            case "Obsidian": rec.sortIndex = 1; break;
            case "Stratus": rec.sortIndex = 2; break;
            case "Twilight": rec.sortIndex = 3; break;
            default: rec.sortIndex = fileSkinIndex++;
        }
    }
    // DBC-sorting doesn't seem to work in Tilegrid (the showcase sample calls 
    // grid.data.sortByProperty()) -- so sort the base records here for now
    resp.data.setSort([{ property: "sortIndex", direction: "ascending"}]);
    return resp;
}

// utility functions object
var utils = isc.Class.create({
    isValidColor : function (value) {
        var color = isc.tinycolor(value);
        return color && color.isValid();
    },

    isColorFunction : function (value) {
        // value starts with one of these strings
        return value.search(/^(rgb|rgba|hsl|hsla|hsv)/i) >= 0;
    },

    isColorTransform : function (value) {
        // value starts with one of these strings
        return value.search(/^(lighten|darken|brighten|dim|saturate|desaturate)/i) >= 0;
    },

    isAdjustColor : function (value) {
        return value.search(/^(adjust-color|adjustColor)/i) >= 0;
    },

    toHexColor : function (source) {
        var color = isc.tinycolor(source);
        if (color.isValid()) {
            return (color.getAlpha() != 1 ? color.toHex8String() : color.toHexString()).toUpperCase();
        }
        return "";
    },
    toRgbColor : function (source) {
        var color = isc.tinycolor(source);
        if (color.isValid()) {
            return color.toRgbString();
        }
        return "";
    },
    parseTransform : function (node) {
        var funcs = [ "lighten", "darken", "saturate", "desaturate", "brighten" ];
        
        var value = node.transformedValue.replaceAll(/( |%)/i, "");
        value = utils.parseColorString(value);

        if (value.startsWith("#")) {
            // hex color
            var vColor = isc.tinycolor(value);
            if (vColor.isValid()) {
                // valid hex color
                node.transformResult = utils.toHexColor(vColor);
            } else {
                node.transformResult = value;
            }
            vColor = null;
        } else if (utils.isColorTransform(value)) {
            for (var i=0; i<funcs.length; i++) {
                var func = funcs[i];
                var funcIndex = value.indexOf(func);
                if (funcIndex == -1) continue;
                
                
                var funcBody = value.substring(funcIndex+1); 
                if (funcBody.startsWith("hsl") || funcBody.startsWith("hsv") || 
                    funcBody.startsWith("rgb") || funcBody.startsWith("rgba")) 
                {
                    var funcEnd = funcBody.indexOf(")", funcIndex);
                    var fColor = value.substring(funcIndex, funcEnd);
                    var parsedColor = utils.parseColorString(color);
                    value.replace(fColor, parsedColor);
                }
                
                var colorIndex = funcIndex + func.length + 1;
                var commaIndex = value.indexOf(",", colorIndex);
                if (commaIndex == -1) continue;
            
                var color = value.substring(colorIndex, commaIndex)
            
                var tColor = isc.tinycolor(color);
            
                var valueIndex = commaIndex + 1;
                var endIndex = value.indexOf(")", valueIndex);
                var percentage = new Number(value.substring(valueIndex, endIndex));
                //isc.logWarn(node.value + " -- parsed as isc.tinycolor[" + func + "(" + color + 
                //    ", " + percentage + ")", "themeEditor");
                node.transformResult = utils.toHexColor(tColor[func](percentage));
                tColor = null;
            }
        } else if (utils.isColorFunction(value)) {
            // this is a color function, like rgb(), hsl(), whatever, and may reference one or 
            // more other variables - parse these into values and into a color-string and run
            // it through tinycolor
            value = value.replaceAll("%", "");
            value = utils.parseColorString(value);
            var vColor = isc.tinycolor(value);
            if (vColor.isValid()) {
                node.transformResult = utils.toHexColor(vColor);
            } else {
                node.transformResult = value;
            }
            vColor = null;
        } else if (utils.isAdjustColor(value)) {
            // this is a SASS complex transform, in the format:
            // adjustColor($color [, $hue: hue, $saturation: saturation, $lightness: lightness)
            // - built by getTransformString() - pass this to parseAdjustColor()
            var transform = utils.parseAdjustColor(value);
            var vColor = isc.tinycolor(transform.result);
            if (vColor.isValid()) {
                // value was a valid adjustColor() call
                node.transformResult = utils.toHexColor(vColor);
            } else {
                node.transformResult = value;
            }
            vColor = null;
        }
        
        if (!node.transformResult) {
            //this.logDebug(node.name + " -- no transformResult - using " + 
            //    (node.transformedValue || node.value));
            node.transformResult = node.transformedValue || node.value;
        }
    },

    sassFunctionToTransform : function (value) {
        var transform = {};

        var v = value.replaceAll(" ", "");
        // a[0] is function name, a[1] is source-color and delta
        var a = v.substring(0, v.length-2).split("(");
        // p[0] is variableName, p1 is like " 10%)"
        var p = a[1].split(",");
        p[0] = p[0];
        if (p[0].startsWith("$")) {
            var vObj = themeEditor.getVariableDataRecord(p[0]);
            if (vObj) {
                transform.derivesFrom = vObj.name;
            }
        }

        // make p[1] into a number
        p[1] = parseFloat(p[1]);
        if (isNaN(p[1])) {
            isc.logWarn(value + " has NaN percentage " + ("" + p[1]));
        } else {
            if (a[0] == "lighten") {
                transform.l = p[1];
            } else if (a[0] == "darken") {
                transform.l = p[1] * -1;
            } else if (a[0] == "saturate") {
                transform.s = p[1]
            } else if (a[0] == "desaturate") {
                transform.s = p[1] * -1;
            }
        }

        return transform;

    },
    getTransformString : function (transform) {
        if (transform == null || transform == "") return;
        // build a string that we can parse to rebuild the color
        var result = ["adjustColor("];
        if (transform.derivesFrom && transform.derivesFrom.length > 0) {
            result.add(transform.derivesFrom);
        } else {
            result.add(transform.result);
        }
        if (transform.h != null) result.add(", $hue:" + transform.h);
        if (transform.s != null) result.add(", $saturation:" + transform.s);
        if (transform.l != null) result.add(", $lightness:" + transform.l);
        if (transform.r != null) result.add(", $red:" + transform.r);
        if (transform.g != null) result.add(", $green:" + transform.g);
        if (transform.b != null) result.add(", $blue:" + transform.b);
        result.add(")");
        return result.join("");
    },
    

    parseAdjustColor : function (value) {
        // parse an internal adjustColor() call, in the format:
        // adjustColor($color [, [$hue:x, $saturation:x, $lightness:x, $red:x, $blue:x, $green:x])
        // strip the function surround and spaces
        var sValue = value.replaceAll(/adjustColor|adjust-color|\(|\)| |;/i, "");

        // get the bits - up to 4 key-value pairs
        var bits = sValue.split(",");
        // the first is the source color
        var color = bits[0];
        var derivesFrom=null;
        
        if (color.startsWith("$")) {
            // this is a variable-name
            var vRecord = themeEditor.getVariableDataRecord(color);
            if (vRecord) {
                derivesFrom = color;
                color = vRecord.transformResult;
            }
        }
        var tColor = isc.tinycolor(color);
        
        var hue=null, saturation=null, lightness=null;
        var red=null, green=null, blue=null;
        var alpha = tColor.getAlpha();
        
        for (var i=1; i<bits.length; i++) {
            var isPercent = false;
            var innerBits = bits[i].split(":");
            var fName = innerBits[0];
            var fValue = innerBits[1];
            if (fValue.endsWith("%")) {
                fValue = Number(fValue.substring(0, fValue.length-2));
            }
            if (fName == "$hue" && fValue != 0) {
                hue = Number(fValue)
            } else if (fName == "$saturation") {
                saturation = Number(fValue);
            } else if (fName == "$lightness") {
                lightness = Number(fValue);
            } else if (fName == "$red") {
                red = Number(fValue);
            } else if (fName == "$green") {
                green = Number(fValue);
            } else if (fName == "$blue") {
                blue = Number(fValue);
            }
        }
        var result = { 
            derivesFrom: derivesFrom, 
            value: utils.toHexColor(tColor)
        };
        if (hue != null) result.h = hue;
        if (saturation != null) result.s = saturation;
        if (lightness != null) result.l = lightness;
        if (red != null) result.r = red;
        if (green != null) result.g = green;
        if (blue != null) result.b = blue;

        result.a = alpha;

        if (result.h != null || result.s != null || result.l != null) {
            result.result = utils.adjustColor(tColor, hue, saturation, lightness, alpha);
        } else {
            result.result = utils.adjustColorRGB(tColor, red, green, blue, alpha);
            result.sass = "adjust-color(" + 
                result.derivesFrom + "," +
                "$red:" + result.r + "," +
                "$green:" + result.g + "," + 
                "$blue:" + result.b + "," +
                "$alpha:" + result.a +
            ")";
        }
        tColor = null;
        return result;
    },
    
    adjustColor : function (color, hue, saturation, lightness) {
        var c = isc.tinycolor(color);
        if (hue != null) hue = Number(hue);
        if (hue != null && Math.abs(hue) != 0) {
            c = c.spin(hue);
        }
        if (saturation != null && Math.abs(saturation) != 0) {
            if (saturation > 0) c = c.saturate(Math.abs(saturation));
            else c = c.desaturate(Math.abs(saturation));
        }
        if (lightness != null && Math.abs(lightness) != 0) {
            if (lightness > 0) c = c.lighten(Math.abs(lightness));
            else c = c.darken(Math.abs(lightness));
        }

        //this.logDebug("changed " + color + " to " + c.toHexString(), "themeEditor");
        //var result = c.toRgbString();
        var result = utils.toHexColor(c);
        c = null;
        return result;
    },

    adjustColorRGB : function (color, r, g, b) {
        var c = isc.tinycolor(color);
        if (!c.isValid()) return color;
        var rgb = c.toRgb()
        var str = "rgba(" + (rgb.r + r) + "," + (rgb.g + g) + "," + (rgb.b + b) + "," + rgb.a + ")";
        var newColor = isc.tinycolor(str);

        //this.logDebug("changed " + color + " to " + c.toHexString(), "themeEditor");
        //var result = c.toRgbString();
        var result = utils.toHexColor(newColor);
        c = null;
        return result;
    },

    parseColorString : function (value) {
        var color = isc.tinycolor(value);
        if (color.isValid()) {
            return utils.toHexColor(color);
        }
        
        if (!value || value == "") return value;
        if (value == "transparent") {
            return value;
        }
        if (value.startsWith("#")) {
            return utils.toHexColor(value);
        }
        var funcs = [ "rgb", "rgba", "hsl", "hsv" ];
        var result = value;
        for (var i=0; i<funcs.length; i++) {
            var func = funcs[i];
            var funcIndex = value.indexOf(func);
            if (funcIndex == -1) continue;
            
            var funcEndIndex = value.indexOf(")", funcIndex+1);
            
            var colorIndex = funcIndex + func.length + 1;
            
            var params = value.substring(colorIndex, funcEndIndex).split(",");

            for (var j=0; j<params.length; j++) {
                var p = params[j];
                var pSign = "+";
                var arr = p.split(pSign);
                if (arr.length == 1) {
                    pSign = "-";
                    arr = p.split(pSign);
                }
                arr[0] = new Number(arr[0]);
                if (arr.length == 1) {
                    params[j] = arr[0];
                } else {
                    arr[1] = new Number(arr[1]);
                    if (pSign == "+") params[j] = arr[0] + arr[1];
                    else params[j] = arr[0] - arr[1];
                }
            }
            
            //this.logDebug("parseColorString - returning " + func + "(" + params.join(",") + 
            //    ")", "themeEditor");
            value = utils.toHexColor(func + "(" + params.join(",") + ")");
            break;
        }
        return value;
    },
    replaceValueTokens : function (record) {
        // update the passed record's transformedValue, replacing all variable declarations 
        // (like $some_var) with the calculated transformResult of the associated variable
        // from the passed vars array (at load time, its a local variable - later, its
        // themeEditor.getVariableData())
        var uses = [];
        if (record.transformedValue.contains("$")) {
            if (appState.variableValues[record.name]) {
                var v = themeEditor.getVariableDataRecord(record.transformedValue);
                if (v) {
                    // the transformedValue is another variable name - use it
                    record.transformedValue = v.transformResult;
                }
                // after initial load - replace only the list of variables known to be used by 
                // this variable 
                uses = appState.variableValues[record.name].uses.duplicate();
                for (var j=0; j<uses.length; j++) {
                    record.transformedValue = record.transformedValue.replace(uses[j], 
                        appState.variableValues[uses[j]].value
                    );
                }
            } else {
                var v = themeEditor.getVariableDataRecord(record.transformedValue);
                if (v) {
                    // the transformedValue is another variable name - use it
                    record.transformedValue = v.transformResult;
                    uses.add(v.name);
                } else {
                    // detect any variable-names in the value and replace with those variables'
                    // current value - return the "uses" array
                    uses = record.transformedValue.match(/[$]\w+/g);
                    uses = uses.getUniqueItems();
                    for (var j=0; j<uses.length; j++) {
                        var varName = uses[j];
                        var value = themeEditor.getVariableValue(varName);
                        record.transformedValue = record.transformedValue.replaceAll(varName, value);
                        varName = null;
                    }
                }
            }
        }
        return uses;
    }
});


// global notifications object
var appState = isc.Class.create({

    previewPane : "Grids",
    setPane : function (pane) {
        this.previewPane = pane;
        // pass the current bgColor to the previewPane
        var bgColor = themeEditor.getVariableValue("$standard_bgColor");
        var win = themeEditor.previewPane.getContentWindow();
        if (win && win.showPane) win.showPane(pane, bgColor);
    },
    previewLoadComplete : function () {
        themeEditor.hidePreparingPreviewSpinner();
        appState._previewReady = true;
        if (appState._liveUpdateCache) {
            // apply changes made by the user while the previewPane was loading
            for (var key in appState._liveUpdateCache) {
                themeEditor.updateLiveCSSVariable(key, appState._liveUpdateCache[key], true)
            }
            appState._liveUpdateCache = null;
        }
        if (appState.updateTheseOnLoad) {
            // this object may be set following a preview-reload due to change of Density, so
            // all customizations need refreshing in the preview
            for (var key in appState.updateTheseOnLoad) {
                // this function calls updateVariableValue(), passing a final param
                // which essentially avoids updating the variable being passed, while still
                // updating variables that cascade from it
                themeEditor.refreshVariableValue(key);
            }
        }
        delete appState.updateTheseOnLoad;
        // notify framework elements that CSS variables have been udpated
        themeEditor.variableValuesUpdated();
        // get notified whenever the selected preview-pane changes
        var win = themeEditor.previewPane.getContentWindow();
        if (win) {
            win.paneChangedCallback = appState.previewPaneChanged;
            // exclude "Cubes" from the testPane-list if ISC_Analytics isn't loaded
            if (!win.isc.CubeGrid) {
                this.testPaneList.remove("Cubes");
                themeEditor.previewPicker.getItem("panePicker").setValueMap(this.testPaneList);
            }
        }
        if (appState.importingOverlay) {
            // if set, importOverlay() has been called
            // auto-save the skin with the overlay-settings applied
            appState.saveTheme();
            delete appState.importingOverlay;
        }
    },
    previewPaneChanged : function (newPane) {
        // log the current preview-pane changing
        appState._addUsageRecord("previewPaneChanged", themeEditor.previewPicker.getValue("panePicker"), "");
    },
    getDensityMap : function () {
        // return the map of density names (init-caps)
        return isc.addProperties({}, isc.Canvas.skinDensityMap);
    },
    getDensityNames : function () {
        // return a list of density names (init-caps), for the picker
        return isc.getKeys(isc.Canvas.skinDensityMap);
    },
    density: "Dense",
    getDensity : function (density) {
        // return the density object for the passed or current density
        density = density || this.density;
        return isc.addProperties({}, isc.Canvas.skinDensityMap[density]);
    },
    setPreviewDensity : function (density) {
        appState.density = density;
        
        // build a map of all settings different in the current skin from its base skin, and
        // font-size variables - these will need to be refreshed once the preview has been 
        // reloaded with the new density
        appState.updateTheseOnLoad = {};

        for (var key in appState.baseMap) {
            if (!appState.currentMap[key]) continue;
            if (appState.currentMap[key] != appState.baseMap[key] ||
                (key.endsWith("font_size") || key.endsWith("fontSize"))) 
            {
                // customized value - the actual value is irrelevant - when the preview finishes 
                // reloading, it calls refreshVariableValue() which doesn't update the value of
                // the passed variable, but *does* update variables that use it                
                appState.updateTheseOnLoad[key] = appState.currentMap[key];
            }
        }
        appState.updatePreview();
    },

    publishSkinChanged : function (skin, oldSkin) {
        if (!skin && !oldSkin) return;
        var opener = window.opener;
        if (opener && opener.VB && opener.VB.skinChanged) {
            opener.VB.skinChanged(skin, oldSkin, appState.density);
        } else if (skin) {
            // if skin isn't set, this was a delete and shouldn't show the one-time message
            if (!window.sessionStorage.iscSkipUseReifyMsg) {
                var msg = "If you are using this skin with Reify, changes you make here will be shown " +
                        "immediately within Reify if you launch the Skin Editor from within Reify.<br><br>" +
                        "Otherwise, to see changes, you must use the Skin menu within Reify to manually " +
                        "re-select this skin by name.";
                appState.notifyMessage(msg, null, null, { duration: 0 });
                window.sessionStorage.iscSkipUseReifyMsg = true;
            }
        }
    },

    updatePreviewBackground : function (bgColor) {
        bgColor = bgColor || themeEditor.getVariableValue("$standard_bgColor"); 
        var win = themeEditor.previewPane.getContentWindow();
        if (win && win.currentPane) win.currentPane.setBackgroundColor(bgColor);
    },
    shouldCaptureThumbnail: false,
    captureThumbnail : function () {
        // prototype code to screenshot the previewPane as a thumbnail image for a user
        // skin - uses an MIT-licensed js-file to convert a handle to an image, using an
        // HTML5 canvas and SVG
        
        if (!appState.shouldCaptureThumbnail) return;

        var win = themeEditor.previewPane.getContentWindow();
        if (!win || !win.domtoimage) return;

        win.isc.Element.handleToImage(win.currentPane.getHandle(), this.captureThumbnailReply);

        if (themeEditor.captureThumbnailIcon) {
            var handle = themeEditor.captureThumbnailIcon.getHandle();
            if (handle) {
                // make the icon brighter while the screenshot is being captured
                handle.style.cssText = handle.style.cssText.replace("brightness(100%)", "brightness(200%)");
                if (!handle.style.cssText.contains("brightness(200%)")) {
                    handle.style.cssText += "filter:brightness(200%);"
                }
            }
        }

    },
    captureThumbnailReply : function (dataURL) {
        themeEditor.thumbnailImage = dataURL;
        dataURL = null;
        if (themeEditor.captureThumbnailIcon) {
            var handle = themeEditor.captureThumbnailIcon.getHandle();
            if (handle) {
                // reset the icon brightness
                handle.style.cssText = handle.style.cssText.replace("brightness(200%)", "brightness(100%)");
            }
        }
    },
    // shows the default startPane, a full-screen TileGrid-based UI to create a new theme
    autoShowStartPane: true,

    cacheThemes : function () {
        isc_userSkin.fetchData({}, function (response, data) {
            appState.allUserThemes = data.duplicate();
        }, { outputs: "pk,name,baseSkin,thumbnail" });
        isc_baseSkin.fetchData({}, function (response, data) {
            appState.allBaseThemes = data.duplicate();
        });
    },
    getCachedThemes : function (type) {
        if (type == "user") {
            return appState.allUserThemes.duplicate();
        } else if (type == "base") {
            return appState.allBaseThemes.duplicate();
        }
        return appState.allBaseThemes.duplicate().addList(appState.allUserThemes.duplicate());
    },
    getThemeByName : function (name) {
        var themes = appState.getCachedThemes();
        var record = themes.find("name", name);
        return record;
    },
    
    checkAutoLoadSkin : function () {
        var autoLoadSkin = localStorage.iscAutoEditSkin;
        if (autoLoadSkin != null && autoLoadSkin != "null") {
            localStorage.iscAutoEditSkin = null;
            appState.notifyMessage("Auto-loading Skin '" + autoLoadSkin + "'...");
            //isc.logWarn("Loading iscAutoEditSkin - " + autoLoadSkin);
            appState.setCurrentTheme(autoLoadSkin);
        }
        var autoSkinDensity = localStorage.iscAutoSkinDensity;
        if (autoSkinDensity != null && autoSkinDensity != "null") {
            // apply density provided by Reify
            appState.density = autoSkinDensity;
            localStorage.iscAutoSkinDensity = null;
        }
        // always set initial Density, whether it came from Reify or not
        themeEditor.densityForm.getItem("density").setValue(appState.density);
    },

    // change management
    _changes: [],
    clearChanges : function () {
        appState._changes = [];
        appState.setThemeDirty(false);
        themeEditor.redrawTrees();
    },
    storeChange : function (varName, oldValue, newValue, parentVar) {
        if (appState._changes.find("name", varName)) {
            // change-record exists, just update it
            appState.updateChange(varName, newValue, parentVar);
        } else {
            appState._changes.add({
                name: varName,
                oldValue: oldValue,
                newValue: newValue,
                parentVar: parentVar
            });
            appState.setThemeDirty(true);
        }
    },
    updateChange : function (varName, newValue, parentVar) {
        var change = appState._changes.find("name", varName);
        change.newValue = newValue;
        change.parentVar = parentVar; 
    },
    clearChange : function (varName) {
        appState._changes.remove(appState._changes.find("name", varName));
        if (appState._changes.length == 0) appState.setThemeDirty(false);
    },

    // login
    signOutURL: "/users/logout.jsp",
    signOut : function () {
        window.location.assign(this.signOutURL)
    },
    init : function () {
        // set up some defaults
        this.testPaneList = [ "Grids", "FormItems", "Buttons", "Widgets", "Tabs", 
            "Windows", "Calendars", "Timelines", "Cubes"
        ];
        // if livePreview is in the URL, respect it - otherwise it's true, except in IE
        this.livePreview = isc.params.livePreview == null ? !isc.Browser.isIE :
            isc.params.livePreview == "true" ? true : false;
        if (this.autoPreview == null) this.autoPreview = !this.livePreview
        if (this.showAdvancedVariables == null) this.showAdvancedVariables = false;
    },

    // when false, suppresses some skin variables (where var.basic==0) that are unnecessary or complex, 
    // like menuButtons, which can be configured separately, but don't need to be
    showAdvancedVariables: isc.params.advanced == null ? true : (isc.params.advanced == "1" ? true : false),
    autoPreview: isc.params.autoPreview == null ? null : (isc.params.autoPreview == "true" ? true : false),
    setAutoPreview : function (value) {
        this.autoPreview = value;
        if (this.autoPreview && this.previewDirty) {
            this.updatePreview();
        }
    },
    themeDirty: false,
    themeModified : function () {
        this.setThemeDirty(true);
        if (this.autoPreview) this.updatePreview();
    },
    setThemeDirty : function (dirty) {
        this.themeDirty = dirty;
        if (dirty) this.setPreviewDirty(true);
        for (var i = 0; i < appState.themeObservers.length; i++) {
            this.themeDirtyNotify(this.themeObservers[i]);
        }
    },
    previewDirty: false,
    _updatePreviewRunning: false,
    previewLastDirty: isc.timeStamp(),
    previewLastUpdated: isc.timeStamp(),
    setPreviewDirty : function (dirty, timeStamp) {
        if (timeStamp == null) timeStamp = isc.timeStamp();
        if (dirty) {
            this.previewLastDirty = timeStamp;
        } else {
            this.previewLastUpdated = timeStamp;
        }
        this.previewDirty = this.previewLastDirty > this.previewLastUpdated;

        // re-trigger an update
        if (this.previewDirty && this.autoPreview) this.updatePreview(this.previewLastDirty);
    },
    updatePreviewPaneStyles : function () {
        var win = themeEditor.previewPane.getContentWindow();
        // fix a case where win.isc.Element was unset...
        if (win && win.isc && win.isc.Element) win.isc.Element.cssVariablesUpdated(true);
    },
    updatePreview : function (timeStamp) {
        if (timeStamp == null) timeStamp = isc.timeStamp();

        if (this._updatePreviewRunning) return;
        this._updatePreviewRunning = true;
        this._previewReady = false;

        themeEditor.showPreparingPreviewSpinner();

        appState._updatePreviewRunning = false;
        themeEditor.reloadPreviewPane();
        appState.setPreviewDirty(false, timeStamp);
    },
    saveTheme : function (newName) {
        if (newName) {
            var themeNameVar = themeEditor.getVariableDataRecord("$theme_name");
            if (themeNameVar) {
                themeNameVar.value = "'" + newName + "'";
                appState.currentMap["$theme_name"] = themeNameVar.value;
            }
        }

        var content = this.getCurrentUserSettings(true);
        isc.logWarn("Saving custom Skin-settings...", "themeEditor");

        var themeObj = appState.getThemeByName(this.theme);
        var name = newName || this.theme;

        // build content for just the variables that are different from the baseSkin
        var userContent = "";
        var data = themeEditor.getVariableData();
        for (var i=0; i<data.length; i++) {
            var key = data[i].name;
            if (appState.currentMap[key] != appState.baseMap[key]) {
                userContent += key + ": " + appState.currentMap[key] + ";\n";
            }
        }
        
        var skinRecord = {
            pk: themeObj.pk, name: name, baseSkin: appState.baseTheme, 
            thumbnail: themeEditor.thumbnailImage,
            // allSettings is the whole variable-set - needed for skin compilation
            // - for disk-based skins, written into the userSettings file 
            // = for DS-based skins, discarded after compilation - userSettings 
            //   content is just changed variables
            allSettings: content, 
            // just changed variables - saved for DS-skins, discarded for disk-skins
            userSettings: userContent 
        };

        isc_userSkin.updateData(skinRecord, 
            function (dsResponse) {
                var oldName = appState.theme;
                if (name != oldName) {
                    // log a skin rename
                    appState._addUsageRecord("appRenameSkin", name, oldName);
                    appState.notifyMessage("Skin renamed from '" + oldName + "' to '" + name + "'...");
                    appState.theme = name;

                    themeEditor.themeNameLabel.setTheme(appState.theme);
                } else if (appState.themeDirty) {
                    // log a skin save
                    appState._addUsageRecord("appSaveSkin", name, "");
                    appState.notifyMessage("Changes to '" + appState.theme + "' Skin saved.");
                }
                appState.clearChanges();
                appState.cacheThemes();
                appState.setThemeDirty(false);
                appState.publishSkinChanged(name, oldName);
            }
        );
    },
    createTheme : function (theme, baseTheme) {
        appState.notifyMessage("Creating new Skin '" + theme + 
            "', based on the existing '" + baseTheme + 
            "' skin...");
        this.setCurrentTheme(theme);
        appState.publishSkinChanged(theme, null);
        // log a skin create
        appState._addUsageRecord("appCreateSkin", theme, baseTheme);
    },
    renameTheme : function (oldName, newName) {
        appState.saveTheme(newName);
    },

    deleteTheme : function (confirmed) {
        var _this = this;
        if (!confirmed) {
            isc.confirm("Are you sure you want to permanently delete this skin?",
                function (value) {
                    if (value == true) _this.deleteTheme(true);
                }, { title: "Delete Skin" }
            )
            return;
        }
        var theme = appState.getThemeByName(appState.theme);
        isc_userSkin.removeData(theme, function() {
            var themeName = appState.theme;
            themeEditor.editSkinForm.getItem("name").clearValue();
            appState.setCurrentTheme(null);
            appState.notifyMessage(themeName + " successfully deleted.");
            appState.publishSkinChanged(null, themeName);
            // log a skin delete
            appState._addUsageRecord("appDeleteSkin", themeName, "");
        });
    },
    
    /* exportThemeDialog - allows a user to choose whether to export as an editable "user" skin
    // or a 'base' skin, which skinEditor will allow variations of
    */
    exportThemeDialogDefaults : {
        _constructor: "Window",
        title: "Export Skin",
        autoSize: true,
        labelDefaults: {
            _constructor: "Label",
            height: 1,
            autoFit: true,
            autoDraw: true,
            padding: 7,
            minWidth: 400,
            maxWidth: 500,
            top: -9999,
            contents: "Export your custom Skin to a zip file and extract it into " +
                "your project '/skins/' directory.  You can then edit the skin in your " +
                "local Skin Editor, or load it in your project in the normal way."
        },
        asBaseSkinFormDefaults: {
            _constructor: "DynamicForm",
            height: 1,
            width: "100%",
            items: [
                { 
                    name: "asBaseSkin", type: "boolean", showTitle: false, 
                    title: "Export as Base Skin", width: "*", colSpan: "*",
                    prompt: "Allows the Skin Editor to use this skin as the basis for " +
                        "other custom skins"
                }
            ]
        },
        buttonLayoutDefaults: {
            _constructor: "HLayout",
            width: "100%", height: 30,
            align: "bottom",
            membersMargin: 7,
            layoutMargin: 7,
            layoutAlign: "right"
        },
        cancelButtonDefaults: {
            _constructor: "IButton",
            title: "Cancel",
            click : "this.creator.cancelClick();"
        },
        exportButtonDefaults: {
            _constructor: "IButton",
            title: "Export",
            click : "this.creator.exportClick();"
        },
        
        initWidget : function () {
            this.Super("initWidget", arguments);
            this.label = this.createAutoChild("label");
            this.asBaseSkinForm = this.createAutoChild("asBaseSkinForm");
            this.cancelButton = this.createAutoChild("cancelButton");
            this.exportButton = this.createAutoChild("exportButton");
            this.buttonLayout = this.createAutoChild("buttonLayout", 
                { members: [this.cancelButton, this.exportButton] }
            );
            this.addItems([this.label, this.asBaseSkinForm, this.buttonLayout]);
        },
        cancelClick : function () { this.hide(); },
        exportClick : function () {
            appState.exportTheme(this.asBaseSkinForm.getValue("asBaseSkin"));
            this.hide();
        }
    },
    
    showExportThemeDialog : function () {
        if (!this.exportThemeDialog) {
            this.exportThemeDialog = this.createAutoChild("exportThemeDialog");
        }
        this.exportThemeDialog.placeNear(themeEditor.exportButton.getPageLeft(),
            themeEditor.exportButton.getPageTop() + themeEditor.exportButton.getHeight()
        )
        this.exportThemeDialog.show();
    },
    exportTheme : function (asBaseSkin) {
        // stub for server exportTheme() API
        appState.notifyMessage("Exporting skin " + appState.theme + "...");
        var _this = this;
        isc_userSkin.fetchData({name: appState.theme}, function (resp, data) {
            var d = isc.isAn.Array(data) ? data[0] : data;
            var css = d.skinStylesCSS;
            isc_userSkin.performCustomOperation("export", 
                { 
                    name: appState.theme, 
                    baseSkin: appState.baseTheme, 
                    content: _this.getCurrentUserSettings(true),
                    skinStylesContent: css,
                    thumbnail: themeEditor.thumbnailImage,
                    asBaseSkin: !!asBaseSkin
                },
                function () {
                    // log a skin export
                    appState._addUsageRecord("appExportSkin", appState.theme, "");
                },
                { downloadResult: true }
            );
        });
    },
    setCurrentTheme : function (theme) {

        // if there are changes, clear them 
        appState.clearChanges();
        // clear out the previewPane
        themeEditor.clearPreviewPane();

        // clear the trees
        themeEditor.clearTrees();

        appState.savedMap = {};
        appState.currentMap = {};
        appState.changedMap = {};

        appState.cacheThemes();
        this.theme = theme;

        if (theme == null) {
            for (var i = 0; i < appState.themeObservers.length; i++) {
                this.themeChangedNotify(this.themeObservers[i]);
            }
            return;
        }
        isc_userSkin.fetchData({name: theme}, function (dsResponse, data) {
            var d = data;
            if (isc.isAn.Array(d)) d = d[0];
            appState.baseTheme = d.baseSkin;
            appState.userSettingsFile = "" + d.userSettings;
            d = null;
            isc_baseSkin.fetchData({name: appState.baseTheme}, function (dsResponse, data) {
                var d = data;
                if (isc.isAn.Array(d)) d = d[0];
                appState.baseSettingsFile = d.skinSettings;

                // get the json config (complex transform information) for the baseSkin
                appState.baseConfig = d.skinConfig ? isc.JSON.decode(d.skinConfig) : { settings:{} };
                //isc.logWarn(isc.echoFull(appState.baseConfig), "themeEditor");
                d = null;

                // clear out the transforms on the base data, and the usedBy arrays
                themeEditor.getVariableData().setProperty("transform", null);
                themeEditor.getVariableData().setProperty("usedBy", null);
                themeEditor.getVariableData().setProperty("_hasIcon", null);
                themeEditor.getVariableData().setProperty("hasPartialChange", null);

                // make a map of variable-name to ds-record - used throughout
                appState.dsDataMap = variableMetadataDS.cacheData.makeIndex("name");

                var c = appState.baseConfig.settings;
                for (var key in c) {
                    // update the "transform" field on associated variable records
                    var record = themeEditor.getVariableDataRecord(key);
                    if (record) {
                        var t = c[key].transform;
                        var value = utils.getTransformString(t);
                        //record.transformString = value;
                        var result = utils.parseAdjustColor(value);
                        if (result && result.derivesFrom != null) {
                            // update the "usedBy" array on the derivesFrom variable, so that
                            // setting the initial value of custom transforms that derive from 
                            // other custom transforms works properly
                            var dRecord = themeEditor.getVariableDataRecord(result.derivesFrom);
                            if (dRecord) {
                                if (!dRecord.usedBy) dRecord.usedBy = [];
                                if (!dRecord.usedBy.contains(key)) dRecord.usedBy.add(key);
                            }
                        }
                    }
                }

                // parse the skin's variable-list
                appState.baseSettingsFile = appState.baseSettingsFile.replaceAll(" !default;", ";");
                var content = isc.SkinFunc.readSection("theme_variables", appState.baseSettingsFile);
                appState.baseSettings = appState.parseSettings(content||"", "themeValue");
                appState.baseMap = appState.baseSettings.getValueMap("name", "value");

                // savedMap is the values from the baseSkin, overlaid with the saved custom 
                // values, if any
                appState.savedMap = isc.addProperties({}, appState.baseMap);
                appState.customSettings = appState.parseSettings(appState.userSettingsFile, "savedValue") || [];
                var customMap = appState.customSettings.getValueMap("name", "value");
                for (var key in customMap) {
                    appState.savedMap[key] = customMap[key];
                }

                // initialize currentMap as a copy of the savedMap
                appState.currentMap = isc.addProperties({}, appState.savedMap);

                if (appState.importingOverlay) {
                   // if set, importOverlay() has been called
                   // overlay the import settings
                    var oSettings = appState.importingOverlay.settings;
                    for (var key in oSettings) {
                        appState.currentMap[key] = oSettings[key];
                    }
                }

                for (var i = 0; i < appState.themeObservers.length; i++) {
                    appState.themeChangedNotify(appState.themeObservers[i]);
                }

                // log skin load
                appState._addUsageRecord("appLoadSkin", appState.theme, "");
            });
            //, { outputs: "name,skinConfig,skinSettings,thumbnail" });
        }, { outputs: "pk,name,baseSkin,userSettings,thumbnail" });
    }, 
    getCurrentUserSettings : function (finalOutput) {
        var SF = isc.SkinFunc;
        var data = themeEditor.getVariableData();
        var changes = appState._changes;
        for (var i=0; i<changes.length; i++) {
            //var record = data.find("name", changes[i].name);
            var record = appState.dsDataMap[changes[i].name];
            if (record) {
                var parsedValue = changes[i].newValue;
                record.customValue = parsedValue;
                record.value = parsedValue;
                record.transformedValue = parsedValue;
                record.transformResult = null;
                if (!utils.isAdjustColor(parsedValue)) {
                    utils.replaceValueTokens(record)
                }
                utils.parseTransform(record);
                if (record.valueType == "color") {
                    if (record.value.length == 9 && record.value.startsWith("#")) {
                        record.value = utils.toRgbColor(record.value);
                    }
                }
                themeEditor.updateVariableNode(record);
            }
        }
        
        var config = appState.baseConfig.settings;
        for (var key in config) {
            if (!appState.changedMap[key]) {
                // variable hasn't changed - transform the value
                var record = appState.dsDataMap[key];
                if (appState.variableValues[key]) {
                    if (record.valueType == "color") {
                        if (appState.variableValues[key].value.length == 9) {
                            // hex8 - SASS doesn't support this, so map to rgba()
                            record.transformResult = utils.toRgbColor(appState.variableValues[key].value);
                        } else {
                            record.transformResult = appState.variableValues[key].value;
                        }
                    } else {
                    record.transformResult = appState.variableValues[key].value;
                    }
                } else if (record && record.customValue != record.themeValue) {
                    var value = utils.getTransformString(config[key].transform);
                    var transform = utils.parseAdjustColor(value);
                    record.customValue = value;
                    record.value = transform.sass || transform.result;
                    record.transformedValue = record.value;
                    record.transformResult = record.value;
                }
                
            }
        }
        
        var userSettings = SF.getVariableScript(data, {includeAll: true}, groupMetadataDS.cacheData);
        
        // content is a copy of the base file _skinSettings.scss, with the theme_variables and
        // theme_fonts sections regenerated 
        var content = "" + appState.baseSettingsFile;
        if (!content.contains("theme_variables")) {
            // backcompat, wrap the content in theme_variables tags
            content = "//>theme_variables\n" + content + "\n//<theme_variables";
        }
        content = SF.replaceSectionContent("theme_variables", userSettings, content);

        // get the output CSS for the selected @font-faces
        //var fontFaceCSS = appState.getFontScript(false);
        //isc.logWarn(fontFaceCSS);
        //content = SF.replaceSectionContent("theme_fonts", fontFaceCSS, content);

        if (this.livePreview && !finalOutput) {
            // generate css variables - these are mutable at runtime
            var cssVars = "\n\n//* CSS *//\n @function v($var) {@return var(--#{$var});}\n:root {";
            cssVars += isc.SkinMetadata.generateThemeCssProperties(userSettings, data);
            cssVars += ";\n}";
            this.logInfo(cssVars, "themeEditor");
            content += cssVars;
        }

        return content;
    },

    parseSettings : function (content, valueField) {
        var list = [],
            attrStart = -1,
            attrEnd,
            lineEnd = -1,
            index = 0
        ;

        var c = content;
        // this shouldn't happen, but trim at this marker if it's there
        var cssOffset = c.indexOf("//* CSS *//");
        if (cssOffset > 0) {
            c = c.substring(0, cssOffset-1);
        }

        // build the passed contents into a flat list of declared vars    
        while (true) {
            attrStart = c.indexOf("$", lineEnd+1);
            if (attrStart == -1) {
                break;
            }
            attrEnd = c.indexOf(":", attrStart);
            lineEnd = c.indexOf(";", attrEnd+1)

            // set name and value, and index (for sorting)
            var item = { 
                name: c.substring(attrStart, attrEnd),
                value: c.substring(attrEnd+1, lineEnd).trim(),
                index: index++
            };
            // if there's a config entry for this variable, apply it to the item
            var config = appState.baseConfig.settings[item.name];
            if (config) {
                item.config = utils.getTransformString(config.transform);
            }
            // also set item[valueField] to the same value 
            item[valueField] = item.value;
            list.add(item);
        }
        return list;
    },
    notifyMessage : function (message, actions, type, config) {
        //var config = null;
        isc.notify(message, actions, type || "message", config);
    },

    // theme changed notifications
    //-----------------------------------------------------------------------------------------------
    themeObservers: [],
    addThemeObserver : function (observer) {
        this.themeObservers.add(observer);
        // on a delay, so the observer can finish init, notify it of the current theme
        this.delayCall("themeChangedNotify", [observer]);

        // auto enable/disable based on null theme with disableOnNullTheme override to suppress
        // note: parallel property-based implementation to logic in themeChangedNotify to ensure state
        // is correctly set at init such that we avoid a visible UI shift from base state to the state
        // dictated by the themeChangedNotify that happen on delay (above) to ensure init completes
        if (observer.disabled == null) {
            var theme = this.theme;

            if (!theme) {
                if (observer.disableOnNullTheme !== false) observer.disabled = true;
            } else {
                observer.disabled = false;
            }
        }

    },
    removeThemeObserver : function (observer) {
        this.themeObservers.remove(observer);
    },
    themeChangedNotify : function (observer) {
        // do all this in a try/catch block so that a failure to deliver to one listener
        // doesn't cause all remaining listeners to fail to update
        try {
            // auto enable/disable based on null theme with disableOnNullTheme override to suppress
            if (!this.theme) {
                if (observer.disableOnNullTheme !== false) observer.setDisabled(true);
            } else {
                if (observer.updateState) observer.updateState();
                else observer.setDisabled(false);
            }

            // if there's an explicit setTheme method, call that - otherwise call setData if available
            if (observer.setTheme) observer.setTheme(this.theme);
            else if (observer.setData) observer.setData(this.theme);

            // patch on the new theme for easy local access, but do this after settheme/setData
            // so the callee gets to see the old theme record, if desired
            observer.theme = this.theme;
        } catch (e) {
            isc.Log.logWarn("Error propagating theme to observer: " + observer.ID + " - " + e 
                + this.getStackTrace(), "themeEditor");
        }
    },
    themeDirtyNotify : function (observer) {
        // do all this in a try/catch block so that a failure to deliver to one listener
        // doesn't cause all remaining listeners to fail to update
        try {
            // fire updateState() on listeners when dirty state changes
            if (observer.updateState) observer.updateState();
        } catch (e) {
            isc.Log.logWarn("Error notifying dirty theme to observer: " + observer.ID + " - " + 
                e + this.getStackTrace(), "themeEditor");
        }
    },

    /*
    captureUsageData: true,
    _usageDataMaxArgLength: 2000,

    _startCapturingUsageData : function () {
        var ds = this.usageDataSource = isc.DS.get(this.usageDataSource || "isc_hostedUsageData");
        if (ds) {
            var builder = this;
            this.observe(isc.RPCManager, "handleLoginSuccess", function () {
                builder._addUsageRecord("relogin", builder.getSessionLengthInSeconds());
            });
            this.logInfo("Capturing usage data to DS " + ds.getID());

        } else this.logWarn("Unable to capture usage data; the DS could not be loaded");
    },
    */

    // usage-logging stubs
    usageDataSource: null,
    userId: null,
    organization: null,
    _addUsageRecord : function (action, data, data2) {
        var ds = this.usageDataSource;

        if (data  != null && !isc.isA.String(data))  data  = data.toString();
        if (data2 != null && !isc.isA.String(data2)) data2 = data2.toString();
        
        if (ds) {
            ds.addData({
                timeStamp: new Date(),
                userId: this.userId,
                organization: this.organization,
                product: "skinEditor",

                action: action,
                data: data,
                data2: data2

            }, null, {showPrompt: false});
        } else {
            isc.logWarn("Usage: action=" + action + ", data=" + data + 
                (data2 == null ? "" : ", data2=" + data2));
        }
    },

    allFonts: [
        { 
            name: "corbel", family: "corbel",
            css: "@font-face {\n\tfont-family: 'corbel';\n" +
                "    src: url('../fonts/corbel/corbel.ttf');\n" +
                "    src: url('../fonts/corbel/corbel.eot')\9;\n" +
                "    src: local('☺'), url('../fonts/corbel/corbel.woff') format('woff'),\n" +
                "        url('../fonts/corbel/corbel.otf') format('opentype'),\n" +
                "        url('../fonts/corbel/corbel.ttf') format('truetype'),\n" +
                "        url('../fonts/corbel/corbel.svg') format('svg');\n" +
                "    font-weight: normal;\n" +
                "    font-style: normal;\n}"
        },
        { 
            name: "calibri", 
            css: "@font-face {\n\tfont-family: 'calibri';\n" +
                "    src: url('../fonts/calibri/CALIBRI_1.TTF');\n" +
                "    font-weight: normal;\n" +
                "    font-style: normal;\n}"
        },
        { 
            name: "RobotoLight", family: "RobotoLight",
            css: "@font-face {\n\tfont-family: 'RobotoLight';\n" +
                "    src: url('../fonts/RobotoLight/RobotoLight.ttf');\n" +
                "    src: url('../fonts/RobotoLight/RobotoLight.eot')\9;\n" +
                "    src: local('☺'), url('../fonts/RobotoLight/RobotoLight.woff') format('woff'),\n" +
                "        url('../fonts/RobotoLight/RobotoLight.otf') format('opentype'),\n" +
                "        url('../fonts/RobotoLight/RobotoLight.ttf') format('truetype'),\n" +
                "        url('../fonts/RobotoLight/RobotoLight.svg') format('svg');\n" +
                "    font-weight: normal;\n" +
                "    font-style: normal;\n}"
        }
        /*
        ,
        { 
            name: "OpenSans", 
            css: "@font-face {\n\tfont-family: 'OpenSans';\n" +
                "    src: url('../fonts/OpenSans/OpenSans-Regular.ttf');\n}"
        },
        { 
            name: "Nunito", 
            css: "@font-face {\n\tfont-family: 'Nunito';\n" +
                "    src: url('../fonts/Nunito/Nunito-Regular.ttf');\n}"
        }
        */
    ],

    getUsedFonts : function () {
        var data = themeEditor.getVariableData().findAll("valueSubType", "family").getProperty("transformResult");
        var list = data.getUniqueItems();
        var result = [];
        for (var i=0; i<list.length; i++) {
            if (!list[i].startsWith("$")) result.add(list[i]);
        }
        return result;
    },
    getFontScript : function (returnNames) {
        var usedFonts = appState.getUsedFonts();
        if (returnNames) return usedFonts;
        var output = [];
        for (var i=0; i<usedFonts.length; i++) {
            var font = appState.allFonts.find("name", usedFonts[i]);
            if (!font) continue;
            if (font.css) output.add(font.css);
            else {
                var msg = "@font-face {\n\tfont-family: '" + font.name + ";\n\t";
                msg += "src: url('" + font.src + "');\n}"
                output.add(msg);
            }
        }
        return output.join("\n\n");
    }
});

isc.defineInterface("IThemeObserver").addInterfaceProperties({
initInterface : function () {
    appState.addThemeObserver(this);
},
destroyInterface : function () {
    appState.removeThemeObserver(this);
}
});

isc.defineClass("ThemeEditor", "VLayout");
isc.ThemeEditor.addProperties({
    dataSource: "skinVariables",

    styleName: "themeEditor",
    
    useDragMask: true,
    
    headerLayoutDefaults: {
        _constructor: "HLayout",
        height: 1,
        overflow: "visible",
        layoutMargin: 5,
        layoutRightMargin: 0,
        membersMargin: 10,
        styleName: "themeheader",
        defaultLayoutAlign: "center"
    },
    
    headerIconDefaults: {
        _constructor: "Img",
        width: 32,
        height: 32,
        imageWidth: 24, imageHeight: 24,
        imageType: "center",
        src: "logo.png"
    },
    headerLabelDefaults: {
        _constructor: "Label",
        autoFit: true,
        wrap: false,
        styleName: "pageTitle",
        contents: "Isomorphic Skin Editor"
    },

    userMenuButtonConstructor: "MenuButton",
    userMenuButtonDefaults: {
        autoParent: "pageHeader",
        autoDraw: false,
        title: isc.Canvas.imgHTML("profile.png", 24, 24),
        hoverStyle: "darkHover",
        prompt: "Your account",
        showMenuButtonImage: false,
        baseStyle: "normal",
        width: 30,
        height: 30,
        menu: null
    },

    userMenuConstructor: "Menu",
    userMenuDefaults: {
        autoDraw: false,
        width: 250,
        showKeys: false,
        showSubmenus: false,
        // Remove skin padding on icon to allow embedded component
        // to line up with Log out menu option
        iconFieldProperties: { baseStyle: "menuTitleField" },
        data: [
            {
                isSeparator: true
            },
            {
                title: "Log out",
                click : function (target, item, menu) {
                    appState.signOut();
                }
            }
        ],
        init : function () {
            this.data.addAt({
                showRollOver: false,
                embeddedComponent: isc.VLayout.create({
                    autoDraw: false,
                    height: 1,
                    width: "100%",
                    padding: 10,
                    members: [
                        isc.HLayout.create({
                            autoDraw: false,
                            width: "100%",
                            height: 1,
                            members: [
                                isc.Img.create({
                                    autoDraw: false,
                                    width:50, height:50,
                                    imageType: "center",
                                    src: "profile_large.png"
                                }),
                                isc.Label.create({
                                    autoDraw: false,
                                    height: 50,
                                    padding: 10,
                                    autoFit: true,
                                    contents: "<b>Account</b>"
                                })
                            ]
                        }),
                        isc.Label.create({
                            autoDraw: false,
                            height: 30,
                            contents: window.username ? window.username : ""
                        })
                    ]
                }),
                embeddedComponentFields: ["title", "key", "submenu"]
            }, 0);
            this.Super("init", arguments);
        }
    },
    /*
    userIconDefaults: {
        _constructor: "Img",
        src: "[SKINIMG]headerIcons/person_Over.png",
        width: 32,
        height: 32,
        imageWidth: 24, imageHeight: 24,
        imageType: "center",
        layoutAlign: "right",
        click : function () {
            appState.notifyMessage("User-login: not yet implemented", null, "warn");
        }
    },
*/
    createThemeButtonDefaults: {
        _constructor: "IButton",
        title: "New Skin",
        icon: "create.png",
        autoFit: true, 
        _mixIns: "IThemeObserver",
        disableOnNullTheme: false,
        click : function () {
            this.creator.showStartPane();
            //this.creator.showCreateThemeDialog();
        }
    },
    
    editSkinFormDefaults: {
        _constructor: "DynamicForm",
        autoDraw: false,
        width: 1,
        height: 1,
        titleWidth: 100,
        wrapItemTitles: false,
        numCols: 3,
        colWidths: [ 100, 120, 60 ],
        fields: [
            { name: "name", title: "Edit saved skin", width: "*",
                editorType: "SelectItem",
                optionDataSource: "isc_userSkin", 
                displayField: "name",
                valueField: "name",
                optionFilterContext: { outputs: "pk,name,baseSkin,thumbnail" },
                changed : function (form, item, value) {
                    //form.getItem('loadForEdit').setDisabled(value == null);
                    appState.setCurrentTheme(null);
                    var theme = form.getValue("name");
                    appState.notifyMessage("Loading Skin '" + theme + "'...");
                    appState.setCurrentTheme(theme);
                }
            },
            { name: "loadForEdit", type: "button", title: "Edit", width: "*", startRow: false,
                icon: "edit.png",
                disabled: true,
                showIf: "return false;",
                click : function () {
                    appState.setCurrentTheme(null);
                    var theme = this.form.getValue("name");
                    appState.notifyMessage("Loading Skin '" + theme + "'...");
                    appState.setCurrentTheme(theme);
                }
            }
        ]
    },
    
    startPaneDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: "100%",
        align: "center",
        layoutMargin: 20,
        membersMargin: 10,

        styleName: "startPane",

        innerLayoutDefaults: {
            _constructor: "VLayout",
            width: 1,
            height: "100%",
            defaultLayoutAlign: "left",
            membersMargin: 5
        },
        
        labelDefaults: {
            _constructor: "Label",
            width: 1,
            height: 1,
            autoFit: true,
            wrap: false,
            align: "left",
            paddingLeft: 0,
            contents: "Enter a name for your Skin",
            styleName: "startPaneTitle"
        },
        
        formDefaults: {
            _constructor: "DynamicForm",
            dataSource: "isc_userSkin",
            width: 300,
            height: 1,
            numCols: 2,
            colWidths: [300, "*"],
            extraSpace: 10,
            autoFocus: true,
            saveOnEnter: true,
            items: [
                { name: "name", showTitle: false, width: "*", required: true, 
                    changeOnKeypress: true, validateOnChange: true,
                    validators: [
                        { 
                            type: "custom", 
                            defaultErrorMessage: "Skin name can only contain alpha-numeric " +
                                "characters and underscores.",
                            condition : function (item, validator, value, record, extra) {
                                // validate that the themeName is alpha-numerics and "_" chars only
                                if (value == null || value == "") return true;
                                var r = new RegExp(/[^a-zA-Z\d_]/);
                                if (r.test(value)) {
                                    return false;
                                } return true;
                            }
                        }
                    ]
                },
                { name: "blurb", type: "blurb", showTitle: false, 
                    defaultValue: "(Alpha-numeric, no special characters)",
                    startRow: false
                },
                { name: "baseSkin", showIf: "return false;", required: true },
                { name: "skinStylesCSS", showIf: "return false;" }
            ],
            validate : function () {
                var values = this.values;
                
                if (!values.name || values.name.length == 0) {
                    // missing name
                    isc.say("Please enter a unique name for your Skin.");
                    this.getItem("name").focusInItem();
                    return false;
                } else if (appState.getCachedThemes().getProperty("name").contains(values.name)) {
                    // existing User or Base skin
                    isc.say("A Skin called '" + values["name"] + "' already exists.  Please choose a different name.");
                    this.getItem("name").focusInItem();
                    return false;
                } else if (!values.baseSkin || values.baseSkin == "") {
                    // no baseSkin selected
                    isc.warn("Please select an existing Skin as a starting point.", {title: "No base Skin selected"});
                    this.creator.tileGrid.focus();
                    return;
                }
                return this.Super("validate", arguments);
            },
            submit : function () {
                this.creator.runCreateTheme();
            }
        },

        tileGridLabelDefaults: {
            _constructor: "Label",
            width: 1,
            height: 1,
            autoFit: true,
            wrap: false,
            align: "left",
            paddingLeft: 0,
            marginLeft: 0,
            contents: "Select an existing Skin as a starting point",
            styleName: "startPaneTitle"
        },
        
        tileGridDefaults: {
            _constructor: "TileGrid",
            dataSource: "isc_baseSkin",
            //dataSource: "isc_userSkin",
            autoFetchData: true,
            tileWidth: 150,
            tileHeight: 190,
            width: 500,
            height: 405,
            numCols: 1,
            extraSpace: 10,
            // doesn't work on TileGrid - see baseSkin.transformResponse override
            //initialSort: [ { property: "sortIndex", direction: "ascending"} ],
            selectRecord : function (record, newState) {
                this.Super("selectRecord", arguments);
                var form = this.creator.form;
                form.setValue("baseSkin", record.name);
            },
            recordClick : function (viewer, tile, record) {
                var form = viewer.creator.form;
                form.setValue("baseSkin", record.name);
            },
            recordDoubleClick : function (viewer, tile, record) {
                viewer.creator.runCreateTheme();
            },
            canFocus: false,
            tileConstructor: "CustomTile",
            tileProperties: { 
                canFocus: true,
                keyPress : function () {
                    var kName = isc.EH.getKey();
                    if (kName == "Enter" || kName == "Space") {
                        this.creator.selectRecord(this.creator.getTileRecord(this));
                    }
                },
                showSelected: true
            },
            dataArrived : function () {
                var rec = this.data.find("name", "Tahoe") || this.data.get(0);
                this.selectRecord(rec);
            }
        },
        
        buttonLayoutDefaults: {
            _constructor: "HLayout",
            width: 500,
            height: 1,
            overflow: "visible",
            align: "right"
        },
        
        createThemeButtonDefaults: {
            _constructor: "IButton",
            title: "Create and Edit Skin",
            icon: "create.png",
            autoFit: true,
            click : function () {
                this.creator.runCreateTheme();
            }
        },
        runCreateTheme : function () {
            if (this.form.validate()) {
                var values = this.form.getValues();
                values.userSettings = "\"$theme_name\":'" + values.name + "';";
                this.form.addData(values, function (dsResponse, data) {
                    if (isc.isAn.Array(data)) data = data[0];
                    if (dsResponse.status == 0) {
                        appState.createTheme(data.name, data.baseSkin);
                    }
                });
            }
        },
        
        initWidget : function () {
            this.Super("initWidget", arguments);
            this.addAutoChild("innerLayout");
            this.addMember(this.innerLayout);
            
            this.addAutoChild("label");
            this.addAutoChild("form");
            
            this.addAutoChild("tileGridLabel");
            this.addAutoChild("tileGrid");
            this.innerLayout.addMembers([this.label, this.form, this.tileGridLabel, this.tileGrid]);

            this.addAutoChild("createThemeButton");
            this.addAutoChild("buttonLayout");
            this.buttonLayout.addMembers([this.createThemeButton]);
            
            this.innerLayout.addMembers([this.buttonLayout]);
            
            //appState.startCapturing();
        },

        clearValues : function () {
            this.form.clearValues();
            this.tileGrid.deselectAllRecords();
            if (this.tileGrid.data.length > 0) {
                this.tileGrid.selectRecord(this.tileGrid.data.find("name", "Tahoe"));
            }
        }
    },

    createThemeDialogDefaults: {
        _constructor: "Window",
        title: "Create Skin",
        autoDraw: false,
        autoSize: true,
        autoCenter: true,
        showMinimizeButton: false,
        showMaximizeButton: false,
        showCloseButton: true,
        isModal: true,
    
        formDefaults: {
            _constructor: "DynamicForm",
            dataSource: "isc_userSkin",
            autoDraw: false,
            width: 300,
            height: 1,
            numCols: 1,
            margin: 10,
            cellPadding: 5,
            overflow: "visible",
            titleOrientation: "top",
            autoFocus: true,
            itemChanged: "this.creator.checkValid()"
        },
    
        buttonLayoutDefaults: {
            _constructor: "HLayout",
            width: "100%",
            height: 1,
            overflow: "visible",
            layoutAlign: "right",
            layoutMargin: 10,
            membersMargin: 10
        },
        
        createThemeButtonDefaults: {
            _constructor: "IButton",
            title: "Create Skin",
            icon: "create.png",
            disabled: true,
            autoFit: true,
            autoDraw: false,
            click : function () {      
                var creator = this.creator;
                var form = creator.form;
                // fire this first for validation
                form.addData(form.getValues(), function (dsResponse, data) {
                    if (isc.isAn.Array(data)) data = data[0];
                    if (dsResponse.status == 0) {
                        appState.createTheme(data.name, data.baseSkin);
                        creator.hide();
                    }
                });
            }
        },

        cancelButtonDefaults: {
            _constructor: "IButton",
            title: "Cancel",
            autoFit: true,
            autoDraw: false,
            click : function () {
                this.creator.hide();
            }
        },

        initWidget : function () {
            this.Super("initWidget", arguments);
            var items = [
                { name: "name", title: "Enter a Skin Name", width: 300},
                { name: "baseSkin", title: "Select an existing Skin as a starting point",
                    editorType: "SelectItem", 
                    optionDataSource: "isc_baseSkin", 
                    displayField: "name",
                    valueField: "name"
                }
            ];
            this.addAutoChild("form", { items: items });
            
            this.addAutoChild("cancelButton");
            this.addAutoChild("createThemeButton");
            this.addAutoChild("buttonLayout");
            this.buttonLayout.addMembers([this.cancelButton, this.createThemeButton]);
            
            this.addItem(this.form);
            this.addItem(this.buttonLayout);
        },
        checkValid : function () {
            this.createThemeButton.setDisabled(!this.form.valuesAreValid());
        },
        show : function () {
            this.form.clearValues();
            this.createThemeButton.setDisabled(true);
            return this.Super("show", arguments);
        }
    },
    showCreateThemeDialog : function () {
        if (!this.createThemeDialog) {
            this.createThemeDialog = this.createAutoChild("createThemeDialog", {
           
            });
        }
        this.createThemeDialog.show();
    },

    themeNameLabelDefaults: {
        _constructor: "Label",
        autoFit: true,
        wrap: false,
        styleName: "themeNameLabel",
        _mixIns: "IThemeObserver",
        setTheme : function (theme) {
            this.setContents(theme);
        },
        doubleClick : function () {
            // support Theme-rename on label doubleClick
            this.creator.showThemeLabelEditForm();
        },
        showHover: true,
        prompt: "Double-click to rename Skin"
    },
    
    showThemeLabelEditForm : function () {
        if (!this.themeLabelEditForm) {
            this.themeLabelEditForm = this.createAutoChild("themeLabelEditForm");
        }
        var top = this.themeNameLabel.getTop();
        var left = this.themeNameLabel.getLeft();
        var right = themeHeaderSpacer.getLeft() + themeHeaderSpacer.getVisibleWidth();
        var width = right - left;
        
        var form = this.themeLabelEditForm;
        form.hide();
        form.setValue("name", appState.theme);
        this.themeLayout.addChild(form);
        form.moveTo(top, left);
        form.resizeTo(width);
        form.show();
        form.bringToFront();
    },
    
    themeLabelEditFormDefaults: {
        _constructor: "DynamicForm",
        autoFocus: true,
        items: [
            { name: "name", type: "text", width: "*", colSpan: "*", showTitle: false,
                changeOnKeypress: true, 
                //validateOnChange: true, 
                required: true,
                keyPress : function (item, form, keyName) {
                    if (keyName == "Enter") {
                        item.delayCall("blur", [form, item]);
                    } else if (keyName == "Escape") {
                        form.hide();
                    }
                },
                blur : function (form, item) {
                    if (this.skipBlurDuringRename) {
                        delete this.skipBlurDuringRename;
                    } else item.delayCall("renameTheme", [item]);
                },
                renameTheme : function (item) {
                    if (!item.validate()) {
                        item.focusInItem();
                        return;
                    }
                    var value = item.getValue();
                    if (value == appState.theme) {
                        themeEditor.themeLabelEditForm.hide();
                        return;
                    }
                    if (appState.getCachedThemes().getProperty("name").contains(value)) {
                        // existing User or Base skin
                        isc.say("A Skin called '" + value + "' already exists.  Please choose a different name.");
                        return;
                    }
                    themeEditor.themeLabelEditForm.hide();
                    appState.renameTheme(appState.theme, value);
                    this.skipBlurDuringRename = true;
                },
                validators: [
                    { 
                        type: "custom", 
                        defaultErrorMessage: "Skin name can only contain alpha-numeric characters.",
                        condition : function (item, validator, value, record, extra) {
                            // validate that the themeName is alpha-numerics and "_" chars only
                            if (value == null || value == "") return true;
                            var r = new RegExp(/[^a-zA-Z\d_]/);
                            if (r.test(value)) {
                                return false;
                            } return true;
                        }
                    }
                ]
            }
        ]
    },

    showHelpButtonDefaults: {
        _constructor: "IButton",
        title: "Help",
        icon: "help_show.png",
        iconSize: 20,
        autoFit: true,
        showRollOver: false,
        showDown: false,
        showHover: true,
        hoverAutoFitMaxWidth: 300,
        layoutAlign: "right",
        baseStyle: "showHelpButton",
        prompt: "Hints and tips for creating UI skins",
        click : function () {
            this.creator.showHelpPanel();
        }
    },

    helpPanelDefaults: {
        _constructor: "VLayout",
        overflow: "auto",
        layoutMargin: 0,
        membersMargin: 0,
        styleName: "helpPanel",
        width: 310,
        hideButtonDefaults: {
            _constructor: "IButton",
            title: "Hide",
            icon: "help_hide.png",
            iconSize: 20,
            autoFit: true,
            showRollOver: false,
            showDown: false,
            showHover: true,
            hoverWidth: 200,
            layoutAlign: "left",
            baseStyle: "hideHelpButton",
            click : function () {
                this.creator.slideOut();
            }
        },
        labelDefaults: {
            _constructor: "Label",
            padding: 10,
            width: "100%",
            height: "100%",
            valign: "top"
        },
        initWidget : function () {
            this.Super("initWidget", arguments);
            var content = [];

            content.add(this.getHelpSection("help_create", "Create a skin", "Give your skin a name and select the " +
                        "closest existing skin as a starting point."));
            content.add(this.getHelpSection("help_edit", "Edit skin", "Change the colors, borders and fonts in your " +
                        "skin. If you change settings closer to the top of the tree, many components will be affected, " +
                        "as their settings are derived from more basic levels."));
            content.add(this.getHelpSection("help_preview", "Preview", "Select views to see how your changes look. " +
                        "You can reset changes to their original values using the Revert icon. On saving your skin, " +
                        "it can become available in Reify, Isomorphic's low-code platform."));
            content.add(this.getHelpSection("help_export", "Export", "When you are happy with your skin, save then export it."));
            content.add(this.getHelpSection("help_implement", "Implement skin", "The steps for implementing your skin can be found in the Quick Start Guides for " +
                "<a target='_blank' href='https://www.smartclient.com/smartclient-release/docs/SmartClient_Quick_Start_Guide.pdf#page=104'>SmartClient</a>" +
                " and <a target='_blank' href='https://www.smartclient.com/smartgwt-release/doc/SmartGWT_Quick_Start_Guide.pdf#page=91'>Smart GWT</a>."
                ));

/* -- this is more descriptive content but not applying pending feedback */
/*
            content.add(this.getHelpSection("help_create", "Get Started", "Select an existing skin from the 'My Skins' picker " +
                        " or click 'New Skin', give your skin a name and choose the closest existing skin as a starting point."));
            content.add(this.getHelpSection("help_edit", "Make Changes", "Use the various trees on the left to make " +
                        "changes to skin elements like colors and fonts.  Settings cascade, so a change to a " +
                        "higher-level setting, closer to the top of the tree, will propagate to other settings that derive " +
                        "from it.  You can reset changes to their original values by clicking the Revert icon to the right " +
                        "of each setting."));
            content.add(this.getHelpSection("help_preview", "Preview", "Changes you make to your skin are reflected " +
                        "in the Preview pane on the right.  Select a view from the picker above it to see how your " +
                        "changes look with different types of framework widgets."));
            content.add(this.getHelpSection("help_save", "Share your vision", "When you're happy with your skin, Save it " +
                        "to make it available to other tools like Reify, Isomorphic's low-code platform."));
            content.add(this.getHelpSection("help_export", "Make it permanent", "Once your skin is saved, you can Export it to " +
                        "a zip file that can be extracted into any Smartclient or SmartGWT project."));
            content.add(this.getHelpSection("help_implement", "Learn about skinning", "Learn more about implementing skins in " +
                "the Quick Start Guides for " +
                "<a target='_blank' href='https://www.smartclient.com/smartclient-release/docs/SmartClient_Quick_Start_Guide.pdf#page=104'>SmartClient</a>" +
                " and <a target='_blank' href='https://www.smartclient.com/smartgwt-release/doc/SmartGWT_Quick_Start_Guide.pdf#page=91'>Smart GWT</a>."
                ));
*/
            this.helpContent = content.join("");
            
            
            this.addAutoChild("hideButton");
            this.addMember(this.hideButton);
            this.addAutoChild("label", { contents: this.helpContent });
            this.addMember(this.label);
        },
        helpIconSize: 28,
        getHelpSection : function (icon, headerText, bodyText) {
            var result = [];
            result[0] = "<div class='helpTextHeader'>";
            if (icon == null) result[1] = "";
            else {
                result[1] = isc.Canvas.getImgHTML({
                    src: icon + ".png", width: this.helpIconSize, height: this.helpIconSize,
                    extraCSSText: "padding-right: 10px;" 
                });
            }
            result[2] = headerText;
            result[3] = "</div><div class='helpTextBody'>";
            result[4] = bodyText;
            result[5] = "</div>";
            return result.join("");
        },
        slideIn : function () {
            var editor = this.creator;
            var fullWidth = editor.getVisibleWidth();
            var t = editor.headerLayout.getTop();
            var l = fullWidth - 1;
            var lEnd = l - this.getWidth();
            var w = this.getWidth();
            var h = (editor.getHeight() - t) - 1;
            this.resizeTo(w, h);
            this.moveTo(l, t);
            this.show();
            this.bringToFront();
            this.animateMove(lEnd, t);
        },
        slideOut : function () {
            var fullWidth = this.creator.getVisibleWidth();
            var t = this.getTop();
            var _this = this;
            this.animateMove(fullWidth, t, 
                function () {
                    _this.hide();
                }
            );
        },
        updatePosition : function () {
            var editor = this.creator;
            var h = (editor.getHeight() - editor.headerLayout.getTop()) - 1;
            this.setHeight(h);
            this.setLeft(editor.getVisibleWidth() - this.getWidth());
        }
    },
    showHelpPanel : function () {
        if (!this.helpPanel) {
            this.helpPanel = this.createAutoChild("helpPanel");
            this.addChild(this.helpPanel);
        }
        this.helpPanel.slideIn();
    },
    hideHelpPanel : function () {
        this.helpPanel.slideOut();
    },

    saveButtonDefaults: {
        _constructor: "IButton",
        title: "Save",
        disabled: true,
        icon: "save.png",
        autoFit: true,
        click : function () {
            appState.saveTheme();
        },
        initWidget : function () {
            this.Super("initWidget", arguments);
            this.observe(appState, "setThemeDirty", "observer.updateState()");
        },
        updateState : function () {
            this.setDisabled(!appState.themeDirty);
        }
    },

    compileButtonDefaults: {
        _constructor: "CompassCompileButton",
        title: "Compile",
        icon: "compile.png",
        _mixIns: "IThemeObserver",
        callback : function (success) {
            this.creator.compileFinished(success);
        }
    },

    deleteButtonDefaults: {
        _constructor: "IButton",
        title: "Delete",
        autoFit: true,
        icon: "delete.png",
        _mixIns: "IThemeObserver",
        click : function () {
            appState.deleteTheme();
        },
        updateState : function () {
            // disable if there's no theme loaded or there are local changes
            this.setDisabled(!appState.theme);
        }
    },

    exportButtonDefaults: {
        _constructor: "IButton",
        title: "Export",
        autoFit: true,
        icon: "export.png",
        _mixIns: "IThemeObserver",
        click : function () {
            appState.showExportThemeDialog();
        },
        updateState : function () {
            // disable if there's no theme loaded or there are local changes
            this.setDisabled(!appState.theme || appState.themeDirty);
        }
    },

    initWidget : function () {
        this.Super("initWidget", arguments);

        appState.cacheThemes();
        this.initNotify();
        this.buildComponents();

        if (appState.autoShowStartPane) this.showStartPane();

        // if not running in reify.com, show a once-ever notification
        if (!window.location.toString().contains("reify.com")) {
            // one-time suggestion to use Reify
            if (!localStorage.iscSkipOpenReifyMsg) {
                var msg = "Creating skins for Reify?  Go to " +
                        "<a class='notifyMessageActionLink' href='https://create.reify.com/themes' " + 
                        "target='_self'>create.reify.com/themes</a> instead.";
                appState.notifyMessage(msg, null, null, { duration: 0 });
                localStorage.iscSkipOpenReifyMsg = true;
            }
        }
    },
    
    showStartPane : function (skipChangesCheck) {
        var _this = this;
        if (!skipChangesCheck && this.hasChanges()) {
            isc.confirm("You have unsaved changes - continue and lose your changes?",
                function (value) {
                    if (value == true) {
                        // log changes being dropped on "New Skin" click
                        appState._addUsageRecord("appDiscardChanges", "showStartPane", "");
                        _this.showStartPane(true);
                    }
                }, { title: "Discard Changes" }
            )
            return;
        }
        
        this.bodyLayout.addChild(this.startPane);
        this.startPane.clearValues();
        this.startPane.setWidth("100%");
        this.startPane.setHeight("100%");
        this.startPane.show();
        this.startPane.bringToFront();
        if (this.createThemeButton) {
            this.createThemeButton.hide();
            isc.Canvas.getById("createThemePlaceholder").show();
        }
        // log the start pane being shown
        appState._addUsageRecord("appShowStartPane", "showStartPane", "");
    },
    hideStartPane : function () {
        this.startPane.hide();
        if (this.startPane.parentCanvas == this.bodyLayout) {
            // only remove the startPane if it's been added
            this.bodyLayout.removeChild(this.startPane);
        }
        this.bodyLayout.redraw();
        if (this.createThemeButton) {
            isc.Canvas.getById("createThemePlaceholder").hide();
            this.createThemeButton.show();
        }
    },

    // notifications
    notifyTypes: ["message", "warn", "error"],
    notifyConfig: {
        canDismiss: true,
        appearMethod: "slide",
        disappearMethod: "fade",
        position: "T",
        multiMessageMode: "replace",
        autoFitMaxWidth: 350,
        slideSpeed: 250
    },
    initNotify : function () {
        var _this = this;
        this.notifyTypes.map(function (notifyType) {
            isc.Notify.configureMessages(notifyType, _this.notifyConfig);
        });
    },

    applyOverlaySettings : function (customSettings, skipNotify) {
        // bail if no appState - should never happen
        if (!appState || !appState.baseSettings) return;
        // overlay custom settings onto the baseSettings as customValue entries    
        customSettings = customSettings || [];
        var customMap = customSettings.makeIndex("name");
        var baseSettings = appState.baseSettings;
        for (var i=0; i<baseSettings.length; i++) {
            var name = baseSettings[i].name;
            var customItem = customMap[name];
            // store the savedValue for change comparison later
            if (customItem) baseSettings[i].savedValue = customItem.savedValue;
            else baseSettings[i].savedValue = baseSettings[i].themeValue
            if (name == "$theme_name") {
                // ensure that when the theme is saved, it update the "theme_name" variable
                baseSettings[i].customValue = "'" + appState.theme + "'";
            } else {
                baseSettings[i].customValue = baseSettings[i].savedValue
            }
            baseSettings[i].value = baseSettings[i].customValue;
        }

        // reset the variable-to-value/uses/usedBy object on appState
        appState.variableValues = null;
        appState.variableValues = {};

        var c = appState.baseConfig.settings;
        for (var i=0; i<baseSettings.length; i++) {
            var lEntry = baseSettings[i];
            var record = appState.dsDataMap[lEntry.name];
            if (record == null) continue;
            //this.logWarn("setting name: " + lEntry.name);
            record.themeValue = lEntry.themeValue;
            record.customValue = lEntry.customValue;
            record.value = record.customValue;

            var uses = [];
            if (c[record.name]) {
                record.transform = c[record.name].transform;
                if (!record.transform.sass) {
                    var conf = c[record.name];
                    var value = utils.getTransformString(conf.transform);
                    var result = utils.parseAdjustColor(value);

                    if (result && result.derivesFrom != null) {
                        record.configResult = result;
                        record.value = result.result;
                    }
                    if (record.configResult && record.configResult) {
                        //>DEBUG
                        //this.logDebug("configResult for " + record.name + " is " + 
                        //    record.configResult.result, "themeEditor");
                        //<DEBUG
                    }
                }
            }
            record.transformedValue = record.value;
            record.transformResult = null;
            if (record.value.startsWith("#")) {
                record.transformResult = utils.toHexColor(record.value);
            } else {
                // don't token-replace adjust-color() calls - parseAdjustColor() needs to know
                // the derivesFrom variable
                if (!utils.isAdjustColor(record.value)) {
                    // this returns the names of other variables used by this record's value
                    uses = utils.replaceValueTokens(record);
                }
                utils.parseTransform(record);
                //this.logDebug(record.name + " - " + lEntry.value + " becomes " + 
                //    record.transformResult, "themeEditor");
            }

            // store the transformResult for all variables in an object on appState - when
            // values are updated, also update this appState object - getVariableValue() is
            // much, much faster accessing that object than calling data.find(), and 
            // replaceValueTokens much faster by replacing the known used variables, rather
            // than testing each variable in order
            uses = uses.getUniqueItems();
            var asObject = { 
                value: record.transformResult,
                uses: uses.duplicate(),
                usedBy: []
            };
            uses = null;
            if (asObject.uses && asObject.uses.length > 0) {
                // add this variable-name to the usedBy arrays on the variables it uses
                for (var k=0; k<asObject.uses.length; k++) {
                    if (!appState.variableValues[asObject.uses[k]].usedBy.contains(record.name)) {
                        appState.variableValues[asObject.uses[k]].usedBy.add(record.name);
                    }
                }
            }
            
            if (record.usedBy && record.usedBy.length > 0) {
                // for custom transforms (config.js), records themselves might have a usedBy
                // array - append those entries to the object on appState and clear the record
                asObject.usedBy.addList(record.usedBy);
                record.usedBy = null;
            }

            // ensure unique items in the usedBy array
            asObject.usedBy = asObject.usedBy.getUniqueItems();
            // assign to the object on appState
            appState.variableValues[record.name] = asObject;
            asObject = null;

            if (record.outputSubgroupId == null) record.outputSubgroupId = "standard";
        }

        // compare maps of settings from the base and custom skins to figure out what 
        // needs updating after load
        appState.updateTheseOnLoad = {};

        for (var key in appState.baseMap) {
            // no custom variable - skin saved in a different framework-version
            if (!appState.currentMap[key]) continue;
            if (appState.currentMap[key] != appState.baseMap[key] ||
                (key.endsWith("font_size") || key.endsWith("fontSize")))
            {
                // customized value - needs to be passed to updateVariableValue()
                appState.updateTheseOnLoad[key] = appState.currentMap[key];
            }
        }

        if (!skipNotify) this.overlaySettingsLoaded();
    },
    overlaySettingsLoaded : function () {
        appState.notifyMessage("Overlay loaded...");
        this.showColorCascade();
        this.showBorderCascade();
        this.showFontCascade();

        // show the previewPane
        appState.updatePreview();
    },
    
    getBaseConfigValue : function (config) {
        if (config.value) return config.value;
        var t = config.transform;
        if (t) {
            // transform has a derivesFrom variable and other details
            var baseVar = themeEditor.getVariableDataRecord(t.derivesFrom);
            if (baseVar) {
                if (t.h != null || t.s != null || t.l != null) {
                    var result = utils.adjustColor(baseVar.transformResult, t.h, t.s, t.l, t.a);
                    this.logInfo("transforming " + baseVar.transformResult + " to " + result, 
                        "themeEditor");
                    return result;
                } else if (t.r != null || t.g != null || t.b != null) {
                    var result = utils.adjustColorRGB(baseVar.transformResult, t.r, t.g, t.b, t.a);
                    this.logInfo("transforming " + baseVar.transformResult + " to " + result);
                    return result;
                }
            }
        }
    },

    setTheme : function (theme) {
        if (!theme) {
            if (!this.startPane.isVisible()) this.showStartPane();
            return;
        }

        if (this.startPane.isVisible()) this.hideStartPane();

        if (!appState.density) {
            // on initial load, if not passed from Reify, appState.density is unset - set it 
            // now, so that subsequent saves provide the selected density back to Reify
            appState.density = themeEditor.densityForm.getValue("density");
        }

        appState._previewReady = false;

        // overlay custom settings onto the skinList as customValue entries    
        this.applyOverlaySettings(appState.customSettings, true);

        for (var key in appState.updateTheseOnLoad) {
            themeEditor.updateVariableValue(key, appState.updateTheseOnLoad[key]);
        }
        delete appState.updateTheseOnLoad;

        this.showColorCascade();
        this.showBorderCascade();
        this.showFontCascade();

        appState.updatePreview();
    },

    resized : function () {
        if (this.helpPanel && this.helpPanel.isVisible()) this.helpPanel.updatePosition();
    },
    
    clearPreviewPane : function () {
        // unload the preview
        this.previewPane.setContentsURL("");
    },
    reloadPreviewPane : function () {
        themeEditor.clearPreviewPane();
        var bgColor = themeEditor.getVariableValue("$standard_bgColor");
        var params = "theme=" + appState.theme + "&baseTheme=" + appState.baseTheme +
                "&startView=" + appState.previewPane +
                (appState.density ? "&density=" + appState.density : "") + 
                (bgColor ? "&bgColor=/" + bgColor : "")
        ;
        this.previewPane.setContentsURL(skinToolsDir+"colorTester.jsp?" + params);
        this.updatePreparingPreviewSpinner("Loading " + 
            (appState.livePreview ? "Live " : "") + "Preview...<br><br>${loadingImage}"
        );
    },
    
    showPreparingPreviewSpinner : function () {
        if (!this.preparingPreviewSpinner) {
            this.preparingPreviewSpinner = this.createAutoChild("preparingPreviewSpinner");
            this.previewPane.addChild(this.preparingPreviewSpinner);
            var pps = this.preparingPreviewSpinner;
            pps.moveTo(Math.round((this.previewPane.getInnerWidth()-pps.getWidth())/2), 
                Math.round((this.previewPane.getInnerHeight()-pps.getHeight())/2)
            ); 
        }
        this.preparingPreviewSpinner.show();
        this.updatePreparingPreviewSpinner("Preparing " + 
            (appState.livePreview ? "Live " : "") + "Preview...<br><br>${loadingImage}"
        );
        this.preparingPreviewSpinner.bringToFront();
    },
    updatePreparingPreviewSpinner : function (message) {
        var pps = this.preparingPreviewSpinner
        if (pps) {
            pps.loadingDataMessage = message;
            pps.redraw();
        }
    },
    hidePreparingPreviewSpinner : function () {
        if (this.preparingPreviewSpinner) {
            this.preparingPreviewSpinner.hide();
        }
    },

    bodyLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: "100%"
    },

    // left pane, themeControls and tabSet
    themeLayoutDefaults: {
        _constructor: "VLayout",
        width: 600,
        height: "100%",
        showResizeBar: true
    },
    themeControlsDefaults: {
        _constructor: "ToolStrip",
        membersMargin: 5
    },
    tabSetDefaults: {
        _constructor: "TabSet",
        width: "100%",
        highlightFormDefaults: {
            _constructor: "DynamicForm",
            snapTo: "TR",
            marginTop: 5,
            marginRight: 5,
            layoutAlign: "right",
            wrapTitles: false,
            items: [
                { name: "highlightColor", title: "Highlight Color", editorType: "ColorItem", 
                    width: 170, selectOnFocus: true, selectOnClick: true, redrawOnChange: true,
                    wrapTitle: false, changeOnKeypress: false, saveOnEnter: true,
                    //canTabToIcons: false,
                    pickerIconProperties: {
                        canFocus: false
                    },
                    changed : function (form, item, oldValue, newValue) {
                        item.applyColor(item, true);
                    },
                    icons: [
                        { name: "revert", src: "revert.png", 
                            showIf : function (form, item) {
                                if (item._savedValue != item.getValue()) {
                                    item.iconPrompt = "Reset to the saved value";
                                    return true;
                                } else if (item._savedValue != item._themeValue) {
                                    item.iconPrompt = "Reset to the value from the base-skin"
                                    return true;
                                }
                                return false;
                            },
                            click : function (form, item) {
                                if (item._savedValue != item.getValue()) {
                                    item.setValue(item._savedValue);
                                } else if (item._savedValue != item._themeValue) {
                                    item.setValue(item._themeValue);
                                }
                                item.blurItem();
                            }
                        }
                    ],
                    prompt: "The highlight color is the general base color for the skin, " +
                        "highlighting important elements of the skin, like buttons, grid-" +
                        "headers and special text, that need to stand out.",
                    keyPress : function (item, form, keyName) {
                        if (keyName == "Enter") item.blurItem();
                    },
                    applyColor : function (item, forceUpdate) {
                        var value = item.toStorageFormat(item.getElementValue());
                        var v = isc.tinycolor(value);
                        if (v.isValid()) {
                            if (v.getOriginalInput() == "transparent") {
                                item.setValue("transparent");
                            } else {
                                item.setValue(utils.toHexColor(v));
                            }
                        }
                        v = null;
                        v = item.getValue();
                        if (forceUpdate || item.form.valuesHaveChanged()) {
                            var varName = "$highlight_color";
                            themeEditor.updateVariableValue(varName, v);
                            var savedValue = item._savedValue;
                            if (v == savedValue) {
                                appState.clearChange(varName);
                                delete appState.changedMap[varName];
                                appState.currentMap[varName] = appState.savedMap[varName];
                            } else {
                                appState.storeChange(varName, savedValue, v);
                                appState.changedMap[varName] = v;
                                appState.currentMap[varName] = v;
                            }
                            savedValue = null;
                            item.form.rememberValues();
                            item.delayCall("focusInItem");
                        }
                    },
                    blur : function (form, item) {
                        if (!form.valuesHaveChanged()) return;
                        this.applyColor(item);
                    },
                    validators: [
                        { 
                            type: "custom", 
                            defaultErrorMessage: "Invalid color value",
                            condition : function (item, validator, value, record, extra) {
                                var v = isc.tinycolor(value);
                                return v.isValid();
                            }
                        }
                    ]
                }
            ]
        },

        setHighlightColor : function (record) {
            if (isc.isA.String(record)) record = this.creator.getVariableDataRecord(record);
            var color = record.transformResult;
            var form = this.highlightForm;
            form.setValue("highlightColor", color);
            form.getItem("highlightColor")._themeValue = appState.baseMap["$highlight_color"];
            form.getItem("highlightColor")._savedValue = color;
            form.rememberValues();
            form.redraw();
        },
        tabSelected : function (tabNum, tabPane, ID, tab, name) {
            if (name == "color") this.highlightForm.show();
            else this.highlightForm.hide();
            // log a tab being selected
            appState._addUsageRecord("appTabSelected", name);
        },
        focusHighlightColor : function () {
            this.highlightForm.focusInItem("highlightColor");
        },
        initWidget : function () {
            this.Super("initWidget", arguments);
            this.addAutoChild("highlightForm");
            this.addChild(this.highlightForm);
            this.highlightForm.bringToFront();
        }
    },
    
    unsavedValueCSS: "color:#5555cc;",
    customizedValueCSS: "font-weight:bold;",

    borderTreeDefaults: {
        _constructor: "SkinVariableTree",
        autoFetchData: false,
        filterOnKeypress: true,
        getTransformResultValue : function (value, record, rowNum, colNum) {
            if (record.valueSubType == "border") {
                return "<div style='padding: 1px; border: " + value + ";'>" + value + "</div>";
            }
            return value;
        },
        /*
        getCustomValueFieldValue : function (value, record, rowNum, colNum) {
            var result = value;
            var v = appState.dsDataMap[value];
            if (v) {
                // value is the name of another variable - show that variable's title
                result = "From: " + this.getVariableLinkHTML(v.name, v.title);
            } else {
                if (value.contains("$")) {
                    // value contains other variables
                    var uses = value.match(/[$]\w+/g);
                    uses = uses.getUniqueItems();
                    for (var j=0; j<uses.length; j++) {
                        var varName = uses[j];
                        var value = themeEditor.getVariableValue(varName);
                        result = result.replaceAll(varName, value);
                        varName = null;
                    }
                    result = "From: " + result;
                }
                // a valid color string or name
                //result = "Fixed: " + value;
            }
            return result;
        },
        */
        cellClick : function (record, rowNum, colNum) {
            var field = this.getField(colNum);
            if (field.name == "transformResult") {
                if (record.valueSubType == "border") {
                    themeEditor.showCSSEditor(record, rowNum, colNum, this, this.borderValueUpdated);
                } else if (record.valueType == "padding") {
                    themeEditor.showCSSEditor(record, rowNum, colNum, this, this.paddingValueUpdated);
                }
            }
        },
        borderValueUpdated : function (values, record) {
            if (!values) return;
            //isc.logWarn("border changed to " + isc.echoFull(values));
            
            // cache the new values
            var color = values["border-color"],
                width = values["border-width"] + "px",
                style = values["border-style"]
            ;
            
            var newValue = width + " " + style + " " + color;
            if (newValue == record.transformResult) {
                // no changes
                return;
            }
            
            var widthVar = styleVar = colorVar = null;
            // split the base value to see whether it was previously build from variables
            var vParts = record.value.split(" ");
            for (var i=0; i<vParts.length; i++) {
                var p = vParts[i];
                if (p.startsWith(record.name)) {
                    // this varName starts with the parent-Var's name - eg, the "border" var
                    // being edited is "$me_border" and this color part is a variable called 
                    // "$me_border_color" - in this case, we want to update the specific
                    // $me_border_color var, not the border var as a whole
                    var varRec = themeEditor.getVariableDataRecord(p);
                    if (p.endsWith("color")) {
                        if (color != varRec.transformResult) {
                            // border-color was changed, and is a variable - store a change, 
                            // and flag the parentVar (the "border" itself), so it also shows 
                            // a "revert" icon
                            colorVar = p;
                            var changeRec = { name: p, transformResult: color, parentVar: record.name };
                            themeEditor.storeRecordUpdate(p, changeRec, varRec, this);
                        }
                    } else if (p.endsWith("width")) {
                        if (width != varRec.transformResult) {
                            // border-width was changed, and is a variable - store a change, 
                            // and flag the parentVar (the "border" itself), so it also shows 
                            // a "revert" icon
                            widthVar = p;
                            var changeRec = { name: p, transformResult: width, parentVar: record.name };
                            themeEditor.storeRecordUpdate(p, changeRec, varRec, this);
                        }
                    } else {
                        // border-style was changed, and is a variable - store a change, 
                        // and flag the parentVar (the "border" itself), so it also shows 
                        // a "revert" icon
                        if (style != varRec.transformResult) {
                            styleVar = p;
                            var changeRec = { name: p, transformResult: style, parentVar: record.name };
                            themeEditor.storeRecordUpdate(p, changeRec, varRec, this);
                        }
                    }
                }
            }
            if (!widthVar && !styleVar && !colorVar) {
                var changeRec = { name: record.name };
                if (style == "none") changeRec.transformResult = style;
                else changeRec.transformResult = width + " " + style + " " + color;
                themeEditor.storeRecordUpdate(record.name, changeRec, record, this);
            }

            // update the transformResult on the "border" variable that was edited, so it 
            // shows the new border style in the grid-row
            var borderVar = themeEditor.getVariableDataRecord(record.name);
            borderVar.transformResult = width + " " + style + " " + color;
        },
        paddingValueUpdated : function (values, record) {
            if (!values) return;
            //isc.logWarn("border changed to " + isc.echoFull(values));
            var changeRec = { name: record.name };
            changeRec.transformResult = values.padding;
            themeEditor.storeRecordUpdate(record.name, changeRec, record, this);
            var paddingVar = themeEditor.getVariableDataRecord(record.name);
            paddingVar.transformResult = values.padding;
        },
        getEditorType : function (fieldName, record) {
            var rec = themeEditor.getVariableDataRecord(record.name);
            if (record.valueSubType == "border") return "StaticTextItem";
            if (record.valueType == "padding") return "StaticTextItem";
            return this.Super("getEditorType", arguments);
        }
    },

    fontTreeDefaults: {
        _constructor: "SkinVariableTree",
        autoFetchData: false,
        canEdit: true,
        getTransformResultCSS : function (record) {
            var css;
            var rec = themeEditor.getVariableDataRecord(record.name);
            var value = rec.transformResult || rec.transformedValue || rec.value;
            if (value != null && value != isc.emptyString) {
                css = "font-family: " + value + ";";
            }
            return css;
        },
        getTransformResultValue : function (value, record, rowNum, colNum) {
            if (record.valueType == "font" && record.valueSubType == "size") {
                var density = appState.getDensity();
                if (density.fontIncrease > 0) {
                    value = appState.dsDataMap[record.name].transformResult;
                    value = value + "&nbsp;&nbsp;<span style='color:blue;font-style:italic;'>(+" + density.fontIncrease + "px)</span>";
                }
            }
            return value;
        },        

        getCustomValueFieldValue : function (value, record, rowNum, colNum) {
            var result = null;
            var v = appState.dsDataMap[value];
            if (v) {
                // value is the name of another variable - show that variable's title
                result = "From: " + this.getVariableLinkHTML(v.name, v.title);
            } else {
                // a valid color string or name
                result = "Fixed: " + value;
            }
            return result;
        },
        getEditorType : function (fieldName, record) {
            var rec = themeEditor.getVariableDataRecord(record.name);
            if (rec.valueSubType == "family") return "SelectItem";
            return "TextItem";
        },

        getEditorValueMap : function (field, values) {
            var rec = themeEditor.getVariableDataRecord(values.name);
            if (rec.valueSubType == "family") {
                return themeEditor.getAvailableFonts();
            }
        },
        cellHoverHTML : function (record, rowNum, colNum) {
            var fieldName = this.getFieldName(colNum);
            if (fieldName == "transformResult") {
                var density = appState.getDensity();
                var dsRec = appState.dsDataMap[record.name];
                if (dsRec.valueSubType == "size" && density.fontIncrease > 0) {
                    var msg = "The base text size for this style is " + 
                            dsRec.transformResult + ".  In the Preview pane, the text " +
                            "appears " + density.fontIncrease + "px larger because <b>" +
                            appState.density + "</b> is the selected <i>Density</i>.";
                    return msg;
                }
            }
            return this.Super("cellHoverHTML", arguments);
        }
    },

    colorTreeDefaults: {
        _constructor: "SkinVariableTree",
        autoFetchData: false,
        getTransformResultCSS : function (record) {
            var css;
            var rec = themeEditor.getVariableDataRecord(record.name);
            var value = rec.transformResult || rec.transformedValue || rec.value;
            var color = new isc.tinycolor(value);
            if (color.isValid()) {
                value = color.toRgbString();
                css = "background-color:" + value + ";";
                var textColor = color.getAlpha() == 0 ? "#000" : 
                        isc.tinycolor.mostReadable(
                            value, 
                            ["#000", "#888", "#aaa", "#fff"]
                        ).toRgbString();
                if (textColor) css += "color:" + textColor + ";";
            }
            color = null;
            return css;
        },
        getTransformResultValue : function (value, record, rowNum, colNum) {
            if (record.valueType == "color") {
                return utils.toHexColor(value);
            }
            return value;
        },
        getCustomValueFieldValue : function (value, record, rowNum, colNum) {
            var result = null;
            var transform = record.transform;
            if (!transform && utils.isColorTransform(value)) {
                transform = utils.sassFunctionToTransform(value);
            }
            if (transform) {
                if (transform.derivesFrom != null) {
                    var v = themeEditor.getVariableDataRecord(transform.derivesFrom);
                    if (v) {
                        // value is the name of another variable - show that variable's title
                        result = "From: " + this.getVariableLinkHTML(v.name, v.title);
                    }
                } else {
                    result = "From: " + transform.value;
                }
            } else if (utils.isValidColor(value)) {
                // a valid color string or name
                result = "Fixed: " + utils.toHexColor(value);
            }
            return result;
        },
        validateCell : function (rowNum, fieldName) {
            var result = this.Super("validateCell", arguments);
            if (!result) {
                isc.say("Enter or select a valid color value.", { title: "Invalid Color" });
            }
            return result;
        },
        cellHoverHTML : function (record, rowNum, colNum) {
            var fieldName = this.getFieldName(colNum);
            if (fieldName == "value") {
                var msg = null;
                var value = record[fieldName];
                var transform = record.transform;
                if (!transform && utils.isColorTransform(value)) {
                    transform = utils.sassFunctionToTransform(value);
                }
                if (transform) {
                    msg = "From: ";
                    if (transform.derivesFrom != null) {
                        var v = themeEditor.getVariableDataRecord(transform.derivesFrom);
                        msg += (v ? v.title : transform.derivesFrom);
                    } else {
                        msg += transform.value;
                    }
                    if (transform.h != null) {
                        msg += "<br><b>H</b>: " + (transform.h < 0 ? "-" : "+") + 
                            Math.abs(transform.h) + "%";
                    }
                    if (transform.s != null) {
                        msg += "<br><b>S</b>: " + (transform.s < 0 ? "-" : "+") + 
                            Math.abs(transform.s) + "%";
                    }
                    if (transform.l != null) {
                        msg += "<br><b>L</b>: " + (transform.l < 0 ? "-" : "+") + 
                            Math.abs(transform.l) + "%";
                    }
                    return msg;
                }
            }
            return this.Super("cellHoverHTML", arguments);
        }
    },

    clearTrees : function () {
        var trees = [this.colorTree, this.borderTree, this.fontTree];
        trees.callMethod("setData", [null]);
        trees = null;
    },
    redrawTrees : function () {
        var trees = [this.colorTree, this.borderTree, this.fontTree];
        for (var i=0; i< trees.length; i++) {
            if (trees[i] && trees[i].body && trees[i].body.isDrawn()) {
                trees[i].body.redraw();
            }
        }
    },

    toggleDisabledButtonDefaults: {
        _constructor: "IButton",
        title: "Show Disabled Styling",
        autoFit: true,
        click : function () {
            if (this.title == "Show Disabled Styling") this.setTitle("Show Enabled Styling");
            else this.setTitle("Show Disabled Styling");
            var disable = this.title == "Show Enabled Styling";
            themeEditor.previewPane.getContentWindow().showDisabledState(disable);
        }
    },


    refreshPreviewControlDefaults: {
        _constructor: "RefreshControl"
    },

    previewPickerDefaults: {
        _constructor: "DynamicForm",
        numCols: 2,
        colWidths: [120, 140],
        wrapItemTitles: false,
        fields: [
            {name: "panePicker", title: "Select View", width:"*",
                defaultValue: appState.previewPane,
                valueMap: appState.testPaneList,
                changed : function () {
                    appState.setPane(this.getValue());
                }
            }
        ]
    },

    densityFormDefaults: {
        _constructor: "DynamicForm",
        numCols: 2,
        colWidths: [100, 140],
        wrapItemTitles: false,
        fields: [
            {name: "density", title: "Density", width:"*",
                defaultValue: "Dense",
                valueMap: appState.getDensityNames(),
                changed : function () {
                    if (appState.theme && appState.theme.length > 0) 
                        appState.setPreviewDensity(this.getValue());
                },
                itemHoverHTML : function (item, form) {
                    var d = appState.getDensity();
                    var result = "<b></i>" + item.getValue() + "</i></b> ";
                    if (d.fontIncrease == 0 && d.sizeIncrease == 0) {
                        result += "is the default density and does not " +
                            "affect sizes in the Preview-pane.";
                    } else {
                        result += "density affects the Preview-pane, increasing widget-heights by " + 
                            d.sizeIncrease + "px and font-sizes by " + d.fontIncrease + "px. " +
                            " <i>Density</i> is an application- or project-level setting and " +
                            "is not saved with the skin.";
                    }
                    return result;
                }
            }
        ]
    },

    captureThumbnailIconDefaults: {
        _constructor: "Img",
        width: 32,
        height: 32,
        imageWidth: 24, imageHeight: 24,
        imageType: "center",
        src: "[SKINIMG]actions/save.png",
        click : function () {
            appState.captureThumbnail();
        }
    },

    // right pane, previewControls and previewPane
    previewLayoutDefaults: {
        _constructor: "VLayout",
        width: "100%",
        height: "100%"
    },

    previewControlsDefaults: {
        _constructor: "ToolStrip",
        membersMargin: 5
    },

    previewPaneDefaults: {
        _constructor: "HTMLFlow",           
        //_mixIns: "IThemeObserver",
        contentsType: "page",
        // ensure main page DnD interactions (such as layout resizing) that cross into this
        // iframe don't hitch due to event swallowing by the frame - mask it
        useDragMask: true
    },

    preparingPreviewSpinnerDefaults: {
        _constructor: "Label",    
        visibility: "hidden",
        styleName: "refreshingLabel",
        wrap: false,
        getContents: function() {
            return this.loadingDataMessage == null ? "&nbsp;" :
                this.loadingDataMessage.evalDynamicString(this, {
                    loadingImage: this.imgHTML(isc.Canvas.loadingImageSrc,
                                               isc.Canvas.loadingImageSize,
                                               isc.Canvas.loadingImageSize)
                });
        }      
    },

    hasChanges : function () {
        // returns true if there are unsaved changes
        return appState._changes && appState._changes.length > 0;
    },

    settingHasLocalChange : function (record) {
        return appState.changedMap[record.name] != null;
    },
    
    settingIsCustomized : function (record) {
        // custom value is different from the base cascade value from the parent theme
        return appState.baseMap[record.name] != appState.currentMap[record.name];
    },
    
    revertRecordUpdate : function (record, viewer) {
        var changeRec = appState._changes.find("name", record.name);
        if (!changeRec) {
            if (record.customValue != record.themeValue) {
                var _record = record,
                    _viewer = viewer,
                    _this = this
                ;

                isc.ask("Are you sure you want to reset this value to the default from the parent skin?",
                    function (value) {
                        if (value) _this.revertToThemeDefault(_record, _viewer);
                    }, { title: "Reset Change(s) to Default?"}
                );
            }
        } else {
            var dataRecord = themeEditor.getVariableDataRecord(record.name);

            // update the various fields en route to the final value
            this.calculateVariableValue(dataRecord, dataRecord.customValue);
            //this.calculateVariableValue(dataRecord, dataRecord.savedValue);

            // update the value cascade, including the UI and previewPane
            this.updateVariableValue(dataRecord, dataRecord.transformResult);

            // and clear the local change
            appState.clearChange(changeRec.name);

            // maintain the changedMap and currentMap on appState
            delete appState.changedMap[changeRec.name];
            appState.currentMap[changeRec.name] = appState.savedMap[changeRec.name];

            if (changeRec.parentVar) {
                // see if there are any other changes with the same parentVar - if not, reset
                // the parentVar because all its sub-changes are now reverted
                if (!appState._changes.find("parentVar", changeRec.parentVar)) {
                    var parentRecord = themeEditor.getVariableDataRecord(record.name);
                    delete parentRecord.hasPartialChange;
                    this.resetVariableValue(parentRecord, viewer);
                    viewer.redraw();
                }
            }

            // log a change being reverted
            appState._addUsageRecord("variableRevertToSaved", changeRec.name, 
                changeRec.oldValue + " -> " + changeRec.newValue);

            // update themeObservers
            if (!this.hasChanges()) appState.setThemeDirty(false);
            else appState.themeModified();
        }
    },

    revertParentRecordUpdate : function (record, viewer) {
        var changeRec = appState._changes.findAll("parentVar", record.name);
        if (!changeRec || changeRec.length == 0) return;

        var parentRecord = themeEditor.getVariableDataRecord(record.name);
        delete parentRecord.hasPartialChange;

        for (var i=0; i<changeRec.length; i++) {
            var dataRecord = themeEditor.getVariableDataRecord(changeRec[i].name);

            // update the various fields en route to the final value
            this.calculateVariableValue(dataRecord, dataRecord.customValue);
            //this.calculateVariableValue(dataRecord, dataRecord.savedValue);

            // update the value cascade, including the UI and previewPane
            this.updateVariableValue(dataRecord, dataRecord.transformResult);

            // and clear the local change
            appState.clearChange(changeRec[i].name);

        }

        // and reset the parent row so it updates in the tree
        this.resetVariableValue(parentRecord, viewer);

        // update themeObservers
        if (!this.hasChanges()) appState.setThemeDirty(false);
        else appState.themeModified();
    },

    revertToThemeDefault : function (record, viewer) {
        //var data = this.getVariableData();
        var rec = appState.dsDataMap[record.name];
        if (rec.customValue != rec.themeValue) {
            var customVal = rec.customValue;
            var oldVal = record.transformResult;
            // update the various fields en route to the final value
            this.calculateVariableValue(rec, rec.themeValue)
            // store the local change-record
            appState.storeChange(rec.name, customVal, rec.value);
            // update the value cascade, including the UI and previewPane
            this.updateVariableValue(rec, rec.transformResult);

            // log a change being reverted to the theme default
            appState._addUsageRecord("variableRevertToTheme", rec.name, 
                oldVal + " -> " + rec.transformResult);

            // maintain the changedMap and currentMap on appState
            appState.changedMap[rec.name] = appState.baseMap[rec.name];
            appState.currentMap[rec.name] = appState.baseMap[rec.name];

            // update themeObservers
            appState.themeModified();
        } else {
            appState.notifyMessage("This value is already the same as the underlying default.");
        }
    },
    getVariableData : function () {
        return variableMetadataDS.cacheData;
    },
    getVariableDataRecord : function (name) {
        return appState.dsDataMap[name];
    },
    getVariableValue : function (name) {
        if (appState.variableValues && appState.variableValues[name]) {
            return appState.variableValues[name].value;
        }
        return appState.dsDataMap[name] && appState.dsDataMap[name].transformResult;
    },
    // helper to fully update any skin-variable, even if there's no current UI that shows it
    // right now, it's useful for removing things like shadows, which are not yet visible in 
    // the skinEditor
    changeVariableValue : function (varName, newValue) {
        var record = isc.addProperties({}, themeEditor.getVariableDataRecord(varName));
        this.storeRecordUpdate(varName, { transformResult: newValue}, record);
    },
    storeRecordUpdate : function (record, newValues, oldValues, viewer) {
        var varName = isc.isAn.Object(record) ? record.name : record;
        var varDef = themeEditor.getVariableDataRecord(varName);
        var changeRec = appState._changes.find("name", varName);
        if (changeRec) {
            changeRec.newValue = newValues.transformResult;
            if (newValues.parentVar) changeRec.parentVar = newValues.parentVar;
        } else {
            appState.storeChange(varName, oldValues.value, newValues.transformResult, newValues.parentVar)
        }
        // maintain the changedMap and currentMap on appState
        appState.changedMap[varName] = newValues.transformResult;
        appState.currentMap[varName] = newValues.transformResult;
        if (newValues.parentVar) {
            var parentVar = themeEditor.getVariableDataRecord(newValues.parentVar);
            parentVar.hasPartialChange = true;
        }
        this.updateVariableValue(record, newValues.transformResult);
        // log a variable value-change
        appState._addUsageRecord("variableChange", varName, oldValues.value + " -> " + newValues.transformResult);
        appState.themeModified();
    },

    resetVariableValue : function (record, tree) {
        var r = themeEditor.getVariableDataRecord(record.name);
        this.calculateVariableValue(r, r.value);
        variableMetadataDS.updateData(r);
        tree && tree.body && tree.body.isDrawn() && tree.body.redraw();
    },
    calculateVariableValue : function (record, baseValue) {
        // parse the baseValue 
        record.value = baseValue;
        record.transformedValue = record.value;
        record.transformResult = null;
        if (!utils.isAdjustColor(record.value)) {
            utils.replaceValueTokens(record);
        }
        utils.parseTransform(record);
        appState.variableValues[record.name].value = record.transformResult;
    },

    refreshVariableValue : function (record, value, recursive, skipUpdate) {
        // refreshes a variable-value without updating it - doesn't change the passed variable,
        // but *does* affect any variables that use it
        this.updateVariableValue(record, value, recursive, skipUpdate, true);
    },
    updateVariableValue : function (record, value, recursive, skipUpdate, refreshOnly) {
        var varName = isc.isAn.Object(record) ? record.name : record;
        var thisRec = appState.dsDataMap[varName];
        if (!refreshOnly) {
            thisRec.transformedValue = value;
            thisRec.transformResult = value;
        }

        //this.logWarn("updateVariableValue -- " + varName + " to " + value);

        if (!recursive) {
            appState.variableValues[thisRec.name].value = thisRec.transformResult;
            if (thisRec.name == "$standard_bgColor") {
                appState.updatePreviewBackground(thisRec.transformResult);
            }
        }

        if (appState.livePreview) {
            // update the CSS variables that exist when livePreview is true
            this.updateLiveCSSVariable(thisRec.name, thisRec.transformResult, true);
        }

        var vValues = appState.variableValues;
        if (vValues[thisRec.name].usedBy != null && vValues[thisRec.name].usedBy.length > 0) {
            for (var i=0; i<vValues[thisRec.name].usedBy.length; i++) {
                // get the base record from the DS cache
                var innerRec = appState.dsDataMap[vValues[thisRec.name].usedBy[i]];
                // if it's got a local unsaved change, don't update it's value now
                if (this.settingHasLocalChange(innerRec)) continue;
                // clear the transformResult
                innerRec.transformResult = null;
                // if there's a transform, apply it
                if (innerRec.transform) innerRec.transformedValue = innerRec.customValue;
                else innerRec.transformedValue = innerRec.value;
                // replace tokens and transform - updates transformedValue and transformResult
                if (!utils.isAdjustColor(innerRec.value)) {
                    utils.replaceValueTokens(innerRec);
                }
                utils.parseTransform(innerRec);

                appState.variableValues[innerRec.name].value = innerRec.transformResult;
                
                if (vValues[innerRec.name].usedBy != null && vValues[innerRec.name].usedBy.length > 0) {
                    // also update any variables that use this variable
                    //this.logWarn("CALLING updateVariableValue -- " + innerRec.name + " from " + thisRec.name);
                    this.updateVariableValue(innerRec, innerRec.transformResult, true);
                } else if (appState.livePreview) {
                    // update the CSS variables that exist when livePreview is true
                    this.updateLiveCSSVariable(innerRec.name, innerRec.transformResult, true);
                }
            }
        }
        if (!recursive && !skipUpdate) {
            this.delayCall("variableValuesUpdated");
        }
    },

    variableValuesUpdated : function () {
        // update the TreeGrid visually
        themeEditor.redrawTrees();
        // have updatePreviewPaneStyles() call Element.cssVariablesUpdated(), so that widgets 
        // update styles they've cached from the handle
        appState.updatePreviewPaneStyles();
        // kick off a screen-grab of the previewPane
        //appState.captureThumbnail();
    },

    updateLiveCSSVariable : function (varName, value) {
        if (!appState.livePreview) return;
        if (!appState._previewReady) {
            // cache this change and apply it when the preview finishes loading
            appState._liveUpdateCache = appState._liveUpdateCache || {};
            appState._liveUpdateCache[varName] = value;
            return;
        }
        
        //isc.logWarn("running updateLiveCSSVariable -- " + varName + " to " + value);

        if (this.previewPane.getContentWindow().isc) {
            if (appState.density) {
                if (varName.contains("font_size") || varName.contains("fontSize")) {
                    value = parseFloat(value) + appState.getDensity().fontIncrease + "px";
                }
            }
            this.previewPane.getContentWindow().isc.Element.updateCSSVariable("--isc-" + varName.substring(1), value);
        }
    },
    
    buildComponents : function () {
        // main header layout, iso logo/name, create/edit buttons, user-login icon, right-aligned
        this.headerIcon = this.createAutoChild("headerIcon");
        this.headerLabel = this.createAutoChild("headerLabel");
        this.createThemeButton = this.createAutoChild("createThemeButton");
        this.editSkinForm = this.createAutoChild("editSkinForm");
        //this.editThemeButton = this.createAutoChild("editThemeButton");

        //this.addAutoChild("userNameSpacer");
        if (window.user) {
            this.userMenuButton = this.createAutoChild("userMenuButton");
            this.userMenu = this.createAutoChild("userMenu");
            this.userMenuButton.menu = this.userMenu;
        }

        this.showHelpButton = this.createAutoChild("showHelpButton");

        this.headerLayout = this.createAutoChild("headerLayout", { 
            members: [ 
                this.headerIcon, this.headerLabel, 
                isc.LayoutSpacer.create({width: 50}), 

                isc.LayoutSpacer.create({ID: "createThemePlaceholder", width: 80 }), 
                this.createThemeButton, 
                this.editSkinForm,
                //this.editThemeButton, 
                isc.LayoutSpacer.create({width: "*"}), 
                this.userMenuButton,
                this.showHelpButton
            ] }
        );
        this.addMember(this.headerLayout);

        this.themeNameLabel = this.createAutoChild("themeNameLabel");
        this.deleteButton = this.createAutoChild("deleteButton");
        this.exportButton = this.createAutoChild("exportButton");
        this.saveButton = this.createAutoChild("saveButton");
        this.themeControls = this.createAutoChild("themeControls", {
            members: [
                this.themeNameLabel,
                isc.LayoutSpacer.create({ID: "themeHeaderSpacer", width: "*"}), 
                this.deleteButton, 
                this.exportButton, 
                this.saveButton
            ]
        });

        // add the color edit tree
        this.colorTree = this.createAutoChild("colorTree", { dataSource: variableMetadataDS });
        
        // add the border edit tree
        this.borderTree = this.createAutoChild("borderTree", { dataSource: variableMetadataDS });

        // add the font edit tree
        this.fontTree = this.createAutoChild("fontTree", { dataSource: variableMetadataDS });

        // add the main tabSet, containing the edit-trees
        this.tabSet = this.createAutoChild("tabSet", { 
            tabs: [
                {title: "Colors", name: "color", pane: this.colorTree},
                {title: "Borders and Padding", name: "border", pane: this.borderTree},
                {title: "Fonts", name: "font", pane: this.fontTree}
            ]
        });
        
        this.themeLayout = this.createAutoChild("themeLayout", {
            members: [ this.themeControls, this.tabSet ]
        });

        this.previewPicker = this.createAutoChild("previewPicker");
        this.densityForm = this.createAutoChild("densityForm");
        this.toggleDisabledButton = this.createAutoChild("toggleDisabledButton");
        this.captureThumbnailIcon = this.createAutoChild("captureThumbnailIcon", 
            { visibility: appState.shouldCaptureThumbnail ? "visible" : "hidden" }
        );
        this.previewControls = this.createAutoChild("previewControls", {
            members: [
                this.previewPicker,
                "separator",
                this.densityForm,
                "separator",
                this.toggleDisabledButton,
                isc.LayoutSpacer.create({ width: "*" }),
                this.captureThumbnailIcon
            ]
        });
        if (!appState.livePreview) {
            this.refreshPreviewControl = this.createAutoChild("refreshPreviewControl");
            this.previewControls.addMembers([
                "spacer:*",
                this.refreshPreviewControl
            ]);
        }
        this.previewPane = this.createAutoChild("previewPane");
   
        this.previewLayout = this.createAutoChild("previewLayout", {
            members: [this.previewControls, this.previewPane]
        })

        this.bodyLayout = this.createAutoChild("bodyLayout", {
            members: [this.themeLayout, this.previewLayout]
        });

        this.addMember(this.bodyLayout);

        this.startPane = this.createAutoChild("startPane");
    },

    _mixIns: "IThemeObserver",
    disableOnNullTheme: false,

    updateVariableNode : function (record) {
        var tree = themeEditor.colorTree;
        var node = tree.data.find("name", record.name);
        if (node) {
            node.customValue = record.customValue;
            node.value = record.value;
            node.transformedValue = record.transformedValue;
            node.transformResult = record.transformResult;
        }
    },
    showColorCascade : function () {
        
        this.colorTree.setFields(this.getTreeFields("color"));
        var crit = { _constructor: "AdvancedCriteria", operator: "and", criteria: [
            { fieldName: "internal", operator: "isNull" },
            { fieldName: "valueType", operator: "equals", value: "color" },
            { fieldName: "valueSubType", operator: "inSet", 
                value: [ "color", "text", "background", "border"] //, "glow" ]
            }
        ]};

        if (!appState.showAdvancedVariables) {
            crit.criteria.add({ fieldName: "basic", operator: "equals", value: 1 });
        }

        this.colorTree.fetchData(crit);
        this.tabSet.setHighlightColor(themeEditor.getVariableDataRecord("$highlight_color"));
    },

    getStyledFontName : function (name, title) {
        return "<span style='font-family: " + name + ";'>" + title + "</span>";
    },
    getAvailableFonts : function () {
        var result = {
            "calibri": this.getStyledFontName("calibri", "Calibri"),
            "corbel": this.getStyledFontName("corbel", "Corbel"),
            "RobotoLight": this.getStyledFontName("RobotoLight", "RobotoLight"),
            //"Consolas": this.getStyledFontName("Consolas", "Consolas"),
            //"Open Sans": this.getStyledFontName("OpenSans", "OpenSans"),
            //"Nunito": this.getStyledFontName("Nunito", "Nunito"),
            "courier new": this.getStyledFontName("courier new", "Courier New"),
            "monospace": this.getStyledFontName("monospace", "Monospace")
        };
        return result;
    },
    getTreeFields : function (type) {
        var editorType = "TextItem",
            editorProperties = null,
            editorValidators = null,
            title = ""
        ;
        if (type == "color") {
            editorType = "ColorItem";
            title = "Color";
            editorProperties = {
                changed : function (form, item, oldValue, newValue) {
                    item.focusInItem();
                },
                pickerColorChanged : function (color) {
                    // exit grid-editing to apply the change to the preview
                    this.grid.endEditing();
                }
            };
            editorValidators = [
                { 
                    type: "custom", 
                    defaultErrorMessage: "Invalid color value",
                    condition : function (item, validator, value, record, extra) {
                        var ed = extra.component.creator;
                        var v = isc.tinycolor(value);
                        return v.isValid();
                    }
                }
            ];
        } else if (type == "border") {
            editorType = "TextItem";
            title = "Border";
        } else if (type == "font") {
            editorType = "SelectItem";
            title = "Font";
        }
        var fields = [
            { name: "title", title: "Settings", canEdit: false, canFilter: true },
            { name: "value", title: "Derivation", canEdit: false, width: "*"
            },
            { name: "transform", title: "Transform", hidden: true },
            {
                name: "transformResult", title: title,
                width: 100,
                editorType: editorType, filterEditorType: "TextItem",
                canTabToIcons: false,
                pickerIconProperties: {
                    canFocus: false
                },
                editorProperties: editorProperties,
                validators: editorValidators
            },
            { name: "revert", type: "icon", canEdit: false,
                canHover: true, showHover: true,
                recordClick : function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
                    if (record._hasIcon) {
                        var ed = themeEditor;
                        var r = ed.getVariableDataRecord(record.name);
                        if (r.hasPartialChange) {
                            viewer.creator.revertParentRecordUpdate(record, viewer);
                        } else {
                            viewer.creator.revertRecordUpdate(record, viewer);
                        }
                        r = null;
                        ed = null;
                        return false;
                    }
                }
            } 

        ];
        return fields;
    },
    showBorderCascade : function () {
        //this.borderTree.setDataSource(variableMetadataDS);

        this.borderTree.setFields(this.getTreeFields("border"));

        var crit = { _constructor: "AdvancedCriteria", operator: "and", criteria: [
            { fieldName: "internal", operator: "isNull" },
            { fieldName: "valueType", operator: "inSet", value: ["border", "padding"] },
            { fieldName: "valueSubType", operator: "inSet", value: ["border", "width", "style", "radius", "padding"] }
        ]};

        if (!appState.showAdvancedVariables) {
            crit.criteria.add({ fieldName: "basic", operator: "equals", value: 1 });
        }

        this.borderTree.fetchData(crit);
    },

    showFontCascade : function () {
        this.fontTree.setFields(this.getTreeFields("font"));

        var crit = { _constructor: "AdvancedCriteria", operator: "and", criteria: [
            { fieldName: "internal", operator: "isNull" },
            { _constructor: "AdvancedCriteria", operator: "and", criteria: [
                { fieldName: "valueType", operator: "equals", value: "font" },
                { fieldName: "valueSubType", operator: "inSet", value: ["family","size"] }
            ]}
        ]};

        if (!appState.showAdvancedVariables) {
            crit.criteria.add({ fieldName: "basic", operator: "equals", value: 1 });
        }

        this.fontTree.fetchData(crit);
    },

    cssEditorWindowDefaults: {
        _constructor: "Window",
        isModal: true,
        showModalMask: true,
        modalMaskOpacity: 10,
        autoSize: true,
        autoDraw: false,
        showHeader: false,
        bodyProperties: {
            padding: 0,
            margin: 0
        },
        canDragResize: false,
        dismissOnEscape: true
    },
    cssEditorDefaults: {
        _constructor: "CSSEditor",
        autoDraw: false,
        editCancelled : function () { this.window.closeClick(); },
        editComplete : function (properties, record) { 
            this.window.closeClick(); 
            if (this.userCallback) this.userCallback(properties, record);
        }
    },
    showCSSEditor : function (record, rowNum, colNum, viewer, callback) {
        if (!this.cssEditorWindow) {
            if (!this.cssEditor) {
                this.cssEditor = this.createAutoChild("cssEditor");
            }
            this.cssEditorWindow = this.createAutoChild("cssEditorWindow", { items: [this.cssEditor] });
            this.cssEditor.window = this.cssEditorWindow;
        }
        this.cssEditor.record = record;
        this.cssEditor.viewer = viewer;
        this.cssEditor.userCallback = callback;

        var cssObject;

        var allowAsymmetry = false;
        var showAsymmetry = false;
        var settings = [];
        var values = {};
        if (record.valueSubType == "border") {
            settings.add({ name: record.valueType, returnSingleValue: false, 
                editorProperties: { showTitle: false }
            });
            cssObject = isc.CSSEditor.parseCSSSetting("border", record.transformResult);
            values[record.valueSubType] = cssObject["border-width"] + "px " + 
                cssObject["border-style"] + " " + cssObject["border-color"];
        } else if (record.valueType == "padding") {
            settings.add({ name: record.valueType, returnSingleValue: true });
            cssObject = isc.CSSEditor.parseCSSSetting("padding", record.transformResult);
            values[record.valueType] = cssObject.padding;
            allowAsymmetry = true;
            showAsymmetry = cssObject.padding.contains(" ");
        }

        var rect = viewer.getCellPageRect(rowNum, colNum);
        this.cssEditor.setGroups(
            { name: "group1", title: record.title, canCollapse: false, 
                allowAsymmetry: allowAsymmetry,
                showAsymmetry: showAsymmetry,
                settings: settings
            }
        );
        this.cssEditor.setValues(values);
        this.cssEditorWindow.placeNear(rect[0], rect[1] + viewer.getRowHeight(0));
        this.cssEditorWindow.show();
    },

    exportOverlay : function (name) {
        var overlay = {
            name: name || appState.theme,
            baseSkin: appState.baseTheme,
            settings: {}
        };
        
        for (var key in appState.currentMap) {
            if (key == "$theme_name" && name) {
                overlay.settings[key] = "'" + name + "'";
            } else if (appState.currentMap[key] != appState.baseMap[key]) {
                var val = themeEditor.getVariableValue(key);
                overlay.settings[key] = val;
            }
        }
        
        return "(" + isc.Comm.serialize(overlay, true) + ")";
        //return isc.JSON.encode(overlay);
    },
    
    testOverlay: {
        name: "ImportTest",
        baseSkin: "Twilight",
        settings: {
            "$standard_bgColor": "green"
        }
    },
    importOverlay : function (overlay) {
        if (isc.isA.String(overlay)) {
            overlay = isc.JSON.decode(overlay);
        }
        appState.importingOverlay = isc.addProperties({}, overlay);

        var values = { name: overlay.name, baseSkin: overlay.baseSkin,
            userSettings: "\"$theme_name\":'" + overlay.name + "';"
        };
        // add a userSkin record - just theme_name as customizations and skinStylesCSS comes from the baseSkin
        isc_userSkin.addData(values, function (dsResponse, data) {
            if (isc.isAn.Array(data)) data = data[0];
            if (dsResponse.status == 0) {
                appState.createTheme(data.name, data.baseSkin);
            }
        });
    }
});

isc.defineClass("RefreshControl", "HLayout").addProperties({

width: 1,

refreshPreviewButtonDefaults: {
    _constructor: "IButton",
    autoFit: true,
    title: "Refresh",    
    visibility: "hidden",
    disabled: true,
    click : function () {
        appState.updatePreview();
        this.creator.refreshRunning();
    }
},

toggleAutoRefreshFormDefaults: {
    _constructor: "DynamicForm",
    height: 20,
    numCols: 1,
    items: [
        {name: "autoRefresh", title: "Refresh on change", type: "boolean", 
            defaultDynamicValue: function () {
                return appState.autoPreview;
            }, changed : function (form, item, value) {
                appState.setAutoPreview(!appState.autoPreview);
            }
        }
    ]
},

refreshingLabelDefaults: {
    _constructor: "Label",    
    visibility: "hidden",
    loadingDataMessage: "Refreshing...&nbsp;${loadingImage}",
    getContents: function() {
        return this.loadingDataMessage == null ? "&nbsp;" :
            this.loadingDataMessage.evalDynamicString(this, {
                loadingImage: this.imgHTML(isc.Canvas.loadingImageSrc,
                                           isc.Canvas.loadingImageSize,
                                           isc.Canvas.loadingImageSize)
            });
    }      
},

initWidget : function () {
    this.Super("initWidget", arguments);
    this.addAutoChildren(this.autoChildren);

    this.toggleAutoRefreshForm = this.createAutoChild("toggleAutoRefreshForm");
    this.refreshPreviewButton = this.createAutoChild("refreshPreviewButton");
    this.refreshingLabel = this.createAutoChild("refreshingLabel");

    this.addMembers([
        this.toggleAutoRefreshForm,
        this.refreshPreviewButton,
        this.refreshingLabel
    ]);
    this.observe(appState, "setPreviewDirty", "observer.updateState()");
    this.observe(appState, "setAutoPreview", "observer.updateState()");
    this.updateState();

},
updateState : function () {
    this.refreshPreviewButton.setDisabled(!appState.previewDirty);
    this.refreshPreviewButton.setVisibility(appState.autoPreview ? "hidden" : "visible");

    if (appState.previewDirty && appState.autoPreview) this.refreshRunning();
    else if (!appState.previewDirty) this.refreshComplete();
},
refreshRunning : function () {
    this.refreshPreviewButton.hide();
    this.toggleAutoRefreshForm.hide();
    this.refreshingLabel.show();
},
refreshComplete : function () {
    this.refreshingLabel.hide();
    this.toggleAutoRefreshForm.show();
}

});

isc.defineClass("CustomTile", "SimpleTile").addProperties({

    // Don't contribute to ruleContext from this object or any child object
    contributeToRuleContext: false,

    baseStyle:"skinTile",
    
    thumbnailFieldAddedHeight: 18,

    customFormDefaults: {
        _constructor: "DynamicForm",
        fixedColWidths: true,
        overflow: "hidden",
        numCols: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "white"
    },

    thumbnailFieldDefaults: {
        name:"thumbnail", type: "StaticTextItem", align: "center", 
        showTitle: false, canEdit: false, showValueIconOnly: true,
        // put a border around the item as a whole
        //cellStyle: "thumbnail",
        showOver: false,
        getValueIcon : function (value) {
            return value;
        },
        getValueIconStyle : function (value) {
            return "skinTileIcon";
        },
        cellStyle: "staticTextItem",
        showOver: false,
        showOverIcons: false
    },
    nameFieldDefaults: {
        name:"name", type: "StaticTextItem", width: "*", 
        showTitle: false, canEdit: false, textAlign: "center", 
        // Some sample names can push out the <table> on mobile (e.g. the "RestDataSource" and
        // "RestDataSource Edit & Save" samples).
        clipValue: true, clipStaticValue: true,
        formatValue : function (value, record, form, item) {
            if (record.shortTitle != null) value = record.shortTitle;
            var regexp = new RegExp("\\s*<(sup|SUP)[^>]*>\\s*BETA\\s*</\\1[^>]*>|\\s*BETA","g");
            value = value ? value.replace(regexp, "") : "";
            return value;
        },
        wrap: false,
        cellHeight: 30,
        height: "*",
        showOver: false,
        showOverIcons: false
    },
    positionFieldDefaults: {
        name:"position", type: "StaticTextItem", visible: false
    },
    
    setValues : function (record) {
        var name = record.name,
            form = this.customForm;

        
        form.setValue("name", name);
        if (!record.thumbnail) {
            form.clearValue("thumbnail");
        } else {
            if (record.thumbnail.contains(":")) {
                // this is a dataURL
                form.setValue("thumbnail", record.thumbnail);
            } else {
                form.setValue("thumbnail", "[ISOMORPHIC]/skins/" + name + "/images/thumbnail.png");
            }
        }
        form.setValue("position", record.position);

        
        if (this.getRecord() != record) this._dirty = true;
    },
    initWidget : function () {
        this.Super("initWidget", arguments);

        var useDesktopMode = true;

        var iconWidth = useDesktopMode ? 142 : 59,
            iconHeight = useDesktopMode ? 142 : 44;

        this.customForm = this.createAutoChild("customForm", {
            // On hover, show the name if it's clipped or we're showing a shorter version
            itemHoverHTML : function () {
                // skip the hover if we aren't clipping the title
                var showHover = this.getItem("name").valueClipped();
                if (showHover) return this.getValue("name");
                return null;
            },
            fields: [
                isc.addProperties({}, this.thumbnailFieldDefaults, this.thumbnailFieldProperties, {
                    valueIconWidth: iconWidth,
                    valueIconHeight: iconHeight,
                    height: iconHeight + (this.thumbnailFieldAddedHeight || 0)
                }),

                isc.addProperties({}, this.nameFieldDefaults, 
                    { 
                        textBoxStyle: "skinTileTitle",
                        cellStyle: "skinTileTitle" 
                    },  
                    this.nameFieldProperties
                ),
                isc.addProperties({}, this.positionFieldDefaults, this.positionFieldProperties)
            ]
        });
        this.addChild(this.customForm);
    }
});


isc.defineClass("SkinVariableTree", "TreeGrid");
isc.SkinVariableTree.addProperties({
    canEdit: true,
    showFilterEditor: true,
    keepParentsOnFilter: true,
    editEvent: "click",
    hoverStyle: null,
    showClippedValuesOnHover: true,
    stopOnErrors: true,
    validateByCell: true,
    dataFetchMode:"local",
    loadDataOnDemand:false,
    dataProperties: {
        idField: "name",
        parentIdField: "derivesFrom",
        modelType: "parent"
    },
    filterData : function () {
        this.Super("filterData", arguments);
        this.data.openAll();
    },
    defaultFields: [
        { name: "title", title: "Settings", canEdit: false, canFilter: true },
        { name: "value", title: "Derivation", canEdit: false, width: "*"},
        { name: "transform", title: "Transform", hidden: true },
        {
            name: "transformResult", title: "Value", width: 100, canEdit: true,
            editorType: "TextItem", filterEditorType: "TextItem"
        },
        { name: "revert", type: "icon", canEdit: false,
            canHover: true, showHover: true
        } 
    ],

    getTransformResultCSS : function (record) {
        // define this method to return CSS that demonstrates the effect of the variable
        return null;
    },
    getTransformResultValue : function (value, record, rowNum, colNum) {
        return value;
    },
    getCellCSSText : function (record, rowNum, colNum) {
        var css;
        if (this.getFieldName(colNum) == "transformResult") {
            // this method is defined by each instance of this class
            css = this.getTransformResultCSS(record);
            if (css) return css;
            return this.Super("getCellCSSText", arguments);
        } else {
            // local, unsaved change - value is different from the saved theme value
            var unsavedChange = this.creator.settingHasLocalChange(record);
            // saved change - theme value is different from the value from the parent skin
            var savedChange = this.creator.settingIsCustomized(record);
            if (unsavedChange || savedChange) {
                var result = "";
                // local, unsaved change show blue text
                if (unsavedChange) result += this.creator.unsavedValueCSS;
                // any change should show the text in bold 
                result += this.creator.customizedValueCSS;
                return result;
            }
        }
    },

    // template array for generating links in the "Derivation" field
    linkTemplate: [
        "<a onclick=\"",
        , // 1 - this.getID() 
        ".linkClicked(event, '",
        , // 3 - variable name 
        "');  return false;\"  href='javascript:void'>",
        , // 5 - variable title 
        "</a>"
    ],
    getVariableLinkHTML : function (name, title) {
        var t = this.linkTemplate;
        t[1] = this.getID();
        t[3] = name;
        t[5] = title;
        return t.join("");
    },
    
    getCustomValueFieldValue : function (value, record, rowNum, colNum) {
        // define this method to map some actual value to the value needed for display
        return value;
    },
    
    getCellValue : function (record, rowNum, colNum) {
        // override getCellValue() to update the transformResult value from the
        // map on appState - the tree records are never updated after the initial
        // fetch
        var fieldName = this.getFieldName(colNum);
        if (fieldName == "transformResult") {
            record[fieldName] = appState.dsDataMap[record.name][fieldName];
        }
        return this.Super("getCellValue", arguments);
    },
    formatCellValue : function (value, record, rowNum, colNum) {
        var fieldName = this.getFieldName(colNum);
        if (fieldName == "transformResult") {
            // instances might show a styled div or similar, according to value type
            return this.getTransformResultValue(value, record, rowNum, colNum);
        } else if (fieldName == "value") {
            var result = this.getCustomValueFieldValue(value, record, rowNum, colNum);
            if (result != null) {
                return result;
            } else {
                if (value.startsWith("$")) {
                    var v = appState.dsDataMap[value];
                    if (v) {
                        // value is the name of another variable - show that variable's title
                        return "From: " + this.getVariableLinkHTML(v.name, v.title);
                    }
                    // starts with a variable name, but is more complex - return the value
                    return value;
                } else if (value.contains(record.derivesFrom)) {
                    var v = appState.dsDataMap[record.derivesFrom];
                    if (v) {
                        // value is the name of another variable - show that variable's title
                        return "From: " + this.getVariableLinkHTML(v.name, v.title);
                    }
                } else {
                    // isn't a valid value or a variable name - return the value
                    return "Fixed: " + value;
                }
            }
        } else if (fieldName == "revert") {
            if (!this._revertIcon) {
                this._revertIcon = Canvas.imgHTML("revert.png");
            }
            var ed = this.creator;
            if (ed.settingHasLocalChange(record) || ed.settingIsCustomized(record)) {
                record._hasIcon = true;
                return this._revertIcon;
            } else {
                delete record._hasIcon;
            }
        }
        return value;
    },

    linkClicked : function (event, varName) {
        if (varName == "$highlight_color") {
            // if the link is for the special $highlight_color, focus in it's formItem
            themeEditor.tabSet.focusHighlightColor();
            return;
        }
        
        //isc.say("linkClicked() fired - " + varName);
        var record = appState.dsDataMap[varName];
        if (!record) {
            // derivation-node is filtered out - clear the filter, call linkClicked() and bail 
            this.clearFilterItemClick();
            this.delayCall("linkClicked", [null, varName], 300);
            return;
        }

        if (record) {
            var d = this.data.data || this.data._getOpenList();
            if (!d.contains(record)) {
                // open parents
                var parents = this.data.getParents(record);
                for (var i=0; i<parents.length; i++) {
                    this.data.openFolder(parents[i]);
                }
            }
            if (!this.data.isOpen(record)) {
                var _this = this;
                // open the target node and select it
                this.data.openFolder(record, function (node) {
                    _this.selectSingleRecord(node);
                });
            } else {
                // select the target node
                this.selectSingleRecord(record);
            }
            // scroll the target into view
            this.scrollToCell(this.getRecordIndex(record));
        }
        return false;
    },

    editComplete : function (rowNum, colNum, newValues, oldValues, editCompletionEvent, dsResponse) {
        // record that a variable was changed, so we can write only changes out later
        // need to update all the child-colors with the new value for this one
        this.creator.storeRecordUpdate(oldValues.name, newValues, oldValues, this);
    },

    cellHoverHTML : function (record, rowNum, colNum) {
        var fieldName = this.getFieldName(colNum);
        if (fieldName == "value") {
            var msg = null;
            var dsRec = appState.dsDataMap[record.name];
            var value = dsRec[fieldName];
            if (value.startsWith("$")) {
                msg = "From: "
                var v = appState.dsDataMap[value];
                msg += (v ? v.title : value);
            }
            return msg;
        } else if (fieldName == "title") {
            var dsRec = appState.dsDataMap[record.name];
            return dsRec[fieldName];
        } else if (fieldName == "revert") {
            if (this.creator.settingHasLocalChange(record)) {
                // local, unsaved change
                return "Reset to saved value";
            } else if (this.creator.settingIsCustomized(record)) {
                // custom value is different from the base cascade value from the parent theme
                return "Reset to Skin default";
            }
        }
        return this.Super("cellHoverHTML", arguments);
    }

});


appState.init();

isc.ThemeEditor.create({
    ID: "themeEditor",
    width: "100%", height: "100%",
    overflow: "hidden"
}).show();


// install a beforeunload handler to warn when exiting the page with unsaved changes
window.onbeforeunload = function () {
    if (appState.themeDirty) {
        // note that this message is ignored in most browsers - you just get the browser default
        return confirm("You have unsaved changes - exit without saving?");
    }
};


</script>

</body></html>

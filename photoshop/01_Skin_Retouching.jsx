// 01 Skin Retouching
// Builds a non destructive skin retouching stack on the active document.
// Works on any image size: blur radius scales with the document.
// Record it into an action with File > Scripts while an action is recording.
//
// Layer stack created (bottom to top), inside the group "Skin Retouching":
//   FS Low (Color & Tone)   blurred copy, smooth blotches here with Mixer Brush or Lasso + Blur
//   FS High (Texture)       Linear Light texture layer, preserves pores
//   Spot Healing            empty layer for the Spot Healing Brush (tick Sample All Layers)
//   Dodge (paint white)     Curves brighten, black mask, paint with a soft 3 to 8% white brush
//   Burn (paint white)      Curves darken, black mask, paint with a soft 3 to 8% white brush
// The original layers are never modified.

#target photoshop

function cTID(s) { return charIDToTypeID(s); }
function sTID(s) { return stringIDToTypeID(s); }

var GROUP_NAME = "Skin Retouching";
var LOW_NAME = "FS Low (Color & Tone)";
var HIGH_NAME = "FS High (Texture)";

// Stamp all visible layers into one new pixel layer.
function stampVisible(doc, name) {
    if (doc.layers.length === 1 && doc.artLayers.length === 1) {
        var only = doc.artLayers[0];
        var copy = only.duplicate();
        copy.name = name;
        doc.activeLayer = copy;
        return copy;
    }
    doc.activeLayer = doc.layers[0];
    var fresh = doc.artLayers.add();
    fresh.name = name;
    var d = new ActionDescriptor();
    d.putBoolean(cTID("Dplc"), true);
    executeAction(cTID("MrgV"), d, DialogModes.NO);
    doc.activeLayer.name = name;
    return doc.activeLayer;
}

// Apply Image: subtract the low frequency layer from the active layer.
function applyImageSubtract(sourceName, is16Bit) {
    var d = new ActionDescriptor();
    var src = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("RGB "));
    ref.putName(cTID("Lyr "), sourceName);
    src.putReference(cTID("T   "), ref);
    if (is16Bit) {
        src.putBoolean(cTID("Invr"), true);
        src.putEnumerated(cTID("Clcl"), cTID("Clcn"), cTID("Add "));
        src.putDouble(cTID("Scl "), 2);
        src.putInteger(cTID("Ofst"), 0);
    } else {
        src.putEnumerated(cTID("Clcl"), cTID("Clcn"), cTID("Sbtr"));
        src.putDouble(cTID("Scl "), 2);
        src.putInteger(cTID("Ofst"), 128);
    }
    d.putObject(cTID("With"), cTID("Clcl"), src);
    executeAction(cTID("AppI"), d, DialogModes.NO);
}

// Create a Curves adjustment layer with one midpoint moved (input 128 to output).
function makeCurvesLayer(name, midOut) {
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putClass(cTID("AdjL"));
    d.putReference(cTID("null"), r);
    var l = new ActionDescriptor();
    l.putString(cTID("Nm  "), name);
    var crv = new ActionDescriptor();
    crv.putEnumerated(sTID("presetKind"), sTID("presetKindType"), sTID("presetKindDefault"));
    l.putObject(cTID("Type"), cTID("Crvs"), crv);
    d.putObject(cTID("Usng"), cTID("AdjL"), l);
    executeAction(cTID("Mk  "), d, DialogModes.NO);

    var s = new ActionDescriptor();
    var sr = new ActionReference();
    sr.putEnumerated(cTID("AdjL"), cTID("Ordn"), cTID("Trgt"));
    s.putReference(cTID("null"), sr);
    var c = new ActionDescriptor();
    c.putEnumerated(sTID("presetKind"), sTID("presetKindType"), sTID("presetKindCustom"));
    var adjs = new ActionList();
    var ch = new ActionDescriptor();
    var chr = new ActionReference();
    chr.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("Cmps"));
    ch.putReference(cTID("Chnl"), chr);
    var pts = new ActionList();
    var pairs = [[0, 0], [128, midOut], [255, 255]];
    for (var i = 0; i < pairs.length; i++) {
        var p = new ActionDescriptor();
        p.putDouble(cTID("Hrzn"), pairs[i][0]);
        p.putDouble(cTID("Vrtc"), pairs[i][1]);
        pts.putObject(cTID("Pnt "), p);
    }
    ch.putList(cTID("Crv "), pts);
    adjs.putObject(cTID("CrvA"), ch);
    c.putList(cTID("Adjs"), adjs);
    s.putObject(cTID("T   "), cTID("Crvs"), c);
    executeAction(cTID("setd"), s, DialogModes.NO);
}

// Invert the active layer's mask so it starts black (effect hidden).
function invertActiveMask() {
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("Msk "));
    d.putReference(cTID("null"), r);
    d.putBoolean(cTID("MkVs"), false);
    executeAction(cTID("slct"), d, DialogModes.NO);
    executeAction(cTID("Invr"), undefined, DialogModes.NO);

    var b = new ActionDescriptor();
    var br = new ActionReference();
    br.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("RGB "));
    b.putReference(cTID("null"), br);
    b.putBoolean(cTID("MkVs"), false);
    executeAction(cTID("slct"), b, DialogModes.NO);
}

function main() {
    var doc = app.activeDocument;
    if (doc.mode !== DocumentMode.RGB) {
        alert("Skin Retouching needs an RGB document. Use Image > Mode > RGB Color first.");
        return;
    }
    var is16Bit = doc.bitsPerChannel === BitsPerChannelType.SIXTEEN;
    if (doc.bitsPerChannel === BitsPerChannelType.THIRTYTWO) {
        alert("Skin Retouching supports 8 bit and 16 bit documents only.");
        return;
    }

    // Blur radius scales with image size: about 1 px per 600 px of the short side.
    var shortSide = Math.min(doc.width.as("px"), doc.height.as("px"));
    var radius = Math.max(2, Math.min(15, Math.round(shortSide / 600)));

    // Frequency separation.
    var low = stampVisible(doc, LOW_NAME);
    var high = low.duplicate();
    high.name = HIGH_NAME;
    low.applyGaussianBlur(radius);
    doc.activeLayer = high;
    applyImageSubtract(LOW_NAME, is16Bit);
    high.blendMode = BlendMode.LINEARLIGHT;

    // Empty healing layer.
    var heal = doc.artLayers.add();
    heal.name = "Spot Healing";

    // Dodge and burn with Curves, masks start black.
    makeCurvesLayer("Dodge (paint white)", 150);
    invertActiveMask();
    makeCurvesLayer("Burn (paint white)", 106);
    invertActiveMask();
    var burn = doc.activeLayer;
    var dodge = doc.layers[1];

    // Group everything, keeping the stacking order.
    var group = doc.layerSets.add();
    group.name = GROUP_NAME;
    group.move(burn, ElementPlacement.PLACEBEFORE);
    var stack = [burn, dodge, heal, high, low];
    stack[0].move(group, ElementPlacement.INSIDE);
    for (var i = 1; i < stack.length; i++) {
        stack[i].move(stack[i - 1], ElementPlacement.PLACEAFTER);
    }

    doc.activeLayer = heal;
}

if (app.documents.length === 0) {
    alert("Open an image first.");
} else {
    var savedUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    try {
        app.activeDocument.suspendHistory("Skin Retouching", "main()");
    } catch (e) {
        alert("Skin Retouching stopped: " + e.message);
    } finally {
        app.preferences.rulerUnits = savedUnits;
    }
}

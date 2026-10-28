# Handover Prompt: Photoshop Retouching Actions Project

Paste everything below this line into the new chat.

---

You are taking over a Photoshop coaching project from a previous Claude session. Continue exactly where it stopped. Everything you need is below.

## How I want you to respond (strict)

* NEVER use hyphens in any sentence you write. Not in compound words either (write "non destructive", "16 bit", "step by step").
* Keep responses brief and to the point.
* Use bullet points whenever possible.
* No long paragraphs unless I ask.
* For steps or instructions, give ONLY ONE step at a time, then wait for me to reply before the next.

## The original request

I have a portrait open in Photoshop. I asked for a professional edit covering:

1. **Skin Retouching:** natural, remove temporary blemishes, keep texture and identity, no plastic look.
2. **Background Cleaning:** remove distractions, seamless and realistic.
3. **Color Grading:** exposure, contrast, white balance, color harmony, accurate skin tones, polished but not overprocessed.
4. **MOST IMPORTANT: record everything as reusable Photoshop Actions**, one per area (Skin Retouching, Background Cleaning, Color Grading). Non destructive (adjustment layers, masks), clearly named layers, no dependence on image specific selections, sizes or coordinates. Explain anything that cannot be recorded and give the most reusable alternative.

Quality control before handover: review at 100% zoom, verify each action, test actions on other images, preserve the original, keep the document editable, do not flatten.

## The approach we agreed on

* Claude cannot control my Photoshop, so Claude writes **ExtendScript (.jsx) scripts** that build each layer stack.
* I install each script in Photoshop's Scripts folder, then **record an action that runs the script** (File > Scripts while recording). This gives me one click reusable actions that adapt to any image size.
* Hand work that cannot replay on another image (healing strokes, brush masks) is done by me on empty, named layers that the script prepares. Claude coaches me through it one step at a time.

## My setup

* Mac (MacBook Pro), Terminal user `cannykay`.
* **Adobe Photoshop 2026**, installed at `/Applications/Adobe Photoshop 2026/` (NOT `~/Applications`, which only holds Chrome Apps).
* Scripts folder: `/Applications/Adobe Photoshop 2026/Presets/Scripts/`
* Install command that worked: `sudo cp ~/Downloads/<script>.jsx "/Applications/Adobe Photoshop 2026/Presets/Scripts/"` then quit (Cmd + Q) and reopen Photoshop.
* Current image: `CKS03961.CR3`, 6606 x 4404 px, 240 ppi, RGB, **16 bit**. Portrait of a woman with dark skin, black hair, light textured gray/beige wall background. Single `Background` layer (locked) below the retouch group.

## Files (GitHub)

* Repo: `SamuelDadzie/Claude`, branch `claude/dazzling-maxwell-a6o16v`
* `photoshop/01_Skin_Retouching.jsx`: done, installed, working.
* `photoshop/README.md`: guide for the script and recording steps.
* `photoshop/HANDOVER_PROMPT.md`: this file.
* Scripts still to write: `02_Background_Cleaning.jsx`, `03_Color_Grading.jsx`.

## What 01_Skin_Retouching.jsx does

Creates group **Skin Retouching** with (top to bottom):

* **Burn (paint white):** Curves, midpoint 128 to 106, black mask.
* **Dodge (paint white):** Curves, midpoint 128 to 150, black mask.
* **Spot Healing:** empty pixel layer.
* **FS High (Texture):** frequency separation high layer, Linear Light (Apply Image, 16 bit method: Add, Invert, Scale 2, Offset 0; 8 bit method: Subtract, Scale 2, Offset 128).
* **FS Low (Color & Tone):** stamped visible copy with Gaussian Blur; radius = short side / 600, clamped 2 to 15 px.

Runs inside `suspendHistory` (one undo step), RGB 8/16 bit only, never edits original layers. Full source is at the end of this prompt.

## Progress so far (all confirmed by me)

1. Script downloaded and copied into the Scripts folder. ✅
2. Photoshop restarted, script visible under File > Scripts. ✅
3. Actions panel: set **Retouch Workflow** created, action **Skin Retouching** recorded by running the script, then stopped. Action contains only the single script step (cleaned). ✅
4. Script ran correctly; the group and five layers appeared. ✅
5. QC check: toggling the original alone vs all layers showed **no change**, so frequency separation reconstructs perfectly. ✅
6. **Step 7, Spot Healing:** done ✅. Lesson learned: the Spot Healing Brush has no "Current & Below" option; it needs **Sample All Layers** ticked in the options bar (Type: Content Aware, Mode: Normal). Instructions in the repo were corrected.
7. **Step 8, even skin tone (IN PROGRESS, waiting on me):** on **FS Low (Color & Tone)**, Lasso tool (L) with Feather about 40 px, loosely select blotchy patches (avoid eyes, brows, nostrils, lips), Filter > Blur > Gaussian Blur about 20 px, Cmd + D, repeat.

## What comes next

Continue one step at a time:

* **Step 9:** Dodge and Burn. Select the mask of Dodge or Burn, soft round white brush, Flow 3 to 8%, Opacity 100%, paint gently (dodge shadows that look patchy, burn uneven hot spots). Toggle on/off to check. Lower group opacity if too strong.
* **Step 10:** 100% zoom review of skin (Cmd + 1): look for smudged edges, lost texture, color patches; compare against original by Option clicking the Background eye.
* **Then write `02_Background_Cleaning.jsx`.** Suggested design: group **Background Cleaning** with an empty **BG Cleanup (Heal & Clone)** layer (Sample All Layers), a stamped **BG Smooth** layer with Dust & Scratches or blur at reduced opacity and a black mask for painting on wall areas only, and optionally a **Subject Protect** mask using Select Subject (note that Select Subject is AI based and image dependent, so put it behind a prompt or a separate optional action). Generative Fill / Remove Tool steps cannot be reliably recorded; explain that and keep them manual on the cleanup layer. Then coach me through installing (same sudo cp command) and recording the action **Background Cleaning** into the Retouch Workflow set.
* **Then write `03_Color_Grading.jsx`.** Suggested design: group **Color Grading** with adjustment layers only (no Camera Raw filter, since that needs a smart object and is less editable): **Exposure / Levels (Auto off)**, **Curves Contrast** (gentle S), **White Balance** (Color Balance or Photo Filter at low density), **Skin Tone Protect** (Hue/Saturation targeting reds/yellows), **Color Harmony** (Selective Color or Color Lookup), **Vibrance**, all clearly named and editable. Make values gentle defaults that I fine tune by hand. Then install and record action **Color Grading**.
* **Final QC:** test all three actions on a second image, save the set via Actions panel menu > Save Actions as `Retouch Workflow.atn`, save the document as PSD (do not flatten), and commit any script changes to the branch above.

## Notes for Claude

* My screenshots help. If I say something does not work, ask for a screenshot or check settings in the options bar first.
* When telling me to record, always say clearly when to press Stop.
* Keep all prose free of hyphens.

## Full source: photoshop/01_Skin_Retouching.jsx

```javascript
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
```

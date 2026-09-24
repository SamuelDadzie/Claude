# Photoshop Retouching Actions

Three scripts that build an editable, non destructive retouching workflow. Record each one into an action so you can replay it on any image.

## 1. Skin Retouching (`01_Skin_Retouching.jsx`)

**What it builds** inside the group `Skin Retouching`:

| Layer | Purpose | What you do by hand |
|---|---|---|
| FS Low (Color & Tone) | Blurred color layer (frequency separation) | Even out blotches with Mixer Brush, or Lasso + Gaussian Blur |
| FS High (Texture) | Pore detail in Linear Light | Usually nothing; Clone Stamp (Current Layer) for stray hairs |
| Spot Healing | Empty layer | Spot Healing Brush, Sample: Current & Below |
| Dodge (paint white) | Curves brighten, black mask | Soft white brush, 3 to 8% flow, on shadows to lift |
| Burn (paint white) | Curves darken, black mask | Soft white brush, 3 to 8% flow, on highlights to calm |

**Notes**
* The blur radius scales with image size, so no fixed pixel values.
* Your original layers are never touched.
* Lower the group opacity to dial the whole retouch back.
* Works on 8 bit and 16 bit RGB files.

**Why the hand steps stay manual**
Brush strokes on blemishes are tied to one face and cannot replay correctly on another image. The script prepares the layers so those steps take seconds.

## Recording the action

1. Copy the `.jsx` into Photoshop's `Presets/Scripts` folder and restart Photoshop, so it appears under File > Scripts.
2. Actions panel: New Set `Retouch Workflow`, New Action `Skin Retouching`, click Record.
3. File > Scripts > 01_Skin_Retouching.
4. Click Stop.
5. Optional: add a Stop step with a message ("Heal blemishes on Spot Healing") via the panel menu > Insert Stop.
6. Save the set (panel menu > Save Actions) as a `.atn` file for backup.

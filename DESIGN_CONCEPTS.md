# Haishoku / Three design directions

All three directions preserve the same one-page tool: bring in an image, select one of the existing palettes, adjust conversion intensity and color matching, compare before and after, reset, and export a PNG. Only **01 / Kinetic Editorial** is implemented.

## 01 / Kinetic Editorial — selected and built

**Idea and high-fidelity direction.** Treat image recoloring as an editorial act. Acid citron, warm paper, and near-black establish three clear acts: invitation, working studio, and color specimen. The sample still life demonstrates the tool immediately. The image itself is the dominant visual, framed by tiny production metadata and expressive headlines.

**Typography.** Heavy, closely spaced Manrope display type carries the commands. A contrasting italic serif interrupts it at pivotal words; DM Sans handles operating text and DM Mono handles measurements, indexes, file information, and hex values.

**Grid and desktop layout.** The hero uses asymmetric, oversized type. The studio becomes a two-column workbench: a large before/after image at left and a narrower control rail at right. The palette becomes a full-width, edge-to-edge color specimen. The closing explanation shifts to a quiet two-column essay and numbered steps.

**Motion and signature interaction.** The opening title reveals in separately timed pieces; the mark arrives afterward. On scroll, the title drifts at a different pace from the page. Buttons swap their words through a masked vertical movement. Palette rows nudge into selection; swatches lift as they are inspected. The main image supports a direct, draggable before/after split, mirrored by a keyboard-accessible slider.

**Creative coding and functionality.** Canvas performs real palette remapping and keeps the original pixels intact for resetting and comparison. RGB and OKLab are distinct matching modes. Work is split across animation frames, palette lookups are cached, and an obsolete conversion is cancelled when the source or settings change.

**States and mobile.** A bundled sample image makes first load useful; a file error explains how to recover. Conversion reports progress and disables conflicting actions; export unlocks after a finished result. Upload also accepts a file dropped on the image. On mobile the workbench becomes a single readable column, navigation compresses, swatches reflow, and image comparison still works by touch or slider. Reduced-motion users get the composition without movement. The closing treatment points back to the studio.

**Memorable quality.** Typography and color do the visual work, while the central comparison makes the transformation itself the spectacle. The palette is both a beautiful graphic field and a copyable output.

**Implementation.** React and TypeScript, CSS grid and masks, a local SVG sample, Canvas image processing, and native pointer and range controls. No GPU scene or heavy runtime is required.

## 02 / Digital Object — proposed direction

**Idea and high-fidelity direction.** Present the image as a calibrated print held inside a thin physical light table. Palette selection changes the material around the print: warm enamel for Gruvbox, cool anodized metal for Mocha, pale ceramic for Latte. Every layer of depth belongs to the actual tool: source image, transformed image, calibration plane, and controls.

**Typography.** A restrained grotesk with large numeric labels, small optical-size annotations, and spare tabular data. Color names appear as engraved plate titles rather than promotional headlines.

**Grid and desktop layout.** The first viewport introduces the light table at three-quarter angle while making upload visible. Scrolling rotates it into a flat working position. The central print dominates the application area; controls form one vertical rail connected to the slab by hairline rules. Results appear as an image layer sliding above the source. The palette sits in a long horizontal tray beneath, followed by concise process notes and a final full-bleed exported-image view.

**Motion and signature interaction.** Moving the comparison slider physically advances the transformed print over the original. Changing palette slides a new color tray under the print. Hover changes only the light's angle and edge highlight. Conversion briefly lifts the result plane while it is processed, then settles precisely into place.

**Creative coding and functionality.** One small React Three Fiber scene renders the print planes and lighting. A Canvas texture holds the actual source and output; DOM controls stay above the scene for accessibility and immediate response. The image texture is updated only when conversion completes. Reset returns the source plane; download uses the same output Canvas.

**States and mobile.** The empty state is an unoccupied print frame with a prominent file target. Loading shows a measured scanning line on the frame, and failures return a plain language recovery action. Mobile switches to a flat two-dimensional composition with shallow CSS perspective and standard controls below the image. Reduced motion uses the same flat view. Footer treatment shows the image leaving the light table as an export.

**Memorable quality.** Depth explains which image is source, which is result, and which controls affect it. The visual world is a physical expression of the conversion task.

**Implementation.** React Three Fiber and Three.js for one bounded scene; CanvasTexture for both image planes; CSS and DOM for navigation and forms. Cap device pixel ratio, pause rendering when idle, and fall back to CSS if WebGL is absent.

## 03 / Generative Color Field — proposed direction

**Idea and high-fidelity direction.** Make the palette visible as a living color field computed from the image. Each chosen palette seeds a system of flowing bands that resolves into the image's dominant color regions. This field is a second reading of the same source, rather than decoration behind the interface.

**Typography.** Clean, almost scientific DOM typography: compact mono labels, very large neutral sans headings, and generous spacing. The generative color provides character while controls stay stark and legible.

**Grid and desktop layout.** The first viewport places a sampled field next to the title and upload target. The studio gives the image most of the width, with a slim parameter column. Results add a paired field visualization beside the before/after image. Palette colors become nodes in a wide linear map; supporting information explains how color regions are matched. The ending shows a final field generated from the chosen palette and the transformed image.

**Motion and signature interaction.** Hovering a palette option bends the field toward that palette before selection. Intensity changes its degree of organization. The RGB/OKLab control changes the distance metric and visibly rearranges boundaries. During conversion, the field converges from noisy source samples into the selected colors. The result image remains fully readable and never receives a permanent distortion.

**Creative coding and functionality.** An offscreen Canvas downsamples the uploaded image to a modest sample grid. A fragment shader or 2D Canvas field uses those samples and the current palette to drive advection and color regions. Its inputs are exactly the product state: image, palette, intensity, and matching mode. Image conversion and PNG export remain separate deterministic Canvas operations.

**States and mobile.** Without an image, the field is seeded from a bundled sample and invites upload. Loading draws only a limited number of frames while progress is visible. Errors preserve the last good visual state and expose recovery. Mobile renders a lower-resolution field above a single-column tool; reduced motion freezes it on a meaningful representative frame. The final field remains attached to the exported result rather than turning into an unrelated animated footer.

**Memorable quality.** Haishoku appears to have its own visual instrument: the graphics change for the same reasons the actual image changes.

**Implementation.** React and TypeScript with a single Canvas or WebGL layer, adaptive resolution, requestAnimationFrame only when state changes, and a static Canvas fallback. DOM controls retain keyboard focus, contrast, and screen-reader meaning.

## Why 01 fits this project best

Haishoku's strongest asset is the user's image and its recolored result. The editorial system gives that comparison visual primacy and makes every existing control obvious. It also delivers a distinctive first impression with a small runtime cost, straightforward mobile behavior, and no graphics dependency between the interface and the converter.

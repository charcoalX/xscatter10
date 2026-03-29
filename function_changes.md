# Function Changes: xscatter10 vs xscatter10_dbscan_validation

Comparison between the current app (`xscatter10`) and the earlier validation build (`xscatter10_dbscan_validation`). Changes are described from the perspective of **what was added or modified in xscatter10 relative to the baseline**.

---

## 1. 6-Layer Scatterplot Comparison Mode

**Baseline:** Only 3-layer comparison (ACT / FEA / PRD side-by-side), triggered by a simple toggle button.

**Current:**
- The **Layer Compare** button opens a dropdown menu with three choices: **1 Layer**, **3 Layers**, **6 Layers**.
- **6-Layers mode** renders six scatter plots side-by-side: ACT / s1 / s3 / s5 / FEA / PRD. Each panel maps a different stage of the ResNet-50 pipeline:
  - `s1` → ReLU block 1 activations (t-SNE coordinates `xLayer1`, `yLayer1`)
  - `s3` → ReLU block 3 activations (`xLayer3`, `yLayer3`)
  - `s5` → ReLU block 5 activations (`xLayer5`, `yLayer5`)
- Three additional HTML containers (`#layer2-container`, `#layer3-container`, `#layer4-container`) are introduced and sized to `16.6%` width each in 6-layer mode.
- `main.compareMode` tracks the current state: `'none' | '3layers' | '6layers'`.

**Files changed:** `templates/index.html`, `static/js/index.js`, `static/js/dom/dom-events.js`, `static/js/dom/dom-elements.js`, `static/js/vis/scatterplot.js`

---

## 2. Layer Options in Single-Panel Plot Dropdown

**Baseline:** The plot-type dropdown contained only ACT, FEA, PRD.

**Current:** Three new options added between ACT and FEA:
- **Layer s1** — renders scatter using `xLayer1 / yLayer1`
- **Layer s3** — renders scatter using `xLayer3 / yLayer3`
- **Layer s5** — renders scatter using `xLayer5 / yLayer5`

The `switch` statement in `main.visualize()` handles these three new cases and updates the panel title accordingly.

**Files changed:** `templates/index.html`, `static/js/index.js`, `static/js/vis/scatterplot.js`

---

## 3. Simultaneous Cross-Panel Hover and Click Animations

**Baseline:** Hover scaled the circle radius inline within the single panel. Click ran a staggered animation across panels (each panel delayed by `j * 120 ms`).

**Current:**
- **Hover:** `vis.hoverInteraction(id)` iterates all six panel types (`act`, `layer1`, `layer3`, `layer5`, `fea`, `prd`) and applies an **animated pulse ring** simultaneously — radius animates `0 → 11 → 7`, stroke-opacity `0 → 1 → 0.8`, with a red stroke and no fill. All panels animate at the same time (no delay).
- **Hover out:** `vis.hoverOutInteraction(id)` removes the pulse ring in all six panels at once.
- **Click:** `vis.selectInteraction([imageID])` passes only the newly clicked ID (not the full `main.selectImageIds` array) so only the newly selected dot animates; previously selected dots are not re-animated. Radius animates `0 → 9 → 5`, stroke-opacity `0 → 1`. No stagger delay.

**Files changed:** `static/js/vis/interaction.js`, `static/js/vis/scatterplot.js`

---

## 4. Mouse Event Fix: mouseenter/mouseleave

**Baseline:** Dot hover used `mouseover` / `mouseout`. When a child element (hover ring circle) was appended inside the dot group, the `mouseout` event fired as the cursor moved onto the child, causing the preview image to flicker.

**Current:** Changed to `mouseenter` / `mouseleave` in `vis.addDotZoom`. These events do not bubble from child elements, eliminating the flicker.

**Files changed:** `static/js/vis/scatterplot.js`

---

## 5. Selected-Label Collision Avoidance

**Baseline:** No label repositioning — numeric ID labels on selected dots overlapped freely in dense areas.

**Current:** `vis.repositionLabels(type)` is called after each render via `setTimeout(fn, 0)` (deferred so SVG layout is complete before `getBBox()` is called):
1. Collects all `.scatterselectedtext-{type}` elements.
2. Extracts pixel coordinates from each element's parent `<g>` transform.
3. Calls `getBBox()` on each label to get rendered dimensions.
4. Runs up to **20 passes** of greedy vertical push: if two labels overlap (with 2 px horizontal tolerance), the lower one is shifted downward.
5. Applies the cumulative shift as `transform="translate(0, shiftY)"` on the text element.

**Files changed:** `static/js/vis/scatterplot.js`

---

## 6. Server-Side Feature File Loading

**Baseline:** A **Load Feature Names** file-upload button let the user select a `.txt` file from disk. The file was read client-side with the `FileReader` API.

**Current:**
- The Flask index route (`GET /`) reads all `.txt` files from `resources/data/` at startup and injects them as a JSON object (`featureFiles`) directly into the HTML template.
- The navbar shows a **Feature Names dropdown** (`<select id="feature-file-select">`) populated from the pre-loaded object.
- On change or at startup (`dom.loadFeatureFile`), the selected file's content is parsed into attribute labels without any file I/O on the client side.
- Auto-loads `17tags_meta.txt` on page load.

**Files changed:** `main.py`, `templates/index.html`, `static/js/dom/dom-events.js`, `static/js/dom/dom-elements.js`

---

## 7. Group Selection Toggle

**Baseline:** No group selection toggle. The visualization panels were always visible or hidden together with the compare mode.

**Current:** A **Group Selection** button (`#group-selection-toggle-btn`) on the left edge of the scatterplot panel independently toggles the visibility of the vis panels (Panel 1 + Panel 2). When hidden, the scatterplot expands to fill the freed horizontal space. Layout widths account for all three open/closed states: filter panel, vis panel, and compare mode.

**Files changed:** `templates/index.html`, `static/css/style.css`, `static/js/dom/dom-events.js`, `static/js/dom/dom-elements.js`

---

## 8. Clear All Buttons

**Baseline:** No clear buttons existed.

**Current:** Two **✕** clear buttons added:

- **Drag/Drop Selections title bar** (`#clear-selections-btn`): Resets `vis.selectedDots`, `vis.selectionCount`, removes all `.scatterdot-selected` SVG elements, empties the selection list, and re-renders the scatterplot.
- **Detailed Images title bar** (`#clear-images-btn`): Resets `main.selectImageIds`, removes hover/selected SVG rings, empties the image strip.

Both buttons share CSS styling: transparent background, `#525252` color, turns red (`#cc0000`) on hover.

`.container-title` received `position: relative` to allow the absolutely-positioned buttons to anchor to the title bar correctly.

**Files changed:** `templates/index.html`, `static/css/style.css`, `static/js/dom/dom-events.js`

---

## 9. Hierarchical Clustering for Attribute Matrix

**Baseline:** Matrix rows and columns were always displayed in fixed (original database index) order.

**Current:** A **Cluster** button (`#matrix-cluster-btn`) next to the metric dropdown toggles hierarchical reordering:

- `vis.clusterAttributes(mutualInfo, N)` implements **agglomerative average-linkage clustering** in pure JavaScript:
  1. Builds an N×N distance matrix: `D[i][j] = 1 − |value(i,j)|`.
  2. Iteratively merges the two closest clusters; updates inter-cluster distances by weighted average (UPGMA).
  3. Returns the leaf traversal order of the final dendrogram.
- The resulting `order` array is used in both `drawMatrix` (conditional entropy) and `drawMatrixMerged` (MI / correlation) to map original attribute indices to visual positions.
- **Triangle preservation**: After clustering, the four visibility conditions for the composite upper/lower triangle are evaluated on visual positions (`pos_mm[i] > pos_mm[j]`) rather than original indices, so green (true-label) cells remain in the upper triangle and blue (prediction) cells remain in the lower triangle regardless of reordering.
- `vis.matrixClustered` flag toggles between clustered and original order. Clicking **Cluster** again restores original order.
- **Side effect fix**: The previous code sorted axis labels alphabetically (`main.embedding.labels.sort()`), which caused a mismatch between label text and cell data. Both draw functions now build labels from `order.map(i => labels[i])`, fixing the alignment for both clustered and unclustered modes.

**Files changed:** `static/js/vis/matrix.js`, `templates/index.html`, `static/js/dom/dom-events.js`, `static/css/style.css`

---

## 10. Metric Dropdown + Cluster Button Layout

**Baseline:** `#attribute-matrix-option` was positioned absolutely at `top: 5px; left: 5px` with a fixed pixel width.

**Current:** Both the metric dropdown and Cluster button are wrapped in `#matrix-option-row`, a flex row container (`display: flex; align-items: center; gap: 4px`) positioned at `top: 41%; left: 5px`. The dropdown width is `auto` (shrinks to fit the longest option text). The button has a bordered style matching the other matrix control buttons, with an inverted `.selected` state (dark background, light text) when clustering is active.

**Files changed:** `templates/index.html`, `static/css/style.css`

---

## 11. Database Configuration

**Baseline:** Connected to PostgreSQL on the standard port **5432**, querying tables with the suffix `_1000_goodiui` or `_1000`.

**Current:** Connects on port **5434**. A `dataSize = 500` variable controls the table suffix (`_500`). The mutual info and t-SNE queries use `_1000` tables for higher statistical resolution regardless of `dataSize`.

**Files changed:** `config.json`, `query.py`

---

## 12. Background Opacity Slider

**Baseline:** A **Hide Background** button toggled background scatter circles on or off by removing all `.scattercircle-*` elements from the DOM (and calling `main.visualize()` to restore them).

**Current:**
- The button is replaced by a **range slider** (`<input type="range" min="0" max="1" step="0.05">`) with a "Background" label, positioned in the same location (top-left of the scatterplot panel).
- Dragging the slider calls `vis.setBackgroundOpacity(opacity)`, which sets the SVG `opacity` attribute on all six `.scattercircle-*` classes simultaneously in real time — no DOM removal or full re-render required.
- The opacity value is stored in `vis.backgroundOpacity` and applied to newly rendered circles so the setting persists across re-renders (e.g. after changing embedding method or data type).
- Uses the `opacity` SVG attribute (not `fill-opacity`) so it composes independently with the existing error-distance `fill-opacity` encoding.

**Files changed:** `templates/index.html`, `static/css/scatterplot.css`, `static/js/dom/dom-elements.js`, `static/js/dom/dom-events.js`, `static/js/index.js`, `static/js/vis/scatterplot.js`

---

## Summary Table

| # | Feature | Baseline | Current |
|---|---|---|---|
| 1 | Layer compare modes | 3-layer only | 1 / 3 / 6 layers |
| 2 | Plot dropdown layers | ACT, FEA, PRD | + Layer s1, s3, s5 |
| 3 | Cross-panel animation | Staggered delay | Simultaneous, all 6 panels |
| 4 | Hover mouse events | mouseover/mouseout (flicker) | mouseenter/mouseleave |
| 5 | Label collision | None | 20-pass greedy push |
| 6 | Feature file loading | Client-side FileReader | Server-side injection + dropdown |
| 7 | Group Selection toggle | Absent | Independent vis-panel toggle |
| 8 | Clear All buttons | Absent | Added to Selections and Images |
| 9 | Matrix row/col order | Fixed | Optional hierarchical clustering |
| 10 | Matrix controls layout | Absolute-positioned dropdown | Flex row with auto-width |
| 11 | DB port / table size | 5432, `_1000_goodiui` | 5434, `_500` |
| 12 | Background visibility | Binary hide/show button | Continuous opacity slider (0–1) |
